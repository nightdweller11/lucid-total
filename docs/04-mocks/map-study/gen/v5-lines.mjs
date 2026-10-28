// V5 Lines: the company as a transit network. Processes are lines (idea to feedback; lead to resolution; the beta's
// store line; the Europe line), stations are milestones and gates, trains are items in motion, crowding is congestion,
// a delayed or disrupted segment is a slipped date or a stuck step, interchanges are where programs overlap. Places are
// the districts the lines pass through, drawn faintly behind. Layers are service maps. Zooming enters a station.
import { W, H, PW, PH, rng, r1, lerp, clamp, smooth, blobPts, T, ring, G, flag, barrier, avatar, facade, chrome, ramp, keyRow, sw, haloFilter } from './lib.mjs';
import { DOM, hue, ENG, STREAMS } from './company.mjs';

export const meta = {
  n: 5, name: 'Lines', icon: 'train-front',
  line: 'The company as a transit network of its processes.',
  intro: 'Every process is a line (idea to feedback, lead to resolution, the beta\'s store line, the Europe line); stations are milestones and gates, trains are items in motion, crowding is congestion, a disrupted segment is a stuck step, interchanges are where programs overlap. The departments are the districts the lines run through, drawn faintly behind. It is the best variant at flow and time, and the weakest at place. Zooming enters a station: its platforms are the streams, its shopfronts the products.',
};

const DIST = { lead: [390, 230, 120, 80], prod: [600, 185, 125, 80], design: [850, 175, 110, 75], comp: [1150, 250, 130, 95], sales: [200, 440, 100, 90], ops: [380, 590, 130, 100], eng: [700, 470, 200, 130], mkt: [1110, 560, 140, 110], support: [780, 735, 140, 80], fin: [1180, 770, 110, 70], people: [470, 775, 110, 70] };
const LC = { build: 'var(--f-sky)', store: 'var(--f-violet)', cust: 'var(--f-lime)', europe: 'var(--f-rules)' };
const LN = { build: 'Build line', store: 'Store line', cust: 'Customer line', europe: 'Europe line' };
// lines as octilinear polylines; stations reference points on them
const LINES = {
  build: [[600, 150], [600, 300], [640, 340], [640, 600], [700, 660], [770, 660], [770, 745]],
  store: [[300, 610], [440, 610], [520, 530], [840, 530], [920, 530], [980, 590], [1100, 590]],
  europe: [[1170, 250], [1040, 250], [960, 330], [960, 430], [1100, 570], [1100, 590]],
  cust: [[180, 440], [320, 440], [320, 480], [560, 720], [770, 720], [990, 720]],
};
// stations: [x, y, name, line(s), kind: 'st' | 'ix' (interchange)]
const ST = {
  ideas: [600, 185, 'Ideas', ['build']], decide: [600, 275, 'Decide', ['build']], build: [640, 530, 'Private beta', ['build', 'store'], 'ix'], release: [700, 660, 'Release', ['build']], feedback: [770, 720, 'Feedback', ['build', 'cust'], 'ix'],
  token: [300, 610, 'Railway token', ['store']], dispatcher: [520, 530, 'Dispatcher', ['store']], submission: [840, 530, 'Store submission', ['store']], launch: [1100, 590, 'Launches', ['store', 'europe'], 'ix'],
  dpa: [1170, 250, 'DPA signature', ['europe']], eures: [960, 400, 'EU residency', ['europe']],
  lead: [180, 440, 'Lead', ['cust']], customer: [320, 440, 'Customer', ['cust']], resolution: [900, 720, 'Resolution', ['cust']], knowledge: [990, 720, 'Knowledge', ['cust']],
};
const LBL = { ideas: [14, 5, 'start'], decide: [14, 5, 'start'], build: [-22, 34, 'end'], release: [-14, 5, 'end'], feedback: [0, 32, 'middle'], token: [0, 34, 'middle'], dispatcher: [0, -18, 'middle'], submission: [0, -18, 'middle'], launch: [22, 5, 'start'], dpa: [0, -18, 'middle'], eures: [14, 5, 'start'], lead: [0, -18, 'middle'], customer: [0, -18, 'middle'], resolution: [0, 26, 'middle'], knowledge: [14, 5, 'start'] };

