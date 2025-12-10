---
title: PSG — Project Semantic Graph
description: The Project Semantic Graph (PSG) is the single source of truth for all project state in MPLP.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, PSG, Project Semantic Graph, state, graph, nodes, edges]
sidebar_label: PSG — Project Semantic Graph
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# PSG — Project Semantic Graph

> [!IMPORTANT]
> **SOT Definition**: The Project Semantic Graph (PSG) is the OS-level semantic filesystem for intents, plans, deltas, documents, code, and traces. It prevents drift and ensures reproducibility.

## 1. Definition

The **Project Semantic Graph (PSG)** is the runtime state substrate of MPLP. It is a directed property graph that stores:

*   **Entities**: Contexts, Plans, Steps, Agents, Resources, Artifacts.
*   **Relationships**: Dependencies, Ownership, Traceability, Confirmation.
*   **State**: Current status, history, and drift markers.

Unlike traditional file systems or databases, the PSG enforces **semantic integrity** — you cannot create a "Step" without a parent "Plan", nor a "Trace" without a "Context".

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

The PSG acts as the **Shared Memory** for the Agent OS.

1.  **AEL (Action Execution Layer)** reads from PSG to know what to do.
2.  **VSL (Value State Layer)** updates PSG with scores and permissions.
3.  **Observability** watches PSG for changes to emit events.

## 4. Compliance

All MPLP-compliant runtimes must maintain a PSG that is:
*   **Serializable**: Can be exported to JSON/YAML.
*   **Event-Sourced**: All changes emit `GraphUpdateEvent`.
*   **Drift-Aware**: Can detect when reality diverges from the graph.
