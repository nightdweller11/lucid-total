# Lucid Total — The Living Map (concept)

> The company as a world that grows. Written 2026-10-28 by the lead from the owner's instructions of 2026-10-28 (T30, and the review and extension in T33), extended 2026-10-29 after the owner's review of the first simulation (T34: the layers must be visible, the map must track what is actually happening, and it must continue the v0.2 line), after the first map study (`docs/04-mocks/map-study/`) was rejected: it drew five static reliefs of one moment, with no live layers, nothing to zoom into, nothing to open, and no time. This document is the concept; `docs/17-living-map-product-plan.md` is the plan; `docs/04-mocks/living-map/` is the running simulation that shows it moving. It is subordinate to `docs/13-experience.md` (attention doctrine, the Stage, the dock) and replaces the world sections of `docs/03-map-and-views.md` where they differ.

---

## 0. The owner's brief, in his words

> "It doesn't feel organic enough, and it doesn't feel like something you zoom into. Showing data layers is also something I expect. We don't want a map for a map's sake; it should make visual sense and help the user organise and navigate things: cost layers, progress layers, issues layers, dependency layers. The map should serve as a right and useful way of understanding the company and its processes and its people and its tasks. I do like the gamified concept. Map elevation levels, a little 3D, futuristic, with relevant data floating. Heat maps. Overlays you see in maps: SimCity, electricity, plumbing layers; clogged plumbing as an analogy for a stuck process. Zooming in to see the next layer and dig deeper."

> "Things evolve over time. Areas are created, tasks are added, things the company has to worry about, projects, departments are formed and grow. The company can have multiple products, or lines of business, and we need that perspective as well. There are many ways to map out and view the organisation. They all must grow, organically. I want simulations of a city or a country growing that represent the timeline. A timeline and a playback of the company. Trace the progress of projects and tasks over time and see how the map grows and changes. Go back and trace a decision and its subsequent effects and how it grows. A new territory project starts small, maybe as part of a different entity, and grows until it is big enough to be its own land. Zoom in and out. Gamified, but a truly functional and useful interface where you can understand, follow, trace, zoom in and manage things. Transform the view from a departmental map to a project map, a product map, a responsibility and ownership map. Some things are overlays, like revenue and cost, over every view."

> (2026-10-29, on the first simulation) "I don't see any concept of overlay, I don't see theme switching, and most importantly it lacks any tracking of what is actually happening. It just grows, but nothing about tasks that are added or any context. I want the layering, I want to be able to understand what is going on, not just some growth timeline. Think also about 'last week' or whatever was the last time that I reviewed: I want to see task highlights, things that progressed. Layers, dependencies, transformations, overlaid over the map, and also a news feed of important events, with focus (the events can appear in context of the map on the region and place, then fade into things), so I see an expanded event or task and it folds into the map. Plus a more standard feed in context of the map and view on the right side that highlights tasks and more macro events, relevant at the zoom and dive level I am seeing. We can't just pre-allocate regions; they will shift as they grow. The hexagons should have some level of data on the related task, and more should be visible as we zoom in. Colours, icons, visual context and clarity of context just like we did in v2: large, clean, a dedicated infographic understanding of the organisation, its elements, actions, views and overlays. v2 is the line, and the map must continue in v2 style."

Everything below is in service of those three paragraphs.

## 1. The idea

**The company is a world that grew.** Nobody laid it out. It started as one house on empty ground, the founders' first product. Every task ever taken on claimed a plot next to its kin and became a building; the buildings became districts, the districts lands; a project that began as a few plots inside Engineering grew until it had its own owner, its own goal and its own budget, and seceded into a land of its own. Finished work did not vanish: it became lit stone, the foundation the next building stands on. The shape of the world today is the company's history made visible, and the way it is growing right now is the company's present.

