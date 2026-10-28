/**
 * Secondary sources: task briefs (docs/briefs), walkthrough and test reports (docs/testing/**), and the
 * owner's accounts checklist (docs/07a-accounts-to-open.md).
 */
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { splitRow, isSeparator } from './table.mjs';
import { extractIds } from './ids.mjs';
import { waveKey } from './evidence.mjs';

const MODEL = /\b(Opus|Fable|Sonnet|Haiku)\s+(\d+(?:\.\d+)?)\b/;

/** Wave key of a brief from its file name: wave30-C → "30-C", waveAI-2 → "AI-2", beta-ai-1 → "BETA-AI-1". */
export function briefWave(file) {
  const stem = basename(file, '.md');
  const m = /^wave(\d+)-([A-Za-z0-9]+)$/.exec(stem);
  if (m) return waveKey(m[1], m[2].toUpperCase());
  const n = /^wave([A-Za-z]+-?\d+)$/.exec(stem);
  if (n) return n[1].toUpperCase();
  return stem.toUpperCase();
}

/**
 * The goal of a brief. The template has a "## Goal" section; the briefs actually written put the goal in the
 * title's parenthetical and the first paragraph ("Launched … Rows: … Scope:"). Both are read.
 */
export function briefGoal(md) {
  const sec = /^##\s*Goal\s*\n+([\s\S]*?)(?:\n##\s|$)/m.exec(md)?.[1]?.trim();
  if (sec) return sec.slice(0, 1200);
  const title = /^#\s*(.+)$/m.exec(md)?.[1] ?? '';
  const paren = /\((.+)\)\s*$/.exec(title)?.[1] ?? '';
  const body = md.replace(/^#.*$/m, '').trim();
  const para = (body.split(/\n\s*\n/)[0] ?? '').replace(/\s+/g, ' ').trim();
  const goal = [paren, para].filter(Boolean).join(' — ');
  return goal.length > 1200 ? `${goal.slice(0, 1197)}…` : goal;
}

/**
 * Index the briefs.
 * @param {string} root source repository
 * @param {(p: string) => string} read sanitised reader
 * @param {(id: string) => boolean} exists
 */
export function indexBriefs(root, read, exists) {
  const dir = join(root, 'docs/briefs');
  if (!existsSync(dir)) return [];
  const out = [];
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith('.md') || f === 'README.md' || f.startsWith('_')) continue;
    const path = `docs/briefs/${f}`;
    const md = read(path);
    const title = /^#\s*(.+)$/m.exec(md)?.[1]?.trim() ?? f;
    const head = md.split('\n').slice(0, 12).join('\n');
    // Rows in scope: the "Rows:" / "Row:" sentences and the title; else the first paragraph.
    const rowSentences = [...md.matchAll(/\bRows?\b[^:\n]{0,40}:\s*([^\n]*?)(?:\.\s|\n|$)/g)].map((m) => m[1]).join(' ');
    let scope = extractIds(`${title} ${rowSentences}`).filter(exists);
    if (!scope.length) scope = extractIds(head).filter(exists);
    const mentions = extractIds(md).filter(exists).filter((id) => !scope.includes(id));
    out.push({
      path,
      wave: briefWave(f),
      title,
      date: /\b(20\d\d-\d\d-\d\d)\b/.exec(head)?.[1] ?? null,
      model: MODEL.exec(head)?.[0] ?? null,
      goal: briefGoal(md),
      scope,
      mentions,
    });
  }
  return out;
}

/**
 * Index walkthrough reports and other test reports: the ids each covers, read from the title, the header
 * lines (Date / Build / Tester) and the file name.
 * @param {string} root @param {(p:string)=>string} read @param {(id:string)=>boolean} exists
 */
export function indexReports(root, read, exists) {
  const out = [];
  const dirs = [
    ['docs/testing/walkthroughs', 'walkthrough'],
    ['docs/testing/load', 'report'],
    ['docs/testing/evals', 'report'],
    ['docs/testing/gates', 'report'],
    ['docs/testing/rc', 'report'],
    ['docs/testing/reviews', 'report'],
  ];
  for (const [rel, type] of dirs) {
    const dir = join(root, rel);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).sort()) {
      if (!f.endsWith('.md') || f === 'README.md' || f === 'TEMPLATE.md') continue;
      const path = `${rel}/${f}`;
      const md = read(path);
      const lines = md.split('\n');
      const title = /^#\s*(.+)$/m.exec(md)?.[1]?.trim() ?? f;
      const header = lines.slice(0, 8).join('\n');
      const stem = basename(f, '.md');
      const covers = [...new Set([...extractIds(`${stem} ${title}`), ...extractIds(header)])].filter(exists);
      const media = join(dir, stem);
      out.push({
        path,
        type,
        kind: type === 'walkthrough' ? 'walkthrough' : rel.split('/').pop(),
        title,
        date: /\b(20\d\d-\d\d-\d\d)\b/.exec(header)?.[1] ?? /^(20\d\d-\d\d-\d\d)/.exec(f)?.[1] ?? null,
        stem,
        covers,
        has_media_folder: existsSync(media) && statSync(media).isDirectory(),
      });
    }
  }
  return out;
}

