---
sidebar_position: 1

doc_type: guide
normativity: informative
status: draft
authority: Documentation Governance
description: "Informative runtime guide for how implementation-side glue can sit between repaired MPLP specification surfaces and runtime artifacts."
title: Runtime Glue Overview
keywords: [MPLP, Runtime, PSG, Glue Layer, Observability]
sidebar_label: Runtime Glue Overview
---

# Runtime Glue Overview

> [!NOTE]
> **Guide, Not Protocol Definition**
>
> This page describes an implementation-side runtime concept. It does not define
> a frozen MPLP specification layer and it does not override repaired
> specification/reference pages.

## 1. Purpose

This guide explains how teams may think about **runtime glue** when connecting
protocol artifacts to runtime behavior.

In this docs set, "runtime glue" is only a guide-level label for implementation
coordination across concepts such as:

- protocol object artifacts
- runtime-side state handling
- runtime-side event emission
- implementation-side recovery or adaptation logic

## 2. Boundary

Runtime glue is downstream of the repaired protocol baseline:

1. read [Modules Overview](/docs/specification/modules) first
2. read [Profiles Overview](/docs/specification/profiles) next
3. read [Observability Overview](/docs/specification/observability) next
4. only then use runtime guides such as this page

This page does **not** define:

- PSG as a protocol core object
- VSL or AEL as frozen protocol interfaces
- drift or rollback as protocol-mandated algorithms
- a required runtime architecture

## 3. Guide-Level Use

Teams may use a runtime-glue layer to:

- connect protocol artifacts to runtime data structures
- organize event emission around repaired observability sources
- isolate implementation-specific coordination code from protocol artifacts
- keep runtime-specific behavior subordinate to repaired protocol semantics

## 4. Related Runtime Guides

- [PSG](/docs/guides/runtime/psg.md)
- [VSL](/docs/guides/runtime/vsl.md)
- [AEL](/docs/guides/runtime/ael.md)
- [Module-PSG Paths](/docs/guides/runtime/module-psg-paths.md)
- [CrossCut-PSG Event Binding](/docs/guides/runtime/crosscut-psg-event-binding.md)
- [Drift and Rollback](/docs/guides/runtime/drift-and-rollback.md)

## 5. References

- [L3 Execution & Orchestration](/docs/specification/architecture/l3-execution-orchestration.md)
- [Runtime Authority](/docs/guides/runtime/runtime-authority.md)
- [Runtime Capability Matrix](/docs/guides/runtime/runtime-capability-matrix.md)

---

**Final Boundary**: runtime glue is an implementation-side guide concept only.
It is not part of the frozen protocol SSOT.
