# The calendar — exploration (simulation)

> The running model of `docs/19-calendar.md` and `docs/20-calendar-product-plan.md` (T41), on the living map's data, model and vocabulary (`../living-map-2/`). One page, `index.html`, both datasets inlined. Online at https://totalmocks.belucid.chat/calendar/ . Built 2026-10-31 by the lead.

## What it shows

- **The day is a place in time.** Every day carries its harvest (what finished, as the pictures of what was made), what started, what got stuck, what got unstuck (resolved), what a finished thing enabled, what was decided, what was asked and still waits, who worked, the cost. Past days are settled (old ones quiet); today is live (the Now line); future days carry what is firm and what is projected, dashed.
- **Two zooms.** The hierarchy: company → place (a land, a project or a person, by the lens) → task (its life as moments across days); dive by clicking a place in a day, a lane, or a task. Time: quarter (rhythm: fill and one symbol), month (shape: pictures, counts, symbols, crew), week (reading: the day's things by place, the most important first, the rest counted), day (the hours with lanes). The wheel zooms time around the day under the cursor; `[` `]` step; `T` is today; `+` `−` zoom.
- **Three ways to draw it.** *Tiles* (days as tiles in weeks, the calendar people know, each tile built like the map's task tile), *River* (time left to right, a stream per place as thick as its activity, the marks riding it, the Now shoreline, the future as the dashed continuation), *Strata* (vertical time, today at the surface, the past as layers thick by activity below, the future as scaffolding above; drag or scroll to dig). One day index, one grammar, one panel; the chip switches and keeps the day, the zoom and the focus.
- **The grammar.** Finished (check + picture), started (sprout), stuck (barrier, coral), still (hourglass, amber), resolved (barrier lifted, green), enabled (route opened, green), decided (signpost), asked (flag), landmark (gate), projected (ghost, dashed), today (the Now line). The key is always visible and says what the fill means for the laid layer.
- **Layers.** Everything · Harvest · Problems · Decisions · People · Cost · Projected: one at a time; the fill of a day and the marks shown follow it.
- **The panel** on the right is the context of what was clicked: a day with every decision, ask (still waiting, with its age), finished thing (with its picture), resolution, enablement, start, stuck task, review, and who worked, in full; a future day with what is expected to finish and start, and why (the projection explained in a line); a task with its picture and its life as moments; a decision with what followed; an ask with its decide buttons. *Show on the map* opens the living map scrubbed to that day.
- **Lab:** theme, dataset, the first day of the week, the panel.

## Datasets and honesty

Lucid Chat (the real log, ten days of October 2026, about 150 changes a day) and the example company (generated, three years, with forecasts ahead). Resolved = blocked → in progress; enabled = the day a task's last upstream finished; still = computed at each day's end from the stale window; the real log's asks and projections are derived (projection: remaining size at the median pace per size unit of the last thirty days; planned work after what it waits on, in queue order); the example company's forecasts are carried by its data. No task text beyond its title, no real people beyond the owner's and the lead's roles.

## Files

- `index.html` — the page (about 2.4 MB). URL state: `?d=lucid|example&lens=dept|proj|people&viz=tiles|river|strata&zoom=quarter|month|week|day&day=YYYY-MM-DD&focus=<place|task>&layer=…&ws=0|1&panel=0&pt=deep|aqua|sky`.
- `src/cal.js` (the day index, projections, the three visualisations, the panel, the key, the chrome), `src/style.css` (on the living map's stylesheet); `gen/build.mjs` (inlines the living map's model and pictures and the v0.2 vocabulary), `gen/shoot.mjs` (Playwright stills; `node gen/shoot.mjs`, names for some, `--smoke`).
- `shots/` — stills (WebP), each reproducible from its URL.

## Limits

Meetings and people's time are not on this calendar (T-O16); the ring and the ledger are described in `docs/19` §7, not built; fronts are computed only for landmarks ahead; the phone layout is a first cut (one week of columns, or the strata).
