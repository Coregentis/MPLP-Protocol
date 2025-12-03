---
MPLP Protocol: v1.0.0 — Frozen Specification
Freeze Date: 2025-12-03
Status: FROZEN (no breaking changes permitted)
Governance: MPLP Protocol Governance Committee (MPGC)
Copyright: © 2025 邦士（北京）网络科技有限公司
License: Apache-2.0
Any normative change requires a new protocol version.
---

---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Cross-Cutting Concern: Error Handling

## 1. Scope

This document defines the **Error Handling** cross-cutting concern, which governs how failures are detected, reported, and recovered from across the system.

**Boundaries**:
- **In Scope**: Failure detection, Error reporting schemas, Recovery strategies (Retry, Rollback).
- **Out of Scope**: Application-specific business logic errors.

## 2. Normative Definitions

- **Fault**: A defect in the system (e.g., bug, network partition).
- **Error**: An incorrect internal state caused by a fault.
- **Failure**: The inability of the system to perform its function.

## 3. Responsibilities (MUST/SHALL)

1.  **Detection**: The runtime **MUST** detect agent crashes, timeouts, and schema validation failures.
2.  **Reporting**: All failures **MUST** be reported via `PipelineStageEvent` with `status: failed`.
3.  **Safety**: Error handling routines **MUST NOT** cause further corruption of the PSG.

## 4. Architecture Structure

Error Handling is implemented via:
- **L2 Trace Module**: Records error spans.
- **L3 Orchestrator**: Implements retry policies.
- **L3 VSL**: Implements rollback mechanisms.

## 5. Binding Points

- **Schema**: `mplp-trace.schema.json` (Error Span).
- **Events**: `PipelineStageEvent` (status=failed), `CompensationPlanEvent`.
- **PSG**: `psg.traces` stores error logs.

## 6. Interaction Model

### Retry Flow
1.  Agent operation fails (e.g., LLM timeout).
2.  Orchestrator catches exception.
3.  Orchestrator checks Retry Policy (e.g., max_retries=3).
4.  If retries remain: Orchestrator waits and retries.
5.  If retries exhausted: Orchestrator marks Step as Failed and emits Event.

## 7. Versioning & Invariants

- **Invariant**: A failed step cannot be marked as "completed" without re-execution.
- **Invariant**: Error logs must be immutable.

## 8. Security / Safety Considerations

- **Information Leakage**: Error messages **SHOULD** be sanitized to avoid leaking secrets or PII.
- **Resource Cleanup**: Error handlers **MUST** release allocated resources (e.g., file handles).

## 9. References

- [L3: Execution & Orchestration](../l3-execution-orchestration.md)
- [Rollback Spec](../../06-runtime/rollback-minimal-spec.md)
