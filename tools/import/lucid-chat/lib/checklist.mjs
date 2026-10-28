/**
 * docs/15-checklist.md → checklist rows → Lucid Total items (docs/02 §4.1, kind `task` / `chore` / `milestone`).
 *
 * Table shapes in the checklist:
 *   CT, P0, P1, P2: ID | Task | WS | Depends | Tests | Walk | Docs | Acceptance | Status | Follow-ups (10)
 *   P3, P4 (summary rows): ID | Task | WS | Acceptance (4) — no status column
 *   Follow-up rows: ID | Origin | Description | WS | Status (5), sometimes a 6th Follow-ups cell
 * Rows with extra cells (an Evidence column, a status written twice) keep the first columns by position and
 * fold the rest into follow_ups_text; rows with too few cells are flagged `malformed`.
 */
import { splitRow, isSeparator } from './table.mjs';
import { normaliseState } from './state.mjs';
import { extractEvidence } from './evidence.mjs';
import { extractIds } from './ids.mjs';

const TEST_NAMES = {
  U: 'unit',
  I: 'integration',
  C: 'contract',
  E: 'e2e',
  L: 'load',
  V: 'eval',
  S: 'security',
  P: 'property',
};

/** Section heading → phase code. */
export function sectionPhase(heading) {
  const m = /^##\s+(CT|P[0-4])\b/.exec(heading);
  if (m) return m[1];
  if (/^##\s+Follow-up rows/.test(heading)) return 'FU';
  return null;
}

/**
 * Parse the checklist into raw rows: { id, phase, section, line, cells, shape, malformed }.
 * @param {string} md
 */
export function parseChecklist(md) {
  const rows = [];
  let section = null;
  let phase = null;
  let header = null;
  const lines = md.split('\n');
  lines.forEach((line, i) => {
    if (line.startsWith('## ')) {
      section = line.slice(3).trim();
      phase = sectionPhase(line);
      header = null;
      return;
    }
    if (!phase || !line.trimStart().startsWith('|')) return;
    const cells = splitRow(line);
    if (isSeparator(cells)) return;
    if (cells[0] === 'ID') {
      header = cells;
      return;
    }
    if (!header) return;
    rows.push({ id: cells[0], phase, section, line: i + 1, cells, header });
  });
  return rows;
}

/** Map a raw row's cells to named fields by its table shape. */
export function rowFields(raw) {
  const c = raw.cells;
  const h = raw.header;
  const f = { malformed: null };
  if (raw.phase === 'FU') {
    f.title = c[2] ?? '';
    f.origin = c[1] ?? '';
    f.ws = c[3] ?? '';
    f.status = c[4] ?? '';
    f.followUps = c.slice(5).join(' | ');
    f.depends = '';
    f.tests = '';
    f.walk = '';
    f.docs = '';
    f.acceptance = '';
    if (c.length < 5) f.malformed = `follow-up row has ${c.length} cells, expected 5`;
    else if (c.length > 5) f.malformed = `follow-up row has ${c.length} cells (extra folded into follow_ups_text)`;
    return f;
  }
  if (h.length === 4) {
    // P3 / P4 summary rows: no depends, tests, walkthrough or status column.
    f.title = c[1] ?? '';
    f.ws = c[2] ?? '';
    f.acceptance = c[3] ?? '';
    f.status = '';
    f.depends = f.tests = f.walk = f.docs = f.followUps = f.origin = '';
    f.summaryRow = true;
    return f;
  }
  f.title = c[1] ?? '';
  f.ws = c[2] ?? '';
  f.depends = c[3] ?? '';
  f.tests = c[4] ?? '';
  f.walk = c[5] ?? '';
  f.docs = c[6] ?? '';
  f.acceptance = c[7] ?? '';
  f.status = c[8] ?? '';
  f.followUps = c.slice(9).join(' | ');
  f.origin = '';
  if (c.length < 9) f.malformed = `row has ${c.length} cells, expected 10`;
  else if (c.length === 9) f.malformed = 'row has 9 cells (no Follow-ups cell)';
  else if (c.length > 10) f.malformed = `row has ${c.length} cells (extra folded into follow_ups_text)`;
  return f;
}

/** Workstream tokens of a WS cell: "E1 / C / D" → ["E1","C","D"], "Owner/A" → ["owner","A"]. */
export function parseWorkstreams(ws) {
  const out = [];
  for (const m of (ws ?? '').matchAll(/\b(E1|E2|[A-H]|Lead|Owner|All|WEB|counsel|person)\b/gi)) {
    let t = m[1];
    if (/^(lead|owner|all|counsel|person)$/i.test(t)) t = t.toLowerCase();
    else t = t.toUpperCase();
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

/** Tests cell → names: "U, I, E, L (LT-01)" → unit, integration, e2e, load (+ LT-01 detail). */
export function parseTests(cell) {
  const required = [];
  const detail = [];
  const text = (cell ?? '').replace(/\(([^)]*)\)/g, (_, inner) => {
    for (const id of inner.match(/\b[A-Z]{1,3}-\d{1,3}\b/g) ?? []) detail.push(id);
    return ' ';
  });
  for (const tok of text.split(/[\s,;/+]+/)) {
    const t = tok.trim();
    if (TEST_NAMES[t] && !required.includes(TEST_NAMES[t])) required.push(TEST_NAMES[t]);
    else if (/^LT-\d+$/.test(t)) detail.push(t);
  }
  return { required, detail };
}

/** Walk cell → boolean (y / y (browser) → true) or null when not stated. */
export function parseWalk(cell) {
  const s = (cell ?? '').trim().toLowerCase();
  if (/^y/.test(s)) return true;
  if (/^n/.test(s)) return false;
  return null;
}

/**
 * Depends cell → ids that exist, ids that look like checklist ids but do not exist, and leftover text.
 * "—" and "all" are not dependencies.
 * @param {string} cell
 * @param {(id: string) => boolean} exists
 * @param {(id: string) => boolean} idLike
 */
export function parseDepends(cell, exists, idLike) {
  const text = (cell ?? '').trim();
  if (!text || /^(—|-|–|none|n\/a)$/i.test(text)) return { ids: [], unresolved: [], text: '' };
  const ids = [];
  const unresolved = [];
  for (const id of extractIds(text)) {
    if (exists(id)) ids.push(id);
    else if (idLike(id)) unresolved.push(id);
  }
  // Leftover: what remains once ids, separators and filler words are removed.
  let rest = text;
  for (const id of [...ids, ...unresolved]) rest = rest.split(id).join(' ');
  rest = rest.replace(/[,;/+&()]|\band\b|\bthen\b/gi, ' ').replace(/\s+/g, ' ').trim();
  return { ids, unresolved, text: rest };
}

// Wording that marks a human action (UC-B5). Read from the title/description only.
const HUMAN_LEAD = /^(?:\*\*)?(?:owner|lead\s*\/\s*owner|owner\s*\/\s*(?:lead|counsel|[a-h]\d?)|a person|counsel)\b\s*[:/(]/i;
const HUMAN_ACTION =
  /\b(?:open|sign|buy|enrol|enroll|register|verify|approve|install|provision|purchase|pay|upgrade|rotate|revoke|paste|engage|answer|decide|confirm)\b[^.;]{0,60}\b(?:account|card|credit card|dpa|contract|developer program|console|token|key|licen[cs]e|subscription|counsel|dpo|number|decision|domain|xcode|runner|device cloud)\b/i;

/**
 * Item kind for a checklist row: `milestone` for gate rows, `chore` for human actions, `task` otherwise.
 * @returns {{ kind: string, reason: string|null }}
 */
export function detectKind(id, title, workstreams, mentionedIn07a) {
  if (/^INT-\d+$/.test(id)) return { kind: 'milestone', reason: 'gate row (INT-<n>)' };
  const ownerWs = workstreams.includes('owner') || workstreams.includes('counsel') || workstreams.includes('person');
  if (HUMAN_LEAD.test(title)) return { kind: 'chore', reason: 'description addressed to the owner or a person' };
  if (ownerWs && HUMAN_ACTION.test(title)) return { kind: 'chore', reason: 'owner workstream and a human action' };
  if (ownerWs) return { kind: 'chore', reason: 'owner workstream' };
  if (mentionedIn07a && HUMAN_ACTION.test(title)) return { kind: 'chore', reason: 'named in docs/07a and a human action' };
  return { kind: 'task', reason: null };
}

/**
 * Build the item for one checklist row. Relations are added later (they need every id).
 * @param {object} raw from parseChecklist
 * @param {{ root: string, exists: (id:string)=>boolean, idLike: (id:string)=>boolean, in07a: Set<string> }} ctx
 */
export function buildItem(raw, ctx) {
  const f = rowFields(raw);
  const st = normaliseState(f.status);
  const workstreams = parseWorkstreams(f.ws);
  const tests = parseTests(f.tests);
  const deps = parseDepends(f.depends, ctx.exists, ctx.idLike);
  const kind = detectKind(raw.id, f.title, workstreams, ctx.in07a.has(raw.id));
  const evidence = [
    ...extractEvidence(st.verdict, { root: ctx.root, field: 'status' }),
    ...extractEvidence(st.history.join(' · '), { root: ctx.root, field: 'status_history' }),
    ...extractEvidence(f.followUps, { root: ctx.root, field: 'follow_ups' }),
  ];
  return {
    id: raw.id,
    aliases: [raw.id],
    kind: kind.kind,
    kind_reason: kind.reason,
    title: f.title,
    state: st.state,
    resolution: st.resolution,
    progress: st.progress,
    state_text: f.status,
    state_verdict: st.verdict,
    state_recognised: st.recognised,
    board_class: st.board,
    workstream: workstreams[0] ?? null,
    workstreams,
    workstream_text: f.ws,
    phase: raw.phase === 'FU' ? null : raw.phase,
    section: raw.section,
    top_level: raw.phase !== 'FU',
    origin_text: f.origin || null,
    depends_on: deps.ids,
    depends_unresolved: deps.unresolved,
    depends_text: deps.text || null,
    tests_required: tests.required,
    tests_detail: tests.detail,
    walkthrough_required: parseWalk(f.walk),
    walkthrough_text: f.walk || null,
    docs_required: f.docs || null,
    acceptance: f.acceptance || null,
    follow_ups_text: f.followUps || null,
    follow_up_ids: extractIds(f.followUps).filter(ctx.exists),
    evidence,
    history: st.history,
    groupings: [],
    summary_row: Boolean(f.summaryRow),
    malformed: f.malformed,
    source: { file: 'docs/15-checklist.md', line: raw.line },
  };
}
