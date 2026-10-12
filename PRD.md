# MAIL — Product Requirements Document

## 0. Document Status

- Product: Mail
- Purpose: Source-of-truth product requirements for a first-principles email web/app.
- Current phase: Phase 5 Core Implementation (In Progress). Phase 4.5 complete.
- Implementation status: Authorized.
- Rule: Do not begin a later phase without explicit approval.
- Rule: Approved decisions become controlled constraints.

---

# 1. Product Vision

Mail is an email workspace organized around human intent, attention, and unfinished work.

Mail must not be a Gmail, Outlook, Yahoo Mail, Proton Mail, Apple Mail, Thunderbird, or Fastmail clone.

Mail may preserve familiar email concepts when they reduce learning cost.

Mail must redesign underlying workflows where existing conventions create unnecessary effort.

Core question:

> What does this email mean for the user, and what should happen next?

---

# 2. Product Goals

Mail must make email:

- easier to understand
- faster to navigate
- less cognitively demanding
- safer against mistakes
- easier to organize
- better for large inboxes
- clearer for conversations
- accessible to non-technical users
- efficient for power users
- responsive across desktop, tablet, and mobile

The product must optimize user outcomes rather than feature count.

---

# 3. Non-Goals

Mail must not:

- clone an existing email client
- add features solely because competitors have them
- become a task manager disguised as email
- become an AI chatbot with email attached
- hide original email content permanently
- silently send or delete mail through automation
- use novelty as a substitute for usability
- claim network latency guarantees it cannot control
- fabricate integrations
- ship decorative controls without working behavior

---

# 4. Product Thesis

> Email should be an attention workspace, not a message warehouse.

Traditional concepts such as inbox, sent, drafts, archive, spam, and trash may remain available.

They must not automatically dictate the primary information architecture.

The primary experience should help users understand:

1. What needs my attention?
2. What requires my action?
3. What am I waiting for?
4. What can I safely review later?
5. What information am I looking for?
6. What unfinished work remains?

---

# 5. Target User Hypothesis

Primary target hypothesis: overloaded knowledge workers who use email for both communication and personal work management.

Representative profiles:

- students
- professionals
- researchers
- freelancers
- managers
- administrators

Status: Explicitly an unvalidated hypothesis requiring validation.
Do not treat this list as validated user research, and do not present the research as evidence that this is definitively the highest-pain or optimal initial audience. Phase 2 must account for eventual audience validation.

---

# 6. Core User Jobs

Mail should optimize:

1. Find what needs attention.
2. Find information remembered by meaning.
3. Understand long conversations.
4. Identify messages awaiting a response.
5. Send mail without common mistakes.
6. Find attachments without manually locating their message.
7. Recover from accidental actions.
8. Understand meaningful security risks.

---

# 7. Core Product Model & Commitment Architecture

Mail organizes email around human intent and commitment states rather than message storage alone.

### 7.1 Primary Attention States (Hypothesis)

The primary state vocabulary is:

- **New**: Unreviewed incoming item requiring initial orientation.
- **Needs action**: Requires deliberate work, decision, or response from the user.
- **Waiting**: Blocked on or awaiting action/reply from an external party.
- **Reference**: Informational or retained material not requiring active work.
- **Done**: Concluded work, filed out of active attention.

*Status: Product hypotheses requiring empirical validation, not proven user preferences.*
*Boundary: Do not reintroduce `Dismissed` as a separate commitment state.*

### 7.2 Orthogonal Markers (Hypothesis)

Temporal and operational qualifiers that exist orthogonally to primary states:

- **Snoozed until [time]**: Temporarily deferred from active attention until a specified trigger.
- **Scheduled for [time]**: Outbound communication queued for future dispatch.
- **Failed/Blocked**: Operation or delivery failure requiring remediation.

### 7.3 Conversation State Model

Conversations do NOT possess an independent, competing lifecycle (such as Open, Active, Waiting, Resolved, Muted).
Conversation status is strictly **derived** from the commitment states of its constituent messages and commitments. Phase 2 must not create a parallel lifecycle model.

### 7.4 Unresolved State Boundary

