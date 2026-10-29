/* The living map: the shell and the interaction, on the v0.2 line. The dock, the breadcrumb chip, Talk, the lens
 * control, the layer chips, the lab (theme, contrast, motion), the "since" control, the feed, the legend, the rail with
 * playback, the product view of an opened building, the place view of a land or district, the flag and landmark views,
 * the legend sheet (the grammar of the map), the decisions list and the command bar (a small parser standing in for
 * the composer of docs/13 §8). The person clicks, types or speaks; the AI sets lens, layer, camera, time, trace. */
const $ = (s, el = document) => el.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
LM.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
LM.I = (name, cls = '') => `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${LM.ICONS[name] || LM.ICONS.dot}"/></svg>`;
const I = LM.I;
const AI = (cls = '') => `<i data-lucide="lucid-mark" class="ic${cls ? ' ' + cls : ''}"></i>`;
const marks = (root) => { if (window.lucidMarks) window.lucidMarks(root); };
const LM_SVG = (key, size = 40) => `<svg class="lm" viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true"><path d="${LM.LANDMARKS[LM.lmKey(key)].d}"/></svg>`;
const glyph = (kind, size = '') => { const [f, ic, l] = LM.KINDS[kind] || LM.KINDS.task; return `<span class="g f-${f}${size ? ' ' + size : ''}" role="img" aria-label="${l}" title="${l}">${I(ic)}</span>`; };
const gl2 = (icon, hue, size = '') => `<span class="g f-${hue}${size ? ' ' + size : ''}">${I(icon)}</span>`;
const av = (who, size = '') => `<span class="av ${who.agent ? 'ag' : who.cls}${size ? ' ' + size : ''}" role="img" aria-label="${LM.esc(who.name)}${who.agent ? ', an agent' : ''}" title="${LM.esc(who.name)}${who.agent ? ', an agent' : ''}">${who.agent ? I('bot') : who.initial}</span>`;
const chip = (icon, label, cls = '', attrs = '') => `<span class="chip ${cls}" role="button" tabindex="0" ${attrs}>${icon ? (icon.startsWith('<') ? icon : I(icon)) : ''}<span>${label}</span></span>`;
const pill = (icon, label, cls = '', attrs = '') => `<button class="pill ${cls}" ${attrs}>${icon ? (icon.startsWith('<') ? icon : I(icon)) : ''}${label ? `<span>${label}</span>` : ''}</button>`;
const r2 = (v) => Math.round(v * 100) / 100;
function ringSvg(size, pct, o = {}) {
  const w = o.w ?? (size >= 96 ? 6 : 3); const r = size / 2 - w / 2 - 1; const c = size / 2;
  let s = `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${o.label || Math.round(pct * 100) + ' percent done'}">`;
  if (o.segs) { const n = o.segs.length, gap = o.gap ?? 3.2; o.segs.forEach((st, i) => { const len = 100 / n - gap; s += `<circle class="trk seg-${st}" cx="${c}" cy="${c}" r="${r2(r)}" stroke-width="${w}" pathLength="100" stroke-dasharray="${r2(len)} ${r2(100 - len)}" stroke-dashoffset="${r2(-(i * 100 / n + gap / 2) + 25)}" stroke-linecap="round"${o.hi === i ? ' style="stroke-width:' + (w + 3) + 'px"' : ''}/>`; }); }
  else { s += `<circle class="trk" cx="${c}" cy="${c}" r="${r2(r)}" stroke-width="${w}"/>`; if (pct > 0) s += `<circle class="val" cx="${c}" cy="${c}" r="${r2(r)}" stroke-width="${w}" pathLength="100" stroke-dasharray="${r2(pct * 100)} 100" stroke-dashoffset="25"/>`; }
  return s + '</svg>';
}
const LENSES = [['dept', 'Departments', 'users-round', 'who owns the work'], ['proj', 'Projects', 'flag', 'what it is for'], ['prod', 'Products', 'package', 'what it builds'], ['people', 'People', 'circle-user-round', 'who is responsible']];
const OVERLAYS = [
  ['progress', 'Progress', 'sun-medium'], ['cost', 'Cost', 'flame'], ['revenue', 'Revenue', 'coins'], ['growth', 'Growth', 'sprout'], ['terrain', 'Terrain', 'mountain'],
  ['issues', 'Issues', 'cloud-lightning'], ['pipes', 'Pipes', 'waypoints'], ['power', 'Power', 'plug-zap'], ['load', 'Load', 'gauge'], ['fresh', 'Fresh', 'activity'], ['ai', 'AI', 'bot'],
];
const CHANNEL = { progress: 'ground', cost: 'ground', revenue: 'ground', growth: 'ground', terrain: 'relief', issues: 'air', pipes: 'lines', power: 'lines', load: 'light', fresh: 'light', ai: 'light' };
const SPEEDS = { lucid: [[1 / 8, '3 h / s'], [1 / 4, '6 h / s'], [1 / 2, '12 h / s'], [1, '1 day / s']], example: [[7, '1 wk / s'], [14, '2 wk / s'], [30, '1 mo / s'], [90, '3 mo / s']] };
const THEMES = [['deep', 'Deep Blue', 'moon'], ['aqua', 'Aqua Dusk', 'waves'], ['sky', 'Sky Glass', 'sun']];

LM.boot = function boot() {
  LM.readTheme();
  const root = $('#app');
  root.innerHTML = `
    <canvas id="map"></canvas>
    <div id="places" aria-hidden="true"></div>
    <div id="cards"></div>
    <nav class="dock" aria-label="Dock">${[['horizon', 'sunrise', 'Horizon'], ['world', 'map', 'World'], ['me', 'circle-user-round', 'Me'], ['talk', 'AI', 'Talk'], ['more', 'grip', 'More']].map(([k, ic, l]) => `<button class="d${k === 'world' ? ' on' : ''}${k === 'talk' ? ' tk' : ''}" data-d="${k}" title="${l}" aria-label="${l}">${ic === 'AI' ? AI() : I(ic)}</button>`).join('')}</nav>
    <div class="top" id="top"><div class="toprow"><nav class="crumbc" id="crumbs" aria-label="Where you are"></nav><div class="seg lensseg" id="lenses"></div><div class="tend" id="tend"></div></div><div class="layers" id="overlays"></div></div>
    <aside class="feed gl l2" id="feed" aria-label="What is happening"></aside>
    <div class="legend gl l2" id="legend" hidden></div>
    <div class="ledger" id="ledger"></div>
    <div class="talk" role="search" aria-label="Talk to Lucid">${AI()}<input id="talk" placeholder="Ask, or tell Lucid what to show" autocomplete="off"><span class="tb slash" title="Commands">/</span><span class="tb" title="Hold to talk">${I('mic')}</span></div>
    <div class="rail gl l2" id="rail"><button class="ic" id="back" title="Previous beat">${I('skip-back')}</button><button class="ic" id="play" title="Play">${I('play')}</button><button class="ic" id="step" title="Next beat">${I('skip-forward')}</button><button class="pillx" id="speed" title="Speed">${I('gauge')}<span></span></button><div class="date" id="date"></div><canvas id="railc"></canvas><button class="pillx" id="decs" title="Decisions">${I('signpost')}<span>Decisions</span></button></div>
    <div class="dim" id="dim" hidden></div>
    <section class="pv gl l3" id="pv" hidden></section>
    <section class="sheet gl l3" id="sheet" hidden></section>
    <div class="list gl l3" id="list" hidden></div>
    <div class="pop gl l3" id="pop" hidden></div>
    <div class="toast" id="toast"></div>`;
  marks(root);
  LM.canvas = $('#map'); LM.ctx = LM.canvas.getContext('2d');
  LM.railc = $('#railc'); LM.railctx = LM.railc.getContext('2d');
  LM.placesEl = $('#places'); LM.cardsEl = $('#cards'); LM.feedEl = $('#feed'); LM.legendEl = $('#legend');
  const params = new URLSearchParams(location.search);
  LM.setDataset(params.get('d') === 'example' ? 'example' : 'lucid', params);
  buildChrome();
  bindMap();
  bindRail();
  window.addEventListener('resize', resize);
  resize();
  applyParams(params);
  requestAnimationFrame(loop);
};

LM.setDataset = function setDataset(key, params) {
  const ds = LM.prepare(LM.DATA[key]);
  LM.ds = ds;
  LM.worlds = {};
  for (const lens of Object.keys(ds.lenses)) LM.worlds[lens] = LM.grow(ds, lens);
  LM.view.t = params && params.get('t') ? Date.parse(params.get('t')) : ds.now;
  LM.view.t = Math.max(ds.span[0], Math.min(ds.span[1], LM.view.t));
  LM.view.speed = SPEEDS[ds.key][1][0];
  LM.view.since = LM.view.t - ds.win.review; LM.sinceCache = null;
  LM.view.trace = null; LM.view.sel = null; LM.ledgerT = LM.view.t;
  LM.clearCards(); LM.feedState.key = '';
  if (!params || !params.get('k')) LM.fitWorld();
  LM.dirty();
};

/** The camera that holds the world as it is at time t (not the final extent): the city is small when it is young. */
LM.fitAt = function fitAt(t) {
  const w = LM.worlds[LM.view.lens];
  let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
  for (const c of w.claims) { if (c.t > t) break; const [x, y] = LM.hexXY(c.q, c.r); if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; }
  if (!isFinite(minx)) { const e = w.extent; minx = e.minx; maxx = e.maxx; miny = e.miny; maxy = e.maxy; }
  const phone = LM.W <= 720;
  const feedW = LM.view.feed && (LM.W || window.innerWidth) > 1100 ? 350 : 0;
  const W = (LM.W || window.innerWidth) - feedW, H = (LM.H || window.innerHeight) - (phone ? 420 : 240);
  const k = Math.min((W - 120) / Math.max(10, maxx - minx + 10), H / Math.max(10, (maxy - miny + 10) * 0.92));
  return { x: (minx + maxx) / 2 + feedW / 2 / k, y: (miny + maxy) / 2 + (phone ? -60 : 8) / k, k: Math.max(1.5, Math.min(t === undefined || t >= LM.ds.span[1] ? 9 : 16, k)) };
};
LM.fitWorld = function fitWorld(t) { LM.cam = LM.fitAt(t === undefined ? LM.ds.span[1] : t); LM.autoFit = false; };

function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  LM.W = window.innerWidth; LM.H = window.innerHeight;
  LM.canvas.width = LM.W * dpr; LM.canvas.height = LM.H * dpr; LM.canvas.style.width = LM.W + 'px'; LM.canvas.style.height = LM.H + 'px';
  LM.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const r = LM.railc.getBoundingClientRect();
  LM.railc.width = Math.max(10, r.width) * dpr; LM.railc.height = Math.max(10, r.height) * dpr;
  LM.railctx.setTransform(dpr, 0, 0, dpr, 0, 0); LM.railW = r.width; LM.railH = r.height;
  document.documentElement.classList.toggle('phone', LM.W <= 720);
  document.documentElement.classList.toggle('tight', LM.W - (LM.view.feed && LM.W > 1100 ? 350 : 0) < 1180);
  LM.dirty();
}
LM.dirty = () => { LM.needsFrame = true; };

