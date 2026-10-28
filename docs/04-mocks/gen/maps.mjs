import { I, AI, g, st, av, agav, pav, btn, ib, chip, kbd, treemap, superellipse, inset, rounded, centroid, blob, curve, SVGDEFS, at, pct } from './lib.mjs';

// ---------- company layout (Z0), computed once, stable ----------
export const W0 = 1028, H0 = 650;
export const DOMAINS = [
  { k: 'lead', n: 'Leadership', he: 'הנהלה', x: 120, y: 119, t: 7 },
  { k: 'prod', n: 'Product', he: 'מוצר', x: 360, y: 119, t: 22 },
  { k: 'comp', n: 'Compliance', he: 'רגולציה', x: 640, y: 130, t: 18 },
  { k: 'fin', n: 'Finance', he: 'כספים', x: 900, y: 119, t: 8 },
  { k: 'eng', n: 'Engineering', he: 'הנדסה', x: 300, y: 390, t: 48 },
  { k: 'mkt', n: 'Marketing', he: 'שיווק', x: 740, y: 401, t: 26 },
  { k: 'des', n: 'Design', he: 'עיצוב', x: 90, y: 542, t: 12 },
  { k: 'ppl', n: 'People', he: 'אנשים', x: 520, y: 574, t: 6 },
  { k: 'ops', n: 'Operations', he: 'תפעול', x: 920, y: 563, t: 10 },
];
const B0 = superellipse(W0 / 2, H0 / 2 + 4, 500, 308, 3.4, 44, 0.05, 7);
const sites0 = DOMAINS.map((d) => ({ ...d }));
const cells0 = treemap(sites0, B0, 220);
export const Z0 = DOMAINS.map((d, i) => ({ ...d, poly: inset(cells0[i], 5), c: centroid(cells0[i]) }));
export const z0 = (k) => Z0.find((d) => d.k === k);

export function terrain(W, H, inner, cls = '') {
  return `<svg class="terrain ${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${SVGDEFS}${inner}</svg>`;
}
export const cellPath = (poly, cls = 'cell', r = 26) => { const d = rounded(poly, r); return `<path class="${cls}" d="${d}"/><path class="cellhi" d="${d}"/><path class="cedge" d="${d}"/>`; };
export const heat = (x, y, r, o) => `<circle class="heat" cx="${x}" cy="${y}" r="${r}" fill="url(#heatGrad)" style="fill:url(#heatGrad);opacity:${o}"/>`;

// roll-up line: done share · doing · blocked · decisions · moved today
export function ru(o, he = false) {
  const L = he ? { d: 'הושלם', g: 'בעבודה', b: 'חסומים', f: 'החלטות', m: 'זזו היום' } : { d: 'done', g: 'doing', b: 'blocked', f: 'decisions waiting', m: 'moved today' };
  const parts = [];
  parts.push(`<span class="num" role="img" aria-label="${o.done}% ${L.d}" title="${o.done}% ${L.d}">${o.done}%</span>`);
  if (o.doing != null) parts.push(`<span class="flex num" style="gap:2px" title="${o.doing} ${L.g}">${st('doing')}${o.doing}</span>`);
  if (o.blocked) parts.push(`<span class="flex num" style="gap:2px" title="${o.blocked} ${L.b}">${st('blocked')}${o.blocked}</span>`);
  if (o.dec) parts.push(`<span class="flex num" style="gap:2px" title="${o.dec} ${L.f}"><span class="sg rules">${I('flag')}</span>${o.dec}</span>`);
  if (o.moved) parts.push(`<span class="flex num" style="gap:2px" title="${o.moved} ${L.m}"><span class="sg" style="color:var(--f-heat)">${I('activity')}</span>${o.moved}</span>`);
  return `<span class="ru">${parts.join('<i class="sep"></i>')}</span>`;
}
export const regLabel = (name, o, cls = '', he = false, aria = '') => `<div class="reglabel ${cls}" role="button" tabindex="0" aria-label="${aria || name}"><span class="nm">${name}</span>${o ? ru(o, he) : ''}</div>`;
export const cluster = (parts, aria) => `<span class="cl" role="button" tabindex="0" aria-label="${aria}">${parts.map(([s, n]) => `<span title="${n} ${s}">${st(s)}${n}</span>`).join('')}</span>`;
export const flag = (label, big = false, aria = '') => `<span class="flag${big ? ' big' : ''}" role="button" tabindex="0" aria-label="${aria || 'Decision waiting: ' + label}">${g('decision', { solid: big })}<span>${label}</span></span>`;
export const weatherChip = (label) => `<span class="weather" role="button" tabindex="0" aria-label="Risk: ${label}">${g('risk', { size: 'sm' })}<span>${label}</span></span>`;

