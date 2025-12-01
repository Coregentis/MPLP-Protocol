---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# MPLP Observability Overview (v1.0)

> This document defines the **L2.5 Observability Layer** of the MPLP Protocol.  
> It specifies the standard Event Taxonomy, Schema Strategy, and Emission Obligations.

---

## 1. Philosophy: "3 Physical, 12 Logical"

MPLP v1.0 adopts a pragmatic approach to observability:

-   **3 Physical Schemas**: Cover the distinct structural requirements of the protocol (Graph Updates, Pipeline Stages, Runtime Execution).
-   **12 Logical Families**: Define the semantic intent of events, mapped to the physical schemas.
-   **Generic Core**: All "Logical-only" families use the generic `mplp-event-core.schema.json`, relying on the `event_type` field and flexible `payload` to carry specific data.

This approach balances **strict typing** for critical protocol mechanics with **flexibility** for diverse runtime implementations.

---

## 2. Physical Schemas

These are the actual JSON Schema files in `schemas/v2/events/`:

1.  **`mplp-graph-update-event.schema.json`**
    *   **Purpose**: Tracks mutations to the Project Semantic Graph (PSG).
    *   **Key Fields**: `graph_id`, `update_kind`, `node_delta`, `edge_delta`.
    *   **Used By**: `GraphUpdateEvent`.

2.  **`mplp-pipeline-stage-event.schema.json`**
    *   **Purpose**: Tracks high-level lifecycle transitions.
    *   **Key Fields**: `pipeline_id`, `stage_id`, `stage_status`.
    *   **Used By**: `PipelineStageEvent`.

3.  **`mplp-runtime-execution-event.schema.json`**
    *   **Purpose**: Tracks execution of units of work (Agents, Tools, LLMs).
    *   **Key Fields**: `execution_id`, `executor_kind`, `status`.
    *   **Used By**: `RuntimeExecutionEvent`.

4.  **`mplp-event-core.schema.json`** (Generic Base)
    *   **Purpose**: Base type for all other events.
    *   **Key Fields**: `event_id`, `event_type`, `timestamp`, `payload`.
    *   **Used By**: `ImportProcess`, `Intent`, `CostAndBudget`, etc.

---

## 3. Logical Event Families

See `mplp-event-taxonomy.yaml` for the complete definition of the 12 families.

### 3.1 Required Families (Must Implement)
*   **PipelineStageEvent**: To track "where we are".
*   **GraphUpdateEvent**: To track "what changed".

### 3.2 Recommended Families (Should Implement)
*   **RuntimeExecutionEvent**: For detailed execution logs.
*   **ImportProcessEvent**: For project onboarding.
*   **IntentEvent**: For user interaction tracking.
*   **CostAndBudgetEvent**: For resource monitoring.
*   **ExternalIntegrationEvent**: For side-effect tracking.

### 3.3 Optional Families (May Implement)
*   **DeltaIntentEvent**, **ImpactAnalysisEvent**, **CompensationPlanEvent**: For advanced planning capabilities.
*   **MethodologyEvent**, **ReasoningGraphEvent**: For "Glass Box" transparency.

---

## 4. Profile Events

In addition to the Core Observability layer, specific Profiles define their own event schemas:

-   **SA Profile**: `mplp-sa-event.schema.json` (e.g., `SAStepStarted`).
-   **MAP Profile**: `mplp-map-event.schema.json` (e.g., `MAPTurnDispatched`).

These are required only if the Runtime implements the respective Profile.

---

## 5. Integration with Trace Module

All emitted events MUST be written to the **Trace Module**. The Trace acts as the immutable append-only log for the session.

```json
// Trace Object Structure
{
  "trace_id": "uuid",
  "events": [
    { "event_type": "PipelineStageEvent", ... },
    { "event_type": "GraphUpdateEvent", ... },
    { "event_type": "SAInitialized", ... }
  ]
}
```

---

## 6. Compliance

To be MPLP v1.0 Compliant, a Runtime MUST:
1.  Emit all **Required** event families.
2.  Validate emitted events against the **Physical Schemas**.
3.  Persist events to the **Trace Module**.
