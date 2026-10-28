# Research: what appfront's AI platform teaches us

> Read-only study of `~/Projects/Appfront-portal/next` (docs under `docs/ai-platform-definitive/`, `docs/ai-backend-actions/`, `docs/ai360/`, packages `cube-rag`, `code-knowledge`, `agent-events`) made on 2026-10-28 by an Opus 5.5 agent for the Lucid Total architecture. We learn the methods and mechanisms; we do not copy code. Figures are theirs and may age. Paths are relative to that repository.

**Three discrepancies to know before relying on the docs:**
- `packages/code-knowledge/README.md` still lists the chunker, BM25, the symbol graph and the self-model as "not built". The newer `docs/ai-platform-definitive/build-plans/codebase-knowledge-2026-08/README.md` (2026-08-29) says they are built and gives measurements, and the code exists under `src/index` and `src/symbols`.
- `packages/cube-rag/README.md` and PRODUCTION-RAG-GUIDE name OpenAI as the default encoder. `09-sota-pass-2026-08/03-REAL-WORLD-EVAL.md §6a` says the default was moved to `gte-modernbert-int8`, but those changes were uncommitted at the time.
- The retrieval quality gate is stated three ways. PRODUCTION-RAG-GUIDE says aggregate R@100 must be "equal or exceed" the prior index. `docs/mcp/17-METADATA-SEARCH.md §7.4` allows a 0.5 drop. The glossary harness (`07 §2.4`) blocks any category losing more than 2 R@10 points.

## 1. In-memory RAG (`packages/cube-rag`)

**How it works** (`docs/features/cube-rag-investigation/PRODUCTION-RAG-GUIDE.md`). The retriever is `C14GlossaryV2DecoupledBM25`. A query flows like this:

1. **Glossary expansion.** A fixed regex lookup (no model call) over `glossary-v2.json` adds up to 10 bullets to the query. The glossary has 1,581 terms from 21 outside sources.
2. **Dense search.** The *expanded* query is embedded and compared by brute-force cosine against every member vector (1,332 members then, 1,522 now; about 25 ms).
3. **Keyword search.** BM25 (k1=1.5, b=0.75; about 5 ms) runs on the *raw* query.
4. **Fusion.** The two ranked lists are merged with Reciprocal Rank Fusion (RRF), k=60, both lists taken to depth 2K.

The guide calls the split between steps 2 and 3 "the single most important design decision". Expansion helps dense search but hurts BM25, because long synonym lists distort its term-frequency math.

- **What it does not use:** no vector DB, GPU, reranker, LLM call at query time, background workers, or incremental indexing. A full rebuild takes about 35 s and costs about $0.13.

**Enrichment happens at index build time, not query time:**
- `cube-enrichments-v3.json` (about 88 KB) is produced by a two-pass script. Pass 1 writes a factual summary of each entity. Pass 2, with every other entity's summary in view, writes `explicitlyDoesNotContain`: pointers to the entity that should be used instead. That second pass is credited with winning 10 of 12 categories against the vendor's own AI.
- The v4 "time-aware" index appends natural-language time vocabulary ("last week", "by day of week") to the 170 time-type members. That alone moved R@100 from 49.79 to 55.70.

**Artifacts:** each encoder gets `indexes/<encoder>/{corpus.bin, manifest.json, model/}` plus the glossary and enrichments. Weights over 100 MB ship as brotli parts reassembled at startup. The manifest's `corpus.sha256` binds a corpus to the encoder that built it (a mismatch "does not throw, it returns numbers that mean nothing"). Files are committed (fallback) and published content-addressed to object storage; `PUBLISHED.json` records the served revision.

**Memory and latency (OpenAI encoder):** about 22 MB resident, about 260 ms p50 (about 225 ms of it the embed network call), under 500 ms p99, about 150 ms to boot, $0.000001 per query.

**Encoders compared** (2026-08, 1,522 members):

| Encoder | R@10 / R@100 | Warm embed | RAM increase | Disk |
|---|---|---|---|---|
| openai 3-large | 20.40 / 55.30 | 315 ms (about 2 s cold) | about 46 MB | 24 MB |
| gte-modernbert-int8 | 17.26 / 49.55 | 32 ms | about 640 MB | 123 MB |
| mxbai-xsmall-int8 | 13.53 / 45.47 | 5 ms | about 240 MB | 22 MB |

- **On real chat traffic the gap disappears.** Across 301 real turns, OpenAI scored R@10 23.2 vs 24.5 for gte-int8 on the dev split, and 10.7 vs 8.9 on the test split.
- **One encoder serves everything** (schema RAG, concept RAG, episodic memory), switchable live from an admin panel.

**Refresh and promotion gate:** snapshot → enrichment delta → candidate index → score on the reference set per category → promote by rename → smoke test. Gate: aggregate recall must not regress, no category may lose more than 8 points, every reference query returns a non-empty top-3.

