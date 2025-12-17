---
title: MPLP v1.0 Authority Sources
description: Definition of authoritative sources for the MPLP protocol,
  establishing the hierarchy of truth.
doc_status: normative
doc_role: normative_index
protocol_version: 1.0.0
spec_level: CrossCutting
modules: []
normative_id: MPLP-AUTH-SOURCES
permalink: /00-index/mplp-v1.0-authority-sources
normative_refs: []
protocol_alignment:
  truth_level: T2
  protocol_version: 1.0.0
  schema_refs:
    - schema_id: https://schemas.mplp.dev/v1.0/mplp-core.schema.json
      binding: manual
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes:
    - Manual binding applied per Remediation Option A/B.
  doc_status: normative
sidebar_position: 3
---
# MPLP v1.0 Authority Sources

This document establishes the hierarchy of truth for the **Multi-Agent Lifecycle Protocol (MPLP)**. When discrepancies exist between different artifacts, this hierarchy determines the authoritative definition.

## Hierarchy of Truth

1.  **Frozen Spec Documents** (Level 1)
    *   Location: `docs/docs/` (Normative only)
    *   Definition: The prose specification text, specifically the items listed in the [Normative Corpus Index](./mplp-v1.0-normative-corpus-index.md).
    *   Precedence: Highest. Overrides schemas/code in case of fundamental semantic conflict, though schemas are the technical truth for validation.

2.  **JSON Schemas** (Level 2)
    *   Location: `schemas/mplp-*.schema.json`
    *   Definition: The formal machine-readable definition of data structures.
    *   Role: definitive source for "Shape of Data".

3.  **Standard Profiles** (Level 3)
    *   Location: `docs/docs/profiles/*.md` (e.g., SA-Profile, MAP-Profile)
    *   Definition: Constraints and configurations of the base protocol for specific agent types.

4.  **Golden Flow Registry** (Level 4)
    *   Location: `docs/docs/09-tests/golden-flow-registry.md`
    *   Definition: Canonical interaction examples.
    *   Role: definitive source for "Sequence of Operations".

5.  **SDK Implementation** (Informative / Reference)
    *   Location: `packages/sdk-ts`, `packages/sdk-py`
    *   Role: Reference implementation. NOT Normative unless explicitly stated in a specific binding document.

## Citation Rules

All Normative Documents MUST cite their authority source for key definitions.

*   **Terms**: Must refer to the Glossary.
*   **Data Structures**: Must refer to the Schema.
*   **Behaviors**: Must refer to the specific Module Specification.

## Frozen Schema Configuration

> [!IMPORTANT]
> **Schema Root Path (v1.0.0 Frozen)**
> ```yaml
> schema_root: "schemas/"
> schema_version_policy: "v1.0.0 frozen – path changes require MIP"
> ```

The schema root path is frozen for v1.0.0. Any relocation of schema files requires a formal MIP (MPLP Improvement Proposal) process.

## Authority Precedence Clause

> [!IMPORTANT]
> **docs.mplp.io Takes Precedence Over mplp.io**
> 
> If content on the official website (`mplp.io`) conflicts with documentation at `docs.mplp.io`, the documentation site is authoritative.
> 
> This is because:
> 1. `docs.mplp.io` contains the **Normative Corpus** — the frozen specification
> 2. `mplp.io` serves as a **Discovery/Landing** surface — informative marketing content

Normative pages on `docs.mplp.io` MUST declare:
- `spec_level` (L1, L2, L3, L4, or CrossCutting)
- `modules` (which protocol modules are addressed)
- `cross_cutting` (which cross-cutting concerns are addressed, if any)

