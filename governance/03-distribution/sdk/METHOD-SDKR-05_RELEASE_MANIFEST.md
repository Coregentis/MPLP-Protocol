---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "METHOD-SDKR-05_RELEASE_MANIFEST"
---

# METHOD-SDKR-05: Release Manifest

**Document ID**: METHOD-SDKR-05  
**Status**: Draft  
**Authority**: MPGC  
**Effective**: v1.0.0

---

## 1. Purpose

This method defines the mandatory Release Manifest that MUST be included in every SDK package.

---

## 2. Manifest Requirement

- SDK release WITHOUT manifest = **INVALID**
- Manifest MUST be part of the released package
- Manifest MUST NOT be generated post-release

---

## 3. Manifest Location

| SDK | Path |
|:---|:---|
| TypeScript | `RELEASE_MANIFEST.json` (package root) |
| Python | `RELEASE_MANIFEST.json` (package root) |

### 3.1 Bundle-Level Manifest (METHOD-SDKR-08)

In multi-package mode, a **Release Bundle Manifest** is also required:

| Artifact | Location |
|:---|:---|
| `RELEASE_BUNDLE_MANIFEST.json` | `artifacts/release/` |

The Bundle Manifest records all packages in a coordinated release and references each package's individual proof. See METHOD-SDKR-08 §4 (V-SYNC-03) for details.

---

## 4. Mandatory Fields

| Field | Type | Description |
|:---|:---|:---|
| `protocol_version` | string | MPLP protocol version |
| `evidence_baseline_tag` | string | Git tag of frozen baseline |
| `truth_source_bundle_hash` | string | SHA256 of Truth Source bundle |
| `sdk_package_name` | string | Package name (e.g., `mplp-sdk-ts`) |
| `sdk_package_version` | string | Semantic version |
| `generated_at` | string | ISO 8601 timestamp |
| `generator_version` | string | Codegen tool version |

---

## 5. Example Manifest

```json
{
  "protocol_version": "1.0.0",
  "evidence_baseline_tag": "evidence-baseline-v1.0",
  "truth_source_bundle_hash": "sha256:78ea3511...",
  "sdk_package_name": "mplp-sdk-ts",
  "sdk_package_version": "1.0.0",
  "generated_at": "2026-01-04T12:00:00Z",
  "generator_version": "1.0.0"
}
```

---

## 6. Manifest Validation

Before release, the following MUST be verified:

| Check | Failure Action |
|:---|:---|
| Manifest exists | HALT |
| All fields present | HALT |
| Bundle hash matches current Evidence Baseline | HALT |
| Protocol version matches | HALT |

---

## 7. Non-Semantic Declaration

The manifest is **evidence**, not protocol definition.

It does not participate in protocol semantics.

---

## 8. Derivation Verification Field (Recommended)

To prove derivation integrity, the manifest SHOULD include:

| Field | Type | Description |
|:---|:---|:---|
| `derived_surfaces_checksum` | string | SHA256 of concatenated generated file hashes |
| `derived_schema_refs` | array | List of schema files used for derivation |

### 8.1 Example with Derivation Fields

```json
{
  "protocol_version": "1.0.0",
  "evidence_baseline_tag": "evidence-baseline-v1.0",
  "truth_source_bundle_hash": "sha256:78ea3511...",
  "sdk_package_name": "mplp-sdk-ts",
  "sdk_package_version": "1.0.0",
  "generated_at": "2026-01-04T12:00:00Z",
  "generator_version": "1.0.0",
  "derived_surfaces_checksum": "sha256:abc123...",
  "derived_schema_refs": [
    "common/metadata.schema.json",
    "mplp-context.schema.json",
    "mplp-plan.schema.json"
  ]
}
```

This enables post-publish verification that the SDK was derived from stated schemas.

---

**Document Status**: Governance Method  
**Supersedes**: None  
**References**: README.md, METHOD-SDKR-01
