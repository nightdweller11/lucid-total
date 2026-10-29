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
LM.view = { lens: 'dept', overlays: new Set(), t: 0, playing: false, speed: 1, trace: null, sel: null, hover: null, hc: false, reduce: false, since: 0, sinceOn: false, panel: true, time: false, proj: null, quiet: true, mode: 'now', iso: true };
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
  LM.targetYS = lod === 2 && view.iso ? 0.55 : 1;
  const dtF = Math.min(0.1, (now - (LM.lastFrame || now)) / 1000);
  if (Math.abs(LM.YS - LM.targetYS) > 0.002) { const a = view.reduce ? 1 : 1 - Math.exp(-dtF / 0.18); LM.YS += (LM.targetYS - LM.YS) * a; LM.needsFrame = true; } else LM.YS = LM.targetYS;
  ctx.clearRect(0, 0, W, H);
  const world = LM.worlds[view.lens];
  if (!world.poleCache) world.poleCache = new Map();
  const vis = (LM.vis = LM.visible(world, view.t));
  const O = view.overlays;
  const layer = [...O].find((o) => o !== 'deps') || null;
  const stats = (LM.stats = overlayStats(ds, vis));
  const traceSet = view.trace ? view.trace.set : null;
  const traceLands = view.trace ? view.trace.lands : null;
  const proj = view.proj ? ds.byProject.get(view.proj) : null;
  const projSet = proj ? new Set(proj.items) : null;
  const hueOf = (g) => T.hues[LM.landInfo(ds, view.lens, g).hue] || T.hues.slate;
  const pulse = (now / 900) % 1;
  const since = view.sinceOn ? (LM.sinceCache && LM.sinceCache.t0 === view.since && LM.sinceCache.t1 === view.t && LM.sinceCache.lens === view.lens ? LM.sinceCache : (LM.sinceCache = Object.assign(LM.changes(ds, view.lens, view.since, view.t), { lens: view.lens }))) : null;
  LM.since = since;
  const nowMode = view.mode === 'now';
  const asksAt = LM.openAsks(ds, view.t);
  const askByItem = new Map(); for (const a of asksAt) { const p = LM.askPlace(ds, a, view.lens, view.t); if (p.it) { if (!askByItem.has(p.it.id)) askByItem.set(p.it.id, []); askByItem.get(p.it.id).push(a); } }
  LM.askByItem = askByItem;
  for (const S of [...vis.lands.values(), ...vis.districts.values()]) { S.asks = 0; S.proj = 0; }
  for (const a of asksAt) { const p = LM.askPlace(ds, a, view.lens, view.t); const L = p.g && vis.lands.get(p.g), D = p.d && vis.districts.get(p.d); if (L) L.asks++; if (D) D.asks++; }
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
    const rings = LM.hullOf(world, L);
    const prog = L.size ? L.doneSize / L.size : 0;
    const dim = (traceLands && !traceLands.has(L.key) ? 0.35 : 1) * (projSet && !L.proj ? 0.4 : 1);
    const [cx, cy] = LM.toScreen(L.cx, L.cy);
    const R = Math.max(30, Math.sqrt(L.n) * k * 1.7);
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
      if (v.mon) { const sq = v.q + ',' + v.r; if (!squares.has(sq)) squares.set(sq, { x: sx, y: sy, n: 0, g: v.g, d: v.d, list: [], recent: 0 }); const S = squares.get(sq); S.n++; S.list.push(v); continue; }
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
    for (const S of squares.values()) {
      const r = Math.max(6, Math.min(12, k * 0.1)); const dimS = traceLands && !traceLands.has(S.g) ? 0.3 : 1;
      ctx.save(); ctx.globalAlpha = dimS;
      ctx.lineWidth = Math.max(1, k * 0.02); ctx.strokeStyle = T.ink(0.6); ctx.beginPath(); ctx.moveTo(S.x, S.y); ctx.lineTo(S.x, S.y - r * 2.2); ctx.stroke();
      rrect(ctx, S.x - r * 1.3, S.y - r * 3.6, r * 2.6, r * 1.6, r * 0.4); ctx.fillStyle = rgba(T.light ? [77, 95, 214] : T.rules, 0.9); ctx.fill();
      ctx.font = `600 ${Math.max(8, r * 1.05)}px Figtree, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(String(S.n), S.x, S.y - r * 2.8);
      ctx.restore(); S.r = r;
    }
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
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const lmLab = [];
  for (const m of LM.lmPos) { if (lmLab.some(([x, y]) => Math.abs(x - m.sx) < 60 && Math.abs(y - m.sy) < 30)) continue; lmLab.push([m.sx, m.sy]); ctx.font = `600 13px Figtree, system-ui, sans-serif`; ctx.lineWidth = 4; ctx.strokeStyle = rgba(T.black, T.light ? 0.9 : 0.7); ctx.lineJoin = 'round'; ctx.strokeText(m.v.lm.n, m.sx, m.sy - m.size - 6); ctx.fillStyle = rgba(T.gold, 1); ctx.fillText(m.v.lm.n, m.sx, m.sy - m.size - 6); }

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

// ---- the overlays in the DOM: land summaries, district summaries and callouts, hexagonal tiles ----
LM.overlays = new Map();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const Iw = (n) => LM.I(n);
const segRingHtml = (size, segs, w) => { const r = size / 2 - w / 2 - 1, c = size / 2, n = segs.length, gap = 4; return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">${segs.map((st, i) => { const len = 100 / n - gap; return `<circle class="trk seg-${st}" cx="${c}" cy="${c}" r="${r}" stroke-width="${w}" pathLength="100" stroke-dasharray="${len.toFixed(2)} ${(100 - len).toFixed(2)}" stroke-dashoffset="${(-(i * 100 / n + gap / 2) + 25).toFixed(2)}" stroke-linecap="round"/>`; }).join('')}</svg>`; };
/** The stacked bar of a place's tasks by state. */
const stateBar = (S) => {
  const n = Math.max(1, S.built || 0); const c = { done: S.done || 0, review: 0, doing: 0, blocked: S.blocked || 0, todo: 0 };
  for (const v of S.items) if (v.it) { if (v.st.s === 'review') c.review++; else if (v.st.s === 'doing') c.doing++; else if (v.st.s === 'todo') c.todo++; }
  return `<span class="sbar" role="img" aria-label="${c.done} done, ${c.review} in review, ${c.doing} in progress, ${c.blocked} blocked, ${c.todo} planned">${['done', 'review', 'doing', 'blocked', 'todo'].map((s) => c[s] ? `<i class="s-${s}" style="width:${(c[s] / n * 100).toFixed(1)}%"></i>` : '').join('')}</span>`;
};
/** The attention chips of a place; each leads to what it counts. */
const attnChips = (S, ch, projSet) => [S.asks ? `<span class="k rules" data-go="ask">${Iw('message-circle-question')}${S.asks} to decide</span>` : '', S.blocked ? `<span class="k block" data-go="blocked">${Iw('construction')}${S.blocked} blocked</span>` : '', S.stale && !S.blocked ? `<span class="k hold" data-go="blocked">${Iw('hourglass')}${S.stale} still</span>` : '', (S.review0 || 0) ? `<span class="k ai" data-go="review">${Iw('eye')}${S.review0} in review</span>` : '', ch ? `<span class="k heat" data-go="new">${Iw('history')}${ch.n} changed</span>` : '', projSet && S.proj ? `<span class="k gold">${Iw('kanban')}${S.proj} of the project</span>` : ''].filter(Boolean).join('');
const healthOf = (S) => (S.asks || S.blocked >= 2 ? 'needs' : S.blocked || S.stale > (S.built || 1) * 0.3 ? 'watch' : (S.built - S.done - (S.dropped || 0)) === 0 ? 'done' : 'ok');

