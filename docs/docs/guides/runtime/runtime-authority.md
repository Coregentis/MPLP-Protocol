---

title: Runtime Authority & Scope
sidebar_label: Authority & Scope
sidebar_position: 1
doc_type: reference
normativity: informative
status: draft
authority: none
audience: implementer

description: "Non-authoritative runtime boundary page describing what an MPLP runtime may do and what it must not claim."
---


# Runtime Authority & Scope

> **Status**: Draft runtime boundary page  
> **Authority**: Non-authoritative documentation surface

## Scope

This document describes the **bounded authority and execution role**
of MPLP runtime surfaces.

## Allowed Capabilities

An MPLP runtime may, for example:

- execute plans or steps
- persist runtime state
- emit runtime evidence
- produce schema-conformant protocol objects
- support runtime-local orchestration and recovery logic

## Explicit Non-Goals

A runtime does **not** gain authority to:

- redefine protocol semantics
- redefine schemas or invariants
- claim certification, endorsement, or compliance outcomes
- supersede repository truth
- turn implementation choices into protocol facts

## Authority Boundaries

The runtime surface must be understood as:

- implementation-facing
- evidence-producing
- bounded by protocol truth defined elsewhere

It must **not** be described as the authoritative truth source for MPLP.

## References

- [Runtime Glue Overview](runtime-glue-overview.md)
- [PSG - Project Semantic Graph](psg.md)
- [VSL - Value State Layer](vsl.md)
- [AEL - Action Execution Layer](ael.md)

---

**Final Boundary**: runtime surfaces may execute and emit evidence, but they do
not define protocol truth.
