import { desk, fig, chip, pill, I, AIC, g, aiG, av, agent, ring, place, building, kindBld, barrier, box, flag, embassy } from './lib.mjs';
import { F } from './facades.mjs';
import { world, PL } from './world.mjs';
import { COMPANY } from './company.mjs';
import { lm } from './landmarks.mjs';
import { dim, cut, datec, conf, strip, stations, gauge, hint } from './kit.mjs';
import { streamChart } from './framesA.mjs';
import { columns, stackRows, line, legend } from './charts.mjs';
import { r1 } from './geo.mjs';
const C = COMPANY; const P = C.places;
const drill = (t = 'The places behind it') => chip('arrow-down-right', t, 'quiet', 'Drill into ' + t);
const page = (title, glyph, sub, inner, o = {}) => `<section class="gl l3" style="z-index:20;position:absolute;inset-inline-start:96px;top:76px;width:1248px;bottom:104px;border-radius:32px;padding:28px 32px;display:flex;flex-direction:column;gap:26px" aria-label="${title}"><div class="row" style="gap:14px">${glyph}<span class="ttl t4">${title}</span><span class="grow"></span>${o.chips || ''}</div>${sub ? `<span class="ttl t3" style="font-weight:500;margin-top:-10px">${sub}</span>` : ''}${inner}</section>`;
const aspectGlyph = (ic, fam) => `<span class="g lg f-${fam}" role="img" aria-label="Aspect">${I(ic)}</span>`;

