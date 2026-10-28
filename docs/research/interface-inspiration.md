# Research: interface inspiration for Lucid Total

> Web research made on 2026-10-28 by an Opus 5.5 agent, after the owner rejected the first mock wave because it "looks like a classic project management / ticketing system". There are eight threads. Each gives concrete findings and what Lucid Total should take and avoid. A one-page synthesis follows. Every claim comes from a page listed under Sources that was actually fetched. Vendor pages are vendor claims, and figures may age. Terms such as *scene*, *composer*, *validator*, *Stage*, *Fork*, *Refocus* and *places* are the ones already used in `docs/02` §7.10 and `docs/05`.

**Gaps to know before relying on this.** Several pages did not load: the body of the Thesys blog post against code generation (only its title came through), Apple's HIG Maps page, the original Crusader Kings III map diary (blocked by a browser check), Netflix's Simian Army post, Runway's help centre and Nomic's documentation. Muse, Kosmik, Prezi, ClickUp Brain, Mercury, Flourish, Jupyter AI and Observable AI were not covered in this pass. Points that depend on a thin source say so.

---

## 1. Generative and AI-composed UI

**1.1 There are two families, and the trade-off is now well documented.** In the *catalogue* family (A2UI, json-render, OpenUI/Thesys, AI SDK tools), the model picks components from a list the application owns. In the *free code* family (Google's generative UI, Gemini Canvas, Claude's in-chat visuals), the model writes HTML, CSS and JS. Google's research system uses Gemini 3 Pro with tools, long system instructions and a set of post-processors to fix common errors. Raters still preferred sites made by human experts, and the system "can sometimes take a minute or more to generate results" and occasionally contains inaccuracies. *Why it matters:* free code wins on novelty and loses on latency, consistency and verifiability. Those three are what a company OS cannot give up.

**1.2 A2UI (Google, Apache 2.0) is the most complete catalogue protocol.** It describes itself as a "declarative data format, not executable code". Agents "can only use pre-approved components from your catalog". The component tree is a flat **adjacency list**: components reference their children by ID instead of nesting, which the docs call "easy for LLMs to generate", streamable and updatable by ID. Structure is kept apart from a per-surface **data model**. Components bind to it with JSON Pointer paths (`{"path": "/user/name"}`), and an `updateDataModel` message refreshes bound UI with "no component updates needed". Templates render one child per array item, and input components write back to the data model. User actions go back to the agent, which answers with new messages. v0.9 added custom catalogues and "validation failed error formatting". The v1.0 candidate adds `actionResponse` and action IDs. *Take:* the flat list, the split between structure and data, and data-only refresh. A scene is composed once, and its numbers then update through bindings without asking the model again. *Avoid:* A2UI's advice to "pre-compute display values on the agent". In Lucid Total the server formats bound values, so the model never writes a number.

**1.3 json-render (`@json-render/core`) is the same idea in TypeScript with Zod.** `defineCatalog` declares the components (props as Zod schemas, `hasChildren` for containers), the actions (with typed parameters) and the data bindings (`$state`, `$item`, `$bindState` for two-way binding). Output is a `{root, elements}` map, flat again, and it "render[s] progressively as JSON arrives". *Take:* its shape is the closest to `packages/scene`. Zod props give the validator its first pass for free.

**1.4 Vercel AI SDK keeps the model out of layout entirely.** Generative UI there "is the process of connecting the results of a tool call to a React component". Tool parts are typed (`tool-<name>`) with the states `input-available`, `output-available` and `output-error`. The older RSC `streamUI` path "is currently experimental. We recommend using AI SDK UI for production." *Take:* for the most frequent, high-stakes views (item, decision, briefing), the composer does not compose freely. It calls one named scene tool, and code owns the layout. Free composition is kept for questions the fixed tools cannot answer.

