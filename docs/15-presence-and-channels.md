# Lucid Total — Presence and Channels: the operating system is where you already are

> Lucid Total outside its web app: Lucid Chat, email, Slack and other messaging systems, voice, agents' tools; same actions, rights, confirmations, audit and compartments everywhere. Extends `docs/02` §4.9, §4.10, §7, §8, `docs/06` §2 and §7, `docs/07` §3, §3b, §5 and `docs/08` §6. The Stage and its scenes are defined in `docs/13-experience.md`.
>
> **Created:** 2026-10-28 · **Owner:** Yossi · **Status:** v1 draft for the owner's review.
>
> **Owner instruction (2026-10-28):** "The core mechanism of the system and core day to day operations, including overviews, taking decisions and updating, should work well in the system and also integrate well externally. I can work fully via Lucid Chat to receive questions and answer them, or via email. The system agents can live inside Slack or any other messaging system used in the company, track progress, update tasks. It should remove and automate, using the AI mind, everything that the company does, leaving the people to focus on tasks and helping them drive tasks as well."

---

## 1. The principle and the channel layer

**The operating system is where you already are.** The web app is the fullest surface, not the only one: the owner can run the company from Lucid Chat or email alone, a team has Lucid Total in its Slack channels, a contractor works with it by email, an agent through the CLI or MCP. On every surface, five things hold:

1. **One action registry.** A channel has no logic of its own: inbound messages become registered actions (`docs/06` §2), outbound ones come from actions and agents.
2. **The same rights and compartments.** The actor is the resolved person or party, never "the Slack user"; the channel's **assurance level** (§3) can only narrow what they may do there.
3. **The same confirm model.** Preview → confirm → apply, hash-bound. The permission class (`read` · `reversible` · `irreversible` · `outbound` · `spend` · `admin`) and the channel's assurance decide whether confirmation happens on the channel or hands off to the app's **confirm page**.
4. **The same audit.** Every message in or out is an event with `via: <channel>`, actor, assurance and preview hash.
5. **The same attention doctrine.** One notification ledger across channels (§7): said once, in one place, at the reader's cadence.

### 1.1 How a message travels

```
inbound   adapter → verify signature → normalise → resolve identity and assurance
          → intent (button or token: deterministic; free text: fast model proposes a registry action)
          → action layer (rights, compartment, class × assurance) → preview or apply → echo on the same channel

outbound  action or agent → message intent (kind, item refs, preview hash, options, scene ref)
          → ledger (dedupe, cadence, quiet hours, preference) → sensitivity ceiling (code, never the model)
          → composer (the AI words it inside the intent) → channel renderer → adapter → audit event
```

The composer writes; it never chooses what may leave. Fields above the ceiling are removed before the model sees the intent.

### 1.2 Code shape

`packages/channels` holds the ledger, identity resolver, assurance gate, composer and one renderer per channel. Each messaging system is an adapter under `packages/adapters/messaging/*` with one interface: `capabilities` (buttons, threads, ephemeral, edits and deletes, images, length), `verifyInbound`, `normalise`, `send`, `update`, `delete`. Renderers degrade by capability: Slack buttons become numbered replies on SMS. Every adapter has a test stub, a status card, a kill-switch and an outbox handler on the `worker` role (`docs/05` §4.3).

## 2. Surfaces and what each carries

### 2.1 The surfaces

| Surface | Lucid Total's presence |
|---|---|
| **Web app** (desktop and phone) | The full system, including envelope windows and the confirm page other channels hand off to. |
| **Lucid Chat** | A **contact with a verified identity** (badge, key fingerprint) reached through Lucid Chat's own API (LT-0002), one 1:1 conversation per person. Lucid Chat's sealed mediation applies unchanged: the system is a participant in its own conversations, never a reader of other people's; it is never added to a person-to-person conversation; its messages pass Lucid Chat's Mediator like any participant's. |
| **Email** | In and out through the mail adapter (`belucid.chat`). Every mail is threaded to an item (per-item address tag, `In-Reply-To`); **reply-to-decide** and **reply-to-comment** blocks carry signed tokens (§8.2); per-party addresses for virtual parties (`docs/08` §6). |
| **Messaging adapters**: Slack, Teams, WhatsApp Business, Telegram, SMS | One interface. In team tools the agent is a **member of the channels it is invited to**: answers questions, tracks progress, files items from conversations with confirmation, posts one quiet daily line. In personal tools it behaves like the Lucid Chat contact with weaker guarantees. Never a firehose. |
| **Voice** | Hold-to-talk in the app (transcript shown before anything happens). Later, a phone call as a party-style channel: the system calls a verified number with one question. |
| **Coordinator CLI and MCP** | Agents' surfaces (`docs/08` §4–§5) within the service account's rights. |

