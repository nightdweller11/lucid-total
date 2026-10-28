# Lucid Total — Primary System Definition

> **Status:** Living document, the root of everything in this repository. Every other document derives from it; when two documents conflict, this one wins and the other is fixed.
>
> **Created:** 2026-10-28 · **Owner:** Yossi (founder, product owner) · **Maintained with:** Claude (the lead)
>
> Companion repository: Lucid Chat (`~/Projects/lucid/lucid`, GitHub `nightdweller11/lucid`), the first company that Lucid Total runs. Lucid Total is a **separate product in a separate repository** (`nightdweller11/lucid-total`); it reuses Lucid Chat's design language and working principles, never its code paths or its sealed-mediation boundary.

---

## 1. What Lucid Total is

**Lucid Total is the operating system of a company, in the full sense: it is where the company sees itself, decides, assigns, does and learns, and it is the AI that runs the company's processes.** One living map of everything the company intends, does, decides and learns; an embedded AI that knows all of it, answers about it, acts on it, moves the work, manages the processes, and over time takes over more of the work itself. (Owner, 2026-10-28: "it runs the company. It allows everything to run, it does work, and it manages the company. The goal is for the AI to fully manage the company and to facilitate decision making; over time it should take more of the work.")

It replaces the scattered set of tools a company uses to see itself and to act (task trackers, issue trackers, roadmaps, OKR sheets, status pages, decision logs, support queues, release checklists, meeting notes, reminder lists) with **one model of the company** and **one way to act on it**: a person or an AI says what should happen, and it happens, visibly, with its consequences shown.

Concretely, Lucid Total:

- **Tracks everything that must be done**: technical tasks, user stories, bugs, support issues from customers, system incidents and errors, human chores (open an account, add a credit card, test a build, give feedback, take a product decision, call an investor), goals and strategy changes. Every item carries the context needed to understand and do it, the expectation (definition of done, mocks, acceptance criteria) and the actual result, side by side.
- **Knows how things relate**: subtasks, successors, blockers, cross-domain dependencies (marketing waits for a release; compliance gates a market), groupings into epics, projects, programs, domains and goals. One item can live in several groupings at once.
- **Shows the company as a map** you zoom in and out of: from the highest goal to the smallest detail, through domains ("countries"), programs and epics, down to tasks and their evidence; overlapping areas shown as overlaps, not duplicated cards. The map re-centres on who is looking and on the meeting that is happening.
- **Is operated by AI as a first-class user.** Anything a person can do in the interface, the AI can do on their behalf, from the chat, from a comment on a card, from a meeting, from an email or from the Lucid Chat app. The AI knows the whole model (tasks, documents, code, decisions, conversations) through an in-memory retrieval layer, answers questions, organises, reminds, follows up, notifies, drafts, proposes and, where authorised, acts.
- **Shows how change propagates.** A decision ("we focus on Europe now") becomes a set of priority, budget and attention changes across the map; before it is applied Lucid Total shows what would move, what would slip and who is affected; after it is applied it tracks the effect.
- **Keeps the humans in the roles they hold.** The organisation is flat but responsibilities and decision rights are explicit: anyone can propose, surface and comment; only role holders can change the company's path in their area; every change is attributed, reasoned and reversible.
- **Reports where things stand without over-reporting.** Each agent (human or AI) has a live "working on" line; progress rolls up through the map; summaries are produced on demand and at the cadence each reader asked for.
- **Transports secrets safely.** API keys, credentials and sensitive material are delivered inside Lucid Total through dedicated sealed channels, never in plain comments, chats or emails.

The first user of Lucid Total is Lucid itself: the development of Lucid Chat (its checklist of about 2,400 task rows, decision log, briefs, walkthroughs, status site, quality and cost pages) moves onto Lucid Total, and the Claude Code coordinator that runs Lucid's development reports and takes its work through it. The product is built so that later it can run any company, and Lucid Chat users can receive Lucid Total messages and act on them from the chat app.

## 2. Who it is for