**1.5 MCP Apps and the OpenAI Apps SDK are the interactivity and state reference.** A tool declares `_meta.ui.resourceUri` pointing to a `ui://` HTML resource. The host renders it in a sandboxed iframe, and the two sides talk JSON-RPC over `postMessage`. The app can call tools, send messages and update the model's context. OpenAI's state guide says: "Business data is the source of truth. Do not store it only in the UI." Widget state belongs to one rendered instance and has `modelContent` (the model sees it) and `privateContent` (it does not). OpenAI's UI rules: an inline card has at most two actions, "No nested scrolling", no tabs or drill-ins inside cards, carousels hold 3 to 8 items, and in fullscreen the composer stays overlaid ("Design your UX to work with the system composer"). *Take:* the model-visible versus private state split, and these card rules as validator constraints (attention budget). *Avoid:* treating iframe apps as the main path. Each is a separately built mini-app, which is the opposite of one coherent world.

**1.6 OpenUI (Thesys C1 docs now redirect there) shows that format cost matters.** It is a compact line-oriented language that its makers say models produce "in less than half the tokens of JSON-based formats" (no benchmark given). The gateway "validates and fixes output as it streams", and an Autofix call repairs invalid output. *Take:* repair-on-invalid as a validator stage (one repair attempt, then fall back to a fixed scene), and token count as a tracked eval metric of the composer.

**Fit for Lucid Total.** Use a hybrid. (a) Fixed scene tools for the common views. (b) A flat, Zod-validated scene spec from a versioned catalogue for composed views, with every number bound by path to a read action. (c) A sandboxed free-code lane for one-off explorations, which never carries an action button and can be promoted into the catalogue through a component brief. This matches the catalogue-growth process already in `docs/02` §7.10.

## 2. Spatial, zoomable and map-like interfaces

