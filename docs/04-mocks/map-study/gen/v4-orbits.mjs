// V4 Orbits: the company as a star system seen through a telescope. Goals are suns; programs are planets orbiting the
// goal they serve (distance = time to delivery, nearer is sooner); a planet's lit phase is its done share; items are
// moons; people are ships; dependencies are tethers; risks are asteroid fields. Layers are spectral filters. Zooming is
// the telescope: from the system to one planet to its surface, where the buildings are stations with their facades.
import { W, H, PW, PH, rng, r1, lerp, clamp, smooth, blobPts, T, ring, G, flag, barrier, avatar, facade, chrome, ramp, keyRow, sw, haloFilter } from './lib.mjs';
import { DOM, hue, ENG, STREAMS } from './company.mjs';

export const meta = {
  n: 4, name: 'Orbits', icon: 'orbit',
  line: 'The company as star systems around its goals.',
  intro: 'Each goal is a sun; programs are planets orbiting the goal they serve, nearer when they deliver sooner, larger when there is more work; a planet\'s lit phase is how much of it is done; items are moons, people are ships, dependencies are tethers, risks are asteroid fields. It is the only variant organised by purpose rather than by department: the domain survives as the planet\'s hue and landmark. Layers are spectral filters; zooming is the telescope, down to a planet\'s surface where the stations are the products.',
};

const TILT = 0.36;
const SUNS = { beta: { x: 560, y: 470, r: 34, name: 'Beta live', orbits: [150, 238, 330, 420], done: 0.58, fc: 0.66 }, europe: { x: 1120, y: 250, r: 26, name: 'Europe', orbits: [110, 175, 240], done: 0.3, fc: 0.36 }, runway: { x: 1150, y: 680, r: 22, name: 'Runway', orbits: [86, 140, 190], done: 0.72, fc: 0.8 } };
// planets: [sun, orbit index, angle deg, radius, domain, name, done, landmark]
const PL = {
  beta: ['beta', 0, 205, 30, 'eng', 'Private beta', 0.58, 'rocket'], design: ['beta', 0, 315, 12, 'design', 'Design system', 0.8, 'loom'],
  store: ['beta', 1, 340, 15, 'eng', 'Store submission', 0.35, 'store'], ios: ['beta', 1, 120, 21, 'eng', 'iOS 1.0', 0.44, 'phone'], onboard: ['beta', 1, 45, 14, 'support', 'Onboarding', 0.6, 'beacon'],
  launch: ['beta', 2, 160, 19, 'mkt', 'Beta launch', 0.3, 'megaphone'], infra: ['beta', 2, 300, 12, 'ops', 'Railway infra', 0.65, 'gears'], spec: ['beta', 3, 70, 15, 'prod', 'Beta spec', 0.75, 'workshop'], evals: ['beta', 3, 250, 14, 'eng', 'Evals', 0.7, 'flask'],
  eu: ['europe', 0, 215, 18, 'eng', 'EU residency', 0.3, 'shield'], dpa: ['europe', 0, 35, 16, 'comp', 'DPA and filings', 0.25, 'contract'], eul: ['europe', 1, 150, 19, 'mkt', 'Europe launch', 0.2, 'harbour'], eup: ['europe', 2, 320, 11, 'sales', 'EU partners', 0.35, 'bridge'],
  bill: ['runway', 0, 200, 14, 'prod', 'Billing', 0.55, 'vault'], cost: ['runway', 0, 20, 11, 'fin', 'Cost control', 0.85, 'coins'], raise: ['runway', 1, 120, 15, 'lead', 'Seed round', 0.4, 'summit'], hire: ['runway', 2, 280, 11, 'people', 'Hiring', 0.5, 'greenhouse'],
};
const pos = (sun, oi, ang, S = SUNS) => { const s = S[sun], R = s.orbits[oi], a = ang * Math.PI / 180; return [s.x + Math.cos(a) * R, s.y + Math.sin(a) * R * TILT]; };
const P = Object.fromEntries(Object.entries(PL).map(([k, p]) => [k, pos(p[0], p[1], p[2])]));