`Unresolved` is NOT a Tier-1 authoritative state. It is deferred to Tier 2 as an optional manual user marker.
AI-driven authoritative `Unresolved` states are strictly forbidden. Any AI suggestion must remain visibly an assistive recommendation and never silently become authoritative.

### 7.5 Confidence Labels Boundary

Confidence and probability percentages/scores are removed from Tier 1 UX.
Tier 1 relies exclusively on:
1. User-created commitments, or
2. Clearly labeled suggestions that the user explicitly accepts or dismisses.
Confidence-score UI is deferred to future Tier-2 exploration.

### 7.6 Activity Surface Boundary

Activity is NOT a standalone Tier-1 primary navigation surface.
Tier 1 provides contextual explanations (what happened, why this is here, what changed, what action caused the state). A standalone timeline/audit log surface remains a Tier-2 hypothesis.

### 7.7 Waiting Semantics

Waiting must not require mandatory entry of an expected party or completion date.
Waiting consists of:
- State: Waiting
- Context: Optional expected party or note
- Sensible default: "waiting for reply" when inferred from a preceding user send.
Mandatory data entry is prohibited.

### 7.8 Navigation Model Hypothesis

Current Phase 1 navigation hypothesis:

1. **Attention** (Proposed default landing view — design hypothesis requiring validation)
2. **Waiting**
3. **Later**
4. **All mail**
5. **Search**

Persistent Global Action:
- **Compose**

Secondary surfaces:
- **Done**: Filter/toggle within All mail
- **Attachments**: Search facet / discovery filter
- **Contacts**: Secondary contextual drawer/surface
- **Activity**: Contextual explanation within threads/items; Tier-2 standalone surface

*Status: Design hypothesis. Phase 2 must architect and test this structure without treating it as empirically proven.*

### 7.9 Unresolved Validation Questions (Phase 1 → Phase 2)

The following 10 items are established validation hypotheses:

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

---

# 8. Core Capabilities

## Communication

- send
- receive
- reply
- reply-all
- forward
- CC
- BCC

## Message lifecycle

- inbox
- sent
- drafts
- archive
- trash
- spam

## Discovery

- search
- filters
- sender lookup
- recipient lookup
- attachment lookup
- date lookup
- account lookup

## Workflow

- drafts
- scheduled sending
- snooze or equivalent
- follow-up handling
- undo
- bulk operations

## Context

- conversations
- contacts
- attachments
- accounts
- relevant metadata

Every exposed control must have real behavior.

---

# 9. Search Requirements

Search is a first-class capability.

Basic search must remain approachable.

Advanced search must support structured dimensions including:

- sender
- recipient
- date
- attachment
- file type
- unread status
- category
- subject
- conversation
- account

Mail should investigate natural-language intent.

Example:

> PDF from Rahul last month.

The interpretation must remain inspectable and editable.

Search must never fabricate results.

---

# 10. Conversation Requirements

Users must understand:

- who said what
- chronology
- recipient changes
- attachments
- unanswered questions
- quoted material
- draft versus sent content

Conversation state must be strictly derived from the commitment states of its constituent messages and commitments. No independent or competing lifecycle model (such as Open, Active, Resolved, Muted) is permitted.

Repetitive quoted content may be collapsed.

Original content must remain recoverable.

AI or derived summaries must be visually distinguishable from original email content.

---

# 11. Composer Requirements

The composer must support:

- To
- CC
- BCC
- subject
- rich text
- attachments
- drag-and-drop
- inline images
- signatures
- autosave
- discard
- scheduled sending
- drafts
- keyboard shortcuts

The composer must detect or investigate:

- missing mentioned attachments
- empty subject
- suspicious recipient
- accidental reply-all
- unusually large recipient lists
- malformed addresses
- duplicate recipients
- attachment size issues
- unexpected confidential recipients

Warnings must be contextual and proportionate.

---

# 12. Safety Requirements

Mail must protect against:

- XSS
- CSRF
- injection
- malicious HTML
- remote tracking
- unsafe links
- dangerous attachments
- session theft
- credential exposure
- insecure cookies
- unauthorized API access

