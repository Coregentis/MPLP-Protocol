---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-PROF-SA-EVENTS-001"
sidebar_position: 2

# UI metadata (non-normative; excluded from protocol semantics)
title: SA Events
sidebar_label: SA Events
description: "Schema-anchored specification page for the frozen SA profile event surface."
---

# SA Events Specification

## Scope

This page documents the frozen **SA profile-specific event surface** as declared
by:

- `schemas/v2/profiles/sa-profile.yaml`
- `schemas/v2/events/mplp-sa-event.schema.json`
- `schemas/v2/taxonomy/event-taxonomy.yaml`

It does not define handler logic, derived event-family doctrine, or processing
semantics beyond those sources.

## Non-Goals

This page does not define:

- general observability event-family behavior
- event-processing pipelines
- trace-writing algorithms
- learning extraction behavior
- SDK event handlers

## 1. Purpose

The SA event surface is the frozen profile-specific event surface for the SA
baseline.

In the event taxonomy, profile-specific events are tracked separately from the
12 general event families through the `sa_profile` profile-event entry pointing
to `mplp-sa-event.schema.json`.

## 2. Frozen Event Baseline

### 2.1 Profile Manifest Anchor

From `schemas/v2/profiles/sa-profile.yaml`:

- mandatory: `SAInitialized`, `SAContextLoaded`, `SAPlanEvaluated`,
  `SAStepStarted`, `SAStepCompleted`, `SATraceEmitted`, `SACompleted`
- recommended: `SAStepFailed`

### 2.2 Event Schema Surface

From `schemas/v2/events/mplp-sa-event.schema.json`:

#### Required Top-Level Fields

- `event_id`
- `event_type`
- `timestamp`
- `sa_id`

#### Optional Top-Level Fields

- `context_id`
- `plan_id`
- `trace_id`
- `payload`

#### `event_type` Enum

The schema enum contains:

- `SAInitialized`
- `SAContextLoaded`
- `SAPlanEvaluated`
- `SAStepStarted`
- `SAStepCompleted`
- `SAStepFailed`
- `SATraceEmitted`
- `SACompleted`

### 2.3 Payload Definitions Present In Schema

The frozen schema includes named payload definitions for:

- `step_started_payload`
- `step_completed_payload`

These are schema-provided payload definitions. This page does not expand them
into a larger event-processing contract.

## 3. What This Page Does Not Create

This page does not create any of the following as new protocol requirements:

- `TraceEvent` as a separate event family
- `CostAndBudgetEvent` as an SA-profile-specific required event
- `ToolExecutionEvent` or `LLMCallEvent` as SA event types
- module-action/event binding rules beyond the frozen profile and schema files
- event-handler patterns

If a named event type is not present in the frozen SA profile manifest or the
SA event schema enum, this page should not be read as creating it.

## 4. Canonical Reading Path

Read SA events in this order:

1. [SA Profile](./sa-profile.md)
2. `schemas/v2/profiles/sa-profile.yaml`
3. `schemas/v2/events/mplp-sa-event.schema.json`
4. [Observability Overview](/docs/specification/observability)

## 5. References

- `schemas/v2/profiles/sa-profile.yaml`
- `schemas/v2/events/mplp-sa-event.schema.json`
- `schemas/v2/taxonomy/event-taxonomy.yaml`
- [SA Profile](./sa-profile.md)
- [Observability Overview](/docs/specification/observability)

---

**Final Boundary**: this page identifies the frozen SA profile event surface
only. It does not create new event-family doctrine or runtime-processing
semantics beyond the frozen sources.
