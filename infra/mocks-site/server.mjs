// @ts-check
/**
 * Lucid Total mocks site: a dependency-free static server for the mock galleries and the map study
 * (`docs/04-mocks/`), deployed on Railway (`infra/mocks-site/README.md`). Serves `public/` next to this file.
 *
 * Env: PORT (default 8080) · MOCKS_SITE_USER + MOCKS_SITE_PASSWORD (optional: when both are set the site asks for
 * HTTP basic auth; `/healthz` always answers without it). Log: one line per request (method, path without the query,
 * status); never a header, a body or a credential.
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import { createReadStream, realpathSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const USER = process.env.MOCKS_SITE_USER || '';
const PASSWORD = process.env.MOCKS_SITE_PASSWORD || '';
const PROTECTED = Boolean(USER && PASSWORD);
const ROOT = realpathSync(path.join(HERE, 'public'));

const TYPES = /** @type {Record<string, string>} */ ({
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
});
const digest = (/** @type {string} */ s) => createHash('sha256').update(s).digest();
const WANT = digest(`${USER}:${PASSWORD}`);

/** @param {string | undefined} header */
function authorized(header) {
  if (!PROTECTED) return true;
  const m = /^Basic ([A-Za-z0-9+/=]+)$/.exec(header || '');
  const pair = m ? Buffer.from(m[1], 'base64').toString('utf8') : '';
  return Boolean(m) && timingSafeEqual(digest(pair), WANT);
}
const say = (/** @type {string} */ s) => process.stdout.write(`${s}\n`);

createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://x');
  const method = req.method || 'GET';
  const done = (/** @type {number} */ status) => say(`${method} ${url.pathname} ${status}`);
  if (url.pathname === '/healthz') {
    res.writeHead(200, { 'content-type': 'text/plain' }).end('ok');
    return done(200);
  }
  if (!authorized(req.headers.authorization)) {
    res.writeHead(401, { 'www-authenticate': 'Basic realm="Lucid Total mocks"', 'content-type': 'text/plain' }).end('auth');
    return done(401);
  }
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405).end();
    return done(405);
  }
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.resolve(ROOT, `.${rel}`);
  if (!file.startsWith(ROOT + path.sep) && file !== ROOT) {
    res.writeHead(403).end();
    return done(403);
  }
  let st;
  try {
    st = statSync(file);
    if (st.isDirectory()) {
      res.writeHead(301, { location: `${url.pathname}/` }).end();
      return done(301);
    }
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
    return done(404);
  }
  const ext = path.extname(file).toLowerCase();
  const immutable = /^\/(shots|.+\/shots)\//.test(url.pathname) || url.searchParams.has('v');
  res.writeHead(200, {
    'content-type': TYPES[ext] || 'application/octet-stream',
    'content-length': st.size,
    'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    'x-content-type-options': 'nosniff',
  });
  if (method === 'HEAD') {
    res.end();
    return done(200);
  }
  createReadStream(file).pipe(res);
  done(200);
}).listen(PORT, () => say(`mocks-site listening on ${PORT}${PROTECTED ? ' (basic auth)' : ' (public)'}`));
