import { desk, phone, fig, chip, pill, I, AIC, g, av, agent, flag, flagSm, embassy, at, box, ring, place, building, kindBld, barrier } from './lib.mjs';
import { world, terrain, layout, PL } from './world.mjs';
import { COMPANY } from './company.mjs';
import { F, phoneScreen } from './facades.mjs';
import { lm } from './landmarks.mjs';
import { f35 } from './framesH.mjs';
import { blob, superellipse, r1 } from './geo.mjs';

const C = COMPANY; const P = C.places;
const pp = (k, dx = 0, dy = 0) => [P[k].pole[0] + dx, P[k].pole[1] + dy];
const tether = (a, b) => `<path class="road tether" d="M${a[0]},${a[1]}Q${(a[0] + b[0]) / 2 + 20},${(a[1] + b[1]) / 2 - 30} ${b[0]},${b[1]}"/>`;
const SMALL = { sys: 'xs', ppl: 's', ldr: 's', fin: 's', sal: 's', ops: 's' };

// ---------- needs-you card (320 x 200): glyph, one-line ask, one visual, two replies ----------
export function needs(o) {
  return `<article class="ny gl l2" data-needs="1" aria-label="Needs you: ${o.aria || o.q}"><div class="row" style="align-items:flex-start;gap:12px">${o.glyph}<span class="q">${o.q}</span></div><div class="row" style="gap:14px;align-items:stretch"><span class="vis">${o.vis}</span><span class="opts">${o.opts}</span></div></article>`;
}
// a small world cut-out of the Store stream: its district, two facades, a front, the gate ring
const storeCut = () => `<svg viewBox="0 0 150 96" aria-hidden="true"><defs><pattern id="sch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><line x1="0" y1="0" x2="0" y2="7" style="stroke:var(--f-sharp)" stroke-opacity=".6" stroke-width="1.6"/></pattern><filter id="sfe"><feGaussianBlur stdDeviation="4"/></filter><mask id="sfm"><ellipse cx="44" cy="30" rx="40" ry="22" fill="#fff" filter="url(#sfe)"/></mask></defs>
<path d="${blob(superellipse(66, 50, 58, 38, 2.4, 16, 0.12, 4), 0.9)}" style="fill:color-mix(in srgb,var(--f-warm) 16%,transparent);stroke:var(--gl)"/>
<rect x="14" y="8" width="70" height="44" mask="url(#sfm)" fill="url(#sch)"/>
<g transform="translate(24 40)"><rect width="34" height="26" rx="5" fill="#16213d"/><rect x="5" y="5" width="11" height="11" rx="3" fill="#8dbaff"/><rect x="19" y="6" width="11" height="3" rx="1.5" fill="#fff" fill-opacity=".8"/><rect x="5" y="19" width="24" height="3" rx="1.5" fill="#47d16c"/></g>
<g transform="translate(64 36)" opacity=".5"><rect width="30" height="30" rx="5" fill="none" stroke="currentColor" stroke-dasharray="3 3"/><rect x="5" y="5" width="20" height="20" rx="3" fill="#ff8a5c" fill-opacity=".6"/></g>
<path d="M58 53 Q 96 70 118 46" style="stroke:var(--fg)" stroke-opacity=".75" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<g transform="translate(104 20)"><circle cx="16" cy="16" r="15" fill="none" style="stroke:var(--ink18)" stroke-width="3"/><circle cx="16" cy="16" r="15" fill="none" style="stroke:var(--f-gold)" stroke-width="3" pathLength="100" stroke-dasharray="62 100" stroke-dashoffset="25" stroke-linecap="round"/><g transform="translate(6 6) scale(.42)"><path d="M8 42V18a16 12 0 0 1 32 0v24M14 42V20a10 8 0 0 1 20 0v22M5 42h38" fill="none" style="stroke:var(--fg)" stroke-width="3" stroke-linecap="round"/></g></g></svg>`;
const danShot = () => F.screens({ k1: 'consent', k2: 'consentHe', a: '#cfe0ff', c: '#efe6ff', label: 'Dana\'s screenshots: the consent screen in English and Hebrew' });

export function horizonCards(phone = false) {
  const c1 = needs({ glyph: `<span class="g lg f-rules" role="img" aria-label="Decision, a fork">${I('signpost')}</span>`, q: 'Store submission: go or hold?', vis: storeCut(), opts: pill(AIC(), 'After the fix', 'pri', 'Recommended: submit after the Hebrew fix') + pill('git-fork', 'See the paths', '', 'Open the fork'), aria: 'a fork: store submission, go or hold' });
  const c2 = needs({ glyph: `<span class="av md p2" role="img" aria-label="Dana asks for feedback">D</span>`, q: 'Dana: does the consent screen match?', vis: danShot(), opts: pill('check', 'It matches', 'pri') + pill('message-circle', 'Comment'), aria: 'Dana asks for feedback on the consent screen' });
  const c3 = needs({ glyph: `<span class="g lg f-slate" role="img" aria-label="Envelope">${I('vault')}</span>`, q: 'The coordinator needs the Railway token', vis: F.envelope({ bg: '#26324f' }), opts: pill('lock', 'Seal and send', 'pri') + pill('clock', 'Tonight'), aria: 'an envelope: the coordinator asks for the Railway staging token' });
  return [c1, c2, c3];
}
const GOALS = [['Private beta', 0.58, 0.86, 'Private beta with 200 users in three markets: 58 % done, forecast reaches 86 % by week 24'], ['Gate 1 Alpha', 0.81, 1, 'Gate 1 Alpha accepted: 81 % done, on track'], ['Europe ready', 0.34, 0.7, 'Europe launch ready: 34 % done, forecast reaches 70 % by week 30']];
const goalRing = ([n, v, f, a], size = 64) => `<div class="goalr"><span style="position:relative;display:grid;place-items:center">${ring(size, v, { fc: f, w: 4, label: a })}<span style="position:absolute;color:var(--f-gold)">${I('target')}</span></span><span class="nm">${n}</span></div>`;

