# MPLP Document Format Specification

**Document ID**: CONST-002  
**Status**: Constitutional  
**Authority**: MPGC  
**Effective**: v1.1.0  
**Supersedes**: CONST-002 v1.0.0

---

## 1. Scope

This document defines the required format and validity rules for all MPLP documentation.

This specification is constitutional. A document that does not conform to this specification is invalid regardless of its content.

### 1.1 Applicability

This specification applies to:
- `docs/` (documentation entry point)
- `governance/` (excluding `governance/01-constitutional/CONST-*.md`)
- `Validation_Lab/` (excluding `artifacts/`, `releases/archive/`, and sealed records)

This specification does NOT apply to:
- Constitutional documents (`CONST-*.md`)
- Sealed archival records (phase seals, release seals, attestations)
- Repository code files, schemas, and tests
- Website source code and native site metadata (unless explicitly declaring MPLP frontmatter)

### 1.2 Website Coverage Clarification

Website markdown/MDX content is covered by this specification only when it explicitly declares the MPLP frontmatter block. In the absence of such block, the website uses its own native metadata system and is out of constitutional document scope.

---

## 2. Frontmatter Schema

All MPLP documentation files must include a YAML frontmatter block.

### 2.1 Required Fields

| Field | Type | Values |
|-------|------|--------|
| `entry_surface` | enum | `website`, `documentation`, `repository`, `validation_lab` |
| `doc_type` | enum | `normative`, `informative`, `reference`, `governance`, `guide`, `attestation` |
| `status` | enum | `draft`, `frozen` |
| `authority` | enum | `protocol`, `none` |
| `protocol_version` | string | Semantic version (e.g., "1.0.0") |
| `doc_id` | string | Unique document identifier |

### 2.2 Optional Fields

| Field | Type | Purpose |
|-------|------|---------| 
| `title` | string | UI display only |
| `sidebar_label` | string | UI display only |

Optional fields are non-normative and excluded from protocol semantics.

### 2.3 Legacy doc_type Values (Migration Rule)

The following legacy values are tolerated for migration only and are **forbidden for new documents**:

- `specification` → MUST be migrated to `normative`

A repository MUST reach **0 occurrences** of legacy values before freezing CONST-002 v1.1.

---

## 3. Legal Combinations

The following combinations of frontmatter values are valid.

### 3.1 Validity Matrix

| entry_surface | doc_type | authority | status | Valid |
|---------------|----------|-----------|--------|-------|
| documentation | normative | protocol | draft | ✅ |
| documentation | normative | protocol | frozen | ✅ |
| documentation | informative | none | draft | ✅ |
| documentation | reference | none | draft | ✅ |
| documentation | guide | none | draft | ✅ |
| documentation | attestation | none | draft | ✅ |
| repository | governance | none | draft | ✅ |
| validation_lab | informative | none | draft | ✅ |
| validation_lab | reference | none | draft | ✅ |
| validation_lab | governance | none | draft | ✅ |
| website | informative | none | draft | ✅ |
| website | * | protocol | * | ❌ |
| website | normative | * | * | ❌ |
| * | informative | none | frozen | ❌ |
| * | informative | protocol | * | ❌ |

### 3.2 Invalid Combinations

The following combinations are unconditionally invalid:

- `entry_surface: website` + `doc_type: normative`
- `entry_surface: website` + `authority: protocol`
- `doc_type: informative` + `status: draft`
- `doc_type: informative` + `authority: protocol`

---

## 4. Document Type Definitions

### 4.1 Normative Documents

Normative documents:
- May use MUST, SHALL, REQUIRED (RFC 2119)
- Define protocol requirements
- Must be located in `specification/*`
- May have `status: draft`
- Require `authority: protocol`

### 4.2 Informative Documents

Informative documents:
- Must not use MUST, SHALL, REQUIRED
- Explain, describe, or guide
- May be located in `evaluation/*` or elsewhere
- Cannot have `status: draft`
- Require `authority: none`

### 4.3 Non-Normative Guard

All informative documents must include the following guard:

```
> [!IMPORTANT]
> **Non-Normative Document**
>
> This document is informative only.
```

