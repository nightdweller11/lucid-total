# Lucid Total — System Architecture

> How Lucid Total is built and run: a modular monolith on Railway with Postgres, an event stream, an in-memory knowledge layer and the Claude API behind a model gateway. Derives from `docs/00`–`03`. The AI layer is detailed in `docs/06-ai-architecture.md`, security and secrets in `docs/07-security-and-secrets.md`, external surfaces in `docs/08-integrations-and-api.md`, testing in `docs/09-testing-and-quality.md`.
>
> **Created:** 2026-10-28 · **Status:** v1 draft. Inherited rules: Railway-first (no new external service without a written case), adapters for every external, current and best-supported majors only (TypeScript 6.x, Node 22 LTS now and 24 when the ecosystem supports it), no Docker on the development machine, no dependence on GitHub Actions, no provider SDK outside its adapter.

---

## 1. Architecture in one picture

```
                 ┌──────────────────────────── Browsers (desktop, phone PWA) ───────────────────────────┐
                 │  Web app: map · board · list · item · inbox · chat · settings   (React, TS, Lucid Glass) │
                 └───────────────┬──────────────────────────────────────┬────────────────────────────────┘
                     HTTPS (REST, SSE)                              WebSocket (live events)
┌─────────────────────────────────┴──────────────────────────────────────┴──────────────────────────────┐
│  apps/server  (Node 22, TypeScript; ONE deployable, roles by env)                                      │
│                                                                                                        │
│   ROLE=api        REST + SSE + WS · auth · rights · ACTION LAYER (registry, preview, apply, undo)        │
│   ROLE=ai         chat runs · retrieval (in-memory index) · model gateway · proactive agents (scheduler)│
│   ROLE=worker     outbox → notifications (email, Lucid Chat, webhooks) · connectors · imports · exports │
│   ROLE=all        all of the above in one process (Lucid's size)                                        │
│                                                                                                        │
│   packages: model (schema, types) · actions (registry + handlers) · policy (rights, autonomy, settings) │
│             knowledge (index build + query) · ai-gateway (Claude adapter) · events · adapters/*          │
│             ui (Lucid Glass tokens, components) · i18n · observability                                  │
└────────────┬───────────────────────────┬──────────────────────────┬───────────────────────────────────┘
             │                           │                          │
   Postgres 18 (Railway)         Railway Buckets (S3 API)     Claude API (ZDR terms; adapter)   Email (adapter)
   items · relations · events    attachments · index          tool-use, streaming, caching    Lucid Chat API (adapter)
   outbox · audit · envelopes*   artefacts · exports          Agent runs                        GitHub / Railway webhooks
   (*ciphertext only)
```

- **One codebase, one deployable, roles by environment variable**, as Lucid Chat does. At Lucid's size one `ROLE=all` service plus Postgres and a bucket runs the whole product for tens of dollars a month. Roles split when a measured need appears (the AI role first, because model calls hold connections; the worker second).
- **Postgres is the system of record and the event log.** No second database. Redis is not needed at the start (the server holds live subscriptions in process; Postgres `LISTEN/NOTIFY` fans events between roles when they split). NATS is not needed: the outbox table plus a worker loop gives at-least-once delivery.
- **The knowledge layer is in memory**, built from Postgres and the indexed repositories, published as content-addressed artefacts in the bucket, loaded at boot (`docs/06` §4).
- **All externals behind adapters**: Claude API, email, Lucid Chat, GitHub, Railway, Google SSO, object storage.

## 2. Design decisions at a glance

