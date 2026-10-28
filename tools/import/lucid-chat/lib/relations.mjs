/**
 * Relations between imported items (docs/02 §4.3): depends_on, spawned_by, parent_of, relates.
 *
 * Follow-up origin rules (spawned_by), tried in this order; the first that finds an existing item wins and
 * the relation records which rule found it:
 *   1. origin-column  — a follow-up row's Origin cell names an existing item id (or decision `L<n>`, `ADR-<n>`):
 *                       the first such id. "P1-H-06-F1-F1 (wave 13 C)" → P1-H-06-F1-F1.
 *   2. listed-by      — another row lists this id in its Follow-ups cell (or folded Evidence cell).
 *   3. id-prefix      — strip the id's last `-F<n>` / `-CR<n>` (and similar `-<letters><n>` review suffixes),
 *                       then any `-w<n>…` wave segment, then trailing segments, until an existing item remains:
 *                       `X-F1` → X, `X-CR2` → X, `X-w36-F1` → X, `L503-F1` → decision L503,
 *                       `P0-G-01-ios-F1` → P0-G-01.
 * A row is an orphan when none of the three finds an item. Its Origin text may still name a wave or a review
 * ("wave 1 setup", "review of the Sonnet waves"): those are reported as "origin is a wave or review, no item".
 *
 * parent_of (subtasks): an id whose last segment is not a follow-up marker — `-U<n>`, `-a`, `-ios`, a bare
 * number (`REV-E1-30-2`) — and whose prefix is an existing item is that item's subtask.
 */

const FOLLOW_SUFFIX = /-(?:F|CR|R|X|N|S|D|P)\d+[a-z]?$/; // markers the lead and reviewers use for spawned rows
const WAVE_SEG = /-w\d+[A-Za-z0-9]*$/;

/** Candidate origins from the id alone, nearest first. */
export function prefixCandidates(id) {
  const out = [];
  let cur = id;
  let guard = 0;
  while (cur.includes('-') && guard < 12) {
    guard += 1;
    let next;
    if (FOLLOW_SUFFIX.test(cur)) next = cur.replace(FOLLOW_SUFFIX, '');
    else if (WAVE_SEG.test(cur)) next = cur.replace(WAVE_SEG, '');
    else next = cur.replace(/-[^-]+$/, '');
    if (!next || next === cur) break;
    out.push(next);
    cur = next;
  }
  return out;
}

/** True when the id ends in a follow-up marker (spawned) rather than a subtask marker. */
export function isFollowUpId(id) {
  return FOLLOW_SUFFIX.test(id) || /^L\d+[a-z]?-/.test(id);
}

/**
 * Find the origin of a follow-up row.
 * @param {{ id: string, origin_text: string|null }} item
 * @param {(id: string) => boolean} exists
 * @param {Map<string, string>} listedBy follow-up id → the row whose Follow-ups cell lists it
 * @param {(text: string) => string[]} extractIds
 * @returns {{ origin: string|null, rule: string|null, prefixOrigin: string|null, originTextKind: string|null }}
 */
export function findOrigin(item, exists, listedBy, extractIds) {
  const prefixOrigin = prefixCandidates(item.id).find(exists) ?? null;
  if (item.origin_text) {
    const fromColumn = extractIds(item.origin_text).find((id) => id !== item.id && exists(id));
    if (fromColumn) return { origin: fromColumn, rule: 'origin-column', prefixOrigin, originTextKind: 'item' };
  }
  const lister = listedBy.get(item.id);
  if (lister && lister !== item.id) return { origin: lister, rule: 'listed-by', prefixOrigin, originTextKind: null };
  if (prefixOrigin) return { origin: prefixOrigin, rule: 'id-prefix', prefixOrigin, originTextKind: null };
  let originTextKind = null;
  if (item.origin_text) {
    if (/\bwave\b|\b[A-H]\d?\s+(?:report|change request|deviation|open question)\b|\breport\b/i.test(item.origin_text))
      originTextKind = 'wave-or-report';
    else if (/\breview|audit|conformance|exploratory|walkthrough|finding/i.test(item.origin_text)) originTextKind = 'review';
    else if (/\bowner|lead\b/i.test(item.origin_text)) originTextKind = 'owner-or-lead';
    else originTextKind = 'text';
  }
  return { origin: null, rule: null, prefixOrigin: null, originTextKind };
}

/** Subtask parent by id structure (see header), or null. */
export function findParent(id, exists) {
  if (isFollowUpId(id)) return null;
  const m = /^(.*)-([^-]+)$/.exec(id);
  if (!m) return null;
  const [, prefix, last] = m;
  // A subtask marker: U<n> (unit of a wave row), a single letter, a platform word, or a bare number after a
  // numbered parent (REV-E1-30-2).
  const subtaskMarker = /^(?:U\d+|[a-z]|ios|android|web|console|\d+)$/.test(last);
  if (subtaskMarker && exists(prefix)) return prefix;
  return null;
}

/**
 * Strongly connected components with more than one node (or a self-loop) in a directed graph.
 * Tarjan's algorithm, iterative so a long chain does not overflow the stack.
 * @param {Map<string, string[]>} graph
 * @returns {string[][]}
 */
export function findCycles(graph) {
  let index = 0;
  const idx = new Map();
  const low = new Map();
  const onStack = new Set();
  const stack = [];
  const cycles = [];
  for (const start of graph.keys()) {
    if (idx.has(start)) continue;
    const work = [{ node: start, edges: graph.get(start) ?? [], i: 0 }];
    idx.set(start, index);
    low.set(start, index);
    index += 1;
    stack.push(start);
    onStack.add(start);
    while (work.length) {
      const frame = work[work.length - 1];
      if (frame.i < frame.edges.length) {
        const next = frame.edges[frame.i];
        frame.i += 1;
        if (!idx.has(next)) {
          idx.set(next, index);
          low.set(next, index);
          index += 1;
          stack.push(next);
          onStack.add(next);
          work.push({ node: next, edges: graph.get(next) ?? [], i: 0 });
        } else if (onStack.has(next)) {
          low.set(frame.node, Math.min(low.get(frame.node), idx.get(next)));
        }
        continue;
      }
      work.pop();
      if (work.length) {
        const parent = work[work.length - 1].node;
        low.set(parent, Math.min(low.get(parent), low.get(frame.node)));
      }
      if (low.get(frame.node) === idx.get(frame.node)) {
        const comp = [];
        let n;
        do {
          n = stack.pop();
          onStack.delete(n);
          comp.push(n);
        } while (n !== frame.node);
        const selfLoop = comp.length === 1 && (graph.get(comp[0]) ?? []).includes(comp[0]);
        if (comp.length > 1 || selfLoop) cycles.push(comp.reverse());
      }
    }
  }
  return cycles;
}
