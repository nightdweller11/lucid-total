# Lucid Total — Testing and Quality

> How we know Lucid Total works: the test pyramid, the parity tests that keep "anything the UI can do, the AI can do" true, the mandatory walkthrough on desktop and phone, the AI evaluations, and the quality figures that always travel with cost and performance. Binding for every task; inherited from Lucid Chat's `docs/14` and adapted to a web management system.
>
> **Created:** 2026-10-28 · **Status:** v1 draft.

---

## 1. Principles

1. **Nothing is done without seeing it work**: every user-facing change is walked through in a real browser at desktop and phone widths, in Deep Blue and Sky Glass, LTR and RTL, with screenshots attached to the task's evidence in Lucid Total itself.
2. **Parity is tested, not promised**: a capability that exists in the UI without a registered action, or an action without a tool, REST route or UI entry, fails the build or the parity suite.
3. **Quality, cost and performance together**: every AI eval figure is reported with its cost and latency (Lucid Chat rule L495); every backend change on the event path carries a load figure.
4. **Local first**: the whole verification graph runs on the development machine at every merge; the nightly backstop runs in the Railway `ci` environment; no GitHub Actions.
5. **Held-out means held out**: eval sets live in `tests/evals/heldout/` and are excluded from every index and snapshot by one list the knowledge builder enforces.

## 2. The pyramid

