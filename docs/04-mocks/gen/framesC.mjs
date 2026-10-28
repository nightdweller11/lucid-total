import { desk, fig, chip, pill, I, AIC, g, aiG, av, agent, ring, place, building, kindBld, barrier, box, flag } from './lib.mjs';
import { F, phoneScreen } from './facades.mjs';
import { world, PL } from './world.mjs';
import { COMPANY } from './company.mjs';
import { lm } from './landmarks.mjs';
import { cut, datec, conf, strip, daci, dim, hint } from './kit.mjs';
import { blob, r1 } from './geo.mjs';
import { needs, horizonCards } from './framesA.mjs';
import { f36b, f37a } from './framesH.mjs';
const C = COMPANY; const P = C.places; const pp = (k, dx = 0, dy = 0) => [P[k].pole[0] + dx, P[k].pole[1] + dy];
const SMALL = { sys: 'xs', ppl: 's', ldr: 's', fin: 's', sal: 's', ops: 's' };
const costLine = (t) => `<span class="row" style="gap:10px;font-weight:600">${I('coins')}${t}</span>`;
const clock = (t) => chip('alarm-clock', t, 'quiet', 'Reversible until ' + t);
const DACI = (approver = ['Y', 'Yossi']) => daci([['driver', av('N', '', 'md'), 'Noa'], ['approver', av(approver[0], '', 'md'), approver[1]], ['contributors', `<span class="avs">${av('O', '', 'md')}${av('D', '', 'md')}</span>`, 'Omer, Dana'], ['informed', `<span class="g f-slate">${I('users-round')}</span>`, 'Beta testers']]);

