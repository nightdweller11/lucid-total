// Section J (T36, 2026-10-29): projects, the divisible level above a task, and policies, the behavioural decisions.
import { desk, fig, chip, pill, I, AIC, g, av, agent, ring, box, flag } from './lib.mjs';
import { world, PL } from './world.mjs';
import { COMPANY } from './company.mjs';
import { dim } from './kit.mjs';
import { F } from './facades.mjs';

const C = COMPANY; const P = C.places;
const pp = (k, dx = 0, dy = 0) => [P[k].pole[0] + dx, P[k].pole[1] + dy];
const kan = (size = '') => `<span class="g f-gold${size ? ' ' + size : ''}" role="img" aria-label="Project">${I('kanban')}</span>`;
const stw = (s, w) => `<span style="font-size:12.5px;font-weight:600;white-space:nowrap;color:${{ doing: 'var(--acc)', review: 'var(--ai)', blocked: 'var(--block-h)', done: 'var(--good)', todo: 'var(--muted)' }[s]}">${w}</span>`;
const bar = (segs) => `<span style="position:relative;display:block;height:12px;border-radius:6px;background:var(--ink8);overflow:hidden;flex:1">${segs.map(([l, w, s]) => `<i style="position:absolute;top:0;bottom:0;left:${l}%;width:${w}%;background:${{ todo: 'var(--ink18)', doing: 'var(--acc)', review: 'var(--ai)', blocked: 'var(--block-h)', done: 'var(--good)' }[s]}"></i>`).join('')}</span>`;
const grow = (name, segs, s, w, sub) => `<div style="display:grid;grid-template-columns:200px 1fr 86px;gap:12px;align-items:center;padding:4px 6px;border-radius:10px"><span class="row" style="gap:6px;min-width:0">${g('task', 'sm')}<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px">${name}</span>${sub ? `<span class="meta">÷${sub}</span>` : ''}</span>${bar(segs)}<span style="text-align:end">${stw(s, w)}</span></div>`;
const frow = (icon, text, right) => `<span class="row" style="gap:10px;padding:6px 10px;border-radius:12px;font-size:15px">${icon}<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${text}</span><span class="meta" style="white-space:nowrap">${right}</span></span>`;
const stat = (n, label, color) => `<span class="col" style="align-items:center;gap:2px"><b class="ttl t4 num" style="${color ? 'color:' + color : ''}">${n}</b><span class="meta">${label}</span></span>`;