function loop(now) {
  const v = LM.view;
  if (v.playing) {
    const dt = Math.min(100, now - (LM.playLast || now)); LM.playLast = now;
    const nt = v.t + (dt / 1000) * v.speed * LM.DAY;
    setTime(Math.min(LM.ds.span[1], nt), true);
    if (LM.autoFit && !LM.flight) { const f = LM.fitAt(v.t); const a = 1 - Math.exp(-(dt / 1000) / 1.6); LM.cam.x += (f.x - LM.cam.x) * a; LM.cam.y += (f.y - LM.cam.y) * a; LM.cam.k = Math.exp(Math.log(LM.cam.k) + (Math.log(f.k) - Math.log(LM.cam.k)) * a); }
    if (nt >= LM.ds.span[1]) togglePlay(false);
  } else LM.playLast = now;
  if (LM.flight) {
    const F = LM.flight, f = Math.min(1, (now - F.t0) / F.ms), e = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
    LM.cam.x = F.x0 + (F.x1 - F.x0) * e; LM.cam.y = F.y0 + (F.y1 - F.y0) * e; LM.cam.k = Math.exp(Math.log(F.k0) + (Math.log(F.k1) - Math.log(F.k0)) * e);
    if (f >= 1) LM.flight = null;
    LM.needsFrame = true;
  }
  const live = v.overlays.has('pipes') || v.overlays.has('issues') || LM.lod >= 2 || LM.cards.length;
  if (LM.needsFrame || (live && !v.reduce)) { LM.needsFrame = false; LM.draw(now); drawRail(); updateCrumbs(); LM.updateCards(now); if (now - LM.feedState.lastRender > (v.playing ? 500 : 120)) { LM.feedState.lastRender = now; LM.renderFeed(); LM.renderLegend(); } }
  if (LM.toastUntil && now > LM.toastUntil) { $('#toast').classList.remove('on'); LM.toastUntil = 0; }
  requestAnimationFrame(loop);
}

// ---- chrome ----
function buildChrome() {
  const lenses = $('#lenses'); lenses.innerHTML = '';
  for (const [k, name, ico, sub] of LENSES) { const b = el('button', 'sg', `${I(ico)}<span>${name}</span>`); b.dataset.lens = k; b.title = `See the company by ${name.toLowerCase()}: ${sub}`; b.onclick = () => setLens(k); lenses.appendChild(b); }
  const ov = $('#overlays'); ov.innerHTML = `<span class="lbl">${I('layers')}<span>Layers</span></span>`;
  for (const [k, name, ico] of OVERLAYS) { const b = el('button', 'chip lay', `${I(ico)}<span>${name}</span>`); b.dataset.o = k; b.title = LM.OV_INFO[k][1]; b.onclick = () => toggleOverlay(k); ov.appendChild(b); }
  const tend = $('#tend'); tend.innerHTML = '';
  const since = el('button', 'chip', ''); since.id = 'sincec'; since.onclick = (e) => sinceMenu(e); tend.appendChild(since);
  const feedb = el('button', 'chip icon', `${I('newspaper')}<span>Feed</span>`); feedb.title = 'The feed (F)'; feedb.id = 'feedc'; feedb.onclick = () => LM.toggleFeed(); tend.appendChild(feedb);
  const leg = el('button', 'chip icon', `${I('book-marked')}<span>Legend</span>`); leg.title = 'Legend: the grammar of the map (L)'; leg.onclick = () => openSheet(); tend.appendChild(leg);
  const lab = el('button', 'chip icon', `${I('sliders-horizontal')}<span>Lab</span>`); lab.title = 'Lab: theme, contrast, motion'; lab.id = 'labc'; lab.onclick = (e) => labMenu(e); tend.appendChild(lab);
  for (const d of document.querySelectorAll('.dock .d')) d.onclick = () => { if (d.dataset.d === 'talk') $('#talk').focus(); else if (d.dataset.d === 'world') { select(null); LM.flyTo(null, null, 3.2); } else say(`<b>${d.title}</b> is a place of the product (docs/13 §4); the map is this mock.`, 3000); };
  $('#play').onclick = () => togglePlay();
  $('#step').onclick = () => stepBeat(1);
  $('#back').onclick = () => stepBeat(-1);
  $('#speed').onclick = () => { const S = SPEEDS[LM.ds.key]; const i = S.findIndex((s) => s[0] === LM.view.speed); LM.view.speed = S[(i + 1) % S.length][0]; syncChrome(); };
  $('#decs').onclick = () => toggleList();
  $('#dim').onclick = () => select(null);
  const talk = $('#talk');
  talk.addEventListener('keydown', (e) => { if (e.key === 'Enter') { LM.command(talk.value); talk.value = ''; } if (e.key === 'Escape') talk.blur(); });
  document.addEventListener('keydown', (e) => {
    if (e.target === talk || e.target.tagName === 'INPUT') return;
    if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    else if (e.key === 'ArrowRight') stepBeat(1); else if (e.key === 'ArrowLeft') stepBeat(-1);
    else if (e.key === 'Escape') { clearTrace(); select(null); $('#list').hidden = true; $('#sheet').hidden = true; $('#pop').hidden = true; }
    else if (e.key >= '1' && e.key <= '4') setLens(LENSES[Number(e.key) - 1][0]);
    else if (e.key === '/') { e.preventDefault(); talk.focus(); }
    else if (e.key.toLowerCase() === 'f') LM.toggleFeed();
    else if (e.key.toLowerCase() === 's') setSince(LM.view.sinceOn ? null : LM.view.t - LM.ds.win.review);
    else if (e.key.toLowerCase() === 'l') openSheet();
  });
  document.addEventListener('pointerdown', (e) => { const p = $('#pop'); if (!p.hidden && !p.contains(e.target) && !e.target.closest('#sincec,#labc')) p.hidden = true; });
  LM.view.feed = window.innerWidth > 1100;
  syncChrome();
}
function syncChrome() {
  const v = LM.view;
  for (const b of document.querySelectorAll('#lenses .sg')) b.classList.toggle('on', b.dataset.lens === v.lens);
  for (const b of document.querySelectorAll('#overlays .lay')) b.classList.toggle('on', v.overlays.has(b.dataset.o));
  $('#overlays').querySelector('[data-o=revenue]').hidden = !LM.ds.revenue.length;
  const S = SPEEDS[LM.ds.key].find((s) => s[0] === v.speed) || SPEEDS[LM.ds.key][1];
  $('#speed span').textContent = S[1];
  $('#play').innerHTML = v.playing ? I('pause') : I('play');
  $('#play').title = v.playing ? 'Pause' : 'Play';
  $('#date').textContent = LM.fmtDate(v.t, LM.ds.key === 'lucid' && LM.W > 720);
  const sc = $('#sincec'); sc.innerHTML = v.sinceOn ? `${I('history')}<span>Since ${LM.fmtShort(v.since)}</span>` : `${I('history')}<span>Since…</span>`; sc.classList.toggle('on', v.sinceOn);
  $('#feedc').classList.toggle('on', v.feed);
  $('#feed').hidden = !v.feed;
  document.documentElement.classList.toggle('feed-open', v.feed);
  LM.feedState.key = ''; LM.renderLegend();
  writeUrl();
}
LM.toggleFeed = (on) => { LM.view.feed = on === undefined ? !LM.view.feed : on; resize(); syncChrome(); };
function updateCrumbs() {
  const v = LM.view, ds = LM.ds;
  const W = LM.where();
  const parts = [`<button class="crumb" data-up="0">${LM.esc(ds.name)}</button>`];
  if (W.land && LM.lod >= 1) { const info = LM.landInfo(ds, v.lens, W.land.key); parts.push(`<button class="crumb h-${info.hue}" data-land="${W.land.key}">${LM_SVG(info.lm, 16)}${LM.esc(info.name)}</button>`); }
  if (W.dist && LM.lod >= 2) parts.push(`<button class="crumb" data-dist="${W.dist.key}">${LM.esc(LM.distName(ds, v.lens, W.dist.key).slice(0, 26))}</button>`);
  if (v.sel && v.sel.id && LM.lod >= 3) parts.push(`<b>${LM.esc(v.sel.short)}</b>`);
  const html = `<i data-lucide="total-mark" class="ic"></i>` + parts.join(I('chevron-right'));
  const c = $('#crumbs');
  if (c.dataset.html !== html) {
    c.innerHTML = html; c.dataset.html = html; marks(c);
    c.querySelector('[data-up]').onclick = () => { select(null); LM.flyTo(null, null, 3.2); };
    for (const b of c.querySelectorAll('[data-land]')) b.onclick = () => flyToLand(b.dataset.land);
    for (const b of c.querySelectorAll('[data-dist]')) b.onclick = () => flyToDistrict(b.dataset.dist);
  }
}
function popAt(anchor, html) {
  const p = $('#pop'); p.innerHTML = html; p.hidden = false;
  const r = anchor.getBoundingClientRect(); p.style.top = r.bottom + 8 + 'px'; p.style.right = Math.max(12, window.innerWidth - r.right) + 'px'; p.style.left = 'auto';
  marks(p);
  return p;
}
function sinceMenu(e) {
  const ds = LM.ds, t = LM.view.t, D = LM.DAY;
  const opts = ds.key === 'lucid' ? [['Yesterday', t - D], ['Two days', t - 2 * D], ['Since Oct 24', Date.parse('2026-10-24T00:00')], ['The whole build', ds.span[0]]] : [['Last week', t - 7 * D], ['Last month', t - 30 * D], ['Last quarter', t - 91 * D], ['Last year', t - 365 * D]];
  const p = popAt(e.currentTarget, `<span class="lbl2">Since you last looked</span><div class="col" style="gap:4px">${opts.map(([n, tt]) => `<button class="row mrow" data-t="${tt}">${I('history')}<span>${n}</span><em>${LM.fmtShort(tt)}</em></button>`).join('')}<button class="row mrow" data-mark="1">${I('check')}<span>Mark now as reviewed</span><em>${LM.fmtShort(t)}</em></button><button class="row mrow" data-off="1">${I('eye-off')}<span>Off</span></button></div><div class="meta">Changed buildings carry a badge; the rest dim. Drag the handle on the rail to move it.</div>`);
  for (const b of p.querySelectorAll('[data-t]')) b.onclick = () => { setSince(Number(b.dataset.t)); p.hidden = true; };
  p.querySelector('[data-mark]').onclick = () => { LM.reviewed = t; setSince(t); p.hidden = true; say(`Marked ${LM.fmtDate(t)} as reviewed; move forward in time to see what changes after it.`); };
  p.querySelector('[data-off]').onclick = () => { setSince(null); p.hidden = true; };
}
function setSince(t) {
  const v = LM.view;
  if (t === null) v.sinceOn = false; else { v.sinceOn = true; v.since = Math.max(LM.ds.span[0], Math.min(v.t - 60e3, t)); }
  LM.sinceCache = null; syncChrome(); LM.dirty();
  if (v.sinceOn) { const c = LM.changes(LM.ds, v.lens, v.since, v.t); say(`<b>Since ${LM.fmtShort(v.since)}</b> · ${c.counts.n} buildings changed: ${c.counts.new} new, ${c.counts.progressed} moved on, ${c.counts.done} lit${c.counts.blocked ? `, <em>${c.counts.blocked} blocked</em>` : ''}${c.decisions.length ? ` · ${c.decisions.length} decisions` : ''}. The rest of the world is dimmed.`, 8000); }
}
LM.setSince = setSince;
function labMenu(e) {
  const r = document.documentElement;
  const p = popAt(e.currentTarget, `<span class="lbl2">Theme</span><div class="seg">${THEMES.map(([k, n, ic]) => `<button class="sg${r.dataset.pt === k ? ' on' : ''}" data-pt="${k}">${I(ic)}<span>${n}</span></button>`).join('')}</div>
    <span class="lbl2">Contrast</span><div class="seg"><button class="sg${r.dataset.hc !== 'high' ? ' on' : ''}" data-hc="std">${I('circle')}<span>Standard</span></button><button class="sg${r.dataset.hc === 'high' ? ' on' : ''}" data-hc="high">${I('contrast')}<span>High</span></button></div>
    <span class="lbl2">Dataset</span><div class="seg dsw">${[['lucid', 'Lucid Chat', 'real'], ['example', 'Example company', 'generated']].map(([k, n, sub]) => `<button class="sg${LM.ds.key === k ? ' on' : ''}" data-ds="${k}"><span>${n}</span><small>${sub}</small></button>`).join('')}</div>
    <span class="lbl2">Motion</span><div class="seg"><button class="sg${!LM.view.reduce ? ' on' : ''}" data-mo="0">${I('activity')}<span>Full</span></button><button class="sg${LM.view.reduce ? ' on' : ''}" data-mo="1">${I('minus')}<span>Reduced</span></button></div>`);
  for (const b of p.querySelectorAll('[data-pt]')) b.onclick = () => { r.dataset.pt = b.dataset.pt; LM.readTheme(); LM.dirty(); writeUrl(); labMenu(e); };
  for (const b of p.querySelectorAll('[data-hc]')) b.onclick = () => { r.dataset.hc = b.dataset.hc; LM.view.hc = b.dataset.hc === 'high'; LM.readTheme(); LM.dirty(); writeUrl(); labMenu(e); };
  for (const b of p.querySelectorAll('[data-mo]')) b.onclick = () => { LM.view.reduce = b.dataset.mo === '1'; LM.dirty(); labMenu(e); };
  for (const b of p.querySelectorAll('[data-ds]')) b.onclick = () => { if (b.dataset.ds !== LM.ds.key) { LM.setDataset(b.dataset.ds); setTime(LM.ds.now); say(`${LM.ds.name}: ${LM.ds.sub}`); syncChrome(); } p.hidden = true; };
}

