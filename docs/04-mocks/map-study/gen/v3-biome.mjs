// V3 Biome: the company as living tissue under a microscope. Places are cells (size = open work) whose nuclei are their
// programs, visible before you zoom; vessels carry work between them (bead spacing = velocity); a healthy cell is clear
// and luminous, a stale one grey and shrunken; heat is a glow, lessons are scar tissue. Layers are stains applied to the
// same slide. Zooming is turning the objective: the cell fills the lens, then the nucleus, whose granules are buildings.
import { W, H, PW, PH, rng, r1, lerp, clamp, noise2, smooth, poly, blobPts, T, ring, G, flag, barrier, avatar, facade, chrome, ramp, keyRow, sw, haloFilter } from './lib.mjs';
import { DOM, hue, ENG, STREAMS } from './company.mjs';

export const meta = {
  n: 3, name: 'Biome', icon: 'microscope',
  line: 'The company as living tissue under a microscope.',
  intro: 'Places are cells whose nuclei are their programs, already visible on the slide; vessels between them carry the work, beads closer together where it flows faster. A healthy cell is clear and luminous, a neglected one greys and shrinks; heat is a soft fever glow, lessons leave scar tissue. Layers are stains on the same slide (cost, AI trust, maturity). Zooming is turning the objective: the Engineering cell fills the lens, then the beta nucleus, whose granules are its buildings.',
};

const C = { x: 740, y: 450, r: 405 };
const CELL = { eng: [700, 430, 150], prod: [540, 235, 85], design: [790, 200, 72], lead: [410, 350, 72], comp: [960, 280, 95], sales: [370, 490, 58], ops: [505, 580, 78], mkt: [980, 500, 110], fin: [1010, 690, 55], support: [790, 690, 90], people: [590, 735, 60] };
const KEYS = Object.keys(CELL);
const ENUC = { beta: [655, 395, 54], ios: [768, 352, 34], eu: [806, 468, 31], evals: [632, 502, 26], platform: [728, 528, 28] };

