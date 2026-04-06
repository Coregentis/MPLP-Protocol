---
sidebar_position: 2

doc_type: reference
normativity: informative
status: draft
authority: none
description: "Non-authoritative runtime concept page for the Project Semantic Graph (PSG)."
title: PSG - Project Semantic Graph
keywords: [MPLP, PSG, Project Semantic Graph, Runtime, State Graph]
sidebar_label: PSG - Project Semantic Graph

---

# PSG - Project Semantic Graph

> **Status**: Draft runtime concept page  
> **Authority**: Non-authoritative documentation surface  
> **Boundary**: PSG is described here as a runtime concept and logical state
> model. This page does not define a mandated physical implementation.

## 1. Purpose

PSG, or **Project Semantic Graph**, is the logical runtime model used to
organize MPLP protocol objects and their relations.

In practical terms, runtimes may use PSG to represent:

- protocol objects such as Context, Plan, Confirm, Trace, Role, Collab, Dialog,
  Extension, and Network
- relations between those objects
- the runtime's current view of project state

## 2. Boundary

This page does **not** claim that MPLP mandates:

- one specific graph database
- one specific in-memory graph engine
- one specific node/edge implementation
- one universal runtime graph library

PSG is best understood as a **logical state model / runtime contract concept**,
not as a single required storage product.

## 3. Relation to Protocol Truth

Repository-backed schemas remain the truth source for protocol object structure.

PSG sits one layer lower in runtime realization:

- schemas define what the objects are
- runtimes decide how those objects are represented and related internally
- PSG is a common way to talk about that internal logical representation

## 4. Typical Runtime Role

Runtimes commonly use PSG-like structures to:

- track object identity and linkage
- reconcile state across modules
- support traceability and drift detection
- support state snapshots or state reconstruction

Those are runtime responsibilities, not standalone protocol objects.

## 5. Common Mapping Examples

Typical logical mappings include:

- Context as a root scope node
- Plan as a node linked to its Context
- Trace as a node linked to Context and optionally Plan
- Confirm as a node linked to its target object
- Collab as a node representing collaboration session state

This page intentionally avoids defining one canonical node taxonomy beyond those
schema-grounded associations.

## 6. Relation to VSL

PSG and VSL should not be collapsed into one concept.

- PSG: logical state model / semantic runtime view
- VSL: persistence abstraction used by a runtime

A runtime may implement PSG on top of VSL, but the protocol does not require one
physical pattern for doing so.

## 7. References

- `schemas/v2/*.schema.json`
- [Runtime Glue Overview](runtime-glue-overview.md)
- [Value State Layer](vsl.md)
- [Drift and Rollback](drift-and-rollback.md)

---

**Final Boundary**: PSG is a runtime-facing logical state model. It is not a
separate L0 schema object and not a mandated physical storage implementation.
