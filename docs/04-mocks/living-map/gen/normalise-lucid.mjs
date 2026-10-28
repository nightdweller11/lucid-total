// @ts-check
/**
 * Turns the raw extraction (`data/lucid-chat.json`, from `extract.mjs`) into the normalised dataset the simulation
 * reads (`src/model.js`). Lands per lens, districts by task family, facades and sizes by workstream and row kind,
 * decisions as monuments, milestones from the decision titles. Cost is synthetic (a rate per doing-day by model);
 * the dataset says so.
 */
export function normaliseLucid(/** @type {any} */ raw) {
  const DEPT = {
    A: { name: 'Platform & infra', sub: 'Monorepo, Railway, CI, observability, secrets.', glyph: 'server', hue: 'slate', lm: 'gears' },
    B: { name: 'Protocol & crypto', sub: 'Envelopes, keys, gated release, vectors.', glyph: 'key', hue: 'rules', lm: 'shield' },
    C: { name: 'Server core', sub: 'Gateway, dispatcher, API, identity, media.', glyph: 'database', hue: 'sky', lm: 'skyline' },
    D: { name: 'Mediator & AI', sub: 'The mediator pipeline, the gateway, evals.', glyph: 'sparkles', hue: 'ai', lm: 'flask' },
    E1: { name: 'Client app', sub: 'The Expo app: iOS, Android, web.', glyph: 'smartphone', hue: 'sky', lm: 'rocket' },
    E2: { name: 'UI kit & i18n', sub: 'Tokens, glass, glyphs, catalogs, RTL.', glyph: 'palette', hue: 'violet', lm: 'loom' },
    F: { name: 'Policy & admin', sub: 'Platform policy, flags, markets, the console.', glyph: 'sliders', hue: 'rules', lm: 'lighthouse' },
    G: { name: 'QA & performance', sub: 'Maestro, Playwright, k6, gates.', glyph: 'gauge', hue: 'lime', lm: 'beacon' },
    H: { name: 'Docs & compliance', sub: 'Docs, runbooks, legal, store deliverables.', glyph: 'book', hue: 'warm', lm: 'vault' },
    Lead: { name: 'Lead', sub: 'Orchestration, reviews, merges, releases.', glyph: 'compass', hue: 'gold', lm: 'summit' },
    Owner: { name: 'Owner', sub: 'Decisions and the machine.', glyph: 'crown', hue: 'gold', lm: 'house' },
  };
  const PROJ = {
    CT: { name: 'Contracts sprint', sub: 'Protocol, crypto, APIs, schemas before code.', glyph: 'file-signature', hue: 'rules', lm: 'vault' },
    P0: { name: 'Foundations', sub: 'Gate 0: the repo, the stack, the kit.', glyph: 'layers', hue: 'slate', lm: 'gears' },
    P1: { name: 'Alpha', sub: 'Gate 1: chats, mediation, the app.', glyph: 'rocket', hue: 'sky', lm: 'rocket' },
    P2: { name: 'Private beta', sub: 'Gate 2: stores, real models, real phones.', glyph: 'users', hue: 'sky', lm: 'store' },
    P3: { name: 'Public launch', sub: 'Gate 3.', glyph: 'flag', hue: 'warm', lm: 'harbour' },
    P4: { name: 'Scale', sub: 'After launch.', glyph: 'trending-up', hue: 'slate', lm: 'bridge' },
    ENV: { name: 'Environment', sub: 'The machine, the simulators, GitHub, Railway.', glyph: 'monitor', hue: 'slate', lm: 'house' },
    MOCKS: { name: 'Mocks & design', sub: 'The screens before the app.', glyph: 'pen-tool', hue: 'violet', lm: 'loom' },
    DEC: { name: 'Owner decisions', sub: 'Follow-ups of numbered decisions.', glyph: 'gavel', hue: 'gold', lm: 'summit' },
  };
  const PROD = {
    mobile: { name: 'Lucid app', sub: 'iOS, Android and web: the chat app.', glyph: 'smartphone', hue: 'sky', lm: 'rocket' },
    server: { name: 'Server', sub: 'Gateway, dispatcher, API, data.', glyph: 'database', hue: 'sky', lm: 'skyline' },
    ai: { name: 'Mediator & AI', sub: 'Mediation, Coach, Assistant, evals.', glyph: 'sparkles', hue: 'ai', lm: 'flask' },
    admin: { name: 'Admin console', sub: 'Platform policy and the console.', glyph: 'sliders', hue: 'rules', lm: 'lighthouse' },
    platform: { name: 'Platform & tooling', sub: 'Infra, CI, environments, releases.', glyph: 'server', hue: 'slate', lm: 'gears' },
    ui: { name: 'Design system', sub: 'Tokens, components, i18n, mocks.', glyph: 'palette', hue: 'violet', lm: 'loom' },
    docs: { name: 'Docs & compliance', sub: 'Documents, runbooks, legal, stores.', glyph: 'book', hue: 'warm', lm: 'vault' },
    quality: { name: 'Quality & load', sub: 'Suites, gates, load tests.', glyph: 'gauge', hue: 'lime', lm: 'beacon' },
  };
  const PEOPLE = {
    owner: { name: 'Owner', sub: 'Yossi: decisions, the machine, the pilots.', glyph: 'crown', hue: 'gold', lm: 'house' },
    lead: { name: 'Lead', sub: 'Fable: orchestration, review, merges, releases.', glyph: 'compass', hue: 'gold', lm: 'summit' },
    ...Object.fromEntries(['A', 'B', 'C', 'D', 'E1', 'E2', 'F', 'G', 'H'].map((w) => [`crew-${w}`, { name: `Crew ${w}`, sub: `Opus workers on ${DEPT[w].name.toLowerCase()}.`, glyph: 'bot', hue: 'ai', lm: 'gears' }])),
  };
  const prodOf = (/** @type {any} */ t) => {
    const s = `${t.id} ${t.t}`;
    if (/admin console|\badmin\b|console/i.test(s)) return 'admin';
    if (/\b(ios|android|expo|mobile|app store|testflight|screen|onboarding|chat screen|maestro)\b/i.test(s) || /^E1/.test(t.ws)) return 'mobile';
    if (/mediat|\bai\b|model|eval|gateway|coach|assistant|guard|prompt/i.test(s) || /^D/.test(t.ws)) return 'ai';
    if (/docs?\b|runbook|adr|compliance|legal|store listing|privacy|terms/i.test(s) || /^H/.test(t.ws)) return 'docs';
    if (/k6|playwright|load|perf|gate report|suite/i.test(s) || /^G/.test(t.ws)) return 'quality';
    if (/token|i18n|icon|theme|mock|glyph|rtl|catalog/i.test(s) || /^E2/.test(t.ws)) return 'ui';
    if (/railway|ci\b|lint|monorepo|tooling|github|env|docker|worktree|release/i.test(s) || /^A/.test(t.ws)) return 'platform';
    return 'server';
  };
  const root = (/** @type {string} */ id) => id.replace(/-(w\d+|F\d+|CR\d+|R\d+)/g, '');
  const phaseByDate = (/** @type {number} */ b) => (b < Date.parse('2026-10-20T00:00:00+03:00') ? 'P0' : b < Date.parse('2026-10-24T00:00:00+03:00') ? 'P1' : 'P2');
  const projOf = (/** @type {any} */ t) => {
    const r = root(t.id);
    const m = /^(CT|P[0-4]|ENV|MOCKS)/.exec(r);
    if (m) return m[1];
    if (/^L\d+/.test(r)) return 'DEC';
    return phaseByDate(t.born);
  };
  const deptOf = (/** @type {any} */ t) => { const w = t.ws.split('/')[0].replace(/[^A-Za-z0-9]/g, ''); return DEPT[w] ? w : /owner/i.test(t.ws) ? 'Owner' : /lead/i.test(t.ws) ? 'Lead' : 'A'; };
  const peopleOf = (/** @type {any} */ t, /** @type {string} */ dept) => (dept === 'Owner' ? 'owner' : dept === 'Lead' || t.model === 'Fable 5.1' ? 'lead' : `crew-${dept}`);
  const facadeOf = (/** @type {string} */ dept, /** @type {string} */ prod) => ({ mobile: 'screens', ui: 'screens', docs: 'doc', ai: 'chart', quality: 'chart', platform: 'infra', admin: 'listing', server: 'term' })[prod] || 'code';
  const titles = new Map(raw.tasks.map((/** @type {any} */ t) => [t.id, t.t]));
  const items = raw.tasks.map((/** @type {any} */ t) => {
    const dept = deptOf(t);
    const prod = prodOf(t);
    const proj = projOf(t);
    const r = root(t.id);
    const isRoot = r === t.id;
    const s = isRoot ? (/^CT|^P[0-4]-[A-Z]/.test(t.id) ? 4 : 3) : /CR\d/.test(t.id) ? 2 : /F\d/.test(t.id) ? 1 : 2;
    const dec = (/^L(\d+)/.exec(r) || [])[1] ? `L${/^L(\d+)/.exec(r)[1]}` : null;
    const people = peopleOf(t, dept);
    return {
      id: t.id, n: t.t || t.id, k: /chore|rotate|token|install|licen/i.test(t.t) ? 'chore' : 'task', s, f: facadeOf(dept, prod),
      b: t.born, g: { dept, proj, prod, people }, d: { dept: `${dept}:${r}`, proj: `${proj}:${r}`, prod: `${prod}:${r}`, people: `${people}:${r}` },
      st: t.st, dep: (t.dep || []).filter((/** @type {string} */ d) => titles.has(d) && d !== t.id), dec, rooms: s + 2,
      owner: people === 'owner' ? 'Owner' : people === 'lead' ? 'Lead' : t.model || 'Opus 5.5', agent: people !== 'owner' || undefined,
      cost: people === 'owner' ? 0 : t.model === 'Fable 5.1' || people === 'lead' ? 90 : 36, walk: t.walk || undefined,
    };
  });
  const districts = { dept: {}, proj: {}, prod: {}, people: {} };
  for (const it of items) for (const lk of Object.keys(districts)) {
    const d = it.d[lk];
    if (!districts[lk][d]) { const r = d.split(':')[1]; districts[lk][d] = { name: titles.has(r) ? `${r} · ${titles.get(r).slice(0, 48)}` : r }; }
  }
  const DEPT2PROD = { A: 'platform', B: 'server', C: 'server', D: 'ai', E1: 'mobile', E2: 'ui', F: 'admin', G: 'quality', H: 'docs' };
  const AREA = [[/\b(ios|android|app|testflight|expo|screen|onboarding|simulator|device)\b/i, 'E1'], [/mediat|\bmodel|\bai\b|eval|guard|coach|assistant|prompt|inference|on-device/i, 'D'], [/\bdocs?\b|runbook|mocks?\b|status (page|board|site)/i, 'H'], [/policy|admin|market|compliance|consent|age /i, 'F'], [/crypto|\bkeys?\b|protocol|epoch|envelope/i, 'B'], [/server|dispatcher|\bapi\b|postgres|gateway|sequenc/i, 'C'], [/\btest|load|k6|maestro|playwright|gate \d/i, 'G'], [/theme|token|i18n|rtl|glass|icon/i, 'E2'], [/railway|docker|github|\bci\b|worktree|agents?|opus|fable|sonnet|machine|monorepo|pnpm|typescript|dependenc/i, 'A']];
  // the lead's merge records ("Wave 12 D accepted and merged") are history of the rows, not decisions: they are not monuments
  const decisions = raw.decisions.filter((/** @type {any} */ d) => !(d.who !== 'owner' && /accepted and merged|^merged\b|^waves? [\dA-Z ,and]+ merged/i.test(d.t))).map((/** @type {any} */ d) => {
    const who = d.who || 'lead';
    const w = (/\b[Ww]ave \d+ ([A-H][12]?)\b/.exec(d.t) || [])[1];
    const area = (AREA.find(([re]) => re.test(d.t)) || [])[1];
    const dept = w && DEPT[w] ? w : area || (who === 'owner' ? 'Owner' : 'Lead');
    return { id: `L${d.n}`, n: d.t, b: d.born, who, refs: (d.refs || []).filter((/** @type {string} */ r) => titles.has(r)), home: { dept, proj: phaseByDate(d.born), prod: DEPT2PROD[dept] || (who === 'owner' ? 'mobile' : 'platform'), people: who === 'owner' ? 'owner' : 'lead' } };
  });
  const decById = new Map(decisions.map((d) => [d.id, d]));
  for (const it of items) if (it.dec && decById.has(it.dec) && !decById.get(it.dec).refs.includes(it.id)) decById.get(it.dec).refs.push(it.id);
  const milestones = decisions
    .filter((d) => /gate \d.*(passed|met|green|closed)|testflight build \d+ is live|build \d+ (is )?live|first (testflight|build)|on-device pilot approved|lucid total founded/i.test(d.n))
    .map((d) => ({ t: d.b, n: d.n.replace(/\*\*/g, '').slice(0, 40), land: { dept: 'E1', proj: phaseByDate(d.b), prod: 'mobile', people: 'lead' }, dec: d.id }));
  const t0 = Math.min(...items.map((i) => i.b));
  const t1 = Math.max(...items.flatMap((i) => i.st.map((/** @type {any} */ s) => s[0])), ...decisions.map((d) => d.b));
  return {
    key: 'lucid', name: 'Lucid Chat', sub: 'Real: every checklist row and numbered decision of Lucid Chat\'s build, from the repository\'s history (2026-10-18 to 2026-10-28). Cost is a synthetic rate per working day by model.',
    span: [t0, t1 + 3600e3], now: t1 + 3600e3, synthetic: ['cost', 'rooms', 'size'],
    lenses: {
      dept: { name: 'Departments', spacing: 15, lands: DEPT },
      proj: { name: 'Projects', spacing: 16, lands: PROJ },
      prod: { name: 'Products', spacing: 16, lands: PROD },
      people: { name: 'People', spacing: 15, lands: PEOPLE },
    },
    districts, items, decisions, milestones, people: [], revenue: [],
  };
}
