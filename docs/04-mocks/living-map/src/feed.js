/* The living map: what is happening. Three readers of the event stream (model.js):
 *  - the feed, a glass column at the end edge, scoped to the depth and the place under the camera (company, a land,
 *    a district) and to the window since the person last looked;
 *  - the in-place cards: during playback an important event appears expanded where it happened, holds a beat, and
 *    folds into its building, flag or landmark;
 *  - the legend card: what the active overlay's colour means, its scale, and the three places that lead it; and, in
 *    the since layer, the six change badges with their counts. */
LM.feedState = { filter: 'all', lastRender: 0, key: '' };
LM.cards = [];

/** Where the camera is: the land and district under its centre, by depth. */
LM.where = function where() {
  const vis = LM.vis, v = LM.view; if (!vis) return { level: 'company' };
  const [wx, wy] = [LM.cam.x, LM.cam.y];
  const [q, r] = LM.xyHex(wx, wy);
  let land = null, dist = null;
  for (const D of vis.districts.values()) if (D.cells.has(q + ',' + r)) { dist = D; break; }
  if (dist) land = vis.lands.get(dist.land);
  else { let best = null, bd = Infinity; for (const L of vis.lands.values()) { const d = Math.hypot(L.cx - wx, L.cy - wy); if (d < bd) { bd = d; best = L; } } if (best && bd < Math.sqrt(best.n) * 2.5) land = best; }
  const lod = LM.lod || 0;
  if (lod >= 2 && dist) return { level: 'district', land, dist, name: LM.distName(LM.ds, v.lens, dist.key), key: dist.key };
  if (lod >= 1 && land) return { level: 'land', land, dist: lod >= 2 ? dist : null, name: LM.landInfo(LM.ds, v.lens, land.key).name, key: land.key };
  return { level: 'company', land: lod >= 1 ? land : null, dist: null, name: LM.ds.name, key: '' };
};

const FILTERS = [['all', 'All', 'newspaper'], ['decision', 'Decisions', 'signpost'], ['done', 'Lit', 'circle-check-big'], ['blocked', 'Stuck', 'construction'], ['new', 'New', 'sprout']];
const matchFilter = (f, txt) => f === 'all' || (f === 'decision' && (txt.what === 'decision' || txt.what === 'milestone' || txt.big)) || txt.what === f;

