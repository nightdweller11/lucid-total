/* The living map: pictures. What a task makes, drawn from its own words: the artifact kind (a screen, a document, a
 * report, a chart, a change, a run, a service, a build, a page, a sheet, a checklist, a design, a test run, a decision)
 * with the task's subject written into it, and its state (expected = ghost, blocked = barred, done = sealed).
 * One drawing list per picture, rendered to SVG for the DOM (tiles, thumbnails, the strip of what a place made) and to
 * the canvas (the plots at the land and area levels). Colours are the artifact's own, as a screenshot keeps its own
 * colours (the v0.2 facades). Setting: Pictures · Off / On the tile / As the tile (`view.pic`). */
(() => {
  const W = 160, H = 120;
  // ops: ['r',x,y,w,h,fill,rx,alpha] ['t',text,x,y,size,fill,weight,maxW,align] ['c',cx,cy,r,fill,alpha] ['l',x1,y1,x2,y2,stroke,width,alpha,dash] ['p',d,fill,stroke,width,alpha]
  const r = (x, y, w, h, f, rx = 0, a = 1) => ['r', x, y, w, h, f, rx, a];
  const t = (s, x, y, size, f, w = 600, maxW = 0, al = 'start') => ['t', s, x, y, size, f, w, maxW, al];
  const c = (cx, cy, rr, f, a = 1) => ['c', cx, cy, rr, f, a];
  const l = (x1, y1, x2, y2, s, w = 1.5, a = 1, dash = null) => ['l', x1, y1, x2, y2, s, w, a, dash];
  const p = (d, f, s = null, w = 1.5, a = 1) => ['p', d, f, s, w, a];
  const ln = (x, y, w, col, a = 0.5, h = 3) => r(x, y, w, h, col, h / 2, a);
  const INK = '#22304d', MUT = '#5b6b88', PAPER = '#fbfaf6', GOOD = '#47d16c', CORAL = '#ff7d85', SKY = '#8dbaff', AQUA = '#5fe3cf', DEEP = '#0b1020', NAVY = '#101a33', GOLD = '#ffd88a';
  const cut = (s, n) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);
  /** The phone of the v0.2 facades, as ops. */
  const phone = (x, y, w, title, rows, done) => {
    const h = w * 1.9, out = [r(x, y, w, h, '#0e1730', w * 0.14), r(x + 1.5, y + 1.5, w - 3, h - 3, done ? '#f6f8fc' : '#e9edf5', w * 0.12), r(x + 4, y + 5, w - 8, 9, '#1b2a4a', 2), t(cut(title, 14), x + 7, y + 11.5, 6, '#fff', 700, w - 12)];
    for (let i = 0; i < rows; i++) { const left = i % 2 === 0; out.push(r(left ? x + 5 : x + w * 0.38, y + 19 + i * 11, w * 0.55, 8, left ? '#dfe6f3' : '#2a78d6', 4, left ? 1 : 0.85)); }
    out.push(r(x + 5, y + h - 11, w - 10, 6, '#dfe6f3', 3));
    return out;
  };
  const sealed = (ops, st) => {
    if (!st) return ops;
    if (st.dropped) return ops.map((o) => (o[0] === 'r' || o[0] === 'c' ? [...o.slice(0, o.length - 1), o[o.length - 1] * 0.5] : o));
    if (st.s === 'todo') return [r(0, 0, W, H, '#1a2238', 0, 0.35), ...ops.map((o) => { const z = o.slice(); if (z[0] === 'r' || z[0] === 'c') z[z.length - 1] *= 0.45; if (z[0] === 't') z[5] = '#8a97b3'; return z; }), l(4, 4, W - 4, 4, '#8a97b3', 1.5, 0.8, [5, 4]), l(W - 4, 4, W - 4, H - 4, '#8a97b3', 1.5, 0.8, [5, 4]), l(W - 4, H - 4, 4, H - 4, '#8a97b3', 1.5, 0.8, [5, 4]), l(4, H - 4, 4, 4, '#8a97b3', 1.5, 0.8, [5, 4])];
    if (st.blocked) return [...ops, r(0, H - 16, W, 16, CORAL, 0, 0.92), ...Array.from({ length: 8 }, (_, i) => p(`M${i * 22 - 8} ${H}l12 -16h8l-12 16z`, '#2b1b22', null, 0, 0.75))];
    if (st.done) return [...ops, c(W - 15, 15, 10, GOOD), p('M' + (W - 20) + ' 15l4 4 7 -8', null, '#0d1326', 2.4)];
    return ops;
  };
  /** The pictures by artifact kind; `a` = { sub, line }; `st` = the state at t. */
  const PICS = {
    screen: (a, st) => [r(0, 0, W, H, '#c9dbff'), r(0, 0, W, H, '#e9e2ff', 0, 0.6), ...phone(34, 8, 44, a.sub, 5, st && st.done), ...phone(84, 8, 44, a.line || a.sub, 6, st && st.done)],
    doc: (a, st, col = '#0d2a66', acc = '#2a78d6', bg = '#e9e4d8') => [r(0, 0, W, H, bg), r(26, 8, 108, 108, '#000', 3, 0.12), r(23, 5, 108, 108, PAPER, 3), r(23, 5, 108, 30, col, 3), r(23, 29, 108, 6, col), t(cut(a.sub, 22), 30, 18, 8.5, '#fff', 700, 96), t(cut(a.line || '', 30), 30, 28, 5.5, '#dfe6ff', 500, 96), ln(31, 44, 70, INK, 0.75), ln(31, 51, 60, INK, 0.4, 2.2), ln(31, 58, 66, INK, 0.4, 2.2), ln(31, 65, 48, INK, 0.4, 2.2), r(31, 74, 92, 24, acc, 2, 0.14), p('M36 92l10-8 7 4 12-9 9 5 12-6 16 4', null, acc, 1.6), ln(31, 104, 24, INK, 0.3, 2), ln(80, 104, 18, INK, 0.3, 2)],
    report: (a, st) => [...PICS.doc(a, st, '#0b5a50', '#0f9d8a', '#dfe8e6').slice(0, 10), ...[0, 1, 2, 3].map((i) => c(37, 50 + i * 12, 3.2, i === 3 && st && st.blocked ? CORAL : '#0f9d8a')), ...[0, 1, 2, 3].map((i) => ln(44, 48.6 + i * 12, 40 + ((i * 29) % 30), INK, 0.45, 2.6))],
    chart: (a) => [r(0, 0, W, H, '#f7f9fd'), t(cut(a.sub, 24), 14, 20, 9, '#1b2a4a', 700, 132), t(cut(a.line || '', 34), 14, 30, 5.5, MUT, 500, 132), l(14, 98, 150, 98, '#d5dbe6', 1), l(14, 76, 150, 76, '#e3e8f0', 1), l(14, 54, 150, 54, '#e3e8f0', 1), p('M14 90C40 86 50 70 70 64S100 72 118 56 140 46 150 42V98H14Z', '#2a78d6', null, 0, 0.14), p('M14 90C40 86 50 70 70 64S100 72 118 56 140 46 150 42', null, '#2a78d6', 2.2), c(150, 42, 3.5, '#eb6834')],
    sheet: (a) => { const out = [r(0, 0, W, H, '#f4f6fa'), r(10, 10, 140, 100, '#fff', 3), r(10, 10, 140, 16, '#1b2a4a', 3), t(cut(a.sub, 26), 15, 21, 7.5, '#fff', 700, 130)]; for (let i = 0; i < 6; i++) { out.push(l(10, 40 + i * 12, 150, 40 + i * 12, '#e3e8f0', 1)); for (let j = 0; j < 4; j++) out.push(ln(15 + j * 35, 30.4 + i * 12, j === 3 ? 16 : 22 + ((i * 7 + j * 5) % 9), j === 3 ? '#2a78d6' : INK, j === 3 ? 0.8 : 0.4, 2.4)); } for (let j = 1; j < 4; j++) out.push(l(10 + j * 35, 26, 10 + j * 35, 110, '#e3e8f0', 1)); return out; },
    code: (a) => { const out = [r(0, 0, W, H, '#0f1526'), r(0, 0, W, 14, '#1a2238'), t(cut(a.sub, 28), 8, 10, 6.5, '#c9d4ea', 600, 140)]; for (let i = 0; i < 8; i++) { const k = [0, 1, 2, 0, 0, 1, 2, 0][i], col = k === 1 ? GOOD : k === 2 ? CORAL : '#7a86a6'; if (k) out.push(r(6, 20 + i * 11.5, 148, 10, col, 0, 0.12)); out.push(ln(12, 23.5 + i * 11.5, 6, col, 0.9, 3), ln(22, 23.5 + i * 11.5, 30 + ((i * 37) % 80), col, k ? 0.85 : 0.5, 3)); } return out; },
    term: (a, st) => { const cmd = '$ ' + (a.sub + (a.line ? ' ' + a.line : '')).toLowerCase().replace(/[^a-z0-9 .:/-]/g, '').replace(/\s+/g, ' ').trim().split(' ').slice(0, 4).join(' '); const out = [r(0, 0, W, H, DEEP), r(0, 0, W, 14, '#1a2238'), c(10, 7, 2.2, CORAL), c(18, 7, 2.2, GOLD), c(26, 7, 2.2, GOOD), t(cut(cmd, 30), 10, 29, 7, AQUA, 600, 142)]; for (let i = 0; i < 5; i++) out.push(ln(10, 40 + i * 11, 36 + ((i * 41) % 70), '#c9d4ea', 0.5, 2.6)); out.push(st && st.blocked ? t('error: waiting on a dependency', 10, 104, 6, CORAL, 600, 142) : st && st.done ? t('ok · all steps passed', 10, 104, 6, '#9be8b0', 600, 142) : r(10, 100, 6, 8, AQUA)); return out; },
    infra: (a) => { const out = [r(0, 0, W, H, NAVY), r(20, 10, 120, 100, '#1b2a4a', 8), l(20, 10, 140, 10, '#2c3f66', 1), t(cut(a.sub, 22), 28, 23, 7.5, '#dfe6ff', 700, 104)]; for (let i = 0; i < 5; i++) out.push(r(28, 30 + i * 15, 104, 12, '#0d1733', 3), c(36, 36 + i * 15, 2.4, i === 3 ? GOLD : GOOD), ln(44, 34.6 + i * 15, 36 + ((i * 13) % 20), SKY, 0.55, 2.6), ln(96, 34.6 + i * 15, 24, AQUA, 0.35, 2.6)); return out; },
    build: (a, st) => [r(0, 0, W, H, '#141d36'), r(22, 28, 44, 44, SKY, 12), r(22, 28, 44, 44, AQUA, 12, 0.5), p('M33 54c3-10 9-14 14-10s8 4 10-4', null, '#0d1d4a', 4), t(cut(a.sub, 16), 76, 44, 10, '#fff', 700, 76), t(cut(a.line || 'build', 22), 76, 58, 7, '#a9b6d3', 500, 76), r(22, 86, 116, 16, st && st.done ? GOOD : SKY, 8, 0.16), c(32, 94, 4.5, st && st.done ? GOOD : SKY), ln(42, 92.5, 60, st && st.done ? '#9be8b0' : SKY, 0.8, 3)],
    listing: (a) => [r(0, 0, W, H, '#e9eef8'), r(8, 8, 144, 104, '#1a3f9a', 6), r(8, 8, 144, 12, '#fff', 6, 0.14), c(16, 14, 2, CORAL), c(23, 14, 2, GOLD), c(30, 14, 2, GOOD), t(cut(a.sub, 16), 20, 46, 10, '#fff', 700, 80), t(cut(a.line || '', 22), 20, 60, 6.5, '#dfe6ff', 500, 80), r(20, 70, 56, 12, '#fff', 6, 0.9), ln(26, 74.6, 36, '#0f2a6b', 0.9, 2.6), ...phone(104, 30, 34, 'Lucid', 4, true)],
    check: (a, st) => { const h = st ? (st.done ? 1 : st.h) : 0, out = [r(0, 0, W, H, '#eef1f6'), r(22, 8, 116, 104, PAPER, 4), r(22, 8, 116, 22, '#2b3550', 4), t(cut(a.sub, 22), 30, 22, 8, '#fff', 700, 100)]; for (let i = 0; i < 4; i++) { const on = (i + 0.5) / 4 <= h; out.push(r(30, 38 + i * 17, 10, 10, on ? GOOD : '#fff', 2.5), r(30, 38 + i * 17, 10, 10, on ? GOOD : '#b8c2d6', 2.5, on ? 1 : 0.9), ...(on ? [p(`M32 ${43 + i * 17}l3 3 5 -6`, null, '#0d1326', 1.8)] : []), ln(46, 41.4 + i * 17, 50 + ((i * 23) % 36), INK, on ? 0.35 : 0.6, 2.8)); } return out; },
    design: (a) => [r(0, 0, W, H, '#1c1f2b'), r(10, 10, 92, 100, '#f6f8fc', 3), r(10, 10, 92, 14, '#e4e8f2', 3), t(cut(a.sub, 18), 15, 20, 6.5, INK, 700, 82), r(18, 32, 76, 40, '#2a78d6', 4, 0.16), r(24, 40, 40, 6, '#2a78d6', 3), r(24, 50, 60, 4, INK, 2, 0.35), r(24, 58, 50, 4, INK, 2, 0.35), r(18, 80, 36, 20, '#dfe6f3', 4), r(58, 80, 36, 20, '#1b2a4a', 4), ...['#5a6cf0', '#5fe3cf', '#ffd88a', '#ff7d85', '#47d16c'].map((col, i) => r(112, 12 + i * 18, 38, 14, col, 4)), ...[0, 1, 2, 3, 4].map((i) => ln(118, 17.6 + i * 18, 16, '#0b1020', 0.55, 2.4))],
    test: (a, st) => { const out = [r(0, 0, W, H, '#0f1526'), r(0, 0, W, 16, '#1a2238'), t(cut(a.sub, 28), 8, 11, 6.5, '#c9d4ea', 600, 140)]; const n = 6; for (let i = 0; i < n; i++) { const bad = st && st.blocked && i === n - 2, open = st && !st.done && !st.blocked && i >= Math.round(n * (st.h || 0)); out.push(c(14, 26 + i * 13.5, 3.2, bad ? CORAL : open ? '#5b6b88' : GOOD), ln(24, 24.6 + i * 13.5, 50 + ((i * 29) % 60), bad ? CORAL : '#c9d4ea', bad ? 0.9 : open ? 0.35 : 0.65, 2.6), t(bad ? 'fail' : open ? '…' : 'pass', 130, 28.5 + i * 13.5, 6, bad ? CORAL : open ? '#5b6b88' : '#9be8b0', 600, 26)); } return out; },
    decision: (a) => [r(0, 0, W, H, '#1a1f33'), r(78, 30, 5, 80, '#8a97b3', 1), p('M30 36h70l12 10-12 10H30z', '#5a6cf0'), p('M130 64H60L48 74l12 10h70z', '#3b4a8a'), t(cut(a.sub, 14), 36, 50, 7.5, '#fff', 700, 60), t(cut(a.line || 'decided', 14), 66, 78, 6.5, '#dfe6ff', 500, 58), c(80, 30, 6, GOLD)],
  };
  PICS.policy = (a) => [r(0, 0, W, H, '#1f2338'), p('M80 18l28 10v22c0 20-12 36-28 44-16-8-28-24-28-44V28z', '#5a6cf0', null, 0, 0.9), p('M80 26l20 7v17c0 15-9 27-20 33-11-6-20-18-20-33V33z', null, '#dfe6ff', 1.6, 0.6), t(cut(a.sub, 16), 80, 104, 7.5, '#fff', 700, 150, 'center')];

  const KIND_LABEL = { screen: 'app screens', doc: 'a document', report: 'a report', chart: 'a chart', sheet: 'a sheet', code: 'a code change', term: 'a run', infra: 'a service', build: 'a build', listing: 'a page', check: 'a checklist', design: 'a design', test: 'a test run', decision: 'a decision', policy: 'a policy' };
  LM.PIC_KINDS = KIND_LABEL;
  const artOf = (it) => it.a || { kind: 'doc', sub: it.short || it.n, line: '' };
  LM.picOps = function picOps(it, st) { const a = artOf(it); const f = PICS[a.kind] || PICS.doc; return sealed(f(a, st), st); };

  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
  const FONT = 'Figtree, system-ui, sans-serif';
  /** The picture as an SVG string (cached per item and state). */
  const svgCache = new Map();
  LM.picSvg = function picSvg(it, st, cls = 'fac') {
    const key = it.id + '|' + (st ? st.s + (st.dropped ? 'x' : '') + (st.blocked ? 'b' : '') + Math.round((st.h || 0) * 4) : '-') + '|' + cls;
    const hit = svgCache.get(key); if (hit) return hit;
    const a = artOf(it);
    const ops = LM.picOps(it, st);
    const body = ops.map((o) => {
      switch (o[0]) {
        case 'r': return `<rect x="${o[1]}" y="${o[2]}" width="${o[3]}" height="${o[4]}" rx="${o[6]}" fill="${o[5]}"${o[7] < 1 ? ` fill-opacity="${o[7]}"` : ''}/>`;
        case 't': return `<text x="${o[2]}" y="${o[3]}" font-family="${FONT}" font-size="${o[4]}" font-weight="${o[6]}" fill="${o[5]}"${o[8] === 'center' ? ' text-anchor="middle"' : ''}${o[7] ? ` textLength="${Math.min(o[7], o[1].length * o[4] * 0.56).toFixed(1)}" lengthAdjust="spacingAndGlyphs"` : ''}>${esc(o[1])}</text>`;
        case 'c': return `<circle cx="${o[1]}" cy="${o[2]}" r="${o[3]}" fill="${o[4]}"${o[5] < 1 ? ` fill-opacity="${o[5]}"` : ''}/>`;
        case 'l': return `<line x1="${o[1]}" y1="${o[2]}" x2="${o[3]}" y2="${o[4]}" stroke="${o[5]}" stroke-width="${o[6]}"${o[7] < 1 ? ` stroke-opacity="${o[7]}"` : ''}${o[8] ? ` stroke-dasharray="${o[8].join(' ')}"` : ''} stroke-linecap="round"/>`;
        case 'p': return `<path d="${o[1]}" fill="${o[2] || 'none'}"${o[3] ? ` stroke="${o[3]}" stroke-width="${o[4]}" stroke-linecap="round" stroke-linejoin="round"` : ''}${o[5] < 1 ? ` opacity="${o[5]}"` : ''}/>`;
      }
      return '';
    }).join('');
    const svg = `<svg class="${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(KIND_LABEL[a.kind] || 'picture')}: ${esc(a.sub)}">${body}</svg>`;
    if (svgCache.size > 4000) svgCache.clear();
    svgCache.set(key, svg);
    return svg;
  };
  /** The picture on the canvas in the box (x, y, w, h); text only when the box is wide enough to read it. */
  LM.drawPic = function drawPic(ctx, it, st, x, y, w, h, alpha = 1) {
    const ops = LM.picOps(it, st);
    const sx = w / W, sy = h / H, text = w >= 44;
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(sx, sy);
    for (const o of ops) {
      switch (o[0]) {
        case 'r': { ctx.globalAlpha = alpha * o[7]; ctx.fillStyle = o[5]; if (o[6]) { LM.rrect(ctx, o[1], o[2], o[3], o[4], o[6]); ctx.fill(); } else ctx.fillRect(o[1], o[2], o[3], o[4]); break; }
        case 't': { if (!text) break; ctx.globalAlpha = alpha; ctx.fillStyle = o[5]; ctx.font = `${o[6]} ${o[4]}px ${FONT}`; ctx.textAlign = o[8] === 'center' ? 'center' : 'start'; ctx.textBaseline = 'alphabetic'; ctx.fillText(o[1], o[2], o[3], o[7] || undefined); break; }
        case 'c': { ctx.globalAlpha = alpha * o[5]; ctx.fillStyle = o[4]; ctx.beginPath(); ctx.arc(o[1], o[2], o[3], 0, Math.PI * 2); ctx.fill(); break; }
        case 'l': { ctx.globalAlpha = alpha * o[7]; ctx.strokeStyle = o[5]; ctx.lineWidth = o[6]; ctx.lineCap = 'round'; ctx.setLineDash(o[8] || []); ctx.beginPath(); ctx.moveTo(o[1], o[2]); ctx.lineTo(o[3], o[4]); ctx.stroke(); ctx.setLineDash([]); break; }
        case 'p': { ctx.globalAlpha = alpha * o[5]; const P = new Path2D(o[1]); if (o[2]) { ctx.fillStyle = o[2]; ctx.fill(P); } if (o[3]) { ctx.strokeStyle = o[3]; ctx.lineWidth = o[4]; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(P); } break; }
      }
    }
    ctx.restore();
  };
})();
