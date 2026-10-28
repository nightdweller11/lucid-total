import { I, AI, AIC, g, st, av, agav, pav, btn, ib, chip, kbd, id, fig, app, phone, pri, due, conf, cite, aiG, at, pct, rounded, blob, curve, inset, centroid, treemap, superellipse, SVGDEFS } from './lib.mjs';
import { Z0, z0, W0, H0, DOMAINS, z0Scene, mapBox, mapTools, legend, goals, regLabel, cluster, flag, weatherChip, terrain, cellPath, heat, ru } from './maps.mjs';
import { ENG, MKT, W1, H1, z1Scene, z1Layout, gof, nof, euHullEng, euHullMkt, softHull, grpLabel } from './maps2.mjs';

const cont = (label, n, aria) => `<span class="cont" role="button" tabindex="0" aria-label="${aria || label + ', continues, ' + n + ' items on the other side'}">${label}<span class="num">· ${n}</span>${I('chevron-right')}</span>`;
const domHead = (name, o, he = false) => `<div class="reglabel" style="flex-direction:row;gap:8px"><span class="nm" style="font-size:17px">${name}</span>${ru(o, he)}</div>`;

// ---------- 1 · Z0 owner ----------
function f1(o = {}) {
  const s = z0Scene({ he: o.he });
  const body = `<div style="display:flex;flex-direction:column;gap:10px;height:100%">${goals()}${mapBox(s, 650, mapTools() + legend())}</div>`;
  return app({ active: 'map', crumbs: ['Company'], label: o.label || 'Company map, zoom 0, owner perspective', body, pt: o.pt, hc: o.hc });
}
// ---------- 2 · Z1 Engineering (CTO) ----------
export function z1EngScene(he = false, extra = {}) {
  const h = euHullEng();
  const L = ENG;
  const cpos = [h.c[0] - 20, h.c[1] + 64], mpos = [h.m[0] - 60, h.m[1] - 18];
  const ov = at(cpos[0], cpos[1], L.W, L.H, cont(he ? 'ממשיך ברגולציה' : 'Compliance', 7, he ? 'אירופה ממשיכה ברגולציה, 7 פריטים' : 'Europe launch continues in Compliance, 7 items'))
    + at(mpos[0], mpos[1], L.W, L.H, cont(he ? 'ממשיך בשיווק' : 'Marketing', 5, he ? 'אירופה ממשיכה בשיווק, 5 פריטים' : 'Europe launch continues in Marketing, 5 items'))
    + at(h.eu[0] + 10, h.eu[1] - 92, L.W, L.H, `<span class="chip sm" style="background:color-mix(in srgb,var(--f-lime) 30%,var(--g2))" role="button" tabindex="0" aria-label="Program Europe launch, spans Engineering, Compliance and Marketing">${I('globe')}${he ? 'השקה באירופה' : 'Europe launch'}</span>`)
    + at(gof(L, 'pbc').c[0] - 70, gof(L, 'pbc').c[1] + 52, L.W, L.H, `<span class="presence">${pav('N', 'sm r-doing')}${agav(he ? 'מתאם (Fable)' : 'Coordinator (Fable) · wave 71 merge', 'sm r-doing')}${agav('Worker B · wave 71', 'sm r-doing')}</span>`)
    + at(gof(L, 'pbs').c[0] + 70, gof(L, 'pbs').c[1] + 40, L.W, L.H, `<span class="presence">${agav('Worker C · wave 71 · stuck on a credential', 'sm r-stuck')}</span>`)
    + at(gof(L, 'g1').c[0] + 150, gof(L, 'g1').c[1] + 40, L.W, L.H, flag(he ? 'הגשה: כן/לא' : 'Store go / no-go', false))
    + (extra.ov || '');
  return z1Scene(L, { he, hull: h.d, heat: [['pbc', .8, 120], ['pbs', .5, 90], ['ai', .4, 80], ['ios', .3, 80]], ov, svgAfter: extra.svgAfter, dimExcept: extra.dimExcept });
}
function f2() {
  const s = z1EngScene();
  return app({ active: 'map', crumbs: ['Company', 'Engineering'], persp: 'CTO (Noa)', label: 'Engineering domain, zoom 1, CTO perspective', body: mapBox(s, 690, mapTools({ zoom: 'Z1 Domain', layers: '5', lchips: domHead('Engineering', { done: 62, doing: 14, blocked: 6, dec: 1, moved: 23 }) })) });
}
// ---------- 3 · Z1 Marketing (CMO) ----------
function f3() {
  const L = MKT; const h = euHullMkt();
  const st1 = gof(L, 'store').c, wl = gof(L, 'wl').c, vid = gof(L, 'vid').c, eng = nof(L, 'eng').vis, comp = nof(L, 'comp').vis;
  const sIos = [eng[0] - 20, eng[1] + 120], sApi = [eng[0] + 4, eng[1] - 10];
  const roads = `<path class="road crit" d="${curve([st1[0] - 40, st1[1] + 20], sIos, -0.15)}"/><path class="road" d="${curve([wl[0] - 30, wl[1] + 30], sApi, 0.18)}"/><path class="road ext" d="${curve([vid[0] - 20, vid[1] + 20], [sIos[0] + 6, sIos[1] + 4], 0.2)}"/><path class="road blk" d="${curve([h.eu[0] - 30, h.eu[1] - 40], [comp[0] + 40, comp[1] + 50], -0.2)}"/>
<circle cx="${sIos[0]}" cy="${sIos[1]}" r="9" style="fill:var(--g3);stroke:var(--fg);stroke-width:3"/><circle cx="${sApi[0]}" cy="${sApi[1]}" r="7" style="fill:var(--g3);stroke:var(--fg);stroke-width:2.5"/>`;
  const mid = [(h.eu[0] - 30 + comp[0] + 40) / 2 + 40, (h.eu[1] - 40 + comp[1] + 50) / 2 - 4];
  const ov = at(sIos[0] + 70, sIos[1] + 26, L.W, L.H, `<span class="chip sm" role="button" tabindex="0" aria-label="Station: iOS release 1.0, Engineering, due Nov 21">${g('milestone', { size: 'sm' })}iOS release 1.0 · Nov 21</span>`)
    + at(sApi[0] + 80, sApi[1] - 22, L.W, L.H, `<span class="chip sm" role="button" tabindex="0" aria-label="Station: invites API, Private beta server">${g('task', { size: 'sm' })}Invites API · P1-S-11</span>`)
    + at(mid[0], mid[1], L.W, L.H, `<span class="flex" style="gap:4px"><span class="barrier" role="img" aria-label="Blocked: waiting for the EU consent texts approval" title="Blocked: waiting for the EU consent texts approval">${I('construction')}</span><span class="chip sm block">Consent texts approval</span></span>`)
    + at(comp[0] - 60, comp[1] + 36, L.W, L.H, cont('Europe launch · Compliance', 7))
    + at(eng[0] + 70, eng[1] - 120, L.W, L.H, cont('Europe launch · Engineering', 3, 'Europe launch continues in Engineering, 3 items'))
    + at(gof(L, 'wl').c[0] + 80, gof(L, 'wl').c[1] + 44, L.W, L.H, `<span class="presence">${pav('O', 'sm r-doing')}${agav('Follow-up agent · waitlist reminders', 'sm r-doing')}</span>`)
    + at(gof(L, 'paid').c[0], gof(L, 'paid').c[1] + 54, L.W, L.H, `<span class="chip sm" role="img" aria-label="Budget: 1,800 dollars a month, 74 percent spent">${g('budget', { size: 'sm' })}$1,800/mo · 74%</span>`);
  const s = z1Scene(L, { hull: h.d, svgAfter: roads, heat: [['wl', .6, 100], ['eu', .3, 80], ['store', .45, 80]], ov });
  return app({ active: 'map', crumbs: ['Company', 'Marketing'], persp: 'CMO (Omer)', label: 'Marketing domain, zoom 1, CMO perspective', body: mapBox(s, 690, mapTools({ zoom: 'Z1 Domain', layers: '5 · roads on', lchips: domHead('Marketing', { done: 38, doing: 8, blocked: 2, dec: 1, moved: 7 }) })) });
}
// ---------- Z2 Wave 71 ----------
const W2 = 1028, H2 = 690, CW = 172, CH = 106;
const COLS = ['proposed', 'ready', 'doing', 'review', 'done'];
const colX = (i) => 44 + i * 189;
const Y0 = 20;
export const WAVE = [
  { c: 0, y: 112, id: 'P1-C-07', k: 'task', t: 'Dispatcher back-pressure metrics', a: '', p: 'normal', conf: 'unchecked', cm: 1 },
  { c: 0, y: 230, id: 'L489-F5', k: 'task', t: 'Classifier v4 eval candidates', a: 'B', p: 'low', conf: 'unchecked' },
  { c: 1, y: 112, id: 'P1-C-05', k: 'task', t: 'Relay originals: sender-only key wrap', a: 'C', p: 'high', conf: 'unchecked', cm: 3 },
  { c: 1, y: 230, id: 'ENV-STATUS-SITE-F6', k: 'task', t: 'Status site: subtask progress bars', a: 'F', p: 'normal', conf: 'unchecked' },
  { c: 1, y: 348, id: 'CH-RW-TOKEN', k: 'chore', t: 'Put the Railway staging token in an envelope', a: 'Y', p: 'urgent', wait: true, due: 'today' },
  { c: 2, y: 112, id: 'P1-C-03', k: 'task', t: 'Dispatcher sequencing under load', a: 'B', p: 'high', conf: 'partly', wl: 'running integration suite · 4m', cm: 5 },
  { c: 2, y: 248, id: 'P1-C-04', k: 'task', t: 'Fail-closed release path tests', a: 'C', p: 'high', conf: 'unchecked', blocked: 'Railway staging token', cm: 2 },
  { c: 2, y: 366, id: 'BUG-212', k: 'bug', t: 'Android sheet fallback flickers on open', a: 'N', p: 'normal', conf: 'unchecked', wl: 'repro on emulator' },
  { c: 3, y: 112, id: 'P1-C-02', k: 'task', t: 'Per-conversation sequence numbers', a: 'B', p: 'high', conf: 'met', cm: 4 },
  { c: 3, y: 230, id: 'L489-F3', k: 'task', t: 'Prompt v12 eval candidates', a: 'C', p: 'normal', conf: 'partly', cm: 6 },
  { c: 4, y: 112, id: 'P1-C-01', k: 'task', t: 'Outbox fan-out with idempotency keys', a: 'B', p: 'normal', conf: 'met' },
  { c: 4, y: 230, id: 'L498-F1', k: 'task', t: 'Guard arithmetic, scenarios A2 and B', a: 'C', p: 'normal', conf: 'met' },
  { c: 4, y: 348, id: 'L489-F4', k: 'task', t: 'Classify v3 eval candidates', a: 'B', p: 'low', conf: 'met' },
];
const agentOf = { B: 'Worker B · wave 71', C: 'Worker C · wave 71', F: 'Follow-up agent' };
const who = (a, sz = 'xs') => !a ? `<span class="av ${sz}" role="img" aria-label="Unassigned" title="Unassigned">${I('user-round-plus')}</span>` : (a.length === 1 && 'YDON'.includes(a) ? pav(a, sz) : agav(agentOf[a] || a, sz));
export function zcard(c, o = {}) {
  const cls = ['card', o.sel ? 'sel' : '', o.dim ? 'dim' : '', o.lit ? 'lit' : '', c.blocked ? 'blk' : ''].join(' ');
  return `<div class="${cls}" style="width:${CW}px;height:${CH}px" role="button" tabindex="0" aria-label="${KIND(c.k)} ${c.id}, ${c.t}${c.blocked ? ', blocked by ' + c.blocked : ''}">
<div class="t1">${g(c.k, { size: 'sm' })}<span class="id ell" style="flex:1">${c.id}</span>${pri(c.p)}${c.conf ? conf(c.conf) : ''}</div>
<div class="tt" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${c.t}</div>
<div class="gr" style="margin-top:auto">${who(c.a)}${c.wl ? `<span class="wl ell" style="flex:1">${AI()}${c.wl}</span>` : ''}${c.blocked ? `<span class="tag block ell">${I('construction')}${c.blocked}</span>` : ''}${c.wait ? `<span class="tag hold">${I('hourglass')}Yossi · ${c.due}</span>` : ''}${!c.wl && !c.blocked && !c.wait && c.cm ? `<span class="sp"></span><span class="mut xs flex" style="gap:3px">${I('message-square')}${c.cm}</span>` : ''}</div></div>`;
}
const KIND = (k) => ({ task: 'Task', bug: 'Bug', chore: 'Chore' }[k] || k);
const cpos = (idv) => { const c = WAVE.find((x) => x.id === idv); return { x: colX(c.c), y: c.y + Y0 }; };
function z2Svg(lit) {
  const epic = rounded([[18, 54], [1010, 54], [1010, 676], [18, 676]], 40);
  let s = `<path class="cell dim" d="M-60,60L10,60L10,676L-60,676Z"/><path class="cell me" d="${epic}"/><path class="cellhi" d="${epic}"/><path class="cedge" d="${epic}"/>`;
  COLS.forEach((_, i) => { if (i) s += `<line x1="${colX(i) - 9}" y1="100" x2="${colX(i) - 9}" y2="640" style="stroke:var(--line);stroke-width:1;stroke-dasharray:2 6"/>`; });
  s += heat(colX(2) + 86, 200, 120, .7);
  // weather front over the lower Doing / Review area
  const fp = [[colX(2) - 20, 430], [colX(3) + 40, 420], [colX(3) + 120, 490], [colX(2) + 120, 560], [colX(2) - 30, 520]];
  s += `<path class="frontedge" d="${blob(fp)}"/><path class="front" d="${blob(fp)}"/>`;
  const R = (a, b, cls, bend = 0.12) => `<path class="road ${cls}" d="${curve(a, b, bend)}" marker-end="url(#arrowFg)"/>`;
  const A = cpos('P1-C-02'), B = cpos('P1-C-03'), C = cpos('P1-C-07'), D = cpos('P1-C-04'), E = cpos('CH-RW-TOKEN'), F = cpos('P1-C-05'), G = cpos('L489-F3'), H = cpos('L489-F4');
  s += R([A.x, A.y + 40], [B.x + CW + 4, B.y + 40], lit ? 'lit' : '', -0.1); // P1-C-02 -> P1-C-03 (depends)
  s += R([B.x, B.y + 30], [C.x + CW + 4, C.y + 40], lit ? 'lit crit' : 'crit', 0.12); // P1-C-03 blocks P1-C-07
  s += R([B.x + 60, B.y + CH], [D.x + 60, D.y - 4], lit ? 'lit' : '', 0); // relates
  s += `<path class="road blk" d="${curve([E.x + CW, E.y + 50], [D.x - 4, D.y + 60], 0.1)}" marker-end="url(#arrowFg)"/>`;
  s += R([F.x + CW, F.y + 70], [D.x - 4, D.y + 20], lit ? 'dim' : '', -0.1);
  s += R([H.x, H.y + 50], [G.x + CW + 4, G.y + 60], lit ? 'dim' : '', 0.1);
  return s;
}
function z2Overlay(o = {}) {
  const lit = ['P1-C-02', 'P1-C-07', 'P1-C-04'];
  let ov = '';
  const counts = COLS.map((c) => WAVE.filter((w) => w.c === COLS.indexOf(c)).length);
  COLS.forEach((c, i) => { ov += `<div class="ml tl" style="inset-inline-start:${pct(colX(i), W2)};top:${pct(98, H2)}"><span class="flex b" style="gap:6px;font-size:12px">${st(c)}<span>${['Proposed', 'Ready', 'Doing', 'Review', 'Done'][i]}</span><span class="mut num">${counts[i]}</span></span></div>`; });
  WAVE.forEach((c) => { ov += `<div class="ml tl" style="inset-inline-start:${pct(colX(c.c), W2)};top:${pct(c.y + Y0, H2)}">${zcard(c, o.sel ? { sel: c.id === 'P1-C-03', lit: lit.includes(c.id), dim: c.id !== 'P1-C-03' && !lit.includes(c.id) } : {})}</div>`; });
  const D = cpos('P1-C-04'), E = cpos('CH-RW-TOKEN');
  ov += at((E.x + CW + D.x) / 2, (E.y + 50 + D.y + 60) / 2 - 6, W2, H2, `<span class="barrier" role="img" aria-label="Blocked dependency: P1-C-04 waits for the Railway staging token" title="Blocked: P1-C-04 waits for the Railway staging token">${I('construction')}</span>`);
  ov += at(colX(3) + 30, 556, W2, H2, weatherChip('Integration suite flaky on Railway dev · likely'));
  ov += `<div class="ml tl" style="inset-inline-start:${pct(40, W2)};top:${pct(62, H2)}"><span class="reglabel" style="flex-direction:row;gap:8px">${g('goal', { size: 'sm' })}<span class="nm" style="font-size:15px">Wave 71</span>${ru({ done: 31, doing: 3, blocked: 1, moved: 9 })}<span class="chip sm">${I('git-merge')}merge window tonight</span></span></div>`;
  return ov;
}
function minimap() {
  const sc = 150 / W0;
  return `<div class="mini" style="inset-inline-end:14px;bottom:14px" role="img" aria-label="Minimap: you are in Engineering, Private beta, Wave 71"><svg viewBox="0 0 ${W0} ${H0}" aria-hidden="true">${Z0.map((d) => `<path class="cell${d.k === 'eng' ? ' sel' : ''}" d="${rounded(d.poly, 30)}" style="${d.k === 'eng' ? 'stroke-width:10' : ''}"/>`).join('')}<circle cx="${z0('eng').c[0] - 40}" cy="${z0('eng').c[1] - 60}" r="26" style="fill:var(--acc)"/></svg></div>`;
}
function f4(o = {}) {
  const s = { svg: terrain(W2, H2, z2Svg(true)), ov: z2Overlay({ sel: true }) + minimap() + `<div class="ml tl" style="inset-inline-start:2%;bottom:2%;top:auto"><span class="chip" role="status">${I('mouse-pointer-click')}P1-C-03 selected · 3 relations lit · ${kbd('↵')} open · ${kbd('Esc')} back</span></div>` };
  return app({ active: 'map', crumbs: ['Company', 'Engineering', 'Private beta', 'Wave 71'], persp: 'CTO (Noa)', label: 'Wave 71 epic, zoom 2, cards by state', body: mapBox(s, 690, mapTools({ zoom: 'Z2 Epic', layers: '6 · roads on', lchips: `<span class="seg" role="radiogroup" aria-label="Cards or lines"><span class="on" role="radio" aria-checked="true">${I('square-kanban')}Cards</span><span role="radio" aria-checked="false">${I('rows-3')}Lines</span></span>` }) ), pt: o.pt });
}
// ---------- 5 · Z2 line view ----------
export function lineRows(he = false) {
  const names = he ? ['מוצע', 'מוכן', 'בעבודה', 'בבדיקה', 'הושלם'] : ['Proposed', 'Ready', 'Doing', 'Review', 'Done'];
  return COLS.map((c, i) => {
    const items = WAVE.filter((w) => w.c === i);
    return `<div class="col" style="gap:2px" role="group" aria-label="${names[i]}, ${items.length}"><div class="flex b" style="padding:6px 10px 2px;font-size:12px">${st(c)}${names[i]}<span class="mut num">${items.length}</span><span class="sp"></span><span class="mut xs">${I('chevron-down')}</span></div>
${items.map((w) => `<div class="crow${w.id === 'P1-C-03' ? ' sel' : ''}" role="row" tabindex="0" aria-label="${w.id}, ${w.t}">${g(w.k, { size: 'sm' })}${id(w.id)}<span class="tt">${w.t}</span>${w.wl ? `<span class="tag ai hide-ph">${AI()}${w.wl}</span>` : ''}${w.blocked ? `<span class="tag block">${I('construction')}${w.blocked}</span>` : ''}${w.wait ? `<span class="tag hold">${I('hourglass')}Yossi · today</span>` : ''}${who(w.a, 'xs')}${pri(w.p)}${w.conf ? conf(w.conf) : '<span class="sg"></span>'}</div>`).join('')}</div>`;
  }).join('');
}
function f5() {
  const epic = rounded([[18, 54], [1010, 54], [1010, 676], [18, 676]], 40);
  const svg = terrain(W2, H2, `<path class="cell me" d="${epic}"/><path class="cellhi" d="${epic}"/><path class="cedge" d="${epic}"/>`);
  const ov = `<div class="ml tl" style="inset-inline-start:${pct(40, W2)};top:${pct(62, H2)}"><span class="reglabel" style="flex-direction:row;gap:8px">${g('goal', { size: 'sm' })}<span class="nm" style="font-size:15px">Wave 71</span>${ru({ done: 31, doing: 3, blocked: 1, moved: 9 })}</span></div>
<div style="position:absolute;inset-inline-start:40px;inset-inline-end:64px;top:100px;bottom:24px;display:flex;flex-direction:column;gap:8px;overflow:hidden" role="treegrid" aria-label="Wave 71 as lines, grouped by state">${lineRows()}</div>`;
  return app({ active: 'map', crumbs: ['Company', 'Engineering', 'Private beta', 'Wave 71'], persp: 'CTO (Noa)', label: 'Wave 71, zoom 2, line view', body: mapBox({ svg, ov }, 690, mapTools({ zoom: 'Z2 Epic', lchips: `<span class="seg" role="radiogroup" aria-label="Cards or lines"><span role="radio" aria-checked="false">${I('square-kanban')}Cards</span><span class="on" role="radio" aria-checked="true">${I('rows-3')}Lines</span></span>` })) });
}
// ---------- 6 · What-if ----------
function f6() {
  const L = ENG; const eu = gof(L, 'eu'), aiq = gof(L, 'ai'), ios = gof(L, 'ios');
  const scalePoly = (p, c, k) => p.map(([x, y]) => [c[0] + (x - c[0]) * k, c[1] + (y - c[1]) * k]);
  const ghosts = `<path class="ghostcell" d="${rounded(scalePoly(eu.poly, eu.c, 1.38), 22)}"/><path class="ghostcell" d="${rounded(scalePoly(aiq.poly, aiq.c, 0.72), 18)}"/>
<path class="ghostarrow" d="M${eu.c[0] - 40},${eu.c[1] + 40} L${eu.c[0] - 95},${eu.c[1] + 95}"/><path class="ghostarrow" d="M${aiq.c[0] + 70},${aiq.c[1] + 70} L${aiq.c[0] + 40},${aiq.c[1] + 40}"/>`;
  const ov = at(eu.c[0] - 60, eu.c[1] + 120, L.W, L.H, `<span class="chip sm draft" role="img" aria-label="Draft: EU data residency priority up, 9 items">${I('trending-up')}priority ↑ · 9 items</span>`)
    + at(aiq.c[0] + 10, aiq.c[1] + 92, L.W, L.H, `<span class="chip sm draft" role="img" aria-label="Draft: AI evals paused one wave">${I('trending-down')}paused 1 wave</span>`)
    + at(ios.c[0], ios.c[1] + 70, L.W, L.H, `<span class="chip sm draft" role="img" aria-label="Draft: iOS release 1.0 moves from Nov 21 to Nov 28">${I('calendar-clock')}Nov 21 → Nov 28</span>`);
  const s = z1EngScene(false, { svgAfter: ghosts, ov });
  const panel = `<aside class="pn l2 pad col" style="width:316px;flex:none;gap:10px;height:100%;overflow:hidden" aria-label="Change set of the draft Europe first">
<div class="ph">${aiG('', 'Prepared by the assistant')}<h3 class="h3">Draft: Europe first</h3><span class="sp"></span><span class="tag ai">${I('flask-conical')}not applied</span></div>
<div class="sm mut">From Yossi's "we focus on Europe now". Decision kind: strategy and market focus · material · yours.</div>
<div class="col" style="gap:0">
${[['trending-up', 'Priority boosts', '23 items tagged Europe or in EU programs move up; 9 in Engineering', 'acc'],
    ['wallet', 'Budget shift', '$1,200/mo from Paid search · US to Europe launch campaign', ''],
    ['calendar-clock', '3 dates move', 'iOS release 1.0 Nov 21 → Nov 28 · Waitlist wave 2 Dec 1 → Dec 12 · AI evals L489 +1 wave', 'hold'],
    ['users', '2 people over capacity', 'Dana 128 % (consent texts, DPA) · Noa 112 % (EU residency + iOS)', 'block'],
    ['bell', '9 people notified', 'each with what changed for them; Omer and Dana first', '']].map(([ic, t, d, c]) => `<div class="settings-row" style="align-items:flex-start"><span class="sg ${c}">${I(ic)}</span><div><div class="b">${t}</div><div class="sm mut">${d}</div></div></div>`).join('')}
</div>
<div class="pn hold nb pad" style="padding:9px 12px;border-radius:16px"><div class="flex sm">${st('waiting')}<b>Slips:</b> Gate 1 Alpha unchanged · Private beta goal forecast wk 25 → wk 26</div></div>
<div class="sm mut flex">${conf('unchecked')}Predicted effect is tracked after apply (since-the-decision view).</div>
<span class="sp"></span>
<div class="btns">${btn('check', 'Apply', 'pri', 'Apply the change set')}${btn('bookmark', 'Save draft')}${btn('x', 'Discard', 'ghost')}</div>
<div class="kbdh">${kbd('W')} toggle what-if · ${kbd('⌘↵')} apply</div></aside>`;
  const left = `<div class="col" style="flex:1;gap:10px"><div style="width:680px;height:456px;flex:none"><div style="zoom:.6615;width:1028px">${mapBox(s, 690, mapTools({ zoom: 'Z1 Domain', layers: '5 · what-if on' }))}</div></div>
<div class="pn pad" style="padding:10px 14px"><div class="flex b sm" style="margin-bottom:6px">${I('chart-gantt')}Dates that move <span class="sp"></span><span class="mut xs">ghost = proposed</span></div>
${[['iOS release 1.0', 52, 58], ['Waitlist wave 2', 64, 74], ['EU data residency', 86, 70]].map(([n, a, b]) => `<div class="flex sm" style="gap:10px;margin:4px 0"><span style="width:130px" class="ell">${n}</span><span style="position:relative;flex:1;height:12px"><span style="position:absolute;inset-inline-start:${a - 20}%;width:20%;height:12px;border-radius:6px;background:color-mix(in srgb,var(--fg) 22%,transparent)"></span><span style="position:absolute;inset-inline-start:${b - 20}%;width:20%;height:12px;border-radius:6px;box-shadow:inset 0 0 0 1.5px var(--ai);border:0;background:color-mix(in srgb,var(--ai) 12%,transparent)"></span></span></div>`).join('')}</div></div>`;
  return app({ active: 'map', crumbs: ['Company', 'Engineering'], whatif: 'Draft: Europe first', label: 'What-if: draft Europe first, ghosts on the Engineering map', body: `<div class="split" style="display:flex;gap:12px;height:100%">${left}${panel}</div>` });
}
// ---------- 7 · Meeting perspective ----------
const BETA = z1Layout({
  W: 680, H: 600, rx: 470, ry: 420,
  center: { n: 'Private beta', x: 340, y: 300, t: 46 },
  neigh: [{ k: 'des', n: 'Design', x: 40, y: 40, t: 8 }, { k: 'fin', n: 'Finance', x: 640, y: 30, t: 8 }, { k: 'ops', n: 'Operations', x: 660, y: 560, t: 8 }, { k: 'ppl', n: 'People', x: 30, y: 570, t: 8 }, { k: 'lead', n: 'Leadership', x: 340, y: -60, t: 8 }],
  groups: [
    { k: 'eng', n: 'Engineering part', x: 230, y: 240, t: 16, done: 66, due: 'Nov 28', lead: 'N', cl: [['doing', 8], ['review', 5], ['blocked', 3]] },
    { k: 'prod', n: 'Product part', x: 430, y: 220, t: 10, done: 48, lead: 'Y', cl: [['doing', 3], ['proposed', 4]] },
    { k: 'mkt', n: 'Marketing part', x: 450, y: 400, t: 9, done: 61, due: 'Dec 8', lead: 'O', cl: [['doing', 3], ['waiting', 1]] },
    { k: 'comp', n: 'Compliance part', x: 250, y: 420, t: 8, done: 31, lead: 'D', cl: [['waiting', 3], ['blocked', 1]] },
  ],
});
function f7() {
  const L = BETA;
  const ov = at(gof(L, 'prod').c[0], gof(L, 'prod').c[1] - 70, L.W, L.H, flag('Relay ships in beta?', true, 'Open decision: does Relay ship in the beta'))
    + at(gof(L, 'prod').c[0] + 10, gof(L, 'prod').c[1] + 74, L.W, L.H, flag('Coach in alpha?'))
    + at(gof(L, 'comp').c[0], gof(L, 'comp').c[1] - 72, L.W, L.H, flag('Owner of EU consent texts'))
    + at(gof(L, 'eng').c[0] - 10, gof(L, 'eng').c[1] + 82, L.W, L.H, weatherChip('TestFlight review may take 5 days'))
    + at(gof(L, 'mkt').c[0], gof(L, 'mkt').c[1] + 76, L.W, L.H, weatherChip('Cohort too small in Israel'))
    + at(gof(L, 'eng').c[0] + 30, gof(L, 'eng').c[1] + 40, L.W, L.H, `<span class="chip sm ai" role="img" aria-label="Captured in this meeting: decision Relay ships in beta, pending confirm">${AI()}captured · pending</span>`);
  const s = z1Scene(L, { ov, heat: [['eng', .7, 110], ['prod', .4, 80]] });
  const w = 640, h = Math.round(w * L.H / L.W);
  const panel = `<aside class="pn l2 col" style="width:356px;flex:none;gap:8px;height:100%;padding:12px;overflow:hidden" aria-label="Assistant, meeting mode">
<div class="ph">${aiG()}<h3 class="h3">Assistant · meeting</h3><span class="sp"></span><span class="tag ai">${I('mic')}listening</span></div>
<div class="col sm" style="gap:6px">
<div class="flex" style="align-items:flex-start;gap:8px">${pav('Y', 'xs')}<div><span class="mut xs">18:31 · Yossi</span><div>"We decided: Relay ships in beta, approve-first by default."</div></div></div>
<div class="flex" style="align-items:flex-start;gap:8px">${pav('D', 'xs')}<div><span class="mut xs">18:33 · Dana</span><div>"I'll own the EU consent texts."</div></div></div>
<div class="flex" style="align-items:flex-start;gap:8px">${pav('Y', 'xs')}<div><span class="mut xs">18:36 · Yossi</span><div>"And drop the Coach from alpha."</div></div></div></div>
<div class="confirm"><div class="flex">${g('decision')}<b>Decided: Relay ships in beta</b><span class="sp"></span><span class="sg rules" title="Needs your tap · changes scope" role="img" aria-label="Needs your tap">${I('hand')}</span></div>
<div class="sm mut">Change set: 4 Relay tasks move into Private beta · P1-C-05 priority ↑ · Omer notified (store listing copy)</div>
<div class="btns">${btn('check', 'Confirm', 'pri sm')}${btn('pencil', 'Edit', 'sm')}${btn('x', 'Cancel', 'sm ghost')}</div></div>
<div class="aib sm"><div class="flex">${st('done')}<b>Applied: Dana owns EU consent texts</b><span class="sp"></span>${btn('undo-2', 'Undo', 'sm ghost')}</div><div class="mut xs">Reversible · done at once · 3 items reassigned</div></div>
<div class="aib sm"><div class="flex">${g('decision', { size: 'sm' })}<b>Proposed: drop the Coach from alpha</b></div><div style="margin:4px 0"><span class="tag hold">${I('hourglass')}batched for the end of the meeting</span></div><div class="mut xs">Preview: 6 tasks move to beta, 2 docs to update, frees ~3 agent-days</div></div>
<span class="sp"></span>
<div class="field">${I('mic')}<span class="mut">Speak or type… / for commands</span><span class="sp"></span>${ib('send', 'Send', 'sm')}</div></aside>`;
  const banner = `<div class="flex" style="gap:8px;padding:8px 14px;border-radius:999px;background:color-mix(in srgb,var(--ai) 20%,var(--g1));box-shadow:inset 0 1px 0 var(--gh)" role="status">${g('meeting', { size: 'sm' })}<b>Meeting · Beta readiness</b><span class="mut sm">since 18:20 · 4 attendees</span><span class="avs">${pav('Y', 'xs')}${pav('D', 'xs')}${pav('O', 'xs')}${pav('N', 'xs')}</span><span class="sp"></span><span class="sm mut">3 captured · 1 to confirm</span>${btn('square', 'End and summarise', 'sm')}</div>`;
  return app({ active: 'map', crumbs: ['Company', 'Private beta'], persp: 'Meeting · Beta readiness', label: 'Meeting perspective: beta readiness', body: `<div class="col" style="height:100%;gap:10px">${banner}<div class="split" style="display:flex;gap:12px;flex:1;min-height:0">${mapBox(s, h, mapTools({ zoom: 'Z1 Program', layers: '4', lchips: `<span class="reglabel" style="flex-direction:row;gap:6px">${g('goal', { size: 'sm' })}<span class="nm" style="font-size:14px">Private beta</span>${ru({ done: 58, doing: 14, blocked: 4, dec: 3 })}</span>` }), `width:${w}px;flex:none`)}${panel}</div></div>` });
}
// ---------- 8 · Timeline layer ----------
function f8() {
  const weeks = ['Oct 27', 'Nov 3', 'Nov 10', 'Nov 17', 'Nov 24', 'Dec 1', 'Dec 8', 'Dec 15', 'Dec 22', 'Dec 29', 'Jan 5', 'Jan 12'];
  const rows = [
    ['Engineering', null], ['Private beta · client', [0.2, 4.8, 64, 'pbc']], ['Private beta · server', [0, 3.9, 71, 'pbs']], ['iOS release 1.0', [2.7, 3.6, 55, 'ios']], ['Gate 1 Alpha', [0, 2.6, 81, 'g1']], ['EU data residency', [3, 8, 22, 'eu']],
    ['Marketing', null], ['App Store listing', [2, 3.8, 40, 'store']], ['Beta waitlist & invites', [1, 6.2, 61, 'wl']], ['Europe launch campaign', [6, 11.4, 18, 'euc']],
    ['Compliance', null], ['EU consent texts', [1.5, 5, 31, 'ct']], ['DPA with EU host', [0.5, 3, 45, 'dpa']],
  ];
  const ROWH = 38, X0 = 230, WK = 56;
  let y = 46; const pos = {};
  let rowsHtml = '';
  rows.forEach(([n, b]) => {
    if (!b) { rowsHtml += `<div style="position:absolute;top:${y}px;inset-inline-start:8px" class="b sm mut">${n}</div>`; y += 26; return; }
    const [s0, e0, d, k] = b; pos[k] = { y: y + ROWH / 2, s: X0 + s0 * WK, e: X0 + e0 * WK };
    rowsHtml += `<div style="position:absolute;top:${y}px;inset-inline-start:8px;width:${X0 - 16}px;height:${ROWH}px;display:flex;align-items:center;gap:6px" class="sm ell">${g(k === 'g1' || k === 'ios' || k === 'store' ? 'milestone' : 'goal', { size: 'sm' })}${n}</div>
<div role="img" aria-label="${n}: ${d}% done" style="position:absolute;top:${y + 8}px;inset-inline-start:${X0 + s0 * WK}px;width:${(e0 - s0) * WK}px;height:${ROWH - 16}px;border-radius:11px;background:color-mix(in srgb,var(--fg) 16%,transparent);overflow:hidden;box-shadow:inset 0 1px 0 var(--gh)"><span style="position:absolute;inset-block:0;inset-inline-start:0;width:${d}%;background:color-mix(in srgb,var(--good) 55%,transparent)"></span><span class="xs b num" style="position:absolute;inset-inline-start:8px;top:3px">${d}%</span></div>`;
    y += ROWH;
  });
  const ms = [['Gate 1 Alpha', 2.6], ['iOS 1.0 submission', 3.6], ['Private beta opens', 6], ['EU launch', 11.4]];
  const today = X0 + 0.3 * WK;
  const grid = weeks.map((w, i) => `<div style="position:absolute;top:0;bottom:0;inset-inline-start:${X0 + i * WK}px;width:${WK}px;box-shadow:inset 1px 0 0 var(--line)"><span class="xs mut num" style="position:absolute;top:8px;inset-inline-start:6px">${w}</span></div>`).join('');
  const msHtml = ms.map(([n, x], mi) => `<div style="position:absolute;top:28px;bottom:0;inset-inline-start:${X0 + x * WK}px;width:0;box-shadow:0 0 0 1px color-mix(in srgb,var(--f-gold) 60%,transparent)"></div><div style="position:absolute;top:${y + 2 + (mi % 2) * 22}px;inset-inline-start:${X0 + x * WK - 10}px" class="flex xs b">${g('milestone', { size: 'sm', solid: true })}<span class="nowrap">${n}</span></div>`).join('');
  const dep = (a, b, cls = '') => `<path class="road ${cls}" d="M${pos[a].e},${pos[a].y} C${pos[a].e + 30},${pos[a].y} ${pos[b].s - 30},${pos[b].y} ${pos[b].s},${pos[b].y}" marker-end="url(#arrowFg)"/>`;
  const svg = `<svg style="position:absolute;inset:0;width:100%;height:100%;overflow:visible" aria-hidden="true">${SVGDEFS}${dep('g1', 'ios', 'crit')}${dep('dpa', 'eu')}${dep('ct', 'euc', 'blk')}${dep('wl', 'euc')}</svg>`;
  const tl = `<div class="pn" style="position:relative;flex:1;height:${y + 60}px;overflow:hidden" role="img" aria-label="Timeline layer: groupings on a time axis with gates and dependencies">${grid}<div style="position:absolute;top:24px;bottom:0;inset-inline-start:${today}px;width:2px;background:var(--acc)"></div><span class="tag acc" style="position:absolute;top:26px;inset-inline-start:${today + 4}px">Today</span>${rowsHtml}${svg}${msHtml}</div>`;
  const und = `<aside class="pn l2 pad col" style="width:240px;flex:none;gap:6px" aria-label="Undated items"><div class="ph">${I('calendar-off')}<h3 class="h3">Undated · 9</h3></div><div class="xs mut">Items without dates are listed, never faked onto the axis.</div>
${[['task', 'P1-C-07', 'Dispatcher back-pressure metrics'], ['proposal', 'PR-031', 'Weekly cost digest to Lucid Chat'], ['chore', 'CH-APPLE-DUNS', 'Confirm the D-U-N-S number'], ['task', 'L489-F5', 'Classifier v4 eval candidates'], ['risk', 'RK-014', 'Single Railway region'], ['story', 'ST-022', 'Owner hands a key to the coordinator'], ['lesson', 'LS-009', 'Briefs need the walkthrough list'], ['task', 'ENV-STATUS-SITE-F6', 'Status site: subtask bars'], ['issue', 'IS-118', 'Beta tester: invite link expired']].map(([k, i, t]) => `<div class="crow" style="padding:4px 6px">${g(k, { size: 'sm' })}<span class="tt sm">${t}</span></div>`).join('')}</aside>`;
  return app({ active: 'map', crumbs: ['Company', 'Timeline'], label: 'Timeline layer of the map', body: `<div class="col" style="height:100%;gap:10px"><div class="flex">${chip('layers', 'Layers · Timeline on', 'on')}${chip('map', 'Back to terrain', 'ghost')}${chip('filter', 'Engineering, Marketing, Compliance')}<span class="sp"></span>${chip('flask-conical', 'Show draft ghosts', 'ghost')}<span class="seg"><span>Weeks</span><span class="on">Weeks</span><span>Months</span></span></div><div class="split" style="display:flex;gap:12px;align-items:flex-start">${tl}${und}</div></div>` }).replace('<span class="seg"><span>Weeks</span>', '<span class="seg" role="radiogroup" aria-label="Scale"><span role="radio" aria-checked="false">Days</span>');
}
// ---------- 9 · List equivalent ----------
function f9() {
  const T = [
    [0, 'chevron-down', 'map', 'Company', 'Lucid, 9 domains, 157 open items, 13 blocked, 7 decisions waiting', ''],
    [1, 'chevron-down', null, 'Engineering', '48 items, 62% done, 14 doing, 6 blocked, 1 decision waiting', 'eng'],
    [2, 'chevron-down', 'goal', 'Private beta · client', '64% done, due Nov 28, lead Noa, 5 doing, 3 review, 2 blocked', ''],
    [3, 'chevron-right', 'goal', 'Wave 71', '13 items, 31% done, 1 blocked, merge window tonight', 'focus'],
    [3, 'chevron-right', 'goal', 'Wave 70', 'done, merged Oct 27', ''],
    [2, 'chevron-right', 'goal', 'Private beta · server', '71% done, due Nov 21, 1 blocked', ''],
    [2, 'chevron-right', 'milestone', 'iOS release 1.0', '55% done, due Nov 21, 2 waiting on a person', ''],
    [2, 'chevron-right', 'milestone', 'Gate 1 Alpha', '81% done, due Nov 14, 4 in review', ''],
    [2, 'chevron-right', 'goal', 'EU data residency', '22% done, also in Europe launch (Compliance, Marketing)', ''],
    [1, 'chevron-right', null, 'Product', '22 items, 52% done, 2 decisions waiting', ''],
    [1, 'chevron-right', null, 'Marketing', '26 items, 38% done, 2 blocked', ''],
    [1, 'chevron-right', null, 'Compliance', '18 items, 31% done, 3 blocked, risk: DPA signature late', ''],
    [1, 'chevron-right', null, 'Design', '12 items, 70% done', ''],
    [1, 'chevron-right', null, 'Finance · Operations · People · Leadership', '4 domains, 31 items', ''],
  ];
  const tree = T.map(([lv, chev, k, n, spoken, f]) => `<div class="crow${f === 'focus' ? ' sel focus' : ''}" role="treeitem" aria-level="${lv + 1}" aria-expanded="${chev === 'chevron-down'}" tabindex="${f === 'focus' ? 0 : -1}" aria-label="${n}, ${spoken}" style="padding-inline-start:${10 + lv * 26}px">${I(chev)}${k === 'map' ? I('map') : k ? g(k, { size: 'sm' }) : `<span class="g sm f-slate">${I('hexagon')}</span>`}<span class="b" style="min-width:180px">${n}</span><span class="mut sm ell" style="flex:1">${spoken}</span></div>`).join('');
  const body = `<div class="split" style="display:flex;gap:12px;height:100%"><div class="pn pad col" style="flex:1;gap:2px" role="tree" aria-label="Company map as a tree">${tree}</div>
<aside class="pn l2 pad col" style="width:300px;flex:none;gap:10px"><div class="ph">${I('accessibility')}<h3 class="h3">Same map, as a list</h3></div><div class="sm mut">One toggle away from the terrain (${kbd('M')}). The hierarchy, roll-ups and flags are the map's; every row is focusable and named the way a screen reader speaks it.</div>
<div class="pn ai nb pad sm" style="border-radius:16px"><div class="xs mut">Spoken for the focused row</div>"Wave 71, level 4, collapsed. 13 items, 31% done, 1 blocked, merge window tonight."</div>
<div class="col sm" style="gap:6px"><div class="b">Keys</div>${[['↑ ↓', 'move'], ['→', 'expand / zoom in'], ['←', 'collapse / zoom out'], ['↵', 'open the item or grouping'], ['F', 'flags only (decisions, blocked, due)'], ['M', 'back to the map']].map(([k, t]) => `<div class="flex">${kbd(k)}<span>${t}</span></div>`).join('')}</div>
<div class="col sm" style="gap:4px"><div class="b">Filters</div><div class="flex wrapf" style="gap:6px">${chip('construction', 'Blocked · 13', 'sm')}${chip('flag', 'Decisions · 7', 'sm')}${chip('clock', 'Due this week · 11', 'sm')}</div></div></aside></div>`;
  return app({ active: 'map', crumbs: ['Company', 'List view'], label: 'The map as a list (tree) for screen readers and keyboard users', body });
}
// ---------- 11 · Z1 Engineering Hebrew ----------
function f11() {
  const s = z1EngScene(true);
  return app({ he: true, active: 'map', crumbs: ['חברה', 'הנדסה'], persp: 'CTO (נועה)', label: 'מפת הנדסה, זום 1, בעברית מימין לשמאל', body: mapBox(s, 690, mapTools({ he: true, zoom: 'Z1 תחום', layers: '5', lchips: domHead('הנדסה', { done: 62, doing: 14, blocked: 6, dec: 1, moved: 23 }, true) })) });
}
// ---------- 12 · Phone Z0 ----------
const PW = 366, PH = 560;
const PSITES = [
  { k: 'lead', n: 'Leadership', x: 70, y: 60, t: 7 }, { k: 'prod', n: 'Product', x: 260, y: 70, t: 22 }, { k: 'des', n: 'Design', x: 60, y: 190, t: 12 },
  { k: 'eng', n: 'Engineering', x: 150, y: 290, t: 48 }, { k: 'comp', n: 'Compliance', x: 300, y: 220, t: 18 }, { k: 'mkt', n: 'Marketing', x: 270, y: 400, t: 26 },
  { k: 'fin', n: 'Finance', x: 330, y: 330, t: 8 }, { k: 'ppl', n: 'People', x: 70, y: 490, t: 6 }, { k: 'ops', n: 'Operations', x: 220, y: 520, t: 10 },
];
const PC = (() => { const s = PSITES.map((x) => ({ ...x })); const c = treemap(s, superellipse(PW / 2, PH / 2, 178, 276, 3.2, 40, 0.04, 5), 220); return PSITES.map((d, i) => ({ ...d, poly: inset(c[i], 4), c: centroid(c[i]) })); })();
const PRU = { lead: [1, 0], prod: [2, 1], des: [0, 0], eng: [1, 6], comp: [2, 3], mkt: [1, 2], fin: [0, 0], ppl: [0, 0], ops: [0, 1] };
function f12() {
  const HEAT = { eng: [1, 90], prod: [.5, 60], mkt: [.5, 70], des: [.3, 50], comp: [.3, 50] };
  const svg = terrain(PW, PH, PC.map((d) => cellPath(d.poly, 'cell', 22)).join('') + PC.filter((d) => HEAT[d.k]).map((d) => heat(d.c[0], d.c[1], HEAT[d.k][1], HEAT[d.k][0])).join(''));
  const ov = PC.map((d) => { const [dec, bl] = PRU[d.k]; return at(d.c[0], d.c[1], PW, PH, `<div class="reglabel sm" role="button" tabindex="0" aria-label="${d.n}${bl ? ', ' + bl + ' blocked' : ''}${dec ? ', ' + dec + ' decisions' : ''}"><span class="nm" style="font-size:${d.t > 15 ? 14 : 11.5}px">${d.n}</span>${(dec || bl) ? `<span class="cl">${bl ? `<span>${st('blocked')}${bl}</span>` : ''}${dec ? `<span><span class="sg rules">${I('flag')}</span>${dec}</span>` : ''}</span>` : ''}</div>`); }).join('')
    + at(PC.find((d) => d.k === 'eng').c[0], PC.find((d) => d.k === 'eng').c[1] + 46, PW, PH, `<span class="presence">${pav('N', 'xs r-doing')}${agav('Coordinator (Fable)', 'xs r-doing')}${agav('Worker C · stuck', 'xs r-stuck')}</span>`);
  const goalsC = `<div style="display:flex;gap:8px;overflow:hidden;margin:0 -12px;padding:0 12px" role="list" aria-label="Goals carousel">${[['Private beta · 200 users', 58, 'wk 25 · at risk', 'hold'], ['Gate 1 Alpha', 81, 'Nov 14 · on track', 'good'], ['Europe launch ready', 34, 'wk 30 · on track', 'good']].map(([n, d, f, c]) => `<div class="goal" role="listitem" style="flex:0 0 230px;padding:8px 10px">${g('goal')}<div class="tx"><b>${n}</b><small><span class="bar" style="width:46px"><i style="width:${d}%"></i></span>${d}% · <span class="sg ${c}">${I(c === 'good' ? 'trending-up' : 'trending-down')}</span>${f}</small></div></div>`).join('')}</div>`;
  const body = `${goalsC}<div class="mapc" style="height:${PH}px;flex:none;margin:0 -2px" role="application" aria-label="Company map">${svg}<div class="ov">${ov}<div class="mtools" style="inset-inline-end:8px;bottom:8px">${ib('locate-fixed', 'Recentre')}${ib('list-tree', 'List equivalent')}</div><div style="position:absolute;inset-inline-start:8px;bottom:8px">${chip('layers', 'Layers · 4', 'sm')}</div></div></div>`;
  return phone({ active: 'map', label: 'Phone: company map, zoom 0', top: `<div class="ph-top"><div class="ttl"><b>Lucid</b><small>Company · seeing as Owner</small></div>${ib('search', 'Search')}${ib('bell', 'Notifications', '', '3')}</div>`, body, sbstyle: 'gap:8px' });
}
// ---------- 13 · Phone Z2 line view ----------
function f13() {
  const groups = [['doing', 'Doing', ['P1-C-03', 'P1-C-04', 'BUG-212']], ['review', 'Review', ['P1-C-02', 'L489-F3']], ['ready', 'Ready', ['CH-RW-TOKEN', 'P1-C-05', 'ENV-STATUS-SITE-F6']], ['done', 'Done · 3', []]];
  const rows = groups.map(([s, n, ids]) => `<div class="flex b sm" style="padding:6px 4px 2px">${st(s)}${n}<span class="mut num">${ids.length || ''}</span><span class="sp"></span>${I(ids.length ? 'chevron-down' : 'chevron-right')}</div>${ids.map((i) => { const w = WAVE.find((x) => x.id === i); return `<div class="crow" style="padding:9px 10px;align-items:flex-start;background:var(--g1);border-radius:16px" role="button" tabindex="0" aria-label="${w.id}, ${w.t}">${g(w.k, { size: 'sm' })}<div style="flex:1;min-width:0"><div class="flex" style="gap:6px">${id(w.id)}<span class="sp"></span>${pri(w.p)}${w.conf ? conf(w.conf) : ''}</div><div class="b" style="font-size:13.5px;line-height:1.3">${w.t}</div>${w.wl ? `<div class="xs" style="color:var(--ai-ink);margin-top:3px">${AI()} ${w.wl}</div>` : ''}${w.blocked ? `<div style="margin-top:4px"><span class="tag block">${I('construction')}${w.blocked}</span></div>` : ''}${w.wait ? `<div style="margin-top:4px"><span class="tag hold">${I('hourglass')}Yossi · today</span></div>` : ''}</div>${who(w.a, 'sm')}</div>`; }).join('')}`).join('');
  const body = `<div class="pn" style="padding:10px;border-radius:30px;background:color-mix(in srgb,var(--fg) 8%,transparent);display:flex;flex-direction:column;gap:6px">${rows}</div>`;
  return phone({ active: 'map', label: 'Phone: Wave 71 as lines inside its cell', top: `<div class="ph-top">${ib('chevron-left', 'Back to Private beta')}<div class="ttl"><b style="font-size:18px">Wave 71</b><small>Private beta · 31% · 1 blocked</small></div><span class="seg" role="radiogroup" aria-label="Lines or cards"><span class="on" role="radio" aria-checked="true">${I('rows-3')}</span><span role="radio" aria-checked="false" aria-label="Cards">${I('square-kanban')}</span></span></div>`, body });
}

