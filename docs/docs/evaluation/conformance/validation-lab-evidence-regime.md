---
sidebar_position: 3
doc_type: reference
status: active
normativity: non-normative
authority: Validation Lab
protocol_version: "1.0.0"
title: "Validation Lab Evidence Regime — Reproducibility & Signed Proof"
description: "Non-normative reference: Type-A/Type-B evidence classification, reproducibility regime, and cryptographic seals (SIGN)."
---

# Validation Lab Evidence Regime

> **Authority**: Validation Lab (Non-Normative)  
> **Scope**: Evidence verification methodology, not protocol specification

---

## Truth Source Anchors (Repo)

All claims in this document are verifiable against repository artifacts:

| Artifact | Path | Purpose |
|----------|------|---------|
| Full 6-Substrate Evidence | `Validation_Lab/releases/v0.7.2/` | Type-B reproduction packs |
| Signed Proof | `Validation_Lab/releases/v0.7.3/artifacts/signed-proof/SIGN-02/` | Cryptographic seal |
| MA-REPRO Gate Report | `releases/v0.7.2/gates/ma-repro-gate.report.json` | 12-run verdict |
| Reproduce Instructions | `releases/v0.7.2/REPRODUCE.md` | Third-party verification |

---

## How to Reproduce

```bash
# One-command verification
git clone https://github.com/Coregentis/mplp_prerelease.git
cd mplp_prerelease && git checkout validation-lab/v0.7.2
./scripts/repro/run-ma-repro-full.sh
```

**Determinism Boundary**: Run-twice hash match is valid under declared **generator + lock + env** conditions only. Does not claim determinism under distributed scheduling or network variance.

---

## 1. Evidence Classification

Validation Lab classifies evidence by **verification strength**:

### Type-A: Static Evidence Validation

| Aspect | Description |
|--------|-------------|
| Source | Submitted evidence packs |
| Execution | None (structural checks only) |
| Determinism | Assumed but not verified |
| Gates | MA-STRUCT, MA-EQUIV |

Type-A validates that evidence packs conform to schema and maintain referential integrity, but does not re-execute generators.

### Type-B: Generator-Based Reproduction

| Aspect | Description |
|--------|-------------|
| Source | Regenerated via generator scripts |
| Execution | Generator runs with locked dependencies |
| Determinism | Run-twice verified (hash match) |
| Gates | MA-REPRO |

Type-B regenerates evidence packs twice and verifies `pack_root_hash` consistency.

---

## 2. Run-Twice Determinism

Each substrate generator produces a `pack_root_hash` (SHA-256 of `integrity/sha256sums.txt`).

**Verification Rule**: Two consecutive runs with identical inputs MUST produce identical `pack_root_hash`.

### v0.7.2 Verified Hashes

| Substrate | pack_root_hash | Runs |
|-----------|----------------|------|
| LangChain | `e35b8cef...` | 2/2 ✓ |
| AutoGen | `2af6a048...` | 2/2 ✓ |
| Magnetic-One | `15787a8b...` | 2/2 ✓ |
| PydanticAI | `8cbad37e...` | 2/2 ✓ |
| MCP | `b5237c83...` | 2/2 ✓ |
| A2A | `6728e24a...` | 2/2 ✓ |

---

## 3. Signed Proof (SIGN-02)

v0.7.3 applies a cryptographic seal over v0.7.2 evidence:

| Aspect | Value |
|--------|-------|
| Proof ID | SIGN-02 |
| Covers | v0.7.2 (97 files) |
| Source Tree Digest | `04bcce1631b4f70c...` |
| Purpose | Non-repudiation |

The signed proof ensures that v0.7.2 artifacts cannot be modified post-seal without detection.

---

## 4. Canonicalization Rules

Generators achieve determinism via:

1. **Fixed timestamp**: All artifacts use `2026-01-14T00:00:00Z`
2. **Seeded UUIDs**: `uuid5(NAMESPACE, name)` for reproducible IDs
3. **Sorted JSON**: All objects written with `sort_keys=True`
4. **No absolute paths**: Pack content is path-agnostic

---

## Non-Endorsement Boundary

> **MPLP does not endorse, certify, or rank any agent framework.**
> 
> - Type-A/Type-B indicate **evidence strength**, not framework capability
> - Determinism applies under **declared generator + lock + env** conditions
> - Does not claim determinism under distributed scheduling/network variance
> - Validation Lab is non-normative tooling, not certification authority

---

## Related Documentation

- [Evidence Model](./evidence-model.md) — What constitutes valid evidence
- [Golden Flows](/docs/evaluation/golden-flows) — Evaluation scenarios
- [Protocol Truth Index](/docs/evaluation/governance/protocol-truth-index) — Governance authority split
