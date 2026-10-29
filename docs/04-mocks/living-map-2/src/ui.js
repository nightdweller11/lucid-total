/* The living map, second pass: the shell and the interaction, on the v0.2 line. The dock, the breadcrumb, Talk, the
 * lens control, the layer row (one layer at a time, Dependencies apart), the Time tool (the rail opens on demand; the
 * default is Now), the zoom buttons, the panel, the key, the views (task with its moments, project, ask, decision, place,
 * landmark), the projects and policies lists, the grammar sheet, the lab, the command bar, URL state. */
const $ = (s, el = document) => el.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
LM.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
LM.I = (name, cls = '') => `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${LM.ICONS[name] || LM.ICONS.dot}"/></svg>`;
const I = LM.I;
const AI = (cls = '') => `<i data-lucide="lucid-mark" class="ic${cls ? ' ' + cls : ''}"></i>`;
LM.marksIn = (root) => { if (window.lucidMarks) window.lucidMarks(root); };
const marks = LM.marksIn;
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
const LENSES = [['dept', 'Departments', 'users-round', 'who owns the work'], ['proj', 'Projects', 'kanban', 'what it is for'], ['prod', 'Products', 'package', 'what it builds'], ['people', 'People', 'circle-user-round', 'who is responsible']];
const LAYERS = [['progress', 'Progress', 'sun-medium'], ['problems', 'Problems', 'cloud-lightning'], ['deps', 'Dependencies', 'route'], ['cost', 'Cost', 'flame'], ['revenue', 'Revenue', 'coins'], ['people', 'People', 'users-round'], ['recency', 'Recency', 'activity'], ['growth', 'Growth', 'sprout']];
const SPEEDS = { lucid: [[1 / 8, '3 h / s'], [1 / 4, '6 h / s'], [1 / 2, '12 h / s'], [1, '1 day / s']], example: [[7, '1 wk / s'], [14, '2 wk / s'], [30, '1 mo / s'], [90, '3 mo / s']] };
const THEMES = [['deep', 'Deep Blue', 'moon'], ['aqua', 'Aqua Dusk', 'waves'], ['sky', 'Sky Glass', 'sun']];
const STATUS_HUE = { todo: 'slate', doing: 'acc', review: 'ai', blocked: 'block', done: 'good', dropped: 'lime' };

LM.boot = function boot() {
  LM.readTheme();
  const root = $('#app');
  root.innerHTML = `
    <canvas id="map"></canvas>
    <div id="places" aria-hidden="true"></div>
    <div id="tiles" data-level=""></div>
    <div id="cards"></div>
    <nav class="dock" aria-label="Dock">${[['horizon', 'sunrise', 'Horizon'], ['world', 'map', 'World'], ['projects', 'kanban', 'Projects'], ['talk', 'AI', 'Talk'], ['more', 'grip', 'More']].map(([k, ic, l]) => `<button class="d${k === 'world' ? ' on' : ''}${k === 'talk' ? ' tk' : ''}" data-d="${k}" title="${l}" aria-label="${l}">${ic === 'AI' ? AI() : I(ic)}</button>`).join('')}</nav>
    <div class="top" id="top"><div class="toprow"><nav class="crumbc" id="crumbs" aria-label="Where you are"></nav><div class="seg lensseg" id="lenses"></div><div class="tend" id="tend"></div></div><div class="layers" id="overlays"></div></div>
    <aside class="feed gl l2" id="panel" aria-label="What needs attention"></aside>
    <div class="key gl l2" id="key" data-open="1"></div>
    <div class="tip gl l3" id="tip" hidden></div>
    <div class="zoomc gl l2" id="zoomc"><button class="ic" id="zin" title="Zoom in (+)">${I('plus')}</button><button class="ic" id="zout" title="Zoom out (−)">${I('minus')}</button><div class="lvls" id="depth" role="group" aria-label="Level">${[[0, 'Land', 'map'], [1, 'Area', 'map-pin'], [2, 'Task', 'square-check-big']].map(([l, n, ic]) => `<button class="lvl" data-level="${l}" title="${n}">${I(ic)}<span>${n}</span></button>`).join('')}</div><button class="ic" id="zfit" title="Frame the whole company (0)">${I('scan')}</button></div>
    <div class="ledger" id="ledger"></div>
    <div class="talk" role="search" aria-label="Talk to Lucid">${AI()}<input id="talk" placeholder="Ask, or tell Lucid what to show" autocomplete="off"><span class="tb slash" title="Commands">/</span><span class="tb" title="Hold to talk">${I('mic')}</span></div>
    <div class="rail gl l2" id="rail" hidden><button class="ic" id="back" title="Previous beat">${I('skip-back')}</button><button class="ic" id="play" title="Play">${I('play')}</button><button class="ic" id="step" title="Next beat">${I('skip-forward')}</button><button class="pillx" id="speed" title="Speed">${I('gauge')}<span></span></button><div class="date" id="date"></div><canvas id="railc"></canvas><button class="pillx" id="tonow" title="Back to now">${I('sun-medium')}<span>Now</span></button><button class="ic" id="railx" title="Close the timeline">${I('x')}</button></div>
    <div class="dim" id="dim" hidden></div>
    <section class="pv gl l3" id="pv" hidden></section>
    <section class="sheet gl l3" id="sheet" hidden></section>
    <div class="list gl l3" id="list" hidden></div>
    <div class="pop gl l3" id="pop" hidden></div>
    <div class="toast" id="toast"></div>`;
  marks(root);
  LM.canvas = $('#map'); LM.ctx = LM.canvas.getContext('2d');
  LM.railc = $('#railc'); LM.railctx = LM.railc.getContext('2d');
  LM.placesEl = $('#places'); LM.tilesEl = $('#tiles'); LM.cardsEl = $('#cards'); LM.panelEl = $('#panel'); LM.keyEl = $('#key'); LM.tipEl = $('#tip');
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
  LM.view.trace = null; LM.view.sel = null; LM.view.proj = null; LM.ledgerT = LM.view.t;
  LM.view.mode = LM.view.t < ds.now - 60e3 ? 'then' : 'now';
  LM.clearCards(); LM.panelState.key = ''; LM.panelRows = new Map();
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
  const panelW = LM.view.panel && (LM.W || window.innerWidth) > 1100 ? 350 : 0;
  const W = (LM.W || window.innerWidth) - panelW, H = (LM.H || window.innerHeight) - (phone ? 420 : 235);
  const k = Math.min((W - (phone ? 36 : 60)) / Math.max(10, maxx - minx + 16), H / Math.max(10, (maxy - miny + 16) * LM.YS));
  return { x: (minx + maxx) / 2 + panelW / 2 / k, y: (miny + maxy) / 2 + (phone ? -60 : 48) / (k * LM.YS), k: Math.max(1.5, Math.min(LM.L1 - 0.5, k)) };
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
  document.documentElement.classList.toggle('tight', LM.W - (LM.view.panel && LM.W > 1100 ? 350 : 0) < 1180);
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
    if (v.t >= LM.ds.span[1]) togglePlay(false);
  }
  if (LM.flight) {
    const f = LM.flight, p = Math.min(1, (now - f.t0) / f.ms), e = 1 - Math.pow(1 - p, 3);
    LM.cam.x = f.x0 + (f.x1 - f.x0) * e; LM.cam.y = f.y0 + (f.y1 - f.y0) * e; LM.cam.k = Math.exp(Math.log(f.k0) + (Math.log(f.k1) - Math.log(f.k0)) * e);
    if (f.ms > 1) LM.moving();
    if (p >= 1) { LM.flight = null; writeUrl(); }
    LM.needsFrame = true;
  }
  if (LM.needsFrame) { LM.needsFrame = false; LM.draw(now); drawRail(); updateCrumbs(); LM.renderPanel(); LM.renderKey(); for (const b of document.querySelectorAll('#depth .lvl')) b.classList.toggle('on', Number(b.dataset.level) === LM.lod); }
  LM.updateCards(now);
  if (LM.toastUntil && now > LM.toastUntil) { $('#toast').classList.remove('on'); LM.toastUntil = 0; }
  if (LM.ledgerUntil && now > LM.ledgerUntil) { $('#ledger').classList.remove('on'); LM.ledgerUntil = 0; }
  requestAnimationFrame(loop);
}

