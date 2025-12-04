## 1. Introduction

This document defines the **canonical mapping rules** from MPLP JSON Schema v2 to TypeScript and Python models. All MPLP SDK implementations (current and future) MUST conform to these rules to ensure cross-language protocol consistency at the HTTP/gRPC level.

### 1.1 Conformance Requirements

> **MANDATORY**: All MPLP SDKs (TypeScript, Python, and future languages) MUST implement models strictly according to this mapping standard. Any deviation is a protocol-breaking change and MUST be accompanied by a new schema version and changelog entry.

---

## 2. Schema Categories & Naming Standards

MPLP v1.0 organizes schemas into five distinct categories, each with specific naming conventions and generation rules.

### 2.1. L1 Core Modules (`schemas/v2/`)
- **Path**: `schemas/v2/<module>/mplp-<module>.schema.json`
- **Naming**: `mplp-<module>.schema.json` (e.g., `mplp-context.schema.json`)
- **Stability**: This naming convention is a **v1.0 Protocol Guarantee**. It MUST NOT be changed in minor versions.
- **Generation**: Must generate main protocol types (e.g., `Context`, `Plan`).

### 2.2. Observability Events (`schemas/v2/events/`)
- **Path**: `schemas/v2/events/mplp-<name>-event.schema.json`
- **Physical Schemas**:
  - `mplp-event-core.schema.json` (Base type)
  - `mplp-pipeline-stage-event.schema.json`
  - `mplp-graph-update-event.schema.json`
  - `mplp-runtime-execution-event.schema.json`
- **Logical Mapping**: The 12 logical event families map to these 3 physical schemas (plus core).
- **Generation**: Must generate event types (e.g., `PipelineStageEvent`).

### 2.3. Learning Samples (`schemas/v2/learning/`)
- **Path**: `schemas/v2/learning/mplp-learning-sample-<family>.schema.json`
- **Physical Schemas**:
  - `mplp-learning-sample-core.schema.json`
  - `mplp-learning-sample-intent.schema.json`
  - `mplp-learning-sample-delta.schema.json`
- **Generation**: Must generate sample types.

### 2.4. Integration (`schemas/v2/integration/`)
- **Path**: `schemas/v2/integration/mplp-<name>-event.schema.json`
- **Schemas**: `mplp-tool-event`, `mplp-git-event`, `mplp-ci-event`, `mplp-file-update-event`.
- **Generation**: Optional, for integration adapters.

### 2.5. Invariants (`schemas/v2/invariants/`)
- **Path**: `schemas/v2/invariants/*.yaml`
- **Format**: YAML (not JSON Schema).
- **Generation**: Not used for type generation; used for runtime validation logic.

---

## 3. JSON Schema → Abstract Model Rules

These rules apply universally before language-specific projection.

### 3.1 Type System

| JSON Schema Type | Abstract Semantics |
|-----------------|-------------------|
| `"string"` | Unicode text sequence |
| `"integer"` | Whole number (no fractional part) |
| `"number"` | Numeric value (may include decimals) |
| `"boolean"` | True or false value |
| `"array"` | Ordered list of items |
| `"object"` | Key-value map with defined properties |
| `"null"` | Absence of value |

### 3.2 Format Constraints

| Format | Constraint |
|--------|-----------|
| `"date-time"` | ISO 8601 timestamp (e.g., `2025-01-28T15:30:00.000Z`) |
| `"uuid"` | RFC 4122 UUID (typically v4) |
| `"uri"` | Valid URI per RFC 3986 |
| `"email"` | Valid email address per RFC 5322 |

### 3.3 Enum Values

- `enum` array defines **exhaustive set** of valid literal values
- No value outside this set is permitted
- Case-sensitive string matching

### 3.4 Required vs Optional

- Fields in `required` array MUST be present
- Fields not in `required` are optional (may be omitted or `null`)

### 2.5 Reference Resolution (`$ref`)

#### 2.5.1 Internal References
- `#/$defs/TypeName` or `#/definitions/TypeName` → Local definition within same schema file

#### 2.5.2 External References
- `common/metadata.schema.json` → Cross-file schema reference
- `common/metadata.schema.json#/$defs/TypeName` → Specific definition in external schema

### 2.6 Composition Keywords

#### 2.6.1 `allOf`
- Merges all subschemas
- Final model contains union of all `properties` and `required` arrays
- Type conflicts are schema errors

#### 2.6.2 `oneOf` / `anyOf`
- Represents type union (choose one variant)
- Used for polymorphic fields

### 2.7 Additional Properties

| Schema | Semantics |
|--------|-----------|
| `"additionalProperties": false` | Strict: only declared properties allowed |
| `"additionalProperties": true` | Permissive: any extra properties allowed |
| `"additionalProperties": {...}` | Typed map: extra properties must match schema |

---

## 3. JSON Schema → TypeScript Mapping

### 3.1 Primitive Types