| Layer | Tooling | What it covers | Where |
|---|---|---|---|
| Unit | Vitest | Schemas, registry invariants, propagation engine (fixtures with expected deltas), priority model, scene layout stability, hull geometry, BM25/RRF, envelope crypto (vectors), settings resolver, i18n catalogs | each package |
| Integration | Vitest against the Railway dev Postgres and bucket (`LUCID_TOTAL_TEST_SERVICES=external`; one suite at a time across worktrees) | Action layer transactions (preview → apply → undo), outbox delivery and retries, event feed resume, imports, connectors with stubs, SSO adapter with a fake issuer | `apps/server/test/integration` |
| Contract | Vitest + OpenAPI validation | REST routes vs the registry's generated spec; MCP tool list vs the registry; webhook payloads vs the event union | `tests/contract` |
| **Parity** | custom suite | (a) every registered action has a permission class, preview, rights and usage text (compile-time record); (b) every REST route and MCP tool resolves to a registered action and every action appears on both; (c) every UI action menu entry, command-bar command and slash command resolves to a registered action; (d) every registered non-admin action is reachable from at least one UI surface (the walkthrough map lists where) | `tests/parity` |
| E2E | Playwright, Chromium and WebKit, viewports 1280×800 and 390×844, both themes, `dir=ltr` and `rtl`, reduced motion and high contrast once per phase | The flows in §4; axe-core scan with zero serious/critical violations | `tests/e2e` |
| AI evals | `tests/evals` runner (held-out sets, blind judges, replay) | Retrieval recall per category, chat citation precision, triage accuracy, change-set proposal correctness, briefing rubric, evidence-check agreement with human verdicts | `tests/evals` |
| Load | k6 | Event feed fan-out, action apply throughput, scene computation at company sizes (1k, 10k, 100k items), index query latency, outbox lag | `tests/load` |
| Security | Vitest + scripts | Cross-tenant isolation (every query under a second tenant returns nothing), **cross-compartment isolation** (every query under each compartment template returns nothing outside it; the external view's assistant cannot retrieve or act outside the compartment), **field-level encryption invariants** (no plaintext `payroll` value in any table, log, index, export or recorded prompt), **audit chain verification**, rights refusals per permission class, envelope ciphertext-only invariants (no plaintext in any table, log or index), prompt-content guard (no schema or setting values in free text), secret scanning | `tests/security` |

## 3. Attention, scenes and the world (added 2026-10-28, T25)

- **Attention test** (`docs/13` §14): every walkthrough of a scene or screen records (a) the focal subject named by the reviewer and the seconds it took, (b) the count of things that need the viewer, counted without reading, (c) the validator's element and number counts. A screen fails above three needs-you items, twelve text elements above body size or seven numbers on a glance screen, in any theme, direction or device.
- **Scene validator suite** (`packages/scene`): schema conformance for every catalogue component; data re-read (every bound number equals a fresh query); staleness refusal; rights and compartment filtering (a scene composed for a party never contains a field outside their compartment, fuzzed); attention budget arithmetic; renderer parity (desktop, phone and image renderers show the same data; snapshot tests per theme and direction); accessibility form present (spoken summary and list equivalent) for every component.
- **World tests**: layout stability (the same model and perspective yield the same positions; adding a place moves nothing else beyond its neighbours); identity (every place has name, subject, glyph, hue, landmark); facades (an item with a product renders its expected and actual facades; criteria ring segments match criteria); reveal continuity (sub-place contours at the parent depth match the sub-map at the child depth); phone (one place per screen; no desktop layout below 480 px).
- **Fork and Refocus tests**: consequences drawn equal the propagation engine's delta for the same change set (property-based over fixtures); the transparency strip lists every moved date, load change and spend change; apply then revert returns the model to its baseline; prediction kept with the applied change set.
- **Composer evals** (`docs/06` §11): a scene set of fifty requests per viewer type with graded outputs (right focal subject, right components, budget respected, numbers correct); re-composition requests ("simpler", "as a timeline") graded; cost and latency per class reported with quality, always together.
- **Self-operation tests** (`docs/14`): injected faults (a failing component, a slow query, a stuck agent) produce the expected signal, issue and, where the class allows, repair proposal; the regression rule drops a level on an injected incident; the budget cap stops self-builds.
- **Channel tests** (`docs/15`): the channel ceiling suite (no class above the channel's assurance applies), the forwarded-token refusal, dedupe across surfaces, the quiet-line cadence, and the compartment filter on every outbound message.

## 4. Definition of Done (every task)

1. Scope matches the task card; deviations listed with reasons.
2. Contracts (registry, event union, REST, settings schema) changed only through a lead-approved change request and versioned.
3. Tests: unit for logic; integration for anything touching Postgres, the bucket, the outbox or a connector; contract and parity suites green; evals for prompt, playbook or retrieval changes; load figure for event-path changes; **the suites your change reaches, not only your own files**.
4. **Walkthrough** (§4) with screenshots or video attached as evidence on the task; the per-criterion statuses proposed and confirmed.
5. Docs updated in the same change (`docs/0x`, `docs/api/`, mechanism docs, runbooks); a new mechanism gets a mechanism doc from the template.
6. Security: no secrets or `restricted` content in logs or prompts; threat model touched if a boundary moved; a new external service has a written Railway-first case in `docs/12`.
7. Observability: new paths emit the standard metrics.
8. Flags: user-visible behaviour behind a flag with a rollout note; migrations expand-then-contract.
9. The task card in Lucid Total carries state, evidence and follow-ups (the checklist row rule, moved to the product).

## 5. The walkthrough protocol (mandatory UI validation)

- **Platforms:** Chromium desktop (1280 and 1920 wide), Chromium phone emulation (390 wide, touch), WebKit at both (Safari parity), and once per phase a real phone browser (iOS Safari and Android Chrome on the Lucid Chat emulators or devices) for the map's touch gestures and the envelope windows.
- **Passes per flow:** Deep Blue and Sky Glass (Aqua Dusk once per phase); LTR and Hebrew RTL; reduced motion; high contrast once per phase; keyboard-only once per phase; screen reader spot checks (VoiceOver on the Mac) for the map's list equivalent and the inbox.
- **Flows (Phase 0 set):** sign in (bootstrap); board → collapse to lines → item page → Expected vs Actual → comment with a feedback request → apply to card → history; create a task from the command bar and from the chat; dependencies tab with a cycle refusal; inbox: decide one material decision; agents live with a stale line; chat: ask with citations → preview → confirm → undo; import review; settings: change a cadence. Phase 1 adds notifications and email drafts, envelopes (seal and reveal, one-time), SSO sign-in, the ask card (raise → route → decide → asker sees the outcome), a virtual party's correspondence thread; Phase 2 adds the map at Z0–Z3 with embassies, perspectives, what-if, meeting mode, timeline, graph, the external view walked through as a party (contractor template) with a cross-compartment attempt refused; Phase 3 adds payroll-class fields (encrypted, read-audited), the company scale change with its preview, and the board compartment.
- **Automation:** Playwright flows under `tests/e2e`, screenshots per step per theme and direction, stored with the task's evidence (a walkthrough report from the template: what was exercised, what was seen, defects found and their follow-up items).
- **Agent exploratory pass:** a worker on a different model than the builder walks the feature without the script and reports surprises.
- **Evidence:** screenshots and videos go to the bucket through the evidence endpoint and show on the card; the Phase gate report links them.

## 6. AI evaluation

- **Sets (held out):** retrieval (queries per category: items, decisions, docs, code, with expected sources; re-extracted from real assistant traffic each month, never only synthetic), chat (questions with expected citations and forbidden claims), triage (cases with expected kind, severity, owner), change sets (decisions with expected derived changes and deltas), briefings (samples with a rubric), evidence checks (items with human verdicts).
- **Judges:** deterministic where possible (recall, citation precision, exact class); a blind rubric judge for prose whose "met" must quote text that is checked against the output; pairwise comparison with placement checks when comparing prompts or models; never a default score when nothing ran.
- **Reporting:** per category, never only the aggregate; with cost (tokens and dollars) and latency (p50, p95) in the same table; a cascade view per playbook (which model class passes at what cost) so autonomy and model choices rest on figures.
- **Promotion gates:** retrieval index (no category regresses beyond tolerance; every reference query non-empty top-3); playbook prompt changes (no category regresses; cost within budget); model class change for a playbook (passes its set at the new class).
- **Replay:** recorded runs replay against a new prompt or model without re-issuing side effects; the run recorder stores inputs and tool results by pointer.

## 7. Performance budgets

Board, list and map interactions under 100 ms on cached data (measured in Playwright traces); item page under 500 ms; search under 300 ms; scene computation under 200 ms for 1k items and under 1 s for 100k with clustering; assistant first token under 1.5 s; outbox lag under 5 s at p95; SSE resume without loss. Regressions over 10 % at p95 block merge.

## 8. Quality figures shown in the product

Lucid Total shows its own quality: eval results, cost per day by agent and model class, acceptance rate of suggestions per playbook, parity coverage, walkthrough coverage per release, and the open defects, as views on the Lucid Total program. The Quality page of Lucid Chat's status site becomes a view here.
