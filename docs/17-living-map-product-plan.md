# Lucid Total — The Living Map: product plan

> Everything the map is and does, and how it moves over time. Written 2026-10-28 by the lead from `docs/16-living-map.md` (the concept) and the owner's instructions T30 and T33. Requirement IDs are `LM-<area>-<n>`; each is testable and carries into `docs/09-testing-and-quality.md` §3 and the checklist. The running model is `docs/04-mocks/living-map/`. Where this plan and `docs/13-experience.md` differ, `docs/13` wins; where it and `docs/03-map-and-views.md` differ, this plan wins.

---

## 1. Scope and non-goals

**In scope.** The world rendering (lands, districts, buildings, rooms, monuments, pipes, power, weather, landmarks, beacons); growth from the event log; the timeline and playback; tracing; lenses; overlays; continuous zoom with cutaways; actions from the map; the phone; accessibility and RTL; the data model and the composer's control of the map; performance targets; the mechanism library and how it grows.

**Not in scope here.** The Horizon, the Fork, Refocus and the Table as instruments (they are in `docs/13` §4 and §7; this plan only says how they appear on and act through the map); the scene grammar (`docs/13` §8); the self-operation mechanisms (`docs/14`).

## 2. Areas and requirements

### 2.1 The world (LM-W)

| ID | Requirement |
|---|---|
| LM-W-1 | The world is a hexagonal plot field. A plot is empty, sea, park, or claimed by exactly one building for the lifetime of the lens-world. |
| LM-W-2 | A building occupies one plot. Its footprint fill is its size class (1–5), its height its remaining work, its light its progress, its facade its product kind (`docs/13` §5.3). |
| LM-W-3 | A district is the contiguous set of its buildings' plots plus its square; a land is the contiguous set of its districts'. Contiguity is guaranteed by the claiming rule (LM-G-2). |
| LM-W-4 | Every land and district has an identity: name, subject sentence, glyph, hue from the family palette, landmark (land only), and a stable position. Identity is proposed by the AI and editable by a person. |
| LM-W-5 | Sea separates lands. The sea between two lands narrows as roads (aggregated dependencies) and causeways (secessions) join them. |
| LM-W-6 | Monuments stand on district squares. A monument is placed where the majority of its effects live and moves only if a later lens-world places its effects elsewhere. |
| LM-W-7 | Landmarks rise on a land's skyline when a milestone is met; they are taller than any building and lit for ever. |
| LM-W-8 | Beacons stand at the horizon edge of the lands that serve a goal; the progress tide (LM-O-2) rises toward them. |
| LM-W-9 | Weather is drawn in the air layer, above buildings and below labels, drifting slowly; it never obscures a label or a focal subject. |
| LM-W-10 | The world has no decoration that carries no measure; the legend chip (LM-UI-6) names every encoding in use. |

### 2.2 Growth (LM-G)

