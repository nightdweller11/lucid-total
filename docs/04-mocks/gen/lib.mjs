// Shell and primitives for the Lucid Total mocks v0.2.
import { lm } from './landmarks.mjs';
export const I = (n, c = '') => `<i data-lucide="${n}" class="ic${c ? ' ' + c : ''}"></i>`;
export const AI = (c = '') => `<i data-lucide="lucid-mark" data-mono class="ic${c ? ' ' + c : ''}"></i>`;
export const AIC = (c = '') => `<i data-lucide="lucid-mark" class="ic${c ? ' ' + c : ''}"></i>`;
export const TM = (c = '') => `<i data-lucide="total-mark" class="ic${c ? ' ' + c : ''}"></i>`;
const r2 = (v) => Math.round(v * 100) / 100;

// kind families (v0.1, unchanged)
export const KINDS = {
  task: ['sky', 'square-check-big', 'Task'], story: ['sky', 'book-open', 'Story'], bug: ['heat', 'bug', 'Bug'], incident: ['heat', 'zap', 'Incident'],
  issue: ['warm', 'life-buoy', 'Issue'], chore: ['lime', 'hand', 'Chore'], reminder: ['lime', 'bell-ring', 'Reminder'], meeting: ['lime', 'users-round', 'Meeting'],
  decision: ['rules', 'signpost', 'Decision'], proposal: ['rules', 'lightbulb', 'Proposal'], ask: ['rules', 'message-circle-question', 'Ask'],
  goal: ['gold', 'target', 'Goal'], milestone: ['gold', 'milestone', 'Gate'], risk: ['sharp', 'cloud-lightning', 'Risk'], budget: ['violet', 'wallet', 'Budget'],
  account: ['violet', 'key-square', 'Account'], lesson: ['drift', 'graduation-cap', 'Lesson'], envelope: ['slate', 'vault', 'Envelope'], party: ['slate', 'landmark', 'Party'],
  feedback: ['rules', 'message-square-heart', 'Feedback request'], agent: ['lucid', 'bot', 'Agent'],
};
export const g = (kind, size = '', label = '') => { const [f, ic, l] = KINDS[kind]; return `<span class="g f-${f}${size ? ' ' + size : ''}" role="img" aria-label="${label || l}" title="${label || l}">${I(ic)}</span>`; };
export const aiG = (size = '') => `<span class="g f-lucid${size ? ' ' + size : ''}" role="img" aria-label="Lucid, the AI" title="Lucid, the AI">${AIC()}</span>`;
export const PEOPLE = { Y: ['Y', 'p1', 'Yossi, owner'], D: ['D', 'p2', 'Dana, compliance'], O: ['O', 'p3', 'Omer, marketing'], N: ['N', 'p4', 'Noa, engineering lead'] };
export const av = (k, st = '', size = '') => { const [i, c, l] = PEOPLE[k]; const s = { doing: 'working', wait: 'waiting', stop: 'stopped' }[st] || ''; return `<span class="av ${c}${st ? ' s-' + st : ''}${size ? ' ' + size : ''}" role="img" aria-label="${l}${s ? ', ' + s : ''}" title="${l}${s ? ', ' + s : ''}">${i}</span>`; };
// agents: four states only (idle · working · waiting · stopped), and they say they are agents
export const agent = (name, st = 'doing', size = '') => { const s = { doing: 'working', wait: 'waiting', stop: 'stopped', idle: 'idle' }[st]; return `<span class="av ag${st !== 'idle' ? ' s-' + st : ''}${size ? ' ' + size : ''}" role="img" aria-label="Agent: ${name}, ${s}" title="Agent: ${name}, ${s}">${I('bot')}</span>`; };
export const chip = (icon, label, cls = '', aria = '') => `<span class="chip ${cls}" role="button" tabindex="0" aria-label="${aria || label}">${icon ? (icon.startsWith('<') ? icon : I(icon)) : ''}<span>${label}</span></span>`;
export const pill = (icon, label, cls = '', aria = '') => `<span class="pill ${cls}" role="button" tabindex="0" aria-label="${aria || label}">${icon ? (icon.startsWith('<') ? icon : I(icon)) : ''}${label ? `<span>${label}</span>` : ''}</span>`;

