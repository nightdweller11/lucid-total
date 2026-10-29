# City-builder info layers: how games show data on a living city

Reference study for the company-map designer. Researched 2026-10-29; every URL below was fetched that day and resolved. *(seen)* = taken from looking at the screenshot itself, not from someone's description. Fandom wikis and the Paradox forum block automated fetching, so they are cited only where nothing else exists.

---

## 1. Cities: Skylines (2015): "Info views"

**Layers.** 19 at launch, 37 with DLC. Base set: Electricity, Water & Sewage, Garbage, Education (a tab per school level), Happiness, Health (Healthcare / Deathcare), Levels, Wind, Traffic, Pollution, Noise, Fire safety, Crime, Public transport, Population, Outside connections, Land value, Natural resources, Districts. DLC adds Heating, Snow, Road maintenance, Tourism, Traffic routes, Industry areas and others.

**Visual grammar** *(seen)*. With a view on, the world becomes a matte **white clay model**: white buildings, white terrain, grey roads. A community "Dark Info Views" mod exists because the default is "very white and bright". Only the data is coloured, on three carriers:
- **Object tint.** Electricity paints connected buildings solid blue and disconnected ones a pale pink-grey. Happiness and crime paint buildings red → green.
- **Line colour.** Traffic colours the road surface in about six discrete steps from green to red. Coverage views (garbage, education, police) colour roads green where covered and grey where not. Water pipes appear as teal lines, visible only in this view.
- **Area or volume.** Land value is a soft ground stain running white → blue → teal → green. Sewage outflow is drawn as tall translucent green plumes.

**Legend** *(seen)*. The panel opens at the **top left** (not bottom left), beside a two-column strip of round view icons. From top to bottom it holds:
- the title with a close ✕;
- a red-yellow-green **meter** with a triangle marker ("Electricity Availability", "Average Traffic Flow: 79%");
- the raw numbers ("consumption 770 MW / production 1,012 MW");
- a **"Legend"** block: either categorical swatches ("Power Plants: Active/Inactive; Buildings: Connected/Disconnected") or a stepped gradient with **"Low"** and **"High"** under its ends.

**Hover and click.** Clicking a building opens its info panel; the community FAQ says that is how you find out which problem it has. Service build menus open the matching view automatically.

**Problems vs ambient.** Problems are small **notification icons above buildings** (No Electricity, No Water, Sewage Backed Up, Garbage Piling Up, Abandoned, Fire, …) and stay visible in every view. Ambient data is colour, shown only while a view is on. The Chirper bird at the top centre is a separate news channel.

| URL | What it shows |
|---|---|
| https://skylines.paradoxwikis.com/Info_views | Every view with tabs, short colour notes, icon and screenshot gallery |
| https://skylines.paradoxwikis.com/images/1/1a/Electricity_Info_View_SS.png | White city, blue connected buildings, meter, Active/Connected legend, icon strip |
| https://skylines.paradoxwikis.com/images/1/16/Traffic_Info_View_SS.png | Roads in a 6-step green→red ramp, "Low/High" legend, flow meter |
| https://skylines.paradoxwikis.com/images/1/1e/Water_Info_View_SS.png | Teal pipes, green sewage plumes, 5-entry legend, two meters |
| https://skylines.paradoxwikis.com/images/9/92/Land_Values_Info_View_SS.png | Ground stain white→blue→green; "Average Land Value: 32 ₡/m²" |
| https://skylines.paradoxwikis.com/Notifications | Problem-icon catalogue by category |

---

## 2. Cities: Skylines II (2023)

**Layers.** About 33: the CS1 set plus Roads, Disaster Control, Administration, Post, Telecom, Company Profitability, Citizen Wealth, Workplace Availability, four separate pollution views and four zone views.

**What changed** *(seen)*.
1. **One view holds several sub-layers.** Each legend row has a checkbox and names the channel it paints: **"Building color", "Network color" or "Terrain color"**, so building tint, cable colour and a terrain field can all show at once.
2. **The base goes to a desaturated sepia-grey, not white.** Power plants show blue, transformers green, batteries violet, consumers yellow → orange by load. Groundwater is a violet ground glow, and surface flow is white arrowheads.
3. **Gradients are the norm:** green-red on roads, blue-red or white-orange on terrain.
4. **Networks show flow and bottlenecks.** Low-voltage cables read pale yellow for "Electricity Flow" and red for "Bottleneck". A bottlenecked cable is drawn red-dashed, with an orange hexagonal problem badge on it.

