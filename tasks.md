# MAIL — Task Plan

## 0. Execution Rule

Tasks are phase-gated.

The agent must stop at the end of every phase.

The next phase requires explicit approval.

No task may silently advance the project into another phase.

---

# Phase 0 — Research

## Goal

Understand established email products and recurring user problems.

### Tasks

- [x] Study major email clients.
- [x] Identify recurring workflow problems.
- [x] Identify organization problems.
- [x] Identify search problems.
- [x] Identify conversation problems.
- [x] Identify attachment problems.
- [x] Identify security problems.
- [x] Identify accessibility expectations.
- [x] Define originality boundaries.
- [x] Produce competitor problem matrix.
- [x] Produce pain-point inventory.

### Gate

STOP.

Report findings before Phase 1.

---

# Phase 1 — Product Definition

## Goal

Define what Mail is before designing how it looks.

### Tasks

- [x] Define product thesis.
- [x] Define target-user hypothesis.
- [x] Define core user jobs.
- [x] Define preserved familiar concepts.
- [x] Define redesigned problem areas.
- [x] Define attention-model hypothesis.
- [x] Define conversation hypothesis.
- [x] Define search hypothesis.
- [x] Define attachment hypothesis.
- [x] Define safety hypothesis.
- [x] Define AI boundary.
- [x] Define feature hierarchy.
- [x] Define novelty validation framework.
- [x] Define success metrics.
- [x] Define product anti-goals.

### Gate

- Phase 0/1 re-audit: Complete (Conditional Pass resolved).
- Approved Phase 1 corrections incorporated into source-of-truth files.
- Status: **Phase 1 Complete (Approved)**.
- Gate status: Passed. Phase 2 — UX Architecture explicitly authorized.

---

# Phase 2 — UX Architecture

## Status

**Complete** (Phase 2 checkpoint pushed to GitHub).

## Goal

Define the interaction system.

### Tasks

- [x] Screen map.
- [x] Navigation model.
- [x] Attention workspace.
- [x] Inbox/message model.
- [x] Conversation model.
- [x] Composer model.
- [x] Search model.
- [x] Attachment discovery model.
- [x] Contacts model.
- [x] Account switching model.
- [x] Settings model.
- [x] Responsive behavior.
- [x] Keyboard model.
- [x] Accessibility interaction model.

### Gate

Status: **Complete** (Specification drafted in `phase_2_ux_architecture.md`).

STOP.

Require explicit user approval before Phase 3 (Design System).

---

# Phase 3 — Design System

## Status

**Complete** (Specification drafted in `phase_3_design_system.md`).

### Tasks

- [x] Typography.
- [x] Spacing.
- [x] Colors.
- [x] Surfaces.
- [x] Borders.
- [x] Component geometry.
- [x] Icons.
- [x] Motion.
- [x] Interaction states.
- [x] Responsive tokens.
- [x] Accessibility tokens.

### Gate

Status: **Complete** (Approved).

STOP.

Require explicit approval.

---

# Phase 4 — Technical Architecture

## Status

**Complete** (Specification drafted in `phase_4_technical_architecture.md`).

### Tasks

- [x] Frontend architecture.
- [x] Backend architecture.
- [x] Domain model.
- [x] API contracts.
- [x] Provider abstraction.
- [x] Authentication architecture.
- [x] Database schema.
- [x] Synchronization model.
- [x] Search architecture.
- [x] Security architecture.
- [x] Performance architecture.
- [x] Observability.
- [x] Test architecture.

### Gate

Status: **Complete** (Awaiting explicit user approval for Phase 5).

STOP.

Require explicit approval.

---

# Phase 4.5 — Directory & File Structure

## Status

**Complete** (Specification drafted in `phase_4_5_directory_structure.md`).

### Tasks

- [x] Design complete implementation directory tree.
- [x] Map architecture boundaries to directories (frontend, backend, sync, etc.).
- [x] Isolate provider-specific code.
- [x] Separate authoritative domain state from AI metadata.
- [x] Ensure support for optimistic/vector-timestamp sync model.
- [x] Verify structure against all governing documents.

### Gate

Status: **Complete** (Approved).

STOP.

Require explicit approval.

---

# Phase 5 — Core Implementation

## Status

**In Progress** (Authorized after Phase 4.5 approval).

## Goal

Build the smallest complete usable Mail experience.

### Tasks

- [x] Application shell.
- [x] Authentication boundary.
- [x] Provider abstraction.
- [x] Demo provider.
- [x] Message listing.
- [x] Message reading.
- [x] Conversations.
- [x] Compose.
- [x] Reply.
- [x] Drafts.
- [x] Search.
- [x] Attachments.
- [x] Archive.
- [x] Trash.
- [x] Spam.
- [x] Undo.
- [x] Responsive behavior.
- [x] Accessibility fundamentals.

### Gate

Run verification.

STOP.

---

# Phase 6 — Advanced Workflows

### Tasks

- [x] Attention states.
- [x] Waiting-state workflow.
- [x] Follow-up workflow.
- [x] Advanced search.
- [x] Object-level attachment discovery.
- [x] Scheduling.
- [x] Smart views.
- [x] Explainable automation.
- [x] Optional AI features.

Every feature requires evidence and validation.

### Gate

STOP.

---

# Phase 7 — Security and Accessibility Audit

### Tasks

- [x] XSS audit.
- [x] CSRF audit.
- [x] injection audit.
- [x] HTML isolation audit.
- [x] link safety audit.
- [ ] attachment safety audit.
- [ ] authentication audit.
- [ ] authorization audit.
- [ ] session audit.
- [ ] keyboard audit.
- [ ] screen-reader audit.
- [ ] contrast audit.
- [ ] reduced-motion audit.
- [ ] focus-order audit.

### Gate

STOP.

---

# Phase 8 — Usability Audit

### Tasks

- [ ] Find old attachment.
- [ ] Find unread sender mail.
- [ ] Reply safely.
- [ ] Find awaiting-response mail.
- [ ] Recover deleted mail.
- [ ] Write and schedule mail.
- [ ] Find invoice by meaning.
- [ ] Measure clicks.
- [ ] Measure time.
- [ ] Measure ambiguity.
- [ ] Measure mistakes.
- [ ] Measure recovery.

Compare against established clients where practical.

### Gate

STOP.

---

# Phase 9 — Production Hardening

### Tasks

- [ ] Performance.
- [ ] Security.
- [ ] Responsiveness.
- [ ] Accessibility.
- [ ] Failure recovery.
- [ ] Browser compatibility.
- [ ] Provider failure behavior.
- [ ] Offline behavior.
- [ ] Large-inbox behavior.
- [ ] Final regression tests.

### Final Gate

No production claim without verification evidence.

