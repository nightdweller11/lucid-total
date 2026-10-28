#!/usr/bin/env node
// @ts-check
/**
 * Shoots stills of the living map with Playwright (global install, 1.52).
 *   node gen/shoot.mjs                 all frames in FRAMES -> shots/<name>.png
 *   node gen/shoot.mjs name1 name2     only those
 *   node gen/shoot.mjs --smoke         one frame, print console errors
 * Frames are URL states (the page reads them); every still is reproducible (docs/17 LM-R-5).
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';

let pw; try { pw = await import('playwright'); } catch { pw = await import('/usr/local/lib/node_modules/playwright/index.mjs'); }
const { chromium } = pw;
let exe = process.env.PW_CHROMIUM;
if (!exe) { const c = path.join(os.homedir(), 'Library/Caches/ms-playwright'); try { const d = fs.readdirSync(c).filter((x) => /^chromium-\d+$/.test(x)).sort().pop(); const sub = fs.readdirSync(path.join(c, d)).find((x) => x.startsWith('chrome-mac')); const app = fs.readdirSync(path.join(c, d, sub)).find((x) => x.endsWith('.app')); const mac = path.join(c, d, sub, app, 'Contents/MacOS'); exe = path.join(mac, fs.readdirSync(mac)[0]); } catch { exe = undefined; } }
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const URL = 'file://' + path.join(ROOT, 'index.html');
mkdirSync(path.join(ROOT, 'shots'), { recursive: true });

/** @type {Record<string, { q: string, w?: number, h?: number, after?: (page: any) => Promise<void> }>} */
export const FRAMES = {
  // the real log: Lucid Chat
  'lucid-sky-now': { q: 'd=lucid&lens=dept' },
  'lucid-sky-day1': { q: 'd=lucid&lens=dept&t=2026-10-19T00:00' },
  'lucid-sky-day4': { q: 'd=lucid&lens=dept&t=2026-10-22T00:00' },
  'lucid-sky-day7': { q: 'd=lucid&lens=dept&t=2026-10-25T00:00' },
  'lucid-sky-progress': { q: 'd=lucid&lens=dept&o=progress' },
  'lucid-sky-cost': { q: 'd=lucid&lens=dept&o=cost' },
  'lucid-sky-pipes': { q: 'd=lucid&lens=dept&o=pipes' },
  'lucid-sky-issues': { q: 'd=lucid&lens=dept&o=issues&t=2026-10-24T12:00' },
  'lucid-projects': { q: 'd=lucid&lens=proj' },
  'lucid-products': { q: 'd=lucid&lens=prod' },
  'lucid-people': { q: 'd=lucid&lens=people' },
  'lucid-land': { q: 'd=lucid&lens=dept', after: async (p) => p.evaluate(() => { const L = [...LM.vis.lands.values()].sort((a, b) => b.n - a.n)[0]; LM.cam = { x: L.cx, y: L.cy + 1, k: 16 }; LM.dirty(); }) },
  'lucid-district': { q: 'd=lucid&lens=dept&o=pipes', after: async (p) => p.evaluate(() => { const D = [...LM.vis.districts.values()].sort((a, b) => b.n - a.n)[0]; LM.cam = { x: D.cx, y: D.cy + 0.5, k: 34 }; LM.dirty(); }) },
  'lucid-street': { q: 'd=lucid&lens=dept&o=pipes', after: async (p) => p.evaluate(() => { const D = [...LM.vis.districts.values()].sort((a, b) => b.blocked - a.blocked || b.n - a.n)[0]; LM.cam = { x: D.cx, y: D.cy + 0.5, k: 64 }; LM.dirty(); }) },
  'lucid-cutaway': { q: 'd=lucid&lens=dept&o=pipes', after: async (p) => p.evaluate(() => { const v = LM.vis.items.filter((v) => v.it && v.st.blocked).sort((a, b) => b.it.s - a.it.s)[0] || LM.vis.items.find((v) => v.it && v.it.s >= 4); LM.cam = { x: v.x, y: v.y + 0.6, k: 64 }; LM.select(v.it); }) },
  'lucid-trace': { q: 'd=lucid&lens=dept&trace=L425' },
  'lucid-phone': { q: 'd=lucid&lens=dept', w: 390, h: 844 },
  'lucid-sky-light': { q: 'd=lucid&lens=dept&pt=sky' },
  'lucid-sky-hc': { q: 'd=lucid&lens=dept&hc=1' },
  // the generated company
  'example-y1': { q: 'd=example&lens=dept&t=2024-12-31T12:00' },
  'example-y2': { q: 'd=example&lens=dept&t=2025-12-31T12:00' },
  'example-now': { q: 'd=example&lens=dept' },
  'example-products-before': { q: 'd=example&lens=prod&t=2026-04-01T12:00' },
  'example-products-after': { q: 'd=example&lens=prod&t=2026-06-30T12:00' },
  'example-revenue': { q: 'd=example&lens=prod&o=revenue' },
  'example-cost': { q: 'd=example&lens=dept&o=cost' },
  'example-crisis': { q: 'd=example&lens=dept&o=issues&t=2025-11-20T12:00' },
  'example-crisis-pipes': { q: 'd=example&lens=dept&o=pipes&t=2025-11-20T12:00', after: async (p) => p.evaluate(() => { const D = [...LM.vis.districts.values()].sort((a, b) => b.blocked - a.blocked)[0]; LM.cam = { x: D.cx, y: D.cy + 0.5, k: 30 }; LM.dirty(); }) },
  'example-people': { q: 'd=example&lens=people&o=load' },
  'example-projects': { q: 'd=example&lens=proj&o=progress' },
  'example-terrain': { q: 'd=example&lens=dept&o=terrain' },
  'example-trace': { q: 'd=example&lens=prod&trace=D23' },
  'example-secession-walk': { q: 'd=example&lens=dept&t=2026-06-30T12:00', after: async (p) => { await p.evaluate(() => { LM.view.reduce = false; LM.setLens('prod'); }); await p.waitForTimeout(380); await p.evaluate(() => LM.draw(performance.now())); } },
  'lucid-lens-walk': { q: 'd=lucid&lens=dept', after: async (p) => { await p.evaluate(() => { LM.view.reduce = false; LM.setLens('prod'); }); await p.waitForTimeout(380); await p.evaluate(() => LM.draw(performance.now())); } },
  'lucid-playing': { q: 'd=lucid&lens=dept&t=2026-10-21T06:00', after: async (p) => { await p.evaluate(() => { LM.view.reduce = false; LM.togglePlay(true); }); await p.waitForTimeout(900); } },
  'lucid-stuck': { q: 'd=lucid&lens=dept&t=2026-10-24T12:00', after: async (p) => { await p.evaluate(() => LM.command('what is stuck')); await p.waitForTimeout(1000); } },
  'example-projects-lens': { q: 'd=example&lens=proj&t=2025-06-30T12:00&o=progress' },
  'example-forecast': { q: 'd=example&lens=dept&t=2026-12-15T12:00&o=progress' },
};

const args = process.argv.slice(2);
const smoke = args.includes('--smoke');
const names = args.filter((a) => !a.startsWith('--'));
const list = smoke ? ['lucid-sky-now'] : names.length ? names : Object.keys(FRAMES);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
for (const name of list) {
  const F = FRAMES[name];
  if (!F) { console.error(`no frame ${name}`); continue; }
  const page = await browser.newPage({ viewport: { width: F.w || 1440, height: F.h || 900 }, deviceScaleFactor: 1.5 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${URL}?${F.q}&reduce=1`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  if (F.after) { await F.after(page); await page.waitForTimeout(200); }
  // let the visual heights settle (reduce motion snaps them), then draw once more
  await page.evaluate(() => { LM.dirty(); });
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(ROOT, 'shots', `${name}.png`) });
  const info = await page.evaluate(() => ({ lod: LM.lod, k: LM.cam.k.toFixed(1), lands: LM.vis.lands.size, items: LM.vis.items.length }));
  console.log(`${name}  k=${info.k} lod=${info.lod} lands=${info.lands} items=${info.items}${errors.length ? '  ERRORS: ' + errors.join(' | ') : ''}`);
  await page.close();
}
await browser.close();
