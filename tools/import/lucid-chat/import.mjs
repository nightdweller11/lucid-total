#!/usr/bin/env node
/**
 * Lucid Chat → Lucid Total importer (docs/10-migration-and-operating-model.md).
 *
 *   node tools/import/lucid-chat/import.mjs --source /Users/yossinaar/Projects/lucid/lucid --out data/import/lucid-chat
 *
 * Reads the Lucid Chat repository (never writes to it, never runs git there) and writes:
 *   items.json  relations.json  decisions.json  evidence.json  groupings.json  people-and-agents.json
 *   evaluation.json  report.md
 * Output is deterministic for a given source (no wall-clock time in the data), so re-runs diff cleanly and
 * the Lucid Total side can upsert by id.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { createSanitizer } from './lib/sanitize.mjs';
import { parseChecklist, buildItem } from './lib/checklist.mjs';
import { extractIds, idFamily } from './lib/ids.mjs';
import { findOrigin, findParent, findCycles, isFollowUpId } from './lib/relations.mjs';
import { parseDecisionLog, decisionItems, adrItem, ownerAnswers } from './lib/decisions.mjs';
import { indexBriefs, indexReports, parseAccounts } from './lib/sources.mjs';
import { gradeEvidence, walkthroughCheck, parseBlocker, contradiction, boardBars, waveReportKey } from './lib/evaluate.mjs';
import { waveLabel, extractEvidence } from './lib/evidence.mjs';
import { renderReport } from './lib/report.mjs';
import { parseWorkstreamTable } from './lib/people.mjs';

/** Importer version and date, stated in meta and at the top of report.md (no wall clock: output stays deterministic). */
export const IMPORTER_VERSION = '1.1.0';
export const IMPORTER_DATE = '2026-10-28';

const sha = (s) => createHash('sha256').update(s).digest('hex');
const evId = (...parts) => `EV-${createHash('sha1').update(parts.join('\u0000')).digest('hex').slice(0, 12)}`;

/** Parse CLI arguments. */
export function parseArgs(argv) {
  const args = { source: null, out: 'data/import/lucid-chat' };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--source') args.source = argv[++i];
    else if (argv[i] === '--out') args.out = argv[++i];
  }
  if (!args.source) throw new Error('usage: import.mjs --source <lucid chat repo> [--out <dir>]');
  return args;
}

/**
 * Run the whole import in memory and return every output document.
 * @param {string} source absolute path of the Lucid Chat repository
 */
