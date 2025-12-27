---
doc_type: informative
status: active
authority: Documentation Governance
description: ""
title: Learning Collection Points
---

# Learning Collection Points

> **Status**: Informative
> **Version**: 1.0.0
> **Authority**: Documentation Governance

## 3. Collection Point Matrix

| Collection Point | Trigger Event | Sample Family | Phase | Priority |
|:---|:---|:---|:---|:---:|
| `intent_resolution` | `IntentEvent`, `SAPlanEvaluated` | `intent` | Planning | HIGH |
| `plan_generation` | `SAPlanEvaluated` | `intent` | Planning | HIGH |
| `plan_revision` | `DeltaIntentEvent` | `delta` | Planning | HIGH |
| `execution_completion` | `SAStepCompleted`, `RuntimeExecutionEvent` | `core` | Execution | HIGH |
| `pipeline_stage_completion` | `PipelineStageEvent(completed)` | `pipeline_outcome` | Execution | MEDIUM |
| `pipeline_failure` | `PipelineStageEvent(failed)` | `pipeline_outcome` | Execution | HIGH |
| `user_feedback` | `ConfirmDecisionAdded` | `core`, `confirm_decision` | Governance | HIGH |
| `confirm_decision_finalized` | `ConfirmDecisionAdded` | `confirm_decision` | Governance | MEDIUM |
| `map_session_completion` | `MAPSessionCompleted` | `multi_agent_coordination` | Multi-Agent | MEDIUM |
| `coordination_handoff` | `MAPTurnCompleted` | `multi_agent_coordination` | Multi-Agent | LOW |

### 4.2 Plan Revision Point

**Purpose**: Capture corrections to improve future planning accuracy.

**Trigger Events**:
- `DeltaIntentEvent` User modifies or rejects a Plan

**Data Sources**:
- Original Plan
- User feedback / rejection reason
- Revised Plan (if created)

**Output Sample**: `LearningSampleDelta`

**JSON Example**:
```json
{
  "sample_id": "ls-delta-001",
  "family": "delta",
  "project_id": "proj-alpha",
  "input": {
    "original_plan_id": "plan-001",
    "original_plan_summary": "3-step user API creation"
  },
  "state": {
    "user_feedback": "Add pagination support to GET endpoint"
  },
  "output": {
    "revised_plan_id": "plan-002",
    "changes_made": ["Added pagination step", "Updated step dependencies"]
  },
  "meta": {
    "collected_at": "2025-12-06T10:05:00Z",
    "collection_point": "plan_revision",
    "feedback_type": "enhancement_request"
  }
}
```

### 4.4 User Feedback Point

**Purpose**: Capture explicit RLHF signals from human evaluation.

**Trigger Events**:
- `ConfirmDecisionAdded` User approves/rejects
- Explicit rating submission

**Data Sources**:
- Target artifact / action
- Decision (approve/reject/override)
- Rating (if provided)
- Comment / reasoning

**Output Sample**: `LearningSampleCore` with `user_feedback` populated

**JSON Example**:
```json
{
  "sample_id": "ls-core-002",
  "family": "core",
  "project_id": "proj-alpha",
  "input": {
    "action_type": "file_modification",
    "target": "src/models/User.ts"
  },
  "output": {
    "status": "completed",
    "risk_label": "high"
  },
  "user_feedback": {
    "decision": "approve",
    "rating": 4,
    "comment": "Good implementation, minor style issues"
  },
  "meta": {
    "collected_at": "2025-12-06T10:15:00Z",
    "collection_point": "user_feedback"
  }
}
```

### 4.6 MAP Session Completion Point

**Purpose**: Capture multi-agent collaboration patterns.

**Trigger Events**:
- `MAPSessionCompleted`
- `MAPTurnCompleted` (for handoff points)

**Data Sources**:
- Session configuration
- Participant roles
- Coordination mode
- Outcome metrics

**Output Sample**: `LearningSampleMAP`

## 6. Storage Patterns

### 6.1 Inline Emission

Samples emitted directly during execution:

```
Execution [Trigger Event] Sample Generated Sample Store
```

### 6.2 Post-Processing

Samples generated from replay/analysis:

```
Trace Records Batch Analysis Sample Generation Sample Store
```

### 6.3 Recommended Storage

- **Vector Database**: For RAG-based retrieval (e.g., Pinecone, Weaviate)
- **Data Lake**: For batch training pipelines (JSONL format)
- **Local Files**: For development/debugging

**End of Learning Collection Points Specification**