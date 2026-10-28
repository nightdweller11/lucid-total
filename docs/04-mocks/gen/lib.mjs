// Helpers for the Lucid Total mocks generator.
export const I = (n, c = '') => `<i data-lucide="${n}" class="ic${c ? ' ' + c : ''}"></i>`;
export const AI = (c = '') => `<i data-lucide="lucid-mark" data-mono class="ic${c ? ' ' + c : ''}"></i>`; // the AI's mark, one ink
export const AIC = (c = '') => `<i data-lucide="lucid-mark" class="ic${c ? ' ' + c : ''}"></i>`; // the AI's mark, colour
export const TM = (c = '', mono = false) => `<i data-lucide="total-mark"${mono ? ' data-mono' : ''} class="ic${c ? ' ' + c : ''}"></i>`;

export const KINDS = {
  task: { fam: 'sky', icon: 'square-check-big', label: 'Task', he: 'משימה', group: 'Build' },
  story: { fam: 'sky', icon: 'book-open', label: 'Story', he: 'סיפור', group: 'Build' },
  bug: { fam: 'heat', icon: 'bug', label: 'Bug', he: 'באג', group: 'Defect' },
  incident: { fam: 'heat', icon: 'zap', label: 'Incident', he: 'אירוע', group: 'Defect' },
  issue: { fam: 'warm', icon: 'life-buoy', label: 'Issue (customer)', he: 'פנייה', group: 'Customer' },
  chore: { fam: 'lime', icon: 'hand', label: 'Chore (human)', he: 'מטלה', group: 'Human' },
  reminder: { fam: 'lime', icon: 'bell-ring', label: 'Reminder', he: 'תזכורת', group: 'Human' },
  meeting: { fam: 'lime', icon: 'users-round', label: 'Meeting', he: 'פגישה', group: 'Human' },
  decision: { fam: 'rules', icon: 'signpost', label: 'Decision', he: 'החלטה', group: 'Decide' },
  proposal: { fam: 'rules', icon: 'lightbulb', label: 'Proposal', he: 'הצעה', group: 'Decide' },
  goal: { fam: 'gold', icon: 'target', label: 'Goal', he: 'יעד', group: 'Direction' },
  milestone: { fam: 'gold', icon: 'milestone', label: 'Milestone / gate', he: 'אבן דרך', group: 'Direction' },
  risk: { fam: 'sharp', icon: 'cloud-lightning', label: 'Risk', he: 'סיכון', group: 'Risk' },
  budget: { fam: 'violet', icon: 'wallet', label: 'Budget', he: 'תקציב', group: 'Resources' },
  account: { fam: 'violet', icon: 'key-square', label: 'Account (vendor)', he: 'חשבון', group: 'Resources' },
  lesson: { fam: 'drift', icon: 'graduation-cap', label: 'Lesson', he: 'לקח', group: 'Learning' },
  envelope: { fam: 'slate', icon: 'vault', label: 'Envelope (sealed secret)', he: 'מעטפה', group: 'Secret' },
  agent: { fam: 'lucid', icon: 'bot', label: 'Agent', he: 'סוכן', group: 'AI' },
  ask: { fam: 'rules', icon: 'message-circle-question', label: 'Ask', he: 'בקשה', group: 'Decide' },
  party: { fam: 'slate', icon: 'landmark', label: 'Party (external)', he: 'גורם חיצוני', group: 'Outside' },
  engagement: { fam: 'slate', icon: 'handshake', label: 'Engagement', he: 'התקשרות', group: 'Outside' },
};
export const FAMS = {
  sky: ['Language sky', '#4fc3ff', '#1aa3e8'], heat: ['Heat orange', '#ff8a3d', '#f0722a'], warm: ['Coach warm pink', '#ff6fae', '#e5528f'],
  lime: ['Coach concise lime', '#a3e635', '#7cb518'], rules: ['Rules indigo', '#7a8cff', '#5d6fe8'], gold: ['Clarity gold', '#ffd23f', '#e6b800'],
  sharp: ['Sharp pink-red', '#ff5c7a', '#ea4c6c'], violet: ['Pressure violet', '#c56cff', '#a94ae6'], drift: ['Drift lavender', '#b39dff', '#8f7ae6'],
  slate: ['Private slate', '#a3b4cc', '#6b7c93'], lucid: ['Lucid (theme hue)', 'mint / violet / teal', ''],
};
export const g = (kind, o = {}) => {
  const k = KINDS[kind];
  const sz = o.size ? ' ' + o.size : '';
  const lab = o.he ? k.he : k.label;
  const inner = kind === 'agent' && o.mark ? AIC() : I(k.icon);
  return `<span class="g f-${k.fam}${sz}${o.solid ? ' solid' : ''}" role="img" aria-label="${lab}" title="${lab}">${inner}</span>`;
};
export const aiG = (size = '', label = 'Lucid assistant') => `<span class="g f-lucid${size ? ' ' + size : ''}" role="img" aria-label="${label}" title="${label}">${AIC()}</span>`;

