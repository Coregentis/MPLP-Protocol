---
sidebar_position: 1

doc_type: informative
normativity: informative
status: active
authority: Documentation Governance
description: "Evidence-centered enterprise scenario cards showing constraint → evidence → conformance mapping."
title: Enterprise Scenarios
keywords: [MPLP, Enterprise, Scenarios, Evidence, Conformance]
sidebar_label: Scenarios

---



# Enterprise Scenarios


## Purpose

These scenario cards illustrate how **enterprise constraints** map to **required evidence** and **conformance dimensions**.

Each card follows a strict format:
1. **Constraint** — The organizational pressure
2. **Required Evidence** — What MUST exist in the Evidence Pack
3. **Conformance Anchor** — Which kernel duties and evaluation dimensions apply

> [!IMPORTANT]
> These are NOT implementation guides.
> These are evidence-centered thought experiments.

---

## Scenario 1: Multi-Team Concurrent Modification

### Constraint

- Two teams modify overlapping system state concurrently
- No shared trust, no implicit ordering
- Each team has separate approval authority
- Conflicts must be traceable to resolution decisions

### Required Evidence

| Evidence Type | Purpose |
|:---|:---|
| **State-sync events** | Record all synchronization attempts |
| **Transaction boundaries** | Mark atomic operation scopes |
| **Conflict resolution records** | Document which version won and why |
| **Snapshot before/after divergence** | Enable rollback verification |
| **Confirm records per team** | Trace approval to team authority |

### Conformance Anchor

| Component | Reference |
|:---|:---|
| **Kernel Duties** | `state-sync`, `transaction`, `confirm` |
| **Golden Flow** | FLOW-02 (Multi-Agent Coordination) |
| **Conformance Class** | L3 (Execution) |
| **Evaluation Dimensions** | Lifecycle Completeness, Governance Gating |

### Key Question

> "If these two teams' changes collided, can we prove who approved what, when, and how the conflict was resolved?"

---

## Scenario 2: Cross-Quarter Semantic Versioning

### Constraint

- System has been running for 6+ months
- Protocol version was upgraded mid-quarter
- Auditor asks: "Show me all plans created under v1.0.0 vs v1.0.1"
- Legal requires proof that no v1.0.0 semantics were silently changed

### Required Evidence

| Evidence Type | Purpose |
|:---|:---|
| **Protocol version in all artifacts** | `meta.protocolVersion` in Context, Plan, Trace |
| **Change log** | Record of version upgrade decision |
| **Schema bundle version** | `meta.schemaVersion` matching protocol |
| **Approval record for upgrade** | Confirm with `decision: approved` |
| **Pre/post upgrade snapshots** | State comparison across version boundary |

### Conformance Anchor

| Component | Reference |
|:---|:---|
| **Kernel Duties** | `protocol-version`, `trace`, `transaction` |
| **Golden Flow** | FLOW-01 (Single Agent Lifecycle) |
| **Conformance Class** | L2 (Coordination) |
| **Evaluation Dimensions** | Version Declaration, Trace Integrity |

### Key Question

> "Can we separate all evidence by protocol version and prove upgrade approval?"

---

## Scenario 3: Post-Incident Audit & Accountability

### Constraint

- Agent system caused a production incident
- Management requires: "Who approved the plan that led to this?"
- Legal requires: "What was the execution trace?"
- Engineering requires: "Can we replay to find root cause?"

### Required Evidence

| Evidence Type | Purpose |
|:---|:---|
| **Full Trace with segments** | Complete execution timeline |
| **Confirm records** | Link decisions to approvers |
| **Plan with steps** | Intent vs. execution comparison |
| **Error events** | Failure points with timestamps |
| **Recovery events** | What actions were taken after failure |
| **Snapshot at failure point** | State when incident occurred |

### Conformance Anchor

| Component | Reference |
|:---|:---|
| **Kernel Duties** | `trace`, `error-handling`, `confirm`, `orchestration` |
| **Golden Flow** | FLOW-04 (Drift Detection & Recovery) |
| **Conformance Class** | L3 (Execution) |
| **Evaluation Dimensions** | Trace Integrity, Failure Bounding, Governance Gating |

### Key Question

> "Can we reconstruct the incident timeline, identify the decision chain, and prove bounded failure handling?"

---

## Summary

| Scenario | Primary Constraint | Key Evidence | Conformance Class |
|:---|:---|:---|:---|
| Multi-Team Concurrent | Coordination without trust | Conflict resolution records | L3 |
| Cross-Quarter Versioning | Long lifecycle auditability | Version-tagged artifacts | L2 |
| Post-Incident Audit | Accountability after failure | Full trace + approver chain | L3 |

## Related Documentation

- [Enterprise Context](./index.mdx) — Kernel-to-constraint mapping
- [Conformance Model](/docs/evaluation/conformance) — Conformance classes
- [Evidence Model](/docs/evaluation/conformance) — Evidence validity
- [Golden Flows](/docs/evaluation/golden-flows) — Reference behaviors

---

**Format**: Constraint → Evidence → Conformance  
**Purpose**: Evidence-centered thought experiments, NOT implementation guides