Because it grew, it can be **played back**. Scrub to any day and the world is as it was that day. Press play and watch a year in a minute: plots appear, walls rise, lights come on, roads join districts, a storm forms over a stuck programme and clears when the decision that unblocks it is taken. Pick a decision and the world shows what grew from it. Pick a task and follow its wall rising, stalling, rising again.

Because the things in it are real things with many attributes, the same world can be **seen through different lenses**. The departmental map groups buildings by who owns the work; switch to the product map and the same buildings move, calmly, into quarters by what they build; the people map groups them by who is responsible; the project map by what they are for. Nothing is created or destroyed by a lens change. The buildings keep their names, their height and their lights; only their neighbourhood changes.

Because every reading of the company is a **layer on the same ground**, overlays recolour the world instead of adding to it. Cost makes the ground warm where money burns. Progress is a tide of light rising through each land. Issues are weather. Dependencies are pipes and power lines between buildings, with flow where work moves and a visible clog where it is stuck. Revenue is the harvest a land yields. Any overlay works on any lens, at any depth, at any time.

Because zoom is **depth, not magnification**, going closer always reveals the next layer. From the sky the world is lands with names and landmarks. Lower, districts with their own identity. Lower still, buildings with facades showing what they are making. At street level a building opens: its rooms are its criteria, its crew is who is working in it, its pipes are what feeds it and what waits on it, its wall chart is its own history. The same gesture that carries you from the company to a district carries you from a district into one task.

And because it is an operating system, not a picture, **everything on the map can be acted on**. The person clicks, types or speaks; the AI moves the camera, switches the lens, lays the overlay, opens the building, drags effort from one land to another and shows the re-forecast as the world changing. Nobody assembles the view (`docs/13` §8). The world is composed by the AI from a growing library of mechanisms: growth rules, lenses, overlays, landmarks, cutaways, playback.

## 2. Principles

1. **Grown, never laid out.** Position is history. A thing is born where its parent is and claims ground next to its kin. Positions are stable for ever within a lens; nothing is ever re-packed for neatness.
2. **The ground is honest.** Every visual measure is a real measure, inspectable from the legend chip: height is remaining work, light is progress, heat is cost, weather is trouble, flow is movement. Decoration carries no information and information is never decoration.
3. **One world, many lenses.** A lens changes the grouping of the same buildings and nothing else. Switching lenses animates buildings to their new quarters so the eye can follow.
4. **Overlays recolour, they never add.** No badges, no counts, no new marks. An overlay changes the ground, the light, the air or the lines that already exist.
5. **Time is a dimension, not a report.** The world at any instant is derived from its event log. Past, present and forecast are the same world at different times; the future is drawn as a ghost.
6. **Zoom reveals, it does not enlarge.** Each depth shows a different layer of the same place, and the next layer is faintly visible before you reach it.
7. **Anything can be opened.** A land, a district, a building, a monument, a pipe, a cloud: each has an inside, and the inside is drawn in the same language.
8. **The map is for doing.** Every object offers its actions; the Fork, Refocus and the Talk bar work from the map. Managing happens here, not in a form somewhere else.
9. **Calm by budget.** The attention doctrine of `docs/13` §3 holds: one focal subject, three needs-you at most, few numbers, alarms only for failing states, motion only where something changed. Playback is the one place where everything moves, and it moves because the person asked.
10. **Gamified in mechanics, not in rewards.** We take from games the pleasure of watching something grow, the legibility of overlays, the cutaway, the clog you can see. We take no points, no streaks, no confetti.

## 3. The matter of the world

