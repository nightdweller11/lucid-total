/* The living map: renderer. Canvas 2D. Draw order: land hulls, district hulls, pipes, buildings (back to front),
 * monuments and landmarks, weather, labels, selection. Overlays recolour channels (ground, light, air, lines);
 * they never add marks. Level of detail by scale k (px per plot radius). */
LM.HUES = ['sky', 'violet', 'warm', 'lime', 'rules', 'gold', 'slate', 'ai', 'heat', 'sharp', 'drift'];
LM.cam = { x: 0, y: 0, k: 8 };
LM.view = { lens: 'dept', overlays: new Set(), t: 0, playing: false, speed: 1, trace: null, sel: null, hover: null, hc: false, reduce: false };
LM.lensAnim = null; // { from: lens, to: lens, t0 }
LM.flight = null;

const parseRGB = (s) => { const m = /rgba?\(([^)]+)\)/.exec(s); if (m) { const p = m[1].split(',').map(Number); return [p[0], p[1], p[2]]; } const h = s.trim().replace('#', ''); if (h.length === 3) return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mix = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f].map(Math.round);
LM.mix = mix; LM.rgba = rgba;

LM.readTheme = function readTheme() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n) => cs.getPropertyValue(n).trim();
  const light = document.documentElement.dataset.pt === 'sky';
  const T = (LM.theme = {
    light,
    fg: parseRGB(v('--fg') || '#f2f6ff'), muted: parseRGB(v('--muted').startsWith('rgba') ? v('--muted') : '#c7d2ea'),
    sea: parseRGB(v('--ground-base') || '#102b6b'),
    lit: light ? [255, 214, 120] : [255, 226, 160], white: light ? [20, 36, 70] : [255, 255, 255], black: light ? [255, 255, 255] : [4, 10, 28],
    coral: parseRGB(v('--f-sharp') || '#ff5c7a'), amber: parseRGB(v('--hold-h') || '#ffc96b'), ai: parseRGB(v('--ai') || '#5fe3cf'), good: parseRGB(v('--good') || '#47d16c'),
    heat: parseRGB(v('--f-heat') || '#ff8a3d'), gold: parseRGB(v('--f-gold') || '#ffd23f'), park: light ? [120, 190, 120] : [70, 140, 100],
    hues: {},
  });
  for (const h of LM.HUES) T.hues[h] = parseRGB(v(h === 'ai' ? '--ai' : `--f-${h}`) || '#8fb4ff');
  T.hues.ai = T.ai;
  return T;
};

LM.landInfo = function landInfo(ds, lens, g) {
  const L = ds.lenses[lens].lands[g];
  if (L) return L;
  if (g === '_co') return { name: 'Company', sub: 'Decisions that belong to the whole company.', glyph: 'landmark', hue: 'gold', lm: 'summit' };
  return { name: g, sub: '', glyph: 'map', hue: 'slate', lm: 'house' };
};
LM.distName = (ds, lens, d) => (ds.districts[lens] && ds.districts[lens][d] && ds.districts[lens][d].name) || (d.endsWith(':decisions') ? 'Decisions' : d.split(':').slice(1).join(':') || d);

// ---- screen transform ----
LM.toScreen = (x, y) => [(x - LM.cam.x) * LM.cam.k + LM.W / 2, (y - LM.cam.y) * LM.cam.k * 0.92 + LM.H / 2];
LM.toWorld = (sx, sy) => [(sx - LM.W / 2) / LM.cam.k + LM.cam.x, (sy - LM.H / 2) / (LM.cam.k * 0.92) + LM.cam.y];

const pathRing = (ctx, ring, inflate = 0) => {
  const n = ring.length;
  const P = ring.map(([x, y]) => LM.toScreen(x, y));
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  ctx.moveTo(...mid(P[0], P[1]));
  for (let i = 1; i <= n; i++) { const p = P[i % n], q = P[(i + 1) % n]; const m = mid(p, q); ctx.quadraticCurveTo(p[0], p[1], m[0], m[1]); }
  ctx.closePath();
};
LM.pathRing = pathRing;