function defs(id) {
  return `<radialGradient id="${id}-lens" cx=".45" cy=".4" r=".7"><stop offset="0" style="stop-color:var(--lens2)"/><stop offset="1" style="stop-color:var(--lens)"/></radialGradient>`
    + `<radialGradient id="${id}-vig" cx=".5" cy=".5" r=".5"><stop offset=".86" style="stop-color:#000;stop-opacity:0"/><stop offset="1" style="stop-color:#000;stop-opacity:.45"/></radialGradient>`
    + `<radialGradient id="${id}-glow"><stop offset="0" style="stop-color:var(--glow);stop-opacity:.55"/><stop offset="1" style="stop-color:var(--glow);stop-opacity:0"/></radialGradient>`
    + `<clipPath id="${id}-clip"><circle cx="${C.x}" cy="${C.y}" r="${C.r}"/></clipPath>` + haloFilter(id + '-b', 10) + haloFilter(id + '-b2', 3);
}
// the microscope: dark scope around a round field, reticle ticks, a scale bar (no number)
function scope(id, inner) {
  let s = `<rect width="${W}" height="${H}" style="fill:var(--scope)"/>`;
  s += `<circle cx="${C.x}" cy="${C.y}" r="${C.r + 18}" style="fill:none;stroke:color-mix(in srgb,var(--fg) 12%,transparent);stroke-width:30"/>`;
  s += `<circle cx="${C.x}" cy="${C.y}" r="${C.r}" style="fill:url(#${id}-lens)"/>`;
  s += `<g clip-path="url(#${id}-clip)">${inner}<circle cx="${C.x}" cy="${C.y}" r="${C.r}" style="fill:url(#${id}-vig)"/></g>`;
  for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2, l = i % 6 === 0 ? 14 : 7; s += `<line x1="${r1(C.x + Math.cos(a) * (C.r + 6))}" y1="${r1(C.y + Math.sin(a) * (C.r + 6))}" x2="${r1(C.x + Math.cos(a) * (C.r + 6 + l))}" y2="${r1(C.y + Math.sin(a) * (C.r + 6 + l))}" style="stroke:var(--fg);stroke-width:1;opacity:.35"/>`; }
  s += `<line x1="${C.x + C.r - 150}" y1="${C.y + C.r - 60}" x2="${C.x + C.r - 70}" y2="${C.y + C.r - 60}" style="stroke:var(--fg);stroke-width:3;opacity:.5"/>`;
  return s;
}
// a cell: double membrane, cytoplasm, nuclei (its programs), granules (its items)
function cell(k, o = {}) {
  const [cx, cy, r0] = o.at || CELL[k]; const d = DOM[k] || {}; const hu = o.hue || hue(k);
  const stale = o.stale ?? d.stale ?? 0; const r = r0 * (1 - stale * 0.12); const seed = o.seed || cx + cy;
  const pts = blobPts(cx, cy, r, r * 0.94, seed, 22, 0.07, seed % 3); const inner = blobPts(cx, cy, r - 7, r * 0.94 - 7, seed, 22, 0.07, seed % 3);
  const ink = stale > 0.5 ? 'color-mix(in srgb,var(--fg) 45%,var(--lens))' : hu; const op = o.op ?? 1;
  let s = `<g class="cell"${op !== 1 ? ` opacity="${op}"` : ''}>`;
  s += `<path d="${smooth(pts)}" style="fill:${o.fill || `color-mix(in srgb,${ink} ${stale > 0.5 ? 6 : 13}%,var(--lens))`}"/>`;
  if (o.stain) s += `<path d="${smooth(inner)}" style="fill:${o.stain}"/>`;
  s += `<path d="${smooth(inner)}" style="fill:none;stroke:${ink};stroke-width:1;opacity:.45"/>`;
  s += `<path d="${smooth(pts)}" style="fill:none;stroke:${o.mem || ink};stroke-width:${o.memW || 2.2};opacity:.9"/>`;
  // nuclei
  const nuc = o.nuclei || defaultNuclei(k, cx, cy, r);
  for (const [nx, ny, nr, nm] of nuc) { const np = blobPts(nx, ny, nr, nr * 0.9, Math.round(nx + ny), 14, 0.1); s += `<path d="${smooth(np)}" style="fill:color-mix(in srgb,${ink} ${o.nucFill ?? 22}%,var(--lens));stroke:${ink};stroke-width:1.1;opacity:${o.nucOp ?? 0.75}"/>`;
    s += `<circle cx="${r1(nx + nr * 0.2)}" cy="${r1(ny - nr * 0.15)}" r="${r1(nr * 0.28)}" style="fill:${ink};opacity:.35"/>`; }
  // granules
  if (o.granules !== false) { const R = rng(seed + 3); const n = Math.round((o.gn ?? (10 + 30 * (d.work ?? 0.5))) * (1 - stale * 0.6)); let g = '';
    for (let i = 0; i < n; i++) { const a = R() * 6.283, rr = Math.sqrt(R()) * (r - 18); const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.94; if (nuc.some(([nx, ny, nr]) => Math.hypot(x - nx, y - ny) < nr + 4)) continue; g += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(1.2 + R() * 1.6)}"/>`; }
    s += `<g style="fill:${o.gcol || ink};opacity:${o.gop ?? 0.55}">${g}</g>`; }
  if (o.scar) { let sc = ''; for (let i = 0; i < 4; i++) { const y = cy + r * 0.45 + i * 5; sc += `M${r1(cx - r * 0.35)} ${r1(y)}q${r1(r * 0.12)} -6 ${r1(r * 0.24)} 0t${r1(r * 0.24)} 0t${r1(r * 0.24)} 0`; } s += `<path d="${sc}" style="fill:none;stroke:${ink};stroke-width:1;opacity:.4"/>`; }
  return s + '</g>';
}
function defaultNuclei(k, cx, cy, r) {
  if (k === 'eng') return Object.values(ENUC).map(([x, y, rr]) => [x, y, rr]);
  const R = rng(cx * 3 + cy); const n = 2 + Math.round((DOM[k]?.work ?? 0.3) * 2); const out = [];
  for (let i = 0; i < n; i++) { const a = R() * 6.28 + i * 2.1, rr = r * (0.18 + R() * 0.3); out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.9, r * (0.13 + R() * 0.08)]); }
  return out;
}
// label: glyph in its ring + name, centred on the cell top
function label(k, o = {}) {
  const [cx, cy, r] = o.at || CELL[k]; const d = o.d || DOM[k]; const hu = o.hue || hue(k); const big = o.big; const y = o.y ?? (cy - r * 0.62);
  const rr = big ? 17 : 12; const nm = o.name || d.name; const nameW = nm.length * (big ? 12.4 : 8.6);
  const x0 = cx - (rr * 2 + 8 + nameW) / 2 + rr;
  let s = `<g class="lab"${o.op != null ? ` opacity="${o.op}"` : ''}><circle cx="${r1(x0)}" cy="${r1(y)}" r="${rr}" style="fill:var(--g3)"/>` + ring(x0, y, rr, d.done ?? 0.5, hu, { w: big ? 2.8 : 2.2, forecast: d.fc }) + G(o.lm || d.lm, x0, y, rr * 1.2, `color-mix(in srgb,${hu} 70%,var(--fg))`);
  s += T(x0 + rr + 8, y + (big ? 7.5 : 5), nm, { size: big ? 21 : 14.5, anchor: 'start', halo: 'color-mix(in srgb,var(--lens) 80%,transparent)', hw: 4 });
  return s + '</g>';
}
// a vessel: tapered tube with beads (spacing = velocity)
function vessel(a, b, o = {}) {
  const [ax, ay] = a, [bx, by] = b; const mx = (ax + bx) / 2 + (o.bend ?? 0.18) * (by - ay), my = (ay + by) / 2 - (o.bend ?? 0.18) * (bx - ax);
  const d = `M${r1(ax)} ${r1(ay)}Q${r1(mx)} ${r1(my)} ${r1(bx)} ${r1(by)}`; const w = o.w || 9;
  let s = `<path d="${d}" style="fill:none;stroke:${o.wall || 'color-mix(in srgb,var(--membrane) 55%,transparent)'};stroke-width:${w + 4};stroke-linecap:round;opacity:${o.op ?? 0.7}"/><path d="${d}" style="fill:none;stroke:var(--lens);stroke-width:${w};stroke-linecap:round;opacity:${o.op ?? 0.7}"/>`;
  if (o.beads !== false) s += `<path d="${d}" style="fill:none;stroke:${o.bead || 'var(--membrane)'};stroke-width:${r1(w * 0.55)};stroke-linecap:round;stroke-dasharray:0.1 ${o.gap || 12};opacity:${o.op ?? 0.85}"/>`;
  return s;
}
const edge = (k, toward, inset = 2) => { const [cx, cy, r] = CELL[k]; const [tx, ty] = Array.isArray(toward) ? toward : CELL[toward]; const a = Math.atan2(ty - cy, tx - cx); return [cx + Math.cos(a) * (r - inset), cy + Math.sin(a) * (r - inset) * 0.94]; };
const LINKS = [['prod', 'eng'], ['design', 'eng'], ['lead', 'prod'], ['ops', 'eng'], ['eng', 'mkt'], ['comp', 'mkt'], ['eng', 'support'], ['support', 'people'], ['fin', 'mkt'], ['sales', 'ops'], ['design', 'comp']];
const svgWrap = (id, inner, o = {}) => `<svg class="world" viewBox="0 0 ${o.w || W} ${o.h || H}" aria-hidden="true"><defs>${defs(id)}${o.defs || ''}</defs>${inner}</svg>`;
const plasma = (id) => { const R = rng(61); let s = ''; for (let i = 0; i < 60; i++) { const a = R() * 6.28, rr = Math.sqrt(R()) * C.r; s += `<circle cx="${r1(C.x + Math.cos(a) * rr)}" cy="${r1(C.y + Math.sin(a) * rr)}" r="${r1(0.8 + R() * 1.4)}"/>`; } return `<g style="fill:var(--fg);opacity:.18">${s}</g>`; };