// State, priority, due, confidence: shapes first; hue only where it is one of the job meanings.
export const STATES = {
  proposed: ['circle-dashed', 'mut', 'Proposed', 'מוצע'], ready: ['circle', '', 'Ready', 'מוכן'], doing: ['circle-dot', 'acc', 'Doing', 'בעבודה'],
  review: ['scan-eye', 'gold', 'Review', 'בבדיקה'], done: ['circle-check-big', 'good', 'Done', 'הושלם'], blocked: ['construction', 'block', 'Blocked', 'חסום'],
  waiting: ['hourglass', 'hold', 'Waiting on a person', 'ממתין לאדם'], verify: ['scan-search', 'hold', 'To verify', 'לאימות'],
};
export const st = (s, o = {}) => { const [ic, c, l, he] = STATES[s]; const lab = o.he ? he : (o.label || l); return `<span class="sg ${c}" role="img" aria-label="${lab}" title="${lab}">${I(ic)}</span>`; };
export const PRI = { urgent: ['chevrons-up', 'Priority: urgent'], high: ['chevron-up', 'Priority: high'], normal: ['equal', 'Priority: normal'], low: ['chevron-down', 'Priority: low'] };
export const pri = (p, why = '') => { const [ic, l] = PRI[p]; const lab = l + (why ? ' · ' + why : ''); return `<span class="sg" role="img" aria-label="${lab}" title="${lab}">${I(ic)}</span>`; };
export const due = (txt, over = false) => `<span class="sg ${over ? 'hold' : 'mut'}" role="img" aria-label="${over ? 'Overdue' : 'Due'} ${txt}" title="${over ? 'Overdue' : 'Due'} ${txt}">${I(over ? 'clock-alert' : 'clock')}</span>`;
export const CONF = { met: ['badge-check', 'good', 'Expected vs actual: all met'], partly: ['contrast', 'hold', 'Expected vs actual: some partly'], unmet: ['circle-x', 'block', 'Expected vs actual: not met'], unchecked: ['eye-off', 'slate', 'Expected vs actual: not checked'] };
export const conf = (c) => { const [ic, cl, l] = CONF[c]; return `<span class="sg ${cl}" role="img" aria-label="${l}" title="${l}">${I(ic)}</span>`; };
export const CRIT = { met: ['check', 'good', 'Met'], partly: ['contrast', 'hold', 'Partly'], unmet: ['x', 'block', 'Not met'], unchecked: ['minus', 'slate', 'Not checked'] };
export const crit = (c, he = false) => { const [ic, cl, l] = CRIT[c]; const hl = { met: 'עומד', partly: 'חלקית', unmet: 'לא עומד', unchecked: 'לא נבדק' }[c]; return `<span class="sg ${cl}" role="img" aria-label="${he ? hl : l}" title="${he ? hl : l}">${I(ic)}</span>`; };

export const av = (ini, cls = '', label = '') => `<span class="av ${cls}" role="img" aria-label="${label || ini}" title="${label || ini}">${ini}</span>`;
export const agav = (label, cls = '') => `<span class="av ag ${cls}" role="img" aria-label="${label}" title="${label}">${I('bot')}</span>`;
export const P = { Y: ['Y', 'p1', 'Yossi (owner)'], D: ['D', 'p2', 'Dana (compliance)'], O: ['O', 'p3', 'Omer (marketing)'], N: ['N', 'p4', 'Noa (engineering lead)'] };
export const pav = (k, extra = '') => { const [i, c, l] = P[k]; return av(i, c + ' ' + extra, l); };

