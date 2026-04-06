# MPLP Document Format Specification

**Document ID**: CONST-002  
**Status**: Constitutional  
**Authority**: MPGC  
**Constitutional Revision**: v1.2.0  
**Applicable Protocol Version**: 1.0.0  
**Supersedes**: CONST-002 v1.1.0

---

## 1. Scope

This document defines the required format and validity rules for governed MPLP documentation.

This specification is constitutional. A document that does not conform to this specification is invalid regardless of its content.

This specification defines document metadata rules that express three distinct governance dimensions:

- **entry_surface**: the public-facing surface to which a document belongs
- **entry_model_class**: the constitutional class of that surface
- **authority_scope**: the bounded subject domain in which the document may speak authoritatively, if applicable

These dimensions are complementary and MUST NOT be conflated.

Constitutional revision labels in this document, including `v1.1.0` and `v1.2.0`, refer to revisions of this constitutional specification and MUST NOT be interpreted as `validation_lab_release_version`, `validation_ruleset_version`, `schema_bundle_version`, or `sdk_version`.

### 1.1 Applicability

This specification applies to:

- `docs/`
- `governance/` excluding constitutional source files `governance/01-constitutional/CONST-*.md`
- `Validation_Lab/` excluding archival exceptions
- Website markdown/MDX content only when it explicitly declares MPLP frontmatter

This specification does NOT apply to:

- constitutional documents themselves
- sealed archival records, immutable historical attestations, and archived release snapshots
- repository code, schemas, tests, and non-document artifacts
- website native metadata that does not declare MPLP frontmatter

### 1.2 Website Coverage Clarification

Website markdown/MDX content is covered by this specification only when it explicitly declares the MPLP frontmatter block. In the absence of such block, the website uses native metadata rules outside the scope of this specification.

### 1.3 Constitutional Compatibility Clarification

Nothing in this specification expands frozen eligibility beyond the conditions defined in CONST-003.

---

## 2. Frontmatter Schema

All applicable documents governed by this specification MUST include a YAML frontmatter block.

### 2.1 Required Fields

| Field | Type | Allowed Values |
|-------|------|----------------|
| `entry_surface` | enum | `repository`, `documentation`, `website`, `validation_lab`, `none` |
| `entry_model_class` | enum | `primary`, `auxiliary`, `none` |
| `doc_type` | enum | `normative`, `informative`, `reference`, `governance`, `guide`, `attestation` |
| `status` | enum | `draft`, `frozen` |
| `authority` | enum | `protocol`, `none` |
| `protocol_version` | string | semantic version string |
| `doc_id` | string | unique document identifier |

### 2.2 Conditional Fields

| Field | Type | When Required |
|-------|------|---------------|
| `authority_scope` | array of enum | authority-bearing applicable documents |
| `authority_basis` | array of enum | Validation Lab authority-bearing documents; other authority-bearing documents where basis matters |
| `surface_role` | enum | non-canonical lines, alternate lines, V2-related documents, or documents describing non-canonical surface roles |

### 2.3 Optional Fields

| Field | Type | Purpose |
|-------|------|---------|
| `title` | string | UI display only |
| `sidebar_label` | string | UI display only |
| `description` | string | UI display only |

Optional UI fields are non-normative and excluded from protocol semantics.

### 2.4 Protocol Authority Clarification

The `authority` field tracks **protocol authority only**.

Accordingly:

- `authority: protocol` means protocol-defining authority
- `authority: none` means absence of protocol-defining authority

Non-protocol scoped authority, including Validation Lab adjudication authority and repository governance authority, is expressed through `authority_scope` and `authority_basis`, not by widening the meaning of `authority`.

### 2.5 Legacy doc_type Values

Legacy doc_type values MAY be tolerated only for migration and MUST NOT be used in new documents.

Any retained legacy value MUST be explicitly mapped to a valid current value before freezing a future revision of this specification.

---

## 3. Field Definitions

### 3.1 `entry_surface`

Type: enum

Allowed values:

- `repository`
- `documentation`
- `website`
- `validation_lab`
- `none`

Definition:

- `repository`: document belongs to the Repository surface
- `documentation`: document belongs to the Documentation surface
- `website`: document belongs to the Website surface
- `validation_lab`: document belongs to the Validation Lab surface
- `none`: document does not belong to a recognized public-facing MPLP surface

