---
sidebar_position: 6

doc_type: reference
normativity: informative
status: draft
authority: none
description: "Illustrative runtime reference for how modules may map to PSG areas."
title: Module PSG Paths
keywords: [MPLP, PSG, Module Paths, Runtime]
sidebar_label: Module PSG Paths

---

# Module PSG Paths

> **Status**: Draft runtime reference  
> **Authority**: Non-authoritative documentation surface  
> **Boundary**: This page illustrates one way runtimes may map module objects to
> PSG areas. It does not define a canonical PSG layout.

## 1. Purpose

This page provides an illustrative mapping between MPLP module objects and the
kind of PSG areas a runtime may choose to maintain.

It is useful for:

- runtime designers
- implementation reviewers
- readers trying to understand how module objects may be represented internally

It is not itself protocol truth.

## 2. Reading Rule

The authoritative order remains:

1. repository-backed schemas
2. invariants and taxonomy
3. runtime/specification pages such as Runtime Glue
4. this illustrative mapping page

If this page suggests a PSG area or runtime structure that exceeds those upstream
sources, the upstream sources prevail.

## 3. Illustrative Mapping Summary

| Module | Common Runtime Mapping Idea | Boundary |
|:---|:---|:---|
| Context | scope/root state nodes | runtime representation only |
| Plan | plan and step state nodes | runtime representation only |
| Confirm | approval/decision state nodes | runtime representation only |
| Trace | trace/span state nodes | runtime representation only |
| Role | capability/assignment state nodes | runtime representation only |
| Dialog | thread/message state nodes | runtime representation only |
| Collab | collaboration/session state nodes | runtime representation only |
| Extension | extension/config state nodes | runtime representation only |
| Core | runtime manifest/governance state nodes | runtime representation only |
| Network | topology/endpoint state nodes | runtime representation only |

## 4. What This Page Does Not Claim

This page does **not** claim that MPLP mandates:

- specific PSG area names
- specific node labels
- specific edge labels
- one required ownership model
- one required event hook per local runtime action

Those are runtime design choices constrained by the protocol, not fully dictated
by it.

## 5. Safe Use

Use this page as:

- a design aid
- a review checklist prompt
- a vocabulary bridge between module pages and runtime pages

Do **not** use it as:

- a replacement for schema truth
- a canonical node/edge contract
- a justification for product-specific runtime claims being treated as protocol facts

## 6. References

- [Runtime Glue Overview](runtime-glue-overview.md)
- [PSG - Project Semantic Graph](psg.md)
- [Crosscut PSG Event Binding](crosscut-psg-event-binding.md)
- `schemas/v2/*.schema.json`

---

**Final Boundary**: this page is an illustrative runtime mapping aid. It does
not define the canonical PSG implementation model.
