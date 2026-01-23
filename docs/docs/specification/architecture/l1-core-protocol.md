---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-ARCH-L1-001"
repo_refs:
  schemas:
    - "schemas/v2/"
    - "schemas/v2/invariants/"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: L1 Core Protocol — Specification (v1.0.0 Frozen)
sidebar_label: L1 Core (State)
sidebar_position: 1
description: "MPLP architecture documentation: L1 Core Protocol — Specification (v1.0.0 Frozen). Defines structural requirements and layer responsibilities."
---

# L1 Core Protocol

## Scope

This specification defines the normative **data layer** of MPLP v1.0, including:
- 29 JSON Schemas (Draft-07)
- 61 Invariant Rules (5 YAML files)
- Type definitions and validation requirements

## Non-Goals

This specification does not define execution logic (L3), state management (L3), coordination patterns (L2), or external integrations (L4).

---

## 1. Purpose

The **L1 Core Protocol** layer is the foundational bedrock of MPLP v1.0, defining the invariant "laws of physics" that govern all protocol entities. It establishes:

- **Data Structures**: JSON Schema (Draft-07) definitions for all protocol objects
- **Type Definitions**: Precise data types, formats, and constraints
- **Invariant Rules**: Formal validation logic encoded in YAML
- **Compliance Boundaries**: Non-negotiable requirements for v1.0 conformance

L1 is purely **declarative** and **normative**. It prescribes *WHAT* valid data looks like, but not *HOW* it is created, stored, or processed.

## 2. Scope & Boundaries

### 2.1 L1 Encompasses

Based on actual implementation in `schemas/v2/` and SDK validation layers:

1.  **29 JSON Schemas** (using JSON Schema Draft-07):
    - **10 Module Schemas**: Core data structures for the 10 modules
    - **6 Common Schemas**: Reusable foundational types
    - **6 Event Schemas**: Observability event structures
    - **4 Integration Schemas**: L4 external system event structures
    - **3 Learning Schemas**: Learning sample structures for RLHF/SFT

2.  **61 Invariant Rules** (encoded in 5 YAML files):
    - **SA Invariants**: 9 rules (Single-Agent profile)
    - **MAP Invariants**: 9 rules (Multi-Agent profile)
    - **Observability Invariants**: 12 rules (event structure)
    - **Integration Invariants**: 19 rules (L4 events)
    - **Learning Invariants**: 12 rules (learning samples)

3.  **Type System** (implemented in SDKs):
    - TypeScript interfaces (`packages/sdk-ts/src/core/index.ts`)
    - Python Pydantic models (`packages/sdk-py/src/mplp/`)
    - JSON Schema validation via AJV v8.12.0 (TypeScript) / Pydantic v2.0+ (Python)

### 2.2 L1 Explicitly Excludes

- **Execution Logic** (L3): How to run plans, invoke tools, manage state
- **State Management** (L3): PSG storage,VSL backends, persistence strategies
- **Coordination Patterns** (L2): Module lifecycles, state transitions
- **Side Effects** (L4): File I/O, network calls, external integrations

## 3. Schema Catalog (29 Total)

### 3.1 Module Schemas (10)

Primary data structures for the 10 core modules in `schemas/v2/`:

| Schema File | Size (bytes) | Required Fields | Key Enums/Patterns | Purpose |
|:---|---:|:---|:---|:---|
| **mplp-context.schema.json** | 8,990 | `context_id`, `root`, `meta` | `status`: {active, suspended, closed} | Project scope & environment |
| **mplp-plan.schema.json** | 6,456 | `plan_id`, `context_id`, `steps[]`, `meta` | `status`: {draft, proposed, approved, in_progress, cancelled, completed} | Executable step DAG |
| **mplp-confirm.schema.json** | 7,930 | `confirm_id`, `target_id`, `target_type`, `decisions[]` | `status`: {pending, approved, rejected, override} | Approval decisions |
| **mplp-trace.schema.json** | 7,674 | `trace_id`, `context_id`, `plan_id`, `segments[]` | `status`: {active, completed, failed, cancelled} | Execution audit log |
| **mplp-role.schema.json** | 5,316 | `role_id`, `name`, `capabilities[]` | capabilities: string[] | Agent capabilities |
| **mplp-dialog.schema.json** | 6,514 | `dialog_id`, `context_id`, `messages[]` | `status`: {active, paused, completed, cancelled} | Multi-turn conversations |
| **mplp-collab.schema.json** | 7,873 | `collab_id`, `mode`, `participants[]` | `mode`: {broadcast, round_robin, orchestrated, swarm, pair}<br/>`status`: {draft, active, suspended, completed, cancelled} | Multi-agent sessions |
| **mplp-extension.schema.json** | 6,298 | `extension_id`, `extension_type`, `version` | `extension_type`: {capability, policy, integration, transformation, validation}<br/>`status`: {registered, active, inactive, deprecated} | Tool/capability registry |
| **mplp-core.schema.json** | 5,798 | `core_id`, `protocol_version`, `modules[]` | `status`: {draft, active, deprecated, archived} | Central governance |
| **mplp-network.schema.json** | 7,129 | `network_id`, `topology_type`, `nodes[]` | `topology_type`: {single_node, hub_spoke, mesh, hierarchical}<br/>`status`: {draft, provisioning, active, degraded, maintenance, retired} | Distributed topology |

