# CLAUDE.md — Lucid Total

Lucid Total is the **operating system of an AI-run company**: one model of everything the company intends, does, decides and learns; a zoomable map; an embedded AI that knows all of it, answers, acts within explicit rights and autonomy levels, and runs the company's processes. Its first tenant is Lucid itself (the development of Lucid Chat moves onto it). Separate repository and folder from Lucid Chat (`~/Projects/lucid/lucid`); shares its design language and working rules, never its code paths.

## Read first

1. `docs/00-system-definition.md` — the root definition. Binding.
2. `docs/13-experience.md` — **binding interface doctrine** (attention budget, the Stage, places with identity, products as facades, forks and Refocus, aspects, the phone); then `docs/01-use-cases.md`, `docs/02-product-plan.md`, `docs/03-map-and-views.md`, `docs/04-mocks/` (v0.2; v0.1 archived).
3. `docs/05-architecture.md`, `docs/06-ai-architecture.md`, `docs/07-security-and-secrets.md`, `docs/08-integrations-and-api.md`, `docs/14-self-operation-and-ai-orchestration.md` (the system as an operating system: self-observation, self-repair, AI process orchestration, model tiers, autonomy maturity, Claude Code integration), `docs/15-presence-and-channels.md` (Lucid Chat, email, Slack and other messaging, voice).
4. `docs/09-testing-and-quality.md` (Definition of Done, walkthroughs, parity, evals), `docs/10-migration-and-operating-model.md`, `docs/11-roadmap.md`, `docs/12-decision-log.md` (append every owner instruction and lead decision; entries `T<n>`).
5. `docs/research/appfront-ai-platform-lessons.md` — mechanisms we learned from (never copy code).

Memory for this project lives with Lucid Chat's memory directory (`~/.claude/projects/-Users-yossinaar-Projects-lucid-lucid/memory/`) until this repository has its own.

## Critical mechanisms (do not break)

- **One model, many views.** Items, groupings, relations, people, decisions, evidence in one schema; views hold only layout preferences.
- **AI parity by construction.** Every capability is a registered action with a permission class, rights, preview, apply and undo; chat tools, REST, MCP and UI menus are generated from the registry; the parity suite must stay green. Read tools run during a run; consequential actions only through preview → confirm → apply (hash-bound).
- **Rights and autonomy are enforced in the action layer**, never by the prompt or the UI alone; agents act on behalf of a person within that person's rights; irreversible actions confirm; outbound channels are off until enabled, each with a kill-switch.
- **Envelopes are ciphertext end to end.** Secrets are sealed in the browser to recipients' keys; the server, logs, index and models never see plaintext; `restricted` items never reach prompts or logs.
- **Asks route to the responsible.** Anyone (staff, parties, support aggregation) can raise an ask; routing rules give it an owner at once; the asker always sees the outcome.
- **Compartments for parties.** Externals are parties with engagements and compartments (direct · virtual · system modes, one identity); compartments are enforced at the data layer and in retrieval and tool rights; engagement end revokes access. Payroll-class fields are field-level encrypted, read-audited and never reach an index, a log or a model.
- **Company scale** sets defaults (zoom, structure, agents, cadences, thresholds); the system proposes a scale change, the owner decides with a preview.
- **Expectation beside result** on every card; evidence attached; the AI's evidence check proposes, a human verdict decides.
- **Quiet reporting.** Working lines on start, meaningful change and finish; findings deduped and delivered at the reader's cadence; the owner's inbox holds material decisions only, one at a time (L425).
- **Model agnosticism.** All calls through `packages/ai-gateway`; model classes in configuration; no provider SDK outside adapters; no model name in product code.
- **Lucid Glass, visual first, web management controls**, desktop and phone, LTR and RTL, WCAG 2.2 AA.
- **Inherited rules:** Railway-first; adapters for every external; current, best-supported majors only (TypeScript 6, Node 22 LTS); no Docker on the development machine; verification local at every merge, Railway `ci` as the nightly backstop, no GitHub Actions; the lead orchestrates and reviews, Opus 5.5 workers build, Fable for core and security work, never Sonnet.

## Repo layout (planned; `docs/05` §11)

`apps/web`, `apps/server` (roles api · ai · worker · all), `packages/{model,actions,policy,propagation,scene,knowledge,ai-gateway,agents,events,adapters,ui,i18n,observability}`, `tools/import`, `tests/{e2e,parity,evals,load,security}`, `infra/railway`, `docs/`.

## How we work

Define → use cases → product → views → mocks → architecture → testing plan → migration → roadmap → implement. Docs change in the same pull request as the code. Every user-facing change is walked through in a real browser at desktop and phone widths with screenshots attached to its card. Only material decisions go to the owner, one at a time, with context and cost in plain words.
