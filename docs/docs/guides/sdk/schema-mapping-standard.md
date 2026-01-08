---
sidebar_position: 5

doc_type: informative
normativity: informative
status: frozen
authority: Documentation Governance
description: "Canonical mapping rules from MPLP JSON Schema v2 to TypeScript and Python models."
title: Schema Mapping Standard

---


# Schema Mapping Standard


## 1. Introduction

This document defines the **canonical mapping rules** from MPLP JSON Schema v2 to TypeScript and Python models. All MPLP SDK implementations (current and future) MUST conform to these rules to ensure cross-language protocol consistency at the HTTP/gRPC level.

### 1.1 Conformance Requirements

> **MANDATORY**: All MPLP SDKs (TypeScript, Python, and future languages) MUST implement models strictly according to this mapping standard. Any deviation is a protocol-breaking change and MUST be accompanied by a new schema version and changelog entry.

## 2. Definitions

- **Source Schema**: The canonical JSON Schema v2 definitions in `schemas/v2/`.
- **Target Model**: The generated or implemented data structure in the target language (TS Interface, Python Class).
- **Mapping**: The deterministic transformation rule from Source Schema to Target Model.

## 3. JSON Schema Abstract Model Rules

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

### 3.5 Reference Resolution (`$ref`)

#### 3.5.1 Internal References
- `#/$defs/TypeName` or `#/definitions/TypeName` Local definition within same schema file

#### 3.5.2 External References
- `common/metadata.schema.json` Cross-file schema reference
- `common/metadata.schema.json#/$defs/TypeName` Specific definition in external schema

### 3.6 Composition Keywords

#### 3.6.1 `allOf`
- Merges all subschemas
- Final model contains union of all `properties` and `required` arrays
- Type conflicts are schema errors

#### 3.6.2 `oneOf` / `anyOf`
- Represents type union (choose one variant)
- Used for polymorphic fields

### 3.7 Additional Properties

| Schema | Semantics |
|--------|-----------|
| `"additionalProperties": false` | Strict: only declared properties allowed |
| `"additionalProperties": true` | Permissive: any extra properties allowed |
| `"additionalProperties": {...}` | Typed map: extra properties must match schema |

## 4. JSON Schema TypeScript Mapping

### 4.1 Primitive Types

| JSON Schema | TypeScript Type |
|-------------|-----------------|
| `"string"` | `string` |
| `"integer"` | `number` |
| `"number"` | `number` |
| `"boolean"` | `boolean` |
| `"null"` | `null` |

### 4.2 Enum Mapping

**Standard**: Use String Literal Unions for type safety and simplicity.

```typescript
export type Status = "draft" | "active" | "closed";

export interface Context {
  status: Status;
}
```

### 4.3 Required vs Optional

```typescript
export interface Example {
  id: string;           // required
  title: string;        // required
  summary?: string;     // optional (undefined allowed)
}
```

### 4.4 Array Mapping

```typescript
export interface Plan {
  tags: string[];
  steps: Step[];
}
```

### 4.5 Object Mapping

#### 4.5.1 Defined Properties
```typescript
export interface Context {
  meta: Metadata;
  context_id: string;
  // ...
}
```

#### 4.5.2 Additional Properties
```typescript
// additionalProperties: true
export interface Permissive {
  [key: string]: any;
}

// additionalProperties: { type: "string" }
export interface TypedMap {
  attributes: { [key: string]: string };
}
```

## 5. JSON Schema Python (Pydantic v2) Mapping

### 5.1 Primitive Types

| JSON Schema | Python Type |
|-------------|------------|
| `"string"` | `str` |
| `"integer"` | `int` |
| `"number"` | `float` |
| `"boolean"` | `bool` |
| `"null"` | `None` |

### 5.2 Format Mapping

| Format | Python Type | Notes |
|--------|------------|-------|
| `"date-time"` | `datetime` | From `datetime` module; Pydantic handles ISO parsing |
| `"uuid"` | `str` (with pattern) | `Annotated[str, Field(pattern=r"...")]` |
| `"uri"` | `str` | Pattern validated via Pydantic |

### 5.3 Enum Mapping

**Standard**: Use `Literal` for type-safe enums

```python
from typing import Literal

Status = Literal["draft", "active", "closed"]

class Context(BaseModel):
    status: Status
```

### 5.4 Required vs Optional

```python
from typing import Optional
from pydantic import BaseModel, Field

class Example(BaseModel):
    id: str                              # required
    title: str                           # required
    summary: Optional[str] = None        # optional
```