| Thing in the company | Thing in the world | Born when | Grows by | Finishes as |
|---|---|---|---|---|
| The company | The world; its ground, sea and sky | Founding | Lands | — |
| A line of business, product, department, project, person (depending on the lens) | A **land**: a continuous territory with a name, a subject, a glyph, a stable hue, a landmark and a coastline | Its first building, or by secession (§4.3) | Districts and buildings claiming adjacent ground | A land is never finished; a land whose work is all done is a lit, quiet land |
| A programme, epic, wave, stream, team (the second level of the lens) | A **district**: a quarter of a land with its own name and square | Its first building | Buildings | A lit quarter with a monument at its square |
| A task, item, deliverable, chore, risk, decision item | A **building** on one plot: footprint by size, height by remaining work, light by progress, facade by what it makes | It is created | Walls rise as work is done; lights come on at review; the facade is fitted at done | Lit stone: foundation of what comes next |
| A criterion, test, document, walkthrough, sub-item | A **room** in a building | With its building | Lit when met | Lit |
| A decision | A **monument**: a stone with a date, placed where its effects live; its lineage runs from it | It is taken | Its effects grow around it | Part of the square |
| A dependency, hand-off, input, approval | A **pipe** (work flow) or a **power line** (approval and decision flow) between buildings or districts | The dependency is declared | Flow while the upstream delivers | Disappears into the ground when both ends are done |
| A person or an agent | A **light** in the building where they work; a **crew** seen in the cutaway | They join | — | — |
| A shipped product, a milestone reached | A **landmark**: a tall, lit, recognisable structure on the land's skyline | The milestone is met | — | Stays for ever |
| An issue, incident, breach, risk | **Weather** over the place it hurts: haze for staleness, cloud for issues, a storm for breach | It is detected | Darkens with severity | Clears |
| A goal | A **beacon** on the horizon of the lands that serve it; the tide of light rises toward it | It is set | — | A lighthouse when met |
| Money | **Heat** in the ground (cost) and **harvest** on the land (revenue) in the Money overlays; a **reservoir** in a land's cutaway (budget) | — | — | — |

At the sky view a land is a shape with a name and a landmark; a district is a visible quarter inside it; buildings are texture. At district depth buildings are blocks with height and light; at street depth they have facades and labels; opened, they have rooms.

## 4. Growth

### 4.1 Ground and plots

The world is a field of hexagonal plots. Hexagons give organic coastlines without diagonal artefacts and six equal neighbours for growth. A plot is empty ground, sea (unclaimable ground that keeps lands apart), or claimed by exactly one building for ever. The field is unbounded; the camera's limits follow the claimed extent.

### 4.2 The claiming rule

When a building is born it claims one empty plot:

1. next to a plot of its own district if the district exists; otherwise
2. next to a plot of its own land; otherwise
3. at the land's seed, a point chosen on a quiet spiral around the world's centre, far enough from existing lands that the new land has room to grow.

Among the candidate plots it takes the one nearest the district's centre of mass, with a small deterministic noise so edges ripple. Because every claim is adjacent to kin, districts are contiguous blobs and lands are contiguous countries, and the coastlines ripple because the noise and the order of births do. The same event log always grows the same world: layout is a pure function of history.

A building that is dropped keeps its plot as a **park** (green, flat), so the world never has holes and history stays legible. A building that moves between districts within a lens (re-parenting) walks to a new plot and leaves a park behind.

### 4.3 Secession: a district becomes a land

The owner's example: a new territory project starts small inside another entity and grows until it is big enough to be its own land. The rule, written as policy (thresholds are platform settings, never hard-coded):

- A district **qualifies** for its own land when it has its own owner, its own goal and its own budget line, or when it exceeds a share of its parent's plots.
- Qualification is proposed by the AI as a decision item (the Fork: "Make Europe its own land?"). On acceptance the district **seceds**: its plots are re-seeded as a new land adjacent to the parent's coast, the buildings walk across a new causeway over one playback beat, and the causeway remains as the road between the two.
- A land can also be **absorbed** (the reverse) and two districts can **merge**; the walk is the same animation.

In the lens where the grouping already separates them (a product lens, for a product that was always a product), secession is simply the first building of a new land. The animation belongs to the lens whose grouping changed.

### 4.4 What grows, what rises, what lights