// a small multiple: one goal's done share to date, its forecast band to the target, the target marked
function goalSM(o) {
  const W = 340, H = 130, base = H - 22; const n = o.v.length, tot = n + o.band.length - 1; const X = (i) => 4 + i * ((W - 30) / (tot - 1)); const Y = (v) => base - v * (H - 34);
  const d = o.v.map((v, i) => `${i ? 'L' : 'M'}${r1(X(i))},${r1(Y(v))}`).join('');
  const band = o.band.map(([a], i) => `${i ? 'L' : 'M'}${r1(X(n - 1 + i))},${r1(Y(a))}`).join('') + o.band.slice().reverse().map(([, b], i) => `L${r1(X(tot - 1 - i))},${r1(Y(b))}`).join('') + 'Z';
  const tx = X(o.target);
  return `<figure class="chart" style="margin:0"><div class="say">${o.say}</div><div class="now"><b>${Math.round(o.v[n - 1] * 100)} %</b><span class="mut">${o.name}</span></div><svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="${o.aria}"><line class="base" x1="0" x2="${W - 20}" y1="${base}" y2="${base}"/><line x1="0" x2="${W - 20}" y1="${r1(Y(1))}" y2="${r1(Y(1))}" class="grid"/><path d="${band}" style="fill:var(--f-gold)" fill-opacity=".2"><title>Forecast range</title></path><path d="${d}" fill="none" style="stroke:var(--f-gold)" stroke-width="2"/><circle cx="${r1(X(n - 1))}" cy="${r1(Y(o.v[n - 1]))}" r="4.5" style="fill:var(--f-gold);stroke:var(--g2)" stroke-width="2"/><line x1="${r1(tx)}" x2="${r1(tx)}" y1="10" y2="${base}" style="stroke:var(--fg)" stroke-opacity=".6" stroke-width="1.5"/><text class="ax" x="${r1(tx)}" y="${H - 4}" text-anchor="middle">${o.tl}</text><text class="ax" x="0" y="${H - 4}">${o.x0}</text></svg></figure>`;
}
// ---------- frame 21: Delivery aspect ----------
export function f21() {
  const places = ['eng', 'prd', 'dsg', 'mkt', 'cmp', 'sup'].map((k) => place(P[k], { size: 's', disc: true })).join('');
  const sms = [goalSM({ name: 'Private beta', say: 'The beta lands a week after its target', v: [0.2, 0.28, 0.35, 0.42, 0.5, 0.58], band: [[0.58, 0.58], [0.66, 0.72], [0.74, 0.84], [0.8, 0.92], [0.86, 1]], target: 8, tl: 'wk 24', x0: 'Sep', aria: 'Private beta done share rising to 58 percent; forecast range reaches 100 percent one week after the target' }),
    goalSM({ name: 'Gate 1 Alpha', say: 'Gate 1 Alpha is on time', v: [0.35, 0.46, 0.55, 0.64, 0.72, 0.81], band: [[0.81, 0.81], [0.9, 0.94], [0.97, 1]], target: 7, tl: 'Nov 14', x0: 'Sep', aria: 'Gate 1 Alpha done share 81 percent, forecast complete before November 14' }),
    goalSM({ name: 'Europe ready', say: 'Europe waits on one signature', v: [0.08, 0.12, 0.18, 0.24, 0.3, 0.34], band: [[0.34, 0.34], [0.38, 0.46], [0.42, 0.58], [0.46, 0.7], [0.5, 0.8]], target: 9, tl: 'wk 30', x0: 'Sep', aria: 'Europe ready 34 percent, wide forecast range' })];
  const inner = `<div class="row" style="gap:22px;justify-content:space-between">${places}${drill('Each place')}</div>
<div class="row" style="gap:40px;align-items:flex-start">${sms.join('')}</div>
<div class="row" style="gap:48px;align-items:flex-start"><div style="width:420px">${streamChart({ say: 'Open work is shrinking for the third week' })}</div><div class="col" style="gap:14px;padding-top:6px">${drill('The 23 open items')}${drill('What is blocked')}<span class="mut" style="max-width:360px">Every number opens the places and buildings behind it; back is one tap.</span></div></div>`;
  return desk({ label: 'Delivery aspect', body: dim(world(C, { id: 'f21' })) + page('Delivery', aspectGlyph('package-check', 'sky'), '', inner, { chips: chip('eye', 'Owner') }), crumb: ['Aspects', 'Delivery'], active: 'more' });
}
// ---------- frame 22: Money aspect (founders) ----------
export function f22() {
  const runway = line({ say: 'Runway reaches December 2027 at today’s spend', now: '14 months', unit: 'of runway', v: [410, 396, 381, 368, 352, 338], fc: [338, 322, 306, 290, 272, 254, 236, 218, 199, 181, 162, 144, 125, 106, 88, 69, 50, 30, 0], c: 'var(--cv-mkt)', mark: 23, markLabel: 'Dec 2027', x0: 'May', x1: '', w: 560, h: 150, max: 440, aria: 'Cash in thousands of dollars from May, falling about 16 thousand a month, reaching zero in December 2027' });
  const byPlace = [['eng', 46], ['sys', 14], ['mkt', 12], ['prd', 9], ['cmp', 8], ['ops', 6], ['sup', 5]];
  const strip2 = `<figure class="chart" style="margin:0"><div class="say">Engineering is almost half the spend</div><div style="display:flex;gap:2px;height:22px;margin:14px 0 10px;border-radius:6px;overflow:hidden">${byPlace.map(([k, v]) => `<span title="${P[k].name}: ${v} %" style="flex:${v};background:color-mix(in srgb,var(--f-${P[k].hue === 'ai' ? 'sky' : P[k].hue}) ${k === 'eng' ? 90 : 45}%,transparent)"></span>`).join('')}</div><div class="row" style="gap:18px;flex-wrap:wrap;font-size:13px;color:var(--muted)">${byPlace.map(([k, v]) => `<span class="row h-${P[k].hue}" style="gap:6px">${lm(P[k].lm, 16)}${P[k].name} ${v} %</span>`).join('')}</div></figure>`;
  const ai = stackRows({ say: 'AI cost holds near $110 a week', rows: [['5 weeks ago', [14, 30, 52], '$96'], ['4 weeks ago', [16, 34, 60], '$110'], ['3 weeks ago', [15, 31, 58], '$104'], ['2 weeks ago', [18, 36, 66], '$120'], ['this week', [17, 35, 58], '$110']], keys: ['fast', 'standard', 'strongest'], colors: ['var(--ca1)', 'var(--ca2)', 'var(--ca3)'], lw: 104, fmt: (v) => '$' + v, aria: 'AI cost by week and model class' });
  const forks = `<div class="col" style="gap:16px"><span class="lbl2">Spend decisions coming</span>${flag('Mac runner', 'signpost', 'A second Mac runner, 90 dollars a month', false)}<span class="mut" style="margin-top:-8px">A second Mac runner · $90 a month · Noa asks</span>${flag('Fable on', 'signpost', 'Enable Fable for diagnosis, about 140 dollars a month', false)}<span class="mut" style="margin-top:-8px">Fable for diagnosis · about $140 a month</span></div>`;
  const inner = `<div class="row" style="gap:56px;align-items:flex-start"><div style="width:560px">${runway}</div>${forks}</div><div class="row" style="gap:56px;align-items:flex-start"><div style="width:520px">${strip2}</div><div style="width:440px">${ai}</div></div>`;
  return desk({ label: 'Money aspect, founders', body: dim(world(C, { id: 'f22' })) + page('Money', aspectGlyph('wallet', 'violet'), '', inner, { chips: chip('eye', 'Founders') }), crumb: ['Aspects', 'Money'], active: 'more' });
}
// ---------- frame 23: People aspect ----------
export function f23() {
  const people = [['N', 1.12, 'Noa', 'Carries more than her week: two reviews could go to Worker C.'], ['D', 0.82, 'Dana', 'Room for the consent fix this week.'], ['O', 0.7, 'Omer', 'Room to take the store art.'], ['Y', 0.95, 'Yossi', 'Full; three decisions are his.']];
  const gauges = people.map(([k, v, n, t]) => gauge(v, n, t, { inner: `<foreignObject x="27" y="22" width="30" height="30"><div xmlns="http://www.w3.org/1999/xhtml" style="display:grid;place-items:center;width:30px;height:30px">${av(k, '', 'md')}</div></foreignObject>` })).join('');
  const wait = (a, b, t, days, amber) => `<div class="row" style="gap:12px">${a}<svg width="90" height="12" aria-hidden="true"><path d="M2,6 H88" class="road${amber ? '' : ''}" style="${amber ? 'stroke:var(--hold-h)' : ''}"/><path d="M80,1 L88,6 L80,11" fill="none" style="stroke:${amber ? 'var(--hold-h)' : 'var(--ink45)'}" stroke-width="1.6"/></svg>${b}<span>${t} <span class="mut">· ${days}</span></span></div>`;
  const waits = `<div class="col" style="gap:16px"><span class="lbl2">Waiting, both ways</span>${wait(av('D', 'wait'), embassy('scale', '', 'wait', 'Cohen Legal'), 'Dana waits on Cohen Legal for the DPA', '8 days', true)}${wait(av('O'), av('N'), 'Omer waits on Noa for build 7', '2 days')}${wait(agent('Coordinator', 'wait'), av('Y'), 'The coordinator waits on Yossi for the token', 'today')}</div>`;
  const days = 20; const off = `<div class="col" style="gap:12px"><span class="lbl2">Time off, next four weeks</span><div style="position:relative;width:460px;height:84px">${[['D', 9, 5, 'Dana, Nov 10 to 14'], ['N', 15, 2, 'Noa, Nov 17 and 18']].map(([k, s, l, t], i) => `<div class="row" style="position:absolute;top:${i * 40}px;left:0;gap:10px;width:460px">${av(k)}<span style="position:relative;flex:1;height:10px;border-radius:5px;background:var(--ink8)"><i title="${t}" style="position:absolute;inset-block:0;inset-inline-start:${s / days * 100}%;width:${l / days * 100}%;border-radius:5px;background:var(--f-drift)"></i></span></div>`).join('')}</div><span class="meta">Today on the left; four weeks to the right.</span></div>`;
  const asks = `<div class="col" style="gap:14px"><span class="lbl2">Asks waiting for an answer</span>${[['N', 3], ['Y', 2], ['D', 1]].map(([k, n]) => `<div class="row" style="gap:10px">${av(k)}<span class="row" style="gap:5px">${Array.from({ length: n }, () => `<i style="width:12px;height:12px;border-radius:50%;background:var(--f-rules)"></i>`).join('')}</span></div>`).join('')}</div>`;
  const inner = `<div class="row" style="gap:44px;justify-content:space-between;align-items:flex-start">${gauges}</div><div class="row" style="gap:56px;align-items:flex-start">${waits}${off}${asks}</div>`;
  return desk({ label: 'People aspect', body: dim(world(C, { id: 'f23' })) + page('People', aspectGlyph('users-round', 'warm'), 'Noa is over her week; everyone else has room.', inner, { chips: chip('eye', 'Owner') }), crumb: ['Aspects', 'People'], active: 'more' });
}
// ---------- frame 24: Customers aspect ----------
export function f24() {
  // intake flow: channels -> triage -> outcomes (widths proportional to issue counts)
  const src = [['Lucid Chat', 34, 'message-circle'], ['Email', 12, 'mail'], ['Store reviews', 6, 'star']]; const out = [['Resolved', 31], ['Became tasks', 14], ['No action', 7]];
  const k = 3.2; let ys = 20, yo = 20; const W = 640;
  const sp = src.map(([n, v]) => { const y = ys; ys += v * k + 14; return [n, v, y]; }); const op = out.map(([n, v]) => { const y = yo; yo += v * k + 14; return [n, v, y]; });
  const tY = 20, tH = 52 * k;
  let off = 0; const inflow = sp.map(([n, v, y]) => { const a = `<path d="M150,${y} C250,${y} 250,${tY + off} 300,${tY + off} V${tY + off + v * k} C250,${tY + off + v * k} 250,${y + v * k} 150,${y + v * k}Z" style="fill:var(--f-warm)" fill-opacity=".28"><title>${n}: ${v} issues</title></path>`; off += v * k; return a; }).join('');
  off = 0; const outflow = op.map(([n, v, y]) => { const a = `<path d="M340,${tY + off} C400,${tY + off} 400,${y} 470,${y} V${y + v * k} C400,${y + v * k} 400,${tY + off + v * k} 340,${tY + off + v * k}Z" style="fill:${n === 'Resolved' ? 'var(--good)' : n === 'Became tasks' ? 'var(--f-sky)' : 'var(--ink25)'}" fill-opacity=".34"><title>${n}: ${v}</title></path>`; off += v * k; return a; }).join('');
  const flow = `<figure class="chart" style="margin:0"><div class="say">Lucid Chat brings two thirds of the issues; most are resolved in triage</div><svg viewBox="0 0 ${W} 240" height="240" role="img" aria-label="Issues this month: 34 from Lucid Chat, 12 from email, 6 from store reviews; 31 resolved, 14 became tasks, 7 no action" style="margin-top:10px">${inflow}${outflow}<rect x="300" y="${tY}" width="40" height="${tH}" rx="6" style="fill:var(--f-warm)" fill-opacity=".7"/><text class="lbl" x="320" y="${tY + tH + 20}" text-anchor="middle">Triage</text>${sp.map(([n, v, y]) => `<text class="lbl" x="140" y="${y + v * k / 2 + 4}" text-anchor="end">${n} · ${v}</text>`).join('')}${op.map(([n, v, y]) => `<text class="lbl" x="482" y="${y + v * k / 2 + 4}">${n} · ${v}</text>`).join('')}</svg></figure>`;
  const sla = `<div class="col" style="gap:18px"><span class="lbl2">Promises kept</span><div class="row" style="gap:24px">${[['First reply under 4 h', 0.94], ['Resolved in 3 days', 0.78]].map(([t, v]) => `<div class="col h-warm" style="align-items:center;gap:8px;text-align:center"><span style="position:relative;display:grid;place-items:center">${ring(86, v, { w: 5, label: t + ': ' + Math.round(v * 100) + ' percent' })}<span style="position:absolute;font-weight:600;font-size:17px">${Math.round(v * 100)} %</span></span><span class="mut" style="max-width:130px">${t}</span></div>`).join('')}</div></div>`;
  const asks = `<div class="col" style="gap:14px"><span class="lbl2">What testers ask for most</span>${[['Billing screen fault', 4], ['Hebrew keyboard in Relay', 3], ['Export a conversation', 2]].map(([t, n]) => `<div class="row" style="gap:10px">${g('ask', 'sm')}<span>${t}</span><span class="row" style="gap:4px">${Array.from({ length: n }, () => `<i style="width:10px;height:10px;border-radius:50%;background:var(--f-warm)"></i>`).join('')}</span></div>`).join('')}</div>`;
  const markets = `<div class="col" style="gap:12px"><span class="lbl2">Beta users by market</span><div class="row gl" style="gap:28px;padding:16px 22px;border-radius:22px;align-items:flex-end">${[['Israel', 128], ['Germany', 46], ['France', 22]].map(([n, v]) => `<span class="col" style="align-items:center;gap:6px"><i style="width:${Math.round(Math.sqrt(v) * 6)}px;height:${Math.round(Math.sqrt(v) * 6)}px;border-radius:50%;background:color-mix(in srgb,var(--f-warm) 40%,transparent);box-shadow:inset 0 0 0 1.5px var(--f-warm)" title="${n}: ${v} users"></i><span>${n} <span class="mut">${v}</span></span></span>`).join('')}</div></div>`;
  const inner = `<div class="row" style="gap:56px;align-items:flex-start"><div style="width:640px">${flow}</div>${sla}</div><div class="row" style="gap:64px;align-items:flex-start">${asks}${markets}</div>`;
  return desk({ label: 'Customers aspect', body: dim(world(C, { id: 'f24' })) + page('Customers', aspectGlyph('life-buoy', 'warm'), '', inner, { chips: chip('eye', 'Support') }), crumb: ['Aspects', 'Customers'], active: 'more' });
}
// ---------- frame 25: infographic, the quarter for the board ----------
export function f25() {
  const goals = [['Private beta', 0.58, 0.86, 'A week late, closing'], ['Gate 1 Alpha', 0.81, 1, 'On time'], ['Europe ready', 0.34, 0.7, 'Waits on the DPA']].map(([n, v, f, t]) => `<div class="col h-gold" style="align-items:center;gap:10px;text-align:center"><span style="position:relative;display:grid;place-items:center">${ring(150, v, { fc: f, w: 6, label: n })}<span style="position:absolute;color:var(--f-gold)">${I('target')}</span></span><b>${n}</b><span class="mut">${t}</span></div>`).join('');
  const front = cut(C, ['cmp', 'mkt', 'dsg'], 300, 200, { w: { fronts: [{ at: [P.cmp.pole[0] + 40, P.cmp.pole[1] - 30], rx: 140, ry: 80 }], id: 'f25c', sizes: { cmp: 'l' } }, names: false });
  const runway = line({ say: 'Fourteen months of runway', v: [410, 381, 352, 338], fc: [338, 290, 236, 181, 125, 69, 0], c: 'var(--cv-mkt)', x0: 'May', x1: 'Dec 2027', w: 360, h: 120, max: 440, aria: 'Cash falling to zero by December 2027' });
  const decs = stations([['git-fork', 'Beta first'], ['bridge', 'Relay ships'], ['store', 'Store after fix'], ['shield-check', 'Consent text'], ['cpu', 'Fable later']], 5, 640, { h: 80, y: 20, arc: 0 });
  const body = `<section class="gl l2" style="position:absolute;inset-inline-start:96px;top:64px;width:1248px;bottom:104px;border-radius:32px;padding:34px 40px;display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:auto 1fr auto auto;gap:28px 40px" aria-label="Infographic: the quarter for the board">
<div style="grid-column:1 / -1" class="col"><span class="ttl t5">The quarter so far</span><span class="ttl t3" style="font-weight:500;color:var(--muted)">The beta is close; Europe waits on one signature.</span></div>
<div style="grid-column:1 / span 2" class="row" style="justify-content:space-around">${goals}</div>
<div class="col" style="gap:10px">${front}<span class="mut">The DPA with Cohen Legal is the one risk front.</span></div>
<div class="col" style="gap:8px">${runway}</div>
<div style="grid-column:2 / -1" class="col" style="gap:12px"><span class="say" style="font-size:17px;font-weight:600">Five decisions made the quarter</span>${decs}</div>
<div style="grid-column:1 / -1" class="row meta" style="gap:8px;font-size:15px">${I('lock')}Shared with Board · compartment: goals and forecasts · re-rendered from live data when opened</div></section>`;
  return desk({ label: 'Infographic: the quarter for the board', body, crumb: ['Infographics', 'The quarter'], tend: pill('share-2', 'Share with the board', 'pri'), active: 'more' });
}
// ---------- frame 26: infographics view ----------
export function f26() {
  const thumb = (t, d, art) => `<div class="col" style="gap:10px;width:360px" role="button" tabindex="0" aria-label="${t}, ${d}"><div class="cut" style="width:360px;height:210px;display:grid;place-items:center">${art}</div><span><b>${t}</b><br><span class="mut">${d}</span></span></div>`;
  const rings3 = `<div class="row h-gold" style="gap:18px">${[0.58, 0.81, 0.34].map((v) => ring(70, v, { w: 5, fc: v + 0.2 })).join('')}</div>`;
  const arts = [
    thumb('The quarter for the board', 'Oct 28 · Board', rings3),
    thumb('Private beta for the testers', 'Oct 21 · Testers', `<span class="h-sky place" style="position:relative;display:grid;place-items:center">${ring(110, 0.58, { fc: 0.86, w: 6 })}<span style="position:absolute">${lm('rocket', 56)}</span></span>`),
    thumb('Europe launch: where it stands', 'Oct 18 · Owner', `<div style="width:300px">${cut(C, ['cmp', 'mkt', 'eng'], 300, 170, { w: { id: 'f26a', fronts: [{ at: [P.cmp.pole[0], P.cmp.pole[1]], rx: 120, ry: 70 }] } })}</div>`),
    thumb('Relay: what changed', 'Oct 15 · Team', building(F.screens({ k1: 'chat', k2: 'settings' }), { w: 200, done: true })),
    thumb('Support this month', 'Oct 10 · Support', `<div class="row" style="gap:10px;align-items:flex-end">${[34, 12, 6].map((v) => `<i style="width:40px;height:${v * 4}px;border-radius:6px 6px 0 0;background:color-mix(in srgb,var(--f-warm) 55%,transparent)"></i>`).join('')}</div>`),
    thumb('The System, repaired', 'Oct 7 · Owner', `<span class="h-ai place" style="position:relative;display:grid;place-items:center">${ring(110, 0.92, { fc: 1, w: 6 })}<span style="position:absolute">${lm('tower', 56)}</span></span>`),
  ];
  const body = `${box(104, 76, 1232, 0, `<div class="col" style="gap:6px"><span class="ttl t4">Infographics</span><span class="mut">Stories told on one screen, for the places you can see. Each re-renders from live data when opened.</span></div>`)}
${box(104, 186, 1232, 0, `<div style="display:grid;grid-template-columns:repeat(3,360px);gap:36px 46px">${arts.join('')}</div>`)}`;
  return desk({ label: 'Infographics view', body, crumb: ['Infographics'], talk: { said: 'Make the picture of the beta for the testers’ newsletter' }, active: 'more' });
}
export function sectionE() {
  return [
    fig(21, 'Delivery aspect', f21(), { cap: 'Delivery as a place to think: a ring per place; the three goals as small multiples, each headed by its finding, the value above the trend, the forecast range and the target marked; the flow of open work to done with its forecast; one drill chip per metric; no table.', focus: 'the three goals\' forecasts', att: [0, 9, 12], uc: 'UC-Q5 UC-A5 13§8.6' }),
    fig(22, 'Money aspect (founders)', f22(), { cap: 'Runway as a line with the month it ends marked; spend by place as one strip with each place\'s landmark; AI cost per week by model class; two spend forks coming as banners.', focus: 'the runway line', att: [0, 5, 22], uc: 'UC-Q5 UC-O1 13§8.6' }),
    fig(23, 'People aspect', f23(), { cap: 'Load as gauges per person, worded as help; waiting-on both ways as short roads (amber only for the overdue one); time off as a band; asks waiting per person as dots.', focus: 'Noa\'s load and the help offered', att: [0, 2, 3], uc: 'UC-E4 UC-E7 UC-Q5 13§8.6' }),
    fig(24, 'Customers aspect', f24(), { cap: 'Issues intake as a flow from channels through triage to outcomes, its finding first; promises kept as rings; what testers ask for most; beta users by market as a small strip.', focus: 'the intake flow', att: [0, 4, 13], uc: 'UC-F1 UC-F5 UC-Q5 13§8.6' }),
    fig(25, 'Infographic: the quarter for the board', f25(), { cap: 'One story on one screen: a title line, three goal rings, the Europe front, the runway line, five decisions as a path, one sentence each; shared within the board compartment.', focus: 'the quarter\'s headline', att: [0, 4, 2], uc: 'UC-Q6 UC-P1 13§8.5' }),
    fig(26, 'Infographics view', f26(), { cap: 'The infographics that exist for the viewer\'s places as six thumbnails with subject, date and audience; a new one asked for in a sentence in Talk.', focus: 'the request in Talk', att: [0, 1, 6], uc: 'UC-Q6 UC-Q7 13§8.5' }),
  ].join('');
}
