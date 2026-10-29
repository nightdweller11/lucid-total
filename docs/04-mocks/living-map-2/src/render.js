/* The living map, second pass: the isometric renderer (docs/16 §16, docs/17 LM-I/LM-X).
 * Canvas 2D. The ground is a hexagonal plot field seen from the south at an isometric tilt (y squashed to ISO); lands
 * are glass plates, districts tints on them; every task is a prism on its plot whose HEIGHT is its progress and whose
 * TOP FACE carries the task: colour = state, glyph = kind, title, and the active layer's value; a laid layer greys the
 * city and raises a translucent slab of its own colour on every tile (its height = the value) with a legend beside it.
 * Problems are icons that float above tiles (blocked, stale, waiting, asked); data is colour and height. */
LM.HUES = ['sky', 'violet', 'warm', 'lime', 'rules', 'gold', 'slate', 'ai', 'heat', 'sharp', 'drift'];
LM.ISO = 0.55;
LM.cam = { x: 0, y: 0, k: 8 };
LM.view = { lens: 'dept', overlays: new Set(), t: 0, playing: false, speed: 1, trace: null, sel: null, hover: null, hc: false, reduce: false, since: 0, sinceOn: false, panel: true, time: false, proj: null, quiet: true, mode: 'now' };
LM.lensAnim = null;
LM.flight = null;

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
  // the state palette of a tile's top face (the key the legend shows)
  const base = light ? [235, 241, 252] : mix(T.sea, T.paper, 0.22);
  T.state = {
    todo: light ? [214, 222, 236] : mix(T.sea, T.paper, 0.1),
    doing: light ? [120, 170, 255] : mix(T.acc, T.paper, 0.1),
    review: light ? [70, 190, 175] : T.ai,
    blocked: light ? [235, 90, 105] : T.coral,
    done: light ? [70, 185, 110] : mix(T.good, T.paper, 0.12),
    dropped: light ? [190, 210, 150] : T.park,
    base,
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

// ---- screen transform (isometric: world y squashed; z in plot radii rises on screen) ----
LM.toScreen = (x, y, z = 0) => [(x - LM.cam.x) * LM.cam.k + LM.W / 2, (y - LM.cam.y) * LM.cam.k * LM.ISO + LM.H / 2 - z * LM.cam.k];
LM.toWorld = (sx, sy) => [(sx - LM.W / 2) / LM.cam.k + LM.cam.x, (sy - LM.H / 2) / (LM.cam.k * LM.ISO) + LM.cam.y];
LM.lodOf = (k) => (k < 9 ? 0 : k < 22 ? 1 : k < 52 ? 2 : 3);

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
const hexPath = (ctx, sx, sy, k, r = 0.86, dy = 0) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const [cx, cy] = C6[i]; i ? ctx.lineTo(sx + cx * r * k, sy + cy * r * k * LM.ISO - dy) : ctx.moveTo(sx + cx * r * k, sy + cy * r * k * LM.ISO - dy); } ctx.closePath(); };
const rrect = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
LM.rrect = rrect; LM.hexPath = hexPath;
/** A prism on a plot: two visible side faces (edges 0→1 right, 1→2 left) and the top face at height Hpx. */
const prism = (ctx, sx, sy, k, r, Hpx, top, alpha, T, edge, edgeW, dash) => {
  const P = C6.map(([cx, cy]) => [sx + cx * r * k, sy + cy * r * k * LM.ISO]);
  if (Hpx > 0.6) {
    const side = (a, b, col) => { ctx.beginPath(); ctx.moveTo(P[a][0], P[a][1]); ctx.lineTo(P[b][0], P[b][1]); ctx.lineTo(P[b][0], P[b][1] - Hpx); ctx.lineTo(P[a][0], P[a][1] - Hpx); ctx.closePath(); ctx.fillStyle = rgba(col, alpha); ctx.fill(); };
    side(1, 2, mix(top, T.ink0, T.light ? 0.36 : 0.5));
    side(0, 1, mix(top, T.ink0, T.light ? 0.2 : 0.3));
    if (edge) { ctx.beginPath(); ctx.moveTo(P[2][0], P[2][1]); ctx.lineTo(P[2][0], P[2][1] - Hpx); ctx.moveTo(P[1][0], P[1][1]); ctx.lineTo(P[1][0], P[1][1] - Hpx); ctx.moveTo(P[0][0], P[0][1]); ctx.lineTo(P[0][0], P[0][1] - Hpx); ctx.lineWidth = Math.max(0.6, edgeW * 0.6); ctx.strokeStyle = edge; ctx.stroke(); }
  }
  hexPath(ctx, sx, sy, k, r, Hpx);
  ctx.fillStyle = rgba(top, alpha); ctx.fill();
  if (edge) { ctx.lineWidth = edgeW; ctx.strokeStyle = edge; ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]); }
};
LM.prism = prism;
/** A translucent slab of a layer's colour standing on a tile's top face. */
const slab = (ctx, sx, sy0, k, r, Spx, col, T) => {
  const P = C6.map(([cx, cy]) => [sx + cx * r * k, sy0 + cy * r * k * LM.ISO]);
  const side = (a, b, al) => { ctx.beginPath(); ctx.moveTo(P[a][0], P[a][1]); ctx.lineTo(P[b][0], P[b][1]); ctx.lineTo(P[b][0], P[b][1] - Spx); ctx.lineTo(P[a][0], P[a][1] - Spx); ctx.closePath(); ctx.fillStyle = rgba(col, al); ctx.fill(); };
  side(1, 2, 0.34); side(0, 1, 0.26);
  hexPath(ctx, sx, sy0, k, r, Spx); ctx.fillStyle = rgba(mix(col, T.paper, 0.25), 0.55); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = rgba(mix(col, T.paper, 0.5), 0.8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(P[2][0], P[2][1]); ctx.lineTo(P[2][0], P[2][1] - Spx); ctx.moveTo(P[1][0], P[1][1]); ctx.lineTo(P[1][0], P[1][1] - Spx); ctx.moveTo(P[0][0], P[0][1]); ctx.lineTo(P[0][0], P[0][1] - Spx); ctx.lineWidth = 0.8; ctx.strokeStyle = rgba(mix(col, T.paper, 0.4), 0.45); ctx.stroke();
};

// ---- icons, landmarks, facades on the canvas ----
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
const facadeImgs = new Map();
LM.facadeImage = function facadeImage(key) {
  const k = LM.FACADES[key] ? key : 'doc';
  let im = facadeImgs.get(k);
  if (!im) { im = new Image(); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(LM.FACADES[k].replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120" ')); im.onload = () => LM.dirty(); facadeImgs.set(k, im); }
  return im.complete && im.naturalWidth ? im : null;
};
const ring = (ctx, x, y, r, pct, w, trk, val) => {
  ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.strokeStyle = trk; ctx.stroke();
  if (pct > 0.005) { ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, pct)); ctx.strokeStyle = val; ctx.stroke(); }
};
const segRing = (ctx, x, y, r, segs, w, T) => {
  const n = segs.length, gap = 0.08;
  ctx.lineWidth = w; ctx.lineCap = 'butt';
  segs.forEach((s, i) => { const a0 = -Math.PI / 2 + (i / n) * Math.PI * 2 + gap, a1 = -Math.PI / 2 + ((i + 1) / n) * Math.PI * 2 - gap; ctx.beginPath(); ctx.arc(x, y, r, a0, Math.max(a0 + 0.02, a1)); ctx.strokeStyle = s === 'met' ? rgba(T.good, 1) : s === 'partly' ? rgba(T.amber, 1) : T.ink(0.25); ctx.stroke(); });
};
const disc = (ctx, x, y, r, hue, T, alpha = 1) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = rgba(mix(hue, T.light ? T.paper : T.sea, 0.7), 0.96 * alpha); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = rgba(hue, 0.55 * alpha); ctx.stroke(); };
/** A floating problem pill: an icon in a disc of its hue, above the tile. */
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
LM.drawBadge = (ctx, kind, x, y, r, T) => { const [bi, bh] = badgeOf(kind); const col = T.hues[bh] || T.acc; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = rgba(col, 1); ctx.fill(); LM.icon(ctx, bi, x, y, r * 1.15, T.light ? rgba(T.ink0, 1) : rgba(T.black, 1), 2.4); };
const PROBLEM = { ask: ['message-circle-question', 'rules'], blocked: ['construction', 'block'], stale: ['hourglass', 'hold'], review: ['eye', 'ai'] };
LM.PROBLEM = PROBLEM;

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

