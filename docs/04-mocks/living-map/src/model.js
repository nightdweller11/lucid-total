/* The living map: model. Datasets, time derivation, per-item state at any instant.
 *
 * Dataset format (normalised; produced by gen/normalise-lucid.mjs and gen/example.mjs):
 *   key, name, sub, span:[t0,t1], now, synthetic:[...], win:{fresh,stale} (ms, optional)
 *   lenses: { <lens>: { name, spacing, lands: { <landKey>: { name, sub, glyph, hue, lm, from? } } } }
 *   districts: { <lens>: { <districtKey>: { name } } }
 *   items: [{ id, n, k, s(1..5), f(facade), b(born), g:{<lens>:landKey}, d:{<lens>:districtKey},
 *             moves?:[{t,lens,g,d}], st:[[t,status]...], dep:[ids], dec, rooms, owner, agent?, cost(rate/day), forecast? }]
 *   decisions: [{ id, n, b, who, refs:[ids] }]   milestones: [{ t, n, land:{<lens>:landKey}, dec? }]
 *   revenue: [{ t, prod, amount }]   secession?, crisis?
 */
const LM = (window.LM = window.LM || {});
LM.DAY = 86400e3;

LM.STATUS_ORDER = { todo: 0, doing: 1, blocked: 1.5, review: 2, done: 3, dropped: 4 };

LM.prepare = function prepare(ds) {
  if (ds._ready) return ds;
  ds.byId = new Map();
  ds.win = ds.win || (ds.key === 'lucid' ? { fresh: 0.5 * LM.DAY, stale: 2.5 * LM.DAY } : { fresh: 10 * LM.DAY, stale: 60 * LM.DAY });
  ds.items.forEach((it, i) => {
    it.i = i;
    ds.byId.set(it.id, it);
    // clean: a done never regresses to todo (table noise in the real log)
    const st = [];
    for (const s of it.st) {
      const prev = st[st.length - 1];
      if (prev && prev[1] === 'done' && s[1] === 'todo') continue;
      if (prev && prev[1] === s[1]) continue;
      st.push(s);
    }
    it.st = st;
    // segments with height ramps
    const typical = (it.s * 1.6 + 1) * (ds.key === 'lucid' ? 0.35 : 1) * LM.DAY;
    it.seg = [];
    let h = 0, cost = 0;
    for (let k = 0; k < st.length; k++) {
      const [t0, s] = st[k];
      const t1 = k + 1 < st.length ? st[k + 1][0] : Infinity;
      let h0 = h, h1 = h;
      if (s === 'todo') { h0 = 0.06; h1 = 0.06; }
      else if (s === 'doing') { h0 = Math.max(h, 0.15); h1 = isFinite(t1) ? 0.86 : Math.min(0.86, h0 + (0.86 - h0) * 0.7); }
      else if (s === 'blocked') { h0 = h; h1 = h; }
      else if (s === 'review') { h0 = 0.9; h1 = 0.9; }
      else if (s === 'done') { h0 = 1; h1 = 1; }
      else if (s === 'dropped') { h0 = 0; h1 = 0; }
      const dur = isFinite(t1) ? t1 - t0 : typical;
      it.seg.push({ t0, t1, s, h0, h1, dur, cost0: cost });
      if (s === 'doing' || s === 'review') cost += (it.cost || 0) * (dur / LM.DAY);
      h = h1;
    }
    it.doneAt = (st.find((s) => s[1] === 'done') || [])[0];
    it.end = st[st.length - 1][0];
    it.last = st[st.length - 1][1];
    it.vh = 0; // visual height chasing the model height
    it.vlit = 0;
  });
  ds.decisions.forEach((d, i) => { d.i = i; d.kind = 'decision'; });
  for (const d of ds.decisions) d.lin = LM.lineage(ds, d);
  ds.milestones = ds.milestones || [];
  ds.revenue = ds.revenue || [];
  ds.events = [];
  for (const it of ds.items) {
    ds.events.push({ t: it.b, kind: 'birth', it });
    for (const s of it.st.slice(1)) ds.events.push({ t: s[0], kind: s[1], it });
    for (const mv of it.moves || []) ds.events.push({ t: mv.t, kind: 'move', it, mv });
  }
  for (const d of ds.decisions) ds.events.push({ t: d.b, kind: 'decision', d });
  for (const m of ds.milestones) ds.events.push({ t: m.t, kind: 'milestone', m });
  ds.events.sort((a, b) => a.t - b.t);
  ds._ready = true;
  return ds;
};

/** The segment of an item at time t, or null before birth. */
LM.segAt = function segAt(it, t) {
  if (t < it.b) return null;
  const seg = it.seg;
  let lo = 0, hi = seg.length - 1;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (seg[mid].t0 <= t) lo = mid; else hi = mid - 1; }
  return seg[lo];
};

/** State of an item at t: status, model height 0..1, light 0..1, blocked, stale, fresh, cost. */
LM.stateAt = function stateAt(ds, it, t) {
  const sg = LM.segAt(it, t);
  if (!sg) return null;
  const f = Math.max(0, Math.min(1, (t - sg.t0) / sg.dur));
  const h = sg.h0 + (sg.h1 - sg.h0) * f;
  const working = sg.s === 'doing' || sg.s === 'review';
  const cost = sg.cost0 + (working ? (it.cost || 0) * ((t - sg.t0) / LM.DAY) : 0);
  const lastChange = sg.t0;
  return {
    s: sg.s, h, lit: sg.s === 'done' ? 1 : sg.s === 'review' ? 0.8 : sg.s === 'doing' ? h * 0.7 : 0,
    blocked: sg.s === 'blocked', done: sg.s === 'done', dropped: sg.s === 'dropped',
    fresh: t - lastChange < ds.win.fresh, stale: !sg.done && sg.s !== 'done' && sg.s !== 'dropped' && t - lastChange > ds.win.stale,
    cost, working, ghost: it.forecast && t > ds.now ? true : false,
  };
};

/** Land key and district key of an item in a lens at time t (moves applied). */
LM.groupAt = function groupAt(it, lens, t) {
  let g = it.g[lens], d = it.d[lens];
  if (it.g0 && it.g0[lens] !== undefined && t < (it.moves || []).find((m) => m.lens === lens)?.t) { g = it.g0[lens]; d = it.d0[lens]; }
  if (it.moves) for (const mv of it.moves) if (mv.lens === lens && mv.t <= t) { g = mv.g; d = mv.d; }
  return { g, d };
};

LM.fmtDate = function fmtDate(t, long) {
  const d = new Date(t);
  const opts = long ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' } : { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleString(undefined, opts);
};

/** Descendants of a decision: items that cite it, plus their follow-ups (id prefix) and dependants' chain is not followed. */
LM.lineage = function lineage(ds, dec) {
  const set = new Set(dec.refs || []);
  for (const it of ds.items) if (it.dec === dec.id) set.add(it.id);
  for (const it of ds.items) for (const r of Array.from(set)) if (it.id !== r && it.id.startsWith(r + '-')) set.add(it.id);
  return set;
};