// the Store stream cut-out, larger: its district, facades, the front, the road to the gate
export function storeVisual(w = 380, h = 250) {
  if (w !== 380) { const k = Math.min(w / 380, h / 250); return `<div style="width:${w}px;height:${h}px;position:relative"><div style="position:absolute;left:${(w - 380 * k) / 2}px;top:${(h - 250 * k) / 2}px;width:380px;height:250px;transform:scale(${k.toFixed(3)});transform-origin:0 0">${storeVisual()}</div></div>`; }
  return `<div class="cut" style="width:${w}px;height:${h}px;position:relative"><svg viewBox="0 0 380 250" width="${w}" height="${h}" style="position:absolute;inset:0" aria-hidden="true"><defs><pattern id="svh" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><line x1="0" y1="0" x2="0" y2="9" style="stroke:var(--f-sharp)" stroke-opacity=".6" stroke-width="2"/></pattern><filter id="svf"><feGaussianBlur stdDeviation="9"/></filter><mask id="svm"><ellipse cx="130" cy="80" rx="110" ry="52" fill="#fff" filter="url(#svf)"/></mask></defs>
<path d="M30,40 C120,0 300,10 350,60 C380,140 340,220 250,235 C150,250 50,230 25,170 C5,120 10,70 30,40Z" style="fill:color-mix(in srgb,var(--f-warm) 13%,transparent);stroke:var(--gl)"/><rect x="0" y="0" width="300" height="180" mask="url(#svm)" fill="url(#svh)"/><path class="road crit" d="M150,150 C220,170 270,150 312,110"/></svg>
<div style="position:absolute;left:96px;top:120px">${building(F.badge({}), { w: 108, segs: ['met', 'met', 'met', 'partly'] })}</div><div style="position:absolute;left:206px;top:166px">${building(F.screens({ k1: 'onboarding', k2: 'chat', a: '#ffe1c9', c: '#ffd0e4' }), { w: 82, exp: true })}</div>
<div style="position:absolute;left:282px;top:56px" class="place h-gold">${ring(68, 0.81, { fc: 1, w: 4, label: 'Gate 1 Alpha 81 percent' })}<span style="position:absolute;inset:0;display:grid;place-items:center">${lm('gate', 34)}</span></div>
<span style="position:absolute;left:40px;top:28px" class="row meta">${I('cloud-lightning')}Hebrew screen wraps</span></div>`;
}
// ---------- frame 12: the Fork ----------
export function f12() {
  const O = [480, 520];
  const ends = [[1000, 214], [1000, 474], [1000, 734]];
  const paths = ends.map(([x, y], i) => `<path d="M${O[0]},${O[1]} C${O[0] + 220},${O[1]} ${x - 260},${y} ${x},${y}" fill="none" style="stroke:${i === 1 ? 'var(--acc)' : 'var(--ink25)'}" stroke-width="${i === 1 ? 6 : 3}" stroke-linecap="round"${i === 1 ? ' filter="url(#litg)"' : ''}/>`).join('');
  const svg = `<svg viewBox="0 0 1440 900" width="1440" height="900" style="position:absolute;inset:0" aria-hidden="true"><defs><filter id="litg" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${paths}<circle cx="${O[0]}" cy="${O[1]}" r="9" style="fill:var(--fg)"/></svg>`;
  const lab = (x, y, html) => box(x, y, 320, 40, html);
  const panel = (i, o) => box(1010, ends[i][1] - 112, 330, 0, `<div class="conseq gl ${i === 1 ? 'l3 lit' : 'l2'}" role="button" tabindex="0" aria-label="Path: ${o.name}">
<div class="row" style="gap:10px">${i === 1 ? aiG('sm') : ''}<span class="ttl t2">${o.name}</span></div>
<div class="row" style="gap:14px"><span class="h-sky" style="position:relative;display:grid;place-items:center">${ring(64, 0.58, { fc: o.fc, band: o.band, w: 4, label: 'Private beta forecast ' + Math.round(o.fc * 100) + ' percent' })}</span><div class="col" style="gap:8px">${datec(o.from, o.to, { icon: 'store', aria: 'Store submission ' + o.to })}<span class="row meta" style="gap:6px">${o.load}</span></div></div>
${o.risk ? `<span class="row" style="gap:8px;color:var(--muted)">${I('cloud-lightning')}${o.risk}</span>` : ''}${conf(o.conf)}</div>`);
  const body = `${svg}
${box(104, 84, 560, 0, `<div class="col" data-needs="1" style="gap:14px">${costLine('Cost: $0 · Toil: 2 h of Noa')}<span class="ttl t4">Store submission: go or hold?</span><span class="mut" style="max-width:520px">Build 7 passes everything except the Hebrew consent screen, where a button wraps. Apple has rejected right-to-left layout faults twice before.</span><div class="row" style="gap:10px">${clock('Fri 18:00')}${chip('git-fork', 'Fork 1 of 1', 'quiet')}</div></div>`)}
${box(104, 396, 380, 0, storeVisual())}
${box(104, 672, 560, 0, DACI())}
<div class="at" style="inset-inline-start:735px;top:367px">${pill('send', 'Submit now', '', 'Path: submit now')}</div>
<div class="at" style="inset-inline-start:735px;top:497px"><span class="pill pri" role="button" tabindex="0" aria-label="Recommended path: submit after the Hebrew fix">${AIC()}<span>After the Hebrew fix</span></span></div>
<div class="at" style="inset-inline-start:735px;top:627px">${pill('pause', 'Hold a week', '', 'Path: hold a week')}</div>
${panel(0, { name: 'Submit now', fc: 0.86, band: [0.7, 0.92], from: '', to: 'Nov 3', load: `${I('user')}No extra work`, risk: 'Review may reject the Hebrew screen', conf: 55 })}
${panel(1, { name: 'After the Hebrew fix', fc: 0.86, band: [0.8, 0.9], from: 'Nov 3', to: 'Nov 5', load: `<span class="avs">${av('O')}${av('N')}</span>Omer 1 h · Noa 2 h`, conf: 82 })}
${panel(2, { name: 'Hold a week', fc: 0.78, band: [0.75, 0.8], from: 'Nov 3', to: 'Nov 10', load: `${I('calendar-clock')}The beta slips a week`, conf: 90 })}
${box(560, 784, 400, 0, hint('pointer', 'Tap a path to choose · ask · delegate · later'))}`;
  return desk({ label: 'The Fork: store submission, go or hold', body, crumb: ['Horizon', 'Store submission'], active: 'horizon' });
}
// ---------- frame 13: futures (three small worlds a month out, confidence as haze) ----------
const variant = (mods) => ({ ...C, places: Object.fromEntries(Object.entries(P).map(([k, p]) => [k, mods[k] ? { ...p, ...mods[k] } : p])) });
export function f13() {
  const F3 = [
    { n: 'Europe first', lit: 1, sh: ['cmp', 'mkt', 'eng'], L: variant({ cmp: { prog: 0.62, fc: 0.9 }, mkt: { prog: 0.5, fc: 0.85 }, eng: { prog: 0.7, fc: 0.9 } }), fr: [], heat: [{ at: pp('cmp', 0, 20), r: 160 }, { at: pp('mkt'), r: 150 }], hz: 14, c: 74, say: 'Compliance clears the DPA and the EU waitlist converts; the US waits five weeks.' },
    { n: 'US first', sh: ['sal', 'cmp', 'mkt'], L: variant({ cmp: { prog: 0.34, fc: 0.55 }, mkt: { prog: 0.46, fc: 0.8 }, sal: { prog: 0.45, fc: 0.8 } }), fr: [{ at: pp('cmp', 40, -40), rx: 170, ry: 90 }], heat: [{ at: pp('sal'), r: 150 }], hz: 30, c: 61, say: 'Partnerships move first; the Europe front grows and the waitlist cools.' },
    { n: 'Both at once', sh: ['cmp', 'eng', 'mkt', 'sal'], L: variant({ cmp: { prog: 0.42, fc: 0.6 }, mkt: { prog: 0.4, fc: 0.6 }, eng: { prog: 0.52, fc: 0.66 } }), fr: [{ at: pp('cmp', 40, -40), rx: 150, ry: 80 }, { at: pp('eng', 0, -40), rx: 150, ry: 80 }], heat: [{ at: pp('eng'), r: 140 }], hz: 50, c: 42, say: 'Everything moves a little; two people are over capacity by week three.' },
  ];
  const col = (f, i) => `<div class="col" style="gap:16px;width:400px"><div class="cut" style="width:400px;height:280px;${f.lit ? 'box-shadow:inset 0 0 0 2px var(--acc),0 0 0 6px color-mix(in srgb,var(--acc) 16%,transparent)' : ''}"><div class="inner" style="transform:translate(${r1(200 - 760 * 0.31)}px,${r1(135 - 450 * 0.31)}px) scale(.31)">${world(f.L, { fronts: f.fr, heat: f.heat, noNames: Object.keys(P), ambient: Object.keys(P).filter((k) => !f.sh.includes(k)), sizes: { eng: 'l', ...SMALL }, id: 'fu' + i })}</div><span class="haze" style="--hz:${f.hz}"></span></div><div class="row" style="gap:10px">${f.lit ? aiG('sm') : ''}<span class="ttl t2">${f.n}</span><span class="grow"></span>${conf(f.c)}</div><span class="mut">${f.say}</span></div>`;
  const body = `${box(104, 80, 1232, 0, `<div class="row" style="align-items:flex-start;gap:40px"><div class="col" data-needs="1" style="gap:12px;max-width:640px">${costLine('Cost: $1,200 a month moves · Toil: none')}<span class="ttl t4">Which market first?</span><span class="mut">Three futures one month out, drawn from today's plan. Haze is what the forecast does not know.</span></div><span class="grow"></span>${DACI()}</div>`)}
${box(104, 300, 1232, 0, `<div class="row" style="gap:16px;justify-content:space-between">${F3.map(col).join('')}</div>`)}
${box(104, 760, 600, 0, hint('pointer', 'Tap a future to choose it, or open it in Refocus'))}`;
  return desk({ label: 'Futures: three small worlds a month out', body, crumb: ['Horizon', 'Which market first'], active: 'horizon' });
}
// ---------- frame 14: Refocus (effort as a fluid; the world re-forecasts; a fan of outcomes; the base plan faint) ----------
const slider = (v, o = {}) => `<span class="gl l2" style="display:inline-flex;align-items:center;gap:10px;padding:8px 12px;border-radius:999px;${o.lit ? 'box-shadow:inset 0 0 0 1.5px var(--acc),0 8px 20px var(--shadow)' : ''}" role="slider" aria-valuenow="${Math.round(v * 100)}" aria-label="Effort on ${o.name}">${o.icon ? I(o.icon) : ''}<span style="position:relative;width:110px;height:6px;border-radius:3px;background:var(--ink18)"><i style="position:absolute;inset-block:0;inset-inline-start:0;width:${v * 100}%;border-radius:3px;background:${o.lit ? 'var(--acc)' : 'var(--ink45)'}"></i>${o.base != null ? `<i style="position:absolute;top:-4px;bottom:-4px;inset-inline-start:${o.base * 100}%;width:2px;background:var(--ink45)" title="Base plan"></i>` : ''}<i style="position:absolute;top:50%;inset-inline-start:${v * 100}%;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:${o.lit ? 'var(--acc)' : 'var(--fg)'};box-shadow:0 2px 8px var(--shadow)"></i></span>${o.name ? `<span style="font-weight:600">${o.name}</span>` : ''}</span>`;
export function refocusWorld(o = {}) {
  const bands = { eng: [0.76, 0.84], mkt: [0.6, 0.72], cmp: [0.74, 0.86], prd: [0.7, 0.8], sup: [0.84, 0.92] };
  const L = variant(Object.fromEntries(Object.entries(bands).map(([k, b]) => [k, {}])));
  const sl = { eng: 0.5, mkt: 0.32, cmp: 0.7, prd: 0.4, sup: 0.45 }; const base = { eng: 0.55, mkt: 0.45, cmp: 0.45, prd: 0.45, sup: 0.45 };
  const over = Object.keys(sl).filter((k) => k !== 'sup').map((k) => [...pp(k, 0, k === 'eng' ? 118 : 100), slider(sl[k], { base: base[k], lit: k === 'cmp' })]);
  const [cx, cy] = pp('cmp'); const [mx, my] = pp('mkt'); const [ex, ey] = pp('eng');
  const hull = `<path class="hull" d="${blob([[cx - 120, cy - 60], [cx + 60, cy - 90], [cx + 140, cy], [mx + 120, my - 10], [mx + 110, my + 120], [mx - 20, my + 140], [ex + 160, ey + 40], [ex + 80, ey - 60], [cx - 160, cy + 80]], 0.8)}"/>`;
  const ghosts = `<rect class="ghost" x="${cx - 190}" y="${cy + 40}" width="84" height="64" rx="10"/><rect class="ghost" x="${cx + 70}" y="${cy + 60}" width="84" height="64" rx="10"/><path class="ghostarrow" d="M${mx - 40},${my + 60} Q${mx - 80},${my - 60} ${cx + 100},${cy + 120}" fill="none" style="stroke:var(--ai)" stroke-width="2" stroke-dasharray="6 5" marker-end="url(#ra)"/><defs><marker id="ra" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:var(--ai)"/></marker></defs>`;
  const roads = `<path class="road" d="M${mx},${my} C${mx - 120},${my + 60} ${ex + 140},${ey + 80} ${ex + 70},${ey + 40}"/><path class="road" d="M${cx},${cy} C${cx + 60},${cy + 120} ${mx + 40},${my - 140} ${mx},${my - 60}"/>`;
  over.push([mx - 150, my + 128, datec('Nov 20', 'Dec 4', { ai: true, range: 'Nov 30 – Dec 9', aria: 'iOS campaign moves from November 20 to December 4, range November 30 to December 9' })]);
  over.push([cx + 150, cy + 190, datec('Dec 15', 'Dec 1', { ai: true, range: 'Nov 27 – Dec 6', aria: 'Europe launch moves from December 15 to December 1, range November 27 to December 6' })]);
  over.push([cx + 10, cy - 128, `<span class="cont" style="background:color-mix(in srgb,var(--f-lime) 30%,var(--g2));box-shadow:inset 0 0 0 1.5px var(--acc)">${I('chevrons-up')}Europe raised</span>`]);
  const sizes = { eng: 'l', ...SMALL };
  const L2 = { ...C, places: Object.fromEntries(Object.entries(P).map(([k, p]) => [k, bands[k] ? { ...p, fc: (bands[k][0] + bands[k][1]) / 2 } : p])) };
  return { html: world(L2, { extra: hull + roads + ghosts, over, sizes, id: o.id || 'f14', fronts: [{ at: pp('mkt', 30, -40), rx: 110, ry: 60 }] }), bands };
}
export function f14() {
  const { html } = refocusWorld();
  // rings with a fan (band) are drawn by re-rendering the places with bands: overlay ring bands on the world places
  const bandOver = Object.entries({ eng: [0.76, 0.84, 'l'], mkt: [0.6, 0.72], cmp: [0.74, 0.86], prd: [0.7, 0.8], sup: [0.84, 0.92] }).map(([k, [a, b, s]]) => { const R = s === 'l' ? 132 : 100; const [x, y] = P[k].pole; return `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);margin-top:${s === 'l' ? -14 : -13}px;pointer-events:none" class="h-${P[k].hue}">${ring(R, 0, { fc: P[k].fc, band: [a, b], w: R >= 120 ? 6 : 3, label: P[k].name + ' forecast range ' + Math.round(a * 100) + ' to ' + Math.round(b * 100) + ' percent; the tick is the base plan' })}</div>`; }).join('');
  const body = `<div style="position:absolute;inset:0;transform:translateY(-14px) scale(.88);transform-origin:50% 0">${html}${bandOver}</div>
${box(104, 742, 1232, 0, `<div class="row" style="gap:14px;justify-content:center">${strip([['list-checks', '23 items gain priority'], ['calendar-clock', '3 dates move'], ['user-round-x', '2 people over capacity'], ['coins', '$1,200 a month shifts'], ['anchor', 'Marketing waits 2 more weeks for iOS 1.0']])}</div>`)}`;
  const tend = chip(AIC(), 'Refocus · Europe', '', 'Refocus draft: Europe') + chip('sliders-horizontal', 'Capacity 4 workers · velocity last 6 weeks', 'quiet', 'Assumptions: capacity 4 workers, velocity of the last 6 weeks; tap to change');
  const actions = `<div style="position:absolute;top:84px;inset-inline-end:24px;z-index:30" class="col">${pill('check', 'Apply', 'pri')}${pill('bookmark', 'Save as a future')}${pill('x', 'Discard')}</div>`;
  return desk({ label: 'Refocus on Europe', body: body + actions, crumb: ['Company', 'Refocus'], tend, active: 'world' });
}
// ---------- frame 15: a small change (one date, one line) ----------
export function f15() {
  const X = (d) => 40 + (d - 28) * 44; // Oct 28 .. Nov 10
  const days = [28, 30, 32, 34, 36, 38, 40]; const lbl = (d) => (d <= 31 ? 'Oct ' + d : 'Nov ' + (d - 31));
  const track = `<div style="position:relative;width:640px;height:236px"><svg viewBox="0 0 640 236" width="640" height="236" style="position:absolute;inset:0" aria-hidden="true"><path class="road crit" d="M20,70 H620"/><path class="road" d="M${X(37)},70 C${X(37) + 30},120 ${X(40) - 30},150 ${X(40)},150"/>${days.map((d) => `<line x1="${X(d)}" x2="${X(d)}" y1="62" y2="78" style="stroke:var(--ink45)" stroke-width="1.5"/><text class="ax" x="${X(d)}" y="44" text-anchor="middle" style="fill:var(--muted);font-size:13px">${lbl(d)}</text>`).join('')}</svg>
<span style="position:absolute;left:${X(34)}px;top:70px;transform:translate(-50%,-50%);width:26px;height:26px;border-radius:50%;border:2px dashed var(--ink60)" title="Was due Nov 3"></span>
<span style="position:absolute;left:${X(37)}px;top:70px;transform:translate(-50%,-50%);width:30px;height:30px;border-radius:50%;background:var(--acc);box-shadow:0 0 0 6px color-mix(in srgb,var(--acc) 25%,transparent),0 8px 18px var(--shadow)" role="slider" aria-label="Due date, now November 6"></span>
<span style="position:absolute;left:${X(37)}px;top:96px;transform:translateX(-50%)" class="datec">Nov 6</span>
<span style="position:absolute;left:${X(40)}px;top:150px;transform:translate(-50%,-50%)" class="row">${kindBld('meeting', 'Marketing: iOS launch campaign')}</span>
<span style="position:absolute;left:${X(40)}px;top:184px;transform:translateX(-50%);text-align:center;white-space:nowrap" class="col"><b>iOS launch campaign</b><span class="meta">Omer · starts Nov 9</span></span></div>`;
  const left = `<div class="col" style="gap:20px"><div class="row" style="gap:14px">${g('task', 'lg')}<span class="ttl t4">Store listing screenshots</span></div>${building(F.screens({ k1: 'onboarding', k2: 'chat', a: '#ffe1c9', c: '#ffd0e4' }), { w: 420, segs: ['met', 'met', 'partly', 'open'], label: 'Store listing screenshots' })}<div class="line1">${g('milestone', '', 'Done rule')}<span><b>Done when</b>  six screenshots in English and Hebrew pass review.</span></div></div>`;
  const right = `<div class="col" style="gap:22px"><span class="lbl2">Due</span>${track}<div class="row gl ai" data-needs="1" style="gap:12px;padding:14px 18px;border-radius:22px">${AIC()}<span class="grow">Marketing's campaign waits 3 more days · nothing breaches</span>${pill('check', 'Confirm', 'pri sm')}${pill('undo-2', 'Undo', 'sm')}</div></div>`;
  const pv = `<section class="pv gl l3" data-auto style="inset-inline-start:104px;top:96px;width:1232px;grid-template-columns:440px minmax(0,1fr)" aria-label="A small change: the due date">${left}${right}</section>`;
  return desk({ label: 'A small change: one date', body: dim(world(C, { id: 'f15', sizes: { eng: 'l', ...SMALL } })) + pv, crumb: ['Private beta', 'Store', 'Store listing screenshots'], active: 'world' });
}
// ---------- frame 16: an ask as a small fork (Noa's Horizon) ----------
export function f16() {
  const shots = [0, 1, 2, 3].map((i) => `<span style="width:120px;height:150px;border-radius:14px;overflow:hidden;box-shadow:inset 0 0 0 1px var(--gl),0 8px 20px var(--shadow);display:block">${F.screenTall(['settings', 'consent', 'settings', 'chat'][i], { label: 'Support screenshot ' + (i + 1) })}</span>`).join('');
  const card = `<article class="gl l3" data-needs="1" style="width:820px;padding:28px;border-radius:30px;display:flex;flex-direction:column;gap:20px" aria-label="Needs you: an ask from support"><div class="row" style="gap:14px">${g('ask', 'lg')}<span class="ttl t3">Four testers hit the same billing screen fault. What now?</span></div><div class="row" style="gap:14px">${shots}<div class="col" style="gap:10px;margin-inline-start:12px"><span class="pill pri" role="button" tabindex="0">${AIC()}<span>Turn into a task</span></span>${pill('ban', 'No action')}${pill('circle-help', 'Needs more')}</div></div>
<div class="row meta" style="gap:10px;font-size:15px">${agent('Triage agent', 'idle')}<span>Raised by the triage agent from four issues · the testers see “With Noa, deciding”</span></div></article>`;
  const tilted = `<div class="tiltwrap"><div class="tilt" style="--tx:54deg;transform-origin:50% 100%;top:40px;transform:perspective(1300px) rotateX(54deg) scale(1.5)">${world(C, { sizes: { eng: 'l', ...SMALL }, noNames: ['ldr', 'prd', 'dsg', 'cmp', 'fin'], smallNames: true, id: 'f16', heat: [{ at: pp('sup'), r: 150 }] })}</div></div>`;
  const body = `${tilted}${box(0, 50, 1440, 40, `<div class="ttl t4" style="text-align:center">Good afternoon, Noa</div>`)}${box(310, 120, 820, 0, card)}${box(0, 468, 1440, 0, `<div style="text-align:center">${chip('chevron-down', 'And 1 more', 'quiet')}</div>`)}`;
  return desk({ label: 'An ask as a small fork, on Noa\'s Horizon', body, crumb: ['Horizon'], active: 'horizon' });
}
export function sectionC() {
  return [
    fig(12, 'The Fork', f12(), { phoneAlt: f36b(), phoneFrom: 36, cap: 'One decision, composed as a fork. Cost and toil first; the question; two sentences; one visual (the Store stream with its front and the gate ring) as the origin of three paths. Each path ends in its consequence drawn: the beta ring with its forecast range, the date on the road, who is loaded, the risk, and a published confidence. The recommended path is lit. Reversible until Friday 18:00. DACI: Noa drives, Yossi approves, Omer and Dana contribute, the testers are informed. Choose by tapping a path.', focus: 'the lit path and its consequence', att: [1, 4, 16], uc: 'UC-R1 UC-C3 13§7.1' }),
    fig(13, 'Futures', f13(), { cap: 'A strategic decision as three small worlds one month out: rings, heat and fronts differ; haze thickens as confidence falls; one sentence under each; the recommended future lit.', focus: 'Europe first, the lit future', att: [1, 4, 4], uc: 'UC-R3 UC-C1 13§7.1' }),
    fig(14, 'Refocus', f14(), { phoneAlt: f37a(), phoneFrom: 37, cap: 'Effort moved toward Europe: a slider on each place (the faint mark on each track is the base plan), the Europe hull raised; the rings show a fan (the forecast range, in the Lucid hue) with the base-plan tick kept; ghosts where work moves; two dates sliding on their roads with their ranges; the transparency strip; Apply · Save as a future · Discard; the assumptions chip.', focus: 'Compliance, where effort flows', att: [0, 6, 16], uc: 'UC-R2 UC-K3 13§7.2' }),
    fig(15, 'A small change', f15(), { cap: 'Inside a product view the due date is dragged from Nov 3 to Nov 6 (the old date a dashed ghost); one line appears with the consequence, and confirm or undo sit in the same line.', focus: 'the dragged date and its one-line strip', att: [1, 2, 10], uc: 'UC-R5 13§7.2' }),
    fig(16, 'An ask as a small fork', f16(), { cap: 'Noa\'s Horizon: four testers\' screenshots as the facade strip, three replies (the recommended one marked with the Lucid mark), and the asker\'s state beneath so the loop stays visible.', focus: 'the ask and its three replies', att: [1, 2, 1], glance: 1, uc: 'UC-N1 UC-N2 UC-F1 13§12' }),
  ].join('');
}
