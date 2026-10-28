// Stills and the attention check for the map study (approach copied from ../../gen/shoot.mjs: Playwright from the
// global install, the cached Chromium). node gen/shoot.mjs [--check] [--v 1,2] [--only v1-company,...] [--themes deep,sky]
//   --check  measures every still (needs-you marks, text elements above body size, numbers) into gen/counts.json
//   default  shoots shots/v<n>-<still>-<theme>[-phone].png: Deep Blue for every still, Sky Glass for the company depth
//            (figures with data-sky); desktop resampled to 900 px wide, phone kept at 390 px.
import fs from 'fs'; import path from 'path'; import os from 'os'; import { execFileSync } from 'child_process';
let pw; try { pw = await import('playwright'); } catch { pw = await import('/usr/local/lib/node_modules/playwright/index.mjs'); }
const args = process.argv.slice(2); const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const here = path.dirname(new URL(import.meta.url).pathname); const root = path.resolve(here, '..'); const shots = path.join(root, 'shots');
fs.mkdirSync(shots, { recursive: true });
let exe = process.env.CHROMIUM;
if (!exe) { const c = path.join(os.homedir(), 'Library/Caches/ms-playwright'); try { const d = fs.readdirSync(c).filter((x) => /^chromium-\d+$/.test(x)).sort().pop(); const sub = fs.readdirSync(path.join(c, d)).find((x) => x.startsWith('chrome-mac')); const app = fs.readdirSync(path.join(c, d, sub)).find((x) => x.endsWith('.app')); const mac = path.join(c, d, sub, app, 'Contents/MacOS'); exe = path.join(mac, fs.readdirSync(mac)[0]); } catch { exe = undefined; } }
const browser = await pw.chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 1560, height: 1000 }, deviceScaleFactor: 1 });
const vs = opt('--v', '1,2,3,4,5').split(','); const only = (opt('--only', '') || '').split(',').filter(Boolean);
const url = (q) => 'file://' + path.join(root, 'index.html') + '?shoot=1&' + q;
const ready = async () => { await page.addStyleTag({ content: '.lab{position:static!important}' }); await page.waitForLoadState('networkidle'); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(250); };

if (args.includes('--check')) {
  const file = path.join(here, 'counts.json'); let out = {}; try { out = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* new */ }
  await page.goto(url('v=all&pt=deep')); await ready();
  const rows = await page.evaluate(() => [...document.querySelectorAll('figure.fr')].map((f) => {
    const scr = f.querySelector('.scr'); const big = new Set(); let nums = 0; const list = [];
    const tw = document.createTreeWalker(scr, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) {
      const t = tw.currentNode.textContent.trim(); if (!t) continue; const el = tw.currentNode.parentElement;
      if (!el || el.closest('.fac,title,[data-ambient],.status')) continue;
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); if (cs.visibility === 'hidden' || cs.display === 'none' || r.width === 0) continue;
      let op = 1, e = el; while (e && e !== scr) { op *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; } if (op < 0.2) continue;
      if (parseFloat(cs.fontSize) > 15.5) big.add(el);
      const m = t.match(/\d[\d,.:%]*/g); if (m) { nums += m.length; list.push(...m); }
    }
    return { id: f.id, glance: f.dataset.glance === '1', big: big.size, nums, needs: scr.querySelectorAll('[data-needs]').length, list: list.join(' ') };
  }));
  for (const r of rows) {
    if (!vs.includes(r.id.slice(1, 2))) continue;
    out[r.id] = { needs: r.needs, big: r.big, nums: r.nums };
    const over = r.big > 12 || r.needs > 3 || r.nums > 7 ? '  <-- OVER BUDGET' : '';
    console.log(`${r.id.padEnd(22)} needs ${r.needs}  text ${String(r.big).padStart(2)}  numbers ${r.nums}${over}${r.list ? '   [' + r.list + ']' : ''}`);
  }
  fs.writeFileSync(file, JSON.stringify(out, null, 1));
} else {
  for (const th of opt('--themes', 'deep,sky').split(',')) {
    for (const v of vs) {
      await page.goto(url(`v=${v}&pt=${th}`)); await ready();
      const ids = await page.evaluate((th) => [...document.querySelectorAll('section.var:not([hidden]) figure.fr')].filter((f) => th !== 'sky' || f.dataset.sky === '1').map((f) => f.id), th);
      for (const id of ids) {
        if (only.length && !only.includes(id)) continue;
        const s = await page.$(`#${id} .scr`); const phone = id.endsWith('-phone');
        const name = phone ? `${id.replace(/-phone$/, '')}-${th}-phone.png` : `${id}-${th}.png`; const file = path.join(shots, name);
        await s.scrollIntoViewIfNeeded(); await page.waitForTimeout(100); await s.screenshot({ path: file });
        if (!phone) execFileSync('sips', ['--resampleWidth', '900', file], { stdio: 'ignore' });
        console.log('shot', name);
      }
    }
  }
}
await browser.close();
