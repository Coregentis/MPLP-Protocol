---
title: Performance
description: Kernel duty for latency, throughput, and resource limits.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Performance, latency, throughput, resource limits, SLA]
sidebar_label: Performance
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Performance

> [!NOTE]
> **Duty Type**: OS-Level Kernel Duty  
> **SOT Reference**: README v1.0.0 Section 8

## Intent
To monitor and enforce performance standards, ensuring that agent systems remain responsive and cost-effective.

## Lifecycle Coverage
*   **Execution**: Monitoring duration and token usage.

## Agent Scope (SA / MAP)
*   **SA**: Latency of individual LLM calls.
*   **MAP**: Total throughput of the multi-agent system.

## Required Events
*   `MetricRecorded`
*   `QuotaExceeded`
*   `SLAWarning`

## Compliance Requirements
1.  Runtime MUST track execution duration for every Step and Turn.
2.  Runtime SHOULD support token usage tracking and budget limits.
3.  Runtime MUST NOT degrade significantly as PSG size grows.

## Implementation Details (Non-Normative)

Performance monitoring is intrinsic to the **Trace Module**.

### Timing Semantics
Every `Trace`, `Segment`, and `Span` in `mplp-trace.schema.json` includes:
- **`started_at`**: ISO 8601 timestamp.
- **`finished_at`**: ISO 8601 timestamp (nullable).

By calculating the delta between these two fields, the Runtime and Observability tools can derive precise latency metrics for any unit of work, from a single tool call to a multi-day plan.

### Metadata Overhead
While the protocol is designed to be lightweight, the `Trace` object can grow significantly. Runtimes are expected to offload trace data asynchronously to avoid blocking the critical execution path.

## Schema Reference

| Schema | Purpose | Key Fields |
|:---|:---|:---|
| `mplp-trace.schema.json` | Latency tracking | `started_at`, `finished_at` |

## Examples
*   **Budget Cap**: Stopping an agent if it consumes more than $5.00 in API credits.
*   **Timeout**: Killing a tool execution if it hangs for more than 30 seconds.

