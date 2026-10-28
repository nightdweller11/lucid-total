#!/usr/bin/env node
// @ts-check
/**
 * Extracts the real history of Lucid Chat's build (docs/15-checklist.md rows and docs/09-decision-log.md entries)
 * from the Lucid Chat repository's git history, as the reference dataset for the living map simulation.
 *
 *   node gen/extract.mjs --repo ~/Projects/lucid/lucid > data/lucid-chat.json
 *
 * Every row of the checklist is a building; its first appearance is its birth; every change of its status word is
 * a transition. Every numbered decision (L<n>) is a monument, born when its line first appears. No task text beyond
 * a short title is kept, no names of people, no secrets: the output is safe to publish with the mocks.
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
const repo = path.resolve((args[args.indexOf('--repo') + 1] || '~/Projects/lucid/lucid').replace(/^~/, os.homedir()));
const git = (/** @type {string[]} */ a) => {
  const r = spawnSync('git', a, { cwd: repo, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`);
  return r.stdout;
};
const commits = (/** @type {string} */ file) =>
  git(['log', '--reverse', '--format=%H\t%aI', '--', file]).trim().split('\n').filter(Boolean)
    .map((l) => { const [h, iso] = l.split('\t'); return { h, t: Date.parse(iso) }; });

const STATUS = /^(todo|brief|doing|review|done|blocked|partial|dropped|merged|superseded|withdrawn|deferred|open|closed|pending|planned|in progress|n\/a|na|—|-)/i;
const norm = (/** @type {string} */ s) => {
  const w = (STATUS.exec(s.trim().replace(/^\*+|`/g, '')) || [''])[0].toLowerCase();
  if (!w || w === '—' || w === '-' || w === 'n/a' || w === 'na') return 'todo';
  if (w === 'merged' || w === 'closed') return 'done';
  if (w === 'in progress' || w === 'open' || w === 'pending' || w === 'partial') return 'doing';
  if (w === 'planned') return 'todo';
  if (w === 'dropped' || w === 'superseded' || w === 'withdrawn' || w === 'deferred') return 'dropped';
  return w;
};
const clean = (/** @type {string} */ s) => s.replace(/`/g, '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const idsIn = (/** @type {string} */ s) => Array.from(new Set((s.match(/\b(?:CT|P[0-4]|ENV|MOCKS|L\d+|BETA|AI|ONDEVICE|FS|EVAL|REL|SEC)[A-Z0-9-]*\b/g) || [])
  .map((x) => x.replace(/-+$/, '')).filter((x) => /\d/.test(x) && x.length > 3)));

// ---- the checklist ----
/** @type {Map<string, any>} */
const tasks = new Map();
/** @type {Map<number, string>} */
const waveModel = new Map();
let n = 0;
for (const c of commits('docs/15-checklist.md')) {
  const text = git(['show', `${c.h}:docs/15-checklist.md`]);
  let phase = '';
  let cols = /** @type {string[]} */ ([]);
  for (const raw of text.split('\n')) {
    if (raw.startsWith('## ')) { phase = /^## (CT|P[0-4]) /.test(raw) ? raw.slice(3, 5).trim() : 'FU'; continue; }
    if (raw.startsWith('> **Last updated:**')) {
      for (const m of raw.matchAll(/wave (\d+)[^,)]*?,\s*(Opus 5\.5|Fable 5\.1|Sonnet 4\.5|Sonnet 5|Sonnet)/g)) waveModel.set(Number(m[1]), m[2]);
      continue;
    }
    if (!raw.startsWith('| ')) continue;
    const cells = raw.split('|').slice(1, -1).map((x) => x.trim());
    if (cells[0] === 'ID') { cols = cells; continue; }
    if (/^:?-+:?$/.test(cells[0])) continue;
    const id = clean(cells[0]).split(/\s/)[0];
    if (!/^[A-Z][A-Z0-9-]+\d/.test(id) && !/^[A-Z]+-[A-Z0-9-]+$/.test(id)) continue;
    const get = (/** @type {string} */ name) => { const i = cols.indexOf(name); return i >= 0 ? cells[i] || '' : ''; };
    const title = clean(get('Task') || get('Description')).slice(0, 160);
    const ws = clean(get('WS')).replace(/\*/g, '') || '?';
    const statusText = get('Status');
    const status = statusText ? norm(statusText) : null;
    const dep = idsIn(clean(get('Depends')));
    const origin = clean(get('Origin')).slice(0, 60);
    const wave = (statusText.match(/wave (\d+)/) || [])[1];
    const walk = /^y/i.test(get('Walk'));
    let r = tasks.get(id);
    if (!r) {
      r = { id, t: title, ws, ph: phase || 'FU', dep, origin: origin || undefined, walk: walk || undefined, born: c.t, st: [[c.t, status || 'todo']], seen: c.t };
      tasks.set(id, r);
    } else {
      r.seen = c.t;
      if (title) r.t = title;
      if (ws !== '?') r.ws = ws;
      if (dep.length) r.dep = dep;
      if (walk) r.walk = true;
      if (status && r.st[r.st.length - 1][1] !== status) {
        const prev = r.st[r.st.length - 2];
        // a transient (A -> B -> A within two hours) is table noise, not history: drop it
        if (prev && prev[1] === status && c.t - r.st[r.st.length - 1][0] < 2 * 3600e3) r.st.pop();
        else r.st.push([c.t, status]);
      }
    }
    if (wave) { r.wave = Number(wave); }
  }
  n++;
  if (n % 100 === 0) process.stderr.write(`checklist ${n} commits, ${tasks.size} rows\n`);
}
for (const r of tasks.values()) if (r.wave && waveModel.has(r.wave)) r.model = waveModel.get(r.wave);

// ---- the decisions ----
/** @type {Map<number, any>} */
const decisions = new Map();
for (const c of commits('docs/09-decision-log.md')) {
  const text = git(['show', `${c.h}:docs/09-decision-log.md`]);
  for (const raw of text.split('\n')) {
    const m = /^- L(\d+)(?:\s*\(([0-9]{4}-[0-9]{2}-[0-9]{2})[^)]*\))?\s*[:—-]?\s*(.*)$/.exec(raw);
    if (!m) continue;
    const num = Number(m[1]);
    if (decisions.has(num)) continue;
    const body = m[3];
    const bold = /\*\*([^*]+)\*\*/.exec(body);
    const who = /\((?:[0-9-]+,\s*)?(owner|lead)/i.exec(raw);
    decisions.set(num, {
      n: num,
      t: clean(bold ? bold[1] : body).replace(/[.:]$/, '').slice(0, 110),
      born: m[2] ? Math.max(Date.parse(`${m[2]}T12:00:00+02:00`), 0) : c.t,
      who: who ? who[1].toLowerCase() : undefined,
      refs: idsIn(body).filter((x) => !x.startsWith('L')).slice(0, 12),
    });
  }
}
// a decision dated by its text may predate the commit; keep whichever is earlier than the commit but not absurd
const out = {
  source: 'Lucid Chat (nightdweller/lucid), docs/15-checklist.md and docs/09-decision-log.md, git history',
  extracted: new Date().toISOString(),
  tasks: Array.from(tasks.values()).sort((a, b) => a.born - b.born),
  decisions: Array.from(decisions.values()).sort((a, b) => a.born - b.born),
};
process.stderr.write(`${out.tasks.length} tasks, ${out.decisions.length} decisions\n`);
process.stdout.write(JSON.stringify(out));
