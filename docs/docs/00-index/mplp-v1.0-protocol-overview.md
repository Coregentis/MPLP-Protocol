---
title: Protocol Overview
description: Complete overview of MPLP v1.0 - the vendor-neutral protocol for
  multi-agent AI systems. Covers 4-layer architecture, 10 core modules, 12 event
  families, and compliance requirements.
keywords:
  - MPLP overview
  - multi-agent protocol
  - protocol architecture
  - L1 L2 L3 L4
  - core modules
  - observability
  - SA Profile
  - MAP Profile
sidebar_label: Protocol Overview
doc_status: normative
doc_role: normative_index
protocol_version: 1.0.0
spec_level: L1
normative_id: MPLP-PROTOCOL-OVERVIEW
permalink: /00-index/mplp-v1.0-protocol-overview
normative_refs: []
protocol_alignment:
  truth_level: T2
  protocol_version: 1.0.0
  schema_refs:
    - schema_id: https://schemas.mplp.dev/v1.0/mplp-core.schema.json
      binding: manual
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes:
    - Manual binding applied per Remediation Option A/B.
  doc_status: normative
sidebar_position: 1
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# MPLP Protocol v1.0 Overview

## 1. Purpose

The **Multi-Agent Lifecycle Protocol (MPLP) v1.0** is a vendor-neutral, schema-driven specification for defining, executing, and auditing multi-agent AI systems.  It establishes a standardized interoperability layer for governing the complete lifecycle of agentic workflowsrom project initialization and planning through execution, observation, and learning.

MPLP addresses the transition from **Prompt Engineering** (fragile, unstructured LLM interactions) to **Protocol Engineering** (rigorous, governed, and auditable multi-agent systems). It achieves this through:

1.  **Schema-First Data Contracts** All protocol entities are defined using JSON Schema (Draft-07), ensuring precise type definitions and cross-language interoperability.
2.  **Explicit State Management** The Project Semantic Graph (PSG) serves as the single source of truth, preventing state drift.
3.  **Structured Observability** 12 event families provide deep system introspection.
4.  **Normative Governance** Invariant rules (encoded in YAML) enforce critical constraints on agent behavior.

## 2. Core Problems Addressed

### 2.1 State Drift & Inconsistency
In unstructured agent workflows, the agent's internal representation of a project often diverges from the actual state of files, repositories, or external systems. MPLP enforces a **Project Semantic Graph (PSG)** as the canonical state model, with **drift detection** mechanisms to reconcile discrepancies.

### 2.2 Orchestration & Coordination
Multi-agent systems require clear handoff protocols and turn-taking semantics. MPLP defines explicit **Execution Profiles** (Single-Agent and Multi-Agent) and a **Collab Module** to manage coordination patterns such as broadcast, round-robin, and or

chestrated execution.

### 2.3 Auditability & Compliance
Enterprise adoption of AI agents demands full traceability of actions, decisions, and failures. MPLP provides:
- **Trace Module**: Immutable audit logs linking plans to execution outcomes.
- **Observability Events**: 12 structured event families (e.g., `pipeline_stage`, `graph_update`) for real-time system monitoring.
- **Confirm Module**: Human-in-the-loop approval workflows for high-risk actions.

### 2.4 Vendor Lock-In Prevention
To enable multi-vendor agent ecosystems, MPLP:
- Uses language-agnostic JSON Schema definitions (not framework-specific APIs).
- Separates protocol semantics (L1/L2) from runtime implementation (L3).
- Allows agents from different vendors to collaborate via shared PSG state.

## 3. Four-Layer Architecture

MPLP is organized into four layers, separating concerns and enabling modular implementations:

| Layer | Name | Normative Status | Key Components |
|:---|:---|:---|:---|
| **L4** | **Integration** | Optional | IDE adapters, CI/CD hooks, Git event emitters, External tool connectors |
| **L3** | **Runtime** | Behavioral (Non-Normative) | PSG engine, Event bus, Drift detection, Rollback mechanisms |
| **L2** | **Modules & Profiles** | Normative | 10 Core Modules, SA/MAP Profiles, Cross-cutting concerns |
| **L1** | **Core Protocol** | Normative | JSON Schemas, Invariants, Type definitions, Validation rules |