**2.1 Pad++ (Bederson and Hollan, CHI '94) already wrote the rules.** "All the information is there and to see more detail, you just have to *take a closer look*." Its directory browser shows labels only "when the user is sufficiently close to be able to read them". Very small objects are not drawn, objects are drawn at low resolution while moving and refined when still, only the visible portion is lazy-loaded, and zoom is smooth because "jumpy zooming... can be disorienting". It handled 600,000 objects at about 10 frames per second. Note that the successful demo was not a free canvas: it was nested squares coloured by file type, in effect a treemap. *Take:* labels by legibility, a render budget and smooth zoom. *Avoid:* an unstructured infinite canvas.

**2.2 Crusader Kings III changes the representation at each zoom, not only the scale.** Its Dev Diary 177 talks about blending effects "more naturally between zoom levels" and removing "pop-in and glitches... in the transition between paper map" and the other modes. It adds an illustrated paper map covering the whole world and softens map text to make it "less digital". Search snippets of the original map diary (the page itself was blocked) describe three levels: a paper map far out, a political overlay in the middle, and terrain with county names (realm colours removed) close in. They also say there is no minimap, because map modes are tied to zoom. *Take:* at company zoom, an illustrated, map-like rendering. Ownership colour fades and terrain detail takes over as you descend. *Avoid:* pop-in between levels.

**2.3 A place's identity is a small, fixed tuple.** Google's place icons are an SVG glyph mask on a background colour set by category, from a short palette: food #FF9E67, retail #4B96F3, outdoor #4DB546, emergency #F88181, and so on. MapKit markers carry a balloon tint, a glyph, a glyph tint, a title and subtitle visibility, and a `displayPriority` (default low) that decides what hides when markers collide. *Take:* each place gets a name, a subject glyph, a hue from a small fixed set, an optional landmark illustration, a pinned position and a display priority, and collisions are resolved by priority, never by overlap. *Avoid:* a free colour per region. It stops meaning anything after about eight regions.

**2.4 Kumu and Felt: fade, don't remove; a viewer is not an editor.** Kumu's **showcase** makes unselected items "translucent, fading [them] into the background" (for example `background-opacity: 0.1`), while **filter** removes them. **Focus** hides everything beyond N degrees of a selection; `+` and `-` widen or narrow it and `esc` returns to the full map. **Clustering** turns a shared field value into a node. Felt has five parts (toolbar, legend, detail panel, table, map). The detail panel opens only on selection, and the *Legend* tab shows the map "as [it appears] to people viewing", separately from the editor's *List*. *Take:* showcase as the default emphasis tool (places stay where they are, which keeps the map stable), focus-by-degree for dependency roads, and separate viewer and editor modes of the same world.

**2.5 Network maps: gaps are a signal; hairballs are not a home.** InfraNodus colours clusters found by community detection, sizes nodes by betweenness centrality, and highlights **structural gaps** between distant clusters as "the parts of the discourse that could be better connected", with AI-generated questions to bridge them. Nomic Atlas (from search snippets of its docs, not a fetched page) builds a 2 to 3 level topic hierarchy whose labels "appear and disappear at different zoom levels" and can be renamed by editors. *Take:* "these two places should be talking and are not" as a drawn signal. AI-named regions that people can rename are a good default for emergent groupings. *Avoid:* force-directed graphs as the company view. They are unstable and unreadable at scale.

**2.6 Keep layouts in a simple, open spatial format.** JSON Canvas 1.0 (Obsidian) has text, file, link and group nodes with `x, y, width, height`, six colour presets that applications map to their own palette, and groups with a label and a background image (`cover`, `ratio`, `repeat`). Edges have sides, ends and labels. tldraw's experimental "computer" wires canvas components with arrows into a dataflow that an LLM executes. *Take:* pinned perspective layouts can be stored in a format this plain, and "group with a background image" is already a place with a landmark. *Avoid:* making people do the layout. Hand-arranged canvases rot.

## 3. Attention-first, calm interfaces

**3.1 Calm technology defines centre and periphery.** Amber Case's principles include: technology "should require the smallest possible amount of attention", "should make use of the periphery", "can communicate, but doesn't need to speak", and "should work even when it fails". Weiser and Brown say the periphery is "informing without overburdening", and "centering the periphery is a fundamental enabler of calm". Their Dangling String showed network load as motion, with no screen. *Take:* the world (heat, weather, presence) is the periphery and the Stage is the centre. Something moves from periphery to centre only when a person must act. *Avoid:* counters and red badges as the main signal.

**3.2 Glanceable and minimal immersion (Apple).** watchOS asks for "quick, glanceable, single-screen interactions", sessions of less than a minute, and shallow navigation. It also observes that people use an app's "related experiences — like complications, notifications, and Siri interactions — more than... the app itself". visionOS says: "find the minimum level of immersion that suits it best — don't assume that every moment needs to be fully immersive", and avoid motion "missing a stationary frame of reference". *Take:* most of Lucid Total's value is delivered outside the app (briefings, channel messages), so the home has to work in a glance. The zoomable world is an immersion people choose, not a gate for every task. During zoom, something stays still (the horizon band, the breadcrumb).

**3.3 Rams and Linear: chrome recedes, theming from few inputs.** Rams: good design is "unobtrusive" ("Products fulfilling a purpose are like tools"), honest, and "Less, but better". Linear's redesign aimed to "reduce visual noise, maintain visual alignment, and increase the hierarchy and density of navigation elements". It moved themes to LCH, generated from three inputs (base, accent, contrast) instead of 98 variables, and reduced the blue accent for a "more neutral, timeless look". *Take:* derive themes from a few perceptual inputs, and use colour for meaning only.

**3.4 One focal thing, the rest fades, old things decay.** In Things 3, a tapped task "pop[s] out into a card-like form while the rest of the list fades into the background". The app is "dominated by white space" with "thoughtful splashes of color". Superhuman's Split Inbox exists because "viewing all your emails in one single list is overwhelming", and it lets people reach zero in the stream that matters (vendor claim, no data). Arc closes unpinned tabs after 12 hours by default, and this cannot be turned off. *Take:* one focal subject on the Stage; attention split into streams a person can finish ("my decisions today: 3"); and decay by default, so what nobody touched sinks into the archive instead of piling up.

**3.5 Spend the novelty budget in one place.** The Browser Company's design lead says Arc "unapologetically innovates on core browsing mechanics". Dia was built so "anyone [can] switch to Dia at 10am on a Tuesday morning", with "minimalism in the core UI" and its novelty concentrated in chat over open tabs. NN/g adds that "designs that go beyond 2 disclosure levels typically have low usability". *Take:* the world and the composer are the novelty. Everything else (search, settings, item editing, lists) is boringly familiar. Zoom is navigation, and each scene has at most two levels of disclosure (glance, then detail).

## 4. Dashboards and infographics that are tools

**4.1 AI-friendly chart grammars exist, but need constraint.** Vega-Lite is "a high-level grammar of interactive graphics" with "a concise, declarative JSON syntax", layered and multi-view composition, selections for interaction, and a published JSON Schema, so its output can be validated. Observable Plot is "a concise API... implementing a layered grammar of graphics": excellent as a renderer, but a JavaScript API, not a data format. An evaluation of six LLMs and eight prompt strategies generating Vega-Lite on nvBench found "substantial performance disparities across prompt strategies, chart types, and LLMs". *Take:* the composer emits a **restricted Vega-Lite subset** (or catalogue chart components with semantic props). Data is referenced by binding, never inline. The output is validated against the schema and drawn by our renderer. *Avoid:* unconstrained specs with literal values.

**4.2 Metric-centric narrative: compute insights, let the model phrase them.** In Tableau Pulse, metric definitions in a metrics layer are "a single source of truth". People *follow* metrics. An insights platform "automatically detects drivers, trends, contributors, and outliers", and each insight comes in plain language with a supporting visual. An AI summary sits at the top and goes out in email or Slack digests. Q&A "uses pre-calculated insights rather than analyzing raw data directly". Drill-down is a set of guided questions that open breakdown charts. *Take:* aspects are made of followed metric objects, and the narrative is generated over deterministic, pre-computed insights. Drilling down means picking a suggested question, not building a filter.

**4.3 The headline is the finding; the value sits above the trend; the chart follows the question.** Stripe: "Show the current value above the chart so users get the answer before checking the trend." Its chart table is keyed by the user's question ("Is this going up or down?" gives a line chart, "How much is each category?" a bar chart). It allows no more than three charts per row ("difficult to read when compressed below roughly 200px"), uses fixed heights (180 for cards, 320 for featured), and gives loading, error, empty and populated states the same height so nothing jumps. Datawrapper: "Give the main statement first and the precise data explanation later", annotate outliers, and move precision into notes. Geckoboard: the most important item goes top left, always show a target or previous value, and "pie charts and area charts are rarely the best choice". *Take:* encode these as composer rules: a question-to-chart table, a headline-as-finding requirement, and state-stable heights.

**4.4 A few iconic, invariant meters build a visual language.** Apple's Activity rings always mean Move, Exercise and Stand. Their colours never change, they are never reused for other data, they always show one person, and the guidance is to "design the surrounding interface to blend with the rings; never change the rings to blend with the surrounding interface". *Take:* define three or four Lucid meters (a goal ring, a confidence haze, a load gauge, a heat glow) that mean one thing everywhere, so they can be read without labels. *Avoid:* a new chart style in every scene.

**4.5 Dashboards that act: ontology plus action types.** Palantir's Ontology maps data to objects, properties and links, plus action types and functions. In many settings it "serves as a digital twin of the organization" with "semantic and kinetic elements". (The AIP overview page was thin: it lists "Staged writes" but did not describe them.) Ramp's agents claim: "Every action comes with a rationale". They auto-approve low-risk spend, escalate "only the 10–15% of expenses that need further human judgment", and let finance teams "watch decisions stream in, override edge cases". *Take:* every visual binds to model objects, and every button on it is a declared action with preview and undo. That is what separates a tool from a poster.

## 5. Decision interfaces and simulation

**5.1 The ladder of abstraction is the method for Refocus.** Bret Victor: give "direct, interactive control over the independent variables", then *step up* to a view across all values ("This picture represents the system for all time, not one particular time"), then *step down* by pointing at the abstraction to see a concrete case. "This dance is where the deepest insights are born." *Take:* Refocus should not be a single slider. It should draw the *family* of outcomes, for example ship dates for moving 0 to 100% of a team, as a fan. Tapping a point steps down to the concrete plan (who moves, which dates shift, which places cool).

**5.2 Scenario tools separate exploring from committing.** Causal compares a base version against any number of scenarios. A "Show Variances" toggle shows the absolute or percentage gap, and charts by default show each variable "under every scenario which affects it". Pigment keeps Scenarios for quick, ad-hoc what-ifs and Versions for planning that is "repeatable, auditable". Runway's documentation could not be fetched; its marketing presents scenarios as parallel drafts. *Take:* forks are cheap, private and disposable, and the plan of record is versioned and audited. Variance is always shown against a named base.

**5.3 DACI gives a decision its anatomy.** Atlassian's play has a Driver, a single Approver ("The one person (yes: one!)"), Contributors ("a voice, but not a vote") and the Informed. The record holds a 1 to 2 sentence background, relevant data, decision factors, an options table with pros, cons, resources and cost, and the outcome. *Take:* the Fork scene is DACI drawn: options as paths, factors as the comparison axes, one approver glyph, the informed shown as who the outcome will reach. *Avoid:* a decision as a ticket with a comment thread.

**5.4 Show confidence, and check it.** Devin reports 🟢 🟡 🔴 confidence at session start, after drafting a plan and when answering. Below green, it asks clarifying questions, and "🟢 scores result[ed] in twice the likelihood of a merged PR compared to 🔴". *Take:* forecasts carry calibrated confidence, drawn as haze and not as a percentage. Calibration (predicted versus actual) is published in the AI operations aspect, so the honesty of the simulation is itself measured.

**5.5 Overlays need a quiet base and one scroll at a time.** A critique of Civilization VII's launch UI complains that text is "horrible to read", that the journal "clashes with the map", and "I usually prefer to scroll one thing at a time". This is a thin source, one blogger. The MCP Apps examples include a `scenario-modeler` and a `budget-allocator`, a sign that "move a control, see the re-forecast" is now a standard app shape. *Take:* when a fork or lens is on, the base world desaturates and only the changed things carry colour (ghosts, dashed outlines, moved people).

## 6. AI operating systems and company OS products

**6.1 Linear's Agent Interaction Guidelines can be adopted almost as written.** An agent "should always disclose that it's an agent", "inhabit the platform natively", "provide instant feedback" ("immediate, but unobtrusive"), "be clear and transparent about its internal state" (thinking, waiting for input, executing, finished), and "respect requests to disengage". And: "An agent cannot be held accountable", so a human assignee stays responsible, with the agent shown as a delegate. Sessions expose structured activities (tool calls, thoughts, elicitations). *Take:* this is the "live but quiet" model. Agent presence is an avatar with a four-state ring, acknowledged at once, detailed only on demand, and stopped when asked.

**6.2 Agents show their working and their memory.** Asana's AI Teammates "show their step-by-step approach", admins see "where they're engaged, and what outcomes they're driving", and teams control "data access, user permissions, operational parameters, and credit consumption". Notion 3.0's agent does "over 20 minutes of multi-step actions" with memory in pages and databases and an "instructions page" people can edit. Custom agents run on schedules or triggers. *Take:* an agent's instructions and memory are visible, editable pages, and its budget use is shown next to its work.

**6.3 What failed: no screen, no confirmation, slow.** Humane's AI Pin was sold as "a tiny replacement for smartphones" without a clear job. It was slow, its projected display was "hard-to-use" and nearly invisible outdoors, and its assistant struggled. Rabbit's "large action model" was called "just marketing speak". An Uber booking failed, the R1 completed a food order "without ever confirming my payment information or delivery address", and it gave the weather when asked for traffic. *Take:* voice can direct, but consequential actions always confirm visually with a preview. Latency is a design property. Never show a capability that does not work end to end.

**6.4 Patterns for showing and validating agent work.** Combining 6.1 to 6.3 with Ramp (4.5) and Devin (5.4): acknowledge at once; state is one of four; work is a reviewable artefact (a diff, a preview, a proposed change set), not a chat log; each action has a rationale; autonomy is graded by risk; escalations are a small, finishable stream. *Avoid:* activity feeds that log every agent step to everyone. That is the noisiest pattern in these products.

## 7. Self-operating systems

**7.1 The operator pattern is the right shape: declared desired state plus reconcilers.** Kubernetes operators follow "a control loop that watches the shared state... and makes changes attempting to move the current state towards the desired state". They "capture the key aim of a human operator" and automate backups, upgrades and even "simulating failure... to test its resilience". *Take:* Lucid Total's self-operation is a set of visible *keepers*. Each declares a desired state (SLO, eval threshold, policy) and shows its spec, status and last action in the System health aspect.

**7.2 Google SRE: assess safety before acting, fall back to a person.** "Every action should be assessed for its safety before execution." "Automation should default to human operators if it runs into an unsafe condition." Build safeguards "equivalent to the types of indirect alerts that a human operator might receive", use timeouts, and remember that "even read operations... can spike device load". Partial automation ("engineer behind the curtain") is a sound interim step. In the case study, a UI that "didn't reliably sync with the actual state of the switch" led technicians to act on undrained switches. The fix capped the number of links and devices one action may touch. *Take:* blast-radius caps per action, a staleness check before acting (the same rule the scene validator applies), and graduated autonomy.

**7.3 Chaos engineering verifies the self-repair.** The principles: a steady-state hypothesis about "measurable output", variables that "reflect real-world events", experiments in production, "Automate experiments and run them continuously", and a minimal blast radius. *Take:* scheduled, visible fire drills on Lucid Total itself (a provider down, a stale feed, a failed migration) prove the keepers work. They appear as weather in the System health aspect, not as alerts.

**7.4 Agent self-review needs ground truth and stopping rules.** Anthropic's guidance: use evaluator-optimizer loops "when we have clear evaluation criteria"; agents should "gain 'ground truth' from the environment at each step"; pause at checkpoints for human feedback; set stopping conditions such as maximum iterations; and test in sandboxes. incident.io describes AI SRE agents that link telemetry, code changes and past incidents, and recommend with evidence, for example a rollback instead of a restart that would only mask the defect. They use "human-in-the-loop approval for high-risk actions", start with low-risk playbooks, log everything reversibly, and escalate only with "a high-confidence assessment". *Take:* a repair proposal is a Fork with evidence attached. Read and reversible fixes run automatically within caps; irreversible or outbound ones wait for a person. This matches the permission classes already in `docs/06`.

## 8. Voice- and chat-directed interfaces

**8.1 A sentence produces a live, editable view, not a picture.** Felt AI turns "Build me a map of California wildfire risk to my portfolio properties" into SQL, imported layers and automatic styling, delivered as a live map at a shareable URL. Follow-ups ("Now exclude the flood zones") keep the context. It is read-only by default. *Take:* a request yields a scene that is still bound to the model, and refinement by voice changes the scene spec, not a screenshot.

**8.2 Every composed answer opens into its workings.** Hex Threads lets people "follow along with the agent's step-by-step reasoning". It prefers governed semantic models and falls back to raw tables only when needed, and you can "Turn a thread into a notebook for deeper analysis". *Take:* every composed scene has an "open the workings" path into the instrument (list, table, query) and shows which governed definitions it used.

**8.3 Audience is a composition parameter; one artefact has many renderings.** Perplexity Pages asks for a target audience (beginner, advanced, anyone) that sets depth. Sections are added, rewritten or removed by prompting. Generation takes a couple of minutes, though text starts streaming at once. Gemini Canvas turns a Deep Research report into "a web page, infographic, quiz, or audio overview" from a Create menu. *Take:* the viewer's perspective and expertise are inputs to the composer, and a scene can be re-rendered as an infographic, a briefing or audio. *Avoid:* prompt-only editing. Perplexity's text cannot be edited directly, which is frustrating, so direct manipulation must stay available.

**8.4 Inline answers versus kept artefacts; the composer is always present.** Claude's in-chat visuals (March 2026) are HTML and SVG drawn inside the answer, "distinct from Artifacts", and Claude can ask structured multiple-choice questions people tap instead of typing. OpenAI keeps the composer overlaid in fullscreen. *Take:* an answer can be a small inline scene with "open on the Stage". Clarifying questions are tappable choices. The voice and chat bar is always present over the Stage, so any view can be redirected by speaking ("show this by customer", "what if we pause Europe").

---

## Synthesis: what matters most for Lucid Total

### The ten patterns

1. **Composed from a typed catalogue, redirected by voice.** Fixed scene tools for frequent views, a flat Zod-validated scene spec for composed views, repair once then fall back, and free code only in a sandbox with no actions, promotable into the catalogue (A2UI, json-render, AI SDK, OpenUI). The composer bar is always present over the Stage (OpenAI, Claude).
2. **Bind, don't write.** Every number comes from a binding to the model, data refreshes without recomposition, and the server formats values (A2UI `updateDataModel`, OpenAI's "business data is the source of truth").
3. **Places with identity.** Name, subject glyph, a hue from a small fixed set, a landmark illustration, a pinned position and a display priority. The representation changes per zoom, labels appear when legible, and collisions resolve by priority (CK3, Pad++, Google place icons, MapKit).
4. **Showcase, don't filter; centre the periphery.** Emphasis fades the rest while keeping it in place, dependency focus widens by degree, and things move to the centre only when someone must act (Kumu, Weiser and Brown).
5. **One focal subject, finishable streams, decay by default.** The rest fades (Things), attention comes in streams that can reach zero (Superhuman), untouched things sink (Arc), and there are at most two disclosure levels per scene (NN/g).
6. **The headline is the finding.** The value sits above the trend, the chart is chosen by the question, the narrative is phrased over pre-computed insights, and drill-down means suggested questions (Stripe, Datawrapper, Geckoboard, Tableau Pulse).
7. **A few invariant, iconic meters** that mean one thing everywhere and never change colour (Activity rings), plus colour for meaning only (Linear, Rams).
8. **Decisions as forks with DACI anatomy.** Outcomes are shown as families (ladder of abstraction), variance against a named base, exploratory forks kept apart from the plan of record, and confidence that is calibrated and published (Victor, Causal, Pigment, Devin).
9. **Agents visible and quiet.** Disclosure, instant acknowledgement, four states, a human accountable, a rationale on every action, a reviewable artefact instead of a log, and stop means stop (Linear AIG, Ramp, Asana).
10. **Self-operation as keepers.** Declared desired state, a safety and staleness check before acting, blast-radius caps, fallback to a person, evidence-carrying proposals, and chaos drills that prove it works (Kubernetes, Google SRE, Principles of Chaos, incident.io).

