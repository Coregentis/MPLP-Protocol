---
sidebar_position: 91
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-SEMANTIC-ANCHOR-REGISTRY-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Semantic Anchor Registry
sidebar_label: Semantic Anchors
description: "MPLP specification: Semantic Anchor Registry. Normative protocol requirements."
authority: Documentation Governance
---

# Semantic Anchor Registry

**Purpose**: Provides a unified semantic coordinate system for the entire MPLP documentation ecosystem.

---

## 1. Concept Anchors (CA)

Core concept definitions. Each anchor corresponds to an indivisible protocol concept.

| ID | Concept | Definition Source | Schema | Description |
|:---|:---|:---|:---|:---|
| **CA-01** | Context | [context-module.md](/docs/specification/modules/context-module) | `mplp-context.schema.json` | Execution boundary and environment definition |
| **CA-02** | Plan | [plan-module.md](/docs/specification/modules/plan-module) | `mplp-plan.schema.json` | Step-based task structure |
| **CA-03** | Trace | [trace-module.md](/docs/specification/modules/trace-module) | `mplp-trace.schema.json` | Execution history record |
| **CA-04** | Confirm | [confirm-module.md](/docs/specification/modules/confirm-module) | `mplp-confirm.schema.json` | Governance approval gate |
| **CA-05** | Collab | [collab-module.md](/docs/specification/modules/collab-module) | `mplp-collab.schema.json` | Multi-agent session |
| **CA-06** | Role | [role-module.md](/docs/specification/modules/role-module) | `mplp-role.schema.json` | Agent role and capabilities |
| **CA-07** | Dialog | [dialog-module.md](/docs/specification/modules/dialog-module) | `mplp-dialog.schema.json` | Multi-turn conversation |
| **CA-08** | Extension | [extension-module.md](/docs/specification/modules/extension-module) | `mplp-extension.schema.json` | Extension point registration |
| **CA-09** | Network | [network-module.md](/docs/specification/modules/network-module) | `mplp-network.schema.json` | Communication topology |
| **CA-10** | Event | [observability](/docs/specification/observability/observability-overview) | `mplp-*-event.schema.json` | Observability events |

### 1.1 Derived Concepts

Important concepts derived from core concepts (no independent schema):

| ID | Concept | Parent | Definition Source | Description |
|:---|:---|:---|:---|:---|
| **CA-11** | Step | CA-02 (Plan) | [plan-module.md](/docs/specification/modules/plan-module) | Single execution unit in Plan |
| **CA-12** | Segment | CA-03 (Trace) | [trace-module.md](/docs/specification/modules/trace-module) | Single record fragment in Trace |
| **CA-13** | Decision | CA-04 (Confirm) | [confirm-module.md](/docs/specification/modules/confirm-module) | Approval decision in Confirm |
| **CA-14** | Participant | CA-05 (Collab) | [collab-module.md](/docs/specification/modules/collab-module) | Participant in Collab |
| **CA-15** | Message | CA-07 (Dialog) | [dialog-module.md](/docs/specification/modules/dialog-module) | Single message in Dialog |

---

## 2. Lifecycle Anchors (LA)

Lifecycle stages defining temporal state transitions of protocol objects.

| ID | Lifecycle Stage | Transition | Definition Source | Evaluation Ref | Description |
|:---|:---|:---|:---|:---|:---|
| **LA-01** | Intent → Plan | Intent Parsing | [l2-coordination-governance.md](/docs/specification/architecture/l2-coordination-governance) | - | Parse intent into structured plan |
| **LA-02** | Plan → Confirm | Governance Gate | [confirm-module.md](/docs/specification/modules/confirm-module) | FLOW-05 | High-risk action approval |
| **LA-03** | Confirm → Execution | Approval Release | [l3-execution-orchestration.md](/docs/specification/architecture/l3-execution-orchestration) | FLOW-01 | Execute after approval |
| **LA-04** | Execution → Trace | Observability | [trace-module.md](/docs/specification/modules/trace-module) | FLOW-01 | Execution recording |
| **LA-05** | Trace → Snapshot | State Capture | [l3-execution-orchestration.md](/docs/specification/architecture/l3-execution-orchestration) | - | State snapshot |
| **LA-06** | Drift → Recovery | Drift Detection | [l3-execution-orchestration.md](/docs/specification/architecture/l3-execution-orchestration) | FLOW-03 | Drift detection and recovery |
| **LA-07** | Delta → Replan | Delta Intent | [l2-coordination-governance.md](/docs/specification/architecture/l2-coordination-governance) | FLOW-04 | Incremental intent replanning |

