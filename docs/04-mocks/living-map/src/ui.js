/* The living map: chrome and interaction. The person clicks, types or speaks; the AI (here: a small command
 * parser standing in for the composer) sets lens, overlays, camera, time, trace and cutaway. */
const $ = (s, el = document) => el.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const I = {
  play: '<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>',
  speed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12a8 8 0 0 1 16 0"/><path d="M12 12l4-4"/></svg>',
  step: '<svg viewBox="0 0 24 24"><path d="M6 4v16l9-8z"/><rect x="16" y="4" width="2" height="16"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M18 4v16l-9-8z"/><rect x="6" y="4" width="2" height="16"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.5a5 5 0 0 1 6 4.5"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 21V4h11l-2 4 2 4H5"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
  dot: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
  contrast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v18A9 9 0 0 0 12 3z" fill="currentColor"/></svg>',
  motion: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12c3-6 6 6 9 0s6 6 9 0"/></svg>',
  gavel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4l6 6-3 3-6-6zM3 21l9-9M10 7l7 7"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  trace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8 7.5l7.5 9M8.5 6h7"/></svg>',
  nudge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h12M12 6l6 6-6 6"/></svg>',
  assign: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="8" r="3.5"/><path d="M3 20a7 7 0 0 1 14 0M18 8v6M15 11h6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l5 5L20 7"/></svg>',
  open: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>',
  ask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  fly: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
};
const LENSES = [['dept', 'Departments', I.users], ['proj', 'Projects', I.flag], ['prod', 'Products', I.box], ['people', 'People', I.dot]];
const OVERLAYS = [
  ['progress', 'Progress', 'light rises to the done share'], ['cost', 'Cost', 'warm ground where money burns'], ['revenue', 'Revenue', 'golden ground where money is made'],
  ['issues', 'Issues', 'weather over what hurts'], ['pipes', 'Pipes', 'flow between buildings; a clog where it is stuck'], ['power', 'Power', 'decision lines; dark where a decision is awaited'],
  ['load', 'Load', 'warm windows where people are stretched'], ['fresh', 'Fresh', 'lit where something moved; hazed where nothing has'], ['ai', 'AI', 'teal where agents did the work'], ['terrain', 'Terrain', 'height is work remaining'],
];
const SPEEDS = { lucid: [[1 / 8, '3 h / s'], [1 / 4, '6 h / s'], [1 / 2, '12 h / s'], [1, '1 day / s']], example: [[7, '1 wk / s'], [14, '2 wk / s'], [30, '1 mo / s'], [90, '3 mo / s']] };

LM.boot = function boot() {
  LM.readTheme();
  const root = $('#app');
  root.innerHTML = `
    <canvas id="map"></canvas>
    <div class="top">
      <div class="crumbs glass" id="crumbs"></div>
      <div class="lenses glass" id="lenses"></div>
      <div class="tools glass" id="tools"></div>
    </div>
    <div class="chips glass" id="overlays"></div>
    <div class="ledger" id="ledger"></div>
    <div class="legend glass" id="legend"></div>
    <div class="talk glass"><span class="ico ai">${I.spark}</span><input id="talk" placeholder="Ask, or tell Lucid what to show" autocomplete="off"><span class="ico">${I.mic}</span></div>
    <div class="rail glass" id="rail"><button class="ic" id="back" title="Previous beat">${I.back}</button><button class="ic" id="play" title="Play">${I.play}</button><button class="ic" id="step" title="Next beat">${I.step}</button><button class="pill" id="speed" title="Speed">${I.speed}<span></span></button><div class="date" id="date"></div><canvas id="railc"></canvas><button class="pill" id="decs" title="Decisions">${I.gavel}<span>Decisions</span></button></div>
    <div class="cut glass" id="cut" hidden></div>
    <div class="list glass" id="list" hidden></div>
    <div class="toast" id="toast"></div>`;
  LM.canvas = $('#map'); LM.ctx = LM.canvas.getContext('2d');
  LM.railc = $('#railc'); LM.railctx = LM.railc.getContext('2d');
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
  LM.view.trace = null; LM.view.sel = null; LM.ledgerT = LM.view.t;
  if (!params || !params.get('k')) LM.fitWorld();
  LM.dirty();
};

LM.fitWorld = function fitWorld() {
  const w = LM.worlds[LM.view.lens];
  const e = w.extent;
  const cx = (e.minx + e.maxx) / 2, cy = (e.miny + e.maxy) / 2;
  const W = LM.W || window.innerWidth, H = LM.H || window.innerHeight;
  const k = Math.min((W - 60) / Math.max(10, e.maxx - e.minx + 8), (H - 220) / Math.max(10, (e.maxy - e.miny + 8) * 0.92));
  LM.cam = { x: cx, y: cy + 8 / k, k: Math.max(1.5, Math.min(9, k)) };
};

function resize() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  LM.W = window.innerWidth; LM.H = window.innerHeight;
  LM.canvas.width = LM.W * dpr; LM.canvas.height = LM.H * dpr; LM.canvas.style.width = LM.W + 'px'; LM.canvas.style.height = LM.H + 'px';
  LM.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const r = LM.railc.getBoundingClientRect();
  LM.railc.width = Math.max(10, r.width) * dpr; LM.railc.height = Math.max(10, r.height) * dpr;
  LM.railctx.setTransform(dpr, 0, 0, dpr, 0, 0); LM.railW = r.width; LM.railH = r.height;
  LM.dirty();
}
LM.dirty = () => { LM.needsFrame = true; };

