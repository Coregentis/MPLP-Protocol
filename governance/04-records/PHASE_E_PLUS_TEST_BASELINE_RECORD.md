---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "PHASE_E_PLUS_TEST_BASELINE_RECORD"
---

# PHASE E+ TEST BASELINE RECORD

**Freeze Date**: 2026-01-02  
**Status**: ✅ **FROZEN**  
**Scope**: tests/ directory baseline validation

---

## Executive Summary

Phase E+ extends the Phase E validation baseline to cover `tests/` directory assets.

All validation gates have passed. The test baseline is now reproducible, auditable, and schema-aligned.

---

## Gate Results

| Gate | Description | Result |
|------|-------------|--------|
| E+1 | Generated Evidence Schema Validation | ✅ PASS (4/4 py fixtures) |
| E+2 | Negative Fixtures Expected-Fail | ✅ PASS (6/6 correctly failed) |
| E+3 | Schema-Alignment Test Capture | ✅ PASS (vitest PASS) |

**Phase E+ Overall**: ✅ **PASS**

---

## Python F-min Patch Applied

During E+ validation, a structural mismatch was discovered between Python SDK and schema truth:

| Issue | File | Fix Applied |
|-------|------|-------------|
| `meta.extra` field | `models/common.py:17` | Removed (not in metadata.schema) |
| Config.extra = "allow" | `models/common.py:20` | Changed to "forbid" |
| TraceSpan.name/status | `models/core.py:11-19` | Removed (not in trace-base.schema) |
| TraceSpan instantiation | `builders.py:87-93` | Removed name/status args |

### Schema Evidence

| Schema | JSON Pointer | Constraint |
|--------|-------------|------------|
| `common/metadata.schema.json` | `/additionalProperties` | `false` |
| `common/trace-base.schema.json` | `/properties` | `[trace_id, span_id, parent_span_id, context_id, attributes]` |
| `common/trace-base.schema.json` | `/required` | `[trace_id, span_id]` |

---

## E+2 Negative Fixture Registry

| Fixture | Schema | Expected Keyword | Actual |
|---------|--------|-----------------|--------|
| context_invalid_uuid.json | mplp-context | pattern | ✅ pattern |
| context_missing_required.json | mplp-context | required | ✅ required |
| context_extra_forbidden.json | mplp-context | additionalProperties | ✅ additionalProperties |
| context_invalid_datetime.json | mplp-context | format | ✅ format |
| confirm_invalid_enum.json | mplp-confirm | enum | ✅ enum |
| plan_step_missing_id.json | mplp-plan | required | ✅ required |

---

## Artifacts Produced

| Artifact | Path |
|----------|------|
| Test Baseline Inventory | `artifacts/test-baseline/inventory.md` |
| Generated Evidence Report | `artifacts/test-baseline/generated-evidence-report.md` |
| Negative Fixtures Report | `artifacts/test-baseline/negative-fixtures-report.md` |

---

## Verification Scripts

```bash
# E+1: Generated Evidence Validation
node scripts/verify-test-evidence.js

# E+2: Negative Fixtures Expected-Fail
node scripts/verify-negative-fixtures.js

# E+3: Schema-Alignment Test
npx vitest run tests/schema-alignment/
```

---

## Known Deferred Issues

### TS runtime-compat loadAndTransform Error

During E+, the TS runtime-compat tests failed with `loadAndTransform` errors.

**Impact**: Does not affect E+ gates (E+1/E+2/E+3 are AJV-only, independent of TS runtime)

**Deferred To**: Phase F (TS-F-min patch)

**Root Cause (Suspected)**:
- ESM/CJS module resolution issue
- OR path configuration in vitest + vite-node
- OR schema loader cache conflict

---

## Verification Independence

> This validation uses **AJV only** against `schemas/v2`.
> It is independent of TS/Python SDK runtime implementations.
> TS runtime-compat failures do not affect E+ gate status.

---

## Governance

This freeze record is governed by:

- **MPLP Protocol Governance Committee (MPGC)**
- **Constitutional Documents**: `governance/constitutional/`

Any modification to Phase E+ outputs requires documented justification.

---

**Freeze Authority**: MPGC  
**Freeze Timestamp**: 2026-01-02T01:15:00Z
