#!/usr/bin/env node
// @ts-check
/**
 * Shoots stills of the living map's second pass with Playwright (global install).
 *   node gen/shoot.mjs                 all frames in FRAMES -> shots/<name>.webp
 *   node gen/shoot.mjs name1 name2     only those
 *   node gen/shoot.mjs --smoke         one frame, print console errors
 * Frames are URL states plus a few scripted moments; every still is reproducible (docs/17 LM-R-5).
 */
import { mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

let pw; try { pw = await import('playwright'); } catch { pw = await import('/usr/local/lib/node_modules/playwright/index.mjs'); }
const { chromium } = pw;
let exe = process.env.PW_CHROMIUM;
if (!exe) { const c = path.join(os.homedir(), 'Library/Caches/ms-playwright'); try { const d = fs.readdirSync(c).filter((x) => /^chromium-\d+$/.test(x)).sort().pop(); const sub = fs.readdirSync(path.join(c, d)).find((x) => x.startsWith('chrome-mac')); const app = fs.readdirSync(path.join(c, d, sub)).find((x) => x.endsWith('.app')); const mac = path.join(c, d, sub, app, 'Contents/MacOS'); exe = path.join(mac, fs.readdirSync(mac)[0]); } catch { exe = undefined; } }
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const URL = 'file://' + path.join(ROOT, 'index.html');
mkdirSync(path.join(ROOT, 'shots'), { recursive: true });

const biggestLand = () => { const L = [...LM.vis.lands.values()].sort((a, b) => b.n - a.n)[0]; LM.cam = { x: L.cx + 4, y: L.cy + 2, k: 16 }; LM.dirty(); };
const biggestDistrict = () => { const D = [...LM.vis.districts.values()].sort((a, b) => b.n - a.n)[0]; LM.cam = { x: D.cx + 2, y: D.cy + 1, k: 36 }; LM.dirty(); };
const stuckDistrict = () => { const D = [...LM.vis.districts.values()].sort((a, b) => (b.blocked + b.asks) - (a.blocked + a.asks) || b.n - a.n)[0]; LM.cam = { x: D.cx + 1.5, y: D.cy + 1, k: 68 }; LM.dirty(); };
const askedDistrict = () => { const D = [...LM.vis.districts.values()].sort((a, b) => b.asks - a.asks || b.blocked - a.blocked || b.n - a.n)[0]; LM.cam = { x: D.cx + 1.5, y: D.cy + 1, k: 44 }; LM.dirty(); };
const hoverFirst = async (p) => { const pt = await p.evaluate(() => { const v = LM.vis.items.filter((v) => v.it && v.sx && v.sx > 300 && v.sx < LM.W - 450 && v.sy > 200 && v.sy < LM.H - 200).sort((a, b) => b.it.s - a.it.s)[0]; return v ? [v.sx, v.top] : null; }); if (pt) { await p.mouse.move(pt[0], pt[1]); await p.waitForTimeout(200); } };
/** @type {Record<string, { q: string, w?: number, h?: number, live?: boolean, after?: (page: any) => Promise<void> }>} */
export const FRAMES = {
  // Lucid Chat, the real log: the Now view by depth
  'now-sky': { q: 'd=lucid&lens=dept' },
  'now-land': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(biggestLand) },
  'now-district': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(askedDistrict) },
  'now-street': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(stuckDistrict) },
  'now-street-hover': { q: 'd=lucid&lens=dept', after: async (p) => { await p.evaluate(stuckDistrict); await p.waitForTimeout(200); await hoverFirst(p); } },
  'now-task-view': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => { const v = LM.vis.items.filter((v) => v.it && v.st.done && v.it.children.length >= 2 && v.it.s >= 3).sort((a, b) => b.it.b - a.it.b)[0] || LM.vis.items.filter((v) => v.it && v.st.done && v.it.s >= 4)[0]; LM.cam = { x: v.x, y: v.y + 0.6, k: 64 }; LM.select(v.it); }) },
  'now-task-view-rising': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => { const v = LM.vis.items.filter((v) => v.it && (v.st.s === 'review' || v.st.s === 'doing') && v.it.s >= 3).sort((a, b) => b.it.b - a.it.b)[0]; LM.cam = { x: v.x, y: v.y + 0.6, k: 64 }; LM.select(v.it); }) },
  'now-ask-view': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => { const a = LM.ds.asks.find((x) => x.to === 'owner') || LM.ds.asks[0]; const pl = LM.askPlace(LM.ds, a, 'dept', LM.view.t); LM.select({ ask: a, it: pl.it }); }) },
  'now-project-view': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => { const P = LM.ds.projects.map((P) => ({ P, S: LM.projectStats(LM.ds, P, LM.view.t) })).filter((x) => x.P.kind === 'project' && x.S.n >= 12).sort((a, b) => (b.S.asks.length + b.S.blocked) - (a.S.asks.length + a.S.blocked) || b.S.open - a.S.open)[0].P; LM.openProject(P.id); }) },
  'now-project-on-map': { q: 'd=lucid&lens=dept', after: async (p) => { await p.evaluate(() => { const P = LM.ds.projects.filter((P) => P.kind === 'decision' && P.items.length >= 10).sort((a, b) => b.items.length - a.items.length)[0]; LM.openProject(P.id); }); await p.click('[data-a=mapProj]'); await p.waitForTimeout(900); } },
  'now-projects-list': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => LM.openProjects()) },
  'now-policies': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => LM.openPolicies()) },
  'now-land-view': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => { const L = [...LM.vis.lands.values()].sort((a, b) => b.n - a.n)[0]; LM.select({ land: L }); }) },
  'now-plaque': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => { const S = [...LM.squares.values()].sort((a, b) => b.n - a.n)[0]; LM.select({ plaque: S }); }) },
  // layers
  'layer-progress': { q: 'd=lucid&lens=dept&o=progress', after: async (p) => p.evaluate(biggestDistrict) },
  'layer-progress-sky': { q: 'd=lucid&lens=dept&o=progress' },
  'layer-cost': { q: 'd=lucid&lens=dept&o=cost', after: async (p) => p.evaluate(biggestDistrict) },
  'layer-problems': { q: 'd=lucid&lens=dept&o=problems' },
  'layer-problems-land': { q: 'd=lucid&lens=dept&o=problems', after: async (p) => p.evaluate(biggestLand) },
  'layer-deps': { q: 'd=lucid&lens=dept&o=deps', after: async (p) => p.evaluate(biggestDistrict) },
  'layer-people': { q: 'd=lucid&lens=dept&o=people', after: async (p) => p.evaluate(biggestDistrict) },
  'layer-recency': { q: 'd=lucid&lens=dept&o=recency', after: async (p) => p.evaluate(biggestLand) },
  'layer-growth': { q: 'd=lucid&lens=dept&o=growth' },
  // since, time, feed
  'since-land': { q: 'd=lucid&lens=dept&since=2026-10-26T12:00', after: async (p) => p.evaluate(biggestLand) },
  'since-district': { q: 'd=lucid&lens=dept&since=2026-10-26T12:00', after: async (p) => p.evaluate(biggestDistrict) },
  'then-sky': { q: 'd=lucid&lens=dept&t=2026-10-23T12:00&time=1' },
  'then-task-moments': { q: 'd=lucid&lens=dept&t=2026-10-25T12:00&time=1', after: async (p) => p.evaluate(() => { const v = LM.vis.items.filter((v) => v.it && v.it.st.length >= 4 && v.it.s >= 3).sort((a, b) => b.it.st.length - a.it.st.length)[0]; LM.cam = { x: v.x, y: v.y + 0.6, k: 64 }; LM.select(v.it); }) },
  'lens-projects': { q: 'd=lucid&lens=proj' },
  'lens-products': { q: 'd=lucid&lens=prod&o=progress' },
  'lens-people': { q: 'd=lucid&lens=people' },
  'trace': { q: 'd=lucid&lens=dept&trace=L425&panel=0' },
  // the shell
  'grammar': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => LM.openSheet()) },
  'lab': { q: 'd=lucid&lens=dept', after: async (p) => p.click('#labc') },
  'more': { q: 'd=lucid&lens=dept', after: async (p) => p.click('.dock [data-d=more]') },
  'sky-glass': { q: 'd=lucid&lens=dept&pt=sky', after: async (p) => p.evaluate(biggestDistrict) },
  'sky-glass-sky': { q: 'd=lucid&lens=dept&pt=sky&o=progress' },
  'aqua': { q: 'd=lucid&lens=dept&pt=aqua', after: async (p) => p.evaluate(biggestLand) },
  'hc': { q: 'd=lucid&lens=dept&hc=1', after: async (p) => p.evaluate(biggestDistrict) },
  'phone-now': { q: 'd=lucid&lens=dept', w: 390, h: 844 },
  'phone-panel': { q: 'd=lucid&lens=dept&panel=1', w: 390, h: 844 },
  'phone-street': { q: 'd=lucid&lens=dept', w: 390, h: 844, after: async (p) => p.evaluate(stuckDistrict) },
  'phone-task-view': { q: 'd=lucid&lens=dept', w: 390, h: 844, after: async (p) => p.evaluate(() => { const v = LM.vis.items.filter((v) => v.it && v.st.done && v.it.s >= 4)[0]; LM.select(v.it); }) },
  // the generated company
  'example-now': { q: 'd=example&lens=dept' },
  'example-now-land': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(biggestLand) },
  'example-now-street': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(stuckDistrict) },
  'example-ask-view': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(() => { const a = LM.ds.asks[0]; const pl = LM.askPlace(LM.ds, a, 'dept', LM.view.t); LM.select({ ask: a, it: pl.it }); }) },
  'example-project-view': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(() => { const P = LM.ds.projects.find((P) => P.id === 'teams') || LM.ds.projects[0]; LM.openProject(P.id); }) },
  'example-projects-list': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(() => LM.openProjects()) },
  'example-policies': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(() => LM.openPolicies()) },
  'example-cost': { q: 'd=example&lens=dept&o=cost' },
  'example-revenue': { q: 'd=example&lens=prod&o=revenue' },
  'example-crisis': { q: 'd=example&lens=dept&t=2025-11-20T12:00&time=1' },
  'example-crisis-street': { q: 'd=example&lens=dept&o=deps&t=2025-11-20T12:00&time=1', after: async (p) => p.evaluate(stuckDistrict) },
  'example-people': { q: 'd=example&lens=people&o=people' },
  'example-y1': { q: 'd=example&lens=dept&t=2024-12-31T12:00&time=1&panel=0' },
  'example-y2': { q: 'd=example&lens=dept&t=2025-12-31T12:00&time=1&panel=0' },
  'example-subtasks': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(() => { const v = LM.vis.items.filter((v) => v.it && v.it.children.length >= 3).sort((a, b) => b.it.b - a.it.b)[0]; LM.cam = { x: v.x, y: v.y + 0.6, k: 64 }; LM.select(v.it); }) },
  // playback
  'example-play-1': { q: 'd=example&lens=dept', live: true, after: async (p) => { await p.evaluate(() => { LM.view.reduce = false; LM.command('play from the start'); LM.view.speed = 14; }); await p.waitForTimeout(3000); } },
  'example-play-2': { q: 'd=example&lens=dept', live: true, after: async (p) => { await p.evaluate(() => { LM.view.reduce = false; LM.command('play from the start'); LM.view.speed = 30; }); await p.waitForTimeout(9000); } },
  'lucid-play': { q: 'd=lucid&lens=dept&t=2026-10-21T06:00&time=1', live: true, after: async (p) => { await p.evaluate(() => { LM.view.reduce = false; LM.view.speed = 1 / 4; LM.togglePlay(true); }); await p.waitForTimeout(2600); } },
};

