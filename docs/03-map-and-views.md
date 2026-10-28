# Lucid Total — The Map and the Views (interaction design)

> How the company is seen and navigated. Companion to `docs/02-product-plan.md` §5–§6; realised in `docs/04-mocks/`. Written 2026-10-28 from the owner's brief: "I imagine it as zooming in and out of a map view… something you can dive deeper and zoom in, and also zoom out… a natural arrangement, not necessarily just cards that become more cards, but more like a map… coherent and easy to understand at a glance… modified via the perspective of the person or persons viewing… a new and innovative interface… take inspiration from mapping tools and data presentation mechanisms… map something into a semi-physical space where the underlying surface is dynamic and overlaps with other areas… but also coherent, clear and easy to use."

---

## 1. What the map is for

The map answers, at every zoom level and for every viewer, five questions in one glance: **what exists** (structure), **what is moving** (activity), **what is stuck** (blocks and waiting), **what needs me** (decisions, feedback, chores), **how it connects** (dependencies and overlaps). Everything else (editing, detail, history) happens in the views the map opens into: board, list, item page, chat.

Design stance: the map is a **semantic map**, not a geographic metaphor pushed to the end. It borrows from maps what helps orientation (continuous zoom, regions with borders, roads, labels that appear with zoom, a "you are here", layers you can switch on), and from data visualisation what shows state (treemap area for size, heat for activity, glyphs for meaning, ghosts for what-if). It never requires the viewer to learn a geography: regions are the company's own domains and programs, and their arrangement is stable for a given viewer.

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

1. **Regions are domains** (the company's configured domains; Lucid's default set in `docs/02` §2.1: Product, Engineering, Design, Marketing, Sales and partnerships, Customer support and success, Finance, Legal and compliance, People, Operations, Leadership; a domain without items at a stage is drawn small or folded into its neighbour). At company zoom they are large, soft-edged cells on the ground; their **area** is proportional to a measure the viewer chooses (default: open work weighted by estimate; alternatives: people, spend, items needing decisions). Their **position is stable** per viewer (laid out once by a force layout, then pinned; moved only by the viewer or when a domain is added).
2. **Areas inside regions are groupings** (programs, projects, epics, releases, campaigns), nested as cells within cells; an area has size (work), **heat** (recent activity; glass glows warmer where things moved in the last day), **weather** (risks drawn as a translucent front over the area), and **flags** (decisions waiting, blocked, overdue) as meaning glyphs on the area's label.
3. **Overlaps**: a grouping that spans domains (the "Europe launch" program across Compliance, Marketing and Engineering) is **one shape**: a soft hull that crosses the region borders. Inside each region the hull holds that region's part of the program; at the border the hull shows a **continues** chevron and the count of items on the other side. Hovering or tapping the hull highlights the whole program in every region it touches. Items that belong to several groupings are drawn once, in their home domain, with **membership rings** (thin coloured rings in the other groupings' hues) and listed in each grouping's panel.
4. **Items are activity**: at domain zoom, items are clustered into markers with counts by state (a stacked pill: doing · review · blocked · waiting on a person); at epic zoom they become cards in a compact arrangement (the board's cards, laid out by state along the cell's axis: left to right from proposed to done in LTR, mirrored in RTL); at item zoom the card expands into the item page.
5. **Goals are the horizon**: a band along the top (or bottom on the phone) with the objectives, each with its done share and forecast; selecting a goal lights the areas that contribute to it and dims the rest.
6. **Dependencies are roads**: lines between areas or items, drawn only on the dependency layer, at epic zoom and deeper, or when an item is selected; the critical path to a milestone is the thick road; a blocked dependency is a road with a barrier glyph.
7. **People and agents are presence**: avatars at the areas where they are working now (from working lines), with a status ring (doing · waiting · stuck). A person's own avatar is always findable (recentre on me).
8. **Decisions waiting are flags**: a flag glyph at the area or item; the owner's material decisions are larger flags at company zoom.
9. **Parties are embassies at the border.** Externals (contractors, board, accounting, legal, suppliers, partners) are drawn as small markers along the company's outer edge, next to the region they engage with, sized by engagement and coloured by state (active · waiting on us · waiting on them · overdue); a road from an embassy into a region is an open ask or deliverable across the boundary. Tapping opens the party page. A party sees none of this: their external view has no map, only their compartment.
10. **The default zoom follows the company stage** (`docs/02` §2.8): founders open at Z1–Z2 of the current wave; a growing company opens at Z0. The viewer can always change it; the stage changes the default.
11. **Time is a layer**, not the axis: switch to the **timeline layer** and the same areas slide onto a time axis (roadmap); switch back and they return to the terrain. What-if deltas render as **ghosts** (dashed outlines where things would go, arrows from current to proposed) in both.

