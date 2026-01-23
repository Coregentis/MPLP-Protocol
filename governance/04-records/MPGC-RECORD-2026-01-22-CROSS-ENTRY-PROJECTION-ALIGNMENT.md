# MPGC Record: Cross-Entry Projection Alignment

**Record ID**: MPGC-RECORD-2026-01-22-CROSS-ENTRY-PROJECTION-ALIGNMENT  
**Date**: 2026-01-22  
**Status**: SEALED (Repository)  
**Deployment Status**: Pending  
**Associated Constitution Version**: CONST-001/002/003 v1.1.0

---

## 1. Purpose

This record documents the projection of Constitutional v1.1.0 requirements onto the Website (`mplp.io`) and Documentation (`docs.mplp.io`) entry surfaces.

---

## 2. Change Scope

### Website (mplp.io)

| Page | Change |
|:---|:---|
| `/governance/overview` | Removed RFC 2119 "MUST" → descriptive language |
| `/validation-lab` | "Four-entry model" → "3+1 Entry Model"; "Site Freeze" → "Site Seal"; SSOT pointer fixed |
| `/what-is-mplp` | "Four-Entry Model" → "3+1 Entry Model"; POSIX analogy rephrased; SSOT statement added |

### Documentation (docs.mplp.io)

| Page | Change |
|:---|:---|
| Homepage | "Compliance levels/suites" → "Conformance levels/suites"; Governance pointer sentence added |

---

## 3. Defensive Gates (New)

| Gate | Purpose |
|:---|:---|
| `gate-wg-no-rfc2119-01.sh` | Blocks visible RFC 2119 terms (MUST/SHALL/REQUIRED) in Website |
| `gate-docs-no-compliance-01.sh` | Blocks affirmative "Compliance level/suite" claims in Docs |
| `gate-nonnorm-no-frozen-01.sh` | Blocks non-normative "Freeze" terminology in Website |

---

## 4. Evidence of Conformance

### 4.1 Commit Anchors (Fill at Merge)

- **Repository Commit**: `[CI:COMMIT_HASH]`
- **Website Commit**: `[CI:COMMIT_HASH]` (same repo)
- **Docs Commit**: `[CI:COMMIT_HASH]` (same repo)
- **Deployment Target**: `mplp.io`, `docs.mplp.io`

### 4.2 Constitutional Reference

- CONST-001 v1.1.0, CONST-002 v1.1.0, CONST-003 v1.1.0

### 4.3 Gate Results

- `gate-wg-no-rfc2119-01`: PASS
- `gate-docs-no-compliance-01`: PASS
- `gate-nonnorm-no-frozen-01`: PASS

---

## 5. Verification Command

```bash
./scripts/gates/gate-wg-no-rfc2119-01.sh && \
./scripts/gates/gate-docs-no-compliance-01.sh && \
./scripts/gates/gate-nonnorm-no-frozen-01.sh
```

---

## 6. Signing

- **Proposed By**: Antigravity (Assistant)
- **Record Date**: 2026-01-22
- **MPGC Approval**: [PENDING]

---

**End of Record**
