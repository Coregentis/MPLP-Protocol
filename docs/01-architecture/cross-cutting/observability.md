---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# 1. Purpose
The Observability Specification defines the normative requirements for system visibility. It mandates that all runtime operations be traceable, measurable, and loggable through standard schemas.

# 2. Normative Scope
This specification applies to:
- **All Layers (L1-L4)**: Every component must be observable.
- **Trace Module**: The primary owner of tracing logic.

# 3. Responsibilities (SHALL / MUST)
1.  The Runtime **MUST** maintain a continuous `Trace` for every active flow.
2.  Every discrete operation (Step, Tool Call) **MUST** be represented as a Span within the Trace.
3.  Spans **MUST** form a hierarchy (Parent/Child relationship).
4.  All Spans **MUST** capture: `start_time`, `end_time`, `status`, and `attributes`.
5.  The Runtime **MUST** emit `RuntimeExecutionEvent` for significant state changes.
6.  The PSG **MUST** be observable via `GraphUpdateEvent` stream.
7.  Observability data **MUST** be correlated via `trace_id` and `context_id`.
8.  The system **SHOULD** support export to standard formats (e.g., OTLP).

# 4. Cross-module Bindings
- **Trace Module**: Manages the Span lifecycle (MUST).
- **All Modules**: Report status to the Trace (MUST).
- **AEL**: Reports execution metrics (MUST).

# 5. Event Obligations
- **REQUIRED**: `RuntimeExecutionEvent` (Execution log).
- **REQUIRED**: `GraphUpdateEvent` (State log).
- **REQUIRED**: `PipelineStageEvent` (Flow log).

# 6. PSG Bindings (Runtime Touchpoints)
- **MUST write to**: `psg.execution_traces`.
- **MUST write to**: `psg.spans`.
- **MUST read from**: `psg.project_root` (for correlation IDs).

# 7. Invariants
- **obs_event_id_is_uuid**: All events must have unique IDs.
- **obs_timestamp_iso_format**: All timestamps must be ISO8601.
- **span_integrity**: A child span cannot outlive its parent.

# 8. Governance Considerations
- **Overhead**: Observability MUST NOT impose significant performance penalty (>5%).
- **Completeness**: "If it's not in the trace, it didn't happen."

# 9. Examples (Optional)
**Trace Hierarchy**:
- Root: `SingleAgentFlow`
  - Child: `PlanStage`
    - Child: `LLMCall(GeneratePlan)`
  - Child: `ExecutionStage`
    - Child: `ToolCall(Search)`

# 10. Change Log
