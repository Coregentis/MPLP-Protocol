---
title: State Sync
description: Kernel duty for keeping distributed state consistent (PSG).
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, State Sync, PSG consistency, distributed state, synchronization]
sidebar_label: State Sync
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# State Sync

> [!NOTE]
> **Duty Type**: OS-Level Kernel Duty  
> **SOT Reference**: README v1.0.0 Section 8

## Intent
To ensure that all components of the system (Agents, Runtimes, Tools) have a consistent, up-to-date view of the Project Semantic Graph (PSG).

## Lifecycle Coverage
*   **Execution**: Propagating PSG updates to all subscribers.

## Agent Scope (SA / MAP)
*   **SA**: Syncing state between Agent memory and PSG.
*   **MAP**: Syncing state across distributed agent nodes.

## Required Events
*   `GraphUpdateEvent`
*   `StateSnapshotCreated`
*   `DriftDetected`

## Compliance Requirements
1.  Runtime MUST use the PSG as the Single Source of Truth.
2.  Runtime MUST broadcast state changes to relevant subscribers immediately.
3.  Runtime MUST provide mechanisms to detect and resolve state drift.

## Implementation Details (Non-Normative)

State Sync is achieved by maintaining a **Project Semantic Graph (PSG)** rooted in the **Context Module**.

### The PSG Root
The `Context` object (`mplp-context.schema.json`) serves as the root of the state tree:
- **`context_id`**: The anchor for all other resources (Plans, Roles, Traces).
- **`root`**: Defines the static environment and domain boundaries.
- **`updated_at`**: Acts as a high-level version vector for the entire graph.

### Synchronization Mechanism
State changes are propagated via `GraphUpdateEvent` (`events/mplp-graph-update-event.schema.json`). This event carries the "diff" or "patch" required to bring remote nodes into consistency with the master PSG.

## Schema Reference

| Schema | Purpose | Key Fields |
|:---|:---|:---|
| `mplp-context.schema.json` | PSG Root | `context_id`, `root`, `updated_at` |
| `events/mplp-graph-update-event.schema.json` | Sync payload | `event_family: graph_update`, `payload` |

## Examples
*   **Real-time UI**: Pushing a Plan update to the user's browser via WebSocket.
*   **Reconnection**: An agent reconnects after a network drop and fetches the latest PSG snapshot.