/** Render the feed for the current scope and window. */
LM.renderFeed = function renderFeed(force) {
  const el = LM.feedEl; if (!el || !LM.vis) return;
  const ds = LM.ds, v = LM.view, S = LM.feedState;
  const W = LM.where();
  const t1 = v.t, t0 = v.sinceOn ? v.since : t1 - ds.win.review;
  const key = [W.level, W.key, v.lens, Math.round(t0 / 6e4), Math.round(t1 / 6e4), S.filter, v.sinceOn].join('|');
  if (!force && key === S.key) return; S.key = key;
  const minImp = W.level === 'company' ? 58 : W.level === 'land' ? 30 : 0;
  const scope = { minImp, land: W.level !== 'company' && W.land ? W.land.key : null, district: W.level === 'district' && W.dist ? W.dist.key : null };
  let events = LM.feedEvents(ds, v.lens, t0, t1, scope);
  const texts = events.map((e) => ({ e, txt: LM.eventText(ds, v.lens, e) })).filter((x) => matchFilter(S.filter, x.txt));
  texts.sort((a, b) => b.e.t - a.e.t || b.e.imp - a.e.imp);
  const ch = LM.changes(ds, v.lens, t0, t1);
  const scopeCounts = W.level === 'company' ? ch.counts : W.level === 'land' ? (ch.places.get(W.land.key) || ch.counts) : (ch.districts.get(W.dist.key) || ch.counts);
  const I = LM.I;
  const sum = [];
  if (scopeCounts.new) sum.push(`<span class="k lime">${I('sprout')}${scopeCounts.new} new</span>`);
  if (scopeCounts.progressed) sum.push(`<span class="k acc">${I('trending-up')}${scopeCounts.progressed} moved</span>`);
  if (scopeCounts.done) sum.push(`<span class="k good">${I('circle-check-big')}${scopeCounts.done} lit</span>`);
  if (scopeCounts.blocked) sum.push(`<span class="k block">${I('construction')}${scopeCounts.blocked} stuck</span>`);
  if (ch.decisions.length && W.level === 'company') sum.push(`<span class="k rules">${I('signpost')}${ch.decisions.length} decided</span>`);
  const since = v.sinceOn ? `since ${LM.fmtShort(t0)}` : `last ${Math.round(ds.win.review / LM.DAY)} days`;
  const head = `<div class="fh"><div class="fhl"><span class="lbl2">${W.level === 'company' ? 'The company' : W.level === 'land' ? 'This land' : 'This district'} · ${since}</span><span class="ttl t3">${W.name}</span></div><button class="ic" id="feedx" title="Hide the feed">${I('chevron-right')}</button></div>
    <div class="fsum">${sum.join('') || '<span class="mut">Nothing moved here in this window.</span>'}</div>
    <div class="seg fseg">${FILTERS.map(([k, n, ic]) => `<span class="${k === S.filter ? 'on' : ''}" data-f="${k}" role="button" tabindex="0">${I(ic)}<span>${n}</span></span>`).join('')}</div>`;
  const rows = texts.slice(0, 40).map(({ e, txt }, i) => {
    const place = e.g ? LM.landInfo(ds, v.lens, e.g).name : '';
    const id = e.it ? `it:${e.it.id}` : e.d ? `dec:${e.d.id}` : e.m ? `ms:${ds.milestones.indexOf(e.m)}` : e.kind === 'land' ? `land:${e.g}` : e.kind;
    return `<button class="fc${txt.big ? ' big' : ''}" data-ev="${id}" data-i="${i}"><span class="g f-${txt.hue}${txt.big ? ' lg' : ''}">${I(txt.glyph)}</span><span class="fb"><span class="ft">${LM.esc(txt.title)}</span><span class="fl">${LM.esc(txt.line)}</span><span class="fm">${LM.rel(e.t, t1)}${place && W.level === 'company' && e.kind !== 'land' ? ` · ${LM.esc(place)}` : ''}</span></span></button>`;
  }).join('');
  el.innerHTML = head + `<div class="fl2">${rows || '<div class="mut" style="padding:12px 6px">No events pass this filter.</div>'}</div>`;
  el.querySelector('#feedx').onclick = () => LM.toggleFeed(false);
  for (const s of el.querySelectorAll('.fseg [data-f]')) s.onclick = () => { S.filter = s.dataset.f; LM.renderFeed(true); };
  for (const b of el.querySelectorAll('.fc')) {
    const { e } = texts[Number(b.dataset.i)];
    b.onclick = () => LM.goToEvent(e);
    b.onpointerenter = () => { if (e.it) { LM.view.hover = e.it; LM.dirty(); } };
    b.onpointerleave = () => { if (LM.view.hover === e.it) { LM.view.hover = null; LM.dirty(); } };
  }
};

/** Fly to and open what an event is about. */
LM.goToEvent = function goToEvent(e) {
  const ds = LM.ds, v = LM.view;
  if (e.it) { const p = LM.posOf && LM.posOf.get(e.it.id); if (p) LM.flyTo(p.x, p.y + 0.6, Math.max(LM.cam.k, 64)); LM.select(e.it); return; }
  if (e.d) { const c = LM.worlds[v.lens].claims.find((cc) => cc.dec === e.d); if (c) { const [x, y] = LM.hexXY(c.q, c.r); LM.flyTo(x, y, Math.max(LM.cam.k, 22)); } LM.setTrace('decision', e.d); LM.select({ mon: e.d, v: c }); return; }
  if (e.m) { const g = e.m.land && e.m.land[v.lens]; if (g) LM.flyToLand(g); return; }
  if (e.kind === 'land') { LM.flyToLand(e.g); return; }
  if (e.kind === 'crisis' || e.kind === 'calm') { LM.toggleOverlay('issues', true); const D = [...LM.vis.districts.values()].sort((a, b) => b.blocked - a.blocked)[0]; if (D) LM.flyToDistrict(D.key); return; }
  if (e.sec) { LM.setLens(e.sec.lens); setTimeout(() => LM.flyToLand(e.sec.to), 950); }
};

