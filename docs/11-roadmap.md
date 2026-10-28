# Lucid Total — Roadmap

> Phases, gates and the order of building. The first goal is to run Lucid Chat's development on Lucid Total; the second is to run the whole company; the third is to make it a product. Each phase ends with a gate the owner accepts from a gate report generated inside Lucid Total.
>
> **Created:** 2026-10-28 · **Status:** v1 draft. Durations are estimates at the current pace (the lead orchestrating Opus workers, four to six in parallel); they are inputs to the first what-if, not promises.

---

## Phase 0 · Bootstrap: the board that replaces the checklist (about 3 weeks)

**Goal:** the coordinator and the owner run Lucid Chat's development on Lucid Total; the checklist is frozen.

- Repository tooling (pnpm, TypeScript 6, Vitest, Playwright, ESLint with the content and adapter rules, hooks); Railway project with `dev` (Postgres, bucket, one `ROLE=all` service); environments runbook.
- `packages/model` (items, groupings, relations, comments, evidence, criteria, people, agents, settings, events, outbox) and migrations; `packages/actions` with the registry, preview/apply/undo and the first thirty actions; `packages/events`; the parity suite skeleton.
- Web app shell with Lucid Glass (Deep Blue, Sky Glass; high contrast variant), the dock (Horizon · World · Me · Talk · More) and the phone dock; the Stage with the first hand-built scenes: the Horizon (needs-you cards, goal rings, "since you last looked"), the product view (product large, expected vs actual compared, done rule, criteria ring, talk, roads, implications when done), the Fork v0 (paths with the change set drawn as a ripple); the instruments board (cards and lines), list/table and the inbox under More; Talk as the command bar; English and Hebrew. The attention budget validator runs on every scene from the first build.
- Bootstrap identity (owner secret, service accounts); rights model v1; audit.
- The coordinator CLI and protocol (working lines, items, evidence, follow-ups); the importer run against Lucid Chat with the evaluation pass; "to verify" items created.
- Asks v0: raise from the command bar, the chat or the inbox; route to the owner or lead; decide (task · no action · more); the asker sees the state. Company scale `founders` defaults.
- Chat v0: threads, streaming, read tools, the first write tools with preview/confirm/undo, model class choice (standard/strongest; Fable behind the owner's switch), citations to items and decisions; retrieval over items, comments and decisions (BM25 first, dense when the local encoder lands).
- **Gate 0:** the owner reads the morning state on the phone and the desktop; the coordinator has run two waves entirely through Lucid Total; the import's evaluation report is accepted; parity suite green for the registered actions; walkthroughs for the Phase 0 flows attached.

## Phase 1 · The AI runs the operation (about 4 weeks)

- The scene grammar v1 (`packages/scene`): component catalogue (world, measure, compare, time, people, product, narrative, action families), schemas, renderers for desktop, phone and image, the validator (schema, data re-read, staleness, attention budget, rights and compartments), the composer in the chat and on the Stage; aspects Delivery and System health; the place model with identity (name, subject, glyph, hue, landmark library, stable position).
- Self-observation (`docs/14` §2): the System place and its sub-places, monitors, health roll-up, the system filing its own issues and incidents; the process table for agents with model class, cost and age; run records with validation steps.
- Channels (`docs/15`): email reply-to-decide and reply-to-comment with signed tokens; the Lucid Chat bot with forks and glances as messages with reply options; per-person channel preference; dedupe across surfaces.
- Full action registry for the Phase 0 model; MCP server; REST spec published; webhooks.
- Retrieval over documents and code (repository snapshots, symbol-aware chunking, currency rule, promotion gate); query memory; the knowledge artefacts pipeline.
- Proactive agents: follow-up, briefing, evidence check, sweeper, deadline/SLA, decision ageing; playbooks as data; the autonomy dashboard (observe/suggest/confirm/inform/run) with measured acceptance.
- Notifications: inbox and toasts, cadence settings, email adapter (kill-switch, signed unsubscribe), the Lucid Chat channel (needs the bot identity in Lucid Chat).
- Envelopes (seal, deliver, reveal, rotate) for people and the coordinator; sensitivity levels and filters.
- Parties v1: the party model with engagements, **virtual mode** (correspondence on the company's behalf over email, threaded to party pages and items; the external-correspondence playbook at `suggest`), party pages, the asks router aggregating support issues into product asks.
- Google SSO (LT-0001); guests; templates (brief, walkthrough, gate report, incident, decision card, account chore); time tracking; Aqua Dusk.
- **Gate 1:** the owner's reminders and briefings arrive at their cadence; an API key has travelled to the coordinator by envelope; the evidence checker's agreement with human verdicts is measured and reported with cost; email and Lucid Chat channels verified end to end; parity 100 % of registered actions.

## Phase 2 · The world and decisions (about 6 weeks)

> The world is built to `docs/17` §6: its Phase 0 (plots, claiming, hulls, time derivation, the Departments lens, Progress and Pipes) lands inside this phase's first two weeks with the simulation in `docs/04-mocks/living-map/` as the reference; its Phases 1–2 (lenses with the walk, the rail and playback, tracing, cutaways, secession Forks, Refocus on the map) fill the rest.

- The world: places with landmarks, sub-maps that reveal on zoom, buildings with facades (expected ghost, actual, criteria ring), skylines, light, heat, weather, roads, flags, presence, embassies; stable layouts; perspectives (role templates, switching); the Table (meeting mode); layers incl. the Trust map; the list equivalent; the phone world (one place at a time).
- Decisions as change sets; the propagation engine with explanations; the Fork with drawn consequences and futures; Refocus (effort moved between places, live re-forecast, transparency strip); the priority model with factors and overrides; reversal; predicted vs actual on the decision page.
- Infographics (composer, narrative spine, render to image, compartment-safe sharing); the remaining aspects (Customers, Money, People, Risk, Market, AI operations).
- Self-repair: one class of repair (flaky test or scene component bug) end to end at `inform` with evidence; Slack as the first messaging adapter (`docs/15`).
- Timeline layer and view; dependency graph; workload signals (respectful rules); capacity inputs.
- Issues and incidents: intake (Lucid Chat reports, email, form, API), triage agent, SLA timers, customer notices; GitHub and Railway connectors.
- Parties v2: **direct mode** and the external view with compartments (contractor, supplier, customer-organisation templates), magic-link sign-in, materialisation of a virtual party, embassies on the map, automatic revocation at engagement end; the cross-compartment suite; the security gate before the first external is admitted.
- **Gate 2:** "focus on Europe" run in Refocus, applied, then reverted, in a walkthrough on desktop and phone; the CMO and CTO perspectives of the same world shown to the owner; a meeting run at the Table with decisions landing; the predicted vs actual view exists for the first applied change set; one infographic produced by a sentence in Talk; one self-repair completed with its evidence; every scene in the walkthrough passes the attention test (`docs/13` §14).

## Phase 3 · Company-wide (about 4 weeks)

- Goals with contribution links and forecasts; budgets with actuals; accounts and renewals; risks as weather; lessons and retrospectives; recurrence.
- Knowledge from resolutions; search across everything with saved views; exports (JSON, Markdown) daily; guest access hardened.
- Autonomy raised where measured: briefings and follow-ups at `run`, triage at `confirm`; the playbook quality record drives the recommendations.
- Payroll-class data: the `payroll` sensitivity class with field-level encryption, read audit, the integrity-chained audit log; People and Finance compartments; the board compartment; the pen-test gate before the first payroll or board use.
- Company scale model: the scale watcher, the "shape of the company" view, scale change as a decision with preview; the complexity metrics of the Lucid Total program.
- Multi-tenant readiness: cross-tenant suite, tenant settings isolation, a second tenant created in `staging`.
- **Gate 3:** every Lucid domain has its items, goals and owner in Lucid Total; the owner's inbox holds only material decisions for a month; the autonomy dashboard shows measured levels; the export restores into a fresh instance in a drill.

## Phase 4 · Product

Second company, billing, deeper connectors (calendar, channels, CRM, accounting), Lucid Total surfaces inside Lucid Chat, a public integration guide, security review and pen-test, the brand and the site.

## Cross-cutting from day one

Walkthroughs on desktop and phone, RTL, accessibility; parity suite; quality with cost; Railway-first; adapters; current majors; docs in the same change; Lucid Total tracks its own build from Gate 0 on (dogfooding).

## First tracked tasks (seeded at bootstrap)

`LT-0001` Google SSO · `LT-0002` Bot identity for Lucid Total in Lucid Chat (a Lucid Chat task, linked) · `LT-0003` Email adapter and the belucid.chat sending domain · `LT-0004` Railway project `lucid-total` with `dev` · `LT-0005` The importer's "to verify" review wave · `LT-0006` Owner decision: Fable data-retention terms for Lucid Total (material) · `LT-0007` Owner decision: default AI budget per month (material) · `LT-0008` The coordinator's envelope key and first envelope drill · `LT-0009` Asks v0 · `LT-0010` Party model and virtual correspondence · `LT-0011` Security gate: cross-compartment suite and field-level encryption design review before the first external.