`entry_surface` identifies public-facing surface membership only. It does NOT by itself determine constitutional class or authority scope.

### 3.2 `entry_model_class`

Type: enum

Allowed values:

- `primary`
- `auxiliary`
- `none`

Definition:

- `primary`: document belongs to a primary constitutional entry class
- `auxiliary`: document belongs to an auxiliary constitutional entry class
- `none`: document has no constitutional entry-class role

`entry_model_class` is determined by the constitutional mapping of `entry_surface` under the current entry model, and MUST NOT be used as an independently negotiated classification.

The following mappings are required:

- `entry_surface: repository` -> `entry_model_class: primary`
- `entry_surface: documentation` -> `entry_model_class: primary`
- `entry_surface: website` -> `entry_model_class: primary`
- `entry_surface: validation_lab` -> `entry_model_class: auxiliary`
- `entry_surface: none` -> `entry_model_class: none`

The following combinations are invalid:

- `entry_surface: validation_lab` + `entry_model_class: primary`
- `entry_surface: repository` + `entry_model_class: auxiliary`
- `entry_surface: documentation` + `entry_model_class: auxiliary`
- `entry_surface: website` + `entry_model_class: auxiliary`

### 3.3 `surface_role`

Type: enum

Allowed values:

- `canonical`
- `projection`
- `pointer_only`
- `generated`
- `archive`
- `release_line`
- `migration_line`
- `engineering_track`
- `external_reference`
- `none`

Definition:

`surface_role` describes whether the document belongs to the canonical line of a recognized surface or to a non-canonical derivative or alternate line.

For any recognized public-facing surface within the same repository governance scope, there MUST be at most one canonical line at a time.

A document MUST NOT declare `surface_role: canonical` for a materially overlapping line unless an explicit authority designation record exists.

Documents that do not participate in canonical or alternate line classification MAY use `surface_role: none` or omit the field if not required.

### 3.4 `authority_scope`

Type: array of enum

Allowed values, in canonical order:

1. `protocol_truth`
2. `schema_truth`
3. `invariant_truth`
4. `governance_source`
5. `specification_projection`
6. `normative_reference_projection`
7. `explanatory_reference`
8. `evidence_adjudication`
9. `ruleset_projection`
10. `run_evidence_projection`
11. `determination_outputs`
12. `discovery`
13. `positioning`
14. `public_framing`

Definition:

`authority_scope` declares the bounded subject domain in which an applicable document may speak authoritatively.

The values of `authority_scope` MUST NOT contain duplicates and SHOULD be serialized in the order defined by this specification.

### 3.5 `authority_basis`

Type: array of enum

Allowed values, in canonical order:

1. `schema_backed`
2. `invariant_backed`
3. `governance_record`
4. `sealed_artifact`
5. `ruleset_governed_output`
6. `evidence_linked_determination`
7. `projection_only`
8. `narrative_only`

Definition:

`authority_basis` explains what kind of object anchors an authority-bearing claim, if any.

The values of `authority_basis` MUST NOT contain duplicates and SHOULD be serialized in the order defined by this specification.

`narrative_only` MUST NOT be the sole authority_basis for any authority-bearing document.

---

## 4. Legal Combinations

### 4.1 Validity Matrix

| entry_surface | entry_model_class | doc_type | authority | status | Valid |
|---------------|-------------------|----------|-----------|--------|-------|
| documentation | primary | normative | protocol | draft | ✅ |
| documentation | primary | normative | protocol | frozen | ✅ |
| documentation | primary | informative | none | draft | ✅ |
| documentation | primary | reference | none | draft | ✅ |
| documentation | primary | guide | none | draft | ✅ |
| documentation | primary | attestation | none | draft | ✅ |
| repository | primary | governance | none | draft | ✅ |
| repository | primary | informative | none | draft | ✅ |
| repository | primary | reference | none | draft | ✅ |
| repository | primary | guide | none | draft | ✅ |
| repository | primary | attestation | none | draft | ✅ |
| validation_lab | auxiliary | informative | none | draft | ✅ |
| validation_lab | auxiliary | reference | none | draft | ✅ |
| validation_lab | auxiliary | governance | none | draft | ✅ |
| website | primary | informative | none | draft | ✅ |
| website | primary | reference | none | draft | ✅ |
| website | primary | guide | none | draft | ✅ |
| none | none | informative | none | draft | ✅ |
| none | none | reference | none | draft | ✅ |
| none | none | guide | none | draft | ✅ |
| none | none | governance | none | draft | ✅ |
| none | none | attestation | none | draft | ✅ |