// ---- in-place cards during playback ----
const CARD_MS = { in: 320, hold: 2300, fold: 650 };
LM.spawnCards = function spawnCards(events, t1) {
  const v = LM.view, ds = LM.ds;
  const thr = v.speed >= 30 ? 90 : v.speed >= 7 ? 70 : v.speed >= 1 ? 55 : 40; // faster playback: only the big ones
  const cand = events.filter((e) => e.imp >= thr && e.kind !== 'land' || (e.kind === 'land' && e.lens === v.lens)).sort((a, b) => b.imp - a.imp);
  for (const e of cand) {
    if (LM.cards.length >= 3) { const weakest = LM.cards.reduce((m, c) => (c.e.imp < m.e.imp ? c : m)); if (weakest.e.imp >= e.imp || weakest.phase === 'fold') break; LM.foldCard(weakest); if (LM.cards.length >= 3) break; }
    const anchor = LM.anchorOf(e); if (!anchor) continue;
    const txt = LM.eventText(ds, v.lens, e);
    const el = document.createElement('div');
    el.className = `evc gl l3 ${txt.big ? 'big' : ''}`;
    el.innerHTML = `<span class="g f-${txt.hue}${txt.big ? ' lg' : ''}">${LM.I(txt.glyph)}</span><span class="eb"><span class="et">${LM.esc(txt.title)}</span><span class="el">${LM.esc(txt.line)}</span></span>`;
    el.onclick = () => LM.goToEvent(e);
    LM.cardsEl.appendChild(el);
    LM.cards.push({ e, el, anchor, t0: performance.now(), phase: 'in', txt });
  }
};
LM.anchorOf = function anchorOf(e) {
  const v = LM.view;
  if (e.it) { const p = LM.posOf && LM.posOf.get(e.it.id); if (p) return { x: p.x, y: p.y, d: p.d }; const { g } = LM.groupAt(e.it, v.lens, e.t); const L = LM.vis.lands.get(g); return L ? { x: L.cx, y: L.cy } : null; }
  if (e.d) { const c = LM.worlds[v.lens].claims.find((cc) => cc.dec === e.d); if (c) { const [x, y] = LM.hexXY(c.q, c.r); return { x, y, d: c.d }; } }
  const g = e.g || (e.m && e.m.land && e.m.land[v.lens]) || (e.sec && e.sec.to);
  if (g) { const L = LM.vis.lands.get(g); if (L) return { x: L.cx, y: L.cy }; }
  if (e.kind === 'crisis' || e.kind === 'calm') { const D = [...LM.vis.districts.values()].sort((a, b) => b.blocked - a.blocked)[0]; if (D) return { x: D.cx, y: D.cy, d: D.key }; }
  const w = LM.worlds[v.lens].extent; return { x: (w.minx + w.maxx) / 2, y: (w.miny + w.maxy) / 2 };
};
LM.foldCard = (c) => { if (c.phase !== 'fold') { c.phase = 'fold'; c.t0 = performance.now(); } };
LM.updateCards = function updateCards(now) {
  if (!LM.cards.length) return;
  const reduce = LM.view.reduce;
  for (const c of LM.cards.slice()) {
    const age = now - c.t0;
    if (c.phase === 'in' && age > CARD_MS.in) { c.phase = 'hold'; c.t0 = now; continue; }
    if (c.phase === 'hold' && age > CARD_MS.hold) { LM.foldCard(c); continue; }
    if (c.phase === 'fold' && age > CARD_MS.fold) { c.el.remove(); LM.cards.splice(LM.cards.indexOf(c), 1); continue; }
    const D = c.anchor.d && LM.vis.districts.get(c.anchor.d);
    const [sx, sy] = LM.toScreen(c.anchor.x, c.anchor.y); const ay = sy - ((D && D.lift) || 0) - LM.cam.k * 0.8;
    const w = c.el.offsetWidth || 280, h = c.el.offsetHeight || 80;
    let x = sx + 18, y = ay - h - 14;
    const usable = LM.W - (LM.view.feed && LM.W > 1100 ? 382 : 16);
    if (x + w > usable) x = sx - w - 18; if (y < 170) y = ay + 18;
    let s = 1, o = 1, tx = 0, ty = 0;
    if (c.phase === 'in') { const f = reduce ? 1 : Math.min(1, age / CARD_MS.in); const e = 1 - Math.pow(1 - f, 3); s = 0.6 + 0.4 * e; o = e; }
    if (c.phase === 'fold') { const f = reduce ? 1 : Math.min(1, age / CARD_MS.fold); const e = f * f; s = 1 - 0.85 * e; o = 1 - e; tx = (sx - (x + w / 2)) * e; ty = (ay - (y + h / 2)) * e; }
    c.el.style.transform = `translate(${(x + tx).toFixed(1)}px,${(y + ty).toFixed(1)}px) scale(${s.toFixed(3)})`;
    c.el.style.opacity = o.toFixed(3);
    c.el.classList.toggle('hold', c.phase === 'hold');
  }
  LM.needsFrame = true;
};
LM.clearCards = () => { for (const c of LM.cards) c.el.remove(); LM.cards = []; };

