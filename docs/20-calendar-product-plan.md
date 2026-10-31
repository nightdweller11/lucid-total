# Lucid Total — The Calendar: product plan (requirements)

> Derived from `docs/19-calendar.md` (T41). Requirements are `CAL-<area>-<n>`; each has an acceptance line. The mocks that explore them are at `docs/04-mocks/calendar/` (online `/calendar/`), on the living map's data and vocabulary (`docs/04-mocks/living-map-2/`). Platform settings named here are layered, versioned settings, never hard-coded (the Lucid rule).

## 1. The day (CAL-D)

| Id | Requirement | Acceptance |
|---|---|---|
| CAL-D-1 | A day is the calendar's unit. For a scope (company, place, task) a day carries: volume, the harvest (what finished, with pictures), what started, what got stuck, what got unstuck (resolved), what a finished thing enabled, what was decided, what was asked and still waits, who worked, the cost. | The day index for both datasets yields every field; a reviewer reads one day of the real log in the week view and names what finished, what got stuck and who worked within ten seconds. |
| CAL-D-2 | Three kinds of day: past (settled, old ones quiet), today (live, the Now line), future (firm and projected). | Each kind is visibly different at every zoom; today is found in under two seconds. |
| CAL-D-3 | The weekday is the day's character: weekends and non-working days are drawn as such; the week starts on the market's first day (setting, default Sunday). | Changing the setting re-lays the grid; non-working days are visibly quieter. |

## 2. The logical zoom (CAL-H)

| Id | Requirement | Acceptance |
|---|---|---|
| CAL-H-1 | Three levels: company → place (land, project or person, by the lens) → task. Each level's day is designed for its own content; a dive from a day leads to the same day at the next level. | Company › Platform & infra › a task: three views of the same date with different content; the crumb walks back. |
| CAL-H-2 | The task level draws the task's life as a line across days (planned, in progress, blocked, in review, done) with its moments; a moment opens the item view with the map at that moment. | A task's calendar shows its blocked days in coral and the day it was resolved. |
| CAL-H-3 | The lens (place · project · person) chooses what the middle level means; a person's calendar is her days. | The same week by place and by person reads differently and both are right. |

## 3. The time zoom (CAL-T)

| Id | Requirement | Acceptance |
|---|---|---|
| CAL-T-1 | Four periods, each a designed view: quarter (rhythm), month (shape), week (reading), day (hours). Never a scene shrunk. | At every period the tile or column is legible at 1440 px wide with the panel open. |
| CAL-T-2 | Wheel or pinch zooms time around the day under the cursor; the segment jumps; `[` `]` step the period; `T` goes to today. | Zooming from quarter to day keeps the day under the cursor in place. |
| CAL-T-3 | The day view shows the hours with lanes (places at company level, tasks at place level), every change as a card at its hour, presence as bands. | The real log's busiest day reads as a day of hours, not a list. |
| CAL-T-4 | Past and future both extend as far as the data: a quarter can be half past, half ahead. | The month view with today in the middle shows projected days to the right. |

## 4. The grammar (CAL-G)

