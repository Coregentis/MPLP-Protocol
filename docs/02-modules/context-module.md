---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# Context Module

## 1. Scope

This document defines the **Context Module**, which serves as the **root anchor** for any MPLP execution session. It defines the static "World State," including the business domain, runtime environment, and global constraints.

**Boundaries**:
- **In Scope**: Project Root, Environment, Global Constraints, Lifecycle Status.
- **Out of Scope**: Dynamic execution state (Plan/Trace), Agent memory.

## 2. Normative Definitions

- **Context**: The immutable boundary of a project or session.
- **Root**: The core definition of domain and environment.
- **Constraint**: A global rule that applies to all plans and actions within the context.

## 3. Responsibilities (MUST/SHALL)

1.  **Root Definition**: The Context **MUST** be the first entity created in any MPLP session.
2.  **Immutability**: Once `status` is `active`, the `root` properties (domain, environment) **SHOULD NOT** change.
3.  **Constraint Propagation**: Constraints defined in Context **MUST** be respected by all Plans and Actions.

## 4. Architecture Structure

**Schema File**: `schemas/v2/mplp-context.schema.json`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `meta` | `Metadata` | ✅ Yes | Protocol metadata. |
| `governance` | `Object` | ❌ No | Lifecycle and locking metadata. |
| `context_id` | `UUID` | ✅ Yes | Global unique identifier. |
| `root` | `Object` | ✅ Yes | Root definition (domain, environment). |
| `title` | `String` | ✅ Yes | Human-readable title. |
| `summary` | `String` | ❌ No | Brief scope summary. |
| `status` | `Enum` | ✅ Yes | `draft`, `active`, `suspended`, `archived`, `closed`. |
| `tags` | `Array` | ❌ No | Classification tags. |
| `language` | `String` | ❌ No | Primary working language. |
| `owner_role` | `String` | ❌ No | ID of the primary owner role. |
| `constraints` | `Object` | ❌ No | Global constraints (security, budget). |
| `created_at` | `DateTime` | ❌ No | Creation timestamp. |
| `updated_at` | `DateTime` | ❌ No | Last update timestamp. |
| `trace` | `TraceBase` | ❌ No | Audit trace reference. |
| `events` | `Array` | ❌ No | Key lifecycle events. |

## 5. Binding Points

- **L1 Schema**: `mplp-context.schema.json`
- **L2 Events**: `GraphUpdateEvent` (on creation/update).
- **PSG Path**: `psg.project_root`.

## 6. Interaction Model

1.  **Initialization**: Agent/User creates Context (Status: `draft`).
2.  **Activation**: Context is validated and set to `active`.
3.  **Usage**: Plan module reads `context_id` to bind scope.
4.  **Closure**: Context is set to `closed` or `archived`.

## 7. Versioning & Invariants

- **Invariant**: `sa_requires_context` - SA execution requires a valid Context.
- **Invariant**: `sa_context_must_be_active` - SA can only execute when Context status is `active`.

## 8. Security / Safety Considerations

- **Access Control**: Modification of `root` properties should be restricted to `owner_role`.
- **Constraint Enforcement**: Runtimes **MUST** enforce `constraints` (e.g., "No internet access") at the AEL level.

## 9. References

- [L2: Coordination & Governance](../01-architecture/l2-coordination-governance.md)
- [Plan Module](plan-module.md)