| Decision | Choice | Why | Alternatives rejected |
|---|---|---|---|
| Deployment | Railway, one service per role, Postgres and Buckets from Railway | Railway-first rule; Lucid already runs there; cheap at small size | Fly, Render (no case); Kubernetes (toil) |
| Language and runtime | TypeScript 6 strict, Node 22 LTS (24 when peers support) | Current, shared with Lucid Chat, one language for server, client, tools | Go/Rust server (two languages, slower iteration) |
| Server framework | Fastify 5 with typed schemas (JSON Schema from the action registry) | Fast, maintained, schema-first, SSE/WS friendly | Express (legacy), Nest (ceremony) |
| Data access | Drizzle ORM + plain SQL migrations (as Lucid Chat) | Typed, no magic, migrations in repo | Prisma (engine binary, slower cold start) |
| Web client | React 19 + Vite; TanStack Router/Query; Zustand for local state | Current, fast, shareable component model with Lucid's `packages/ui` web target | Next.js (server rendering not needed), Expo web (the map and dense tables want the DOM) |
| Live updates | Server-Sent Events for feeds, WebSocket for the map and chat streaming | Simple, proxy friendly on Railway | Polling only |
| Map rendering | SVG with a server-computed stable layout; Canvas fallback for very large companies | Accessibility (DOM nodes), crisp at any zoom, animatable | WebGL (accessibility cost, not needed at our scale) |
| Search and retrieval | In-memory BM25 + dense embeddings with RRF; Postgres full-text for exact filters | Proven in appfront at ~22 MB / ~260 ms; no vector DB | pgvector (fine later; not needed), hosted vector DB (external service) |
| Model access | Claude API through `ai-gateway` (Messages API with tool use, streaming, prompt caching); Agent SDK for long autonomous runs where it fits | Owner: Claude API token; tool-use quality | Direct SDK calls from handlers (parity and audit lost) |
| Identity | Bootstrap owner secret + service accounts → Google SSO (OIDC) | Owner instruction; SSO is the first tracked task | Passwords for everyone |
| Secrets | Envelopes encrypted client-side to recipients' keys (WebCrypto), ciphertext in Postgres | The server never holds plaintext secrets | Vault service (external, toil) |
| Tenancy | `tenant_id` on every row from day one, one tenant per instance in v1 | Product later without a schema change | Schema-per-tenant (migration toil) |

## 3. Clients

### 3.1 Web app (`apps/web`)

- React 19, TypeScript, Vite; routes: `/map`, `/inbox`, `/work`, `/boards/:grouping`, `/items/:id`, `/people`, `/agents`, `/issues`, `/decisions`, `/chat/:thread?`, `/settings/*`, `/envelopes/:id`.
- **Lucid Glass** from a web build of Lucid Chat's tokens (`packages/ui` here vendors the token values and the CSS variable generator; the glyph vocabulary and the derived Lucid Total mark live in this repo's `packages/ui/brand`). Three themes, high-contrast and reduce-transparency variants, RTL by `dir`.
- **Data**: TanStack Query over the REST API with optimistic updates; the event stream (SSE) invalidates and patches caches; a small persisted queue for writes made offline on the phone (replayed with idempotency keys).
- **The map**: receives a *scene* (regions, cells, hulls, roads, flags, presence) computed by the server for the viewer's perspective and zoom; renders SVG; animates zoom with CSS transforms; semantic zoom chooses label density by level; a list-equivalent tree is rendered from the same scene for assistive technology.
- **Chat**: streams tokens and tool events over SSE; renders tool preview and result cards from a typed event union shared with the server (`packages/events`); confirmations call the action layer with the preview's hash.
- **PWA**: installable, offline shell, queued writes; web push later.

### 3.2 Phone

The same app with phone layouts (bottom pill navigation, full-screen pages, sheets). Native surfaces come later through Lucid Chat.

## 4. Backend

### 4.1 Roles