// ---------- frame 1: Horizon, owner, morning ----------
const goalOnLine = ([n, v, f, a]) => `<div class="goalr" style="flex-direction:column-reverse"><span style="position:relative;display:grid;place-items:center;border-radius:50%;background:color-mix(in srgb,var(--ground-base) 70%,transparent);box-shadow:0 0 0 6px color-mix(in srgb,var(--ground-base) 40%,transparent)">${ring(76, v, { fc: f, w: 4, label: a })}<span style="position:absolute;color:var(--f-gold)">${I('target')}</span></span><span class="nm">${n}</span></div>`;
export function f01() {
  const [c1, c2, c3] = horizonCards();
  const tilted = `<div class="tiltwrap"><div class="tilt" style="--tx:54deg;transform-origin:50% 100%;top:40px;transform:perspective(1300px) rotateX(54deg) scale(1.5)">${world(C, { heat: [{ at: pp('eng', 40, 20), r: 190 }], fronts: [{ at: pp('cmp', 50, -50), rx: 130, ry: 70 }], sizes: { eng: 'l', ...SMALL }, noNames: ['ldr', 'prd', 'dsg', 'cmp', 'fin'], smallNames: true, id: 'f1' })}</div></div>`;
  const body = `${tilted}<div class="hz-glow" style="top:316px"></div><div class="hz-line" style="top:495px"></div>
${box(0, 44, 1440, 40, `<div class="ttl t4" style="text-align:center">Good morning, Yossi</div>`)}
${box(192, 104, 1056, 200, `<div class="row" style="gap:48px;justify-content:center">${c1}${c2}${c3}</div>`)}
${box(0, 334, 1440, 50, `<div style="text-align:center"><span class="since gl l2">${I('history')}<span>Since yesterday</span><i class="sep"></i>${I('building-2')}<span>14 buildings lit</span><i class="sep"></i>${I('route')}<span>2 roads opened</span><i class="sep"></i>${I('cloud')}<span>1 front grew over Compliance</span></span></div>`)}
${box(300, 402, 840, 140, `<div class="row" style="justify-content:space-between;padding:0 40px">${GOALS.map(goalOnLine).join('')}</div>`)}`;
  return desk({ label: 'Horizon, owner, morning', body, crumb: ['Horizon'], active: 'horizon' });
}
// the phone check of frame 1 (frame 34 is the full phone Horizon)
export function f01p() {
  const [c1, c2, c3] = horizonCards(true);
  const tiles = ['eng', 'mkt', 'cmp', 'prd', 'sup'].map((k) => `<div class="gl" style="width:104px;flex:none;padding:14px 8px 12px;border-radius:22px;position:relative;overflow:hidden">${k === 'eng' ? '<span style="position:absolute;inset:-20px;background:radial-gradient(closest-side,color-mix(in srgb,var(--f-heat) 30%,transparent),transparent)"></span>' : ''}${place({ ...P[k] }, { size: 's', disc: true })}</div>`).join('');
  const body = `${box(25, 96, 350, 40, `<div class="ttl t3">Good morning, Yossi</div>`)}
<div style="position:absolute;left:25px;top:172px;width:340px;height:200px;transform:scale(.9);transform-origin:50% 100%;opacity:.55">${c3.replace('class="ny gl l2"', 'class="ny gl l2" style="width:340px"')}</div><div style="position:absolute;left:25px;top:160px;width:340px;height:200px;transform:scale(.95);transform-origin:50% 100%;opacity:.8">${c2.replace('class="ny gl l2"', 'class="ny gl l2" style="width:340px"')}</div>${box(25, 146, 340, 200, c1.replace('class="ny gl l2"', 'class="ny gl l3" style="width:340px"'))}
<div style="position:absolute;top:366px;left:0;right:0;display:flex;justify-content:center" class="meta">and 2 more</div>
<div class="hz-line" style="top:446px"></div>
${box(16, 410, 358, 120, `<div class="row" style="justify-content:space-around">${GOALS.map((x) => goalRing(x, 56)).join('')}</div>`)}
${box(16, 540, 700, 140, `<div class="row" style="gap:10px;align-items:stretch">${tiles}</div>`)}`;
  return phone({ label: 'Phone check: the Horizon at 390 px', body, active: 'horizon' });
}
// ---------- frame 2: the company world, owner ----------
export function f02() {
  const over = [
    [...pp('eng', 92, -66), flag('Store go/no-go', 'signpost', 'Store submission go or no-go'), { cls: 'tl' }],
    [...pp('ldr', -40, -96), flag('Europe first', 'signpost', 'Europe first, before the US'), { cls: 'tl' }],
    [...pp('eng', 0, 96), `<span class="avs">${av('N', 'doing')}${agent('Worker B', 'doing')}${agent('Worker C', 'doing')}</span>`],
    [...pp('cmp', 0, 84), `<span class="avs">${av('D', 'wait')}</span>`],
    [...pp('mkt', 0, 84), `<span class="avs">${av('O', 'doing')}</span>`],
    [...pp('ldr', 0, 70), `<span class="avs">${av('Y')}</span>`],
    [1065, 98, `<div class="tip" role="tooltip"><span class="row" style="gap:8px">${g('risk', 'sm')}<b>DPA signature late</b></span><span class="meta">Cohen Legal has not signed · Europe launch waits</span></div>`],
    [1350, 170, embassy('scale', 'Legal counsel', 'wait', 'Cohen Legal, waiting on them for the DPA')],
    [1395, 440, embassy('calculator', 'Accounting', '', 'Levi and Co. CPA, engaged for payroll')],
  ];
  const extra = tether([1350, 170], pp('cmp', 60, 0)) + tether([1395, 440], pp('fin', 50, 10));
  const body = world(C, { heat: [{ at: pp('eng', 40, 20), r: 190 }], fronts: [{ at: pp('cmp', 50, -50), rx: 130, ry: 70 }], extra, over, sizes: { eng: 'l', ...SMALL }, id: 'f2' });
  return desk({ label: 'The company world, owner perspective', body, crumb: ['Company'], tend: chip('eye', 'Owner', '', 'Perspective: Owner') + chip('layers', 'Legend', 'quiet', 'Legend and layers, closed'), active: 'world' });
}

