---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-PROF-MAP-001"
sidebar_position: 1

# UI metadata (non-normative; excluded from protocol semantics)
title: MAP Profile
sidebar_label: MAP Profile
description: "Schema-anchored specification page for the frozen MPLP MAP profile baseline."
---

# Multi-Agent (MAP) Profile

## Scope

This page documents the frozen **MAP profile baseline** as declared in:

- `schemas/v2/profiles/map-profile.yaml`
- `schemas/v2/invariants/map-invariants.yaml`
- `schemas/v2/events/mplp-map-event.schema.json`
- `schemas/v2/mplp-collab.schema.json`

It records the profile-level baseline carried by those sources. It does not add
turn doctrine, governance models, or collaboration strategy semantics beyond
them.

## Non-Goals

This page does not define:

- turn-token systems
- conflict-resolution doctrine
- deterministic vs non-deterministic runtime behavior
- orchestrator models
- example workflow patterns
- SDK implementations

## 1. Purpose

The MAP profile is the frozen multi-agent profile baseline named by
`mplp:profile:map:1.0.0`.

The manifest defines MAP as an extension of SA with additional modules and
profile-linked event/invariant anchors.

## 2. Frozen Profile Baseline

### 2.1 Manifest Identity

From `schemas/v2/profiles/map-profile.yaml`:

| Field | Frozen Value |
|:---|:---|
| `profile_id` | `mplp:profile:map:1.0.0` |
| `extends` | `mplp:profile:sa:1.0.0` |
| `title` | `MPLP Multi-Agent Profile v1.0` |
| `description` | `Collaboration profile extending SA for multi-agent workflows` |

### 2.2 Additional Modules

The frozen manifest lists these modules beyond SA:

| Module | Source |
|:---|:---|
| Collab | `schemas/v2/mplp-collab.schema.json` |
| Dialog | `schemas/v2/mplp-dialog.schema.json` |
| Network | `schemas/v2/mplp-network.schema.json` |

### 2.3 Coordination Modes

The frozen profile sources tie MAP coordination modes to the `Collab.mode` enum:

- `broadcast`
- `round_robin`
- `orchestrated`
- `swarm`
- `pair`

This page does not expand those enum values into workflow doctrine beyond their
presence in the frozen sources.

### 2.4 Invariant Anchor

The frozen invariant source for this profile is:

- `schemas/v2/invariants/map-invariants.yaml`

The manifest records `count: 9` and summarizes these checks:

- `map_session_requires_participants`
- `map_collab_mode_valid`
- `map_session_id_is_uuid`
- `map_participants_have_role_ids`
- `map_turn_completion_matches_dispatch`
- `map_broadcast_has_receivers`
- `map_role_ids_non_empty`
- `map_participant_ids_are_non_empty`
- `map_participant_kind_valid`

### 2.5 Profile-Linked Event Anchor

The frozen event source for this profile is:

- `schemas/v2/events/mplp-map-event.schema.json`

The manifest lists:

- mandatory: `MAPSessionStarted`, `MAPRolesAssigned`, `MAPTurnDispatched`,
  `MAPTurnCompleted`, `MAPSessionCompleted`
- recommended: `MAPBroadcastSent`, `MAPBroadcastReceived`,
  `MAPConflictDetected`, `MAPConflictResolved`

## 3. Relationship to SA

The frozen manifest states that MAP extends SA.

This page does not add further doctrine such as mandatory committee models,
required consensus, or one required control pattern.

## 4. What This Page Does Not Create

This page does not create any of the following as new protocol requirements:

- participant minimums beyond `map_session_requires_participants`
- orchestrator-required rules
- turn-taking algorithms
- conflict-resolution strategies
- hierarchy, voting, or escalation models
- state machines beyond the linked schemas and manifests

If a specific collaboration rule is not present in the frozen manifest,
invariant file, or linked schema, this page should not be read as creating it.

## 5. Canonical Reading Path

Read MAP in this order:

1. `schemas/v2/profiles/map-profile.yaml`
2. [Collab Module](/docs/specification/modules/collab-module.md)
3. `schemas/v2/invariants/map-invariants.yaml`
4. [MAP Events](./map-events.md)
5. [Multi-Agent Governance](./multi-agent-governance-profile.md) for the
   remaining protocol-layer boundary note only

## 6. References

- `schemas/v2/profiles/map-profile.yaml`
- `schemas/v2/invariants/map-invariants.yaml`
- `schemas/v2/events/mplp-map-event.schema.json`
- `schemas/v2/mplp-collab.schema.json`
- [SA Profile](./sa-profile.md)
- [Collab Module](/docs/specification/modules/collab-module.md)

---

**Final Boundary**: this page identifies the frozen MAP profile baseline and
its actual source files only. It does not add new collaboration doctrine beyond
those sources.
