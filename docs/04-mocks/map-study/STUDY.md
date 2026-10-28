# The company map: five explorations

> Map study for Lucid Total, 2026-10-28 (T30). Brief: `BRIEF.md`. Page: `index.html` (variant switcher, theme and contrast switches, URL params `?v=1..5|all&pt=deep|aqua|sky&hc=std|high&s=<still>`). Stills: `shots/`, 55 in all. Generator: `gen/` (Node 22, no dependencies; `node gen/build.mjs`, then `node gen/shoot.mjs --check` to measure, `node gen/build.mjs` again to print the counts, and `node gen/shoot.mjs` to shoot). Nothing outside this folder was changed.

The owner liked v0.2's direction but found the map neither organic nor something you zoom into, and expected data layers. This study draws one company, one stuck situation and the same three depths five ways, as different from one another as possible, so the comparison is about the metaphor, not polish. It ends by recommending one ground and naming what to take from the other four.

---

## 1. What the map must answer, and how each variant is judged

At every depth and for every viewer, the world answers five questions in one glance (`docs/03` §1): **what exists**, **what moves**, **what is stuck**, **what needs me**, **how it connects**. It must also stay inside the attention budget (`docs/13` §3): one focal subject, at most three things that need the viewer, at most twelve text elements above body size, at most seven numbers on a glance screen, amber and coral only for failing or breached states, and at most two disclosure levels.

The criteria used in the comparison (§7):

| Criterion | The question asked of each still |
|---|---|
| **Organic feel** | Does it read as a place that grew, or as a chart that was laid out? |
| **Zoomability** | Is the child visible in the parent before you zoom? Can you imagine one continuous motion from company to domain to program? |
| **Data layers** | Does a layer change the terrain itself (shape, light, flow, weather), or does it add badges? |
| **Navigation clarity** | Can a newcomer find Engineering, the beta and Compliance without a legend? |
| **Finding problems without reading** | In the problem still, does the eye land on the stuck point before reading any word? |
| **Scale growth** | Does it still work with two founders and with two hundred people? |
| **Phone** | Does the metaphor survive 390 px, one place at a time? |
| **Accessibility and RTL** | Does it mirror cleanly, read in high contrast, and have a natural list equivalent? |
| **Attention budget** | Does it stay calm and keep to the budget without fighting the metaphor? |
| **Rendering cost** | Can SVG do it, or does it need Canvas or WebGL, and at what complexity? |
| **Implementation risk** | How much new technology and tuning stands between the still and a product? |

**The same company everywhere.** Eleven domains with consistent measures (open work, done share, forecast, spend, AI share, issues, staleness, heat, load, trust), Engineering's five programs, the beta's four streams and nine buildings (`gen/company.mjs`). **The same problem everywhere:** the Railway token chore blocks the dispatcher work, which blocks the store submission; the Compliance DPA signature is late; Marketing waits on both.

**How the counts are measured.** `gen/shoot.mjs --check` walks the text in each rendered still. It uses the v0.2 validator's definition: a text element above body size is anything above 15.5 px; numbers are digit runs; needs-you is any element marked as a thing that needs the viewer (owner flags, the phone card, a trust proposal). Labels at 12.5 to 15 px are body size and not counted; each still has six to sixteen of them, which is why some stills feel busier than their counts say. On the domain stills the only "number" is the "1.0" in "iOS 1.0". The five numbers on each program still are in the hovered building's card (`4 of 6 criteria · since Oct 26 · Wave 71`), which is the allowed second disclosure level.

---

## 2. V1 Relief: the company as a landform

**The idea.** The company is a landscape in oblique relief, drawn as ridgelines: one line per row of ground, each filled so it hides what lies behind it, the way a relief print or a Joy Division sleeve does. **Height is remaining open work**, chosen over importance because it is honest and it changes: a place is a mountain still to climb, and finished work flattens into a lit plain. Light is progress, haze in the valleys is staleness, roads run along the valleys, and the island has a stratified edge, so it reads as a solid object you could fly over.

