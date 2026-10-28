# Lucid Total — Mocks v0.2 (2026-10-28)

The company operating system, drawn from the experience doctrine (`docs/13-experience.md`) and the brief (`BRIEF-v0.2.md`). v0.1, a management console with a map inside it, is archived in `v0.1/` for comparison only.

**How it is used.** People never assemble or arrange the interface: they click, type or speak (Talk), and the AI composes every view from the component library. The library grows over time (controls, layouts, visualisation mechanisms, and images and generated images as a family of their own): when a request needs something the library lacks, the composer proposes a component, it is built, reviewed in every theme and direction, and installed (`docs/13` §8.4).

## How to view

**Online:** https://totalmocks.belucid.chat (the gallery), https://totalmocks.belucid.chat/map-study/ (the map study), https://totalmocks.belucid.chat/v0.1/ (the archived first wave); republished with `node infra/mocks-site/publish.mjs` (`infra/mocks-site/README.md`).

Locally: open `index.html` in a desktop browser. It loads Sora, Figtree and Heebo from Google Fonts and Lucide 1.59.0 from jsDelivr, so it needs a network connection; everything else is inline SVG and CSS (about 4.3 MB). Each frame is drawn at its real size (1440 × 900 desktop, 390 × 844 phone) and scaled to fit the window. Every caption says what the frame shows, its focal subject, its attention counts (needs-you · text above body size · numbers), the use cases (`docs/01`) and the doctrine sections it realises.

**The lab bar** (also URL parameters, e.g. `index.html?pt=sky&hc=high&dir=rtl&dev=phone`):
- **Theme** (`pt`): Deep Blue · Aqua Dusk · Sky Glass. The page and every frame follow it; frames with a fixed theme (38 bottom, the grounds of 40) keep theirs.
- **Contrast** (`hc`): Standard · High. High contrast is a variant of the theme: a flat ground, opaque surfaces, visible edges, landmarks and rings in one ink, no blur and no glow.
- **Direction** (`dir`): LTR · RTL. Mirrors every frame (the world, the dock, the paths); landmarks, marks and numbers are not mirrored. Frame 38 top is the real Hebrew frame and stays RTL.
- **Device** (`dev`): Desktop · Phone. Phone shows the *designed* phone layout wherever a moment has one (frames 1, 2, 5, 6, 8, 12, 14 and 19 switch to the layouts of frames 34–37); the other frames stay desktop on purpose, because the phone never shows a shrunk desktop (`docs/13` §10).

## Screen index

Counts are measured by the attention check (`node gen/shoot.mjs --check`, below), in Deep Blue, LTR, desktop; for two-screen frames the busier screen is counted. The limits: needs-you ≤ 3, text above body size ≤ 12 on every frame, numbers ≤ 7 on glance frames (other frames carry numbers only where they change what the viewer does: axis ends, dates, costs, ids).

