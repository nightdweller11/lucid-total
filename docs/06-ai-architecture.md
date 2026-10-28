# Lucid Total — AI Architecture: the agentic framework, models, retrieval and proactive agents

> How the AI inside Lucid Total answers, organises, reminds, notifies, decides within its rights and runs the company's processes. Companion to `docs/05-architecture.md` §5. Draws on `docs/research/appfront-ai-platform-lessons.md` (mechanisms, not code). Model facts checked on 2026-10-28 against the Claude API reference; prices and ids are configuration, never product code.
>
> **Created:** 2026-10-28 · **Status:** v1 draft.

---

## 1. Principles

1. **Parity by construction.** The action registry (`docs/05` §4.2) is the only source of capabilities. Chat tools, REST routes, the MCP server and the UI's menus are generated from it. A capability missing from any surface fails a build-time or test-time check.
2. **Read tools during a run; consequential actions through preview → confirm → apply.** The model may read freely (within the actor's visibility). Writes, outbound sends and spend go through the action layer with a preview the person (or the autonomy level) approves; what runs is exactly what was previewed (hash-bound).
3. **Evidence over assertion.** Answers cite items, documents, code locations, decisions and commits. A number in an answer comes from a query in the same turn (a grounding guard re-prompts once if not). A dense-only retrieval hit is a hypothesis until the source is read.
4. **The model never sees secrets.** Envelopes are ciphertext end to end; items and comments above a conversation's clearance are filtered before prompt assembly; the retrieval index excludes them. Field-level encrypted (payroll-class) fields are never decrypted for a model. A party's assistant is scoped to the party's compartment: the retrieval filter and the tool rights both carry the compartment, so an external cannot ask their way past it.
5. **Quiet by default.** Proactive agents emit one card or line per finding, deduped, at the reader's cadence; outbound channels are off until enabled, each with a kill-switch.
6. **Model and provider agnosticism inside a Claude-first reality.** The owner's Claude API token powers v1. All calls go through `packages/ai-gateway`; model classes (fast · standard · strongest · Fable) map to model ids in configuration; a second provider is an adapter, never a code path.
7. **Measured autonomy.** Every playbook has an autonomy level and a quality record; levels rise on evidence (`docs/02` §2.7).

## 2. The action registry as the tool surface

Each action declaration (`packages/actions`) carries: `name`, `family` (read · item · relation · comment · evidence · decision · changeSet · schedule · notify · envelope · admin), `input` (Zod schema; descriptions on every field; **never** a tenant id in the schema: the server injects it), `permission` (`read` · `reversible` · `irreversible` · `outbound` · `spend` · `admin`), `rights` (decision kind, role or ownership needed), `process` (which autonomy process governs it), `preview(input, actor)`, `apply(preview)`, `undo(changeSet)` or `irreversible: {why}`, `audit` shape, `summary` (one line for the tool catalogue), `usage` (when to use, when not; the only place per-action how-to text lives).

From this the build generates: JSON Schema for the Claude tools, OpenAPI for REST, MCP tool definitions, the UI action menus and command-bar entries, and a **capability overview** the assistant can describe itself with. Three checks keep parity honest (`docs/09`): a compile-time exhaustiveness record (every action has a permission class and a preview), a test that walks REST routes and MCP tools against the registry, and a UI test that every action menu entry resolves to a registered action.

**Progressive disclosure.** A run starts with a small core tool set (search, get, list, explain, create item, comment, preview change set, ask for confirmation) plus `find_tools`; other tools load on demand by family. Admin tools are not disclosed to non-admin actors at all (not "denied": absent).

## 3. The model gateway (`packages/ai-gateway`)

- **Adapter**: the official TypeScript SDK (`@anthropic-ai/sdk`), used only inside the adapter. Messages API with tool use and streaming; the SDK's tool runner (`client.beta.messages.toolRunner` with `betaZodTool`) drives the read-tool loop, with per-turn hooks for budgets, logging and the consequential-action gate; adaptive thinking (`thinking: {type: "adaptive"}`), depth controlled by `output_config.effort` per model class and task; **prompt caching** with a frozen prefix (standing rules, capability block, tool definitions) and volatile content after the last breakpoint; mid-conversation operator instructions as `role: "system"` messages inside `messages` (preserves the cached prefix; also the injection-safe operator channel); structured outputs (`output_config.format`) for envelopes such as triage results, change-set proposals and briefing summaries; refusal handling (`stop_reason: "refusal"` with `stop_details`) with server-side fallbacks enabled where the model supports it. Forced tool choice is not used (the current models reject it): the prompt names the tool and `strict: true` keeps arguments schema-valid.
- **Model registry** (configuration, `settings.ai.models`):

  | Class | Default id (2026-10) | Use | List price in/out per MTok |
  |---|---|---|---|
  | `fast` | `claude-haiku-5-5` | classification, triage first pass, dedupe, routing, summaries of comments | $0.10 / $0.50 |
  | `standard` | `claude-sonnet-5-5` | most chat turns, briefings, proactive agents' findings, drafts | $2 / $10 |
  | `strongest` | `claude-opus-5-5` (default class for the owner's chat) | planning, change-set proposals, propagation explanations, evidence checks, meeting capture | $4 / $20 |
  | `fable` | `claude-fable-5-1` | enabled per company by the owner; reserved for the hardest reasoning (strategy previews, architecture questions over the codebase); long turns | $10 / $50 |

  Classes are what the product shows; ids change in configuration (`docs/00` principle 12: never a model name in product code). A per-conversation choice overrides the default; proactive agents pin the smallest class that passes their eval (§7).
- **Data terms.** Fable 5.1 requires 30-day data retention at the provider (it is not served under zero-data-retention unless Anthropic authorises it). Lucid Total handles company work data, not Lucid Chat's sealed message content, so this is acceptable for v1 **if the owner confirms** (open question in `docs/12`); Lucid Chat's own mediation stays on its ZDR path and is untouched. Sensitive items (`docs/07` §6) are excluded from prompts regardless of model.
- **Budgets and cost accounting**: per run (steps and dollars; soft wrap-up at 60 % of the run budget), per agent per day, per company per month; `usage` from every response accumulated into `agent_runs` and surfaced per thread, agent and day; cache read/write tokens tracked (a zero cache-read across repeated turns raises a diagnostic).
- **Run recorder**: inputs, tool calls and results (pointers, not copies, for large content), events, cost, model and effort, for replay and evaluation (`docs/09`).
- **Long work.** Chat turns are bounded (steps, budget, wall time); when a request needs long autonomous work (an import review, a quarterly retrospective draft), it becomes a scheduled agent run on the `ai` role, not a chat turn. Engineering work is handed to the Claude Code coordinator (UC-D8), which runs outside Lucid Total and reports through the API.

## 4. Retrieval: the in-memory knowledge index (`packages/knowledge`)

**What is indexed** (per tenant): items (title, brief, acceptance, state text), comments and feedback (below the sensitivity cut), decisions (summary and text), evidence text (reports, walkthrough markdown), documents from indexed repositories (`docs/**/*.md` of Lucid Chat and of Lucid Total, heading-chunked with the heading path as scope), code from indexed repositories (symbol-aware chunks with pointers: file, lines, scope; TypeScript split at top-level declarations), conversations with the assistant (per person, scoped), resolutions of issues.

**How, following what measured well elsewhere** (`docs/research/appfront-ai-platform-lessons.md`):

1. **Hybrid search.** BM25 over the raw query (k1 1.5, b 0.75; postings as typed arrays with delta + varint encoding; camelCase split; common terms pruned) and dense cosine over an **expanded** query (a deterministic glossary: Lucid's ids, acronyms, wave names, glyph names, domain terms; no model call at query time), fused with Reciprocal Rank Fusion (k = 60, both lists to depth 2K). Every hit reports `matchedBy: lexical | dense | both`.
2. **Pointers, not text.** The corpus stores (source, path or id, range, scope header, tier, content hash); snippets are read from the system of record or the repository snapshot at answer time, so the index can never quote text that no longer exists.
3. **Build-time enrichment.** Items get a short generated summary and "see instead" pointers to near-duplicates; documents get their heading path and status line (a doc's `> Status:` is read from its preamble so a draft is never quoted as current); time vocabulary added to dated things. Enrichment runs in the worker, with the `fast` class, and is cached by content hash.
4. **Embeddings.** v1 uses a small local embedding model running in-process on the `ai` role (ONNX, int8; hundreds of MB of RAM at most) so no second provider is needed; the encoder is a configuration choice and the corpus is bound to it by hash (a mismatch refuses to load). If an external embedding provider is ever preferred, it is an adapter with a written case.
5. **Query memory.** Past successful turns (question → the items and sections the answer used, confirmed by the person's follow-through) are indexed and fused in; this was the largest measured gain elsewhere.
6. **Artefacts.** The index is built by the worker from Postgres and the repository snapshots, published content-addressed to the bucket with a manifest (encoder id, dimensions, corpus hash, source commits, counts), loaded at boot by the `ai` role; a committed small fallback is not needed because Postgres full-text search is the degraded path. **Currency rule**: a repository artefact must be built from a commit that is an ancestor of the indexed repository's current main and at most N commits behind (setting; default 30), else it is rebuilt before use.
7. **Freshness.** Item and comment changes update the in-memory BM25 side immediately (small, incremental) and queue dense re-embedding; repository content rebuilds on each merge the GitHub connector reports; the manifest records what the index knows.
8. **Promotion gate.** A rebuilt corpus is scored on the held-out reference set per category (items, docs, code, decisions) and promoted only if no category regresses beyond the configured tolerance and every reference query returns a non-empty top-3.
9. **Size and latency targets.** Tens of MB resident at Lucid's size (about 2,400 items, ~500 decisions, ~200 documents, the Lucid Chat code base); query under 50 ms lexical, under 300 ms hybrid including embedding; boot under 5 s from the artefact.

**What we deliberately do not do:** rerankers (did not transfer to real traffic), query rewriting with a model (same quality, slower), bulk model-generated synonyms (hurt specific categories), a vector database (unneeded at this scale), indexing envelopes or sensitive items (never).

## 5. Context assembly per turn

1. **Standing prefix (cached):** the assistant's rules; the company's operating facts (domains, roles, rights summary, autonomy levels, materiality thresholds, cadences) rendered deterministically from settings; the capability overview; the core tools.
2. **Actor block:** who is asking, on whose behalf, their rights, their perspective, time zone, cadence preferences; what they can see (the visibility filter is applied by the data layer, not described to the model).
3. **Scope block:** the thread's scope (item, grouping, meeting, person) with the scoped item's summary and its neighbourhood (parents, blockers, dependents) as compact cards.
4. **Retrieved context:** top-K hybrid hits as compact cards with ids and `matchedBy`; the person's query memory; the "see instead" pointers.
5. **History:** the thread's turns, summarised server-side beyond a token threshold while keeping the last N turns verbatim; tool results older than M turns cleared.
6. **Volatile:** the current time, the request.

Untrusted content (comments, documents, emails, tool results) is wrapped and marked as data; sentinels are sanitised on write and read; schemas and setting values never appear in free text where a prompt could echo them.

## 6. The chat run

`PLAN → ACT (read tools, bounded) → PROPOSE (typed envelope: `{answer, citations[], proposed_actions[], asks[]}`) → EMIT`. Proposed actions are previews produced by the action layer (not by the model's own description); the client renders them as cards; confirmation applies the preview hash. Reversible actions at autonomy `inform` are applied inside the turn and shown with undo. Guards: step cap, budget cap with soft wrap-up, a grounding guard for numbers, a never-empty-turn rule, a refusal handler (explain and offer the nearest thing). Streaming: text deltas, tool events and preview cards flow over SSE as one typed event union shared with the client (`packages/events`); `emit` never throws.

## 7. Playbooks and proactive agents (`packages/agents`)

A playbook is data: name, trigger (schedule or event), autonomy level, allowed tools and actions, model class, budget, the procedure (steps with checks), outputs (cards, lines, items), evals (held-out cases and a judge rubric), quality record (acceptance rate of its suggestions, reversals, complaints). The scheduler runs on the `ai` role under a leader lease; proactive agents are off by default per company and enabled from settings.

| Agent | Trigger | Default level | What it does |
|---|---|---|---|
| Follow-up | schedule per follow-up item | inform | Checks the watched condition; reports on change only; escalates per rule |
| Briefing | per reader cadence | run | Composes the reader's briefing with citations; material decisions first |
| Triage | inbound issue or incident | suggest | Proposes kind, severity, SLA class, owner, linked task, customer acknowledgement |
| Evidence check | item moves to review or done | suggest | Reads linked evidence; proposes per-criterion status; flags missing walkthroughs |
| Sweeper | nightly | suggest | Duplicates, orphans, stale `doing`, cycles, done-with-open-subtasks |
| Deadline and SLA watcher | hourly | inform | Due soon, overdue, SLA breach signals at the reader's cadence |
| Decision ageing | daily | inform | Nudges right holders; escalates per rule; never batches the owner's material decisions into lists |
| Workload | weekly | suggest | Workload signals per person, shown to the person first, as help (UC-E4) |
| Account renewal | daily | inform | Expiring accounts and envelopes → rotation chores |
| Import reviewer | after an import | suggest | Grades imported rows' evidence; creates "to verify" items |
| Ask router | new ask | suggest (→ inform) | Summarises the ask, finds related items and duplicates, proposes the responsible role holder and a decision; aggregates support issues into product asks |
| External correspondence | chore or ask addressed to a virtual party; inbound reply | suggest (→ confirm) | Drafts the email or message on the company's behalf inside the party's compartment; parses replies into answers, commitments and evidence; never sends without the process's autonomy level allowing it |
| Stage watcher | weekly | suggest | Computes the company's structural signals and proposes a stage change with its preview (UC-O2) |

Every finding links its evidence and is deduped by a stable key; the reader's cadence batches delivery; nothing is emailed until the email channel is enabled.

## 8. Meeting mode

A meeting item starts a shared perspective. The assistant takes typed or transcribed speech (browser speech recognition on the phone and desktop in v1; a transcription adapter later), extracts decisions, tasks and assignments as proposed cards with their previews, applies reversible ones at `inform`, holds confirmations for the end or applies on an explicit "do it", and writes the summary item with links. The meeting's thread is the audit trail.

## 9. External agents and the coordinator

The Claude Code coordinator (Fable or Opus) and its workers are service accounts of kind `coordinator` and `worker`. They use the REST API and the MCP server (`docs/08` §4–§5) with the same action registry: working lines, item updates, evidence attachment, follow-up spawning. The assistant hands engineering work to the coordinator by creating or updating a task and notifying the coordinator's inbox (UC-D8); it never pretends to build. Vendor or future agents get their own service accounts with narrower rights.

## 10. Safety, rights and budgets in the AI layer

Rights are enforced by the action layer, not by the prompt. An action beyond the actor's rights becomes a proposal with a note. Permission classes decide the confirmation flow; autonomy levels decide whether a human tap is required; budgets cap spend, outbound volume and mass-change size; kill-switches per channel; a company-wide AI pause. Prompt injection: data marked and sanitised, no schema or setting values in free text, tool results treated as untrusted, admin tools undisclosed. Audit: every run, tool call, preview, apply and refusal is an event.

## 11. Evaluation (summary; detail in `docs/09`)

Held-out sets kept out of every store the system reads: retrieval queries per category with expected sources; chat questions with expected citations; triage cases with expected classes; change-set proposals with expected deltas; briefing samples graded by a blind rubric judge whose "met" must quote checked text. Cost and latency reported with every quality figure (Lucid Chat's rule L495). Replay from recorded runs. Quality per playbook feeds the autonomy dashboard.
