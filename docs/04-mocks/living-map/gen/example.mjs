#!/usr/bin/env node
// @ts-check
/**
 * Generates the example company: three years of a fictional company that builds Lucid Chat, grows departments,
 * spins Lucid Total out of Engineering into its own line, launches, earns revenue, has one crisis, and keeps a
 * forecast beyond "now". Deterministic (seeded), no real people, no real money. Output: the normalised dataset
 * format described in `src/model.js` (same as the Lucid Chat extraction after `normalise-lucid.mjs`).
 *
 *   node gen/example.mjs > data/example-co.json
 */
const DAY = 86400e3;
const T0 = Date.parse('2024-01-08T09:00:00Z');
const NOW = Date.parse('2026-10-28T12:00:00Z');
const T1 = Date.parse('2026-12-31T12:00:00Z');
const month = (/** @type {number} */ m) => T0 + m * 30.44 * DAY;

// ---- seeded randomness ----
let seed = 20261028;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (/** @type {any[]} */ a) => a[Math.floor(rnd() * a.length)];
const between = (/** @type {number} */ a, /** @type {number} */ b) => a + rnd() * (b - a);

// ---- lands per lens ----
const DEPT = {
  founders: { name: 'Founders', sub: 'The two who started it; everything before there were departments.', glyph: 'sparkles', hue: 'gold', lm: 'summit', from: 0 },
  eng: { name: 'Engineering', sub: 'Builds and runs the products.', glyph: 'cpu', hue: 'sky', lm: 'skyline', from: 0 },
  product: { name: 'Product', sub: 'Decides what is built and why.', glyph: 'compass', hue: 'sky', lm: 'workshop', from: 3 },
  design: { name: 'Design', sub: 'How it looks, feels and reads.', glyph: 'pen-tool', hue: 'violet', lm: 'loom', from: 6 },
  marketing: { name: 'Marketing', sub: 'Tells the world; brings people in.', glyph: 'megaphone', hue: 'warm', lm: 'harbour', from: 9 },
  sales: { name: 'Sales', sub: 'Partnerships, business customers, Teams.', glyph: 'handshake', hue: 'warm', lm: 'bridge', from: 12 },
  support: { name: 'Support', sub: 'Keeps users whole; incidents and answers.', glyph: 'life-buoy', hue: 'lime', lm: 'beacon', from: 14 },
  finops: { name: 'Finance & Ops', sub: 'Money, vendors, the machines that run us.', glyph: 'landmark', hue: 'slate', lm: 'vault', from: 16 },
  compliance: { name: 'Compliance', sub: 'Law, privacy, stores, audits.', glyph: 'scale', hue: 'rules', lm: 'lighthouse', from: 19 },
  people: { name: 'People', sub: 'Hiring, growth, wellbeing.', glyph: 'users', hue: 'lime', lm: 'greenhouse', from: 24 },
};
const PROD = {
  platform: { name: 'Platform', sub: 'What every product stands on: infra, identity, data, AI gateway.', glyph: 'layers', hue: 'slate', lm: 'gears' },
  chat: { name: 'Lucid Chat', sub: 'The augmented communication app.', glyph: 'message-circle', hue: 'sky', lm: 'rocket' },
  total: { name: 'Lucid Total', sub: 'The company operating system; began as internal tools.', glyph: 'map', hue: 'violet', lm: 'summit', from: 28 },
  teams: { name: 'Lucid for Teams', sub: 'The business line: mediated groups for organisations.', glyph: 'briefcase', hue: 'warm', lm: 'bridge', from: 30 },
};
const PROJ = {
  proto: { name: 'Prototype', sub: 'Prove the mediation idea on a phone.', glyph: 'flask', hue: 'gold', lm: 'workshop', from: 0, to: 4 },
  alpha: { name: 'Alpha', sub: 'A real app for friends and family.', glyph: 'rocket', hue: 'sky', lm: 'rocket', from: 4, to: 10 },
  beta: { name: 'Private beta', sub: 'Strangers, stores, the mediator for real.', glyph: 'users', hue: 'sky', lm: 'store', from: 10, to: 15 },
  launch: { name: 'Launch', sub: 'Public on both stores.', glyph: 'flag', hue: 'warm', lm: 'harbour', from: 15, to: 18 },
  europe: { name: 'Europe', sub: 'Residency, DPAs, German and French first.', glyph: 'globe', hue: 'rules', lm: 'shield', from: 18, to: 24 },
  scale: { name: 'Scale & SOC 2', sub: 'Ten times the users; the audit.', glyph: 'trending-up', hue: 'slate', lm: 'gears', from: 22, to: 30 },
  total: { name: 'Lucid Total', sub: 'The operating system, for us first.', glyph: 'map', hue: 'violet', lm: 'summit', from: 20, to: 40 },
  teams: { name: 'Teams', sub: 'The business line.', glyph: 'briefcase', hue: 'warm', lm: 'bridge', from: 30, to: 40 },
  run: { name: 'Run', sub: 'The work that never ends: support, incidents, money, people.', glyph: 'activity', hue: 'lime', lm: 'beacon', from: 14, to: 40 },
};
// people (fictional)
const PEOPLE = [
  { id: 'yossi', name: 'Yossi', role: 'founder', dept: 'founders', from: 0, rate: 0 },
  { id: 'noa', name: 'Noa', role: 'co-founder, engineering', dept: 'founders', from: 0, rate: 0 },
  { id: 'dana', name: 'Dana', role: 'design', dept: 'design', from: 6, rate: 520 },
  { id: 'omri', name: 'Omri', role: 'engineering', dept: 'eng', from: 8, rate: 640 },
  { id: 'maya', name: 'Maya', role: 'marketing', dept: 'marketing', from: 9, rate: 480 },
  { id: 'lior', name: 'Lior', role: 'sales', dept: 'sales', from: 12, rate: 500 },
  { id: 'tamar', name: 'Tamar', role: 'support', dept: 'support', from: 14, rate: 380 },
  { id: 'eitan', name: 'Eitan', role: 'finance and operations', dept: 'finops', from: 16, rate: 560 },
  { id: 'roni', name: 'Roni', role: 'compliance', dept: 'compliance', from: 19, rate: 600 },
  { id: 'shira', name: 'Shira', role: 'engineering', dept: 'eng', from: 21, rate: 640 },
  { id: 'amit', name: 'Amit', role: 'product', dept: 'product', from: 23, rate: 580 },
  { id: 'yael', name: 'Yael', role: 'people', dept: 'people', from: 24, rate: 450 },
  { id: 'ido', name: 'Ido', role: 'engineering', dept: 'eng', from: 27, rate: 640 },
  { id: 'gal', name: 'Gal', role: 'support', dept: 'support', from: 29, rate: 380 },
  { id: 'tal', name: 'Tal', role: 'sales', dept: 'sales', from: 31, rate: 500 },
];
const AGENTS = [
  { id: 'build-crew', name: 'Build crew', role: 'agents that build', dept: 'eng', from: 14, rate: 45 },
  { id: 'support-agent', name: 'Support agent', role: 'answers and triage', dept: 'support', from: 17, rate: 12 },
  { id: 'research-agent', name: 'Research agent', role: 'reads and reports', dept: 'product', from: 20, rate: 10 },
  { id: 'ops-agent', name: 'Ops agent', role: 'runs the machines', dept: 'finops', from: 25, rate: 15 },
];