function loop(now) {
  const v = LM.view;
  if (v.playing) {
    const dt = Math.min(100, now - (LM.playLast || now)); LM.playLast = now;
    const nt = v.t + (dt / 1000) * v.speed * LM.DAY;
    setTime(Math.min(LM.ds.span[1], nt), true);
    if (nt >= LM.ds.span[1]) togglePlay(false);
  } else LM.playLast = now;
  if (LM.flight) {
    const F = LM.flight, f = Math.min(1, (now - F.t0) / F.ms), e = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
    LM.cam.x = F.x0 + (F.x1 - F.x0) * e; LM.cam.y = F.y0 + (F.y1 - F.y0) * e; LM.cam.k = Math.exp(Math.log(F.k0) + (Math.log(F.k1) - Math.log(F.k0)) * e);
    if (f >= 1) LM.flight = null;
    LM.needsFrame = true;
  }
  const live = v.overlays.has('pipes') || v.overlays.has('issues') || LM.lod >= 2;
  if (LM.needsFrame || (live && !v.reduce)) { LM.needsFrame = false; LM.draw(now); drawRail(); updateCrumbs(); }
  if (LM.toastUntil && now > LM.toastUntil) { $('#toast').classList.remove('on'); LM.toastUntil = 0; }
  requestAnimationFrame(loop);
}

// ---- chrome ----
function buildChrome() {
  const lenses = $('#lenses'); lenses.innerHTML = '';
  for (const [k, name, ico] of LENSES) { const b = el('button', 'seg', `<span class="ico">${ico}</span><span>${name}</span>`); b.dataset.lens = k; b.onclick = () => setLens(k); lenses.appendChild(b); }
  const ov = $('#overlays'); ov.innerHTML = '';
  for (const [k, name] of OVERLAYS) { const b = el('button', 'chip', `<span class="sw ${k}"></span><span>${name}</span>`); b.dataset.o = k; b.onclick = () => toggleOverlay(k); ov.appendChild(b); }
  const tools = $('#tools'); tools.innerHTML = '';
  const dsb = el('div', 'dsw');
  for (const [k, name, sub] of [['lucid', 'Lucid Chat', 'real'], ['example', 'Example company', 'generated']]) { const b = el('button', 'seg', `<span>${name}</span><small>${sub}</small>`); b.dataset.ds = k; b.onclick = () => { LM.setDataset(k); setTime(LM.ds.now); say(`${name}: ${LM.ds.sub}`); syncChrome(); }; dsb.appendChild(b); }
  tools.appendChild(dsb);
  const th = el('button', 'ic', I.sun); th.title = 'Theme'; th.onclick = () => { const o = ['deep', 'aqua', 'sky']; const r = document.documentElement; r.dataset.pt = o[(o.indexOf(r.dataset.pt) + 1) % 3]; LM.readTheme(); LM.dirty(); writeUrl(); }; tools.appendChild(th);
  const hc = el('button', 'ic', I.contrast); hc.title = 'High contrast'; hc.onclick = () => { const r = document.documentElement; r.dataset.hc = r.dataset.hc === 'high' ? 'std' : 'high'; LM.view.hc = r.dataset.hc === 'high'; LM.readTheme(); LM.dirty(); writeUrl(); }; tools.appendChild(hc);
  const mo = el('button', 'ic', I.motion); mo.title = 'Reduce motion'; mo.onclick = () => { LM.view.reduce = !LM.view.reduce; mo.classList.toggle('on', LM.view.reduce); LM.dirty(); }; tools.appendChild(mo);
  $('#play').onclick = () => togglePlay();
  $('#step').onclick = () => stepBeat(1);
  $('#back').onclick = () => stepBeat(-1);
  $('#speed').onclick = () => { const S = SPEEDS[LM.ds.key]; const i = S.findIndex((s) => s[0] === LM.view.speed); LM.view.speed = S[(i + 1) % S.length][0]; syncChrome(); };
  $('#decs').onclick = () => toggleList();
  const talk = $('#talk');
  talk.addEventListener('keydown', (e) => { if (e.key === 'Enter') { LM.command(talk.value); talk.value = ''; } if (e.key === 'Escape') talk.blur(); });
  document.addEventListener('keydown', (e) => {
    if (e.target === talk) return;
    if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    else if (e.key === 'ArrowRight') stepBeat(1); else if (e.key === 'ArrowLeft') stepBeat(-1);
    else if (e.key === 'Escape') { clearTrace(); select(null); $('#list').hidden = true; }
    else if (e.key >= '1' && e.key <= '4') setLens(LENSES[Number(e.key) - 1][0]);
    else if (e.key === '/') { e.preventDefault(); talk.focus(); }
  });
  syncChrome();
}
function syncChrome() {
  for (const b of document.querySelectorAll('#lenses .seg')) b.classList.toggle('on', b.dataset.lens === LM.view.lens);
  for (const b of document.querySelectorAll('#overlays .chip')) b.classList.toggle('on', LM.view.overlays.has(b.dataset.o));
  for (const b of document.querySelectorAll('.dsw .seg')) b.classList.toggle('on', b.dataset.ds === LM.ds.key);
  $('#overlays').querySelector('[data-o=revenue]').hidden = !LM.ds.revenue.length;
  const S = SPEEDS[LM.ds.key].find((s) => s[0] === LM.view.speed) || SPEEDS[LM.ds.key][1];
  $('#speed span').textContent = S[1];
  $('#play').innerHTML = LM.view.playing ? I.pause : I.play;
  $('#play').title = LM.view.playing ? 'Pause' : 'Play';
  const lines = [];
  lines.push('height · work remaining', 'light · progress');
  for (const o of LM.view.overlays) lines.push(`${OVERLAYS.find((x) => x[0] === o)[1].toLowerCase()} · ${OVERLAYS.find((x) => x[0] === o)[2]}`);
  $('#legend').innerHTML = lines.map((l) => `<span>${l}</span>`).join('');
  $('#date').textContent = LM.fmtDate(LM.view.t, LM.ds.key === 'lucid');
  writeUrl();
}
function updateCrumbs() {
  const v = LM.view, ds = LM.ds;
  const [wx, wy] = [LM.cam.x, LM.cam.y];
  const [q, r] = LM.xyHex(wx, wy);
  let land = null, dist = null;
  if (LM.vis) {
    for (const D of LM.vis.districts.values()) if (D.cells.has(q + ',' + r)) { dist = D; break; }
    if (!dist) { let best = null, bd = Infinity; for (const L of LM.vis.lands.values()) { const d = Math.hypot(L.cx - wx, L.cy - wy); if (d < bd) { bd = d; best = L; } } if (best && bd < Math.sqrt(best.n) * 2.5 && LM.lod >= 1) land = best; }
    else land = LM.vis.lands.get(dist.land);
  }
  const parts = [`<button class="crumb" data-up="0"><span class="ico">${I.map}</span>${ds.name}</button>`];
  if (land && LM.lod >= 1) parts.push(`<button class="crumb" data-land="${land.key}">${LM.landInfo(ds, v.lens, land.key).name}</button>`);
  if (dist && LM.lod >= 2) parts.push(`<button class="crumb" data-dist="${dist.key}">${LM.distName(ds, v.lens, dist.key).slice(0, 26)}</button>`);
  if (v.sel && v.sel.id && LM.lod >= 3) parts.push(`<span class="crumb">${v.sel.n.slice(0, 28)}</span>`);
  const html = parts.join('<i>›</i>');
  const c = $('#crumbs');
  if (c.innerHTML !== html) {
    c.innerHTML = html;
    c.querySelector('[data-up]').onclick = () => { select(null); LM.flyTo(null, null, 3.2); };
    for (const b of c.querySelectorAll('[data-land]')) b.onclick = () => flyToLand(b.dataset.land);
    for (const b of c.querySelectorAll('[data-dist]')) b.onclick = () => flyToDistrict(b.dataset.dist);
  }
}

