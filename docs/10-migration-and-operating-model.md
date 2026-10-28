# Lucid Total — Migration and Operating Model (Lucid Chat on Lucid Total)

> How Lucid Chat's development moves onto Lucid Total and how it runs there afterwards: what is imported and how each source maps onto the company model (`docs/02` §4), the importer, what the import's evaluation found, the coordinator's operating protocol, the cutover, and what stays in the Lucid Chat repository. Covers UC-B1…B11, UC-I5 and UC-L4 (`docs/01`); the wire protocol is `docs/08` §5, the importer code `tools/import/lucid-chat/`.
>
> **Created:** 2026-10-28 · **Owner:** Yossi · **Maintained with:** Claude (the lead). Numbers in §3 are from the import of Lucid Chat at checklist hash `e08aefd307261c9d` (2026-10-28); `data/import/lucid-chat/report.md` is regenerated on every run and is the current source.

---

## 1. What moves, and where it lands

Lucid Chat tracks its development in Markdown and JSON files: one checklist of about 2,400 rows (`docs/15-checklist.md`), a decision log (`docs/09-decision-log.md`, L1–L510 and the "Open decisions" list), 437 task briefs, about 240 walkthrough reports and 80 other test reports, 27 ADRs, an owner's accounts checklist (`docs/07a`), and a status site (scoreboard, quality, costs, nightly, the decisions page). All of it moves into one model. Documents themselves stay in the repository (§6); Lucid Total holds the items, the relations and the links.

### 1.1 Checklist columns → item fields

