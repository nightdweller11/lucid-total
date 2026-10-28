import { desk, fig, chip, pill, I, AIC, g, aiG, av, agent, ring, place, building, kindBld, barrier, box, flag } from './lib.mjs';
import { F, phoneScreen } from './facades.mjs';
import { world, layout, PL } from './world.mjs';
import { COMPANY } from './company.mjs';
import { lm } from './landmarks.mjs';
import { dim, datec, conf, strip, stations, hint } from './kit.mjs';
import { r1 } from './geo.mjs';
const C = COMPANY; const P = C.places;
const SUBS = {
  api: { name: 'api', lm: 'bridge', hue: 'sky', prog: 0.99, subj: 'The API role: requests in, answers out' }, ai: { name: 'ai', lm: 'satellite', hue: 'ai', prog: 0.97, subj: 'The model gateway, routing and evals' },
  worker: { name: 'worker', lm: 'gears', hue: 'drift', prog: 0.95, subj: 'Jobs, schedules and retries' }, scene: { name: 'scene', lm: 'loom', hue: 'rules', prog: 0.62, subj: 'The Stage: composing, validating and rendering scenes' },
  knowledge: { name: 'knowledge', lm: 'scroll', hue: 'sky', prog: 0.93, subj: 'Retrieval over items, docs and decisions' }, channels: { name: 'channels', lm: 'beacon', hue: 'ai', prog: 0.98, subj: 'Lucid Chat, email and Slack' },
  connectors: { name: 'connectors', lm: 'harbour', hue: 'drift', prog: 0.9, subj: 'GitHub, Railway and accounting' }, importer: { name: 'importer', lm: 'keep', hue: 'rules', prog: 1, subj: 'The 2,400-row import, finished' },
  data: { name: 'data', lm: 'vault', hue: 'sky', prog: 0.99, subj: 'Postgres, the bucket, backups, the audit chain' },
};
Object.assign(PL, SUBS);
const SYS = layout({ W: 1440, H: 900, coast: { cx: 560, cy: 470, rx: 450, ry: 340, n: 2.4, wob: 0.07, seed: 33 }, places: [
  { k: 'api', x: 300, y: 300, t: 6 }, { k: 'ai', x: 540, y: 220, t: 8 }, { k: 'channels', x: 780, y: 270, t: 6 }, { k: 'worker', x: 270, y: 540, t: 6 }, { k: 'scene', x: 560, y: 480, t: 9, subs: [2, 2, 1] }, { k: 'knowledge', x: 830, y: 500, t: 6 }, { k: 'connectors', x: 340, y: 720, t: 5 }, { k: 'data', x: 600, y: 730, t: 7 }, { k: 'importer', x: 830, y: 720, t: 4 }] });