function setLens(k) {
  if (k === LM.view.lens || !LM.worlds[k]) return;
  LM.lensAnim = LM.view.reduce ? null : { from: LM.view.lens, to: k, t0: performance.now() };
  LM.view.lens = k;
  if (LM.view.trace) LM.view.trace = buildTrace(LM.view.trace.kind, LM.view.trace.dec || LM.view.trace.it);
  syncChrome(); LM.dirty();
}
function toggleOverlay(k, on) {
  const O = LM.view.overlays;
  const want = on === undefined ? !O.has(k) : on;
  const channel = { progress: 'ground', cost: 'ground', revenue: 'ground', terrain: 'relief', issues: 'air', pipes: 'lines', power: 'lines', load: 'light', fresh: 'light', ai: 'light' };
  if (want) { for (const o of Array.from(O)) if (channel[o] === channel[k] && o !== k) O.delete(o); O.add(k); } else O.delete(k);
  syncChrome(); LM.dirty();
}
function togglePlay(on) {
  const v = LM.view;
  v.playing = on === undefined ? !v.playing : on;
  if (v.playing && v.t >= LM.ds.span[1] - 1) v.t = LM.ds.span[0];
  LM.ledgerT = v.t; LM.playLast = 0;
  syncChrome(); LM.dirty();
}
function setTime(t, fromPlay) {
  const v = LM.view, ds = LM.ds;
  const prev = v.t;
  v.t = Math.max(ds.span[0], Math.min(ds.span[1], t));
  if (fromPlay) ledger(prev, v.t); else { LM.ledgerT = v.t; }
  $('#date').textContent = LM.fmtDate(v.t, ds.key === 'lucid');
  if (v.sel) renderCut();
  LM.dirty();
}
function stepBeat(dir) {
  const ds = LM.ds, t = LM.view.t;
  const ticks = [...ds.decisions.map((d) => d.b), ...ds.milestones.map((m) => m.t), ds.now, ds.span[0], ds.span[1]].sort((a, b) => a - b);
  const next = dir > 0 ? ticks.find((x) => x > t + 1000) : ticks.slice().reverse().find((x) => x < t - 1000);
  if (next !== undefined) { setTime(next); const d = ds.decisions.find((d) => d.b === next); if (d) say(`${LM.fmtDate(next)} · Decided: ${d.n}`); }
}

