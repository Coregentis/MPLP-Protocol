---
title: Runtime Glue Overview
description: Overview of MPLP Runtime Glue (L3). Defines how protocol elements are realized at runtime through the Project Semantic Graph (PSG) and event emission.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, Runtime Glue Overview, MPLP L3, Project Semantic Graph, PSG, runtime specification, event emission, graph consistency]
sidebar_label: Runtime Glue Overview
sidebar_position: 1
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

---
## 1. Scope & Position

### 1.1 What is Runtime Glue (L3)?

**Runtime Glue** is the specification layer that defines how MPLP protocol elements are realized at runtime through the **Project Semantic Graph (PSG)**.

**Layer Hierarchy**:
- **L1/L2**: Define static schemas and module semantics (Context, Plan, Confirm, Trace, etc.)
- **Profiles (SA/MAP)**: Define how agents execute and coordinate
- **Runtime Glue (L3)**: Defines how runtime reads/writes the PSG and emits Observability events
- **PSG**: The single source of truth for project state

### 1.2 Why Runtime Glue Matters

Without Runtime Glue specifications:
- Each runtime implementation would interpret L2 modules differently
- PSG structure would be inconsistent across vendors
- Observability events would be emitted arbitrarily
- Learning samples would be collected inconsistently

With Runtime Glue:
- Uniform PSG structure across compliant runtimes
- Predictable event emission patterns
- Consistent learning sample collection
- Auditable runtime behavior

---

## 2. Core Responsibilities of L3 Glue

### 2.1 Normalize Inputs
**Map L2 objects into PSG nodes and edges**

Example: When a `Plan` object is created:
1. Runtime reads `Plan.plan_id`, `Plan.context_id`, `Plan.steps[]`
2. Creates PSG nodes:
   - `psg.plans[plan_id]` with metadata
   - `psg.plan_steps[step_id]` for each step
3. Creates PSG edges:
   - `psg.edges[context_id plan_id]` (context-to-plan binding)
   - `psg.edges[step_i step_j]` (dependency chains)

### 2.2 Maintain Graph Consistency
**Use GraphUpdateEvent for every structural change**

compliance: **REQUIRED** (from Phase 3 - Observability Duties)

When PSG is modified:
1. Determine `update_kind`: node_add, node_update, node_delete, edge_add, edge_update, edge_delete, bulk
2. Compute `node_delta` and `edge_delta`
3. Emit `GraphUpdateEvent` with:
   - `graph_id`: PSG identifier
   - `update_kind`, `node_delta`, `edge_delta`
   - `source_module`: Which L2 module triggered the update

### 2.3 Track Pipeline Execution
**Use PipelineStageEvent for every pipeline stage transition**

**Compliance**: **REQUIRED** (from Phase 3 - Observability Duties)

When a pipeline stage changes state:
1. Identify `pipeline_id`, `stage_id`, `stage_name`, `stage_order`
2. Determine `stage_status`: pending running completed/failed/skipped
3. Emit `PipelineStageEvent` with all fields

### 2.4 Expose Learning Hooks
**Optionally produce LearningSamples based on key decisions**

**Compliance**: **RECOMMENDED** (from Phase 4 - Learning Feedback Duties)

At recommended collection points:
1. Identify sample family (intent_resolution, delta_impact, etc.)
2. Extract `input`, `state`, `output`, `meta` from L2 objects and PSG
3. Create LearningSample conforming to schemas
4. Store or stream to training pipeline

---

## 3. Layered Model

```  L1/L2: Schemas & Module Semantics  (Context, Plan, Confirm, Trace, etc.)      Profiles: Execution & Collaboration  (SA: single-agent, MAP: multi-agent)      Runtime Glue (L3): PSG Update Rules ?Phase 5 ?ModuleSG paths  ?Event emission rules  ?Learning collection triggers      PSG: Single Source of Truth  (nodes, edges, attributes, snapshots)    Observability: Event Streams  Learning: Sample Collection
```

---

## 4. In-Scope vs Out-of-Scope

### 4.1 In-Scope (Phase 5 Runtime Glue)

**Specifications for**:
1. Read/write paths between L2 objects and PSG
2. Event emission rules tied to PSG changes and pipeline stages
3. Minimal drift detection behaviors (spec-level)
4. Minimal rollback behaviors (spec-level)
5. Crosscut concern bindings (coordination, error-handling, etc.)

**Deliverables**:
- Markdown documentation
- YAML matrices/configurations
- Pseudo-code examples (in docs)

### 4.2 Out-of-Scope (Phase 5)

**NOT included**:
1. Concrete runtime implementation details (framework, language)
2. Storage engine choice for PSG (graph DB, document DB, file system)
3. Full enterprise-grade rollback strategies (HA/DR, 2PC, saga patterns)
4. Vendor-specific optimizations or extensions
5. Actual executable code (`.ts`, `.py`, `.go` files)

**Reason**: Phase 5 is **specification layer**, not implementation layer. Implementations belong in `@mplp/reference-runtime`, TracePilot, Coregentis, or other products.

---

## 5. Key Design Principles

### 5.1 PSG as Single Source of Truth

**Principle**: All runtime state understanding MUST derive from PSG, not scattered in-memory caches.

