---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-DIV-01_DERIVATION_INTEGRITY_VERIFICATION"
---


# METHOD-DIV-01: Derivation Integrity Verification

**Document ID**: METHOD-DIV-01  
**Version**: 1.0.1  
**Status**: Active  
**Created**: 2026-01-04  
**Revised**: 2026-01-04 (v1.0.1 — hardened gates, hash algorithm, generator contract)

---

## 1. Purpose

Provides a reusable, evidence-based methodology to verify that **derived artifacts** are produced through a **deterministic, auditable, and repeatable process** — ensuring that schema truth sources can be reliably projected into SDK types, documentation, and tooling without integrity loss.

---

## 2. Constitutional Principle

> **Derivation Direction is Irreversible.**
>
> Derived artifacts are projections of Truth Sources. If a derivation fails validation, the **fix target is always the derived artifact, never the Truth Source**.
>
> Truth Sources (Layer 0: JSON Schema, Layer 1: YAML Configuration) are the only authoritative inputs. Derived artifacts cannot create, modify, or redefine protocol semantics.

### 2.1 Failure Attribution Rule

When a derived artifact fails validation, the fix target depends on truth source status:

| Truth Source Status | Fix Target | Action |
|:---|:---|:---|
| TSV/XCV PASS | Derived artifact | Regenerate or fix generator |
| TSV/XCV FAIL | Truth source | Halt derivation, fix truth source first |

**Rationale**: This prevents CI debates about "which to fix" by making attribution deterministic.

## 3. Relationship to Other Verification Methods

| Method | Scope | Question Answered |
|:---|:---|:---|
| **TSV-01** | Truth Source | "Is the reference chain valid?" |
| **SCV-01** | Schema Projection | "Are all fields/structures covered?" |
| **SUC-01** | Runtime Contract | "Is the usage pattern correct?" |
| **DIV-01** | Derivation Process | "Is the derivation trustworthy and reproducible?" |
| **XCV-01** | Cross-Consistency | "Are YAML and Schema cross-aligned?" |

**Key Insight**: TSV/SCV/SUC can all PASS today, but if the derivation process is not controlled, tomorrow's regeneration may silently break conformance.

---

## 4. Four Pillars of Derivation Integrity

### Pillar 1: Derivation Boundary

Defines which directories/files are:
- **Truth Sources** (read-only, never generated)
- **Derived Artifacts** (generated-only, never hand-edited)
- **Hybrid** (generated + hand-modified, with explicit merge rules)

### Pillar 2: Derivation Manifest

For each derivation:
- Input: Schema bundle hash, generator version, config
- Output: Artifact hash, file list
- Timestamp: When derivation occurred

### Pillar 3: Determinism Proof (Recommended)

Same input + same config → byte-identical (or structurally-identical) output

### Pillar 4: Generator Contract (Required)

Each generator must declare:
- **Write roots**: Which output directories it may write to
- **Read scope**: Which inputs it consumes (must not read hybrid hand-written areas)
- **Version**: Recorded in manifest, change triggers re-verification

---

## 5. Derivation Boundary Specification

### 5.1 Truth Source Directories (NEVER GENERATED)

| Path | Contents | Authority |
|:---|:---|:---|
| `schemas/v2/modules/` | 10 module JSON Schemas | MPGC |
| `schemas/v2/common/` | 6 common JSON Schemas | MPGC |
| `schemas/v2/events/` | 6 event JSON Schemas | MPGC |
| `schemas/v2/integration/` | 4 integration JSON Schemas | MPGC |
| `schemas/v2/learning/` | 3 learning JSON Schemas | MPGC |
| `schemas/v2/invariants/` | 5 YAML invariant files | MPGC |
| `schemas/v2/taxonomy/` | 4 YAML taxonomy files | MPGC |
| `schemas/v2/profiles/` | 2 YAML profile files | MPGC |

**Invariant Rules**:
- ✅ May be edited only via MPGC governance process
- ❌ May NOT contain `@generated` marker (presence = generator violation)
- ❌ May NOT be written by any codegen script

