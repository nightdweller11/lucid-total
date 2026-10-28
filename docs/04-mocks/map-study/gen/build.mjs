// Builds ../index.html: one page, five variants, a variant switcher and a theme switch; URL params ?v=2&pt=sky&s=company
// node gen/build.mjs   (reads gen/counts.json, written by `node gen/shoot.mjs --check`, to print the measured counts)
import fs from 'fs';
import { THEMES } from './tokens.mjs';
import { PAGE_CSS } from './page.mjs';
import { MARK_SCRIPT, totalSvg } from './mark.mjs';
import { I } from './lib.mjs';

const here = new URL('.', import.meta.url).pathname;
const VARIANTS = ['./v1-relief.mjs', './v2-city.mjs', './v3-biome.mjs', './v4-orbits.mjs', './v5-lines.mjs'];
let counts = {}; try { counts = JSON.parse(fs.readFileSync(here + 'counts.json', 'utf8')); } catch { /* first pass */ }

const secs = [], tabs = [];
for (const mod of VARIANTS) {
  if (!fs.existsSync(here + mod.slice(2))) continue;
  const m = await import(mod);
  const { n, name, line, intro } = m.meta;
  tabs.push(`<button type="button" data-set="v" data-val="${n}">${I(m.meta.icon)}V${n} ${name}</button>`);
  const figs = m.stills().map((st) => {
    const id = `v${n}-${st.id}${st.phone ? '-phone' : ''}`;
    const c = counts[id];
    const att = c ? `needs-you ${c.needs} · text ${c.big} · numbers ${c.nums}` : 'needs-you – · text – · numbers –';
    return `<figure class="fr${st.phone ? ' ph' : ''}" id="${id}" data-v="${n}" data-still="${st.id}"${st.sky ? ' data-sky="1"' : ''}${st.glance ? ' data-glance="1"' : ''}>
<div class="fit"><div class="scr${st.phone ? ' phone' : ''}" role="img" aria-label="${st.title.replace(/"/g, '&quot;')}">${st.html}</div></div>
<figcaption><b>${st.title}.</b> ${st.caption} <span class="att">${att}</span></figcaption></figure>`;
  });
  const phones = figs.filter((f) => f.includes('class="fr ph"'));
  const desk = figs.filter((f) => !f.includes('class="fr ph"'));
  secs.push(`<section class="var" id="v${n}" data-v="${n}"><h2>V${n} · ${name}</h2><p><b>${line}</b> ${intro}</p>${desk.join('\n')}<div class="row">${phones.join('\n')}</div></section>`);
}

const lab = `<div class="lab" id="lab" role="toolbar" aria-label="Variant and look">
<div class="grp"><span>Variant</span>${tabs.join('')}<button type="button" data-set="v" data-val="all">${I('rows-3')}All</button></div>
<div class="grp"><span>Theme</span><button type="button" data-set="pt" data-val="deep" class="on">${I('moon')}Deep Blue</button><button type="button" data-set="pt" data-val="aqua">${I('waves')}Aqua Dusk</button><button type="button" data-set="pt" data-val="sky">${I('sun')}Sky Glass</button></div>
<div class="grp"><span>Contrast</span><button type="button" data-set="hc" data-val="std" class="on">${I('circle')}Standard</button><button type="button" data-set="hc" data-val="high">${I('contrast')}High</button></div>
</div>`;

const JS = `(function(){var b=document.body,bar=document.getElementById('lab'),q=new URLSearchParams(location.search);
function apply(k,v){if(k==='pt'){b.setAttribute('data-pt',v);document.documentElement.style.colorScheme=v==='sky'?'light':'dark';}
if(k==='hc')b.setAttribute('data-hc',v);
if(k==='v'){document.querySelectorAll('section.var').forEach(function(s){s.hidden=!(v==='all'||s.getAttribute('data-v')===v);});}
bar.querySelectorAll('[data-set="'+k+'"]').forEach(function(x){var on=x.getAttribute('data-val')===v;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on?'true':'false');});
if(k!=='hc'){var u=new URL(location.href);u.searchParams.set(k,v);history.replaceState(null,'',u);}fit();}
function fit(){if(q.get('shoot'))return;document.querySelectorAll('figure.fr .fit').forEach(function(f){var s=f.firstElementChild,w=s.classList.contains('phone')?390:1440,h=s.classList.contains('phone')?844:900,ph=s.classList.contains('phone'),z=Math.min(1,(f.parentElement.clientWidth-(ph?24:0))/w);if(ph){f.style.width=(w*z+22)+'px';f.style.padding='11px';f.style.boxSizing='border-box';}s.style.zoom=z;f.style.height=(h*z+(ph?22:0))+'px';});}
apply('v',q.get('v')||'1');apply('pt',q.get('pt')||'deep');apply('hc',q.get('hc')||'std');
var st=q.get('s');if(st){document.querySelectorAll('figure.fr').forEach(function(f){if(f.getAttribute('data-still')!==st)f.hidden=true;});}
bar.addEventListener('click',function(e){var x=e.target.closest('button[data-set]');if(!x)return;apply(x.getAttribute('data-set'),x.getAttribute('data-val'));});
addEventListener('resize',fit);})();`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Company Map Study</title>
<meta name="description" content="Lucid Total map study: five explorations of the company world (Relief, City, Biome, Orbits, Lines), each with three zoom depths, five data layers, the same stuck situation, a phone still and Sky Glass.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Sora:wght@400;500;600;700&display=swap">
<style>${THEMES}${PAGE_CSS}</style>
</head>
<body data-pt="deep" data-hc="std">
<div class="wrap">
<header class="page"><h1>${totalSvg(38, 'hdrMark')}<span>The company map · five explorations</span></h1>
<p>A design study for Lucid Total (2026-10-28). The same company, the same stuck situation and the same three depths drawn five ways, so the owner can compare metaphors rather than polish. Every still keeps the attention budget of <code>docs/13</code> §3; the counts under each still are measured from the rendered page. The case and the recommendation are in <code>STUDY.md</code>.</p></header>
${lab}
<main id="gallery">
${secs.join('\n')}
</main>
</div>
<script>${MARK_SCRIPT}</script>
<script src="https://cdn.jsdelivr.net/npm/lucide@1.59.0/dist/umd/lucide.min.js"></script>
<script>if(window.lucide){lucide.createIcons({attrs:{"aria-hidden":"true"}});}</script>
<script>${JS}</script>
</body>
</html>`;
fs.writeFileSync(here + '../index.html', html);
console.log('wrote index.html', (html.length / 1024).toFixed(0) + ' KB');
