/* Lucid Total · the calendar exploration (T41). The company by when: every day a place in time. On the living map's
 * data (both datasets), model (state over time, pictures) and vocabulary. Three ways to draw it (days as tiles, the
 * river, the strata), two zooms (company → place → task; quarter → month → week → day), the panel as the context of
 * what is clicked. docs/19-calendar.md, docs/20-calendar-product-plan.md. */
(() => {
  const LM = window.LM, CAL = (window.CAL = {});
  const DAY = 86400e3, HOUR = 3600e3;
  const $ = (s, r = document) => r.querySelector(s);
  LM.I = (name, cls = '') => `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${LM.ICONS[name] || LM.ICONS.dot || ''}"/></svg>`;
  const I = LM.I;
  LM.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const esc = LM.esc;
  LM.landInfo = (ds, lens, g) => ds.lenses[lens].lands[g] || (g === '_co' ? { name: 'Company', sub: '', glyph: 'landmark', hue: 'gold', lm: 'summit' } : { name: g, sub: '', glyph: 'map', hue: 'slate', lm: 'keep' });
  LM.marksIn = (root) => { if (window.lucidMarks) window.lucidMarks(root); };
  const AI = (cls = '') => `<i data-lucide="lucid-mark" class="mk ${cls}" aria-hidden="true"></i>`;
  const glyph = (kind, size = 'sm') => { const [f, ic, l] = LM.KINDS[kind] || LM.KINDS.task; return `<span class="g f-${f} ${size}" title="${l}">${I(ic)}</span>`; };
  const lmSvg = (key, size = 16) => `<svg viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true"><path d="${LM.LANDMARKS[LM.LANDMARKS[key] ? key : 'keep'].d}" fill="currentColor"/></svg>`;
  const av = (who) => `<span class="av ${who.agent ? 'ag' : who.cls}" title="${esc(who.name)}">${who.agent ? I('bot') : who.initial}</span>`;

  // ---- the grammar: one channel, one meaning (docs/19 §5) ----
  const KIND = {
    asked: { ic: 'message-circle-question', hue: 'rules', word: 'Asked', w: 0.9 },
    decided: { ic: 'signpost', hue: 'rules', word: 'Decided', w: 0.8 },
    blocked: { ic: 'construction', hue: 'block', word: 'Stuck', w: 1.0 },
    resolved: { ic: 'badge-check', hue: 'good', word: 'Resolved', w: 1.0 },
    enabled: { ic: 'route', hue: 'good', word: 'Enabled', w: 0.5 },
    done: { ic: 'circle-check-big', hue: 'good', word: 'Finished', w: 1.2 },
    landmark: { ic: 'milestone', hue: 'gold', word: 'Landmark', w: 1.0 },
    started: { ic: 'sprout', hue: 'lime', word: 'Started', w: 0.6 },
    review: { ic: 'eye', hue: 'ai', word: 'In review', w: 0.4 },
    planned: { ic: 'circle-dashed', hue: 'slate', word: 'Planned', w: 0.2 },
    dropped: { ic: 'trees', hue: 'lime', word: 'Set aside', w: 0.2 },
    still: { ic: 'hourglass', hue: 'hold', word: 'Still', w: 0 },
  };
  const ORDER = ['asked', 'decided', 'blocked', 'resolved', 'enabled', 'done', 'landmark', 'started', 'review', 'planned', 'dropped'];
  const LAYERS = [['all', 'Everything', 'sun-medium'], ['harvest', 'Harvest', 'circle-check-big'], ['problems', 'Problems', 'construction'], ['decisions', 'Decisions', 'signpost'], ['people', 'People', 'users'], ['cost', 'Cost', 'flame'], ['projected', 'Projected', 'circle-dashed']];
  const LAYER_KINDS = { harvest: new Set(['done', 'enabled', 'landmark']), problems: new Set(['blocked', 'resolved', 'asked', 'still']), decisions: new Set(['decided', 'asked', 'landmark']) };
  const VIZ = [['tiles', 'Tiles', 'calendar'], ['river', 'River', 'waves'], ['strata', 'Strata', 'layers']];
  const ZOOMS = [['quarter', 'Quarter'], ['month', 'Month'], ['week', 'Week'], ['day', 'Day']];
  const LENSES = [['dept', 'By place', 'map'], ['proj', 'By project', 'kanban'], ['people', 'By person', 'users']];
  const THEMES = [['deep', 'Deep Blue', 'moon'], ['aqua', 'Aqua Dusk', 'waves'], ['sky', 'Sky Glass', 'sun']];

  CAL.view = { ds: 'lucid', lens: 'dept', viz: 'tiles', zoom: 'week', focus: { level: 0, key: null }, sel: null, layer: 'all', day: 0, weekStart: 0, panel: true, strataScroll: 0 };

  // ---- days ----
  const dayKey = (t) => { const d = new Date(t); return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY); };
  const dayStart = (k) => { const d = new Date(k * DAY); return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).getTime(); };
  const dateOf = (k) => new Date(dayStart(k));
  const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmtDay = (k) => { const d = dateOf(k); return `${WD[d.getDay()]} ${MO[d.getMonth()]} ${d.getDate()}`; };
  const fmtDayLong = (k) => { const d = dateOf(k); return `${WD[d.getDay()]}, ${MO[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; };
  const fmtTime = (t) => { const d = new Date(t); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const weekendOf = (k, ds) => { const wd = dateOf(k).getDay(); return ds.key === 'lucid' ? wd === 5 || wd === 6 : wd === 0 || wd === 6; };
  CAL.dayKey = dayKey; CAL.dayStart = dayStart;

  // ---- the day index: every change with its time, who and where; derived facts; projections (docs/19 §9) ----
  const median = (xs) => { if (!xs.length) return null; const s = xs.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
  CAL.index = function index(ds, lens) {
    const ck = ds.key + '|' + lens; if (CAL._idx && CAL._idx.ck === ck) return CAL._idx;
    const now = ds.now, nowK = dayKey(now);
    const placeOf = (it) => (it.g && it.g[lens]) || '_co';
    const events = [];
    const push = (e) => { e.k = dayKey(e.t); events.push(e); };
    // the items' transitions
    const doneAt = new Map();
    for (const it of ds.items) {
      const st = it.st; const who = LM.who(it); const place = placeOf(it);
      for (let i = 0; i < st.length; i++) {
        const [t, s] = st[i]; const prev = i ? st[i - 1][1] : null; const proj = t > now;
        let kind = null;
        if (s === 'todo' && i === 0) kind = 'planned';
        else if (s === 'doing') kind = prev === 'blocked' ? 'resolved' : prev === 'review' || prev === 'done' ? 'started' : 'started';
        else if (s === 'review') kind = 'review';
        else if (s === 'done') { kind = 'done'; if (!proj) doneAt.set(it.id, t); }
        else if (s === 'blocked') kind = 'blocked';
        else if (s === 'dropped') kind = 'dropped';
        if (!kind) continue;
        push({ t, kind, it, who, place, proj });
      }
    }
    // enabled: the day a task's last upstream finished (if it was not done itself)
    for (const it of ds.items) {
      if (!it.dep.length || it.st[0][0] > now) continue;
      const ts = it.dep.map((id) => doneAt.get(id)); if (ts.some((x) => x === undefined)) continue;
      const t = Math.max(...ts); const own = doneAt.get(it.id); if (own !== undefined && own <= t) continue;
      push({ t: t + 60e3, kind: 'enabled', it, who: LM.who(it), place: placeOf(it), proj: false, by: it.dep.map((id) => ds.byId.get(id)).filter(Boolean) });
    }
    // decisions, asks, landmarks
    for (const d of ds.decisions) push({ t: d.b, kind: 'decided', dec: d, who: LM.who({ owner: d.who === 'owner' ? (ds.key === 'lucid' ? 'Yossi' : 'Yossi') : 'Lead' }), place: (d.home && d.home[lens]) || '_co', proj: false });
    for (const a of ds.asks) { const it = a.it ? ds.byId.get(a.it) : null; push({ t: a.b, kind: 'asked', a, it, who: LM.who({ owner: a.by }), place: it ? placeOf(it) : '_co', proj: false }); }
    for (const m of ds.milestones || []) push({ t: m.t, kind: 'landmark', lm: m, who: LM.who({ owner: 'Lead' }), place: (m.land && m.land[lens]) || '_co', proj: m.t > now });
    // projections for the real log (the example company carries forecasts in its data)
    const hasForecast = ds.items.some((it) => it.st.some((s) => s[0] > now));
    const paces = [];
    for (const it of ds.items) { const d0 = it.st.find((s) => s[1] === 'doing'), d1 = it.st.find((s) => s[1] === 'done'); if (d0 && d1 && d1[0] <= now && d1[0] > now - 30 * DAY) paces.push((d1[0] - d0[0]) / DAY / Math.max(1, it.s)); }
    const pace = median(paces) || (ds.key === 'lucid' ? 0.3 : 1.2);
    CAL.pace = pace; CAL.synthetic = ds.key === 'lucid' ? 'asks and projections are derived from the log' : 'forecasts are carried by the generated data';
    if (!hasForecast) {
      let q = 0;
      for (const it of ds.items) {
        const st = LM.stateAt(ds, it, now); if (!st || st.closed) continue;
        const who = LM.who(it), place = placeOf(it);
        if (st.s === 'doing') { const days = Math.max(0.4, (1 - st.h) * it.s * pace); push({ t: now + days * DAY, kind: 'done', it, who, place, proj: true, why: `at the pace of the last thirty days (${pace.toFixed(1)} d per size unit), ${Math.round((1 - st.h) * 100)} % left` }); }
        else if (st.s === 'review') push({ t: now + (ds.win.review / 2), kind: 'done', it, who, place, proj: true, why: 'half the review window from now' });
        else if (st.s === 'todo') { const deps = it.dep.map((id) => ds.byId.get(id)).filter(Boolean); const after = Math.max(now, ...deps.map((d) => { const e = events.find((x) => x.it === d && x.kind === 'done'); return e ? e.t : now; })); const start = after + (0.5 + (q++) * 0.11) * DAY; if (start < now + 45 * DAY) { push({ t: start, kind: 'started', it, who, place, proj: true, why: 'after what it waits on, in queue order' }); push({ t: start + Math.max(0.5, it.s * pace) * DAY, kind: 'done', it, who, place, proj: true, why: `${it.s} size units at ${pace.toFixed(1)} d each` }); } }
      }
    } else for (const e of events) if (e.t > now) e.why = 'the forecast carried by the data';
    events.sort((a, b) => a.t - b.t);
    // days
    const days = new Map();
    const dayOf = (k) => { let D = days.get(k); if (!D) { D = { k, t0: dayStart(k), events: [], proj: k > nowK, today: k === nowK, still: 0, places: new Map() }; days.set(k, D); } return D; };
    for (const e of events) { const D = dayOf(e.k); D.events.push(e); }
    // still: at the end of each past day, the open work that had not moved for the stale window
    const span = [dayKey(ds.span[0]), nowK];
    const starts = ds.items.map((it) => it.st[0][0]);
    for (let k = span[0]; k <= span[1]; k++) {
      const D = dayOf(k); const end = D.t0 + DAY; let n = 0;
      if ((k - span[0]) % (ds.key === 'lucid' ? 1 : 3) === 0) { for (let i = 0; i < ds.items.length; i++) { const it = ds.items[i]; if (starts[i] > end) continue; let last = null; for (const s of it.st) { if (s[0] <= end) last = s; else break; } if (!last) continue; if ((last[1] === 'doing' || last[1] === 'blocked') && end - last[0] > ds.win.stale) n++; } }
      D.still = n;
    }
    // fronts: a firm landmark ahead whose place has projected finishes after it
    for (const e of events) if (e.kind === 'landmark' && e.proj) { const late = events.filter((x) => x.proj && x.kind === 'done' && x.place === e.place && x.t > e.t); if (late.length) { e.front = late.length; dayOf(e.k).front = (dayOf(e.k).front || 0) + late.length; } }
    const idx = { ck, ds, lens, events, days, nowK, now, pace, k0: Math.min(...days.keys()), k1: Math.max(...days.keys()) };
    CAL._idx = idx; return idx;
  };

  // ---- scope and layer ----
  const inScope = (e, f) => { if (f.level === 0) return true; if (f.level === 1) return e.place === f.key; const id = f.key; return (e.it && e.it.id === id) || (e.a && (e.a.it === id || (e.a.refs && e.a.refs.includes(id)))) || (e.dec && e.dec.refs && e.dec.refs.includes(id)) || (e.by && e.by.some((b) => b.id === id)); };
  const inLayer = (e, layer) => (layer === 'all' || layer === 'people' || layer === 'cost' ? true : layer === 'projected' ? e.proj : LAYER_KINDS[layer].has(e.kind));
  const weight = (e) => (KIND[e.kind] ? KIND[e.kind].w : 0.3) * (e.it ? 0.6 + Math.min(5, e.it.s) * 0.12 : 1);
  /** A day as the current scope and layer see it. */
  const dayView = (D, f, layer, idx) => {
    const evs = D ? D.events.filter((e) => inScope(e, f) && inLayer(e, layer)) : [];
    const counts = {}; for (const e of evs) counts[e.kind] = (counts[e.kind] || 0) + 1;
    const people = new Map(); for (const e of evs) if (e.who && e.kind !== 'planned') { const c = people.get(e.who.name) || { w: e.who, n: 0 }; c.n++; people.set(e.who.name, c); }
    const crew = [...people.values()].sort((a, b) => (a.w.agent - b.w.agent) || b.n - a.n);
    let cost = 0, size = 0; for (const e of evs) if (e.kind === 'done' && e.it) { cost += e.it.cost || 0; size += e.it.s; }
    const still = D && f.level === 0 && (layer === 'all' || layer === 'problems') ? D.still : 0;
    let vol = 0; for (const e of evs) vol += weight(e);
    if (layer === 'people') vol = crew.length; else if (layer === 'cost') vol = cost; else if (layer === 'harvest') vol = size || 0; else if (layer === 'problems') vol = (counts.blocked || 0) + (counts.resolved || 0) + (counts.asked || 0) + still * 0.3;
    return { D, k: D ? D.k : 0, evs, counts, crew, cost, size, still, vol, proj: D ? D.proj : false, front: D ? D.front : 0 };
  };
  CAL.dayView = dayView;

  // ---- the period ----
  const weekOf = (k, ws) => { const wd = dateOf(k).getDay(); return k - ((wd - ws + 7) % 7); };
  const period = (v) => {
    const ws = v.weekStart;
    if (v.zoom === 'quarter') { const w = weekOf(v.day, ws); return { k0: w - 7 * 6, k1: w + 7 * 7, weeks: 13 }; }
    if (v.zoom === 'month') { const d = dateOf(v.day); const first = dayKey(new Date(d.getFullYear(), d.getMonth(), 1).getTime()); const w0 = weekOf(first, ws); return { k0: w0, k1: w0 + 42, weeks: 6, month: d.getMonth(), year: d.getFullYear() }; }
    if (v.zoom === 'week') { const w = weekOf(v.day, ws); return { k0: w, k1: w + 7, weeks: 1 }; }
    return { k0: v.day, k1: v.day + 1, weeks: 0 };
  };
  const periodTitle = (v, P) => {
    if (v.zoom === 'day') return fmtDayLong(v.day);
    if (v.zoom === 'month') return `${MO[P.month]} ${P.year}`;
    const a = dateOf(P.k0), b = dateOf(P.k1 - 1);
    return `${MO[a.getMonth()]} ${a.getDate()} – ${MO[b.getMonth()]} ${b.getDate()}, ${b.getFullYear()}`;
  };
  CAL.period = period;

  // ---- lanes: the places (or tasks) with activity in a range ----
  const lanesOf = (idx, f, layer, k0, k1, max) => {
    const ds = idx.ds, lens = idx.lens;
    const m = new Map();
    for (let k = k0; k < k1; k++) { const D = idx.days.get(k); if (!D) continue; for (const e of D.events) { if (!inScope(e, f) || !inLayer(e, layer)) continue; const key = f.level === 0 ? e.place : f.level === 1 ? (e.it ? e.it.id : '_other') : f.key; let L = m.get(key); if (!L) { L = { key, vol: 0, days: new Map() }; m.set(key, L); } L.vol += weight(e); let d = L.days.get(k); if (!d) { d = []; L.days.set(k, d); } d.push(e); } }
    const list = [...m.values()].sort((a, b) => b.vol - a.vol);
    for (const L of list) { if (f.level === 0) { const info = LM.landInfo(ds, lens, L.key); L.name = info.name; L.hue = info.hue; L.lm = info.lm; } else if (f.level === 1) { const it = ds.byId.get(L.key); L.name = it ? it.short : 'Other'; L.hue = it ? (LM.KINDS[it.k] || LM.KINDS.task)[0] : 'slate'; L.it = it; } else { const it = ds.byId.get(L.key); L.name = it ? it.short : L.key; L.hue = 'acc'; L.it = it; } }
    if (list.length > max) { const rest = list.slice(max - 1); const O = { key: '_more', name: `${rest.length} more`, hue: 'slate', vol: 0, days: new Map() }; for (const L of rest) { O.vol += L.vol; for (const [k, evs] of L.days) { let d = O.days.get(k); if (!d) { d = []; O.days.set(k, d); } d.push(...evs); } } return [...list.slice(0, max - 1), O]; }
    return list;
  };

  // ---- text ----
  const evTitle = (e) => (e.it ? e.it.n : e.dec ? e.dec.n.replace(/\*\*/g, '') : e.a ? e.a.n : e.lm ? e.lm.n : '');
  const evShort = (e) => { const t = evTitle(e); return t.length > 64 ? t.slice(0, 62).trimEnd() + '…' : t; };
  const evLine = (e, v) => { const when = fmtTime(e.t); const w = e.who ? e.who.name : ''; const extra = e.kind === 'enabled' && e.by ? ` · freed by ${e.by.map((b) => b.short).slice(0, 2).join(', ')}` : e.kind === 'asked' && e.a ? ` · ${e.a.to === 'owner' ? 'needs you' : 'needs the lead'}` : e.proj && e.why ? ` · ${e.why}` : ''; return `${e.proj ? 'expected ' : ''}${when} · ${w}${extra}`; };
  const evHtml = (e, opt = {}) => { const K = KIND[e.kind]; const pic = opt.pic !== false && e.kind === 'done' && e.it ? `<span class="pic">${LM.picSvg(e.it, e.proj ? { s: 'todo' } : { s: 'done', done: true })}</span>` : ''; return `<div class="ev${e.proj ? ' ghost' : ''}" data-ev="${e.id}" title="${esc(evTitle(e))}"><span class="g f-${K.hue} sm">${I(K.ic)}</span>${pic}<span class="et">${esc(opt.short === false ? evTitle(e) : evShort(e))}<small>${esc(K.word)} · ${esc(evLine(e))}</small></span>${opt.who !== false && e.who && e.kind !== 'landmark' ? av(e.who) : ''}</div>`; };
  const symHtml = (dv, cap = 6) => { const out = []; const c = dv.counts; const add = (kind, n, cls) => { if (n) out.push(`<span class="${cls}" data-go="${kind}" title="${KIND[kind] ? KIND[kind].word : kind}">${I(KIND[kind].ic)}${n}</span>`); }; add('asked', c.asked, 'rules'); add('blocked', c.blocked, 'block'); if (dv.still) out.push(`<span class="hold" data-go="still" title="nothing moved for a while">${I('hourglass')}${dv.still}</span>`); add('resolved', c.resolved, 'good'); add('enabled', c.enabled, 'good'); add('decided', c.decided, 'rules'); add('landmark', c.landmark, 'gold'); return out.slice(0, cap).join(''); };

  // ---- data ----
  CAL.setDataset = function setDataset(key) {
    const ds = LM.prepare(LM.DATA[key]); LM.ds = ds; CAL.view.ds = key;
    for (const d of ds.decisions) d.short = d.n.replace(/\*\*/g, '').slice(0, 80);
    CAL._idx = null;
    const idx = CAL.index(ds, CAL.view.lens); CAL.view.day = idx.nowK; CAL.view.sel = { day: idx.nowK }; CAL.view.focus = { level: 0, key: null };
    let id = 0; for (const e of idx.events) e.id = 'e' + (id++);
  };
  const idxNow = () => { const idx = CAL.index(LM.ds, CAL.view.lens); if (!idx.events[0] || idx.events[0].id === undefined) { let id = 0; for (const e of idx.events) e.id = 'e' + (id++); } return idx; };
  const evById = (id) => idxNow().events.find((e) => e.id === id);

  // ================= the surface =================
  CAL.render = function render() {
    const v = CAL.view, idx = idxNow(), P = period(v);
    CAL.P = P;
    document.documentElement.classList.toggle('feed-open', v.panel && window.innerWidth > 1100);
    $('#ptitle').textContent = periodTitle(v, P);
    for (const b of document.querySelectorAll('[data-viz]')) b.classList.toggle('on', b.dataset.viz === v.viz);
    for (const b of document.querySelectorAll('[data-zoom]')) b.classList.toggle('on', b.dataset.zoom === v.zoom);
    for (const b of document.querySelectorAll('[data-layer]')) b.classList.toggle('on', b.dataset.layer === v.layer);
    for (const b of document.querySelectorAll('[data-lens]')) b.classList.toggle('on', b.dataset.lens === v.lens);
    renderCrumbs(idx);
    const S = $('#surface'); S.className = 'surface ' + v.viz + ' z-' + v.zoom;
    if (v.viz === 'tiles') { $('#cv').hidden = true; $('#dom').hidden = false; if (v.zoom === 'day') renderHours(idx, P); else renderTiles(idx, P); }
    else { $('#dom').hidden = true; $('#cv').hidden = false; drawCanvas(idx, P); }
    renderPanel(idx); renderKey(idx); writeUrl();
  };

  // ---- days as tiles (quarter, month, week) ----
  function renderTiles(idx, P) {
    const v = CAL.view, ds = idx.ds; const root = $('#dom');
    const dvs = []; let maxV = 0;
    for (let k = P.k0; k < P.k1; k++) { const dv = dayView(idx.days.get(k), v.focus, v.layer, idx); dvs.push(dv); if (!dv.proj || v.layer === 'projected') maxV = Math.max(maxV, dv.vol); }
    const ws = v.weekStart;
    const head = Array.from({ length: 7 }, (_, i) => `<div class="wd">${WD[(ws + i) % 7]}</div>`).join('');
    const lc = v.layer === 'problems' ? 'var(--block-h)' : v.layer === 'people' ? 'var(--acc)' : v.layer === 'cost' ? 'var(--f-heat)' : v.layer === 'decisions' ? 'var(--f-rules)' : v.layer === 'projected' ? 'var(--f-slate)' : 'var(--good)';
    const cls = (dv, k) => `${k === idx.nowK ? ' today' : ''}${dv.proj ? ' future' : k < idx.nowK - (ds.win.old / DAY) ? ' old' : ''}${weekendOf(k, ds) ? ' wk' : ''}${v.sel && v.sel.day === k ? ' sel' : ''}${dv.front ? ' front' : ''}${v.zoom === 'month' && P.month !== undefined && dateOf(k).getMonth() !== P.month ? ' off' : ''}`;
    const fillOf = (dv) => (maxV ? Math.min(1, dv.vol / maxV) : 0);
    if (v.zoom === 'week') {
      root.innerHTML = `<div class="grid week">${head}${dvs.map((dv, i) => { const k = P.k0 + i; const d = dateOf(k); return `<div class="dc${cls(dv, k)}" data-day="${k}" style="--v:${fillOf(dv).toFixed(2)};--lc:${lc}"><div class="fill"></div><div class="dh"><b>${d.getDate()}</b><span>${WD[d.getDay()]}${k === idx.nowK ? ' · today' : ''}</span><span class="n">${dv.evs.length ? `${dv.evs.length}${dv.proj ? ' expected' : ''}` : ''}</span></div><div class="sym">${symHtml(dv, 5)}</div><div class="body">${columnBody(dv, idx)}</div></div>`; }).join('')}</div>`;
    } else if (v.zoom === 'month') {
      root.innerHTML = `<div class="grid month" style="grid-template-rows:auto repeat(${P.weeks},1fr)">${head}${dvs.map((dv, i) => { const k = P.k0 + i; const d = dateOf(k); const harvest = dv.evs.filter((e) => e.kind === 'done' && e.it).slice(0, 3); const c = dv.counts; const line = !dv.evs.length ? '' : dv.proj ? `<b>${(c.done || 0)}</b> expected${c.started ? ` · ${c.started} to start` : ''}${c.landmark ? ' · gate' : ''}` : `<b>${c.done || 0}</b> done${c.started ? ` · ${c.started} started` : ''}${dv.cost && v.layer === 'cost' ? ` · ${LM.fmtMoney(dv.cost)}` : ''}`; return `<div class="dt m${cls(dv, k)}" data-day="${k}" style="--v:${fillOf(dv).toFixed(2)};--lc:${lc}"><div class="fill"></div><span class="dn">${d.getDate()}${d.getDate() === 1 || i === 0 ? `<small>${MO[d.getMonth()]}</small>` : ''}</span><div class="cov${dv.evs.length ? '' : ' empty'}">${harvest.length ? harvest.map((e) => `<span class="mp${e.proj ? ' ghost' : ''}" data-ev="${e.id}" title="${esc(evTitle(e))}">${LM.picSvg(e.it, e.proj ? { s: 'todo' } : { s: 'done', done: true })}</span>`).join('') : ''}</div><div class="bd"><div class="ln">${line}</div><div class="sym">${symHtml(dv, 4)}</div>${dv.crew.length ? `<div class="crew">${dv.crew.slice(0, 3).map((c2) => av(c2.w)).join('')}${dv.crew.length > 3 ? `<em>+${dv.crew.length - 3}</em>` : ''}</div>` : ''}</div></div>`; }).join('')}</div>`;
    } else {
      root.innerHTML = `<div class="grid quarter" style="grid-template-rows:auto repeat(${P.weeks},1fr)">${head}${dvs.map((dv, i) => { const k = P.k0 + i; const d = dateOf(k); const c = dv.counts; return `<div class="dt q${cls(dv, k)}" data-day="${k}" style="--v:${fillOf(dv).toFixed(2)};--lc:${lc}"><div class="fill"></div><span class="dn">${d.getDate()}${d.getDate() === 1 || i === 0 ? `<small>${MO[d.getMonth()]}</small>` : ''}</span><div class="sym">${c.done ? `<span class="good">${I('circle-check-big')}${c.done}</span>` : ''}${symHtml(dv, 2)}</div></div>`; }).join('')}</div>`;
    }
    LM.marksIn(root);
    bindDom(root);
  }
  /** A week column: the day's things by place (or by kind inside a place), the most important first, the rest counted. */
  function columnBody(dv, idx) {
    const v = CAL.view, ds = idx.ds;
    if (!dv.evs.length) return `<div class="more">${dv.proj ? 'nothing expected' : 'quiet'}</div>`;
    const rank = (e) => ORDER.indexOf(e.kind) + (e.it ? (5 - Math.min(5, e.it.s)) * 0.1 : 0);
    const sorted = dv.evs.slice().sort((a, b) => rank(a) - rank(b) || a.t - b.t);
    if (v.focus.level === 0) {
      const groups = new Map();
      for (const e of sorted) { let g = groups.get(e.place); if (!g) { g = { key: e.place, evs: [], score: 0 }; groups.set(e.place, g); } g.evs.push(e); g.score += (ORDER.length - ORDER.indexOf(e.kind)) * weight(e); }
      const list = [...groups.values()].sort((a, b) => b.score - a.score).slice(0, 5);
      return list.map((g) => { const info = LM.landInfo(ds, v.lens, g.key); const cap = 3; return `<div class="grp"><div class="gh" data-place="${esc(g.key)}"><span class="h-${info.hue}" style="display:inline-flex;color:var(--h)">${lmSvg(info.lm, 13)}</span>${esc(info.name)}<em>${g.evs.length}</em></div>${g.evs.slice(0, cap).map((e) => evHtml(e, { pic: v.zoom === 'week' })).join('')}${g.evs.length > cap ? `<div class="more" data-place="${esc(g.key)}">+${g.evs.length - cap} more in ${esc(info.name)}</div>` : ''}</div>`; }).join('') + (groups.size > 5 ? `<div class="more" data-day="${dv.k}">and ${groups.size - 5} more places</div>` : '');
    }
    const groups = new Map();
    for (const e of sorted) { let g = groups.get(e.kind); if (!g) { g = { kind: e.kind, evs: [] }; groups.set(e.kind, g); } g.evs.push(e); }
    return [...groups.values()].map((g) => `<div class="grp"><div class="gh">${I(KIND[g.kind].ic)}${KIND[g.kind].word}<em>${g.evs.length}</em></div>${g.evs.slice(0, 4).map((e) => evHtml(e)).join('')}${g.evs.length > 4 ? `<div class="more" data-day="${dv.k}">+${g.evs.length - 4} more</div>` : ''}</div>`).join('');
  }
  // ---- the day: the hours with lanes ----
  function renderHours(idx, P) {
    const v = CAL.view, ds = idx.ds, root = $('#dom');
    const k = v.day, D = idx.days.get(k); const dv = dayView(D, v.focus, v.layer, idx);
    const lanes = lanesOf(idx, v.focus, v.layer, k, k + 1, 8);
    const H = 24 * 44, laneW = 100 / Math.max(1, lanes.length);
    const t0 = dayStart(k);
    const axis = Array.from({ length: 25 }, (_, h) => `<div style="top:${h * 44}px">${String(h).padStart(2, '0')}:00</div>`).join('');
    const lines = Array.from({ length: 25 }, (_, h) => `<div class="hl" style="top:${h * 44}px"></div>`).join('');
    const nowl = k === idx.nowK ? `<div class="nowl" style="top:${((idx.now - t0) / HOUR) * 44}px"></div>` : '';
    const laneHtml = lanes.map((L, li) => {
      const evs = L.days.get(k) || [];
      const byHour = new Map(); for (const e of evs) { const h = Math.floor((e.t - t0) / HOUR); if (!byHour.has(h)) byHour.set(h, []); byHour.get(h).push(e); }
      const heat = [...byHour.entries()].map(([h, es]) => `<div class="heat h-${L.hue}" style="top:${h * 44 + 2}px;height:40px;opacity:${Math.min(1, 0.3 + es.length * 0.12).toFixed(2)}"></div>`).join('');
      const cards = [...byHour.entries()].map(([h, es]) => { const rank = (e) => ORDER.indexOf(e.kind); es.sort((a, b) => rank(a) - rank(b)); const shown = es.slice(0, 2); return shown.map((e, i) => `<div class="ev${e.proj ? ' ghost' : ''}" data-ev="${e.id}" style="top:${h * 44 + 2 + i * 20}px;left:${(i * 6)}%;right:2%" title="${esc(evTitle(e))}"><span class="g f-${KIND[e.kind].hue} sm">${I(KIND[e.kind].ic)}</span><span class="et">${esc(evShort(e))}<small>${esc(KIND[e.kind].word)} · ${fmtTime(e.t)}${e.who ? ' · ' + esc(e.who.name) : ''}</small></span></div>`).join('') + (es.length > 2 ? `<div class="more" style="position:absolute;top:${h * 44 + 44}px;right:4%;z-index:2" data-hour="${h}" data-lane="${esc(L.key)}">+${es.length - 2} at ${String(h).padStart(2, '0')}:00</div>` : ''); }).join('');
      return `<div class="lane${v.sel && v.sel.lane === L.key ? ' sel' : ''}" style="left:${(li * laneW).toFixed(2)}%;width:calc(${laneW.toFixed(2)}% - 6px)">${heat}${cards}</div>`;
    }).join('');
    root.innerHTML = `<div class="hours"><div></div><div class="lanes">${lanes.map((L) => `<div class="lh h-${L.hue}" data-lane="${esc(L.key)}" ${v.focus.level === 0 ? `data-place="${esc(L.key)}"` : L.it ? `data-it="${esc(L.key)}"` : ''}><span class="lmk" style="color:var(--h)">${v.focus.level === 0 ? lmSvg(L.lm) : I(L.it ? (LM.KINDS[L.it.k] || LM.KINDS.task)[1] : 'map-pin')}</span>${esc(L.name)}<em>${(L.days.get(k) || []).length}</em></div>`).join('') || `<div class="lh">quiet</div>`}</div><div class="scroll"><div style="position:relative;height:${H}px"><div class="axis">${axis}</div><div class="field" style="height:${H}px">${lines}${nowl}${laneHtml}</div></div></div></div>`;
    LM.marksIn(root);
    bindDom(root);
    const sc = root.querySelector('.scroll'); const first = dv.evs.length ? Math.min(...dv.evs.map((e) => e.t)) : t0 + 8 * HOUR; sc.scrollTop = Math.max(0, ((first - t0) / HOUR) * 44 - 60);
  }
  function bindDom(root) {
    root.addEventListener('click', (e) => {
      const ev = e.target.closest('[data-ev]'); const place = e.target.closest('[data-place]'); const go = e.target.closest('[data-go]'); const day = e.target.closest('[data-day]'); const it = e.target.closest('[data-it]');
      if (ev) { const x = evById(ev.dataset.ev); if (x) { CAL.select({ ev: x }); return; } }
      if (go && day) { CAL.select({ day: Number(day.dataset.day), filter: go.dataset.go }); return; }
      if (place) { CAL.dive(1, place.dataset.place); return; }
      if (it) { CAL.dive(2, it.dataset.it); return; }
      if (day) { const k = Number(day.dataset.day); if (CAL.view.zoom === 'quarter' || CAL.view.zoom === 'month') { CAL.view.day = k; CAL.view.zoom = 'week'; } CAL.select({ day: k }); }
    }, { once: true });
  }

  // ================= the river and the strata (canvas) =================
  const C = {}; // theme colours, read on boot
  const readTheme = () => { const cs = getComputedStyle(document.documentElement); const v = (n) => cs.getPropertyValue(n).trim(); C.fg = v('--fg') || '#f2f6ff'; C.muted = v('--muted') || '#aab6d3'; C.sea = v('--ground-base') || '#102b6b'; C.light = document.documentElement.dataset.pt === 'sky'; C.hue = {}; for (const h of ['sky', 'violet', 'warm', 'lime', 'rules', 'gold', 'slate', 'heat', 'sharp', 'drift']) C.hue[h] = v('--f-' + h) || '#8fb4ff'; C.hue.ai = v('--ai'); C.hue.good = v('--good'); C.hue.block = v('--block-h'); C.hue.hold = v('--hold-h'); C.hue.acc = v('--acc'); C.hue.lucid = v('--ai'); C.hue.task = v('--acc'); C.kind = { good: C.hue.good, block: C.hue.block, hold: C.hue.hold, rules: C.hue.rules, lime: C.hue.lime, ai: C.hue.ai, gold: C.hue.gold, slate: C.hue.slate }; };
  const rgba = (hex, a) => { if (!hex) return `rgba(143,180,255,${a})`; if (hex.startsWith('rgb')) return hex.replace(/rgba?\(([^)]+)\)/, (m, g) => `rgba(${g.split(',').slice(0, 3).join(',')},${a})`); const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
  const pathCache = new Map();
  const icon = (ctx, name, x, y, size, color, lw = 2) => { const d = LM.ICONS[name]; if (!d) return; let P = pathCache.get(name); if (!P) { P = new Path2D(d); pathCache.set(name, P); } ctx.save(); ctx.translate(x - size / 2, y - size / 2); ctx.scale(size / 24, size / 24); ctx.lineWidth = lw * (24 / size); ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(P); ctx.restore(); };
  const landmark = (ctx, key, x, y, size, color) => { const L = LM.LANDMARKS[LM.LANDMARKS[key] ? key : 'keep']; let P = pathCache.get('lm:' + key); if (!P) { P = new Path2D(L.d); pathCache.set('lm:' + key, P); } ctx.save(); ctx.translate(x - size / 2, y - size / 2); ctx.scale(size / 48, size / 48); ctx.fillStyle = color; ctx.fill(P); ctx.restore(); };
  const halo = (ctx, text, x, y, size, weight, color, align = 'left', maxW, display) => { ctx.font = `${weight} ${size}px ${display ? 'Sora, Figtree, sans-serif' : 'Figtree, system-ui, sans-serif'}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(3, size * 0.3); ctx.strokeStyle = rgba(C.light ? '#ffffff' : '#02061a', C.light ? 0.9 : 0.75); ctx.strokeText(text, x, y, maxW); ctx.fillStyle = color; ctx.fillText(text, x, y, maxW); };
  const ellip = (ctx, text, maxW) => { if (ctx.measureText(text).width <= maxW) return text; let lo = 0, hi = text.length; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (ctx.measureText(text.slice(0, mid) + '…').width <= maxW) lo = mid; else hi = mid - 1; } return text.slice(0, Math.max(1, lo)).trimEnd() + '…'; };
  const rrect = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  CAL.hits = [];
  const hit = (x0, y0, x1, y1, act) => CAL.hits.push({ x0, y0, x1, y1, act });

  /** The buckets of the period: days, or the hours of one day. */
  const buckets = (idx, P) => {
    const v = CAL.view;
    if (v.zoom !== 'day') { const out = []; for (let k = P.k0; k < P.k1; k++) { const dv = dayView(idx.days.get(k), v.focus, v.layer, idx); out.push({ key: k, t0: dayStart(k), t1: dayStart(k) + DAY, dv, evs: dv.evs, label: String(dateOf(k).getDate()), proj: k > idx.nowK, today: k === idx.nowK, wk: weekendOf(k, idx.ds) }); } return out; }
    const D = idx.days.get(v.day); const dv = dayView(D, v.focus, v.layer, idx); const t0 = dayStart(v.day); const out = [];
    for (let h = 0; h < 24; h++) { const evs = dv.evs.filter((e) => e.t >= t0 + h * HOUR && e.t < t0 + (h + 1) * HOUR); const vol = evs.reduce((p, e) => p + weight(e), 0); out.push({ key: v.day * 100 + h, t0: t0 + h * HOUR, t1: t0 + (h + 1) * HOUR, dv: { ...dv, evs, vol, counts: {} }, evs, label: `${String(h).padStart(2, '0')}:00`, proj: t0 + h * HOUR > idx.now, today: false, hour: h }); }
    return out;
  };

  function drawCanvas(idx, P) {
    const cv = $('#cv'), S = $('#surface'); const W = S.clientWidth, H = S.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    if (cv.width !== W * dpr || cv.height !== H * dpr) { cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; }
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    CAL.hits = [];
    const B = buckets(idx, P);
    if (CAL.view.viz === 'river') drawRiver(ctx, W, H, idx, P, B); else drawStrata(ctx, W, H, idx, P, B);
  }

  // ---- the river: time left to right; a stream per place; the Now shoreline ----
  function drawRiver(ctx, W, H, idx, P, B) {
    const v = CAL.view, ds = idx.ds, LEFT = 150, TOP = 34;
    const n = B.length, bw = (W - LEFT) / n;
    const x0 = (i) => LEFT + i * bw, xc = (i) => LEFT + (i + 0.5) * bw;
    const lanes = lanesOf(idx, v.focus, v.layer, P.k0, P.k1, Math.max(3, Math.min(12, Math.floor((H - TOP) / 54))));
    const laneH = lanes.length ? (H - TOP - 8) / lanes.length : H - TOP;
    const lensT = v.zoom === 'day' ? 'hour' : 'day';
    // the days: weekend shade, labels, today
    for (let i = 0; i < n; i++) { const b = B[i]; if (b.wk) { ctx.fillStyle = rgba(C.fg, C.light ? 0.05 : 0.04); ctx.fillRect(x0(i), TOP, bw, H - TOP); } if (b.proj) { ctx.fillStyle = rgba(C.fg, 0.025); ctx.fillRect(x0(i), TOP, bw, H - TOP); } }
    const every = v.zoom === 'quarter' ? 7 : v.zoom === 'month' ? 7 : v.zoom === 'week' ? 1 : 2;
    for (let i = 0; i < n; i++) { const b = B[i]; const first = lensT === 'day' && (i === 0 || (v.zoom !== 'week' ? ((b.key - P.k0) % 7 === 0) : true)); if (lensT === 'hour' ? i % every === 0 : first) { const d = dateOf(b.key); const lab = lensT === 'hour' ? b.label : v.zoom === 'week' ? `${WD[d.getDay()]} ${d.getDate()}` : `${MO[d.getMonth()]} ${d.getDate()}`; halo(ctx, lab, x0(i) + 4, 14, 12, 600, b.today ? C.fg : C.muted); ctx.fillStyle = rgba(C.fg, 0.12); ctx.fillRect(x0(i), TOP, 1, H - TOP); } }
    // the lanes
    const vols = lanes.map((L) => B.map((b) => (L.days.get(lensT === 'day' ? b.key : null) || (lensT === 'hour' ? b.evs.filter((e) => (v.focus.level === 0 ? e.place : e.it ? e.it.id : '_other') === L.key || L.key === '_more') : [])).reduce((p, e) => p + weight(e), 0)));
    const maxV = Math.max(0.001, ...vols.flat());
    lanes.forEach((L, li) => {
      const y = TOP + laneH * (li + 0.5); const col = C.hue[L.hue] || C.hue.slate; const half = laneH * 0.42;
      // smooth thickness
      const th = vols[li].map((x, i) => { const a = vols[li][i - 1] ?? x, b = vols[li][i + 1] ?? x; return 2 + ((a + 2 * x + b) / 4 / maxV) * half; });
      const futureFrom = B.findIndex((b) => b.proj);
      const band = (from, to, dashed) => { if (to <= from) return; ctx.beginPath(); for (let i = from; i < to; i++) { const xx = xc(i); if (i === from) ctx.moveTo(x0(i), y - th[i]); ctx.lineTo(xx, y - th[i]); } ctx.lineTo(x0(to - 1) + bw, y - th[to - 1]); ctx.lineTo(x0(to - 1) + bw, y + th[to - 1]); for (let i = to - 1; i >= from; i--) ctx.lineTo(xc(i), y + th[i]); ctx.lineTo(x0(from), y + th[from]); ctx.closePath(); ctx.fillStyle = rgba(col, dashed ? 0.12 : 0.3); ctx.fill(); ctx.setLineDash(dashed ? [5, 5] : []); ctx.lineWidth = 1.2; ctx.strokeStyle = rgba(col, dashed ? 0.55 : 0.7); ctx.stroke(); ctx.setLineDash([]); };
      if (futureFrom === -1) band(0, n, false); else if (futureFrom === 0) band(0, n, true); else { band(0, futureFrom + 1, false); band(futureFrom, n, true); }
      // the lane's name
      ctx.fillStyle = rgba(C.sea, 0.001);
      if (v.focus.level === 0) landmark(ctx, L.lm, 22, y, 22, rgba(col, 1)); else icon(ctx, L.it ? (LM.KINDS[L.it.k] || LM.KINDS.task)[1] : 'map-pin', 22, y, 16, rgba(col, 1));
      ctx.font = `600 13px Sora, Figtree, sans-serif`; halo(ctx, ellip(ctx, L.name, LEFT - 46), 38, y - (v.focus.level === 0 ? 7 : 0), 13, 600, C.fg, 'left', undefined, true);
      if (v.focus.level === 0) { const tot = (lensT === 'day' ? [...L.days.values()].flat() : []).length; halo(ctx, `${tot || Math.round(L.vol)} this period`, 38, y + 9, 11, 500, C.muted); }
      hit(0, y - laneH / 2, LEFT - 6, y + laneH / 2, v.focus.level === 0 ? { place: L.key, title: L.name } : L.it ? { it: L.it, title: L.name } : { title: L.name });
      // the marks on the stream
      for (let i = 0; i < n; i++) {
        const evs = lensT === 'day' ? (L.days.get(B[i].key) || []) : B[i].evs.filter((e) => (v.focus.level === 0 ? e.place : e.it ? e.it.id : '_other') === L.key || L.key === '_more');
        if (!evs.length) continue;
        const c = {}; for (const e of evs) c[e.kind] = (c[e.kind] || 0) + 1;
        const x = xc(i), yy = y;
        if (bw < 46) {
          // aggregate: a bead for the harvest, one icon per problem kind above
          if (c.done) { const r = Math.min(half * 0.9, 2.5 + Math.sqrt(c.done) * 1.6); ctx.beginPath(); ctx.arc(x, yy, r, 0, Math.PI * 2); ctx.fillStyle = rgba(C.hue.good, B[i].proj ? 0.45 : 0.95); ctx.fill(); if (B[i].proj) { ctx.setLineDash([2, 2]); ctx.strokeStyle = rgba(C.hue.good, 0.9); ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]); } }
          let up = yy - th[i] - 8; for (const kind of ['blocked', 'asked', 'resolved', 'decided', 'landmark']) { if (!c[kind]) continue; const K = KIND[kind]; icon(ctx, K.ic, x, up, 12, rgba(C.kind[K.hue], 1), 2.4); if (c[kind] > 1) halo(ctx, String(c[kind]), x + 8, up - 4, 9, 700, C.fg); up -= 14; }
          hit(x0(i), yy - laneH / 2, x0(i) + bw, yy + laneH / 2, { day: B[i].key, lane: L.key, title: `${L.name} · ${lensT === 'day' ? fmtDay(B[i].key) : B[i].label} · ${evs.length} things` });
        } else {
          // named marks, the most important first, alternating above and below the stream
          const rank = (e) => ORDER.indexOf(e.kind); evs.sort((a, b) => rank(a) - rank(b));
          const rowsEach = Math.max(1, Math.floor((laneH / 2 - th[i] - 4) / 17)); const maxN = rowsEach * 2; const shown = evs.slice(0, maxN);
          shown.forEach((e, j) => { const K = KIND[e.kind]; const above = j % 2 === 0; const row = Math.floor(j / 2); const ey = above ? yy - th[i] - 9 - row * 17 : yy + th[i] + 9 + row * 17; const ex = x0(i) + 6; icon(ctx, K.ic, ex + 7, ey, 12, rgba(C.kind[K.hue], e.proj ? 0.6 : 1), 2.4); ctx.font = `600 11.5px Figtree, system-ui, sans-serif`; const label = ellip(ctx, evShort(e), bw - 22); halo(ctx, label, ex + 17, ey, 11.5, 600, e.proj ? C.muted : C.fg); hit(ex, ey - 8, x0(i) + bw - 2, ey + 8, { ev: e, title: evTitle(e) }); });
          if (evs.length > shown.length) halo(ctx, `+${evs.length - shown.length}`, x0(i) + bw - 6, yy, 10, 700, C.muted, 'right');
        }
      }
    });
    if (!lanes.length) halo(ctx, 'Nothing happened here in this period', W / 2, H / 2, 14, 600, C.muted, 'center');
    // the Now shoreline
    const nowI = B.findIndex((b) => idx.now >= b.t0 && idx.now < b.t1);
    if (nowI >= 0) { const x = x0(nowI) + ((idx.now - B[nowI].t0) / (B[nowI].t1 - B[nowI].t0)) * bw; ctx.fillStyle = rgba(C.fg, 0.9); ctx.fillRect(x - 1, TOP - 6, 2, H - TOP + 6); ctx.shadowColor = rgba(C.fg, 0.8); ctx.shadowBlur = 8; ctx.fillRect(x - 1, TOP - 6, 2, H - TOP + 6); ctx.shadowBlur = 0; halo(ctx, 'now', x + 6, TOP - 10, 11, 700, C.fg); }
  }

  // ---- the strata: vertical time, today at the surface, the past as layers below, the future as scaffolding above ----
  function drawStrata(ctx, W, H, idx, P, B) {
    const v = CAL.view, LEFT = 96, TOP = 10;
    const lanes = lanesOf(idx, v.focus, v.layer, P.k0, P.k1, Math.max(2, Math.min(10, Math.floor((W - LEFT) / 110))));
    const laneW = (W - LEFT - 8) / Math.max(1, lanes.length);
    const lensT = v.zoom === 'day' ? 'hour' : 'day';
    const base = v.zoom === 'quarter' ? 11 : v.zoom === 'month' ? 30 : v.zoom === 'week' ? 110 : 42;
    const maxV = Math.max(0.001, ...B.map((b) => b.dv.vol));
    const hs = B.map((b) => base * (0.5 + 1.5 * Math.min(1, b.dv.vol / maxV)));
    const total = hs.reduce((p, q) => p + q, 0) + 40;
    // order: the latest at the top (future above the surface), down into the past
    const order = B.map((b, i) => i).reverse();
    const ys0 = []; { let y0 = TOP; for (const i of order) { ys0[i] = y0; y0 += hs[i]; } }
    const initKey = [v.ds, v.lens, v.zoom, v.day, v.layer, v.focus.key].join('|');
    if (CAL.strataInit !== initKey) { CAL.strataInit = initKey; const ti = B.findIndex((b) => b.today); const yT = ti >= 0 ? ys0[ti] + hs[ti] : ys0[order[0]]; v.strataScroll = Math.max(0, Math.min(Math.max(0, total - H + 60), yT - H * 0.38)); }
    const ys = []; let y = TOP - v.strataScroll; for (const i of order) { ys[i] = y; y += hs[i]; }
    CAL.strataTotal = total;
    // the lane heads
    lanes.forEach((L, li) => { const x = LEFT + li * laneW; const col = C.hue[L.hue] || C.hue.slate; if (v.focus.level === 0) landmark(ctx, L.lm, x + 14, 16, 18, rgba(col, 1)); else icon(ctx, L.it ? (LM.KINDS[L.it.k] || LM.KINDS.task)[1] : 'map-pin', x + 14, 16, 14, rgba(col, 1)); ctx.font = `600 12.5px Sora, Figtree, sans-serif`; halo(ctx, ellip(ctx, L.name, laneW - 34), x + 28, 16, 12.5, 600, C.fg, 'left', undefined, true); hit(x, 4, x + laneW - 6, 28, v.focus.level === 0 ? { place: L.key, title: L.name } : L.it ? { it: L.it, title: L.name } : { title: L.name }); });
    ctx.save(); ctx.beginPath(); ctx.rect(0, 30, W, H - 30); ctx.clip();
    for (const i of order) {
      const b = B[i], yy = ys[i] + 30, h = hs[i]; if (yy + h < 30 || yy > H) continue;
      // the layer
      ctx.fillStyle = rgba(C.fg, b.proj ? 0.02 : b.wk ? 0.03 : 0.055 + 0.05 * Math.min(1, b.dv.vol / maxV)); ctx.fillRect(LEFT, yy, W - LEFT, h);
      if (b.proj) { ctx.setLineDash([4, 5]); ctx.strokeStyle = rgba(C.fg, 0.25); ctx.lineWidth = 1; ctx.strokeRect(LEFT + 0.5, yy + 0.5, W - LEFT - 1, h - 1); ctx.setLineDash([]); } else { ctx.fillStyle = rgba(C.fg, 0.1); ctx.fillRect(LEFT, yy + h - 1, W - LEFT, 1); }
      // the date on the left
      const showLab = lensT === 'hour' ? b.hour % 2 === 0 : (v.zoom === 'quarter' ? (b.key - P.k0) % 7 === 0 : true);
      if (showLab && h >= 10) { const d = dateOf(b.key); const lab = lensT === 'hour' ? b.label : v.zoom === 'week' ? `${WD[d.getDay()]} ${d.getDate()}` : v.zoom === 'month' ? `${d.getDate()}${d.getDate() === 1 ? ' ' + MO[d.getMonth()] : ''}` : `${MO[d.getMonth()]} ${d.getDate()}`; halo(ctx, lab, LEFT - 8, yy + Math.min(h / 2, 12), 11.5, b.today ? 700 : 500, b.today ? C.fg : C.muted, 'right'); }
      if (b.today) { ctx.fillStyle = rgba(C.fg, 0.9); ctx.fillRect(LEFT - 4, yy + h - 1.5, W - LEFT + 4, 3); halo(ctx, 'today', LEFT - 8, yy + h - 1, 10.5, 700, C.fg, 'right'); }
      hit(0, yy, LEFT, yy + h, { day: b.key, title: lensT === 'hour' ? b.label : fmtDayLong(b.key) });
      // the grains per lane
      lanes.forEach((L, li) => {
        const evs = lensT === 'day' ? (L.days.get(b.key) || []) : b.evs.filter((e) => (v.focus.level === 0 ? e.place : e.it ? e.it.id : '_other') === L.key || L.key === '_more');
        if (!evs.length) return;
        const x = LEFT + li * laneW + 6, wAvail = laneW - 12;
        const rank = (e) => ORDER.indexOf(e.kind); evs.sort((a, b2) => rank(a) - rank(b2));
        const big = h >= 60 && wAvail >= 100;
        if (big) {
          const rowH = 20, cols = Math.max(1, Math.floor(wAvail / 150)), colW = wAvail / cols, rows = Math.max(1, Math.floor((h - 6) / rowH)); const cap = rows * cols; const shown = evs.slice(0, cap - (evs.length > cap ? 1 : 0));
          shown.forEach((e, j) => { const K = KIND[e.kind]; const cx = x + (j % cols) * colW, cy = yy + 10 + Math.floor(j / cols) * rowH; if (e.kind === 'done' && e.it && colW >= 150 && rowH >= 20) { ctx.save(); rrect(ctx, cx, cy - 8, 22, 16, 3); ctx.clip(); LM.drawPic(ctx, e.it, e.proj ? { s: 'todo' } : { s: 'done', done: true }, cx, cy - 8, 22, 16, e.proj ? 0.5 : 1); ctx.restore(); } else icon(ctx, K.ic, cx + 11, cy, 12, rgba(C.kind[K.hue], e.proj ? 0.6 : 1), 2.4); ctx.font = `500 11.5px Figtree, system-ui, sans-serif`; halo(ctx, ellip(ctx, evShort(e), colW - 34), cx + 28, cy, 11.5, e.kind === 'blocked' || e.kind === 'resolved' || e.kind === 'asked' ? 600 : 500, e.proj ? C.muted : C.fg); hit(cx, cy - 9, cx + colW - 4, cy + 9, { ev: e, title: evTitle(e) }); });
          if (evs.length > shown.length) halo(ctx, `+${evs.length - shown.length} more`, x + wAvail - 4, yy + h - 10, 10.5, 600, C.muted, 'right');
        } else {
          // grains: stones for the harvest, cracks for problems, signposts and flags as symbols
          const r = Math.max(2, Math.min(5, h / 4)); const step = r * 2 + 3; const per = Math.max(1, Math.floor(wAvail / step)); const rows = Math.max(1, Math.floor((h - 2) / step)); const cap = per * rows;
          evs.slice(0, cap).forEach((e, j) => { const K = KIND[e.kind]; const cx = x + r + (j % per) * step, cy = yy + 1 + r + Math.floor(j / per) * step; const col = C.kind[K.hue]; if (e.kind === 'blocked' || e.kind === 'resolved') { ctx.beginPath(); ctx.moveTo(cx - r, cy + r * 0.6); ctx.lineTo(cx - r * 0.3, cy - r * 0.6); ctx.lineTo(cx + r * 0.3, cy + r * 0.4); ctx.lineTo(cx + r, cy - r * 0.6); ctx.lineWidth = 1.8; ctx.strokeStyle = rgba(col, 1); ctx.stroke(); } else if (e.kind === 'decided' || e.kind === 'asked' || e.kind === 'landmark') { if (r >= 4) icon(ctx, K.ic, cx, cy, r * 2, rgba(col, 1), 2.6); else { ctx.fillStyle = rgba(col, 1); ctx.fillRect(cx - r * 0.5, cy - r, r, r * 2); } } else { ctx.beginPath(); ctx.arc(cx, cy, e.kind === 'done' ? r : r * 0.7, 0, Math.PI * 2); ctx.fillStyle = rgba(col, e.proj ? 0.45 : e.kind === 'done' ? 0.95 : 0.6); ctx.fill(); if (e.proj) { ctx.setLineDash([2, 2]); ctx.strokeStyle = rgba(col, 0.9); ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]); } } });
          if (evs.length > cap) halo(ctx, `+${evs.length - cap}`, x + wAvail - 2, yy + h / 2, 9.5, 700, C.muted, 'right');
          hit(x, yy, x + wAvail, yy + h, { day: b.key, lane: L.key, title: `${L.name} · ${lensT === 'hour' ? b.label : fmtDay(b.key)} · ${evs.length} things` });
        }
      });
    }
    ctx.restore();
    if (!lanes.length) halo(ctx, 'Nothing happened here in this period', W / 2, H / 2, 14, 600, C.muted, 'center');
  }

  // ================= the panel: the context of what was clicked =================
  function renderPanel(idx) {
    const P = $('#panel'), v = CAL.view, ds = idx.ds, s = v.sel || { day: v.day };
    const back = s.day === undefined || s.day !== idx.nowK || s.filter ? `<button class="chip sm" id="pback" title="Today">${I('sun-medium')}<span>Today</span></button>` : '';
    let head = '', body = '';
    if (s.ev) { body = evContext(s.ev, idx); const K = KIND[s.ev.kind]; head = `<div class="fh"><span class="g f-${K.hue}">${I(K.ic)}</span><div class="fhl"><span class="lbl2">${K.word} · ${fmtDay(s.ev.k)}</span><span class="ttl t2">${esc(evShort(s.ev))}</span></div>${back}</div>`; }
    else {
      const k = s.day, D = idx.days.get(k), dv = dayView(D, v.focus, 'all', idx);
      const d = dateOf(k);
      const where = v.focus.level === 0 ? ds.name : v.focus.level === 1 ? LM.landInfo(ds, v.lens, v.focus.key).name : (ds.byId.get(v.focus.key) || { short: v.focus.key }).short;
      head = `<div class="fh"><span class="g f-${dv.proj ? 'slate' : k === idx.nowK ? 'gold' : 'acc'}">${I(dv.proj ? 'circle-dashed' : k === idx.nowK ? 'sun-medium' : 'calendar')}</span><div class="fhl"><span class="lbl2">${dv.proj ? 'Ahead' : k === idx.nowK ? 'Today' : 'A day'} · ${esc(where)}</span><span class="ttl t2">${fmtDayLong(k)}</span></div>${back}</div>`;
      const c = dv.counts;
      const sum = `<div class="fsum">${c.done ? `<span class="k good">${I('circle-check-big')}${c.done} ${dv.proj ? 'expected' : 'finished'}</span>` : ''}${c.started ? `<span class="k lime">${I('sprout')}${c.started} ${dv.proj ? 'to start' : 'started'}</span>` : ''}${c.blocked ? `<span class="k block">${I('construction')}${c.blocked} stuck</span>` : ''}${dv.still ? `<span class="k hold" style="color:var(--hold-h)">${I('hourglass')}${dv.still} still</span>` : ''}${c.resolved ? `<span class="k good">${I('badge-check')}${c.resolved} resolved</span>` : ''}${c.enabled ? `<span class="k good">${I('route')}${c.enabled} enabled</span>` : ''}${c.decided ? `<span class="k rules">${I('signpost')}${c.decided} decided</span>` : ''}${c.asked ? `<span class="k rules">${I('message-circle-question')}${c.asked} asked</span>` : ''}${c.landmark ? `<span class="k" style="color:var(--f-gold)">${I('milestone')}${c.landmark} gate</span>` : ''}${dv.cost ? `<span class="k mut">${I('flame')}${LM.fmtMoney(dv.cost)}</span>` : ''}${!dv.evs.length ? `<span class="k mut">${dv.proj ? 'Nothing expected' : 'A quiet day'}</span>` : ''}</div>`;
      const groups = new Map(); for (const e of dv.evs) { if (!groups.has(e.kind)) groups.set(e.kind, []); groups.get(e.kind).push(e); }
      const order = s.filter ? [s.filter, ...ORDER.filter((x) => x !== s.filter)] : ORDER;
      let rows = '';
      // carried forward: on today, the asks that still wait, with their age
      if (k === idx.nowK && v.focus.level === 0) { const waiting = LM.openAsks(ds, idx.now).sort((a, b) => (b.to === 'owner') - (a.to === 'owner') || a.b - b.b); if (waiting.length) rows += `<div class="fgroup"><span class="lbl2 row" style="gap:6px">${I('message-circle-question')}Still waiting <em class="n">${waiting.length}</em></span>${waiting.map((a) => { const e = idx.events.find((x) => x.a === a); return e ? evHtml(e, { who: false }).replace('<small>', `<small>waits ${LM.dur(idx.now - a.b)} · `) : ''; }).join('')}</div>`; }
      for (const kind of order) { const xs = groups.get(kind); if (!xs || !xs.length) continue; const K = KIND[kind]; const sorted = xs.slice().sort((a, b) => a.t - b.t); rows += `<div class="fgroup"><span class="lbl2 row" style="gap:6px">${I(K.ic)}${dv.proj ? (kind === 'done' ? 'Expected to finish' : kind === 'started' ? 'Expected to start' : K.word) : K.word} <em class="n">${xs.length}</em></span>${sorted.map((e) => evHtml(e)).join('')}</div>`; }
      if (dv.front) rows = `<div class="explain"><b>A front.</b> ${dv.front} projected finish${dv.front > 1 ? 'es' : ''} land after the gate on this day.</div>` + rows;
      if (dv.crew.length) rows += `<div class="fgroup"><span class="lbl2 row" style="gap:6px">${I('users')}Who worked <em class="n">${dv.crew.length}</em></span><div class="row" style="gap:10px;flex-wrap:wrap;padding:4px 8px">${dv.crew.slice(0, 10).map(({ w, n }) => `<span class="row" style="gap:6px">${av(w)}<span>${esc(w.name)} <em class="mut">· ${n}</em></span></span>`).join('')}</div></div>`;
      if (dv.proj && dv.evs.length) rows += `<div class="explain"><b>Projected.</b> ${esc(CAL.synthetic)}; the pace: ${idx.pace.toFixed(1)} days per size unit.</div>`;
      const mapLink = `../living-map-2/?d=${ds.key}&lens=${v.lens}&t=${encodeURIComponent(new Date(Math.min(idx.now, dayStart(k) + 18 * HOUR)).toISOString().slice(0, 16))}&time=1`;
      body = sum + `<div class="row" style="gap:6px;flex-wrap:wrap"><a class="chip sm" href="${mapLink}" target="_blank" title="The living map at this day">${I('map')}<span>Show on the map</span></a>${v.zoom !== 'day' ? `<button class="chip sm" id="phours">${I('history')}<span>The hours</span></button>` : ''}</div><div class="fl2" id="plist">${rows || `<div class="fempty">${I('check')}<span>${dv.proj ? 'Nothing is expected on this day.' : 'Nothing happened here on this day.'}</span></div>`}</div>`;
    }
    P.innerHTML = head + body; LM.marksIn(P);
    P.querySelectorAll('[data-ev]').forEach((el) => { el.onclick = () => { const e = evById(el.dataset.ev); if (e) CAL.select({ ev: e }); }; });
    const b = P.querySelector('#pback'); if (b) b.onclick = () => { v.day = idx.nowK; CAL.select({ day: idx.nowK }); };
    const h = P.querySelector('#phours'); if (h) h.onclick = () => { v.day = s.day; v.zoom = 'day'; CAL.render(); };
    P.querySelectorAll('[data-it]').forEach((el) => { el.onclick = () => CAL.dive(2, el.dataset.it); });
    P.querySelectorAll('[data-place]').forEach((el) => { el.onclick = () => CAL.dive(1, el.dataset.place); });
    P.querySelectorAll('[data-day]').forEach((el) => { el.onclick = () => { v.day = Number(el.dataset.day); CAL.select({ day: v.day }); }; });
  }
  /** The context of one thing: the task with its picture, its life as moments; a decision; an ask; a landmark. */
  function evContext(e, idx) {
    const ds = idx.ds, v = CAL.view;
    if (e.it) {
      const it = e.it, st = LM.stateAt(ds, it, idx.now), who = LM.who(it); const info = LM.landInfo(ds, v.lens, it.g[v.lens]);
      const moms = idx.events.filter((x) => x.it === it || (x.by && x.by.includes(it))).sort((a, b) => a.t - b.t);
      const a = it.a || {};
      return `<div class="fl2" id="plist"><div class="ctxpic">${LM.picSvg(it, st)}</div>
        <div class="row" style="gap:6px;flex-wrap:wrap">${glyph(it.k)}<span>${esc(st ? LM.STATUS_WORD[st.s] : 'Not yet')}</span>${av(who)}<span>${esc(who.name)}</span><span class="chip sm" data-place="${esc(it.g[v.lens])}">${lmSvg(info.lm, 13)}<span>${esc(info.name)}</span></span><span class="chip sm" data-it="${esc(it.id)}">${I('calendar')}<span>Its days</span></span></div>
        <div class="explain">${esc(it.n)}${a.kind ? `<br><b>${esc(LM.PIC_KINDS[a.kind] || a.kind)}</b> · ${esc(a.sub || '')}` : ''}${it.cost ? ` · ${LM.fmtMoney(st ? st.cost : 0)} so far` : ''} · size ${it.s}${it.dep.length ? ` · waits on ${it.dep.length}` : ''}</div>
        <span class="lbl2">Its life · ${moms.length} moments</span>${moms.map((m) => { const K = KIND[m.kind]; return `<div class="mom" data-day="${m.k}"><span class="g f-${K.hue} sm">${I(K.ic)}</span><span class="mt">${esc(K.word)}${m.kind === 'enabled' && m.by ? ` by ${esc(m.by.map((b) => b.short).join(', '))}` : ''}${m.proj ? ' <em class="mut">(expected)</em>' : ''}<small>${fmtDay(m.k)} · ${fmtTime(m.t)}${m.proj && m.why ? ' · ' + esc(m.why) : ''}</small></span></div>`; }).join('')}</div>`;
    }
    if (e.dec) { const d = e.dec; const refs = (d.refs || []).map((id) => ds.byId.get(id)).filter(Boolean); return `<div class="fl2" id="plist"><div class="explain"><b>${esc(d.id)}</b> · decided by the ${esc(d.who || 'owner')} on ${fmtDayLong(e.k)}.<br>${esc(d.n.replace(/\*\*/g, ''))}</div>${refs.length ? `<span class="lbl2">What followed · ${refs.length}</span>${refs.slice(0, 20).map((it) => `<div class="mom" data-it="${esc(it.id)}">${glyph(it.k, 'sm')}<span class="mt">${esc(it.short)}<small>${esc(LM.STATUS_WORD[(LM.stateAt(ds, it, idx.now) || { s: 'todo' }).s])}</small></span></div>`).join('')}` : ''}</div>`; }
    if (e.a) { const a = e.a; return `<div class="fl2" id="plist"><div class="explain"><b>${a.to === 'owner' ? 'Needs you' : 'Needs the lead'}</b> · asked by ${esc(a.by)} on ${fmtDayLong(e.k)} · waits ${LM.dur(idx.now - a.b)}.<br>${esc(a.n)}</div><div class="acts"><button class="pill pri">${I('check')}<span>Yes</span></button><button class="pill">${I('x')}<span>No</span></button><button class="pill">${I('history')}<span>Later</span></button></div>${e.it ? `<span class="lbl2">The task</span><div class="mom" data-it="${esc(e.it.id)}">${glyph(e.it.k, 'sm')}<span class="mt">${esc(e.it.short)}<small>${esc(LM.STATUS_WORD[(LM.stateAt(ds, e.it, idx.now) || { s: 'todo' }).s])}</small></span></div>` : ''}</div>`; }
    if (e.lm) { const info = LM.landInfo(ds, v.lens, e.place); return `<div class="fl2" id="plist"><div class="explain"><b>${esc(e.lm.n)}</b> · a landmark of ${esc(info.name)}${e.proj ? ', ahead' : ', met'} on ${fmtDayLong(e.k)}.${e.front ? `<br><b>A front:</b> ${e.front} projected finish${e.front > 1 ? 'es' : ''} in ${esc(info.name)} land after it.` : ''}</div></div>`; }
    return '';
  }

  // ---- the key ----
  function renderKey(idx) {
    const K = $('#key'), v = CAL.view;
    const fill = { all: 'how much happened', harvest: 'the size of what finished', problems: 'stuck, resolved and asked', decisions: 'decided, asked, gates', people: 'who worked (how many)', cost: 'what finished cost', projected: 'what is expected' }[v.layer];
    K.innerHTML = `<div class="kh"><span class="row" style="gap:8px">${I('book-marked')}<b>Key</b><span class="meta">fill = ${fill} · dashed = ahead</span></span></div><div class="kl"><div class="kgrid">${ORDER.filter((k) => k !== 'planned' && k !== 'dropped').map((k) => `<span class="kmark"><span class="g f-${KIND[k].hue} sm">${I(KIND[k].ic)}</span>${KIND[k].word}</span>`).join('')}<span class="kmark"><span class="g f-hold sm">${I('hourglass')}</span>Still (nothing moved)</span><span class="kmark"><span class="g f-slate sm" style="outline:1.5px dashed var(--muted);outline-offset:1px">${I('circle-dashed')}</span>Projected</span></div><div class="ksum">${I('info')}<span>${esc(CAL.synthetic || '')}</span></div></div>`;
    LM.marksIn(K);
  }
  // ---- crumbs ----
  function renderCrumbs(idx) {
    const v = CAL.view, ds = idx.ds; const c = $('#crumbs');
    const parts = [`<button class="crumb" data-level="0">${AI()}<span>${esc(ds.name)}</span></button>`];
    if (v.focus.level >= 1) { const key = v.focus.level === 1 ? v.focus.key : (ds.byId.get(v.focus.key) || { g: {} }).g[v.lens]; const info = LM.landInfo(ds, v.lens, key); parts.push(I('chevron-right'), `<button class="crumb" data-level="1" data-key="${esc(key)}"><span class="h-${info.hue}" style="display:inline-flex;color:var(--h)">${lmSvg(info.lm, 14)}</span><span>${esc(info.name)}</span></button>`); }
    if (v.focus.level === 2) { const it = ds.byId.get(v.focus.key); parts.push(I('chevron-right'), `<button class="crumb" data-level="2">${glyph(it ? it.k : 'task', 'sm')}<span>${esc(it ? it.short.slice(0, 28) : v.focus.key)}</span></button>`); }
    c.innerHTML = parts.join(''); LM.marksIn(c);
    c.querySelectorAll('.crumb').forEach((b) => { b.onclick = () => { const l = Number(b.dataset.level); if (l === 0) CAL.dive(0, null); else if (l === 1) CAL.dive(1, b.dataset.key); }; });
  }

  // ---- actions ----
  CAL.select = (s) => { CAL.view.sel = s; if (s && s.day !== undefined) CAL.view.day = s.day; CAL.render(); };
  CAL.dive = (level, key) => { const v = CAL.view; v.focus = { level, key }; if (level === 2) { const idx = idxNow(); const it = idx.ds.byId.get(key); if (it && v.zoom === 'day') v.zoom = 'month'; const first = idx.events.find((e) => e.it === it); if (first && v.zoom !== 'day') { /* keep the period: the task's days are drawn across it */ } } v.sel = { day: v.day }; CAL.render(); say(level === 0 ? 'The whole company.' : level === 1 ? `${LM.landInfo(LM.ds, v.lens, key).name}: its days.` : 'One task: its life across days.'); };
  CAL.step = (dir) => { const v = CAL.view; v.day += dir * (v.zoom === 'quarter' ? 91 : v.zoom === 'month' ? 30 : v.zoom === 'week' ? 7 : 1); if (v.zoom === 'month') { const d = dateOf(v.day); v.day = dayKey(new Date(d.getFullYear(), d.getMonth(), Math.min(d.getDate(), 28)).getTime()); } v.sel = { day: v.day }; CAL.render(); };
  CAL.today = () => { const idx = idxNow(); CAL.view.day = idx.nowK; CAL.select({ day: idx.nowK }); };
  CAL.setZoom = (z, keepDay) => { const v = CAL.view; v.zoom = z; if (keepDay !== undefined) v.day = keepDay; CAL.render(); };
  CAL.zoomStep = (dir, dayUnder) => { const i = ZOOMS.findIndex((z) => z[0] === CAL.view.zoom); const j = Math.max(0, Math.min(ZOOMS.length - 1, i + dir)); if (j === i) return; CAL.setZoom(ZOOMS[j][0], dayUnder); };
  let toastT = 0; function say(msg, ms = 4000) { const t = $('#toast'); t.innerHTML = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), ms); }

  // ---- URL ----
  let urlTimer = 0;
  function writeUrl() { clearTimeout(urlTimer); urlTimer = setTimeout(() => { const v = CAL.view, p = new URLSearchParams(); p.set('d', v.ds); if (v.lens !== 'dept') p.set('lens', v.lens); if (v.viz !== 'tiles') p.set('viz', v.viz); if (v.zoom !== 'week') p.set('zoom', v.zoom); p.set('day', new Date(dayStart(v.day)).toISOString().slice(0, 10)); if (v.focus.level) p.set('focus', v.focus.key); if (v.layer !== 'all') p.set('layer', v.layer); if (v.weekStart) p.set('ws', String(v.weekStart)); if (!v.panel) p.set('panel', '0'); const r = document.documentElement; if (r.dataset.pt !== 'deep') p.set('pt', r.dataset.pt); history.replaceState(null, '', '?' + p.toString()); }, 300); }
  function readUrl() {
    const p = new URLSearchParams(location.search), v = CAL.view; const r = document.documentElement;
    if (p.get('pt')) r.dataset.pt = p.get('pt'); if (p.get('hc') === 'high') r.dataset.hc = 'high';
    if (LM.DATA[p.get('d')]) v.ds = p.get('d'); if (['dept', 'proj', 'people'].includes(p.get('lens'))) v.lens = p.get('lens');
    if (VIZ.some((x) => x[0] === p.get('viz'))) v.viz = p.get('viz'); if (ZOOMS.some((x) => x[0] === p.get('zoom'))) v.zoom = p.get('zoom');
    if (LAYERS.some((x) => x[0] === p.get('layer'))) v.layer = p.get('layer'); if (p.get('ws') === '1') v.weekStart = 1; if (p.get('panel') === '0') v.panel = false;
    return p;
  }

  // ---- the shell ----
  CAL.boot = function boot() {
    const p = readUrl();
    readTheme();
    const root = $('#app');
    root.innerHTML = `
      <div id="cal"><div class="surface" id="surface"><div id="dom"></div><canvas id="cv" hidden></canvas></div></div>
      <nav class="dock" aria-label="Dock">${[['horizon', 'sunrise', 'Horizon'], ['world', 'map', 'World'], ['calendar', 'calendar', 'Calendar'], ['talk', 'AI', 'Talk'], ['more', 'grip', 'More']].map(([k, ic, l]) => `<button class="d${k === 'calendar' ? ' on' : ''}${k === 'talk' ? ' tk' : ''}" data-d="${k}" title="${l}" aria-label="${l}">${ic === 'AI' ? AI() : I(ic)}</button>`).join('')}</nav>
      <div class="top" id="top"><div class="toprow"><nav class="crumbc" id="crumbs" aria-label="Where you are"></nav><div class="seg lensseg" id="lenses">${LENSES.map(([k, n, ic]) => `<span data-lens="${k}" title="${n}">${I(ic)}<span class="lbltx">${n}</span></span>`).join('')}</div><div class="tend" id="tend"><button class="chip" id="today">${I('sun-medium')}<span>Today</span></button><button class="chip icon" id="labc">${I('sliders-horizontal')}<span>Lab</span></button></div></div>
        <div class="toprow2"><div class="seg" id="vizseg">${VIZ.map(([k, n, ic]) => `<span data-viz="${k}">${I(ic)}<span>${n}</span></span>`).join('')}</div><div class="seg" id="zoomseg">${ZOOMS.map(([k, n]) => `<span data-zoom="${k}"><span>${n}</span></span>`).join('')}</div><div class="period"><button class="ic ic" id="prev" title="Earlier ([)">${I('chevron-left')}</button><b id="ptitle"></b><button class="ic ic" id="next" title="Later (])">${I('chevron-right')}</button></div><div class="seg" id="layerseg">${LAYERS.map(([k, n, ic]) => `<span data-layer="${k}">${I(ic)}<span>${n}</span></span>`).join('')}</div></div></div>
      <aside class="feed gl l2" id="panel" aria-label="The context"></aside>
      <div class="key gl l2" id="key" data-open="1"></div>
      <div class="tip gl l3" id="tip" hidden></div>
      <div class="talk" role="search" aria-label="Talk to Lucid">${AI()}<input id="talk" placeholder="Ask, or tell Lucid what to show" autocomplete="off"><span class="tb slash" title="Commands">/</span><span class="tb" title="Hold to talk">${I('mic')}</span></div>
      <div class="pop gl l3" id="pop" hidden></div>
      <div class="toast" id="toast"></div>`;
    LM.marksIn(root);
    CAL.setDataset(v0(p.get('d')));
    if (p.get('day')) { const t = Date.parse(p.get('day') + 'T12:00'); if (t) { CAL.view.day = dayKey(t); CAL.view.sel = { day: CAL.view.day }; } }
    if (p.get('focus')) { const f = p.get('focus'); const ds = LM.ds; if (ds.byId.get(f)) CAL.view.focus = { level: 2, key: f }; else if (ds.lenses[CAL.view.lens].lands[f]) CAL.view.focus = { level: 1, key: f }; }
    bind();
    CAL.render();
    window.addEventListener('resize', () => CAL.render());
  };
  const v0 = (k) => (LM.DATA[k] ? k : CAL.view.ds);
  function bind() {
    const v = CAL.view;
    document.querySelectorAll('[data-viz]').forEach((b) => { b.onclick = () => { v.viz = b.dataset.viz; v.strataScroll = 0; CAL.render(); }; });
    document.querySelectorAll('[data-zoom]').forEach((b) => { b.onclick = () => CAL.setZoom(b.dataset.zoom); });
    document.querySelectorAll('[data-layer]').forEach((b) => { b.onclick = () => { v.layer = b.dataset.layer; CAL.render(); }; });
    document.querySelectorAll('[data-lens]').forEach((b) => { b.onclick = () => { v.lens = b.dataset.lens; CAL._idx = null; v.focus = { level: 0, key: null }; CAL.render(); }; });
    $('#today').onclick = () => CAL.today(); $('#prev').onclick = () => CAL.step(-1); $('#next').onclick = () => CAL.step(1);
    $('#labc').onclick = (e) => labMenu(e);
    document.addEventListener('keydown', (e) => { if (e.target.tagName === 'INPUT') return; if (e.key === '[') CAL.step(-1); else if (e.key === ']') CAL.step(1); else if (e.key === 't' || e.key === 'T') CAL.today(); else if (e.key === '+' || e.key === '=') CAL.zoomStep(1); else if (e.key === '-') CAL.zoomStep(-1); else if (e.key === 'Escape') CAL.select({ day: v.day }); else if (e.key === '1') v.viz = 'tiles', CAL.render(); else if (e.key === '2') v.viz = 'river', CAL.render(); else if (e.key === '3') v.viz = 'strata', CAL.render(); });
    document.addEventListener('pointerdown', (e) => { const p = $('#pop'); if (!p.hidden && !p.contains(e.target) && !e.target.closest('#labc')) p.hidden = true; });
    // the canvas: hover tips, clicks that lead to the thing, wheel that zooms time around the day under the cursor, drag that scrolls the strata
    const cv = $('#cv'); let drag = null, moved = false;
    const hitAt = (x, y) => { for (let i = CAL.hits.length - 1; i >= 0; i--) { const h = CAL.hits[i]; if (x >= h.x0 && x <= h.x1 && y >= h.y0 && y <= h.y1) return h.act; } return null; };
    const local = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener('pointermove', (e) => { const [x, y] = local(e); if (drag) { if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 4) moved = true; if (v.viz === 'strata') { v.strataScroll = Math.max(0, Math.min(Math.max(0, (CAL.strataTotal || 0) - cv.clientHeight + 60), drag.s - (e.clientY - drag.y))); drawCanvas(idxNow(), CAL.P); } return; } const a = hitAt(x, y); cv.style.cursor = a ? 'pointer' : 'default'; tip(a && a.title ? a.title : null, e.clientX, e.clientY, a); });
    cv.addEventListener('pointerleave', () => tip(null));
    cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, s: v.strataScroll }; moved = false; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointerup', (e) => { const was = drag; drag = null; if (!was || moved) return; const [x, y] = local(e); const a = hitAt(x, y); if (!a) return; if (a.ev) CAL.select({ ev: a.ev }); else if (a.place) CAL.dive(1, a.place); else if (a.it) CAL.dive(2, a.it.id); else if (a.day !== undefined) { if (v.zoom === 'day') CAL.select({ day: v.day }); else CAL.select({ day: a.day }); } });
    cv.addEventListener('wheel', (e) => { e.preventDefault(); if (v.viz === 'strata' && !e.ctrlKey && Math.abs(e.deltaY) > Math.abs(e.deltaX)) { v.strataScroll = Math.max(0, Math.min(Math.max(0, (CAL.strataTotal || 0) - cv.clientHeight + 60), v.strataScroll + e.deltaY)); drawCanvas(idxNow(), CAL.P); return; } wheelZoom(e, local(e)[0]); }, { passive: false });
    $('#dom').addEventListener('wheel', (e) => { if (e.target.closest('.scroll')) return; if (Math.abs(e.deltaY) < 8) return; e.preventDefault(); const day = e.target.closest('[data-day]'); wheelZoom(e, null, day ? Number(day.dataset.day) : undefined); }, { passive: false });
    let wheelAcc = 0, wheelT = 0;
    function wheelZoom(e, x, dayUnder) { wheelAcc += e.deltaY; clearTimeout(wheelT); wheelT = setTimeout(() => { wheelAcc = 0; }, 400); if (Math.abs(wheelAcc) < 60) return; const dir = wheelAcc < 0 ? 1 : -1; wheelAcc = 0; let k = dayUnder; if (k === undefined && x !== null && CAL.P && v.zoom !== 'day') { const n = CAL.P.k1 - CAL.P.k0; const LEFT = v.viz === 'river' ? 150 : 96; const i = Math.floor(((x - LEFT) / (cv.clientWidth - LEFT)) * n); if (i >= 0 && i < n) k = CAL.P.k0 + i; } if (k !== undefined) v.day = k; if (v.viz === 'strata') v.strataScroll = 0; CAL.zoomStep(dir, v.day); }
    $('#talk').addEventListener('keydown', (e) => { if (e.key !== 'Enter') return; const q = e.target.value.trim().toLowerCase(); e.target.value = ''; command(q); });
  }
  function command(q) {
    const v = CAL.view;
    if (/today/.test(q)) CAL.today(); else if (/quarter/.test(q)) CAL.setZoom('quarter'); else if (/month/.test(q)) CAL.setZoom('month'); else if (/week/.test(q)) CAL.setZoom('week'); else if (/hours|day view|this day/.test(q)) CAL.setZoom('day');
    else if (/river/.test(q)) { v.viz = 'river'; CAL.render(); } else if (/strata|layers|dig/.test(q)) { v.viz = 'strata'; CAL.render(); } else if (/tiles|grid/.test(q)) { v.viz = 'tiles'; CAL.render(); }
    else if (/problem|stuck/.test(q)) { v.layer = 'problems'; CAL.render(); } else if (/harvest|finished|done/.test(q)) { v.layer = 'harvest'; CAL.render(); } else if (/decision/.test(q)) { v.layer = 'decisions'; CAL.render(); } else if (/people|who/.test(q)) { v.layer = 'people'; CAL.render(); } else if (/cost/.test(q)) { v.layer = 'cost'; CAL.render(); } else if (/ahead|expected|projected|coming/.test(q)) { v.layer = 'projected'; CAL.render(); } else if (/everything|all/.test(q)) { v.layer = 'all'; CAL.render(); }
    else if (/company|everywhere/.test(q)) CAL.dive(0, null);
    else { const ds = LM.ds; const L = Object.entries(ds.lenses[v.lens].lands).find(([k, l]) => q.includes(l.name.toLowerCase())); if (L) CAL.dive(1, L[0]); else say(`I know: today, quarter, month, week, hours, river, strata, tiles, problems, harvest, decisions, people, cost, ahead, a place's name.`); }
  }
  function tip(text, x, y, a) { const T = $('#tip'); if (!text) { if (!T.hidden) T.hidden = true; return; } T.innerHTML = `<div class="tl">${esc(text)}</div>${a && a.ev && a.ev.proj && a.ev.why ? `<div class="tm">${esc(a.ev.why)}</div>` : ''}`; T.hidden = false; T.style.left = Math.min(window.innerWidth - 300, x + 14) + 'px'; T.style.top = Math.min(window.innerHeight - 80, y + 14) + 'px'; }
  function labMenu(e) {
    const r = document.documentElement, v = CAL.view, p = $('#pop');
    p.innerHTML = `<span class="lbl2">Theme</span><div class="seg">${THEMES.map(([k, n, ic]) => `<button class="sg${r.dataset.pt === k ? ' on' : ''}" data-pt="${k}">${I(ic)}<span>${n}</span></button>`).join('')}</div>
      <span class="lbl2">Dataset</span><div class="seg dsw">${[['lucid', 'Lucid Chat', 'real'], ['example', 'Example company', 'generated']].map(([k, n, sub]) => `<button class="sg${v.ds === k ? ' on' : ''}" data-ds="${k}"><span>${n}</span><small>${sub}</small></button>`).join('')}</div>
      <span class="lbl2">The week starts on</span><div class="seg"><button class="sg${v.weekStart === 0 ? ' on' : ''}" data-ws="0"><span>Sunday</span></button><button class="sg${v.weekStart === 1 ? ' on' : ''}" data-ws="1"><span>Monday</span></button></div>
      <span class="lbl2">The panel</span><div class="seg"><button class="sg${v.panel ? ' on' : ''}" data-panel="1"><span>Open</span></button><button class="sg${!v.panel ? ' on' : ''}" data-panel="0"><span>Closed</span></button></div>
      <small class="lbl3">${esc(CAL.synthetic || '')}.</small>`;
    const a = e.currentTarget.getBoundingClientRect(); p.style.left = Math.max(12, a.right - 360) + 'px'; p.style.top = a.bottom + 8 + 'px'; p.hidden = false;
    p.querySelectorAll('[data-pt]').forEach((b) => { b.onclick = () => { r.dataset.pt = b.dataset.pt; readTheme(); CAL.render(); labMenu(e); }; });
    p.querySelectorAll('[data-ds]').forEach((b) => { b.onclick = () => { if (b.dataset.ds !== v.ds) { CAL.setDataset(b.dataset.ds); CAL.render(); say(`${LM.ds.name}: ${LM.ds.sub}`); } p.hidden = true; }; });
    p.querySelectorAll('[data-ws]').forEach((b) => { b.onclick = () => { v.weekStart = Number(b.dataset.ws); CAL.render(); labMenu(e); }; });
    p.querySelectorAll('[data-panel]').forEach((b) => { b.onclick = () => { v.panel = b.dataset.panel === '1'; CAL.render(); labMenu(e); }; });
  }
  document.addEventListener('DOMContentLoaded', CAL.boot);
})();