### 3.2 Common Schemas (6)

Foundational reusable types in `schemas/v2/common/`:

> [!NOTE]
> **Standards Mapping (Informative)**
> MPLP adopts **IETF RFC 4122** (UUID) and **IETF RFC 8259** (JSON) as normative data formats.
> This ensures interoperability with standard internet protocols.

#### 3.2.1 identifiers.schema.json (837 bytes)
**Purpose**: Universal identifier format for all `*_id` fields

**Pattern** (UUID v4 - RFC 4122):
```regex
^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
```

**Examples**:
- `123e4567-e89b-12d3-a456-426614174000`
- `550e8400-e29b-41d4-a716-446655440000`

**Usage**: `context_id`, `plan_id`, `trace_id`, `event_id`, `role_id`, `collab_id`, etc.

#### 3.2.2 metadata.schema.json (3,161 bytes)
**Purpose**: Protocol metadata present in all MPLP objects

**Required Fields**:
- `protocol_version`: SemVer string (e.g., "1.0.0") - **REQUIRED**
- `schema_version`: SemVer string (e.g., "2.0.0") - **REQUIRED**

**Optional Fields**:
- `created_at`: ISO 8601 datetime (e.g., "2025-01-28T15:30:00.000Z")

#### 3.2.3 trace-base.schema.json (1,234 bytes)
**Purpose**: Distributed tracing base structure

**Optional Fields**:
- `parent_span_id`: UUID v4 - Links to parent span (omitted for root spans)
- `context_id`: UUID v4 - Associates with MPLP Context
- `attributes{}`: Custom metadata (additionalProperties: true)

**W3C Compatibility**: Aligns with W3C Trace Context specification for distributed tracing interoperability

#### 3.2.4 common-types.schema.json (1,517 bytes)
**Purpose**: Cross-module reusable types

**Definitions**:
- `Ref`: Object references with `id`, `kind`, optional `label`
- Annotations, tags, shared enums

#### 3.2.5 events.schema.json (2,449 bytes)
**Purpose**: Event array type definitions for observability

#### 3.2.6 learning-sample.schema.json (5,389 bytes)
**Purpose**: Base structure for RLHF/SFT learning samples

**Required Fields**:
- `sample_id`: UUID v4
- `sample_family`: String (e.g., "intent_resolution", "delta_impact")
- `created_at`: ISO 8601 datetime
- `input{}`: Input section
- `output{}`: Output section

**Optional Fields**:
- `meta.human_feedback_label`: {approved, rejected, not_reviewed}
- `meta.source_flow_id`: Source flow identifier

### 3.3 Event Schemas (6)

Observability infrastructure in `schemas/v2/events/`:

#### 3.3.1 mplp-event-core.schema.json (1,922 bytes) - **CRITICAL**
**Purpose**: Base structure for ALL MPLP events

**Required Fields**:
- `event_id`: UUID v4
- `event_type`: String (specific subtype, e.g., "import_started")
- `event_family`: **12 Families Enum** (see below)
- `timestamp`: ISO 8601 datetime