function setLens(k) {
  if (k === LM.view.lens || !LM.worlds[k]) return;
  LM.lensAnim = LM.view.reduce ? null : { from: LM.view.lens, to: k, t0: performance.now() };
  LM.view.lens = k; LM.sinceCache = null;
  if (LM.view.trace) LM.view.trace = buildTrace(LM.view.trace.kind, LM.view.trace.dec || LM.view.trace.it);
  syncChrome(); LM.dirty();
}
function toggleOverlay(k, on) {
  const O = LM.view.overlays;
  const want = on === undefined ? !O.has(k) : on;
  if (want) { for (const o of Array.from(O)) if (CHANNEL[o] === CHANNEL[k] && o !== k) O.delete(o); O.add(k); } else O.delete(k);
  syncChrome(); LM.dirty();
}
function togglePlay(on) {
  const v = LM.view;
  v.playing = on === undefined ? !v.playing : on;
  if (v.playing && v.t >= LM.ds.span[1] - 1) { v.t = LM.ds.span[0]; LM.cam = LM.fitAt(v.t); LM.autoFit = true; }
  LM.ledgerT = v.t; LM.playLast = 0;
  if (!v.playing) for (const c of LM.cards) LM.foldCard(c);
  syncChrome(); LM.dirty();
}
function setTime(t, fromPlay) {
  const v = LM.view, ds = LM.ds;
  const prev = v.t;
  v.t = Math.max(ds.span[0], Math.min(ds.span[1], t));
  if (v.sinceOn && v.since >= v.t) v.since = Math.max(ds.span[0], v.t - 60e3);
  LM.sinceCache = null;
  if (fromPlay) {
    const evs = []; for (const e of ds.events) { if (e.t <= prev) continue; if (e.t > v.t) break; evs.push(e); }
    if (evs.length) { LM.spawnCards(evs, v.t); ledger(evs); LM.flashT0 = prev; LM.flashUntil = performance.now() + 1400; }
  } else { LM.ledgerT = v.t; }
  $('#date').textContent = LM.fmtDate(v.t, ds.key === 'lucid' && LM.W > 720);
  if (v.sel) renderView();
  LM.dirty();
}
function stepBeat(dir) {
  const ds = LM.ds, t = LM.view.t;
  const ticks = [...ds.decisions.map((d) => d.b), ...ds.milestones.map((m) => m.t), ds.now, ds.span[0], ds.span[1]].sort((a, b) => a - b);
  const next = dir > 0 ? ticks.find((x) => x > t + 1000) : ticks.slice().reverse().find((x) => x < t - 1000);
  if (next !== undefined) { setTime(next); const d = ds.decisions.find((d) => d.b === next); if (d) say(`${LM.fmtDate(next)} · <b>Decided</b> ${LM.esc(d.n)}`); }
}
function ledger(evs) {
  const ds = LM.ds, v = LM.view;
  const counts = new Map(); const lines = [];
  for (const e of evs) {
    if (e.kind === 'decision') lines.push(`<b>Decided</b> ${LM.esc(e.d.n.slice(0, 70))}`);
    else if (e.kind === 'milestone') lines.push(`<b>Landmark</b> ${LM.esc(e.m.n)}`);
    else if (e.it && e.kind !== 'land') { const g = LM.groupAt(e.it, v.lens, e.t).g; const c = counts.get(g) || { birth: 0, done: 0, blocked: 0, doing: 0 }; if (e.kind === 'birth') c.birth++; else if (e.kind === 'done') c.done++; else if (e.kind === 'blocked') c.blocked++; else if (e.kind === 'doing') c.doing++; counts.set(g, c); }
  }
  const summary = [...counts.entries()].sort((a, b) => (b[1].birth + b[1].done + b[1].blocked) - (a[1].birth + a[1].done + a[1].blocked)).slice(0, 3)
    .map(([g, c]) => { const p = []; if (c.birth) p.push(`${c.birth} new`); if (c.doing) p.push(`${c.doing} rising`); if (c.done) p.push(`${c.done} lit`); if (c.blocked) p.push(`<em>${c.blocked} blocked</em>`); return p.length ? `<b>${LM.esc(LM.landInfo(ds, v.lens, g).name)}</b> ${p.join(', ')}` : ''; }).filter(Boolean);
  const all = [...lines.slice(0, 2), ...summary].slice(0, 3);
  const L = $('#ledger');
  if (all.length) { L.innerHTML = all.map((l) => `<div>${l}</div>`).join(''); L.classList.add('on'); LM.ledgerUntil = performance.now() + 2200; }
  else if (LM.ledgerUntil && performance.now() > LM.ledgerUntil) L.classList.remove('on');
}
function say(msg, ms = 6000) { const t = $('#toast'); t.innerHTML = msg; t.classList.add('on'); LM.toastUntil = performance.now() + ms; }
LM.say = say;

// ---- the rail ----
function drawRail() {
  const ctx = LM.railctx, W = LM.railW, H = LM.railH, ds = LM.ds, T = LM.theme, v = LM.view;
  if (!W) return;
  ctx.clearRect(0, 0, W, H);
  const [t0, t1] = ds.span, x = (t) => ((t - t0) / (t1 - t0)) * W;
  const bands = Object.entries(ds.lenses.proj.lands).filter(([, l]) => typeof l.from === 'number');
  for (const [, l] of bands) { const a = x(l.from), b = x(l.to || t1); ctx.fillStyle = LM.rgba(T.hues[l.hue] || T.hues.slate, 0.12); ctx.fillRect(a, 4, Math.max(2, b - a), H - 8); }
  if (ds.now < t1) { ctx.fillStyle = T.ink(0.05); ctx.fillRect(x(ds.now), 0, W - x(ds.now), H); }
  if (v.sinceOn) { ctx.fillStyle = LM.rgba(T.heat, 0.16); ctx.fillRect(x(v.since), 0, Math.max(2, x(v.t) - x(v.since)), H); ctx.fillStyle = LM.rgba(T.heat, 0.95); ctx.fillRect(x(v.since) - 1, 0, 2, H); ctx.beginPath(); ctx.arc(x(v.since), H - 5, 4.5, 0, Math.PI * 2); ctx.fill(); }
  for (const d of ds.decisions) { ctx.fillStyle = LM.rgba(T.rules, d.who === 'owner' ? 0.9 : 0.4); ctx.fillRect(x(d.b), d.who === 'owner' ? H * 0.3 : H * 0.5, 1.2, d.who === 'owner' ? H * 0.5 : H * 0.3); }
  for (const m of ds.milestones) { ctx.fillStyle = LM.rgba(T.gold, 0.95); ctx.fillRect(x(m.t) - 0.5, H * 0.15, 1.5, H * 0.7); ctx.beginPath(); ctx.arc(x(m.t), H * 0.15, 2.8, 0, Math.PI * 2); ctx.fill(); }
  if (ds.crisis) { ctx.fillStyle = LM.rgba(T.sharp, 0.25); ctx.fillRect(x(ds.crisis.from), 2, Math.max(2, x(ds.crisis.to) - x(ds.crisis.from)), H - 4); }
  ctx.fillStyle = T.ink(0.7); ctx.fillRect(x(ds.now) - 0.5, 0, 1, H);
  const px = x(v.t);
  ctx.fillStyle = T.ink(0.95); ctx.fillRect(px - 1, 0, 2, H);
  ctx.beginPath(); ctx.moveTo(px - 5, 0); ctx.lineTo(px + 5, 0); ctx.lineTo(px, 6); ctx.closePath(); ctx.fill();
  if (v.trace && v.trace.dec) { ctx.fillStyle = LM.rgba(T.gold, 1); ctx.beginPath(); ctx.arc(x(v.trace.dec.b), H * 0.5, 4, 0, Math.PI * 2); ctx.fill(); }
}
function bindRail() {
  const c = LM.railc;
  let down = null;
  const at = (e) => { const r = c.getBoundingClientRect(); const f = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); return LM.ds.span[0] + f * (LM.ds.span[1] - LM.ds.span[0]); };
  c.addEventListener('pointerdown', (e) => { c.setPointerCapture(e.pointerId); const r = c.getBoundingClientRect(); const sx = ((LM.view.since - LM.ds.span[0]) / (LM.ds.span[1] - LM.ds.span[0])) * r.width; down = LM.view.since && LM.view.sinceOn && Math.abs(e.clientX - r.left - sx) < 8 ? 'since' : 'time'; if (down === 'since') setSince(at(e)); else setTime(at(e)); });
  c.addEventListener('pointermove', (e) => { if (down === 'since') { LM.view.since = Math.max(LM.ds.span[0], Math.min(LM.view.t - 60e3, at(e))); LM.sinceCache = null; syncChrome(); LM.dirty(); } else if (down) setTime(at(e)); });
  const up = () => { down = null; };
  c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
}

