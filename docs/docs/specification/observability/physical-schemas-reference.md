---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-OBS-PHYS-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Physical Schemas Reference
sidebar_label: Physical Schemas Reference
sidebar_position: 6
description: "MPLP observability specification: Physical Schemas Reference. Defines event schemas and trace formats."
---

# Physical Schemas Reference

## Scope

This specification defines the event schema structure for MPLP observability.

## Non-Goals

This specification does not define storage formats or vendor-specific serialization.

## 1. Purpose

This document provides a normative reference for the **Physical Event Schemas** used in MPLP runtime observability. These schemas define the JSON structures for discrete runtime events.

**Claim Type:** Normative Quote  
**Truth Source:** L1 (`schemas/v2/events/`)

## 2. Schema Inventory

| Schema File | Compliance | Section |
|-------------|------------|---------|
| `mplp-event-core.schema.json` | Base | 搂4 |
| `mplp-graph-update-event.schema.json` | REQUIRED | 搂5 |
| `mplp-pipeline-stage-event.schema.json` | REQUIRED | 搂6 |
| `mplp-runtime-execution-event.schema.json` | RECOMMENDED | 搂7 |

---

## 3. EventCore Schema (Base)

**Path**: `schemas/v2/events/mplp-event-core.schema.json`

**Purpose**: Base schema inherited by all event types

**Compliance**: Required for all events

### 4.1 Field Definitions

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| **`event_id`** | String (UUID v4) | ✓ | Unique event identifier |
| **`event_type`** | String | ✓ | Specific event subtype (e.g., 'import_started', 'pipeline_stage_completed') |
| **`event_family`** | Enum | ✓ | Event family classification |
| **`timestamp`** | ISO 8601 | ✓ | Event timestamp |
| `project_id` | String (UUID v4) | | Project context identifier (optional for system-level events) |
| `payload` | Object | | Event-specific payload data (schema varies by event_family) |

### 4.2 event_family Enum

Per `/schemas/v2/events/mplp-event-core.schema.json`:

| Value | Compliance | Description |
|:---|:---|:---|
| `graph_update` | REQUIRED | PSG structural mutations |
| `pipeline_stage` | REQUIRED | Pipeline stage transitions |
| `runtime_execution` | RECOMMENDED | Execution lifecycle |
| `import_process` | RECOMMENDED | Import processing |
| `intent` | RECOMMENDED | Intent processing |
| `delta_intent` | OPTIONAL | Delta intent changes |
| `impact_analysis` | OPTIONAL | Impact analysis |
| `compensation_plan` | OPTIONAL | Compensation planning |
| `methodology` | OPTIONAL | Methodology selection |
| `reasoning_graph` | OPTIONAL | Reasoning chain |
| `cost_budget` | OPTIONAL | Cost tracking |
| `external_integration` | OPTIONAL | External system integration |

---

## 4. GraphUpdateEvent Schema

**Path**: `schemas/v2/events/mplp-graph-update-event.schema.json`

**Purpose**: Track state graph mutations (node/edge changes)

**Compliance**: REQUIRED

### 5.1 Field Definitions

Per `/schemas/v2/events/mplp-graph-update-event.schema.json`:

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| `event_id` | String (UUID v4) | ✓ | Inherited from EventCore |
| `event_type` | String | ✓ | Inherited from EventCore |
| `event_family` | `"graph_update"` | ✓ | Must be exactly "graph_update" |
| `timestamp` | ISO 8601 | ✓ | Inherited from EventCore |
| **`graph_id`** | String (UUID v4) | ✓ | PSG identifier (typically project-level graph) |
| **`update_kind`** | Enum | ✓ | Type of graph mutation |
| **`node_delta`** | Integer | ✓ | Node count delta (+/- or 0) |
| **`edge_delta`** | Integer | ✓ | Edge count delta (+/- or 0) |
| `source_module` | String | | L2 module emitting this update (e.g., 'context', 'plan', 'collab') |

### 5.2 update_kind Enum

| Value | Description |
|:---|:---|
| `node_add` | New node created |
| `node_update` | Existing node modified |
| `node_delete` | Node removed |
| `edge_add` | New edge created |
| `edge_update` | Existing edge modified |
| `edge_delete` | Edge removed |
| `bulk` | Bulk operation (multiple changes) |

