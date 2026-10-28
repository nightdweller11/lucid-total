# Lucid Total — The Map and the Views (interaction design)

> How the company is seen and navigated. Companion to `docs/02-product-plan.md` §5–§6; realised in `docs/04-mocks/`. Written 2026-10-28 from the owner's brief: "I imagine it as zooming in and out of a map view… something you can dive deeper and zoom in, and also zoom out… a natural arrangement, not necessarily just cards that become more cards, but more like a map… coherent and easy to understand at a glance… modified via the perspective of the person or persons viewing… a new and innovative interface… take inspiration from mapping tools and data presentation mechanisms… map something into a semi-physical space where the underlying surface is dynamic and overlaps with other areas… but also coherent, clear and easy to use."

---

> **Revised again 2026-10-28 (T33).** The world is now defined by `docs/16-living-map.md` (concept) and `docs/17-living-map-product-plan.md` (plan): a world that grows from the event log, playable in time, with lenses and overlays; §3–§6 below are superseded where they differ. The simulation is `docs/04-mocks/living-map/`.
>
> **Revised 2026-10-28 (T25).** `docs/13-experience.md` is the binding doctrine for the whole interface; this document is its detail for the world. Where the two differ, `docs/13` wins. The v0.1 stance of "a web management system with a map inside it" is withdrawn: the world is a map at every depth, places have identity, items are buildings whose facades show the product, and the board is an instrument, never the map's deepest level.

## 1. What the map is for

The world answers, at every depth and for every viewer, five questions in one glance: **what exists** (places), **what is moving** (heat and light), **what is stuck** (barriers and haze), **what needs me** (flags, and the Horizon above the world), **how it connects** (roads and overlaps). It does this within the attention budget (`docs/13` §3): few labels, no counts unless they change what you do, alarms only for failing states. Everything else (editing, detail, history) happens in the product view, the Fork, the Table and the instruments the world opens into.

Design stance: a **semantic map that feels like a map**. Places have names, subjects and landmarks you recognise before reading; zooming reveals the sub-map that was faintly there; finished products stay visible as landmarks; the terrain is honest (every measure inspectable from the legend chip). It never requires learning a geography: regions are the company's own domains and programs, their arrangement stable for a given viewer.

## 2. Inspirations and what we take from each

| Source | What we take | What we leave |
|---|---|---|
| **Web maps (Google/Apple Maps, Mapbox)** | Continuous zoom with semantic zoom (labels and detail appear by level), pan, pinch, "you are here", recentre button, layers toggle, routes between places (dependencies as roads), clustering of many small things into one marker with a count. | Real geography, projection, street-level realism. |
| **Treemaps / Voronoi treemaps** | Area proportional to a measure (size of work, remaining effort), nesting (domain → program → epic), stable layout between refreshes (so places stay where they were). | Rectangles only: we use soft, rounded organic cells (Voronoi-like) so overlaps and borders read as terrain, in the Lucid Glass language. |
| **Venn / Euler diagrams and set visualisation (e.g. Bubble Sets, LineSets)** | Overlapping groupings drawn as one shape across regions, with a soft hull; membership in several sets shown by the hull passing through each region. | Full set algebra; more than three-way overlaps are summarised as a chip, not drawn. |
| **Zoomable user interfaces (Prezi, Pad++)** | Zooming as the primary navigation; smooth transitions keep context; nothing teleports. | Free-form canvases that lose structure. |
| **Game minimaps and strategy-game overlays** | Heat and fog: activity glows, stale areas fade; flags for events needing attention; a minimap in the corner at deep zoom. | Decorative detail. |
| **Weather maps** | Risks as weather fronts over the areas they threaten; forecast ghosts for what-if. | Animation that distracts. |
| **Transit maps** | Dependencies as lines with stations (milestones), critical path as the thick line. | Full-scale network drawings at the company level (shown only when a layer is on or at deep zoom). |
| **Dashboards (sparklines, bullet graphs)** | Micro-charts on region labels (done share, burn, trend) when zoomed in. | Grids of charts as the home. |

## 3. The space: how the company becomes terrain

