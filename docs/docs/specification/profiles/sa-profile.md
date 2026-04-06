---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-PROF-SA-001"
sidebar_position: 1

# UI metadata (non-normative; excluded from protocol semantics)
title: Single-Agent Profile (SA)
sidebar_label: SA Profile
description: "Schema-anchored specification page for the frozen MPLP Single-Agent profile baseline."
---

# Single-Agent Profile (SA)

## Scope

This page documents the frozen **SA profile baseline** as declared in:

- `schemas/v2/profiles/sa-profile.yaml`
- `schemas/v2/invariants/sa-invariants.yaml`
- `schemas/v2/events/mplp-sa-event.schema.json`

It records the profile-level baseline carried by those sources. It does not add
new execution doctrine or runtime behavior.

## Non-Goals

This page does not define:

- a universal execution sequence
- a runtime scheduler or orchestrator
- implementation algorithms
- additional agent-count doctrine beyond the frozen profile sources
- SDK or framework behavior

## 1. Purpose

The SA profile is the frozen single-agent profile baseline named by
`mplp:profile:sa:1.0.0`.

This page should be read as a profile anchor over the frozen manifest and its
linked invariant and event files, not as a separate behavioral specification.

## 2. Frozen Profile Baseline

### 2.1 Manifest Identity

From `schemas/v2/profiles/sa-profile.yaml`:

| Field | Frozen Value |
|:---|:---|
| `profile_id` | `mplp:profile:sa:1.0.0` |
| `title` | `MPLP Single-Agent Profile v1.0` |
| `description` | `Minimal execution profile for single-agent MPLP workflows` |

### 2.2 Required Modules

The frozen manifest lists these required modules:

| Module | Source |
|:---|:---|
| Context | `schemas/v2/mplp-context.schema.json` |
| Plan | `schemas/v2/mplp-plan.schema.json` |
| Trace | `schemas/v2/mplp-trace.schema.json` |
| Role | `schemas/v2/mplp-role.schema.json` |
| Core | manifest entry in `sa-profile.yaml` |

### 2.3 Invariant Anchor

The frozen invariant source for this profile is:

- `schemas/v2/invariants/sa-invariants.yaml`

The manifest records `count: 9` and summarizes these checks:

- `sa_requires_context`
- `sa_context_must_be_active`
- `sa_plan_context_binding`
- `sa_plan_has_steps`
- `sa_steps_have_valid_ids`
- `sa_steps_agent_role_if_present`
- `sa_trace_not_empty`
- `sa_trace_context_binding`
- `sa_trace_plan_binding`

### 2.4 Profile-Linked Event Anchor

The frozen event source for this profile is:

- `schemas/v2/events/mplp-sa-event.schema.json`

The manifest lists:

- mandatory: `SAInitialized`, `SAContextLoaded`, `SAPlanEvaluated`,
  `SAStepStarted`, `SAStepCompleted`, `SATraceEmitted`, `SACompleted`
- recommended: `SAStepFailed`

## 3. Relationship to MAP

The frozen manifest records:

- `extends: null`
- `extended_by: ["mplp:profile:map:1.0.0"]`

This page does not add further relationship doctrine beyond that source.

## 4. What This Page Does Not Create

This page does not create any of the following as new protocol requirements:

- “exactly one agent” as an expanded doctrine beyond the frozen profile anchor
- “one context, one plan” as an independent rule text
- local-only governance theory
- end-to-end execution semantics beyond the linked event and invariant files

If a specific behavioral claim is not present in the frozen manifest, invariant
file, or event schema, this page should not be read as creating it.

## 5. Canonical Reading Path

Read SA in this order:

1. `schemas/v2/profiles/sa-profile.yaml`
2. [Modules Overview](/docs/specification/modules)
3. `schemas/v2/invariants/sa-invariants.yaml`
4. [SA Events](./sa-events.md)

## 6. References

- `schemas/v2/profiles/sa-profile.yaml`
- `schemas/v2/invariants/sa-invariants.yaml`
- `schemas/v2/events/mplp-sa-event.schema.json`
- [Modules Overview](/docs/specification/modules)
- [MAP Profile](./map-profile.md)

---

**Final Boundary**: this page identifies the frozen SA profile baseline and its
actual source files only. It does not add runtime or behavioral doctrine beyond
those sources.
