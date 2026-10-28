// The one company every variant draws: Lucid (the chat app) run on Lucid Total, 2026-10-28.
// Measures are 0..1 shares so each variant can map them onto its own encoding. Same numbers everywhere, so the
// five variants can be compared honestly.
export const FAM = { build: 'var(--h-build)', market: 'var(--h-market)', run: 'var(--h-run)', govern: 'var(--h-govern)' };

// work = open work weighted by estimate; done = done share; fc = forecast share at the goal date; spend = total spend
// (ai = AI share of it); issues = support issues, incidents and risk; stale = no movement in 14 days; heat = moved today;
// load = people load; trust = autonomy granted to agents.
export const DOM = {
  eng: { name: 'Engineering', fam: 'build', lm: 'skyline', work: 1.0, done: 0.58, fc: 0.7, spend: 1.0, ai: 0.7, issues: 0.55, stale: 0.0, heat: 1.0, load: 0.95, trust: 0.75 },
  prod: { name: 'Product', fam: 'build', lm: 'workshop', work: 0.5, done: 0.62, fc: 0.75, spend: 0.22, ai: 0.3, issues: 0.15, stale: 0.1, heat: 0.45, load: 0.6, trust: 0.4 },
  design: { name: 'Design', fam: 'build', lm: 'loom', work: 0.36, done: 0.74, fc: 0.85, spend: 0.16, ai: 0.4, issues: 0.05, stale: 0.0, heat: 0.65, load: 0.5, trust: 0.35 },
  mkt: { name: 'Marketing', fam: 'market', lm: 'harbour', work: 0.62, done: 0.41, fc: 0.48, spend: 0.5, ai: 0.35, issues: 0.2, stale: 0.15, heat: 0.4, load: 0.55, trust: 0.45 },
  sales: { name: 'Partnerships', fam: 'market', lm: 'bridge', work: 0.26, done: 0.35, fc: 0.4, spend: 0.1, ai: 0.1, issues: 0.05, stale: 0.8, heat: 0.0, load: 0.2, trust: 0.2 },
  support: { name: 'Support', fam: 'market', lm: 'beacon', work: 0.4, done: 0.66, fc: 0.72, spend: 0.45, ai: 0.85, issues: 0.9, stale: 0.0, heat: 0.55, load: 0.6, trust: 0.9 },
  fin: { name: 'Finance', fam: 'run', lm: 'vault', work: 0.2, done: 0.8, fc: 0.9, spend: 0.1, ai: 0.2, issues: 0.05, stale: 0.3, heat: 0.1, load: 0.3, trust: 0.55 },
  ops: { name: 'Operations', fam: 'run', lm: 'gears', work: 0.3, done: 0.7, fc: 0.75, spend: 0.38, ai: 0.2, issues: 0.25, stale: 0.2, heat: 0.2, load: 0.4, trust: 0.6 },
  people: { name: 'People', fam: 'run', lm: 'greenhouse', work: 0.2, done: 0.52, fc: 0.6, spend: 0.14, ai: 0.05, issues: 0.05, stale: 0.45, heat: 0.05, load: 0.3, trust: 0.15 },
  comp: { name: 'Compliance', fam: 'govern', lm: 'lighthouse', work: 0.45, done: 0.38, fc: 0.42, spend: 0.25, ai: 0.15, issues: 0.65, stale: 0.1, heat: 0.15, load: 0.75, trust: 0.2 },
  lead: { name: 'Leadership', fam: 'govern', lm: 'summit', work: 0.3, done: 0.5, fc: 0.6, spend: 0.08, ai: 0.1, issues: 0.1, stale: 0.25, heat: 0.2, load: 0.5, trust: 0.1 },
};
export const hue = (k) => FAM[DOM[k].fam];

// Engineering's programs (Z1) and the beta's streams (Z2)
export const ENG = {
  beta: { name: 'Private beta', lm: 'rocket', work: 1.0, done: 0.58, fc: 0.66 },
  ios: { name: 'iOS 1.0', lm: 'store', work: 0.6, done: 0.44, fc: 0.55 },
  eu: { name: 'EU residency', lm: 'shield', work: 0.45, done: 0.3, fc: 0.35, overlap: ['comp', 'mkt'] },
  evals: { name: 'Evals', lm: 'flask', work: 0.35, done: 0.7, fc: 0.8 },
  platform: { name: 'Platform', lm: 'layers', work: 0.4, done: 0.62, fc: 0.7 },
};
export const MKT = {
  launch: { name: 'Beta launch', lm: 'rocket' }, europe: { name: 'Europe launch', lm: 'shield' }, brand: { name: 'Brand', lm: 'sail' }, news: { name: 'Newsletter', lm: 'megaphone' },
};
export const STREAMS = {
  dispatcher: { name: 'Dispatcher', lm: 'dispatch' }, relay: { name: 'Relay', lm: 'relay' }, evals: { name: 'Evals', lm: 'flask' }, store: { name: 'Store', lm: 'store' },
};
// the beta's buildings: stream, facade kind, built?, criteria share; chores have no facade
export const BLD = [
  { id: 'disp-seq', s: 'dispatcher', k: 'chart', built: true, crit: 0.66, t: 'Dispatcher sequencing under load', blocked: true },
  { id: 'disp-term', s: 'dispatcher', k: 'term', built: true, crit: 1 },
  { id: 'relay-ui', s: 'relay', k: 'screens', built: true, crit: 0.83 },
  { id: 'relay-hebrew', s: 'relay', k: 'screens', built: false },
  { id: 'eval-rep', s: 'evals', k: 'doc', built: true, crit: 1, landmark: true },
  { id: 'eval-mod', s: 'evals', k: 'doc', built: true, crit: 0.5 },
  { id: 'ios-build', s: 'store', k: 'build', built: true, crit: 0.8 },
  { id: 'store-sub', s: 'store', k: 'listing', built: false, t: 'Store submission', waits: true },
  { id: 'eval-chart', s: 'evals', k: 'chart', built: false },
];
// the stuck situation every variant draws
export const PROBLEM = {
  token: { name: 'Railway token', home: 'ops', kind: 'chore', note: 'chore, envelope · Operations' },
  dispatcher: { name: 'Dispatcher', home: 'eng', note: 'sequencing under load · Private beta' },
  submission: { name: 'Store submission', home: 'eng', note: 'iOS build 7 · Private beta' },
  dpa: { name: 'DPA signature', home: 'comp', note: 'Cohen Legal · two days late' },
  waits: { name: 'Marketing', note: 'Beta launch and Europe launch wait on both' },
};
export const GOALS = [{ name: 'Beta live', done: 0.58, fc: 0.66 }, { name: 'Europe', done: 0.3, fc: 0.36 }, { name: 'Runway', done: 0.72, fc: 0.8 }];
