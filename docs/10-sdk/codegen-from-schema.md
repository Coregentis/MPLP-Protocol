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
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
