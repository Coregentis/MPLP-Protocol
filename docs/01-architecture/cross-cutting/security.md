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

# Cross-Cutting Concern: Security

## 1. Scope

This document defines the **Security** cross-cutting concern, which governs authentication, authorization, and data protection within the MPLP ecosystem.

**Boundaries**:
- **In Scope**: Role-Based Access Control (RBAC), Secret Management, Input Validation.
- **Out of Scope**: Specific cryptographic algorithms (implementation detail).

## 2. Normative Definitions

- **Principal**: An entity (User or Agent) requesting an action.
- **Role**: A named set of permissions (e.g., `architect`, `developer`).
- **Secret**: Sensitive data (API keys, passwords) that must not be exposed.

## 3. Responsibilities (MUST/SHALL)

1.  **Authentication**: The runtime **MUST** verify the identity of all Principals.
2.  **Authorization**: The runtime **MUST** enforce RBAC policies defined in the `Role` module.
3.  **Secret Protection**: Secrets **MUST NOT** be stored in plaintext in the PSG or Trace logs.

## 4. Architecture Structure

Security is implemented via:
- **L2 Role Module**: Defines roles and permissions.
- **L3 Orchestrator**: Enforces access control checks.
- **L4 Adapters**: Handle secure credential storage.

## 5. Binding Points

- **Schema**: `mplp-role.schema.json`.
- **Events**: `SecurityEvent` (if applicable, or generic `RuntimeExecutionEvent` with security context).
- **PSG**: `psg.project_root.permissions`.

## 6. Interaction Model

### Access Control Flow
1.  Principal requests Action (e.g., "Approve Plan").
2.  Orchestrator identifies Principal's Role.
3.  Orchestrator checks Role capabilities.
4.  If authorized: Action proceeds.
5.  If unauthorized: Action denied, Security Exception raised.

## 7. Versioning & Invariants

- **Invariant**: A Principal cannot perform an action not granted by their Role.
- **Invariant**: Secrets must be redacted from all Event payloads.

## 8. Security / Safety Considerations

- **Least Privilege**: Agents **SHOULD** operate with the minimum necessary permissions.
- **Sandboxing**: Untrusted code execution (e.g., generated scripts) **MUST** be isolated.

## 9. References

- [L2: Coordination & Governance](../l2-coordination-governance.md)
- [L4: Integration Infrastructure](../l4-integration-infra.md)
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
