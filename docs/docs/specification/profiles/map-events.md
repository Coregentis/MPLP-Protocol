---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-PROF-MAP-EVENTS-001"
sidebar_position: 3

# UI metadata (non-normative; excluded from protocol semantics)
title: MAP Events
sidebar_label: MAP Events
description: "Schema-anchored specification page for the frozen MAP profile event surface."
---

# MAP Events Specification

## Scope

This page documents the frozen **MAP profile-specific event surface** as
declared by:

- `schemas/v2/profiles/map-profile.yaml`
- `schemas/v2/events/mplp-map-event.schema.json`
- `schemas/v2/taxonomy/event-taxonomy.yaml`

It does not define turn-processing doctrine, broadcast semantics, conflict
resolution models, or event-processing logic beyond those sources.

## Non-Goals

This page does not define:

- general event-family behavior for observability
- turn-token systems
- broadcast algorithms
- conflict-resolution semantics
- handler code or validation algorithms

## 1. Purpose

The MAP event surface is the frozen profile-specific event surface for the MAP
baseline.

In the event taxonomy, profile-specific events are tracked separately from the
12 general event families through the `map_profile` profile-event entry pointing
to `mplp-map-event.schema.json`.

## 2. Frozen Event Baseline

### 2.1 Profile Manifest Anchor

From `schemas/v2/profiles/map-profile.yaml`:

- mandatory: `MAPSessionStarted`, `MAPRolesAssigned`, `MAPTurnDispatched`,
  `MAPTurnCompleted`, `MAPSessionCompleted`
- recommended: `MAPBroadcastSent`, `MAPBroadcastReceived`,
  `MAPConflictDetected`, `MAPConflictResolved`

### 2.2 Event Schema Surface

From `schemas/v2/events/mplp-map-event.schema.json`:

#### Required Top-Level Fields

- `event_id`
- `event_type`
- `timestamp`
- `session_id`

#### Optional Top-Level Fields

- `initiator_role`
- `target_roles`
- `payload`

#### `event_type` Enum

The schema enum contains:

- `MAPSessionStarted`
- `MAPRolesAssigned`
- `MAPTurnDispatched`
- `MAPTurnCompleted`
- `MAPBroadcastSent`
- `MAPBroadcastReceived`
- `MAPConflictDetected`
- `MAPConflictResolved`
- `MAPSessionCompleted`

### 2.3 Payload Definitions Present In Schema

The frozen schema includes named payload definitions for:

- `turn_dispatched_payload`
- `turn_completed_payload`
- `broadcast_sent_payload`
- `broadcast_received_payload`

The schema does not define separate named payload objects for every MAP event
type. This page should not be read as creating them.

## 3. What This Page Does Not Create

This page does not create any of the following as new protocol requirements:

- `CommunicationEvent` as a separate event family
- `ConflictEvent` as a separate event family
- `MAPHandoffInitiated` as a MAP event type
- required turn-token semantics
- broadcast-response counting doctrine beyond the frozen invariant source
- conflict-resolution payload doctrine beyond the frozen schema

If a named event type is not present in the frozen MAP profile manifest or the
MAP event schema enum, this page should not be read as creating it.

## 4. Relationship To MAP Invariants

The MAP invariant file includes two higher-level event-consistency checks:

- `map_turn_completion_matches_dispatch`
- `map_broadcast_has_receivers`

Those checks belong to the frozen MAP invariant context. This page does not add
new validation logic beyond naming that relationship.

## 5. Canonical Reading Path

Read MAP events in this order:

1. [MAP Profile](./map-profile.md)
2. `schemas/v2/profiles/map-profile.yaml`
3. `schemas/v2/events/mplp-map-event.schema.json`
4. `schemas/v2/invariants/map-invariants.yaml`
5. [Observability Overview](/docs/specification/observability)

## 6. References

- `schemas/v2/profiles/map-profile.yaml`
- `schemas/v2/events/mplp-map-event.schema.json`
- `schemas/v2/invariants/map-invariants.yaml`
- `schemas/v2/taxonomy/event-taxonomy.yaml`
- [MAP Profile](./map-profile.md)
- [Observability Overview](/docs/specification/observability)

---

**Final Boundary**: this page identifies the frozen MAP profile event surface
only. It does not create new turn, broadcast, conflict, or event-family
doctrine beyond the frozen sources.
