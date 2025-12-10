---
title: Error Handling
description: Kernel duty for recovering from failures deterministically.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Error Handling, failure recovery, deterministic recovery, fault tolerance]
sidebar_label: Error Handling
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Error Handling

> [!NOTE]
> **Duty Type**: OS-Level Kernel Duty  
> **SOT Reference**: README v1.0.0 Section 8

## Intent
To ensure that the system can detect, report, and recover from failures in a deterministic and auditable way, preventing silent failures and zombie states.

## Lifecycle Coverage
*   **All Stages**: From schema validation errors in Planning to runtime exceptions in Execution.

## Agent Scope (SA / MAP)
*   **SA**: Retrying failed tool calls, self-correction.
*   **MAP**: Escalating failures to a supervisor agent.

## Required Events
*   `ErrorEmitted`
*   `RecoveryAttempted`
*   `CircuitBreakerTripped`

## Compliance Requirements
1.  Runtime MUST NOT allow silent failures; all errors must be logged to the Trace.
2.  Runtime MUST support defined recovery strategies (Retry, Ignore, Abort, Escalate).
3.  Errors MUST be structured with standard codes and contexts.

## Implementation Details (Non-Normative)

Error Handling is deeply integrated into the **Trace** and **Event** systems.

### Trace Status
The `Trace` object (`mplp-trace.schema.json`) and its segments have a `status` field. Setting this to `failed` signals a breakdown in the execution flow.
- **`status: failed`**: Indicates an unrecoverable error at that level of abstraction.
- **`events`**: The trace includes a list of error events that provide context (stack traces, error codes).

### Runtime Execution Events
The `RuntimeExecutionEvent` (`events/mplp-runtime-execution-event.schema.json`) is the primary vehicle for reporting failures:
- **`status: failed`**: Explicitly marks the event as a failure.
- **`payload`**: Contains the error details, allowing the Runtime to decide on a recovery strategy (Retry, Escalate, etc.).

## Schema Reference

| Schema | Purpose | Key Fields |
|:---|:---|:---|
| `mplp-trace.schema.json` | Execution status | `status`, `events` |
| `events/mplp-runtime-execution-event.schema.json` | Error reporting | `status: failed`, `payload` |

## Examples
*   **Tool Failure**: An agent tries to read a non-existent file; Runtime catches the error, logs it, and prompts the agent to check the path.
*   **Context Limit**: LLM context window exceeded; Runtime triggers a "Summarize & Prune" recovery flow.

