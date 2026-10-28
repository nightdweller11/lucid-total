// The world: the company as terrain. Places are laid out once (a power-diagram treemap inside an organic coast, then
// smoothed so borders read as terrain, not cells) and pinned; sub-places are faint inner contours so zooming reveals.
import { superellipse, treemap, centroid, polyArea, organic, organic2, pole, bbox, rng, blob, r1 } from './geo.mjs';
import { place, at } from './lib.mjs';

export const PL = {
  eng: { name: 'Engineering', he: 'הנדסה', lm: 'skyline', hue: 'sky', prog: 0.58, fc: 0.86, subj: 'Builds and runs Lucid Chat and Lucid Total' },
  prd: { name: 'Product', he: 'מוצר', lm: 'workshop', hue: 'rules', prog: 0.44, fc: 0.8, subj: 'Decides what Lucid Chat becomes next' },
  dsg: { name: 'Design', he: 'עיצוב', lm: 'loom', hue: 'warm', prog: 0.7, fc: 0.95, subj: 'Shapes how Lucid looks, reads and feels' },
  mkt: { name: 'Marketing', he: 'שיווק', lm: 'harbour', hue: 'violet', prog: 0.38, fc: 0.74, subj: 'Brings people to Lucid in every market' },
  sal: { name: 'Partnerships', he: 'שותפויות', lm: 'bridge', hue: 'drift', prog: 0.25, fc: 0.6, subj: 'Partners, resellers and the first paying teams' },
  sup: { name: 'Support', he: 'תמיכה', lm: 'beacon', hue: 'warm', prog: 0.52, fc: 0.9, subj: 'Answers testers and turns their issues into work' },
  cmp: { name: 'Compliance', he: 'רגולציה', lm: 'lighthouse', hue: 'slate', prog: 0.31, fc: 0.62, subj: 'Keeps Lucid lawful in every market it enters' },
  fin: { name: 'Finance', he: 'כספים', lm: 'vault', hue: 'rules', prog: 0.6, fc: 0.92, subj: 'Runway, spend and the books' },
  ppl: { name: 'People', he: 'אנשים', lm: 'greenhouse', hue: 'violet', prog: 0.5, fc: 0.9, subj: 'Hiring, care and time off' },
  ops: { name: 'Operations', he: 'תפעול', lm: 'gears', hue: 'drift', prog: 0.44, fc: 0.85, subj: 'Vendors, accounts and the machinery of the company' },
  ldr: { name: 'Leadership', he: 'הנהלה', lm: 'summit', hue: 'sky', prog: 0.4, fc: 0.8, subj: 'Direction, goals and the decisions that define the company' },
  sys: { name: 'System', he: 'מערכת', lm: 'tower', hue: 'ai', prog: 0.9, fc: 1, subj: 'Lucid Total itself: its subsystems, health and cost' },
  // Engineering's programs
  beta: { name: 'Private beta', he: 'בטא פרטית', lm: 'rocket', hue: 'sky', prog: 0.58, fc: 0.82, subj: '200 users in three markets on Lucid Chat' },
  ios: { name: 'iOS 1.0', he: 'iOS 1.0', lm: 'stall', hue: 'warm', prog: 0.46, fc: 0.8, subj: 'Lucid Chat in the App Store' },
  eu: { name: 'EU residency', he: 'שהות נתונים באירופה', lm: 'keep', hue: 'lime', prog: 0.3, fc: 0.66, subj: 'European data stays in Europe' },
  evals: { name: 'Evals', he: 'הערכות', lm: 'flask', hue: 'violet', prog: 0.64, fc: 0.9, subj: 'The Mediator is measured before it ships' },
  plat: { name: 'Platform', he: 'פלטפורמה', lm: 'gears', hue: 'drift', prog: 0.72, fc: 0.95, subj: 'Railway, Postgres and the build chain' },
  // Private beta's streams
  disp: { name: 'Dispatcher', lm: 'gears', hue: 'sky', prog: 0.55, fc: 0.8, subj: 'Ordered, idempotent delivery' },
  relay: { name: 'Relay', lm: 'bridge', hue: 'violet', prog: 0.62, fc: 0.9, subj: 'Approve-first conveyance' },
  evst: { name: 'Evals', lm: 'flask', hue: 'drift', prog: 0.7, fc: 0.95, subj: 'Prompt v12 measured in six languages' },
  store: { name: 'Store', lm: 'stall', hue: 'warm', prog: 0.4, fc: 0.7, subj: 'TestFlight and the store listing' },
  // Marketing's campaigns (CMO perspective)
  mEU: { name: 'Europe waitlist', lm: 'harbour', hue: 'violet', prog: 0.42, fc: 0.8, subj: 'Sign-ups in Germany, France and Spain' },
};
// scale a polygon to fit a box (keeps aspect)
export function fitPoly(poly, x, y, w, h) { const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]); const x0 = Math.min(...xs), y0 = Math.min(...ys), sw = Math.max(...xs) - x0, sh = Math.max(...ys) - y0; const s = Math.min(w / sw, h / sh); const ox = x + (w - sw * s) / 2, oy = y + (h - sh * s) / 2; return poly.map(([a, b]) => [ox + (a - x0) * s, oy + (b - y0) * s]); }
export const place0 = (k) => ({ k, ...PL[k] });

