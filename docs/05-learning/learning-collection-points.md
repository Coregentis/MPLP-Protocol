# LearningSample Collection Points (Recommended)

**Purpose**: Define when and how to generate LearningSamples from MPLP execution history.

**Compliance Note**: All collection points described below are **RECOMMENDED**, NOT REQUIRED for MPLP v1.0 compliance. Runtimes MAY choose a subset based on training goals and resource constraints.

---

## 1. Intent Resolution Samples

### 1.1 Trigger Conditions
- ✅ When an IntentModel is finalized and a Plan is created (FLOW-01, FLOW-02 patterns)
- ✅ When a DeltaIntent is accepted and integrated into an existing plan
- ✅ When a dialog thread successfully resolves into concrete action
- ⚠️ Optional: On intent clarification failure (for negative examples)

### 1.2 Source Data
- **L2 Modules**: Context, Plan Plan.intent_model), Dialog (if applicable)
- **Observability Events**: IntentEvent, DeltaIntentEvent
- **Profile Events**: SA events (if SA Profile used)

### 1.3 LearningSample Structure
```json
{
  "sample_family": "intent_resolution",
  "input": {
    "intent_id": "<from IntentEvent>",
    "raw_request_summary": "<abstracted user request>",
    "constraints_summary": "<timeline, budget, resources>",
    "dialog_turns_count": <optional>
  },
  "state": {
    "project_phase": "<greenfield|brownfield|maintenance>",
    "psg_node_count": <optional PSG size>
  },
  "output": {
    "final_intent_summary": "<clarified intent>",
    "plan_id": "<generated Plan ID>",
    "plan_step_count": <number of steps>,
    "resolution_quality_label": "good|acceptable|bad|unknown"
  },
  "meta": {
    "source_flow_id": "FLOW-01",
    "source_event_ids": ["<IntentEvent ID>", ...],
    "human_feedback_label": "approved|rejected|not_reviewed"
  }
}
```

---

## 2. Delta Impact Samples

### 2.1 Trigger Conditions
- ✅ When ImpactAnalysisEvent is completed
- ✅ When CompensationPlanEvent is approved and applied
- ✅ When rollback mechanism is triggered
- ⚠️ Optional: On major plan revisions (>30% steps changed)

### 2.2 Source Data
- **L2 Modules**: Plan (delta tracking), Context
- **Observability Events**: DeltaIntentEvent, ImpactAnalysisEvent, CompensationPlanEvent
- **PSG**: GraphUpdateEvent for structural impact

### 2.3 LearningSample Structure
```json
{
  "sample_family": "delta_impact",
  "input": {
    "delta_id": "<delta identifier>",
    "intent_id": "<original intent>",
    "delta_type": "refinement|correction|expansion|reduction|pivot",
    "change_summary": "<what is being changed>"
  },
  "state": {
    "affected_artifact_count": <count>,
    "risk_level": "low|medium|high|critical"
  },
  "output": {
    "actual_impact_summary": "<observed impact>",
    "impact_scope": "local|module|system|global",
    "comp_plan_required": true|false,
    "comp_plan_applied": true|false,
    "rollback_used": true|false
  },
  "meta": {
    "impact_analysis_duration_ms": <timing>,
    "predicted_vs_actual_accuracy": "accurate|underestimated|overestimated"
  }
}
```

---

## 3. Pipeline Outcome Samples

### 3.1 Trigger Conditions
- ✅ When pipeline stage completes successfully
- ✅ When pipeline stage fails
- ✅ When pipeline stage is skipped (with reason)
- ⚠️ Optional: On pipeline performance anomalies

### 3.2 Source Data
- **Observability Events**: PipelineStageEvent (REQUIRED), RuntimeExecutionEvent
- **L2 Modules**: Trace (execution history)

### 3.3 LearningSample Structure
```json
{
  "sample_family": "pipeline_outcome",
  "input": {
    "pipeline_id": "<pipeline instance>",
    "stage_id": "<stage identifier>",
    "stage_name": "<human-readable name>",
    "stage_order": <sequence position>
  },
  "state": {
    "resource_allocation": "<cpu/memory/time budgets>",
    "dependency_status": "all_met|partial|blocked"
  },
  "output": {
    "stage_status": "completed|failed|skipped",
    "execution_duration_ms": <timing>,
    "error_summary": "<if failed, describe error>",
    "retry_count": <number of retries>
  },
  "meta": {
    "source_event_ids": ["<PipelineStageEvent IDs>"]
  }
}
```

---

## 4. Confirm Decision Samples

### 4.1 Trigger Conditions
- ✅ When Confirm is approved (FLOW-05 pattern)
- ✅ When Confirm is rejected (with reason)
- ✅ On multi-round approval completion
- ⚠️ Optional: When auto-approval threshold is adjusted

### 4.2 Source Data
- **L2 Modules**: Confirm (decisions[] array), Plan
- **Observability Events**: RuntimeExecutionEvent