### 5.2 Derived Artifact Directories (GENERATED ONLY)

| Path | Contents | Source | Generator |
|:---|:---|:---|:---|
| `packages/sdk-ts/src/generated/` | TypeScript interfaces | schemas/v2/ | json-schema-to-typescript |
| `packages/sdk-py/src/mplp/generated/` | Pydantic models | schemas/v2/ | datamodel-codegen |
| `docs/generated/` | Schema documentation | schemas/v2/ | docgen script |

**Invariant Rules**:
- ✅ May ONLY be created/updated by designated generators
- ✅ MUST contain `@generated` marker in every file (see §5.4)
- ❌ May NOT be hand-edited (absence of marker = violation)

### 5.3 Hybrid Directories (EXPLICIT MERGE RULES)

| Path | Contents | Rule |
|:---|:---|:---|
| `packages/sdk-ts/src/core/` | Hand-written SDK code | MUST import from `generated/`, MUST NOT copy |
| `packages/sdk-py/src/mplp/core/` | Hand-written SDK code | MUST import from `generated/`, MUST NOT copy |
| `docs/docs/specification/` | Hand-written docs | MUST link/embed schemas, MUST NOT redefine |

**Hybrid Anti-Copy Rules** (§5.5):
- ❌ May NOT contain schema mirror files (e.g., `mplp-trace.schema.json`)
- ❌ May NOT define types with schema-identical names (e.g., `interface Trace {}`)
- ✅ MUST use imports: `type Trace = Generated.Trace` or `from .generated import Trace`

### 5.4 Generated Marker Specification

**Purpose**: Enable boundary gate to distinguish generated vs hand-written files.

**Marker Format** (language-specific):

**TypeScript/JavaScript**:
```typescript
/**
 * @generated
 * Generator: mplp-codegen v1.0.0
 * Source: schemas/v2/modules/mplp-trace.schema.json
 * Bundle Hash: sha256:abc123...
 * Generated At: 2026-01-04T00:00:00Z
 * DO NOT EDIT — Regenerate from source schema.
 */
```

**Python**:
```python
# @generated
# Generator: mplp-codegen v1.0.0
# Source: schemas/v2/modules/mplp-trace.schema.json
# Bundle Hash: sha256:abc123...
# Generated At: 2026-01-04T00:00:00Z
# DO NOT EDIT — Regenerate from source schema.
```

**Markdown**:
```markdown
<!-- @generated -->
<!-- Generator: mplp-docgen v1.0.0 -->
<!-- Source: schemas/v2/ -->
<!-- DO NOT EDIT -->
```

**Required Fields in Marker**:
- `@generated` keyword (mandatory, for detection)
- Generator name + version (mandatory)
- Source schema path (recommended)
- Bundle hash (optional but recommended)

### 5.5 Hybrid Anti-Copy Detection Rules

To prevent schema structure from being duplicated in hybrid directories:

**Rule 1: No Schema Mirror Files**
```
FAIL if: hybrid_dir contains file matching /mplp-*.schema.json/
```

**Rule 2: No Schema-Named Type Definitions**
```
FAIL if: hand-written TS/PY file defines:
  - interface Trace { ... }  (when Trace exists in generated/)
  - class Plan(BaseModel): ... (when Plan exists in generated/)
PASS if: type Trace = Generated.Trace (re-export only)
```

**Rule 3: Import Validation**
```
WARN if: hand-written file imports from schema path directly
PASS if: hand-written file imports from ./generated/ or .generated
```

---

## 6. Truth Source Bundle Hash Algorithm

### 6.1 Scope

Bundle hash covers ONLY Truth Source directories (§5.1):

```
schemas/v2/modules/
schemas/v2/common/
schemas/v2/events/
schemas/v2/integration/
schemas/v2/learning/
schemas/v2/invariants/
schemas/v2/taxonomy/
schemas/v2/profiles/
```