| Checklist | Lucid Total item (`docs/02` §4.1) | Notes |
|---|---|---|
| `ID` | `id` and the first `alias` | Kept verbatim (`P1-C-w13-F2`) so commits, briefs and reports keep resolving. Lucid Total may add its own prefix later; the checklist id stays an alias forever. A duplicated id gets `~2` and `duplicate_of`. |
| Section heading (CT, P0…P4, Follow-up rows) | `phase`, `top_level`, groupings `phase:<P>` and `section:top-level` / `section:follow-up` | Follow-up rows take the phase of their id family (`P1-…`) or of their origin chain; 479 rows have neither and sit in `phase:unphased` (mostly rows spawned by decisions, `L503-F1`). |
| `Task` / follow-up `Description` | `title` | The full text; the AI can shorten it into a display title later, never in the import. |
| `WS` | `workstream`, `workstreams[]`, groupings `workstream:<X>`; assignee = the workstream's agent record | `Owner` → the owner (and the row becomes a `chore`), `Lead` → the coordinator, `counsel` → the external counsel record. |
| `Depends` | `depends_on[]` relations (rule `depends-column`); leftover text in `depends_text` | "all P0", "E1 tasks" are kept as text, not guessed. |
| — (the verdict) | more `depends_on` (rule `status-verdict`) and `waits_on[]` | "todo — blocked on X", "partial — follow-up X", "after X" in the status lead clause. |
| `Tests` | `tests_required[]` (unit, integration, contract, e2e, load, eval, security, property), `tests_detail[]` (`LT-01`) | Expected side. |
| `Walk` | `walkthrough_required` (true/false/null) | Expected side; only top-level rows have the column. |
| `Docs` | `docs_required` | Expected side. |
| `Acceptance` | `acceptance` | Expected side; one criterion per row until the evidence checker splits it into criteria (Phase 1). |
| `Status` | `state` (todo · brief · doing · review · done · blocked), `resolution` (done / closed), `progress` (partial), `state_text` (raw cell), `state_verdict` (before the first "· was:"), `history[]` (each "was:" segment), `board_class` (the status board's own class) | Normalisation rules in `lib/state.mjs`: the leading word decides; "<state> — blocked on …" is `blocked`; "closed" is `done` with resolution `closed`; "F part done" is `doing` with `progress: partial`. |
| `Status` + `Follow-ups` content | `evidence[]`, typed: link · commit · pr · walkthrough · report · brief · doc · code · tests · wave · date · decision | Paths are resolved against the repository and carry `exists`; evidence from history segments is marked `field: status_history`. |
| `Follow-ups` | `follow_ups_text`, `follow_up_ids[]`; the listed rows get `spawned_by` (rule `listed-by`) | |
| Follow-up `Origin` | `origin_text`; `spawned_by` (rule `origin-column`) | Rules in §2.3. |
| Wave mentions ("wave 36 H", "E2 wave 5", "wave BETA-AI-1") | groupings `wave:<n>-<ws>` / `wave:<NAME>` | Every wave a row names becomes a grouping; the wave's brief is attached to the grouping. |
| `INT-<n>` rows | `kind: milestone` | Gate rows. Criteria come from `docs/testing/gates/phase-<n>.md` when the gate view is built. |
| P3 / P4 summary rows (four columns: ID, Task, WS, Acceptance; no status column) | `kind: milestone` of their phase, `summary_row: true`, state `todo` | Lead decision T23 (§7). They expand into tasks when their phase is planned. |
| Human-action rows | `kind: chore` with `kind_reason` | WS names the owner, a person or counsel, or the description is addressed to the owner ("Owner: open Apple Developer…", "Lead/owner: confirm…"). 83 rows. |

### 1.2 Other sources

| Lucid Chat source | Lucid Total | Notes |
|---|---|---|
| Decision log entries `L<n>` | `decision` items, `decision_kind: log entry`, `decision_type` (owner instruction · owner decision · lead decision · lead decision pending), `date`, `summary` (first sentence), `text`, `references[]` (`relates` relations to rows) | State: owner entries and lead decisions are closed; a pending lead decision is open when an open card still cites it or it is dated after 2026-10-24, otherwise closed as a group by L425's rule (the owner closed every `confirm` row as the lead's) with `closed_by: "L425 rule"` and not shown to the owner again (T23). |
| Owner answers `O<n>` (2026-10-18 tables) | `decision` items, `decision_kind: owner answer` | Their Status column decides open/closed; the second `O19` is `O19-mocks`. |
| "Open decisions" table | `decision` items `OD-<id>` (alias the raw id: `0eq`, `13`), `open_kind` (decide · confirm · unblock · later), recommendation, the rows they hold | **The owner's inbox at cutover.** The "Resolved … (L437): 7 (…), 0ek (…)" lines become closed `OD-` items with `resolved_by`. |
| `docs/status/decisions-catalogue.json` | the card (`CARD-<id>`: title, two-sentence context, recommendation, group) on the `OD-` item | The curated catalogue becomes the inbox's card text. |
| `docs/status/decisions-answers.json` | `owner_answers` (`ANS-<id>`: choice, notes, decided_at) and `answered_by` relations | The decisions page's history; after cutover the owner answers in the inbox. |
| ADRs `docs/decisions/NNNN-*.md` | `decision` items `ADR-NNNN`, `decision_kind: ADR`, `adr_status`, the Decision section as text, references | Proposed ADRs are open. The file stays the source of the argument; the item indexes it. |
| Briefs `docs/briefs/*.md` | `brief` evidence on the rows in scope (the "Rows:" sentence and the title; otherwise the first paragraph) and on rows whose status names the brief's wave; the wave grouping's `brief` | The briefs carry no "## Goal" section; the goal is the title's parenthetical plus the first paragraph. |
| Walkthrough reports `docs/testing/walkthroughs/*.md` | `walkthrough` evidence on every row cited with the path, and on every row the report names in its title or header lines | Screenshot folders stay in the repository; `has_media_folder` marks them. |
| Load, eval, gate, rc and review reports (`docs/testing/**`) | `report` evidence, the same way | |
| `docs/07a-accounts-to-open.md` | `account` items (the vendor tables of §A and §B: ☐ todo, ◐ doing, ✓ done, — closed as not used) and `chore` items (the numbered steps of §B1, §B2, §B3), with `relates` to the rows they name | Credentials are never imported; the vault field names are. Envelopes replace "put it in the vault" (`docs/07`). |
| Workstreams A–H, E1, E2 (`docs/13` §1), the lead, the owner | `people-and-agents.json`: the owner (person), the lead (agent, coordinator), one worker agent per workstream with what it owns and the brief count per model | Workstreams become agent roles; the parallel slots (4–6) are the coordinator's capacity setting. |
| Status site: scoreboard (`index.html`, `scoreboard.json`, `tiles.json`) | Views: the board, a saved "two bars" view (§3.2), tiles as metric evidence on the Phase 1 grouping | Not imported as data: the view is computed from the items. |
| Quality and cost pages (`quality*.json`, the costs page) | The quality view and the cost view (UC-B10), metric evidence on items and groupings | Not imported by the v1 importer: they keep publishing from Lucid Chat until the metric import (Phase 1). |
| `nightly.json` (Railway `ci` chain) | `incident` items from the nightly connector (UC-B11) | Phase 2 connector; the Railway chain posts directly then. |
| The decisions page | The owner's inbox (`docs/02` §5.7) | One card at a time, material only (L425; Lucid Total T13). |