export const btn = (icon, label, cls = '', aria = '') => `<span class="btn ${cls}" role="button" tabindex="0" aria-label="${aria || label}">${icon.startsWith('<') ? icon : I(icon)}${label ? `<span>${label}</span>` : ''}</span>`;
export const ib = (icon, label, cls = '', badge = '') => `<span class="ib ${cls}" role="button" tabindex="0" aria-label="${label}" title="${label}">${icon.startsWith('<') ? icon : I(icon)}${badge ? `<span class="dotb">${badge}</span>` : ''}</span>`;
export const chip = (icon, label, cls = '', aria = '') => `<span class="chip ${cls}" role="button" tabindex="0" aria-label="${aria || label}">${icon ? (icon.startsWith('<') ? icon : I(icon)) : ''}<span>${label}</span></span>`;
export const kbd = (k) => `<span class="kbd">${k}</span>`;
export const id = (t) => `<span class="id">${t}</span>`;
export const cite = (icon, t) => `<span class="cite" role="link" tabindex="0" aria-label="Source: ${t}">${I(icon)}${t}</span>`;

// ---- app shell ----
const NAV = [
  ['map', 'map', 'Map', 'מפה'], ['inbox', 'inbox', 'Inbox', 'תיבת דואר'], ['mywork', 'list-todo', 'My work', 'העבודה שלי'], ['boards', 'square-kanban', 'Boards', 'לוחות'],
  ['people', 'users', 'People & agents', 'אנשים וסוכנים'], ['issues', 'life-buoy', 'Issues', 'פניות'], ['decisions', 'signpost', 'Decisions', 'החלטות'], ['chat', 'AI', 'Chat', 'שיחה'],
];
export function rail(active, o = {}) {
  const he = o.he;
  const counts = o.counts || { inbox: '4', decisions: '2' };
  const item = ([k, ic, en, h]) => `<a class="ri${k === active ? ' on' : ''}" href="#" aria-label="${he ? h : en}"${k === active ? ' aria-current="page"' : ''}>${ic === 'AI' ? AI() : I(ic)}<span class="t" data-he="${h}">${he ? h : en}</span>${counts[k] ? `<span class="n${k === 'inbox' ? ' b' : ''}">${counts[k]}</span>` : ''}</a>`;
  return `<aside class="rail" aria-label="${he ? 'ניווט' : 'Main navigation'}">
<div class="brand"><span class="tile">${TM()}</span><span><b>Lucid Total</b><small data-he="Lucid · מצב אתחול">${he ? 'Lucid · מצב אתחול' : 'Lucid · bootstrap'}</small></span></div>
${NAV.map(item).join('')}
<span class="sp"></span>
${item(['settings', 'settings', 'Settings', 'הגדרות'])}
<span class="kh">${kbd('[')}<span class="t" data-he="כיווץ הסרגל">${he ? 'כיווץ הסרגל' : 'Collapse rail'}</span></span>
</aside>`;
}
export function pnav(active, he = false) {
  const items = [['inbox', 'inbox', 'Inbox', 'דואר'], ['map', 'map', 'Map', 'מפה'], ['mywork', 'list-todo', 'My work', 'שלי'], ['chat', 'AI', 'Chat', 'שיחה'], ['more', 'ellipsis', 'More', 'עוד']];
  return `<nav class="pnav" aria-label="${he ? 'ניווט' : 'Navigation'}">${items.map(([k, ic, en, h]) => `<span class="${k === active ? 'on' : ''}" role="link" tabindex="0" aria-label="${he ? h : en}"${k === active ? ' aria-current="page"' : ''}>${ic === 'AI' ? AI() : I(ic)}<span class="t" data-he="${h}">${he ? h : en}</span>${k === 'inbox' ? '<span class="dotb">4</span>' : ''}</span>`).join('')}</nav>`;
}
export function top(crumbs, o = {}) {
  const he = o.he;
  const cr = crumbs.map((c, i) => (i === crumbs.length - 1 ? `<b>${c}</b>` : `<span>${c}</span>`)).join(I('chevron-right'));
  const persp = o.persp === false ? '' : chip('eye', (he ? 'רואה כ: ' : 'Seeing as: ') + (o.persp || (he ? 'בעלים' : 'Owner')), 'hide-ph', (he ? 'נקודת מבט: ' : 'Perspective: ') + (o.persp || 'Owner'));
  const wf = o.whatif ? chip('flask-conical', o.whatif, 'draft', 'What-if draft on: ' + o.whatif) : (o.whatif === false ? '' : chip('flask-conical', he ? 'מה אם' : 'What-if', 'ghost hide-ph', 'Open a what-if draft'));
  return `<header class="top">
<nav class="crumb" aria-label="${he ? 'פירורי לחם' : 'Breadcrumb'}">${cr}</nav>
<span class="grow"></span>${o.extra || ''}${persp}${wf}
<span class="search" role="button" tabindex="0" aria-label="${he ? 'חיפוש או פקודה' : 'Search or run a command'}">${I('search')}<span>${he ? 'חיפוש או פקודה' : 'Search or command'}</span><span class="k">${kbd('⌘K')}</span></span>
${ib('bell', he ? 'התראות' : 'Notifications', '', '3')}
${pav('Y')}
</header>`;
}
export function app(o) {
  const dir = o.he ? ' dir="rtl" lang="he"' : (o.dir ? ` dir="${o.dir}"` : '');
  const fixed = [o.pt ? ` data-pt="${o.pt}"` : '', o.hc ? ` data-hc="${o.hc}"` : '', o.he ? ' data-fixdir="rtl"' : ''].join('');
  return `<div class="app pt${o.cls ? ' ' + o.cls : ''}"${dir}${fixed} role="region" aria-label="${o.label}">
${rail(o.active, { he: o.he, counts: o.counts })}
<div class="main">${top(o.crumbs, o)}
<div class="content" style="flex:1;min-height:0;position:relative;${o.cstyle || 'padding:0 16px 16px'}">${o.body}</div>
</div>${pnav(o.pnav || o.active, o.he)}
</div>`;
}
export function phone(o) {
  const dir = o.he ? ' dir="rtl" lang="he" data-fixdir="rtl"' : '';
  return `<div class="phone pt"${dir}${o.pt ? ` data-pt="${o.pt}"` : ''} role="region" aria-label="${o.label}">
<div class="sb"><span>9:41</span><span class="flex" style="gap:5px">${I('signal')}${I('wifi')}${I('battery-full')}</span></div>
${o.top || ''}
<div class="scrollb"${o.sbstyle ? ` style="${o.sbstyle}"` : ''}>${o.body}</div>
${o.after || ''}
${o.nav === false ? '' : pnav(o.active, o.he)}
<span class="homebar"></span>
</div>`;
}
export function fig(num, name, html, caption, ucs, anchor) {
  return `<figure class="fr" id="${anchor || 'f' + num}"><div class="scroller">${html}</div><figcaption><b>${num} · ${name}.</b> ${caption}${ucs ? ' ' + ucs.split(' ').map((u) => `<span class="uc">${u}</span>`).join('') : ''}</figcaption></figure>`;
}

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
export const SVGDEFS = `<defs>
<linearGradient id="hiGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".13"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="heatGrad"><stop offset="0" stop-color="#ff8a3d" stop-opacity=".55"/><stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/></radialGradient>
<pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="9" class="hatchln"/></pattern>
<marker id="arrowAi" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:var(--ai)"/></marker>
<marker id="arrowFg" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:color-mix(in srgb,var(--fg) 70%,transparent)"/></marker>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
</defs>`;
export const pct = (v, W) => (Math.round(v / W * 1000) / 10) + '%';
export const at = (x, y, W, H, html, cls = 'ml', extra = '') => `<div class="${cls}" style="inset-inline-start:${pct(x, W)};top:${pct(y, H)};${extra}">${html}</div>`;
