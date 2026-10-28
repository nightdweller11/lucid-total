# Research: interface inspiration for Lucid Total

> Web research made on 2026-10-28 by an Opus 5.5 agent, after the owner rejected the first mock wave as looking "like a classic project management / ticketing system". Eight threads give concrete findings with what to take and avoid, followed by a one-page synthesis. Every claim comes from a fetched page under Sources; vendor pages are vendor claims. *Scene*, *composer*, *validator*, *Stage*, *Fork*, *Refocus* and *places* are used as in `docs/02` §7.10 and `docs/05`.

**Gaps.** These did not load: Thesys's post against code generation, Apple's HIG Maps page, the original CK3 map diary, Netflix's Simian Army post, and the Runway and Nomic docs. Muse, Kosmik, Prezi, ClickUp Brain, Mercury, Flourish, Jupyter AI and Observable AI were not covered.

---

## 1. Generative and AI-composed UI

**1.1 Two families, with a known trade-off.** In the *catalogue* family (A2UI, json-render, OpenUI/Thesys, the AI SDK), the model picks components that the application owns. In the *free code* family (Google's generative UI, Gemini Canvas, Claude's in-chat visuals), the model writes HTML, CSS and JS. Google's research system (Gemini 3 Pro plus tools, long system instructions and post-processors) still loses to sites made by human experts, "can sometimes take a minute or more", and occasionally contains inaccuracies. Free code wins on novelty and loses on latency, consistency and verifiability. A company OS cannot give up those three.

**1.2 A2UI is the most complete catalogue protocol.** It is a "declarative data format, not executable code", and agents "can only use pre-approved components from your catalog". Components form a flat **adjacency list** that references children by ID, which is "easy for LLMs to generate", streams well and can be updated by ID. A separate per-surface **data model** is bound by JSON Pointer path, so `updateDataModel` refreshes the UI with "no component updates needed". Inputs write back, and actions return to the agent (`actionResponse` and action IDs in the v1.0 candidate). *Take:* the flat list, the split between structure and data, and data-only refresh. *Avoid:* its advice to pre-format display values on the agent. Our server formats bound values, and the model never writes a number.

**1.3 json-render is the same idea in TypeScript.** `defineCatalog` declares components with Zod props, typed actions and bindings (`$state`, `$item`, `$bindState`). Output is a flat `{root, elements}` map that renders "progressively as JSON arrives". It is the closest in shape to `packages/scene`, and Zod gives the validator its first pass.

**1.4 The AI SDK keeps the model out of layout.** Generative UI there is "connecting the results of a tool call to a React component". Tool parts are typed (`tool-<name>`) with the states `input-available`, `output-available` and `output-error`. The RSC `streamUI` path "is currently experimental. We recommend using AI SDK UI for production." *Take:* for frequent, high-stakes views (item, decision, briefing), the composer calls one named scene tool and code owns the layout. Free composition is kept for questions the fixed tools cannot answer.

**1.5 MCP Apps and the OpenAI Apps SDK are the reference for interactivity and state.** A tool points `_meta.ui.resourceUri` at a `ui://` HTML resource, rendered in a sandboxed iframe that talks JSON-RPC over `postMessage`, calls tools and updates the model's context. OpenAI: "Business data is the source of truth", and widget state splits into `modelContent` (seen by the model) and `privateContent` (not seen). Its card rules: at most two actions, "No nested scrolling", no tabs or drill-ins, carousels of 3 to 8, composer present in fullscreen. *Take:* the state split, and the card rules as attention-budget checks. *Avoid:* iframe mini-apps as the main path; each is built separately, the opposite of one world.

