// node docs/04-mocks/gen/build.mjs  ->  docs/04-mocks/index.html (deterministic: rebuilds byte-identically)
import fs from 'fs';
import { CSS } from './css.mjs';
import { MARK_SCRIPT, totalSvg } from './mark.mjs';
import { I } from './lib.mjs';
import { resetFacadeIds } from './facades.mjs';
resetFacadeIds();
const SEC = [
  ['world', 'A · Horizon and the world', 'Glance and Dive: the Horizon over a world that breathes beneath it, the company as places with landmarks and rings, perspectives, the zoom that reveals, the buildings that show the product, and the board as an instrument.', './framesA.mjs', 'sectionA'],
  ['products', 'B · Products', 'The item is a product view: the product large and first, expected beside actual, the goal and the done rule in one line each, criteria as a ring, the talk, the roads, and the implications first when done.', './framesB.mjs', 'sectionB'],
  ['decisions', 'C · Decisions', 'Decide mode: a decision is a fork with its consequences drawn and a published confidence per path; strategy as futures with haze; Refocus as effort moved over the world with the transparency strip; the small change; an ask as a small fork.', './framesC.mjs', 'sectionC'],
  ['meet', 'D · Meetings and daily use', 'Meet mode and the quick moments: the Table where spoken decisions land on the world, minutes that nobody writes, a status composed from one question, and a scene re-composed on request.', './framesD.mjs', 'sectionD'],
  ['aspects', 'E · Aspects and infographics', 'Dashboards that are places to think: quiet, trend and shape first, the finding as the headline of every chart, one tap into the places behind a number; infographics as one story on one screen.', './framesE.mjs', 'sectionE'],
  ['system', 'F · The system', 'Lucid Total runs itself: its subsystems as a place, repairs as visible loops with evidence, AI processes as quiet cards with four states, models as classes and decisions, autonomy as a trust layer on the world.', './framesF.mjs', 'sectionF'],
  ['channels', 'G · Channels', 'The system where people already are: a verified contact in Lucid Chat, decisions by email reply, a quiet member of Slack channels.', './framesG.mjs', 'sectionG'],
  ['phone', 'H · Phone', 'The phone is its own surface: one place or one decision at a time, full-bleed, hold to confirm and hold to talk.', './framesH.mjs', 'sectionH'],
  ['projects', 'J · Projects and policies', 'The divisible level above a task, with and without the map; and policies, the behavioural decisions that reach into the day to day (T35).', './framesJ.mjs', 'sectionJ'],
  ['variants', 'I · Variants and legend', 'Right to left, high contrast, the list equivalent, and the reference sheet of the mark, the landmarks and the grammar.', './framesI.mjs', 'sectionI'],
];
const secs = [];
for (const [k, t, d, mod, fn] of SEC) {
  if (!fs.existsSync(new URL(mod, import.meta.url))) continue;
  const m = await import(mod); const html = m[fn](); if (!html) continue;
  secs.push(`<section class="flow" id="${k}"><h2>${t}</h2><p>${d}</p>${html}</section>`);
}
const lab = `<div class="lab" id="lab" role="toolbar" aria-label="Look options">
<div class="grp"><span>Theme</span><button type="button" data-set="pt" data-val="deep" class="on">${I('moon')}Deep Blue</button><button type="button" data-set="pt" data-val="aqua">${I('waves')}Aqua Dusk</button><button type="button" data-set="pt" data-val="sky">${I('sun')}Sky Glass</button></div>
<div class="grp"><span>Contrast</span><button type="button" data-set="hc" data-val="std" class="on">${I('circle')}Standard</button><button type="button" data-set="hc" data-val="high">${I('contrast')}High</button></div>
<div class="grp"><span>Direction</span><button type="button" data-set="dir" data-val="ltr" class="on">${I('pilcrow-right')}LTR</button><button type="button" data-set="dir" data-val="rtl">${I('pilcrow-left')}RTL</button></div>
<div class="grp"><span>Device</span><button type="button" data-set="dev" data-val="desktop" class="on">${I('monitor')}Desktop</button><button type="button" data-set="dev" data-val="phone">${I('smartphone')}Phone</button></div>
</div>`;
const toc = SEC.map(([k, t]) => `<a href="#${k}">${t}</a>`).join('');
const LAB_JS = `(function(){var g=document.getElementById('gallery'),bar=document.getElementById('lab'),b=document.body;
function dir(v){document.querySelectorAll('#gallery .scr').forEach(function(f){if(f.hasAttribute('data-fixdir'))return;if(v==='rtl'){f.setAttribute('dir','rtl');}else{f.removeAttribute('dir');}});}
function fit(){document.querySelectorAll('#gallery figure.fr .fit').forEach(function(f){var sw=parseFloat(f.style.getPropertyValue('--sw')),av=f.parentElement.clientWidth;f.style.setProperty('--fit',Math.min(1,av/sw).toFixed(4));});}
function apply(k,v){g.setAttribute('data-'+k,v);if(k==='pt'){b.setAttribute('data-pt',v);document.documentElement.style.colorScheme=v==='sky'?'light':'dark';}if(k==='hc')b.setAttribute('data-hc',v);if(k==='dir')dir(v);
bar.querySelectorAll('[data-set="'+k+'"]').forEach(function(x){var on=x.getAttribute('data-val')===v;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on?'true':'false');});try{localStorage.setItem('lt2-lab-'+k,v)}catch(e){}fit();}
['pt','hc','dir','dev'].forEach(function(k){var v=null;try{v=localStorage.getItem('lt2-lab-'+k)}catch(e){}if(v)apply(k,v);});
var q=new URLSearchParams(location.search);['pt','hc','dir','dev'].forEach(function(k){if(q.get(k))apply(k,q.get(k));});
bar.addEventListener('click',function(e){var x=e.target.closest('button[data-set]');if(!x)return;apply(x.getAttribute('data-set'),x.getAttribute('data-val'));});
window.addEventListener('resize',fit);fit();})();`;
const GAL_CSS = `#gallery[data-dev="phone"] .v-desk{display:none}#gallery:not([data-dev="phone"]) .v-phone{display:none}#gallery:not([data-dev="phone"])>.phone-note{display:none}`;
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lucid Total Mocks</title>
<meta name="description" content="Lucid Total mocks v0.2: the company operating system. The Horizon, the world as a map at every depth, products as facades, decisions as forks, in the Lucid Glass themes, both directions, desktop and phone.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Sora:wght@500;600;700&family=Heebo:wght@400;500;600;700&display=swap">
<style>${CSS}${GAL_CSS}</style>
</head>
<body data-pt="deep" data-hc="std">
<div class="wrap">
<header class="page"><div><h1>${totalSvg(40, 'hdrMark')}<span>Lucid Total · mocks v0.2</span></h1><p>2026-10-28. An operating system, not a reporting system: the Horizon shows the few things that need you over a world that breathes beneath it; Talk is the shell; the world is a map at every depth, its places have landmarks and rings, its buildings show the products; decisions are forks with their consequences drawn. Every caption names its focal subject, its use cases and its attention counts.</p></div></header>
<nav class="toc" aria-label="Sections">${toc}</nav>
${lab}
<main id="gallery" data-pt="deep" data-hc="std" data-dir="ltr" data-dev="desktop">
<p class="phone-note gl" style="padding:14px 18px;border-radius:20px;font-size:15px;margin:0 0 16px">Device · Phone shows the designed phone layout wherever a moment has one (frames 1, 2, 5, 6, 8, 12, 14 and 19, and the phone frames 34–37). The other frames stay desktop on purpose: the phone never shows a shrunk desktop (docs/13 §10).</p>
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