### 5.3 JSON Example

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440001",
  "event_type": "node_created",
  "event_family": "graph_update",
  "timestamp": "2025-12-07T00:00:00.000Z",
  "graph_id": "660f9511-f30c-52e5-b827-557766551111",
  "update_kind": "node_add",
  "node_delta": 1,
  "edge_delta": 0,
  "source_module": "plan"
}
```

---

## 5. PipelineStageEvent Schema

**Path**: `schemas/v2/events/mplp-pipeline-stage-event.schema.json`

**Purpose**: Track pipeline stage progression

**Compliance**: REQUIRED

### 6.1 Field Definitions

Per `/schemas/v2/events/mplp-pipeline-stage-event.schema.json`:

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| `event_id` | String (UUID v4) | ✓ | Inherited from EventCore |
| `event_type` | String | ✓ | Inherited from EventCore |
| `event_family` | `"pipeline_stage"` | ✓ | Must be exactly "pipeline_stage" |
| `timestamp` | ISO 8601 | ✓ | Inherited from EventCore |
| **`pipeline_id`** | String (UUID v4) | ✓ | Pipeline instance identifier |
| **`stage_id`** | String | ✓ | Stage identifier (e.g., 'import', 'analyze', 'execute') |
| **`stage_status`** | Enum | ✓ | Current status of the pipeline stage |
| `stage_name` | String | | Human-readable stage name |
| `stage_order` | Integer (≥0) | | Sequential order of this stage in pipeline |

### 6.2 stage_status Enum

| Value | Description |
|:---|:---|
| `pending` | Queued for execution |
| `running` | Currently executing |
| `completed` | Stage finished successfully |
| `failed` | Stage failed |
| `skipped` | Stage was skipped |

### 6.3 JSON Example

```json
{
  "event_id": "880fb733-b51e-74a7-d049-779988773333",
  "event_type": "stage_completed",
  "event_family": "pipeline_stage",
  "timestamp": "2025-12-07T00:01:00.000Z",
  "pipeline_id": "990fc844-c62f-85b8-e15a-88aa99884444",
  "stage_id": "planning",
  "stage_status": "completed",
  "stage_name": "Plan Generation",
  "stage_order": 2
}
```

---

## 6. RuntimeExecutionEvent Schema

**Path**: `schemas/v2/events/mplp-runtime-execution-event.schema.json`

**Purpose**: Track agent, tool, and LLM execution lifecycle

**Compliance**: RECOMMENDED

### 7.1 Field Definitions

Per `/schemas/v2/events/mplp-runtime-execution-event.schema.json`:

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| `event_id` | String (UUID v4) | ✓ | Inherited from EventCore |
| `event_type` | String | ✓ | Inherited from EventCore |
| `event_family` | `"runtime_execution"` | ✓ | Must be exactly "runtime_execution" |
| `timestamp` | ISO 8601 | ✓ | Inherited from EventCore |
| **`execution_id`** | String (UUID v4) | ✓ | Execution instance identifier |
| **`executor_kind`** | Enum | ✓ | Type of executor performing this execution |
| **`status`** | Enum | ✓ | Current execution status |
| `executor_role` | String | | Role identifier (e.g., 'planner', 'reviewer', 'curl_executor') |

### 7.2 executor_kind Enum

| Value | Description | Example |
|:---|:---|:---|
| `agent` | MPLP agent instance | SA runtime |
| `tool` | External tool | file_read, curl |
| `llm` | Language model | gpt-4, claude |
| `worker` | Background worker | Async processor |
| `external` | External system | API gateway |

### 7.3 status Enum

| Value | Description |
|:---|:---|
| `pending` | Queued for execution |
| `running` | Currently executing |
| `completed` | Successfully finished |
| `failed` | Execution error |
| `cancelled` | Manually stopped |

### 7.4 JSON Example

```json
{
  "event_id": "aa0fd955-d73a-96c9-f26b-99bbaa995555",
  "event_type": "llm_call_completed",
  "event_family": "runtime_execution",
  "timestamp": "2025-12-07T00:00:05.000Z",
  "execution_id": "bb0fe066-e84b-a7da-a37c-aaccbb006666",
  "executor_kind": "llm",
  "executor_role": "coder",
  "status": "completed"
}
```

---

## 7. Schema Relationships

<MermaidDiagram id="50c478d3011a0924" />

## 8. Related Documents

**Observability:**
- [Observability Overview](observability-overview.md) - Architecture
- [Event Taxonomy](event-taxonomy.md) - Family definitions
- [Module Event Matrix](module-event-matrix.md) - Module mapping

**Schemas:**
- `schemas/v2/events/mplp-event-core.schema.json`
- `schemas/v2/events/mplp-graph-update-event.schema.json`
- `schemas/v2/events/mplp-pipeline-stage-event.schema.json`
- `schemas/v2/events/mplp-runtime-execution-event.schema.json`

---

**Physical Schemas**: 4 (1 base + 3 specific)  
**Required Schemas**: GraphUpdateEvent, PipelineStageEvent  
**Recommended Schemas**: RuntimeExecutionEvent