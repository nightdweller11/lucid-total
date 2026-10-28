#!/usr/bin/env node
// @ts-check
/**
 * Assembles the mocks site and deploys it to Railway (`infra/mocks-site/README.md`).
 *
 *   node infra/mocks-site/publish.mjs            build `infra/mocks-site/build/` and deploy with `railway up`
 *   node infra/mocks-site/publish.mjs --dry-run  build only, print the tree
 *
 * The build folder holds the Dockerfile, the server and `public/`: the v0.2 gallery at `/`, the map study at
 * `/map-study/`, the archived v0.1 at `/v0.1/`, the briefs and READMEs as text, and a small landing page at
 * `/index.html` only when the gallery is absent. Railway builds the image from the upload (`railway up --path-as-root`),
 * linked project `lucid-total-mocks`, service `mocks-site`.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const MOCKS = path.join(REPO, 'docs', '04-mocks');
const BUILD = path.join(HERE, 'build');
const PUBLIC = path.join(BUILD, 'public');
const dry = process.argv.includes('--dry-run');

rmSync(BUILD, { recursive: true, force: true });
mkdirSync(PUBLIC, { recursive: true });
cpSync(path.join(HERE, 'Dockerfile'), path.join(BUILD, 'Dockerfile'));
cpSync(path.join(HERE, 'server.mjs'), path.join(BUILD, 'server.mjs'));

/** Copy a gallery folder: its index.html, shots and READMEs, never its generator. @param {string} from @param {string} to */
function gallery(from, to) {
  if (!existsSync(from)) return false;
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    if (name === 'gen' || name === 'build' || name.startsWith('.')) continue;
    const src = path.join(from, name);
    if (statSync(src).isDirectory()) {
      if (name === 'shots') cpSync(src, path.join(to, name), { recursive: true });
      continue;
    }
    if (/\.(html|md|png|jpg|svg|json)$/.test(name)) cpSync(src, path.join(to, name));
  }
  return true;
}

const hasGallery = gallery(MOCKS, PUBLIC);
gallery(path.join(MOCKS, 'v0.1'), path.join(PUBLIC, 'v0.1'));
gallery(path.join(MOCKS, 'map-study'), path.join(PUBLIC, 'map-study'));

const links = [
  hasGallery && '<li><a href="./index.html">Mocks v0.2</a> — the gallery (40 frames; lab bar for theme, contrast, direction, device)</li>',
  existsSync(path.join(PUBLIC, 'map-study', 'index.html')) && '<li><a href="./map-study/">Map study</a> — five explorations of the company world (<a href="./map-study/STUDY.md">the study</a>)</li>',
  existsSync(path.join(PUBLIC, 'v0.1', 'index.html')) && '<li><a href="./v0.1/">Mocks v0.1</a> — the archived first wave, for comparison</li>',
  '<li><a href="./README.md">README</a> · <a href="./BRIEF-v0.2.md">Brief v0.2</a></li>',
].filter(Boolean);
writeFileSync(
  path.join(PUBLIC, 'start.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lucid Total mocks</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#07173a;color:#e8eefc;font:17px/1.5 system-ui,sans-serif}main{max-width:560px;padding:32px}h1{font-weight:600;font-size:28px;margin:0 0 8px}a{color:#8fc4ff}li{margin:10px 0}</style></head><body><main><h1>Lucid Total mocks</h1><p>Design references for the company operating system.</p><ul>${links.join('')}</ul></main></body></html>`,
);

const size = (/** @type {string} */ dir) => readdirSync(dir, { recursive: true, withFileTypes: true })
  .filter((d) => d.isFile()).reduce((n, d) => n + statSync(path.join(d.parentPath ?? d.path, d.name)).size, 0);
console.log(`built ${BUILD} (${(size(PUBLIC) / 1e6).toFixed(1)} MB in public/)`);
for (const top of readdirSync(PUBLIC)) console.log(`  ${top}`);
if (dry) process.exit(0);

const up = spawnSync('railway', ['up', BUILD, '--path-as-root', '--service', 'mocks-site', '--detach'], {
  cwd: REPO,
  stdio: 'inherit',
});
process.exit(up.status ?? 1);
