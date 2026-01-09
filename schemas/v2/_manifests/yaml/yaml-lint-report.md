# YAML Internal Consistency Report

**Generated**: 2026-01-04T15:12:00Z  
**Bundle Hash**: sha256:78ea3511...

---

## Summary

| Check | Count | Verdict |
|:---|:---:|:---:|
| Invariant ID uniqueness | 61 unique, 0 duplicates | ✅ PASS |
| Schema_ref paths exist | 9/9 exist | ✅ PASS |
| Scope values valid | 10 unique scopes | ✅ PASS |
| Profile modules valid | All ⊂ 10 modules | ✅ PASS |

---

## 1. Invariant ID Uniqueness

**Source**: `invariants/*.yaml`

| File | IDs | Duplicates |
|:---|:---:|:---:|
| sa-invariants.yaml | 9 | 0 |
| map-invariants.yaml | 9 | 0 |
| observability-invariants.yaml | 12 | 0 |
| learning-invariants.yaml | 12 | 0 |
| integration-invariants.yaml | 19 | 0 |
| **Total** | **61** | **0** |

**Verdict**: ✅ PASS — All invariant IDs are unique

---

## 2. Schema_ref Path Verification

**Source**: `taxonomy/*.yaml` schema_ref values

| Path | Exists |
|:---|:---:|
| schemas/v2/events/mplp-event-core.schema.json | ✅ |
| schemas/v2/events/mplp-graph-update-event.schema.json | ✅ |
| schemas/v2/events/mplp-map-event.schema.json | ✅ |
| schemas/v2/events/mplp-pipeline-stage-event.schema.json | ✅ |
| schemas/v2/events/mplp-runtime-execution-event.schema.json | ✅ |
| schemas/v2/events/mplp-sa-event.schema.json | ✅ |
| schemas/v2/learning/mplp-learning-sample-core.schema.json | ✅ |
| schemas/v2/learning/mplp-learning-sample-delta.schema.json | ✅ |
| schemas/v2/learning/mplp-learning-sample-intent.schema.json | ✅ |

**Verdict**: ✅ PASS — All 9 schema_ref paths resolve to existing files

---

## 3. Invariant Scope Values

**Source**: `invariants/*.yaml` scope fields

| Scope | Used In | Valid Module |
|:---|:---|:---:|
| context | sa-invariants | ✅ |
| plan | sa-invariants, map-invariants | ✅ |
| trace | sa-invariants, observability | ✅ |
| collab | map-invariants | ✅ |
| event | observability-invariants | ⚠️ (event_type not module) |
| learning_sample | learning-invariants | ⚠️ (learning_sample not module) |
| ci_event | integration-invariants | ⚠️ (integration scope) |
| git_event | integration-invariants | ⚠️ (integration scope) |
| file_update_event | integration-invariants | ⚠️ (integration scope) |
| tool_event | integration-invariants | ⚠️ (integration scope) |

**Note**: Scope values `event`, `learning_sample`, and `*_event` refer to schema types, not modules. This is expected for non-module invariants.

**Verdict**: ✅ PASS — Scope values are valid within their semantic domains

---

## 4. Profile Module Lists

**Source**: `profiles/*.yaml` modules field

| Profile | Modules | All Valid |
|:---|:---|:---:|
| sa-profile.yaml | context, plan, trace, confirm, role | ✅ (5/5 ⊂ 10) |
| map-profile.yaml | + collab, dialog, network | ✅ (8/8 ⊂ 10) |

**Verdict**: ✅ PASS — All profile modules are valid subsets of the 10 core modules

---

## 5. Scope Domain Rule (Governance-Frozen)

> **Scope values are domain-typed, not constrained to the 10-module set.**

### Domain Definitions

| Domain | Allowed Values | Source |
|:---|:---|:---|
| **module** | context, plan, trace, confirm, role, dialog, collab, extension, network, core | 10 module schemas |
| **event_type** | event | `common/events.schema.json` |
| **learning_type** | learning_sample | `common/learning-sample.schema.json` |
| **integration_event** | ci_event, git_event, file_update_event, tool_event | `integration/*.schema.json` |

### Validation Rule

```yaml
# Machine-readable scope validation rule
scope_domain_rule:
  - domain: module
    allowed: [context, plan, trace, confirm, role, dialog, collab, extension, network, core]
  - domain: event_type
    allowed: [event]
  - domain: learning_type
    allowed: [learning_sample]
  - domain: integration_event
    allowed: [ci_event, git_event, file_update_event, tool_event]
```

### Gate

- Scope value **MUST** be in one of the four domain sets
- Scope value outside all sets → 🔴 FAIL

---

## Overall Verdict: ✅ PASS

All 11 YAML configuration files are internally consistent:
- 61 invariant IDs, all unique
- 9 schema_ref paths, all resolve
- All scope and module references are valid
- Scope Domain Rule: all values within defined domains

