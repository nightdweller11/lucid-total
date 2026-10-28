/**
 * The evaluation pass (owner: the translation also evaluates the work, UC-B9).
 *
 * Evidence strength for a `done` row, 0–3:
 *   3 — a walkthrough report or a test report (load, eval, gate, rc, review) that exists on disk, either cited
 *       in the row or naming the row's id in its title / header lines;
 *   2 — a commit hash, a PR, test counts ("137 tests", "50/50"), or an existing code / doc / test file cited;
 *   1 — only a wave name, a date or a decision reference;
 *   0 — nothing.
 * Done rows at 0–1 become "to verify" items for the coordinator.
 */

const OWNERISH = /phone toolchain|xcode|android sdk|simulator|device cloud|staging|counsel|owner decision|owner item|needs the owner|blocked on the owner|a2 \(|eas build|apple developer|play console|native review/;

/** Wave walkthrough reports by wave key: P1-E1-w10.md → "10-E1"; MOCKS-w38E2 → "38-E2"; P2-H-08-w48 → "48-H". */
export function waveReportKey(stem) {
  const m = /^(?:P\d-)?([A-Z]\d?|MOCKS|ENV[A-Z-]*)(?:-\d+)?-w(\d+)([A-Z]\d?)?(?:-[a-z].*)?$/.exec(stem);
  if (!m) return null;
  const ws = m[3] ?? (/^[A-Z]\d?$/.test(m[1]) ? m[1] : null);
  return ws ? `${m[2]}-${ws}` : null;
}

/**
 * Grade one item's evidence.
 * @param {object} item
 * @param {Map<string, object[]>} reportsById id → reports that name it
 */
export function gradeEvidence(item, reportsById) {
  const ev = item.evidence ?? [];
  const basis = [];
  const missing = [];
  let grade = 0;
  const citedReports = ev.filter((e) => (e.type === 'walkthrough' || e.type === 'report') && !e.pattern);
  for (const e of citedReports) (e.exists ? basis : missing).push(e.value);
  if (basis.length) grade = 3;
  const indexed = (reportsById.get(item.id) ?? []).map((r) => r.path);
  if (!grade && indexed.length) {
    grade = 3;
    basis.push(...indexed.map((p) => `${p} (names the row)`));
  }
  const strong = ev.filter((e) => e.type === 'commit' || e.type === 'pr' || e.type === 'tests');
  const artefacts = ev.filter((e) => (e.type === 'code' || e.type === 'doc') && e.exists && !e.pattern);
  let grade2Source = null;
  if (!grade && strong.length) {
    grade = 2;
    // Which kind of evidence carried grade 2 (lead decision T23): commit before PR before test counts.
    grade2Source = ['commit', 'pr', 'tests'].find((t) => strong.some((e) => e.type === t));
    basis.push(...strong.slice(0, 5).map((e) => `${e.type}: ${e.value}`));
  }
  let liftedByArtefact = false;
  if (!grade && artefacts.length) {
    grade = 2;
    grade2Source = 'file';
    liftedByArtefact = true;
    basis.push(...artefacts.slice(0, 5).map((e) => `${e.type}: ${e.value}`));
  }
  const weak = ev.filter((e) => e.type === 'wave' || e.type === 'date' || e.type === 'decision');
  if (!grade && weak.length) {
    grade = 1;
    basis.push(...weak.slice(0, 5).map((e) => `${e.type}: ${e.value}`));
  }
  for (const e of ev) if ((e.type === 'code' || e.type === 'doc' || e.type === 'brief') && e.exists === false && !e.pattern) missing.push(e.value);
  return { grade, grade2_source: grade2Source, basis, missing_paths: [...new Set(missing)], lifted_by_artefact: liftedByArtefact };
}

/**
 * Walkthrough check for a done row that requires one.
 * @returns {{ status: 'cited'|'indexed'|'wave-report'|'cited-missing'|'none', paths: string[] }}
 */
export function walkthroughCheck(item, reportsById, waveReports) {
  const cited = (item.evidence ?? []).filter((e) => e.type === 'walkthrough' && !e.pattern);
  const ok = cited.filter((e) => e.exists).map((e) => e.value);
  if (ok.length) return { status: 'cited', paths: ok };
  const idx = (reportsById.get(item.id) ?? []).filter((r) => r.type === 'walkthrough').map((r) => r.path);
  if (idx.length) return { status: 'indexed', paths: idx };
  const waves = (item.evidence ?? []).filter((e) => e.type === 'wave').map((e) => e.value);
  const wr = waves.flatMap((w) => waveReports.get(w) ?? []);
  if (wr.length) return { status: 'wave-report', paths: [...new Set(wr)] };
  if (cited.length) return { status: 'cited-missing', paths: cited.map((e) => e.value) };
  return { status: 'none', paths: [] };
}

/**
 * Parse what blocks an open row from its verdict.
 * @param {object} item
 * @param {{ exists: (id:string)=>boolean, get: (id:string)=>object|undefined, openDecisions: Map<string, object> }} ctx
 * @returns {{ category: string, subtype: string|null, target: string|null, phrase: string }|null}
 */
export function parseBlocker(item, ctx) {
  const v = item.state_verdict ?? '';
  // The sweeps write "<state> — <what holds it> (wave …, date: details)"; only that lead clause is read, so
  // a word such as "after" inside the details does not count as a blocker.
  const lead = v.split('(')[0].slice(0, 240);
  let phrase = null;
  let m = /\b(?:blocked|waits?|waiting)\s+(?:on|by|for)\s+(.+)$/i.exec(lead);
  if (m) phrase = m[1];
  if (!phrase) {
    const fu = /\bfollow-up\s+`?([A-Z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+)/.exec(lead);
    if (fu && fu[1] !== item.id) phrase = fu[1];
    else if (fu) return null; // "follow-up <itself>": the rest of the work stays in this row, nothing holds it
  }
  if (!phrase && (m = /\b(?:after|until|once)\s+(.+)$/i.exec(lead))) phrase = m[1];
  if (!phrase && /runs? due|android|\bios\b|xcode|simulator|emulator|device/i.test(lead)) phrase = lead.replace(/^[a-z ]+[—–-]+\s*/i, '');
  if (!phrase && item.state === 'blocked') phrase = lead;
  if (!phrase) return null;
  phrase = phrase.trim();
  const lower = phrase.toLowerCase();
  // An open-decision card: "owner decision 0eq", "owner item 13", "card 0eo", "item 0a".
  const card = /\b(?:owner\s+)?(?:decision|item|card|items?)\s+`?(0[a-z]{1,3}|\d{1,2}|[A-Z]\d{1,2})\b/i.exec(phrase);
  if (card) {
    const od = ctx.openDecisions.get(card[1]);
    if (!od) return { category: 'owner decision', subtype: 'stale: the card is resolved in docs/09', target: `OD-${card[1]}`, phrase };
    const kind = od.open_kind ?? '';
    if (/unblock/i.test(kind)) return { category: 'external account', subtype: `owner item ${card[1]} (unblock)`, target: `OD-${card[1]}`, phrase };
    return { category: 'owner decision', subtype: `${kind || 'decide'} ${card[1]}`, target: `OD-${card[1]}`, phrase };
  }
  const ids = [...phrase.matchAll(/\b[A-Z][A-Z0-9]*(?:-[A-Za-z0-9]+)+\b/g)].map((x) => x[0]).filter(ctx.exists);
  if (ids.length) {
    const target = ids[0];
    const t = ctx.get(target);
    let sub = null;
    if (t?.state === 'done') sub = 'stale: the blocking row is done';
    else if (t && OWNERISH.test((t.state_verdict ?? '').toLowerCase())) sub = 'via an owner-blocked row';
    return { category: 'another task', subtype: sub, target, phrase };
  }
  if (/\bowner\b.*\b(?:decision|decide|answer|confirm)|\bdecision\b|\bdecide/.test(lower)) return { category: 'owner decision', subtype: null, target: null, phrase };
  if (/counsel|dpo|lawyer|legal review/.test(lower)) return { category: 'external account', subtype: 'counsel', target: null, phrase };
  if (/native review|translator|native speaker/.test(lower)) return { category: 'external account', subtype: 'native-speaker review', target: null, phrase };
  if (/account|apple|play console|google play|developer program|firebase|apns|twilio|prelude|scaleway|vendor|dpa|token|\bkey\b|payment|approval/.test(lower))
    return { category: 'external account', subtype: 'account', target: null, phrase };
  if (/xcode|simulator|phone toolchain|device|testflight|\beas\b|staging|runner|machine|emulator|android|\bios\b|runs? due/.test(lower))
    return { category: 'external account', subtype: 'environment or toolchain', target: null, phrase };
  if (/\bowner\b/.test(lower)) return { category: 'owner decision', subtype: 'owner action', target: null, phrase };
  return { category: 'other', subtype: null, target: null, phrase };
}

const OPEN_WORDS = /\b(?:remaining|missing|not yet|still (?:open|to do|missing|needs?)|blocked on|pending|left to do|not done|not run|to be done|tbd|waits? for)\b/i;
const DONE_WORDS = /\b(?:accepted and merged|lead-verified|merged (?:on|to) main|all acceptance (?:criteria )?met)\b/i;

/**
 * Status text that contradicts the normalised state.
 * @returns {string|null} the contradiction kind
 */
export function contradiction(item) {
  const v = item.state_verdict ?? '';
  if (!item.top_level && !v) return 'empty status';
  if (item.state_text && !item.state_recognised && !item.summary_row) return 'unrecognised status word';
  if (item.state === 'done') {
    const m = OPEN_WORDS.exec(v);
    if (m) return `done, but the verdict says "${m[0]}"`;
  }
  if (['todo', 'blocked', 'brief'].includes(item.state)) {
    const m = DONE_WORDS.exec(v);
    if (m) return `${item.state}, but the verdict says "${m[0]}"`;
  }
  return null;
}

/**
 * The status board's two bars, re-derived from the items (the rules of scripts/status-site/scoreboard.mjs):
 * bar 1 counts Phase 1 top-level rows (ids P1-<ws>-<n>) by the board's classes; bar 2 counts every Phase 1
 * top-level and follow-up row as done · schedulable · owner-blocked.
 * @param {object[]} items checklist items
 * @param {object|null} scoreboard docs/status/scoreboard.json (the H sweep's Phase 1 blockers)
 */
export function boardBars(items, scoreboard) {
  const phase1 = { done: 0, partial: 0, review: 0, todo: 0 };
  const follow = { done: 0, partial: 0, todo: 0 };
  let followBlocked = 0;
  let followOpen = 0;
  const followVerdict = new Map(items.filter((i) => !i.top_level).map((i) => [i.id, i.state_verdict ?? '']));
  for (const it of items) {
    if (it.top_level) {
      if (/^P1-[A-Z0-9]+-\d+[a-z]?$/.test(it.id)) phase1[it.board_class] += 1;
      continue;
    }
    if (!/^[A-Z0-9][A-Za-z0-9-]+$/.test(it.id.replace(/~\d+$/, ''))) continue;
    const k = it.board_class;
    follow[k === 'review' ? 'partial' : k] += 1;
    if (k === 'done') continue;
    const st = (it.state_text ?? '').trim().replace(/^\*+/, '');
    const verdict = /^(?:todo|partial|review)\s*[—–-]+\s*(blocked on|follow-up|android run due)\s*`?([A-Za-z0-9-]*)/i.exec(st);
    if (verdict) {
      const kind = verdict[1].toLowerCase();
      const target = verdict[2] || '';
      const isRowId = /^[A-Z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+$/.test(target) && !/^(?:Xcode|GitHub)$/i.test(target);
      const viaOwner = isRowId && /blocked on (?:the )?owner|owner (?:decision|item)|counsel|xcode|staging/i.test(followVerdict.get(target) ?? '');
      if (kind === 'blocked on' && (!isRowId || viaOwner)) followBlocked += 1;
      else followOpen += 1;
    } else {
      const text = `${it.title} ${it.state_verdict ?? ''}`.toLowerCase();
      if (OWNERISH.test(text)) followBlocked += 1;
      else followOpen += 1;
    }
  }
  const total = phase1.done + phase1.partial + phase1.review + phase1.todo;
  const p1Blocked = scoreboard?.blockers
    ? Object.entries(scoreboard.blockers)
        .filter(([k]) => !/^(?:follow-up|android run due|staging|github and ci)$/i.test(k))
        .reduce((a, [, n]) => a + n, 0)
    : 0;
  const p1Open = total - phase1.done;
  const allDone = phase1.done + follow.done;
  const allOpen = p1Open + follow.partial + follow.todo;
  return {
    bar1: { label: 'Phase 1 top-level rows', total, ...phase1 },
    bar2: {
      label: 'Phase 1 top-level + every follow-up row',
      total: allDone + allOpen,
      done: allDone,
      schedulable: p1Open - p1Blocked + followOpen,
      owner_blocked: p1Blocked + followBlocked,
      phase1_blocked_from_scoreboard_json: p1Blocked,
      follow_blocked: followBlocked,
      follow_open: followOpen,
    },
    follow,
  };
}
