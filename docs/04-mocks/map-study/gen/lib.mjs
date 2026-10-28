// Shared drawing kit for the map study: seeded noise, smooth organic paths, text, rings, landmark glyphs, facades,
// and the still chrome (breadcrumb, dock, Talk, chips, finding card). Everything is SVG authored here; Lucide is used
// only for the buttons in the chrome. Coordinates are 1:1 pixels (desktop 1440 x 900, phone 390 x 844).
export const W = 1440, H = 900, PW = 390, PH = 844;

export function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export const r1 = (n) => Math.round(n * 10) / 10;
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

// smooth value noise in 2D (deterministic)
export function noise2(seed) {
  const R = rng(seed), P = Array.from({ length: 256 }, () => R());
  const h = (i, j) => P[(i * 73856093 ^ j * 19349663) & 255];
  return (x, y) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    return lerp(lerp(h(i, j), h(i + 1, j), u), lerp(h(i, j + 1), h(i + 1, j + 1), u), v); };
}

// Catmull-Rom through points, as cubic Bezier path. closed: loop.
export function smooth(pts, closed = true, t = 1) {
  const n = pts.length; if (n < 2) return '';
  const P = (i) => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * t, p1[1] + (p2[1] - p0[1]) / 6 * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6 * t, p2[1] - (p3[1] - p1[1]) / 6 * t];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}
export const poly = (pts, closed = false) => 'M' + pts.map((p) => `${r1(p[0])} ${r1(p[1])}`).join('L') + (closed ? 'Z' : '');

// organic closed outline around a centre
export function blobPts(cx, cy, rx, ry, seed, n = 16, amp = 0.12, rot = 0) {
  const R = rng(seed), ph = [R() * 6.28, R() * 6.28, R() * 6.28];
  return Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2 + rot;
    const k = 1 + amp * (Math.sin(a * 2 + ph[0]) * 0.55 + Math.sin(a * 3 + ph[1]) * 0.3 + Math.sin(a * 5 + ph[2]) * 0.15);
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]; });
}
export const blob = (...a) => smooth(blobPts(...a));

// ---- text (sizes in px; anything > 15.5 px counts as a text element above body size) ----
export function T(x, y, s, o = {}) {
  const fam = o.font === 'u' ? 'var(--ui)' : 'var(--display)';
  const st = [`font-family:${fam}`, `font-size:${o.size || 14}px`, `font-weight:${o.w || (o.font === 'u' ? 500 : 600)}`, `fill:${o.fill || 'var(--fg)'}`];
  if (o.ls) st.push(`letter-spacing:${o.ls}`); if (o.op != null) st.push(`opacity:${o.op}`);
  if (o.halo) st.push(`paint-order:stroke;stroke:${o.halo};stroke-width:${o.hw || 4}px;stroke-linejoin:round`);
  return `<text x="${r1(x)}" y="${r1(y)}" text-anchor="${o.anchor || 'middle'}"${o.cls ? ` class="${o.cls}"` : ''}${o.amb ? ' data-ambient' : ''} style="${st.join(';')}">${esc(s)}</text>`;
}

// ---- ring: progress with a forecast tick ----
export function ring(cx, cy, r, share, hue, o = {}) {
  const w = o.w || 3, c = 2 * Math.PI * r, f = o.forecast;
  let s = `<g class="ring"${o.op != null ? ` opacity="${o.op}"` : ''}>`;
  s += `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" style="fill:none;stroke:${o.track || 'color-mix(in srgb,var(--fg) 18%,transparent)'};stroke-width:${w}"/>`;
  s += `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" transform="rotate(-90 ${r1(cx)} ${r1(cy)})" style="fill:none;stroke:${hue};stroke-width:${w};stroke-linecap:round;stroke-dasharray:${r1(c * share)} ${r1(c)}"/>`;
  if (f != null) { const a = -Math.PI / 2 + f * Math.PI * 2; s += `<line x1="${r1(cx + Math.cos(a) * (r + w / 2 + 1))}" y1="${r1(cy + Math.sin(a) * (r + w / 2 + 1))}" x2="${r1(cx + Math.cos(a) * (r + w / 2 + 5))}" y2="${r1(cy + Math.sin(a) * (r + w / 2 + 5))}" style="stroke:var(--fg);stroke-width:1.6;stroke-linecap:round;opacity:.8"/>`; }
  return s + '</g>';
}