// ---------- charts (dataviz: headline is the finding, value above the trend, thin marks, end labels only) ----------
export function lineChart(o) {
  const W = o.w || 352, H = o.h || 120, pad = 6; const v = o.v; const max = o.max ?? Math.max(...v) * 1.1, min = o.min ?? 0;
  const X = (i) => pad + i * ((W - pad * 2 - 40) / (v.length - 1)); const Y = (x) => H - 22 - (x - min) / (max - min) * (H - 34);
  const d = v.map((x, i) => `${i ? 'L' : 'M'}${r1(X(i))},${r1(Y(x))}`).join('');
  const last = v.length - 1;
  return `<figure class="chart" style="margin:0"><div class="say">${o.say}</div><div class="now"><b>${o.now}</b><span class="mut">${o.unit}</span></div>
<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="${o.aria}"><line class="base" x1="${pad}" x2="${W - 34}" y1="${H - 22}" y2="${H - 22}"/><path d="${d}L${r1(X(last))},${H - 22}L${pad},${H - 22}Z" style="fill:${o.c}" fill-opacity=".1"/><path d="${d}" fill="none" style="stroke:${o.c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>${o.mark != null ? `<line x1="${r1(X(o.mark))}" x2="${r1(X(o.mark))}" y1="${r1(Y(v[o.mark]) + 8)}" y2="${H - 22}" style="stroke:var(--ink45)" stroke-dasharray="2 3"/>` : ''}<circle cx="${r1(X(last))}" cy="${r1(Y(v[last]))}" r="4.5" style="fill:${o.c};stroke:var(--g1)" stroke-width="2"><title>${o.endTitle}</title></circle><text class="ax" x="${pad}" y="${H - 4}">${o.x0}</text><text class="ax" x="${r1(X(last))}" y="${H - 4}" text-anchor="middle">${o.x1}</text></svg><figcaption class="meta" style="margin-top:4px">${o.foot || ''}</figcaption></figure>`;
}
export function barRank(o) {
  const W = o.w || 352; const max = Math.max(...o.rows.map((r) => r[1])); const bw = W - 150;
  return `<figure class="chart" style="margin:0"><div class="say">${o.say}</div>
<svg viewBox="0 0 ${W} ${o.rows.length * 34}" height="${o.rows.length * 34}" role="img" aria-label="${o.aria}">${o.rows.map(([n, v, lab], i) => { const w = Math.max(8, v / max * bw); const y = i * 34 + 6; return `<text class="ax" x="0" y="${y + 13}" style="fill:${i === o.hi ? 'var(--fg)' : 'var(--muted)'}">${n}</text><path d="M118,${y}h${r1(w - 4)}q4,0 4,4v10q0,4 -4,4h-${r1(w - 4)}Z" style="fill:${i === o.hi ? o.c : 'var(--ink25)'}"><title>${n}: ${lab}</title></path><text class="lbl" x="${r1(118 + w + 8)}" y="${y + 13}">${lab}</text>`; }).join('')}</svg></figure>`;
}

// ---------- frame 3: the same world, CMO perspective ----------
const CMO = layout({ W: 1440, H: 900, coast: { cx: 540, cy: 460, rx: 470, ry: 375, n: 2.5, wob: 0.08, seed: 21 },
  places: [{ k: 'mkt', x: 470, y: 470, t: 34, subs: [5, 3, 2, 2] }, { k: 'cmp', x: 850, y: 230, t: 9, subs: [2, 2] }, { k: 'eng', x: 880, y: 600, t: 11, subs: [3, 2, 2] }, { k: 'prd', x: 250, y: 170, t: 5 }, { k: 'dsg', x: 560, y: 130, t: 4 }, { k: 'sal', x: 150, y: 480, t: 5 }, { k: 'sup', x: 330, y: 790, t: 5 }, { k: 'ldr', x: 640, y: 800, t: 4 }] });