### The five traps that make it feel like a ticketing system

1. **The list as home.** Rows of items with status, priority and assignee columns, or a kanban board, as the first screen. Boards and lists are instruments opened for a task, never the place you land.
2. **Taxonomy in the face.** IDs, state pills, priority labels and avatars on every element at every zoom, with counters and red badges as the main signal. Show glyphs and heat at a distance; fields appear only at item depth.
3. **Filters and forms as navigation.** Dropdown filters, saved searches and field-heavy item pages as the way to find things. In Lucid Total you ask, zoom or showcase; forms appear only when something is being created or changed.
4. **Uniform rectangles.** Every object is the same card and every dashboard a grid of equal tiles, with no hierarchy, no place identity and no focal subject. Size, position, hue and landmark have to carry meaning.
5. **Comments for decisions and feeds for awareness.** Decisions buried in comment threads, and activity streams that record everything for everyone. Decisions are forks with an approver and an outcome. Awareness is the periphery (heat, weather, briefings), not a log.

---

## Sources (all fetched on 2026-10-28)

**Generative UI**
- https://a2ui.org/
- https://a2ui.org/concepts/components/
- https://a2ui.org/concepts/data-binding/
- https://json-render.dev/
- https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces
- https://ai-sdk.dev/docs/ai-sdk-rsc/overview
- https://www.openui.com/docs (target of the docs.thesys.dev redirect)
- https://research.google/blog/generative-ui-a-rich-custom-visual-interactive-user-experience-for-any-prompt/
- https://modelcontextprotocol.io/docs/extensions/apps
- https://developers.openai.com/apps-sdk/concepts/ui-guidelines
- https://developers.openai.com/apps-sdk/build/state-management
- https://macrumors.com/2026/03/12/claude-visuals-conversations