// ---- the story: decisions, milestones, the crisis, the secession ----
const DECISIONS = [
  [0.2, 'Phone-only signup, no email, no password', 'owner', ['eng', 'product']],
  [0.6, 'Mediation is always on; no user opt-out', 'owner', ['product']],
  [1.5, 'Expo for both phones and the web', 'lead', ['eng']],
  [2.4, 'Sealed mediation: nothing outside the mediator sees plaintext', 'owner', ['eng']],
  [3.2, 'Form a Product function', 'owner', ['product']],
  [4.0, 'Alpha for friends and family in six months', 'owner', ['eng', 'product']],
  [5.5, 'Hire a designer', 'owner', ['design']],
  [6.8, 'Lucid Glass as the design language', 'lead', ['design']],
  [8.2, 'Railway-first: no new service without a written case', 'owner', ['eng']],
  [9.3, 'Begin marketing before the beta', 'owner', ['marketing']],
  [10.5, 'Private beta with strangers: stores, policy, Relay', 'owner', ['eng', 'product']],
  [11.4, 'Model gateway: never name a model in product code', 'lead', ['eng']],
  [12.2, 'Partnerships: the first ten organisations', 'owner', ['sales']],
  [13.6, 'Workers on strong models only; never a small model for builds', 'owner', ['eng']],
  [14.1, 'Agents join the build crew', 'owner', ['eng']],
  [14.4, 'Open Support with one person and one agent', 'owner', ['support']],
  [15.8, 'Launch on both stores in the same week', 'owner', ['eng', 'marketing']],
  [16.3, 'Finance and operations as a function', 'owner', ['finops']],
  [17.0, 'Plus subscription: one tier, one price', 'owner', ['product', 'finops']],
  [18.0, 'Europe first: residency before growth', 'owner', ['eng', 'compliance']],
  [18.9, 'Hire compliance', 'owner', ['compliance']],
  [19.7, 'Age assurance per market, dormant by default', 'owner', ['compliance', 'product']],
  [20.3, 'Build our own operating system: internal tools first', 'owner', ['eng']],
  [21.2, 'Second engineer; the build crew grows', 'owner', ['eng']],
  [22.1, 'Ordering guard in the dispatcher (the outage)', 'lead', ['eng', 'support']],
  [22.6, 'Incident review: fail-closed stays fail-closed', 'owner', ['eng', 'compliance']],
  [23.5, 'SOC 2 in the next year', 'owner', ['compliance', 'finops']],
  [24.2, 'A People function', 'owner', ['people']],
  [25.0, 'Ops agent runs the machines at night', 'lead', ['finops']],
  [26.1, 'Lucid Total gets its own goal and budget', 'owner', ['eng', 'product']],
  [27.4, 'Third engineer for Lucid Total', 'owner', ['eng']],
  [28.0, 'Lucid Total is its own line of business', 'owner', ['product', 'eng']],
  [29.0, 'Second support person; agent handles tier one', 'owner', ['support']],
  [30.0, 'Lucid for Teams: the business line', 'owner', ['sales', 'product', 'eng']],
  [31.2, 'Teams pricing by seat', 'owner', ['sales', 'finops']],
  [32.0, 'Living map as the company view', 'owner', ['product', 'eng']],
  [33.0, 'Teams launch in November', 'owner', ['sales', 'marketing']],
  [33.6, 'Fable enabled for security work only', 'owner', ['eng']],
];
const MILESTONES = [
  [4.0, 'Prototype demo', 'proto', 'chat'],
  [10.0, 'Alpha in hands', 'alpha', 'chat'],
  [15.0, 'Private beta live', 'beta', 'chat'],
  [18.0, 'On both stores', 'launch', 'chat'],
  [18.6, 'First revenue', 'launch', 'chat'],
  [24.0, 'Europe live', 'europe', 'chat'],
  [28.0, 'Lucid Total: its own line', 'total', 'total'],
  [30.2, 'SOC 2 report', 'scale', 'platform'],
  [35.2, 'Teams launch', 'teams', 'teams'],
];
const CRISIS = { from: 22.0, to: 22.8 };