| Change in the company | Motion in the world |
|---|---|
| A task is created | A plot is claimed; a footprint is drawn (a plot with a faint outline). |
| Work starts | Walls begin to rise. Height while working is the remaining work; a building at half done is at half its final height and still rising. |
| A review | Scaffold lights: the top floor glows cool while the building is checked. |
| Done | The facade is fitted, every window lights, the building settles into lit stone. The district's light share rises. |
| Blocked | The building goes dark; its inflow pipe shows the clog (a dark, pulsing knot at the blocked end). Weather forms over it only if the block breaches a service level. |
| Dropped | The plot becomes a park. |
| A decision is taken | A monument is placed on the district's square; its lineage lines run to the buildings it created or changed. |
| A dependency is declared | A pipe is laid from upstream to downstream. It carries flow while the upstream delivers. |
| A person joins | A light appears in the building they work in; in a people lens, a plot in their land. |
| A milestone ships | A landmark rises on the skyline, taller than any building, lit for ever. |
| A district qualifies as a land | A Fork; on acceptance, the secession walk (§4.3). |
| Nothing happens for a while | Haze thickens over the place; the lights dim. |

### 4.5 Company scale

With two founders the world is one land with a few buildings on a small island. With twenty people it is five lands and a harbour. With two hundred it is a continent with coastlines, highways and weather systems. The rules do not change; the camera's default height does, and so does what the sky view labels: at scale, only lands and landmarks have names at the sky view and districts appear when you descend.

## 5. Time

### 5.1 The event log is the world

Every change is an event with a time. The world at time *t* is the world grown from all events up to *t*. Scrubbing to *t* draws that world; playing from *t* applies the events in order at the chosen speed, with each event's motion from §4.4. The simulation in `docs/04-mocks/living-map/` does exactly this with the real event log of Lucid Chat's build (eleven days, two thousand rows, five hundred decisions) and with a generated three-year company.

### 5.2 Playback

A timeline rail along the bottom of the Stage: the span of the company, the position of **now**, a scrubber, play and pause, speed (a day a second, a week a second, a month a second), and the ticks of monuments (decisions) and landmarks (milestones) on the rail so they can be jumped to. Above the rail, a quiet ledger of what is happening in the current beat ("Private beta: 4 buildings rose, 1 lit"). While playing, every change moves; when paused, the world is as still as any Horizon view.

### 5.3 Past, now, future

Past and now are the same world. The future is the forecast: beyond **now** the rail continues as a ghost, and scrubbing into it draws the lands as the forecast expects them (buildings rising at their forecast pace, goal beacons lit at their forecast dates) in ghost outline. A Refocus (`docs/13` §7.3) produces an alternative future, drawn as a second ghost; Futures saved from the Fork are branches on the rail.

### 5.4 Tracing

- **A decision.** Choose a monument (from the rail, the map, or by asking). The world dims except its lineage: the buildings it created, the districts it reshaped, the land that seceded because of it, the pipes it laid. "Play from here" plays its consequences forward. The monument's cutaway shows the decision's context (the Fork it came from, the paths not taken), its date, who took it, and what it has cost and yielded since.
- **A task or a project.** Choose a building or a district: its history strip (born, started, reviewed, blocked, done, with dates) appears, and playback follows it.
- **A difference.** Choose two times ("since Monday"; "between the two gates"): what changed is drawn lit, what did not is dimmed. This is the meeting view of the week.

## 6. Lenses

A lens is a grouping of the same buildings into districts and lands. Lenses are configured per company; the defaults:

| Lens | Lands | Districts | Best for |
|---|---|---|---|
| **Departments** | Functions (Engineering, Product, Marketing…) | Teams, programmes within a function | Who owns the work; capacity; the organisation's shape |
| **Projects** | Phases, initiatives, waves | Epics, streams | Delivery; gates; what is on the critical path |
| **Products / lines of business** | Products, markets, business lines | Components, features, markets | Where value is made; where money goes per product |
| **People / ownership** | Owners (people, agents, crews) | What each owns | Responsibility; load; who to ask |
| **Customers** (later) | Segments, accounts | Journeys, incidents | Who is served; where it hurts |
| **Money** (later, also an overlay) | Budget lines | Cost centres | Spend and yield |

