#!/usr/bin/env node
// @ts-check
/**
 * Shoots stills of the living map with Playwright (global install, 1.52).
 *   node gen/shoot.mjs                 all frames in FRAMES -> shots/<name>.png
 *   node gen/shoot.mjs name1 name2     only those
 *   node gen/shoot.mjs --smoke         one frame, print console errors
 * Frames are URL states (the page reads them) plus a few scripted moments; every still is reproducible (docs/17 LM-R-5).
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

const biggestLand = () => { const L = [...LM.vis.lands.values()].sort((a, b) => b.n - a.n)[0]; LM.cam = { x: L.cx + 6, y: L.cy + 1, k: 16 }; LM.dirty(); };
const biggestDistrict = () => { const D = [...LM.vis.districts.values()].sort((a, b) => b.n - a.n)[0]; LM.cam = { x: D.cx + 2, y: D.cy + 0.5, k: 34 }; LM.dirty(); };
const stuckDistrict = () => { const D = [...LM.vis.districts.values()].sort((a, b) => b.blocked - a.blocked || b.n - a.n)[0]; LM.cam = { x: D.cx + 1, y: D.cy + 0.5, k: 72 }; LM.dirty(); };
/** @type {Record<string, { q: string, w?: number, h?: number, live?: boolean, after?: (page: any) => Promise<void> }>} */
export const FRAMES = {
  // the real log: Lucid Chat, by depth
  'lucid-sky': { q: 'd=lucid&lens=dept' },
  'lucid-sky-day1': { q: 'd=lucid&lens=dept&t=2026-10-19T00:00&feed=0' },
  'lucid-sky-day4': { q: 'd=lucid&lens=dept&t=2026-10-22T00:00&feed=0' },
  'lucid-sky-day7': { q: 'd=lucid&lens=dept&t=2026-10-25T00:00&feed=0' },
  'lucid-land': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(biggestLand) },
  'lucid-district': { q: 'd=lucid&lens=dept&o=pipes', after: async (p) => p.evaluate(biggestDistrict) },
  'lucid-street': { q: 'd=lucid&lens=dept&o=pipes', after: async (p) => p.evaluate(stuckDistrict) },
  'lucid-product-view': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => { const v = LM.vis.items.filter((v) => v.it && v.st.done && v.it.dep.length && v.it.s >= 4).sort((a, b) => b.it.b - a.it.b)[0]; LM.cam = { x: v.x, y: v.y + 0.6, k: 64 }; LM.select(v.it); }) },
  'lucid-product-view-rising': { q: 'd=lucid&lens=dept&t=2026-10-24T12:00', after: async (p) => p.evaluate(() => { const v = LM.vis.items.filter((v) => v.it && v.st.s === 'doing' && v.it.s >= 3).sort((a, b) => b.it.b - a.it.b)[0]; LM.cam = { x: v.x, y: v.y + 0.6, k: 64 }; LM.select(v.it); }) },
  'lucid-flag-view': { q: 'd=lucid&lens=dept&trace=L425', after: async (p) => p.evaluate(() => { const d = LM.ds.decisions.find((x) => x.id === 'L425'); const c = LM.worlds.dept.claims.find((cc) => cc.dec === d); LM.select({ mon: d, v: c }); }) },
  'lucid-land-view': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => { const L = [...LM.vis.lands.values()].sort((a, b) => b.n - a.n)[0]; LM.select({ land: L }); }) },
  // the since layer
  'lucid-since-sky': { q: 'd=lucid&lens=dept&since=2026-10-26T12:00' },
  'lucid-since-land': { q: 'd=lucid&lens=dept&since=2026-10-26T12:00', after: async (p) => p.evaluate(biggestLand) },
  'lucid-since-district': { q: 'd=lucid&lens=dept&since=2026-10-26T12:00', after: async (p) => p.evaluate(biggestDistrict) },
  // lenses and layers
  'lucid-projects': { q: 'd=lucid&lens=proj' },
  'lucid-products': { q: 'd=lucid&lens=prod' },
  'lucid-people': { q: 'd=lucid&lens=people&o=load' },
  'lucid-progress': { q: 'd=lucid&lens=dept&o=progress' },
  'lucid-cost': { q: 'd=lucid&lens=dept&o=cost' },
  'lucid-growth': { q: 'd=lucid&lens=dept&o=growth' },
  'lucid-pipes-sky': { q: 'd=lucid&lens=dept&o=pipes' },
  'lucid-ai': { q: 'd=lucid&lens=dept&o=ai' },
  'lucid-trace': { q: 'd=lucid&lens=dept&trace=L425&feed=0' },
  'lucid-lens-walk': { q: 'd=lucid&lens=dept', after: async (p) => { await p.evaluate(() => { LM.view.reduce = false; LM.setLens('prod'); }); await p.waitForTimeout(380); await p.evaluate(() => LM.draw(performance.now())); } },
  'lucid-stuck': { q: 'd=lucid&lens=dept&t=2026-10-24T12:00', after: async (p) => { await p.evaluate(() => LM.command('what is stuck')); await p.waitForTimeout(1000); } },
  // the shell
  'lucid-legend-sheet': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => LM.openSheet()) },
  'lucid-lab': { q: 'd=lucid&lens=dept', after: async (p) => p.click('#labc') },
  'lucid-since-menu': { q: 'd=lucid&lens=dept', after: async (p) => p.click('#sincec') },
  'lucid-decisions-list': { q: 'd=lucid&lens=dept', after: async (p) => p.click('#decs') },
  'lucid-sky-glass': { q: 'd=lucid&lens=dept&pt=sky&o=progress' },
  'lucid-aqua': { q: 'd=lucid&lens=dept&pt=aqua' },
  'lucid-hc': { q: 'd=lucid&lens=dept&hc=1' },
  'lucid-phone': { q: 'd=lucid&lens=dept', w: 390, h: 844 },
  'lucid-phone-feed': { q: 'd=lucid&lens=dept&feed=1', w: 390, h: 844 },
  'lucid-phone-product-view': { q: 'd=lucid&lens=dept', w: 390, h: 844, after: async (p) => p.evaluate(() => { const v = LM.vis.items.filter((v) => v.it && v.st.done && v.it.s >= 4)[0]; LM.select(v.it); }) },
  // the generated company
  'example-y1': { q: 'd=example&lens=dept&t=2024-12-31T12:00&feed=0' },
  'example-y2': { q: 'd=example&lens=dept&t=2025-12-31T12:00&feed=0' },
  'example-now': { q: 'd=example&lens=dept' },
  'example-cost': { q: 'd=example&lens=dept&o=cost' },
  'example-revenue': { q: 'd=example&lens=prod&o=revenue' },
  'example-crisis': { q: 'd=example&lens=dept&o=issues&t=2025-11-20T12:00' },
  'example-crisis-street': { q: 'd=example&lens=dept&o=pipes&t=2025-11-20T12:00', after: async (p) => p.evaluate(stuckDistrict) },
  'example-people': { q: 'd=example&lens=people&o=load' },
  'example-projects': { q: 'd=example&lens=proj&o=progress' },
  'example-terrain': { q: 'd=example&lens=dept&o=terrain' },
  'example-growth': { q: 'd=example&lens=dept&o=growth' },
  'example-products-before': { q: 'd=example&lens=prod&t=2026-04-01T12:00&feed=0' },
  'example-products-after': { q: 'd=example&lens=prod&t=2026-06-30T12:00&feed=0' },
  'example-secession-walk': { q: 'd=example&lens=dept&t=2026-06-30T12:00', after: async (p) => { await p.evaluate(() => { LM.view.reduce = false; LM.setLens('prod'); }); await p.waitForTimeout(380); await p.evaluate(() => LM.draw(performance.now())); } },
  'example-trace': { q: 'd=example&lens=prod&trace=D23' },
  'example-land-view': { q: 'd=example&lens=dept', after: async (p) => p.evaluate(() => { const L = [...LM.vis.lands.values()].sort((a, b) => b.n - a.n)[0]; LM.select({ land: L }); }) },
  'example-since-month': { q: 'd=example&lens=dept&since=2026-09-28T12:00' },
  'example-forecast': { q: 'd=example&lens=dept&t=2026-12-15T12:00&o=progress' },
  // playback: the city grows, events appear in place and fold into their buildings
  'example-play-1': { q: 'd=example&lens=dept', live: true, after: async (p) => { await p.evaluate(() => { LM.view.reduce = false; LM.command('play from the start'); LM.view.speed = 14; }); await p.waitForTimeout(2500); } },
  'example-play-2': { q: 'd=example&lens=dept', live: true, after: async (p) => { await p.evaluate(() => { LM.view.reduce = false; LM.command('play from the start'); LM.view.speed = 14; }); await p.waitForTimeout(6000); } },
  'example-play-3': { q: 'd=example&lens=dept', live: true, after: async (p) => { await p.evaluate(() => { LM.view.reduce = false; LM.command('play from the start'); LM.view.speed = 30; }); await p.waitForTimeout(12000); } },
  'lucid-play': { q: 'd=lucid&lens=dept&t=2026-10-21T06:00', live: true, after: async (p) => { await p.evaluate(() => { LM.view.reduce = false; LM.view.speed = 1 / 4; LM.togglePlay(true); }); await p.waitForTimeout(2600); } },
};