## 2. The importer

### 2.1 Running it

```
node tools/import/lucid-chat/import.mjs --source /Users/yossinaar/Projects/lucid/lucid --out data/import/lucid-chat
node --test tools/import/lucid-chat/import.test.mjs
```

Node 22+, ESM, no dependencies. It reads the Lucid Chat repository and never writes to it or runs git there. It writes, under `--out`:

| File | Content |
|---|---|
| `items.json` | Checklist rows (task · chore · milestone) and the accounts and chores of `docs/07a`, with every field of §1.1, `evidence[]`, `groupings[]`, `to_verify`, `blocker`, `evidence_grade`. |
| `relations.json` | `{from, type, to, rule}`: depends_on, spawned_by, parent_of, relates, answered_by. |
| `decisions.json` | Log entries, owner answers, open-decision cards, ADRs; the owner's answers and the catalogue cards. |
| `evidence.json` | Every evidence record with a stable id (`EV-` + hash of item, type, value, field), plus the artefact index (briefs with goal and scope, reports with the rows they name). |
| `groupings.json` | Phases, workstreams, waves (with their brief), sections; members and a state roll-up. |
| `people-and-agents.json` | The owner, counsel, the lead, the workstream agents. |
| `evaluation.json` | Per row: grade and its basis, walkthrough check, blocker, contradiction, `to_verify`; the board's two bars; the orphan, unresolved, duplicate and cycle lists. |
| `report.md` | The statistics and the evaluation in prose (quoted in §3). |

**Privacy.** Every source text passes a filter the moment it is read: email addresses, phone numbers (including the fictional test numbers and partially elided ones) and credential-shaped tokens are replaced by `[email removed]`, `[phone removed]`, `[secret removed]` and counted in the report (this run: 17 emails, 90 phone numbers, 0 tokens). The import carries no secrets; accounts carry the vault field names only.

### 2.2 Idempotency

The output is a pure function of the source files: no clock, sorted in source order, stable evidence ids, the source files' hashes in `meta`. Two runs on the same commit produce byte-identical files (checked). Loading into Lucid Total is an **upsert by alias**: an item whose alias exists is updated field by field (with a history entry attributed to the `importer` service account and the source hash as the reason), a new alias creates an item, and an item whose alias disappeared from the source is flagged, never deleted. Fields edited in Lucid Total after the first load (comments, criteria statuses, assignments, `to_verify` verdicts) are not overwritten: the importer owns only the fields it derives, and a field changed on both sides is reported as a conflict for the coordinator.

### 2.3 Follow-up origin rules (`spawned_by`)

