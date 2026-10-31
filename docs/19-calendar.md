# Lucid Total — The Calendar (what it means to show time, and why)

> Written 2026-10-31 for T41 (`docs/12`). The living map (`docs/16`, `docs/17`) answers *where* things are and *what state* they are in; the Now panel answers *what needs me*. This document asks what it means to show the company on a **calendar**: what happened on a day, what will, who was where, what went wrong and what got unstuck; and how a person zooms through it. The requirements derived from it are in `docs/20-calendar-product-plan.md`; the exploration mocks are at `docs/04-mocks/calendar/` (online at https://totalmocks.belucid.chat/calendar/ ). The doctrine of `docs/13-experience.md` binds every screen described here.

---

## 1. Why a calendar at all

The map is the company as terrain. It is excellent at *where* and *how far*, and it carries time only as a tool (the rail, the since layer, playback). But the questions people actually ask every morning are about **when**:

- *What happened yesterday? What got done, what got stuck, what did the agents finish overnight?*
- *What is landing this week? What was promised for Friday, and is it still on course?*
- *When did this break, and when was it fixed? Who was working on what that day?*
- *What is coming: gates, decisions I owe, things that will finish if nothing changes?*
- *How did October go? Where did the effort actually go?*

In the real log of Lucid Chat, one day holds about a hundred and fifty state changes across ten workstreams: things started, finished, reviewed, blocked, decided. No person reads that as a list. A calendar that is built like the map, big and visual, with the day as its unit, is how a person sees a day's worth of a company in one look and dives to the one thing that matters.

The calendar is therefore not a scheduling tool and not a report. It is the **time view of the same world**: the same tasks, places, people, decisions, asks and landmarks as the map, arranged by when, with the same marks, the same pictures, the same panel. Clicking a day in the calendar and scrubbing the map's rail to that day are the same act.

## 2. The day is a place in time

The map's rule was: *a place has identity, and every place carries its summary inside its own shape*. The calendar's rule is the same, for a **day**:

| A land carries | A day carries |
|---|---|
| its landmark and name | its date, and its weekday as its character (a Monday is not a Saturday) |
| how much work lives in it (area) | how much happened in it (volume: the number of changes, the size of what finished) |
| its progress (light) | what finished that day (the day's **harvest**, as pictures) |
| what is stuck in it (problems as icons) | what got **stuck** that day, and what got **unstuck** (resolved) |
| the roads out (dependencies) | what a finished thing **enabled** (the roads it opened) |
| flags (decisions waiting) | what was **decided** that day, and what was **asked** (and still waits) |
| presence (who is there) | **who worked** that day, and on what |
| cost | what the day **cost** |

And, where the map has only the present, the calendar has three kinds of day:

- **A past day** is settled. Everything in it is a fact with a time and an actor. Old days are quiet (dimmed), as old finished things are quiet on the map.
- **Today** is live. It fills as the day goes; the Now line stands on it; what needs attention now is loudest here.
- **A future day** is a projection. It carries what is **firm** (a gate, a deadline, a decision scheduled, a landmark planned) and what is **projected** (what will finish or start if the pace holds), drawn as ghosts with a confidence that fades with distance.

## 3. Who uses it, for what

The calendar serves the four modes of `docs/13` §4 and these recurring questions. Each row names the level and zoom (§4) the view opens at.

| Question | Who | Opens at | What answers it |
|---|---|---|---|
| **What happened since I last looked?** | owner, lead, every morning | Company · Week, today at the right, yesterday loud | Yesterday's harvest as pictures; what got stuck and unstuck; what was decided; who worked; the one line "since yesterday" |
| **Is this week on course?** | owner, lead | Company · Week | The week's firm things (gates, promised dates) against what is projected to finish; a front where the projection lands after the promise |
| **What is coming?** | owner | Company · Month, today in the middle | The next weeks' gates and landmarks, the projected finishes of large things, the decisions that wait and their age |
| **How did the month go?** | owner, a lead, a stakeholder | Company · Month (past) | Harvest per day and per week; where problems clustered; the quiet days; cost per week |
| **When did this break and when was it fixed?** | anyone | Task · Month | The task's life as a line across days: started, blocked (coral), resolved, done; the people on it |
| **What did Noa do this week?** | the owner, Noa | Person · Week | Her days: what she finished, started, reviewed; her load per day; what she is projected to finish |
| **Where is the beta?** | owner | Project · Month | The project's days: its harvest, its stuck days, its gate, its projected end against the promised one |
| **What is happening right now?** | anyone | Company · Day (today) | The hours of today by place: who is working on what at this hour, what finished at 10:40, what got blocked at 14:00 |
| **Find the moment** | anyone (audit, retrospective) | Company · Quarter → Day | Zoom from a quarter of coloured days to the day, to the hour, to the moment |

The calendar is **not** for: assigning time slots, booking people, meetings with rooms. Those are a different product. If the company's meetings matter here, they arrive as a kind of thing on a day (a decision meeting is a fork with a time), never as the calendar's reason to exist (open question T-O16).

## 4. The three levels, twice

The owner asked for three levels of hierarchy, and for two kinds of zoom: a **logical zoom** (into the hierarchy, including into a day) and a **time zoom** (a longer or shorter period, past and future). They are independent axes; every combination is a designed view, never a scene shrunk or stretched (the map's lesson: *design each zoom level for its own information*).

### 4.1 The logical zoom: company → place → task

| Level | A day shows | Diving |
|---|---|---|
| **Company** | the whole company's day: volume, harvest, problems, resolutions, decisions, asks, crew, cost, by place | click a place in a day → that place's calendar |
| **Place** (a land, a project or a person, by the lens) | the place's day: its tasks finished, started, stuck, unstuck; its people; its share of the company's day | click a task → the task's calendar |
| **Task** | the task's day: its moments (state changes, asks, decisions, subtasks, the dependencies it freed), who touched it; its life drawn as a line across days | click a moment → the item view with the map at that moment |

The **lens** (by place · by project · by person) chooses what the middle level means, as on the map. A person is a place in time: her calendar is her days.

### 4.2 The time zoom: quarter → month → week → day → hour

| Zoom | The day's size | The day's content (company level) | Why this and not more |
|---|---|---|---|
| **Quarter** (13 weeks) | a small tile | its volume as fill, its problems as one icon with a count, today outlined, future days dashed with their expected count | a quarter is for rhythm and clusters: busy weeks, quiet weeks, a run of red days |
| **Month** (5–6 weeks) | a tile with room | the harvest as up to three pictures, the counts line (finished · started · stuck · decided), the attention as symbols with counts, the crew | a month is for the shape of the work: what came out, where it got stuck |
| **Week** (7 days) | a column | the day's things written out by place: finished (with pictures), started, stuck and unstuck, decided and asked, with who; the most important first, the rest counted | a week is for reading: this is what happened, in words |
| **Day** (24 hours) | the hours | lanes by place (or by task inside a place); every change as a card at its hour; presence as bands; the day's cost accruing | a day is for the moment: at 10:40 the build went green and freed three tasks |
| **Hour / moment** | an item | the item view, with the map scrubbed to that moment | the deepest zoom is the thing itself |

Both zooms work by the same gestures as the map: wheel or pinch zooms time around the day under the cursor; the segment jumps to a zoom; clicking a day dives to it; clicking a thing leads to the thing; the panel on the right is the context of what was clicked.

## 5. What is highlighted, and how (the grammar)

One channel, one meaning, the same as the map (`docs/16` §15):

| Thing | Mark | Colour | Notes |
|---|---|---|---|
| finished | the sealed check, and the **picture** of what was made | good (green) | the harvest; big at week, pictures at month, fill at quarter |
| started | sprout | lime | the day's new work |
| progressed / in review | pulse / eye | accent / ai | quiet unless asked for |
| **stuck** (blocked) | barrier | coral | a problem; counted at every zoom, named at week |
| **still** (nothing moved for a while) | hourglass | amber | computed at the day's end |
| **resolved** (unblocked) | barrier lifted, with a check | good | a problem that ended that day; always named, it is good news |
| **enabled** (a finished thing opened roads) | route opened | good | "done at 10:40; freed three tasks": the reason a day mattered |
| decided | signpost | rules (indigo) | the decision text at week; a count at month; a tick at quarter |
| asked (waits for someone) | flag | rules; the owner's in gold edge | on the day it was asked; carried forward on today with its age |
| landmark / gate | the gate | gold | firm dates ahead stand on their day |
| set aside | the set-aside glyph | quiet | never loud |
| projected | the same marks as ghosts, dashed | the mark's colour at half | with a confidence band that widens with distance |
| a front (projection lands after a promise) | weather front | amber | the only alarm the future raises |
| today | the Now line, the tile outlined | fg | the one live day |
| old days | dimmed | — | the past is quiet |

The **attention budget** holds: a day tile at month shows at most seven numbers; a week column names at most the top things and counts the rest; the panel holds the full lists. Problems are always icons, never colour alone.

## 6. The future: firm and projected

A future day is honest about what it knows.

- **Firm**: a gate or landmark with a date; a deadline set by a person; a decision scheduled; a planned start. Drawn solid.
- **Projected**: what will finish or start if nothing changes. For a task in progress: the remaining size at the pace its kind has shown (the median days per size unit of what finished recently), from today. For a task in review: the review window. For a planned task: after the things it waits on, in its queue order. Drawn as ghosts, dashed, with a band: the farther the day, the wider the band; past four weeks the projection is a fog, not a mark.
- **A front**: when a projected finish lands after a firm date that depends on it, the day of the promise carries an amber front, and the panel says why in one line ("the beta gate on Nov 14 waits on three tasks projected for Nov 18").
- Every projection is explainable in one line on hover ("at the pace of the last two weeks, done around Nov 4"), and the method is a platform setting, never a hidden heuristic.

The example company's data carries forecasts for its open work; the real log has none, so its projections are derived (and marked synthetic in the mocks).

## 7. Ways to draw it (five considered, three built)

The map taught us that the same data reads very differently drawn as cards, as a terrain, or as lettering. The calendar deserves the same exploration. Five directions, with what each answers best:

| | What it is | Best at | Weak at | In the mocks |
|---|---|---|---|---|
| **A · Days as tiles** | the grid people know (weeks as rows, days as tiles), where each day is a tile built like the map's task tile: cover, strip, facts; the tile redesigned at every time zoom | the glance and the month: "how did it go", "what is coming"; recognisable in a second | continuous time (a thing spanning days); hours | built, the primary |
| **B · The river** | time flows left to right; one stream per place (or person, or project), its thickness the activity; the marks ride the streams; the Now shoreline; the future as the stream's dashed continuation | rhythm and parallel work: who was busy when, where problems sat over time, what a project's weeks looked like; projections as flow | the single day; many lanes | built, the second |
| **C · The strata** | vertical time, today at the surface; the past as layers below, each day a layer as thick as what happened in it; the future as scaffolding above; dig down | the retrospective and the phone (it scrolls); "what did we build up to here"; density as depth | wide periods; horizontal space for lanes | built, the third, experimental |
| **D · The ring** | the seven days around today as a ring with the hours, now at the top | the glance on a watch or phone; the day's shape | anything beyond a week; reading | described only |
| **E · The ledger** | a list by day, newest first | search, audit, copy-paste | everything the doctrine is for | the instrument fallback, like the board; described only |

The recommendation: **A as the calendar people open**, **B as the way to see a place or a person over time** (it is also the natural home for projections), **C as the phone's calendar and the retrospective**. All three share the day index, the marks, the pictures, the zooms and the panel; a person switches between them with one chip. The owner chooses which to carry forward (T-O17).

## 8. Interaction

- **Zoom**: wheel or pinch over the calendar zooms time around the day under the cursor; the segment Quarter · Month · Week · Day jumps; `[` `]` step the period; `T` jumps to today.
- **Dive**: click a day → the day's context in the panel and, from quarter or month, the week centred on it; click a place chip inside a day → that place's calendar; click a thing → the thing. The crumb at the top says where you are (company › place › task) and walks back.
- **Lens**: by place · by project · by person, as on the map.
- **Layers**: Everything (default) · Harvest · Problems · Decisions · People · Cost · Projected. One at a time; the key says what the fill means.
- **The panel** on the right is the context of what was clicked: a day with its full lists (decided, asked, finished with pictures, resolved, enabled, started, stuck, in review, people, cost); a future day with its firm and projected things; a thing with its view. *Today* returns to today's context.
- **Bridge to the map**: the calendar's selected day is the map's `t`; "Show on the map" opens the map at that moment with the day's changes lit.
- **Phone**: one week, vertical (the strata direction), one day expanded; the panel becomes the sheet.

## 9. Data, and what is honest

- Every state change in both datasets has a time; the real log's times are real (the decisions' too); the people are the owner, the lead and the agents by model name.
- **Asks** in the real log are derived (what is in review waits for approval; what is blocked waits to be unblocked); **projections** are derived for the real log and carried by the data for the example company; both are marked synthetic in the mocks.
- **Resolved** is the blocked → doing transition; **enabled** is computed from dependencies: the day a task's last upstream finished.
- **Still** is computed at each day's end from the stale window.
- In the product, every transition is an event with time, actor and cause; the calendar is a view over the event log, never a second record.

## 10. Lead decisions and open questions

**Lead decisions (T41):** the day is the unit, and the hour only inside a day; a quarter is the longest period (a year is a layer on the map, not a calendar); the week starts on Sunday for this owner and is a setting; three visualisations built on one index and one grammar, two described; projections use the median pace per size unit of the last thirty days of finished work, and fade past four weeks; the Now list's caps do not apply to a day's context in the panel.

**For the owner:** T-O15 week start and working days (Sunday–Thursday for Israel?) as a market setting; T-O16 whether meetings (from a calendar integration) belong on this calendar as a kind of thing; T-O17 which of the three visualisations to carry forward, and whether the phone takes the strata.