function defs(id) {
  return `<radialGradient id="${id}-sun"><stop offset="0" style="stop-color:#fff"/><stop offset=".35" style="stop-color:var(--glow)"/><stop offset="1" style="stop-color:var(--glow);stop-opacity:0"/></radialGradient>`
    + `<radialGradient id="${id}-gl"><stop offset="0" style="stop-color:var(--glow);stop-opacity:.5"/><stop offset="1" style="stop-color:var(--glow);stop-opacity:0"/></radialGradient>`
    + `<radialGradient id="${id}-sp" cx=".5" cy=".45" r=".75"><stop offset="0" style="stop-color:color-mix(in srgb,var(--space) 70%,var(--terrain2))"/><stop offset="1" style="stop-color:var(--space)"/></radialGradient>`
    + haloFilter(id + '-b', 8) + haloFilter(id + '-b2', 3);
}
function stars(w, h, n, seed) { const R = rng(seed); let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${r1(R() * w)}" cy="${r1(R() * h)}" r="${r1(0.5 + R() * R() * 1.6)}" opacity="${r1(0.25 + R() * 0.6)}"/>`; return `<g style="fill:var(--fg)">${s}</g>`; }
const orbitE = (sx, sy, R, o = {}) => `<ellipse cx="${sx}" cy="${sy}" rx="${R}" ry="${r1(R * TILT)}" style="fill:none;stroke:${o.col || 'var(--fg)'};stroke-width:${o.w || 1};opacity:${o.op ?? 0.22}${o.dash ? ';stroke-dasharray:' + o.dash : ''}"/>`;
function sun(k, id, o = {}) {
  const s = (o.S || SUNS)[k]; const sc = o.sc || 1; let g = `<g${o.op != null ? ` opacity="${o.op}"` : ''}><circle cx="${s.x}" cy="${s.y}" r="${s.r * 2.5 * sc}" style="fill:url(#${id}-sun);opacity:${o.eclipse ? 0.25 : 0.9}"/>`;
  g += `<circle cx="${s.x}" cy="${s.y}" r="${s.r * 0.62 * sc}" style="fill:${o.eclipse ? 'var(--space)' : '#fff'}"/>` + ring(s.x, s.y, s.r * 0.95 * sc, s.done, 'var(--glow)', { w: 3, forecast: s.fc });
  if (o.label !== false) g += T(s.x, s.y - s.r * sc - 14, s.name, { size: o.big ? 22 : 17, halo: 'var(--space)', hw: 5 });
  return g + '</g>';
}
// a planet with its phase (lit share = done) lit from its sun
function planet(cx, cy, r, done, hu, lm, sunXY, o = {}) {
  const a = Math.atan2(sunXY[1] - cy, sunXY[0] - cx) * 180 / Math.PI; const k = 1 - 2 * done; const id = `ph${Math.round(cx)}${Math.round(cy)}`;
  let s = `<g${o.op != null ? ` opacity="${o.op}"` : ''}>`;
  if (o.glow) s += `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r * 2.4)}" style="fill:url(#${o.id}-gl);opacity:${o.glow}"/>`;
  s += `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}" style="fill:color-mix(in srgb,${hu} 22%,var(--space));stroke:color-mix(in srgb,${hu} 60%,transparent);stroke-width:1"/>`;
  // lit part: the half facing the sun plus/minus the terminator ellipse
  const lit = `M0 ${-r}A${r} ${r} 0 0 1 0 ${r}A${r1(Math.abs(k) * r)} ${r} 0 0 ${k > 0 ? 0 : 1} 0 ${-r}Z`;
  s += `<path d="${lit}" transform="translate(${r1(cx)} ${r1(cy)}) rotate(${r1(a)} 0 0) rotate(-90) rotate(90)" style="fill:color-mix(in srgb,${hu} 75%,#fff);opacity:.95"/>`.replace('rotate(-90) rotate(90)', '');
  if (lm && r >= 12) s += G(lm, cx, cy, r * 1.05, done > 0.5 ? 'var(--space)' : 'var(--fg)', { sw: 1.5 });
  return s + '</g>';
}
// the lit path in the planet() above is drawn with the lit half on +x; rotate(a) points it at the sun
function moons(cx, cy, r, n, seed, o = {}) { const R = rng(seed); let s = `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(r * 1.9)}" ry="${r1(r * 1.9 * 0.42)}" style="fill:none;stroke:var(--fg);stroke-width:.6;opacity:.25"/>`; for (let i = 0; i < n; i++) { const a = R() * 6.28; s += `<circle cx="${r1(cx + Math.cos(a) * r * 1.9)}" cy="${r1(cy + Math.sin(a) * r * 1.9 * 0.42)}" r="${r1(1.6 + R() * 1.2)}" style="fill:var(--fg);opacity:.8"/>`; } return s; }
function ship(x, y, ang, col = 'var(--fg)') { return `<path d="M7 0L-5 -5L-2.5 0L-5 5Z" transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(ang)})" style="fill:${col}"/>`; }
function asteroids(cx, cy, rx, ry, n, seed, col = 'var(--fg)', op = 0.55) { const R = rng(seed); let s = ''; for (let i = 0; i < n; i++) { const a = R() * 6.28, d = 0.6 + R() * 0.4; s += `<path d="${smooth(blobPts(cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, 1.5 + R() * 3, 1.2 + R() * 2.4, i + seed, 6, 0.35))}"/>`; } return `<g style="fill:${col};opacity:${op}">${s}</g>`; }
const tether = (a, b, o = {}) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + (o.sag ?? 30); const d = `M${r1(a[0])} ${r1(a[1])}Q${r1(mx)} ${r1(my)} ${r1(b[0])} ${r1(b[1])}`; return `<path d="${d}" style="fill:none;stroke:${o.col || 'var(--glow)'};stroke-width:${o.w || 1.4};opacity:${o.op ?? 0.7}${o.dash ? ';stroke-dasharray:' + o.dash : ''};stroke-linecap:round"/>`; };

