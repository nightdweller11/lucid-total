# Lucid Total — Security, Identity, Rights and Secrets

> Threat model, identity, the rights model that keeps a flat company governable, the sealed envelope mechanism for secrets, data handling and audit. Companion to `docs/05-architecture.md` and `docs/06-ai-architecture.md`.
>
> **Created:** 2026-10-28 · **Status:** v1 draft.

---

## 1. What we protect

| Asset | Sensitivity | Threats |
|---|---|---|
| Company work data (items, comments, decisions, evidence) | Confidential; the company's plan and state | Unauthorised read (ex-collaborator, leaked session), tampering, mass deletion, exfiltration by a compromised agent |
| Secrets in envelopes (API keys, credentials, signing keys) | Critical | Server compromise, log leakage, a model or agent reading them, replay of a reveal |
| Customer PII in issues | Regulated (GDPR, Israel privacy law) | Over-collection, exposure in logs or prompts, retention beyond need |
| Identity and sessions | Critical | Account takeover, token theft, SSO misconfiguration |
| Agent credentials and rights | Critical | An agent acting beyond its rights, prompt injection steering an agent, budget exhaustion |
| Payroll, contracts and personal data of staff (People and Finance compartments) | Highest; regulated and reputationally critical | Insider over-read, exfiltration through an export or a model prompt, a party seeing beyond its compartment, tampering with amounts |
| Parties' data and the company's correspondence with them | Confidential; contractual | A party seeing another party's or the company's internals; impersonation of the company by email; a stale engagement keeping access |
| Audit trail | Integrity | Tampering, gaps |
| Availability | High | Outbox parked, scheduler lost, index missing; the company cannot see or act |

## 2. Identity

