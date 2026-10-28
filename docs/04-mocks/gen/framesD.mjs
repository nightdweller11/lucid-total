import { desk, fig, chip, pill, I, AIC, g, aiG, av, agent, ring, place, building, kindBld, barrier, box, flag, embassy } from './lib.mjs';
import { F } from './facades.mjs';
import { world, PL } from './world.mjs';
import { COMPANY } from './company.mjs';
import { lm } from './landmarks.mjs';
import { dim, datec, conf, strip, stations, hint } from './kit.mjs';
import { waveWorld, W71 } from './framesA.mjs';
import { columns, stackRows, legend } from './charts.mjs';
import { f37b } from './framesH.mjs';
const C = COMPANY; const P = C.places;
const SMALL = { sys: 'xs', ppl: 's', ldr: 's', fin: 's', sal: 's', ops: 's' };
const scaled = (html, x, y, s, extra = '') => `<div style="position:absolute;left:${x}px;top:${y}px;width:1440px;height:900px;transform:scale(${s});transform-origin:0 0;${extra}">${html}</div>`;
const BETA = { ...PL.beta };

// ---------- frame 17: the Table ----------
export function f17() {
  const agenda = stations([['map', 'Where we are'], ['bridge', 'Relay in beta?'], ['store', 'Store go or hold'], ['shield-check', 'Europe consent'], ['flag', 'Next steps']], 1, 760, { h: 90, y: 24, arc: 0 });
  const scene = scaled(waveWorld({ id: 'f17', lit: ['P1-C-06', 'STORE-L'], litRoad: ['P1-C-05', 'P1-C-06'] }), 250, 150, 0.66);
  const capture = `<div class="gl l3" style="width:360px;padding:20px;border-radius:24px;display:flex;flex-direction:column;gap:12px;box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--ai) 60%,transparent),0 20px 50px var(--shadow)" role="status" aria-label="Decision captured"><span class="row" style="gap:10px">${aiG('sm')}<span class="meta">Captured from Noa · confirmed by a nod</span></span><span class="ttl t2">Relay ships in beta</span><span class="row" style="gap:8px;color:var(--muted)">${I('arrow-right-left')}Two buildings move to Ready · a road opens</span><div class="row" style="gap:8px">${pill('undo-2', 'Undo', 'sm')}<span class="meta">for an hour</span></div></div>`;
  const forks = [[300, 170, 'Relay in beta', true], [1000, 180, 'Store go/no-go'], [930, 690, 'Europe consent']];
  const veil = `<div class="gl" style="width:300px;padding:14px;border-radius:22px;display:flex;flex-direction:column;gap:10px"><span class="row" style="gap:10px">${embassy('scale', '', '', 'Cohen Legal, attending')}<span><b>Cohen Legal</b><br><span class="meta">attending · sees Europe consent only</span></span></span><div style="position:relative;height:96px;border-radius:14px;overflow:hidden;background:color-mix(in srgb,var(--fg) 6%,transparent)"><span class="haze" style="--hz:70;backdrop-filter:blur(6px)"></span><span style="position:absolute;inset:0;display:grid;place-items:center">${flag('Europe consent', 'signpost', 'Europe consent', false)}</span></div></div>`;
  const people = `<div class="row gl l2" style="gap:12px;padding:10px 16px;border-radius:999px"><span class="avs">${av('Y', '', 'md')}${av('N', 'doing', 'md')}${av('O', '', 'md')}${av('D', '', 'md')}${agent('Coordinator', 'doing', 'md')}</span><span class="meta" style="font-size:15px">Noa speaking</span></div>`;
  const body = `${scene}${box(340, 70, 760, 0, agenda)}
${forks.map(([x, y, t, now]) => `<div class="at tl" style="inset-inline-start:${x}px;top:${y}px;${now ? '' : 'opacity:.85'}">${flag(t, 'signpost', t, false)}</div>`).join('')}
${box(1040, 300, 360, 0, capture)}${box(104, 640, 300, 0, veil)}${box(470, 744, 500, 0, `<div style="display:flex;justify-content:center">${people}</div>`)}`;
  return desk({ label: 'The Table: Beta readiness', body, crumb: ['Table', 'Beta readiness'], tend: chip('clock', '34 min left', 'quiet'), active: 'horizon', notalk: false });
}
// ---------- frame 18: minutes as a scene ----------
export function f18() {
  const ripple = (inner, t, d) => `<div class="gl l2 cardx" style="width:360px"><div style="position:relative;height:150px;border-radius:16px;background:color-mix(in srgb,var(--fg) 4%,transparent);display:grid;place-items:center;overflow:hidden">${[50, 90].map((r, i) => `<span style="position:absolute;left:50%;top:50%;width:${r * 2}px;height:${r * 2}px;margin:-${r}px 0 0 -${r}px;border-radius:50%;border:2px solid var(--good);opacity:${0.4 - i * 0.18}"></span>`).join('')}${inner}</div><span class="row" style="gap:10px">${g('decision')}<span class="ttl t2">${t}</span></span><span class="mut">${d}</span></div>`;
  const d1 = ripple(building(F.screens({ k1: 'chatHe', k2: 'chat' }), { w: 120, lit: true }), 'Relay ships in beta', 'Two buildings moved to Ready; the Relay road opened.');
  const d2 = ripple(`<span class="place h-gold" style="position:relative;display:grid;place-items:center">${ring(96, 0.81, { fc: 1, w: 5 })}<span style="position:absolute">${lm('gate', 44)}</span></span>`, 'Submit after the Hebrew fix', 'The store date moved to Nov 5; Gate 1 Alpha stays on track.');
  const d3 = ripple(building(F.doc({ c: '#3a5a1a', acc: '#7cb518', bg: '#e6eadb' }), { w: 110 }), 'Consent text goes to Cohen Legal', 'Dana sends the wording today; the DPA road waits on them.');
  const lists = `<div class="row" style="gap:48px;align-items:flex-start"><div class="col" style="gap:12px"><span class="lbl2">Asks raised</span><span class="row" style="gap:10px;white-space:nowrap">${g('ask', 'sm')}Omer asks Design for store art by Friday</span><span class="row" style="gap:10px;white-space:nowrap">${g('ask', 'sm')}Noa asks Finance about a second Mac runner</span></div><div class="col" style="gap:12px"><span class="lbl2">Risk added</span><span class="row" style="gap:10px;white-space:nowrap">${g('risk', 'sm')}The DPA may not be signed before Dec 1</span></div></div>`;
  const next = stations([['languages', 'Hebrew fix'], ['send', 'Submit build 7'], ['scan-eye', 'Apple review'], ['milestone', 'Gate 1 Alpha']], 0, 420, { h: 80, y: 20, arc: 0 });
  const body = `${box(104, 80, 1232, 0, `<div class="col" style="gap:8px"><span class="ttl t4">Beta readiness · what we decided</span><span class="mut">Today, 11:00 to 11:52 · five attendees and Cohen Legal for one item</span></div>`)}
${box(104, 180, 1232, 0, `<div class="row" style="gap:28px">${d1}${d2}${d3}</div>`)}
${box(104, 540, 1232, 0, `<div class="row" style="gap:64px;align-items:flex-start">${lists}<div class="col" style="gap:14px"><span class="lbl2">Next</span>${next}</div></div>`)}
${box(104, 744, 1232, 0, `<span class="row meta" style="gap:8px;font-size:15px">${I('send')}Sent to the attendees · Lucid Chat for Yossi and Noa · email for Cohen Legal, the consent item only</span>`)}`;
  return desk({ label: 'Minutes as a scene', body, crumb: ['Table', 'Beta readiness', 'Minutes'], active: 'horizon' });
}
// ---------- frame 19: quick status, composed by Talk ----------
export function f19() {
  const roadBlock = (t, why, who) => `<div class="row" style="gap:14px"><svg width="120" height="30" aria-hidden="true"><path d="M2,15 H50" class="road crit"/><path d="M70,15 H118" class="road crit"/></svg><span style="margin-inline-start:-74px;margin-inline-end:40px">${barrier(t)}</span><span><b>${t}</b><br><span class="mut">${why}</span></span>${who}</div>`;
  const facs = [['P1-C-05', F.screens({ k1: 'chat', k2: 'settings' })], ['L489-F3', F.report({ c: '#3b2a8f', acc: '#7a8cff', bg: '#e3e1f2' })], ['BUILD-7', F.badge({})]];
  const body = `${dim(world(C, { id: 'f19', sizes: { eng: 'l', ...SMALL } }))}
<section class="pv gl l3" data-auto style="inset-inline-start:104px;top:84px;width:1232px;grid-template-columns:300px minmax(0,1fr);row-gap:36px" aria-label="Composed answer: where are we on the beta">
<div style="grid-column:1 / -1" class="row">${chip('arrow-left', 'Back to the Horizon', 'back')}<span class="grow"></span><span class="meta">Composed for Yossi · from 64 items, read 10:42</span></div>
<div class="col" style="align-items:center;gap:12px">${place(BETA, { size: 'xl', disc: false })}<span class="mut">forecast: week 25, one week late</span></div>
<div class="col" style="gap:30px"><span class="ttl t3" style="max-width:760px">The beta slips a week unless the Railway token lands today.</span>
${roadBlock('Release-path tests', 'wait for the Railway staging token', chip('vault', 'Open the envelope task', 'quiet'))}
${roadBlock('Store submission', 'waits for the Hebrew button fix', av('O', 'doing'))}
<div class="col" style="gap:12px"><span class="lbl2">Changed this week</span><div class="row" style="gap:20px;align-items:flex-end">${facs.map(([id, f]) => building(f, { w: 150, label: W71[id].t })).join('')}<span class="row meta" style="gap:8px;font-size:15px;margin-inline-start:12px">${I('cloud-lightning')}The integration suite is flaky</span></div></div></div></section>`;
  return desk({ label: 'Quick status, composed by Talk', body, crumb: ['Horizon', 'Private beta'], talk: { said: 'where are we on the beta?' }, active: 'talk' });
}
// ---------- frame 20: re-composing ("just the money") ----------
export function f20() {
  const spend = columns({ say: 'Beta spend is flat at about $310 a week', now: '$318', unit: 'this week', v: [290, 305, 320, 300, 296, 330, 312, 318], c: 'var(--cv-mkt)', x0: '8 weeks ago', x1: 'this week', fmt: (v) => '$' + v, labels: ['wk 39', 'wk 40', 'wk 41', 'wk 42', 'wk 43', 'wk 44', 'wk 45', 'wk 46'], aria: 'Weekly spend on the beta over eight weeks, between 290 and 330 dollars' });
  const ai = stackRows({ say: 'Most AI spend is the strongest class, on diagnosis', rows: [['Diagnosis', [4, 10, 46], '$60'], ['Briefings', [6, 22, 4], '$32'], ['Triage', [12, 6, 0], '$18']], keys: ['fast', 'standard', 'strongest'], colors: ['var(--ca1)', 'var(--ca2)', 'var(--ca3)'], fmt: (v) => '$' + v, aria: 'AI cost this week by task and model class' });
  const body = `${dim(world(C, { id: 'f20', sizes: { eng: 'l', ...SMALL } }))}
<section class="pv gl l3" data-auto style="inset-inline-start:104px;top:84px;width:1232px;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:44px;row-gap:28px" aria-label="Private beta as its money aspect">
<div style="grid-column:1 / -1;gap:12px" class="row">${chip('arrow-left', 'Back', 'back')}<span class="ttl t3" style="margin-inline-start:14px">Private beta · the money</span><span class="grow"></span>${chip('minimize-2', 'Simpler', 'quiet')}${chip('gantt-chart', 'As a timeline', 'quiet')}${chip('users', 'Who', 'quiet')}</div>
${spend}${ai}<div class="col chart" style="gap:14px"><div class="say">What it costs the runway</div><div class="now"><b>0.3 months</b><span class="mut">of 14</span></div><span class="mut">At this pace the beta uses a third of a month of runway before Gate 1 Alpha.</span></div>
<div style="grid-column:1 / -1;gap:12px;padding:12px 16px;border-radius:18px" class="row gl ai">${AIC()}<span class="mut">Used: Railway invoices to Oct 27, model spend by class, the beta's 64 items. Left out: salaries (restricted).</span></div></section>`;
  return desk({ label: 'Re-composing: just the money', body, crumb: ['Horizon', 'Private beta', 'Money'], talk: { said: 'just the money' }, active: 'talk' });
}
export function sectionD() {
  return [
    fig(17, 'The Table: "Beta readiness"', f17(), { cap: 'Meet mode. The subject centred (Wave 71 of the beta); the agenda as a path with the current step lit; three open forks as banners; the captured decision "Relay ships in beta" landing on the world (two buildings lit as they move to Ready, the Relay road opened) with Undo for an hour; attendees as presence, the speaker marked; Cohen Legal attending, with the compartment veil over all but the consent item.', focus: 'the captured decision landing on the world', att: [0, 6, 2], uc: 'UC-R4 UC-C6 UC-P1 13§4' }),
    fig(18, 'Minutes as a scene', f18(), { cap: 'After the meeting: three decisions as cards with their ripples, two asks raised, one risk added, the next steps as a path, and to whom it was sent and how (the party gets its compartment only).', focus: 'the three decisions', att: [0, 4, 7], uc: 'UC-R4 UC-C6 UC-G1 13§12' }),
    fig(19, 'Quick status', f19(), { phoneAlt: f37b(), phoneFrom: 37, cap: '"Where are we on the beta?" in Talk becomes a composed scene: the beta ring with its forecast, the two blocked roads with their reasons, the three facades that changed this week, the one front, and the one sentence that matters; a back chip; provenance in one line.', focus: 'the sentence and the beta ring', att: [0, 2, 3], glance: 1, uc: 'UC-Q1 UC-A4 UC-T4 13§12' }),
    fig(20, 'Re-composing', f20(), { cap: '"Just the money" re-composes the same place as its Money aspect: weekly spend (finding first, current value above), AI cost by task and class, the runway effect; chips to re-compose again; the AI\'s note of what it used and what it left out.', focus: 'the beta\'s money', att: [0, 6, 11], uc: 'UC-Q1 UC-Q5 13§8.3' }),
  ].join('');
}
