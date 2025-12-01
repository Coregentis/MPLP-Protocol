---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Cross-Cutting Concerns Overview

## 1. Scope

This document defines the **9 Cross-Cutting Concerns** of the MPLP Protocol. These are horizontal capabilities that cut across all vertical L2 Coordination & Governance and L3 Runtime components.

**Boundaries**:
- **In Scope**: Definition of the 9 concerns, normative requirements for modules/runtimes.
- **Out of Scope**: Implementation details (see L3/L4 specs).

## 2. Normative Definitions

A **Cross-Cutting Concern** is a systemic requirement that cannot be encapsulated within a single module. It requires cooperation from:
1.  **L2 Coordination & Governance** (to emit events/metadata)
2.  **L3 Runtime** (to enforce policies/mechanisms)
3.  **L4 Adapters** (to respect boundaries)

## 3. Responsibilities (MUST/SHALL)

1.  **Uniformity**: All modules **MUST** implement these concerns uniformly (e.g., same error handling pattern).
2.  **Centralization**: The L3 Runtime **MUST** provide central mechanisms for these concerns (e.g., a single Event Bus).
3.  **Precedence**: Security and Protocol Versioning concerns **SHALL** take precedence over functional requirements.

## 4. Architecture Structure

### The 9 Core Crosscuts

| Concern | File | Description |
| :--- | :--- | :--- |
| **1. Coordination** | [coordination.md](coordination.md) | Multi-agent collaboration and handoffs. |
| **2. Error Handling** | [error-handling.md](error-handling.md) | Failure detection, recovery, and retry logic. |
| **3. Event Bus** | [event-bus.md](event-bus.md) | Structured event routing and consumption. |
| **4. Orchestration** | [orchestration.md](orchestration.md) | Pipeline and plan execution control. |
| **5. Performance** | [performance.md](performance.md) | Timing metrics, resource usage, cost tracking. |
| **6. Protocol Version** | [protocol-version.md](protocol-version.md) | Version compatibility and migration. |
| **7. Security** | [security.md](security.md) | Authentication, authorization, access control. |
| **8. State Sync** | [state-sync.md](state-sync.md) | PSG consistency and synchronization. |
| **9. Transaction** | [transaction.md](transaction.md) | Atomicity and rollback for grouped operations. |

### Additional Components
The following files describe specific mechanisms used to implement these crosscuts:
- [AEL (Agent Execution)](ael.md) - Mechanism for Orchestration/Coordination.
- [VSL (Value State)](vsl.md) - Mechanism for State Sync/Transaction.
- [Observability](observability.md) - Mechanism for Event Bus.
- [Learning Feedback](learning-feedback.md) - Extension of Observability.

## 5. Binding Points

- **Modules**: Bind to crosscuts via L1 Schemas (e.g., `Trace` schema for Error Handling).
- **Runtime**: Binds to crosscuts via L3 Services (e.g., `EventBus` service).

## 6. Interaction Model

See individual concern documents for interaction flows.

## 7. Versioning & Invariants

- **Major Version**: Adding or removing a cross-cutting concern.
- **Minor Version**: Enhancing a concern (e.g., new error types).

## 8. Security / Safety Considerations

- **Holistic Security**: Security is itself a cross-cutting concern (See [security.md](security.md)).
- **Fail-Safe**: Error handling **MUST** default to safe states.

## 9. References

- [Architecture Overview](../architecture-overview.md)
- [L3: Execution & Orchestration](../l3-execution-orchestration.md)
