---
sidebar_position: 3

doc_type: informative
normativity: informative
status: active
authority: Documentation Governance
description: "Defines when and how to generate LearningSamples during MPLP execution."
title: Learning Collection Points

---


# Learning Collection Points


## 1. Purpose

Collection points define **when** LearningSamples should be generated during MPLP execution. They are triggered by specific Observability events and produce samples in defined family formats.

**Key Principle**: Capture learning data at well-defined moments without blocking execution.

## 2. Collection Point Overview

Each collection point has:
- **Trigger Events**: Which Observability events activate the collection
- **Sample Family**: Which LearningSample schema to use
- **Priority**: How important it is to capture this data

### 2.1 Priority Levels

| Priority | Description |
|:---|:---|
| **HIGH** | Critical for learning quality; always capture if learning is enabled |
| **MEDIUM** | Valuable but optional; capture based on configuration |

## 3. Collection Point Matrix

*Source: `schemas/v2/taxonomy/learning-taxonomy.yaml` → `collection_points`*

| # | Collection Point ID | Description | Trigger Events | Sample Family | Priority |
|:---:|:---|:---|:---|:---|:---:|
| 1 | `intent_resolution` | When user intent is successfully parsed and clarified | `IntentEvent`, `SAPlanEvaluated` | `intent_resolution` | HIGH |
| 2 | `plan_generation` | When a Plan is generated from user request | `SAPlanEvaluated` | `intent_resolution` | HIGH |
| 3 | `plan_revision` | When user modifies or rejects a Plan | `DeltaIntentEvent` | `delta_impact` | HIGH |
| 4 | `impact_analysis_completion` | When impact analysis finishes | `ImpactAnalysisEvent` | `delta_impact` | MEDIUM |
| 5 | `execution_completion` | When a Plan step completes (success or failure) | `SAStepCompleted`, `RuntimeExecutionEvent` | `pipeline_outcome` | HIGH |
| 6 | `pipeline_failure` | When a pipeline stage fails | `PipelineStageEvent(status=failed)` | `pipeline_outcome` | HIGH |
| 7 | `user_feedback` | When user provides explicit approval/rejection | `ConfirmDecisionAdded` | `confirm_decision` | HIGH |
| 8 | `graph_update` | When PSG structure changes significantly | `GraphUpdateEvent` | `graph_evolution` | MEDIUM |
| 9 | `map_session_completion` | When a MAP collaboration session ends | `MAPSessionCompleted` | `multi_agent_coordination` | MEDIUM |

## 4. Collection Point Details

### 4.1 Intent Resolution (`intent_resolution`)

**Description**: When user intent is successfully parsed and clarified.

**Trigger Events**:
- `IntentEvent` — User submits a request
- `SAPlanEvaluated` — Plan is generated from intent

**Sample Family**: `intent_resolution`
**Priority**: HIGH

**Data Sources**:
- User request (PII-scrubbed)
- Dialog exchanges
- Generated Plan structure

### 4.2 Plan Generation (`plan_generation`)

**Description**: When a Plan is generated from user request.

**Trigger Events**:
- `SAPlanEvaluated` — Plan generated and evaluated

**Sample Family**: `intent_resolution`
**Priority**: HIGH

**Data Sources**:
- Intent structure
- Generated Plan

### 4.3 Plan Revision (`plan_revision`)

**Description**: When user modifies or rejects a Plan.

**Trigger Events**:
- `DeltaIntentEvent` — User modifies or rejects a Plan

**Sample Family**: `delta_impact`
**Priority**: HIGH

**Data Sources**:
- Original Plan
- User feedback / rejection reason
- Revised Plan (if created)

### 4.4 Impact Analysis Completion (`impact_analysis_completion`)

**Description**: When impact analysis finishes.

**Trigger Events**:
- `ImpactAnalysisEvent` — Impact analysis completed

**Sample Family**: `delta_impact`
**Priority**: MEDIUM

**Data Sources**:
- Delta Intent
- Impact analysis results
- Affected artifacts

### 4.5 Execution Completion (`execution_completion`)

**Description**: When a Plan step completes (success or failure).

**Trigger Events**:
- `SAStepCompleted` — Single-agent step completes
- `RuntimeExecutionEvent` — Runtime action finishes

**Sample Family**: `pipeline_outcome`
**Priority**: HIGH

**Data Sources**:
- Step configuration
- Execution result
- Duration and resource usage

### 4.6 Pipeline Failure (`pipeline_failure`)

**Description**: When a pipeline stage fails.

**Trigger Events**:
- `PipelineStageEvent(status=failed)` — Pipeline stage fails

**Sample Family**: `pipeline_outcome`
**Priority**: HIGH

**Data Sources**:
- Failed stage configuration
- Error information
- Rollback status

### 4.7 User Feedback (`user_feedback`)

**Description**: When user provides explicit approval/rejection.

**Trigger Events**:
- `ConfirmDecisionAdded` — User approves/rejects

**Sample Family**: `confirm_decision`
**Priority**: HIGH

**Data Sources**:
- Target artifact / action
- Decision (approve/reject/override)
- Rating and comment (if provided)

### 4.8 Graph Update (`graph_update`)

**Description**: When PSG structure changes significantly.

**Trigger Events**:
- `GraphUpdateEvent` — PSG structure changes

**Sample Family**: `graph_evolution`
**Priority**: MEDIUM

**Data Sources**:
- Change type (node_added, edge_added, etc.)
- Before/after node counts
- Topology metrics

### 4.9 MAP Session Completion (`map_session_completion`)

**Description**: When a MAP collaboration session ends.

**Trigger Events**:
- `MAPSessionCompleted` — Multi-agent session ends

**Sample Family**: `multi_agent_coordination`
**Priority**: MEDIUM

**Data Sources**:
- Session configuration
- Participant roles
- Coordination mode
- Outcome metrics

## 5. Implementation Patterns

### 5.1 Inline Emission

Samples emitted directly during execution:

```
Execution → [Trigger Event] → Sample Generated → Sample Store
```

**Pros**: Real-time, complete context available
**Cons**: May impact execution performance

### 5.2 Post-Processing

Samples generated from replay/analysis:

```
Trace Records → Batch Analysis → Sample Generation → Sample Store
```

**Pros**: No execution overhead
**Cons**: Delayed feedback loop

### 5.3 Recommended Approach

Use **inline emission** for HIGH priority collection points, **post-processing** for MEDIUM priority.

## 6. Storage Patterns

### 6.1 Storage Options

| Storage Type | Use Case | Format |
|:---|:---|:---|
| **Vector Database** | RAG-based retrieval | Embeddings |
| **Data Lake** | Batch training pipelines | JSONL |
| **Local Files** | Development/debugging | JSON |

### 6.2 Non-Blocking Storage

```typescript
async function storeLearningSample(sample: LearningSample): Promise<void> {
  // Fire and forget - don't block execution
  setImmediate(async () => {
    try {
      await sampleStore.write(sample);
    } catch (error) {
      logger.warn('Failed to store learning sample', { error, sample_id: sample.sample_id });
    }
  });
}
```

---

**Collection Points**: 9 (as defined in `learning-taxonomy.yaml`)
**Priority Levels**: HIGH (6), MEDIUM (3)
**Source of Truth**: `schemas/v2/taxonomy/learning-taxonomy.yaml`