// ---- chrome ----
function buildChrome() {
  const lenses = $('#lenses'); lenses.innerHTML = '';
  for (const [k, name, ico, sub] of LENSES) { const b = el('button', 'sg', `${I(ico)}<span>${name}</span>`); b.dataset.lens = k; b.title = `See the company by ${name.toLowerCase()}: ${sub}`; b.onclick = () => setLens(k); lenses.appendChild(b); }
  const ov = $('#overlays'); ov.innerHTML = `<span class="lbl">${I('layers')}<span>Layers</span></span>`;
  for (const [k, name, ico] of LAYERS) { const b = el('button', 'chip lay', `${I(ico)}<span>${name}</span>`); b.dataset.o = k; b.title = LM.OV_INFO[k][1]; b.onclick = () => toggleOverlay(k); ov.appendChild(b); }
  const tend = $('#tend'); tend.innerHTML = '';
  const time = el('button', 'chip', `${I('history')}<span>Time</span>`); time.id = 'timec'; time.title = 'The timeline: scrub, play, and read the feed of what happened (T)'; time.onclick = () => toggleTime(); tend.appendChild(time);
  const since = el('button', 'chip', ''); since.id = 'sincec'; since.onclick = (e) => sinceMenu(e); tend.appendChild(since);
  const panel = el('button', 'chip icon', `${I('newspaper')}<span>Panel</span>`); panel.title = 'The panel (F)'; panel.id = 'panelc'; panel.onclick = () => LM.togglePanel(); tend.appendChild(panel);
  const lab = el('button', 'chip icon', `${I('sliders-horizontal')}<span>Lab</span>`); lab.title = 'Lab: theme, contrast, motion, dataset'; lab.id = 'labc'; lab.onclick = (e) => labMenu(e); tend.appendChild(lab);
  for (const d of document.querySelectorAll('.dock .d')) d.onclick = (e) => { const k = d.dataset.d; if (k === 'talk') $('#talk').focus(); else if (k === 'world') { select(null); setProject(null); LM.flyTo(null, null, 3.6); } else if (k === 'projects') LM.openProjects(); else if (k === 'more') moreMenu(e, d); else say(`<b>${d.title}</b> is a place of the product (docs/13 §4); the map is this mock.`, 3000); };
  $('#play').onclick = () => togglePlay();
  $('#step').onclick = () => stepBeat(1);
  $('#back').onclick = () => stepBeat(-1);
  $('#speed').onclick = () => { const S = SPEEDS[LM.ds.key]; const i = S.findIndex((s) => s[0] === LM.view.speed); LM.view.speed = S[(i + 1) % S.length][0]; syncChrome(); };
  $('#tonow').onclick = () => { togglePlay(false); setTime(LM.ds.now); say('Now.'); };
  $('#railx').onclick = () => toggleTime(false);
  $('#dim').onclick = () => select(null);
  $('#zin').onclick = () => zoomAt(LM.W / 2, LM.H / 2, 1.45, true);
  $('#zout').onclick = () => zoomAt(LM.W / 2, LM.H / 2, 1 / 1.45, true);
  for (const b of document.querySelectorAll('#depth .lvl')) b.onclick = () => goLevel(Number(b.dataset.level));
  $('#zfit').onclick = () => { select(null); LM.flyTo(null, null, LM.fitAt(LM.view.t).k); };
  const talk = $('#talk');
  talk.addEventListener('keydown', (e) => { if (e.key === 'Enter') { LM.command(talk.value); talk.value = ''; } if (e.key === 'Escape') talk.blur(); });
  document.addEventListener('keydown', (e) => {
    if (e.target === talk || e.target.tagName === 'INPUT') return;
    if (e.key === ' ') { e.preventDefault(); if (!LM.view.time) toggleTime(true); togglePlay(); }
    else if (e.key === 'ArrowRight') stepBeat(1); else if (e.key === 'ArrowLeft') stepBeat(-1);
    else if (e.key === 'Escape') { clearTrace(); select(null); setProject(null); $('#list').hidden = true; $('#sheet').hidden = true; $('#pop').hidden = true; }
    else if (e.key >= '1' && e.key <= '4') setLens(LENSES[Number(e.key) - 1][0]);
    else if (e.key === '/') { e.preventDefault(); talk.focus(); }
    else if (e.key === '+' || e.key === '=') zoomAt(LM.W / 2, LM.H / 2, 1.45, true); else if (e.key === '-' || e.key === '_') zoomAt(LM.W / 2, LM.H / 2, 1 / 1.45, true); else if (e.key === '0') LM.flyTo(null, null, LM.fitAt(LM.view.t).k);
    else if (e.key.toLowerCase() === 'f') LM.togglePanel();
    else if (e.key.toLowerCase() === 't') toggleTime();
    else if (e.key.toLowerCase() === 's') setSince(LM.view.sinceOn ? null : LM.view.t - LM.ds.win.review);
    else if (e.key.toLowerCase() === 'l') LM.openSheet();
    else if (e.key.toLowerCase() === 'p') LM.openProjects();
  });
  document.addEventListener('pointerdown', (e) => { const p = $('#pop'); if (!p.hidden && !p.contains(e.target) && !e.target.closest('#sincec,#labc,.dock')) p.hidden = true; });
  LM.view.panel = window.innerWidth > 1100;
  if (window.innerWidth <= 720) LM.keyEl.dataset.open = '0';
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
  const sc = $('#sincec'); sc.innerHTML = v.sinceOn ? `${I('history')}<span>Since ${LM.fmtShort(v.since)}</span>` : `${I('eye')}<span>Since…</span>`; sc.classList.toggle('on', v.sinceOn);
  const tc = $('#timec'); tc.classList.toggle('on', v.time); tc.innerHTML = v.time ? `${I('history')}<span>${v.mode === 'then' ? LM.fmtShort(v.t) : 'Now'}</span>` : `${I('history')}<span>Time</span>`;
  $('#rail').hidden = !v.time;
  $('#tonow').hidden = v.mode !== 'then';
  $('#panelc').classList.toggle('on', v.panel);
  $('#panel').hidden = !v.panel;
  document.documentElement.classList.toggle('feed-open', v.panel);
  document.documentElement.classList.toggle('time-open', v.time);
  document.documentElement.classList.toggle('then', v.mode === 'then');
  LM.panelState.key = ''; LM.keyEl.dataset.state = '';
  writeUrl();
}
LM.togglePanel = (on) => { LM.view.panel = on === undefined ? !LM.view.panel : on; resize(); syncChrome(); };
function toggleTime(on) {
  const v = LM.view;
  v.time = on === undefined ? !v.time : on;
  if (!v.time) { togglePlay(false); if (v.mode === 'then') setTime(LM.ds.now); }
  resize(); syncChrome();
  if (v.time) say('<b>The timeline.</b> Scrub or play; the panel becomes the feed of what happened. <b>Now</b> brings you back.', 5000);
}
LM.toggleTime = toggleTime;
function updateCrumbs() {
  const v = LM.view, ds = LM.ds;
  const W = LM.where();
  const parts = [`<button class="crumb" data-up="0">${LM.esc(ds.name)}</button>`];
  if (W.land && LM.lod >= 1) { const info = LM.landInfo(ds, v.lens, W.land.key); parts.push(`<button class="crumb h-${info.hue}" data-land="${W.land.key}">${LM_SVG(info.lm, 16)}${LM.esc(info.name)}</button>`); }
  if (W.dist && LM.lod >= 2) parts.push(`<button class="crumb" data-dist="${W.dist.key}">${LM.esc(LM.shortName(LM.distName(ds, v.lens, W.dist.key)).slice(0, 26))}</button>`);
  if (v.proj) { const P = ds.byProject.get(v.proj); if (P) parts.push(`<button class="crumb proj" data-proj="${P.id}">${I('kanban')}${LM.esc(P.short)}</button>`); }
  const html = `<i data-lucide="total-mark" class="ic"></i>` + parts.join(I('chevron-right'));
  const c = $('#crumbs');
  if (c.dataset.html !== html) {
    c.innerHTML = html; c.dataset.html = html; marks(c);
    c.querySelector('[data-up]').onclick = () => { select(null); LM.flyTo(null, null, 3.6); };
    for (const b of c.querySelectorAll('[data-land]')) b.onclick = () => flyToLand(b.dataset.land);
    for (const b of c.querySelectorAll('[data-dist]')) b.onclick = () => flyToDistrict(b.dataset.dist);
    for (const b of c.querySelectorAll('[data-proj]')) b.onclick = () => LM.openProject(b.dataset.proj);
  }
}
function popAt(anchor, html, side = 'right') {
  const p = $('#pop'); p.innerHTML = html; p.hidden = false;
  const r = anchor.getBoundingClientRect();
  if (side === 'dock') { p.style.top = Math.max(12, r.top - 40) + 'px'; p.style.left = r.right + 12 + 'px'; p.style.right = 'auto'; }
  else { p.style.top = r.bottom + 8 + 'px'; p.style.right = Math.max(12, window.innerWidth - r.right) + 'px'; p.style.left = 'auto'; }
  marks(p);
  return p;
}
function sinceMenu(e) {
  const ds = LM.ds, t = LM.view.t, D = LM.DAY;
  const opts = ds.key === 'lucid' ? [['Yesterday', t - D], ['Two days', t - 2 * D], ['Since Oct 24', Date.parse('2026-10-24T00:00')], ['The whole build', ds.span[0]]] : [['Last week', t - 7 * D], ['Last month', t - 30 * D], ['Last quarter', t - 91 * D], ['Last year', t - 365 * D]];
  const p = popAt(e.currentTarget, `<span class="lbl2">Since you last looked</span><div class="col" style="gap:4px">${opts.map(([n, tt]) => `<button class="row mrow" data-t="${tt}">${I('history')}<span>${n}</span><em>${LM.fmtShort(tt)}</em></button>`).join('')}<button class="row mrow" data-mark="1">${I('check')}<span>Mark now as reviewed</span><em>${LM.fmtShort(t)}</em></button><button class="row mrow" data-off="1">${I('eye-off')}<span>Off</span></button></div><div class="meta">Changed tasks carry a badge; the rest dims; the panel counts new and done from this moment.</div>`);
  for (const b of p.querySelectorAll('[data-t]')) b.onclick = () => { setSince(Number(b.dataset.t)); p.hidden = true; };
  p.querySelector('[data-mark]').onclick = () => { LM.reviewed = t; setSince(t); p.hidden = true; say(`Marked ${LM.fmtDate(t)} as reviewed; from here the panel shows what is new since.`); };
  p.querySelector('[data-off]').onclick = () => { setSince(null); p.hidden = true; };
}
function setSince(t) {
  const v = LM.view;
  if (t === null) v.sinceOn = false; else { v.sinceOn = true; v.since = Math.max(LM.ds.span[0], Math.min(v.t - 60e3, t)); }
  LM.sinceCache = null; syncChrome(); LM.dirty();
  if (v.sinceOn) { const c = LM.changes(LM.ds, v.lens, v.since, v.t); say(`<b>Since ${LM.fmtShort(v.since)}</b> · ${c.counts.n} tasks changed: ${c.counts.new} new, ${c.counts.progressed} moved on, ${c.counts.done} done${c.counts.blocked ? `, <em>${c.counts.blocked} blocked</em>` : ''}${c.decisions.length ? ` · ${c.decisions.length} decisions` : ''}${c.asks.length ? ` · ${c.asks.length} asked` : ''}.`, 8000); }
}
LM.setSince = setSince;
function labMenu(e) {
  const r = document.documentElement;
  const p = popAt(e.currentTarget, `<span class="lbl2">Theme</span><div class="seg">${THEMES.map(([k, n, ic]) => `<button class="sg${r.dataset.pt === k ? ' on' : ''}" data-pt="${k}">${I(ic)}<span>${n}</span></button>`).join('')}</div>
    <span class="lbl2">Contrast</span><div class="seg"><button class="sg${r.dataset.hc !== 'high' ? ' on' : ''}" data-hc="std">${I('circle-dot')}<span>Standard</span></button><button class="sg${r.dataset.hc === 'high' ? ' on' : ''}" data-hc="high">${I('contrast')}<span>High</span></button></div>
    <span class="lbl2">Dataset</span><div class="seg dsw">${[['lucid', 'Lucid Chat', 'real'], ['example', 'Example company', 'generated']].map(([k, n, sub]) => `<button class="sg${LM.ds.key === k ? ' on' : ''}" data-ds="${k}"><span>${n}</span><small>${sub}</small></button>`).join('')}</div>
    <span class="lbl2">The task level</span><div class="seg"><button class="sg${LM.view.iso ? ' on' : ''}" data-iso="1">${I('box')}<span>Tilts in (isometric)</span></button><button class="sg${!LM.view.iso ? ' on' : ''}" data-iso="0">${I('square')}<span>Stays flat</span></button></div>
    <span class="lbl2">Pictures</span><div class="seg">${[['off', 'Off', 'eye-off'], ['thumb', 'On the tile', 'image'], ['full', 'As the tile', 'layout-template']].map(([k, n, ic]) => `<button class="sg${(LM.view.pic || 'thumb') === k ? ' on' : ''}" data-pic="${k}">${I(ic)}<span>${n}</span></button>`).join('')}</div>
    <span class="lbl2">The past</span><div class="seg"><button class="sg${LM.view.quiet ? ' on' : ''}" data-q="1">${I('moon')}<span>Quiet</span></button><button class="sg${!LM.view.quiet ? ' on' : ''}" data-q="0">${I('sun')}<span>Full</span></button></div>
    <span class="lbl2">Motion</span><div class="seg"><button class="sg${!LM.view.reduce ? ' on' : ''}" data-mo="0">${I('activity')}<span>Full</span></button><button class="sg${LM.view.reduce ? ' on' : ''}" data-mo="1">${I('minus')}<span>Reduced</span></button></div>`);
  for (const b of p.querySelectorAll('[data-pt]')) b.onclick = () => { r.dataset.pt = b.dataset.pt; LM.readTheme(); LM.dirty(); writeUrl(); labMenu(e); };
  for (const b of p.querySelectorAll('[data-hc]')) b.onclick = () => { r.dataset.hc = b.dataset.hc; LM.view.hc = b.dataset.hc === 'high'; LM.readTheme(); LM.dirty(); writeUrl(); labMenu(e); };
  for (const b of p.querySelectorAll('[data-mo]')) b.onclick = () => { LM.view.reduce = b.dataset.mo === '1'; LM.dirty(); labMenu(e); };
  for (const b of p.querySelectorAll('[data-iso]')) b.onclick = () => { LM.view.iso = b.dataset.iso === '1'; LM.keyEl.dataset.state = ''; LM.dirty(); writeUrl(); labMenu(e); };
  for (const b of p.querySelectorAll('[data-pic]')) b.onclick = () => { LM.view.pic = b.dataset.pic; LM.keyEl.dataset.state = ''; LM.dirty(); writeUrl(); labMenu(e); };
  for (const b of p.querySelectorAll('[data-q]')) b.onclick = () => { LM.view.quiet = b.dataset.q === '1'; LM.keyEl.dataset.state = ''; LM.dirty(); labMenu(e); };
  for (const b of p.querySelectorAll('[data-ds]')) b.onclick = () => { if (b.dataset.ds !== LM.ds.key) { LM.setDataset(b.dataset.ds); setTime(LM.ds.now); say(`${LM.ds.name}: ${LM.ds.sub}`); syncChrome(); } p.hidden = true; };
}
function moreMenu(e, anchor) {
  const p = popAt(anchor, `<span class="lbl2">More</span><div class="col" style="gap:4px">
    <button class="row mrow" data-m="projects">${I('kanban')}<span>Projects</span><em>${LM.ds.projects.length}</em></button>
    <button class="row mrow" data-m="policies">${I('scale')}<span>Policies</span><em>${LM.ds.policies.length}</em></button>
    <button class="row mrow" data-m="decisions">${I('signpost')}<span>Decisions</span><em>${LM.ds.decisions.length}</em></button>
    <button class="row mrow" data-m="sheet">${I('book-open')}<span>The grammar of the map</span></button>
    <button class="row mrow" data-m="time">${I('history')}<span>The timeline</span><em>T</em></button></div>`, 'dock');
  for (const b of p.querySelectorAll('[data-m]')) b.onclick = () => { p.hidden = true; const m = b.dataset.m; if (m === 'projects') LM.openProjects(); else if (m === 'policies') LM.openPolicies(); else if (m === 'decisions') toggleList(); else if (m === 'sheet') LM.openSheet(); else toggleTime(true); };
}

