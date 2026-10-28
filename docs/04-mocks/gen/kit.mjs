// Shared scene components for frames 9-40.
import { I, AIC, g, av, agent, ring, place, chip, pill, box } from './lib.mjs';
import { world } from './world.mjs';
import { bbox, r1 } from './geo.mjs';
export const dim = (html) => `<div data-ambient>${html}</div><div class="dim"></div>`;
// a cut-out of a world: the union of some places scaled into w x h
export function cut(L, keys, w, h, o = {}) {
  const pts = keys.flatMap((k) => L.places[k].poly); const [x0, y0, x1, y1] = bbox(pts); const pad = o.pad ?? 20;
  const s = Math.min(w / (x1 - x0 + pad * 2), h / (y1 - y0 + pad * 2)); const tx = (w - (x1 - x0) * s) / 2 - x0 * s, ty = (h - (y1 - y0) * s) / 2 - y0 * s;
  return `<div class="cut${o.cls ? ' ' + o.cls : ''}" style="width:${w}px;height:${h}px;${o.style || ''}"><div class="inner" style="transform:translate(${r1(tx)}px,${r1(ty)}px) scale(${r1(s * 1000) / 1000})">${world(L, { only: o.only || keys, noNames: o.names ? [] : keys, ...o.w })}</div>${o.haze ? `<span class="haze" style="--hz:${o.haze}"></span>` : ''}${o.top || ''}</div>`;
}
export const datec = (from, to, o = {}) => `<span class="datec${o.ai ? ' ai' : ''}" role="img" aria-label="${o.aria || (from ? 'Date moves from ' + from + ' to ' + to : to)}">${I(o.icon || 'calendar')}${from ? `<s>${from}</s>${I('arrow-right')}` : ''}<span>${to}</span>${o.range ? `<span class="meta" style="font-weight:500">${o.range}</span>` : ''}</span>`;
// a path with stations (agenda, plan, repair loop): stations along a gentle curve, the current one lit
export function stations(steps, cur, w, o = {}) {
  const n = steps.length; const gap = w / (n - 1); const h = o.h || 120; const yb = o.y ?? 40;
  const pts = steps.map((_, i) => [i * gap, yb + Math.sin((i / (n - 1)) * Math.PI) * (o.arc ?? -18)]);
  const d = pts.map(([x, y], i) => (i ? `S${r1(x - gap / 2)},${r1(y)} ${r1(x)},${r1(y)}` : `M${x},${y}`)).join('');
  const done = pts.slice(0, cur + 1).map(([x, y], i) => (i ? `S${r1(x - gap / 2)},${r1(y)} ${r1(x)},${r1(y)}` : `M${x},${y}`)).join('');
  return `<div style="position:relative;width:${w}px;height:${h}px"><svg viewBox="-20 0 ${w + 40} ${h}" width="${w + 40}" height="${h}" style="position:absolute;left:-20px;top:0;overflow:visible" aria-hidden="true"><path d="${d}" fill="none" style="stroke:var(--ink25)" stroke-width="3" stroke-linecap="round"/><path d="${done}" fill="none" style="stroke:${o.ai ? 'var(--ai)' : 'var(--acc)'}" stroke-width="3" stroke-linecap="round"/></svg>${steps.map(([ic, lab], i) => { const [x, y] = pts[i]; const st = i < cur ? 'done' : i === cur ? 'now' : ''; return `<span style="position:absolute;left:${r1(x)}px;top:${r1(y)}px;transform:translate(-50%,-50%)" class="station ${st}${o.ai ? ' ai' : ''}" role="img" aria-label="${lab}${st === 'now' ? ', now' : st === 'done' ? ', done' : ''}">${I(i < cur ? 'check' : ic)}</span><span class="stlab ${st}" style="position:absolute;left:${r1(x)}px;top:${r1(y + 30)}px;transform:translateX(-50%)">${lab}</span>`; }).join('')}</div>`;
}
export const conf = (v, label = 'confidence') => `<span class="conf" role="img" aria-label="${label} ${v} percent"><span class="m"><i style="width:${v}%"></i></span>${v} % ${label}</span>`;
export const strip = (parts, cls = 'gl l2') => `<div class="strip ${cls}" role="status">${parts.map(([ic, t]) => `${ic ? (ic.startsWith('<') ? ic : I(ic)) : ''}<span>${t}</span>`).join('<i class="sep"></i>')}</div>`;
export const daci = (rows) => `<div class="daci" aria-label="Decision roles">${rows.map(([role, html, name]) => `<span class="r">${html}<span><b>${name}</b><br>${role}</span></span>`).join('')}</div>`;
// a small gauge (capacity worded as help)
export function gauge(v, label, sub, o = {}) {
  const r = 34, c = 2 * Math.PI * r * 0.75; const col = v > 1 ? 'var(--hold-h)' : 'var(--acc)';
  return `<div class="gauge"><svg viewBox="0 0 84 70" width="96" height="80" role="img" aria-label="${label}: load ${Math.round(v * 100)} percent of capacity"><path d="M14.0,63.0 A34,34 0 1 1 70.0,63.0" fill="none" style="stroke:var(--ink18)" stroke-width="7" stroke-linecap="round"/><path d="M14.0,63.0 A34,34 0 1 1 70.0,63.0" fill="none" style="stroke:${col}" stroke-width="7" stroke-linecap="round" pathLength="100" stroke-dasharray="${Math.min(100, v * 100 * 0.83)} 100"/>${o.inner || ''}</svg><b>${label}</b><span class="meta" style="max-width:180px">${sub}</span></div>`;
}
export const hint = (ic, t) => `<span class="row meta" style="gap:6px;font-size:15px">${I(ic)}${t}</span>`;