export function goals(sel = -1, he = false) {
  const G = he ? [] : [
    ['Private beta · 200 users in 3 markets by week 24', 58, 'Forecast wk 25', 'hold', 'At risk'],
    ['Gate 1 Alpha accepted', 81, 'Forecast Nov 14', 'good', 'On track'],
    ['Europe launch ready (EU residency + consent)', 34, 'Forecast wk 30', 'good', 'On track'],
  ];
  return `<div class="goals" role="list" aria-label="Goals horizon">${G.map(([n, d, f, c, w], i) => `<div class="goal${i === sel ? ' sel' : ''}" role="listitem" tabindex="0" aria-label="Goal: ${n}, ${d}% done, ${f}, ${w}">${g('goal', { size: 'lg' })}<div class="tx"><b>${n}</b><small><span class="bar" style="width:70px"><i style="width:${d}%"></i></span><span class="num">${d}%</span><span class="sg ${c}">${I(c === 'good' ? 'trending-up' : 'trending-down')}</span>${f} · ${w}</small></div></div>`).join('')}</div>`;
}
export function mapTools(o = {}) {
  const he = o.he;
  return `<div class="mtools" style="inset-inline-end:14px;top:14px">${ib('plus', he ? 'התקרבות' : 'Zoom in')}${ib('minus', he ? 'התרחקות' : 'Zoom out')}${ib('locate-fixed', he ? 'מרכז לנקודת המבט שלי' : 'Recentre on my perspective')}${ib('list-tree', he ? 'תצוגת רשימה' : 'List equivalent (tree)')}</div>
<div style="position:absolute;inset-inline-start:14px;top:14px;display:flex;gap:6px;align-items:center">${chip('layers', (he ? 'שכבות' : 'Layers') + ' · ' + (o.layers || '4'), '', 'Layers menu, closed, ' + (o.layers || '4') + ' on')}${chip('scan', o.zoom || 'Z0 Company', 'ghost', 'Zoom level')}${o.lchips || ''}</div>`;
}
export function legend(pos = 'inset-inline-start:14px;bottom:14px', he = false) {
  const L = he ? ['פעילות (זזו היום)', 'נוכחות', 'החלטה ממתינה', 'חסום', 'סיכון', 'מועד', 'אשכול לפי מצב', 'תוכנית חוצה תחומים'] : ['Heat · moved today', 'Presence', 'Decision waiting', 'Blocked', 'Risk (weather)', 'Due soon', 'Cluster by state', 'Program across domains'];
  return `<div class="legend" style="${pos}" role="list" aria-label="${he ? 'מקרא' : 'Legend'}">
<span role="listitem"><span class="sg" style="color:var(--f-heat)">${I('activity')}</span>${L[0]}</span>
<span role="listitem"><span class="av xs r-doing" style="font-size:8px">N</span>${L[1]}</span>
<span role="listitem">${g('decision', { size: 'sm' })}${L[2]}</span>
<span role="listitem">${st('blocked')}${L[3]}</span>
<span role="listitem">${g('risk', { size: 'sm' })}${L[4]}</span>
<span role="listitem"><span class="sg mut">${I('clock')}</span>${L[5]}</span>
<span role="listitem">${st('doing')}${L[6]}</span>
<span role="listitem"><span style="width:16px;height:10px;border-radius:6px;background:color-mix(in srgb,var(--f-lime) 20%,transparent);box-shadow:inset 0 0 0 1.5px var(--f-lime)"></span>${L[7]}</span>
</div>`;
}

const RU0 = {
  lead: { done: 40, doing: 3, dec: 1, moved: 2 }, prod: { done: 52, doing: 7, blocked: 1, dec: 2, moved: 6 }, comp: { done: 31, doing: 4, blocked: 3, dec: 2, moved: 3 },
  fin: { done: 60, doing: 2, moved: 1 }, eng: { done: 62, doing: 14, blocked: 6, dec: 1, moved: 23 }, mkt: { done: 38, doing: 8, blocked: 2, dec: 1, moved: 7 },
  des: { done: 70, doing: 4, moved: 5 }, ppl: { done: 50, doing: 1, moved: 0 }, ops: { done: 44, doing: 3, blocked: 1, moved: 2 },
};
const HEAT0 = { eng: [1, 160], prod: [.55, 110], mkt: [.5, 120], des: [.4, 80], comp: [.35, 90], ops: [.18, 70], fin: [.12, 60], lead: [.15, 60], ppl: [.05, 50] };

