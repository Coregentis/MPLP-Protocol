---
sidebar_position: 8

title: Runtime Reference Skeleton
description: Illustrative runtime skeleton for local guide use; not a protocol contract.
status: draft
doc_type: guide
normativity: informative
authority: Documentation Governance
---

# Runtime Reference Skeleton

> [!NOTE]
> **Illustrative Guide Material**
>
> This directory contains illustrative runtime-guide material only. It does not
> define a protocol contract, a frozen profile, or a required implementation
> shape.

## Purpose

The files in this directory provide a lightweight skeleton for readers who want
to sketch a runtime-oriented evidence path while staying subordinate to the
repaired specification/reference surfaces.

## Scope

This skeleton is:

- illustrative
- non-executable as published guide material
- subordinate to repaired protocol pages
- useful only as local implementation scaffolding

The historical label `Profile-14-Golden` remains local guide wording here. It
must not be read as a frozen MPLP profile identity.

## Contents

- [`runtime.ts`](./runtime.ts) — illustrative runtime scaffold
- [`events.ts`](./events.ts) — illustrative event-shape helpers
- [`sinks.ts`](./sinks.ts) — illustrative persistence/output helpers
- [`evidence-pack.ts`](./evidence-pack.ts) — illustrative artifact naming helpers

## Non-Goals

This skeleton does not define:

- a protocol profile
- a conformance contract
- a required evidence-emission model
- a required runtime architecture

## Read First

Before using this guide material, read:

1. [Modules Overview](/docs/specification/modules)
2. [Profiles Overview](/docs/specification/profiles)
3. [Observability Overview](/docs/specification/observability)
4. [Runtime Guides Overview](/docs/guides/runtime)

---

**Final Boundary**: this skeleton is illustrative guide material only and is
not part of frozen protocol doctrine.
