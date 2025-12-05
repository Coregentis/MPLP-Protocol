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

# 1. Purpose
The Action Execution Layer (AEL) Specification defines the normative requirements for executing side-effects (Tools, LLMs, APIs) within the MPLP runtime. It ensures isolation, observability, and control over external interactions.

# 2. Normative Scope
This specification applies to:
- **L3 Runtime**: The component responsible for dispatching actions.
- **L4 Adapters**: The concrete implementations of tools and LLM clients.
- **Extension Module**: The L2 definition of available tools.

# 3. Responsibilities (SHALL / MUST)
1.  The AEL **MUST** intercept all requests for external execution.
2.  The AEL **MUST** validate the `Action` payload against the corresponding schema before execution.
3.  The AEL **MUST** emit a `RuntimeExecutionEvent` for every execution attempt (start and finish).
4.  The AEL **SHALL** enforce configured rate limits and timeouts.
5.  The AEL **MUST NOT** expose internal runtime state (credentials, raw PSG) to the executing tool unless explicitly authorized.
6.  The AEL **MUST** capture and normalize execution results (success/failure, output, metadata).
7.  The AEL **SHOULD** implement sandboxing for untrusted code execution.
8.  The AEL **MUST** propagate the `trace_id` to the external system if supported.

# 4. Cross-module Bindings
- **Plan Module**: Generates `Action` objects (MUST be executed by AEL).
- **Trace Module**: Records the `RuntimeExecutionEvent` emitted by AEL.
- **Extension Module**: Defines the `Tool` definitions used by AEL.
- **Role Module**: Defines permissions checked by AEL.

# 5. Event Obligations
- **REQUIRED**: `RuntimeExecutionEvent` (family: `runtime_execution`).
  - `executor_kind`: `tool` | `llm` | `agent`
  - `status`: `pending` -> `running` -> `completed` | `failed`

# 6. PSG Bindings (Runtime Touchpoints)
- **MUST write to**: `psg.execution_traces` (via Trace module logic or direct event append).
- **MUST read from**: `psg.agent_roles` (for permission checks).
- **MUST read from**: `psg.constraints` (for budget/timeout checks).

# 7. Invariants
- **obs_runtime_event_has_execution_id**: Every execution MUST have a UUID v4 ID.
- **obs_runtime_executor_kind_valid**: Executor kind MUST be one of the allowed enum values.
- **obs_runtime_status_valid**: Status transitions MUST follow the defined lifecycle.

# 8. Governance Considerations
- **Security**: AEL is the primary security boundary for the agent. Vulnerabilities here compromise the host.
- **Determinism**: AEL implementations SHOULD strive for determinism where possible (e.g., fixed seeds for LLMs).

# 9. Examples (Optional)
```json
{
  "event_family": "runtime_execution",
  "event_type": "tool_execution",
  "executor_kind": "tool",
  "payload": {
    "tool_name": "weather_api",
    "input": { "city": "Paris" }
  }
}
```

# 10. Change Log
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
