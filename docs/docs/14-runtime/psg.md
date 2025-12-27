---
doc_type: normative
status: frozen
authority: MPGC
description: ""
title: PSG 鈥?Project Semantic Graph
---


> **Scope**: Inherited (from /docs/14-runtime/)
> **Non-Goals**: Inherited (from /docs/14-runtime/)

# PSG 鈥?Project Semantic Graph

> **Status**: Normative
> **Version**: 1.0.0
> **Authority**: MPGC
> **Protocol**: MPLP v1.0.0 (Frozen)

## 1. Scope

This specification defines the normative requirements for **PSG 鈥?Project Semantic Graph**.

## 2. Non-Goals

This specification does not mandate specific implementation details beyond the defined interfaces and invariants.

## 1. Definition

The **Project Semantic Graph (PSG)** is the runtime state substrate of MPLP. It is a directed property graph that stores:

*   **Entities**: Contexts, Plans, Steps, Agents, Resources, Artifacts.
*   **Relationships**: Dependencies, Ownership, Traceability, Confirmation.
*   **State**: Current status, history, and drift markers.

Unlike traditional file systems or databases, the PSG enforces **semantic integrity** 鈥?you cannot create a "Step" without a parent "Plan", nor a "Trace" without a "Context".

## 2. Core Nodes & Edges

### 2.1 Nodes
*   `ContextNode`: Root of a lifecycle.
*   `PlanNode`: A sequence of proposed actions.
*   `StepNode`: Atomic unit of work.
*   `AgentNode`: Identity of an actor.
*   `ArtifactNode`: A file, document, or resource.

### 2.2 Edges
*   `HAS_CONTEXT`: Links Plan -> Context.
*   `DEPENDS_ON`: Links Step B -> Step A.
*   `ASSIGNED_TO`: Links Step -> Agent.
*   `PRODUCED`: Links Step -> Artifact.

## 3. Runtime Role