**Explicitly Excluded**:
- `schemas/v2/_manifests/` (verification output)
- `schemas/v2/examples/` (non-normative)
- `tests/` (verification, not truth)
- `docs/` (derived/hybrid)

### 6.2 Algorithm

```
1. List all files in scope directories (recursive)
2. Filter: include only *.json and *.yaml files
3. Sort: lexicographic by relative path (UTF-8)
4. For each file:
   a. Compute: file_hash = sha256(file_bytes)
   b. Entry: "<relative_path>\0<file_hash>"
5. Concatenate all entries with newline separator
6. Bundle hash: sha256(concatenated_entries)
```

**Example**:
```
schemas/v2/common/events.schema.json\0abc123...
schemas/v2/common/identifiers.schema.json\0def456...
schemas/v2/modules/mplp-context.schema.json\0ghi789...
...
```

**Output Format**:
```
sha256:a1b2c3d4e5f6...
```

### 6.3 Stability Guarantee

- Same file contents → same bundle hash (deterministic)
- File ordering is stable (lexicographic sort)
- Whitespace-only changes DO affect hash (intentional — schema formatting is normative)

---

## 7. Generator Contract Specification

### 7.1 Contract Declaration Format

Each generator must provide a contract file:

**File**: `codegen/<generator-name>.contract.json`

```json
{
  "generator": "mplp-codegen",
  "version": "1.0.0",
  "description": "Generates TypeScript types from JSON Schema",
  
  "input": {
    "read_roots": [
      "schemas/v2/modules/",
      "schemas/v2/common/"
    ],
    "forbidden_reads": [
      "packages/",
      "docs/docs/"
    ]
  },
  
  "output": {
    "write_roots": [
      "packages/sdk-ts/src/generated/"
    ],
    "forbidden_writes": [
      "schemas/v2/",
      "packages/sdk-ts/src/core/"
    ]
  },
  
  "marker": {
    "required": true,
    "format": "typescript-block-comment"
  }
}
```

### 7.2 Contract Validation Rules

| Rule | Verdict |
|:---|:---:|
| Generator writes outside declared `write_roots` | 🔴 FAIL |
| Generator writes to `forbidden_writes` | 🔴 FAIL |
| Generator reads from `forbidden_reads` | 🔴 FAIL |
| Generator output missing `@generated` marker | 🔴 FAIL |
| Generator version mismatch with manifest | 🟡 WARN (require re-verify) |

---

## 8. Derivation Manifest Format

**File**: `artifacts/derivation-manifest.json`

```json
{
  "manifest_version": "1.0.1",
  "generated_at": "2026-01-04T00:00:00Z",
  
  "generator": {
    "name": "mplp-codegen",
    "version": "1.0.0",
    "contract_file": "codegen/mplp-codegen.contract.json"
  },
  
  "input": {
    "schema_bundle": {
      "path": "schemas/v2/",
      "git_sha": "abc123def456",
      "bundle_hash": "sha256:a1b2c3d4e5f6..."
    },
    "config": {
      "path": "codegen.config.json",
      "content_hash": "sha256:bbbb..."
    }
  },
  
  "outputs": [
    {
      "path": "packages/sdk-ts/src/generated/types/trace.ts",
      "content_hash": "sha256:cccc...",
      "source_schema": "schemas/v2/modules/mplp-trace.schema.json",
      "has_marker": true
    }
  ],
  
  "verification": {
    "scv_status": "PASS",
    "scv_report": "reports/scv/sdk-ts.diff.md"
  }
}
```

---

## 9. Derivation Integrity Gates

### Gate 0: Generator Contract Check

**Command**: `mplp-verify generator-contract`

**Checks**:
1. Generator contract file exists
2. Generator version in manifest matches contract version
3. All output files are within declared `write_roots`
4. No files written to `forbidden_writes`

**Verdict**:
- Contract missing → 🔴 FAIL
- Version mismatch → 🟡 WARN (re-verification required)
- Scope violation → 🔴 FAIL

---

### Gate 1: Boundary Violation Check