// ---------- frame 41: the project view (without the map) ----------
export function f41() {
  const head = `<div class="row" style="gap:14px;align-items:flex-start">${kan('lg')}<div class="col" style="gap:4px"><span class="lbl2">Project · Jun 2 → open · in Engineering, with Product and Design</span><span class="ttl t4">Private beta</span><span class="mut">200 users in three markets on Lucid Chat; the gate to the stores.</span></div></div>`;
  const stats = `<div class="row gl l1" style="gap:26px;padding:16px 20px;border-radius:20px;align-items:center;flex-wrap:wrap"><span style="position:relative;display:grid;place-items:center">${ring(96, 0.58, { fc: 0.86, w: 7, label: 'Private beta: 58 percent done by size, forecast 86 percent by the gate' })}<span style="position:absolute;font-family:var(--display);font-weight:600;font-size:22px">58<small style="font-size:13px;color:var(--muted)">%</small></span></span>${stat(91, 'tasks · 9 subtasks')}${stat(24, 'open')}${stat(2, 'blocked', 'var(--block-h)')}${stat(3, 'to decide', 'var(--f-rules)')}<span class="col" style="align-items:center;gap:2px">${g('risk', 'lg', 'Watch')}<span class="meta">Watch: the store date</span></span></div>`;
  const asks = `<span class="lbl2">Needs a decision</span><div class="col" style="gap:2px">${frow(g('decision', 'sm'), 'Store submission: go or hold?', 'you · 2 d ago')}${frow(g('ask', 'sm'), 'Which Hebrew copy for the consent screen?', 'Dana · 1 d ago')}${frow(g('ask', 'sm'), 'Unblock: Cohen Legal has not signed the DPA', 'lead · 4 d ago')}</div>`;
  const gantt = `<span class="lbl2">Time · every task's life, oldest first</span><div class="gl l1" style="padding:8px 6px;border-radius:18px;display:flex;flex-direction:column;gap:2px">
${grow('Dispatcher: ordered delivery', [[0, 8, 'todo'], [8, 52, 'doing'], [60, 40, 'done']], 'done', 'Done', 3)}
${grow('Relay: approve-first conveyance', [[6, 6, 'todo'], [12, 48, 'doing'], [60, 10, 'review'], [70, 30, 'done']], 'done', 'Done')}
${grow('Evals: prompt v12 in six languages', [[20, 10, 'todo'], [30, 50, 'doing'], [80, 20, 'review']], 'review', 'In review', 2)}
${grow('Consent screen with the EU notice', [[38, 8, 'todo'], [46, 44, 'doing'], [90, 10, 'review']], 'review', 'In review')}
${grow('Store listing and screenshots', [[50, 12, 'todo'], [62, 24, 'doing'], [86, 14, 'blocked']], 'blocked', 'Blocked')}
${grow('TestFlight build 7', [[64, 10, 'todo'], [74, 26, 'doing']], 'doing', 'In progress', 4)}
${grow('Load test at 200 users', [[80, 20, 'todo']], 'todo', 'Planned')}
</div><div class="row meta" style="justify-content:space-between"><span>Jun 2</span><span>4 dependencies reach outside the project (Compliance, Platform)</span><span>Nov 7</span></div>`;
  const left = `<div class="col" style="gap:20px">${head}${stats}${asks}${gantt}</div>`;
  const ctx = `<div class="ctx">${chip(av('N'), 'Noa leads')}${chip('calendar', 'Since Jun 2')}${chip('target', 'Serves Private beta', '', 'Serves the goal Private beta')}${chip('signpost', 'Opened by L312', '', 'Opened by decision L312')}${chip('map-pin', 'Engineering · Product · Design')}</div>`;
  const byState = `<span class="lbl2">Tasks by state</span><div class="col" style="gap:8px">
<div class="col" style="gap:2px"><span class="row" style="gap:8px;padding:4px 8px">${stw('blocked', 'Blocked')}<em style="color:var(--muted);font-style:normal">2</em></span>${frow(g('task', 'sm'), 'Store listing and screenshots', 'waits on the DPA')}${frow(g('task', 'sm'), 'Hebrew store copy', 'waits on the consent copy')}</div>
<div class="col" style="gap:2px"><span class="row" style="gap:8px;padding:4px 8px">${stw('review', 'In review')}<em style="color:var(--muted);font-style:normal">3</em></span>${frow(g('task', 'sm'), 'Evals: prompt v12 in six languages', '2 d')}${frow(g('task', 'sm'), 'Consent screen with the EU notice', '1 d')}${frow(g('task', 'sm'), 'Group settings', '5 h')}</div>
<span class="row" style="gap:8px;padding:4px 8px">${stw('doing', 'In progress')}<em style="color:var(--muted);font-style:normal">12</em><span class="meta" style="margin-inline-start:auto">${I('chevron-down')}</span></span>
<span class="row" style="gap:8px;padding:4px 8px">${stw('todo', 'Planned')}<em style="color:var(--muted);font-style:normal">7</em><span class="meta" style="margin-inline-start:auto">${I('chevron-down')}</span></span>
<span class="row" style="gap:8px;padding:4px 8px">${stw('done', 'Done')}<em style="color:var(--muted);font-style:normal">67</em><span class="meta" style="margin-inline-start:auto">${I('chevron-down')}</span></span></div>`;
  const rel = `<span class="lbl2">Shares tasks with</span><div class="col" style="gap:2px">${frow(kan('sm'), 'EU residency', '6 shared')}${frow(kan('sm'), 'iOS 1.0', '4 shared')}${frow(kan('sm'), 'Evals', '3 shared')}</div>`;
  const acts = `<div class="acts">${pill('map', 'Show on the world', 'pri', 'Show the project on the world: its tasks lit, the rest dimmed')}${pill('play', 'Play from its start')}${pill('git-branch', 'Divide')}${pill(AIC(), 'Ask')}</div>`;
  const right = `<div class="col" style="gap:22px">${ctx}${byState}${rel}${acts}</div>`;
  const pv = `<section class="pv gl l3" style="inset-inline-start:104px;top:76px;width:1232px;height:748px;grid-template-columns:640px minmax(0,1fr);row-gap:0;overflow:hidden" aria-label="Project view: Private beta">${left}${right}</section>`;
  return desk({ label: 'Project view: Private beta', body: dim(world(C, { id: 'f41', sizes: { eng: 'l' } })) + pv, crumb: ['Engineering', 'Private beta'], active: 'world' });
}

