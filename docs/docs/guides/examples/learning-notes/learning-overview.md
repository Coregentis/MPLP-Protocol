---
sidebar_position: 1

doc_type: informative
normativity: informative
status: active
authority: Documentation Governance
description: "Overview of MPLP Learning module, covering LearningSample families, collection mechanisms, and compliance boundaries."
title: Learning Overview

---


# Learning Overview

>
> **Normative Statement**: Learning schemas are organized as a schema family under `schemas/v2/learning/`. This is an intentional deviation from root-level module schemas, due to Learning being a cross-cutting evidence subsystem rather than a single protocol object.

## 1. Purpose

**Learning** in MPLP provides a structured mechanism for capturing high-value interaction data from agent executions. This data can be used to improve agent performance over time through training, fine-tuning, or reinforcement learning.

**Design Principle**: "Every interaction is a potential training sample"

**Key Goals**:
- Capture successful execution patterns for replication
- Capture failure patterns for avoidance
- Enable continuous improvement through feedback loops
- Maintain privacy and governance compliance

## 2. Relationship with Other Layers

### 2.1 Layer Hierarchy

| Layer | Role in Learning |
|:---|:---|
| **L1/L2 (Schemas + Modules)** | Define Context, Plan, Confirm, Trace, Role, Collab, etc. |
| **Profiles (SA/MAP)** | Define single/multi-agent execution semantics |
| **Observability** | Define structured event streams during execution |
| **Learning Feedback** | Compress/abstract objects + events into LearningSamples for offline learning |

### 2.2 Data Flow

```
Execution [L2 Objects + Events] → LearningSamples → Training/Evaluation
```

LearningSamples **reference** L2 objects and Observability events via IDs, not embed them directly. This ensures separation of concerns and reduces duplication.

## 3. Core Concepts

### 3.1 LearningSample

A **LearningSample** is a self-contained record capturing:
- **Input**: What conditions led to the action
- **State**: System context at the time of action
- **Output**: What happened as a result
- **Meta**: Quality labels, provenance, feedback signals

### 3.2 Sample Families

MPLP defines 6 LearningSample families, each specialized for different learning scenarios:

| Family | Purpose | Schema |
|:---|:---|:---|
| `intent_resolution` | User intent → Plan generation | `mplp-learning-sample-intent.schema.json` |
| `delta_impact` | Change effect analysis & compensation | `mplp-learning-sample-delta.schema.json` |
| `pipeline_outcome` | Pipeline stage success/failure | Core Schema |
| `confirm_decision` | Approval/rejection decisions | Core Schema |
| `graph_evolution` | PSG structural changes | Core Schema |
| `multi_agent_coordination` | SA/MAP collaboration patterns | Core Schema |

### 3.3 Collection Points

Collection points define **when** to generate LearningSamples. They are triggered by specific Observability events.

## 4. LearningSample Families (Details)

### 4.1 Intent Resolution

**Purpose**: Capture how user/business intent is clarified and converted to executable plans.

**Typical Sources**:
- `IntentEvent`, `SAPlanEvaluated` events
- Plan.intent_model
- Dialog.turns

**Example Use Case**: Train model to better understand ambiguous user requests.

### 4.2 Delta Impact

**Purpose**: Capture change effect analysis and compensation planning patterns.

**Typical Sources**:
- `DeltaIntentEvent`, `ImpactAnalysisEvent`
- Original Plan + revised Plan
- Compensation/rollback decisions

**Example Use Case**: Learn to predict impact scope and when compensation is needed.

### 4.3 Pipeline Outcome

**Purpose**: Capture pipeline stage-level success/failure patterns.

**Typical Sources**:
- `PipelineStageEvent`
- `RuntimeExecutionEvent`
- Trace module

**Example Use Case**: Predict which pipeline configurations succeed/fail.

### 4.4 Confirm Decision

**Purpose**: Capture human-in-the-loop approval/rejection patterns.