Tried in order; the first rule that finds an existing item wins, and the relation records the rule:

1. **origin-column** — the follow-up table's Origin cell names an existing row, decision (`L<n>`) or ADR: the first such id. "P1-H-06-F1-F1 (wave 13 C)" → `P1-H-06-F1-F1`. Other ids in the cell become `relates`.
2. **listed-by** — another row lists this id in its Follow-ups cell.
3. **id-prefix** — strip the last `-F<n>` / `-CR<n>` (or reviewer markers `-R/-X/-N/-S/-D/-P<n>`), then a wave segment `-w<n>…`, then trailing segments, until an existing item remains: `X-F1` → X, `X-CR2` → X, `X-w36-F1` → X, `L503-F1` → decision L503, `P0-G-01-ios-F1` → `P0-G-01`.

A row none of the three resolves is an **orphan**: it carries `origin_unresolved: true` and stays linked only to its wave groupings (the waves its status names, and the wave its Origin text names, as in "wave 4 C report"). Its Origin text is classified (a wave or report, a review or audit, the owner or lead, other). The import does no hand linking; in the review wave (LT-0005) the AI proposes an attachment per orphan (T23).

**Subtasks (`parent_of`)**: an id whose last segment is not a follow-up marker (`-U1`, a single letter, `-ios`, a bare number as in `REV-E1-30-2`) and whose prefix exists is that item's subtask.

### 2.4 What the importer cannot infer

- **Whether a `done` row is really done.** It grades the evidence (§3); it does not read code or rerun tests. The evidence checker (`docs/02` §7.6) does that per item later.
- **Acceptance criteria as separate lines.** The Acceptance cell is one text; splitting it into criteria with ids is an AI step after import.
- **Free-text origins.** "wave 1 setup", "A report", "review of the Sonnet waves" name a wave or a review, not a row.
- **Columns in malformed rows.** 40 rows have a status written twice or an extra Evidence cell; the parser keeps the first columns by position and folds the rest into `follow_ups_text`.
- **Waves written in other ways** ("H 36's census") and **bare hashes in prose** (hashes are taken only from code spans, parentheses or after merge/commit/main words).
- **Chore detection** is a wording rule; a human step inside a technical row stays a task.
- **Pending lead decisions** before 2026-10-24 are closed by L425's rule as a group (`closed_by: "L425 rule"`, 55 entries), not by a per-entry record.
- **Status contradictions** are a word match ("done, but … pending"): 158 done rows carry open-sounding words in their verdict ("mobile sims pending ENV-F1"). Many are honest partial notes; they are listed, not reopened.
- **Dates of state changes.** The checklist has only the dates written into cells; an item's `started`/`done` dates come from the first and last dated evidence until Lucid Total records them itself.

## 3. What the evaluation found

The owner asked that the translation also evaluate the work. Every row was read for its evidence; the full lists are in `evaluation.json`, the prose in `report.md`.

### 3.1 Counts

- **2,357 checklist rows**: 207 top-level (CT 10, P0 52, P1 70, P2 62, P3 7, P4 6) and 2,150 follow-ups. Kinds: 2,258 tasks, 83 chores, 16 milestones (the five `INT-<n>` gates and the eleven other P3/P4 summary rows); plus 19 accounts and 28 chores from `docs/07a`. **604 decisions**: 513 log entries, 24 owner answers, 40 open-decision cards (22 still open), 27 ADRs (2 proposed).
- **States** (all rows): done 1,699 (48 of them closed as obsolete), todo 369, blocked 164, doing 99, review 26, brief 0.
- **Relations**: 4,675 — spawned_by 1,893 (origin column 1,753, listed-by 35, id prefix 105), depends_on 321 (Depends column 171, status verdicts 150), parent_of 12, answered_by 30, `relates` 2,419 (decisions citing rows and rows citing decisions, secondary origins, `docs/07a` references).
- **Orphan follow-ups: 257**, flagged `origin_unresolved` (194 name a wave or a report, 33 a review, 10 the owner or lead, 20 other text); 250 of them are linked to at least one wave grouping. **191 rows** where the Origin column and the id prefix point at different existing items (the Origin column wins).
- **Unresolved dependency ids: 3** (`P1-G-03` and `P1-H-03` depend on `P1-A`, `P2-H-02` on `P2-A`: workstream-wide dependencies written as ids). **One dependency cycle**: `AI-1` ↔ `DC-1`. **No duplicate ids.**

