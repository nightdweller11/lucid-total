// ---- geometry: power diagram (weighted Voronoi treemap), rounded inset cells ----
export function polyArea(p) { let a = 0; for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; a += x1 * y2 - x2 * y1; } return a / 2; }
export function centroid(p) { let a = 0, cx = 0, cy = 0; for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; const f = x1 * y2 - x2 * y1; a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f; } a /= 2; if (Math.abs(a) < 1e-9) return p[0]; return [cx / (6 * a), cy / (6 * a)]; }
export function clip(poly, a, b, c) { // keep a*x+b*y <= c
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const P = poly[i], Q = poly[(i + 1) % poly.length];
    const fp = a * P[0] + b * P[1] - c, fq = a * Q[0] + b * Q[1] - c;
    if (fp <= 0) out.push(P);
    if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) { const t = fp / (fp - fq); out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]); }
  }
  return out;
}
export function superellipse(cx, cy, rx, ry, n = 4, k = 40, wob = 0, seed = 1) {
  const pts = []; let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < k; i++) { const t = (i / k) * Math.PI * 2; const c = Math.cos(t), si = Math.sin(t); const w = 1 + wob * (rnd() - 0.5); pts.push([cx + w * rx * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), cy + w * ry * Math.sign(si) * Math.pow(Math.abs(si), 2 / n)]); }
  return pts;
}
export function powerCells(sites, boundary) {
  return sites.map((si, i) => {
    let poly = boundary.slice();
    sites.forEach((sj, j) => { if (i === j || !poly.length) return; poly = clip(poly, 2 * (sj.x - si.x), 2 * (sj.y - si.y), (sj.x * sj.x + sj.y * sj.y - sj.w) - (si.x * si.x + si.y * si.y - si.w)); });
    return poly;
  });
}
export function treemap(sites, boundary, iters = 160, pin = false) {
  const total = Math.abs(polyArea(boundary));
  const sum = sites.reduce((a, s) => a + s.t, 0);
  sites.forEach((s) => { s.w = s.w || 0; });
  let cells;
  for (let it = 0; it < iters; it++) {
    cells = powerCells(sites, boundary);
    sites.forEach((s, i) => {
      const A = cells[i].length ? Math.abs(polyArea(cells[i])) : 0; const T = total * s.t / sum;
      if (!pin && cells[i].length) { const c = centroid(cells[i]); s.x += (c[0] - s.x) * 0.5; s.y += (c[1] - s.y) * 0.5; }
      s.w += (T - A) / Math.PI * 0.6;
      // keep weights from swallowing neighbours
      let md = Infinity; sites.forEach((o) => { if (o !== s) md = Math.min(md, (o.x - s.x) ** 2 + (o.y - s.y) ** 2); });
      if (s.w > md * 0.9) s.w = md * 0.9;
    });
  }
  return powerCells(sites, boundary);
}
export function inset(poly, d) {
  if (poly.length < 3) return poly;
  const sgn = polyArea(poly) > 0 ? 1 : -1; const n = poly.length; const lines = [];
  for (let i = 0; i < n; i++) {
    const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % n]; const dx = x2 - x1, dy = y2 - y1; const L = Math.hypot(dx, dy) || 1;
    const nx = -dy / L * sgn, ny = dx / L * sgn; lines.push([x1 + nx * d, y1 + ny * d, dx, dy, L]);
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const A = lines[(i - 1 + n) % n], B = lines[i];
    const den = A[2] * B[3] - A[3] * B[2];
    if (Math.abs(den) < 1e-6 * A[4] * B[4]) { out.push([B[0], B[1]]); continue; }
    const t = ((B[0] - A[0]) * B[3] - (B[1] - A[1]) * B[2]) / den; out.push([A[0] + A[2] * t, A[1] + A[3] * t]);
  }
  return out;
}
const f1 = (n) => Math.round(n * 10) / 10;
export function rounded(poly, r = 22) {
  if (poly.length < 3) return '';
  // drop near-duplicate points
  const p = poly.filter((q, i) => { const n = poly[(i + 1) % poly.length]; return Math.hypot(q[0] - n[0], q[1] - n[1]) > 0.8; });
  const n = p.length; let d = '';
  for (let i = 0; i < n; i++) {
    const v = p[i], a = p[(i - 1 + n) % n], b = p[(i + 1) % n];
    const la = Math.hypot(a[0] - v[0], a[1] - v[1]), lb = Math.hypot(b[0] - v[0], b[1] - v[1]);
    const ta = Math.min(r / la, 0.5), tb = Math.min(r / lb, 0.5);
    const s = [v[0] + (a[0] - v[0]) * ta, v[1] + (a[1] - v[1]) * ta], e = [v[0] + (b[0] - v[0]) * tb, v[1] + (b[1] - v[1]) * tb];
    d += (i === 0 ? 'M' : 'L') + f1(s[0]) + ',' + f1(s[1]) + 'Q' + f1(v[0]) + ',' + f1(v[1]) + ' ' + f1(e[0]) + ',' + f1(e[1]);
  }
  return d + 'Z';
}
// smooth closed blob through points (Catmull-Rom to cubic)
export function blob(pts, tension = 0.5) {
  const n = pts.length; let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3];
    const c2 = [p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3];
    d += `C${f1(c1[0])},${f1(c1[1])} ${f1(c2[0])},${f1(c2[1])} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return d + 'Z';
}
export function curve(a, b, bend = 0.2) { // quadratic road between two points
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; const dx = b[0] - a[0], dy = b[1] - a[1];
  const cx = mx - dy * bend, cy = my + dx * bend; return `M${f1(a[0])},${f1(a[1])}Q${f1(cx)},${f1(cy)} ${f1(b[0])},${f1(b[1])}`;
}
// ---- v0.2 additions: organic terrain ----
export const r1 = (n) => Math.round(n * 10) / 10;
export function rng(seed = 1) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
export function chaikin(p, it = 3) {
  let q = p;
  for (let k = 0; k < it; k++) {
    const o = [];
    for (let i = 0; i < q.length; i++) { const a = q[i], b = q[(i + 1) % q.length]; o.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); }
    q = o;
  }
  return q;
}
export function resample(p, step = 26) {
  const out = []; let carry = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i], b = p[(i + 1) % p.length]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let t = carry; while (t < L) { out.push([a[0] + (b[0] - a[0]) * t / L, a[1] + (b[1] - a[1]) * t / L]); t += step; }
    carry = t - L;
  }
  return out.length > 5 ? out : p;
}
export function wobble(p, amp = 3, seed = 7) {
  const r = rng(seed); const c = centroid(p);
  return p.map(([x, y]) => { const dx = x - c[0], dy = y - c[1]; const L = Math.hypot(dx, dy) || 1; const w = (r() - 0.5) * 2 * amp; return [x + dx / L * w, y + dy / L * w]; });
}
// an organic place outline from a (power-diagram) polygon: inset, cut corners, resample, wobble, smooth
export function organic(poly, o = {}) {
  const ins = o.inset ?? 5, it = o.it ?? 4, step = o.step ?? 28, amp = o.amp ?? 2.4, seed = o.seed ?? 3;
  let p = ins ? inset(poly, ins) : poly;
  p = chaikin(p, it); p = resample(p, step); p = wobble(p, amp, seed);
  return blob(p, 0.9);
}
export function bbox(p) { const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; }
// pole of inaccessibility (coarse grid search): the best label anchor inside a polygon
export function pole(p, step = 8) {
  const [x0, y0, x1, y1] = bbox(p); let best = centroid(p), bd = -1;
  const inside = (x, y) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const [xi, yi] = p[i], [xj, yj] = p[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const dseg = (x, y, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1]; const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy); };
  for (let x = x0; x <= x1; x += step) for (let y = y0; y <= y1; y += step) {
    if (!inside(x, y)) continue; let d = Infinity; for (let i = 0; i < p.length; i++) d = Math.min(d, dseg(x, y, p[i], p[(i + 1) % p.length]));
    if (d > bd) { bd = d; best = [x, y]; }
  }
  return { at: best, r: bd };
}
// fixed-radius corner rounding returning points (quadratic corners sampled)
export function roundPts(poly, r = 24, k = 6) {
  const p = poly.filter((q, i) => { const n = poly[(i + 1) % poly.length]; return Math.hypot(q[0] - n[0], q[1] - n[1]) > 0.8; });
  const n = p.length, out = [];
  for (let i = 0; i < n; i++) {
    const v = p[i], a = p[(i - 1 + n) % n], b = p[(i + 1) % n];
    const la = Math.hypot(a[0] - v[0], a[1] - v[1]), lb = Math.hypot(b[0] - v[0], b[1] - v[1]);
    const ta = Math.min(r / la, 0.45), tb = Math.min(r / lb, 0.45);
    const s = [v[0] + (a[0] - v[0]) * ta, v[1] + (a[1] - v[1]) * ta], e = [v[0] + (b[0] - v[0]) * tb, v[1] + (b[1] - v[1]) * tb];
    for (let j = 0; j <= k; j++) { const t = j / k; const u = 1 - t; out.push([u * u * s[0] + 2 * u * t * v[0] + t * t * e[0], u * u * s[1] + 2 * u * t * v[1] + t * t * e[1]]); }
  }
  return out;
}
export function organic2(poly, o = {}) {
  let p = o.inset ? inset(poly, o.inset) : poly;
  p = roundPts(p, o.r ?? 26); p = resample(p, o.step ?? 20); p = wobble(p, o.amp ?? 1.8, o.seed ?? 3);
  return blob(p, 0.9);
}
