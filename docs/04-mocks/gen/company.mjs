// The company world for the owner's perspective, laid out once and pinned (every frame that shows the company uses it).
import { layout } from './world.mjs';
export const COMPANY = layout({
  W: 1440, H: 900,
  coast: { cx: 760, cy: 450, rx: 590, ry: 352, n: 2.6, wob: 0.09, seed: 11 },
  places: [
    { k: 'ldr', x: 330, y: 230, t: 5 }, { k: 'prd', x: 560, y: 175, t: 10 }, { k: 'dsg', x: 790, y: 165, t: 7 }, { k: 'cmp', x: 1020, y: 200, t: 10 }, { k: 'fin', x: 1235, y: 300, t: 5 },
    { k: 'sal', x: 270, y: 470, t: 6 }, { k: 'eng', x: 600, y: 470, t: 26 }, { k: 'mkt', x: 990, y: 470, t: 13 }, { k: 'ops', x: 1250, y: 560, t: 6 },
    { k: 'ppl', x: 400, y: 700, t: 4 }, { k: 'sup', x: 820, y: 720, t: 7 }, { k: 'x', x: 1100, y: 720, t: 0 },
  ].filter((p) => p.t > 0).map((p) => ({ ...p, subs: { eng: [5, 4, 3, 2, 2], prd: [3, 2, 2], dsg: [2, 2, 1], mkt: [3, 2, 2, 1], sal: [2, 1], sup: [2, 2], cmp: [3, 2, 2], fin: [2, 1], ppl: [1, 1], ops: [2, 1, 1], ldr: [1, 1] }[p.k] })),
  islands: [{ k: 'sys', x: 118, y: 690, rx: 62, ry: 50, subs: [[100, 676, 22, 16], [136, 684, 18, 15], [112, 710, 20, 13]] }],
});