// ---- the map ----
function bindMap() {
  const c = LM.canvas;
  let drag = null, pinch = null, moved = false;
  const pts = new Map();
  c.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, [e.clientX, e.clientY]); c.setPointerCapture(e.pointerId); moved = false; if (pts.size === 1) drag = { x: e.clientX, y: e.clientY, cx: LM.cam.x, cy: LM.cam.y }; else if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k: LM.cam.k }; drag = null; } });
  c.addEventListener('pointermove', (e) => {
    if (pts.has(e.pointerId)) pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pinch && pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (pinch.k * d) / pinch.d / LM.cam.k); moved = true; return; }
    if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.hypot(dx, dy) > 3) { moved = true; LM.autoFit = false; } LM.cam.x = drag.cx - dx / LM.cam.k; LM.cam.y = drag.cy - dy / (LM.cam.k * 0.92); LM.flight = null; LM.dirty(); return; }
    const h = LM.hit(e.clientX, e.clientY);
    const it = h && h.it ? h.it : h && h.mon ? h : null;
    if (it !== LM.view.hover) { LM.view.hover = it; c.style.cursor = h && (h.it || h.mon || h.lm || h.district) ? 'pointer' : 'grab'; LM.dirty(); }
  });
  const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (pts.size === 0) { const wasDrag = drag; drag = null; if (!moved && wasDrag) click(e.clientX, e.clientY); writeUrl(); } };
  c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
  c.addEventListener('wheel', (e) => { e.preventDefault(); const f = Math.exp(-e.deltaY * 0.0016); zoomAt(e.clientX, e.clientY, f); }, { passive: false });
  c.addEventListener('dblclick', (e) => { const [wx, wy] = LM.toWorld(e.clientX, e.clientY); LM.flyTo(wx, wy, LM.cam.k * 2.4); });
}
function zoomAt(sx, sy, f) {
  const [wx, wy] = LM.toWorld(sx, sy);
  LM.cam.k = Math.max(1.2, Math.min(140, LM.cam.k * f)); LM.autoFit = false;
  const [nx, ny] = LM.toWorld(sx, sy);
  LM.cam.x += wx - nx; LM.cam.y += wy - ny; LM.flight = null; LM.dirty(); writeUrl();
}
LM.flyTo = function flyTo(x, y, k, ms = 800) {
  if (x === null) { const w = LM.worlds[LM.view.lens].extent; x = (w.minx + w.maxx) / 2 + (LM.view.feed && LM.W > 1100 ? 150 / k : 0); y = (w.miny + w.maxy) / 2 + 8 / k; }
  LM.autoFit = false;
  LM.flight = { x0: LM.cam.x, y0: LM.cam.y, k0: LM.cam.k, x1: x, y1: y, k1: k, t0: performance.now(), ms: LM.view.reduce ? 1 : ms };
  LM.dirty();
};
function flyToLand(g) { const L = LM.vis && LM.vis.lands.get(g); if (!L) return; LM.flyTo(L.cx, L.cy + 1, Math.max(12, Math.min(26, 220 / Math.sqrt(L.n + 1)))); }
function flyToDistrict(d) { const D = LM.vis && LM.vis.districts.get(d); if (!D) return; LM.flyTo(D.cx, D.cy + 0.5, Math.max(26, Math.min(60, 300 / Math.sqrt(D.n + 1)))); }
function click(sx, sy) {
  const h = LM.hit(sx, sy);
  if (!h) { select(null); return; }
  if (h.it) { select(h.it); if (LM.lod < 3) LM.flyTo(h.x, h.y + 0.6, 64); return; }
  if (h.mon) { select({ mon: h.mon, v: h }); if (LM.lod < 2) LM.flyTo(h.x, h.y, 40); return; }
  if (h.lm) { select({ lm: h.lm, v: h }); return; }
  if (h.district) { if (LM.lod < 2) flyToDistrict(h.district.key); else select({ district: h.district }); return; }
  if (h.land) { if (LM.lod < 1) flyToLand(h.land.key); else select({ land: h.land }); }
}

// ---- selection and the views ----
function select(x) { LM.view.sel = x; renderView(); LM.dirty(); writeUrl(); }
LM.select = select; LM.setTrace = (k, x) => setTrace(k, x); LM.flyToLand = flyToLand; LM.flyToDistrict = flyToDistrict; LM.togglePlay = togglePlay; LM.setTime = setTime; LM.setLens = setLens; LM.toggleOverlay = toggleOverlay;
function act(name) { say(`<b>${name}</b> — in the product this acts (docs/17 LM-A); here it is a mock.`, 3000); }
const facadeBig = (f, cls = '') => `<span class="fac ${cls}">${LM.FACADES[LM.FACADES[f] ? f : 'doc']}</span>`;