**What worked:** splitting BM25 and dense inputs; time-aware enrichment; two-pass enrichment (+3.20 R@10, +2.45 R@100 over hand-written); weighted RRF (dense 0.7) +2.1 R@100; **query memory** (5 nearest past successful turns fused in with RRF: R@10 9 → 43, R@100 32 → 72 on held-out, their biggest gain); **view cards** (inject the full compact member list of the top 2 entities); the hint block cut LLM rounds by about 2.6 per answer.

**What did not work:** bulk LLM-generated glossary (one category 20.37 → 10.98 while the aggregate looked flat); stripping "boilerplate" from descriptions; WordNet/ConceptNet expansion (wrong senses); HyDE / multi-query rewriting (same quality, +2.5 s); 3-way RRF (−1.76); ensembling two dense encoders; cross-encoder rerankers (did not transfer to real traffic); widening K; raw cosine for sizing decisions; a synthetic test set that misrepresented production; a hint path wired but OFF in production.

## 2. Code and docs knowledge (`packages/code-knowledge`)

- **Snapshot:** files from `git ls-files -z`, never a filesystem walk; each file its own brotli block; a secret-scan hit fails the build.
- **Chunking:** about 1,000-token chunks with about 10 % overlap, each with a scope header. TypeScript split at top-level declarations (column 0; the repo is Prettier-formatted). Markdown split at headings, the heading path as scope header.
- **The corpus stores pointers, not text:** path, line range, scope header, tier; snippets are read from the snapshot, so the index never quotes text the file no longer contains.
- **BM25:** postings as typed arrays with delta + LEB128 varints (about 2 bytes per posting; about 20 MB instead of about 60 MB). camelCase identifiers also indexed as words. Very common terms pruned.
- **Hybrid search:** unweighted RRF k=60; every hit reports `matchedBy: lexical|dense|both`; a dense-only hit is a hypothesis and the tool text requires a read before the agent asserts anything from it.
- **Vector reuse on rebuild** by chunk content hash; refused if the encoder id or dimensions differ (dense encoding of 21,127 chunks would otherwise take about 368 minutes).
- **Symbol graph and PageRank:** from the TypeScript compiler's parse tree and a YAML parser, never regexes; CSR typed arrays; rank flows from mentioning file to defining file; uniform at build time (a tree tool) and topic-seeded per call (a map tool).
- **Measured:** corpus 16.5 MB / 20,338 chunks / 1–6 ms queries (lexical only); symbol graph 10.67 MB / 41,457 symbols / 3.9 µs lookups.
- **Memory budget:** about 85 MB bundle, about 75 MB RAM; tiers load lazily and are evicted after 30 idle minutes.
- **Staleness:** the commit a published set was built from must be an ancestor of the running tree (absolute) and at most 50 commits back; came from a real incident (answers served 129 commits stale). Refusal means "build a new one", never "serve nothing".
- **Doc registry** reads each doc's `> STATUS:` line from the preamble only, so a target spec is never quoted as current.
- **Evaluation:** held-out sets kept out of every snapshot by one list; a rubric judge whose "met" must quote checked text, blind to authorship; a pairwise judge with checked placement; Elo in closed form (null, never 1,000, with no games); cost reports with median, maximum and a distribution-free interval ("not measured", never $0); a four-layer contamination guard.

## 3. Agentic framework

- **Two kinds of capability:** read tools called mid-run (each declares `sideEffect`, `costClass`, a Zod input schema that may never include the tenant id) and **envelope actions** proposed only in the final JSON, each with description / usage / policy notes.
- **Lifecycle:** proposed → previewed (a truthful dry run) → approved → executed (or rejected / dropped). Execution re-checks authority, records an outcome and a rollback token, writes a ledger row and an entity-change revision.
- **Approval class:** an exhaustive, compiler-enforced record maps every action type to an approval class; a new type fails the build until classified.
- **Tool registry:** Zod schemas with `.describe()` become JSON Schema; a 15-line summary per message, full details on demand (`tool.describe`), `find_tools` loads more on top of a small core set; DB overrides merged over code defaults with a 30 s cache.
- **Structured envelopes:** v1 regex-parsed fenced blocks in prose leaked internals; v2 returns one JSON `{user_message, actions[]}` validated server-side; v3 adds a read-only `blocks` channel for UI surfaces.
- **Run loop:** PLAN / ACT / OBSERVE / EMIT, capped at 30 steps and $5 per run with a soft wrap-up at 60 % of the budget; a numeric-grounding guard re-prompts once if a number is stated without a query; a never-empty-turn rule.
- **Agent fleet:** 16 definitions, versioned and immutable per version, built from modular rules with allow-lists for tools, actions and sub-agents; tenant overrides can only tighten. Five single-purpose analysts were folded into recurring tasks of one general analyst.
- **Scheduling:** one leader lease (60 s TTL) runs tasks, hourly KPI measurement, daily maintenance; OFF by default.
- **Event bus:** one list of event kinds and one Zod union shared by backend emitter and frontend reducer; a spec test catches drift; **`emit` never throws**.
- **Interface-tool parity ("lens/lever"):** no UI-only consequential action and no chat-only capability; the per-action services reuse the UI write path. Measured three ways: a manual CRUD × interface × tool matrix; a spec that walks the REST metadata and fails the build on any unclaimed route (120 operations, 99 % coverage); a compile-time exhaustiveness check of the chat's capability overview.