| # | Frame | Focal subject | Counts | Use cases · doctrine |
|---|---|---|---|---|
| **A** | **Horizon and the world** | | | |
| 1 | Horizon, owner, morning (glance) | the three cards that need Yossi | 3 · 4 · 4 | UC-A1 UC-A5 UC-Q8 · 13§3–4 |
| 2 | The company world, owner | the company as one world | 2 · 6 · 0 | UC-A1 UC-A3 UC-A6 UC-Q2 UC-P2 · 13§5 |
| 3 | The same world, CMO perspective | Marketing and its campaigns | 0 · 7 · 6 | UC-E1 UC-A3 UC-Q5 · 13§5.5 |
| 4 | Zoom reveal (three stills) | Engineering through three depths | 0 · 3 · 0 | UC-A2 UC-Q2 · 13§5.2 |
| 5 | Engineering, CTO perspective | Private beta | 0 · 8 · 4 | UC-A2 UC-A3 UC-Q5 · 13§5, §8.6 |
| 6 | Private beta · Wave 71 | the critical road to Gate 1 Alpha | 0 · 5 · 5 | UC-A4 UC-A7 UC-B4 UC-Q3 · 13§5.3 |
| 7 | The board as an instrument | the board sheet | 0 · 1 · 5 | UC-B1 UC-B5 · 13§9 |
| **B** | **Products** | | | |
| 8 | Product view: a screen | the screen, expected against actual | 0 · 4 · 7 | UC-B1 UC-B2 UC-B3 UC-Q3 · 13§6 |
| 9 | Product view: an analysis | the measured curve against the budget | 0 · 4 · 20 | UC-B2 UC-Q3 · 13§6 |
| 10 | Product view, done: implications first | the ripple of a finished item | 0 · 2 · 7 | UC-Q4 · 13§6 |
| 11 | Product view: a chore | the checklist ring against the account | 0 · 4 · 4 | UC-B5 UC-H1 UC-P2 · 13§6 |
| **C** | **Decisions** | | | |
| 12 | The Fork | the lit path and its consequence | 1 · 4 · 16 | UC-R1 UC-C3 · 13§7.1 |
| 13 | Futures | Europe first, the lit future | 1 · 4 · 4 | UC-R3 · 13§7.1 |
| 14 | Refocus | Compliance, where effort flows | 0 · 6 · 16 | UC-R2 UC-K3 · 13§7.2 |
| 15 | A small change | the dragged date and its strip | 1 · 2 · 10 | UC-R5 · 13§7.2 |
| 16 | An ask as a small fork (glance) | the ask and its three replies | 1 · 2 · 1 | UC-N1 UC-N2 · 13§12 |
| **D** | **Meetings and daily use** | | | |
| 17 | The Table: "Beta readiness" | the captured decision landing on the world | 0 · 6 · 2 | UC-R4 UC-C6 · 13§4 |
| 18 | Minutes as a scene | the three decisions | 0 · 4 · 7 | UC-R4 · 13§12 |
| 19 | Quick status (glance) | the sentence and the beta ring | 0 · 2 · 3 | UC-Q1 UC-A4 UC-T4 · 13§12 |
| 20 | Re-composing ("just the money") | the beta's money | 0 · 6 · 11 | UC-Q1 UC-Q5 · 13§8.3 |
| **E** | **Aspects and infographics** | | | |
| 21 | Delivery aspect | the three goals' forecasts | 0 · 9 · 12 | UC-Q5 UC-A5 · 13§8.6 |
| 22 | Money aspect (founders) | the runway line | 0 · 5 · 22 | UC-Q5 · 13§8.6 |
| 23 | People aspect | Noa's load and the help offered | 0 · 2 · 3 | UC-E4 UC-E7 · 13§8.6 |
| 24 | Customers aspect | the intake flow | 0 · 4 · 13 | UC-F1 UC-F5 · 13§8.6 |
| 25 | Infographic: the quarter for the board | the quarter's headline | 0 · 4 · 2 | UC-Q6 · 13§8.5 |
| 26 | Infographics view | the request in Talk | 0 · 1 · 6 | UC-Q6 UC-Q7 · 13§8.5 |
| **F** | **The system** | | | |
| 27 | The System place | scene, its front and the repair | 0 · 10 · 2 | UC-S1 UC-S2 · 14§2 |
| 28 | A repair in progress | the session and its evidence | 0 · 1 · 3 | UC-S3 · 14§4 |
| 29 | AI processes | the stopped importer | 0 · 1 · 26 | UC-S5 · 14§6.1 |
| 30 | Settings → Models | the Fable decision card | 1 · 5 · 13 | UC-S6 · 14§7.3 |
| 31 | Trust map | the Support advancement proposal | 1 · 6 · 4 | UC-S7 · 14§8.3 |
| **G** | **Channels** | | | |
| 32 | A day in Lucid Chat | the fork and its reply | 1 · 1 · 18 | UC-T1 · 15§2, §5 |
| 33 | Email and Slack | the reply-to-decide block | 2 · 2 · 19 | UC-T2 UC-T3 · 15§2.3, §5.1 |
| **H** | **Phone (390 × 844)** | | | |
| 34 | Phone Horizon (glance) | the first card | 3 · 4 · 2 | UC-A1 UC-Q8 · 13§10 |
| 35 | Phone place: Engineering | Engineering's programs | 0 · 1 · 3 | UC-A2 UC-Q2 · 13§10 |
| 36 | Phone product view and Fork | the slider; the lit path | 1 · 3 · 10 | UC-R1 UC-Q3 · 13§10 |
| 37 | Phone Refocus and Talk | the sliders; the composed answer | 0 · 0 · 9 | UC-R2 UC-T4 · 13§10 |
| **I** | **Variants and legend** | | | |
| 38 | RTL and high contrast | the mirrored programs; the three cards | 3 · 4 · 4 | UC-Q2 · 13§11 |
| 39 | The world as a tree | the focused row | 0 · 1 · 18 | UC-A1 · 13§11 |
| 40 | Brand, landmarks, grammar | the reference sheet | 0 · 4 · 0 | 13§5, §8.2 |

## The vocabulary

