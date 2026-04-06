---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-SUC-01_SCHEMA_USAGE_CONFORMANCE_VERIFICATION"
---


# METHOD-SUC-01: Schema Usage Conformance Verification

**Document ID**: METHOD-SUC-01  
**Version**: 1.0.1  
**Status**: Active  
**Created**: 2026-01-04  
**Revised**: 2026-01-04 (v1.0.1 — absorbed API/runtime concerns from SCV-01)

---

## 1. Purpose

Provides a reusable, evidence-based methodology to verify that **SDK APIs, runtime contracts, and serialization behavior** correctly use the ten module schemas' patterns, semantics, and composition rules — preventing "usage drift" at the runtime and API layers.

---

## 2. Constitutional Principle

> **SDK and Runtime are Consumers, Not Authorities.**
>
> If SDK usage differs from schema semantics, the **fix target is the SDK, never the schema**.
>
> If runtime injection omits required fields, it MUST provide explicit Injection Proof — otherwise it is a conformance failure.

---

## 3. Relationship to Other Verification Methods

| Method | Scope | Question Answered |
|:---|:---|:---|
| **TSV-01** | Truth Source | "Is the reference chain valid?" |
| **SCV-01** | Schema Projection | "Are schema-derived types complete?" |
| **DIV-01** | Derivation Process | "Is derivation reproducible?" |
| **SUC-01** | Runtime Contract | "Does SDK/API use schemas correctly?" |

**Dependency Chain**: DIV-01 → SCV-01 → SUC-01 (in order)

---

## 4. Scope (Strictly Defined)

### 4.1 IN SCOPE: Runtime and API Concerns

| Category | Examples | Verification Focus |
|:---|:---|:---|
| **SDK Public API** | `createTrace()`, `loadPlan()` function signatures | Parameter binding to schema pointers |
| **CLI Interfaces** | `mplp run --context`, `mplp validate --schema` | Flag binding to schema fields |
| **Runtime Injection** | Fields set by runtime, not user input | Injection proof with before/after validation |
| **Serialization Fidelity** | JSON serialize → deserialize round-trip | No field loss, no type mutation |
| **Use-site Semantics** | Enums, oneOf branches, required vs optional | Semantic preservation |

### 4.2 OUT OF SCOPE (Handled by SCV-01)

| Category | Reason | Redirect |
|:---|:---|:---|
| **Schema mirror completeness** | Structural, not behavioral | SCV-01 |
| **Generated type field count** | Coverage, not usage | SCV-01 |
| **SNF extraction** | Schema-level concern | SCV-01 |

---

## 5. Three Categories of Usage Drift

| Category | Description | Detection Method |
|:---|:---|:---|
| **API Binding Drift** | SDK parameter doesn't map to schema pointer | Binding Table analysis |
| **Semantic Weakening** | Enum → string, required → optional | Use-site diff |
| **Injection Violation** | Required field omitted, no injection proof | Injection audit |

---

## 6. Six-Step Verification Process

### Step 1: Canonical Use-site Extraction

**Input**: canonical MPLP schema bundle in `schemas/v2/`

**Output**: `schemas/v2/_manifests/use-sites/<module>.use-sites.json`

**Use-site Definition**:
A use-site is any point where a schema:
- References another schema via `$ref`
- Defines an enum constraint
- Marks a field as `required`
- Uses `oneOf` / `anyOf` branching

**Use-site Entry Format**:
```json
{
  "id": "trace_events",
  "pointer": "#/properties/events",
  "shape": "array",
  "items_shape": "object",
  "wrapper": "ref-only",
  "target": {
    "$id": "https://schemas.mplp.dev/v1.0/common/events.schema.json",
    "pointer": "#"
  },
  "required": true,
  "semantic_contract": "Items MUST conform to event-core with 12-family enum"
}
```

### 1.1 Use-site Stability Rule

> **A use-site ID, once defined, MUST remain stable across protocol versions unless explicitly deprecated.**