// ---------- stills ----------
const CH = { crumb: ['Company'], right: [{ i: 'eye', t: 'Owner' }, { i: 'layers', t: 'Stains' }] };
const LCH = (name, icon, finding) => ({ crumb: ['Company'], right: [{ i: 'eye', t: 'Owner' }, { i: icon, t: name, on: true }], finding: { icon, title: name, ...finding } });
const labels = (o = {}) => KEYS.map((k) => label(k, { big: k === (o.focus || 'eng'), op: o.dim && !o.dim.includes(k) ? 0.4 : 1 })).join('');

function companyStill() {
  const id = 'b1'; let s = plasma(id);
  for (const [a, b] of LINKS) s += vessel(edge(a, b), edge(b, a), { op: 0.45, gap: a === 'eng' || b === 'eng' ? 9 : 16 });
  for (const k of KEYS) { const d = DOM[k]; if (d.heat > 0.3) s += `<circle cx="${CELL[k][0]}" cy="${CELL[k][1]}" r="${r1(CELL[k][2] * (1.05 + 0.25 * d.heat))}" style="fill:url(#${id}-glow);opacity:${r1(0.4 + 0.4 * d.heat)}"/>`; }
  for (const k of KEYS) s += cell(k, { scar: k === 'eng' || k === 'support', mem: k === 'comp' ? 'var(--coral)' : undefined, memW: k === 'comp' ? 3.5 : undefined });
  // the clot in the Operations vessel, small at this depth
  const [vx, vy] = edge('ops', 'eng', -18); s += `<circle cx="${r1(vx)}" cy="${r1(vy)}" r="9" style="fill:color-mix(in srgb,var(--coral) 60%,var(--lens));stroke:var(--coral);stroke-width:2"/>`;
  s += labels();
  s += avatar(CELL.eng[0] + 70, CELL.eng[1] - 112, 'N', 'var(--acc)') + avatar(CELL.eng[0] + 94, CELL.eng[1] - 112, '✦', 'var(--ai)') + avatar(CELL.comp[0] + 52, CELL.comp[1] - 70, 'D', 'var(--f-rules)');
  s += flag(CELL.eng[0] - 140, CELL.eng[1] + 40, 'Store go/no-go', { needs: 1 }) + flag(CELL.lead[0] - 20, CELL.lead[1] + 20, 'Europe first', { needs: 1 });
  return svgWrap(id, scope(id, s)) + chrome(CH);
}