**Legend** *(seen)*. A dark translucent panel beside the icon grid. Each meter has a CAPS title ("SEWAGE TREATMENT"), a red→green bar with a marker, and the two quantities under its ends ("Consumption: 178 MW … Production: 273 MW"). Then **"MAP LEGEND"**: each row is a swatch or gradient, end words ("Low/High", "Weak/Strong"), the channel label and a checkbox.

**Hover and click.**
- Hovering a cable shows "Electricity Flow 40 / 40 MW".
- Clicking opens the **Selected Info Panel (SIP)**: needs, an Efficiency value with a hover breakdown, upgrades, and a "Toggle Traffic Routes" button.
- The routes then appear on the full-colour map as translucent blue lines whose **width is the traffic volume**.

**Problems vs ambient.**
- Notifications float above buildings, and their **background colour encodes 7 severities**, from Minimal to Fatal Problem. Bottleneck is Major; Traffic jam is Warning; Deactivated is Minimal.
- Players complained in 2023 that the icons cover the view.
- The 2026 Iceflake patches restyled the HUD and the view icons and added a legacy-UI toggle. I found no change to the overlay grammar.

| URL | What it shows |
|---|---|
| https://cs2.paradoxwikis.com/Info_views | Every view with sub-layers and per-channel colour pairs |
| https://cs2.paradoxwikis.com/Notifications | 7-level severity model, example icons |
| https://colossalorder.fi/?p=1732 | Dev Diary 6 (Electricity & Water): info views, hover flow, bottlenecks |
| https://colossalorder.fi/_astro/15-Electricity-infoview.BAXktSJ5_Zuykf4.webp | Sepia base, coloured facilities, full MAP LEGEND with channel labels |
| https://colossalorder.fi/_astro/14-Bottleneck.ClViWUFV_GxxR9.webp | Red-dashed bottleneck, hexagon badge, flow tooltip |
| https://colossalorder.fi/news/development-diary-detailers-patch-2/ | SIP traffic routes; line width = volume |

---

## 3. SimCity (2013, Maxis): "data maps"

**Layers.** 30 maps in an "All Data Maps" grid of round icons, opened from a layers button at the bottom right:
- Population, Happiness, Density, Residential/Commercial/Industrial, Land Value, Industrial Tech;
- Power, Water Table, Sewage, Waste;
- Fire Risk, Health, Crime, Education, Germs;
- Air and Ground Pollution, Wind, Radiation;
- Bus, Train, Streetcar, Boat;
- Coal, Ore, Oil, Recycling, Tourism.

Each city-service button on the bottom toolbar also opens its own map.

**Visual grammar** *(seen)*. Most maps turn the city into a pale pink-white model.
- **Happiness:** buildings in a 5-step red → green ramp.
- **Crime:** blue translucent haze for police coverage, orange haze for crime, and **red vertical columns** over criminals' homes (height is magnitude).
- **Sewage:** buildings graded white → brown → red, from "Empty" to "Spewing".
- **Power:** the base goes **dark olive** and powered buildings glow yellow, so the darker base lets a light hue carry the data.
- **Placement:** placing a building turns the whole city pale-blue "blueprint", and only the new building keeps its colour.

**GlassBox flow.** Resources are agents and are drawn moving. bit-tech: "yellow pulses of electricity heading out of power stations" that get bigger and faster after upgrades. At night, roads carry glowing yellow power lines that **turn red where supply fails** *(seen)*.

**Legend** *(seen)*. A white card at the top right with a title and ✕.
- Categorical keys are **little house icons** in each state colour (Powered / Off / Unpowered). Happiness adds face emojis from Sad to Happy.
- Gradients have end words ("Low…High", "Good…Bad").
- The crime card adds a "Past Events" icon key.

**Click.** A building window shows stats, with resident comments at the bottom. The Power panel is a **semicircular red→green needle gauge** reading "2 MW excess", plus regional trade *(seen)*.

**Problems vs ambient.** Icons float above buildings: red lightning bolts for no power, trash-can bubbles, green chevrons and smileys *(seen)*. Ambient data is colour.

Intent: Maxis drew on Google Maps for data layers (bit-tech, 2012). Engadget: charts are now "delivered in full graphical glory as an overlay on the main game screen".