export function layout(spec) {
  const { W, H } = spec; const c = spec.coast;
  const coastPoly = spec.boundary || superellipse(c.cx, c.cy, c.rx, c.ry, c.n || 3.2, 72, c.wob ?? 0.05, c.seed || 11);
  const sites = spec.places.map((p) => ({ k: p.k, x: p.x, y: p.y, t: p.t }));
  const cells = treemap(sites, coastPoly, 220, true);
  const out = {};
  spec.places.forEach((p, i) => {
    const poly = cells[i]; const po = pole(poly, 6);
    const subs = [];
    if (p.subs && p.subs.length > 1) {
      const r = rng(i * 31 + 7); const [x0, y0, x1, y1] = bbox(poly); const cc = centroid(poly);
      const ss = p.subs.map((t, j) => { const a = (j / p.subs.length) * Math.PI * 2 + r(); const rr = Math.min(x1 - x0, y1 - y0) * 0.22; return { x: cc[0] + Math.cos(a) * rr, y: cc[1] + Math.sin(a) * rr, t }; });
      const sc = treemap(ss, poly, 80, false);
      sc.forEach((sp, j) => { if (sp.length > 2) subs.push(organic2(sp, { inset: 12, r: 22, step: 18, amp: 1.4, seed: i * 7 + j })); });
    }
    out[p.k] = { ...PL[p.k], k: p.k, poly, path: organic2(poly, { inset: p.inset ?? 4, r: p.r ?? 30, seed: i + 3, amp: 1.8 }), pole: p.anchor || po.at, room: po.r, subs };
  });
  if (spec.islands) spec.islands.forEach((is, i) => {
    const poly = superellipse(is.x, is.y, is.rx, is.ry, 2.4, 40, 0.08, 40 + i);
    const subs = (is.subs || []).map((sp, j) => blob(superellipse(sp[0], sp[1], sp[2], sp[3], 2.2, 18, 0.1, 60 + j), 0.9));
    out[is.k] = { ...PL[is.k], k: is.k, poly, path: organic(poly, { inset: 0, seed: 70 + i, amp: 1.6 }), pole: [is.x, is.y], room: Math.min(is.rx, is.ry), subs, island: true };
  });
  return { W, H, coast: spec.boundary ? organic2(coastPoly, { r: 40, amp: 2, seed: 9 }) : organic(coastPoly, { inset: 0, it: 3, step: 30, amp: 4, seed: 5 }), coastPoly, places: out };
}

