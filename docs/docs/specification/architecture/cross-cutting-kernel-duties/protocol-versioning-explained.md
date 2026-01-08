---
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-ARCH-CCK-VERS-INFO-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: "Protocol Versioning — Conceptual Overview"
sidebar_label: "Protocol Versioning Explained"
sidebar_position: 16
description: "MPLP architecture documentation: Protocol Versioning — Conceptual Overview. Defines structural requirements and layer responsibilities."
authority: protocol
---


# Protocol Versioning — Conceptual Overview

> **Audience**: Implementers, Architects
> **Governance Rule**: DGP-30

## 1. What Protocol Versioning Refers To

**Protocol Versioning** in MPLP refers to the **compatibility dimension** that concerns how protocol versions evolve and how implementations declare version support.

Protocol Versioning is **not a migration tool**. It is a **conceptual area** for version semantics.

## 2. Conceptual Areas Covered by Protocol Versioning

| Conceptual Area | Description |
|:---|:---|
| **Metadata Version** | Relates to `protocol_version` field in all objects |
| **Schema Versioning** | Concerns `$id` URIs and schema evolution |
| **Freeze Status** | Is involved in immutability guarantees |
| **Backward Compatibility** | Relates to breaking vs. non-breaking changes |

## 3. What Protocol Versioning Does NOT Do

- ❌ Define migration scripts
- ❌ Mandate upgrade paths
- ❌ Prescribe version negotiation protocols

## 4. Where Normative Semantics Are Defined

| Normative Source | What It Covers |
|:---|:---|
| **Metadata Schema** (`metadata.schema.json`) | `protocol_version`, `schema_version` |
| **Schema Conventions** | Version compatibility rules |
| **x-mplp-meta** | Machine-readable freeze status |

## 5. MPLP v1.0 Version Status

- **Protocol Version**: 1.0.0
- **Freeze Date**: 2025-12-03
- **Status**: FROZEN (no breaking changes)

---

**Governance Rule**: DGP-30
**See Also**: [Protocol Versioning Anchor](protocol-versioning.md) (Normative)
