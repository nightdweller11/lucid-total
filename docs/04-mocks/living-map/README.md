# The living map — simulation

> The running model of `docs/16-living-map.md` (concept) and `docs/17-living-map-product-plan.md` (plan). One page, `index.html`, with two datasets inlined: the **real** event log of Lucid Chat's build and a **generated** three-year company. Online at https://totalmocks.belucid.chat/living-map/ . Built 2026-10-28 by the lead (T33).

## What it shows

- **A world that grows.** Every task is a building on a hexagonal plot claimed next to its kin in birth order; districts and lands are the contiguous result; nothing is laid out by hand. Scrub the rail or press play and the city grows: plots appear, walls rise as work is done, windows light at done, blocked buildings go dark with a coral knot, dropped ones become parks. Decisions stand as monuments on district squares; milestones rise as landmarks.
- **Time.** The rail along the bottom: the span, phase bands, decision ticks (gold, taller for the owner's), landmark ticks, the forecast beyond now, the playhead. Play, pause, step to the next decision, four speeds. A three-line ledger says what happened in the beat.
- **Four lenses.** Departments, Projects, Products and People group the same buildings into different lands; switching walks every building to its new plot. In the example company, Lucid Total begins as the *Internal tools* district inside Platform and secedes into its own land in June 2026 with a causeway back to its parent.
- **Ten overlays.** Progress (light tide), Cost (warm ground), Revenue (golden ground, brown where cost exceeds it; example company only), Issues (weather), Pipes (dependencies with flow particles, dry dotted pipes and clogs), Power (decision lineage; dark districts awaiting an owner decision), Load, Fresh, AI (teal where agents did the work), Terrain (height is remaining work). Overlays on the same channel replace each other.
- **Zoom is depth.** Sky (city lights), land (tiles), district (extruded buildings with lit windows) and street (labels, rooms through the windows). Click a building to open its cutaway: rooms (criteria), wall chart (its history), pipes in and out with their state, the monument it came from, and the actions (nudge, assign, approve, open, ask, trace, play from here). Click a district or a land for its own cutaway with a coastline strip of how it grew.
- **Tracing.** Pick a decision (the Decisions list, a monument, or "trace L425" in the bar): the world dims to what grew from it, with lineage lines; "play from here" plays its consequences forward.
- **Talk.** The bar accepts sentences such as *show cost on products*, *who is overloaded*, *what is stuck*, *trace the Railway decision*, *play from the start*, *go to Oct 22*, *open the dispatcher*. It is a small parser standing in for the composer of `docs/13` §8.

## Datasets

| | Lucid Chat (real) | Example company (generated) |
|---|---|---|
| Source | `gen/extract.mjs` walks the git history of Lucid Chat's `docs/15-checklist.md` (1,186 commits) and `docs/09-decision-log.md`: every row's first appearance and every change of its status word; every numbered decision's first appearance | `gen/example.mjs`, seeded: 36 months, ten departments forming over time, four products, nine projects, fifteen people and four agent crews, 38 decisions, 9 milestones, one crisis (the dispatcher outage, November 2025), one secession, revenue after launch, a forecast beyond now |
| Span | 2026-10-18 → 2026-10-28 | 2024-01 → 2026-12 (now = 2026-10-28) |
| Size | 1,564 buildings, 346 monuments (the lead's merge records are not monuments), 2 landmarks | 1,676 buildings, 38 monuments, 9 landmarks |
| Synthetic parts | cost (a rate per working day by model), rooms and sizes (by row kind), the product and people lenses (by keyword and workstream) | everything; no real people, no real money |

No task text beyond a short title, no names of real people and no secrets are in the data.

## Files

- `index.html` — the page (both datasets inlined, about 1.9 MB). URL state: `?d=lucid|example&lens=dept|proj|prod|people&o=cost,pipes&t=2026-10-22T12:00&x=&y=&k=&sel=<id>&trace=<decision>&pt=deep|aqua|sky&hc=1&reduce=1&play=1`.
- `src/model.js` (time derivation, item state at any instant), `src/layout.js` (the hexagonal growth engine, hulls, visible state), `src/render.js` (canvas renderer, overlays, LOD, labels), `src/ui.js` (chrome, rail, playback, ledger, cutaways, tracing, the command bar), `src/style.css`.
- `gen/extract.mjs` (real history), `gen/normalise-lucid.mjs`, `gen/example.mjs`, `gen/build.mjs`, `gen/shoot.mjs` (Playwright stills; `node gen/shoot.mjs` for all, names for some).
- `data/` — the extracted and generated datasets; `shots/` — 38 stills, each reproducible from its URL.

## Build

```
node gen/extract.mjs --repo ~/Projects/lucid/lucid > data/lucid-chat.json   # when Lucid Chat's history moved
node gen/example.mjs > data/example-co.json
node gen/build.mjs && node gen/shoot.mjs
node ../../../infra/mocks-site/publish.mjs                                   # republish the site
```

## Known limits (this is a model, not the product)

Playback follows the log at a fixed speed with no per-event minimum durations beyond the height tween; the forecast ghost uses planned items only; the Risk overlay, the difference view, Refocus on the map and the Fork are not in the simulation (`docs/17` §2 lists them); the attention validator is not run on it; Lucid Chat's "stuck" reads as work that stopped moving (its log rarely uses a blocked status).