export function sectionA() {
  return [
    fig(1, 'Z0 Company map, owner perspective', f1(), 'Domains as soft cells sized by open work (a weighted Voronoi treemap), heat where things moved today (with the count in each label so colour is never the only signal), presence avatars with status rings, the goals horizon (done share and forecast), the owner\'s two material decisions as large flags, a risk as a weather front over Compliance, the legend, the layers menu closed, the perspective chip "Seeing as: Owner". At the border, two embassies: the accounting firm (engaged, payroll) and legal counsel (virtual, awaiting a reply). At the Founders stage the default home is Z1–Z2 (docs/02 §2.8); this is the owner zoomed out to Z0.', 'UC-A1 UC-A5 UC-A6 UC-P2 §5.1 §4.10 docs/03§3–4'),
    fig(2, 'Z1 Engineering, CTO perspective', f2(), 'Engineering centred and large; its programs, releases and epics as cells with micro-stats (done-share sparkline, due, lead); cluster pills by state (doing · review · blocked · waiting). The "Europe launch" program is one lime hull from the EU data residency cell across the borders into Compliance and Marketing, with "continues · 7" and "· 5" chevrons; neighbours sit at the edge, cut off. Breadcrumb Company › Engineering.', 'UC-A2 UC-A3 UC-E1 docs/03§3.3 §5'),
    fig(3, 'Z1 Marketing, CMO perspective (same company)', f3(), 'The same model arranged for Omer: Marketing centred, the Europe hull seen from the other side, roads into Engineering releases (the critical road from the App Store listing to the iOS 1.0 station), a blocked road (barrier) towards Compliance\'s consent-texts approval, the paid-search budget as a spend chip. No item is duplicated; only arrangement and emphasis change.', 'UC-E1 UC-A3 UC-C5 docs/03§5'),
    fig(4, 'Z2 Epic "Wave 71": cards by state, roads, weather, minimap', f4(), 'Cards laid out along the state axis inside the epic\'s cell (Proposed → Done). P1-C-03 is selected: its relations light up (depends on P1-C-02, blocks P1-C-07 on the thick critical road, relates to P1-C-04) and everything else dims. P1-C-04\'s road from the chore "Put the Railway staging token in an envelope" carries the barrier glyph; a weather front marks the flaky-integration-suite risk; the minimap shows where Wave 71 sits in the company.', 'UC-A2 UC-A4 UC-B4 UC-B6 docs/03§4 Z2'),
    fig(5, 'Z2 Wave 71 as line view', f5(), 'The same cell with cards collapsed to rows grouped by state, keeping every glyph (kind, priority, confidence, blocked, waiting on a person, the agent\'s working line). The Cards · Lines toggle sits with the map tools.', '§5.2 docs/03§4 UC-B6'),
    fig(6, 'What-if: "Draft: Europe first"', f6(), 'The draft chip is on: ghosts in the AI hue (dashed outlines where cells would grow or shrink, arrows from current to proposed, date chips) over the Engineering map, and the change-set panel: 23 priority boosts, a $1,200/mo budget shift, three dates moving, Dana and Noa over capacity, nine people notified; what slips; Apply · Save draft · Discard. Nothing is applied until Apply.', 'UC-C1 UC-C2 UC-K3 §6.2 §6.3'),
    fig(7, 'Meeting perspective: "Beta readiness"', f7(), 'The meeting banner re-centres the map on the Private beta program for the attendees: its parts in four domains, open decisions and risks as flags and fronts, everything else at the edge. The assistant listens: "Relay ships in beta" is captured as a decision card with its change set and Confirm; a reversible assignment is applied at once with Undo; a large scope change is batched for the end.', 'UC-C6 UC-E3 §7.8 docs/03§5'),
    fig(8, 'Timeline layer', f8(), 'The same groupings slide onto a time axis: bars with done share, gates as gold milestone lines (Gate 1 Alpha, iOS 1.0 submission, beta opens, EU launch), dependency lines (critical path thick, the blocked consent-texts link dashed in coral), today in the accent. Undated items are listed beside, never faked onto the axis.', 'UC-A8 UC-B8 §5.4 docs/03§3.9'),
    fig(9, 'The map as a list (tree)', f9(), 'The list equivalent for screen readers and keyboard users: the same hierarchy and roll-ups as a tree (role=tree, levels, expanded state), the focused row with its spoken name, the keys, and flag filters. One toggle (M) from the terrain.', 'docs/03§9 §5.11 WCAG 2.2'),
    fig(10, 'Z0 in high contrast (Deep Blue variant)', f1({ pt: 'deep', hc: 'high', label: 'Company map, high contrast' }), 'Deep Blue\'s high-contrast variant fixed on this frame: flat two-stop ground, opaque cells and panels with visible 1 px edges, no blur, no heat glow (the "moved today" counts carry it), white text at 7:1, focus rings 3 px.', 'docs/03§9 Lucid docs/10§9'),
    fig(11, 'Z1 Engineering in Hebrew, right to left', f11(), 'The rail on the right, the terrain mirrored, labels in Hebrew (Heebo), the "continues" chevrons pointing left, the breadcrumb reading right to left; numbers and ids stay left to right inside their runs; non-directional glyphs do not mirror.', 'docs/03§9 §5.11 docs/00§9'),
  ].join('') + `<div class="row2">${fig(12, 'Phone: Z0 map with goals carousel', f12(), 'Large cells, no roads, short labels, tappable cluster pills (blocked, decisions), the goals horizon as a top carousel, recentre and list buttons, the floating pill nav (Inbox · Map · My work · Chat · More).', 'docs/03§8 §5.10')}${fig(13, 'Phone: Z2 line view inside a cell', f13(), 'Wave 71 opened on the phone: the line view inside the cell (rows by state, collapsible groups), the back chip as breadcrumb, the Lines · Cards toggle; every row keeps its glyphs and the agent\'s working line.', 'docs/03§8 §5.2')}</div>`;
}