## 4. Knowledge and memory

- The conversation id is minted client-side and the row registered at turn start (not in `finally`), so chats appear immediately; losing the connection does not cancel a run; each conversation stays on the engine that created it.
- Memory tiers: facts and preferences written only through human-approved actions; concepts promoted, never written directly; episodic memory opt-in with a hygiene critic screening for poisoning.
- Concept-RAG: scopes system / tenant / user; exact or alias match wins, then BM25 and dense (threshold 0.62) fused per scope, cap 8 per turn; prompt sentinels sanitised on write and read; on encoder change everything re-embeds and search runs BM25-only meanwhile.
- Context per request: standing rules and a capability block; on each user turn (plan phase only) learned concepts, schema hints (K=20, memory, cards), facts, preferences, episodic items, exemplars, attached files, each logged as its own event; history up to 40 turns, summarised at 12,000 tokens keeping the last 8 messages.

## 5. Notifications and email

- The bell is derived from reports, proposals and decisions, not run noise; per-user read state; sources isolated.
- Email: four system lists (two on by default); subscriptions store only deviations; filter chain master switch → per-agent → list; routing is best-effort and never throws; every send gets a signed unsubscribe link and `List-Unsubscribe`, audited; **master kill-switch default OFF** (content still saves and shows in-app).

## 6. Security and control

- Control ladder: reads → insight artefacts → writes (authority re-checked at execute) → outbound sends (two approvers + budget + do-not-contact + kill-switch) → agent authoring (admins only).
- Tenant isolation: the data layer injects the tenant id, tools cannot declare it; sub-agents inherit the parent's tenant; admin reads capped and audited; non-admins never learn admin tools exist.
- Audit: actions plus entity changes with a mandatory reason; the approved preview is exactly what executes; reversibility stamped by the system, never claimed by the model.
- Secrets: encrypted at rest, shown only as a masked hint; reveal-once operations deliberately kept out of chat; a secret scanner gates the build.
- Prompt injection: schemas and values kept out of the prompt body (test-guarded), sentinels sanitised.

## 7. Testing and observability

- About 210 specs; the load-bearing ones: cross-tenant leakage, emit-never-throws, the two-approver floor, tool contracts, the prompt-content guard.
- Gold sets graded by a validation command; only a live browser walk with screenshots counts as validated.
- Replay from stored run inputs; soft artefacts stored as evidence-pinned records.
- Cost: provider admin API spend with a daily-spike rule (watch the "cents trap": amounts in cents read as dollars over-reported 100×); a per-turn tokens / time / cost footer.
- One `recordTurn` bus that never throws; a read-only, audited admin chat viewer.

## 8. Recommendations for Lucid Total

**Take these mechanisms**
1. Hybrid search: dense on the expanded query, BM25 on the raw one, RRF k=60.
2. Enrich at build time (vocabulary, cross-entity "use X instead" pointers); no LLM call at query time.
3. Gate index promotion per category with a candidate-artefact workflow.
4. Bind corpus to encoder with a hash; publish content-addressed with a committed fallback.
5. Query memory from past successful turns fused into retrieval (their largest gain).
6. Store pointers, not text; reuse vectors by chunk content hash.
7. Expose `matchedBy` so dense-only hits are verified before being cited.
8. Enforce artefact currency (ancestor + distance); refusal means rebuild.
9. Keep read tools and consequential actions separate; actions only in a typed envelope.
10. Preview before approval; approve exactly what was shown; re-check authority at execute.
11. Compile-time exhaustiveness for approval class, preview surface and capability overview.
12. One event schema shared by server and client; emit never throws.
13. Every outbound channel off by default with its own kill-switch.
14. Held-out eval sets kept out of every store; blind, evidence-checked judges.
15. Progressive tool disclosure; hide admin tools from non-admins entirely.

**Avoid these**
1. A synthetic eval set that does not match production; re-extract from real traffic.
2. Bulk LLM-generated synonyms; judge per category, never the aggregate alone.
3. Repairing problems before measuring them.
4. Metric defaults that flatter (Elo 1,000 or $0 when nothing was measured).
5. Permissive approval defaults on secondary paths.
6. Built-but-unreachable features (wired but off, missing from an allow-list).
7. Writing the conversation row in `finally`, or treating a disconnect as a cancel.
8. Regex-parsing actions out of prose.