function system(id, o = {}) {
  let s = `<rect width="${W}" height="${H}" style="fill:url(#${id}-sp)"/>` + stars(W, H, 220, 3);
  for (const [k, S] of Object.entries(SUNS)) { for (const R of S.orbits) s += orbitE(S.x, S.y, R, { op: o.orbitOp ?? 0.22 }); }
  if (o.under) s += o.under();
  for (const k of Object.keys(SUNS)) s += sun(k, id, { big: k === 'beta', eclipse: o.eclipse && k === 'europe', op: o.sunOp?.[k] });
  // planets back to front (smaller y first)
  const order = Object.keys(PL).sort((a, b) => P[a][1] - P[b][1]);
  for (const k of order) { const [sn, , , r, dom, nm, done, lm] = PL[k]; const [x, y] = P[k]; const st = o.planet ? o.planet(k) : {};
    if (st.skip) continue;
    const rr = r * 1.3 * (st.scale || 1);
    s += planet(x, y, rr, st.done ?? done, hue(dom), lm, [SUNS[sn].x, SUNS[sn].y], { op: st.op, id, glow: st.glow });
    if (o.moons !== false && r >= 14) s += moons(x, y, rr, Math.round(r / 6), x + y);
    if (st.label !== false && (r >= 14 || st.label)) s += T(x, y + rr + 20, nm, { size: k === 'beta' ? 16 : 13.5, font: k === 'beta' ? 'd' : 'u', w: 600, halo: 'var(--space)', hw: 4, op: st.op != null ? Math.max(0.35, st.op) : 1 });
  }
  if (o.over) s += o.over();
  return s;
}
const svgWrap = (id, inner, o = {}) => `<svg class="world" viewBox="0 0 ${o.w || W} ${o.h || H}" aria-hidden="true"><defs>${defs(id)}</defs>${inner}</svg>`;

// ---------- stills ----------
const CH = { crumb: ['Company'], right: [{ i: 'eye', t: 'Owner' }, { i: 'layers', t: 'Filters' }] };
const LCH = (name, icon, finding) => ({ crumb: ['Company'], right: [{ i: 'eye', t: 'Owner' }, { i: icon, t: name, on: true }], finding: { icon, title: name, ...finding } });

