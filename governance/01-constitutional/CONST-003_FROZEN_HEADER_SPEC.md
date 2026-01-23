# MPLP Frozen Header Specification

**Document ID**: CONST-003  
**Status**: Constitutional  
**Authority**: MPGC  
**Effective**: v1.1.0  
**Supersedes**: v1.0.0

---

## 1. Scope

This document defines the semantic meaning of Frozen status in MPLP documentation.

This specification is constitutional. The meaning of Frozen is strictly limited to **Protocol Content** (Normative documentation). All other forms of immutability (Governance, Audit records) are handled via **Sealed Records** standard.

---

## 2. Frozen Header Template

All frozen documents must include the following header block immediately after the frontmatter:

```markdown
> **Frozen Specification**
>
> Protocol Version: [VERSION]
> Freeze Date: [YYYY-MM-DD]
> Authority: MPGC
>
> This document is normative and frozen.
> Changes require MPGC governance process.
```

A document claiming `status: frozen` without this header is invalid.

---

## 3. What Frozen Means

### 3.1 Frozen = Stable Contract

Frozen status means:

- The **expression** is locked
- The **interface** is committed
- The **terminology** is fixed
- The **structure** is immutable

### 3.2 Frozen ≠ Truth

Frozen status does not mean:

- Correctness
- Completeness
- Implementation
- Validation
- Verification
- Conformance
- Certification

A frozen document is a **stable specification**, not a **verified fact**.

---

## 4. Frozen Preconditions

A document may only be frozen if all of the following are true:

| Condition | Required Value |
|-----------|----------------|
| `doc_type` | `normative` |
| `authority` | `protocol` |
| `entry_surface` | `documentation` |
| `status` | `frozen` |

Documents that do not satisfy all preconditions must not have `status: frozen`.

> [!IMPORTANT]
> **Frozen = Protocol Frozen**  
> Documentation that is not `authority: protocol` (e.g., Governance methods, release checklists) MUST use `status: draft` in frontmatter and rely on **04-records/Seals** for verifiable immutability.

---

## 5. Freezing Process

### 5.1 Authority

Only MPGC may freeze a document.

### 5.2 Required Actions

Freezing requires:

1. MPGC approval
2. Assignment of freeze date
3. Inclusion of Frozen Header per Section 2
4. Version increment if applicable

### 5.3 Public Record

Frozen documents must be recorded in the governance registry.

---

## 6. Modification Rules

### 6.1 Immutability

A frozen document may not be modified within a protocol version.

### 6.2 Permitted Changes

The following changes are permitted without unfreezing:

- Typographical corrections (no semantic change)
- Formatting corrections (no semantic change)
- Link corrections (no semantic change)

These are classified as **errata** and must be logged.

### 6.3 Semantic Changes

Any semantic change requires:

- New document version
- New freeze process
- MPGC governance approval

### 6.4 Irreversibility

Frozen status is irreversible within a protocol version.

A frozen document cannot become unfrozen. It can only be superseded by a new version.

---

## 7. Non-Frozen Documents

### 7.1 Informative Documents

Informative documents cannot be frozen.

### 7.2 Draft Documents

Draft documents may be modified freely.

Website content cannot be frozen and may change without governance process.

### 7.4 Governance Documents

Governance documents (methods, SOPs, checklists) cannot be frozen. Their immutability is achieved through **Sealed Records** or **Registry Anchoring**, which preserves historical integrity while maintaining a `status: draft` lifecycle in the repository.

---

## 8. Amendment

This specification may only be amended through the MPGC constitutional governance process.

---

**End of Document**
