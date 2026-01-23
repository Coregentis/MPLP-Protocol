---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-ARCH-SCHEMA-CONV-001"
repo_refs:
  schemas:
    - "schemas/v2/"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: Schema Conventions
sidebar_label: Schema Conventions
sidebar_position: 5
description: "MPLP architecture documentation: Schema Conventions. Defines structural requirements and layer responsibilities."
---

# Schema Conventions

## Scope

This specification defines the normative conventions for all MPLP JSON Schemas, including:
- Naming conventions (snake_case fields, kebab-case files)
- Standard metadata patterns
- Validation rules and extensibility mechanisms
- Backward compatibility guidelines

## Non-Goals

This specification does not define individual schema contents (see L1 Core Protocol) or runtime validation implementations.

---

## 1. Purpose

This document defines the normative conventions, shared patterns, and best practices used across all MPLP v1.0 JSON Schemas. It ensures:
- **Consistency**: Uniform naming, typing, and validation across all 29 schemas
- **Interoperability**: Predictable structure for runtime implementers
- **Extensibility**: Clear extension points for vendor-specific features
- **Compatibility**: Versioning rules that preserve backward compatibility

This document is essential reading for anyone creating custom L4 integration schemas or extending MPLP with custom modules.

## 2. Schema Catalog Structure

### 2.1 Organization

**Location**: `schemas/v2/`  
**Total Schemas**: 29 (10 modules + 6 common + 6 events + 4 integration + 3 learning)

```
schemas/v2/
├── common/                    # 6 shared schemas
│   ├── identifiers.schema.json
│   ├── metadata.schema.json
│   ├── trace-base.schema.json
│   ├── common-types.schema.json
│   ├── events.schema.json
│   └── learning-sample.schema.json
├── events/                    # 6 observability events
│   ├── mplp-event-core.schema.json
│   ├── mplp-pipeline-stage-event.schema.json
│   ├── mplp-graph-update-event.schema.json
│   ├── mplp-runtime-execution-event.schema.json
│   ├── mplp-sa-event.schema.json
│   └── mplp-map-event.schema.json
├── integration/               # 4 L4 integration events
│   ├── mplp-file-update-event.schema.json
│   ├── mplp-git-event.schema.json
│   ├── mplp-ci-event.schema.json
│   └── mplp-tool-event.schema.json
├── learning/                  # 3 learning schemas
│   ├── mplp-learning-sample-core.schema.json
│   ├── mplp-learning-sample-intent.schema.json
│   └── mplp-learning-sample-delta.schema.json
└── mplp-*.schema.json         # 10 module schemas
```

### 2.2 Common Schemas (6 Files)

| Schema | Purpose | Key Exports | Usage |
|:---|:---|:---|:---|
| `identifiers.schema.json` | Universal ID format | UUID v4 pattern | All `*_id` fields reference this |
| `metadata.schema.json` | Protocol metadata | `protocol_version`, `schema_version`, `cross_cutting[]` | All root objects have `meta` field |
| `trace-base.schema.json` | W3C trace compatibility | `trace_id`, `span_id`, `parent_span_id` | Trace module extends this |
| `common-types.schema.json` | Reusable types | `Ref`, annotations, enums | Cross-module references |
| `events.schema.json` | Event arrays | Event collection typing | Module event fields |
| `learning-sample.schema.json` | Learning base | `sample_id`, `input`, `output` | Learning schemas extend this |

## 3. Naming Conventions

### 3.1 File Names

**Rule**: Kebab-case with `.schema.json` extension

**Pattern**: `mplp-{module-name}.schema.json`

**Examples**:
- `mplp-context.schema.json`
- `mplp-file-update-event.schema.json`
- `MPLPContext.schema.json` (PascalCase)
- `mplp_plan_schema.json` (snake_case)

### 3.2 Field Names

**Rule**: Snake_case for all JSON properties

