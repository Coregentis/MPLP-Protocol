> [INTERNAL ONLY]
> This document is an internal process / governance artifact.
> It is **not** part of the MPLP v1.0 public specification and **MUST NOT** be included in public releases or documentation maps.

---
Status: Internal
Not part of MPLP v1.0 Spec. Retained for historical and audit purposes only.
---

# Cross-cutting Reality Alignment Report


**Date**: 2025-12-01
**Source of Truth**: `schemas/v2`, `invariants/*.yaml`, `module-event-matrix.md`, `module-psg-paths.md`

## 1. Overview

This report establishes the ground truth for the 12 cross-cutting concerns in MPLP v1.0. It maps each concern to specific schemas, invariants, event obligations, and PSG paths.

## 2. Reality Mapping

### 2.1. Action Execution Layer (AEL)
- **Schema Reality**: No direct L1 schema. Relies on `RuntimeExecutionEvent` for observability.
- **Invariants**: `obs_runtime_executor_kind_valid` (enum: agent, tool, llm, worker, external).
- **Event Obligations**: MUST emit `RuntimeExecutionEvent` (family: `runtime_execution`).
- **PSG Bindings**: Writes to `psg.execution_traces` (via Trace module).
- **Runtime Reality**: Delegated to `@mplp/integration-tools-generic` and `@mplp/integration-llm-http`.

### 2.2. Coordination
- **Schema Reality**: `mplp-collab.schema.json`, `mplp-dialog.schema.json`.
- **Invariants**: `map-invariants.yaml` (turn-taking rules).
- **Event Obligations**: `MAPSessionStarted`, `MAPTurnDispatched` (Profile-specific).
- **PSG Bindings**: `psg.collaboration_sessions`, `psg.agent_roles`.
- **Runtime Reality**: Implemented by `Collab` and `Dialog` modules.

### 2.3. Error Handling
- **Schema Reality**: `mplp-trace.schema.json` (span status: failed).
- **Invariants**: `obs_runtime_status_valid` (includes `failed`).
- **Event Obligations**: `RuntimeExecutionEvent` with `status="failed"`, `PipelineStageEvent` with `stage_status="failed"`.
- **PSG Bindings**: `psg.failure_nodes` (conceptual).
- **Runtime Reality**: Try/Catch blocks in Orchestrator, Rollback logic.

### 2.4. Event Bus
- **Schema Reality**: `schemas/v2/events/*.schema.json` (3 physical schemas).
- **Invariants**: `observability-invariants.yaml` (UUIDs, ISO timestamps, Enums).
- **Event Obligations**: All 12 logical families mapped to 3 physical types.
- **PSG Bindings**: `psg.events` (log append).
- **Runtime Reality**: Synchronous (PSG) + Asynchronous (External) routing.

### 2.5. Learning & Feedback
- **Schema Reality**: `schemas/v2/learning/*.schema.json` (Intent, Delta, Core).
- **Invariants**: `learning-invariants.yaml`.
- **Event Obligations**: `IntentEvent`, `DeltaIntentEvent`.
- **PSG Bindings**: `psg.learning_samples` (optional).
- **Runtime Reality**: Collection points at Intent Resolution and Plan Correction.

### 2.6. Observability
- **Schema Reality**: `mplp-trace.schema.json`, `mplp-event-core.schema.json`.
- **Invariants**: `observability-invariants.yaml`.
- **Event Obligations**: `GraphUpdateEvent`, `PipelineStageEvent`, `RuntimeExecutionEvent`.
- **PSG Bindings**: `psg.execution_traces`, `psg.spans`.
- **Runtime Reality**: OpenTelemetry-compatible tracing + Structured Logging.

### 2.7. Orchestration
- **Schema Reality**: `mplp-plan.schema.json` (steps), `mplp-core.schema.json` (pipeline).
- **Invariants**: `sa-invariants.yaml` (Context->Plan->Trace binding).
- **Event Obligations**: `PipelineStageEvent` (start/end).
- **PSG Bindings**: `psg.pipeline_state`.
- **Runtime Reality**: `runSingleAgentFlow` (Context->Plan->Confirm->Trace).

### 2.8. Performance
- **Schema Reality**: `RuntimeExecutionEvent` metadata (duration, cost).
- **Invariants**: None specific (implicit in timestamps).
- **Event Obligations**: `CostAndBudgetEvent` (Optional).
- **PSG Bindings**: `psg.metrics` (derived).
- **Runtime Reality**: Token counting, Latency tracking.

### 2.9. Protocol Versioning
- **Schema Reality**: `meta.protocol_version` in all L1 objects.
- **Invariants**: `meta_protocol_version_valid` (implied).
- **Event Obligations**: `ImportProcessEvent` (version checks).
- **PSG Bindings**: `psg.project_root.protocol_version`.
- **Runtime Reality**: SemVer 2.0.0 enforcement.

### 2.10. Security
- **Schema Reality**: `mplp-role.schema.json`.
- **Invariants**: `sa_context_must_be_active`.
- **Event Obligations**: `RuntimeExecutionEvent` (executor_role).
- **PSG Bindings**: `psg.agent_roles`, `psg.permissions`.
- **Runtime Reality**: RBAC checks in AEL, Sandboxing.

### 2.11. State Sync
- **Schema Reality**: `mplp-graph-update-event.schema.json`.
- **Invariants**: `obs_graph_update_kind_valid`.
- **Event Obligations**: `GraphUpdateEvent` (MUST for all state changes).
- **PSG Bindings**: The PSG itself is the state.
- **Runtime Reality**: Event-sourced graph updates.

### 2.12. Transaction
- **Schema Reality**: `GraphUpdateEvent` (update_kind: bulk).
- **Invariants**: None specific.
- **Event Obligations**: `GraphUpdateEvent` (bulk).
- **PSG Bindings**: Atomic application of bulk updates.
- **Runtime Reality**: Logical atomicity, Rollback capability.

### 2.13. VSL
- **Schema Reality**: None (Infrastructure).
- **Invariants**: None.
- **Event Obligations**: None.
- **PSG Bindings**: Backing store for PSG.
- **Runtime Reality**: `InMemoryVSL`, `FileSystemVSL`.

## 3. Gaps & Mismatches

- **Security**: No specific `SecurityEvent` schema exists in v1.0 (Future work).
- **Transaction**: No distributed transaction coordinator; relies on logical batching.
- **Performance**: `CostAndBudgetEvent` is defined in Matrix but schema is `mplp-event-core` (generic).

## 4. Conclusion

The cross-cutting concerns are well-supported by the v1.0 schemas and invariants. The documentation rewrite must strictly adhere to these mappings.
