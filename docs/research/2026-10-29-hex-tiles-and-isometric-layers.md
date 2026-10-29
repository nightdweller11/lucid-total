# Hex tiles that carry information, and isometric views for layered data

Reference study for the company-map designer. Researched 2026-10-29. Every URL below was fetched and read that day. Where possible, facts come from primary sources: shipped UI files (Civ V and VI Lua/XML), vendor docs and wikis. *(play knowledge)* marks facts known from playing the games that no source here confirms. *Not verified* marks things a source was looked for but not found.

---

## A1. Civilization V / VI / VII tiles

**Yield icons in the hex (Civ V, from the game's `YieldIconManager`)**
- One sprite per yield type, 128 px. Each is a world-anchored image (`Scaling="True"`), so it scales with the camera instead of staying a fixed screen size.
- **The count is drawn into the glyph.** For 1–5, the sprite shows that many copies of the symbol. For 6 or more, a single symbol carries a numeral overlay (6–12, capped at 12).
- **Layout:** food, production, gold, science and faith sit in one row centred on the hex, overlapping by 40 px. Culture has its own slot 150 px above the row. With one type the icon is centred; with two to five they share the row.
- **Toggle:** the Y key or the minimap options "show tile yields" and "show resource icons". Hovering shows a tile's yields instantly.

**Civ VI**
- **Yield icons:** the atlas has 64 px icons from `ICON_YIELD_<TYPE>_1` to `_5`, the same count-in-glyph rule. There is no yield hotkey.
- **Tooltip timing:** the tooltip opens after a user-set delay (`PlotTooltipDelay`). The delay is halved on touch, and holding Shift shows the tooltip at once. It can be pinned instead of following the mouse.
- **Tooltip content** (`PlotToolTip.lua`, in order):
  - Title: the terrain.
  - Owner civ and city, feature, resource (red "Requires <tech>" if locked), river, movement cost, route, defence, Appeal word and value, continent.
  - After a `------` separator: wonder, district and its yields, improvement (pillaged), one "number + icon + name" line per yield, buildings, great works, "worked by N".
  - It is a single text column.
- **Borders** use the civ's jersey colour (a secondary colour if two civs clash). They are **dashed while open and solid once closed** (after the Early Empire civic). Dashed means "open", not "claimed".
- **Resources and improvements:** resources show as an icon in a disc; improvements and districts are 3D models. Clicking a unit selects it (unit panel at bottom left); clicking a city banner opens the city panel; clicking bare terrain only deselects. *(play knowledge)*
- **City panel** (`CityPanel.xml`): slides out at the bottom right.
  - City-name banner with previous/next city.
  - Row of six yields; each has a number and a focus/ignore check.
  - Rows for growth (turns and a bar), housing (now/max), amenities, religion and breakdown.
  - Current production with a turns bar.
  - Buttons: Purchase Tile, Manage Citizens, Change Production, buy with gold, buy with faith.
  - The overview tabs show growth arithmetic, buildings, wonders, trading posts and religion.

**Civ VII (2025)**
- **Lenses are now lists of layers** (`default-lens.js`). Yields and the hex grid are toggles in the Lenses panel, and players complain they reset each launch.
- **Lens set:** Settler, Continent, and Trade (added 25 Mar 2025). Appeal, Tourism and Loyalty were dropped.
- **Update 1.1.0** (4 Mar 2025):
  - The tooltip gained building icons with their status, and wonder icons with their effect.
  - Resource icons are larger on improved tiles and smaller on unimproved ones.
- **Update 1.2.5** (30 Sep 2025), building placement:
  - On hover, the left panel summarises the change in yields and tile type; an expanded view itemises before, after and delta.
  - Adjacency arrows show which yield you gain and from where.
  - Green and red up/down arrows show gains and losses.
  - Green numbers mark the tiles with the highest yield. Firaxis calls these "data, not recommendations".
  - Urban tiles show current and maximum capacity.

References:
- https://raw.githubusercontent.com/Keith7287/Bob-s-Mod/HEAD/Assets/UI/InGame/YieldIconManager.xml — Civ V: sprite size, row with −40 px overlap, culture slot.
- https://raw.githubusercontent.com/Keith7287/Bob-s-Mod/HEAD/Assets/DLC/Expansion2/UI/InGame/YieldIconManager.lua — Civ V: glyph per count, numeral for 6+.
- https://github.com/chaorace/Civ6-UIFiles/blob/master/ToolTips/PlotToolTip.lua — Civ VI tooltip order and delay.
- https://github.com/chaorace/Civ6-UIFiles/blob/master/Panels/CityPanel.xml — Civ VI city panel controls.
- https://civilization.fandom.com/wiki/Borders_(Civ6) — dashed vs solid borders, jersey colours.
- https://civilization.2k.com/civ-vii/from-the-devs/developing-settlements/ — Firaxis on the Civ VII placement UI.
- https://civilization.fandom.com/wiki/1.1.0_Update_(Civ7) — patch notes: tooltip and resource-icon changes.
- https://steamcommunity.com/app/289070/discussions/0/340412122401511004 — Civ VI's delayed tooltip vs Civ V's instant yields (2016).

*Not verified:* whether yield icons simplify or fade at far zoom. The only documented behaviour is that Civ V icons scale with the camera.

## A2. Civ VI lenses

- **Lens set:** ten manual lenses, one active at a time, opened from the Lenses button above the minimap. Hotkeys: Religion 1, Continent 2, Appeal 3, Settler 4, Government 5, Political 6, Tourism 7, Loyalty 8, Empire 9, Power 0.
- **Automatic placement lens:** opens when placing a district or wonder and shows the city's territory and the valid spots, owned or not.
- **Settler lens:**
  - Red: cannot settle.
  - Dark green: fresh water, +3 housing.
  - Light green: coast, +1 housing.
  - Grey: no housing bonus.
  - Icons over the wash: loyalty-pressure numbers, flood-wave levels 1–3, volcano and floodplain markers.
- **Appeal lens:**
  - Dark green: Breathtaking (4 or more).
  - Light green: Charming (2 to 3).
  - Grey: Average (−1 to 1).
  - Orange: Uninviting (−3 to −2).
  - Red: Disgusting (−4 or less).
- **Religion and Loyalty lenses:** territory washed in the majority religion's colour, or left blank if there is none. Arrows in the source's colour show pressure, and thicker means stronger. A green/red bar under the city banner shows loyalty.
- **Lens frame** (`ModalLensPanel.xml`, 2016 build):
  - A header bar across the top with the lens name and a close button.
  - Black gradients darken the screen edges: 20 px at the sides, 150 px at the bottom.
  - A **Key** panel at the top left, 195 px wide. Each entry has a **32×36 hex-shaped swatch**, a 14 px label wrapped at 130 px, and an optional bonus line (16 px icon + "+3").
  - The key is at the top left in this build, not the bottom; check it in-game.
- **Tiles a lens doesn't cover** get no wash. *Not verified:* whether terrain is also desaturated.

References:
- https://civilization.fandom.com/wiki/Lens_(Civ6) — all lenses, colour codes and hotkeys.
- https://civilization.fandom.com/wiki/Appeal_(Civ6) — Appeal levels and their effects.
- https://github.com/chaorace/Civ6-UIFiles/blob/master/Panels/ModalLensPanel.xml — lens header, edge darkening, hex-swatch key.

## A3. Hexes outside Civ

**Datadog Host Map**
- **Hexes:** one per host. Fill by a metric (default CPU, green at 0% to orange at 100%). Size by an optional second metric.
- **Grouping:** group by tags, nested (zone, then instance type). Each group label shows a count ("565 hosts"). Filter with AND/OR/NOT and wildcards.
- **Legend:** bottom right; its gear opens the palette. You can set the palette, reverse it, and clamp min/max. Rules can override colours past a threshold.
- **Hover:** shows the value ("88% average CPU").
- **Click:** zooms to the host and opens a panel with up to six integrations; each one opens a condensed dashboard.
- **2026 version:** pods nest inside hosts, and the child layer has its own fill.

**Grafana Polystat** (v2.1.16, Jan 2026)
- **Shapes:** one polygon per metric: pointed-top hexagon, circle or square. Polygons are auto-sized to the panel with a 2 px border.
- **Labels:** name and value in the largest font that fits *in all polygons*. If the text can't fit, labels are hidden and only the tooltip shows it.
- **Colour:** threshold ranges (ok/warning/critical). Threshold colours win over value-mapping colours.
- **Composites:** show the **worst state** of their members and cycle through each member's value. A "Triggered" mode hides healthy items.
- **Tooltip:** sortable by name, threshold level or value. It can list only triggered items and show a timestamp.
- **Click:** a drill-down URL with template variables. The docs advise against opening a new tab for drill-down.
- **Status:** the Hexmap plugin was deprecated in 2022 in favour of Polystat.

**Zabbix Honeycomb**
- **Labels:** a primary and a secondary label per cell, each fixed text or the live value.
- **Colour:** set by thresholds, which can be blended into a gradient.
- **Size limits:** minimum 32 px per cell. When cells overflow, the last one becomes an ellipsis cell; labels that don't fit are truncated.
- **Interaction:** hovering enlarges the cell; clicking highlights its border.

**Azure Workbooks honeycomb**
- **Grouping:** cells form clusters by a field.
- **Node slots:** top, left, centre, right and bottom. Each slot can be text, a big number, a sparkline or an icon.
- **Colouring:** categorical, heatmap (with min/max), thresholds, or a colour taken from a field.

**Games**
- **Hexcells:** the number in a hex counts its blue neighbours. `{n}` means they are contiguous, `-n-` means they are not. Totals sit at the ends of rows and diagonals. Only two colours are used.
- **Dorfromantik:** quest tiles show a target ("10+" or an exact count). Hovering a flag quest highlights the open edges.
- **Catan:** each hex has a number disc. Dots (1–5) show how often the number is rolled, and 6 and 8 are red.
- *Not verified:* Before We Leave, Terra Nil, Islanders, Polytopia, and vendor-native NetApp/VMware honeycomb views.

References:
- https://docs.datadoghq.com/infrastructure/hostmap/ — fill, size, group, filter, hierarchy.
- https://www.datadoghq.com/blog/host-maps-part-2-quick-guide/ — legend, click-to-zoom, host panel (2015).
- https://github.com/grafana/grafana-polystat-panel/blob/main/docs/Polystat-docs-composites.md — worst-state rollup, with tooltip screenshots.
- https://github.com/grafana/grafana-polystat-panel/blob/main/docs/Polystat-docs-options.md — layout, font scaling, tooltips.
- https://www.zabbix.com/documentation/current/en/manual/web_interface/frontend_sections/dashboards/widgets/honeycomb — Zabbix Honeycomb widget.
- https://learn.microsoft.com/en-us/azure/azure-monitor/visualize/workbooks-honey-comb — five-slot node format (Apr 2026).
- https://dorfromantik.fandom.com/wiki/Quests — quest numbers and flag hover.

---

## B4. Isometric management games: how they show layers

- **SimCity 2000** replaced the overhead view with a dimetric one (2:1 pixel ratio, about 26.6°; true isometric is 30°). It also added an **underground view** for pipes and subways.
- **SimCity 4:** the underground view hides the surface. Watered tiles show blue; unwatered tiles show brown or orange.
- **SimCity (2013):** each tool opens its own data maps; Water, for example, shows the water table, pollution, germs and health. Service coverage is drawn as green-to-red hues along roads, and a building's coverage area appears when you click it.
- **Cities: Skylines:** 36 or more info views. Each one tints only its subject:
  - Electricity: connected buildings in blue.
  - Happiness: buildings on a red-to-green scale.
  - Garbage: roads green where coverage is enough.
  - Education: grey roads where there is none.
  - Some views add a red/yellow/green meter. The rest of the city is drawn flat and neutral. *(play knowledge)*
- **Two Point Hospital:** 12 visualisation modes.
  - Attractiveness: green (good) or brown (bad) radii around objects.
  - Health: patients shade from green through yellow and orange to red.
  - Patient or staff happiness: the group not being viewed is drawn white.
  - Temperature: blue (cold), yellow (temperate), red (hot). Machines show purple and turn red as they fail.
- **Prison Architect:**
  - Deployment overlay: patrols are drawn on the grid in blue or magenta so two can overlap. A stationed guard has a blue line to his marker, and empty markers are grey. An insecure room flashes yellow and black stripes. Security zones are coloured by level.
  - Logistics map views: laundry and food links (drag lines from the source room to its consumers) and prison labour (worker icons glow orange).
  - A temperature gradient view.
- *Not verified:* Theme Hospital and Anno overlays.

References:
- https://en.wikipedia.org/wiki/Isometric_video_game_graphics — dimetric vs true isometric angles.
- https://simcity.fandom.com/wiki/Water — SimCity 4 underground view colours.
- https://simcity.fandom.com/wiki/Interface_(SimCity_(2013)) — data maps per tool.
- https://skylines.paradoxwikis.com/Info_views — every info view and its colours.
- https://twopointhospital.fandom.com/wiki/Visualisation_Modes — all 12 modes.
- https://prison-architect.fandom.com/wiki/Deployment — patrols, stations, insecure stripes.
- https://prison-architect.fandom.com/wiki/Logistics — logistics map views.

## B5. Exploded and isometric layer diagrams

- **Geometry:** the axes are 120° apart, with edges at 30° from horizontal.
- **Exploded-view method** (Tuts+):
  - Leader lines run only along 30°, 90° or 150°.
  - Spacing between parts is counted in grid squares.
  - Guide lines sit on their own layer, dashed, or red when the drawing is in colour.
  - Parts get white fills, and each group gets a heavier outline.
- **deck.gl HexagonLayer:**
  - Colour and **elevation** are separate aggregations, with the default colour range a 6-class yellow-orange-red palette.
  - Extruded hexes are lit.
  - `coverage < 1` leaves gaps between hexes.
  - Percentile cut-offs hide outliers.
  - Hover returns the colour value, elevation value and count.
- **Cloudcraft (Datadog):** a toggle switches between a top-down view and isometric. Only one overlay shows at a time (infrastructure, observability, security, cost, APM). "Find" highlights an item and zooms to it.
- **What makes stacked translucent planes readable** (synthesis):
  - The same offset between every plane.
  - One light source; top faces lightest.
  - Translucent fills with opaque edges.
  - One saturated hue per plane.
  - Labels outside the stack, joined to their plane by leader lines along the iso axes.
  - The active plane at full opacity, the others faded.
- *Not verified:* NYT and Economist isometric explainers (nytimes.com could not be fetched), and Apple and Google Maps 3D tilt.

References:
- https://en.wikipedia.org/wiki/Exploded-view_drawing — definition and examples.
- https://design.tutsplus.com/tutorials/how-to-create-exploded-isometrics--vector-1523 — exploded isometric method (2009; the page body is in German).
- https://deck.gl/docs/api-reference/aggregation-layers/hexagon-layer — colour and height as two channels on hexes.
- https://docs.datadoghq.com/dashboards/widgets/cloudcraft_diagram/ — 2D/isometric toggle and overlays.

---

## Lessons for an information hex

1. **One channel, one meaning.** Fill = state; glyph = kind; the one number = the active layer's value; thin ring = progress; border = owner. Never use one channel for two things.
2. **Fixed slot grid.** Use the same slots in every hex (Azure's five; Civ's row plus a top slot) so the eye can compare across hexes. Leave an empty slot empty; never fill it with something else.
3. **Small counts as marks, large ones as numerals.** Civ draws 1–5 as repeated glyphs and switches to a numeral at 6. Catan uses 1–5 dots.
4. **Roll up to the worst state.** A parent hex shows its worst child (Polystat), and its tooltip lists triggered items first.
5. **Hover gives the full text.** One column: names, every number with its unit, and the reason (Civ's tooltip). Use a short delay, plus a modifier key for instant display.
6. **Click opens the management surface.** It drills in or opens the panel (Datadog host panel, Civ city panel). Don't open a new tab.
7. **Detail grows with zoom.** Far: colour only. Mid: colour and glyph. Near: everything. When text doesn't fit, drop it and rely on the tooltip (Polystat, Zabbix) rather than shrinking it until it can't be read.
8. **A layer is a tint plus a key.** Only the hexes in the layer are tinted; everything else stays neutral (Cities: Skylines; Two Point's white for the group not being viewed). One layer at a time (Civ VI, Cloudcraft).
9. **The legend belongs to the layer.** Hex-shaped swatches, five entries or fewer, a word beside each range (Breathtaking … Disgusting). The legend opens and closes with the layer.
10. **Diverging scale for good/bad, sequential for amounts.** Clamp min/max so one outlier doesn't flatten the rest (Datadog).
11. **Preview a change as deltas.** Before the user commits, show green/red up and down arrows on the affected hexes and mark the best one (Civ VII). Present them as data, not advice.
12. **Owner as a border: dashed while provisional, solid when committed** (Civ VI). This keeps the fill free for state.
13. **Group with space and a counted label** ("Payments · 23"), at most two levels deep.
14. **Height is a second quantity.** In isometric only: one aggregation, separate from colour (deck.gl), with consistent light.
15. **An "underground" view for links.** Hide the surface and show dependencies, as SimCity does for pipes.
16. **Urgent state shows without hover.** Use stripes or a pulse on the hex itself (Prison Architect's insecure rooms) and grey out empty slots.

**Anti-patterns**
- More than about five fill colours on one layer.
- Labels on every hex at every zoom.
- Information that only appears on hover.
- Colour meanings that change between layers without the key changing.
- Icons that spill into neighbouring hexes.
- Several layers active at once.
- View settings that reset each session (Civ VII's yields toggle).
