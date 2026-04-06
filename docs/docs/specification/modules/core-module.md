---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-CORE-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-core.schema.json"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: Core Module
sidebar_label: Core Module
sidebar_position: 1
description: "Schema-centered specification page for the MPLP Core module."
---

# Core Module

## Scope

This page documents the normative schema surface of the **Core module** as
defined in `schemas/v2/mplp-core.schema.json`.

It covers the protocol-manifest record carried by Core. It does not define
runtime governance workflow, upgrade policy, or module-loading behavior.

## Non-Goals

This page does not define:

- a runtime module registry implementation
- enable/disable policy
- upgrade sequencing
- governance committee process
- package initialization behavior

## 1. Purpose

The Core module records the protocol-manifest anchor for a given instance.

At minimum, a Core object carries:

- protocol metadata
- a unique `core_id`
- a `protocol_version`
- a lifecycle `status`
- one or more module descriptors in `modules`

## 2. Canonical Schema

**Truth source**: `schemas/v2/mplp-core.schema.json`

### Required Fields

| Field | Type | Notes |
|:---|:---|:---|
| `meta` | object | Uses `common/metadata.schema.json` |
| `core_id` | identifier | Canonical Core identifier |
| `protocol_version` | string | Protocol version string |
| `status` | enum | Core lifecycle field |
| `modules` | array | Must contain at least one module descriptor |

### Optional Fields

| Field | Type |
|:---|:---|
| `governance` | object |
| `trace` | object |
| `events` | array |

### Core `status` Enum

`status` is constrained to:

- `draft`
- `active`
- `deprecated`
- `archived`

### `core_module_descriptor`

Each module descriptor requires:

- `module_id`
- `version`
- `status`

Optional descriptor fields:

- `required`
- `description`

`module_id` is constrained to:

- `context`
- `plan`
- `confirm`
- `trace`
- `role`
- `extension`
- `dialog`
- `collab`
- `core`
- `network`

Descriptor `status` is constrained to:

- `enabled`
- `disabled`
- `experimental`
- `deprecated`

## 3. Boundary Notes

- This page does not define which module combinations a product or runtime must
  choose beyond the schema shape and any separate profile manifest.
- This page does not define automatic module discovery or loading behavior.
- This page does not define upgrade choreography or release policy.
- Use profile manifests for required-profile module sets before inferring
  requirements from a local Core record.

## 4. References

- `schemas/v2/mplp-core.schema.json`
- `schemas/v2/profiles/sa-profile.yaml`
- `schemas/v2/profiles/map-profile.yaml`
- [L1 Core Protocol](/docs/specification/architecture/l1-core-protocol.md)

---

**Final Boundary**: this page specifies the Core object shape as a
protocol-manifest anchor. It does not define a runtime governance or module
loading doctrine.
