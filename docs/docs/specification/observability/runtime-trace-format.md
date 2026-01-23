---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-OBS-TRACE-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Runtime Trace Format
sidebar_label: Runtime Trace Format
sidebar_position: 4
description: "MPLP observability specification: Runtime Trace Format. Defines event schemas and trace formats."
---

# Runtime Trace Format

## Scope

This specification defines:
- The JSON schema for MPLP trace export
- Field requirements for traces, segments, and events
- Attribute conventions for observability

## Non-Goals

- Mandating specific transport protocols
- Defining observability platform configurations
- Specifying implementation internals

## 1. Purpose

The **Runtime Trace Format** defines the JSON structure for exporting execution data from an MPLP runtime. It is designed to enable interoperability with observability tools while preserving MPLP-specific semantics.

**Design Principle**: "Standard format for interoperability with observability tools"

**Claim Type:** Normative  
**Truth Source:** L1 (`schemas/v2/mplp-trace.schema.json`)

## 2. Trace Data Model

### 2.1 Hierarchy

```
Trace (root)
├── Segment (unit of work)
│   ├── Events (discrete points)
│   └── Attributes (metadata)
├── Segment
│   ├── Events
│   └── Attributes
└── ...
```

### 2.2 Trace Object

Per `schemas/v2/mplp-trace.schema.json`:

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| **`meta`** | Object | ✓ | MPLP protocol and schema metadata (ref: metadata.schema.json) |
| **`trace_id`** | String (UUID v4) | ✓ | Global unique identifier for the Trace |
| **`context_id`** | String (UUID v4) | ✓ | Identifier of the Context this Trace belongs to |
| **`root_span`** | Object | ✓ | Root span definition (ref: trace-base.schema.json) |
| **`status`** | Enum | ✓ | Current status of the Trace |
| `governance` | Object | | Governance metadata (lifecyclePhase, truthDomain, locked, lastConfirmRef) |
| `plan_id` | String (UUID v4) | | Associated Plan identifier |
| `started_at` | ISO 8601 | | Trace start time |
| `finished_at` | ISO 8601 | | Trace finish time (optional if not finished) |
| `segments` | Array | | Key execution segments in the Trace |
| `events` | Array | | Trace-level events |

**status Enum**: `pending`, `running`, `completed`, `failed`, `cancelled`

### 2.3 Segment Object

Per `schemas/v2/mplp-trace.schema.json#/$defs/trace_segment_core`:

| Field | Type | Required | Description |
|:---|:---|:---:|:---|
| **`segment_id`** | String (UUID v4) | ✓ | Segment identifier |
| **`label`** | String | ✓ | Segment label/name for human and Agent identification |
| **`status`** | Enum | ✓ | Segment status |
| `parent_segment_id` | String (UUID v4) | | Parent segment identifier (optional if root segment) |
| `started_at` | ISO 8601 | | Segment start time |
| `finished_at` | ISO 8601 | | Segment finish time (optional if not finished) |
| `attributes` | Object | | Key context attributes (key-value form, for tracing and audit) |

**status Enum**: `pending`, `running`, `completed`, `failed`, `cancelled`, `skipped`

## 3. External Standard Compatibility

### 3.1 W3C Trace Context Integration

MPLP traces can be correlated with W3C Trace Context headers. However, the ID formats differ:

| Standard | ID Type | Format | Length |
|:---|:---|:---|:---|
| MPLP | `trace_id` | UUID v4 (with hyphens) | 36 chars |
| W3C | `trace-id` | Hex (no hyphens) | 32 chars |
| MPLP | `segment_id` | UUID v4 (with hyphens) | 36 chars |
| W3C | `parent-id` | Hex (no hyphens) | 16 chars |

### 3.2 ID Conversion Requirements

For interoperability with W3C Trace Context, implementations SHOULD:

1. Convert MPLP `trace_id` to 32-character hex by removing hyphens
2. Truncate or hash `segment_id` to 16-character hex for `parent-id`
3. Preserve original MPLP IDs in `tracestate` for round-trip

> **Note**: W3C Trace Context integration is for interoperability purposes.
> This is not a protocol obligation. MPLP does not require W3C compatibility.

**Conversion Formula:**
```
W3C trace-id = remove_hyphens(mplp_trace_id)
W3C parent-id = first_16_chars(remove_hyphens(mplp_segment_id))
```

### 3.3 W3C Header Format (Informative)

```http
traceparent: 00-{w3c_trace_id}-{w3c_parent_id}-01
tracestate: mplp=trace_id:{mplp_trace_id};segment_id:{mplp_segment_id}
```

**Example:**
```http
traceparent: 00-550e8400e29b41d4a716446655440000-a716446655440001-01
tracestate: mplp=trace_id:550e8400-e29b-41d4-a716-446655440000;segment_id:a7164466-5544-0001-0000-000000000000
```

