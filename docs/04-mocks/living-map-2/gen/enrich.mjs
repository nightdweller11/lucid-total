// @ts-check
/**
 * The second pass adds to both datasets what the first lacked (T35):
 *   - projects: the divisible level above a task; a task can belong to several projects (phase × workstream, and the
 *     project a decision opened); subtasks carry `parent`;
 *   - asks: open questions and decisions that wait for someone (the "needs you" of the Now view);
 *   - policies: behavioural decisions on how things operate (not tasks); `docs/18-policies.md`.
 * Everything added here is marked in `ds.synthetic` where it is not real.
 */
const DAY = 86400e3;

/** @param {any} ds */
export function enrich(ds) {
  const byId = new Map(ds.items.map((/** @type {any} */ it) => [it.id, it]));
  // ---- parents (lucid: X-F3 is a follow-up of X; X-F3-CR1 of X-F3) ----
  for (const it of ds.items) {
    if (ds.key !== 'lucid') continue;
    const m = /^(.*)-(F\d+|CR\d+|[a-z]\d*)$/i.exec(it.id);
    if (m && byId.has(m[1])) it.parent = m[1];
  }
  // ---- example: some larger tasks were divided into smaller ones (generated; a quarter of the size-4+ work) ----
  if (ds.key === 'example') {
    let seed = 7;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const kids = [];
    for (const it of ds.items) {
      if (it.s < 4 || rnd() > 0.28 || it.forecast) continue;
      const n = 2 + Math.floor(rnd() * 2);
      const doing = it.st.find((/** @type {any} */ s) => s[1] === 'doing'), done = it.st.find((/** @type {any} */ s) => s[1] === 'done');
      if (!doing) continue;
      const t0 = doing[0], t1 = done ? done[0] : it.st[it.st.length - 1][0] + 5 * DAY;
      const parts = ['Design', 'Build', 'Test', 'Document', 'Review'];
      for (let i = 0; i < n; i++) {
        const b = t0 + ((t1 - t0) * i) / (n + 0.5) + rnd() * DAY;
        const e = Math.min(t1 - 1000, b + ((t1 - t0) / n) * (0.6 + rnd() * 0.5));
        const st = [[b, 'todo'], [b + (e - b) * 0.2, 'doing']];
        if (done || e < ds.now) st.push([e, 'done']);
        kids.push({ ...it, id: `${it.id}.${i + 1}`, n: `${parts[i]} ${it.n.replace(/^[A-Z][a-z-]+ /, '')}`, s: 1 + Math.floor(rnd() * 2), b, st, dep: i ? [`${it.id}.${i}`] : [], parent: it.id, rooms: 3, moves: undefined, g0: undefined, d0: undefined });
      }
    }
    for (const k of kids) { ds.items.push(k); byId.set(k.id, k); }
    ds.items.sort((/** @type {any} */ a, /** @type {any} */ b) => a.b - b.b);
    // the children live where their parent lives, in every lens, and move with it
    for (const k of kids) { const p = byId.get(k.parent); k.g = { ...p.g }; k.d = { ...p.d }; if (p.g0) k.g0 = { ...p.g0 }; if (p.d0) k.d0 = { ...p.d0 }; if (p.moves) k.moves = p.moves.map((/** @type {any} */ m) => ({ ...m })); }
  }
  // ---- lucid: districts are the phases inside a workstream (not one per root row), so the area level has territories ----
  if (ds.key === 'lucid') {
    const PH = ds.lenses.proj.lands;
    const dn = (/** @type {string} */ lens, /** @type {string} */ k) => (ds.lenses[lens].lands[k] ? ds.lenses[lens].lands[k].name : k);
    for (const it of ds.items) it.d = { dept: `${it.g.dept}:${it.g.proj}`, proj: `${it.g.proj}:${it.g.dept}`, prod: `${it.g.prod}:${it.g.proj}`, people: `${it.g.people}:${it.g.proj}` };
    ds.districts = { dept: {}, proj: {}, prod: {}, people: {} };
    for (const it of ds.items) {
      ds.districts.dept[it.d.dept] = { name: PH[it.g.proj] ? PH[it.g.proj].name : it.g.proj };
      ds.districts.proj[it.d.proj] = { name: dn('dept', it.g.dept) };
      ds.districts.prod[it.d.prod] = { name: PH[it.g.proj] ? PH[it.g.proj].name : it.g.proj };
      ds.districts.people[it.d.people] = { name: PH[it.g.proj] ? PH[it.g.proj].name : it.g.proj };
    }
  }
  for (const it of ds.items) { it.children = []; }
  for (const it of ds.items) if (it.parent && byId.has(it.parent)) byId.get(it.parent).children.push(it.id);

  // ---- projects ----
  /** @type {any[]} */
  const projects = [];
  const add = (/** @type {any} */ p) => { if (p.items.length) projects.push(p); return p; };
  const lead = (/** @type {any[]} */ items) => { const c = new Map(); for (const it of items) c.set(it.owner, (c.get(it.owner) || 0) + 1); return [...c.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || ''; };
  const mk = (/** @type {string} */ id, /** @type {string} */ n, /** @type {string} */ goal, /** @type {any[]} */ items, /** @type {any} */ extra = {}) => add({ id, n, goal, items: items.map((i) => i.id), b: Math.min(...items.map((i) => i.b)), lead: lead(items), ...extra });
  if (ds.key === 'lucid') {
    const WS = { A: 'Platform and tooling', B: 'Server core', C: 'Messaging and sync', D: 'AI and mediation', E1: 'Mobile app', E2: 'Design system', F: 'Admin console', G: 'Quality and load', H: 'Docs and process' };
    const fam = new Map();
    for (const it of ds.items) { const r = it.id.replace(/(-(F\d+|CR\d+|[a-z]\d*))+$/i, ''); const key = /^(P[0-4]-[A-Z]\d?|CT|ENV(-[A-Z]+)?|MOCKS|EXPLORATORY|L\d+)/.exec(r)?.[1] || r.split('-')[0]; if (!fam.has(key)) fam.set(key, []); fam.get(key).push(it); }
    const decTitle = (/** @type {string} */ id) => { const d = ds.decisions.find((/** @type {any} */ x) => x.id === id); return d ? d.n.replace(/\*\*/g, '').split(/[.:;(]/)[0].trim().slice(0, 60) : id; };
    for (const [key, items] of fam) {
      if (items.length < 4) continue;
      let n = key, goal = '', kind = 'project', dec = null;
      const pm = /^P([0-4])-([A-Z]\d?)$/.exec(key);
      const pp = /^P([0-4])$/.exec(key); if (pp) { n = `Phase ${pp[1]}`; goal = `The rows filed under phase ${pp[1]} without a workstream prefix.`; }
      if (pm) { n = `Phase ${pm[1]} · ${WS[pm[2]] || pm[2]}`; goal = `The phase-${pm[1]} rows of workstream ${pm[2]}, ${WS[pm[2]] ? WS[pm[2]].toLowerCase() : ''}: done when its acceptance gate passes.`; }
      else if (key === 'CT') { n = 'Contracts sprint'; goal = 'Every cross-workstream contract fixed before the phases build on them.'; }
      else if (/^ENV/.test(key)) { n = key === 'ENV' ? 'Development environment' : 'GitHub and repository hygiene'; goal = 'A working, documented environment for every agent and the lead.'; }
      else if (key === 'MOCKS') { n = 'Mocks and theming'; goal = 'The design reference every screen is built from.'; }
      else if (key === 'EXPLORATORY') { n = 'Exploratory passes'; goal = 'Find what the automated tests do not.'; }
      else if (/^L\d+/.test(key)) { n = decTitle(key); goal = `Everything that followed the decision ${key}.`; kind = 'decision'; dec = key; }
      mk(key, n, goal, items, { kind, dec });
    }
    // many-to-many: a decision's follow-up also belongs to the phase project of its workstream
    for (const it of ds.items) { const r = it.id.replace(/(-(F\d+|CR\d+|[a-z]\d*))+$/i, ''); if (/^L\d+/.test(r)) { const P = projects.find((p) => p.id === `${it.g.proj}-${it.g.dept}`); if (P && !P.items.includes(it.id)) P.items.push(it.id); } }
  } else {
    for (const [key, L] of Object.entries(ds.lenses.proj.lands)) { const items = ds.items.filter((/** @type {any} */ it) => (it.g.proj === key)); if (items.length) mk(key, /** @type {any} */ (L).name, /** @type {any} */ (L).sub || '', items, { kind: 'project', land: key }); }
    for (const d of ds.decisions) { if (d.who !== 'owner' || d.refs.length < 5) continue; const items = d.refs.map((/** @type {string} */ id) => byId.get(id)).filter(Boolean); mk(`P-${d.id}`, d.n, `What the decision "${d.n}" set in motion.`, items, { kind: 'decision', dec: d.id }); }
  }
  for (const it of ds.items) it.projects = [];
  for (const p of projects) for (const id of p.items) { const it = byId.get(id); if (it) it.projects.push(p.id); }
  // a child inherits its parent's projects
  for (const it of ds.items) if (it.parent && byId.has(it.parent)) for (const pid of byId.get(it.parent).projects) if (!it.projects.includes(pid)) { it.projects.push(pid); projects.find((p) => p.id === pid).items.push(it.id); }
  ds.projects = projects;

  // ---- asks: what waits for a decision or an answer (open at `now`) ----
  /** @type {any[]} */
  const asks = [];
  const now = ds.now;
  const stateNow = (/** @type {any} */ it) => it.st.filter((/** @type {any} */ s) => s[0] <= now).slice(-1)[0];
  if (ds.key === 'lucid') {
    // synthetic, derived from the real log: what is in review or blocked at the end of the extract waits for someone
    const review = ds.items.filter((it) => { const s = stateNow(it); return s && s[1] === 'review'; }).sort((a, b) => b.s - a.s || b.b - a.b).slice(0, 5);
    for (const it of review) asks.push({ id: `A-${it.id}`, n: `Approve: ${it.n.slice(0, 70)}`, b: stateNow(it)[0], to: 'owner', by: it.owner, it: it.id, kind: 'approve', open: true });
    const blocked = ds.items.filter((it) => { const s = stateNow(it); return s && s[1] === 'blocked'; }).slice(0, 4);
    for (const it of blocked) asks.push({ id: `A-${it.id}`, n: `Unblock: ${it.n.slice(0, 70)}`, b: stateNow(it)[0], to: 'lead', by: it.owner, it: it.id, kind: 'unblock', open: true });
    // the real open questions of the log's last days: owner decisions in the final review window are still fresh
    for (const d of ds.decisions.filter((d) => d.who === 'owner' && d.b > now - 2 * DAY).slice(-4)) asks.push({ id: `A-${d.id}`, n: d.n.replace(/\*\*/g, '').slice(0, 90), b: d.b, to: 'lead', by: 'owner', dec: d.id, kind: 'instruction', open: true });
    ds.synthetic.push('asks (derived from review and blocked states)');
  } else {
    const M = (/** @type {number} */ d) => now - d * DAY;
    const pick = (/** @type {RegExp} */ re) => ds.items.filter((it) => re.test(it.n) && it.b < now).slice(-3).map((it) => it.id);
    const list = [
      ['Teams pricing: per seat, or per organisation?', 1.5, 'owner', 'Omri', 'decide', pick(/pricing|seat/i)],
      ['A fourth engineer, or more agent crews for Lucid Total?', 3, 'owner', 'Noa', 'decide', pick(/living map|scene|Total/i)],
      ['SOC 2 auditor: the two shortlisted firms', 6, 'owner', 'Eitan', 'decide', pick(/SOC|audit/i)],
      ['Approve the Teams launch page copy', 0.8, 'owner', 'Maya', 'approve', pick(/Teams page|launch post/i)],
      ['Europe residency: Frankfurt alone, or Frankfurt and Paris?', 9, 'owner', 'Dana', 'decide', pick(/residency|Europe/i)],
      ['Pause the brand film until after the Teams launch?', 2.2, 'owner', 'Maya', 'decide', pick(/brand film/i)],
      ['Unblock: the German reseller contract waits on legal', 4, 'lead', 'Lior', 'unblock', pick(/reseller|contract/i)],
      ['Approve the k6 load profile for Teams', 1.1, 'lead', 'Ops agent', 'approve', pick(/k6|load/i)],
    ];
    list.forEach(([n, d, to, by, kind, refs], i) => asks.push({ id: `A${i + 1}`, n, b: M(/** @type {number} */ (d)), to, by, kind, refs, open: true }));
  }
  ds.asks = asks;


  // ---- artifacts: what each task makes, from its own words (the picture's kind and subject; T39) ----
  const F2A = { screens: 'screen', doc: 'doc', chart: 'chart', bars: 'chart', code: 'code', term: 'term', infra: 'infra', build: 'build', listing: 'listing', report: 'report', poster: 'listing', video: 'listing', account: 'screen', envelope: 'doc', trophy: 'build' };
  const RULES = /** @type {[RegExp, string][]} */ ([
    [/\b(runbook|checklist|rotate|rotation|token|licen[cs]e|install|hygiene|clean[- ]?up|chore|housekeeping)\b/i, 'check'],
    [/\b(mocks?|theme|theming|style guide|icons?|glyphs?|illustration|design language|tokens page)\b/i, 'design'],
    [/\b(tests?|e2e|walkthrough|load[- ]?test|k6|evals?|suite|playwright|maestro|smoke)\b/i, 'test'],
    [/\b(catalogue|catalog|matrix|table|sheet|roster|inventory|per vendor|per day|costs? dashboard|budget)\b/i, 'sheet'],
    [/\b(dashboards?|metrics?|slis?|slos?|alerts?|observab\w*|latency|throughput|cost)\b/i, 'chart'],
    [/\b(release|builds?|testflight|\.ipa|apk|store (submission|listing)|submission|eas)\b/i, 'build'],
    [/\b(landing|website|site|newsletter|press|campaign|launch page)\b/i, 'listing'],
    [/\b(screens?|ui|app|mobile|onboarding|chat|bubble|composer|settings|phone|android|ios)\b/i, 'screen'],
    [/\b(docs?|adr|plan|spec|narrative|readme|reports?|audit|compliance|consent|dpia|lia|privacy|terms|policy text|glossary)\b/i, 'doc'],
    [/\b(railway|deploy\w*|infra\w*|staging|ci|environment|docker|postgres|redis|nats|domain|dns|cert\w*|proxy|secrets?)\b/i, 'infra'],
    [/\b(api|endpoints?|protocol|schema|migration|migrate|resolver|dispatcher|server|worker|gateway|sync|crypto|kms|outbox|adapter|lint|typecheck)\b/i, 'code'],
  ]);
  const VERB = /^(build|write|fix|measure|ship|harden|refactor|instrument|load-test|migrate|wire( up)?|launch|review|answer|prioriti[sz]e|decide|renew|close|file|triage|hire|translate|follow up on|add|update|create|design|draft|define|run|set up|implement|extend|document|prepare|test|verify|approve|unblock|merge|publish|record|rebuild|redraw|propose|escalate|provision|roll out|extract|evaluate|assess|audit|check|handle|investigate|diagnose|resolve|remove|replace|rename|move|split|introduce|enable|disable|configure|automate|generate|validate|confirm|align|clarify|describe|explain|list|map|plan|schedule|script|seed|stabili[sz]e|tune|upgrade|bump|pin|port|package|wrap|redo|make|keep|stop|start|finish|complete|re-?run|re-?check|wave \d+[a-z]?:?)\s+(the\s+|a\s+|an\s+|its\s+|our\s+)?/i;
  const cap = (/** @type {string} */ x) => (x ? x[0].toUpperCase() + x.slice(1) : x);
  for (const it of ds.items) {
    let n = String(it.n || '');
    // the real log's rows often open with the workstream code ("E1 / ui: …", "H with the lead: …"): the subject is what follows
    { const m = /^([A-H][12]?|lead|owner|ui|docs)(\s*[\/·+,&]\s*([A-H][12]?|lead|owner|ui|docs|the lead))*(\s+with the lead)?\s*[:—–-]\s*/i.exec(n); if (m) n = n.slice(m[0].length); }
    const head = n.split(/[:(—–]|,\s|\s-\s/)[0].trim();
    const rest = n.slice(head.length).replace(/^[:(—–,\s]+/, '').replace(/[)]+$/, '').trim();
    const sub = cap(head.replace(VERB, '').trim()) || head;
    let kind = F2A[it.f] || 'doc';
    if (it.k === 'decision') kind = 'decision'; else if (it.k === 'policy') kind = 'policy';
    else if (ds.key === 'lucid' || it.k === 'chore') { for (const [re, k] of RULES) if (re.test(n)) { kind = k; break; } }
    it.a = { kind, sub: sub.length > 34 ? sub.slice(0, 33).trimEnd() + '…' : sub, line: rest.length > 48 ? rest.slice(0, 47).trimEnd() + '…' : rest };
  }

  // ---- policies: behavioural decisions on how things operate (docs/18) ----
  ds.policies = ds.key === 'lucid' ? [
    { id: 'POL-1', n: 'Every feature is walked through in the real interface before it is done', body: 'On the iOS simulator, the Android emulator and a real browser: every control clicked, every behaviour simulated, evidence attached. Not done without the walkthrough.', scope: 'development', applies: ['people', 'ai'], since: Date.parse('2026-10-19'), by: 'owner', enforce: 'gate', ref: 'docs/14 §5' },
    { id: 'POL-2', n: 'No Docker on the development machine', body: 'Backing services run on the Railway dev stack; Compose is for CI only.', scope: 'development', applies: ['people', 'ai'], since: Date.parse('2026-10-19'), by: 'owner', enforce: 'gate', ref: 'L59' },
    { id: 'POL-3', n: 'Workers run on strong models only; never a small model for builds', body: 'Opus for workers, Fable for security-sensitive and core work and for orchestration; a wave made on a small model is reviewed before it counts.', scope: 'ai', applies: ['ai'], since: Date.parse('2026-10-23'), by: 'owner', enforce: 'check', ref: 'L325, L363' },
    { id: 'POL-4', n: 'Verification is local at every merge; nothing waits on GitHub Actions', body: 'The whole test graph runs on the machine before a merge; the Railway ci chain is the nightly backstop; a push is a backup.', scope: 'development', applies: ['people', 'ai'], since: Date.parse('2026-10-27'), by: 'owner', enforce: 'gate', ref: 'L419, L483' },
    { id: 'POL-5', n: 'Only decisions with deep implications go to the owner, one at a time, with full context', body: 'Small or unclear things become platform-policy settings; very small ones the lead decides and records.', scope: 'company', applies: ['ai'], since: Date.parse('2026-10-24'), by: 'owner', enforce: 'reminder', ref: 'L425' },
    { id: 'POL-6', n: 'No message content in logs, metrics, traces or crash reports', body: 'Lint rules enforce it; nothing outside the sealed mediation service sees plaintext.', scope: 'development', applies: ['people', 'ai'], since: Date.parse('2026-10-18'), by: 'owner', enforce: 'gate', ref: 'docs/05' },
    { id: 'POL-7', n: 'Current, best-supported technology; nothing deprecated or end-of-life', body: 'Every dependency on a maintained current major; no early jump that breaks the packages we rely on.', scope: 'development', applies: ['people', 'ai'], since: Date.parse('2026-10-23'), by: 'owner', enforce: 'check', ref: 'L390, ADR-0020' },
    { id: 'POL-8', n: 'Railway first: no new external service without a written case', body: 'A new service needs a written case that it cannot be done well on Railway with good maintainability and recovery.', scope: 'company', applies: ['people', 'ai'], since: Date.parse('2026-10-24'), by: 'owner', enforce: 'gate', ref: 'L425' },
  ] : [
    { id: 'POL-1', n: 'Check with Noa before contacting investors', body: 'Any outreach to an investor, current or prospective, is agreed with Noa first.', scope: 'company', applies: ['people', 'ai'], since: Date.parse('2024-06-01'), by: 'owner', enforce: 'gate' },
    { id: 'POL-2', n: 'Every feature is walked through in the real app before it is done', body: 'Both phones and the browser, every control clicked, evidence attached.', scope: 'development', applies: ['people', 'ai'], since: Date.parse('2024-09-15'), by: 'owner', enforce: 'gate' },
    { id: 'POL-3', n: 'Agents never message a customer without a person reading first', body: 'Tier-one answers are drafted by the agent and sent by a person until the trust score allows otherwise.', scope: 'ai', applies: ['ai'], since: Date.parse('2025-07-01'), by: 'owner', enforce: 'gate' },
    { id: 'POL-4', n: 'Spend above the monthly model budget needs the owner', body: 'The ops agent pauses non-urgent runs when the budget is reached and asks.', scope: 'ai', applies: ['ai'], since: Date.parse('2025-11-01'), by: 'owner', enforce: 'gate' },
    { id: 'POL-5', n: 'Restricted and payroll data never reach a non-ZDR model', body: 'Whatever the model settings say.', scope: 'ai', applies: ['ai'], since: Date.parse('2025-03-01'), by: 'lead', enforce: 'gate' },
    { id: 'POL-6', n: 'Fail-closed conversations stay fail-closed', body: 'From the incident review of the dispatcher outage: no delivery path bypasses the mediator.', scope: 'development', applies: ['people', 'ai'], since: Date.parse('2025-12-01'), by: 'owner', enforce: 'gate' },
  ];
  ds.synthetic.push('subtasks (example only)');
  return ds;
}
