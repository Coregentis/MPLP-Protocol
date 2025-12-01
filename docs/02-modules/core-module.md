---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Core Module

## 1. Scope

This document defines the **Core Module**, which manages the protocol instance itself. It serves as the "bootstrap" configuration, declaring which version of MPLP is running and which modules are enabled.

**Boundaries**:
- **In Scope**: Protocol Versioning, Module Registry, Instance Status.
- **Out of Scope**: Runtime implementation details.

## 2. Normative Definitions

- **Core Instance**: A running instance of the MPLP protocol.
- **Protocol Version**: The semantic version of the MPLP specification being used.
- **Module Descriptor**: Configuration for a specific L2 module.

## 3. Responsibilities (MUST/SHALL)

1.  **Bootstrapping**: The Core module **MUST** be loaded first to determine the protocol version.
2.  **Validation**: The Runtime **MUST** verify that all `required` modules are present and healthy.
3.  **Versioning**: The `protocol_version` **MUST** match the supported version of the Runtime.

## 4. Architecture Structure

**Schema File**: `schemas/v2/mplp-core.schema.json`

### Core Object
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `meta` | `Metadata` | ✅ Yes | Protocol metadata. |
| `governance` | `Object` | ❌ No | Lifecycle metadata. |
| `core_id` | `UUID` | ✅ Yes | Global unique identifier. |
| `protocol_version` | `String` | ✅ Yes | Major version (e.g., "1.0.0"). |
| `status` | `Enum` | ✅ Yes | `draft`, `active`, `deprecated`, `archived`. |
| `modules` | `Array` | ✅ Yes | List of `CoreModuleDescriptor`. |
| `trace` | `TraceBase` | ❌ No | Trace reference. |
| `events` | `Array` | ❌ No | Key lifecycle events. |

### CoreModuleDescriptor Object
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `module_id` | `Enum` | ✅ Yes | `context`, `plan`, `confirm`, `trace`, `role`, `extension`, `dialog`, `collab`, `core`, `network`. |
| `version` | `String` | ✅ Yes | Module version. |
| `status` | `Enum` | ✅ Yes | `enabled`, `disabled`, `experimental`, `deprecated`. |
| `required` | `Boolean` | ❌ No | Mandatory flag. |
| `description` | `String` | ❌ No | Brief description. |

## 5. Binding Points

- **L1 Schema**: `mplp-core.schema.json`
- **L2 Events**: `GraphUpdateEvent`.
- **PSG Path**: `psg.core`.

## 6. Interaction Model

1.  **Bootstrap**: Runtime loads Core config.
2.  **Check**: Runtime verifies version compatibility.
3.  **Init**: Runtime initializes enabled modules in dependency order.

## 7. Versioning & Invariants

- **Invariant**: `protocol_version` **MUST** be compatible with the Runtime.
- **Invariant**: Duplicate `module_id` entries are **NOT** allowed.

## 8. Security / Safety Considerations

- **Integrity**: The Core configuration **SHOULD** be immutable during runtime execution.
- **Fallback**: If a required module fails to load, the Runtime **MUST** halt initialization.

## 9. References

- [Context Module](context-module.md)
- [Protocol Versioning](../01-architecture/cross-cutting/protocol-version.md)
