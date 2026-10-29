# Lucid Total — Policies

> A policy is a decision about behaviour: an instruction for people, for the AI, or for both, on how things operate. It is not a task. It can be added, changed and retired, and it reaches into the day to day of everything the company and its agents do. Written 2026-10-29 by the lead from the owner's instruction of the same day (T35). Binding for the product plan (`docs/02`), the self-operation doc (`docs/14`) and the living map (`docs/16`).

---

## 1. What a policy is

The owner's words: "policy is a decision of behaviour, instruction for the AI, it helps humans keep it, or it's for AI behaviour. Always testing the user interface fully and clicking and simulating every behaviour before a feature is considered done is a policy of development that we have. A policy can be 'check with person X before contacting investors'. Policies are things that can be added, can be changed, and can have wide-reaching effects on the day to day. They are not tasks; they are behavioural decisions on how things should operate."

So a policy:

- **states a behaviour**, not an outcome: *how* work is done, *who* is asked, *what* never happens;
- **applies to people, to the AI, or to both**; when it applies to the AI it is part of every context pack and every brief;
- **is enforced in one of three ways**: a **gate** (nothing passes until the policy is met: a feature is not done without its walkthrough), a **check** (the system verifies and reports: dependency currency, model class), a **reminder** (the AI reminds at the moment it matters: "this contacts an investor; the policy says ask Noa first");
- **has a reach**: the processes, kinds of items, domains and people it touches; adopting or changing it shows that reach before it takes effect;
- **is a decision**: adopted, changed and retired through the decision mechanism (`docs/02` §6), with its reasoning, by someone with the standing to make it, dated and logged.

## 2. The record

| Field | Meaning |
|---|---|
| `id`, `title` | Short, in the imperative or the declarative: "Every feature is walked through in the real interface before it is done". |
| `body` | The rule in full, with its exceptions. |
| `scope` | `development`, `company`, `ai`, `people`, `money`, `customers`, `security`, or a domain of `docs/02` §2.1. |
| `applies` | `people`, `ai`, or both. |
| `enforce` | `gate`, `check`, `reminder`. |
| `reach` | The processes (`docs/14` §6.1), item kinds, domains, roles and places it touches; computed by the AI on adoption and kept current. |
| `since`, `by`, `decision` | When it took effect, who adopted it, the decision record. |
| `status` | `proposed`, `in force`, `suspended`, `retired`; a history of changes. |
| `source` | Where it came from: an instruction (Lucid Chat's `docs/09` L-numbers), an incident review, a law, a contract. |

## 3. How the AI uses policies

1. **Before it acts.** The policies in force whose reach includes the action are in the context of every AI run and every agent brief (`docs/14` §9.2). The AI states which policy it is following when the policy changes what it would otherwise do.
2. **Gates.** A gate policy is a hard stop in the process: the done check of a feature fails without the walkthrough evidence; a merge waits for the local verification; a message to an investor is held for the named person. The hold is visible as an ask, in the Now view, on the tile.
3. **Checks.** A check policy runs as a signal (`docs/14` §3): dependency currency, model class on build sessions, content in logs. A failing check is an item.
4. **Reminders.** The AI reminds at the moment: in Talk, in the brief, on the tile, never as a wall of rules.
5. **Reach preview.** When a policy is proposed or changed, the AI shows what it will change in the day to day: which processes gain a gate, which items are affected now, which people will be asked more often. The owner decides on that picture.
6. **Conflicts.** Two policies in conflict are an ask for the owner; until decided, the stricter applies.

## 4. Where policies appear

- **The Policies list** (`docs/04-mocks/living-map-2/`, More → Policies): every policy in force with its scope, enforcement, who it applies to, since and by, and its source; "Add a policy" opens a decision with the reach preview.
- **The Now view**: a new or changed policy is an event with high importance; a gate that holds something is an ask.
- **A task's view**: the policies that gate it (phase 1).
- **The map**: not as a layer; a policy is not a place. A gate that holds a task shows as the task's ask flag.

## 5. The first policies, recorded

Lucid Chat's, from its `CLAUDE.md` and `docs/09-decision-log.md` (the owner's instructions are already policies; this names them as such):

| Policy | Scope | Applies | Enforce | Source |
|---|---|---|---|---|
| Every feature is walked through in the real interface (iOS simulator, Android emulator, browser; every control clicked, every behaviour simulated, evidence attached) before it is done | development | people, AI | gate | T35 (owner, 2026-10-29); `docs/14` §5 of Lucid Chat |
| No Docker on the development machine; the Railway dev stack; Compose for CI only | development | people, AI | gate | L59 |
| Workers on strong models only; never a small model for builds; Fable for security-sensitive and core work and orchestration | ai | AI | check | L325, L363 |
| Verification is local at every merge; nothing waits on GitHub Actions; a push is a backup | development | people, AI | gate | L419, L483 |
| Only decisions with deep implications go to the owner, one at a time, with full context; small things become settings | company | AI | reminder | L425 |
| No message content in logs, metrics, traces or crash reports | development | people, AI | gate | `docs/05` of Lucid Chat |
| Current, best-supported technology; nothing deprecated or end-of-life; no early jump that breaks the packages we rely on | development | people, AI | check | L390, ADR-0020 |
| Railway first: no new external service without a written case | company | people, AI | gate | L425 |

The example company's (generated, for the simulation): check with Noa before contacting investors; the walkthrough policy; agents never message a customer without a person reading first; spend above the monthly model budget needs the owner; restricted and payroll data never reach a non-ZDR model; fail-closed conversations stay fail-closed.

## 6. Settings and open questions

- Enforcement defaults per scope, the reminder channel, and who may propose a policy are platform settings.
- Open for the owner, when it matters: whether a policy may be adopted by the lead without the owner for the `development` scope (default: yes, logged, reversible), and whether policies are visible to every member or by role (default: every member sees the policies that apply to them).