Email HTML must never execute directly in the application origin.

Security warnings must explain why something is risky.

---

# 13. Accessibility Requirements

Target WCAG 2.2 AA.

Support:

- keyboard-only operation
- visible focus
- semantic HTML
- screen readers
- sufficient contrast
- reduced motion
- scalable text
- understandable labels
- accessible dialogs
- accessible menus
- accessible forms
- logical tab order

Critical information must not depend on color alone.

---

# 14. Responsive Requirements

Desktop, tablet, and mobile are deliberate experiences.

Desktop may prioritize information density.

Tablet must adapt interaction patterns.

Mobile must prioritize essential actions.

Reading and composing must remain high-quality on every supported viewport.

---

# 15. Performance Requirement

## Local interaction latency

Mail must target:

- p50 <= 10 ms for common local UI interactions
- p95 <= 20 ms for common local UI interactions
- no avoidable main-thread blocking above 50 ms
- animation work aligned with frame budgets

Examples include:

- selecting a message
- opening a local cached view
- changing a local filter
- expanding a thread section
- opening a menu
- changing selection
- toggling a local state

## Network latency boundary

A web application cannot guarantee 0–20 ms end-to-end network latency.

Therefore:

- 0–20 ms applies to local interaction response.
- Network-dependent actions must use caching where safe.
- Optimistic UI may be used where rollback is reliable.
- Loading states must appear immediately.
- Network requests must not freeze the interface.
- Background synchronization must not block primary interaction.
- Failed network actions must remain recoverable.
- Measured network latency must be reported separately.

The product must never fake a completed server operation.

---

# 16. Data and Provider Boundary

The product core must remain provider-independent.

Provider-specific behavior belongs behind adapters.

The core domain must not depend directly on Gmail, Outlook, Yahoo, or another provider API.

### Future product direction (not an implemented capability)

Mail may eventually support its own application users and MAIL-owned mailboxes, as
well as optional connections to external email providers. A MAIL identity is
distinct from an external provider connection; connecting an external provider
must not be assumed to be required for every MAIL user.

The public domain name, identity provider, session mechanism,
credential-storage mechanism, mailbox ownership or delegation model, and
email-delivery infrastructure remain undecided. This direction does not
authorize mailbox hosting or email-delivery implementation.

Conceptual provider capabilities:

- authenticate
- listMailboxes
- listMessages
- getMessage
- sendMessage
- saveDraft
- deleteMessage
- moveMessage
- searchMessages
- downloadAttachment
- syncChanges

---

# 17. Demo Data Boundary

When provider integration is unavailable:

- use clearly identified demo data
- keep demo data separate from production integration
- never pretend demo actions reached a provider
- never hard-code demo results into business logic

---

# 18. Empty and Failure States

Every major view must define:

- loading
- refreshing
- empty
- offline
- partial failure
- full failure
- retrying
- success
- permission denied

Never expose raw stack traces.

Never leave unexplained blank screens.

---

# 19. Novelty Requirement

Novelty must emerge from:

- workflow
- information hierarchy
- organization
- safety
- search
- conversation comprehension
- attachment handling
- attention management

Every novel mechanism must document:

1. Problem
2. Existing limitation
3. Proposed solution
4. User benefit
5. Trade-off
6. Failure mode
7. Fallback
8. Measurement

---

# 20. AI Boundary

AI is optional.

AI may assist with:

- search interpretation
- thread summarization
- action-item extraction
- draft assistance
- phishing explanations

AI must never silently:

- send mail
- delete mail
- modify recipients
- permanently classify critical mail
- permanently move important mail

Users retain final control.

---

# 21. Usability Evaluation

Evaluate:

- clicks
- navigation changes
- time
- ambiguity
- mistakes
- recovery difficulty

Core scenarios:

- find an old attachment
- find unread mail from a person
- reply without reply-all mistakes
- find mail awaiting response
- recover deleted content
- write and schedule mail
- locate an invoice without remembering sender

---

# 22. Product Success

Mail succeeds if users can understand and act on email with less effort.

Success must be demonstrated through measured workflows.

Visual novelty alone is not success.

Feature count is not success.
