---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "DEPENDENCY_CHECK_TEMPLATE"
---

# Dependency Integrity Check

**Document ID**: DEPENDENCY_CHECK  
**Release Date**: YYYY-MM-DD  
**Reference**: METHOD-SDKR-09 §5.3

---

## 1. Packages Checked

| Package | Ecosystem |
|:---|:---|
| @mplp/core | npm |
| ... | ... |

---

## 2. Dependency Matrix

### @mplp/[package-name]

| Dependency | Declared Version | Resolved Version | Status |
|:---|:---|:---|:---|
| @mplp/core | ^1.0.0 | 1.0.6 | ✅ OK |
| pydantic | >=2.0,<3.0 | 2.12.5 | ✅ OK |

---

## 3. Internal Dependency Resolution

For packages using `file:../` dependencies:

| Package | Internal Dep | Resolved For Publish |
|:---|:---|:---|
| @mplp/sdk-ts | @mplp/core (file:../core) | ^1.0.6 |

- [ ] All `file:` dependencies converted to version ranges before publish

---

## 4. Cross-Package Drift Check

- [ ] No implicit breaking changes between packages
- [ ] All packages compatible at declared versions

---

## 5. Confirmation

- [ ] All dependencies verified
- [ ] No unresolved `file:` dependencies for publish
- [ ] No cross-package drift detected

---

## Sign-off

| Role | Name | Date |
|:---|:---|:---|
| Release Engineer | | |

---

**Reference**: METHOD-SDKR-09 §5.3
