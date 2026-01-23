---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "GOV-ADDENDUM-EVID-BASELINE-v1.0"
---

# GOV-ADDENDUM: Evidence Baseline v1.0

**Document ID**: GOV-ADDENDUM-EVID-BASELINE-v1.0  
**Status**: GOVERNANCE-FROZEN  
**Effective Date**: 2026-01-04  
**Governed By**: MPGC

---

## 1. Scope

This addendum governs the `schemas/v2/_manifests/` directory — the **Evidence Baseline** for MPLP Protocol v1.0.

**Relationship to Constitutional Documents**:
- This addendum is subordinate to `governance/constitutional/`
- References: METHOD-TSV-01, METHOD-XCV-01, METHOD-DIV-01

---

## 2. Evidence Baseline Definition

> **Evidence Baseline** = Machine-generated, non-normative proof that Truth Sources are internally consistent.

| Property | Value |
|:---|:---|
| Bundle Hash | sha256:78ea3511cee7cacebff416b5ad6179358032d5322e5991523b5f8d6257d10354 |
| File Count | 40 (29 JSON + 11 YAML) |
| Manifest Version | 1.0.1 |
| XCV Points | 10 |

---

## 3. Post-Commit Governance Rules (G1–G6)

### G1. Branch Protection

Any PR modifying `schemas/v2/**` or `schemas/v2/_manifests/**` MUST:
- Pass all CI gates
- Receive ≥1 maintainer review

For XCV registry changes (`xcv-points.yaml`, `scope-domain-rule.yaml`):
- OPTIONAL: Require "MPGC-approved" label

### G2. Generator Fingerprint Validation

CI MUST verify:
- `bundle/generator-fingerprint.json` exists
- Required fields present: `generator.name`, `input.bundle_hash`, `output.files_generated`
- `replay_contract.required_tools` populated

**Verdict**: Missing or incomplete fingerprint = 🔴 FAIL

### G3. Impact Matrix Enforcement

When diff touches:

| Path | Required Regeneration |
|:---|:---|
| `mplp-*.schema.json` | bundle + TSV + XCV (if enum) |
| `invariants/*.yaml` | bundle + XCV + YAML |
| `taxonomy/*.yaml` | bundle + XCV + YAML |
| `profiles/*.yaml` | bundle + YAML |

CI MUST verify affected manifests updated in same PR.

**Verdict**: Missing regeneration = 🔴 FAIL

### G4. Reference Audit Gate

CI MUST scan:
```bash
grep -r "_manifests/" docs/ packages/ --include="*.md" --include="*.ts" --include="*.py"
```

**Allowed**: References to bundle hash string only  
**Forbidden**: Imports, links to `.md`/`.json` content  

**Verdict**: Unauthorized reference = 🔴 FAIL

### G5. Registry Version Enforcement

For `xcv-points.yaml` and `scope-domain-rule.yaml`:

| Change Type | Required Version Bump |
|:---|:---|
| New point added | MINOR |
| Point removed | MAJOR |
| path_dialect changed | MAJOR |
| expected value changed | MINOR |

CI MUST verify:
- If file content changed, version field must be bumped
- Version bump must match change type

**Verdict**: Content change without version bump = 🔴 FAIL

### G6. Evidence Baseline Tag

Upon freeze approval:
- Create Git tag: `evidence-baseline-v1.0`
- Release note: "Evidence Baseline frozen. No protocol semantic changes."

---

## 4. Non-Normative Declaration

> `schemas/v2/_manifests/` is **evidence only**.
>
> - MUST NOT be referenced as protocol authority
> - MUST NOT define new semantics
> - MAY be cited as verification evidence
>
> Violation of this principle = governance failure requiring escalation to MPGC.

---

## 5. Relationship to Verification Suite vs Validation Lab

| System | Input | Output | Governed By |
|:---|:---|:---|:---|
| **Verification Suite** | Repo files | `_manifests/` | This addendum |
| **Validation Lab** | User evidence packs | Compliance verdicts | Lab Ruleset (separate) |

These systems share philosophy but have distinct governance.

---

## 6. CI Gate Summary

| Gate | Trigger | Verdict |
|:---|:---|:---|
| Fingerprint Check | Any `_manifests/` change | FAIL if incomplete |
| Impact Matrix | Any `schemas/v2/**` change | FAIL if missing regen |
| Reference Audit | Any PR | FAIL if unauthorized ref |
| Version Bump | Registry file change | FAIL if no bump |
| Hash Match | Release | FAIL if hash mismatch |

---

## 7. Amendment Process

Changes to this addendum require:
1. MPGC approval
2. Constitutional consistency review
3. Version bump: MINOR (clarification) / MAJOR (rule change)

---

**Document Status**: Governance Addendum  
**Version**: 1.0.0  
**References**: `schemas/v2/_manifests/README.md`, METHOD-TSV-01, METHOD-XCV-01, METHOD-DIV-01
