# Lucid Total — The Experience (binding interface doctrine)

> Written 2026-10-28 after the owner reviewed mocks v0.1 and rejected their direction (T25 in `docs/12`). This document replaces the interaction stance of `docs/03-map-and-views.md` §1–§2 and governs every view, every mock and every scene the AI composes. Where an older document and this one differ, this one wins. Read with `docs/14-self-operation-and-ai-orchestration.md` (the system as an operating system) and `docs/15-presence-and-channels.md` (the system where people already are).

---

## 0. The owner's words, kept whole

"This is an operating system, not a reporting system. It is the futuristic mechanism that surfaces things to your attention and helps you take decisions and actions, and manages many things for you. That is what it should feel like, not a ticketing system. Think like a Jony Ive class designer and a Steve Jobs class product inventor. It is AI centric and AI driven: the AI will manipulate and show the interface as needed, by chat or voice command. There are also existing interfaces to navigate, but the key is allowing the AI to show you what you need to see, in the relevant way to you and to the context, visually, flexibly. It must be a very pleasant and visual work experience. It must never overwhelm the user with a lot of text and interface. The relevant context; everything else is noise. Help focus attention: minimal distractions, minimal alarms, not too much data visible at the same time. We understand visuals very quickly; a lot of text and many elements create overwhelming visual noise. Focus. Clarity. Correct context for the specific user and use case."

And from the first brief: what the goal of a task is, what the definition of done is, what the products are and what they look like, should be very clear at a glance; when it is a decision, context and visuals; when it is done, the implications. Regions of the map should each have a subject, a visual and a name; zooming into a region shows its sub-map. Decisions and the simulation of refocusing effort must be clear. Use cases must be visible in the mocks: daily use, meetings, a quick status. Graphs and visualisations where appropriate; dashboard-like views per aspect of the company; infographics made from components so the AI can build the right visual for a view, a ticket, a request, a dashboard.

## 1. What went wrong in v0.1, so it does not happen again

| v0.1 did | Why it reads as a ticketing system | The rule now |
|---|---|---|
| A permanent left rail with nine sections (Map, Inbox, My work, Boards, People, Issues, Decisions, Chat, Settings) | Navigation by category is the grammar of admin consoles; it says "go find your data" | No section rail. One dock of at most five glyphs, folded at the edge. Navigation is zoom and talk (§4) |
| Regions were polygons with a name and a number pill | A region without identity is a cell in a chart, not a place | Every place has a name, a subject, a glyph, a hue and a landmark illustration; sub-places are visible inside it before you zoom (§5) |
| Cards in state columns inside the map at Z2 | Columns of cards are the kanban grammar; the map became a wrapper for a board | At every depth the map stays a map. Items are buildings with facades that show the product. The board exists as a tool people can open, never as the home or as the map's deepest level (§5.4, §9) |
| The item page was tabs over a criteria table | Tables and tabs are the ticket grammar | An item opens as a **product view**: the product, large; the expectation beside the result as a visual comparison; the goal and the done-rule in one line each; the implications when done (§6) |
| Decisions were a card with four buttons and a text change set | A decision without a picture of its consequence is a form | A decision is a **fork**: options as paths, each with its simulated consequence drawn, one decision at a time, the context in two sentences and one visual (§7) |
| What-if was a side panel of counts | Counts are not a simulation | **Refocus** is a direct manipulation: move effort between places and watch the world re-forecast live, with the transparency strip of who and what moves (§7.2) |
| Dense tables, dense settings, dense inboxes | Density is the default of software that does not know what matters | The attention budget (§3) is enforced on every screen and every scene, and tested |
| Phone frames were the desktop map shrunk | A shrunk map is a condensed chart | The phone shows one place at a time, full-bleed, with its own layout (§10) |

## 2. The idea in one paragraph

Lucid Total has one world: the company as terrain, with places you can zoom into, where the work lives as buildings whose facades show what is being made. Over the world sits the **Horizon**: the few things that need you now. The AI is the operator of this world: it composes what you see (**the Stage**) from a grammar of visual components, for you, for the moment, for the question you asked; it surfaces decisions as forks with their consequences drawn; it does the work it is trusted to do and shows what it did as the change in the world, not as a log. You navigate by zooming and by talking. You decide by choosing a path. You see work done as implications. The interface never shows you more than you can take in, because the system knows what matters to you right now and treats the rest as ambient.