| Allowed | Forbidden |
|:---|:---|
| Add new use-site with new ID | Rename existing use-site ID |
| Deprecate use-site (with migration) | Remove use-site ID without deprecation |
| Modify semantic_contract (informative) | Change pointer of existing ID |

**Rationale**: Use-site IDs are referenced by SUC manifests, tests, and documentation. Stability enables EVC-01 backward compatibility checks.

### Step 2: API Binding Table Construction

**Input**: SDK source files, CLI definitions

**Output**: `derived/_manifests/api-binding/<sdk>.binding.json`

**Binding Entry Format**:
```json
{
  "api": "createTrace",
  "parameter": "trace.events",
  "schema_pointer": "#/properties/events",
  "shape_match": true,
  "required_match": true,
  "enum_preserved": "N/A",
  "notes": "Direct passthrough to schema"
}
```

**Binding Table Template** (Markdown):

| API | Parameter | Schema Pointer | Shape | Required | Enum | Verdict |
|:---|:---|:---|:---:|:---:|:---:|:---:|
| `createTrace(...)` | `trace.trace_id` | `#/properties/trace_id` | ✅ | ✅ | N/A | ✅ |
| `createTrace(...)` | `trace.status` | `#/properties/status` | ✅ | ✅ | ❌ string | 🔴 |
| `createPlan(...)` | `plan.steps[]` | `#/properties/steps` | ✅ | ✅ | N/A | ✅ |

---

### Step 3: Use-site Semantic Diff

**Input**: Canonical use-sites + API bindings

**Output**: `reports/suc/<sdk>.use-site-diff.md`

**Semantic Diff Categories**:

| Mismatch | Definition | Verdict |
|:---|:---|:---:|
| **Pointer mismatch** | API param doesn't map to schema pointer | 🔴 FAIL |
| **Shape mismatch** | array→object, string→number | 🔴 FAIL |
| **Enum → string** | SDK collapses enum to generic string | 🔴 FAIL |
| **Required → optional** | Schema required, SDK makes optional | 🔴 FAIL* |
| **Const ignored** | Schema const value not enforced | 🔴 FAIL |
| **OneOf flattened** | SDK doesn't distinguish branches | 🟡 WARN |

*Exception: with valid Injection Proof (Step 4)

---

### Step 4: Injection Proof Audit

**Purpose**: For any required field NOT exposed in API, prove runtime injection.

**Injection Proof Entry**:
```json
{
  "field_pointer": "#/properties/meta/properties/protocol_version",
  "schema_required": true,
  "api_exposed": false,
  "injection_rule": "Builder/runtime chain injects fixed protocol_version into meta at object construction",
  "injection_point": "packages/npm/sdk-ts/dist/builders/trace-builder.js:13",
  "test_file": "tests/runtime-compat/ts-runtime-to-ts-sdk.test.ts",
  "evidence": {
    "before_injection_valid": false,
    "after_injection_valid": true
  }
}
```

**Injection Proof Requirements**:
1. ✅ Explicit code reference where injection occurs
2. ✅ Test proving before-injection = INVALID, after-injection = VALID
3. ✅ Trace/log evidence that injection is observable

**Missing Proof** → 🔴 FAIL

---

### Step 5: Serialization Conformance Test

**Purpose**: Prove serialize → deserialize preserves all fields and types.

**Test Structure**:
```
tests/golden/suc/serialization/<module>/
├── round_trip_minimal.test.ts
├── round_trip_maximal.test.ts
└── expected/
    ├── minimal.json
    └── maximal.json
```

**Round-trip Test Logic**:
```typescript
const original = { /* maximal valid instance */ };
const serialized = JSON.stringify(original);
const deserialized = JSON.parse(serialized);

// Assertions:
expect(deserialized).toEqual(original);  // No field loss
expect(validate(deserialized)).toBe(true);  // Still valid
```

**Failure Modes**:

| Issue | Example | Verdict |
|:---|:---|:---:|
| **Field loss** | `segments` disappears after round-trip | 🔴 FAIL |
| **Type mutation** | `status` becomes number instead of string | 🔴 FAIL |
| **Enum collapse** | `"completed"` becomes `"COMPLETED"` | 🔴 FAIL |

