# MPLP Observability Duties v1.0

**Version**: 1.0.0  
**Last Updated**: 2025-11-30  
**Status**: Protocol Specification

---

## 1. Scope & Purpose

### 1.1 What are Observability Duties?

**Observability Duties** define the protocol-level obligations for structured event emission in MPLP v1.0. They establish:
- **What events** MUST or SHOULD be emitted by compliant runtimes
- **When events** are triggered (lifecycle stages, state transitions)
- **What data** each event MUST contain (minimal field sets)

Observability Duties sit at the **protocol obligations layer**, bridging:
- **L2 Modules**: Define data structures and relationships
- **L3 Runtimes**: Implement execution logic and emit events
- **L4 Observability Tools**: Consume events for monitoring, audit, debugging

### 1.2 Design Principles

1. **Protocol-First**: Event schemas are protocol-defined, not implementation-defined
2. **Minimal Fields**: Each event family specifies only essential fields
3. **Non-Invasive**: Events do not require modifying L2 module schemas
4. **Composable**: Events reference existing L2 objects via IDs
5. **Observable**: All critical state transitions MUST emit events

---

## 2. Event Families (12 Categories)

MPLP v1.0 defines 12 core event families for observability:

### 2.1 ImportProcessEvent
**Purpose**: Track project import, scanning, card generation, PSG bootstrap

**Typical Scenarios**:
- Repository import (greenfield/brownfield)
- Codebase scanning and analysis
- Semantic card generation
- PSG initialization

**Minimal Fields**: `event_id`, `event_type`, `timestamp`, `project_id`, `source`, `phase`

---

### 2.2 IntentEvent
**Purpose**: Capture user intentions, actor actions, input channels

**Typical Scenarios**:
- User submits natural language request
- Agent proposes action
- System detects intent from context

**Minimal Fields**: `event_id`, `event_type`, `timestamp`, `intent_id`, `actor_kind`, `channel`

---

### 2.3 DeltaIntentEvent
**Purpose**: Track intent deltas, change requests, modification scopes

**Typical Scenarios**:
- User refines previous intent
- Delta propagation through PSG
- Impact scope calculation

**Minimal Fields**: `event_id`, `event_type`, `timestamp`, `intent_id`, `delta_id`, `impact_scope`

---

### 2.4 ImpactAnalysisEvent
**Purpose**: Record impact assessment results

**Typical Scenarios**:
- Analyze change ripple effects
- Assess methodology applicability
- Evaluate compensation requirements

**Minimal Fields**: `event_id`, `event_type`, `timestamp`, `analysis_id`, `impact_level`

---

### 2.5 CompensationPlanEvent
**Purpose**: Track compensation planning for intent execution

**Typical Scenarios**:
- Generate compensation plan for changes
- Identify target artifacts
- Validate compensation coverage

**Minimal Fields**: `event_id`, `event_type`, `timestamp`, `plan_id`, `target_artifacts`

---

### 2.6 MethodologyEvent
**Purpose**: Track methodology selection and execution

**Typical Scenarios**:
- Select methodology for task
- Execute methodology steps
- Validate methodology results

**Minimal Fields**: `event_id`, `event_type`, `timestamp`, `method_id`, `method_kind`

---

### 2.7 ReasoningGraphEvent
**Purpose**: Track reasoning graph construction and evolution

**Typical Scenarios**:
- Build reasoning graph
- Update reasoning nodes
- Prune reasoning branches

**Minimal Fields**: `event_id`, `event_type`, `timestamp`, `graph_id`, `node_count`

---

### 2.8 PipelineStageEvent ⭐ **REQUIRED**
**Purpose**: Track pipeline stage transitions (MANDATORY for v1.0 compliance)

**Typical Scenarios**:
- Pipeline stage entry/exit
- Stage status changes
- Stage ordering validation

**Minimal Fields**: `event_id`, `event_type`, `timestamp`, `pipeline_id`, `stage_id`, `stage_status`

**Compliance**: ALL MPLP v1.0 runtimes MUST emit PipelineStageEvent

---

### 2.9 GraphUpdateEvent ⭐ **REQUIRED**
**Purpose**: Track PSG structural updates (MANDATORY for v1.0 compliance)

**Typical Scenarios**:
- PSG node add/update/delete
- PSG edge add/update/delete
- Bulk graph mutations

**Minimal Fields**: `event_id`, `event_type`, `timestamp`, `graph_id`, `update_kind`, `node_delta`, `edge_delta`

**Compliance**: ALL MPLP v1.0 runtimes MUST emit GraphUpdateEvent for PSG changes

---

### 2.10 RuntimeExecutionEvent
**Purpose**: Track runtime execution lifecycle

**Typical Scenarios**:
- Agent execution start/complete
- Tool invocation tracking
- LLM call monitoring

**Minimal Fields**: `event_id`, `event_type`, `timestamp`, `execution_id`, `executor_kind`, `status`

---

### 2.11 CostAndBudgetEvent
**Purpose**: Track cost accumulation and budget enforcement

**Typical Scenarios**:
- Token usage tracking
- Budget limit validation
- Cost attribution

