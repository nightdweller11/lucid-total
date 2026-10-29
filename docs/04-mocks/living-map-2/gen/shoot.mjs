#!/usr/bin/env node
// @ts-check
/**
 * Shoots stills of the living map (third pass) with Playwright (global install).
 *   node gen/shoot.mjs                 all frames in FRAMES -> shots/<name>.webp
 *   node gen/shoot.mjs name1 name2     only those
 *   node gen/shoot.mjs --smoke         one frame, print console errors
 * Frames are URL states plus scripted moments (the three levels through the same flights the buttons use).
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

// camera moves, run in the page: the same flights the zoom buttons take, snapped to their end
const snap = () => { if (LM.flight) { LM.cam = { x: LM.flight.x1, y: LM.flight.y1, k: LM.flight.k1 }; LM.flight = null; } LM.dirty(); LM.draw(performance.now()); };
const bigLand = () => { const L = [...LM.vis.lands.values()].sort((a, b) => b.n - a.n)[0]; LM.flyToLand(L.key); snap(); };
const askedLand = () => { const L = [...LM.vis.lands.values()].sort((a, b) => (b.asks * 3 + b.blocked) - (a.asks * 3 + a.blocked) || b.n - a.n)[0]; LM.flyToLand(L.key); snap(); };
const bigDistrict = () => { const D = [...LM.vis.districts.values()].filter((d) => d.built).sort((a, b) => b.n - a.n)[0]; LM.flyToDistrict(D.key); snap(); };
const askedDistrict = () => { const D = [...LM.vis.districts.values()].filter((d) => d.built >= 6).sort((a, b) => (b.asks * 4 + b.blocked * 2) - (a.asks * 4 + a.blocked * 2) || b.n - a.n)[0]; LM.flyToDistrict(D.key); snap(); };
const stuckDistrict = () => { const D = [...LM.vis.districts.values()].filter((d) => d.built >= 6).sort((a, b) => b.blocked - a.blocked || b.n - a.n)[0]; LM.flyToDistrict(D.key); snap(); };
const richDistrict = () => { const D = [...LM.vis.districts.values()].filter((d) => d.built >= 6 && d.built <= 14).sort((a, b) => (b.asks * 4 + b.blocked * 2 + b.working) - (a.asks * 4 + a.blocked * 2 + a.working))[0]; LM.flyToDistrict(D.key); LM.cam = { x: LM.flight.x1, y: LM.flight.y1, k: 175 }; LM.flight = null; LM.dirty(); LM.draw(performance.now()); };
const hoverTile = async (p) => { const pt = await p.evaluate(() => { const c = [...LM.tilePos.values()].filter((t) => t.x > 320 && t.x < LM.W - 480 && t.y > 220 && t.y < LM.H - 220).sort((a, b) => b.v.it.s - a.v.it.s)[0]; return c ? [c.x, c.y] : null; }); if (pt) { await p.mouse.move(pt[0], pt[1]); await p.waitForTimeout(250); } };
/** @type {Record<string, { q: string, w?: number, h?: number, live?: boolean, after?: (page: any) => Promise<void> }>} */
export const FRAMES = {
  // Lucid Chat, the real log: the three levels of the Now view
  'now-land': { q: 'd=lucid&lens=dept' },
  'now-area': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(askedLand) },
  'now-area-big': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(bigLand) },
  'now-task': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(askedDistrict) },
  'now-task-rich': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(richDistrict) },
  'now-task-hover': { q: 'd=lucid&lens=dept', after: async (p) => { await p.evaluate(askedDistrict); await p.waitForTimeout(300); await hoverTile(p); } },
  'now-task-view': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => { const it = LM.ds.items.filter((o) => o.children.length >= 2 && o.s >= 3 && o.doneAt).sort((a, b) => b.b - a.b)[0] || LM.ds.items.filter((o) => o.s >= 4 && o.doneAt)[0]; const v = LM.posOf.get(it.id); LM.flyToDistrict(v.d); snap(); LM.select(it); }) },
  'now-task-view-rising': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => { const v = LM.vis.items.filter((v) => v.it && (v.st.s === 'review' || v.st.s === 'doing') && v.it.s >= 3).sort((a, b) => b.it.b - a.it.b)[0]; LM.flyToDistrict(v.d); snap(); LM.select(v.it); }) },
  'now-ask-view': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => { const a = LM.ds.asks.find((x) => x.to === 'owner') || LM.ds.asks[0]; const pl = LM.askPlace(LM.ds, a, 'dept', LM.view.t); LM.select({ ask: a, it: pl.it }); }) },
  'now-project-view': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => { const P = LM.ds.projects.map((P) => ({ P, S: LM.projectStats(LM.ds, P, LM.view.t) })).filter((x) => x.P.kind === 'project' && x.S.n >= 12).sort((a, b) => (b.S.asks.length + b.S.blocked) - (a.S.asks.length + a.S.blocked) || b.S.open - a.S.open)[0].P; LM.openProject(P.id); }) },
  'now-project-on-map': { q: 'd=lucid&lens=dept', after: async (p) => { await p.evaluate(() => { const P = LM.ds.projects.filter((P) => P.kind === 'decision' && P.items.length >= 10).sort((a, b) => b.items.length - a.items.length)[0]; LM.openProject(P.id); }); await p.click('[data-a=mapProj]'); await p.waitForTimeout(900); } },
  'now-project-area': { q: 'd=lucid&lens=dept', after: async (p) => { await p.evaluate(() => { const P = LM.ds.projects.filter((P) => P.kind === 'project' && P.items.length >= 20).sort((a, b) => b.items.length - a.items.length)[0]; LM.setProject(P.id); LM.draw(performance.now()); const L = [...LM.vis.lands.values()].sort((a, b) => b.proj - a.proj)[0]; LM.flyToLand(L.key); }); await p.evaluate(snap); } },
  'now-projects-list': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => LM.openProjects()) },
  'now-policies': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => LM.openPolicies()) },
  'now-land-view': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => { const L = [...LM.vis.lands.values()].sort((a, b) => b.n - a.n)[0]; LM.select({ land: L }); }) },
  'now-plaque': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => { const L = [...LM.vis.lands.values()].sort((a, b) => b.n - a.n)[0]; const D = [...LM.vis.districts.values()].filter((d) => d.land === L.key && d.items.some((v) => v.mon)).sort((a, b) => b.n - a.n)[0]; LM.flyToDistrict(D.key); snap(); const S = [...LM.squares.values()].sort((a, b) => b.n - a.n)[0]; if (S) LM.select({ plaque: S }); }) },
  // layers at the three levels
  'layer-progress-land': { q: 'd=lucid&lens=dept&o=progress' },
  'layer-progress-area': { q: 'd=lucid&lens=dept&o=progress', after: async (p) => p.evaluate(bigLand) },
  'layer-progress-task': { q: 'd=lucid&lens=dept&o=progress', after: async (p) => p.evaluate(bigDistrict) },
  'layer-cost-area': { q: 'd=lucid&lens=dept&o=cost', after: async (p) => p.evaluate(bigLand) },
  'layer-cost-task': { q: 'd=lucid&lens=dept&o=cost', after: async (p) => p.evaluate(bigDistrict) },
  'layer-problems-land': { q: 'd=lucid&lens=dept&o=problems' },
  'layer-problems-area': { q: 'd=lucid&lens=dept&o=problems', after: async (p) => p.evaluate(askedLand) },
  'layer-deps-area': { q: 'd=lucid&lens=dept&o=deps', after: async (p) => p.evaluate(bigLand) },
  'layer-people-task': { q: 'd=lucid&lens=dept&o=people', after: async (p) => p.evaluate(bigDistrict) },
  'layer-recency-area': { q: 'd=lucid&lens=dept&o=recency', after: async (p) => p.evaluate(bigLand) },
  'layer-growth-land': { q: 'd=lucid&lens=dept&o=growth' },
  // since, time
  'since-area': { q: 'd=lucid&lens=dept&since=2026-10-26T12:00', after: async (p) => p.evaluate(bigLand) },
  'since-task': { q: 'd=lucid&lens=dept&since=2026-10-26T12:00', after: async (p) => p.evaluate(bigDistrict) },
  'then-land': { q: 'd=lucid&lens=dept&t=2026-10-23T12:00&time=1' },
  'then-task-moments': { q: 'd=lucid&lens=dept&t=2026-10-25T12:00&time=1', after: async (p) => p.evaluate(() => { const v = LM.vis.items.filter((v) => v.it && v.it.st.length >= 4 && v.it.s >= 3).sort((a, b) => b.it.st.length - a.it.st.length)[0]; LM.flyToDistrict(v.d); snap(); LM.select(v.it); }) },
  'lens-projects': { q: 'd=lucid&lens=proj' },
  'lens-products-area': { q: 'd=lucid&lens=prod&o=progress', after: async (p) => p.evaluate(bigLand) },
  'lens-people': { q: 'd=lucid&lens=people' },
  'trace': { q: 'd=lucid&lens=dept&trace=L425&panel=0' },
  // the isometric option
  'iso-area': { q: 'd=lucid&lens=dept&iso=1', after: async (p) => p.evaluate(bigLand) },
  'iso-task': { q: 'd=lucid&lens=dept&iso=1', after: async (p) => p.evaluate(askedDistrict) },
  // the shell
  'grammar': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => LM.openSheet()) },
  'lab': { q: 'd=lucid&lens=dept', after: async (p) => p.click('#labc') },
  'more': { q: 'd=lucid&lens=dept', after: async (p) => p.click('.dock [data-d=more]') },
  'sky-glass-area': { q: 'd=lucid&lens=dept&pt=sky', after: async (p) => p.evaluate(bigLand) },
  'sky-glass-task': { q: 'd=lucid&lens=dept&pt=sky', after: async (p) => p.evaluate(askedDistrict) },
  'aqua-land': { q: 'd=lucid&lens=dept&pt=aqua' },
  'hc-task': { q: 'd=lucid&lens=dept&hc=1', after: async (p) => p.evaluate(askedDistrict) },
  'phone-land': { q: 'd=lucid&lens=dept', w: 390, h: 844 },
  'phone-panel': { q: 'd=lucid&lens=dept&panel=1', w: 390, h: 844 },
  'phone-area': { q: 'd=lucid&lens=dept', w: 390, h: 844, after: async (p) => p.evaluate(askedLand) },
  'phone-task': { q: 'd=lucid&lens=dept', w: 390, h: 844, after: async (p) => p.evaluate(askedDistrict) },
  'phone-task-view': { q: 'd=lucid&lens=dept', w: 390, h: 844, after: async (p) => p.evaluate(() => { const v = LM.vis.items.filter((v) => v.it && v.st.done && v.it.s >= 4)[0]; LM.select(v.it); }) },
  // the generated company
  'example-land': { q: 'd=example&lens=dept' },
  'example-area': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(askedLand) },
  'example-task': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(stuckDistrict) },
  'example-task-rich': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(richDistrict) },
  'example-ask-view': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(() => { const a = LM.ds.asks[0]; const pl = LM.askPlace(LM.ds, a, 'dept', LM.view.t); LM.select({ ask: a, it: pl.it }); }) },
  'example-project-view': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(() => { const P = LM.ds.projects.find((P) => P.id === 'teams') || LM.ds.projects[0]; LM.openProject(P.id); }) },
  'example-projects-list': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(() => LM.openProjects()) },
  'example-policies': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(() => LM.openPolicies()) },
  'example-cost-land': { q: 'd=example&lens=dept&o=cost' },
  'example-revenue': { q: 'd=example&lens=prod&o=revenue' },
  'example-crisis': { q: 'd=example&lens=dept&t=2025-11-20T12:00&time=1' },
  'example-crisis-task': { q: 'd=example&lens=dept&o=deps&t=2025-11-20T12:00&time=1', after: async (p) => p.evaluate(stuckDistrict) },
  'example-people-area': { q: 'd=example&lens=people&o=people', after: async (p) => p.evaluate(bigLand) },
  'example-y1': { q: 'd=example&lens=dept&t=2024-12-31T12:00&time=1&panel=0' },
  'example-y2': { q: 'd=example&lens=dept&t=2025-12-31T12:00&time=1&panel=0' },
  'example-subtasks': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(() => { const v = LM.vis.items.filter((v) => v.it && v.it.children.length >= 3).sort((a, b) => b.it.b - a.it.b)[0]; LM.flyToDistrict(v.d); snap(); LM.select(v.it); }) },
  // playback
  'example-play-1': { q: 'd=example&lens=dept', live: true, after: async (p) => { await p.evaluate(() => { LM.view.reduce = false; LM.command('play from the start'); LM.view.speed = 14; }); await p.waitForTimeout(3000); } },
  'example-play-2': { q: 'd=example&lens=dept', live: true, after: async (p) => { await p.evaluate(() => { LM.view.reduce = false; LM.command('play from the start'); LM.view.speed = 30; }); await p.waitForTimeout(9000); } },
  'lucid-play': { q: 'd=lucid&lens=dept&t=2026-10-21T06:00&time=1', live: true, after: async (p) => { await p.evaluate(() => { LM.view.reduce = false; LM.view.speed = 1 / 4; LM.togglePlay(true); }); await p.waitForTimeout(2600); } },
};

