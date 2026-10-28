# Lucid Total — Roadmap

> Phases, gates and the order of building. The first goal is to run Lucid Chat's development on Lucid Total; the second is to run the whole company; the third is to make it a product. Each phase ends with a gate the owner accepts from a gate report generated inside Lucid Total.
>
> **Created:** 2026-10-28 · **Status:** v1 draft. Durations are estimates at the current pace (the lead orchestrating Opus workers, four to six in parallel); they are inputs to the first what-if, not promises.

---

## Phase 0 · Bootstrap: the board that replaces the checklist (about 3 weeks)

**Goal:** the coordinator and the owner run Lucid Chat's development on Lucid Total; the checklist is frozen.

- Repository tooling (pnpm, TypeScript 6, Vitest, Playwright, ESLint with the content and adapter rules, hooks); Railway project with `dev` (Postgres, bucket, one `ROLE=all` service); environments runbook.
- `packages/model` (items, groupings, relations, comments, evidence, criteria, people, agents, settings, events, outbox) and migrations; `packages/actions` with the registry, preview/apply/undo and the first thirty actions; `packages/events`; the parity suite skeleton.
- Web app shell with Lucid Glass (Deep Blue, Sky Glass; high contrast variant), the rail and the phone pill navigation; board with collapse-to-lines; list/table; item page with Expected vs Actual, comments and feedback requests, dependencies, history; inbox; agents live; command bar; English and Hebrew.
- Bootstrap identity (owner secret, service accounts); rights model v1; audit.
- The coordinator CLI and protocol (working lines, items, evidence, follow-ups); the importer run against Lucid Chat with the evaluation pass; "to verify" items created.
- Chat v0: threads, streaming, read tools, the first write tools with preview/confirm/undo, model class choice (standard/strongest; Fable behind the owner's switch), citations to items and decisions; retrieval over items, comments and decisions (BM25 first, dense when the local encoder lands).
- **Gate 0:** the owner reads the morning state on the phone and the desktop; the coordinator has run two waves entirely through Lucid Total; the import's evaluation report is accepted; parity suite green for the registered actions; walkthroughs for the Phase 0 flows attached.

## Phase 1 · The AI runs the operation (about 4 weeks)

- Full action registry for the Phase 0 model; MCP server; REST spec published; webhooks.
- Retrieval over documents and code (repository snapshots, symbol-aware chunking, currency rule, promotion gate); query memory; the knowledge artefacts pipeline.
- Proactive agents: follow-up, briefing, evidence check, sweeper, deadline/SLA, decision ageing; playbooks as data; the autonomy dashboard (observe/suggest/confirm/inform/run) with measured acceptance.
- Notifications: inbox and toasts, cadence settings, email adapter (kill-switch, signed unsubscribe), the Lucid Chat channel (needs the bot identity in Lucid Chat).
- Envelopes (seal, deliver, reveal, rotate) for people and the coordinator; sensitivity levels and filters.
- Google SSO (LT-0001); guests; templates (brief, walkthrough, gate report, incident, decision card, account chore); time tracking; Aqua Dusk.
- **Gate 1:** the owner's reminders and briefings arrive at their cadence; an API key has travelled to the coordinator by envelope; the evidence checker's agreement with human verdicts is measured and reported with cost; email and Lucid Chat channels verified end to end; parity 100 % of registered actions.

## Phase 2 · The map and decisions (about 5 weeks)

- The map: scene computation, stable layouts, hulls for overlaps, clusters, roads, flags, weather, presence; zoom Z0–Z3; perspectives (role templates, switching, meeting perspective); layers; the list equivalent; phone map.
- Decisions as change sets; the propagation engine with explanations; what-if drafts with ghosts; the priority model with factors and overrides; reversal.
- Timeline layer and view; dependency graph; workload signals (respectful rules); capacity inputs.
- Issues and incidents: intake (Lucid Chat reports, email, form, API), triage agent, SLA timers, customer notices; GitHub and Railway connectors.
- **Gate 2:** "focus on Europe" previewed and applied as a change set with its delta, then reverted, in a walkthrough; the CMO and CTO perspectives of the same company shown to the owner; a meeting run in meeting mode with decisions landing; the predicted vs actual view exists for the first applied change set.

## Phase 3 · Company-wide (about 4 weeks)

- Goals with contribution links and forecasts; budgets with actuals; accounts and renewals; risks as weather; lessons and retrospectives; recurrence.
- Knowledge from resolutions; search across everything with saved views; exports (JSON, Markdown) daily; guest access hardened.
- Autonomy raised where measured: briefings and follow-ups at `run`, triage at `confirm`; the playbook quality record drives the recommendations.
- Multi-tenant readiness: cross-tenant suite, tenant settings isolation, a second tenant created in `staging`.
- **Gate 3:** every Lucid domain has its items, goals and owner in Lucid Total; the owner's inbox holds only material decisions for a month; the autonomy dashboard shows measured levels; the export restores into a fresh instance in a drill.

## Phase 4 · Product

Second company, billing, deeper connectors (calendar, channels, CRM, accounting), Lucid Total surfaces inside Lucid Chat, a public integration guide, security review and pen-test, the brand and the site.

## Cross-cutting from day one

Walkthroughs on desktop and phone, RTL, accessibility; parity suite; quality with cost; Railway-first; adapters; current majors; docs in the same change; Lucid Total tracks its own build from Gate 0 on (dogfooding).

## First tracked tasks (seeded at bootstrap)

`LT-0001` Google SSO · `LT-0002` Bot identity for Lucid Total in Lucid Chat (a Lucid Chat task, linked) · `LT-0003` Email adapter and the belucid.chat sending domain · `LT-0004` Railway project `lucid-total` with `dev` · `LT-0005` The importer's "to verify" review wave · `LT-0006` Owner decision: Fable data-retention terms for Lucid Total (material) · `LT-0007` Owner decision: default AI budget per month (material) · `LT-0008` The coordinator's envelope key and first envelope drill.