function setLens(k) {
  if (k === LM.view.lens || !LM.worlds[k]) return;
  LM.lensAnim = LM.view.reduce ? null : { from: LM.view.lens, to: k, t0: performance.now() };
  LM.view.lens = k; LM.sinceCache = null;
  if (LM.view.trace) LM.view.trace = buildTrace(LM.view.trace.kind, LM.view.trace.dec || LM.view.trace.it);
  syncChrome(); LM.dirty();
}
/** One layer at a time (Dependencies is a lines layer and can stay on beside it). */
function toggleOverlay(k, on) {
  const O = LM.view.overlays;
  const want = on === undefined ? !O.has(k) : on;
  if (want) { if (k !== 'deps') for (const o of Array.from(O)) if (o !== 'deps') O.delete(o); O.add(k); } else O.delete(k);
  syncChrome(); LM.dirty();
}
function togglePlay(on) {
  const v = LM.view;
  v.playing = on === undefined ? !v.playing : on;
  if (v.playing && !v.time) { v.time = true; resize(); }
  if (v.playing && v.t >= LM.ds.span[1] - 1) { v.t = LM.ds.span[0]; LM.cam = LM.fitAt(v.t); LM.autoFit = true; }
  LM.ledgerT = v.t; LM.playLast = 0;
  if (!v.playing) for (const c of LM.cards) LM.foldCard(c);
  syncChrome(); LM.dirty();
}
function setTime(t, fromPlay) {
  const v = LM.view, ds = LM.ds;
  const prev = v.t;
  v.t = Math.max(ds.span[0], Math.min(ds.span[1], t));
  v.mode = v.t < ds.now - 60e3 ? 'then' : 'now';
  if (v.sinceOn && v.since >= v.t) v.since = Math.max(ds.span[0], v.t - 60e3);
  LM.sinceCache = null;
  if (fromPlay) {
    const evs = []; for (const e of ds.events) { if (e.t <= prev) continue; if (e.t > v.t) break; evs.push(e); }
    if (evs.length) { LM.spawnCards(evs, v.t); ledger(evs); LM.flashT0 = prev; LM.flashUntil = performance.now() + 1400; }
  } else { LM.ledgerT = v.t; }
  $('#date').textContent = LM.fmtDate(v.t, ds.key === 'lucid' && LM.W > 720);
  document.documentElement.classList.toggle('then', v.mode === 'then'); $('#tonow').hidden = v.mode !== 'then';
  const tc = $('#timec'); if (v.time) tc.innerHTML = `${I('history')}<span>${v.mode === 'then' ? LM.fmtShort(v.t) : 'Now'}</span>`;
  if (v.sel) renderView();
  LM.dirty();
}
function stepBeat(dir) {
  const ds = LM.ds, t = LM.view.t;
  const sel = LM.view.sel && LM.view.sel.id ? LM.view.sel : null;
  const ticks = sel ? LM.moments(ds, sel).map((m) => m.t) : [...ds.decisions.filter((d) => d.who === 'owner').map((d) => d.b), ...ds.milestones.map((m) => m.t), ...ds.asks.map((a) => a.b), ds.now, ds.span[0], ds.span[1]];
  ticks.sort((a, b) => a - b);
  const next = dir > 0 ? ticks.find((x) => x > t + 1000) : ticks.slice().reverse().find((x) => x < t - 1000);
  if (next !== undefined) { if (!LM.view.time) toggleTime(true); setTime(next); const d = ds.decisions.find((d) => d.b === next); if (d) say(`${LM.fmtDate(next)} · <b>Decided</b> ${LM.esc(d.n.replace(/\*\*/g, ''))}`); }
}
function ledger(evs) {
  const ds = LM.ds, v = LM.view;
  const counts = new Map(); const lines = [];
  for (const e of evs) {
    if (e.kind === 'decision' && e.d.who === 'owner') lines.push(`<b>Decided</b> ${LM.esc(e.d.n.replace(/\*\*/g, '').slice(0, 70))}`);
    else if (e.kind === 'milestone') lines.push(`<b>Landmark</b> ${LM.esc(e.m.n)}`);
    else if (e.kind === 'project') lines.push(`<b>Project</b> ${LM.esc(e.p.short)}`);
    else if (e.it && e.kind !== 'land') { const g = LM.groupAt(e.it, v.lens, e.t).g; const c = counts.get(g) || { birth: 0, done: 0, blocked: 0, doing: 0 }; if (e.kind === 'birth') c.birth++; else if (e.kind === 'done') c.done++; else if (e.kind === 'blocked') c.blocked++; else if (e.kind === 'doing') c.doing++; counts.set(g, c); }
  }
  const summary = [...counts.entries()].sort((a, b) => (b[1].birth + b[1].done + b[1].blocked) - (a[1].birth + a[1].done + a[1].blocked)).slice(0, 3)
    .map(([g, c]) => { const p = []; if (c.birth) p.push(`${c.birth} new`); if (c.doing) p.push(`${c.doing} started`); if (c.done) p.push(`${c.done} done`); if (c.blocked) p.push(`<em>${c.blocked} blocked</em>`); return p.length ? `<b>${LM.esc(LM.landInfo(ds, v.lens, g).name)}</b> ${p.join(', ')}` : ''; }).filter(Boolean);
  const all = [...lines.slice(0, 2), ...summary].slice(0, 3);
  const L = $('#ledger');
  if (all.length) { L.innerHTML = all.map((l) => `<div>${l}</div>`).join(''); L.classList.add('on'); LM.ledgerUntil = performance.now() + 2200; }
}
function say(msg, ms = 6000) { const t = $('#toast'); t.innerHTML = msg; t.classList.add('on'); LM.toastUntil = performance.now() + ms; }
LM.say = say;

// ---- the rail: the company's beats, and the selected task's moments ----
function drawRail() {
  const ctx = LM.railctx, W = LM.railW, H = LM.railH, ds = LM.ds, T = LM.theme, v = LM.view;
  if (!W || !v.time) return;
  ctx.clearRect(0, 0, W, H);
  const [t0, t1] = ds.span, x = (t) => ((t - t0) / (t1 - t0)) * W;
  const bands = Object.entries(ds.lenses.proj.lands).filter(([, l]) => typeof l.from === 'number');
  for (const [, l] of bands) { const a = x(l.from), b = x(l.to || t1); ctx.fillStyle = LM.rgba(T.hues[l.hue] || T.hues.slate, 0.12); ctx.fillRect(a, 4, Math.max(2, b - a), H - 8); }
  if (ds.now < t1) { ctx.fillStyle = T.ink(0.05); ctx.fillRect(x(ds.now), 0, W - x(ds.now), H); }
  if (v.sinceOn) { ctx.fillStyle = LM.rgba(T.heat, 0.16); ctx.fillRect(x(v.since), 0, Math.max(2, x(v.t) - x(v.since)), H); ctx.fillStyle = LM.rgba(T.heat, 0.95); ctx.fillRect(x(v.since) - 1, 0, 2, H); ctx.beginPath(); ctx.arc(x(v.since), H - 5, 4.5, 0, Math.PI * 2); ctx.fill(); }
  const sel = v.sel && v.sel.id ? v.sel : null;
  if (sel) {
    // the selected task's life: a bar coloured by status, its moments as ticks
    const segs = sel.seg;
    for (const sg of segs) { const a = x(sg.t0), b = x(Math.min(isFinite(sg.t1) ? sg.t1 : Math.max(ds.now, sg.t0 + sg.dur), t1)); ctx.fillStyle = LM.rgba(T.hues[STATUS_HUE[sg.s]] || T.slate, 0.8); ctx.fillRect(a, H * 0.3, Math.max(2, b - a), H * 0.4); }
    for (const m of LM.moments(ds, sel)) { ctx.fillStyle = LM.rgba(T.hues[m.hue] || T.fg, 0.95); ctx.fillRect(x(m.t) - 1, H * 0.18, 2, H * 0.64); }
  } else {
    for (const d of ds.decisions) if (d.who === 'owner') { ctx.fillStyle = LM.rgba(T.rules, 0.85); ctx.fillRect(x(d.b), H * 0.3, 1.2, H * 0.5); }
    for (const a of ds.asks) { ctx.fillStyle = LM.rgba(T.rules, 0.95); ctx.beginPath(); ctx.arc(x(a.b), H * 0.25, 2.6, 0, Math.PI * 2); ctx.fill(); }
    for (const m of ds.milestones) { ctx.fillStyle = LM.rgba(T.gold, 0.95); ctx.fillRect(x(m.t) - 0.5, H * 0.15, 1.5, H * 0.7); ctx.beginPath(); ctx.arc(x(m.t), H * 0.15, 2.8, 0, Math.PI * 2); ctx.fill(); }
    if (ds.crisis) { ctx.fillStyle = LM.rgba(T.sharp, 0.25); ctx.fillRect(x(ds.crisis.from), 2, Math.max(2, x(ds.crisis.to) - x(ds.crisis.from)), H - 4); }
  }
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
  const c = LM.canvas, root = LM.tilesEl;
  let drag = null, pinch = null, moved = false;
  const pts = new Map();
  const down = (e) => { if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return; pts.set(e.pointerId, [e.clientX, e.clientY]); e.currentTarget.setPointerCapture(e.pointerId); moved = false; LM.dragMoved = false; if (pts.size === 1) drag = { x: e.clientX, y: e.clientY, cx: LM.cam.x, cy: LM.cam.y }; else if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k: LM.cam.k }; drag = null; } };
  const move = (e) => {
    if (pts.has(e.pointerId)) pts.set(e.pointerId, [e.clientX, e.clientY]);
    if (pinch && pts.size === 2) { const [a, b] = [...pts.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); zoomAt((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (pinch.k * d) / pinch.d / LM.cam.k); moved = true; LM.dragMoved = true; return; }
    if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (!moved && Math.hypot(dx, dy) > 4) { moved = true; LM.dragMoved = true; LM.dragging = true; LM.autoFit = false; LM.renderTip(null); LM.moving(); } if (!moved) return; LM.cam.x = drag.cx - dx / LM.cam.k; LM.cam.y = drag.cy - dy / (LM.cam.k * LM.YS); LM.flight = null; LM.moving(); LM.dirty(); return; }
    if (e.currentTarget !== c) return;
    const h = LM.hit(e.clientX, e.clientY);
    c.style.cursor = h && (h.act || h.lm || h.plaque || h.pill || (h.district && LM.lod < 2) || (h.land && LM.lod < 1)) ? 'pointer' : 'grab';
    LM.renderTip(h && (h.lm || h.plaque || h.pill || (h.act && h.act.title)) ? (h.act ? { text: h.act.title } : h) : null, e.clientX, e.clientY);
  };
  const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (pts.size === 0) { const wasDrag = drag; drag = null; LM.dragging = false; if (!moved && wasDrag && e.currentTarget === c) click(e.clientX, e.clientY); if (moved) { LM.dragMoved = true; setTimeout(() => { LM.dragMoved = false; }, 0); } writeUrl(); } };
  for (const el of [c, root]) { el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); }
  c.addEventListener('pointerleave', () => { LM.renderTip(null); if (LM.view.hover) { LM.view.hover = null; LM.dirty(); } });
  const wheel = (e) => { e.preventDefault(); const f = Math.exp(-e.deltaY * 0.0012); LM.moving(); zoomAt(e.clientX, e.clientY, f); };
  c.addEventListener('wheel', wheel, { passive: false });
  root.addEventListener('wheel', wheel, { passive: false });
  c.addEventListener('dblclick', (e) => { const [wx, wy] = LM.toWorld(e.clientX, e.clientY); LM.flyTo(wx, wy, LM.cam.k * 2.2); });
}
/** While the map moves the glass stops blurring (the compositor's cost); it comes back when the map rests. */
let movingTimer = 0;
LM.moving = () => { if (!document.documentElement.classList.contains('moving')) document.documentElement.classList.add('moving'); clearTimeout(movingTimer); movingTimer = setTimeout(() => document.documentElement.classList.remove('moving'), 220); };
function zoomAt(sx, sy, f, smooth) {
  LM.autoFit = false; LM.renderTip(null);
  if (smooth) { const [wx, wy] = LM.toWorld(sx, sy); const k1 = Math.max(1.2, Math.min(160, LM.cam.k * f)); const cx = LM.cam.x + (wx - LM.cam.x) * (1 - LM.cam.k / k1), cy = LM.cam.y + (wy - LM.cam.y) * (1 - LM.cam.k / k1); LM.flyTo(cx, cy, k1, 420); return; }
  const [wx, wy] = LM.toWorld(sx, sy);
  LM.cam.k = Math.max(1.2, Math.min(160, LM.cam.k * f));
  const [nx, ny] = LM.toWorld(sx, sy);
  LM.cam.x += wx - nx; LM.cam.y += wy - ny; LM.flight = null; LM.dirty(); writeUrl();
}
LM.flyTo = function flyTo(x, y, k, ms = 800) {
  if (x === null) { const f = LM.fitAt(LM.view.t); x = f.x; y = f.y; if (k === undefined) k = f.k; }
  LM.autoFit = false;
  LM.flight = { x0: LM.cam.x, y0: LM.cam.y, k0: LM.cam.k, x1: x, y1: y, k1: k, t0: performance.now(), ms: LM.view.reduce ? 1 : ms };
  LM.dirty();
};
/** The extent of a place's cells in world units. */
function extentOf(S) { let minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity; for (const c of S.cells) { const [q, r] = c.split(',').map(Number); const [x, y] = LM.hexXY(q, r); if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; } return { minx, maxx, miny, maxy, w: maxx - minx + 2, h: maxy - miny + 2 }; }
const avail = () => ({ W: LM.W - (LM.view.panel && LM.W > 1100 ? 382 : 0) - (LM.W <= 720 ? 24 : 60), H: LM.H - (LM.W <= 720 ? 380 : LM.view.time ? 330 : 275), ox: LM.view.panel && LM.W > 1100 ? -191 : 0, oy: LM.W <= 720 ? -60 : LM.view.time ? 10 : 38 });
/** Level 2: the land fills the view, its districts as cards. */
function flyToLand(g) { const L = LM.vis && LM.vis.lands.get(g); if (!L) return; const e = extentOf(LM.shapeOf(L)), a = avail(); const k = Math.max(LM.L1 + 2, Math.min(LM.L3 - 10, Math.min(a.W / (e.w + 2), a.H / (e.h + 2)))); LM.flyTo((e.minx + e.maxx) / 2 - a.ox / k, (e.miny + e.maxy) / 2 + a.oy / k, k); }
/** Level 3: the district fills the view, its tasks as tiles (never below the task level). */
function flyToDistrict(d) { const D = LM.vis && LM.vis.districts.get(d); if (!D) return; const e = extentOf(D), a = avail(); const ys = LM.view.iso ? 0.55 : 1; const k = Math.max(LM.L3 + 4, Math.min(190, Math.min(a.W / (e.w + 2), a.H / ((e.h + 3) * ys + 0.6)))); LM.flyTo((e.minx + e.maxx) / 2 - a.ox / k, (e.miny + e.maxy) / 2 + a.oy / (k * ys), k); }
/** A chip on a summary leads to what it counts: the panel scoped to the place with that filter, and the place in view. */
LM.focusPanel = function focusPanel(filter, S, kind) { LM.panelState.filter = filter; LM.panelState.scope = 'here'; LM.view.sel = kind === 'land' ? { land: S } : { district: S }; renderView(); LM.togglePanel(true); if (kind === 'land') flyToLand(S.key); else flyToDistrict(S.key); say(`<b>${filter === 'ask' ? 'To decide' : filter === 'blocked' ? 'Stuck' : filter === 'review' ? 'In review' : 'Changed'}</b> in ${LM.esc(kind === 'land' ? LM.landInfo(LM.ds, LM.view.lens, S.key).name : LM.shortName(LM.distName(LM.ds, LM.view.lens, S.key)))}: listed in the panel, flagged on the map.`, 5000); };
/** The zoom buttons step through the three levels: into the place under the camera, or back out of it. */
function zoomStep(dir) {
  const W = LM.where(); LM.renderTip(null);
  if (dir > 0) {
    if (LM.lod === 0) { const L = W.land || [...LM.vis.lands.values()].sort((a, b) => Math.hypot(a.cx - LM.cam.x, a.cy - LM.cam.y) - Math.hypot(b.cx - LM.cam.x, b.cy - LM.cam.y))[0]; if (L) flyToLand(L.key); }
    else if (LM.lod === 1) { const L = W.land; const D = W.dist || (L && [...LM.vis.districts.values()].filter((x) => x.land === L.key && x.built).sort((a, b) => (b.asks * 4 + b.blocked * 3 + b.n * 0.05) - (a.asks * 4 + a.blocked * 3 + a.n * 0.05))[0]); if (D) flyToDistrict(D.key); }
    else zoomAt(LM.W / 2, LM.H / 2, 1.4, true);
  } else {
    if (LM.lod === 2) { const L = W.land; if (L) flyToLand(L.key); else LM.flyTo(null, null); }
    else LM.flyTo(null, null);
  }
}
LM.zoomStep = zoomStep;
/** The level segment: jump to a level, into the place under the camera. */
function goLevel(l) {
  const W = LM.where();
  if (l === 0) { select(null); LM.flyTo(null, null); return; }
  if (l === 1) { const L = W.land || [...LM.vis.lands.values()].sort((a, b) => Math.hypot(a.cx - LM.cam.x, a.cy - LM.cam.y) - Math.hypot(b.cx - LM.cam.x, b.cy - LM.cam.y))[0]; if (L) flyToLand(L.key); return; }
  const L = W.land; const D = W.dist || (L && [...LM.vis.districts.values()].filter((x) => x.land === L.key && x.built).sort((a, b) => (b.asks * 4 + b.blocked * 3 + b.n * 0.05) - (a.asks * 4 + a.blocked * 3 + a.n * 0.05))[0]) || [...LM.vis.districts.values()].filter((x) => x.built).sort((a, b) => (b.asks * 4 + b.blocked * 3) - (a.asks * 4 + a.blocked * 3) || b.n - a.n)[0];
  if (D) flyToDistrict(D.key);
}
LM.goLevel = goLevel;
function click(sx, sy) {
  const h = LM.hit(sx, sy);
  LM.renderTip(null);
  if (!h) { select(null); return; }
  if (h.act) { const a = h.act; if (a.ask) select({ ask: a.ask, it: a.it || null }); else if (a.it) { const p = LM.posOf && LM.posOf.get(a.it.id); if (p && LM.lod < 2) flyToDistrict(p.d); select(a.it); } else if (a.dist) { const D = LM.vis.districts.get(a.dist); if (D) select({ district: D }); flyToDistrict(a.dist); } else if (a.go) LM.focusPanel(a.go, a.S, a.kind); else if (a.land) { select({ land: a.land }); } return; }
  if (h.pill && !h.it) { const S = h.pill.S; if (h.pill.kind === 'land') flyToLand(S.key); else flyToDistrict(S.key); return; }
  if (h.plaque) { select({ plaque: h.plaque }); return; }
  if (h.lm) { select({ lm: h.lm, v: h }); return; }
  if (h.district) { if (LM.lod === 1) { select({ district: h.district }); flyToDistrict(h.district.key); } else if (LM.lod === 0) { const L = LM.vis.lands.get(h.district.land); select(L ? { land: L } : null); flyToLand(h.district.land); } else select({ district: h.district }); return; }
  if (h.land) { select({ land: h.land }); if (LM.lod === 0) flyToLand(h.land.key); }
}

