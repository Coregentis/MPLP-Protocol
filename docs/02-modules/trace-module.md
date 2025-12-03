---
MPLP Protocol: v1.0.0 — Frozen Specification
Freeze Date: 2025-12-03
Status: FROZEN (no breaking changes permitted)
Governance: MPLP Protocol Governance Committee (MPGC)
Copyright: © 2025 邦士（北京）网络科技有限公司
License: Apache-2.0
Any normative change requires a new protocol version.
---

---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
| :--- | :--- | :--- |
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
