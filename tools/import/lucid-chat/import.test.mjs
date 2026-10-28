/**
 * Tests for the Lucid Chat importer: node --test tools/import/lucid-chat/import.test.mjs
 * Fixture rows are copied from Lucid Chat's docs/15-checklist.md (trimmed where long).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

import { splitRow } from './lib/table.mjs';
import { parseChecklist, rowFields, buildItem, parseTests, parseDepends, parseWorkstreams, detectKind } from './lib/checklist.mjs';
import { normaliseState, boardClass, splitHistory } from './lib/state.mjs';
import { extractIds } from './lib/ids.mjs';
import { extractEvidence, expandBraces, resolveRepoPath } from './lib/evidence.mjs';
import { findOrigin, findParent, findCycles, prefixCandidates } from './lib/relations.mjs';
import { createSanitizer } from './lib/sanitize.mjs';
import { parseDecisionLog, decisionItems, decisionType } from './lib/decisions.mjs';
import { gradeEvidence, parseBlocker, waveReportKey } from './lib/evaluate.mjs';

const FIXTURE = `# Checklist

## P0 · Foundations (weeks 1–4) — Gate 0

| ID | Task | WS | Depends | Tests | Walk | Docs | Acceptance | Status | Follow-ups |
|---|---|---|---|---|---|---|---|---|---|
| CT-09 | Admin API v1 OpenAPI: policy versions/approvals, flags, registry, markets, T&S queues, audit | F | CT-04, CT-05 | C | n | \`docs/api/openapi-admin.yaml\` | Lint clean | done (merged 88f0cd2; 88 tests, redocly lint clean; lead-verified) | Evidence: \`docs/api/openapi-admin.yaml\`. CT-09-F1, F2 |
| P0-E1-06 | Push wake | E1 | P0-C-09, P1-A | U, E, L (LT-01) | y (browser) | runbook | Wakes arrive | partial — blocked on owner decision 0j (wave 47 H, 2026-10-24: push credentials are "later") | — |
| INT-0 | Integration and Gate 0 report | Lead | all P0 | — | y | gate report | Owner accepts | todo — blocked on owner item 13 (wave 47 H, 2026-10-24) | — |

## P3 · Public launch (months 7–9) — Gate 3 (summary rows; expand at Phase 2 end)

| ID | Task | WS | Acceptance |
|---|---|---|---|
| P3-H-01 | Store submissions (launch markets), transparency report v1, audits published | H/Owner | Approvals; publications |

## Follow-up rows

| ID | Origin | Description | WS | Status |
|---|---|---|---|---|
| CT-09-F1 | CT-09 | Serve the admin API | C | done (wave 2 C, 2026-10-19): \`apps/server/src/admin/routes.ts\` |
| P1-C-w13-F2 | P1-H-06-F1-F1 (wave 13 C) | C: admin operations the console does not call yet | C | done (lead reconcile 2026-10-21): \`docs/testing/walkthroughs/P1-C-w13.md\` |
| P1-H-04-F2 | P1-H-04 (H change request) | E2: add consent catalog keys \`consent.a|b\` | E2/E1 | done (wave 45 H, 2026-10-23) | P1-H-04-F2-F1 |
| ENV-F1 | wave 1 setup | Install Xcode and Android Studio on the build machine | Owner/A | partial — blocked on owner item 13 (wave 47 H) |
| P2-H-08-w36-F1 | review | H: re-check the rows | H | todo |
`;

test('splitRow keeps pipes inside code spans and escaped pipes in their cell', () => {
  assert.deepEqual(splitRow('| a | `x|y` | b \\| c | d |'), ['a', '`x|y`', 'b | c', 'd']);
  assert.deepEqual(splitRow('| a | ``x|`y`` | b |'), ['a', '``x|`y``', 'b']);
  // A stray backtick does not swallow the rest of the row.
  assert.deepEqual(splitRow('| a | it`s | b |'), ['a', 'it`s', 'b']);
});

test('parseChecklist reads every table shape with its section', () => {
  const rows = parseChecklist(FIXTURE);
  assert.deepEqual(rows.map((r) => [r.id, r.phase]), [
    ['CT-09', 'P0'],
    ['P0-E1-06', 'P0'],
    ['INT-0', 'P0'],
    ['P3-H-01', 'P3'],
    ['CT-09-F1', 'FU'],
    ['P1-C-w13-F2', 'FU'],
    ['P1-H-04-F2', 'FU'],
    ['ENV-F1', 'FU'],
    ['P2-H-08-w36-F1', 'FU'],
  ]);
  const p3 = rowFields(rows[3]);
  assert.equal(p3.summaryRow, true);
  assert.equal(p3.status, '');
  const sixCells = rowFields(rows[6]);
  assert.equal(sixCells.status.startsWith('done (wave 45 H'), true);
  assert.equal(sixCells.followUps, 'P1-H-04-F2-F1');
  assert.match(sixCells.malformed, /6 cells/);
  assert.equal(rowFields(rows[6]).title.includes('`consent.a|b`'), true);
});

test('buildItem maps the columns to Lucid Total fields', () => {
  const rows = parseChecklist(FIXTURE);
  const ids = new Set(rows.map((r) => r.id).concat(['CT-04', 'CT-05', 'P0-C-09']));
  const ctx = { root: null, exists: (id) => ids.has(id), idLike: (id) => /^(CT|P\d|INT|ENV)\b/.test(id), in07a: new Set() };
  const ct09 = buildItem(rows[0], ctx);
  assert.equal(ct09.kind, 'task');
  assert.equal(ct09.state, 'done');
  assert.deepEqual(ct09.depends_on, ['CT-04', 'CT-05']);
  assert.deepEqual(ct09.tests_required, ['contract']);
  assert.equal(ct09.walkthrough_required, false);
  assert.deepEqual(ct09.follow_up_ids, ['CT-09-F1', 'CT-09-F2'].filter((x) => ids.has(x)));
  assert.ok(ct09.evidence.some((e) => e.type === 'commit' && e.value === '88f0cd2'));
  assert.ok(ct09.evidence.some((e) => e.type === 'tests' && /88 tests/.test(e.value)));
  const push = buildItem(rows[1], ctx);
  assert.equal(push.state, 'blocked');
  assert.equal(push.progress, 'partial');
  assert.deepEqual(push.depends_on, ['P0-C-09']);
  assert.deepEqual(push.depends_unresolved, ['P1-A']);
  assert.deepEqual(push.tests_required, ['unit', 'e2e', 'load']);
  assert.deepEqual(push.tests_detail, ['LT-01']);
  assert.equal(push.walkthrough_required, true);
  const gate = buildItem(rows[2], ctx);
  assert.equal(gate.kind, 'milestone');
  assert.equal(gate.depends_text, 'all P0');
  const env = buildItem(rows[7], ctx);
  assert.equal(env.kind, 'chore');
  assert.deepEqual(env.workstreams, ['owner', 'A']);
});

test('state normalisation', () => {
  const cases = [
    ['done (merged; 90 tests; lead-verified)', 'done', null],
    ['**done** (wave 5 D)', 'done', null],
    ['closed (obsolete: superseded by L425)', 'done', null],
    ['review — follow-up P2-H-08-w51', 'review', null],
    ['in review (wave 41 C, 2026-10-24)', 'review', null],
    ['todo — after REPORT-B', 'todo', null],
    ['todo — blocked on owner item 13 (wave 47 H)', 'blocked', null],
    ['partial — blocked on native review (wave 47 H)', 'blocked', 'partial'],
    ['partly — wave 36 E1, 2026-10-25', 'doing', 'partial'],
    ['in progress — BETA-AI-1 launched 2026-10-27', 'doing', null],
    ['F part done (wave 47 F, 2026-10-24)', 'doing', 'partial'],
    ['owner / A: open (Firebase config)', 'todo', null],
    ['brief written (wave 70 A)', 'brief', null],
    ['blocked', 'blocked', null],
    ['later', 'todo', null],
  ];
  for (const [cell, state, progress] of cases) {
    const r = normaliseState(cell);
    assert.equal(r.state, state, cell);
    if (progress) assert.equal(r.progress, progress, cell);
    assert.equal(r.recognised, true, cell);
  }
  assert.equal(normaliseState('closed (obsolete)').resolution, 'closed');
  assert.equal(normaliseState('').recognised, false);
  assert.equal(normaliseState('C').recognised, false);
  const h = splitHistory('done (wave 38 H) · was: todo · was: partial (wave 2)');
  assert.equal(h.verdict, 'done (wave 38 H)');
  assert.deepEqual(h.history, ['todo', 'partial (wave 2)']);
});

test('board classes follow the status board', () => {
  assert.equal(boardClass('done (x)'), 'done');
  assert.equal(boardClass('closed'), 'done');
  assert.equal(boardClass('waiting for counsel'), 'review');
  assert.equal(boardClass('blocked on X'), 'todo');
  assert.equal(boardClass('partly'), 'partial');
  assert.equal(boardClass('in progress'), 'partial');
});

test('id extraction expands ranges and shorthand lists', () => {
  assert.deepEqual(extractIds('rows P1-B-w27-CR1…CR3, none blocking'), ['P1-B-w27-CR1', 'P1-B-w27-CR2', 'P1-B-w27-CR3']);
  assert.deepEqual(extractIds('ENV-OWNER-INTAKE-F1 … -F3'), ['ENV-OWNER-INTAKE-F1', 'ENV-OWNER-INTAKE-F2', 'ENV-OWNER-INTAKE-F3']);
  assert.deepEqual(extractIds('CT-10-F1, F3, F4 done'), ['CT-10-F1', 'CT-10-F3', 'CT-10-F4']);
  assert.deepEqual(extractIds('L500-F1-F13 and L425'), ['L500-F1-F13', 'L425']);
  assert.deepEqual(extractIds('P1-E1-w33-F1...F2'), ['P1-E1-w33-F1', 'P1-E1-w33-F2']);
});

test('evidence extraction types links, commits, paths, tests, waves and dates', () => {
  const ev = extractEvidence(
    'done (wave 36 H, 2026-10-22; E2 wave 5): merged `f144344` (Wave 28 B merged (d1dd2542; protocol 988)); evidence `walkthroughs/P1-F-w18.md`; 50/50 live; 137 protocol tests green; https://claude.ai/artifact/x; wave BETA-AI-1',
  );
  const by = (t) => ev.filter((e) => e.type === t).map((e) => e.value);
  assert.deepEqual(by('commit').sort(), ['d1dd2542', 'f144344']);
  assert.deepEqual(by('walkthrough'), ['docs/testing/walkthroughs/P1-F-w18.md']);
  assert.ok(by('tests').includes('50/50'));
  assert.ok(by('tests').some((t) => t.startsWith('137 protocol tests')));
  assert.deepEqual(by('wave').sort(), ['36-H', '5-E2', 'BETA-AI-1'].sort());
  assert.deepEqual(by('date'), ['2026-10-22']);
  assert.deepEqual(by('link'), ['https://claude.ai/artifact/x']);
  // Dates and plain words are not hashes.
  assert.equal(extractEvidence('on 2026-10-22 at deadbeef').filter((e) => e.type === 'commit').length, 0);
  assert.deepEqual(expandBraces('packages/x/{a,b}.ts'), ['packages/x/a.ts', 'packages/x/b.ts']);
  assert.equal(resolveRepoPath('testing/load/x.md'), 'docs/testing/load/x.md');
});

test('follow-up origin rules', () => {
  const known = new Set(['CT-09', 'P1-H-06-F1-F1', 'P2-H-08', 'L503', 'P0-G-01', 'X', 'P1-H-04']);
  const exists = (id) => known.has(id);
  const listedBy = new Map([['ROOT-F1', 'X']]);
  // 1. Origin column first, even when the id prefix points elsewhere.
  let o = findOrigin({ id: 'P1-C-w13-F2', origin_text: 'P1-H-06-F1-F1 (wave 13 C)' }, exists, listedBy, extractIds);
  assert.deepEqual([o.origin, o.rule], ['P1-H-06-F1-F1', 'origin-column']);
  // 2. Listed in another row's Follow-ups cell.
  o = findOrigin({ id: 'ROOT-F1', origin_text: 'E2 change request' }, exists, listedBy, extractIds);
  assert.deepEqual([o.origin, o.rule], ['X', 'listed-by']);
  // 3. Id prefix: X-F1, X-w36-F1, L503-F1, platform segment.
  o = findOrigin({ id: 'P2-H-08-w36-F1', origin_text: 'review' }, exists, listedBy, extractIds);
  assert.deepEqual([o.origin, o.rule], ['P2-H-08', 'id-prefix']);
  o = findOrigin({ id: 'L503-F1', origin_text: 'L503 (owner, highest priority)' }, exists, listedBy, extractIds);
  assert.deepEqual([o.origin, o.rule], ['L503', 'origin-column']);
  o = findOrigin({ id: 'P0-G-01-ios-F1', origin_text: null }, exists, listedBy, extractIds);
  assert.deepEqual([o.origin, o.rule], ['P0-G-01', 'id-prefix']);
  // Orphan: nothing resolves; the origin text is classified.
  o = findOrigin({ id: 'ENV-F1', origin_text: 'wave 1 setup' }, exists, listedBy, extractIds);
  assert.equal(o.origin, null);
  assert.equal(o.originTextKind, 'wave-or-report');
  assert.deepEqual(prefixCandidates('P1-B-w9-F3-F1-F1'), ['P1-B-w9-F3-F1', 'P1-B-w9-F3', 'P1-B-w9', 'P1-B', 'P1']);
});

test('subtask parents from the id structure', () => {
  const exists = (id) => ['P1-A-w27-F1', 'REV-E1-30', 'P0-G-01'].includes(id);
  assert.equal(findParent('P1-A-w27-F1-U1', exists), 'P1-A-w27-F1');
  assert.equal(findParent('REV-E1-30-2', exists), 'REV-E1-30');
  assert.equal(findParent('P0-G-01-ios', exists), 'P0-G-01');
  assert.equal(findParent('P0-G-01-F1', exists), null); // a follow-up, not a subtask
});

test('cycle detection', () => {
  const g = (o) => new Map(Object.entries(o));
  assert.deepEqual(findCycles(g({ A: ['B'], B: ['C'], C: [] })), []);
  assert.deepEqual(findCycles(g({ A: ['B'], B: ['A'] })).map((c) => c.sort()), [['A', 'B']]);
  assert.deepEqual(findCycles(g({ A: ['A'] })), [['A']]);
  const cyc = findCycles(g({ A: ['B'], B: ['C'], C: ['A', 'D'], D: ['E'], E: ['D'] }));
  assert.equal(cyc.length, 2);
  // A 20 000-node chain does not overflow the stack.
  const chain = new Map();
  for (let i = 0; i < 20000; i += 1) chain.set(`n${i}`, i < 19999 ? [`n${i + 1}`] : []);
  assert.deepEqual(findCycles(chain), []);
});

test('sanitizer strips emails, phone numbers and keys, and counts them', () => {
  const s = createSanitizer();
  const out = s.clean(
    'mail beta@belucid.chat or call +972 54 123 4567 / +972 54 … / 054-1234567; key sk-ant-abcdefghijklmnopqrstuvwx; keep react@18.3.1, @lucid/ui, U+2388 and 2026-10-22',
  );
  assert.ok(!/belucid\.chat|123 4567|1234567|sk-ant/.test(out), out);
  assert.match(out, /react@18\.3\.1/);
  assert.match(out, /@lucid\/ui/);
  assert.match(out, /U\+2388/);
  assert.match(out, /2026-10-22/);
  assert.deepEqual(s.counts, { email: 1, phone: 3, secret: 1 });
});

const LOG = `# Log

## 2026-10-18 · Founding brief (owner instruction)

### Lead decisions taken on the founding brief (pending owner confirmation)
| # | Decision | Where |
|---|---|---|
| L1 | Expo single codebase. | ADR-0001 |

## 2026-10-18 · Owner answers (owner decisions)
| # | Owner decision (as recorded) | Lead interpretation | Status |
|---|---|---|---|
| O6 | Does not know what "legal review" means | Explained | Awaiting owner go/no-go |
| O19 (mocks) | Mocks v0.8 | ok | Decided |
| O19 | Market compliance profiles | ok | Decided |

## 2026-10-18 · Lead decisions during wave 1 integration
- L29: Architecture reconciled with ADR-0009.
- L64 (lead, 2026-10-19, pending owner confirmation): Audit accepted for CT-09.
- L76 (owner, 2026-10-19 23:00): run the agents and keep an eye on this machine.
- L484 (2026-10-27, lead, pending the owner's confirmation; small and reversible, L425) — **Wave 53 H merged**. More text.
- L425 (owner, 2026-10-24, via the decisions page): **answers.** Every confirm row closed.

## Open decisions (for the owner)
Resolved 2026-10-24 (L437): 7 (no vendor), 0ek (device-resident memory).

| # | From | Kind | Question | Lead recommendation | Row |
|---|---|---|---|---|---|
| 0eq | ADR-0023 Q1 (FS-1) | decide (new) | **May a sender release an unchecked message?** More. | Yes. | — |
| 0j | L104 | later (owner) | Push keys? | Open both | P0-E1-06 |
`;

test('decision log parsing', () => {
  const log = parseDecisionLog(LOG);
  assert.deepEqual(log.entries.map((e) => e.id), ['L1', 'O6', 'O19-mocks', 'O19', 'L29', 'L64', 'L76', 'L484', 'L425']);
  assert.deepEqual(log.open.map((o) => o.id), ['0eq', '0j']);
  assert.deepEqual(log.resolved.map((r) => [r.id, r.by]), [['7', 'L437'], ['0ek', 'L437']]);
  const items = decisionItems(log, { exists: (id) => ['CT-09', 'L425', 'P0-E1-06'].includes(id) });
  const get = (id) => items.find((i) => i.id === id);
  assert.equal(get('L1').decision_type, 'lead decision pending');
  assert.equal(get('L1').state, 'closed'); // closed by the L425 rule (dated 2026-10-18)
  assert.equal(get('L29').decision_type, 'lead decision');
  assert.equal(get('L64').decision_type, 'lead decision pending');
  assert.deepEqual(get('L64').references, ['CT-09']);
  assert.equal(get('L76').decision_type, 'owner instruction');
  assert.equal(get('L484').decision_type, 'lead decision pending');
  assert.equal(get('L484').state, 'open');
  assert.equal(get('L484').date, '2026-10-27');
  assert.equal(get('L425').decision_type, 'owner decision');
  assert.equal(get('O6').state, 'open');
  assert.equal(get('OD-0eq').state, 'open');
  assert.equal(get('OD-0eq').title, 'May a sender release an unchecked message?');
  assert.deepEqual(get('OD-0j').references, ['P0-E1-06']);
  assert.equal(get('OD-7').state, 'closed');
  assert.equal(decisionType('lead, 2026-10-24; the owner moved orchestration', '', ''), 'lead decision');
});

test('evaluation: grades and blockers', () => {
  const reports = new Map([['A-1', [{ path: 'docs/testing/walkthroughs/A-1.md', type: 'walkthrough' }]]]);
  assert.equal(gradeEvidence({ id: 'A-1', evidence: [] }, reports).grade, 3);
  assert.equal(gradeEvidence({ id: 'B', evidence: [{ type: 'commit', value: 'abc1234' }] }, reports).grade, 2);
  assert.equal(gradeEvidence({ id: 'B', evidence: [{ type: 'wave', value: '2-A' }] }, reports).grade, 1);
  assert.equal(gradeEvidence({ id: 'B', evidence: [] }, reports).grade, 0);
  const missing = gradeEvidence({ id: 'B', evidence: [{ type: 'walkthrough', value: 'docs/x.md', exists: false }] }, reports);
  assert.equal(missing.grade, 0);
  assert.deepEqual(missing.missing_paths, ['docs/x.md']);
  const ctx = {
    exists: (id) => ['P1-A-01'].includes(id),
    get: () => ({ state: 'todo', state_verdict: 'todo — blocked on owner item 13' }),
    openDecisions: new Map([['13', { open_kind: 'unblock' }], ['0eq', { open_kind: 'decide (new)' }]]),
  };
  assert.equal(parseBlocker({ id: 'X', state: 'blocked', state_verdict: 'todo — blocked on owner item 13 (wave 47 H)' }, ctx).category, 'external account');
  assert.equal(parseBlocker({ id: 'X', state: 'blocked', state_verdict: 'todo — blocked on owner decision 0eq' }, ctx).category, 'owner decision');
  assert.equal(parseBlocker({ id: 'X', state: 'blocked', state_verdict: 'todo — blocked on owner decision 0zz' }, ctx).subtype, 'stale: the card is resolved in docs/09');
  const t = parseBlocker({ id: 'X', state: 'blocked', state_verdict: 'todo — blocked on P1-A-01 (wave 47 H: GPU nodes after the cluster)' }, ctx);
  assert.deepEqual([t.category, t.target, t.subtype], ['another task', 'P1-A-01', 'via an owner-blocked row']);
  assert.equal(parseBlocker({ id: 'X', state: 'todo', state_verdict: 'todo — follow-up X (wave 47 H: abandon after 3)' }, ctx), null);
  assert.equal(parseBlocker({ id: 'X', state: 'blocked', state_verdict: 'partial — blocked on counsel (wave 45 H)' }, ctx).subtype, 'counsel');
  assert.equal(waveReportKey('P1-E1-w10'), '10-E1');
  assert.equal(waveReportKey('MOCKS-w38E2'), '38-E2');
});

test('workstreams, tests, depends and kind helpers', () => {
  assert.deepEqual(parseWorkstreams('E1 / C / D'), ['E1', 'C', 'D']);
  assert.deepEqual(parseWorkstreams('Lead/owner'), ['lead', 'owner']);
  assert.deepEqual(parseTests('U, I, C').required, ['unit', 'integration', 'contract']);
  assert.deepEqual(parseTests('—').required, []);
  const d = parseDepends('CT-01, CT-03 (part), E2', (id) => id.startsWith('CT'), () => true);
  assert.deepEqual(d.ids, ['CT-01', 'CT-03']);
  assert.equal(d.text, 'part E2');
  assert.equal(detectKind('P1-A-w11-F1', 'Owner: open Apple Developer + App Store Connect record', ['owner'], false).kind, 'chore');
  assert.equal(detectKind('P1-F-w18-F1', 'Lead/owner: confirm the SIM-swap step-up policy', ['lead'], false).kind, 'chore');
  assert.equal(detectKind('P1-C-01', 'OTP sign-up with Twilio Verify', ['C'], false).kind, 'task');
});

// Whole-import smoke test against the real source repository when it is on this machine.
const SOURCE = '/Users/yossinaar/Projects/lucid/lucid';
test('whole import against the Lucid Chat repository', { skip: !existsSync(`${SOURCE}/docs/15-checklist.md`) }, async () => {
  const { runImport } = await import('./import.mjs');
  const r = runImport(SOURCE);
  assert.ok(r.checklistItems.length > 2000);
  const ids = new Set(r.items.map((i) => i.id));
  assert.equal(ids.size, r.items.length, 'item ids are unique');
  for (const rel of r.relations) assert.ok(ids.has(rel.from) || r.decisions.some((d) => d.id === rel.from), `relation from ${rel.from}`);
  const json = JSON.stringify(r.items) + JSON.stringify(r.decisions) + JSON.stringify(r.answers);
  assert.ok(!/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.(?:chat|com|tech|io|org)\b/.test(json), 'no email address in the outputs');
  assert.ok(r.board.bar1.total > 0);
});
