---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-SCV-01_SCHEMA_SURFACE_COMPLETENESS_VERIFICATION"
---


# METHOD-SCV-01: Schema Surface Completeness Verification

**Document ID**: METHOD-SCV-01  
**Version**: 1.0.1  
**Status**: Active  
**Created**: 2026-01-04  
**Revised**: 2026-01-04 (v1.0.1 — scope clarification, SNF definition)

---

## 1. Purpose

Provides a reusable, evidence-based methodology to verify that **schema-derived artifacts** (schema mirrors, generated types) **completely cover** the surface (fields, structures, constraints) defined by the ten module schemas in `schemas/v2/`.

---

## 2. Constitutional Principle

> **Derived artifacts are projections of Truth Sources.**
>
> If a derivation fails SCV validation, the **fix target is always the derived artifact, never the Truth Source**.
>
> SDK types and generated models can be used to *verify* coverage, but they can **never** redefine, modify, or become the source of protocol truth.

---

## 3. Relationship to Other Verification Methods

| Method | Scope | Question Answered |
|:---|:---|:---|
| **TSV-01** | Truth Source | "Is the reference chain valid?" |
| **SCV-01** | Schema Projection | "Are all fields/structures covered in derived schemas?" |
| **SUC-01** | Runtime Contract | "Is the SDK/API usage pattern correct?" |
| **DIV-01** | Derivation Process | "Is the derivation reproducible?" |

**Dependency**: SCV-01 builds on TSV-01's verified truth sources. DIV-01 should pass before SCV-01 is meaningful.

---

## 4. Scope (Strictly Defined)

### 4.1 IN SCOPE: Schema-level Derived Artifacts

| Category | Examples | Verification Focus |
|:---|:---|:---|
| **Schema mirrors** | `sdk-ts/schemas/`, `sdk-py/schemas/` copies | Byte-level or structural identity |
| **Generated type definitions** | TypeScript interfaces, Python Pydantic models | Field presence, type alignment |
| **Generated validators** | AJV compiled validators, Pydantic validators | Schema fidelity |

### 4.2 OUT OF SCOPE (Handled by SUC-01)

| Category | Reason | Redirect |
|:---|:---|:---|
| **SDK public API** | Function signatures ≠ schema structure | SUC-01 §API Binding |
| **CLI flags** | CLI is UI layer, not schema projection | SUC-01 §Runtime Contract |
| **Runtime injection** | Behavioral concern, not structural | SUC-01 §Injection Proof |
| **SDK round-trip** | Serialization behavior, not structure | SUC-01 §Serialization Conformance |

---

## 5. Surface Normal Form (SNF)

To enable **stable, comparable** surface extraction, all manifests use **Surface Normal Form**.

### 5.1 SNF Definition

A Surface Normal Form entry contains ONLY:

```json
{
  "pointer": "#/properties/trace_id",
  "type": "string",
  "required": true,
  "format": "uuid",
  "enum": null,
  "const": null,
  "minLength": null,
  "maxLength": null,
  "minItems": null,
  "maxItems": null,
  "additionalProperties": null,
  "items_ref": null,
  "ref_target": null
}
```

### 5.2 SNF Fields

| Field | Type | Description |
|:---|:---|:---|
| `pointer` | string | JSON Pointer to the field |
| `type` | string | Primitive type: string, number, integer, boolean, object, array, null |
| `required` | boolean | Is this field in parent's `required` array? |
| `format` | string? | Format constraint (uuid, date-time, email, etc.) |
| `enum` | array? | Allowed values if enum |
| `const` | any? | Constant value if const |
| `minLength` / `maxLength` | integer? | String length constraints |
| `minItems` / `maxItems` | integer? | Array size constraints |
| `additionalProperties` | boolean? | For objects: is extra allowed? |
| `items_ref` | string? | For arrays: $ref target of items |
| `ref_target` | string? | Resolved $id + pointer if field is $ref |

### 5.3 SNF Exclusions (NOT captured)

- `$defs` internal structure (resolved via ref_target pointer only)
- `allOf` / `anyOf` / `oneOf` merge semantics (resolved to final shape)
- `title` / `description` / `examples` (documentation, not structure)
- `x-*` vendor extensions (informative only)

### 5.4 SNF Resolution Rules

| Schema Pattern | SNF Resolution |
|:---|:---|
| `{ "$ref": "..." }` | Resolve to target schema, extract its SNF |
| `{ "allOf": [...] }` | Merge all schemas, dedupe by pointer |
| `{ "anyOf": [...] }` | Record as `type: "anyOf"` with branch pointers |
| `{ "oneOf": [...] }` | Record as `type: "oneOf"` with branch pointers |

---

## 6. Five-Step Verification Process

### Step 1: Truth Source Surface Extraction

**Input**: 10 module schemas in `schemas/v2/modules/`

**Output**: `schemas/v2/_manifests/module-surface/<module>.snf.json`

**Actions**:
1. Parse each `mplp-<module>.schema.json`
2. For all `properties`, extract SNF entry
3. Resolve `$ref` chains (max depth: 3)
4. Record `required` array
5. Record `additionalProperties` setting

