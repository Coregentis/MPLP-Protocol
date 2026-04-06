---
sidebar_position: 4

doc_type: reference
normativity: informative
status: draft
authority: none
description: "Non-authoritative runtime concept page for the Value State Layer (VSL)."
title: VSL - Value State Layer

---

# VSL - Value State Layer

> **Status**: Draft runtime concept page  
> **Authority**: Non-authoritative documentation surface  
> **Boundary**: This page describes VSL as a runtime persistence abstraction. It
> does not define a protocol object or mandate one storage architecture.

## 1. Purpose

VSL, or **Value State Layer**, is the persistence abstraction used by a runtime
to store and retrieve state.

Typical runtime uses include:

- persisting runtime state snapshots
- persisting event-related state
- supporting restore/recovery paths
- backing higher-level logical models such as PSG

## 2. Boundary

This page does **not** define:

- one mandatory VSL interface for all runtimes
- one required backend such as Redis, Postgres, filesystem, or object store
- one required transaction model
- one required snapshot format

## 3. Relation to PSG

PSG and VSL are related but distinct:

- PSG is the logical state model
- VSL is the persistence/storage abstraction a runtime may use underneath

This page does not claim that VSL itself carries protocol semantics. Those
semantics remain in schema, invariants, and runtime logic.

## 4. Minimal Runtime Artifact Surface

The current published runtime package includes a minimal `InMemoryVSL` artifact
surface in `@mplp/runtime-minimal`.

That package artifact is useful for tests and examples, but it should not be
misread as the only valid VSL design for MPLP.

## 5. Implementation Reading

The safest reading of VSL in MPLP is:

- a runtime persistence abstraction
- potentially used for snapshots, event accumulation, or state restoration
- not itself a protocol truth source
- not itself the semantic layer

## 6. References

- [PSG - Project Semantic Graph](psg.md)
- [Runtime Glue Overview](runtime-glue-overview.md)
- [Drift and Rollback](drift-and-rollback.md)
- `packages/npm/runtime-minimal/`

---

**Final Boundary**: VSL is a runtime persistence concept. It is not a standalone
protocol object and not a mandated storage implementation.