const MARK_STATE = { '☐': 'todo', '◐': 'doing', '✓': 'done', '☑': 'done', '✔': 'done', '—': 'done' };

/** Slug for an account id: "**Apple Developer Program** ($99/yr)" → APPLE-DEVELOPER-PROGRAM. */
export function slug(s) {
  return s
    .replace(/\*\*/g, '')
    .replace(/\(.*?\)/g, '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

/**
 * docs/07a → account items (the vendor tables of §A and §B) and chore items (the numbered step tables
 * §B1, §B2, §B3), with the checklist ids each one names.
 * @param {string} md @param {(id:string)=>boolean} exists
 */
export function parseAccounts(md, exists) {
  const items = [];
  const lines = md.split('\n');
  let section = '';
  let sectionCode = '';
  let header = null;
  const used = new Set();
  lines.forEach((line, i) => {
    const h = /^(#{2,3})\s+(.+)$/.exec(line);
    if (h) {
      section = h[2].trim();
      sectionCode = /^([A-D]\d?)\./.exec(section)?.[1] ?? slug(section).slice(0, 8);
      header = null;
      return;
    }
    if (!line.trimStart().startsWith('|')) return;
    const cells = splitRow(line);
    if (isSeparator(cells)) return;
    if (cells[0] === '✓' || cells[0] === '#') {
      header = cells;
      return;
    }
    if (!header) return;
    const text = cells.join(' | ');
    const refs = extractIds(text).filter(exists);
    if (header[0] === '✓') {
      const name = /\*\*(.+?)\*\*/.exec(cells[1])?.[1] ?? cells[1];
      let id = `ACCT-${slug(name)}`;
      while (used.has(id)) id += '-2';
      used.add(id);
      const mark = cells[0];
      const notUsed = mark === '—';
      items.push({
        id,
        aliases: [id],
        kind: 'account',
        title: name,
        vendor: name,
        state: notUsed ? 'done' : MARK_STATE[mark] ?? 'todo',
        resolution: notUsed ? 'closed' : null,
        state_text: notUsed ? 'not used' : mark,
        why: cells[2] ?? null,
        sign_up: cells[3] ?? null,
        vault_fields_text: cells[4] ?? null,
        section,
        references: refs,
        owner: 'owner',
        source: { file: 'docs/07a-accounts-to-open.md', line: i + 1 },
      });
    } else {
      // Step markers: "1", "4b", "—" (a not-used vendor line, keyed by its line number).
      const marker = /^(\d+)([a-z]?)$/.exec(cells[0].trim());
      const n = marker ? `${marker[1].padStart(2, '0')}${marker[2].toUpperCase()}` : `L${i + 1}`;
      let id = `CHORE-07A-${sectionCode}-${n}`;
      while (used.has(id)) id += '-2';
      used.add(id);
      const where = cells[1] ?? '';
      const what = cells[2] ?? '';
      const notUsed = /\bnot used\b/i.test(`${where} ${what}`);
      const st = notUsed ? 'done' : /\*\*done\b|—\s*\*\*done|\bdone\b \d{4}-|\bdone 20/.test(`${where} ${what}`.toLowerCase())
        ? 'done'
        : /\bto do\b|\btodo\b/i.test(`${where} ${what}`)
          ? 'todo'
          : /deferred|later/i.test(`${where} ${what}`)
            ? 'todo'
            : 'todo';
      items.push({
        id,
        aliases: [id],
        kind: 'chore',
        kind_reason: 'step in docs/07a (human action)',
        title: `${where.replace(/\*\*/g, '').split(' — ')[0]}: ${what.replace(/\*\*/g, '').split(/[.;]/)[0]}`.slice(0, 200),
        state: st,
        resolution: notUsed ? 'closed' : st === 'done' ? 'done' : null,
        state_text: notUsed ? 'not used' : /done|to do|deferred|later/i.exec(`${where} ${what}`)?.[0] ?? 'not stated in docs/07a',
        steps: [what],
        what_to_paste_back: cells[3] ?? null,
        section,
        references: refs,
        assignees: ['owner'],
        source: { file: 'docs/07a-accounts-to-open.md', line: i + 1 },
      });
    }
  });
  const mentioned = new Set(extractIds(md).filter(exists));
  return { items, mentioned };
}