### 2.2 What can be done where

`●` full · `◐` limited · `○` not offered.

| Surface | Glance | Decide | Update | Ask | Comment | Approve a run | Receive an envelope | See a scene |
|---|---|---|---|---|---|---|---|---|
| Web app | ● | ● | ● | ● | ● | ● | ● reveal window | ● live |
| Lucid Chat | ● | ● ¹ | ● | ● | ● | ◐ reversible | ◐ notice + link | ◐ image card |
| Email | ● | ◐ ² | ◐ by reply | ● | ● | ◐ reversible | ◐ notice + link | ◐ image card |
| Slack / Teams | ◐ quiet line | ◐ ² | ● | ● | ● | ◐ reversible | ○ | ◐ image card |
| WhatsApp / Telegram | ◐ | ◐ ² | ◐ | ● | ● | ○ | ○ | ◐ image card |
| SMS | ◐ one line | ◐ reversible | ◐ | ◐ | ◐ | ○ | ○ | ○ link |
| Voice call | ◐ | ◐ reversible, read back | ○ | ○ | ◐ | ○ | ○ | ○ |
| CLI / MCP | ● data | ● | ● | ● | ● | ● | ● ciphertext API | ● scene JSON |

¹ `irreversible` confirmable once the person's Lucid Chat device is bound (§3.1); `spend` above materiality and `admin` hand off to the app. ² `reversible` on the channel; `irreversible`, `spend` and unseen `outbound` hand off to the confirm page.

**Deliberately not offered:** secrets anywhere but the app's envelope windows and the agents' ciphertext API; `admin`, settings, rights or compartment changes by message; map navigation outside the app (channels get a rendered scene and a link to that place); anything above a channel's ceiling (§8.1).

### 2.3 One intent, the right form

| Intent | Web app | Lucid Chat | Email | Slack / Teams | SMS / voice |
|---|---|---|---|---|---|
| Decision | Decision card with change set | Cost-and-toil line, context, numbered quick replies | **Reply-to-decide block** | Message with option buttons | "Reply 1 or 2" / spoken question with read-back |
| Confirm | Preview card | Preview, Confirm / Cancel | Preview, reply "confirm" | Ephemeral preview, buttons | Reversible only |
| Glance | The Stage | Image card + three lines | Image card + digest | Quiet line | One line + link |
| Proposal from talk | Inbox card | Quick replies | Reply block | Quiet marker + ephemeral card | Not offered |

## 3. Identity across channels

### 3.1 Handles and verification

A person or party has **channel identities**: `(principal, channel, handle, verified_at, method, assurance, state)`. Handles are stable ids, never display names: an email address, a Slack workspace plus user id, a Teams tenant plus user object id, an E.164 number, a Telegram user id, a Lucid Chat contact id with key fingerprint. A handle belongs to one principal; a collision is an incident, not a merge.

| Channel | First-use challenge | Re-verified on |
|---|---|---|
| Email | Confirmation link opened in a signed-in app session | Address change; 180 days unused |
| Lucid Chat | QR in the app carrying a signed binding token, then one fingerprint comparison (**device binding**) | Lucid Chat new-device or SIM-swap signal (binding downgraded until reconfirmed) |
| Slack / Teams | "Link your account" from the app's DM opens the web app; the session binds the platform user id | User deactivated; app reinstalled |
| WhatsApp / Telegram / SMS | A code shown in the app is sent *from* the handle (resists SIM swap better than a code sent to it) | Number change; 90 days |
| Voice call | Verified phone handle plus a spoken PIN set in the app | Every call |

### 3.2 Assurance and what a channel may authorise

| Level | Meaning |
|---|---|
| A0 | Unknown sender |
| A1 | Verified handle |
| A2 | Verified handle plus an action-bound signed token or a signed platform interaction (reply-to-decide, a Slack button, a reply in the bound Lucid Chat conversation) |
| A3 | Device-bound app session or a second factor: the confirm page (passkey), or a bound Lucid Chat device for `irreversible` (setting) |

| Class | Minimum on a channel |
|---|---|
| `read` | A1, within the channel's ceiling and audience (§4.3) |
| `reversible` | A1 for comments, answers and progress; A2 for decisions |
| `outbound` | A2 for a draft the person saw in full on that channel; else A3 |
| `irreversible` | A3 |
| `spend` | A3; above materiality, the app only |
| `admin` | The app only |

A0 never acts: an unknown email to the asks address becomes an ask marked "unverified source"; an unknown member of a shared Slack channel gets answers cleared for that channel's audience only.