**12 Event Families** (normative enum):
1. `import_process` - Project initialization
2. `intent` - User's raw request
3. `delta_intent` - Intent modifications
4. `impact_analysis` - Change impact predictions
5. `compensation_plan` - Rollback strategies
6. `methodology` - Approach selection
7. `reasoning_graph` - Chain-of-thought traces
8. **`pipeline_stage`** - **REQUIRED**: Plan/Step lifecycle transitions
9. **`graph_update`** - **REQUIRED**: PSG structural changes
10. `runtime_execution` - LLM/tool execution details
11. `cost_budget` - Token/cost tracking
12. `external_integration` - L4 system events

**Optional Fields**:
- `project_id`: UUID v4 (for project-scoped events)
- `payload{}`: Event-specific data

#### 3.3.2 mplp-pipeline-stage-event.schema.json - **REQUIRED**
**Purpose**: Plan/Step status transitions

**Key Fields**:
- `pipeline_id`: UUID v4
- `stage_id`: Non-empty string
- `stage_status`: {pending, running, completed, failed, skipped}

**Compliance**: Runtimes MUST emit these events for all plan/step transitions

#### 3.3.3 mplp-graph-update-event.schema.json - **REQUIRED**
**Purpose**: PSG graph structural changes

**Key Fields**:
- `graph_id`: UUID v4
- `update_kind`: {node_add, node_update, node_delete, edge_add, edge_update, edge_delete, bulk}

**Compliance**: Runtimes MUST emit these events whenever PSG structure changes

#### 3.3.4 mplp-runtime-execution-event.schema.json - Optional
**Purpose**: Detailed execution traces

**Key Fields**:
- `execution_id`: UUID v4
- `executor_kind`: {agent, tool, llm, worker, external}
- `status`: {pending, running, completed, failed, cancelled}

#### 3.3.5 mplp-sa-event.schema.json - Optional
**Purpose**: Single-Agent profile-specific events

#### 3.3.6 mplp-map-event.schema.json - Optional
**Purpose**: Multi-Agent profile-specific events

### 3.4 Integration Schemas (4)

L4 external system integration in `schemas/v2/integration/`:

| Schema | Purpose | Key Fields | Required |
|:---|:---|:---|:---:|
| **mplp-file-update-event.schema.json** | IDE file changes | `file_path`, `change_type` {created, modified, deleted, renamed}, `timestamp` (ISO 8601) | Optional |
| **mplp-git-event.schema.json** | Git operations | `repo_url`, `commit_id`, `ref_name`, `event_kind` {commit, push, merge, tag, branch_create, branch_delete}, `timestamp` | Optional |
| **mplp-ci-event.schema.json** | CI/CD pipelines | `ci_provider`, `pipeline_id`, `run_id`, `status` {pending, running, succeeded, failed, cancelled}, `started_at`, `completed_at` | Optional |
| **mplp-tool-event.schema.json** | External tools | `tool_id`, `tool_kind` {formatter, linter, test_runner, generator, other}, `invocation_id` (UUID v4), `status` | Optional |

### 3.5 Learning Schemas (3)

Learning loop infrastructure in `schemas/v2/learning/`:

| Schema | Purpose | Key Fields |
|:---|:---|:---|
| **mplp-learning-sample-core.schema.json** | Base learning sample | `sample_id` (UUID v4), `sample_family`, `input{}`, `output{}`, `meta.human_feedback_label` {approved, rejected, not_reviewed} |
| **mplp-learning-sample-intent.schema.json** | Intent Plan mappings | Extends core with `input.intent_id`, `output.resolution_quality_label` {good, acceptable, bad, unknown} |
| **mplp-learning-sample-delta.schema.json** | Delta Impact predictions | Extends core with `input.delta_id`, `output.impact_scope` {local, module, system, global}, `state.risk_level` {low, medium, high, critical} |

## 4. Invariant Rules (61 Total Across 5 Files)

L1 enforces formal validation rules stored in `schemas/v2/invariants/` as YAML files. These rules are **normative** and MUST be validated by conformant implementations.

### 4.1 SA Profile Invariants (sa-invariants.yaml) - 9 Rules

**File**: `schemas/v2/invariants/sa-invariants.yaml` (1,860 bytes, 63 lines)

**Status**: **REQUIRED** for v1.0 compliance

