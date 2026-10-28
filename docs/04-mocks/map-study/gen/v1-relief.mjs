// V1 Relief: the company as a landform in oblique relief, drawn as ridgelines (one line per row of ground, filled to
// occlude what is behind). Height = remaining open work (what is still to climb); light = progress (a lit tide rises
// up each mountain to its done share, the forecast dotted above it); haze in the valleys = staleness; valley roads =
// dependencies. Data layers re-shape or re-light the ground itself.
import { W, H, PW, PH, rng, r1, lerp, clamp, sstep, noise2, smooth, poly, blobPts, T, ring, G, flag, barrier, avatar, building, facade, chrome, ramp, keyRow, sw, haloFilter } from './lib.mjs';
import { DOM, hue, ENG, STREAMS, BLD } from './company.mjs';

export const meta = {
  n: 1, name: 'Relief', icon: 'mountain',
  line: 'The company as a landscape in oblique relief.',
  intro: 'Height is remaining open work, so a place is a mountain still to climb and finished work flattens into lit plains; light is progress, rising up each slope like a tide with the forecast dotted above it; haze settles in valleys nobody touched for two weeks; roads run along the valleys. Zooming is flying lower: the Engineering massif already shows its programs as terraces, and the beta terrace already shows its buildings.',
};

// ---------- the ridgeline renderer ----------
// o.hf(u,v) -> {h, k, w}; o.P(u,v,h) -> [x,y]; o.mask(u,v) -> 0..1 (island); o.style(info,v,u) -> {stroke, sw, op, dash}
function ridges(o) {
  let out = ''; const ov = [...(o.overlays || [])].sort((a, b) => a.v - b.v); let oi = 0; const cls = new Map();
  const slab = o.slab ?? 0.14;
  if (slab > 0) out += skirt(o, slab);
  for (let j = 0; j < o.rows; j++) {
    const v = lerp(o.v0, o.v1, j / (o.rows - 1));
    while (oi < ov.length && ov[oi].v <= v) out += ov[oi++].svg;
    const top = [], low = [], info = [];
    for (let i = 0; i <= o.cols; i++) {
      const u = lerp(o.u0, o.u1, i / o.cols); const m = o.mask(u, v); if (m <= 0) { if (top.length) break; else continue; }
      const r = o.hf(u, v); r.m = m; r.u = u; r.sl = (o.hf(u + 0.004, v).h - r.h) / 0.004; info.push(r);
      top.push(o.P(u, v, r.h)); low.push(o.P(u, v, -slab * sstep(0, 0.15, m)));
    }
    if (top.length < 2) continue;
    const base = top.map((p, i) => o.P(info[i].u, v, -0.004));
    out += `<path d="${rel(top.concat(base.slice().reverse()))}Z" fill="url(#${o.id}-fill)"/>`;
    let cur = null, seg = [];
    const flush = () => { if (cur && seg.length > 1 && cur.op > 0.02) { let c = cls.get(cur.stroke); if (!c) { c = o.id + 'k' + cls.size; cls.set(cur.stroke, c); } out += `<path d="${rel(seg)}" class="${c}" stroke-width="${cur.sw}" opacity="${cur.op}"${cur.dash ? ` stroke-dasharray="${cur.dash}"` : ''}/>`; } };
    for (let i = 0; i < top.length; i++) {
      const st = o.style(info[i], v); const key = `${st.stroke}|${st.sw}|${st.op}|${st.dash || ''}`;
      if (!cur || key !== cur.key) { if (cur) { seg.push(top[i]); flush(); } cur = { ...st, key }; seg = [top[i]]; } else seg.push(top[i]);
    }
    flush();
  }
  while (oi < ov.length) out += ov[oi++].svg;
  if (slab > 0) out += front(o, slab);
  return `<style>${[...cls].map(([st, c]) => `.${c}{fill:none;stroke:${st};stroke-linejoin:round;stroke-linecap:round}`).join('')}</style>` + out;
}
const rel = (pts) => { let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}l`, px = r1(pts[0][0]), py = r1(pts[0][1]); for (let i = 1; i < pts.length; i++) { const x = r1(pts[i][0]), y = r1(pts[i][1]); d += `${r1(x - px)} ${r1(y - py)} `; px = x; py = y; } return d.trim().replace(/ -/g, '-'); };
function front(o, slab) {
  const r0 = rim(o, 0), r1_ = rim(o, -slab), n = r0.length; const a = Math.round(n * -0.02), b = Math.round(n * 0.52);
  const top = [], bot = []; for (let i = a; i <= b; i++) { top.push(r0[(i + n) % n]); bot.push(r1_[(i + n) % n]); }
  let s = `<path d="${poly(top)}L${poly(bot.reverse()).slice(1)}Z" style="fill:url(#${o.id}-slab)"/>`;
  for (const f of [0.3, 0.6]) { const rf = rim(o, -slab * f); const l = []; for (let i = a; i <= b; i++) l.push(rf[(i + n) % n]); s += `<path d="${poly(l)}" style="fill:none;stroke:var(--glow);stroke-width:1;opacity:${r1(0.26 - f * 0.18)}"/>`; }
  return s + `<path d="${poly(top)}" style="fill:none;stroke:var(--glow);stroke-width:1.2;opacity:.35"/>`;
}
// the island's rim projected at depth h, and the skirt below it with strata lines
function rim(o, h, n = 160) {
  const pts = []; const cu = (o.u0 + o.u1) / 2, cv = (o.v0 + o.v1) / 2;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; let lo = 0, hi = 0.75;
    for (let k = 0; k < 18; k++) { const m = (lo + hi) / 2; const u = cu + Math.cos(a) * m, v = cv + Math.sin(a) * m; if (o.mask(u, v) > 0.02) lo = m; else hi = m; }
    pts.push(o.P(cu + Math.cos(a) * lo, cv + Math.sin(a) * lo, h)); }
  return pts;
}
function skirt(o, slab) {
  let s = `<path d="${poly(rim(o, -slab), true)}" style="fill:url(#${o.id}-slab)"/>`;
  for (const f of [0.3, 0.55, 0.8]) s += `<path d="${poly(rim(o, -slab * f), true)}" style="fill:none;stroke:var(--glow);stroke-width:1;opacity:${r1(0.32 - f * 0.25)}"/>`;
  return s + `<path d="${poly(rim(o, -slab), true)}" style="fill:none;stroke:var(--glow);stroke-width:1.2;opacity:.25"/>`;
}
const q = (x, s = 10) => Math.round(x * s) / s;
function defs(id, o = {}) {
  return `<linearGradient id="${id}-fill" gradientUnits="userSpaceOnUse" x1="0" y1="80" x2="0" y2="${H}"><stop offset="0" style="stop-color:var(--terrain)"/><stop offset="1" style="stop-color:var(--terrain2)"/></linearGradient>`
    + `<linearGradient id="${id}-slab" gradientUnits="userSpaceOnUse" x1="0" y1="300" x2="0" y2="${H}"><stop offset="0" style="stop-color:var(--slab1)"/><stop offset="1" style="stop-color:var(--slab2)"/></linearGradient>`
    + haloFilter(id + '-blur', o.blur || 14) + haloFilter(id + '-blur2', 5)
    + `<radialGradient id="${id}-glow"><stop offset="0" style="stop-color:var(--glow);stop-opacity:.55"/><stop offset="1" style="stop-color:var(--glow);stop-opacity:0"/></radialGradient>`;
}

// ---------- the company landform ----------
const POS = { lead: [0.15, 0.24], prod: [0.3, 0.12], design: [0.62, 0.11], comp: [0.87, 0.3], sales: [0.08, 0.52], ops: [0.25, 0.63], eng: [0.48, 0.54], mkt: [0.74, 0.6], fin: [0.9, 0.77], support: [0.63, 0.86], people: [0.35, 0.88] };
const KEYS = Object.keys(POS);
const n1 = noise2(11), n2 = noise2(29);
const island = (() => { const R = rng(5), ph = [R() * 6, R() * 6, R() * 6]; return (u, v) => {
  const dx = (u - 0.5) / 0.5, dy = (v - 0.52) / 0.5, a = Math.atan2(dy, dx), d = Math.hypot(dx, dy);
  const rr = 0.93 + 0.05 * Math.sin(a * 3 + ph[0]) + 0.03 * Math.sin(a * 5 + ph[1]) + 0.02 * Math.sin(a * 9 + ph[2]);
  return clamp((rr - d) / 0.06); }; })();
// sub-peaks inside Engineering: its programs, visible before zoom
const ENGSUB = { beta: [-0.05, -0.02, 1.0], ios: [0.045, -0.055, 0.62], eu: [0.075, 0.04, 0.5], evals: [-0.055, 0.065, 0.38], platform: [0.015, 0.085, 0.42] };
function companyHF(measure = 'work') {
  return (u, v) => {
    let h = 0, best = null, bw = 0;
    for (const k of KEYS) {
      const [pu, pv] = POS[k], d = DOM[k]; const amp = measure === 'work' ? 0.12 + 0.88 * d.work : measure === 'spend' ? 0.08 + 0.92 * d.spend : 0.12 + 0.88 * d.work;
      const sx = 0.042 + 0.062 * Math.sqrt(d.work + 0.1), sy = sx * 0.92;
      const g = Math.exp(-(((u - pu) / sx) ** 2 + ((v - pv) / sy) ** 2) / 2);
      if (g > bw) { bw = g; best = k; }
      let gg = g * amp;
      if (k === 'eng' && measure !== 'spend') { gg *= 0.55; for (const [du, dv, a] of Object.values(ENGSUB)) gg += amp * 0.42 * a * Math.exp(-(((u - pu - du) / 0.036) ** 2 + ((v - pv - dv) / 0.034) ** 2) / 2); }
      h += gg;
    }
    const rough = 0.82 + 0.3 * n1(u * 11, v * 11) + 0.08 * n2(u * 31, v * 31);
    const m = island(u, v);
    h = h * rough * sstep(0, 0.5, m) + 0.025 * n2(u * 7, v * 7);
    return { h, k: best, w: bw };
  };
}
const PC = (u, v, h) => { const s = lerp(0.8, 1.06, v); return [735 + (u - 0.5) * 1300 * s, 250 + v * 500 - h * 380 * s]; };
const peak = (k, hf, P = PC) => { const [u, v] = POS[k]; let best = [u, v, -1]; for (let du = -0.03; du <= 0.03; du += 0.01) for (let dv = -0.03; dv <= 0.03; dv += 0.01) { const h = hf(u + du, v + dv).h; if (h > best[2]) best = [u + du, v + dv, h]; } return { uv: best, xy: P(best[0], best[1], best[2]) }; };

// a place pin: stalk, glass disc with landmark, progress ring, name
function pin(x, y, k, o = {}) {
  const d = o.d || DOM[k] || {}; const lift = o.lift ?? 34, r = o.r || 17, hu = o.hue || hue(k);
  const cy = y - lift; let s = `<g class="pin"${o.op != null ? ` opacity="${o.op}"` : ''}>`;
  s += `<line x1="${r1(x)}" y1="${r1(y)}" x2="${r1(x)}" y2="${r1(cy + r)}" style="stroke:color-mix(in srgb,var(--fg) 55%,transparent);stroke-width:1.2"/><circle cx="${r1(x)}" cy="${r1(y)}" r="2.2" style="fill:var(--fg)"/>`;
  s += `<circle cx="${r1(x)}" cy="${r1(cy)}" r="${r}" style="fill:color-mix(in srgb,${hu} 22%,var(--g3));stroke:color-mix(in srgb,#fff 30%,transparent);stroke-width:.8"/>`;
  if (o.ring !== false) s += ring(x, cy, r + 4, d.done ?? 0.5, hu, { w: o.rw || 2.6, forecast: d.fc });
  s += G(o.lm || d.lm, x, cy, r * 1.15, `color-mix(in srgb,${hu} 70%,var(--fg))`, { sw: 1.6 });
  if (o.name !== false) { const nm = o.label || d.name; const big = o.big; s += T(o.nx != null ? x + o.nx : x, cy + r + (big ? 30 : 22), nm, { size: big ? 22 : 15, w: 600, halo: 'color-mix(in srgb,var(--terrain) 80%,transparent)', hw: 5, anchor: o.anchor }); }
  return s + '</g>';
}
const haze = (id) => fogBlob(...PC(0.09, 0.53, 0.05), 120, 30, 0.42, id) + fogBlob(...PC(0.13, 0.46, 0.05), 90, 18, 0.32, id) + fogBlob(...PC(0.06, 0.6, 0.03), 70, 16, 0.3, id) + fogBlob(...PC(0.35, 0.9, 0.04), 80, 14, 0.22, id);
const fogBlob = (x, y, rx, ry, op, id) => `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${rx}" ry="${ry}" style="fill:var(--fog);opacity:${op}" filter="url(#${id}-blur)"/>`;
const glow = (x, y, r, id, op = 1) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" style="fill:url(#${id}-glow);opacity:${op}"/>`;

// default ridge style: hue of the territory, light = progress
function styleFor(mode, opt = {}) {
  return (inf, v) => {
    const d = DOM[inf.k]; const lit = lerp(0.5, 1.35, clamp(0.5 + inf.sl * 0.35)); const ap = lerp(0.42, 1, v) * sstep(0, 0.4, inf.m) * (opt.flat ? 1 : lit);
    const mix = Math.round(clamp((inf.w - 0.25) * 1.5) * 6) * 10;
    const hu = hue(inf.k);
    if (mode === 'base') {
      const op = q(ap * (0.28 + 0.62 * d.done * clamp(inf.w * 1.6)), 20);
      return { stroke: `color-mix(in srgb,${hu} ${mix}%,var(--glow))`, sw: 1.15, op };
    }
    if (mode === 'dim') return { stroke: 'var(--glow)', sw: 1, op: q(ap * (opt.op || 0.22), 20) };
    if (mode === 'progress') {
      const hk = opt.hf; const pk = opt.peaks[inf.k] || 1; const rel = inf.h / pk; const w = clamp(inf.w * 1.6);
      if (w > 0.35 && rel <= d.done) return { stroke: `color-mix(in srgb,${hu} 65%,#fff)`, sw: 1.6, op: q(ap * 0.95, 20) };
      if (w > 0.35 && rel <= d.fc) return { stroke: `color-mix(in srgb,${hu} 65%,#fff)`, sw: 1.3, op: q(ap * 0.75, 20), dash: '1.5 3.5' };
      return { stroke: 'var(--glow)', sw: 1, op: q(ap * 0.18, 20) };
    }
    if (mode === 'cost') {
      const sp = d.spend * clamp(inf.w * 1.5); const lvl = Math.round(sp * 5) / 5;
      return { stroke: `color-mix(in srgb,var(--fg) ${Math.round(lvl * 100)}%,var(--glow))`, sw: r1(1 + lvl * 0.9), op: q(ap * (0.2 + 0.8 * lvl), 20) };
    }
    return { stroke: 'var(--glow)', sw: 1, op: 0.4 };
  };
}

function companyScene(o = {}) {
  const id = o.id || 'r1'; const measure = o.measure || 'work'; const hf = companyHF(measure); const P = o.P || PC;
  const peaks = {}; for (const k of KEYS) peaks[k] = peak(k, hf, P);
  const pk = {}; for (const k of KEYS) pk[k] = peaks[k].uv[2];
  const overlays = [...(o.overlays ? o.overlays(peaks, hf) : [])];
  let s = `<svg class="world" viewBox="0 0 ${o.w || W} ${o.h || H}" aria-hidden="true"><defs>${defs(id)}${o.defs || ''}</defs>`;
  s += o.under ? o.under(peaks, hf) : '';
  s += ridges({ id, hf, P, mask: island, rows: o.rows || 66, cols: o.cols || 140, v0: 0.02, v1: 0.99, u0: 0.0, u1: 1.0, overlays, slab: o.slab, style: o.style ? o.style({ peaks: pk, hf }) : styleFor('base') });
  s += o.over ? o.over(peaks, hf, P) : '';
  return s + '</svg>';
}
// standard pins for the company depth; skip lets a layer dim or replace some
function companyPins(peaks, o = {}) {
  let s = '';
  for (const k of KEYS) {
    if (o.skip && o.skip.includes(k)) continue;
    const [x, y] = peaks[k].xy; const big = k === (o.focus || 'eng');
    const op = o.dim && !o.dim.includes(k) ? 0.35 : (o.op ?? 1);
    s += pin(x, y, k, { big, r: big ? 24 : 16, lift: big ? 52 : 30 + (k === 'sales' || k === 'people' ? 6 : 0), op, rw: big ? 3.4 : 2.4 });
  }
  return s;
}
// the valley roads (in uv), used by dependencies and the problem picture
const ROADS = {
  tokenToDisp: [[0.27, 0.64], [0.33, 0.63], [0.4, 0.57]],
  dispToStore: [[0.4, 0.57], [0.45, 0.65], [0.53, 0.67], [0.59, 0.61]],
  storeToMkt: [[0.59, 0.61], [0.66, 0.63], [0.73, 0.58]],
  compToMkt: [[0.86, 0.37], [0.82, 0.45], [0.77, 0.54]],
  prodToEng: [[0.4, 0.16], [0.42, 0.28], [0.44, 0.38]],
  designToEng: [[0.6, 0.15], [0.55, 0.27], [0.5, 0.38]],
  engToSupport: [[0.5, 0.58], [0.56, 0.7], [0.6, 0.82]],
  finToMkt: [[0.9, 0.74], [0.84, 0.66], [0.78, 0.6]],
  leadToProd: [[0.2, 0.2], [0.3, 0.2], [0.4, 0.17]],
  opsToFin: [[0.27, 0.62], [0.4, 0.75], [0.6, 0.78], [0.86, 0.75]],
};
function roadPath(pts, hf, P = PC, lift = 0.012) { const dense = []; for (let i = 0; i < pts.length - 1; i++) for (let t = 0; t < 1; t += 0.1) { const u = lerp(pts[i][0], pts[i + 1][0], t), v = lerp(pts[i][1], pts[i + 1][1], t); dense.push(P(u, v, hf(u, v).h + lift)); } const L = pts[pts.length - 1]; dense.push(P(L[0], L[1], hf(L[0], L[1]).h + lift)); return smooth(dense, false); }
const roadSvg = (d, o = {}) => `<path d="${d}" style="fill:none;stroke:${o.halo || 'var(--terrain)'};stroke-width:${(o.w || 2) + 4};opacity:.8;stroke-linecap:round"/><path d="${d}" style="fill:none;stroke:${o.col || 'var(--road)'};stroke-width:${o.w || 2};stroke-linecap:round;opacity:${o.op ?? 0.9}${o.dash ? ';stroke-dasharray:' + o.dash : ''}"/>`;
const at = (uv, hf, lift = 0, P = PC) => P(uv[0], uv[1], hf(uv[0], uv[1]).h + lift);

// a boulder (the stuck chore) and the slide of debris behind it
function landslide(x, y, s = 1, o = {}) {
  const R = rng(7); let g = `<g class="slide">`;
  g += `<path d="${smooth(blobPts(x - 26 * s, y - 4 * s, 46 * s, 14 * s, 3, 12, 0.25))}" style="fill:color-mix(in srgb,var(--coral) 34%,var(--terrain));opacity:.85"/>`;
  for (let i = 0; i < 16; i++) { const rx = x - 60 * s + R() * 70 * s, ry = y - 10 * s + R() * 14 * s, rr = (2 + R() * 4) * s; g += `<path d="${smooth(blobPts(rx, ry, rr, rr * 0.8, i + 20, 6, 0.3))}" style="fill:color-mix(in srgb,var(--fg) 55%,var(--terrain))"/>`; }
  g += `<path d="${smooth(blobPts(x, y - 12 * s, 17 * s, 14 * s, 9, 9, 0.18))}" style="fill:color-mix(in srgb,var(--fg) 78%,var(--terrain));stroke:var(--coral);stroke-width:${2 * s}"/>`;
  g += G('envelope', x, y - 13 * s, 15 * s, 'var(--terrain)', { sw: 1.8 });
  return g + '</g>';
}
// a weather cloud floating over the ground, with its shadow and rain; tone: neutral | amber | coral
function cloud(x, y, rx, tone, id, o = {}) {
  const col = tone === 'coral' ? 'var(--coral)' : tone === 'amber' ? 'var(--amber)' : 'var(--fg)';
  const lift = o.lift ?? 70; let s = `<g class="cloud">`;
  s += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${rx * 0.9}" ry="${rx * 0.28}" style="fill:#000;opacity:.28" filter="url(#${id}-blur)"/>`;
  for (let i = 0; i < (o.rain ?? 7); i++) { const rx2 = x - rx * 0.5 + (i / 6) * rx; s += `<line x1="${r1(rx2)}" y1="${r1(y - lift + 8)}" x2="${r1(rx2 - 8)}" y2="${r1(y - 6)}" style="stroke:${col};stroke-width:1.2;opacity:.45;stroke-dasharray:6 7"/>`; }
  const cy = y - lift, R = rng(o.seed || 3); let puffs = '';
  const pp = [[-0.62, 0.05, 0.36], [-0.25, -0.18, 0.5], [0.18, -0.24, 0.56], [0.55, -0.02, 0.4], [0.0, 0.08, 0.5]];
  for (const [dx, dy, rr] of pp) puffs += `<circle cx="${r1(x + dx * rx)}" cy="${r1(cy + dy * rx * 0.8)}" r="${r1(rr * rx * (0.9 + R() * 0.2))}"/>`;
  const cid = `cl${Math.round(x)}${Math.round(y)}`;
  s += `<clipPath id="${cid}"><rect x="${r1(x - rx * 1.4)}" y="${r1(cy - rx * 1.2)}" width="${r1(rx * 2.8)}" height="${r1(rx * 1.42)}"/></clipPath>`;
  s += `<g clip-path="url(#${cid})"><g style="fill:none;stroke:${col};stroke-width:3;opacity:${tone === 'neutral' ? 0.35 : 0.85}">${puffs}</g><g style="fill:color-mix(in srgb,${col} ${tone === 'neutral' ? 14 : 20}%,var(--g3))">${puffs}</g><g style="fill:#fff;opacity:.07">${puffs}</g></g>`;
  s += `<path d="M${r1(x - rx * 0.92)} ${r1(cy + rx * 0.22)}H${r1(x + rx * 0.88)}" style="stroke:${col};stroke-width:1.6;opacity:${tone === 'neutral' ? 0.4 : 0.85}"/>`;
  return s + '</g>';
}

// ---------- stills ----------
function embassy([x, y], g, name, [tx, ty]) {
  return `<g class="emb"><path d="M${r1(x)} ${r1(y)}Q${r1((x + tx) / 2)} ${r1(Math.min(y, ty) - 30)} ${r1(tx)} ${r1(ty)}" style="fill:none;stroke:var(--fg);stroke-width:1.1;stroke-dasharray:3 4;opacity:.5"/>`
    + `<circle cx="${r1(x)}" cy="${r1(y)}" r="14" style="fill:var(--g3);stroke:color-mix(in srgb,var(--fg) 40%,transparent)"/>${G(g, x, y, 15, 'var(--fg)')}${T(x, y + 30, name, { size: 12.5, font: 'u', w: 500, fill: 'var(--muted)' })}</g>`;
}
const CHROME0 = { crumb: ['Company'], right: [{ i: 'eye', t: 'Owner' }, { i: 'layers', t: 'Layers' }] };
const layerChrome = (name, icon) => ({ crumb: ['Company'], right: [{ i: 'eye', t: 'Owner' }, { i: icon, t: name, on: true }] });
const embassies = (P = PC) => embassy(P(0.975, 0.4, 0), 'contract', 'Cohen Legal', P(0.88, 0.28, 0.05)) + embassy(P(0.99, 0.8, 0), 'coins', 'Accounting', P(0.92, 0.77, 0.05));

function companyStill() {
  const id = 'r1';
  return companyScene({ id, over: (p, hf) => {
    let s = haze(id);
    s += glow(p.eng.xy[0], p.eng.xy[1] + 14, 130, id, 0.9) + glow(p.design.xy[0], p.design.xy[1] + 10, 60, id, 0.6) + glow(p.support.xy[0], p.support.xy[1] + 10, 50, id, 0.45);
    const b = at([0.335, 0.632], hf); s += landslide(b[0], b[1], 0.62);
    s += cloud(p.comp.xy[0] - 6, p.comp.xy[1] + 40, 60, 'coral', id, { lift: 40, rain: 5, seed: 8 });
    s += embassies();
    s += companyPins(p);
    s += avatar(p.eng.xy[0] + 44, p.eng.xy[1] - 84, 'N', 'var(--acc)') + avatar(p.eng.xy[0] + 68, p.eng.xy[1] - 84, '✦', 'var(--ai)') + avatar(p.comp.xy[0] + 30, p.comp.xy[1] - 40, 'D', 'var(--f-rules)') + avatar(p.mkt.xy[0] + 28, p.mkt.xy[1] - 36, 'O', 'var(--h-market)');
    s += flag(p.eng.xy[0] - 150, p.eng.xy[1] - 40, 'Store go/no-go', { needs: 1 }) + flag(p.lead.xy[0] + 30, p.lead.xy[1] - 40, 'Europe first', { needs: 1 });
    return s;
  } }) + chrome(CHROME0);
}

function costStill() {
  const id = 'r2';
  return companyScene({ id, measure: 'spend', style: () => styleFor('cost'), over: (p, hf) => {
    let s = '';
    // the AI-cost stratum: a glass sheet floating above the ground, contour loops over where AI spend concentrates
    const HS = 0.86; const sheet = blobPts(0.58, 0.72, 0.21, 0.2, 4, 18, 0.1).map(([u, v]) => PC(u, v, HS));
    s += `<path d="${smooth(sheet)}" style="fill:color-mix(in srgb,var(--ai) 9%,transparent);stroke:color-mix(in srgb,var(--ai) 55%,transparent);stroke-width:1.2"/>`;
    for (const [cu, cv, n] of [[0.63, 0.84, 4], [0.5, 0.6, 3], [0.73, 0.64, 2]]) {
      for (let k = 1; k <= n; k++) { const pts = blobPts(cu, cv, 0.022 * k + 0.01, 0.02 * k + 0.01, 10 + k, 14, 0.14).map(([u, v]) => PC(u, v, HS)); s += `<path d="${smooth(pts)}" style="fill:${k === 1 ? 'color-mix(in srgb,var(--ai) 35%,transparent)' : 'none'};stroke:var(--ai);stroke-width:${k === 1 ? 1.6 : 1.1};opacity:${r1(1 - k * 0.15)}"/>`; }
      const top = PC(cu, cv, HS), g = PC(cu, cv, hf(cu, cv).h); s += `<line x1="${r1(g[0])}" y1="${r1(g[1])}" x2="${r1(top[0])}" y2="${r1(top[1])}" style="stroke:var(--ai);stroke-width:1;stroke-dasharray:2 3;opacity:.7"/>`;
    }
    s += companyPins(p, { dim: ['eng', 'support', 'mkt', 'ops'] });
    return s;
  } }) + chrome({ ...layerChrome('Cost', 'coins'), finding: { icon: 'coins', title: 'Cost', pos: 'bl', text: 'The ground is re-shaped by spend: Engineering is the peak and Support has grown. AI cost floats above as a teal stratum, densest over Support.', legend: ramp(['color-mix(in srgb,var(--glow) 30%,transparent)', 'var(--fg)'], 'less', 'more spend') + keyRow([[sw('background:var(--ai)', 'line'), 'AI cost stratum']]) } });
}

function progressStill() {
  const id = 'r3';
  return companyScene({ id, style: ({ peaks, hf }) => styleFor('progress', { peaks, hf }), over: (p) => companyPins(p, { dim: ['eng', 'comp', 'mkt', 'fin', 'design'] }) })
    + chrome({ ...layerChrome('Progress', 'sunrise'), finding: { icon: 'sunrise', title: 'Progress', pos: 'bl', text: 'Light rises up each mountain to its done share; the dotted band above is where the forecast says it will be by the goal date. Finance and Design are lit almost to the top; Compliance and Marketing are mostly dark.', legend: keyRow([[sw('background:var(--fg)', 'line'), 'done'], [sw('background:repeating-linear-gradient(90deg,var(--fg) 0 2px,transparent 2px 5px)', 'line'), 'forecast'], [sw('background:color-mix(in srgb,var(--glow) 35%,transparent)', 'line'), 'still to climb']]) } });
}

function issuesStill() {
  const id = 'r4';
  return companyScene({ id, style: () => styleFor('dim', { op: 0.5 }), over: (p) => {
    let s = '';
    const shade = (x, y, rx) => `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${rx}" ry="${r1(rx * 0.35)}" style="fill:#000;opacity:.35" filter="url(#${id}-blur)"/>`;
    s += shade(p.support.xy[0], p.support.xy[1] + 20, 110) + shade(p.eng.xy[0] - 110, p.eng.xy[1] + 150, 70) + shade(p.comp.xy[0], p.comp.xy[1] + 30, 80);
    s += companyPins(p, { dim: ['support', 'eng', 'comp'] });
    s += cloud(p.support.xy[0] + 10, p.support.xy[1] + 22, 96, 'neutral', id, { lift: 70, rain: 9, seed: 12 });
    s += cloud(p.eng.xy[0] - 110, p.eng.xy[1] + 150, 58, 'amber', id, { lift: 44, rain: 5, seed: 14 });
    s += cloud(p.comp.xy[0] - 4, p.comp.xy[1] + 40, 70, 'coral', id, { lift: 46, rain: 6, seed: 8 });
    s += T(p.eng.xy[0] - 110, p.eng.xy[1] + 184, 'Integration suite failing', { size: 13.5, font: 'u', w: 600, halo: 'var(--terrain)' });
    s += T(p.comp.xy[0], p.comp.xy[1] + 74, 'DPA signature late', { size: 13.5, font: 'u', w: 600, halo: 'var(--terrain)' });
    s += T(p.support.xy[0] + 10, p.support.xy[1] + 58, 'Issues within service levels', { size: 13.5, font: 'u', w: 500, fill: 'var(--muted)', halo: 'var(--terrain)' });
    return s;
  } }) + chrome({ ...layerChrome('Issues', 'cloud-rain'), finding: { icon: 'cloud-rain', title: 'Issues', pos: 'bl', text: 'Weather over the ground: the darker the shadow, the more it hurts. Support has the most issues but is inside its service levels. Only the failing suite and the late signature take colour.', legend: keyRow([[sw('background:color-mix(in srgb,var(--fg) 45%,var(--g3))'), 'within limits'], [sw('background:var(--amber)'), 'failing'], [sw('background:var(--coral)'), 'breached']]) } });
}

function chevrons(d, hf, pts, col, P = PC) {
  let s = ''; for (let i = 0; i < pts.length - 1; i++) { const a = at(pts[i], hf, 0.012, P), b = at(pts[i + 1], hf, 0.012, P); const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
    s += `<path d="M-4 -4L2 0L-4 4" transform="translate(${r1(m[0])} ${r1(m[1])}) rotate(${r1(ang)})" style="fill:none;stroke:${col};stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round"/>`; }
  return s;
}
function depsStill() {
  const id = 'r5';
  return companyScene({ id, style: () => styleFor('dim', { op: 0.32 }), over: (p, hf) => {
    let s = '';
    for (const k of ['prodToEng', 'designToEng', 'engToSupport', 'finToMkt', 'leadToProd', 'opsToFin']) s += roadSvg(roadPath(ROADS[k], hf), { w: 1.6, op: 0.6 });
    s += roadSvg(roadPath(ROADS.compToMkt, hf), { w: 2.2, op: 0.9 });
    const crit = [...ROADS.tokenToDisp, ...ROADS.dispToStore.slice(1), ...ROADS.storeToMkt.slice(1)];
    s += `<path d="${roadPath(crit, hf)}" style="fill:none;stroke:var(--glow);stroke-width:14;opacity:.18;stroke-linecap:round"/>` + roadSvg(roadPath(crit, hf), { w: 4, op: 1 });
    s += chevrons('', hf, crit, 'var(--terrain)');
    const b = at([0.335, 0.632], hf); s += landslide(b[0], b[1], 0.7);
    const g = at([0.84, 0.41], hf, 0.02); s += barrier(g[0], g[1] - 6, 0.9);
    s += companyPins(p, { dim: ['ops', 'eng', 'mkt', 'comp'] });
    return s;
  } }) + chrome({ ...layerChrome('Dependencies', 'route'), finding: { icon: 'route', title: 'Dependencies', pos: 'bl', text: 'Roads run along the valleys. The thick road is the critical path to the beta launch, from Operations through Engineering to Marketing; a slide blocks it below Operations, and a barrier closes the pass from Compliance.', legend: keyRow([[sw('background:var(--road)', 'line'), 'critical path'], [sw('background:color-mix(in srgb,var(--road) 50%,transparent)', 'line'), 'dependency'], [sw('background:var(--coral)', 'sq'), 'blocked']]) } });
}

function freshStill() {
  const id = 'r6';
  return companyScene({ id, style: () => (inf, v) => { const st = styleFor('base')(inf, v); const d = DOM[inf.k]; if (d.stale > 0.3 && inf.w > 0.3) return { stroke: 'color-mix(in srgb,var(--fg) 30%,var(--terrain))', sw: 1, op: q(st.op * 0.7, 20) }; return st; }, over: (p) => {
    let s = '';
    for (const k of KEYS) { const d = DOM[k]; if (d.heat > 0.15) s += glow(p[k].xy[0], p[k].xy[1] + 16, 40 + 120 * d.heat, id, 0.5 + 0.5 * d.heat); }
    s += haze(id) + haze(id) + fogBlob(...PC(0.35, 0.86, 0.06), 90, 22, 0.4, id) + fogBlob(...PC(0.15, 0.24, 0.08), 70, 16, 0.25, id);
    s += companyPins(p, { dim: ['eng', 'design', 'sales', 'people'] });
    return s;
  } }) + chrome({ ...layerChrome('Freshness', 'sparkles'), finding: { icon: 'sparkles', title: 'Freshness', pos: 'bl', text: 'Summits glow where work moved today; haze settles where nothing moved in two weeks. Partnerships is fogged in and People is going quiet.', legend: keyRow([[sw('background:radial-gradient(var(--glow),transparent 70%)'), 'moved today'], [sw('background:var(--fog)'), 'haze: no movement']]) } });
}

function problemStill() {
  const id = 'r7'; const chain = ['ops', 'eng', 'comp', 'mkt'];
  return companyScene({ id, style: () => (inf, v) => chain.includes(inf.k) && inf.w > 0.3 ? styleFor('base')(inf, v) : styleFor('dim', { op: 0.16 })(inf, v), over: (p, hf) => {
    let s = '';
    s += roadSvg(roadPath(ROADS.tokenToDisp, hf), { w: 3, op: 1 });
    s += roadSvg(roadPath([...ROADS.dispToStore, ...ROADS.storeToMkt.slice(1)], hf), { w: 3, op: 0.75, dash: '2 7' });
    s += roadSvg(roadPath(ROADS.compToMkt, hf), { w: 3, op: 0.75, dash: '2 7' });
    // items queued behind the slide: small blocks waiting on the road
    for (let i = 0; i < 5; i++) { const q2 = at([0.3 - i * 0.012, 0.637 + (i % 2) * 0.004], hf, 0.02); s += `<rect x="${r1(q2[0] - 4)}" y="${r1(q2[1] - 7)}" width="8" height="8" rx="2" style="fill:var(--fg);opacity:${r1(0.85 - i * 0.12)}"/>`; }
    const b = at([0.335, 0.632], hf); s += `<circle cx="${r1(b[0])}" cy="${r1(b[1] - 8)}" r="64" style="fill:url(#${id}-glow);opacity:.6"/>` + landslide(b[0], b[1], 1.25);
    s += T(b[0], b[1] + 34, 'Railway token', { size: 18, w: 600, halo: 'var(--terrain)', hw: 5 }) + T(b[0], b[1] + 54, 'chore · Operations · overdue', { size: 13, font: 'u', w: 500, fill: 'var(--muted)', halo: 'var(--terrain)' });
    const dsp = at([0.4, 0.57], hf); s += `<circle cx="${r1(dsp[0])}" cy="${r1(dsp[1])}" r="6" style="fill:var(--terrain);stroke:var(--fg);stroke-width:2"/>` + T(dsp[0] + 12, dsp[1] - 10, 'Dispatcher', { size: 14, font: 'u', w: 600, anchor: 'start', halo: 'var(--terrain)' });
    const st = at([0.59, 0.61], hf); s += `<circle cx="${r1(st[0])}" cy="${r1(st[1])}" r="6" style="fill:var(--terrain);stroke:var(--fg);stroke-width:2"/>` + T(st[0] + 12, st[1] + 20, 'Store submission', { size: 14, font: 'u', w: 600, anchor: 'start', halo: 'var(--terrain)' });
    s += cloud(p.comp.xy[0] - 6, p.comp.xy[1] + 44, 70, 'coral', id, { lift: 44, rain: 6, seed: 8 });
    const g = at([0.84, 0.41], hf, 0.02); s += barrier(g[0], g[1] - 6, 1.1) + T(g[0] + 22, g[1] + 4, 'DPA signature late', { size: 14, font: 'u', w: 600, anchor: 'start', halo: 'var(--terrain)' });
    s += companyPins(p, { dim: chain, skip: [] });
    s += G('clock', p.mkt.xy[0] + 40, p.mkt.xy[1] - 30, 18, 'var(--fg)');
    return s;
  } }) + chrome({ crumb: ['Company'], right: [{ i: 'eye', t: 'Owner' }, { i: 'search', t: 'What is stuck?', on: true }], finding: { icon: 'mountain', title: 'One boulder holds the beta', pos: 'bl', text: 'The Railway token chore blocks the dispatcher road; the store submission and Marketing\'s beta launch queue behind it. Over the pass, the DPA signature is late, so Europe waits too.' } });
}

// ---- Engineering (Z1): programs as terraced summits ----
const EPOS = { beta: [0.36, 0.42], ios: [0.63, 0.3], eu: [0.8, 0.6], evals: [0.22, 0.74], platform: [0.54, 0.76] };
const NB = { ops: [-0.06, 0.6, 0.32], comp: [1.0, 0.1, 0.42], mkt: [1.1, 0.72, 0.55], prod: [0.3, -0.06, 0.4] };
const PD = (u, v, h) => { const s = lerp(0.82, 1.14, v); return [740 + (u - 0.5) * 1560 * s, 300 + v * 560 - h * 290 * s]; };
const terr = (x, n = 6) => { const t = x * n, f = t - Math.floor(t); return (Math.floor(t) + sstep(0.72, 1, f)) / n; };
function domainHF(u, v) {
  let h = 0, best = null, bw = 0;
  for (const [k, [pu, pv]] of Object.entries(EPOS)) { const e = ENG[k]; const sx = 0.075 + 0.07 * Math.sqrt(e.work), g = Math.exp(-(((u - pu) / sx) ** 2 + ((v - pv) / (sx * 0.9)) ** 2) / 2); if (g > bw) { bw = g; best = k; } h = Math.max(h, terr((0.3 + 0.7 * e.work) * g * (0.9 + 0.2 * n1(u * 8, v * 8)))); }
  for (const [k, [pu, pv, a]] of Object.entries(NB)) { const g = Math.exp(-(((u - pu) / 0.11) ** 2 + ((v - pv) / 0.1) ** 2) / 2); if (g > bw) { bw = g; best = k; } h = Math.max(h, a * g * (0.85 + 0.3 * n1(u * 10, v * 10))); }
  return { h: h + 0.03 * n2(u * 9, v * 9), k: best, w: bw };
}
const hueOf = (k) => (ENG[k] ? hue('eng') : hue(k));
function domainStill() {
  const id = 'r8'; const hf = domainHF;
  const pk = {}; for (const [k, [u, v]] of Object.entries(EPOS)) { let b = [u, v, -1]; for (let du = -0.04; du <= 0.04; du += 0.01) for (let dv = -0.04; dv <= 0.04; dv += 0.01) { const h = hf(u + du, v + dv).h; if (h > b[2] + 0.005) b = [u + du, v + dv, h]; } pk[k] = b; }
  const style = (inf, v) => { const isE = !!ENG[inf.k]; const d = isE ? ENG[inf.k] : DOM[inf.k]; const lit = lerp(0.5, 1.35, clamp(0.5 + inf.sl * 0.3)); const ap = lerp(0.45, 1, v) * lit * (isE ? 1 : 0.55);
    return { stroke: `color-mix(in srgb,${hueOf(inf.k)} ${Math.round(clamp((inf.w - 0.2) * 1.5) * 6) * 10}%,var(--glow))`, sw: 1.15, op: q(ap * (0.3 + 0.6 * (d.done ?? 0.5) * clamp(inf.w * 1.6)), 20) }; };
  let s = `<svg class="world" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs>${defs(id)}</defs>`;
  s += ridges({ id, hf, P: PD, mask: () => 1, rows: 60, cols: 190, v0: 0.0, v1: 1.02, u0: -0.18, u1: 1.18, slab: 0, style });
  const xy = (k) => PD(pk[k][0], pk[k][1], pk[k][2]);
  s += glow(...xy('beta'), 140, id, 0.85);
  // the beta terrace already shows its buildings and its streams (the child before zoom)
  const [bx, by] = xy('beta');
  s += `<g opacity=".7">${[[-70, 22, 'chart'], [-34, 30, 'term'], [8, 26, 'screens'], [46, 34, 'build'], [-10, 46, 'doc']].map(([dx, dy, k]) => facade(k, bx + dx, by + dy, 26, 18)).join('')}</g>`;
  // EU residency crosses into Compliance and Marketing: one hull, cut by the frame
  const hull = blobPts(0.86, 0.56, 0.16, 0.17, 21, 16, 0.08).map(([u, v]) => PD(u, v, hf(u, v).h + 0.02));
  s += `<path d="${smooth(hull)}" style="fill:color-mix(in srgb,var(--h-govern) 10%,transparent);stroke:var(--h-govern);stroke-width:1.6;stroke-dasharray:6 5;opacity:.9"/>`;
  // neighbours at the edges, dimmed: continuity with the company depth
  for (const [k, [u, v]] of Object.entries(NB)) { if (k === 'prod') continue; let [x, y] = PD(u, v, hf(u, v).h); x = Math.min(Math.max(x, 130), 1370); s += pin(x, y, k, { r: 13, lift: 24, op: 0.55 }); }
  // the slide on the road from Operations, a small amber front over the beta
  const sl = PD(0.09, 0.56, hf(0.09, 0.56).h); s += landslide(sl[0] + 30, sl[1], 0.7);
  s += cloud(bx - 120, by + 70, 46, 'amber', id, { lift: 36, rain: 4, seed: 30 });
  for (const k of Object.keys(EPOS)) { const [x, y] = xy(k); const big = k === 'beta'; s += pin(x, y, k, { d: ENG[k], lm: ENG[k].lm, hue: hue('eng'), big, r: big ? 24 : 16, lift: big ? 60 : 34, rw: big ? 3.4 : 2.4 }); }
  s += avatar(bx + 46, by - 92, 'N', 'var(--acc)') + avatar(bx + 70, by - 92, '✦', 'var(--ai)') + flag(bx - 120, by - 70, 'Store go/no-go', { needs: 1 });
  s += G('skyline', 92, 128, 44, 'color-mix(in srgb,var(--h-build) 70%,var(--fg))', { sw: 1.6, op: 0.75 });
  s += '</svg>';
  return s + chrome({ crumb: ['Company', 'Engineering'], right: [{ i: 'eye', t: 'CTO' }, { i: 'layers', t: 'Layers' }] }) + `<div class="cont" style="position:absolute;right:30px;top:${Math.round(PD(0.9, 0.5, 0.2)[1])}px"><span class="chip">${'<i data-lucide="chevrons-right" class="ic"></i>'}Continues into Compliance · Marketing</span></div>`;
}

// ---- Private beta · Wave 71 (Z2): the terrace, its four fields (streams) and its buildings ----
const PP = (u, v, h) => { const s = lerp(0.7, 1.22, v); return [730 + (u - 0.5) * 1380 * s, 150 + v * 720 - h * 200 * s]; };
const plate = (() => { const R = rng(41), ph = [R() * 6, R() * 6]; return (u, v) => { const dx = (u - 0.5) / 0.44, dy = (v - 0.44) / 0.36, a = Math.atan2(dy, dx), d = Math.hypot(dx, dy); return (0.96 + 0.04 * Math.sin(a * 3 + ph[0]) + 0.025 * Math.sin(a * 6 + ph[1])) - d; }; })();
const FIELD = (u, v) => (v < 0.44 + 0.02 * Math.sin(u * 9) ? (u < 0.5 + 0.02 * Math.sin(v * 7) ? 'dispatcher' : 'relay') : (u < 0.48 + 0.02 * Math.sin(v * 8) ? 'evals' : 'store'));
const SPROG = { dispatcher: 0.42, relay: 0.72, evals: 0.82, store: 0.36 };
function programHF(u, v) {
  const e = plate(u, v); const top = 0.62;
  if (e > 0) return { h: top + 0.006 * n2(u * 30, v * 30), k: FIELD(u, v), w: 1, top: true };
  const fall = terr(top * sstep(-0.18, 0, e), 4) * (0.9 + 0.1 * n1(u * 9, v * 9));
  const hills = 0.12 + 0.12 * n1(u * 5 + 3, v * 5) + 0.06 * n2(u * 12, v * 12);
  return { h: Math.max(fall, hills), k: 'eng', w: 0.2, top: false };
}
function programStill() {
  const id = 'r9'; const hf = programHF;
  const style = (inf, v) => { if (inf.top) { const pr = SPROG[inf.k]; return { stroke: `color-mix(in srgb,var(--h-build) 45%,var(--glow))`, sw: 1.1, op: q(lerp(0.35, 1, v) * (0.25 + 0.6 * pr), 20) }; }
    const lit = lerp(0.5, 1.3, clamp(0.5 + inf.sl * 0.3)); return { stroke: 'var(--glow)', sw: 1, op: q(lerp(0.3, 0.7, v) * 0.42 * lit, 20) }; };
  let s = `<svg class="world" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs>${defs(id)}</defs>`;
  s += ridges({ id, hf, P: PP, mask: () => 1, rows: 74, cols: 200, v0: -0.02, v1: 1.06, u0: -0.2, u1: 1.2, slab: 0, style });
  const on = (u, v, lift = 0) => PP(u, v, 0.62 + lift);
  { const pts = []; for (let i = 0; i < 90; i++) { const a = i / 90 * Math.PI * 2; let lo = 0, hi = 0.6; for (let k = 0; k < 16; k++) { const m = (lo + hi) / 2; if (plate(0.5 + Math.cos(a) * m, 0.44 + Math.sin(a) * m) > 0) lo = m; else hi = m; } pts.push([0.5 + Math.cos(a) * lo, 0.44 + Math.sin(a) * lo]); }
    for (const f of Object.keys(SPROG)) { s += `<clipPath id="${id}f${f}"><path d="${poly(pts.map(([u, v]) => on(u, v)), true)}"/></clipPath>`; }
    const quad = { dispatcher: [[0, 0], [0.5, 0], [0.5, 0.44], [0, 0.44]], relay: [[0.5, 0], [1, 0], [1, 0.44], [0.5, 0.44]], evals: [[0, 0.44], [0.48, 0.44], [0.48, 1], [0, 1]], store: [[0.48, 0.44], [1, 0.44], [1, 1], [0.48, 1]] };
    for (const [f, qd] of Object.entries(quad)) s += `<path clip-path="url(#${id}f${f})" d="${poly(qd.map(([u, v]) => on(u, v)), true)}" style="fill:var(--glow);opacity:${r1(0.03 + 0.13 * SPROG[f] * 10) / 10}"/>`;
    s += `<path d="${smooth(pts.map(([u, v]) => on(u, v)))}" style="fill:none;stroke:var(--glow);stroke-width:1.4;opacity:.5"/>`; }
  // footpaths between the fields
  const path1 = []; for (let u = 0.08; u <= 0.93; u += 0.02) path1.push(on(u, 0.44 + 0.02 * Math.sin(u * 9)));
  const path2 = []; for (let v = 0.1; v <= 0.8; v += 0.02) path2.push(on(v < 0.44 ? 0.5 + 0.02 * Math.sin(v * 7) : 0.48 + 0.02 * Math.sin(v * 8), v));
  for (const pth of [path1, path2]) s += `<path d="${smooth(pth, false)}" style="fill:none;stroke:var(--terrain);stroke-width:4;opacity:.7"/><path d="${smooth(pth, false)}" style="fill:none;stroke:var(--glow);stroke-width:1;opacity:.35;stroke-dasharray:3 4"/>`;
  // stream names with their landmarks
  for (const [k, [u, v]] of Object.entries({ dispatcher: [0.12, 0.2], relay: [0.84, 0.17], evals: [0.1, 0.56], store: [0.86, 0.47] })) { const [x, y] = on(u, v); s += `<circle cx="${r1(x)}" cy="${r1(y - 14)}" r="15" style="fill:var(--g3)"/>` + ring(x, y - 14, 18, SPROG[k], 'var(--h-build)', { w: 2.4 }) + G(STREAMS[k].lm, x, y - 14, 17, 'color-mix(in srgb,var(--h-build) 70%,var(--fg))') + T(x + 26, y - 9, STREAMS[k].name, { size: 15, anchor: 'start', halo: 'var(--terrain)', hw: 5 }); }
  // the critical road on the terrace, down the riser to the gate
  const crit = [on(0.3, 0.3), on(0.5, 0.36), on(0.62, 0.52), on(0.72, 0.6), on(0.8, 0.52), on(0.88, 0.42), on(0.92, 0.34)];
  s += `<path d="${smooth(crit, false)}" style="fill:none;stroke:var(--glow);stroke-width:12;opacity:.16;stroke-linecap:round"/><path d="${smooth(crit, false)}" style="fill:none;stroke:var(--road);stroke-width:3;stroke-linecap:round"/>`;
  s += `<path d="${smooth([on(0.56, 0.27), on(0.62, 0.38), on(0.62, 0.52)], false)}" style="fill:none;stroke:var(--road);stroke-width:1.6;opacity:.6"/>`;
  // the Ops road climbing the riser, blocked at the edge by the token boulder
  const opsRoad = [PP(-0.12, 0.5, 0.24), PP(0.0, 0.4, 0.4), on(0.1, 0.33), on(0.3, 0.3)];
  s += `<path d="${smooth(opsRoad, false)}" style="fill:none;stroke:var(--road);stroke-width:2;opacity:.7;stroke-dasharray:2 6;stroke-linecap:round"/>`;
  const bo = on(0.08, 0.34); s += landslide(bo[0], bo[1], 0.9);
  // the gate on a knoll beyond the terrace
  const gt = on(0.92, 0.33); s += `<circle cx="${r1(gt[0])}" cy="${r1(gt[1] - 40)}" r="30" style="fill:var(--g3)"/>` + ring(gt[0], gt[1] - 40, 34, 0.58, 'var(--h-build)', { w: 3, forecast: 0.66 }) + G('gate', gt[0], gt[1] - 40, 32, 'var(--fg)') + T(gt[0], gt[1] + 12, 'Gate 1 Alpha', { size: 17, halo: 'var(--terrain)', hw: 5 });
  // buildings standing on the fields (anchored at their base; perspective scale)
  const place = [['disp-seq', 0.3, 0.3], ['disp-term', 0.2, 0.36], ['relay-ui', 0.58, 0.25], ['relay-hebrew', 0.76, 0.33], ['eval-rep', 0.2, 0.62], ['eval-mod', 0.36, 0.7], ['eval-chart', 0.33, 0.53], ['ios-build', 0.68, 0.62], ['store-sub', 0.82, 0.72]];
  const B = Object.fromEntries(BLD.map((b) => [b.id, b]));
  const order = place.slice().sort((a, b) => a[2] - b[2]);
  for (const [bid, u, v] of order) { const b = B[bid]; const [x, y] = on(u, v); const sc = lerp(0.66, 1.22, v); const w = (b.landmark ? 120 : 104) * sc, h = w * 0.68;
    s += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(w * 0.55)}" ry="${r1(w * 0.12)}" style="fill:#000;opacity:${b.built ? 0.35 : 0.15}" filter="url(#${id}-blur2)"/>`;
    s += `<line x1="${r1(x)}" y1="${r1(y)}" x2="${r1(x)}" y2="${r1(y - 10 * sc)}" style="stroke:var(--fg);stroke-width:1.4;opacity:.5"/>`;
    if (b.landmark) s += `<circle cx="${r1(x)}" cy="${r1(y - h / 2 - 10 * sc)}" r="${r1(w * 0.72)}" style="fill:url(#${id}-glow);opacity:.6"/>`;
    s += building(b.k, x - w / 2, y - h - 10 * sc, w, h, { ghost: !b.built, crit: b.built ? b.crit : null, critCol: b.crit === 1 ? 'var(--good)' : 'var(--glow)' });
    if (bid === 'disp-seq') { s += `<rect x="${r1(x - w / 2 - 4)}" y="${r1(y - h - 10 * sc - 4)}" width="${r1(w + 8)}" height="${r1(h + 8)}" rx="10" style="fill:none;stroke:var(--acc);stroke-width:2"/>`; }
  }
  const [hx, hy] = on(0.3, 0.3);
  s += `<g><rect x="${r1(hx - 150)}" y="${r1(hy - 176)}" width="300" height="56" rx="14" style="fill:var(--g3);stroke:color-mix(in srgb,#fff 25%,transparent)"/>` + T(hx - 136, hy - 153, 'Dispatcher sequencing under load', { size: 14.5, anchor: 'start', w: 600 }) + T(hx - 136, hy - 133, '4 of 6 criteria met · Noa · doing since Oct 26', { size: 12.5, anchor: 'start', font: 'u', w: 500, fill: 'var(--muted)' }) + '</g>';
  s += cloud(...on(0.56, 0.1), 50, 'amber', id, { lift: 64, rain: 4, seed: 44 });
  s += T(on(0.56, 0.1)[0], on(0.56, 0.1)[1] - 96, 'Integration suite flaky', { size: 13, font: 'u', w: 600, halo: 'var(--terrain)' });
  s += '</svg>';
  const mini = `<svg viewBox="0 0 150 96"><path d="${smooth(blobPts(75, 52, 60, 30, 5, 14, 0.12))}" style="fill:none;stroke:var(--glow);stroke-width:1.2;opacity:.6"/>${[18, 26, 34].map((y, i) => `<path d="M${30 + i * 4} ${y + 36}q20 -${14 - i * 3} 40 0t40 0" style="fill:none;stroke:var(--glow);opacity:.45"/>`).join('')}<circle cx="70" cy="46" r="6" style="fill:none;stroke:var(--acc);stroke-width:2"/></svg>`;
  return s + chrome({ crumb: ['Engineering', 'Private beta', 'Wave 71'], right: [{ i: 'layout-grid', t: 'As a board' }], mini });
}

// ---- phone: the landform cropped around Engineering, one card ----
function phoneStill() {
  const id = 'rp'; const P = (u, v, h) => { const s = lerp(0.85, 1.08, v); return [210 + (u - 0.5) * 900 * s, 250 + v * 330 - h * 250 * s]; };
  const svg = companyScene({ id, P, w: PW, h: PH, rows: 52, cols: 150, slab: 0.12, over: (p, hf) => {
    let s = glow(p.eng.xy[0], p.eng.xy[1] + 14, 90, id, 0.9);
    const b = at([0.335, 0.632], hf, 0, P); s += landslide(b[0], b[1], 0.5);
    for (const k of KEYS) { const [x, y] = p[k].xy; if (x < 30 || x > 360) continue; const big = k === 'eng'; s += pin(x, y, k, { big, r: big ? 20 : 13, lift: big ? 40 : 24, rw: big ? 3 : 2.2 }); }
    return s;
  } });
  const card = `<div class="pcard"><div class="pc-h"><svg viewBox="0 0 24 24" width="22" height="22">${G('flag', 12, 12, 22, 'var(--f-rules)')}</svg><b>Store go/no-go</b></div><p>The beta slips a week unless the Railway token lands today.</p><div class="pills"><span class="chip on">Open the fork</span><span class="chip">Later</span></div></div>`;
  return `<div class="status" data-ambient><span>9:41</span><span>●●●</span></div>` + svg + chrome({ crumb: ['Company'], right: [{ i: 'layers', t: 'Layers' }], talk: false }) + card.replace('class="pcard"', 'class="pcard" data-needs="1"');
}

export function stills() {
  return [
    { id: 'company', sky: true, glance: true, title: 'Company depth: the landform', html: companyStill(),
      caption: 'Eleven places as mountains; height is open work, so Engineering is the massif and Finance a low lit plain. Engineering\'s five programs already stand on it as sub-summits (the child inside the parent). Glow on the summits that moved today; haze in the Partnerships valley; a coral front over Compliance; a small slide on the road below Operations. Two owner flags; embassies at the coast.' },
    { id: 'domain', title: 'Domain depth: flying lower over Engineering', html: domainStill(),
      caption: 'The Engineering massif fills the frame and its sub-summits resolve into terraced programs (each step a share of the open work); the beta terrace already shows its buildings in miniature and its four fields. Operations, Compliance and Marketing stay at the edges, dimmed, where they were on the company depth; EU residency is one dashed hull that runs off the frame into Compliance and Marketing. The skyline landmark has become the corner emblem.' },
    { id: 'program', title: 'Program depth: the beta terrace', html: programStill(),
      caption: 'On the terrace: four fields (streams), furrowed and lit by their progress; buildings stand with their facades (built ones with a criteria ring, the store submission still a ghost); the evals report is a finished landmark. The critical road runs to Gate 1 Alpha on the next knoll; the road from Operations is blocked at the terrace edge by the token boulder. Hovered: the dispatcher building.' },
    { id: 'cost', glance: true, title: 'Layer: cost', html: costStill(), caption: 'The ground is re-shaped by spend instead of open work (the mountains move under you) and brightens with it; a teal stratum floats above with contour loops of AI cost, dropped to the ground where it lands.' },
    { id: 'progress', glance: true, title: 'Layer: progress', html: progressStill(), caption: 'A lit tide rises up every mountain to its done share, the dotted band above it is the forecast; dark ridges are what is still to climb. Reads without a single number.' },
    { id: 'issues', glance: true, title: 'Layer: issues', html: issuesStill(), caption: 'Weather: issue clouds cast shadows on the ground in proportion to the hurt; grey while inside service levels, amber for the failing suite, coral for the breached signature.' },
    { id: 'deps', glance: true, title: 'Layer: dependencies', html: depsStill(), caption: 'The ground dims and the valley roads light up; the critical path to the beta launch is the thick road with its direction marks, blocked by the slide; the pass from Compliance is closed by a barrier.' },
    { id: 'fresh', glance: true, title: 'Layer: freshness (Relief\'s own)', html: freshStill(), caption: 'Attention, as the landscape shows it: glow where work moved today, haze where nothing moved in two weeks, ridges going grey under the haze.' },
    { id: 'problem', glance: true, title: 'The problem picture: a slide on the valley road', html: problemStill(), caption: 'Asked "what is stuck?", the world showcases the chain: a slide with the Railway token boulder blocks the road from Operations; items queue behind it; the roads beyond it to the dispatcher, the store submission and Marketing are dotted (waiting); the pass from Compliance is closed under a coral front (DPA late).' },
    { id: 'company', phone: true, glance: true, title: 'Phone: the landform around Engineering', html: phoneStill(), caption: 'The same landform, cropped to the places around Engineering; the one thing that needs the owner is a card over the ground.' },
  ];
}