## 4. Standard Attributes

### 4.1 Core Attributes

| Attribute | Type | Description |
|:---|:---|:---|
| `mplp.module` | String | Module originating the span |
| `mplp.operation` | String | Operation name |
| `mplp.agent_role` | String | Role executing the action |
| `mplp.step_id` | String (UUID) | Associated step |
| `mplp.error` | String | Error message (if failed) |
| `mplp.tokens_used` | Number | LLM tokens consumed |
| `mplp.duration_ms` | Number | Execution duration |

### 4.2 Extended Attributes

| Attribute | Type | Description |
|:---|:---|:---|
| `mplp.tool.name` | String | Tool name |
| `mplp.tool.args` | Object | Tool arguments |
| `mplp.llm.model` | String | LLM model name |
| `mplp.llm.tokens_in` | Number | Input tokens |
| `mplp.llm.tokens_out` | Number | Output tokens |

## 5. Complete JSON Example

```json
{
  "meta": {
    "protocolVersion": "1.0.0"
  },
  "trace_id": "550e8400-e29b-41d4-a716-446655440000",
  "context_id": "660f9511-f30c-52e5-b827-557766551111",
  "plan_id": "770fa622-a40d-63f6-c938-668877662222",
  "status": "completed",
  "started_at": "2025-12-07T00:00:00.000Z",
  "ended_at": "2025-12-07T00:05:00.000Z",
  "segments": [
    {
      "segment_id": "880fb733-b51e-74a7-d049-779988773333",
      "parent_segment_id": null,
      "label": "Plan Execution",
      "status": "completed",
      "operation": "execute_plan",
      "started_at": "2025-12-07T00:00:00.000Z",
      "ended_at": "2025-12-07T00:05:00.000Z",
      "attributes": {
        "mplp.module": "plan",
        "mplp.operation": "execute_plan",
        "mplp.agent_role": "orchestrator"
      }
    },
    {
      "segment_id": "990fc844-c62f-85b8-e15a-88aa99884444",
      "parent_segment_id": "880fb733-b51e-74a7-d049-779988773333",
      "label": "Step 1: Read error logs",
      "status": "completed",
      "operation": "execute_step",
      "started_at": "2025-12-07T00:00:01.000Z",
      "ended_at": "2025-12-07T00:01:00.000Z",
      "attributes": {
        "mplp.module": "plan",
        "mplp.operation": "execute_step",
        "mplp.step_id": "aa0fd955-d73a-96c9-f26b-99bbaa995555",
        "mplp.agent_role": "debugger",
        "mplp.duration_ms": 59000
      }
    }
  ],
  "events": [
    {
      "event_id": "bb0fe066-e84b-a7da-a37c-aaccbb006666",
      "event_type": "SAInitialized",
      "event_family": "runtime_execution",
      "timestamp": "2025-12-07T00:00:00.000Z"
    },
    {
      "event_id": "cc0ff177-f95c-b8eb-b48d-bbddcc117777",
      "event_type": "SACompleted",
      "event_family": "runtime_execution",
      "timestamp": "2025-12-07T00:05:00.000Z"
    }
  ]
}
```

## 6. Export Formats (Informative)

> [!NOTE]
> This section provides implementation guidance only. It is not normative.

### 6.1 JSON Lines (JSONL)

For log aggregation and streaming, traces can be exported as JSONL:

```jsonl
{"trace_id":"550e8400-...","segment_id":"880fb733-...","operation":"execute_plan"}
{"trace_id":"550e8400-...","segment_id":"990fc844-...","operation":"execute_step"}
```

### 6.2 OpenTelemetry Protocol (OTLP)

For integration with observability platforms, implementations may convert MPLP traces to OTLP format. Key considerations:

- `traceId` must be 32-character hex (convert from UUID)
- `spanId` must be 16-character hex (derive from segment_id)
- MPLP-specific attributes should use `mplp.` prefix

### 6.3 Jaeger Format

Jaeger integration requires:
- `traceID`: 32-character hex
- `spanID`: 16-character hex
- Tags for MPLP attributes

## 7. Related Documents

**Observability:**
- [Observability Overview](observability-overview.md) - Architecture
- [Event Taxonomy](event-taxonomy.md) - Event families

**Modules:**
- [Trace Module](../modules/trace-module.md) - Trace data model

**Schemas:**
- `schemas/v2/mplp-trace.schema.json`
- `schemas/v2/common/trace-base.schema.json`

---

**W3C Compatible**: Yes (with ID conversion)  
**Export Formats**: JSON, JSONL, OTLP, Jaeger (informative)  
**Standard Attributes**: 7 core + 5 extended