| ID | Scope | Path | Rule | Description |
|:---|:---|:---|:---|:---|
| `sa_requires_context` | context | `context_id` | uuid-v4 | SA execution requires valid Context with UUID v4 |
| `sa_context_must_be_active` | context | `status` | enum(active) | Context status must be "active" |
| `sa_plan_context_binding` | plan | `context_id` | eq(context.context_id) | Plan's context_id must match SA's Context |
| `sa_plan_has_steps` | plan | `steps` | min-length(1) | Plan must contain  executable step |
| `sa_steps_have_valid_ids` | plan | `steps[*].step_id` | uuid-v4 | All step IDs must be UUID v4 |
| `sa_steps_have_agent_role` | plan | `steps[*].agent_role` | non-empty-string | All steps must specify agent_role |
| `sa_trace_not_empty` | trace | `events` | min-length(1 ) | SA must emit  trace event |
| `sa_trace_context_binding` | trace | `context_id` | eq(context.context_id) | Trace context_id must match |
| `sa_trace_plan_binding` | trace | `plan_id` | eq(plan.plan_id) | Trace plan_id must match |

**Total**: 9 rules (context + plan + trace binding)

### 4.2 MAP Profile Invariants (map-invariants.yaml) - 9 Rules

**File**: `schemas/v2/invariants/map-invariants.yaml` (2,401 bytes, 64 lines)

**Status**: **RECOMMENDED** for v1.0

**Structural Rules** (7 enforceable):

| ID | Path | Rule | Description |
|:---|:---|:---|:---|
| `map_session_requires_multiple_participants` | `collab.participants` | min-length(2) | MAP sessions require  participants |
| `map_collab_mode_valid` | `collab.mode` | enum(broadcast, round_robin, orchestrated, swarm, pair) | Valid collaboration pattern |
| `map_session_id_is_uuid` | `collab.collab_id` | uuid-v4 | Session ID must be UUID v4 |
| `map_participants_have_role_ids` | `collab.participants[*].role_id` | non-empty-string | All participants need role bindings |
| `map_role_ids_are_uuids` | `collab.participants[*].role_id` | uuid-v4 | All role_ids must be UUID v4 |
| `map_participant_ids_are_non_empty` | `collab.participants[*].participant_id` | non-empty-string | Participant IDs must be non-empty |
| `map_participant_kind_valid` | `collab.participants[*].kind` | enum(agent, human, system, external) | Valid participant kind |

**Event Consistency Rules** (2 descriptive, require trace analysis):
- `map_turn_completion_matches_dispatch`: Every MAPTurnDispatched MAPTurnCompleted
- `map_broadcast_has_receivers`: MAPBroadcastSent ? MAPBroadcastReceived

**Total**: 9 rules (7 structural + 2 event-based)

### 4.3 Observability Invariants (observability-invariants.yaml) - 12 Rules

**File**: `schemas/v2/invariants/observability-invariants.yaml` (3,615 bytes, 97 lines)

**Core Event Structure** (4 rules):
- `obs_event_id_is_uuid`: `event_id` must be UUID v4
- `obs_event_type_non_empty`: `event_type` must be non-empty string
- `obs_event_family_valid`: enum of 12 families (listed in 3.3.1)
- `obs_timestamp_iso_format`: ISO 8601 datetime

**PipelineStageEvent Specific** (3 rules):
- `obs_pipeline_event_has_pipeline_id`: UUID v4
- `obs_pipeline_stage_id_non_empty`: Non-empty string
- `obs_pipeline_stage_status_valid`: {pending, running, completed, failed, skipped}

**GraphUpdateEvent Specific** (2 rules):
- `obs_graph_event_has_graph_id`: UUID v4
- `obs_graph_update_kind_valid`: {node_add, node_update, node_delete, edge_add, edge_update, edge_delete, bulk}

**RuntimeExecutionEvent Specific** (3 rules):
- `obs_runtime_event_has_execution_id`: UUID v4
- `obs_runtime_executor_kind_valid`: {agent, tool, llm, worker, external}
- `obs_runtime_status_valid`: {pending, running, completed, failed, cancelled}

**Total**: 12 rules (4 core + 3 pipeline + 2 graph + 3 runtime)

### 4.4 Integration Invariants (integration-invariants.yaml) - 19 Rules

**File**: `schemas/v2/invariants/integration-invariants.yaml` (4,489 bytes, 138 lines)

**Tool Events** (5 rules):
- `integration_tool_event_id_non_empty`, `integration_tool_kind_valid` {formatter, linter, test_runner, generator, other}, `integration_tool_invocation_id_uuid`, `integration_tool_status_valid` {pending, running, succeeded, failed, cancelled}, `integration_tool_started_at_iso`

