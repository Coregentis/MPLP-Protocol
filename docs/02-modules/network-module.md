---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Network Module

## 1. Scope

This document defines the **Network Module**, which models the topology and node collection of a multi-agent system. It provides the "physical" map of where agents and services reside.

**Boundaries**:
- **In Scope**: Topology Type, Node Registry, Node Status.
- **Out of Scope**: Network transport protocols (HTTP/gRPC), Service Discovery implementation.

## 2. Normative Definitions

- **Network**: The collection of addressable nodes in a Context.
- **Node**: A distinct computational entity (Agent, Service, Database).
- **Topology**: The structural arrangement of nodes (e.g., Mesh, Hub-Spoke).

## 3. Responsibilities (MUST/SHALL)

1.  **Registry**: The Network module **MUST** maintain an up-to-date list of all `nodes`.
2.  **Status**: The module **SHOULD** reflect the current health `status` of nodes.
3.  **Identity**: Every node **MUST** have a unique `node_id`.

## 4. Architecture Structure

**Schema File**: `schemas/v2/mplp-network.schema.json`

### Network Object
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `meta` | `Metadata` | ✅ Yes | Protocol metadata. |
| `governance` | `Object` | ❌ No | Lifecycle metadata. |
| `network_id` | `UUID` | ✅ Yes | Global unique identifier. |
| `context_id` | `UUID` | ✅ Yes | Binding to Context. |
| `name` | `String` | ✅ Yes | Network name. |
| `description` | `String` | ❌ No | Brief description. |
| `topology_type` | `Enum` | ✅ Yes | `single_node`, `hub_spoke`, `mesh`, `hierarchical`, `hybrid`, `other`. |
| `status` | `Enum` | ✅ Yes | `draft`, `provisioning`, `active`, `degraded`, `maintenance`, `retired`. |
| `nodes` | `Array` | ❌ No | List of `NetworkNode`. |
| `trace` | `TraceBase` | ❌ No | Trace reference. |
| `events` | `Array` | ❌ No | Key lifecycle events. |

### NetworkNode Object
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `node_id` | `UUID` | ✅ Yes | Node identifier. |
| `name` | `String` | ❌ No | Node name. |
| `kind` | `Enum` | ✅ Yes | `agent`, `service`, `database`, `queue`, `external`, `other`. |
| `role_id` | `String` | ❌ No | Bound Role ID. |
| `status` | `Enum` | ✅ Yes | `active`, `inactive`, `degraded`, `unreachable`, `retired`. |

## 5. Binding Points

- **L1 Schema**: `mplp-network.schema.json`
- **L2 Events**: `GraphUpdateEvent`.
- **PSG Path**: `psg.network`.

## 6. Interaction Model

1.  **Provision**: Infrastructure provisions nodes.
2.  **Register**: Nodes register themselves with the Network module (Status: `active`).
3.  **Monitor**: Runtime updates node status based on heartbeats.

## 7. Versioning & Invariants

- **Invariant**: `node_id` **MUST** be unique within the Network.
- **Invariant**: A Node of kind `agent` **SHOULD** have a valid `role_id`.

## 8. Security / Safety Considerations

- **Authentication**: Node registration **MUST** be authenticated to prevent rogue nodes.
- **Isolation**: Compromised nodes **SHOULD** be marked `unreachable` or `retired` to isolate them.

## 9. References

- [Context Module](context-module.md)
- [Role Module](role-module.md)
