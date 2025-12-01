---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# Versioning Policy

**Status**: Active
**Version**: 1.0.0

## 0. Protocol Naming Invariant (v1.0)

The protocol defined by this specification is named **“Multi-Agent Lifecycle Protocol”**, abbreviated as **“MPLP”**.

Any proposal (MIP) that intends to change the protocol name or introduce alternative official names MUST be treated as a **major, breaking governance change**, and therefore requires a new major protocol version (e.g., v2.0.0).

Documentation, SDKs, and integration guides MUST NOT introduce new “creative expansions” of the MPLP acronym in normative text.

## 1. Semantic Versioning

MPLP follows [Semantic Versioning 2.0.0](https://semver.org/).

`MAJOR.MINOR.PATCH`

-   **MAJOR**: Incompatible API/Schema changes.
-   **MINOR**: Backwards-compatible functionality additions.
-   **PATCH**: Backwards-compatible bug fixes.

## 2. Protocol vs. Implementation

-   **Protocol Version**: Applies to L1 Schemas and L2 Behavioral Contracts.
-   **Implementation Version**: Applies to SDKs and Runtime packages.

SDKs and Runtimes MAY have different version numbers but MUST declare their supported Protocol Version.

## 3. Breaking Changes

A change is **breaking** (requires MAJOR bump) if:
-   An existing L1 Schema field is removed or renamed.
-   A required L1 Schema field is added.
-   An existing L1 Schema validation rule is tightened (making previously valid data invalid).
-   L2 Module behavioral invariants are changed in a way that breaks existing flows.

A change is **non-breaking** (requires MINOR bump) if:
-   A new optional field is added to an L1 Schema.
-   A new L2 Module is added.
-   A new Event Family is added.
-   Validation rules are relaxed.

## 4. Long-Term Support (LTS)

MPLP v1.0 is an LTS release. We commit to maintaining backward compatibility for the v1.x line for at least 1 year.

