import fs from 'fs';
import { CSS } from './css.mjs';
import { MARK_SCRIPT, totalSvg } from './mark.mjs';
import { I } from './lib.mjs';
const parts = process.argv.slice(2);
const secs = [];
const SEC = [
  ['map', 'A · The map', 'The company as terrain: zoom levels Z0–Z2, perspectives, overlaps as hulls, what-if ghosts, meeting perspective, the timeline layer, the list equivalent, high contrast, Hebrew, phone.', './framesA.mjs', 'sectionA'],
  ['board', 'B · Board, list, item', 'The working surfaces: board and line view, the dense table with bulk change sets, the item page with Expected vs Actual, comments that change the card, dependencies, decision and proposal cards, phone.', './framesB.mjs', 'sectionB'],
  ['inbox', 'C · Inbox, people, agents', 'What needs me, what I should do next, every agent\'s working line, people signals worded as help.', './framesC.mjs', 'sectionC'],
  ['chat', 'D · Chat, the embedded AI', 'The assistant as a first-class operator: streaming answers with citations, tool previews with permission classes, undo, model choice and cost, slash commands, email drafts, voice, sealed envelopes.', './framesD.mjs', 'sectionD'],
  ['ops', 'E · Issues, incidents, settings, brand', 'Support and incidents, the autonomy ladder and rights, notifications, connectors and budgets, sign-in, asks, externals and virtual parties, company stage, and the brand frame with the glyph legends.', './framesE.mjs', 'sectionE'],
];
for (const [k, t, d, mod, fn] of SEC) {
  if (parts.length && !parts.includes(k)) continue;
  if (!fs.existsSync(new URL(mod, import.meta.url))) continue;
  const m = await import(mod);
  secs.push(`<section class="flow" id="${k}"><h2>${t}</h2><p>${d}</p>${m[fn]()}</section>`);
}
const lab = `<div class="lab" id="lab" role="toolbar" aria-label="Look options">
<div class="grp"><span>Theme</span><button type="button" data-set="pt" data-val="deep" class="on">${I('moon')}Deep Blue</button><button type="button" data-set="pt" data-val="aqua">${I('waves')}Aqua Dusk</button><button type="button" data-set="pt" data-val="sky">${I('sun')}Sky Glass</button></div>
<div class="grp"><span>Contrast</span><button type="button" data-set="hc" data-val="std" class="on">${I('circle')}Standard</button><button type="button" data-set="hc" data-val="high">${I('contrast')}High</button></div>
<div class="grp"><span>Direction</span><button type="button" data-set="dir" data-val="ltr" class="on">${I('pilcrow-right')}LTR</button><button type="button" data-set="dir" data-val="rtl">${I('pilcrow-left')}RTL</button></div>
<div class="grp"><span>Device</span><button type="button" data-set="dev" data-val="desktop" class="on">${I('monitor')}Desktop</button><button type="button" data-set="dev" data-val="phone">${I('smartphone')}Phone</button></div>
</div>`;
const toc = SEC.map(([k, t]) => `<a href="#${k}">${t}</a>`).join('') + '<a href="#f38">Brand and legends</a>';
const LAB_JS = `(function(){var g=document.getElementById('gallery'),bar=document.getElementById('lab'),b=document.body;
function dir(v){document.querySelectorAll('#gallery .app,#gallery .phone').forEach(function(f){if(f.hasAttribute('data-fixdir'))return;if(v==='rtl'){f.setAttribute('dir','rtl');}else{f.removeAttribute('dir');}
f.querySelectorAll('[data-he]').forEach(function(e){if(!e.hasAttribute('data-en'))e.setAttribute('data-en',e.textContent);e.textContent=v==='rtl'?e.getAttribute('data-he'):e.getAttribute('data-en');});});}
function apply(k,v){g.setAttribute('data-'+k,v);if(k==='pt'){b.setAttribute('data-pt',v);document.documentElement.style.colorScheme=v==='sky'?'light':'dark';}if(k==='hc')b.setAttribute('data-hc',v);if(k==='dir')dir(v);
bar.querySelectorAll('[data-set="'+k+'"]').forEach(function(x){var on=x.getAttribute('data-val')===v;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on?'true':'false');});try{localStorage.setItem('lt-lab-'+k,v)}catch(e){}}
['pt','hc','dir','dev'].forEach(function(k){var v=null;try{v=localStorage.getItem('lt-lab-'+k)}catch(e){}if(v)apply(k,v);});
var q=new URLSearchParams(location.search);['pt','hc','dir','dev'].forEach(function(k){if(q.get(k))apply(k,q.get(k));});
bar.addEventListener('click',function(e){var x=e.target.closest('button[data-set]');if(!x)return;apply(x.getAttribute('data-set'),x.getAttribute('data-val'));});})();`;
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lucid Total Mocks</title>
<meta name="description" content="Lucid Total: HTML mocks of every screen and state in the Lucid Glass themes (Deep Blue, Aqua Dusk, Sky Glass), standard and high contrast, LTR and RTL, desktop and phone.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Sora:wght@500;600;700&family=Heebo:wght@400;500;600;700&display=swap">
<style>${CSS}</style>
</head>
<body data-pt="deep" data-hc="std">
<div class="wrap">
<header class="page"><div><h1>${totalSvg(40, 'hdrMark')}<span>Lucid Total · mocks</span></h1><p>v0.1 · 2026-10-28 · ${'42'} frames. The company operating system in the Lucid Glass language: a web management system first (rail, top bar, command bar, dense tables, side panels), the map as home, the assistant as a first-class operator. Captions name the use cases (<code>docs/01</code>) and product-plan sections (<code>docs/02</code>) each frame realises.</p></div></header>
<nav class="toc" aria-label="Sections">${toc}</nav>
${lab}
<main id="gallery" data-pt="deep" data-hc="std" data-dir="ltr" data-dev="desktop">
${secs.join('\n')}
</main>
</div>
<script>${MARK_SCRIPT}</script>
<script src="https://cdn.jsdelivr.net/npm/lucide@1.59.0/dist/umd/lucide.min.js"></script>
<script>if(window.lucide){lucide.createIcons({attrs:{"aria-hidden":"true"}});}</script>
<script>${LAB_JS}</script>
</body>
</html>`;
const out = process.env.OUT || new URL('../index.html', import.meta.url).pathname;
fs.writeFileSync(out, html);
console.log('wrote', out, (html.length / 1024).toFixed(0) + ' KB');