### 5.5 Array Mapping

```python
from typing import List

class Plan(BaseModel):
    tags: List[str]
    steps: List[Step]
```

### 5.6 Object Mapping

#### 5.6.1 Defined Properties
```python
class Context(BaseModel):
    meta: Metadata
    context_id: str
    # ...
```

#### 5.6.2 Additional Properties
```python
from pydantic import ConfigDict

class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")

class Permissive(BaseModel):
    model_config = ConfigDict(extra="allow")
```

### 5.7 Reference Resolution

```python
class Plan(BaseModel):
    steps: List[PlanStep]  # PlanStep in same file

from mplp.models.common.meta import Metadata
class Context(BaseModel):
    meta: Metadata
```

### 5.8 Composition

#### allOf
```python
class Combined(BaseModel):
    # All properties from all allOf schemas merged
    pass
```

#### oneOf / anyOf
```python
from typing import Union

Value = Union[TypeA, TypeB]
```

## 6. Validation Result Standard

All SDK validators MUST return a standardized result object to ensure consistent error handling across languages.

### 6.1 Interface

**TypeScript**:
```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  path: string;        // JSON Pointer (e.g., "meta.version")
  code: string;        // Standard error code
  message: string;     // Human-readable message
  value?: any;         // The invalid value (optional)
}
```

**Python**:
```python
class ValidationResult(BaseModel):
    valid: bool
    errors: List[ValidationError]

class ValidationError(BaseModel):
    path: str
    code: str
    message: str
    value: Optional[Any] = None
```

### 6.2 Standard Error Codes

| Code | Description |
|------|-------------|
| `required` | Missing required field |
| `type_error` | Invalid type (e.g., string expected, got number) |
| `enum` | Value not in enum set |
| `format` | Format constraint failed (e.g., invalid UUID) |
| `pattern` | Regex pattern mismatch |
| `min_items` | Array too short |
| `max_items` | Array too long |
| `const` | Value does not match constant |

## 7. Cross-Language Consistency

When the same logical input is provided to TS and Python builders:

### 7.1 Structural Equivalence
- Field names MUST be identical
- Nesting structure MUST match
- Field presence (required vs optional) MUST align

### 7.2 Type Equivalence
- String fields `string` (TS) / `str` (Py)
- Number fields `number` (TS) / `int` or `float` (Py)
- Boolean fields `boolean` (TS) / `bool` (Py)
- Date-time ISO 8601 string in both languages

### 7.3 ID Relationships
- `plan.context_id` MUST equal `context.context_id`
- `confirm.target_id` MUST equal `plan.plan_id`
- `trace.context_id` MUST equal `context.context_id`

### 7.4 Serialization
- Both SDKs MUST produce JSON-serializable output
- Datetime values MUST use ISO 8601 string format
- UUIDs MUST use lowercase hyphenated format

## 8. Builder Pattern Standard

SDKs MUST provide functional builders for core entities to ensure ease of use and validation.

### 8.1 TypeScript Builder

```typescript
// Functional creator
export function createContext(params: ContextParams): Context {
  // 1. Apply defaults
  // 2. Validate against schema
  // 3. Return typed object
}
```

### 8.2 Python Builder

```python
# Pydantic Constructor
context = Context(
  title="My Project",
  domain="code-assistance",
  # ...
)
# Pydantic validates on initialization
```

## 9. Conformance Testing

All SDK implementations MUST pass:

1. **Schema Alignment Tests** - Verify field sets and required arrays match schemas
2. **Cross-Language Builder Tests** - Verify TS and Py produce equivalent JSON
3. **ValidationResult Tests** - Verify error structure matches Section 6
4. **Runtime Compatibility Tests** - Verify runtime output passes SDK validators (via `pnpm test:runtime-compat`)

## 10. Cross-Language Validation Conformance

The SDKs enforce strict alignment of validation errors across languages:

- **Error Codes**: Both SDKs map internal errors (Ajv/Pydantic) to the standard set in Section 6.2.
- **Error Paths**: Both SDKs use the same dot/bracket notation (e.g., `meta.protocol_version`, `steps[0].step_id`).
- **Equivalence**: For the same invalid input, both SDKs MUST produce the exact same set of `(path, code)` pairs.
- **Fixtures**: Conformance is verified using shared fixtures in `tests/cross-language/validation/fixtures/`.

---

**Document Control**:
- **Author**: MPLP Protocol Team
- **Last Updated**: 2025-11-29
- **Status**: Normative v1.0.0