### 3.3 Impersonation defences

- **Inbound:** email must pass DMARC alignment for the claimed address; display names are ignored; look-alike domains are flagged on the card. Slack and Teams identities come from signed platform payloads, never from text. Tokens bind the recipient, so a forwarded decision mail cannot be decided by whoever received the forward.
- **Outbound:** the system speaks as itself ("Lucid Total, for Yossi"), never as a person; `belucid.chat` publishes DMARC `p=reject`; first contacts say it never asks for secrets or payments in a message.
- **Links never sign anyone in.** A channel link opens the app at a place; without a session it asks to sign in. The party magic link (`docs/07` §2) stays the only exception: single-use, bound to the party.

### 3.4 Parties on their channels

A virtual party (`docs/02` §4.10) is reached on the channels in its `contacts and channels` field, email first, others only with recorded opt-in; "stop" is always honoured. A party's replies answer its chores and asks, add evidence and comment; a party never decides a company decision on a channel (board votes stay in the external view, UC-P4). Everything sent is compartment-filtered first; on materialisation its channel identities carry over.

## 4. Conversation to work: "everything the company does"

### 4.1 Listening, with the channel's consent

Each Slack or Teams channel has a **presence mode**, set by the channel's admin and shown in a pinned notice:

| Mode | The agent reads | The agent writes |
|---|---|---|
| `off` | Nothing | Nothing |
| `addressed` (default) | Mentions, its DMs, its slash command | Answers and confirmations to whoever addressed it |
| `listen` | Every message, processed and discarded | Proposals to the speaker only; the quiet line |

The app requests the narrowest scopes each mode needs and never reads channels it was not invited to; in Lucid Chat and email it reads only what is addressed to it.

### 4.2 Extraction into proposed items

In `listen` mode a fast-model pass finds **commitments** ("I'll send the deck Thursday"), **asks**, **decisions** ("let's go with Stripe"), **risks** and **status changes**. Each becomes a *proposed* change set, never an applied one. The speaker sees a quiet marker on their message; tapping it opens an ephemeral card ("Task for Dana, due Thu?" Confirm / Edit / Dismiss). Unanswered proposals fold into the speaker's next quiet line, then expire.

**Progress said in a channel updates the item.** When the assignee of a linked item says it is done or blocked, the change runs at the level of the **channel progress capture** process: `suggest` at first, `inform` once its measured acceptance earns it (`docs/02` §2.7), applied with a ✓ marker and an undo in the ephemeral echo.

**Toil detection.** Requests repeated across channels ("can someone rotate the staging key", every week) become a proposed playbook for the domain lead, so routine climbs the autonomy ladder instead of living in chat.

### 4.3 Questions answered where they are asked

Questions addressed to the agent are answered from the knowledge index (`docs/06` §4) with item links as citations. The answer is visible to the whole channel, so retrieval is filtered by the **audience clearance**: what every member of the channel may see, capped by the channel's ceiling. When the asker could see more, the agent offers a private answer in their DM or the app.

### 4.4 Threads and items, both ways

An item links its source thread (permalink and cited excerpts); the thread gets an item unfurl; updates post there only if someone there follows the item.

### 4.5 The attention rule

**The agent speaks only when** (1) it is addressed, (2) a decision or confirmation needs a specific person (to that person, ephemerally where possible), or (3) it posts its **one scheduled quiet line** (daily by default: what moved, what is stuck, what needs someone here). Everything else is silent and visible on demand ("what did you file this week?") and in the app.

## 5. Decisions and overviews outside the app

### 5.1 One decision at a time, on the owner's channel

The owner's decision channel is a setting (Lucid Chat or email first; T-O3). The decision ageing agent sends **one** material decision; the next follows only when it is answered or deferred. The message carries the card in plain words: the **cost-and-toil first line** (`docs/02` §6.1), two sentences of context, the recommendation, options as replies, a link to the full change set.

```
Cost: $0 a month, toil: none.
Europe compliance before the US launch? <two sentences of context>
Recommended: 1.

Reply with one line:
  1      Europe first (moves 14 items, US launch +3 weeks)
  2      Keep the current order
  ? ...  Ask a question
  later  Ask me tomorrow
```

The reply is matched to its token, then to the preview hash; if the model changed since sending, the system answers with the refreshed preview instead of applying a stale one. A change set carries the highest class among its actions; for `spend` or `irreversible` the reply opens the confirm page. The result is echoed in one line with **Undo** where reversible, and the Stage updates for everyone concerned.

### 5.2 The morning glance as a scene

