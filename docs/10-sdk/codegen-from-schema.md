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
-------|-----------------|---------------|
| TypeScript | `packages/sdk-ts/src/models/` | Interfaces & Enums |
| Python | `packages/sdk-py/src/mplp_sdk/models/` | Pydantic v2 Classes |
| Go | `packages/sdk-go/pkg/models/` | Structs |
| Java | `packages/sdk-java/src/main/java/com/mplp/models/` | POJOs |

## 4. Event Model Handling

### 4.1 "3 Physical / 12 Logical" Rule

MPLP v1.0 uses a "3 Physical / 12 Logical" event model. SDKs MUST generate types for the **Physical Schemas** only.

- **Physical Schemas** (Generate these):
  - `MplpPipelineStageEvent`
  - `MplpGraphUpdateEvent`
  - `MplpRuntimeExecutionEvent`
  - `MplpEventCore` (Base)

- **Logical Families** (Do NOT generate separate types):
  - Logical families (e.g., `JobState`, `StepState`) are distinguished at runtime by the `family` and `event_type` fields within the physical payload.
  - SDKs should provide **helper constants** or **factory functions** for these logical types, but not distinct class definitions.

## 5. Vendor Neutrality

Generated code MUST NOT contain any vendor-specific logic (e.g., OpenAI, Anthropic, AWS). It must remain strictly a data modeling layer for the MPLP protocol.