export function f03() {
  const Q = CMO.places; const m = Q.mkt.pole;
  const hull = `<path class="hull" d="${blob([[420, 300], [560, 250], [700, 210], [860, 190], [940, 250], [900, 330], [800, 380], [850, 470], [930, 560], [900, 640], [800, 620], [720, 520], [600, 420], [470, 400], [400, 350]], 0.8)}"/>`;
  const sky = ['mEU', 'hv', 'ph'];
  const skyline = `<div class="row" style="gap:18px;align-items:flex-end">${building(F.landing({ label: 'Europe waitlist page' }), { w: 150, segs: ['met', 'met', 'partly', 'open'], label: 'Europe waitlist page: live, 2 of 4 criteria met' })}${building(F.video({ label: 'Hebrew launch video' }), { w: 176, segs: ['met', 'met', 'met', 'met', 'partly'], label: 'Hebrew launch video: 4 of 5 criteria met' })}${building(F.poster({ t: 'Bonjour,', t2: 'Lucid', a: '#ffb36b', b: '#ff6fae', c: '#5a2f8f', label: 'France teaser' }), { w: 130, exp: true, label: 'France teaser, expected' })}</div>`;
  const over = [
    [m[0], m[1] - 150, place(Q.mkt, { size: 'xl' })],
    [m[0] - 20, m[1] + 70, skyline],
    [m[0] - 10, m[1] + 190, `<span class="avs">${av('O', 'doing')}${agent('Campaign agent', 'wait')}</span>`],
    [770, 395, `<span class="cont">${I('chevrons-right')}Europe launch continues</span>`],
  ];
  const fade = []; const amb = ['prd', 'dsg', 'sal', 'sup', 'ldr', 'eng', 'cmp'];
  const charts = lineChart({ say: 'Europe sign-ups grew 38 % in four weeks', now: '1,240', unit: 'on the waitlist', v: [310, 380, 420, 520, 640, 760, 900, 1050, 1240], c: 'var(--cv-mkt)', x0: 'Sep 1', x1: 'now', mark: 4, aria: 'Europe waitlist sign-ups over eight weeks, rising from 310 to 1,240', endTitle: '1,240 sign-ups this week', foot: 'Dashed: the Hebrew video went live.' })
    + barRank({ say: 'The Hebrew video converts best', rows: [['Hebrew video', 6.1, '6.1 %'], ['Waitlist page', 3.4, '3.4 %'], ['Partner posts', 2.2, '2.2 %']], hi: 0, c: 'var(--cv-mkt)', aria: 'Conversion by campaign: Hebrew video 6.1 %, waitlist page 3.4 %, partner posts 2.2 %' });
  const panel = `<aside class="aspect gl l2" aria-label="Market aspect"><div class="hd"><span class="g lg f-violet" role="img" aria-label="Market aspect">${I('trending-up')}</span><span class="ttl t3">Market</span><span class="grow"></span>${chip('arrow-up-right', 'Open', 'quiet', 'Open the Market aspect as a page')}</div>${charts}</aside>`;
  const body = world(CMO, { ambient: amb, fade, extra: hull, over, sizes: { mkt: 'xl', prd: 's', dsg: 's', sal: 's', sup: 's', ldr: 's' }, hideMarkers: ['mkt'], id: 'f3' }) + panel;
  return desk({ label: 'The same world, CMO perspective', body, crumb: ['Company'], tend: chip('eye', 'Marketing', '', 'Perspective: Marketing, Omer'), active: 'world' });
}
import { fitPoly } from './world.mjs';
import { bbox, curve } from './geo.mjs';
const frac = (b, defs) => { const [x0, y0, x1, y1] = bbox(b); return defs.map((d) => ({ ...d, x: x0 + (x1 - x0) * d.fx, y: y0 + (y1 - y0) * d.fy })); };

// ---------- Engineering's sub-map (programs) and the Private beta wave (streams), laid out inside their parents' contours ----------
const ENG_B = fitPoly(P.eng.poly, 96, 84, 880, 700);
export const ENG = layout({ W: 1440, H: 900, boundary: ENG_B, places: frac(ENG_B, [{ k: 'beta', fx: 0.36, fy: 0.42, t: 30, subs: [3, 3, 2, 2] }, { k: 'ios', fx: 0.74, fy: 0.26, t: 14, subs: [2, 1] }, { k: 'eu', fx: 0.84, fy: 0.66, t: 10, subs: [2, 1] }, { k: 'evals', fx: 0.24, fy: 0.84, t: 10, subs: [2, 1] }, { k: 'plat', fx: 0.6, fy: 0.84, t: 9, subs: [1, 1] }]) });
const WAVE_B = fitPoly(ENG.places.beta.poly, 110, 76, 1080, 760);
export const WAVE = layout({ W: 1440, H: 900, boundary: WAVE_B, places: frac(WAVE_B, [{ k: 'disp', fx: 0.27, fy: 0.33, t: 10 }, { k: 'relay', fx: 0.73, fy: 0.3, t: 9 }, { k: 'evst', fx: 0.3, fy: 0.78, t: 7 }, { k: 'store', fx: 0.74, fy: 0.76, t: 8 }]) });