**File Update Events** (3 rules):
- `integration_file_path_non_empty`, `integration_file_change_type_valid` {created, modified, deleted, renamed}, `integration_file_timestamp_iso`

**Git Events** (5 rules):
- `integration_git_repo_url_non_empty`, `integration_git_commit_id_non_empty`, `integration_git_ref_name_non_empty`, `integration_git_event_kind_valid` {commit, push, merge, tag, branch_create, branch_delete}, `integration_git_timestamp_iso`

**CI Events** (4 rules):
- `integration_ci_provider_non_empty`, `integration_ci_pipeline_id_non_empty`, `integration_ci_run_id_non_empty`, `integration_ci_status_valid` {pending, running, succeeded, failed, cancelled}, (plus optional timestamp rules for started_at/completed_at)

**Total**: 19 rules (5 tool + 3 file + 5 git + 6 CI)

### 4.5 Learning Invariants (learning-invariants.yaml) - 12 Rules

**File**: `schemas/v2/invariants/learning-invariants.yaml` (3,735 bytes, 97 lines)

**Core LearningSample** (5 rules):
- `learning_sample_id_is_uuid`, `learning_sample_family_non_empty`, `learning_sample_created_at_iso`, `learning_sample_has_input_section`, `learning_sample_has_output_section`

**Meta Fields** (2 optional rules):
- `learning_sample_feedback_label_valid` {approved, rejected, not_reviewed}, `learning_sample_source_flow_non_empty`

**Intent Resolution Family** (2 rules):
- `learning_intent_has_intent_id`, `learning_intent_quality_label_valid` {good, acceptable, bad, unknown}

**Delta Impact Family** (4 rules):
- `learning_delta_has_delta_id`, `learning_delta_scope_valid` {local, module, system, global}, `learning_delta_risk_valid` {low, medium, high, critical}

**Total**: 12 rules (7 core + 2 intent + 3 delta)

## 5. Validation Requirements

### 5.1 Schema Validation (Mandatory)

**Validator Requirements**:
- **JSON Schema Draft-07** compatible validator
- **TypeScript SDK**: AJV v8.12.0 + ajv-formats v2.1.1
- **Python SDK**: Pydantic v2.0+ (inherently validates against schemas)

**Validation Timing**:
- **Input Validation**: Before processing any external data
- **Output Validation**: Before emitting data to other components
- **Storage Validation**: Before persisting to PSG or state layers

**Error Handling**:
- MUST return descriptive error messages citing:
  - Schema path (e.g., `$.plan.steps[0].step_id`)
  - Violated constraint (e.g., "must match UUID v4 pattern")
  - Received value

### 5.2 Invariant Validation (Mandatory)

**Implementation Approaches**:
1. **Schema-Level**: Baked into JSON Schemas (already done for L1)
2. **Runtime-Level**: Explicit invariant checks in runtime code
3. **Test-Level**: Golden flow tests validate invariants

**Validation Frequency**:
- **SA Invariants**: Checked at Context load, Plan creation, Trace emission
- **MAP Invariants**: Checked at Collab session start, participant add, turn dispatch
- **Observability Invariants**: Checked on every event emission
- **Integration/Learning Invariants**: Checked when L4/learning features are enabled

### 5.3 TypeScript SDK Implementation

From `packages/sdk-ts/src/core/validators/index.ts`:

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({
  strict: true,
  allErrors: true,
  verbose: true
});
addFormats(ajv);

// Load all 29 schemas
// Provide validate(schemaName, data) function
```

### 5.4 Python SDK Implementation

From `packages/sdk-py/src/mplp/core/`:

```python
from pydantic import BaseModel, Field, UUID4, validator

class Context(BaseModel):
    context_id: UUID4
    root: dict
    meta: Metadata
    # Pydantic automatically validates against field types
