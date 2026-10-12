# MAIL — Project Memory

## 0. Purpose

This file records durable project decisions.

It is not a substitute for PRD, Architecture, Design, Rules, or Tasks.

Those files define requirements and boundaries.

Memory records why important decisions were made.

---

# 1. Product Identity

Project name:

**Mail**

Naming decision: Affirmed. Do NOT adopt `Threadline`. `Mail` is the canonical product name.

Product type:

**Original email web/app**

Future product direction (not an implemented capability): Mail may eventually
support its own application users and MAIL-owned mailboxes, with optional
connections to external email providers. MAIL identity, MAIL mailbox ownership,
and external provider credentials are separate conceptual boundaries.

The public domain name, identity provider, session mechanism,
credential-storage mechanism, mailbox ownership or delegation model, and
email-delivery infrastructure remain undecided. This direction does not
authorize mailbox hosting or email-delivery implementation.

Core thesis:

> Mail is an email workspace organized around human intent, attention, and unfinished work.

---

# 2. Project Boundary

Mail must not clone:

- Gmail
- Outlook
- Yahoo Mail
- Proton Mail
- Apple Mail
- Thunderbird
- Fastmail

Research may study these products for:

- expectations
- standards
- accessibility
- usability problems
- workflow weaknesses
- interoperability

---

# 3. Current Phase

Current phase:

**Phase 5 — Core Implementation (In Progress)**

Phase 0: Complete.
Phase 1: Complete and Approved.
Phase 2: Complete and Approved.
Phase 3: Complete and Approved.
Phase 4: Complete and Approved.
Phase 4.5: Complete and Approved.
Phase 5: Explicitly authorized by user approval.

---

# 4. Core Product Hypothesis & Commitment Vocabulary

The core product model organizes email around human intent, attention, and unfinished work.

### Primary Attention States (Hypotheses requiring validation)
- **New**: Unreviewed incoming communication.
- **Needs action**: Requires deliberate user response or task execution.
- **Waiting**: Awaiting action/reply from an external party (optional expected party, sensible default).
- **Reference**: Informational or retained material.
- **Done**: Concluded work, filed out of active view.

*Status: Product hypotheses, not validated user preferences.*
*Boundary: `Dismissed` is not a separate commitment state.*

### Orthogonal Operational Markers (Hypotheses)
- **Snoozed until [time]**: Temporarily hidden from active view.
- **Scheduled for [time]**: Outbound queue.
- **Failed/Blocked**: Failure requiring remediation.

### Conversation Model Decision
Conversation state is strictly derived from constituent message/commitment states. There is no independent or competing lifecycle (such as Open, Active, Waiting, Resolved, Muted).

### Tier-1 Scope Decisions from Re-Audit
- **Unresolved**: Not a Tier-1 authoritative state (deferred to Tier-2 manual marker). No AI-driven authoritative Unresolved state.
- **Confidence labels**: Removed from Tier 1 UX. No probability/confidence scores. Suggestions must be explicit and user-confirmable.
- **Activity**: Contextual explanation in Tier 1 (what happened, why this is here), not a standalone primary navigation surface.
- **Navigation hypothesis**: Attention, Waiting, Later, All mail, Search + Compose (persistent action). Attention as default landing view is a design hypothesis requiring validation.

---

# 5. Important Product Decision

Do not optimize for feature count.

Optimize for:

- reduced effort
- reduced ambiguity
- fewer mistakes
- faster retrieval
- clearer conversations
- safer actions
- lower cognitive load

---

# 6. Latency Decision

The project uses a strict perceived-responsiveness target.

Common local UI interactions should target:

**p95 <= 20 ms**

The project does not claim that Internet or provider network requests can complete in 20 ms.

Network operations must therefore use:

- caching
- asynchronous requests
- optimistic behavior only where safe
- immediate pending feedback
- deterministic reconciliation
- recovery on failure

Never fake success.

---

# 7. AI Decision

AI is optional.

AI may assist interpretation.

AI never silently controls:

- sending
- deletion
- recipient changes
- irreversible classification
- permanent movement

---

# 8. Novelty Decision

Novelty must come from:

- information hierarchy
- workflow
- attention
- organization
- search
- conversation comprehension
- attachment handling
- safety

Not from decorative visual differences.

---

# 9. Validation Philosophy

Unvalidated assumptions must be labeled as hypotheses.

The project must distinguish:

- verified fact
- observed competitor behavior
- research finding
- design hypothesis
- architectural decision
- implementation result

Never present an inference as established fact.

---

# 10. Evidence Discipline

When research is used:

- identify the source
- preserve the claim's scope
- avoid unsupported generalization
- distinguish evidence from inference
- avoid fabricated statistics
- avoid fabricated user preferences
- avoid claiming a competitor lacks a feature without verification

When uncertain:

**mark the uncertainty and investigate.**

---

# 11. Change Discipline

Approved decisions become controlled constraints.

If implementation conflicts with an approved decision:

1. stop
2. identify conflict
3. explain impact
4. propose alternatives
5. recommend one
6. wait for approval

---

# 12. Verification Discipline

A feature is not complete because code exists.

Completion requires:

- application run
- tests
- primary interaction tests
- keyboard verification
- responsive verification
- browser error inspection
- API failure inspection
- loading verification
- error verification
- empty-state verification
- undo verification
- accessibility verification

---

# 13. Unresolved Validation Questions (Phase 1 → Phase 2)

The re-audit established these 10 core validation hypotheses requiring ongoing testing in Phase 2:

1. Commitment navigation vs. conventional inbox preference
2. Primary state vocabulary comprehension (New, Needs action, Waiting, Reference, Done)
3. Attention as default landing view vs. conventional chronological inbox
4. Waiting semantics and user willingness to track outbound expectations
5. Commitment inference threshold and user tolerance for suggestions
6. Provider boundary abstraction vs. provider-specific feature expectations
7. Shared/delegated mail ownership in a commitment-centered model
8. Search coverage explanations and user trust in declared boundaries
9. Activity/timeline usefulness vs. visual cognitive clutter
10. First-release audience prioritization (overloaded knowledge workers vs. broad consumer)

Do not resolve these silently.
