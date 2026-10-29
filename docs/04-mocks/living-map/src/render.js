/* The living map: renderer, on the v0.2 line (docs/04-mocks/README.md "The vocabulary"). Canvas 2D for the terrain:
 * land coasts (plc + shore + hue wash + light), district contours, roads and pipes, tiles with kind glyphs, rings and
 * facades by depth, flags for decisions, landmarks for milestones, weather fronts, heat; DOM for the place markers
 * (landmark in its ring, the name beneath) and the floating data chips of the overlays. Overlays recolour channels;
 * the "since" layer dims what did not change and badges what did. Level of detail by scale k (px per plot radius). */
LM.HUES = ['sky', 'violet', 'warm', 'lime', 'rules', 'gold', 'slate', 'ai', 'heat', 'sharp', 'drift'];
LM.cam = { x: 0, y: 0, k: 8 };
LM.view = { lens: 'dept', overlays: new Set(), t: 0, playing: false, speed: 1, trace: null, sel: null, hover: null, hc: false, reduce: false, since: 0, sinceOn: false, feed: true };
LM.lensAnim = null;
LM.flight = null;

const parseRGB = (s) => { const m = /rgba?\(([^)]+)\)/.exec(s); if (m) { const p = m[1].split(',').map(Number); return [p[0], p[1], p[2]]; } const h = s.trim().replace('#', ''); if (h.length === 3) return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mix = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f].map(Math.round);
LM.mix = mix; LM.rgba = rgba;

LM.readTheme = function readTheme() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n) => cs.getPropertyValue(n).trim();
  const light = document.documentElement.dataset.pt === 'sky';
  const hc = document.documentElement.dataset.hc === 'high';
  const T = (LM.theme = {
    light, hc,
    fg: parseRGB(v('--fg') || '#f2f6ff'), sea: parseRGB(v('--ground-base') || '#102b6b'),
    white: light ? [20, 36, 70] : [255, 255, 255], black: light ? [255, 255, 255] : [4, 10, 28], paper: [255, 255, 255],
    lit: light ? [255, 205, 95] : [255, 226, 160],
    acc: parseRGB(v('--acc') || '#3d8bff'), good: parseRGB(v('--good') || '#47d16c'), amber: parseRGB(v('--hold-h') || '#ffc96b'), coral: parseRGB(v('--block-h') || '#ff7d85'),
    ai: parseRGB(v('--ai') || '#5fe3cf'), heat: parseRGB(v('--f-heat') || '#ff8a3d'), gold: parseRGB(v('--f-gold') || '#ffd23f'), sharp: parseRGB(v('--f-sharp') || '#ff5c7a'),
    rules: parseRGB(v('--f-rules') || '#7a8cff'), lime: parseRGB(v('--f-lime') || '#a3e635'), slate: parseRGB(v('--f-slate') || '#a3b4cc'),
    g2: light ? [255, 255, 255] : [80, 96, 136], shadow: light ? [60, 80, 120] : [2, 8, 30],
    hues: {},
  });
  T.park = mix(T.lime, T.sea, 0.55);
  for (const h of LM.HUES) T.hues[h] = parseRGB(v(h === 'ai' ? '--ai' : `--f-${h}`) || '#8fb4ff');
  T.hues.ai = T.ai; T.hues.good = T.good; T.hues.block = T.coral; T.hues.hold = T.amber; T.hues.acc = T.acc; T.hues.lucid = T.ai;
  T.ink = (a) => rgba(T.fg, a);
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
LM.toScreen = (x, y) => [(x - LM.cam.x) * LM.cam.k + LM.W / 2, (y - LM.cam.y) * LM.cam.k * 0.92 + LM.H / 2];
LM.toWorld = (sx, sy) => [(sx - LM.W / 2) / LM.cam.k + LM.cam.x, (sy - LM.H / 2) / (LM.cam.k * 0.92) + LM.cam.y];

const pathRing = (ctx, ring) => {
  const n = ring.length;
  const P = ring.map(([x, y]) => LM.toScreen(x, y));
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  ctx.moveTo(...mid(P[0], P[1]));
  for (let i = 1; i <= n; i++) { const p = P[i % n], q = P[(i + 1) % n]; const m = mid(p, q); ctx.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
  ctx.closePath();
};
LM.pathRing = pathRing;
const hexPath = (ctx, sx, sy, k, r = 0.86, dy = 0) => { ctx.beginPath(); for (let i = 0; i < 6; i++) { const [cx, cy] = LM.hexCorner(0, 0, i, r); i ? ctx.lineTo(sx + cx * k, sy + cy * k * 0.92 - dy) : ctx.moveTo(sx + cx * k, sy + cy * k * 0.92 - dy); } ctx.closePath(); };
const rrect = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
LM.rrect = rrect; LM.hexPath = hexPath;

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
const ring = (ctx, x, y, r, pct, w, trk, val, cap = true) => {
  ctx.lineWidth = w; ctx.lineCap = cap ? 'round' : 'butt';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.strokeStyle = trk; ctx.stroke();
  if (pct > 0.005) { ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, pct)); ctx.strokeStyle = val; ctx.stroke(); }
};
const segRing = (ctx, x, y, r, segs, w, T) => {
  const n = segs.length, gap = 0.06;
  ctx.lineWidth = w; ctx.lineCap = 'round';
  segs.forEach((s, i) => { const a0 = -Math.PI / 2 + (i / n) * Math.PI * 2 + gap, a1 = -Math.PI / 2 + ((i + 1) / n) * Math.PI * 2 - gap; ctx.beginPath(); ctx.arc(x, y, r, a0, Math.max(a0 + 0.02, a1)); ctx.strokeStyle = s === 'met' ? rgba(T.good, 1) : s === 'partly' ? rgba(T.amber, 1) : T.ink(0.25); ctx.stroke(); });
};
const disc = (ctx, x, y, r, hue, T, alpha = 1) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = rgba(mix(hue, T.sea, 0.72), 0.95 * alpha); ctx.fill(); ctx.lineWidth = 1; ctx.strokeStyle = rgba(hue, 0.5 * alpha); ctx.stroke(); };
const barrier = (ctx, x, y, r, breach, T, alpha = 1) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = breach ? rgba(T.coral, alpha) : rgba(T.g2, 0.95 * alpha); ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = breach ? rgba(T.coral, 0.35 * alpha) : T.ink(0.45 * alpha); ctx.stroke(); LM.icon(ctx, 'construction', x, y, r * 1.15, breach ? '#fff' : rgba(T.fg, alpha), 2); };
const badgeOf = (kind) => ({ new: ['sprout', 'lime'], done: ['circle-check-big', 'good'], blocked: ['construction', 'block'], progressed: ['trending-up', 'acc'], moved: ['move-right', 'ai'], dropped: ['trees', 'lime'], review: ['eye', 'ai'] })[kind] || ['dot', 'slate'];
LM.badgeOf = badgeOf;
LM.drawBadge = (ctx, kind, x, y, r, T) => { const [bi, bh] = badgeOf(kind); const col = T.hues[bh] || T.acc; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = rgba(col, 1); ctx.fill(); LM.icon(ctx, bi, x, y, r * 1.15, T.light ? '#fff' : rgba(T.black, 1), 2.4); };

