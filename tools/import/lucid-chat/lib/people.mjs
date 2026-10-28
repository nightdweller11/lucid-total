/** Workstream table of docs/13-implementation-plan.md §1 → worker agent roles. */
import { splitRow, isSeparator } from './table.mjs';

export function parseWorkstreamTable(md) {
  const sec = /##\s*1\.\s*Workstreams[\s\S]*?(?=\n##\s)/.exec(md)?.[0] ?? '';
  const out = [];
  for (const line of sec.split('\n')) {
    if (!line.trimStart().startsWith('|')) continue;
    const c = splitRow(line);
    if (isSeparator(c) || c[0] === 'ID') continue;
    const id = c[0].replace(/\*/g, '').trim();
    if (!/^(?:[A-H]|E1|E2)$/.test(id)) continue;
    out.push({ id, name: c[1], owns: c[2], consumes: c[3] });
  }
  return out;
}
