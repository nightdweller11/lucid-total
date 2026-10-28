// Screenshots and the attention check.  node gen/shoot.mjs [--check] [--frames 1,2,3] [--themes deep,sky] [--phone]
// Uses Playwright (playwright package if resolvable, else a global install) and the cached Chromium.
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
let pw; try { pw = await import('playwright'); } catch { pw = await import('/usr/local/lib/node_modules/playwright/index.mjs'); }
const args = process.argv.slice(2); const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const here = path.dirname(new URL(import.meta.url).pathname); const root = path.resolve(here, '..'); const shots = path.join(root, 'shots');
fs.mkdirSync(shots, { recursive: true });
let exe = process.env.CHROMIUM;
if (!exe) { const c = path.join(os.homedir(), 'Library/Caches/ms-playwright'); try { const d = fs.readdirSync(c).filter((x) => /^chromium-\d+$/.test(x)).sort().pop(); const sub = fs.readdirSync(path.join(c, d)).find((x) => x.startsWith('chrome-mac')); const app = fs.readdirSync(path.join(c, d, sub)).find((x) => x.endsWith('.app')); const mac = path.join(c, d, sub, app, 'Contents/MacOS'); exe = path.join(mac, fs.readdirSync(mac)[0]); } catch { exe = undefined; } }
const browser = await pw.chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const url = (q) => 'file://' + path.join(root, 'index.html') + '?' + q;
const frames = (opt('--frames', '') || '').split(',').filter(Boolean).map((n) => 'f' + String(n).padStart(2, '0'));
const ready = async () => { await page.addStyleTag({ content: '.lab{position:static!important}' }); await page.waitForLoadState('networkidle'); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300); };
if (args.includes('--check')) {
  await page.goto(url('pt=deep&dev=desktop')); await ready();
  const rows = await page.evaluate(() => [...document.querySelectorAll('figure.fr')].map((f) => {
    const scrs = [...f.querySelectorAll('.scr')].filter((s) => s.offsetParent !== null); if (!scrs.length) return null;
    let best = null; for (const scr of scrs) {
    const big = new Set(); let nums = 0; const numList = [];
    const tw = document.createTreeWalker(scr, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) {
      const t = tw.currentNode.textContent.trim(); if (!t) continue; const el = tw.currentNode.parentElement;
      if (!el || el.closest('svg.fac,.sb,title,[data-ambient],.dock .tip')) continue;
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); if (cs.visibility === 'hidden' || cs.display === 'none' || r.width === 0) continue;
      let op = 1, e = el; while (e && e !== scr) { op *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; } if (op < 0.2) continue;
      if (parseFloat(cs.fontSize) > 15.5) big.add(el.closest('.line1,.q,.ttl,.nm,.chart .say,.now') || el);
      const m = t.match(/\d[\d,.:%]*/g); if (m) { nums += m.length; numList.push(...m); }
    }
    const r = { id: f.id, att: f.dataset.att, glance: f.dataset.glance, big: big.size, nums, needs: scr.querySelectorAll('[data-needs]').length, numList: numList.join(' ') };
    if (!best || r.big + r.nums + r.needs * 10 > best.big + best.nums + best.needs * 10) best = r; }
    return best;
  }).filter(Boolean));
  for (const r of rows) { const [n, t, u] = (r.att || ',,').split(','); const bad = (+t !== r.big || +u !== r.nums || +n !== r.needs) ? '  <-- caption differs' : ''; const over = (r.big > 12 || r.needs > 3 || (r.glance === '1' && r.nums > 7)) ? '  <-- OVER BUDGET' : ''; console.log(`${r.id}  needs ${r.needs} (caption ${n})  text>body ${r.big} (caption ${t})  numbers ${r.nums} (caption ${u})${bad}${over}\n      numbers: ${r.numList}`); }
} else {
  const themes = opt('--themes', 'deep,sky').split(','); const phoneOnly = args.includes('--phone');
  for (const th of themes) for (const dev of phoneOnly ? ['phone'] : ['desktop', 'phone']) {
    await page.goto(url(`pt=${th}&dev=${dev}${opt('--q', '') ? '&' + opt('--q', '') : ''}`)); await ready();
    const ids = await page.evaluate(() => [...document.querySelectorAll('figure.fr')].map((f) => f.id));
    for (const id of ids) {
      if (frames.length && !frames.includes(id)) continue;
      const scrs = await page.$$(`#${id} .scr`);
      let k = 0, kd = 0;
      for (const s of scrs) {
        if (!(await s.isVisible())) continue;
        const isPhone = await s.evaluate((e) => e.classList.contains('phone'));
        if (dev === 'phone' && !isPhone) continue; if (dev === 'phone' && id !== 'f01' && (await s.evaluate((e) => !!e.closest('.v-phone')))) continue; if (dev === 'desktop' && isPhone && (await s.evaluate((e) => !!e.closest('.v-phone')))) continue;
        const idx = isPhone ? k : kd; const name = `${id}-${th}${isPhone ? '-phone' : ''}${idx ? '-' + (idx + 1) : ''}${opt('--suffix', '')}.png`; const file = path.join(args.includes('--scratch') ? os.tmpdir() : shots, name);
        if (dev === 'desktop' && isPhone) { /* phone screens inside desktop pairs keep their own name */ }
        await s.scrollIntoViewIfNeeded(); await page.waitForTimeout(150); await s.screenshot({ path: file });
        if (!isPhone) execFileSync('sips', ['--resampleWidth', '900', file], { stdio: 'ignore' });
        console.log('shot', name); if (isPhone) k++; else kd++;
      }
    }
  }
}
await browser.close();