/** Per-visible-state values the overlays and the chips use. */
const overlayStats = (ds, vis) => {
  let maxCost = 1, maxDCost = 1, maxAge = 1, maxFresh = 1, maxLoad = 1;
  for (const L of vis.lands.values()) { maxCost = Math.max(maxCost, L.cost); if (L.built) maxAge = Math.max(maxAge, L.age / L.built); maxFresh = Math.max(maxFresh, L.fresh); }
  for (const D of vis.districts.values()) { maxDCost = Math.max(maxDCost, D.cost); maxLoad = Math.max(maxLoad, D.working); }
  const rev = new Map();
  if (ds.revenue.length) {
    const byProd = new Map();
    for (const s of ds.revenue) if (s.t <= vis.t) byProd.set(s.prod, (byProd.get(s.prod) || 0) + s.amount);
    const prodTotals = new Map();
    for (const v of vis.items) if (v.it) prodTotals.set(v.it.g.prod, (prodTotals.get(v.it.g.prod) || 0) + 1);
    for (const L of vis.lands.values()) { let r = 0; const counts = new Map(); for (const v of L.items) if (v.it) counts.set(v.it.g.prod, (counts.get(v.it.g.prod) || 0) + 1); for (const [p, n] of counts) r += (byProd.get(p) || 0) * (n / (prodTotals.get(p) || 1)); rev.set(L.key, r); }
  }
  let maxRev = 1; for (const r of rev.values()) maxRev = Math.max(maxRev, r);
  return { maxCost, maxDCost, rev, maxRev, maxAge, maxFresh, maxLoad };
};
LM.overlayStats = overlayStats;

/** The number an overlay floats over a place (null when it has none). */
LM.placeValue = function placeValue(S, o, stats, isLand) {
  switch (o) {
    case 'progress': return S.built ? { v: S.doneSize / Math.max(1, S.size), text: `${Math.round((S.doneSize / Math.max(1, S.size)) * 100)} %` } : null;
    case 'cost': return S.cost > 0 ? { v: S.cost / (isLand ? stats.maxCost : stats.maxDCost), text: LM.fmtMoney(S.cost) } : null;
    case 'revenue': { const r = stats.rev.get(S.key) || 0; return r > 0 ? { v: r / stats.maxRev, text: LM.fmtMoney(r) } : null; }
    case 'issues': return S.blocked || S.stale ? { v: Math.min(1, (S.blocked * 2.5 + S.stale) / Math.max(2, (S.built || S.n) * 0.3)), text: `${S.blocked ? S.blocked + ' blocked' : ''}${S.blocked && S.stale ? ' · ' : ''}${S.stale ? S.stale + ' still' : ''}` } : null;
    case 'load': return S.working ? { v: S.working / stats.maxLoad, text: `${S.working} rising` } : null;
    case 'fresh': return S.fresh ? { v: S.fresh / stats.maxFresh, text: `${S.fresh} moved` } : null;
    case 'ai': return S.built ? { v: S.agent / S.built, text: `${Math.round((S.agent / S.built) * 100)} % agents` } : null;
    case 'terrain': return S.built ? { v: S.remaining / Math.max(1, S.size), text: `${Math.round(S.remaining)} left` } : null;
    case 'growth': return S.built ? { v: 1 - Math.min(1, S.age / S.built / stats.maxAge), text: `${S.built} plots` } : null;
    case 'pipes': { let n = 0; for (const v of S.items) if (v.it) n += v.it.dep.length; return n ? { v: 0, text: `${n} pipes` } : null; }
    case 'power': { let n = 0; for (const v of S.items) if (v.mon) n++; return n ? { v: 0, text: `${n} decisions` } : null; }
  }
  return null;
};