- **Bootstrap mode (Phase 0):** one owner account authenticated with a strong secret the owner keeps in their vault (`~/.lucid-total/` on the lead's machine, mode 600, never in the repository), rotated when SSO lands; service accounts for agents with API keys (hashed at rest, prefix-identifiable, scoped). Sessions: HttpOnly, Secure, SameSite cookies for the web app; bearer keys for the API; device list and revoke.
- **Google SSO (the first tracked task, LT-0001):** OpenID Connect through an adapter (`packages/adapters/sso`); allow-list of workspace domains and explicit invitations; JIT user creation with a default role; the owner secret retired for people; service accounts unchanged. Passkeys later.
- **Guests:** invited by email to specific items; a magic link that creates a limited session; visibility scoped to those items.
- **Agents:** service accounts with `kind`, rights, budgets and an "acts on behalf of" rule (the coordinator acts for the owner within the owner's rights intersected with its own).
- **Channel identities (`docs/15` §3):** each person or party has verified handles per channel (email address, Lucid Chat identity, Slack user id, phone number), verified once on first use by a challenge; every channel carries an **assurance level** (A0 unverified · A1 verified handle · A2 signed token to that recipient · A3 device-bound app session) and the action registry's permission classes map to a minimum assurance (reversible needs A2; irreversible, spend and admin need A3, i.e. the app, or Lucid Chat once the device is bound); decision tokens are bound to one recipient and expire, so a forwarded mail cannot decide; inbound mail is checked for DMARC alignment; links never sign anyone in.

## 3. Rights model

- **Roles per domain** (lead, member, viewer) plus **company roles** (owner, admin). A person may hold roles in several domains.
- **Decision kinds** (`docs/02` §2.4) map to roles per domain; materiality thresholds decide owner routing.
- **Permission classes** on actions: `read`, `reversible`, `irreversible`, `outbound`, `spend`, `admin`; each class has a confirmation rule and the autonomy level that may skip the tap.
- **Visibility**: company (default), domain, grouping, item (guests), plus the **sensitivity** level of an item or comment (`normal`, `sensitive`, `restricted`) which limits who sees it, whether it is indexed, and whether a model may receive it.
- **Enforcement** is in the action layer and the data layer (row filters by visibility), never in the UI alone and never by the prompt. An attempt beyond rights becomes a proposal where that makes sense, else a refusal with an audit event.
- **Rights changes** are `admin` actions with preview and audit; granting rights above one's own is impossible.

### 3b. Compartments (parties and sensitive internal roles)

A **compartment** is a resolved set of visibility rules: the items, groupings, people, asks, comments and evidence a principal may see and act on. Parties always have one (from their engagements and a template: contractor, board, accounting, legal, supplier, customer organisation, system); internal roles may have one for payroll-class data (People and Finance). Rules: compartments are enforced by the data layer's visibility resolver on every read and write (row filters), by the retrieval filter and by the tool rights of any assistant scoped to the principal; a compartment never includes the map of the company or roll-ups across domains; engagement end dates revoke access automatically; **direct, virtual and system modes share one party identity** so history and compartment carry over when a profile materialises; every cross-compartment attempt is audited; the cross-compartment suite (every query under each compartment template returns nothing outside it) runs at every merge.

## 4. Audit

Append-only `events` with actor, on-behalf-of, reason, preview hash, before/after, causation; a per-item history; an admin audit view with filters; daily export of the event log to the bucket. **Integrity:** each event carries a hash chained to the previous event of its tenant and the chain head is published daily to the bucket and signed with a server key held outside the database, so tampering with or deleting audit rows is detectable; the daily integrity check is itself an incident when it fails. **Read audit:** reads of `payroll` and `restricted` data (who, what, when, from where) are events too, visible to the People and Finance leads and the owner. Reversibility is stamped by the system (the undo function exists and succeeded in preview), never claimed by a model. Agent runs record their tool calls and the previews they produced.

## 5. Sealed envelopes (secrets)

**Goal:** deliver API keys and other secrets through Lucid Total (chat, chores, items) so that the server, the logs, the index, the model and anyone but the named recipients never see plaintext.

**Design (end-to-end encryption in the browser; the server stores ciphertext):**

1. **Recipient keys.** Each person and each service account has an envelope key pair generated on their device (WebCrypto, X25519 for agreement, with the public key registered on the server). People get a recovery path through a second device or the owner's re-share; agents (the coordinator) hold their private key in their local vault (`~/.lucid-total/envelope-key`, mode 600).
2. **Sealing.** The sender opens the dedicated **Send a secret** window (never the chat input, never a comment): names recipients, expiry, reveal policy (one-time, N reveals, until expiry), optional note; pastes the secret. The browser generates a fresh symmetric key per envelope, encrypts the payload (AES-256-GCM), wraps the key to each recipient's public key, and sends only ciphertext and wrapped keys. The server stores the envelope with metadata (sender, recipients, expiry, policy, uses) and a content-free label.
3. **Delivery.** Recipients are notified ("Envelope delivered"); the chat and items show the envelope by id and label only. The assistant can create the envelope *shell* (recipients, expiry, link to the chore) and route it, but the secret is typed only in the sealed window by the human.
4. **Reveal.** In the dedicated **Reveal** window the recipient's device unwraps the key and decrypts; the reveal is counted and audited (who, when, from which device); one-time envelopes are marked consumed; a countdown hides the value; copy-to-clipboard clears after a short time (setting).
5. **Agents.** A service account reveals through the API with its key: the server returns ciphertext and the wrapped key; decryption happens in the agent's process; the agent's tooling is told to place the value into its target (a Railway variable, a local vault file) and never print it. The coordinator protocol (`docs/08` §5) documents the exact call.
6. **Rotation and revocation.** Envelopes link to the accounts and services that use them (`uses[]`); expiry raises a rotation chore; revocation marks the envelope consumed and notifies recipients; a compromised recipient key is rotated by re-sealing to the new key.
7. **What the server never has:** plaintext, the symmetric key, a recipient's private key. **What the index and the model never have:** anything from the `envelopes` table beyond label and metadata.
8. **Threats considered:** a malicious server could serve a wrong public key (mitigation: key fingerprints shown on first contact; the owner verifies agents' fingerprints once); XSS in the web app (mitigation: strict CSP, no inline scripts, dependency scanning; the reveal window is an isolated route); clipboard leakage (short clear); screenshots (the reveal window warns).

## 6. Data handling

- **Sensitivity levels** on items and comments; `restricted` items are excluded from logs, retrieval and prompts and visible to named people only.
- **Customer PII** in issues: minimised at intake (the triage agent proposes redactions), masked in logs, retained per the issue kind's retention setting, deletable on request with the deletion recorded.
- **Logs** carry ids, kinds, field names and sizes, never item bodies or comment text; secrets never (lint rule inherited from Lucid Chat's plugin, adapted).
- **Backups and exports** are encrypted at rest in the bucket; exports to the owner are delivered as envelopes or as authenticated downloads.
- **Model providers** receive company work data under the provider's terms (30-day retention for Fable; ZDR where offered for the other classes), never `restricted` content, never envelopes.
- **Tenancy**: `tenant_id` on every row; row filters at the data layer; a cross-tenant test suite from day one even though v1 runs one tenant.

### 6b. Sensitivity classes and field-level encryption

| Class | Examples | Who | Index / model | Logs | Storage |
|---|---|---|---|---|---|
| `normal` | ordinary work | company by visibility | yes | ids only | plain |
| `sensitive` | customer PII in issues, financial figures, vendor terms | domain roles, named people | excluded from prompts unless the thread is cleared; indexed for search by cleared people only | masked | plain, masked in exports |
| `restricted` | contracts, legal matters, board material, personal matters | named people and the compartment | never | never | plain rows, restricted by compartment; attachments encrypted at rest with per-tenant keys |
| `payroll` | salaries, bank details, identity numbers, health and leave records | People and Finance leads, the owner; the employee for their own | never | never, not even field names of values | **field-level encryption**: each value encrypted (AES-256-GCM) under a per-tenant data key wrapped by a master key in the server's secret store (Railway variable today, a KMS adapter later); decrypted only in the request that serves a cleared principal; every read audited; exports only as envelopes |

Field-level encryption uses the same envelope-style primitives as §5 but server-side keys, because payroll data must be searchable and reportable by cleared staff and processed by connectors (payroll providers), which end-to-end encryption would prevent. The master key never lives in the database; rotation re-wraps the data key; the integrity chain (§4) covers the encrypted fields' hashes so amounts cannot be altered unnoticed.

## 7. Application security

- Strict CSP, no inline scripts, SRI for the few CDN assets (or self-hosted), HTTPS only, HSTS; CSRF protection on cookie sessions; rate limits per account and per API key; input validation from the registry schemas; idempotency keys; file uploads validated by type and size with thumbnails generated in the worker.
- Dependencies: current majors only, `npm view … deprecated` before adding, lockfile, audit in the local verification; secret scanning (gitleaks) in the pre-commit hooks.
- Threat model reviewed when a trust boundary moves; a pen-test before Lucid Total serves a second company.

## 8. Agent safety

- Rights intersected with the acting person's; budgets per run and per day; permission classes; autonomy levels; kill-switches per channel and a company-wide AI pause.
- Prompt injection: untrusted content marked, sentinels sanitised, admin tools undisclosed, numbers grounded, every consequential action previewed by the action layer (not described by the model).
- Agent keys: hashed at rest, rotated on a schedule, scoped; the coordinator's key never leaves the lead's machine's vault.

### 9b. Gates before admitting externals

Before the first party is admitted in direct mode, and again before the first party with payroll or board access: the cross-tenant and cross-compartment suites pass; the field-level encryption invariants hold (no plaintext of a `payroll` field in any table, log, index, export or prompt record); the audit chain verifies; the external view's walkthrough is attached; a dependency and secret scan is clean; and, for payroll or board access, an external pen-test report exists. These gates are items on the Lucid Total program (`docs/11`).

## 9. Incident response

Lucid Total's own incidents are incidents in Lucid Total (parked outbox, scheduler lease lost, index refused, auth failures spike, budget exhausted, audit chain mismatch, compartment violation detected, a party's engagement expired with open access). Runbooks: key rotation, session revocation, envelope re-seal, restore from backup, provider outage (switch model class or pause AI). The owner is paged through their configured channel for security incidents.
