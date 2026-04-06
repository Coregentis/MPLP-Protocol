---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-PROF-MA-GOV-001"
sidebar_position: 4

# UI metadata (non-normative; excluded from protocol semantics)
title: Multi-Agent Governance Profile
sidebar_label: Multi-Agent Governance
description: "Boundary page for MAP-adjacent governance meaning grounded in frozen MPLP profile, schema, and event sources."
---

# Multi-Agent Governance Profile

## Scope

This page documents the **protocol-layer governance boundary** relevant to
multi-agent profile surfaces.

It is limited to the frozen sources that actually carry MAP-adjacent governance
meaning:

- `schemas/v2/profiles/map-profile.yaml`
- `schemas/v2/invariants/map-invariants.yaml`
- `schemas/v2/events/mplp-map-event.schema.json`
- `schemas/v2/mplp-collab.schema.json`
- the schema-backed [Confirm Module](/docs/specification/modules/confirm-module.md)
- the schema-backed [Role Module](/docs/specification/modules/role-module.md)

## Non-Goals

This page does not define:

- centralized, federated, hierarchical, or autonomous governance models
- policy engines
- human-gate trigger doctrine
- conflict-resolution strategies
- role-ranking systems
- runtime enforcement algorithms

## 1. Purpose

This page exists to prevent over-reading governance meaning into MAP-related
docs surfaces.

At the frozen protocol layer, MAP-adjacent governance meaning is limited to the
fields, event types, and invariant checks carried by the sources listed above.

## 2. Frozen Governance-Relevant Anchors

### 2.1 Collab and Participant Structure

From the frozen Collab schema and MAP invariant file:

- `Collab.mode` is constrained by the schema enum
- `participants` are part of the session structure
- participant `kind` is constrained by the schema enum
- participant `role_id` is part of the frozen profile/invariant surface

### 2.2 MAP Event Surface

From `schemas/v2/events/mplp-map-event.schema.json` and the MAP profile
manifest:

- session-start/session-complete events exist
- role-assignment events exist
- turn-dispatch/turn-complete events exist
- broadcast and conflict events exist as profile-linked event types

This page does not expand those event names into a larger governance doctrine.

### 2.3 Confirm and Role as Separate Protocol Objects

The frozen protocol baseline already has separate objects for:

- Confirm
- Role

Implementations may use those objects together with MAP-related artifacts, but
this page does not create a new standalone governance profile object or policy
schema by combining them.

## 3. Important Boundary

There is **no standalone frozen schema or profile manifest** under `schemas/v2/`
named "multi-agent-governance-profile".

Accordingly, this page must not be read as introducing:

- a new independent profile family
- a new schema contract
- a new policy language
- a new set of governance models

Its role is boundary control only: it points back to the actual frozen MAP,
Collab, Confirm, and Role sources.

## 4. Canonical Reading Path

Read multi-agent governance meaning in this order:

1. [MAP Profile](./map-profile.md)
2. [Collab Module](/docs/specification/modules/collab-module.md)
3. [Role Module](/docs/specification/modules/role-module.md)
4. [Confirm Module](/docs/specification/modules/confirm-module.md)
5. `schemas/v2/invariants/map-invariants.yaml`
6. [MAP Events](./map-events.md)

## 5. References

- `schemas/v2/profiles/map-profile.yaml`
- `schemas/v2/invariants/map-invariants.yaml`
- `schemas/v2/events/mplp-map-event.schema.json`
- `schemas/v2/mplp-collab.schema.json`
- [MAP Profile](./map-profile.md)
- [Role Module](/docs/specification/modules/role-module.md)
- [Confirm Module](/docs/specification/modules/confirm-module.md)

---

**Final Boundary**: this page does not define an independent governance-profile
doctrine. It only marks the limits of governance meaning already present in
frozen MAP-adjacent protocol artifacts.
