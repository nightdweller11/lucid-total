/**
 * Status cell → normalised state. The checklist's Status cell is free text that begins with the state word
 * and then carries evidence, dates and history: "done (wave 36 H, 2026-10-22; …) · was: review (…)".
 *
 * Lucid Total states: todo · brief · doing · review · done · blocked.
 */

/** The verdict is what the latest sweep wrote: everything before the first "· was:" history marker. */
export function splitHistory(cell) {
  const text = (cell ?? '').trim();
  const parts = text.split(/\s*·\s*was:\s*/i);
  return { verdict: parts[0].trim(), history: parts.slice(1).map((p) => p.trim()).filter(Boolean) };
}

const DONE = /^(?:done|closed|decided|confirmed|approved|resolved|superseded|obsolete|merged)\b/;
const CLOSED_NOT_DONE = /^(?:closed|superseded|obsolete)\b/;
const REVIEW = /^(?:review|in review|waiting|awaiting)\b/;
const BRIEF = /^brief\b/;
const BLOCKED = /^blocked\b/;
const TODO = /^(?:todo|to do|open|not started|later|queued|deferred)\b/;
const DOING = /^(?:doing|in progress|partial|partly|started|built|running|ongoing|wip)\b/;
// "C part done …", "E1 part done", "F part done" — one workstream's half of a shared row is done.
const PART_DONE = /^(?:[a-h]\d?|lead|owner)(?:\s*\/\s*[a-h]\d?)*\s+(?:part|half|parts)\b/;
// "owner / A: open (…)" — a responsibility prefix before the state word.
const WHO_PREFIX = /^(?:owner|lead|[a-h]\d?)(?:\s*\/\s*(?:owner|lead|[a-h]\d?))*\s*:\s*/;
// "todo — blocked on <x>", "partial — blocked on <x>", "open, blocked by <x>".
const BLOCKED_LEAD = /^[a-z ]{0,14}?\s*[—–:,-]+\s*(?:blocked|waits?|waiting)\s+(?:on|by|for)\b/;

/**
 * @param {string} cell the raw Status cell
 * @returns {{ state: string, resolution: string|null, progress: string|null, verdict: string,
 *   history: string[], recognised: boolean, board: string }}
 */
export function normaliseState(cell) {
  const { verdict, history } = splitHistory(cell);
  let s = verdict.replace(/^[*_\s]+/, '').toLowerCase();
  const board = boardClass(verdict);
  if (!s || s === '—' || s === '-') {
    return { state: 'todo', resolution: null, progress: null, verdict, history, recognised: false, board };
  }
  s = s.replace(WHO_PREFIX, '');
  let state = null;
  let resolution = null;
  let progress = null;
  if (DONE.test(s)) {
    state = 'done';
    resolution = CLOSED_NOT_DONE.test(s) ? 'closed' : 'done';
  } else if (REVIEW.test(s)) state = 'review';
  else if (BRIEF.test(s)) state = 'brief';
  else if (BLOCKED.test(s)) state = 'blocked';
  else if (TODO.test(s)) state = 'todo';
  else if (DOING.test(s)) {
    state = 'doing';
    progress = /^(?:partial|partly)/.test(s) ? 'partial' : null;
  } else if (PART_DONE.test(s)) {
    state = 'doing';
    progress = 'partial';
  }
  const recognised = state !== null;
  if (!state) state = 'todo';
  // A leading "— blocked on X" after any open state turns it into blocked; the board keeps its own class.
  if (state !== 'done' && state !== 'blocked' && BLOCKED_LEAD.test(s)) {
    if (state === 'doing') progress = progress ?? 'partial';
    state = 'blocked';
  }
  return { state, resolution, progress, verdict, history, recognised, board };
}

/**
 * The status board's own four classes (scripts/status-site/scoreboard.mjs `classify`), re-implemented so the
 * import's counts can be compared with the board: done · review · todo · partial (everything else).
 * @param {string} cell
 */
export function boardClass(cell) {
  const s = (cell ?? '').trim().replace(/^\*+/, '').trim().toLowerCase();
  if (/^(done|closed|decided|confirmed|approved)\b/.test(s)) return 'done';
  if (s.startsWith('review') || s.startsWith('in review') || s.startsWith('waiting')) return 'review';
  if (s.startsWith('todo') || s.startsWith('blocked') || s.startsWith('open') || s.startsWith('not started'))
    return 'todo';
  return 'partial';
}