// ---- the ledger: what happened in this beat ----
function ledger(t0, t1) {
  const ds = LM.ds, v = LM.view;
  const lines = [];
  const counts = new Map();
  for (const e of ds.events) {
    if (e.t <= t0 || e.t > t1) continue;
    if (e.kind === 'decision') lines.push(`<b>Decided</b> ${e.d.n}`);
    else if (e.kind === 'milestone') lines.push(`<b>Landmark</b> ${e.m.n}`);
    else if (e.it) {
      const g = LM.groupAt(e.it, v.lens, e.t).g;
      const c = counts.get(g) || { birth: 0, done: 0, blocked: 0, doing: 0 };
      if (e.kind === 'birth') c.birth++; else if (e.kind === 'done') c.done++; else if (e.kind === 'blocked') c.blocked++; else if (e.kind === 'doing') c.doing++;
      counts.set(g, c);
    }
  }
  const summary = [...counts.entries()].sort((a, b) => (b[1].birth + b[1].done + b[1].blocked) - (a[1].birth + a[1].done + a[1].blocked)).slice(0, 3)
    .map(([g, c]) => { const p = []; if (c.birth) p.push(`${c.birth} new`); if (c.doing) p.push(`${c.doing} rising`); if (c.done) p.push(`${c.done} lit`); if (c.blocked) p.push(`<em>${c.blocked} blocked</em>`); return `<b>${LM.landInfo(ds, v.lens, g).name}</b> ${p.join(', ')}`; });
  const all = [...lines.slice(0, 2), ...summary].slice(0, 3);
  const L = $('#ledger');
  if (all.length) { L.innerHTML = all.map((l) => `<div>${l}</div>`).join(''); L.classList.add('on'); LM.ledgerUntil = performance.now() + 2200; }
  else if (LM.ledgerUntil && performance.now() > LM.ledgerUntil) L.classList.remove('on');
}
function say(msg, ms = 6000) { const t = $('#toast'); t.innerHTML = msg; t.classList.add('on'); LM.toastUntil = performance.now() + ms; }

// ---- the rail ----
function drawRail() {
  const ctx = LM.railctx, W = LM.railW, H = LM.railH, ds = LM.ds, T = LM.theme, v = LM.view;
  if (!W) return;
  ctx.clearRect(0, 0, W, H);
  const [t0, t1] = ds.span, x = (t) => ((t - t0) / (t1 - t0)) * W;
  // phase bands from the projects lens (lands with from/to), faint
  const bands = Object.entries(ds.lenses.proj.lands).filter(([, l]) => typeof l.from === 'number');
  for (const [k, l] of bands) { const a = x(l.from), b = x(l.to || t1); ctx.fillStyle = LM.rgba(T.hues[l.hue] || T.hues.slate, 0.1); ctx.fillRect(a, 4, Math.max(2, b - a), H - 8); }
  // forecast beyond now
  if (ds.now < t1) { ctx.fillStyle = LM.rgba(T.white, 0.05); ctx.fillRect(x(ds.now), 0, W - x(ds.now), H); }
  // monuments and landmarks
  for (const d of ds.decisions) { ctx.fillStyle = LM.rgba(T.gold, d.who === 'owner' ? 0.55 : 0.3); ctx.fillRect(x(d.b), H * 0.45, 1, H * 0.35); }
  for (const m of ds.milestones) { ctx.fillStyle = LM.rgba(T.gold, 0.95); ctx.fillRect(x(m.t) - 0.5, H * 0.15, 1.5, H * 0.7); ctx.beginPath(); ctx.arc(x(m.t), H * 0.15, 2.5, 0, Math.PI * 2); ctx.fill(); }
  // now
  ctx.fillStyle = LM.rgba(T.white, 0.7); ctx.fillRect(x(ds.now) - 0.5, 0, 1, H);
  // the playhead
  const px = x(v.t);
  ctx.fillStyle = LM.rgba(T.white, 0.95); ctx.fillRect(px - 1, 0, 2, H);
  ctx.beginPath(); ctx.moveTo(px - 5, 0); ctx.lineTo(px + 5, 0); ctx.lineTo(px, 6); ctx.closePath(); ctx.fill();
  // trace marker
  if (v.trace && v.trace.dec) { ctx.fillStyle = LM.rgba(T.gold, 1); ctx.beginPath(); ctx.arc(x(v.trace.dec.b), H * 0.5, 4, 0, Math.PI * 2); ctx.fill(); }
}
function bindRail() {
  const c = LM.railc;
  let down = false;
  const at = (e) => { const r = c.getBoundingClientRect(); const f = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)); return LM.ds.span[0] + f * (LM.ds.span[1] - LM.ds.span[0]); };
  c.addEventListener('pointerdown', (e) => { down = true; c.setPointerCapture(e.pointerId); setTime(at(e)); });
  c.addEventListener('pointermove', (e) => { if (down) setTime(at(e)); });
  c.addEventListener('pointerup', () => { down = false; });
  c.addEventListener('pointercancel', () => { down = false; });
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
    if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.hypot(dx, dy) > 3) moved = true; LM.cam.x = drag.cx - dx / LM.cam.k; LM.cam.y = drag.cy - dy / (LM.cam.k * 0.92); LM.flight = null; LM.dirty(); return; }
    const h = LM.hit(e.clientX, e.clientY);
    const it = h && h.it ? h.it : null;
    if (it !== LM.view.hover) { LM.view.hover = it; c.style.cursor = h && (h.it || h.mon || h.lm || h.district) ? 'pointer' : 'grab'; LM.dirty(); }
  });
  const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (pts.size === 0) { const wasDrag = drag; drag = null; if (!moved && wasDrag) click(e.clientX, e.clientY); } };
  c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
  c.addEventListener('wheel', (e) => { e.preventDefault(); const f = Math.exp(-e.deltaY * 0.0016); zoomAt(e.clientX, e.clientY, f); }, { passive: false });
  c.addEventListener('dblclick', (e) => { const [wx, wy] = LM.toWorld(e.clientX, e.clientY); LM.flyTo(wx, wy, LM.cam.k * 2.4); });
}
function zoomAt(sx, sy, f) {
  const [wx, wy] = LM.toWorld(sx, sy);
  LM.cam.k = Math.max(1.2, Math.min(140, LM.cam.k * f));
  const [nx, ny] = LM.toWorld(sx, sy);
  LM.cam.x += wx - nx; LM.cam.y += wy - ny; LM.flight = null; LM.dirty(); writeUrl();
}
LM.flyTo = function flyTo(x, y, k, ms = 800) {
  if (x === null) { const w = LM.worlds[LM.view.lens].extent; x = (w.minx + w.maxx) / 2; y = (w.miny + w.maxy) / 2 + 8 / k; }
  LM.flight = { x0: LM.cam.x, y0: LM.cam.y, k0: LM.cam.k, x1: x, y1: y, k1: k, t0: performance.now(), ms: LM.view.reduce ? 1 : ms };
  LM.dirty();
};
function flyToLand(g) { const L = LM.vis && LM.vis.lands.get(g); if (!L) return; LM.flyTo(L.cx, L.cy + 1, Math.max(12, Math.min(26, 220 / Math.sqrt(L.n + 1)))); select({ land: L }); }
function flyToDistrict(d) { const D = LM.vis && LM.vis.districts.get(d); if (!D) return; LM.flyTo(D.cx, D.cy + 0.5, Math.max(26, Math.min(60, 300 / Math.sqrt(D.n + 1)))); select({ district: D }); }
function click(sx, sy) {
  const h = LM.hit(sx, sy);
  if (!h) { select(null); return; }
  if (h.it) { select(h.it); if (LM.lod < 3) LM.flyTo(h.x, h.y + 0.6, 64); return; }
  if (h.mon) { select({ mon: h.mon, v: h }); if (LM.lod < 2) LM.flyTo(h.x, h.y, 40); return; }
  if (h.lm) { select({ lm: h.lm, v: h }); return; }
  if (h.district) { if (LM.lod < 2) flyToDistrict(h.district.key); else select({ district: h.district }); return; }
  if (h.land) { if (LM.lod < 1) flyToLand(h.land.key); else select({ land: h.land }); }
}
LM.hit = function hit(sx, sy) {
  const vis = LM.vis; if (!vis) return null;
  const k = LM.cam.k;
  let best = null, bestY = -Infinity;
  for (const v of vis.items) {
    if (v.park) continue;
    const [x, y] = LM.toScreen(v.x, v.y);
    if (Math.abs(x - sx) > k * 1.2 || sy > y + k * 1.2 || sy < y - k * 4) continue;
    const Hpx = v.it ? (v.st.dropped ? 0 : v.it.vh) * (0.3 + 0.2 * v.it.s) * k : v.mon ? k * 1.1 : k * 2.4;
    const D = vis.districts.get(v.d);
    const yy = y - (D && D.lift ? D.lift : 0);
    const inside = sy <= yy + k * 0.8 && sy >= yy - Hpx - k * 0.8 && Math.abs(x - sx) <= k * 0.85;
    if (inside && y > bestY) { best = v; bestY = y; }
  }
  if (best) return best;
  const [wx, wy] = LM.toWorld(sx, sy);
  const [q, r] = LM.xyHex(wx, wy);
  for (const D of vis.districts.values()) if (D.cells.has(q + ',' + r)) return { district: D };
  for (const L of vis.lands.values()) if (L.cells.has(q + ',' + r)) return { land: L };
  return null;
};

