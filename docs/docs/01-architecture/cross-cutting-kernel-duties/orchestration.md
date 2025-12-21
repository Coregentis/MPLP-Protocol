---
title: Orchestration
description: Kernel duty for pipeline management and flow control.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Orchestration, pipeline management, flow control, DAG execution]
sidebar_label: Orchestration
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Orchestration

> [!NOTE]
> **Duty Type**: OS-Level Kernel Duty  
> **SOT Reference**: README v1.0.0 Section 8

## Intent
To manage the flow of execution, enforcing dependencies, concurrency limits, and stage transitions within the agent lifecycle.

## Lifecycle Coverage
*   **Execution**: Scheduling steps and managing the pipeline.

## Agent Scope (SA / MAP)
*   **SA**: Linear step execution.
*   **MAP**: Complex DAG execution with parallel branches.

## Required Events
*   `PipelineStageStarted`
*   `PipelineStageCompleted`
*   `WorkflowPaused`

## Compliance Requirements
1.  Runtime MUST respect dependency graphs (Step B cannot start until Step A completes).
2.  Runtime MUST emit `PipelineStageEvent` for every state transition.
3.  Runtime MUST support pausing and resuming workflows.

## Implementation Details (Non-Normative)

Orchestration is primarily handled by the **Plan Module**. The `Plan` object serves as the executable blueprint for the agent's actions.

### Plan Structure
The `Plan` object (`mplp-plan.schema.json`) decomposes a high-level objective into atomic units of work:
- **`steps`**: An array of `PlanStep` objects, each representing a discrete task.
- **`dependencies`**: Within each step, a list of `step_id`s that must complete before execution can proceed. This explicitly defines the Directed Acyclic Graph (DAG) of execution.
- **`status`**: Tracks the lifecycle of the plan (`draft` -> `proposed` -> `approved` -> `in_progress` -> `completed`).

### Step Execution
Each step includes:
- **`agent_role`**: The specific role responsible for executing the step.
- **`status`**: Granular tracking of step progress (`pending`, `in_progress`, `blocked`, `completed`).

## Schema Reference

| Schema | Purpose | Key Fields |
|:---|:---|:---|
| `mplp-plan.schema.json` | Defines the execution plan | `plan_id`, `steps`, `status`, `objective` |
| `plan_step_core` ($defs) | Defines a single step | `step_id`, `dependencies`, `agent_role`, `status` |

## Examples
*   **DAG Execution**: Running 3 research agents in parallel, then aggregating their results in a final summary step.
*   **Approval Gate**: Pausing execution until a human confirms the plan.

