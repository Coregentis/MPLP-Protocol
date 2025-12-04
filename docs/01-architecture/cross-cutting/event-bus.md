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

# Cross-Cutting Concern: Event Bus

## 1. Scope

This document defines the **Event Bus** cross-cutting concern, which governs the routing, delivery, and persistence of observability and integration events.

**Boundaries**:
- **In Scope**: Event routing, Subscription mechanisms, Event persistence.
- **Out of Scope**: Event schema definitions (see L2/L4).

## 2. Normative Definitions

- **Event Bus**: The central mechanism for routing events from Producers to Consumers.
- **Producer**: Any component (Module, Runtime, Adapter) that emits an event.
- **Consumer**: Any component (Logger, Monitor, Tool) that subscribes to events.

## 3. Responsibilities (MUST/SHALL)

1.  **Delivery**: The Event Bus **MUST** attempt to deliver all emitted events to registered consumers.
2.  **Ordering**: The Event Bus **SHOULD** preserve the causal order of events.
3.  **Decoupling**: Producers **MUST NOT** be aware of Consumers.

## 4. Architecture Structure

The Event Bus is an L3 component that connects:
- **L2 Coordination & Governance** (Producers)
- **L4 Adapters** (Producers/Consumers)
- **Observability System** (Consumer)

## 5. Binding Points

- **Schema**: `mplp-event-core.schema.json` (Header).
- **Events**: All 12 Observability Families + 4 Integration Families.
- **PSG**: `psg.events` (optional persistence).

## 6. Interaction Model

1.  **Emit**: Component calls `ctx.emit(event)`.
2.  **Route**: Event Bus matches event against subscriptions.
3.  **Deliver**: Event Bus invokes callback for each subscriber.
4.  **Persist**: (Optional) Event Bus writes event to PSG/Log.

## 7. Versioning & Invariants

- **Invariant**: All events must have a valid Header (id, timestamp, source).
- **Invariant**: Events are immutable once emitted.

## 8. Security / Safety Considerations

- **Access Control**: The Event Bus **SHOULD** enforce ACLs on who can subscribe to sensitive events.
- **Flooding**: The Event Bus **SHOULD** implement rate limiting to prevent DoS.

## 9. References

- [Observability Overview](../../04-observability/mplp-observability-overview.md)
- [L3: Execution & Orchestration](../l3-execution-orchestration.md)
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
