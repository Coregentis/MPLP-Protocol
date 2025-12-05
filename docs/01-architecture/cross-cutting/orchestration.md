> [!FROZEN]
> **MPLP Protocol v1.0.0 — Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

> [!FROZEN]
> **MPLP Protocol v1.0.0 — Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Cross-Cutting Concern: Orchestration

## 1. Scope

This document defines the **Orchestration** cross-cutting concern, which governs the lifecycle management of plans, steps, and agent activities.

**Boundaries**:
- **In Scope**: Control loop logic, Plan execution, Dependency resolution.
- **Out of Scope**: Specific scheduling algorithms (e.g., priority queues).

## 2. Normative Definitions

- **Orchestrator**: The runtime component responsible for driving the execution loop.
- **Pipeline Stage**: A distinct phase of execution (e.g., `context`, `plan`, `execute`).
- **Dependency**: A constraint that requires one step to complete before another begins.

## 3. Responsibilities (MUST/SHALL)

1.  **Dependency Enforcement**: The Orchestrator **MUST** respect step dependencies defined in the Plan.
2.  **Stage Transitions**: The Orchestrator **MUST** emit `PipelineStageEvent` upon entering or leaving a stage.
3.  **Termination**: The Orchestrator **MUST** detect when a plan is complete (success or failure) and terminate execution.

## 4. Architecture Structure

Orchestration is implemented via:
- **L2 Core Module**: Defines `PipelineStage` and governance rules.
- **L3 Orchestrator**: The actual control loop implementation.
- **L3 AEL**: The mechanism for executing individual actions.

## 5. Binding Points

- **Schema**: `mplp-plan.schema.json` (Dependencies).
- **Events**: `PipelineStageEvent`.
- **PSG**: `psg.plans` and `psg.plan_steps`.

## 6. Interaction Model

### Execution Loop
1.  **Select**: Orchestrator identifies "Ready" steps (dependencies met).
2.  **Dispatch**: Orchestrator dispatches steps to AEL.
3.  **Wait**: Orchestrator waits for completion (or partial completion).
4.  **Update**: Orchestrator marks steps as "Completed".
5.  **Repeat**: Loop continues until no steps remain.

## 7. Versioning & Invariants

- **Invariant**: A step cannot run if its dependencies are not met.
- **Invariant**: A plan cannot be marked "Completed" if any required step is "Failed".

## 8. Security / Safety Considerations

- **Resource Limits**: The Orchestrator **SHOULD** enforce timeouts on step execution to prevent infinite loops.
- **Interruptibility**: The Orchestrator **SHOULD** support graceful shutdown/interruption by the user.

## 9. References

- [L3: Execution & Orchestration](../l3-execution-orchestration.md)
- [L2: Coordination & Governance](../l2-coordination-governance.md)
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
