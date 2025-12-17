---
title: MPLP v1.0 Normative Corpus Index
description: The official index of normative specifications, schemas, and
  policies constituting the Multi-Agent Lifecycle Protocol (MPLP) v1.0.
doc_status: normative
doc_role: normative_index
protocol_version: 1.0.0
spec_level: CrossCutting
normative_id: MPLP-CORPUS-INDEX
permalink: /00-index/mplp-v1.0-normative-corpus-index
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
sidebar_position: 2
---
# MPLP v1.0 Normative Corpus Index

> **Protocol Version**: 1.0.0 (Frozen)
> **Status**: APPROVED
> **First Public Release**: 2025-01-01
> **Freeze Date**: 2025-12-16

**Normative Statement**
> This document constitutes the authoritative index of all normative specifications for the **Multi-Agent Lifecycle Protocol (MPLP) v1.0**. Any document, section, or behavior not explicitly listed herein is non-normative unless referenced by a document listed in this index.

This document defines the **Normative Corpus** of the MPLP v1.0 Protocol.

## 1. Core Specifications (Normative)

The following documents define the binding requirements of the protocol.

| ID | Title | Level | Scope |
|---|---|---|---|
| [MPLP-ARCH](https://docs.mplp.io/architecture/architecture-overview) | Architecture Overview | L1 | Global |
| [MPLP-CORE](https://docs.mplp.io/modules/core-module) | Core Module | L2 | Protocol Invariants |
| [MPLP-CTX](https://docs.mplp.io/modules/context-module) | Context Module | L2 | Context Propagation |
| [MPLP-PLAN](https://docs.mplp.io/modules/plan-module) | Plan Module | L2 | Execution Planning |
| [MPLP-CONFIRM](https://docs.mplp.io/modules/confirm-module) | Confirm Module | L2 | Human/Auto Confirmation |
| [MPLP-TRACE](https://docs.mplp.io/modules/trace-module) | Trace Module | L2 | Telemetry & Observability |
| [MPLP-ROLE](https://docs.mplp.io/modules/role-module) | Role Module | L2 | Permissions & Identity |
| [MPLP-DIALOG](https://docs.mplp.io/modules/dialog-module) | Dialog Module | L2 | Structured Reasoning |
| [MPLP-COLLAB](https://docs.mplp.io/modules/collab-module) | Collab Module | L2 | Multi-Agent Coordination |
| [MPLP-EXT](https://docs.mplp.io/modules/extension-module) | Extension Module | L2 | Safe Extensibility |
| [MPLP-NET](https://docs.mplp.io/modules/network-module) | Network Module | L2 | Distributed Communication |

## 2. Profiles & Extensions (Normative)

| ID | Title | Type |
|---|---|---|
| [MPLP-PROF-SA](https://docs.mplp.io/profiles/sa-profile) | Standard Agent (SA) Profile | Profile |
| [MPLP-PROF-MAP](https://docs.mplp.io/profiles/map-profile) | Multi-Agent Platform (MAP) Profile | Profile |

## 3. Schemas & Registries (Normative Authority)

The JSON Schemas located in the `schemas/` directory of the official repository constitute the **authoritative machine-readable specification** of MPLP v1.0.

In case of any discrepancy between prose documentation and schema definitions, **the schema definitions SHALL prevail**.

- **Glossary**: [Standard Glossary](./glossary.md) (Canonical Definitions)
- **Schemas**: `mplp-*.schema.json`

## 4. Governance & Policies (Normative)

| Title |
|---|
| [Governance (MIPs)](../12-governance/mip-process.md) |
| [Security Policy](../12-governance/security-policy.md) |

## 5. Informative Resources (Explicit Exclusion)

The following resources are explicitly designated as **Non-Normative** and **MUST NOT** be used to derive protocol compliance requirements:

- `/guides/**` - Implementation Guides
- `/examples/**` - Example Code
- `/sdk/**` - SDK Documentation
- `/release/**` - Release Notes

## Recommended Citation

> MPLP Governance Committee. (2025). *Multi-Agent Lifecycle Protocol (MPLP) v1.0*. https://docs.mplp.io.

## Change Management

Changes to this Normative Corpus must follow the [MIP (MPLP Improvement Proposal)](../governance/mip-process) process.
