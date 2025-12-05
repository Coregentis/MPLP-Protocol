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
## 1. Identity & Scope  *(Normative)*

- **Profile ID**: `sa_profile` (from `mplp-sa-profile.yaml`)
- **Execution Mode**: `single_agent`
- **Intended Use**:
  - The **Single Agent (SA)** profile is the minimal executable unit in MPLP.
  - It is designed for linear, autonomous task execution where a single agent reads a Context, evaluates a Plan, and executes steps sequentially.
  - Suitable for: Data processing pipelines, simple request-response agents, and individual worker nodes within a larger system.
- **Out-of-Scope**:
  - Multi-agent coordination (see MAP Profile).
  - Complex consensus mechanisms.
  - Dynamic topology changes during execution.

---

## 2. Required Modules & Artifacts  *(Normative)*

> The following L2 modules are required for SA Profile compliance.

| Module | Required | Purpose in this Profile |
|--------|----------|-------------------------|
| Context | **Yes** | Provides the immutable environment and domain information (`root`, `domain`). |
| Plan    | **Yes** | Defines the executable strategy (`steps`, `dependencies`). |
| Trace   | **Yes** | Records the execution history and observability events. |
| Confirm | No | Optional. Used if Human-in-the-Loop approval is needed for specific steps. |
| Role    | No | Optional. Used if the agent needs to validate specific capabilities. |
| Extension | No | Optional. Used for tool execution. |
| Dialog  | No | Optional. Used if the agent interacts with a user via chat. |
| Collab  | No | Not used in SA (specific to MAP). |
| Core    | **Yes** | Required by protocol definition (defines version). |
| Network | No | Not typically used in isolated SA execution. |

---

## 3. Execution Model  *(Normative)*

### 3.1 Lifecycle States

The SA Profile defines a strict 6-state lifecycle:

1.  **`initialize`**: The SA instance is created by the Runtime.
2.  **`load_context`**: The SA binds to a specific `context_id` and validates its status.
3.  **`evaluate_plan`**: The SA parses the `plan_id`, resolves step dependencies, and determines execution order.
4.  **`execute_step`**: The SA executes steps sequentially. This state is re-entered for each step.
5.  **`emit_trace`**: The SA writes execution events to the Trace module.
6.  **`complete`**: All steps are finished (success or failure), and the SA terminates.

### 3.2 Required Transitions

The Runtime MUST enforce the following transitions:

-   `initialize` → `load_context`: Must occur immediately upon start.
-   `load_context` → `evaluate_plan`: Requires valid, active Context.
-   `evaluate_plan` → `execute_step`: Requires valid Plan with at least one step.
-   `execute_step` → `emit_trace`: Must occur after each step or batch of steps.
-   `emit_trace` → `complete`: Occurs when the plan is fully executed or a terminal failure is reached.

---

## 4. Invariants & Safety Guarantees  *(Normative)*

The following invariants from `schemas/v2/invariants/sa-invariants.yaml` MUST be satisfied:

| Rule ID | Description | Scope | Violation Effect |
|---------|-------------|-------|------------------|
| `sa_requires_context` | SA execution requires a valid Context with UUID v4 identifier. | Context | Execution Abort |
| `sa_context_must_be_active` | SA can only execute when Context status is 'active'. | Context | Execution Abort |
| `sa_plan_context_binding` | Plan's `context_id` must match SA's loaded Context. | Plan | Validation Error |
| `sa_plan_has_steps` | Plan must contain at least one executable step. | Plan | Validation Error |
| `sa_trace_not_empty` | SA must emit at least one trace event before completion. | Trace | Compliance Failure |
| `sa_trace_context_binding` | Trace `context_id` must match SA's Context. | Trace | Data Integrity Error |

---

## 5. Observability Requirements  *(Normative)*

> See `sa-events.md` for detailed event definitions.

### 5.1 Required Event Families

| Event Family | When Emitted | Minimal Payload Requirements |
|--------------|-------------|------------------------------|
| `SAInitialized` | On instance creation | `sa_id`, `timestamp` |
| `SAContextLoaded` | After context load | `context_id`, `context_status` |
| `SAPlanEvaluated` | After plan parsing | `plan_id`, `step_count`, `execution_order` |
| `SAStepStarted` | Before step execution | `step_id`, `agent_role` |
| `SAStepCompleted` | After step success | `step_id`, `status=completed` |
| `SATraceEmitted` | On trace write | `trace_id`, `events_written` |
| `SACompleted` | On termination | `total_steps`, `success_count` |

### 5.2 Recommended / Optional Events

| Level | Event Family | Rationale |
|-------|--------------|-----------|
| Recommended | `SAStepFailed` | Critical for debugging execution failures. |
| Optional | `CostAndBudgetEvent` | If the runtime tracks token usage per step. |

---

## 6. PSG & Runtime Behavior  *(Normative)*

### 6.1 PSG Read/Write Obligations

-   **Read Obligations**:
    -   MUST read `psg.context_root` to establish environment.
    -   MUST read `psg.plans` to retrieve execution strategy.
-   **Write Obligations**:
    -   MUST write to `psg.execution_traces` to persist the audit trail.
    -   SHOULD update `psg.plan_steps` status (e.g., pending → completed) if the Runtime supports live updates.

### 6.2 Cross-cutting Integration

-   **Traceability**: All events must be linked to the `trace_id`.
-   **Error Handling**: Step failures should trigger standard error handling policies (retry, skip, or abort) as defined in the Plan or Runtime config.

---

## 7. Interaction with L2 Coordination & Governance  *(Normative)*

### 7.1 SA + Modules

-   **SA + Context**: Read-only. The Context acts as the immutable "grounding" for the agent.
-   **SA + Plan**: Read-only (structure). The Plan acts as the "instruction set".
-   **SA + Trace**: Write-only. The Trace acts as the "write-ahead log" or "execution journal".

### 7.2 Failure & Escalation Paths

-   If `Context` is invalid: SA MUST NOT start.
-   If `Plan` is invalid: SA MUST abort before first step.
-   If a `Step` fails: SA SHOULD emit `SAStepFailed` and follow the Plan's error policy (default: abort).

---

## 8. Golden Flow Coverage  *(Informational)*

-   **SA Profile is covered by:**
    -   `sa-flow-01-basic`: Validates basic lifecycle and trace emission.
    -   `sa-flow-02-step-evaluation`: Validates dependency resolution and ordering.

---

## 9. Versioning & Compatibility  *(Normative)*

-   **Stability**: Stable (v1.0 Core).
-   **Compatibility**:
    -   Forward compatible with future 1.x versions.
    -   New lifecycle states may be added in 2.0.

---

## 10. Non-normative Implementation Notes

-   **Reference Implementation**: TracePilot implements the SA Profile by mapping `SAInitialized` to its internal `SessionStart` event.
-   **Concurrency**: While SA is logically single-threaded, the Runtime may execute independent SA instances in parallel.
-   **LLM Integration**: The `execute_step` state typically involves an API call to an LLM (e.g., Claude, GPT-4), but the SA Profile itself is agnostic to the specific model used.
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