| Role | Owns | Scaling |
|---|---|---|
| `api` | HTTP/SSE/WS, auth, rights, the action layer (preview, apply, undo), reads, scene computation for the map, uploads (presigned) | Stateless; scale horizontally; sticky not required (SSE resumes by cursor) |
| `ai` | Chat runs (tool loop), retrieval index in memory, model gateway, proactive agents and the scheduler (leader lease) | One leader for schedules; several for chat; memory-bound by the index (tens of MB at Lucid's size) |
| `worker` | Outbox dispatch: notifications (in-app, email, Lucid Chat, webhooks), connectors (GitHub, Railway, email in), imports, exports, index rebuild triggers | Horizontal; idempotent handlers |

`ROLE=all` runs everything in one process; the roles are modules with explicit interfaces so splitting is a deployment change.

### 4.2 The action layer (the heart)

Every change to the model goes through one path:

1. **Registry.** `packages/actions` declares each action: name, family, input schema (Zod → JSON Schema), permission class (`read` · `reversible` · `irreversible` · `outbound` · `spend` · `admin`), rights required (decision kind / role / ownership), autonomy process it belongs to, preview function, apply function, undo function (or "not reversible" with the reason), audit shape. The registry generates the REST routes, the MCP tool definitions, the chat tools and the UI's action menus. An action missing a permission class or a preview fails the build (exhaustive type checks).
2. **Preview.** Given input and actor (person, or agent on behalf of a person), compute the exact change set (per item: field, before, after; derived changes from propagation; notifications that would be sent; external effects) without writing; return it with a content hash and an expiry.
3. **Apply.** Takes the preview hash (so what runs is what was shown) or runs preview + apply atomically for `reversible` actions at autonomy `inform`; re-checks rights; writes items, relations and the **event** rows in one transaction; appends to the **outbox** for side effects; returns the applied change set with an undo token.
4. **Undo.** Reverts the change set where every part is reversible; otherwise reverts the reversible parts and lists the rest; writes its own change set linked to the original.
5. **Audit.** Every preview, apply, undo and refusal is an event with actor, on-behalf-of, reason, preview hash, outcome.

### 4.3 Events, outbox and live feeds

- `events` table: append-only, per tenant, with a monotonically increasing `seq` per tenant and a type from one shared union (`packages/events`); carries the change set, actor and causation (which action, which decision, which agent run).
- `outbox` table: side-effect intents (notify, email, Lucid Chat message, webhook, index refresh, connector call) written in the same transaction as the events; the worker claims rows with `SELECT … FOR UPDATE SKIP LOCKED`, executes idempotently (dedupe keys), records delivery, retries with backoff, parks after N failures with a visible incident.
- Live feeds: the `api` role tails `events` (Postgres `LISTEN/NOTIFY` + cursor catch-up) and pushes to SSE/WS subscribers filtered by visibility; clients resume from their last `seq`.
- Working lines (agents' "currently on") are events of type `working_line` with a heartbeat; the live panel shows age; stale lines (no heartbeat within the agent's interval) are marked.

### 4.4 Propagation engine

A pure module (`packages/propagation`) that takes the model snapshot (items, relations, capacities, weights) and a proposed change set and returns the derived change set and the delta (dates, priorities, loads, forecasts, risks), with explanations per derived change. Used by preview (what-if) and by apply. Deterministic and tested with fixtures; its forecasts are simple and explainable first (critical path over estimates and capacities), refined later with observed durations.

### 4.5 Scene computation (the map)

`packages/scene` computes, per viewer perspective and zoom window, the regions, cells, hull outlines, clusters, roads, flags and presence from the model snapshot and the pinned layout positions; caches by (perspective, model version, zoom level); streams incremental updates for live changes. Layout: a force layout for first placement, then pinned positions per viewer stored as a perspective's layout; hulls by smoothed concave hull around member cells per region.

### 4.6 Data model (Postgres)

Core tables (every table carries `tenant_id`; ids are ULIDs with human aliases):

- `items` (id, tenant, kind, title, state, home_domain, owner, priority_override, priority_cached + factors JSON, dates, estimate, sensitivity, visibility, fields JSONB validated per kind, search tsvector, created/updated, deleted_at), `item_aliases` (alias → id; the imported checklist ids), `item_assignees`, `item_groupings`, `groupings` (kind, lead, dates, weights, layout JSON), `relations` (type, from, to, note, created_by), `comments` (item, author, body, sensitivity, kind: comment | feedback_request | system, answered_by), `evidence` (kind, uri or storage key, title, metadata, criteria links), `criteria` (item, text, status, evidence links), `time_entries`, `people`, `roles`, `rights`, `agents`, `service_accounts`, `sessions`, `perspectives`, `settings` (versioned documents: priority weights, autonomy levels, templates, cadences, budgets), `change_sets` (preview hash, applied, baseline, undo of), `events`, `outbox`, `notifications` (per person, channel, state), `subscriptions`, `envelopes` (metadata + ciphertext; `docs/07`), `envelope_reveals` (audit), `conversations`, `messages`, `agent_runs` (inputs for replay, tool calls, cost), `index_artifacts` (published corpus revisions), `connector_state`, `imports`.
- Partitioning is not needed at Lucid's size; `events` and `agent_runs` are the first candidates (monthly) when they grow.
- Full-text: `tsvector` on items and comments for exact filtering; semantic retrieval in the knowledge layer.

### 4.7 Storage

Railway Buckets (S3 API) for attachments (screenshots, videos, reports), exports, and the knowledge artefacts (`docs/06` §4). Presigned uploads from the browser; content types and size limits enforced; images get thumbnails in the worker.

### 4.8 Settings as data

A versioned settings document per tenant (and overrides per domain and per person) holds everything `docs/02` calls a setting: domains and templates, priority weights, materiality thresholds, autonomy levels per process, SLA classes, cadences, budgets, kill-switches, model policy, connectors. Changing a setting is an action (previewed and audited like any other); the server validates against a schema and serves the resolved document to clients and agents.

## 5. The AI layer (summary; detail in `docs/06`)

The `ai` role runs chat turns and proactive agents through the **model gateway** (`packages/ai-gateway`: the Claude adapter with tool use, streaming and prompt caching; a registry mapping model classes fast/standard/strongest/Fable to model ids as configuration; budgets and cost accounting). Tools are the action registry (read tools during a run; consequential actions only through preview → confirm → apply). Retrieval is the in-memory knowledge index (items, comments, decisions, documents, code, conversations) built by the worker and published to the bucket. Proactive agents are playbooks on a scheduler with a leader lease. Every run is recorded (inputs, tool calls, events, cost) for replay and evaluation.

## 6. Identity and rights (summary; detail in `docs/07`)

Bootstrap: one owner account (a strong secret in the owner's vault), service accounts for agents (API keys, scoped rights, budgets). Google SSO (OIDC) is tracked as the first task and replaces the owner secret for people; service accounts stay. Sessions are cookies for the web app and bearer keys for the API. Rights resolve from roles per domain and decision kinds; the action layer enforces them; agents act on behalf of a person and inherit that person's rights intersected with their own.

## 7. Scaling plan

| Stage | Shape | Limits |
|---|---|---|
| **0 · Lucid (now)** | One `ROLE=all` service (1–2 GB), Postgres, one bucket | Thousands of items, tens of thousands of events a day, a handful of agents; index tens of MB |
| **1 · A few companies** | `api`, `ai`, `worker` as separate services; Postgres with read replica if needed; index per tenant loaded lazily and evicted idle | Hundreds of thousands of items per tenant |
| **2 · Product** | Horizontal `api` and `ai`; the index served by dedicated `ai` instances per tenant group; `events` partitioned; optional pgvector for very large corpora | Measured, not guessed |

No step requires a new kind of infrastructure; each is a deployment change.

## 8. Reliability and recovery

- Railway Postgres backups on a schedule; export job (`docs/08` §6) produces a JSON + Markdown snapshot daily to the bucket; restore runbook with a drill.
- Idempotent actions (client idempotency keys), at-least-once outbox with dedupe, resumable live feeds.
- The knowledge index is rebuildable from the system of record at any time; a stale or missing artefact degrades to Postgres full-text search, never to silence.
- Health: `/healthz`, `/readyz` per role; the scheduler's lease visible; parked outbox rows raise an incident item in Lucid Total itself.

## 9. Observability (content-aware)

Structured logs without item bodies or comment text (ids and field names only), metrics (action latency, outbox lag, index query latency, model latency and cost per class, notification counts), traces across the action path. Lucid Total is less strict than Lucid Chat's sealed boundary (company work data is the product), but **secrets never** appear anywhere (envelopes are ciphertext end to end), sensitive items are excluded from logs by their flag, and customer PII in issues is minimised and masked in logs.

## 10. Deployment and environments

Railway project `lucid-total` with environments `dev`, `staging`, `production` cloned the way Lucid Chat does (`infra/railway/`), each with its Postgres and bucket; the service built by Railway from an upload of one commit (`railway up`), as Lucid Chat's `lucid-server` is. Verification is local at every merge (unit, integration against the Railway dev Postgres, parity, Playwright at two widths); the nightly backstop runs in the `ci` environment as a Railway cron service, as Lucid Chat's `ci-runner` does. No GitHub Actions. Custom domain later (`total.belucid.chat` proposed).

## 11. Repository layout

```
apps/web            React web app (map, board, list, item, inbox, chat, settings)
apps/server         Node/TS server; roles api · ai · worker · all
packages/model      Schema (Drizzle), zod types, item kinds, settings schema
packages/actions    Action registry, previews, apply/undo handlers, generated routes and tools
packages/policy     Rights, autonomy levels, materiality, priority weights (resolver)
packages/propagation  Change-set derivation, forecasts, deltas
packages/scene      Map layout and scene computation
packages/knowledge  Index build (chunk, embed, BM25, enrich, publish) and query (hybrid, RRF)
packages/ai-gateway Claude adapter, model registry, budgets, cost, run recorder
packages/agents     Playbooks, proactive agents, scheduler
packages/events     Event and tool-event unions shared by server and client
packages/adapters   email · lucid-chat · github · railway · sso · storage (one folder each)
packages/ui         Lucid Glass tokens (vendored values), components, Lucid Total brand
packages/i18n       ICU catalogs (en, he), RTL helpers
packages/observability  Logger, metrics, trace filters
tools/import        Importers (Lucid Chat checklist, decision log, briefs, walkthroughs)
tests/e2e           Playwright (desktop + phone, themes, RTL)
tests/parity        UI ↔ action registry ↔ tools coverage
tests/evals         AI eval sets (held out) and judges
infra/railway       Service definitions, environments, cron
docs/               This documentation
```

## 12. What we deliberately did not choose

Kubernetes, a message broker, a vector database, a separate search service, server-side rendering, a native app in v1, a secrets service, GitHub Actions. Each would add an external or operational dependency that the Railway-first rule and Lucid's size do not justify; each has a named place in the scaling plan if a measured need appears.