// cost: a silver stain (spend) and teal AI granules
function costStill() {
  const id = 'b2'; let s = plasma(id);
  for (const [a, b] of LINKS) s += vessel(edge(a, b), edge(b, a), { op: 0.25, beads: false });
  for (const k of KEYS) { const d = DOM[k]; s += cell(k, { stain: `color-mix(in srgb,var(--fg) ${Math.round(5 + 45 * d.spend)}%,transparent)`, gcol: 'var(--ai)', gn: 8 + 70 * d.ai * d.spend, gop: 0.9, nucOp: 0.4 }); }
  s += labels({ dim: ['eng', 'support', 'mkt', 'ops'] });
  return svgWrap(id, scope(id, s)) + chrome(LCH('Cost', 'coins', { text: 'A silver stain darkens each cell with its spend; teal granules are the AI share. Engineering takes the stain hardest; Support is dense with teal.', legend: ramp(['color-mix(in srgb,var(--fg) 6%,transparent)', 'color-mix(in srgb,var(--fg) 50%,transparent)'], 'less', 'more spend') + keyRow([[sw('background:var(--ai)'), 'AI cost granules']]) }));
}
// progress: maturation rings, lit from the membrane inward to the done share, forecast dashed
function progressStill() {
  const id = 'b3'; let s = plasma(id);
  for (const [a, b] of LINKS) s += vessel(edge(a, b), edge(b, a), { op: 0.25, beads: false });
  for (const k of KEYS) { const d = DOM[k], [cx, cy, r] = CELL[k]; s += cell(k, { granules: false, nucOp: 0.3 });
    const n = 6; for (let i = 0; i < n; i++) { const f = 1 - i / n, rr = (r - 10) * f; const lit = i / n < d.done, fc = !lit && i / n < d.fc;
      s += `<path d="${smooth(blobPts(cx, cy, rr, rr * 0.94, cx + cy, 22, 0.07, (cx + cy) % 3))}" style="fill:none;stroke:${lit ? `color-mix(in srgb,${hue(k)} 60%,#fff)` : 'var(--fg)'};stroke-width:${lit ? 2.6 : 1.2};opacity:${lit ? 0.9 : fc ? 0.6 : 0.14}${fc ? ';stroke-dasharray:2 4' : ''}"/>`; } }
  s += labels({ dim: ['eng', 'comp', 'mkt', 'fin', 'design'] });
  return svgWrap(id, scope(id, s)) + chrome(LCH('Maturity', 'sunrise', { text: 'Each cell matures from its membrane inward: the lit rings are its done share, the dashed ring is the forecast. Finance and Design are nearly mature to the core; Compliance and Marketing are young.', legend: keyRow([[sw('background:var(--fg)', 'line'), 'done'], [sw('background:repeating-linear-gradient(90deg,var(--fg) 0 2px,transparent 2px 5px)', 'line'), 'forecast'], [sw('background:color-mix(in srgb,var(--fg) 20%,transparent)', 'line'), 'still to grow']]) }));
}
// issues: inflammation. Granule clusters where issues gather; amber where something fails; coral at the breach
function issuesStill() {
  const id = 'b4'; let s = plasma(id);
  for (const [a, b] of LINKS) s += vessel(edge(a, b), edge(b, a), { op: 0.25, beads: false });
  for (const k of KEYS) { const d = DOM[k]; s += cell(k, { op: d.issues > 0.4 ? 1 : 0.5, gn: 6 + 90 * d.issues, gcol: 'var(--fg)', gop: 0.7, mem: k === 'comp' ? 'var(--coral)' : undefined, memW: k === 'comp' ? 4 : undefined }); }
  const [ex, ey] = [CELL.eng[0] - 70, CELL.eng[1] + 70]; s += `<circle cx="${ex}" cy="${ey}" r="36" style="fill:var(--amber);opacity:.28" filter="url(#${id}-b)"/>`; { const R = rng(8); let g = ''; for (let i = 0; i < 26; i++) g += `<circle cx="${r1(ex + (R() - 0.5) * 50)}" cy="${r1(ey + (R() - 0.5) * 40)}" r="${r1(1.6 + R() * 2)}"/>`; s += `<g style="fill:var(--amber)">${g}</g>`; }
  s += `<circle cx="${CELL.comp[0]}" cy="${CELL.comp[1]}" r="${CELL.comp[2] + 14}" style="fill:none;stroke:var(--coral);stroke-width:10;opacity:.25" filter="url(#${id}-b2)"/>`;
  s += labels({ dim: ['support', 'eng', 'comp'] });
  s += T(ex, ey + 46, 'Integration suite failing', { size: 13.5, font: 'u', w: 600, halo: 'var(--lens)' }) + T(CELL.comp[0], CELL.comp[1] + CELL.comp[2] + 24, 'DPA signature late', { size: 13.5, font: 'u', w: 600, halo: 'var(--lens)' }) + T(CELL.support[0], CELL.support[1] + 30, 'Issues within service levels', { size: 13, font: 'u', w: 500, fill: 'var(--muted)', halo: 'var(--lens)' });
  return svgWrap(id, scope(id, s)) + chrome(LCH('Issues', 'activity', { text: 'Issues gather as granules in the cells they come from; Support is the densest but inside its service levels. Amber where the suite fails inside Engineering; coral where Compliance\'s membrane is inflamed by the late signature.', legend: keyRow([[sw('background:var(--fg)'), 'issues'], [sw('background:var(--amber)'), 'failing'], [sw('background:var(--coral)'), 'breached']]) }));
}
// dependencies: the vessels, flow beads, the critical vessel thick, the clot
function depsStill() {
  const id = 'b5'; let s = plasma(id);
  for (const k of KEYS) s += cell(k, { op: ['ops', 'eng', 'mkt', 'comp'].includes(k) ? 0.55 : 0.3, granules: false });
  for (const [a, b] of LINKS) if (!(a === 'ops' && b === 'eng') && !(a === 'eng' && b === 'mkt') && !(a === 'comp' && b === 'mkt')) s += vessel(edge(a, b), edge(b, a), { op: 0.7, gap: 12, w: 7 });
  s += vessel(edge('ops', 'eng'), [ENUC.beta[0] - 40, ENUC.beta[1] + 40], { w: 14, op: 1, gap: 7, bend: 0.1 }) + vessel([ENUC.beta[0] + 50, ENUC.beta[1] + 30], edge('mkt', 'eng'), { w: 14, op: 1, gap: 22, bend: -0.12 }) + vessel(edge('comp', 'mkt'), edge('mkt', 'comp'), { w: 10, op: 0.9, beads: false });
  const [vx, vy] = edge('ops', 'eng', -18); s += `<circle cx="${r1(vx)}" cy="${r1(vy)}" r="11" style="fill:color-mix(in srgb,var(--coral) 60%,var(--lens));stroke:var(--coral);stroke-width:2.4"/>`;
  s += labels({ dim: ['ops', 'eng', 'mkt', 'comp'] });
  return svgWrap(id, scope(id, s)) + chrome(LCH('Dependencies', 'route', { text: 'Vessels carry work between cells; beads crowd where it flows fast and thin out where it stalls. The thick vessel is the critical path into the beta nucleus and on to Marketing; a clot sits where Operations feeds it.', legend: keyRow([[sw('background:var(--membrane)', 'line'), 'critical vessel'], [sw('background:color-mix(in srgb,var(--membrane) 50%,transparent)', 'line'), 'dependency'], [sw('background:var(--coral)'), 'clot']]) }));
}
// trust (Biome's own): a teal stain of the autonomy the AI holds in each cell
function trustStill() {
  const id = 'b6'; let s = plasma(id);
  for (const [a, b] of LINKS) s += vessel(edge(a, b), edge(b, a), { op: 0.25, beads: false });
  for (const k of KEYS) { const d = DOM[k]; s += cell(k, { stain: `color-mix(in srgb,var(--ai) ${Math.round(4 + 52 * d.trust)}%,transparent)`, granules: false, nucOp: 0.35 }); }
  s += labels({ focus: 'support', dim: ['support', 'eng', 'lead', 'people'] });
  s += flag(CELL.support[0] + 60, CELL.support[1] - 40, 'Raise to inform', { needs: 1 });
  return svgWrap(id, scope(id, s)) + chrome(LCH('Trust', 'shield-check', { text: 'A teal stain of how much the AI is trusted to act in each cell. Support runs mostly on its own; Leadership and People keep the AI at suggest. One cell has earned a step up.', legend: ramp(['color-mix(in srgb,var(--ai) 6%,transparent)', 'color-mix(in srgb,var(--ai) 60%,transparent)'], 'observe', 'run') }));
}
// the problem picture
function problemStill() {
  const id = 'b7'; let s = plasma(id);
  for (const k of KEYS) { const on = ['ops', 'eng', 'mkt', 'comp'].includes(k); s += cell(k, { op: on ? 1 : 0.25, granules: k !== 'mkt', mem: k === 'comp' ? 'var(--coral)' : undefined, memW: k === 'comp' ? 6 : undefined, fill: k === 'mkt' ? 'color-mix(in srgb,var(--fg) 4%,var(--lens))' : undefined }); }
  // the swollen vessel and the clot
  const a = edge('ops', 'eng'), b = [ENUC.beta[0] - 40, ENUC.beta[1] + 40];
  s += vessel(a, b, { w: 12, op: 1, gap: 6, bend: 0.1 });
  const [kx, ky] = [lerp(a[0], b[0], 0.18), lerp(a[1], b[1], 0.18)];
  s += `<ellipse cx="${r1(kx - 14)}" cy="${r1(ky + 6)}" rx="40" ry="24" transform="rotate(-35 ${r1(kx - 14)} ${r1(ky + 6)})" style="fill:color-mix(in srgb,var(--membrane) 25%,var(--lens));stroke:color-mix(in srgb,var(--membrane) 80%,transparent);stroke-width:3"/>`;
  { const R = rng(4); let g = ''; for (let i = 0; i < 14; i++) g += `<circle cx="${r1(kx - 34 + R() * 34)}" cy="${r1(ky + R() * 24 - 4)}" r="${r1(3 + R() * 2)}"/>`; s += `<g style="fill:var(--membrane)">${g}</g>`; }
  s += `<circle cx="${r1(kx + 18)}" cy="${r1(ky - 12)}" r="40" style="fill:var(--coral);opacity:.3" filter="url(#${id}-b)"/><circle cx="${r1(kx + 18)}" cy="${r1(ky - 12)}" r="17" style="fill:color-mix(in srgb,var(--coral) 55%,var(--lens));stroke:var(--coral);stroke-width:3"/>` + G('envelope', kx + 18, ky - 12, 16, 'var(--fg)', { sw: 1.8 });
  // vessels beyond: thin and empty
  s += vessel([ENUC.beta[0] + 50, ENUC.beta[1] + 30], edge('mkt', 'eng'), { w: 6, op: 0.6, gap: 40, bend: -0.12 });
  s += vessel(edge('comp', 'mkt'), edge('mkt', 'comp'), { w: 6, op: 0.6, beads: false });
  // the closed pore on Compliance's membrane
  const [px, py] = edge('comp', 'mkt', 0); s += `<circle cx="${r1(px)}" cy="${r1(py)}" r="14" style="fill:var(--lens);stroke:var(--coral);stroke-width:4"/><path d="M${r1(px - 8)} ${r1(py)}h16" style="stroke:var(--coral);stroke-width:3.5;stroke-linecap:round"/>`;
  s += label('eng', { big: true }) + label('ops', { name: 'Railway token', y: CELL.ops[1] + 52 }) + label('comp', { name: 'DPA signature', y: CELL.comp[1] - 10 }) + label('mkt', { name: 'Marketing waits' });
  s += T(kx + 48, ky + 34, 'Dispatcher vessel blocked', { size: 15, anchor: 'start', halo: 'var(--lens)', hw: 5 }) + T(kx + 48, ky + 52, 'items backed up since Oct 26', { anchor: 'start', size: 13, font: 'u', w: 500, fill: 'var(--muted)', halo: 'var(--lens)' });
  return svgWrap(id, scope(id, s)) + chrome({ crumb: ['Company'], right: [{ i: 'eye', t: 'Owner' }, { i: 'search', t: 'What is stuck?', on: true }], finding: { icon: 'microscope', title: 'A clot and a closed membrane', text: 'The Railway token sits as a clot where Operations feeds the beta nucleus; the vessel swells and work backs up behind it. Compliance\'s membrane will not open until the DPA is signed, so Marketing is starved from both sides.' } });
}

// ---- Engineering (Z1): the cell fills the lens, its organelles are the programs ----
const ORG = { beta: [640, 395, 104], ios: [860, 322, 66], eu: [880, 545, 58], evals: [565, 600, 56], platform: [748, 640, 60] };
function domainStill() {
  const id = 'b8'; let s = `<circle cx="${C.x}" cy="${C.y}" r="${C.r}" style="fill:color-mix(in srgb,var(--h-build) 9%,var(--lens))"/>` + plasma(id);
  // neighbours beyond the membrane, in the band at the lens edge (where they were on the slide)
  s += cell('comp', { at: [1062, 168, 130], seed: 31, op: 0.8, mem: 'var(--coral)', memW: 3 }) + cell('ops', { at: [418, 752, 125], seed: 32, op: 0.8 }) + cell('mkt', { at: [1150, 540, 120], seed: 33, op: 0.65 });
  // the Engineering membrane: the parent's outline, now the frame
  s += `<path d="${smooth(blobPts(730, 462, 318, 300, 12, 30, 0.035))}" style="fill:color-mix(in srgb,var(--h-build) 10%,var(--lens));stroke:var(--h-build);stroke-width:3.2"/><path d="${smooth(blobPts(730, 462, 306, 288, 12, 30, 0.035))}" style="fill:none;stroke:var(--h-build);stroke-width:1.2;opacity:.5"/>`;
  for (const [k, [x, y, r]] of Object.entries(ORG)) { const e = ENG[k]; const big = k === 'beta';
    s += cell(k, { at: [x, y, r], hue: 'var(--h-build)', seed: x + y, stale: 0, gn: 20 + 40 * e.work, nuclei: big ? [[x - 20, y - 10, 30], [x + 34, y + 30, 22], [x - 40, y + 46, 18], [x + 40, y - 40, 20]] : [[x + 10, y + 6, r * 0.3]] });
    s += label(k, { at: [x, y, r], d: e, hue: 'var(--h-build)', lm: e.lm, big, name: e.name, y: y - r * 0.58 }); }
  // EU residency pushes a channel through the membrane into Compliance: one shape across the border
  s += `<path d="M900 505 C950 420 990 330 1030 250" style="fill:none;stroke:var(--h-govern);stroke-width:22;opacity:.22;stroke-linecap:round"/><path d="M900 505 C950 420 990 330 1030 250" style="fill:none;stroke:var(--h-govern);stroke-width:2;stroke-dasharray:6 5"/>`;
  // the feed from Operations with its clot, at the lower left
  s += vessel([470, 690], [585, 470], { w: 11, op: 0.9, gap: 7, bend: 0.05 }) + `<circle cx="490" cy="648" r="11" style="fill:color-mix(in srgb,var(--coral) 60%,var(--lens));stroke:var(--coral);stroke-width:2.4"/>`;
  s += avatar(700, 300, 'N', 'var(--acc)') + avatar(724, 300, '✦', 'var(--ai)') + flag(500, 330, 'Store go/no-go', { needs: 1 });
  s += T(1010, 205, 'Compliance', { size: 15, op: 0.8, halo: 'var(--lens)' }) + T(452, 740, 'Operations', { size: 15, op: 0.8, halo: 'var(--lens)' }) + T(1085, 540, 'Marketing', { size: 15, op: 0.65, halo: 'var(--lens)' });
  return svgWrap(id, scope(id, s)) + chrome({ crumb: ['Company', 'Engineering'], right: [{ i: 'eye', t: 'CTO' }, { i: 'layers', t: 'Stains' }] }) + `<div style="position:absolute;right:28px;top:360px;z-index:5"><span class="chip"><i data-lucide="chevrons-right" class="ic"></i>EU residency crosses into Compliance</span></div>`.replace('top:360px', 'top:250px');
}

// ---- the beta nucleus (Z2): compartments are streams, vesicles are buildings with their facades ----
function programStill() {
  const id = 'b9'; let s = '';
  s += `<path d="${smooth(blobPts(C.x, C.y, 380, 360, 21, 30, 0.04))}" style="fill:color-mix(in srgb,var(--h-build) 10%,var(--lens));stroke:var(--h-build);stroke-width:3"/>` + plasma(id);
  // folds between compartments
  s += `<path d="M${C.x - 380} ${C.y + 10}C${C.x - 200} ${C.y - 40} ${C.x + 120} ${C.y + 60} ${C.x + 380} ${C.y - 10}M${C.x - 10} ${C.y - 360}C${C.x + 40} ${C.y - 140} ${C.x - 60} ${C.y + 160} ${C.x + 10} ${C.y + 360}" style="fill:none;stroke:var(--h-build);stroke-width:2;opacity:.5;stroke-dasharray:1 0"/>`;
  const PR = { dispatcher: 0.42, relay: 0.72, evals: 0.82, store: 0.36 };
  const QD = { dispatcher: [C.x - 200, C.y - 200], relay: [C.x + 190, C.y - 210], evals: [C.x - 200, C.y + 170], store: [C.x + 190, C.y + 170] };
  for (const [k, [x, y]] of Object.entries(QD)) s += `<circle cx="${x}" cy="${y}" r="150" style="fill:var(--glow);opacity:${r1(0.02 + 0.08 * PR[k])}" filter="url(#${id}-b)"/>`;
  // vesicles: a facade inside a round membrane
  const ves = (x, y, r, kind, o = {}) => { let v = `<circle cx="${x}" cy="${y}" r="${r + 6}" style="fill:color-mix(in srgb,var(--h-build) 14%,var(--lens));stroke:var(--h-build);stroke-width:${o.ghost ? 1.4 : 2.2};${o.ghost ? 'stroke-dasharray:5 4;' : ''}opacity:${o.ghost ? 0.7 : 1}"/>`;
    v += `<clipPath id="${id}v${x}${y}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath><g clip-path="url(#${id}v${x}${y})">${facade(kind, x - r * 1.25, y - r * 0.85, r * 2.5, r * 1.7, { ghost: o.ghost })}</g>`;
    if (o.crit != null) v += `<circle cx="${r1(x + r * 0.78)}" cy="${r1(y - r * 0.78)}" r="10" style="fill:var(--lens)"/>` + ring(x + r * 0.78, y - r * 0.78, 8, o.crit, o.crit === 1 ? 'var(--good)' : 'var(--glow)', { w: 2.6 });
    if (o.landmark) v = `<circle cx="${x}" cy="${y}" r="${r + 30}" style="fill:url(#${id}-glow)"/>` + v;
    return v; };
  s += ves(C.x - 230, C.y - 170, 58, 'chart', { crit: 0.66 }) + ves(C.x - 110, C.y - 270, 40, 'term', { crit: 1 });
  s += ves(C.x + 150, C.y - 200, 56, 'screens', { crit: 0.83 }) + ves(C.x + 280, C.y - 90, 40, 'screens', { ghost: true });
  s += ves(C.x - 250, C.y + 150, 54, 'doc', { crit: 1, landmark: true }) + ves(C.x - 110, C.y + 250, 38, 'doc', { crit: 0.5 });
  s += ves(C.x + 150, C.y + 160, 56, 'build', { crit: 0.8 }) + ves(C.x + 40, C.y + 280, 40, 'listing', { ghost: true });
  // the critical filament to the nuclear pore (Gate 1 Alpha) on the right
  const fil = `M${C.x - 230} ${C.y - 170}C${C.x - 60} ${C.y - 120} ${C.x + 40} ${C.y + 120} ${C.x + 150} ${C.y + 160}S${C.x + 330} ${C.y + 120} ${C.x + 378} ${C.y + 40}`;
  s += `<path d="${fil}" style="fill:none;stroke:var(--glow);stroke-width:12;opacity:.18"/><path d="${fil}" style="fill:none;stroke:var(--membrane);stroke-width:2.6;stroke-dasharray:1 6;stroke-linecap:round"/>`;
  const [gx, gy] = [C.x + 378, C.y + 40]; s += `<circle cx="${gx}" cy="${gy}" r="26" style="fill:var(--lens);stroke:var(--h-build);stroke-width:4"/>${ring(gx, gy, 20, 0.58, 'var(--h-build)', { w: 3, forecast: 0.66 })}${G('gate', gx, gy, 20, 'var(--fg)')}${T(gx - 36, gy - 30, 'Gate 1 Alpha', { size: 17, halo: 'var(--lens)', anchor: 'end' })}`;
  // the entry pore from Operations, clotted
  const [ex, ey] = [C.x - 372, C.y - 60]; s += `<circle cx="${ex}" cy="${ey}" r="22" style="fill:color-mix(in srgb,var(--coral) 50%,var(--lens));stroke:var(--coral);stroke-width:3"/>${G('envelope', ex, ey, 18, 'var(--fg)')}`;
  for (const [k, [x, y]] of Object.entries({ dispatcher: [C.x - 260, C.y - 300], relay: [C.x + 140, C.y - 300], evals: [C.x - 290, C.y + 250], store: [C.x + 140, C.y + 270] })) s += `<g><circle cx="${x}" cy="${y}" r="14" style="fill:var(--g3)"/>${ring(x, y, 14, PR[k], 'var(--h-build)', { w: 2.2 })}${G(STREAMS[k].lm, x, y, 15, 'var(--fg)')}${T(x + 22, y + 5, STREAMS[k].name, { size: 15, anchor: 'start', halo: 'var(--lens)' })}</g>`;
  const card = `<path d="M330 150 L${C.x - 280} ${C.y - 205}" style="stroke:var(--fg);stroke-width:1;opacity:.5"/><g><rect x="40" y="120" width="300" height="56" rx="14" style="fill:var(--g3);stroke:color-mix(in srgb,#fff 25%,transparent)"/>${T(54, 143, 'Dispatcher sequencing under load', { size: 14.5, anchor: 'start' })}${T(54, 163, '4 of 6 criteria met · Noa · doing since Oct 26', { size: 12.5, anchor: 'start', font: 'u', w: 500, fill: 'var(--muted)' })}</g>`;
  const mini = `<svg viewBox="0 0 150 96"><circle cx="75" cy="48" r="40" style="fill:none;stroke:var(--glow);opacity:.5"/>${[[60, 40, 14], [92, 36, 9], [96, 60, 8], [58, 64, 7]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" style="fill:none;stroke:${i ? 'var(--glow)' : 'var(--acc)'};stroke-width:${i ? 1 : 2};opacity:${i ? 0.5 : 1}"/>`).join('')}</svg>`;
  return svgWrap(id, scope(id, s) + card) + chrome({ crumb: ['Engineering', 'Private beta', 'Wave 71'], right: [{ i: 'layout-grid', t: 'As a board' }], mini });
}

function phoneStill() {
  const id = 'bp'; const S = { x: 195, y: 330, r: 178 };
  let s = `<rect width="${PW}" height="${PH}" style="fill:var(--scope)"/><circle cx="${S.x}" cy="${S.y}" r="${S.r}" style="fill:url(#${id}-lens)"/><clipPath id="${id}-pc"><circle cx="${S.x}" cy="${S.y}" r="${S.r}"/></clipPath>`;
  let inner = ''; const sc = 0.82, dx = S.x - CELL.eng[0] * sc, dy = S.y - CELL.eng[1] * sc;
  inner += `<g transform="translate(${r1(dx)} ${r1(dy)}) scale(${sc})">`;
  for (const [a, b] of LINKS) inner += vessel(edge(a, b), edge(b, a), { op: 0.45 });
  for (const k of KEYS) inner += cell(k, { scar: k === 'eng', mem: k === 'comp' ? 'var(--coral)' : undefined, memW: k === 'comp' ? 3.5 : undefined });
  inner += label('eng', { big: true }) + label('ops') + label('prod') + label('mkt') + '</g>';
  s += `<g clip-path="url(#${id}-pc)">${inner}</g>`;
  for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2, l = i % 6 === 0 ? 10 : 5; s += `<line x1="${r1(S.x + Math.cos(a) * (S.r + 5))}" y1="${r1(S.y + Math.sin(a) * (S.r + 5))}" x2="${r1(S.x + Math.cos(a) * (S.r + 5 + l))}" y2="${r1(S.y + Math.sin(a) * (S.r + 5 + l))}" style="stroke:var(--fg);stroke-width:1;opacity:.35"/>`; }
  const card = `<div class="pcard" data-needs="1"><div class="pc-h"><svg viewBox="0 0 24 24" width="22" height="22">${G('flag', 12, 12, 22, 'var(--f-rules)')}</svg><b>Store go/no-go</b></div><p>A clot where Operations feeds the beta: it slips a week unless the Railway token lands today.</p><div class="pills"><span class="chip on">Open the fork</span><span class="chip">Later</span></div></div>`;
  return `<div class="status" data-ambient><span>9:41</span><span>●●●</span></div>` + svgWrap(id, s, { w: PW, h: PH }) + chrome({ crumb: ['Company'], right: [{ i: 'layers', t: 'Stains' }], talk: false }) + card;
}

export function stills() {
  return [
    { id: 'company', sky: true, glance: true, title: 'Company depth: the slide', html: companyStill(), caption: 'Eleven cells on one slide, sized by open work; each shows its programs as nuclei before you zoom (Engineering\'s five are the ones you will enter). Engineering and Design glow (moved today); Partnerships is grey and shrunken (stale); Engineering and Support carry scar tissue (lessons recorded). Vessels carry work between cells; Compliance\'s membrane is coral (DPA late); a small clot sits in the vessel from Operations.' },
    { id: 'domain', title: 'Domain depth: inside the Engineering cell', html: domainStill(), caption: 'Turning the objective: the Engineering membrane now rings the lens and its five nuclei have become organelles (programs) with their own nuclei and granules. Compliance and Operations are the neighbouring cells beyond the membrane; EU residency is a channel that pushes through it into Compliance. The clotted feed from Operations enters at the lower left.' },
    { id: 'program', title: 'Program depth: the beta nucleus', html: programStill(), caption: 'The nucleus fills the lens; its four compartments are the streams, lit by their progress; granules are buildings, each a vesicle showing its product (the store submission and the Hebrew screens still dashed). A filament (the critical path) runs to the nuclear pore, Gate 1 Alpha; the entry pore from Operations is clotted with the token.' },
    { id: 'cost', glance: true, title: 'Stain: cost', html: costStill(), caption: 'A silver stain darkens each cell with its spend; teal granules are the AI share inside it. The stain is the cell, not a badge on it.' },
    { id: 'progress', glance: true, title: 'Stain: maturity (progress)', html: progressStill(), caption: 'Cells mature from the membrane inward; lit rings are done, the dashed ring is the forecast, faint rings are still to grow.' },
    { id: 'issues', glance: true, title: 'Stain: inflammation (issues)', html: issuesStill(), caption: 'Issues gather as granules where they come from; amber only where the suite fails, coral where the membrane is inflamed by the breached signature.' },
    { id: 'deps', glance: true, title: 'Stain: circulation (dependencies)', html: depsStill(), caption: 'Cells fade, vessels light up; bead spacing is velocity (crowded = fast, sparse = stalled); the critical vessel is thick, with its clot.' },
    { id: 'trust', glance: true, title: 'Stain: trust (Biome\'s own)', html: trustStill(), caption: 'How much the AI is trusted to act in each cell, as a teal stain; the one advancement proposal is the only thing that needs the viewer.' },
    { id: 'problem', glance: true, title: 'The problem picture: a clot and a closed membrane', html: problemStill(), caption: 'The vessel from Operations swells before a clot (the Railway token) and work backs up in it; beyond, the vessel to Marketing runs thin; Compliance\'s membrane is thick and coral with its pore shut (DPA). Marketing is pale, starved from both sides.' },
    { id: 'company', phone: true, glance: true, title: 'Phone: one cell in the lens', html: phoneStill(), caption: 'The lens on a phone holds one cell and its neighbours\' edges; the thing that needs the owner is the card below.' },
  ];
}
