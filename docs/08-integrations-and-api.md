# Lucid Total — Integrations, API and the Coordinator Protocol

> The surfaces through which other systems and agents use Lucid Total: REST, webhooks, the MCP server, connectors, email, Lucid Chat, and the protocol the Claude Code coordinator follows. Companion to `docs/05` and `docs/06`.
>
> **Created:** 2026-10-28 · **Status:** v1 draft.

---

## 1. Principles

One action registry behind every surface; stable ids (ULIDs with human aliases); idempotency keys on every write; events as the integration contract (versioned union); every external behind an adapter with a stub for tests; outbound channels off until enabled, each with a kill-switch; service accounts with rights and budgets for every external actor.

## 2. REST API (`/api/v1`)

- **Auth:** session cookie (web app) or `Authorization: Bearer <api key>` (service accounts). Keys are per service account, scoped by rights, rotatable.
- **Resources:** `asks`, `parties`, `engagements`, `party-threads`, `items`, `groupings`, `relations`, `comments`, `evidence`, `criteria`, `decisions`, `proposals`, `change-sets` (preview, apply, undo), `people`, `agents`, `working-lines`, `inbox`, `notifications`, `subscriptions`, `perspectives`, `scene` (the map scene for a perspective and zoom window), `search`, `time-entries`, `envelopes` (metadata; ciphertext endpoints), `settings`, `imports`, `exports`, `events` (cursor-paginated), `health`.
- **Actions:** `POST /api/v1/actions/{name}/preview` and `POST /api/v1/actions/{name}/apply` (with `previewHash` or `idempotencyKey`) for every registered action; resource endpoints are conveniences generated from the same registry.
- **Live:** `GET /api/v1/events/stream` (SSE, resume by `Last-Event-ID` = `seq`), `GET /api/v1/ws` for the map and chat streaming.
- **Errors:** RFC 9457 problem details with a stable `code`; rights refusals say what right was missing and whether a proposal was created instead.
- **Spec:** OpenAPI generated from the registry, published at `/api/v1/openapi.json` and in `docs/api/`.

## 3. Webhooks

Per service account: a URL, a secret (HMAC-SHA256 signature header), event filters (types, groupings, kinds), delivery via the outbox with retries and a dead-letter view. Payload: the event with its change set and the acting principal; the receiver fetches details by id when needed.

## 4. MCP server

The action registry exposed as MCP tools (`total.search`, `total.item.get`, `total.item.create`, `total.changeSet.preview`, …) over the official MCP transport (streamable HTTP) at `/mcp`, authenticated with a service account key; tool descriptions come from the registry's `summary` and `usage`; admin tools absent for non-admin accounts; progressive disclosure through `total.findTools`. This is how the Claude Code coordinator and any external agent operate Lucid Total with the same rights model as the UI.

## 5. The coordinator protocol (Claude Code lead and workers)

The Claude Code coordinator runs Lucid Chat's development outside Lucid Total (on the lead's machine, in git worktrees). It reports and takes its work through Lucid Total:

1. **Identity:** service account `coordinator` (acts for the owner; rights: item and relation writes in Engineering and the domains a task touches, evidence, comments, working lines, follow-up creation, reading everything the owner sees except `restricted`; no spend, no outbound email) and one `worker` account per parallel slot (rights limited to the items assigned to it).
2. **Wave start:** create or reuse the wave grouping; for each brief create or update the task (brief fields from the brief file; acceptance criteria as `criteria`; dependencies as relations; the brief file attached as evidence); set state `brief` → `doing` when a worker starts; post the working line.
3. **Working lines:** `POST /working-lines` with `{agent, item, text, heartbeatSeconds}` at start, on a meaningful change (a suite passing, a review finding, a block), and at finish; a heartbeat keeps it fresh without new text. Nothing else is posted. The Agents live view shows age and stale lines.
4. **Finish:** attach evidence (test results as structured evidence, walkthrough report path and screenshots as files or links, PR/commit), propose per-criterion statuses (the evidence checker confirms), move to `review`; the lead's review moves to `done` and records the merge commit; follow-ups are created with `spawned_by`.
5. **Handoff in:** tasks created by the assistant for the coordinator appear in the coordinator's inbox; the coordinator acknowledges by taking the working line.
6. **Envelopes:** the coordinator reveals an envelope with `GET /envelopes/{id}/ciphertext` and decrypts with its local key; its tooling places the value into the target (a Railway variable through the Railway CLI, a vault file) and never prints it.
7. **Rhythm hooks:** a small CLI (`tools/coordinator/total.mjs`) wraps these calls so the lead's existing scripts (status publish, wave merge, decisions pull) become Lucid Total calls; Claude Code hooks can post working lines automatically at tool boundaries later.
8. **Replaces:** `docs/15-checklist.md` row updates, the status site's rows and scoreboard, the decisions page pull, the quality and cost page republish (`docs/10`).

