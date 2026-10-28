import { desk, phone, fig, chip, pill, I, AIC, TM, g, aiG, av, agent, ring, place, building, kindBld, barrier, box, flag } from './lib.mjs';
import { F } from './facades.mjs';
import { world } from './world.mjs';
import { COMPANY } from './company.mjs';
import { lm } from './landmarks.mjs';
import { cut, datec, conf, strip, hint } from './kit.mjs';
import { storeVisual } from './framesC.mjs';
const C = COMPANY; const P = C.places;
const SMALL = { sys: 'xs', ppl: 's', ldr: 's', fin: 's', sal: 's', ops: 's' };
const shell = (body, label) => `<div class="scr desk pt" role="region" aria-label="${label}"><div class="stage">${body}</div></div>`;
// a rendered Horizon cut-out, as the image card the briefing agent sends
const glanceImg = (w, h) => `<div class="cut" style="width:${w}px;height:${h}px;border-radius:16px"><div class="inner" style="transform:translate(${Math.round(w / 2 - 760 * (w / 1440) * 1.12)}px,${Math.round(h / 2 - 450 * (w / 1440) * 1.12)}px) scale(${(w / 1440 * 1.12).toFixed(3)})">${world(C, { heat: [{ at: [650, 551], r: 190 }], fronts: [{ at: [1121, 207], rx: 130, ry: 70 }], sizes: { eng: 'l', ...SMALL }, noNames: Object.keys(P), id: 'gl' + w })}</div><span style="position:absolute;inset-inline-start:12px;top:10px" class="row"><span class="chip" style="padding:4px 10px;font-size:13px">${TM()}Your morning</span></span></div>`;
// ---------- frame 32: a day in Lucid Chat ----------
export function f32() {
  const t = (x) => `<div style="text-align:center;margin:6px 0" class="meta">${x}</div>`;
  const inb = (html, o = {}) => `<div class="row" style="align-items:flex-end;gap:10px;max-width:600px">${o.av === false ? '<span style="width:32px"></span>' : `<span class="g f-lucid" style="width:32px;height:32px" role="img" aria-label="Lucid Total">${TM()}</span>`}<div class="bubble in">${html}</div></div>`;
  const out = (txt) => `<div class="bubble out">${txt}</div>`;
  const fork = inb(`<div class="col" data-needs="1" style="gap:10px"><span class="row" style="gap:8px;font-weight:600">${I('coins')}Cost: $0 · Toil: 2 h of Noa</span><b style="font-size:17px">Store submission: go or hold?</b><span class="mut">Build 7 passes everything but the Hebrew consent screen. Recommended: after the fix.</span><div class="row" style="gap:8px">${pill('', '1 · After the fix', 'pri sm')}${pill('', '2 · Submit now', 'sm')}</div></div>`);
  const conv = `<div class="col" style="gap:12px;width:760px">
${t('Today 07:30')}${inb(`Good morning. <b>14 buildings lit, 2 roads opened, 1 front grew over Compliance.</b> Two things need you.`)}
${inb(`<div class="col" style="gap:8px">${glanceImg(340, 180)}<span class="meta">Tap to open the Horizon</span></div>`, { av: false })}
${fork}${out('1')}
${inb(`<span class="row" style="gap:8px">${I('circle-check-big')}Done: submit after the Hebrew fix. Store date Nov 5; Omer and Noa told.</span><div class="row" style="gap:8px;margin-top:8px">${pill('undo-2', 'Undo', 'sm')}<span class="meta">until Fri 18:00</span></div>`)}
${inb(`<span class="meta">18:00</span> Quiet day. The beta moved 3 %, nothing breached.`)}</div>`;
  const head = `<div class="row" style="gap:12px;padding:14px 22px;border-radius:999px;width:760px"><span class="g lg f-lucid" role="img" aria-label="Lucid Total">${TM()}</span><span class="grow"><b>Lucid Total</b> <span class="meta row" style="gap:4px;display:inline-flex">${I('badge-check')}verified · key 7F3A 21C9</span></span>${I('phone')}${I('ellipsis-vertical')}</div>`;
  const body = `${box(340, 30, 760, 0, `<div class="gl l2" style="border-radius:999px">${head}</div>`)}${box(340, 100, 760, 0, conv)}${box(340, 820, 760, 0, `<div class="row gl l3" style="gap:10px;padding:8px 10px 8px 18px;border-radius:999px"><span class="grow mut">Message Lucid Total</span><span class="pill" style="width:40px;height:40px;padding:0;border-radius:50%">${I('mic')}</span></div>`)}`;
  return shell(body, 'A day in Lucid Chat');
}
// ---------- frame 33: email and Slack ----------
export function f33() {
  const mail = `<div class="gl l2" data-needs="1" style="width:640px;border-radius:26px;padding:28px;display:flex;flex-direction:column;gap:16px">
<div class="col" style="gap:4px"><span class="meta">From: Lucid Total &lt;decide+st-71@belucid.chat&gt; · To: Yossi</span><span class="ttl t3">Store submission: go or hold?</span></div>
<div class="row" style="gap:20px;align-items:flex-start">${storeVisual(240, 158)}<span class="col" style="gap:8px"><b>Cost: $0 · Toil: 2 h of Noa</b><span class="mut">Build 7 passes everything but the Hebrew consent screen. Apple has rejected right-to-left faults twice before.</span><span>Recommended: <b>1</b></span></span></div>
<div class="gl" style="border-radius:18px;padding:16px 18px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:15px;line-height:1.7;direction:ltr"><span class="meta" style="font-family:var(--ui)">Reply with one line:</span><br>1 &nbsp;&nbsp;&nbsp;&nbsp;After the Hebrew fix (store Nov 5)<br>2 &nbsp;&nbsp;&nbsp;&nbsp;Submit now<br>later Ask me tomorrow</div>
<span class="row meta" style="gap:8px">${I('key-round')}This reply is signed for you and this decision; it expires Fri 18:00. Irreversible choices open the app.</span></div>`;
  const msg = (who, avh, html, o = {}) => `<div class="row" style="gap:12px;align-items:flex-start;${o.eph ? 'padding:12px;border-radius:16px;background:color-mix(in srgb,var(--ai) 12%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ai) 35%,transparent)' : ''}">${avh}<div class="col" style="gap:6px"><span><b>${who}</b> <span class="meta">${o.time || ''}</span></span>${html}</div></div>`;
  const bot = `<span class="av ag md" style="border-radius:10px" role="img" aria-label="Agent: Lucid Total">${TM()}</span>`;
  const slack = `<div class="gl l2" style="width:620px;border-radius:26px;padding:24px;display:flex;flex-direction:column;gap:18px">
<div class="row" style="gap:10px"><b style="font-size:17px"># beta-eng</b><span class="meta">Slack · Lucid Total is a member</span></div>
${msg('Noa', av('N', '', 'md'), `<span>I'll get the release-path tests green by Thursday.</span>`, { time: '10:12' })}
${msg('Lucid Total', bot, `<span class="meta" data-needs="1">Only visible to you</span><span>I heard a commitment: <b>release-path tests green by Thursday</b>.</span><div class="row" style="gap:8px">${pill('plus', 'Make it a task', 'pri sm')}${pill('', 'Not now', 'sm')}</div>`, { eph: true, time: '10:12' })}
${msg('Omer', av('O', '', 'md'), `<span>When does the store build go out?</span>`, { time: '10:20' })}
${msg('Lucid Total', bot, `<span>After the Hebrew fix, Nov 5. Yossi chose it this morning.</span><span class="row" style="gap:6px">${chip('signpost', 'Decision ST-71', 'quiet')}${chip('square-check-big', 'P1-C-06', 'quiet')}</span>`, { time: '10:20' })}
${msg('Lucid Total', bot, `<span class="mut">Today in beta-eng: 4 items moved, the Relay road opened, nothing breached.</span>`, { time: '18:00' })}</div>`;
  return shell(`${box(56, 70, 1340, 0, `<div class="row" style="gap:48px;align-items:flex-start">${mail}${slack}</div>`)}`, 'Email and Slack');
}
export function sectionG() {
  return [
    fig(32, 'A day in Lucid Chat', f32(), { cap: 'The system as a verified contact in Lucid Chat (Lucid Chat\'s bubbles, lightly): the morning line and a rendered Horizon cut-out as an image card; a fork as a message with numbered reply pills and the cost-and-toil line first; the reply "1"; the confirmation with Undo until the reversible-until mark; the quiet evening line.', focus: 'the fork and its reply', att: [1, 1, 18], uc: 'UC-T1 UC-C3 15§2 15§5' }),
    fig(33, 'Email and Slack', f33(), { cap: 'Left: a decision email with one visual, the reply-to-decide block and the signed-token note. Right: the agent as a member of a Slack channel: a commitment heard and proposed back only to the speaker; a question answered with citations; the quiet daily line.', focus: 'the reply-to-decide block', att: [2, 2, 19], uc: 'UC-T2 UC-T3 15§2.3 15§5.1' }),
  ].join('');
}