// ---- the legend card: what the colour means ----
const OV_INFO = {
  progress: ['Progress', 'The ground brightens as a place completes; the ring is its done share.', ['var(--ground-base)', '#ffffff'], 'dark', 'bright'],
  cost: ['Cost', 'Warm ground where money burns: the sum of working days times the rate.', ['var(--ground-base)', 'var(--f-heat)'], '$0', 'most'],
  revenue: ['Revenue', 'Golden ground where money is made; brown where cost exceeds it.', ['#8c5a28', 'var(--f-gold)'], 'loss', 'most'],
  issues: ['Issues', 'A hatched front over a place with blocked work; haze where nothing moves.', ['transparent', 'var(--f-sharp)'], 'calm', 'storm'],
  pipes: ['Pipes', 'Dependencies: teal flow when the upstream delivered, dashed when it has not, a barrier at a clog.', ['var(--ink45)', 'var(--ai)'], 'dry', 'flowing'],
  power: ['Power', 'Decision lines from each flag to what grew from it; dark where a decision is awaited.', ['var(--ground-base)', 'var(--f-gold)'], 'waits', 'decided'],
  load: ['Load', 'Coral where many buildings rise at once in one district.', ['var(--ground-base)', 'var(--block-h)'], 'quiet', 'stretched'],
  fresh: ['Fresh', 'Heat where something moved in the window; dimmed where nothing has for a while.', ['var(--ground-base)', 'var(--f-heat)'], 'still', 'moving'],
  ai: ['AI', 'Teal where agents did the work.', ['var(--ground-base)', 'var(--ai)'], 'people', 'agents'],
  terrain: ['Terrain', 'Height is work remaining: a land with much left rises as a plateau.', ['var(--ground-base)', 'var(--f-slate)'], 'flat', 'high'],
  growth: ['Growth', 'Lime where plots were claimed most recently: how the regions shifted as they grew.', ['var(--ground-base)', 'var(--f-lime)'], 'old', 'new'],
};
LM.OV_INFO = OV_INFO;
LM.renderLegend = function renderLegend() {
  const el = LM.legendEl; if (!el || !LM.vis) return;
  const v = LM.view, ds = LM.ds, stats = LM.stats, I = LM.I;
  const parts = [];
  for (const o of v.overlays) {
    const info = OV_INFO[o]; if (!info) continue;
    const isLand = LM.lod <= 0; const S = isLand ? [...LM.vis.lands.values()] : [...LM.vis.districts.values()];
    const top = S.map((s) => ({ s, pv: LM.placeValue(s, o, stats, isLand) })).filter((x) => x.pv && x.pv.v > 0).sort((a, b) => b.pv.v - a.pv.v).slice(0, 3);
    parts.push(`<div class="lg1"><div class="row" style="gap:8px"><i class="sw" style="background:linear-gradient(90deg,${info[2][0]},${info[2][1]})"></i><b>${info[0]}</b><span class="mut" style="margin-inline-start:auto;font-size:13px">${info[3]} → ${info[4]}</span></div><div class="mut" style="font-size:13px">${info[1]}</div>${top.length ? `<div class="row" style="gap:6px;flex-wrap:wrap">${top.map(({ s, pv }) => `<button class="chip sm" data-place="${isLand ? 'L' : 'D'}:${s.key}">${LM.esc(isLand ? LM.landInfo(ds, v.lens, s.key).name : LM.distName(ds, v.lens, s.key).slice(0, 22))}<em>${pv.text}</em></button>`).join('')}</div>` : ''}</div>`);
  }
  if (v.sinceOn && LM.since) {
    const c = LM.since.counts;
    const badges = [['new', 'New'], ['progressed', 'Moved on'], ['done', 'Lit'], ['blocked', 'Blocked'], ['moved', 'Moved land'], ['dropped', 'Set aside']].filter(([k]) => c[k]);
    parts.push(`<div class="lg1"><div class="row" style="gap:8px"><b>Since ${LM.fmtShort(v.since)}</b><span class="mut" style="margin-inline-start:auto;font-size:13px">${c.n} changed · the rest dimmed</span></div><div class="row" style="gap:10px;flex-wrap:wrap">${badges.map(([k, n]) => { const [ic, h] = LM.badgeOf(k); return `<span class="row" style="gap:5px;font-size:13px"><span class="g sm f-${h}">${I(ic)}</span>${n} ${c[k]}</span>`; }).join('')}</div></div>`);
  }
  if (!parts.length) { el.hidden = true; return; }
  el.hidden = false; el.innerHTML = parts.join('');
  for (const b of el.querySelectorAll('[data-place]')) b.onclick = () => { const [k, key] = [b.dataset.place[0], b.dataset.place.slice(2)]; if (k === 'L') LM.flyToLand(key); else LM.flyToDistrict(key); };
};
