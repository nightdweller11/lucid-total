# Lucid Total — Use Cases

> The catalogue of situations Lucid Total must serve. The product plan (`docs/02`) covers every use case here; the map design (`docs/03`) and the mocks (`docs/04`) show how each one is reached and seen; the architecture (`docs/05`–`08`) makes each one possible; the roadmap (`docs/11`) says when. Written 2026-10-28 from the owner's briefs of 2026-10-27/28 (quoted where they define the use case; Hebrew quotes translated) and from the lead's analysis of what running a hyper-agile, AI-integrated, flat company with explicit responsibilities needs.
>
> **How to read:** each use case has an id (`UC-<area>-<n>`), the actor, the trigger, what happens, what the system must provide, and the AI's part. "Owner" is the founder; "role holder" is a person who holds decision rights in a domain; "agent" is an AI actor (the embedded assistant, a proactive agent, or the Claude Code coordinator). Every use case must be achievable **both in the interface and by asking the AI** (principle 2 of `docs/00`).

---

## A. The company at a glance

> Owner: "A company-wide task board with everything that is happening, goals, who is handling what, every deliverable connected to its task, dependencies, schedules where relevant, what is stuck and on what. The wet dream of every company."

**UC-A1 · The whole company on one map.** The owner opens Lucid Total and sees the company as a map: domains as regions, programs and epics as areas inside them, active work as activity in those areas, goals as the horizon; heat shows where things move, where they are stuck, where decisions wait. One glance answers "where are we". Requires: the map view (`docs/03`), roll-ups of state per grouping, stuck/blocked/decision-needed signals, a legend of meaning glyphs.

**UC-A2 · Zoom from goal to detail.** From the map the owner zooms into Engineering → the private-beta program → an epic → a task → its evidence, and back out, without losing orientation; breadcrumbs and the "you are here" indicator keep the path. Requires: continuous zoom levels with coherent transitions; every level shows the same item in the arrangement fit for that level.

**UC-A3 · Overlaps shown as overlaps.** The "Europe launch" program spans Compliance, Marketing and Engineering. On the map it appears once, drawn across the three regions; zooming into Marketing shows the Marketing part of it, with a visible edge saying "continues in Compliance". No duplicated cards, no copy drift. Requires: many-to-many groupings, overlap rendering, consistent identity across regions.

**UC-A4 · What is stuck and on what.** A filter or a question ("what is stuck?") returns every blocked item with the blocker named (a person, a decision, an external account, another task, a missing credential) and the time it has been stuck; from each, one tap to the blocker. Requires: blocked state with a typed reason, dependency graph queries, age of state.

**UC-A5 · Goals, targets and the path to them.** Objectives (e.g. "private beta with 200 users in three markets by week 24") show the programs that serve them, the share done, the forecast date and the risks. Requires: objective items, contribution links, roll-up and forecast.

**UC-A6 · Who is handling what.** Each person and agent has a visible working line and a workload picture (items in progress, due, blocked, waiting on them). The owner sees that the compliance lead is waiting on three decisions and that the coordinator is on wave 71. Requires: assignment, working lines, load roll-up per person.

**UC-A7 · Every deliverable connected to its task.** Documents, PRs, screenshots, reports, walkthrough evidence, mocks, data pages all hang off the item they fulfil; an item's "Result" column lists them beside the "Expected" column. Requires: evidence model, link/attachment handling, expectation vs result layout.

**UC-A8 · Schedules where relevant.** Items that have dates (store submissions, legal deadlines, campaigns, investor meetings) appear on a timeline; items without dates do not pretend to have them. Requires: optional dates, timeline view, deadline glyph, calendar export.

## B. Running development (Lucid Chat is the first tenant)

> Owner: "move our development operation to run through it … this will replace the checklist, and will have a live report of what any agent is currently working on … all tasks must be tracked and updated when done … translate (and in the process evaluate) all the work that has been done."

**UC-B1 · A task with everything needed to build it.** A workstream agent opens its task and finds: the goal in one paragraph, the context (why, which docs, which sections, which contracts and mocks), technical data (packages, endpoints, schemas, flags), infrastructure (which Railway environment, which services), the definition of done (tests, docs, walkthrough, acceptance criteria), dependencies and what this task blocks. Requires: the task template of Lucid Chat's brief (`docs/templates/task-brief.md`) as structured fields, not prose only.