| ID | Requirement |
|---|---|
| LM-G-1 | Layout is a pure function of the event log and the lens: the same log grows the same world on every device and every day. No layout state is stored except the log. |
| LM-G-2 | A new building claims the empty plot adjacent to its district (else its land, else its land's seed) that minimises distance to the district's centre of mass with a deterministic ripple noise; ties break by birth order. |
| LM-G-3 | A new land seeds on the quiet spiral around the world's centre at a spacing set by company scale (platform setting), never over sea claimed by a road. |
| LM-G-4 | A new district inside a land seeds on the land's frontier nearest the land's centre. |
| LM-G-5 | A dropped building leaves a park. A building that moves within a lens leaves a park and walks to its new plot. |
| LM-G-6 | **Secession.** A district qualifies for its own land when platform-set thresholds are met (own owner, own goal, own budget line, or a share of its parent's plots). Qualification produces a Fork; acceptance re-seeds the district as a land adjacent to the parent's coast and walks its buildings across over one beat, leaving a causeway. Absorption and merge use the same walk. |
| LM-G-7 | Growth is bounded only by the camera's extent, which follows the claimed plots with a margin. |
| LM-G-8 | Company scale (two people to thousands) changes the default camera height and which labels the sky view carries, not the rules. |
| LM-G-9 | A lens-world exists for every configured lens from the first event; adding a lens later grows its world from the whole log on demand. |

### 2.3 Time (LM-T)

| ID | Requirement |
|---|---|
| LM-T-1 | The world at any time *t* is derived from events with time ≤ *t*. Scrubbing to *t* draws that world within one frame budget of 16 ms for up to 5,000 buildings (LM-R-1). |
| LM-T-2 | A timeline rail shows the company's span, now, the scrubber, monument and landmark ticks, phase bands, and the forecast ghost beyond now. |
| LM-T-3 | Playback runs at speeds of an hour, a day, a week or a month per second, with pause, step, and jump to the next monument or landmark. Default speed is chosen so the whole span plays in about a minute. |
| LM-T-4 | Every event has a motion (concept §4.4) with a minimum visible duration during playback, so a change that was instantaneous in the log still reads. |
| LM-T-5 | A ledger beside the rail names what is happening in the current beat in at most three lines, calmly, and is empty when nothing happens. |
| LM-T-6 | Beyond now, the world is drawn as the forecast ghost: buildings rising at their forecast pace, beacons lit at their forecast dates, in outline. Saved Futures and Refocus results are branches on the rail. |
| LM-T-7 | **Trace a decision:** the world dims to the monument's lineage (buildings created or changed, districts reshaped, lands seceded, pipes laid); "play from here" plays from its date. |
| LM-T-8 | **Trace a task or district:** its history strip (born, started, review, blocked, done, dates) and playback following it. |
| LM-T-9 | **Difference view:** between two times, what changed is lit and the rest dimmed; this is the default Table (meeting) view of the week. |
| LM-T-10 | The rail reads from right to left in RTL locales; playback direction follows the reading direction. |

### 2.4 Lenses (LM-L)

| ID | Requirement |
|---|---|
| LM-L-1 | Default lenses: Departments, Projects, Products / lines of business, People / ownership. Later: Customers, Money. Lenses are company configuration. |
| LM-L-2 | A lens is a grouping function (building → district → land) that may vary with time (re-parenting, secession). |
| LM-L-3 | Switching lenses keeps the camera, fades the old hulls, walks every building to its plot in the new lens over one beat, and draws the new hulls. Names, heights and lights persist through the walk. |
| LM-L-4 | The AI chooses the lens that answers the question and says which; a person can switch with one tap or one word. |
| LM-L-5 | Overlays apply to every lens unchanged. |

### 2.5 Layers (LM-O)

Rewritten in T35: a layer greys the city and raises a translucent slab of its colour on every tile, its height the value; one layer at a time (Dependencies apart); the key is always visible. Terrain, Pipes and Power are withdrawn (T35).

| ID | Requirement |
|---|---|
| LM-O-1 | **Progress:** the share per task as a number and a slab; the place's share as its plate tint; done tiles show a check, not a number. |
| LM-O-2 | **Problems:** where something needs a person (asked, blocked, waiting in review, still too long); icons float above tiles; at the sky one icon per land with a count. |
| LM-O-3 | **Cost:** accumulated spend per task and place; visible by role (T-O12). |
| LM-O-4 | **Revenue:** attributed revenue per product spread over its places; visible by role. |
| LM-O-5 | **Dependencies:** the roads between tasks as an underground view (tiles flatten and grey so the roads read): dashed waits, flowing feeds with particles, coral from a blocked upstream, a barrier at the clog; aggregated between lands at the sky. |
| LM-O-6 | **People:** who holds the work; agents against people per place. |
| LM-O-7 | **Recency:** how recently each task last moved. |
| LM-O-8 | **Growth:** when each plot was claimed; regions shift as they grow. |
| LM-O-9 | **Risk** (phase 2): forecast weather over goals at risk. |
| LM-O-10 | The base steps back (greyed) while a layer is laid; every saturated pixel is data. Layers never add marks or counts; problems are icons and exist in every layer. |
| LM-O-11 | The key shows the layer's name, one sentence, the scale with its end words, and the three places that lead; it opens and closes with the layer. |
| LM-O-12 | Hold-to-peek (hold a key, release to return) beside sticky layers; a platform setting. |

### 2.6 Zoom and cutaways (LM-Z)

| ID | Requirement |
|---|---|
| LM-Z-1 | Zoom is continuous (wheel, pinch, double tap, fly-to, sentence); the camera flies and never cuts. |
| LM-Z-2 | Semantic depths Z0 sky, Z1 land, Z2 district, Z3 building (concept §8); each reveals the next faintly before it is reached. |
| LM-Z-3 | Labels appear only when legible (≥ 12.5 px rendered) and within the attention budget; otherwise the object is shape, light and position. |
| LM-Z-4 | Cutaways open in place with the world dimmed around them: building (rooms, crew, pipes, wall chart, monument, actions), district (square, monuments, reservoir, crews), land (country view, coastline history), monument (decision), pipe (hand-off), cloud (issue). |
| LM-Z-5 | A breadcrumb (Company › land › district › building) is the way back up; the Horizon stays above the world at every depth. |
| LM-Z-6 | The minimap is not used (`docs/13`); the breadcrumb and fly-out replace it. |

### 2.7 Actions from the map (LM-A)

| ID | Requirement |
|---|---|
| LM-A-1 | Every object offers its actions in its cutaway and on long press: nudge, assign, approve, open the product, ask, trace, play from here. |
| LM-A-2 | Refocus is performed on the map by dragging effort between lands; the tide, the heights and the forecast ghosts re-draw live; Apply / Save as future / Discard. |
| LM-A-3 | A Fork opens from a monument-to-be (a proposed decision) with its paths drawn as alternative futures on the rail. |
| LM-A-4 | Secession, absorption and merge are decision items (Forks), never silent. |
| LM-A-5 | The Talk bar drives everything: lens, overlay, camera, time, trace, open, act. The AI answers in the world and in one sentence. |

### 2.8 Phone (LM-P)

| ID | Requirement |
|---|---|
| LM-P-1 | At phone width the world is one place at a time at Z1 or deeper; the sky view is a scrollable list of lands with their landmark, tide and weather, each tappable to fly in. |
| LM-P-2 | Pinch, drag and double tap work; the rail collapses to a scrubber with play; the cutaway becomes a sheet. |
| LM-P-3 | Playback on the phone draws at 30 fps with the same motions. |

### 2.9 Accessibility and RTL (LM-X)

| ID | Requirement |
|---|---|
| LM-X-1 | Every encoding has a non-colour channel: height, light, outline, motion or position; high contrast replaces glass and gradients with solid fills and visible edges. |
| LM-X-2 | Reduced motion: playback steps instead of animating; flow particles become static arrows; weather does not drift. |
| LM-X-3 | A list equivalent of every depth exists and is the screen-reader surface (lands → districts → buildings with their states). |
| LM-X-4 | RTL mirrors the layout chrome, the rail and the breadcrumb; the world itself is not mirrored (position is history), but the camera's default framing is. |

### 2.10 Rendering and performance (LM-R)

| ID | Requirement |
|---|---|
| LM-R-1 | 5,000 buildings, 500 pipes, 200 monuments at 60 fps on a 2020 laptop and 30 fps on a 2022 phone; 20,000 buildings with level-of-detail at the sky view. |
| LM-R-2 | Canvas 2D for the world (hull, extrusion, light, weather); WebGL only if LM-R-1 cannot be met; HTML for chrome and cutaway text. |
| LM-R-3 | Level of detail by scale: hulls and landmarks only below 0.35; flat tiles to 1.2; extrusions and facades above; rooms above 3. |
| LM-R-4 | Hull outlines are recomputed only when the claimed set changes; everything else is drawn from cached per-building state. |
| LM-R-5 | A still of any state is reproducible (for the attention validator and for sharing). |

### 2.11 Data model (LM-D)

| ID | Requirement |
|---|---|
| LM-D-1 | The event log is the source of truth: `item.created`, `item.status`, `item.moved`, `item.dropped`, `dependency.declared`, `decision.taken`, `milestone.met`, `person.joined`, `land.seceded`, `measure.sampled` (cost, revenue, load), each with time, actor and payload. |
| LM-D-2 | The item has: id, name, kind (task, chore, risk, decision item, milestone), size class, product kind (facade), groups per lens (possibly time-varying), dependencies, decision lineage, criteria (rooms), owner(s), agent runs. |
| LM-D-3 | Lens-worlds are derived and cached: claims (plot per building per time), hulls, squares, seeds. A cache is invalidated by a new event and rebuilt incrementally (append-only claims). |
| LM-D-4 | Money measures are sampled per item or per land (cost burn by day, revenue attribution by day) and are restricted data (`docs/07`); the map receives only what the role may see. |
| LM-D-5 | The map reads nothing a role may not see; a hidden building is drawn as an unlit plot with no name. |

### 2.12 The composer and the mechanism library (LM-C)

| ID | Requirement |
|---|---|
| LM-C-1 | The map is a scene tool of the Stage (`docs/13` §8.1) with parameters: dataset, lens, overlays, camera (place, depth), time (instant, range, playing, speed), trace (monument, building), cutaway (object). The AI composes by setting them. |
| LM-C-2 | The mechanism library holds growth rules, lenses, overlays, landmarks, facades, cutaways, motions. Each is a catalogue entry with a schema, a renderer and a meaning sentence; new entries go through oversight (`docs/13` §8.4). |
| LM-C-3 | A new overlay or lens can be added without touching the renderer core: an overlay is a function from (building, time, role) to a channel value; a lens is a grouping function. |
| LM-C-4 | Generated images (`docs/13` §8.2) may be used as landmark illustrations and facade art, never as data. |

### 2.13 Tiles and depth (LM-H)

| ID | Requirement | Acceptance |
|---|---|---|
| LM-H-1 | A plot always shows its task's kind glyph from land depth down; the glyph families and icons are those of `docs/04-mocks` (Lucide) | No depth from Z1 down shows a plain hexagon |
| LM-H-2 | At district depth a tile shows its glyph disc, its progress ring and its short title; at street depth its facade card with the criteria ring, title, who and since | Stills `lucid-district`, `lucid-street` |
| LM-H-3 | A tile's edge is its state: dashed planned, green lit, coral blocked, teal in review; a barrier marks a clog; a park marks set-aside work | The grammar sheet samples match the map |
| LM-H-4 | Titles never truncate below nine characters; when there is no room they are not drawn | No "in the…" stubs at any zoom |
| LM-H-5 | Place markers (landmark in its ring, the name beneath) are drawn for lands at Z0–Z1 and for the ten largest districts in view at Z1–Z2; their count obeys the attention budget | ≤ 12 names above body size on any still |

### 2.14 Layers as a visible concept (LM-Y)

| ID | Requirement | Acceptance |
|---|---|---|
| LM-Y-1 | Layers are a named, iconed row under the lens control; one channel at a time (ground, relief, air, lines, light) | Toggling a ground layer replaces the other ground layer |
| LM-Y-2 | A laid layer floats its value under every place marker in view (≤ 12 chips) | Stills `lucid-cost`, `lucid-progress`, `example-revenue` |
| LM-Y-3 | A laid layer opens the legend card: meaning, scale, the three leading places as chips that fly there | Still `example-cost` |
| LM-Y-4 | The Growth layer tints plots and places by how recently they were claimed, so the shifting of regions is visible | Still `example-growth` |
| LM-Y-5 | Every layer's meaning is one sentence in `LM.OV_INFO`, used by the chips, the legend card, the grammar sheet and Talk | One source of truth |

### 2.15 Since you last looked (LM-S)

| ID | Requirement | Acceptance |
|---|---|---|
| LM-S-1 | A since moment per viewer, set from a menu (relative windows scaled to the dataset), by "mark now as reviewed", by dragging the handle on the rail, or by Talk ("what changed since last week") | Still `lucid-since-menu` |
| LM-S-2 | With a since moment set, changed buildings carry a badge (new, moved on, in review, lit, blocked, moved land, set aside) and unchanged ones dim to 28 % | Stills `lucid-since-sky`, `lucid-since-district` |
| LM-S-3 | Place markers show "N changed"; heat halos sit on the districts that moved most; the legend card lists the badges with counts | Still `lucid-since-land` |
| LM-S-4 | The product and place views open on what changed in the window | Place view shows the since line |
| LM-S-5 | The since moment is URL state (`since=`) and is reproducible | Every since still has a URL |

### 2.16 The feed and the in-place cards (LM-F)

| ID | Requirement | Acceptance |
|---|---|---|
| LM-F-1 | A feed at the end edge, scoped to the camera's place (company, land, district) and to the window since the person last looked (or the dataset's review window) | The feed head names the scope and the window |
| LM-F-2 | Importance per event (0–100): landmarks, storms, secessions and owner decisions at the top; lands founded; large completions and blocks; births and rises at the bottom; the scope sets the floor (company 58, land 30, district 0) | `LM.feedEvents` |
| LM-F-3 | The feed head sums the window (new, moved on, lit, stuck, decided); filters All, Decisions, Lit, Stuck, New | Still `lucid-sky` |
| LM-F-4 | A feed card flies to its subject and opens it; hovering a card highlights its building | Click a card |
| LM-F-5 | During playback important events appear as cards anchored where they happened, open (320 ms), hold (2.3 s) and fold into their anchor (650 ms); at most three live; the importance floor rises with speed | Stills `example-play-*`, `lucid-play` |
| LM-F-6 | The feed folds away (chip, `F`, `feed=0`) and on the phone is a sheet from the bottom | Stills `lucid-phone-feed` |
| LM-F-7 | Playback from the start lets the camera follow the young city (auto-fit) until the person moves it | Still `example-play-2` |

### 2.17 The views (LM-V)

| ID | Requirement | Acceptance |
|---|---|---|
| LM-V-1 | A building opens into the product view of `docs/13` §6 in the v0.2 layout: product large (expected against actual under a split at the done share), goal, done rule, context chips, criteria ring with named segments, the talk, the roads, actions; a done building opens on what it changed | Stills `lucid-product-view`, `lucid-product-view-rising` |
| LM-V-2 | A land or district opens into the place view: landmark large in its ring, subject, counts, how the coast grew, districts with rings, who is here, what is stuck, decisions standing in it, actions | Still `lucid-land-view` |
| LM-V-3 | A flag opens into the decision view: what grew from it with each building's state; trace, play from here, ask | Still `lucid-flag-view` |
| LM-V-4 | The grammar sheet draws its samples with the renderer; elements, depths, lenses, layers, badges, actions | Still `lucid-legend-sheet` |
| LM-V-5 | The lab: three themes, two contrasts, motion, dataset; all URL state | Stills `lucid-sky-glass`, `lucid-aqua`, `lucid-hc` |

### 2.18 The three levels and the tile (LM-I)

Rewritten in T36 and T37: three levels, the information overlaid on the territories, the tile as the hexagon.

| ID | Requirement |
|---|---|
| LM-I-1 | **Land**: the company as territories on the v0.2 look; each land grows into the sea around it until it has room, and carries its summary typeset into the map inside its own coast (landmark and name, the bar by state or the laid layer's value drawn into the terrain, the share and counts, the open asks as pennants, the attention as map symbols with counts, the crew, the latest pictures) in the tier its room allows; a name shrinks before it is cut; a label that would land on another is dropped; a place less than sixty percent in view shows only its name. Nothing is an HTML overlay at this level. |
| LM-I-2 | **Area**: the districts of the land under the camera as distinct territories, each carrying its summary inside its territory in the tier its room allows; the land's name along its north coast and its share line in the panel header; clicking a place scales it to fill the view. |
| LM-I-3 | **Task**: the tasks of the area as hexagonal tiles with the information inside the shape (glyph, state, the one number, badge, the full title wrapping, who and since, criteria; closer, subtasks, links, cost); the map tilts into isometric on the way in and each tile is a prism whose fill is its progress, or the laid layer's value in the layer's colour. |
| LM-I-4 | Every attention chip leads to what it counts: the panel scoped to the place with that filter, the place in view, the counted things flagged. |
| LM-I-6 | **Moving**: the map pans, zooms and flies smoothly; state is computed per moment, not per frame; the glass stops blurring while the map moves; a drag can start anywhere and never becomes a click. **Context**: clicking anything renders it into the panel on the right: a place with every decision, stuck task and review written out, its areas and crew; a task, an ask, a decision with their views; *Now* returns to the attention list. |
| LM-I-5 | **Pictures**: every task has an artifact kind and subject; its picture is drawn from them and its state (ghost, barred, sealed); the setting Pictures · Off / On the tile / As the tile applies at every level (thumbnail beside the title and the latest pictures on a territory; or the hexagon as the picture with the data on scrims and the layer's fill over it, and every plot's picture at the land and area levels). |
| LM-I-5 | Hover reads a tile in full in a fixed order; click opens the management view; a territory click flies in. |
| LM-I-6 | Zoom buttons step through the levels (the place under the camera fills the view); keys `+` `−` `0`; the wheel and a pinch move continuously; the level is named; the tilt animates. |
| LM-I-7 | The lab keeps "stays flat" for the task level (T-O14). |
| LM-I-8 | Decided decisions gather on the square as one plaque with a count; a flag stands only for an open ask or the owner's recent decision. |
| LM-I-9 | Every level carries a summary of the level below; zooming expands the detail of the place under the camera, never the whole scene. |

### 2.19 The Now view (LM-N)

| ID | Requirement |
|---|---|
| LM-N-1 | The default is Now: the playhead at the present, the timeline closed, the panel listing what needs attention in the place under the camera, grouped (needs a decision, stuck, nothing moved, waiting in review, landmarks, policies, decided, new, done since last looked). |
| LM-N-2 | Rows fly to and open their subject; rows can be dismissed and restored (per person); filters narrow by kind and show counts; scope toggles between here and everywhere. |
| LM-N-3 | The past is quiet: tasks done before the review window dim and desaturate (a lab and platform setting). |
| LM-N-4 | Opening the timeline and moving into the past turns the panel into the feed of the window; a Now pill returns. |
| LM-N-5 | The owner's open asks are flagged on their tiles and counted per land at the sky. |

### 2.20 Projects (LM-J)

| ID | Requirement |
|---|---|
| LM-J-1 | A project divides into tasks, a task into subtasks; a task can belong to several projects; a project can be opened by a decision. |
| LM-J-2 | The project view without the map: done share by size, tasks, open, blocked, to decide, health; the asks that wait on it; a Gantt of every task's life; tasks by state; projects it shares tasks with; dependencies that reach outside it. |
| LM-J-3 | With the map: *Show on the map* keeps the project's tasks in full, dims the rest and draws its thread in birth order; *Play from its start* plays its history. |
| LM-J-4 | The projects list from the dock, sorted by what needs attention, each with a ring, counts and a strip of its tasks' states. |
| LM-J-5 | Subtasks live where their parent lives and move with it; a parent's progress is the model's, not a roll-up, until the product has real criteria. |

### 2.21 A task over time (LM-M)

| ID | Requirement |
|---|---|
| LM-M-1 | A task's moments: born, every status change, every move, the decision that opened it, its subtasks' births and completions, its asks; shown as a strip coloured by status with ticks; each tick sets the map to that moment. |
| LM-M-2 | With a task selected and the rail open, the rail shows that task's life and the step buttons walk its moments. |

## 3. How things move over time: the motion table

| Event | Motion | Minimum visible duration | Sound of it in the ledger |
|---|---|---|---|
| Item created | Plot claimed, footprint fades in | 400 ms | "Dispatcher sequencing: new in Private beta" |
| Work starts | Walls rise to the current remaining-work height | 600 ms | "rising" |
| Progress | Walls rise further; light fills from the ground | continuous | — |
| Review | Scaffold light on the top floor, cool | 400 ms | "in review" |
| Done | Facade fitted, windows lit, settles | 800 ms | "lit" |
| Blocked | Goes dark; inflow pipe shows the clog | 600 ms | "blocked at Railway token" |
| Unblocked | Clog clears with a pulse of flow | 600 ms | "flowing again" |
| Dropped | Becomes a park | 600 ms | "set aside" |
| Decision taken | Monument placed with lineage lines drawn outward | 800 ms | "Decided: Railway-first" |
| Dependency declared | Pipe laid from upstream to downstream | 500 ms | — |
| Milestone met | Landmark rises, light sweep across the land | 1,200 ms | "Private beta live" |
| Person joins | Light appears; in the people lens a plot | 400 ms | "Dana joined Support" |
| Secession | Fork, then the walk across the causeway | 1,500 ms | "Europe is its own land" |
| Stillness | Haze thickens, lights dim | gradual | — |
| Lens switch | Buildings walk to their new plots; hulls crossfade | 800 ms | "Seen by product" |
| Overlay laid | Channel fades in | 400 ms | "Cost: warm where money burns" |
| Fly-to | Camera eases along a curve | 600–900 ms | — |

Outside playback only live flow, slow weather drift and the breath of buildings being built now move (concept §12).

## 4. Algorithms

- **Claiming** (LM-G-2): candidates = empty neighbours of the district's plots (or the land's, or the seed). Score = d(candidate, district centroid) + 0.3·d(candidate, land centroid) + 0.8·noise(candidate, seed) where noise is a hash of the coordinates and the land's seed, in [0, 1). Lowest score wins; tie by coordinate order.
- **Seeding** (LM-G-3): the k-th land is placed at angle k·137.5° and radius spacing·√k from the world centre, nudged to the nearest empty plot not within spacing/2 of any claimed plot.
- **Hulls**: the boundary edges of a plot set (edges whose neighbour is not in the set), chained into rings, drawn with rounded corners at the hex radius; cached per (lens, claim count).
- **Labels**: a land's label at its centroid when the hull is ≥ 160 px wide; a district's at its square when ≥ 90 px; a building's when its hex is ≥ 48 px; collisions resolved by priority (focal subject, needs-you, then size).
- **Pipes**: cubic curves between plot centres, bowed away from the shorter land axis; aggregated per land pair below scale 0.5.
- **Weather**: per district a severity in [0, 1] from issues and staleness; drawn as 2–4 soft discs with slow Perlin drift; never over the focal subject.
- **Playback**: a time cursor advancing at speed; each event's motion is a tween from its time with the minimum duration; the renderer draws the max of (log state at t, tween state).
- **Forecast ghost**: per item a forecast done date from the company's forecaster (`docs/02` §6); beyond now, height and light follow it in outline.

## 5. Acceptance

- Playing Lucid Chat's real eleven days (`docs/04-mocks/living-map/`, dataset "Lucid Chat") from the first commit to now reads as a city growing, with the contracts sprint, the foundations, the alpha and the beta visibly succeeding one another, and the stuck Railway token chore visible as a clog.
- Playing the generated three-year company shows departments forming, products appearing, Lucid Total seceding from Engineering, a crisis storm and its clearing, and revenue arriving as harvest.
- Switching lenses at any time keeps every building identifiable through the walk.
- Every overlay recolours and never adds a mark; the legend chip names its encoding.
- Zooming from sky to a building and opening it is one continuous motion; the building's cutaway shows rooms, crew, pipes, wall chart and monument.
- Tracing a decision dims the world to its lineage and "play from here" works.
- The attention validator (`docs/09` §3) passes every paused state; playback is exempt.
- Phone, high contrast, reduced motion and RTL passes per `docs/09`.

## 6. Phases

| Phase | Deliverable | Gate |
|---|---|---|
| 0 | The simulations (`docs/04-mocks/living-map-2/` as the reference; `living-map/` kept as the first pass) ; `packages/scene` world layout: plots, claiming, hulls, time derivation; the Departments lens; Progress and Pipes overlays; Z0–Z2 | The real Lucid Chat log grows the same world as the simulation |
| 1 | Lenses (Projects, Products, People) with the walk; the layers of §2.5; the task (with moments), ask, project, place and decision views; the Now panel; the since layer; the feed and the in-place cards; the rail and playback; tracing; projects and policies | Acceptance §5 items 1–6 on real data; LM-H, LM-Y, LM-S, LM-F, LM-V, LM-I, LM-N, LM-J, LM-M |
| 2 | Secession Forks; Refocus on the map; forecast ghost and Futures; Revenue, Load, AI, Risk; phone; accessibility; the mechanism library with oversight | Full §5; attention validator in CI |
| 3 | Customers and Money lenses; generated landmark art; company-scale tuning at 20,000 buildings | LM-R-1 at scale |

## 7. Metrics

- Time to answer "what is stuck" from the sky view (target: under 5 s, no reading).
- Share of weekly meetings run from the difference view.
- Attention budget violations per paused state (target: 0).
- Frame time at the sky view and at Z2 (LM-R-1).
- Lens switches and overlays laid by the AI versus by hand (the AI should do most).

## 8. Risks

- **Occlusion and label collision** in extruded views: mitigated by shallow extrusion, back-to-front drawing and the label priority rule; terrain is an overlay, not the default.
- **Growth that looks wrong** (a land boxed in, an enclave): mitigated by spacing by company scale and the frontier rule; the simulation is the test bed.
- **Playback as spectacle** that breaks the calm: playback is explicit, speeds are few, the ledger is three lines, and the paused state passes the validator.
- **Money visibility**: by role from day one (T-O12).
