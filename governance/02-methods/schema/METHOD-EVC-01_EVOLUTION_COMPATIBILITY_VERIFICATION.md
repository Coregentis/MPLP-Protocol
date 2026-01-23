---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-EVC-01_EVOLUTION_COMPATIBILITY_VERIFICATION"
---


# METHOD-EVC-01: Evolution Compatibility Verification

**Document ID**: METHOD-EVC-01  
**Version**: 1.0.0  
**Status**: Active  
**Created**: 2026-01-04

---

## 1. Purpose

Ensures that **schema version changes** do not silently break existing derived artifacts, documentation, or SDK implementations — providing **temporal consistency** across the protocol's evolution.

---

## 2. Constitutional Principle

> **Evolution Must Not Silently Break.**
>
> When a schema changes from v1.0 to v1.1, all existing conformant implementations MUST either:
> - Remain valid (additive/compatible change), OR
> - Be explicitly flagged for required updates (breaking change)
>
> Silent semantic drift across versions is a governance failure.

---

## 3. Relationship to Other Methods

| Method | Dimension | Question |
|:---|:---|:---|
| TSV/SCV/SUC/DIV/XCV | **Spatial** | "Is everything consistent *right now*?" |
| **EVC-01** | **Temporal** | "Is the *change* compatible with existing artifacts?" |

**Key Insight**: All other methods validate a snapshot. EVC validates a transition.

---

## 4. Three-Step Verification Process

### Step 1: Schema Diff Classification

**Input**: `schema.v1.json` → `schema.v2.json`

**Output**: `reports/evc/<schema>.diff-classification.json`

**Classification Categories**:

| Category | Definition | Allowed | Example |
|:---|:---|:---:|:---|
| **Additive** | New optional field, new enum value at end | ✅ Minor | `+ optional field "tags"` |
| **Relaxation** | Weaker constraint | ⚠️ Minor | `minItems: 1 → 0` |
| **Restriction** | Stronger constraint | 🔴 Breaking | `optional → required` |
| **Removal** | Field/value removed | 🔴 Breaking | `- deprecated_field` |
| **Type Change** | Different type | 🔴 Breaking | `string → object` |
| **Semantic Change** | Same syntax, different meaning | 🔴 Major | `status.completed` now means something else |

### 1.1 Semantic Change Detection (Human Justification Required)

Semantic changes **cannot be fully auto-detected**. When a change is classified as `semantic-change`:

**Required Human-Authored Justification**:
```markdown
## Semantic Change Justification

### Field: `#/properties/status/enum/completed`

**Before**: Indicates task finished successfully
**After**: Indicates task finished (success OR graceful abort)

### Impacted Invariants:
- `sa_status_lifecycle`: Now allows abort → completed transition
- Golden Flow GF-02: Updated expected state machine

### Migration:
- Existing code checking `completed === success` must also check `abort_reason === null`
```

**Gate Rule**: Semantic changes without justification → 🔴 FAIL

**Diff Classification Output**:
```json
{
  "schema": "mplp-trace.schema.json",
  "from_version": "1.0.0",
  "to_version": "1.1.0",
  "changes": [
    {
      "pointer": "#/properties/segments",
      "type": "additive",
      "description": "New optional array field",
      "verdict": "minor-compatible"
    },
    {
      "pointer": "#/properties/status/enum",
      "type": "restriction",
      "description": "Removed 'pending' from enum",
      "verdict": "breaking"
    }
  ],
  "overall_verdict": "breaking"
}
```

---

### Step 2: Backward Compatibility Test

**Purpose**: Validate that existing derived artifacts remain valid against new schema.

**Actions**:
1. Load previous version's SCV manifests
2. Load previous version's SUC contract tests
3. Validate against new schema version
4. Report any failures

**Test Matrix**:

| Artifact | Validation | Expected |
|:---|:---|:---:|
| Previous maximal fixtures | New schema validation | PASS (if compatible) |
| Previous SDK types (via SCV diff) | New SNF | No new FAIL |
| Previous contract tests | New schema | PASS (if compatible) |

**Failure = Breaking Change Detected**

---

### Step 3: Version Governance Gate

**Decision Matrix**:

| Change Type | Allowed Version | Gate Action |
|:---|:---|:---|
| Additive only | PATCH (x.x.+1) or MINOR (x.+1.0) | ✅ Auto-pass |
| Relaxation | MINOR (x.+1.0) | ✅ Pass with note |
| Any restriction/removal | MAJOR (+1.0.0) | 🔴 Block unless MAJOR |
| Semantic change | MAJOR (+1.0.0) | 🔴 Block + require migration guide |

---

## 5. Evidence Artifacts

| Artifact | Required |
|:---|:---:|
| Diff Classification Report | ✅ |
| Backward Compatibility Test Results | ✅ |
| Version Governance Decision | ✅ |
| Migration Guide (if breaking) | ✅ if MAJOR |

---

## 6. Integration Gate

### Gate: Evolution Compatibility Check

**Command**: `mplp-verify evolution --from v1.0 --to v1.1`

**Checks**:
1. All changes classified
2. No restriction/removal without MAJOR version
3. Previous fixtures still validate (if compatible)

**Verdict**:
- Breaking change + non-MAJOR version → 🔴 FAIL
- All additive + correct version → ✅ PASS

---

## 7. Frozen Protocol Rules

For **FROZEN** protocol versions (like v1.0.0):

| Allowed | Forbidden |
|:---|:---|
| Bug fixes to schemas (if provably wrong) | Any field removal |
| Additive optional fields (PATCH) | Required field changes |
| Clarifying descriptions | Enum value changes |
| New informative examples | Semantic changes |

**Breaking changes to frozen version** → Requires:
1. New MAJOR version (v2.0.0)
2. MPGC approval
3. Published migration guide

---

## 8. Governance

Governed by MPGC. Changes to EVC-01 require documented justification.

---

**Document Status**: Governance Methodology  
**Version**: 1.0.0  
**References**: Versioning Policy, METHOD-SCV-01, METHOD-SUC-01