**Examples** (from actual schemas):
```json
{
  "context_id": "...",           // Correct
  "created_at": "...",            // Correct
  "parent_span_id": "...",        // Correct
  "contextId": "...",             // camelCase (wrong)
  "CreatedAt": "...",             // PascalCase (wrong)
  "created-at": "..."             // kebab-case (wrong)
}
```

**Rationale**: Snake_case is language-neutral (works in Python, JavaScript, Go, etc.)

### 3.3 Enum Values

**Rule**: Snake_case for enum constants

**Examples** (from `mplp-plan.schema.json` lines 35-43):
```json
{
  "status": {
    "enum": [
      "draft",
      "proposed",
      "approved",
      "in_progress",        // Snake_case
      "completed",
      "cancelled",
      "failed"
    ]
  }
}
```

**Examples** (from `mplp-collab.schema.json` lines 58-64):
```json
{
  "mode": {
    "enum": [
      "broadcast",
      "round_robin",         // Snake_case with underscore
      "orchestrated",
      "swarm",
      "pair"
    ]
  }
}
```

### 3.4 Type Names in Documentation

**Rule**: PascalCase when referring to types in docs

**Examples**:
- "The **Plan** module defines..."
- "Each **PlanStep** represents..."
- "The **RuntimeContext** holds..."

## 4. Standard Schema Metadata

### 4.1 Required JSON Schema Fields

**All schemas MUST include** (from `mplp-context.schema.json` lines 2-6):

```json
{
  "$comment": "MPLP v1.0.0  Frozen  2025 Apache-2.0 Governance: MPGC",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://schemas.mplp.dev/v1.0/mplp-context.schema.json",
  "title": "MPLP Context Module Core Protocol v1.0",
  "description": "Context Module Core Protocol: ..."
}
```

**Field Descriptions**:
- `$comment`: Freeze status, copyright, license, governance
- `$schema`: JSON Schema Draft-07 (REQUIRED)
- `$id`: Canonical URI for this schema
- `title`: Human-readable name
- `description`: Detailed purpose

### 4.2 Custom MPLP Metadata (`x-mplp-meta`)

**All schemas MUST include** (from context schema, appears at end):

```json
{
  "x-mplp-meta": {
    "protocolVersion": "1.0.0",
    "frozen": true,
    "freezeDate": "2025-12-03",
    "governance": "MPGC"
  }
}
```

**Purpose**: Machine-readable versioning and freeze status

## 5. Common Patterns

### 5.1 Identifier Fields

**Pattern**: All IDs use `$ref` to `common/identifiers.schema.json`

**Example** (from `mplp-plan.schema.json` lines 14-20):
```json
{
  "plan_id": {
    "$ref": "common/identifiers.schema.json",
    "description": "[PROTOCOL-CORE] Global unique identifier for the Plan."
  },
  "context_id": {
    "$ref": "common/identifiers.schema.json",
    "description": "[PROTOCOL-CORE] Identifier of the Context this Plan belongs to."
  }
}
```

**Effect**: All IDs validated as UUID v4 with pattern:
```regex
^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
```

### 5.2 Timestamp Fields

**Pattern**: ISO 8601 datetime strings

**Example** (from `metadata.schema.json` lines 27-33):
```json
{
  "created_at": {
    "type": "string",
    "format": "date-time",
    "description": "Object creation time (ISO 8601 format).",
    "examples": ["2025-01-28T15:30:00.000Z"]
  }
}
```

**Valid Formats**:
- `2025-12-06T12:00:00.000Z` (UTC)
- `2025-12-06T12:00:00+08:00` (timezone offset)
- `1701878400` (Unix epoch - not ISO 8601)
- `2025/12/06 12:00:00` (wrong separator)

### 5.3 Enumerated Status Fields

**Pattern**: Use explicit `enum` arrays

**Example** (from `mplp-confirm.schema.json`):
```json
{
  "status": {
    "type": "string",
    "description": "[PROTOCOL-CORE] Decision status.",
    "enum": ["pending", "approved", "rejected", "override"]
  }
}
```

