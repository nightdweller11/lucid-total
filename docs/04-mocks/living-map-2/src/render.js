/* The living map, fourth pass: three levels, the information overlaid on the territories (docs/16 §18, docs/17 LM-I).
 *   Level 1 · Land: the company as places on the v0.2 look; on every land, at its pole, the land's summary overlaid:
 *             the landmark and the name, a stacked bar of its tasks by state with the done share, tasks and open, what
 *             needs attention (each chip leads to what it counts), its leading areas; the laid layer's value instead.
 *   Level 2 · Area: inside a land its districts as distinct territories; on each, at its pole, its summary overlaid
 *             (name, bar, counts, attention) sized to the room it has; a district with no room but something to say
 *             gets a callout outside the coast with a leader line to its territory.
 *   Level 3 · Task: the tasks of a district as hexagonal tiles, the information inside the shape; the map tilts into
 *             isometric on the way in and each tile is a prism whose FILL rises with its progress, or with the laid
 *             layer's value in the layer's colour. Titles wrap in full. Hover reads more; click opens the view.
 * The canvas draws the ground (coasts, territories, plots, prisms and their fill, roads, leaders, heat); the summaries
 * and the tiles are DOM, in the v0.2 CSS. */
LM.HUES = ['sky', 'violet', 'warm', 'lime', 'rules', 'gold', 'slate', 'ai', 'heat', 'sharp', 'drift'];
LM.YS = 1; LM.targetYS = 1; // the y squash: 1 flat, 0.55 isometric; the map tilts on the way into the task level
LM.cam = { x: 0, y: 0, k: 8 };
LM.view = { lens: 'dept', overlays: new Set(), t: 0, playing: false, speed: 1, trace: null, sel: null, hover: null, hc: false, reduce: false, since: 0, sinceOn: false, panel: true, time: false, proj: null, quiet: true, mode: 'now', iso: true, pic: 'thumb' };
LM.lensAnim = null;
LM.flight = null;
LM.L1 = 14; LM.L3 = 90;

const parseRGB = (s) => { const m = /rgba?\(([^)]+)\)/.exec(s); if (m) { const p = m[1].split(',').map(Number); return [p[0], p[1], p[2]]; } const h = s.trim().replace('#', ''); if (h.length === 3) return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mix = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f].map(Math.round);
const grey = (c, f) => { const l = Math.round(0.3 * c[0] + 0.59 * c[1] + 0.11 * c[2]); return mix(c, [l, l, l], f); };
LM.mix = mix; LM.rgba = rgba; LM.grey = grey;

LM.readTheme = function readTheme() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n) => cs.getPropertyValue(n).trim();
  const light = document.documentElement.dataset.pt === 'sky';
  const hc = document.documentElement.dataset.hc === 'high';
  const T = (LM.theme = {
    light, hc,
    fg: parseRGB(v('--fg') || '#f2f6ff'), sea: parseRGB(v('--ground-base') || '#102b6b'),
    white: light ? [20, 36, 70] : [255, 255, 255], black: light ? [255, 255, 255] : [4, 10, 28], paper: [255, 255, 255], ink0: light ? [10, 20, 45] : [2, 6, 20],
    lit: light ? [255, 205, 95] : [255, 226, 160],
    acc: parseRGB(v('--acc') || '#3d8bff'), good: parseRGB(v('--good') || '#47d16c'), amber: parseRGB(v('--hold-h') || '#ffc96b'), coral: parseRGB(v('--block-h') || '#ff7d85'),
    ai: parseRGB(v('--ai') || '#5fe3cf'), heat: parseRGB(v('--f-heat') || '#ff8a3d'), gold: parseRGB(v('--f-gold') || '#ffd23f'), sharp: parseRGB(v('--f-sharp') || '#ff5c7a'),
    rules: parseRGB(v('--f-rules') || '#7a8cff'), lime: parseRGB(v('--f-lime') || '#a3e635'), slate: parseRGB(v('--f-slate') || '#a3b4cc'), violet: parseRGB(v('--f-violet') || '#b48cff'),
    g2: light ? [255, 255, 255] : [80, 96, 136], shadow: light ? [60, 80, 120] : [2, 8, 30],
    hues: {},
  });
  T.park = mix(T.lime, T.sea, 0.55);
  for (const h of LM.HUES) T.hues[h] = parseRGB(v(h === 'ai' ? '--ai' : `--f-${h}`) || '#8fb4ff');
  T.hues.ai = T.ai; T.hues.good = T.good; T.hues.block = T.coral; T.hues.hold = T.amber; T.hues.acc = T.acc; T.hues.lucid = T.ai; T.hues.violet = T.violet;
  T.ink = (a) => rgba(T.fg, a);
  T.state = {
    todo: light ? [214, 222, 236] : mix(T.sea, T.paper, 0.1),
    doing: light ? [120, 170, 255] : mix(T.acc, T.paper, 0.1),
    review: light ? [70, 190, 175] : T.ai,
    blocked: light ? [235, 90, 105] : T.coral,
    done: light ? [70, 185, 110] : mix(T.good, T.paper, 0.12),
    dropped: light ? [190, 210, 150] : T.park,
  };
  return T;
};

LM.landInfo = function landInfo(ds, lens, g) {
  const L = ds.lenses[lens].lands[g];
  if (L) return L;
  if (g === '_co') return { name: 'Company', sub: 'Decisions that belong to the whole company.', glyph: 'landmark', hue: 'gold', lm: 'summit' };
  return { name: g, sub: '', glyph: 'map', hue: 'slate', lm: 'keep' };
};
LM.distName = (ds, lens, d) => (ds.districts[lens] && ds.districts[lens][d] && ds.districts[lens][d].name) || (d.endsWith(':decisions') ? 'Decisions' : d.endsWith(':landmarks') ? 'Landmarks' : d.split(':').slice(1).join(':') || d);
LM.lmKey = (k) => (LM.LANDMARKS[k] ? k : { shield: 'keep', house: 'workshop', store: 'stall' }[k] || 'keep');
LM.kindOf = (it) => LM.KINDS[it.k] || LM.KINDS.task;

// ---- screen transform ----
LM.toScreen = (x, y, z = 0) => [(x - LM.cam.x) * LM.cam.k + LM.W / 2, (y - LM.cam.y) * LM.cam.k * LM.YS + LM.H / 2 - z * LM.cam.k];
LM.toWorld = (sx, sy) => [(sx - LM.W / 2) / LM.cam.k + LM.cam.x, (sy - LM.H / 2) / (LM.cam.k * LM.YS) + LM.cam.y];
LM.lodOf = (k) => (k < LM.L1 ? 0 : k < LM.L3 ? 1 : 2);
LM.levelName = (lod) => ['Land', 'Area', 'Task'][lod];

/** The pole of inaccessibility of a place: the cells farthest from its edge, and the room around them (world units). */
LM.poleOf = function poleOf(world, S) {
  const key = S.key + '|' + S.n;
  const hit = world.poleCache.get(key); if (hit) return hit;
  const cells = S.cells, dist = new Map(); let frontier = [];
  for (const c of cells) { const [q, r] = c.split(',').map(Number); for (const [dq, dr] of LM.DIRS) if (!cells.has(q + dq + ',' + (r + dr))) { dist.set(c, 0); frontier.push(c); break; } }
  let d = 0;
  while (frontier.length) { const next = []; d++; for (const c of frontier) { const [q, r] = c.split(',').map(Number); for (const [dq, dr] of LM.DIRS) { const k = q + dq + ',' + (r + dr); if (cells.has(k) && !dist.has(k)) { dist.set(k, d); next.push(k); } } } frontier = next; }
  let bd = -1; for (const dd of dist.values()) if (dd > bd) bd = dd;
  let sx = 0, sy = 0, n = 0;
  for (const [c, dd] of dist) if (dd === bd) { const [q, r] = c.split(',').map(Number); const [x, y] = LM.hexXY(q, r); sx += x; sy += y; n++; }
  const pole = n ? { x: sx / n, y: sy / n, r: (bd + 0.6) * 1.5 } : { x: S.cx, y: S.cy, r: 1 };
  world.poleCache.set(key, pole);
  return pole;
};

/** The lands' display shapes: each land grows into the sea around it (never into a neighbour, a one-cell channel kept)
 * until it has room for its summary; small lands grow more. The growth engine is untouched: this is the coast the land
 * and area levels draw and lay their information inside (T39). */
