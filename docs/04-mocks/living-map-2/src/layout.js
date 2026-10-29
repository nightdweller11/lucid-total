/* The living map: growth. A hexagonal plot field per lens; buildings claim plots next to their kin in birth order;
 * layout is a pure function of the event log (docs/17 LM-G). Hulls are the boundary of a plot set, chained and
 * rounded. */
const SQ3 = Math.sqrt(3);
LM.DIRS = [[0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1], [1, 0]]; // edge i (corner i -> i+1) faces DIRS[i]
LM.hexXY = (q, r) => [SQ3 * (q + r / 2), 1.5 * r];
LM.hexCorner = (x, y, i, s = 1) => { const a = Math.PI / 6 + (Math.PI / 3) * i; return [x + s * Math.cos(a), y + s * Math.sin(a)]; };
LM.xyHex = (x, y) => {
  const q = (SQ3 / 3) * x - y / 3, r = (2 / 3) * y;
  let rq = Math.round(q), rr = Math.round(r), rs = Math.round(-q - r);
  const dq = Math.abs(rq - q), dr = Math.abs(rr - r), dsv = Math.abs(rs - (-q - r));
  if (dq > dr && dq > dsv) rq = -rr - rs; else if (dr > dsv) rr = -rq - rs;
  return [rq, rr];
};
const key = (q, r) => q + ',' + r;
const hash = (a, b, c) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const hexDist = (q1, r1, q2, r2) => (Math.abs(q1 - q2) + Math.abs(r1 - r2) + Math.abs(q1 + r1 - q2 - r2)) / 2;