| Id | Requirement | Acceptance |
|---|---|---|
| CAL-G-1 | One channel, one meaning, the map's marks: finished (check + picture), started (sprout), stuck (barrier, coral), still (hourglass, amber), resolved (barrier lifted, green), enabled (route opened, green), decided (signpost), asked (flag; owner's gold-edged), landmark (gate), projected (ghost, dashed), front (amber), today (Now line). | The key lists every mark; no second meaning for a colour. |
| CAL-G-2 | Problems are icons with counts at every zoom, named at week; resolutions and enablements are always named: good news is loud. | A resolved task is visible at month as a green mark and at week by name. |
| CAL-G-3 | The attention budget holds per tile and per column: at most seven numbers, the most important things named, the rest counted, the full lists in the panel. | The attention check passes on each mock frame. |
| CAL-G-4 | Pictures mean something: the harvest shows the artifact pictures of what finished (the map's picture grammar). | A month tile shows the day's documents, screens and runs, not icons. |

## 5. The future (CAL-F)

| Id | Requirement | Acceptance |
|---|---|---|
| CAL-F-1 | Firm things (gates, landmarks, deadlines, scheduled decisions, planned starts) stand solid on their day; projected things stand as ghosts with a confidence band widening with distance; past four weeks projections fade to fog. | Firm and projected are told apart at a glance. |
| CAL-F-2 | Projection: in-progress by remaining size at the recent median pace per size unit (setting: window, default thirty days); in review by the review window; planned after what it waits on, in queue order. Explainable in one line on hover. | Hover on a ghost says "at the pace of the last two weeks, done around Nov 4". |
| CAL-F-3 | A front: when a projected finish lands after a firm date that depends on it, the promised day carries an amber front and the panel says why. | The example company's gate shows a front when its tasks slip. |
| CAL-F-4 | Decisions that wait are carried forward on today with their age, never lost on the day they were asked. | An ask nine days old appears on today's context with "waits 9 d". |

## 6. People (CAL-P)

| Id | Requirement | Acceptance |
|---|---|---|
| CAL-P-1 | Every day carries who worked (people before agents) and how much; the People layer makes presence the fill. | The crew of a day is three avatars and a count at month; the full list at week and in the panel. |
| CAL-P-2 | A person's calendar (person lens, place level) shows her days: finished, started, reviewed, stuck; her projected finishes. | Noa's week in the example company reads as her week. |

## 7. The visualisations (CAL-V)

| Id | Requirement | Acceptance |
|---|---|---|
| CAL-V-1 | **Days as tiles**: weeks as rows, days as tiles built like the map's task tile (cover, strip, facts), redesigned per period: quarter (fill and one icon), month (pictures, counts, symbols, crew), week (columns with things named by place), day (hours with lanes). | Built in the mocks on both datasets. |
| CAL-V-2 | **The river**: time left to right; one stream per place (or person, or project), its thickness the activity; marks ride the streams; the Now shoreline; the future as the dashed continuation with ghosts. | Built in the mocks; a place's quarter reads as rhythm. |
| CAL-V-3 | **The strata**: vertical time, today at the surface, the past as layers thick by activity, the future as scaffolding above; the phone's calendar. | Built in the mocks; scrolls on the phone. |
| CAL-V-4 | The ring and the ledger are described (`docs/19` §7); the ledger is the instrument fallback, never a home. | — |
| CAL-V-5 | All visualisations share one day index, one grammar, one panel and one key; a person switches with one chip and keeps the day, the zoom and the focus. | Switching Tiles → River keeps the same week and place. |

## 8. Interaction and context (CAL-I)

| Id | Requirement | Acceptance |
|---|---|---|
| CAL-I-1 | Clicking anything leads to the thing: a day → its context in the panel (and the week from quarter or month); a place chip → the place's calendar; a thing → the thing; *Today* returns. | Twenty decisions on a day are all listed in the panel. |
| CAL-I-2 | The panel's day context lists in full: decided, asked (and still waiting), finished (with pictures), resolved, enabled, started, stuck, in review, people, cost; a future day: firm, projected, decisions waiting with age. | No caps in a day's context. |
| CAL-I-3 | Layers: Everything · Harvest · Problems · Decisions · People · Cost · Projected, one at a time, the key saying what the fill means. | Each layer changes the fill and the marks shown. |
| CAL-I-4 | Bridge to the map: the selected day is the map's moment; *Show on the map* opens the map there with the day's changes lit. | A day selected in the calendar opens the map scrubbed to it. |
| CAL-I-5 | The map moves: the calendar pans and zooms smoothly; glass stops blurring while it moves (the map's rule). | No dropped frames while zooming a quarter on a laptop. |

## 9. Data (CAL-X)

| Id | Requirement | Acceptance |
|---|---|---|
| CAL-X-1 | The calendar is a view over the event log (every transition with time, actor, cause); it never holds a second record. | The mocks' day index is built only from transitions, decisions, asks and milestones. |
| CAL-X-2 | Derived facts are computed, not stored: resolved (blocked → doing), enabled (last upstream finished), still (stale window at the day's end), projections. | Each has a one-line explanation in the key. |
| CAL-X-3 | Synthetic data in the mocks is marked (the real log's asks and projections; the example company's generated people). | The lab says what is synthetic. |

## 10. Phone (CAL-M)

| Id | Requirement | Acceptance |
|---|---|---|
| CAL-M-1 | The phone shows one week vertically (the strata direction) with one day expanded; the panel is the sheet; the day view is the hours. | The 390 px frame reads without horizontal scroll. |