// ---- selection and the views ----
function select(x) { LM.view.sel = x; renderView(); LM.dirty(); writeUrl(); }
LM.select = select; LM.setTrace = (k, x) => setTrace(k, x); LM.flyToLand = flyToLand; LM.flyToDistrict = flyToDistrict; LM.togglePlay = togglePlay; LM.setTime = setTime; LM.setLens = setLens; LM.toggleOverlay = toggleOverlay;
function setProject(id) { LM.view.proj = id; LM.keyEl.dataset.state = ''; LM.dirty(); writeUrl(); }
LM.setProject = setProject;
function act(name) { say(`<b>${name}</b> — in the product this acts (docs/17 LM-A); here it is a mock.`, 3000); }
const facadeBig = (f, cls = '') => `<span class="fac ${cls}">${LM.FACADES[LM.FACADES[f] ? f : 'doc']}</span>`;
function renderView() {
  const V = $('#pv'), s = LM.view.sel, ds = LM.ds, v = LM.view;
  const inPanel = s && !s.project;
  $('#dim').hidden = !s || inPanel;
  if (!s || inPanel) { V.hidden = true; if (inPanel) { LM.panelState.key = ''; LM.togglePanel(true); LM.renderPanel(true); } else LM.renderPanel(true); return; }
  const close = `<button class="ic x" id="pvx" title="Close">${I('x')}</button>`;
  const acts = (list) => `<div class="acts">${list.map(([ico, n, fn, cls]) => `<button class="pill${cls ? ' ' + cls : ''}" data-a="${fn}">${I(ico)}<span>${n}</span></button>`).join('')}</div>`;
  let html = '';
  if (s.id) html = itemView(s, close, acts);
  else if (s.ask) html = askView(s.ask, s.it, close, acts);
  else if (s.project) html = projectView(s.project, close, acts);
  else if (s.mon) html = flagView(s.mon, close, acts);
  else if (s.plaque) html = plaqueView(s.plaque, close, acts);
  else if (s.lm) html = `${close}<div class="pvh">${gl2('milestone', 'gold', 'lg')}<div><span class="lbl2">Landmark · ${LM.fmtDate(s.lm.t)}</span><span class="ttl t4">${LM.esc(s.lm.n)}</span></div></div><div class="line1">${gl2('milestone', 'gold')}<span>A milestone met. It stays on the skyline for ever: finished things stay visible.</span></div>${acts([['play', 'Play from here', 'playLm'], ['message-circle-question', 'Ask', 'ask']])}`;
  else if (s.district) html = placeView(s.district, 'district', close, acts);
  else if (s.land) html = placeView(s.land, 'land', close, acts);
  V.innerHTML = html; V.hidden = false; marks(V);
  bindView(V, s);
}
/** The context views for the panel: the same views, for the right side. */
LM.contextHtml = function contextHtml(s) {
  const acts = (list) => `<div class="acts">${list.map(([ico, n, fn, cls]) => `<button class="pill${cls ? ' ' + cls : ''}" data-a="${fn}">${I(ico)}<span>${n}</span></button>`).join('')}</div>`;
  if (s.id) return itemView(s, '', acts);
  if (s.ask) return askView(s.ask, s.it, '', acts);
  if (s.mon) return flagView(s.mon, '', acts);
  if (s.plaque) return plaqueView(s.plaque, '', acts);
  if (s.lm) return `<div class="pvh">${gl2('milestone', 'gold', 'lg')}<div><span class="lbl2">Landmark · ${LM.fmtDate(s.lm.t)}</span><span class="ttl t4">${LM.esc(s.lm.n)}</span></div></div><div class="line1">${gl2('milestone', 'gold')}<span>A milestone met. It stays on the skyline for ever: finished things stay visible.</span></div>${acts([['play', 'Play from here', 'playLm'], ['message-circle-question', 'Ask', 'ask']])}`;
  return '';
};
LM.bindView = (root, s) => bindView(root, s);
function bindView(V, s) {
  const ds = LM.ds, v = LM.view;
  const x = V.querySelector('#pvx'); if (x) x.onclick = () => select(null);
  for (const b of V.querySelectorAll('[data-dec]')) b.onclick = () => { const d = ds.decisions.find((x) => x.id === b.dataset.dec); if (d) { select({ mon: d }); } };
  for (const b of V.querySelectorAll('[data-dist]')) b.onclick = () => { select(null); flyToDistrict(b.dataset.dist); };
  for (const b of V.querySelectorAll('[data-land]')) b.onclick = () => { select(null); flyToLand(b.dataset.land); };
  for (const b of V.querySelectorAll('[data-open]')) b.onclick = () => { const it = ds.byId.get(b.dataset.open); if (it) { const p = LM.posOf && LM.posOf.get(it.id); if (p) flyToDistrict(p.d); select(it); } };
  for (const b of V.querySelectorAll('[data-proj]')) b.onclick = () => LM.openProject(b.dataset.proj);
  for (const b of V.querySelectorAll('[data-askid]')) b.onclick = () => { const a = ds.asks.find((x) => x.id === b.dataset.askid); if (a) select({ ask: a, it: s.id ? s : null }); };
  for (const b of V.querySelectorAll('[data-t]')) b.onclick = () => { if (!v.time) toggleTime(true); setTime(Number(b.dataset.t)); say(`${LM.fmtDate(Number(b.dataset.t), ds.key === 'lucid')}: the map as it was at this moment.`); };
  for (const b of V.querySelectorAll('.acts .pill')) b.onclick = () => {
    const a = b.dataset.a;
    if (a === 'traceItem') { select(null); setTrace('item', s); } else if (a === 'traceDec') { select(null); setTrace('decision', s.mon); }
    else if (a === 'playItem') { select(null); if (!v.time) toggleTime(true); setTime(s.b); togglePlay(true); } else if (a === 'playDec') { select(null); if (!v.time) toggleTime(true); setTime(s.mon.b - 1000); togglePlay(true); setTrace('decision', s.mon); }
    else if (a === 'playLm') { select(null); if (!v.time) toggleTime(true); setTime(s.lm.t - LM.ds.win.stale); togglePlay(true); }
    else if (a === 'flyD') { select(null); flyToDistrict(s.district.key); } else if (a === 'playD') { select(null); if (!v.time) toggleTime(true); const first = Math.min(...s.district.items.map((x) => x.t || x.it.b)); setTime(first); togglePlay(true); }
    else if (a === 'flyL') { select(null); flyToLand(s.land.key); } else if (a === 'playL') { select(null); if (!v.time) toggleTime(true); const first = Math.min(...s.land.items.map((x) => x.t || x.it.b)); setTime(first); togglePlay(true); }
    else if (a === 'sinceHere') { select(null); setSince(LM.view.t - LM.ds.win.review); }
    else if (a === 'mapProj') { select(null); setProject(s.project.id); const pts = s.project.items.map((id) => LM.posOf && LM.posOf.get(id)).filter(Boolean); if (pts.length) { const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y); const w = Math.max(...xs) - Math.min(...xs) + 6, h = (Math.max(...ys) - Math.min(...ys) + 6) * LM.YS; const k = Math.max(4, Math.min(40, Math.min((LM.W - (v.panel ? 420 : 80)) / w, (LM.H - 260) / h))); LM.flyTo((Math.min(...xs) + Math.max(...xs)) / 2 + (v.panel && LM.W > 1100 ? 160 / k : 0), (Math.min(...ys) + Math.max(...ys)) / 2, k); } say(`<b>${LM.esc(s.project.short)}</b> on the map: its tasks in full, the rest dimmed, its thread in gold. Esc clears.`, 6000); }
    else if (a === 'playProj') { select(null); if (!v.time) toggleTime(true); setProject(s.project.id); setTime(s.project.b); togglePlay(true); }
    else if (a === 'openParent') { const p = ds.byId.get(s.parent); if (p) select(p); }
    else if (a === 'decideYes' || a === 'decideNo' || a === 'decideLater') { const ask = s.ask; ask.open = false; ask.answer = a === 'decideYes' ? 'yes' : a === 'decideNo' ? 'no' : 'later'; if (a === 'decideLater') { ask.open = true; LM.dismissed.add('A:' + ask.id); } select(null); LM.panelState.key = ''; say(`<b>${a === 'decideYes' ? 'Decided' : a === 'decideNo' ? 'Declined' : 'Later'}</b> · ${LM.esc(ask.short)} — recorded as a decision in the product; here the flag comes down.`, 5000); LM.dirty(); }
    else act(b.textContent.trim());
  };
}
/** The time strip: a task's life as a bar coloured by status with its moments as ticks, born → now. */
function timeStrip(it, moments) {
  const ds = LM.ds, v = LM.view;
  const t0 = it.b, t1 = Math.max(ds.now, it.end + (it.last === 'done' || it.last === 'dropped' ? 0 : ds.win.stale));
  const x = (t) => Math.max(0, Math.min(100, ((t - t0) / Math.max(1, t1 - t0)) * 100));
  const segs = it.seg.map((sg) => `<i class="ts s-${sg.s}" style="left:${r2(x(sg.t0))}%;width:${r2(Math.max(0.6, x(Math.min(t1, isFinite(sg.t1) ? sg.t1 : t1)) - x(sg.t0)))}%" title="${LM.STATUS_WORD[sg.s]} from ${LM.fmtDate(sg.t0)}"></i>`).join('');
  const ticks = moments.map((m) => `<button class="tk f-${m.hue}" style="left:${r2(x(m.t))}%" data-t="${m.t}" title="${LM.esc(m.text)} · ${LM.fmtDate(m.t, ds.key === 'lucid')}">${I(m.glyph)}</button>`).join('');
  const nowX = x(Math.min(v.t, t1));
  return `<div class="tstrip"><div class="bar">${segs}<i class="now" style="left:${r2(nowX)}%"></i></div><div class="ticks">${ticks}</div><div class="ax"><span>${LM.fmtShort(t0)}</span><span>${LM.dur(Math.min(v.t, it.end) - t0)} of life${it.doneAt ? ` · done in ${LM.dur(it.doneAt - it.b)}` : ''}</span><span>${LM.fmtShort(t1)}</span></div></div>`;
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
  const asks = LM.asksOf(ds, it, v.t);
  const projs = it.projects.map((id) => ds.byProject.get(id)).filter(Boolean);
  const kids = it.children.map((id) => ds.byId.get(id)).filter(Boolean);
  const parent = it.parent && ds.byId.get(it.parent);
  const moments = LM.moments(ds, it).filter((m) => m.t <= v.t);
  const cmp = `<div class="cmp" style="--split:${Math.round((1 - h) * 100)}%"><span class="side exp">${facadeBig(facadeKey)}</span><span class="side act">${facadeBig(facadeKey)}</span><span class="split"></span><span class="knob">${I('chevrons-left-right')}</span><span class="tag" style="inset-inline-start:14px">${I('pencil-ruler')}Expected · the brief</span><span class="tag" style="inset-inline-end:14px">${I('camera')}Actual · ${st && st.done ? 'the product' : `${Math.round(h * 100)} % built`}</span>${st && st.blocked ? `<span class="barrier breach" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">${I('construction')}</span>` : ''}</div>`;
  const goal = `<div class="line1">${glyph('goal')}<span><b>Goal</b>  Serves ${LM.esc(land.name)}: ${LM.esc(land.sub || 'its part of the company')}</span></div>
    <div class="line1">${glyph('milestone')}<span><b>Done when</b>  ${rooms.map((r) => r.name.toLowerCase()).join(', ')}.</span></div>`;
  const askBox = asks.length ? `<div class="askbox">${asks.map((a) => `<button class="row frow" data-askid="${a.id}">${gl2(a.kind === 'approve' ? 'badge-check' : a.kind === 'unblock' ? 'construction' : 'message-circle-question', 'rules', 'sm')}<span class="grow"><b>${a.to === 'owner' ? 'Needs you' : 'Needs the lead'}</b> · ${LM.esc(a.n)}</span><em>${LM.rel(a.b, v.t)}</em></button>`).join('')}</div>` : '';
  const left = `<div class="col" style="gap:18px"><div class="pvh">${glyph(it.k, 'lg')}<div><span class="lbl2">${parent ? `Subtask of <button class="link" data-open="${parent.id}">${LM.esc(parent.short)}</button> · ` : ''}${it.id}</span><span class="ttl t4">${LM.esc(it.n.length > 110 ? it.n.slice(0, 108) + '…' : it.n)}</span></div></div>${askBox}${st && st.done ? doneRipple(it, downs) : cmp}${goal}
    <div class="col" style="gap:6px"><span class="lbl2">Moments · its life over time</span>${timeStrip(it, moments)}<div class="col" style="gap:2px">${moments.slice().reverse().slice(0, 7).map((m) => `<button class="row frow sm" data-t="${m.t}">${gl2(m.glyph, m.hue, 'sm')}<span class="grow">${LM.esc(m.text)}</span><em>${LM.fmtDate(m.t, ds.key === 'lucid')}</em></button>`).join('')}${moments.length > 7 ? `<span class="meta" style="padding:4px 10px">and ${moments.length - 7} earlier</span>` : ''}</div></div></div>`;
  const ctx = `<div class="ctx">${chip(`<span class="h-${land.hue}" style="display:inline-flex">${LM_SVG(land.lm, 16)}</span>`, land.name, '', `data-land="${g}"`)}${chip('map-pin', LM.shortName(LM.distName(ds, v.lens, d)).slice(0, 28))}${projs.map((p) => chip('kanban', p.short, 'proj', `data-proj="${p.id}"`)).join('')}${dec ? chip('signpost', `Opened by ${dec.id}`, '', `data-dec="${dec.id}"`) : ''}${chip(av(who), who.name)}${chip(st && st.blocked ? 'construction' : st && st.done ? 'circle-check-big' : 'circle-dot', word, st && st.blocked ? 'block' : '')}${chip('clock', `Since ${LM.fmtShort(st ? st.since : it.b)}`)}${it.cost ? chip('flame', LM.fmtMoney(st ? st.cost : 0)) : ''}${chip('ruler', `Size ${it.s}`)}</div>`;
  const crit = `<div class="row" style="gap:22px;align-items:flex-start"><span class="critr">${ringSvg(140, 0, { segs: rooms.map((r) => r.st), w: 10, gap: 3, hi: rooms.indexOf(partly), label: `Criteria: ${met} of ${rooms.length} met` })}<span class="critc"><span class="ttl t3">${met} of ${rooms.length}</span><span class="meta">criteria met</span></span></span>
    <div class="col" style="gap:6px;flex:1">${rooms.map((r) => `<span class="row rm ${r.st}">${I(r.st === 'met' ? 'circle-check-big' : r.st === 'partly' ? 'contrast' : 'circle-dashed')}<span>${r.name}</span></span>`).join('')}</div></div>`;
  const subs = kids.length ? `<div class="col" style="gap:4px"><span class="lbl2">Divided into ${kids.length}</span>${kids.map((c) => { const s = LM.stateAt(ds, c, v.t); return `<button class="row frow" data-open="${c.id}">${glyph(c.k, 'sm')}<span class="grow">${LM.esc(c.short)}</span>${s ? `<span class="st-${s.s} stw">${LM.STATUS_WORD[s.s]}</span>` : '<em>not yet</em>'}</button>`; }).join('')}</div>` : '';
  const aiLine = st ? (st.done ? `Done ${LM.dur(it.doneAt - it.b)} after it was created${downs.length ? `; ${downs.length} task${downs.length > 1 ? 's' : ''} waited on it` : ''}.` : st.blocked ? `Blocked since ${LM.fmtShort(st.since)}${ups.length ? `; it waits on ${LM.esc(ups[0].short)}` : ''}. Nudge the upstream or re-plan.` : st.s === 'todo' ? `Planned, not started. ${ups.length ? `It waits on ${ups.length} task${ups.length > 1 ? 's' : ''}.` : 'Nothing stands in its way.'}` : `${Math.round(h * 100)} % built, ${word.toLowerCase()} since ${LM.fmtShort(st.since)}${st.stale ? '; nothing has moved for a while' : ''}.`) : 'Not created yet at this moment.';
  const talk = `<div class="say">${AI('g')}<span class="bub ai"><span class="who">Lucid</span>${aiLine}<span class="row" style="gap:8px;margin-top:10px">${pill('check', 'Apply', 'pri sm', 'data-a="apply"')}${pill('file-text', 'Open the log', 'sm', 'data-a="open"')}</span></span></div>`;
  const right = `<div class="col" style="gap:24px">${ctx}${crit}${subs}${talk}${roadsMini(it, ups, downs, st)}${acts([['move-right', 'Nudge', 'nudge'], ['user-plus', 'Assign', 'assign'], ['check', 'Approve', 'approve'], ['git-branch', 'Divide', 'divide'], ['message-circle-question', 'Ask', 'ask'], ['route', 'Trace', 'traceItem'], ['play', 'Play from here', 'playItem']])}</div>`;
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
  return `<div class="col" style="gap:6px"><span class="lbl2">Dependencies</span><div style="position:relative;height:${H}px"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="position:absolute;inset:0;width:100%;height:100%" preserveAspectRatio="none" aria-hidden="true">${roads}</svg>${nodes}${me}</div>
    <div class="row" style="justify-content:space-between;font-size:15px;color:var(--muted)"><span class="row" style="gap:6px">${I('hourglass')}${u.length ? `Waits on ${u.length === 1 ? LM.esc(u[0].short) : u.length + ' tasks'}` : 'Waits on nothing'}</span><span class="row" style="gap:6px">${dn.length ? `${dn.length === 1 ? LM.esc(dn[0].short) : dn.length + ' tasks'} wait${dn.length === 1 ? 's' : ''}` : 'Nothing waits on it'}${I('arrow-right')}</span></div></div>`;
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
function askView(a, it, close, acts) {
  const ds = LM.ds, v = LM.view;
  const refs = (a.refs || (a.it ? [a.it] : [])).map((id) => ds.byId.get(id)).filter(Boolean);
  const dec = a.dec && ds.decisions.find((x) => x.id === a.dec);
  const who = LM.who({ owner: a.by });
  return `${close}<div class="pvg"><div class="pvl"><div class="col" style="gap:18px"><div class="pvh">${glyph(a.kind === 'approve' ? 'feedback' : 'ask', 'lg')}<div><span class="lbl2">${a.kind === 'approve' ? 'Approval' : a.kind === 'unblock' ? 'Unblock' : a.kind === 'instruction' ? 'Instruction' : 'Decision'} wanted · ${LM.fmtDate(a.b)} · asked by ${LM.esc(a.by)}</span><span class="ttl t4">${LM.esc(a.n)}</span></div></div>
    <div class="cut" style="height:200px;display:grid;place-items:center"><span class="flagbig"><span class="pole"></span><span class="ban">${I('message-circle-question')}${a.to === 'owner' ? 'Needs you' : 'Needs the lead'}</span></span><span class="meta" style="position:absolute;bottom:14px;left:16px">Open for ${LM.dur(v.t - a.b)}${refs.length ? ` · ${refs.length} task${refs.length > 1 ? 's' : ''} wait on it` : ''}</span></div>
    <div class="line1">${gl2('info', 'rules')}<span>${a.kind === 'approve' ? 'The work is in review; approving it marks it done and frees what waits on it.' : a.kind === 'unblock' ? 'Something upstream stands in the way; the asker needs a call or a change of plan.' : a.kind === 'instruction' ? 'An instruction from the owner, fresh; the lead turns it into tasks and a decision record.' : 'A choice with consequences down the line; it is recorded as a decision, with its reasoning, when answered.'}</span></div></div></div>
    <div class="pvr"><div class="col" style="gap:22px"><div class="ctx">${chip(av(who), a.by)}${chip(a.to === 'owner' ? 'crown' : 'compass', a.to === 'owner' ? 'For the owner' : 'For the lead')}${chip('calendar', LM.fmtShort(a.b))}${dec ? chip('signpost', dec.id, '', `data-dec="${dec.id}"`) : ''}</div>
    ${refs.length ? `<span class="lbl2">What waits on it</span><div class="col" style="gap:4px">${refs.slice(0, 8).map((o) => { const s = LM.stateAt(ds, o, v.t); return `<button class="row frow" data-open="${o.id}">${glyph(o.k, 'sm')}<span class="grow">${LM.esc(o.short)}</span>${s ? `<span class="st-${s.s} stw">${LM.STATUS_WORD[s.s]}</span>` : '<em>not yet</em>'}</button>`; }).join('')}</div>` : ''}
    <div class="say">${AI('g')}<span class="bub ai"><span class="who">Lucid</span>${a.kind === 'decide' ? 'Two of the three options were costed in the thread; the cheaper one delays the launch by two weeks. Whichever you pick, I will record it as a decision and open the tasks.' : a.kind === 'approve' ? 'All criteria read as met; the walkthrough evidence is attached. Approving frees the downstream tasks today.' : a.kind === 'unblock' ? 'The upstream has not moved for a while. Reassigning it or re-planning around it both work; say which.' : 'I will turn this into tasks under the right project and come back with the brief.'}</span></div>
    ${acts([['check', a.kind === 'approve' ? 'Approve' : 'Decide: yes', 'decideYes', 'pri'], ['x', a.kind === 'approve' ? 'Send back' : 'Decide: no', 'decideNo'], ['clock', 'Later', 'decideLater'], ['message-circle-question', 'Ask', 'ask']])}</div></div></div>`;
}
function flagView(dcs, close, acts) {
  const ds = LM.ds, v = LM.view;
  const kids = [...dcs.lin].map((id) => ds.byId.get(id)).filter(Boolean);
  const states = kids.map((o) => LM.stateAt(ds, o, v.t)).filter(Boolean);
  const done = states.filter((s) => s.done).length, blocked = states.filter((s) => s.blocked).length;
  const home = dcs.home && dcs.home[v.lens] ? LM.landInfo(ds, v.lens, dcs.home[v.lens]) : null;
  const P = ds.projects.find((p) => p.dec === dcs.id);
  return `${close}<div class="pvg"><div class="pvl"><div class="col" style="gap:18px"><div class="pvh">${glyph('decision', 'lg')}<div><span class="lbl2">Decision · ${LM.fmtDate(dcs.b)} · by the ${dcs.who}</span><span class="ttl t4">${LM.esc(dcs.n.replace(/\*\*/g, ''))}</span></div></div>
    <div class="cut" style="height:220px;display:grid;place-items:center"><span class="flagbig"><span class="pole"></span><span class="ban">${I('signpost')}${dcs.id}</span></span><span class="meta" style="position:absolute;bottom:14px;left:16px">${kids.length ? `${kids.length} task${kids.length > 1 ? 's' : ''} followed · ${done} done${blocked ? ` · <em>${blocked} blocked</em>` : ''}` : 'No tasks cite it yet'}</span></div>
    ${home ? `<div class="line1">${gl2('map-pin', home.hue)}<span><b>Stands in</b>  ${LM.esc(home.name)}${home.sub ? ': ' + LM.esc(home.sub) : ''}</span></div>` : ''}</div></div>
    <div class="pvr"><div class="col" style="gap:22px"><div class="ctx">${chip('signpost', dcs.id)}${chip(dcs.who === 'owner' ? 'crown' : 'compass', dcs.who === 'owner' ? 'The owner' : 'The lead')}${chip('calendar', LM.fmtShort(dcs.b))}${P ? chip('kanban', P.short, 'proj', `data-proj="${P.id}"`) : ''}${kids.length ? chip('building-2', `${kids.length} followed`) : ''}</div>
    ${kids.length ? `<span class="lbl2">What followed</span><div class="col" style="gap:4px">${kids.slice(0, 8).map((o) => { const s = LM.stateAt(ds, o, v.t); return `<button class="row frow" data-open="${o.id}">${glyph(o.k, 'sm')}<span class="grow">${LM.esc(o.short)}</span>${s ? `<span class="st-${s.s} stw">${LM.STATUS_WORD[s.s]}</span>` : '<em>not yet</em>'}</button>`; }).join('')}${kids.length > 8 ? `<span class="meta">and ${kids.length - 8} more</span>` : ''}</div>` : ''}
    ${acts([['route', 'Trace its effects', 'traceDec', 'pri'], ['play', 'Play from here', 'playDec'], ['message-circle-question', 'Ask', 'ask']])}</div></div></div>`;
}
function plaqueView(S, close, acts) {
  const ds = LM.ds, v = LM.view;
  const list = S.list.slice().reverse();
  return `${close}<div class="col" style="gap:18px"><div class="pvh">${glyph('decision', 'lg')}<div><span class="lbl2">${LM.esc(LM.landInfo(ds, v.lens, S.g).name)} · ${LM.esc(LM.shortName(LM.distName(ds, v.lens, S.d)))}</span><span class="ttl t4">${S.n} decision${S.n > 1 ? 's' : ''} decided here</span></div></div>
    <div class="col" style="gap:4px;max-height:50vh;overflow:auto">${list.map((x) => `<button class="row frow" data-dec="${x.mon.id}">${glyph('decision', 'sm')}<span class="grow"><b style="color:var(--f-rules)">${x.mon.id}</b> ${LM.esc(x.mon.n.replace(/\*\*/g, '').slice(0, 80))}</span><em>${LM.fmtShort(x.mon.b)}${x.mon.who === 'owner' ? ' · owner' : ''}</em></button>`).join('')}</div></div>`;
}
function placeView(S, kind, close, acts) {
  const ds = LM.ds, v = LM.view;
  const info = kind === 'land' ? LM.landInfo(ds, v.lens, S.key) : { name: LM.shortName(LM.distName(ds, v.lens, S.key)), sub: '', hue: LM.landInfo(ds, v.lens, S.land).hue, lm: LM.landInfo(ds, v.lens, S.land).lm };
  const pct = S.size ? S.doneSize / S.size : 0;
  const dists = kind === 'land' ? [...LM.vis.districts.values()].filter((D) => D.land === S.key).sort((a, b) => b.n - a.n).slice(0, 8) : [];
  const stuck = S.items.filter((x) => x.it && x.st.blocked).slice(0, 5);
  const asks = LM.openAsks(ds, v.t).filter((a) => { const p = LM.askPlace(ds, a, v.lens, v.t); return kind === 'land' ? p.g === S.key : p.d === S.key; });
  const projs = new Map(); for (const x of S.items) if (x.it) for (const pid of x.it.projects) projs.set(pid, (projs.get(pid) || 0) + 1);
  const topProjs = [...projs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => ({ P: ds.byProject.get(id), n })).filter((x) => x.P);
  const owners = new Map(); for (const x of S.items) if (x.it) { const w = LM.who(x.it); const c = owners.get(w.name) || { w, n: 0 }; c.n++; owners.set(w.name, c); }
  const crew = [...owners.values()].sort((a, b) => b.n - a.n).slice(0, 6);
  const words = `${S.built || 0} tasks · ${S.done || 0} done · ${S.working || 0} in progress${S.blocked ? ` · <em>${S.blocked} blocked</em>` : ''}${S.stale ? ` · ${S.stale} still` : ''}`;
  const since = v.sinceOn && LM.since ? (kind === 'land' ? LM.since.places : LM.since.districts).get(S.key) : null;
  const left = `<div class="col" style="gap:18px"><div class="pvh"><div class="place l h-${info.hue}"><span class="md" style="width:132px;height:132px">${ringSvg(132, pct, { w: 6 })}<span class="free">${LM_SVG(info.lm, 84)}</span></span></div><div><span class="lbl2">${kind === 'land' ? 'Land' : 'District of ' + LM.esc(LM.landInfo(ds, v.lens, S.land).name)}</span><span class="ttl t4">${LM.esc(info.name)}</span><span class="mut" style="display:block;margin-top:6px">${LM.esc(info.sub || '')}</span></div></div>
    <div class="line1">${gl2('building-2', info.hue)}<span>${words}</span></div>
    ${asks.length ? `<div class="col" style="gap:4px"><span class="lbl2">Needs a decision here</span>${asks.slice(0, 5).map((a) => `<button class="row frow" data-askid="${a.id}">${gl2('message-circle-question', 'rules', 'sm')}<span class="grow">${LM.esc(a.n)}</span><em>${LM.rel(a.b, v.t)}</em></button>`).join('')}</div>` : ''}
    <div class="col" style="gap:6px"><span class="lbl2">How it grew</span>${coastline(S, kind)}</div>
    ${since ? `<div class="line1">${gl2('history', 'heat')}<span><b>Since ${LM.fmtShort(v.since)}</b>  ${since.n} changed: ${since.new} new, ${since.progressed} moved on, ${since.done} done${since.blocked ? `, <em>${since.blocked} blocked</em>` : ''}</span></div>` : ''}</div>`;
  const right = `<div class="col" style="gap:22px">
    ${topProjs.length ? `<span class="lbl2">Projects here</span><div class="col" style="gap:4px">${topProjs.map(({ P, n }) => { const ps = LM.projectStats(ds, P, v.t); return `<button class="row frow" data-proj="${P.id}"><span class="h-gold" style="display:inline-flex">${ringSvg(26, ps.pct, { w: 3 })}</span><span class="grow">${LM.esc(P.short)}</span><em>${n} here · ${ps.open} open${ps.blocked ? ` · ${ps.blocked} blk` : ''}</em></button>`; }).join('')}</div>` : ''}
    ${dists.length ? `<span class="lbl2">Districts</span><div class="col" style="gap:4px">${dists.map((D) => `<button class="row frow" data-dist="${D.key}"><span class="h-${info.hue}" style="display:inline-flex">${ringSvg(26, D.size ? D.doneSize / D.size : 0, { w: 3 })}</span><span class="grow">${LM.esc(LM.shortName(LM.distName(ds, v.lens, D.key)).slice(0, 40))}</span><em>${D.built} · ${D.done} done${D.blocked ? ` · ${D.blocked} blk` : ''}</em></button>`).join('')}</div>` : ''}
    ${crew.length ? `<span class="lbl2">Who is here</span><div class="row" style="gap:10px;flex-wrap:wrap">${crew.map(({ w, n }) => `<span class="row" style="gap:6px">${av(w, 'md')}<span>${LM.esc(w.name)}<span class="meta" style="display:block">${n} task${n > 1 ? 's' : ''}</span></span></span>`).join('')}</div>` : ''}
    ${stuck.length ? `<span class="lbl2">Stuck</span><div class="col" style="gap:4px">${stuck.map((x) => `<button class="row frow" data-open="${x.it.id}">${gl2('construction', 'block', 'sm')}<span class="grow">${LM.esc(x.it.short)}</span><em>since ${LM.fmtShort(x.st.since)}</em></button>`).join('')}</div>` : ''}
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

// ---- projects: the divisible level above a task ----
function projectView(P, close, acts) {
  const ds = LM.ds, v = LM.view;
  const S = LM.projectStats(ds, P, v.t);
  const lead = LM.who({ owner: P.lead });
  const dec = P.dec && ds.decisions.find((x) => x.id === P.dec);
  const t0 = S.first === Infinity ? P.b : S.first, t1 = Math.max(v.t, S.end);
  const x = (t) => Math.max(0, Math.min(100, ((t - t0) / Math.max(1, t1 - t0)) * 100));
  // the Gantt: every task as a bar, grouped by state, newest at the bottom
  const rows = S.items.slice().sort((a, b) => a.b - b.b).slice(0, 40);
  const gantt = rows.map((it) => { const st = LM.stateAt(ds, it, v.t); const segs = it.seg.filter((sg) => sg.t0 <= v.t).map((sg) => `<i class="ts s-${sg.s}" style="left:${r2(x(sg.t0))}%;width:${r2(Math.max(0.5, x(Math.min(v.t, isFinite(sg.t1) ? sg.t1 : v.t)) - x(sg.t0)))}%"></i>`).join(''); return `<button class="grow-row" data-open="${it.id}" title="${LM.esc(it.n)}"><span class="gl">${glyph(it.k, 'sm')}<span class="gn">${LM.esc(it.short)}</span>${it.children.length ? `<span class="meta">÷${it.children.length}</span>` : ''}</span><span class="gb">${segs}${st && st.blocked ? `<span class="gmark block" style="left:${r2(x(st.since))}%">${I('construction')}</span>` : ''}</span><span class="st-${st ? st.s : 'todo'} stw">${st ? LM.STATUS_WORD[st.s] : 'not yet'}</span></button>`; }).join('');
  const related = new Map(); for (const it of S.items) for (const pid of it.projects) if (pid !== P.id) related.set(pid, (related.get(pid) || 0) + 1);
  const rel = [...related.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, n]) => ({ P: ds.byProject.get(id), n })).filter((r) => r.P);
  const byState = [['blocked', 'Blocked'], ['review', 'In review'], ['doing', 'In progress'], ['todo', 'Planned'], ['done', 'Done'], ['dropped', 'Set aside']];
  const health = { needs: ['Needs a decision', 'rules', 'message-circle-question'], watch: ['Watch', 'hold', 'eye'], done: ['Done', 'good', 'circle-check-big'], ok: ['On its way', 'good', 'trending-up'] }[S.health];
  const left = `<div class="col" style="gap:18px"><div class="pvh">${gl2('kanban', 'gold', 'lg')}<div><span class="lbl2">${P.kind === 'decision' ? `Project opened by the decision ${P.dec}` : 'Project'} · ${LM.fmtShort(P.b)} → ${S.open ? 'open' : LM.fmtShort(S.end)}</span><span class="ttl t4">${LM.esc(P.n)}</span><span class="mut" style="display:block;margin-top:6px">${LM.esc(P.goal || '')}</span></div></div>
    <div class="pstats"><span class="pst"><span class="critr">${ringSvg(96, S.pct, { w: 7 })}<span class="critc"><span class="ttl t3">${Math.round(S.pct * 100)}<small>%</small></span></span></span><span class="meta">done, by size</span></span>
      <span class="pst big"><b class="num">${S.n}</b><span class="meta">tasks${S.children ? ` · ${S.children} subtasks` : ''}</span></span>
      <span class="pst big"><b class="num">${S.open}</b><span class="meta">open</span></span>
      <span class="pst big ${S.blocked ? 'warn' : ''}"><b class="num">${S.blocked}</b><span class="meta">blocked</span></span>
      <span class="pst big ${S.asks.length ? 'ask' : ''}"><b class="num">${S.asks.length}</b><span class="meta">to decide</span></span>
      <span class="pst"><span class="g f-${health[1]} lg">${I(health[2])}</span><span class="meta">${health[0]}</span></span></div>
    ${S.asks.length ? `<div class="col" style="gap:4px"><span class="lbl2">Needs a decision</span>${S.asks.slice(0, 4).map((a) => `<button class="row frow" data-askid="${a.id}">${gl2('message-circle-question', 'rules', 'sm')}<span class="grow">${LM.esc(a.n)}</span><em>${a.to === 'owner' ? 'you' : 'lead'} · ${LM.rel(a.b, v.t)}</em></button>`).join('')}</div>` : ''}
    <div class="col" style="gap:6px"><span class="lbl2">Time · every task's life, oldest first</span><div class="gantt">${gantt}${S.items.length > 40 ? `<span class="meta" style="padding:6px 10px">and ${S.items.length - 40} more</span>` : ''}</div><div class="ax meta row" style="justify-content:space-between"><span>${LM.fmtShort(t0)}</span><span>${S.ext ? `${S.ext} dependencies reach outside the project` : 'self-contained'}</span><span>${LM.fmtShort(t1)}</span></div></div></div>`;
  const right = `<div class="col" style="gap:22px"><div class="ctx">${chip(av(lead), P.lead || 'Unassigned')}${chip('calendar', `Since ${LM.fmtShort(P.b)}`)}${S.cost ? chip('flame', LM.fmtMoney(S.cost)) : ''}${dec ? chip('signpost', dec.id, '', `data-dec="${dec.id}"`) : ''}${P.land ? chip('map-pin', LM.landInfo(ds, 'proj', P.land).name, '', `data-land="${P.land}"`) : ''}</div>
    <div class="col" style="gap:10px"><span class="lbl2">Tasks by state</span>${byState.map(([s, name]) => { const xs = S.items.filter((it) => { const st = LM.stateAt(ds, it, v.t); return st && (s === 'doing' ? st.s === 'doing' : st.s === s); }); if (!xs.length) return ''; return `<details ${s === 'blocked' || s === 'review' ? 'open' : ''}><summary class="row" style="gap:8px"><span class="st-${s} stw">${name}</span><em class="n">${xs.length}</em></summary><div class="col" style="gap:2px">${xs.slice(0, 12).map((it) => `<button class="row frow sm" data-open="${it.id}">${glyph(it.k, 'sm')}<span class="grow">${LM.esc(it.short)}</span>${it.children.length ? `<em>÷${it.children.length}</em>` : ''}</button>`).join('')}${xs.length > 12 ? `<span class="meta" style="padding:4px 10px">and ${xs.length - 12} more</span>` : ''}</div></details>`; }).join('')}</div>
    ${rel.length ? `<div class="col" style="gap:4px"><span class="lbl2">Shares tasks with</span>${rel.map(({ P: Q, n }) => `<button class="row frow" data-proj="${Q.id}">${gl2('kanban', 'gold', 'sm')}<span class="grow">${LM.esc(Q.short)}</span><em>${n} shared</em></button>`).join('')}</div>` : ''}
    ${acts([['map', 'Show on the map', 'mapProj', 'pri'], ['play', 'Play from its start', 'playProj'], ['git-branch', 'Divide', 'divide'], ['message-circle-question', 'Ask', 'ask']])}</div>`;
  return `${close}<div class="pvg"><div class="pvl">${left}</div><div class="pvr">${right}</div></div>`;
}
LM.openProject = (id) => { const P = LM.ds.byProject.get(id); if (P) { $('#list').hidden = true; select({ project: P }); } };
/** The projects list: without the map; sorted by what needs attention. */
LM.openProjects = function openProjects() {
  const L = $('#list'); const ds = LM.ds, v = LM.view;
  if (!L.hidden && L.dataset.kind === 'projects') { L.hidden = true; return; }
  const stats = ds.projects.map((P) => ({ P, S: LM.projectStats(ds, P, v.t) })).filter((x) => x.S.n).sort((a, b) => (b.S.asks.length * 3 + b.S.blocked * 2 + (b.S.open ? 1 : 0)) - (a.S.asks.length * 3 + a.S.blocked * 2 + (a.S.open ? 1 : 0)) || b.S.open - a.S.open);
  L.dataset.kind = 'projects';
  L.innerHTML = `<div class="lh"><span class="g f-gold">${I('kanban')}</span><span class="ttl t2 grow">Projects · ${stats.length}</span><input id="lfind" placeholder="Find a project"><button class="ic" id="lx">${I('x')}</button></div><div class="meta" style="padding:0 10px 8px">The level above a task: a project divides into tasks, a task into subtasks; a task can belong to several projects. Sorted by what needs attention.</div><div class="lb"></div>`;
  const body = L.querySelector('.lb');
  const render = (q = '') => { body.innerHTML = stats.filter((x) => !q || x.P.n.toLowerCase().includes(q.toLowerCase())).slice(0, 120).map(({ P, S }) => `<button class="prow" data-id="${P.id}"><span class="h-gold" style="display:inline-flex">${ringSvg(34, S.pct, { w: 4 })}</span><span class="pb"><span class="pn">${LM.esc(P.short)}${P.kind === 'decision' ? `<span class="meta"> · from ${P.dec}</span>` : ''}</span><span class="pm">${S.n} tasks · ${S.open} open${S.blocked ? ` · <em>${S.blocked} blocked</em>` : ''}${S.asks.length ? ` · <b style="color:var(--f-rules)">${S.asks.length} to decide</b>` : ''} · ${LM.fmtShort(P.b)}</span><span class="pmini">${S.items.slice(0, 60).map((it) => { const st = LM.stateAt(ds, it, v.t); return `<i class="s-${st ? st.s : 'todo'}"></i>`; }).join('')}</span></span>${I('chevron-right')}</button>`).join(''); for (const b of body.querySelectorAll('.prow')) b.onclick = () => LM.openProject(b.dataset.id); };
  render(); L.hidden = false; marks(L);
  $('#lfind').oninput = (e) => render(e.target.value);
  $('#lx').onclick = () => { L.hidden = true; };
};
/** Policies: behavioural decisions on how things operate (docs/18). */
LM.openPolicies = function openPolicies(focus) {
  const L = $('#list'); const ds = LM.ds;
  if (!L.hidden && L.dataset.kind === 'policies' && !focus) { L.hidden = true; return; }
  L.dataset.kind = 'policies';
  const SCOPE = { development: ['square-terminal', 'Development'], company: ['building-2', 'Company'], ai: ['bot', 'AI behaviour'], people: ['users-round', 'People'] };
  L.innerHTML = `<div class="lh"><span class="g f-rules">${I('scale')}</span><span class="ttl t2 grow">Policies · ${ds.policies.length} in force</span><button class="ic" id="lx">${I('x')}</button></div><div class="meta" style="padding:0 10px 8px">A policy is a decision about behaviour: an instruction for people and for the AI on how things operate. Not a task. It can be added or changed, and it reaches into the day to day: the AI reads the policies in force before it acts, and gates on the ones marked as gates.</div><div class="lb">${ds.policies.slice().sort((a, b) => b.since - a.since).map((p) => `<div class="prow pol${focus === p.id ? ' on' : ''}" id="pol-${p.id}">${gl2(SCOPE[p.scope][0], p.scope === 'ai' ? 'ai' : 'rules')}<span class="pb"><span class="pn">${LM.esc(p.n)}</span><span class="pm">${LM.esc(p.body)}</span><span class="pm row" style="gap:10px;flex-wrap:wrap">${chip(SCOPE[p.scope][0], SCOPE[p.scope][1], 'sm')}${chip(p.enforce === 'gate' ? 'shield-check' : p.enforce === 'check' ? 'search-check' : 'bell', p.enforce === 'gate' ? 'Gate: blocks until met' : p.enforce === 'check' ? 'Check: verified' : 'Reminder', 'sm')}${chip('users-round', p.applies.join(' and '), 'sm')}${chip('calendar', `Since ${LM.fmtShort(p.since)} · the ${p.by}`, 'sm')}${p.ref ? chip('file-text', p.ref, 'sm') : ''}</span></span></div>`).join('')}</div><div class="row" style="padding:10px 10px 4px;gap:8px">${pill('plus', 'Add a policy', 'pri sm', 'data-a="addpol"')}<span class="meta">In the product a new policy is a decision with a reach: the AI shows what it will change in the day to day before it is adopted.</span></div>`;
  L.hidden = false; marks(L);
  $('#lx').onclick = () => { L.hidden = true; };
  L.querySelector('[data-a=addpol]').onclick = () => act('Add a policy');
  if (focus) { const e = $('#pol-' + focus); if (e) e.scrollIntoView({ block: 'center' }); }
};

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
  if (kind === 'decision') { say(`<b>Tracing</b> ${LM.esc(x.n.replace(/\*\*/g, ''))} — ${x.lin.size} task${x.lin.size === 1 ? '' : 's'} followed. <button class="link" id="playhere">Play from here</button> · Esc clears`, 12000); setTimeout(() => { const b = $('#playhere'); if (b) b.onclick = () => { if (!LM.view.time) toggleTime(true); setTime(x.b - 1000); togglePlay(true); }; }, 0); }
  else say(`<b>Tracing</b> ${LM.esc(x.short)} — what it waits on and what waits on it. Esc clears`, 6000);
  LM.dirty(); writeUrl();
}
function clearTrace() { if (LM.view.trace) { LM.view.trace = null; LM.dirty(); writeUrl(); } }
function toggleList() {
  const L = $('#list'); if (!L.hidden && L.dataset.kind === 'decisions') { L.hidden = true; return; }
  const ds = LM.ds; L.dataset.kind = 'decisions';
  L.innerHTML = `<div class="lh"><span class="g f-rules">${I('signpost')}</span><span class="ttl t2 grow">Decisions · ${ds.decisions.length}</span><input id="lfind" placeholder="Find a decision"><button class="ic" id="lx">${I('x')}</button></div><div class="lb"></div>`;
  const body = L.querySelector('.lb');
  const render = (q = '') => { body.innerHTML = ds.decisions.filter((d) => !q || (d.n + ' ' + d.id).toLowerCase().includes(q.toLowerCase())).slice(-400).reverse().map((d) => `<button class="row frow" data-id="${d.id}">${glyph('decision', 'sm')}<span class="grow"><b style="color:var(--f-rules)">${d.id}</b> ${LM.esc(d.n.replace(/\*\*/g, '').slice(0, 70))}</span><em>${LM.fmtShort(d.b)}${d.lin.size ? ` · ${d.lin.size}` : ''}</em></button>`).join(''); for (const b of body.querySelectorAll('.frow')) b.onclick = () => { const d = ds.decisions.find((x) => x.id === b.dataset.id); L.hidden = true; setTrace('decision', d); const c = LM.worlds[LM.view.lens].claims.find((cc) => cc.dec === d); if (c) { const [x, y] = LM.hexXY(c.q, c.r); LM.flyTo(x, y, Math.max(LM.cam.k, 18)); } select({ mon: d, v: c }); }; };
  render(); L.hidden = false; marks(L);
  $('#lfind').oninput = (e) => render(e.target.value); $('#lfind').focus();
  $('#lx').onclick = () => { L.hidden = true; };
}

