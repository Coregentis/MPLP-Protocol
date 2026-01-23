---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "CHECKLIST-SDK-RELEASE"
---

# SDK Release Checklist

**Document ID**: CHECKLIST-SDK-RELEASE  
**Status**: Frozen (v1.0)  
**Authority**: MPGC  
**Reference**: METHOD-SDKR-09

---

## Usage

This checklist follows the **8-Stage Release Readiness Framework** defined in METHOD-SDKR-09.

- All items MUST be YES
- Any NO = **Release Blocked**
- Stage 4 has **NO EXCEPTIONS** regardless of change size

---

## Stage 0: Release Intent Declaration

**Reference**: [METHOD-SDKR-09 §5.1](./METHOD-SDKR-09_RELEASE_READINESS.md)

| # | Check | YES/NO |
|:---|:---|:---:|
| 0.1 | `RELEASE_INTENT.md` created? | [ ] |
| 0.2 | All packages to release listed? | [ ] |
| 0.3 | Version change declared for each package (from → to)? | [ ] |
| 0.4 | Bump reason stated for each package? | [ ] |

**Evidence**: `artifacts/release/RELEASE_INTENT.md`

---

## Stage 1: Version Legitimacy Validation

**Reference**: [METHOD-SDKR-09 §5.2](./METHOD-SDKR-09_RELEASE_READINESS.md), [METHOD-SDKR-03](./METHOD-SDKR-03_VERSIONING_LAW.md)

| # | Check | YES/NO |
|:---|:---|:---:|
| 1.1 | Each package's bump type declared (PATCH/MINOR)? | [ ] |
| 1.2 | MINOR bumps have explicit capability description? | [ ] |
| 1.3 | No "error correction" bumps to MINOR? | [ ] |
| 1.4 | Registry versions fetched to confirm bump target? | [ ] |
| 1.5 | All versions bumped to (registry_latest + 1)? | [ ] |

**Evidence**: `artifacts/release/VERSION_CHANGE_JUSTIFICATION.md`

---

## Stage 2: Dependency Integrity Check

**Reference**: [METHOD-SDKR-09 §5.3](./METHOD-SDKR-09_RELEASE_READINESS.md)

| # | Check | YES/NO |
|:---|:---|:---:|
| 2.1 | All package dependencies verified? | [ ] |
| 2.2 | No implicit cross-package breakage? | [ ] |
| 2.3 | Internal `file:` dependencies resolved for publish? | [ ] |

**Evidence**: `artifacts/release/DEPENDENCY_CHECK.md`

---

## Stage 3: Derivation & Content Verification

**Reference**: [METHOD-SDKR-02](./METHOD-SDKR-02_DERIVATION_RULES.md), [METHOD-SDKR-04](./METHOD-SDKR-04_PACKAGE_CONTENT_SPEC.md)

| # | Check | YES/NO |
|:---|:---|:---:|
| 3.1 | `DERIVATION_PROOF.yaml` present for each package? | [ ] |
| 3.2 | Schema derivation traceable? | [ ] |
| 3.3 | Forbidden content scan PASS? | [ ] |
| 3.4 | Required files present (dist/, README.md, LICENSE)? | [ ] |
| 3.5 | No governance/internal files in package? | [ ] |

---

## Stage 4: Pre-Publish Isolated Verification (MANDATORY)

**Reference**: [METHOD-SDKR-09 §5.5](./METHOD-SDKR-09_RELEASE_READINESS.md)

> ⚠️ **No release may bypass this stage, regardless of change size or bump type.**

### npm Packages

| # | Check | YES/NO |
|:---|:---|:---:|
| 4.1 | `npm pack` executed for each package? | [ ] |
| 4.2 | Tarball installed in clean temp directory? | [ ] |
| 4.3 | `require('@mplp/pkg')` succeeds? | [ ] |
| 4.4 | Type definitions present (.d.ts)? | [ ] |
| 4.5 | Exports verified? | [ ] |

### PyPI Packages

| # | Check | YES/NO |
|:---|:---|:---:|
| 4.6 | `python -m build` executed? | [ ] |
| 4.7 | Wheel installed locally? | [ ] |
| 4.8 | `import mplp` succeeds? | [ ] |
| 4.9 | Version matches expected? | [ ] |

