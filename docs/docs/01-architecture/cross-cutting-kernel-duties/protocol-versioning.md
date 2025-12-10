---
title: Protocol Versioning
description: Kernel duty for handling schema evolution and compatibility.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Protocol Versioning, schema evolution, compatibility, version control]
sidebar_label: Protocol Versioning
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Protocol Versioning

> [!NOTE]
> **Duty Type**: OS-Level Kernel Duty  
> **SOT Reference**: README v1.0.0 Section 8

## Intent
To ensure long-term stability and interoperability by strictly managing protocol versions, schema changes, and backward compatibility.

## Lifecycle Coverage
*   **Initialization**: Handshaking protocol versions.
*   **Execution**: Validating messages against schemas.

## Agent Scope (SA / MAP)
*   **All**: Agents must declare which MPLP version they speak.

## Required Events
*   `VersionNegotiated`
*   `SchemaValidationFailed`
*   `DeprecationWarning`

## Compliance Requirements
1.  Runtime MUST reject messages with incompatible protocol versions.
2.  Runtime MUST validate all PSG nodes against the active schema version.
3.  Breaking changes MUST require a major version bump (e.g., v1.0 -> v2.0).

## Implementation Details (Non-Normative)

Protocol Versioning is enforced via **Schema Metadata** and **Runtime Validation**.

### Schema Metadata
Every JSON Schema in MPLP includes a standard `meta` field (`common/metadata.schema.json`) and a custom `x-mplp-meta` extension:
- **`protocolVersion`**: Declares the version of the protocol this schema belongs to (e.g., `1.0.0`).
- **`frozen`**: Indicates if the schema is immutable.

### Runtime Handshake
When an Agent connects to a Runtime, or when a Runtime loads a PSG, it must validate that the `protocolVersion` in the data matches its supported version range. Mismatches trigger a `SchemaValidationFailed` event.

## Schema Reference

| Schema | Purpose | Key Fields |
|:---|:---|:---|
| `common/metadata.schema.json` | Version declaration | `protocolVersion` |
| All Schemas | Frozen status | `x-mplp-meta` |

## Examples
*   **Handshake**: An agent connects to the runtime and negotiates `mplp-v1.0`.
*   **Migration**: Runtime automatically upgrades a v1.0 Plan to v1.1 format (if compatible).

