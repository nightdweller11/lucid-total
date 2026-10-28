import { desk, fig, chip, pill, I, AIC, g, aiG, av, agent, at, box, ring, building, kindBld, barrier } from './lib.mjs';
import { phoneScreen, F } from './facades.mjs';
import { waveWorld } from './framesA.mjs';
import { lm } from './landmarks.mjs';
import { dim, datec, conf, strip, hint } from './kit.mjs';
import { r1 } from './geo.mjs';
import { lineChart } from './framesA.mjs';
import { f36a } from './framesH.mjs';

// the slider comparison of a screen: expected (the mock) left of the line, actual (the screenshot) right of it
export function sliderCompare(w, h, o) {
  const pw = o.pw || 196; const px = (w - pw) / 2, py = (h - pw * 2.05) / 2; const sx = o.at ?? w / 2;
  const svg = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${o.aria}"><defs><linearGradient id="cmpbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cddcff"/><stop offset="1" stop-color="#efe5ff"/></linearGradient><clipPath id="cmpL"><rect x="0" y="0" width="${sx}" height="${h}"/></clipPath><clipPath id="cmpR"><rect x="${sx}" y="0" width="${w - sx}" height="${h}"/></clipPath></defs><rect width="${w}" height="${h}" fill="url(#cmpbg)"/><rect x="0" y="0" width="${sx}" height="${h}" fill="#fff" fill-opacity=".28"/><g clip-path="url(#cmpL)">${phoneScreen(px, py, pw, o.exp)}</g><g clip-path="url(#cmpR)">${phoneScreen(px, py, pw, o.act)}</g></svg>`;
  return `<div class="cmp" style="width:${w}px;height:${h}px">${svg}<span class="tag" style="inset-inline-start:16px">${I('pencil-ruler')}Expected · the mock</span><span class="tag" style="inset-inline-end:16px">${I('camera')}Actual · Dana's screenshot</span><span class="split" style="left:${sx - 1}px"></span><span class="knob" style="left:${sx}px">${I('chevrons-left-right')}</span>${o.diff ? `<span class="diffmark" style="left:${o.diff[0]}px;top:${o.diff[1]}px;width:${o.diff[2]}px;height:${o.diff[3]}px" role="img" aria-label="Difference: the Continue button wraps to two lines"></span>` : ''}</div>`;
}
// a small neighbourhood of roads: what this waits on, what waits on this
function roadsMini() {
  return `<div style="position:relative;height:96px"><svg viewBox="0 0 470 96" width="470" height="96" aria-hidden="true" style="position:absolute;inset:0"><path class="road" d="M70,48 C130,20 170,20 214,44"/><path class="road crit" d="M262,48 C320,74 360,74 404,50"/></svg>
<span style="position:absolute;left:12px;top:22px" class="col" title="Waits on: the Hebrew copy fix, Omer">${kindBld('task', 'Hebrew copy fix, Omer')}</span>
<span style="position:absolute;left:206px;top:18px;width:62px">${building(F.screens({ k1: 'consent', k2: 'consentHe' }), { w: 62, label: 'This item' })}</span>
<span style="position:absolute;left:400px;top:22px">${kindBld('milestone', 'Store submission waits on this')}</span></div>
<div class="row" style="justify-content:space-between;font-size:15px;color:var(--muted);margin-top:4px"><span class="row" style="gap:6px">${I('hourglass')}Waits on Omer's copy</span><span class="row" style="gap:6px">Store submission waits${I('arrow-right')}</span></div>`;
}
// ---------- frame 8: product view, a screen ----------
export function f08() {
  const segs = ['met', 'met', 'met', 'met', 'partly', 'open'];
  const left = `<div class="col" style="gap:20px"><div class="row" style="gap:14px">${g('task', 'lg')}<span class="ttl t4">Consent screen with the EU data notice</span></div>
${sliderCompare(660, 470, { pw: 218, exp: 'consentHeMock', act: 'consentHe', aria: 'Expected and actual compared with a slider at 50 percent: the Hebrew consent screen', diff: [334, 378, 98, 66] })}
<div class="line1">${g('goal', '', 'Goal')}<span><b>Goal</b>  EU users see what we keep and why, before their first message.</span></div>
<div class="line1">${g('milestone', '', 'Done rule')}<span><b>Done when</b>  it matches the mock in English and Hebrew, links the DPA, legal approves the wording, the walkthrough is published.</span></div></div>`;
  const ctx = `<div class="ctx">${chip(`<span style="color:var(--f-gold)">${I('target')}</span>`, 'Europe ready', '', 'Serves the goal Europe ready')}${chip('signpost', 'Spawned by L489', '', 'Spawned by decision L489')}${chip(av('D'), 'Dana', '', 'Dana does it')}${chip('circle-dot', 'Doing', '', 'State: doing')}${chip('clock', 'Since Oct 26', '', 'Since October 26')}</div>`;
  const crit = `<div class="row" style="gap:24px;align-items:flex-start;position:relative"><span style="position:relative;display:grid;place-items:center;flex:none">${ring(150, 0, { segs, w: 10, gap: 3, hi: 4, label: 'Criteria: 4 of 6 met, 1 partly, 1 open' })}<span style="position:absolute;text-align:center"><span class="ttl t3">4 of 6</span><br><span class="meta">criteria met</span></span></span>
<div class="pop gl l3" style="position:relative;width:auto;flex:1"><span class="row" style="gap:8px"><span class="g sm f-hold" role="img" aria-label="Partly met">${I('contrast')}</span><b>Hebrew matches the mock: partly</b></span><span>The Continue button wraps to two lines at 390 px.</span><span class="meta row" style="gap:6px">${I('image')}Screenshot 2 · checked by the evidence agent</span></div></div>`;
  const talkT = `<div class="col" style="gap:12px"><div class="say">${av('D', '', 'md')}<span class="bub"><span class="who">Dana</span>The button wraps in Hebrew; see the right half.</span></div>
<div class="say">${av('O', '', 'md')}<span class="bub"><span class="who">Omer</span>A shorter label fits. I'm fixing the copy.</span></div>
<div class="say">${aiG()}<span class="bub ai"><span class="who">Lucid</span>I drafted the walkthrough from Dana's screenshots, both directions.<span class="row" style="gap:8px;margin-top:10px">${pill('check', 'Apply', 'pri sm', 'Apply the drafted walkthrough as evidence')}${pill('file-text', 'Open draft', 'sm')}</span></span></div></div>`;
  const right = `<div class="col" style="gap:26px">${ctx}${crit}${talkT}${roadsMini()}</div>`;
  const pv = `<section class="pv gl l3" style="inset-inline-start:104px;top:76px;width:1232px;height:732px;grid-template-columns:660px minmax(0,1fr);row-gap:0" aria-label="Product view: consent screen with the EU data notice">${left}${right}</section>`;
  const body = dim(waveWorld({ id: 'f8' })) + pv;
  return desk({ label: 'Product view: a screen', body, crumb: ['Private beta', 'Wave 71', 'Consent screen'], active: 'world' });
}
// ---------- frame 9: product view, an analysis (expected and actual overlaid, the difference shaded) ----------
function overlayChart(W, H) {
  const xs = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
  const act = [110, 118, 130, 148, 170, 196, 228, 268, 330, 395, 470], exp = [120, 135, 150, 168, 188, 210, 232, 255, 278, 300, 322];
  const pl = 56, pr = 30, pt = 24, pb = 46; const X = (v) => pl + v / 1000 * (W - pl - pr), Y = (v) => H - pb - v / 500 * (H - pt - pb);
  const line = (a) => a.map((v, i) => `${i ? 'L' : 'M'}${r1(X(xs[i]))},${r1(Y(v))}`).join('');
  // the shaded difference where actual exceeds expected (from the crossing at 740/s)
  const cross = 740, cy = 262; const over = [[cross, cy], ...xs.map((x, i) => [x, act[i]]).filter(([x]) => x > cross)]; const under = [...xs.map((x, i) => [x, exp[i]]).filter(([x]) => x > cross).reverse(), [cross, cy]];
  const diff = [...over, ...under].map(([x, v], i) => `${i ? 'L' : 'M'}${r1(X(x))},${r1(Y(v))}`).join('') + 'Z';
  const grid = [100, 200, 300, 400].map((v) => `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${r1(Y(v))}" y2="${r1(Y(v))}"/><text class="ax" x="${pl - 10}" y="${r1(Y(v) + 4)}" text-anchor="end">${v}</text>`).join('');
  const mark = (x, v, t, dx, dy) => `<circle cx="${r1(X(x))}" cy="${r1(Y(v))}" r="13" fill="none" style="stroke:var(--hold-h)" stroke-width="2"/><text class="lbl" x="${r1(X(x) + dx)}" y="${r1(Y(v) + dy)}" ${dx < 0 ? 'text-anchor="end"' : ''}>${t}</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="p95 latency against load: the measured curve stays under the budget until 740 messages a second and exceeds it by 52 ms at 800">${grid}<line class="base" x1="${pl}" x2="${W - pr}" y1="${H - pb}" y2="${H - pb}"/><path d="${diff}" style="fill:var(--hold-h)" fill-opacity=".38"/><path d="${line(exp)}" fill="none" style="stroke:var(--fg)" stroke-opacity=".7" stroke-width="2" stroke-dasharray="6 5"/><path d="${line(act)}" fill="none" style="stroke:var(--cv-d)" stroke-width="2.4" stroke-linejoin="round"/><circle cx="${r1(X(1000))}" cy="${r1(Y(470))}" r="5" style="fill:var(--cv-d);stroke:var(--g3)" stroke-width="2"/>${mark(740, 262, 'Crosses the budget at 740/s', -20, -22)}${mark(800, 330, '+52 ms at 800/s', 20, 4)}<text class="ax" x="${pl}" y="${H - 16}">0 messages a second</text><text class="ax" x="${W - pr}" y="${H - 16}" text-anchor="end">1,000</text><text class="ax" x="${pl - 10}" y="${pt - 6}" text-anchor="end">ms</text></svg>`;
}
export function f09() {
  const left = `<div class="col" style="gap:18px"><div class="row" style="gap:14px">${g('task', 'lg')}<span class="ttl t4">Dispatcher sequencing under load</span></div>
<div class="gl" style="padding:22px 22px 10px;border-radius:24px"><div class="chart"><div class="say">Latency stays under budget until 740 messages a second</div><div class="row" style="gap:20px;margin:8px 0 6px;font-size:13px;color:var(--muted);white-space:nowrap"><span class="row" style="gap:8px"><svg width="26" height="4"><line x1="0" x2="26" y1="2" y2="2" style="stroke:var(--fg)" stroke-opacity=".7" stroke-width="2" stroke-dasharray="6 5"/></svg>Expected · the budget</span><span class="row" style="gap:8px"><svg width="26" height="4"><line x1="0" x2="26" y1="2" y2="2" style="stroke:var(--cv-d)" stroke-width="2.4"/></svg>Actual · measured today</span><span class="row" style="gap:8px"><i style="width:14px;height:10px;border-radius:3px;background:color-mix(in srgb,var(--hold-h) 45%,transparent)"></i>Over budget</span></div>${overlayChart(616, 360)}</div></div>
<div class="line1">${g('milestone', '', 'Done rule')}<span><b>Done when</b>  p95 stays under 300 ms up to 800 messages a second, in all six languages.</span></div></div>`;
  const ctx = `<div class="ctx">${chip(`<span style="color:var(--f-gold)">${I('target')}</span>`, 'Private beta', '', 'Serves the goal Private beta')}${chip(av('N'), 'Noa', '', 'Noa owns it')}${chip(agent('Worker B', 'doing'), 'Worker B', '', 'Agent: Worker B, working')}${chip('circle-dot', 'Doing')}</div>`;
  const crit = `<div class="row" style="gap:22px"><span style="position:relative;display:grid;place-items:center;flex:none">${ring(132, 0, { segs: ['met', 'met', 'met', 'met', 'partly', 'open'], w: 9, gap: 3, label: 'Criteria: 4 of 6 met' })}<span style="position:absolute;text-align:center"><span class="ttl t3">4 of 6</span><br><span class="meta">criteria met</span></span></span><div class="col" style="gap:8px"><span class="row" style="gap:8px">${I('check')}Ordered under load</span><span class="row" style="gap:8px">${I('check')}Idempotent replays</span><span class="row" style="gap:8px;color:var(--hold)">${I('contrast')}Latency at 800/s</span><span class="row mut" style="gap:8px">${I('minus')}Six-language run</span></div></div>`;
  const say = `<div class="say">${aiG()}<span class="bub ai">Above 740/s Hebrew and Arabic miss the tokenizer cache, which costs about 50 ms. Warming the cache per language should close it.<span class="row" style="gap:8px;margin-top:10px">${pill('lightbulb', 'Propose the fix', 'pri sm')}${pill('table-2', 'See the data', 'sm')}</span></span></div>`;
  const right = `<div class="col" style="gap:30px">${ctx}${crit}${say}${conf(78, 'confidence in the diagnosis')}</div>`;
  const pv = `<section class="pv gl l3" style="inset-inline-start:104px;top:76px;width:1232px;height:732px;grid-template-columns:660px minmax(0,1fr)" aria-label="Product view: an analysis" data-auto>${left}${right}</section>`;
  return desk({ label: 'Product view: an analysis', body: dim(waveWorld({ id: 'f9' })) + pv, crumb: ['Private beta', 'Wave 71', 'Dispatcher under load'], active: 'world' });
}
// ---------- frame 10: product view, done: the implications first ----------
export function f10() {
  const B = (f, x, y, w, o = {}) => `<div style="position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%)">${building(f, { w, ...o })}</div>`;
  const ripple = `<div class="cut" style="width:660px;height:400px;position:relative">
<svg viewBox="0 0 660 400" width="660" height="400" style="position:absolute;inset:0" aria-hidden="true"><path d="M40,60 C160,10 480,20 620,70 C660,170 640,330 560,370 C380,400 160,390 70,340 C20,260 10,140 40,60Z" style="fill:color-mix(in srgb,var(--fg) 5%,transparent);stroke:var(--gl)"/>
${[70, 130, 200].map((r, i) => `<circle cx="250" cy="200" r="${r}" fill="none" style="stroke:var(--good)" stroke-opacity="${0.5 - i * 0.14}" stroke-width="${3 - i * 0.7}"/>`).join('')}
<path class="road crit" d="M250,200 C340,150 420,120 520,110" /><path class="road" d="M250,200 C300,280 360,310 440,300"/><path class="road" d="M250,200 C190,280 150,300 110,300"/><path class="road" d="M520,110 C560,170 580,220 585,250"/></svg>
${B(F.screens({ k1: 'chat', k2: 'settings' }), 250, 200, 150, { done: true, segs: ['met', 'met', 'met', 'met', 'met', 'met'], label: 'This item, done' })}
${B(F.screens({ k1: 'chatHe', k2: 'chat' }), 520, 110, 108, { lit: true, label: 'Relay approve-first screen: unblocked' })}
${B(F.report({}), 440, 300, 100, { lit: true, label: 'Fail-closed release tests: unblocked' })}
<div style="position:absolute;left:110px;top:300px;transform:translate(-50%,-50%)">${kindBld('task', 'Relay load test: unblocked')}</div>
<div style="position:absolute;left:585px;top:300px;transform:translate(-50%,-50%)" class="place h-gold">${ring(84, 0.81, { fc: 1, w: 5, label: 'Gate 1 Alpha: 72 to 81 percent' })}<span style="position:absolute;inset:0;display:grid;place-items:center">${lm('gate', 40)}</span></div>
<span style="position:absolute;left:585px;top:356px;transform:translateX(-50%)" class="datec">${I('trending-up')}+9 %</span>
<span style="position:absolute;left:300px;top:118px" class="meta row">${I('route')}road opened</span></div>`;
  const moved = `<div class="col" style="gap:14px"><span class="lbl2">Dates that moved</span><div class="row" style="gap:12px">${datec('Nov 21', 'Nov 14', { icon: 'milestone', aria: 'Gate 1 Alpha moves earlier, November 21 to 14' })}<span class="mut">Gate 1 Alpha</span></div><div class="row" style="gap:12px">${datec('Nov 10', 'Nov 5', { icon: 'store', aria: 'Store submission moves earlier, November 10 to 5' })}<span class="mut">Store submission</span></div></div>`;
  const told = `<div class="col" style="gap:12px"><span class="lbl2">Told</span><span class="avs">${av('Y', '', 'md')}${av('N', '', 'md')}${av('O', '', 'md')}${av('D', '', 'md')}${agent('Coordinator', 'idle', 'md')}</span></div>`;
  const lesson = `<div class="say">${g('lesson')}<span class="bub" style="background:color-mix(in srgb,var(--f-drift) 14%,var(--g1))"><b>Lesson</b>  Wrap keys at send time, not at delivery: the late wrap cost two days.</span></div>`;
  const product = `<div class="row" style="gap:24px;padding-top:6px">${building(F.screens({ k1: 'chat', k2: 'settings' }), { w: 190, done: true, label: 'The product: Relay screens' })}<div class="col" style="gap:8px"><span class="row" style="gap:10px">${g('task')}<span class="ttl t2">Relay originals: sender-only key wrap</span></span><span class="mut row" style="gap:8px">${I('circle-check-big')}All criteria met · Worker C · reviewed by Noa · today</span></div></div>`;
  const pv = `<section class="pv gl l3" style="inset-inline-start:104px;top:76px;width:1232px;height:732px;grid-template-columns:660px minmax(0,1fr);row-gap:24px" aria-label="Product view, done: the implications first" data-auto><div class="col" style="gap:18px"><div class="row" style="gap:12px"><span class="g lg f-good" role="img" aria-label="Done">${I('circle-check-big')}</span><span class="ttl t4">Done: what it changed</span></div>${ripple}</div><div class="col" style="gap:30px;padding-top:64px">${moved}${told}${lesson}</div><div style="grid-column:1 / -1">${product}</div></section>`;
  return desk({ label: 'Product view, done: implications first', body: dim(waveWorld({ id: 'f10' })) + pv, crumb: ['Private beta', 'Wave 71', 'Relay originals'], active: 'world' });
}
// ---------- frame 11: product view, a chore ----------
export function f11() {
  const steps = [['met', 'D-U-N-S number'], ['met', 'Legal entity verified'], ['met', 'Enrolled and paid'], ['open', 'Review by Apple'], ['open', 'Invite Noa and the coordinator']];
  const expected = `<div class="col" style="align-items:center;gap:18px"><span class="cmp" style="width:320px;height:340px;display:grid;place-items:center;background:color-mix(in srgb,var(--fg) 4%,transparent)"><span class="tag" style="inset-inline-start:14px">${I('pencil-ruler')}Expected · the steps</span><span style="position:relative;display:grid;place-items:center;margin-top:20px">${ring(180, 0, { segs: steps.map((x) => x[0]), w: 12, gap: 3, label: 'Checklist ring: 3 of 5 steps' })}<span style="position:absolute;text-align:center"><span class="ttl t3">3 of 5</span><br><span class="meta">steps done</span></span></span></span></div>`;
  const actual = `<span class="cmp" style="width:320px;height:340px;display:block">${F.account({ label: 'Actual: the developer account badge' }).replace('<svg ', '<svg width="320" height="340" ')}<span class="tag" style="inset-inline-end:14px">${I('camera')}Actual · the account</span></span>`;
  const left = `<div class="col" style="gap:22px"><div class="row" style="gap:14px">${g('chore', 'lg')}<span class="ttl t4">Open the Apple developer account</span></div><div class="row" style="gap:20px">${expected}${actual}</div>
<div class="line1">${g('goal', '', 'Goal')}<span><b>Goal</b>  Lucid can ship to the App Store under its own name.</span></div>
<div class="line1">${g('milestone', '', 'Done rule')}<span><b>Done when</b>  the account is active and Noa and the coordinator can sign builds.</span></div></div>`;
  const right = `<div class="col" style="gap:28px"><div class="ctx">${chip(`<span style="color:var(--f-gold)">${I('target')}</span>`, 'iOS 1.0')}${chip(av('Y'), 'Yossi')}${chip('hourglass', 'Waiting on Apple')}</div>
<div class="col" style="gap:10px">${steps.map(([st, t]) => `<span class="row" style="gap:10px${st === 'open' ? ';color:var(--muted)' : ''}">${I(st === 'met' ? 'circle-check-big' : 'circle-dashed')}${t}</span>`).join('')}</div>
<div class="row" style="gap:16px"><span class="emb wait"><span class="e">${I('landmark')}</span></span><span><b>Apple</b><br><span class="mut">Reviewing the enrolment · usually two days</span></span></div>
<div class="row gl" style="gap:14px;padding:14px 16px;border-radius:20px">${g('envelope', 'lg')}<span class="grow"><b>The account password</b><br><span class="mut">Sealed for Noa · opens once, in the app</span></span>${pill('lock', 'Seal it', 'pri sm')}</div></div>`;
  const pv = `<section class="pv gl l3" style="inset-inline-start:104px;top:76px;width:1232px;height:732px;grid-template-columns:660px minmax(0,1fr)" aria-label="Product view: a chore" data-auto>${left}${right}</section>`;
  return desk({ label: 'Product view: a chore', body: dim(waveWorld({ id: 'f11' })) + pv, crumb: ['Engineering', 'iOS 1.0', 'Apple developer account'], active: 'world' });
}
export function sectionB() {
  return [
    fig(8, 'Product view: a screen', f08(), { phoneAlt: f36a(), phoneFrom: 36, cap: 'Dana\'s item opened over the dimmed world. The product first and large: the mock (expected) and her screenshot (actual) under a slider at 50 %, the difference marked; the goal and the done rule in one line each; the criteria ring (4 met, 1 partly, 1 open) with the partly segment\'s evidence open; the context strip; the talk with the assistant\'s drafted walkthrough and "Apply"; the roads: one wait upstream, the Store submission downstream on the critical road.', focus: 'the screen, expected against actual', att: [0, 4, 7], uc: 'UC-B1 UC-B2 UC-B3 UC-A7 UC-Q3 13§6' }),
    fig(9, 'Product view: an analysis', f09(), { cap: 'An analysis item: the expected curve (the latency budget, dashed) and the measured curve overlaid, the difference shaded where it is over budget, two difference marks; the chart is headed by its finding; the done rule; the criteria ring with its four named segments; the assistant\'s diagnosis with its published confidence and "Propose the fix".', focus: 'the measured curve against the budget', att: [0, 4, 20], uc: 'UC-B2 UC-A7 UC-Q3 13§6' }),
    fig(10, 'Product view, done: implications first', f10(), { cap: 'A done item opens on what it changed: the ripple on a cut-out of the wave (three buildings unblocked, a road opened, the Gate 1 Alpha ring advanced 9 %), the dates that moved, the five who were told, the lesson; the product and its met criteria below.', focus: 'the ripple of a finished item', att: [0, 2, 7], uc: 'UC-Q4 UC-B1 UC-G1 13§6' }),
    fig(11, 'Product view: a chore', f11(), { cap: 'A chore without a screen still has a product: expected as a checklist ring (3 of 5 steps), actual as the account badge, side by side; the party (Apple) as an embassy marker with what we wait for; the envelope step for the password, sealed for Noa.', focus: 'the checklist ring against the account', att: [0, 4, 4], uc: 'UC-B5 UC-H1 UC-P2 13§6' }),
  ].join('');
}
