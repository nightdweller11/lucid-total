#!/usr/bin/env node
// @ts-check
/**
 * Builds docs/04-mocks/living-map/index.html: one self-contained page with both datasets inlined.
 *   node gen/build.mjs
 * Inputs: data/lucid-chat.json (from extract.mjs), data/example-co.json (from example.mjs), src/*.js, src/style.css,
 * and the Lucid Glass tokens of the v0.2 gallery (../gen/tokens.mjs).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normaliseLucid } from './normalise-lucid.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const read = (/** @type {string} */ p) => readFileSync(path.join(ROOT, p), 'utf8');
const { TOKENS } = await import(path.join(ROOT, '..', 'gen', 'tokens.mjs'));

const lucid = normaliseLucid(JSON.parse(read('data/lucid-chat.json')));
const example = JSON.parse(read('data/example-co.json'));
const data = JSON.stringify({ lucid, example }).replace(/<\/script/g, '<\\/script');
const js = ['src/model.js', 'src/layout.js', 'src/render.js', 'src/ui.js'].map((f) => `// ---- ${f} ----\n${read(f)}`).join('\n');

const html = `<!doctype html>
<html lang="en" data-pt="deep" data-hc="std">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Lucid Total · The living map</title>
<meta name="description" content="The company as a world that grows: a time-based simulation of the living map with the real log of Lucid Chat's build and a generated example company.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&family=Sora:wght@500;600&display=swap" rel="stylesheet">
<style>${TOKENS}</style>
<style>${read('src/style.css')}</style>
</head>
<body>
<div id="app"></div>
<script>window.LM={};window.LM.DATA=${data};</script>
<script>
${js}
</script>
</body>
</html>`;
writeFileSync(path.join(ROOT, 'index.html'), html);
console.log(`index.html ${(html.length / 1e6).toFixed(2)} MB · lucid ${lucid.items.length} items / ${lucid.decisions.length} decisions / ${lucid.milestones.length} landmarks · example ${example.items.length} / ${example.decisions.length} / ${example.milestones.length}`);
