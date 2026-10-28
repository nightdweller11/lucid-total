// V2 City: the company as an isometric city at night. Districts are domains (zoned ground), buildings are items
// (height = effort, lit windows = progress), finished products stay as landmarks, people are a tiny population on the
// streets. Infrastructure layers show how the company works: power (decisions and goals), plumbing (work flowing through
// states), roads (dependencies and traffic), land value (cost). Activity is day and night: a busy district glows.
import { W, H, PW, PH, rng, r1, lerp, clamp, sstep, noise2, smooth, poly, blobPts, T, ring, G, flag, barrier, avatar, facade, chrome, ramp, keyRow, sw, haloFilter } from './lib.mjs';
import { DOM, hue, ENG, STREAMS, BLD } from './company.mjs';

export const meta = {
  n: 2, name: 'City', icon: 'building-2',
  line: 'The company as a city you run, SimCity style.',
  intro: 'Districts are domains, zoned in their hue; buildings are items, as tall as their effort, their windows lit as they get done; finished products stay standing as landmarks. The overlays are the city\'s utilities: power is decisions and goals feeding the work (a cut line is a missing decision), plumbing is work flowing through its states (a clogged pipe is a stuck process), roads are dependencies with their traffic, land value is cost. Zooming in walks you from the skyline to a block to the shopfronts, where the facades are the products.',
};

// ---------- iso kit ----------
const ISO = (ox, oy, s, zk = 1) => (x, y, z = 0) => [ox + (x - y) * s * 0.866, oy + (x + y) * s * 0.5 - z * s * zk];
const pth = (pts) => 'M' + pts.map((p) => `${r1(p[0])} ${r1(p[1])}`).join('L') + 'Z';
const faceCols = (hu, o = {}) => ({
  top: `color-mix(in srgb,${hu} ${o.tm ?? 34}%,var(--city-top))`,
  left: `color-mix(in srgb,${hu} ${o.lm ?? 22}%,var(--city-left))`,
  right: `color-mix(in srgb,${hu} ${o.rm ?? 14}%,var(--city-right))`,
});
// a box with windows. lit: share of lit windows; ghostAbove: share of height that is still to build (dashed wire)
function box(P, x, y, w, d, h, hu, o = {}) {
  const c = o.dark ? { top: 'color-mix(in srgb,var(--city-right) 55%,#000)', left: 'color-mix(in srgb,var(--city-right) 40%,#000)', right: 'color-mix(in srgb,var(--city-right) 30%,#000)' } : faceCols(hu, o.cols); const R = rng(o.seed || Math.round(x * 31 + y * 17));
  const hb = o.built != null ? h * o.built : h; let s = `<g${o.op != null ? ` opacity="${o.op}"` : ''}>`;
  const L = [P(x, y + d, 0), P(x + w, y + d, 0), P(x + w, y + d, hb), P(x, y + d, hb)];
  const Rf = [P(x + w, y, 0), P(x + w, y + d, 0), P(x + w, y + d, hb), P(x + w, y, hb)];
  const Tp = [P(x, y, hb), P(x + w, y, hb), P(x + w, y + d, hb), P(x, y + d, hb)];
  if (o.wire) { s += `<path d="${pth(L)}${pth(Rf)}${pth(Tp)}" style="fill:color-mix(in srgb,${hu} 6%,transparent);stroke:color-mix(in srgb,${hu} 50%,var(--fg));stroke-width:.8;opacity:.55"/>`; return s + '</g>'; }
  s += `<path d="${pth(L)}" style="fill:${c.left}"/><path d="${pth(Rf)}" style="fill:${c.right}"/><path d="${pth(Tp)}" style="fill:${c.top}"/>`;
  if (o.edge !== false) s += `<path d="M${r1(Tp[0][0])} ${r1(Tp[0][1])}L${r1(Tp[3][0])} ${r1(Tp[3][1])}L${r1(Tp[2][0])} ${r1(Tp[2][1])}L${r1(Tp[1][0])} ${r1(Tp[1][1])}M${r1(Tp[2][0])} ${r1(Tp[2][1])}L${r1(L[1][0])} ${r1(L[1][1])}" style="fill:none;stroke:color-mix(in srgb,#fff 30%,transparent);stroke-width:.7"/>`;
  // windows
  if (o.win !== false && hb > 0.5) {
    const fl = Math.max(1, Math.floor(hb * (o.wf || 2.2))), cw = Math.max(1, Math.floor(w * (o.wc || 2.4))), cd = Math.max(1, Math.floor(d * (o.wc || 2.4)));
    let lit = '', dark = ''; const share = o.lit ?? 0.5;
    const win = (face, i, n, f) => { const a = (i + 0.28) / n, b = (i + 0.72) / n, z0 = (f + 0.3) / fl * hb, z1 = (f + 0.7) / fl * hb;
      const q = face === 'L' ? [P(x + w * a, y + d, z0), P(x + w * b, y + d, z0), P(x + w * b, y + d, z1), P(x + w * a, y + d, z1)] : [P(x + w, y + d * a, z0), P(x + w, y + d * b, z0), P(x + w, y + d * b, z1), P(x + w, y + d * a, z1)];
      if (R() < share) lit += pth(q); else dark += pth(q); };
    for (let f = 0; f < fl; f++) { for (let i = 0; i < cw; i++) win('L', i, cw, f); for (let i = 0; i < cd; i++) win('R', i, cd, f); }
    if (dark) s += `<path d="${dark}" style="fill:var(--win-off)"/>`;
    if (lit) s += `<path d="${lit}" style="fill:var(--win)"/>`;
  }
  if (o.built != null && o.built < 1) { const TT = [P(x, y, h), P(x + w, y, h), P(x + w, y + d, h), P(x, y + d, h)];
    s += `<path d="${pth(TT)}M${r1(TT[0][0])} ${r1(TT[0][1])}L${r1(Tp[0][0])} ${r1(Tp[0][1])}M${r1(TT[1][0])} ${r1(TT[1][1])}L${r1(Tp[1][0])} ${r1(Tp[1][1])}M${r1(TT[2][0])} ${r1(TT[2][1])}L${r1(Tp[2][0])} ${r1(Tp[2][1])}M${r1(TT[3][0])} ${r1(TT[3][1])}L${r1(Tp[3][0])} ${r1(Tp[3][1])}" style="fill:none;stroke:color-mix(in srgb,${hu} 60%,var(--fg));stroke-width:1;stroke-dasharray:3 3;opacity:.8"/>`; }
  return s + '</g>';
}
// cylinder (lighthouse, tank)
function cyl(P, x, y, r, h, hu, o = {}) {
  const c = faceCols(hu, o.cols); const [cx, cy0] = P(x, y, 0), [, cy1] = P(x, y, h); const sx = r * Math.abs(P(1, 0)[0] - P(0, 0)[0]) * 1.15, sy = sx * 0.5;
  let s = `<path d="M${r1(cx - sx)} ${r1(cy0)}A${r1(sx)} ${r1(sy)} 0 0 0 ${r1(cx + sx)} ${r1(cy0)}L${r1(cx + sx * (o.taper || 1))} ${r1(cy1)}A${r1(sx * (o.taper || 1))} ${r1(sy * (o.taper || 1))} 0 0 1 ${r1(cx - sx * (o.taper || 1))} ${r1(cy1)}Z" style="fill:${c.left}"/>`;
  s += `<path d="M${r1(cx)} ${r1(cy0 + sy)}L${r1(cx + sx)} ${r1(cy0)}L${r1(cx + sx * (o.taper || 1))} ${r1(cy1)}L${r1(cx)} ${r1(cy1 + sy * (o.taper || 1))}Z" style="fill:${c.right};opacity:.7"/>`;
  s += `<ellipse cx="${r1(cx)}" cy="${r1(cy1)}" rx="${r1(sx * (o.taper || 1))}" ry="${r1(sy * (o.taper || 1))}" style="fill:${c.top}"/>`;
  return s;
}
const diamond = (P, x, y, w = 1, d = 1, z = 0) => pth([P(x, y, z), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z)]);

