# Lucid Total — Mocks (v0.1, 2026-10-28)

**How to view:** open `index.html` in a desktop browser (it loads Sora, Figtree and Heebo from Google Fonts and Lucide 1.59.0 from jsDelivr, so it needs a network connection). The lab bar at the top re-renders every frame: **Theme** (Deep Blue · Aqua Dusk · Sky Glass; the page chrome follows, Sky Glass is the light theme), **Contrast** (Standard · High), **Direction** (LTR · RTL) and **Device** (Desktop · Phone). The same switches work as URL parameters, e.g. `index.html?pt=sky&hc=high&dir=rtl&dev=phone`. Screenshots of frames 1, 4, 17 and 28 in Deep Blue and Sky Glass and of frame 12 at 390 px are in `shots/`.

One self-contained static page (~960 KB, CSS inline, no external images). Frames are numbered; each caption says what the frame shows and which use cases (`docs/01`) and product-plan sections (`docs/02`, `docs/03`) it realises. Frames with their own theme or direction (10, 11, the brand tiles of 38) keep it whatever the lab bar says.

**What the lab switches do.**
- *Direction · RTL* mirrors every desktop and phone frame (rail on the right, the map terrain mirrored, labels placed from the right, directional icons flipped) and switches the navigation labels to Hebrew; the body text stays English, so this is a layout check. Frame 11 is the real Hebrew frame.
- *Device · Phone* renders each desktop frame as the responsive web app at 390 px: the rail becomes the bottom pill nav, side panels stack, grids collapse to one column, tables scroll, the map canvases scale down. It is an approximation of the responsive rules. The designed phone layouts are frames 12, 13, 22, 27 and 31.
- *Contrast · High* applies the high-contrast variant of the chosen theme (see Design-system rules).

## Screen index

