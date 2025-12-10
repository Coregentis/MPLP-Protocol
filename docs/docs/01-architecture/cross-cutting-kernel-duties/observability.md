---
title: Observability
description: Kernel duty for deep visibility into reasoning and state.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Observability, visibility, reasoning traces, auditability]
sidebar_label: Observability
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Observability

> [!NOTE]
> **Duty Type**: OS-Level Kernel Duty  
> **SOT Reference**: README v1.0.0 Section 8

## Intent
To provide total visibility into the "Black Box" of agent reasoning, ensuring that every state change, decision, and action is traceable, auditable, and debuggable.

## Lifecycle Coverage
*   **All Stages**: From Intent to Confirmation to Execution.

## Agent Scope (SA / MAP)
*   **SA**: Internal reasoning traces (Chain of Thought).
*   **MAP**: Inter-agent messages and handoffs.

## Required Events
*   `TraceSpanStarted` / `TraceSpanEnded`
*   `LogEntryEmitted`
*   `MetricRecorded`

## Compliance Requirements
1.  Runtime MUST emit standard MPLP Trace events.
2.  Runtime MUST maintain a causal link between Parent and Child spans.
3.  Runtime MUST NOT drop critical audit logs even under load.

## Implementation Details (Non-Normative)

The MPLP observability layer is implemented via the **Trace Module**. Every major protocol object (Context, Plan, Collab, Role) includes a `trace` field that links it to a `Trace` resource.

### Trace Structure
The `Trace` object (`mplp-trace.schema.json`) serves as the root container for observability data:
- **`trace_id`**: Global unique identifier for the trace session.
- **`root_span`**: The top-level span that encompasses the entire lifecycle of the traced object.
- **`segments`**: Logical groupings of execution intervals (e.g., "Planning Phase", "Execution Phase") that may span multiple low-level operations.
- **`events`**: A chronological list of significant state changes, errors, or decisions.

### Distributed Tracing
MPLP supports distributed tracing by propagating `trace_id` and `span_id` across agent boundaries. In Multi-Agent (MAP) scenarios, a child agent's execution is linked to the parent's trace via a `parent_span_id`.

## Schema Reference

| Schema | Purpose | Key Fields |
|:---|:---|:---|
| `mplp-trace.schema.json` | Defines the Trace resource | `trace_id`, `root_span`, `segments`, `status` |
| `common/trace-base.schema.json` | Base span definition | `span_id`, `parent_id`, `name`, `start_time`, `end_time` |

## Examples
*   **Live Tracing**: Watching an agent's thought process in real-time via a dashboard.
*   **Post-Mortem**: Replaying a failed session to understand why an agent chose a specific tool.

