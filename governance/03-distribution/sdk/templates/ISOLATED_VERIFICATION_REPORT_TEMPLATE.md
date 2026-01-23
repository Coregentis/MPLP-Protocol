---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "ISOLATED_VERIFICATION_REPORT_TEMPLATE"
---

# Isolated Verification Report

**Document ID**: ISOLATED_VERIFICATION_REPORT  
**Release Date**: YYYY-MM-DD  
**Reference**: METHOD-SDKR-09 §5.5

---

> ⚠️ **No release may bypass this verification, regardless of change size.**

---

## 1. Environment Information

| Property | Value |
|:---|:---|
| Verification Date | YYYY-MM-DD HH:MM |
| Node.js Version | vX.Y.Z |
| Python Version | 3.X.Y |
| npm Version | X.Y.Z |
| pip Version | X.Y.Z |
| OS | macOS / Linux |
| Verification Directory | /tmp/verify-... |

---

## 2. npm Package Verification

### @mplp/[package-name]

| Step | Command | Result |
|:---|:---|:---|
| Pack | `npm pack` | ✅ / ❌ |
| Install | `npm install ./pkg-x.y.z.tgz` | ✅ / ❌ |
| Import (CJS) | `node -e "require('@mplp/pkg')"` | ✅ / ❌ |
| Import (ESM) | `node --experimental-vm-modules -e "import('@mplp/pkg')"` | ✅ / ❌ |
| Types | `.d.ts` files present | ✅ / ❌ |

**Tarball Info**:
- Filename: `mplp-pkg-x.y.z.tgz`
- SHA: `sha512-...`
- Size: X.X kB

**Export Verification**:
```
Exports: function1, function2, CONSTANT_1, ...
```

---

## 3. PyPI Package Verification

### mplp-sdk

| Step | Command | Result |
|:---|:---|:---|
| Build | `python -m build` | ✅ / ❌ |
| Install wheel | `pip install ./dist/*.whl` | ✅ / ❌ |
| Import | `python -c "import mplp"` | ✅ / ❌ |
| Version | `mplp.__version__` | X.Y.Z |

**Artifact Info**:
- Wheel: `mplp_sdk-x.y.z-py3-none-any.whl`
- SHA256: `...`

---

## 4. Verification Summary

| Package | Pack/Build | Install | Import | Types | Overall |
|:---|:---:|:---:|:---:|:---:|:---:|
| @mplp/core | ✅ | ✅ | ✅ | ✅ | **PASS** |
| @mplp/schema | ✅ | ✅ | ✅ | ✅ | **PASS** |
| mplp-sdk | ✅ | ✅ | ✅ | N/A | **PASS** |

---

## 5. Issues Found & Resolution

| Issue | Package | Resolution |
|:---|:---|:---|
| [None / Description] | | |

---

## 6. Final Verification Status

- [ ] All packages verified in isolated environment
- [ ] All imports succeed
- [ ] All versions match expected
- [ ] No issues blocking release

**VERIFICATION STATUS**: ✅ PASS / ❌ FAIL

---

## Sign-off

| Role | Name | Date |
|:---|:---|:---|
| Verification Engineer | | |

---

**Reference**: METHOD-SDKR-09 §5.5
