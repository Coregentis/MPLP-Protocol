# schemas/v2/_manifests — Evidence Artifacts

**Status**: NON-NORMATIVE / EVIDENCE-ONLY  
**Generated**: 2026-01-04  
**Bundle Hash**: sha256:78ea3511cee7cacebff416b5ad6179358032d5322e5991523b5f8d6257d10354

---

## Constitutional Boundaries

### 1. No Semantic Authority

> `_manifests/` is **non-normative evidence**, not a truth source.
>
> These artifacts **do not define** any protocol semantics.
> Docs, SDKs, and tooling **MUST NOT** reference `_manifests/` content as authoritative.
> They MAY reference the bundle hash as verification evidence.

### 2. No Claim About Derived Artifacts

> Phase 0–3 verification proves **Truth Source internal consistency only**.
>
> This verification makes **no assertion** about:
> - SDK type correctness
> - Documentation accuracy
> - Runtime behavior conformance
> - Generated code fidelity
>
> Those claims require Phase 4–7 (SCV/SUC/DIV/EVC) execution.

### 3. Evidence Scope

> "No drift" = verified on **declared cross-consistency points only**:
>
> | Point | Verified |
> |:---|:---:|
> | event_family enum (12 values) | ✅ |
> | Invariant rule counts (61 total) | ✅ |
> | Module names (10 modules) | ✅ |
> | $ref closure (144 refs) | ✅ |
> | schema_ref path existence (9 paths) | ✅ |
> | Invariant ID uniqueness (61 IDs) | ✅ |
>
> **Unchecked points do not automatically receive PASS status.**

---

## Manifest Update Rules (CI Gate)

### Rule 1: Mandatory Sync

Any modification to `schemas/v2/**` (Truth Sources) **MUST** trigger regeneration of:
- `bundle/truth-source-inventory.json`
- `bundle/truth-source-bundle.sha256`
- Affected TSV/XCV/YAML reports

### Rule 2: Hash Mismatch = FAIL

If `truth-source-bundle.sha256` does not match computed hash at CI time:
- **PR Gate**: 🔴 FAIL (block merge)
- **Release Gate**: 🔴 FAIL (block release)

### Rule 3: No Manual Edits

These manifests are **generator output only**.
Manual edits are forbidden. Presence of non-generated content = boundary violation.

---

## Directory Structure

```
_manifests/
├── bundle/
│   ├── truth-source-inventory.json   # File list + counts
│   └── truth-source-bundle.sha256    # Reproducible hash
├── tsv/
│   ├── ref-closure.json              # $ref dependency graph
│   └── ref-map-table.md              # Human-readable ref map
├── xc/
│   ├── cross-consistency-verdict.json
│   └── cross-consistency-verdict.md  # Schema↔YAML alignment
├── yaml/
│   └── yaml-lint-report.md           # YAML internal consistency
└── README.md                         # This file
```

---

## Schema Dialect Fingerprint

| Aspect | Current State | Governance Decision |
|:---|:---|:---|
| JSON Schema Draft | draft-07 | Frozen for v1.0.0 |
| `$defs` vs `definitions` | Mixed usage | Allowed (historical compatibility) |
| Future standardization | Planned for v2.0 | Migrate to `$defs` only |

### Dialect Interpretation Rules

**Rule D1 (Acceptance)**:
> This repository's schemas MAY contain both `definitions` (draft-04/06/07) and `$defs` (draft-2019-09+).
> All tools MUST parse both keywords equivalently.
> Failure to resolve either keyword = tool non-compliance.

**Rule D2 (Canonicalization for Diff)**:
> In SCV/DIV surface diff operations, both keywords MUST be canonicalized to internal symbol representation.
> A schema using `$defs` and one using `definitions` with identical structure = **semantically equivalent**.
> Keyword difference alone is NOT a drift signal.

---

## Manifest Update Impact Matrix

| Change Area | Regen Bundle | Regen TSV | Regen XCV | Regen YAML |
|:---|:---:|:---:|:---:|:---:|
| `mplp-*.schema.json` (modules) | ✅ | ✅ | ✅ (if enum touched) | - |
| `common/*.json` | ✅ | ✅ | ✅ (if referenced by XCV point) | - |
| `events/*.json` | ✅ | ✅ | ✅ (event_family) | - |
| `integration/*.json` | ✅ | ✅ | ✅ (tool_kind) | - |
| `learning/*.json` | ✅ | ✅ | - | - |
| `invariants/*.yaml` | ✅ | - | ✅ (counts) | ✅ |
| `taxonomy/*.yaml` | ✅ | - | ✅ (families, modules) | ✅ (schema_refs) |
| `profiles/*.yaml` | ✅ | - | - | ✅ (modules) |
| `examples/*` | ✅ (hash only) | - | - | - |

**Gate**: CI verifies correct manifests regenerated based on changed files.

---

## Verification Suite vs Validation Lab

| Concept | Scope | Purpose |
|:---|:---|:---|
| **Verification Suite** (this) | Repo-internal | Prove Truth Source ↔ Derived artifacts consistency |
| **Validation Lab** (external) | External submissions | Audit user evidence packs against Golden Flow rulesets |

These are **separate systems**. Verification Suite is infrastructure; Validation Lab is user-facing evaluation.

---

## Directory Structure (Updated)

```
_manifests/
├── README.md                         # This file
├── manifests-reference-audit.md      # Reference lint results
├── bundle/
│   ├── truth-source-inventory.json
│   ├── truth-source-bundle.sha256
│   └── generator-fingerprint.json    # NEW: Generator provenance
├── tsv/
│   ├── ref-closure.json
│   └── ref-map-table.md
├── xc/
│   ├── cross-consistency-verdict.json
│   ├── cross-consistency-verdict.md
│   └── xcv-points.yaml               # NEW: XCV point registry
└── yaml/
    ├── yaml-lint-report.md
    └── scope-domain-rule.yaml        # NEW: Machine-readable scope rules
```

---

**Document Status**: Governance Infrastructure  
**Version**: 1.0.1  
**Governed By**: MPGC