// ---- items ----
const VERBS = {
  eng: ['Build', 'Wire', 'Migrate', 'Harden', 'Ship', 'Fix', 'Measure', 'Refactor', 'Instrument', 'Load-test'],
  product: ['Define', 'Decide', 'Write the plan for', 'Research', 'Review', 'Prioritise', 'Specify'],
  design: ['Design', 'Mock', 'Polish', 'Illustrate', 'Test with users', 'Tokenise'],
  marketing: ['Write', 'Launch', 'Publish', 'Film', 'Plan', 'Measure'],
  sales: ['Pitch', 'Close', 'Onboard', 'Renew', 'Propose to', 'Qualify'],
  support: ['Answer', 'Triage', 'Resolve', 'Document', 'Escalate', 'Follow up on'],
  finops: ['Pay', 'Reconcile', 'Renew', 'Provision', 'Rotate', 'Budget'],
  compliance: ['File', 'Review', 'Sign', 'Audit', 'Map', 'Translate'],
  people: ['Hire', 'Onboard', 'Review', 'Plan', 'Celebrate'],
  founders: ['Build', 'Decide', 'Talk to', 'Sketch', 'Prove'],
};
const NOUNS = {
  eng: ['the dispatcher', 'sequencing under load', 'the sync engine', 'push on Android', 'the gateway handshake', 'epoch rotation', 'the Relay flow', 'OTP delivery', 'the media presign', 'the eval harness', 'the admin API', 'the policy resolver', 'the store build', 'the crash reporter', 'the k6 scenario', 'the outbox', 'the local DB', 'the model router', 'the clarity bubble', 'the group settings', 'residency routing', 'the audit log', 'the Teams admin', 'the living map layout', 'the scene validator', 'the channel adapter', 'the Slack listener', 'the trust ledger', 'the repair loop'],
  product: ['the mediation levels', 'the Coach', 'the beta scope', 'the pricing page', 'the Europe plan', 'the Teams plan', 'the onboarding', 'the age mechanisms', 'the Plus tier', 'the roadmap', 'the quarter goals', 'the living map', 'the decision flow'],
  design: ['the chat screen', 'the meaning glyphs', 'the theme lab', 'the RTL pass', 'the onboarding', 'the settings', 'the admin console', 'the landmark set', 'the facades', 'the store listing art', 'the Teams console'],
  marketing: ['the launch post', 'the newsletter', 'the beta waitlist', 'the Europe page', 'the Teams page', 'the brand film', 'the press list', 'the store screenshots', 'the referral loop'],
  sales: ['the first ten', 'the school pilot', 'the clinic pilot', 'the Teams contract', 'the renewal', 'the partner deck', 'the German reseller', 'the pricing by seat'],
  support: ['the login issues', 'the push backlog', 'the Hebrew answers', 'the incident', 'the refund', 'the appeal', 'the outage questions', 'the Teams onboarding'],
  finops: ['the Railway bill', 'the model invoices', 'payroll', 'the insurance', 'the runway', 'the SOC 2 vendor', 'the machines', 'the backups'],
  compliance: ['the DPA', 'the privacy notice', 'the store declarations', 'the age matrix', 'the German filing', 'the audit trail', 'the Teams terms'],
  people: ['the engineer role', 'the support role', 'the review cycle', 'the offsite', 'the handbook'],
  founders: ['the idea', 'the first screen', 'the first users', 'the pitch', 'the mediator prompt'],
};
const FACADE = { eng: ['code', 'term', 'build', 'infra'], product: ['doc', 'chart'], design: ['screens'], marketing: ['listing', 'doc'], sales: ['doc', 'chart'], support: ['term', 'doc'], finops: ['chart', 'infra'], compliance: ['doc'], people: ['doc'], founders: ['screens', 'code'] };