### 4.3 LearningSample Structure
```json
{
  "sample_family": "confirm_decision",
  "input": {
    "confirm_id": "<Confirm ID>",
    "target_plan_id": "<Plan being confirmed>",
    "plan_risk_indicators": "<high_impact|breaking_change|etc>"
  },
  "state": {
    "confidence_score": <0.0-1.0 if available>,
    "previous_similar_approvals": <count>
  },
  "output": {
    "final_status": "approved|rejected",
    "decision_rounds": <number>,
    "rejection_reason": "<if rejected>",
    "decider_role": "<who approved/rejected>"
  },
  "meta": {
    "decision_latency_ms": <time to decide>,
    "source_flow_id": "FLOW-05"
  }
}
```

---

## 5. Graph Evolution Samples

### 5.1 Trigger Conditions
- ✅ On major graph topology changes (bulk GraphUpdateEvents)
- ✅ At session completion (cumulative graph delta summary)
- ✅ When graph complexity metrics exceed thresholds
- ⚠️ Optional: On architectural drift detection

### 5.2 Source Data
- **Observability Events**: GraphUpdateEvent (REQUIRED)
- **PSG**: Node/edge snapshots
- **L2 Modules**: Context, Plan, Collab (for PSG references)

### 5.3 LearningSample Structure
```json
{
  "sample_family": "graph_evolution",
  "input": {
    "session_id": "<session or project ID>",
    "initial_node_count": <count>,
    "initial_edge_count": <count>
  },
  "state": {
    "graph_complexity_score": <metric>,
    "hotspot_nodes": ["<frequently modified node IDs>"]
  },
  "output": {
    "final_node_count": <count>,
    "final_edge_count": <count>,
    "node_delta": <+/->,
    "edge_delta": <+/->,
    "evolution_health": "healthy|concerning|problematic"
  },
  "meta": {
    "source_event_ids": ["<GraphUpdateEvent IDs>"]
  }
}
```

---

## 6. Multi-Agent Coordination Samples

### 6.1 Trigger Conditions
- ✅ On MAP session completion
- ✅ On SA multi-step execution completion
- ✅ When role handoff occurs
- ✅ On broadcast fanout completion
- ⚠️ Optional: On coordination performance anomalies

### 6.2 Source Data
- **Profile Events**: MAP Events (MAPSessionStarted, MAPTurnDispatched, MAPBroadcastSent, etc.), SA Events
- **L2 Modules**: Collab, Network, Role
- **Observability Events**: RuntimeExecutionEvent

### 6.3 LearningSample Structure
```json
{
  "sample_family": "multi_agent_coordination",
  "input": {
    "session_id": "<MAP or SA session>",
    "coordination_mode": "turn_taking|broadcast|orchestrated",
    "participant_count": <number of agents>,
    "role_assignments": ["<role summaries>"]
  },
  "state": {
    "network_topology": "star|mesh|hierarchical",
    "load_balance_strategy": "<if applicable>"
  },
  "output": {
    "session_status": "completed|failed|partial",
    "total_turns": <for turn-taking>,
    "broadcast_count": <for broadcast>,
    "coordination_efficiency": <metric 0.0-1.0>,
    "bottleneck_roles": ["<if detected>"]
  },
  "meta": {
    "source_flow_id": "MAP-01|MAP-02|SA-01|SA-02",
    "source_event_ids": ["<MAP/SA event IDs>"]
  }
}
```

---

## 7. Collection Best Practices

### 7.1 When to Collect
- ✅ **High-value samples first**: Focus on intent resolution, delta impact, confirm decisions
- ⚠️ **Resource constraints**: Don't collect pipeline/graph samples if storage is limited
- ✅ **Session boundaries**: Collect at completion to capture full context

### 7.2 Data Abstraction
- ✅ **PII scrubbing**: Remove sensitive user data before storing
- ✅ **Summarization**: Don't duplicate entire L2 objects; use summaries and IDs
- ✅ **Reference by ID**: Link to Observability events, PSG nodes via UUIDs

### 7.3 Quality Signals
- ✅ **Human feedback**: Add `human_feedback_label` when available
- ✅ **Automated metrics**: Compute `quality_score` if heuristics exist
- ✅ **Failure cases**: Collect negative examples (with labels) for balanced datasets

---

## 8. Compliance Reminder

### All collection points are RECOMMENDED, not REQUIRED

**v1.0 Compliance Obligations**:
- ✅ **IF** LearningSamples are  collected, they **MUST** conform to schemas
- ⚠️ Runtimes **MAY** choose not to collect any samples
- ⚠️ Training/storage strategies are out of MPLP protocol scope

**When Samples ARE Collected**:
- ✅ Must use `sample_id` (UUID v4)
- ✅ Must specify `sample_family` (valid enum)
- ✅ Must include `created_at` (ISO 8601)
- ✅ Must provide `input` and `output` sections

---

## 9. References

- [LearningSample Taxonomy](mplp-learning-taxonomy.yaml) - 6 families
- [Core Schema](../../schemas/v2/learning/mplp-learning-sample-core.schema.json)
- [Intent Schema](../../schemas/v2/learning/mplp-learning-sample-intent.schema.json)
- [Delta Schema](../../schemas/v2/learning/mplp-learning-sample-delta.schema.json)
- [Learning Invariants](../../schemas/v2/invariants/learning-invariants.yaml)

---

**End of Collection Points Specification**

*These recommended collection points enable runtimes to capture valuable learning samples while maintaining flexibility in implementation strategy.*