// ---------- frame 42: the project on the world ----------
export function f42() {
  const lit = ['eng', 'prd', 'dsg', 'cmp'];
  const fade = Object.keys(P).filter((k) => !lit.includes(k));
  const n = { eng: 61, prd: 14, dsg: 9, cmp: 7 };
  const over = lit.map((k) => [...pp(k, 0, 74), `<span class="chip sm" style="box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--f-gold) 60%,transparent)">${I('kanban')}<span>${n[k]} of the project</span></span>`]);
  over.push([...pp('cmp', 60, -70), flag('DPA: unblock?', 'message-circle-question', 'The DPA signature blocks the store listing')]);
  over.push([...pp('eng', 92, -66), flag('Store go/no-go', 'signpost', 'Store submission go or no-go')]);
  const thread = `<path class="road" d="M${pp('dsg')[0]},${pp('dsg')[1]} Q${pp('prd')[0]},${pp('prd')[1] - 40} ${pp('eng')[0]},${pp('eng')[1]} T${pp('cmp')[0]},${pp('cmp')[1]}" style="stroke:var(--f-gold);stroke-dasharray:6 8;stroke-width:2.2;fill:none" stroke-opacity=".8"/>`;
  const panel = `<div class="gl l2 cardx" style="position:absolute;inset-inline-start:1010px;top:96px;width:330px;z-index:20;gap:10px"><div class="row" style="gap:10px">${kan()}<span class="ttl t3">Private beta</span></div><span class="mut">On the world: its 91 tasks across four places, the rest dimmed; the gold thread is their order in time. Open decisions stand where they are.</span><div class="row" style="gap:8px;flex-wrap:wrap">${chip('circle-dot', '58 % done')}${chip('construction', '2 blocked', 'block')}${chip('message-circle-question', '3 to decide')}</div><div class="row" style="gap:8px">${pill('play', 'Play from its start', 'sm')}${pill('x', 'Clear', 'sm')}</div></div>`;
  const body = world(C, { fade, extra: thread, over, sizes: { eng: 'l', ldr: 's', fin: 's', sal: 's', ops: 's', ppl: 's', sys: 'xs' }, id: 'f42' }) + panel;
  return desk({ label: 'The project on the world', body, crumb: ['Company', 'Private beta'], tend: chip('kanban', 'Private beta', 'on', 'Project shown on the world') + chip('layers', 'Legend', 'quiet', 'Legend and layers, closed'), active: 'world' });
}