Absence of this guard in an informative document is a validity error.

### 4.4 Reference Documents

Reference documents:
- Provide quick lookups, indexes, glossaries, API references
- Must not use MUST, SHALL, REQUIRED
- Must include non-normative guard
- May be located in `introduction/*`, `reference/*`, `guides/*`
- Cannot have `status: draft`
- Require `authority: none`

### 4.5 Guide Documents

Guide documents:
- Provide how-to instructions, tutorials, examples
- Must not use MUST, SHALL, REQUIRED
- Must include explicit "Non-Goals" section
- Must include non-normative guard
- May be located in `guides/*`, `examples/*`
- Cannot have `status: draft`
- Require `authority: none`

### 4.6 Attestation Documents

Attestation documents:
- Provide evidence of learning, review, or approval
- Used for governance checkpoints
- Must not introduce new protocol semantics
- Must reference the corresponding method/checklist or report
- May be located in `meta/release/*`
- Cannot have `status: draft`
- Require `authority: none`

### 4.7 Governance Documents

Governance documents:
- Define governance processes and constitutional rules
- Must include: Authority (MPGC), Scope, Rules/Procedures, Amendment Process
- May use MUST/SHALL when defining **process requirements** (not protocol requirements)
- Must not produce protocol semantics
- Must reference higher-level constitutional or method documents as basis
- May be located in `governance/*`
- MUST have `status: draft`
- Governance immutability (if needed) is enforced via **sealed records** and governance registry, not via `status: draft`
- Require `authority: none` (governance authority ≠ protocol authority)

---

## 5. Frozen Eligibility

Only documents meeting all of the following conditions may be frozen:

- `doc_type: normative`
- `authority: protocol`
- `entry_surface: documentation`

Documents that do not meet these conditions must not have `status: draft`.

Frozen eligibility is a necessary but not sufficient condition. Actual freezing requires MPGC governance process.

---

## 6. External Standard References

MPLP documents may reference external standards (ISO, W3C, NIST, IETF).

### 6.1 Permitted Uses

- Contextual reference
- Terminology alignment
- Architectural inspiration

### 6.2 Prohibited Uses

- Claiming compliance with external standards
- Importing requirements from external standards
- Transferring authority from external standards
- Suggesting equivalence to external standards

---

## 7. Validation Lab Frontmatter Requirements

All **applicable** markdown files in the Validation Lab entry point (as defined in §1.1 Applicability) MUST include frontmatter.

### 7.1 Minimum Required Fields for Validation Lab

Sealed archival records and historical artifacts are exempt from this requirement to preserve historical integrity (see §1.1). Applicable files MUST include:

```yaml
---
entry_surface: validation_lab
doc_type: informative | reference | governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-<category>-<number>"
---
```

### 7.2 doc_id Naming Convention for Validation Lab

| Category | Prefix | Example |
|:---|:---|:---|
| Governance | `VLAB-GOV-` | `VLAB-GOV-001` |
| Method | `VLAB-METHOD-` | `VLAB-METHOD-001` |
| Reference | `VLAB-REF-` | `VLAB-REF-001` |
| Gate | `VLAB-GATE-` | `VLAB-GATE-001` |
| Contract | `VLAB-CON-` | `VLAB-CON-001` |

---

## 8. Validation

A document is valid if and only if:

1. Frontmatter contains all required fields
2. Frontmatter values form a legal combination per Section 3
3. Normative language rules per Section 4 are satisfied
4. Non-Normative Guard is present for informative documents
5. Frozen eligibility per Section 5 is satisfied
6. Validation Lab frontmatter requirements per Section 7 are satisfied (if applicable)

A document that fails any condition is invalid.

---

## 9. Amendment

This specification may only be amended through the MPGC constitutional governance process.

---

## 10. Amendment History

| Version | Date | Changes |
|:---|:---|:---|
| v1.0.0 | 2025-12-XX | Initial constitutional document format (2 doc_types, 3 entry_surfaces) |
| v1.1.0 | 2026-01-22 | Added validation_lab entry_surface, expanded doc_type to 6 types, added legacy migration rule |

---

**End of Document**