1. **Regions are places with identity** (`docs/13` §5.1): each has a name, a one-sentence subject, a glyph, a stable hue, a **landmark** illustration from the landmark library (proposed by the AI, changeable by a person), a stable position, and measures (area, light for progress, heat, weather, flags, presence). The company's configured domains are the top-level places ( Lucid's default set in `docs/02` §2.1: Product, Engineering, Design, Marketing, Sales and partnerships, Customer support and success, Finance, Legal and compliance, People, Operations, Leadership; a domain without items at a scale is drawn small or folded into its neighbour). At company zoom they are large, soft-edged cells on the ground; their **area** is proportional to a measure the viewer chooses (default: open work weighted by estimate; alternatives: people, spend, items needing decisions). Their **position is stable** per viewer (laid out once by a force layout, then pinned; moved only by the viewer or when a domain is added).
2. **Sub-maps inside places are groupings** (programs, projects, epics, releases, campaigns), each a place in its own right with its own identity, faintly visible inside the parent before zoom (soft inner contours) so that zooming **reveals** rather than replaces (`docs/13` §5.2); an area has size (work), **heat** (recent activity; glass glows warmer where things moved in the last day), **weather** (risks drawn as a translucent front over the area), and **flags** (decisions waiting, blocked, overdue) as meaning glyphs on the area's label.
3. **Overlaps**: a grouping that spans domains (the "Europe launch" program across Compliance, Marketing and Engineering) is **one shape**: a soft hull that crosses the region borders. Inside each region the hull holds that region's part of the program; at the border the hull shows a **continues** chevron and the count of items on the other side. Hovering or tapping the hull highlights the whole program in every region it touches. Items that belong to several groupings are drawn once, in their home domain, with **membership rings** (thin coloured rings in the other groupings' hues) and listed in each grouping's panel.
4. **Items are buildings** (`docs/13` §5.3): at domain depth a place shows its buildings as a skyline (a few facades of the products that changed recently, and a light that shows progress); at program depth the buildings stand in their streams (districts) with **facades** that show the product: the expected facade as a translucent ghost until built, the actual facade (mock, screenshot, chart, document cover, build badge, envelope glyph) when built, with a thin criteria ring; finished products stay as landmarks of the place; items without a product are small kind-glyph buildings that never crowd the facades. At building depth the product view opens over the world.
5. **Goals are the horizon**: a band along the top (or bottom on the phone) with the objectives, each with its done share and forecast; selecting a goal lights the areas that contribute to it and dims the rest.
6. **Dependencies are roads**: lines between areas or items, drawn only on the dependency layer, at epic zoom and deeper, or when an item is selected; the critical path to a milestone is the thick road; a blocked dependency is a road with a barrier glyph.
7. **People and agents are presence**: avatars at the areas where they are working now (from working lines), with a status ring (doing · waiting · stuck). A person's own avatar is always findable (recentre on me).
8. **Decisions waiting are flags**: a flag glyph at the area or item; the owner's material decisions are larger flags at company zoom.
9. **Parties are embassies at the border.** Externals (contractors, board, accounting, legal, suppliers, partners) are drawn as small markers along the company's outer edge, next to the region they engage with, sized by engagement and coloured by state (active · waiting on us · waiting on them · overdue); a road from an embassy into a region is an open ask or deliverable across the boundary. Tapping opens the party page. A party sees none of this: their external view has no map, only their compartment.
10. **The default zoom follows the company scale** (`docs/02` §2.8): founders open at Z1–Z2 of the current wave; a growing company opens at Z0. The viewer can always change it; the scale changes the default.
11. **Time is a layer**, not the axis: switch to the **timeline layer** and the same areas slide onto a time axis (roadmap); switch back and they return to the terrain. What-if deltas render as **ghosts** (dashed outlines where things would go, arrows from current to proposed) in both.

## 4. Zoom levels (semantic zoom)

