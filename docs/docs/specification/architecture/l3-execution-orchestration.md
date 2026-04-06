---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-ARCH-L3-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-trace.schema.json"
    - "schemas/v2/events/mplp-pipeline-stage-event.schema.json"
    - "schemas/v2/events/mplp-graph-update-event.schema.json"
    - "schemas/v2/invariants/observability-invariants.yaml"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: L3 Execution & Orchestration
sidebar_label: L3 Execution & Orchestration
sidebar_position: 3
description: "Boundary page for the MPLP L3 runtime-realization layer and its relationship to frozen protocol artifacts."
---

# L3 Execution & Orchestration

## Scope

This page documents the L3 runtime-realization boundary in the MPLP architecture
model.

It clarifies how runtime-layer concepts relate to frozen protocol artifacts. It
does not define one canonical runtime model, one required execution loop, or one
required interface surface.

## Non-Goals

This page does not define:

- PSG data structures as protocol core objects
- VSL or AEL interfaces as protocol requirements
- event-bus backends or module-registry contracts
- drift-detection algorithms
- rollback or compensation strategies
- package implementation contracts

## 1. Purpose

L3 names the layer where implementations realize protocol semantics at runtime.

The frozen protocol baseline still comes from L1/L2 artifacts. L3 should be read
as subordinate to those sources:

- schemas define protocol object shape
- profile manifests define profile baselines
- invariants define frozen validation constraints

Runtime concepts may be useful for implementation, but they do not become
protocol core meaning merely by appearing in documentation.

## 2. Runtime Concepts at the L3 Boundary

The following terms are runtime-side concepts:

| Term | Boundary Meaning |
|:---|:---|
| PSG | Runtime-side state model concept, not a protocol core object |
| VSL | Runtime persistence abstraction, not a frozen protocol interface |
| AEL | Runtime execution abstraction, not a frozen protocol interface |
| Drift Detection | Runtime strategy family, not a protocol-required algorithm |
| Rollback / Compensation | Runtime recovery strategy family, not a protocol-required algorithm |
| Event Bus | Runtime transport/distribution mechanism, not a protocol core object |

These concepts may appear in guides or implementation surfaces, but this page
does not define them as canonical protocol objects or mandatory interfaces.

## 3. What Remains Formally Binding

At the L3 boundary, the strongest supported normative claims are:

- runtime outputs must not violate the frozen L1/L2 schemas and invariants
- if an implementation produces `Trace` objects, they must conform to
  `schemas/v2/mplp-trace.schema.json`
- if an implementation produces MPLP observability events, those events must
  conform to the relevant event schemas and observability invariants
- profile-linked event requirements remain those declared by the frozen profile
  manifests and event schemas, not by derived runtime examples

## 4. What This Page Does Not Add

This page does not add any new protocol requirements for:

- one authoritative PSG storage model
- one read/write API for runtime state
- one standard VSL method set
- one standard AEL method set
- one canonical event-queue structure
- one canonical module registry type
- one required snapshot or compensation mechanism
- one required runtime package surface

## 5. Reading Path

To understand L3 safely:

1. Read [Modules Overview](/docs/specification/modules),
   [Profiles Overview](/docs/specification/profiles), and
   [Observability Overview](/docs/specification/observability) first.
2. Then read this page as a boundary note on runtime realization.
3. Use [Runtime Guides](/docs/guides/runtime) for implementation-oriented
   explanation only after the frozen protocol baseline is clear.

## 6. References

- `schemas/v2/mplp-trace.schema.json`
- `schemas/v2/events/mplp-pipeline-stage-event.schema.json`
- `schemas/v2/events/mplp-graph-update-event.schema.json`
- `schemas/v2/invariants/observability-invariants.yaml`
- [Observability Overview](/docs/specification/observability)
- [Runtime Guides](/docs/guides/runtime)

---

**Final Boundary**: L3 is the runtime-realization layer. It does not create new
protocol object families, new required interfaces, or new runtime doctrine
beyond what frozen schemas, event files, and invariants already support.