## 4. Zoom levels (semantic zoom)

| Level | What is drawn | Labels and glyphs | Interactions |
|---|---|---|---|
| **Z0 Company** | Regions with area by measure, heat, weather; goals horizon; material flags; presence of people as small avatars at region edges | Region names, one roll-up line each (done share · doing · blocked · decisions), top flags | Tap a region → Z1; tap a goal → highlight; tap a flag → the decision in a side panel; layers menu; perspective chip; search |
| **Z1 Domain** | The domain's groupings as cells, with overlaps continuing into neighbour regions (shown as cut-off hulls at the edge with "continues" chevrons); clusters of items by state; presence | Grouping names with micro-stats (done share sparkline, due date, lead avatar); cluster pills with counts | Tap a grouping → Z2; drag a grouping to re-pin (viewer's layout); tap a cluster → the list filtered to it |
| **Z2 Grouping (program / epic)** | Items as compact cards laid out by state; dependencies as roads within and out of the grouping; risks as weather; sub-groupings as cells | Card: kind glyph, id, title, assignee, priority glyph, confidence glyph; roads with barrier glyphs | Drag a card between states (rights permitting); tap → Z3; long-press → actions; toggle line view (cards become rows in the cell) |
| **Z3 Item** | The item page opens as a large panel over the map (the map stays visible, dimmed, around it); the item's neighbourhood (parents, blockers, dependents) drawn as a small graph in the panel | Full fields; Expected vs Actual; comments; evidence | Edit; comment; apply; ask the assistant; follow a road to a related item (the map pans) |
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

The map on the phone is for orientation and quick action, not dense work:

- **Z0 and Z1** render with large cells and no roads; labels are short; cluster pills are tappable; the goals horizon becomes a top carousel.
- **Pinch and pan** work; double-tap zooms; the breadcrumb is a back chip; the minimap is hidden.
- **Z2** switches to the **line view** inside the cell (rows by state), with a card toggle; **Z3** opens the item page full-screen with the map behind it in the stack.
- **The inbox is the phone's default home** (open question 4 in `docs/02`); the map is one tap away in the bottom pill navigation (Inbox · Map · My work · Chat · More).
- All actions available by long-press and from the assistant; voice input in the chat.

## 9. Accessibility and RTL

- Every cell, cluster, flag and road is a focusable element with a spoken name ("Engineering, 48 items, 6 blocked, 2 decisions waiting") and a keyboard action; the map has a **list equivalent** (the same hierarchy as a tree) one toggle away, used by screen readers and by anyone who prefers it.
- Colour is never the only signal: state uses glyphs and shapes (barrier for blocked, flag for decision, clock for due, cloud for risk); heat is accompanied by a "moved today" count in labels.
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

## 12. What the mocks must show (`docs/04-mocks/`)

Z0 company (the owner zoomed out to Z0; at the `founders` stage the default home is Z1–Z2 of the current wave, §3.10) with goals horizon, flags, heat, presence, embassies at the border; Z1 Engineering and Z1 Marketing (the same company, two perspectives, the Europe program crossing both); Z2 an epic with cards by state and roads, plus its line view; Z3 an item page with Expected vs Actual; what-if ghosts for "Europe first"; meeting perspective; the timeline layer; the phone map at Z0/Z1 and the phone line view; RTL variant of Z1; high-contrast variant of Z0; the list equivalent (tree) of the map; the ask card with routing; the external view; the virtual party page; the company stage settings card.