/** @type {any[]} */
const items = [];
/** @type {Map<string, number>} */
const counter = new Map();
const idFor = (/** @type {string} */ dept) => { const n = (counter.get(dept) || 0) + 1; counter.set(dept, n); return `${dept.slice(0, 3).toUpperCase()}-${String(n).padStart(3, '0')}`; };

const deptAt = (/** @type {number} */ m) => Object.entries(DEPT).filter(([k, d]) => d.from <= m && (k !== 'founders' || m < 3)).map(([k]) => k);
const projectFor = (/** @type {number} */ m, /** @type {string} */ dept, /** @type {string} */ prod) => {
  if (prod === 'total') return 'total';
  if (prod === 'teams') return 'teams';
  if (['support', 'finops', 'people'].includes(dept) && m >= 14) return 'run';
  if (dept === 'compliance' && m >= 22 && m < 30 && rnd() < 0.6) return 'scale';
  const seq = Object.entries(PROJ).filter(([k, p]) => !['total', 'teams', 'run'].includes(k) && p.from <= m && p.to > m);
  if (!seq.length) return 'scale';
  return seq.length > 1 && rnd() < 0.4 ? seq[1][0] : seq[0][0];
};
const productFor = (/** @type {number} */ m, /** @type {string} */ dept) => {
  if (m >= 30 && rnd() < (dept === 'sales' ? 0.7 : 0.25)) return 'teams';
  if (dept === 'eng' && m >= 20 && rnd() < (m >= 26 ? 0.4 : 0.22)) return 'total';
  if (dept === 'product' && m >= 26 && rnd() < 0.3) return 'total';
  if (['eng', 'finops'].includes(dept) && rnd() < 0.3) return 'platform';
  return 'chat';
};
const personFor = (/** @type {number} */ m, /** @type {string} */ dept) => {
  const people = PEOPLE.filter((p) => p.from <= m && (p.dept === dept || (dept === 'founders')));
  const agents = AGENTS.filter((a) => a.from <= m && a.dept === dept);
  const agentShare = dept === 'eng' ? Math.min(0.62, (m - 14) * 0.05) : dept === 'support' ? Math.min(0.7, (m - 17) * 0.06) : dept === 'finops' ? 0.45 : dept === 'product' ? 0.3 : 0;
  if (agents.length && rnd() < agentShare) return pick(agents);
  if (people.length) return pick(people);
  return m < 8 ? pick(PEOPLE.slice(0, 2)) : PEOPLE[0];
};

