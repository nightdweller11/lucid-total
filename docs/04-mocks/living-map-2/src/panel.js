/* The living map, second pass: the panel at the end edge, the key, the tooltip and the in-place cards.
 *  - Now mode: the panel lists what needs attention in the place under the camera (needs you, stuck, waiting, new,
 *    done since you last looked), with filters that work and rows that can be dismissed;
 *  - Then mode (the timeline open and the playhead in the past): the panel is the feed of events in the window;
 *  - the key: always visible, bottom start corner; the tile states and marks, and the laid layer's scale and leaders;
 *  - the tooltip: hover a tile and read it in full; click opens the management view;
 *  - the in-place cards: during playback an important event appears where it happened and folds into the map. */
LM.panelState = { filter: 'all', scope: 'here', key: '', lastRender: 0 };
LM.cards = [];
LM.dismissed = new Set((() => { try { return JSON.parse(localStorage.getItem('lm2.dismissed') || '[]'); } catch { return []; } })());
const saveDismissed = () => { try { localStorage.setItem('lm2.dismissed', JSON.stringify([...LM.dismissed].slice(-400))); } catch {} };

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

const NOW_FILTERS = [['all', 'All', 'sun-medium'], ['ask', 'Decide', 'message-circle-question'], ['blocked', 'Stuck', 'construction'], ['review', 'Review', 'eye'], ['new', 'New', 'sprout'], ['done', 'Done', 'circle-check-big']];
const THEN_FILTERS = [['all', 'All', 'newspaper'], ['decision', 'Decisions', 'signpost'], ['done', 'Done', 'circle-check-big'], ['blocked', 'Stuck', 'construction'], ['new', 'New', 'sprout'], ['project', 'Projects', 'kanban']];
const KIND_OF_FILTER = { ask: ['ask'], blocked: ['blocked', 'stale'], review: ['review'], new: ['new'], done: ['done', 'milestone'], decision: ['decision', 'ask', 'policy'], project: ['project', 'land', 'secession'] };
const GROUPS = [['ask', 'Needs a decision', 'message-circle-question'], ['blocked', 'Stuck', 'construction'], ['stale', 'Nothing moved for a while', 'hourglass'], ['review', 'Waiting in review', 'eye'], ['milestone', 'Landmarks', 'milestone'], ['policy', 'Policies', 'scale'], ['decision', 'Decided', 'signpost'], ['new', 'New', 'sprout'], ['done', 'Done', 'circle-check-big']];