export function z0Scene(o = {}) {
  const W = W0, H = H0;
  let svg = Z0.map((d) => cellPath(d.poly, o.dimExcept && !o.dimExcept.includes(d.k) ? 'cell dim' : 'cell')).join('');
  svg += Z0.map((d) => { const [a, r] = HEAT0[d.k]; return heat(d.c[0], d.c[1] + 10, r, a * (o.dimExcept && !o.dimExcept.includes(d.k) ? .3 : 1)); }).join('');
  // a risk front over Compliance
  const cp = z0('comp').c;
  svg += `<g><path class="frontedge" d="${blob([[cp[0] + 10, cp[1] - 60], [cp[0] + 110, cp[1] - 40], [cp[0] + 120, cp[1] + 20], [cp[0] + 40, cp[1] + 30], [cp[0] - 20, cp[1] - 10]])}"/><path class="front" d="${blob([[cp[0] + 10, cp[1] - 60], [cp[0] + 110, cp[1] - 40], [cp[0] + 120, cp[1] + 20], [cp[0] + 40, cp[1] + 30], [cp[0] - 20, cp[1] - 10]])}"/></g>`;
  if (o.extraSvg) svg += o.extraSvg;
  let ov = '';
  Z0.forEach((d) => {
    const dim = o.dimExcept && !o.dimExcept.includes(d.k);
    ov += at(d.c[0], d.c[1] - 6, W, H, regLabel(o.he ? d.he : d.n, RU0[d.k], (d.t < 9 ? 'sm' : '') + (dim ? ' dim' : ''), o.he, `${d.n}: ${RU0[d.k].done}% done, ${RU0[d.k].doing} doing${RU0[d.k].blocked ? ', ' + RU0[d.k].blocked + ' blocked' : ''}${RU0[d.k].dec ? ', ' + RU0[d.k].dec + ' decisions waiting' : ''}`));
  });
  const P = (k, dx, dy, html) => { const c = z0(k).c; return at(c[0] + dx, c[1] + dy, W, H, html); };
  if (!o.noPresence) {
    ov += P('eng', 0, 48, `<span class="presence">${pav('N', 'sm r-doing')}${agav('Coordinator (Fable) · wave 71 merge', 'sm r-doing')}${agav('Worker B · wave 71 · integration suite', 'sm r-doing')}${agav('Worker C · wave 71 · stuck on a credential', 'sm r-stuck')}</span>`);
    ov += P('comp', -40, 44, `<span class="presence">${pav('D', 'sm r-wait')}</span>`);
    ov += P('mkt', 0, 44, `<span class="presence">${pav('O', 'sm r-doing')}${agav('Follow-up agent', 'sm r-doing')}</span>`);
    ov += P('lead', 0, 40, `<span class="presence">${pav('Y', 'sm r-doing')}${agav('Briefing agent', 'sm')}</span>`);
  }
  if (!o.noFlags) {
    ov += P('lead', 10, -52, flag(o.he ? 'אירופה קודם?' : 'Europe first?', true, 'Material decision waiting for Yossi: Europe first?'));
    ov += P('eng', 90, -70, flag(o.he ? 'הגשה לחנות: כן/לא' : 'Store submission go / no-go', true, 'Material decision waiting for Yossi: store submission go or no-go'));
    ov += P('comp', 72, -34, weatherChip(o.he ? 'חתימת DPA מתעכבת' : 'DPA signature late'));
  }
  if (!o.noEmbassy) {
    // embassies: externals sit at the company's border (docs/03 border metaphor), with their engagement state
    const emb = (label, state, cls, aria) => `<div role="button" tabindex="0" aria-label="${aria}" style="display:flex;flex-direction:column;align-items:center;gap:2px"><span class="g" style="--h:var(--f-slate);background:var(--g3);width:26px;height:26px;box-shadow:inset 0 0 0 1.5px var(--f-slate),0 4px 12px var(--shadow)">${I('landmark')}</span><span class="chip sm" style="padding:1px 7px;background:var(--g3)"><span class="sg ${cls}" style="width:12px;height:12px">${I(cls === 'hold' ? 'hourglass' : 'circle-dot')}</span>${label}</span><span class="xs mut nowrap" style="background:var(--g2);border-radius:999px;padding:0 6px">${state}</span></div>`;
    svg += `<path d="${'M'+(W-12)+','+(H*0.46)+' l-40,0'}" style="stroke:var(--f-slate);stroke-width:2;stroke-dasharray:3 3"/>`;
    ov += at(W - 72, H * 0.46 + 12, W, H, emb(o.he ? 'משרד רו"ח' : 'Accounting firm', o.he ? 'פעיל · משכורות' : 'engaged · payroll', 'acc', 'External at the border: accounting firm, engaged on Finance, payroll, 1 chore due'));
    ov += at(W * 0.62, H - 34, W, H, emb(o.he ? 'ייעוץ משפטי' : 'Legal counsel', o.he ? 'ממתין לתשובה' : 'virtual · awaiting reply on DPA', 'hold', 'External at the border: legal counsel, reached by email, awaiting a reply on the DPA'));
  }
  if (o.extraOv) ov += o.extraOv;
  return { svg: terrain(W, H, svg), ov };
}
export const mapBox = (scene, h, tools, extraStyle = '') => `<div class="mapc zoomph" style="width:100%;height:${h}px;${extraStyle}" role="application" aria-label="Company map. Arrow keys move between cells, Enter zooms in, Escape zooms out, L layers, P perspective.">${scene.svg}<div class="ov">${scene.ov}${tools || ''}</div></div>`;