**Normative vs Non-Normative**:
- **Normative (L1/L2)**: Implementations MUST conform to these definitions to be MPLP-compliant.
- **Behavioral (L3)**: Runtime implementations MAY vary (e.g., choice of database, PSG storage format), but MUST expose conformant L2 interfaces and emit required events.
- **Optional (L4)**: Integration adapters are optional but, if implemented, MUST use the defined event schemas.

## 4. Ten Core Modules (L2)

Based on `schemas/v2/*.schema.json`, MPLP defines 10 modules:

1.  **Context**: Defines project scope, environment, and root configuration (`mplp-context.schema.json`).
2.  **Plan**: Structures executable steps as a DAG, with dependency tracking (`mplp-plan.schema.json`).
3.  **Confirm**: Manages human-in-the-loop approval/rejection decisions (`mplp-confirm.schema.json`).
4.  **Trace**: Records immutable execution history with OpenTelemetry-compatible spans (`mplp-trace.schema.json`).
5.  **Role**: Defines agent capabilities, permissions, and assignments (`mplp-role.schema.json`).
6.  **Dialog**: Maintains multi-turn conversation threads for intent clarification (`mplp-dialog.schema.json`).
7.  **Collab**: Orchestrates multi-agent sessions with coordination modes (broadcast, round-robin, orchestrated) (`mplp-collab.schema.json`).
8.  **Extension**: Adapts external tools and APIs for agent use (`mplp-extension.schema.json`).
9.  **Core**: Provides central governance, module registry, and version management (`mplp-core.schema.json`).
10. **Network**: Manages topology and node status for distributed agent systems (`mplp-network.schema.json`).

## 5. Twelve Event Families (Observability)

Based on `schemas/v2/events/mplp-event-core.schema.json`, the protocol defines 12 event families for system observability:

| **Group** | **Event Family** | **Required** | **Description** |
|:---|:---|:---|:---|
| **Lifecycle** | `import_process` | No |  Project initialization and onboarding |
| **Intent & Planning** | `intent` | No | User's raw request or goal |
| | `delta_intent` | No | Modification or refinement of existing intent |
| | `methodology` | No | High-level approach selection |
| | `reasoning_graph` | No | Chain-of-thought internal reasoning |
| **Execution** | `pipeline_stage` | **YES** | Plan/Step lifecycle transitions |
| | `graph_update` | **YES** | PSG structural changes (node/edge add/remove) |
| | `runtime_execution` | No | Low-level execution details (LLM calls, tool invocations) |
| **Safety & Recovery** | `impact_analysis` | No | Predicted side-effects of a change |
| | `compensation_plan` | No | Rollback/undo strategies |
| **Cost & Integration** | `cost_budget` | No | Token usage and financial metrics |
| | `external_integration` | No | Events from L4 tools (IDE, Git, CI) |

**Compliance Requirement**: Runtimes MUST emit `pipeline_stage` and `graph_update` events to be MPLP v1.0 compliant.

## 6. Execution Profiles (SA/MAP)

### 6.1 Single-Agent Profile (SA)
**REQUIRED** for v1.0 compliance. Defined by `schemas/v2/invariants/sa-invariants.yaml`:

**Core Invariants** (8 rules):
- `sa_requires_context`: SA execution requires a valid Context with UUID v4.
- `sa_context_must_be_active`: Context status must be `active`.
- `sa_plan_context_binding`: Plan's `context_id` must match Context.
- `sa_plan_has_steps`: Plan must contain at least one step.
- `sa_steps_have_valid_ids`: All steps must have UUID v4 identifiers.
- `sa_steps_have_agent_role`: All steps must specify an `agent_role`.
- `sa_trace_not_empty`: SA must emit at least one trace event.
- `sa_trace_context_binding` / `sa_trace_plan_binding`: Trace IDs must match Context and Plan.