| URL | What it shows |
|---|---|
| http://simcityversity.blogspot.com/2013/02/simcity-192-data-map-overlays.html | All 30 maps, the grid, one screenshot per map |
| https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjB9D2sKJLJ9TAddWMXsd3Vt9wn7ZV-fOsJ1o7PkcLxhiMLfi8lHXOWIo9X6xDKKElufby9y1hDHA4z9k-Ua2gYCQAnH3SdMNrcAvdOYrVF03Vc94uFuOgbP-B5Sgzq0PlJH7nZvknx55rS/s1600/192_overlay_crime.jpg | Crime: white model, two hazes, red columns, two gradients, event icons |
| https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhQ2BwKAimqKjRuRtjzMU9Lhzlz3WA4OtcbDAsx5Ql9UPBa4WZ0ln_sMRBNCtHaO3qQX4LVWGJGoRxHuvIq7S5EydmPlSoBY2ecFU8E_aXXm2Y5Pce3hgM0V9iwnxsgZ_lRLNWndPLHjhE1/s1600/192_overlay_happiness.jpg | Happiness: red→green buildings, house-and-face legend, floating chevrons |
| https://simcityversity.blogspot.com/2013/01/simcity-133-power.html | Blueprint placement with needle gauge; night outage with yellow/red roads and red bolts |
| https://bit-tech.net/previews/gaming/pc/simcity-preview/1/ | Google Maps inspiration; pulse size as the data |
| https://www.engadget.com/2012-08-17-look-around-simcity-dont-get-bogged-down-in-charts.html | Visual cues instead of charts; coverage green→red along roads |

---

## 4. Anno 1800, Frostpunk, Against the Storm (brief)

- **Anno 1800.** Service reach is measured by **street distance**, with a "full range" and a weaker "max range". Green lines show the reach while placing (Anno wiki Market and Pub pages, which block automated fetching; a Steam post). Productivity lives in the Statistics screen. **I could not verify production-chain lines drawn on the map.**
- **Frostpunk** *(seen)*.
  - The thermometer under the temperature readout toggles a heat map; an ✕ in the same spot closes it.
  - The base goes dark slate, buildings are tinted by temperature, and heat blooms as a halo around the generator.
  - The legend is a row of coloured dots **across the top**: Comfortable (red), Liveable (orange), Chilly (teal), Cold (blue), Very cold (dark blue), Freezing (violet).
  - The hover card turns the value into consequences: "Freezing. Very high risk of getting ill."
- **Against the Storm** *(seen)*. These are **hold-to-peek** layers: the overlay shows only while the key is held, and the map is not greyed. Hold Ctrl for recipe cards floating over each building (name, recipe icons with star grades, active check-circles). Hold B for resource icons over the nodes.

| URL | What it shows |
|---|---|
| https://pixeltwelve.com/guides/frostpunk-beginner-guide-workers-heat-map-screen | Heat-map toggle, legend words, hover temperature |
| https://pixeltwelve.com/media/sanity/9f89445fe1e07acc39d3537037f33eb90ad5834e-1920x1080.jpg | Heat-map screenshot: tinted buildings, top legend row, consequence tooltip |
| https://eremitegames.com/ats-quality-of-life-update-2/ | Hold-Ctrl production overlay, hold-B resource overlay (Jan 2022) |

---

## 5. Civilization: lenses, yields, tooltip, city panel

**Civ VI lenses.**
- Lenses: Appeal, Continent, District placement (automatic while placing), Government, Political, Religion (automatic with a religious unit selected), Settler, Tourism, Empire, Loyalty.
- They are picked from a "LENSES" radio list above the **minimap at the bottom left**.
- The UI code adds a full-width header with the lens name and a close button, dark vignettes on three edges, and a **"KEY" panel at the top right**. The key is rows of **hex-shaped swatches** with a label and an optional bonus icon.
- Appeal key: Breathtaking / Charming / Average / Uninviting / Disgusting. The Settler key **reuses those colours**: Fresh water +housing, Coastal +housing, No water, Too close to a city.
- The lens itself is a **translucent wash on whole hexes** over the still-visible terrain *(seen, mod lens on the same engine)*.

**Tile yields.**
- **Civ V** (yield-icon code): each yield type is one world-anchored sprite at the hex centre, scaled with the camera.
  - Values 1–5 are a pre-drawn **cluster of 1–5 repeated icons**; above 5 it becomes one icon with a numeral (up to 12).
  - At most two **rows** sit at the centre, filled in a fixed order: food, production, gold, then science, culture, faith.
- **Civ VI**: yields are toggled from Map Options above the minimap. **I could not verify its in-hex layout at each zoom level from a primary source.** Its support site lists a bug where multi-yield icons overlap the neighbouring hexes.
- **Civ VII** *(seen)*: on growth and placement screens, everything outside the city drops to **black-and-white** and eligible tiles fill with flat colour. Each tile carries **badge tokens with the number inside**: green-bordered for gains, red-bordered for losses. The best tiles get green numbers and up/down arrows.

