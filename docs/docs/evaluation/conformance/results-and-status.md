---
sidebar_position: 4
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-EVAL-CONF-RESULTS-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: Results & Status
sidebar_label: Results & Status
description: "MPLP conformance evaluation: Results & Status. Non-normative guidance for protocol conformance assessment."
authority: none
---

# Results & Status

## 1. Purpose

This document defines the **formal semantics of conformance evaluation outcomes**.

When Validation Lab or any conformance evaluator produces a result, it MUST use these exact terms and meanings.

## 2. Primary Outcomes

MPLP conformance evaluation produces **exactly one** of three outcomes:

| Outcome | Meaning |
|:---|:---|
| **CONFORMANT** | Evidence satisfies all requirements for the claimed class |
| **NON-CONFORMANT** | Evidence violates one or more requirements |
| **INCOMPLETE-EVIDENCE** | Cannot determine; evidence is missing or invalid |

### 2.1 CONFORMANT

**Definition**: The Evidence Pack contains all required artifacts, all artifacts pass schema validation, and all evaluation dimensions pass for the claimed conformance class.

**Implications**:
- The system produced evidence matching the protocol specification
- The lifecycle was correctly recorded
- Governance gates were properly applied (if applicable)

**Does NOT imply**:
- Correctness of agent decisions
- Quality of generated plans
- Security of the runtime
- Legal compliance

### 2.2 NON-CONFORMANT

**Definition**: The Evidence Pack fails one or more required evaluation dimensions for the claimed conformance class.

**Implications**:
- At least one violation was detected
- The system did not follow the protocol in some aspect
- Detailed failure reasons SHOULD be provided

**Common Causes**:
- Schema validation failures
- Missing required artifacts
- Broken referential integrity
- Ungated high-risk actions (for L2+)
- Missing trace segments

### 2.3 INCOMPLETE-EVIDENCE

**Definition**: The evaluation cannot be completed because required evidence is missing, corrupted, or invalid.

**Implications**:
- The evaluator can make no conformance determination
- The system may or may not be conformant
- Additional evidence is required

**Common Causes**:
- Missing Context or Plan
- Corrupted JSON files
- Export failure
- Partial evidence pack

## 3. Secondary Status Values

For granular reporting, evaluations may include secondary status:

| Status | Meaning | Used When |
|:---|:---|:---|
| **PASS** | Single check passed | Per-dimension reporting |
| **FAIL** | Single check failed | Per-dimension reporting |
| **SKIP** | Check not applicable | L1 evaluation skipping L3 checks |
| **ERROR** | Evaluation error | Evaluator bug or crash |
| **TIMEOUT** | Evaluation exceeded time limit | Large evidence packs |

## 4. Result Structure

Conformance results SHOULD be structured as:

> [!NOTE]
> **Hypothetical Example**
> The following JSON structure is a **non-normative example** for illustration only.
> It does not represent a real evaluation result.

```json
{
  "evaluation_id": "eval-550e8400-e29b-41d4-a716-446655440000",
  "evaluated_at": "2025-12-28T00:00:00Z",
  "protocol_version": "1.0.0",
  "claimed_class": "L2",
  
  "outcome": "NON-CONFORMANT",
  
  "dimensions": {
    "schema_validity": "PASS",
    "lifecycle_completeness": "PASS",
    "governance_gating": "FAIL",
    "trace_integrity": "PASS",
    "failure_bounding": "SKIP",
    "version_declaration": "PASS"
  },
  
  "failures": [
    {
      "dimension": "governance_gating",
      "artifact": "plans/plan-456.json",
      "message": "Step step-3 requires confirm but no Confirm object found",
      "severity": "error"
    }
  ],
  
  "evidence_summary": {
    "contexts": 1,
    "plans": 1,
    "traces": 1,
    "confirms": 0
  }
}
```

## 5. Severity Levels

Failures may have different severities:

| Severity | Meaning | Impact |
|:---|:---|:---|
| **error** | Hard failure | Results in NON-CONFORMANT |
| **warning** | Soft issue | Does not affect outcome |
| **info** | Observation | Informational only |

**Rule**: Any `error` severity failure results in NON-CONFORMANT outcome.

## 6. Outcome Stability

### 6.1 Determinism

Given the same Evidence Pack and protocol version, the outcome MUST be deterministic.

```
evaluate(pack_v1, protocol_1.0.0) = CONFORMANT
evaluate(pack_v1, protocol_1.0.0) = CONFORMANT  // Always same result
```

### 6.2 Monotonicity

Adding valid evidence to an pack cannot change CONFORMANT to NON-CONFORMANT.

```
pack_a = {context, plan, trace}           → CONFORMANT
pack_b = pack_a + {more_valid_traces}     → CONFORMANT (still)
```

## 7. Reporting Requirements

Evaluation reports MUST include:

| Field | Required | Description |
|:---|:---:|:---|
| `outcome` | ✅ | Primary outcome |
| `protocol_version` | ✅ | Version evaluated against |
| `evaluated_at` | ✅ | Timestamp of evaluation |
| `claimed_class` | ✅ | L1, L2, or L3 |
| `dimensions` | ✅ | Per-dimension status |
| `failures` | If NON-CONFORMANT | Failure details |
| `evidence_summary` | Recommended | Artifact counts |

## 8. Related Documentation

- [Conformance Model](./conformance-model.md) — Conformance classes
- [Evaluation Dimensions](./evaluation-dimensions.md) — Evaluation axes
- [Validation Lab](#) — Evaluation tooling

---

**Scope**: Defines 3 primary outcomes, severity levels, result structure  
**Requirement**: Evaluators MUST use these exact terms