/** Grow a lens-world from the dataset. */
LM.grow = function grow(ds, lens) {
  const cfg = ds.lenses[lens];
  const spacing = cfg.spacing || 24;
  const occ = new Map(); // key -> { it, park }
  const lands = new Map();
  const districts = new Map();
  const claims = [];
  const parks = [];
  // the plaza: the capital square where company-wide monuments stand
  for (let q = -2; q <= 2; q++) for (let r = -2; r <= 2; r++) if (hexDist(0, 0, q, r) <= 2) occ.set(key(q, r), { plaza: true });

  const seedFor = (k) => {
    const ang = k * 2.399963, rad = spacing * (0.95 + 0.92 * Math.sqrt(k));
    const [q0, r0] = LM.xyHex(Math.cos(ang) * rad, Math.sin(ang) * rad * 0.92);
    // nearest plot with nothing claimed within spacing * 0.3
    for (let ring = 0; ring < spacing; ring++) {
      for (let q = q0 - ring; q <= q0 + ring; q++) for (let r = r0 - ring; r <= r0 + ring; r++) {
        if (hexDist(q0, r0, q, r) !== ring) continue;
        if (occ.has(key(q, r))) continue;
        let clear = true;
        const m = Math.ceil(spacing * 0.3);
        for (let dq = -m; dq <= m && clear; dq++) for (let dr = -m; dr <= m; dr++) if (hexDist(q, r, q + dq, r + dr) <= m && occ.has(key(q + dq, r + dr)) && !occ.get(key(q + dq, r + dr)).plaza) { clear = false; break; }
        if (clear) return [q, r];
      }
    }
    return [q0, r0];
  };
  const seedBeside = (P) => {
    const cx = P.sx / P.n, cy = P.sy / P.n;
    const len = Math.hypot(cx, cy) || 1, ux = cx / len, uy = cy / len;
    const dist = Math.sqrt(P.n) * 1.35 + 5;
    const [q0, r0] = LM.xyHex(cx + ux * dist, cy + uy * dist);
    for (let ring = 0; ring < 40; ring++) for (let q = q0 - ring; q <= q0 + ring; q++) for (let r = r0 - ring; r <= r0 + ring; r++) {
      if (hexDist(q0, r0, q, r) !== ring || occ.has(key(q, r))) continue;
      let clear = true;
      for (let dq = -2; dq <= 2 && clear; dq++) for (let dr = -2; dr <= 2; dr++) if (hexDist(q, r, q + dq, r + dr) <= 2 && occ.has(key(q + dq, r + dr))) { clear = false; break; }
      if (clear) return [q, r];
    }
    return [q0, r0];
  };
  const land = (g, parent) => {
    let L = lands.get(g);
    if (!L) { const [q, r] = parent && lands.get(parent) && lands.get(parent).n ? seedBeside(lands.get(parent)) : seedFor(lands.size); L = { key: g, cells: new Set(), sx: 0, sy: 0, n: 0, seed: [q, r], order: lands.size, districts: new Set(), born: Infinity, parent: parent || null }; lands.set(g, L); }
    return L;
  };
  const district = (d, L) => {
    let D = districts.get(d);
    if (!D) { D = { key: d, land: L.key, cells: new Set(), sx: 0, sy: 0, n: 0, born: Infinity, square: null }; districts.set(d, D); L.districts.add(d); }
    return D;
  };
  const add = (S, q, r) => { const [x, y] = LM.hexXY(q, r); S.cells.add(key(q, r)); S.sx += x; S.sy += y; S.n++; };
  const centroid = (S) => (S.n ? [S.sx / S.n, S.sy / S.n] : null);

  const claim = (it, g, d, t, kind, dec, ms, parent) => {
    const L = land(g, parent);
    const D = district(d, L);
    L.born = Math.min(L.born, t); D.born = Math.min(D.born, t);
    const dc = centroid(D), lc = centroid(L);
    let best = null, bestScore = Infinity;
    const consider = (q, r) => {
      const k = key(q, r);
      if (occ.has(k)) return;
      const [x, y] = LM.hexXY(q, r);
      const sd = dc ? Math.hypot(x - dc[0], y - dc[1]) : lc ? Math.hypot(x - lc[0], y - lc[1]) : 0;
      const sl = lc ? Math.hypot(x - lc[0], y - lc[1]) : 0;
      const score = sd + 0.3 * sl + 0.9 * hash(q, r, L.order + 1) + (lc ? 0 : hexDist(q, r, L.seed[0], L.seed[1]));
      if (score < bestScore) { bestScore = score; best = [q, r]; }
    };
    const frontier = (S) => { for (const c of S.cells) { const [q, r] = c.split(',').map(Number); for (const [dq, dr] of LM.DIRS) consider(q + dq, r + dr); } };
    if (D.n) frontier(D);
    if (!best && L.n) frontier(L);
    if (!best) {
      // the seed, or the nearest free plot to it
      const [q0, r0] = L.seed;
      for (let ring = 0; ring < 60 && !best; ring++) for (let q = q0 - ring; q <= q0 + ring && !best; q++) for (let r = r0 - ring; r <= r0 + ring; r++) {
        if (hexDist(q0, r0, q, r) === ring && !occ.has(key(q, r))) { best = [q, r]; break; }
      }
    }
    const [q, r] = best;
    occ.set(key(q, r), { it, dec, ms });
    add(L, q, r); add(D, q, r);
    if (!D.square) D.square = [q, r];
    const c = { t, q, r, it, g, d, kind, dec, ms };
    claims.push(c);
    if (it) { (it.cells || (it.cells = {}))[lens] = (it.cells[lens] || []); it.cells[lens].push(c); }
  };

  const majority = (ids, t) => {
    const count = new Map();
    for (const id of ids) { const it = ds.byId.get(id); if (!it || it.b > t + 45 * LM.DAY) continue; const { g, d } = LM.groupAt(it, lens, Math.max(t, it.b)); const k = g + '|' + d; count.set(k, (count.get(k) || 0) + 1); }
    let best = null, bn = 0;
    for (const [k, n] of count) if (n > bn) { bn = n; best = k; }
    return best ? best.split('|') : null;
  };
  const events = [];
  for (const dec of ds.decisions) {
    const m = majority(dec.lin, dec.b);
    let g, d;
    if (m) { [g, d] = m; } else { g = (dec.home && dec.home[lens]) || '_co'; d = g + ':decisions'; }
    events.push({ t: dec.b, i: 1e6 + dec.i, dec, g, d });
  }
  ds.milestones.forEach((ms, i) => { const g = (ms.land && ms.land[lens]) || '_co'; events.push({ t: ms.t, i: 2e6 + i, ms, g, d: g + ':landmarks' }); });
  for (const it of ds.items) {
    const g0 = it.g0 && it.g0[lens] !== undefined ? it.g0[lens] : it.g[lens];
    const d0 = it.d0 && it.d0[lens] !== undefined ? it.d0[lens] : it.d[lens];
    events.push({ t: it.b, i: it.i, birth: true, it, g: g0, d: d0 });
    for (const mv of it.moves || []) if (mv.lens === lens) events.push({ t: mv.t, i: it.i, it, g: mv.g, d: mv.d });
  }
  events.sort((a, b) => a.t - b.t || a.i - b.i);
  for (const e of events) {
    if (e.dec) {
      const L = land(e.g); const D = district(e.d, L);
      if (!D.plaza) { claim(null, e.g, e.d, e.t, 'square'); D.plaza = claims[claims.length - 1]; D.monN = 0; }
      const idx = D.monN++;
      const c = { t: e.t, q: D.plaza.q, r: D.plaza.r, it: null, g: e.g, d: e.d, kind: 'monument', dec: e.dec, idx };
      claims.push(c);
      continue;
    }
    if (e.ms) { claim(null, e.g, e.d, e.t, 'landmark', null, e.ms); continue; }
    if (!e.birth) {
      const prev = e.it.cells[lens][e.it.cells[lens].length - 1];
      occ.set(key(prev.q, prev.r), { it: e.it, park: true });
      parks.push({ t: e.t, q: prev.q, r: prev.r, g: prev.g, d: prev.d });
    }
    claim(e.it, e.g, e.d, e.t, e.birth ? 'birth' : 'move', null, null, e.birth ? null : e.it.cells[lens][e.it.cells[lens].length - 1].g);
  }
  // squares: the first plot of each district; land centre: centroid
  const world = { lens, ds, lands, districts, claims, parks, spacing, hullCache: new Map() };
  // extent
  let minx = 0, maxx = 0, miny = 0, maxy = 0;
  for (const c of claims) { const [x, y] = LM.hexXY(c.q, c.r); minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y); }
  world.extent = { minx, maxx, miny, maxy };
  return world;
};

