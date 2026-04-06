---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-NETWORK-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-network.schema.json"
    - "schemas/v2/profiles/map-profile.yaml"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: Network Module
sidebar_label: Network Module
sidebar_position: 10
description: "Schema-centered specification page for the MPLP Network module."
---

# Network Module

## Scope

This page documents the normative schema surface of the **Network module** as
defined in `schemas/v2/mplp-network.schema.json`.

It covers the network record shape, node shape, and the enum values declared by
the frozen schema. It does not define routing algorithms, deployment doctrine,
or runtime infrastructure policy.

## Non-Goals

This page does not define:

- routing algorithms
- hub authority semantics
- transport guarantees
- deployment topologies as product recommendations
- SDK reference implementations

## 1. Purpose

The Network module records a network/topology artifact associated with a
Context.

At minimum, a Network object carries:

- protocol metadata
- a unique `network_id`
- a `context_id`
- a `name`
- a `topology_type`
- a lifecycle `status`

## 2. Canonical Schema

**Truth source**: `schemas/v2/mplp-network.schema.json`

### Required Fields

| Field | Type | Notes |
|:---|:---|:---|
| `meta` | object | Uses `common/metadata.schema.json` |
| `network_id` | identifier | Canonical network identifier |
| `context_id` | identifier | Parent Context identifier |
| `name` | string | Network label |
| `topology_type` | enum | Network topology field |
| `status` | enum | Network lifecycle field |

### Optional Fields

| Field | Type |
|:---|:---|
| `governance` | object |
| `description` | string |
| `nodes` | array |
| `trace` | object |
| `events` | array |

### `network_node_core`

Each node requires:

- `node_id`
- `kind`
- `status`

Optional node fields:

- `name`
- `role_id`

### `topology_type` Enum

`topology_type` is constrained to:

- `single_node`
- `hub_spoke`
- `mesh`
- `hierarchical`
- `hybrid`
- `other`

### Network `status` Enum

`status` is constrained to:

- `draft`
- `provisioning`
- `active`
- `degraded`
- `maintenance`
- `retired`

### Node `kind` Enum

`kind` is constrained to:

- `agent`
- `service`
- `database`
- `queue`
- `external`
- `other`

### Node `status` Enum

Node `status` is constrained to:

- `active`
- `inactive`
- `degraded`
- `unreachable`
- `retired`

## 3. MAP Profile Context

`schemas/v2/profiles/map-profile.yaml` lists Network as an additional module in
the MAP profile.

This page does not expand that profile relationship into routing policy,
orchestration doctrine, or deployment guidance.

## 4. Boundary Notes

- This page does not define what each topology means operationally beyond the
  enum membership declared in the schema.
- This page does not define a required node graph, routing strategy, or network
  control plane.
- This page does not define node health algorithms or failover behavior.
- `role_id`, when present on a node, remains a field-level link only; this page
  does not define a broader runtime resolution model for it.

## 5. References

- `schemas/v2/mplp-network.schema.json`
- `schemas/v2/profiles/map-profile.yaml`
- [Collab Module](/docs/specification/modules/collab-module.md)
- [MAP Profile](/docs/specification/profiles/map-profile.md)

---

**Final Boundary**: this page specifies the Network object and node-record
shape. It does not define new infrastructure, routing, or deployment doctrine.
