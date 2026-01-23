# CONST-004: Documentation Audit Methodology

> **Frozen Governance Specification**
>
> Version: 1.0.0
> Status: FROZEN
> Authority: MPGC

## 1. Purpose

This specification defines the mandatory methodology for auditing MPLP documentation to ensure world-class accuracy and traceability. All documentation must be auditable using this methodology, enabling users to completely build and use the protocol based solely on the documentation.

---

## 2. Unified 10-Dimension Framework

Documentation audits MUST apply all dimensions. A document passes only when ALL dimensions are verified.

### Part 1: Constitutional Compliance (D1-D7)

| Dimension | Requirement |
|:---|:---|
| **D1** Frontmatter | 6 required fields: `entry_surface`, `doc_type`, `status`, `authority`, `protocol_version`, `doc_id` |
| **D2** Structure | Frozen: CONST-003 header. Informative: CONST-002 §4.3 guard |
| **D3** RFC 2119 | Normative: MUST/SHALL allowed. Informative: MUST/SHALL prohibited |
| **D4** Section Numbering | Sequential (1→N) without gaps |
| **D5** Required Sections | Normative: Scope, Non-Goals present |
| **D6** Internal Links | All links valid, paths correct |
| **D7** No Duplicate Title | Title in frontmatter and H1 must not conflict |

### Part 2: Truth Source Alignment (P1-P4)

| Principle | Requirement |
|:---|:---|
| **P1** Schema Verification | All JSON examples, field references MUST match JSON Schema definitions |
| **P2** YAML Verification | All IDs, counts, enums MUST match YAML configuration files |
| **P3** Code Chain Reference | All code examples, table mappings MUST derive from P1+P2 |
| **P4** Full Coverage | Every line MUST be verified. No skipping, no batch processing |

---

## 3. Truth Source Hierarchy

```
Layer 0: JSON Schema (schemas/v2/*.schema.json)
         ↓ defines
Layer 1: YAML Configuration (schemas/v2/invariants/, profiles/, taxonomy/)
         ↓ references
Layer 2: Documentation (docs/docs/**/*.md)
         → MUST 100% align with Layer 0-1
```

---

## 4. Audit Execution Checklist

For each document:

```
□ D1 Frontmatter complete
□ D2 Header/Guard format correct
□ D3 RFC 2119 tone appropriate
□ D4 Section numbers sequential
□ D5 Required sections present
□ D6 Links valid
□ D7 No duplicate title
□ P1 Every JSON → Schema verified
□ P2 Every ID/count → YAML verified
□ P3 Every code → P1+P2 verified
□ P4 Full document reviewed line-by-line
```

**Commit only when ALL ✅**

---

## 5. Common Drift Patterns

| Drift Type | Example | Fix Method |
|:---|:---|:---|
| Missing required field | JSON lacks `event_id` | Add per schema |
| Invalid field | `event_family` on additionalProperties:false | Remove |
| Wrong UUID format | `sa-xxx`, `collab-xxx` | Standard UUID |
| Non-schema payload | `duration_ms`, `broadcast_ref` | Remove |
| Wrong module mapping | Broadcast→Network | Collab (per YAML) |
| Wrong count | invariants: 59 | 61 (per YAML count) |

---

## 6. Audit Report Template

Each audit MUST produce a report with:

```markdown
## [Directory] Audit Report

### Files Audited: N

| File | D1-D7 | P1-P4 | Fixes Applied |
|:---|:---:|:---:|:---|
| file.md | ✅ | ✅ | - |

### Truth Sources Verified
- schema.json: [list]
- invariants.yaml: [list]

### Drifts Found and Fixed: N
- [line]: [old] → [new] (reason)
```

---

## 7. Governance Entry Point

### 7.1 Trigger Conditions

An audit MUST be performed when:
1. New documentation is added
2. Schema or YAML truth sources are modified
3. Pre-release verification is required
4. Drift is suspected

### 7.2 Invocation

```
Audit Request: "使用CONST-004方法论审核[目录]"
```

### 7.3 Completion Criteria

Audit is complete when:
- All files in scope have passed 10-dimension verification
- All drifts are fixed and committed
- Audit report is generated

---

**Document Status**: Governance Specification  
**Supersedes**: None  
**References**: CONST-001, CONST-002, CONST-003
