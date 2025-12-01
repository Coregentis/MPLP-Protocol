---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# Extension Module

## 1. Scope

This document defines the **Extension Module**, which provides the standard mechanism for plugins, capability injection, and protocol enhancements. It allows MPLP to be extensible without modifying the core protocol.

**Boundaries**:
- **In Scope**: Plugin Registration, Configuration, Lifecycle Management.
- **Out of Scope**: Implementation logic of specific extensions.

## 2. Normative Definitions

- **Extension**: A registered module that adds new capabilities or behaviors.
- **Extension Type**: Classification of the extension (e.g., `capability`, `policy`).
- **Config**: The configuration payload required by the extension.

## 3. Responsibilities (MUST/SHALL)

1.  **Registration**: Extensions **MUST** be registered with a unique `extension_id` and `version`.
2.  **Isolation**: Extensions **SHOULD NOT** interfere with the core protocol invariants.
3.  **Configuration**: Extensions **MUST** define their configuration schema (if any) within the `config` object.

## 4. Architecture Structure

**Schema File**: `schemas/v2/mplp-extension.schema.json`

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `meta` | `Metadata` | ✅ Yes | Protocol metadata. |
| `governance` | `Object` | ❌ No | Lifecycle metadata. |
| `extension_id` | `UUID` | ✅ Yes | Global unique identifier. |
| `context_id` | `UUID` | ✅ Yes | Binding to Context. |
| `name` | `String` | ✅ Yes | Extension name. |
| `extension_type` | `Enum` | ✅ Yes | `capability`, `policy`, `integration`, `transformation`, `validation`, `other`. |
| `version` | `SemVer` | ✅ Yes | Semantic version string. |
| `status` | `Enum` | ✅ Yes | `registered`, `active`, `inactive`, `deprecated`. |
| `config` | `Object` | ❌ No | Configuration payload. |
| `trace` | `TraceBase` | ❌ No | Trace reference. |
| `events` | `Array` | ❌ No | Key lifecycle events. |

## 5. Binding Points

- **L1 Schema**: `mplp-extension.schema.json`
- **L2 Events**: `GraphUpdateEvent`.
- **PSG Path**: `psg.extensions`.

## 6. Interaction Model

1.  **Load**: Runtime loads Extension manifest.
2.  **Register**: Extension is registered in the PSG (Status: `registered`).
3.  **Activate**: Extension is enabled for the Context (Status: `active`).
4.  **Execute**: Extension hooks into defined lifecycle events or provides tools.

## 7. Versioning & Invariants

- **Invariant**: `version` **MUST** follow Semantic Versioning 2.0.0.
- **Invariant**: `extension_id` **MUST** be unique within the Context.

## 8. Security / Safety Considerations

- **Sandboxing**: Extensions **SHOULD** run in a sandboxed environment if they execute untrusted code.
- **Review**: Extensions affecting `policy` or `validation` **SHOULD** undergo security review.

## 9. References

- [Context Module](context-module.md)
- [L4: Integration Infrastructure](../01-architecture/l4-integration-infra.md)