function renderView() {
  const V = $('#pv'), s = LM.view.sel, ds = LM.ds, v = LM.view;
  $('#dim').hidden = !s;
  if (!s) { V.hidden = true; return; }
  const close = `<button class="ic x" id="pvx" title="Close">${I('x')}</button>`;
  const acts = (list) => `<div class="acts">${list.map(([ico, n, fn, cls]) => `<button class="pill${cls ? ' ' + cls : ''}" data-a="${fn}">${I(ico)}<span>${n}</span></button>`).join('')}</div>`;
  let html = '';
  if (s.id) html = itemView(s, close, acts);
  else if (s.mon) html = flagView(s.mon, close, acts);
  else if (s.lm) html = `${close}<div class="pvh">${gl2('milestone', 'gold', 'lg')}<div><span class="lbl2">Landmark · ${LM.fmtDate(s.lm.t)}</span><span class="ttl t4">${LM.esc(s.lm.n)}</span></div></div><div class="line1">${gl2('milestone', 'gold')}<span>A milestone met. It stays on the skyline for ever: finished things stay visible.</span></div>${acts([['play', 'Play from here', 'playLm'], ['message-circle-question', 'Ask', 'ask']])}`;
  else if (s.district) html = placeView(s.district, 'district', close, acts);
  else if (s.land) html = placeView(s.land, 'land', close, acts);
  V.innerHTML = html; V.hidden = false; marks(V);
  $('#pvx').onclick = () => select(null);
  for (const b of V.querySelectorAll('[data-dec]')) b.onclick = () => { const d = ds.decisions.find((x) => x.id === b.dataset.dec); if (d) { setTrace('decision', d); } };
  for (const b of V.querySelectorAll('[data-dist]')) b.onclick = () => { select(null); flyToDistrict(b.dataset.dist); };
  for (const b of V.querySelectorAll('[data-open]')) b.onclick = () => { const it = ds.byId.get(b.dataset.open); if (it) { const p = LM.posOf && LM.posOf.get(it.id); if (p) LM.flyTo(p.x, p.y + 0.6, Math.max(LM.cam.k, 64)); select(it); } };
  for (const b of V.querySelectorAll('.acts .pill')) b.onclick = () => {
    const a = b.dataset.a;
    if (a === 'traceItem') { select(null); setTrace('item', s); } else if (a === 'traceDec') { select(null); setTrace('decision', s.mon); }
    else if (a === 'playItem') { select(null); setTime(s.b); togglePlay(true); } else if (a === 'playDec') { select(null); setTime(s.mon.b - 1000); togglePlay(true); setTrace('decision', s.mon); }
    else if (a === 'playLm') { select(null); setTime(s.lm.t - LM.ds.win.stale); togglePlay(true); }
    else if (a === 'flyD') { select(null); flyToDistrict(s.district.key); } else if (a === 'playD') { select(null); const first = Math.min(...s.district.items.map((x) => x.t || x.it.b)); setTime(first); togglePlay(true); }
    else if (a === 'flyL') { select(null); flyToLand(s.land.key); } else if (a === 'playL') { select(null); const first = Math.min(...s.land.items.map((x) => x.t || x.it.b)); setTime(first); togglePlay(true); }
    else if (a === 'sinceHere') { select(null); setSince(LM.view.t - LM.ds.win.review); }
    else act(b.textContent.trim());
  };
}
function itemView(it, close, acts) {
  const ds = LM.ds, v = LM.view, st = LM.stateAt(ds, it, v.t);
  const { g, d } = LM.groupAt(it, v.lens, v.t);
  const land = LM.landInfo(ds, v.lens, g), who = LM.who(it);
  const word = st ? LM.STATUS_WORD[st.s] : 'Not yet';
  const rooms = LM.rooms(it, st); const met = rooms.filter((r) => r.st === 'met').length, partly = rooms.find((r) => r.st === 'partly') || rooms.find((r) => r.st === 'open');
  const dec = it.dec && ds.decisions.find((x) => x.id === it.dec);
  const ups = it.dep.map((id) => ds.byId.get(id)).filter(Boolean), downs = ds.items.filter((o) => o.dep.includes(it.id));
  const facadeKey = LM.FACADES[it.f] ? it.f : 'doc';
  const h = st ? (st.done ? 1 : st.h) : 0;
  // the product, large: expected (ghost) and actual under a split at the done share
  const cmp = `<div class="cmp" style="--split:${Math.round((1 - h) * 100)}%"><span class="side exp">${facadeBig(facadeKey)}</span><span class="side act">${facadeBig(facadeKey)}</span><span class="split"></span><span class="knob">${I('chevrons-left-right')}</span><span class="tag" style="inset-inline-start:14px">${I('pencil-ruler')}Expected · the brief</span><span class="tag" style="inset-inline-end:14px">${I('camera')}Actual · ${st && st.done ? 'the product' : `${Math.round(h * 100)} % built`}</span>${st && st.blocked ? `<span class="barrier breach" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">${I('construction')}</span>` : ''}</div>`;
  const goal = `<div class="line1">${glyph('goal')}<span><b>Goal</b>  Serves ${LM.esc(land.name)}: ${LM.esc(land.sub || 'its part of the company')}</span></div>
    <div class="line1">${glyph('milestone')}<span><b>Done when</b>  ${rooms.map((r) => r.name.toLowerCase()).join(', ')}.</span></div>`;
  const left = `<div class="col" style="gap:18px"><div class="pvh">${glyph(it.k, 'lg')}<span class="ttl t4">${LM.esc(it.n.length > 110 ? it.n.slice(0, 108) + '…' : it.n)}</span></div>${st && st.done ? doneRipple(it, downs) : cmp}${goal}</div>`;
  const ctx = `<div class="ctx">${chip(`<span class="h-${land.hue}" style="display:inline-flex">${LM_SVG(land.lm, 16)}</span>`, land.name, '', `data-land="${g}"`)}${chip('map-pin', LM.distName(ds, v.lens, d).slice(0, 28))}${dec ? chip('signpost', `Spawned by ${dec.id}`, '', `data-dec="${dec.id}"`) : ''}${chip(av(who), who.name)}${chip(st && st.blocked ? 'construction' : st && st.done ? 'circle-check-big' : 'circle-dot', word, st && st.blocked ? 'block' : '')}${chip('clock', `Since ${LM.fmtShort(st ? st.since : it.b)}`)}${it.cost ? chip('flame', LM.fmtMoney(st ? st.cost : 0)) : ''}${chip('ruler', `Size ${it.s}`)}</div>`;
  const crit = `<div class="row" style="gap:22px;align-items:flex-start"><span class="critr">${ringSvg(140, 0, { segs: rooms.map((r) => r.st), w: 10, gap: 3, hi: rooms.indexOf(partly), label: `Criteria: ${met} of ${rooms.length} met` })}<span class="critc"><span class="ttl t3">${met} of ${rooms.length}</span><span class="meta">criteria met</span></span></span>
    <div class="col" style="gap:6px;flex:1">${rooms.map((r) => `<span class="row rm ${r.st}">${I(r.st === 'met' ? 'circle-check-big' : r.st === 'partly' ? 'contrast' : 'circle-dashed')}<span>${r.name}</span></span>`).join('')}</div></div>`;
  const hist = it.st.map(([t, s]) => `<div class="say">${av(who, 'md')}<span class="bub"><span class="who">${LM.esc(who.name)}</span>${LM.STATUS_WORD[s] || s}<span class="meta" style="margin-inline-start:8px">${LM.fmtDate(t, ds.key === 'lucid')}</span></span></div>`).join('');
  const aiLine = st ? (st.done ? `Lit ${LM.dur(it.doneAt - it.b)} after it was born${downs.length ? `; ${downs.length} building${downs.length > 1 ? 's' : ''} waited on it` : ''}.` : st.blocked ? `Blocked since ${LM.fmtShort(st.since)}${ups.length ? `; it waits on ${LM.esc(ups[0].short)}` : ''}. Nudge the upstream or re-plan.` : st.s === 'todo' ? `Planned, not started. ${ups.length ? `It waits on ${ups.length} building${ups.length > 1 ? 's' : ''}.` : 'Nothing stands in its way.'}` : `${Math.round(h * 100)} % built, ${word.toLowerCase()} since ${LM.fmtShort(st.since)}${st.stale ? '; nothing has moved for a while' : ''}.`) : 'Not born yet at this moment.';
  const talk = `<div class="col" style="gap:10px">${hist}<div class="say">${AI('g')}<span class="bub ai"><span class="who">Lucid</span>${aiLine}<span class="row" style="gap:8px;margin-top:10px">${pill('check', 'Apply', 'pri sm', 'data-a="apply"')}${pill('file-text', 'Open the log', 'sm', 'data-a="open"')}</span></span></div></div>`;
  const right = `<div class="col" style="gap:24px">${ctx}${crit}${talk}${roadsMini(it, ups, downs, st)}${acts([['move-right', 'Nudge', 'nudge'], ['user-plus', 'Assign', 'assign'], ['check', 'Approve', 'approve'], ['external-link', 'Open', 'open'], ['message-circle-question', 'Ask', 'ask'], ['route', 'Trace', 'traceItem'], ['play', 'Play from here', 'playItem']])}</div>`;
  return `${close}<div class="pvg"><div class="pvl">${left}</div><div class="pvr">${right}</div></div>`;
}
function roadsMini(it, ups, downs, st) {
  const u = ups.slice(0, 3), dn = downs.slice(0, 3);
  const ds = LM.ds, v = LM.view;
  const kb = (o) => { const s = LM.stateAt(ds, o, v.t); return `<button class="bld kind${s && s.done ? ' done' : ''}" data-open="${o.id}" title="${LM.esc(o.n)}">${glyph(o.k)}</button>`; };
  const W = 470, H = 40 + Math.max(u.length, dn.length, 1) * 44;
  const yAt = (i, n) => 30 + (H - 60) * (n > 1 ? i / (n - 1) : 0.5);
  const roads = [...u.map((o, i) => { const s = LM.stateAt(ds, o, v.t); return `<path class="road${s && s.blocked ? ' cut' : ''}" d="M70,${r2(yAt(i, u.length))} C140,${r2(yAt(i, u.length))} 150,${H / 2} 214,${H / 2}" ${s && s.blocked ? 'stroke-dasharray="4 5"' : ''}/>`; }), ...dn.map((o, i) => `<path class="road${i === 0 ? ' crit' : ''}" d="M262,${H / 2} C320,${H / 2} 330,${r2(yAt(i, dn.length))} 400,${r2(yAt(i, dn.length))}"/>`)].join('');
  const nodes = [...u.map((o, i) => `<span style="position:absolute;left:30px;top:${r2(yAt(i, u.length))}px;transform:translate(-50%,-50%)">${kb(o)}${LM.stateAt(ds, o, v.t) && LM.stateAt(ds, o, v.t).blocked ? `<span class="barrier breach" style="position:absolute;right:-16px;top:-10px">${I('construction')}</span>` : ''}</span>`), ...dn.map((o, i) => `<span style="position:absolute;left:420px;top:${r2(yAt(i, dn.length))}px;transform:translate(-50%,-50%)">${kb(o)}</span>`)].join('');
  const me = `<span style="position:absolute;left:238px;top:${H / 2}px;transform:translate(-50%,-50%)"><span class="bld me${st && st.done ? ' done' : st && st.blocked ? ' blk' : ''}">${facadeBig(it.f)}</span></span>`;
  return `<div class="col" style="gap:6px"><span class="lbl2">Roads</span><div style="position:relative;height:${H}px"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="position:absolute;inset:0;width:100%;height:100%" preserveAspectRatio="none" aria-hidden="true">${roads}</svg>${nodes}${me}</div>
    <div class="row" style="justify-content:space-between;font-size:15px;color:var(--muted)"><span class="row" style="gap:6px">${I('hourglass')}${u.length ? `Waits on ${u.length === 1 ? LM.esc(u[0].short) : u.length + ' buildings'}` : 'Waits on nothing'}</span><span class="row" style="gap:6px">${dn.length ? `${dn.length === 1 ? LM.esc(dn[0].short) : dn.length + ' buildings'} wait${dn.length === 1 ? 's' : ''}` : 'Nothing waits on it'}${I('arrow-right')}</span></div></div>`;
}
function doneRipple(it, downs) {
  const ds = LM.ds, v = LM.view;
  const freed = downs.map((o) => ({ o, s: LM.stateAt(ds, o, v.t) })).slice(0, 4);
  const moved = freed.filter((x) => x.s && x.s.s !== 'todo').map((x) => { const seg = x.o.seg.find((sg) => sg.s === 'doing'); return seg ? `<div class="row" style="gap:12px"><span class="datec">${I('calendar')}<s>${LM.fmtShort(seg.t0 + 2 * LM.DAY)}</s>${I('arrow-right')}<span>${LM.fmtShort(seg.t0)}</span></span><span class="mut">${LM.esc(x.o.short)}</span></div>` : ''; }).filter(Boolean).slice(0, 2);
  const told = new Map(); for (const x of freed) { const w = LM.who(x.o); told.set(w.name, w); } told.set(LM.who(it).name, LM.who(it));
  const B = (x, y, o) => `<span style="position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%)"><button class="bld kind lit" data-open="${o.id}" title="${LM.esc(o.n)}">${glyph(o.k)}</button></span>`;
  const spots = [[78, 28], [68, 74], [18, 72], [84, 54]];
  return `<div class="col" style="gap:10px"><span class="lbl2">Done · what it changed</span><div class="cut" style="height:300px"><svg viewBox="0 0 660 300" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">${[60, 110, 170].map((r, i) => `<circle cx="250" cy="150" r="${r}" fill="none" style="stroke:var(--good)" stroke-opacity="${0.5 - i * 0.14}" stroke-width="${3 - i * 0.7}"/>`).join('')}${freed.map((x, i) => `<path class="road${i === 0 ? ' crit' : ''}" d="M250,150 C${300 + i * 10},${120 + i * 20} ${spots[i][0] * 5.6},${spots[i][1] * 2.8} ${spots[i][0] * 6.6},${spots[i][1] * 3}"/>`).join('')}</svg>
    <span style="position:absolute;left:38%;top:50%;transform:translate(-50%,-50%)"><span class="bld done big">${facadeBig(it.f)}<span class="cr">${ringSvg(22, 0, { segs: LM.rooms(it, LM.stateAt(ds, it, v.t)).map((r) => r.st), w: 3, gap: 6 })}</span></span></span>
    ${freed.map((x, i) => B(spots[i][0], spots[i][1], x.o)).join('')}<span class="meta row" style="position:absolute;left:48%;top:30%;gap:6px">${I('route')}${freed.length ? `${freed.length} road${freed.length > 1 ? 's' : ''} opened` : 'nothing waited on it'}</span></div>
    ${moved.length ? `<span class="lbl2">Dates that moved</span>${moved.join('')}` : ''}<span class="lbl2">Told</span><span class="avs">${[...told.values()].slice(0, 6).map((w) => av(w, 'md')).join('')}</span></div>`;
}
function flagView(dcs, close, acts) {
  const ds = LM.ds, v = LM.view;
  const kids = [...dcs.lin].map((id) => ds.byId.get(id)).filter(Boolean);
  const states = kids.map((o) => LM.stateAt(ds, o, v.t)).filter(Boolean);
  const done = states.filter((s) => s.done).length, blocked = states.filter((s) => s.blocked).length;
  const home = dcs.home && dcs.home[v.lens] ? LM.landInfo(ds, v.lens, dcs.home[v.lens]) : null;
  return `${close}<div class="pvg"><div class="pvl"><div class="col" style="gap:18px"><div class="pvh">${glyph('decision', 'lg')}<div><span class="lbl2">Decision · ${LM.fmtDate(dcs.b)} · by the ${dcs.who}</span><span class="ttl t4">${LM.esc(dcs.n)}</span></div></div>
    <div class="cut" style="height:220px;display:grid;place-items:center"><span class="flagbig"><span class="pole"></span><span class="ban">${I('signpost')}${dcs.id}</span></span><span class="meta" style="position:absolute;bottom:14px;left:16px">${kids.length ? `${kids.length} building${kids.length > 1 ? 's' : ''} grew from it · ${done} lit${blocked ? ` · <em>${blocked} blocked</em>` : ''}` : 'No buildings cite it yet'}</span></div>
    ${home ? `<div class="line1">${gl2('map-pin', home.hue)}<span><b>Stands in</b>  ${LM.esc(home.name)}${home.sub ? ': ' + LM.esc(home.sub) : ''}</span></div>` : ''}</div></div>
    <div class="pvr"><div class="col" style="gap:22px"><div class="ctx">${chip('signpost', dcs.id)}${chip(dcs.who === 'owner' ? 'crown' : 'compass', dcs.who === 'owner' ? 'The owner' : 'The lead')}${chip('calendar', LM.fmtShort(dcs.b))}${kids.length ? chip('building-2', `${kids.length} grew from it`) : ''}</div>
    ${kids.length ? `<span class="lbl2">Grew from it</span><div class="col" style="gap:4px">${kids.slice(0, 8).map((o) => { const s = LM.stateAt(ds, o, v.t); return `<button class="row frow" data-open="${o.id}">${glyph(o.k, 'sm')}<span class="grow">${LM.esc(o.short)}</span><em>${s ? LM.STATUS_WORD[s.s] : 'not yet'}</em></button>`; }).join('')}${kids.length > 8 ? `<span class="meta">and ${kids.length - 8} more</span>` : ''}</div>` : ''}
    ${acts([['route', 'Trace its effects', 'traceDec', 'pri'], ['play', 'Play from here', 'playDec'], ['message-circle-question', 'Ask', 'ask']])}</div></div></div>`;
}
function placeView(S, kind, close, acts) {
  const ds = LM.ds, v = LM.view;
  const info = kind === 'land' ? LM.landInfo(ds, v.lens, S.key) : { name: LM.distName(ds, v.lens, S.key), sub: '', hue: LM.landInfo(ds, v.lens, S.land).hue, lm: LM.landInfo(ds, v.lens, S.land).lm };
  const pct = S.size ? S.doneSize / S.size : 0;
  const dists = kind === 'land' ? [...LM.vis.districts.values()].filter((D) => D.land === S.key).sort((a, b) => b.n - a.n).slice(0, 8) : [];
  const flags = S.items.filter((x) => x.mon).map((x) => x.mon).slice(-5).reverse();
  const stuck = S.items.filter((x) => x.it && x.st.blocked).slice(0, 5);
  const owners = new Map(); for (const x of S.items) if (x.it) { const w = LM.who(x.it); const c = owners.get(w.name) || { w, n: 0 }; c.n++; owners.set(w.name, c); }
  const crew = [...owners.values()].sort((a, b) => b.n - a.n).slice(0, 6);
  const words = `${S.built || 0} buildings · ${S.done || 0} lit · ${S.working || 0} rising${S.blocked ? ` · <em>${S.blocked} blocked</em>` : ''}${S.stale ? ` · ${S.stale} still` : ''}`;
  const since = v.sinceOn && LM.since ? (kind === 'land' ? LM.since.places : LM.since.districts).get(S.key) : null;
  const left = `<div class="col" style="gap:18px"><div class="pvh"><div class="place l h-${info.hue}"><span class="md" style="width:132px;height:132px">${ringSvg(132, pct, { w: 6 })}<span class="free">${LM_SVG(info.lm, 84)}</span></span></div><div><span class="lbl2">${kind === 'land' ? 'Land' : 'District of ' + LM.esc(LM.landInfo(ds, v.lens, S.land).name)}</span><span class="ttl t4">${LM.esc(info.name)}</span><span class="mut" style="display:block;margin-top:6px">${LM.esc(info.sub || '')}</span></div></div>
    <div class="line1">${gl2('building-2', info.hue)}<span>${words}</span></div>
    <div class="col" style="gap:6px"><span class="lbl2">How the coast grew</span>${coastline(S, kind)}</div>
    ${since ? `<div class="line1">${gl2('history', 'heat')}<span><b>Since ${LM.fmtShort(v.since)}</b>  ${since.n} changed: ${since.new} new, ${since.progressed} moved on, ${since.done} lit${since.blocked ? `, <em>${since.blocked} blocked</em>` : ''}</span></div>` : ''}</div>`;
  const right = `<div class="col" style="gap:22px">
    ${dists.length ? `<span class="lbl2">Districts</span><div class="col" style="gap:4px">${dists.map((D) => `<button class="row frow" data-dist="${D.key}"><span class="h-${info.hue}" style="display:inline-flex">${ringSvg(26, D.size ? D.doneSize / D.size : 0, { w: 3 })}</span><span class="grow">${LM.esc(LM.distName(ds, v.lens, D.key).slice(0, 40))}</span><em>${D.built} · ${D.done} lit${D.blocked ? ` · ${D.blocked} blk` : ''}</em></button>`).join('')}</div>` : ''}
    ${crew.length ? `<span class="lbl2">Who is here</span><div class="row" style="gap:10px;flex-wrap:wrap">${crew.map(({ w, n }) => `<span class="row" style="gap:6px">${av(w, 'md')}<span>${LM.esc(w.name)}<span class="meta" style="display:block">${n} building${n > 1 ? 's' : ''}</span></span></span>`).join('')}</div>` : ''}
    ${stuck.length ? `<span class="lbl2">Stuck</span><div class="col" style="gap:4px">${stuck.map((x) => `<button class="row frow" data-open="${x.it.id}">${gl2('construction', 'block', 'sm')}<span class="grow">${LM.esc(x.it.short)}</span><em>since ${LM.fmtShort(x.st.since)}</em></button>`).join('')}</div>` : ''}
    ${flags.length ? `<span class="lbl2">Decisions here</span><div class="col" style="gap:4px">${flags.map((d) => `<button class="row frow" data-dec="${d.id}">${glyph('decision', 'sm')}<span class="grow">${LM.esc(d.n.slice(0, 60))}</span><em>${LM.fmtShort(d.b)}</em></button>`).join('')}</div>` : ''}
    ${acts([['locate', 'Fly in', kind === 'land' ? 'flyL' : 'flyD', 'pri'], ['play', 'Play from here', kind === 'land' ? 'playL' : 'playD'], ['history', 'What changed', 'sinceHere'], ['message-circle-question', 'Ask', 'ask']])}</div>`;
  return `${close}<div class="pvg"><div class="pvl">${left}</div><div class="pvr">${right}</div></div>`;
}
function coastline(S, kind) {
  const world = LM.worlds[LM.view.lens], ds = LM.ds, N = 48;
  const counts = new Array(N).fill(0);
  for (const c of world.claims) if ((kind === 'land' ? c.g : c.d) === S.key && c.it) counts[Math.min(N - 1, Math.floor(((c.t - ds.span[0]) / (ds.span[1] - ds.span[0])) * N))]++;
  let acc = 0; const cum = counts.map((n) => (acc += n));
  const max = Math.max(1, acc);
  const pts = cum.map((n, i) => `${(i / (N - 1)) * 100},${30 - (n / max) * 28}`).join(' ');
  const nowX = ((LM.view.t - ds.span[0]) / (ds.span[1] - ds.span[0])) * 100;
  return `<div class="coastl"><svg viewBox="0 0 100 32" preserveAspectRatio="none"><polyline points="0,30 ${pts} 100,30" /><line x1="${nowX}" x2="${nowX}" y1="0" y2="32"/></svg><div class="ax"><span>${LM.fmtShort(ds.span[0])}</span><span>${acc} plots claimed · the region shifts as it grows</span><span>${LM.fmtShort(ds.span[1])}</span></div></div>`;
}

