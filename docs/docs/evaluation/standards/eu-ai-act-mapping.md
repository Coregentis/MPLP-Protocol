---
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-STD-EUAIA-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: EU AI Act (Articles 9–15) Mapping
sidebar_label: EU AI Act Mapping
sidebar_position: 4
description: "Informative mapping between EU AI Act high-risk AI system requirements (Articles 9–15) and MPLP v1.0.0 lifecycle evidence artifacts."
authority: none
---

# EU AI Act (Articles 9–15) Mapping

## Normative Status

> [!IMPORTANT]
> **Informative Only**
> This document is **informative** and **non-normative**.
> All mappings are illustrative only and do not imply certification, endorsement, or compliance with any external regulation.

## Scope Limitation

> [!WARNING]
> **No Automatic Conformance**
> Conformance with MPLP does **not** automatically guarantee conformance with the EU AI Act.
> Organizations must independently verify their conformance with regulatory requirements.

---

## 1. Scope

### In Scope

This mapping covers **EU AI Act Chapter III, Section 2** — Requirements for High-Risk AI Systems:

| Article | Title |
|:---|:---|
| Article 9 | Risk management system |
| Article 10 | Data and data governance |
| Article 11 | Technical documentation |
| Article 12 | Record-keeping |
| Article 13 | Transparency and provision of information to deployers |
| Article 14 | Human oversight |
| Article 15 | Accuracy, robustness and cybersecurity |

### Out of Scope (Explicit)

- Provider/deployer obligations beyond Articles 9–15 (e.g., quality management, post-market monitoring, incident reporting, conformity assessment)
- Product/risk classification (Annex III applicability) and legal determinations
- Any "certification", "badge", "endorsement", or "compliance score" framing

---

## 2. Mapping Methodology

We map each EU AI Act requirement to **MPLP evidence artifacts** produced by a system that follows the MPLP lifecycle:

| MPLP Artifact | Role |
|:---|:---|
| **Context** | Scope, environment, constraints, responsibility boundaries |
| **Plan** | Intended purpose, objectives, constraints, execution phases |
| **Confirm** | Human approvals/rejections, risk decisions, gated interventions |
| **Trace** | Event log, segment-level provenance, replayability, audit trail |
| **Role** | Declared capabilities, permissions, operational boundaries |

> **Interpretation Rule**: MPLP does not "implement security or accuracy" by itself; it structures **evidence and control points** so that implementations can be audited and governed.

---

## 3. Article Mapping

### Article 9 — Risk Management System

**Regulatory Intent**: Establish, implement, document, and maintain a continuous risk management system across the lifecycle.

**MPLP Mapping**: Strong

| Requirement | MPLP Support | MPLP Component |
|:---|:---|:---|
| 9.1 Establish risk management system | Context captures operational boundaries and constraints | `mplp-context.schema.json` |
| 9.2(a) Identify and analyze risks | Plan expresses objectives and constraints | `mplp-plan.schema.json` |
| 9.2(b) Evaluate risks | Confirm records risk acceptance/rejection | `mplp-confirm.schema.json` |
| 9.2(c) Evaluate post-market risks | Trace records monitoring signals/events | `mplp-trace.schema.json` |
| 9.2(d) Adopt risk management measures | Confirm gates enable intervention | `confirm_decision_core` |

> **Evidence**
> Type: Schema
> Source: schemas/v2/mplp-context.schema.json
> Pointer: #/properties/constraints

---

### Article 10 — Data and Data Governance

**Regulatory Intent**: Ensure data quality, relevance, representativeness, and governance; address biases and gaps.

**MPLP Mapping**: Partial

| Requirement | MPLP Support | MPLP Component |
|:---|:---|:---|
| 10.2(a) Design choices | Context captures design background | `context.root.domain` |
| 10.2(b) Data collection and origin | Events record data operations | `common/events.schema.json` |
| 10.2(f) Bias detection and mitigation | Drift Detection and Impact Analysis | Observability events |

> **Note**: MPLP is a protocol layer. Substantive data governance (datasets, pipelines, sampling, bias metrics) remains implementation-specific.

> **Evidence**
> Type: Schema
> Source: schemas/v2/mplp-context.schema.json
> Pointer: #/properties/root

---

### Article 11 — Technical Documentation

**Regulatory Intent**: Produce technical documentation before market placement, covering intended purpose, design, development, validation, and controls.

**MPLP Mapping**: Strong

| Requirement | MPLP Support | MPLP Component |
|:---|:---|:---|
| Annex IV(1) Intended purpose | Plan objective and Context summary | `plan.objective`, `context.summary` |
| Annex IV(2) System architecture | Context root defines domain and environment | `context.root` |
| Annex IV(3) Development process | Trace provides complete trail | `mplp-trace.schema.json` |
| Annex IV(5) Accuracy/robustness measures | Confirm decision records | `confirm.reason` |
| Annex IV(6) Monitoring and control | Events and Observability | `events[]` |