### 2.1 Status Enumerations

| Object | Status Enum | Definition Source |
|:---|:---|:---|
| Context | `draft → active → suspended → archived → closed` | CA-01 |
| Plan | `draft → proposed → approved → in_progress → completed/failed/cancelled` | CA-02 |
| Trace | `pending → running → completed/failed/cancelled` | CA-03 |
| Confirm | `pending → approved/rejected/cancelled` | CA-04 |
| Collab | `draft → active → suspended → completed/cancelled` | CA-05 |

---

## 3. Governance Anchors (GA)

Governance and authority related anchors defining protocol control boundaries.

| ID | Governance Concept | Definition Source | Scope | Description |
|:---|:---|:---|:---|:---|
| **GA-01** | MPGC Authority | [protocol-truth-index.md](/docs/evaluation/governance/protocol-truth-index) | Protocol | Protocol Governance Committee authority |
| **GA-02** | Frozen Status | [versioning-policy.md](/docs/evaluation/governance/versioning-policy) | Protocol | Frozen spec immutability |
| **GA-03** | Normative vs Informative | [conformance-model.md](/docs/evaluation/conformance/conformance-model) | Documentation | Normative/informative document classification |
| **GA-04** | Self-Declaration | [EXTERNAL_TRUST_OVERVIEW.md](/docs/evaluation/governance/EXTERNAL_TRUST_OVERVIEW) | Conformance | Self-declaration conformance model |
| **GA-05** | Forbidden Terms | [protocol-truth-index.md](/docs/evaluation/governance/protocol-truth-index) | All | Forbidden terminology list |

### 3.1 Authority Split

| Layer | Authority | Scope |
|:---|:---|:---|
| Protocol | MPGC | Schemas, Invariants, Normative Specification docs |
| Evaluation | None (informative) | Golden Flow scenarios, conformance/evidence models |
| Documentation | Documentation Governance | `docs/*` informative content |
| Website | Website Governance | `mplp.io` content |

---

## 4. Architectural Anchors (AA)

Four-layer architecture anchors defining protocol structural layers.

| ID | Layer | Definition Source | Scope | Description |
|:---|:---|:---|:---|:---|
| **AA-01** | L1 Core Protocol | [l1-core-protocol.md](/docs/specification/architecture/l1-core-protocol) | Schema | Declarative schema + invariants |
| **AA-02** | L2 Coordination | [l2-coordination-governance.md](/docs/specification/architecture/l2-coordination-governance) | Module | Module lifecycle and state |
| **AA-03** | L3 Execution | [l3-execution-orchestration.md](/docs/specification/architecture/l3-execution-orchestration) | Runtime | Execution orchestration and state management |
| **AA-04** | L4 Integration | [l4-integration-infra.md](/docs/specification/architecture/l4-integration-infra) | Infra | External system integration |

---

## 5. Kernel Duty Anchors (KD)

11 cross-cutting concerns defining protocol horizontal responsibilities.

