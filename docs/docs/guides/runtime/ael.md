---
sidebar_position: 3

doc_type: reference
normativity: informative
status: draft
authority: none
description: "Non-authoritative runtime concept page for the Action Execution Layer (AEL)."
title: AEL - Action Execution Layer

---

# AEL - Action Execution Layer

> **Status**: Draft runtime concept page  
> **Authority**: Non-authoritative documentation surface  
> **Boundary**: This page describes AEL as a runtime execution abstraction. It
> does not define provider-specific adapters or a single required execution
> engine.

## 1. Purpose

AEL, or **Action Execution Layer**, is the runtime-side abstraction responsible
for carrying out actions that have side effects or require external execution.

Typical runtime actions include:

- LLM calls
- tool invocations
- agent-to-agent handoff execution
- external side-effect execution under runtime control

## 2. Boundary

This page does **not** define:

- a required OpenAI adapter
- a required Anthropic adapter
- a required Docker executor
- a universal retry policy
- a mandated sandbox product

Those belong to runtime or product implementations.

## 3. Relation to Protocol Truth

The protocol defines lifecycle objects, invariants, and event families.

Runtimes use AEL-like logic to execute actions while staying within those
protocol constraints. AEL is therefore a runtime realization concept, not a
protocol schema object.

## 4. Minimal Runtime Artifact Surface

The current published runtime package includes a minimal `InMemoryAEL` artifact
surface in `@mplp/runtime-minimal`.

That artifact is a minimal runtime helper, not a claim that MPLP standardizes a
single production execution engine.

## 5. Implementation Reading

The safest reading of AEL in MPLP is:

- it is the runtime-side execution abstraction
- it may execute tools, models, or other actions
- it should remain observable and bounded by runtime policy
- it is not itself protocol truth

## 6. References

- [Runtime Glue Overview](runtime-glue-overview.md)
- [PSG - Project Semantic Graph](psg.md)
- `packages/npm/runtime-minimal/`

---

**Final Boundary**: AEL is a runtime execution concept. It is not a protocol
object definition and not a claim about one specific provider/runtime stack.