Switching lenses: the camera holds; the land hulls of the old lens fade; every building walks to its plot in the new lens over one beat; the new hulls draw in. A building keeps its name, height and light throughout. The AI chooses the lens that answers the question asked ("who is overloaded" → people; "where are we on the beta" → projects), and says which lens it chose.

Because position is history **within a lens**, every lens has its own grown world, derived from the same event log by its own grouping. The lenses exist from the first event; a company that has never looked at its product lens still has one, fully grown, the first time it does.

## 7. Overlays

An overlay recolours the world. It never adds marks or counts. Several overlays can stack when they use different channels (ground, light, air, lines).

| Overlay | Channel | What it shows | Glance answer |
|---|---|---|---|
| **Terrain** (default off) | Ground relief | Elevation is remaining work: a district with much left to do is a hill, a finished one a plain | How much is left, where |
| **Progress** | Light | A tide of light rising through each land to its done share; the forecast tide as a dotted line ahead | How far along, where it lags |
| **Cost** | Ground heat | Warm ground where spend accumulates (people and AI cost, with AI cost as a cooler teal hue inside the warm) | Where money burns |
| **Revenue / harvest** | Ground yield | Golden fields where revenue is attributed; brown where cost exceeds revenue | Where money is made |
| **Issues** | Air | Haze for staleness, clouds for issues, a storm for breaches; they move with the weather, slowly | What is hurting |
| **Dependencies: pipes** | Lines | Work flow between buildings and districts; flow particles while the upstream delivers; a dark, pulsing **clog** at a blocked end; dry (dotted) pipes downstream of a clog | What is stuck, what it holds back |
| **Dependencies: power** | Lines | Approval and decision flow; a district waiting on a decision is **dark** (its lights off) with the open switch drawn at the monument it waits for | What waits on whom |
| **Load** | Light colour | People and agent load as the warmth of the window light; overloaded buildings flicker | Who is stretched |
| **Freshness** | Light | Lit where something moved today; dim where nothing has for a fortnight | What is alive |
| **AI** | Light hue | The share of work done by agents as a teal tint; the trust ceiling per land as a faint ring | Where the system works by itself |
| **Risk** | Air | Forecast weather: fronts over goals at risk, before they fail | What will hurt |

The plumbing and power pictures are the owner's SimCity analogy made literal: a process is a pipe, its throughput is the flow you can see, and a stuck process is a clogged pipe with a dry district behind it. An approval chain is a power line, and a district whose decision is overdue is a blackout. Both work at every depth: at the sky view they are the lines between lands; at street depth they enter the buildings.

## 8. Zoom

