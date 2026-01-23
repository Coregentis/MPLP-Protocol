---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "RELEASE_INTENT_TEMPLATE"
---

# Release Intent Declaration

**Document ID**: RELEASE_INTENT  
**Release Date**: YYYY-MM-DD  
**Prepared By**: [Name]

---

## 1. Packages to Release

| Package | Current Version | Target Version | Ecosystem |
|:---|:---|:---|:---|
| @mplp/core | x.y.z | x.y.z+1 | npm |
| @mplp/schema | x.y.z | x.y.z+1 | npm |
| ... | ... | ... | ... |

---

## 2. Version Change Summary

| Package | Bump Type | Reason |
|:---|:---|:---|
| @mplp/core | PATCH | [Brief reason] |
| @mplp/schema | PATCH | [Brief reason] |
| ... | ... | ... |

---

## 3. Release Scope

### Included
- [ ] npm packages
- [ ] PyPI packages

### Excluded
- [ ] [Any packages intentionally excluded this release]

---

## 4. Prerequisites Verified

- [ ] Evidence Baseline frozen
- [ ] All derivation phases PASS
- [ ] No blocking governance issues

---

## 5. Sign-off

| Role | Name | Date |
|:---|:---|:---|
| Release Engineer | | |

---

**Reference**: METHOD-SDKR-09 §5.1