| ID | Kernel Duty | Definition Source (Normative) | Explained Source (Informative) |
|:---|:---|:---|:---|
| **KD-01** | Coordination | [coordination.md](/docs/specification/architecture/cross-cutting-kernel-duties/coordination) | [coordination-explained.md](/docs/specification/architecture/cross-cutting-kernel-duties/coordination-explained) |
| **KD-02** | Error Handling | [error-handling.md](/docs/specification/architecture/cross-cutting-kernel-duties/error-handling) | [error-handling-explained.md](/docs/specification/architecture/cross-cutting-kernel-duties/error-handling-explained) |
| **KD-03** | Event Bus | [event-bus.md](/docs/specification/architecture/cross-cutting-kernel-duties/event-bus) | [event-bus-explained.md](/docs/specification/architecture/cross-cutting-kernel-duties/event-bus-explained) |
| **KD-04** | Learning & Feedback | [learning-feedback.md](/docs/specification/architecture/cross-cutting-kernel-duties/learning-feedback) | [learning-feedback-explained.md](/docs/specification/architecture/cross-cutting-kernel-duties/learning-feedback-explained) |
| **KD-05** | Observability | [observability.md](/docs/specification/architecture/cross-cutting-kernel-duties/observability) | [observability-explained.md](/docs/specification/architecture/cross-cutting-kernel-duties/observability-explained) |
| **KD-06** | Orchestration | [orchestration.md](/docs/specification/architecture/cross-cutting-kernel-duties/orchestration) | [orchestration-explained.md](/docs/specification/architecture/cross-cutting-kernel-duties/orchestration-explained) |
| **KD-07** | Performance | [performance.md](/docs/specification/architecture/cross-cutting-kernel-duties/performance) | [performance-explained.md](/docs/specification/architecture/cross-cutting-kernel-duties/performance-explained) |
| **KD-08** | Protocol Versioning | [protocol-versioning.md](/docs/specification/architecture/cross-cutting-kernel-duties/protocol-versioning) | [protocol-versioning-explained.md](/docs/specification/architecture/cross-cutting-kernel-duties/protocol-versioning-explained) |
| **KD-09** | Security | [security.md](/docs/specification/architecture/cross-cutting-kernel-duties/security) | [security-explained.md](/docs/specification/architecture/cross-cutting-kernel-duties/security-explained) |
| **KD-10** | State Sync | [state-sync.md](/docs/specification/architecture/cross-cutting-kernel-duties/state-sync) | [state-sync-explained.md](/docs/specification/architecture/cross-cutting-kernel-duties/state-sync-explained) |
| **KD-11** | Transaction | [transaction.md](/docs/specification/architecture/cross-cutting-kernel-duties/transaction) | [transaction-explained.md](/docs/specification/architecture/cross-cutting-kernel-duties/transaction-explained) |

---

## 6. Profile Anchors (PA)

Execution profile anchors.

| ID | Profile | Definition Source | Invariants File | Description |
|:---|:---|:---|:---|:---|
| **PA-01** | SA (Single Agent) | [sa-profile.md](/docs/specification/profiles/sa-profile) | `sa-invariants.yaml` | Single agent configuration |
| **PA-02** | MAP (Multi-Agent) | [map-profile.md](/docs/specification/profiles/map-profile) | `map-invariants.yaml` | Multi-agent configuration |

---

## 7. Golden Flow Anchors (GF)

Evaluation scenario anchors.

| ID | Golden Flow | Scenario Source | Evidence Focus |
|:---|:---|:---|:---|
| **FLOW-01** | SA Lifecycle | [gf-01.mdx](/docs/evaluation/golden-flows/gf-01) | Context → Plan → Trace |
| **FLOW-02** | MAP Coordination | [gf-02.mdx](/docs/evaluation/golden-flows/gf-02) | Multi-agent handoffs |
| **FLOW-03** | Drift Detection | [gf-03.mdx](/docs/evaluation/golden-flows/gf-03) | Drift → Recovery |
| **FLOW-04** | Delta Intent | [gf-04.mdx](/docs/evaluation/golden-flows/gf-04) | Delta → Replan |
| **FLOW-05** | Governance | [gf-05.mdx](/docs/evaluation/golden-flows/gf-05) | Confirm gates |

---

## 8. Anchor Statistics

| Category | Count |
|:---|:---:|
| Concept Anchors (CA) | 15 |
| Lifecycle Anchors (LA) | 7 |
| Governance Anchors (GA) | 5 |
| Architectural Anchors (AA) | 4 |
| Kernel Duty Anchors (KD) | 11 |
| Profile Anchors (PA) | 2 |
| Golden Flow Anchors (GF) | 5 |
| **Total** | **49** |

---

## 9. Usage

This registry is used for:

1. **Documentation Navigation**: Quickly locate concept definition sources
2. **Semantic Alignment**: Verify cross-directory concept consistency
3. **Phase F Mapping**: Baseline coordinates for truthfulness mapping
4. **Validation Lab**: Evidence tag reference

---

**Phase**: D-1 (Semantic Anchor Definition)
**Total Anchors**: 49
