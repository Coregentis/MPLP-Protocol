---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-XCV-01_CROSS_CONSISTENCY_VERIFICATION"
---


# METHOD-XCV-01: Cross-Consistency Verification

**Document ID**: METHOD-XCV-01  
**Version**: 1.0.0  
**Status**: Active  
**Created**: 2026-01-04

---

## 1. Purpose

Provides a reusable, evidence-based methodology to verify that **YAML configuration files** (taxonomy, invariants, profiles) are **cross-consistent** with **JSON Schema definitions** — ensuring that enums, IDs, counts, and semantic references remain synchronized across the two truth source layers.

---

## 2. Constitutional Principle

> **Layer 0 (JSON Schema) and Layer 1 (YAML Configuration) are both Truth Sources.**
>
> Neither is derived from the other. Both are MPGC-governed.
>
> Cross-consistency means: where they reference the same semantic concept, they MUST agree. Disagreement is a governance failure, not a derivation failure.

### 2.1 Domain Hierarchy Clarification

Layer 0 and Layer 1 are **peer truth sources** but govern **different semantic domains**:

| Layer | Governs | Examples |
|:---|:---|:---|
| **Layer 0** (JSON Schema) | Data shape and validation semantics | Field types, required/optional, formats |
| **Layer 1** (YAML Configuration) | Protocol-level enumerations, invariants, governance sets | event_family values, invariant rules, module lists |

**Neither may redefine the other's domain.**

For example:
- `event_family` **values** are defined by YAML taxonomy → Schema enum MUST match
- `event_family` **type** (string) and **validation** are defined by Schema → YAML cannot override

## 3. Relationship to Other Verification Methods

| Method | Scope | Question Answered |
|:---|:---|:---|
| **TSV-01** | Truth Source | "Are $ref chains valid?" |
| **SCV-01** | Schema Projection | "Are derived schemas complete?" |
| **SUC-01** | Runtime Contract | "Is SDK usage correct?" |
| **DIV-01** | Derivation Process | "Is generation reproducible?" |
| **XCV-01** | Cross-Consistency | "Do YAML and Schema agree?" |

**Key Insight**: TSV/SCV/SUC/DIV all assume truth sources are internally consistent. XCV verifies this assumption.

---

## 4. Scope

### 4.1 Cross-Consistency Points

| Schema Concept | YAML Counterpart | Agreement Required |
|:---|:---|:---|
| `event_family` enum (12 values) | `taxonomy/event-taxonomy.yaml` families | Exact match |
| `tool_kind` enum (5 values) | `taxonomy/integration-event-taxonomy.yaml` kinds | Exact match |
| `sample_family` values | `taxonomy/learning-taxonomy.yaml` families | Exact match |
| Module status enums | `invariants/*.yaml` scope definitions | Enum coverage |
| Invariant IDs | `invariants/*.yaml` id fields | Unique, no collision |
| Invariant counts | Documentation references | Exact match |
| Profile module lists | `profiles/*.yaml` modules | Subset of 10 modules |

### 4.2 Out of Scope

- Schema-to-schema consistency (handled by TSV-01)
- Derived artifact consistency (handled by SCV-01)
- Runtime usage (handled by SUC-01)

---

## 5. Four-Step Verification Process

### Step 1: Enum Extraction from Schemas

**Input**: JSON Schemas in `schemas/v2/`

**Output**: `schemas/v2/_manifests/xc/schema-enums.json`

**Extract**:
- All `enum` constraints with their JSON Pointer
- All `const` values
- Event family enum from `events/mplp-event-core.schema.json`
- Status enums from each module schema

