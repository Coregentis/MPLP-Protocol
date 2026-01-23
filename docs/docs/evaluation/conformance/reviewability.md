---
doc_type: reference
authority: Documentation
normativity: non-normative
status: active
sidebar_label: Reviewability
description: "Explains what MPLP Validation Lab guarantees (reviewability) and does not guarantee (reproducibility). Non-normative reference."
---

# Reviewability vs Reproducibility (Informative)

This page explains what the MPLP Validation Lab guarantees, and what it does not.

## Reviewability (what the Lab guarantees)

**Reviewability** means:

- You can download the same Evidence Pack and re-run the canonical verifier locally.
- The adjudication result is **deterministic**: same input yields the same `verdict_hash`.
- Curated runs are **adjudication-backed**: curated entries link to adjudication bundles and hashes (export v1.2).

## Reproducibility (what the Lab does NOT guarantee)

**Reproducibility** means re-executing the original agent runtime / substrate to regenerate the same evidence from scratch.

The Validation Lab does **not** guarantee reproducibility:

- It does not host execution environments.
- It does not regenerate evidence packs.
- The producer environment and execution substrate are outside the Lab's scope.

## Notes for consumers

- If you need to verify a published result, verify the Evidence Pack and `verdict_hash`.
- If you need to reproduce execution, you must control the producer tooling and environment fingerprinting yourself.

## How to Recheck Locally

You can verify any adjudication result independently. Here's the minimal verification path:

### Step 1: Get the Adjudication Bundle

```bash
# Clone the Validation Lab repository
git clone https://github.com/Coregentis/MPLP-Protocol.git
cd MPLP-Protocol/Validation_Lab

# Navigate to the adjudication bundle
ls adjudication/<run_id>/
```

### Step 2: Verify File Integrity

```bash
# Check sha256sums (all 7 files must match)
cd adjudication/<run_id>/
sha256sum -c sha256sums.txt
```

### Step 3: Verify Verdict Hash (Read-Only)

```bash
# Recompute verdict_hash without modifying the bundle
npm run vlab:recheck-hash <run_id>
```

This command reads `verdict.json`, recomputes the hash using the same deterministic algorithm, and compares it with the stored hash.

### Expected Result

- All files pass sha256 check → Bundle is intact
- verdict_hash matches recomputation → Adjudication is deterministic
- If hashes differ → Bundle may have been tampered with

> **Note**: These commands are **read-only** and do not modify the bundle. The Lab rechecks evidence, not execution.

:::info Reviewability ≠ Reproducibility
The Lab rechecks evidence, not execution. Same evidence yields same verdict — but regenerating evidence requires your own producer environment.
:::

