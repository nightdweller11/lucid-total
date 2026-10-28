/**
 * Evidence extraction from free text (Status, Follow-ups and Evidence cells). Every finding is typed:
 *   link · commit · pr · walkthrough · report · brief · doc · code · tests · wave · date · decision
 * Paths are resolved against the source repository so the evaluation can check that they exist.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const URL_RE = /\bhttps?:\/\/[^\s)`|<>"',;]+[^\s)`|<>"',;.]/g;
// A git hash: 7–40 hex characters with at least one digit and one letter (so "deadbeef"-like words and
// plain numbers do not count). Only accepted in a code span or after a merge/commit/main/head word.
const HASH = /[0-9a-f]{7,40}/;
const HASH_IN_CODE = /`([0-9a-f]{7,40})`/g;
const HASH_AFTER_WORD =
  /\b(?:merged|merge|commit|commits|main|head|HEAD|at|on|squash(?:ed)?|cherry-picked|push)\s*(?:as\s+|at\s+|on\s+)?\(?`?([0-9a-f]{7,40})\b/g;
const HASH_IN_PARENS = /\(([0-9a-f]{7,40})(?:[;:,)]|\s)/g;
const PR_RE = /\b(?:PR|pull request)\s*#?(\d{1,6})\b|\/pull\/(\d{1,6})\b/gi;
// "137 protocol tests", "90 tests", "50/50", "424/424", "mobile 607", "11 passed".
const TESTS_RE =
  /\b(\d{1,5})\s+(?:[a-z0-9@/-]+\s+){0,3}(?:tests?|checks?|cases?|flows?|specs?)\b(?:\s+(?:green|pass(?:ed|es)?))?|\b(\d{1,5})\s*\/\s*(\d{1,5})\b(?=\s*(?:pass|green|PASS|checks|tests|live|conformance|\)|,|;|\s))|\b(\d{1,5})\s+passed\b/g;
const WAVE_NUM_FIRST = /\bwave\s+(\d{1,3})\s*([A-H]\d?|WEB|AI)\b/g; // "wave 36 H", "wave 2 WEB"
const WAVE_WS_FIRST = /\b([A-H]\d?)\s+wave\s+(\d{1,3})\b/g; // "E2 wave 5"
const WAVE_NAMED = /\bwave\s+([A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+)\b/g; // "wave BETA-REPORT-1"
const WAVE_SHORT = /\b([A-H]\d?)\s+(\d{1,3})\b(?=['’]s\b|\s+(?:merged|accepted|review|walkthrough|report))/g; // "C 32 merged"
const DATE_RE = /\b(20\d\d-\d\d-\d\d)\b/g;
const DECISION_RE = /\b(L\d{1,4}[a-z]?|ADR-\d{4})\b/g;
// A repository path: something/with/slashes.ext or a docs/ path; inside or outside code spans.
const PATH_RE =
  /(?:^|[\s`(\[,;:])((?:\.\/)?(?:docs|apps|packages|tests|scripts|infra|tools|\.github|testing|walkthroughs|briefs|mechanisms|runbooks)\/[A-Za-z0-9_.@\-/{},*]+)/g;

/** Normalise a wave mention to the key used by briefs and groupings: "36-H", "5-E2", "BETA-AI-1". */
export function waveKey(num, ws) {
  return ws ? `${num}-${ws}` : String(num);
}

/** Display name of a wave key: "wave 36 H". */
export function waveLabel(key) {
  const m = /^(\d+)-(.+)$/.exec(key);
  return m ? `wave ${m[1]} ${m[2]}` : `wave ${key}`;
}

/**
 * Resolve a path as written in a cell to a repository path. Relative forms the checklist uses:
 * `testing/walkthroughs/X.md`, `walkthroughs/X.md`, `briefs/x.md`, `mechanisms/x.md`, `runbooks/x.md`.
 */
