# MPLP Entry Model Specification

**Document ID**: CONST-001  
**Status**: Constitutional  
**Authority**: MPGC  
**Effective**: v1.1.0  
**Supersedes**: CONST-001 v1.0.0

---

## 1. Scope

This document defines the exclusive entry points through which information enters the MPLP ecosystem and the authority boundaries of each entry point.

This specification is constitutional. No other document may override, modify, or reinterpret its provisions.

---

## 2. Entry Points

MPLP recognizes exactly **three primary entry points** plus **one auxiliary entry point**. This list is exhaustive.

### 2.1 Website (Primary)

**URI**: mplp.io  
**Role**: Discovery and Positioning  
**Authority**: None

The Website:
- Provides discovery and positioning content
- Is informative only
- Has no authority to define protocol requirements
- Has no authority to interpret specifications
- May be updated without governance process

### 2.2 Documentation (Primary)

**URI**: docs.mplp.io  
**Role**: Specification and Reference  
**Authority**: Normative (specification documents only)

The Documentation:
- Contains protocol specifications
- Contains reference documentation
- Contains evaluation descriptions (informative only, pointer-level references to Validation Lab)
- Must not contradict the Repository
- Must derive normative content from Repository schemas and invariants
- Must not enumerate ruleset clauses or define adjudication logic (Validation Lab authority)

### 2.3 Repository (Primary)

**URI**: github.com/Coregentis/MPLP-Protocol  
**Role**: Source of Truth  
**Authority**: Ultimate

The Repository:
- Is the sole source of truth for all protocol definitions
- Contains canonical schemas
- Contains canonical invariants
- Contains canonical implementations
- Takes precedence over all other sources

### 2.4 Validation Lab (Auxiliary)

**URI**: lab.mplp.io  
**Role**: Evidence Adjudication (non-normative)  
**Authority**: None (adjudication only)

The Validation Lab:
- Adjudicates **evidence packs** against versioned rulesets
- MUST be **non-normative** and **non-certification**
- MUST NOT define protocol requirements
- MUST NOT host execution
- Derives its adjudication inputs from Repository truth sources (schemas/invariants) and published evidence packs
- Is a **governed projection** of the MPLP Protocol

---

## 3. Conflict Resolution

When any conflict exists between entry points, the following precedence applies:

```
Repository > Documentation > Validation Lab > Website
```

This precedence is absolute and non-negotiable.

### 3.1 Repository–Documentation Conflict

If Documentation contradicts Repository:
- Repository prevails
- Documentation must be corrected

### 3.2 Repository–Validation Lab Conflict

If Validation Lab contradicts Repository:
- Repository prevails
- Validation Lab must be corrected

### 3.3 Documentation–Validation Lab Conflict

If Validation Lab contradicts Documentation:
- Documentation prevails
- Validation Lab must be corrected

### 3.4 Documentation–Website Conflict

If Website contradicts Documentation:
- Documentation prevails
- Website must be corrected

### 3.5 Validation Lab–Website Conflict

If Website contradicts Validation Lab:
- Validation Lab prevails
- Website must be corrected

### 3.6 Repository–Website Conflict

If Website contradicts Repository:
- Repository prevails
- Website must be corrected

---

## 4. Prohibited Patterns

The following patterns are prohibited without exception.

### 4.1 Website Authority Violation

The Website must not:
- Define protocol requirements
- Use normative language (MUST, SHALL, REQUIRED)
- Claim specification authority
- Interpret normative documents

### 4.2 Documentation Independence Violation

Documentation must not:
- Create normative content without Repository backing
- Contradict Repository schemas or invariants
- Claim authority beyond its scope

### 4.3 Validation Lab Authority Violation

Validation Lab must not:
- Define protocol requirements
- Create normative content
- Certify or endorse implementations
- Host execution of agent systems
- Claim that evidence adjudication confers protocol compliance

### 4.4 Compliance and Certification Claims

No **official MPLP-controlled entry point** may:
- Claim that MPLP provides compliance
- Claim that MPLP provides certification
- Suggest that MPLP adoption confers regulatory status
- Use the terms "MPLP compliant" or "MPLP certified"

---

## 5. Amendment

This specification may only be amended through the MPGC constitutional governance process.

Amendments require:
- Explicit MPGC approval
- Version increment
- Public notice period

---

## 6. Amendment History

| Version | Date | Changes |
|:---|:---|:---|
| v1.0.0 | 2025-12-XX | Initial constitutional entry model (3 entries) |
| v1.1.0 | 2026-01-22 | Added Validation Lab as auxiliary entry point (3+1 model) |

---

**End of Document**