// ---- landmark and kind glyphs (24-unit grid, stroked; never Lucide) ----
export const GL = {
  skyline: 'M3 21h18M5 21V11h4v10M9 21V5h5v16M14 21v-8h5v8M11.5 8v1M11.5 12v1M11.5 16v1',
  workshop: 'M3 21V11l5 3v-3l5 3v-3l5 3V5h3v16zM7 18h2M12 18h2',
  loom: 'M4 3v18M20 3v18M4 6h16M4 18h16M8 6v12M12 6v12M16 6v12M4 12c5-3 11 3 16 0',
  harbour: 'M12 3v12M12 4l6 10h-6M11 7l-5 7h5M3 16h18l-2.5 3h-13zM2 21.5c2.5 1 4 1 6.5 0s4-1 6.5 0 4 1 6.5 0',
  bridge: 'M2 16h20M5 16v-3M19 16v-3M3 13c4-7 14-7 18 0M8.5 16v-6.5M12 16V8M15.5 16v-6.5M2 20h20',
  beacon: 'M12 10v11M8 21l4-11 4 11M9.4 16.5h5.2M8.5 7a5 5 0 0 1 7 0M6 4.5a8.5 8.5 0 0 1 12 0',
  vault: 'M4 4h16v15H4zM12 8a3.6 3.6 0 1 0 0 7.2A3.6 3.6 0 0 0 12 8zM12 11.6h2.4M6.5 19v2M17.5 19v2',
  gears: 'M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6zM12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1',
  greenhouse: 'M3 21V11l9-7 9 7v10zM3 21h18M12 4v17M7.5 7.5V21M16.5 7.5V21M3 15.5h18',
  lighthouse: 'M10 21l1-11h2l1 11M9 10h6M10.2 10V7h3.6v3M12 3.5L10 7h4zM8 21h8M3.5 5l4.5 2.5M20.5 5L16 7.5',
  summit: 'M2 20l7-12 4 6 3-4 6 10zM7.2 11.2l1.8 1.3 1.6-1.4',
  rocket: 'M12 2.5c3 2.2 4.8 6 4 10.5l-1 3H9l-1-3c-.8-4.5 1-8.3 4-10.5zM12 7.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M9 15l-3 3.5 1-5M15 15l3 3.5-1-5M10.5 18.5h3L12 22z',
  flask: 'M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M7.2 15h9.6',
  store: 'M3 9l2-5h14l2 5M4 9v12h16V9M3 9c0 2.2 4.5 2.2 4.5 0 0 2.2 4.5 2.2 4.5 0 0 2.2 4.5 2.2 4.5 0 0 2.2 4.5 2.2 4.5 0M10 21v-5h4v5',
  shield: 'M12 3l8 3v6c0 5-3.6 8-8 9-4.4-1-8-4-8-9V6zM12 8.5v.01M9 10.5v.01M15 10.5v.01M10 14v.01M14 14v.01',
  gate: 'M4 21V10a8 8 0 0 1 16 0v11M8 21V11a4 4 0 0 1 8 0v10M2 21h20',
  dispatch: 'M3 12h6l4-6h7M9 12l4 6h7M17 3.5l3 2.5-3 2.5M17 15.5l3 2.5-3 2.5',
  relay: 'M4 8h11M12 4.5L15.5 8 12 11.5M20 16H9M12 12.5L8.5 16l3.5 3.5',
  phone: 'M8 2.5h8a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2zM11 18.5h2',
  layers: 'M3.5 8L12 3.8 20.5 8 12 12.2zM3.5 12.5L12 16.7l8.5-4.2M3.5 17L12 21.2l8.5-4.2',
  envelope: 'M3 6h18v12H3zM3 6.5l9 6.5 9-6.5',
  contract: 'M6 3h9l4 4v14H6zM15 3v4h4M8.5 17c1.2-2.4 2.2 1.2 3.4-1.1s2.4 1.3 3.6 0',
  megaphone: 'M3 10v4h3l7 5V5L6 10zM16 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11',
  coins: 'M12 4c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5',
  sail: 'M5 19h14l-2 2.5H7zM11 3v15M11 4l7 12h-7M10 7l-5 9h5',
  people: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.5-3.8 3.2-6 6.5-6s6 2.2 6.5 6M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.4c2 .8 3.2 2.7 3.5 5.6',
  chore: 'M7 11V5.5a1.5 1.5 0 0 1 3 0V11M10 10V4a1.5 1.5 0 0 1 3 0v6M13 10V5a1.5 1.5 0 0 1 3 0v6M16 10.5V8a1.5 1.5 0 0 1 3 0v6a8 8 0 0 1-8 8h-.5A6.5 6.5 0 0 1 5 17l-2-4.5a1.5 1.5 0 0 1 2.6-1.4L7 13',
  key: 'M14.5 4a5.5 5.5 0 1 1-4.6 8.5L3 19.5V22h3v-2h2v-2h2l1.4-1.4A5.5 5.5 0 0 1 14.5 4zM16 8.5v.01',
  flag: 'M5 21V3.5M5 4h12l-3 4 3 4H5',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  drop: 'M12 3c3.5 4.5 6 8 6 11a6 6 0 0 1-12 0c0-3 2.5-6.5 6-11z',
  cloud: 'M7 18a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 8.5a4.5 4.5 0 0 1-.5 9.5z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3.5 2',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  bus: 'M5 4h14a1 1 0 0 1 1 1v12H4V5a1 1 0 0 1 1-1zM4 11h16M7 20v-3M17 20v-3M7.5 14h.01M16.5 14h.01',
  satellite: 'M7 7l4-4 4 4-4 4zM13 13l4-4 4 4-4 4zM9 9l6 6M4 16a4 4 0 0 0 4 4M3 12a9 9 0 0 0 9 9',
  sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8',
};
export function G(name, x, y, size = 24, col = 'var(--fg)', o = {}) {
  const k = size / 24;
  return `<path d="${GL[name]}" transform="translate(${r1(x - size / 2)} ${r1(y - size / 2)}) scale(${r1(k * 1000) / 1000})" style="fill:none;stroke:${col};stroke-width:${o.sw || 1.7};stroke-linecap:round;stroke-linejoin:round${o.op != null ? ';opacity:' + o.op : ''}" vector-effect="non-scaling-stroke"/>`;
}