**Best Practice**: Document state transitions in module docs (see `docs/02-modules/`)

### 5.4 Metadata Block

**Pattern**: All root objects MUST have `meta` field

**Example** (from `mplp-context.schema.json` lines 10-13):
```json
{
  "meta": {
    "$ref": "common/metadata.schema.json",
    "description": "[PROTOCOL-CORE] MPLP protocol and schema metadata."
  }
}
```

**Metadata Contents** (from `metadata.schema.json`):
- **REQUIRED**: `protocol_version` (SemVer), `schema_version` (SemVer)
- **OPTIONAL**: `created_at`, `created_by`, `updated_at`, `updated_by`, `tags[]`, `cross_cutting[]`

### 5.5 Governance Block (Context & Collab Only)

**Pattern**: Optional governance metadata for lifecycle management

**Example** (from `mplp-context.schema.json` lines 14-36):
```json
{
  "governance": {
    "type": "object",
    "description": "[PROTOCOL-CORE] Governance metadata.",
    "properties": {
      "lifecyclePhase": { "type": "string" },
      "truthDomain": { "type": "string" },
      "locked": { "type": "boolean" },
      "lastConfirmRef": { "$ref": "common/common-types.schema.json#/definitions/Ref" }
    }
  }
}
```

## 6. Validation Rules

### 6.1 additionalProperties

**Default**: `"additionalProperties": false` for strict validation

**Example** (from `mplp-context.schema.json` line 8):
```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": { ... }
}
```

**Rationale**: Detect typos/schema mismatches early

**Exception**: `metadata.schema.json` and extension points allow `additionalProperties: true`

### 6.2 Required Fields

**Pattern**: Always specify `required` array

**Example** (from `mplp-plan.schema.json` lines 65-73):
```json
{
  "required": [
    "meta",
    "plan_id",
    "context_id",
    "title",
    "objective",
    "status",
    "steps"
  ]
}
```

### 6.3 String Constraints

**Patterns**:
- **minLength**: For non-empty strings
  ```json
  { "type": "string", "minLength": 1 }
  ```
- **format**: For structured strings
  ```json
  { "type": "string", "format": "date-time" }
  { "type": "string", "format": "email" }
  { "type": "string", "format": "uuid" }
  ```
- **pattern**: For regex validation
  ```json
  {
    "type": "string",
    "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$"  // SemVer
  }
  ```

## 7. Extensibility

### 7.1 Vendor Extensions (via `meta.tags[]`)

**Purpose**: Custom classification without schema changes

**Example**:
```json
{
  "meta": {
    "protocol_version": "1.0.0",
    "schema_version": "2.0.0",
    "tags": ["production", "high-priority", "customer-acme"]
  }
}
```

**Rule**: Vendors SHOULD use prefixes to avoid collisions (e.g., `vendor:custom-tag`)

### 7.2 Cross-Cutting Concerns (via `meta.cross_cutting[]`)

**Purpose**: Opt-in to protocol-defined concerns

**Allowed Values** (from `metadata.schema.json` lines 83-93):
```json
{
  "cross_cutting": {
    "type": "array",
    "items": {
      "type": "string",
      "enum": [
        "coordination",
        "error-handling",
        "event-bus",
        "orchestration",
        "performance",
        "protocol-version",
        "security",
        "state-sync",
        "transaction"
      ]
    }
  }
}
```

**Example**:
```json
{
  "meta": {
    ...,
    "cross_cutting": ["security", "transaction", "performance"]
  }
}
```

### 7.3 Custom Fields (Namespaced)

**Pattern**: Use `x_vendor_` prefix for vendor-specific fields

**Example**:
```json
{
  "plan_id": "plan-123",
  "x_acme_priority": "p0",
  "x_acme_sla_hours": 4
}
```

**Warning**: Custom fields may be rejected if `additionalProperties: false`

## 8. Backward Compatibility

### 8.1 Breaking Changes (Major Version Bump)