**Minimal Lifecycle**:
1.  Load/Create **Context** (status: `active`).
2.  Generate **Plan** (with valid DAG structure).
3.  Execute steps sequentially.
4.  Emit **Trace** events.
5.  Optionally request **Confirm** approvals.

### 6.2 Multi-Agent Profile (MAP)
**RECOMMENDED** for v1.0. Extends SA with:
- **Collab Module**: Session management with coordination modes.
- **Dialog Module**: Inter-agent communication.
- **Network Module**: Topology mapping.

**Coordination Patterns** (from `mplp-collab.schema.json`):
- `broadcast`: One-to-many task distribution.
- `round_robin`: Sequential turn-taking.
- `orchestrated`: Centralized coordination.
- `swarm`: Self-organizing agents.
- `pair`: 1:1 collaboration.

**MAP Invariants** (from `schemas/v2/invariants/map-invariants.yaml`):
- Session must have at least 2 participants.
- All participants must have valid `role_id` bindings.
- Turn dispatch must match turn completion events.

## 7. Integration Layer (L4 - Optional)

Based on `schemas/v2/integration/`, four event types enable external system integration:

1.  **File Update Events** (`mplp-file-update-event.schema.json`): IDE file changes.
2.  **Git Events** (`mplp-git-event.schema.json`): Commit, push, merge, tag operations.
3.  **CI Events** (`mplp-ci-event.schema.json`): Pipeline execution status.
4.  **Tool Events** (`mplp-tool-event.schema.json`): Formatter, linter, test runner invocations.

## 8. Learning & Improvement (Phase 4)

Based on `schemas/v2/learning/`, MPLP defines structured **Learning Samples** to capture agent experiences for model fine-tuning:

- **Core Sample** (`mplp-learning-sample-core.schema.json`): Base structure with `sample_id`, `project_id`, `intent_before`, `plan`, `success_flag`, `user_feedback`.
- **Intent Resolution** (`mplp-learning-sample-intent.schema.json`): Intent-to-plan mappings.
- **Delta Impact** (`mplp-learning-sample-delta.schema.json`): Change impact analysis outcomes.

## 9. SDK Implementations

### 9.1 TypeScript SDK (`@mplp/sdk-ts`)
- **Version**: `1.0.3` (published on npm)
- **Location**: `packages/sdk-ts/`
- **Key Exports**:
  - `core/validators`: JSON Schema validation (using AJV).
  - `runtime-minimal`: Minimal reference runtime.
  - `coordination`: SA/MAP coordination logic.

### 9.2 Python SDK (`@mplp/sdk-py`)
- **Version**: `1.0.3`
- **Location**: `packages/sdk-py/`
- **Key Components**:
  - `mplp.core`: Type-safe Pydantic models.
  - `mplp.validators`: Schema validation.

## 10. Relationship to Industry Tools

MPLP is NOT a frameworkt is a **protocol** that frameworks can implement:

| **Tool** | **Layer** | **Relationship to MPLP** |
|:---|:---|:---|
| **LangGraph, AutoGen, CrewAI** | Runtime/Framework | Can implement MPLP L2 modules for interoperability |
| **OpenTelemetry** | Observability | MPLP Trace can export to OTel format |
| **Agent-to-Agent (A2A)** | Communication | Complementary (A2A for transport, MPLP for state semantics) |
| **Model Context Protocol (MCP)** | Tool Integration | MCP defines tool invocation, MPLP defines project lifecycle |

## 11. Compliance Levels

| **Level** | **Requirements** | **Target Audience** |
|:---|:---|:---|
| **L1: Data Compliance** | Read/Write valid MPLP JSON; Pass schema validation | Dashboards, Reporting tools |
| **L2: Module Compliance** | Implement 10 module semantics; Pass Golden Flows | Lightweight agent frameworks |
| **L3: Runtime Compliance** | Full PSG, Event bus, Drift detection; Pass full test suite | Production agent platforms |