// ---- small marks ----
export function flag(x, y, label, o = {}) {
  // Rules-indigo banner on a pole; data-needs when it is a thing that needs the viewer
  const big = !!label, hue = 'var(--f-rules)';
  let s = `<g class="flag"${o.needs ? ' data-needs="1"' : ''}>`;
  s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - (big ? 34 : 22)}" style="stroke:color-mix(in srgb,var(--fg) 70%,transparent);stroke-width:1.5"/>`;
  if (big) {
    const w = 14 + label.length * 7.6;
    s += `<path d="M${x} ${y - 34}h${r1(w)}l-7 9 7 9H${x}z" style="fill:color-mix(in srgb,${hue} 78%,var(--ground-base));stroke:color-mix(in srgb,#fff 35%,transparent);stroke-width:.8"/>`;
    s += T(x + 8, y - 20.5, label, { size: 13, anchor: 'start', font: 'u', w: 600, fill: '#fff' });
  } else s += `<path d="M${x} ${y - 22}h13l-3.5 4.5 3.5 4.5H${x}z" style="fill:${hue}"/>`;
  return s + '</g>';
}
export function barrier(x, y, s = 1, col = 'var(--block-h)') {
  const w = 26 * s, h = 7 * s;
  return `<g class="barrier"><line x1="${r1(x - w / 2 + 3)}" y1="${r1(y)}" x2="${r1(x - w / 2 + 3)}" y2="${r1(y + 12 * s)}" style="stroke:var(--fg);stroke-width:${1.6 * s}"/><line x1="${r1(x + w / 2 - 3)}" y1="${r1(y)}" x2="${r1(x + w / 2 - 3)}" y2="${r1(y + 12 * s)}" style="stroke:var(--fg);stroke-width:${1.6 * s}"/>`
    + `<rect x="${r1(x - w / 2)}" y="${r1(y - h / 2)}" width="${r1(w)}" height="${r1(h)}" rx="${r1(h / 2)}" style="fill:${col}"/>`
    + `<path d="M${r1(x - w / 2 + 6 * s)} ${r1(y + h / 2)}l${r1(5 * s)} ${r1(-h)}M${r1(x - 1 * s)} ${r1(y + h / 2)}l${r1(5 * s)} ${r1(-h)}M${r1(x + w / 2 - 8 * s)} ${r1(y + h / 2)}l${r1(5 * s)} ${r1(-h)}" style="stroke:#fff;stroke-width:${2 * s};opacity:.85"/></g>`;
}
export function avatar(x, y, ch, hue = 'var(--acc)', o = {}) {
  const r = o.r || 11;
  return `<g class="av"><circle cx="${x}" cy="${y}" r="${r}" style="fill:color-mix(in srgb,${hue} 45%,var(--ground-base));stroke:${o.ring || 'color-mix(in srgb,var(--fg) 55%,transparent)'};stroke-width:1.6"/>`
    + `<text x="${x}" y="${r1(y + r * 0.36)}" text-anchor="middle" style="font-family:var(--ui);font-size:${r1(r * 0.95)}px;font-weight:700;fill:#fff">${esc(ch)}</text></g>`;
}
export const haloFilter = (id, sd = 6) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;