**Example Output**:
```json
{
  "module": "trace",
  "schema_id": "https://schemas.mplp.dev/v1.0/modules/mplp-trace.schema.json",
  "extracted_at": "2026-01-04T00:00:00Z",
  "snf_version": "1.0.0",
  "additionalProperties": false,
  "required": ["trace_id", "context_id", "root_span", "status", "meta"],
  "surface": [
    {
      "pointer": "#/properties/trace_id",
      "type": "string",
      "required": true,
      "format": "uuid",
      "ref_target": "common/identifiers.schema.json#/$defs/uuid_v4"
    },
    {
      "pointer": "#/properties/events",
      "type": "array",
      "required": true,
      "items_ref": "common/events.schema.json#"
    }
  ]
}
```

---

### Step 2: Derived Surface Extraction

**Input**: Derived artifacts (schema copies, generated types)

**Output**: `derived/_manifests/surface/<artifact>.snf.json`

**Actions**:
1. For schema mirrors: parse JSON Schema, extract SNF
2. For generated types: parse source file, extract field structure
3. Map to equivalent SNF format

**TypeScript Type → SNF Mapping**:

| TypeScript | SNF Equivalent |
|:---|:---|
| `string` | `{ "type": "string" }` |
| `number` | `{ "type": "number" }` |
| `boolean` | `{ "type": "boolean" }` |
| `T[]` | `{ "type": "array", "items_ref": "T" }` |
| `T \| null` | `{ "type": "...", "required": false }` |
| `"a" \| "b" \| "c"` | `{ "type": "string", "enum": ["a", "b", "c"] }` |

---

### Step 3: Surface Diff Analysis

**Input**: Truth SNF + Derived SNF

**Output**: `reports/scv/<module>.diff.md`

**Diff Categories**:

| Category | Definition | Verdict |
|:---|:---|:---:|
| **Missing pointer** | Truth field not in derived | 🔴 FAIL |
| **Extra pointer (non-extension)** | Derived field not in truth, outside extension scope | 🔴 FAIL |
| **Extra pointer (extension scope)** | Derived field in `extensions` or `x_*` namespace | 🟡 WARN + Record |
| **Type mismatch** | Different primitive type | 🔴 FAIL |
| **Required → optional** | Truth required, derived optional | 🔴 FAIL |
| **Enum → string** | Truth has enum, derived collapses to string | 🔴 FAIL |
| **Format lost** | Truth has format, derived drops it | 🟡 WARN |
| **Constraint weakened** | minItems/minLength reduced | 🔴 FAIL |

**Extension Scope Definition**:
- Pointer matches `#/properties/extensions` or `#/properties/extensions/*`
- Pointer matches `#/properties/x_*` pattern
- Parent object has `additionalProperties: true`

### 3.1 additionalProperties Projection Rules

| Source Schema | Derived Artifact | Required Behavior |
|:---|:---|:---|
| `additionalProperties: false` | SDK types (TS) | MUST NOT allow index signatures (`[key: string]: any`) |
| `additionalProperties: false` | SDK models (Py) | MUST use `extra = "forbid"` in Pydantic config |
| `additionalProperties: false` | Runtime API | MUST reject unknown fields at validation |
| `additionalProperties: true` | SDK types | MAY allow index signatures |
| `additionalProperties: true` | Runtime API | MAY accept unknown fields |

**Rationale**: This is a common source of SDK drift where schemas strictly forbid extra fields but generated types permissively accept them.

### Step 4: Maximal Fixture Validation

**Purpose**: Validate derived artifact accepts full-surface instances.

**Fixture Types**:

| Type | Description | Required |
|:---|:---|:---:|
| **Minimal Valid** | Only required fields | ≥1 per module |
| **Maximal Valid** | All optional fields populated | ≥1 per module |
| **Branch Coverage** | One per oneOf/anyOf branch | All branches |

**Validation Chain**:
1. Validate fixture against truth schema → PASS
2. Validate fixture against derived schema → PASS

**Output**: `tests/golden/scv/<module>/`

---

### Step 5: Coverage Report & Verdict

**Output**: `reports/scv/<module>.verdict.md`

**Report Template**:
```markdown
## SCV Verdict: trace

**Extracted**: 2026-01-04T00:00:00Z
**Truth Schema**: mplp-trace.schema.json
**Derived Artifact**: sdk-ts/src/generated/types/trace.ts

### Surface Coverage

| Metric | Value |
|:---|:---:|
| Truth pointers | 12 |
| Derived pointers | 11 |
| Missing | 1 |
| Extra (extension) | 0 |
| Extra (non-extension) | 0 |

### Failures

| Pointer | Issue |
|:---|:---|
| #/properties/segments | Missing in derived |

### Verdict: 🔴 FAIL
```

---

## 7. Evidence Artifacts

A complete SCV verification produces:

| Artifact | Required |
|:---|:---:|
| Truth Surface Manifests (SNF, 10 modules) | ✅ |
| Derived Surface Manifests (SNF, per target) | ✅ |
| Surface Diff Reports | ✅ |
| Maximal Valid Fixtures | ✅ |
| Coverage Verdict Reports | ✅ |