function defs(id) { return haloFilter(id + '-b', 8) + haloFilter(id + '-b2', 3) + `<pattern id="${id}-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="8" style="fill:var(--coral)"/></pattern><radialGradient id="${id}-gl"><stop offset="0" style="stop-color:var(--glow);stop-opacity:.5"/><stop offset="1" style="stop-color:var(--glow);stop-opacity:0"/></radialGradient>`; }
const svgWrap = (id, inner, o = {}) => `<svg class="world" viewBox="0 0 ${o.w || W} ${o.h || H}" aria-hidden="true"><defs>${defs(id)}</defs>${inner}</svg>`;
const pl = (pts) => 'M' + pts.map((p) => `${p[0]} ${p[1]}`).join('L');
function districts(o = {}) {
  let s = ''; for (const [k, [x, y, rx, ry]] of Object.entries(DIST)) { const op = o.dim && !o.dim.includes(k) ? 0.4 : 1;
    s += `<path d="${smooth(blobPts(x, y, rx, ry, x + y, 16, 0.08))}" style="fill:color-mix(in srgb,${hue(k)} ${o.tint ? o.tint(k) : 9}%,transparent);stroke:color-mix(in srgb,${hue(k)} 30%,transparent);stroke-width:1;opacity:${op}"/>`; }
  return s;
}
function districtLabels(o = {}) {
  const POS = { lead: [300, 180], prod: [652, 122], design: [880, 128], comp: [1180, 175], sales: [130, 380], ops: [300, 680], eng: [800, 380], mkt: [1180, 650], support: [690, 800], fin: [1240, 820], people: [300, 808] };
  let s = ''; for (const [k, [x, y]] of Object.entries(POS)) { const d = DOM[k], hu = hue(k); const op = o.dim && !o.dim.includes(k) ? 0.35 : 0.85;
    s += `<g opacity="${op}"><circle cx="${x}" cy="${y}" r="11" style="fill:var(--g3)"/>${ring(x, y, 11, d.done, hu, { w: 2 })}${G(d.lm, x, y, 13, `color-mix(in srgb,${hu} 70%,var(--fg))`)}${T(x + 18, y + 4.5, d.name.toUpperCase(), { size: 11.5, anchor: 'start', font: 'u', w: 700, ls: '.08em', fill: `color-mix(in srgb,${hu} 55%,var(--fg))` })}</g>`; }
  return s;
}
function line(k, o = {}) { const d = pl(o.pts || LINES[k]); const w = o.w || 10; return `<path d="${d}" style="fill:none;stroke:var(--ground-base);stroke-width:${w + 6};stroke-linejoin:round;stroke-linecap:round;opacity:${o.op ?? 1}"/><path d="${d}" style="fill:none;stroke:${o.col || LC[k]};stroke-width:${w};stroke-linejoin:round;stroke-linecap:round;opacity:${o.op ?? 1}${o.dash ? ';stroke-dasharray:' + o.dash : ''}"/>`; }
function station(k, o = {}) {
  const [x, y, nm, ls, kind] = ST[k]; const op = o.op ?? 1; const big = o.big;
  let s = `<g${op !== 1 ? ` opacity="${op}"` : ''}>`;
  if (kind === 'ix') { const rr = big ? 17 : 12; s += `<circle cx="${x}" cy="${y}" r="${rr}" style="fill:var(--ground-base);stroke:var(--fg);stroke-width:3.5"/><circle cx="${x}" cy="${y}" r="${rr - 5}" style="fill:var(--fg)"/>`; }
  else s += `<circle cx="${x}" cy="${y}" r="7.5" style="fill:var(--ground-base);stroke:${LC[ls[0]]};stroke-width:4"/>`;
  if (o.label !== false) { const [dx, dy, an] = LBL[k] || [14, 5, 'start']; s += T(x + dx, y + dy, o.name || nm, { size: big ? 20 : 14, font: big ? 'd' : 'u', w: 600, anchor: an, halo: 'var(--ground-base)', hw: 4 }); }
  return s + '</g>';
}
// trains along a polyline at fractions t
function trains(k, ts, o = {}) {
  const pts = o.pts || LINES[k]; const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; }
  const at = (t) => { let d = t * tot; for (let i = 1; i < pts.length; i++) { if (d <= L[i - 1]) { const f = d / L[i - 1]; return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f), Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) * 57.3]; } d -= L[i - 1]; } const a = pts[pts.length - 1]; return [a[0], a[1], 0]; };
  return ts.map((t) => { const [x, y, a] = at(t); return `<rect x="-9" y="-4" width="18" height="8" rx="4" transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(a)})" style="fill:${o.fill || '#fff'};stroke:${o.col || LC[k]};stroke-width:1.6"/>`; }).join('');
}
function lineBadges(o = {}) {
  const B = { build: [600, 128], store: [240, 610], europe: [1240, 250], cust: [120, 440] };
  let s = ''; for (const [k, [x, y]] of Object.entries(B)) { const op = o.dim && !o.dim.includes(k) ? 0.35 : 1; const w = 16 + LN[k].length * 7.2; s += `<g opacity="${op}"><rect x="${r1(x - w / 2)}" y="${y - 12}" width="${r1(w)}" height="24" rx="12" style="fill:${LC[k]}"/>${T(x, y + 4.5, LN[k], { size: 12.5, font: 'u', w: 700, fill: 'var(--ink-dark)' })}</g>`; }
  return s;
}
function network(o = {}) {
  let s = districts(o);
  for (const k of Object.keys(LINES)) s += line(k, { op: o.lineOp ? o.lineOp(k) : 1, w: o.lineW ? o.lineW(k) : 10 });
  if (o.overLines) s += o.overLines();
  for (const k of Object.keys(ST)) s += station(k, { big: k === (o.focus ?? 'build'), op: o.stOp ? o.stOp(k) : 1, label: o.labels ? o.labels(k) : true });
  s += districtLabels(o) + (o.badges === false ? '' : lineBadges(o));
  return s;
}

// ---------- stills ----------
const CH = { crumb: ['Company'], right: [{ i: 'eye', t: 'Owner' }, { i: 'layers', t: 'Service maps' }] };
const LCH = (name, icon, finding) => ({ crumb: ['Company'], right: [{ i: 'eye', t: 'Owner' }, { i: icon, t: name, on: true }], finding: { icon, title: name, pos: 'tl', ...finding } });

