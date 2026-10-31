#!/usr/bin/env node
// @ts-check
/**
 * Builds docs/04-mocks/calendar/index.html: the calendar exploration (T41), one self-contained page on the living
 * map's data, model and vocabulary.
 *   node gen/build.mjs
 * Inputs: the first pass's datasets (../living-map/data), enriched by the second pass (../living-map-2/gen/enrich.mjs:
 * projects, subtasks, asks, policies, artifacts); the second pass's model and pictures (../living-map-2/src/model.js,
 * pics.js) and its stylesheet; src/cal.js and src/style.css here; the v0.2 vocabulary (../gen).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const V1 = path.join(ROOT, '..', 'living-map');
const V2 = path.join(ROOT, '..', 'living-map-2');
const V02 = path.join(ROOT, '..', 'gen');
const read = (/** @type {string} */ p) => readFileSync(p, 'utf8');
const { enrich } = await import(path.join(V2, 'gen', 'enrich.mjs'));
const { normaliseLucid } = await import(path.join(V1, 'gen', 'normalise-lucid.mjs'));
const { TOKENS } = await import(path.join(V02, 'tokens.mjs'));
const { LANDMARKS } = await import(path.join(V02, 'landmarks.mjs'));
const { KINDS } = await import(path.join(V02, 'lib.mjs'));
const { MARK_SCRIPT, D: MARK_D } = await import(path.join(V02, 'mark.mjs'));

// ---- icons: SVG elements -> one path string each (24-unit grid), as the living map does ----
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
const VOCAB = `window.LM=window.LM||{};LM.ICONS=${JSON.stringify(ICONS)};LM.LANDMARKS=${JSON.stringify(Object.fromEntries(Object.entries(LANDMARKS).map(([k, v]) => [k, { name: v[0], subject: v[1], d: v[2] }])))};LM.KINDS=${JSON.stringify(KINDS)};LM.FACADES={};LM.MARK_D=${JSON.stringify(MARK_D)};`;

const lucid = enrich(normaliseLucid(JSON.parse(read(path.join(V1, 'data/lucid-chat.json')))));
const example = enrich(JSON.parse(read(path.join(V1, 'data/example-co.json'))));
const data = JSON.stringify({ lucid, example }).replace(/<\/script/g, '<\\/script');
const js = [[V2, 'src/model.js'], [V2, 'src/pics.js'], [ROOT, 'src/cal.js']].map(([r, f]) => `// ---- ${f} ----\n${read(path.join(r, f))}`).join('\n');

const html = `<!doctype html>
<html lang="en" data-pt="deep" data-hc="std">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Lucid Total · The calendar</title>
<meta name="description" content="The company by when: every day a place in time with its harvest, its problems, what got unstuck, what was decided and who worked; three ways to draw it (tiles, the river, the strata), two zooms (hierarchy and time), on the real log and the example company. Lucid Total calendar exploration (T41).">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Sora:wght@500;600&display=swap" rel="stylesheet">
<style>${TOKENS}</style>
<style>${read(path.join(V2, 'src/style.css'))}</style>
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
console.log(`index.html ${(html.length / 1e6).toFixed(2)} MB · lucid ${lucid.items.length} items · example ${example.items.length} items`);