---

## 8. Reference SNF: trace Module

**File**: `schemas/v2/_manifests/module-surface/trace.snf.json`

```json
{
  "module": "trace",
  "schema_id": "https://schemas.mplp.dev/v1.0/modules/mplp-trace.schema.json",
  "extracted_at": "2026-01-04T00:00:00Z",
  "snf_version": "1.0.0",
  "additionalProperties": false,
  "required": ["trace_id", "context_id", "root_span", "status", "meta"],
  "surface": [
    {
      "pointer": "#/properties/trace_id",
      "type": "string",
      "required": true,
      "format": "uuid"
    },
    {
      "pointer": "#/properties/context_id",
      "type": "string",
      "required": true,
      "format": "uuid"
    },
    {
      "pointer": "#/properties/plan_id",
      "type": "string",
      "required": false,
      "format": "uuid"
    },
    {
      "pointer": "#/properties/root_span",
      "type": "object",
      "required": true,
      "ref_target": "common/trace-base.schema.json#"
    },
    {
      "pointer": "#/properties/events",
      "type": "array",
      "required": true,
      "items_ref": "common/events.schema.json#"
    },
    {
      "pointer": "#/properties/segments",
      "type": "array",
      "required": false
    },
    {
      "pointer": "#/properties/status",
      "type": "string",
      "required": true,
      "enum": ["pending", "running", "completed", "failed", "cancelled"]
    },
    {
      "pointer": "#/properties/meta",
      "type": "object",
      "required": true,
      "ref_target": "common/metadata.schema.json#"
    }
  ]
}
```

---

## 9. Reference SNF: plan Module

**File**: `schemas/v2/_manifests/module-surface/plan.snf.json`

```json
{
  "module": "plan",
  "schema_id": "https://schemas.mplp.dev/v1.0/modules/mplp-plan.schema.json",
  "extracted_at": "2026-01-04T00:00:00Z",
  "snf_version": "1.0.0",
  "additionalProperties": false,
  "required": ["plan_id", "context_id", "title", "objective", "status", "steps", "meta"],
  "surface": [
    {
      "pointer": "#/properties/plan_id",
      "type": "string",
      "required": true,
      "format": "uuid"
    },
    {
      "pointer": "#/properties/context_id",
      "type": "string",
      "required": true,
      "format": "uuid"
    },
    {
      "pointer": "#/properties/title",
      "type": "string",
      "required": true,
      "minLength": 1
    },
    {
      "pointer": "#/properties/objective",
      "type": "string",
      "required": true,
      "minLength": 1
    },
    {
      "pointer": "#/properties/status",
      "type": "string",
      "required": true,
      "enum": ["draft", "proposed", "approved", "in_progress", "completed", "cancelled", "failed"]
    },
    {
      "pointer": "#/properties/steps",
      "type": "array",
      "required": true,
      "minItems": 1,
      "items_ref": "#/$defs/plan_step_core"
    },
    {
      "pointer": "#/properties/events",
      "type": "array",
      "required": false,
      "items_ref": "common/events.schema.json#"
    },
    {
      "pointer": "#/properties/meta",
      "type": "object",
      "required": true,
      "ref_target": "common/metadata.schema.json#"
    },
    {
      "pointer": "#/$defs/plan_step_core/properties/step_id",
      "type": "string",
      "required": true,
      "format": "uuid"
    },
    {
      "pointer": "#/$defs/plan_step_core/properties/description",
      "type": "string",
      "required": true,
      "minLength": 1
    },
    {
      "pointer": "#/$defs/plan_step_core/properties/status",
      "type": "string",
      "required": true,
      "enum": ["pending", "in_progress", "completed", "blocked", "skipped", "failed"]
    },
    {
      "pointer": "#/$defs/plan_step_core/properties/agent_role",
      "type": "string",
      "required": false
    },
    {
      "pointer": "#/$defs/plan_step_core/properties/depends_on",
      "type": "array",
      "required": false
    }
  ]
}
```

---

## 10. Applicability

| Module | Priority | Nested Structures |
|:---|:---:|:---|
| **trace** | HIGH | events[], segments[], root_span{} |
| **plan** | HIGH | steps[], events[], plan_step_core |
| **context** | HIGH | root{}, world_state{} |
| **confirm** | MEDIUM | decisions[] |
| **collab** | MEDIUM | participants[] |
| **dialog** | MEDIUM | messages[] |
| **role** | LOW | capabilities[] |
| **extension** | LOW | config{} |
| **network** | LOW | nodes[] |
| **core** | LOW | modules[] |

---

## 11. Governance

This methodology is governed by:

- **MPLP Protocol Governance Committee (MPGC)**
- **Constitutional Documents**: `governance/constitutional/`

Any modification to SCV-01 requires documented justification.

---

**Document Status**: Governance Methodology  
**Version**: 1.0.1  
**Supersedes**: v1.0.0 (scope clarification)  
**References**: METHOD-TSV-01, METHOD-DIV-01, governance/constitutional/DOC_AUDIT_METHODOLOGY_SPEC.md