// ---- selection and cutaways ----
function select(x) { LM.view.sel = x; renderCut(); LM.dirty(); writeUrl(); }
LM.select = select; LM.setTrace = (k, x) => setTrace(k, x); LM.flyToLand = flyToLand; LM.flyToDistrict = flyToDistrict; LM.togglePlay = togglePlay; LM.setTime = setTime; LM.setLens = setLens; LM.toggleOverlay = toggleOverlay;
function act(name) { say(`<b>${name}</b> — in the product this acts; here it is a mock.`, 3000); }
function renderCut() {
  const C = $('#cut'), s = LM.view.sel, ds = LM.ds, v = LM.view;
  if (!s) { C.hidden = true; return; }
  const close = `<button class="ic x" id="cutx">${I.close}</button>`;
  const actions = (list) => `<div class="acts">${list.map(([ico, n, fn]) => `<button class="act" data-a="${fn}"><span class="ico">${ico}</span>${n}</button>`).join('')}</div>`;
  let html = '';
  if (s.id) { // a building
    const it = s, st = LM.stateAt(ds, it, v.t);
    const { g, d } = LM.groupAt(it, v.lens, v.t);
    const status = st ? ({ todo: 'Planned', doing: 'Rising', review: 'In review', blocked: 'Blocked', done: 'Lit', dropped: 'Set aside' })[st.s] : 'Not yet';
    const since = st ? LM.fmtDate(LM.segAt(it, v.t).t0) : LM.fmtDate(it.b);
    const rooms = Array.from({ length: it.rooms }, (_, i) => `<i class="${st && i < Math.round(it.rooms * st.h) ? 'on' : ''}"></i>`).join('');
    const deps = it.dep.map((id) => { const u = ds.byId.get(id); const us = u && LM.stateAt(ds, u, v.t); return `<div class="pipe ${us ? (us.blocked ? 'clog' : us.done ? 'flow' : 'dry') : 'dry'}"><span></span>${u ? u.n.slice(0, 44) : id}</div>`; }).join('');
    const outs = ds.items.filter((o) => o.dep.includes(it.id)).slice(0, 5).map((o) => `<div class="pipe out"><span></span>${o.n.slice(0, 44)}</div>`).join('');
    const dec = it.dec && ds.decisions.find((x) => x.id === it.dec);
    html = `${close}<div class="path">${LM.landInfo(ds, v.lens, g).name} <i>›</i> ${LM.distName(ds, v.lens, d).slice(0, 40)}</div><h2>${it.n.length > 96 ? it.n.slice(0, 94) + '…' : it.n}</h2>
      <div class="line"><b>${status}</b> · since ${since} · ${it.owner || ''}${it.agent ? ' <span class="tag ai">agent</span>' : ''}${it.walk ? ' · walkthrough' : ''}</div>
      <div class="wall">${wallChart(it)}</div>
      <div class="sec"><h4>Rooms</h4><div class="rooms">${rooms}</div></div>
      ${deps || outs ? `<div class="sec"><h4>Pipes</h4>${deps}${outs}</div>` : ''}
      ${dec ? `<div class="sec"><h4>Monument</h4><button class="link" data-dec="${dec.id}">${dec.n}</button></div>` : ''}
      ${actions([[I.nudge, 'Nudge', 'nudge'], [I.assign, 'Assign', 'assign'], [I.check, 'Approve', 'approve'], [I.open, 'Open', 'open'], [I.ask, 'Ask', 'ask'], [I.trace, 'Trace', 'traceItem'], [I.play, 'Play from here', 'playItem']])}`;
  } else if (s.mon) {
    const d = s.mon;
    html = `${close}<div class="path">Decision · ${LM.fmtDate(d.b)} · ${d.who}</div><h2>${d.n}</h2>
      <div class="line">${d.lin.size ? `${d.lin.size} building${d.lin.size > 1 ? 's' : ''} grew from it` : 'No buildings cite it yet'}</div>
      ${d.lin.size ? `<div class="sec"><h4>Grew from it</h4>${[...d.lin].slice(0, 6).map((id) => `<div class="pipe out"><span></span>${(ds.byId.get(id) || { n: id }).n.slice(0, 44)}</div>`).join('')}</div>` : ''}
      ${actions([[I.trace, 'Trace', 'traceDec'], [I.play, 'Play from here', 'playDec'], [I.ask, 'Ask', 'ask']])}`;
  } else if (s.lm) {
    html = `${close}<div class="path">Landmark · ${LM.fmtDate(s.lm.t)}</div><h2>${s.lm.n}</h2><div class="line">A milestone met. It stays on the skyline.</div>${actions([[I.play, 'Play from here', 'playLm']])}`;
  } else if (s.district) {
    const D = s.district;
    const mons = D.items.filter((x) => x.mon).map((x) => `<button class="link" data-dec="${x.mon.id}">${x.mon.n.slice(0, 60)}</button>`).join('');
    const stuck = D.items.filter((x) => x.it && x.st.blocked).map((x) => `<div class="pipe clog"><span></span>${x.it.n.slice(0, 44)}</div>`).join('');
    html = `${close}<div class="path">${LM.landInfo(ds, v.lens, D.land).name}</div><h2>${LM.distName(ds, v.lens, D.key)}</h2>
      <div class="line">${words(D)}</div><div class="tide"><i style="width:${Math.round((D.done / Math.max(1, D.built || 1)) * 100)}%"></i></div>
      ${stuck ? `<div class="sec"><h4>Stuck</h4>${stuck}</div>` : ''}${mons ? `<div class="sec"><h4>Monuments</h4>${mons}</div>` : ''}
      ${actions([[I.fly, 'Fly in', 'flyD'], [I.play, 'Play from here', 'playD'], [I.ask, 'Ask', 'ask']])}`;
  } else if (s.land) {
    const L = s.land, info = LM.landInfo(ds, v.lens, L.key);
    const dists = [...LM.vis.districts.values()].filter((D) => D.land === L.key).sort((a, b) => b.n - a.n).slice(0, 8)
      .map((D) => `<button class="row" data-dist="${D.key}"><span>${LM.distName(ds, v.lens, D.key).slice(0, 36)}</span><em class="tide"><i style="width:${Math.round((D.done / Math.max(1, D.built || 1)) * 100)}%"></i></em></button>`).join('');
    html = `${close}<div class="path">${ds.name}</div><h2>${info.name}</h2><div class="line">${info.sub || ''}</div><div class="line">${words(L)}</div>
      <div class="coast">${coastline(L.key)}</div>
      <div class="sec"><h4>Districts</h4>${dists}</div>
      ${actions([[I.fly, 'Fly in', 'flyL'], [I.play, 'Play from here', 'playL'], [I.ask, 'Ask', 'ask']])}`;
  }
  C.innerHTML = html; C.hidden = false;
  $('#cutx').onclick = () => select(null);
  for (const b of C.querySelectorAll('[data-dec]')) b.onclick = () => { const d = ds.decisions.find((x) => x.id === b.dataset.dec); if (d) { setTrace('decision', d); } };
  for (const b of C.querySelectorAll('[data-dist]')) b.onclick = () => flyToDistrict(b.dataset.dist);
  for (const b of C.querySelectorAll('.act')) b.onclick = () => {
    const a = b.dataset.a;
    if (a === 'traceItem') setTrace('item', s); else if (a === 'traceDec') setTrace('decision', s.mon);
    else if (a === 'playItem') { setTime(s.b); togglePlay(true); } else if (a === 'playDec') { setTime(s.mon.b - 1000); togglePlay(true); setTrace('decision', s.mon); }
    else if (a === 'playLm') { setTime(s.lm.t - LM.ds.win.stale); togglePlay(true); }
    else if (a === 'flyD') flyToDistrict(s.district.key); else if (a === 'playD') { const first = Math.min(...s.district.items.map((x) => x.t || x.it.b)); setTime(first); togglePlay(true); }
    else if (a === 'flyL') flyToLand(s.land.key); else if (a === 'playL') { const first = Math.min(...s.land.items.map((x) => x.t || x.it.b)); setTime(first); togglePlay(true); }
    else act(b.textContent.trim());
  };
}
const words = (S) => { const n = S.built || 0; const p = []; p.push(`${n} building${n === 1 ? '' : 's'}`); if (S.done) p.push(`${S.done} lit`); if (S.working) p.push(`${S.working} rising`); if (S.blocked) p.push(`<em>${S.blocked} blocked</em>`); if (S.stale) p.push(`${S.stale} still`); return p.join(' · '); };
function wallChart(it) {
  const ds = LM.ds, [t0, t1] = [it.b, Math.max(it.end + ds.win.fresh, Math.min(ds.span[1], LM.view.t))];
  const x = (t) => Math.max(0, Math.min(100, ((t - t0) / Math.max(1, t1 - t0)) * 100));
  const parts = it.seg.map((sg) => `<i class="${sg.s}" style="left:${x(sg.t0)}%;width:${Math.max(0.8, x(Math.min(isFinite(sg.t1) ? sg.t1 : t1, t1)) - x(sg.t0))}%"></i>`).join('');
  return `<div class="bar">${parts}<b style="left:${x(LM.view.t)}%"></b></div><div class="ax"><span>${LM.fmtDate(t0)}</span><span>${LM.fmtDate(t1)}</span></div>`;
}
function coastline(g) {
  const world = LM.worlds[LM.view.lens], ds = LM.ds, N = 48;
  const counts = new Array(N).fill(0);
  for (const c of world.claims) if (c.g === g) counts[Math.min(N - 1, Math.floor(((c.t - ds.span[0]) / (ds.span[1] - ds.span[0])) * N))]++;
  let acc = 0; const cum = counts.map((n) => (acc += n));
  const max = Math.max(1, acc);
  const pts = cum.map((n, i) => `${(i / (N - 1)) * 100},${30 - (n / max) * 28}`).join(' ');
  const nowX = ((LM.view.t - ds.span[0]) / (ds.span[1] - ds.span[0])) * 100;
  return `<svg viewBox="0 0 100 32" preserveAspectRatio="none"><polyline points="0,30 ${pts} 100,30" /><line x1="${nowX}" x2="${nowX}" y1="0" y2="32"/></svg><div class="ax"><span>how the coast grew</span><span>${acc} plots</span></div>`;
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
  if (kind === 'decision') { say(`<b>Tracing</b> ${x.n} — ${x.lin.size} building${x.lin.size === 1 ? '' : 's'} grew from it. <button class="link" id="playhere">Play from here</button> · Esc clears`, 12000); setTimeout(() => { const b = $('#playhere'); if (b) b.onclick = () => { setTime(x.b - 1000); togglePlay(true); }; }, 0); }
  else say(`<b>Tracing</b> ${x.n} — its pipes in and out. Esc clears`, 6000);
  LM.dirty(); writeUrl();
}
function clearTrace() { if (LM.view.trace) { LM.view.trace = null; LM.dirty(); writeUrl(); } }
function toggleList() {
  const L = $('#list'); if (!L.hidden) { L.hidden = true; return; }
  const ds = LM.ds;
  L.innerHTML = `<div class="lh"><input id="lfind" placeholder="Find a decision"><button class="ic" id="lx">${I.close}</button></div><div class="lb"></div>`;
  const body = L.querySelector('.lb');
  const render = (q = '') => { body.innerHTML = ds.decisions.filter((d) => !q || (d.n + ' ' + d.id).toLowerCase().includes(q.toLowerCase())).slice(-400).reverse().map((d) => `<button class="row" data-id="${d.id}"><span><b>${d.id}</b> ${d.n.slice(0, 70)}</span><em>${LM.fmtDate(d.b)}${d.lin.size ? ` · ${d.lin.size}` : ''}</em></button>`).join(''); for (const b of body.querySelectorAll('.row')) b.onclick = () => { const d = ds.decisions.find((x) => x.id === b.dataset.id); L.hidden = true; setTime(Math.max(d.b, LM.view.t)); setTrace('decision', d); const c = LM.worlds[LM.view.lens].claims.find((cc) => cc.dec === d); if (c) { const [x, y] = LM.hexXY(c.q, c.r); LM.flyTo(x, y, Math.max(LM.cam.k, 18)); select({ mon: d, v: c }); } }; };
  render(); L.hidden = false;
  $('#lfind').oninput = (e) => render(e.target.value); $('#lfind').focus();
  $('#lx').onclick = () => { L.hidden = true; };
}

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
  if (has(/\b(people|owner|owners|who|person|crew)\b/)) { setLens('people'); said.push('seen by person'); }
  if (has(/\b(clear|plain|no overlay|nothing)\b/)) { LM.view.overlays.clear(); said.push('overlays cleared'); }
  const O = [[/cost|burn|spend/, 'cost'], [/revenue|harvest|earn|money made|yield/, 'revenue'], [/progress|how far|done share|tide/, 'progress'], [/issue|weather|storm|hurt/, 'issues'], [/stuck|clog|dependenc|pipe|flow|blocked/, 'pipes'], [/decision lines|power|waiting on|awaits/, 'power'], [/load|overloaded|stretched/, 'load'], [/fresh|alive|moved today|stale|still/, 'fresh'], [/\bai\b|agents?/, 'ai'], [/terrain|elevation|remaining|height/, 'terrain']];
  for (const [re, k] of O) if (re.test(q)) { toggleOverlay(k, !has(/\b(off|hide|remove)\b/)); said.push(`${k}: ${OVERLAYS.find((o) => o[0] === k)[2]}`); }
  if (has(/\bstuck\b/)) { toggleOverlay('issues', true); const score = (D) => D.blocked * 3 + D.stale; const D = [...LM.visible(LM.worlds[LM.view.lens], LM.view.t).districts.values()].sort((a, b) => score(b) - score(a))[0]; if (D && score(D)) { flyToDistrict(D.key); said.push(`the most stuck place is ${LM.distName(ds, LM.view.lens, D.key)}: ${D.blocked ? `${D.blocked} blocked` : ''}${D.blocked && D.stale ? ', ' : ''}${D.stale ? `${D.stale} still for a while` : ''}`); } else said.push('nothing is stuck right now'); }
  if (has(/\b(play|run|animate)\b/) && !has(/from/)) { togglePlay(true); said.push('playing'); }
  if (has(/\b(pause|stop|hold)\b/)) { togglePlay(false); said.push('paused'); }
  if (has(/\bfaster\b/)) { const S = SPEEDS[ds.key]; const i = S.findIndex((s) => s[0] === LM.view.speed); LM.view.speed = S[Math.min(S.length - 1, i + 1)][0]; said.push('faster'); }
  if (has(/\bslower\b/)) { const S = SPEEDS[ds.key]; const i = S.findIndex((s) => s[0] === LM.view.speed); LM.view.speed = S[Math.max(0, i - 1)][0]; said.push('slower'); }
  if (has(/\b(start|beginning|first day)\b/)) { setTime(ds.span[0]); said.push('at the beginning'); }
  if (has(/\b(now|today|present)\b/)) { setTime(ds.now); said.push('now'); }
  if (has(/\bend\b/)) { setTime(ds.span[1]); said.push('at the end'); }
  const dm = /(\d{4}-\d{2}-\d{2})|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:,?\s*(\d{4}))?/.exec(q);
  if (dm) { const t = dm[1] ? Date.parse(dm[1] + 'T12:00:00') : Date.parse(`${dm[2]} ${dm[3]} ${dm[4] || new Date(ds.now).getFullYear()} 12:00`); if (!isNaN(t)) { setTime(t); said.push(LM.fmtDate(t)); } }
  const tm = /\b(trace|cause|caused|effects? of)\b\s*(.*)$/.exec(q);
  if (tm) { const key = (tm[2] || '').replace(/^(of|the)\s+/, '').trim(); const d = ds.decisions.find((x) => x.id.toLowerCase() === key) || ds.decisions.filter((x) => key && x.n.toLowerCase().includes(key)).sort((a, b) => b.lin.size - a.lin.size)[0]; if (d) { setTrace('decision', d); const c = LM.worlds[LM.view.lens].claims.find((cc) => cc.dec === d); if (c) { const [x, y] = LM.hexXY(c.q, c.r); LM.flyTo(x, y, Math.max(LM.cam.k, 16)); } said.push(`tracing ${d.n}`); } else if (key) said.push(`no decision matches "${key}"`); }
  const om = /\b(open|show|go to|fly to|find|zoom (?:in )?(?:to|on))\b\s+(.*)$/.exec(q);
  if (om && !tm) {
    const key = om[2].replace(/^(the|me)\s+/, '').trim();
    const vis = LM.visible(LM.worlds[LM.view.lens], LM.view.t);
    const land = [...vis.lands.values()].find((L) => LM.landInfo(ds, LM.view.lens, L.key).name.toLowerCase().includes(key));
    const dist = !land && [...vis.districts.values()].find((D) => LM.distName(ds, LM.view.lens, D.key).toLowerCase().includes(key));
    const item = !land && !dist && vis.items.find((v) => v.it && v.it.n.toLowerCase().includes(key));
    if (land) { flyToLand(land.key); said.push(`flying to ${LM.landInfo(ds, LM.view.lens, land.key).name}`); }
    else if (dist) { flyToDistrict(dist.key); said.push(`flying to ${LM.distName(ds, LM.view.lens, dist.key)}`); }
    else if (item) { select(item.it); LM.flyTo(item.x, item.y + 0.6, 64); said.push(`opening ${item.it.n}`); }
    else if (key && !said.length) said.push(`nothing here is called "${key}"`);
  }
  if (has(/\b(sky|whole|everything|zoom out|company)\b/) && !om) { select(null); LM.flyTo(null, null, 3.2); said.push('the whole world'); }
  if (!said.length) said.push('I can change the lens (departments, projects, products, people), lay an overlay (cost, revenue, progress, issues, pipes, power, load, fresh, AI, terrain), move in time (play, pause, a date, now, start), trace a decision, or open a place.');
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
  LM.readTheme();
  if (p.get('k')) LM.cam = { x: Number(p.get('x') || 0), y: Number(p.get('y') || 0), k: Number(p.get('k')) };
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
    if (document.documentElement.dataset.pt !== 'deep') p.set('pt', document.documentElement.dataset.pt); if (v.hc) p.set('hc', '1');
    history.replaceState(null, '', '?' + p.toString());
  }, 300);
}

window.addEventListener('DOMContentLoaded', LM.boot);