| Depth | What is drawn | Labels | Reveals, faintly, the next |
|---|---|---|---|
| **Z0 Sky** | The world: lands as shaped countries with coast, shore, hue wash and light; each land's **place marker** (its landmark inside its progress ring, the name beneath); weather fronts; the main roads; buildings as city lights | Land names; the overlay's value as a chip under each marker | District quarters as faint contours inside each land |
| **Z1 Land** | One land fills the view: districts as quarters with their own markers (small ring, name); every plot is a **tile** carrying its kind glyph; blocked tiles carry a dot; pipes between districts | Districts; the overlay's value per district | The tile's ring and title |
| **Z2 District** | Every tile shows its **kind glyph in a disc, its progress ring and its short title**; blocked tiles carry a barrier; flags on the square; pipes and power into each tile; the change badge of the since layer | Tiles; flags of the owner; landmarks | The facade |
| **Z3 Street** | Every tile holds its **facade card**: the product's image, the kind glyph, the criteria ring, the title, who holds it and since when; barriers on clogged pipes; parks with their trees | Everything | The product view |
| **Opened** | The **product view** (docs/13 §6): the product large with expected against actual under a split at the done share; the goal and the done rule; the context chips (land, district, the flag that spawned it, who, state, since, cost, size); the criteria ring with its named segments; the talk (its history and Lucid's reading); the roads in and out; when done, what it changed first | — | — |

The same rule holds for places: a land or a district opens into its **place view** (the landmark large in its ring, the subject, how its coast grew, its districts with their rings, who is here, what is stuck, the decisions standing in it) and a flag opens into its **decision view** (what grew from it, with trace and play-from-here).

Zoom is continuous: the wheel, the pinch, a click on a place ("fly to"), or a sentence ("show me the dispatcher"). The camera never cuts; it flies. The Horizon of `docs/13` §4 stays above the world at every depth, and the breadcrumb (Company › Engineering › Private beta › Dispatcher) is the way back up.

## 9. Seeing into things

- **A building opens** into its cutaway (Z3): rooms lit as criteria are met; the crew (people and agents, with the agent's state: idle, working, waiting, stopped); the pipes with their flow or clog; the wall chart; the monument; the actions (nudge, reassign, approve, open the product, ask).
- **A district opens** into its square: the monuments in date order, the pipes in and out, the district's goal beacon and tide, its budget reservoir, its crews.
- **A land opens** into its country view with the same elements at land scale, and its coastline history (how it grew, as a time-lapse strip).
- **A monument opens** into the decision: context, paths not taken, date, who, cost and yield since, lineage.
- **A pipe opens** into the hand-off: what flows, how much, since when, what blocks it.
- **A cloud opens** into the issue.

The cutaway is drawn in the world, in place, with the rest of the world dimmed around it; it is not a panel over a map.

## 10. Managing from the map

Every object carries its actions in its cutaway and on long press. The large actions are the ones in `docs/13`: the **Fork** (a decision with its paths and consequences drawn as alternative futures on the rail), **Refocus** (drag effort from one land to another; the tide and the forecast ghosts re-draw live), **nudge**, **assign**, **approve**, **ask**. Playback of a Refocus shows the two futures growing side by side.

The person never arranges the map. The AI composes it: chooses the lens, lays the overlay, flies the camera, opens the cutaway, places the ledger. "Show me where money burns on the product map" is a lens, an overlay and a camera move. "What did the Europe decision cause" is a trace. "Play the last month at a day a second" is playback.

## 11. The five readings, reconciled

The rejected study's five variants survive as mechanisms of the one living map, not as alternatives: the relief as the Terrain overlay, the city as the base rendering, the biome's rule that layers recolour the ground as principle 4, the orbits as the goal beacon and the Projects lens, the transit lines as the pipes and power overlay. `docs/03-map-and-views.md` §3–§6 are superseded by §3–§8 here; its inspirations table stands.

## 12. Calm in a world that moves

Motion only where something changed: outside playback the world is still except flow particles in pipes with live movement, a slow drift of weather, and the breath of a building being built right now. Hues are the land hues; amber and coral are reserved for blocked and breached. Labels appear only when legible at the current depth, never more than the attention budget allows; everything else is shape, light and position. Playback is the deliberate exception: the person pressed play.

## 13. The simulation

`docs/04-mocks/living-map/index.html` is the working model of this document: one world, four lenses, the layers of §7 with their legend and floating values, continuous zoom with the depths of §8, the product, place and decision views, the since layer and the feed of §15, the timeline with playback and in-place event cards, tracing of decisions and tasks, the lab (three themes, high contrast, motion, dataset), and two datasets: the real event log of Lucid Chat's build extracted from its git history (every checklist row's birth and status changes, every numbered decision), and a generated three-year company with revenue, several products, a secession and a crisis. Its stills are in `shots/`; the generator in `gen/`; how to read it in its `README.md`.

## 15. What is happening: the layers of attention (T34)

The first simulation grew, and showed nothing of what was happening. The owner's review named the gap: the map must carry context at every depth, say what changed since the person last looked, and tell the news in place. These are the mechanisms, all drawn in the v0.2 vocabulary of `docs/04-mocks/README.md` (glass, landmarks in rings, kind glyphs, facades, flags, roads, the dock, Talk).

### 15.1 Tiles carry their task, more as you descend

A plot is never an empty hexagon. At land depth it carries the kind glyph of its task (task, story, bug, chore, decision item, goal); at district depth the glyph sits in its disc with the progress ring around it and the short title beneath; at street depth the plot holds the facade card (the product image, the criteria ring, the title, who and since). Its state is its edge: dashed when planned, green when lit, coral when blocked, teal in review; a barrier marks a clog; a park marks what was set aside. The depth table of §8 is binding.

### 15.2 Layers are a concept the person can see

A layer is chosen from one row of named, iconed chips under the lens control. Laying one does three things at once: it recolours the ground, the light, the air or the lines (§7); it floats the layer's number under every place marker in view (the cost of a land, the done share of a district, how many buildings are blocked, how many agents built it); and it opens the **legend card**: what the colour means, its scale from low to high, and the three places that lead it, each a chip that flies there. Layers on the same channel replace each other; two layers on different channels combine. A **Growth** layer (lime where plots were claimed most recently) shows how the regions shifted as they grew; nothing is pre-allocated, and the growth layer is the proof.

### 15.3 Since you last looked

A **since** moment is a chip and a handle on the rail. When it is set, every building that changed between that moment and the playhead carries a **change badge** (new, moved on, in review, lit, blocked, moved land, set aside) and the rest of the world dims to ambient; place markers carry "N changed"; heat halos sit over the districts where most moved; the legend card shows the six badges with their counts; the product and place views open on what changed. The since menu offers yesterday, the last week, month, quarter or year (the choices scale with the dataset), "mark now as reviewed", and off. "What changed since last week" in Talk does the same.

### 15.4 The feed, scoped to where you are

A glass column at the end edge tells what is happening in the place the camera is over, in the window since the person last looked: at the sky, the company's macro events (decisions, landmarks, storms, secessions, lands founded, the big completions); over a land, that land's decisions, districts formed and notable buildings; over a district, every building that was born, rose, was reviewed, lit, blocked or moved. The head of the feed sums the window (N new, moved on, lit, stuck, decided); filters narrow it to decisions, lit, stuck or new; each card names the event, the place and when, and flies to it when touched (the building opens, the flag traces, the land focuses). The feed folds away with one tap and comes back with `F`.

### 15.5 Events appear in place and fold into the map

During playback an important event appears as a card at the place it happened (a decision at its flag, a landmark on its land, a completion at its building, a storm over its district): it opens, holds a beat, and folds into its building. At most three cards live at once; what counts as important rises with the playback speed (owner decisions, landmarks, storms, secessions and lands founded at any speed; large completions and blocks at the slower speeds). The ledger pills above the map count the rest per land. The camera follows a young city as it grows (play from the start) and holds still once the person has moved it.

### 15.6 The grammar sheet

The **Legend** opens a sheet that explains the map with live samples drawn by the renderer itself: the elements (land, district, the six states of a tile, the facade, the flag, the landmark, pipes, barriers, weather, heat, causeways), the four depths, the four lenses, the eleven layers with their scales, the seven change badges, and the actions. It is the dedicated infographic the owner asked for, and it is generated from the same code that draws the map, so it cannot drift.

### 15.7 The lab

Theme (Deep Blue, Aqua Dusk, Sky Glass), contrast (standard, high), motion (full, reduced) and the dataset are one popover; every still of the gallery can be reproduced in any of them from its URL.

## 14. Open questions for the owner

Material only (L425). Everything smaller is a platform setting with a default.

- **T-O11** Secession is proposed by the AI and accepted by a person, or automatic above a threshold? (Default: proposed.)
- **T-O12** Should money overlays be visible to everyone, or by role? (Default: by role; cost visible to owners of the land, revenue to leadership.)
