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

# Cross-Cutting Concern: Coordination

## 1. Scope

This document defines the **Coordination** cross-cutting concern, which governs how multiple agents collaborate, share state, and hand off control within an MPLP project.

**Boundaries**:
- **In Scope**: Turn-taking, Broadcast, Handoff protocols.
- **Out of Scope**: Internal agent thought processes.

## 2. Normative Definitions

- **Turn**: A discrete period where a single agent has exclusive write access to the Plan.
- **Handoff**: The atomic transfer of control from one agent to another.
- **Broadcast**: A message sent from the Orchestrator to multiple agents simultaneously.

## 3. Responsibilities (MUST/SHALL)

1.  **Exclusive Access**: During a Turn, the active agent **MUST** have exclusive write access to the relevant Plan nodes.
2.  **Atomic Handoff**: Handoffs **MUST** be atomic; control cannot be lost or duplicated.
3.  **Context Sharing**: All coordinating agents **MUST** share the same Project Context.

## 4. Architecture Structure

Coordination is implemented via:
- **L2 Collab Module**: Defines `CollabSession` and `Turn` schemas.
- **L3 Orchestrator**: Enforces turn-taking logic.
- **MAP Profile**: Defines high-level coordination patterns.

## 5. Binding Points

- **Schema**: `mplp-collab.schema.json`
- **Events**: `MAPSessionStarted`, `MAPTurnDispatched`, `MAPTurnCompleted`.
- **PSG**: `psg.collab_sessions` stores session state.

## 6. Interaction Model

### Turn-Taking Flow
1.  Agent A completes task.
2.  Agent A requests Handoff to Agent B.
3.  Orchestrator validates request.
4.  Orchestrator updates PSG (Active Agent: B).
5.  Orchestrator dispatches `MAPTurnDispatched` to Agent B.

## 7. Versioning & Invariants

- **Invariant**: At any point in a Turn-Taking session, exactly one agent is active.
- **Invariant**: All agents in a session must have compatible Role capabilities.

## 8. Security / Safety Considerations

- **Impersonation**: The runtime **MUST** verify that the agent requesting a handoff is indeed the active agent.
- **Deadlock**: The Orchestrator **SHOULD** implement timeouts to prevent stalled sessions.

## 9. References

- [L2: Coordination & Governance](../l2-coordination-governance.md)
- [MAP Profile](../../03-profiles/mplp-map-profile.md)
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
