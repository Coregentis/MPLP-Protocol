---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Codegen from Schema

**Status**: Normative Specification for MPLP v1.0 SDK Development

## 1. Overview

This document defines the standard process for generating SDK models from MPLP JSON Schemas. All official SDKs (TypeScript, Python, Go, Java) MUST use this process to ensure protocol fidelity.

## 2. Input Sources

The **Single Source of Truth** for all code generation is the `schemas/v2/` directory.

- **Core Modules**: `schemas/v2/<module>/mplp-<module>.schema.json`
- **Events**: `schemas/v2/events/*.schema.json`
- **Learning**: `schemas/v2/learning/*.schema.json`
- **Integration**: `schemas/v2/integration/*.schema.json`

## 3. Generation Process

### 3.1 Workflow

1. **Schema Collection**: Aggregator script scans `schemas/v2/` for valid JSON Schema files.
2. **Dereferencing**: All `$ref` pointers are resolved (local and remote).
3. **Normalization**: Schemas are normalized to standard JSON Schema Draft 7.
4. **Language Projection**:
   - **TypeScript**: Uses `json-schema-to-typescript` to generate interfaces.
   - **Python**: Uses `datamodel-code-generator` to generate Pydantic v2 models.
   - **Go**: Uses `quicktype` or similar to generate structs.
   - **Java**: Uses `jsonschema2pojo` to generate POJOs.

### 3.2 Output Artifacts

| Language | Output Location | Artifact Type |
|----------|-----------------|---------------|
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