/** Compute per-visible-state derived values used by overlays (max cost, revenue shares). */
const overlayStats = (ds, vis, lens) => {
  let maxCost = 1, maxDCost = 1;
  for (const L of vis.lands.values()) maxCost = Math.max(maxCost, L.cost);
  for (const D of vis.districts.values()) maxDCost = Math.max(maxDCost, D.cost);
  const rev = new Map();
  if (ds.revenue.length) {
    const byProd = new Map();
    for (const s of ds.revenue) if (s.t <= vis.t) byProd.set(s.prod, (byProd.get(s.prod) || 0) + s.amount);
    const prodTotals = new Map();
    for (const v of vis.items) if (v.it) prodTotals.set(v.it.g.prod, (prodTotals.get(v.it.g.prod) || 0) + 1);
    for (const L of vis.lands.values()) {
      let r = 0;
      const counts = new Map();
      for (const v of L.items) if (v.it) counts.set(v.it.g.prod, (counts.get(v.it.g.prod) || 0) + 1);
      for (const [p, n] of counts) r += (byProd.get(p) || 0) * (n / (prodTotals.get(p) || 1));
      rev.set(L.key, r);
    }
  }
  let maxRev = 1;
  for (const r of rev.values()) maxRev = Math.max(maxRev, r);
  return { maxCost, maxDCost, rev, maxRev };
};

