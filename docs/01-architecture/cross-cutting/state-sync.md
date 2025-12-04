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

# Cross-Cutting Concern: State Sync

## 1. Scope

This document defines the **State Sync** cross-cutting concern, which governs how the Project Semantic Graph (PSG) is kept consistent and synchronized across components.

**Boundaries**:
- **In Scope**: PSG mutation rules, Change notification, Consistency models.
- **Out of Scope**: Underlying database replication protocols.

## 2. Normative Definitions

- **Mutation**: An atomic change to the PSG (create, update, delete node/edge).
- **GraphUpdateEvent**: The canonical event emitted after any mutation.
- **Subscriber**: A component listening for state changes.

## 3. Responsibilities (MUST/SHALL)

1.  **Atomicity**: All PSG mutations **MUST** be atomic.
2.  **Notification**: The runtime **MUST** emit `GraphUpdateEvent` for every successful mutation.
3.  **Consistency**: The PSG **MUST** always satisfy L1 invariants after a mutation completes.

## 4. Architecture Structure

State Sync is implemented via:
- **L3 VSL**: Manages the write-ahead log or transaction commit.
- **L3 Event Bus**: Broadcasts updates.
- **L2 Coordination & Governance**: Define valid state transitions.

## 5. Binding Points

- **Schema**: `mplp-graph-update-event.schema.json`.
- **Events**: `GraphUpdateEvent`.
- **PSG**: All nodes and edges.

## 6. Interaction Model

### Sync Flow
1.  Component requests mutation (e.g., `psg.addNode(...)`).
2.  VSL validates mutation against invariants.
3.  VSL applies mutation to storage.
4.  VSL emits `GraphUpdateEvent`.
5.  Subscribers (e.g., UI, other agents) receive event and refresh local state.

## 7. Versioning & Invariants

- **Invariant**: `GraphUpdateEvent` payloads must contain the full delta of the change.
- **Invariant**: Event timestamps must be monotonically increasing.

## 8. Security / Safety Considerations

- **Race Conditions**: The VSL **MUST** handle concurrent writes (e.g., via optimistic locking) to prevent lost updates.

## 9. References

- [L3: Execution & Orchestration](../l3-execution-orchestration.md)
- [Observability Overview](../../04-observability/mplp-observability-overview.md)
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