// ---------- frame 4: the zoom reveal, three stills ----------
export function f04() {
  const S = 392, H = 440, xs = [104, 544, 984], y0 = 120;
  const s1 = `<div class="still gl" style="inset-inline-start:${xs[0]}px;top:${y0}px;width:${S}px;height:${H}px"><div style="position:absolute;left:${(S - 1440 * 0.31) / 2}px;top:${(H - 900 * 0.31) / 2 - 20}px;width:1440px;height:900px;transform:scale(.31);transform-origin:0 0">${world(C, { focus: 'eng', fade: Object.keys(P).filter((k) => k !== 'eng'), sizes: { eng: 'l', ...SMALL }, noNames: Object.keys(P), id: 'f4a' })}</div><div class="cap"><span class="ttl t2">Company</span></div></div>`;
  const E2 = layout({ W: S, H: H, boundary: fitPoly(P.eng.poly, 22, 30, S - 44, H - 110), places: frac(fitPoly(P.eng.poly, 22, 30, S - 44, H - 110), [{ k: 'beta', fx: 0.36, fy: 0.42, t: 30, subs: [3, 3, 2, 2] }, { k: 'ios', fx: 0.74, fy: 0.26, t: 14 }, { k: 'eu', fx: 0.84, fy: 0.66, t: 10 }, { k: 'evals', fx: 0.24, fy: 0.84, t: 10 }, { k: 'plat', fx: 0.6, fy: 0.84, t: 9 }]) });
  const emb = (k) => `<span class="place h-${PL[k].hue}" style="flex-direction:row;gap:8px">${lm(PL[k].lm, 26)}</span>`;
  const s2 = `<div class="still gl" style="inset-inline-start:${xs[1]}px;top:${y0}px;width:${S}px;height:${H}px">${world(E2, { focus: 'beta', sizes: { beta: 's', ios: 'xs', eu: 'xs', evals: 'xs', plat: 'xs' }, noNames: ['ios', 'eu', 'evals', 'plat'], id: 'f4b', style: `inset-inline-start:0;top:0;width:${S}px;height:${H}px` })}<div style="position:absolute;top:16px;inset-inline-start:18px">${emb('eng')}</div><div class="cap"><span class="ttl t2">Engineering</span></div></div>`;
  const B3 = fitPoly(E2.places.beta.poly, 22, 30, S - 44, H - 110);
  const W3 = layout({ W: S, H: H, boundary: B3, places: frac(B3, [{ k: 'disp', fx: 0.27, fy: 0.33, t: 10 }, { k: 'relay', fx: 0.73, fy: 0.3, t: 9 }, { k: 'evst', fx: 0.3, fy: 0.78, t: 7 }, { k: 'store', fx: 0.74, fy: 0.76, t: 8 }]) });
  const tiny = (f, x, y, o = {}) => [x, y, building(f, { w: 58, ...o })];
  const s3 = `<div class="still gl" style="inset-inline-start:${xs[2]}px;top:${y0}px;width:${S}px;height:${H}px">${world(W3, { sizes: { disp: 'xs', relay: 'xs', evst: 'xs', store: 'xs' }, noNames: ['disp', 'relay', 'evst', 'store'], id: 'f4c', style: `inset-inline-start:0;top:0;width:${S}px;height:${H}px`, over: [tiny(F.chart({}), W3.places.disp.pole[0] + 10, W3.places.disp.pole[1] + 52), tiny(F.screens({}), W3.places.relay.pole[0], W3.places.relay.pole[1] + 52), tiny(F.report({}), W3.places.evst.pole[0] + 48, W3.places.evst.pole[1] - 6), tiny(F.badge({}), W3.places.store.pole[0] - 52, W3.places.store.pole[1] + 4), tiny(F.screens({ a: '#ffe1c9', c: '#ffd0e4' }), W3.places.store.pole[0] + 30, W3.places.store.pole[1] + 52, { exp: true })] })}<div style="position:absolute;top:16px;inset-inline-start:18px">${emb('beta')}</div><div class="cap"><span class="ttl t2">Private beta</span></div></div>`;
  const arrow = (x) => box(x, y0 + H / 2 - 28, 56, 56, `<span class="pill" style="width:48px;height:48px;padding:0;border-radius:50%" role="img" aria-label="Zoom in">${I('zoom-in')}</span>`);
  const note = box(104, 600, 1272, 60, `<div class="row" style="justify-content:space-between;color:var(--muted)"><span style="width:392px;text-align:center">Engineering lit; the rest fades in place</span><span style="width:392px;text-align:center">Its contour becomes the frame; programs appear</span><span style="width:392px;text-align:center">Streams become districts; facades appear</span></div>`);
  const body = s1 + s2 + s3 + arrow(500) + arrow(940) + note;
  return desk({ label: 'Zoom reveal, three stills', body, crumb: ['Company', 'Engineering', 'Private beta'], active: 'world' });
}

// ---------- the Delivery stream chart (cumulative flow by state, forecast band) ----------
export function streamChart(o = {}) {
  const W = 352, H = 168, pad = 4, base = H - 22;
  const done = [40, 52, 61, 75, 88, 104, 117, 131], doing = [18, 20, 22, 21, 24, 22, 25, 23], prop = [70, 72, 74, 73, 70, 66, 62, 58];
  const n = done.length, fw = 3, max = 240; const X = (i) => pad + i * ((W - pad * 2 - 30) / (n - 1 + fw)); const Y = (v) => base - v / max * (H - 40);
  const area = (lo, hi, c, t) => `<path d="${lo.map((v, i) => `${i ? 'L' : 'M'}${r1(X(i))},${r1(Y(v))}`).join('')}${hi.map((v, i) => `L${r1(X(n - 1 - i))},${r1(Y(hi[n - 1 - i]))}`).join('')}Z" style="fill:${c}"><title>${t}</title></path>`;
  const z = done.map(() => 0), d1 = done, d2 = done.map((v, i) => v + doing[i]), d3 = d2.map((v, i) => v + prop[i]);
  const gap = (arr) => arr.map((v) => v - 0.9);
  const fl = [[n - 1, 131, 131], [n, 140, 148], [n + 1, 150, 163], [n + 2, 158, 178]];
  const band = `<path d="${fl.map(([i, a], j) => `${j ? 'L' : 'M'}${r1(X(i))},${r1(Y(a))}`).join('')}${fl.slice().reverse().map(([i, , b]) => `L${r1(X(i))},${r1(Y(b))}`).join('')}Z" style="fill:var(--cv-n)" fill-opacity=".22"><title>Forecast for done: 140 to 178 items over the next three weeks</title></path><path d="${fl.map(([i, a, b], j) => `${j ? 'L' : 'M'}${r1(X(i))},${r1(Y((a + b) / 2))}`).join('')}" fill="none" style="stroke:var(--cv-n)" stroke-width="2" stroke-dasharray="4 4"/>`;
  return `<figure class="chart" style="margin:0"><div class="say">${o.say || 'Open work is shrinking for the third week'}</div><div class="now"><b>131</b><span class="mut">done · 14 this week</span></div>
<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="Items by state over eight weeks with a three-week forecast: done rises from 40 to 131; in progress holds near 22; proposed falls from 70 to 58.">${area(gap(d2), d3, 'var(--cv-p)', 'Proposed: 58 this week')}${area(gap(d1), d2, 'var(--cv-d)', 'In progress: 23 this week')}${area(z, d1, 'var(--cv-n)', 'Done: 131 so far')}${band}<line class="base" x1="${pad}" x2="${W - 26}" y1="${base}" y2="${base}"/><line x1="${r1(X(n - 1))}" x2="${r1(X(n - 1))}" y1="22" y2="${base}" class="base"/>
<text class="ax" x="${pad}" y="${H - 4}">8 weeks ago</text><text class="ax" x="${r1(X(n - 1))}" y="${H - 4}" text-anchor="middle">today</text><text class="ax" x="${W - 26}" y="${H - 4}" text-anchor="end">forecast</text></svg>
<div class="row" style="gap:16px;margin-top:8px;font-size:13px;color:var(--muted)"><span class="row" style="gap:6px"><i style="width:10px;height:10px;border-radius:3px;background:var(--cv-p)"></i>Proposed</span><span class="row" style="gap:6px"><i style="width:10px;height:10px;border-radius:3px;background:var(--cv-d)"></i>In progress</span><span class="row" style="gap:6px"><i style="width:10px;height:10px;border-radius:3px;background:var(--cv-n)"></i>Done</span></div></figure>`;
}

