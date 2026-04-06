---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-ARCH-L2-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-context.schema.json"
    - "schemas/v2/mplp-plan.schema.json"
    - "schemas/v2/mplp-trace.schema.json"
    - "schemas/v2/mplp-role.schema.json"
    - "schemas/v2/mplp-collab.schema.json"
    - "schemas/v2/mplp-dialog.schema.json"
    - "schemas/v2/mplp-network.schema.json"
    - "schemas/v2/profiles/sa-profile.yaml"
    - "schemas/v2/profiles/map-profile.yaml"
    - "schemas/v2/invariants/sa-invariants.yaml"
    - "schemas/v2/invariants/map-invariants.yaml"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: L2 Coordination & Governance
sidebar_label: L2 Coordination & Governance
sidebar_position: 2
description: "Schema-anchored boundary page for the MPLP L2 coordination and profile layer."
---

# L2 Coordination & Governance

## Scope

This page documents the L2 coordination/profile layer as it is grounded in the
frozen MPLP protocol baseline:

- L2 module schemas under `schemas/v2/mplp-*.schema.json`
- SA and MAP profile manifests under `schemas/v2/profiles/`
- SA and MAP invariant sets under `schemas/v2/invariants/`

It describes where L2 meaning comes from. It does not introduce additional
transition tables, governance models, or runtime algorithms.

## Non-Goals

This page does not define:

- physical storage or execution engines
- PSG, VSL, AEL, or other runtime-side abstractions
- additional state machines beyond schema/profile/invariant sources
- orchestrator, committee, hierarchy, or consensus models
- derived approval workflows or reference-runtime behavior

## 1. Purpose

L2 is the protocol layer where MPLP's object families are coordinated into
profile-level constraints.

At this layer:

- module object families are read through their schema-backed specification
  pages
- profile baselines are read through `sa-profile.yaml` and `map-profile.yaml`
- profile constraints are read through `sa-invariants.yaml` and
  `map-invariants.yaml`

This page is a boundary statement over those sources. It is not a replacement
for them.

## 2. Frozen L2 Anchors

### 2.1 Module Families

L2 coordination meaning is anchored in the schema-backed module pages linked
from [Modules Overview](/docs/specification/modules):

- Context
- Plan
- Confirm
- Trace
- Role
- Dialog
- Collab
- Extension
- Core
- Network

### 2.2 Profile Baselines

The frozen profile manifests establish the base L2 profile split:

| Profile | Frozen Source | Baseline |
|:---|:---|:---|
| SA | `schemas/v2/profiles/sa-profile.yaml` | Base single-agent profile |
| MAP | `schemas/v2/profiles/map-profile.yaml` | Multi-agent profile extending SA |

`sa-profile.yaml` lists Context, Plan, Trace, Role, and Core as required
modules for the base profile.

`map-profile.yaml` extends SA and adds Collab, Dialog, and Network.

### 2.3 Invariant Families

The frozen invariant sets establish the L2 constraint layer:

| File | Constraint Family |
|:---|:---|
| `schemas/v2/invariants/sa-invariants.yaml` | SA context/plan/trace binding and presence checks |
| `schemas/v2/invariants/map-invariants.yaml` | MAP collab/session structure and participant checks |

This page does not add new invariant IDs or derived invariant meanings beyond
those files.

## 3. What L2 Formally Supports

The frozen sources support these L2-level statements:

- protocol object families may bind to one another through fields such as
  `context_id`, `plan_id`, and profile-linked references
- SA defines the minimal execution profile baseline
- MAP defines the multi-agent profile baseline extending SA
- `Collab.mode` is constrained to the enum declared in
  `schemas/v2/mplp-collab.schema.json`
- SA and MAP constraints are carried by the invariant files named above

## 4. What This Page Does Not Create

This page does not create any of the following as protocol requirements:

- new module transition tables
- new terminal-state doctrine
- new participant minimums beyond
  `map_session_requires_participants`
- new role UUID rules beyond the frozen invariant files
- orchestrator-required rules
- exclusive-write rules
- conflict-resolution models
- approval-routing doctrine
- reference-runtime execution sequences

If a more specific claim is not present in the frozen module schemas, profile
manifests, or invariant files, this page should not be read as creating it.

## 5. Canonical Reading Path

Read L2 through the linked formal surfaces in this order:

1. [Modules Overview](/docs/specification/modules)
2. [SA Profile](/docs/specification/profiles/sa-profile.md)
3. [MAP Profile](/docs/specification/profiles/map-profile.md)
4. The frozen invariant files referenced above

Use runtime guides only after the L2 baseline is clear.

## 6. References

- `schemas/v2/profiles/sa-profile.yaml`
- `schemas/v2/profiles/map-profile.yaml`
- `schemas/v2/invariants/sa-invariants.yaml`
- `schemas/v2/invariants/map-invariants.yaml`
- [Modules Overview](/docs/specification/modules)
- [Profiles Overview](/docs/specification/profiles)

---

**Final Boundary**: L2 carries object-family coordination and profile-level
constraints only as expressed in the frozen schemas, profile manifests, and
invariant files. It does not define new runtime mechanics or derived governance
doctrine.
