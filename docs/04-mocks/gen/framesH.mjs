import { phone, fig, chip, pill, I, AIC, g, aiG, av, agent, ring, place, building, kindBld, barrier, box, flag } from './lib.mjs';
import { F } from './facades.mjs';
import { world, PL } from './world.mjs';
import { COMPANY } from './company.mjs';
import { lm } from './landmarks.mjs';
import { cut, datec, conf, strip, hint } from './kit.mjs';
import { f01p, horizonCards } from './framesA.mjs';
import { sliderCompare } from './framesB.mjs';
import { storeVisual } from './framesC.mjs';
const C = COMPANY; const P = C.places;
const pair = (a, b) => `<div class="pair">${a}${b}</div>`;
// ---------- frame 34: phone Horizon ----------
export const f34 = () => f01p();
// ---------- frame 35: phone place, Engineering ----------
export function f35() {
  const progs = ['beta', 'ios', 'eu', 'evals'].map((k) => `<div class="gl" style="padding:14px 6px 12px;border-radius:22px;display:grid;place-items:center">${place(PL[k], { size: 's', disc: true })}</div>`).join('');
  const facs = [F.chart({}), F.screens({ k1: 'chat', k2: 'settings' }), F.badge({}), F.report({})].map((f, i) => building(f, { w: 132, segs: i === 2 ? ['met', 'met', 'met', 'partly'] : undefined })).join('');
  const waits = [['construction', 'Release tests wait for the Railway token'], ['hourglass', 'Store waits for the Hebrew fix'], ['hourglass', 'EU residency waits for the DPA']].map(([ic, t]) => `<span class="row" style="gap:10px">${I(ic)}<span>${t}</span></span>`).join('');
  const body = `${box(16, 100, 358, 0, `<div class="row" style="gap:16px">${place(P.eng, { size: 'm', noName: true })}<span class="col" style="gap:2px"><span class="ttl t4">Engineering</span><span class="mut">58 % · forecast week 25</span></span></div>`)}
${box(16, 220, 358, 0, `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${progs}</div>`)}
${box(16, 494, 700, 0, `<div class="col" style="gap:10px"><span class="lbl2">Changed this week</span><div class="row" style="gap:14px;align-items:flex-end">${facs}</div></div>`)}
${box(16, 652, 358, 0, `<div class="col" style="gap:10px"><span class="lbl2">Waits</span>${waits}</div>`)}`;
  return phone({ label: 'Phone: Engineering', body, crumb: ['Company', 'Engineering'], active: 'world' }).replace('<nav class="crumbc"', '<nav class="crumbc" style="top:52px"');
}
// ---------- frame 36: phone product view and the Fork ----------
export function f36a() {
  const body = `${box(16, 100, 358, 0, `<div class="row" style="gap:10px">${g('task')}<span class="ttl t3">Consent screen, EU notice</span></div>`)}
${box(16, 148, 358, 0, sliderCompare(358, 380, { pw: 168, exp: 'consentHeMock', act: 'consentHe', aria: 'Expected and actual under a slider', diff: [182, 312, 76, 50] }).replace(/Expected · the mock/, 'Mock').replace(/Actual · Dana's screenshot/, 'Dana'))}
${box(16, 546, 358, 0, `<div class="col" style="gap:12px"><div class="line1" style="font-size:15px">${g('goal', 'sm', 'Goal')}<span>EU users see what we keep and why.</span></div><div class="line1" style="font-size:15px">${g('milestone', 'sm', 'Done rule')}<span>Matches the mock in both languages; legal approves.</span></div><div class="row" style="gap:14px"><span style="position:relative;display:grid;place-items:center">${ring(64, 0, { segs: ['met', 'met', 'met', 'met', 'partly', 'open'], w: 6, gap: 4 })}<b style="position:absolute;font-size:15px">4/6</b></span><span class="mut">The Continue button wraps in Hebrew.</span></div></div>`)}`;
  return phone({ label: 'Phone: product view', body, active: 'world' });
}
export function f36b() {
  const panel = (o, lit) => `<div class="conseq gl ${lit ? 'l3 lit' : 'l2'}" style="width:296px;flex:none"><span class="row" style="gap:8px">${lit ? aiG('sm') : ''}<span class="ttl t2">${o.n}</span></span><div class="row" style="gap:12px"><span class="h-sky">${ring(56, 0.58, { fc: 0.86, band: o.band, w: 4 })}</span>${datec(o.f, o.t, { icon: 'store' })}</div><span class="mut">${o.load}</span>${conf(o.c)}</div>`;
  const body = `${box(16, 96, 358, 0, `<div class="col" data-needs="1" style="gap:10px"><span class="row" style="gap:8px;font-weight:600">${I('coins')}Cost: $0 · Toil: 2 h of Noa</span><span class="ttl t3">Store submission: go or hold?</span><span class="mut">Build 7 passes everything but the Hebrew consent screen.</span></div>`)}
${box(16, 246, 358, 0, storeVisual(358, 200))}
${box(16, 466, 800, 0, `<div class="row" style="gap:12px">${panel({ n: 'After the Hebrew fix', f: 'Nov 3', t: 'Nov 5', band: [0.8, 0.9], load: 'Omer 1 h · Noa 2 h', c: 82 }, true)}${panel({ n: 'Submit now', f: '', t: 'Nov 3', band: [0.7, 0.92], load: 'Review may reject it', c: 55 }, false)}</div>`)}
${box(16, 664, 358, 0, `<div class="row" style="justify-content:center;gap:6px;margin-bottom:12px"><i style="width:18px;height:6px;border-radius:3px;background:var(--fg)"></i><i style="width:6px;height:6px;border-radius:3px;background:var(--ink25)"></i><i style="width:6px;height:6px;border-radius:3px;background:var(--ink25)"></i></div><span class="pill pri" style="width:100%;height:52px;position:relative;overflow:hidden" role="button" aria-label="Hold to choose: after the Hebrew fix"><i style="position:absolute;inset-block:0;inset-inline-start:0;width:38%;background:rgba(255,255,255,.22)"></i>${I('fingerprint')}<span>Hold to choose</span></span>`)}`;
  return phone({ label: 'Phone: the Fork', body, active: 'horizon' });
}
export const f36 = () => pair(f36a(), f36b());
// ---------- frame 37: phone Refocus and Talk ----------
export function f37a() {
  const rows = [['cmp', 0.7, true, 'Dec 15 → Dec 1'], ['eng', 0.5, false, 'week 25 → 25'], ['mkt', 0.32, false, 'Nov 20 → Dec 4'], ['prd', 0.4, false, 'no change']].map(([k, v, lit, d]) => `<div class="row" style="gap:12px">${place(P[k], { size: 'xs', disc: true, noName: true })}<div class="col grow" style="gap:6px"><span class="row"><b>${P[k].name}</b><span class="grow"></span><span class="meta">${d}</span></span><span style="position:relative;height:6px;border-radius:3px;background:var(--ink18)"><i style="position:absolute;inset-block:0;inset-inline-start:0;width:${v * 100}%;border-radius:3px;background:${lit ? 'var(--acc)' : 'var(--ink45)'}"></i><i style="position:absolute;top:50%;inset-inline-start:${v * 100}%;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:${lit ? 'var(--acc)' : 'var(--fg)'};box-shadow:0 2px 8px var(--shadow)"></i></span></div></div>`).join('');
  const body = `${box(0, 50, 390, 0, cut(C, ['cmp', 'mkt', 'eng', 'dsg', 'prd', 'sup'], 390, 230, { w: { id: 'f37c', fronts: [{ at: [1021, 486], rx: 90, ry: 50 }] }, style: 'border-radius:0' }))}
${box(16, 300, 358, 0, `<div class="row" style="gap:10px">${chip(AIC(), 'Refocus · Europe')}</div>`)}
${box(16, 360, 358, 0, `<div class="col" style="gap:20px">${rows}</div>`)}
${box(16, 640, 358, 0, `<div class="col" style="gap:8px;font-size:15px"><span class="row" style="gap:8px">${I('list-checks')}23 items gain priority</span><span class="row" style="gap:8px">${I('user-round-x')}2 people over capacity</span><span class="row" style="gap:8px">${I('anchor')}Marketing waits 2 more weeks</span></div>`)}`;
  return phone({ label: 'Phone: Refocus', body, active: 'world' });
}
export function f37b() {
  const wave = Array.from({ length: 28 }, (_, i) => `<i style="width:4px;border-radius:2px;background:var(--ai);height:${8 + Math.round(Math.abs(Math.sin(i * 0.9) * 26 + Math.sin(i * 2.3) * 8))}px"></i>`).join('');
  const body = `${box(16, 100, 358, 0, `<div class="bubble out" style="max-width:300px">where are we on the beta?</div>`)}
${box(16, 170, 358, 0, `<div class="gl l2" style="border-radius:26px;padding:20px;display:flex;flex-direction:column;gap:16px"><div class="row" style="gap:16px">${place(PL.beta, { size: 's', disc: true, noName: true })}<span class="ttl t2">The beta slips a week unless the Railway token lands today.</span></div><span class="row" style="gap:10px">${barrier('Release tests wait for the token')}<span>Release tests wait for the token</span></span><span class="row" style="gap:10px">${barrier('Store waits for the Hebrew fix')}<span>Store waits for the Hebrew fix</span></span>${pill('vault', 'Open the envelope task', 'pri')}</div>`)}
${box(16, 570, 358, 0, `<div class="col" style="align-items:center;gap:14px"><div class="row" style="gap:3px;align-items:center;height:60px">${wave}</div><span class="mut">Listening · release to send</span></div>`)}
${box(147, 690, 96, 0, `<span style="width:96px;height:96px;border-radius:50%;display:grid;place-items:center;background:var(--ai);color:var(--on-ai);box-shadow:0 0 0 12px color-mix(in srgb,var(--ai) 22%,transparent),0 16px 40px var(--shadow)" role="button" aria-label="Hold to talk, held">${I('mic', 'lg')}</span>`)}`;
  return phone({ label: 'Phone: hold to talk', body, active: 'world', say: 'Listening…' }).replace(/<nav class="dock"[\s\S]*?<\/nav>/, '');
}
export const f37 = () => pair(f37a(), f37b());
export function sectionH() {
  return [
    fig(34, 'Phone Horizon', f34(), { size: [390, 844], cap: 'The phone\'s home: the first card full width with the next two peeking; the goals as a ring row on the horizon line; the places as a strip of tiles (landmark in its disc, ring, heat behind Engineering); the dock with Talk in the middle.', focus: 'the first card', att: [3, 4, 2], glance: 1, uc: 'UC-A1 UC-Q8 13§10' }),
    fig(35, 'Phone place: Engineering', f35(), { size: [390, 844], cap: 'One place at a time, full-bleed: its landmark header with the ring; programs as tiles with rings; the facade gallery of what changed (it scrolls sideways); waits as three short lines; the breadcrumb as one chip.', focus: 'Engineering\'s programs', att: [0, 1, 3], uc: 'UC-A2 UC-Q2 13§10' }),
    fig(36, 'Phone product view and Fork', f36(), { size: [828, 844], cap: 'Left: the product view with the slider between Dana\'s mock and her screenshot, the goal and done rule, the criteria ring. Right: the Fork as one screen, the visual and two sentences, the paths as swipeable panels (the lit one first), and hold to confirm.', focus: 'the slider; the lit path', att: [1, 3, 10], uc: 'UC-R1 UC-Q3 13§10' }),
    fig(37, 'Phone Refocus and Talk', f37(), { size: [828, 844], cap: 'Left: Refocus as sliders per place, the world cut-out re-forecasting in the header, the transparency strip as three lines. Right: hold-to-talk, the spoken question shown, and the composed answer sized for the phone.', focus: 'the sliders; the composed answer', att: [0, 0, 9], uc: 'UC-R2 UC-T4 13§10' }),
  ].join('');
}