**Strategic view** (Civ V and VI; dropped from VII at launch). A flat 2D hex map with **fixed slots** for resource, improvement and unit icons. Civ V's subdued tints let units and cities stand out; Civ VI kept saturated colours and players found it harder to read.

**Tile tooltip** (Civ VI code).
- Title: the terrain.
- Then, in order: owner and city; feature; resource (with a red "(Requires tech)" note); river; movement cost; route; defence; appeal (word and value); continent.
- Then `------------------`, followed by the district or improvement with its yields line by line, the buildings, and "worked by N citizens".
- It appears after a short pause.

**City click** (Civ VI). A bottom-right panel holds:
- the name with previous/next arrows;
- six yield cells, each with favour/ignore toggles;
- Growth (turns bar), Housing, Amenities, Religion and a district Breakdown;
- the current production with a turns bar;
- Manage Citizens, Purchase Tile, Change Production, and buy with Gold or Faith.

| URL | What it shows |
|---|---|
| https://www.civilopedia.net/standard-rules/concepts/world_7 | Official lens list and when each activates |
| https://github.com/astog/MoreLenses/blob/master/Base/Assets/UI/Panels/modallenspanel.xml | Lens header, vignettes, top-right KEY with hex swatches (base-game file copy) |
| https://github.com/vans163/civ6_qui/blob/1.0.0.26/UI/ToolTips/PlotToolTip.lua | Tile-tooltip fields and their order |
| https://github.com/spradlin-dev-bazaar/civ5-bazaar/blob/main/mod/vmc/UI/InGame/YieldIconManager.lua | Civ V yield clusters, numerals above 5, two-row stacking |
| https://civilization.2k.com/civ-vii/from-the-devs/developing-settlements/ | Civ VII yield badges, gain/loss colours, before/after shots |
| https://forums.civfanatics.com/threads/strategic-view.572168 | Civ V vs Civ VI strategic-view legibility |

---

## Lessons for a company map

1. **One layer at a time, and the base steps back.** The living scene drops to one neutral (white clay, sepia or blueprint), so every saturated pixel is data. If the data hue is light, darken the base instead (SimCity power).
2. **Each layer names the channel it paints:** the object (tint), the link (line colour or width) or the ground (area field). Layers can stack only on different channels (CS2).
3. **Match the mark to the data:** washes for fields, tints for per-entity state, lines for flows, vertical volumes for "how much here".
4. **Make absence visible.** An uncovered or disconnected entity gets its own pale tint, never the base grey.
5. **Show flow by motion and width.** Pulses that grow with capacity, and lines whose width is volume, read without a legend.
6. **Put bottlenecks on the link:** a dashed or red segment plus a badge at the point that is over capacity.
7. **The legend is always visible while a layer is on**, attached to the picker, with the title, end words ("Low/High", "Good/Bad") and units.
8. **Head the legend with one summary meter:** a bar with a marker and the two quantities that make it ("Consumption 178 … Production 273").
9. **Draw categorical keys as the object itself:** a tiny house or a hex swatch, not an abstract chip.
10. **Reuse one good→bad ramp across layers** to cut learning; never reuse a hue with the opposite meaning.
11. **Problems are icons, data is colour.** Problem icons float above the entity, persist across all layers and carry severity in their background colour. Ambient colour exists only while its layer is on.
12. **Ration problem icons** (aggregate them at distance); icons that cover the view were a top complaint.
13. **Hover gives the exact number and its consequence** ("40 / 40 MW"; "Freezing: very high risk of getting ill"). The colour never has to carry the number.
14. **Click opens management:** one side panel with identity, a few gauges, needs with a hover breakdown, actions, and a "show my routes" toggle.
15. **Each entity carries a fixed glyph grid:** small icons in fixed slots and order, repeated icons for small counts, an icon plus a numeral beyond a threshold, scaled with zoom. Full numbers stay in the tooltip.
16. **The tooltip has a fixed order:** identity, ownership, attributes, a separator, outputs line by line, contents.
17. **Layers are contextual:** choosing a tool or selecting an entity opens the relevant layer; leaving restores the normal view.
18. **Offer hold-to-peek** (hold a key, release to return) alongside sticky layers.
19. **Decision mode:** everything out of scope goes black-and-white, eligible slots fill with flat colour, and each slot shows a gain badge and a loss badge.
20. **Zoomed out, switch to a flat 2D mode** with subdued tints and fixed icon slots, rather than shrinking the detailed scene.