**1.6 Format cost and repair matter.** OpenUI (where Thesys's C1 docs now redirect) claims its line-oriented format takes "less than half the tokens of JSON-based formats" (no benchmark given), and its gateway "validates and fixes output as it streams". *Take:* repair once, then fall back to a fixed scene, and track tokens per scene as a composer eval metric.

**Fit.** Use a hybrid. Fixed scene tools serve the common views. A flat, Zod-validated scene spec from a versioned catalogue serves composed views, with every number bound by path to a read action. A sandboxed free-code lane serves one-off explorations; it carries no action buttons and can be promoted into the catalogue through a component brief (`docs/02` §7.10).

## 2. Spatial, zoomable and map-like interfaces

**2.1 Pad++ (CHI '94) already wrote the rules.** "All the information is there and to see more detail, you just have to take a closer look." Labels show only "when the user is sufficiently close to be able to read them". Tiny objects are skipped, motion renders at low resolution and refines when still, only the visible part is loaded, and zoom is smooth because "jumpy zooming... can be disorienting". The successful demo was nested squares coloured by file type, in effect a treemap and not a free canvas. *Take:* labels by legibility, a render budget and smooth zoom. *Avoid:* an unstructured infinite canvas.

**2.2 Crusader Kings III changes the representation, not only the scale.** Dev Diary 177 blends effects "more naturally between zoom levels", removes "pop-in and glitches" around the paper map, and softens text to look "less digital". Search snippets of the original diary (the page was blocked) describe a paper map far out, a political overlay in the middle, and terrain with county names close in, with map modes tied to zoom instead of a minimap. *Take:* an illustrated company zoom, where ownership colour fades and terrain detail rises as you descend, with no pop-in.

**2.3 A place's identity is a small, fixed tuple.** Google's place icons are a glyph mask on a category background colour from a short palette: food #FF9E67, retail #4B96F3, outdoor #4DB546, emergency #F88181. A MapKit marker has a tint, a glyph, title visibility and a `displayPriority` that decides what hides when markers collide. *Take:* each place has a name, a subject glyph, a hue from a small fixed set, a landmark illustration, a pinned position and a priority, and collisions resolve by priority, never by overlap. *Avoid:* a free colour per region, which stops meaning anything after about eight regions.

**2.4 Kumu and Felt: fade instead of removing; viewers are not editors.** Kumu's **showcase** makes unselected items "translucent, fading [them] into the background", where **filter** removes them. **Focus** hides everything beyond N degrees of the selection (`+`/`-` to widen or narrow, `esc` to restore). Felt opens its detail panel only on selection and separates the viewer's *Legend* from the editor's *List*. *Take:* showcase as the default emphasis, because places stay put; focus by degree for dependency roads; viewer and editor modes of one world.

**2.5 Gaps are a signal; hairballs are not a home.** InfraNodus colours clusters by community detection, sizes nodes by betweenness, and highlights **structural gaps** between distant clusters, with AI questions to bridge them. Nomic Atlas (search snippets only) reveals 2 to 3 levels of topic labels by zoom, and editors can rename them. *Take:* "these two places should be talking and are not" as a drawn signal, and AI-named groupings people can rename. *Avoid:* a force-directed graph as the company view.

**2.6 Store layouts in a plain spatial format.** JSON Canvas 1.0 (Obsidian) has text, file, link and group nodes with `x, y, width, height`, six colour presets mapped to the app's palette, groups with a label and a background image, and labelled edges. *Take:* pinned perspective layouts fit a format this plain, and a group with a background image is already a place with a landmark. *Avoid:* making people do the layout (tldraw's arrow-wired "computer" is still experimental). Hand-arranged canvases rot.

## 3. Attention-first, calm interfaces

**3.1 Calm technology separates centre from periphery.** Amber Case: technology "should require the smallest possible amount of attention", "should make use of the periphery", "can communicate, but doesn't need to speak", "should work even when it fails". Weiser and Brown: the periphery is "informing without overburdening", and "centering the periphery is a fundamental enabler of calm". *Take:* the world (heat, weather, presence) is the periphery and the Stage is the centre. Something moves to the centre only when a person must act. *Avoid:* counters and red badges as the main signal.

**3.2 Apple: glanceable, and only as immersive as needed.** watchOS asks for "quick, glanceable, single-screen interactions" and shallow navigation, and notes that people use "complications, notifications, and Siri interactions" more than the app itself. visionOS: "find the minimum level of immersion that suits it best", and avoid motion "missing a stationary frame of reference". *Take:* the home works at a glance because much of the value arrives outside it (briefings, channels). The zoomable world is a choice, not a gate before every task, and something stays still during a zoom (the horizon band, the breadcrumb).

**3.3 Rams and Linear: chrome recedes.** Rams: good design is "unobtrusive", honest, and "Less, but better". Linear's redesign set out to "reduce visual noise, maintain visual alignment, and increase the hierarchy and density of navigation elements". It moved themes to LCH, generated from three inputs (base, accent, contrast) instead of 98 variables, and cut back the blue accent. *Take:* themes derived from a few perceptual inputs, and colour used only for meaning.

**3.4 One focal thing, finishable streams, decay by default.** In Things 3 a tapped task "pop[s] out into a card-like form while the rest of the list fades into the background". Superhuman splits the inbox because "viewing all your emails in one single list is overwhelming". Arc closes unpinned tabs after 12 hours, and this cannot be turned off. *Take:* one focal subject on the Stage, streams that can reach zero ("your decisions today: 3"), and untouched things sinking out of sight.

**3.5 Spend the novelty budget in one place.** Arc "unapologetically innovates on core browsing mechanics". Its successor Dia aims for "anyone [to] switch to Dia at 10am on a Tuesday morning", keeps the core UI minimal and puts its novelty into chat over open tabs. NN/g: "designs that go beyond 2 disclosure levels typically have low usability". *Take:* the world and the composer are the novelty, and the rest stays familiar. Zoom is navigation, and each scene has at most two disclosure levels: a glance, then detail.

## 4. Dashboards and infographics that are tools

**4.1 Chart grammars an AI can write need constraints.** Vega-Lite is "a high-level grammar of interactive graphics" with "a concise, declarative JSON syntax", composition, selections and a published JSON Schema, so its output can be validated. Observable Plot is a fine renderer but a JavaScript API, not a data format. An evaluation of six LLMs writing Vega-Lite found "substantial performance disparities across prompt strategies, chart types, and LLMs". *Take:* a restricted Vega-Lite subset (or catalogue charts with semantic props), with data referenced by binding, schema-validated and drawn by our renderer. *Avoid:* inline literal values.

**4.2 Compute the insights and let the model phrase them.** In Tableau Pulse, metric definitions are "a single source of truth", and people follow metrics. The platform "automatically detects drivers, trends, contributors, and outliers", each told in plain language with a visual, under an AI summary that also goes out in email or Slack digests. Q&A "uses pre-calculated insights rather than analyzing raw data". Drill-down is a set of guided questions that open breakdown charts. *Take:* aspects are made of followed metric objects, the narrative is phrased over deterministic insights, and drilling down means picking a suggested question rather than building a filter.

**4.3 The headline is the finding, the value sits above the trend, and the question picks the chart.** Stripe: "Show the current value above the chart so users get the answer before checking the trend". It picks the chart by the user's question ("Is this going up or down?" gives a line chart), allows at most three charts per row, and keeps one height across the loading, error, empty and populated states. Datawrapper: "Give the main statement first and the precise data explanation later". Geckoboard: the most important item goes top left, always show a target or previous value, and pies are "rarely the best choice". *Take:* encode these as composer rules.

**4.4 A few invariant meters build a visual language.** Apple's Activity rings mean only Move, Exercise and Stand. Their colours never change, they always show one person, and the rule is to "design the surrounding interface to blend with the rings; never change the rings". *Take:* three or four Lucid meters (a goal ring, a confidence haze, a load gauge, a heat glow) that mean one thing everywhere and can be read without labels. *Avoid:* a new chart style in every scene.

**4.5 A dashboard that acts: objects plus actions.** Palantir's Ontology maps data to objects, links, action types and functions, "a digital twin of the organization" with "semantic and kinetic elements". Ramp: "every action comes with a rationale". Its agents auto-approve low-risk spend, escalate "only the 10–15%" that needs judgment, and let teams "watch decisions stream in, override edge cases". *Take:* every visual binds to model objects, and every button is a declared action with a preview and an undo. That is what separates a tool from a poster.

## 5. Decision interfaces and simulation

**5.1 The ladder of abstraction is the method for Refocus.** Bret Victor: give "direct, interactive control over the independent variables", step up to a view across all values ("the system for all time"), and step down by pointing at it to see a concrete case; "this dance is where the deepest insights are born". *Take:* Refocus is not one slider. It draws the *family* of outcomes (ship dates for moving 0 to 100% of a team) as a fan, and tapping a point steps down to the concrete plan: who moves, which dates shift, which places cool.

**5.2 Keep exploring apart from committing.** Causal compares a base with any number of scenarios, has a "Show Variances" toggle (absolute or %), and by default charts every variable "under every scenario which affects it". Pigment uses Scenarios for ad-hoc what-ifs and Versions for planning that is "repeatable, auditable". *Take:* forks are cheap, private and disposable, while the plan of record is versioned and audited. Variance is always shown against a named base.

**5.3 DACI gives a decision its anatomy.** Atlassian's play has a Driver, a single Approver ("one person (yes: one!)"), Contributors ("a voice, but not a vote") and the Informed. The record holds a 1 to 2 sentence background, the data, the decision factors, an options table (pros, cons, resources, cost) and the outcome. *Take:* the Fork is DACI drawn. Options are paths, factors are the comparison axes, one approver glyph marks who decides, and the informed are shown as whom the outcome reaches. *Avoid:* a decision as a ticket with a comment thread.

**5.4 Show confidence, then check it.** Devin reports 🟢 🟡 🔴 confidence at session start, after its plan and when answering. Below green it asks clarifying questions, and "🟢 scores result[ed] in twice the likelihood of a merged PR compared to 🔴". *Take:* forecasts carry calibrated confidence drawn as haze, not as a percentage, and calibration (predicted against actual) is published in the AI operations aspect.

**5.5 Overlays need a quiet base.** One critic of Civilization VII's launch UI (a thin source) says the text is "horrible to read", the journal "clashes with the map", and "I usually prefer to scroll one thing at a time". *Take:* when a fork or lens is on, the base world desaturates and only what changes carries colour (ghosts, dashed outlines, people who moved).

## 6. AI operating systems and company OS products

**6.1 Adopt Linear's Agent Interaction Guidelines almost as written.** An agent "should always disclose that it's an agent", "inhabit the platform natively", give feedback that is "immediate, but unobtrusive", be clear about its state (thinking, waiting for input, executing, finished), and "respect requests to disengage". And "an agent cannot be held accountable": a human assignee stays responsible, with the agent as delegate. *Take:* this is "live but quiet". An agent is an avatar with a four-state ring, acknowledged at once, detailed only on demand, and it stops when told to.

**6.2 Agents show their working, memory and spend.** Asana's AI Teammates "show their step-by-step approach", and admins see "where they're engaged", with controls on permissions and "credit consumption". Notion 3.0's agent runs "over 20 minutes of multi-step actions", keeping its memory in pages and an editable "instructions page". *Take:* an agent's instructions and memory are visible, editable pages, and its budget use sits next to its work.

**6.3 What failed: no screen, no confirmation, slow.** Humane's AI Pin was pitched as "a tiny replacement for smartphones" with no clear job. It was slow, its projected display was "hard-to-use" and nearly invisible outdoors, and its assistant struggled. Rabbit's "large action model" was called "just marketing speak". The R1 completed a food order "without ever confirming my payment information or delivery address" and gave the weather when asked about traffic. *Take:* voice can direct, but consequential actions always confirm visually with a preview. Latency is a design property, and no capability is shown unless it works end to end.

**6.4 How agent work is shown and validated.** Acknowledge at once; show one of four states; deliver a reviewable artefact (a diff, a preview, a change set) rather than a log; give every action a rationale; grade autonomy by risk; keep escalations a small stream someone can finish. *Avoid:* feeds that broadcast every agent step.

## 7. Self-operating systems

**7.1 Declared desired state plus reconcilers.** A Kubernetes operator is "a control loop that watches the shared state... and makes changes attempting to move the current state towards the desired state". It encodes "the key aim of a human operator": backups, upgrades, even "simulating failure... to test its resilience". *Take:* Lucid Total runs itself through visible *keepers*. Each declares a desired state (an SLO, an eval threshold, a policy) and shows its spec, status and last action in the System health aspect.

**7.2 Google SRE: check safety before acting, and hand over to a person when unsure.** "Every action should be assessed for its safety before execution", and "automation should default to human operators if it runs into an unsafe condition". Partial automation (an "engineer behind the curtain") is a sound interim step. In one case study, a UI that "didn't reliably sync with the actual state of the switch" led people to act on live switches, and the fix capped how many links and devices one action could touch. *Take:* blast-radius caps per action, a staleness check before acting (the scene validator's rule too), and autonomy that grows in steps.

**7.3 Chaos drills prove the self-repair.** The principles: a steady-state hypothesis about "measurable output", real-world events, experiments in production, "automate experiments and run them continuously", and a minimal blast radius. *Take:* scheduled drills on Lucid Total itself (a provider down, a stale feed, a failed migration), shown as weather in System health rather than as alerts.

**7.4 Self-review needs ground truth and stopping rules.** Anthropic: use evaluator-optimizer loops "when we have clear evaluation criteria"; agents gain "'ground truth' from the environment at each step", pause at checkpoints and stop after a set number of iterations. incident.io: an AI SRE links telemetry, deploys and past incidents and recommends with evidence (a rollback rather than a restart that masks the defect). It keeps "human-in-the-loop approval for high-risk actions" and escalates only with "a high-confidence assessment". *Take:* a repair proposal is a Fork with evidence. Reversible fixes run automatically within caps, and irreversible or outbound ones wait for a person, as the `docs/06` permission classes already require.

## 8. Voice- and chat-directed interfaces

**8.1 A sentence yields a live view, not a picture.** Felt AI turns "Build me a map of California wildfire risk to my portfolio properties" into SQL, imported layers and styling on a shareable live map. Follow-ups such as "Now exclude the flood zones" keep the context, and it is read-only by default. *Take:* a request yields a scene that stays bound to the model, and refining it by voice edits the spec, not a screenshot.

**8.2 Every answer opens into its workings.** Hex Threads lets people "follow along with the agent's step-by-step reasoning". It prefers governed semantic models, falls back to raw tables only when needed, and can "turn a thread into a notebook". *Take:* every composed scene has a way into the instrument behind it (list, table, query) and names the governed definitions it used.

**8.3 Audience is a parameter, and one artefact has many renderings.** Perplexity Pages asks whether the audience is beginner, advanced or anyone, and that sets the depth. Its sections can be edited only by prompting. Gemini Canvas turns a research report into "a web page, infographic, quiz, or audio overview". *Take:* perspective and expertise are composer inputs, and a scene can be re-rendered as an infographic, a briefing or audio, while direct manipulation stays available.

**8.4 Inline answers, and a composer that never leaves.** Claude's in-chat visuals (HTML and SVG, March 2026) are "distinct from Artifacts", and Claude asks multiple-choice questions people answer with a tap. *Take:* an answer can be a small inline scene with "open on the Stage"; clarifications are tappable; and the voice and chat bar is always over the Stage, so any view can be redirected by speaking ("show this by customer", "what if we pause Europe").

---

## Synthesis: what matters most for Lucid Total

### The ten patterns

1. **Composed from a typed catalogue, redirected by voice.** Fixed scene tools for frequent views, a flat Zod-validated spec for composed views, one repair attempt then a fallback, and free code only in a sandbox without actions. The composer bar is always present (A2UI, json-render, AI SDK, OpenAI).
2. **Bind, don't write.** Numbers come from bindings, data refreshes without recomposing, and the server formats values (A2UI, OpenAI Apps SDK).
3. **Places with identity.** A name, a glyph, a hue from a fixed set, a landmark, a pinned position and a priority. The representation changes per zoom, labels show when legible, and collisions resolve by priority (CK3, Pad++, Google, MapKit).
4. **Showcase, don't filter; bring the periphery to the centre.** Fade the rest in place, widen focus by degree, and centre only what needs a person (Kumu, Weiser and Brown).
5. **One focal subject, streams someone can finish, decay by default,** and at most two disclosure levels per scene (Things, Superhuman, Arc, NN/g).
6. **The headline is the finding.** The value sits above the trend, the question picks the chart, narrative is phrased over pre-computed insights, and drill-down is a suggested question (Stripe, Datawrapper, Geckoboard, Pulse).
7. **A few invariant meters,** with colour used only for meaning (Activity rings, Linear, Rams).
8. **Decisions as forks with DACI anatomy.** Outcome families, variance against a named base, exploration kept apart from the plan of record, and calibrated, published confidence (Victor, Causal, Pigment, Devin).
9. **Agents visible and quiet.** Disclosure, instant acknowledgement, four states, a human accountable, a rationale per action, an artefact to review instead of a log, and they stop when told (Linear, Ramp, Asana).
10. **Self-operation through keepers.** Desired state, safety and staleness checks, blast-radius caps, hand-over to a person, proposals that carry evidence, and drills (Kubernetes, Google SRE, Chaos, incident.io).

### Five traps that make it feel like a ticketing system

1. **The list as home.** Rows with status, priority and assignee columns, or a kanban board, as the landing screen. Boards and lists are instruments, opened for a task.
2. **Taxonomy everywhere.** IDs, state pills, priority labels and avatars on every element at every zoom, with badges and counters as the signal. Glyphs and heat at a distance; fields only at item depth.
3. **Filters and forms as navigation.** Dropdown filters, saved searches and field-heavy pages as the way to find things. Ask, zoom or showcase instead; forms appear only to create or change something.
4. **Uniform rectangles.** The same card for every object, and dashboards as grids of equal tiles, with no hierarchy, no place identity and no focal subject. Size, position, hue and landmark must carry meaning.
5. **Comments for decisions, feeds for awareness.** Decisions buried in threads, and activity streams that record everything for everyone. Decisions are forks with an approver and an outcome; awareness is the periphery (heat, weather, briefings), not a log.

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
