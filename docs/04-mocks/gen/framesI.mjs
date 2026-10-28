import { desk, fig, chip, pill, I, AIC, TM, g, aiG, av, agent, ring, place, building, kindBld, barrier, box, flag, flagSm, embassy, KINDS } from './lib.mjs';
import { F } from './facades.mjs';
import { world, PL } from './world.mjs';
import { COMPANY } from './company.mjs';
import { LANDMARKS, LM_ORDER, lm } from './landmarks.mjs';
import { totalSvg, lucidSvg } from './mark.mjs';
import { dim, datec, conf } from './kit.mjs';
import { ENG, f01 } from './framesA.mjs';
import { blob, superellipse } from './geo.mjs';
const C = COMPANY; const P = C.places;
// ---------- frame 38: Hebrew RTL and high contrast ----------
export function f38a() {
  const Q = ENG.places; const over = [];
  for (const k of ['beta', 'ios', 'eu', 'evals', 'plat']) { const [x, y] = Q[k].pole; over.push([x, y - (k === 'beta' ? 30 : 20), place(Q[k], { size: k === 'beta' ? 'l' : 'm', he: true })]); }
  const [bx, by] = Q.beta.pole;
  over.push([bx + 150, by - 60, `<span class="avs">${av('N', 'doing')}${agent('Worker B', 'doing')}</span>`]);
  over.push([Q.eu.pole[0], Q.eu.pole[1] - 118, `<span class="cont" lang="he">${I('chevrons-left')}ממשיך לרגולציה · <span dir="ltr">7</span></span>`]);
  const body = world(ENG, { fronts: [{ at: [bx - 70, by - 100], rx: 150, ry: 70 }], heat: [{ at: [bx + 60, by + 40], r: 170 }], over, hideMarkers: Object.keys(Q), id: 'f38a' });
  return desk({ label: 'Engineering in Hebrew, right to left', body, crumb: ['חברה', 'הנדסה'], tend: chip('eye', 'מנהל טכנולוגיה'), active: 'world', dir: 'rtl', lang: 'he', fixdir: 'rtl', talk: { said: '' } }).replace('Ask, or tell Lucid what to show', 'שאלו, או בקשו מ-Lucid להראות');
}
export function f38b() { return f01().replace('<div class="scr desk pt"', '<div class="scr desk pt" data-pt="deep" data-hc="high"'); }
// ---------- frame 39: the world as a tree ----------
export function f39() {
  const row = (lvl, k, extra = {}) => { const p = PL[k] || extra; return `<div class="tr${extra.focus ? ' focus' : ''}" role="treeitem" aria-level="${lvl}" aria-expanded="${extra.open ? 'true' : 'false'}" ${extra.focus ? 'aria-selected="true" tabindex="0"' : 'tabindex="-1"'} style="padding-inline-start:${14 + (lvl - 1) * 28}px">${I(extra.leaf ? 'dot' : extra.open ? 'chevron-down' : 'chevron-right')}<span class="h-${p.hue}" style="display:inline-flex">${lm(p.lm, 16, 'lmx')}</span><span style="font-weight:${lvl === 1 ? 600 : 500}">${p.name}</span><span class="grow"></span><span class="mut num">${Math.round(p.prog * 100)} % done</span>${extra.flag ? `<span class="row meta" style="gap:4px">${I('signpost')}decision</span>` : ''}${extra.front ? `<span class="row meta" style="gap:4px">${I('cloud-lightning')}risk</span>` : ''}</div>`; };
  const tree = `<div class="tree" role="tree" aria-label="The company as a tree">${row(1, 'ldr', { flag: 1 })}${row(1, 'prd')}${row(1, 'dsg')}${row(1, 'eng', { open: 1 })}${row(2, 'beta', { open: 1, focus: 1, flag: 1 })}${row(3, 'disp', { front: 1 })}${row(3, 'relay')}${row(3, 'evst')}${row(3, 'store')}${row(2, 'ios')}${row(2, 'eu')}${row(1, 'mkt')}${row(1, 'cmp', { front: 1 })}${row(1, 'fin')}${row(1, 'sup')}${row(1, 'sys')}</div>`;
  const sheet = `<section class="sheet gl l3" style="inset-inline-start:104px;top:76px;width:880px;height:712px;gap:12px" aria-label="The world as a list"><div class="row">${chip('map', 'Back to the map', 'back')}<span class="ttl t3" style="margin-inline-start:12px">The world as a list</span></div>${tree}</section>`;
  const spoken = `<div class="gl l2 cardx" style="position:absolute;inset-inline-start:1010px;top:120px;width:330px;z-index:20"><span class="row" style="gap:8px">${I('volume-2')}<b>Spoken for the focused row</b></span><span>“Private beta, in Engineering. 58 percent done, forecast one week late. One decision waiting. Three of four streams moving.”</span><span class="meta">Arrows move · Enter opens · Escape goes up · L layers</span></div>`;
  return desk({ label: 'The world as a tree', body: dim(world(C, { id: 'f39', sizes: { eng: 'l' } })) + sheet + spoken, crumb: ['Company', 'List'], active: 'world' });
}
// ---------- frame 40: brand, landmarks, grammar ----------
export function f40() {
  const grounds = [['deep', 'Deep Blue'], ['aqua', 'Aqua Dusk'], ['sky', 'Sky Glass']];
  const markRow = grounds.map(([pt, n]) => `<div data-pt="${pt}" style="background:var(--ground);background-color:var(--ground-base);border-radius:22px;padding:18px 22px;display:flex;align-items:center;gap:18px;color:var(--fg)">${[16, 20, 24, 32, 48].map((s) => totalSvg(s, 'm40' + pt + s)).join('')}<span class="ttl t2">Lucid Total</span><span class="meta" style="margin-inline-start:auto">${n}</span></div>`).join('');
  const lmGrid = (pt, mono) => `<div data-pt="${pt}" ${mono ? 'data-hc="high"' : ''} style="background:var(--ground);background-color:var(--ground-base);border-radius:22px;padding:16px;display:grid;grid-template-columns:repeat(10,1fr);gap:10px 6px;color:var(--fg)">${LM_ORDER.map((k, i) => `<span class="h-${['sky', 'rules', 'warm', 'violet', 'drift', 'slate', 'rules', 'violet', 'drift', 'sky', 'warm', 'sky', 'violet', 'slate', 'ai', 'ai', 'warm', 'lime', 'gold'][i]}" style="display:grid;place-items:center" title="${LANDMARKS[k][0]}: ${LANDMARKS[k][1]}">${lm(k, 38)}</span>`).join('')}<span></span></div>`;
  const names = `<div style="display:grid;grid-template-columns:repeat(10,1fr);gap:6px;font-size:12px;color:var(--muted);text-align:center">${LM_ORDER.map((k) => `<span>${LANDMARKS[k][0]}</span>`).join('')}</div>`;
  const vocab = [
    ['Ring', `<span class="h-sky">${ring(56, 0.6, { fc: 0.82, w: 4 })}</span>`], ['Light', `<svg width="70" height="56" aria-hidden="true"><defs><radialGradient id="lt40"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect x="2" y="4" width="66" height="48" rx="14" style="fill:color-mix(in srgb,var(--fg) 6%,transparent);stroke:var(--gl)"/><rect x="2" y="4" width="66" height="48" rx="14" fill="url(#lt40)"/></svg>`],
    ['Heat', `<span style="width:64px;height:56px;border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--f-heat) 50%,transparent),transparent);display:block"></span>`], ['Weather', `<svg width="70" height="56" aria-hidden="true"><defs><pattern id="h40" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><line x1="0" y1="0" x2="0" y2="7" style="stroke:var(--f-sharp)" stroke-opacity=".6" stroke-width="2"/></pattern></defs><ellipse cx="35" cy="28" rx="32" ry="20" fill="url(#h40)"/></svg>`],
    ['Flag', flagSm('example')], ['Road', `<svg width="80" height="40" aria-hidden="true"><path class="road crit" d="M4,30 C30,4 50,4 76,20"/></svg>`], ['Barrier', barrier('example')], ['Facade', building(F.screens({}), { w: 80, segs: ['met', 'met', 'partly'] })], ['Expected', building(F.screens({}), { w: 80, exp: true })],
    ['Embassy', embassy('scale', '')], ['Ghost', `<svg width="70" height="50" aria-hidden="true"><rect class="ghost" x="4" y="6" width="60" height="38" rx="10"/></svg>`], ['Haze', `<span class="cut" style="width:70px;height:50px;display:block"><span class="haze" style="--hz:50"></span></span>`], ['Presence', `<span class="avs">${av('N', 'doing')}${agent('An agent', 'wait')}</span>`],
  ].map(([n, v]) => `<div class="col" style="align-items:center;gap:8px;width:96px"><div style="height:64px;display:grid;place-items:center">${v}</div><span class="meta">${n}</span></div>`).join('');
  const fams = [['World', 'map'], ['Measure', 'chart-no-axes-column'], ['Compare', 'columns-2'], ['Time', 'route'], ['People', 'users-round'], ['Product', 'package'], ['Narrative', 'text'], ['Action', 'pointer'], ['Controls', 'sliders-horizontal'], ['Layouts', 'layout-template'], ['Images · generated images', 'image']].map(([n, ic]) => chip(ic, n, 'quiet')).join('') + chip(AIC(), 'grows: proposed, built, reviewed, installed', 'quiet', 'The library grows: the composer proposes a component, it is built, reviewed and installed');
  const body = `<div style="position:absolute;inset:40px 56px;display:flex;flex-direction:column;gap:22px">
<div class="row" style="gap:20px">${totalSvg(64, 'm40big')}<span class="col"><span class="ttl t5">Lucid Total</span><span class="mut">The mark: Lucid's ribbon and its twin, closed into one loop. The AI is drawn with the Lucid mark ${lucidSvg(18, 'lm40')}.</span></span></div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">${markRow}</div>
<span class="lbl2">Landmarks · on the three grounds and in one ink</span>
${lmGrid('deep')}${lmGrid('sky')}${lmGrid('deep', true)}${names}
<span class="lbl2">The world's vocabulary</span><div class="row" style="gap:6px;flex-wrap:wrap">${vocab}</div>
<span class="lbl2">The component library · people click, type or speak; the AI composes every view from it</span><div class="row" style="gap:8px;flex-wrap:wrap">${fams}</div></div>`;
  return `<div class="scr desk pt" role="region" aria-label="Brand, landmarks, grammar" style="height:1180px"><div class="stage">${body}</div></div>`;
}
export function sectionI() {
  return [
    fig(38, 'RTL and high contrast', `<div class="pair" style="flex-direction:column">${f38a()}${f38b()}</div>`, { size: [1440, 1848], cap: 'Top: Engineering in Hebrew (Heebo), the world mirrored, the "continues" chevron pointing to the start, numbers kept left to right; landmarks and marks are not mirrored. Bottom: the Horizon in Deep Blue high contrast: flat ground, landmarks and rings in one ink, visible edges, no glow and no blur. Both keep their own direction and contrast whatever the lab bar says.', focus: 'the mirrored programs; the three cards', att: [3, 4, 4], uc: 'UC-Q2 13§11' }),
    fig(39, 'The world as a tree', f39(), { cap: 'The list equivalent of the map (role=tree): the same hierarchy, landmarks as 16 px glyphs, progress as words, decisions and risks as glyph and word; the focused row and what a screen reader says for it; keys.', focus: 'the focused row: Private beta', att: [0, 1, 18], uc: 'UC-A1 13§11 03§9' }),
    fig(40, 'Brand, landmarks, grammar', f40(), { size: [1440, 1180], cap: 'The Lucid Total mark (v0.1) at five sizes on each ground; the nineteen landmarks on Deep Blue, on Sky Glass and in one ink; the vocabulary of the world; the component library. People never assemble or arrange the interface: they click, type or speak, and the AI composes every view from this library. The library grows over time (controls, layouts, visualisation mechanisms, and images and generated images as a family of their own): a missing component is proposed, built, reviewed in every theme and direction, and installed.', focus: 'the reference sheet', att: [0, 4, 0], uc: '13§5 13§8.2' }),
  ].join('');
}
