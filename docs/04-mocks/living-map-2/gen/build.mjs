#!/usr/bin/env node
// @ts-check
/**
 * Builds docs/04-mocks/living-map-2/index.html: the second pass of the living map (T35), one self-contained page.
 *   node gen/build.mjs
 * Inputs: the first pass's datasets (../living-map/data) and its vendored Lucide icons, enriched here with projects,
 * asks and policies (gen/enrich.mjs); src/*.js, src/style.css; and the v0.2 gallery's vocabulary (../../gen).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { enrich } from './enrich.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const V1 = path.join(ROOT, '..', 'living-map');
const V02 = path.join(ROOT, '..', 'gen');
const read = (/** @type {string} */ p) => readFileSync(p, 'utf8');
const { normaliseLucid } = await import(path.join(V1, 'gen', 'normalise-lucid.mjs'));
const { TOKENS } = await import(path.join(V02, 'tokens.mjs'));
const { LANDMARKS } = await import(path.join(V02, 'landmarks.mjs'));
const { KINDS } = await import(path.join(V02, 'lib.mjs'));
const { F, resetFacadeIds } = await import(path.join(V02, 'facades.mjs'));
const { MARK_SCRIPT, D: MARK_D } = await import(path.join(V02, 'mark.mjs'));

// ---- icons: SVG elements -> one path string each (24-unit grid) ----
const iconsRaw = JSON.parse(read(path.join(V1, 'gen/vendor/lucide-icons.json')));
const num = (/** @type {string} */ s, /** @type {string} */ k, d = 0) => { const m = new RegExp(`${k}="([^"]+)"`).exec(s); return m ? Number(m[1]) : d; };
const NUM = '[-+]?(?:\\d*\\.\\d+|\\d+\\.?)(?:[eE][-+]?\\d+)?';
const absStart = (/** @type {string} */ d) => d.replace(new RegExp(`^\\s*m\\s*(${NUM})[\\s,]*(${NUM})\\s*,?\\s*(?=[-+.\\d])`), 'M$1 $2 l').replace(/^\s*m/, 'M');
const toPath = (/** @type {string} */ inner) => {
  const out = [];
  for (const m of inner.matchAll(/<(path|circle|rect|line|polyline|polygon|ellipse)\b([^>]*)\/?>/g)) {
    const [, tag, a] = m;
    if (tag === 'path') { const d = /d="([^"]+)"/.exec(a); if (d) out.push(absStart(d[1])); }
    else if (tag === 'circle') { const cx = num(a, 'cx'), cy = num(a, 'cy'), r = num(a, 'r'); out.push(`M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`); }
    else if (tag === 'ellipse') { const cx = num(a, 'cx'), cy = num(a, 'cy'), rx = num(a, 'rx'), ry = num(a, 'ry'); out.push(`M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0`); }
    else if (tag === 'rect') { const x = num(a, 'x'), y = num(a, 'y'), w = num(a, 'width'), h = num(a, 'height'), rx = num(a, 'rx'); out.push(rx ? `M${x + rx} ${y}h${w - 2 * rx}a${rx} ${rx} 0 0 1 ${rx} ${rx}v${h - 2 * rx}a${rx} ${rx} 0 0 1 ${-rx} ${rx}h${-(w - 2 * rx)}a${rx} ${rx} 0 0 1 ${-rx} ${-rx}v${-(h - 2 * rx)}a${rx} ${rx} 0 0 1 ${rx} ${-rx}z` : `M${x} ${y}h${w}v${h}h${-w}z`); }
    else if (tag === 'line') out.push(`M${num(a, 'x1')} ${num(a, 'y1')}L${num(a, 'x2')} ${num(a, 'y2')}`);
    else if (tag === 'polyline' || tag === 'polygon') { const p = /points="([^"]+)"/.exec(a); if (p) { const pts = p[1].trim().split(/[\s,]+/).map(Number); let d = ''; for (let i = 0; i < pts.length; i += 2) d += (i ? 'L' : 'M') + pts[i] + ' ' + pts[i + 1]; out.push(d + (tag === 'polygon' ? 'z' : '')); } }
  }
  return out.join('');
};
const ICONS = Object.fromEntries(Object.entries(iconsRaw.icons).map(([k, v]) => [k, toPath(v)]));