// ---------- frame 5: Engineering, CTO perspective ----------
const recent = { beta: [F.chart({}), F.screens({ k1: 'chat', k2: 'settings' }), F.badge({})], ios: [F.screens({ k1: 'onboarding', k2: 'chatHe', a: '#ffe1c9', c: '#ffd0e4' }), F.badge({ s: 'build 6 · review' })], evals: [F.report({ c: '#3b2a8f', acc: '#7a8cff', bg: '#e3e1f2' })], eu: [F.doc({ c: '#3a5a1a', acc: '#7cb518', bg: '#e6eadb', label: 'EU residency design note' })], plat: [F.diff({})] };
export function f05() {
  const Q = ENG.places; const over = [];
  for (const k of ['beta', 'ios', 'eu', 'evals', 'plat']) {
    const [x, y] = Q[k].pole; const fs = recent[k]; const w = k === 'beta' ? 104 : 84;
    over.push([x, y - (k === 'beta' ? 46 : 30), place(Q[k], { size: k === 'beta' ? 'l' : 'm' })]);
    over.push([x, y + (k === 'beta' ? 86 : 66), `<div class="row" style="gap:12px;align-items:flex-end">${fs.map((f, i) => building(f, { w: i === 0 ? w : w - 14 })).join('')}</div>`]);
  }
  const [bx, by] = Q.beta.pole;
  over.push([bx - 150, by - 150, `<div class="row" style="gap:6px;color:var(--muted)">${I('cloud-lightning')}<span>Integration suite flaky</span></div>`]);
  over.push([bx + 140, by - 70, `<span class="avs">${av('N', 'doing')}${agent('Worker B', 'doing')}${agent('Worker C', 'wait')}</span>`]);
  const [ex, ey] = Q.eu.pole;
  over.push([ex + 30, ey - 128, `<span class="cont">${I('chevrons-right')}Continues into Compliance · Marketing</span>`]);
  const hull = `<path class="hull" d="${blob([[ex - 70, ey - 70], [ex + 10, ey - 110], [ex + 90, ey - 100], [ex + 130, ey - 40], [ex + 120, ey + 60], [ex + 40, ey + 100], [ex - 50, ey + 70], [ex - 90, ey]], 0.8)}"/>`;
  const panel = `<aside class="aspect gl l2" aria-label="Delivery aspect"><div class="hd"><span class="g lg f-sky" role="img" aria-label="Delivery aspect">${I('package-check')}</span><span class="ttl t3">Delivery</span><span class="grow"></span>${chip('arrow-up-right', 'Open', 'quiet', 'Open the Delivery aspect as a page')}</div>${streamChart()}<div class="col" style="gap:14px"><div class="row h-sky" style="gap:14px">${ring(56, 0.58, { fc: 0.82, w: 4, label: 'Private beta 58 percent, forecast 82 by the target' })}<span><b>The beta lands a week late</b><br><span class="mut">unless the Railway token arrives today</span></span></div></div></aside>`;
  const body = world(ENG, { fronts: [{ at: [bx - 70, by - 110], rx: 150, ry: 70 }], heat: [{ at: [bx + 60, by + 40], r: 170 }], extra: hull, over, hideMarkers: Object.keys(Q), id: 'f5' }) + `<div style="position:absolute;top:84px;inset-inline-start:110px" class="place h-sky">${lm('skyline', 44, '', 'Engineering emblem')}</div>` + panel;
  return desk({ label: 'Engineering, CTO perspective', body, crumb: ['Company', 'Engineering'], tend: chip('eye', 'CTO', '', 'Perspective: CTO'), active: 'world' });
}

