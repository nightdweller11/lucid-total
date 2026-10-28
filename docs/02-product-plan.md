# Lucid Total — Product Plan

> Features and requirements of the company operating system. Derives from `docs/00-system-definition.md` and covers every use case in `docs/01-use-cases.md` (referenced as `UC-…`). The interaction design of the map and the other views is in `docs/03-map-and-views.md`; the mocks in `docs/04-mocks/`; the architecture in `docs/05`–`08`.
>
> **Created:** 2026-10-28 · **Owner:** Yossi · **Status:** v1 draft for the owner's review. Every "setting" named here is configuration (per company, per domain or per person), never a hard-coded behaviour.

---

## 1. Positioning

Lucid Total is **the operating system of an AI-run company**. Where other tools track work (Jira, Linear, Asana), plan it (Productboard, Aha), measure it (OKR tools), report it (status pages, dashboards), decide about it (docs, meetings, Slack) and do it (people, scripts, agents), Lucid Total holds one model of the company and one action layer on top of it, operated by people and AI alike. The AI is not a feature of the tool; the tool is the body through which the AI runs the company's processes, under the autonomy levels the company sets.

What makes it different, in order of importance:

1. **AI parity by construction.** Everything is an action; every action is a tool; the chat, the API and the interface drive the same layer.
2. **The map.** The company as a navigable world, re-centred on the viewer and the moment, where overlaps are overlaps.
3. **Decisions as operations.** Strategy changes are previewed, applied, propagated and reversible.
4. **Expectation beside result.** Every card can be audited in seconds.
5. **Right-sized reporting.** Live working lines, roll-ups, cadence per reader; no noise.
6. **Secrets inside the system.** Sealed envelopes replace "I'll WhatsApp you the key".

## 2. How a company works: the model Lucid Total encodes

A company is a set of **functions**, operating in **rhythms**, moving value through **flows**, steered by **decisions** that people with **rights** take, constrained by **resources**, and learning through **feedback**. Lucid Total models each explicitly, so a new company starts with a working operating model and the AI has playbooks to run it.

### 2.1 Functions (domains)

Default domains, each with templates, metrics and decision kinds: **Product** (what we build and why), **Engineering** (building, quality, infrastructure, security), **Design**, **Marketing** (positioning, campaigns, content, growth), **Sales and partnerships**, **Customer support and success**, **Finance** (budgets, spend, revenue, runway, vendors), **Legal and compliance** (contracts, filings, markets, privacy, policies), **People** (hiring, onboarding, capacity, wellbeing), **Operations** (accounts, tools, facilities, processes), **Leadership** (strategy, goals, investors, board). Domains are configurable: renamed, merged, added. Items belong to one home domain and may appear in others through groupings and relations.

### 2.2 Rhythms

**Daily** (briefing, stand-up line per person and agent, incident watch), **weekly** (digest, planning, workload balance, owner decisions sweep), **per wave or sprint** (brief → build → review → merge → follow-ups), **per release** (gate criteria, store submission, release notes, customer notices), **monthly** (cost review, account renewals, compliance calendar), **quarterly** (objectives review, strategy weights, retrospective). Rhythms are schedules the proactive agents run (§7.6) at the autonomy level set for each.

### 2.3 Flows

- **Idea → decision → work → release → feedback → learning.** Proposals and ideas (anyone) → decisions (role holders) → programs, epics, tasks (assignees, agents) → releases and gates → customer and metric feedback → lessons that change templates and process.
- **Lead → customer → issue → resolution → knowledge.** Sales and support flow; issues link to tasks that fix them; resolutions become knowledge.
- **Need → vendor → account → credential → cost → renewal.** Operations flow; accounts are items with owners, envelopes and renewal dates.
- **Risk → mitigation → review.** Risks on the map as weather; mitigations as tasks.
- **Goal → program → measure.** Objectives with contribution links and forecasts.

### 2.4 Decision kinds and rights

| Decision kind | Typical right holder | Materiality default |
|---|---|---|
| Strategy and market focus, company goals | Owner / CEO | material |
| Product scope and priorities in a domain | Domain role holder (CPO, CTO, CMO…) | per threshold |
| Spend above a threshold; new vendor; new external service (Railway-first rule) | Owner / CFO | material above threshold |
| Release go / no-go, gate acceptance | Owner with the domain lead | material |
| People: hire, role change, rights change | Owner / People | material |
| Legal commitment, compliance deadline change | Owner / Legal | material |
| Process change (templates, definition of done) | Lead of the process's domain | per threshold |
| Day-to-day assignment, ordering within an epic, small defaults | Assignee / lead; AI at *act and inform* | not material |

Rights are configured per company (`docs/07` §3); the table is the default. Anyone may propose anything; proposals route to the right holder (UC-C4). Materiality decides whether a decision reaches the owner's inbox (UC-C3) or is taken by a lead and logged.