**Format**:
```json
{
  "extracted_at": "2026-01-04T00:00:00Z",
  "enums": [
    {
      "schema": "events/mplp-event-core.schema.json",
      "pointer": "#/properties/event_family",
      "values": [
        "import_process", "intent", "delta_intent", "impact_analysis",
        "compensation_plan", "methodology", "reasoning_graph",
        "pipeline_stage", "graph_update", "runtime_execution",
        "cost_budget", "external_integration"
      ],
      "count": 12
    },
    {
      "schema": "integration/mplp-tool-event.schema.json",
      "pointer": "#/properties/tool_kind",
      "values": ["formatter", "linter", "test_runner", "generator", "other"],
      "count": 5
    }
  ]
}
```

---

### Step 2: Semantic Extraction from YAML

**Input**: YAML files in `schemas/v2/taxonomy/`, `schemas/v2/invariants/`, `schemas/v2/profiles/`

**Output**: `schemas/v2/_manifests/xc/yaml-semantics.json`

**Extract**:
- Event family IDs from `event-taxonomy.yaml`
- Integration event types from `integration-event-taxonomy.yaml`
- Sample family IDs from `learning-taxonomy.yaml`
- Module-to-event mappings from `module-event-matrix.yaml`
- Invariant IDs and counts from `*-invariants.yaml`
- Profile module lists from `*-profile.yaml`

**Format**:
```json
{
  "extracted_at": "2026-01-04T00:00:00Z",
  
  "event_families": {
    "source": "taxonomy/event-taxonomy.yaml",
    "values": ["import_process", "intent", ...],
    "count": 12
  },
  
  "invariants": {
    "sa-invariants.yaml": {
      "ids": ["sa_requires_context", "sa_context_must_be_active", ...],
      "count": 9
    },
    "map-invariants.yaml": {
      "ids": ["map_session_requires_participants", ...],
      "count": 9
    }
  },
  
  "profiles": {
    "sa-profile.yaml": {
      "modules": ["context", "plan", "trace", "confirm", "role"],
      "invariants_ref": "invariants/sa-invariants.yaml"
    }
  }
}
```

---

### Step 3: Cross-Consistency Diff

**Input**: Schema enums + YAML semantics

**Output**: `reports/xcv/cross-consistency.diff.md`

**Diff Categories**:

| Category | Definition | Verdict |
|:---|:---|:---:|
| **Enum mismatch** | Schema enum ≠ YAML list | 🔴 FAIL |
| **Missing value** | Value in schema, not in YAML | 🔴 FAIL |
| **Extra value** | Value in YAML, not in schema | 🔴 FAIL |
| **Count mismatch** | Declared count ≠ actual count | 🔴 FAIL |
| **ID collision** | Same invariant ID in multiple files | 🔴 FAIL |
| **Invalid reference** | YAML references non-existent schema/module | 🔴 FAIL |
| **Module list invalid** | Profile module not in 10 core modules | 🔴 FAIL |

---

### Step 4: Evidence Report Generation

**Output**: `reports/xcv/cross-consistency.verdict.md`

**Report Template**:
```markdown
## XCV Verdict: Cross-Consistency

**Extracted**: 2026-01-04T00:00:00Z
**Schema Sources**: schemas/v2/
**YAML Sources**: schemas/v2/taxonomy/, invariants/, profiles/

### Enum Consistency

| Concept | Schema Count | YAML Count | Match |
|:---|:---:|:---:|:---:|
| event_family | 12 | 12 | ✅ |
| tool_kind | 5 | 5 | ✅ |
| sample_family | 6 | 6 | ✅ |

### Invariant Counts

| File | YAML Declared | Actual Count | Match |
|:---|:---:|:---:|:---:|
| sa-invariants.yaml | 9 | 9 | ✅ |
| map-invariants.yaml | 9 | 9 | ✅ |
| observability-invariants.yaml | 12 | 12 | ✅ |
| learning-invariants.yaml | 12 | 12 | ✅ |
| integration-invariants.yaml | 19 | 19 | ✅ |

### Invariant ID Uniqueness

| Check | Result |
|:---|:---:|
| Total IDs | 61 |
| Unique IDs | 61 |
| Collisions | 0 |

### Profile Module Validity

| Profile | Modules | All Valid |
|:---|:---|:---:|
| sa-profile | context, plan, trace, confirm, role | ✅ |
| map-profile | + collab, dialog, network | ✅ |

### Verdict: ✅ PASS
```