const args = process.argv.slice(2);
const smoke = args.includes('--smoke');
const names = args.filter((a) => !a.startsWith('--'));
const list = smoke ? ['lucid-sky'] : names.length ? names : Object.keys(FRAMES);
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
  if (F.after) { await F.after(page); await page.waitForTimeout(F.live ? 0 : 250); }
  if (!F.live) { await page.evaluate(() => { LM.dirty(); }); await page.waitForTimeout(150); }
  const png = path.join(ROOT, 'shots', `${name}.png`);
  await page.screenshot({ path: png });
  // stills are stored as WebP (q 88, about a tenth of the PNG) so the gallery and the repo stay small; cwebp from Homebrew
  try { execFileSync('cwebp', ['-quiet', '-q', '88', png, '-o', png.replace(/\.png$/, '.webp')]); unlinkSync(png); } catch { /* no cwebp: keep the png */ }
  const info = await page.evaluate(() => ({ lod: LM.lod, k: LM.cam.k.toFixed(1), lands: LM.vis.lands.size, items: LM.vis.items.length }));
  console.log(`${name}  k=${info.k} lod=${info.lod} lands=${info.lands} items=${info.items}${errors.length ? '  ERRORS: ' + errors.join(' | ') : ''}`);
  await page.close();
}
await browser.close();