LM.draw = function draw(now) {
  const ctx = LM.ctx, T = LM.theme, ds = LM.ds, view = LM.view;
  const W = LM.W, H = LM.H, k = LM.cam.k;
  ctx.clearRect(0, 0, W, H);
  const world = LM.worlds[view.lens];
  const vis = (LM.vis = LM.visible(world, view.t));
  const O = view.overlays;
  const stats = overlayStats(ds, vis, view.lens);
  const lod = k < 6 ? 0 : k < 16 ? 1 : k < 40 ? 2 : 3;
  LM.lod = lod;
  const traceSet = view.trace ? view.trace.set : null;
  const traceLands = view.trace ? view.trace.lands : null;
  const hueOf = (g) => T.hues[LM.landInfo(ds, view.lens, g).hue] || T.hues.slate;
  const pulse = (now / 900) % 1;

  // lens animation: positions interpolate from the old lens' plots
  let lerpPos = null;
  if (LM.lensAnim) {
    const f = Math.min(1, (now - LM.lensAnim.t0) / 900);
    const e = 1 - Math.pow(1 - f, 3);
    const old = LM.lensAnim.from;
    lerpPos = (v) => {
      const cells = v.it && v.it.cells[old];
      if (!cells) return [v.x, v.y];
      let c = cells[0];
      for (const cc of cells) if (cc.t <= view.t) c = cc;
      const [ox, oy] = LM.hexXY(c.q, c.r);
      return [ox + (v.x - ox) * e, oy + (v.y - oy) * e];
    };
    LM.lensAnim.f = e;
    if (f >= 1) LM.lensAnim = null;
  }
  const hullAlpha = LM.lensAnim ? LM.lensAnim.f : 1;

  // ---- lands ----
  const landsSorted = [...vis.lands.values()].sort((a, b) => a.cy - b.cy);
  for (const L of landsSorted) {
    const hue = hueOf(L.key);
    const rings = LM.hullOf(world, L);
    const doneShare = L.n ? L.done / L.n : 0;
    let fill = mix(mix(T.sea, hue, 0.34), T.lit, doneShare * 0.22), alpha = 0.6;
    if (O.has('progress')) { fill = mix(mix(T.sea, hue, 0.25), T.lit, doneShare * 0.75); alpha = 0.7; }
    if (O.has('cost')) { const c = L.cost / stats.maxCost; fill = mix(mix(T.sea, hue, 0.2), T.heat, Math.pow(c, 0.6) * 0.85); alpha = 0.75; }
    if (O.has('revenue')) { const r = (stats.rev.get(L.key) || 0) / stats.maxRev; const net = (stats.rev.get(L.key) || 0) - L.cost; fill = r > 0 ? mix(mix(T.sea, hue, 0.2), T.gold, Math.pow(r, 0.6) * 0.9) : net < 0 && L.cost > 0 ? mix(mix(T.sea, hue, 0.2), [120, 80, 40], 0.5) : mix(T.sea, hue, 0.2); alpha = 0.75; }
    const dim = traceLands && !traceLands.has(L.key) ? 0.35 : 1;
    const lift = O.has('terrain') ? Math.min(40, (L.remaining / Math.max(1, (L.built || L.n) * 3)) * 30 * Math.max(0.8, k / 10)) : 3;
    ctx.save();
    ctx.globalAlpha = hullAlpha * dim;
    // the raised edge (a plateau): a dark copy offset downward
    ctx.beginPath(); for (const r of rings) pathRing(ctx, r);
    ctx.translate(0, lift); ctx.fillStyle = rgba(mix(fill, T.black, 0.55), 0.9); ctx.fill('evenodd'); ctx.translate(0, -lift);
    ctx.beginPath(); for (const r of rings) pathRing(ctx, r);
    ctx.fillStyle = rgba(fill, alpha); ctx.fill('evenodd');
    ctx.lineWidth = Math.max(1, k * 0.12); ctx.strokeStyle = rgba(mix(hue, T.white, 0.35), 0.55); ctx.stroke();
    ctx.restore();
  }
  // ---- causeways (a land that seceded stays joined to its parent) ----
  for (const L of vis.lands.values()) {
    const W = world.lands.get(L.key);
    if (!W || !W.parent) continue;
    const P = vis.lands.get(W.parent); if (!P) continue;
    const [ax, ay] = LM.toScreen(P.cx, P.cy), [bx, by] = LM.toScreen(L.cx, L.cy);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
    ctx.lineWidth = Math.max(2, k * 0.5); ctx.strokeStyle = rgba(mix(T.white, T.sea, 0.5), 0.35 * hullAlpha); ctx.stroke();
    ctx.lineWidth = Math.max(1, k * 0.12); ctx.setLineDash([k * 0.6, k * 0.6]); ctx.strokeStyle = rgba(T.white, 0.5 * hullAlpha); ctx.stroke(); ctx.setLineDash([]);
  }
  // ---- districts ----
  if (lod >= 1 || k >= 4) {
    for (const D of vis.districts.values()) {
      if (D.n < 1) continue;
      const hue = hueOf(D.land);
      const rings = LM.hullOf(world, D);
      let fill = mix(mix(hue, T.white, 0.2), T.lit, (D.built ? D.done / D.built : 0) * 0.55), alpha = 0.16;
      if (O.has('progress')) { fill = mix(hue, T.lit, (D.n ? D.done / D.n : 0) * 0.8); alpha = 0.18; }
      if (O.has('cost')) { fill = mix(hue, T.heat, Math.pow(D.cost / stats.maxDCost, 0.6)); alpha = 0.25; }
      if (O.has('power') && D.items.some((v) => !v.it.forecast && v.st.s !== 'done' && v.st.s !== 'dropped' && /owner/i.test(v.it.n))) { fill = T.black; alpha = 0.45; }
      const dim = traceLands && !traceLands.has(D.land) ? 0.3 : 1;
      ctx.save(); ctx.globalAlpha = hullAlpha * dim;
      const lift = O.has('terrain') ? Math.min(30, (D.remaining / Math.max(1, (D.built || D.n) * 3)) * 22 * Math.max(0.8, k / 10)) : 0;
      if (lift > 0.5) { ctx.beginPath(); for (const r of rings) pathRing(ctx, r); ctx.translate(0, lift); ctx.fillStyle = rgba(mix(hue, T.black, 0.6), 0.8); ctx.fill('evenodd'); ctx.translate(0, -lift); }
      ctx.translate(0, -lift);
      ctx.beginPath(); for (const r of rings) pathRing(ctx, r);
      ctx.fillStyle = rgba(fill, alpha); ctx.fill('evenodd');
      ctx.lineWidth = Math.max(0.6, k * 0.05); ctx.strokeStyle = rgba(mix(hue, T.white, 0.5), lod >= 1 ? 0.35 : 0.15); ctx.stroke();
      ctx.restore();
      D.lift = lift;
    }
  }

  // ---- pipes (dependencies) ----
  const posOf = new Map();
  for (const v of vis.items) if (v.it) posOf.set(v.it.id, v);
  const pipesOn = O.has('pipes') || (view.trace && view.trace.kind === 'item');
  if (pipesOn) {
    if (lod === 0) {
      // roads between lands, by the number of dependencies
      const pairs = new Map();
      for (const v of vis.items) if (v.it) for (const dep of v.it.dep) { const u = posOf.get(dep); if (!u || u.g === v.g) continue; const kk = u.g < v.g ? u.g + '>' + v.g : v.g + '>' + u.g; const p = pairs.get(kk) || { a: vis.lands.get(u.g), b: vis.lands.get(v.g), n: 0, flow: 0, clog: 0 }; p.n++; if (u.st.done && !v.st.done) p.flow++; if (u.st.blocked || (u.st.stale && !u.st.done)) p.clog++; pairs.set(kk, p); }
      for (const p of pairs.values()) {
        if (!p.a || !p.b) continue;
        const [ax, ay] = LM.toScreen(p.a.cx, p.a.cy), [bx, by] = LM.toScreen(p.b.cx, p.b.cy);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.lineWidth = Math.min(10, 1 + Math.sqrt(p.n)); ctx.strokeStyle = p.clog ? rgba(T.coral, 0.6) : rgba(mix(T.white, T.ai, 0.4), p.flow ? 0.55 : 0.25);
        ctx.setLineDash(p.flow ? [] : [4, 6]); ctx.stroke(); ctx.setLineDash([]);
      }
    } else {
      for (const v of vis.items) {
        if (!v.it) continue;
        for (const dep of v.it.dep) {
          const u = posOf.get(dep); if (!u) continue;
          if (traceSet && !(traceSet.has(v.it.id) || traceSet.has(u.it.id))) continue;
          const [ax, ay] = LM.toScreen(...(lerpPos ? lerpPos(u) : [u.x, u.y])), [bx, by] = LM.toScreen(...(lerpPos ? lerpPos(v) : [v.x, v.y]));
          const flowing = u.st.done && !v.st.done && !v.st.dropped;
          const clogged = u.st.blocked || (u.st.stale && !u.st.done && !u.st.dropped);
          const hard = u.st.blocked;
          const dry = !u.st.done && !clogged;
          const onA = ax > 0 && ax < W && ay > 0 && ay < H, onB = bx > 0 && bx < W && by > 0 && by < H;
          const focus = view.sel === v.it || view.sel === u.it || view.hover === v.it || view.hover === u.it || traceSet;
          if (!onA && !onB && !focus) continue;
          if (lod >= 2 && !focus && Math.hypot(bx - ax, by - ay) > Math.max(W, H) * 0.9) continue;
          const dx = bx - ax, dy = by - ay, L2 = Math.hypot(dx, dy) || 1;
          const nx = -dy / L2, ny = dx / L2, bow = Math.min(40, L2 * 0.2);
          const c1 = [ax + dx * 0.3 + nx * bow, ay + dy * 0.3 + ny * bow], c2 = [ax + dx * 0.7 + nx * bow, ay + dy * 0.7 + ny * bow];
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], bx, by);
          ctx.lineWidth = Math.max(1.2, k * 0.08);
          ctx.strokeStyle = hard ? rgba(mix(T.coral, T.black, 0.3), 0.85) : clogged ? rgba(mix(T.amber, T.black, 0.45), 0.7) : flowing ? rgba(T.ai, 0.65) : u.st.done ? rgba(T.white, 0.18) : rgba(T.white, 0.28);
          ctx.setLineDash(dry ? [3, 7] : []); ctx.stroke(); ctx.setLineDash([]);
          if (flowing && !view.reduce) {
            for (let i = 0; i < 3; i++) {
              const f = (pulse + i / 3) % 1;
              const mt = 1 - f;
              const px = mt * mt * mt * ax + 3 * mt * mt * f * c1[0] + 3 * mt * f * f * c2[0] + f * f * f * bx;
              const py = mt * mt * mt * ay + 3 * mt * mt * f * c1[1] + 3 * mt * f * f * c2[1] + f * f * f * by;
              ctx.beginPath(); ctx.arc(px, py, Math.max(1.5, k * 0.09), 0, Math.PI * 2); ctx.fillStyle = rgba(T.ai, 0.95); ctx.fill();
            }
          }
          if (clogged) {
            const r = Math.max(3, k * 0.18) * (1 + 0.25 * Math.sin(now / 350));
            ctx.beginPath(); ctx.arc(ax + dx * 0.12 + nx * bow * 0.3, ay + dy * 0.12 + ny * bow * 0.3, r, 0, Math.PI * 2);
            ctx.fillStyle = rgba(hard ? T.coral : T.amber, 0.9); ctx.fill();
          }
        }
      }
    }
  }
  // ---- power (decision lineage) ----
  if (O.has('power') || (view.trace && view.trace.kind === 'decision')) {
    for (const v of vis.items) {
      if (!v.mon) continue;
      if (view.trace && view.trace.kind === 'decision' && view.trace.dec !== v.mon) continue;
      const [ax, ay] = LM.toScreen(v.x, v.y);
      for (const id of v.mon.lin) {
        const u = posOf.get(id); if (!u) continue;
        const [bx, by] = LM.toScreen(...(lerpPos ? lerpPos(u) : [u.x, u.y]));
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.lineWidth = 1; ctx.strokeStyle = rgba(T.gold, view.trace ? 0.7 : 0.35); ctx.stroke();
      }
    }
  }

  // ---- buildings, monuments, landmarks: back to front ----
  const order = vis.items.slice().sort((a, b) => a.y - b.y || a.x - b.x);
  const dt = Math.min(0.1, (now - (LM.lastFrame || now)) / 1000);
  const chase = view.reduce ? 1 : 1 - Math.exp(-dt / 0.22);
  const ri = 0.8;
  const labelCands = [];
  for (const v of order) {
    const [x0, y0] = lerpPos && v.it ? lerpPos(v) : [v.x, v.y];
    const [sx, syRaw] = LM.toScreen(x0, y0);
    const D = vis.districts.get(v.d);
    const sy = syRaw - (D && D.lift ? D.lift : 0);
    if (sx < -k * 3 || sx > W + k * 3 || sy < -k * 4 || sy > H + k * 3) continue;
    const dim = traceSet ? (v.it && traceSet.has(v.it.id)) || (v.mon && view.trace.dec === v.mon) || (traceLands && !v.it && traceLands.has(v.g)) ? 1 : 0.18 : 1;
    const hue = hueOf(v.g);
    if (v.square) {
      if (lod === 0) continue;
      ctx.beginPath(); for (let i = 0; i < 6; i++) { const [cx, cy] = LM.hexCorner(0, 0, i, ri * 0.95); i ? ctx.lineTo(sx + cx * k, sy + cy * k * 0.92) : ctx.moveTo(sx + cx * k, sy + cy * k * 0.92); }
      ctx.closePath(); ctx.fillStyle = rgba(mix(hue, T.white, 0.35), 0.35 * dim); ctx.fill(); ctx.strokeStyle = rgba(T.gold, 0.35 * dim); ctx.lineWidth = 1; ctx.stroke();
      continue;
    }
    if (v.park) {
      if (lod === 0) continue;
      ctx.beginPath(); for (let i = 0; i < 6; i++) { const [cx, cy] = LM.hexCorner(0, 0, i, ri * 0.9); i ? ctx.lineTo(sx + cx * k, sy + cy * k * 0.92) : ctx.moveTo(sx + cx * k, sy + cy * k * 0.92); }
      ctx.closePath(); ctx.fillStyle = rgba(T.park, 0.45 * dim); ctx.fill();
      continue;
    }
    if (v.mon) { if (lod === 0 && !(view.trace && view.trace.dec === v.mon)) continue; drawMonument(ctx, sx, sy, k, v, dim, now, lod); const focus = (view.trace && view.trace.dec === v.mon) || (view.sel && view.sel.mon === v.mon); if (focus || (lod >= 3 && v.mon.who === 'owner')) labelCands.push({ x: sx, y: sy - k * 1.6, text: v.mon.n, pri: focus ? 100 : 2, mon: true }); continue; }
    if (v.lm) { drawLandmark(ctx, sx, sy, k, v, dim, now); labelCands.push({ x: sx, y: sy - k * 2.6, text: v.lm.n, pri: 50, gold: true }); continue; }
    const it = v.it, st = v.st;
    it.vh += (st.h - it.vh) * chase; it.vlit += (st.lit - it.vlit) * chase;
    if (Math.abs(st.h - it.vh) < 0.002) it.vh = st.h;
    if (lod === 0) {
      // city lights from above: a dot per building, warm when lit
      if (k >= 2.2 && !st.dropped && st.s !== 'todo') {
        const r = Math.max(1.2, k * 0.34);
        ctx.fillStyle = st.done ? rgba(T.lit, 0.85 * dim) : st.blocked ? rgba(T.coral, 0.9 * dim) : rgba(mix(hue, T.white, 0.5), 0.55 * dim);
        ctx.fillRect(sx - r / 2, sy - r / 2, r, r);
      }
      continue;
    }
    const vh = st.dropped ? 0 : it.vh;
    const Hpx = vh * (0.3 + 0.2 * it.s) * k;
    const litF = it.vlit;
    const costF = O.has('cost') ? Math.min(1, st.cost / (stats.maxDCost / 6 + 1)) : 0;
    let top = mix(mix(hue, T.white, 0.25 + 0.45 * litF), T.lit, litF * 0.5);
    let side = mix(hue, T.black, 0.45 - 0.15 * litF);
    if (st.blocked) { top = mix(hue, T.black, 0.55); side = mix(hue, T.black, 0.7); }
    if (st.s === 'todo') { top = mix(hue, T.sea, 0.5); side = mix(hue, T.black, 0.6); }
    if (O.has('ai') && it.agent) { top = mix(top, T.ai, 0.45); side = mix(side, T.ai, 0.3); }
    if (O.has('cost')) { top = mix(top, T.heat, costF * 0.7); side = mix(side, T.heat, costF * 0.5); }
    if (O.has('load') && D) { const load = Math.min(1, D.working / 6); top = mix(top, T.coral, load * 0.6); }
    if (O.has('fresh')) { if (st.stale) { top = mix(top, T.sea, 0.6); side = mix(side, T.sea, 0.6); } }
    let alpha = dim;
    if (st.ghost) alpha *= 0.45;
    ctx.save(); ctx.globalAlpha = alpha;
    const corner = (i, dy = 0, rr = ri) => { const [cx, cy] = LM.hexCorner(0, 0, i, rr); return [sx + cx * k, sy + cy * k * 0.92 - dy]; };
    if (lod === 1) {
      ctx.beginPath(); for (let i = 0; i < 6; i++) { const p = corner(i, Hpx * 0.4, ri * 0.92); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.closePath();
      if (st.s === 'todo' || st.ghost) { ctx.strokeStyle = rgba(top, 0.7); ctx.lineWidth = 1; ctx.setLineDash(st.ghost ? [2, 3] : []); ctx.stroke(); ctx.setLineDash([]); }
      else { ctx.fillStyle = rgba(top, 0.95); ctx.fill(); }
      if (st.blocked) { ctx.beginPath(); ctx.arc(sx, sy, Math.max(1.5, k * 0.18), 0, Math.PI * 2); ctx.fillStyle = rgba(T.coral, 0.95); ctx.fill(); }
      if (O.has('fresh') && st.fresh) { ctx.beginPath(); ctx.arc(sx, sy - Hpx * 0.4, k * 0.95, 0, Math.PI * 2); ctx.fillStyle = rgba(T.lit, 0.18); ctx.fill(); }
    } else {
      // footprint
      ctx.beginPath(); for (let i = 0; i < 6; i++) { const p = corner(i); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.closePath();
      ctx.fillStyle = rgba(mix(hue, T.black, 0.55), st.s === 'todo' ? 0.35 : 0.7); ctx.fill();
      if (st.s === 'todo' || st.ghost) { ctx.strokeStyle = rgba(mix(hue, T.white, 0.4), 0.6); ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]); }
      if (Hpx > 1) {
        // the side silhouette: base corners 5,0,1,2,3 then the top corners back
        ctx.beginPath();
        for (const i of [5, 0, 1, 2, 3]) { const p = corner(i); ctx.lineTo(p[0], p[1]); }
        for (const i of [3, 2, 1, 0, 5]) { const p = corner(i, Hpx); ctx.lineTo(p[0], p[1]); }
        ctx.closePath(); ctx.fillStyle = rgba(side, 0.97); ctx.fill();
        // the lit edge between front faces
        const e0 = corner(0), e1 = corner(0, Hpx);
        ctx.beginPath(); ctx.moveTo(e0[0], e0[1]); ctx.lineTo(e1[0], e1[1]); ctx.strokeStyle = rgba(mix(side, T.white, 0.25), 0.8); ctx.lineWidth = 1; ctx.stroke();
        // the top
        ctx.beginPath(); for (let i = 0; i < 6; i++) { const p = corner(i, Hpx); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.closePath();
        ctx.fillStyle = rgba(top, 0.98); ctx.fill();
        if (st.s === 'review') { ctx.strokeStyle = rgba(T.ai, 0.9); ctx.lineWidth = Math.max(1, k * 0.06); ctx.stroke(); }
        // windows on the two front faces
        if (lod >= 3 || k >= 26) {
          const rows = Math.min(6, Math.max(1, Math.floor(Hpx / (k * 0.26))));
          const litRows = st.blocked ? 0 : Math.round(rows * litF);
          const faces = [[corner(5), corner(0)], [corner(0), corner(1)]];
          for (const [a, b] of faces) for (let r = 0; r < rows; r++) for (let c = 0; c < 2; c++) {
            const fx = 0.3 + c * 0.4, fy = (r + 0.5) / rows;
            const px = a[0] + (b[0] - a[0]) * fx, py = a[1] + (b[1] - a[1]) * fx - Hpx * fy;
            const on = r < litRows || (st.s === 'review' && r === rows - 1);
            const warm = O.has('load') && D ? mix(T.lit, T.coral, Math.min(1, D.working / 6) * 0.7) : st.s === 'review' && r === rows - 1 ? T.ai : O.has('ai') && it.agent ? mix(T.lit, T.ai, 0.5) : T.lit;
            ctx.fillStyle = on ? rgba(warm, 0.95) : rgba(T.black, 0.35);
            ctx.fillRect(px - k * 0.05, py - k * 0.07, k * 0.1, k * 0.12);
          }
        }
      }
      if (st.blocked) { const r = Math.max(2, k * 0.16) * (1 + 0.2 * Math.sin(now / 350)); const p = corner(0); ctx.beginPath(); ctx.arc(p[0], p[1] - k * 0.1, r, 0, Math.PI * 2); ctx.fillStyle = rgba(T.coral, 0.95); ctx.fill(); }
      if (O.has('fresh') && st.fresh) { ctx.beginPath(); ctx.arc(sx, sy - Hpx, k * 1.1, 0, Math.PI * 2); ctx.fillStyle = rgba(T.lit, 0.16); ctx.fill(); }
      if (st.working && !view.reduce && !st.done && st.s === 'doing') { // the breath of a building being built
        const b = 0.5 + 0.5 * Math.sin(now / 700 + it.i);
        ctx.beginPath(); ctx.arc(sx, sy - Hpx, k * 0.22, 0, Math.PI * 2); ctx.fillStyle = rgba(T.white, 0.25 + 0.35 * b); ctx.fill();
      }
    }
    ctx.restore();
    if (view.sel === it || view.hover === it) {
      ctx.beginPath(); for (let i = 0; i < 6; i++) { const p = corner(i, -2, ri + 0.25); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.closePath();
      ctx.strokeStyle = rgba(T.white, view.sel === it ? 0.95 : 0.6); ctx.lineWidth = 2; ctx.stroke();
    }
    if (lod >= 3 && (view.sel === it || view.hover === it || st.blocked || (it.s >= 3 && (st.fresh || st.s === 'review')))) labelCands.push({ x: sx, y: sy - Hpx - 6, text: it.n, pri: view.sel === it ? 100 : view.hover === it ? 90 : st.blocked ? 10 : 3 });
    else if (lod >= 3 && it.s >= 4 && k >= 72) labelCands.push({ x: sx, y: sy - Hpx - 6, text: it.n, pri: 1 });
  }
  LM.lastFrame = now;

  // ---- weather (issues) ----
  if (O.has('issues') && !view.hc) {
    for (const D of vis.districts.values()) {
      if (!D.n) continue;
      const sev = Math.min(1, (D.blocked * 2.5 + D.stale) / Math.max(2, (D.built || D.n) * 0.3));
      if (sev < 0.1) continue;
      const breached = D.blocked >= 2 || (D.blocked >= 1 && D.stale >= 2);
      const [cx, cy] = LM.toScreen(D.cx, D.cy);
      const drift = view.reduce ? 0 : now / 9000;
      const R = Math.max(22, Math.sqrt(D.n) * k * (lod === 0 ? 1.8 : 1.2));
      for (let i = 0; i < 3; i++) {
        const ox = Math.cos(drift + i * 2.1) * R * 0.35, oy = Math.sin(drift * 1.3 + i * 1.7) * R * 0.2;
        const g = ctx.createRadialGradient(cx + ox, cy + oy - R * 0.2, 0, cx + ox, cy + oy - R * 0.2, R * (0.7 + 0.2 * i));
        const col = breached ? mix(T.coral, T.black, 0.35) : D.blocked ? mix(T.amber, T.black, 0.4) : mix(T.white, T.black, 0.45);
        g.addColorStop(0, rgba(col, 0.5 * sev)); g.addColorStop(0.6, rgba(col, 0.22 * sev)); g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx + ox, cy + oy - R * 0.2, R, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // ---- labels (attention budget: at most 12 above body size; priority order) ----
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const placed = [];
  const fits = (x, y, w, h) => !placed.some((p) => Math.abs(p.x - x) < (p.w + w) / 2 + 6 && Math.abs(p.y - y) < (p.h + h) / 2 + 4);
  const put = (x, y, text, size, color, weight = 500, glow = true) => {
    ctx.font = `${weight} ${size}px Sora, Figtree, system-ui, sans-serif`;
    const w = ctx.measureText(text).width;
    if (!fits(x, y, w, size)) return false;
    if (x + w / 2 < 0 || x - w / 2 > W || y < 0 || y > H) return false;
    placed.push({ x, y, w, h: size });
    if (glow) { ctx.lineWidth = Math.max(3, size * 0.3); ctx.strokeStyle = rgba(T.black, 0.75); ctx.lineJoin = 'round'; ctx.strokeText(text, x, y); }
    ctx.fillStyle = color; ctx.fillText(text, x, y);
    return true;
  };
  let big = 0;
  // land names
  if (lod <= 2) {
    const ls = landsSorted.slice().sort((a, b) => b.n - a.n);
    for (const L of ls) {
      const info = LM.landInfo(ds, view.lens, L.key);
      const [x, y] = LM.toScreen(L.cx, L.cy);
      const wpx = Math.sqrt(L.n) * k * 2.2;
      if (wpx < 44 && lod > 0) continue;
      const size = lod === 0 ? Math.min(22, Math.max(13, wpx / 7)) : 17;
      const dim = traceLands && !traceLands.has(L.key) ? 0.4 : 1;
      if (big < 12 && put(x, y + size * 0.35, info.name, size, rgba(T.white, 0.96 * dim), 600)) big++;
    }
  }
  // district names
  if (lod >= 1 && lod <= 2) {
    const dsorted = [...vis.districts.values()].sort((a, b) => b.n - a.n);
    for (const D of dsorted) {
      const wpx = Math.sqrt(D.n) * k * 2.2;
      if (wpx < 70) continue;
      const [x, y] = LM.toScreen(D.cx, D.cy);
      const name = LM.distName(ds, view.lens, D.key);
      const dim = traceLands && !traceLands.has(D.land) ? 0.4 : 1;
      if (big < 12 && put(x, y - (D.lift || 0) + 4, name.length > 34 ? name.slice(0, 32) + '…' : name, 13, rgba(T.white, 0.9 * dim), 500)) big++;
    }
  }
  labelCands.sort((a, b) => b.pri - a.pri);
  let n = 0, mons = 0, low = 0;
  for (const c of labelCands) {
    if (n >= 12) break;
    if (c.mon && c.pri < 100 && mons >= 3) continue;
    if (c.mon && c.pri < 100) mons++;
    if (!c.mon && !c.gold && c.pri < 50 && low >= 5) continue;
    if (!c.mon && !c.gold && c.pri < 50) low++;
    const text = c.text.length > 44 ? c.text.slice(0, 42) + '…' : c.text;
    if (put(c.x, c.y, text, c.mon ? 12.5 : 12.5, c.gold ? rgba(T.gold, 1) : c.mon ? rgba(T.gold, 0.95) : rgba(T.white, 0.95), c.pri >= 90 ? 600 : 500)) n++;
  }
  if (LM.lensAnim || view.playing || LM.flight) LM.needsFrame = true;
};

function drawMonument(ctx, sx, sy, k, v, dim, now, lod) {
  const T = LM.theme;
  const big = v.mon.who === 'owner';
  const h = Math.max(4, k * (big ? 0.95 : 0.7)), w = Math.max(1.5, k * (big ? 0.17 : 0.12));
  ctx.save(); ctx.globalAlpha = dim;
  ctx.fillStyle = rgba(mix(T.gold, T.black, 0.45), 0.95);
  ctx.beginPath(); ctx.moveTo(sx - w, sy); ctx.lineTo(sx + w, sy); ctx.lineTo(sx + w * 0.55, sy - h); ctx.lineTo(sx - w * 0.55, sy - h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rgba(T.gold, 0.95); ctx.fillRect(sx - w * 0.55, sy - h - w * 0.6, w * 1.1, w * 0.6);
  if (lod >= 2) { ctx.beginPath(); ctx.ellipse(sx, sy + 1, w * 2, w * 0.8, 0, 0, Math.PI * 2); ctx.fillStyle = rgba(T.black, 0.3); ctx.fill(); }
  if (v.mon.who === 'owner') { ctx.beginPath(); ctx.arc(sx, sy - h - w * 1.4, Math.max(1.2, w * 0.5), 0, Math.PI * 2); ctx.fillStyle = rgba(T.gold, 1); ctx.fill(); }
  ctx.restore();
}
function drawLandmark(ctx, sx, sy, k, v, dim, now) {
  const T = LM.theme;
  const h = Math.max(10, k * 2.4), w = Math.max(3, k * 0.5);
  ctx.save(); ctx.globalAlpha = dim;
  const g = ctx.createRadialGradient(sx, sy - h, 0, sx, sy - h, h * 0.9);
  g.addColorStop(0, rgba(T.gold, 0.35)); g.addColorStop(1, rgba(T.gold, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy - h, h * 0.9, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = rgba(mix(T.gold, T.white, 0.2), 0.98);
  ctx.beginPath(); ctx.moveTo(sx - w, sy); ctx.lineTo(sx + w, sy); ctx.lineTo(sx, sy - h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rgba(mix(T.gold, T.black, 0.35), 0.9);
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + w, sy); ctx.lineTo(sx, sy - h); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(sx, sy - h, Math.max(1.5, w * 0.45), 0, Math.PI * 2); ctx.fillStyle = rgba(T.white, 1); ctx.fill();
  ctx.restore();
}

/** Hit test: the building, monument or landmark whose plot contains the world point, else the district, else the land. */
LM.hit = function hit(sx, sy) {
  const vis = LM.vis; if (!vis) return null;
  const [wx, wy] = LM.toWorld(sx, sy);
  const [q, r] = LM.xyHex(wx, wy);
  // account for extrusion: test the plot under the point and the few plots below it
  for (let dr = 0; dr <= 2; dr++) {
    const v = vis.items.find((v) => v.r === r + dr && v.q === q - Math.ceil(dr / 2) + (dr === 1 ? 0 : 0));
    if (v) return v;
  }
  for (const D of vis.districts.values()) if (D.cells.has(q + ',' + r)) return { district: D };
  for (const L of vis.lands.values()) if (L.cells.has(q + ',' + r)) return { land: L };
  return null;
};
