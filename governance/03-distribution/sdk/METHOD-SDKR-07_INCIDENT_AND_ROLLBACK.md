---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-SDKR-07_INCIDENT_AND_ROLLBACK"
---

# METHOD-SDKR-07: Incident and Rollback

**Document ID**: METHOD-SDKR-07  
**Status**: Draft  
**Authority**: MPGC  
**Effective**: v1.0.0

---

## 1. Purpose

This method defines incident classification and rollback procedures for SDK releases.

---

## 2. Incident Classification

| Severity | Description | Example |
|:---|:---|:---|
| **Critical** | Package unusable | Import fails, crashes on load |
| **Major** | Functional defect | Enum mismatch, constraint violation |
| **Minor** | Non-blocking issue | Documentation error, warning |

---

## 3. Incident Record Requirement

For Critical and Major incidents:

- Incident record MUST be created
- Record MUST include:
  - SDK version
  - Failure description
  - Verification step that failed
  - Timestamp
  - Remediation plan

---

## 4. Rollback Actions

### 4.1 npm (TypeScript)

| Action | Command | When |
|:---|:---|:---|
| Deprecate | `npm deprecate mplp-sdk-ts@{version}` | Prefer newer |
| Unpublish (24h window) | `npm unpublish mplp-sdk-ts@{version}` | Critical only |

### 4.2 PyPI (Python)

| Action | Command | When |
|:---|:---|:---|
| Yank | `pip yank mplp=={version}` | Remove from default install |
| Delete (rare) | PyPI admin | Critical security only |

---

## 5. Evidence Baseline Impact

SDK release failures do **NOT** impact Evidence Baseline.

Evidence Baseline remains valid. Only SDK distribution is affected.

---

## 6. Post-Rollback Requirements

After rollback:

- Publish new PATCH version with fix
- Re-run full verification pipeline
- Document incident and resolution

---

## 7. Authority

Only MPGC may authorize:

- Unpublish/Yank actions
- Incident severity classification
- Waiver of verification steps

---

**Document Status**: Governance Method  
**Supersedes**: None  
**References**: README.md, METHOD-SDKR-06
