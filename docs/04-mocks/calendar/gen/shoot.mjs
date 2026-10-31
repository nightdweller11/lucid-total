#!/usr/bin/env node
// @ts-check
/**
 * Shoots stills of the calendar exploration with Playwright (global install).
 *   node gen/shoot.mjs                 all frames in FRAMES -> shots/<name>.webp
 *   node gen/shoot.mjs name1 name2     only those
 *   node gen/shoot.mjs --smoke         one frame, print console errors
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

/** @type {Record<string, { q: string, w?: number, h?: number, after?: (page: any) => Promise<void> }>} */
export const FRAMES = {
  // Lucid Chat, the real log: days as tiles at the four zooms
  'tiles-week': { q: 'd=lucid' },
  'tiles-month': { q: 'd=lucid&zoom=month' },
  'tiles-quarter': { q: 'd=lucid&zoom=quarter' },
  'tiles-day': { q: 'd=lucid&zoom=day' },
  'tiles-week-place': { q: 'd=lucid&focus=B' },
  'tiles-month-task': { q: 'd=lucid&zoom=month', after: async (p) => p.evaluate(() => { const it = LM.ds.items.filter((x) => x.st.some((s) => s[1] === 'blocked') && x.st.some((s) => s[1] === 'done')).sort((a, b) => b.s - a.s)[0]; CAL.dive(2, it.id); }) },
  'tiles-problems': { q: 'd=lucid&zoom=month&layer=problems' },
  'tiles-people': { q: 'd=lucid&layer=people&lens=people' },
  // the river
  'river-week': { q: 'd=lucid&viz=river' },
  'river-month': { q: 'd=lucid&viz=river&zoom=month' },
  'river-quarter': { q: 'd=example&viz=river&zoom=quarter' },
  'river-day': { q: 'd=lucid&viz=river&zoom=day' },
  'river-place': { q: 'd=lucid&viz=river&focus=D' },
  // the strata
  'strata-week': { q: 'd=lucid&viz=strata' },
  'strata-month': { q: 'd=lucid&viz=strata&zoom=month' },
  'strata-quarter': { q: 'd=example&viz=strata&zoom=quarter' },
  'strata-day': { q: 'd=lucid&viz=strata&zoom=day' },
  // the example company: ahead and the past
  'example-week': { q: 'd=example' },
  'example-month': { q: 'd=example&zoom=month' },
  'example-quarter': { q: 'd=example&zoom=quarter' },
  'example-projected': { q: 'd=example&zoom=month&layer=projected' },
  'example-day': { q: 'd=example&zoom=day' },
  'example-person': { q: 'd=example&lens=people', after: async (p) => p.evaluate(() => { const idx = CAL.index(LM.ds, 'people'); const P = CAL.period(CAL.view); const c = new Map(); for (let k = P.k0; k < P.k1; k++) { const D = idx.days.get(k); if (!D) continue; for (const e of D.events) if (!e.proj && e.place !== '_co') c.set(e.place, (c.get(e.place) || 0) + 1); } const best = [...c.entries()].sort((a, b) => b[1] - a[1])[0]; if (best) CAL.dive(1, best[0]); }) },
  'example-project': { q: 'd=example&lens=proj&zoom=month&focus=teams' },
  'example-ahead-day': { q: 'd=example', after: async (p) => p.evaluate(() => { CAL.select({ day: CAL.view.day + 3 }); }) },
  // the context panel
  'ctx-task': { q: 'd=lucid', after: async (p) => p.evaluate(() => { const idx = CAL.index(LM.ds, CAL.view.lens); const e = idx.events.filter((x) => x.kind === 'done' && x.k === idx.nowK - 1 && x.it.s >= 3)[0] || idx.events.find((x) => x.kind === 'done'); CAL.select({ ev: e }); }) },
  'ctx-ask': { q: 'd=example', after: async (p) => p.evaluate(() => { const idx = CAL.index(LM.ds, CAL.view.lens); const e = idx.events.filter((x) => x.kind === 'asked').slice(-1)[0]; CAL.select({ ev: e }); }) },
  // themes and phone
  'sky-month': { q: 'd=lucid&zoom=month&pt=sky' },
  'aqua-river': { q: 'd=example&viz=river&zoom=month&pt=aqua' },
  'phone-week': { q: 'd=lucid&panel=0', w: 390, h: 844 },
  'phone-strata': { q: 'd=lucid&viz=strata&panel=0', w: 390, h: 844 },
};

const args = process.argv.slice(2);
const smoke = args.includes('--smoke');
const names = args.filter((a) => !a.startsWith('--'));
const list = smoke ? ['tiles-week'] : names.length ? names : Object.keys(FRAMES);
if (!names.length && !smoke) for (const f of readdirSync(path.join(ROOT, 'shots'))) if (/\.(png|webp)$/.test(f) && !FRAMES[f.replace(/\.(png|webp)$/, '')]) unlinkSync(path.join(ROOT, 'shots', f));
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
for (const name of list) {
  const F = FRAMES[name];
  if (!F) { console.error(`no frame ${name}`); continue; }
  const page = await browser.newPage({ viewport: { width: F.w || 1440, height: F.h || 900 }, deviceScaleFactor: 1.5 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${URL}?${F.q}`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  try { if (F.after) { await F.after(page); await page.waitForTimeout(300); } } catch (e) { errors.push('after: ' + String(e).slice(0, 200)); }
  const info = await page.evaluate(() => `${CAL.view.viz} ${CAL.view.zoom} focus=${CAL.view.focus.level} events=${CAL.index(LM.ds, CAL.view.lens).events.length} dom=${document.querySelectorAll('#dom .dt,#dom .dc,#dom .ev').length}`);
  const png = path.join(ROOT, 'shots', `${name}.png`);
  await page.screenshot({ path: png });
  try { execFileSync('cwebp', ['-quiet', '-q', '82', png, '-o', path.join(ROOT, 'shots', `${name}.webp`)]); unlinkSync(png); } catch { /* keep the png */ }
  console.log(`${name}  ${info}${errors.length ? '  ERRORS: ' + errors.slice(0, 3).join(' | ').slice(0, 300) : ''}`);
  await page.close();
}
await browser.close();