**UC-B2 · Expectation beside result.** When the task is done, the same card shows, side by side: expected (acceptance criteria, mock frames, metrics) and actual (test counts, walkthrough screenshots, measured latencies, the reviewer's verdict, deviations and why). A reviewer compares in seconds; the owner sees at a glance whether a green row is really green. Requires: per-criterion status (met / partly / not met / not checked) with evidence links; the AI's evidence check.

**UC-B3 · Comments and feedback before, during and after.** The owner comments on a card before it starts ("make the sheet opaque on Android"), during ("the Hebrew is off") and after ("this is not what I meant by…"); each comment may update the task's content (scope, acceptance) with attribution; the agent working on it is notified; the card's history shows what changed because of which comment. Requires: comment thread per item, "apply to card" from a comment, change history, notification to the assignee and the coordinator.

**UC-B4 · Dependencies both ways.** From a task the agent sees what it depends on (and whether those are done) and what depends on it (so a delay is understood). A dependency graph view shows the critical path to a gate. Requires: typed relations (`blocks`, `depends_on`, `parent`, `subtask`, `spawned_by`, `relates`), cycle detection, critical path.

**UC-B5 · Human chores are tasks.** "Open the Apple Developer account", "add a credit card to Railway", "test the TestFlight build", "answer the five open decisions", "sign the DPA" are tracked with the same model; they appear in the owner's inbox, carry what is needed (links, which card, what to paste back), and block the technical tasks that wait on them. Requires: `chore` kind, assignee = a person, "waiting on human" state visible on the map, reminders.

**UC-B6 · The live agent report.** Each agent (the coordinator, each worker in its worktree) posts a working line ("wave 71 B: dispatcher sequencing, running integration suite") on start, on meaningful change and on finish; a panel shows every agent's line, age and the item it is on; nothing else is posted unless state changes. Owner: "I don't want over reporting, but I do want to track where things stand." Requires: working-line API with heartbeat, a live view, change-only notifications.

**UC-B7 · Waves, briefs, merges and follow-ups.** The coordinator creates a wave (a grouping) with its tasks, attaches the briefs, moves tasks through brief → doing → review → done, records the merge commit, and spawns follow-up tasks (`-F1`, `-F2`…) from review findings, each linked to its origin. Requires: the coordinator protocol (`docs/08`), templates, follow-up linkage.

**UC-B8 · Phase gates.** A gate (Gate 1 Alpha) is a milestone item with its criteria; the map shows how many of its tasks are done, which criteria are met, what blocks it; the gate report is generated from the evidence. Requires: milestone kind with criteria, roll-ups, generated reports.

**UC-B9 · Import and evaluate the existing work.** The ~2,400 checklist rows, the decision log (L1–L500+), briefs, walkthrough reports and ADRs of Lucid Chat are imported as items with their ids, status, dependencies and evidence links. During import each row is evaluated: does its status match its evidence? Are there follow-ups without a parent? Items with doubtful status are marked "to verify" and queued for the coordinator. Requires: importer (`docs/10`), evaluation rules, the AI's evidence read.

**UC-B10 · Quality, cost and performance in one place.** Eval runs, cost per wave, latency measurements and the nightly CI chain report into Lucid Total as evidence and as metrics on the relevant items; the status, quality and cost pages of Lucid Chat's status site become views here. Requires: metric attachments, metric widgets on items and groupings, a page per metric family.

**UC-B11 · Error and incident intake from systems.** A failing nightly run, a Railway deploy failure, a crash report or a server alert creates or updates an incident item with its context, assigns it per the on-duty rule and notifies; duplicates fold into one. Requires: inbound webhooks, dedupe keys, incident kind, routing rules.

## C. Decisions, strategy and change

> Owner: "decisions can be taken quickly, implemented quickly — even big decisions — we now want to focus on Europe, so now all compliance tasks take priority, marketing should allocate more budget, things to do with Europe get more attention for everyone across the board, their tasks take higher priority while maintaining the rest of the work. So decisions and strategy changes are also implemented and disseminated."

**UC-C1 · A strategic decision changes the map.** The owner says "we focus on Europe now". Lucid Total proposes a change set: priority boosts for items tagged Europe or in the Compliance (EU) program, a budget shift to Marketing EU, attention changes (what each person sees first), deadlines pulled in, and a notice to everyone affected. It previews the consequences (what slips, who is overloaded, which dates move) and applies on confirmation; the decision is an item linked to every change it caused. Requires: decision kind with options and chosen option, propagation engine with preview, priority model, attention model, mass notification with per-person relevance.

**UC-C2 · See the effect of a change before making it.** Before moving a release two weeks, the role holder sees which campaigns, compliance deadlines and tasks shift, which people lose or gain load, and which goals' forecasts move. Owner: "we also need to show how changes propagate, how they affect the workload, what happens if I make a small or large change to a process or a project." Requires: what-if mode (a draft change set over the model), delta rendering on map and timeline, load and date forecasts.

**UC-C3 · Material decisions reach the right person, one at a time.** Only decisions with deep implications reach the owner; each with full context and cost in plain words; small things become settings; very small ones the lead decides and logs (Lucid Chat rule L425). The owner's inbox never holds a list of tens of confirms. Requires: decision kinds with "materiality" and routing rules, the decision card format, the owner's inbox.

**UC-C4 · Anyone proposes; role holders decide.** A developer proposes a new task, a change to a process, or a strategy idea; it surfaces to the colleagues or the role holder it concerns; they accept (it becomes an item or a decision), decline with a reason, or ask for more. Requires: `proposal` kind, routing by domain, accept/decline/ask flow, visibility to the proposer.

**UC-C5 · Decision rights are explicit in a flat company.** Who may change priorities in Marketing, who may approve spend above a threshold, who may move a release, who may change a compliance deadline: configured per domain and decision kind; the UI and the AI respect it; attempts outside one's rights become proposals automatically. Requires: rights model (`docs/07`), enforcement in the action layer, graceful downgrade to proposal.

**UC-C6 · Decisions taken in a meeting land on the map.** In a product meeting the owner talks to Lucid Total: "we decided: Relay ships in beta; drop the Coach from alpha; Dana owns EU consent texts." Each becomes a decision item with consequences applied (tasks moved, assignee set, notifications sent), while the meeting continues. Owner: "Working conversations directly with it in a meeting, with decisions to execute. Things happen as you ask for them." Requires: meeting mode (the perspective centred on the meeting's subject), fast decision capture, voice input, confirmations batched at the end of the meeting where reversible, immediate where asked.

**UC-C7 · Reverse a decision.** A decision applied yesterday turns out wrong; the owner reverts it, and every change it caused is reverted where still possible, with the ones that cannot be listed. Requires: change sets as first-class, reversible operations, conflict listing.

**UC-C8 · Strategy as a living layer.** Goals and strategic emphases (markets, themes, bets) are items with weights; priorities of work derive partly from them; changing the weights re-ranks the company's attention. Requires: priority formula with explicit, visible factors (strategic weight, deadline, blocking, age, role holder override).

## D. The embedded AI

> Owner: "embedded AI connectivity, with ability to choose models (including Fable) … I want to be able to tell it what I want and for it to do it: follow up on X, set reminders, send emails to users about tasks that concern them and notify them through the system … a Claude agentic framework, and a full chat interface … access to the task data in full and the codebase, documents, everything … smart agents answering questions about the project and helping organise the work … final and actual work is always to be done by the Claude Code coordinator … but answers, assistance and updating tasks will be done with the help of embedded AI."

**UC-D1 · Ask anything about the company.** "What is blocking Gate 1?", "What did we decide about Relay originals?", "Which tasks mention the Android glass fallback?", "How much did wave 57 cost?" The assistant answers with citations (items, documents, decisions, commits) that open in place. Requires: retrieval over items, docs, code, decisions, conversations (`docs/06`), citation chips, answer streaming.

**UC-D2 · Tell it what you want; it does it.** "Move all EU compliance tasks to top priority", "assign the consent texts to Dana", "create a chore for me to add the Railway card by Friday", "close L489-F3 with this walkthrough as evidence". The assistant shows a preview of the actions, asks for confirmation where the action is irreversible or outside a budget, executes, and shows the result with undo. Requires: action registry as tools, preview and confirm cards, undo, rights enforcement.

**UC-D3 · Follow up on X.** "Follow up with the Apple account chore every two days until done", "remind me Monday to review the beta report", "ping the coordinator if wave 71 is not merged by tonight". The assistant creates follow-up agents (scheduled checks) that act within rules and report only on change. Requires: scheduler, follow-up agent kind, quiet by default.

**UC-D4 · Email and notify people about what concerns them.** "Email the beta testers whose issues were fixed this week", "tell everyone on the Europe program about the new deadline". The assistant drafts, shows recipients and text, sends on confirmation through the mail adapter and through Lucid Chat where the person is on it; delivery and replies attach to the items. Requires: audience queries, draft/approve/send, mail adapter, Lucid Chat API, reply threading to items.

**UC-D5 · The AI asks for feedback on cards.** Where a card lacks a decision or acceptance is ambiguous, the assistant posts a feedback request on the card addressed to the right person; the request appears in their inbox with the card context; the answer updates the card. Requires: feedback-request kind on comments, inbox routing, "apply answer to card".

**UC-D6 · Choose the model.** Per conversation or per agent the user picks the model class (fast / standard / strongest, with Fable where the owner has enabled it); the system shows cost and the choice in the thread; proactive agents run on the smallest model that passes their eval. Requires: model gateway with a registry, per-conversation choice, cost display, budgets.

**UC-D7 · Context from code and documents, not only tasks.** "How does the dispatcher decide fail-open?" is answered from Lucid Chat's docs and code (indexed read-only from the repository), with file and section citations; "what changed in the last wave?" from commits linked to items. Requires: code and docs indexing, symbol-aware chunking, freshness tracking.

**UC-D8 · The coordinator does the real work.** When a request needs engineering ("build the SSO"), the assistant does not pretend: it creates or updates the task with the brief and hands it to the Claude Code coordinator (Fable, or Opus when context is short), whose working line and results flow back. Owner: "final and actual work is always to be done by the Claude Code coordinator running the show." Requires: handoff protocol (`docs/08`), clear boundary between assist/organise and build.

**UC-D9 · Modern chat.** Threads per topic, streaming, markdown and tables, attachments and screenshots, voice input on the phone, slash commands for common actions, a side panel that shows the items and documents the answer used, pinned conversations, searchable history, per-thread model and tool permissions. Requires: chat UI spec (`docs/02` §AI), conversation persistence, tool-result rendering.

**UC-D10 · Proactive but quiet.** The assistant notices: a task has been "doing" for twice its estimate; a decision has waited five days; two items look like duplicates; a chore blocks four tasks. It raises one card or one line in the right inbox, never a flood. Requires: proactive agents with thresholds as settings, dedupe of alerts, per-reader cadence.

**UC-D11 · Any AI, not only ours.** External agents (the Claude Code coordinator, future vendor agents) use the same tools through an MCP-style server and REST; what they can do is bounded by their service account's rights. Requires: tool surface for external agents, service accounts, audit.

## E. People, perspective and workload

> Owner: "the focus for the CMO is a marketing view, the focus for the CTO is how things look in the company through the perspective of R&D … tasks are surfaced and prioritised according to the person that is viewing, and if we are in a meeting about a subject, the view aligns with that as well."

**UC-E1 · My world.** The CMO's home map is centred on Marketing: campaigns, launches, budgets, the dependencies on Engineering releases and Compliance approvals drawn as roads into the neighbouring regions; the rest of the company is present but at the horizon. The CTO sees the inverse. Requires: perspective model (role → domains → emphasis), re-centring, the same items in both views.

**UC-E2 · My work, now.** A person's list shows what they should do next, ranked by the priority model with the reason shown ("blocks 3 items in the EU program", "due Thursday", "owner asked"), what waits on them (decisions, feedback, reviews), and what they are waiting for. Requires: ranked personal queue, reasons visible, waiting-on both ways.

**UC-E3 · Meeting mode.** Starting a meeting on "beta readiness" re-centres the map on the beta program for all attendees, surfaces open decisions and risks for that subject, and captures decisions and tasks as they are spoken (UC-C6); the meeting leaves a summary item linked to everything it touched. Requires: meeting item kind, shared perspective, capture tools, summary generation.

**UC-E4 · People signals, respectfully.** Owner: "you'll get messages like 'these employees aren't doing well'." Lucid Total reports *work* signals: a person's queue growing while completion falls, items repeatedly reopened, long "doing" times, many blocks. It reports them to the person first (as help: "you are carrying 12 items; 4 could move to…") and to their role holder as a workload concern, never as a verdict about the person; the thresholds are settings; the signals are explainable from items. Requires: workload metrics per person, explanation, routing rules, tone rules for the AI.

**UC-E5 · Onboarding a person or an agent.** A new colleague or a new agent gets a perspective, rights, and a guided map of their domain; the AI answers their questions from the company model; their first tasks come from the queue. Requires: role templates, perspective templates, the AI as onboarding guide.

**UC-E6 · Time tracking without ceremony.** Time is captured from working lines (start/stop of "doing"), from agent runtimes, and from explicit entries; estimates vs actuals show per item and roll up per grouping and person; the AI answers "how long do waves take now?". Requires: time entries, estimate fields, roll-ups, agent runtime capture.

**UC-E7 · Availability and capacity.** Time off, part-time, agent slots (how many workers can run in parallel on the 16 GB machine) are capacity inputs; forecasts and propagation previews use them. Requires: capacity model per person/agent, calendar input.

**UC-E8 · External collaborators.** A lawyer, a designer, a beta tester sees only the items they are on, can comment and attach, and gets emails or Lucid Chat messages for what concerns them. Requires: visibility scopes, guest accounts, limited perspective.

## F. Customers, issues and incidents

> Owner: "also issues — support issues from customers, errors, bugs, system issues — it's a unified tracking system for the company that tracks everything we need to do."

**UC-F1 · A customer reports a problem.** A beta tester's report (from Lucid Chat's "Report a problem", an email to beta@belucid.chat, or a form) becomes an issue with its context (device, version, what they chose to send), linked to the person; triage assigns kind (bug, question, abuse, feature), severity and owner; the customer gets an acknowledgement and later the resolution through the channel they used. Requires: inbound connectors, issue kind, triage (AI-assisted), customer link, outbound notice with consent and minimal PII.

**UC-F2 · Bugs become engineering tasks without losing the customer.** A bug links to the task that fixes it; when the task closes, the bug's customers are notified (UC-D4) and the bug closes on verification. Requires: relation `fixes`, cascade rules, verification state.

**UC-F3 · Incidents and system errors.** Alerts from Railway, the nightly chain, the server's health checks and error reporting create incidents with severity and on-duty assignment; the incident timeline collects every action; a post-incident item collects follow-ups. Requires: incident kind, timeline, routing, follow-up spawning.

**UC-F4 · Support knowledge grows from resolutions.** Resolved issues feed a knowledge set the assistant uses to answer the next similar report (and, later, Lucid Chat's business features). Requires: resolution capture, retrieval over resolutions.

**UC-F5 · SLAs and response times.** Issue kinds carry response and resolution targets (settings); breaches surface on the map and in inboxes. Requires: SLA settings, timers, breach signals.

## G. Notifications, reminders and reports

> Owner: "you'll get messages like 'you need to call the investor to set a meeting'."

**UC-G1 · The right nudge, in the right place.** "Call the investor to set a meeting" reaches the owner as a reminder in Lucid Total, by email if they asked, and in Lucid Chat as a message from Lucid Total, once, with the context (the investor item, last contact, what was promised). Requires: reminder kind, per-person channel preferences, dedupe across channels, context card.

**UC-G2 · Briefings at my cadence.** A morning briefing for the owner (what moved, what is stuck, what needs them today), a weekly digest for the team, a gate report when a gate closes; each reader sets cadence and depth; nothing is sent twice. Requires: scheduled briefing agents, per-reader settings, generated summaries with citations.

**UC-G3 · Change-only notifications.** A person is told when an item they follow changes state, when they are mentioned, when something they wait on completes, when a decision needs them; not on every comment unless they asked. Requires: subscription model, state-change events, mention detection.

**UC-G4 · Reports as views, not documents.** Progress bars that count subtasks (Lucid Chat's rule L382), the remainder split into owner-blocked and schedulable, days left at the current pace, quality/cost/performance together (L495): all are live views over the model and exportable as a snapshot. Requires: report widgets, snapshot export, the metrics model.

## H. Secrets and secure delivery

> Owner: "allow secure storage and transport mechanisms so we can deliver things like API keys etc. securely via the chat itself and the application, in dedicated windows or whatever is suitable for the case."

**UC-H1 · Hand a key to the coordinator.** The owner has an Apple App Store Connect key. In the chat they say "I have the ASC key for the release"; Lucid Total opens a sealed envelope window (never the chat input), the owner pastes the key, names the recipients (the coordinator's service account) and expiry; the envelope is stored encrypted; the recipient is notified and reveals it once: a person in the dedicated reveal window, an agent through the API inside its own process with its local key (`docs/07` §5.5); the reveal is audited; the chat shows only "envelope delivered". Requires: envelope kind, sealed storage with per-envelope keys, reveal window, one-time and timed reveal, audit, AI that routes but never reads.

**UC-H2 · Collect credentials for a chore.** A chore "open the SendGrid account" ends with an envelope step: the human puts the API key into the chore's envelope; the dependent task unblocks and its agent gets the envelope. Requires: envelope steps in chores, unblock on delivery.

**UC-H3 · Rotation and revocation.** Envelopes list where a secret is used (Railway variable names, services); a rotation chore is generated on expiry; a revoked envelope's recipients are notified. Requires: usage links, expiry agents.

**UC-H4 · Sensitive material in items.** Customer PII, legal documents, financials carry a sensitivity level that limits visibility, retrieval indexing and AI access (the model never sees content above its conversation's clearance). Requires: sensitivity field, indexing rules, prompt-assembly filters.

## I. Integrations: hook into everything, replace much

> Owner: "have APIs that can hook up into all organisation's systems (and replace many of them, since this becomes the core of visibility and action; they both live here)."

**UC-I1 · Code and deploys reference items.** Commits and PRs carrying an item id (`[P1-C-03]`) attach to the item; merges to main move the item's build state; a Railway deploy or failure attaches to the release item. Requires: GitHub and Railway connectors with id parsing, event mapping.

**UC-I2 · Email in and out.** Mail to task@/beta@/support@belucid.chat becomes items or comments; replies to Lucid Total notices thread onto the item. Requires: inbound mail adapter (Lucid Chat's mail bucket is the first source), outbound adapter, threading headers.

**UC-I3 · Lucid Chat as a channel.** A person on Lucid Chat receives Lucid Total messages (reminders, decisions needed, resolutions) in a conversation with "Lucid Total" and answers there ("done", "approve", "move to Friday"); the answer applies through the same actions. Requires: Lucid Chat API client (bot identity), two-way mapping, the same action layer.

**UC-I4 · Calendar and meetings (later).** Meetings import from calendar; meeting mode starts from the calendar event; decisions flow back. Requires: calendar connector.

**UC-I5 · Replace tools.** The status site, the checklist, the decision log pages, the quality and cost pages, the decisions page of Lucid Chat retire; what they showed are Lucid Total views (`docs/10`). Later, support inboxes, roadmap tools and OKR sheets. Requires: feature parity per retired tool, redirects.

**UC-I6 · Open API for everything.** Every action and query is available over REST with API keys per service account; webhooks deliver events; an MCP server exposes the same tools to AI agents. Requires: `docs/08`.

## J. Lucid Total runs itself and becomes a product

> Owner: "In the end we'll even sell Lucid Total."

**UC-J1 · Dogfooding from day one.** Lucid Total's own build is tracked in Lucid Total as soon as items and chat exist; Google SSO is its first tracked task. Requires: bootstrap mode with the owner account and agent service accounts.

**UC-J2 · A second company.** A later tenant gets its own instance (or tenant) with its own domains, roles, perspectives, connectors and AI budget; nothing of Lucid's leaks. Requires: tenancy boundary designed in (schema per tenant or tenant id everywhere), configuration as data.

**UC-J3 · Lucid Total inside Lucid Chat.** A company using Lucid Chat for business sees its Lucid Total in the app: the inbox, decisions and the assistant. Requires: Lucid Chat surface API (later), shared identity mapping.

## K. Change prediction and transparency

**UC-K1 · A small process change.** "Every wave now needs an iOS simulator run." Lucid Total shows which open tasks gain a step, how much time that adds per wave at measured durations, and which gates move; applying it adds the step to the templates and the open tasks. Requires: process templates as data, propagation to open items, duration statistics.

**UC-K2 · A large project change.** "Drop the Coach from alpha." Preview: which tasks close or move to beta, which dependencies break, which mocks and docs need updates, what capacity is freed; applying creates the moves, the doc-update tasks, and the notices. Requires: scope operations over groupings, dependency re-check, generated follow-ups.

**UC-K3 · Watching the effect.** After a change, a "since the decision" view compares predicted and actual: dates, load, throughput; misses feed the forecast model. Requires: change-set baselines, comparison views.

**UC-K4 · Explain this priority.** On any item the priority and its ranking are explained from their factors; a role holder can override with a reason that stays visible. Requires: explainable priority, override with reason.

## L. Governance, audit and trust

**UC-L1 · Who did what, for whom.** Every change lists the actor, the person it acted for (an agent acting on the owner's request), the reason, the before and after. Requires: audit log on the event stream, UI history per item.

**UC-L2 · The AI stays inside its rights.** An agent asked to do something beyond its service account's rights turns it into a proposal and says so; irreversible actions always confirm; budgets (AI spend, emails per day, mass changes) are enforced and visible. Requires: rights enforcement in the action layer, confirmation classes, budgets as settings.

**UC-L3 · Nothing silently disappears.** Deletions are soft, archived items stay searchable, and an item's history survives moves between groupings. Requires: soft delete, archive, history retention.

**UC-L4 · Export everything.** The company model exports as JSON and Markdown (items, relations, comments, decisions) at any time, so Lucid Total never locks the company in. Requires: export job, documented format.

## N. Asks: everyone can raise, the responsible decide

> Owner (2026-10-28): "All users should be able to make suggestions, request features. Things from support can filter up as feature requests. It can be any ask from another domain, and it should be surfaced and go to whomever is responsible, to decide if actions are needed, if and what to do, if to turn it into a task."

**UC-N1 · A team member suggests a feature.** Noa, in Engineering, thinks the admin console should show the policy diff. She raises an ask in two sentences (or tells the assistant). The ask routes to the Product role holder; it appears in their inbox with the AI's summary, related items (an existing task that overlaps) and a suggested decision; the role holder turns it into a task, declines with a reason, or asks Noa for more. Noa sees the state of her ask at every step. Requires: `ask` kind; routing by domain and subject; related-item suggestions; asker visibility; decision outcomes (act → items created with `spawned_by`; no action with reason; more information).

**UC-N2 · Support filters up.** Several beta testers report the same friction (the Hebrew sign-in code field). Support issues are linked; the triage agent proposes an ask "Feature: … (from 4 issues)" to Product, carrying the issues as evidence and the customers to notify when it ships. Requires: issue → ask aggregation; the ask carries its sources; cascade notices on resolution (UC-F2).

**UC-N3 · A cross-domain ask.** Marketing needs a screenshot set of the Relay flow for the launch page by the 15th; the ask goes to Engineering's lead, who decides it is a task, assigns it, and the task shows Marketing as the requesting domain with the date; the campaign item depends on it. Requires: asks with a requesting domain and a target domain; acceptance creates items with the dependency to the asker's grouping.

**UC-N4 · An external asks.** The accounting firm asks for the Q3 vendor invoices. The ask arrives (through their external view or by email as a virtual party) and routes to Finance; the answer travels back on the same channel; both sides see the state. Requires: parties as askers; channel-aware routing (`docs/08` §6).

**UC-N5 · Asks that become decisions or strategy.** A board member suggests entering a new market. The ask routes to the owner as a proposal; if taken up it becomes a decision with its change set (UC-C1). Requires: ask → proposal → decision chain with the asker kept informed within their compartment.

**UC-N6 · Nothing falls through.** Asks have an owner from the moment they exist (the responsible role holder by routing rules, the domain lead by default, the owner as last resort); ageing asks surface like ageing decisions; the asker can escalate once. Requires: routing fallback, ageing agent, escalation rule.

## O. The system grows with the company

> Owner (2026-10-28): "The system must evolve with the company, in its function and in its reality, and in its codebase and complexity. Now we are two people in the company and we have direct focus, although already there are many tasks and things in the air; the more this moves, the higher the complexity, the more 'zoomed out' we should be, and more people will be involved."

**UC-O1 · Two founders, direct focus.** With two people the home view is close-up: the current wave, the owner's decisions, the agents' lines; groupings are few (phase, wave, domain); most agents are off or at `suggest`; notifications are immediate. Requires: company scale `founders` defaults (`docs/02` §2.8).

**UC-O2 · Growing: zoom out by default.** When people, domains and groupings pass thresholds (settings), Lucid Total proposes the next scale: the home map opens one level higher, programs appear as the unit of attention, briefings replace immediate notifications for most classes, more proactive agents turn on, delegation rules and approval thresholds become explicit. The owner confirms the scale change with a preview of what it changes. Requires: scale detection signals, scale change as a decision with preview, per-scale defaults.

**UC-O3 · Complexity made visible.** A "shape of the company" view shows counts and depth (people, parties, domains, groupings, open items per person, decisions per week, asks per week, agents and their autonomy) and where structure is missing (items without a grouping, domains without a lead, asks without a route). Requires: structural metrics and gap detection.

**UC-O4 · The codebase and the model evolve deliberately.** New kinds, fields, playbooks and views are added as data and small modules when the company's reality needs them, never ahead of it; every addition is a card with the reason, and the complexity metrics (schema size, registry size, playbooks, lines of code) are shown in the Lucid Total program so growth is a decision, not an accident. Requires: configuration-first design, complexity metrics on the Lucid Total program, the roadmap's "add when needed" rule.

**UC-O5 · More people, same clarity.** Perspectives, compartments and routing rules make a company of thirty read as clearly as a company of two: each person sees their world, the owner sees the roll-ups, asks and decisions find their owners. Requires: everything in §E and §N at scale, load tests at 100k items (`docs/09`).

## P. Externals as participants ("human APIs")

> Owner (2026-10-28): "We need the ability to share part of the picture and manage it with externals, not just people from the company, while the externals have visibility into their own domain and relation to the company. They are like 'human APIs' or integration points: they can influence and contribute into the system in their own domain, with limited visibility. Contractors, board members, accounting services, legal, whatever, and there can be many. They can interface directly as a user of the system with external views, or through regular interfaces where they exist as a virtual entity (the system contacts and manages communication with them via email or text), and their profiles can connect and materialise if we allow them to use the system directly. All company interfaces go through this: from production management and support all the way to managing salaries. Security, encryption and integrity are an important and high priority."

**UC-P1 · A contractor works inside their compartment.** A designer contracted for the launch site signs in with an external view: their items, the groupings they are engaged in (the launch campaign), the people they work with, the comments and asks that concern them; no map of the company, no other domains. They upload deliverables as evidence, complete chores, raise asks, and get notifications on their channel. Requires: `party` with an `engagement` (domain, groupings, role, dates, terms link); compartment enforcement at the data layer; the external view (reduced rail; `docs/03` §10).

**UC-P2 · The accounting firm as a virtual participant.** The firm does not use Lucid Total. Finance's monthly close has a chore "collect payroll inputs from the accountant"; the system emails the accountant on the company's behalf (drafted by the AI, approved per autonomy level), tracks the reply, attaches the returned file as evidence (sensitive, Finance compartment), and marks the chore done; the accountant's party page shows the thread, the open asks to them and the deadlines. Requires: virtual party mode; outbound and inbound mail threading to the party and item; the party page; sensitivity on attachments.

**UC-P3 · Materialising a profile.** Later the firm's contact is invited to use the system directly; their virtual profile becomes a direct user with the same compartment; the email history stays on their party page. Requires: party identity continuity (one party, two modes), invitation with compartment preview, SSO or magic-link sign-in for externals.

**UC-P4 · A board member sees the board compartment.** Board members see goals, the board pack items, decisions escalated to the board and their own asks; they can comment, ask and vote on board decisions; nothing operational leaks. Requires: a `board` compartment template; board decision kind; compartment-scoped briefings.

**UC-P5 · Legal counsel receives sealed material.** A contract draft (restricted) goes to counsel as an envelope or a compartmented item with field-level encryption; their comments return in the same compartment; the engagement's end date revokes access automatically. Requires: envelopes to parties; restricted items visible in a compartment; time-bound engagements with automatic revocation.

**UC-P6 · Payroll and HR through the same system.** Salaries, contracts and personal data are items and fields in the People and Finance compartments with the highest sensitivity: field-level encryption at rest, access by named roles only, every read audited, never indexed or sent to a model, exported only as envelopes. Requires: `restricted` and `payroll` sensitivity classes, field-level encryption (`docs/07` §6b), read audit, retrieval and prompt exclusion.

**UC-P7 · Many externals, one picture.** Suppliers, agencies, auditors and partners each have a party page and compartment; the map shows them as embassies at the company's border with their engagement state (active, waiting on us, waiting on them, overdue); the owner asks "who are we waiting on outside the company?" Requires: party roll-ups, border rendering (`docs/03` §3), waiting-on relations across the boundary.

**UC-P8 · Externals as integration points.** A party can be a system as much as a person: a vendor's API account, a payroll provider's webhook, a bank's statement feed: the same party model with a service-account mode and the same compartment, so "who touches our finance data" is one list. Requires: party modes `direct` · `virtual` · `system`; the connector model (`docs/08` §6) hangs off parties.

**UC-P9 · Security review before admitting externals.** Before any party is admitted, the cross-tenant and cross-compartment suites, the field-level encryption invariants and the audit integrity check pass; a pen-test precedes the first external payroll or board use. Requires: `docs/07` §9b gates; `docs/09` security suite.

## Q. Seeing: the Stage, places, products, aspects (owner, 2026-10-28, T25)

- **UC-Q1 The AI shows me what I need.** "Show me how marketing sees Europe", "just the money", "as a timeline": the Stage recomposes; every scene is also reachable by navigation and carries a back. Acceptance: the scene passes the attention budget; the person names its focal subject in two seconds.
- **UC-Q2 A place I can recognise.** Every region of the world has a name, a subject, a glyph, a hue and a landmark; I know where I am without reading. Zooming into a place reveals the sub-places that were faintly there (`docs/13` §5.2).
- **UC-Q3 The product is visible.** An item with a product shows it as its facade on the world and large on its page: the mock as the expectation, the screenshot or output as the result, compared visually; a finished product stays as a landmark of its place.
- **UC-Q4 A done item shows its implications first.** Opening a done item shows the ripple: what it unblocked, which roads opened, which dates moved, which goal advanced, who was told, the lesson.
- **UC-Q5 An aspect of the company.** Delivery, Customers, Money, People, Risk, Market, AI operations, System health as composed scenes; one tap from a metric into the places behind it; quiet by default.
- **UC-Q6 An infographic for a story.** "Make the quarter's picture for the board": one screen, three to five visuals, one sentence each; shared inside the board compartment; re-rendered from live data when opened.
- **UC-Q7 The grammar grows.** A request needs a visual the catalogue lacks; the composer proposes the component; it is built, reviewed, tested in all themes and both directions, installed, and used from then on.
- **UC-Q8 Never overwhelmed.** On any screen, at most three things need me, few numbers, alarms only for failing or breached states; dense instruments are chosen, not default.

## R. Deciding and simulating (owner, 2026-10-28, T25)

- **UC-R1 The Fork.** A decision arrives as paths with drawn consequences; I choose by picking the path; the context is two sentences and one visual; cost and toil first; reversible until the mark; one at a time.
- **UC-R2 Refocus.** "Focus on Europe": I move effort between places and watch the world re-forecast; the transparency strip says who and what moves; apply, save as a future, or discard.
- **UC-R3 Futures.** A strategic decision shows three small worlds a month out with their confidence as haze; the prediction is kept and compared with what happened.
- **UC-R4 Meeting at the Table.** Decisions spoken in a meeting become applied change on the shared Stage with undo; the minutes are a scene.
- **UC-R5 The small change.** One date moved shows its one-line strip of consequences before it is applied.

## S. The system runs itself (owner, 2026-10-28, T25; design in `docs/14`)

- **UC-S1 The System place.** Lucid Total's own subsystems are places with health, cost, open issues and the items being built for them; the owner sees them like any other place.
- **UC-S2 It notices.** A failing scene component, a slow query, a stuck agent, a cost spike, a retrieval miss, repeated corrections of its answers: each becomes an issue or an incident filed by the system, quietly, with its diagnosis.
- **UC-S3 It repairs with oversight.** The repair runs as items through Claude Code in a worktree; tests, evals and walkthrough evidence are attached; the deploy is staged with rollback; the monitor that found the problem confirms it is gone; the owner sees one line. Security-sensitive repairs always wait for a person.
- **UC-S4 It improves.** Evals, feedback, corrections and attention cost feed an improvement backlog of ordinary proposals; where it works well is shown as plainly as where it breaks.
- **UC-S5 AI processes are orchestrated.** Agents are processes in a process table with model class, cost, age and owner item; validation of outputs, confirmation of results, follow-up and maintenance are built into every run.
- **UC-S6 Models are configured decisions.** Enabling Fable, or any model, shows its capability, speed, cost, data terms and the data classes allowed to reach it; it is a reversible, logged decision.
- **UC-S7 Autonomy grows by trust.** A (domain × action class) advances up the ladder when its trust score crosses the threshold, by proposal and confirmation with a preview; it regresses on incidents; the Trust map shows where the system runs alone.
- **UC-S8 It builds its own subsystems.** "We need a Sankey of budget flows": a component task is briefed from the item, built by Claude Code, validated and installed; the same path builds Lucid Chat's features.

## T. Where you already are (owner, 2026-10-28, T25; design in `docs/15`)

- **UC-T1 A whole day in Lucid Chat.** The owner receives forks, glances and confirmations as Lucid Chat messages with reply options and answers them there; the world changes accordingly.
- **UC-T2 Decide by email.** A fork as a mail with a reply-to-decide block; a verified reply applies a reversible class; irreversible classes open the app.
- **UC-T3 The agent in Slack.** A member of the channels it is invited to: answers with citations, files commitments and asks from conversations as proposals shown back for confirmation, updates progress said in the channel, posts one quiet daily line; otherwise silent.
- **UC-T4 A status by voice.** "Where are we on the beta?" on the phone; the answer is a sentence and a scene sized for the phone.
- **UC-T5 Chief of staff.** Before a task starts, its context pack is ready; the first draft exists where it can; waits are chased; externals are reached; the loop is closed with evidence and one line.
- **UC-T6 Nothing leaks.** Restricted and payroll classes and envelope contents never leave for a third-party channel; parties receive only their compartment; every outbound message is audited.

## M. What the owner's brief did not name, and we must still cover

The lead adds these because a company operating system without them leaks work back into side tools:

| Need | Why it matters | Where covered |
|---|---|---|
| **Recurring work** (weekly refresh of the Railway CI token, monthly cost review, nightly chain checks) | Recurring chores otherwise live in calendars and heads. | Items with recurrence; `docs/02` §4 |
| **Templates** (task brief, walkthrough, gate report, incident, decision card) | Lucid Chat's `docs/templates/` become structured templates so items are born complete. | `docs/02` §4.6 |
| **Risk register** | Risks are items with likelihood, impact, owner and mitigations, shown on the map as weather. | `docs/02` §4 (kind `risk`) |
| **Budgets and spend** (AI cost per wave, Railway, vendors) | "Marketing should allocate more budget" needs budgets as items with actuals. | `docs/02` §4 (kind `budget`), §9 metrics |
| **Account and vendor inventory** (Lucid Chat's `docs/07a-accounts-to-open.md`) | Accounts, owners, keys (as envelopes), renewal dates, costs. | `docs/02` §4 (kind `account`) |
| **Compliance deadlines and filings** | Market opening has legal dates that gate launches. | `docs/02` §4 (deadline fields, `compliance` domain templates) |
| **Retrospectives and learning** | Each wave/gate leaves lessons as items linked to the process they changed. | `docs/02` §4 (kind `lesson`) |
| **Duplicate and stale detection** | Thousands of items drift; the AI sweeps for duplicates, orphans and stale states. | `docs/02` §7 proactive agents |
| **Search** across everything with filters, saved searches | A map is not a search. | `docs/02` §5.7 |
| **Undo everywhere** | Fast decisions need a fast way back. | `docs/02` §3 principles, §8 |
| **Offline-tolerant phone use** | Reading and commenting on the phone with poor connectivity. | `docs/02` §5.10 |
| **Accessibility** | Lucid's standard: WCAG 2.2 AA, screen readers, keyboard, reduced motion, high contrast. | `docs/02` §5.11, `docs/03` §9 |
| **Hiring and people processes** (later) | Candidates and onboarding as items. | `docs/02` §13 later |
| **Customer-facing status** (later) | A public page for incidents and release notes generated from items. | `docs/02` §13 later |
| **Knowledge base from resolutions** | Answers reused for support and for Lucid Chat business features. | UC-F4 |
| **Agent output quality** | Every agent's results reviewed; reviews as evidence; quality trends per agent and model. | `docs/02` §7, `docs/09` |
| **Owner bandwidth protection** | The owner's inbox is curated by rules (materiality); the AI batches the rest. | UC-C3, `docs/02` §6 |
| **Dependency cycles and impossible plans** | Detect and show cycles and over-committed dates. | `docs/02` §4.4 |
| **Time zones and working hours** | Reminders and briefings respect them. | `docs/02` §6 |
| **Data export and portability** | UC-L4. | `docs/02` §12 |
| **Asks, company scale and parties** | Added on the owner's 2026-10-28 instruction; see §N, §O, §P. | `docs/02` §2.8, §4.9, §4.10, §13 |
| **Field-level encryption and read audit for payroll-class data** | Externals and payroll through the same system raise the bar from access control to encryption and integrity. | `docs/07` §6b, §4 |
| **Engagement terms and time-bound access** | Externals come and go; access must end when the engagement does. | `docs/02` §4.10 |
| **A security review gate before admitting externals** | The first external with payroll or board access is a trust boundary move. | `docs/07` §9b, `docs/11` |