// ---- ring: 360° progress with a forecast tick outside (done share in the hue, remainder at 18 % ink) ----
// pct: done share 0..1; fc: share the forecast reaches by the target date (the tick); segs: criteria segments
export function ring(size, pct, o = {}) {
  const w = o.w ?? (size >= 96 ? 6 : 3); const tickRoom = o.fc != null ? (size >= 96 ? 9 : 6) : 0;
  const r = size / 2 - w / 2 - tickRoom; const c = size / 2;
  let s = `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${o.label || Math.round(pct * 100) + ' percent done'}">`;
  if (o.segs) {
    const n = o.segs.length, gap = o.gap ?? 3.2;
    o.segs.forEach((st, i) => { const len = 100 / n - gap; s += `<circle class="trk seg-${st}" cx="${c}" cy="${c}" r="${r2(r)}" stroke-width="${w}" pathLength="100" stroke-dasharray="${r2(len)} ${r2(100 - len)}" stroke-dashoffset="${r2(-(i * 100 / n + gap / 2) + 25)}" stroke-linecap="round"${o.hi === i ? ' style="stroke-width:' + (w + 3) + 'px"' : ''}/>`; });
  } else {
    s += `<circle class="trk" cx="${c}" cy="${c}" r="${r2(r)}" stroke-width="${w}"/>`;
    if (pct > 0) s += `<circle class="val" cx="${c}" cy="${c}" r="${r2(r)}" stroke-width="${w}" pathLength="100" stroke-dasharray="${r2(pct * 100)} 100" stroke-dashoffset="25"${o.ghost ? ' style="stroke-dasharray:3 4;stroke:var(--ai)"' : ''}/>`;
    if (o.band) { const [a, b] = o.band; s += `<circle cx="${c}" cy="${c}" r="${r2(r + w / 2 + tickRoom / 2)}" fill="none" stroke="var(--ai)" stroke-opacity=".45" stroke-width="${tickRoom - 1}" pathLength="100" stroke-dasharray="${r2((b - a) * 100)} 100" stroke-dashoffset="${r2(25 - a * 100)}"/>`; }
  }
  if (o.fc != null) { const a = -Math.PI / 2 + o.fc * Math.PI * 2; const r0 = r + w / 2 + 1, r1 = r + w / 2 + tickRoom; s += `<line class="tick" x1="${r2(c + r0 * Math.cos(a))}" y1="${r2(c + r0 * Math.sin(a))}" x2="${r2(c + r1 * Math.cos(a))}" y2="${r2(c + r1 * Math.sin(a))}"/>`; }
  return s + '</svg>';
}
// ---- a place: landmark inside its ring, the name beneath (subject on hover) ----
export function place(p, o = {}) {
  // On the terrain a landmark stands free inside its ring (no disc); tiles, cards and the phone keep a disc (o.disc).
  const size = o.size || 'm'; const disc = !!o.disc;
  const R = disc ? { xs: 48, s: 62, m: 80, l: 104, xl: 140 }[size] : { xs: 56, s: 72, m: 100, l: 132, xl: 168 }[size];
  const L = disc ? { xs: 24, s: 32, m: 42, l: 54, xl: 72 }[size] : { xs: 34, s: 44, m: 62, l: 84, xl: 108 }[size];
  const w = R >= 120 ? 6 : 3; const dd = R - (R >= 96 ? 34 : 22);
  const nm = o.noName ? '' : `<span class="nm"${o.he && p.he ? ' lang="he"' : ''}>${o.he && p.he ? p.he : p.name}</span>`;
  const inner = disc ? `<span class="disc" style="width:${dd}px;height:${dd}px">${lm(p.lm, L)}</span>` : `<span class="free">${lm(p.lm, L)}</span>`;
  return `<div class="place ${size === 'xs' || size === 's' ? 's' : size === 'l' || size === 'xl' ? 'l' : ''} h-${p.hue}${o.cls ? ' ' + o.cls : ''}" role="button" tabindex="0" aria-label="${p.name}: ${p.subj}. ${Math.round(p.prog * 100)} percent done" title="${p.subj}"><span class="md" style="width:${R}px;height:${R}px">${ring(R, p.prog, { fc: p.fc, w, ghost: o.ghostRing, band: o.band })}${inner}</span>${nm}${o.sub || ''}</div>`;
}
// ---- flags ----
export const flag = (label, icon = 'signpost', aria = '', needs = true) => `<span class="flag"${needs ? ' data-needs="1"' : ''} role="button" tabindex="0" aria-label="Decision waiting: ${aria || label}"><span class="pole"></span><span class="ban">${I(icon)}${label}</span></span>`;
export const flagSm = (aria) => `<span class="flag sm" role="img" aria-label="Decision waiting: ${aria}" title="Decision waiting: ${aria}"><span class="pole"></span><span class="ban"></span></span>`;
// ---- embassy ----
export const embassy = (icon, name, cls = '', aria = '') => `<span class="emb ${cls}" role="button" tabindex="0" aria-label="Party: ${aria || name}"><span class="e">${I(icon)}</span><span class="nm">${name}</span></span>`;
// ---- building with a facade ----
export function building(facade, o = {}) {
  const segs = o.segs; const cr = segs ? `<span class="cr">${ring(22, 0, { segs, w: 3, gap: 6, label: o.critLabel || 'Criteria' })}</span>` : '';
  return `<div class="bld${o.exp ? ' exp' : ''}${o.done ? ' done' : ''}${o.lit ? ' lit' : ''}${o.w16 ? ' w16' : ''}${o.cls ? ' ' + o.cls : ''}" style="width:${o.w || 120}px" role="button" tabindex="0" aria-label="${o.label || 'Building'}${o.exp ? ' (expected, not built yet)' : ''}" title="${o.label || ''}"><span class="fc">${facade}</span>${cr}</div>`;
}
export const kindBld = (kind, label) => `<div class="bld kind" role="button" tabindex="0" aria-label="${label}" title="${label}">${g(kind)}</div>`;
export const barrier = (label, breach = false) => `<span class="barrier${breach ? ' breach' : ''}" role="img" aria-label="Blocked: ${label}" title="Blocked: ${label}">${I('construction')}</span>`;