function companyStill() {
  const id = 'o1';
  const s = system(id, { over: () => {
    let o = asteroids(...P.dpa, 46, 20, 18, 9, 'var(--coral)', 0.7);
    o += ship(P.beta[0] + 40, P.beta[1] - 22, -30) + ship(P.beta[0] + 52, P.beta[1] - 8, -10) + ship(P.ios[0] - 30, P.ios[1] - 18, 200) + ship(P.dpa[0] + 26, P.dpa[1] - 18, 30);
    o += tether(P.infra, P.beta, { op: 0.5, dash: '3 4' });
    o += avatar(P.beta[0] - 46, P.beta[1] - 30, 'N', 'var(--acc)') + avatar(P.dpa[0] + 30, P.dpa[1] + 26, 'D', 'var(--f-rules)');
    o += flag(P.store[0] + 16, P.store[1] - 18, 'Store go/no-go', { needs: 1 }) + flag(SUNS.europe.x - 150, SUNS.europe.y - 60, 'Europe first', { needs: 1 });
    // domains as a quiet key: hue and landmark carry the department
    return o; } });
  return svgWrap(id, s) + chrome(CH);
}
// cost: infrared. The darker the sky, the brighter what burns money; AI share as a teal corona
function costStill() {
  const id = 'o2'; const SP = { beta: 1.0, ios: 0.5, eu: 0.45, evals: 0.6, onboard: 0.55, launch: 0.5, eul: 0.3, dpa: 0.25, infra: 0.4, store: 0.2, design: 0.15, spec: 0.15, bill: 0.2, cost: 0.05, raise: 0.05, hire: 0.1, eup: 0.05 };
  const AI = { beta: 0.7, evals: 0.9, onboard: 0.9, ios: 0.3, eu: 0.3 };
  const s = system(id, { orbitOp: 0.12, moons: false, planet: (k) => ({ glow: SP[k] * 1.4, op: 0.35 + 0.65 * SP[k], label: SP[k] > 0.4 }), under: () => Object.entries(AI).map(([k, a]) => `<circle cx="${r1(P[k][0])}" cy="${r1(P[k][1])}" r="${r1(PL[k][3] * (1.6 + a * 1.6))}" style="fill:none;stroke:var(--ai);stroke-width:${r1(2 + a * 5)};opacity:${r1(0.25 + 0.4 * a)}" filter="url(#${id}-b2)"/>`).join('') });
  return svgWrap(id, s) + chrome(LCH('Cost', 'coins', { pos: 'bl', text: 'Seen in infrared, what costs most burns brightest: the private beta and the evals. The teal corona is the AI share, widest around the evals and onboarding.', legend: ramp(['color-mix(in srgb,var(--glow) 10%,transparent)', 'var(--glow)'], 'less', 'more spend') + keyRow([[sw('background:var(--ai)'), 'AI corona']]) }));
}
// progress: luminosity. Each orbit is lit along the share of the journey done; the forecast is dotted
function progressStill() {
  const id = 'o3';
  const s = system(id, { orbitOp: 0.1, moons: false, under: () => { let u = ''; for (const [k, p] of Object.entries(PL)) { const [sn, oi, ang, r, dom, , done] = p; const S = SUNS[sn], R = S.orbits[oi];
    const arc = (f0, f1) => { const pts = []; for (let t = f0; t <= f1 + 1e-6; t += 0.02) { const a = (ang - 360 * (1 - t)) * Math.PI / 180; pts.push([S.x + Math.cos(a) * R, S.y + Math.sin(a) * R * TILT]); } return smooth(pts, false); };
    u += `<path d="${arc(0, done)}" style="fill:none;stroke:color-mix(in srgb,${hue(dom)} 70%,#fff);stroke-width:2.6;opacity:.85;stroke-linecap:round"/>`; } return u; } });
  return svgWrap(id, s) + chrome(LCH('Progress', 'sunrise', { pos: 'bl', text: 'A planet\'s lit phase is its done share, and its orbit is lit along the part of the journey already travelled. The Europe planets are thin crescents with short trails; Cost control is nearly full.', legend: keyRow([[sw('background:var(--fg)', 'line'), 'journey done'], [sw('background:radial-gradient(circle at 70% 50%,#fff 45%,var(--space) 46%)'), 'phase = done share']]) }));
}
// issues: X-ray. Asteroid fields gather where issues are; flares only where failing or breached
function issuesStill() {
  const id = 'o4';
  const s = system(id, { orbitOp: 0.12, moons: false, planet: (k) => ({ op: ['onboard', 'beta', 'dpa'].includes(k) ? 1 : 0.35, label: ['onboard', 'beta', 'dpa'].includes(k) ? true : false }), over: () => {
    let o = asteroids(...P.onboard, 70, 30, 60, 4) + asteroids(...P.beta, 64, 28, 18, 5, 'var(--fg)', 0.4);
    o += `<circle cx="${r1(P.beta[0] - 22)}" cy="${r1(P.beta[1] + 10)}" r="22" style="fill:var(--amber);opacity:.45" filter="url(#${id}-b)"/><circle cx="${r1(P.beta[0] - 22)}" cy="${r1(P.beta[1] + 10)}" r="4" style="fill:var(--amber)"/>`;
    o += asteroids(...P.dpa, 50, 22, 22, 9, 'var(--coral)', 0.85) + `<circle cx="${r1(P.dpa[0])}" cy="${r1(P.dpa[1])}" r="30" style="fill:var(--coral);opacity:.35" filter="url(#${id}-b)"/>`;
    o += T(P.beta[0] - 30, P.beta[1] + 70, 'Integration suite failing', { size: 13.5, font: 'u', w: 600, halo: 'var(--space)' }) + T(P.dpa[0], P.dpa[1] + 48, 'DPA signature late', { size: 13.5, font: 'u', w: 600, halo: 'var(--space)' }) + T(P.onboard[0], P.onboard[1] + 58, 'Issues within service levels', { size: 13, font: 'u', w: 500, fill: 'var(--muted)', halo: 'var(--space)' });
    return o; } });
  return svgWrap(id, s) + chrome(LCH('Issues', 'radar', { pos: 'bl', text: 'In X-ray, issues show as asteroid fields around the programs they hit. Onboarding flies through the densest field but within its service levels; the suite fails on the private beta (amber); the DPA has breached its date (coral).', legend: keyRow([[sw('background:var(--fg)'), 'issues'], [sw('background:var(--amber)'), 'failing'], [sw('background:var(--coral)'), 'breached']]) }));
}
// dependencies: gravity. Tethers between planets, the critical chain bright, the decaying orbit
function depsStill() {
  const id = 'o5';
  const s = system(id, { orbitOp: 0.1, moons: false, planet: (k) => ({ op: ['infra', 'beta', 'store', 'launch', 'dpa', 'eul', 'ios'].includes(k) ? 1 : 0.3, label: ['infra', 'beta', 'store', 'launch', 'dpa', 'eul'].includes(k) }), over: () => {
    let o = tether(P.spec, P.beta, { op: 0.45 }) + tether(P.design, P.beta, { op: 0.45 }) + tether(P.beta, P.evals, { op: 0.45 }) + tether(P.ios, P.store, { op: 0.45 }) + tether(P.bill, P.raise, { op: 0.4 }) + tether(P.eu, P.eul, { op: 0.45 });
    const crit = [[P.infra, P.beta], [P.beta, P.store], [P.store, P.launch]];
    for (const [a, b] of crit) o += tether(a, b, { w: 9, op: 0.15, sag: 40 }) + tether(a, b, { w: 2.6, op: 1, sag: 40, col: 'var(--road)' });
    o += tether(P.dpa, P.eul, { w: 2.4, op: 0.9, sag: 20, col: 'var(--road)', dash: '4 5' });
    o += barrier((P.infra[0] + P.beta[0]) / 2, (P.infra[1] + P.beta[1]) / 2 + 20, 0.9);
    return o; } });
  return svgWrap(id, s) + chrome(LCH('Dependencies', 'route', { pos: 'bl', text: 'Tethers are dependencies: each pulls on the planet it holds. The bright chain is the critical path to the beta launch, from Railway infra through the private beta and the store submission; it is cut where the infra tether is held.', legend: keyRow([[sw('background:var(--road)', 'line'), 'critical tether'], [sw('background:var(--glow)', 'line'), 'dependency'], [sw('background:var(--coral)', 'sq'), 'held']]) }));
}
// crews (Orbits' own): people as ships; a planet with too few ships for its mass shows a strain halo
function crewStill() {
  const id = 'o6'; const CREW = { beta: 6, ios: 2, store: 1, launch: 2, eu: 1, dpa: 1, eul: 1, onboard: 3, evals: 2, spec: 1, design: 1, infra: 1, bill: 1, raise: 1, hire: 1, cost: 1 };
  const s = system(id, { orbitOp: 0.12, moons: false, planet: (k) => ({ op: 0.6 }), over: () => {
    let o = ''; for (const [k, n] of Object.entries(CREW)) { const [x, y] = P[k], r = PL[k][3]; for (let i = 0; i < n; i++) { const a = (i / n) * 6.28 + 0.6; o += ship(x + Math.cos(a) * (r + 12), y + Math.sin(a) * (r + 12) * 0.6, a * 57.3 + 90); }
      const strain = PL[k][3] / 6 > n + 1.5; if (strain || k === 'dpa') o += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r + 22}" style="fill:none;stroke:var(--fg);stroke-width:1.4;stroke-dasharray:2 5;opacity:.75"/>`; }
    o += avatar(P.beta[0] - 50, P.beta[1] - 40, 'N', 'var(--acc)') + avatar(P.dpa[0] + 34, P.dpa[1] - 26, 'D', 'var(--f-rules)');
    return o; } });
  return svgWrap(id, s) + chrome(LCH('Crews', 'users', { pos: 'bl', text: 'People are ships, flying where they work now. The private beta carries most of the crew; iOS 1.0 and the Europe launch are heavy planets with too few ships (dotted strain halo). Dana flies the DPA alone.', legend: keyRow([[sw('background:var(--fg);clip-path:polygon(100% 50%,0 0,30% 50%,0 100%)', 'sq'), 'a person'], [sw('border:1px dashed var(--fg);background:transparent'), 'understaffed']]) }));
}
// the problem picture
function problemStill() {
  const id = 'o7'; const on = ['infra', 'beta', 'store', 'launch', 'dpa', 'eul'];
  const s = system(id, { eclipse: true, orbitOp: 0.12, moons: false, planet: (k) => ({ op: on.includes(k) ? 1 : 0.22, label: on.includes(k) }), over: () => {
    let o = '';
    // the dispatcher moon in a decaying spiral around the private beta, knocked by the token asteroid
    const [bx, by] = P.beta; const sp = []; for (let t = 0; t <= 1; t += 0.02) { const a = t * 6.28 * 1.5 + 2.0, rr = 112 - t * 60; sp.push([bx + Math.cos(a) * rr, by + Math.sin(a) * rr * 0.5]); }
    o += `<path d="${smooth(sp, false)}" style="fill:none;stroke:var(--coral);stroke-width:2;stroke-dasharray:4 4;opacity:.9"/>`;
    const m = sp[sp.length - 1]; o += `<circle cx="${r1(m[0])}" cy="${r1(m[1])}" r="7" style="fill:var(--fg)"/>`;
    const a0 = sp[0]; o += `<g transform="translate(${r1(a0[0] - 16)} ${r1(a0[1] - 10)})"><path d="${smooth(blobPts(0, 0, 16, 13, 4, 9, 0.25))}" style="fill:color-mix(in srgb,var(--fg) 70%,var(--space));stroke:var(--coral);stroke-width:2.4"/>${G('envelope', 0, 0, 14, 'var(--space)', { sw: 1.8 })}</g>`;
    o += `<circle cx="${r1(a0[0] - 16)}" cy="${r1(a0[1] - 10)}" r="34" style="fill:var(--coral);opacity:.25" filter="url(#${id}-b)"/>`;
    // the tether from the dispatcher moon drags the store submission off its orbit (ghost orbit position)
    o += tether(m, P.store, { w: 2.6, op: 1, sag: 30, col: 'var(--road)' });
    const g2 = pos('beta', 1, 312); o += `<circle cx="${r1(g2[0])}" cy="${r1(g2[1])}" r="15" style="fill:none;stroke:var(--fg);stroke-width:1.4;stroke-dasharray:3 3;opacity:.7"/><path d="M${r1(g2[0] + 14)} ${r1(g2[1] + 6)}L${r1(P.store[0] - 16)} ${r1(P.store[1] - 4)}" style="stroke:var(--fg);stroke-width:1.2;opacity:.6;stroke-dasharray:2 3"/>`;
    // the eclipse: the DPA planet in front of the Europe sun; the Europe launch is in shadow
    o += `<circle cx="${SUNS.europe.x}" cy="${SUNS.europe.y}" r="${SUNS.europe.r * 0.95}" style="fill:none;stroke:var(--coral);stroke-width:3;opacity:.9"/>`;
    o += tether(P.store, P.launch, { w: 1.6, op: 0.7, sag: 30, dash: '3 5' }) + tether(P.dpa, P.eul, { w: 1.6, op: 0.7, sag: 20, dash: '3 5' });
    o += G('clock', P.launch[0] + 28, P.launch[1] - 20, 16, 'var(--fg)') + G('clock', P.eul[0] + 28, P.eul[1] - 20, 16, 'var(--fg)');
    o += T(a0[0] - 30, a0[1] - 40, 'Railway token', { size: 17, halo: 'var(--space)', hw: 5 }) + T(P.beta[0] - 10, P.beta[1] + 96, 'Dispatcher, decaying orbit', { size: 13.5, font: 'u', w: 600, halo: 'var(--space)' });
    o += T(SUNS.europe.x + 40, SUNS.europe.y - 30, 'Eclipsed: DPA signature late', { size: 13.5, font: 'u', w: 600, anchor: 'start', halo: 'var(--space)' });
    return o; } });
  return svgWrap(id, s) + chrome({ crumb: ['Company'], right: [{ i: 'eye', t: 'Owner' }, { i: 'search', t: 'What is stuck?', on: true }], finding: { icon: 'orbit', pos: 'bl', title: 'A decaying orbit and an eclipse', text: 'Knocked by the Railway token, the dispatcher moon spirals in and its tether drags the store submission off schedule; the beta launch waits behind it. Over Europe, the DPA eclipses the sun until it is signed.' } });
}