```

## 6. L1 Compliance Checklist

To claim **L1 Compliance**, implementations MUST:

| Requirement | Verification Method | Reference |
|:---|:---|:---|
| **Embed all 29 JSON Schemas** | Package inspection | `schemas/v2/` directory |
| **Validate ALL inputs against schemas** | Code review + test coverage | AJV/Pydantic integration |
| **Reject invalid data with descriptive errors** | Error handling tests | Error message samples |
| **Support JSON serialization** | Serialization tests | JSON.stringify/json.dumps |
| **Enforce SA invariants (9 rules)** | SA golden flow tests | `tests/golden/flows/sa-*` |
| **Validate UUID v4 format** | Regex pattern tests | `identifiers.schema.json` |
| **Validate ISO 8601 timestamps** | Datetime parsing tests | `metadata.schema.json`, event schemas |
| **Support W3C Trace Context** | Distributed tracing tests | `trace-base.schema.json` |

**Non-Compliance Examples**:
- Accepting `context_id` without UUID v4 validation
- Allowing Plan with 0 steps (violates `sa_plan_has_steps`)
- Skipping schema validation for performance
- Using non-ISO timestamps (e.g., Unix epoch integers)

## 7. Relationship to L2 Modules

L1 provides the **vocabulary** that L2 modules use to construct behavior:

| L1 Responsibility (Data Shape) | L2 Responsibility (Behavior) | Example |
|:---|:---|:---|
| Define `Plan` schema with `status` enum | Define Plan lifecycle transitions | Draft Proposed Approved |
| Define `steps[]` array structure | Define step execution order and DAG validation | Dependency resolution, parallel execution |
| Define `Context` with `context_id` | Define Context activation/suspension logic | Load Context, check status = "active" |
| Define `Trace` with `segments[]` | Define span emission timing | Emit span on step start/complete |

**Layering Principle**: L2 modules **import** L1 schemas but **cannot modify** them. L1 is the immutable foundation.

## 8. Extensibility Mechanisms

While L1 is frozen, limited extensibility is provided:

### 8.1 Via `meta.tags[]`
Custom classification without schema changes:
```json
{
  "meta": {
    "tags": ["production", "high-priority", "customer-123"]
  }
}
```

### 8.2 Via `meta.cross_cutting[]`
Opt-in to cross-cutting concerns:
```json
{
  "meta": {
    "cross_cutting": ["security", "transaction", "performance"]
  }
}
```

### 8.3 Via `attributes` (trace-base)
Custom trace metadata:
```json
{
  "trace_id": "...",
  "span_id": "...",
  "attributes": {
    "custom_metric": "value",
    "internal_flag": true
  }
}
```

### 8.4 Via Vendor-Specific Fields (Limited)
Some schemas allow `additionalProperties: true` in designated areas. Check individual schemas.

**Critical Rule**: Vendor extensions MUST NOT violate normative constraints or change core semantics.

## 9. Schema Freeze & Governance

### 9.1 Freeze Status

**Frozen Date**: 2025-12-03  
**Status**: **FROZEN** - No breaking changes permitted  
**Governance**: MPLP Protocol Governance Committee (MPGC)

**What "Frozen" Means**:
- Adding **optional** fields (backward compatible)
- Removing fields
- Changing required fields
- Modifying enums (except additions to end)
- Changing validation rules

### 9.2 Version Management

Each schema includes `x-mplp-meta`:
```json
{
  "x-mplp-meta": {
    "protocolVersion": "1.0.0",
    "frozen": true,
    "freezeDate": "2025-12-03",
    "governance": "MPGC"
  }
}
```

**Version Increment Triggers**:
- Breaking change to any schema v1.1.0
- Non-breaking additions v1.0.1 (patch)

## 10. Related Documents

**Architecture**:
- [Architecture Overview](index.mdx)
- [L2 Coordination & Governance](l2-coordination-governance.md)
- [Schema Conventions](schema-conventions.md)

**Module Specs** (L2):
- [Modules Overview](../modules/context-module.md) - All 10 module lifecycle documents

**Compliance**:
- [Conformance Guide](/docs/guides/conformance-guide.md)
- [Conformance Checklist](/docs/guides/conformance-checklist.md)

**Invariants Source**:
- `schemas/v2/invariants/sa-invariants.yaml` (9 rules)
- `schemas/v2/invariants/map-invariants.yaml` (9 rules)
- `schemas/v2/invariants/observability-invariants.yaml` (12 rules)
- `schemas/v2/invariants/integration-invariants.yaml` (19 rules)
- `schemas/v2/invariants/learning-invariants.yaml` (12 rules)

---

**Total Rules**: 61 invariants across 5 files  
**Total Schemas**: 29 JSON Schema files (10+6+6+4+3)  
**Validation Libraries**: AJV v8.12.0 (TypeScript), Pydantic v2.0+ (Python)