### 2.5 Resources

People and agents (capacity, availability, cost), money (budgets with actuals), time (deadlines, SLAs), infrastructure (environments, services), accounts and credentials (as envelopes). Propagation previews (§6) compute against them.

### 2.6 Feedback and learning

Evidence on every item; reviews as evidence; retrospectives as `lesson` items linked to the templates they change; metrics on groupings; the AI's own quality measured per agent and model (`docs/09`).

### 2.7 The autonomy ladder (principle 14)

Every process (each rhythm, each flow step, each agent playbook) carries an autonomy level: `observe` · `suggest` · `confirm` · `inform` · `run`. Defaults for Lucid: triage of inbound issues `suggest`; follow-ups and reminders `inform`; briefings `run`; priority re-ranking from a decision `confirm`; emails to customers `confirm`; spend `suggest`; merges `observe` (the coordinator merges). A dashboard shows each process's level, its measured quality (how often its suggestions were accepted unchanged) and the recommended next level.

### 2.8 Company stage: the system grows with the company (principle 17)

(Order note: §2.7 precedes this section since the 2026-10-28 review.)

A company of two founders and a company of forty need different defaults from the same model. **Company stage** is a setting with four values and explicit, previewable consequences:

| Stage | Signals (settings) | Home view | Structure shown | Agents | Cadence | Approvals |
|---|---|---|---|---|---|---|
| **Founders** (Lucid today) | ≤ 3 people, ≤ 2 domains with leads | Z1–Z2 close-up: the current wave, the owner's decisions, agents' lines; the inbox on the phone | phase · wave · domain | follow-up, evidence check, sweeper at `suggest`; briefing at `run` | instant for decisions and blocks, daily digest for the rest | owner decides material; lead decides the rest |
| **Small team** | 4–10 people, ≥ 3 domains | Z1 of the home domain with the goals horizon | + programs and epics | + triage, deadline, decision ageing at `inform` | hourly batches for most classes | domain leads decide within thresholds |
| **Growing** | 11–40 people, parties engaged | Z0 with regions by work, flags and heat | + releases, campaigns, objectives, compartments | + workload, account renewal, asks routing at `inform`/`run` | daily briefings replace most notifications | thresholds per domain; proposals the norm |
| **Scaled** | > 40 people, several tenants or business units | Z0 with sub-companies | + portfolios | playbooks largely at `run`, exceptions escalate | weekly for most, instant for incidents and material decisions | formal rights matrix, delegated budgets |

The stage is **proposed** by Lucid Total when signals cross thresholds and **decided** by the owner with a preview of what changes (UC-O2); nothing switches silently. Stage defaults can be overridden per person. The "shape of the company" view (UC-O3) shows the structural metrics behind the proposal; the Lucid Total program shows its own complexity metrics (schema, registry, playbooks, code) so that growth of the system is a decision too (UC-O4).

## 3. Personas and core scenarios

| Persona | Core scenarios |
|---|---|
| **Owner (Yossi)** | UC-A1 glance, UC-C1 strategic decision with preview, UC-C3 material decisions one at a time, UC-D2 tell and it is done, UC-G1 reminders, UC-H1 hand over a key, UC-B9 trust the imported history. |
| **The Claude Code coordinator (lead agent)** | UC-B6 live working line, UC-B7 waves and follow-ups, UC-D8 receive handed-off work, UC-B2 attach evidence, read briefs and acceptance from items. |
| **Workstream agents** | UC-B1 a task with everything needed, UC-B3 receive feedback mid-task, report results. |
| **Domain role holders (CTO, CMO, compliance lead)** | UC-E1 my world, UC-C4 accept proposals, UC-C2 preview a change, UC-E4 workload signals of their people. |
| **Team members** | UC-E2 my work, UC-C4 propose, UC-N1 raise an ask, UC-G3 change-only notifications, UC-D1 ask the assistant. |
| **Customers and testers (indirect)** | UC-F1 report and be answered, UC-F2 told when fixed, UC-I3 via Lucid Chat. |
| **Parties (contractors, board, accounting, legal, suppliers)** | UC-P1 work inside a compartment, UC-P2 be reached as a virtual participant, UC-P3 materialise, UC-P4 board compartment, UC-N4 ask. |
| **Admins (Lucid Total operators)** | §13 settings, rights, autonomy levels, connectors, budgets, audit. |

## 4. The company model

### 4.1 Items

One table of items with a `kind`, common fields, and kind-specific fields validated by schema. Common fields: `id` (stable, human-readable prefix per company and kind, plus imported ids such as `P1-C-03` kept as aliases), `title`, `kind`, `state`, `home_domain`, `groupings[]`, `assignees[]` (people and agents), `owner` (the accountable person), `priority` (computed, with override), `dates` (created, started, due, done; optional), `estimate` and `actuals` (time), `sensitivity`, `visibility`, `labels[]`, `custom fields` per kind, `watchers[]`, `source` (who or what created it and from where).