> **Evidence**
> Type: Schema
> Source: schemas/v2/mplp-plan.schema.json
> Pointer: #/properties/objective

---

### Article 12 — Record-keeping / Logging

**Regulatory Intent**: Automatic logging to enable traceability of system operations.

**MPLP Mapping**: Very Strong

| Requirement | MPLP Support | MPLP Component |
|:---|:---|:---|
| 12.1 Automatic event recording | Trace is designed as auditable event log | `mplp-trace.schema.json` |
| 12.2 Log traceability | Trace segments support hierarchical tracing | `trace_segment_core` → `parent_segment_id` |
| 12.3 Log retention | Governance locked field ensures immutability | `governance.locked` |

> **Evidence**
> Type: Schema
> Source: schemas/v2/mplp-trace.schema.json
> Pointer: #/properties/segments

---

### Article 13 — Transparency and Information to Deployers

**Regulatory Intent**: Provide sufficient transparency for deployers to understand capabilities/limitations and use appropriately.

**MPLP Mapping**: Strong

| Requirement | MPLP Support | MPLP Component |
|:---|:---|:---|
| 13.1 Sufficient transparency | Events and Trace provide explanation data | `common/events.schema.json` |
| 13.3(a) Provider identity | Context owner_role defines responsibility | `context.owner_role` |
| 13.3(b) System characteristics | Role declares capabilities and bounds | `mplp-role.schema.json` |
| 13.3(e) Output explanation | Trace + Events reason fields | `events[].reason` |

> **Evidence**
> Type: Schema
> Source: schemas/v2/mplp-role.schema.json
> Pointer: #/properties (capabilities definition)

---

### Article 14 — Human Oversight

**Regulatory Intent**: Effective human oversight and the ability to intervene/stop.

**MPLP Mapping**: Very Strong

| Requirement | MPLP Support | MPLP Component |
|:---|:---|:---|
| 14.1 Effective human oversight | **Confirm is the core human oversight mechanism** | `mplp-confirm.schema.json` |
| 14.2 Intervention capability | Confirm gates approve/reject/cancel | `decisions[].status` |
| 14.3(a) Understand capabilities | Role defines capabilities | `mplp-role.schema.json` |
| 14.4(a) Identify and stop operation | Confirm blocking + Plan status cancelled | `plan.status: cancelled` |

> **Evidence**
> Type: Schema
> Source: schemas/v2/mplp-confirm.schema.json
> Pointer: #/$defs/confirm_decision_core

---

### Article 15 — Accuracy, Robustness and Cybersecurity

**Regulatory Intent**: Achieve appropriate accuracy/robustness/cybersecurity across lifecycle; declare metrics; resist attacks.

**MPLP Mapping**: Partial

| Requirement | MPLP Support | MPLP Component |
|:---|:---|:---|
| 15.1 Appropriate accuracy levels | Trace provides verifiable execution records | `mplp-trace.schema.json` |
| 15.2 Resilience against errors | Status transitions track faults | `status: failed` enums |
| 15.3 Resist adversarial attacks | Role permission constraints | `mplp-role.schema.json` |
| 15.4 Feedback loop bias mitigation | Learning feedback artifacts (cross-cutting duty) | Learning feedback events |

> **Note**: MPLP is a protocol layer. Security implementation depends on specific runtime.

> **Evidence**
> Type: Schema
> Source: schemas/v2/mplp-trace.schema.json
> Pointer: #/properties/status

---

## 4. Coverage Summary

| EU AI Act Article | Mapping Strength | Primary MPLP Artifacts |
|:---|:---:|:---|
| Art. 9 Risk management | Strong | Context, Plan, Confirm, Trace |
| Art. 10 Data governance | Partial | Trace events, Context constraints |
| Art. 11 Technical documentation | Strong | Plan, Context, Trace, Confirm |
| Art. 12 Record-keeping | Very Strong | Trace (events + segments) |
| Art. 13 Transparency | Strong | Role, Context/Plan, Trace |
| Art. 14 Human oversight | Very Strong | Confirm, Plan status, Trace |
| Art. 15 Accuracy/robustness | Partial | Trace, Confirm, Role |

---

## 5. Disclaimer

This mapping is provided for **informational purposes only**. It does not constitute legal advice or certification.

Organizations seeking EU AI Act conformity should:
1. Consult with qualified legal and regulatory professionals
2. Conduct independent conformity assessments
3. Implement additional controls as required by their specific context

---

**Related Standards**: EU AI Act (Regulation (EU) 2024/1689)  
**See Also**: [ISO 42001 Mapping](./iso-mapping) | [NIST AI RMF Mapping](./nist-mapping)