**Evidence**: `artifacts/release/ISOLATED_VERIFICATION_REPORT.md`

---

## Stage 5: Documentation Linkage

**Reference**: [METHOD-SDKR-09 §5.6](./METHOD-SDKR-09_RELEASE_READINESS.md)

| # | Check | YES/NO |
|:---|:---|:---:|
| 5.1 | `CHANGELOG.md` updated with new versions? | [ ] |
| 5.2 | Package README updated (if behavior changed)? | [ ] |
| 5.3 | `RELEASE_BUNDLE_MANIFEST.json` updated? | [ ] |
| 5.4 | Copyright year current (© 2026)? | [ ] |
| 5.5 | DERIVATION_PROOF.yaml versions aligned? | [ ] |

---

## Stage 6: Release Gate (Final Approval)

**Reference**: [METHOD-SDKR-09 §5.7](./METHOD-SDKR-09_RELEASE_READINESS.md)

| # | Check | YES/NO |
|:---|:---|:---:|
| 6.1 | All Stages 0-5 PASS? | [ ] |
| 6.2 | All evidence artifacts present? | [ ] |
| 6.3 | No unexplained version jumps? | [ ] |
| 6.4 | Release approved by responsible party? | [ ] |

**Decision**: [ ] APPROVED / [ ] REJECTED

If REJECTED, return to failed stage and restart.

---

## Stage 7: Publish Execution

**Reference**: [METHOD-SDKR-09 §5.8](./METHOD-SDKR-09_RELEASE_READINESS.md)

| # | Check | YES/NO |
|:---|:---|:---:|
| 7.1 | Stage 6 approved? | [ ] |
| 7.2 | npm login authenticated? | [ ] |
| 7.3 | All npm PUBLIC packages published? | [ ] |
| 7.4 | PyPI authentication configured? | [ ] |
| 7.5 | All PyPI PUBLIC packages published? | [ ] |
| 7.6 | Publish log recorded? | [ ] |

---

## Stage 8: Post-Publish Verification

**Reference**: [METHOD-SDKR-06](./METHOD-SDKR-06_POST_INSTALL_VERIFICATION.md)

### npm Verification (from registry)

| # | Check | YES/NO |
|:---|:---|:---:|
| 8.1 | Clean `npm install @mplp/*` succeeds? | [ ] |
| 8.2 | Import succeeds for each package? | [ ] |
| 8.3 | Published version matches expected? | [ ] |

### PyPI Verification (from registry)

| # | Check | YES/NO |
|:---|:---|:---:|
| 8.4 | Clean `pip install mplp-sdk` succeeds? | [ ] |
| 8.5 | Import succeeds? | [ ] |
| 8.6 | Published version matches expected? | [ ] |

---

## Post-Publish Actions

| # | Check | YES/NO |
|:---|:---|:---:|
| 9.1 | `npm deprecate` executed for deprecated packages? | [ ] |
| 9.2 | VERSION_REGISTRY.yaml updated? | [ ] |
| 9.3 | Release artifacts archived? | [ ] |

---

## Sign-off

| Role | Name | Date | Signature |
|:---|:---|:---|:---|
| Release Engineer | | | |
| MPGC Representative | | | |

---

## Automatic Rejection Conditions

| Condition | Reference | Ruling |
|:---|:---|:---:|
| Missing RELEASE_INTENT.md | SDKR-09 §5.1 | **REJECT** |
| Illegitimate version bump | SDKR-09 §5.2 | **REJECT** |
| MINOR bump for error correction | SDKR-03, SDKR-09 | **REJECT** |
| Stage 4 verification failure | SDKR-09 §5.5 | **REJECT** |
| Stage 4 bypass attempt | SDKR-09 §3 | **REJECT** |
| Missing evidence artifacts | SDKR-09 §6 | **REJECT** |
| Stage 6 not approved | SDKR-09 §5.7 | **REJECT** |

---

**Document Status**: Governance Checklist  
**References**: METHOD-SDKR-01 through SDKR-09