function companyStill() {
  const id = 'l1';
  let s = network({ overLines: () => trains('build', [0.2, 0.45, 0.5, 0.78]) + trains('store', [0.08, 0.12, 0.16, 0.2, 0.66]) + trains('cust', [0.3, 0.62, 0.66, 0.7, 0.9]) + trains('europe', [0.55])
    + `<path d="${pl([[520, 530], [640, 530]])}" style="fill:none;stroke:url(#${id}-hatch);stroke-width:10"/>` });
  s += `<circle cx="640" cy="530" r="60" style="fill:url(#${id}-gl)"/>`;
  s += barrier(1105, 250, 0.8);
  s += flag(870, 512, 'Store go/no-go', { needs: 1 }) + flag(420, 260, 'Europe first', { needs: 1 }) + avatar(668, 500, 'N', 'var(--acc)') + avatar(692, 500, '✦', 'var(--ai)') + avatar(1200, 290, 'D', 'var(--f-rules)');
  return svgWrap(id, s) + chrome(CH);
}
// cost: each line as wide as its spend; the AI share is a teal core inside the line
function costStill() {
  const id = 'l2'; const SP = { build: 1.0, store: 0.55, cust: 0.7, europe: 0.3 }, AI = { build: 0.55, store: 0.3, cust: 0.8, europe: 0.15 };
  let s = network({ tint: (k) => Math.round(4 + 22 * DOM[k].spend), lineW: (k) => r1(6 + 22 * SP[k]), overLines: () => Object.keys(LINES).map((k) => `<path d="${pl(LINES[k])}" style="fill:none;stroke:var(--ai);stroke-width:${r1((6 + 22 * SP[k]) * AI[k] * 0.7)};stroke-linejoin:round;stroke-linecap:round;opacity:.9"/>`).join(''), focus: null });
  return svgWrap(id, s) + chrome(LCH('Cost', 'coins', { text: 'Each line is as wide as what it costs to run; the teal core is the AI share. The Build line is the widest; the Customer line is mostly teal.', legend: keyRow([[sw('background:var(--f-sky);height:10px', 'line'), 'line spend'], [sw('background:var(--ai)', 'line'), 'AI share']]) }));
}
// progress: lines solid as far as travelled, hollow beyond; the forecast tick
function progressStill() {
  const id = 'l3'; const PRG = { build: 0.62, store: 0.35, cust: 0.7, europe: 0.2 }, FC = { build: 0.72, store: 0.45, cust: 0.78, europe: 0.28 };
  const cut = (pts, f) => { const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; } let d = f * tot; const out = [pts[0]]; for (let i = 1; i < pts.length; i++) { if (d <= L[i - 1]) { const t = d / L[i - 1]; out.push([lerp(pts[i - 1][0], pts[i][0], t), lerp(pts[i - 1][1], pts[i][1], t)]); return out; } d -= L[i - 1]; out.push(pts[i]); } return out; };
  let s = districts();
  for (const k of Object.keys(LINES)) { s += `<path d="${pl(LINES[k])}" style="fill:none;stroke:${LC[k]};stroke-width:10;stroke-linejoin:round;stroke-linecap:round;opacity:.22"/>`; s += line(k, { pts: cut(LINES[k], PRG[k]), w: 10 }); const f = cut(LINES[k], FC[k]).pop(), n = cut(LINES[k], PRG[k]).pop(); s += `<circle cx="${r1(n[0])}" cy="${r1(n[1])}" r="9" style="fill:#fff;stroke:${LC[k]};stroke-width:3"/><circle cx="${r1(f[0])}" cy="${r1(f[1])}" r="5" style="fill:none;stroke:var(--fg);stroke-width:1.6;stroke-dasharray:2 2"/>`; }
  for (const k of Object.keys(ST)) s += station(k, { op: 0.75, label: ['build', 'launch', 'dpa', 'feedback', 'submission'].includes(k) });
  s += districtLabels() + lineBadges();
  return svgWrap(id, s) + chrome(LCH('Progress', 'sunrise', { text: 'Each line is solid as far as its work has travelled and faint beyond; the dotted ring is where the forecast puts it on the goal date. The Europe line has barely left its first station.', legend: keyRow([[sw('background:var(--f-sky)', 'line'), 'travelled'], [sw('background:color-mix(in srgb,var(--f-sky) 25%,transparent)', 'line'), 'to go'], [sw('border:1.5px dashed var(--fg);background:transparent'), 'forecast']]) }));
}
// issues: disruptions. Crowding where issues pile up, a signal failure (amber), a closed station (coral)
function issuesStill() {
  const id = 'l4';
  let s = network({ lineOp: (k) => (k === 'cust' ? 1 : 0.4), stOp: (k) => (['feedback', 'release', 'dpa', 'resolution', 'knowledge', 'customer', 'lead'].includes(k) ? 1 : 0.4), focus: null, labels: (k) => ['feedback', 'release', 'dpa', 'resolution'].includes(k), overLines: () => trains('cust', [0.55, 0.58, 0.61, 0.64, 0.67, 0.7, 0.73, 0.76]) });
  s += `<circle cx="700" cy="660" r="24" style="fill:var(--amber);opacity:.45" filter="url(#${id}-b)"/><circle cx="700" cy="660" r="9" style="fill:var(--amber);stroke:var(--ground-base);stroke-width:2"/>` + T(686, 694, 'Signal failure: integration suite', { size: 13.5, font: 'u', w: 600, anchor: 'end', halo: 'var(--ground-base)' });
  s += `<circle cx="1170" cy="250" r="26" style="fill:var(--coral);opacity:.4" filter="url(#${id}-b)"/>` + barrier(1170, 250, 1) + T(1170, 292, 'Station closed: DPA late', { size: 13.5, font: 'u', w: 600, halo: 'var(--ground-base)' });
  s += T(660, 760, 'Crowded, within service levels', { size: 13, font: 'u', w: 500, fill: 'var(--muted)', halo: 'var(--ground-base)' });
  return svgWrap(id, s) + chrome(LCH('Issues', 'triangle-alert', { text: 'Issues are disruptions on the lines: the Customer line is crowded with them around Feedback but running within its service levels; the Build line has a signal failure at Release (amber); the DPA station is closed (coral).', legend: keyRow([[sw('background:#fff;border:1.5px solid var(--f-lime)', 'sq'), 'issues in transit'], [sw('background:var(--amber)'), 'failing'], [sw('background:var(--coral)'), 'breached']]) }));
}
// dependencies: connections. Transfer walks between lines, the critical route bold, the blocked transfer
function depsStill() {
  const id = 'l5';
  const CR = ['token', 'dispatcher', 'build', 'submission', 'launch', 'dpa', 'eures'];
  let s = network({ lineOp: () => 0.35, stOp: (k) => (CR.includes(k) ? 0 : 0.35), labels: (k) => !CR.includes(k), focus: null });
  const crit = [[300, 610], [440, 610], [520, 530], [840, 530], [920, 530], [980, 590], [1100, 590]];
  s += `<path d="${pl(crit)}" style="fill:none;stroke:var(--glow);stroke-width:26;opacity:.18;stroke-linejoin:round;stroke-linecap:round"/>` + line('store', { w: 12 });
  // transfers: dotted walks where one line's station waits on another's
  const walk = (a, b) => `<path d="M${a[0]} ${a[1]}Q${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 - 40} ${b[0]} ${b[1]}" style="fill:none;stroke:var(--fg);stroke-width:2;stroke-dasharray:1 6;stroke-linecap:round"/>`;
  s += walk([600, 275], [520, 530]) + walk([960, 400], [840, 530]) + walk([770, 720], [840, 530]);
  s += barrier(370, 590, 0.9) + barrier(1105, 250, 0.8);
  for (const k of ['token', 'dispatcher', 'build', 'submission', 'launch', 'dpa', 'eures']) s += station(k, { big: false });
  return svgWrap(id, s) + chrome(LCH('Dependencies', 'route', { text: 'Connections: the dotted walks are dependencies between lines (a decision feeds the dispatcher; EU residency and feedback feed the submission). The bold route is the critical path to the launches; it is held at the token and at the DPA.', legend: keyRow([[sw('background:var(--f-violet)', 'line'), 'critical route'], [sw('background:repeating-linear-gradient(90deg,var(--fg) 0 2px,transparent 2px 6px)', 'line'), 'transfer (depends on)'], [sw('background:var(--coral)', 'sq'), 'held']]) }));
}
// time (Lines' own): the timetable. The same lines laid on a time axis; delays push stations right of their plan
function timeStill() {
  const id = 'l6'; const X0 = 220, X1 = 1300, x = (wk) => X0 + (X1 - X0) * (wk / 10); const today = 3;
  let s = '';
  for (let w = 0; w <= 10; w++) s += `<line x1="${r1(x(w))}" y1="150" x2="${r1(x(w))}" y2="760" style="stroke:var(--fg);stroke-width:1;opacity:${w === today ? 0 : 0.07}"/>`;
  s += `<line x1="${r1(x(today))}" y1="140" x2="${r1(x(today))}" y2="770" style="stroke:var(--acc);stroke-width:2"/>` + T(x(today), 130, 'Today', { size: 13, font: 'u', w: 700, fill: 'var(--acc)' });
  const rows = { store: [250, [['Railway token', 2.4, 2.9, 1], ['Dispatcher', 3.4, 4.2, 1], ['Store submission', 5, 6, 1], ['Beta launch', 6, 7, 1]]], build: [380, [['Decide', 1, 1], ['Private beta', 4, 4.4], ['Release', 6, 6.4], ['Feedback', 7.5, 7.9]]], europe: [510, [['DPA signature', 2.6, 3.6, 1], ['EU residency', 5.5, 6.4], ['Europe launch', 8, 9.2, 1]]], cust: [640, [['Customer', 0.5, 0.5], ['Resolution', 3.6, 3.6], ['Knowledge', 5, 5]]] };
  for (const [k, [y, sts]] of Object.entries(rows)) { const last = sts[sts.length - 1]; s += `<path d="M${r1(x(0))} ${y}H${r1(x(last[2]))}" style="fill:none;stroke:${LC[k]};stroke-width:10;stroke-linecap:round"/>`;
    const w = 16 + LN[k].length * 7.2; s += `<rect x="${r1(x(0) - w - 14)}" y="${y - 12}" width="${r1(w)}" height="24" rx="12" style="fill:${LC[k]}"/>` + T(x(0) - 14 - w / 2, y + 4.5, LN[k], { size: 12.5, font: 'u', w: 700, fill: 'var(--ink-dark)' });
    sts.forEach(([nm, plan, now, late], i) => { if (late && now !== plan) s += `<circle cx="${r1(x(plan))}" cy="${y}" r="7" style="fill:none;stroke:var(--fg);stroke-width:1.4;stroke-dasharray:2 2;opacity:.7"/><path d="M${r1(x(plan) + 9)} ${y - 16}H${r1(x(now) - 9)}" style="stroke:var(--fg);stroke-width:1.4;opacity:.7"/><path d="M${r1(x(now) - 14)} ${y - 20}l5 4 -5 4" style="fill:none;stroke:var(--fg);stroke-width:1.4;opacity:.7"/>`;
      s += `<circle cx="${r1(x(now))}" cy="${y}" r="8" style="fill:var(--ground-base);stroke:${LC[k]};stroke-width:4"/>` + T(x(now), y + (i % 2 ? -22 : 30), nm, { size: 13.5, font: 'u', w: 600, halo: 'var(--ground-base)' }); }); }
  return svgWrap(id, s) + chrome(LCH('Time', 'calendar-range', { pos: 'bl', text: 'The same lines laid on a timetable: each station sits on its forecast date, with a ghost where it was planned. The Store line has slipped by the token chore; the Europe launch has slipped by the DPA.', legend: keyRow([[sw('background:var(--acc)', 'line'), 'today'], [sw('border:1.5px dashed var(--fg);background:transparent'), 'planned'], [sw('background:var(--ground-base);border:3px solid var(--f-violet)'), 'forecast']]) })).replace('class="finding bl"', 'class="finding"');
}
// the problem picture: a service disruption on the Store line, trains waiting, a replacement bus
function problemStill() {
  const id = 'l7';
  let s = network({ dim: ['ops', 'eng', 'mkt', 'comp'], lineOp: (k) => (k === 'store' || k === 'europe' ? 1 : 0.2), stOp: (k) => (['token', 'dispatcher', 'build', 'submission', 'launch', 'dpa', 'eures'].includes(k) ? 1 : 0.2), focus: null, labels: (k) => ['token', 'dispatcher', 'submission', 'launch', 'dpa'].includes(k), badges: true,
    overLines: () => `<path d="${pl([[520, 530], [840, 530]])}" style="fill:none;stroke:url(#${id}-hatch);stroke-width:12"/>` + trains('store', [0.05, 0.1, 0.15, 0.2, 0.25, 0.3], { fill: '#fff' }) });
  // replacement bus: the manual workaround, a dotted road above the disrupted segment
  s += `<path d="M520 520 C560 420 800 420 840 520" style="fill:none;stroke:var(--fg);stroke-width:2.4;stroke-dasharray:2 6;stroke-linecap:round"/><g transform="translate(680 440)"><rect x="-17" y="-14" width="34" height="28" rx="8" style="fill:var(--g3);stroke:var(--fg);stroke-width:1.2"/>${G('bus', 0, 0, 18, 'var(--fg)')}</g>` + T(680, 412, 'Replacement bus: deploy by hand', { size: 13.5, font: 'u', w: 600, halo: 'var(--ground-base)' });
  s += `<circle cx="680" cy="530" r="20" style="fill:var(--coral);opacity:.35" filter="url(#${id}-b)"/><circle cx="680" cy="530" r="12" style="fill:var(--ground-base);stroke:var(--coral);stroke-width:3"/>` + G('envelope', 680, 530, 13, 'var(--fg)');
  s += T(680, 575, 'No service: Dispatcher to Store submission', { size: 17, halo: 'var(--ground-base)', hw: 5 }) + T(680, 597, 'waiting on the Railway token since Oct 26', { size: 13, font: 'u', w: 500, fill: 'var(--muted)', halo: 'var(--ground-base)' });
  s += `<circle cx="1170" cy="250" r="24" style="fill:var(--coral);opacity:.35" filter="url(#${id}-b)"/>` + barrier(1170, 250, 1) + G('clock', 1128, 590, 18, 'var(--fg)');
  return svgWrap(id, s) + chrome({ crumb: ['Company'], right: [{ i: 'eye', t: 'Owner' }, { i: 'search', t: 'What is stuck?', on: true }], finding: { icon: 'train-front', pos: 'tl', title: 'No service on the Store line', text: 'Six trains wait behind Dispatcher: the Railway token chore has stopped the line to the store submission, and a replacement bus (a manual deploy) is the workaround. The Europe line is closed at the DPA, so both reach Launches late.' } });
}