---

## 6. Critical Cross-Consistency Points

### 6.1 Event Family Enum (CRITICAL)

**Schema Source**: `events/mplp-event-core.schema.json#/properties/event_family`

**YAML Source**: `taxonomy/event-taxonomy.yaml#/logical_families`

**Rule**: 
```
MUST: schema.event_family.enum == yaml.logical_families.keys()
```

**Current Expected Values** (12):
```
import_process, intent, delta_intent, impact_analysis,
compensation_plan, methodology, reasoning_graph,
pipeline_stage, graph_update, runtime_execution,
cost_budget, external_integration
```

---

### 6.2 Invariant Counts (CRITICAL)

**Schema Source**: N/A (invariants are YAML-only truth source)

**YAML Source**: `invariants/*.yaml`

**Documentation References**: `docs/docs/specification/architecture/l1-core-protocol.md`

**Rule**:
```
MUST: yaml_file.invariants[].length == documentation_stated_count
```

**Current Expected Counts**:
| File | Count |
|:---|:---:|
| sa-invariants.yaml | 9 |
| map-invariants.yaml | 9 |
| observability-invariants.yaml | 12 |
| learning-invariants.yaml | 12 |
| integration-invariants.yaml | 19 |
| **Total** | **61** |

---

### 6.3 Module Names (CRITICAL)

**Schema Source**: 10 files matching `mplp-*.schema.json` in `schemas/v2/modules/`

**YAML Source**: `taxonomy/module-event-matrix.yaml#/module_event_mapping`

**Rule**:
```
MUST: yaml.module_ids == schema_module_names
```

**Expected Modules** (10):
```
context, plan, trace, confirm, role,
dialog, collab, extension, network, core
```

---

### 6.4 Tool Kinds (Integration)

**Schema Source**: `integration/mplp-tool-event.schema.json#/properties/tool_kind`

**YAML Source**: `taxonomy/integration-event-taxonomy.yaml#/TOOL_EVENT`

**Rule**:
```
MUST: schema.tool_kind.enum == yaml.tool_kinds
```

**Expected Values** (5):
```
formatter, linter, test_runner, generator, other
```

---

## 7. Evidence Artifacts

A complete XCV verification produces:

| Artifact | Required |
|:---|:---:|
| Schema Enum Extraction (`schema-enums.json`) | ✅ |
| YAML Semantics Extraction (`yaml-semantics.json`) | ✅ |
| Cross-Consistency Diff Report | ✅ |
| Verdict Report | ✅ |

---

## 8. Integration Gate

### Gate: Cross-Consistency Check

**Command**: `mplp-verify cross-consistency`

**Checks**:
1. All schema enums have matching YAML counterparts
2. All YAML-defined IDs are unique
3. All YAML counts match actual file contents
4. All profile module references exist in 10-module set

**Verdict**:
- Any mismatch → 🔴 FAIL (block merge/release)
- All match → ✅ PASS

---

## 9. Execution Order

```
1. DIV-01: Derivation Integrity
   └── Generators clean? Manifests fresh?
   
2. XCV-01: Cross-Consistency ← NEW
   └── Schema enums == YAML lists?
   └── Invariant counts match?
   └── Module names aligned?
   
3. SCV-01: Surface Completeness
   └── Derived schemas cover truth?
   
4. SUC-01: Usage Conformance
   └── SDK/API uses schemas correctly?
```

**Principle**: XCV validates that truth sources themselves are coherent before verifying derived artifacts.

---

## 10. Common Drift Scenarios