/** The value a layer gives a TILE: { v: 0..1 for the slab height and colour, text, col }. Null when the tile has none. */
LM.tileValue = function tileValue(o, v, stats, T, ds, t) {
  const it = v.it, st = v.st;
  switch (o) {
    case 'progress': { const p = st.done ? 1 : st.dropped ? 0 : st.h; return { v: p, text: st.done ? '' : `${Math.round(p * 100)} %`, col: mix(T.acc, T.good, p) }; }
    case 'cost': return st.cost > 0 ? { v: Math.min(1, st.cost / stats.maxTile), text: LM.fmtMoney(st.cost), col: T.heat } : null;
    case 'revenue': return null;
    case 'problems': { const n = (st.blocked ? 1 : 0) + (st.stale ? 1 : 0) + (st.waiting ? 1 : 0) + (LM.asksOf(ds, it, t).length ? 1 : 0); return n ? { v: Math.min(1, n / 2), text: st.blocked ? 'blocked' : st.stale ? 'still' : st.waiting ? 'waiting' : 'asked', col: st.blocked ? T.coral : T.amber } : null; }
    case 'people': return it.agent ? { v: 1, text: 'agent', col: T.ai } : { v: 0.5, text: LM.who(it).initial, col: T.acc };
    case 'recency': { const age = t - st.since; const f = Math.max(0, 1 - age / (ds.win.old * 1.5)); return { v: f, text: LM.rel(st.since, t), col: T.lime }; }
    case 'growth': { const age = t - v.t; const f = Math.max(0, 1 - age / (stats.maxAge * 1.3)); return { v: f, text: LM.fmtShort(v.t), col: T.lime }; }
    case 'size': return { v: it.s / 5, text: `size ${it.s}`, col: T.violet };
  }
  return null;
};
/** The number a layer floats over a place. */
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
    case 'size': return S.built ? { v: S.size / S.built / 5, text: `${S.size} points` } : null;
  }
  return null;
};
LM.layerColor = (o, T) => ({ progress: T.good, cost: T.heat, revenue: T.gold, problems: T.coral, people: T.ai, recency: T.lime, growth: T.lime, deps: T.acc, size: T.violet })[o] || T.acc;