### 3.2 The status board, re-derived

The board's two bars computed from the items with the board's own rules match the board: Phase 1 top-level rows 64 (35 done, 16 partial, 4 review, 9 to do); Phase 1 plus every follow-up row 2,214 (1,643 done, 455 schedulable, 116 owner-blocked). One follow-up row differs by class: `DC-1-F7` has a pipe inside a code span in its description, which the board's splitter reads as a cell border, so the board counts it as partial; the importer reads it correctly as to do. Lucid Total's board will not have that class of error (cells are fields).

### 3.3 Evidence strength of the 1,699 done rows

| Grade | Meaning | Rows | Share |
|---|---|---|---|
| 3 | a walkthrough or test report on disk, cited or naming the row | 883 | 52 % |
| 2 | a commit, PR or test counts, or an existing code/doc file cited; `grade2_source`: commit 49 · pr 0 · tests 123 · file 201 | 373 | 22 % |
| 1 | only a wave, a date or a decision reference | 434 | 25.5 % |
| 0 | nothing | 9 | 0.5 % |

The 201 **file-only** grade-2 rows (no commit, PR or test count) are listed on their own line in `report.md`; they are not "to verify", and the review wave samples them. 653 done rows have no link of any kind in the row itself (their grade comes from a report that names them, or they are grade 0–1). 23 done rows cite a path that no longer exists. Of the 44 done top-level rows that require a walkthrough, 34 cite a report on disk and **10 have none** (`P0-C-07`, `P0-E2-02`…`06`, `P1-D-03`…`06`).

### 3.4 Blocked and waiting

232 open rows name what holds them: another task 139 (83 of them through a row that itself waits on the owner; `INT-1` alone holds 56), an external account, environment or person 64 (environment and toolchain 33, Xcode item 13 8, native-speaker review 9, counsel 8), an owner decision 24, other 5. **19 blockers are stale**: the verdict names a decision card already resolved in `docs/09` (6, e.g. card 7) or a row already done (13).

### 3.5 The "to verify" rule

An imported item gets `to_verify` (with its reasons) when it is:

- `done` with evidence grade 0 or 1 (closed-as-obsolete rows excepted) — **415 rows**;
- `done`, walkthrough required, and no walkthrough report found — **10 rows**;
- open with a stale blocker — **19 rows**.

In all **442 items**. They import in the state the checklist gave them: nothing is silently reopened. Lucid Total shows them with the "unchecked" confidence glyph and a `to-verify` label, and the coordinator works them as the review wave `LT-0005` (`docs/11`), in this order: gate criteria and top-level rows first, then rows with a required walkthrough, then grade 0, then grade 1 by phase (CT, P0, P1, P2). For each item the coordinator (or the evidence checker, once it runs) reaches one of three verdicts, recorded on the item with the evidence it used: **confirmed** (evidence attached, grade re-computed, label removed), **reopened** (state back to `review` or `todo` with the reason; the owner hears of it only when the item is a gate criterion), or **closed as obsolete** (with the decision or row that superseded it). A stale blocker is re-pointed or removed. The review wave is not a precondition for cutover; the share of "to verify" items is shown on the Phase 1 grouping until it reaches zero.

## 4. The coordinator's operating protocol on Lucid Total