## 6. Connectors (adapters under `packages/adapters`)

| Connector | Direction | v1 behaviour |
|---|---|---|
| **GitHub** | in (webhooks: push, pull_request, merge) | Parse `[ID]` in commit subjects and PR titles; attach commits and PRs as evidence; move build state; a merge to main marks the merge commit on the item and triggers a repository re-index. Out: none in v1 (no issues mirror). |
| **Railway** | in (deploy and failure webhooks; health polls) | Attach deploys to release items; create or update incidents on failures; environment status on the map. Out: the coordinator's CLI sets variables from envelopes (not Lucid Total itself). |
| **Email** | out (adapter over an SMTP/API provider; the belucid.chat domain) and in (the mail bucket Lucid Chat already receives into; later a dedicated inbound route) | Notifications and briefings; replies threaded to items by `In-Reply-To` and a per-item address tag; inbound to support/beta/task addresses create items or comments; kill-switch default off; signed unsubscribe for non-essential classes. |
| **Lucid Chat** | out (bot identity through Lucid Chat's client API) and in (replies from the bot conversation) | A "Lucid Total" conversation per person on Lucid Chat; reminders, decisions needed, resolutions; replies ("done", "approve", "Friday") mapped to actions with confirmation where the class requires; Lucid Chat's "Report a problem" notices link report ids into issues. Requires the bot identity in Lucid Chat (a task in Lucid Chat's own tracking). |
| **Party correspondence** (over the Email and, later, SMS/Lucid Chat adapters) | both | The system writes to a virtual party on the company's behalf (from a per-party address such as `finance+acme@…`), threads replies to the party page and the item, extracts answers and commitments into items with the AI at the process's autonomy level, and keeps the whole exchange inside the party's compartment. The party sees ordinary email; the company sees a participant. |
| **External view** | in | Direct parties sign in by magic link or SSO and use the reduced application scoped to their compartment; every action they take goes through the same registry with their party's rights. |
| **System parties** | both | Payroll providers, banks, vendor APIs as parties with a service account and a connector; "who touches our finance data" is the parties list. |
| **Google SSO** | in | OIDC sign-in (LT-0001). |
| **Object storage** | both | Railway Buckets (S3 API). |
| **Claude API** | out | `packages/ai-gateway` only. |
| **Calendar** (later) | both | Meetings in; decisions out. |

Every connector has: a stub for tests, a status card in settings (last event, errors), a kill-switch, and its events mapped into the shared union.

## 7. Import and export

- **Import** (`tools/import/`): Lucid Chat's checklist, decision log, briefs, walkthroughs, ADRs, accounts (`docs/10`); generic JSON and CSV through `POST /imports` with a mapping document; idempotent by alias.
- **Export**: `POST /exports` produces a JSON bundle (items, relations, comments, decisions, evidence metadata, settings) and a Markdown rendering (one file per grouping, the decision log as Lucid Chat's `docs/09` format) into the bucket; daily by schedule; downloadable by admins.

## 8. Public integration guide (for other companies later)

A short developer guide generated from the registry: authentication, the action model (preview/apply/undo), events, webhooks, MCP, rate limits, and recipes (create a task from a form, mirror a support inbox, post deploy events, drive a meeting from a calendar). Lives in `docs/api/` once the registry exists.
