---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-SDKR-02_DERIVATION_RULES"
---

# METHOD-SDKR-02: Derivation Rules

**Document ID**: METHOD-SDKR-02  
**Status**: Draft  
**Authority**: MPGC  
**Effective**: v1.0.0

---

## 1. Purpose

This method defines what SDK content MUST be derived from Truth Sources and what is prohibited.

---

## 2. Derivation Requirements

### 2.1 Mandatory Schema Derivation

The following MUST be derived from Truth Source schemas:

| SDK Content | Source | Human Edit Allowed |
|:---|:---|:---:|
| Type definitions | JSON Schema properties | NO |
| Enum values | JSON Schema enum | NO |
| Required fields | JSON Schema required | NO |
| Validation rules | JSON Schema constraints | NO |
| Field descriptions | JSON Schema description | NO |

### 2.2 Permitted Code Generation

| SDK Content | Source | Human Edit Allowed |
|:---|:---|:---:|
| Builder APIs | Schema + approved mapping | Declaration Required |
| Runtime helpers | Schema-preserving logic | Declaration Required |
| Validation wrappers | Schema constraints | Declaration Required |

### 2.3 Prohibited Content

The following MUST NOT appear in SDKs:

| Content | Reason |
|:---|:---|
| New fields not in schema | Semantic pollution |
| Modified enum values | Truth Source drift |
| Relaxed constraints | Contract violation |
| Undeclared helpers | Traceability loss |

---

## 3. Traceability Requirement

Every SDK artifact MUST be traceable to a Truth Source schema or YAML.

Artifacts without provenance = **governance-illegal**.

---

## 4. Convenience Prohibition

The following phrases indicate governance violation:

- "for convenience"
- "developer friendly addition"
- "commonly needed"
- "practical extension"

If any such language appears in SDK code comments or documentation, the artifact is non-compliant.

---

## 5. Allowed Derived Surfaces

This section defines what an SDK MAY include as derived content.

### 5.1 An SDK MAY include

| Surface | Derivation Source |
|:---|:---|
| Type definitions | Directly from schema properties |
| Interface declarations | Directly from schema structure |
| Enum literals | Directly from schema enum |
| Validation logic | Equivalent to schema constraints |
| Error types | Derived from schema validation errors |

### 5.2 An SDK MUST NOT include

| Surface | Reason |
|:---|:---|
| New conceptual abstractions | Not in Truth Source |
| Aggregated domain objects | Semantic invention |
| Cross-module helpers | Not derivable |
| Convenience wrappers without declaration | Traceability loss |
| Domain-specific utilities | Protocol scope creep |

Any content not listed in 5.1 and not explicitly declared = **governance-illegal**.

---

## 6. Derivation Proof Artifact (MANDATORY)

Every SDK release MUST include a **Derivation Proof Artifact** that proves all content is traceable to Truth Sources.

### 6.1 Proof Structure

The derivation proof MUST be a machine-readable file with the following structure:

```yaml
derivation_proof:
  truth_source_bundle_hash: "sha256:78ea3511..."
  generation_tool: "mplp-codegen"
  generation_tool_version: "1.0.0"
  generation_timestamp: "2026-01-04T12:00:00Z"
  
  generated_files:
    - path: "dist/types/context.d.ts"
      source_schema: "mplp-context.schema.json"
      file_hash: "sha256:abc123..."
    - path: "dist/enums/cross_cutting.js"
      source_schema: "common/metadata.schema.json"
      file_hash: "sha256:def456..."
  
  forbidden_manual_files:
    - "dist/helpers/*"
    - "src/utils/*"
    
  manual_declared_files:
    - path: "src/builders.ts"
      declaration: "Schema-compatible builder pattern"
      review_status: "APPROVED"
```

### 6.2 Proof Location

| SDK | Location |
|:---|:---|
| TypeScript | `DERIVATION_PROOF.yaml` (package root) |
| Python | `DERIVATION_PROOF.yaml` (package root) |

### 6.3 Missing Proof = Release Blocked

If `DERIVATION_PROOF.yaml` is missing or incomplete:
- Release is **governance-illegal**
- Release MUST NOT proceed

### 6.4 Artifact Hash Requirements (METHOD-SDKR-08 §6.6)

For Python packages, the derivation proof MUST include SHA-256 hashes for distribution artifacts:

```yaml
python:
  dist:
    - type: sdist
      filename: "package-x.y.z.tar.gz"
      sha256: "..."
    - type: wheel
      filename: "package-x.y.z-py3-none-any.whl"
      sha256: "..."
```

Hashes MUST be computed at build time and recorded before publish.

### 6.4 Proof Verification

The derivation proof MUST be validated by:
1. Verifying `truth_source_bundle_hash` matches Evidence Baseline
2. Verifying each `generated_files[].file_hash` matches actual file
3. Verifying no undeclared files exist in package

---

**Document Status**: Governance Method  
**Supersedes**: None  
**References**: README.md, schemas/v2/