LM.landShapes = function landShapes(world, vis) {
  const sig = [...vis.lands.values()].map((L) => L.key + ':' + L.n).join('|');
  if (world.shapeCache && world.shapeCache.sig === sig) return world.shapeCache.map;
  const owner = new Map(), src = new Map();
  for (let q = -2; q <= 2; q++) for (let r = -2; r <= 2; r++) if ((Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2 <= 2) owner.set(q + ',' + r, '#plaza');
  for (const L of vis.lands.values()) for (const c of L.cells) { owner.set(c, L.key); src.set(c, c); }
  const map = new Map(); let frontier = new Map(); const cap = new Map();
  for (const L of vis.lands.values()) { map.set(L.key, { key: '~' + L.key, cells: new Set(L.cells), n: 0, land: L.key }); frontier.set(L.key, [...L.cells]); cap.set(L.key, Math.max(3, Math.min(9, Math.ceil(2 + 0.36 * Math.sqrt(L.n))))); }
  const N2 = []; for (let dq = -2; dq <= 2; dq++) for (let dr = -2; dr <= 2; dr++) if (dq || dr) if ((Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2 <= 2) N2.push([dq, dr]);
  for (let ring = 0; ring < 9; ring++) {
    const next = new Map();
    for (const [lk, cells] of frontier) {
      if (ring >= cap.get(lk)) continue;
      const reach = cap.get(lk) * 1.56 + 0.4, out = [];
      for (const c of cells) {
        const [q, r] = c.split(',').map(Number); const s0 = src.get(c); const [sq, sr] = s0.split(',').map(Number); const [sx, sy] = LM.hexXY(sq, sr);
        for (const [dq, dr] of LM.DIRS) {
          const nq = q + dq, nr = r + dr, nk = nq + ',' + nr;
          if (owner.has(nk)) continue;
          const [x, y] = LM.hexXY(nq, nr); if (Math.hypot(x - sx, y - sy) > reach) continue;
          let ok = true; for (const [a, b] of N2) { const o = owner.get((nq + a) + ',' + (nr + b)); if (o && o !== lk) { ok = false; break; } }
          if (!ok) continue;
          owner.set(nk, lk); src.set(nk, s0); map.get(lk).cells.add(nk); out.push(nk);
        }
      }
      next.set(lk, out);
    }
    frontier = next;
  }
  for (const S of map.values()) S.n = S.cells.size;
  world.shapeCache = { sig, map };
  return map;
};
LM.shapeOf = (L) => (LM.shapes && LM.shapes.get(L.key)) || L;
/** The largest box of the given aspect that fits inside a shape, near its pole (world units; cached). */
LM.fitBox = function fitBox(world, S, aspect = 1.4) {
  const ck = 'box|' + S.key + '|' + S.n + '|' + aspect;
  const hit = world.poleCache.get(ck); if (hit) return hit;
  const pole = LM.poleOf(world, S);
  const inside = (x, y) => { const [q, r] = LM.xyHex(x, y); return S.cells.has(q + ',' + r); };
  const fits = (cx, cy, w, h) => { for (let i = 0; i <= 6; i++) for (let j = 0; j <= 4; j++) { if (i > 0 && i < 6 && j > 0 && j < 4) continue; if (!inside(cx - w / 2 + (w * i) / 6, cy - h / 2 + (h * j) / 4)) return false; } return true; };
  let best = { x: pole.x, y: pole.y, w: 0, h: 0 };
  const cands = [[pole.x, pole.y]];
  if (S.n <= 220) { let i = 0; for (const c of S.cells) { if (i++ % 2) continue; const [q, r] = c.split(',').map(Number); cands.push(LM.hexXY(q, r)); } }
  else { const step = Math.max(1, pole.r * 0.45); for (let dx = -4; dx <= 4; dx++) for (let dy = -4; dy <= 4; dy++) if (dx || dy) cands.push([pole.x + dx * step, pole.y + dy * step]); }
  for (const [cx, cy] of cands) {
    if (!inside(cx, cy)) continue;
    let lo = 0, hi = pole.r * 5 + 6;
    for (let i = 0; i < 10; i++) { const mid = (lo + hi) / 2; if (fits(cx, cy, mid * aspect, mid)) lo = mid; else hi = mid; }
    if (lo > best.h) best = { x: cx, y: cy, w: lo * aspect, h: lo };
  }
  world.poleCache.set(ck, best);
  return best;
};

const pathRing = (ctx, ring, dz = 0) => {
  const n = ring.length;
  const P = ring.map(([x, y]) => LM.toScreen(x, y, dz));
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  ctx.moveTo(...mid(P[0], P[1]));
  for (let i = 1; i <= n; i++) { const p = P[i % n], q = P[(i + 1) % n]; const m = mid(p, q); ctx.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
  ctx.closePath();
};
LM.pathRing = pathRing;
const C6 = Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 6 + (Math.PI / 3) * i; return [Math.cos(a), Math.sin(a)]; });
const hexPath = (ctx, sx, sy, k, r = 0.86, dy = 0) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const [cx, cy] = C6[i]; i ? ctx.lineTo(sx + cx * r * k, sy + cy * r * k * LM.YS - dy) : ctx.moveTo(sx + cx * r * k, sy + cy * r * k * LM.YS - dy); } ctx.closePath(); };
const rrect = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
LM.rrect = rrect; LM.hexPath = hexPath;
/** A prism with a liquid fill: the sides are dark glass, the fill rises from the base to `fill` of the height. */
const prism = (ctx, sx, sy, k, r, Hpx, fill, col, T, edge, dash, alpha = 1) => {
  const P = C6.map(([cx, cy]) => [sx + cx * r * k, sy + cy * r * k * LM.YS]);
  const glass = T.light ? [205, 216, 236] : mix(T.sea, T.ink0, 0.45);
  const side = (a, b, c, al) => { ctx.beginPath(); ctx.moveTo(P[a][0], P[a][1]); ctx.lineTo(P[b][0], P[b][1]); ctx.lineTo(P[b][0], P[b][1] - Hpx); ctx.lineTo(P[a][0], P[a][1] - Hpx); ctx.closePath(); ctx.fillStyle = rgba(c, al); ctx.fill(); };
  const liquid = (a, b, c, al) => { const h = Hpx * fill; if (h < 0.5) return; ctx.beginPath(); ctx.moveTo(P[a][0], P[a][1]); ctx.lineTo(P[b][0], P[b][1]); ctx.lineTo(P[b][0], P[b][1] - h); ctx.lineTo(P[a][0], P[a][1] - h); ctx.closePath(); ctx.fillStyle = rgba(c, al); ctx.fill(); };
  ctx.save(); ctx.globalAlpha *= alpha;
  if (Hpx > 0.6) {
    side(1, 2, glass, 0.92); side(0, 1, mix(glass, T.paper, 0.08), 0.92);
    liquid(1, 2, mix(col, T.ink0, 0.3), 0.95); liquid(0, 1, col, 0.95);
    if (fill > 0.02 && fill < 0.98) { const h = Hpx * fill; ctx.beginPath(); ctx.moveTo(P[2][0], P[2][1] - h); ctx.lineTo(P[1][0], P[1][1] - h); ctx.lineTo(P[0][0], P[0][1] - h); ctx.lineWidth = 1; ctx.strokeStyle = rgba(T.paper, 0.45); ctx.stroke(); }
  }
  hexPath(ctx, sx, sy, k, r, Hpx); ctx.fillStyle = rgba(mix(col, glass, fill >= 0.98 ? 0.35 : 0.8), 0.95); ctx.fill();
  if (edge) { ctx.lineWidth = 1.2; ctx.strokeStyle = edge; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); }
  if (Hpx > 0.6) { ctx.beginPath(); ctx.moveTo(P[2][0], P[2][1]); ctx.lineTo(P[2][0], P[2][1] - Hpx); ctx.moveTo(P[1][0], P[1][1]); ctx.lineTo(P[1][0], P[1][1] - Hpx); ctx.moveTo(P[0][0], P[0][1]); ctx.lineTo(P[0][0], P[0][1] - Hpx); ctx.lineWidth = 0.8; ctx.strokeStyle = T.ink(0.25); ctx.stroke(); }
  ctx.restore();
};
LM.prism = prism;

// ---- icons, landmarks on the canvas ----
const pathCache = new Map();
LM.icon = function icon(ctx, name, x, y, size, color, lw = 2) {
  const d = LM.ICONS[name]; if (!d) return;
  let P = pathCache.get(name); if (!P) { P = new Path2D(d); pathCache.set(name, P); }
  ctx.save(); ctx.translate(x - size / 2, y - size / 2); ctx.scale(size / 24, size / 24);
  ctx.lineWidth = lw * 24 / size; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.stroke(P); ctx.restore();
};
LM.landmark = function landmark(ctx, key, x, y, size, color, lw = 2) {
  const L = LM.LANDMARKS[LM.lmKey(key)]; if (!L) return;
  const ck = 'lm:' + key; let P = pathCache.get(ck); if (!P) { P = new Path2D(L.d); pathCache.set(ck, P); }
  ctx.save(); ctx.translate(x - size / 2, y - size / 2); ctx.scale(size / 48, size / 48);
  ctx.lineWidth = lw * 48 / size; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.stroke(P); ctx.restore();
};
const pillIcon = (ctx, x, y, r, icon, col, T, alpha = 1, bob = 0) => {
  const yy = y - bob;
  ctx.save(); ctx.globalAlpha *= alpha;
  if (!T.hc) { ctx.shadowColor = rgba(T.shadow, 0.5); ctx.shadowBlur = r * 0.8; ctx.shadowOffsetY = r * 0.3; }
  ctx.beginPath(); ctx.arc(x, yy, r, 0, Math.PI * 2); ctx.fillStyle = rgba(col, 1); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.beginPath(); ctx.moveTo(x - r * 0.35, yy + r * 0.85); ctx.lineTo(x + r * 0.35, yy + r * 0.85); ctx.lineTo(x, yy + r * 1.35); ctx.closePath(); ctx.fill();
  LM.icon(ctx, icon, x, yy, r * 1.15, T.light && col !== T.coral ? rgba(T.ink0, 1) : '#fff', 2.4);
  ctx.restore();
};
LM.pillIcon = pillIcon;
const badgeOf = (kind) => ({ new: ['sprout', 'lime'], done: ['circle-check-big', 'good'], blocked: ['construction', 'block'], progressed: ['trending-up', 'acc'], moved: ['move-right', 'ai'], dropped: ['trees', 'lime'], review: ['eye', 'ai'] })[kind] || ['dot', 'slate'];
LM.badgeOf = badgeOf;
const PROBLEM = { ask: ['message-circle-question', 'rules'], blocked: ['construction', 'block'], stale: ['hourglass', 'hold'], review: ['eye', 'ai'] };
LM.PROBLEM = PROBLEM;
LM.problemOf = (st, asks) => (asks && asks.length ? 'ask' : st.blocked ? 'blocked' : st.stale ? 'stale' : st.waiting ? 'review' : null);

/** Per-visible-state values the layers use. */
const overlayStats = (ds, vis) => {
  let maxCost = 1, maxDCost = 1, maxAge = 1, maxLoad = 1, maxTile = 1;
  for (const L of vis.lands.values()) { maxCost = Math.max(maxCost, L.cost); if (L.built) maxAge = Math.max(maxAge, L.age / L.built); }
  for (const D of vis.districts.values()) { maxDCost = Math.max(maxDCost, D.cost); maxLoad = Math.max(maxLoad, D.working); }
  for (const v of vis.items) if (v.it) maxTile = Math.max(maxTile, v.st.cost);
  const rev = new Map();
  if (ds.revenue.length) {
    const byProd = new Map();
    for (const s of ds.revenue) if (s.t <= vis.t) byProd.set(s.prod, (byProd.get(s.prod) || 0) + s.amount);
    const prodTotals = new Map();
    for (const v of vis.items) if (v.it) prodTotals.set(v.it.g.prod, (prodTotals.get(v.it.g.prod) || 0) + 1);
    for (const L of vis.lands.values()) { let r = 0; const counts = new Map(); for (const v of L.items) if (v.it) counts.set(v.it.g.prod, (counts.get(v.it.g.prod) || 0) + 1); for (const [p, n] of counts) r += (byProd.get(p) || 0) * (n / (prodTotals.get(p) || 1)); rev.set(L.key, r); }
  }
  let maxRev = 1; for (const r of rev.values()) maxRev = Math.max(maxRev, r);
  return { maxCost, maxDCost, rev, maxRev, maxAge, maxLoad, maxTile };
};
LM.overlayStats = overlayStats;

/** The value a layer gives a TILE: { v: 0..1, text, col }. */
LM.tileValue = function tileValue(o, v, stats, T, ds, t) {
  const it = v.it, st = v.st;
  switch (o) {
    case 'progress': { const p = st.done ? 1 : st.dropped ? 0 : st.h; return { v: p, text: st.done ? 'done' : `${Math.round(p * 100)} %`, col: mix(T.acc, T.good, p) }; }
    case 'cost': return st.cost > 0 ? { v: Math.min(1, st.cost / stats.maxTile), text: LM.fmtMoney(st.cost), col: T.heat } : null;
    case 'revenue': return null;
    case 'problems': { const n = (st.blocked ? 1 : 0) + (st.stale ? 1 : 0) + (st.waiting ? 1 : 0) + (LM.asksOf(ds, it, t).length ? 1 : 0); return n ? { v: Math.min(1, n / 2), text: st.blocked ? 'blocked' : st.stale ? 'still' : st.waiting ? 'waiting' : 'asked', col: st.blocked ? T.coral : T.amber } : null; }
    case 'people': return it.agent ? { v: 1, text: 'agent', col: T.ai } : { v: 0.5, text: LM.who(it).name.split(' ')[0], col: T.acc };
    case 'recency': { const age = t - st.since; const f = Math.max(0, 1 - age / (ds.win.old * 1.5)); return { v: f, text: LM.rel(st.since, t), col: T.lime }; }
    case 'growth': { const age = t - v.t; const f = Math.max(0, 1 - age / (stats.maxAge * 1.3)); return { v: f, text: LM.fmtShort(v.t), col: T.lime }; }
  }
  return null;
};
/** The number a layer floats over a place (a land or a district). */
LM.placeValue = function placeValue(S, o, stats, isLand) {
  switch (o) {
    case 'progress': return S.built ? { v: S.doneSize / Math.max(1, S.size), text: `${Math.round((S.doneSize / Math.max(1, S.size)) * 100)} %` } : null;
    case 'cost': return S.cost > 0 ? { v: S.cost / (isLand ? stats.maxCost : stats.maxDCost), text: LM.fmtMoney(S.cost) } : null;
    case 'revenue': { const r = stats.rev.get(S.key) || 0; return r > 0 ? { v: r / stats.maxRev, text: LM.fmtMoney(r) } : null; }
    case 'problems': return S.blocked || S.stale || S.asks ? { v: Math.min(1, (S.blocked * 2.5 + S.stale + (S.asks || 0) * 2) / Math.max(2, (S.built || S.n) * 0.3)), text: [S.asks ? `${S.asks} asked` : '', S.blocked ? `${S.blocked} blocked` : '', S.stale ? `${S.stale} still` : ''].filter(Boolean).join(' · ') } : null;
    case 'people': return S.built ? { v: S.agent / S.built, text: `${Math.round((S.agent / S.built) * 100)} % agents` } : null;
    case 'recency': return S.fresh ? { v: S.fresh / Math.max(1, S.built), text: `${S.fresh} moved` } : null;
    case 'growth': return S.built ? { v: 1 - Math.min(1, S.age / S.built / stats.maxAge), text: `${S.built} plots` } : null;
    case 'deps': { let n = 0; for (const v of S.items) if (v.it) n += v.it.dep.length; return n ? { v: 0, text: `${n} links` } : null; }
  }
  return null;
};
LM.layerColor = (o, T) => ({ progress: T.good, cost: T.heat, revenue: T.gold, problems: T.coral, people: T.ai, recency: T.lime, growth: T.lime, deps: T.acc })[o] || T.acc;
LM.layerHue = (o) => ({ progress: 'good', cost: 'heat', revenue: 'gold', problems: 'block', people: 'ai', recency: 'lime', growth: 'lime', deps: 'acc' })[o] || 'acc';
LM.hueVar = (h) => `var(--${h === 'block' ? 'block-h' : h === 'hold' ? 'hold-h' : h === 'acc' ? 'acc' : h === 'ai' ? 'ai' : h === 'good' ? 'good' : 'f-' + h})`;