const args = process.argv.slice(2);
const smoke = args.includes('--smoke');
const names = args.filter((a) => !a.startsWith('--'));
const list = smoke ? ['now-sky'] : names.length ? names : Object.keys(FRAMES);
if (!names.length && !smoke) for (const f of readdirSync(path.join(ROOT, 'shots'))) if (/\.(png|webp)$/.test(f) && !FRAMES[f.replace(/\.(png|webp)$/, '')]) unlinkSync(path.join(ROOT, 'shots', f));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
for (const name of list) {
  const F = FRAMES[name];
  if (!F) { console.error(`no frame ${name}`); continue; }
  const page = await browser.newPage({ viewport: { width: F.w || 1440, height: F.h || 900 }, deviceScaleFactor: 1.5 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${URL}?${F.q}${F.live ? '' : '&reduce=1'}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  try { if (F.after) { await F.after(page); await page.waitForTimeout(F.live ? 0 : 250); } } catch (e) { errors.push('after: ' + String(e).slice(0, 200)); }
  if (!F.live) { await page.evaluate(() => { LM.dirty(); }); await page.waitForTimeout(150); }
  const png = path.join(ROOT, 'shots', `${name}.png`);
  await page.screenshot({ path: png });
  try { execFileSync('cwebp', ['-quiet', '-q', '88', png, '-o', png.replace(/\.png$/, '.webp')]); unlinkSync(png); } catch { /* no cwebp: keep the png */ }
  const info = await page.evaluate(() => ({ lod: LM.lod, k: LM.cam.k.toFixed(1), lands: LM.vis.lands.size, items: LM.vis.items.length }));
  console.log(`${name}  k=${info.k} lod=${info.lod} lands=${info.lands} items=${info.items}${errors.length ? '  ERRORS: ' + errors.join(' | ') : ''}`);
  await page.close();
}
await browser.close();