/** Hull rings of a set of cells (keys "q,r"): arrays of [x,y] world points. Cached by set signature. */
LM.rings = function rings(cells) {
  const edges = new Map(); // start key -> [{to, cell}]
  const pts = (q, r) => { const [x, y] = LM.hexXY(q, r); const out = []; for (let i = 0; i < 6; i++) out.push(LM.hexCorner(x, y, i)); return out; };
  const pk = (p) => Math.round(p[0] * 100) + ',' + Math.round(p[1] * 100);
  for (const c of cells) {
    const [q, r] = c.split(',').map(Number);
    const P = pts(q, r);
    for (let i = 0; i < 6; i++) {
      const [dq, dr] = LM.DIRS[i];
      if (cells.has(key(q + dq, r + dr))) continue;
      const a = P[i], b = P[(i + 1) % 6];
      const k = pk(a);
      if (!edges.has(k)) edges.set(k, []);
      edges.get(k).push({ a, b, cell: c });
    }
  }
  const out = [];
  const used = new Set();
  for (const [k0, list] of edges) {
    for (const e0 of list) {
      if (used.has(e0)) continue;
      const ring = [];
      let e = e0, guard = 0;
      while (e && !used.has(e) && guard++ < 100000) {
        used.add(e);
        ring.push(e.a);
        const next = edges.get(pk(e.b)) || [];
        e = next.find((n) => !used.has(n) && n.cell === e.cell) || next.find((n) => !used.has(n));
      }
      if (ring.length > 2) out.push(ring);
    }
  }
  return out;
};