**Minimal Fields**: `event_id`, `event_type`, `timestamp`, `budget_profile_id`, `token_used`, `token_limit`

---

### 2.12 ExternalIntegrationEvent
**Purpose**: Track external system integration activities

**Typical Scenarios**:
- External API calls
- Database queries
- Third-party service integrations

**Minimal Fields**: `event_id`, `event_type`, `timestamp`, `integration_kind`, `target_system`, `status`

---

## 3. Profile-Level Events (SA/MAP)

In addition to the 12 core event families, MPLP v1.0 recognizes **Profile-level events**:

### 3.1 SA Events (Single Agent Profile)
Defined in Phase 1, documented in [`docs/03-profiles/sa-events.md`](../03-profiles/sa-events.md):
- SAInitialized, SAContextLoaded, SAPlanEvaluated
- SAStepStarted, SAStepCompleted, SAStepFailed
- SATraceEmitted, SACompleted

### 3.2 MAP Events (Multi-Agent Profile)
Defined in Phase 2, documented in [`docs/03-profiles/map-events.md`](../03-profiles/map-events.md):
- MAPSessionStarted, MAPRolesAssigned
- MAPTurnDispatched, MAPTurnCompleted
- MAPBroadcastSent, MAPBroadcastReceived
- MAPConflictDetected, MAPConflictResolved, MAPSessionCompleted

**Note**: SA/MAP events are Profile-specific and optional for v1.0 compliance, but PipelineStageEvent + GraphUpdateEvent are REQUIRED.

---

## 4. Relationship with MPLP Layers

### 4.1 L1 (Schema Layer)
- Defines event schemas (`mplp-event-*.schema.json`)
- Specifies minimal field requirements
- Establishes event structure contracts

### 4.2 L2 (Module Layer)
- Each module specifies which events MUST be emitted
- Documents event triggers (state transitions)
- References events in module documentation

### 4.3 L3 (Runtime Layer)
- Implements event emission logic
- Ensures conformance to schema
- May add implementation-specific fields (but MUST include all minimal fields)

### 4.4 L4 (Integration Layer)
- Consumes events for observability
- Aggregates events for analytics
- Enforces audit/compliance via events

---

## 5. Compliance Obligations

### 5.1 V1.0 Compliance Requirements

To be MPLP v1.0 compliant, a runtime MUST:

1. ✅ **Emit PipelineStageEvent** for each pipeline stage transition
2. ✅ **Emit GraphUpdateEvent** for each PSG structural change
3. ✅ **Conform to event schemas** defined in `schemas/v2/events/`
4. ✅ **Include all minimal fields** specified in event taxonomy
5. ✅ **Satisfy observability invariants** defined in `observability-invariants.yaml`

### 5.2 Optional Events (Recommended)

Runtimes SHOULD emit:
- ImportProcessEvent (during project import)
- IntentEvent (when capturing user intentions)
- RuntimeExecutionEvent (for execution tracking)
- CostAndBudgetEvent (for cost monitoring)

### 5.3 Profile-Level Events (Optional)

Runtimes MAY emit:
- SA Events (if implementing SA Profile)
- MAP Events (if implementing MAP Profile)

---

## 6. Event Emission Rules

### 6.1 Timing
- Events MUST be emitted **synchronously** with state transitions
- Events MUST include **ISO 8601 timestamps**
- Event ordering MUST be **temporally consistent**

### 6.2 Completeness
- All **REQUIRED events** MUST be emitted (no skipping)
- Event payloads MUST contain **all minimal fields**
- Missing fields MUST cause schema validation failure

### 6.3 Immutability
- Events MUST be **append-only** (no modification after emission)
- Event IDs MUST be **UUID v4** (globally unique)
- Timestamps MUST be **monotonically non-decreasing** within a session

---

## 7. References

**Core Documentation**:
- [Event Taxonomy YAML](mplp-event-taxonomy.yaml) - Complete event family definitions
- [Module→Event Emission Matrix](module-event-matrix.md) - Per-module obligations
- [Observability Invariants](../../schemas/v2/invariants/observability-invariants.yaml) - Validation rules

**Event Schemas**:
- [Core Event Schema](../../schemas/v2/events/mplp-event-core.schema.json) - Base structure
- [PipelineStageEvent Schema](../../schemas/v2/events/mplp-pipeline-stage-event.schema.json) - REQUIRED
- [GraphUpdateEvent Schema](../../schemas/v2/events/mplp-graph-update-event.schema.json) - REQUIRED
- [RuntimeExecutionEvent Schema](../../schemas/v2/events/mplp-runtime-execution-event.schema.json)

**Profile Events**:
- [SA Events Documentation](../03-profiles/sa-events.md)
- [MAP Events Documentation](../03-profiles/map-events.md)

**Compliance**:
- [MPLP v1.0 Compliance Guide](../02-guides/mplp-v1.0-compliance-guide.md)

---

**End of MPLP Observability Duties Overview**

*Observability Duties establish the protocol-level foundation for structured event emission in MPLP v1.0, ensuring all compliant runtimes provide consistent, auditable, and observable execution traces.*
