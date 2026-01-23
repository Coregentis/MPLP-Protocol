---
sidebar_position: 3
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-CONF-DIM-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Evaluation Dimensions
sidebar_label: Evaluation Dimensions
description: "MPLP conformance evaluation: Evaluation Dimensions. Non-normative guidance for protocol conformance assessment."
authority: none
---

# Evaluation Dimensions

## 1. Purpose

This document defines the **axes (dimensions)** used to evaluate MPLP conformance.

Each dimension answers a specific question about the evidence. Together, they provide a complete picture of conformance.

## 2. Evaluation Axes

### 2.1 Schema Validity

> **Question**: Do all objects pass JSON Schema validation?

| Requirement | Evidence | Pass Criteria |
|:---|:---|:---|
| Context valid | `mplp-context.schema.json` | No validation errors |
| Plan valid | `mplp-plan.schema.json` | No validation errors |
| Trace valid | `mplp-trace.schema.json` | No validation errors |
| Confirm valid | `mplp-confirm.schema.json` | No validation errors |

**Evaluation Method**: Run `mplp validate` against all exported artifacts.

### 2.2 Lifecycle Completeness

> **Question**: Is the Plan → Trace chain complete?

| Requirement | Evidence | Pass Criteria |
|:---|:---|:---|
| Context exists | `Context` object | `context_id` present |
| Plan linked | `Plan.context_id` | References valid Context |
| Trace linked | `Trace.context_id`, `Trace.plan_id` | References valid Context and Plan |
| Steps traced | `Trace.segments[]` | Every executed step has a segment |

**Evaluation Method**: Traverse evidence chain, verify all links resolve.

### 2.3 Governance Gating

> **Question**: Are high-risk actions gated by Confirm?

| Requirement | Evidence | Pass Criteria |
|:---|:---|:---|
| Gated steps identified | `Plan.steps[].requires_confirm` | Steps marked when needed |
| Confirm objects exist | `Confirm` objects | One per gated step |
| Decisions recorded | `Confirm.decisions[]` | Status is `approved` or `rejected` |
| Execution blocked | `Trace` segments | Gated steps not executed until approved |

**Evaluation Method**: Cross-reference Plan steps with Confirm objects.

### 2.4 Trace Integrity

> **Question**: Can execution be reconstructed from Trace?

| Requirement | Evidence | Pass Criteria |
|:---|:---|:---|
| Timestamps present | `segment.started_at`, `segment.finished_at` | ISO-8601 format |
| Order determinable | Timestamps | No logical conflicts |
| Parent-child valid | `segment.parent_span_id` | References valid parent |
| Status recorded | `segment.status` | One of: completed, failed, skipped |

**Evaluation Method**: Reconstruct timeline from Trace, verify logical consistency.

### 2.5 Failure Bounding

> **Question**: Do failures produce recoverable states?

| Requirement | Evidence | Pass Criteria |
|:---|:---|:---|
| Failures recorded | `Trace.segments[].status = 'failed'` | Explicit failure status |
| Recovery attempted | Recovery events or segments | Retry, skip, or rollback recorded |
| Terminal state clear | `Plan.status` or `Trace.status` | Final status unambiguous |
| No orphaned state | All objects | Terminal states are final |

**Evaluation Method**: Identify failed segments, verify recovery or clean termination.

### 2.6 Version Declaration

> **Question**: Is protocol version correctly declared?

| Requirement | Evidence | Pass Criteria |
|:---|:---|:---|
| Protocol version | `meta.protocolVersion` | Present in all objects |
| Schema version | `meta.schemaVersion` | Present in all objects |
| Version match | All objects | Consistent across evidence pack |

**Evaluation Method**: Extract version from all objects, verify consistency.

## 3. Dimension-to-Class Mapping

Each conformance class requires passing specific dimensions:

| Dimension | L1 | L2 | L3 |
|:---|:---:|:---:|:---:|
| Schema Validity | ✅ | ✅ | ✅ |
| Lifecycle Completeness | – | ✅ | ✅ |
| Governance Gating | – | ✅ | ✅ |
| Trace Integrity | – | ✅ | ✅ |
| Failure Bounding | – | – | ✅ |
| Version Declaration | ✅ | ✅ | ✅ |

## 4. Evaluation Weight

All dimensions are **binary** (pass/fail). There is no weighting or scoring.

A single failure in any required dimension results in **NON-CONFORMANT** for that class.

## 5. Future Dimensions

The following dimensions are **not evaluated in v1.0.0** but may be added in future versions:

| Future Dimension | Question | Status |
|:---|:---|:---|
| Multi-agent coherence | Do agents coordinate correctly? | Planned for v1.1 |
| Performance bounds | Are timeouts respected? | Under consideration |
| Security boundary | Is sandboxing enforced? | Under consideration |

## 6. Related Documentation

- [Conformance Model](./conformance-model.md) — Conformance classes and outcomes
- [Evidence Model](./evidence-model.md) — Evidence validity requirements
- [Golden Flows](/docs/evaluation/golden-flows) — Reference test cases

---

**Scope**: Defines 6 evaluation dimensions for v1.0.0  
**Exclusions**: Scoring, weighting, future dimensions