**Spatial and zoomable**
- https://www.cs.umd.edu/projects/hcil/jazz/learn/papers/chi-94-pad.pdf
- https://devtrackers.gg/crusader-kings/p/3c2f2816-dev-diary-177-a-fresh-coat-of-paint
- https://developers.google.com/maps/documentation/javascript/place-icons
- https://developer.apple.com/documentation/mapkit/mkmarkerannotationview.md
- https://docs.kumu.io/guides/showcase.md
- https://docs.kumu.io/guides/focus.md
- https://docs.kumu.io/guides/clustering.md
- https://help.felt.com/getting-started/tour-the-interface
- https://felt.com/blog/a-brand-new-era-of-gis
- https://infranodus.com/about/how-it-works
- https://jsoncanvas.org/spec/1.0/
- https://the-decoder.com/tldraw-unveils-experimental-natural-language-computer-powered-by-gemini-2-0/

**Calm and attention**
- https://calmtech.com/
- https://calmtech.com/papers/designing-calm-technology.html
- https://developer.apple.com/tutorials/data/design/human-interface-guidelines/designing-for-watchos.json
- https://developer.apple.com/tutorials/data/design/human-interface-guidelines/designing-for-visionos.json
- https://www.vitsoe.com/us/about/good-design
- https://linear.app/now/how-we-redesigned-the-linear-ui
- https://www.macstories.net/reviews/things-3-beauty-and-delight-in-a-task-manager/
- https://blog.superhuman.com/how-to-split-your-inbox-in-superhuman/
- https://www.howtogeek.com/888738/ways-arc-transforms-your-web-browser-experience/
- https://www.thurrott.com/cloud/web-browsers/322287/the-browser-company-explains-its-vision-for-dia
- https://www.nngroup.com/articles/progressive-disclosure/

