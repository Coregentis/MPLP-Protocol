---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-SDKR-03_VERSIONING_LAW"
---

# METHOD-SDKR-03: Versioning Law

**Document ID**: METHOD-SDKR-03  
**Status**: Draft  
**Authority**: MPGC  
**Effective**: v1.0.0

---

## 1. Purpose

This method defines the versioning rules for SDK releases.

These are **laws**, not guidelines.

---

## 2. Version Source

SDK version MUST be derived from:

| Source | Relationship |
|:---|:---|
| Protocol Version | SDK major.minor ≤ protocol major.minor |
| Evidence Baseline Tag | SDK MUST reference frozen baseline |

---

## 3. Version Format

SDK versions MUST follow: `{protocol_major}.{protocol_minor}.{sdk_patch}`

Example: Protocol v1.0.0 → SDK v1.0.0, v1.0.1, v1.0.2...

---

## 4. Allowed Version Bumps

| Change Type | Allowed Bump | Approval Required |
|:---|:---|:---|
| Bug fix (no schema change) | PATCH | Standard |
| Dependency update | PATCH | Standard |
| New protocol version | MINOR/MAJOR | MPGC |

---

## 5. Forbidden Version Bumps

| Action | Reason |
|:---|:---|
| SDK MAJOR without protocol MAJOR | SDK cannot advance protocol |
| SDK MINOR without protocol MINOR | SDK cannot add features |
| Breaking change in PATCH | Semantic versioning violation |

---

## 6. Version Alignment

SDK version MUST NOT:

- Advance protocol version
- Introduce breaking changes independently
- Claim compatibility with unpublished protocol versions

---

## 7. Pre-release Versions

Pre-release versions (alpha, beta, rc) are allowed but MUST:

- Follow semver format: `1.0.0-alpha.1`
- Reference valid Evidence Baseline
- Not be promoted to stable without full verification

---

## 8. Version Calculation Formula

SDK version MUST be computed as:

```
SDK_VERSION = {protocol_major}.{protocol_minor}.{sdk_patch}
```

Where:
- `protocol_major` = MPLP protocol major version
- `protocol_minor` = MPLP protocol minor version
- `sdk_patch` = SDK-specific patch counter (starts at 0)

**Example**:
- Protocol v1.0.0 → SDK v1.0.0, v1.0.1, v1.0.2...
- Protocol v1.1.0 → SDK v1.1.0, v1.1.1...

---

## 9. Patch Ruling Table

The following changes determine PATCH legitimacy:

| Change | Ruling | Verdict |
|:---|:---|:---:|
| Bug fix with no schema change | LEGAL | ✅ |
| Dependency version bump | LEGAL | ✅ |
| Documentation correction | LEGAL | ✅ |
| Generator output format change | LEGAL | ✅ |
| Add helper function without declaration | ILLEGAL | ❌ |
| Modify enum literal | ILLEGAL | ❌ |
| Change validation strictness | ILLEGAL | ❌ |
| Add new export not in schema | ILLEGAL | ❌ |
| README content change | LEGAL | ✅ |

Any ILLEGAL change requires new protocol version, not PATCH.

---

## 10. Version Injective Law (MANDATORY)

SDK versions MUST be **injective** with respect to protocol state.

### 10.1 Injective Definition

Every SDK version MUST uniquely map to exactly one:
- `protocol_version`
- `evidence_baseline_tag`

**Formally**:
```
SDK_VERSION → (protocol_version, evidence_baseline_tag)
```
This mapping MUST be one-to-one.

### 10.2 Violations

The following are **governance-illegal**:

| Violation | Description |
|:---|:---|
| Two SDK versions → same baseline | Version inflation without protocol change |
| One SDK version → multiple baselines | Ambiguous derivation source |
| SDK version without baseline reference | Untraceable release |

### 10.3 User Verification

A user MUST be able to determine from an SDK package:
1. Which protocol version it implements
2. Which Evidence Baseline it derives from
3. The exact Truth Source bundle hash

If any of these cannot be determined → release is **governance-illegal**.

### 10.4 Version Registry Requirement

All released SDK versions MUST be registered in:

```yaml
# governance/sdk-release/VERSION_REGISTRY.yaml
releases:
  - sdk_version: "1.0.0"
    protocol_version: "1.0.0"
    evidence_baseline_tag: "evidence-baseline-v1.0"
    release_date: "2026-01-04"
  - sdk_version: "1.0.1"
    protocol_version: "1.0.0"
    evidence_baseline_tag: "evidence-baseline-v1.0"
    release_date: "2026-01-05"
```

---

**Document Status**: Governance Method  
**Supersedes**: None  
**References**: README.md