| Scenario | Detection | Fix |
|:---|:---|:---|
| Added event_family to schema, forgot YAML | Enum mismatch (12 vs 11) | Update taxonomy YAML |
| Added invariant rule, forgot to update count | Count mismatch | No action needed (count is derived) |
| Typo in invariant ID | ID collision or invalid ref | Fix YAML typo |
| New module schema, missing from matrix | Module list incomplete | Update module-event-matrix.yaml |
| Documentation states wrong count | Doc drift (external to XCV) | Fix documentation (see TSV audit) |

---

## 11. Governance

This methodology is governed by:

- **MPLP Protocol Governance Committee (MPGC)**
- **Constitutional Documents**: `governance/constitutional/`

Any modification to XCV-01 requires documented justification.

---

## 12. XCV-DOC: Schema ↔ Documentation Consistency (Extension)

### 12.1 Purpose

Prevents **documentation** from becoming a new drift source by ensuring that all normative claims in documentation are derived from or validated against truth sources.

### 12.2 Constitutional Principle

> **Documentation Explains, It Does Not Define.**
>
> Any enum, count, module list, or semantic claim in documentation MUST be traceable to Schema or YAML truth sources.
>
> Documentation may NOT introduce new protocol semantics.

### 12.3 Three Documentation Rules

#### Rule 1: Enum/Count Values Must Be Manifest-Derived

**Forbidden Pattern**:
```markdown
<!-- Hand-written, can drift -->
The SA profile has 8 invariant rules.
```

**Required Pattern**:
```markdown
<!-- Auto-generated or manifest-referenced -->
The SA profile has {manifest.sa_invariants.count} invariant rules.
```

**Alternative**: All hardcoded counts/enums must be validated by XCV-DOC gate.

#### Rule 2: Example JSON Must Pass Schema Validation

**Check**: Every `json` code block in documentation that represents a schema instance:
- MUST be extracted and validated against its declared schema
- MUST have a schema pointer comment

**Format**:
```markdown
<!-- Schema: mplp-trace.schema.json -->
```

**Gate**: Extract all examples, validate against schemas, FAIL on any invalid.

#### Rule 3: Documentation Must Not Define New Semantics

**Forbidden**:
- Introducing new enum values not in schema
- Claiming fields are required when schema says optional
- Defining behaviors not backed by invariants

**Allowed**:
- Explaining why a field exists
- Providing usage guidance
- Linking to authoritative sources

### 12.4 XCV-DOC Gate

**Command**: `mplp-verify xcv-doc`

**Checks**:

| Check | Target | Verdict |
|:---|:---|:---:|
| Invariant counts in docs match YAML | All architecture docs | 🔴 FAIL if mismatch |
| Module counts match (10) | All module references | 🔴 FAIL if wrong |
| Event family counts match (12) | All event references | 🔴 FAIL if wrong |
| Example JSON validates | All `json` code blocks | 🔴 FAIL if invalid |
| No undefined semantics | Normative claims | 🔴 FAIL if invented |

### 12.5 Known Documentation Consistency Points

| Location | Claim | Truth Source |
|:---|:---|:---|
| l1-core-protocol.md | "61 invariant rules" | sum(invariants/*.yaml) |
| l1-core-protocol.md | "SA has 9 rules" | sa-invariants.yaml |
| l1-core-protocol.md | "Integration has 19 rules" | integration-invariants.yaml |
| l2-coordination-governance.md | "SA 9 + MAP 9" | invariants/*.yaml |
| protocol-truth-index.md | Invariant table | invariants/*.yaml |
| api-quick-reference.md | Event family list | event-taxonomy.yaml |

### 12.6 Evidence Artifacts

| Artifact | Required |
|:---|:---:|
| Documentation Count Extraction | ✅ |
| Example JSON Validation Report | ✅ |
| Doc ↔ Truth Source Diff | ✅ |

---

**Document Status**: Governance Methodology  
**Version**: 1.0.1  
**Revised**: 2026-01-04 (added XCV-DOC extension)  
**References**: METHOD-TSV-01, METHOD-SCV-01, METHOD-SUC-01, METHOD-DIV-01, METHOD-EVC-01
