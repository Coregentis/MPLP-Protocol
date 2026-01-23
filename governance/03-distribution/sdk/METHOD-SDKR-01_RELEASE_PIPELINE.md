---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-SDKR-01_RELEASE_PIPELINE"
---

# METHOD-SDKR-01: Release Pipeline

**Document ID**: METHOD-SDKR-01  
**Status**: Draft  
**Authority**: MPGC  
**Effective**: v1.0.0

---

## 1. Purpose

This method defines the mandatory pipeline stages for SDK release.

All stages MUST be executed in order. No stage may be skipped.

---

## 2. Pipeline Stages

### Stage 1: Precondition Check

**Input**: Evidence Baseline freeze record  
**Output**: Precondition verification report  
**Failure Condition**: Any Phase 0-7 prerequisite not met  
**Skip Allowed**: NO

### Stage 2: Derivation Build

**Input**: Truth Source schemas, verified code generators  
**Output**: Generated SDK artifacts  
**Failure Condition**: Generator fails or produces non-deterministic output  
**Skip Allowed**: NO

### Stage 3: Package Assembly

**Input**: Generated artifacts, package configuration  
**Output**: Assembled package (npm tarball / Python wheel)  
**Failure Condition**: Package validation fails  
**Skip Allowed**: NO

### Stage 4: Manifest Binding

**Input**: Package, Evidence Baseline metadata  
**Output**: Package with embedded Release Manifest  
**Failure Condition**: Manifest incomplete or hash mismatch  
**Skip Allowed**: NO

### Stage 4.5: Multi-Package Gate (METHOD-SDKR-08)

**Input**: All packages in workspace  
**Output**: Publish Set, Gate Report, Bundle Manifest  
**Failure Condition**: Any gate check fails (see METHOD-SDKR-08 §6)  
**Skip Allowed**: NO

This stage MUST execute:
- npm Publish Gate (`gate-publish-set.mjs`)
- PyPI Publish Gate (`gate_pypi_set`)
- Generate `RELEASE_BUNDLE_MANIFEST.json`

**Hash Evidence (§6.6)**: This stage MUST compute and record SHA-256 hashes for all Python artifacts (wheel + sdist) in DERIVATION_PROOF.yaml.

### Stage 5: Registry Publish

**Input**: Signed package with manifest  
**Output**: Published package on npm/PyPI  
**Failure Condition**: Registry rejection or network failure  
**Skip Allowed**: NO

### Stage 6: Post-Install Verification

**Input**: Published package registry URL  
**Output**: Verification report from clean environment  
**Failure Condition**: Import fails or enum mismatch  
**Skip Allowed**: NO

### Stage 7: Release Seal

**Input**: All stage reports  
**Output**: Release record in governance  
**Failure Condition**: Any previous stage not PASS  
**Skip Allowed**: NO

---

## 3. Required Artifacts per Pipeline Stage

Each stage MUST produce the following artifacts. Missing artifact = Stage FAIL.

| Stage | Required Artifacts | Missing = |
|:---|:---|:---:|
| Precondition Check | Phase verification report, Evidence Baseline reference | FAIL |
| Derivation Build | Generated types (.ts/.py), enum literals, validators | FAIL |
| Package Assembly | package.json/pyproject.toml, versioned README, LICENSE | FAIL |
| Manifest Binding | RELEASE_MANIFEST.json with all mandatory fields | FAIL |
| Registry Publish | Published package URL, registry confirmation | FAIL |
| Post-Install Verification | Clean environment install report, enum count verification | FAIL |
| Release Seal | Signed release record with all stage references | FAIL |

---

## 4. Gate Enforcement

If any stage fails:
- Pipeline MUST halt
- Incident record MUST be created
- Release MUST NOT proceed

---

**Document Status**: Governance Method  
**Supersedes**: None  
**References**: README.md, METHOD-SDKR-05