const args = process.argv.slice(2);
const smoke = args.includes('--smoke');
const names = args.filter((a) => !a.startsWith('--'));
const list = smoke ? ['now-land'] : names.length ? names : Object.keys(FRAMES);
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
  await page.addScriptTag({ content: `window.snap = ${snap.toString()};` });
  try { if (F.after) { await F.after(page); await page.waitForTimeout(F.live ? 0 : 350); } } catch (e) { errors.push('after: ' + String(e).slice(0, 200)); }
  if (!F.live) { await page.evaluate(() => { LM.dirty(); }); await page.waitForTimeout(200); }
  const png = path.join(ROOT, 'shots', `${name}.png`);
  await page.screenshot({ path: png });
  try { execFileSync('cwebp', ['-quiet', '-q', '88', png, '-o', png.replace(/\.png$/, '.webp')]); unlinkSync(png); } catch { /* no cwebp: keep the png */ }
  const info = await page.evaluate(() => ({ lod: LM.lod, k: LM.cam.k.toFixed(1), lands: LM.vis.lands.size, tiles: LM.overlays.size }));
  console.log(`${name}  k=${info.k} level=${info.lod + 1} lands=${info.lands} dom=${info.tiles}${errors.length ? '  ERRORS: ' + errors.join(' | ') : ''}`);
  await page.close();
}
await browser.close();