| Kind | What it is | Kind-specific fields |
|---|---|---|
| `task` | A unit of work for a person or agent | brief (goal, context, technical, infrastructure), definition of done, acceptance criteria[], mocks[], tests required, docs required, walkthrough required, wave |
| `story` | A user-facing capability | user, need, outcome, acceptance criteria[], mocks[] |
| `bug` | A defect | repro, expected, actual, severity, environment, affected customers[], fixes link |
| `issue` | A customer or partner request or problem | reporter, channel, SLA class, resolution, customer notice state |
| `incident` | A system or operational failure | severity, timeline[], on-duty, services[], post-incident follow-ups |
| `chore` | A human task (accounts, cards, tests, signatures, calls) | steps[], envelope steps[], who can do it, what to paste back |
| `decision` | A choice to make or made | question, context (two sentences for the owner's inbox), options[], recommendation, chosen, rights, materiality, consequences (the change set), decided by, decided at |
| `proposal` | A suggestion awaiting a right holder | target (item, process, strategy), rationale, routed to, outcome |
| `goal` | An objective with measures | measures[], target date, contributing groupings[], forecast, strategic weight |
| `milestone` | A gate or date that matters | criteria[], criteria status, report |
| `risk` | Something that may hurt | likelihood, impact, owner, mitigations[], trigger |
| `budget` | Money allocated | amount, period, domain, actuals[], commitments[] |
| `account` | A vendor or service account | vendor, owner, envelope(s), renewal, cost, used by[] |
| `reminder` | A nudge with a time | when, channel(s), for whom, context link |
| `meeting` | A working session | subject, attendees, perspective, decisions[], summary |
| `lesson` | A retrospective finding | what happened, change made (template or process), linked items |
| `envelope` | A sealed secret (`docs/07`) | recipients, expiry, reveal policy, uses[] (never the content in the item table) |
| `agent` | A non-human actor record | kind (coordinator, worker, assistant, proactive), model, rights, working line, budgets |
| `ask` | A request or suggestion from anyone to a responsible role holder (§4.9) | asker (person or party), requesting domain, target domain or subject, sources[] (issues, comments, emails), AI summary, related items[], routed to, decision (act · no action · more information), reason, resulting items[] |
| `party` | An external participant: person or organisation (§4.10) | kind (contractor, board, accounting, legal, supplier, partner, customer org, system), mode (direct · virtual · system), contacts and channels, engagements[], compartment, key fingerprint (for envelopes), terms link |
| `engagement` | What a party does with the company and for how long | party, domain(s), groupings[], role in them, start and end, owner inside the company, terms, access revocation rule |

Recurrence applies to `chore`, `task`, `reminder`, `meeting` (rule, next occurrence, generated instances link to the series).

### 4.2 Groupings

`domain`, `program`, `project`, `epic`, `release`, `campaign`, `wave`, `objective`, `collection` (a free grouping, e.g. "Europe"). Many-to-many with items and with each other (a program spans domains; an epic belongs to a program and a release). Each grouping has: lead, description, state roll-up (counts by state, done share counting subtasks, UC-G4), forecast, health (on track / at risk / stuck, with reasons), dates (optional), metrics[], and a map placement (`docs/03`).

### 4.3 Relations

Typed, directed, with optional note and creator: `parent_of` / `subtask`, `blocks` / `depends_on`, `relates`, `duplicates`, `spawned_by` (follow-ups), `fixes` (task → bug/issue), `evidences` (evidence → item), `decided_by` (change → decision), `contributes_to` (grouping → goal), `mitigates` (task → risk), `uses` (task/service → account/envelope), `mentions` (comment → item). Rules: cycles in `blocks`/`depends_on` are refused with the cycle shown; a closed item with open blockers is flagged; a `done` parent with open subtasks is impossible (the parent shows the share instead).

### 4.4 Expectation and result

Every `task`, `story`, `bug`, `chore` and `milestone` has an **Expected** side and an **Actual** side:

- **Expected**: acceptance criteria (each a line with id), mocks (frame links or images), tests required (by class: unit, integration, contract, e2e, load, eval, walkthrough), docs required, measurable targets (latency, coverage, eval threshold), definition of done (from the template).
- **Actual**: per criterion a status (met / partly / not met / not checked) with evidence links; test results (counts, links); walkthrough evidence (screenshots, videos, report); measurements; deviations with reasons; the reviewer's verdict (person or AI) and date.
- **Comparison**: the card shows the two sides as aligned rows; the roll-up gives a single confidence glyph (all met · some partly · unmet · unchecked). The AI's **evidence check** (§7.6) reads the linked evidence and proposes the per-criterion statuses; a human verdict overrides.

### 4.9 Asks: everyone can raise, the responsible decide

An **ask** is the universal inbound request: a suggestion, a feature request, a need from another domain, an idea, a complaint, a question that needs an owner. Anyone can raise one (a person, a party in their compartment, the triage agent aggregating support issues, an email to the asks address, the assistant on someone's behalf).

- **Routing**: by target domain and subject to the responsible role holder (rules per domain; the domain lead by default; the owner as last resort); the asker may suggest a target, the AI proposes one, the rule decides; re-routing is one action with a reason.
- **The card**: who asked and from where (the source chain: support issues → ask; email → ask), the AI's one-paragraph summary, related items (possible duplicates, existing tasks), the suggested decision, and the decision buttons: **Turn into task(s)** (items created with `spawned_by` and, for cross-domain asks, a dependency to the asker's grouping), **No action** (with a reason the asker sees), **Needs more** (a feedback request to the asker), **Route to…**, **Make it a proposal/decision** (UC-N5).
- **Transparency**: the asker sees the ask's state and outcome always, within their compartment; the resulting items show the ask as their origin; customers behind a support-born ask are notified when it ships (UC-F2).
- **Ageing**: asks without a decision surface like ageing decisions (the decision-ageing agent covers both); one escalation by the asker.
- **Metrics**: asks per week by source and domain, time to decision, share turned into work, share declined with reason; shown on the domain's roll-up.

### 4.10 Parties, engagements and compartments (externals as participants)

Externals are **parties** of the company, not users with fewer permissions bolted on. A party has **engagements** (what they do with us, in which domains and groupings, with which role, from when to when, owned by whom inside the company) and a **compartment** (the slice of the model they may see and act on: their items, the groupings of their engagements, the people they work with, the asks and comments addressed to them, the evidence they produced or were given; never the map of the company, never other domains, never anything above their sensitivity clearance).

Three modes, one identity:

- **Direct**: the party signs in (SSO or a magic link) and uses the **external view**: a reduced rail (Inbox · My items · Chat · the groupings of their engagements), their compartment banner ("You see: Finance · Payroll with Lucid"), chores with envelope steps, asks, comments, evidence upload; the assistant scoped to their compartment.
- **Virtual**: the party does not sign in. Lucid Total reaches them on the company's behalf by email or message (drafted by the AI, approved per the autonomy level of the "external correspondence" process, sent through the channel adapters), tracks replies (threaded by headers and a per-party address tag), extracts commitments and answers into items, and keeps the whole exchange on the party's page. The company sees the party as a participant; the party sees ordinary email.
- **System**: the party is a service (payroll provider, bank feed, vendor API) with a service account and a connector; the same compartment logic answers "who touches our finance data".

**Materialisation**: a virtual party can be invited to direct use; the identity, history and compartment carry over (UC-P3). **Revocation**: engagement end dates revoke access automatically; a terminated engagement keeps the history visible to the company and nothing new to the party.

**On the map**: parties appear as **embassies** at the company's border, sized by engagement, coloured by state (active · waiting on us · waiting on them · overdue), opening into the party page (`docs/03` §3).

**Compartment templates**: contractor (their groupings), board (goals, board pack, board decisions, their asks), accounting (Finance: invoices, payroll inputs, filings), legal (Legal: contracts, filings, restricted items by name), supplier (orders, deliveries, invoices), customer organisation (their issues and asks). Templates are settings; every compartment is enforced by row filters at the data layer and tested by the cross-compartment suite (`docs/09`).

### 4.5 Comments, feedback and change history

- A thread per item; comments support markdown, attachments, mentions (people, agents, items), and **feedback requests** (a comment addressed to someone with a question and optional options; it lands in their inbox; the answer closes it).
- **Apply to card**: any comment can be turned into a change of the item (scope, acceptance, due date, assignee) with one tap or by asking the AI; the change links to the comment and keeps attribution (UC-B3).
- **History**: every field change with actor, on-behalf-of, reason, before and after; a timeline tab on each item; undo where reversible (§8).
- Comments carry a sensitivity flag; sensitive comments are excluded from retrieval and from agents without clearance.

### 4.6 Templates

Templates define kinds' default fields, steps and acceptance for a company and domain: Lucid Chat's task brief, PR checklist, walkthrough report, gate report, mechanism doc, incident, decision card, chore for an account. Templates are data (versioned); changing a template can propagate to open items with a preview (UC-K1). The AI drafts items from templates and from a sentence ("make a task for SSO").

### 4.7 Evidence and attachments

Files (images, video, PDF, logs) in object storage; links (PRs, commits, docs, pages) with fetched titles; structured evidence (test result summaries, measurements, eval results) as typed attachments that feed metrics. Evidence links to one or more items and criteria.

### 4.8 People, roles and agents

People: profile, roles (per domain), rights, perspective, channels (email, Lucid Chat id, push), cadence settings, time zone, working hours, capacity and availability. Agents (§7.7): kind, model policy, rights, budgets, working line. Service accounts for external systems.

## 5. Views

All views are over the same model; each remembers its layout per person. Full interaction design in `docs/03`.

### 5.1 The map (home)

The company as a zoomable, perspective-driven world (`docs/03`): domains as regions, programs and epics as areas, items as activity, goals as the horizon, dependencies as roads, risks as weather, decisions waiting as flags. Zoom levels: company → domain → program/epic → item → evidence. Re-centres on the viewer's perspective and on the active meeting. Overlapping groupings render once across regions.

### 5.2 Board and line view

Cards by state (configurable columns per kind and grouping; default: Proposed · Ready · Doing · Review · Done · Blocked as a lane marker). Cards show: kind glyph, id, title, assignee avatars, priority glyph with reason on hover, due glyph, blocked glyph with blocker, confidence glyph (expected vs actual), comment count, working line snippet for in-progress cards. **Collapsible to a line view**: one row per item with the same glyphs; a header toggle and a per-group toggle; the line view is also the phone default. Swimlanes by grouping, assignee or domain; drag to change state or order (rights permitting; the AI can do the same).

### 5.3 List and table

Dense table with column chooser, sorting, grouping, inline edit, bulk actions (with a preview of the change set), saved views (personal and shared), export (CSV, JSON, Markdown). Columns include every field, roll-ups and computed priority factors.

### 5.4 Timeline and roadmap

Items and groupings with dates on a time axis, dependencies drawn, milestones as gates, what-if deltas rendered as ghosts (§6). Items without dates are listed beside, never faked onto the axis.

### 5.5 Dependency graph

Interactive graph of a grouping or an item's neighbourhood; critical path highlighted; cycles shown; filter by relation type; click-through to items.

### 5.6 People and agents

Per person: ranked queue with reasons (UC-E2), waiting-on both ways, load picture, time. **Agents live** panel: every agent's working line, age, item, model, cost today, and the last state change; a history per agent (UC-B6).

### 5.7 Inbox

The person's queue of things that need them: decisions (one at a time for the owner, UC-C3), feedback requests, proposals to rule on, mentions, envelopes to reveal, chores due, state changes they follow. Each entry is actionable in place (decide, answer, approve, snooze, delegate, ask the AI).

### 5.8 Search and filters

Full-text and structured search across items, comments, documents, decisions and code pointers; filters on every field; saved searches; natural-language search through the assistant ("open EU compliance tasks blocked on a decision").

### 5.9 Item page

Header (glyph, id, title, state, priority with reason, assignees, groupings as chips with map placement, dates); tabs: Overview (brief and context), Expected vs Actual, Dependencies (both directions, graph), Comments and feedback, Evidence, Time, History; a right panel with the assistant scoped to this item ("summarise", "what's missing for done", "draft the follow-ups").

### 5.9b External view and party pages

The external view is the direct mode of a party (§4.10): the reduced rail, the compartment banner, their inbox, items, chores, asks and chat scoped to the compartment. Inside the company, a **party page** shows the party's engagements, the thread of correspondence the system handled on the company's behalf, the items and asks linked to them, deadlines, their channels and key fingerprint, and the "Invite to Lucid Total" materialisation action. A **Parties** list (under People & agents) answers "who are we waiting on outside the company?" with the embassy states.

### 5.10 Phone

Phone-first layouts for: inbox, my work (line view), item page, chat, map (touch zoom and pan, simplified labels), approvals and envelope reveal. Read and comment with poor connectivity (queued writes). Installable PWA; later native via Lucid Chat.

### 5.11 Accessibility and i18n

WCAG 2.2 AA; full keyboard operation (command bar `⌘K`, list navigation, shortcuts); screen reader names for every glyph; reduced motion; high contrast variant from the Lucid tokens; English and Hebrew with mirrored layouts; the map's labels and directional glyphs mirror in RTL; dates and numbers localised.

## 6. Decisions, propagation and what-if

### 6.1 Decision items

A decision has a question, context, options with consequences, a recommendation (often by the AI), rights, materiality and a chosen option. A material decision card's **first line states cost and toil** in plain words ("cost: $0, toil: none"), following Lucid Chat's L425 rule, so the owner knows what is being asked before reading the context. Taking it produces a **change set**: the list of changes to apply (priorities, dates, assignees, groupings, budgets, notifications). The decision card shows the change set before confirmation.

### 6.2 Propagation engine

Given a change (a decision, a date move, a scope change, a process change), compute the affected items and the derived changes through relations and rules: dependency shifts (successors move), priority re-ranking (§6.4), load changes per person and agent, goal forecast changes, SLA and deadline risks, notifications due. Output a **delta**: before/after per affected item, per person, per goal, with explanations.

### 6.3 What-if mode

A draft change set over the model (never applied) rendered as deltas on the map, timeline, board and people views (ghost positions, arrows, load bars). Compare two drafts. Apply, save for later, or discard. Every applied change set is a first-class record with its baseline, so the actual effect can be compared with the predicted one later (UC-K3).

### 6.4 Priority model

Priority is computed from explicit factors with weights (settings): strategic weight of the goals and collections the item serves (the lever a "focus on Europe" decision moves), deadline proximity, number and importance of items it blocks, age in state, kind defaults (incident severity, SLA class), role holder overrides (with reason, visible), owner asks. Every priority shows its factors (UC-K4). Perspectives re-weight for the viewer (§5, `docs/03`) without changing the company priority.

### 6.5 Strategic layer

Goals and collections carry strategic weights; a strategy change edits weights (with preview). Budgets re-allocate with the same preview. The decision records both.

### 6.6 Reversal

A change set reverts as a unit where possible; irreversible parts (emails sent, external actions) are listed; the reversal is itself a change set linked to the original.

## 7. The embedded AI

### 7.1 Principles

Parity (every action a tool), transparency (every AI action visible with its preview and outcome), bounded rights (the AI acts for a person, within their rights, within budgets), evidence over assertion (answers cite; numbers come from queries), quiet by default, the coordinator does the engineering (UC-D8).

### 7.2 The chat

- Threads (per topic, per item, per meeting), streaming, markdown and tables, code blocks, attachments and screenshots, voice input on phone, slash commands (`/task`, `/decide`, `/remind`, `/email`, `/whatif`, `/envelope`), mentions of items and people, pinned threads, search of history.
- **Tool previews and confirmations** as cards: the action's glyph and label, the permission class (read · reversible · irreversible · outbound · spend), the exact change set, Confirm / Edit / Cancel; results with Undo where reversible. Reversible actions at autonomy `inform` run without a tap and show the undo.
- **Citations**: chips to items, documents (section), code (file and lines), decisions, commits, conversations; a side panel shows what the answer used.
- **Scopes**: a thread can be scoped to an item, a grouping, a meeting or a person, which shapes retrieval and tools.
- **Model choice** per thread by **class** (`fast` · `standard` · `strongest` · `fable`, the last enabled by the owner per company) with the running cost shown; the interface shows class names, never model ids (those live in settings, `docs/06` §3); a default per role; proactive agents use the smallest model that passes their evals (`docs/06`).
- **Memory**: the assistant remembers per-person preferences (channels, cadence, phrasing) only through explicit "remember" actions; company facts live in the model, never in hidden memory.

### 7.3 Capabilities (tools), by family

Read: search, get item, list by filter, explain priority, roll-ups, dependencies, people load, agent status, metrics, documents and code retrieval, history. Write: create and edit items, move state, assign, relate, comment, apply comment to card, attach evidence, set criteria status, create change set / preview / apply / revert, decide, propose, accept or decline proposal, set reminder and follow-up, create meeting and capture decision, start/stop time, update working line. Outbound: notify (in-app), email, Lucid Chat message, webhook. Secrets: create envelope, route envelope, acknowledge (never read). Admin (admins only, hidden from others): rights, autonomy levels, templates, connectors, budgets. The registry is the source of truth (`docs/06` §2); the UI and the MCP/REST surfaces are generated from it; parity is tested (`docs/09`).

### 7.4 Retrieval ("knows everything")

An in-memory hybrid index (BM25 + dense embeddings, RRF fusion, build-time enrichment; `docs/06` §4) over: items and comments, decisions, documents (the repository's `docs/`), code (symbol-aware chunks with pointers, read-only), conversations (the assistant's own), evidence text, resolutions. Freshness: items and comments indexed on write; repository content on each merge; a currency check refuses stale corpora. Sensitivity filters apply before anything reaches a prompt.

### 7.5 Playbooks

Named procedures the assistant and the proactive agents follow, as data: *triage an inbound issue*, *prepare the owner's morning*, *run the weekly workload balance*, *close a wave*, *propagate a strategy decision*, *onboard a person*, *rotate an expiring account*, *write a gate report*. Each playbook has an autonomy level, the tools it may use, its evals and its quality record (§2.7).

### 7.6 Proactive agents

Scheduled or event-driven: follow-up agent (UC-D3), briefing agent (UC-G2), triage agent (UC-F1), evidence checker (§4.4), stale/duplicate sweeper, deadline and SLA watcher, workload watcher (UC-E4, respectful rules), account renewal watcher, decision ageing watcher (nudges the right holder; escalates per rule). All quiet by default: one line or card per finding, deduped, at the reader's cadence; every finding links its evidence.

### 7.7 Agents as actors

Each agent has a record (§4.1 `agent`): kind, model policy, rights (a service account), budgets (spend per day, emails per day, mass-change size), working line, history and quality. The Claude Code coordinator and its workers are agents of kind `coordinator` and `worker`; they update their working lines and items through the API (`docs/08` §5). The boundary: assistants and proactive agents organise, answer, remind, notify, draft and apply model changes; building software is handed to the coordinator as a task (UC-D8).

### 7.8 Meeting mode

Start from a meeting item or by saying "we are meeting about X": the map and inbox re-centre on X for attendees; the assistant listens (voice or typed), captures decisions and tasks as proposed cards, applies reversible ones at once and batches confirmations; at the end it produces the summary item with links (UC-C6, UC-E3).

### 7.9 Safety and limits

Rights enforcement in the action layer; permission classes; budgets; outbound channels off until enabled per company with a kill-switch each; prompt-injection hygiene (schemas and values kept out of free text, sanitised sentinels, untrusted content marked); no secrets in prompts or indexes; audit of every tool call with its preview and outcome (`docs/07`).

## 8. Notifications, reminders, briefings, channels

- **Channels**: in-app inbox and toasts, email (adapter; `belucid.chat` mail), Lucid Chat (bot conversation through Lucid Chat's API), push (via Lucid Chat first; web push later), webhooks.
- **Per-person settings**: channels per event class, cadence (instant · hourly · daily · weekly), quiet hours and time zone, depth of briefings.
- **Event classes**: decision needed, feedback requested, mention, state change of followed items, blocked/unblocked, done, failed, overdue, SLA breach, envelope delivered, agent finished, briefing.
- **Dedupe**: one notification per event across channels; grouped per item within a cadence window.
- **Reminders and follow-ups**: time- or condition-based; the follow-up agent checks and reports on change only.
- **Briefings**: generated summaries with citations at the reader's cadence; the owner's morning briefing lists material decisions first.
- **Undo** on every notification-sending action within a grace window (settings) before external sends leave.

## 9. Secrets and secure delivery (summary; design in `docs/07` §5)

Sealed **envelopes**: created in a dedicated window (never the chat input), encrypted per envelope to the recipients' keys, stored apart from items, revealed in a dedicated window with one-time or timed reveal, every reveal audited; expiry and rotation chores; usage links to accounts and services; the AI routes, reminds and acknowledges, never reads. Items mention envelopes by id only. Retrieval never indexes envelopes. Sensitivity levels on items and comments limit visibility and AI access (UC-H4).

## 10. Issues, incidents and customers

- **Intake**: Lucid Chat's "Report a problem" bundles (content-free notice; the bundle stays in Lucid Chat's report store and is linked by id), email to support/beta addresses, a web form, API; dedupe by signature.
- **Triage** (AI at `suggest` by default): kind, severity, SLA class, owner, linked bug or task; customer acknowledgement draft.
- **Lifecycle**: new → triaged → in progress (linked task) → resolved → verified → closed; customer notices at triage, resolution and close through the customer's channel, with consent and minimal PII.
- **Incidents**: severity, on-duty routing (settings), timeline of actions, status line on the map, post-incident lessons; sources: Railway events, nightly chain, health checks, error reporting.
- **Knowledge**: resolutions and answers indexed for the assistant (UC-F4).
- **SLAs**: per issue kind and customer class; timers; breach signals (UC-F5).

## 11. Time, capacity and workload

- **Time**: automatic from state (`doing` start/stop) and agent runtimes; manual entries; estimates per item; roll-ups per grouping, person, agent; "how long do X take" answered from history.
- **Capacity**: per person (hours, availability, time off) and agent (parallel slots, e.g. 4–6 workers on the 16 GB machine; model limits); used by forecasts and previews.
- **Workload signals** (UC-E4): queue growth vs completion, reopen rate, long `doing`, many blocks, overdue share; shown to the person as help first, to the role holder as a workload concern; thresholds as settings; always explainable from items; never a verdict about a person.

## 12. Integrations, API, import and export (summary; design in `docs/08`)

- **REST API** for every action and query; **webhooks** for events; **MCP server** exposing the tool registry to external agents; **service accounts** with rights and budgets.
- **Connectors v1**: GitHub (commits/PRs by item id, merge events), Railway (deploy and failure events), email in/out, Lucid Chat (bot channel and report links), the Claude Code coordinator protocol.
- **Later**: calendar, Slack-style channels, CRM, accounting, HR, analytics.
- **Import**: Lucid Chat's checklist, decision log, briefs, walkthroughs, ADRs, status/quality/cost data (`docs/10`); generic CSV/JSON.
- **Export**: whole model as JSON and Markdown at any time; per-view CSV.

## 13. Identity, rights, tenancy and settings

- **Identity**: bootstrap mode (owner account with a strong secret, agent service accounts) → Google SSO (the first tracked task) → more providers later; sessions with device list; API keys per service account. **Parties**: magic-link or SSO sign-in for direct externals, bound to their party and compartment; virtual parties have no sign-in; system parties have service accounts.
- **Compartments** for parties and, where a company wants them, for internal roles (e.g. People and Finance for payroll-class data); enforced at the data layer; cross-compartment tests from day one.
- **Company stage** (§2.8) as the master default for zoom, structure, agents, cadences and thresholds; proposed by the system, decided by the owner with a preview.
- **Rights**: roles per domain; decision kinds per role; permission classes for actions; visibility scopes (company, domain, item-level for guests); the AI inherits the acting person's rights.
- **Autonomy levels** per process and playbook; a dashboard with measured quality and recommendations.
- **Tenancy**: one company per instance in v1 with a tenant id on every row, so multi-tenant hosting is a deployment change, not a schema change (`docs/05`).
- **Security priority**: because every company interface (production, support, finance, payroll, legal, board) passes through Lucid Total, security, encryption and integrity are first-class product requirements: sensitivity classes up to `payroll`, field-level encryption for the most sensitive fields, an integrity-protected audit log with read audits for payroll-class data, compartments, envelopes, a security review gate before the first external is admitted (`docs/07`).
- **Settings as data**: domains, templates, priority weights, materiality thresholds, SLA classes, cadences, budgets, kill-switches, model policy, connectors, map layout preferences. Every behaviour named in this plan is a setting.

## 14. Platforms, performance and quality targets

- Responsive web app (desktop and phone browsers), PWA; Lucid Glass theming (three themes, high contrast, reduced transparency), the derived Lucid Total mark (`docs/04-mocks/README.md` §Brand).
- Interaction latency: board/list/map operations < 100 ms on cached data; item page < 500 ms; search < 300 ms; assistant first token < 1.5 s; retrieval < 300 ms over the full corpus.
- Reliability: no lost write (queued writes on the phone); every action idempotent; audit complete.
- Testing (`docs/09`): unit, integration, contract, parity, e2e (Playwright at desktop and phone widths, both themes, LTR and RTL), AI evals with held-out sets, load for the event path, and the mandatory walkthrough with screenshots per feature.

## 15. Metrics (product)

Intent-to-action time; AI parity coverage (100 %); freshness of state (sampled); notifications per person per day and action rate; decision wait time and in-context share; prediction gap (predicted vs actual dates and load); share of processes at each autonomy level and the acceptance rate of AI suggestions; import completeness (rows, evidence links resolved); cost per day of AI by agent and model.

## 16. Release phases (summary; details in `docs/11-roadmap.md`)

Asks ship in Phase 0 (the card, routing to the owner or lead, decisions); company stage `founders` defaults in Phase 0 with the stage model in Phase 3; parties in virtual mode (email on the company's behalf) in Phase 1, direct external views and compartments in Phase 2, payroll-class data with field-level encryption and the security gate in Phase 3.

- **Phase 0 · Bootstrap (the board that replaces the checklist):** items, groupings, relations, board and line view, list, item page with expected vs actual, comments and feedback requests, inbox, bootstrap identity, the coordinator protocol (working lines, items), the import of Lucid Chat's checklist and decision log, the chat with read tools and the first write tools, Deep Blue + Sky Glass, desktop and phone.
- **Phase 1 · The AI runs the operation:** full action registry parity, previews/confirm/undo, retrieval over docs and code, proactive agents (follow-up, briefing, evidence check, sweeper), notifications and email, Lucid Chat channel, envelopes, Google SSO, templates, time tracking, Aqua Dusk.
- **Phase 2 · The map and decisions:** the map with perspectives and meeting mode, decisions with change sets, propagation and what-if, priority model with explanations, timeline, dependency graph, workload signals, issues/incidents intake with connectors (GitHub, Railway, email in).
- **Phase 3 · Company-wide:** budgets, accounts, risks, goals with forecasts, playbooks dashboard and autonomy ladder, knowledge from resolutions, exports, guest access, multi-tenant readiness.
- **Phase 4 · Product:** second tenant, billing, deeper connectors, Lucid Chat surfaces.

## 17. Open questions (to resolve with the owner, one at a time, when material)

1. Which model classes are enabled by default and the monthly AI budget for Lucid Total's own operation (cost shown in the card when asked).
2. Whether the owner's Lucid Chat account is the primary channel for reminders from day one (needs the bot identity in Lucid Chat's API) or email first.
3. The materiality thresholds for spend and release decisions (default proposal: spend above $200/month new recurring, any store submission, any gate).
4. Whether the map is the default home on the phone or the inbox (default proposal: inbox on the phone, map on the desktop).