| Reader | What Lucid Total is for them |
|---|---|
| **Founder / CEO** | The whole company at a glance and in depth: goals, what is moving, what is stuck and why, the decisions waiting for them, with the AI as chief of staff that answers, reminds and executes. |
| **Role holders (CTO, CMO, CFO, Head of Compliance…)** | Their domain as the centre of the map, with the dependencies on and from other domains visible; decision rights for their area; proposals from colleagues to accept or decline. |
| **Everyone in the company** | Their own work surfaced and prioritised for them; the ability to propose tasks and changes; notifications that matter and nothing else; the AI as a personal assistant that knows the company. |
| **AI agents (the Claude Code coordinator, workstream agents, the embedded assistants)** | A machine-readable model of the company with tools to read, propose and act; the place to report what they are doing and to ask humans for decisions and feedback. |
| **Customers and partners (indirectly)** | Their support issues, bugs and requests tracked with the same rigour as internal work; status and resolutions communicated through email and through the Lucid Chat app. |
| **Later: other companies** | Lucid Total as a product: a company operating system sold on its own. |

## 3. Product principles (non-negotiable)

1. **One model, many views.** There is exactly one model of the company (items, relations, people, roles, goals, decisions, evidence). Boards, maps, lists, timelines, reports and chat answers are views over it. Nothing lives only in a view.
2. **Everything the interface can do, the AI can do.** Every user-facing capability is a typed, documented action with an API and an AI tool. A capability that exists in the UI but not as a tool is a defect. The reverse holds too: every AI action is visible and auditable in the UI.
3. **Expectation beside result.** Every item states what is expected (goal, definition of done, acceptance criteria, mocks, metrics) and what actually happened (evidence, measurements, screenshots, links, the AI's or reviewer's verdict), side by side, so comparing them is instant.
4. **Visible, attributed, reversible change.** Every change says who (person or agent, on behalf of whom), why, and what it affected; prior state is kept; what can be undone can be undone from where it is shown.
5. **Decisions move the company instantly and transparently.** A strategic decision is an operation on the model with a preview of its consequences (what moves, what slips, who is loaded) and an audit trail; it propagates to priorities, budgets, attention and notifications without a human copying it into ten places.
6. **Right-sized reporting.** Lucid Total never spams: a live state line per agent, roll-ups on the map, and summaries at the cadence each reader chose; alerts only on state changes that matter to the reader (stuck, blocked, decision needed, done, failed, overdue).
7. **Perspective is a first-class input.** The map is arranged for the person looking (role, domains, current meeting, current question). The same company reads as a marketing world to the CMO and an engineering world to the CTO, without two sources of truth.
8. **Flat organisation, explicit rights.** Anyone can see (within the item's visibility), comment, propose and suggest; decision rights are per domain and per kind of decision; an AI acts within the rights of the person it acts for, and within explicit guardrails (preview, confirm, budgets).
9. **Visual first, in the Lucid Glass language, as a web management system.** Lucid Chat's theming (the three themes Deep Blue, Aqua Dusk and Sky Glass, their tokens, glyph families, typography) and a derived Lucid Total mark that speaks the same visual language; meaning glyphs before words; every button carries an icon. The controls, layouts and navigation are those of a web-based management system (dense tables, side panels, command bar, maps, keyboard shortcuts) that works equally well in a desktop browser and a mobile browser; RTL and LTR first-class. (Owner, 2026-10-28.)
10. **Built for machines as much as for people.** Stable identifiers, typed schemas, event streams, idempotent actions, a retrieval layer that any model can use, and prompts/documentation that make a new agent productive in minutes.
11. **Secrets are never casual.** Sensitive values travel in sealed envelopes with explicit recipients, expiry and audit; the AI can route and acknowledge them, never read them unless authorised for that envelope.
12. **Current, best-supported technology; Railway-first; adapters for every external.** Inherited from Lucid Chat (L390, L425, L483): maintained current majors, no deprecated dependency, nothing new outside Railway without a written case, no provider SDK outside its adapter, no CI dependency on GitHub Actions.
13. **Lucid Total runs itself.** Its own development is tracked in Lucid Total from the first usable build; every feature is a card; the AI uses the product to help build the product.
14. **The autonomy ladder.** Every process in the company has an explicit autonomy level: *observe* (the AI watches and reports), *suggest* (proposes, a person applies), *act with confirmation* (prepares everything, a person taps), *act and inform* (acts, tells, undo available), *run* (owns the process end to end, escalates exceptions). Levels are settings per process and per domain, raised as trust is earned and measured; the direction of travel is up. People keep the decisions that define the company (strategy, money above thresholds, people, legal commitments) for as long as they choose to.
16. **Everyone can ask; the responsible decide.** Any person, inside or outside the company, can raise an *ask* (a suggestion, a feature request, a need from another domain, a complaint, an idea). Asks route to whoever holds the responsibility, who decides whether action is needed, what to do, and whether it becomes a task; the asker always sees the outcome. Support issues filter up into product asks the same way.
17. **The system grows with the company.** Two founders with direct focus need a close-up, few groupings and quiet agents; a growing company needs a wider view, more structure, more delegation and more automation. Lucid Total carries an explicit *company stage* that sets the default zoom, grouping depth, agent set, cadences and approval thresholds, and it is designed, in its model and in its codebase, to add complexity only when the company's reality demands it.
18. **Externals are participants, not strangers.** Contractors, board members, accountants, lawyers, suppliers and partners are parties of the company with a compartment: they see their own domain and their relation to the company, nothing else, and they contribute inside it. A party may use Lucid Total directly (an external view) or exist as a *virtual participant* the system reaches by email or message on the company's behalf; a virtual profile materialises into a direct user when the company allows it. Every interface of the company (production, support, finance, payroll, legal, board) passes through Lucid Total, which is why security, encryption and integrity are top priorities.
15. **Model the company as it really works.** Functions (product, engineering, marketing, sales, support, finance, legal and compliance, people, operations), rhythms (daily, weekly, release, quarter), flows (idea → decision → work → release → feedback → learning; lead → customer → issue → resolution; need → vendor → account → cost), and decision kinds with their rights. The schema and the AI's playbooks encode these so that a new company starts with a working operating model, not an empty board.

## 4. Scope

### 4.1 In scope, v1 ("Lucid Total Core", the version that runs Lucid)

- The **company model**: items (task, story, bug, issue, incident, chore, decision, goal, milestone, proposal, reminder), groupings (domain, program, project, epic, release, campaign, OKR), people and roles, relations (parent, blocks, depends, relates, duplicates, spawned-by, evidence-of), comments, time tracking, attachments and links, evidence, labels, custom fields per item kind.
- **Views**: the **map** (zoomable, perspective-driven), **board** (cards by state) with **collapsible line view**, list/table with filters and saved views, timeline/roadmap, dependency graph, person view ("my work", "their work"), live agent view, inbox (decisions, feedback requests, mentions, notifications).
- **The embedded AI**: full chat (threads, streaming, citations, tool previews, confirmations, attachments, voice input on mobile), model choice per conversation (including Fable where allowed), tools for every capability, retrieval over tasks + documents + code + decisions + conversations, proactive follow-ups and reminders, scheduled briefings, feedback requests on cards, drafting emails and notifications, "what if" previews of changes.
- **Operating model integration**: the Claude Code coordinator reports live work and finishes tasks through the API; imports of the existing Lucid Chat checklist, decision log, briefs and walkthroughs; the status, quality and cost pages fold into Lucid Total.
- **Notifications and email**: in-app inbox, email (sending via an adapter; the belucid.chat mail domain), push to the Lucid Chat app through its API, per-person cadence settings.
- **Secure delivery**: sealed envelopes for secrets with dedicated reveal windows, expiry, one-time reveal, audit.
- **Identity**: start with a single owner account plus named service accounts for agents (bootstrap mode, no SSO); Google SSO is the first task tracked in the system; roles and decision rights from day one.
- **Asks**: suggestions, feature requests and cross-domain requests from anyone (including support and externals), routed to the responsible role holder, decided and tracked (`docs/02` §4.9).
- **Parties and compartments**: externals (contractors, board, accounting, legal, suppliers) as parties with engagements and compartmented visibility, as direct users with an external view or as virtual participants reached by email or message (`docs/02` §4.10, `docs/07` §3b).
- **Company stage**: a setting that shapes defaults for a two-founder company and grows with it (`docs/02` §2.8).
- **Integrations API**: REST + webhooks + an MCP-style tool surface for external agents; inbound email-to-item; GitHub (commits/PRs referencing items), Railway (deploy and incident events) as the first two connectors.
- **Platforms**: responsive web app (desktop and phone), installable as a PWA; native mobile later through Lucid Chat.

### 4.2 Later (v1.5+)

- Multi-company tenancy and Lucid Total as a product; billing.
- Deep connectors: calendar and meetings (live meeting mode with decisions captured to the map), Slack/WhatsApp-style channels, CRM, accounting, HR, customer support inboxes, analytics.
- Forecasting and simulation at scale (capacity models, Monte-Carlo dates), OKR scoring, budgets as first-class items with actuals.
- Native Lucid Chat surfaces (a company's Lucid Total inside the chat app).

### 4.3 Out of scope (for now)

- Replacing version control, CI, or code review tools (we link to them).
- Chat as a messenger between people (Lucid Chat does that; Lucid Total has threads on items and with the AI).
- Document editing suites (we link, index and summarise documents; we do not replace them).

## 5. Key constraints and considerations

| Area | Constraint |
|---|---|
| **One model** | Everything is an item or a relation in one schema with stable ids; views never hold state of their own beyond layout preferences. |
| **AI parity** | The action registry is the single source of capabilities; UI and AI tools are generated from it. Parity is tested. |
| **Rights** | Role-based decision rights per domain and decision kind; propose-first for everyone; the AI acts for a person and inherits their rights, never more; irreversible actions confirm. |
| **Secrets** | Never in item text, comments, logs, prompts or retrieval indexes; only in sealed envelopes with their own storage and audit. The retrieval layer and the model never see envelope contents. |
| **Latency** | Board and map interactions under 100 ms locally; AI answers stream within a second; retrieval under 300 ms over the whole company corpus. |
| **Cost** | Runs on Railway for tens of dollars a month at Lucid's size; AI cost visible per conversation and per agent; model tiering (small for classification and routing, large for reasoning, Fable where the owner enables it). |
| **Portability** | Postgres, object storage (S3 API), Node/TypeScript, standard protocols; every external behind an adapter (email, SSO, Claude API, GitHub, Railway, push). |
| **Mobile and desktop** | One responsive web app; phone-width layouts are designed, not shrunk; map and chat work with touch. |
| **i18n and RTL** | English and Hebrew from day one; ICU catalogs; mirrored layouts. |
| **Privacy** | Company data stays in the company's instance; customer PII in issues is minimised and marked; AI providers used under zero-data-retention terms where offered (`docs/06` §3 for the Fable exception the owner decides). |
| **Security, encryption, integrity** | Every company interface passes through Lucid Total, including payroll, legal and board material: compartments per party, field-level encryption for the most sensitive fields, an integrity-protected audit log, and a security review before any external is admitted (`docs/07`). |

## 6. Success metrics

- **Time from intent to action**: median seconds from a request in chat ("follow up with X", "move Europe compliance up") to the visible change.
- **Coverage**: 100 % of UI capabilities available as AI tools (measured by the parity test), 100 % of Lucid Chat's checklist rows imported with their evidence.
- **Freshness**: share of items whose state matches reality (sampled by the AI's evidence check); agent "working on" lines never older than their heartbeat.
- **Noise**: notifications per person per day, and the share the reader acts on; the owner's inbox holds only material decisions.
- **Decision throughput**: time a decision waits for its role holder; share of decisions taken in-context (from a card, a meeting, or chat).
- **Prediction quality**: when a change is applied, the gap between the predicted and the actual effect on dates and load.

## 7. How we work (methodology)

Inherited from Lucid Chat and binding here:

1. **Order of work:** define (this document) → use cases (`docs/01`) → product plan (`docs/02`) → view and interaction design (`docs/03`) → mocks (`docs/04`) → architecture (`docs/05`–`08`) → testing plan (`docs/09`) → migration and operating model (`docs/10`) → roadmap (`docs/11`). Documents change when reality changes; trade-offs are ADRs in `docs/decisions/`; owner instructions and decisions are logged in `docs/12-decision-log.md`.
2. **Nothing is done without seeing it work**: every user-facing change is walked through in a real browser at desktop and phone widths (and on a real phone for touch-heavy views such as the map), with screenshots in the task's evidence; Playwright automates what it can.
3. **Docs in the same change**; the task card in Lucid Total carries the evidence.
4. **The lead orchestrates, reviews and merges; workers build** (Opus 5.5; Fable for security-sensitive or core-technology work); never Sonnet.
5. **Asking the owner**: only material decisions, one at a time, with context and cost in plain words; small things become settings; very small things the lead decides and logs.

## 8. Document map

| Doc | Purpose |
|---|---|
| `docs/00-system-definition.md` | This document. |
| `docs/01-use-cases.md` | The use-case catalogue that the product plan must cover: company operation, development operation, AI operation, decisions and change, people, customers, security. |
| `docs/02-product-plan.md` | Features and requirements: the company model, items, views, AI, notifications, rights, secrets, integrations, settings, metrics. |
| `docs/03-map-and-views.md` | The map concept and interaction design: zoom levels, perspective, overlaps, navigation, phone and desktop, accessibility. |
| `docs/04-mocks/` | HTML mocks of every screen and state, in the three Lucid Glass themes. |
| `docs/05-architecture.md` | System architecture on Railway: services, data model, event model, APIs, scaling. |
| `docs/06-ai-architecture.md` | The agentic framework: action registry and tools, model gateway and model choice, retrieval (in-memory RAG), context assembly, proactive agents, safety and budgets. |
| `docs/07-security-and-secrets.md` | Threat model, identity and rights, sealed envelopes, audit, data handling. |
| `docs/08-integrations-and-api.md` | Public API, webhooks, connectors (GitHub, Railway, email, Lucid Chat), the coordinator protocol. |
| `docs/09-testing-and-quality.md` | Test strategy incl. parity tests, walkthroughs on desktop and phone, AI evals. |
| `docs/10-migration-and-operating-model.md` | Moving Lucid Chat's development onto Lucid Total: import, evaluation, the coordinator's reporting, what replaces the checklist and status site. |
| `docs/11-roadmap.md` | Phases and gates for building Lucid Total. |
| `docs/12-decision-log.md` | Owner instructions and decisions. |
| `docs/decisions/` | ADRs. |

## 9. Glossary

- **Item** — anything tracked: a task, story, bug, issue, incident, chore, decision, goal, milestone, proposal, reminder. One schema, a `kind` field, kind-specific fields.
- **Grouping** — a container that gives items context: domain, program, project, epic, release, campaign, objective. Items may belong to several.
- **Domain** — a top-level area of the company (Engineering, Product, Marketing, Compliance, Finance, Sales, Operations, People). A "country" on the map.
- **Perspective** — the arrangement of the map for a viewer: role, domains, meeting, question.
- **Decision** — an item with decision rights, options, a chosen option, consequences and propagation.
- **Propagation** — the set of changes a decision or edit causes elsewhere (priorities, dates, load, notifications), previewed before and tracked after.
- **Action** — a typed capability of the system, available to the UI and to the AI alike.
- **Agent** — a non-human actor: the embedded assistant, a proactive agent (follow-up, briefing, triage), or an external coordinator such as the Claude Code lead.
- **Working line** — an agent's or person's live "currently on" state.
- **Envelope** — a sealed container for a secret, delivered through Lucid Total to named recipients.
- **Evidence** — artefacts that show what actually happened: screenshots, test results, links, measurements, reviews.
- **Ask** — a request or suggestion from anyone to a responsible role holder: feature request, cross-domain need, idea, complaint. Decided (act, no action, more information) and, when acted on, turned into items.
- **Party** — a person or organisation outside the company's staff that takes part in its work: contractor, board member, accountant, lawyer, supplier, partner, customer organisation. Has an **engagement** (what they do with us, in which domain), a **compartment** (what they may see), and a mode: **direct** (signs in to an external view) or **virtual** (the system reaches them by email or message on the company's behalf).
- **Compartment** — the slice of the model a party or a role may see and act on.
- **Company stage** — a setting (founders · small team · growing · scaled) that sets the defaults for zoom, structure, agents, cadences and thresholds.
