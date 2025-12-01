---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# Dialog Module

## 1. Scope

This document defines the **Dialog Module**, which standardizes the exchange of messages between agents and users. It adopts a "Minimal Protocol Format" aligned with industry standards (OpenAI/Anthropic).

**Boundaries**:
- **In Scope**: Message Format, Thread Management, Role Definitions.
- **Out of Scope**: Natural Language Understanding (NLU), Prompt Engineering.

## 2. Normative Definitions

- **Dialog**: A stateful conversation session.
- **Thread**: A logical grouping of multi-turn interactions.
- **Message**: An atomic unit of communication (Role + Content).

## 3. Responsibilities (MUST/SHALL)

1.  **Standardization**: Messages **MUST** follow the `role`, `content`, `timestamp` structure.
2.  **Persistence**: Dialog history **SHOULD** be persisted to allow context restoration.
3.  **Attribution**: Every message **MUST** have a valid `role`.

## 4. Architecture Structure

**Schema File**: `schemas/v2/mplp-dialog.schema.json`

### Dialog Object
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `meta` | `Metadata` | ✅ Yes | Protocol metadata. |
| `governance` | `Object` | ❌ No | Lifecycle metadata. |
| `dialog_id` | `UUID` | ✅ Yes | Global unique identifier. |
| `context_id` | `UUID` | ✅ Yes | Binding to Context. |
| `thread_id` | `UUID` | ❌ No | Thread grouping ID. |
| `status` | `Enum` | ✅ Yes | `active`, `paused`, `completed`, `cancelled`. |
| `messages` | `Array` | ✅ Yes | List of `DialogMessage`. |
| `started_at` | `DateTime` | ❌ No | Start timestamp. |
| `ended_at` | `DateTime` | ❌ No | End timestamp. |
| `trace` | `TraceBase` | ❌ No | Trace reference. |
| `events` | `Array` | ❌ No | Key lifecycle events. |

### DialogMessage Object
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `role` | `Enum` | ✅ Yes | `user`, `assistant`, `system`, `agent`. |
| `content` | `String` | ✅ Yes | Plain text content. |
| `timestamp` | `DateTime` | ✅ Yes | Message timestamp. |
| `event` | `Event` | ❌ No | Optional event reference. |

## 5. Binding Points

- **L1 Schema**: `mplp-dialog.schema.json`
- **L2 Events**: `GraphUpdateEvent`.
- **PSG Path**: `psg.dialogs`.

## 6. Interaction Model

1.  **Start**: System initializes Dialog (Status: `active`).
2.  **Exchange**: Participants append Messages to the `messages` array.
3.  **End**: System marks Dialog as `completed`.

## 7. Versioning & Invariants

- **Invariant**: Messages **MUST** be ordered by `timestamp`.
- **Invariant**: `role` must be one of the defined enum values.

## 8. Security / Safety Considerations

- **Sanitization**: Implementations **SHOULD** sanitize `content` to prevent injection attacks if rendered in a UI.
- **Privacy**: PII in `content` **SHOULD** be redacted or encrypted at rest.

## 9. References

- [Context Module](context-module.md)
- [Collab Module](collab-module.md)
