---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-TSV-01_SCHEMA_TRUTH_SOURCE_VERIFICATION"
---


# METHOD-TSV-01: Schema Truth Source Verification

**Document ID**: METHOD-TSV-01  
**Version**: 1.0.0  
**Status**: Active  
**Created**: 2026-01-04

---

## 1. Purpose

Provides a reusable, evidence-based methodology to verify that derived schemas correctly reference their truth source schemas, preventing drift and ensuring consistency across the MPLP schema ecosystem.

---

## 2. Scope

Applies to any schema claimed as "truth source" for other schemas, including:
- `common/*.schema.json` (base types)
- `taxonomy/*.yaml` (protocol taxonomy)
- `invariants/*.yaml` (validation rules)
- `profiles/*.yaml` (profile definitions)

---

## 3. Five-Step Verification Process

### Step 1: Usage Surface Verification

**Purpose**: Confirm target schema is actually used, not orphan.

**Actions**:
```bash
# Search $id reference
grep -r "schema-$id-uri" .

# Search path reference
grep -r "relative/path/to/schema.json" .

# Search $defs name (if applicable)
grep -r "#/\$defs/DefinitionName" .
```

**Judgment**:
- `hits > 0` in ANY category → Not orphan, proceed
- `hits = 0` in ALL categories → Orphan, document as informative

> **⚠️ CRITICAL DISTINCTION: Usage Evidence vs Truth Authority**
>
> | Source Type | Role in Step 1 | Can Determine Schema Correctness? |
> |:---|:---|:---:|
> | Module schemas (mplp-*.schema.json) | Primary consumer | ❌ No (but proves usage) |
> | SDK schema copies | Usage evidence only | ❌ No |
> | Code generators / scripts | Usage evidence only | ❌ No |
> | Schema itself | Truth source | ✅ Yes (sole authority) |
>
> **Search scope MUST include all direct schema consumers (module schemas).**
> SDKs, generated code, and scripts MAY be inspected ONLY to confirm non-orphan status,
> and MUST NOT be used to infer schema correctness or authority.

#### 1.1.1 Common Misinterpretations (Non-Normative)

The following do **NOT** establish schema authority:

| Pattern | Why It's Wrong |
|:---|:---|
| Being referenced by SDK code | SDK is consumer, not authority |
| Being imported by generators | Generator input ≠ correctness proof |
| Being used in documentation examples | Docs explain, not define |
| Being widely used in runtime | Popularity ≠ correctness |
| Passing validation in tests | Tests verify, not define |

**These only establish usage, not correctness.**

### Step 2: Reference Closure Verification

**Purpose**: Confirm target schema's dependencies are valid and resolvable.

**Actions**:
1. List all `$ref` in target schema
2. Recursively verify each referenced schema exists
3. Confirm terminal schemas have no `$ref`
4. Check for circular dependencies

**Artifact**: Reference Closure List
```
identifiers.schema.json (terminal)
    ↑
events.schema.json
    ↑
mplp-*.schema.json (consumers)
```

---

### Step 3: Reference Map Table

**Purpose**: Create traceable evidence of all consumer references.

**Required Columns**:

| Consumer Schema | Line | $ref Value | JSON Pointer | Resolved $id | Resolved Pointer | Overlay |
|:---|:---:|:---|:---|:---|:---:|:---|
| mplp-trace | L85 | common/events.schema.json | #/properties/events/items | https://...events.schema.json | # | ref-only |

**Overlay Types**:
- `ref-only`: Direct reference, no constraint overlay
- `allOf-overlay`: Reference + additional constraints
- `oneOf/anyOf-wrapper`: Wrapped in choice structure
- `indirect`: Reference through another schema

**Judgment**:
- All consumers must resolve to **same $id**
- All consumers must resolve to **same pointer** (e.g., `#` or `#/$defs/X`)

---

### Step 4: Constraint Compatibility Analysis

**Purpose**: Verify consumer constraints don't conflict with base.

**By Overlay Type**:

| Overlay | Analysis Required |
|:---|:---|
| ref-only | None (no overlay = no conflict at reference site) |
| allOf-overlay | Check: fields only shrink, never conflict |
| wrapper | Check: wrapper doesn't restrict base-compatible values |

**Note**: "ref-only" only proves no conflict AT THE REFERENCE SITE. It does not prove the entire consumer schema has no conflicting constraints elsewhere.

