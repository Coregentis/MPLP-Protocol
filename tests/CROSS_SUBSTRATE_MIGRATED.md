# Cross-Substrate Test Vectors — MIGRATED

> [!IMPORTANT]
> **This directory has been migrated to Validation Lab.**
> 
> **New Location:** `Validation_Lab/test-vectors/cross-substrate/`

---

## Why It Moved

`cross-substrate/` contains **evaluation assets** (substrate evidence packs for GF-01 adjudication), which belong to the **Validation Lab**, not the Protocol repository.

### Boundary Separation

| Repository | Scope |
|------------|-------|
| **Protocol (this repo)** | Protocol schemas, invariants, golden flow definitions |
| **Validation Lab** | Evidence evaluation, cross-substrate testing, adjudication bundles |

---

## How to Run Cross-Substrate Tests

Navigate to Validation Lab and use the canonical CLI:

```bash
cd Validation_Lab

# Verify a specific substrate pack
npx tsx src/cli/vlab.ts verify test-vectors/cross-substrate/gf-01/langchain/pack/

# Run all gates
npx tsx src/cli/vlab.ts gates
```

---

## SSOT Reference

| Asset | Location |
|-------|----------|
| Cross-Substrate Vectors | `Validation_Lab/test-vectors/cross-substrate/` |
| Allowlist Index | `Validation_Lab/test-vectors/v0.5/allowlist-v0.5.yaml` |
| Release Index | `Validation_Lab/governance/releases/release-index.yaml` |

---

**Migration Date:** 2026-01-20  
**Reason:** Cross-repository boundary governance
