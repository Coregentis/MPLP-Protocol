---
title: Golden Fixture Format
description: Specification of the Golden Fixture Format for MPLP testing. Defines directory structure, input/output JSON formats, and strict comparison rules for validating runtime conformance.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Golden Fixture Format, MPLP testing, test fixtures, JSON comparison rules, runtime conformance, input output format]
sidebar_label: Golden Fixture Format
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

---

# Golden Fixture Format

**Status**: Normative Specification for MPLP v1.0 Conformance
**Note**: This document is part of the **MPLP v1.0 Executable Specification**.

## 1. Directory Structure

The Golden Test Suite is organized by Flow ID in the `tests/golden/flows/` directory. Each flow has a dedicated subdirectory containing input and expected output fixtures.

```txt
tests/golden/flows/
 flow-01-single-agent-plan/    README.md              # Flow description    input/     context.json       # Optional: Initial context     plan.json          # Optional: Initial plan    expected/        context.json       # Required: Expected context state        plan.json          # Required: Expected plan state
 flow-05-single-agent-confirm-required/    README.md    input/     ...    expected/        context.json        plan.json        confirm.json       # For confirm-related flows        trace.json         # For flows that emit traces
 map-flow-01-turn-taking/
     README.md
     input/    ...
     expected/
         context.json
         plan.json
         collab.json        # For MAP collaboration flows
```

## 2. Input Format (`input/`)

The `input/` directory contains the starting state or parameters for the flow.

- **Purpose**: To provide deterministic inputs for the runtime execution.
- **Rules**:
    - If a file is missing (e.g., `context.json`), the test runner MUST generate a valid default object using the SDK builders or Runtime defaults.
    - If a file is present, the test runner MUST use it as the specific input for that stage.

## 3. Output Format (`expected/`)

The `expected/` directory contains the authoritative "Golden" output that a conformant runtime MUST produce.

### 3.1 Protocol Objects (Required)
- `context.json`: Final context state after flow execution
- `plan.json`: Final plan state after flow execution

### 3.2 Module-Specific Objects (Per-Flow)
- `confirm.json`: For flows involving confirmation (e.g., `flow-05`)
- `trace.json`: For flows that emit trace spans
- `collab.json`: For MAP collaboration flows (e.g., `map-flow-01`)

## 4. Comparison Rules

To verify conformance, the Runtime's actual output is compared against the `expected/` fixtures using the following strict rules:

### 4.1 Object Comparison
- **Deep Equality**: JSON objects are compared key-by-key.
- **Missing Keys**: If a key exists in `expected` but is missing in `actual`, it is a **FAILURE**.
- **Extra Keys**: If `actual` contains keys not in `expected`, it is **ALLOWED** (open-world assumption), UNLESS `additionalProperties: false` is enforced by schema.
- **Values**: Primitive values (string, number, boolean) must match exactly.

### 4.2 Array Comparison
- **Strict Ordering**: Arrays are compared item-by-item in order.
- **Length**: Array lengths must match exactly.

### 4.3 Ignored Fields
The following fields are **EXCLUDED** from direct value comparison because they are non-deterministic (auto-generated):

- **IDs**: `context_id`, `plan_id`, `confirm_id`, `trace_id`, `step_id`, `span_id`, `target_id` (unless specifically fixed in input).
- **Timestamps**: `created_at`, `updated_at`, `requested_at`, `started_at`, `finished_at`, `timestamp`.
- **Runtime Metadata**: `run_id`, `correlation_id` (if dynamic).

*Note: While the VALUES are ignored during JSON comparison, their FORMAT and REFERENTIAL INTEGRITY are verified by the Invariant Checker.*

### 4.4 Trace Events
- **Type Matching**: `event.type` must match exactly.
- **Payload Matching**: `event.data` is compared using the Object Comparison rules above.
- **Sequence**: Event order must be consistent with causal ordering.

## 5. Relationship to Standards

- **Schema Mapping**: This format validates that the Runtime produces objects that conform to the [Schema Mapping Standard](../10-sdk/schema-mapping-standard.md).
- **Integration Spec**: This suite verifies that the [Integration Spec](../07-integration/integration-spec.md) is implemented correctly.

---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