### 4.2 Invalid Combinations

The following combinations are unconditionally invalid:

- `entry_surface: website` + `doc_type: normative`
- `entry_surface: website` + `authority: protocol`
- `entry_surface: validation_lab` + `doc_type: normative`
- any `doc_type` other than `normative` + `status: frozen`
- any document with `authority: protocol` outside `entry_surface: documentation` + `doc_type: normative`
- `entry_surface: validation_lab` + `entry_model_class: primary`
- `entry_surface: none` + `entry_model_class` other than `none`

### 4.3 Additional Authority Constraints

The following authority constraints apply to applicable documents:

- `entry_surface: repository` MUST NOT use:
  - `discovery`
  - `positioning`
  - `public_framing`
  except where a repository governance artifact explicitly governs website behavior

- `entry_surface: website` MUST NOT use:
  - `protocol_truth`
  - `schema_truth`
  - `invariant_truth`
  - `evidence_adjudication`
  - `determination_outputs`

- `entry_surface: documentation` MUST NOT use:
  - `protocol_truth`
  - `schema_truth`
  - `invariant_truth`
  unless explicitly acting as quotation/projection of repository truth and clearly marked as projection only

- `entry_surface: validation_lab` MUST NOT use:
  - `protocol_truth`
  - `schema_truth`
  - `invariant_truth`

- `entry_surface: validation_lab` MAY use:
  - `evidence_adjudication`
  - `ruleset_projection`
  - `run_evidence_projection`
  - `determination_outputs`

### 4.4 Entry-Surface `none` Restriction

Documents with `entry_surface: none` MUST NOT be presented as public entry-routing documents for any recognized MPLP surface.

---

## 5. Document Type Definitions

### 5.1 Normative Documents

Normative documents:

- May use MUST, SHALL, REQUIRED
- Define protocol requirements
- Require `authority: protocol`
- Must belong to `entry_surface: documentation`
- May have `status: draft` or `status: frozen`

### 5.2 Informative Documents

Informative documents:

- Must not create protocol obligations
- May explain, describe, summarize, or contextualize
- Require `authority: none`
- MUST use `status: draft`

### 5.3 Reference Documents

Reference documents:

- Provide indexes, registries, glossaries, quick lookups, route maps, and reference projections
- Must not create protocol obligations
- Require `authority: none`
- MUST use `status: draft`

### 5.4 Guide Documents

Guide documents:

- Provide how-to instructions, examples, or procedural walkthroughs
- Must not create protocol obligations unless explicitly repository-governed process docs outside protocol authority
- Require `authority: none`
- MUST use `status: draft`

### 5.5 Attestation Documents

Attestation documents:

- Record evidence of review, approval, learning, or release support
- Must not create new protocol semantics
- Require `authority: none`
- MUST use `status: draft`

### 5.6 Governance Documents

Governance documents:

- Define governance processes, constitutional rules, methods, SOPs, or internal rule structures
- Must not create protocol semantics unless they are constitutional documents outside the applicability of this specification
- Require `authority: none`
- MUST use `status: draft`

### 5.7 Non-Normative Guard

All informative, reference, guide, and attestation documents SHOULD include an explicit non-normative guard appropriate to their surface and purpose.

Where an existing higher-order template, registry, or governance method already imposes equivalent non-normative signaling, that mechanism is sufficient.

---

## 6. Frozen Eligibility

Only documents meeting all of the following conditions may be frozen:

- `doc_type: normative`
- `authority: protocol`
- `entry_surface: documentation`
- `entry_model_class: primary`

Documents that do not meet these conditions MUST NOT have `status: frozen`.

Frozen eligibility is a necessary but not sufficient condition. Actual freezing requires MPGC process per CONST-003.

---

## 7. Authority Metadata Requirements

### 7.1 When `authority_scope` Is Required