/** Render the panel: the Now list, or the feed in Then mode. */
LM.renderPanel = function renderPanel(force) {
  const P = LM.panelEl; if (!P || !LM.vis) return;
  const v = LM.view, ds = LM.ds, S = LM.panelState;
  const W = LM.where();
  const thenMode = v.mode === 'then';
  const t0 = v.sinceOn ? v.since : v.t - ds.win.review;
  const key = [v.mode, W.level, W.key, Math.round(v.t / 60e3), Math.round(t0 / 60e3), v.lens, S.filter, S.scope, LM.dismissed.size, LM.W].join('|');
  if (!force && key === S.key && performance.now() - S.lastRender < 400) return;
  S.key = key; S.lastRender = performance.now();
  const scope = S.scope === 'here' ? { land: W.level !== 'company' ? W.key && W.land && W.land.key : null, district: W.level === 'district' ? W.key : null } : {};
  const title = S.scope === 'here' ? W.name : ds.name;
  const I = LM.I;
  let rows = '', head = '', sum = '';
  if (!thenMode) {
    const all = LM.attention(ds, v.lens, v.t, t0, scope);
    const counts = { ask: 0, blocked: 0, review: 0, new: 0, done: 0 };
    for (const x of all) { if (x.kind === 'ask') counts.ask++; else if (x.kind === 'blocked' || x.kind === 'stale') counts.blocked++; else if (x.kind === 'review') counts.review++; else if (x.kind === 'new') counts.new++; else if (x.kind === 'done' || x.kind === 'milestone') counts.done++; }
    const want = S.filter === 'all' ? null : new Set(KIND_OF_FILTER[S.filter] || [S.filter]);
    const list = all.filter((x) => (!want || want.has(x.kind)) && !LM.dismissed.has(x.key));
    const dismissedHere = all.filter((x) => LM.dismissed.has(x.key)).length;
    head = `<div class="fh"><span class="g f-gold">${I('sun-medium')}</span><div class="fhl"><span class="lbl2">Now · ${S.scope === 'here' ? LM.esc(W.level === 'company' ? 'everywhere' : W.level) : 'everywhere'}</span><span class="ttl t2">${LM.esc(title)}</span></div><button class="chip sm" id="pscope" title="Everywhere, or the place under the camera">${I(S.scope === 'here' ? 'locate' : 'globe')}<span>${S.scope === 'here' ? 'Here' : 'All'}</span></button></div>`;
    sum = `<div class="fsum">${counts.ask ? `<span class="k rules">${I('message-circle-question')}${counts.ask} to decide</span>` : ''}${counts.blocked ? `<span class="k block">${I('construction')}${counts.blocked} stuck</span>` : ''}${counts.review ? `<span class="k ai">${I('eye')}${counts.review} in review</span>` : ''}${counts.new ? `<span class="k lime">${I('sprout')}${counts.new} new</span>` : ''}${counts.done ? `<span class="k good">${I('circle-check-big')}${counts.done} done</span>` : ''}${!all.length ? `<span class="k">${I('check')}Nothing needs you here</span>` : ''}<span class="k mut" title="New and done are counted since ${LM.fmtDate(t0)}">${I('history')}since ${LM.fmtShort(t0)}</span></div>`;
    const filters = `<div class="seg fseg">${NOW_FILTERS.map(([k, n, ic]) => `<span class="${S.filter === k ? 'on' : ''}" data-f="${k}">${I(ic)}<span>${n}</span>${k !== 'all' && counts[k] ? `<small>${counts[k]}</small>` : ''}</span>`).join('')}</div>`;
    if (S.filter === 'all') {
      const byKind = new Map();
      for (const x of list) { if (!byKind.has(x.kind)) byKind.set(x.kind, []); byKind.get(x.kind).push(x); }
      for (const [kind, name, ic] of GROUPS) {
        const xs = byKind.get(kind); if (!xs || !xs.length) continue;
        rows += `<div class="fgroup"><span class="lbl2 row" style="gap:6px">${I(ic)}${name} <em class="n">${xs.length}</em></span>${xs.slice(0, kind === 'done' || kind === 'new' ? 6 : 12).map((x) => rowHtml(x, v.t)).join('')}${xs.length > (kind === 'done' || kind === 'new' ? 6 : 12) ? `<span class="meta" style="padding:4px 8px">and ${xs.length - (kind === 'done' || kind === 'new' ? 6 : 12)} more; filter to see them</span>` : ''}</div>`;
      }
    } else rows = list.slice(0, 80).map((x) => rowHtml(x, v.t)).join('');
    if (!rows) rows = `<div class="fempty">${I('check')}<span>${S.filter === 'all' ? 'Nothing needs attention here.' : 'Nothing in this filter.'}${dismissedHere ? ` <button class="link" id="prestore">${dismissedHere} dismissed</button>` : ''}</span></div>`;
    else if (dismissedHere) rows += `<div class="meta" style="padding:8px 8px 0"><button class="link" id="prestore">Restore ${dismissedHere} dismissed</button></div>`;
    P.innerHTML = head + sum + filters + `<div class="fl2" id="plist">${rows}</div>`;
  } else {
    const minImp = W.level === 'company' ? 58 : W.level === 'land' ? 30 : 0;
    const evs = LM.feedEvents(ds, v.lens, t0, v.t, { ...scope, minImp }).reverse();
    const want = S.filter === 'all' ? null : new Set(KIND_OF_FILTER[S.filter] || [S.filter]);
    const whatOf = (e) => (e.kind === 'birth' ? 'new' : e.kind === 'doing' || e.kind === 'todo' ? 'progressed' : e.kind === 'move' ? 'moved' : e.kind);
    const list = evs.filter((e) => !want || want.has(whatOf(e)) || (S.filter === 'blocked' && e.kind === 'crisis'));
    const c = { decision: 0, done: 0, blocked: 0, new: 0, project: 0 };
    for (const e of evs) { const w = whatOf(e); if (w === 'decision' || w === 'ask' || w === 'policy') c.decision++; else if (w === 'done' || w === 'milestone') c.done++; else if (w === 'blocked') c.blocked++; else if (w === 'new') c.new++; else if (w === 'project' || w === 'land') c.project++; }
    head = `<div class="fh"><span class="g f-ai">${I('history')}</span><div class="fhl"><span class="lbl2">Then · ${LM.fmtShort(t0)} → ${LM.fmtShort(v.t)}</span><span class="ttl t2">${LM.esc(title)}</span></div><button class="chip sm" id="pscope">${I(S.scope === 'here' ? 'locate' : 'globe')}<span>${S.scope === 'here' ? 'Here' : 'All'}</span></button></div>`;
    sum = `<div class="fsum">${c.decision ? `<span class="k rules">${I('signpost')}${c.decision} decided</span>` : ''}${c.done ? `<span class="k good">${I('circle-check-big')}${c.done} done</span>` : ''}${c.blocked ? `<span class="k block">${I('construction')}${c.blocked} blocked</span>` : ''}${c.new ? `<span class="k lime">${I('sprout')}${c.new} new</span>` : ''}${c.project ? `<span class="k acc">${I('kanban')}${c.project} opened</span>` : ''}${!evs.length ? `<span class="k mut">Nothing happened here in this window</span>` : ''}</div>`;
    const filters = `<div class="seg fseg">${THEN_FILTERS.map(([k, n, ic]) => `<span class="${S.filter === k ? 'on' : ''}" data-f="${k}">${I(ic)}<span>${n}</span>${k !== 'all' && c[k] ? `<small>${c[k]}</small>` : ''}</span>`).join('')}</div>`;
    rows = list.slice(0, 120).map((e, i) => { const tx = LM.eventText(ds, v.lens, e); return `<button class="fc${tx.big ? ' big' : ''}" data-ev="${i}"><span class="g f-${tx.hue}${tx.big ? '' : ' sm'}">${I(tx.glyph)}</span><span class="fb"><span class="ft">${LM.esc(tx.title)}</span><span class="fl">${LM.esc(tx.line)}</span><span class="fm">${LM.fmtDate(e.t, ds.key === 'lucid')}</span></span></button>`; }).join('');
    if (!rows) rows = `<div class="fempty">${I('moon')}<span>Nothing in this filter and window.</span></div>`;
    P.innerHTML = head + sum + filters + `<div class="fl2" id="plist">${rows}</div>`;
    LM.panelEvents = list;
  }
  LM.marksIn(P);
  for (const b of P.querySelectorAll('[data-f]')) b.onclick = () => { S.filter = b.dataset.f; LM.renderPanel(true); };
  const sc = P.querySelector('#pscope'); if (sc) sc.onclick = () => { S.scope = S.scope === 'here' ? 'all' : 'here'; LM.renderPanel(true); };
  const rs = P.querySelector('#prestore'); if (rs) rs.onclick = () => { const all = LM.attention(ds, v.lens, v.t, t0, scope); for (const x of all) LM.dismissed.delete(x.key); saveDismissed(); LM.renderPanel(true); };
  for (const b of P.querySelectorAll('[data-at]')) { b.onclick = (e) => { if (e.target.closest('.dis')) return; const x = LM.panelRows && LM.panelRows.get(b.dataset.at); if (x) LM.goToAttention(x); }; const d = b.querySelector('.dis'); if (d) d.onclick = (e) => { e.stopPropagation(); LM.dismissed.add(b.dataset.at); saveDismissed(); b.classList.add('gone'); setTimeout(() => LM.renderPanel(true), 260); }; }
  for (const b of P.querySelectorAll('[data-ev]')) b.onclick = () => { const e = LM.panelEvents[Number(b.dataset.ev)]; if (e) LM.goToEvent(e); };
};
function rowHtml(x, t) {
  const tx = LM.attentionText(LM.ds, LM.view.lens, x, t);
  if (!LM.panelRows) LM.panelRows = new Map(); LM.panelRows.set(x.key, x);
  return `<div class="fc at${tx.big ? ' big' : ''}" data-at="${x.key}" role="button" tabindex="0"><span class="g f-${tx.hue}${tx.big ? '' : ' sm'}">${LM.I(tx.glyph)}</span><span class="fb"><span class="ft">${LM.esc(tx.title)}</span><span class="fl">${LM.esc(tx.line)}</span></span><button class="dis" title="Dismiss">${LM.I('x')}</button></div>`;
}
LM.goToAttention = function goToAttention(x) {
  const v = LM.view;
  if (x.it) { const p = LM.posOf && LM.posOf.get(x.it.id); if (p) LM.flyTo(p.x, p.y + 0.6, Math.max(LM.cam.k, 60)); if (x.kind === 'ask') LM.select({ ask: x.a, it: x.it }); else LM.select(x.it); return; }
  if (x.a) { LM.select({ ask: x.a }); return; }
  if (x.d) { LM.setTrace('decision', x.d); const c = LM.worlds[v.lens].claims.find((cc) => cc.dec === x.d); if (c) { const [xx, yy] = LM.hexXY(c.q, c.r); LM.flyTo(xx, yy, Math.max(LM.cam.k, 24)); } LM.select({ mon: x.d }); return; }
  if (x.m) { const vv = LM.vis.items.find((o) => o.lm === x.m); if (vv) { LM.flyTo(vv.x, vv.y, Math.max(LM.cam.k, 24)); LM.select({ lm: x.m, v: vv }); } return; }
  if (x.pol) { LM.openPolicies(x.pol.id); return; }
};
LM.goToEvent = function goToEvent(e) {
  const v = LM.view;
  if (e.it) { const p = LM.posOf && LM.posOf.get(e.it.id); if (p) LM.flyTo(p.x, p.y + 0.6, Math.max(LM.cam.k, 60)); LM.select(e.it); return; }
  if (e.d) { LM.setTrace('decision', e.d); const c = LM.worlds[v.lens].claims.find((cc) => cc.dec === e.d); if (c) { const [x, y] = LM.hexXY(c.q, c.r); LM.flyTo(x, y, Math.max(LM.cam.k, 24)); } LM.select({ mon: e.d }); return; }
  if (e.a) { const p = LM.askPlace(LM.ds, e.a, v.lens, v.t); if (p.it) { const pp = LM.posOf.get(p.it.id); if (pp) LM.flyTo(pp.x, pp.y + 0.6, Math.max(LM.cam.k, 60)); } LM.select({ ask: e.a, it: p.it }); return; }
  if (e.p) { LM.openProject(e.p.id); return; }
  if (e.pol) { LM.openPolicies(e.pol.id); return; }
  if (e.m) { const vv = LM.vis.items.find((o) => o.lm === e.m); if (vv) { LM.flyTo(vv.x, vv.y, Math.max(LM.cam.k, 24)); LM.select({ lm: e.m, v: vv }); } return; }
  if (e.kind === 'land' || e.g) { LM.flyToLand(e.kind === 'secession' ? e.sec.to : e.g); }
};

