/* The living map: model. Datasets, time derivation, per-item state at any instant, changes since a moment, and the
 * event stream the feed and the in-place cards read.
 *
 * Dataset format (normalised; produced by gen/normalise-lucid.mjs and gen/example.mjs):
 *   key, name, sub, span:[t0,t1], now, synthetic:[...], win:{fresh,stale} (ms, optional)
 *   lenses: { <lens>: { name, spacing, lands: { <landKey>: { name, sub, glyph, hue, lm, from? } } } }
 *   districts: { <lens>: { <districtKey>: { name } } }
 *   items: [{ id, n, k, s(1..5), f(facade), b(born), g:{<lens>:landKey}, d:{<lens>:districtKey},
 *             moves?:[{t,lens,g,d}], st:[[t,status]...], dep:[ids], dec, rooms, owner, agent?, cost(rate/day), forecast? }]
 *   decisions: [{ id, n, b, who, refs:[ids], home:{<lens>:landKey} }]   milestones: [{ t, n, land:{<lens>:landKey}, dec? }]
 *   revenue: [{ t, prod, amount }]   secession?, crisis?
 */
const LM = (window.LM = window.LM || {});
LM.DAY = 86400e3;
LM.STATUS_ORDER = { todo: 0, doing: 1, blocked: 1.5, review: 2, done: 3, dropped: 4 };
LM.STATUS_WORD = { todo: 'Planned', doing: 'Rising', review: 'In review', blocked: 'Blocked', done: 'Lit', dropped: 'Set aside', brief: 'Briefed' };

LM.prepare = function prepare(ds) {
  if (ds._ready) return ds;
  ds.byId = new Map();
  ds.win = ds.win || (ds.key === 'lucid' ? { fresh: 0.5 * LM.DAY, stale: 2.5 * LM.DAY, review: 2 * LM.DAY } : { fresh: 10 * LM.DAY, stale: 60 * LM.DAY, review: 7 * LM.DAY });
  ds.win.review = ds.win.review || 7 * LM.DAY;
  ds.items.forEach((it, i) => {
    it.i = i;
    ds.byId.set(it.id, it);
    const st = [];
    for (const s of it.st) {
      const prev = st[st.length - 1];
      if (prev && prev[1] === 'done' && s[1] === 'todo') continue;
      if (prev && prev[1] === s[1]) continue;
      if (s[1] === 'brief') s[1] = 'todo';
      st.push(s);
    }
    it.st = st;
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
    it.vh = 0; it.vlit = 0;
    it.short = LM.shortName(it.n);
  });
  ds.decisions.forEach((d, i) => { d.i = i; d.kind = 'decision'; });
  for (const d of ds.decisions) d.lin = LM.lineage(ds, d);
  ds.milestones = ds.milestones || [];
  ds.revenue = ds.revenue || [];
  ds.people = ds.people || [];
  // the event stream, with an importance 0..100 (docs/17 LM-F)
  ds.events = [];
  for (const it of ds.items) {
    ds.events.push({ t: it.b, kind: 'birth', it, imp: 12 + it.s * 2 });
    for (const s of it.st.slice(1)) ds.events.push({ t: s[0], kind: s[1], it, imp: ({ doing: 18 + it.s * 2, review: 26 + it.s * 2, blocked: 55 + it.s * 4, done: 36 + it.s * 7, dropped: 30, todo: 10 })[s[1]] || 10 });
    for (const mv of it.moves || []) ds.events.push({ t: mv.t, kind: 'move', it, mv, imp: 50 });
  }
  for (const d of ds.decisions) ds.events.push({ t: d.b, kind: 'decision', d, imp: d.who === 'owner' ? 92 : 62 + Math.min(20, d.lin.size * 2) });
  for (const m of ds.milestones) ds.events.push({ t: m.t, kind: 'milestone', m, imp: 96 });
  if (ds.crisis) { ds.events.push({ t: ds.crisis.from, kind: 'crisis', crisis: ds.crisis, imp: 97 }); ds.events.push({ t: ds.crisis.to, kind: 'calm', crisis: ds.crisis, imp: 80 }); }
  if (ds.secession) ds.events.push({ t: ds.secession.t, kind: 'secession', sec: ds.secession, imp: 98 });
  // lands forming (per lens) are world events too: the first building of a land
  for (const lens of Object.keys(ds.lenses)) {
    const seen = new Set();
    for (const it of ds.items.slice().sort((a, b) => a.b - b.b)) {
      const g = it.g0 && it.g0[lens] !== undefined ? it.g0[lens] : it.g[lens];
      if (seen.has(g)) continue; seen.add(g);
      ds.events.push({ t: it.b, kind: 'land', lens, g, it, imp: 84 });
    }
  }
  ds.events.sort((a, b) => a.t - b.t);
  ds._ready = true;
  return ds;
};

