# MAIL — Architecture

## 0. Status

- Phase: Phase 5 Core Implementation (In Progress). Phase 4.5 complete.
- Architecture implementation: Authorized.
- This document defines constraints and boundaries.
- Detailed technology selection requires explicit approval.
- No implementation may silently override this document.

---

# 1. Architectural Principle

Mail must feel immediate.

The architecture must separate:

- presentation
- interaction state
- application logic
- email domain
- provider integration
- persistence
- synchronization
- search
- security
- networking
- authentication
- observability

UI components must not directly depend on provider-specific APIs.

---

# 2. Latency Architecture

## 2.1 The 0–20 ms contract

The product must target p95 <= 20 ms for common **local interactions**.

This is an interaction-budget requirement.

It is not a promise that:

- servers respond in 20 ms
- databases respond in 20 ms
- external providers respond in 20 ms
- internet round trips complete in 20 ms

Those depend on systems Mail does not control.

## 2.2 Local interaction budget

Target:

- input recognition: immediate
- local state update: <= 20 ms p95
- cached view switch: <= 20 ms p95
- selection update: <= 20 ms p95
- local filter update: <= 20 ms p95
- menu open: <= 20 ms p95

Avoid synchronous work that blocks the main/UI thread.

## 2.3 Network boundary

Network work must be asynchronous.

The interface must:

1. acknowledge the user's action immediately
2. render a pending state
3. perform the network operation
4. reconcile server state
5. rollback safely on failure

Never display success before success is known.

Optimistic behavior is permitted only when rollback is deterministic.

---

# 3. Perceived Latency

Mail must optimize perceived responsiveness.

Required principles:

- local-first rendering where data exists
- cached content before remote refresh
- skeletons only when useful
- immediate input acknowledgement
- background synchronization
- incremental rendering
- pagination or virtualization for large datasets
- request deduplication
- cancellation of obsolete requests

Do not show a spinner for work that can render locally.

Do not block the entire application because one request is slow.

---

# 4. Rendering Architecture

Large inboxes must not render every message simultaneously.

Use an appropriate strategy such as:

- virtualization
- pagination
- incremental rendering

The chosen strategy must be validated through profiling.

No performance technique is mandatory merely because it is fashionable.

---

# 5. State Boundaries

Separate:

### UI state

Examples:

- selection
- open panels
- focus
- menus
- temporary input

### Domain state

Examples:

- messages
- conversations
- attachments
- contacts
- drafts
- mailboxes

### Server synchronization state

Examples:

- pending
- confirmed
- failed
- stale
- syncing
- offline

### Derived state

Examples:

- attention classification
- search interpretation
- conversation summaries
- attachment relationships

Derived state must never silently overwrite authoritative source data.

---

# 6. Provider Abstraction

Define an internal provider boundary.

Conceptually:

```text
Mail UI
  ↓
Application Services
  ↓
Mail Domain
  ↓
Provider Adapter
  ↓
Provider
```

Provider-specific APIs must terminate at the adapter boundary.

The UI must not contain provider-specific assumptions.

Provider adapters represent optional external-provider capabilities. They must
not be treated as the required application identity path for every MAIL user.

---

# 7. Domain Model

Core domain concepts should include, at minimum:

- MAIL application user
- MAIL-owned mailbox
- Optional external provider connection
- Account
- Mailbox
- Message
- Conversation
- Participant
- Attachment
- Draft
- SearchQuery
- SearchResult
- AttentionState (Hypothesis: New, Needs action, Waiting, Reference, Done; Orthogonal: Snoozed, Scheduled, Failed/Blocked)
- SyncState
- SecuritySignal

*Note on Conversation*: Conversation status is strictly derived from the commitment states of its constituent messages and commitments. There is no independent or competing conversation lifecycle engine.

These are conceptual boundaries.

Fields must be finalized during technical architecture work.

These concepts are distinct: application identity and its session establish the
MAIL principal; mailbox ownership and authorization govern access to MAIL
mailboxes; external provider credentials authorize a separate provider
connection. Their relationship and implementation remain undecided. This
conceptual separation does not define mailbox hosting, public addressing, or
email delivery.

---