// ---------- Wave 71: buildings with facades ----------
export const W71 = {
  'P1-C-03': { t: 'Dispatcher sequencing under load', st: 'doing', at: [380, 372], w: 168, f: () => F.chart({ pts: [70, 64, 66, 58, 54, 52, 46, 44, 40], target: [48, 48, 48, 48, 48, 48, 48, 48, 48], label: 'Latency under load against the budget' }), segs: ['met', 'met', 'met', 'met', 'partly', 'open'] },
  'P1-C-01': { t: 'Outbox fan-out with idempotency keys', st: 'done', at: [296, 476], w: 112, f: () => F.diff({}), done: true },
  'P1-C-04': { t: 'Fail-closed release path tests', st: 'ready', at: [588, 424], w: 120, f: () => F.report({ label: 'Expected: the release-path test report' }), exp: true },
  'CH-RW': { t: 'Put the Railway staging token in an envelope', st: 'doing', at: [440, 488], kind: 'chore' },
  'P1-C-05': { t: 'Relay originals: sender-only key wrap', st: 'review', at: [806, 300], w: 168, f: () => F.screens({ k1: 'chat', k2: 'settings' }), segs: ['met', 'met', 'met', 'met', 'met', 'partly'] },
  'P1-C-06': { t: 'Relay approve-first screen', st: 'proposed', at: [962, 196], w: 120, f: () => F.screens({ k1: 'chatHe', k2: 'chat' }), exp: true },
  'L489-F3': { t: 'Prompt v12 eval candidates', st: 'review', at: [404, 636], w: 150, f: () => F.report({ c: '#3b2a8f', acc: '#7a8cff', bg: '#e3e1f2', label: 'Eval report, prompt v12' }), segs: ['met', 'met', 'met', 'partly', 'open'] },
  'EVAL-DB2': { t: 'EVAL-DB v2', st: 'done', at: [584, 700], w: 108, f: () => F.doc({ c: '#5a2f8f', acc: '#b39dff', bg: '#e9e3f5', label: 'EVAL-DB v2' }), done: true },
  'BUILD-7': { t: 'iOS build 7 on TestFlight', st: 'review', at: [840, 626], w: 160, f: () => F.badge({}), segs: ['met', 'met', 'met', 'partly'] },
  'STORE-L': { t: 'Store listing screenshots', st: 'proposed', at: [1004, 708], w: 116, f: () => F.screens({ k1: 'onboarding', k2: 'chat', a: '#ffe1c9', c: '#ffd0e4' }), exp: true },
  'DEC-GO': { t: 'Store submission go/no-go', st: 'proposed', at: [748, 726], kind: 'decision' },
};
const bpos = (id) => W71[id].at;
const GATE = [1290, 452];
const DLAB = { disp: [330, 146], relay: [724, 124], evst: [318, 756], store: [1016, 548] };
export function waveWorld(o = {}) {
  const over = []; const hov = o.hover;
  for (const [id, b] of Object.entries(W71)) {
    const [x, y] = bpos(id);
    const html = b.kind ? `<div class="col" style="align-items:center;gap:8px">${kindBld(b.kind, b.t)}${id === 'DEC-GO' ? flagSm('Store submission go or no-go') : ''}</div>` : building(b.f(), { w: b.w, segs: b.segs, exp: b.exp && !(o.lit || []).includes(id), done: b.done, lit: hov === id || (o.lit || []).includes(id), label: `${id} · ${b.t}` });
    over.push([x, y, html]);
  }
  for (const k of ['disp', 'relay', 'evst', 'store']) { const [x, y] = DLAB[k]; over.push([x, y, `<span class="row" style="gap:8px">${place(WAVE.places[k], { size: 'xs', noName: true })}<span class="ttl t2">${WAVE.places[k].name}</span></span>`]); }
  over.push([GATE[0], GATE[1], place({ name: 'Gate 1 Alpha', lm: 'gate', hue: 'gold', prog: 0.81, fc: 1, subj: 'Gate 1 Alpha accepted' }, { size: 'm' })]);
  const A = bpos('P1-C-01'), B = bpos('P1-C-03'), Cc = bpos('P1-C-05'), D = bpos('BUILD-7'), R = bpos('CH-RW'), T = bpos('P1-C-04'), E = bpos('L489-F3');
  const mid = [(R[0] + T[0]) / 2, (R[1] + T[1]) / 2 + 6];
  over.push([mid[0], mid[1], barrier('P1-C-04 waits for the Railway staging token')]);
  if (hov) { const [x, y] = bpos(hov); const b = W71[hov]; over.push([x, y - 104, `<div class="tip" role="tooltip"><b>${b.t}</b><span class="meta">4 of 6 criteria met · Noa · doing since Oct 26</span></div>`]); }
  over.push([548, 118, `<div class="row" style="gap:6px;color:var(--muted)">${I('cloud-lightning')}<span>Integration suite flaky</span></div>`]);
  const roads = `<path class="road" d="${curve(A, B, 0.2)}"/><path class="road crit" d="${curve(B, Cc, -0.12)}"/><path class="road crit" d="${curve(Cc, D, -0.16)}"/><path class="road crit" d="${curve(D, GATE, 0.18)}"/><path class="road" d="${curve(E, D, -0.14)}"/><path class="road" d="${curve(T, D, 0.1)}"/><path class="road" d="M${R[0] + 26},${R[1]}L${mid[0] - 16},${mid[1]}"/><path class="road" d="M${mid[0] + 16},${mid[1] - 4}L${T[0] - 60},${T[1] + 20}"/>`;
  const [dx, dy] = WAVE.places.disp.pole;
  const litRoad = o.litRoad ? `<path class="road crit lit" d="${curve(bpos(o.litRoad[0]), bpos(o.litRoad[1]), 0.15)}"/>` : '';
  return world(WAVE, { fronts: [{ at: [520, 168], rx: 120, ry: 52 }], heat: [{ at: bpos('P1-C-03'), r: 150 }], extra: roads + litRoad, over, hideMarkers: Object.keys(WAVE.places), id: o.id || 'f6' });
}
export function f06() {
  const body = waveWorld({ hover: 'P1-C-03' }) + `<div style="position:absolute;top:84px;inset-inline-start:110px" class="place h-sky">${lm('rocket', 44, '', 'Private beta emblem')}</div>`;
  return desk({ label: 'Private beta, Wave 71', body, crumb: ['Engineering', 'Private beta', 'Wave 71'], tend: chip('layout-grid', 'As a board', 'quiet', 'Open the board instrument'), active: 'world' });
}
// ---------- frame 7: the board as an instrument over the same place ----------
export function f07() {
  const cols = [['proposed', 'circle-dashed', 'Proposed', ['P1-C-06', 'STORE-L', 'DEC-GO']], ['ready', 'circle', 'Ready', ['P1-C-04']], ['doing', 'circle-dot', 'Doing', ['P1-C-03', 'CH-RW']], ['review', 'scan-eye', 'Review', ['P1-C-05', 'L489-F3', 'BUILD-7']], ['done', 'circle-check-big', 'Done', ['P1-C-01', 'EVAL-DB2']]];
  const card = (id) => { const b = W71[id]; const th = b.kind ? `<span class="th" style="display:grid;place-items:center;background:var(--g1)">${g(b.kind)}</span>` : `<span class="th"${b.exp ? ' style="opacity:.5;outline:1.5px dashed var(--ink60);outline-offset:-1px"' : ''}>${b.f()}</span>`; return `<div class="kcard" role="button" tabindex="0" aria-label="${id}, ${b.t}">${th}<span class="tt">${b.t}</span>${id === 'P1-C-04' ? barrier('waits for the Railway staging token') : ''}</div>`; };
  const sheet = `<section class="sheet gl l3" style="inset-inline-start:104px;top:96px;width:1232px;height:440px" aria-label="Wave 71 as a board"><div class="row">${chip('arrow-left', 'Back to the world', 'back')}<span class="ttl t3" style="margin-inline-start:12px">Wave 71 as a board</span><span class="grow"></span><span class="seg" role="radiogroup" aria-label="Show as"><span class="on" role="radio" aria-checked="true">${I('layout-grid')}Cards</span><span role="radio" aria-checked="false">${I('rows-3')}Lines</span></span></div><div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:20px;flex:1;min-height:0">${cols.map(([k, ic, n, ids]) => `<div class="kcol"><div class="kh">${I(ic)}<span>${n}</span></div>${ids.map(card).join('')}</div>`).join('')}</div></section>`;
  const body = `<div data-ambient>${waveWorld({ id: 'f7' })}</div><div class="dim"></div>` + sheet;
  return desk({ label: 'The board as an instrument over Wave 71', body, crumb: ['Engineering', 'Private beta', 'Wave 71'], active: 'more' });
}