The Claude Code lead and its workers keep working in git worktrees on the lead's machine; Lucid Total replaces the files they used to update. The calls are `docs/08` §5's, through `tools/coordinator/total.mjs`.

1. **Start of a wave.** The lead writes the brief file as today (`docs/briefs/<wave>.md` in Lucid Chat), then creates the wave grouping (`wave:<n>-<ws>`) and, for each row in the brief's scope, creates or updates the task: brief fields from the brief (goal, read-first, scope, outputs, acceptance), dependencies as relations, the brief file as `brief` evidence, the wave grouping. State `brief`. New rows are created here, not in a Markdown table; their id follows the old convention when it continues a family (`P1-C-w71-F1`) and is otherwise Lucid Total's own.
2. **Working lines.** Each agent posts one line **at start** (state → `doing`, "wave 71 B: dispatcher sequencing"), **on a meaningful change** (a deciding suite started or finished, a review finding, a block found or cleared, a handoff), and **at finish**. A heartbeat keeps the line fresh without new text. Nothing else: no per-file or per-tool-call posts, no progress percentages. The agents-live view shows each line's age; a line older than three heartbeats shows as stale.
3. **Finish and evidence.** The worker attaches its evidence before moving to `review`: test results as structured evidence (suite, passed/total), walkthrough report path and screenshots, load or eval report paths, the branch head commit, deviations as comments. It proposes a status per acceptance criterion. Evidence links point at files in the Lucid Chat repository (§6).
4. **Follow-ups.** Every finding that needs work becomes an item created with `spawned_by` set to the item it came from (there are no orphans from cutover on), the worker's proposed id as alias, and the wave grouping. Change requests to another workstream are follow-ups assigned to that workstream's agent.
5. **Merge.** The lead reviews, merges in Lucid Chat, and records on the item: the merge commit (evidence `commit`), the verification run (structured test evidence), state `done`. The done move refuses an item whose Definition of Done evidence is missing (`docs/14` §4 of Lucid Chat: tests, walkthrough when required, docs): that rule is a template setting on the task kind, so the grade-0/1 class of §3.3 cannot recur. The GitHub connector later attaches commits by `[ID]` in the subject automatically.
6. **Decisions.** Owner instructions and decisions are recorded as decision items at the moment they are given (the lead's `docs/09` entry becomes the item's text; the date, type and references are fields). Lead decisions pending confirmation are decision items with `decision_type: lead decision pending`; material ones go to the owner's inbox as one card each (L425); small ones become settings.
7. **Phase gates.** A gate is a milestone item (`INT-<n>`) whose criteria link the items and evidence that satisfy them; the gate report is generated from that evidence and attached; the owner accepts the milestone in the inbox.
8. **What the coordinator no longer does.** Edit `docs/15-checklist.md` rows, run `scoreboard.mjs` and `status:publish` for the scoreboard, run `decisions:pull` and `decisions:page`, hand-edit `tiles.json`, `scoreboard.json` or `quality-progress.json`.

**What replaces what.**

| Before | After cutover |
|---|---|
| `docs/15-checklist.md` | **Frozen** at cutover: a header line points to Lucid Total and the import hash; no row is edited again. The table stays readable history. |
| The status site (scoreboard, owner items, screenshots) | Lucid Total views: the board with the line view, the "two bars" saved view, the agents-live panel, the owner's inbox; the site's pages redirect. |
| The decisions page | The owner's inbox. |
| `docs/09-decision-log.md` | Decisions live as items. A **Markdown export** in the log's format (dated sections, `L<n>` entries, the Open decisions list) is written back into the Lucid Chat repository by the export job after each decision, so the history in git stays complete and readable; numbering continues from L510 for entries made in Lucid Total. |
| Quality and cost pages | Keep publishing from Lucid Chat until the metric import (Phase 1), then Lucid Total views. |

## 5. Cutover plan

