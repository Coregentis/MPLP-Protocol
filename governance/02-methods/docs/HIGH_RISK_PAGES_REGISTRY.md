---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "HIGH_RISK_PAGES_REGISTRY"
---


# High-Risk Pages Registry

**Version**: 1.0.0
**Authority**: MPGC
**Reference**: CHECKLIST-DOCS-GOV-01 v2.1.0

---

## Purpose

This registry defines which pages MUST receive full manual audit (Phase 1.2 + Phase 3.0 Assertion Index) before any Freeze Declaration can be issued.

---

## High-Risk Categories

### Category A — Core Protocol Boundaries
Pages that define L1/L2/L3/L4 boundaries.

| Path | Risk | Rationale |
|:---|:---|:---|
| `architecture/l1-core-protocol.md` | Critical | L1 foundation |
| `architecture/l2-coordination-governance.md` | Critical | L2 behavioral semantics |
| `architecture/l3-execution-orchestration.md` | Critical | L3 execution abstraction |
| `architecture/l4-integration-learning.md` | Critical | L4 integration layer |
| `architecture/l1-l4-architecture-deep-dive.md` | Critical | Full-layer overview = framework framing risk |

### Category B — Cross-cutting Kernel Duties
All 10 duties + orchestration are high risk for layer overreach.

| Path | Risk |
|:---|:---|
| `architecture/cross-cutting-kernel-duties/coordination-explained.md` | High |
| `architecture/cross-cutting-kernel-duties/event-bus-explained.md` | High |
| `architecture/cross-cutting-kernel-duties/state-sync-explained.md` | High |
| `architecture/cross-cutting-kernel-duties/learning-feedback-explained.md` | High |
| `architecture/cross-cutting-kernel-duties/error-handling-explained.md` | High |
| `architecture/cross-cutting-kernel-duties/performance-explained.md` | High |
| `architecture/cross-cutting-kernel-duties/observability-explained.md` | High |
| `architecture/cross-cutting-kernel-duties/security-explained.md` | High |
| `architecture/cross-cutting-kernel-duties/transaction-explained.md` | High |
| `architecture/cross-cutting-kernel-duties/orchestration-explained.md` | High |

### Category C — Golden Flows
Highest external exposure risk. Often mistaken for certification.

| Path | Risk | Rationale |
|:---|:---|:---|
| `golden-flows/index.md` | Critical | Overview = endorsement drift risk |
| `golden-flows/GF-01-*.md` | Critical | First flow = most visible |
| All `golden-flows/*.md` | High | Validation = perceived certification |

### Category D — Evaluation & Alignment
Certification / compliance framing risk.

| Path | Risk |
|:---|:---|
| `spec-to-eval-matrix.md` | High |
| `semantic-alignment-overview.md` | High |

### Category E — External Standard References
Pages mentioning ISO, NIST, W3C, EU AI Act, OpenTelemetry.

| Path | Risk | Trigger |
|:---|:---|:---|
| `observability/runtime-trace-format.md` | High | W3C Trace Context |
| `evaluation/standards/eu-ai-act-mapping.md` | High | EU AI Act mapping |
| Any page with ISO/NIST/EU AI Act | High | Authority inversion risk |

---

## Audit Requirements

| Category | 1.2.1 Layer | 1.2.2 Entry | 1.2.3 Subject/Action | 3.0 Assertion |
|:---:|:---:|:---:|:---:|:---:|
| A | ✅ | ✅ | ✅ | ✅ |
| B | ✅ | ✅ | ✅ | ✅ |
| C | ✅ | ✅ | ✅ | ✅ |
| D | ✅ | ✅ | ✅ | ✅ |
| E | ✅ | ✅ | ✅ | ✅ |

---

## Non-High-Risk Pages

All other `specification/**` pages:
- Phase 1.1 (Automated): Required
- Phase 2 (DTAA): Required
- Phase 3.1/3.2/3.3: Required
- Phase 1.2 / Phase 3.0: May be deferred to Track 1b (must log in Freeze Declaration)

---

**Registry Status**: Active