**Typical Sources**:
- `ConfirmDecisionAdded` events
- Confirm module records
- User ratings and comments

**Example Use Case**: Learn what agents generate that users consistently approve or reject.

### 4.5 Graph Evolution

**Purpose**: Capture PSG structural changes over time.

**Typical Sources**:
- `GraphUpdateEvent`
- PSG snapshots (before/after)

**Example Use Case**: Understand healthy vs. problematic graph evolution patterns.

### 4.6 Multi-Agent Coordination

**Purpose**: Capture SA/MAP collaboration patterns.

**Typical Sources**:
- `MAPSessionCompleted`, `MAPTurnCompleted` events
- Session configuration and participant roles
- Handoff patterns

**Example Use Case**: Learn effective coordination strategies for multi-agent scenarios.

## 5. Compliance Boundaries

### 5.1 What is REQUIRED for v1.0 Compliance?

| Aspect | Status | Notes |
|:---|:---|:---|
| Schema definitions exist | **REQUIRED** | `schemas/v2/learning/*.schema.json` |
| Schemas are stable | **REQUIRED** | Frozen, backward-compatible |
| Samples conform to schemas (when emitted) | **REQUIRED** | Must validate against schemas |

### 5.2 What is RECOMMENDED (Not Required)?

| Aspect | Status | Notes |
|:---|:---|:---|
| Runtime emits samples | RECOMMENDED | Not mandatory for v1.0 |
| Collection at defined points | RECOMMENDED | Use standard collection points |
| Training/storage strategy | Out of scope | Product implementation decision |

### 5.3 Summary

> [!NOTE]
> Learning is **OPTIONAL** for v1.0 compliance. Runtimes MAY choose not to emit LearningSamples.
> However, **IF** samples are emitted, they **MUST** conform to MPLP schemas.

## 6. Implementation Guidance

### 6.1 Collection Strategy

1. **Identify high-value collection points** (see [Collection Points](learning-collection-points.md))
2. **Subscribe to trigger events** via Event Bus
3. **Extract relevant data** from L2 objects and Observability events
4. **Generate LearningSample** conforming to schema
5. **Store asynchronously** (non-blocking)

### 6.2 Quality Labeling

Use the `meta.human_feedback_label` field for RLHF:
- `approved`: User accepted result
- `rejected`: User rejected result
- `not_reviewed`: No explicit feedback

### 6.3 Privacy

- **MUST** anonymize PII before storage if configured
- **MUST** support user opt-out
- **SHOULD** exclude sensitive files (e.g., `.env`, `.secret`)

## 7. Storage and Lifecycle (Out of Scope)

MPLP v1.0 does **NOT** specify:
- Where to store LearningSamples (filesystem, database, S3, etc.)
- How long to retain samples
- When to trigger training
- What models to train

These are **product implementation decisions** for TracePilot, Coregentis, or other runtimes.

## 8. Related Documents

**Core Documentation**:
- [LearningSample Taxonomy](https://github.com/Coregentis/MPLP-Protocol/blob/main/schemas/v2/taxonomy/learning-taxonomy.yaml) - 6 families + triggers
- [Collection Points](learning-collection-points.md) - When to generate samples
- [Learning Invariants](learning-invariants.md) - Validation rules
- [Learning Sample Schema](learning-sample-schema.md) - Schema details
- [Learning & Feedback](learning-feedback-overview.md) - Detailed implementation patterns

**Schemas**:
- `schemas/v2/learning/mplp-learning-sample-core.schema.json`
- `schemas/v2/learning/mplp-learning-sample-intent.schema.json`
- `schemas/v2/learning/mplp-learning-sample-delta.schema.json`

**Compliance**:
- [MPLP v1.0 Conformance Guide](/docs/guides/conformance-guide.md)

---

**Sample Families**: 6 (intent, delta, pipeline, confirm, graph, coordination)
**Collection Points**: 9 defined triggers
**Compliance**: OPTIONAL for v1.0, schemas REQUIRED when emitting