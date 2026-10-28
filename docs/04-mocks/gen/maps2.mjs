import { I, AI, g, st, av, agav, pav, btn, ib, chip, kbd, id, treemap, superellipse, inset, rounded, centroid, blob, curve, clip, polyArea, SVGDEFS, at, pct, pri, due, conf } from './lib.mjs';
import { terrain, cellPath, heat, regLabel, cluster, flag, weatherChip, mapTools, legend, ru } from './maps.mjs';

export const W1 = 1028, H1 = 690;
const clipRect = (p, W, H) => [[1, 0, W], [-1, 0, 0], [0, 1, H], [0, -1, 0]].reduce((q, [a, b, c]) => clip(q, a, b, c), p);
function hullOf(pts) { // monotone chain convex hull
  const P = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = []; for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  const up = []; for (const p of P.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
export function softHull(anchors) { // anchors: [x,y,r]
  const pts = []; anchors.forEach(([x, y, r]) => { for (let i = 0; i < 36; i++) { const t = i / 36 * Math.PI * 2; pts.push([x + r * Math.cos(t), y + r * Math.sin(t)]); } });
  const h = hullOf(pts); return 'M' + h.map((p) => p.map((v) => Math.round(v * 10) / 10).join(',')).join('L') + 'Z';
}
const spark = (vals) => { const w = 34, h = 12; const mx = Math.max(...vals); const pts = vals.map((v, i) => `${(i / (vals.length - 1) * w).toFixed(1)},${(h - v / mx * h).toFixed(1)}`).join(' '); return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true" style="overflow:visible"><polyline points="${pts}" fill="none" stroke="var(--good)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`; };
export function grpLabel(o, he = false) {
  const lead = o.lead ? (o.lead.length === 1 ? pav(o.lead, 'xs') : agav(o.lead, 'xs')) : '';
  return `<div class="reglabel sm" role="button" tabindex="0" aria-label="${o.n}: ${o.done}% done${o.due ? ', due ' + o.due : ''}"><span class="nm" style="font-size:12.5px;display:flex;gap:5px;align-items:center">${o.kind ? g(o.kind, { size: 'sm' }) : ''}${o.n}</span><span class="ru">${spark(o.sp || [10, 18, 25, 33, 41, o.done])}<span class="num">${o.done}%</span>${o.due ? `<i class="sep"></i>${due(o.due, o.over)}<span class="num">${o.due}</span>` : ''}${lead ? '<i class="sep"></i>' + lead : ''}</span></div>`;
}

// ---- generic Z1: a centred domain with groupings, neighbours cut off at the frame ----
export function z1Layout(cfg) {
  const W = cfg.W || W1, H = cfg.H || H1;
  const B = superellipse(W / 2, H / 2, cfg.rx || 660, cfg.ry || 490, 3, 48, 0.04, 3);
  const sites = [cfg.center, ...cfg.neigh].map((s) => ({ ...s }));
  const cells = treemap(sites, B, 200, true);
  const center = inset(cells[0], 6);
  const gs = cfg.groups.map((s) => ({ ...s }));
  const gcells = treemap(gs, inset(center, 10), 160, false).map((p) => inset(p, 4));
  return { W, H, center, neigh: cfg.neigh.map((n, i) => ({ ...n, poly: inset(cells[i + 1], 6), vis: centroid(clipRect(inset(cells[i + 1], 6), W, H)) })), groups: cfg.groups.map((gq, i) => ({ ...gq, poly: gcells[i], c: centroid(gcells[i]) })) };
}
export const ENG = z1Layout({
  center: { n: 'Engineering', x: 470, y: 356, t: 40 },
  neigh: [
    { k: 'prod', n: 'Product', he: 'מוצר', x: 200, y: -69, t: 10 }, { k: 'comp', n: 'Compliance', he: 'רגולציה', x: 900, y: -46, t: 11 },
    { k: 'mkt', n: 'Marketing', he: 'שיווק', x: 1120, y: 437, t: 12 }, { k: 'ops', n: 'Operations', he: 'תפעול', x: 820, y: 782, t: 9 },
    { k: 'des', n: 'Design', he: 'עיצוב', x: -90, y: 437, t: 10 }, { k: 'ppl', n: 'People', he: 'אנשים', x: 260, y: 805, t: 8 },
  ],
  groups: [
    { k: 'pbc', n: 'Private beta · client', he: 'בטא פרטית · לקוח', x: 300, y: 288, t: 18, done: 64, due: 'Nov 28', due_he: '28.11', lead: 'N', kind: 'goal', cl: [['doing', 5], ['review', 3], ['blocked', 2], ['waiting', 1]], sp: [20, 31, 40, 48, 55, 64] },
    { k: 'pbs', n: 'Private beta · server', he: 'בטא פרטית · שרת', x: 470, y: 230, t: 15, done: 71, due: 'Nov 21', due_he: '21.11', lead: 'Coordinator (Fable)', cl: [['doing', 3], ['review', 2], ['blocked', 1]] },
    { k: 'ios', n: 'iOS release 1.0', he: 'גרסת iOS 1.0', x: 260, y: 494, t: 12, done: 55, due: 'Nov 21', due_he: '21.11', lead: 'N', kind: 'milestone', cl: [['doing', 2], ['waiting', 2]] },
    { k: 'g1', n: 'Gate 1 Alpha', he: 'שער 1 אלפא', x: 470, y: 540, t: 9, done: 81, due: 'Nov 14', due_he: '14.11', lead: 'Y', kind: 'milestone', cl: [['review', 4], ['blocked', 1]] },
    { k: 'ai', n: 'AI evals · L489', he: 'הערכות AI · L489', x: 640, y: 494, t: 9, done: 47, lead: 'Worker B · wave 62', cl: [['doing', 3], ['review', 2]] },
    { k: 'inf', n: 'Platform & infra', he: 'פלטפורמה ותשתית', x: 140, y: 379, t: 8, done: 66, lead: 'N', cl: [['doing', 1], ['blocked', 1]] },
    { k: 'eu', n: 'EU data residency', he: 'שהיית נתונים באירופה', x: 690, y: 253, t: 8, done: 22, due: 'Dec 19', due_he: '19.12', lead: 'N', cl: [['doing', 1], ['waiting', 2]] },
  ],
});
export const MKT = z1Layout({
  center: { n: 'Marketing', x: 560, y: 345, t: 40 },
  neigh: [
    { k: 'eng', n: 'Engineering', x: -90, y: 379, t: 12 }, { k: 'comp', n: 'Compliance', x: 200, y: -69, t: 11 }, { k: 'prod', n: 'Product', x: 640, y: -103, t: 8 },
    { k: 'fin', n: 'Finance', x: 1000, y: -46, t: 9 }, { k: 'ops', n: 'Operations', x: 1120, y: 644, t: 9 }, { k: 'ppl', n: 'People', x: 480, y: 805, t: 8 },
  ],
  groups: [
    { k: 'eu', n: 'Europe launch campaign', x: 300, y: 218, t: 11, done: 18, due: 'Jan 12', lead: 'O', kind: 'goal', cl: [['doing', 2], ['blocked', 1], ['waiting', 2]] },
    { k: 'wl', n: 'Beta waitlist & invites', x: 520, y: 230, t: 14, done: 61, due: 'Dec 8', lead: 'O', cl: [['doing', 3], ['review', 1]] },
    { k: 'store', n: 'App Store listing', x: 330, y: 483, t: 9, done: 40, due: 'Nov 21', lead: 'O', kind: 'milestone', cl: [['doing', 2], ['waiting', 1]] },
    { k: 'vid', n: 'Launch video & content', x: 560, y: 494, t: 11, done: 35, due: 'Dec 1', lead: 'Follow-up agent', cl: [['doing', 2], ['proposed', 3]] },
    { k: 'press', n: 'Press & partners', x: 760, y: 322, t: 8, done: 20, lead: 'Y', cl: [['proposed', 4], ['doing', 1]] },
    { k: 'brand', n: 'Brand kit rollout', x: 760, y: 529, t: 6, done: 82, lead: 'O', cl: [['review', 2]] },
    { k: 'paid', n: 'Paid search · US', x: 900, y: 414, t: 6, done: 50, lead: 'O', cl: [['doing', 1]] },
  ],
});
export const gof = (L, k) => L.groups.find((x) => x.k === k);
export const nof = (L, k) => L.neigh.find((x) => x.k === k);

export function z1Scene(L, o = {}) {
  const { W, H } = L; const he = o.he;
  let svg = L.neigh.map((n) => cellPath(n.poly, 'cell dim', 30)).join('');
  svg += cellPath(L.center, 'cell me', 34);
  svg += L.groups.map((q) => cellPath(q.poly, (o.dimExcept && !o.dimExcept.includes(q.k)) ? 'cell dim' : 'cell sub', 18)).join('');
  (o.heat || []).forEach(([k, a, r]) => { const q = gof(L, k); svg += heat(q.c[0], q.c[1], r, a); });
  if (o.svgBefore) svg += o.svgBefore;
  if (o.hull) svg += `<path class="hull" d="${o.hull}"/>`;
  if (o.svgAfter) svg += o.svgAfter;
  let ov = '';
  L.neigh.forEach((n) => { ov += at(n.vis[0], n.vis[1], W, H, regLabel(he ? n.he : n.n, null, 'sm dim', he)); });
  L.groups.forEach((q) => {
    if (o.skipLabels && o.skipLabels.includes(q.k)) return;
    const lab = grpLabel({ ...q, n: he ? q.he : q.n, due: he ? q.due_he : q.due }, he);
    ov += at(q.c[0], q.c[1] - 14, W, H, `<div class="col" style="align-items:center;gap:5px">${lab}${q.cl ? cluster(q.cl, `${q.n}: ` + q.cl.map(([s, n]) => n + ' ' + s).join(', ')) : ''}</div>`, 'ml', (o.dimExcept && !o.dimExcept.includes(q.k)) ? 'opacity:.5' : '');
  });
  if (o.ov) ov += o.ov;
  return { svg: terrain(W, H, svg), ov };
}
// Europe hull anchors on the Engineering Z1: EU residency + into Compliance + into Marketing
export function euHullEng() {
  const eu = gof(ENG, 'eu').c; const c = nof(ENG, 'comp').vis; const m = nof(ENG, 'mkt').vis;
  return { d: softHull([[eu[0], eu[1], 58], [c[0] - 30, c[1] + 30, 44], [m[0] - 10, m[1] - 70, 44]]), eu, c, m };
}
export function euHullMkt() {
  const eu = gof(MKT, 'eu').c; const e = nof(MKT, 'eng').vis; const c = nof(MKT, 'comp').vis;
  return { d: softHull([[eu[0], eu[1], 62], [e[0] + 20, e[1] - 90, 44], [c[0] + 20, c[1] + 20, 44]]), eu, e, c };
}