for (let m = 0; m < 36; m += 1 / 4.3) {
  const week = m;
  for (const dept of deptAt(Math.floor(week))) {
    const head = PEOPLE.filter((p) => p.from <= week && (p.dept === dept || (dept === 'founders' && p.role.includes('founder')))).length + AGENTS.filter((a) => a.from <= week && a.dept === dept).length * 1.6;
    const perWeek = Math.max(0.6, head * 0.9) * (dept === 'eng' ? 1.8 : 1);
    const n = Math.floor(perWeek) + (rnd() < perWeek % 1 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const born = month(week) + rnd() * 7 * DAY;
      const prod = productFor(week, dept);
      const proj = projectFor(week, dept, prod);
      const who = personFor(week, dept);
      const size = Math.min(5, Math.max(1, Math.round(between(0.6, 3.6) + (dept === 'eng' ? 0.8 : 0))));
      const lead = between(0.3, 6) * DAY;
      const dur = (size * between(1.2, 3.2) + (who.rate < 100 ? -size * 0.6 : 0)) * DAY;
      const st = [[born, 'todo']];
      let t = born + lead;
      const crisisHit = week >= CRISIS.from && week < CRISIS.to && ['eng', 'support'].includes(dept) && rnd() < 0.55;
      const blocked = crisisHit || rnd() < 0.07;
      const dropped = !crisisHit && rnd() < 0.035;
      st.push([t, 'doing']);
      if (blocked) {
        const tb = t + dur * between(0.2, 0.6);
        st.push([tb, 'blocked']);
        t = crisisHit ? month(CRISIS.to) + between(0, 4) * DAY : tb + between(2, 12) * DAY;
        st.push([t, 'doing']);
      }
      if (dropped) { st.push([t + dur * 0.4, 'dropped']); }
      else {
        t += dur;
        if (size >= 3) { st.push([t, 'review']); t += between(0.5, 3) * DAY; }
        st.push([t, 'done']);
      }
      const name = `${pick(VERBS[dept])} ${pick(NOUNS[dept])}`;
      items.push({
        id: idFor(dept), n: name, k: rnd() < 0.08 ? 'chore' : 'task', s: size, f: pick(FACADE[dept]),
        b: born, g: { dept, proj, prod, people: who.id }, st, dep: [], dec: null, rooms: size + 2,
        owner: who.name, agent: who.rate < 100 || undefined, rate: who.rate, _week: week,
      });
    }
  }
}
// the crisis: everything in Engineering and Support that was in progress when the dispatcher fell over stops for its duration
const CF = month(CRISIS.from), CT = month(CRISIS.to);
for (const it of items) {
  if (!['eng', 'support', 'product'].includes(it.g.dept)) continue;
  const i = it.st.findIndex((s, k) => s[1] === 'doing' && s[0] < CT && (k + 1 >= it.st.length || it.st[k + 1][0] > CF));
  if (i < 0 || it.st.some((s) => s[1] === 'blocked')) continue;
  if (rnd() > 0.8) continue;
  const tb = Math.max(it.st[i][0] + 1, CF + rnd() * 2 * DAY);
  const resume = CT + rnd() * 6 * DAY;
  const shift = resume - tb;
  const head = it.st.slice(0, i + 1).filter((s) => s[0] < tb);
  const tail = it.st.slice(i + 1).map(([t, st]) => [t + shift, st]);
  it.st = [...head, [tb, 'blocked'], [resume, 'doing'], ...tail];
}
items.sort((a, b) => a.b - b.b);
// everything after "now" is the forecast: planned work; its statuses beyond now are the forecast, not history
for (const it of items) if (it.b > NOW) it.forecast = true;

