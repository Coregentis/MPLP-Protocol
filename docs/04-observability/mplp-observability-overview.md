> [!FROZEN]
> **MPLP Protocol v1.0.0 — Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
## 1. Philosophy: "3 Physical, 12 Logical"

MPLP v1.0 adopts a pragmatic approach to observability:

-   **3 Physical Schemas**: Cover the distinct structural requirements of the protocol (Graph Updates, Pipeline Stages, Runtime Execution).
-   **12 Logical Families**: Define the semantic intent of events, mapped to the physical schemas.
-   **Generic Core**: All "Logical-only" families use the generic `mplp-event-core.schema.json`, relying on the `event_type` field and flexible `payload` to carry specific data.

This approach balances **strict typing** for critical protocol mechanics with **flexibility** for diverse runtime implementations.

---

## 2. Physical Schemas

These are the actual JSON Schema files in `schemas/v2/events/`:

1.  **`mplp-graph-update-event.schema.json`**

2.  **`mplp-pipeline-stage-event.schema.json`**

3.  **`mplp-runtime-execution-event.schema.json`**

4.  **`mplp-event-core.schema.json`** (Generic Base)

---

## 3. Logical Event Families

See `mplp-event-taxonomy.yaml` for the complete definition of the 12 families.

### 3.1 Required Families (Must Implement)

### 3.2 Recommended Families (Should Implement)

### 3.3 Optional Families (May Implement)

---

## 4. Profile Events

In addition to the Core Observability layer, specific Profiles define their own event schemas:

-   **SA Profile**: `mplp-sa-event.schema.json` (e.g., `SAStepStarted`).
-   **MAP Profile**: `mplp-map-event.schema.json` (e.g., `MAPTurnDispatched`).

These are required only if the Runtime implements the respective Profile.

---

## 5. Integration with Trace Module

All emitted events MUST be written to the **Trace Module**. The Trace acts as the immutable append-only log for the session.

```json
// Trace Object Structure
{
  "trace_id": "uuid",
  "events": [
    { "event_type": "PipelineStageEvent", ... },
    { "event_type": "GraphUpdateEvent", ... },
    { "event_type": "SAInitialized", ... }
  ]
}
```

---

## 6. Compliance

To be MPLP v1.0 Compliant, a Runtime MUST:
1.  Emit all **Required** event families.
2.  Validate emitted events against the **Physical Schemas**.
3.  Persist events to the **Trace Module**.
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
