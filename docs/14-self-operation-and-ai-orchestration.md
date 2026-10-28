# Lucid Total — Self-Operation and AI Orchestration

> How Lucid Total runs itself: it observes, repairs and improves itself with the same items, actions and agents it offers the company, orchestrates every AI process, routes work across model tiers, and widens its own autonomy only as trust is measured and confirmed. Realises the owner's instruction of 2026-10-28 (to be logged in `docs/12`): "this is an operating system, not a reporting system." Derives from `docs/00` (principles 2, 13, 14, 17), `docs/02` §2.7 and §7, `docs/05`, `docs/06`, `docs/08` §5, `docs/09`; the Stage is defined in `docs/13-experience.md`.
>
> **Created:** 2026-10-28 · **Status:** v1 draft.

---

## 1. The operating system, made literal

A reporting system shows what happened; an operating system owns resources, runs processes, enforces permissions, schedules what is scarce, watches and updates itself. Lucid Total is the second.

| OS concept | Lucid Total mechanism |
|---|---|
| **Kernel and system calls** | The company model, the action registry (preview → apply → undo, rights, permission classes; every surface calls the same actions) and the event log with its integrity chain (`docs/05` §4.2–4.3, `docs/07` §4) |
| **Processes** | Work in flight, human and AI: a task in `doing`, a chat run, a playbook run, a monitor, a Claude Code session; one process table (§6.1) |
| **Scheduler** | Priority (`docs/02` §6.4), attention (one material decision at a time, cadences, quiet hours) and capacity (people's hours, worker slots, rate limits, budgets) |
| **Signals and interrupts** | Pause, resume, kill and re-prioritise as actions; alerts only on state changes that matter (§3.4) |
| **Memory** | The knowledge index and per-turn context assembly; query memory as the cache (`docs/06` §4–§5) |
| **File system** | Product repositories, evidence, documents and attachments, addressed by item |
| **I/O and drivers** | Channels (email, Lucid Chat, push, webhooks) and connector adapters, each with a stub, a status card and a kill-switch (`docs/08` §6) |
| **Permissions** | Rights, permission classes, compartments, sensitivity classes and the autonomy ladder |
| **Shell** | Chat and voice |
| **Window manager** | **The Stage**: the AI composes what is shown from a validated component grammar (`docs/13`) |
| **System monitor** | Self-observation and the System place on the map (§2–§3) |
| **Package manager** | Subsystems (scene components, connectors, monitors, playbooks) specified as items and built and installed through Claude Code (§9) |
| **Updates** | The self-repair and self-improvement loops with staged deploys and rollback (§4–§5) |
| **Daemons** | Proactive agents and monitors on the scheduler's leader lease (`docs/06` §7) |
| **Init** | Bootstrap (owner account, service accounts, seeded items) and the **company scale**, which sets which daemons start and at what level (`docs/02` §2.8) |

"The Stage" (the composed view) and "company scale" (the init setting) are different things; the interface always says "company scale" for the latter.

## 2. The system is its own first tenant

### 2.1 The System place

Lucid Total appears in its own company model as a grouping of a new kind, `system`, named **System**, drawn as a region at the edge of the map beside Engineering. Its sub-places are groupings of kind `subsystem`: `api`, `ai`, `worker`, `scene` (with the Stage's grammar), `knowledge`, `channels`, `connectors`, `importer` and `data` (Postgres, bucket, backups, audit chain).

Each subsystem shows **health** (§3.3), **cost** (today and 30 days, by model class), **open issues** and **being built** (tasks whose `affects` relation points at it). Building Lucid Total stays a program in Engineering; the System place is the running thing.

### 2.2 Same tools, same rules

Everything here creates ordinary items through the action registry, under a service account of kind `system` (agent `lt-system`) acting for the operator role (the owner at the `founders` scale): an incident about itself is an `incident`, a repair a `task`, a threshold change a `proposal`, a learning a `lesson`, enabling Fable a `decision`. The parity suite covers these actions; the system is bound by the same rights, budgets and ladder levels as any agent.

For a second company (Phase 4), its tenant sees its own System place; code repairs route as asks to Lucid's tenant, never into the customer's.

## 3. Self-observation

### 3.1 What is measured

Signals carry no item bodies, comment text, prompts or secrets (`docs/05` §9). Every threshold is a setting; the defaults:

| Signal | Source | Default threshold |
|---|---|---|
| Availability | `/readyz` per role every 30 s; Railway deploy and crash events | failing after 3 misses |
| Latency p95 | action layer, retrieval, scene, first token (`docs/09` §7) | 110 % of budget for 15 min |
| Error rate | faults (not refusals) per action family | 2 % over 10 min |
| Queue age | outbox oldest unclaimed, parked rows, scheduler lag | p95 lag > 5 s; any parked row |
| Cost per day | gateway usage by model class, agent, process | 80 % of the daily share of the monthly budget |
| Eval scores | nightly eval runs per set and category | any category below its promotion floor |
| Scene validation failures | the Stage's grammar validator | 1 % of compositions per hour |
| Retrieval misses | empty top-3; "not found" followed by success on reformulation | 5 % of turns per day |
| Agent stuck or aged | heartbeats; runs over wall-time budget | 3 missed heartbeats |
| Data staleness | index behind main; connector last-event age | currency rule (`docs/06` §4.6); 24 h |
| Notification delivery | outbox outcomes, bounces | delivery < 98 % |
| Audit integrity | daily chain verification | any mismatch (security incident) |
| **Friction** | content-free client events: abandoned previews, the same intent asked twice in a day, edits after an AI apply, undo rate, "not what I meant" | per-feature baseline + 50 % |

Friction is measured per feature, never as a per-person score (the T15 rule applies to the system's own users).

### 3.2 Where it lives

Monitors are deterministic checkers on the `worker` role, listed in the process table. Time series live in a Postgres `signals` table (minute and hourly rollups); no external metrics service (Railway-first). Costs come from `runs` (§6.4), never estimates. Friction events carry only the action name and flow step.

### 3.3 Health roll-up

Each subsystem is `ok`, `degraded` (a signal breached), `failing` (a critical signal failing) or `unknown` (a monitor silent for twice its interval); System takes the worst, with counts, shown as the region's tint and glyph on the map, a tile on the operator's Horizon and the System card's first line. Healthy looks as calm as healthy work.

### 3.4 Alert policy

Quiet by default: only a transition into `failing`, a breached budget, an audit or security signal, or a process stuck past its escalation setting interrupts anyone. Breaches must hold for their window and recoveries for a hysteresis window (default 10 min); monitors dedupe by (subsystem, signal, cause hash) into one incident per cause; sev-1 (data, security, total outage) pages the on-duty person even in quiet hours, sev-2 lands in their inbox at once, sev-3 waits for their cadence. `degraded` shows on the map and in the briefing, never as a notification.

## 4. The self-repair loop

### 4.1 The loop

| Step | What happens | Recorded as |
|---|---|---|
| **Detect** | A signal fails, a validator fails repeatedly, or a person reports | `incident` or `bug` in the subsystem |
| **Diagnose** | A `strongest` run reads the incident, events, logs by id, traces, recent deploys and code through the index; proposes a root cause with citations | `diagnosis` comment |
| **Propose** | A repair `task` with fix plan, repair class, cost, risk, blast radius and the effective ladder level (§8.2) | `task` with `repair_class`, `spawned_by` the incident |
| **Build** | Code: a Claude Code session in its own worktree from a generated brief (§9). No code (retry, rollback, settings revert, data fix): the action runs as a change set | `build` run on the task |
| **Verify** | Tests the change reaches, evals, a walkthrough if user-facing, the signal reproduced against the fix | Evidence; criteria statuses |
| **Deploy** | Railway `staging`, a soak window, then `production`; automatic rollback if a critical signal degrades within the watch window | Deploy events on the release item |
| **Confirm** | **The monitor that detected the problem** reports the signal cleared for the confirmation window; the incident closes with its implications (what changed, what was affected, what it cost) | `resolved` → `verified` |
| **Learn** | A `lesson`; a threshold-tune `proposal` if detection was late or noisy; a level proposal if the class recurs | `lesson`, `proposal` |

A repair not confirmed within its window reopens the incident one severity higher.

### 4.2 Repair classes

The default level is the starting setting; the ceiling is the highest level the trust mechanism may ever propose for the class.

| Repair class | Typical fix | Default | Ceiling |
|---|---|---|---|
| Failed job (outbox, connector sync, import step) | Retry with backoff; dead-letter after N | `run` | `run` |
| Model provider fault | Fallback class from the routing table; notice | `run` | `run` |
| Config drift (settings or Railway variables vs the last known-good manifest) | Revert to known-good | `inform` | `run` |
| Data inconsistency (orphans, broken relations, alias collisions, index drift) | Change set; index rebuild | `inform` | `run` |
| Prompt regression (a category below floor after a prompt change) | Roll back to the last passing version | `inform` | `run` |
| Scene component bug | Disable the variant (the Stage falls back to the plain form); the fix at `confirm` | `inform` | `inform` |
| Flaky test | Quarantine with expiry and follow-up item; the fix at `confirm` | `confirm` | `inform` |
| Dependency patch or minor | Bump with the L390 checks, verify, deploy | `confirm` | `inform` |
| Dependency major | Proposal with peer-support analysis | `suggest` | `confirm` |
| Performance regression | Diagnosis and proposal | `suggest` | `confirm` |
| **Security-sensitive** (auth, rights, compartments, envelopes, encryption, audit chain, data-terms routing, the action layer, the trust mechanism) | Proposal with a second-model review | `suggest` | `confirm` |

### 4.3 Guardrails

- **Invariants in code**, not settings (changing them is a reviewed code change): security-sensitive changes never deploy without a person; the system never changes its own rights, ceilings, trust weights or ladder levels; destructive migrations, key rotations and audit-chain operations are never self-initiated.
- **Budgets and rate of change**: self-repair spend and build sessions per day; at most 2 self-initiated production deploys a day, one in-flight repair per subsystem, freeze windows on gate and submission days.
- **Kill switches**: self-repair as a whole, per class, per subsystem; the company-wide AI pause stops all of it.
- **Two strikes**: a class rolled back twice within its window drops one level, with a notice.

## 5. The self-improvement loop

Repair restores; improvement raises the bar. Inputs are measured: lagging eval categories, feedback on AI outputs, usage, corrections (briefings edited before forwarding), time-to-decision per decision kind, attention cost (notifications per person and the share acted on), escalation rates between model classes.

**The improvement backlog** is ordinary `proposal` items targeting a process, playbook, prompt, scene composition, setting or subsystem, each with its triggering signal, expected gain, cost and measurement plan, ranked by gain × reach ÷ cost (weights are settings). A weekly improvement review (composed at `run`) puts the top proposals before the lead; material ones reach the owner one at a time.

**Experiments.** Prompt versions and scene compositions run as A/B variants (by run for agents, by stable viewer hash for scenes) with sample size fixed in the proposal, judged on the held-out set and on live acceptance, correction and friction; promotion only through the `docs/09` §6 gates; the result becomes a `lesson`.

**The quality page is a scene** composed by the Stage: quality with cost and latency per playbook and class (L495), the trust map, open repairs, and **where it works well**, as prominent as where it breaks: streaks ("briefings: 14 days without a correction"), classes running clean, money saved by routing down. Strengths are the evidence that raises a level.

## 6. AI process orchestration

### 6.1 The process table

Every unit of work in flight is a row. AI runs, monitors and build sessions are `runs`; human work derives from items in `doing` and working lines.

| Field | Meaning |
|---|---|
| `id`, `kind` | `chat` · `playbook` · `monitor` · `diagnosis` · `build` · `review` · `validator` · `import` · `connector_sync` · `human_task` |
| `actor`, `on_behalf_of` | Agent or person, and whose rights apply |
| `model_class` | §7.1, or none |
| `owner_item`, `parent` | The item served (every AI process has one) and the spawning process |
| `state` | `queued` · `running` · `waiting_person` · `waiting_dependency` · `validating` · `done` · `failed` · `parked` · `killed` |
| `priority` | From the owner item and the attention class |
| `started`, `heartbeat`, `last_change` | Liveness and the last working line |
| `cost`, `budget` | Dollars and steps against the run's budget |

The Agents live view (`docs/02` §5.6) renders the running rows.

### 6.2 Scheduling, budgets and attention

- **Queues per kind** with concurrency limits (settings, §11.1), ordered by priority then age; build sessions are bounded by the coordinator's worker slots (L102); `waiting_person` frees its slot.
- **Budgets** per run, agent-day, kind-day, domain-month and company-month (T-O2), enforced in the gateway: soft wrap-up at 60 % of a run, hard stop at 100 %; a domain's AI processes pause with a notice when its month is spent.
- **Attention is scheduled**: a process needing a person's answer queues behind that person's interrupt budget unless sev-1; the owner's material decisions are released one at a time.

### 6.3 Retries, dead letters, signals

Failed runs retry with backoff (3 by default per kind), then `parked`, visible in the System place; parked runs above a count open an incident. Pause, resume, kill and re-prioritise are registered actions (`process.*`), `admin` for others' processes and `reversible` for one's own; killing a build releases its worktree slot.

### 6.4 Runs as records

`runs` generalises `agent_runs` (`docs/05` §4.6): inputs by pointer, model class, tool calls with previews and outcomes, outputs, validator results, evidence, cost, latency, prompt and scene versions; replayable without side effects (`docs/09` §6); expected (the owner item's acceptance) beside actual. Reporting stays quiet: working lines at start, meaningful change and finish (`docs/08` §5.3); healthy monitors post nothing.

### 6.5 Oversight: validate, confirm, follow up, maintain

| Output class | Validate | Confirm result | Follow up / maintain |
|---|---|---|---|
| Model change | Schema, rights, referenced ids exist, no cycle | Re-read after apply | Reminders on created items; sweeper |
| Outbound message | Recipients inside compartment; sensitivity | Delivery receipt; reply threaded | Re-check for an answer at the follow-up date |
| Document or brief | Required sections; citations resolve | File exists and matches the item | Citations re-verified monthly |
| Scene composition | Grammar; every number bound to a query | Rendered without fallback | Re-validated on grammar change; weekly if pinned |
| Code change | Tests, evals, walkthrough, review session | Merge commit, deploy, the target signal moves | Follow-ups for findings; dependency and flake watch |
| Connector, monitor or setting | Stub contract or schema; dry run or preview | First real event mapped; resolved document served | Last-event age daily; effect measured at its window |

High-impact outputs (settings: material, outbound to parties, spend, large change sets, security-sensitive code) add a **second-model review** on a class other than the producer's; irreversible actions confirm with a person at any level. A validator failure blocks the output, records the reason on the run and counts against the cell's trust (§8.1).

## 7. Model tiers and routing

### 7.1 Classes

`local` (in-process ONNX encoders and small classifiers; nothing leaves the server) · `fast` · `standard` · `strongest` · `fable` (owner-enabled) · `vision` (screenshot checks in walkthrough evidence, mapped onto an image-capable class) · `code` (the Claude Code build profile, §9). Model ids live only in `settings.ai.models` (`docs/06` §3); product code names classes.

### 7.2 Routing

Routing is a setting: task class → default class, escalation path, data constraint, eval set.

| Task class | Default | Escalation |
|---|---|---|
| Classify, dedupe, route | `local` → `fast` | `standard` |
| Inbound triage | `fast` | `standard` → `strongest` |
| Briefing, scene composition | `standard` | `strongest` |
| Change-set proposal, diagnosis | `strongest` | `fable` if enabled |
| Second-model review | a class other than the producer's | — |
| Build | `code` on the `strongest` mapping | `code` on `fable` for core and security work |

**Escalation**: when a validator fails, the run retries once at the next class (at most two escalations, within budget); both attempts are recorded. **Measured outcomes** per task class (pass rate, escalation rate, cost, latency) drive proposals: escalation above 30 % over 7 days proposes raising the default; a lower class passing the eval set at equal quality proposes routing down, with the saving shown. Cost appears on every run and as a daily series by class. Build sessions never use the `standard` mapping (L363).

### 7.3 Settings → Models, and Fable as a decision

Settings → Models shows, per class: **capability** (eval scores per task class served, dated), **speed** (p50 and p95), **cost per typical task** (a briefing, a triage, a diagnosis, from real runs), **data terms** (zero data retention, or retention at the provider: 30 days for Fable), **allowed data** (`docs/07` §6b: `restricted` and `payroll` reach no model; `sensitive` reaches only ZDR classes in cleared threads; `normal` any enabled class), **used by default for** (routing entries and build profiles) and **state** (enabled by whom, when, with the decision item).

**Enabling Fable is a `decision` item** (T26 in `docs/12`: the former owner question T-O1 became this mechanism) whose card carries that row plus the monthly cost at current usage and the routing entries that would change; only `normal` data reaches it (enforced by the routing filter). It is reversible (disabling re-routes its entries to their fallbacks at once) and logged. Adding any model, provider or class follows the same path.

## 8. Autonomy maturity

The ladder (`observe · suggest · confirm · inform · run`) is set per process in `docs/02` §2.7. This section is the mechanism by which it climbs and falls.

### 8.1 The trust score

Trust is computed per **cell** = (domain × action class), where action classes group registered actions by effect (item hygiene, follow-ups, triage, outbound to parties, priority change, settings change, spend, data repair, code repair by class, deploy). Components, over a rolling window (default 60 days):

| Component | Measure |
|---|---|
| Acceptance | Share of the cell's suggestions applied unchanged |
| Error and undo | Share undone, corrected after apply or tied to an incident (inverted) |
| Validator pass | Share passing validation first time |
| Model fitness | The routed class's eval score on the cell's task classes |
| Integration depth | Share of the domain's expected connectors live and its data covered |
| Evidence quality | Mean evidence grade of outputs (`docs/10` §3.3) |
| Time in operation | Runs and days at the current level, saturating |

The score (0–100) is a weighted sum (weights are settings), computed only above a minimum sample (default 20 runs); below it the cell shows "not enough evidence".

### 8.2 Advancement and regression

**Effective level** of an action = the lowest of the process's level, the cell's level, the permission class's ceiling, the repair class's ceiling (§4.2) and the company scale's cap. Irreversible actions always confirm.

**Advancement only by proposal and confirmation.** When a cell meets its next step's thresholds, the **trust watcher** (weekly, `suggest`) files a `proposal` with a preview: the actions that would stop asking, their volume last month, the cell's figures, and what would trigger regression. The domain's role holder confirms; a step to `run`, and any step in Leadership, Finance, People or Legal, is material and goes to the owner.

| Step | Default thresholds |
|---|---|
| `observe` → `suggest` | 20 runs, score ≥ 50 |
| `suggest` → `confirm` | 40 runs, score ≥ 65, acceptance ≥ 70 % |
| `confirm` → `inform` | 80 runs, score ≥ 80, undo ≤ 5 %, validator pass ≥ 95 % |
| `inform` → `run` | 150 runs over ≥ 30 days, score ≥ 90, no sev-1 or sev-2 in the cell for 30 days |

**Regression is automatic, with notice.** A sev-2 attributed to the cell, an undo rate above twice its step's threshold, or two validator-failure streaks drop it one level at once; a sev-1 drops it to `suggest`. Restoring is a fresh proposal. Decisions that define the company (strategy, money above thresholds, people, legal commitments; `docs/00` principle 14) carry a `suggest` ceiling until the owner raises it per decision kind.

### 8.3 The trust map

A **Trust** layer on the map tints each region by its cells: runs alone, informs, asks, suggests, observes only. Selecting a region lists its cells with score, level, the gap to the next step and the last regression. It answers "where does the system already run the company" at a glance.

### 8.4 Worked example: Lucid

**Founders scale (now).** Engineering and System are rich in data (GitHub, Railway, the coordinator, 2,400 imported rows); other domains are thin.

| Cell | Level | Why |
|---|---|---|
| System × failed job retry | `run` | Deterministic, reversible, high volume |
| Engineering × item hygiene | `inform` | Long history; acceptance measured on the import review |
| Engineering × reminders and follow-ups | `inform` | `docs/02` §2.7 default |
| Engineering × flaky test repair | `confirm` | New class, few runs |
| System × dependency patch bumps | `confirm` | Checks automated; deploy needs a tap |
| Support × triage | `suggest` | Few inbound issues |
| Finance × anything | `observe` | No accounting connector: integration depth near zero |
| Marketing × outbound to parties | `suggest` | Outbound class, no history |
| Leadership × decisions | `suggest` | Ceiling |

**Growing scale (illustrative: 20 people, accounting and support connectors live).** Support × triage (400 runs, 92 % acceptance) moves to `inform` on the head of support's confirmation; Finance × invoice categorisation reaches `inform` once the accounting connector raises integration depth; Engineering × flaky tests and patch bumps reach `inform` (deploying without a tap if T-O6 allows) and item hygiene `run`; Sales × customer follow-up emails sit at `confirm`; Leadership × decisions stays at `suggest`. A sev-2 from an automatic categorisation drops that cell to `confirm` with a notice; it climbs back only by a new proposal.

## 9. Claude Code integration

### 9.1 The build path

A `task` with a **build profile** (target repository: Lucid Total, Lucid Chat or another product; kind: feature, repair, subsystem, connector, scene component, monitor, playbook; model class: `code` or core; walkthrough and review required) becomes a Claude Code session. The coordinator protocol (`docs/08` §5) gains six steps:

9. **Build queue.** `ready` tasks with a build profile queue by priority; the coordinator pulls them as worker slots free.
10. **Brief generation.** Lucid Total generates the brief with its context pack (§9.2); the lead reviews it and its hash is recorded before launch.
11. **Session.** One worktree per task; one worker service account per slot, rights limited to its item; working lines and evidence as in steps 3–4.
12. **Review.** A second session on a different class reviews against brief and evidence (`docs/09` §5); findings become comments or `spawned_by` follow-ups.
13. **Merge and deploy.** The lead merges (merges stay `observe` for the system, `docs/02` §2.7); deploys follow §4.1's staged path.
14. **Confirm.** Before `done`, the expected outcome is checked after deploy: the signal moved, the component validates, the connector receives events.

### 9.2 The context pack

Goal and acceptance criteria; related items (parents, blockers, siblings, the incident and its diagnosis); the decisions that constrain it; governing documents and sections (index citations); code pointers (files, symbols, lines); mocks and grammar entries for UI work; the tests and walkthrough the template requires; cost estimate and budget. A pointer that does not resolve refuses the brief.

### 9.3 Building the system and the products

The same path builds Lucid Total's own subsystems (a scene component with grammar entry and validator cases, a connector with stub and kill-switch, a monitor, a playbook with its eval set) and the company's products (Lucid Chat, later others). The package-manager view lists installed subsystems with version, owner item, health and install evidence.

### 9.4 The system proposes its own next build

From the improvement backlog and recurring repair classes, bounded by settings: each proposal links a measured signal; at most 2 open and 20 % of build slots and AI budget; it enters the queue only when the lead accepts it (the owner if material); none touches rights, ceilings, the trust mechanism, envelopes or encryption.

## 10. Phasing and acceptance

| Phase (`docs/11`) | What exists | Acceptance |
|---|---|---|
| **0 · Bootstrap** | System place and subsystems; `runs` with cost for every AI call; the process table behind Agents live; parked outbox and lost scheduler lease file incidents; build-profile fields on tasks | Every AI call in the gate's two waves has a run with cost; a forced outbox failure files exactly one incident in System |
| **1 · The AI runs the operation** | Monitors and `signals`; health roll-up and alert policy; validators on every output class; routing with escalation; Settings → Models; brief generation; review sessions | **The system detects and files its own incidents**: of 10 injected faults, ≥ 9 filed within 5 minutes, deduped, none paging outside policy; one wave built entirely from generated briefs |
| **2 · Map and decisions** | Railway connector deploy events; staged deploy and rollback; the full repair loop; trust scores and the Trust layer (display only) | **One repair class (config drift or prompt regression) runs at `inform` end to end** with evidence: detect, repair, deploy, the detecting monitor confirms, lesson filed |
| **3 · Company-wide** | Trust watcher proposals and automatic regression; three repair classes at `inform`; A/B of prompts and scenes; maintenance re-verification; the quality scene; self-proposed builds | Two cells advanced by confirmed proposal with their figures; one regression drill passes; a month of self-proposed builds within bounds |
| **4 · Product** | Per-tenant System places and trust maps; vendor-side repair routing | A second tenant's incident routes to Lucid's tenant with no data crossing |

## 11. Settings and decisions

### 11.1 Settings

All per tenant, versioned, changed through a previewed action (`docs/05` §4.8).

| Setting | Default |
|---|---|
| `selfop.monitors.<signal>.{threshold,window,hysteresis}` | §3.1; 10 min hysteresis |
| `selfop.alerts.{severity_routes,interrupts_per_person_day}` | sev-1 page, sev-2 inbox, sev-3 cadence; 3 |
| `selfop.signals.retention` | minute 30 d, hourly 13 months |
| `selfop.repair.<class>.level` | §4.2 default column |
| `selfop.repair.{deploys_per_day,inflight_per_subsystem,freeze_windows}` | 2; 1; gate and submission days |
| `selfop.repair.{soak_window,confirm_window}` | 15 min; 30 min |
| `selfop.repair.{budget_day,kill_switch.<class>}` | 10 % of the daily AI budget; off |
| `orchestration.concurrency.<kind>` | build 4 (max 6), playbook 2, eval 1, diagnosis 1 per subsystem |
| `orchestration.retries.<kind>` | 3, exponential backoff |
| `ai.routing.<task_class>` | §7.2 |
| `ai.routing.{escalation_max,raise_threshold}` | 2; 30 % over 7 days |
| `ai.models.<class>.{enabled,allowed_sensitivity}` | `fable` off until the owner enables it in Settings → Models (T26); §7.3 |
| `trust.{window,min_sample,weights}` | 60 days; 20; equal |
| `trust.thresholds.<step>`, `trust.regression` | §8.2 |
| `trust.material_steps` | to `run`; any step in Leadership, Finance, People, Legal |
| `improve.{weights,review_cadence}` | gain × reach ÷ cost; weekly |
| `improve.self_builds.{max_open,slot_share,budget_share}` | 2; 20 %; 20 % |
| `oversight.second_review.classes` | material, outbound to parties, spend, security-sensitive code |

### 11.2 Open decisions for the owner (material only, one at a time)

| Id | Question | Context and cost in plain words | Default if unanswered |
|---|---|---|---|
| T-O6 | May Lucid Total deploy its own non-security repairs to production without a person, once a repair class has earned `inform`? | Saves the lead a few taps a week and shortens outages; a bad fix could sit in production for up to the soak window before automatic rollback. Security-sensitive changes always need a person. | No: every production deploy needs the lead's tap until Phase 3 |
| T-O7 | What share of the AI budget and build slots may self-repair and self-improvement use? | Proposal: 20 % of the monthly AI budget (about $20 of the $100 default) and at most one of the four worker slots. More makes the system improve faster and slows product work. | The proposal |
