---
title: Coordination
description: Kernel duty for managing multi-agent collaboration and handoffs.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Coordination, multi-agent collaboration, handoffs, MAP]
sidebar_label: Coordination
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Coordination

> [!NOTE]
> **Duty Type**: OS-Level Kernel Duty  
> **SOT Reference**: README v1.0.0 Section 8

## Intent
To govern how multiple agents collaborate, share state, and transfer control within an MPLP project, ensuring "Many agents, one truth".

## Lifecycle Coverage
*   **Planning**: Decomposing tasks for multiple agents.
*   **Execution**: Managing turns and handoffs.
*   **Confirmation**: Multi-agent consensus.

## Agent Scope (SA / MAP)
*   **SA**: Self-scheduling and tool coordination.
*   **MAP**: Broadcast, Round-Robin, Orchestrated, Swarm, Pair modes.

## Required Events
*   `MAPTurnDispatched`
*   `MAPTurnCompleted`
*   `MAPBroadcastSent`
*   `MAPHandoffCompleted`

## Compliance Requirements
1.  Runtime MUST enforce exclusive write access during a Turn.
2.  Handoffs MUST be atomic (control cannot be lost or duplicated).
3.  All coordinating agents MUST share the same Project Context (PSG).

## Implementation Details (Non-Normative)

Coordination in MPLP is managed through the **Collab Module** and **Role Module**.

### Collaboration Sessions
The `Collab` object (`mplp-collab.schema.json`) defines a bounded scope for multi-agent interaction:
- **`mode`**: Determines the interaction pattern (e.g., `broadcast`, `round_robin`, `orchestrated`, `swarm`, `pair`).
- **`participants`**: A list of agents or entities involved, each bound to a specific `role_id`.
- **`context_id`**: Links the collaboration to a shared Project Context (PSG), ensuring all agents operate on the same state.

### Role Definitions
The `Role` object (`mplp-role.schema.json`) defines the identity and permissions of a participant:
- **`name`** and **`description`**: Semantic definition of the role (e.g., "Code Reviewer").
- **`capabilities`**: Explicit list of allowed actions (e.g., `plan.create`, `confirm.approve`).

## Schema Reference

| Schema | Purpose | Key Fields |
|:---|:---|:---|
| `mplp-collab.schema.json` | Defines collaboration sessions | `collab_id`, `mode`, `participants`, `status` |
| `mplp-role.schema.json` | Defines agent roles | `role_id`, `name`, `capabilities` |

## Examples
*   **Round-Robin**: Architect -> Coder -> Reviewer -> Architect.
*   **Broadcast**: Orchestrator sends "Analyze" task to 5 specialist agents simultaneously.