**Implications**:
- L2 objects are **projections** of PSG state
- Queries (e.g., "what plans exist?") query PSG, not temporary structures
- Drift is detected by comparing PSG to intended state

### 5.2 Event-Driven Observability

**Principle**: Every significant PSG change emits a structured event.

**Implications**:
- GraphUpdateEvent for structural changes (REQUIRED)
- PipelineStageEvent for execution flow (REQUIRED)
- RuntimeExecutionEvent for agent/tool/LLM invocations (RECOMMENDED)
- Other events as defined in Phase 3

### 5.3 Learning as Optional Enrichment

**Principle**: Learning sample collection is RECOMMENDED but not REQUIRED for v1.0 compliance.

**Implications**:
- Runtimes MAY skip learning sample collection
- IF collected, samples MUST conform to Phase 4 schemas
- Collection does NOT block execution flow

### 5.4 Minimal Compliance, Maximum Extensibility

**Principle**: v1.0 defines minimum viable behaviors, vendors can extend.

**Implications**:
- Drift detection: minimum = compare PSG snapshots
- Rollback: minimum = restore PSG snapshot
- Vendors can add sophisticated strategies (ML-based drift, saga transactions, etc.)

---

## 6. Relationship to Previous Phases

| Phase | Contribution | Runtime Glue Integration |
|-------|-------------|--------------------------|
| **Phase 1: SA Profile** | Single-agent execution semantics | Defines how SA steps PSG trace nodes |
| **Phase 2: MAP Profile** | Multi-agent coordination semantics | Defines how MAP sessions PSG collab nodes |
| **Phase 3: Observability** | Event taxonomy + emission obligations | Specifies WHEN to emit which events |
| **Phase 4: Learning** | LearningSample data formats | Specifies WHEN to collect which samples |
| **Phase 5: Runtime Glue** | **Unifies all above into PSG-centric model** | You are here |

---

## 7. ModuleSG Paths (Summary)

See [`module-psg-paths.md`](module-psg-paths.md) for complete matrix.

**High-Level Mapping**:

| L2 Module | PSG Areas Touched | Access Mode |
|-----------|-------------------|-------------|
| Context | project_root, environment, constraints | READ-WRITE |
| Plan | plans, plan_steps, dependencies | READ-WRITE |
| Confirm | approval_nodes, decision_edges | READ-WRITE |
| Trace | execution_traces, spans | WRITE |
| Role | agent_roles, role_assignments | READ-WRITE |
| Extension | tool_adapters, plugins | READ-WRITE |
| Dialog | dialog_threads, messages | READ-WRITE |
| Collab | collaboration_sessions, handoffs | READ-WRITE |
| Core | orchestration_nodes, governance | READ-WRITE |
| Network | external_endpoints, integrations | READ-WRITE |

---

## 8. CrosscutSG & Events (Summary)

See [`crosscut-psg-event-binding.md`](crosscut-psg-event-binding.md) for complete bindings.

**MPLP's 9 Crosscuts**:
1. **coordination**: Collab sessions, MAP events
2. **error-handling**: Failure nodes, PipelineStageEvent (failed)
3. **event-bus**: All Observability events
4. **orchestration**: Pipeline control, PipelineStageEvent
5. **performance**: Timing metrics, CostAndBudgetEvent
6. **protocol-version**: PSG version annotations
7. **security**: Access control in PSG
8. **state-sync**: PSG as sync target, GraphUpdateEvent
9. **transaction**: Batch updates, GraphUpdateEvent (bulk)

---

## 9. Drift Detection & Rollback (Summary)

See:
- [`drift-and-rollback.md`](drift-and-rollback.md)
- [`drift-and-rollback.md`](drift-and-rollback.md)

**Minimal Requirements**:
- **Drift Detection**: Compare PSG snapshots at milestones, flag discrepancies
- **Rollback**: Restore PSG from snapshot on failure/rejection

---

## 10. Compliance Notes

### 10.1 v1.0 Protocol Compliance

**Runtime implementations claiming "MPLP v1.0 compatible" MUST**:
1. Document their ModuleSG mapping (which PSG areas each module touches)
2. Emit `GraphUpdateEvent` for all PSG structural changes (REQUIRED)
3. Emit `PipelineStageEvent` for all pipeline stage transitions (REQUIRED)
4. Use PSG as single source of truth (not scattered caches)

**Runtime implementations SHOULD**:
-  Implement minimal drift detection (compare PSG snapshots)
-  Support basic rollback (restore PSG snapshot)
-  Emit RuntimeExecutionEvent for agent/tool/LLM calls
-  Collect LearningSamples at recommended triggers

**NOT REQUIRED for v1.0**:
- Specific PSG storage engine
- Enterprise-grade HA/DR
- ML-based drift prediction
- Saga/2PC transaction patterns

---

## 11. References

**Phase 5 Documents**:
- [ModuleSG Paths Matrix](module-psg-paths.md)
---

**End of MPLP Runtime Glue Overview**

*Runtime Glue establishes the specification layer for how MPLP protocol elements are realized through PSG-centric runtime implementations, ensuring consistency and interoperability across vendors while maintaining extensibility.*
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