**Zoom.** Flying lower. Engineering's programs are sub-summits of its massif at company depth; at domain depth they resolve into terraces (each step a share of open work), and the beta terrace already shows its buildings in miniature; at program depth the terrace carries four furrowed fields (streams), buildings with facades, the critical road to Gate 1 Alpha and the token boulder where the Operations road climbs on. Neighbours stay at the frame edges where they were.

**Layers that change the ground.**
- **Cost** re-shapes the mountains by spend instead of open work, so the ground moves under you, and brightens them by spend. A teal stratum floats above with contour loops of AI cost, dropped to the ground where it lands. This is the "data floating on it" the owner asked for.
- **Progress** is a lit tide: the ridgelines light up from the foot of each mountain to its done share, and a dotted band marks the forecast.
- **Issues** is weather: clouds whose shadows darken the ground in proportion to the hurt. They are grey while inside service levels, amber for the failing suite and coral for the breached signature.
- **Dependencies** dims the ground and lights the valley roads, with the critical path as a thick road with direction marks.
- **Freshness** (its own layer) is a glow on the summits that moved today and haze where nothing did.

**Problem picture.** A landslide with the Railway token as a boulder on the valley road below Operations. Items queue behind it; the roads beyond it are dotted (waiting); the pass from Compliance is closed by a barrier under a coral front. The eye goes to the slide first, because it is the only rough, broken shape on smooth ground.

**Best at.** Organic feel and zoom. It is the only variant where "zooming in" is a physical act you already understand (descending), where the child is literally part of the parent's shape, and where every layer is the ground itself. It is also the closest to v0.2: the same places, pins, rings and landmarks, standing on terrain.

**Where it breaks.** Occlusion: in 3D a peak hides what is behind it, so the layout must put the low places at the back and the camera pitch must stay shallow, or the viewer must be able to tilt. Labels on slopes collide more than labels on a plane. The ridgeline style needs many paths (about 600 KB of SVG per still here), so a product needs WebGL. High contrast and reduced transparency need a flat fallback (the same landform as a contour map seen from above, which is also the natural phone fallback). Height can be misread as importance rather than work still to do; the legend chip must say it.

**Overlaps.** A program across domains is one dashed hull across the valleys (EU residency into Compliance and Marketing), with a "continues" chip at the frame edge.

**Perspectives.** A CMO perspective moves the camera, not the ground: the island rotates so Marketing's harbour is in front and Engineering's massif sits behind it. Size and emphasis follow the perspective's measure, so Marketing's open work raises its mountain.

**Refocus.** Effort is water: dragging it toward Europe visibly erodes the Europe mountains (open work falls faster, and the tide rises up them) while the mountains it leaves stop shrinking. The re-forecast is a time-lapse of the landform.

**Phone.** The landform cropped around one place with one card; it works, but the flat contour version is the better phone form.

**Worth taking even if not chosen.** Height as remaining work; the light tide for progress; strata floating above the ground for a second measure (AI cost); haze for staleness.

---

## 3. V2 City: the company as a city you run

**The idea.** An isometric island city at night. Districts are domains, zoned in their family hue. Buildings are items, as tall as their effort, with their windows lit as they get done; finished products stay standing as landmarks. Each district has a landmark building: Engineering's towers, Compliance's lighthouse, Marketing's harbour, Finance's vault, Operations' water tower. People are a tiny population on the streets. The overlays are the city's utilities.

**Zoom.** From the skyline to the Engineering district (its blocks are its programs; EU residency is one dashed lot across the avenue), then to street level: four lots are the streams, every shopfront is a product, unbuilt ones are glass shells with a ghost facade, and the Operations street is barred with the token van stopped at it.

**Layers that change the city.**
- **Cost** is land value: the city turns to wireframe and the ground is shaded by spend, with AI cost pooling in teal.
- **Progress** is construction: each building is solid up to its done share and scaffolded (dashed) above.
- **Issues** is smoke and sirens: smoke from where the issues come from, a beacon only for failing or breached.
- **Dependencies** is roads with their traffic (items in transit), with a jam at the blocked junction.
- **Power** (its own layer): Leadership is the power plant and each district is fed by the decisions it runs on. Compliance's line is cut at the DPA, so its windows are dark.

