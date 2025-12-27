---
doc_type: normative
status: frozen
authority: MPGC
description: ""
title: Common Schemas Reference
---


> **Scope**: Inherited (from /docs/04-observability/)
> **Non-Goals**: Inherited (from /docs/04-observability/)

# Common Schemas Reference

> **Status**: Normative
> **Version**: 1.0.0
> **Authority**: MPGC
> **Protocol**: MPLP v1.0.0 (Frozen)

## 4. Metadata Schema

**File**: `metadata.schema.json`

### 4.1 Required Fields

| Field | Type | Description |
|:---|:---|:---|
| **`protocol_version`** | String (SemVer) | MPLP protocol version |
| **`schema_version`** | String (SemVer) | Schema version used |

### 4.2 Optional Fields

| Field | Type | Description |
|:---|:---|:---|
| `created_at` | ISO 8601 datetime | Object creation time |
| `created_by` | String | Creator identifier |
| `updated_at` | ISO 8601 datetime | Last update time |
| `updated_by` | String | Last updater identifier |
| `tags` | Array of strings | Tags for indexing/search |
| `cross_cutting` | Array of enums | Cross-cutting concerns enabled |

### 4.3 Cross-Cutting Concerns Enum

The 9 governance plane concerns:

```
coordination, error-handling, event-bus, orchestration, 
performance, protocol-version, security, state-sync, transaction
```

### 4.4 Example

```json
{
  "protocol_version": "1.0.0",
  "schema_version": "1.0.0",
  "created_at": "2025-01-28T15:30:00.000Z",
  "created_by": "agent-planner",
  "tags": ["production", "high-priority"],
  "cross_cutting": ["security", "transaction"]
}
```

## 6. Common Types Schema

**File**: `common-types.schema.json`

Shared type definitions for cross-module consistency.

### 6.1 Definitions

| Type | Description |
|:---|:---|
| `MplpId` | Reference to identifiers.schema.json |
| `Ref` | Standard reference to another MPLP object |
| `BaseMeta` | Reference to metadata.schema.json |

### 6.2 Ref Object

A standard way to reference other MPLP objects.

**Required**: `id`, `module`

| Field | Type | Description |
|:---|:---|:---|
| **`id`** | UUID v4 | Referenced object ID |
| **`module`** | Enum | Module name |
| `description` | String | Reference description |

**Module Enum**:
```
context, plan, confirm, trace, role, extension, dialog, collab, core, network
```

### 6.3 Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "module": "plan",
  "description": "Parent plan reference"
}
```

## 8. Learning Sample Schema

**File**: `learning-sample.schema.json`

Structured format for collecting learning data from MPLP runtime executions.

### 8.1 Required Fields

| Field | Type | Description |
|:---|:---|:---|
| **`sample_id`** | UUID v4 | Unique sample identifier |
| **`project_id`** | String | Project identifier |
| **`success_flag`** | Boolean | Whether action succeeded |
| **`timestamps`** | Object | Execution timeline |

### 8.2 Core Optional Fields

| Field | Type | Description |
|:---|:---|:---|
| `intent_before` | Object | Original intent representation |
| `plan` | Object | Plan used |
| `delta_intents` | Array | Delta intents proposed/applied |
| `graph_before` | Object | Graph state before change |
| `graph_after` | Object | Graph state after change |
| `pipeline_path` | Array | Pipeline stages traversed |

### 8.3 Metrics Fields

| Field | Type | Description |
|:---|:---|:---|
| `token_usage` | Object | LLM token consumption |
| `execution_time_ms` | Number | Execution time (ms) |
| `impact_score` | Number (0-1) | Impact score |

### 8.4 Feedback Fields

| Field | Type | Description |
|:---|:---|:---|
| `user_feedback` | Object | Human feedback on result |
| `error_info` | Object | Error details if failed |
| `governance_decisions` | Array | Governance rules evaluated |

### 8.5 Token Usage Structure

```json
{
  "total_tokens": 15000,
  "prompt_tokens": 10000,
  "completion_tokens": 5000,
  "by_agent": [
    { "agent_id": "planner", "role": "orchestrator", "tokens": 8000 },
    { "agent_id": "coder", "role": "executor", "tokens": 7000 }
  ]
}
```

### 8.6 User Feedback Structure

```json
{
  "decision": "approve",  // approve, reject, override, unknown
  "comment": "Looks good",
  "rating": 4.5  // 0-5
}
```

**Document Status**: Normative (Common Schemas Reference)  
**Total Schemas**: 6 foundational schemas  
**Standards**: UUID v4, CloudEvents v1.0, W3C Trace Context, ISO 8601