---
doc_type: informative
status: active
authority: Documentation Governance
description: ""
title: Learning Overview
---

# Learning Overview

> **Status**: Informative
> **Version**: 1.0.0
> **Authority**: Documentation Governance

## 2. Relationship with Other Layers

### 2.1 Layer Hierarchy

- **L1/L2 (Schemas + Modules)**: Define Context, Plan, Confirm, Trace, Role, Collab, etc.
- **Profiles (SA/MAP)**: Define single/multi-agent execution semantics
- **Observability**: Define structured event streams during execution
- **Learning Feedback**: Compress/abstract objects + events into LearningSamples for offline learning

### 2.2 Data Flow

```
Execution [L2 Objects + Events] LearningSamples Training/Evaluation
```

LearningSamples **reference** L2 objects and Observability events via IDs, not embed

 them.

## 4. LearningSample Families

MPLP v1.0 defines 6 LearningSample families:

### 4.1 Intent Resolution
**Purpose**: Capture how user/business intent is clarified and converted to executable plans

**Typical Sources**:
- Plan.intent_model
- Dialog.turns
- IntentEvent, DeltaIntentEvent

**Example Use Case**: Train model to better understand ambiguous user requests

### 4.3 Pipeline Outcome
**Purpose**: Capture pipeline stage-level success/failure patterns

**Typical Sources**:
- PipelineStageEvent
- Trace module
- RuntimeExecutionEvent

**Example Use Case**: Predict which pipeline configurations succeed/fail

### 4.5 Graph Evolution
**Purpose**: Capture PSG structural changes over time

**Typical Sources**:
- GraphUpdateEvent
- PSG snapshots

**Example Use Case**: Understand healthy vs problematic graph evolution

## 5. Compliance Boundaries

### 5.1 What is REQUIRED for v1.0 Compliance?

**Schema Stability**: LearningSample schemas (core + family-specific) MUST be stable and backward-compatible.

**Schema Conformance**: IF a runtime emits LearningSamples, they MUST conform to MPLP schemas.

### 5.2 What is RECOMMENDED (Not Required)?

**Sample Collection**: Runtimes SHOULD emit LearningSamples at recommended collection points, but v1.0 compliance does NOT mandate this.

**Training Behavior**: Where samples are stored, how models are trained, and retraining frequency are ENTIRELY product implementation decisions.

### 5.3 Summary

| Aspect | v1.0 Status |
|--------|------------|
| Schema definitions exist | REQUIRED |
| Schemas are stable | REQUIRED |
| Runtime emits samples |  RECOMMENDED |
| Samples conform to schemas (when emitted) | REQUIRED |
| Training/storage strategy | Out of scope |

## 7. Storage and Lifecycle (Out of Scope)

MPLP v1.0 does **NOT** specify:
- Where to store LearningSamples (filesystem, database, S3, etc.)
- How long to retain samples
- When to trigger training
- What models to train

These are **product implementation decisions** for TracePilot, Coregentis, or other runtimes.

## 9. References

**Core Documentation**:
- [LearningSample Taxonomy](learning-taxonomy.yaml) - 6 families + triggers
- [Collection Points](learning-collection-points.md) - When to generate samples
- `schemas/v2/invariants/learning-invariants.yaml` - Validation rules

**Schemas**:
- `schemas/v2/learning/mplp-learning-sample-core.schema.json`
- `schemas/v2/learning/mplp-learning-sample-intent.schema.json`
- `schemas/v2/learning/mplp-learning-sample-delta.schema.json`

**Examples**:
- `examples/learning/flow-01-intent-sample.json`
- `examples/learning/flow-05-confirm-sample.json`

**Compliance**:
- [MPLP v1.0 Conformance Guide](../08-guides/conformance-guide.md)

---

**End of MPLP Learning Feedback Duties Overview**

*Learning Feedback Duties establish the protocol-level foundation for converting execution history into structured learning samples, enabling future model training and continuous improvement without mandating specific training strategies.*