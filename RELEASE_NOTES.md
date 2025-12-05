# MPLP SDK v1.0.3 / v1.0.0 Release Notes

## 🔒 Protocol Frozen Declaration

This release adheres to **MPLP Protocol v1.0.0 – Frozen Specification**.

- Protocol Schemas: `schemas/v2` (frozen, governed by MPGC)
- TypeScript SDK: `@mplp/sdk-ts@1.0.3` – L3 Runtime Reference Implementation
- Python SDK: `mplp==1.0.0` – L3 Runtime Reference Implementation

Any normative change to the protocol requires a new protocol version and MUST NOT be published under the v1.0.x line.

## Release Highlights

- **Unified Governance**: Applied standard copyright headers, frozen status markers, and schema version metadata across all 12 NPM packages and the Python SDK.
- **Protocol Alignment**: Synchronized all schemas and invariants with the MPLP v1.0.0 Frozen Specification.
- **Packaging Hardening**: Cleaned up distribution artifacts, enforcing strict whitelists for NPM (`files`) and PyPI (`MANIFEST.in`).
- **Cross-Language Parity**: Verified core runtime flows (Single Agent) across TypeScript and Python implementations.