// ---- facades ----
resetFacadeIds();
const svgWrap = (/** @type {string} */ body, label = 'Product image') => `<svg class="fac" viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">${body}</svg>`;
const ln = (x, y, w, c = '#fff', o = 0.5, h = 3) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${c}" fill-opacity="${o}"/>`;
const infra = () => svgWrap(`<rect width="160" height="120" fill="#101a33"/><rect x="26" y="14" width="108" height="92" rx="8" fill="#1b2a4a" stroke="#2c3f66"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="34" y="${22 + i * 16}" width="92" height="12" rx="3" fill="#0d1733"/><circle cx="42" cy="${28 + i * 16}" r="2.4" fill="${i === 3 ? '#ffc96b' : '#47d16c'}"/>${ln(50, 26.6 + i * 16, 40, '#8dbaff', 0.5, 2.6)}${ln(96, 26.6 + i * 16, 22, '#5fe3cf', 0.35, 2.6)}`).join('')}`, 'Infrastructure');
const term = () => svgWrap(`<rect width="160" height="120" fill="#0b1020"/><rect x="0" y="0" width="160" height="14" fill="#1a2238"/><circle cx="10" cy="7" r="2.2" fill="#ff7d85"/><circle cx="18" cy="7" r="2.2" fill="#ffd88a"/><circle cx="26" cy="7" r="2.2" fill="#47d16c"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `${ln(12, 24 + i * 12, 8, '#5fe3cf', 0.9, 2.6)}${ln(24, 24 + i * 12, 30 + ((i * 41) % 70), i === 4 ? '#9be8b0' : '#c9d4ea', i === 4 ? 0.9 : 0.55, 2.6)}`).join('')}<rect x="12" y="108" width="6" height="8" fill="#5fe3cf"/>`, 'Terminal');
const FACADES = {
  screens: F.screens({}), chart: F.chart({}), bars: F.bars({}), doc: F.doc({}), build: F.badge({}), code: F.diff({}), listing: F.landing({}), poster: F.poster({}),
  video: F.video({}), account: F.account({}), envelope: F.envelope({}), report: F.report({}), trophy: F.trophy({}), infra: infra(), term: term(),
};

const VOCAB = `window.LM=window.LM||{};LM.ICONS=${JSON.stringify(ICONS)};LM.LANDMARKS=${JSON.stringify(Object.fromEntries(Object.entries(LANDMARKS).map(([k, v]) => [k, { name: v[0], subject: v[1], d: v[2] }])))};LM.KINDS=${JSON.stringify(KINDS)};LM.FACADES=${JSON.stringify(FACADES)};LM.MARK_D=${JSON.stringify(MARK_D)};`;

const lucid = enrich(normaliseLucid(JSON.parse(read(path.join(V1, 'data/lucid-chat.json')))));
const example = enrich(JSON.parse(read(path.join(V1, 'data/example-co.json'))));
const data = JSON.stringify({ lucid, example }).replace(/<\/script/g, '<\\/script');
const js = ['src/model.js', 'src/layout.js', 'src/pics.js', 'src/render.js', 'src/panel.js', 'src/ui.js'].map((f) => `// ---- ${f} ----\n${read(path.join(ROOT, f))}`).join('\n');

const html = `<!doctype html>
<html lang="en" data-pt="deep" data-hc="std">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Lucid Total · The living map, second pass</title>
<meta name="description" content="The company as an isometric world: what is happening now, the layers that explain it, the projects that divide the work, and the timeline as a tool. Second pass of the living map (T35), on the Lucid Total v0.2 line.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Sora:wght@500;600&display=swap" rel="stylesheet">
<style>${TOKENS}</style>
<style>${read(path.join(ROOT, 'src/style.css'))}</style>
</head>
<body>
<div id="app"></div>
<script>${VOCAB.replace(/<\/script/g, '<\\/script')}</script>
<script>window.LM.DATA=${data};</script>
<script>${MARK_SCRIPT.replace(/<\/script/g, '<\\/script')}</script>
<script>
${js}
</script>
</body>
</html>`;
writeFileSync(path.join(ROOT, 'index.html'), html);
console.log(`index.html ${(html.length / 1e6).toFixed(2)} MB · lucid ${lucid.items.length} items / ${lucid.projects.length} projects / ${lucid.asks.length} asks / ${lucid.policies.length} policies · example ${example.items.length} / ${example.projects.length} / ${example.asks.length} / ${example.policies.length}`);