---

### Step 5: Instance Validation (Two-Level)

**Purpose**: Machine-prove compatibility through actual fixture validation.

**Level 5.1: Base-level**
```bash
npx ajv-cli validate -s base.schema.json -d fixture.json --strict=false
```

**Level 5.2: Consumer-level** (CRITICAL)
```bash
npx ajv-cli validate -s consumer.schema.json -d wrapper-fixture.json \
    -r "common/*.schema.json" --strict=false
```

**Judgment**: Both levels must PASS.

> **⚠️ Wrapper Fixture Requirements**
>
> Wrapper fixtures MUST satisfy all non-event required fields of the consumer schema.
> Validation failures unrelated to the truth source under test must be classified separately.
>
> Example: If `mplp-plan` fails on `step.status` missing, this is a fixture issue, NOT an events drift.

---

## 4. Evidence Artifacts

A complete verification produces:

| Artifact | Required |
|:---|:---:|
| Usage Surface grep results | ✅ |
| Reference Closure List | ✅ |
| Reference Map Table (traceable) | ✅ |
| Compatibility Notes per consumer | ✅ |
| Base-level validation PASS | ✅ |
| Consumer-level validation PASS (min 3 modules) | ✅ |

---

## 5. Reference Map Table: common/events.schema.json

**Base Schema**: `common/events.schema.json`  
**$id**: `https://schemas.mplp.dev/v1.0/common/events.schema.json`  
**Definition Location**: Root object (`#`)  
**Required Fields**: `event_id`, `event_type`, `source`, `timestamp`  
**additionalProperties**: false

### Consumer References (10 Modules)

| Consumer | Lines | JSON Pointer | Overlay | Validated |
|:---|:---:|:---|:---:|:---:|
| mplp-trace.schema.json | L85, L152 | #/properties/events/items | ref-only | ✅ |
| mplp-plan.schema.json | L61, L129 | #/properties/events/items | ref-only | ✅ |
| mplp-context.schema.json | L123, L228 | #/properties/events/items | ref-only | ✅ |
| mplp-confirm.schema.json | L94, L172 | #/properties/events/items | ref-only | ✅ |
| mplp-collab.schema.json | L103, L192 | #/properties/events/items | ref-only | ✅ |
| mplp-role.schema.json | L74, L128 | #/properties/events/items | ref-only | ✅ |
| mplp-dialog.schema.json | L84, L150, L187 | #/properties/events/items | ref-only | ✅ |
| mplp-core.schema.json | L72, L119 | #/properties/events/items | ref-only | ✅ |
| mplp-network.schema.json | L93, L169 | #/properties/events/items | ref-only | ✅ |
| mplp-extension.schema.json | L90, L164 | #/properties/events/items | ref-only | ✅ |

**All 10 consumers validated: resolve to same `$id` and same pointer (`#`).**

---

## 6. Validation Results

| Fixture | Schema Entry | Result |
|:---|:---|:---:|
| event.valid.json | common/events.schema.json | ✅ PASS |
| trace.with-events.json | mplp-trace.schema.json | ✅ PASS |
| plan.with-events.json | mplp-plan.schema.json | ✅ PASS |

---

## 7. Conclusion

`common/events.schema.json` is verified as valid truth source for 10 module schemas:
- **Reference Integrity**: All 10 consumers reference same file, same pointer
- **Closure Integrity**: Dependency chain (identifiers → events → modules) is complete
- **Instance Compatibility**: Consumer-level validation passed for trace & plan

---

## 8. Applicability to Other Truth Sources

This methodology applies to:

| Truth Source | Consumers | STATUS |
|:---|:---|:---:|
| common/events.schema.json | 10 modules | ✅ Verified |
| common/trace-base.schema.json | 10 modules (20 refs) | ✅ Verified |
| common/metadata.schema.json | 10 modules | ✅ Fixed (9→11 KDs) |
| common/identifiers.schema.json | All common + modules | ✅ Terminal base |
| common/common-types.schema.json | All modules | ✅ Verified |
| common/learning-sample.schema.json | - | ✅ Standalone (no module $ref) |
| taxonomy/*.yaml | Documentation | ✅ Verified (2026-01-04, 4 files) |
| invariants/*.yaml | Documentation | ✅ Verified (2026-01-04, 5 files, 61 rules) |
