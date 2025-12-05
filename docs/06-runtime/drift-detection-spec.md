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
## 1. Definition

**Drift** is defined as a divergence between the **Actual State** (in PSG) and the **Expected State** (defined by Plan or Invariants).

## 2. Detection Mechanism

The Runtime MUST employ an **Invariant-Based** detection strategy.

### 2.1 Invariant Sources
Drift detection relies on the normative invariants defined in:
-   `schemas/v2/invariants/sa-invariants.yaml`
-   `schemas/v2/invariants/map-invariants.yaml`

### 2.2 Detection Loop
1.  **Monitor**: Listen for `GraphUpdateEvent` and `RuntimeExecutionEvent`.
2.  **Check**: On every update, evaluate relevant Invariants against the PSG.
3.  **Alert**: If an invariant is violated (e.g., `sa_context_must_be_active` is false), raise a **Drift Alert**.

## 3. Drift Types

| Type | Description | Relevant Invariant Example |
|------|-------------|----------------------------|
| **Structural Drift** | PSG structure violates schema | `sa_plan_has_steps` |
| **State Drift** | Lifecycle state invalid | `sa_context_must_be_active` |
| **Execution Drift** | Runtime behavior violates rules | `map_turn_completion_matches_dispatch` |

## 4. Response

Upon detecting drift, the Runtime SHOULD:
1.  **Emit Event**: `DriftDetectedEvent` (Generic Core Event).
2.  **Log to Trace**: Record the violation in the Trace.
3.  **Halt/Pause**: If the violation is critical (e.g., Security), suspend execution.
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