// ---------- the company city ----------
const N = 40;
const SEED = { lead: [0.16, 0.22], prod: [0.36, 0.12], design: [0.6, 0.11], comp: [0.85, 0.3], sales: [0.1, 0.52], ops: [0.27, 0.64], eng: [0.48, 0.47], mkt: [0.76, 0.6], fin: [0.9, 0.78], support: [0.62, 0.86], people: [0.36, 0.88] };
const toUV = (x, y) => [(x - y) / N + 0.5, (x + y) / N - 0.5];
const fromUV = (u, v) => { const a = (u - 0.5) * N, b = (v + 0.5) * N; return [(a + b) / 2, (b - a) / 2]; };
const nz = noise2(77);
const islandUV = (() => { const R = rng(9), ph = [R() * 6, R() * 6, R() * 6]; return (u, v) => { const dx = (u - 0.5) / 0.5, dy = (v - 0.5) / 0.5, a = Math.atan2(dy, dx), d = Math.hypot(dx, dy);
  return (0.92 + 0.05 * Math.sin(a * 3 + ph[0]) + 0.035 * Math.sin(a * 5 + ph[1]) + 0.02 * Math.sin(a * 8 + ph[2])) - d; }; })();
const KEYS = Object.keys(SEED);
function districtOf(x, y) {
  const [u, v] = toUV(x + 0.5, y + 0.5); if (islandUV(u, v) < 0) return null;
  let best = null, bd = 1e9; for (const k of KEYS) { const [su, sv] = SEED[k]; const d = Math.hypot((u - su) * 1.0, (v - sv) * 1.05) / Math.sqrt(DOM[k].work + 0.25) + 0.05 * nz(x * 0.45, y * 0.45); if (d < bd) { bd = d; best = k; } }
  return best;
}
const GRID = (() => { const g = []; for (let y = 0; y < N; y++) { g.push([]); for (let x = 0; x < N; x++) g[y].push(districtOf(x, y)); } return g; })();
const dist = (x, y) => (x < 0 || y < 0 || x >= N || y >= N ? null : GRID[y][x]);
// avenues on district borders; a building lot is an interior tile
const isEdge = (x, y) => { const k = dist(x, y); return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => dist(x + dx, y + dy) !== k); };
const CENTER = Object.fromEntries(KEYS.map((k) => { let sx = 0, sy = 0, n = 0; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (GRID[y][x] === k) { sx += x; sy += y; n++; } return [k, [sx / n, sy / n, n]]; }));
const LOTS = (() => { const R = rng(3); const out = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const k = GRID[y][x]; if (!k || isEdge(x, y)) continue; if (x % 4 === 0 || y % 5 === 0) continue; // internal streets as gaps
    const d = DOM[k]; const [cx, cy] = CENTER[k]; const near = Math.hypot(x - cx, y - cy) < 1.2; if (near) continue; // landmark lot
    if (R() > 0.3 + d.work * 0.38) continue;
    const hgt = 0.9 * (0.5 + R() * (0.6 + d.work * 3.0)) * (1 - 0.35 * clamp(Math.hypot(x - cx, y - cy) / 6));
    out.push({ k, x, y, h: hgt, lit: clamp(d.done * (0.6 + R() * 0.8)) * (1 - d.stale * 0.7), fw: 0.62 + R() * 0.2, seed: x * 97 + y * 13 }); }
  return out; })();