## 12. Quick Navigation
# MPLP Protocol v1.0 Overview

## 1. Purpose

The **Multi-Agent Lifecycle Protocol (MPLP) v1.0** is a vendor-neutral, schema-driven specification for defining, executing, and auditing multi-agent AI systems. It establishes a standardized interoperability layer for governing the complete lifecycle of agentic workflowsrom project initialization and planning through execution, observation, and learning.

MPLP addresses the transition from **Prompt Engineering** (fragile, unstructured LLM interactions) to **Protocol Engineering** (rigorous, governed, and auditable multi-agent systems). It achieves this through:

1.  **Schema-First Data Contracts** All protocol entities are defined using JSON Schema (Draft-07), ensuring precise type definitions and cross-language interoperability.
2.  **Explicit State Management** The Project Semantic Graph (PSG) serves as the single source of truth, preventing state drift.
3.  **Structured Observability** 12 event families provide deep system introspection.
4.  **Normative Governance** Invariant rules (encoded in YAML) enforce critical constraints on agent behavior.

## 2. Core Problems Addressed

### 2.1 State Drift & Inconsistency
In unstructured agent workflows, the agent's internal representation of a project often diverges from the actual state of files, repositories, or external systems. MPLP enforces a **Project Semantic Graph (PSG)** as the canonical state model, with **drift detection** mechanisms to reconcile discrepancies.

### 2.2 Orchestration & Coordination
Multi-agent systems require clear handoff protocols and turn-taking semantics. MPLP defines explicit **Execution Profiles** (Single-Agent and Multi-Agent) and a **Collab Module** to manage coordination patterns such as broadcast, round-robin, and or

chestrated execution.

### 2.3 Auditability & Compliance
Enterprise adoption of AI agents demands full traceability of actions, decisions, and failures. MPLP provides:
- **Trace Module**: Immutable audit logs linking plans to execution outcomes.
- **Observability Events**: 12 structured event families (e.g., `pipeline_stage`, `graph_update`) for real-time system monitoring.
- **Confirm Module**: Human-in-the-loop approval workflows for high-risk actions.

### 2.4 Vendor Lock-In Prevention
To enable multi-vendor agent ecosystems, MPLP:
- Uses language-agnostic JSON Schema definitions (not framework-specific APIs).
- Separates protocol semantics (L1/L2) from runtime implementation (L3).
- Allows agents from different vendors to collaborate via shared PSG state.

## 3. Four-Layer Architecture

MPLP is organized into four layers, separating concerns and enabling modular implementations:

| Layer | Name | Normative Status | Key Components |
|:---|:---|:---|:---|
| **L4** | **Integration** | Optional | IDE adapters, CI/CD hooks, Git event emitters, External tool connectors |
| **L3** | **Runtime** | Behavioral (Non-Normative) | PSG engine, Event bus, Drift detection, Rollback mechanisms |
| **L2** | **Modules & Profiles** | Normative | 10 Core Modules, SA/MAP Profiles, Cross-cutting concerns |
| **L1** | **Core Protocol** | Normative | JSON Schemas, Invariants, Type definitions, Validation rules |

**Normative vs Non-Normative**:
- **Normative (L1/L2)**: Implementations MUST conform to these definitions to be MPLP-compliant.
- **Behavioral (L3)**: Runtime implementations MAY vary (e.g., choice of database, PSG storage format), but MUST expose conformant L2 interfaces and emit required events.
- **Optional (L4)**: Integration adapters are optional but, if implemented, MUST use the defined event schemas.

## 4. Ten Core Modules (L2)

Based on `schemas/v2/*.schema.json`, MPLP defines 10 modules:

1.  **Context**: Defines project scope, environment, and root configuration (`mplp-context.schema.json`).
2.  **Plan**: Structures executable steps as a DAG, with dependency tracking (`mplp-plan.schema.json`).
3.  **Confirm**: Manages human-in-the-loop approval/rejection decisions (`mplp-confirm.schema.json`).
4.  **Trace**: Records immutable execution history with OpenTelemetry-compatible spans (`mplp-trace.schema.json`).
5.  **Role**: Defines agent capabilities, permissions, and assignments (`mplp-role.schema.json`).
6.  **Dialog**: Maintains multi-turn conversation threads for intent clarification (`mplp-dialog.schema.json`).
7.  **Collab**: Orchestrates multi-agent sessions with coordination modes (broadcast, round-robin, orchestrated) (`mplp-collab.schema.json`).
8.  **Extension**: Adapts external tools and APIs for agent use (`mplp-extension.schema.json`).
9.  **Core**: Provides central governance, module registry, and version management (`mplp-core.schema.json`).
10. **Network**: Manages topology and node status for distributed agent systems (`mplp-network.schema.json`).

## 5. Twelve Event Families (Observability)

Based on `schemas/v2/events/mplp-event-core.schema.json`, the protocol defines 12 event families for system observability:

| **Group** | **Event Family** | **Required** | **Description** |
|:---|:---|:---|:---|
| **Lifecycle** | `import_process` | No | Project initialization and onboarding |
| **Intent & Planning** | `intent` | No | User's raw request or goal |
| | `delta_intent` | No | Modification or refinement of existing intent |
| | `methodology` | No | High-level approach selection |
| | `reasoning_graph` | No | Chain-of-thought internal reasoning |
| **Execution** | `pipeline_stage` | **YES** | Plan/Step lifecycle transitions |
| | `graph_update` | **YES** | PSG structural changes (node/edge add/remove) |
| | `runtime_execution` | No | Low-level execution details (LLM calls, tool invocations) |
| **Safety & Recovery** | `impact_analysis` | No | Predicted side-effects of a change |
| | `compensation_plan` | No | Rollback/undo strategies |
| **Cost & Integration** | `cost_budget` | No | Token usage and financial metrics |
| | `external_integration` | No | Events from L4 tools (IDE, Git, CI) |

**Compliance Requirement**: Runtimes MUST emit `pipeline_stage` and `graph_update` events to be MPLP v1.0 compliant.

## 6. Execution Profiles (SA/MAP)

### 6.1 Single-Agent Profile (SA)
**REQUIRED** for v1.0 compliance. Defined by `schemas/v2/invariants/sa-invariants.yaml`:

**Core Invariants** (8 rules):
- `sa_requires_context`: SA execution requires a valid Context with UUID v4.
- `sa_context_must_be_active`: Context status must be `active`.
- `sa_plan_context_binding`: Plan's `context_id` must match Context.
- `sa_plan_has_steps`: Plan must contain at least one step.
- `sa_steps_have_valid_ids`: All steps must have UUID v4 identifiers.
- `sa_steps_have_agent_role`: All steps must specify an `agent_role`.
- `sa_trace_not_empty`: SA must emit at least one trace event.
- `sa_trace_context_binding` / `sa_trace_plan_binding`: Trace IDs must match Context and Plan.

**Minimal Lifecycle**:
1.  Load/Create **Context** (status: `active`).
2.  Generate **Plan** (with valid DAG structure).
3.  Execute steps sequentially.
4.  Emit **Trace** events.
5.  Optionally request **Confirm** approvals.

### 6.2 Multi-Agent Profile (MAP)
**RECOMMENDED** for v1.0. Extends SA with:
- **Collab Module**: Session management with coordination modes.
- **Dialog Module**: Inter-agent communication.
- **Network Module**: Topology mapping.

**Coordination Patterns** (from `mplp-collab.schema.json`):
- `broadcast`: One-to-many task distribution.
- `round_robin`: Sequential turn-taking.
- `orchestrated`: Centralized coordination.
- `swarm`: Self-organizing agents.
- `pair`: 1:1 collaboration.

