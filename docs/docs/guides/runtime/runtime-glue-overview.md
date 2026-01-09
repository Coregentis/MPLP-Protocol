---
sidebar_position: 1

doc_type: normative
normativity: normative
status: frozen
authority: MPGC
description: "Runtime Glue Overview - L3 specification layer for MPLP."
title: Runtime Glue Overview
keywords: [MPLP, Runtime, L3, PSG, Glue Layer, Observability]
sidebar_label: Runtime Glue Overview

---


# Runtime Glue Overview


## 1. Purpose

This document defines the **L3 Runtime Glue** specification layer for MPLP. Runtime Glue is the binding layer between:

- **L2 Modules** (Context, Plan, Trace, etc.)
- **Protocol State Graph (PSG)**
- **Observability Events**
- **Learning Hooks**

**Key Principle**: Runtime Glue is a **specification layer**, not an implementation. Concrete implementations belong in SDKs and products.

## 2. Scope

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

## 3. Non-Goals

**NOT included**:
1. Concrete runtime implementation details (framework, language)
2. Storage engine choice for PSG (graph DB, document DB, file system)
3. Full enterprise-grade rollback strategies (HA/DR, 2PC, saga patterns)
4. Vendor-specific optimizations or extensions
5. Actual executable code (`.ts`, `.py`, `.go` files)

**Reason**: L3 is the **specification layer**, not implementation layer. Implementations belong in `@mplp/reference-runtime`, TracePilot, Coregentis, or other products.

---

## 4. Core Responsibilities

### 4.1 Normalize Inputs

**Map L2 objects into PSG nodes and edges**

Example: When a `Plan` object is created:
1. Runtime reads `Plan.plan_id`, `Plan.context_id`, `Plan.steps[]`
2. Creates PSG nodes:
   - `psg.plans[plan_id]` with metadata
   - `psg.plan_steps[step_id]` for each step
3. Creates PSG edges:
   - `psg.edges[context_id -> plan_id]` (context-to-plan binding)
   - `psg.edges[step_i -> step_j]` (dependency chains)

### 4.2 Maintain Graph Consistency

**Use GraphUpdateEvent for every structural change**

**Conformance**: **REQUIRED** (from Phase 3 - Observability Duties)

When PSG is modified:
1. Determine `update_kind`: node_add, node_update, node_delete, edge_add, edge_update, edge_delete, bulk
2. Compute `node_delta` and `edge_delta`
3. Emit `GraphUpdateEvent` with:
   - `graph_id`: PSG identifier
   - `update_kind`, `node_delta`, `edge_delta`
   - `source_module`: Which L2 module triggered the update

### 4.3 Track Pipeline Execution

**Use PipelineStageEvent for every pipeline stage transition**

**Conformance**: **REQUIRED** (from Phase 3 - Observability Duties)

When a pipeline stage changes state:
1. Identify `pipeline_id`, `stage_id`, `stage_name`, `stage_order`
2. Determine `stage_status`: pending → running → completed/failed/skipped
3. Emit `PipelineStageEvent` with all fields

### 4.4 Expose Learning Hooks

**Optionally produce LearningSamples based on key decisions**

**Conformance**: **RECOMMENDED** (from Phase 4 - Learning Feedback Duties)

At recommended collection points:
1. Identify sample family (intent_resolution, delta_impact, etc.)
2. Extract `input`, `state`, `output`, `meta` from L2 objects and PSG
3. Create LearningSample conforming to schemas
4. Store or stream to training pipeline

---

## 5. Relationship to Protocol Phases

| Phase | Contribution | Runtime Glue Integration |
|:---|:---|:---|
| **Phase 1: SA Profile** | Single-agent execution semantics | Defines how SA steps → PSG trace nodes |
| **Phase 2: MAP Profile** | Multi-agent coordination semantics | Defines how MAP sessions → PSG collab nodes |
| **Phase 3: Observability** | Event taxonomy + emission obligations | Specifies WHEN to emit which events |
| **Phase 4: Learning** | LearningSample data formats | Specifies WHEN to collect which samples |
| **Phase 5: Runtime Glue** | **Unifies all above into PSG-centric model** | You are here |

---

## 6. Crosscut Bindings (Summary)

See [Crosscut PSG Event Binding](crosscut-psg-event-binding.md) for complete bindings.

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

## 7. Conformance Requirements

### 7.1 MUST Requirements (v1.0)

Runtime implementations claiming "MPLP v1.0 conformant" **MUST**:

1. Document their ModulePSG mapping (which PSG areas each module touches)
2. Emit `GraphUpdateEvent` for all PSG structural changes
3. Emit `PipelineStageEvent` for all pipeline stage transitions
4. Use PSG as single source of truth (not scattered caches)

### 7.2 SHOULD Requirements (v1.0)

Runtime implementations **SHOULD**:

- Implement minimal drift detection (compare PSG snapshots)
- Support basic rollback (restore PSG snapshot)
- Emit RuntimeExecutionEvent for agent/tool/LLM calls
- Collect LearningSamples at recommended triggers

### 7.3 NOT Required for v1.0

- Specific PSG storage engine
- Enterprise-grade HA/DR
- ML-based drift prediction
- Saga/2PC transaction patterns

---

## 8. Related Documents

- [Module PSG Paths](module-psg-paths.md)
- [Crosscut PSG Event Binding](crosscut-psg-event-binding.md)
- [PSG Overview](psg.md)
- [Action Execution Layer](ael.md)
- [Value State Layer](vsl.md)
- [Drift and Rollback](drift-and-rollback.md)

---

**Layer**: L3 (Specification)  
**Key Events**: GraphUpdateEvent (REQUIRED), PipelineStageEvent (REQUIRED)

*Runtime Glue establishes the specification layer for how MPLP protocol elements are realized through PSG-centric runtime implementations, ensuring consistency and interoperability across vendors while maintaining extensibility.*