// ---- the grammar sheet: the map's elements with live samples ----
function thumb(draw, w = 96, h = 72) {
  const c = document.createElement('canvas'); const dpr = 2; c.width = w * dpr; c.height = h * dpr; c.style.width = w + 'px'; c.style.height = h + 'px';
  const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(ctx, w, h, LM.theme); return c;
}
function tileSample(ctx, cx, cy, k, status, T, opts = {}) {
  const prog = status === 'done' ? 1 : status === 'todo' ? 0.04 : status === 'blocked' ? 0.45 : status === 'review' ? 0.9 : 0.55;
  if (status === 'park') { LM.hexPath(ctx, cx, cy, k, 0.86); ctx.fillStyle = LM.rgba(T.lime, 0.14); ctx.fill(); ctx.strokeStyle = LM.rgba(T.lime, 0.3); ctx.stroke(); LM.icon(ctx, 'trees', cx, cy, k * 0.5, LM.rgba(T.lime, 0.7), 1.8); return; }
  const col = opts.slab || T.state[status] || T.state.doing;
  const saved = LM.YS; LM.YS = 0.55;
  LM.prism(ctx, cx, cy, k, 0.86, k * 0.42, opts.slab ? 0.6 : prog, col, T, status === 'todo' && !opts.slab ? T.ink(0.4) : LM.rgba(col, 0.75), status === 'todo' && !opts.slab ? [3, 3] : null);
  LM.YS = saved;
  if (opts.icon) LM.pillIcon(ctx, cx, cy - k * 0.42 - k * 0.55, Math.max(6, k * 0.2), opts.icon[0], T.hues[opts.icon[1]], T);
}
LM.openSheet = function openSheet() {
  const S = $('#sheet'); if (!S.hidden) { S.hidden = true; return; }
  const T = LM.theme;
  const item = (label, meta, draw) => { const d = document.createElement('div'); d.className = 'li'; d.innerHTML = `<span class="th"></span><b>${label}</b><span class="meta">${meta}</span>`; d.querySelector('.th').appendChild(thumb(draw)); return d; };
  const grid = (cls = '') => { const g = document.createElement('div'); g.className = 'lgrid ' + cls; return g; };
  S.innerHTML = `<button class="ic x" id="shx">${I('x')}</button><div class="pvh">${gl2('book-open', 'ai', 'lg')}<div><span class="lbl2">The grammar of the map</span><span class="ttl t4">How to read it</span><span class="mut" style="display:block;margin-top:6px">One channel, one meaning: <b>colour</b> is state, the <b>fill</b> is progress (or the laid layer's value in its colour), the <b>glyph</b> is the kind, the <b>one number</b> says it; <b>problems</b> are icons. Every place carries its summary on its territory: a stacked bar of its tasks by state, the counts, what needs attention. Hover reads a tile in full; click opens its management view.</span></div></div>`;
  const sec = (title, sub) => { const h = document.createElement('div'); h.innerHTML = `<span class="lbl2">${title}</span>${sub ? `<span class="meta">${sub}</span>` : ''}`; S.appendChild(h); };
  sec('A tile is a task', 'A hexagonal prism whose fill is its progress: planned is empty and dashed; blocked is coral; done is full.');
  const g1 = grid();
  for (const [st, name, meta] of [['todo', 'Planned', 'empty, dashed'], ['doing', 'In progress', 'filling with its share'], ['review', 'In review', 'teal, almost full'], ['blocked', 'Blocked', 'coral, frozen'], ['done', 'Done', 'green, full'], ['park', 'Set aside', 'a park on its plot']]) g1.appendChild(item(name, meta, (ctx, w, h, T) => tileSample(ctx, w / 2, h * 0.72, 28, st, T)));
  S.appendChild(g1);
  sec('Problems are icons', 'Data is colour and fill; a problem is an icon on the tile, a chip on the place; each chip leads to what it counts.');
  const g2 = grid();
  for (const [kind, name, meta] of [['ask', 'Needs a decision', 'a question waits for someone'], ['blocked', 'Blocked', 'a barrier'], ['stale', 'Nothing moved', 'still for too long'], ['review', 'Waiting in review', 'done, not yet approved']]) g2.appendChild(item(name, meta, (ctx, w, h, T) => tileSample(ctx, w / 2, h * 0.8, 24, kind === 'blocked' ? 'blocked' : kind === 'review' ? 'review' : 'doing', T, { icon: LM.PROBLEM[kind] })));
  S.appendChild(g2);
  sec('A layer fills every tile with its value', 'One layer at a time; the tile fills with the layer\'s value in the layer\'s colour; the key beside it says what the colour means, and which places lead.');
  const g3 = grid('ov');
  for (const [k, name] of LAYERS) { if (k === 'deps' || (k === 'revenue' && !LM.ds.revenue.length)) continue; const d = document.createElement('div'); d.className = 'li' + (LM.view.overlays.has(k) ? ' on' : ''); d.innerHTML = `<span class="th"></span><b>${I(LAYERS.find((x) => x[0] === k)[2])} ${name}</b><span class="meta">${LM.OV_INFO[k][1]}</span>`; d.querySelector('.th').appendChild(thumb((ctx, w, h, T) => tileSample(ctx, w / 2, h * 0.82, 26, 'doing', T, { grey: true, slab: LM.layerColor(k, T), plain: true }))); d.onclick = () => { toggleOverlay(k); S.hidden = true; }; g3.appendChild(d); }
  S.appendChild(g3);
  sec('Marks', '');
  const g4 = grid('sm');
  const markItem = (icon, hue, name, meta) => { const d = document.createElement('div'); d.className = 'li'; d.innerHTML = `<span class="th">${gl2(icon, hue, 'lg')}</span><b>${name}</b><span class="meta">${meta}</span>`; return d; };
  for (const [ic, hue, n, m] of [['flag', 'rules', 'A flag', 'an open ask, or the owner\'s recent decision'], ['signpost', 'rules', 'A plaque', 'decisions decided here, with a count'], ['milestone', 'gold', 'A landmark', 'a milestone met; it stays'], ['route', 'acc', 'A road', 'a dependency; dashed waits, flowing feeds'], ['git-branch', 'slate', 'Divided', 'a task with subtasks'], ['kanban', 'gold', 'A project', 'the level above a task'], ['moon', 'slate', 'Quiet', 'old and done: dimmed in the Now view'], ['history', 'heat', 'Since', 'changed since you last looked: badges and heat']]) g4.appendChild(markItem(ic, hue, n, m));
  S.appendChild(g4);
  sec('Depth', 'Sky: colour only, lands with their problems counted. Land: colour and glyph. District: glyph, title, value. Street: everything, the facade on the front face.');
  S.hidden = false; marks(S);
  $('#shx').onclick = () => { S.hidden = true; };
};

