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

# Cross-Cutting Concern: Protocol Version

## 1. Scope

This document defines the **Protocol Version** cross-cutting concern, which governs how MPLP versions are defined, declared, and negotiated.

**Boundaries**:
- **In Scope**: Semantic Versioning, Compatibility rules, Migration paths.
- **Out of Scope**: Runtime software versioning (e.g., TracePilot v2.0).

## 2. Normative Definitions

- **Protocol Version**: The version of the MPLP specification (e.g., `1.0.0`).
- **Compatible**: A runtime is compatible with a protocol version if it implements all REQUIRED features.
- **Breaking Change**: A change that renders existing valid PSGs or Plans invalid.

## 3. Responsibilities (MUST/SHALL)

1.  **Declaration**: All PSGs **MUST** declare the `mplp_version` they conform to.
2.  **Negotiation**: Runtimes **MUST** verify they support the declared version of a project before loading it.
3.  **Immutability**: Once a version is Frozen, it **MUST NOT** change.

## 4. Architecture Structure

Protocol Versioning is implemented via:
- **L1 Schemas**: `mplp-context.schema.json` includes `mplp_version` field.
- **L3 Runtime**: Checks version compatibility at startup.

## 5. Binding Points

- **Schema**: `mplp-context.schema.json` (Root version field).
- **Events**: `ImportProcessEvent` (declares runtime support).
- **PSG**: `psg.project_root.mplp_version`.

## 6. Interaction Model

### Version Check Flow
1.  User attempts to load Project X.
2.  Runtime reads `project.json` (Context).
3.  Runtime checks `mplp_version`.
4.  If `mplp_version > runtime_supported_version`: Error (Upgrade Runtime).
5.  If `mplp_version < runtime_supported_version`: Warning (Migration available?).
6.  If `mplp_version == runtime_supported_version`: Success.

## 7. Versioning & Invariants

- **SemVer**: MPLP uses Semantic Versioning 2.0.0.
- **Invariant**: A runtime must refuse to execute a project with an unsupported Major version.

## 8. Security / Safety Considerations

- **Downgrade Attacks**: Runtimes **SHOULD** prevent accidental downgrades of project version, which could cause data loss.

## 9. References

- [Versioning Policy](../../12-governance/versioning-policy.md)
- [L1: Core Protocol](../l1-core-protocol.md)