---

### Step 6: Contract Test Fixtures (Positive + Negative)

**Purpose**: Prove use-sites reject incorrect usage.

**For each critical use-site, provide**:

| Fixture Type | Purpose | Expected |
|:---|:---|:---:|
| **Positive valid** | Correct usage | PASS |
| **Negative shape** | Wrong type/shape | FAIL |
| **Negative required** | Missing required sub-field | FAIL |
| **Negative enum** | Invalid enum value | FAIL |

**Fixture Directory Structure**:
```
tests/golden/suc/<module>/<use-site>/
├── positive_valid.json
├── negative_wrong_shape.json
├── negative_missing_required.json
└── negative_invalid_enum.json
```

---

## 7. Evidence Artifacts

A complete SUC verification produces:

| Artifact | Required |
|:---|:---:|
| Canonical Use-site Manifests (per module) | ✅ |
| API Binding Tables (per SDK) | ✅ |
| Use-site Semantic Diff Reports | ✅ |
| Injection Proof Declarations | ✅ (if applicable) |
| Serialization Test Files | ✅ |
| Contract Test Fixtures (positive + negative) | ✅ |

---

## 8. Reference Use-site Manifest: trace Module

**File**: `schemas/v2/_manifests/use-sites/trace.use-sites.json`

```json
{
  "module": "trace",
  "schema": "schemas/v2/mplp-trace.schema.json",
  "extracted_at": "2026-01-04T00:00:00Z",
  
  "use_sites": [
    {
      "id": "trace_events",
      "pointer": "#/properties/events",
      "shape": "array",
      "items_shape": "object",
      "wrapper": "ref-only",
      "target": {
        "$id": "https://schemas.mplp.dev/v1.0/common/events.schema.json",
        "pointer": "#"
      },
      "required": true,
      "semantic_contract": "Items MUST conform to event-core with 12-family enum"
    },
    {
      "id": "trace_status_enum",
      "pointer": "#/properties/status",
      "shape": "string",
      "wrapper": "enum",
      "enum_values": ["pending", "running", "completed", "failed", "cancelled"],
      "required": true,
      "semantic_contract": "SDK MUST preserve 5-value enum, NOT collapse to string"
    },
    {
      "id": "trace_meta",
      "pointer": "#/properties/meta",
      "shape": "object",
      "wrapper": "ref-only",
      "target": {
        "$id": "https://schemas.mplp.dev/v1.0/common/metadata.schema.json",
        "pointer": "#"
      },
      "required": true,
      "injection_allowed": true,
      "injection_fields": ["protocol_version", "schema_version"],
      "semantic_contract": "If not user-provided, runtime MUST inject protocol_version"
    }
  ]
}
```

---

## 9. Reference API Binding Table: sdk-ts

**File**: `derived/_manifests/api-binding/sdk-ts.binding.md`

| API Function | Parameter | Use-site ID | Shape | Required | Enum | Verdict |
|:---|:---|:---|:---:|:---:|:---:|:---:|
| `createTrace(opts)` | `opts.trace_id` | - | ✅ string | ✅ | N/A | ✅ PASS |
| `createTrace(opts)` | `opts.context_id` | - | ✅ string | ✅ | N/A | ✅ PASS |
| `createTrace(opts)` | `opts.events` | `trace_events` | ✅ array | ✅ | N/A | ✅ PASS |
| `createTrace(opts)` | `opts.status` | `trace_status_enum` | ✅ string | ✅ | ⚠️ | 🟡 WARN |
| `createTrace(opts)` | `opts.meta` | `trace_meta` | ✅ object | ⚠️ optional | N/A | 🟡 WARN (injection) |
| `createPlan(opts)` | `opts.steps` | `plan_steps` | ✅ array | ✅ | N/A | ✅ PASS |
| `createPlan(opts)` | `opts.steps[].status` | `step_status_enum` | ✅ string | ✅ | ❌ string | 🔴 FAIL |

**Legend**:
- ✅ = Matches canonical
- ⚠️ = Deviation with documented reason (injection proof required)
- ❌ = Semantic violation