function cityGround(P, o = {}) {
  let s = '';
  // water plane under everything, with ripples
  const [wx, wy] = P(...fromUV(0.5, 0.52)), wr = Math.abs(P(...fromUV(1, 0.5))[0] - P(...fromUV(0, 0.5))[0]) / 2;
  s += `<ellipse cx="${r1(wx)}" cy="${r1(wy)}" rx="${r1(wr * 1.3)}" ry="${r1(wr * 0.8)}" style="fill:url(#cw)"/>`;
  for (let i = 0; i < 26; i++) { const R = rng(i + 400); const [u, v] = [R(), R()]; const [x, y] = fromUV(u * 1.2 - 0.1, v * 1.1 - 0.05); if (dist(Math.floor(x), Math.floor(y)) || islandUV(u * 1.2 - 0.1, v * 1.1 - 0.05) > -0.02) continue; const [px, py] = P(x, y); s += `<path d="M${r1(px - 14)} ${r1(py)}q7 -3 14 0t14 0" style="fill:none;stroke:var(--glow);stroke-width:1;opacity:.22"/>`; }
  // coast: slab under the island
  const byK = {}; let coast = '';
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const k = GRID[y][x]; if (!k) continue; (byK[k] = byK[k] || []).push(diamond(P, x, y));
    if (!dist(x, y + 1)) coast += pth([P(x, y + 1), P(x + 1, y + 1), P(x + 1, y + 1, -0.6), P(x, y + 1, -0.6)]);
    if (!dist(x + 1, y)) coast += pth([P(x + 1, y), P(x + 1, y + 1), P(x + 1, y + 1, -0.6), P(x + 1, y, -0.6)]); }
  s += `<path d="${coast}" style="fill:var(--city-right);opacity:.95"/>`;
  for (const k of KEYS) { const z = o.zone ? o.zone(k) : `color-mix(in srgb,${hue(k)} 20%,var(--city-ground))`; if (o.darkK === k) { s += `<path d="${byK[k].join('')}" style="fill:color-mix(in srgb,var(--city-right) 50%,#000)"/>`; continue; } s += `<path d="${byK[k].join('')}" style="fill:${z}"/>`; }
  // avenues: tile edges between districts
  let av = ''; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const k = GRID[y][x]; if (!k) continue;
    if (dist(x + 1, y) && dist(x + 1, y) !== k) { const a = P(x + 1, y), b = P(x + 1, y + 1); av += `M${r1(a[0])} ${r1(a[1])}L${r1(b[0])} ${r1(b[1])}`; }
    if (dist(x, y + 1) && dist(x, y + 1) !== k) { const a = P(x, y + 1), b = P(x + 1, y + 1); av += `M${r1(a[0])} ${r1(a[1])}L${r1(b[0])} ${r1(b[1])}`; } }
  s += `<path d="${av}" style="fill:none;stroke:var(--street);stroke-width:${o.avw || 3.2};stroke-linecap:round;opacity:.95"/>`;
  s += `<path d="${av}" style="fill:none;stroke:var(--glow);stroke-width:.8;stroke-dasharray:2 5;opacity:.35"/>`;
  return s;
}
// landmark buildings (one per district, at its centre)
function landmark(P, k, o = {}) {
  const [cx, cy] = CENTER[k]; const x = cx - 0.4, y = cy - 0.4, hu = hue(k), d = DOM[k]; const lit = o.lit ?? d.done; const op = o.op;
  const B = (dx, dy, w, dd, h, extra = {}) => box(P, x + dx, y + dy, w, dd, h, hu, { lit, op, seed: Math.round((x + dx) * 50 + (y + dy) * 7), ...o.box, ...extra });
  switch (k) {
    case 'eng': return B(-0.6, -0.6, 0.9, 0.9, 7.2) + B(0.5, -0.5, 0.8, 0.8, 9.6) + B(-0.4, 0.5, 0.8, 0.8, 5.6) + B(0.6, 0.6, 0.7, 0.7, 4.2);
    case 'comp': return B(-0.2, -0.2, 1.4, 1.4, 0.6, { win: false }) + `<g${op != null ? ` opacity="${op}"` : ''}>${cyl(P, x + 0.5, y + 0.5, 0.36, 4.6, hu, { taper: 0.75 })}${cyl(P, x + 0.5, y + 0.5, 0.22, 5.4, 'var(--fg)', { cols: { tm: 80, lm: 70, rm: 50 } })}</g>`;
    case 'mkt': { let s = B(-0.3, -0.3, 1.6, 1.2, 1.6); for (let i = 0; i < 3; i++) s += box(P, x + 1.3 + i * 0.05, y + 1.4 + i * 0.7, 2.2, 0.22, 0.25, hu, { win: false, op }); return s + G('sail', ...P(x + 3.2, y + 1.9, 1.2), 26, `color-mix(in srgb,${hu} 70%,var(--fg))`); }
    case 'fin': return B(-0.1, -0.1, 1.3, 1.3, 1.8) + `<g${op != null ? ` opacity="${op}"` : ''}>${cyl(P, x + 0.55, y + 0.55, 0.5, 2.4, hu, { taper: 0.35 })}</g>`;
    case 'ops': return B(-0.2, -0.2, 1.2, 1.2, 1.4) + `<g${op != null ? ` opacity="${op}"` : ''}>${cyl(P, x + 0.4, y + 0.4, 0.45, 3.4, hu)}</g>`;
    case 'lead': return B(-0.2, -0.2, 1.4, 1.4, 2.4) + `<g${op != null ? ` opacity="${op}"` : ''}>${cyl(P, x + 0.5, y + 0.5, 0.5, 3.6, hu, { taper: 0.2 })}</g>` + `<line x1="${r1(P(x + 0.5, y + 0.5, 3.6)[0])}" y1="${r1(P(x + 0.5, y + 0.5, 3.6)[1])}" x2="${r1(P(x + 0.5, y + 0.5, 5)[0])}" y2="${r1(P(x + 0.5, y + 0.5, 5)[1])}" style="stroke:var(--fg);stroke-width:1.4"/>`;
    case 'people': return B(-0.2, -0.2, 1.6, 1.1, 1.1, { cols: { tm: 50, lm: 30, rm: 20 } }) + `<path d="${pth([P(x - 0.2, y - 0.2, 1.1), P(x + 1.4, y - 0.2, 1.1), P(x + 1.4, y + 0.35, 1.9), P(x - 0.2, y + 0.35, 1.9)])}" style="fill:color-mix(in srgb,${hu} 40%,transparent);stroke:var(--fg);stroke-width:.6"/>`;
    case 'prod': { let s = ''; for (let i = 0; i < 3; i++) s += B(-0.3 + i * 0.55, -0.2, 0.5, 1.4, 1.6 + i * 0.25); return s; }
    case 'design': return B(-0.2, -0.2, 1.3, 1.3, 3.2, { cols: { tm: 50, lm: 40, rm: 30 } });
    case 'support': return B(-0.1, -0.1, 1.1, 1.1, 1.6) + `<path d="M${r1(P(x + 0.45, y + 0.45, 1.6)[0] - 9)} ${r1(P(x + 0.45, y + 0.45, 1.6)[1])}L${r1(P(x + 0.45, y + 0.45, 5)[0])} ${r1(P(x + 0.45, y + 0.45, 5)[1])}L${r1(P(x + 0.45, y + 0.45, 1.6)[0] + 9)} ${r1(P(x + 0.45, y + 0.45, 1.6)[1])}M${r1(P(x + 0.45, y + 0.45, 3)[0] - 5)} ${r1(P(x + 0.45, y + 0.45, 3)[1])}h10" style="fill:none;stroke:${hu};stroke-width:1.6"/>`;
    case 'sales': return B(-0.1, -0.1, 1.0, 1.0, 1.4) + `<path d="M${r1(P(x - 1.5, y + 1.6, 0.6)[0])} ${r1(P(x - 1.5, y + 1.6, 0.6)[1])}Q${r1(P(x - 2.4, y + 2.6, 2.6)[0])} ${r1(P(x - 2.4, y + 2.6, 2.6)[1])} ${r1(P(x - 3.3, y + 3.6, 0.6)[0])} ${r1(P(x - 3.3, y + 3.6, 0.6)[1])}" style="fill:none;stroke:${hu};stroke-width:2${op != null ? ';opacity:' + op : ''}"/>`;
    default: return B(0, 0, 1, 1, 2);
  }
}
const LMH = { eng: 9.6, comp: 5.4, mkt: 1.6, fin: 2.4, ops: 3.4, lead: 5, people: 1.9, prod: 2.1, design: 3.2, support: 5, sales: 1.4 };
// a district sign: glass plate with glyph, ring and name, floating over the landmark
function sign(P, k, o = {}) {
  const [cx, cy] = CENTER[k]; const [x, y] = P(cx, cy, (LMH[k] || 2) + (o.lift ?? 1.4)); const d = DOM[k], hu = hue(k); const big = o.big; const nm = o.label || d.name;
  const w = (big ? 64 : 44) + nm.length * (big ? 12.6 : 8.4), hgt = big ? 46 : 32; const r = hgt / 2;
  let s = `<g class="sign"${o.op != null ? ` opacity="${o.op}"` : ''}><line x1="${r1(x)}" y1="${r1(y)}" x2="${r1(x)}" y2="${r1(y + (o.stem ?? 14))}" style="stroke:color-mix(in srgb,var(--fg) 50%,transparent);stroke-width:1.2"/>`;
  s += `<rect x="${r1(x - w / 2)}" y="${r1(y - hgt)}" width="${r1(w)}" height="${hgt}" rx="${r}" style="fill:var(--g3);stroke:color-mix(in srgb,${hu} 55%,transparent);stroke-width:1"/>`;
  s += `<circle cx="${r1(x - w / 2 + r)}" cy="${r1(y - r)}" r="${r - 4}" style="fill:color-mix(in srgb,${hu} 25%,var(--ground-base))"/>` + ring(x - w / 2 + r, y - r, r - 4, d.done, hu, { w: 2.2, forecast: d.fc }) + G(d.lm, x - w / 2 + r, y - r, (r - 4) * 1.25, `color-mix(in srgb,${hu} 70%,var(--fg))`);
  s += T(x - w / 2 + hgt + 6, y - r + (big ? 7.5 : 5), nm, { size: big ? 21 : 14.5, anchor: 'start' });
  return s + '</g>';
}
// population: dots on the avenues where people work now
function people(P, k, n, seed) { const R = rng(seed); const [cx, cy] = CENTER[k]; let s = ''; for (let i = 0; i < n; i++) { const [x, y] = P(cx + (R() - 0.5) * 5, cy + (R() - 0.5) * 5, 0); s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="1.6" style="fill:var(--fg);opacity:.8"/>`; } return s; }
const heatPool = (P, k, r, op) => { const [cx, cy] = CENTER[k]; const [x, y] = P(cx, cy, 0); return `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r}" ry="${r1(r * 0.55)}" style="fill:url(#cg);opacity:${op}"/>`; };

const PC = ISO(735, -125, 29, 1);
function cityDefs() {
  return `<radialGradient id="cw"><stop offset="0" style="stop-color:var(--water2)"/><stop offset=".7" style="stop-color:var(--water);stop-opacity:.9"/><stop offset="1" style="stop-color:var(--water);stop-opacity:0"/></radialGradient>`
    + `<radialGradient id="cg"><stop offset="0" style="stop-color:var(--glow);stop-opacity:.5"/><stop offset="1" style="stop-color:var(--glow);stop-opacity:0"/></radialGradient>`
    + haloFilter('cb', 8) + haloFilter('cb2', 3);
}
// draw lots + landmarks in painter's order; o.style(lot) may return box options
function cityBuildings(P, o = {}) {
  const items = LOTS.map((l) => ({ z: l.x + l.y, svg: () => box(P, l.x + (1 - l.fw) / 2, l.y + (1 - l.fw) / 2, l.fw, l.fw, l.h, hue(l.k), { lit: l.lit, seed: l.seed, ...(o.lot ? o.lot(l) : {}) }) }));
  for (const k of KEYS) { const [cx, cy] = CENTER[k]; items.push({ z: cx + cy + 0.5, svg: () => landmark(P, k, o.lm ? o.lm(k) : {}) }); }
  items.sort((a, b) => a.z - b.z); return items.map((i) => i.svg()).join('');
}
function citySvg(body, o = {}) { return `<svg class="world" viewBox="0 0 ${o.w || W} ${o.h || H}" aria-hidden="true"><defs>${cityDefs()}${o.defs || ''}</defs>${body}</svg>`; }
const at = (k, z = 0, dx = 0, dy = 0, P = PC) => { const [cx, cy] = CENTER[k]; return P(cx + dx, cy + dy, z); };

// ---------- stills ----------
const CH = (extra = {}) => ({ crumb: ['Company'], right: [{ i: 'eye', t: 'Owner' }, { i: 'layers', t: 'Layers' }], ...extra });
const LCH = (name, icon, finding) => ({ crumb: ['Company'], right: [{ i: 'eye', t: 'Owner' }, { i: icon, t: name, on: true }], finding: { icon, pos: 'bl', title: name, ...finding } });
const signs = (P, o = {}) => KEYS.map((k) => sign(P, k, { big: k === (o.focus || 'eng'), op: o.dim && !o.dim.includes(k) ? 0.4 : 1, lift: k === 'eng' ? 1.0 : 1.2 })).join('');

function companyStill() {
  const P = PC; let s = cityGround(P);
  for (const k of KEYS) if (DOM[k].heat > 0.3) s += heatPool(P, k, 60 + 110 * DOM[k].heat, 0.7);
  s += cityBuildings(P);
  s += people(P, 'eng', 22, 1) + people(P, 'design', 8, 2) + people(P, 'support', 10, 3) + people(P, 'mkt', 7, 4);
  // the dark district: Compliance under a coral alarm (DPA late) and the stuck chore at the water tower
  const [lx, ly] = at('comp', 5.6); s += `<circle cx="${r1(lx)}" cy="${r1(ly)}" r="16" style="fill:var(--coral);opacity:.35" filter="url(#cb)"/><circle cx="${r1(lx)}" cy="${r1(ly)}" r="4" style="fill:var(--coral)"/>`;
  const [tx, ty] = at('ops', 0.2, 1.6, 1.4); s += barrier(tx, ty - 6, 0.8);
  s += signs(P);
  const [ex, ey] = at('eng', 11.5); s += flag(ex + 112, ey + 70, 'Store go/no-go', { needs: 1 }) + avatar(ex - 108, ey + 20, 'N', 'var(--acc)') + avatar(ex - 84, ey + 20, '✦', 'var(--ai)');
  const [lx2, ly2] = at('lead', 7); s += flag(lx2 - 30, ly2 + 92, 'Europe first', { needs: 1 });
  return citySvg(s) + chrome(CH());
}

// cost: land value. Buildings become pale wireframes, the ground is shaded by spend; AI cost lights the rooftops teal
function costStill() {
  const P = PC; let s = cityGround(P, { zone: (k) => `color-mix(in srgb,var(--fg) ${Math.round(6 + 52 * DOM[k].spend)}%,var(--city-ground))` });
  s += cityBuildings(P, { lot: (l) => ({ wire: true }), lm: (k) => ({ box: { wire: true } }) });
  for (const k of KEYS) { const a = DOM[k].ai * DOM[k].spend; if (a < 0.1) continue; const [x, y] = at(k, 0); s += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(40 + 150 * a)}" ry="${r1((40 + 150 * a) * 0.5)}" style="fill:var(--ai);opacity:${r1(0.12 + 0.3 * a)}" filter="url(#cb)"/>`; }
  s += signs(P, { dim: ['eng', 'support', 'mkt', 'ops'] });
  return citySvg(s) + chrome(LCH('Cost', 'coins', { text: 'Land value is spend: the brighter the ground, the more a district costs. The teal glow is the AI share, pooling over Support and Engineering.', legend: ramp(['color-mix(in srgb,var(--fg) 8%,var(--city-ground))', 'color-mix(in srgb,var(--fg) 58%,var(--city-ground))'], 'less', 'more spend') + keyRow([[sw('background:var(--ai)'), 'AI cost']]) }));
}
// progress: each building is solid up to its done share, the rest a dashed frame (under construction)
function progressStill() {
  const P = PC; let s = cityGround(P);
  s += cityBuildings(P, { lot: (l) => ({ built: clamp(DOM[l.k].done * (0.7 + ((l.seed % 7) / 10))), lit: 0.85 }), lm: (k) => ({ box: { built: DOM[k].done }, lit: 0.85 }) });
  s += signs(P, { dim: ['eng', 'comp', 'mkt', 'fin', 'design'] });
  return citySvg(s) + chrome(LCH('Progress', 'construction', { text: 'Every building stands as high as it is done; the dashed frame above is what is still to build. Finance and Design are nearly complete; Compliance and Marketing are mostly scaffolding.', legend: keyRow([[sw('background:var(--win)', 'sq'), 'built'], [sw('border:1px dashed var(--fg);background:transparent', 'sq'), 'still to build']]) }));
}
// issues: smoke over Support (within limits), a fire beacon in Engineering (failing), a siren in Compliance (breached)
function plume(P, k, dx, dy, z, tone, scale = 1) {
  const [x, y] = at(k, z, dx, dy, P); const col = tone === 'coral' ? 'var(--coral)' : tone === 'amber' ? 'var(--amber)' : 'var(--fg)';
  let s = ''; for (let i = 0; i < 5; i++) s += `<circle cx="${r1(x + i * 9 * scale + Math.sin(i) * 6)}" cy="${r1(y - i * 18 * scale)}" r="${r1((8 + i * 5) * scale)}" style="fill:color-mix(in srgb,${col} ${tone === 'neutral' ? 30 : 55}%,transparent);opacity:${r1(0.75 - i * 0.12)}"/>`;
  if (tone !== 'neutral') s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(22 * scale)}" style="fill:${col};opacity:.45" filter="url(#cb)"/><circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(4 * scale)}" style="fill:${col}"/>`;
  return s;
}
function issuesStill() {
  const P = PC; let s = cityGround(P, { zone: (k) => `color-mix(in srgb,var(--fg) ${Math.round(4 + 26 * DOM[k].issues * (k === 'support' ? 1 : 0.6))}%,var(--city-ground))` });
  s += cityBuildings(P, { lot: () => ({ op: 0.55, lit: 0.2 }), lm: () => ({ op: 0.6, lit: 0.2 }) });
  s += plume(P, 'support', 0, 0, 5.4, 'neutral', 1.2) + plume(P, 'support', 2, -1, 2, 'neutral', 0.8) + plume(P, 'eng', 1.5, 1.6, 4, 'amber', 1) + plume(P, 'comp', 0, 0, 6, 'coral', 1.1);
  s += signs(P, { dim: ['support', 'eng', 'comp'] });
  const [ax, ay] = at('eng', 3, 1.5, 1.6); s += T(ax + 30, ay + 26, 'Integration suite failing', { size: 13.5, font: 'u', w: 600, anchor: 'start', halo: 'var(--city-ground)' });
  const [cx, cy] = at('comp', 5, 0, 0); s += T(cx + 36, cy + 40, 'DPA signature late', { size: 13.5, font: 'u', w: 600, anchor: 'start', halo: 'var(--city-ground)' });
  return citySvg(s) + chrome(LCH('Issues', 'siren', { text: 'Issues rise as smoke from the districts they come from; the ground darkens with the load. Support smokes the most but is inside its service levels. Only the failing suite and the late signature raise a beacon.', legend: keyRow([[sw('background:color-mix(in srgb,var(--fg) 35%,transparent)'), 'issues, within limits'], [sw('background:var(--amber)'), 'failing'], [sw('background:var(--coral)'), 'breached']]) }));
}
// dependencies: roads and traffic between districts, critical route bright, the jam at the blocked junction
const ROUTE = { crit: [['ops', 1.2, 1.2], ['ops', 3, -0.5], ['eng', -2.2, 1.6], ['eng', 1.2, 2.6], ['mkt', -2.2, 0.2], ['mkt', 0, 0]], comp: [['comp', -0.8, 1], ['mkt', 0.6, -2.2], ['mkt', 0, 0]], others: [[['prod', 0, 0], ['eng', -1, -2]], [['design', 0, 0], ['eng', 1.6, -1.2]], [['eng', 0.6, 2], ['support', 0, 0]], [['fin', 0, 0], ['mkt', 1.5, 1.5]], [['lead', 0, 0], ['prod', -1.5, 0]], [['people', 0, 0], ['support', -1.5, 0.5]], [['sales', 0, 0], ['ops', -1, -1]]] };
const routeD = (pts, P = PC, z = 0.15) => smooth(pts.map(([k, dx, dy]) => at(k, z, dx, dy, P)), false);
function cars(d, n, seed) { return `<path d="${d}" style="fill:none;stroke:var(--fg);stroke-width:3.4;stroke-dasharray:1.5 ${r1(220 / n)};stroke-linecap:round;opacity:.9"/>`; }
function depsStill() {
  const P = PC; let s = cityGround(P, { avw: 2 });
  s += cityBuildings(P, { lot: () => ({ op: 0.3, lit: 0.1 }), lm: () => ({ op: 0.45, lit: 0.1 }) });
  for (const r of ROUTE.others) { const d = routeD(r); s += `<path d="${d}" style="fill:none;stroke:var(--road);stroke-width:5;opacity:.35;stroke-linecap:round"/>` + cars(d, 6); }
  const dc = routeD(ROUTE.crit); s += `<path d="${dc}" style="fill:none;stroke:var(--glow);stroke-width:18;opacity:.2;stroke-linecap:round"/><path d="${dc}" style="fill:none;stroke:var(--road);stroke-width:8;stroke-linecap:round"/><path d="${dc}" style="fill:none;stroke:var(--street);stroke-width:1.4;stroke-dasharray:6 8"/>`;
  const dp = routeD(ROUTE.comp); s += `<path d="${dp}" style="fill:none;stroke:var(--road);stroke-width:6;opacity:.7;stroke-linecap:round"/>`;
  // the jam: cars backed up behind the barrier at the Operations junction
  const [jx, jy] = at('ops', 0.15, 3, -0.5); for (let i = 0; i < 6; i++) { const [cx, cy] = at('ops', 0.15, 2.6 - i * 0.32, -0.3 + i * 0.12); s += `<rect x="${r1(cx - 4)}" y="${r1(cy - 3)}" width="8" height="6" rx="2" style="fill:var(--fg)"/>`; }
  s += barrier(jx + 10, jy - 8, 1);
  const [bx, by] = at('comp', 0.15, -0.8, 1.4); s += barrier(bx, by - 8, 0.9);
  s += signs(P, { dim: ['ops', 'eng', 'mkt', 'comp'] });
  return citySvg(s) + chrome(LCH('Dependencies', 'route', { text: 'Roads are dependencies and the cars on them are items in transit. The wide road is the critical route to the beta launch; traffic is backed up at the Operations junction and the road from Compliance is closed.', legend: keyRow([[sw('background:var(--road)', 'line'), 'critical route'], [sw('background:color-mix(in srgb,var(--road) 40%,transparent)', 'line'), 'dependency'], [sw('background:var(--coral)', 'sq'), 'closed']]) }));
}
// power (City's own): decisions and goals are the power plant; lines on pylons feed each district; Compliance's is cut
function pylonLine(P, a, b, cut, col = 'var(--glow)') {
  const A = at(a, 4.2, 0, 0, P), B = at(b, 3.2, 0, 0, P); const m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + 30];
  if (!cut) return `<path d="M${r1(A[0])} ${r1(A[1])}Q${r1(m[0])} ${r1(m[1])} ${r1(B[0])} ${r1(B[1])}" style="fill:none;stroke:${col};stroke-width:2;opacity:.9"/><path d="M${r1(A[0])} ${r1(A[1])}Q${r1(m[0])} ${r1(m[1])} ${r1(B[0])} ${r1(B[1])}" style="fill:none;stroke:#fff;stroke-width:2;stroke-dasharray:2 14;opacity:.9"/>`;
  const c = [lerp(A[0], B[0], 0.62), lerp(A[1], B[1], 0.62) + 22];
  return `<path d="M${r1(A[0])} ${r1(A[1])}Q${r1(lerp(A[0], c[0], 0.5))} ${r1(lerp(A[1], c[1], 0.5) + 18)} ${r1(c[0])} ${r1(c[1])}" style="fill:none;stroke:${col};stroke-width:2"/><path d="M${r1(c[0] + 18)} ${r1(c[1] + 14)}Q${r1(lerp(c[0], B[0], 0.5))} ${r1(lerp(c[1], B[1], 0.5) + 16)} ${r1(B[0])} ${r1(B[1])}" style="fill:none;stroke:var(--fg);stroke-width:1.6;opacity:.4;stroke-dasharray:4 4"/>`
    + `<circle cx="${r1(c[0] + 9)}" cy="${r1(c[1] + 7)}" r="14" style="fill:var(--coral);opacity:.4" filter="url(#cb)"/>` + G('bolt', c[0] + 9, c[1] + 7, 18, 'var(--coral)', { sw: 2 });
}
function powerStill() {
  const P = PC; let s = cityGround(P, { darkK: 'comp' });
  s += cityBuildings(P, { lot: (l) => (l.k === 'comp' ? { lit: 0.0, dark: true } : { op: 0.55 }), lm: (k) => (k === 'comp' ? { lit: 0, box: { dark: true } } : { op: 0.6 }) });
  for (const k of KEYS) if (k !== 'lead') s += pylonLine(P, 'lead', k, k === 'comp');
  const [lx, ly] = at('lead', 4.6); s += `<circle cx="${r1(lx)}" cy="${r1(ly)}" r="60" style="fill:url(#cg)"/>`;
  s += signs(P, { focus: 'lead', dim: ['lead', 'comp', 'eng', 'mkt'] });
  const [cx, cy] = at('comp', 0, -1, 2.5); s += T(cx + 40, cy + 40, 'Missing decision: DPA signature', { size: 13.5, font: 'u', w: 600, halo: 'var(--city-ground)' });
  return citySvg(s) + chrome(LCH('Power', 'zap', { text: 'Decisions and goals are the power plant; every district runs on the decisions that feed it. Compliance is dark because its line is cut: the DPA signature is a missing decision.', legend: keyRow([[sw('background:var(--glow)', 'line'), 'decision power'], [sw('background:var(--coral)'), 'cut line']]) }));
}
// the problem picture: the plumbing view. Work flows as water through pipes under the streets; the dispatcher pipe is
// clogged and items back up; the power line to Compliance is cut and the district is dark; Marketing's basin is dry.
function pipe(P, pts, w, o = {}) { const d = smooth(pts.map((p) => P(...p)), false); return `<path d="${d}" style="fill:none;stroke:var(--pipe-wall);stroke-width:${w + 5};stroke-linecap:round;opacity:${o.op ?? 1}"/><path d="${d}" style="fill:none;stroke:${o.col || 'var(--pipe)'};stroke-width:${w};stroke-linecap:round;opacity:${o.op ?? 1}${o.dash ? ';stroke-dasharray:' + o.dash : ''}"/>`; }
function problemStill() {
  const P = PC; let s = cityGround(P, { darkK: 'comp', zone: (k) => `color-mix(in srgb,${hue(k)} 12%,var(--city-ground))` });
  s += cityBuildings(P, { lot: (l) => (l.k === 'comp' ? { dark: true, lit: 0 } : { op: ['ops', 'eng', 'mkt'].includes(l.k) ? 0.4 : 0.18, lit: 0.3 }), lm: (k) => (k === 'comp' ? { lit: 0, box: { dark: true } } : { op: ['ops', 'eng', 'mkt'].includes(k) ? 0.8 : 0.2, lit: 0.4 }) });
  const [ox, oy] = CENTER.ops, [ex, ey] = CENTER.eng, [mx, my] = CENTER.mkt;
  // mains: Operations' water tower feeds the dispatcher, the dispatcher feeds the store, the store feeds Marketing
  s += pipe(P, [[ox, oy, 0], [ox + 2, oy - 1, 0], [ex - 3, ey + 2, 0]], 7);
  s += pipe(P, [[ex - 3, ey + 2, 0], [ex - 0.5, ey + 3.4, 0], [ex + 2, ey + 3, 0]], 7, { col: 'color-mix(in srgb,var(--pipe) 30%,transparent)' });
  s += pipe(P, [[ex + 2, ey + 3, 0], [mx - 2, my + 0.5, 0], [mx, my, 0]], 7, { col: 'color-mix(in srgb,var(--pipe) 15%,transparent)', dash: '3 6' });
  // the clog: the pipe swells before the dispatcher valve, items backed up inside it
  const [cx, cy] = P(ex - 3, ey + 2, 0); s += `<ellipse cx="${r1(cx - 30)}" cy="${r1(cy - 4)}" rx="46" ry="20" transform="rotate(-27 ${r1(cx - 30)} ${r1(cy - 4)})" style="fill:var(--pipe);stroke:var(--pipe-wall);stroke-width:4"/>`;
  for (let i = 0; i < 7; i++) s += `<rect x="${r1(cx - 64 + i * 10)}" y="${r1(cy + 10 - i * 5.2 - 8)}" width="8" height="8" rx="1.5" transform="rotate(-27 ${r1(cx - 60 + i * 10)} ${r1(cy + 6 - i * 5.2)})" style="fill:var(--fg)"/>`;
  s += `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="40" style="fill:var(--coral);opacity:.3" filter="url(#cb)"/><circle cx="${r1(cx)}" cy="${r1(cy)}" r="13" style="fill:var(--ground-base);stroke:var(--coral);stroke-width:3"/><path d="M${r1(cx - 7)} ${r1(cy)}h14" style="stroke:var(--coral);stroke-width:3;stroke-linecap:round"/>`;
  // the stuck chore at the source: the water tower's valve is closed (the Railway token)
  const [tx, ty] = at('ops', 3.6); s += `<g transform="translate(${r1(tx + 36)} ${r1(ty - 6)})"><rect x="-14" y="-14" width="28" height="28" rx="8" style="fill:var(--g3);stroke:var(--coral);stroke-width:2"/>${G('envelope', 0, 0, 16, 'var(--fg)')}</g>`;
  s += pylonLine(P, 'lead', 'comp', true);
  s += sign(P, 'ops', { label: 'Railway token', lift: 2.6 }) + sign(P, 'eng', { big: true }) + sign(P, 'comp') + sign(P, 'mkt', { label: 'Marketing waits' });
  s += T(cx + 20, cy + 44, 'Dispatcher clogged', { size: 15, anchor: 'start', halo: 'var(--city-ground)', hw: 5 }) + T(cx + 20, cy + 62, 'items backed up since Oct 26', { size: 13, font: 'u', w: 500, anchor: 'start', fill: 'var(--muted)', halo: 'var(--city-ground)' });
  const [sx2, sy2] = P(ex + 2, ey + 3, 0); s += `<circle cx="${r1(sx2)}" cy="${r1(sy2)}" r="6" style="fill:var(--ground-base);stroke:var(--fg);stroke-width:2"/>` + T(sx2 + 12, sy2 + 18, 'Store submission', { size: 13.5, font: 'u', w: 600, anchor: 'start', halo: 'var(--city-ground)' });
  return citySvg(s) + chrome({ crumb: ['Company'], right: [{ i: 'eye', t: 'Owner' }, { i: 'search', t: 'What is stuck?', on: true }], finding: { icon: 'droplets', pos: 'bl', title: 'A clogged main and a dark district', text: 'The Railway token valve is shut, so the dispatcher main is clogged and items back up; the store submission and Marketing run dry. Compliance is dark: its power line is cut at the DPA signature.' } });
}

// ---------- Engineering district (Z1): blocks = programs ----------
const PD = ISO(720, 40, 44, 1);
const BLOCKS = { beta: [3, 2, 5, 4], ios: [10, 1, 4, 4], eu: [11, 7, 4, 4], evals: [2, 8, 4, 3], platform: [7, 8, 3, 4] };
function domainStill() {
  const P = PD; let s = '';
  const wp = [P(-3, -3), P(19, -3), P(19, 16), P(-3, 16)]; s += `<path d="${pth(wp)}" style="fill:color-mix(in srgb,var(--h-build) 14%,var(--city-ground))"/>`;
  // neighbours at the edges
  s += `<path d="${pth([P(15.5, -3), P(19, -3), P(19, 16), P(15.5, 16)])}" style="fill:color-mix(in srgb,var(--h-govern) 18%,var(--city-ground))"/><path d="${pth([P(-3, 13), P(15.5, 13), P(15.5, 16), P(-3, 16)])}" style="fill:color-mix(in srgb,var(--h-run) 14%,var(--city-ground))"/>`;
  // streets between blocks
  let st = ''; for (let i = -3; i <= 19; i += 0.5) { } for (const v of [0.4, 6.4, 12.4]) st += `M${r1(P(-3, v)[0])} ${r1(P(-3, v)[1])}L${r1(P(19, v)[0])} ${r1(P(19, v)[1])}`; for (const u of [0.6, 8.8, 15.2]) st += `M${r1(P(u, -3)[0])} ${r1(P(u, -3)[1])}L${r1(P(u, 16)[0])} ${r1(P(u, 16)[1])}`;
  s += `<path d="${st}" style="fill:none;stroke:var(--street);stroke-width:14;opacity:.9"/><path d="${st}" style="fill:none;stroke:var(--glow);stroke-width:1;stroke-dasharray:6 8;opacity:.4"/>`;
  // the EU residency block crosses the avenue into Compliance: one hull
  const [ex, ey, ew, ed] = BLOCKS.eu; s += `<path d="${pth([P(ex - 0.4, ey - 0.4), P(ex + ew + 4.6, ey - 0.4), P(ex + ew + 4.6, ey + ed + 0.4), P(ex - 0.4, ey + ed + 0.4)])}" style="fill:color-mix(in srgb,var(--h-govern) 8%,transparent);stroke:var(--h-govern);stroke-width:1.6;stroke-dasharray:7 5"/>`;
  const items = []; const R = rng(5);
  for (const [k, [bx, by, bw, bd]] of Object.entries(BLOCKS)) { const e = ENG[k]; s += `<path d="${pth([P(bx, by), P(bx + bw, by), P(bx + bw, by + bd), P(bx, by + bd)])}" style="fill:color-mix(in srgb,var(--h-build) 22%,var(--city-ground));stroke:color-mix(in srgb,var(--fg) 25%,transparent);stroke-width:1"/>`;
    for (let y = by; y < by + bd; y++) for (let x = bx; x < bx + bw; x++) { if (R() > 0.72) continue; const h = 0.6 + R() * e.work * 3.2; items.push({ z: x + y, svg: box(P, x + 0.14, y + 0.14, 0.72, 0.72, h, 'var(--h-build)', { lit: clamp(e.done * (0.7 + R() * 0.6)), seed: x * 31 + y * 7, wf: 2.6, wc: 2.6 }) }); } }
  // neighbours' buildings, dim
  for (let y = -2; y < 15; y++) for (let x = 16; x < 19; x++) if (R() > 0.5) items.push({ z: x + y, svg: box(P, x + 0.2, y + 0.2, 0.6, 0.6, 0.5 + R() * 1.6, 'var(--h-govern)', { lit: 0, op: 0.55, seed: x * 9 + y }) });
  for (let y = 13; y < 16; y++) for (let x = -2; x < 15; x++) if (R() > 0.55) items.push({ z: x + y, svg: box(P, x + 0.2, y + 0.2, 0.6, 0.6, 0.4 + R() * 1.2, 'var(--h-run)', { lit: 0.4, op: 0.55, seed: x * 5 + y }) });
  items.sort((a, b) => a.z - b.z); s += items.map((i) => i.svg).join('');
  const hp = (k) => { const [bx, by, bw, bd] = BLOCKS[k]; const [x, y] = P(bx + bw, by + bd, 0); return [x - 20, y + 52]; };
  for (const k of Object.keys(BLOCKS)) { const [x, y] = hp(k); const e = ENG[k]; const big = k === 'beta'; const nm = e.name; const w = (big ? 64 : 44) + nm.length * (big ? 12.6 : 8.4), hg = big ? 46 : 32, r = hg / 2;
    s += `<g><rect x="${r1(x - w / 2)}" y="${r1(y - hg)}" width="${r1(w)}" height="${hg}" rx="${r}" style="fill:var(--g3);stroke:color-mix(in srgb,var(--h-build) 55%,transparent)"/><circle cx="${r1(x - w / 2 + r)}" cy="${r1(y - r)}" r="${r - 4}" style="fill:color-mix(in srgb,var(--h-build) 25%,var(--ground-base))"/>${ring(x - w / 2 + r, y - r, r - 4, e.done, 'var(--h-build)', { w: 2.2, forecast: e.fc })}${G(e.lm, x - w / 2 + r, y - r, (r - 4) * 1.25, 'color-mix(in srgb,var(--h-build) 70%,var(--fg))')}${T(x - w / 2 + hg + 6, y - r + (big ? 7.5 : 5), nm, { size: big ? 21 : 14.5, anchor: 'start' })}</g>`; }
  const [bx, by] = hp('beta'); s += flag(bx + 130, by - 50, 'Store go/no-go', { needs: 1 }) + avatar(bx - 130, by - 18, 'N', 'var(--acc)') + avatar(bx - 106, by - 18, '✦', 'var(--ai)');
  // neighbours' names
  s += T(P(17.2, 1)[0], P(17.2, 1)[1] - 30, 'Compliance', { size: 15, op: 0.6 }) + T(P(5, 14.5)[0], P(5, 14.5)[1] + 10, 'Operations', { size: 15, op: 0.6 });
  // the jam entering from Operations
  const [jx, jy] = P(3.5, 12.4); s += barrier(jx, jy - 8, 1);
  s += G('skyline', 92, 128, 44, 'color-mix(in srgb,var(--h-build) 70%,var(--fg))', { sw: 1.6, op: 0.75 });
  return `<svg class="world" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs>${cityDefs()}</defs>${s}</svg>` + chrome({ crumb: ['Company', 'Engineering'], right: [{ i: 'eye', t: 'CTO' }, { i: 'layers', t: 'Layers' }] }) + `<div class="cont" style="position:absolute;right:28px;top:430px"><span class="chip"><i data-lucide="chevrons-right" class="ic"></i>EU residency continues into Compliance</span></div>`;
}

// ---------- Private beta block (Z2): street level, facades as shopfronts ----------
const PB = ISO(700, 150, 80, 1);
// a building whose front-left face carries the facade (the product), mapped onto the iso face with an affine transform
function shop(P, x, y, w, d, h, kind, o = {}) {
  let s = box(P, x, y, w, d, h, 'var(--h-build)', { win: false, op: o.ghost ? 0.35 : 1, cols: { tm: 30, lm: 18, rm: 12 } });
  const a = P(x, y + d, h * 0.86), b = P(x + w, y + d, h * 0.86), c = P(x, y + d, h * 0.1); // top-left, top-right, bottom-left of the facade area
  const fw = 160, fh = 110; const m = [(b[0] - a[0]) / fw, (b[1] - a[1]) / fw, (c[0] - a[0]) / fh, (c[1] - a[1]) / fh, a[0], a[1]].map((v) => r1(v * 1000) / 1000);
  s += `<g transform="matrix(${m.join(' ')})">${facade(kind, 0, 0, fw, fh, { ghost: o.ghost })}</g>`;
  if (o.crit != null) { const [rx, ry] = P(x + w, y + d, h + 0.12); s += `<circle cx="${r1(rx)}" cy="${r1(ry)}" r="10" style="fill:var(--ground-base)"/>` + ring(rx, ry, 8, o.crit, o.crit === 1 ? 'var(--good)' : 'var(--glow)', { w: 2.6 }); }
  return s;
}
function programStill() {
  const P = PB; let s = '';
  s += `<path d="${pth([P(-2, -2), P(9, -2), P(9, 9), P(-2, 9)])}" style="fill:color-mix(in srgb,var(--h-build) 12%,var(--city-ground))"/>`;
  // four lots (streams) separated by streets; pavement tints by stream progress
  const LOT = { dispatcher: [0, 0, 3.3, 3.2], relay: [4, 0, 3.6, 3.2], evals: [0, 4, 3.3, 3.2], store: [4, 4, 3.6, 3.2] }; const PR = { dispatcher: 0.42, relay: 0.72, evals: 0.82, store: 0.36 };
  for (const [k, [x, y, w, d]] of Object.entries(LOT)) s += `<path d="${pth([P(x, y), P(x + w, y), P(x + w, y + d), P(x, y + d)])}" style="fill:color-mix(in srgb,var(--glow) ${Math.round(6 + 16 * PR[k])}%,var(--city-ground));stroke:color-mix(in srgb,var(--fg) 30%,transparent)"/>`;
  let st = `M${r1(P(-2, 3.6)[0])} ${r1(P(-2, 3.6)[1])}L${r1(P(9, 3.6)[0])} ${r1(P(9, 3.6)[1])}M${r1(P(3.65, -2)[0])} ${r1(P(3.65, -2)[1])}L${r1(P(3.65, 9)[0])} ${r1(P(3.65, 9)[1])}`;
  s += `<path d="${st}" style="fill:none;stroke:var(--street);stroke-width:30"/><path d="${st}" style="fill:none;stroke:var(--glow);stroke-width:1.4;stroke-dasharray:10 12;opacity:.4"/>`;
  // the critical route along the street to the gate (archway at the block's exit)
  const cr = [P(1.8, 3.6, 0.02), P(4.8, 3.6, 0.02), P(7.6, 3.6, 0.02), P(9.4, 3.6, 0.02)];
  s += `<path d="${poly(cr)}" style="fill:none;stroke:var(--glow);stroke-width:16;opacity:.25;stroke-linecap:round"/><path d="${poly(cr)}" style="fill:none;stroke:var(--road);stroke-width:4;stroke-linecap:round"/>`;
  const B = []; const add = (z, svg) => B.push({ z, svg });
  add(1.2, shop(P, 0.3, 0.3, 1.3, 0.9, 1.25, 'chart', { crit: 0.66 })); add(2.4, shop(P, 1.9, 0.5, 1.2, 0.9, 1.0, 'term', { crit: 1 }));
  add(5.2, shop(P, 4.3, 0.3, 1.4, 0.9, 1.3, 'screens', { crit: 0.83 })); add(6.3, shop(P, 6.0, 0.6, 1.3, 0.9, 1.1, 'screens', { ghost: true }));
  add(5.4, shop(P, 0.3, 4.4, 1.5, 1.0, 1.6, 'doc', { crit: 1 })); add(6.6, shop(P, 2.0, 4.9, 1.2, 0.9, 0.9, 'doc', { crit: 0.5 }));
  add(8.5, shop(P, 4.3, 4.4, 1.4, 1.0, 1.25, 'build', { crit: 0.8 })); add(9.8, shop(P, 6.0, 4.6, 1.4, 1.0, 1.15, 'listing', { ghost: true }));
  B.sort((a, b) => a.z - b.z); s += B.map((b) => b.svg).join('');
  // the evals report is finished: a landmark glow
  const [lx, ly] = P(1.05, 4.9, 1.2); s += `<circle cx="${r1(lx)}" cy="${r1(ly)}" r="70" style="fill:url(#cg);opacity:.5"/>`;
  // the stuck chore: a utility van with the envelope, stopped at the barrier where the Operations street enters
  const [vx, vy] = P(-1.0, 3.6, 0.1); s += barrier(vx + 44, vy + 18, 1.2) + `<g transform="translate(${r1(vx - 6)} ${r1(vy + 4)})"><rect x="-22" y="-14" width="44" height="28" rx="7" style="fill:var(--g3);stroke:var(--coral);stroke-width:2"/>${G('envelope', 0, 0, 18, 'var(--fg)')}</g>`;
  // gate
  const [gx, gy] = P(9.2, 3.6, 0); s += `<g><path d="M${r1(gx - 34)} ${r1(gy)}v-60a34 34 0 0 1 68 0v60" style="fill:none;stroke:var(--fg);stroke-width:5;opacity:.85"/>${ring(gx, gy - 92, 22, 0.58, 'var(--h-build)', { w: 3, forecast: 0.66 })}${G('gate', gx, gy - 92, 22, 'var(--fg)')}${T(gx, gy + 30, 'Gate 1 Alpha', { size: 17, halo: 'var(--city-ground)' })}</g>`;
  // stream names on the pavement
  for (const [k, [x, y]] of Object.entries({ dispatcher: [0.2, 2.9], relay: [4.2, 2.9], evals: [0.2, 7.0], store: [4.2, 7.0] })) { const [px, py] = P(x, y, 0); s += `<g><circle cx="${r1(px + 16)}" cy="${r1(py - 4)}" r="14" style="fill:var(--g3)"/>${ring(px + 16, py - 4, 14, PR[k], 'var(--h-build)', { w: 2.2 })}${G(STREAMS[k].lm, px + 16, py - 4, 15, 'var(--fg)')}${T(px + 38, py + 1, STREAMS[k].name, { size: 15, anchor: 'start', halo: 'var(--city-ground)' })}</g>`; }
  // hovered shop
  const [hx, hy] = P(0.3, 0.3, 1.7); s += `<g><rect x="${r1(hx - 380)}" y="${r1(hy - 20)}" width="300" height="56" rx="14" style="fill:var(--g3);stroke:color-mix(in srgb,#fff 25%,transparent)"/>${T(hx - 366, hy + 3, 'Dispatcher sequencing under load', { size: 14.5, anchor: 'start' })}${T(hx - 366, hy + 23, '4 of 6 criteria met · Noa · doing since Oct 26', { size: 12.5, anchor: 'start', font: 'u', w: 500, fill: 'var(--muted)' })}</g>`;
  const mini = `<svg viewBox="0 0 150 96">${[[30, 30], [60, 22], [90, 34], [50, 56], [86, 60]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="${i ? 18 : 24}" height="${i ? 14 : 20}" rx="3" style="fill:${i ? 'none' : 'color-mix(in srgb,var(--acc) 35%,transparent)'};stroke:${i ? 'var(--glow)' : 'var(--acc)'};stroke-width:1.4;opacity:${i ? 0.5 : 1}"/>`).join('')}</svg>`;
  return `<svg class="world" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs>${cityDefs()}</defs>${s}</svg>` + chrome({ crumb: ['Engineering', 'Private beta', 'Wave 71'], right: [{ i: 'layout-grid', t: 'As a board' }], mini });
}

// ---------- phone ----------
function phoneStill() {
  const P = ISO(212, -10, 17, 1); let s = cityGround(P, { avw: 2 });
  s += heatPool(P, 'eng', 90, 0.7) + cityBuildings(P);
  for (const k of ['eng', 'ops', 'support']) s += sign(P, k, { big: k === 'eng', lift: k === 'eng' ? 0.6 : 1 });
  const card = `<div class="pcard" data-needs="1"><div class="pc-h"><svg viewBox="0 0 24 24" width="22" height="22">${G('flag', 12, 12, 22, 'var(--f-rules)')}</svg><b>Store go/no-go</b></div><p>The dispatcher main is clogged; the beta slips a week unless the Railway token lands today.</p><div class="pills"><span class="chip on">Open the fork</span><span class="chip">Later</span></div></div>`;
  return `<div class="status" data-ambient><span>9:41</span><span>●●●</span></div>` + citySvg(s, { w: PW, h: PH }) + chrome({ crumb: ['Company'], right: [{ i: 'layers', t: 'Layers' }], talk: false }) + card;
}

export function stills() {
  return [
    { id: 'company', sky: true, glance: true, title: 'Company depth: the city at night', html: companyStill(), caption: 'Eleven districts zoned in their family hue on one island; each has its landmark building (Engineering\'s towers, Compliance\'s lighthouse, Marketing\'s harbour, Finance\'s vault, Operations\' water tower) and a sign with its ring. Buildings are items, as tall as their effort; lit windows are done work. Engineering glows (busy tonight), Partnerships is dark and still; the lighthouse flashes coral (DPA late) and a barrier closes the Operations junction. The programs are the blocks inside each district, already visible as clusters.' },
    { id: 'domain', title: 'Domain depth: the Engineering district', html: domainStill(), caption: 'Closer, the district\'s blocks are its programs, each with a sign and ring; the beta block is the tallest and busiest. Compliance and Operations border it, dimmed, as they did on the skyline; EU residency is one dashed lot that crosses the avenue into Compliance. The barrier where the Operations street enters is the stuck chore.' },
    { id: 'program', title: 'Program depth: the beta block at street level', html: programStill(), caption: 'Four lots (streams) around a crossing; every building\'s shopfront is its product (the dispatcher chart, the Relay screens, the evals report, the iOS build); unbuilt ones are glass shells with a ghost facade. The critical street leads to the Gate 1 Alpha archway; the Operations street is barred with the token van stopped at it.' },
    { id: 'cost', glance: true, title: 'Layer: land value (cost)', html: costStill(), caption: 'The city turns to wireframe and the ground is shaded by spend, SimCity\'s land-value overlay; AI cost pools in teal under the districts that spend it.' },
    { id: 'progress', glance: true, title: 'Layer: construction (progress)', html: progressStill(), caption: 'Every building is built up to its done share and scaffolded (dashed) above; a district that is mostly frames is a district that is mostly still to do.' },
    { id: 'issues', glance: true, title: 'Layer: smoke and sirens (issues)', html: issuesStill(), caption: 'Issues rise as smoke from where they come from and darken the ground; a beacon only where something fails or breaches.' },
    { id: 'deps', glance: true, title: 'Layer: roads and traffic (dependencies)', html: depsStill(), caption: 'The buildings fade, the roads light up with their traffic (items in transit); the critical route is the wide road, jammed behind the Operations barrier; the Compliance road is closed.' },
    { id: 'power', glance: true, title: 'Layer: power (City\'s own: decisions and goals)', html: powerStill(), caption: 'Leadership is the power plant; each district is fed by the decisions it runs on. Compliance\'s line is cut at the DPA signature and its windows are dark.' },
    { id: 'problem', glance: true, title: 'The problem picture: a clogged main and a dark district', html: problemStill(), caption: 'The plumbing view (streets turn to glass): the Railway token valve at the water tower is shut, the dispatcher main swells and items back up inside it, the pipes to the store submission and Marketing run thin and dry; Compliance is dark with its power line cut and sparking.' },
    { id: 'company', phone: true, glance: true, title: 'Phone: the skyline', html: phoneStill(), caption: 'The city survives a phone as a skyline: Engineering\'s towers centred, its neighbours\' signs at the sides; the one thing that needs the owner is the card.' },
  ];
}
