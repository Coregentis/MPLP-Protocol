---
sidebar_position: 3
doc_type: reference
normativity: informative
status: active
authority: none
description: "Informative orientation to MPLP v1.0 and the canonical reading path into specification and reference surfaces."
title: Protocol Overview
---

# Protocol Overview

> [!NOTE]
> **Informative Orientation**
>
> This page is an entry surface for reading order and boundary clarification. It
> does not replace repository-backed schemas, invariants, constitutional source
> files, or the schema-backed specification pages linked below.

## 1. Purpose

This page summarizes MPLP at a high level and routes readers toward the
canonical specification and reference surfaces.

The **Multi-Agent Lifecycle Protocol (MPLP)** is a vendor-neutral,
schema-first protocol for representing, governing, observing, and auditing AI
agent lifecycle workflows.

MPLP defines protocol semantics, protocol object families, profile baselines,
invariants, and event structures. Runtime implementations execute workflows;
products package those runtimes for specific use cases.

## 2. Canonical Distinctions

### 2.1 Protocol vs Runtime vs Product

- **Protocol**: repository-backed schemas, invariants, profile manifests, and
  approved governance records
- **Runtime**: an implementation that realizes the protocol
- **Product**: a packaged system built on top of one or more runtimes

MPLP is the protocol layer. It is not itself a runtime, framework, hosted
service, or product.

### 2.2 Protocol Objects vs Runtime Concepts

Protocol object families such as Context, Plan, Confirm, Trace, Role, Dialog,
Collab, Extension, Core, and Network belong to the schema-backed specification
baseline.

Runtime concepts such as PSG, AEL, VSL, drift detection, and runtime glue are
implementation-layer concepts. They should not be read as protocol core objects.

### 2.3 Specification/Reference vs Guides

- **Specification / reference surfaces** establish the formal reading path
- **Guides** explain implementation patterns after the specification baseline is
  clear

### 2.4 Evaluation vs Adjudication

- **Evaluation docs** explain conformance, evidence, and test/reference models
- **Validation Lab** adjudicates evidence against rulesets and publishes
  determination outputs

## 3. Canonical-First Reading Path

Use this order when reading MPLP:

1. [Entry Points](/docs/reference/entrypoints)
   Surface roles and authority boundaries.
2. [Specification](/docs/specification)
   Formal reading path into modules, profiles, observability, architecture, and
   integration.
3. [Evaluation & Governance](/docs/evaluation)
   Conformance, evidence, Validation Lab reference, and governance-facing
   evaluation surfaces.
4. [Guides](/docs/guides)
   Runtime, SDK, and example guidance after the specification/reference
   baseline is clear.

## 4. Specification Reading Map

For the formal baseline, use these section indexes first:

| Surface | Read First For |
|:---|:---|
| [Modules](/docs/specification/modules) | Protocol object families and their schema-centered projections |
| [Profiles](/docs/specification/profiles) | SA and MAP profile baselines plus linked event surfaces |
| [Observability](/docs/specification/observability) | Event families, observability invariants, and trace/export references |
| [Architecture](/docs/specification/architecture) | Layer relationships and structural framing after object/profile reading |
| [Integration](/docs/specification/integration) | L4 event and integration surfaces |

## 5. Package and Runtime Boundaries

Published package surfaces and runtime guides are downstream of the protocol
baseline.

- Use [TypeScript SDK Guide](/docs/guides/sdk/ts-sdk-guide) and
  [Python SDK Guide](/docs/guides/sdk/py-sdk-guide) for current package-surface
  guidance.
- Use [Runtime Guides](/docs/guides/runtime) for runtime realization patterns.
- Do not infer protocol meaning from package exports or runtime guide examples
  when the repository-backed specification says otherwise.

## 6. Quick Navigation

- [Specification](/docs/specification)
- [Modules](/docs/specification/modules)
- [Profiles](/docs/specification/profiles)
- [Observability](/docs/specification/observability)
- [Evaluation & Governance](/docs/evaluation)
- [Guides](/docs/guides)