// ---- the frame ----
LM.draw = function draw(now) {
  const ctx = LM.ctx, T = LM.theme, ds = LM.ds, view = LM.view;
  const W = LM.W, H = LM.H, k = LM.cam.k;
  const lod = LM.lodOf(k);
  LM.lod = lod;
  // the tilt: flat at the land and area levels, isometric at the task level (the lab can keep it flat)
  LM.targetYS = lod === 2 && view.iso && (view.pic || 'thumb') !== 'full' ? 0.55 : 1;
  const dtF = Math.min(0.1, (now - (LM.lastFrame || now)) / 1000);
  if (Math.abs(LM.YS - LM.targetYS) > 0.002) { const a = view.reduce ? 1 : 1 - Math.exp(-dtF / 0.18); LM.YS += (LM.targetYS - LM.YS) * a; LM.needsFrame = true; } else LM.YS = LM.targetYS;
  ctx.clearRect(0, 0, W, H);
  const world = LM.worlds[view.lens];
  if (!world.poleCache) world.poleCache = new Map();
  if (!world.visCache || world.visCache.t !== view.t) world.visCache = { t: view.t, vis: LM.visible(world, view.t) };
  const vis = (LM.vis = world.visCache.vis);
  LM.shapes = LM.landShapes(world, vis);
  LM.hits = [];
  const O = view.overlays;
  const layer = [...O].find((o) => o !== 'deps') || null;
  const stats = (LM.stats = vis.stats || (vis.stats = overlayStats(ds, vis)));
  const traceSet = view.trace ? view.trace.set : null;
  const traceLands = view.trace ? view.trace.lands : null;
  const proj = view.proj ? ds.byProject.get(view.proj) : null;
  const projSet = proj ? new Set(proj.items) : null;
  const hueOf = (g) => T.hues[LM.landInfo(ds, view.lens, g).hue] || T.hues.slate;
  const pulse = (now / 900) % 1;
  const since = view.sinceOn ? (LM.sinceCache && LM.sinceCache.t0 === view.since && LM.sinceCache.t1 === view.t && LM.sinceCache.lens === view.lens ? LM.sinceCache : (LM.sinceCache = Object.assign(LM.changes(ds, view.lens, view.since, view.t), { lens: view.lens }))) : null;
  LM.since = since;
  const nowMode = view.mode === 'now';
  if (!vis.askMaps || vis.askMaps.lens !== view.lens) { const asksAt0 = LM.openAsks(ds, view.t); const m = new Map(); for (const a of asksAt0) { const p = LM.askPlace(ds, a, view.lens, view.t); if (p.it) { if (!m.has(p.it.id)) m.set(p.it.id, []); m.get(p.it.id).push(a); } } vis.askMaps = { lens: view.lens, asksAt: asksAt0, askByItem: m }; }
  const asksAt = vis.askMaps.asksAt, askByItem = vis.askMaps.askByItem;
  LM.askByItem = askByItem;
  for (const S of [...vis.lands.values(), ...vis.districts.values()]) { S.asks = 0; S.proj = 0; }
  for (const S of [...vis.lands.values(), ...vis.districts.values()]) S.askList = [];
  for (const a of asksAt) { const p = LM.askPlace(ds, a, view.lens, view.t); const L = p.g && vis.lands.get(p.g), D = p.d && vis.districts.get(p.d); if (L) { L.asks++; L.askList.push(a); } if (D) { D.asks++; D.askList.push(a); } }
  if (projSet) for (const v of vis.items) if (v.it && projSet.has(v.it.id)) { const L = vis.lands.get(v.g), D = vis.districts.get(v.d); if (L) L.proj++; if (D) D.proj++; }
  const where = LM.where(); LM.hereLand = where.land || null; LM.hereDist = where.dist || null;

  let lerpPos = null;
  if (LM.lensAnim) {
    const f = Math.min(1, (now - LM.lensAnim.t0) / 900), e = 1 - Math.pow(1 - f, 3), old = LM.lensAnim.from;
    lerpPos = (v) => { const cells = v.it && v.it.cells[old]; if (!cells) return [v.x, v.y]; let c = cells[0]; for (const cc of cells) if (cc.t <= view.t) c = cc; const [ox, oy] = LM.hexXY(c.q, c.r); return [ox + (v.x - ox) * e, oy + (v.y - oy) * e]; };
    LM.lensAnim.f = e;
    if (f >= 1) LM.lensAnim = null;
  }
  const hullAlpha = LM.lensAnim ? LM.lensAnim.f : 1;
  const onScreen = (sx, sy, m = 0) => sx > -m && sx < W + m && sy > -m && sy < H + m;
  const lk = T.light ? 0.5 : 0.11;

  // ---- lands: shore, coast, hue wash, light (the v0.2 terrain) ----
  const landsSorted = [...vis.lands.values()].sort((a, b) => a.cy - b.cy);
  for (const L of landsSorted) {
    const hue = hueOf(L.key);
    const shape = LM.shapeOf(L);
    const rings = LM.hullOf(world, shape);
    const prog = L.size ? L.doneSize / L.size : 0;
    const dim = (traceLands && !traceLands.has(L.key) ? 0.35 : 1) * (projSet && !L.proj ? 0.4 : 1);
    const [cx, cy] = LM.toScreen(L.cx, L.cy);
    const R = Math.max(30, Math.sqrt(shape.n) * k * 1.7);
    const here = LM.hereLand && LM.hereLand.key === L.key;
    const focusDim = lod >= 1 && !here ? 0.5 : 1;
    ctx.save(); ctx.globalAlpha = hullAlpha * dim * focusDim;
    if (!T.hc && lod === 0) { ctx.beginPath(); for (const r of rings) pathRing(ctx, r); ctx.lineWidth = Math.max(6, k * 1.4); ctx.strokeStyle = rgba(T.light ? [120, 170, 255] : T.hues.sky, T.light ? 0.2 : 0.16); ctx.lineJoin = 'round'; ctx.stroke(); }
    ctx.beginPath(); for (const r of rings) pathRing(ctx, r);
    ctx.fillStyle = T.light ? 'rgba(255,255,255,.55)' : T.ink(T.hc ? 0.1 : 0.07); ctx.fill('evenodd');
    ctx.lineWidth = lod >= 1 && here ? 2 : 1.2; ctx.strokeStyle = T.light ? 'rgba(15,31,58,.3)' : T.ink(T.hc ? 0.5 : lod >= 1 && here ? 0.4 : 0.22); ctx.stroke();
    ctx.save(); ctx.beginPath(); for (const r of rings) pathRing(ctx, r); ctx.clip('evenodd');
    let washC = hue, washA = 0.2, lightA = prog * lk;
    if (layer) { const pv = LM.placeValue(L, layer, stats, true); washC = LM.layerColor(layer, T); washA = pv ? 0.08 + Math.pow(pv.v, 0.7) * 0.5 : 0.04; lightA = 0; }
    if (!T.hc) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, rgba(washC, washA)); g.addColorStop(0.6, rgba(washC, washA * 0.3)); g.addColorStop(1, rgba(washC, 0));
      ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      if (lightA > 0) { const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.95); g2.addColorStop(0, rgba(T.paper, Math.min(0.6, lightA))); g2.addColorStop(1, rgba(T.paper, 0)); ctx.fillStyle = g2; ctx.fillRect(cx - R, cy - R, R * 2, R * 2); }
    } else if (washA > 0.2) { ctx.fillStyle = rgba(washC, (washA - 0.2) * 0.6); ctx.fillRect(0, 0, W, H); }
    ctx.restore();
    ctx.restore();
  }
  for (const L of vis.lands.values()) {
    if (!L.parent) continue;
    const P = vis.lands.get(L.parent); if (!P) continue;
    const [ax, ay] = LM.toScreen(P.cx, P.cy), [bx, by] = LM.toScreen(L.cx, L.cy);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
    ctx.lineWidth = Math.max(2, k * 0.5); ctx.strokeStyle = T.ink(0.14 * hullAlpha); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.setLineDash([k * 0.5, k * 0.5]); ctx.strokeStyle = T.ink(0.45 * hullAlpha); ctx.stroke(); ctx.setLineDash([]);
  }
  // ---- districts: faint sub-contours at the land level; distinct territories at the area level; the one under the camera lit at the task level ----
  if (k >= 2.5) {
    let i = 0;
    for (const D of [...vis.districts.values()].sort((a, b) => a.key < b.key ? -1 : 1)) {
      if (D.n < 1) continue;
      i++;
      const hue = hueOf(D.land);
      const rings = LM.hullOf(world, D);
      const dim = traceLands && !traceLands.has(D.land) ? 0.3 : 1;
      const prog = D.size ? D.doneSize / D.size : 0;
      const here = LM.hereDist && LM.hereDist.key === D.key;
      const inLand = LM.hereLand && LM.hereLand.key === D.land;
      ctx.save(); ctx.globalAlpha = hullAlpha * dim;
      ctx.beginPath(); for (const r of rings) pathRing(ctx, r);
      let fill = mix(hue, T.paper, 0.3), alpha = lod === 0 ? (D.n >= 4 ? 0.05 : 0) : lod === 1 ? (inLand ? (i % 3 === 0 ? 0.16 : i % 3 === 1 ? 0.09 : 0.12) + prog * 0.04 : 0.04) : here ? 0.1 : 0.03;
      if (layer && lod >= 1 && (inLand || lod === 2)) { const pv = LM.placeValue(D, layer, stats, false); fill = LM.layerColor(layer, T); alpha = pv ? 0.08 + Math.pow(pv.v, 0.7) * 0.4 : 0.03; }
      if (alpha > 0.005) { ctx.fillStyle = rgba(fill, Math.min(0.75, alpha)); ctx.fill('evenodd'); }
      ctx.lineWidth = here ? 1.8 : lod === 1 && inLand ? 1.4 : 1; ctx.strokeStyle = here ? rgba(T.acc, 0.8) : lod === 1 && inLand ? rgba(mix(hue, T.paper, 0.5), 0.55) : T.light ? `rgba(15,31,58,${lod >= 1 ? 0.14 : 0.07})` : T.ink(T.hc ? 0.35 : lod >= 1 ? 0.14 : 0.08); ctx.stroke();
      ctx.restore();
    }
  }

  // ---- pictures on their plots (the setting "As the tile" at the land and area levels): what each plot made ----
  if ((view.pic || 'thumb') === 'full' && lod <= 1 && k >= 4) {
    const a = lod === 0 ? 0.6 : 0.78;
    for (const v of vis.items) {
      if (!v.it) continue;
      const [sx, sy] = LM.toScreen(v.x, v.y); if (!onScreen(sx, sy, k * 2)) continue;
      const here = !LM.hereLand || LM.hereLand.key === v.g;
      LM.drawPic(ctx, v.it, v.st, sx - k * 0.78, sy - k * 0.62 * LM.YS, k * 1.56, k * 1.24 * LM.YS, a * (here ? 1 : 0.45));
    }
  }

  // ---- roads (dependencies) ----
  const posOf = new Map();
  for (const v of vis.items) if (v.it) posOf.set(v.it.id, v);
  LM.posOf = posOf;
  const depsOn = O.has('deps') || (view.trace && view.trace.kind === 'item') || !!projSet;
  const barriers = [];
  const drawRoads = () => {
    for (const v of vis.items) {
      if (!v.it) continue;
      if (projSet && !projSet.has(v.it.id)) continue;
      for (const dep of v.it.dep) {
        const u = posOf.get(dep); if (!u) continue;
        if (traceSet && !(traceSet.has(v.it.id) || traceSet.has(u.it.id))) continue;
        const [ax, ay] = LM.toScreen(...(lerpPos ? lerpPos(u) : [u.x, u.y])), [bx, by] = LM.toScreen(...(lerpPos ? lerpPos(v) : [v.x, v.y]));
        const flowing = u.st.done && !v.st.done && !v.st.dropped;
        const clogged = u.st.blocked || (u.st.stale && !u.st.done && !u.st.dropped);
        const hard = u.st.blocked;
        const dry = !u.st.done && !clogged;
        const focus = view.sel === v.it || view.sel === u.it || view.hover === v.it || view.hover === u.it || traceSet;
        if (!onScreen(ax, ay) && !onScreen(bx, by) && !focus) continue;
        if (lod >= 2 && !focus && Math.hypot(bx - ax, by - ay) > Math.max(W, H) * 0.9) continue;
        const dx = bx - ax, dy = by - ay, L2 = Math.hypot(dx, dy) || 1;
        const nx = -dy / L2, ny = dx / L2, bow = Math.min(40, L2 * 0.2);
        const c1 = [ax + dx * 0.3 + nx * bow, ay + dy * 0.3 + ny * bow], c2 = [ax + dx * 0.7 + nx * bow, ay + dy * 0.7 + ny * bow];
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], bx, by);
        ctx.lineWidth = focus ? 3 : Math.max(1.8, k * 0.03); ctx.lineCap = 'round';
        ctx.strokeStyle = hard ? rgba(T.coral, 0.9) : clogged ? rgba(T.amber, 0.85) : flowing ? rgba(T.acc, 0.9) : u.st.done ? rgba(T.good, 0.55) : T.ink(0.6);
        ctx.setLineDash(dry ? [3, 6] : []); ctx.stroke(); ctx.setLineDash([]);
        if (flowing && !view.reduce) for (let i = 0; i < 3; i++) { const f = (pulse + i / 3) % 1, mt = 1 - f; const px = mt * mt * mt * ax + 3 * mt * mt * f * c1[0] + 3 * mt * f * f * c2[0] + f * f * f * bx; const py = mt * mt * mt * ay + 3 * mt * mt * f * c1[1] + 3 * mt * f * f * c2[1] + f * f * f * by; ctx.beginPath(); ctx.arc(px, py, Math.max(1.6, k * 0.03), 0, Math.PI * 2); ctx.fillStyle = rgba(T.acc, 0.95); ctx.fill(); }
        if (clogged) barriers.push([ax + dx * 0.18 + nx * bow * 0.42, ay + dy * 0.18 + ny * bow * 0.42, hard]);
      }
    }
  };
  const pairRoads = (keyOf, placeOf) => {
    const pairs = new Map();
    for (const v of vis.items) if (v.it) for (const dep of v.it.dep) { const u = posOf.get(dep); if (!u || keyOf(u) === keyOf(v)) continue; const ka = keyOf(u), kb = keyOf(v); const kk = ka < kb ? ka + '>' + kb : kb + '>' + ka; const p = pairs.get(kk) || { a: placeOf(u), b: placeOf(v), n: 0, flow: 0, clog: 0 }; p.n++; if (u.st.done && !v.st.done) p.flow++; if (u.st.blocked || (u.st.stale && !u.st.done)) p.clog++; pairs.set(kk, p); }
    for (const p of pairs.values()) {
      if (!p.a || !p.b) continue;
      const pa = LM.poleOf(world, p.a), pb = LM.poleOf(world, p.b);
      const [ax, ay] = LM.toScreen(pa.x, pa.y), [bx, by] = LM.toScreen(pb.x, pb.y);
      if (!onScreen(ax, ay, 100) && !onScreen(bx, by, 100)) continue;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
      ctx.lineWidth = Math.min(8, 1.2 + Math.sqrt(p.n) * 0.9); ctx.strokeStyle = p.clog ? rgba(T.coral, 0.65) : p.flow ? rgba(T.acc, 0.6) : T.ink(0.32);
      ctx.setLineDash(p.flow || p.clog ? [] : [5, 7]); ctx.stroke(); ctx.setLineDash([]);
    }
  };
  if (depsOn) {
    if (lod === 0 && !projSet) pairRoads((v) => v.g, (v) => vis.lands.get(v.g));
    else if (lod === 1 && !projSet) pairRoads((v) => v.d, (v) => vis.districts.get(v.d));
    else drawRoads();
  }
  if (projSet && lod >= 2) {
    const pts = proj.items.map((id) => posOf.get(id)).filter(Boolean).sort((a, b) => a.it.b - b.it.b);
    ctx.beginPath(); pts.forEach((v, i) => { const [x, y] = LM.toScreen(v.x, v.y); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.lineWidth = Math.max(1.2, k * 0.03); ctx.strokeStyle = rgba(T.gold, 0.5); ctx.setLineDash([k * 0.3, k * 0.3]); ctx.stroke(); ctx.setLineDash([]);
  }
  if (view.trace && view.trace.kind === 'decision') {
    for (const v of vis.items) {
      if (!v.mon || view.trace.dec !== v.mon) continue;
      const [ax, ay] = LM.toScreen(v.x, v.y);
      for (const id of v.mon.lin) { const u = posOf.get(id); if (!u) continue; const [bx, by] = LM.toScreen(...(lerpPos ? lerpPos(u) : [u.x, u.y])); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineWidth = 1.6; ctx.strokeStyle = rgba(T.gold, 0.75); ctx.stroke(); }
    }
  }

  // ---- level 3: the plots as prisms with their fill, parks, squares ----
  const squares = new Map();
  const chase = view.reduce ? 1 : 1 - Math.exp(-dtF / 0.22);
  const flashWin = LM.flashUntil || 0;
  LM.tilePos = new Map();
  if (lod === 2) {
    const order = vis.items.slice().sort((a, b) => a.y - b.y || a.x - b.x);
    const Hpx = k * 0.42 * (1 - LM.YS) / 0.45; // the prism height grows with the tilt
    for (const v of order) {
      const [x0, y0] = lerpPos && v.it ? lerpPos(v) : [v.x, v.y];
      const [sx, sy] = LM.toScreen(x0, y0);
      if (sx < -k * 2 || sx > W + k * 2 || sy < -k * 3 || sy > H + k * 2) continue;
      const dimTrace = traceSet ? (v.it && traceSet.has(v.it.id)) || (v.mon && view.trace.dec === v.mon) || (traceLands && !v.it && traceLands.has(v.g)) ? 1 : 0.18 : 1;
      const dimProj = projSet ? (v.it && projSet.has(v.it.id) ? 1 : 0.14) : 1;
      const hue = hueOf(v.g);
      if (v.square) { hexPath(ctx, sx, sy, k, 0.98); ctx.fillStyle = rgba(mix(hue, T.paper, 0.4), 0.1 * dimTrace); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = rgba(T.gold, 0.3 * dimTrace); ctx.stroke(); continue; }
      if (v.park) { hexPath(ctx, sx, sy, k, 0.92); ctx.fillStyle = rgba(T.lime, 0.1 * dimTrace); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = rgba(T.lime, 0.25 * dimTrace); ctx.stroke(); LM.icon(ctx, 'trees', sx, sy, Math.max(10, k * 0.3), rgba(T.lime, 0.55 * dimTrace), 1.8); continue; }
      if (v.mon) { const sq = v.q + ',' + v.r; if (!squares.has(sq)) squares.set(sq, { x: sx, y: sy, n: 0, g: v.g, d: v.d, list: [], recent: 0, key: sq }); const S = squares.get(sq); S.n++; S.list.push(v); continue; }
      if (v.lm) continue;
      const it = v.it, st = v.st;
      it.vh += (st.h - it.vh) * chase; if (Math.abs(st.h - it.vh) < 0.002) it.vh = st.h;
      const ch = since ? since.items.get(it.id) : null;
      const quiet = nowMode && view.quiet && st.old && !ch && !projSet && !traceSet;
      const dim = dimTrace * dimProj * (since ? (ch ? 1 : 0.3) : 1) * (quiet ? 0.6 : 1) * (st.ghost ? 0.5 : 1);
      let col = st.done ? T.state.done : st.blocked ? T.state.blocked : st.s === 'review' ? T.state.review : st.s === 'todo' ? T.state.todo : T.state.doing;
      if (st.dropped) col = T.state.dropped;
      const tv = layer && !st.dropped ? LM.tileValue(layer, v, stats, T, ds, view.t) : null;
      let fill = st.dropped ? 0 : st.done ? 1 : st.s === 'todo' ? 0.04 : it.vh;
      if (tv) { fill = tv.v; col = tv.col; } else if (layer) { fill = 0; col = grey(col, 0.7); }
      if (quiet) col = grey(col, 0.5);
      ctx.save(); ctx.globalAlpha = dim;
      if (!T.hc && Hpx > 2) { ctx.beginPath(); ctx.ellipse(sx + k * 0.08, sy + k * 0.1, k * 0.86, k * 0.42 * LM.YS + 2, 0, 0, Math.PI * 2); ctx.fillStyle = rgba(T.shadow, T.light ? 0.12 : 0.28); ctx.fill(); }
      prism(ctx, sx, sy, k, 0.93, Hpx, fill, col, T, st.s === 'todo' && !tv ? T.ink(0.4) : rgba(col, 0.75), st.s === 'todo' && !tv ? [4, 4] : null);
      if (flashWin > now && v.t > (LM.flashT0 || 0)) { hexPath(ctx, sx, sy, k, 0.93, Hpx); ctx.lineWidth = 2.5; ctx.strokeStyle = rgba(T.lime, 0.9 * ((flashWin - now) / 1400)); ctx.stroke(); }
      ctx.restore();
      if (view.sel === it || view.hover === it) { hexPath(ctx, sx, sy, k, 0.99, Hpx); ctx.lineWidth = 2.4; ctx.strokeStyle = view.sel === it ? rgba(T.acc, 1) : T.ink(0.8); ctx.stroke(); }
      LM.tilePos.set(it.id, { x: sx, y: sy - Hpx, dim, v, tv, fill });
    }
    for (const [bx, by, hard] of barriers) pillIcon(ctx, bx, by, Math.max(7, k * 0.1), 'construction', hard ? T.coral : T.amber, T, 0.95);
    for (const S of squares.values()) { hexPath(ctx, S.x, S.y, k, 0.93); ctx.fillStyle = rgba(mix(T.rules, T.sea, 0.75), 0.9); ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = rgba(T.rules, 0.7); ctx.stroke(); S.r = k * 0.5; }
  }
  LM.squares = squares;
  LM.lastFrame = now;
  LM.lmPos = [];
  for (const v of vis.items) if (v.lm) { const [sx, sy] = LM.toScreen(v.x, v.y); if (!onScreen(sx, sy, 60)) continue; const kk = Math.max(k, 10); drawMilestone(ctx, sx, sy, kk, v, 1, T); LM.lmPos.push({ v, sx, sy, size: Math.max(26, Math.min(96, kk * 2.2)) }); }

  // ---- heat: where things moved (the since layer) ----
  if (since && !T.hc) {
    for (const D of vis.districts.values()) {
      const n = (since.districts.get(D.key) || { n: 0 }).n;
      if (!n) continue;
      const [cx, cy] = LM.toScreen(D.cx, D.cy); const R = Math.max(18, Math.sqrt(n) * k * (lod === 0 ? 1.4 : 1.1) + k * 0.6);
      if (!onScreen(cx, cy, R)) continue;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, rgba(T.heat, 0.26)); g.addColorStop(0.55, rgba(T.heat, 0.08)); g.addColorStop(1, rgba(T.heat, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, R, R * LM.YS, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  LM.labelRects = [];
  if (lod <= 1) LM.drawSummaries(ctx, vis, world, lod, stats, since, layer, projSet, traceLands);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const lmLab = [];
  for (const m of LM.lmPos) { if (lmLab.some(([x, y]) => Math.abs(x - m.sx) < 60 && Math.abs(y - m.sy) < 30)) continue; ctx.font = `600 13px Figtree, system-ui, sans-serif`; const tw = ctx.measureText(m.v.lm.n).width; const R = { x0: m.sx - tw / 2, y0: m.sy - m.size - 20, x1: m.sx + tw / 2, y1: m.sy - m.size + 4 }; if (LM.labelRects.some((o) => R.x0 < o.x1 && R.x1 > o.x0 && R.y0 < o.y1 && R.y1 > o.y0)) continue; lmLab.push([m.sx, m.sy]); LM.labelRects.push(R); ctx.lineWidth = 4; ctx.strokeStyle = rgba(T.black, T.light ? 0.9 : 0.7); ctx.lineJoin = 'round'; ctx.strokeText(m.v.lm.n, m.sx, m.sy - m.size - 6); ctx.fillStyle = rgba(T.gold, 1); ctx.fillText(m.v.lm.n, m.sx, m.sy - m.size - 6); }

  LM.syncOverlays(vis, world, lod, stats, since, layer, nowMode, projSet, traceSet, traceLands);
  for (const [ax, ay, bx, by] of LM.leaders || []) { ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineWidth = 1.4; ctx.strokeStyle = T.ink(0.55); ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.arc(bx, by, 3.5, 0, Math.PI * 2); ctx.fillStyle = T.ink(0.8); ctx.fill(); }
  LM.problemPills = [];
  if (LM.lensAnim || view.playing || LM.flight || flashWin > now) LM.needsFrame = true;
};
function drawMilestone(ctx, sx, sy, k, v, dim, T) {
  const size = Math.max(26, Math.min(96, k * 2.2));
  ctx.save(); ctx.globalAlpha = dim;
  if (!T.hc) { const g = ctx.createRadialGradient(sx, sy - size * 0.45, 0, sx, sy - size * 0.45, size * 0.8); g.addColorStop(0, rgba(T.gold, 0.3)); g.addColorStop(1, rgba(T.gold, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy - size * 0.45, size * 0.8, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.arc(sx, sy - size * 0.45, size * 0.52, 0, Math.PI * 2); ctx.fillStyle = rgba(T.g2, T.light ? 0.85 : 0.5); ctx.fill(); ctx.lineWidth = Math.max(2, size * 0.05); ctx.strokeStyle = rgba(T.gold, 0.9); ctx.stroke();
  LM.landmark(ctx, 'gate', sx, sy - size * 0.45, size * 0.7, rgba(T.hc ? T.fg : T.gold, 0.95), 2.2);
  ctx.restore();
}
LM.drawMilestone = drawMilestone;

// ---- the overlays in the DOM: one place summary at every level, on the territory; hexagonal tiles; council tiles ----
LM.overlays = new Map();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const Iw = (n) => LM.I(n);
const segRingHtml = (size, segs, w) => { const r = size / 2 - w / 2 - 1, c = size / 2, n = segs.length, gap = 4; return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">${segs.map((st, i) => { const len = 100 / n - gap; return `<circle class="trk seg-${st}" cx="${c}" cy="${c}" r="${r}" stroke-width="${w}" pathLength="100" stroke-dasharray="${len.toFixed(2)} ${(100 - len).toFixed(2)}" stroke-dashoffset="${(-(i * 100 / n + gap / 2) + 25).toFixed(2)}" stroke-linecap="round"/>`; }).join('')}</svg>`; };
const stateBar = (S) => {
  const n = Math.max(1, S.built || 0); const c = { done: S.done || 0, review: 0, doing: 0, blocked: S.blocked || 0, todo: 0 };
  for (const v of S.items) if (v.it) { if (v.st.s === 'review') c.review++; else if (v.st.s === 'doing') c.doing++; else if (v.st.s === 'todo') c.todo++; }
  return `<span class="sbar" role="img" aria-label="${c.done} done, ${c.review} in review, ${c.doing} in progress, ${c.blocked} blocked, ${c.todo} planned">${['done', 'review', 'doing', 'blocked', 'todo'].map((s) => c[s] ? `<i class="s-${s}" style="width:${(c[s] / n * 100).toFixed(1)}%"></i>` : '').join('')}</span>`;
};
const attnChips = (S, ch, projSet) => [S.blocked ? `<span class="k block" data-go="blocked">${Iw('construction')}${S.blocked} blocked</span>` : '', S.stale && !S.blocked ? `<span class="k hold" data-go="blocked">${Iw('hourglass')}${S.stale} still</span>` : '', (S.review0 || 0) ? `<span class="k ai" data-go="review">${Iw('eye')}${S.review0} in review</span>` : '', ch ? `<span class="k heat" data-go="new">${Iw('history')}${ch.n} changed</span>` : '', projSet && S.proj ? `<span class="k gold">${Iw('kanban')}${S.proj} of the project</span>` : ''].filter(Boolean).join('');
/** The open asks of a place, written out as flags (the first two; the rest counted). */
const askFlags = (S, max) => { const list = (S.askList || []).slice().sort((a, b) => (b.to === 'owner') - (a.to === 'owner') || b.b - a.b); if (!list.length) return ''; const shown = list.slice(0, max); return `<div class="flags">${shown.map((a) => `<span class="fl${a.to === 'owner' ? ' you' : ''}" data-ask="${a.id}" title="${esc(a.n)}"><i></i><span class="ban">${Iw(a.kind === 'approve' ? 'badge-check' : a.kind === 'unblock' ? 'construction' : 'message-circle-question')}<span>${esc(a.n.length > 46 ? a.n.slice(0, 44) + '…' : a.n)}</span></span></span>`).join('')}${list.length > max ? `<span class="k rules" data-go="ask">${Iw('message-circle-question')}+${list.length - max} more to decide</span>` : ''}</div>`; };
/** Who works in a place: up to three avatars, people before agents. */
const crewOf = (S, max = 3) => { const m = new Map(); for (const v of S.items) if (v.it && !v.st.closed) { const w = LM.who(v.it); const c = m.get(w.name) || { w, n: 0 }; c.n++; m.set(w.name, c); } const list = [...m.values()].sort((a, b) => (a.w.agent - b.w.agent) || b.n - a.n); return list.length ? `<span class="avs">${list.slice(0, max).map(({ w, n }) => `<span class="av ${w.agent ? 'ag' : w.cls}" title="${esc(w.name)} · ${n} open">${w.agent ? Iw('bot') : w.initial}</span>`).join('')}${list.length > max ? `<span class="av more">+${list.length - max}</span>` : ''}</span>` : ''; };
const healthOf = (S) => (S.asks || S.blocked >= 2 ? 'needs' : S.blocked || S.stale > (S.built || 1) * 0.3 ? 'watch' : (S.built - S.done - (S.dropped || 0)) === 0 ? 'done' : 'ok');
/** The place summary, the same component at the land and the area level; `tier` xs | s | m | l. */
function placeSummary(S, kind, tier, ctx) {
  const { ds, lens, layer, stats, since, projSet, info, name } = ctx;
  const pct = S.size ? S.doneSize / S.size : 0;
  const open = (S.built || 0) - (S.done || 0) - (S.dropped || 0);
  const pv = layer ? LM.placeValue(S, layer, stats, kind === 'land') : null;
  const ch = since ? (kind === 'land' ? since.places : since.districts).get(S.key) : null;
  const head = kind === 'land'
    ? `<div class="lh"><span class="disc h-${info.hue}"><svg class="lm" viewBox="0 0 48 48"><path d="${LM.LANDMARKS[LM.lmKey(info.lm)].d}"/></svg></span><span class="nm">${esc(name)}</span></div>`
    : `<div class="lh row"><span class="g f-${info.hue} sm">${Iw('map-pin')}</span><span class="nm">${esc(name)}</span></div>`;
  const nAsk0 = (S.askList || []).length;
  const atl0 = [nAsk0 ? `<span class="rules" data-go="ask">${nAsk0} to decide</span>` : '', S.blocked ? `<span class="block" data-go="blocked">${S.blocked} blocked</span>` : '', S.stale && !S.blocked ? `<span class="hold" data-go="blocked">${S.stale} still</span>` : '', S.review0 ? `<span class="ai" data-go="review">${S.review0} in review</span>` : ''].filter(Boolean);
  const rowHead0 = kind === 'land' ? `<div class="lh row"><span class="disc h-${info.hue}"><svg class="lm" viewBox="0 0 48 48"><path d="${LM.LANDMARKS[LM.lmKey(info.lm)].d}"/></svg></span><span class="nm">${esc(name)}</span></div>` : head;
  if (tier === 'name') return rowHead0 + (atl0.length ? `<div class="atl">${atl0.join('<i>·</i>')}</div>` : '');
  if (tier === 'xs') return rowHead0 + `<div class="ln"><b>${pv ? esc(pv.text) : Math.round(pct * 100) + ' %'}</b> · ${S.built} · ${(S.built || 0) - (S.done || 0) - (S.dropped || 0)} open</div>` + (atl0.length ? `<div class="atl">${atl0.join('<i>·</i>')}</div>` : '');
  const bar = pv ? `<span class="sbar lay" style="--lv:${pv.v.toFixed(2)};--lc:${LM.hueVar(LM.layerHue(layer))}"><i></i></span>` : stateBar(S);
  const line = `<div class="ln">${pv ? `<b>${esc(pv.text)}</b> ${LM.OV_INFO[layer][0].toLowerCase()} · ` : `<b>${Math.round(pct * 100)} %</b> done · `}${S.built} task${S.built === 1 ? '' : 's'} · ${open} open</div>`;
  const nAsk = (S.askList || []).length;
  const atl = [nAsk ? `<span class="rules" data-go="ask">${nAsk} to decide</span>` : '', S.blocked ? `<span class="block" data-go="blocked">${S.blocked} blocked</span>` : '', S.stale && !S.blocked ? `<span class="hold" data-go="blocked">${S.stale} still</span>` : '', S.review0 ? `<span class="ai" data-go="review">${S.review0} in review</span>` : '', ch ? `<span class="heat" data-go="new">${ch.n} changed</span>` : ''].filter(Boolean);
  const rowHead = kind === 'land' ? `<div class="lh row"><span class="disc h-${info.hue}"><svg class="lm" viewBox="0 0 48 48"><path d="${LM.LANDMARKS[LM.lmKey(info.lm)].d}"/></svg></span><span class="nm">${esc(name)}</span></div>` : head;
  if (tier === 's') return `${rowHead}${bar}<div class="ln"><b>${pv ? esc(pv.text) : Math.round(pct * 100) + ' %'}</b> · ${S.built} · ${open} open</div>${atl.length ? `<div class="atl">${atl.join('<i>·</i>')}</div>` : ''}`;
  const flags = askFlags(S, tier === 'l' ? 3 : 1);
  const chips = attnChips(S, ch, projSet);
  const crew = tier === 'l' ? crewOf(S) : '';
  const made = ctx.made && ctx.made.length ? `<div class="made">${ctx.made.map((v) => `<span class="mp" data-it="${v.it.id}" title="${esc(v.it.n)}">${LM.picSvg(v.it, v.st)}</span>`).join('')}</div>` : '';
  let tops = '';
  if (kind === 'land' && tier === 'l' && ctx.tops && ctx.tops.length) tops = `<div class="tops">${ctx.tops.map((D) => `<span class="chip sm" data-dist="${D.key}">${Iw('map-pin')}<span>${esc(LM.shortName(LM.distName(ds, lens, D.key)).slice(0, 22))}</span><em>${Math.round((D.size ? D.doneSize / D.size : 0) * 100)} %</em></span>`).join('')}</div>`;
  if (tier === 'm') return `${rowHead}${bar}${line}${flags}${chips || crew ? `<div class="at">${chips}${crew}</div>` : ''}`;
  return `${head}${bar}${line}${made}${flags}${chips || crew ? `<div class="at">${chips}${crew}</div>` : ''}${tops}`;
}
/** Push summaries apart so none overlaps; returns how far each moved. */
function spread(items) {
  for (let it = 0; it < 30; it++) {
    let moved = false;
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const ox = (a.w + b.w) / 2 + 8 - Math.abs(dx), oy = (a.h + b.h) / 2 + 8 - Math.abs(dy);
      if (ox <= 0 || oy <= 0) continue;
      moved = true;
      if (ox < oy) { const s = (dx >= 0 ? 1 : -1) * ox / 2; a.x -= s; b.x += s; } else { const s = (dy >= 0 ? 1 : -1) * oy / 2; a.y -= s; b.y += s; }
    }
    if (!moved) break;
  }
}

// ---- the summaries typeset into the map at the land and area levels (T40): the land's own lettering, no overlay ----
const FONT_D = 'Sora, Figtree, system-ui, sans-serif', FONT_T = 'Figtree, system-ui, sans-serif';
function haloText(ctx, T, text, x, y, size, weight, color, align = 'center', maxW, display) {
  ctx.font = `${weight} ${size}px ${display ? FONT_D : FONT_T}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(3, size * 0.3); ctx.strokeStyle = rgba(T.light ? T.paper : T.ink0, T.light ? 0.9 : 0.7); ctx.strokeText(text, x, y, maxW);
  ctx.fillStyle = color; ctx.fillText(text, x, y, maxW);
}
const ellip = (ctx, text, maxW) => { if (ctx.measureText(text).width <= maxW) return text; let lo = 0, hi = text.length; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (ctx.measureText(text.slice(0, mid) + '…').width <= maxW) lo = mid; else hi = mid - 1; } return text.slice(0, Math.max(1, lo)).trimEnd() + '…'; };
const hitBox = (x0, y0, x1, y1, act) => LM.hits.push({ x0, y0, x1, y1, act });
LM.drawSummaries = function drawSummaries(ctx, vis, world, lod, stats, since, layer, projSet, traceLands) {
  const T = LM.theme, ds = LM.ds, view = LM.view, k = LM.cam.k, ys = LM.YS;
  const pic = view.pic || 'thumb';
  const panelW = view.panel && LM.W > 1100 ? 382 : 0;
  const free = { x0: 0, y0: LM.W <= 720 ? 150 : 175, x1: LM.W - panelW, y1: LM.H - (LM.W <= 720 ? 300 : 100) };
  const fracIn = (bb) => { const ix = Math.max(0, Math.min(bb.x1, free.x1) - Math.max(bb.x0, free.x0)), iy = Math.max(0, Math.min(bb.y1, free.y1) - Math.max(bb.y0, free.y0)); return (ix * iy) / Math.max(1, (bb.x1 - bb.x0) * (bb.y1 - bb.y0)); };
  const screenBox = (rings) => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const ring of rings) for (const [x, y] of ring) { const [sx, sy] = LM.toScreen(x, y); if (sx < x0) x0 = sx; if (sx > x1) x1 = sx; if (sy < y0) y0 = sy; if (sy > y1) y1 = sy; } return { x0, y0, x1, y1 }; };
  for (const S of [...vis.lands.values(), ...vis.districts.values()]) if (S.review0 === undefined) { S.review0 = 0; for (const v of S.items) if (v.it && v.st.s === 'review') S.review0++; }
  const here = lod === 1 ? LM.hereLand : null;
  LM.labelRects = [];
  const TIERS = ['name', 'xs', 's', 'm', 'l'];
  const stateOrder = ['done', 'review', 'doing', 'blocked', 'todo'];
  const phone = LM.W <= 720;
  const drawPlace = (S, kind, shape, info, cap, dim) => {
    const rings = LM.hullOf(world, shape);
    const bb = screenBox(rings);
    if (bb.x1 < -40 || bb.x0 > LM.W + 40 || bb.y1 < -40 || bb.y0 > LM.H + 40) return;
    const frac = fracIn(bb);
    const pole = LM.poleOf(world, shape); const [px, py] = LM.toScreen(pole.x, pole.y);
    const wide = LM.fitBox(world, shape, 1.4), xsBox = LM.fitBox(world, shape, 2.6);
    const bw = wide.w * k, bh = wide.h * k * ys, xw = xsBox.w * k, xh = xsBox.h * k * ys;
    const name = kind === 'land' ? info.name : LM.shortName(LM.distName(ds, view.lens, S.key));
    const pct = S.size ? S.doneSize / S.size : 0, open = (S.built || 0) - (S.done || 0) - (S.dropped || 0);
    const pv = layer ? LM.placeValue(S, layer, stats, kind === 'land') : null;
    const ch = since ? (kind === 'land' ? since.places : since.districts).get(S.key) : null;
    const asks = (S.askList || []).slice().sort((a, b) => (b.to === 'owner') - (a.to === 'owner') || b.b - a.b);
    const atl = [asks.length ? { ic: 'message-circle-question', col: T.rules, text: `${asks.length} to decide`, go: 'ask' } : null, S.blocked ? { ic: 'construction', col: T.coral, text: `${S.blocked} blocked`, go: 'blocked' } : null, S.stale && !S.blocked ? { ic: 'hourglass', col: T.amber, text: `${S.stale} still`, go: 'blocked' } : null, S.review0 ? { ic: 'eye', col: T.ai, text: `${S.review0} in review`, go: 'review' } : null, ch ? { ic: 'history', col: T.heat, text: `${ch.n} changed`, go: 'new' } : null].filter(Boolean);
    if (phone) atl.length = 0;
    const crewList = (() => { const m = new Map(); for (const v of S.items) if (v.it && !v.st.closed) { const w = LM.who(v.it); const c = m.get(w.name) || { w, n: 0 }; c.n++; m.set(w.name, c); } return [...m.values()].sort((a, b) => (a.w.agent - b.w.agent) || b.n - a.n); })();
    const made = pic !== 'off' ? S.items.filter((v) => v.it && !v.st.dropped && (v.st.done || v.st.s === 'doing' || v.st.s === 'review')).sort((p, q) => q.st.since - p.st.since).slice(0, 3) : [];
    const tops = kind === 'land' ? [...vis.districts.values()].filter((D) => D.land === S.key && D.built >= 2).sort((a, b) => (b.asks * 4 + b.blocked * 3 + b.n * 0.05) - (a.asks * 4 + a.blocked * 3 + a.n * 0.05)).slice(0, 3) : [];
    const A = atl.length ? 20 : 0;
    const H = { name: 24 + A, xs: 24 + 18 + A, s: 26 + 12 + 18 + A + 12, m: 30 + 12 + 18 + (asks.length ? 24 : 0) + A + (crewList.length ? 26 : 0) + 20, l: 72 + 12 + 20 + (made.length ? 48 : 0) + Math.min(2, asks.length) * 24 + A + (crewList.length ? 26 : 0) + (tops.length ? 20 : 0) + 36 };
    const Wn = { name: 90, xs: 118, s: 136, m: 200, l: 280 };
    let tier = 'name', box = xsBox;
    if (frac >= 0.6) for (const tn of ['l', 'm', 's', 'xs']) { if (TIERS.indexOf(tn) > TIERS.indexOf(cap)) continue; const w0 = tn === 'xs' ? xw : bw, h0 = tn === 'xs' ? xh : bh; if (w0 >= Wn[tn] && h0 >= H[tn]) { tier = tn; box = tn === 'xs' ? xsBox : wide; break; } }
    let cx, cy, boxW;
    if (tier === 'name') { if (!(px > -120 && px < LM.W + 120 && py > -40 && py < LM.H + 40)) return; cx = px; cy = py; boxW = Math.max(120, xw); } else { [cx, cy] = LM.toScreen(box.x, box.y); boxW = box.w * k; }
    // a map drops a label that would land on another
    const rw = (tier === 'name' || tier === 'xs') ? Math.max(130, Math.min(190, boxW)) : boxW, rh = H[tier];
    const R = { x0: cx - rw / 2, y0: cy - rh / 2 - 2, x1: cx + rw / 2, y1: cy + rh / 2 + 2 };
    if ((tier === 'name' || tier === 'xs') && LM.labelRects.some((o) => R.x0 < o.x1 && R.x1 > o.x0 && R.y0 < o.y1 && R.y1 > o.y0)) return;
    LM.labelRects.push(R);
    const hue = T.hues[info.hue] || T.hues.slate;
    ctx.save(); ctx.globalAlpha = dim;
    if (pic === 'full' && tier !== 'name') { rrect(ctx, cx - boxW / 2 - 6, cy - H[tier] / 2 - 8, boxW + 12, H[tier] + 16, 14); ctx.fillStyle = rgba(T.sea, T.light ? 0.75 : 0.72); ctx.fill(); }
    let y = cy - H[tier] / 2;
    const fg = rgba(T.fg, 1), mut = rgba(T.fg, 0.78);
    // the head: landmark and name (a pin and name for an area)
    if (kind === 'land' && tier === 'l') {
      const r = 22; ctx.beginPath(); ctx.arc(cx, y + r, r, 0, Math.PI * 2); ctx.fillStyle = rgba(hue, 0.28); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = rgba(hue, 0.75); ctx.stroke();
      LM.landmark(ctx, info.lm, cx, y + r, 30, rgba(hue, 1), 1.8);
      haloText(ctx, T, name, cx, y + 2 * r + 16, 21, 600, fg, 'center', boxW - 10, true);
      y += 72;
    } else {
      let size = tier === 'm' ? 18 : tier === 's' ? 16 : tier === 'xs' ? 14.5 : 14;
      const r = kind === 'land' ? (tier === 'm' ? 13 : tier === 's' ? 11 : 9) : 0;
      const roomW = Math.max(boxW, tier === 'name' || tier === 'xs' ? 170 : 0) - (r ? 2 * r + 10 : 20) - 6;
      ctx.font = `600 ${size}px ${FONT_D}`;
      while (size > 12 && ctx.measureText(name).width > roomW) { size -= 0.5; ctx.font = `600 ${size}px ${FONT_D}`; }
      const label = ellip(ctx, name, roomW);
      const tw = ctx.measureText(label).width, iw = kind === 'land' ? 2 * r + 8 : 18;
      const x0 = cx - (tw + iw) / 2;
      if (kind === 'land') { ctx.beginPath(); ctx.arc(x0 + r, y + 12, r, 0, Math.PI * 2); ctx.fillStyle = rgba(hue, 0.3); ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = rgba(hue, 0.75); ctx.stroke(); LM.landmark(ctx, info.lm, x0 + r, y + 12, r * 1.35, rgba(hue, 1), 1.6); }
      else LM.icon(ctx, 'map-pin', x0 + 7, y + 12, 14, rgba(hue, 1), 2);
      haloText(ctx, T, label, x0 + iw, y + 12, size, 600, fg, 'left', undefined, true);
      y += tier === 'm' ? 30 : tier === 's' ? 26 : 24;
    }
    const rowGap = tier === 'l' ? 8 : 6;
    if (tier !== 'name') {
      if (tier !== 'xs') {
        // the bar: tasks by state, or the layer's value, drawn into the ground
        const W = Math.min(boxW - 24, tier === 'l' ? 220 : tier === 'm' ? 180 : 140), x0 = cx - W / 2, hb = tier === 'l' ? 7 : 6;
        rrect(ctx, x0, y, W, hb, hb / 2); ctx.fillStyle = rgba(T.light ? T.ink0 : T.paper, 0.18); ctx.fill();
        if (pv) { rrect(ctx, x0, y, Math.max(hb, W * pv.v), hb, hb / 2); ctx.fillStyle = rgba(LM.layerColor(layer, T), 0.95); ctx.fill(); }
        else { const n = Math.max(1, S.built || 0); const c = { done: S.done || 0, review: 0, doing: 0, blocked: S.blocked || 0, todo: 0 }; for (const v of S.items) if (v.it) { if (v.st.s === 'review') c.review++; else if (v.st.s === 'doing') c.doing++; else if (v.st.s === 'todo') c.todo++; } let xx = x0; for (const st of stateOrder) { const w = (c[st] / n) * W; if (w < 0.5) continue; ctx.fillStyle = rgba(T.state[st], st === 'todo' ? 0.35 : 0.95); ctx.fillRect(xx, y, w, hb); xx += w; } }
        y += hb + rowGap;
      }
      // the line
      const line = pv ? `${pv.text} ${LM.OV_INFO[layer][0].toLowerCase()} · ${S.built} · ${open} open` : `${Math.round(pct * 100)} % · ${S.built} · ${open} open`;
      haloText(ctx, T, line, cx, y + 8, tier === 'l' ? 14 : tier === 'xs' ? 12 : 13, 600, fg, 'center', boxW - 8);
      y += 18 + rowGap;
      // pictures of what it made lately
      if (tier === 'l' && made.length) { const pw = 56, ph = 42, gap = 6; let xx = cx - (made.length * pw + (made.length - 1) * gap) / 2; for (const v of made) { ctx.save(); rrect(ctx, xx, y, pw, ph, 6); ctx.clip(); LM.drawPic(ctx, v.it, v.st, xx, y, pw, ph, 1); ctx.restore(); rrect(ctx, xx, y, pw, ph, 6); ctx.lineWidth = 1; ctx.strokeStyle = rgba(T.paper, 0.35); ctx.stroke(); hitBox(xx, y, xx + pw, y + ph, { it: v.it, title: v.it.n }); xx += pw + gap; } y += ph + rowGap; }
      // the open asks as flags
      const nFlags = tier === 'l' ? Math.min(2, asks.length) : tier === 'm' ? Math.min(1, asks.length) : 0;
      for (let i = 0; i < nFlags; i++) {
        const a = asks[i]; const W = Math.min(boxW - 16, tier === 'l' ? 250 : 190), x0 = cx - W / 2;
        ctx.beginPath(); ctx.moveTo(x0, y - 2); ctx.lineTo(x0, y + 20); ctx.lineWidth = 2; ctx.strokeStyle = rgba(T.fg, 0.85); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x0 + 2, y); ctx.lineTo(x0 + W, y); ctx.lineTo(x0 + W - 8, y + 9); ctx.lineTo(x0 + W, y + 18); ctx.lineTo(x0 + 2, y + 18); ctx.closePath();
        ctx.fillStyle = rgba(a.to === 'owner' ? [90, 108, 240] : T.rules, 0.96); ctx.fill(); if (a.to === 'owner') { ctx.lineWidth = 1.5; ctx.strokeStyle = rgba(T.gold, 0.9); ctx.stroke(); }
        LM.icon(ctx, a.kind === 'approve' ? 'badge-check' : a.kind === 'unblock' ? 'construction' : 'message-circle-question', x0 + 12, y + 9, 12, 'rgba(255,255,255,.95)', 2);
        ctx.font = `600 12px ${FONT_T}`; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(ellip(ctx, a.n, W - 34), x0 + 22, y + 9);
        hitBox(x0, y - 2, x0 + W, y + 20, { ask: a, title: a.n }); y += 24;
      }
      if (asks.length > nFlags && tier !== 's' && tier !== 'xs' && !atl.some((x) => x.go === 'ask')) atl.unshift({ ic: 'message-circle-question', col: T.rules, text: `+${asks.length - nFlags} more to decide`, go: 'ask' });
      else if (nFlags && atl[0] && atl[0].go === 'ask') { if (asks.length > nFlags) atl[0].text = `+${asks.length - nFlags} more to decide`; else atl.shift(); }
    }
    // the attention, as map symbols with their counts
    if (atl.length) {
      ctx.font = `600 12.5px ${FONT_T}`;
      const ws = atl.map((x) => 16 + ctx.measureText(x.text).width); const total = ws.reduce((p, q) => p + q, 0) + (atl.length - 1) * 10;
      let xx = cx - total / 2;
      atl.forEach((x, i) => { LM.icon(ctx, x.ic, xx + 6.5, y + 9, 13, rgba(x.col, 1), 2.2); haloText(ctx, T, x.text, xx + 16, y + 9, 12.5, 600, rgba(x.col, 1), 'left'); hitBox(xx - 4, y - 2, xx + ws[i] + 4, y + 20, { go: x.go, S, kind, title: x.text }); xx += ws[i] + 10; });
      y += 20;
    }
    if ((tier === 'l' || tier === 'm') && crewList.length) {
      const r = 10, n = Math.min(3, crewList.length), extra = crewList.length - n; const total = n * 22 + (extra ? 24 : 0) - 2; let xx = cx - total / 2 + r;
      for (let i = 0; i < n; i++) { const { w } = crewList[i]; ctx.beginPath(); ctx.arc(xx, y + 12, r, 0, Math.PI * 2); ctx.fillStyle = rgba(w.agent ? T.ai : T.acc, 0.35); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = rgba(T.sea, 0.9); ctx.stroke(); if (w.agent) LM.icon(ctx, 'bot', xx, y + 12, 11, fg, 2); else { ctx.font = `700 10px ${FONT_T}`; ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(w.initial, xx, y + 12.5); } hitBox(xx - r, y + 2, xx + r, y + 22, { go: 'all', S, kind, title: `${w.name} · ${crewList[i].n} open` }); xx += 22; }
      if (extra) { ctx.font = `600 11px ${FONT_T}`; ctx.fillStyle = mut; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(`+${extra}`, xx - r + 2, y + 12); }
      y += 26;
    }
    if (tier === 'l' && tops.length) {
      ctx.font = `500 12px ${FONT_T}`;
      const parts = tops.map((D) => ({ D, text: `${ellip(ctx, LM.shortName(LM.distName(ds, view.lens, D.key)), 90)} ${Math.round((D.size ? D.doneSize / D.size : 0) * 100)} %` }));
      const ws = parts.map((x) => ctx.measureText(x.text).width); const total = ws.reduce((p, q) => p + q, 0) + (parts.length - 1) * 14;
      let xx = cx - total / 2;
      parts.forEach((x, i) => { haloText(ctx, T, x.text, xx, y + 9, 12, 500, mut, 'left'); hitBox(xx - 3, y, xx + ws[i] + 3, y + 18, { dist: x.D.key, title: x.text }); if (i < parts.length - 1) { ctx.fillStyle = rgba(T.fg, 0.4); ctx.fillText('·', xx + ws[i] + 4, y + 9); } xx += ws[i] + 14; });
      y += 20;
    }
    ctx.restore();
  };
  for (const L of vis.lands.values()) {
    if (here && here.key === L.key) continue;
    const info = LM.landInfo(ds, view.lens, L.key);
    const dim = (traceLands && !traceLands.has(L.key) ? 0.35 : 1) * (projSet && !L.proj ? 0.45 : 1) * (lod === 1 ? 0.55 : 1);
    drawPlace(L, 'land', LM.shapeOf(L), info, lod === 1 ? 's' : 'l', dim);
  }
  if (here) {
    const L = here, info = LM.landInfo(ds, view.lens, L.key), hue = T.hues[info.hue] || T.hues.slate;
    const bb = screenBox(LM.hullOf(world, LM.shapeOf(L)));
    const lx = (bb.x0 + bb.x1) / 2, ly = Math.max(free.y0 + 26, bb.y0 + 30);
    ctx.save(); ctx.letterSpacing = '0.14em'; ctx.font = `600 15px ${FONT_D}`; const tw = ctx.measureText(info.name.toUpperCase()).width; ctx.letterSpacing = '0px';
    const x0 = lx - (tw + 40) / 2; ctx.beginPath(); ctx.arc(x0 + 15, ly, 15, 0, Math.PI * 2); ctx.fillStyle = rgba(hue, 0.3); ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = rgba(hue, 0.75); ctx.stroke(); LM.landmark(ctx, info.lm, x0 + 15, ly, 20, rgba(hue, 1), 1.6);
    ctx.letterSpacing = '0.14em'; haloText(ctx, T, info.name.toUpperCase(), x0 + 40, ly, 15, 600, rgba(T.fg, 0.9), 'left', undefined, true); ctx.letterSpacing = '0px'; ctx.restore();
    hitBox(x0, ly - 16, x0 + tw + 40, ly + 16, { land: L, title: info.name });
    for (const D of vis.districts.values()) { if (D.land !== L.key || !D.built) continue; drawPlace(D, 'district', D, info, 'm', projSet && !D.proj ? 0.3 : 1); }
  }
};

LM.syncOverlays = function syncOverlays(vis, world, lod, stats, since, layer, nowMode, projSet, traceSet, traceLands) {
  const root = LM.tilesEl; if (!root) return;
  const ds = LM.ds, view = LM.view, k = LM.cam.k;
  if (root.dataset.level !== String(lod)) { root.dataset.level = String(lod); root.innerHTML = ''; LM.overlays.clear(); }
  root.dataset.pic = view.pic || 'thumb';
  const alive = new Set();
  LM.leaders = [];
  const want = (key, cls, html, x, y, w, h, extra) => {
    alive.add(key);
    let m = LM.overlays.get(key);
    if (!m) { m = { el: document.createElement('div'), html: '', cls: '' }; m.el.className = cls; m.el.dataset.key = key; root.appendChild(m.el); LM.overlays.set(key, m); if (extra && extra.bind) extra.bind(m.el); }
    if (m.html !== html) { m.el.innerHTML = html; m.html = html; LM.marksIn(m.el); }
    if (m.cls !== cls) { m.el.className = cls; m.cls = cls; }
    m.el.style.width = w ? w + 'px' : ''; m.el.style.height = h ? h + 'px' : '';
    m.el.style.transform = `translate(${(x - (w || m.el.offsetWidth) / 2).toFixed(1)}px,${(y - (h || m.el.offsetHeight) / 2).toFixed(1)}px)`;
    if (extra && extra.op !== undefined) m.el.style.opacity = extra.op;
    return m;
  };
  const bindPlace = (el, S, kind) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const ask = e.target.closest('[data-ask]'); const chip = e.target.closest('[data-go]'); const dist = e.target.closest('[data-dist]'); const mp = e.target.closest('[data-it]');
      if (mp) { const it = ds.items.find((x) => x.id === mp.dataset.it); if (it) LM.select(it); return; }
      if (ask) { const a = ds.asks.find((x) => x.id === ask.dataset.ask); if (a) { const p = LM.askPlace(ds, a, view.lens, view.t); LM.select({ ask: a, it: p.it }); } return; }
      if (dist) { LM.flyToDistrict(dist.dataset.dist); return; }
      if (chip) { LM.focusPanel(chip.dataset.go, S, kind); return; }
      if (kind === 'land') LM.flyToLand(S.key); else LM.flyToDistrict(S.key);
    });
  };
  for (const S of [...vis.lands.values(), ...vis.districts.values()]) { S.review0 = 0; for (const v of S.items) if (v.it && v.st.s === 'review') S.review0++; }
  const base = { ds, lens: view.lens, layer, stats, since, projSet };

  if (lod === 2) {
    // ---- hexagonal tiles: the task inside the shape ----
    const r = 0.93, hw = Math.sqrt(3) / 2 * r * k, hh = r * k * LM.YS;
    const w = hw * 2, h = hh * 2;
    const tier = k >= 170 ? 'xl' : k >= 135 ? 'l' : k >= 108 ? 'm' : 's';
    root.style.setProperty('--hexclip', 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)');
    const sizeDots = (n) => `<span class="dots" title="size ${n} of 5">${[1, 2, 3, 4, 5].map((i) => `<i${i <= n ? ' class="on"' : ''}></i>`).join('')}</span>`;
    for (const [id, p] of LM.tilePos) {
      if (p.x < -w || p.x > LM.W + w || p.y < -h || p.y > LM.H + h) continue;
      const v = p.v, it = v.it, st = v.st;
      const kind = LM.kindOf(it); const who = LM.who(it);
      const asks = LM.askByItem.get(it.id);
      const prob = LM.problemOf(st, asks);
      const rooms = LM.rooms(it, st), met = rooms.filter((x) => x.st === 'met').length;
      const ch = since ? since.items.get(it.id) : null;
      const stateWord = st.dropped ? 'Set aside' : LM.STATUS_WORD[st.s];
      const val = p.tv ? `<b>${esc(p.tv.text)}</b><small>${LM.OV_INFO[layer][0].toLowerCase()}</small>` : st.done ? `<b>${LM.rel(it.doneAt || st.since, view.t)}</b>` : st.dropped ? '' : st.s === 'todo' ? `<b>0 %</b>` : `<b>${Math.round(st.h * 100)} %</b>`;
      const downs = ds.items.filter((o) => o.dep.includes(it.id)).length;
      const proj = it.projects.length ? ds.byProject.get(it.projects[0]) : null;
      const land = LM.landInfo(ds, view.lens, v.g);
      const pic = view.pic || 'thumb';
      // the tile: a cover (the picture, or the kind on its state colour) in the pointed top, the strip on its lower edge,
      // the title and the aligned facts in the wide middle, who and since in the pointed foot
      const cover = pic !== 'off' && !st.dropped ? LM.picSvg(it, st, 'cv') : `<span class="kglyph f-${kind[0]}">${Iw(kind[1])}</span>`;
      const banner = asks ? `<div class="askban${asks.some((a) => a.to === 'owner') ? ' you' : ''}" data-ask="${asks[0].id}" title="${esc(asks[0].n)}">${Iw(asks[0].kind === 'approve' ? 'badge-check' : asks[0].kind === 'unblock' ? 'construction' : 'message-circle-question')}<span>${esc(asks[0].n)}</span></div>` : '';
      const fact = (ic, v2, lbl, title) => `<span class="f" title="${title || lbl}">${ic}<em>${v2}</em><small>${lbl}</small></span>`;
      const facts = tier === 's' ? '' : `<div class="facts">${fact(segRingHtml(18, rooms.map((x) => x.st), 3), `${met}/${rooms.length}`, 'criteria', `${met} of ${rooms.length} criteria met`)}${fact(sizeDots(it.s), '', 'size', `size ${it.s} of 5`)}${tier === 'm' ? '' : fact(Iw('route'), `${it.dep.length}→${downs}`, 'links', `waits on ${it.dep.length} · frees ${downs}`) + (it.cost ? fact(Iw('flame'), LM.fmtMoney(st.cost), 'cost') : it.children.length ? fact(Iw('git-branch'), it.children.length, 'parts', `${it.children.length} subtasks`) : '')}</div>`;
      const why = tier === 'xl' ? `<div class="why">${Iw('target')}<span>Serves ${esc(land.name)}${proj ? ` · ${esc(proj.short)}` : ''}</span></div>` : '';
      const html = `<div class="cov">${cover}</div>
        <div class="strip"><span class="g f-${kind[0]} sm">${Iw(kind[1])}</span><span class="stw st-${st.dropped ? 'dropped' : st.s}">${stateWord}</span><span class="val">${val}</span>${prob && prob !== 'ask' ? `<span class="pb f-${PROBLEM[prob][1]}" title="${prob}">${Iw(PROBLEM[prob][0])}</span>` : ch ? `<span class="pb f-${badgeOf(ch.kind)[1]}" title="changed since you last looked">${Iw(badgeOf(ch.kind)[0])}</span>` : ''}</div>
        ${banner}
        <div class="tt">${esc(it.n)}</div>
        ${facts}
        <div class="tf"><span class="av ${who.agent ? 'ag' : who.cls}" title="${esc(who.name)}">${who.agent ? Iw('bot') : who.initial}</span><span class="tw">${tier === 's' ? '' : esc(who.name.length > 14 ? who.initial : who.name) + ' · '}${LM.rel(st.since, view.t)}</span>${proj && tier !== 's' && tier !== 'm' ? `<span class="pt" title="${esc(proj.n)}">${Iw('kanban')}${esc(proj.short.length > 16 ? proj.short.slice(0, 14) + '…' : proj.short)}</span>` : ''}</div>${why}`;
      const quiet = nowMode && view.quiet && st.old && !ch && !projSet && !traceSet;
      const col = p.tv ? LM.hueVar(LM.layerHue(layer)) : '';
      const cls = `hex ${tier}${view.sel === it ? ' sel' : ''}${st.dropped ? ' park' : ''}${quiet ? ' quiet' : ''} st-${st.dropped ? 'dropped' : st.s}${asks ? ' asked' : ''}${layer ? ' lay' : ''} pic-${pic}`;
      const m = want('T:' + id, cls, html, p.x, p.y, w, h, { bind: (el) => { el.addEventListener('click', (e) => { if (LM.dragMoved) return; e.stopPropagation(); const ask = e.target.closest('[data-ask]'); if (ask) { const a = ds.asks.find((x) => x.id === ask.dataset.ask); if (a) { LM.select({ ask: a, it }); return; } } LM.select(it); }); el.addEventListener('pointerenter', (e) => { if (LM.dragging) return; LM.view.hover = it; LM.renderTip({ it }, e.clientX, e.clientY); LM.dirty(); }); el.addEventListener('pointermove', (e) => { if (!LM.dragging) LM.renderTip({ it }, e.clientX, e.clientY); }); el.addEventListener('pointerleave', () => { LM.view.hover = null; LM.renderTip(null); LM.dirty(); }); }, op: p.dim.toFixed(2) });
      if (col) m.el.style.setProperty('--lc', col); else m.el.style.removeProperty('--lc');
      m.el.style.setProperty('--fill', p.fill.toFixed(2));
      const pad = `${(w * 0.08).toFixed(0)}px`; if (m.pad !== pad) { m.pad = pad; m.el.style.setProperty('--px', pad); }
    }
    // ---- council tiles: the decisions decided on a square, the latest written out ----
    for (const S of (LM.squares || new Map()).values()) {
      if (S.x < -w || S.x > LM.W + w || S.y < -h || S.y > LM.H + h) continue;
      const list = S.list.slice().sort((a, b) => b.mon.b - a.mon.b);
      const n = tier === 's' ? 1 : tier === 'm' ? 2 : 3;
      const html = `<div class="th"><span class="g f-rules sm">${Iw('signpost')}</span><span class="stw st-rules">${S.n} decision${S.n > 1 ? 's' : ''} here</span></div><div class="dl">${list.slice(0, n).map((v) => `<span class="row" data-dec="${v.mon.id}"><b>${v.mon.id}</b><span>${esc(v.mon.n.replace(/\*\*/g, '').slice(0, tier === 's' ? 40 : 70))}</span><em>${LM.fmtShort(v.mon.b)}</em></span>`).join('')}</div>${S.n > n ? `<div class="meta">and ${S.n - n} earlier · click for all</div>` : ''}`;
      const m = want('S:' + S.key, `hex council ${tier}`, html, S.x, S.y, w, h, { bind: (el) => { el.addEventListener('click', (e) => { e.stopPropagation(); const d = e.target.closest('[data-dec]'); if (d) { const dec = ds.decisions.find((x) => x.id === d.dataset.dec); if (dec) { LM.select({ mon: dec }); return; } } LM.select({ plaque: S }); }); } });
      m.el.style.padding = `${(h * 0.17).toFixed(0)}px ${(w * 0.09).toFixed(0)}px ${(h * 0.15).toFixed(0)}px`;
    }
  }
  for (const [key, m] of LM.overlays) if (!alive.has(key)) { m.el.remove(); LM.overlays.delete(key); }
};
LM.syncMarkers = () => {};

/** Hit test on the canvas (what the DOM did not catch): a plaque, a landmark, else the district, else the land. */
LM.hit = function hit(sx, sy) {
  const vis = LM.vis; if (!vis) return null;
  for (let i = (LM.hits || []).length - 1; i >= 0; i--) { const h = LM.hits[i]; if (sx >= h.x0 && sx <= h.x1 && sy >= h.y0 && sy <= h.y1) return { act: h.act }; }
  for (const m of LM.lmPos || []) if (Math.hypot(m.sx - sx, m.sy - m.size * 0.45 - sy) <= m.size * 0.55) return m.v;
  const [wx, wy] = LM.toWorld(sx, sy);
  const [q, r] = LM.xyHex(wx, wy);
  for (const D of vis.districts.values()) if (D.cells.has(q + ',' + r)) return { district: D };
  for (const L of vis.lands.values()) if (LM.shapeOf(L).cells.has(q + ',' + r)) return { land: L };
  return null;
};