// ---- Engineering sector (Z1): the telescope on the Beta system, Engineering's planets large ----
function domainStill() {
  const id = 'o8'; const S2 = { beta: { x: 560, y: 470, r: 46, name: 'Beta live', orbits: [190, 300, 410, 520], done: 0.58, fc: 0.66 } };
  let s = `<rect width="${W}" height="${H}" style="fill:url(#${id}-sp)"/>` + stars(W, H, 260, 7);
  for (const R of S2.beta.orbits) s += orbitE(S2.beta.x, S2.beta.y, R, { op: 0.26 });
  s += sun('beta', id, { S: S2, big: true });
  const PP2 = { beta: [0, 205, 52], ios: [1, 120, 40], store: [1, 340, 26], evals: [3, 250, 26], platform: [2, 30, 30], design: [0, 40, 14], onboard: [1, 250, 14], launch: [2, 160, 16], infra: [2, 300, 13], spec: [3, 70, 14] };
  const NAMES = { platform: ['eng', 'Platform', 0.62, 'layers'] };
  const order = Object.keys(PP2).sort((a, b) => pos('beta', PP2[a][0], PP2[a][1], S2)[1] - pos('beta', PP2[b][0], PP2[b][1], S2)[1]);
  for (const k of order) { const [oi, ang, r] = PP2[k]; const [x, y] = pos('beta', oi, ang, S2); const p = PL[k] || ['beta', oi, ang, r, ...NAMES[k]]; const dom = p[4], nm = p[5], done = p[6], lm = p[7]; const eng = dom === 'eng';
    s += planet(x, y, r, done, hue(dom), lm, [S2.beta.x, S2.beta.y], { op: eng ? 1 : 0.3, id, glow: k === 'beta' ? 0.6 : 0 });
    if (eng) { s += moons(x, y, r, Math.round(r / 5), x + y) + T(x, y + r + 24, nm, { size: k === 'beta' ? 21 : 15, halo: 'var(--space)', hw: 5 }); s += ring(x, y, r + 7, done, 'var(--h-build)', { w: 2.4, op: 0.9 }); } }
  // EU residency lives in the Europe system: it shows at the edge of the field, where that system begins
  s += orbitE(1400, 140, 160, { op: 0.3, dash: '3 5' }) + planet(1290, 175, 20, 0.3, hue('eng'), 'shield', [1400, 140], { id }) + T(1290, 220, 'EU residency', { size: 15, halo: 'var(--space)' });
  const [bx, by] = pos('beta', 0, 205, S2); s += avatar(bx - 70, by - 50, 'N', 'var(--acc)') + avatar(bx - 46, by - 50, '✦', 'var(--ai)');
  const [sx, sy] = pos('beta', 1, 340, S2); s += flag(sx + 30, sy - 24, 'Store go/no-go', { needs: 1 });
  s += G('skyline', 92, 128, 44, 'color-mix(in srgb,var(--h-build) 70%,var(--fg))', { sw: 1.6, op: 0.75 });
  return svgWrap(id, s) + chrome({ crumb: ['Company', 'Engineering'], right: [{ i: 'eye', t: 'CTO' }, { i: 'layers', t: 'Filters' }] }) + `<div style="position:absolute;right:28px;top:250px;z-index:5"><span class="chip"><i data-lucide="chevrons-right" class="ic"></i>EU residency orbits Europe</span></div>`;
}