// ---- the frame ----
LM.draw = function draw(now) {
  const ctx = LM.ctx, T = LM.theme, ds = LM.ds, view = LM.view;
  const W = LM.W, H = LM.H, k = LM.cam.k;
  ctx.clearRect(0, 0, W, H);
  const world = LM.worlds[view.lens];
  const vis = (LM.vis = LM.visible(world, view.t));
  const O = view.overlays;
  const stats = (LM.stats = overlayStats(ds, vis));
  const lod = k < 7 ? 0 : k < 18 ? 1 : k < 44 ? 2 : 3;
  LM.lod = lod;
  const traceSet = view.trace ? view.trace.set : null;
  const traceLands = view.trace ? view.trace.lands : null;
  const hueOf = (g) => T.hues[LM.landInfo(ds, view.lens, g).hue] || T.hues.slate;
  const pulse = (now / 900) % 1;
  const since = view.sinceOn ? (LM.sinceCache && LM.sinceCache.t0 === view.since && LM.sinceCache.t1 === view.t && LM.sinceCache.lens === view.lens ? LM.sinceCache : (LM.sinceCache = Object.assign(LM.changes(ds, view.lens, view.since, view.t), { lens: view.lens }))) : null;
  LM.since = since;
  const lk = T.light ? 0.5 : 0.11;

  let lerpPos = null;
  if (LM.lensAnim) {
    const f = Math.min(1, (now - LM.lensAnim.t0) / 900), e = 1 - Math.pow(1 - f, 3), old = LM.lensAnim.from;
    lerpPos = (v) => { const cells = v.it && v.it.cells[old]; if (!cells) return [v.x, v.y]; let c = cells[0]; for (const cc of cells) if (cc.t <= view.t) c = cc; const [ox, oy] = LM.hexXY(c.q, c.r); return [ox + (v.x - ox) * e, oy + (v.y - oy) * e]; };
    LM.lensAnim.f = e;
    if (f >= 1) LM.lensAnim = null;
  }
  const hullAlpha = LM.lensAnim ? LM.lensAnim.f : 1;
  const onScreen = (sx, sy, m = 0) => sx > -m && sx < W + m && sy > -m && sy < H + m;

  // ---- lands: shore, coast, hue wash, light ----
  const landsSorted = [...vis.lands.values()].sort((a, b) => a.cy - b.cy);
  for (const L of landsSorted) {
    const hue = hueOf(L.key);
    const rings = LM.hullOf(world, L);
    const prog = L.size ? L.doneSize / L.size : 0;
    const dim = traceLands && !traceLands.has(L.key) ? 0.35 : 1;
    const [cx, cy] = LM.toScreen(L.cx, L.cy);
    const R = Math.max(30, Math.sqrt(L.n) * k * 1.7);
    const lift = O.has('terrain') ? Math.min(44, (L.remaining / Math.max(1, L.size)) * 30 * Math.max(0.8, k / 10) + 4) : 0;
    ctx.save(); ctx.globalAlpha = hullAlpha * dim;
    if (lift) { ctx.beginPath(); for (const r of rings) pathRing(ctx, r); ctx.translate(0, lift); ctx.fillStyle = rgba(mix(mix(T.sea, hue, 0.2), T.black, 0.55), 0.95); ctx.fill('evenodd'); ctx.translate(0, -lift); }
    ctx.translate(0, -lift);
    if (!T.hc) { ctx.beginPath(); for (const r of rings) pathRing(ctx, r); ctx.lineWidth = Math.max(6, k * 1.4); ctx.strokeStyle = rgba(T.light ? [120, 170, 255] : T.hues.sky, T.light ? 0.2 : 0.16); ctx.lineJoin = 'round'; ctx.stroke(); }
    ctx.beginPath(); for (const r of rings) pathRing(ctx, r);
    ctx.fillStyle = T.light ? 'rgba(255,255,255,.55)' : T.ink(T.hc ? 0.1 : 0.065); ctx.fill('evenodd');
    ctx.lineWidth = 1.2; ctx.strokeStyle = T.light ? 'rgba(15,31,58,.25)' : T.ink(T.hc ? 0.5 : 0.22); ctx.stroke();
    ctx.save(); ctx.beginPath(); for (const r of rings) pathRing(ctx, r); ctx.clip('evenodd');
    let washC = hue, washA = 0.2, lightA = prog * lk;
    if (O.has('progress')) { lightA = prog * lk * 2.4; washA = 0.12; }
    if (O.has('cost')) { washC = T.heat; washA = 0.08 + Math.pow(L.cost / stats.maxCost, 0.6) * 0.55; lightA = 0; }
    if (O.has('revenue')) { const r = (stats.rev.get(L.key) || 0) / stats.maxRev; const net = (stats.rev.get(L.key) || 0) - L.cost; washC = r > 0 ? T.gold : net < 0 && L.cost ? [140, 90, 40] : hue; washA = r > 0 ? 0.1 + Math.pow(r, 0.6) * 0.5 : net < 0 && L.cost ? 0.3 : 0.1; lightA = 0; }
    if (O.has('growth')) { const a = L.built ? 1 - Math.min(1, L.age / L.built / stats.maxAge) : 0; washC = T.lime; washA = 0.06 + a * 0.4; lightA = 0; }
    if (O.has('ai')) { washC = T.ai; washA = 0.05 + (L.built ? L.agent / L.built : 0) * 0.35; }
    if (!T.hc) {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, rgba(washC, washA)); g.addColorStop(0.6, rgba(washC, washA * 0.3)); g.addColorStop(1, rgba(washC, 0));
      ctx.fillStyle = g; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      if (lightA > 0) { const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.95); g2.addColorStop(0, rgba(T.paper, Math.min(0.6, lightA))); g2.addColorStop(1, rgba(T.paper, 0)); ctx.fillStyle = g2; ctx.fillRect(cx - R, cy - R, R * 2, R * 2); }
    } else if (washA > 0.2) { ctx.fillStyle = rgba(washC, (washA - 0.2) * 0.6); ctx.fillRect(0, 0, W, H); }
    ctx.restore();
    ctx.restore();
    L.lift = lift;
  }
  for (const L of vis.lands.values()) {
    if (!L.parent) continue;
    const P = vis.lands.get(L.parent); if (!P) continue;
    const [ax, ay] = LM.toScreen(P.cx, P.cy), [bx, by] = LM.toScreen(L.cx, L.cy);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
    ctx.lineWidth = Math.max(2, k * 0.5); ctx.strokeStyle = T.ink(0.14 * hullAlpha); ctx.stroke();
    ctx.lineWidth = 1.4; ctx.setLineDash([k * 0.5, k * 0.5]); ctx.strokeStyle = T.ink(0.45 * hullAlpha); ctx.stroke(); ctx.setLineDash([]);
  }
  // ---- districts: faint inner contours; at land depth and below, their own tone ----
  if (k >= 2.5) {
    for (const D of vis.districts.values()) {
      if (D.n < 1) continue;
      const hue = hueOf(D.land);
      const rings = LM.hullOf(world, D);
      const L = vis.lands.get(D.land);
      const dim = traceLands && !traceLands.has(D.land) ? 0.3 : 1;
      const prog = D.size ? D.doneSize / D.size : 0;
      let fill = null, alpha = 0;
      if (lod >= 1) { fill = mix(hue, T.paper, 0.3); alpha = 0.05 + prog * lk * 0.6; }
      if (O.has('progress') && lod >= 1) { fill = T.paper; alpha = prog * lk * 1.6; }
      if (O.has('cost') && lod >= 1) { fill = T.heat; alpha = Math.pow(D.cost / stats.maxDCost, 0.6) * 0.45; }
      if (O.has('load') && lod >= 1) { fill = T.coral; alpha = (D.working / stats.maxLoad) * 0.3; }
      if (O.has('growth') && lod >= 1) { fill = T.lime; alpha = (D.built ? 1 - Math.min(1, D.age / D.built / stats.maxAge) : 0) * 0.35; }
      if (O.has('power') && D.items.some((v) => v.it && !v.it.forecast && v.st.s !== 'done' && v.st.s !== 'dropped' && /owner/i.test(v.it.n))) { fill = T.black; alpha = 0.4; }
      const baseLift = (L && L.lift) || 0;
      const lift = baseLift + (O.has('terrain') ? Math.min(26, (D.remaining / Math.max(1, D.size)) * 20 * Math.max(0.8, k / 10)) : 0);
      ctx.save(); ctx.globalAlpha = hullAlpha * dim;
      if (lift > baseLift + 0.5) { ctx.beginPath(); for (const r of rings) pathRing(ctx, r); ctx.translate(0, lift - baseLift); ctx.fillStyle = rgba(mix(hue, T.black, 0.6), 0.85); ctx.fill('evenodd'); ctx.translate(0, -(lift - baseLift)); }
      ctx.translate(0, -lift);
      ctx.beginPath(); for (const r of rings) pathRing(ctx, r);
      if (fill && alpha > 0.005) { ctx.fillStyle = rgba(fill, Math.min(0.8, alpha)); ctx.fill('evenodd'); }
      ctx.lineWidth = lod >= 2 ? 1.1 : 1; ctx.strokeStyle = T.light ? `rgba(15,31,58,${lod >= 1 ? 0.14 : 0.08})` : T.ink(T.hc ? 0.35 : lod >= 1 ? 0.16 : 0.1); ctx.stroke();
      ctx.restore();
      D.lift = lift;
    }
  }

  // ---- pipes (dependencies) and roads ----
  const posOf = new Map();
  for (const v of vis.items) if (v.it) posOf.set(v.it.id, v);
  LM.posOf = posOf;
  const pipesOn = O.has('pipes') || (view.trace && view.trace.kind === 'item');
  const barriers = [];
  if (pipesOn) {
    if (lod === 0) {
      const pairs = new Map();
      for (const v of vis.items) if (v.it) for (const dep of v.it.dep) { const u = posOf.get(dep); if (!u || u.g === v.g) continue; const kk = u.g < v.g ? u.g + '>' + v.g : v.g + '>' + u.g; const p = pairs.get(kk) || { a: vis.lands.get(u.g), b: vis.lands.get(v.g), n: 0, flow: 0, clog: 0 }; p.n++; if (u.st.done && !v.st.done) p.flow++; if (u.st.blocked || (u.st.stale && !u.st.done)) p.clog++; pairs.set(kk, p); }
      for (const p of pairs.values()) {
        if (!p.a || !p.b) continue;
        const [ax, ay] = LM.toScreen(p.a.cx, p.a.cy), [bx, by] = LM.toScreen(p.b.cx, p.b.cy);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.lineWidth = Math.min(8, 1.2 + Math.sqrt(p.n) * 0.9); ctx.strokeStyle = p.clog ? rgba(T.coral, 0.6) : p.flow ? rgba(T.ai, 0.55) : T.ink(0.3);
        ctx.setLineDash(p.flow || p.clog ? [] : [5, 7]); ctx.stroke(); ctx.setLineDash([]);
      }
    } else {
      for (const v of vis.items) {
        if (!v.it) continue;
        for (const dep of v.it.dep) {
          const u = posOf.get(dep); if (!u) continue;
          if (traceSet && !(traceSet.has(v.it.id) || traceSet.has(u.it.id))) continue;
          const Du = vis.districts.get(u.d), Dv = vis.districts.get(v.d);
          const [ax, ay0] = LM.toScreen(...(lerpPos ? lerpPos(u) : [u.x, u.y])), [bx, by0] = LM.toScreen(...(lerpPos ? lerpPos(v) : [v.x, v.y]));
          const ay = ay0 - ((Du && Du.lift) || 0), by = by0 - ((Dv && Dv.lift) || 0);
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
          ctx.lineWidth = focus ? 3 : Math.max(1.4, k * 0.05); ctx.lineCap = 'round';
          ctx.strokeStyle = hard ? rgba(T.coral, 0.85) : clogged ? rgba(T.amber, 0.8) : flowing ? rgba(T.ai, 0.8) : u.st.done ? T.ink(0.25) : T.ink(0.45);
          ctx.setLineDash(dry ? [3, 6] : []); ctx.stroke(); ctx.setLineDash([]);
          if (flowing && !view.reduce) for (let i = 0; i < 3; i++) { const f = (pulse + i / 3) % 1, mt = 1 - f; const px = mt * mt * mt * ax + 3 * mt * mt * f * c1[0] + 3 * mt * f * f * c2[0] + f * f * f * bx; const py = mt * mt * mt * ay + 3 * mt * mt * f * c1[1] + 3 * mt * f * f * c2[1] + f * f * f * by; ctx.beginPath(); ctx.arc(px, py, Math.max(1.6, k * 0.07), 0, Math.PI * 2); ctx.fillStyle = rgba(T.ai, 0.95); ctx.fill(); }
          if (clogged) barriers.push([ax + dx * 0.18 + nx * bow * 0.42, ay + dy * 0.18 + ny * bow * 0.42, hard]);
        }
      }
    }
  }
  if (O.has('power') || (view.trace && view.trace.kind === 'decision')) {
    for (const v of vis.items) {
      if (!v.mon) continue;
      if (view.trace && view.trace.kind === 'decision' && view.trace.dec !== v.mon) continue;
      const [ax, ay] = LM.toScreen(v.x, v.y);
      for (const id of v.mon.lin) { const u = posOf.get(id); if (!u) continue; const [bx, by] = LM.toScreen(...(lerpPos ? lerpPos(u) : [u.x, u.y])); ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineWidth = view.trace ? 1.6 : 1; ctx.strokeStyle = rgba(T.gold, view.trace ? 0.75 : 0.35); ctx.stroke(); }
    }
  }

  // ---- tiles, flags, landmarks: back to front ----
  const order = vis.items.slice().sort((a, b) => a.y - b.y || a.x - b.x);
  const dt = Math.min(0.1, (now - (LM.lastFrame || now)) / 1000);
  const chase = view.reduce ? 1 : 1 - Math.exp(-dt / 0.22);
  const ri = 0.86;
  const labelCands = [];
  const flashWin = LM.flashUntil || 0;
  let shown = 0;
  for (const v of order) {
    const [x0, y0] = lerpPos && v.it ? lerpPos(v) : [v.x, v.y];
    const [sx, syRaw] = LM.toScreen(x0, y0);
    const D = vis.districts.get(v.d);
    const sy = syRaw - (D && D.lift ? D.lift : 0);
    if (sx < -k * 3 || sx > W + k * 3 || sy < -k * 4 || sy > H + k * 3) continue;
    const dimTrace = traceSet ? (v.it && traceSet.has(v.it.id)) || (v.mon && view.trace.dec === v.mon) || (traceLands && !v.it && traceLands.has(v.g)) ? 1 : 0.18 : 1;
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
    if (v.mon) { if (lod === 0 && !(view.trace && view.trace.dec === v.mon)) continue; drawFlag(ctx, sx, sy, k, v, dimTrace, lod, T); const focus = (view.trace && view.trace.dec === v.mon) || (view.sel && view.sel.mon === v.mon) || (view.hover && view.hover.mon === v.mon); if (focus || (lod >= 3 && v.mon.who === 'owner')) labelCands.push({ x: sx, y: sy - k * (v.mon.who === 'owner' ? 1.5 : 1.1) - 6, text: v.mon.n, pri: focus ? 100 : 2, mon: true }); continue; }
    if (v.lm) { drawMilestone(ctx, sx, sy, k, v, dimTrace, T); labelCands.push({ x: sx, y: sy - Math.max(26, Math.min(96, k * 2.2)) - 8, text: v.lm.n, pri: 50, gold: true }); continue; }
    const it = v.it, st = v.st;
    it.vh += (st.h - it.vh) * chase; it.vlit += (st.lit - it.vlit) * chase;
    if (Math.abs(st.h - it.vh) < 0.002) it.vh = st.h;
    const ch = since ? since.items.get(it.id) : null;
    const dim = dimTrace * (since ? (ch ? 1 : 0.28) : 1);
    if (lod === 0) {
      if (k >= 2.4 && !st.dropped && st.s !== 'todo') { const r = Math.max(1.3, k * 0.36); ctx.fillStyle = st.done ? rgba(T.lit, 0.85 * dim) : st.blocked ? rgba(T.coral, 0.95 * dim) : rgba(mix(hue, T.paper, 0.5), 0.6 * dim); ctx.fillRect(sx - r / 2, sy - r / 2, r, r); }
      continue;
    }
    shown++;
    const kind = LM.kindOf(it); const kHue = T.hues[kind[0]] || T.hues.sky;
    const remaining = st.dropped || st.done ? 0 : 1 - it.vh;
    const Hpx = (0.08 + remaining * (0.18 + 0.05 * it.s)) * k * (lod >= 2 ? 1 : 0.5);
    const litF = it.vlit;
    let top = mix(mix(hue, T.sea, 0.62), T.paper, 0.1 + 0.35 * litF), edge = T.ink(0.22), edgeW = 1, alpha = 0.92;
    if (st.done) { top = mix(mix(hue, T.paper, 0.42), T.lit, 0.25); edge = rgba(T.good, 0.8); edgeW = 1.5; }
    if (st.s === 'todo') { top = mix(hue, T.sea, 0.8); alpha = 0.45; edge = T.ink(0.5); }
    if (st.blocked) { top = mix(hue, T.black, 0.5); edge = rgba(T.coral, 0.9); edgeW = 1.5; }
    if (st.s === 'review') { edge = rgba(T.ai, 0.9); edgeW = 1.5; }
    if (st.dropped) { top = T.park; alpha = 0.5; }
    if (O.has('ai') && it.agent) top = mix(top, T.ai, 0.35);
    if (O.has('cost')) top = mix(top, T.heat, Math.min(1, st.cost / (stats.maxDCost / 6 + 1)) * 0.65);
    if (O.has('load') && D) top = mix(top, T.coral, (D.working / stats.maxLoad) * 0.5);
    if (O.has('fresh')) top = st.fresh ? mix(top, T.lit, 0.45) : st.stale ? mix(top, T.sea, 0.6) : top;
    if (O.has('growth')) top = mix(top, T.lime, Math.max(0, 1 - (view.t - v.t) / (stats.maxAge * 1.2)) * 0.6);
    if (ch) { const [, bh] = badgeOf(ch.kind); top = mix(top, T.hues[bh] || T.acc, 0.18); }
    ctx.save(); ctx.globalAlpha = dim * (st.ghost ? 0.5 : 1);
    if (Hpx > 0.8 && !st.dropped) { ctx.beginPath(); for (const i of [5, 0, 1, 2, 3]) { const [cx, cy] = LM.hexCorner(0, 0, i, ri); ctx.lineTo(sx + cx * k, sy + cy * k * 0.92); } for (const i of [3, 2, 1, 0, 5]) { const [cx, cy] = LM.hexCorner(0, 0, i, ri); ctx.lineTo(sx + cx * k, sy + cy * k * 0.92 - Hpx); } ctx.closePath(); ctx.fillStyle = rgba(mix(top, T.black, 0.5), alpha); ctx.fill(); }
    hexPath(ctx, sx, sy, k, ri, Hpx);
    ctx.fillStyle = rgba(top, alpha); ctx.fill();
    if (!T.hc && !st.dropped) { ctx.save(); ctx.clip(); const g = ctx.createLinearGradient(sx, sy - Hpx - k, sx, sy - Hpx + k * 0.6); g.addColorStop(0, rgba(T.paper, 0.14)); g.addColorStop(1, rgba(T.paper, 0)); ctx.fillStyle = g; ctx.fillRect(sx - k, sy - Hpx - k, k * 2, k * 2); ctx.restore(); }
    ctx.lineWidth = edgeW; ctx.strokeStyle = edge; ctx.setLineDash(st.s === 'todo' || st.ghost ? [3, 3] : []); ctx.stroke(); ctx.setLineDash([]);
    if (flashWin > now && v.t > (LM.flashT0 || 0)) { ctx.lineWidth = 2.5; ctx.strokeStyle = rgba(T.lime, 0.9 * ((flashWin - now) / 1400)); ctx.stroke(); }
    const cy0 = sy - Hpx;
    if (lod === 1) {
      if (k >= 11 && !st.dropped) LM.icon(ctx, kind[1], sx, cy0, k * 0.62, st.s === 'todo' ? T.ink(0.6) : rgba(st.done ? mix(kHue, T.paper, 0.2) : kHue, 0.95), 2.1);
      if (st.blocked) { ctx.beginPath(); ctx.arc(sx + k * 0.45, cy0 - k * 0.45, Math.max(2, k * 0.14), 0, Math.PI * 2); ctx.fillStyle = rgba(T.coral, 1); ctx.fill(); }
      if (ch) { const [, bh] = badgeOf(ch.kind); ctx.beginPath(); ctx.arc(sx + k * 0.5, cy0 + k * 0.42, Math.max(2.2, k * 0.14), 0, Math.PI * 2); ctx.fillStyle = rgba(T.hues[bh] || T.acc, 1); ctx.fill(); }
    } else if (lod === 2) {
      const r = k * 0.34;
      if (!st.dropped) {
        disc(ctx, sx, cy0, r, st.s === 'todo' ? T.slate : kHue, T);
        LM.icon(ctx, kind[1], sx, cy0, r * 1.15, rgba(st.s === 'todo' ? T.slate : kHue, 1), 2.1);
        ring(ctx, sx, cy0, r + Math.max(3, k * 0.1), st.done ? 1 : it.vh, Math.max(1.5, k * 0.06), T.ink(0.18), st.done ? rgba(T.good, 1) : st.blocked ? rgba(T.coral, 1) : rgba(mix(hue, T.paper, 0.4), 1));
      }
      if (k >= 30) { ctx.font = `500 ${Math.min(12.5, Math.max(10, k * 0.3))}px Figtree, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = T.ink(st.s === 'todo' ? 0.6 : 0.92); const maxW = k * 1.7; let t = it.short; while (ctx.measureText(t).width > maxW && t.length > 4) t = t.slice(0, -2).trim() + '…'; if (t.length >= 9 || t === it.short) ctx.fillText(t, sx, cy0 + r + Math.max(5, k * 0.17)); }
      if (st.blocked) barrier(ctx, sx + k * 0.5, cy0 - k * 0.5, Math.max(6, k * 0.17), st.stale, T);
      if (ch) LM.drawBadge(ctx, ch.kind, sx + k * 0.52, cy0 + k * 0.5, Math.max(6, k * 0.17), T);
    } else {
      // street depth: the facade card, the kind glyph, the criteria ring, the title, who and since
      const w = Math.min(k * 1.02, 190), h = w * 0.72, cx = sx, cy = cy0 - h * 0.12;
      const x = cx - w / 2, y = cy - h / 2;
      if (!st.dropped) {
        ctx.save();
        if (!T.hc) { ctx.shadowColor = rgba(T.shadow, 0.5); ctx.shadowBlur = Math.max(6, k * 0.3); ctx.shadowOffsetY = Math.max(2, k * 0.12); }
        rrect(ctx, x, y, w, h, Math.max(6, w * 0.09)); ctx.fillStyle = st.s === 'todo' ? rgba(T.g2, 0.25) : rgba(T.g2, T.light ? 0.9 : 0.75); ctx.fill();
        ctx.restore();
        const pad = Math.max(2.5, w * 0.03), fr = Math.max(4, w * 0.065);
        rrect(ctx, x + pad, y + pad, w - pad * 2, h - pad * 2, fr);
        ctx.save(); ctx.clip();
        const im = LM.facadeImage(it.f || 'doc');
        ctx.globalAlpha *= st.s === 'todo' ? 0.45 : st.blocked ? 0.7 : 1;
        if (im) ctx.drawImage(im, x + pad, y + pad, w - pad * 2, h - pad * 2); else { ctx.fillStyle = rgba(mix(hue, T.sea, 0.5), 1); ctx.fillRect(x, y, w, h); }
        if (st.s === 'doing' && !T.hc) { ctx.fillStyle = rgba(T.black, 0.35 * (1 - it.vh)); ctx.fillRect(x, y, w, h * (1 - it.vh)); }
        if (st.blocked) { ctx.fillStyle = rgba(T.coral, 0.18); ctx.fillRect(x, y, w, h); }
        ctx.restore();
        rrect(ctx, x, y, w, h, Math.max(6, w * 0.09)); ctx.lineWidth = st.done || st.blocked || st.s === 'review' ? 1.6 : 1; ctx.strokeStyle = st.done ? rgba(T.good, 0.85) : st.blocked ? rgba(T.coral, 0.9) : st.s === 'review' ? rgba(T.ai, 0.9) : st.s === 'todo' ? T.ink(0.6) : T.ink(0.3); ctx.setLineDash(st.s === 'todo' ? [4, 3] : []); ctx.stroke(); ctx.setLineDash([]);
        const gr = Math.max(7, w * 0.11);
        disc(ctx, x + gr * 0.4, y + gr * 0.4, gr, kHue, T); LM.icon(ctx, kind[1], x + gr * 0.4, y + gr * 0.4, gr * 1.1, rgba(kHue, 1), 2.2);
        const rr = Math.max(8, w * 0.1);
        ctx.beginPath(); ctx.arc(x + w - rr * 0.3, y + rr * 0.3, rr + 2, 0, Math.PI * 2); ctx.fillStyle = rgba(T.g2, 0.95); ctx.fill();
        segRing(ctx, x + w - rr * 0.3, y + rr * 0.3, rr - 1.5, LM.rooms(it, st).map((r) => r.st), Math.max(2, rr * 0.3), T);
        if (st.blocked) barrier(ctx, x + w - rr * 0.3, y + h - rr * 0.3, rr, st.stale, T);
      } else { rrect(ctx, x, y, w, h, 8); ctx.fillStyle = rgba(T.lime, 0.12); ctx.fill(); LM.icon(ctx, 'trees', cx, cy, w * 0.3, rgba(T.lime, 0.7), 1.8); }
      const fs = Math.min(14, Math.max(11, k * 0.2));
      ctx.font = `500 ${fs}px Figtree, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = T.ink(st.s === 'todo' ? 0.62 : 0.95);
      const maxW = Math.max(w, k * 1.7); const words = it.short.split(' '); const lines = []; let cur = '';
      const maxLines = k >= 84 ? 2 : 1; for (const wd of words) { const t = cur ? cur + ' ' + wd : wd; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = wd; } else cur = t; if (lines.length === maxLines) break; } if (lines.length < maxLines && cur) lines.push(cur);
      lines.slice(0, maxLines).forEach((l, i) => { while (ctx.measureText(l).width > maxW && l.length > 3) l = l.slice(0, -2) + '…'; ctx.fillText(l, cx, y + h + 5 + i * (fs + 2)); });
      if (k >= 84) {
        const who = LM.who(it); const yy = y + h + 5 + lines.length * (fs + 2) + 4; const ar = Math.max(7, fs * 0.6);
        const word = LM.STATUS_WORD[st.s] || st.s; ctx.font = `500 ${fs - 1}px Figtree, system-ui, sans-serif`; const text = `${word} · ${LM.rel(st.since, view.t)}`; const tw = ctx.measureText(text).width; const totalW = ar * 2 + 6 + tw; const x1 = cx - totalW / 2;
        ctx.beginPath(); ctx.arc(x1 + ar, yy + ar, ar, 0, Math.PI * 2); ctx.fillStyle = who.agent ? rgba(T.ai, 0.5) : rgba(T.acc, 0.45); ctx.fill();
        if (who.agent) LM.icon(ctx, 'bot', x1 + ar, yy + ar, ar * 1.1, rgba(T.fg, 1), 2); else { ctx.font = `600 ${ar}px Figtree, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = T.ink(1); ctx.fillText(who.initial, x1 + ar, yy + ar + 0.5); }
        ctx.font = `500 ${fs - 1}px Figtree, system-ui, sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = st.blocked ? rgba(T.coral, 1) : T.ink(0.75); ctx.fillText(text, x1 + ar * 2 + 6, yy + ar);
      }
      if (ch) LM.drawBadge(ctx, ch.kind, x + Math.max(8, w * 0.1) * 0.2, y + h - Math.max(8, w * 0.1) * 0.2, Math.max(8, w * 0.1), T);
    }
    if (st.working && st.s === 'doing' && !view.reduce && !st.done && lod >= 2) { const b = 0.5 + 0.5 * Math.sin(now / 700 + it.i); ctx.beginPath(); ctx.arc(sx + k * 0.62, cy0 - k * 0.1, Math.max(2, k * 0.07), 0, Math.PI * 2); ctx.fillStyle = rgba(T.good, 0.3 + 0.6 * b); ctx.fill(); }
    ctx.restore();
    if (view.sel === it || view.hover === it) { hexPath(ctx, sx, sy, k, ri + 0.18, Hpx); ctx.lineWidth = 2; ctx.strokeStyle = view.sel === it ? rgba(T.acc, 1) : T.ink(0.7); ctx.stroke(); }
    if (lod === 2 && k < 28 && (view.sel === it || view.hover === it || st.blocked)) labelCands.push({ x: sx, y: cy0 - k * 0.6 - 4, text: it.short, pri: view.sel === it ? 100 : view.hover === it ? 90 : 10 });
  }
  LM.lastFrame = now; LM.shown = shown;
  for (const [bx, by, hard] of barriers) barrier(ctx, bx, by, Math.max(7, k * 0.2), hard, T);

  // ---- heat: where things moved (the since layer and the Fresh overlay) ----
  if ((since || O.has('fresh')) && !T.hc) {
    for (const D of vis.districts.values()) {
      const n = since ? (since.districts.get(D.key) || { n: 0 }).n : D.fresh;
      if (!n) continue;
      const [cx, cy0] = LM.toScreen(D.cx, D.cy); const cy = cy0 - (D.lift || 0); const R = Math.max(18, Math.sqrt(n) * k * (lod === 0 ? 1.4 : 1.1) + k * 0.6);
      if (!onScreen(cx, cy, R)) continue;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, rgba(T.heat, 0.3)); g.addColorStop(0.55, rgba(T.heat, 0.1)); g.addColorStop(1, rgba(T.heat, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 1.2; ctx.strokeStyle = rgba(T.heat, 0.2); ctx.beginPath(); ctx.arc(cx, cy, R * 0.42, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = rgba(T.heat, 0.1); ctx.beginPath(); ctx.arc(cx, cy, R * 0.62, 0, Math.PI * 2); ctx.stroke();
    }
  }
  // ---- weather (issues): a hatched, feathered front in the Risk hue over what hurts; haze where nothing moves ----
  if (O.has('issues') && !T.hc) {
    for (const D of vis.districts.values()) {
      if (!D.n) continue;
      const sev = Math.min(1, (D.blocked * 2.5 + D.stale) / Math.max(2, (D.built || D.n) * 0.3));
      const [cx, cy0] = LM.toScreen(D.cx, D.cy); const cy = cy0 - (D.lift || 0);
      const R = Math.max(26, Math.sqrt(D.n) * k * (lod === 0 ? 1.7 : 1.25));
      if (!onScreen(cx, cy, R * 1.5)) continue;
      if (D.blocked && sev >= 0.1) drawFront(ctx, cx, cy - R * 0.15, R * 1.3, R * 0.75, sev, D.blocked >= 2 || (D.blocked >= 1 && D.stale >= 2), now, T, view.reduce, D.key);
      else if (D.stale && D.stale / Math.max(1, D.built) > 0.4) { const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, rgba(T.paper, 0.1)); g.addColorStop(1, rgba(T.paper, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); }
    }
  }

  // ---- labels on the canvas (mid-depth titles, flags, landmarks), within the attention budget ----
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
  labelCands.sort((a, b) => b.pri - a.pri);
  let n = 0, mons = 0, low = 0;
  for (const c of labelCands) {
    if (n >= 12) break;
    if (c.mon && c.pri < 100 && mons >= 3) continue; if (c.mon && c.pri < 100) mons++;
    if (!c.mon && !c.gold && c.pri < 50 && low >= 5) continue; if (!c.mon && !c.gold && c.pri < 50) low++;
    const text = c.text.length > 48 ? c.text.slice(0, 46) + '…' : c.text;
    if (put(c.x, c.y, text, 13, c.gold ? rgba(T.gold, 1) : c.mon ? rgba(mix(T.rules, T.paper, 0.45), 1) : T.ink(0.95), c.pri >= 90 ? 600 : 500)) n++;
  }
  LM.syncMarkers(vis, lod, stats, since);
  if (LM.lensAnim || view.playing || LM.flight || flashWin > now) LM.needsFrame = true;
};

// ---- a decision: a flag (a pole and a banner in Rules indigo; the owner's are larger and carry the id) ----
function drawFlag(ctx, sx, sy, k, v, dim, lod, T) {
  const big = v.mon.who === 'owner';
  const h = Math.max(8, k * (big ? 1.4 : 1.0)), bw = Math.max(5, k * (big ? 0.72 : 0.46)), bh = Math.max(3, k * (big ? 0.34 : 0.24));
  ctx.save(); ctx.globalAlpha = dim;
  if (lod >= 2) { ctx.beginPath(); ctx.ellipse(sx, sy + 1, bw * 0.5, bw * 0.2, 0, 0, Math.PI * 2); ctx.fillStyle = rgba(T.black, 0.25); ctx.fill(); }
  ctx.lineWidth = Math.max(1.2, k * 0.05); ctx.strokeStyle = T.ink(0.7); ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - h); ctx.stroke();
  const y = sy - h + 1;
  ctx.beginPath(); ctx.moveTo(sx, y); ctx.lineTo(sx + bw, y); ctx.lineTo(sx + bw - bh * 0.45, y + bh / 2); ctx.lineTo(sx + bw, y + bh); ctx.lineTo(sx, y + bh); ctx.closePath();
  ctx.fillStyle = rgba(T.light ? [77, 95, 214] : T.rules, 0.95); ctx.fill();
  if (big && lod >= 2 && bh >= 9) { ctx.font = `600 ${Math.min(12, bh * 0.75)}px Figtree, system-ui, sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(v.mon.id, sx + bh * 0.3, y + bh / 2 + 0.5); }
  ctx.restore();
}
LM.drawFlag = drawFlag;
// ---- a milestone: the Gate landmark in gold, lit, on the skyline ----
function drawMilestone(ctx, sx, sy, k, v, dim, T) {
  const size = Math.max(26, Math.min(96, k * 2.2));
  ctx.save(); ctx.globalAlpha = dim;
  if (!T.hc) { const g = ctx.createRadialGradient(sx, sy - size * 0.45, 0, sx, sy - size * 0.45, size * 0.8); g.addColorStop(0, rgba(T.gold, 0.3)); g.addColorStop(1, rgba(T.gold, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy - size * 0.45, size * 0.8, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.arc(sx, sy - size * 0.45, size * 0.52, 0, Math.PI * 2); ctx.fillStyle = rgba(T.g2, T.light ? 0.85 : 0.5); ctx.fill(); ctx.lineWidth = Math.max(2, size * 0.05); ctx.strokeStyle = rgba(T.gold, 0.9); ctx.stroke();
  LM.landmark(ctx, 'gate', sx, sy - size * 0.45, size * 0.7, rgba(T.hc ? T.fg : T.gold, 0.95), 2.2);
  ctx.restore();
}
LM.drawMilestone = drawMilestone;
// ---- a weather front: hatched and feathered, drifting slowly ----
const frontCache = new Map();
function drawFront(ctx, cx, cy, rx, ry, sev, breach, now, T, reduce, key) {
  const drift = reduce ? 0 : Math.sin(now / 6000 + key.length) * rx * 0.06;
  const w = Math.ceil(rx * 2.4), h = Math.ceil(ry * 2.4);
  const ck = `${Math.round(rx / 6)}|${Math.round(ry / 6)}|${breach ? 1 : 0}|${T.light ? 1 : 0}`;
  let off = frontCache.get(ck);
  if (!off) {
    off = document.createElement('canvas'); off.width = w; off.height = h; const o = off.getContext('2d');
    const col = breach ? T.sharp : mix(T.sharp, T.amber, 0.5);
    o.save(); o.beginPath(); o.ellipse(w / 2, h / 2, rx, ry, 0, 0, Math.PI * 2); o.clip();
    o.fillStyle = rgba(col, 0.16); o.fillRect(0, 0, w, h);
    o.strokeStyle = rgba(col, 0.55); o.lineWidth = 2.2; o.beginPath(); for (let x = -h; x < w + h; x += 10) { o.moveTo(x, 0); o.lineTo(x + h * 0.84, h); } o.stroke();
    o.restore();
    o.globalCompositeOperation = 'destination-in'; const g = o.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(rx, ry)); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.55, 'rgba(0,0,0,.9)'); g.addColorStop(1, 'rgba(0,0,0,0)'); o.fillStyle = g; o.fillRect(0, 0, w, h);
    frontCache.set(ck, off);
  }
  ctx.save(); ctx.globalAlpha = Math.min(1, 0.45 + sev * 0.55); ctx.drawImage(off, cx - w / 2 + drift, cy - h / 2); ctx.restore();
}
LM.drawFront = drawFront;

// ---- place markers in the DOM: landmark in its ring, the name beneath; the overlay's number as a chip ----
LM.markers = new Map();
LM.syncMarkers = function syncMarkers(vis, lod, stats, since) {
  const root = LM.placesEl; if (!root) return;
  const ds = LM.ds, view = LM.view, k = LM.cam.k;
  const alive = new Set();
  const ov = [...view.overlays].find((o) => o !== 'terrain' && o !== 'pipes' && o !== 'power') || null;
  const traceLands = view.trace ? view.trace.lands : null;
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
    const title = `${info.name}${info.sub ? ': ' + info.sub : ''} · ${S.built || 0} buildings, ${Math.round(opts.pct * 100)} % done`; if (m.title !== title) { m.el.title = title; m.title = title; }
    const pct = Math.round(opts.pct * 100); if (m.pct !== pct) { m.el.querySelector('.val').setAttribute('stroke-dasharray', `${pct} 100`); m.pct = pct; }
    const chip = opts.chip || ''; if (m.chip !== chip) { const dc = m.el.querySelector('.dc'); dc.textContent = chip; dc.hidden = !chip; m.chip = chip; }
    const dim = opts.dim; if (m.dim !== dim) { m.el.style.opacity = dim; m.dim = dim; }
    m.el.style.transform = `translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px)`;
  };
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
      let chip = '';
      if (ov && chips < 12) { const pv = LM.placeValue(L, ov, stats, true); if (pv) { chip = pv.text; chips++; } }
      if (since && chips < 12) { const c = since.places.get(L.key); if (c) { chip = `${c.n} changed`; chips++; } }
      show('L:' + L.key, 'land', L, info, sx, sy - (L.lift || 0), size, { name: info.name, pct, chip, dim: traceLands && !traceLands.has(L.key) ? 0.35 : lod === 1 ? 0.85 : 1 });
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
      let chip = '';
      if (ov && chips < 12) { const pv = LM.placeValue(D, ov, stats, false); if (pv) { chip = pv.text; chips++; } }
      if (since && chips < 12) { const c = since.districts.get(D.key); if (c) { chip = `${c.n} changed`; chips++; } }
      show('D:' + D.key, 'district', D, info, sx, sy - (D.lift || 0) - (lod === 2 ? k * 0.9 : 0), lod === 1 ? 'xs' : 's', { name, pct, chip, dim: traceLands && !traceLands.has(D.land) ? 0.35 : lod === 2 ? 0.92 : 1 });
    }
  }
  for (const [key, m] of LM.markers) if (!alive.has(key)) { m.el.remove(); LM.markers.delete(key); }
};

/** Hit test: the tile, flag or landmark under the point, else the district, else the land. */
LM.hit = function hit(sx, sy) {
  const vis = LM.vis; if (!vis) return null;
  const k = LM.cam.k;
  let best = null, bestY = -Infinity;
  for (const v of vis.items) {
    if (v.park || v.square) continue;
    const [x, y] = LM.toScreen(v.x, v.y);
    const D = vis.districts.get(v.d); const yy = y - (D && D.lift ? D.lift : 0);
    if (Math.abs(x - sx) > k * 1.2 || sy > yy + k * 1.2 || sy < yy - k * 4) continue;
    const top = v.it ? (LM.lod >= 3 ? k * 1.3 : k * 0.9) : v.mon ? k * 1.5 : k * 2.4;
    const inside = sy <= yy + k * 0.85 && sy >= yy - top && Math.abs(x - sx) <= k * 0.85;
    if (inside && y > bestY) { best = v; bestY = y; }
  }
  if (best) return best;
  const [wx, wy] = LM.toWorld(sx, sy);
  const [q, r] = LM.xyHex(wx, wy);
  for (const D of vis.districts.values()) if (D.cells.has(q + ',' + r)) return { district: D };
  for (const L of vis.lands.values()) if (L.cells.has(q + ',' + r)) return { land: L };
  return null;
};