// ---- Engineering (Z1): the lines through the district, programs are its stations ----
function domainStill() {
  const id = 'l8'; let s = `<path d="${smooth(blobPts(720, 470, 640, 360, 9, 20, 0.05))}" style="fill:color-mix(in srgb,var(--h-build) 8%,transparent);stroke:color-mix(in srgb,var(--h-build) 35%,transparent)"/>`;
  s += `<path d="${smooth(blobPts(1340, 110, 200, 140, 4, 16, 0.08))}" style="fill:color-mix(in srgb,var(--h-govern) 10%,transparent)"/><path d="${smooth(blobPts(60, 800, 200, 140, 5, 16, 0.08))}" style="fill:color-mix(in srgb,var(--h-run) 10%,transparent)"/><path d="${smooth(blobPts(1400, 760, 200, 140, 6, 16, 0.08))}" style="fill:color-mix(in srgb,var(--h-market) 10%,transparent)"/>`;
  const L = { store: [[-20, 700], [180, 700], [380, 500], [1000, 500], [1180, 680], [1460, 680]], build: [[520, -20], [520, 220], [600, 300], [600, 860]], europe: [[1460, 120], [1180, 120], [1060, 240], [1060, 600], [1180, 720]], infra: [[180, 320], [420, 320], [500, 400], [880, 400]] };
  const C = { store: LC.store, build: LC.build, europe: LC.europe, infra: 'var(--f-slate)' };
  for (const [k, pts] of Object.entries(L)) s += `<path d="${pl(pts)}" style="fill:none;stroke:var(--ground-base);stroke-width:20;stroke-linejoin:round;stroke-linecap:round"/><path d="${pl(pts)}" style="fill:none;stroke:${C[k]};stroke-width:14;stroke-linejoin:round;stroke-linecap:round"/>`;
  s += `<path d="${pl([[380, 500], [600, 500]])}" style="fill:none;stroke:url(#${id}-hatch);stroke-width:14"/>`;
  s += trains('store', [0.04, 0.08, 0.12, 0.16], { pts: L.store }) + trains('build', [0.2, 0.7], { pts: L.build }) + trains('infra', [0.5], { pts: L.infra, col: 'var(--f-slate)' });
  // program stations: roundels with landmark and ring
  const PS = { beta: [600, 500, 46], ios: [860, 500, 32], eu: [1060, 420, 30], evals: [600, 720, 28], platform: [720, 400, 28] };
  s += `<circle cx="600" cy="500" r="110" style="fill:url(#${id}-gl)"/>`;
  for (const [k, [x, y, r]] of Object.entries(PS)) { const e = ENG[k]; const big = k === 'beta'; s += `<circle cx="${x}" cy="${y}" r="${r}" style="fill:var(--ground-base);stroke:var(--fg);stroke-width:${big ? 5 : 4}"/>` + ring(x, y, r - 8, e.done, 'var(--h-build)', { w: big ? 4 : 3, forecast: e.fc }) + G(e.lm, x, y, r * 0.9, 'var(--fg)', { sw: 1.8 });
    const lp = { beta: [56, -40, 'start'], ios: [0, 58, 'middle'], eu: [44, 8, 'start'], evals: [44, 8, 'start'], platform: [0, -44, 'middle'] }[k]; s += T(x + lp[0], y + lp[1], e.name, { size: big ? 22 : 16, anchor: lp[2], halo: 'var(--ground-base)', hw: 5 }); }
  s += `<circle cx="180" cy="700" r="10" style="fill:var(--ground-base);stroke:${LC.store};stroke-width:4"/>` + barrier(250, 690, 0.9) + T(180, 740, 'Railway token', { size: 14, font: 'u', w: 600, halo: 'var(--ground-base)' });
  s += flag(870, 470, 'Store go/no-go', { needs: 1 }) + avatar(560, 430, 'N', 'var(--acc)') + avatar(584, 430, '✦', 'var(--ai)');
  // destinations at the frame edge (continuity)
  s += T(1380, 660, 'to Marketing', { size: 13, font: 'u', w: 600, fill: 'var(--muted)', anchor: 'end' }) + T(1380, 100, 'to Compliance', { size: 13, font: 'u', w: 600, fill: 'var(--muted)', anchor: 'end' }) + T(110, 760, 'from Operations', { size: 13, font: 'u', w: 600, fill: 'var(--muted)', anchor: 'start' });
  s += G('skyline', 92, 128, 44, 'color-mix(in srgb,var(--h-build) 70%,var(--fg))', { sw: 1.6, op: 0.75 });
  return svgWrap(id, s) + chrome({ crumb: ['Company', 'Engineering'], right: [{ i: 'eye', t: 'CTO' }, { i: 'layers', t: 'Service maps' }] });
}