// ---- the shell: dock, Talk, breadcrumb chip ----
const DOCK = [['horizon', 'sunrise', 'Horizon'], ['world', 'map', 'World'], ['me', 'circle-user-round', 'Me'], ['talk', 'AI', 'Talk'], ['more', 'grip', 'More']];
export function dock(active = 'world', o = {}) {
  if (o.phone) {
    const d = (k) => { const [kk, ic, l] = DOCK.find((x) => x[0] === k); return `<span class="d${kk === active ? ' on' : ''}" role="link" tabindex="0" aria-label="${l}" title="${l}"${kk === active ? ' aria-current="page"' : ''}>${I(ic)}</span>`; };
    return `<nav class="dock" aria-label="Dock">${d('horizon')}${d('world')}<span class="talkp" role="button" tabindex="0" aria-label="Talk: hold to talk, or type">${AIC()}<span>${o.say || 'Hold to talk'}</span><span class="tb">${I('mic')}</span></span>${d('me')}${d('more')}</nav>`;
  }
  return `<nav class="dock" aria-label="Dock">${DOCK.map(([k, ic, l]) => `<span class="d${k === active ? ' on' : ''}${k === 'talk' ? ' tk' : ''}" role="link" tabindex="0" aria-label="${l}" title="${l}"${k === active ? ' aria-current="page"' : ''}>${ic === 'AI' ? AIC() : I(ic)}${o.hover === k ? `<span class="tip">${l}</span>` : ''}</span>`).join('')}</nav>`;
}
export function talk(o = {}) {
  return `<div class="talk" role="search" aria-label="Talk to Lucid">${AIC()}<span class="q${o.said ? ' said' : ''}">${o.said || 'Ask, or tell Lucid what to show'}</span><span class="tb slash" role="button" tabindex="0" aria-label="Slash commands" title="Slash commands">/</span><span class="tb" role="button" tabindex="0" aria-label="Hold to talk" title="Hold to talk">${I('mic')}</span></div>`;
}
export function crumb(parts) {
  return `<nav class="crumbc" aria-label="Where you are">${TM()}${parts.map((p, i) => (i === parts.length - 1 ? `<b>${p}</b>` : `<span>${p}</span>${I('chevron-right')}`)).join('')}</nav>`;
}
export function desk(o) {
  const dir = o.dir ? ` dir="${o.dir}"` : o.fixdir ? ` dir="${o.fixdir}"` : ''; const fixed = [o.pt ? ` data-pt="${o.pt}"` : '', o.hc ? ` data-hc="${o.hc}"` : '', o.lang ? ` lang="${o.lang}"` : '', o.fixdir ? ` data-fixdir="${o.fixdir}"` : ''].join('');
  return `<div class="scr desk pt${o.cls ? ' ' + o.cls : ''}"${dir}${fixed} role="region" aria-label="${o.label}"><div class="stage">${o.body}</div>${o.crumb ? crumb(o.crumb) : ''}${o.tend ? `<div class="tend">${o.tend}</div>` : ''}${o.nodock ? '' : dock(o.active || 'world', { hover: o.hoverDock })}${o.notalk ? '' : talk(o.talk || {})}</div>`;
}
export function phone(o) {
  const fixed = [o.pt ? ` data-pt="${o.pt}"` : '', o.lang ? ` lang="${o.lang}"` : '', o.fixdir ? ` data-fixdir="${o.fixdir}" dir="${o.fixdir}"` : ''].join('');
  return `<div class="scr phone pt${o.cls ? ' ' + o.cls : ''}"${fixed} role="region" aria-label="${o.label}"><div class="sb"><span class="num">9:41</span><span class="row" style="gap:6px">${I('signal')}${I('wifi')}${I('battery-full')}</span></div><div class="stage">${o.body}</div>${o.crumb ? crumb(o.crumb) : ''}${dock(o.active || 'horizon', { phone: true, say: o.say })}<span class="homebar"></span></div>`;
}
// a gallery figure: the screen scaled to fit, the caption with what it shows, use cases, doctrine sections and the attention counts
export function fig(num, name, html, o) {
  const [sw, sh] = o.size || [1440, 900];
  const att = o.att ? `<span class="att" aria-label="Attention counts">needs-you ${o.att[0]} · text ${o.att[1]} · numbers ${o.att[2]}</span>` : '';
  const fit = (h, w, hh) => `<div class="fit" style="--sw:${w}px;--sh:${hh}px">${h}</div>`;
  const body = o.phoneAlt ? `<div class="v-desk">${fit(html, sw, sh)}</div><div class="v-phone">${fit(o.phoneAlt, o.phoneSize ? o.phoneSize[0] : 390, 844)}<p class="meta" style="margin:10px 0 0">Device · Phone: the designed phone layout for this moment${o.phoneFrom ? ' (from frame ' + o.phoneFrom + ')' : ''}.</p></div>` : fit(html, sw, sh);
  return `<figure class="fr${o.phoneAlt ? ' has-phone' : ''}" id="f${String(num).padStart(2, '0')}" data-att="${o.att ? o.att.join(',') : ''}" data-glance="${o.glance ? 1 : 0}">${body}<figcaption><b>${num} · ${name}.</b> ${o.cap} <span class="meta">Focal subject: ${o.focus}.</span>${att}${(o.uc || '').split(' ').filter(Boolean).map((u) => `<span class="uc">${u}</span>`).join('')}</figcaption></figure>`;
}
// absolute placement helpers (px in the frame; RTL mirrors through inset-inline-start)
export const at = (x, y, html, o = {}) => `<div class="at${o.tl ? ' tl' : ''}${o.cls ? ' ' + o.cls : ''}" style="inset-inline-start:${o.pctW ? r2(x / o.pctW * 100) + '%' : x + 'px'};top:${o.pctH ? r2(y / o.pctH * 100) + '%' : y + 'px'};${o.z ? 'z-index:' + o.z + ';' : ''}${o.style || ''}">${html}</div>`;
export const box = (x, y, w, h, html, cls = '', style = '') => `<div class="${cls}" style="position:absolute;inset-inline-start:${x}px;top:${y}px;width:${w}px;${h ? 'height:' + h + 'px;' : ''}${style}">${html}</div>`;