// ---- the tooltip: a tile, a place or an ask read in full on hover ----
LM.renderTip = function renderTip(h, sx, sy) {
  const T = LM.tipEl; if (!T) return;
  if (!h || LM.view.sel || (!h.it && !h.plaque && !h.lm && !h.pill)) { if (!T.hidden) T.hidden = true; return; }
  const ds = LM.ds, v = LM.view, I = LM.I;
  let html = '';
  if (h.it) {
    const it = h.it, st = LM.stateAt(ds, it, v.t); if (!st) { T.hidden = true; return; }
    const { g, d } = LM.groupAt(it, v.lens, v.t); const land = LM.landInfo(ds, v.lens, g);
    const rooms = LM.rooms(it, st), met = rooms.filter((r) => r.st === 'met').length;
    const ups = it.dep.length, downs = ds.items.filter((o) => o.dep.includes(it.id)).length;
    const asks = LM.asksOf(ds, it, v.t);
    const kind = LM.kindOf(it);
    const projs = it.projects.map((id) => ds.byProject.get(id)).filter(Boolean).slice(0, 2);
    const layer = [...v.overlays].find((o) => o !== 'deps');
    const tv = layer && LM.vis ? LM.tileValue(layer, { it, st, t: it.b }, LM.stats, LM.theme, ds, v.t) : null;
    const who = LM.who(it);
    html = `<div class="th"><span class="g f-${kind[0]} sm">${I(kind[1])}</span><span class="tt">${LM.esc(it.n.length > 90 ? it.n.slice(0, 88) + '…' : it.n)}</span></div>
      <div class="tl"><b class="st-${st.s}">${LM.STATUS_WORD[st.s]}</b> · ${st.done ? `done ${LM.rel(it.doneAt, v.t)}` : `${Math.round((st.done ? 1 : st.h) * 100)} % · since ${LM.fmtShort(st.since)}`}${st.blocked ? ` · <em>blocked ${LM.dur(v.t - st.since)}</em>` : st.stale ? ' · <em>nothing moved for a while</em>' : ''}</div>
      ${tv ? `<div class="tl"><b>${LM.OV_INFO[layer][0]}</b> ${LM.esc(tv.text)}</div>` : ''}
      <div class="tgrid"><span>${I('map-pin')}${LM.esc(land.name)} · ${LM.esc(LM.shortName(LM.distName(ds, v.lens, d)))}</span><span>${I(who.agent ? 'bot' : 'user')}${LM.esc(who.name)}</span><span>${I('list-checks')}${met} of ${rooms.length} criteria</span><span>${I('scaling')}size ${it.s}${it.cost ? ` · ${LM.fmtMoney(st.cost)}` : ''}</span><span>${I('route')}waits on ${ups} · frees ${downs}</span>${it.children.length ? `<span>${I('git-branch')}${it.children.length} subtasks</span>` : ''}${it.parent ? `<span>${I('corner-down-right')}part of ${LM.esc(ds.byId.get(it.parent) ? ds.byId.get(it.parent).short : it.parent)}</span>` : ''}${projs.length ? `<span>${I('kanban')}${projs.map((p) => LM.esc(p.short)).join(', ')}</span>` : ''}</div>
      ${asks.length ? `<div class="tl ask">${I('message-circle-question')}<span>${LM.esc(asks[0].n)}${asks.length > 1 ? ` · +${asks.length - 1}` : ''}</span></div>` : ''}
      <div class="tm">Click to open</div>`;
  } else if (h.plaque) {
    const S = h.plaque; html = `<div class="th"><span class="g f-rules sm">${I('signpost')}</span><span class="tt">${S.n} decision${S.n > 1 ? 's' : ''} decided here</span></div><div class="tl">${S.list.slice(-3).reverse().map((x) => `<div>${LM.esc(x.mon.n.replace(/\*\*/g, '').slice(0, 60))} <span class="mut">· ${LM.fmtShort(x.mon.b)}</span></div>`).join('')}</div><div class="tm">Click to list them</div>`;
  } else if (h.lm) {
    html = `<div class="th"><span class="g f-gold sm">${I('milestone')}</span><span class="tt">${LM.esc(h.lm.n)}</span></div><div class="tl">Landmark · ${LM.fmtDate(h.lm.t)}</div>`;
  } else if (h.pill) {
    const p = h.pill; const S = p.S; html = `<div class="th"><span class="g f-block sm">${I('cloud-lightning')}</span><span class="tt">${p.n} need attention</span></div><div class="tl">${S ? LM.esc(p.kind === 'land' ? LM.landInfo(ds, v.lens, S.key).name : LM.shortName(LM.distName(ds, v.lens, S.key))) : ''}${S ? ` · ${S.asks ? S.asks + ' to decide · ' : ''}${S.blocked ? S.blocked + ' blocked · ' : ''}${S.stale ? S.stale + ' still' : ''}` : ''}</div><div class="tm">Click to fly in</div>`;
  }
  T.innerHTML = html; T.hidden = false; LM.marksIn(T);
  const r = T.getBoundingClientRect();
  let x = sx + 18, y = sy - 12;
  const panelW = v.panel && LM.W > 1100 ? 382 : 16;
  if (x + r.width > LM.W - panelW) x = sx - r.width - 18;
  if (y + r.height > LM.H - 110) y = LM.H - 110 - r.height;
  if (y < 12) y = 12;
  T.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`;
};

// ---- in-place cards ----
LM.spawnCards = function spawnCards(evs, t) {
  const v = LM.view, ds = LM.ds;
  if (!v.playing) return;
  const sp = v.speed * (ds.key === 'lucid' ? 8 : 1);
  const floor = sp >= 30 ? 90 : sp >= 7 ? 70 : sp >= 1 ? 55 : 40;
  const cands = evs.filter((e) => e.imp >= floor).sort((a, b) => b.imp - a.imp).slice(0, Math.max(0, 3 - LM.cards.length));
  for (const e of cands) {
    const a = LM.anchorOf(e); if (!a) continue;
    const tx = LM.eventText(ds, v.lens, e);
    const el = document.createElement('div');
    el.className = `evc gl l3${tx.big ? ' big' : ''}`;
    el.innerHTML = `<span class="g f-${tx.hue}${tx.big ? ' lg' : ''}">${LM.I(tx.glyph)}</span><span class="eb"><span class="et">${LM.esc(tx.title)}</span><span class="el">${LM.esc(tx.line)}</span></span>`;
    LM.cardsEl.appendChild(el); LM.marksIn(el);
    const c = { el, e, anchor: a, t0: performance.now(), phase: 'in', hold: tx.big ? 2600 : 2000 };
    el.onclick = () => { LM.goToEvent(e); LM.foldCard(c); };
    LM.cards.push(c);
  }
};
LM.anchorOf = function anchorOf(e) {
  const vis = LM.vis; if (!vis) return null;
  if (e.it) { const p = LM.posOf && LM.posOf.get(e.it.id); return p ? { x: p.x, y: p.y, z: 0.6 } : null; }
  if (e.d) { const c = LM.worlds[LM.view.lens].claims.find((cc) => cc.dec === e.d); if (c) { const [x, y] = LM.hexXY(c.q, c.r); return { x, y, z: 1.3 }; } }
  if (e.a) { const p = LM.askPlace(LM.ds, e.a, LM.view.lens, LM.view.t); if (p.it) { const pp = LM.posOf.get(p.it.id); if (pp) return { x: pp.x, y: pp.y, z: 1.2 }; } const L = p.g && vis.lands.get(p.g); if (L) return { x: L.cx, y: L.cy, z: 0 }; }
  if (e.m) { const vv = vis.items.find((o) => o.lm === e.m); if (vv) return { x: vv.x, y: vv.y, z: 2 }; }
  if (e.p) { const first = e.p.items.map((id) => LM.posOf && LM.posOf.get(id)).find(Boolean); if (first) return { x: first.x, y: first.y, z: 0.8 }; }
  const g = e.g || (e.sec && e.sec.to) || (e.pol && null);
  const L = g && vis.lands.get(g); if (L) return { x: L.cx, y: L.cy, z: 0 };
  if (e.kind === 'crisis' || e.kind === 'calm' || e.kind === 'policy') { const [x, y] = LM.toWorld(LM.W * 0.5, LM.H * 0.4); return { x, y, z: 0 }; }
  return null;
};
LM.foldCard = (c) => { if (c.phase !== 'fold') { c.phase = 'fold'; c.t0 = performance.now(); } };
LM.updateCards = function updateCards(now) {
  const alive = [];
  const usable = LM.W - (LM.view.panel && LM.W > 1100 ? 382 : 16);
  for (const c of LM.cards) {
    const [ax, ay] = LM.toScreen(c.anchor.x, c.anchor.y, c.anchor.z);
    const dt = now - c.t0;
    let s = 1, o = 1, ox = 16, oy = -24;
    if (c.phase === 'in') { const f = Math.min(1, dt / 320), e = 1 - Math.pow(1 - f, 3); s = 0.6 + 0.4 * e; o = e; if (f >= 1) { c.phase = 'hold'; c.t0 = now; } }
    else if (c.phase === 'hold') { if (dt > c.hold || !LM.view.playing) { c.phase = 'fold'; c.t0 = now; } }
    else if (c.phase === 'fold') { const f = Math.min(1, dt / 650), e = f * f; s = 1 - 0.95 * e; o = 1 - e; ox = 16 * (1 - e); oy = -24 * (1 - e) + 10 * e; if (f >= 1) { c.el.remove(); continue; } }
    const w = c.el.offsetWidth || 300, h = c.el.offsetHeight || 60;
    let x = ax + ox, y = ay + oy - h;
    if (x + w > usable - 12) x = ax - w - 16;
    if (y < 170) y = ay + 16;
    c.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${s.toFixed(3)})`;
    c.el.style.opacity = o.toFixed(3);
    alive.push(c);
  }
  LM.cards = alive;
  if (alive.length) LM.needsFrame = true;
};
LM.clearCards = () => { for (const c of LM.cards) c.el.remove(); LM.cards = []; };

