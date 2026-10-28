// Charts for the aspects (dataviz method: the headline is the finding, the value above the trend, thin marks,
// hairline axes, labels at the ends, a legend when there are two or more series, colours validated).
import { r1 } from './geo.mjs';
const say = (t) => `<div class="say">${t}</div>`;
const now = (v, u) => (v ? `<div class="now"><b>${v}</b><span class="mut">${u || ''}</span></div>` : '');
export const legend = (items) => `<div class="row" style="gap:16px;margin-top:8px;font-size:13px;color:var(--muted);flex-wrap:wrap">${items.map(([c, t, dash]) => `<span class="row" style="gap:6px">${dash ? `<svg width="22" height="4"><line x1="0" x2="22" y1="2" y2="2" style="stroke:${c}" stroke-width="2" stroke-dasharray="5 4"/></svg>` : `<i style="width:10px;height:10px;border-radius:3px;background:${c}"></i>`}${t}</span>`).join('')}</div>`;
// columns over time, one series, the last column emphasised
export function columns(o) {
  const W = o.w || 360, H = o.h || 140, n = o.v.length, bw = Math.min(24, (W - 20) / n - 8), max = o.max || Math.max(...o.v) * 1.15; const base = H - 22;
  const X = (i) => 10 + i * ((W - 20) / n) + ((W - 20) / n - bw) / 2;
  return `<figure class="chart" style="margin:0">${say(o.say)}${now(o.now, o.unit)}<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="${o.aria}"><line class="base" x1="0" x2="${W}" y1="${base}" y2="${base}"/>${o.v.map((v, i) => { const h = v / max * (H - 36); return `<path d="M${r1(X(i))},${base}V${r1(base - h + 4)}q0,-4 4,-4h${r1(bw - 8)}q4,0 4,4V${base}Z" style="fill:${i === n - 1 || o.all ? o.c : 'var(--ink25)'}"><title>${o.labels ? o.labels[i] + ': ' : ''}${o.fmt ? o.fmt(v) : v}</title></path>`; }).join('')}<text class="ax" x="0" y="${H - 4}">${o.x0}</text><text class="ax" x="${W}" y="${H - 4}" text-anchor="end">${o.x1}</text></svg>${o.foot ? `<figcaption class="meta">${o.foot}</figcaption>` : ''}</figure>`;
}
// stacked horizontal bars (part to whole per row); segments separated by a 2 px surface gap
export function stackRows(o) {
  const W = o.w || 360, rh = 34, H = o.rows.length * rh + 6; const max = o.max || Math.max(...o.rows.map((r) => r[1].reduce((a, b) => a + b, 0)));
  const lw = o.lw ?? 96; const bw = W - lw - 52;
  return `<figure class="chart" style="margin:0">${say(o.say)}${now(o.now, o.unit)}<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="${o.aria}" style="margin-top:6px">${o.rows.map(([name, segs, total], i) => { let x = lw; const y = i * rh + 4; const tot = segs.reduce((a, b) => a + b, 0); return `<text class="ax" x="0" y="${y + 15}" style="fill:var(--fg)">${name}</text>${segs.map((v, j) => { const w = v / max * bw; const seg = w > 2 ? `<rect x="${r1(x)}" y="${y + 3}" width="${r1(Math.max(1, w - 2))}" height="16" rx="${j === segs.length - 1 ? 4 : 1}" style="fill:${o.colors[j]}"><title>${name}, ${o.keys[j]}: ${o.fmt ? o.fmt(v) : v}</title></rect>` : ''; x += w; return seg; }).join('')}<text class="lbl" x="${r1(x + 8)}" y="${y + 15}">${total || (o.fmt ? o.fmt(tot) : tot)}</text>`; }).join('')}</svg>${legend(o.keys.map((k, j) => [o.colors[j], k]))}</figure>`;
}
// a line with a marked point and an optional threshold, one series
export function line(o) {
  const W = o.w || 360, H = o.h || 130, v = o.v, n = v.length, max = o.max ?? Math.max(...v) * 1.1, min = o.min ?? 0, base = H - 22;
  const tot = n + (o.fc ? o.fc.length - 1 : 0); const X = (i) => 6 + i * ((W - 50) / (tot - 1)); const vAt = (i) => (i < n ? v[i] : o.fc[i - n + 1]); const Y = (x) => base - (x - min) / (max - min) * (H - 36);
  const d = v.map((x, i) => `${i ? 'L' : 'M'}${r1(X(i))},${r1(Y(x))}`).join('');
  const fc = o.fc ? o.fc.map((x, i) => `${i ? 'L' : 'M'}${r1(X(n - 1 + i))},${r1(Y(x))}`).join('') : '';
  return `<figure class="chart" style="margin:0">${say(o.say)}${now(o.now, o.unit)}<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="${o.aria}" style="overflow:visible"><line class="base" x1="0" x2="${W - 40}" y1="${base}" y2="${base}"/>${o.thr != null ? `<line x1="0" x2="${W - 40}" y1="${r1(Y(o.thr))}" y2="${r1(Y(o.thr))}" style="stroke:var(--hold-h)" stroke-width="1.5"/><text class="ax" x="${W - 36}" y="${r1(Y(o.thr) + 4)}">${o.thrLabel}</text>` : ''}<path d="${d}" fill="none" style="stroke:${o.c}" stroke-width="2" stroke-linejoin="round"/>${fc ? `<path d="${fc}" fill="none" style="stroke:${o.c}" stroke-width="2" stroke-dasharray="5 5"/>` : ''}${o.mark != null ? `<circle cx="${r1(X(o.mark))}" cy="${r1(Y(vAt(o.mark)))}" r="5" style="fill:${o.c};stroke:var(--g2)" stroke-width="2"/><text class="lbl" x="${r1(X(o.mark))}" y="${r1(Y(vAt(o.mark)) - 12)}" text-anchor="${o.mark >= tot - 1 ? 'end' : 'middle'}">${o.markLabel}</text>` : ''}<text class="ax" x="0" y="${H - 4}">${o.x0}</text><text class="ax" x="${W - 40}" y="${H - 4}" text-anchor="end">${o.x1}</text></svg>${o.foot ? `<figcaption class="meta">${o.foot}</figcaption>` : ''}</figure>`;
}