// ---- facades: placeholder product images drawn in SVG (no text; class fac is excluded from the text count) ----
export function facade(kind, x, y, w, h, o = {}) {
  const id = 'fc' + Math.round(x * 7 + y * 13 + w);
  const g = o.ghost;
  let s = `<g class="fac" transform="translate(${r1(x)} ${r1(y)})"${g ? ' opacity=".5"' : ''}>`;
  const frame = (fill) => `<rect width="${r1(w)}" height="${r1(h)}" rx="${r1(Math.min(8, w * 0.08))}" style="fill:${fill};stroke:${g ? 'var(--fg)' : 'color-mix(in srgb,#fff 55%,transparent)'};stroke-width:${g ? 1.2 : 1};${g ? 'stroke-dasharray:4 3' : ''}"/>`;
  const bar = (bx, by, bw, bh, c, op = 1) => `<rect x="${r1(bx)}" y="${r1(by)}" width="${r1(bw)}" height="${r1(bh)}" rx="${r1(bh / 2)}" style="fill:${c};opacity:${op}"/>`;
  if (kind === 'screens') {
    s += frame(g ? 'transparent' : '#e9f0fd');
    const sw = w * 0.36, sh = h * 0.8;
    for (const [i, ox] of [[0, w * 0.1], [1, w * 0.54]]) {
      s += `<rect x="${r1(ox)}" y="${r1(h * 0.1)}" width="${r1(sw)}" height="${r1(sh)}" rx="${r1(sw * 0.14)}" style="fill:#13306e"/>`;
      for (let k = 0; k < 4; k++) s += bar(ox + sw * (k % 2 ? 0.3 : 0.1), h * 0.2 + k * sh * 0.18, sw * 0.6, sh * 0.1, k % 2 ? '#5fe3cf' : '#7fb2ff', i ? 0.9 : 0.75);
    }
  } else if (kind === 'chart') {
    s += frame(g ? 'transparent' : '#f5f8ff');
    const pts = [[0.1, 0.78], [0.25, 0.7], [0.4, 0.66], [0.55, 0.52], [0.7, 0.46], [0.85, 0.3], [0.92, 0.26]].map(([a, b]) => [a * w, b * h]);
    s += `<path d="M${r1(w * 0.1)} ${r1(h * 0.4)}H${r1(w * 0.92)}" style="stroke:#3d8bff;stroke-width:1;stroke-dasharray:3 3;opacity:.7"/>`;
    s += `<path d="${poly(pts)}" style="fill:none;stroke:#2f66d8;stroke-width:${r1(Math.max(1.4, w / 60))};stroke-linejoin:round"/>` + bar(w * 0.1, h * 0.1, w * 0.4, Math.max(3, h * 0.06), '#1b2f63', 0.7);
  } else if (kind === 'doc' || kind === 'contract') {
    s += frame(g ? 'transparent' : '#fbfcff');
    s += `<rect x="${r1(w * 0.08)}" y="${r1(h * 0.08)}" width="${r1(w * 0.84)}" height="${r1(h * 0.22)}" rx="3" style="fill:${kind === 'doc' ? '#5b3fd6' : '#1b2f63'};opacity:.9"/>`;
    for (let k = 0; k < 4; k++) s += bar(w * 0.1, h * (0.4 + k * 0.1), w * (k === 3 ? 0.45 : 0.75), Math.max(2, h * 0.04), '#8896b8', 0.8);
    if (kind === 'contract') s += `<path d="M${r1(w * 0.52)} ${r1(h * 0.86)}h${r1(w * 0.36)}" style="stroke:#1b2f63;stroke-width:1.2;stroke-dasharray:3 2"/>`;
  } else if (kind === 'build') {
    s += frame(g ? 'transparent' : '#101a33');
    s += `<rect x="${r1(w * 0.1)}" y="${r1(h * 0.18)}" width="${r1(h * 0.36)}" height="${r1(h * 0.36)}" rx="${r1(h * 0.08)}" style="fill:#8fd3ff"/><path d="M${r1(w * 0.1 + h * 0.07)} ${r1(h * 0.42)}c${r1(h * 0.08)}-${r1(h * 0.2)} ${r1(h * 0.14)} ${r1(h * 0.1)} ${r1(h * 0.22)}-${r1(h * 0.1)}" style="fill:none;stroke:#13306e;stroke-width:2"/>`;
    s += bar(w * 0.1 + h * 0.46, h * 0.24, w * 0.4, Math.max(3, h * 0.07), '#e2ebff', 0.8) + bar(w * 0.1 + h * 0.46, h * 0.38, w * 0.28, Math.max(2, h * 0.05), '#8896b8', 0.8);
    s += bar(w * 0.1, h * 0.72, w * 0.8, Math.max(3, h * 0.07), '#2a3a63') + bar(w * 0.1, h * 0.72, w * 0.56, Math.max(3, h * 0.07), '#47d16c');
  } else if (kind === 'term') {
    s += frame(g ? 'transparent' : '#0d1528');
    const cs = ['#47d16c', '#7fb2ff', '#c8d3ea', '#c8d3ea', '#5fe3cf', '#c8d3ea'];
    for (let k = 0; k < 6; k++) s += bar(w * 0.1, h * (0.14 + k * 0.13), w * (0.3 + ((k * 37) % 50) / 100), Math.max(2, h * 0.05), cs[k], 0.85);
  } else if (kind === 'listing') {
    s += frame(g ? 'transparent' : '#f1f5fd');
    s += `<rect x="${r1(w * 0.08)}" y="${r1(h * 0.1)}" width="${r1(h * 0.22)}" height="${r1(h * 0.22)}" rx="${r1(h * 0.05)}" style="fill:#3d8bff"/>` + bar(w * 0.08 + h * 0.28, h * 0.14, w * 0.4, Math.max(3, h * 0.06), '#1b2f63', 0.8);
    for (let k = 0; k < 3; k++) s += `<rect x="${r1(w * (0.08 + k * 0.3))}" y="${r1(h * 0.42)}" width="${r1(w * 0.25)}" height="${r1(h * 0.48)}" rx="3" style="fill:#13306e;opacity:${0.95 - k * 0.15}"/>`;
  } else if (kind === 'campaign') {
    s += `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a5cff"/><stop offset="1" stop-color="#22b8f0"/></linearGradient></defs>` + frame(g ? 'transparent' : `url(#${id})`);
    s += bar(w * 0.1, h * 0.58, w * 0.6, Math.max(3, h * 0.08), '#fff', 0.95) + bar(w * 0.1, h * 0.72, w * 0.4, Math.max(2, h * 0.05), '#fff', 0.7);
    s += `<circle cx="${r1(w * 0.72)}" cy="${r1(h * 0.3)}" r="${r1(h * 0.16)}" style="fill:#fff;opacity:.35"/>`;
  }
  return s + '</g>';
}
// a facade standing as a building: a rounded card with a soft shadow, a criteria ring at the top-end corner
export function building(kind, x, y, w, h, o = {}) {
  let s = `<g class="bld">`;
  if (!o.ghost) s += `<rect x="${r1(x + 3)}" y="${r1(y + 6)}" width="${r1(w)}" height="${r1(h)}" rx="7" style="fill:var(--shadow);filter:blur(5px)"/>`;
  s += facade(kind, x, y, w, h, o);
  if (o.crit != null) s += `<circle cx="${r1(x + w)}" cy="${r1(y)}" r="7.5" style="fill:var(--ground-base)"/>` + ring(x + w, y, 6, o.crit, o.critCol || 'var(--good)', { w: 2.4 });
  return s + '</g>';
}