The briefing agent renders the reader's glance from the Stage's scene grammar (`docs/13`) into a small image card (SVG to PNG in the `worker`), with a text version for screen readers and text-only channels.

### 5.3 Status questions

"Where are we on Europe?" on any channel gets two or three sentences with citations, a rendered **mini-scene** of the Europe collection, and a link that opens the app at that place and zoom.

## 6. Driving tasks for people

The AI is a **chief of staff for each person**, on their channel of choice:

1. **Before a task starts**, it sends one context pack (brief, related decisions, last thread, documents, people).
2. **It drafts the first version**: mails, documents, briefs; code by handing a task to the Claude Code coordinator (UC-D8).
3. **It follows up on waiting states**, reporting on change only.
4. **It chases externals** through the external correspondence playbook (`docs/06` §7), on the party's channel, inside the compartment.
5. **It closes the loop**: confirms the result with the asker, attaches evidence, proposes criteria statuses, reports in **one line**.

**Never without a tap:** sending outbound on a person's behalf while that process is below `inform`; changing words a person wrote (edits are offered as suggestions); committing a person to a date, meeting or amount with an external; revealing or requesting a secret.

## 7. Notification doctrine across channels

| Cadence class | What | Delivery |
|---|---|---|
| `now` | A confirmation an action in flight waits for; a decision on the owner's channel; a mention by a person; a failing or breached state the person owns | Primary channel at once; quiet hours hold unless the person opted in or is on duty |
| `batched` | State changes of followed items, done, unblocked, feedback answers | Grouped per item at the person's cadence |
| `scheduled` | Morning glance, weekly digest, the quiet line | At the set time |
| `silent` | Everything else an agent noticed | On demand |

- **One ledger, one delivery.** One row per person and event, sent to one primary channel per class. Seen or acted on anywhere (mail opens do not count) marks it handled everywhere and cancels pending sends.
- **Quiet hours** per person, in their time zone, on every channel.
- **Escalation only for failing or breached states:** unacknowledged after the set time, it moves to the person's next channel, then to the role holder. Nothing else escalates.
- **Kill switches:** per channel company-wide, per person per channel, and the company-wide AI pause (`docs/06` §10).
- **Attention cost is measured** per class, channel and agent (sent, seen, acted on, undone, muted). A daily interruption budget per person turns overflow into the next batch; low-action classes are proposed for demotion; attention cost enters each agent's quality record.

## 8. Security on channels

### 8.1 What may leave