| JSON Schema | TypeScript |
|-------------|-----------|
| `"string"` | `string` |
| `"integer"` | `number` |
| `"number"` | `number` |
| `"boolean"` | `boolean` |
| `"null"` | `null` |

### 3.2 Format Mapping

| Format | TypeScript Type | Notes |
|--------|----------------|-------|
| `"date-time"` | `string` | ISO 8601 string; validator enforces format |
| `"uuid"` | `string` | Pattern validated at runtime |
| `"uri"` | `string` | Pattern validated at runtime |

**Rationale**: TypeScript has no native `Date` type in pure type system; serialization requires string representation.

### 3.3 Enum Mapping

```typescript
// Schema: { "enum": ["draft", "active", "closed"] }
type Status = "draft" | "active" | "closed";
```

- Use **string literal union types**
- Do NOT use TypeScript `enum` (to avoid runtime codegen)

### 3.4 Required vs Optional

```typescript
// Schema: { "required": ["id", "title"] }
interface Example {
  id: string;        // required
  title: string;     // required
  summary?: string;  // optional (not in required array)
}
```

### 3.5 Array Mapping

```typescript
// Schema: { "type": "array", "items": { "type": "string" } }
type Tags = string[];

// Schema: { "type": "array", "items": { "$ref": "#/$defs/Step" } }
type Steps = Step[];
```

### 3.6 Object Mapping

#### 3.6.1 Defined Properties
```typescript
// Schema: { "type": "object", "properties": {...} }
interface Context {
  meta: Metadata;
  context_id: string;
  // ...
}
```

#### 3.6.2 Additional Properties
```typescript
// additionalProperties: false → no extra config needed (TypeScript default)

// additionalProperties: true → use index signature
interface Attributes {
  [key: string]: any;
}
```

### 3.7 Reference Resolution

```typescript
// Internal ref: #/$defs/PlanStep
interface Plan {
  steps: PlanStep[];  // PlanStep defined in same file
}

// External ref: common/metadata.schema.json
import { Metadata } from '../common/metadata';
interface Context {
  meta: Metadata;
}
```

### 3.8 Composition

#### allOf
```typescript
// Schema: { "allOf": [{ "$ref": "A" }, { "properties": {...} }] }
// → Merge all properties into single interface
interface Combined extends A {
  // additional properties
}
```

#### oneOf / anyOf
```typescript
// Schema: { "oneOf": [{ "$ref": "TypeA" }, { "$ref": "TypeB" }] }
type Value = TypeA | TypeB;
```

---

## 4. JSON Schema → Python (Pydantic v2) Mapping

### 4.1 Primitive Types

| JSON Schema | Python Type |
|-------------|------------|
| `"string"` | `str` |
| `"integer"` | `int` |
| `"number"` | `float` |
| `"boolean"` | `bool` |
| `"null"` | `None` |

### 4.2 Format Mapping

| Format | Python Type | Notes |
|--------|------------|-------|
| `"date-time"` | `datetime` | From `datetime` module; Pydantic handles ISO parsing |
| `"uuid"` | `str` (with pattern) | `Annotated[str, Field(pattern=r"...")]` |
| `"uri"` | `str` | Pattern validated via Pydantic |

### 4.3 Enum Mapping

**Standard**: Use `Literal` for type-safe enums

```python
from typing import Literal

# Schema: { "enum": ["draft", "active", "closed"] }
Status = Literal["draft", "active", "closed"]

class Context(BaseModel):
    status: Status
```

**Alternative** (if enum needs methods): Python `Enum` class is permitted, but `Literal` is preferred for simplicity.

### 4.4 Required vs Optional

```python
from typing import Optional
from pydantic import BaseModel, Field

# Schema: { "required": ["id", "title"] }
class Example(BaseModel):
    id: str                              # required
    title: str                           # required
    summary: Optional[str] = None        # optional
```

### 4.5 Array Mapping

```python
from typing import List

# Schema: { "type": "array", "items": { "type": "string" } }
tags: List[str]

# Schema: { "type": "array", "items": { "$ref": "#/$defs/Step" } }
steps: List[Step]
```

### 4.6 Object Mapping

#### 4.6.1 Defined Properties
```python
class Context(BaseModel):
    meta: Metadata
    context_id: str
    # ...
```

#### 4.6.2 Additional Properties
```python
from pydantic import ConfigDict

# additionalProperties: false
class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")

# additionalProperties: true
class Permissive(BaseModel):
    model_config = ConfigDict(extra="allow")

# additionalProperties: {...schema} → Dict with typed values
class TypedMap(BaseModel):
    attributes: Dict[str, str]
```

### 4.7 Reference Resolution

```python
# Internal ref: #/$defs/PlanStep
class Plan(BaseModel):
    steps: List[PlanStep]  # PlanStep in same file

# External ref: common/metadata.schema.json
from mplp_sdk.models.common.meta import Metadata
class Context(BaseModel):
    meta: Metadata
```

### 4.8 Composition