// ---- the still chrome (HTML over the SVG) ----
export const I = (n, cls = 'ic') => `<i data-lucide="${n}" class="${cls}"></i>`;
export function chrome(o = {}) {
  let s = '';
  if (o.crumb) s += `<div class="crumb"><i data-lucide="total-mark" class="ic tm"></i>${o.crumb.map((c, i) => i === o.crumb.length - 1 ? `<b>${esc(c)}</b>` : `<span>${esc(c)}</span>${I('chevron-right', 'ic sep')}`).join('')}</div>`;
  if (o.right) s += `<div class="tr">${o.right.map((c) => `<span class="chip${c.on ? ' on' : ''}">${I(c.i)}${esc(c.t)}</span>`).join('')}</div>`;
  if (o.dock !== false) s += `<nav class="dock" aria-label="Dock">${['sunrise', 'map', 'circle-user', 'message-circle', 'layout-grid'].map((n, i) => `<span class="db${i === 1 ? ' on' : ''}">${I(n)}</span>`).join('')}</nav>`;
  if (o.talk !== false) s += `<div class="talk">${'<i data-lucide="total-mark" class="ic tm"></i>'}<span>${esc(o.ask || 'Ask, or tell Lucid what to show')}</span><span class="tk">${I('slash')}</span><span class="tk">${I('mic')}</span></div>`;
  if (o.finding) { const f = o.finding; s += `<aside class="finding${f.pos ? ' ' + f.pos : ''}"><div class="fh">${I(f.icon || 'layers')}<b>${esc(f.title)}</b></div><p>${esc(f.text)}</p>${f.legend || ''}</aside>`; }
  if (o.mini) s += `<div class="mini">${o.mini}</div>`;
  return s;
}
// a legend ramp: swatches with two end words
export function ramp(cols, a, b) { return `<div class="ramp"><span>${esc(a)}</span><i style="background:linear-gradient(90deg,${cols.join(',')})"></i><span>${esc(b)}</span></div>`; }
export function keyRow(items) { return `<div class="keys">${items.map(([sw, t]) => `<span>${sw}${esc(t)}</span>`).join('')}</div>`; }
export const sw = (css, shape = 'dot') => `<i class="sw ${shape}" style="${css}"></i>`;