| Level | What is drawn | Labels and glyphs | Interactions |
|---|---|---|---|
| **Z0 Company** | Places with landmarks, area by measure, light, heat, weather; sub-places faintly inside; the horizon of goals as rings; material flags; presence; embassies at the coast | Place names and landmarks; a progress ring per place; flags; no counts unless a flag carries one | Tap a region → Z1; tap a goal → highlight; tap a flag → the decision in a side panel; layers menu; perspective chip; search |
| **Z1 Domain** | The domain as a frame with its emblem in the corner; its programs as places with landmarks and rings; overlaps continuing into neighbours (cut-off hulls with "continues"); a skyline of recent facades per program; weather; presence; the aspect panel chosen by perspective | Place names, rings, a lead avatar; flags; one sentence on hover | Tap a grouping → Z2; drag a grouping to re-pin (viewer's layout); tap a cluster → the list filtered to it |
| **Z2 Grouping (program / epic)** | Streams as districts; buildings with facades (expected ghost / actual) and criteria rings; the critical road thick; barriers on blocked roads; weather; the stream's light for progress | Facade, kind glyph, a short title on hover or when large; flags and barriers as glyphs | Tap a building → the product view (Z3); long-press → actions; "as a board" or "as lines" opens the instrument over the world with a back |
| **Z3 Building (item)** | The product view opens over the world (the world stays visible, dimmed, around it): the product large, expected vs actual compared, goal and done rule in one line each, criteria ring, context strip, the talk, the roads, and implications first when done (`docs/13` §6) | Facades, ring segments, glyphs with labels on hover | Compare; apply a comment to the expectation; ask the assistant; follow a road (the world pans) |
| **Z4 Evidence** | A screenshot, report, test result or document opened in a viewer with its criteria links | Criterion status chips | Mark met / not met; annotate |

Transitions are continuous (zoom animates 200–240 ms, ease-out, no overshoot; reduced motion = crossfade). The **breadcrumb** (Company › Engineering › Private beta › Wave 71 › P1-C-03) sits under the header; the **minimap** appears at Z2 and deeper in a corner, showing where you are in the company.

## 5. Perspective: the map for the person looking

A **perspective** is a saved arrangement: which domains are central (large and centred), which are peripheral (small, at the edges), which collections are emphasised (their hulls drawn stronger), which measures size the regions, which layers are on, and a re-weighting of priority for the viewer's queue.

- **Role perspectives** come from templates: the CMO's perspective centres Marketing, emphasises campaigns and launches, draws the roads into Engineering releases and Compliance approvals; the CTO's centres Engineering; the owner's is balanced with the goals horizon and the material flags prominent; a compliance lead's centres Legal and Compliance with the market calendar as a layer.
- **Switching perspective** is a chip in the header ("Seeing as: Marketing"); anyone can look through any perspective their visibility allows ("show me the company the way the CTO sees it"); the AI switches it on request.
- **The same model**: no perspective hides or duplicates items; it changes arrangement, size and emphasis only. Company priority is one number; a perspective adds a *viewer rank* beside it.
- **Meeting perspective** (`docs/02` §7.8): a meeting's subject defines a temporary perspective shared by attendees: the subject's areas centred, open decisions and risks for it as flags, everything else dimmed; captured decisions appear as new flags turning into applied changes while the meeting runs.
- **Question perspective**: asking the assistant "what's stuck on Europe" re-centres the map on the matching items (temporary, with a "back" chip).

## 6. Layers

Toggle in a layers menu (persisted per perspective): **Activity heat**, **Presence** (people and agents), **Dependencies** (roads), **Risks** (weather), **Decisions** (flags), **Deadlines** (clock glyphs; items due within the viewer's window), **Budgets** (spend bars on regions), **Customers** (issues and incidents as markers), **What-if** (ghost deltas of the open draft), **Timeline** (switch the terrain to a time axis). Default on: heat, presence, decisions, deadlines.

## 7. Interactions

- **Navigate**: wheel/pinch to zoom, drag to pan, double-tap to zoom into a cell, breadcrumb and minimap to jump, `⌘K` command bar to go anywhere by name, recentre button (home perspective).
- **Act in place**: drag cards between states; drag an item onto a grouping to add membership (ring appears); long-press / right-click for the action menu (assign, prioritise, move, relate, decide, ask the AI); multi-select for bulk actions with a change-set preview.
- **Select to understand**: selecting an item or area dims the rest and lights its relations (both directions), its goals, its people; a side panel shows the roll-up or the item.
- **Ask**: the assistant panel is always one tap away; its answers can **point** (highlight areas and items on the map) and **move** (re-centre, switch perspective, open what-if).
- **What-if**: a draft chip in the header ("Draft: Europe first") turns on ghost rendering; the panel lists the change set; Apply / Save / Discard.
- **Keyboard**: arrows move between cells, Enter zooms in, Escape zooms out, `/` searches, `L` layers, `P` perspective, `W` what-if, numbers 0–4 jump to zoom levels; every action in the command bar.

## 8. Phone

The phone follows `docs/13` §10 and never shrinks the desktop world:

- **Home is the Horizon**: three cards with visuals, the goal rings, a strip of place tiles (landmark, ring, heat).
- **One place at a time, full-bleed**: landmark header, sub-place tiles with rings, a facade gallery of its buildings, its waits as a short list; tap goes down, the back gesture goes up; the breadcrumb is one chip.
- **The Fork** is one screen per decision with swipeable paths; **Refocus** is sliders with the transparency strip; **Talk** is hold-to-talk on the dock.
- The dock is Horizon · World · Me · Talk · More; instruments open as full-screen sheets with a back.
- Nothing on the phone shows more than one place or one decision at a time; queued writes under poor connectivity.

## 9. Accessibility and RTL

Heat carries no count on the terrain (`docs/13` §3); the spoken summary and the list equivalent state "moved today" in words for screen-reader users.

- Every cell, cluster, flag and road is a focusable element with a spoken name ("Engineering, 48 items, 6 blocked, 2 decisions waiting") and a keyboard action; the map has a **list equivalent** (the same hierarchy as a tree) one toggle away, used by screen readers and by anyone who prefers it.
- Colour is never the only signal: state uses glyphs and shapes (barrier for blocked, flag for decision, clock for due, cloud for risk); heat is accompanied by a "moved today" statement in the spoken summary, the list equivalent and the legend chip, not by a count on the terrain.
- RTL: the state axis inside cells runs right to left; chevrons, roads' arrowheads and the breadcrumb mirror; glyphs that are not directional do not.
- Reduced motion: no drift, crossfades instead of zoom animation, static heat.
- High contrast and reduce transparency: cells take the opaque fills from the Lucid tokens, borders become visible edges.

## 10. The other views, briefly (how they relate to the map)

- **Board** = Z2 of one grouping with the state axis as columns; **line view** = the same, as rows. The board is the working surface for a team; the map is the orientation surface for everyone.
- **List/table** = any filter, dense; opens from any cluster or search.
- **Timeline** = the timeline layer of the map, or a standalone view for a grouping.
- **Dependency graph** = the roads of a selection, as a graph view.
- **People / Agents live** = the presence layer, as a list with working lines.
- **Inbox** = the flags addressed to me, as a queue.
- **Item page** = Z3, standalone with the map hidden.
- **External view** = a party's compartment as a reduced application (Inbox · My items · Chat · their groupings), no map; **party page** = the company's view of a party (engagements, correspondence thread, linked items and asks, deadlines, materialise).
- **Asks** = cards in the responsible person's inbox and a per-domain asks list; on the map an ask across domains is a road from the asking region to the target region.
- **Chat** = a panel beside any view, or full-screen on the phone; it points and moves on the map.

## 11. Rendering and performance notes (for the architecture)

- SVG or Canvas with a layout computed server-side per perspective (stable, cached), delivered as a compact JSON scene; the client animates zoom and renders labels by level. Target: Z0 and Z1 interactive at 60 fps with a few hundred areas; clusters keep item counts in the thousands off-screen.
- Layout stability: positions pinned per viewer; new groupings placed by the force layout near their parent and then pinned; a "tidy" action re-lays out on request.
- Overlap hulls computed from the member areas' positions (a smoothed concave hull around the parts in each region, joined across borders); limited to three-way overlaps drawn, more summarised.
- Live updates: working lines, state changes and flags stream over the event channel and animate in place.

## 12. What the mocks must show (`docs/04-mocks/` v0.2)

Per `docs/13` §14 and the mocks brief in `docs/04-mocks/README.md`: the Horizon (desktop and phone); the company world with places that have landmarks, rings, light, heat, weather, flags, presence and embassies, with sub-places faintly inside; the zoom into a domain and into a program, showing the reveal; a program with streams and buildings whose facades show products (ghost and built); the product view with expected vs actual compared and, for a done item, the implications first; the Fork with drawn consequences and futures; Refocus with the live re-forecast and the transparency strip; the Table (meeting); two aspects and one infographic; Talk composing a scene; the System place with a repair in progress; the Trust map layer; the phone versions of the Horizon, a place, the Fork and Refocus; RTL and high-contrast variants; the list equivalent (tree). The instruments (board, list, timeline) appear once each, opened over the world with a back, to show they are tools and not the home.