/** Visible state of a lens-world at time t. */
LM.visible = function visible(world, t) {
  const ds = world.ds;
  const items = [];
  const lands = new Map();
  const districts = new Map();
  const landOf = (g) => { let L = lands.get(g); if (!L) { const W = world.lands.get(g); L = { key: g, cells: new Set(), sx: 0, sy: 0, n: 0, done: 0, blocked: 0, working: 0, fresh: 0, stale: 0, cost: 0, items: [], seed: W.seed, order: W.order, ghost: 0, age: 0, size: 0, doneSize: 0, agent: 0, parent: W.parent }; lands.set(g, L); } return L; };
  const distOf = (d, g) => { let D = districts.get(d); if (!D) { const W = world.districts.get(d); D = { key: d, land: g, cells: new Set(), sx: 0, sy: 0, n: 0, done: 0, blocked: 0, working: 0, fresh: 0, stale: 0, cost: 0, items: [], square: W.square, remaining: 0, ghost: 0, age: 0, size: 0, doneSize: 0, agent: 0, born: W.born }; districts.set(d, D); } return D; };
  const addCell = (S, q, r) => { const [x, y] = LM.hexXY(q, r); S.cells.add(key(q, r)); S.sx += x; S.sy += y; S.n++; };
  for (const c of world.claims) {
    if (c.t > t) break;
    if (c.dec || c.ms || c.kind === 'square') {
      const [x0, y0] = LM.hexXY(c.q, c.r);
      const L = landOf(c.g), D = distOf(c.d, c.g);
      if (!c.dec) { addCell(L, c.q, c.r); addCell(D, c.q, c.r); }
      let v;
      if (c.dec) { const a = c.idx * 2.39996, rad = Math.min(1.15, 0.26 * Math.sqrt(c.idx)); v = { mon: c.dec, q: c.q, r: c.r, x: x0 + Math.cos(a) * rad, y: y0 + Math.sin(a) * rad * 0.9, g: c.g, d: c.d, t: c.t, idx: c.idx }; }
      else if (c.ms) v = { lm: c.ms, q: c.q, r: c.r, x: x0, y: y0, g: c.g, d: c.d, t: c.t };
      else v = { square: true, q: c.q, r: c.r, x: x0, y: y0, g: c.g, d: c.d, t: c.t };
      items.push(v); L.items.push(v); D.items.push(v);
      continue;
    }
    const it = c.it;
    const cells = it.cells[world.lens];
    // the current plot is the latest claim at or before t
    let cur = cells[0];
    for (const cc of cells) if (cc.t <= t) cur = cc;
    if (cur !== c) continue; // this claim has been superseded by a move (its plot is a park)
    const st = LM.stateAt(ds, it, t);
    if (!st) continue;
    const [x, y] = LM.hexXY(c.q, c.r);
    const L = landOf(c.g), D = distOf(c.d, c.g);
    addCell(L, c.q, c.r); addCell(D, c.q, c.r);
    const v = { it, st, q: c.q, r: c.r, x, y, g: c.g, d: c.d, t: c.t };
    items.push(v); L.items.push(v); D.items.push(v);
    for (const S of [L, D]) {
      S.built = (S.built || 0) + 1;
      if (st.done) S.done++; if (st.blocked) S.blocked++; if (st.working) S.working++; if (st.fresh) S.fresh++; if (st.stale) S.stale++; if (st.ghost) S.ghost++;
      S.cost += st.cost; S.remaining = (S.remaining || 0) + (st.dropped ? 0 : (1 - st.h) * it.s); S.age += t - c.t; S.size += it.s; S.doneSize += st.done ? it.s : it.s * st.h; S.agent += it.agent ? 1 : 0;
    }
  }
  for (const p of world.parks) {
    if (p.t > t) break;
    const L = lands.get(p.g), D = districts.get(p.d);
    if (L) addCell(L, p.q, p.r);
    if (D) addCell(D, p.q, p.r);
    items.push({ park: true, q: p.q, r: p.r, x: LM.hexXY(p.q, p.r)[0], y: LM.hexXY(p.q, p.r)[1], g: p.g, d: p.d, t: p.t });
  }
  for (const S of [...lands.values(), ...districts.values()]) { S.cx = S.sx / S.n; S.cy = S.sy / S.n; }
  return { t, items, lands, districts };
};

LM.hullOf = function hullOf(world, S) {
  const k = S.key + '|' + S.n;
  let h = world.hullCache.get(k);
  if (!h) { h = LM.rings(S.cells); world.hullCache.set(k, h); }
  return h;
};