// ---- the beta planet's surface (Z2): stations are buildings with facades; unbuilt items are ghosts still in orbit ----
function programStill() {
  const id = 'o9'; let s = `<rect width="${W}" height="${H}" style="fill:url(#${id}-sp)"/>` + stars(W, H, 200, 11);
  const cx = 720, cy = 1980, R = 1500; // the planet's limb across the lower frame
  s += `<circle cx="${cx}" cy="${cy}" r="${R + 40}" style="fill:var(--glow);opacity:.12" filter="url(#${id}-b)"/><circle cx="${cx}" cy="${cy}" r="${R}" style="fill:color-mix(in srgb,var(--h-build) 22%,var(--space));stroke:color-mix(in srgb,var(--h-build) 70%,#fff);stroke-width:2"/>`;
  // four continents (streams) as bands along the limb, lit by their progress
  const PR = { dispatcher: 0.42, relay: 0.72, evals: 0.82, store: 0.36 }; const span = { dispatcher: [-0.36, -0.18], relay: [-0.17, 0.0], evals: [0.01, 0.18], store: [0.19, 0.36] };
  const onL = (t, h = 0) => { const a = -Math.PI / 2 + t; return [cx + Math.cos(a) * (R + h), cy + Math.sin(a) * (R + h)]; };
  for (const [k, [t0, t1]] of Object.entries(span)) { const pts = []; for (let t = t0; t <= t1; t += 0.01) pts.push(onL(t, -2)); for (let t = t1; t >= t0; t -= 0.01) pts.push(onL(t, -70)); s += `<path d="M${pts.map((p) => r1(p[0]) + ' ' + r1(p[1])).join('L')}Z" style="fill:var(--glow);opacity:${r1(0.05 + 0.2 * PR[k])}"/>`;
    const [lx, ly] = onL((t0 + t1) / 2, -40); s += `<g><circle cx="${r1(lx - 50)}" cy="${r1(ly)}" r="14" style="fill:var(--g3)"/>${ring(lx - 50, ly, 14, PR[k], 'var(--h-build)', { w: 2.2 })}${G(STREAMS[k].lm, lx - 50, ly, 15, 'var(--fg)')}${T(lx - 30, ly + 5, STREAMS[k].name, { size: 15, anchor: 'start', halo: 'var(--space)' })}</g>`; }
  // stations standing on the limb
  const st = (t, kind, o = {}) => { const [x, y] = onL(t, 0); const a = t * 57.3; const w = o.w || 132, h = w * 0.7; let g = `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(a)})"><line x1="0" y1="0" x2="0" y2="-18" style="stroke:var(--fg);stroke-width:2;opacity:.6"/>`;
    if (o.landmark) g += `<circle cx="0" cy="${r1(-18 - h / 2)}" r="${r1(w * 0.75)}" style="fill:url(#${id}-gl)"/>`;
    g += `<rect x="${r1(-w / 2 + 4)}" y="${r1(-18 - h + 6)}" width="${w}" height="${r1(h)}" rx="8" style="fill:#000;opacity:.3" filter="url(#${id}-b2)"/>` + facade(kind, -w / 2, -18 - h, w, h);
    if (o.crit != null) g += `<circle cx="${r1(w / 2)}" cy="${r1(-18 - h)}" r="9" style="fill:var(--space)"/>` + ring(w / 2, -18 - h, 7.5, o.crit, o.crit === 1 ? 'var(--good)' : 'var(--glow)', { w: 2.6 });
    if (o.sel) g += `<rect x="${r1(-w / 2 - 5)}" y="${r1(-18 - h - 5)}" width="${w + 10}" height="${r1(h + 10)}" rx="11" style="fill:none;stroke:var(--acc);stroke-width:2.2"/>`;
    return g + '</g>'; };
  s += st(-0.3, 'chart', { crit: 0.66, sel: true }) + st(-0.215, 'term', { crit: 1, w: 104 }) + st(-0.1, 'screens', { crit: 0.83 }) + st(0.06, 'doc', { crit: 1, landmark: true }) + st(0.14, 'doc', { crit: 0.5, w: 100 }) + st(0.27, 'build', { crit: 0.8 });
  // unbuilt items still in orbit as ghosts
  const ghost = (x, y, kind, w = 110) => `<g>${facade(kind, x - w / 2, y - w * 0.35, w, w * 0.7, { ghost: true })}</g>`;
  s += `<path d="M120 300 Q720 170 1320 300" style="fill:none;stroke:var(--fg);stroke-width:1;opacity:.25;stroke-dasharray:3 6"/>`;
  s += ghost(560, 228, 'screens') + ghost(980, 236, 'listing') + ghost(800, 205, 'chart', 90);
  // the critical path: a launch trajectory from the dispatcher station to the gate (a ring in space)
  const [dx0, dy0] = onL(-0.3, 110); const gx = 1250, gy = 150;
  s += `<path d="M${r1(dx0)} ${r1(dy0)}C${r1(dx0 + 200)} ${r1(dy0 - 300)} ${r1(onL(0.27, 140)[0])} ${r1(onL(0.27, 140)[1] - 50)} ${gx} ${gy}" style="fill:none;stroke:var(--glow);stroke-width:12;opacity:.15"/><path d="M${r1(dx0)} ${r1(dy0)}C${r1(dx0 + 200)} ${r1(dy0 - 300)} ${r1(onL(0.27, 140)[0])} ${r1(onL(0.27, 140)[1] - 50)} ${gx} ${gy}" style="fill:none;stroke:var(--road);stroke-width:2.6;stroke-dasharray:1 7;stroke-linecap:round"/>`;
  s += `<ellipse cx="${gx}" cy="${gy}" rx="40" ry="40" style="fill:none;stroke:var(--fg);stroke-width:5;opacity:.85"/>${ring(gx, gy, 30, 0.58, 'var(--h-build)', { w: 3, forecast: 0.66 })}${G('gate', gx, gy, 24, 'var(--fg)')}${T(gx, gy + 68, 'Gate 1 Alpha', { size: 17, halo: 'var(--space)' })}`;
  // the stuck chore: the token asteroid lodged on the dispatcher's launch path
  const [tx, ty] = onL(-0.36, 130); s += `<g transform="translate(${r1(tx)} ${r1(ty)})"><path d="${smooth(blobPts(0, 0, 18, 15, 4, 9, 0.25))}" style="fill:color-mix(in srgb,var(--fg) 70%,var(--space));stroke:var(--coral);stroke-width:2.4"/>${G('envelope', 0, 0, 15, 'var(--space)', { sw: 1.8 })}</g>`;
  s += `<g><rect x="40" y="96" width="300" height="56" rx="14" style="fill:var(--g3);stroke:color-mix(in srgb,#fff 25%,transparent)"/>${T(54, 119, 'Dispatcher sequencing under load', { size: 14.5, anchor: 'start' })}${T(54, 139, '4 of 6 criteria met · Noa · doing since Oct 26', { size: 12.5, anchor: 'start', font: 'u', w: 500, fill: 'var(--muted)' })}</g>`;
  const mini = `<svg viewBox="0 0 150 96"><circle cx="75" cy="48" r="9" style="fill:var(--glow);opacity:.6"/>${[22, 36].map((r) => `<ellipse cx="75" cy="48" rx="${r * 1.6}" ry="${r * 0.6}" style="fill:none;stroke:var(--glow);opacity:.4"/>`).join('')}<circle cx="42" cy="54" r="6" style="fill:none;stroke:var(--acc);stroke-width:2"/></svg>`;
  return svgWrap(id, s) + chrome({ crumb: ['Engineering', 'Private beta', 'Wave 71'], right: [{ i: 'layout-grid', t: 'As a board' }], mini });
}