| Element | How it is drawn |
|---|---|
| **Place** | A region of the terrain with a name (Sora 600), a subject (one sentence on hover), a stable hue, a landmark and a ring. On the terrain the landmark stands free inside its ring at 1.5× the tile size, in the place's hue at 80 %; in tiles, cards and on the phone it sits on a glass disc. Sub-places are faint inner contours (12–18 % ink) so zooming reveals rather than replaces. |
| **Ring** | The one invariant meter: done share in the place's hue (3 px, 6 px when large), the remainder at 18 % ink, the forecast tick outside. In Refocus and on paths the ring carries a forecast range (a fan) in the Lucid hue, and the tick stays as the base plan. Criteria rings are segmented: met (green), partly (amber), open (ink). |
| **Light** | A place's ground brightens with its done share (+0 to about +8 % L). |
| **Heat** | A soft warm halo with two faint rings where things moved in the last day; never a count. |
| **Weather** | A risk front: a hatched, feathered blob in the Risk hue; its reason on hover. |
| **Flag** | A banner in Rules indigo; material forks are larger banners with a two-word label. |
| **Road** | A dependency between buildings or places; the critical road 3 px; a blocked road broken by a barrier glyph (coral only if a date is breached). |
| **Building and facade** | A rounded building with a 1 px edge holding the product's own image (a screen pair with glass panels, a chart, a document cover, a build badge, a code change, a campaign visual, a landing page, an account, an envelope). Expected: the facade at 45 % with a dashed edge. Built: 100 % with the criteria ring at the top-end corner. Done: a green edge. Items without a product are small kind-glyph buildings. |
| **Embassy** | A round marker at the coast with the party's glyph, tethered by a dashed line to the place it engages; an amber ring when we wait on them. |
| **Presence** | 24 px avatars with a status ring. Agents say they are agents (bot glyph, Lucid hue) and have four states only: working (green ring), waiting (amber), stopped (coral), idle (no ring). |
| **Ghost** | Dashed outline in the Lucid hue with an arrow from where something is now. |
| **Haze** | Confidence as a translucent veil; less confidence, thicker haze. |
| **Path (decision)** | A curved road leaving the fork; the lit (recommended) path glows in the accent and ends in its consequence panel: the ring with its range, the date on the road, who is loaded, the risk, a published confidence. DACI avatars (driver, one named approver, contributors, informed) sit with the question. |
| **Transparency strip** | One line of glyph-led fragments separated by dots under Refocus. |
| **Needs-you card** | 320 × 200 glass card: a glyph, a one-line ask, one visual, two replies as pills. |
| **Shell** | The dock of five glyphs (Horizon · World · Me · Talk · More), folded at the start edge (bottom on the phone), labels on hover; Talk, the floating command bar with the Lucid mark, the slash and the mic; the breadcrumb chip. Nothing else is persistent. |

**Charts** follow the `dataviz` method: each is headed by its finding as a sentence, the current value sits above the trend, marks are thin, axes are hairlines, labels sit at the ends, and a legend appears for two or more series. Colours were run through the skill's validator against the panel surfaces of each theme: the Market series (`#d79bff` dark, `#a94ae6` Sky Glass), the Delivery ordinal ramp (sky, three steps per theme) and the AI-class ramp (the Lucid hue, three steps per theme) all pass. Amber and coral appear only for over-budget, waiting and breached states.

## The landmark library

Nineteen monochrome silhouettes on a 48-unit grid, 2 px stroke, each under 24 path commands (checked in `gen/landmarks.mjs`). Landmarks are drawings of the subject, never emoji and never Lucide icons.

| Landmark | Subject | | Landmark | Subject |
|---|---|---|---|---|
| Skyline | Engineering | | Summit | Leadership |
| Workshop | Product | | Beacon | Support |
| Loom | Design | | Rocket | Launch or program |
| Harbour | Marketing | | Flask | Research and evals |
| Bridge | Sales and partnerships | | Scroll | Legal |
| Lighthouse | Compliance | | Tower | System |
| Vault | Finance | | Satellite | AI |
| Greenhouse | People | | Stall | Store release (added) |
| Gears | Operations | | Keep | Data residency (added) |
| | | | Gate | Milestone or gate (added) |

## Acceptance (`docs/13` §14), per frame

Columns: 1 focal subject named in two seconds · 2 at most three things need the viewer · 3 every place has a landmark, a name and a ring · 4 every item with a product shows it · 5 every decision shows its consequence drawn · 6 no section rail, no column-of-cards home, no table as an answer · 7 attention budget. Criterion 8 (parity with Talk) cannot be shown in static mocks; frames 19, 20 and 26 show scenes reached by asking.

| # | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| 1 | ✓ | ✓ | ✓ (far places show landmark and ring without a name; names only where legible) | ✓ | n/a | ✓ | ✓ (4 numbers on a glance screen, ≤ 7) |
| 2 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 3 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 4 | ✓ | ✓ | ✓ (the faded places in the first still carry no name) | ✓ | n/a | ✓ | ✓ |
| 5 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 6 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 7 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ (the board is the one instrument) | ✓ |
| 8 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 9 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 10 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 11 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 12 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 13 | ✓ | ✓ | ✓ (the three small worlds carry no names at thumbnail size) | ✓ | ✓ | ✓ | ✓ |
| 14 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 15 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 16 | ✓ | ✓ | ✓ | ✓ | ◐ the replies are pills; the consequence of "Turn into a task" is described in the asker line, not drawn | ✓ | ✓ (1 numbers on a glance screen, ≤ 7) |
| 17 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 18 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 19 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ (3 numbers on a glance screen, ≤ 7) |
| 20 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 21 | ✓ | ✓ | ✓ (places appear as tiles in a strip (name, landmark, ring)) | ✓ | n/a | ✓ | ✓ |
| 22 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 23 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 24 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 25 | ✓ | ✓ | ✓ (the cut-out carries no names) | ✓ | n/a | ✓ | ✓ |
| 26 | ✓ | ✓ | ✓ (thumbnails carry no names) | ✓ | n/a | ✓ | ✓ |
| 27 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 28 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 29 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 30 | ✓ | ✓ | ✓ | ✓ | ◐ enabling Fable states its cost and routes in words; the decision opens with its consequence drawn | ✓ | ✓ |
| 31 | ✓ | ✓ | ✓ | ✓ | ◐ the proposal states its effect in words and offers Preview | ✓ | ✓ |
| 32 | ✓ | ✓ | ✓ (the image card carries no names) | ✓ | ✓ | ✓ | ✓ |
| 33 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 34 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ (2 numbers on a glance screen, ≤ 7) |
| 35 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 36 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 37 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 38 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |
| 39 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ (the list equivalent, by design) | ✓ |
| 40 | ✓ | ✓ | ✓ | ✓ | n/a | ✓ | ✓ |

Criterion 3 exceptions follow the lead's ruling (names appear only when legible; `docs/13` §14.3 is being amended). Criterion 7 is measured in Deep Blue, LTR, desktop; Sky Glass and the four Aqua Dusk frames were checked by eye from the screenshots, RTL and high contrast on frames 2 and 38, and the phone layouts on frames 34–37.

## Screenshots (`shots/`)

Every frame in Deep Blue and Sky Glass at desktop, shrunk to 900 px wide: `f<nn>-deep.png`, `f<nn>-sky.png` (frame 38 has `-2` for its second screen). The phone frames at 390 px: `f01-<theme>-phone.png` (the phone check of frame 1) and `f34`–`f37` (`-2` for the second phone of 36 and 37). Frames 1, 12, 14 and 21 also in Aqua Dusk: `f<nn>-aqua.png`.

## Generator

`node docs/04-mocks/gen/build.mjs` writes `index.html`; it is deterministic (two builds are byte-identical). Node 22, no dependencies.

| File | What it holds |
|---|---|
| `gen/tokens.mjs` | The Lucid Glass themes and high-contrast variants, copied unchanged from v0.1 |
| `gen/css.mjs` | The v0.2 styles: the shell, glass with depth, the world's vocabulary, product views, charts, phone |
| `gen/mark.mjs` | The Lucid mark and the Lucid Total mark (v0.1, unchanged) |
| `gen/lib.mjs` | Shell (dock, Talk, breadcrumb), rings, places, flags, embassies, buildings, frame captions |
| `gen/geo.mjs` · `gen/world.mjs` · `gen/company.mjs` | Power-diagram terrain with organic borders, sub-place contours, heat, fronts, light; the company model and its pinned layout |
| `gen/landmarks.mjs` · `gen/facades.mjs` | The landmark library; the product facade renderers |
| `gen/kit.mjs` · `gen/charts.mjs` | Cut-outs, paths with stations, date chips, confidence, strips, gauges; charts |
| `gen/framesA.mjs` … `gen/framesI.mjs` | The frames, one module per section |
| `gen/shoot.mjs` | Screenshots (Playwright with the cached Chromium; `--themes`, `--frames`, `--phone`) and the attention check (`--check`): it counts needs-you elements, distinct text above body size and numbers per visible screen, ignoring the dimmed world under a sheet, and compares them with each caption |

## Data in the frames

The company is Lucid: Engineering (Private beta, iOS 1.0, EU residency, Evals, Platform), Product, Design, Marketing, Partnerships, Support, Compliance, Finance, People, Operations, Leadership, and System as an island at the coast. People: Yossi (owner), Noa (engineering lead), Dana (compliance), Omer (marketing). Agents: the coordinator, Workers B and C, the triage, evidence, repair and campaign agents, the importer. Parties are fictional (Cohen Legal, Levi & Co. CPA). Figures are illustrative; no real phone number, email address or secret appears.