# 8. Source-of-Truth Hierarchy

Use this precedence:

1. authoritative provider data
2. validated local persisted state
3. derived application state
4. UI state
5. presentation-only interpretation

Never overwrite authoritative data with an inference.

AI output is derived information.

AI output is never authoritative email content, and Tier 1 does not use confidence or probability scores.

---

# 9. Synchronization

Synchronization must be incremental where the provider supports it.

Requirements:

- avoid full reloads
- deduplicate requests
- reconcile changes deterministically
- handle stale data
- handle offline transitions
- preserve unsent drafts
- retry safely
- avoid duplicate sends

A sync failure must not corrupt local user state.

---

# 10. Search Architecture

Search should support two layers:

### Basic intent layer

User expresses what they want.

### Structured query layer

The system converts intent into explicit constraints.

The interpreted query must be inspectable.

Search must distinguish:

- authoritative results
- locally cached results
- incomplete results
- failed providers

Never imply complete search coverage when synchronization is incomplete.

---

# 11. Security Architecture

Security boundaries must exist below the UI.

Required areas:

- authentication
- session management
- authorization
- application identity and session boundary
- mailbox ownership and authorization boundary
- external provider connection and credential boundary
- CSRF protection
- input validation
- output encoding
- HTML sanitization
- attachment handling
- link safety
- remote-content isolation
- secure cookies
- secret handling
- provider token protection

MAIL may eventually support MAIL-owned mailboxes and optional external provider
connections, independent of MAIL application identity. The public domain name,
identity provider, session mechanism, credential-storage mechanism, and mailbox
ownership or delegation model remain undecided. This is future direction, not
implemented capability or authorization to build email-delivery infrastructure.

Email HTML must not execute with application privileges.

---

# 12. Email Rendering Isolation

Untrusted email content must be treated as hostile input.

The architecture must prevent:

- script execution
- application-origin access
- credential access
- unsafe event handlers
- malicious embedded content

The exact isolation mechanism requires technical design validation.

Do not assume sanitization alone is sufficient without testing.

---

# 13. Attachment Boundary

Attachments must be treated as separate security-sensitive objects.

Track conceptually:

- filename
- MIME type
- size
- source message
- source conversation
- availability
- security state

Downloads must not silently execute files.

---

# 14. Error Architecture

Errors must have structured categories.

Examples:

- validation
- authentication
- authorization
- provider
- network
- sync
- search
- security
- storage
- unknown

User-facing errors must contain useful recovery actions.

Developer diagnostics must remain separate from user messaging.

---

# 15. Observability

Measure:

- local interaction latency
- network latency
- render latency
- search latency
- sync latency
- provider failures
- error rates
- dropped requests
- retry counts
- rollback events

Latency measurements must distinguish:

**local interaction latency**

from

**network latency**

from

**end-to-end task latency**.

Never report one as another.

---

# 16. Performance Budgets

Initial architectural budgets:

- common local interaction: <= 20 ms p95
- no avoidable long synchronous task: > 50 ms
- main-thread work must be profiled
- large lists must use measured rendering strategy
- unnecessary network requests are defects
- unnecessary rerenders are defects when measurable

These are targets.

They must be benchmarked on defined hardware and browser profiles.

A benchmark without a defined environment is insufficient evidence.

---

# 17. Offline and Failure Behavior

Mail must remain usable where cached data permits.

Offline mode must:

- clearly indicate stale state
- permit safe local work
- preserve drafts
- queue only operations with deterministic semantics
- reconcile after reconnection

Never queue an irreversible operation blindly.

---

# 18. Architectural Anti-Patterns

Never:

- couple UI directly to provider APIs
- put business logic inside visual components
- use global mutable state without a boundary
- block UI on network calls
- fake network success
- hide provider failures
- duplicate domain models without reconciliation rules
- use `any` to bypass type safety
- disable linting to pass builds
- remove tests because they fail
- hard-code demo data into production behavior

---

# 19. Architecture Change Control

Changing an approved boundary requires:

1. stop
2. identify conflict
3. document impact
4. propose alternatives
5. recommend one
6. obtain approval
7. update source-of-truth files
8. implement
9. verify

No silent architecture drift.