function phoneStill() {
  const id = 'op'; const S3 = { beta: { x: 195, y: 330, r: 26, name: 'Beta live', orbits: [80, 125, 170], done: 0.58, fc: 0.66 } };
  let s = `<rect width="${PW}" height="${PH}" style="fill:url(#${id}-sp)"/>` + stars(PW, PH, 90, 5);
  for (const R of S3.beta.orbits) s += orbitE(195, 330, R, { op: 0.28 });
  s += sun('beta', id, { S: S3, big: false });
  const pp = { beta: [0, 205, 22], ios: [1, 110, 16], store: [1, 340, 11], launch: [2, 160, 14], onboard: [1, 250, 10], infra: [2, 300, 9], design: [0, 40, 9] };
  for (const [k, [oi, ang, r]] of Object.entries(pp)) { const [x, y] = pos('beta', oi, ang, S3); const p = PL[k]; s += planet(x, y, r, p[6], hue(p[4]), p[7], [195, 330], { id }); if (r >= 14) s += T(x, y + r + 18, p[5], { size: 13.5, font: 'u', w: 600, halo: 'var(--space)' }); }
  const card = `<div class="pcard" data-needs="1"><div class="pc-h"><svg viewBox="0 0 24 24" width="22" height="22">${G('flag', 12, 12, 22, 'var(--f-rules)')}</svg><b>Store go/no-go</b></div><p>The dispatcher\'s orbit is decaying; the beta slips a week unless the Railway token lands today.</p><div class="pills"><span class="chip on">Open the fork</span><span class="chip">Later</span></div></div>`;
  return `<div class="status" data-ambient><span>9:41</span><span>●●●</span></div>` + svgWrap(id, s, { w: PW, h: PH }) + chrome({ crumb: ['Company', 'Beta live'], right: [{ i: 'layers', t: 'Filters' }], talk: false }) + card;
}