// ---- the key: always visible; the laid layer's scale and leaders; the states and marks ----
LM.OV_INFO = {
  progress: ['Progress', 'How far each task is: its height, and here its share as a number and a slab.', ['acc', 'good'], 'planned', 'done'],
  cost: ['Cost', 'What each task has cost so far, by its rate and the time it has been worked on.', ['slate', 'heat'], 'cheap', 'costly'],
  revenue: ['Revenue', 'What each product has earned, spread over its places.', ['slate', 'gold'], 'none', 'most'],
  problems: ['Problems', 'Where something needs a person: asked, blocked, waiting in review, or still for too long.', ['slate', 'block'], 'none', 'severe'],
  deps: ['Dependencies', 'The links between tasks: a dashed road waits, a flowing one feeds, a barrier marks a stuck upstream.', ['slate', 'acc'], 'dry', 'flowing'],
  people: ['People', 'Who holds the work: agents in teal, people in blue; the share of agents per place.', ['acc', 'ai'], 'people', 'agents'],
  recency: ['Recency', 'How recently each task last moved: the brighter, the more recent.', ['slate', 'lime'], 'long ago', 'just now'],
  growth: ['Growth', 'When each plot was claimed: the newest ground is brightest; regions shift as they grow.', ['slate', 'lime'], 'old ground', 'new ground'],
  size: ['Size', 'How big each task is, in points.', ['slate', 'violet'], 'small', 'large'],
};
LM.renderKey = function renderKey() {
  const K = LM.keyEl; if (!K || !LM.vis) return;
  const v = LM.view, ds = LM.ds, I = LM.I;
  const layer = [...v.overlays].find((o) => o !== 'deps') || null;
  const Wk = LM.where(); const state = `${v.mode}|${layer}|${v.overlays.has('deps')}|${v.sinceOn}|${v.lens}|${K.dataset.open}|${v.proj}|${Math.round(v.t / 3600e3)}|${Wk.level}|${Wk.key}|${LM.lod}`;
  if (K.dataset.state === state) return; K.dataset.state = state;
  const sw = (cls, label) => `<span class="krow"><i class="kt ${cls}"></i><span>${label}</span></span>`;
  const mark = (icon, hue, label) => `<span class="krow"><span class="g f-${hue} sm">${I(icon)}</span><span>${label}</span></span>`;
  let body = '';
  if (layer) {
    const info = LM.OV_INFO[layer]; const [c0, c1] = info[2];
    const S = LM.stats; const isLand = LM.lod <= 0;
    // the summary meter: the whole company (or the land under the camera) in one line
    const W0 = LM.where(); const scopeS = W0.level === 'company' ? [...LM.vis.lands.values()] : W0.level === 'land' ? [W0.land] : [W0.dist];
    const agg = { key: '_all', n: 0, built: 0, done: 0, working: 0, blocked: 0, stale: 0, fresh: 0, size: 0, doneSize: 0, cost: 0, agent: 0, age: 0, asks: 0, items: [] };
    for (const P of scopeS) if (P) { for (const f of ['n', 'built', 'done', 'working', 'blocked', 'stale', 'fresh', 'size', 'doneSize', 'cost', 'agent', 'age', 'asks']) agg[f] += P[f] || 0; agg.items = agg.items.concat(P.items || []); }
    const sumText = layer === 'progress' ? `${Math.round((agg.size ? agg.doneSize / agg.size : 0) * 100)} % done by size · ${agg.done} of ${agg.built} tasks` : layer === 'cost' ? `${LM.fmtMoney(agg.cost)} so far` : layer === 'revenue' ? `${LM.fmtMoney([...S.rev.values()].reduce((a, b) => a + b, 0))} attributed` : layer === 'problems' ? `${agg.asks} asked · ${agg.blocked} blocked · ${agg.stale} still` : layer === 'people' ? `${Math.round((agg.built ? agg.agent / agg.built : 0) * 100)} % of tasks held by agents` : layer === 'recency' ? `${agg.fresh} moved recently of ${agg.built}` : layer === 'growth' ? `${agg.built} plots claimed` : '';
    const list = [...(isLand ? LM.vis.lands : LM.vis.districts).values()].map((P) => ({ P, pv: LM.placeValue(P, layer, S, isLand) })).filter((x) => x.pv && x.pv.v > 0).sort((a, b) => b.pv.v - a.pv.v).slice(0, 3);
    body += `<div class="kl"><span class="row" style="gap:8px"><span class="g f-${c1}">${I(({ progress: 'sun-medium', cost: 'flame', revenue: 'coins', problems: 'cloud-lightning', people: 'users-round', recency: 'activity', growth: 'sprout', size: 'ruler' })[layer])}</span><span><b>${info[0]}</b><span class="meta" style="display:block">${info[1]}</span></span></span>
      ${sumText ? `<span class="ksum">${I('gauge')}${LM.esc(W0.level === 'company' ? ds.name : W0.name)}: <b>${LM.esc(sumText)}</b></span>` : ''}
      <span class="kscale"><i style="background:linear-gradient(90deg,var(--${c0 === 'acc' ? 'acc' : c0 === 'ai' ? 'ai' : c0 === 'block' ? 'block-h' : 'f-' + c0}),var(--${c1 === 'acc' ? 'acc' : c1 === 'ai' ? 'ai' : c1 === 'block' ? 'block-h' : c1 === 'good' ? 'good' : 'f-' + c1}))"></i><span class="ax"><span>${info[3]}</span><span>slab height = value</span><span>${info[4]}</span></span></span>
      ${list.length ? `<span class="klead">${list.map((x) => `<button class="row frow sm" data-go="${isLand ? 'L' : 'D'}:${x.P.key}"><span class="grow">${LM.esc(isLand ? LM.landInfo(ds, v.lens, x.P.key).name : LM.shortName(LM.distName(ds, v.lens, x.P.key)))}</span><em>${LM.esc(x.pv.text)}</em></button>`).join('')}</span>` : ''}</div>`;
  }
  if (v.sinceOn && LM.since) { const c = LM.since.counts; body += `<div class="kl"><span class="row" style="gap:8px"><span class="g f-heat">${I('history')}</span><span><b>Since ${LM.fmtShort(v.since)}</b><span class="meta" style="display:block">${c.n} changed; the rest is dimmed</span></span></span><span class="kbadges">${[['new', c.new], ['progressed', c.progressed], ['review', c.review], ['done', c.done], ['blocked', c.blocked], ['moved', c.moved], ['dropped', c.dropped]].filter(([, n]) => n).map(([k, n]) => { const [ic, hue] = LM.badgeOf(k); return `<span class="row" style="gap:5px"><span class="g f-${hue} sm">${I(ic)}</span>${n}</span>`; }).join('')}</span></div>`; }
  const open = K.dataset.open !== '0';
  const states = `<div class="kstates">${sw('todo', 'Planned')}${sw('doing', 'In progress')}${sw('review', 'In review')}${sw('blocked', 'Blocked')}${sw('done', 'Done')}${sw('dropped', 'Set aside')}</div>`;
  const marks = `<div class="kmarks">${mark('message-circle-question', 'rules', 'Needs a decision')}${mark('construction', 'block', 'Blocked')}${mark('hourglass', 'hold', 'Nothing moved')}${mark('eye', 'ai', 'Waiting in review')}${mark('signpost', 'rules', 'Decided (count)')}${mark('milestone', 'gold', 'Landmark')}${v.mode === 'now' && v.quiet ? mark('moon', 'slate', 'Old and done: quiet') : ''}</div>`;
  K.innerHTML = `<button class="kh" id="keyh"><span class="row" style="gap:8px">${I('book-marked')}<b>Key</b><span class="meta">height = progress · colour = state · glyph = kind</span></span>${I(open ? 'chevron-down' : 'chevron-up')}</button>${open ? body + states + marks + `<button class="link ksheet" id="keysheet">${I('book-open')} The whole grammar</button>` : body}`;
  LM.marksIn(K);
  K.querySelector('#keyh').onclick = () => { K.dataset.open = open ? '0' : '1'; K.dataset.state = ''; LM.renderKey(); };
  const sh = K.querySelector('#keysheet'); if (sh) sh.onclick = () => LM.openSheet();
  for (const b of K.querySelectorAll('[data-go]')) b.onclick = () => { const [kind, key] = [b.dataset.go.slice(0, 1), b.dataset.go.slice(2)]; if (kind === 'L') LM.flyToLand(key); else LM.flyToDistrict(key); };
};
