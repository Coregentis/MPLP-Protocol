---
entry_surface: repository
entry_model_class: primary
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "MPLP-CANDIDATE-BACKLOG-v0.1"
title: "MPLP Candidate Backlog v0.1"
surface_role: canonical
---

# MPLP Candidate Backlog v0.1

> **Non-Normative Candidate Tracking Only**
>
> This document records downstream-driven candidate abstractions only.
> It does **not** amend `schemas/v2/`, invariants, module duties, package
> surfaces, or any other frozen MPLP core truth.

## 1. Purpose

This backlog captures bounded downstream pressure that has now become visible
after:

- a downstream product multi-cell foundation line
- a downstream runtime substrate runtime blocker intake and foundation refresh

Those downstream pressures do **not** automatically justify protocol promotion.

The role of this backlog is therefore narrow:

- keep candidate pressure visible
- keep it separate from frozen protocol law
- record what evidence would be required before any candidate could advance

## 2. Intake Boundary

Only the following candidate families are in scope for this backlog wave:

1. `Delegation Envelope`
2. `Delivery / Acceptance Contract Envelope`
3. `Constraint / Stop Condition / Escalation Envelope`

Everything else must stay out of MPLP for now, including:

- `Cell`
- collection semantics
- downstream product-specific role semantics
- `Crew Compiler`
- KPI, OKR, brand, or business data families
- `Business Pack` or `Metrics Pack`
- role/model/tool policy packaging
- product cards or summary-projection objects
- downstream runtime substrate private runtime objects

## 3. Candidate Status Scale

Each candidate must end in exactly one of:

- `candidate_only`
- `candidate_but_not_ready`
- `not_protocol_fit_at_this_time`

## 4. Candidate Classification

| Candidate Family | Downstream Pressure Present? | Cross-Implementation Plausibility | Protocol-Fit Strength | Current Maturity | Promotion Readiness | Current Status |
| --- | --- | --- | --- | --- | --- | --- |
| `Delegation Envelope` | Yes. Downstream structures increasingly need bounded delegation or handoff semantics. | Plausible, but not yet evidenced across multiple independent runtimes or products. | Medium. Delegation can be protocol-shaped, but current pressure is still entangled with runtime orchestration and product workflow. | Early. Conceptual only. | Not ready. | `candidate_only` |
| `Delivery / Acceptance Contract Envelope` | Yes. Downstream work increasingly distinguishes requested work, returned delivery posture, and acceptance posture. | Plausible, but current examples are still close to business-operating language. | Medium-low. It may become protocol-relevant, but the neutral kernel is not yet proven. | Early. Conceptual only. | Not ready. | `candidate_but_not_ready` |
| `Constraint / Stop Condition / Escalation Envelope` | Yes. Downstream pressure is strong around constraints, stop conditions, approval-like gates, and escalation posture. | Plausible. This family looks more cross-runtime than the others, but still lacks repeated independent validation. | Medium-high. It sits closest to portable execution-safety and escalation semantics. | Early-to-mid. Pressure is real, but not yet stabilized. | Not ready. | `candidate_but_not_ready` |

## 5. Candidate Notes

### 5.1 Delegation Envelope

Why tracked:

- downstream structures now need a bounded way to express delegation, handoff,
  or transfer of responsibility
- that abstraction may matter beyond one product if it can stay
  implementation-independent

Why not yet protocol law:

- current evidence is still mixed with runtime-family orchestration and product
  workflow structure
- no accepted MPLP schema, invariant, or module surface exists for this family
- repeated validation across more than one runtime/product is missing

### 5.2 Delivery / Acceptance Contract Envelope

Why tracked:

- downstream work increasingly separates requested work, returned delivery
  posture, and acceptance posture
- that separation may eventually have protocol value if it proves portable

Why not yet protocol law:

- current examples remain close to business-facing operating semantics
- the vendor-neutral kernel is not yet proven
- MPLP must not absorb product-shaped delivery semantics by convenience

### 5.3 Constraint / Stop Condition / Escalation Envelope

Why tracked:

- downstream pressure is now clear around constraints, stop conditions, and
  escalation or approval-like posture
- this family sits closest to portable interface obligations around bounded
  execution safety

Why not yet protocol law:

- current evidence still overlaps with runtime policy, approval handling, and
  product-specific decision flow
- no accepted MPLP-level schema or invariant family exists here today
- repeated independent validation is still missing

## 6. Net Backlog Rule

The correct current MPLP posture is:

- track these candidates
- keep them visible
- keep them outside frozen core law
- refuse promotion by usage volume alone

No candidate in this backlog becomes MPLP law unless a later separate wave
provides the promotion evidence required by
`MPLP-BOUNDARY-AND-PROMOTION-RULES-v0.1`.