// ---- the command bar: a small parser standing in for the composer ----
LM.command = function command(text) {
  const q = text.trim().toLowerCase(); if (!q) return;
  const ds = LM.ds, said = [];
  const has = (re) => re.test(q);
  if (has(/\b(lucid chat|real)\b/) && ds.key !== 'lucid') { LM.setDataset('lucid'); said.push('Lucid Chat, the real log'); }
  if (has(/\b(example|generated)\b/) && ds.key !== 'example') { LM.setDataset('example'); said.push('the example company'); }
  if (has(/\b(department|departments|team|teams|function)\b/)) { setLens('dept'); said.push('seen by department'); }
  if (has(/\b(by project|projects lens|phase|phases|initiative)\b/)) { setLens('proj'); said.push('seen by project'); }
  if (has(/\b(product|products|line|lines of business)\b/)) { setLens('prod'); said.push('seen by product'); }
  if (has(/\b(people|owner|owners|who owns|person|crew)\b/) && !has(/layer/)) { setLens('people'); said.push('seen by person'); }
  if (has(/\b(clear|plain|no overlay|no layers?|nothing)\b/)) { LM.view.overlays.clear(); said.push('layers cleared'); }
  const O = [[/cost|burn|spend/, 'cost'], [/revenue|earn|money made|yield/, 'revenue'], [/progress|how far|done share/, 'progress'], [/problem|issue|hurt|attention/, 'problems'], [/dependenc|roads?|links?|waits? on/, 'deps'], [/\bai\b|agents?|people layer|who holds/, 'people'], [/recen|fresh|alive|moved today|still/, 'recency'], [/growth|grew|grow|claimed|shift/, 'growth']];
  for (const [re, k] of O) if (re.test(q)) { toggleOverlay(k, !has(/\b(off|hide|remove)\b/)); said.push(`${LM.OV_INFO[k][0]}: ${LM.OV_INFO[k][1].toLowerCase()}`); }
  if (has(/\bstuck\b|blocked/) && !has(/layer/)) { LM.panelState.filter = 'blocked'; LM.togglePanel(true); const score = (D) => D.blocked * 3 + D.stale; const D = [...LM.visible(LM.worlds[LM.view.lens], LM.view.t).districts.values()].sort((a, b) => score(b) - score(a))[0]; if (D && score(D)) { flyToDistrict(D.key); said.push(`the most stuck place is ${LM.shortName(LM.distName(ds, LM.view.lens, D.key))}: ${D.blocked ? `${D.blocked} blocked` : ''}${D.blocked && D.stale ? ', ' : ''}${D.stale ? `${D.stale} still for a while` : ''}; the panel lists them`); } else said.push('nothing is stuck right now'); }
  if (has(/\b(decide|decisions? (needed|pending|open)|needs? (me|you|a decision)|what needs me|open questions?)\b/)) { LM.panelState.filter = 'ask'; LM.panelState.scope = 'all'; LM.togglePanel(true); said.push(`${LM.openAsks(ds, LM.view.t).length} open asks in the panel`); }
  if (has(/\bprojects?\b/) && !has(/by project|lens/)) { const key = (/\b(?:open|show)\s+(?:the\s+)?project\s+(.+)$/.exec(q) || [])[1]; if (key) { const P = ds.projects.find((p) => p.n.toLowerCase().includes(key.trim())); if (P) { LM.openProject(P.id); said.push(`the project ${LM.esc(P.short)}`); } else said.push(`no project matches "${LM.esc(key)}"`); } else { LM.openProjects(); said.push('the projects'); } }
  if (has(/\bpolic(y|ies)\b|rules? of (the )?(house|company)|how we work/)) { LM.openPolicies(); said.push('the policies in force'); }
  const sm = /\b(since|changed|what changed|what happened|last (week|month|year|day)|yesterday|new since)\b/.exec(q);
  if (sm) { const D = LM.DAY; const t = has(/yesterday|last day/) ? LM.view.t - D : has(/last week|week/) ? LM.view.t - 7 * D : has(/last month|month/) ? LM.view.t - 30 * D : has(/last year|year/) ? LM.view.t - 365 * D : has(/reviewed|last looked|last time/) && LM.reviewed ? LM.reviewed : LM.view.t - ds.win.review; if (has(/\boff\b/)) { setSince(null); said.push('since layer off'); } else { setSince(t); LM.togglePanel(true); said.push(`what changed since ${LM.fmtShort(t)}: badges on the map, the rest dimmed, the panel counts new and done`); } }
  if (has(/\bpanel\b|feed|what is happening|what's happening|what needs attention/)) { LM.togglePanel(!has(/\b(off|hide|close)\b/)); said.push(LM.view.panel ? 'the panel' : 'panel hidden'); }
  if (has(/\blegend\b|\bkey\b|grammar|how to read|what do .* mean/)) { LM.openSheet(); said.push('the grammar of the map'); }
  const th = /\b(deep|aqua|sky|dark|light)\b/.exec(q); if (th && has(/theme|glass|dusk|mode|switch/)) { const m = { deep: 'deep', dark: 'deep', aqua: 'aqua', sky: 'sky', light: 'sky' }[th[1]]; document.documentElement.dataset.pt = m; LM.readTheme(); LM.dirty(); said.push(`${THEMES.find((t) => t[0] === m)[1]}`); }
  if (has(/high contrast/)) { document.documentElement.dataset.hc = has(/\boff\b/) ? 'std' : 'high'; LM.view.hc = !has(/\boff\b/); LM.readTheme(); LM.dirty(); said.push(LM.view.hc ? 'high contrast' : 'standard contrast'); }
  if (has(/\btimeline\b|\btime\b(?! ago)/) && !sm) { toggleTime(!has(/\b(off|hide|close)\b/)); said.push(LM.view.time ? 'the timeline' : 'timeline closed'); }
  if (has(/\b(pause|stop|hold)\b/)) { togglePlay(false); said.push('paused'); }
  if (has(/\bfaster\b/)) { const S = SPEEDS[ds.key]; const i = S.findIndex((s) => s[0] === LM.view.speed); LM.view.speed = S[Math.min(S.length - 1, i + 1)][0]; said.push('faster'); }
  if (has(/\bslower\b/)) { const S = SPEEDS[ds.key]; const i = S.findIndex((s) => s[0] === LM.view.speed); LM.view.speed = S[Math.max(0, i - 1)][0]; said.push('slower'); }
  if (has(/\b(start|beginning|first day)\b/)) { if (!LM.view.time) toggleTime(true); setTime(ds.span[0]); LM.cam = LM.fitAt(ds.span[0]); LM.autoFit = true; said.push('at the beginning; the camera follows the city as it grows'); }
  if (has(/\b(now|today|present)\b/) && !sm) { setTime(ds.now); said.push('now'); }
  if (has(/\bend\b/)) { if (!LM.view.time) toggleTime(true); setTime(ds.span[1]); said.push('at the end'); }
  const dm = /(\d{4}-\d{2}-\d{2})|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:,?\s*(\d{4}))?/.exec(q);
  if (dm && !sm) { const t = dm[1] ? Date.parse(dm[1] + 'T12:00:00') : Date.parse(`${dm[2]} ${dm[3]} ${dm[4] || new Date(ds.now).getFullYear()} 12:00`); if (!isNaN(t)) { if (!LM.view.time) toggleTime(true); setTime(t); said.push(LM.fmtDate(t)); } }
  if (has(/\b(play|run|animate)\b/) && !has(/from here/)) { togglePlay(true); said.push('playing'); }
  if (has(/\bzoom in\b|\bcloser\b|\bdive\b/)) { zoomStep(1); said.push('one level in'); } if (has(/\bzoom out\b|\bfarther\b|\bback out\b/)) { zoomStep(-1); said.push('one level out'); }
  if (has(/\bland level\b|\barea level\b|\btask level\b/)) { goLevel(has(/\bland level\b/) ? 0 : has(/\barea level\b/) ? 1 : 2); said.push('the level'); }
  if (has(/\bisometric\b|\b3d\b|\btilt\b/)) { LM.view.iso = !has(/\boff\b|\bflat\b/); said.push(LM.view.iso ? 'the task level tilts in' : 'flat'); } else if (has(/\bflat\b/)) { LM.view.iso = false; said.push('flat'); }
  const tm = /\b(trace|cause|caused|effects? of)\b\s*(.*)$/.exec(q);
  if (tm) { const key = (tm[2] || '').replace(/^(of|the)\s+/, '').trim(); const d = ds.decisions.find((x) => x.id.toLowerCase() === key) || ds.decisions.filter((x) => key && x.n.toLowerCase().includes(key)).sort((a, b) => b.lin.size - a.lin.size)[0]; if (d) { setTrace('decision', d); const c = LM.worlds[LM.view.lens].claims.find((cc) => cc.dec === d); if (c) { const [x, y] = LM.hexXY(c.q, c.r); LM.flyTo(x, y, Math.max(LM.cam.k, 16)); } said.push(`tracing ${LM.esc(d.n.replace(/\*\*/g, ''))}`); } else if (key) said.push(`no decision matches "${LM.esc(key)}"`); }
  const om = /\b(open|show|go to|fly to|find|zoom (?:in )?(?:to|on))\b\s+(.*)$/.exec(q);
  if (om && !tm && !sm && !has(/\bproject\b/)) {
    const key = om[2].replace(/^(the|me)\s+/, '').replace(/\s+(on|by|in)\s+.*$/, '').trim();
    const vis = LM.visible(LM.worlds[LM.view.lens], LM.view.t);
    const land = [...vis.lands.values()].find((L) => LM.landInfo(ds, LM.view.lens, L.key).name.toLowerCase().includes(key));
    const dist = !land && [...vis.districts.values()].find((D) => LM.distName(ds, LM.view.lens, D.key).toLowerCase().includes(key));
    const item = !land && !dist && vis.items.find((x) => x.it && x.it.n.toLowerCase().includes(key));
    if (land) { flyToLand(land.key); said.push(`flying to ${LM.esc(LM.landInfo(ds, LM.view.lens, land.key).name)}`); }
    else if (dist) { flyToDistrict(dist.key); said.push(`flying to ${LM.esc(LM.shortName(LM.distName(ds, LM.view.lens, dist.key)))}`); }
    else if (item) { flyToDistrict(item.d); select(item.it); said.push(`opening ${LM.esc(item.it.short)}`); }
    else if (key && !said.length) said.push(`nothing here is called "${LM.esc(key)}"`);
  }
  if (has(/\b(sky|whole|everything|zoom all|company)\b/) && !om && !has(/zoom (in|out)/)) { select(null); LM.flyTo(null, null, 3.6); said.push('the whole world'); }
  if (!said.length) said.push('I can change the lens (departments, projects, products, people), lay a layer (progress, problems, dependencies, cost, revenue, people, recency, growth), show what needs a decision or what is stuck, open the projects or the policies, show what changed since a date, open the timeline and move in it (play, pause, a date, now, start), trace a decision, zoom, or open a place.');
  syncChrome();
  say(said.join(' · '));
};

// ---- URL state ----
function applyParams(p) {
  const v = LM.view;
  if (p.get('lens') && LM.worlds[p.get('lens')]) v.lens = p.get('lens');
  if (p.get('o')) for (const o of p.get('o').split(',')) if (LAYERS.some((x) => x[0] === o)) v.overlays.add(o);
  if (p.get('pt')) document.documentElement.dataset.pt = p.get('pt');
  if (p.get('hc')) { document.documentElement.dataset.hc = 'high'; v.hc = true; }
  if (p.get('reduce')) v.reduce = true;
  if (p.get('panel') === '0') v.panel = false; if (p.get('panel') === '1') v.panel = true;
  if (p.get('time') === '1' || (p.get('t') && v.mode === 'then')) v.time = true;
  if (p.get('quiet') === '0') v.quiet = false;
  if (p.get('iso') === '0') v.iso = false; if (p.get('iso') === '1') v.iso = true;
  if (['off', 'thumb', 'full'].includes(p.get('pic'))) v.pic = p.get('pic');
  if (p.get('filter')) LM.panelState.filter = p.get('filter');
  if (p.get('scope')) LM.panelState.scope = p.get('scope');
  LM.readTheme();
  if (p.get('k')) LM.cam = { x: Number(p.get('x') || 0), y: Number(p.get('y') || 0), k: Number(p.get('k')) }; else LM.fitWorld();
  if (p.get('since')) { const t = Date.parse(p.get('since')); if (!isNaN(t)) { v.sinceOn = true; v.since = t; } }
  if (p.get('proj') && LM.ds.byProject.has(p.get('proj'))) v.proj = p.get('proj');
  resize();
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
    if (!v.panel) p.set('panel', '0'); if (v.time) p.set('time', '1'); if (v.proj) p.set('proj', v.proj); if (!v.quiet) p.set('quiet', '0'); if (!v.iso) p.set('iso', '0'); if (v.pic && v.pic !== 'thumb') p.set('pic', v.pic);
    if (LM.panelState.filter !== 'all') p.set('filter', LM.panelState.filter); if (LM.panelState.scope !== 'here') p.set('scope', LM.panelState.scope);
    if (document.documentElement.dataset.pt !== 'deep') p.set('pt', document.documentElement.dataset.pt); if (v.hc) p.set('hc', '1');
    history.replaceState(null, '', '?' + p.toString());
  }, 300);
}

window.addEventListener('DOMContentLoaded', LM.boot);
