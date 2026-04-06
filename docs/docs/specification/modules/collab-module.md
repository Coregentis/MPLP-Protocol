---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-COLLAB-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-collab.schema.json"
    - "schemas/v2/invariants/map-invariants.yaml"
    - "schemas/v2/profiles/map-profile.yaml"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: Collab Module
sidebar_label: Collab Module
sidebar_position: 8
description: "Schema-centered specification page for the MPLP Collab module."
---

# Collab Module

## Scope

This page documents the normative schema surface of the **Collab module** as
defined in `schemas/v2/mplp-collab.schema.json`.

It covers collaboration-session object shape, participant shape, the `mode`
enum, and the related MAP-profile invariant context. It does not define turn
control, consensus doctrine, or conflict-resolution policy.

## Non-Goals

This page does not define:

- turn-token models
- orchestrator-only requirements
- exclusive-write rules
- conflict-resolution strategies
- SDK reference implementations

## 1. Purpose

The Collab module records a collaboration session artifact used by the MAP
profile.

At minimum, a Collab object carries:

- protocol metadata
- a unique `collab_id`
- a `context_id`
- a human-readable `title`
- a `purpose`
- a `mode`
- a `status`
- one or more `participants`
- `created_at`

## 2. Canonical Schema

**Truth source**: `schemas/v2/mplp-collab.schema.json`

### Required Fields

| Field | Type | Notes |
|:---|:---|:---|
| `meta` | object | Uses `common/metadata.schema.json` |
| `collab_id` | identifier | Canonical session identifier |
| `context_id` | identifier | Parent Context identifier |
| `title` | string | Session label |
| `purpose` | string | Session purpose |
| `mode` | enum | Collaboration mode |
| `status` | enum | Session lifecycle field |
| `participants` | array | Must contain at least one participant |
| `created_at` | date-time | Creation timestamp |

### Optional Fields

| Field | Type |
|:---|:---|
| `governance` | object |
| `updated_at` | date-time |
| `trace` | object |
| `events` | array |

### `collab_participant_core`

Each participant requires:

- `participant_id`
- `kind`

Optional participant fields:

- `role_id`
- `display_name`

### `mode` Enum

`mode` is constrained to:

- `broadcast`
- `round_robin`
- `orchestrated`
- `swarm`
- `pair`

### `status` Enum

`status` is constrained to:

- `draft`
- `active`
- `suspended`
- `completed`
- `cancelled`

### Participant `kind` Enum

`kind` is constrained to:

- `agent`
- `human`
- `system`
- `external`

## 3. MAP Profile Context

The frozen MAP sources relevant to Collab are:

- `schemas/v2/profiles/map-profile.yaml`
- `schemas/v2/invariants/map-invariants.yaml`

Relevant MAP-profile checks are:

- `map_session_requires_participants`
- `map_collab_mode_valid`
- `map_session_id_is_uuid`
- `map_participants_have_role_ids`
- `map_role_ids_non_empty`
- `map_participant_ids_are_non_empty`
- `map_participant_kind_valid`

The MAP invariant file also includes two higher-level event-consistency checks:

- `map_turn_completion_matches_dispatch`
- `map_broadcast_has_receivers`

Those are profile-level checks over trace/event evidence. They are not new
session fields created by this page.

## 4. Boundary Notes

- This page does not define a required orchestrator role.
- This page does not define mandatory turn ordering or exclusive-write doctrine.
- This page does not define committee, hierarchy, or voting semantics.
- This page does not define a universal conflict-resolution model.
- Use the frozen MAP profile manifest and invariant file for profile-level
  meaning before reading runtime-oriented collaboration guidance.

## 5. References

- `schemas/v2/mplp-collab.schema.json`
- `schemas/v2/profiles/map-profile.yaml`
- `schemas/v2/invariants/map-invariants.yaml`
- [MAP Profile](/docs/specification/profiles/map-profile.md)
- [Role Module](/docs/specification/modules/role-module.md)

---

**Final Boundary**: this page specifies the Collab object shape, participant
shape, enum values, and the related MAP-profile invariant context. It does not
define new collaboration doctrine beyond frozen sources.