export function resolveRepoPath(p) {
  let path = p.replace(/^\.\//, '').replace(/[.,;:)]+$/, '');
  if (/^(?:testing|briefs|mechanisms|runbooks)\//.test(path)) path = `docs/${path}`;
  else if (/^walkthroughs\//.test(path)) path = `docs/testing/${path}`;
  return path;
}

/** Classify a repository path into an evidence type. */
export function pathType(path) {
  if (/^docs\/testing\/walkthroughs\//.test(path)) return 'walkthrough';
  if (/^docs\/testing\/(?:load|evals|gates|rc|reviews|security|a11y)\//.test(path)) return 'report';
  if (/^docs\/briefs\//.test(path)) return 'brief';
  if (/^docs\//.test(path)) return 'doc';
  return 'code';
}

/**
 * Extract typed evidence from a text.
 * @param {string} text
 * @param {{ source?: string, root?: string, field?: string }} [opts] root = source repository for existence checks
 * @returns {Array<{type: string, value: string, exists?: boolean, field?: string}>}
 */
export function extractEvidence(text, opts = {}) {
  if (!text) return [];
  const out = [];
  const seen = new Set();
  const push = (type, value, extra = {}) => {
    const key = `${type}:${value}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ type, value, ...(opts.field ? { field: opts.field } : {}), ...extra });
  };
  for (const m of text.matchAll(URL_RE)) {
    const url = m[0];
    if (/\/pull\/\d+/.test(url)) push('pr', url);
    else push('link', url);
  }
  const hashes = new Set();
  for (const re of [HASH_IN_CODE, HASH_AFTER_WORD, HASH_IN_PARENS]) {
    for (const m of text.matchAll(re)) {
      const h = m[1];
      if (HASH.test(h) && /\d/.test(h) && /[a-f]/.test(h) && !/^\d{4}-/.test(h)) hashes.add(h);
    }
  }
  for (const h of hashes) push('commit', h);
  for (const m of text.matchAll(PR_RE)) push('pr', `#${m[1] ?? m[2]}`);
  for (const m of text.matchAll(PATH_RE)) {
    const raw = m[1];
    if (/\{[^{}]*,[^{}]*\}/.test(raw) && !raw.includes('*')) {
      // Brace list: packages/x/{a,b}.ts → packages/x/a.ts, packages/x/b.ts (one level, as the checklist writes it).
      for (const p of expandBraces(raw)) {
        const path = resolveRepoPath(p);
        push(pathType(path), path, opts.root ? { exists: existsSync(join(opts.root, path)) } : {});
      }
      continue;
    }
    if (/[{}*]/.test(raw) || raw.endsWith('/')) {
      // A glob or a folder: keep as a pointer, existence checked on the folder part.
      const path = resolveRepoPath(raw.replace(/[{*].*$/, ''));
      push(pathType(path), path, opts.root ? { exists: existsSync(join(opts.root, path)), pattern: true } : {});
      continue;
    }
    const path = resolveRepoPath(raw);
    if (!/\.[A-Za-z0-9]{1,5}$/.test(path) && !/\//.test(path.slice(5))) continue;
    push(pathType(path), path, opts.root ? { exists: existsSync(join(opts.root, path)) } : {});
  }
  for (const m of text.matchAll(TESTS_RE)) {
    const v = m[0].trim();
    if (m[2] && m[3] && Number(m[2]) > Number(m[3])) continue; // "12/5" is not a pass count
    if (/^(?:19|20)\d\d\b/.test(v)) continue; // years
    push('tests', v);
  }
  for (const m of text.matchAll(WAVE_NUM_FIRST)) push('wave', waveKey(m[1], m[2]));
  for (const m of text.matchAll(WAVE_WS_FIRST)) push('wave', waveKey(m[2], m[1]));
  for (const m of text.matchAll(WAVE_NAMED)) push('wave', m[1]);
  for (const m of text.matchAll(WAVE_SHORT)) push('wave', waveKey(m[2], m[1]));
  for (const m of text.matchAll(DATE_RE)) push('date', m[1]);
  for (const m of text.matchAll(DECISION_RE)) push('decision', m[1]);
  return out;
}

/** Expand the first `{a,b,c}` group of a path (recursively for later groups). */
export function expandBraces(p) {
  const m = /\{([^{}]*)\}/.exec(p);
  if (!m) return [p];
  return m[1].split(',').flatMap((alt) => expandBraces(p.slice(0, m.index) + alt.trim() + p.slice(m.index + m[0].length)));
}

/** Evidence types that are links to an artefact (as opposed to mentions). */
export const LINK_TYPES = new Set(['link', 'commit', 'pr', 'walkthrough', 'report', 'doc', 'code', 'brief']);