| # | Frame | What it shows | Use cases · sections |
|---|---|---|---|
| **A** | **The map** | | |
| 1 | Z0 Company map, owner perspective | Domains as soft cells sized by open work (a weighted Voronoi treemap), heat where things moved today (with a "moved today" count, so colour is never the only signal), presence avatars with status rings, the goals horizon (3 goals with done share and forecast), the owner's two material decisions as large flags, a risk front over Compliance, the legend, the layers menu closed, the perspective chip. **Two embassies at the border**: Accounting firm (engaged · payroll) and Legal counsel (virtual · awaiting a reply on the DPA). | UC-A1 UC-A5 UC-A6 UC-P2 · §5.1 §4.10 · docs/03 §3–4 |
| 2 | Z1 Engineering, CTO perspective | Groupings as cells with micro-stats (done-share sparkline, due, lead), cluster pills by state, the "Europe launch" hull from EU data residency across the borders into Compliance and Marketing with "continues · 7" / "· 5" chevrons, neighbours cut off at the edge. | UC-A2 UC-A3 UC-E1 · docs/03 §3.3 §5 |
| 3 | Z1 Marketing, CMO perspective | The same company for Omer: Marketing centred, the Europe hull from the other side, roads into Engineering releases (critical road to the iOS 1.0 station), a blocked road (barrier) to the Compliance consent-texts approval, a budget chip. | UC-E1 UC-A3 UC-C5 · docs/03 §5 |
| 4 | Z2 Epic "Wave 71" | Cards along the state axis (Proposed · Ready · Doing · Review · Done), roads with a barrier on a blocked dependency, a weather front for a risk, the minimap, a selected card (P1-C-03) lighting its relations while the rest dims. | UC-A2 UC-A4 UC-B4 UC-B6 · docs/03 §4 |
| 5 | Z2 Wave 71 as line view | The same cell, rows grouped by state, all glyphs kept; Cards · Lines toggle. | §5.2 · docs/03 §4 |
| 6 | What-if: "Draft: Europe first" | The draft chip on, AI-hue ghosts (dashed outlines, arrows, date chips) over Z1, the change-set panel (23 priority boosts, $1,200/mo budget shift, 3 dates move, 2 people over capacity, 9 notified, what slips), Apply · Save draft · Discard, the "dates that move" strip. | UC-C1 UC-C2 UC-K3 · §6.2 §6.3 |
| 7 | Meeting perspective: "Beta readiness" | Meeting banner, the Private beta program centred (its parts in four domains), open decisions and risks as flags and fronts, the assistant capturing "Decided: Relay ships in beta" as a card with Confirm, an applied reversible assignment with Undo, a batched scope change. | UC-C6 UC-E3 · §7.8 · docs/03 §5 |
| 8 | Timeline layer | Groupings on a week axis with done share, gates as milestone lines, dependency lines (critical thick, blocked dashed coral), today; undated items listed beside, never faked onto the axis. | UC-A8 UC-B8 · §5.4 · docs/03 §3.9 |
| 9 | The map as a list (tree) | The list equivalent for screen readers and keyboard users: role=tree, levels, expanded state, the spoken name of the focused row, keys, flag filters. | docs/03 §9 · §5.11 |
| 10 | Z0 in high contrast | Frame 1 fixed to Deep Blue's high-contrast variant: flat ground, opaque cells and panels with visible edges, no blur, no heat glow (the counts carry it). | docs/03 §9 · Lucid docs/10 §9 |
| 11 | Z1 Engineering in Hebrew, RTL | Rail on the right, terrain mirrored, Hebrew labels in Heebo, "continues" chevrons pointing left, numbers and ids left to right inside their runs. | docs/03 §9 · §5.11 |
| 12 | Phone: Z0 with goals carousel | Large cells, no roads, short labels, tappable cluster pills, goals as a top carousel, recentre and list buttons, pill nav (Inbox · Map · My work · Chat · More). | docs/03 §8 · §5.10 |
| 13 | Phone: Z2 line view in a cell | Wave 71 as rows by state inside its cell, back chip as breadcrumb, Lines · Cards toggle. | docs/03 §8 · §5.2 |
| **B** | **Board, list, item** | | |
| 14 | Board: Private beta | Swimlanes by workstream, cards with glyph rows (kind, id, priority with reason, confidence; working line; blocked; waiting on a person; due; comments), a collapsed lane, Cards · Lines in the header and per lane. | UC-B1 UC-B5 UC-B6 · §5.2 |
| 15 | Board collapsed to lines | One row per item, same glyphs, lanes as groups. | §5.2 |
| 16 | List and table | Dense table with hairlines, priority score with factors, saved views, the column chooser open, 3 rows selected with the change-set preview bar. | §5.3 · UC-K4 UC-L1 |
| 17 | Item page: L489-F3, Expected vs Actual | Header, tabs, criteria as aligned rows (met · partly · not met · not checked) with evidence chips, the confidence roll-up, deviations, the reviewer's verdict, the assistant scoped to the item. | UC-B1 UC-B2 UC-A7 · §4.4 §5.9 |
| 18 | Item page: Comments | Thread before/during/after, "Apply to card" on Dana's comment #3, the assistant's feedback request to Yossi (question, options, Answer), history entry "Acceptance changed from comment #3 by Dana" with Undo. | UC-B3 UC-D5 UC-L1 · §4.5 |
| 19 | Item page: Dependencies | Both directions, the neighbourhood graph with the critical path to Gate 1 Alpha, a refused relation that would create a cycle. | UC-B4 · §4.3 §5.5 |
| 20 | Decision card (material, owner's inbox) | First line "Cost: $0 · Toil: none · reversible until…", question, two-sentence context, options with consequences, recommendation with citations, change set (openable as what-if), Decide · Ask · Snooze · Delegate; one of two. | UC-C3 UC-C1 · §6.1 §5.7 |
| 21 | Proposal card for a role holder | Noa rules on Omer's proposal: what accepting does, an overlap spotted by the assistant, Accept · Accept as subtask · Decline with reason · Ask more. | UC-C4 UC-C5 · §4.1 |
| 22 | Phone: item page and board as lines | Expected vs Actual stacked per criterion; the board as the phone's line view. | §5.10 §5.2 |
| **C** | **Inbox, people, agents** | | |
| 23 | Inbox (owner) | Decisions one at a time at the top, then feedback requests, envelopes, chores, mentions; each actionable in place with snooze and delegate; the morning briefing beside. | UC-C3 UC-B5 UC-D5 UC-G2 · §5.7 |
| 24 | My work (team member) | Noa's ranked queue with a reason line per item, waiting-on both ways (people, agents, a party), the load picture. | UC-E2 UC-E6 UC-E7 · §5.6 |
| 25 | Agents live | Each agent's working line, age, item, model, cost today, last state change; the stuck worker; the quiet briefing agent; the coordinator's change-only history drawer. | UC-B6 UC-D3 UC-D6 · §5.6 §7.7 |
| 26 | Person page, workload as help | Dana's page as Yossi sees it after Dana chose to share: the signal explained from items, worded as help, three concrete moves; capacity and time off. | UC-E4 UC-E7 · §11 |
| 27 | Phone: inbox | The phone's default home. | §5.10 · docs/03 §8 |
| **D** | **Chat, the embedded AI** | | |
| 28 | Full chat (desktop) | Threads, a streaming answer with citation chips (item, doc §, code file:lines, decision), a tool preview card (permission-class glyph, change set, the person's words, Confirm · Edit · Cancel), an inform-level result with Undo, the model chooser (Fast · Standard · Strongest · Fable) with running cost, "What this answer used". | UC-D1 UC-D2 UC-D6 UC-D7 UC-D9 · §7.2 |
| 29 | Chat scoped to an item, slash menu | The item page's right panel with /task /decide /remind /email /whatif /envelope. | UC-D9 · §7.2 §5.9 |
| 30 | Email draft card | Recipients from an audience query (14 testers, how each is reached), subject, body with per-person fields, "sent via belucid.chat mail and Lucid Chat", Send · Edit · Review recipients · Cancel. | UC-D4 UC-F2 UC-I2 · §8 |
| 31 | Phone: chat with voice | Hold-to-talk, a confirm card, a done line with Undo. | UC-D9 UC-C6 · §5.10 |
| 32 | Envelope | The "Send a secret" window opened from chat (recipients, label, masked paste field, expiry, one-time reveal, usage for rotation, Seal and send); the chat afterwards showing only "Envelope delivered to Coordinator"; the recipient's reveal window (reveal once, countdown, refuse, audit line). | UC-H1 UC-H3 · §9 |
| **E** | **Issues, incidents, settings, parties, brand** | | |
| 33 | Issues board (support) | Intake lanes New → Verified, channel glyphs, SLA timers (amber near, coral breached), the triage agent's suggestion (kind, severity, owner, duplicates, ack draft) with Accept, and the ask it proposes. | UC-F1 UC-F5 UC-N2 · §10 |
| 34 | Incident page | Severity, services, on-duty, timeline from the Railway alert to the fix, the status line on the map, post-incident follow-ups and a lesson. | UC-F3 UC-B11 · §10 |
| 35 | Settings: autonomy ladder and rights | Processes with their level (observe · suggest · confirm · inform · run), measured acceptance, runs, recommended next level; the rights matrix (decision kinds × roles incl. Party and Agent). | UC-C5 UC-L2 · §2.7 §2.4 · docs/00 §3.14 |
| 36 | Settings: notifications, connectors, models | Cadence and channel per event class, quiet hours, dedupe; GitHub, Railway, Email, Lucid Chat with status; model classes, budgets, kill switch. | UC-G3 UC-I1 UC-I3 UC-D6 · §8 §12 §13 |
| 37 | Sign-in, bootstrap mode | Owner secret; "Google SSO is task LT-0001". | UC-J1 · §13 |
| 38 | Brand and legends | The Lucid Total mark beside the Lucid mark at 16/20/24/32 px on each theme's ground, the app icon, the wordmark, one ink under high contrast; the kind-glyph legend with families; state, priority, due, confidence, criteria, permission-class and autonomy legends. | docs/00 §3.9 · §14 |
| 39 | Ask card and routing | ASK-017 born from four support issues (source chain issue → triage agent → ask), the assistant's summary and routing, Turn into task · Decide: no action (reason) · Needs more · Route to… · Make it a decision; a cross-domain ask from Marketing; the asker's view of its state. | UC-N1 UC-N2 UC-N3 UC-N6 · §4.9 |
| 40 | External participant view | The accounting firm signed in: rail reduced to Inbox · My items · Chat and their engagement, the compartment banner "You see: Finance · Payroll with Lucid" with what that means, the payroll chore with a sealed-upload envelope step, a comment thread with the company, the assistant scoped to the compartment; no map, no other domain. | UC-P1 UC-N4 · §4.10 §5.9b |
| 41 | Virtual party page | Legal counsel reached by email: "Virtual · reached by email", the correspondence sent and received on the company's behalf (drafted by the assistant, approved by Dana), what was extracted into items, the open ask with its deadline, linked items, "Invite to Lucid Total". | UC-P2 UC-P3 · §4.10 §5.9b |
| 42 | Settings: company stage | "Company stage: Founders" (two founders, focus) with Small team · Growing · Scaled, what the stage changes (home zoom, grouping depth, proactive agents, cadence, approvals), the system's proposal and signals, the home map at this stage vs the next. | UC-O1 UC-O2 · §2.8 · docs/03 §3.10 |

## Design-system rules applied

- **Tokens** are Lucid Chat's final Lucid Glass values (`docs/10` §3 after the contrast pass), copied as values, never linked: Deep Blue, Aqua Dusk, Sky Glass grounds (linear gradient + three blobs), dark-theme glass as the tint flattened over the ground's own scrim (Deep Blue `#0c2259` at .40/.45/.52, Aqua Dusk `#08323f` at .39/.53/.63), Sky Glass glass .58/.80/.88, the accent and its fill, the Lucid hue and inks, hold and block inks, `--k-*` control colours, `--p-l3fb` / `--p-edge`, and the mark stops `--mk-a → --mk-b`. High contrast is a variant of each theme (from the Lucid mocks' `data-hc="high"` blocks): flat two-stop ground, opaque surfaces, 1 px visible edges on every glass element, no blur, white (dark) or navy (light) text, 3 px focus rings, presence rings kept.
- **Glass**: ambient ground with three soft blobs; panels without frames, inner top highlight only; pills for inputs, chips, segmented controls, search, nav; 18–28 px radii on cards, panels and sheets; hairlines only in dense tables and settings rows. Text sits on L1 or above, never on the bare ground except headers.
- **Two hues with jobs**: the accent (blue) is the person's actions and selection (primary buttons, selected chips and rows, the selected card, today line); the Lucid hue (mint / violet / teal) is the AI (assistant bubbles, AI-made changes, what-if ghosts, working lines, autonomy levels, the AI mark). Amber = caution, waiting, held, overdue, near-SLA; coral = stopped, failed, blocked, breached. Nothing else uses these four hues. Green ("Good" family) marks done and met.
- **Visual first**: every button and chip carries an icon; every card and row leads with its kind glyph; state, priority, blocked, due and confidence are glyphs whose label appears on hover (title) and for screen readers (aria-label); at most three glyphs in a card header row (kind, priority, confidence).
- **A web management system**: left rail (Map · Inbox · My work · Boards · People & agents · Issues · Decisions · Chat · Settings; collapsible to icons with `[`), top bar with breadcrumb, perspective chip, what-if chip, search / command bar (⌘K), notifications, avatar; dense tables, side panels, split views, keyboard hints. On the phone: bottom floating pill nav (Inbox · Map · My work · Chat · More), full-screen pages, sheets.
- **The AI's mark vs the product's mark**: the assistant is drawn with the **Lucid mark** (the u → c ribbon, as in Lucid Chat, in the brand gradient inside a Lucid-hue disc, one ink as an action icon); the product is drawn with the **Lucid Total mark** (rail header, page header, sign-in, app icon). Agents (non-human actors as records) use the `bot` glyph in the Lucid hue.
- **Typography**: Sora 600 for titles and the wordmark, Figtree 400–700 for UI, Heebo for Hebrew; tabular numbers; ids in a monospace run isolated left to right.
- **RTL**: logical properties throughout; the terrain is mirrored, overlay labels placed from the inline start; directional icons mirror (chevrons, arrows, send, reply, undo); non-directional glyphs, the marks and numbers do not.
- **Accessibility**: every interactive element has an aria-label (glyphs are `role="img"` with a label), focus rings visible, the map is `role="application"` with keys in its label and a list equivalent (frame 9).
- **The map** is computed by the build step that produced this page: a power-diagram (weighted Voronoi) treemap inside a soft superellipse, cells inset and corner-rounded so borders read as terrain; groupings are a nested treemap inside their domain; overlaps are a soft convex hull of circles around the parts in each region; heat is a radial glow of the Heat family; risk fronts are hatched blobs in the Risk family; embassies sit on the outer edge with a dashed tether.

### Kind → glyph family

Families and hues are Lucid Chat's (`docs/10` §4a); each kind group takes one family, kinds inside a group differ by shape. Amber (Commerce), Stop red, the accent-blue "assertive" and the Lucid hue are left to their jobs.

| Group | Family (dark / Sky Glass hue) | Kinds (Lucide icon) |
|---|---|---|
| Build | Language sky `#4fc3ff` / `#1aa3e8` | task (`square-check-big`), story (`book-open`) |
| Defect | Heat orange `#ff8a3d` / `#f0722a` | bug (`bug`), incident (`zap`) |
| Customer | Coach warm pink `#ff6fae` | issue (`life-buoy`) |
| Human | Coach concise lime `#a3e635` / `#7cb518` | chore (`hand`), reminder (`bell-ring`), meeting (`users-round`) |
| Decide | Rules indigo `#7a8cff` | decision (`signpost`), proposal (`lightbulb`), ask (`message-circle-question`) |
| Direction | Clarity gold `#ffd23f` / `#e6b800` | goal (`target`), milestone / gate (`milestone`) |
| Risk | Sharp pink-red `#ff5c7a` / `#ea4c6c` | risk (`cloud-lightning`) |
| Resources | Pressure violet `#c56cff` | budget (`wallet`), account (`key-square`) |
| Learning | Drift lavender `#b39dff` / `#8f7ae6` | lesson (`graduation-cap`) |
| Secret and outside | Private slate `#a3b4cc` / `#6b7c93` | envelope (`vault`), party (`landmark`), engagement (`handshake`) |
| AI | Lucid hue (theme) | agent (`bot`); the assistant itself is the Lucid mark |

The cross-domain program hull ("Europe launch") uses the concise lime as a collection hue; decision flags on the map are the Decide indigo; embassies are slate.

### State, priority, due, confidence (shape first)

| Meaning | Glyph | Hue |
|---|---|---|
| Proposed · Ready · Doing · Review · Done | `circle-dashed` · `circle` · `circle-dot` · `scan-eye` · `circle-check-big` | muted · ink · accent · gold · green |
| Blocked (with the blocker named) · Waiting on a person · To verify | `construction` (barrier) · `hourglass` · `scan-search` | coral · amber · amber |
| Priority urgent · high · normal · low (factors on hover) | `chevrons-up` · `chevron-up` · `equal` · `chevron-down` | ink |
| Due · Overdue | `clock` · `clock-alert` | muted · amber |
| Expected vs Actual roll-up: all met · some partly · not met · not checked | `badge-check` · `contrast` · `circle-x` · `eye-off` | green · amber · coral · slate |
| Criterion met · partly · not met · not checked | `check` · `contrast` · `x` · `minus` | green · amber · coral · slate |
| Permission class read · reversible · irreversible · outbound · spend | `eye` · `undo-2` · `lock` · `send` · `coins` | gold · green · indigo · sky · violet |
| Autonomy observe · suggest · confirm · inform · run | `eye` · `lightbulb` · `hand` · `bell` · `play` | Lucid hue, filling with the level |

## Brand: the Lucid Total mark

- **Derivation**: the Lucid mark (the u → c ribbon, `LUCID_MARK_PATH` on the 24-unit grid) at 80 %, and its twin turned 180°; offset by 2.2 × 6.2 units so the c's arm of each meets the u of the other, the two close into **one continuous loop**. Lucid's stroke for clear communication turns back on itself and becomes a whole: the company, many parts, one motion. It keeps the ribbon's exact curves, so it reads as a sibling of the Lucid mark, and it has 180° symmetry rather than a reading direction, so it is never mirrored.
- **Rejected**: the ribbon held by an open ring. At 16–24 px it read as a check in a circle, which is the Done glyph of the product.
- **Colour**: one two-tone gradient across both ribbons, lower left → upper right, from the theme's brand stops (`--mk-a → --mk-b`: Deep Blue `#8dbaff → #aef8eb`, Aqua Dusk `#5cc4f5 → #c0b1f6`, Sky Glass `#005878 → #584885`), applied through a clip path so the twin does not invert it. Under high contrast: one ink (`currentColor`: white on the dark themes, navy on Sky Glass).
- **Sizes and uses**: 16 / 20 / 24 / 32 px (frame 38); the rail header tile (26 px on a glass tile), the page header (40 px), the sign-in (40 px), the app icon (38 px on the theme's ground in a 56 px rounded square). The **wordmark** "Lucid Total" is set in Sora 600 beside the mark (unlike Lucid Chat's wordmark, which is a fixed drawing; a drawn wordmark can follow once the mark is approved).
- **Source**: the mark is drawn inline in the page by a small script (`i[data-lucide="total-mark"]`) and statically in the brand frame; the geometry is the Lucid path with two transforms (`translate(10.9 8.9) scale(.8)` and `translate(13.1 15.1) rotate(180) scale(.8)`, each about the ribbon's centre).

## Data in the frames

The company is Lucid with the domains Engineering, Product, Design, Marketing, Compliance, Finance, People, Operations and Leadership; programs Private beta, Europe launch, iOS release 1.0, Gate 1 Alpha; tasks such as P1-C-03, L489-F3, ENV-STATUS-SITE-F6; agents Coordinator (Fable), Worker B and C (wave 71), the follow-up, briefing, triage and evidence agents; people Yossi (owner), Dana (compliance), Omer (marketing), Noa (engineering lead). External parties are fictional (Levi & Co. CPA, Cohen Legal with an `.example` address). No real phone number, email or secret value appears.

## Generator and follow-ups (lead, 2026-10-28)

- `index.html` is generated by `gen/build.mjs` (plain Node, no dependencies): `node docs/04-mocks/gen/build.mjs` rewrites `index.html`; the map cell layouts come from `gen/maps.mjs` and `gen/maps2.mjs`, so re-laying-out the map means editing those and rebuilding; small copy fixes may be made in `index.html` by hand, but rebuild before the next wave.
- Not yet drawn: membership rings for items in several groupings (`docs/03` §3.3) and the "shape of the company" view (UC-O3). Known overlap in Aqua Dusk between the AI hue and the Pressure/Drift families (as in Lucid Chat).