**Dashboards and infographics**
- https://vega.github.io/vega-lite/
- https://github.com/observablehq/plot
- https://arxiv.org/abs/2401.11255
- https://help.tableau.com/current/online/en-us/pulse_intro.htm
- https://docs.stripe.com/stripe-apps/patterns/chart-layout
- https://www.datawrapper.de/blog/text-in-data-visualizations
- https://www.geckoboard.com/best-practice/dashboard-design/
- https://developer.apple.com/tutorials/data/design/human-interface-guidelines/activity-rings.json
- https://www.palantir.com/docs/foundry/ontology/overview/
- https://www.palantir.com/docs/foundry/aip/overview/ (thin)
- https://ramp.com/blog/ramp-agents-announcement

**Decisions and simulation**
- https://worrydream.com/LadderOfAbstraction/
- https://new.docs.causal.app/charts-and-dashboards/comparing-versions-and-scenarios-on-visuals
- https://kb.pigment.com/docs/versions-scenarios
- https://www.atlassian.com/team-playbook/plays/daci
- https://cognition.com/blog/devin-2-1
- https://blog.yuo.be/2025/02/09/civilization-vii-it-needs-some-love/ (thin, one critic)

**AI operating systems**
- https://linear.app/developers/aig.md
- https://linear.app/docs/agents-in-linear
- https://linear.app/now/our-approach-to-building-the-agent-interaction-sdk
- https://asana.com/es/press/releases/pr/asana-announces-new-ai-teammates-collaborative-agents-that-deliver-results.md
- https://notion.com/releases/2025-09-18
- https://www.engadget.com/ai/the-humane-ai-pin-debacle-is-a-reminder-that-ai-alone-doesnt-make-a-compelling-product-190119112.html
- https://www.engadget.com/rabbit-r1-review-a-199-ai-toy-that-fails-at-almost-everything-161043050.html

**Self-operating systems**
- https://kubernetes.io/docs/concepts/extend-kubernetes/operator/
- https://sre.google/workbook/eliminating-toil/
- https://principlesofchaos.org/
- https://www.anthropic.com/engineering/building-effective-agents
- https://incident.io/blog/ai-sre-agent-definition

**Voice and chat-directed**
- https://hex.tech/blog/introducing-threads/
- https://techcrunch.com/2024/05/30/perplexity-ais-new-feature-will-turn-your-searches-into-sharable-pages
- https://gemini.google/overview/canvas/