**Problem picture.** The plumbing view, where the streets turn to glass. The Railway token valve at the water tower is shut, the dispatcher main swells and items back up inside it, and the pipes on to the store submission and Marketing run thin and dry. Compliance is a dark district with its power line cut and sparking. Of the five problem stills this one tells the causal story best: "the valve is shut, so the pipe is clogged, so the basin is dry" needs no reading.

**Best at.** Explaining how things work, which is what the owner meant by SimCity's electricity and plumbing. Power (decisions feed work) and plumbing (work flows through states) are the two layers in this study that show mechanism, not just measure. It is the most game-like, and scale grows naturally from a village to a city.

**Where it breaks.** It is the least organic, because isometric grids are built, not grown, and the owner's first complaint was organic feel. It is also the busiest: hundreds of small buildings with windows at company depth come close to the attention budget's spirit even when the counts pass. A dashboard-grid feel creeps in through the regular blocks. Buildings as items push toward one building per item, which does not scale to thousands, so clusters must become blocks. Rendering is polygon-heavy and needs Canvas or WebGL.

**Overlaps.** A lot that straddles an avenue, which is clear but blocky.

**Perspectives.** The camera rotates in 90° steps (a classic city-builder control), so the CMO sees the harbour in front.

**Refocus.** Shifting effort is moving the city's budget between districts: cranes appear where effort lands and building heights re-forecast. 

**Phone.** A skyline works well as a header; one district at a time.

**Worth taking even if not chosen.** The **power** and **plumbing** layers as the study's best answer to "illustrate how things work and identify problems"; lit windows as progress at the building scale; shopfronts as facades at street level; the dark district as the picture of a missing decision.

---

## 4. V3 Biome: the company as living tissue

