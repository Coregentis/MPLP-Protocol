---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "README"
---

# SDK Release Governance

**Document ID**: GOV-SDKR-README  
**Status**: Draft  
**Authority**: MPGC  
**Effective**: v1.0.0

---

## 1. Purpose

SDK Release Governance defines **who may publish SDKs, when, how, and with what guarantees**.

This is a **post-verification governance system** that applies only after Evidence Baseline is frozen.

### SDK Release Lifecycle (Overview)

```
Truth Source (schemas/v2/)
        ↓
Evidence Baseline (Frozen)
        ↓
Derivation + Proof (DERIVATION_PROOF.yaml)
        ↓
SDK Package (npm tarball / Python wheel)
        ↓
Public Registry (npm / PyPI)
        ↓
Post-Install Verification (Clean Environment)
        ↓
Release Seal (VERSION_REGISTRY.yaml)
```

---

## 2. Positioning

SDK Release Governance is:

* A **Post-Evidence governance system**
* A **Derived Trusted Source distribution specification**
* A **User-facing installation completeness guarantee**

SDK Release Governance is **NOT**:

* A protocol specification
* A schema definition
* A validation methodology
* An SDK tutorial

---

## 3. Relationship to Other Systems

| System | Relationship |
|:---|:---|
| Evidence Baseline | SDK Release requires frozen Evidence Baseline |
| Verification Suite | SDK Release consumes verified Truth Sources |
| Validation Lab | No relationship (separate system) |
| Protocol Specification | SDK does not define protocol meaning |

---

## 4. Prerequisites

SDK Release is **governance-illegal** unless all of the following are met:

| Phase | Name | Required Status |
|:---|:---|:---|
| Phase 0–3 | Truth Source Verification (TSV/XCV/YAML) | PASS |
| Phase 4 | SCV-01 (TS SDK Schema Mirror) | PASS |
| Phase 5 | SUC-01 (Python SDK Model Conformance) | PASS |
| Phase 6 | DIV-01 (Derivation Integrity) | PASS or Explicitly Waived |
| Phase 7 | EVC-01 (Evolution Compatibility) | FROZEN |

---

## 5. Documents in This Directory

| Document | Purpose |
|:---|:---|
| METHOD-SDKR-01 | Release Pipeline |
| METHOD-SDKR-02 | Derivation Rules |
| METHOD-SDKR-03 | Versioning Law |
| METHOD-SDKR-04 | Package Content Specification |
| METHOD-SDKR-05 | Release Manifest |
| METHOD-SDKR-06 | Post-Install Verification |
| METHOD-SDKR-07 | Incident and Rollback |
| METHOD-SDKR-08 | Multi-Package Release Governance |
| **METHOD-SDKR-09** | **Release Readiness Governance (8-Stage Framework)** |
| CHECKLIST | Release Audit Checklist (8-Stage) |

---

## 7. Documentation Anchor (Standard Template)

SDK Release Governance is NOT documented in user-facing docs.

Docs sites may include ONLY the following anchor text:

```markdown
## SDK Governance

MPLP SDKs are derived artifacts governed by MPGC.
Their release process is governed, not documented here.

- Process: `governance/03-distribution/sdk/`
- Manifest Schema: `schemas/governance/sdk-release-manifest.schema.json`
- Version Registry: `governance/03-distribution/sdk/VERSION_REGISTRY.yaml`

SDKs do not define protocol meaning. See Truth Sources for authoritative definitions.
```

Any deviation from this template requires MPGC approval.

---

## 8. Additional Files

| File | Purpose |
|:---|:---|
| VERSION_REGISTRY.yaml | Track all SDK releases with protocol binding |
| schemas/governance/sdk-release-manifest.schema.json | Machine-readable manifest validation |

---

**Document Status**: Governance Entry Point  
**Supersedes**: None  
**References**: GOV-ADDENDUM-EVID-BASELINE-v1.0, FREEZE-EVID-BASELINE-v1.0