// districts: by project phase inside dept; by dept inside proj; by dept inside prod; by project inside people
const DNAME = (/** @type {string} */ k) => (PROJ[k] || DEPT[k] || PROD[k] || { name: k }).name;
for (const it of items) {
  it.d = { dept: `${it.g.dept}:${it.g.proj}`, proj: `${it.g.proj}:${it.g.dept}`, prod: `${it.g.prod}:${it.g.dept}`, people: `${it.g.people}:${it.g.proj}` };
}
// Lucid Total secedes in the product lens: before month 28 it lives inside Platform as the Internal tools district
const SECEDE_T = month(28.0);
for (const it of items) {
  if (it.g.prod === 'total' && it.b < SECEDE_T) {
    it.g0 = { prod: 'platform' };
    it.d0 = { prod: 'platform:internal-tools' };
    it.moves = [{ t: SECEDE_T, lens: 'prod', g: 'total', d: it.d.prod }];
    it.g.prod = 'platform'; it.d.prod = 'platform:internal-tools';
  }
}
// dependencies: within the district, and some across lands
const byDistrict = new Map();
for (const it of items) { const k = it.d.dept; if (!byDistrict.has(k)) byDistrict.set(k, []); byDistrict.get(k).push(it); }
for (const list of byDistrict.values()) {
  for (let i = 1; i < list.length; i++) {
    if (rnd() < 0.28) list[i].dep.push(list[i - Math.min(i, 1 + Math.floor(rnd() * 4))].id);
  }
}
for (let i = 40; i < items.length; i++) {
  if (rnd() < 0.06) {
    const j = i - 1 - Math.floor(rnd() * 40);
    if (items[j].g.dept !== items[i].g.dept) items[i].dep.push(items[j].id);
  }
}
// decisions: each spawns the next items of its departments in the following weeks
const decisions = DECISIONS.map(([m, title, who, depts], i) => {
  const b = month(/** @type {number} */ (m));
  const spawned = items.filter((it) => !it.dec && depts.includes(it.g.dept) && it.b > b && it.b < b + 35 * DAY).slice(0, 4 + Math.floor(rnd() * 8));
  for (const it of spawned) it.dec = `D${i + 1}`;
  const t = String(title);
  const prod = /Total|operating system|internal tools|living map/i.test(t) ? 'total' : /Teams|business line|seat/i.test(t) ? 'teams' : /Railway|gateway|model|Fable|machines|SOC/i.test(t) ? 'platform' : 'chat';
  const proj = Object.entries(PROJ).find(([k, p]) => !['total', 'teams', 'run'].includes(k) && p.from <= m && p.to > m);
  return { id: `D${i + 1}`, n: t, b, who, refs: spawned.map((s) => s.id), home: { dept: depts[0], proj: prod === 'total' ? 'total' : prod === 'teams' ? 'teams' : proj ? proj[0] : 'run', prod, people: who === 'owner' ? 'yossi' : 'noa' } };
});
const milestones = MILESTONES.map(([m, n, proj, prod]) => ({ t: month(/** @type {number} */ (m)), n, land: { proj, prod, dept: prod === 'teams' ? 'sales' : 'eng' } }));
// people as a dataset table (for the people lens' land identities)
const people = [...PEOPLE, ...AGENTS].map((p) => ({ id: p.id, name: p.name, role: p.role, dept: p.dept, from: month(p.from), agent: p.rate < 100 && p.rate > 0 ? true : undefined }));
// revenue by product per month (after launch), in the company's currency
const revenue = [];
for (let m = 18; m < 36; m++) {
  const chat = 4200 * Math.pow(1.17, m - 18);
  revenue.push({ t: month(m + 0.5), prod: 'chat', amount: Math.round(chat) });
  if (m >= 34.5) revenue.push({ t: month(m + 0.5), prod: 'teams', amount: Math.round(9000 * (m - 34)) });
}