// ---- the Private beta station (Z2): tracks fan out from the throat into four platforms (streams) and converge to the exit ----
function programStill() {
  const id = 'l9'; let s = '';
  const PR = { dispatcher: 0.42, relay: 0.72, evals: 0.82, store: 0.36 }; const Y = { dispatcher: 230, relay: 380, evals: 530, store: 680 };
  const IN = [120, 455], OUT = [1250, 455];
  const track = (y) => `M${IN[0]} ${IN[1]}C${IN[0] + 170} ${IN[1]} ${IN[0] + 170} ${y} ${IN[0] + 300} ${y}H${OUT[0] - 300}C${OUT[0] - 170} ${y} ${OUT[0] - 170} ${OUT[1]} ${OUT[0]} ${OUT[1]}`;
  // the station hall: a soft rounded hull around the platforms
  s += `<path d="${smooth(blobPts(690, 455, 520, 300, 3, 20, 0.05))}" style="fill:color-mix(in srgb,var(--h-build) 7%,transparent);stroke:color-mix(in srgb,var(--h-build) 35%,transparent);stroke-width:1.4"/>`;
  // platforms (islands) lit by the stream's progress, with rounded ends
  for (const [k, y] of Object.entries(Y)) s += `<rect x="440" y="${y - 74}" width="520" height="56" rx="28" style="fill:color-mix(in srgb,var(--glow) ${Math.round(6 + 18 * PR[k])}%,transparent);stroke:color-mix(in srgb,var(--glow) 30%,transparent)"/>`;
  for (const [k, y] of Object.entries(Y)) s += `<path d="${track(y)}" style="fill:none;stroke:var(--ground-base);stroke-width:14"/><path d="${track(y)}" style="fill:none;stroke:var(--f-violet);stroke-width:8;opacity:${k === 'dispatcher' || k === 'store' ? 1 : 0.55}"/>`;
  s += `<path d="M${OUT[0]} ${OUT[1]}H1330" style="fill:none;stroke:var(--f-violet);stroke-width:9"/><path d="M40 ${IN[1]}H${IN[0]}" style="fill:none;stroke:var(--f-violet);stroke-width:9"/>`;
  for (const [k, y] of Object.entries(Y)) s += `<g><circle cx="${410}" cy="${y - 46}" r="14" style="fill:var(--g3)"/>${ring(410, y - 46, 14, PR[k], 'var(--h-build)', { w: 2.2 })}${G(STREAMS[k].lm, 410, y - 46, 15, 'var(--fg)')}${T(410, y - 70, STREAMS[k].name, { size: 15, halo: 'var(--ground-base)' })}</g>`;
  // shopfronts standing on the platforms: the products
  const sm = (x, y, kind, o = {}) => { const w = 92, h = 60, top = y - 46 - h / 2 - 2; let g = facade(kind, x, top, w, h, { ghost: o.ghost }); if (o.crit != null) g += `<circle cx="${x + w}" cy="${top}" r="8" style="fill:var(--ground-base)"/>` + ring(x + w, top, 6.5, o.crit, o.crit === 1 ? 'var(--good)' : 'var(--glow)', { w: 2.4 }); if (o.sel) g += `<rect x="${x - 4}" y="${top - 4}" width="${w + 8}" height="${h + 8}" rx="10" style="fill:none;stroke:var(--acc);stroke-width:2.2"/>`; if (o.landmark) g = `<circle cx="${x + w / 2}" cy="${top + h / 2}" r="64" style="fill:url(#${id}-gl)"/>` + g; return g; };
  s += sm(480, 230, 'chart', { crit: 0.66, sel: true }) + sm(600, 230, 'term', { crit: 1 });
  s += sm(520, 380, 'screens', { crit: 0.83 }) + sm(660, 380, 'screens', { ghost: true });
  s += sm(470, 530, 'doc', { crit: 1, landmark: true }) + sm(590, 530, 'doc', { crit: 0.5 }) + sm(720, 530, 'chart', { ghost: true });
  s += sm(560, 680, 'build', { crit: 0.8 }) + sm(700, 680, 'listing', { ghost: true });
  // trains: items in motion; at the dispatcher, a stopped train with the token at the signal, others queued behind
  s += trains('x', [0.6, 0.74], { pts: [[420, 380], [990, 380]], col: 'var(--f-violet)' }) + trains('x', [0.8], { pts: [[420, 530], [990, 530]], col: 'var(--f-violet)' }) + trains('x', [0.86], { pts: [[420, 680], [990, 680]], col: 'var(--f-violet)' });
  s += `<circle cx="830" cy="230" r="9" style="fill:var(--coral)"/><line x1="830" y1="239" x2="830" y2="260" style="stroke:var(--fg);stroke-width:2"/>` + `<g transform="translate(790 230)"><rect x="-22" y="-11" width="44" height="22" rx="11" style="fill:var(--g3);stroke:var(--coral);stroke-width:2"/>${G('envelope', 0, 0, 14, 'var(--fg)')}</g>` + trains('x', [0.42, 0.5, 0.58], { pts: [[420, 230], [990, 230]], col: 'var(--f-violet)' });
  s += `<g><circle cx="1360" cy="455" r="34" style="fill:var(--ground-base);stroke:var(--fg);stroke-width:4"/>${ring(1360, 455, 26, 0.58, 'var(--h-build)', { w: 3, forecast: 0.66 })}${G('gate', 1360, 455, 22, 'var(--fg)')}${T(1360, 516, 'Gate 1 Alpha', { size: 17, halo: 'var(--ground-base)' })}</g>`;
  s += T(104, 425, 'from Operations', { size: 13, font: 'u', w: 600, fill: 'var(--muted)', anchor: 'start' });
  s += `<g><rect x="900" y="110" width="300" height="56" rx="14" style="fill:var(--g3);stroke:color-mix(in srgb,#fff 25%,transparent)"/>${T(914, 133, 'Dispatcher sequencing under load', { size: 14.5, anchor: 'start' })}${T(914, 153, '4 of 6 criteria met · Noa · doing since Oct 26', { size: 12.5, anchor: 'start', font: 'u', w: 500, fill: 'var(--muted)' })}</g><path d="M900 140 L578 158" style="stroke:var(--fg);opacity:.4"/>`;
  const mini = `<svg viewBox="0 0 150 96"><path d="M10 70H60L80 50H140M70 10V90" style="fill:none;stroke:var(--glow);stroke-width:4;opacity:.5"/><circle cx="70" cy="50" r="7" style="fill:none;stroke:var(--acc);stroke-width:2.4"/></svg>`;
  return svgWrap(id, s) + chrome({ crumb: ['Engineering', 'Private beta', 'Wave 71'], right: [{ i: 'layout-grid', t: 'As a board' }], mini });
}

