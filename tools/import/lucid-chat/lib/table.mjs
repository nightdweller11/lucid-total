/**
 * Markdown table helpers. The checklist's cells contain code spans with pipes in them (`a|b`) and escaped
 * pipes (\|); GitHub renders both inside the cell, so the splitter must too.
 */

/**
 * Split one Markdown table line into trimmed cells. A `|` splits only outside a code span and when not
 * escaped. A code span opens with a run of backticks and closes with a run of the same length.
 * @param {string} line
 * @returns {string[]}
 */
export function splitRow(line) {
  const s = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = [];
  let cur = '';
  let fence = ''; // the backtick run that opened the current code span, '' outside code
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (ch === '\\' && s[i + 1] === '|') {
      cur += '|';
      i += 1;
      continue;
    }
    if (ch === '`') {
      let j = i;
      while (s[j] === '`') j += 1;
      const run = s.slice(i, j);
      if (!fence) fence = run;
      else if (fence === run) fence = '';
      cur += run;
      i = j - 1;
      continue;
    }
    if (ch === '|' && !fence) {
      cells.push(cur.trim());
      cur = '';
      continue;
    }
    cur += ch;
  }
  cells.push(cur.trim());
  // A code span left open at the end of the line was not a span (a stray backtick): re-split plainly.
  if (fence) return s.split(/(?<!\\)\|/).map((c) => c.trim());
  return cells;
}

/** True for the `|---|---|` separator line of a table. */
export function isSeparator(cells) {
  return cells.every((c) => /^:?-{2,}:?$/.test(c) || c === '');
}
