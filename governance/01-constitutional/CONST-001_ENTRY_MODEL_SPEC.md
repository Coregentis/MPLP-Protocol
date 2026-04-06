# MPLP Entry Model Specification

**Document ID**: CONST-001  
**Status**: Constitutional  
**Authority**: MPGC  
**Constitutional Revision**: v1.2.0  
**Applicable Protocol Version**: 1.0.0  
**Supersedes**: CONST-001 v1.1.0

---

## 1. Scope

This document defines:

- the constitutional entry model of MPLP,
- the recognized public-facing surface model of MPLP,
- the scoped authority boundaries of each recognized surface,
- and the legal position of Validation Lab and Validation_Lab_V2 within that model.

This specification is constitutional. No other document may override, modify, or reinterpret its provisions.

MPLP uses a **3+1 constitutional entry model** and a **4-surface public-facing operating model**. These models are complementary and MUST NOT be conflated.

This specification is exhaustive with respect to constitutional entry classes and public-facing surfaces recognized by MPLP.

Constitutional revision labels in this document, including `v1.1.0` and `v1.2.0`, refer to revisions of this constitutional specification and MUST NOT be interpreted as `validation_lab_release_version`, `validation_ruleset_version`, `schema_bundle_version`, or `sdk_version`.

---

## 2. Constitutional Entry Model

MPLP SHALL use the following constitutional entry model:

- **Primary Entry Classes**
  - Repository
  - Documentation
  - Website

- **Auxiliary Entry Class**
  - Validation Lab

### 2.1 Repository (Primary)

**URI**: github.com/Coregentis/MPLP-Protocol  
**Role**: Source of Truth  
**Constitutional Class**: Primary

The Repository is the authoritative constitutional home of:

- protocol truth,
- schema truth,
- invariant truth,
- governance source records.

The Repository:

- Is the sole source of truth for protocol definitions
- Contains canonical schemas
- Contains canonical invariants
- Contains governance source records
- Remains authoritative over all other surfaces on protocol truth

### 2.2 Documentation (Primary)

**URI**: docs.mplp.io  
**Role**: Specification and Reference  
**Constitutional Class**: Primary

The Documentation:

- Contains protocol specifications and reference projections
- May explain and structure protocol semantics
- Must derive normative content from Repository-backed truth sources
- Must not contradict Repository truth
- Must not define adjudication logic as if it were Validation Lab authority

### 2.3 Website (Primary)

**URI**: mplp.io  
**Role**: Discovery and Positioning  
**Constitutional Class**: Primary

The Website:

- Provides discovery, positioning, and public framing
- Is informative in protocol terms
- Must not define protocol requirements
- Must not claim schema or invariant truth
- Must not claim adjudication authority

### 2.4 Validation Lab (Auxiliary)

**URI**: lab.mplp.io  
**Role**: Evidence Adjudication  
**Constitutional Class**: Auxiliary

Validation Lab is a constitutionally recognized auxiliary entry class.

The Validation Lab:

- Adjudicates evidence packs against versioned rulesets
- MUST remain non-normative with respect to protocol truth
- MUST remain non-certification and non-endorsement
- MUST NOT define protocol requirements
- MUST NOT define schema truth or invariant truth
- MUST NOT host execution
- Derives adjudication inputs from Repository truth sources and evidence-linked artifacts
- Is a governed projection of MPLP Protocol truth into evidence adjudication workflows

Validation Lab authority attaches to sealed adjudication artifacts, ruleset-governed evaluation outputs, and evidence-linked determinations, rather than to informal descriptive text alone.

---

## 3. Public-Facing Surface Model

MPLP exposes the following four public-facing surfaces:

- Repository
- Documentation
- Website
- Validation Lab

These four surfaces form the public-facing operating model of MPLP.

This four-surface model is a presentation, navigation, and cross-surface governance model. It MUST NOT be interpreted as redefining the constitutional entry classes.

Accordingly:

- MPLP has **four public-facing surfaces**
- MPLP has **three primary constitutional entry classes**
- Validation Lab is a **public-facing surface**
- Validation Lab is also an **auxiliary constitutional entry class**
- Validation Lab is not a protocol-defining primary surface

Any document that states only "three entry points" without accounting for Validation Lab, or states "four equal primary entry points", is constitutionally inaccurate.

---

## 4. Terminology Distinction

The following terms MUST be used distinctly:

- **entry model**: constitutional classification of entry classes
- **surface**: public-facing access surface
- **authority scope**: bounded subject domain in which a surface is authoritative
- **truth source**: canonical upstream truth origin
- **projection**: derived representation of upstream truth

The following usages are prohibited unless explicitly marked as historical:

- "three entry points" when omitting Validation Lab
- "four equal entry points"
- "Validation_Lab_V2 is a new MPLP surface"

---

## 5. Scoped Authority Model

MPLP SHALL use a scoped authority model.

No surface is universally authoritative for all topics. Each recognized surface is authoritative only within its defined authority scope.

### 5.1 Authority Scopes

#### Repository

Authority scope:

- protocol_truth
- schema_truth
- invariant_truth
- governance_source

#### Documentation

Authority scope:

- specification_projection
- normative_reference_projection
- explanatory_reference

#### Validation Lab

Authority scope:

- evidence_adjudication
- ruleset_projection
- run_evidence_projection
- determination_outputs

#### Website

Authority scope:

- discovery
- positioning
- public_framing

### 5.2 Scope Boundaries

A surface MUST NOT claim authority outside its defined scope.

In particular:

- Validation Lab MUST NOT define protocol truth
- Validation Lab MUST NOT define schema truth
- Validation Lab MUST NOT define invariant truth
- Website MUST NOT define protocol truth or adjudication truth
- Documentation MUST NOT supersede Repository on schema or invariant truth
- Repository MUST NOT be used to imply live adjudication outputs unless those outputs are explicitly sourced from sealed or hash-identifiable Validation Lab artifacts

---

## 6. Conflict Resolution Rules

Where two surfaces speak about the same subject matter, conflicts MUST be resolved according to both:

1. scope legitimacy, and
2. constitutional conflict order.

### 6.1 Scope Legitimacy First

If a surface makes a claim outside its defined authority scope, that claim is invalid regardless of its position in the constitutional model.

### 6.2 Cross-Surface Conflict Order Within Valid Overlapping Scope

Where two recognized surfaces make conflicting claims on the same subject matter, and both claims are within their defined authority scope, the following conflict order SHALL apply:

Repository > Documentation > Validation Lab > Website

### 6.3 Repository-Documentation Conflict

If Documentation contradicts Repository on protocol truth, schema truth, or invariant truth:

- Repository prevails
- Documentation must be corrected

### 6.4 Repository-Validation Lab Conflict

If Validation Lab contradicts Repository on protocol truth, schema truth, or invariant truth:

- Repository prevails
- Validation Lab must be corrected

### 6.5 Documentation-Validation Lab Conflict

If Validation Lab contradicts Documentation within valid overlapping scope on specification projection or explanatory reference:

- Documentation prevails
- Validation Lab must be corrected

### 6.6 Validation Lab-Website Conflict

If Website contradicts Validation Lab within valid overlapping scope on evidence adjudication framing or determination outputs:

- Validation Lab prevails
- Website must be corrected

### 6.7 Repository References to Validation Lab Outputs

If Repository references or summarizes Validation Lab adjudication outputs:

- the authoritative adjudication source remains Validation Lab
- Repository may reproduce such outputs only by explicit pointer, hash identity, or sealed artifact reference
- such reproduction does not transfer adjudication authority from Validation Lab to Repository

---

## 7. Validation_Lab_V2 Legal Position

Validation_Lab_V2 is NOT an independent constitutional entry class and is NOT a distinct public-facing MPLP surface.

Validation_Lab_V2 MAY exist only in one of the following legal roles:

- release_line
- migration_line
- engineering_track
- archive
- external_reference

Validation_Lab_V2 MUST NOT simultaneously operate as:

- an independent constitutional entry surface, or
- a second authoritative in-repository Validation Lab surface

If Validation_Lab and Validation_Lab_V2 contain materially overlapping Lab artifacts, one MUST be designated authoritative and the other MUST be reduced to one of the following:

- pointer-only
- generated projection
- archive snapshot
- external reference

If Validation_Lab and Validation_Lab_V2 materially overlap, the repository MUST contain an explicit authority designation record identifying:

- the authoritative Lab home
- the non-authoritative role of the other line
- the reduction mode applied to that non-authoritative line

No MPLP document may describe Validation_Lab_V2 as a new or parallel constitutional MPLP surface.

Validation_Lab_V2 is not an independent constitutional surface.

---

## 8. Prohibited Patterns

The following patterns are prohibited without exception.

### 8.1 Website Authority Violation

The Website must not:

- Define protocol requirements
- Use normative language to create protocol obligations
- Claim specification authority
- Claim schema or invariant truth
- Claim evidence adjudication authority

### 8.2 Documentation Independence Violation

Documentation must not:

- Create normative protocol content without Repository backing
- Contradict Repository schemas or invariants
- Present Validation Lab ruleset or adjudication outputs as if Documentation were their source of authority

### 8.3 Validation Lab Authority Violation

Validation Lab must not:

- Define protocol requirements
- Create protocol truth
- Create schema truth
- Create invariant truth
- Certify or endorse implementations
- Host execution of agent systems
- Claim that adjudication confers protocol compliance

### 8.4 Surface Model Misstatement

No MPLP-controlled document may:

- Omit Validation Lab from the recognized public-facing surface model
- Represent Validation Lab as a co-equal protocol-defining primary
- Represent Validation_Lab_V2 as a new constitutional surface

### 8.5 Compliance and Certification Claims

No official MPLP-controlled surface may:

- Claim that MPLP provides compliance
- Claim that MPLP provides certification
- Suggest that MPLP adoption confers regulatory status
- Use the terms "MPLP compliant" or "MPLP certified" as official truth claims

---

## 9. Historical Note

Earlier MPLP materials may refer to:

- a "three-entry model",
- a "four-entry model",
- or a "3+1 model"

These descriptions reflect different stages of governance evolution.

From the effective date of this revision forward, the canonical interpretation SHALL be:

- **3+1 constitutional entry model**
- **4 public-facing surfaces**
- **scoped authority model**

---

## 10. Amendment

This specification may only be amended through the MPGC constitutional governance process.

Amendments require:

- explicit MPGC approval
- version increment
- public ratification record

---

## 11. Amendment History

| Version | Date | Changes |
|:---|:---|:---|
| v1.0.0 | 2025-12-XX | Initial constitutional entry model (3 entries) |
| v1.1.0 | 2026-01-22 | Added Validation Lab as auxiliary entry point (3+1 model) |
| v1.2.0 | 2026-XX-XX | Clarified 3+1 constitutional entry model, 4 public-facing surfaces, scoped authority model, and non-surface legal position of Validation_Lab_V2 |

---

**End of Document**