## 3. The attention doctrine (enforced, tested)

The scarce resource is the person's attention. Every screen and every AI-composed scene obeys an **attention budget**:

| Rule | Limit | How it is enforced |
|---|---|---|
| One focal subject per screen | 1 | The Stage renders one subject; everything else is ambient (dimmed terrain, folded dock) |
| Things that need you, visible at once | ≤ 3 | The Horizon shows at most three; the rest are "and 4 more", opened on demand |
| Distinct text elements above body size on a screen | ≤ 12 | A scene validator counts them; the mocks and the app fail review above the limit |
| Numbers shown on a glance screen | ≤ 7 | Counts are replaced by shape (rings, bars, heat) unless the number changes what you do |
| Alarms (interrupting colour or motion) | only failing / breached states | Amber and coral are reserved; nothing else uses them (`docs/04-mocks/README.md` hues) |
| Motion | only where something changed since you last looked | Heat breathes where things moved; a still world is a quiet world |
| Chrome (bars, rails, borders) | as little as the glass allows | The Lucid Glass surfaces carry structure; no frames around frames |
| Detail | one tap away, never ambient | Progressive disclosure: glyph → label on hover/long-press → panel on tap → page on open |

Scenes that exceed the budget are not rendered; the composer is asked to simplify (`docs/06` §6, scene validation). The product plan's acceptance for every view includes an attention test: a reviewer names the focal subject within two seconds and counts the things that need them without reading.

**Noise is anything the viewer did not come for.** The system knows the viewer (role, perspective, place in the company), the time (morning, before a meeting, end of the day), the context (a meeting, a question asked, a decision pending) and the scale of the company. From these it picks the focal subject; the rest becomes ambient.

## 4. The four modes of use, and the one shell

Everything the owner described happens in four modes; each has a home scene, and the AI composes it.

| Mode | When | Home scene | What is on it | What is not |
|---|---|---|---|---|
| **Glance** (five seconds) | Morning, between meetings, on the phone | **The Horizon** | The world breathing beneath; up to three things that need you, as cards with a visual each; goals as rings on the horizon line; the one-line "since you last looked" | Lists, tables, counts, nav |
| **Dive** (minutes) | "What is going on with Europe?", "Show me the beta" | **A place**, zoomed | The place's sub-map, its landmarks (products), its weather (risk), roads out (dependencies), presence; one aspect panel (delivery, money, customers…) chosen by the question | Other places (they are ambient at the edge) |
| **Decide** (a minute to an hour) | A decision reaches you | **The Fork** | The question in one line; context in two sentences and one visual; two to three paths, each with its drawn consequence; the recommendation; the cost-and-toil line; the reversible-until mark | A second decision; the inbox |
| **Meet** (an hour) | A meeting with a subject | **The Table** | The meeting's subject centred; its open forks and risks; the agenda as a path; decisions captured as they are spoken, each turning into applied change on the world with undo; the minutes as a scene when it ends | Everyone's inbox; unrelated places |

And one **shell** across all modes: **Talk**. A command bar at the bottom centre (text, voice, slash), always available, never in the way. "Show me how marketing sees Europe", "what's stuck on the beta", "refocus on Europe and show me what moves", "remind Dana about the DPA Thursday", "turn this into a task for the coordinator". The answer is a scene, an action with its preview, or both. The AI changes the Stage the way a person would change a slide: it does not navigate menus for you; it composes.

**The dock.** Five glyphs folded at the edge (bottom on the phone, start edge on desktop): Horizon · World · Me · Talk · More. "More" opens the tools (board, list, timeline, people, settings, issues, parties). Tools are not navigation; they are instruments you open when you need them and close.

## 5. The World: a map that is a map

### 5.1 Places have identity

A **place** is a domain, program, project, epic, release or any grouping (`docs/02` §4.2). Every place has:

- a **name** (short, as people say it: "Europe", "Beta", "Billing");
- a **subject**: one sentence of what it is for (shown on hover and in its card);
- a **glyph** from the kind families, a **hue** (family hue, stable), and
- a **landmark**: a small vector illustration that represents the subject (a skyline silhouette for Engineering, a lighthouse for Compliance, a harbour for Marketing, a vault for Finance, a bridge for Partnerships, a greenhouse for People, a workshop for Product, a loom for Design); the AI proposes one from a landmark library when the place is created; a person may change it; a photo or a product image may replace it at deeper levels;
- a **stable position** in its parent (laid out once, pinned; moved only by a person or when a sibling is added);
- **measures** that shape it: area (size of work, or the viewer's chosen measure), light (progress: a place brightens as it completes), heat (recent movement), weather (risk fronts), flags (decisions waiting), presence (who is there now).

A place looks the same at every zoom: the landmark is its identity when small, its emblem when large. Labels follow zoom: name only when small; name, subject and a ring of progress when medium; the full sub-map when large.

### 5.2 Sub-maps: zooming reveals, never replaces

Every place contains a map of its own. Its sub-places are faintly visible inside it at the parent level (soft inner contours, like districts seen from altitude) so that zooming in **reveals** detail that was already there. The transition is continuous: the place's contour becomes the frame of its sub-map, the landmark moves to its corner as the emblem, the sub-places' landmarks appear, then their labels, then their buildings.

| Depth | What the place shows | Inside it |
|---|---|---|
| Company | Domains as places with landmarks; the horizon of goals; embassies of parties at the coast; roads only when asked | Programs faintly as districts |
| Domain | Programs and projects as places, each with landmark, ring, flags; weather; presence; roads between them | Epics and streams faintly |
| Program / epic | Streams as districts; **buildings** (items) with facades; the critical road; the blocked road with a barrier | Item facades |
| Building (item) | The product view opens over the map, the map stays around it, dimmed | Evidence, comments, dependencies |

Overlapping groupings (a program across three domains) are one shape crossing borders; at the border a "continues" mark and a count. Items in several groupings are drawn once, in their home, with thin **membership rings** in the other groupings' hues.

### 5.3 Buildings show the product

Every item that produces something has a **product** (`docs/02` §4.4 expected vs actual). Its building's **facade** is the product's visual: the mock for a screen, the screenshot for a shipped one, the chart for an analysis, the cover for a document, the envelope glyph for a secret, the signature for a contract, the badge for a shipped build. Expected and actual facades are both drawn: an unbuilt building shows the expected facade as a translucent ghost; a built one shows the actual facade with a thin ring of its criteria (met · partly · not met · not checked). A finished product is a **landmark** of its place: finished things stay visible, so a place shows what it has made, not only what it still owes.

Items without a product (a chore, a reminder, a decision) are small buildings with their kind glyph; they never crowd the facades.

### 5.4 The terrain is honest

Area, light, heat and weather are computed from the data every viewer can inspect by tapping the legend chip. Nothing is drawn for decoration. A place with no open work is small and dim, not hidden. A stale place (no movement in the viewer's chosen window) loses heat and gains a faint haze. The map's measures are settings per viewer and per perspective, never hard-coded.

### 5.5 Perspective and meeting

A perspective (`docs/03` §5) still changes arrangement, size and emphasis; it never hides or duplicates. In this doctrine a perspective also selects the **aspect panel** that opens with a place (the CMO's place opens with the market aspect, the CTO's with delivery) and the facades that lead (the CMO sees campaign visuals; the CTO sees builds and screens). A meeting perspective is the Table (§4).

## 6. The item as a product view, not a ticket

An item opened from anywhere shows, in this order and with this weight:

1. **The product, large.** The actual facade if there is one; the expected (mock, sketch, spec image, example output) if not. Where both exist, the **comparison**: side by side, or a slider between expected and actual for screens, or overlaid for charts and documents; differences marked.
2. **The goal in one line**, and **the done rule in one line** ("Done when: 120 candidates across six languages, F1 ≥ 0.9, walkthrough published"). Criteria open as a ring that fills; each criterion is a segment with its evidence behind it, not a table row.
3. **The context strip**: why this exists (the parent goal, the decision that spawned it, the ask that raised it), who, where it stands, since when. Glyphs with labels on hover.
4. **The talk**: comments and the assistant in one thread, before, during and after; a comment can become part of the expectation with one tap ("apply to the expectation"), and the change is visible as a revision mark on the done rule.
5. **The roads**: what this waits on and what waits on this, drawn as a small neighbourhood with the critical road thick.
6. **When done: the implications.** The place brightens; the ripple is drawn: which buildings are unblocked, which roads open, which dates move, which goal ring advanced by how much, who is informed; a lesson, if one was recorded. This panel is what a person sees when they open a done item, before anything else.

A screenshot of the real app, a mock, a chart, a PDF cover, an email, a build badge, a code diff summary: all are **facade renderers** in the scene grammar (§8). A new product type without a renderer gets one built (§8.4).

## 7. Decisions: forks and refocus

### 7.1 The Fork

A decision is composed as a fork. The question in one line. Two sentences of context and **one visual** (the part of the world the decision touches, with the fronts and flags that make it pressing). Each option is a **path** leaving the fork, and each path shows its **consequence** drawn the same way the world is drawn: ghost buildings where things would move, dates on the roads, a ring that advances or recedes, the people whose load changes, the money that moves. The recommendation is the lit path, with its reasons as citations. The first line is still cost and toil in plain words; the reversible-until mark is a small clock. The person chooses a path, asks for more, delegates, or snoozes. One fork at a time; the next appears only when this one is resolved.

For big decisions (strategy), the consequence paths are **futures**: three small worlds side by side, a month out, drawn from the propagation engine (`docs/02` §6.2) with its confidence shown as haze.

### 7.2 Refocus: simulating a shift of effort

"We now want to focus on Europe." The owner says it, or drags it. The Stage opens **Refocus**: the world at domain depth with **effort as a fluid** that can be moved between places (a slider per place, or dragging light from one place to another). As effort moves, the world re-forecasts live: rings slow and speed up, dates slide on the roads, fronts grow where risk rises, people's load glyphs fill or ease. Below the world, the **transparency strip** lists in plain words what moves: "23 items gain priority · 3 dates move · 2 people over capacity · $1,200 a month shifts · Marketing waits 2 more weeks for iOS 1.0". Apply makes it a change set (propagated, announced to those affected, reversible until the mark); Save keeps it as a draft future; Discard leaves nothing. Small changes (one item's date) use the same engine with a one-line strip.

Every simulation states what it does not know (haze, confidence) and what it assumed (capacity, velocity windows), and the assumptions are settings a person can change in place.

## 8. The Stage and the scene grammar (how the AI shows you things)

### 8.1 Scenes

A **scene** is a declarative description of what to show: a composition of components with data bindings, a focal subject, an attention budget check, provenance (which queries and which data at which time) and the viewer it was composed for. The AI composes scenes; the renderer draws them; the validator checks them. Scenes are first-class: they are saved, shared, rendered to images for channels (`docs/15`), embedded in items and meetings, versioned, and re-rendered from live data when opened again.

### 8.2 The component grammar

Components are the vocabulary. Each has a schema, a renderer for desktop, phone and image, a theme-aware style, an accessibility form (a spoken summary and a list equivalent), and a data contract. The starting catalogue:

| Family | Components |
|---|---|
| World | place, sub-map, building (facade), road, front, flag, presence strip, embassy, horizon of goals, ripple |
| Measure | ring (progress with forecast), metric (one number with trend and a sentence), sparkline, bar/line/area/dot plots (a chart grammar; see `docs/research/interface-inspiration.md` for the grammar chosen), distribution, flow (sources to sinks), heat calendar, gauge for capacity |
| Compare | expected vs actual (side by side, slider, overlay, diff marks), before/after, options as paths, futures (small multiples of the world) |
| Time | path (agenda, plan), timeline band, countdown, "since you last looked" |
| People | person chip with load, team strip, who-is-where, ask thread |
| Product | image, screenshot, mock, document cover, code diff summary, build badge, email preview, envelope |
| Narrative | title line, sentence, two-sentence context, citation chips, legend chip |
| Action | choose a path, confirm card (permission class glyph, change set, undo), reply options, hold-to-talk |

Every component carries an attention weight; the scene validator sums them against the budget (§3) and refuses or simplifies.

### 8.3 Composing

The composer (the embedded AI, `docs/06` §6) receives the viewer, the moment, the context and the request, retrieves data through the action registry's read actions, and emits a scene. The scene is validated (schema, data cross-check: every number in the scene re-read from its binding; staleness; budget; rights and compartments: nothing in the scene the viewer may not see), then rendered. The viewer can ask for a different composition ("simpler", "as a timeline", "just the money"), and the AI re-composes. Scenes composed for a question carry a "back" to the Stage before.

### 8.4 The grammar grows, with oversight

When a request needs a visual the catalogue cannot express, the composer says so and proposes a component: a brief (data contract, the visual, the accessibility form, the attention weight) becomes a task for the coordinator (`docs/14` §8), built as a component in a sandbox, reviewed against the design rules and the attention budget, tested in all themes and both directions, and installed. Installed components are catalogue entries with provenance and a version; the AI can use them from then on. The catalogue is itself a place in the System region: its health, usage and failures are visible like any other.

### 8.5 Infographics

An **infographic** is a scene composed to tell one story on one screen: a release, a quarter, a place, a decision, the state of the company for the board, a customer's issue. It uses the same grammar with a narrative spine (title line, three to five visuals, one sentence each, a legend chip), renders to a shareable image and an accessible page, and is embedded in meetings, sent to parties within their compartment, and kept with the item or the period it describes. The **Infographics view** lists the ones that exist for the viewer's places and lets them ask for a new one in a sentence.

### 8.6 Aspects: dashboards that are places to think

An **aspect** is a composed scene about one way of looking at the company: Delivery, Customers, Money, People, Risk and compliance, Market and growth, AI operations, System health. Each aspect is a page and a layer on the world; each is built from the grammar; each opens from a metric into the places and buildings behind it (drill is one tap, back is one tap). Aspects are composed per viewer and per scale: the founders' Money aspect is runway and spend by place; the growing company's adds budgets by domain. Aspects are quiet: they show trend and shape first, numbers on hover, alarms only for breached states.

## 9. Tools (the instruments behind "More")

The board (cards and lines), the list and table, the timeline, the dependency graph, the people and agents pages, the issues board, the party pages and the settings all still exist (`docs/02` §5) for the moments that need an instrument: triage, bulk edits, audits, planning sessions. They follow the same tokens, glyph-first rule and attention budget (dense modes are explicit, chosen, and leave a "back"). They are never the home, never the default answer to a question, and never the deepest level of the map.

## 10. The phone

The phone is a first-class surface, not a shrunk desktop:

- **Horizon** is the home: the three things that need you as full-width cards with a visual each; goals as a ring row; the world as a strip of places below, each a tile with its landmark, ring and heat.
- **A place** fills the screen: its landmark as the header, its sub-places as a grid of tiles with rings, its buildings as a facade gallery, its roads as a short list of waits. Pinch or tap to go down; the back gesture goes up; the breadcrumb is a single chip.
- **The Fork** is one screen per decision: visual, two sentences, paths as swipeable panels with their consequences, choose with a tap and hold to confirm.
- **Refocus** uses sliders per place with the transparency strip below; the world re-forecasts in the header.
- **Talk** is hold-to-talk on the dock; answers are scenes sized for the phone; every confirm is a card with a hold.
- Nothing on the phone shows more than one place or one decision at a time.

## 11. Accessibility, direction, themes

Every scene has a spoken summary and a list equivalent (the "tree" of the world is the list equivalent of the map). Colour never carries meaning alone: shape, ring segment, glyph and label do. The three Lucid Glass themes and high contrast apply to scenes as they do to pages; landmarks are drawn in one ink under high contrast. RTL mirrors the world and the paths; landmarks and marks are not mirrored; numbers and ids stay left to right in isolated runs. Reduced motion stops breathing and ghost drift and keeps changes as crossfades.

## 12. Daily life in Lucid Total (the use cases, as they are lived)

- **Morning (Glance).** The Horizon: the world since yesterday, two forks for the owner, one feedback request, the goals' rings. The owner resolves one fork on the phone on the way in, by voice. Noise: none. Time: two minutes.
- **The quick status.** "Where are we on the beta?" in Talk. The Stage shows the Beta place: the ring at 58 % with the forecast week, the two blocked roads with their reasons, the three facades that changed this week, the one risk front; and the sentence "The beta slips a week unless the Railway token lands today". One tap on the barrier opens the envelope task.
- **A meeting (Meet).** "Beta readiness" at the Table: the subject centred, three forks open, the agenda as a path. "Relay ships in beta" is said; the capture appears; a nod confirms; the world changes under everyone's eyes (two buildings move to Ready, a road opens); undo is there for an hour. The minutes are a scene nobody has to write.
- **A refocus.** "Let's focus on Europe." Refocus opens; effort flows toward Europe; dates slide; Marketing's harbour dims a little; the strip says what moves; the owner applies; nine people get one quiet line each in the channel they chose.
- **Working a task (Dive).** Dana opens her building: the mock on the left, her screenshot on the right, the slider between them; the done ring with two segments still open; the assistant has drafted the walkthrough report; she taps "apply", the ring closes, the ripple shows the iOS gate advancing.
- **Support filtering up.** Four issues become an ask; it arrives at Noa as a small fork: "turn into a task · decide no action · needs more"; she chooses the task; the building appears in Billing with the issues' screenshots as its expected facade.
- **The board meeting.** The AI composes the quarter's infographic: three goals with rings, the Europe front, the runway line, the five things decided; it is sent to the board compartment; a board member replies by email with a question; the answer is a scene link.
- **The system itself.** The System place shows the scene renderer with a failing front: a component threw on RTL. The repair loop filed the incident, Claude Code fixed it in a worktree, the validator confirmed, the front cleared; the owner sees one line on the Horizon: "System repaired itself: RTL rendering, 40 minutes, no data touched" (`docs/14`).

## 13. How this changes the other documents

- `docs/02` §5 (views) is reframed: §5.1 the Stage and the Horizon; the map per this doctrine; instruments under §9; the item page is the product view (§6); §6.3 what-if becomes Refocus and the Fork; §7 gains the composer; §15 gains attention metrics.
- `docs/03` is rewritten around §5 here (places with identity, sub-maps, buildings with facades) and keeps its rendering notes.
- `docs/05` and `docs/06` gain the scene service (composition, validation, rendering to image), the component catalogue and its growth path.
- `docs/09` gains the attention test, the scene validator suite and the landmark/facade visual tests.
- `docs/04-mocks` v0.2 is built from this doctrine; v0.1 is archived for comparison.
- `docs/11` adds the scene grammar, the Horizon and the Fork to Phase 1 and Refocus to Phase 2; `docs/12` records T25.

## 15. What the research added (2026-10-28, `docs/research/interface-inspiration.md`)

- **Two kinds of scene.** Frequent scenes (the Horizon, a place, the product view, the Fork, a briefing) are **scene tools**: code owns the layout and the AI fills the slots. Composed scenes (an answer to a question, an aspect variant, an infographic) are a flat, schema-validated list of catalogue components. One repair attempt on a validation failure, then a fallback to the nearest scene tool. AI-written code runs only in a sandbox and carries no action buttons until it is installed as a catalogue component (§8.4).
- **Bind, don't write.** The composer never writes a number; every value is a binding the server resolves and formats, so a scene refreshes without recomposing and stays correct when the data moves.
- **Showcase, don't filter.** Highlighting a goal, a hull or a question fades the rest in place; nothing moves or disappears, so places keep their position in the viewer's memory.
- **Representation changes with zoom**, not only size; labels appear only when legible; collisions resolve by a priority (flags, heat and larger rings win).
- **The headline is the finding.** Every chart carries a sentence that states what it shows; the current value sits above the trend; the question picks the chart type; insights are computed first and only phrased by the AI; drill-down is offered as a suggested question.
- **A few invariant meters.** The ring means the same thing everywhere; colour is used only for meaning.
- **Decisions carry DACI anatomy**: a driver, exactly one approver, contributors and the informed, drawn on the fork; each path shows a published confidence that is later checked against what happened; Refocus shows a fan of outcomes with the base plan kept visible, and exploration never overwrites the plan of record until applied.
- **Agents are visible and quiet**: they say they are agents, acknowledge at once, have four states (idle · working · waiting · stopped), show an artefact to review rather than a log, stop when told, and a person stays accountable.
- **At most two disclosure levels** in one scene; untouched things decay out of sight by default.
- **Traps named**: the list as home; taxonomy on every element at every zoom; filters and forms as navigation; uniform rectangles; decisions buried in comments and awareness as a feed.

## 14. Acceptance for any screen or scene

1. A reviewer names the focal subject within two seconds.
2. The things that need the viewer are countable without reading, and there are at most three.
3. Every place on screen has a landmark, a name and a ring; no bare polygons.
4. Every item with a product shows the product; expected and actual are visually comparable.
5. Every decision shows its consequence drawn, not described only.
6. No section rail, no column-of-cards home, no table as a default answer.
7. The attention budget passes the validator in all three themes, both directions, desktop and phone.
8. A person can get the same scene by asking for it in Talk, and the AI can produce every scene a person can open (parity, `docs/00` principle 2).