**MAP Invariants** (from `schemas/v2/invariants/map-invariants.yaml`):
- Session must have at least 2 participants.
- All participants must have valid `role_id` bindings.
- Turn dispatch must match turn completion events.

## 7. Integration Layer (L4 - Optional)

Based on `schemas/v2/integration/`, four event types enable external system integration:

1.  **File Update Events** (`mplp-file-update-event.schema.json`): IDE file changes.
2.  **Git Events** (`mplp-git-event.schema.json`): Commit, push, merge, tag operations.
3.  **CI Events** (`mplp-ci-event.schema.json`): Pipeline execution status.
4.  **Tool Events** (`mplp-tool-event.schema.json`): Formatter, linter, test runner invocations.

## 8. Learning & Improvement (Phase 4)

Based on `schemas/v2/learning/`, MPLP defines structured **Learning Samples** to capture agent experiences for model fine-tuning:

- **Core Sample** (`mplp-learning-sample-core.schema.json`): Base structure with `sample_id`, `project_id`, `intent_before`, `plan`, `success_flag`, `user_feedback`.
- **Intent Resolution** (`mplp-learning-sample-intent.schema.json`): Intent-to-plan mappings.
- **Delta Impact** (`mplp-learning-sample-delta.schema.json`): Change impact analysis outcomes.

## 9. SDK Implementations

### 9.1 TypeScript SDK (`@mplp/sdk-ts`)
- **Version**: `1.0.3` (published on npm)
- **Location**: `packages/sdk-ts/`
- **Key Exports**:
  - `core/validators`: JSON Schema validation (using AJV).
  - `runtime-minimal`: Minimal reference runtime.
  - `coordination`: SA/MAP coordination logic.

### 9.2 Python SDK (`@mplp/sdk-py`)
- **Version**: `1.0.3`
- **Location**: `packages/sdk-py/`
- **Key Components**:
  - `mplp.core`: Type-safe Pydantic models.
  - `mplp.validators`: Schema validation.

## 10. Relationship to Industry Tools

MPLP is NOT a frameworkt is a **protocol** that frameworks can implement:

| **Tool** | **Layer** | **Relationship to MPLP** |
|:---|:---|:---|
| **LangGraph, AutoGen, CrewAI** | Runtime/Framework | Can implement MPLP L2 modules for interoperability |
| **OpenTelemetry** | Observability | MPLP Trace can export to OTel format |
| **Agent-to-Agent (A2A)** | Communication | Complementary (A2A for transport, MPLP for state semantics) |
| **Model Context Protocol (MCP)** | Tool Integration | MCP defines tool invocation, MPLP defines project lifecycle |

## 11. Compliance Levels

| **Level** | **Requirements** | **Target Audience** |
|:---|:---|:---|
| **L1: Data Compliance** | Read/Write valid MPLP JSON; Pass schema validation | Dashboards, Reporting tools |
| **L2: Module Compliance** | Implement 10 module semantics; Pass Golden Flows | Lightweight agent frameworks |
| **L3: Runtime Compliance** | Full PSG, Event bus, Drift detection; Pass full test suite | Production agent platforms |

## 12. Quick Navigation

- **Architecture Details**: [Architecture Overview](../01-architecture/architecture-overview.md)
- **Module Specifications**:
  - [Context Module](../02-modules/context-module.md)
  - [Plan Module](../02-modules/plan-module.md)
  - [Trace Module](../02-modules/trace-module.md)
- **Execution Profiles**:
  - [SA Profile](../03-profiles/sa-profile.md)
  - [MAP Profile](../03-profiles/map-profile.md)
- **Observability**: [Event Taxonomy](../04-observability/event-taxonomy.md)
- **Compliance**: [Compliance Guide](../08-guides/mplp-v1.0-compliance-guide.md)
- **SDK Documentation**:
  - [TypeScript SDK Guide](../10-sdk/ts-sdk-guide.md)
  - [Python SDK Guide](../10-sdk/py-sdk-guide.md)
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