// ---- tracing ----
function buildTrace(kind, x) {
  const ds = LM.ds, v = LM.view;
  if (kind === 'decision') {
    const set = new Set(x.lin), lands = new Set();
    for (const id of set) { const it = ds.byId.get(id); if (it) lands.add(LM.groupAt(it, v.lens, v.t).g); }
    const home = LM.worlds[v.lens].claims.find((c) => c.dec === x); if (home) lands.add(home.g);
    return { kind, dec: x, set, lands };
  }
  const set = new Set([x.id, ...x.dep]);
  for (const o of ds.items) if (o.dep.includes(x.id)) set.add(o.id);
  const lands = new Set(); for (const id of set) { const it = ds.byId.get(id); if (it) lands.add(LM.groupAt(it, v.lens, v.t).g); }
  return { kind, it: x, set, lands };
}
function setTrace(kind, x) {
  LM.view.trace = buildTrace(kind, x);
  if (kind === 'decision') { say(`<b>Tracing</b> ${LM.esc(x.n)} — ${x.lin.size} building${x.lin.size === 1 ? '' : 's'} grew from it. <button class="link" id="playhere">Play from here</button> · Esc clears`, 12000); setTimeout(() => { const b = $('#playhere'); if (b) b.onclick = () => { setTime(x.b - 1000); togglePlay(true); }; }, 0); }
  else say(`<b>Tracing</b> ${LM.esc(x.short)} — its pipes in and out. Esc clears`, 6000);
  LM.dirty(); writeUrl();
}
function clearTrace() { if (LM.view.trace) { LM.view.trace = null; LM.dirty(); writeUrl(); } }
function toggleList() {
  const L = $('#list'); if (!L.hidden) { L.hidden = true; return; }
  const ds = LM.ds;
  L.innerHTML = `<div class="lh"><input id="lfind" placeholder="Find a decision"><button class="ic" id="lx">${I('x')}</button></div><div class="lb"></div>`;
  const body = L.querySelector('.lb');
  const render = (q = '') => { body.innerHTML = ds.decisions.filter((d) => !q || (d.n + ' ' + d.id).toLowerCase().includes(q.toLowerCase())).slice(-400).reverse().map((d) => `<button class="row frow" data-id="${d.id}">${glyph('decision', 'sm')}<span class="grow"><b>${d.id}</b> ${LM.esc(d.n.slice(0, 70))}</span><em>${LM.fmtShort(d.b)}${d.lin.size ? ` · ${d.lin.size}` : ''}</em></button>`).join(''); for (const b of body.querySelectorAll('.frow')) b.onclick = () => { const d = ds.decisions.find((x) => x.id === b.dataset.id); L.hidden = true; setTime(Math.max(d.b, LM.view.t)); setTrace('decision', d); const c = LM.worlds[LM.view.lens].claims.find((cc) => cc.dec === d); if (c) { const [x, y] = LM.hexXY(c.q, c.r); LM.flyTo(x, y, Math.max(LM.cam.k, 18)); select({ mon: d, v: c }); } }; };
  render(); L.hidden = false;
  $('#lfind').oninput = (e) => render(e.target.value); $('#lfind').focus();
  $('#lx').onclick = () => { L.hidden = true; };
}

