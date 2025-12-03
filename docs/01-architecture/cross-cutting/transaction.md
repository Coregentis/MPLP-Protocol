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

# Cross-Cutting Concern: Transaction

## 1. Scope

This document defines the **Transaction** cross-cutting concern, which governs the atomicity, consistency, isolation, and durability (ACID) properties of complex operations.

**Boundaries**:
- **In Scope**: Transaction boundaries, Rollback mechanisms, Saga patterns.
- **Out of Scope**: Database-level locking details.

## 2. Normative Definitions

- **Transaction**: A logical unit of work comprising multiple PSG mutations.
- **Commit**: Making the changes of a transaction permanent.
- **Rollback**: Reverting the PSG to the state before the transaction began.

## 3. Responsibilities (MUST/SHALL)

1.  **Atomicity**: A transaction **MUST** either fully succeed or fully fail.
2.  **Isolation**: Intermediate states of a transaction **SHOULD NOT** be visible to other agents until commit.
3.  **Durability**: Committed transactions **MUST** be persisted to storage.

## 4. Architecture Structure

Transaction management is implemented via:
- **L3 VSL**: Provides `beginTransaction`, `commit`, `rollback` primitives.
- **L3 Orchestrator**: Manages long-running transactions (Sagas).

## 5. Binding Points

- **Events**: `GraphUpdateEvent` (emitted only on commit).
- **PSG**: Snapshotting mechanism.

## 6. Interaction Model

### Transaction Flow
1.  Agent starts transaction.
2.  Agent performs multiple mutations (e.g., create Plan, add 5 Steps).
3.  VSL buffers mutations.
4.  Agent requests Commit.
5.  VSL validates final state.
6.  VSL persists changes and emits `GraphUpdateEvent` (bulk).

## 7. Versioning & Invariants

- **Invariant**: The PSG must be valid before and after a transaction.
- **Invariant**: A failed transaction must leave the PSG unchanged.

## 8. Security / Safety Considerations

- **Deadlocks**: Long-running transactions **SHOULD** have timeouts to prevent resource holding.
- **Recovery**: The system **MUST** be able to recover from a crash during a transaction (e.g., via Write-Ahead Log).

## 9. References

- [L3: Execution & Orchestration](../l3-execution-orchestration.md)
- [Rollback Spec](../../06-runtime/rollback-minimal-spec.md)
