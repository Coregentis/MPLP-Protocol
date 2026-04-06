---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-DIALOG-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-dialog.schema.json"
external_standards:
  w3c_trace_context: none
  opentelemetry: none
title: Dialog Module
sidebar_label: Dialog Module
sidebar_position: 7
description: "Schema-centered specification page for the MPLP Dialog module."
---

# Dialog Module

## Scope

This page documents the normative schema surface of the **Dialog module** as
defined in `schemas/v2/mplp-dialog.schema.json`.

It covers object shape and message structure. It does not define provider API
adapters or external chat protocol conversion rules.

## Non-Goals

This page does not define:

- OpenAI API compatibility guarantees
- Anthropic API compatibility guarantees
- prompt-engineering policy
- model-provider adapter code

## 1. Purpose

The Dialog module provides a protocol object for recording structured message
exchange tied to a Context.

At minimum, a Dialog object carries:

- protocol metadata
- a `dialog_id`
- a bound `context_id`
- a lifecycle `status`
- a `messages` array

## 2. Canonical Schema

**Truth source**: `schemas/v2/mplp-dialog.schema.json`

### Required Fields

| Field | Type |
|:---|:---|
| `meta` | object |
| `dialog_id` | identifier |
| `context_id` | identifier |
| `status` | enum |
| `messages` | array |

### Optional Fields

| Field | Type |
|:---|:---|
| `thread_id` | identifier |
| `started_at` | date-time |
| `ended_at` | date-time |
| `trace` | object |
| `events` | array |
| `governance` | object |

### `status` Enum

`status` is constrained to:

- `active`
- `paused`
- `completed`
- `cancelled`

## 3. Message Object

Each `messages[]` entry uses the schema-defined dialog message object.

Required fields:

- `role`
- `content`
- `timestamp`

Optional field:

- `event`

`role` is constrained to:

- `user`
- `assistant`
- `system`
- `agent`

## 4. External Format Boundary

The schema description notes that the dialog message structure is a **minimal
protocol format aligned with external ecosystems**.

This page does **not** upgrade that note into:

- a guaranteed OpenAI wire-format contract
- a guaranteed Anthropic wire-format contract
- a universal conversion specification

Provider-specific adaptation belongs to runtime or product code, not to this
schema page.

## 5. Cross-Object Relation

Dialog binds to other protocol surfaces through:

- `context_id`
- optional `thread_id`
- optional `trace`
- optional `event` references inside message entries

This page does not define agent-to-agent orchestration policy or transport.

## 6. References

- `schemas/v2/mplp-dialog.schema.json`
- `schemas/v2/common/metadata.schema.json`
- `schemas/v2/common/events.schema.json`

---

**Final Boundary**: this page defines the Dialog object and message structure.
It does not define provider adapter behavior or external API conversion.