---

## 10. Reference Injection Proof: meta.protocol_version

**File**: `derived/_manifests/injection-proofs/trace_meta_protocol_version.json`

```json
{
  "field_pointer": "#/properties/meta/properties/protocol_version",
  "module": "trace",
  "use_site_id": "trace_meta",
  
  "schema_constraint": {
    "type": "string",
    "required": true,
    "pattern": "^\\d+\\.\\d+\\.\\d+$"
  },
  
  "api_behavior": {
    "exposed": false,
    "reason": "Protocol version is SDK constant, not user input"
  },
  
  "injection": {
    "point": "packages/npm/sdk-ts/dist/builders/trace-builder.js:13",
    "rule": "Builder chain injects fixed protocol_version at object creation",
    "value_source": "builder constant '1.0.0'"
  },
  
  "evidence": {
    "test_file": "tests/runtime-compat/ts-runtime-to-ts-sdk.test.ts",
    "before_injection": {
      "input": {"trace_id": "...", "meta": {}},
      "valid": false,
      "error": "meta.protocol_version required"
    },
    "after_injection": {
      "output": {"trace_id": "...", "meta": {"protocol_version": "1.0.0", "schema_version": "1.0.0"}},
      "valid": true
    }
  },
  
  "verdict": "✅ PASS (injection proof complete)"
}
```

---

## 11. Contract Test Fixtures: trace.events

### 11.1 Positive Valid

**File**: `tests/golden/suc/trace/events/positive_valid.json`

```json
{
  "trace_id": "550e8400-e29b-41d4-a716-446655440000",
  "context_id": "123e4567-e89b-12d3-a456-426614174000",
  "root_span": {"span_id": "abcd1234-e89b-12d3-a456-426614174000"},
  "status": "running",
  "events": [
    {
      "event_id": "11111111-1111-4111-8111-111111111111",
      "event_type": "step_started",
      "event_family": "pipeline_stage",
      "timestamp": "2026-01-04T12:00:00.000Z"
    }
  ],
  "meta": {"protocol_version": "1.0.0", "schema_version": "1.0.0"}
}
```

**Expected**: ✅ PASS

### 11.2 Negative: events as object

```json
{
  "events": {"event_1": {...}}
}
```

**Expected**: 🔴 FAIL — events must be array

### 11.3 Negative: invalid event_family

```json
{
  "events": [{"event_family": "custom_family", ...}]
}
```

**Expected**: 🔴 FAIL — event_family not in 12-family enum

---

## 12. Verification Execution Order

```
1. DIV-01: Derivation Integrity
   └── Boundary clean? Manifest fresh?
   
2. SCV-01: Schema Surface Completeness
   └── SNF diff PASS? Fixtures PASS?
   
3. SUC-01: Schema Usage Conformance
   └── API Binding complete?
   └── Injection proofs exist?
   └── Serialization round-trip PASS?
   └── Contract tests PASS?
```

---

## 13. Applicability

| Module | Critical Use-sites | Priority |
|:---|:---|:---:|
| **trace** | events[], status enum, meta injection | HIGH |
| **plan** | steps[], step.status enum, events[] | HIGH |
| **context** | root{}, world_state{} | HIGH |
| **confirm** | decisions[], status enum | MEDIUM |
| **collab** | participants[], mode enum | MEDIUM |
| **dialog** | messages[] | MEDIUM |
| **role** | capabilities[] | LOW |
| **extension** | config{} | LOW |
| **network** | nodes[], topology enum | LOW |
| **core** | modules[] | LOW |

---

## 14. Governance

This methodology is governed by:

- **MPLP Protocol Governance Committee (MPGC)**
- **Constitutional Documents**: `governance/constitutional/`

Any modification to SUC-01 requires documented justification.

---

**Document Status**: Governance Methodology  
**Version**: 1.0.1  
**Supersedes**: v1.0.0 (absorbed API/runtime concerns from SCV-01)  
**References**: METHOD-TSV-01, METHOD-SCV-01, METHOD-DIV-01