1. **Dry run (about five days before).** Run the importer on Lucid Chat's main; load the outputs into Lucid Total `dev` through the import endpoint; check that the loaded counts equal `report.md` (items, relations, decisions, evidence) and that the board view reproduces the status board's two bars; the owner looks at a sample of twenty items (five per grade) and at the inbox. Importer fixes land before the next step. Exit: counts equal, board equal (allowing the `DC-1-F7` correction), owner's sample accepted.
2. **Parallel week.** The checklist is still the source of truth. After every merge the lead re-runs the importer (upsert by alias) and, in addition, posts working lines, evidence and follow-ups to Lucid Total as in §4. A daily diff compares the checklist's rows with the items (state, evidence, new rows); every difference is either an importer defect (fixed) or a protocol miss (the coordinator corrects it). Exit: two consecutive waves run entirely through Lucid Total (Gate 0, `docs/11`) and three days with a zero diff.
3. **Freeze (day 0).** A final import at the freeze commit; `docs/15-checklist.md` gets its frozen header with the hash; the decisions page becomes read-only with a link to the inbox; the status site's scoreboard and owner items redirect to Lucid Total; Lucid Chat's `CLAUDE.md` and `docs/14` §8 are updated in the same change to describe §4 (the lead does that change in Lucid Chat; this repository does not edit Lucid Chat). From then on Lucid Total is the source of truth.
4. **Rollback (for two weeks after freeze).** If Lucid Total cannot carry the work (data loss, the coordinator blocked for more than a day, the owner's call), the export job writes the items back in the checklist's table format (the same columns, follow-up rows in their table, evidence into Status) and the decision log in its format; the lead commits them over the frozen files, removes the frozen header and resumes the old routine. The export format is exercised during the parallel week (an export diffed against the checklist), so the rollback path is tested before it is needed.

## 6. What stays in the Lucid Chat repository

Documents stay where they are written and versioned; Lucid Total indexes them and links to them, it does not copy them.

- **Stay as files in Lucid Chat:** the design documents (`docs/00`–`14`), ADRs, briefs, walkthrough reports with their screenshots, load/eval/gate reports, runbooks, mechanism and API docs, the frozen checklist and the decision log (kept current by the export of §4), and everything under `docs/status/` until each page is retired.
- **In Lucid Total:** items, relations, groupings, decisions as items, evidence records (a link with type, path, commit and title; images and videos only when attached directly), comments, working lines, the owner's inbox, the views.
- **The rule:** a document that explains or argues (a brief, an ADR, a walkthrough report) is a file in the repository, reviewed with the code that implements it; Lucid Total holds the pointer, the state and the comparison of expectation and result. The retrieval layer indexes the repository on each merge (`docs/02` §7.4), so the assistant can quote a document without Lucid Total owning it. If a path moves, the evidence checker flags the dead link (the import already found 23).

## 7. Decisions taken (lead, 2026-10-28, T23)

1. **Orphan follow-ups** stay linked to their wave groupings only. Each carries `origin_unresolved: true` so the review wave (LT-0005) can filter them; there the AI proposes an attachment per orphan. The import does no hand linking. (257 rows; 250 have a wave grouping.)
2. **Pending lead decisions dated on or before 2026-10-24** are closed as a group under L425: state `closed`, `closed_by: "L425 rule"`; they are not shown to the owner again. (55 entries; the 3 still open are L60 and L93, cited by open cards, and L484, dated after the cut-off.)
3. **Grade 2 keeps "cites an existing code or doc file"**, with the evidence subcategory `grade2_source: "file" | "commit" | "pr" | "tests"` on the item and in `evaluation.json`. The `to_verify` rule stays: grades 0–1, plus a required walkthrough with no report, plus a stale blocker (442 items). The 201 file-only rows have their own line in `report.md` for the review wave to sample.
4. **The 13 P3/P4 summary rows** import as `milestone` items of their phase with `summary_row: true` (state `todo`), not as tasks.
