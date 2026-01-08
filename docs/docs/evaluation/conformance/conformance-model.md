---
sidebar_position: 1
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-CONF-MODEL-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Conformance Model
sidebar_label: Conformance Model
description: "MPLP conformance evaluation: Conformance Model. Non-normative guidance for protocol conformance assessment."
authority: Documentation Governance
---

# Conformance Model

## 1. Purpose

This document **mirrors the definition of** how MPLP maps a running system to a conformance-evaluable object.

The core question this answers:

> "What exactly is being judged when we say 'this system is MPLP conformant'?"

## 2. Conformance Object

MPLP does **not** evaluate running processes directly. Instead, conformance is evaluated against an **Evidence Pack** — a static, exportable set of artifacts that represent one or more lifecycle executions.

```
┌─────────────────────────────────────────────────┐
│                 Evidence Pack                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Context  │ │   Plan   │ │  Trace   │  ...   │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
│  + Manifest (protocol version, export time)    │
└─────────────────────────────────────────────────┘
```

### 2.1 Why Evidence Pack?

| Property | Benefit |
|:---|:---|
| **Static** | Can be archived, shared, audited |
| **Self-describing** | Contains protocol version |
| **Vendor-neutral** | Pure JSON, no runtime hooks |
| **Replayable** | Trace can reconstruct timeline |

## 3. Conformance Classes

MPLP v1.0.0 defines **three conformance classes**, corresponding to protocol layers:

| Class | Layer | Minimum Requirements |
|:---|:---|:---|
| **L1 Conformant** | Data | Valid Context, Plan, Trace schemas |
| **L2 Conformant** | Coordination | L1 + Module interactions valid |
| **L3 Conformant** | Execution | L2 + Runtime invariants hold |

### 3.1 L1 Conformant (Data)

The system produces JSON objects that:
- Pass schema validation against `schemas/v2/*.json`
- Contain valid `meta.protocolVersion`
- Use UUID v4 for all IDs

### 3.2 L2 Conformant (Coordination)

The system additionally:
- Maintains Plan → Context linkage
- Records Confirm objects for gated actions
- Produces Trace segments for executed steps
- Follows module interaction contracts

### 3.3 L3 Conformant (Execution)

The system additionally:
- Emits runtime events (via Event Bus)
- Supports drift detection
- Provides snapshot/restore capability
- Enforces lifecycle state transitions

## 4. Protocol Version Binding

Conformance is **always scoped to a protocol version**:

```json
{
  "meta": {
    "protocolVersion": "1.0.0",
    "schemaVersion": "1.0.0"
  }
}
```

**Rule**: Evidence Pack version MUST match the protocol version being evaluated against.

## 5. Conformance Outcomes

Evaluation produces one of three outcomes:

| Outcome | Meaning |
|:---|:---|
| **CONFORMANT** | Evidence satisfies all requirements for the claimed class |
| **NON-CONFORMANT** | Evidence violates one or more requirements |
| **INCOMPLETE-EVIDENCE** | Cannot determine; evidence is missing or invalid |

### 5.1 Non-Binary Results

MPLP does **not** produce:
- Scores (0-100)
- Grades (A/B/C)
- Partial conformance percentages

Conformance is **binary per class** — a system is L1 conformant or it is not.

## 6. Evaluation Dimensions

Conformance is judged across these dimensions:

| Dimension | Question |
|:---|:---|
| **Schema Validity** | Do all objects pass JSON Schema validation? |
| **Lifecycle Completeness** | Is the Plan → Trace chain complete? |
| **Governance Gating** | Are high-risk actions gated by Confirm? |
| **Trace Integrity** | Can execution be reconstructed from Trace? |
| **Failure Bounding** | Do failures produce recoverable states? |
| **Version Declaration** | Is protocol version correctly declared? |

## 7. Relationship to Golden Flows

**Golden Flows** define the **reference behavior** for conformance evaluation.

| Golden Flow | Validates |
|:---|:---|
| GF-01 | Single Agent Lifecycle (L1/L2) |
| GF-02 | Multi-Agent Coordination (L2) |
| GF-03 | Human-in-the-Loop Gating (L2) |
| GF-04 | Drift Detection & Recovery (L3) |
| GF-05 | External Tool Integration (L3/L4) |

A system that passes GF-01 through GF-05 is **L3 Conformant**.

## 8. What Conformance Does NOT Guarantee

Conformance to MPLP does **not** guarantee:

- Correctness of the agent's decisions
- Quality of the generated plans
- Security of the underlying runtime
- Legal compliance with regulations
- Business suitability for any use case

Conformance only guarantees: **The system follows the protocol's structural and behavioral contracts.**

## 9. Related Documentation

- [Evidence Model](./evidence-model.md) — What constitutes valid evidence
- [Conformance Guide](/docs/guides/conformance-guide) — Practical evaluation steps
- [Golden Flows](/docs/evaluation/golden-flows) — Reference behavior definitions

---

**Scope**: Defines conformance objects, classes, outcomes, dimensions  
**Exclusions**: Certification, legal compliance, quality guarantees
