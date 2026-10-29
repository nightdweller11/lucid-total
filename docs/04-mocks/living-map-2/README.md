# The living map — second and third pass (simulation)

> The running model of `docs/16-living-map.md` §16–§17 and `docs/17-living-map-product-plan.md` §2.5, §2.18–2.21, on the v0.2 line of `docs/04-mocks/README.md`. One page, `index.html`, with the two datasets of the first pass inlined and enriched (projects, subtasks, asks, policies). Online at https://totalmocks.belucid.chat/living-map-2/ . The first pass stays at `../living-map/` as the reference point. Built 2026-10-29 by the lead after the owner's second review (T35) and rebuilt the same day around three levels after the third (T36), on the two studies in `docs/research/` (city-builder info layers; hex tiles and isometric layers).

## What it shows

- **Three levels.** *Land* (the company as places, on the v0.2 look: coasts, landmarks in rings, names, one problem icon with a count, the layer as a tint). *Area* (inside a land, its districts as cards on a grid: the done ring, tasks and open, what needs attention, a strip of task states, who leads; the ones that need attention first, the rest folded into one card). *Task* (the tasks of an area as large tiles: glyph, state, badge, title, progress or the layer's value, who and since, criteria; closer, subtasks, links, cost, projects; closer still, the facade). The zoom buttons step between the levels; the wheel moves within them; the level is named between the buttons.
- **Flat by default; isometric in the lab** (height = progress, compact tiles).
- **Problems float.** Asked, blocked, nothing moved, waiting in review: icons above the tile, never colour; at the sky one icon per land with a count. Open asks stand as flags; decided decisions gather into one plaque per square with a count (click lists them).
- **Layers.** Progress, Problems, Dependencies, Cost, Revenue (example company), People, Recency, Growth. A layer greys the city and raises a translucent slab of its colour on every tile, its height the value; Dependencies is an underground view (tiles flatten; roads read: dashed waits, flowing feeds, coral where the upstream is stuck). One at a time. The **key** at the start corner is always visible: the state swatches and the marks, and the laid layer's scale with its end words and the three places that lead it; *The whole grammar* opens the sheet.
- **Now.** The default. The panel at the end edge lists what needs attention in the place under the camera: needs a decision, stuck, nothing moved, waiting in review, landmarks, policies, decided, new and done since you last looked. Rows fly to and open their subject; rows can be dismissed and restored; the filters narrow by kind; *Here / All* sets the scope. The past is quiet: tasks done long ago dim.
- **Time is a tool.** *Time* (or `T`, or space) opens the rail: scrub, play, step; in the past the panel becomes the feed of the window with its own filters; *Now* brings you back. During playback important events appear as cards where they happened and fold into the map; the camera follows the young city.
- **A task over time.** Its view carries its **moments**: a strip of its life coloured by status with every change, move, the decision that opened it, its subtasks and its asks as ticks; a tick sets the map to that moment. With a task selected, the rail shows its life.
- **Projects.** The level above a task: a project divides into tasks, a task into subtasks, a task can belong to several projects. The project view (dock → Projects, or a project chip anywhere): done share by size, tasks, open, blocked, to decide, health; the asks that wait on it; a Gantt of every task; tasks by state; projects it shares tasks with; *Show on the map* (its tasks in full, the rest dimmed, its thread in gold), *Play from its start*.
- **Asks.** An open question or decision that waits for someone: its view says what waits on it and offers Decide yes / no / later (a mock: the flag comes down).
- **Policies.** More → Policies: the behavioural decisions in force (`docs/18-policies.md`), with scope, enforcement, who they apply to, since and by.
- **Four lenses**, the **since** layer with badges and heat, **tracing** a decision, the **lab** (theme, contrast, the quiet past, motion, dataset), **Talk** (*what needs me*, *what is stuck*, *show cost*, *dependencies*, *projects*, *policies*, *what changed since last week*, *timeline*, *play from the start*, *go to Oct 22*, *open the dispatcher*, *zoom in*, *sky glass theme*).

Keys: `+` `−` a level in or out, `0` the company · `T` timeline · space play/pause · ← → previous/next beat (a selected task's moments) · 1–4 lenses · `S` since · `F` panel · `P` projects · `L` grammar · `/` Talk · Esc clears.

## Datasets

The first pass's two datasets (`../living-map/data/`, see its README), enriched by `gen/enrich.mjs`:

| | Lucid Chat (real) | Example company (generated) |
|---|---|---|
| Projects | 54: phase × workstream families, the contracts sprint, the environment, mocks, exploratory passes, and the follow-up families of decisions (a decision opens a project); a follow-up belongs to both | 31: the nine project lands and the owner's decisions with five or more follow-ups |
| Subtasks | the real follow-up and change-request rows (`X-F3`, `X-CR1`) under their parent | generated: about a quarter of the size-4+ tasks divided into two or three (Design, Build, Test…) |
| Asks | **synthetic**, derived from the log's last state: what is in review waits for approval, what is blocked waits to be unblocked, the owner's instructions of the last two days are fresh | eight hand-written open asks (pricing, hiring, SOC 2 auditor, residency, the brand film, a contract, a load profile) |
| Policies | eight real ones, from Lucid Chat's `CLAUDE.md` and `docs/09` | six, generated |

No task text beyond a short title, no real people beyond the owner's and the lead's roles, and no secrets are in the data. Dismissals live in the browser (`localStorage`) until the product has accounts.

## Files

- `index.html` — the page (about 2.4 MB). URL state: `?d=lucid|example&lens=…&o=progress&t=…&since=…&time=1&panel=0&proj=<id>&quiet=0&filter=ask&scope=all&sel=<id>&trace=<decision>&pt=deep|aqua|sky&hc=1&reduce=1&play=1&x=&y=&k=`.
- `src/model.js` (state over time, projects, asks, policies, the attention list, moments, changes, events), `src/layout.js` (the growth engine, unchanged from the first pass), `src/render.js` (the isometric renderer: plates, prisms, slabs, roads, flags, plaques, problem pills, markers, hit test), `src/panel.js` (the Now panel and the feed, the tooltip, the in-place cards, the key), `src/ui.js` (the shell, zoom, the Time tool, the views, projects, policies, the grammar sheet, the lab, Talk, URL state), `src/style.css`.
- `gen/enrich.mjs` (projects, subtasks, asks, policies), `gen/build.mjs` (reads the first pass's data and icons, inlines the v0.2 vocabulary), `gen/shoot.mjs` (Playwright stills; `node gen/shoot.mjs`, names for some, `--smoke`).
- `shots/` — stills (WebP), each reproducible from its URL.

## Limits

Criteria, goals and done rules are still synthesised from the row kind; asks in the real log are derived, not recorded; a parent's progress is the model's, not a roll-up of its subtasks; Risk, Fork and Refocus are not in the simulation; hold-to-peek layers and policy gates on tasks are described in the docs, not built.
