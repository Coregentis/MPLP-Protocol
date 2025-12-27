---
doc_type: governance
status: frozen
authority: Documentation Governance
description: "**ID**: DGP-XX **Version**: 1.0 **Stat..."
canonical: /docs/12-governance/evidence-chain
title: Evidence Chain Specification
---

# Evidence Chain Specification

**ID**: DGP-XX
**Version**: 1.0
**Status**: FROZEN
**Authority**: Documentation Governance
**Last Updated**: 2025-12-21

## 1. Definition

The **Evidence Chain** is a cryptographically linked sequence of protocol objects that prove the "Who, What, When, and Why" of every agent action.

## 2. Chain Components

| Object | Evidence Provided |
|:---|:---|
| **Context** | The initial intent and constraints |
| **Plan** | The intended sequence of actions |
| **Confirm** | Explicit authorization for high-risk steps |
| **Trace** | The actual execution record and outcomes |

## 3. Linking Mechanism

Objects are linked via `Ref` fields and `trace_id` bindings. A complete evidence chain allows an auditor to reconstruct the entire lifecycle of an agent request from a single `trace_id`.