export function runImport(source) {
  const san = createSanitizer();
  const hashes = {};
  const read = (rel) => {
    const raw = readFileSync(join(source, rel), 'utf8');
    hashes[rel] = sha(raw).slice(0, 16);
    return san.clean(raw);
  };
  const readJson = (rel) => (existsSync(join(source, rel)) ? JSON.parse(read(rel)) : null);

  // 1. Checklist rows and their ids (duplicates get a "~2" suffix and keep the original as an alias).
  const raws = parseChecklist(read('docs/15-checklist.md')).filter((r) => r.id && r.id !== '—' && r.id !== '-');
  const skippedPlaceholders = parseChecklist(read('docs/15-checklist.md')).length - raws.length;
  const seenIds = new Map();
  const duplicates = [];
  for (const r of raws) {
    const n = (seenIds.get(r.id) ?? 0) + 1;
    seenIds.set(r.id, n);
    if (n > 1) {
      duplicates.push({ id: r.id, line: r.line });
      r.duplicateOf = r.id;
      r.id = `${r.id}~${n}`;
    }
  }
  const checklistIds = new Set(raws.map((r) => r.id));
  const families = new Set([...checklistIds].map(idFamily));
  families.add('ADR');

  // 2. Decision log, ADRs, accounts: their ids join the id space before any relation is resolved.
  const log = parseDecisionLog(read('docs/09-decision-log.md'));
  const adrFiles = readdirSync(join(source, 'docs/decisions')).filter((f) => /^\d{4}-.*\.md$/.test(f)).sort();
  const decisionIds = new Set([
    ...log.entries.map((e) => e.id),
    ...adrFiles.map((f) => `ADR-${f.slice(0, 4)}`),
  ]);
  const acc = parseAccounts(read('docs/07a-accounts-to-open.md'), (id) => checklistIds.has(id));
  const known = new Set([...checklistIds, ...decisionIds, ...acc.items.map((i) => i.id)]);
  const exists = (id) => known.has(id);
  // A token that does not exist is reported as an unresolved dependency only when it has a checklist id's
  // family (P1-…, ENV-…, MOCKS-…, L…); words like LT-01 or UTF-8 are not dependencies.
  const idLike = (id) => families.has(idFamily(id));

  // 3. Items.
  const items = raws.map((r) => {
    const it = buildItem(r, { root: source, exists, idLike, in07a: acc.mentioned });
    if (r.duplicateOf) {
      it.duplicate_of = r.duplicateOf;
      it.aliases = [r.duplicateOf];
    }
    return it;
  });
  const byId = new Map(items.map((i) => [i.id, i]));

  const decisions = [
    ...decisionItems(log, { exists }),
    ...adrFiles.map((f) => adrItem(read(`docs/decisions/${f}`), `docs/decisions/${f}`, { exists })),
  ];
  for (const d of decisions) known.add(d.id);
  const decisionById = new Map(decisions.map((d) => [d.id, d]));
  const openDecisions = new Map(decisions.filter((d) => d.decision_kind === 'open decision' && d.state === 'open').map((d) => [d.aliases[0], d]));

  const answersDoc = ownerAnswers(
    readJson('docs/status/decisions-catalogue.json'),
    readJson('docs/status/decisions-answers.json'),
    readJson('docs/status/decisions.json'),
  );
  for (const a of answersDoc.answers) {
    const d = decisionById.get(a.decision);
    if (d) (d.owner_answers ??= []).push(a.id);
  }
  for (const c of answersDoc.cards) {
    const d = decisionById.get(c.decision);
    if (d) d.owner_card = c.id;
  }

  // 4. Relations.
  const relations = [];
  const rel = (from, type, to, rule, note) => relations.push({ from, type, to, rule, ...(note ? { note } : {}) });
  const listedBy = new Map();
  for (const it of items) for (const fu of it.follow_up_ids) if (fu !== it.id && !listedBy.has(fu)) listedBy.set(fu, it.id);

  const origins = { byRule: {}, orphans: [], prefixDisagree: [] };
  for (const it of items) {
    for (const d of it.depends_on) rel(it.id, 'depends_on', d, 'depends-column');
    // The verdict names what the row waits on: "todo — blocked on X", "partial — follow-up X", "after X".
    const waits = [];
    const vm = /(?:blocked on|waits? on|waiting on|follow-up|after|until)\s+`?([A-Z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+)/g;
    for (const m of (it.state_verdict ?? '').matchAll(vm)) {
      if (it.state !== 'done' && exists(m[1]) && m[1] !== it.id && !waits.includes(m[1])) waits.push(m[1]);
    }
    it.waits_on = waits;
    for (const w of waits) rel(it.id, 'depends_on', w, 'status-verdict');

    if (!it.top_level || isFollowUpId(it.id)) {
      const o = findOrigin(it, exists, listedBy, extractIds);
      it.spawned_by = o.origin;
      it.spawned_rule = o.rule;
      origins.byRule[o.rule ?? 'none'] = (origins.byRule[o.rule ?? 'none'] ?? 0) + 1;
      if (o.origin) {
        rel(it.id, 'spawned_by', o.origin, o.rule);
        if (o.prefixOrigin && o.prefixOrigin !== o.origin) origins.prefixDisagree.push({ id: it.id, origin: o.origin, by_prefix: o.prefixOrigin });
        for (const extra of extractIds(it.origin_text ?? '').filter((x) => exists(x) && x !== o.origin && x !== it.id))
          rel(it.id, 'relates', extra, 'origin-column-secondary');
      } else {
        // Lead decision T23: orphans stay linked to their wave groupings only; the flag lets the review wave
        // (LT-0005) filter them, and the AI proposes attachments there.
        it.origin_unresolved = true;
        origins.orphans.push({ id: it.id, origin_text: it.origin_text, origin_text_kind: o.originTextKind, line: it.source.line });
      }
    }
    const parent = findParent(it.id, exists);
    if (parent) {
      it.parent = parent;
      rel(parent, 'parent_of', it.id, 'id-structure');
    }
    for (const e of it.evidence) if (e.type === 'decision' && exists(e.value)) rel(it.id, 'relates', e.value, 'cites-decision');
  }
  for (const d of decisions) for (const r of d.references) if (byId.has(r)) rel(d.id, 'relates', r, 'decision-reference');
  for (const a of acc.items) for (const r of a.references) rel(a.id, 'relates', r, '07a-reference');
  for (const a of answersDoc.answers) if (decisionById.has(a.decision)) rel(a.decision, 'answered_by', a.id, 'decisions-answers.json');

  // 5. Phase of follow-up rows: from the id family, else from the origin chain.
  for (const it of items) {
    if (it.phase) continue;
    const fam = /^(CT|P[0-4])-/.exec(it.id)?.[1] ?? (/^INT-(\d)/.exec(it.id) ? `P${/^INT-(\d)/.exec(it.id)[1]}` : null);
    let phase = fam;
    let cur = it;
    for (let hops = 0; !phase && cur?.spawned_by && hops < 20; hops += 1) {
      const next = byId.get(cur.spawned_by);
      if (!next) break;
      phase = next.top_level ? next.phase : /^(CT|P[0-4])-/.exec(next.id)?.[1] ?? null;
      cur = next;
    }
    it.phase = phase;
    it.phase_inferred = true;
  }

  // 6. Briefs and reports → evidence; waves → groupings.
  const briefs = indexBriefs(source, read, exists);
  const reports = indexReports(source, read, exists);
  const reportsById = new Map();
  for (const r of reports) for (const id of r.covers) (reportsById.get(id) ?? reportsById.set(id, []).get(id)).push(r);
  const waveReports = new Map();
  for (const r of reports.filter((x) => x.type === 'walkthrough')) {
    const k = waveReportKey(r.stem);
    if (k) (waveReports.get(k) ?? waveReports.set(k, []).get(k)).push(r.path);
  }
  const briefByWave = new Map(briefs.map((b) => [b.wave, b]));
  const evidence = [];
  const addEv = (item, e, source) => evidence.push({ id: evId(item, e.type, e.value, e.field ?? ''), item, ...e, source });
  for (const it of items) for (const e of it.evidence) addEv(it.id, e, `checklist ${it.source.file}:${it.source.line}`);
  for (const b of briefs) {
    for (const id of b.scope) {
      const it = byId.get(id);
      const e = { type: 'brief', value: b.path, exists: true, wave: b.wave, goal: b.goal, match: 'scope' };
      if (it) it.evidence.push(e);
      addEv(id, e, b.path);
    }
  }
  for (const it of items) {
    const waves = [...new Set(it.evidence.filter((e) => e.type === 'wave').map((e) => e.value))];
    for (const w of waves) {
      const b = briefByWave.get(w);
      if (b && !b.scope.includes(it.id)) {
        const e = { type: 'brief', value: b.path, exists: true, wave: w, goal: b.goal, match: 'wave named in status' };
        it.evidence.push(e);
        addEv(it.id, e, b.path);
      }
    }
  }
  for (const r of reports) {
    for (const id of r.covers) {
      const it = byId.get(id);
      const e = { type: r.type, value: r.path, exists: true, match: 'report names the row', title: r.title };
      if (it && !it.evidence.some((x) => x.value === r.path)) it.evidence.push(e);
      if (it || decisionById.has(id)) addEv(id, e, r.path);
    }
  }

  // 7. Groupings.
  const groupings = new Map();
  const group = (id, kind, title, extra = {}) => {
    if (!groupings.has(id)) groupings.set(id, { id, kind, title, members: [], ...extra });
    return groupings.get(id);
  };
  const PHASE_TITLES = { CT: 'Contracts sprint', P0: 'Phase 0 · Foundations', P1: 'Phase 1 · Alpha', P2: 'Phase 2 · Private beta', P3: 'Phase 3 · Public launch', P4: 'Phase 4 · Scale' };
  for (const it of items) {
    const gs = [];
    const ph = it.phase ?? 'unphased';
    gs.push(`phase:${ph}`);
    group(`phase:${ph}`, 'phase', PHASE_TITLES[ph] ?? 'Unphased follow-ups').members.push(it.id);
    gs.push(it.top_level ? 'section:top-level' : 'section:follow-up');
    group(gs.at(-1), 'collection', it.top_level ? 'Top-level checklist rows' : 'Follow-up rows').members.push(it.id);
    for (const w of it.workstreams) {
      const gid = `workstream:${w}`;
      gs.push(gid);
      group(gid, 'domain', w === 'lead' ? 'Lead (integration and gates)' : w === 'owner' ? 'Owner actions' : `Workstream ${w}`).members.push(it.id);
    }
    const waves = new Set(it.evidence.filter((e) => e.type === 'wave' || (e.type === 'brief' && e.match === 'scope')).map((e) => e.type === 'wave' ? e.value : e.wave));
    // An orphan's Origin text often names its wave ("wave 4 C report"): that wave is its link.
    if (it.origin_unresolved) for (const e of extractEvidence(it.origin_text ?? '')) if (e.type === 'wave') waves.add(e.value);
    for (const w of waves) {
      const gid = `wave:${w}`;
      gs.push(gid);
      group(gid, 'wave', waveLabel(w), { brief: briefByWave.get(w)?.path ?? null }).members.push(it.id);
    }
    it.groupings = gs;
  }
  for (const b of briefs) group(`wave:${b.wave}`, 'wave', waveLabel(b.wave), { brief: b.path, date: b.date, model: b.model });
  for (const g of groupings.values()) {
    g.members = [...new Set(g.members)];
    const states = {};
    for (const m of g.members) {
      const s = byId.get(m)?.state ?? 'unknown';
      states[s] = (states[s] ?? 0) + 1;
    }
    g.rollup = states;
    g.done_share = g.members.length ? Math.round(((states.done ?? 0) / g.members.length) * 1000) / 10 : null;
  }

  // 8. Cycles in depends_on (declared column only, then with the status-verdict waits included).
  const graphOf = (rules) => {
    const g = new Map();
    for (const r of relations) if (r.type === 'depends_on' && rules.includes(r.rule)) (g.get(r.from) ?? g.set(r.from, []).get(r.from)).push(r.to);
    return g;
  };
  const cycles = {
    declared: findCycles(graphOf(['depends-column'])),
    with_status: findCycles(graphOf(['depends-column', 'status-verdict'])),
    spawned_by: findCycles(new Map(items.filter((i) => i.spawned_by).map((i) => [i.id, [i.spawned_by]]))),
  };

  // 9. Evaluation.
  const evaluation = [];
  for (const it of items) {
    const rec = { id: it.id, state: it.state, top_level: it.top_level, phase: it.phase, workstream: it.workstream };
    if (it.state === 'done') {
      const g = gradeEvidence(it, reportsById);
      Object.assign(rec, { grade: g.grade, grade2_source: g.grade2_source, basis: g.basis, missing_paths: g.missing_paths, lifted_by_artefact: g.lifted_by_artefact });
      it.evidence_grade = g.grade;
      if (g.grade2_source) it.grade2_source = g.grade2_source;
      if (it.walkthrough_required) {
        const w = walkthroughCheck(it, reportsById, waveReports);
        rec.walkthrough = w;
        it.walkthrough_check = w.status;
      }
      const reasons = [];
      if (g.grade <= 1 && it.resolution !== 'closed') reasons.push(`evidence grade ${g.grade}`);
      if (it.walkthrough_required && ['none', 'cited-missing'].includes(rec.walkthrough?.status)) reasons.push(`walkthrough required, ${rec.walkthrough.status === 'none' ? 'no report found' : 'cited report missing'}`);
      if (reasons.length) {
        rec.to_verify = reasons;
        it.to_verify = reasons;
      }
    }
    if (it.state !== 'done') {
      const b = parseBlocker(it, { exists, get: (id) => byId.get(id), openDecisions });
      if (b) {
        rec.blocker = b;
        it.blocker = b;
        if (/^stale/.test(b.subtype ?? '')) {
          rec.to_verify = [`blocker is stale (${b.subtype.replace(/^stale: /, '')})`];
          it.to_verify = rec.to_verify;
        }
      }
    }
    const c = contradiction(it);
    if (c) {
      rec.contradiction = c;
      it.status_contradiction = c;
    }
    if (it.origin_unresolved) rec.origin_unresolved = true;
    rec.has_evidence_link = it.evidence.some((e) => ['link', 'commit', 'pr', 'walkthrough', 'report', 'code', 'doc'].includes(e.type) && e.match !== 'report names the row');
    evaluation.push(rec);
  }

  const unresolvedDeps = [];
  for (const it of items) for (const u of it.depends_unresolved) unresolvedDeps.push({ id: it.id, depends: u });

  // 10. People and agents.
  const wsTable = parseWorkstreamTable(read('docs/13-implementation-plan.md'));
  const modelCounts = {};
  for (const b of briefs) {
    const ws = /-(E1|E2|[A-H]|WEB)$/.exec(b.wave)?.[1] ?? 'other';
    const model = b.model?.split(' ')[0] ?? 'unstated';
    modelCounts[ws] ??= {};
    modelCounts[ws][model] = (modelCounts[ws][model] ?? 0) + 1;
  }
  const rowsByWs = {};
  for (const it of items) for (const w of it.workstreams) rowsByWs[w] = (rowsByWs[w] ?? 0) + 1;
  const people = {
    people: [
      { id: 'owner', kind: 'person', name: 'Yossi', role: 'founder and product owner', decision_rights: ['strategy', 'material decisions', 'gates', 'spend above threshold', 'legal commitments'], inbox: 'the decisions page of the status site (docs/status/decisions-*.json) until cutover', rows_assigned: rowsByWs.owner ?? 0 },
      { id: 'counsel', kind: 'external', name: 'Counsel and DPO', role: 'privacy and technology counsel (not engaged as a person in the model yet)', rows_assigned: rowsByWs.counsel ?? 0 },
    ],
    agents: [
      { id: 'lead', kind: 'agent', agent_kind: 'coordinator', name: 'Claude Code lead', role: 'orchestrates, reviews and merges; owns INT rows and phase gates; never implements (CLAUDE.md)', model_policy: 'Fable for orchestration and security-sensitive or core work; Opus 5.5 otherwise; never Sonnet (L198, L325, L363)', rows_assigned: rowsByWs.lead ?? 0 },
      ...wsTable.map((w) => ({
        id: `ws-${w.id}`,
        kind: 'agent',
        agent_kind: 'worker',
        workstream: w.id,
        name: `Workstream ${w.id} · ${w.name}`,
        owns: w.owns,
        consumes: w.consumes,
        model_policy: 'Opus 5.5 workers, one task per worktree (L102, L363)',
        briefs_by_model: modelCounts[w.id] ?? {},
        rows_assigned: rowsByWs[w.id] ?? 0,
      })),
      { id: 'ws-WEB', kind: 'agent', agent_kind: 'worker', workstream: 'WEB', name: 'Workstream WEB · public site', owns: 'apps/site (belucid.chat)', briefs_by_model: modelCounts.WEB ?? {}, rows_assigned: rowsByWs.WEB ?? 0 },
    ],
  };

  const scoreboard = readJson('docs/status/scoreboard.json');
  const board = boardBars(items, scoreboard);

  // 11. Assemble.
  const meta = {
    generator: 'tools/import/lucid-chat/import.mjs',
    importer_version: IMPORTER_VERSION,
    importer_date: IMPORTER_DATE,
    source_repository: 'Lucid Chat (nightdweller11/lucid)',
    source_hashes: Object.fromEntries(Object.entries(hashes).filter(([k]) => !k.includes('/walkthroughs/') && !k.includes('/briefs/') && !/docs\/testing\//.test(k))),
    source_files_read: Object.keys(hashes).length,
    sanitizer: san.counts,
  };
  const allItems = [...items, ...acc.items];
  return {
    meta,
    items: allItems,
    checklistItems: items,
    accounts: acc.items,
    decisions,
    answers: answersDoc,
    relations,
    evidence,
    briefs,
    reports,
    groupings: [...groupings.values()],
    people,
    evaluation,
    board,
    stats: { duplicates, skippedPlaceholders, origins, unresolvedDeps, cycles, waveReports: waveReports.size },
  };
}

/** Write every output document and the report. */
export function writeOutputs(result, outDir) {
  mkdirSync(outDir, { recursive: true });
  const w = (name, data) => writeFileSync(join(outDir, name), `${JSON.stringify(data, null, 1)}\n`);
  const { meta } = result;
  w('items.json', { meta, schema: 'lucid-total.import.items/v1', items: result.items });
  w('relations.json', { meta, schema: 'lucid-total.import.relations/v1', relations: result.relations });
  w('decisions.json', {
    meta,
    schema: 'lucid-total.import.decisions/v1',
    decisions: result.decisions,
    owner_answers: result.answers.answers,
    cards: result.answers.cards,
    hidden_cards: result.answers.hidden,
  });
  w('evidence.json', {
    meta,
    schema: 'lucid-total.import.evidence/v1',
    artefacts: { briefs: result.briefs, reports: result.reports },
    evidence: result.evidence,
  });
  w('groupings.json', { meta, schema: 'lucid-total.import.groupings/v1', groupings: result.groupings });
  w('people-and-agents.json', { meta, schema: 'lucid-total.import.people/v1', ...result.people });
  w('evaluation.json', { meta, schema: 'lucid-total.import.evaluation/v1', board: result.board, stats: result.stats, rows: result.evaluation });
  writeFileSync(join(outDir, 'report.md'), renderReport(result));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const result = runImport(resolve(args.source));
  writeOutputs(result, resolve(args.out));
  const s = result.meta.sanitizer;
  console.log(
    `imported ${result.checklistItems.length} checklist rows, ${result.accounts.length} account/chore items, ${result.decisions.length} decisions, ${result.relations.length} relations, ${result.evidence.length} evidence records → ${args.out} (stripped: ${s.email} emails, ${s.phone} phones, ${s.secret} secrets)`,
  );
}