**The idea.** A microscope slide. Places are cells sized by open work, and their nuclei are their programs, visible on the slide before you zoom (Engineering's five are the ones you enter). Vessels carry work between cells; beads in them crowd where it flows fast and thin out where it stalls. A healthy cell is clear and luminous; a stale one greys and shrinks (Partnerships). Heat is a soft fever glow, and lessons leave scar tissue.

**Zoom.** Turning the objective: the Engineering membrane rings the lens and its nuclei become programs, with Compliance and Operations as the neighbouring cells beyond it; then the beta nucleus fills the lens, its compartments are the streams and its vesicles carry the products, with a filament to the nuclear pore (Gate 1 Alpha) and the entry pore from Operations clotted with the token.

**Layers as stains.** Cost is a silver stain with teal AI granules. Progress is maturity: rings lit from the membrane inward to the done share. Issues is inflammation: granules where issues gather, amber where the suite fails, a coral membrane at the breach. Dependencies is circulation: vessels with bead spacing as velocity. **Trust** (its own layer) is a teal stain of how much the AI may act in each cell, with the one advancement proposal as the only thing that needs the viewer.

**Problem picture.** A clot (the token) in the vessel from Operations; the vessel swells before it and work backs up inside. Beyond the clot the vessel to Marketing runs thin. Compliance's membrane is thick and coral with its pore shut (the DPA). Marketing is pale, starved from both sides.

**Best at.** Child-in-parent. Nuclei inside cells are the most natural "sub-map faintly visible before zoom" of any metaphor, and the microscope makes zoom a single, familiar gesture. It is organic by definition, and SVG renders it cheaply because it is all soft 2D shapes. The round lens also enforces breathing room: there is only so much you can put on a slide.

**Where it breaks.** The metaphor carries feeling. Clots, inflammation and scar tissue are clinical words for a company's work, and a team may not want to see its department as an inflamed cell. Decisions have no natural biological picture (the closed pore is the best this study found). Facades inside round vesicles are cropped and small, so the products, which `docs/13` §5.3 puts at the centre, lose to the metaphor at program depth. Scale is limited: a slide with forty cells is a rash.

**Overlaps.** A channel through the membrane: clear for two cells, awkward for three.

**Perspectives.** Moving the slide; the CMO's cell is centred and larger.

**Refocus.** Nutrients redirected: vessels to Europe thicken and their beads crowd.

**Phone.** One cell in a round lens is a strong, characterful phone screen.

**Worth taking even if not chosen.** Nuclei as the rule for child-in-parent; **layers as stains** (a layer re-colours the ground itself) as the layer grammar; bead spacing for velocity on any flow line; the trust stain.

---

## 5. V4 Orbits: the company as star systems around its goals

**The idea.** Each goal is a sun (Beta live, Europe, Runway), ringed with its progress. Programs are planets orbiting the goal they serve: nearer when they deliver sooner, larger when they carry more work, with a lit phase that is their done share. Items are moons, people are ships, dependencies are tethers, risks are asteroid fields. The domain survives only as the planet's hue and landmark. It is the only variant **organised by purpose rather than by department**.

**Zoom.** The telescope: pointed at Engineering, the Beta system fills the field and Engineering's planets are lit and ringed while others stay dimmed in place; landing on the beta planet, continents along the limb are the streams, stations on the limb are the built products, unbuilt items are ghosts still in orbit, and the critical path is a launch trajectory to the Gate 1 Alpha ring with the token asteroid lodged on it.

**Layers as spectral filters.** Infrared (cost) makes planets glow by spend, with a teal AI corona. Luminosity (progress) shows phase plus an orbit trail lit along the part of the journey travelled. X-ray (issues) shows asteroid fields around what they hit. Gravity (dependencies) shows tethers, with the critical chain bright. **Crews** (its own layer) shows people as ships where they work, with a strain halo on heavy planets that have too few ships.

**Problem picture.** The token asteroid knocks the dispatcher moon into a decaying spiral, and its tether drags the store submission off its orbit (a ghost marks where it should be). In the Europe system the DPA eclipses the sun.

**Best at.** Strategy. "What serves this goal, and how far is it from delivery?" is answered by the arrangement itself, which no other variant does. It also shows that the beta and Europe compete for the same departments.

**Where it breaks.** Navigation and place. You cannot find "Engineering" as a place, because it is scattered across three systems, and the owner's map of the company becomes a map of its goals. Orbits are unstable in the viewer's memory: if distance is time to delivery, planets move every day, which breaks the rule that places keep their position. The problem picture is the least obvious of the five (an eclipse and a spiral need explaining). Two hundred people means hundreds of planets and moons, which becomes a starfield. The phase-as-progress glyph is clever but competes with the ring that means progress everywhere else (`docs/13` §15, invariant meters).

**Overlaps.** Natural: a cross-department program is one planet, and its departments are in its crew.

**Perspectives.** This variant is itself a perspective.

**Refocus.** The most physical one: effort is mass, and moving it pulls planets inward (sooner) and lets others drift out.

**Phone.** One sun per screen, swipe for the next; it works well.

**Worth taking even if not chosen.** The **goal lens** as a perspective ("show me the company by goal"); distance to the sun as time to delivery; crews as people where they work, with a strain mark for understaffed work.

---

## 6. V5 Lines: the company as a transit network

**The idea.** Each process is a line: the Build line (idea, decide, private beta, release, feedback), the Customer line (lead, customer, resolution, knowledge), the Store line (Railway token, dispatcher, private beta, store submission, launches) and the Europe line (DPA, EU residency, launches). Stations are milestones and gates, interchanges are where programs meet, trains are items in motion, and crowding is congestion. The departments are the districts the lines pass through, drawn faintly behind with their landmark and ring.

**Zoom.** In the Engineering district the programs are the stations (Private beta is the interchange of the Store and Build lines) and lines leave the frame with their destinations; inside the Private beta station, tracks fan out into four platforms (streams) whose shopfronts are the products and converge at the exit to Gate 1 Alpha, with the token train stopped at a red signal on the Dispatcher platform.

**Layers as service maps.** Cost draws each line as wide as what it costs, with a teal core for the AI share. Progress makes each line solid as far as its work has travelled. Issues is service status (crowding within limits, a signal failure, a closed station). Dependencies shows transfer walks between lines, with the critical route bold. **Time** (its own layer) is the timetable: the same lines laid on a time axis, stations on their forecast dates, ghosts where they were planned, arrows for the slip. The timeline layer of `docs/03` §3.11 comes with this variant for free.

**Problem picture.** "No service: Dispatcher to Store submission". A hatched segment, six trains waiting, a **replacement bus** (the manual deploy) as the workaround, and the Europe line closed at the DPA. It is the most legible problem still in the study, and "replacement bus" is the only picture of a workaround any variant found.

**Best at.** Flow, dependencies and time. It is the calmest variant, the most accessible (a transit diagram is already a list, so the list equivalent is trivial and it mirrors perfectly), the cheapest to render (a few paths) and the best on a phone (the strip map).

**Where it breaks.** Place, and therefore the owner's first wish. The departments are background, and the map shows how work moves, not where it lives. Lines are hand-designed artefacts: octilinear layout of a living network is a hard, unsolved automatic-layout problem, and the drawing changes whenever a process changes. It is the least organic of the five and the least "zoom into": zooming a diagram reveals a bigger diagram. At company depth it shows processes, not the company.

**Overlaps.** Native: interchanges.

**Perspectives.** Line emphasis; the CMO's lines are bold.

**Refocus.** Adding trains to a line, which is concrete but small.

**Phone.** The strip map is the best phone form in the study.

**Worth taking even if not chosen.** The **dependency and problem grammar** (lines, stations, trains, "no service", replacement bus); the **timetable morph** for the timeline layer; the strip map for the phone's "what is stuck" view.

---

## 7. Comparison

Scores are 1 (weak) to 5 (strong); for rendering cost and implementation risk, 5 means cheap and low risk.

| Criterion | V1 Relief | V2 City | V3 Biome | V4 Orbits | V5 Lines |
|---|---|---|---|---|---|
| Organic feel | **5** | 2 | **5** | 3 | 2 |
| Zoomability (child in parent, continuous) | **5** | 4 | **5** | 4 | 3 |
| Layers change the terrain | **5** | **5** | 4 | 3 | 4 |
| Navigation clarity (find a place) | 4 | 4 | 3 | 2 | **5** |
| Problem found without reading | 4 | **5** | 4 | 3 | **5** |
| Scale growth (2 to 200) | 4 | **5** | 3 | 3 | 4 |
| Phone | 3 | 3 | 4 | 4 | **5** |
| Accessibility and RTL | 3 | 3 | 3 | 3 | **5** |
| Attention budget (calm) | 4 | 3 | 4 | 4 | **5** |
| Rendering cost | 2 | 2 | 4 | 4 | **5** |
| Implementation risk | 2 | 2 | 3 | 3 | 4 |
| Fit with the owner's three asks (organic, zoom into, layers) | **15** | 11 | 14 | 10 | 9 |

Relief and Biome are the organic ones you zoom into; City (how things work) and Lines (what is stuck, and when) are what the owner hoped layers would do; Orbits answers a different question: what serves which goal.

---

## 8. Recommendation: Relief as the world, with four borrowings

**The ground is V1 Relief.** It is the only variant that answers all three of the owner's asks with the same gesture. The company is a landform; zooming is descending; and every layer is a different way of shaping or lighting the same ground. It keeps everything v0.2 established (places with names, landmarks, rings, flags, presence, embassies, facades on buildings at program depth) and makes it physical. Biome is as organic and as zoomable, but its feelings are wrong for a workplace and its products are too small. City and Lines are better at explaining, and they are taken as layers rather than as the world.

**Exactly what is taken from each:**

| From | Element | Where it goes in the Relief world |
|---|---|---|
| V2 City | **Plumbing layer**: work as water through the states of a process, a clogged pipe with items backed up | A layer over the valleys: pipes follow the valley roads; a stuck step is a swollen pipe with the queued items drawn inside it |
| V2 City | **Power layer**: decisions and goals feeding places; a cut line is a missing decision; the place goes dark | A layer from Leadership's summit; a place with a cut line loses its light tide (its ridges go dark) |
| V2 City | **Lit windows** as progress at building scale | On the program terrace, buildings' facades carry a lit-window strip for done share where no criteria ring applies |
| V5 Lines | **Dependency grammar**: roads become lines with stations and trains on the dependency layer; "no service" segment; **replacement bus** for a workaround | The dependency layer and the problem picture; the slide stays as the blocked point, and the replacement bus is drawn when a workaround exists |
| V5 Lines | **Timetable morph** for the timeline layer; **strip map** on the phone | `docs/03` §3.11 timeline layer: the valley roads straighten onto a time axis; phone "what is stuck" view is a strip map |
| V3 Biome | **Nuclei rule** (every place shows its sub-places as shapes inside it before zoom) and **stains as the layer grammar** (a layer recolours or reshapes the ground; it never adds badges) | A rule in `docs/03` §6 and in the scene validator; the trust map (`docs/14`) becomes a stain over the relief |
| V4 Orbits | **Goal lens** as a perspective: "show me by goal" arranges programs around the selected goal by time to delivery, keeping domain hue and landmark | A perspective in `docs/03` §5 (beside role perspectives), and the Refocus futures for strategy, not the home |

**What it means for `docs/03`.** §3.1 changes area to **height** (open work by default; the viewer may choose spend, people or decisions waiting), adds the **light tide** as the progress encoding and **haze** as staleness, and makes positions on the island stable per perspective. §3.6 roads run along valleys, and the dependency layer draws them with the transit grammar. §4 Z0 to Z2 become "the island, the massif, the terrace". §6 layers are redefined as **terrain modes**, each with one encoding: Cost (re-shape by spend plus the AI stratum), Progress (light tide), Issues (weather and shadow), Dependencies (lines on the valley roads), Freshness (glow and haze), Plumbing, Power, Trust (stain), Timeline (timetable morph). A rule goes with them: a layer may change the ground's shape, light, colour or flow, and may add at most one floating stratum. §8 phone becomes the flat contour map of one place, plus the strip map for problems. §9 high contrast and reduced motion become the flat contour map seen from above, with the same identities.

**What it means for `packages/scene`.** The server computes a **heightfield per perspective**: a grid of heights plus a territory id per cell, from the measures and the pinned positions, cached and versioned. Layers are alternative heightfields or light and colour fields over the same grid, so switching a layer is a morph between two fields, which also makes Refocus a time-lapse. The client renders the ground in **WebGL** (one mesh, ridgeline or shaded style, 60 fps with a few hundred places), and draws pins, labels, flags, facades and the HTML chrome in an SVG and DOM overlay projected from the same camera, so text stays crisp and accessible. A **2D fallback** (the contour map, pure SVG) serves the phone, high contrast, reduced motion and the image renderer for channels (`docs/15`). The validator gains two checks: an **occlusion check** (no focal place hidden behind a peak at the default camera) and a **label collision check** with priority (flags, then focal place, then the rest).

**The risks, said plainly.** WebGL terrain plus a projected label overlay is the most new technology in this recommendation, and Relief is the most expensive variant to build well. Height can be misread as importance, so the legend chip and onboarding must say it once. Occlusion needs a layout rule (large places in the middle or front, low places at the back) and a tilt gesture. If the cost is too high for Phase 1, the contour map is a safe first release: it is the same model, drawn flat in SVG, and the relief can arrive later without changing a single place's position.

---

## 9. What this study did not do

- **No RTL or high-contrast stills were shot.** The brief asked for Deep Blue everywhere and Sky Glass at company depth; the page has a contrast switch, but the drawings were not tuned for high contrast beyond the tokens, and no Hebrew labels were drawn. Every variant mirrors without semantic loss except the isometric City, whose light direction would have to flip.
- **No motion.** Breathing heat, trains moving, the Refocus time-lapse and the zoom transitions are described, not animated.
- **Facades are placeholders** drawn in SVG (screens, chart, document, build badge, listing), as in v0.2.
- **The page is about 6 MB**, almost all of it Relief's and City's per-still SVG geometry. This is also the measured evidence for the WebGL recommendation.
- Aqua Dusk works on the page but was not shot.