export function sectionA() {
  return [
    fig(1, 'Horizon, owner, morning', f01(), { phoneAlt: f01p(), cap: 'The glance home. Three needs-you cards, each with one visual and two replies: a fork (the Store stream cut-out with its front and the gate ring), Dana\'s feedback request (her screenshots as the facade), an envelope from the coordinator. The goals as three rings rising on the horizon line; one line since yesterday; the world breathing beneath in the lower 45 % at 60 %, seen at an angle: landmarks stand on the terrain in their rings, names only where legible, one heat halo and one front. Phone check at 390 px with the lab switch Device · Phone.', focus: 'the three cards that need Yossi', att: [3, 4, 4], glance: 1, uc: 'UC-A1 UC-A5 UC-Q8 UC-C3 UC-B3 UC-H1 13§3 13§4' }),
    fig(2, 'The company world, owner', f02(), { phoneAlt: f35(), phoneFrom: 35, cap: 'Eleven domains as places with landmarks, names and rings (forecast tick outside), light by progress, sub-places as faint contours; heat over Engineering; a risk front over Compliance with its reason as on hover; two material forks as banners; presence with status rings (agents in the Lucid hue); two embassies at the coast; System as an island beside the coast (docs/14 §2.1). Legend chip closed, perspective chip "Owner".', focus: 'the company as one world', att: [2, 6, 0], uc: 'UC-A1 UC-A3 UC-A6 UC-Q2 UC-P2 13§5 03§3–4' }),
    fig(3, 'The same world, CMO perspective', f03(), { cap: 'Omer\'s perspective: Marketing centred and large, its harbour as the emblem, three campaign facades as its skyline (the France teaser still a ghost); the Europe launch hull crossing into Compliance and Engineering with "continues"; the other places ambient at the edge, nothing hidden. The Market aspect docked at the end edge: two charts, each headed by its finding, the value above the trend.', focus: 'Marketing and its campaigns', att: [0, 7, 6], uc: 'UC-E1 UC-A3 UC-Q5 13§5.5 03§5' }),
    fig(4, 'Zoom reveal', f04(), { cap: 'Three stills of one continuous zoom, the same place in the same hue: the company with Engineering lit and the rest faded in place; Engineering\'s own contour becomes the frame, its skyline moves to the corner as emblem, its programs appear; Private beta\'s streams become districts and their facades appear (one still a ghost).', focus: 'Engineering through three depths', att: [0, 3, 0], uc: 'UC-A2 UC-Q2 13§5.2 03§4' }),
    fig(5, 'Engineering, CTO perspective', f05(), { phoneAlt: f35(), phoneFrom: 35, cap: 'Programs as places with landmarks and rings; a skyline of recent facades under each; the EU residency program inside the Europe hull, which continues into Compliance and Marketing; a front over Private beta (integration suite flaky); heat where things moved; Noa and two agents present; the Delivery aspect docked: proposed → in progress → done over eight weeks with the forecast band, its finding first.', focus: 'Private beta, the largest program', att: [0, 8, 4], uc: 'UC-A2 UC-A3 UC-Q5 UC-E1 13§5 13§8.6' }),
    fig(6, 'Private beta · Wave 71', f06(), { phoneAlt: f35(), phoneFrom: 35, cap: 'Streams as districts. Buildings show their products: four built (a latency chart, Relay screens, an eval report cover, the iOS build badge) with criteria rings; three ghosts (expected facades, dashed); two small kind buildings (the Railway token chore, the go/no-go decision with its flag); two finished landmarks (green edge). The critical road runs to the Gate 1 Alpha gate; the chore\'s road to the release-path tests is broken by a barrier; a front over Dispatcher; one hovered building with its title and ring caption.', focus: 'the critical road to Gate 1 Alpha', att: [0, 5, 5], uc: 'UC-A4 UC-A7 UC-B4 UC-Q3 13§5.3 03§4' }),
    fig(7, 'The board as an instrument', f07(), { cap: 'Opened from "As a board" over the same place: a translucent sheet with the five states, each card led by its facade thumbnail; Cards · Lines toggle; "Back to the world". The world stays visible, dimmed, beneath. This is the only kanban in the gallery.', focus: 'the board sheet', att: [0, 1, 5], uc: 'UC-B1 UC-B5 13§9 03§10' }),
  ].join('');
}