**Command**: `mplp-verify boundary`

**Checks**:

| Check | Target | Verdict |
|:---|:---|:---:|
| Truth Source contains `@generated` marker | schemas/v2/** | 🔴 FAIL |
| Derived file missing `@generated` marker | generated/** | 🔴 FAIL |
| Hybrid dir contains schema mirror | core/** | 🔴 FAIL |
| Hybrid dir defines schema-named type | core/** | 🔴 FAIL |

**Verdict Summary**:
- Any violation → 🔴 FAIL (block merge)

---

### Gate 2: Manifest Freshness Check

**Command**: `mplp-verify manifest-fresh`

**Checks**:
1. `derivation-manifest.json` exists
2. Input `bundle_hash` matches current computed hash
3. All output files exist
4. All output file hashes match manifest records

**Verdict** (Two-Level):

| Context | Stale Manifest | Hash Mismatch |
|:---|:---:|:---:|
| **PR Merge** | 🟡 WARN (can merge with label) | 🔴 FAIL |
| **Release** | 🔴 FAIL (must regenerate) | 🔴 FAIL |

---

### Gate 3: Determinism Check (Optional)

**Command**: `mplp-verify determinism`

**Actions**:
1. Delete all derived artifacts
2. Regenerate from truth sources (same config)
3. Compare output hashes to manifest

**Verdict**:
- All hashes match → ✅ PASS
- Any hash mismatch → 🟡 WARN (generator may be non-deterministic)

---

## 10. Evidence Artifacts

A complete DIV verification produces:

| Artifact | Required |
|:---|:---:|
| Generator Contract Files | ✅ |
| Derivation Manifest | ✅ |
| Bundle Hash Computation Log | ✅ |
| Boundary Violation Report | ✅ |
| Manifest Freshness Report | ✅ |
| Determinism Report | Optional |

---

## 11. Integration with Other Methods

**Execution Order**:

```
1. DIV-01 Gate 0: Generator Contract
   └── Contract exists? Version matches?
   
2. DIV-01 Gate 1: Boundary Violation
   └── Markers correct? No hybrid pollution?
   
3. DIV-01 Gate 2: Manifest Freshness
   └── Bundle hash current? Output hashes match?
   
4. SCV-01: Surface Completeness
   └── SNF diff PASS? Fixtures PASS?
   
5. SUC-01: Usage Conformance
   └── Binding complete? Injection proofs exist?
   
6. XCV-01: Cross-Consistency
   └── YAML↔Schema aligned?
```

**Principle**: If DIV-01 fails, SCV/SUC/XCV results are unreliable (garbage in, garbage out).

---

## 12. Minimal Engineering Implementation

### 12.1 CLI Commands

```bash
# Full verification
mplp-verify div --all

# Individual gates
mplp-verify generator-contract
mplp-verify boundary
mplp-verify manifest-fresh
mplp-verify determinism  # optional

# Compute bundle hash only
mplp-verify bundle-hash --output artifacts/current-bundle.hash
```

### 12.2 CI Integration

**PR Stage** (blocking):
```yaml
- name: DIV Gate 0+1
  run: mplp-verify generator-contract && mplp-verify boundary
  
- name: DIV Gate 2 (warn only on stale)
  run: mplp-verify manifest-fresh --pr-mode
```

**Release Stage** (blocking):
```yaml
- name: DIV Full Verification
  run: mplp-verify div --all --release-mode
  # Fails on any stale manifest or hash mismatch
```

---

## 13. Governance

This methodology is governed by:

- **MPLP Protocol Governance Committee (MPGC)**
- **Constitutional Documents**: `governance/constitutional/`

Any modification to DIV-01 requires documented justification.

---

**Document Status**: Governance Methodology  
**Version**: 1.0.1  
**Supersedes**: v1.0.0 (hardened gates, added generator contract, hash algorithm)  
**References**: METHOD-TSV-01, METHOD-SCV-01, METHOD-SUC-01, METHOD-XCV-01
