// The landmark library: monochrome vector silhouettes on a 48-unit grid, 2 px stroke (round caps and joins),
// drawn in the place's hue at 80 % (one ink under high contrast). Each stays under 24 path commands (checked below).
// Landmarks are drawings of the place's subject, never emoji and never Lucide icons (Lucide is for buttons and glyphs).
export const LANDMARKS = {
  skyline: ['Skyline', 'Engineering', 'M4 42h40M7 42V26h7V14h8v8h6V8h9v12h5v22M32.5 8V3M14 26v16M28 22v20M31.5 16h2'],
  workshop: ['Workshop', 'Product', 'M5 42V22l9-7v7l9-7v7l9-7v7l9-7v27ZM5 42h38M20 42v-9h8v9M10 29h5M33 29h5'],
  loom: ['Loom', 'Design', 'M8 6v36M40 6v36M5 6h38M5 42h38M15 10v28M21 10v28M27 10v28M33 10v28M8 20c4-4 8 4 12 0s8 4 12 0 6 3 8 1M8 30c4 4 8-4 12 0s8-4 12 0 6-3 8-1'],
  harbour: ['Harbour', 'Marketing', 'M9 31h22l-4 6H13ZM20 31V9l11 17H20M3 43c4-3 8 3 12 0s8 3 12 0 8 3 12 0 4 2 6 1M36 33v-8M42 33v-8M33 25h12'],
  bridge: ['Bridge', 'Sales and partnerships', 'M3 33h42M13 33V11M35 33V11M3 25c5 0 8-8 10-14 2 9 20 9 22 0 2 6 5 14 10 14M19 19v14M24 20v13M29 19v14M6 41h36'],
  lighthouse: ['Lighthouse', 'Compliance', 'M17 42l3-25h8l3 25ZM19 17h10v-6H19ZM18 11l6-5 6 5M19.5 29h9M32 12l10-3M32 16l10 3M16 12 6 9M16 16 6 19M9 42h30'],
  vault: ['Vault', 'Finance', 'M12 9h24a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V13a4 4 0 0 1 4-4ZM24 18a6 6 0 1 0 .01 0M24 15v-2M24 35v-2M15 24h-2M35 24h-2'],
  greenhouse: ['Greenhouse', 'People', 'M6 42V27C6 17 14 10 24 10s18 7 18 17v15ZM24 10v32M14.5 13v29M33.5 13v29M6 28h36M3 42h42'],
  gears: ['Gears', 'Operations', 'M19 17a9 9 0 1 0 .01 0M19 23a3 3 0 1 0 .01 0M19 8v4M19 30v4M10 21H6M32 21h-4M12.6 14.6l-2.8-2.8M28.2 30.2l-2.8-2.8M34 31a6 6 0 1 0 .01 0M34 43v-3M42 37h-3'],
  summit: ['Summit', 'Leadership', 'M3 41 18 17l6 9 7-12 14 27ZM14 23.5l4 3 3-2.5M31 14V4l8 3-8 3'],
  beacon: ['Beacon', 'Support', 'M18 42l4-13h4l4 13M13 29h22l-3 4H16ZM24 27c-5-3-6-8 0-15 6 7 5 12 0 15ZM12 15a14 14 0 0 1 4-7M36 15a14 14 0 0 0-4-7M8 18a20 20 0 0 1 3-10M40 18a20 20 0 0 0-3-10M14 42h20'],
  rocket: ['Rocket', 'Launch or program', 'M24 4c7 6 9 13 9 22l-9 6-9-6c0-9 2-16 9-22ZM24 15a3.5 3.5 0 1 0 .01 0M15 25l-6 7v7l8-5M33 25l6 7v7l-8-5M20.5 36 24 45l3.5-9'],
  flask: ['Flask', 'Research', 'M18 6h12M21 6v13L10 38a3 3 0 0 0 3 4h22a3 3 0 0 0 3-4L27 19V6M14.5 31h19M21 36h.01M27 34h.01M24 38h.01'],
  scroll: ['Scroll', 'Legal', 'M14 10h23v26a4 4 0 0 0 4 4H17a3 3 0 0 1-3-3ZM14 10a3 3 0 0 0-6 0v4h6M41 40a4 4 0 0 0 4-4v-2h-8M19 18h12M19 24h12M19 30h7'],
  tower: ['Tower', 'System', 'M24 14v2M17 43l7-27 7 27M20 32h8M21.5 25h5M18.5 37l8-5M29.5 37l-8-5M18 6a9 9 0 0 0 0 12M30 6a9 9 0 0 1 0 12M13 3a15 15 0 0 0 0 18M35 3a15 15 0 0 1 0 18'],
  satellite: ['Satellite', 'AI', 'M24 16l8 8-8 8-8-8ZM5 13l7-7 8 8-7 7ZM43 35l-7 7-8-8 7-7ZM20 20l-3-3M28 28l3 3M30 18l5-5M36 9a6 6 0 0 1 4 4M37 4a11 11 0 0 1 8 8'],
  stall: ['Stall', 'Store release', 'M6 18l4-10h28l4 10ZM6 18c0 3 3 5 6 5s6-2 6-5c0 3 3 5 6 5s6-2 6-5c0 3 3 5 6 5s6-2 6-5M9 23v19M39 23v19M4 42h40M18 42V31h12v11'],
  keep: ['Keep', 'Data residency', 'M12 42V9h5v4h5V9h4v4h5V9h5v33M21 42v-8a3 3 0 0 1 6 0v8M18 22h2M28 22h2M6 42h36'],
  gate: ['Gate', 'Milestone or gate', 'M8 42V18a16 12 0 0 1 32 0v24M14 42V20a10 8 0 0 1 20 0v22M5 42h38M24 8V3l6 2-6 2M8 26h6M34 26h6'],
};
export const LM_ORDER = ['skyline', 'workshop', 'loom', 'harbour', 'bridge', 'lighthouse', 'vault', 'greenhouse', 'gears', 'summit', 'beacon', 'rocket', 'flask', 'scroll', 'tower', 'satellite', 'stall', 'keep', 'gate'];
export const cmdCount = (d) => (d.match(/[MLHVCSQTAZmlhvcsqtaz]/g) || []).length;
export function lm(key, size = 40, cls = '', label = '') {
  const [name] = LANDMARKS[key];
  return `<svg class="lm ${cls}" viewBox="0 0 48 48" width="${size}" height="${size}" role="img" aria-label="${label || name + ' landmark'}"><path d="${LANDMARKS[key][2]}"/></svg>`;
}
// symbol defs (for use inside larger SVGs with <use>)
export const LM_SYMBOLS = Object.entries(LANDMARKS).map(([k, v]) => `<symbol id="lm-${k}" viewBox="0 0 48 48"><path d="${v[2]}"/></symbol>`).join('');