| Class (`docs/07` §6b) | Lucid Chat | Email | Slack, Teams, WhatsApp, Telegram, SMS, voice |
|---|---|---|---|
| `normal` | Yes, within visibility | Yes | Yes, within the audience clearance |
| `sensitive` | Yes, 1:1 (sealed; Lucid Chat's Mediator on its ZDR path) | Title and link | Title and link, 1:1 only |
| `restricted` | "An item needs you" and a link | Same | Same, 1:1 only |
| `payroll` | Nothing, not even existence | Nothing | Nothing |
| Envelope contents | Never; notice and app link | Never; notice | Never; no notice in team channels |

For parties, compartment filtering happens before the ceiling. The filter is code in `packages/channels`, tested by a channel-ceiling suite beside the cross-compartment suite (`docs/09`).

### 8.2 Tokens, webhooks, audit, retention

- **Signed tokens** (reply-to-decide, reply-to-comment, deep links, button payloads) carry purpose, item, recipient, channel, preview hash and expiry (decisions 72 h, comments 7 days; settings); decision tokens are single-use and revoked with the handle.
- **Verified webhooks:** Slack signing secret with a five-minute replay window; Teams Bot Framework JWT; WhatsApp `X-Hub-Signature-256`; Telegram secret-token header; the SMS and voice provider's request signature; the mail provider's signature plus DMARC. Unverified inbound is dropped and counted.
- **Audit of every outbound message:** channel, handle id, intent kind, content hash, ceiling applied, actor and on-behalf-of, preview hash, delivery state. Text sent to parties is kept on the party thread; logs stay content-free. Channel text is untrusted in prompts (`docs/07` §8).
- **Retention:** undo before an external send uses the grace window (`docs/02` §8); afterwards the system deletes or edits its own message where the platform allows (Slack, Teams, Telegram) and says so where it cannot (email, SMS, WhatsApp). `listen`-mode messages are discarded after extraction; only cited excerpts with permalinks remain, under the item's sensitivity. Handle mappings are deleted when a person leaves or an engagement ends; history stays.

### 8.3 Connector rows for `docs/08` §6

| Connector | v1 behaviour | Data terms (verify before build) |
|---|---|---|
| **Slack** | Internal app per workspace; presence modes, buttons, slash command, ephemeral proposals, quiet line | Content stays in the workspace and passes Slack's API; Slack's API terms restrict bulk export and LLM training on Slack data and rate-limit history reads for distributed apps |
| **Teams** | Bot through Azure Bot Service; resource-specific consent per team | Processed in the Microsoft tenant; the Azure bot registration is a non-Railway service needing a written case |
| **WhatsApp Business** | Cloud API; approved templates to open a conversation; buttons inside the service window | Meta hosts and processes content; per-message template pricing; opt-in required |
| **Telegram** | Bot API; inline keyboards | Not end-to-end; stored on Telegram's servers |
| **SMS** | Short text plus link; digit replies | Plaintext at carriers and the provider; sender registration per country; per-message cost |
| **Voice** | In-app speech recognition; calls through a telephony provider plus transcription (later) | Call metadata at the provider; recording consent differs by country; per-minute cost |

## 9. Phasing, settings and open decisions

### 9.1 Phases

| Phase | Delivers | Acceptance |
|---|---|---|
| **0** | The app; the channel layer (ledger, assurance gate, composer, app and email renderers); email in and out with reply-to-decide and reply-to-comment; email handle verification; the morning glance by email | The owner decides a real decision by mail reply and sees it applied with undo; the app does not repeat the notification; a forwarded decision mail is refused; walkthrough attached |
| **1** | Lucid Chat contact with device binding (needs LT-0002); Slack (`addressed` and `listen`, buttons, quiet line, progress capture at `suggest`); voice hold-to-talk; virtual parties by email | The owner works a full day from Lucid Chat only (glance, three decisions, two updates, one cited answer); a Slack thread yields a confirmed task and a progress update; the channel-ceiling suite is green |
| **2** | Teams, WhatsApp Business, Telegram, SMS on the same interface; parties on their channels with opt-in; cross-channel escalation; phone-call questions if C-O3 says yes | A virtual party is chased on WhatsApp and its reply closes a chore with evidence; every adapter passes the shared adapter contract suite |

### 9.2 Settings

**Company:** enabled channels and kill switches; presence mode defaults; quiet line time and content; token lifetimes; grace window; channel ceilings and per-class assurance (only stricter than §8.1 and §3.2); autonomy levels of channel progress capture and channel proposals; `listen` retention. **Person:** primary channel per cadence class; decision channel; quiet hours and time zone; interruption budget; escalation order; muted channels. **Channel:** presence mode; quiet line on or off; audience clearance (only tighter).

### 9.3 Open owner decisions (material only, one at a time)

Logged in `docs/12` as T-O8 (C-O1), T-O9 (C-O3) and T-O10 (C-O4); C-O2 is the lead's decision T28 (Slack first, the rest only when a teammate or party needs them, WhatsApp first for parties). The owner's first channel stays T-O3.

| Id | Question | Context and cost in plain words | Default if unanswered |
|---|---|---|---|
| C-O1 | May the agent run in `listen` mode in the company's Slack channels? | It reads every message in an opted-in channel, sends it to the model provider for extraction and keeps only cited excerpts. People speak differently when a system listens. Cost: about $5–20 a month of fast-model calls at Lucid's size. | `addressed` everywhere; `listen` per channel by its admin |
| C-O2 | Which messaging systems after Slack? | Each is a new external service with its own data terms (Meta processes WhatsApp content; Teams needs an Azure registration). Cost: about a week of work each; WhatsApp and SMS charge per message, a few dollars a month at Lucid's size. | Only what a real teammate or party needs; WhatsApp first for parties |
| C-O3 | May the system phone people and parties to ask a question? | The most intrusive channel; needs a telephony provider, consent rules per country and a spoken PIN. Cost: per-minute charges and about two weeks of work. | Not built until asked |
| C-O4 | May Lucid Total join Lucid Chat group conversations as a visible participant? | In a group it would receive every message, encrypted to it as a participant, so the group must accept it under Lucid Chat's consent rules; this changes Lucid Chat's product too. | 1:1 conversations only |

## 10. Changes required elsewhere (applied by the lead, 2026-10-28)

Slack moves from "later" (`docs/00` §4.2, `docs/02` §12, `docs/11` Phase 4) to Phase 1; email and the ledger from Phase 1 to Phase 0 (`docs/11`, `docs/02` §16). `docs/08` §6 gains a data-terms column and §8.3's rows; `docs/05` §11 gains `packages/channels`; `docs/07` §2 gains channel identities and assurance; `docs/00` §8 gains `docs/13` and `docs/15`.