// ---------- frame 43: policies, and adopting one with its reach shown ----------
export function f43() {
  const SC = { development: ['square-terminal', 'Development'], company: ['building-2', 'Company'], ai: ['bot', 'AI behaviour'], money: ['wallet', 'Money'] };
  const pol = (n, body, scope, enforce, applies, since, by) => `<div class="row gl l1" style="gap:14px;padding:14px 16px;border-radius:18px;align-items:flex-start">${g('decision', '', 'Policy')}<div class="col" style="gap:4px;flex:1;min-width:0"><span style="font-weight:600;font-size:17px">${n}</span><span class="mut" style="font-size:14.5px">${body}</span><div class="row" style="gap:6px;flex-wrap:wrap;margin-top:4px">${chip(SC[scope][0], SC[scope][1], 'sm')}${chip(enforce === 'gate' ? 'shield-check' : enforce === 'check' ? 'search-check' : 'bell', enforce === 'gate' ? 'Gate' : enforce === 'check' ? 'Check' : 'Reminder', 'sm')}${chip('users-round', applies, 'sm')}${chip('calendar', `Since ${since} · ${by}`, 'sm')}</div></div></div>`;
  const list = `<div class="col" style="gap:8px">
${pol('Every feature is walked through in the real interface before it is done', 'Both phones and the browser; every control clicked, every behaviour simulated; evidence attached.', 'development', 'gate', 'people and AI', 'Sep 15', 'the owner')}
${pol('Check with Noa before contacting investors', 'Any outreach to an investor, current or prospective, is agreed with Noa first.', 'company', 'gate', 'people and AI', 'Jun 1', 'the owner')}
${pol('Agents never message a customer without a person reading first', 'Tier-one answers are drafted by the agent and sent by a person until the trust score allows otherwise.', 'ai', 'gate', 'AI', 'Jul 1', 'the owner')}
${pol('Spend above the monthly model budget needs the owner', 'The ops agent pauses non-urgent runs when the budget is reached and asks.', 'money', 'gate', 'AI', 'Nov 1', 'the owner')}
${pol('Fail-closed conversations stay fail-closed', 'From the incident review of the dispatcher outage: no delivery path bypasses the mediator.', 'development', 'check', 'people and AI', 'Dec 1', 'the owner')}
</div>`;
  const head = `<div class="row" style="gap:14px;align-items:flex-start"><span class="g lg f-rules" role="img" aria-label="Policies">${I('scale')}</span><div class="col" style="gap:4px"><span class="ttl t4">Policies · 6 in force</span><span class="mut">A decision about behaviour: how things operate, for people and for the AI. Not a task. Added, changed and retired as decisions; read by the AI before it acts.</span></div></div>`;
  const left = `<div class="col" style="gap:18px">${head}${list}</div>`;
  const reach = `<div class="cardx gl l2" data-needs="1" style="box-shadow:inset 0 0 0 1.5px var(--f-rules),0 20px 50px var(--shadow);gap:14px" aria-label="Adopt a policy: its reach"><div class="row" style="gap:10px">${g('proposal', 'lg', 'A proposed policy')}<span class="ttl t3">Adopt: “No release on a Friday”</span></div><span class="mut">Proposed by Noa after the dispatcher outage. Before it is adopted, this is what it would change:</span>
<div class="col" style="gap:8px;font-size:15px">
<span class="row" style="gap:10px">${I('shield-check')}<span><b>Gates 2 processes</b>: store submission, production deploy</span></span>
<span class="row" style="gap:10px">${I('square-check-big')}<span><b>5 open tasks</b> move their date past the weekend</span></span>
<span class="row" style="gap:10px">${I('calendar')}<span>The <b>Teams launch</b> (Fri Nov 14) moves to Mon Nov 17</span></span>
<span class="row" style="gap:10px">${I('bell')}<span>The AI reminds at the moment, never a wall of rules</span></span>
<span class="row" style="gap:10px">${I('users-round')}<span>Applies to <b>people and the AI</b> · scope: development</span></span></div>
<div class="row" style="gap:8px">${pill('check', 'Adopt', 'pri', 'Adopt the policy: recorded as a decision with this reach')}${pill('pencil', 'Change')}${pill('clock', 'Later')}</div></div>`;
  const ai = `<div class="say">${`<span class="g f-lucid" role="img" aria-label="Lucid">${AIC()}</span>`}<span class="bub ai"><span class="who">Lucid</span>Two of the five tasks already sit on a Friday; I would move them when you adopt it and tell their owners. The Teams launch date was set by the owner, so that move becomes an ask.</span></div>`;
  const right = `<div class="col" style="gap:18px">${reach}${ai}</div>`;
  const sheet = `<section class="pv gl l3" style="inset-inline-start:104px;top:76px;width:1232px;height:748px;grid-template-columns:700px minmax(0,1fr);row-gap:0;overflow:hidden" aria-label="Policies and adopting one">${left}${right}</section>`;
  return desk({ label: 'Policies, and adopting one with its reach shown', body: dim(world(C, { id: 'f43' })) + sheet, crumb: ['Company', 'Policies'], active: 'more' });
}

export function sectionJ() {
  return [
    fig(41, 'Project view', f41(), { cap: 'The level above a task, without the map: done share by size with the forecast tick, tasks and subtasks, open, blocked, to decide, health; the asks that wait on it; every task\'s life as a bar by state; tasks by state; the projects it shares tasks with; Show on the world, Play from its start, Divide.', focus: 'the Private beta project', att: [1, 6, 14], uc: 'UC-A4 UC-Q3 UC-R5 · 13§6 · 02§4.2' }),
    fig(42, 'The project on the world', f42(), { cap: 'The same project laid over the company: the places that hold its tasks keep their colour with a count, the rest fade, the gold thread is the order of its tasks in time, and its open decisions stand where they are. The project lens of the living map (docs/16 §16.6).', focus: 'Private beta across four places', att: [2, 6, 8], uc: 'UC-A4 UC-A3 · 16§16.6' }),
    fig(43, 'Policies', f43(), { cap: 'A policy is a decision about behaviour, for people and for the AI: scope, enforcement (gate, check, reminder), who it applies to, since and by. Adopting one shows its reach first: the processes it gates, the open tasks it moves, the dates it touches; the AI says what it would do. docs/18.', focus: 'adopting “No release on a Friday”', att: [1, 7, 6], uc: 'UC-R1 UC-S6 · 18§3' }),
  ].join('');
}
