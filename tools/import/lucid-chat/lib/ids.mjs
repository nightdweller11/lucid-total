/**
 * Identifier extraction for Lucid Chat's checklist ids (`P1-C-w13-F2`, `ENV-OWNER-INTAKE-F4`, `L500-F1-F13`),
 * decision log ids (`L425`), ADRs (`ADR-0023`) and open-decision cards (`0eq`, `13`).
 */

/** A token shaped like a checklist id: an upper-case head and at least one dash segment, or `L<n>` alone. */
// The dashed form is tried first so that `L500-F1` is one token, not `L500` followed by `-F1`.
const ID_TOKEN = /\b(?:[A-Z][A-Z0-9]*(?:-[A-Za-z0-9]+)+|L\d+[a-z]?)\b/g;

/**
 * Ranges and shorthand lists the checklist uses for follow-up ids:
 *   `P1-B-w27-CR1…CR9`, `P1-B-w27-CR1...CR9`, `P1-C-w28-F1–F6`, `ENV-OWNER-INTAKE-F1 … -F6`
 *   `CT-10-F1, F3, F4`, `P1-E1-w33-F1…F5, CR1`, `P1-F-w32-CR1, CR2, F1, F2`
 * The base is the id without its last `-F<n>` / `-CR<n>` segment.
 */
const RANGE = /\b([A-Z][A-Z0-9]*(?:-[A-Za-z0-9]+)*?)-(F|CR)(\d+)\s*(?:…|\.\.\.|–)\s*-?(F|CR)?(\d+)\b/g;
const SHORTHAND_TAIL = /^(\s*(?:,|and|\/)\s*)(F|CR)(\d+)\b/;

/**
 * All id-shaped tokens in a text, with ranges expanded and shorthand tails resolved, in order of appearance,
 * de-duplicated. The caller decides which ones exist.
 * @param {string} text
 * @returns {string[]}
 */
export function extractIds(text) {
  if (!text) return [];
  const out = [];
  const seen = new Set();
  const add = (id) => {
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  };
  for (const m of text.matchAll(RANGE)) {
    const [, base, k1, a, k2, b] = m;
    const from = Number(a);
    const to = Number(b);
    if (to >= from && to - from <= 40) {
      for (let n = from; n <= to; n += 1) add(`${base}-${k2 && k2 !== k1 && n === to ? k2 : k1}${n}`);
    }
  }
  for (const m of text.matchAll(ID_TOKEN)) {
    const id = m[0];
    add(id);
    // Shorthand tail: "CT-10-F1, F3, F4" → CT-10-F3, CT-10-F4 (base = id minus its last F/CR segment).
    const base = /^(.*)-(?:F|CR)\d+$/.exec(id)?.[1];
    if (!base) continue;
    let rest = text.slice(m.index + id.length);
    for (;;) {
      const t = SHORTHAND_TAIL.exec(rest);
      if (!t) break;
      add(`${base}-${t[2]}${t[3]}`);
      rest = rest.slice(t[0].length);
    }
  }
  return out;
}

/** The first dash segment of an id (`P1`, `ENV`, `MOCKS`) or `L` for decision-derived ids (`L503-F1`). */
export function idFamily(id) {
  if (/^L\d/.test(id)) return 'L';
  return id.split('-')[0];
}