export function stills() {
  return [
    { id: 'company', sky: true, glance: true, title: 'Company depth: three systems', html: companyStill(), caption: 'Three goals are three suns (Beta live, Europe, Runway), each ringed with its progress. Programs orbit the goal they serve, nearer when they deliver sooner; their lit phase is their done share; their hue and landmark say which department they belong to; moons are their items. Ships near the beta are the people working there. Around the DPA planet a coral asteroid field (the late signature). Two owner flags. Departments are not regions here: the map is organised by purpose.' },
    { id: 'domain', title: 'Domain depth: the telescope on Engineering', html: domainStill(), caption: 'Pointing the telescope at Engineering: the Beta system fills the field and Engineering\'s planets are large, lit and ringed (Private beta, iOS 1.0, Store submission, Platform, Evals); other departments\' planets stay in place, dimmed. EU residency belongs to the Europe system and shows where that system begins, at the edge of the field.' },
    { id: 'program', title: 'Program depth: the surface of the beta', html: programStill(), caption: 'Landing on the beta planet: four continents along the limb are the streams, lit by progress; the stations standing on it are the built products with their criteria rings; unbuilt items (the Hebrew screens, the store listing) are ghosts still in orbit. The critical path is a launch trajectory to the Gate 1 Alpha ring; the token asteroid is lodged on it.' },
    { id: 'cost', glance: true, title: 'Filter: infrared (cost)', html: costStill(), caption: 'Through the infrared filter the planets glow by spend; the AI share is a teal corona.' },
    { id: 'progress', glance: true, title: 'Filter: luminosity (progress)', html: progressStill(), caption: 'Phase and trail: a planet\'s lit fraction is its done share and its orbit is lit along the part of the journey travelled.' },
    { id: 'issues', glance: true, title: 'Filter: X-ray (issues)', html: issuesStill(), caption: 'Issues are asteroid fields around what they hit; colour only on the failing suite and the breached signature.' },
    { id: 'deps', glance: true, title: 'Filter: gravity (dependencies)', html: depsStill(), caption: 'Tethers show what holds what; the critical chain to the beta launch is bright and held at the infra tether.' },
    { id: 'crews', glance: true, title: 'Filter: crews (Orbits\' own: people and load)', html: crewStill(), caption: 'People as ships where they work now; a dotted strain halo marks a heavy planet with too few ships.' },
    { id: 'problem', glance: true, title: 'The problem picture: a decaying orbit and an eclipse', html: problemStill(), caption: 'The token asteroid knocks the dispatcher moon into a decaying spiral; its tether drags the store submission off its orbit (ghost where it should be); the beta launch waits. In the Europe system the DPA planet eclipses the sun and the Europe launch sits in shadow.' },
    { id: 'company', phone: true, glance: true, title: 'Phone: one system', html: phoneStill(), caption: 'On a phone, one goal at a time: the Beta live system with its planets; swipe for the next sun.' },
  ];
}
