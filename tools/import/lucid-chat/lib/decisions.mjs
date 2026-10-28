/**
 * Decisions: docs/09-decision-log.md (entries L<n>, owner answers O<n>, the "Open decisions" list), ADRs in
 * docs/decisions/, and the owner's answers from the status site (decisions-catalogue.json, decisions-answers.json).
 *
 * Entry shapes in the log:
 *   | L1 | Decision | Where |                      (tables under "Lead decisions taken … (pending owner confirmation)")
 *   | O4 | Owner decision | Lead interpretation | Status |   (tables under "Owner answers …")
 *   - L29: text                                    (date and type from the section heading)
 *   - L64 (lead, 2026-10-19, pending owner confirmation): text
 *   - L478 (2026-10-26, lead, from wave 67 A's verification) — text
 *   - **L123** (owner, 2026-10-20): text
 */
import { splitRow, isSeparator } from './table.mjs';
import { extractIds } from './ids.mjs';

const ENTRY_LINE = /^\s*[-*]\s+\**(L\d{1,4}[a-z]?)\**\s*(\(([^)]*(?:\([^)]*\)[^)]*)*)\))?\s*(?::|—|–|-)?\s*([\s\S]*)$/;

/** First sentence of a text, markdown emphasis removed, at most 300 characters. */
export function firstSentence(text) {
  const plain = (text ?? '').replace(/\*\*|__|`/g, '').trim();
  const m = /^([\s\S]{20,}?[.!?])(?:\s|$)/.exec(plain);
  const s = (m ? m[1] : plain).trim();
  return s.length > 300 ? `${s.slice(0, 297)}…` : s;
}

/**
 * Decision type from the entry's parenthetical and its section heading.
 * @returns {'owner instruction'|'owner decision'|'lead decision pending'|'lead decision'}
 */
export function decisionType(paren, heading, text) {
  const p = (paren ?? '').toLowerCase();
  const h = (heading ?? '').toLowerCase();
  if (/\bowner\b/.test(p) && !/\blead\b/.test(p.split(/[,;]/)[0] ?? '') ) {
    return /\b(?:decid|answer|chose|choice|picked|accepted|approved|rejected|reversed)/i.test(`${p} ${(text ?? '').slice(0, 300)}`)
      ? 'owner decision'
      : 'owner instruction';
  }
  if (/pending/.test(p)) return 'lead decision pending';
  if (/\blead\b/.test(p)) return 'lead decision';
  if (/\bowner and lead\b/.test(p)) return 'owner decision';
  if (/pending owner confirmation/.test(h)) return 'lead decision pending';
  if (/owner decisions?\b|owner answers/.test(h)) return 'owner decision';
  if (/owner instruction/.test(h)) return 'owner instruction';
  return 'lead decision';
}

/** A date (YYYY-MM-DD) inside a string, or null. */
const dateIn = (s) => /\b(20\d\d-\d\d-\d\d)\b/.exec(s ?? '')?.[1] ?? null;

/**
 * Parse the decision log.
 * @param {string} md
 * @returns {{ entries: object[], open: object[], resolved: object[] }}
 */
export function parseDecisionLog(md) {
  const lines = md.split('\n');
  const entries = [];
  const open = [];
  const resolved = [];
  let heading = '';
  let headingDate = null;
  let inOpen = false;
  let tableHeader = null;
  let current = null;
  const seenO = new Map();

  const finish = () => {
    if (current) entries.push(current);
    current = null;
  };

  lines.forEach((line, i) => {
    if (/^#{2,3}\s/.test(line)) {
      finish();
      const level = line.startsWith('### ') ? 3 : 2;
      if (level === 2) {
        heading = line.replace(/^#+\s*/, '').trim();
        headingDate = dateIn(heading);
        inOpen = /^Open decisions/i.test(heading);
      } else {
        heading = `${heading.split(' » ')[0]} » ${line.replace(/^#+\s*/, '').trim()}`;
      }
      tableHeader = null;
      return;
    }
    if (inOpen) {
      if (/^Resolved\b/.test(line.trim())) {
        // "Resolved 2026-10-24 (L437): 7 (no vendor: …), 0ek (device-resident …), …"
        const by = /\((L\d+[a-z]?)\)/.exec(line)?.[1] ?? null;
        const date = dateIn(line);
        for (const seg of line.split(/(?:Resolved\b)/).slice(1)) {
          const segBy = /\((L\d+[a-z]?)\)/.exec(seg)?.[1] ?? by;
          const segDate = dateIn(seg) ?? date;
          const body = seg.replace(/^[^:]*:\s*/, '');
          for (const m of body.matchAll(/(?:^|[,;]\s*|\band\s+)(0[a-z]{1,3}|\d{1,2})\s*\(/g)) {
            resolved.push({ id: m[1], by: segBy, date: segDate, line: i + 1, text: seg.trim().slice(0, 400) });
          }
        }
        return;
      }
      if (line.trimStart().startsWith('|')) {
        const cells = splitRow(line);
        if (isSeparator(cells)) return;
        if (cells[0] === '#') {
          tableHeader = cells;
          return;
        }
        if (!tableHeader) return;
        const [id, from, kind, question, recommendation, row] = cells;
        open.push({ id, from, kind, question, recommendation, row, line: i + 1 });
      }
      return;
    }
    const em = ENTRY_LINE.exec(line);
    if (em) {
      finish();
      const [, id, , paren, rest] = em;
      current = { id, paren: paren ?? null, text: rest.trim(), heading, headingDate, line: i + 1, shape: 'list' };
      return;
    }
    if (line.trimStart().startsWith('|')) {
      finish();
      const cells = splitRow(line);
      if (isSeparator(cells)) return;
      if (cells[0] === '#') {
        tableHeader = cells;
        return;
      }
      const id = cells[0].replace(/\*/g, '').trim();
      if (/^L\d+[a-z]?$/.test(id)) {
        entries.push({ id, paren: null, text: cells.slice(1).join(' — '), where: cells[2] ?? null, heading, headingDate, line: i + 1, shape: 'table' });
      } else if (/^O\d+/.test(id)) {
        // Owner answers O<n>; "O19 (mocks)" is a second O19 in the log, kept as O19-mocks.
        let oid = id.replace(/\s*\((\w+)\)$/, '-$1');
        if (seenO.has(oid)) oid = `${oid}-${seenO.get(oid) + 1}`;
        seenO.set(oid, (seenO.get(oid) ?? 0) + 1);
        entries.push({
          id: oid,
          paren: 'owner',
          text: cells.slice(1).join(' — '),
          status: tableHeader?.includes('Status') ? cells[tableHeader.indexOf('Status')] : null,
          heading,
          headingDate,
          line: i + 1,
          shape: 'table',
        });
      }
      return;
    }
    // Continuation of a list entry: indented sub-bullets or wrapped lines directly after it.
    if (current && line.trim() && (/^\s{2,}/.test(line) || !/^[-*#|]/.test(line.trim()))) {
      current.text += `\n${line.trim()}`;
      return;
    }
    if (!line.trim()) finish();
  });
  finish();
  return { entries, open, resolved };
}

/**
 * Turn parsed entries into decision items.
 * @param {ReturnType<typeof parseDecisionLog>} log
 * @param {{ exists: (id: string) => boolean }} ctx
 */
export function decisionItems(log, ctx) {
  const items = [];
  const openFrom = new Set();
  for (const o of log.open) for (const id of extractIds(o.from)) openFrom.add(id);
  // L425 (owner, 2026-10-24): every `confirm` card was closed as the lead's decision, so a pending lead
  // decision dated on or before that day is treated as confirmed, unless an open card still cites it.
  const confirmCutoff = '2026-10-24';
  for (const e of log.entries) {
    const date = dateIn(e.paren) ?? e.headingDate;
    const type = e.id.startsWith('O') ? 'owner decision' : decisionType(e.paren, e.heading, e.text);
    let state = 'closed';
    let stateReason = 'recorded';
    if (type === 'lead decision pending') {
      if (openFrom.has(e.id)) {
        state = 'open';
        stateReason = 'cited by an open card in §Open decisions';
      } else if (date && date <= confirmCutoff) {
        stateReason = 'pending confirmation, closed by the L425 rule (confirm rows closed as the lead\'s)';
      } else {
        state = 'open';
        stateReason = 'pending the owner\'s confirmation';
      }
    }
    if (e.status && /awaiting|pending|open/i.test(e.status)) {
      state = 'open';
      stateReason = `status: ${e.status}`;
    }
    if (/\bsuperseded\b/i.test(e.text.slice(0, 200))) stateReason += '; marked superseded';
    const refs = extractIds(e.text).filter((id) => id !== e.id && ctx.exists(id));
    items.push({
      id: e.id,
      aliases: [e.id],
      kind: 'decision',
      decision_kind: e.id.startsWith('O') ? 'owner answer' : 'log entry',
      decision_type: type,
      date,
      title: firstSentence(e.text),
      summary: firstSentence(e.text),
      text: e.text,
      where: e.where ?? null,
      status_text: e.status ?? null,
      state,
      state_reason: stateReason,
      section: e.heading,
      references: refs,
      source: { file: 'docs/09-decision-log.md', line: e.line },
    });
  }
  // Open-decision cards (the owner's inbox before Lucid Total).
  for (const o of log.open) {
    items.push({
      id: `OD-${o.id}`,
      aliases: [o.id],
      kind: 'decision',
      decision_kind: 'open decision',
      decision_type: /confirm/i.test(o.kind) ? 'lead decision pending' : 'owner decision',
      open_kind: o.kind,
      date: null,
      title: firstSentence(o.question),
      summary: firstSentence(o.question),
      text: o.question,
      recommendation: o.recommendation,
      from_text: o.from,
      row_text: o.row,
      state: 'open',
      state_reason: 'listed in §Open decisions',
      references: [...new Set([...extractIds(o.from), ...extractIds(o.row), ...extractIds(o.question)])].filter(ctx.exists),
      source: { file: 'docs/09-decision-log.md', line: o.line },
    });
  }
  const openIds = new Set(log.open.map((o) => o.id));
  const seenResolved = new Set();
  for (const r of log.resolved) {
    if (openIds.has(r.id) || seenResolved.has(r.id)) continue;
    seenResolved.add(r.id);
    items.push({
      id: `OD-${r.id}`,
      aliases: [r.id],
      kind: 'decision',
      decision_kind: 'open decision',
      decision_type: 'owner decision',
      date: r.date,
      title: `Open decision ${r.id} (resolved)`,
      summary: r.text,
      text: r.text,
      state: 'closed',
      state_reason: r.by ? `resolved by ${r.by}` : 'resolved',
      resolved_by: r.by,
      references: r.by && ctx.exists(r.by) ? [r.by] : [],
      source: { file: 'docs/09-decision-log.md', line: r.line },
    });
  }
  return items;
}

/**
 * Parse an ADR file into a decision item of kind ADR.
 * @param {string} md @param {string} path
 */
export function adrItem(md, path, ctx) {
  const title = /^#\s*(ADR-\d{4})\s*[:—-]\s*(.+)$/m.exec(md);
  const id = title?.[1] ?? /(\d{4})/.exec(path)?.[1] ? `ADR-${/(\d{4})/.exec(path)[1]}` : path;
  const statusLine = /^\*\*Status:?\*\*:?\s*(.+)$/m.exec(md)?.[1]?.trim() ?? null;
  const status = (statusLine ?? '').split(/[·;,(]/)[0].trim().toLowerCase() || 'unknown';
  const state = /proposed|draft/.test(status) ? 'open' : 'closed';
  const decision = /##\s*Decision\s*\n+([\s\S]*?)(?:\n##\s|$)/.exec(md)?.[1]?.trim() ?? '';
  return {
    id,
    aliases: [id],
    kind: 'decision',
    decision_kind: 'ADR',
    decision_type: 'architecture decision',
    date: dateIn(statusLine),
    title: title?.[2]?.trim() ?? id,
    summary: firstSentence(decision),
    text: decision,
    adr_status: status,
    status_text: statusLine,
    state,
    state_reason: `ADR status: ${status}`,
    path,
    references: extractIds(md).filter((r) => r !== id && ctx.exists(r)),
    source: { file: path, line: 1 },
  };
}

/**
 * The owner's answers from the status site, linked to the open-decision items.
 * @param {object} catalogue decisions-catalogue.json
 * @param {object} answers decisions-answers.json
 * @param {object|null} page decisions.json (card titles for answers to cards no longer in the catalogue)
 */
export function ownerAnswers(catalogue, answers, page) {
  const cards = new Map();
  for (const g of catalogue?.groups ?? []) {
    for (const it of g.items ?? []) cards.set(it.id, { ...it, group: g.id, group_title: g.title });
  }
  for (const c of page?.cards ?? []) if (!cards.has(c.id)) cards.set(c.id, { ...c, group_title: null });
  const out = [];
  for (const a of answers?.items ?? []) {
    const card = cards.get(a.id) ?? null;
    out.push({
      id: `ANS-${a.id}`,
      decision: `OD-${a.id}`,
      card_id: a.id,
      card_title: card?.title ?? null,
      card_group: card?.group_title ?? null,
      card_members: card?.members ?? [],
      choice: a.choice,
      notes: a.notes ?? null,
      decided_at: a.decidedAt ?? null,
      still_open: Boolean(a.open),
      source: { file: 'docs/status/decisions-answers.json' },
    });
  }
  const catalogueCards = [];
  for (const [id, c] of cards) {
    catalogueCards.push({
      id: `CARD-${id}`,
      decision: `OD-${id}`,
      group: c.group_title ?? null,
      title: c.title,
      context: c.context ?? null,
      recommendation: c.recommendation ?? null,
      members: c.members ?? [],
      in_catalogue: Boolean(catalogue?.groups?.some((g) => g.items?.some((i) => i.id === id))),
    });
  }
  return { answers: out, cards: catalogueCards, hidden: catalogue?.hidden?.ids ?? [] };
}