`authority_scope` is REQUIRED for applicable documents governed by this specification that:

- define cross-surface authority behavior
- define truth-chain or projection-chain governance
- define public entry-routing or public authority-reference behavior
- define Validation Lab authority-bearing governance or adjudication-facing behavior
- explicitly claim authority, source-of-truth status, precedence relevance, or bounded domain authority

### 7.2 When `authority_basis` Is Required

`authority_basis` is REQUIRED for:

- Validation Lab authority-bearing documents
- any other applicable document whose authority claim depends on a verifiable basis object rather than simple descriptive context

### 7.3 Validation Lab Hard Rule

Any Validation Lab document using `authority_scope` that includes `evidence_adjudication`, `ruleset_projection`, or `determination_outputs` MUST include at least one non-narrative authority_basis.

### 7.4 Narrative-Only Prohibition

`narrative_only` MUST NOT be the sole authority_basis for any authority-bearing document.

---

## 8. Validation Lab Frontmatter Requirements

All applicable markdown files in the Validation Lab surface MUST include:

```yaml
entry_surface: validation_lab
entry_model_class: auxiliary
authority: none
status: draft
```

### 8.1 Validation Lab Minimum Metadata

Applicable Validation Lab documents MUST include at minimum:

```yaml
entry_surface: validation_lab
entry_model_class: auxiliary
doc_type: informative | reference | governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-..."
```

### 8.2 Validation Lab Authority-Bearing Documents

Any Validation Lab document that defines, records, or governs:

- adjudication outputs
- ruleset-governed determinations
- release seals
- evidence-linked results
- cross-surface authority statements

MUST additionally include:

```yaml
authority_scope:
authority_basis:
```

Validation Lab authority-bearing documents MUST anchor authority in sealed artifacts, ruleset-governed outputs, evidence-linked determinations, or governance records, rather than in descriptive narrative alone.

---

## 9. Validation_Lab_V2 Prohibition Rules

Documents concerning `Validation_Lab_V2` MUST comply with all of the following:

1. They MUST NOT define or imply a new `entry_surface`.
2. They MUST NOT represent `Validation_Lab_V2` as an independent constitutional MPLP surface.
3. They MUST identify their non-canonical role via `surface_role`.
4. If they remain within the Validation Lab public-facing domain, they MUST use:
   - `entry_surface: validation_lab`
   - `entry_model_class: auxiliary`
5. If they are purely engineering, migration, archive, or external-reference records, they MAY use:
   - `entry_surface: none`
   - `entry_model_class: none`
   provided they do not present themselves as public entry-routing or public surface authority.

### 9.1 Permitted `surface_role` Values for Validation_Lab_V2 Materials

Validation_Lab_V2 materials MUST use one of:

- `release_line`
- `migration_line`
- `engineering_track`
- `archive`
- `external_reference`
- `projection`
- `pointer_only`
- `generated`

They MUST NOT use `surface_role: canonical` unless an explicit authority designation record exists and no materially overlapping canonical line remains within the same repository governance scope.

---

## 10. Validation

A document governed by this specification is valid if and only if all applicable conditions are satisfied:

1. frontmatter contains all required fields
2. frontmatter values form a legal combination per Section 4
3. document type rules per Section 5 are satisfied
4. frozen eligibility per Section 6 is satisfied, if `status: frozen` is claimed
5. authority metadata rules per Section 7 are satisfied, if applicable
6. Validation Lab rules per Section 8 are satisfied, if applicable
7. Validation_Lab_V2 prohibition rules per Section 9 are satisfied, if applicable
8. array-valued governance metadata is de-duplicated and canonically serialized

A document that fails any applicable condition is invalid.

---

## 11. Amendment

This specification may only be amended through the MPGC constitutional governance process.

---

## 12. Amendment History

| Version | Date | Changes |
|:---|:---|:---|
| v1.0.0 | 2025-12-XX | Initial constitutional document format |
| v1.1.0 | 2026-01-22 | Added validation_lab entry_surface and expanded document classes |
| v1.2.0 | 2026-XX-XX | Added entry_model_class, authority_scope, surface_role, authority_basis, canonical-line uniqueness, and explicit non-surface rules for Validation_Lab_V2 |

---

**End of Document**