// ---------- frame 27: the System place ----------
export function f27() {
  const Q = SYS.places; const [sx, sy] = Q.scene.pole;
  const over = [[sx + 150, sy + 90, building(F.diff({ label: 'The open repair: the RTL fix in a worktree' }), { w: 120, lit: true, segs: ['met', 'met', 'partly', 'open'], label: 'Repair: RTL render fault' })], [sx - 30, sy - 112, `<div class="row" style="gap:6px;color:var(--muted)">${I('cloud-lightning')}<span>RTL render fault</span></div>`], [sx + 238, sy + 50, agent('Repair agent', 'doing')]];
  const panel = `<aside class="aspect gl l2" style="gap:30px" aria-label="System health"><div class="hd"><span class="h-ai" style="display:inline-flex">${lm('tower', 40, '', 'System emblem')}</span><span class="ttl t3">System</span><span class="grow"></span>${chip('arrow-up-right', 'Open', 'quiet')}</div>
<div class="row h-ai" style="gap:18px"><span style="position:relative;display:grid;place-items:center">${ring(110, 0.56, { fc: 0.8, w: 6, label: 'Cost today: 14 of 25 dollars' })}<span style="position:absolute;text-align:center"><b style="font-size:22px">$14</b><br><span class="meta">of $25</span></span></span><div class="col" style="gap:6px"><span class="say" style="font-size:17px;font-weight:600">Cost today is on budget</span><span class="mut">Most of it is the strongest class, diagnosing the scene fault.</span></div></div>
<div class="col" style="gap:12px"><span class="lbl2">Being built for the System</span><span class="row" style="gap:10px">${g('task', 'sm')}Repair: RTL render fault</span><span class="row" style="gap:10px">${g('proposal', 'sm')}A Sankey component for budget flows</span><span class="row" style="gap:10px">${g('task', 'sm')}Faster scene validation</span></div></aside>`;
  const body = world(SYS, { fronts: [{ at: [sx - 20, sy - 50], rx: 150, ry: 70 }], heat: [{ at: [sx + 60, sy + 40], r: 140 }], over, id: 'f27', sizes: { scene: 'l', importer: 's', connectors: 's' } }) + panel;
  return desk({ label: 'The System place', body, crumb: ['Company', 'System'], active: 'world' });
}
// ---------- frame 28: a repair in progress ----------
export function f28() {
  const loop = stations([['radar', 'Detect'], ['stethoscope', 'Diagnose'], ['lightbulb', 'Propose'], ['hammer', 'Build'], ['scan-eye', 'Verify'], ['rocket', 'Deploy'], ['circle-check-big', 'Confirm']], 4, 980, { h: 90, y: 24, arc: 0, ai: true });
  const session = `<div class="col" style="gap:14px;align-items:flex-start">${building(F.diff({ label: 'The change: scene renderer, RTL path' }), { w: 300, lit: true, label: 'Claude Code session building the fix' })}<span class="row" style="gap:10px">${agent('Claude Code session', 'doing', 'md')}<span><b>Claude Code session · worktree rtl-fix</b><br><span class="mut">Running the RTL walkthrough in Chromium and WebKit</span></span></span></div>`;
  const evidence = `<div class="col" style="gap:16px"><span class="lbl2">Evidence so far</span><div class="row" style="gap:10px;flex-wrap:wrap">${chip('<span style="color:var(--good)">' + I('circle-check-big') + '</span>', 'Tests 212 / 212')}${chip('<span style="color:var(--good)">' + I('shield-check') + '</span>', 'Validator passed')}${chip('scan-eye', 'Walkthrough running', 'quiet')}</div><div class="row" style="gap:16px">${['chatHe', 'consentHe'].map((k) => `<span style="width:120px;height:246px;border-radius:16px;overflow:hidden;box-shadow:inset 0 0 0 1px var(--gl),0 10px 24px var(--shadow);display:block">${F.screenTall(k, { label: 'Screenshot: the RTL render after the fix' })}</span>`).join('')}<div class="col" style="gap:10px;max-width:280px"><span class="row" style="gap:8px">${chip('bell', 'Autonomy: inform', '', 'Autonomy level for this repair class: inform')}</span><span class="mut">This repair class deploys and tells you after; it rolls back if the monitor that found the fault fires again.</span></div></div></div>`;
  const body = `${box(110, 80, 1220, 0, `<div class="row" style="gap:14px">${g('incident', 'lg')}<span class="ttl t4">Repairing: RTL render fault in the scene renderer</span></div>`)}
${box(140, 170, 1000, 0, loop)}
${box(110, 320, 1220, 0, `<div class="row" style="gap:60px;align-items:flex-start">${session}${evidence}</div>`)}
${box(110, 742, 1220, 0, `<div class="row gl ai" style="gap:12px;padding:12px 18px;border-radius:999px;display:inline-flex">${AIC()}<span>On your Horizon when it is done: <b>“System repaired itself: RTL rendering, 40 minutes, no data touched.”</b></span></div>`)}`;
  return desk({ label: 'A repair in progress', body, crumb: ['System', 'scene', 'Repair'], active: 'world' });
}
// ---------- frame 29: AI processes (the process table as quiet cards) ----------
export function f29() {
  const card = (o) => `<div class="cardx gl ${o.stop ? '' : 'l2'}" style="width:360px;${o.stop ? 'box-shadow:inset 0 0 0 1.5px var(--block-h)' : ''}"><div class="row" style="gap:12px">${agent(o.name, o.st, 'md')}<span class="grow"><b>${o.name}</b><br><span class="meta">${o.kind} · agent</span></span>${chip('cpu', o.cls, 'quiet', 'Model class: ' + o.cls)}</div><span class="row" style="gap:8px">${I('link')}<span>${o.item}</span></span>${o.path || ''}<div class="row meta" style="gap:14px;font-size:15px"><span class="row" style="gap:6px">${I('clock')}${o.age}</span><span class="row" style="gap:6px">${I('coins')}${o.cost}</span><span class="row" style="gap:6px">${I('activity')}${o.last}</span></div>${o.stop ? `<div class="row" style="gap:10px">${barrier('The importer stopped: the accounting export changed shape', false)}<span>Stopped: the export changed shape</span>${pill('rotate-ccw', 'Retry', 'sm')}</div>` : ''}</div>`;
  const vpath = `<div style="padding:4px 0 26px">${stations([['hammer', 'Produce'], ['shield-check', 'Validate'], ['user-check', 'Confirm']], 1, 260, { h: 64, y: 16, arc: 0, ai: true })}</div>`;
  const cards = [
    card({ name: 'Coordinator', kind: 'playbook', st: 'doing', cls: 'strongest', item: 'Gate 1 Alpha', age: '3 h', cost: '$4.10', last: 'assigned P1-C-06' }),
    card({ name: 'Worker B', kind: 'build', st: 'doing', cls: 'code', item: 'P1-C-03 · Dispatcher under load', age: '52 min', cost: '$2.80', last: 'ran the load test', path: vpath }),
    card({ name: 'Worker C', kind: 'build', st: 'wait', cls: 'code', item: 'P1-C-06 · Relay approve-first', age: '20 min', cost: '$0.90', last: 'waits for Noa' }),
    card({ name: 'Triage agent', kind: 'triage', st: 'idle', cls: 'fast', item: 'Support intake', age: 'idle 1 h', cost: '$0.30', last: 'filed ASK-017' }),
    card({ name: 'Evidence agent', kind: 'validator', st: 'doing', cls: 'vision', item: 'Walkthrough of the RTL fix', age: '6 min', cost: '$0.60', last: 'checked 4 screenshots' }),
    card({ name: 'Importer', kind: 'import', st: 'stop', cls: 'local', item: 'Accounting export', age: '2 h', cost: '$0', last: 'stopped', stop: true }),
  ];
  const totals = `<div class="row" style="gap:40px">${[['Budget used today', 0.52, '$31 of $60', 'ai'], ['Runs validated first time', 0.94, '94 %', 'ai']].map(([t, v, c, h]) => `<div class="row h-${h}" style="gap:14px"><span style="position:relative;display:grid;place-items:center">${ring(84, v, { w: 5, label: t })}<span style="position:absolute;font-weight:600">${c.split(' ')[0]}</span></span><span><b>${t}</b><br><span class="mut">${c}</span></span></div>`).join('')}</div>`;
  const body = `${box(110, 76, 1220, 0, `<div class="row" style="gap:20px"><span class="ttl t4">AI processes</span><span class="grow"></span>${totals}</div>`)}${box(110, 200, 1220, 0, `<div style="display:grid;grid-template-columns:repeat(3,360px);gap:24px 40px">${cards.join('')}</div>`)}`;
  return desk({ label: 'AI processes', body, crumb: ['System', 'Processes'], active: 'more' });
}
// ---------- frame 30: Settings → Models ----------
export function f30() {
  const cls = (o) => `<div class="cardx gl ${o.fable ? 'l3' : 'l2'}" style="width:282px;${o.fable ? 'box-shadow:inset 0 0 0 1.5px var(--f-rules),0 20px 50px var(--shadow)' : ''}" ${o.fable ? 'data-needs="1"' : ''}><div class="row" style="gap:10px">${o.fable ? g('decision', 'lg', 'A decision') : `<span class="g lg f-lucid">${I('cpu')}</span>`}<span class="ttl t3">${o.n}</span></div><span>${o.good}</span>
<div class="row" style="gap:8px"><span class="row" style="gap:3px" role="img" aria-label="Speed ${o.speed} of 4">${[1, 2, 3, 4].map((i) => `<i style="width:8px;height:${8 + i * 4}px;border-radius:2px;background:${i <= o.speed ? 'var(--fg)' : 'var(--ink18)'}"></i>`).join('')}</span><span class="mut">${o.lat}</span></div>
<span class="row" style="gap:8px">${I('coins')}<b>${o.cost}</b><span class="mut">a typical task</span></span>
<span class="row" style="gap:8px">${I(o.zdr ? 'shield-check' : 'hourglass')}${o.zdr ? 'Zero data retention' : 'Kept 30 days by the provider'}</span>
<span class="row" style="gap:10px">${[['normal', 'circle', true], ['sensitive', 'shield', o.sens], ['restricted', 'lock', false], ['payroll', 'wallet', false]].map(([n, ic, ok]) => `<span class="g sm ${ok ? 'f-good' : 'f-slate'}" role="img" aria-label="${n}: ${ok ? 'allowed' : 'never'}" title="${n}: ${ok ? 'allowed' : 'never'}" style="${ok ? '' : 'opacity:.55'}">${I(ok ? ic : 'x')}</span>`).join('')}</span>
<span class="meta">Used for: ${o.uses}</span>${o.fable ? `<div class="col" style="gap:8px;margin-top:4px"><span class="mut">About $140 a month at today’s use · moves diagnosis and change sets here</span><div class="row" style="gap:8px">${pill('power', 'Enable', 'pri sm', 'Enable: opens the decision with its context')}${pill('info', 'Context', 'sm')}</div></div>` : `<span class="row meta" style="gap:6px">${I('user-check')}${o.state}</span>`}</div>`;
  const cards = [cls({ n: 'Fast', good: 'Sorting, routing, short triage.', speed: 4, lat: '0.4 s typical', cost: '$0.002', zdr: true, sens: true, uses: 'classify, triage', state: 'On since Oct 2' }), cls({ n: 'Standard', good: 'Briefings and composing scenes.', speed: 3, lat: '1.8 s', cost: '$0.03', zdr: true, sens: true, uses: 'briefings, scenes', state: 'On since Oct 2' }), cls({ n: 'Strongest', good: 'Diagnosis, change sets, code.', speed: 2, lat: '6 s', cost: '$0.42', zdr: true, sens: true, uses: 'diagnosis, builds', state: 'On since Oct 2' }), cls({ n: 'Fable', good: 'The hardest reasoning and core code.', speed: 1, lat: '14 s', cost: '$1.10', zdr: false, sens: false, uses: 'nothing yet', fable: true })];
  const body = `${box(110, 76, 1220, 0, `<div class="col" style="gap:6px"><span class="ttl t4">Models</span><span class="mut">Classes, not model names: what each is good at, how fast, what it costs, what data may reach it.</span></div>`)}${box(110, 190, 1220, 0, `<div class="row" style="gap:24px;align-items:stretch">${cards.join('')}</div>`)}`;
  return desk({ label: 'Settings: Models', body, crumb: ['Settings', 'Models'], active: 'more' });
}
// ---------- frame 31: the Trust map ----------
export function f31() {
  const LV = [['observe', 'eye'], ['suggest', 'lightbulb'], ['confirm', 'hand'], ['inform', 'bell'], ['run', 'play']];
  const lvl = { sys: 4, eng: 3, prd: 2, dsg: 2, ops: 2, mkt: 1, sup: 1, cmp: 1, ldr: 1, sal: 1, fin: 0, ppl: 0 };
  const tint = Object.entries(lvl).map(([k, v]) => `<path d="${P[k].path}" style="fill:var(--ai)" fill-opacity="${[0.02, 0.08, 0.15, 0.24, 0.36][v]}"/>`).join('');
  const over = Object.entries(lvl).map(([k, v]) => [...(k === 'eng' ? [P[k].pole[0], P[k].pole[1] + 104] : [P[k].pole[0], P[k].pole[1] + (['sys', 'ppl', 'ldr', 'fin', 'sal', 'ops'].includes(k) ? 64 : 78)]), `<span class="chip" style="padding:3px 10px;font-size:13px;gap:5px;background:color-mix(in srgb,var(--ai) 22%,var(--g2))" role="img" aria-label="${P[k].name}: ${LV[v][0]}">${I(LV[v][1])}${LV[v][0]}</span>`]);
  over.push([P.sup.pole[0] - 40, P.sup.pole[1] + 20, `<div class="gl l3 cardx" data-needs="1" style="width:400px;box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--ai) 60%,transparent),0 24px 60px var(--shadow)"><span class="row" style="gap:10px">${g('proposal')}<b>Support × triage → inform</b></span><span class="mut">92 % accepted unchanged over 400 runs; 3 % undone. It would stop asking for about 60 triage replies a month and tell you after.</span><div class="row" style="gap:8px">${pill('eye', 'Preview', 'sm')}${pill('check', 'Confirm', 'pri sm')}</div></div>`]);
  const legend = `<div class="gl l2" style="position:absolute;top:24px;left:50%;transform:translateX(-50%);padding:12px 16px;border-radius:20px;display:flex;gap:14px;z-index:20">${LV.map(([n, ic], i) => `<span class="row" style="gap:6px;font-size:13px"><i style="width:14px;height:14px;border-radius:4px;background:color-mix(in srgb,var(--ai) ${[8, 22, 38, 58, 80][i]}%,transparent)"></i>${I(ic)}${n}</span>`).join('')}</div>`;
  const body = world(C, { extra: tint, over, id: 'f31', sizes: { eng: 'l', sys: 'xs', ppl: 's', ldr: 's', fin: 's', sal: 's', ops: 's' } }) + legend;
  return desk({ label: 'Trust map', body, crumb: ['Company', 'Trust'], tend: chip('shield-check', 'Trust layer', '', 'Layer: trust, on'), active: 'world' });
}
export function sectionF() {
  return [
    fig(27, 'The System place', f27(), { cap: 'Lucid Total as its own first tenant: its subsystems as sub-places with landmarks and health rings; a front over scene (the RTL render fault); the open repair as a lit building with the repair agent present; cost today as one ring; what is being built for the System.', focus: 'scene, with its front and the repair', att: [0, 10, 2], uc: 'UC-S1 UC-S2 14§2' }),
    fig(28, 'A repair in progress', f28(), { cap: 'The repair loop as a path with Verify lit; the Claude Code session as a building showing the change, with its working line; evidence as artefacts to review (tests, the validator, the RTL screenshots), not a log; the autonomy chip; the one line that will reach the Horizon.', focus: 'the session and its evidence', att: [0, 1, 3], uc: 'UC-S3 UC-B6 14§4' }),
    fig(29, 'AI processes', f29(), { cap: 'The process table as quiet cards: each agent says it is an agent and has one of four states (working, waiting, idle, stopped), its model class, owner item, age, cost today and last change; one stopped process with its barrier and a retry; the validation steps as a short path on one card; totals as two rings.', focus: 'the stopped importer', att: [0, 1, 26], uc: 'UC-S5 UC-D3 14§6.1' }),
    fig(30, 'Settings → Models', f30(), { cap: 'One card per class: what it is good at, speed, cost per typical task, data terms, the data classes allowed as glyphs, default uses. Fable is a decision card: enabling it opens the decision with its monthly cost and the routes that would change. No model id appears.', focus: 'the Fable decision card', att: [1, 5, 13], uc: 'UC-S6 14§7.3' }),
    fig(31, 'Trust map', f31(), { cap: 'A layer over the world: each place tinted by how far the system runs it (observe · suggest · confirm · inform · run, glyph and word on each), the legend; one advancement proposal (Support × triage → inform) with its figures, Preview and Confirm.', focus: 'the Support advancement proposal', att: [1, 6, 4], uc: 'UC-S7 UC-L2 14§8.3' }),
  ].join('');
}