const lenses = {
  dept: { name: 'Departments', lands: DEPT, districtName: (/** @type {string} */ k) => DNAME(k.split(':')[1]), spacing: 21 },
  proj: { name: 'Projects', lands: PROJ, districtName: (k) => DNAME(k.split(':')[1]), spacing: 21 },
  prod: { name: 'Products', lands: PROD, districtName: (k) => k.endsWith('internal-tools') ? 'Internal tools' : DNAME(k.split(':')[1]), spacing: 24 },
  people: { name: 'People', lands: Object.fromEntries(people.map((p) => [p.id, { name: p.name, sub: p.role, glyph: p.agent ? 'bot' : 'user', hue: p.agent ? 'ai' : (DEPT[p.dept] || DEPT.eng).hue, lm: p.agent ? 'gears' : 'house', from: p.from }])), districtName: (k) => DNAME(k.split(':')[1]), spacing: 16 },
};
const districts = {};
for (const [lk, l] of Object.entries(lenses)) {
  districts[lk] = {};
  for (const it of items) for (const d of [it.d[lk], it.d0 && it.d0[lk]]) if (d && !districts[lk][d]) districts[lk][d] = { name: l.districtName(d) };
  for (const mv of items.flatMap((it) => it.moves || [])) if (mv.lens === lk && !districts[lk][mv.d]) districts[lk][mv.d] = { name: l.districtName(mv.d) };
}
const out = {
  key: 'example', name: 'Example company', sub: 'Generated: three years of a company that builds Lucid Chat, grows departments, spins Lucid Total out of Engineering and launches Teams. No real people, no real money.',
  span: [T0, T1], now: NOW, synthetic: ['everything'],
  lenses: Object.fromEntries(Object.entries(lenses).map(([k, l]) => [k, { name: l.name, spacing: l.spacing, lands: Object.fromEntries(Object.entries(l.lands).map(([lk, ld]) => [lk, { name: ld.name, sub: ld.sub, glyph: ld.glyph, hue: ld.hue, lm: ld.lm, from: typeof ld.from === 'number' && ld.from < 1000 ? month(ld.from) : ld.from }])) }])),
  districts,
  items: items.map(({ _week, rate, ...it }) => ({ ...it, cost: rate ? Math.round(rate) : 0 })),
  decisions, milestones, people, revenue,
  secession: { lens: 'prod', t: SECEDE_T, from: 'platform', to: 'total', name: 'Lucid Total becomes its own land' },
  crisis: { from: month(CRISIS.from), to: month(CRISIS.to), name: 'The dispatcher outage' },
};
process.stderr.write(`${items.length} items, ${decisions.length} decisions, ${milestones.length} milestones\n`);
process.stdout.write(JSON.stringify(out));