LM.shortName = function shortName(n) {
  let s = String(n).replace(/^[A-Z0-9][A-Z0-9-]*\s*·\s*/, '');
  const m = /^([A-Za-z0-9/+ -]{1,6}):\s*(.+)$/.exec(s); if (m) s = m[2];
  s = s.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  const cut = s.search(/[:;]/); if (cut > 14) s = s.slice(0, cut);
  if (s.length > 40) s = s.slice(0, 38).replace(/\s+\S*$/, '') + '…';
  return s || String(n).slice(0, 38);
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
    fresh: t - lastChange < ds.win.fresh, stale: sg.s !== 'done' && sg.s !== 'dropped' && t - lastChange > ds.win.stale,
    cost, working, ghost: it.forecast && t > ds.now ? true : false, since: lastChange,
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
LM.fmtShort = (t) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
/** Relative to a reference moment: "2 h ago", "3 d ago", "in 4 d". */
LM.rel = function rel(t, ref) {
  const d = ref - t, a = Math.abs(d), s = d >= 0 ? 'ago' : 'ahead';
  if (a < 3600e3) return `${Math.max(1, Math.round(a / 60e3))} min ${s}`;
  if (a < LM.DAY) return `${Math.round(a / 3600e3)} h ${s}`;
  if (a < 30 * LM.DAY) return `${Math.round(a / LM.DAY)} d ${s}`;
  if (a < 365 * LM.DAY) return `${Math.round(a / (30 * LM.DAY))} mo ${s}`;
  return `${(a / (365 * LM.DAY)).toFixed(1)} y ${s}`;
};
LM.dur = (ms) => { const a = Math.abs(ms); if (a < 3600e3) return `${Math.max(1, Math.round(a / 60e3))} min`; if (a < LM.DAY) return `${Math.round(a / 3600e3)} h`; if (a < 30 * LM.DAY) return `${Math.round(a / LM.DAY)} days`; if (a < 365 * LM.DAY) return `${Math.round(a / (30 * LM.DAY))} months`; return `${(a / (365 * LM.DAY)).toFixed(1)} years`; };
LM.fmtMoney = (v) => (v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}k` : `$${Math.round(v)}`);

/** Descendants of a decision: items that cite it, plus their follow-ups (id prefix). */
LM.lineage = function lineage(ds, dec) {
  const set = new Set(dec.refs || []);
  for (const it of ds.items) if (it.dec === dec.id) set.add(it.id);
  for (const it of ds.items) for (const r of Array.from(set)) if (it.id !== r && it.id.startsWith(r + '-')) set.add(it.id);
  return set;
};

/** Rooms of a building: named criteria, with met/partly/open by the model height (synthetic names; docs/04-mocks README). */
LM.rooms = function rooms(it, st) {
  const names = it.k === 'chore' ? ['Started', 'Account or access', 'Checked', 'Recorded', 'Told', 'Closed', 'Reviewed', 'Filed']
    : ['Built', 'Tests pass', 'Lint and types', 'Docs written', it.walk ? 'Walkthrough' : 'Reviewed', 'Merged', 'Load test', 'Evidence attached'];
  const n = Math.max(2, Math.min(8, it.rooms || 4));
  const h = st ? st.h : 0;
  const met = Math.floor(n * h + 1e-6), partly = n * h - met > 0.25 ? 1 : 0;
  return Array.from({ length: n }, (_, i) => ({ name: names[i % names.length], st: st && st.done ? 'met' : i < met ? 'met' : i < met + partly ? 'partly' : 'open' }));
};

/** Avatar for an owner name: initial and a stable hue class p1..p4 (agents say they are agents). */
LM.who = function who(it) {
  const name = it.owner || '';
  const agent = !!it.agent && !/yossi|noa|dana|omer|owner/i.test(name) ? true : !!it.agent && /opus|fable|sonnet|crew|agent|worker/i.test(name);
  let h = 0; for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return { name: name || (agent ? 'An agent' : 'Unassigned'), agent, initial: (name[0] || '?').toUpperCase(), cls: 'p' + (1 + (h % 4)) };
};

/** What changed between t0 and t1 (exclusive, inclusive), as the "since you last looked" layer reads it.
 *  Returns { items: Map<id,{kind, from, to, it}>, places: Map<landKey,{n,new,done,blocked,progressed,moved,dropped,review}>,
 *            districts: Map<districtKey,...>, decisions:[], milestones:[], lands:[landKey], counts }. */
LM.changes = function changes(ds, lens, t0, t1) {
  const items = new Map(), places = new Map(), districts = new Map(), decisions = [], milestones = [], lands = [];
  const bump = (M, k, kind) => { let c = M.get(k); if (!c) { c = { n: 0, new: 0, done: 0, blocked: 0, progressed: 0, moved: 0, dropped: 0, review: 0 }; M.set(k, c); } c.n++; c[kind]++; };
  const rank = { done: 6, blocked: 5, dropped: 4, moved: 3, review: 2, progressed: 1, new: 0 };
  for (const e of ds.events) {
    if (e.t <= t0) continue; if (e.t > t1) break;
    if (e.kind === 'decision') { decisions.push(e.d); continue; }
    if (e.kind === 'milestone') { milestones.push(e.m); continue; }
    if (e.kind === 'land') { if (e.lens === lens) lands.push(e.g); continue; }
    if (!e.it) continue;
    const kind = e.kind === 'birth' ? 'new' : e.kind === 'doing' ? 'progressed' : e.kind === 'move' ? 'moved' : e.kind === 'todo' ? 'progressed' : e.kind;
    const cur = items.get(e.it.id);
    if (!cur || rank[kind] >= rank[cur.kind] || kind === 'new') items.set(e.it.id, { kind: cur && cur.kind === 'new' && kind !== 'new' ? 'new' : kind, it: e.it, t: e.t, last: kind });
  }
  for (const c of items.values()) {
    const s0 = LM.stateAt(ds, c.it, t0), s1 = LM.stateAt(ds, c.it, t1);
    c.from = s0 ? s0.s : null; c.to = s1 ? s1.s : null; c.h0 = s0 ? s0.h : 0; c.h1 = s1 ? s1.h : 0;
    if (c.kind === 'new' && s1 && s1.done) c.kind = 'done';
    if (c.kind === 'progressed' && s1 && s1.blocked) c.kind = 'blocked';
    const { g, d } = LM.groupAt(c.it, lens, t1);
    c.g = g; c.d = d;
    bump(places, g, c.kind); bump(districts, d, c.kind);
  }
  const counts = { n: items.size, new: 0, done: 0, blocked: 0, progressed: 0, moved: 0, dropped: 0, review: 0 };
  for (const c of items.values()) counts[c.kind]++;
  return { t0, t1, items, places, districts, decisions, milestones, lands, counts };
};

/** Events between t0 and t1 for a scope: { lens, land?, district?, minImp }. Each gets a sentence, a glyph and a place. */
LM.feedEvents = function feedEvents(ds, lens, t0, t1, scope) {
  const out = [];
  const minImp = scope.minImp || 0;
  for (const e of ds.events) {
    if (e.t <= t0) continue; if (e.t > t1) break;
    if (e.imp < minImp) continue;
    if (e.kind === 'land' && e.lens !== lens) continue;
    if (e.kind === 'land' && e.lens === lens && scope.district) continue;
    let g = null, d = null;
    if (e.it) { const gd = LM.groupAt(e.it, lens, e.t); g = gd.g; d = gd.d; }
    else if (e.d) { g = (e.d.home && e.d.home[lens]) || null; const first = [...e.d.lin].map((id) => ds.byId.get(id)).find(Boolean); if (first) { const gd = LM.groupAt(first, lens, Math.max(e.t, first.b)); g = gd.g; d = gd.d; } }
    else if (e.m) g = (e.m.land && e.m.land[lens]) || null;
    else if (e.kind === 'land') g = e.g;
    if (scope.land && g !== scope.land && !(e.kind === 'crisis' || e.kind === 'calm' || e.kind === 'secession' || e.kind === 'milestone')) continue;
    if (scope.district && d !== scope.district && e.it) continue;
    out.push({ ...e, g, dk: d });
  }
  return out;
};

/** One sentence for an event, in the voice of the ledger. */
LM.eventText = function eventText(ds, lens, e) {
  const L = (g) => (g ? LM.landInfo(ds, lens, g).name : ds.name);
  switch (e.kind) {
    case 'birth': return { glyph: 'sprout', hue: 'lime', title: e.it.short, line: `New in ${L(e.g)}`, what: 'new' };
    case 'doing': return { glyph: 'trending-up', hue: 'sky', title: e.it.short, line: `Work started · ${L(e.g)}`, what: 'progressed' };
    case 'review': return { glyph: 'eye', hue: 'ai', title: e.it.short, line: `In review · ${L(e.g)}`, what: 'review' };
    case 'done': { const n = ds.items.filter((o) => o.dep.includes(e.it.id)).length; return { glyph: 'circle-check-big', hue: 'good', title: e.it.short, line: `Lit · ${L(e.g)}${n ? ` · frees ${n}` : ''}`, what: 'done' }; }
    case 'blocked': return { glyph: 'construction', hue: 'block', title: e.it.short, line: `Blocked · ${L(e.g)}`, what: 'blocked' };
    case 'dropped': return { glyph: 'trees', hue: 'lime', title: e.it.short, line: `Set aside; its plot is a park`, what: 'dropped' };
    case 'todo': return { glyph: 'circle-dashed', hue: 'slate', title: e.it.short, line: `Back to planned · ${L(e.g)}`, what: 'progressed' };
    case 'move': return { glyph: 'move-right', hue: 'ai', title: e.it.short, line: `Moved to ${L(e.mv.g)}`, what: 'moved' };
    case 'decision': return { glyph: 'signpost', hue: 'rules', title: e.d.n, line: `Decided by the ${e.d.who}${e.d.lin.size ? ` · ${e.d.lin.size} buildings grew from it` : ''}`, what: 'decision', big: e.d.who === 'owner' };
    case 'milestone': return { glyph: 'milestone', hue: 'gold', title: e.m.n, line: `A landmark rises on ${L(e.g)}`, what: 'milestone', big: true };
    case 'crisis': return { glyph: 'cloud-lightning', hue: 'sharp', title: e.crisis.name, line: 'A storm forms; work in its path is blocked', what: 'crisis', big: true };
    case 'calm': return { glyph: 'sun-medium', hue: 'gold', title: `${e.crisis.name} is over`, line: 'The storm clears; the blocked buildings resume', what: 'calm', big: true };
    case 'secession': return { glyph: 'git-fork', hue: 'violet', title: e.sec.name, line: `${LM.landInfo(ds, e.sec.lens, e.sec.to).name} leaves ${LM.landInfo(ds, e.sec.lens, e.sec.from).name}; a causeway stays`, what: 'secession', big: true };
    case 'land': return { glyph: 'map-pin', hue: 'gold', title: `${L(e.g)} is founded`, line: `Its first building: ${e.it.short}`, what: 'land', big: true };
  }
  return { glyph: 'dot', hue: 'slate', title: '', line: '' };
};