// ---- phone: the Store line as a strip map ----
function phoneStill() {
  const id = 'lp'; let s = '';
  const X = 92, st = [['Railway token', 180, 'ops'], ['Dispatcher', 280, 'eng'], ['Private beta', 360, 'eng'], ['Store submission', 450, 'eng'], ['Launches', 540, 'mkt']];
  s += `<path d="M${X} 150V560" style="fill:none;stroke:var(--f-violet);stroke-width:12;stroke-linecap:round"/><path d="M${X} 280V450" style="fill:none;stroke:url(#${id}-hatch);stroke-width:12"/>`;
  s += `<path d="M${X + 4} 290 C${X + 70} 320 ${X + 70} 420 ${X + 4} 440" style="fill:none;stroke:var(--fg);stroke-width:2;stroke-dasharray:2 6"/>` + `<g transform="translate(${X + 62} 365)"><rect x="-14" y="-12" width="28" height="24" rx="7" style="fill:var(--g3);stroke:var(--fg)"/>${G('bus', 0, 0, 15, 'var(--fg)')}</g>`;
  for (const [nm, y, d] of st) { s += `<circle cx="${X}" cy="${y}" r="${nm === 'Private beta' || nm === 'Launches' ? 12 : 8}" style="fill:var(--ground-base);stroke:${nm === 'Private beta' || nm === 'Launches' ? 'var(--fg)' : 'var(--f-violet)'};stroke-width:4"/>` + T(X + 100, y + 5, nm, { size: nm === 'Dispatcher' ? 17 : 14.5, font: nm === 'Dispatcher' ? 'd' : 'u', w: 600, anchor: 'start', halo: 'var(--ground-base)' }); }
  for (let i = 0; i < 4; i++) s += `<rect x="${X - 4}" y="${196 + i * 18}" width="8" height="14" rx="4" style="fill:#fff;stroke:var(--f-violet);stroke-width:1.6"/>`;
  s += `<rect x="${X - 52}" y="120" width="104" height="24" rx="12" style="fill:var(--f-violet)"/>` + T(X, 136, 'Store line', { size: 12.5, font: 'u', w: 700, fill: 'var(--ink-dark)' });
  const card = `<div class="pcard" data-needs="1"><div class="pc-h"><svg viewBox="0 0 24 24" width="22" height="22">${G('flag', 12, 12, 22, 'var(--f-rules)')}</svg><b>Store go/no-go</b></div><p>No service from Dispatcher to the store submission; the beta slips a week unless the Railway token lands today.</p><div class="pills"><span class="chip on">Open the fork</span><span class="chip">Later</span></div></div>`;
  return `<div class="status" data-ambient><span>9:41</span><span>●●●</span></div>` + svgWrap(id, s, { w: PW, h: PH }) + chrome({ crumb: ['Company', 'Store line'], right: [{ i: 'layers', t: 'Lines' }], talk: false }) + card;
}