const hueVar = (h) => (h === 'ai' ? 'var(--ai)' : `var(--f-${h})`);
// terrain: coast, places (base, hue wash, light), sub-place contours, heat, fronts; plus extra svg (roads, hulls, ghosts)
export function terrain(L, o = {}) {
  const id = o.id || 'w'; const fade = new Set(o.fade || []); const amb = new Set(o.ambient || []);
  let defs = `<filter id="${id}fe" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${o.feather || 10}"/></filter><filter id="feather" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>`;
  defs += `<radialGradient id="${id}heat"><stop offset="0" style="stop-color:var(--f-heat)" stop-opacity=".42"/><stop offset=".55" style="stop-color:var(--f-heat)" stop-opacity=".14"/><stop offset="1" style="stop-color:var(--f-heat)" stop-opacity="0"/></radialGradient>`;
  defs += `<pattern id="${id}hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><line x1="0" y1="0" x2="0" y2="10" style="stroke:var(--f-sharp)" stroke-opacity=".55" stroke-width="2.2"/></pattern>`;
  let body = `<path class="shore" d="${L.coast}"/><path class="coast" d="${L.coast}"/>`;
  for (const [k, p] of Object.entries(L.places)) {
    if (o.only && !o.only.includes(k)) continue;
    const [cx, cy] = p.pole; const rr = Math.max(70, p.room * 1.5);
    defs += `<radialGradient id="${id}wa-${k}" gradientUnits="userSpaceOnUse" cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(rr)}"><stop offset="0" style="stop-color:${hueVar(p.hue)}" stop-opacity=".2"/><stop offset=".6" style="stop-color:${hueVar(p.hue)}" stop-opacity=".05"/><stop offset="1" style="stop-color:${hueVar(p.hue)}" stop-opacity="0"/></radialGradient>`;
    defs += `<radialGradient id="${id}li-${k}" gradientUnits="userSpaceOnUse" cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(rr * 0.9)}"><stop offset="0" stop-color="#fff" stop-opacity="${r1(p.prog * 0.16 * 100) / 100}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
    const cls = fade.has(k) ? ' class="faded"' : amb.has(k) ? ' class="ambient"' : '';
    body += `<g${cls}><path class="plc${o.focus === k ? ' focus' : ''}" d="${p.path}" style="--h:${hueVar(p.hue)}"><title>${p.name}: ${p.subj}</title></path><path class="wash" d="${p.path}" fill="url(#${id}wa-${k})"/><path class="light" d="${p.path}" style="--prog:${p.prog}"/>${o.noSubs ? '' : p.subs.map((s) => `<path class="sub" d="${s}"/>`).join('')}</g>`;
  }
  for (const h of o.heat || []) { const [x, y] = h.at; const r = h.r || 150; body += `<g class="heatg"><circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id}heat)"/><circle class="heatring" cx="${x}" cy="${y}" r="${r * 0.42}"/><circle class="heatring" cx="${x}" cy="${y}" r="${r * 0.62}" stroke-opacity=".1"/></g>`; }
  (o.fronts || []).forEach((f, i) => {
    const pts = superellipse(f.at[0], f.at[1], f.rx, f.ry, 2, 14, 0.35, 90 + i);
    const d = blob(pts, 1);
    defs += `<mask id="${id}fm${i}"><path d="${d}" fill="#fff" filter="url(#${id}fe)"/></mask>`;
    body += `<g mask="url(#${id}fm${i})"><rect x="${f.at[0] - f.rx * 1.5}" y="${f.at[1] - f.ry * 1.5}" width="${f.rx * 3}" height="${f.ry * 3}" style="fill:color-mix(in srgb,var(--f-sharp) 16%,transparent)"/><rect x="${f.at[0] - f.rx * 1.5}" y="${f.at[1] - f.ry * 1.5}" width="${f.rx * 3}" height="${f.ry * 3}" fill="url(#${id}hatch)"/></g>`;
  });
  body += o.extra || '';
  return `<svg class="terrain" viewBox="0 0 ${L.W} ${L.H}" preserveAspectRatio="none" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
}
// the world: terrain + overlay of places (landmark, ring, name) and anything else positioned in world px
export function world(L, o = {}) {
  const pos = (x, y, html, e = {}) => at(x, y, html, { pctW: L.W, pctH: L.H, ...e });
  let ov = '';
  for (const [k, p] of Object.entries(L.places)) {
    if (o.only && !o.only.includes(k)) continue; if ((o.hideMarkers || []).includes(k)) continue;
    const sz = (o.sizes && o.sizes[k]) || 'm'; const [x, y] = (o.anchors && o.anchors[k]) || p.pole;
    const cls = (o.fade || []).includes(k) ? 'faded' : (o.ambient || []).includes(k) ? 'ambient' : '';
    ov += pos(x, y, place(p, { size: sz, cls: cls + (o.smallNames ? ' s' : ''), noName: (o.noNames || []).includes(k), he: o.he }), { cls: 'pm' });
  }
  ov += (o.over || []).map(([x, y, html, e]) => pos(x, y, html, e || {})).join('');
  return `<div class="world" style="${o.style || `inset-inline-start:0;top:0;width:${L.W}px;height:${L.H}px`}">${terrain(L, o)}<div class="ov">${ov}</div></div>`;
}