LM.syncOverlays = function syncOverlays(vis, world, lod, stats, since, layer, nowMode, projSet, traceSet, traceLands) {
  const root = LM.tilesEl; if (!root) return;
  const ds = LM.ds, view = LM.view, k = LM.cam.k;
  if (root.dataset.level !== String(lod)) { root.dataset.level = String(lod); root.innerHTML = ''; LM.overlays.clear(); }
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
      const chip = e.target.closest('[data-go]'); const dist = e.target.closest('[data-dist]');
      if (dist) { LM.flyToDistrict(dist.dataset.dist); return; }
      if (chip) { LM.focusPanel(chip.dataset.go, S, kind); return; }
      if (kind === 'land') LM.flyToLand(S.key); else LM.flyToDistrict(S.key);
    });
  };
  for (const S of [...vis.lands.values(), ...vis.districts.values()]) { S.review0 = 0; for (const v of S.items) if (v.it && v.st.s === 'review') S.review0++; }

  if (lod <= 1) {
    // ---- land summaries, overlaid at the pole of each land ----
    for (const L of vis.lands.values()) {
      const info = LM.landInfo(ds, view.lens, L.key);
      const pole = LM.poleOf(world, L);
      const [sx, sy] = LM.toScreen(pole.x, pole.y);
      const room = pole.r * k;
      if (sx < -200 || sx > LM.W + 200 || sy < -200 || sy > LM.H + 200) continue;
      const here = lod === 1 && LM.hereLand && LM.hereLand.key === L.key;
      const far = lod === 1 && !here;
      if (here) continue; // at the area level the land under the camera carries its name as a header and its districts speak
      const tier = far ? 'xs' : room >= 150 ? 'l' : room >= 100 ? 'm' : room >= 55 ? 's' : 'xs';
      const pct = L.size ? L.doneSize / L.size : 0;
      const open = (L.built || 0) - (L.done || 0) - (L.dropped || 0);
      const pv = layer ? LM.placeValue(L, layer, stats, true) : null;
      const ch = since ? since.places.get(L.key) : null;
      const Ds = [...vis.districts.values()].filter((D) => D.land === L.key && D.built >= 2).sort((a, b) => (b.asks * 4 + b.blocked * 3 + b.working * 0.5 + b.n * 0.05) - (a.asks * 4 + a.blocked * 3 + a.working * 0.5 + a.n * 0.05)).slice(0, 3);
      const tops = tier === 'l' && Ds.length ? `<div class="tops">${Ds.map((D) => `<span class="chip sm" data-dist="${D.key}">${Iw('map-pin')}<span>${esc(LM.shortName(LM.distName(ds, view.lens, D.key)).slice(0, 22))}</span><em>${Math.round((D.size ? D.doneSize / D.size : 0) * 100)} %</em></span>`).join('')}</div>` : '';
      const line = pv ? `<div class="ln"><b>${esc(pv.text)}</b> ${LM.OV_INFO[layer][0].toLowerCase()} · ${L.built} tasks · ${open} open</div>` : `<div class="ln"><b>${Math.round(pct * 100)} %</b> done · ${L.built} tasks · ${open} open</div>`;
      const html = `<div class="lh"><span class="disc h-${info.hue}"><svg class="lm" viewBox="0 0 48 48"><path d="${LM.LANDMARKS[LM.lmKey(info.lm)].d}"/></svg></span><span class="nm">${esc(info.name)}</span></div>${tier !== 'xs' ? (pv ? `<span class="sbar lay" style="--lv:${pv.v.toFixed(2)};--lc:${LM.hueVar(LM.layerHue(layer))}"><i></i></span>` : stateBar(L)) : ''}${tier === 'm' || tier === 'l' ? line : ''}${tier !== 'xs' ? `<div class="at">${attnChips(L, ch, projSet)}</div>` : ''}${tops}`;
      const dim = (traceLands && !traceLands.has(L.key) ? 0.35 : 1) * (projSet && !L.proj ? 0.45 : 1) * (far ? 0.6 : 1);
      const w = tier === 'l' ? Math.min(330, room * 2.1) : tier === 'm' ? Math.min(250, room * 2.1) : tier === 's' ? Math.min(190, room * 2.1) : 0;
      const m = want('L:' + L.key, `lsum ${tier} h-${info.hue} hl-${healthOf(L)}`, html, sx, sy, w, 0, { bind: (el) => bindPlace(el, L, 'land'), op: dim.toFixed(2) });
      m.el.title = `${info.name}${info.sub ? ': ' + info.sub : ''}`;
    }
  }
  if (lod === 1 && LM.hereLand) {
    // ---- the land's header at its top edge; district summaries overlaid on their territories; callouts where there is no room ----
    const L = LM.hereLand;
    const info = LM.landInfo(ds, view.lens, L.key);
    let bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity;
    for (const c of L.cells) { const [q, r] = c.split(',').map(Number); const [x, y] = LM.hexXY(q, r); bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y); }
    const [lx0, ly0] = LM.toScreen(bx0, by0), [lx1, ly1] = LM.toScreen(bx1, by1);
    const pct = L.size ? L.doneSize / L.size : 0, open = (L.built || 0) - (L.done || 0) - (L.dropped || 0);
    const pvL = layer ? LM.placeValue(L, layer, stats, true) : null, chL = since ? since.places.get(L.key) : null;
    const hdr = `<div class="lh"><span class="disc h-${info.hue}"><svg class="lm" viewBox="0 0 48 48"><path d="${LM.LANDMARKS[LM.lmKey(info.lm)].d}"/></svg></span><span class="nm">${esc(info.name)}</span></div><div class="ln"><b>${pvL ? esc(pvL.text) + ' ' + LM.OV_INFO[layer][0].toLowerCase() : Math.round(pct * 100) + ' % done'}</b> · ${L.built} tasks · ${open} open</div><div class="at">${attnChips(L, chL, projSet)}</div>`;
    want('H:' + L.key, `lsum hdr h-${info.hue} hl-${healthOf(L)}`, hdr, (lx0 + lx1) / 2, Math.max(LM.W <= 720 ? 300 : 215, ly0 - 54), 0, 0, { bind: (el) => bindPlace(el, L, 'land') });
    const Ds = [...vis.districts.values()].filter((D) => D.land === L.key && D.built);
    const callouts = [];
    for (const D of Ds) {
      const pole = LM.poleOf(world, D);
      const [sx, sy] = LM.toScreen(pole.x, pole.y);
      const room = pole.r * k;
      const pv = layer ? LM.placeValue(D, layer, stats, false) : null;
      const ch = since ? since.districts.get(D.key) : null;
      const pctD = D.size ? D.doneSize / D.size : 0;
      const openD = D.built - D.done - (D.dropped || 0);
      const name = LM.shortName(LM.distName(ds, view.lens, D.key));
      const needs = D.asks || D.blocked || (projSet && D.proj) || (ch && ch.n);
      const tier = room >= 95 ? 'm' : room >= 60 ? 's' : room >= 34 ? 'xs' : null;
      if (!tier) { if (needs) callouts.push({ D, sx, sy, name, pv, ch, pct: pctD, open: openD }); continue; }
      const line = pv ? `<div class="ln"><b>${esc(pv.text)}</b> · ${D.built} tasks</div>` : `<div class="ln"><b>${Math.round(pctD * 100)} %</b> · ${D.built} task${D.built === 1 ? '' : 's'} · ${openD} open</div>`;
      const html = `<div class="nm">${esc(name)}</div>${tier !== 'xs' ? (pv ? `<span class="sbar lay" style="--lv:${pv.v.toFixed(2)};--lc:${LM.hueVar(LM.layerHue(layer))}"><i></i></span>` : stateBar(D)) : ''}${tier === 'm' ? line : `<div class="ln">${pv ? esc(pv.text) : Math.round(pctD * 100) + ' %'} · ${D.built}</div>`}${tier !== 'xs' ? `<div class="at">${attnChips(D, ch, projSet)}</div>` : ''}`;
      const w = Math.min(tier === 'm' ? 230 : tier === 's' ? 160 : 110, room * 2);
      want('D:' + D.key, `dsum ${tier} hl-${healthOf(D)}${projSet && !D.proj ? ' dimmed' : ''}`, html, sx, sy, w, 0, { bind: (el) => bindPlace(el, D, 'district') });
    }
    callouts.sort((a, b) => (b.D.asks * 4 + b.D.blocked * 3) - (a.D.asks * 4 + a.D.blocked * 3));
    const rightRoom = LM.W - (view.panel && LM.W > 1100 ? 382 : 16) - lx1, leftRoom = lx0 - 100;
    const side = rightRoom >= 230 || rightRoom >= leftRoom ? 1 : -1;
    const cx = side > 0 ? lx1 + 24 + 105 : lx0 - 24 - 105;
    let cy = Math.max(120, ly0 + 20);
    for (const c of callouts.slice(0, 6)) {
      const D = c.D;
      const html = `<div class="nm">${esc(c.name)}</div>${c.pv ? `<span class="sbar lay" style="--lv:${c.pv.v.toFixed(2)};--lc:${LM.hueVar(LM.layerHue(layer))}"><i></i></span>` : stateBar(D)}<div class="ln"><b>${c.pv ? esc(c.pv.text) : Math.round(c.pct * 100) + ' %'}</b> · ${D.built} task${D.built === 1 ? '' : 's'} · ${c.open} open</div><div class="at">${attnChips(D, c.ch, projSet)}</div>`;
      const m = want('C:' + D.key, `dcall gl l2 hl-${healthOf(D)}`, html, cx, cy + 44, 210, 0, { bind: (el) => bindPlace(el, D, 'district') });
      const h = m.el.offsetHeight || 88;
      m.el.style.transform = `translate(${(cx - 105).toFixed(1)}px,${cy.toFixed(1)}px)`;
      LM.leaders.push([side > 0 ? cx - 105 : cx + 105, cy + h / 2, c.sx, c.sy]);
      cy += h + 10;
    }
  }
  if (lod === 2) {
    // ---- hexagonal tiles: the information inside the shape ----
    const r = 0.93, hw = Math.sqrt(3) / 2 * r * k, hh = r * k * LM.YS;
    const w = hw * 2, h = hh * 2;
    const tier = k >= 170 ? 'xl' : k >= 135 ? 'l' : k >= 108 ? 'm' : 's';
    root.style.setProperty('--hexclip', 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)');
    for (const [id, p] of LM.tilePos) {
      if (p.x < -w || p.x > LM.W + w || p.y < -h || p.y > LM.H + h) continue;
      const v = p.v, it = v.it, st = v.st;
      const kind = LM.kindOf(it); const who = LM.who(it);
      const asks = LM.askByItem.get(it.id);
      const prob = LM.problemOf(st, asks);
      const rooms = LM.rooms(it, st), met = rooms.filter((x) => x.st === 'met').length;
      const ch = since ? since.items.get(it.id) : null;
      const stateWord = st.dropped ? 'Set aside' : LM.STATUS_WORD[st.s];
      const val = p.tv ? p.tv.text : st.done ? 'done' : st.dropped ? '' : st.s === 'todo' ? 'planned' : `${Math.round(st.h * 100)} %`;
      const downs = tier === 'xl' || tier === 'l' ? ds.items.filter((o) => o.dep.includes(it.id)).length : 0;
      const html = `<div class="th"><span class="g f-${kind[0]} sm">${Iw(kind[1])}</span><span class="stw st-${st.dropped ? 'dropped' : st.s}">${stateWord}</span><b class="val">${esc(val)}</b>${prob ? `<span class="pb f-${PROBLEM[prob][1]}" title="${prob === 'ask' ? esc(asks[0].n) : prob}">${Iw(PROBLEM[prob][0])}</span>` : ch ? `<span class="pb f-${badgeOf(ch.kind)[1]}">${Iw(badgeOf(ch.kind)[0])}</span>` : ''}</div>
        <div class="tt">${esc(it.n)}</div>
        <div class="tf"><span class="av ${who.agent ? 'ag' : who.cls}" title="${esc(who.name)}">${who.agent ? Iw('bot') : who.initial}</span><span class="tw">${tier === 's' ? '' : esc(who.name.length > 14 ? who.initial : who.name) + ' · '}${LM.rel(st.since, view.t)}</span>${tier === 'xl' || tier === 'l' ? `<span class="tx">${it.children.length ? `<span>${Iw('git-branch')}${it.children.length}</span>` : ''}${it.dep.length || downs ? `<span>${Iw('route')}${it.dep.length}→${downs}</span>` : ''}${it.cost ? `<span>${Iw('flame')}${LM.fmtMoney(st.cost)}</span>` : ''}</span>` : ''}<span class="cr" title="${met} of ${rooms.length} criteria">${segRingHtml(20, rooms.map((x) => x.st), 3.5)}</span></div>`;
      const quiet = nowMode && view.quiet && st.old && !ch && !projSet && !traceSet;
      const col = p.tv ? LM.hueVar(LM.layerHue(layer)) : '';
      const cls = `hex ${tier}${view.sel === it ? ' sel' : ''}${st.dropped ? ' park' : ''}${quiet ? ' quiet' : ''} st-${st.dropped ? 'dropped' : st.s}${asks ? ' asked' : ''}${layer ? ' lay' : ''}`;
      const m = want('T:' + id, cls, html, p.x, p.y, w, h, { bind: (el) => { el.addEventListener('click', (e) => { e.stopPropagation(); LM.select(it); }); el.addEventListener('pointerenter', (e) => { LM.view.hover = it; LM.renderTip({ it }, e.clientX, e.clientY); LM.dirty(); }); el.addEventListener('pointermove', (e) => LM.renderTip({ it }, e.clientX, e.clientY)); el.addEventListener('pointerleave', () => { LM.view.hover = null; LM.renderTip(null); LM.dirty(); }); }, op: p.dim.toFixed(2) });
      if (col) m.el.style.setProperty('--lc', col); else m.el.style.removeProperty('--lc');
      m.el.style.setProperty('--fill', p.fill.toFixed(2));
      m.el.style.padding = `${(h * (tier === 's' ? 0.19 : 0.17)).toFixed(0)}px ${(w * 0.1).toFixed(0)}px ${(h * 0.16).toFixed(0)}px`;
    }
  }
  for (const [key, m] of LM.overlays) if (!alive.has(key)) { m.el.remove(); LM.overlays.delete(key); }
};
LM.syncMarkers = () => {};

/** Hit test on the canvas (what the DOM did not catch): a plaque, a landmark, else the district, else the land. */
LM.hit = function hit(sx, sy) {
  const vis = LM.vis; if (!vis) return null;
  for (const S of (LM.squares || new Map()).values()) if (S.r && Math.abs(S.x - sx) <= S.r * 1.4 && sy >= S.y - S.r * 3.8 && sy <= S.y) return { plaque: S };
  for (const m of LM.lmPos || []) if (Math.hypot(m.sx - sx, m.sy - m.size * 0.45 - sy) <= m.size * 0.55) return m.v;
  const [wx, wy] = LM.toWorld(sx, sy);
  const [q, r] = LM.xyHex(wx, wy);
  for (const D of vis.districts.values()) if (D.cells.has(q + ',' + r)) return { district: D };
  for (const L of vis.lands.values()) if (L.cells.has(q + ',' + r)) return { land: L };
  return null;
};