// ---- the frame ----
LM.draw = function draw(now) {
  const ctx = LM.ctx, T = LM.theme, ds = LM.ds, view = LM.view;
  const W = LM.W, H = LM.H, k = LM.cam.k;
  ctx.clearRect(0, 0, W, H);
  const world = LM.worlds[view.lens];
  const vis = (LM.vis = LM.visible(world, view.t));
  const O = view.overlays;
  const layer = [...O].find((o) => o !== 'deps') || null;
  const stats = (LM.stats = overlayStats(ds, vis));
  const lod = LM.lodOf(k);
  LM.lod = lod;
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
  for (const S of [...vis.lands.values(), ...vis.districts.values()]) S.asks = 0;
  for (const a of asksAt) { const p = LM.askPlace(ds, a, view.lens, view.t); const L = p.g && vis.lands.get(p.g), D = p.d && vis.districts.get(p.d); if (L) L.asks++; if (D) D.asks++; }

  let lerpPos = null;
  if (LM.lensAnim) {
    const f = Math.min(1, (now - LM.lensAnim.t0) / 900), e = 1 - Math.pow(1 - f, 3), old = LM.lensAnim.from;
    lerpPos = (v) => { const cells = v.it && v.it.cells[old]; if (!cells) return [v.x, v.y]; let c = cells[0]; for (const cc of cells) if (cc.t <= view.t) c = cc; const [ox, oy] = LM.hexXY(c.q, c.r); return [ox + (v.x - ox) * e, oy + (v.y - oy) * e]; };
    LM.lensAnim.f = e;
    if (f >= 1) LM.lensAnim = null;
  }
  const hullAlpha = LM.lensAnim ? LM.lensAnim.f : 1;
  const onScreen = (sx, sy, m = 0) => sx > -m && sx < W + m && sy > -m && sy < H + m;

  // ---- lands: glass plates with a thickness, a hue wash; districts as tints ----
  const plate = Math.max(3, Math.min(10, k * 0.35));
  const landsSorted = [...vis.lands.values()].sort((a, b) => a.cy - b.cy);
  for (const L of landsSorted) {
    const hue = hueOf(L.key);
    const rings = LM.hullOf(world, L);
    const prog = L.size ? L.doneSize / L.size : 0;
    const dim = traceLands && !traceLands.has(L.key) ? 0.35 : 1;
    const [cx, cy] = LM.toScreen(L.cx, L.cy);
    const R = Math.max(30, Math.sqrt(L.n) * k * 1.7);
    ctx.save(); ctx.globalAlpha = hullAlpha * dim;
    // the plate's side
    ctx.beginPath(); for (const r of rings) pathRing(ctx, r); ctx.translate(0, plate); ctx.fillStyle = rgba(mix(mix(T.sea, hue, 0.15), T.ink0, 0.5), 0.95); ctx.fill('evenodd'); ctx.translate(0, -plate);
    ctx.beginPath(); for (const r of rings) pathRing(ctx, r);
    ctx.fillStyle = layer ? (T.light ? 'rgba(255,255,255,.7)' : rgba(mix(T.sea, T.paper, 0.14), 0.95)) : T.light ? 'rgba(255,255,255,.62)' : rgba(mix(T.sea, T.paper, 0.1), 0.95); ctx.fill('evenodd');
    ctx.lineWidth = 1.2; ctx.strokeStyle = T.light ? 'rgba(15,31,58,.3)' : T.ink(T.hc ? 0.5 : 0.28); ctx.stroke();
    if (!T.hc && !layer) {
      ctx.save(); ctx.beginPath(); for (const r of rings) pathRing(ctx, r); ctx.clip('evenodd');
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, rgba(hue, 0.22)); g.addColorStop(0.65, rgba(hue, 0.07)); g.addColorStop(1, rgba(hue, 0));
      ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      if (prog > 0) { const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.9); g2.addColorStop(0, rgba(T.paper, prog * (T.light ? 0.3 : 0.08))); g2.addColorStop(1, rgba(T.paper, 0)); ctx.fillStyle = g2; ctx.fillRect(cx - R, cy - R, R * 2, R * 2); }
      ctx.restore();
    }
    if (layer && lod === 0) {
      const pv = LM.placeValue(L, layer, stats, true);
      if (pv && pv.v > 0) { ctx.save(); ctx.beginPath(); for (const r of rings) pathRing(ctx, r); ctx.clip('evenodd'); ctx.fillStyle = rgba(LM.layerColor(layer, T), 0.1 + Math.pow(pv.v, 0.7) * 0.55); ctx.fillRect(0, 0, W, H); ctx.restore(); }
    }
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
  if (k >= 2.5) {
    for (const D of vis.districts.values()) {
      if (D.n < 1) continue;
      const hue = hueOf(D.land);
      const rings = LM.hullOf(world, D);
      const dim = traceLands && !traceLands.has(D.land) ? 0.3 : 1;
      const prog = D.size ? D.doneSize / D.size : 0;
      ctx.save(); ctx.globalAlpha = hullAlpha * dim;
      ctx.beginPath(); for (const r of rings) pathRing(ctx, r);
      let fill = mix(hue, T.paper, 0.3), alpha = lod >= 1 ? 0.06 + prog * (T.light ? 0.12 : 0.05) : 0;
      if (layer && lod >= 1) { const pv = LM.placeValue(D, layer, stats, false); fill = LM.layerColor(layer, T); alpha = pv ? 0.05 + Math.pow(pv.v, 0.7) * 0.3 : 0; }
      if (alpha > 0.005) { ctx.fillStyle = rgba(fill, Math.min(0.7, alpha)); ctx.fill('evenodd'); }
      ctx.lineWidth = lod >= 2 ? 1.1 : 1; ctx.strokeStyle = T.light ? `rgba(15,31,58,${lod >= 1 ? 0.16 : 0.08})` : T.ink(T.hc ? 0.35 : lod >= 1 ? 0.18 : 0.1); ctx.stroke();
      ctx.restore();
    }
  }

  // ---- dependencies (roads on the ground) and the project's thread ----
  const posOf = new Map();
  for (const v of vis.items) if (v.it) posOf.set(v.it.id, v);
  LM.posOf = posOf;
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
          ctx.lineWidth = focus ? 3 : Math.max(1.8, k * 0.07); ctx.lineCap = 'round';
          ctx.strokeStyle = hard ? rgba(T.coral, 0.9) : clogged ? rgba(T.amber, 0.85) : flowing ? rgba(T.acc, 0.9) : u.st.done ? rgba(T.good, 0.55) : T.ink(0.6);
          ctx.setLineDash(dry ? [3, 6] : []); ctx.stroke(); ctx.setLineDash([]);
          if (flowing && !view.reduce) for (let i = 0; i < 3; i++) { const f = (pulse + i / 3) % 1, mt = 1 - f; const px = mt * mt * mt * ax + 3 * mt * mt * f * c1[0] + 3 * mt * f * f * c2[0] + f * f * f * bx; const py = mt * mt * mt * ay + 3 * mt * mt * f * c1[1] + 3 * mt * f * f * c2[1] + f * f * f * by; ctx.beginPath(); ctx.arc(px, py, Math.max(1.6, k * 0.07), 0, Math.PI * 2); ctx.fillStyle = rgba(T.acc, 0.95); ctx.fill(); }
          if (clogged) barriers.push([ax + dx * 0.18 + nx * bow * 0.42, ay + dy * 0.18 + ny * bow * 0.42, hard]);
        }
      }
  };
  const depsOn = O.has('deps') || (view.trace && view.trace.kind === 'item') || !!projSet;
  const barriers = [];
  if (depsOn) {
    if (lod === 0 && !projSet) {
      const pairs = new Map();
      for (const v of vis.items) if (v.it) for (const dep of v.it.dep) { const u = posOf.get(dep); if (!u || u.g === v.g) continue; const kk = u.g < v.g ? u.g + '>' + v.g : v.g + '>' + u.g; const p = pairs.get(kk) || { a: vis.lands.get(u.g), b: vis.lands.get(v.g), n: 0, flow: 0, clog: 0 }; p.n++; if (u.st.done && !v.st.done) p.flow++; if (u.st.blocked || (u.st.stale && !u.st.done)) p.clog++; pairs.set(kk, p); }
      for (const p of pairs.values()) {
        if (!p.a || !p.b) continue;
        const [ax, ay] = LM.toScreen(p.a.cx, p.a.cy), [bx, by] = LM.toScreen(p.b.cx, p.b.cy);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.lineWidth = Math.min(8, 1.2 + Math.sqrt(p.n) * 0.9); ctx.strokeStyle = p.clog ? rgba(T.coral, 0.6) : p.flow ? rgba(T.acc, 0.55) : T.ink(0.3);
        ctx.setLineDash(p.flow || p.clog ? [] : [5, 7]); ctx.stroke(); ctx.setLineDash([]);
      }
    } else if (!(O.has('deps') && !layer)) drawRoads();
  }
  if (projSet) {
    // the project's thread: its tasks in birth order, a thin gold line on the ground
    const pts = proj.items.map((id) => posOf.get(id)).filter(Boolean).sort((a, b) => a.it.b - b.it.b);
    ctx.beginPath(); pts.forEach((v, i) => { const [x, y] = LM.toScreen(v.x, v.y); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.lineWidth = Math.max(1.2, k * 0.05); ctx.strokeStyle = rgba(T.gold, 0.45); ctx.setLineDash([k * 0.3, k * 0.3]); ctx.stroke(); ctx.setLineDash([]);
  }
  if (view.trace && view.trace.kind === 'decision') {
    for (const v of vis.items) {
      if (!v.mon || view.trace.dec !== v.mon) continue;
      const [ax, ay] = LM.toScreen(v.x, v.y);
      for (const id of v.mon.lin) { const u = posOf.get(id); if (!u) continue; const [bx, by] = LM.toScreen(...(lerpPos ? lerpPos(u) : [u.x, u.y])); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineWidth = 1.6; ctx.strokeStyle = rgba(T.gold, 0.75); ctx.stroke(); }
    }
  }

  // ---- tiles, flags, landmarks: back to front ----
  const order = vis.items.slice().sort((a, b) => a.y - b.y || a.x - b.x);
  const dt = Math.min(0.1, (now - (LM.lastFrame || now)) / 1000);
  const chase = view.reduce ? 1 : 1 - Math.exp(-dt / 0.22);
  const ri = 0.86;
  const labelCands = [], problems = [], flags = [];
  const flashWin = LM.flashUntil || 0;
  const squares = new Map(); // district square -> decisions decided there (plaque with a count)
  let shown = 0;
  const bob = view.reduce ? 0 : Math.sin(now / 420) * Math.max(1, k * 0.04);
  const hMax = (it) => 0.3 + 0.16 * it.s;
  for (const v of order) {
    const [x0, y0] = lerpPos && v.it ? lerpPos(v) : [v.x, v.y];
    const [sx, sy] = LM.toScreen(x0, y0);
    if (sx < -k * 3 || sx > W + k * 3 || sy < -k * 4 || sy > H + k * 3) continue;
    const dimTrace = traceSet ? (v.it && traceSet.has(v.it.id)) || (v.mon && view.trace.dec === v.mon) || (traceLands && !v.it && traceLands.has(v.g)) ? 1 : 0.18 : 1;
    const dimProj = projSet ? (v.it && projSet.has(v.it.id) ? 1 : 0.14) : 1;
    const hue = hueOf(v.g);
    if (v.square) {
      if (lod === 0) continue;
      hexPath(ctx, sx, sy, k, ri * 0.98); ctx.fillStyle = rgba(mix(hue, T.paper, 0.4), 0.14 * dimTrace); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = rgba(T.gold, 0.3 * dimTrace); ctx.stroke();
      continue;
    }
    if (v.park) {
      if (lod === 0) continue;
      hexPath(ctx, sx, sy, k, ri * 0.92); ctx.fillStyle = rgba(T.lime, 0.12 * dimTrace); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = rgba(T.lime, 0.25 * dimTrace); ctx.stroke();
      if (lod >= 2) LM.icon(ctx, 'trees', sx, sy, Math.max(8, k * 0.45), rgba(T.lime, 0.6 * dimTrace), 1.8);
      continue;
    }
    if (v.mon) {
      // decided: a plaque per square with a count; a flag only for the owner's recent decisions and for traces
      const focus = (view.trace && view.trace.dec === v.mon) || (view.sel && view.sel.mon === v.mon) || (view.hover && view.hover.mon === v.mon);
      const recent = v.mon.who === 'owner' && view.t - v.mon.b < ds.win.review;
      const sq = v.q + ',' + v.r;
      if (!squares.has(sq)) squares.set(sq, { x: sx, y: sy, n: 0, g: v.g, d: v.d, list: [], recent: 0 });
      const S = squares.get(sq); S.n++; S.list.push(v); if (recent) S.recent++;
      if (focus || (recent && lod >= 1)) flags.push({ x: sx, y: sy, v, dim: dimTrace, kind: 'decision', focus, big: v.mon.who === 'owner' });
      continue;
    }
    if (v.lm) { drawMilestone(ctx, sx, sy, k, v, dimTrace, T); labelCands.push({ x: sx, y: sy - Math.max(26, Math.min(96, k * 2.2)) - 8, text: v.lm.n, pri: 50, gold: true }); continue; }
    const it = v.it, st = v.st;
    it.vh += (st.h - it.vh) * chase; it.vlit += (st.lit - it.vlit) * chase;
    if (Math.abs(st.h - it.vh) < 0.002) it.vh = st.h;
    const ch = since ? since.items.get(it.id) : null;
    const quiet = nowMode && view.quiet && st.old && !ch && !projSet && !traceSet;
    const dim = dimTrace * dimProj * (since ? (ch ? 1 : 0.3) : 1) * (quiet ? 0.55 : 1) * (st.ghost ? 0.5 : 1);
    const asks = askByItem.get(it.id);
    // the problem of this tile, if any (one icon: the worst)
    const prob = asks ? 'ask' : st.blocked ? 'blocked' : lod >= 2 || O.has('problems') ? (st.stale ? 'stale' : st.waiting ? 'review' : null) : null;
    if (lod === 0) {
      if (k >= 2.4 && !st.dropped) { const r = Math.max(1.3, k * 0.5); const col = st.done ? T.state.done : st.blocked ? T.state.blocked : st.s === 'todo' ? T.state.todo : st.s === 'review' ? T.state.review : T.state.doing; ctx.fillStyle = rgba(layer ? grey(col, 0.7) : col, (st.s === 'todo' ? 0.5 : 0.9) * dim); ctx.fillRect(sx - r / 2, sy - r / 2 * LM.ISO, r, r * LM.ISO); }
      if (prob && (nowMode || O.has('problems'))) problems.push({ x: sx, y: sy, kind: prob, d: v.d, g: v.g, it, dim });
      continue;
    }
    shown++;
    const kind = LM.kindOf(it); const kHue = T.hues[kind[0]] || T.hues.sky;
    const under = O.has('deps') && !layer;
    const Hpx = (st.dropped ? 0 : hMax(it) * Math.max(0.04, it.vh)) * k * (lod >= 1 ? 1 : 0.6) * (under ? 0.22 : 1);
    let top = st.done ? T.state.done : st.blocked ? T.state.blocked : st.s === 'review' ? T.state.review : st.s === 'todo' ? T.state.todo : mix(T.state.todo, T.state.doing, 0.35 + 0.65 * it.vh), alpha = st.s === 'todo' ? 0.7 : 0.96;
    if (st.dropped) { top = T.state.dropped; alpha = 0.5; }
    let edge = T.light ? 'rgba(15,31,58,.35)' : T.ink(0.3), edgeW = 1, dash = st.s === 'todo' || st.ghost ? [3, 3] : null;
    if (st.blocked) { edge = rgba(T.light ? [190, 50, 70] : T.coral, 0.9); edgeW = 1.5; }
    if (quiet) top = grey(top, 0.6);
    const tv = layer && !st.dropped ? LM.tileValue(layer, v, stats, T, ds, view.t) : null;
    if (layer) top = grey(top, 0.75); if (under) { top = grey(top, 0.55); alpha *= 0.8; }
    if (ch) { const [, bh] = badgeOf(ch.kind); top = mix(top, T.hues[bh] || T.acc, 0.25); }
    ctx.save(); ctx.globalAlpha = dim;
    if (!T.hc && lod >= 2 && !st.dropped) { ctx.beginPath(); ctx.ellipse(sx + k * 0.1, sy + k * 0.12, k * 0.85, k * 0.42, 0, 0, Math.PI * 2); ctx.fillStyle = rgba(T.shadow, T.light ? 0.12 : 0.28); ctx.fill(); }
    prism(ctx, sx, sy, k, ri, Hpx, top, alpha, T, edge, edgeW, dash);
    if (!T.hc && !st.dropped && !layer && lod >= 1) { hexPath(ctx, sx, sy, k, ri, Hpx); ctx.save(); ctx.clip(); const g = ctx.createLinearGradient(sx - k, sy - Hpx - k * 0.5, sx + k, sy - Hpx + k * 0.5); g.addColorStop(0, rgba(T.paper, T.light ? 0.35 : 0.16)); g.addColorStop(1, rgba(T.paper, 0)); ctx.fillStyle = g; ctx.fillRect(sx - k, sy - Hpx - k, k * 2, k * 2); ctx.restore(); }
    if (flashWin > now && v.t > (LM.flashT0 || 0)) { hexPath(ctx, sx, sy, k, ri, Hpx); ctx.lineWidth = 2.5; ctx.strokeStyle = rgba(T.lime, 0.9 * ((flashWin - now) / 1400)); ctx.stroke(); }
    const cy0 = sy - Hpx; // the centre of the top face
    // the layer's slab
    let Spx = 0;
    if (tv && tv.v > 0.02 && lod >= 1) { Spx = tv.v * k * 1.4; slab(ctx, sx, cy0, k, ri * 0.78, Spx, tv.col, T); }
    const faceY = cy0 - Spx;
    // the top face carries the task
    if (lod === 1) {
      if (k >= 11 && !st.dropped) LM.icon(ctx, kind[1], sx, faceY, Math.min(14, k * 0.6), layer ? T.ink(0.75) : st.s === 'todo' ? T.ink(0.6) : rgba(T.light ? T.ink0 : T.paper, 0.9), 2.1);
      if (ch) { const [, bh] = badgeOf(ch.kind); ctx.beginPath(); ctx.arc(sx + k * 0.55, faceY + k * 0.2, Math.max(2.2, k * 0.14), 0, Math.PI * 2); ctx.fillStyle = rgba(T.hues[bh] || T.acc, 1); ctx.fill(); }
    } else if (lod === 2) {
      const r = Math.max(5, k * 0.17);
      const fw = ri * k * 1.7;
      if (!st.dropped) {
        // row 1: the kind glyph (left) and the value (right)
        disc(ctx, sx - fw / 2 + r * 1.15, faceY - r * 0.6, r, layer ? T.slate : kHue, T);
        LM.icon(ctx, kind[1], sx - fw / 2 + r * 1.15, faceY - r * 0.6, r * 1.2, rgba(layer ? T.slate : kHue, 1), 2.2);
        const vt = tv ? tv.text : st.done ? '' : st.s === 'todo' ? '' : `${Math.round(it.vh * 100)} %`;
        if (vt && k >= 26) { ctx.font = `600 ${Math.max(9, Math.min(13, k * 0.27))}px Figtree, system-ui, sans-serif`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillStyle = tv ? rgba(mix(tv.col, T.light ? T.ink0 : T.paper, 0.55), 1) : (T.light ? rgba(T.ink0, 0.85) : T.ink(0.9)); ctx.fillText(vt, sx + fw / 2 - r * 0.4, faceY - r * 0.6); }
        else if (st.done && k >= 26 && !(tv && tv.text)) LM.icon(ctx, 'check', sx + fw / 2 - r * 1.1, faceY - r * 0.6, r * 1.3, T.light ? rgba(T.ink0, 0.85) : rgba(T.paper, 0.95), 2.6);
        // row 2: the title, one line
        if (k >= 28) { ctx.font = `500 ${Math.max(9.5, Math.min(13, k * 0.26))}px Figtree, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = T.light ? rgba(T.ink0, st.s === 'todo' ? 0.6 : 0.92) : T.ink(st.s === 'todo' ? 0.65 : 0.95); const maxW = fw * 0.92; let t = it.short; while (ctx.measureText(t).width > maxW && t.length > 4) t = t.slice(0, -2).trim() + '…'; if (t.length >= 6 || t === it.short) ctx.fillText(t, sx, faceY + r * 1.1); }
      }
      if (ch) LM.drawBadge(ctx, ch.kind, sx + fw / 2 - r * 0.3, faceY + r * 1.6, Math.max(6, k * 0.15), T);
    } else {
      // street depth: the top face has the glyph, the title (two lines), who, since and the value; the front face carries the facade
      const fw = ri * k * 1.7, r = Math.max(7, k * 0.14);
      if (!st.dropped) {
        if (Hpx > k * 0.45 && !layer) {
          // the facade as a billboard on the right front face (edge 0→1)
          const P0 = [sx + C6[0][0] * ri * k, sy + C6[0][1] * ri * k * LM.ISO], P1 = [sx + C6[1][0] * ri * k, sy + C6[1][1] * ri * k * LM.ISO];
          const im = LM.facadeImage(it.f || 'doc');
          if (im) {
            const w = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]), hgt = Hpx * 0.86, pad = w * 0.08;
            ctx.save(); ctx.translate(P1[0], P1[1] - Hpx * 0.93); ctx.transform(1, (P0[1] - P1[1]) / (P0[0] - P1[0]), 0, 1, 0, 0);
            ctx.globalAlpha *= st.s === 'todo' ? 0.4 : 0.9;
            ctx.beginPath(); ctx.rect(pad, 0, (P0[0] - P1[0]) - pad * 2, hgt); ctx.clip();
            ctx.drawImage(im, pad, 0, (P0[0] - P1[0]) - pad * 2, hgt);
            if (st.s === 'doing') { ctx.fillStyle = rgba(T.ink0, 0.5 * (1 - it.vh)); ctx.fillRect(pad, 0, (P0[0] - P1[0]) - pad * 2, hgt * (1 - it.vh)); }
            ctx.restore();
          }
        }
        disc(ctx, sx - fw / 2 + r * 1.2, faceY - r * 1.3, r, layer ? T.slate : kHue, T);
        LM.icon(ctx, kind[1], sx - fw / 2 + r * 1.2, faceY - r * 1.3, r * 1.2, rgba(layer ? T.slate : kHue, 1), 2.2);
        // criteria ring, right
        const rr = r * 0.95;
        ctx.beginPath(); ctx.arc(sx + fw / 2 - rr * 1.2, faceY - r * 1.3, rr + 2, 0, Math.PI * 2); ctx.fillStyle = rgba(T.light ? T.paper : mix(T.sea, T.paper, 0.1), 0.9); ctx.fill();
        segRing(ctx, sx + fw / 2 - rr * 1.2, faceY - r * 1.3, rr - 1, LM.rooms(it, st).map((x) => x.st), Math.max(2, rr * 0.35), T);
        // the value
        const vt = tv ? (tv.text || 'done') : st.done ? 'done' : st.s === 'todo' ? 'planned' : st.blocked ? 'blocked' : `${Math.round(it.vh * 100)} %`;
        ctx.font = `600 ${Math.max(10, Math.min(14, k * 0.2))}px Figtree, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = tv ? rgba(mix(tv.col, T.light ? T.ink0 : T.paper, 0.55), 1) : st.blocked ? rgba(T.light ? [190, 50, 70] : T.paper, 1) : (T.light ? rgba(T.ink0, 0.8) : T.ink(0.85)); ctx.fillText(vt, sx, faceY - r * 1.3);
        // title, two lines
        const fs = Math.max(10.5, Math.min(14, k * 0.19));
        ctx.font = `500 ${fs}px Figtree, system-ui, sans-serif`; ctx.fillStyle = T.light ? rgba(T.ink0, st.s === 'todo' ? 0.65 : 0.95) : T.ink(st.s === 'todo' ? 0.7 : 0.97);
        const maxW = fw * 0.94; const words = it.short.split(' '); const lines = []; let cur = '';
        for (const wd of words) { const t = cur ? cur + ' ' + wd : wd; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = wd; } else cur = t; if (lines.length === 2) break; } if (lines.length < 2 && cur) lines.push(cur);
        lines.slice(0, 2).forEach((l, i) => { while (ctx.measureText(l).width > maxW && l.length > 3) l = l.slice(0, -2) + '…'; ctx.fillText(l, sx, faceY + r * 0.2 + i * (fs + 1)); });
        // who and since
        if (k >= 70) { const who = LM.who(it); const yy = faceY + r * 0.2 + lines.length * (fs + 1) + r * 0.5; const ar = Math.max(6, fs * 0.5); const text = `${who.name.length > 12 ? who.initial : who.name} · ${LM.rel(st.since, view.t)}`; ctx.font = `500 ${fs - 2}px Figtree, system-ui, sans-serif`; const tw = ctx.measureText(text).width; const x1 = sx - (ar * 2 + 5 + tw) / 2; ctx.beginPath(); ctx.arc(x1 + ar, yy, ar, 0, Math.PI * 2); ctx.fillStyle = who.agent ? rgba(T.ai, 0.6) : rgba(T.acc, 0.5); ctx.fill(); if (who.agent) LM.icon(ctx, 'bot', x1 + ar, yy, ar * 1.2, T.light ? rgba(T.ink0, 1) : rgba(T.fg, 1), 2); else { ctx.font = `600 ${ar}px Figtree, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = T.light ? rgba(T.ink0, 1) : T.ink(1); ctx.fillText(who.initial, x1 + ar, yy + 0.5); } ctx.font = `500 ${fs - 2}px Figtree, system-ui, sans-serif`; ctx.textAlign = 'left'; ctx.fillStyle = T.light ? rgba(T.ink0, 0.7) : T.ink(0.75); ctx.fillText(text, x1 + ar * 2 + 5, yy); }
      } else { LM.icon(ctx, 'trees', sx, faceY, k * 0.4, rgba(T.lime, 0.7), 1.8); }
      if (ch) LM.drawBadge(ctx, ch.kind, sx - fw / 2 + r * 0.6, faceY + r * 1.9, Math.max(7, k * 0.12), T);
    }
    if (st.working && st.s === 'doing' && !view.reduce && !st.done && lod >= 2 && !layer) { const b = 0.5 + 0.5 * Math.sin(now / 700 + it.i); ctx.beginPath(); ctx.arc(sx + ri * k * 0.8, faceY + k * 0.36, Math.max(2, k * 0.06), 0, Math.PI * 2); ctx.fillStyle = rgba(T.good, 0.3 + 0.6 * b); ctx.fill(); }
    ctx.restore();
    if (view.sel === it || view.hover === it) { hexPath(ctx, sx, sy, k, ri + 0.14, Hpx + Spx); ctx.lineWidth = 2.2; ctx.strokeStyle = view.sel === it ? rgba(T.acc, 1) : T.ink(0.75); ctx.stroke(); }
    v.top = cy0 - Spx; v.sx = sx; v.sy = sy; v.H = Hpx + Spx;
    if (prob && (nowMode || O.has('problems')) && !st.dropped) problems.push({ x: sx, y: cy0 - Spx, kind: prob, d: v.d, g: v.g, it, dim: dimTrace * dimProj, asks });
    if (asks && lod >= 2) flags.push({ x: sx, y: cy0 - Spx, v, dim: dimTrace * dimProj, kind: 'ask', asks, big: asks.some((a) => a.to === 'owner') });
  }
  if (depsOn && O.has('deps') && !layer && lod >= 1) drawRoads();
  LM.lastFrame = now; LM.shown = shown;
  for (const [bx, by, hard] of barriers) pillIcon(ctx, bx, by, Math.max(6, k * 0.16), 'construction', hard ? T.coral : T.amber, T, 0.95);
  // decided decisions: a plaque with a count on the square (never a forest of flags)
  if (lod >= 1) for (const S of squares.values()) {
    const r = Math.max(4, Math.min(11, k * 0.2)); const dimS = traceLands && !traceLands.has(S.g) ? 0.3 : 1;
    ctx.save(); ctx.globalAlpha = dimS;
    ctx.lineWidth = Math.max(1, k * 0.04); ctx.strokeStyle = T.ink(0.6); ctx.beginPath(); ctx.moveTo(S.x, S.y); ctx.lineTo(S.x, S.y - r * 2.2); ctx.stroke();
    rrect(ctx, S.x - r * 1.3, S.y - r * 3.6, r * 2.6, r * 1.6, r * 0.4); ctx.fillStyle = rgba(T.light ? [77, 95, 214] : T.rules, 0.9); ctx.fill();
    if (r >= 6) { ctx.font = `600 ${Math.max(8, r * 1.05)}px Figtree, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(String(S.n), S.x, S.y - r * 2.8); }
    ctx.restore();
    S.r = r;
  }
  LM.squares = squares;
  // flags: open asks on their tiles (indigo, a question mark), the owner's recent decisions on the square (gold edge)
  for (const f of flags) drawFlag(ctx, f, k, lod, T, now);
  // problems float above their tiles; at the sky they gather per district
  LM.problemPills = [];
  if (problems.length) {
    const r = Math.max(6, Math.min(13, k * 0.19));
    if (lod === 0 || problems.length > 70) {
      const byD = new Map();
      for (const p of problems) { const key = lod === 0 ? p.g : p.d; const c = byD.get(key) || { n: 0, kinds: {}, g: p.g, d: p.d }; c.n++; c.kinds[p.kind] = (c.kinds[p.kind] || 0) + 1; byD.set(key, c); }
      for (const [key, c] of byD) {
        const S = lod === 0 ? vis.lands.get(key) : vis.districts.get(key); if (!S) continue;
        const [cx, cy] = LM.toScreen(S.cx, S.cy);
        const worst = ['ask', 'blocked', 'stale', 'review'].find((kk) => c.kinds[kk]);
        const [ic, hue] = PROBLEM[worst];
        const rr = Math.max(8, Math.min(14, r + 2));
        const yy = cy - (lod === 0 ? 30 + Math.sqrt(S.n) * k * 0.6 : k * 1.6);
        pillIcon(ctx, cx, yy, rr, ic, T.hues[hue], T, 1, bob * 0.5);
        if (c.n > 1) { ctx.font = `600 ${rr * 0.95}px Figtree, system-ui, sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; const tx = String(c.n); const tw = ctx.measureText(tx).width; rrect(ctx, cx + rr * 0.75, yy - rr * 0.75 - bob * 0.5, tw + 8, rr * 1.5, rr * 0.5); ctx.fillStyle = T.light ? rgba(T.paper, 0.95) : rgba(T.ink0, 0.85); ctx.fill(); ctx.fillStyle = T.light ? rgba(T.ink0, 1) : rgba(T.paper, 1); ctx.fillText(tx, cx + rr * 0.75 + 4, yy - bob * 0.5); }
        LM.problemPills.push({ x: cx, y: yy, r: rr, S, kind: lod === 0 ? 'land' : 'district', n: c.n });
      }
    } else {
      for (const p of problems) { const [ic, hue] = PROBLEM[p.kind]; const lift = r * 2.2 + (lod >= 2 ? k * 0.1 : 0); pillIcon(ctx, p.x, p.y - lift, r, ic, T.hues[hue], T, p.dim, p.kind === 'ask' || p.kind === 'blocked' ? bob : 0); LM.problemPills.push({ x: p.x, y: p.y - lift, r, it: p.it, kind: p.kind }); }
    }
  }

  // ---- heat: where things moved (the since layer) ----
  if (since && !T.hc) {
    for (const D of vis.districts.values()) {
      const n = (since.districts.get(D.key) || { n: 0 }).n;
      if (!n) continue;
      const [cx, cy] = LM.toScreen(D.cx, D.cy); const R = Math.max(18, Math.sqrt(n) * k * (lod === 0 ? 1.4 : 1.1) + k * 0.6);
      if (!onScreen(cx, cy, R)) continue;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, rgba(T.heat, 0.26)); g.addColorStop(0.55, rgba(T.heat, 0.08)); g.addColorStop(1, rgba(T.heat, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, R, R * LM.ISO * 1.3, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  // ---- labels on the canvas (flags, landmarks), within the attention budget ----
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const placed = [];
  const fits = (x, y, w, h) => !placed.some((p) => Math.abs(p.x - x) < (p.w + w) / 2 + 6 && Math.abs(p.y - y) < (p.h + h) / 2 + 4);
  const put = (x, y, text, size, color, weight = 500) => {
    ctx.font = `${weight} ${size}px Figtree, system-ui, sans-serif`;
    const w = ctx.measureText(text).width;
    if (!fits(x, y, w, size) || x + w / 2 < 0 || x - w / 2 > W || y < 0 || y > H) return false;
    placed.push({ x, y, w, h: size });
    ctx.lineWidth = Math.max(3, size * 0.3); ctx.strokeStyle = rgba(T.black, T.light ? 0.9 : 0.7); ctx.lineJoin = 'round'; ctx.strokeText(text, x, y);
    ctx.fillStyle = color; ctx.fillText(text, x, y);
    return true;
  };
  for (const f of flags) if (f.focus || (lod >= 2 && (f.kind === 'ask' || f.big))) labelCands.push({ x: f.x, y: f.y - k * (f.big ? 1.5 : 1.1) - 8, text: f.kind === 'ask' ? f.asks[0].short : f.v.mon.n.replace(/\*\*/g, ''), pri: f.focus ? 100 : f.kind === 'ask' ? 60 : 20, mon: true });
  labelCands.sort((a, b) => b.pri - a.pri);
  let n = 0, mons = 0;
  for (const c of labelCands) {
    if (n >= 10) break;
    if (c.mon && c.pri < 100 && mons >= 4) continue; if (c.mon && c.pri < 100) mons++;
    const text = c.text.length > 44 ? c.text.slice(0, 42) + '…' : c.text;
    if (put(c.x, c.y, text, 13, c.gold ? rgba(T.gold, 1) : c.mon ? rgba(mix(T.rules, T.paper, 0.5), 1) : T.ink(0.95), c.pri >= 90 ? 600 : 500)) n++;
  }
  LM.syncMarkers(vis, lod, stats, since, layer, nowMode);
  if (LM.lensAnim || view.playing || LM.flight || flashWin > now || (problems.length && !view.reduce)) LM.needsFrame = true;
};

// ---- a flag: an open ask (Rules indigo with a question mark) or the owner's recent decision (gold-edged) ----
function drawFlag(ctx, f, k, lod, T, now) {
  const big = f.big;
  const h = Math.max(10, k * (big ? 1.3 : 0.95)), bw = Math.max(6, k * (big ? 0.7 : 0.48)), bh = Math.max(4, k * (big ? 0.34 : 0.26));
  const wave = LM.view.reduce ? 0 : Math.sin(now / 500 + f.x * 0.01) * bh * 0.08;
  ctx.save(); ctx.globalAlpha = f.dim;
  ctx.lineWidth = Math.max(1.2, k * 0.05); ctx.strokeStyle = T.ink(0.75); ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x, f.y - h); ctx.stroke();
  const y = f.y - h + 1;
  ctx.beginPath(); ctx.moveTo(f.x, y); ctx.lineTo(f.x + bw, y + wave); ctx.lineTo(f.x + bw - bh * 0.45, y + bh / 2 + wave); ctx.lineTo(f.x + bw, y + bh + wave); ctx.lineTo(f.x, y + bh); ctx.closePath();
  ctx.fillStyle = rgba(T.light ? [77, 95, 214] : T.rules, 0.96); ctx.fill();
  if (f.kind === 'decision') { ctx.lineWidth = 1.5; ctx.strokeStyle = rgba(T.gold, 0.95); ctx.stroke(); }
  if (bh >= 9) LM.icon(ctx, f.kind === 'ask' ? 'message-circle-question' : 'signpost', f.x + bh * 0.6, y + bh / 2 + wave / 2, bh * 0.7, '#fff', 2.4);
  ctx.restore();
}
LM.drawFlag = drawFlag;
function drawMilestone(ctx, sx, sy, k, v, dim, T) {
  const size = Math.max(26, Math.min(96, k * 2.2));
  ctx.save(); ctx.globalAlpha = dim;
  if (!T.hc) { const g = ctx.createRadialGradient(sx, sy - size * 0.45, 0, sx, sy - size * 0.45, size * 0.8); g.addColorStop(0, rgba(T.gold, 0.3)); g.addColorStop(1, rgba(T.gold, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy - size * 0.45, size * 0.8, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.arc(sx, sy - size * 0.45, size * 0.52, 0, Math.PI * 2); ctx.fillStyle = rgba(T.g2, T.light ? 0.85 : 0.5); ctx.fill(); ctx.lineWidth = Math.max(2, size * 0.05); ctx.strokeStyle = rgba(T.gold, 0.9); ctx.stroke();
  LM.landmark(ctx, 'gate', sx, sy - size * 0.45, size * 0.7, rgba(T.hc ? T.fg : T.gold, 0.95), 2.2);
  ctx.restore();
}
LM.drawMilestone = drawMilestone;

// ---- place markers in the DOM: landmark in its ring, the name beneath; the layer's number or the attention as a chip ----
LM.markers = new Map();
LM.syncMarkers = function syncMarkers(vis, lod, stats, since, layer, nowMode) {
  const root = LM.placesEl; if (!root) return;
  const ds = LM.ds, view = LM.view, k = LM.cam.k;
  const alive = new Set();
  const traceLands = view.trace ? view.trace.lans : null;
  const show = (key, kind, S, info, sx, sy, size, opts) => {
    alive.add(key);
    let m = LM.markers.get(key);
    const lmk = LM.lmKey(info.lm || 'keep');
    if (!m) {
      m = { el: document.createElement('div'), size: '', name: '', pct: -1, chip: '', dim: -1, hue: '', lmk: '' };
      m.el.className = 'place';
      m.el.innerHTML = `<span class="md"><svg class="ring" viewBox="0 0 100 100"><circle class="trk" cx="50" cy="50" r="46" pathLength="100"/><circle class="val" cx="50" cy="50" r="46" pathLength="100" stroke-dasharray="0 100" stroke-dashoffset="25"/></svg><span class="free"><svg class="lm" viewBox="0 0 48 48"><path d=""/></svg></span></span><span class="nm"></span><span class="dc" hidden></span>`;
      m.el.dataset.key = key; m.el.dataset.kind = kind;
      m.el.addEventListener('click', (e) => { e.stopPropagation(); if (kind === 'land') LM.flyToLand(S.key); else LM.flyToDistrict(S.key); });
      root.appendChild(m.el); LM.markers.set(key, m);
    }
    if (m.lmk !== lmk) { m.el.querySelector('.lm path').setAttribute('d', LM.LANDMARKS[lmk].d); m.lmk = lmk; }
    if (m.size !== size + kind) { m.el.className = `place ${size} ${kind}`; m.size = size + kind; }
    if (m.hue !== info.hue) { m.el.style.setProperty('--h', info.hue === 'ai' ? 'var(--ai)' : `var(--f-${info.hue})`); m.hue = info.hue; }
    const name = opts.name; if (m.name !== name) { m.el.querySelector('.nm').textContent = name; m.name = name; }
    const title = `${info.name}${info.sub ? ': ' + info.sub : ''} · ${S.built || 0} tasks, ${Math.round(opts.pct * 100)} % done`; if (m.title !== title) { m.el.title = title; m.title = title; }
    const pct = Math.round(opts.pct * 100); if (m.pct !== pct) { m.el.querySelector('.val').setAttribute('stroke-dasharray', `${pct} 100`); m.pct = pct; }
    const chip = opts.chip || ''; if (m.chip !== chip) { const dc = m.el.querySelector('.dc'); dc.innerHTML = chip; dc.hidden = !chip; dc.classList.toggle('warn', !!opts.warn); m.chip = chip; }
    const dim = opts.dim; if (m.dim !== dim) { m.el.style.opacity = dim; m.dim = dim; }
    m.el.style.transform = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px)`;
  };
  const attn = (S) => { const parts = []; if (S.asks) parts.push(`${S.asks} to decide`); if (S.blocked) parts.push(`${S.blocked} blocked`); return parts.join(' · '); };
  let chips = 0;
  if (lod <= 1) {
    for (const L of [...vis.lands.values()].sort((a, b) => b.n - a.n)) {
      const info = LM.landInfo(ds, view.lens, L.key);
      const [sx, sy] = LM.toScreen(L.cx, L.cy);
      const wpx = Math.sqrt(L.n) * k * 2.2;
      if (sx < -80 || sx > LM.W + 80 || sy < -80 || sy > LM.H + 80) continue;
      if (wpx < 30) continue;
      const phone = LM.W <= 720; const size = lod === 0 ? (wpx > (phone ? 420 : 300) ? 'l' : wpx > (phone ? 240 : 150) ? 'm' : wpx > (phone ? 120 : 70) ? 's' : 'xs') : 'xs';
      const pct = L.size ? L.doneSize / L.size : 0;
      let chip = '', warn = false;
      if (layer && chips < 12) { const pv = LM.placeValue(L, layer, stats, true); if (pv) { chip = pv.text; chips++; } }
      else if (since && chips < 12) { const c = since.places.get(L.key); if (c) { chip = `${c.n} changed`; chips++; } }
      else if (nowMode && lod === 0 && chips < 12 && (L.asks || L.blocked)) { chip = attn(L); warn = true; chips++; }
      show('L:' + L.key, 'land', L, info, sx, sy - 6, size, { name: info.name, pct, chip, warn, dim: traceLands && !traceLands.has(L.key) ? 0.35 : lod === 1 ? 0.85 : 1 });
    }
  }
  if (lod >= 1 && lod <= 2) {
    let nD = 0;
    for (const D of [...vis.districts.values()].sort((a, b) => b.n - a.n)) {
      const wpx = Math.sqrt(D.n) * k * 2.2;
      if (wpx < (lod === 1 ? 120 : 110) || D.n < 4 || nD >= 10) continue;
      const [sx, sy] = LM.toScreen(D.cx, D.cy);
      if (sx < -80 || sx > LM.W + 80 || sy < -80 || sy > LM.H + 80) continue;
      const landInfo = LM.landInfo(ds, view.lens, D.land);
      const name = LM.shortName(LM.distName(ds, view.lens, D.key));
      nD++;
      const info = { name, sub: '', hue: landInfo.hue, lm: D.key.endsWith(':decisions') ? 'summit' : D.key.endsWith(':landmarks') ? 'gate' : LM.lmKey(landInfo.lm) };
      const pct = D.size ? D.doneSize / D.size : 0;
      let chip = '', warn = false;
      if (layer && chips < 12) { const pv = LM.placeValue(D, layer, stats, false); if (pv) { chip = pv.text; chips++; } }
      else if (since && chips < 12) { const c = since.districts.get(D.key); if (c) { chip = `${c.n} changed`; chips++; } }
      else if (nowMode && lod === 1 && chips < 12 && (D.asks || D.blocked)) { chip = attn(D); warn = true; chips++; }
      show('D:' + D.key, 'district', D, info, sx, sy - (lod === 2 ? k * 0.9 : 0), lod === 1 ? 'xs' : 's', { name, pct, chip, warn, dim: traceLands && !traceLands.has(D.land) ? 0.35 : lod === 2 ? 0.92 : 1 });
    }
  }
  for (const [key, m] of LM.markers) if (!alive.has(key)) { m.el.remove(); LM.markers.delete(key); }
};

/** Hit test: a problem pill, then the tile, flag or landmark under the point, else the district, else the land. */
LM.hit = function hit(sx, sy) {
  const vis = LM.vis; if (!vis) return null;
  const k = LM.cam.k;
  for (const p of LM.problemPills || []) if (Math.hypot(p.x - sx, p.y - sy) <= p.r + 3) return p.it ? { it: p.it, pill: p } : { pill: p, [p.kind]: p.S };
  for (const S of (LM.squares || new Map()).values()) if (S.r && Math.abs(S.x - sx) <= S.r * 1.4 && sy >= S.y - S.r * 3.8 && sy <= S.y) return { plaque: S };
  let best = null, bestY = -Infinity;
  for (const v of vis.items) {
    if (v.park || v.square || v.mon) continue;
    const [x, y] = LM.toScreen(v.x, v.y);
    if (Math.abs(x - sx) > k * 1.2 || sy > y + k * 0.7 || sy < y - k * 4) continue;
    const top = v.it ? (v.H || k * 0.6) + k * 0.5 : k * 2.4;
    const inside = sy <= y + k * 0.5 && sy >= y - top && Math.abs(x - sx) <= k * 0.86;
    if (inside && y > bestY) { best = v; bestY = y; }
  }
  if (best) return best;
  const [wx, wy] = LM.toWorld(sx, sy);
  const [q, r] = LM.xyHex(wx, wy);
  for (const D of vis.districts.values()) if (D.cells.has(q + ',' + r)) return { district: D };
  for (const L of vis.lands.values()) if (L.cells.has(q + ',' + r)) return { land: L };
  return null;
};