#### allOf
```python
# Flatten all properties into single model
# (Pydantic does not support multiple inheritance cleanly for allOf)
class Combined(BaseModel):
    # All properties from all allOf schemas merged
    pass
```

#### oneOf / anyOf
```python
from typing import Union

# Schema: { "oneOf": [{ "$ref": "TypeA" }, { "$ref": "TypeB" }] }
Value = Union[TypeA, TypeB]
```

---

## 5. ValidationResult Contract

All MPLP SDKs MUST implement a standardized validation result structure:

### 5.1 Structure Definition

> **Implementation Status**: Implemented in TypeScript and Python SDKs as of v1.0.0.

**TypeScript**:
```typescript
interface ValidationErrorItem {
  path: string;    // e.g., "meta.protocol_version" or "steps[0].step_id"
  code: string;    // e.g., "required", "type_error", "enum_value"
  message: string; // Human-readable error description
}

interface ValidationResult {
  ok: boolean;
  errors: ValidationErrorItem[];
}
```

**Python**:
```python
from typing import NamedTuple, List

class ValidationErrorItem(NamedTuple):
    path: str
    code: str
    message: str

class ValidationResult(NamedTuple):
    ok: bool
    errors: List[ValidationErrorItem]
```

### 5.2 Standard Error Codes

| Code | Meaning |
|------|---------|
| `required` | Required field missing |
| `type` | Value has wrong type |
| `enum` | Value not in allowed enum set |
| `pattern` | String doesn't match regex pattern |
| `format` | Value doesn't match format constraint (e.g., date-time) |
| `min_length` / `max_length` | String/array length constraint violated |
| `minimum` / `maximum` | Numeric bound violated |
| `extra_forbidden` | Additional property present when `additionalProperties: false` |

### 5.3 Error Path Format

- Dot notation for nested objects: `"meta.protocol_version"`
- Bracket notation for arrays: `"steps[0].step_id"`
- Must uniquely identify the failing field

---

## 6. Cross-Language Guarantees

When the same logical input is provided to TS and Python builders:

### 6.1 Structural Equivalence
- Field names MUST be identical
- Nesting structure MUST match
- Field presence (required vs optional) MUST align

### 6.2 Type Equivalence
- String fields → `string` (TS) / `str` (Py)
- Number fields → `number` (TS) / `int` or `float` (Py)
- Boolean fields → `boolean` (TS) / `bool` (Py)
- Date-time → ISO 8601 string in both languages

### 6.3 ID Relationships
- `plan.context_id` MUST equal `context.context_id`
- `confirm.target_id` MUST equal `plan.plan_id`
- `trace.context_id` MUST equal `context.context_id`

### 6.4 Serialization
- Both SDKs MUST produce JSON-serializable output
- Datetime values MUST use ISO 8601 string format
- UUIDs MUST use lowercase hyphenated format

---

## 7. Versioning & Breaking Changes

### 7.1 Schema Version Changes

Any change to this mapping standard that affects generated models is a **breaking change** and requires:

1. Incrementing schema version (e.g., `v2.0.0` → `v3.0.0`)
2. Updating `CHANGELOG.md` with migration guide
3. Documenting differences in this file's appendix

### 7.2 Non-Breaking Changes

The following are permitted without version bump:
- Adding new optional fields (not in `required`)
- Relaxing constraints (e.g., removing `pattern`)
- Adding new error codes to ValidationResult

---

## 8. Conformance Testing

All SDK implementations MUST pass:

1. **Schema Alignment Tests** - Verify field sets and required arrays match schemas
2. **Cross-Language Builder Tests** - Verify TS and Py produce equivalent JSON
3. **ValidationResult Tests** - Verify error structure matches Section 5
4. **Runtime Compatibility Tests** - Verify runtime output passes SDK validators (via `pnpm test:runtime-compat`)

## 8.x Cross-Language Validation Conformance

The SDKs enforce strict alignment of validation errors across languages:

- **Error Codes**: Both SDKs map internal errors (Ajv/Pydantic) to the standard set in Section 5.2.
- **Error Paths**: Both SDKs use the same dot/bracket notation (e.g., `meta.protocol_version`, `steps[0].step_id`).
- **Equivalence**: For the same invalid input, both SDKs MUST produce the exact same set of `(path, code)` pairs.
- **Fixtures**: Conformance is verified using shared fixtures in `tests/cross-language/validation/fixtures/`.

---

## Appendix A: Known Limitations

### A.1 Date-Time Representation

- **TS**: Uses `string` because no native `DateTime` type in type system
- **Py**: Uses `datetime` object, auto-serializes to ISO 8601 string

**Impact**: Minimal - both serialize to same JSON format

### A.2 Additional Properties in TypeScript

TypeScript has no runtime enforcement of `additionalProperties: false`. This is acceptable as:
- Validators catch violations at runtime
- Type system prevents compile-time additions

---

**Document Control**:
- **Author**: MPLP Protocol Team
- **Last Updated**: 2025-11-29
- **Status**: Normative v1.0.0
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
