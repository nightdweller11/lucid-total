# Mocks v0.2 brief — Lucid Total as an operating system

> Lead's brief for the second mock wave, 2026-10-28 (T25, T27). v0.1 is archived in `v0.1/` for comparison only; its direction is withdrawn. Binding references: `docs/13-experience.md` (every rule in it applies), `docs/03-map-and-views.md` (the world), `docs/14` §2–§3 and §7–§8 (the System place, process table, models, trust map), `docs/15` §2 and §5 (channels), `docs/research/interface-inspiration.md` (patterns to take, traps to avoid). The dataviz guidance in the `dataviz` skill applies to every chart.

## 1. What must change from v0.1 (non-negotiable)

1. **No section rail.** A dock of five glyphs (Horizon · World · Me · Talk · More) folded at the start edge on desktop and the bottom on the phone, each 40 px, labels on hover only. The content fills the screen.
2. **Talk is the shell.** A command bar floating at the bottom centre (pill, glass, 560 px wide on desktop, full width minus gutters on the phone) with a mic glyph, a slash glyph and the Lucid mark; it never scrolls away; it is the only persistent chrome besides the dock and a small top-start breadcrumb chip.
3. **The world is a map at every depth.** Places have a name (Sora 600), a subject (one sentence on hover), a glyph, a stable hue, a **landmark illustration** and a **ring** (progress with a forecast tick). Sub-places are faintly visible inside a place before zoom (soft inner contours at 12–18 % ink). Items are **buildings** with **facades** (expected as a translucent ghost, actual as the product's image) and a thin criteria ring. No count pills on the terrain; counts appear only inside a flag or on hover.
4. **No kanban inside the map.** The board, the list and the timeline are instruments opened over the world with a "back" chip; they appear once each in the gallery, never as a home.
5. **The item is a product view.** Product large and first; expected vs actual compared (slider for screens, overlay for charts and documents, side by side otherwise); goal line; done rule line; criteria as a ring whose segments open evidence; context strip; the talk; the roads; **implications first when done**.
6. **A decision is a fork.** Paths with their consequences drawn as the world would change; the lit path is the recommendation; cost and toil first; a clock for reversible-until. **Refocus** is sliders over the world with the transparency strip.
7. **The attention budget is law** (`docs/13` §3): one focal subject; at most three things that need the viewer; at most twelve text elements above body size; at most seven numbers on a glance screen; amber and coral only for failing or breached states; motion only where something changed (draw it as a still that suggests breathing: a soft halo, not a pulse animation); detail one tap away.
8. **Breathing.** Generous space: a 24 px gutter minimum, 32–48 px between regions of a scene, type at 15/17/22/28/40 px, never a 12 px label as the main text; glass with depth (ground blobs, soft inner highlight), never boxes in boxes.

## 2. Visual language (keep from v0.1)

The Lucid Glass tokens, themes (Deep Blue, Aqua Dusk, Sky Glass), high-contrast variants, the Lucid Total mark (T24), the kind → glyph family mapping, Sora/Figtree/Heebo, Lucide 1.59.0, the two hues with jobs (accent = the person's action; Lucid hue = the AI), amber = waiting/caution, coral = stopped/breached, green = done/met. Copy `v0.1/gen/css.mjs` tokens as the starting point and extend; keep `v0.1/gen/mark.mjs`.

**New vocabulary to draw**

| Element | Rule |
|---|---|
| **Landmark** | A monochrome vector silhouette, 2 px stroke or filled, 1:1, drawn in the place's hue at 80 % on the place, in one ink under high contrast. Library of at least 16: skyline (engineering), workshop (product), loom (design), harbour (marketing), bridge (partnerships/sales), lighthouse (compliance), vault (finance), greenhouse (people), gears (operations), summit (leadership), beacon (support), rocket (launch/program), flask (research), scroll (legal), tower (system), satellite (AI). Never emoji; never Lucide icons as landmarks (Lucide is for buttons and glyphs). Keep each under 24 path commands. |
| **Ring** | A 360° progress ring with a thin forecast tick on the outside; stroke 3 px at small sizes, 6 px large; the done share in the place's hue, the remainder at 18 % ink; a "forecast" caption only on hover or when the ring is large. |
| **Light** | A place's ground brightens with progress: a radial lightness from 0 % to +8 % L. |
| **Heat** | A soft warm halo (Heat family) where things moved in the last day; no count. |
| **Weather** | Risk front: a soft hatched translucent blob with a feathered edge in the Risk family; its reason on hover. |
| **Flag** | A small banner glyph in Rules indigo; the owner's material forks are larger banners with a two-word label. |
| **Road** | Dependency: a soft line between buildings or places; the critical road 3 px; a blocked road broken by a barrier glyph (coral only if it breaches a date). |
| **Facade** | A 4:3 or 16:10 image inside a rounded building with a 1 px edge; the expected facade at 45 % opacity with a dashed edge; the actual at 100 %; the criteria ring in the top-end corner. For mocks use placeholder product images drawn in SVG (screens with glass panels, a chart, a document cover, a build badge), never grey boxes with "image". |
| **Embassy** | A small round marker at the coast with the party's glyph, tethered by a dashed line to the place it engages. |
| **Presence** | Avatars (24 px) with a status ring where people are now. |
| **Ghost** | Dashed outline in the Lucid hue at 60 %, an arrow from the current position. |
| **Haze** | Confidence: a translucent veil; lower confidence = thicker haze. |
| **Path (decision)** | A curved road leaving the fork; the lit path has the accent glow; each path ends in a small consequence panel. |
| **Transparency strip** | One line of plain words under Refocus with glyph-led fragments separated by " · ". |
| **Needs-you card** | 320 × 200 glass card: glyph, a one-line question or ask, one visual (a facade, a ring, a small world cut-out), two reply options as pills. |

Charts: load the `dataviz` skill before writing any chart; use its palette rules with the Lucid tokens as the brand colours; no gridlines heavier than hairlines; labels only on the ends; a sentence under every chart stating what it says.

## 3. The frames (desktop 1440 × 900 unless marked; phone 390 × 844)

**A · Horizon and the world**
1. **Horizon, owner, morning.** The world beneath at 60 % (places with landmarks, rings, one heat halo, one front); three needs-you cards along the top (a fork "Store submission go/no-go" with a small world cut-out; a feedback request from Dana with a screenshot facade; an envelope from the coordinator); the goals as three rings on a horizon line with their names; one line "Since yesterday: 14 buildings lit · 2 roads opened · 1 front grew over Compliance"; the dock; Talk.
2. **The company world, owner.** Full world: eleven places with landmarks, names, rings, light, sub-place contours faintly inside; heat on Engineering; a front over Compliance ("DPA signature late" on hover shown as a tooltip in the frame); two material flags; presence; two embassies (accounting, legal) at the coast; the legend chip closed; the perspective chip "Owner"; breadcrumb "Company".
3. **The same world, CMO perspective.** Marketing centred and large with its harbour; a skyline of three campaign facades inside it; the Europe hull crossing into Compliance and Engineering; the Market aspect panel docked at the end edge (two charts, one sentence each); Engineering and others ambient at the edge.
4. **Zoom reveal, three stills in one frame.** Company → Engineering (its contour becomes the frame, the skyline moves to the corner as emblem, program landmarks appear) → Private beta (streams as districts, facades appear). Draw the three stills side by side with the same place in the same hue to show continuity.
5. **Engineering, CTO perspective.** Programs as places with landmarks and rings; the Europe hull with "continues"; a skyline of recent facades per program; weather; presence; the Delivery aspect panel docked (a stream chart of proposed → done over eight weeks and the forecast band).
6. **Private beta · Wave 71.** Streams as districts (Dispatcher, Relay, Evals, Store); buildings with facades: four built (screens, a chart, a document cover, a build badge) with criteria rings, three ghosts, two small kind-glyph buildings; two finished landmarks; the critical road to the "Gate 1 Alpha" gate; a barrier on the road from the Railway token chore; a front "integration suite flaky"; one hovered building showing its one-line title and ring caption.
7. **The board as an instrument** over the same place: a translucent sheet with the board (cards and lines toggle) and a "back to the world" chip; the world dimmed beneath.

**B · Products**
8. **Product view: a screen.** Dana's item: the mock (expected) and her screenshot (actual) under a slider at 50 %; the goal line; the done rule line; the criteria ring (4 of 6 segments met, one partly, one open) with one segment's evidence popover; the context strip (goal · spawned by L489 · Dana · doing · since Oct 26); the talk (two comments and the assistant's drafted walkthrough with "apply"); the roads (two waits).
9. **Product view: an analysis.** Expected chart (target curve) and actual chart (measured) overlaid with the difference shaded and two diff marks; the done rule; ring; the assistant's sentence.
10. **Product view, done: implications first.** The implications panel leads: a ripple drawing on a world cut-out (three buildings unblocked, a road opened, the iOS gate's ring advanced by 9 %), the moved dates on the roads, the five people informed as avatars, the lesson; the product below.
11. **Product view: a chore.** "Open the Apple developer account": expected as a short checklist ring, actual as the account badge facade; the envelope step; the party (Apple) as an embassy chip.

**C · Decisions**
12. **The Fork.** "Store submission go/no-go": question; two sentences; one visual (the Store stream with its front and the gate ring); three paths (submit now · submit after Hebrew fix · hold a week) each with a consequence panel (ring change, a date on the road, who is loaded); the lit path; "Cost: $0 · Toil: 2 h of Noa"; the clock "reversible until Fri 18:00"; choose by tapping the path.
13. **Futures.** "Europe first · US first · both": three small worlds a month out, side by side, with haze for confidence; rings and fronts differ; one sentence under each.
14. **Refocus.** The world at domain depth; a slider per place (effort); Europe raised; ghosts where things move; dates sliding on two roads; the transparency strip; Apply · Save as a future · Discard; the assumptions chip ("capacity: 4 workers · velocity: last 6 weeks").
15. **A small change.** Inside a product view: the due date dragged; a one-line strip appears ("Marketing's campaign waits 3 more days · nothing breaches"); confirm inline.
16. **An ask as a small fork.** Noa's Horizon card: four support screenshots as a facade strip; "Turn into a task · No action · Needs more"; the asker's state beneath.

**D · Meetings and daily use**
17. **The Table: "Beta readiness".** The subject centred; the agenda as a path with the current step lit; three open forks as banners; a captured decision "Relay ships in beta" landing on the world (two buildings move to Ready, a road opens) with Undo; attendees as presence; a party attending shown with the compartment veil over what they cannot see.
18. **Minutes as a scene.** After the meeting: three decisions as cards with their ripples, two asks raised, one risk added, the next step path; "sent to attendees" line.
19. **Quick status.** Talk: "where are we on the beta?" → composed scene: the Beta ring with forecast, two blocked roads with reasons, three facades changed this week, one front, the sentence "The beta slips a week unless the Railway token lands today"; a back chip.
20. **Re-composing.** "just the money" → the same place as its Money aspect; chips "simpler · as a timeline · who"; the AI's one-line note of what it used.

**E · Aspects and infographics**
21. **Delivery aspect.** Rings per place, the forecast band for the three goals, a stream chart of items proposed → done (eight weeks), one drill chip per metric; a sentence per chart; no table.
22. **Money aspect (founders).** Runway as a line with the month marked; spend by place as a bar strip; AI cost per class as stacked bars; two upcoming spend forks as banners.
23. **People aspect.** Load as gauges per person (worded as help); waiting-on both ways as short roads; time-off band; asks pending per person.
24. **Customers aspect.** Issues intake flow (channels → triage → resolved) as a flow chart; SLA rings; the top asks; beta users by market as a small map strip.
25. **Infographic: "The quarter for the board".** One screen: title line; three goal rings; the Europe front; the runway line; five decisions as a path; one sentence each; "shared with Board · compartment: goals and forecasts" footer.
26. **Infographics view.** A gallery of six existing infographics as thumbnails with their subject and date; the Talk prompt "Make the picture of the beta for the testers' newsletter".

**F · The system**
27. **The System place.** Lucid Total's subsystems as sub-places (api, ai, worker, scene, knowledge, channels, connectors, importer, data) with health rings and the tower landmark; a front over "scene" ("RTL render fault"); cost today as one ring; the open repair as a lit building.
28. **A repair in progress.** The loop as a path (detect → diagnose → propose → build → verify → deploy → confirm) with the current step lit; the Claude Code session as a building with its working line; evidence chips (tests 212/212, screenshot); the autonomy level chip "inform"; the one-line Horizon result at the bottom.
29. **AI processes.** The process table as a quiet strip of process cards (glyph, model class, owner item, age, cost today, last change), not a table; one stuck process with a barrier; validation steps as a short path on one card; totals as two rings (budget used, runs validated).
30. **Settings → Models.** One card per class (fast · standard · strongest · fable) with: what it is good at (one line), speed glyph, cost per typical task, data terms (ZDR / 30-day retention), allowed sensitivity classes as glyphs, default uses; Fable's card as a decision card with "Enable" opening the context; nothing names a model id.
31. **Trust map.** A layer over the world: each place tinted by its autonomy level for the main action classes (observe · suggest · confirm · inform · run) with a small legend; one cell's advancement proposal as a banner ("Support × triage → inform; 92 % acceptance over 400 runs"); Confirm with preview.

**G · Channels**
32. **A day in Lucid Chat.** A Lucid Chat conversation (use Lucid Chat's bubble style from its mocks, lightly) with the system as a contact: a fork as a message with two reply pills, a glance image card (a rendered Horizon cut-out), a confirmation with Undo, the quiet daily line.
33. **Email and Slack.** Left: a decision email with the reply-to-decide block (three reply lines) and the signed-token note; right: the agent in a Slack channel: a proposal shown only to the speaker ("I heard a commitment: … · Make it a task · Not now"), the daily quiet line, a cited answer.

**H · Phone (390 × 844)**
34. **Phone Horizon.** Three needs-you cards full width (one visible, two peeking), the goal rings row, the place tiles strip (landmark, ring, heat), the dock with Talk.
35. **Phone place: Engineering.** Landmark header; programs as tiles with rings; the facade gallery; waits as three short lines; the breadcrumb chip.
36. **Phone product view and Fork.** Two phones side by side: the slider product view; the Fork with paths as swipeable panels and hold-to-confirm.
37. **Phone Refocus and Talk.** Two phones: sliders with the strip and the world cut-out re-forecasting in the header; hold-to-talk with the spoken question and the composed answer.

**I · Variants and legend**
38. **RTL and high contrast.** Engineering in Hebrew (Heebo) mirrored; the Horizon in Deep Blue high contrast (flat ground, one ink landmarks, visible edges).
39. **The world as a tree.** The list equivalent (role=tree) with landmarks as 16 px glyphs, rings as text, the spoken name shown for the focused row.
40. **Brand, landmarks, grammar.** The mark (from v0.1); the landmark library on the three grounds and in mono; the ring, light, heat, weather, flag, road, facade, ghost, haze legend; the component grammar families as a small reference strip.

## 4. Build rules

- One static page `docs/04-mocks/index.html` from a generator in `docs/04-mocks/gen/` (start from `v0.1/gen/`: keep `css.mjs` tokens, `mark.mjs`, the lab bar with theme / contrast / direction / device and URL params; replace the frames and the map code). Output path relative to the generator. The page must rebuild byte-identically.
- Lucide 1.59.0 pinned from jsDelivr; fonts from Google Fonts; nothing else external; no raster images (landmarks and facades are SVG).
- Every frame: a caption with what it shows and the use cases it realises (`docs/01` §A–§T) and the `docs/13` sections; a visible focal subject; the attention counts in the caption ("needs-you 3 · text 9 · numbers 5").
- Screenshots with Playwright into `docs/04-mocks/shots/`: every frame in Deep Blue and Sky Glass at desktop, the phone frames at 390 px, frame 38 as is, named `f<nn>-<theme>[-phone].png`, shrunk to 900 px wide.
- `docs/04-mocks/README.md` rewritten: how to view, the screen index with the attention counts, the vocabulary table (§2 above), the landmark library, what the lab switches do, and the §14 acceptance checklist of `docs/13` ticked per frame with any exceptions stated.
- Checkpoint: after the foundation and frames 1–8 are built and screenshotted, stop and report with the screenshot paths; continue only after the lead's reply.
- No git commands. Work only inside `docs/04-mocks/` (and its `gen/`, `shots/`); write nothing elsewhere.