export function stills() {
  return [
    { id: 'company', sky: true, glance: true, title: 'Company depth: the network', html: companyStill(), caption: 'Four processes are four lines through eleven faint districts; stations are milestones, interchanges are where programs meet (Private beta, Feedback, Launches); trains are items in motion, crowded on the Customer line and bunched behind Dispatcher. The hatched segment is the stuck store step; the DPA station is barred. The district names carry their landmark and ring, but the eye goes to the lines: the variant is about flow.' },
    { id: 'domain', title: 'Domain depth: the lines through Engineering', html: domainStill(), caption: 'Inside the Engineering district the lines are larger and the programs are their stations, with landmark and ring: Private beta (the interchange of the Store and Build lines), iOS 1.0, Platform, Evals, and EU residency on the Europe line. Lines leave the frame with their destinations (to Marketing, to Compliance, from Operations), so the zoom keeps its continuity.' },
    { id: 'program', title: 'Program depth: inside the Private beta station', html: programStill(), caption: 'Entering the station: four platforms are the four streams, lit by progress; above each, its shopfronts are the products (built with criteria rings, unbuilt as ghosts); trains are items moving along. At the Dispatcher platform a train with the token is stopped at the buffer; the Store track leaves through the portal to Gate 1 Alpha.' },
    { id: 'cost', glance: true, title: 'Service map: cost', html: costStill(), caption: 'Each line drawn as wide as what it costs to run, with the AI share as a teal core; districts tinted by their spend.' },
    { id: 'progress', glance: true, title: 'Service map: progress', html: progressStill(), caption: 'Lines solid as far as their work has travelled, faint beyond; a train marks where each line is now and a dotted ring where the forecast puts it.' },
    { id: 'issues', glance: true, title: 'Service map: disruptions (issues)', html: issuesStill(), caption: 'Issues as service status: crowding on the Customer line within service levels, a signal failure at Release (amber), a closed station at the DPA (coral).' },
    { id: 'deps', glance: true, title: 'Service map: connections (dependencies)', html: depsStill(), caption: 'Dependencies between lines are transfer walks; the critical route to the launches is the bold Store line, held at the token and the DPA.' },
    { id: 'time', glance: true, title: 'Service map: timetable (Lines\' own: time)', html: timeStill(), caption: 'The same lines morph onto a time axis: stations on their forecast dates, ghosts where they were planned, arrows for the slip. The timeline layer of docs/03 §3.11 falls out of this variant for free.' },
    { id: 'problem', glance: true, title: 'The problem picture: no service on the Store line', html: problemStill(), caption: 'A service disruption between Dispatcher and the store submission, six trains waiting behind it, a replacement bus (the manual deploy) as the workaround; the Europe line closed at the DPA; both lines reach Launches late.' },
    { id: 'company', phone: true, glance: true, title: 'Phone: a strip map', html: phoneStill(), caption: 'Transit maps survive a phone as a strip map: one line, top to bottom, with its disruption and the workaround; swipe for the next line.' },
  ];
}
