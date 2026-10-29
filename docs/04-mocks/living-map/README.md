# The living map — simulation

> The running model of `docs/16-living-map.md` (concept) and `docs/17-living-map-product-plan.md` (plan), on the v0.2 line of `docs/04-mocks/README.md`. One page, `index.html`, with two datasets inlined: the **real** event log of Lucid Chat's build and a **generated** three-year company. Online at https://totalmocks.belucid.chat/living-map/ . Built 2026-10-28 (T33) and rebuilt 2026-10-29 (T34) by the lead.

## What it shows

- **A world that grows.** Every task is a tile on a hexagonal plot claimed next to its kin in birth order; districts and lands are the contiguous result; nothing is laid out by hand and nothing is pre-allocated (lay the **Growth** layer to see how the regions shifted). Scrub the rail or press play and the city grows: plots appear, rings fill as work is done, tiles light at done, blocked tiles go dark with a barrier, set-aside ones become parks. Decisions stand as **flags** on district squares (larger for the owner's); milestones rise as **landmarks**.
- **Tiles carry their task.** From land depth every plot shows its kind glyph; at district depth the glyph disc, the progress ring and the title; at street depth the facade card (the product's image, the criteria ring, the title, who and since). The edge is the state: dashed planned, green lit, coral blocked, teal in review.
- **Places with identity.** Every land and the largest districts carry a place marker: the landmark inside its progress ring, the name beneath, the laid layer's value as a chip.
- **Layers.** One row of named chips: Progress, Cost, Revenue (example company only), Growth, Terrain, Issues (hatched fronts over blocked work), Pipes (dependencies with flow, dashed when dry, a barrier at a clog), Power (decision lines), Load, Fresh, AI. A layer recolours the ground, the light, the air or the lines; floats its value under every marker in view; and opens the **legend card** with its meaning, its scale and the three places that lead it.
- **Since you last looked.** The *Since…* chip (or `S`, or "what changed since last week" in Talk, or the handle on the rail): changed tiles carry a badge (new, moved on, in review, lit, blocked, moved land, set aside), the rest dims, markers say "N changed", heat sits where most moved, the legend counts the badges. *Mark now as reviewed* sets the moment to the playhead.
- **The feed.** The column at the end edge tells what is happening in the place under the camera, in the window since you last looked: macro events at the sky (decisions, landmarks, storms, secessions, lands founded, big completions), a land's events over a land, everything over a district. Filters: All, Decisions, Lit, Stuck, New. A card flies to its subject and opens it. `F` folds it; on the phone it is a sheet.
- **Events in place.** During playback an important event appears as a card where it happened, holds a beat, and folds into its flag, landmark or building; the ledger pills count the rest per land. "Play from the start" lets the camera follow the young city until you move it.
- **Four lenses.** Departments, Projects, Products and People group the same tiles into different lands; switching walks every tile to its new plot. In the example company, Lucid Total begins as a district inside Platform and secedes into its own land in June 2026 with a causeway back to its parent.
- **Zoom is depth.** Sky (lands, city lights), land (districts, glyphs), district (rings, titles, flags), street (facades). Click a tile to open its **product view** (docs/13 §6): the product large, expected against actual under a split at the done share; the goal and the done rule; context chips; the criteria ring with named segments; the talk (its history and Lucid's reading); the roads in and out; a done building opens on what it changed. Click a land or district for its **place view** (landmark, subject, how the coast grew, districts, who is here, what is stuck, decisions here); click a flag for its **decision view**.
- **Tracing.** Pick a decision (the Decisions list, a flag, "trace L425"): the world dims to what grew from it, with lineage lines; "play from here" plays its consequences forward.
- **The grammar sheet.** *Legend* (or `L`) opens an infographic of the map's elements, depths, lenses, layers, badges and actions, with samples drawn by the renderer itself.
- **The lab.** Theme (Deep Blue, Aqua Dusk, Sky Glass), contrast, motion and the dataset; all of it is URL state, so every still is reproducible.
- **Talk.** The bar accepts sentences such as *show cost on products*, *what changed since last week*, *what is stuck*, *trace the Railway decision*, *play from the start*, *go to Oct 22*, *open the dispatcher*, *legend*, *sky glass theme*. It is a small parser standing in for the composer of `docs/13` §8.

Keys: space play/pause · ← → previous/next decision · 1–4 lenses · S since · F feed · L legend · / Talk · Esc clears.

## Datasets

| | Lucid Chat (real) | Example company (generated) |
|---|---|---|
| Source | `gen/extract.mjs` walks the git history of Lucid Chat's `docs/15-checklist.md` (1,186 commits) and `docs/09-decision-log.md`: every row's first appearance and every change of its status word; every numbered decision's first appearance | `gen/example.mjs`, seeded: 36 months, ten departments forming over time, four products, nine projects, fifteen people and four agent crews, 38 decisions, 9 milestones, one crisis (the dispatcher outage, November 2025), one secession, revenue after launch, a forecast beyond now |
| Span | 2026-10-18 → 2026-10-28 | 2024-01 → 2026-12 (now = 2026-10-28) |
| Size | 1,564 tiles, 346 flags (the lead's merge records are not flags), 2 landmarks | 1,676 tiles, 38 flags, 9 landmarks |
| Synthetic parts | cost (a rate per working day by model), rooms, criteria names, goals, done rules and facades (by row kind), the product and people lenses (by keyword and workstream), the talk (from the status history) | everything; no real people, no real money |

No task text beyond a short title, no names of real people and no secrets are in the data.

## Files

- `index.html` — the page (both datasets, the icon set, the landmark library, the facades and the Lucid mark inlined; about 2.1 MB). URL state: `?d=lucid|example&lens=dept|proj|prod|people&o=cost,pipes&t=2026-10-22T12:00&since=2026-10-26T12:00&feed=0&x=&y=&k=&sel=<id>&trace=<decision>&pt=deep|aqua|sky&hc=1&reduce=1&play=1`.
- `src/model.js` (time derivation, item state at any instant, changes between two moments, the event stream with importance, event sentences), `src/layout.js` (the hexagonal growth engine, hulls, visible state), `src/render.js` (the canvas renderer: coasts, contours, pipes, tiles by depth, flags, landmarks, fronts, heat, the DOM place markers), `src/feed.js` (the feed, the in-place cards, the legend card), `src/ui.js` (the shell, the rail, the views, the grammar sheet, the lab, Talk, URL state), `src/style.css` (the v0.2 rules).
- `gen/extract.mjs` (real history), `gen/normalise-lucid.mjs`, `gen/example.mjs`, `gen/build.mjs` (inlines the v0.2 vocabulary from `../gen`: tokens, landmarks, kinds, facades, the mark; converts the vendored Lucide icons to canvas paths), `gen/vendor/lucide-icons.json` (Lucide 0.552.0, ISC, fetched once), `gen/shoot.mjs` (Playwright stills; `node gen/shoot.mjs` for all, names for some).
- `data/` — the extracted and generated datasets; `shots/` — 57 stills (WebP), each reproducible from its URL (the playback ones from a scripted moment).

## Build

```
node gen/extract.mjs --repo ~/Projects/lucid/lucid > data/lucid-chat.json   # when Lucid Chat's history moved
node gen/example.mjs > data/example-co.json
node gen/build.mjs && node gen/shoot.mjs
node ../../../infra/mocks-site/publish.mjs                                   # republish the site
```

## Known limits (this is a model, not the product)

Criteria names, goals, done rules and the talk are synthesised from the row kind and the status history; the forecast ghost uses planned items only; the Risk layer, the week-difference view, Refocus on the map and the Fork are not in the simulation (`docs/17` §2 lists them); the attention validator is not run on it; Lucid Chat's "stuck" reads as work that stopped moving (its log rarely uses a blocked status); the importance of events is a fixed table, not learned.