// ---- the legend sheet: the grammar of the map, with live samples ----
function thumb(draw, w = 88, h = 64) {
  const c = document.createElement('canvas'); const dpr = 2; c.width = w * dpr; c.height = h * dpr; c.style.width = w + 'px'; c.style.height = h + 'px';
  const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(ctx, w, h, LM.theme); return c;
}
function tileSample(ctx, cx, cy, k, status, T, opts = {}) {
  const hue = T.hues.sky, kHue = T.hues.sky;
  const remaining = status === 'done' ? 0 : status === 'todo' ? 1 : 0.5;
  const Hpx = (0.08 + remaining * 0.26) * k;
  let top = LM.mix(LM.mix(hue, T.sea, 0.62), T.paper, status === 'done' ? 0.45 : 0.2), edge = T.ink(0.25), edgeW = 1, alpha = 0.92;
  if (status === 'done') { top = LM.mix(LM.mix(hue, T.paper, 0.42), T.lit, 0.25); edge = LM.rgba(T.good, 0.85); edgeW = 1.5; }
  if (status === 'todo') { top = LM.mix(hue, T.sea, 0.8); alpha = 0.5; edge = T.ink(0.5); }
  if (status === 'blocked') { top = LM.mix(hue, T.black, 0.5); edge = LM.rgba(T.coral, 0.9); edgeW = 1.5; }
  if (status === 'review') { edge = LM.rgba(T.ai, 0.9); edgeW = 1.5; }
  if (status === 'park') { LM.hexPath(ctx, cx, cy, k, 0.86); ctx.fillStyle = LM.rgba(T.lime, 0.14); ctx.fill(); ctx.strokeStyle = LM.rgba(T.lime, 0.3); ctx.stroke(); LM.icon(ctx, 'trees', cx, cy, k * 0.5, LM.rgba(T.lime, 0.7), 1.8); return; }
  ctx.beginPath(); for (const i of [5, 0, 1, 2, 3]) { const [x, y] = LM.hexCorner(0, 0, i, 0.86); ctx.lineTo(cx + x * k, cy + y * k * 0.92); } for (const i of [3, 2, 1, 0, 5]) { const [x, y] = LM.hexCorner(0, 0, i, 0.86); ctx.lineTo(cx + x * k, cy + y * k * 0.92 - Hpx); } ctx.closePath(); ctx.fillStyle = LM.rgba(LM.mix(top, T.black, 0.5), alpha); ctx.fill();
  LM.hexPath(ctx, cx, cy, k, 0.86, Hpx); ctx.fillStyle = LM.rgba(top, alpha); ctx.fill(); ctx.lineWidth = edgeW; ctx.strokeStyle = edge; ctx.setLineDash(status === 'todo' ? [3, 3] : []); ctx.stroke(); ctx.setLineDash([]);
  const r = k * 0.34, cy0 = cy - Hpx;
  ctx.beginPath(); ctx.arc(cx, cy0, r, 0, Math.PI * 2); ctx.fillStyle = LM.rgba(LM.mix(kHue, T.sea, 0.72), 0.95); ctx.fill(); ctx.strokeStyle = LM.rgba(kHue, 0.5); ctx.lineWidth = 1; ctx.stroke();
  LM.icon(ctx, 'square-check-big', cx, cy0, r * 1.15, LM.rgba(kHue, 1), 2.1);
  const pct = status === 'done' ? 1 : status === 'todo' ? 0 : 0.5;
  ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy0, r + 4, 0, Math.PI * 2); ctx.strokeStyle = T.ink(0.18); ctx.stroke(); if (pct) { ctx.beginPath(); ctx.arc(cx, cy0, r + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct); ctx.strokeStyle = status === 'done' ? LM.rgba(T.good, 1) : status === 'blocked' ? LM.rgba(T.coral, 1) : LM.rgba(LM.mix(hue, T.paper, 0.4), 1); ctx.stroke(); }
  if (status === 'blocked') { ctx.beginPath(); ctx.arc(cx + k * 0.5, cy0 - k * 0.5, 7, 0, Math.PI * 2); ctx.fillStyle = LM.rgba(T.g2, 0.95); ctx.fill(); ctx.strokeStyle = T.ink(0.45); ctx.stroke(); LM.icon(ctx, 'construction', cx + k * 0.5, cy0 - k * 0.5, 8, LM.rgba(T.fg, 1), 2); }
  if (opts.badge) LM.drawBadge(ctx, opts.badge, cx + k * 0.52, cy0 + k * 0.5, 7, T);
}
function openSheet() {
  const S = $('#sheet'); if (!S.hidden) { S.hidden = true; return; }
  const ds = LM.ds, v = LM.view, T = LM.theme;
  const item = (name, c, sub = '') => { const d = el('div', 'li'); d.innerHTML = `<div class="th"></div><b>${name}</b>${sub ? `<span class="meta">${sub}</span>` : ''}`; d.querySelector('.th').appendChild(c); return d; };
  const blob = (ctx, w, h, T, fillA, hue) => { ctx.beginPath(); ctx.moveTo(10, 30); ctx.bezierCurveTo(8, 8, 40, 4, 60, 10); ctx.bezierCurveTo(84, 16, 86, 44, 70, 54); ctx.bezierCurveTo(50, 62, 20, 60, 12, 48); ctx.closePath(); if (!T.hc) { ctx.lineWidth = 8; ctx.strokeStyle = LM.rgba(T.hues.sky, 0.16); ctx.stroke(); } ctx.fillStyle = T.light ? 'rgba(255,255,255,.55)' : T.ink(fillA); ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = T.light ? 'rgba(15,31,58,.25)' : T.ink(0.22); ctx.stroke(); if (hue) { ctx.save(); ctx.clip(); const g = ctx.createRadialGradient(44, 32, 0, 44, 32, 40); g.addColorStop(0, LM.rgba(hue, 0.25)); g.addColorStop(1, LM.rgba(hue, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.restore(); } };
  const elements = [
    ['Land', thumb((ctx, w, h, T) => { blob(ctx, w, h, T, 0.065, T.hues.sky); LM.landmark(ctx, 'skyline', 44, 30, 26, LM.rgba(T.hues.sky, 0.9), 2.2); }), 'a department, project, product or person; its coast is its history'],
    ['District', thumb((ctx, w, h, T) => { blob(ctx, w, h, T, 0.065, T.hues.sky); ctx.beginPath(); ctx.ellipse(36, 30, 18, 12, 0, 0, Math.PI * 2); ctx.strokeStyle = T.ink(0.16); ctx.stroke(); ctx.beginPath(); ctx.ellipse(60, 38, 14, 11, 0, 0, Math.PI * 2); ctx.stroke(); }), 'a programme, wave or stream: a faint contour inside its land'],
    ['Planned', thumb((ctx, w, h, T) => tileSample(ctx, 44, 38, 22, 'todo', T)), 'a claimed plot, dashed'],
    ['Rising', thumb((ctx, w, h, T) => tileSample(ctx, 44, 38, 22, 'doing', T)), 'the ring fills as work is done'],
    ['In review', thumb((ctx, w, h, T) => tileSample(ctx, 44, 38, 22, 'review', T)), 'a teal edge'],
    ['Lit', thumb((ctx, w, h, T) => tileSample(ctx, 44, 38, 22, 'done', T)), 'flat, bright, a green edge'],
    ['Blocked', thumb((ctx, w, h, T) => tileSample(ctx, 44, 38, 22, 'blocked', T)), 'dark, a coral edge, a barrier'],
    ['Park', thumb((ctx, w, h, T) => tileSample(ctx, 44, 38, 22, 'park', T)), 'set aside; the plot stays'],
    ['Facade', (() => { const d = el('span', 'bld', `${facadeBig('screens')}<span class="cr">${ringSvg(22, 0, { segs: ['met', 'met', 'partly', 'open'], w: 3, gap: 6 })}</span>`); d.style.width = '72px'; return d; })(), 'at street depth: the product and its criteria ring'],
    ['Flag', thumb((ctx, w, h, T) => LM.drawFlag(ctx, 40, 54, 26, { mon: { who: 'owner', id: 'L425', n: '' } }, 1, 2, T)), 'a decision; larger for the owner\'s'],
    ['Landmark', thumb((ctx, w, h, T) => LM.drawMilestone(ctx, 44, 60, 22, {}, 1, T)), 'a milestone met; it stays for ever'],
    ['Pipe', thumb((ctx, w, h, T) => { ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = LM.rgba(T.ai, 0.8); ctx.beginPath(); ctx.moveTo(8, 48); ctx.bezierCurveTo(30, 10, 50, 10, 80, 20); ctx.stroke(); for (const f of [0.25, 0.55, 0.85]) { const mt = 1 - f; const x = mt ** 3 * 8 + 3 * mt * mt * f * 30 + 3 * mt * f * f * 50 + f ** 3 * 80, y = mt ** 3 * 48 + 3 * mt * mt * f * 10 + 3 * mt * f * f * 10 + f ** 3 * 20; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fillStyle = LM.rgba(T.ai, 1); ctx.fill(); } ctx.setLineDash([3, 6]); ctx.strokeStyle = T.ink(0.45); ctx.beginPath(); ctx.moveTo(8, 58); ctx.lineTo(80, 50); ctx.stroke(); ctx.setLineDash([]); }), 'flowing when the upstream delivered; dashed when dry'],
    ['Barrier', thumb((ctx, w, h, T) => { ctx.lineWidth = 2; ctx.strokeStyle = LM.rgba(T.coral, 0.85); ctx.beginPath(); ctx.moveTo(8, 40); ctx.lineTo(80, 24); ctx.stroke(); ctx.beginPath(); ctx.arc(34, 34, 10, 0, Math.PI * 2); ctx.fillStyle = LM.rgba(T.coral, 1); ctx.fill(); LM.icon(ctx, 'construction', 34, 34, 11, '#fff', 2); }), 'a clog: the upstream is blocked'],
    ['Weather', thumb((ctx, w, h, T) => LM.drawFront(ctx, 44, 32, 40, 22, 0.9, true, 0, T, true, 'x')), 'a front over blocked work'],
    ['Heat', thumb((ctx, w, h, T) => { const g = ctx.createRadialGradient(44, 32, 0, 44, 32, 30); g.addColorStop(0, LM.rgba(T.heat, 0.4)); g.addColorStop(1, LM.rgba(T.heat, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(44, 32, 30, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = LM.rgba(T.heat, 0.25); ctx.beginPath(); ctx.arc(44, 32, 13, 0, Math.PI * 2); ctx.stroke(); }), 'where things moved since you last looked'],
    ['Causeway', thumb((ctx, w, h, T) => { ctx.lineWidth = 8; ctx.strokeStyle = T.ink(0.14); ctx.beginPath(); ctx.moveTo(8, 40); ctx.lineTo(80, 24); ctx.stroke(); ctx.lineWidth = 1.4; ctx.setLineDash([6, 6]); ctx.strokeStyle = T.ink(0.5); ctx.stroke(); ctx.setLineDash([]); }), 'a land that seceded stays joined to its parent'],
  ];
  const depths = [['Z0 · Sky', 'Lands as countries with coast, hue and landmark; weather; the main roads. City lights are the buildings.'], ['Z1 · Land', 'One land fills the view: districts as quarters with their names and rings; tiles with the kind glyph.'], ['Z2 · District', 'Every tile shows its glyph, its progress ring and its title; flags on the square; pipes into each.'], ['Z3 · Street', 'Facades: the product, the criteria ring, who and since; click to open the product view.']];
  const badges = [['new', 'New'], ['progressed', 'Moved on'], ['review', 'In review'], ['done', 'Lit'], ['blocked', 'Blocked'], ['moved', 'Moved land'], ['dropped', 'Set aside']];
  S.innerHTML = `<div class="row"><button class="chip back" id="sheetx">${I('map')}<span>Back to the map</span></button><span class="ttl t3" style="margin-inline-start:12px">The grammar of the map</span><span class="meta" style="margin-inline-start:auto">docs/16 · docs/17 · the v0.2 vocabulary</span></div>
    <span class="lbl2">Elements</span><div class="lgrid" id="lg-el"></div>
    <div class="lcols"><div><span class="lbl2">Depths · zoom reveals, it does not enlarge</span><div class="col" style="gap:8px">${depths.map(([n, t]) => `<div class="row" style="gap:10px;align-items:flex-start"><b style="width:92px;flex:none">${n}</b><span class="mut">${t}</span></div>`).join('')}</div></div>
    <div><span class="lbl2">Lenses · the same buildings, regrouped</span><div class="col" style="gap:8px">${LENSES.map(([k, n, ic, sub]) => `<button class="row frow" data-lens="${k}">${I(ic)}<span class="grow"><b>${n}</b> · ${sub}</span>${k === v.lens ? '<em>now</em>' : ''}</button>`).join('')}</div></div></div>
    <span class="lbl2">Layers · they recolour the ground, the light, the air or the lines; they never add marks</span><div class="lgrid ov">${OVERLAYS.filter(([k]) => k !== 'revenue' || ds.revenue.length).map(([k, n, ic]) => { const info = LM.OV_INFO[k]; return `<button class="li lay${v.overlays.has(k) ? ' on' : ''}" data-o="${k}"><i class="sw" style="background:linear-gradient(90deg,${info[2][0]},${info[2][1]})"></i><b>${I(ic)}${n}</b><span class="meta">${info[1]}</span></button>`; }).join('')}</div>
    <div class="lcols"><div><span class="lbl2">Since you last looked · badges on what changed, the rest dimmed</span><div class="lgrid sm" id="lg-bd"></div></div>
    <div><span class="lbl2">Actions · from any building, flag or place</span><div class="row" style="gap:6px;flex-wrap:wrap">${[['move-right', 'Nudge'], ['user-plus', 'Assign'], ['check', 'Approve'], ['external-link', 'Open'], ['message-circle-question', 'Ask'], ['route', 'Trace'], ['play', 'Play from here'], ['git-fork', 'Fork'], ['shuffle', 'Refocus']].map(([ic, n]) => pill(ic, n, 'sm')).join('')}</div><p class="mut" style="margin:12px 0 0">People never assemble the view. They click a place, answer a card, or say what they want to see; the AI composes the scene from this grammar (docs/13 §8). Try: <i>show cost on products</i> · <i>what changed since last week</i> · <i>trace L425</i> · <i>what is stuck</i>.</p></div></div>`;
  const grid = S.querySelector('#lg-el'); for (const [n, c, sub] of elements) grid.appendChild(item(n, c, sub));
  const bg = S.querySelector('#lg-bd'); for (const [k, n] of badges) bg.appendChild(item(n, thumb((ctx, w, h, T) => tileSample(ctx, 44, 38, 20, k === 'done' ? 'done' : k === 'blocked' ? 'blocked' : k === 'new' ? 'todo' : 'doing', T, { badge: k }), 88, 64)));
  S.hidden = false; marks(S);
  $('#sheetx').onclick = () => { S.hidden = true; };
  for (const b of S.querySelectorAll('[data-lens]')) b.onclick = () => { setLens(b.dataset.lens); S.hidden = true; };
  for (const b of S.querySelectorAll('[data-o]')) b.onclick = () => { toggleOverlay(b.dataset.o); S.hidden = true; };
}
LM.openSheet = openSheet;

// ---- the command bar (a stand-in for the composer) ----
LM.command = function command(text) {
  const q = text.trim().toLowerCase(); if (!q) return;
  const ds = LM.ds, said = [];
  const has = (re) => re.test(q);
  if (has(/\b(lucid chat|real)\b/) && ds.key !== 'lucid') { LM.setDataset('lucid'); said.push('Lucid Chat, the real log'); }
  if (has(/\b(example|generated)\b/) && ds.key !== 'example') { LM.setDataset('example'); said.push('the example company'); }
  if (has(/\b(department|departments|team|teams|function)\b/)) { setLens('dept'); said.push('seen by department'); }
  if (has(/\b(project|projects|phase|phases|initiative)\b/)) { setLens('proj'); said.push('seen by project'); }
  if (has(/\b(product|products|line|lines of business)\b/)) { setLens('prod'); said.push('seen by product'); }
  if (has(/\b(people|owner|owners|who owns|person|crew)\b/)) { setLens('people'); said.push('seen by person'); }
  if (has(/\b(clear|plain|no overlay|no layers?|nothing)\b/)) { LM.view.overlays.clear(); said.push('layers cleared'); }
  const O = [[/cost|burn|spend/, 'cost'], [/revenue|harvest|earn|money made|yield/, 'revenue'], [/progress|how far|done share|tide/, 'progress'], [/issue|weather|storm|hurt/, 'issues'], [/clog|dependenc|pipe|flow|blocked/, 'pipes'], [/decision lines|power|waiting on|awaits/, 'power'], [/load|overloaded|stretched/, 'load'], [/fresh|alive|moved today|stale|still/, 'fresh'], [/\bai\b|agents?/, 'ai'], [/terrain|elevation|remaining|height/, 'terrain'], [/growth|grew|grow|claimed|shift/, 'growth']];
  for (const [re, k] of O) if (re.test(q)) { toggleOverlay(k, !has(/\b(off|hide|remove)\b/)); said.push(`${LM.OV_INFO[k][0]}: ${LM.OV_INFO[k][1].toLowerCase()}`); }
  if (has(/\bstuck\b/)) { toggleOverlay('issues', true); const score = (D) => D.blocked * 3 + D.stale; const D = [...LM.visible(LM.worlds[LM.view.lens], LM.view.t).districts.values()].sort((a, b) => score(b) - score(a))[0]; if (D && score(D)) { flyToDistrict(D.key); said.push(`the most stuck place is ${LM.distName(ds, LM.view.lens, D.key)}: ${D.blocked ? `${D.blocked} blocked` : ''}${D.blocked && D.stale ? ', ' : ''}${D.stale ? `${D.stale} still for a while` : ''}`); } else said.push('nothing is stuck right now'); }
  const sm = /\b(since|changed|what changed|what happened|last (week|month|year|day)|yesterday|new since)\b/.exec(q);
  if (sm) { const D = LM.DAY; const t = has(/yesterday|last day/) ? LM.view.t - D : has(/last week|week/) ? LM.view.t - 7 * D : has(/last month|month/) ? LM.view.t - 30 * D : has(/last year|year/) ? LM.view.t - 365 * D : has(/reviewed|last looked|last time/) && LM.reviewed ? LM.reviewed : LM.view.t - ds.win.review; if (has(/\boff\b/)) { setSince(null); said.push('since layer off'); } else { setSince(t); LM.toggleFeed(true); said.push(`what changed since ${LM.fmtShort(t)}: badges on the map, the rest dimmed, the feed on the right`); } }
  if (has(/\bfeed\b|news|what is happening|what's happening/)) { LM.toggleFeed(!has(/\b(off|hide|close)\b/)); said.push(LM.view.feed ? 'the feed' : 'feed hidden'); }
  if (has(/\blegend\b|grammar|how to read|what do .* mean/)) { openSheet(); said.push('the grammar of the map'); }
  const th = /\b(deep|aqua|sky|dark|light)\b/.exec(q); if (th && has(/theme|glass|dusk|mode|switch/)) { const m = { deep: 'deep', dark: 'deep', aqua: 'aqua', sky: 'sky', light: 'sky' }[th[1]]; document.documentElement.dataset.pt = m; LM.readTheme(); LM.dirty(); said.push(`${THEMES.find((t) => t[0] === m)[1]}`); }
  if (has(/high contrast/)) { document.documentElement.dataset.hc = has(/\boff\b/) ? 'std' : 'high'; LM.view.hc = !has(/\boff\b/); LM.readTheme(); LM.dirty(); said.push(LM.view.hc ? 'high contrast' : 'standard contrast'); }
  if (has(/\b(pause|stop|hold)\b/)) { togglePlay(false); said.push('paused'); }
  if (has(/\bfaster\b/)) { const S = SPEEDS[ds.key]; const i = S.findIndex((s) => s[0] === LM.view.speed); LM.view.speed = S[Math.min(S.length - 1, i + 1)][0]; said.push('faster'); }
  if (has(/\bslower\b/)) { const S = SPEEDS[ds.key]; const i = S.findIndex((s) => s[0] === LM.view.speed); LM.view.speed = S[Math.max(0, i - 1)][0]; said.push('slower'); }
  if (has(/\b(start|beginning|first day)\b/)) { setTime(ds.span[0]); LM.cam = LM.fitAt(ds.span[0]); LM.autoFit = true; said.push('at the beginning; the camera follows the city as it grows'); }
  if (has(/\b(now|today|present)\b/) && !sm) { setTime(ds.now); said.push('now'); }
  if (has(/\bend\b/)) { setTime(ds.span[1]); said.push('at the end'); }
  const dm = /(\d{4}-\d{2}-\d{2})|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:,?\s*(\d{4}))?/.exec(q);
  if (dm && !sm) { const t = dm[1] ? Date.parse(dm[1] + 'T12:00:00') : Date.parse(`${dm[2]} ${dm[3]} ${dm[4] || new Date(ds.now).getFullYear()} 12:00`); if (!isNaN(t)) { setTime(t); said.push(LM.fmtDate(t)); } }
  if (has(/\b(play|run|animate)\b/) && !has(/from here/)) { togglePlay(true); said.push('playing'); }
  const tm = /\b(trace|cause|caused|effects? of)\b\s*(.*)$/.exec(q);
  if (tm) { const key = (tm[2] || '').replace(/^(of|the)\s+/, '').trim(); const d = ds.decisions.find((x) => x.id.toLowerCase() === key) || ds.decisions.filter((x) => key && x.n.toLowerCase().includes(key)).sort((a, b) => b.lin.size - a.lin.size)[0]; if (d) { setTrace('decision', d); const c = LM.worlds[LM.view.lens].claims.find((cc) => cc.dec === d); if (c) { const [x, y] = LM.hexXY(c.q, c.r); LM.flyTo(x, y, Math.max(LM.cam.k, 16)); } said.push(`tracing ${LM.esc(d.n)}`); } else if (key) said.push(`no decision matches "${LM.esc(key)}"`); }
  const om = /\b(open|show|go to|fly to|find|zoom (?:in )?(?:to|on))\b\s+(.*)$/.exec(q);
  if (om && !tm && !sm) {
    const key = om[2].replace(/^(the|me)\s+/, '').replace(/\s+(on|by|in)\s+.*$/, '').trim();
    const vis = LM.visible(LM.worlds[LM.view.lens], LM.view.t);
    const land = [...vis.lands.values()].find((L) => LM.landInfo(ds, LM.view.lens, L.key).name.toLowerCase().includes(key));
    const dist = !land && [...vis.districts.values()].find((D) => LM.distName(ds, LM.view.lens, D.key).toLowerCase().includes(key));
    const item = !land && !dist && vis.items.find((x) => x.it && x.it.n.toLowerCase().includes(key));
    if (land) { flyToLand(land.key); said.push(`flying to ${LM.esc(LM.landInfo(ds, LM.view.lens, land.key).name)}`); }
    else if (dist) { flyToDistrict(dist.key); said.push(`flying to ${LM.esc(LM.distName(ds, LM.view.lens, dist.key))}`); }
    else if (item) { select(item.it); LM.flyTo(item.x, item.y + 0.6, 64); said.push(`opening ${LM.esc(item.it.short)}`); }
    else if (key && !said.length) said.push(`nothing here is called "${LM.esc(key)}"`);
  }
  if (has(/\b(sky|whole|everything|zoom out|company)\b/) && !om) { select(null); LM.flyTo(null, null, 3.2); said.push('the whole world'); }
  if (!said.length) said.push('I can change the lens (departments, projects, products, people), lay a layer (cost, revenue, progress, growth, issues, pipes, power, load, fresh, AI, terrain), show what changed since a date, open the feed or the legend, move in time (play, pause, a date, now, start), trace a decision, or open a place.');
  syncChrome();
  say(said.join(' · '));
};

// ---- URL state ----
function applyParams(p) {
  const v = LM.view;
  if (p.get('lens') && LM.worlds[p.get('lens')]) v.lens = p.get('lens');
  if (p.get('o')) for (const o of p.get('o').split(',')) if (OVERLAYS.some((x) => x[0] === o)) v.overlays.add(o);
  if (p.get('pt')) document.documentElement.dataset.pt = p.get('pt');
  if (p.get('hc')) { document.documentElement.dataset.hc = 'high'; v.hc = true; }
  if (p.get('reduce')) v.reduce = true;
  if (p.get('feed') === '0') v.feed = false; if (p.get('feed') === '1') v.feed = true;
  LM.readTheme();
  if (p.get('k')) LM.cam = { x: Number(p.get('x') || 0), y: Number(p.get('y') || 0), k: Number(p.get('k')) }; else LM.fitWorld();
  if (p.get('since')) { const t = Date.parse(p.get('since')); if (!isNaN(t)) { v.sinceOn = true; v.since = t; } }
  LM.draw(performance.now());
  if (p.get('sel')) { const it = LM.ds.byId.get(p.get('sel')); if (it) select(it); }
  if (p.get('trace')) { const d = LM.ds.decisions.find((x) => x.id === p.get('trace')); if (d) setTrace('decision', d); }
  if (p.get('play')) togglePlay(true);
  syncChrome();
}
let urlTimer = 0;
function writeUrl() {
  clearTimeout(urlTimer);
  urlTimer = setTimeout(() => {
    const v = LM.view, p = new URLSearchParams();
    p.set('d', LM.ds.key); p.set('lens', v.lens); if (v.overlays.size) p.set('o', [...v.overlays].join(','));
    p.set('t', new Date(v.t).toISOString().slice(0, 16)); p.set('x', LM.cam.x.toFixed(1)); p.set('y', LM.cam.y.toFixed(1)); p.set('k', LM.cam.k.toFixed(2));
    if (v.sel && v.sel.id) p.set('sel', v.sel.id); if (v.trace && v.trace.dec) p.set('trace', v.trace.dec.id);
    if (v.sinceOn) p.set('since', new Date(v.since).toISOString().slice(0, 16));
    if (!v.feed) p.set('feed', '0');
    if (document.documentElement.dataset.pt !== 'deep') p.set('pt', document.documentElement.dataset.pt); if (v.hc) p.set('hc', '1');
    history.replaceState(null, '', '?' + p.toString());
  }, 300);
}

window.addEventListener('DOMContentLoaded', LM.boot);
