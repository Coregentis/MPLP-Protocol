---
title: Event Bus
description: Kernel duty for universal event emission and subscription.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Event Bus, event emission, subscription, async communication]
sidebar_label: Event Bus
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Event Bus

> [!NOTE]
> **Duty Type**: OS-Level Kernel Duty  
> **SOT Reference**: README v1.0.0 Section 8

## Intent
To provide a unified, asynchronous communication backbone that decouples producers (Agents, Runtime) from consumers (Observability, UI, Analytics).

## Lifecycle Coverage
*   **Entire Lifecycle**: Every state change is an event.

## Agent Scope (SA / MAP)
*   **SA**: Emitting thought traces and tool outputs.
*   **MAP**: Broadcasting messages between agents.
The `Network` object (`mplp-network.schema.json`) defines the routing and connectivity of the system:
- **`topology_type`**: Defines the physical layout (e.g., `hub_spoke`, `mesh`, `single_node`).
- **`nodes`**: The collection of agents, services, and resources connected to the bus.

### Event Taxonomy
MPLP standardizes all system activity into 3 physical event schemas that carry 12 logical event families:
1.  **`PipelineStageEvent`**: For lifecycle transitions (Job, Plan, Step, Task).
2.  **`GraphUpdateEvent`**: For state mutations (Context, Resource, Artifact, Cost).
3.  **`RuntimeExecutionEvent`**: For operational activity (Agent, Tool, LLM, Worker).

## Schema Reference

| Schema | Purpose | Key Fields |
|:---|:---|:---|
| `mplp-network.schema.json` | Defines network topology | `network_id`, `topology_type`, `nodes` |
| `events/mplp-*.schema.json` | Physical event definitions | `event_family`, `payload`, `source` |

## Examples
*   **UI Update**: Frontend subscribes to `StepUpdated` to show a progress bar.
*   **Audit Log**: Compliance service subscribes to `*` to archive all activity.

