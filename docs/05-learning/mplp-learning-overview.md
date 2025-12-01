---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# MPLP Learning Feedback Duties v1.0

**Version**: 1.0.0
**Last Updated**: 2025-11-30
**Status**: Protocol Specification

---

## 1. Scope & Position

### 1.1 What are Learning Feedback Duties?

**Learning Feedback Duties** define the protocol-level obligations for **LearningSample** data structures and collection points. They establish:
- **What format** learning samples should use (schemas)
- **When to collect** samples (recommended triggers)
- **What data** each sample should contain (input/state/output/meta)

**Critical Distinction**: Learning Feedback Duties define **DATA FORMAT obligations**, NOT training behavior requirements.

### 1.2 Purpose

Convert project execution history into structured learning samples that can be used for:
- **Model Training**: Fine-tuning LLMs on domain-specific patterns
- **Evaluation**: Assessing model performance on real-world scenarios
- **Counterfactual Reasoning**: "What if" analysis on historical decisions
- **Quality Improvement**: Identifying patterns in successful vs failed executions

---

## 2. Relationship with Other Layers

### 2.1 Layer Hierarchy

- **L1/L2 (Schemas + Modules)**: Define Context, Plan, Confirm, Trace, Role, Collab, etc.
- **Profiles (SA/MAP)**: Define single/multi-agent execution semantics
- **Observability**: Define structured event streams during execution
- **Learning Feedback**: Compress/abstract objects + events into LearningSamples for offline learning

### 2.2 Data Flow

```
Execution → [L2 Objects + Events] → LearningSamples → Training/Evaluation
```

LearningSamples **reference** L2 objects and Observability events via IDs, not embed

 them.

---

## 3. LearningSample Concept

### 3.1 What is a LearningSample?

A **LearningSample** represents one "learnable unit of experience," such as:
- How a user intent was clarified and resolved
- The impact of a delta change and compensation
- A pipeline stage's success/failure pattern
- A confirm decision's approval/rejection reasoning
- PSG evolution during a session
- Multi-agent coordination performance

### 3.2 Core Structure

Every LearningSample has 4 sections:

| Section | Purpose | Required |
|---------|---------|----------|
| **input** | Abstracted input conditions, intent, context summary | ✅ Yes |
| **state** | System state snapshot before execution (PSG, config, etc.) | ⚠️ Optional |
| **output** | Actual execution results, decisions, changes | ✅ Yes |
| **meta** | Labels, quality signals, provenance IDs, human feedback | ⚠️ Optional |

**Design Principle**: Keep samples **abstracted** and **compressed**. Don't duplicate entire L2 objects; use summaries and references.

---

## 4. LearningSample Families

MPLP v1.0 defines 6 LearningSample families:

### 4.1 Intent Resolution
**Purpose**: Capture how user/business intent is clarified and converted to executable plans

**Typical Sources**:
- Plan.intent_model
- Dialog.turns
- IntentEvent, DeltaIntentEvent

**Example Use Case**: Train model to better understand ambiguous user requests

---

### 4.2 Delta Impact
**Purpose**: Capture delta change effects and impact analysis outcomes

**Typical Sources**:
- Delta intents
- Impact analysis artifacts
- Compensation plans
- ImpactAnalysisEvent, CompensationPlanEvent

**Example Use Case**: Learn to predict change ripple effects accurately

---

### 4.3 Pipeline Outcome
**Purpose**: Capture pipeline stage-level success/failure patterns

**Typical Sources**:
- PipelineStageEvent
- Trace module
- RuntimeExecutionEvent

**Example Use Case**: Predict which pipeline configurations succeed/fail

---

### 4.4 Confirm Decision
**Purpose**: Capture approval/rejection decisions and reasoning

**Typical Sources**:
- Confirm.decisions[]
- RuntimeExecutionEvent

**Example Use Case**: Learn approval patterns for risky operations

---

### 4.5 Graph Evolution
**Purpose**: Capture PSG structural changes over time

**Typical Sources**:
- GraphUpdateEvent
- PSG snapshots

**Example Use Case**: Understand healthy vs problematic graph evolution

---

### 4.6 Multi-Agent Coordination
**Purpose**: Capture SA/MAP collaboration patterns and performance

**Typical Sources**:
- MAP Events (MAPSessionStarted, etc.)
- Collab + Network modules

**Example Use Case**: Optimize agent role distribution and coordination

---

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
| Schema definitions exist | ✅ REQUIRED |
| Schemas are stable | ✅ REQUIRED |
| Runtime emits samples | 🟦 RECOMMENDED |
| Samples conform to schemas (when emitted) | ✅ REQUIRED |
| Training/storage strategy | ⚪ Out of scope |

---

## 6. Collection Timing

### 6.1 When to Generate LearningSamples?

**General Principle**: Generate samples at **decision boundaries** and **outcome observations**.

**Recommended Triggers**:
- After successful intent → plan conversion
- When impact analysis completes
- On pipeline stage completion (success/failure)
- When confirm decision finalized
- On major PSG topology changes
- At MAP session completion

**See**: [Learning Collection Points](learning-collection-points.md) for detailed specifications

---

## 7. Storage and Lifecycle (Out of Scope)

MPLP v1.0 does **NOT** specify:
- Where to store LearningSamples (filesystem, database, S3, etc.)
- How long to retain samples
- When to trigger training
- What models to train

These are **product implementation decisions** for TracePilot, Coregentis, or other runtimes.

---

## 8. Privacy and Security Considerations

**Important**: LearningSamples may contain sensitive information:
- User requests
- Business logic
- Architectural decisions
- Performance metrics

**Recommendations** (not protocol requirements):
- Implement PII scrubbing before storage
- Apply access controls to sample repositories
- Consider differential privacy for sensitive domains
- Document data retention policies

---

## 9. References

**Core Documentation**:
- [LearningSample Taxonomy](mplp-learning-taxonomy.yaml) - 6 families + triggers
- [Collection Points](learning-collection-points.md) - When to generate samples
- [Learning Invariants](../../schemas/v2/invariants/learning-invariants.yaml) - Validation rules

**Schemas**:
- [Core Sample Schema](../../schemas/v2/learning/mplp-learning-sample-core.schema.json)
- [Intent Resolution Schema](../../schemas/v2/learning/mplp-learning-sample-intent.schema.json)
- [Delta Impact Schema](../../schemas/v2/learning/mplp-learning-sample-delta.schema.json)

**Examples**:
- [Intent Sample Example](../../examples/learning/flow-01-intent-sample.json)
- [Confirm Sample Example](../../examples/learning/flow-05-confirm-sample.json)

**Compliance**:
- [MPLP v1.0 Compliance Guide](../02-guides/mplp-v1.0-compliance-guide.md)

---

**End of MPLP Learning Feedback Duties Overview**

*Learning Feedback Duties establish the protocol-level foundation for converting execution history into structured learning samples, enabling future model training and continuous improvement without mandating specific training strategies.*
