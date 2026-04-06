---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-EXTENSION-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-extension.schema.json"
external_standards:
  w3c_trace_context: none
  opentelemetry: none
title: Extension Module
sidebar_label: Extension Module
sidebar_position: 9
description: "Schema-centered specification page for the MPLP Extension module."
---

# Extension Module

## Scope

This page documents the normative schema surface of the **Extension module** as
defined in `schemas/v2/mplp-extension.schema.json`.

It covers the protocol object used to describe an extension registration. It
does not define a full plugin runtime, tool execution engine, or product-side
extension marketplace.

## Non-Goals

This page does not define:

- runtime plugin loading mechanics
- executable tool adapters
- capability injection algorithms
- policy engine implementation

## 1. Purpose

The Extension module provides a protocol object for describing an extension in a
Context-bound runtime or product environment.

At the schema level, the object identifies:

- which Context the extension belongs to
- the extension name
- the extension classification
- the declared version
- the extension lifecycle status

## 2. Canonical Schema

**Truth source**: `schemas/v2/mplp-extension.schema.json`

### Required Fields

| Field | Type |
|:---|:---|
| `meta` | object |
| `extension_id` | identifier |
| `context_id` | identifier |
| `name` | string |
| `extension_type` | enum |
| `version` | string |
| `status` | enum |

### Optional Fields

| Field | Type |
|:---|:---|
| `config` | object |
| `trace` | object |
| `events` | array |
| `governance` | object |

### `extension_type` Enum

`extension_type` is constrained to:

- `capability`
- `policy`
- `integration`
- `transformation`
- `validation`
- `other`

### `status` Enum

`status` is constrained to:

- `registered`
- `active`
- `inactive`
- `deprecated`

## 3. Interpretation Boundary

The Extension module describes an extension **record**.

This page does **not** claim that the protocol itself defines:

- how extensions are executed
- how tools are sandboxed
- how policy checks are enforced
- how integrations are authenticated

Those belong to runtime or product implementation layers.

## 4. Cross-Object Relation

Extension objects bind to a Context through `context_id`.

Optional `trace`, `events`, and `governance` fields allow the object to be
placed in broader runtime/governance workflows, but this page does not define a
mandatory runtime lifecycle for those workflows.

## 5. References

- `schemas/v2/mplp-extension.schema.json`
- `schemas/v2/common/metadata.schema.json`

---

**Final Boundary**: this page defines the Extension object shape and declared
classification. It does not define a full extension runtime or plugin execution
model.