**Examples** of breaking changes that require v1.0 v2.0:
- Removing a field (e.g., delete `plan.title`)
- Changing field type (e.g., `plan_id: string` `plan_id: number`)
- Adding new required field (e.g., `plan.priority` becomes required)
- Removing enum value (e.g., remove `status: "draft"`)
- Renaming field (e.g., `created_at` `created_time`)

### 8.2 Non-Breaking Changes (Minor/Patch Version Bump)

**Examples** of non-breaking changes (v1.0 v1.1 or v1.0.0 v1.0.1):
- Adding new **optional** field
- Adding new enum value to end of list
- Relaxing constraint (e.g., `minLength: 5` `minLength: 1`)
- Adding `examples` or improving `description`

### 8.3 Frozen Status

**MPLP v1.0.0 schemas are FROZEN as of 2025-12-03**

**Implications**:
- No breaking changes permitted
- Non-breaking additions require governance approval
- Major changes deferred to v1.1 or v2.0

## 9. Validation Strategy

### 9.1 Recommended Validator

**TypeScript**: AJV v8.12.0
```bash
npm install ajv ajv-formats
```

**Python**: Pydantic v2.0+
```bash
pip install pydantic
```

### 9.2 Strict Mode Validation

**Requirement**: Runtimes MUST use strict validation

**AJV Example**:
```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({
  strict: true,              // Fail on unknown keywords
  allErrors: true,           // Return all errors, not just first
  verbose: true              // Include schema path in errors
});
addFormats(ajv);

// Load schema
const contextSchema = require('./schemas/v2/mplp-context.schema.json');
const validate = ajv.compile(contextSchema);

// Validate data
const valid = validate(data);
if (!valid) {
  console.error(ajv.errorsText(validate.errors));
}
```

### 9.3 Error Reporting

**Best Practice**: Provide actionable error messages

**Example**:
``` Bad:  "Validation failed" Good: "Invalid Plan: field 'steps' must have at least 1 item (currently 0)" Good: "Invalid UUID: 'abc-123' does not match UUID v4 pattern at $.plan_id"
```

## 10. Schema References (`$ref`)

### 10.1 Internal References

**Pattern**: Use JSON Pointer syntax for same-file refs

**Example** (from `mplp-plan.schema.json` line 50):
```json
{
  "steps": {
    "type": "array",
    "items": {
      "$ref": "#/$defs/plan_step_core"
    }
  }
}
```

### 10.2 External References

**Pattern**: Use relative paths for cross-file refs

**Example** (from `mplp-plan.schema.json` line 54):
```json
{
  "trace": {
    "$ref": "common/trace-base.schema.json"
  }
}
```

**Resolution**: Validators resolve relative to schema `$id`

## 11. Documentation Tags

**Convention**: Use `[PROTOCOL-CORE]` prefix for normative fields

**Example** (from `mplp-context.schema.json`):
```json
{
  "context_id": {
    "$ref": "common/identifiers.schema.json",
    "description": "[PROTOCOL-CORE] Global unique identifier for the Context."
  }
}
```

**Purpose**: Clearly mark fields essential for v1.0 compliance

## 12. Related Documents

**Schema Sources**:
- `schemas/v2/` - All 29 JSON Schema files
- `schemas/v2/common/` - 6 common schemas
- `schemas/v2/invariants/` - 5 YAML invariant files

**Architecture**:
- [L1 Core Protocol](l1-core-protocol.md) - Complete schema catalog
- [Architecture Overview](index.mdx) - Layer structure

**Module Docs**:
- `docs/02-modules/` - All 10 module specifications

**Compliance**:
- [Conformance Guide](/docs/guides/conformance-guide.md)

---

**JSON Schema Version**: Draft-07  
**Total Schemas**: 29 (10 modules + 6 common + 6 events + 4 integration + 3 learning)  
**Naming**: snake_case fields, kebab-case files, PascalCase docs  
**Validators**: AJV v8.12.0 (TS), Pydantic v2.0+ (Python)