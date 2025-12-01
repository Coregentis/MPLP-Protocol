---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Trace Module

## 1. Scope

This document defines the **Trace Module**, which provides the standard for recording execution history, telemetry, and debugging information. It is the foundation of Observability.

**Boundaries**:
- **In Scope**: Execution Spans, Segments, Status Tracking, Timestamps.
- **Out of Scope**: Log aggregation storage, Metrics analysis.

## 2. Normative Definitions

- **Trace**: A complete record of a single execution flow.
- **Span**: An atomic unit of work with a start and end time (OpenTelemetry compatible).
- **Segment**: A logical grouping of spans representing a business phase.

## 3. Responsibilities (MUST/SHALL)

1.  **Recording**: The Runtime **MUST** record a Trace for every Plan execution.
2.  **Correlation**: Every Trace **MUST** link to a `context_id` and (if applicable) `plan_id`.
3.  **Standardization**: Spans **SHOULD** follow OpenTelemetry semantic conventions where possible.

## 4. Architecture Structure

**Schema File**: `schemas/v2/mplp-trace.schema.json`

### Trace Object
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `meta` | `Metadata` | ✅ Yes | Protocol metadata. |
| `governance` | `Object` | ❌ No | Lifecycle metadata. |
| `trace_id` | `UUID` | ✅ Yes | Global unique identifier. |
| `context_id` | `UUID` | ✅ Yes | Binding to Context. |
| `plan_id` | `UUID` | ❌ No | Binding to Plan. |
| `root_span` | `TraceBase` | ✅ Yes | Root span definition. |
| `status` | `Enum` | ✅ Yes | `pending`, `running`, `completed`, `failed`, `cancelled`. |
| `started_at` | `DateTime` | ❌ No | Start timestamp. |
| `finished_at` | `DateTime` | ❌ No | Finish timestamp. |
| `segments` | `Array` | ❌ No | List of `TraceSegment`. |
| `events` | `Array` | ❌ No | Key execution events. |

### TraceSegment Object
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `segment_id` | `UUID` | ✅ Yes | Segment identifier. |
| `parent_segment_id` | `UUID` | ❌ No | Parent segment ID. |
| `label` | `String` | ✅ Yes | Human-readable label. |
| `status` | `Enum` | ✅ Yes | `pending`, `running`, `completed`, `failed`, `cancelled`, `skipped`. |
| `started_at` | `DateTime` | ❌ No | Start timestamp. |
| `finished_at` | `DateTime` | ❌ No | Finish timestamp. |
| `attributes` | `Object` | ❌ No | Key-value context attributes. |

## 5. Binding Points

- **L1 Schema**: `mplp-trace.schema.json`
- **L2 Events**: `RuntimeExecutionEvent`.
- **PSG Path**: `psg.traces`.

## 6. Interaction Model

1.  **Start**: Runtime initializes Trace when Plan starts (Status: `running`).
2.  **Update**: Runtime appends Spans/Segments as steps execute.
3.  **Finish**: Runtime finalizes Trace when Plan ends (Status: `completed` or `failed`).

## 7. Versioning & Invariants

- **Invariant**: `finished_at` **MUST** be greater than or equal to `started_at`.
- **Invariant**: A Trace cannot be modified after it reaches a terminal state (`completed`, `failed`, `cancelled`), except for appending late-arriving events.

## 8. Security / Safety Considerations

- **Data Privacy**: Traces **SHOULD NOT** contain sensitive data (PII/Secrets) in `attributes` or `label`.
- **Retention**: Traces are often high-volume; implementations should define retention policies.

## 9. References

- [Context Module](context-module.md)
- [Plan Module](plan-module.md)
