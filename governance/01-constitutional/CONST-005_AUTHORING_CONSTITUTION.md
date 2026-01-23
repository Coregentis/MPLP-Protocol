# CONST-005: Docs Authoring Constitution

> **Frozen Governance Specification**
>
> Version: 1.0.0
> Status: FROZEN
> Authority: MPGC
> Effective: 2026-01-05

---

## 0. Constitutional Relationship

> **This document is additive and non-overriding.**
>
> CONST-005 does not alter the validity or authority of CONST-002, CONST-003, or CONST-004.
> It constrains authoring behavior **within** their boundaries.

**References**:
- CONST-001: Entry Model Specification (3+1 entry model: 3 primary + 1 auxiliary)
- CONST-002: Document Format Specification (Frontmatter, structure)
- CONST-003: Frozen Header Specification
- CONST-004: Documentation Audit Methodology (10-dimension framework)

---

## 1. Authority Ladder

All MPLP content is governed by a strict authority hierarchy. **Lower layers may only derive from, not contradict, higher layers.**

```
Layer 0: Schema (schemas/v2/*.schema.json)
         ↓ defines [UNIQUE TRUTH SOURCE]
Layer 1: Packages (packages/sources/*)
         ↓ implements + validates [BEHAVIORAL EVIDENCE ONLY]
Layer 2: Docs specification/ (docs/docs/specification/**)
         ↓ restates [DERIVED TRUTH SOURCE - NO NEW SEMANTICS]
Layer 3: Docs guides|evaluation/ (docs/docs/guides|evaluation/**)
         ↓ explains [INFORMATIVE - NO PROTOCOL OBLIGATIONS]
Layer 4: Website (mplp.io)
         → positions [DISCOVERY ONLY - NO DEFINITIONS]
```

**Critical Rule**: Movement between layers is **unidirectional downward**.
Any claim at Layer N must be traceable to Layer 0-N-1.

---

## 2. Doc Type Matrix

### 2.1 Content Permissions by Type

| Doc Category | Allowed Content | Forbidden Content (Violation = FAIL) |
|:---|:---|:---|
| **specification/** | Schema structure restatement; Field semantics (陈述性); Constraint description with pointers; Lifecycle role mapping | New terms/fields/flows; "Implementation recommendations" as obligations; Any MUST/SHALL without schema pointer |
| **guides/** | Usage examples; FAQ (Informative); Best practices (non-binding) | "Protocol must support X capability"; New boundaries; Best practice → obligation conversion |
| **evaluation/** | Evaluation methodology; Evidence formats; PASS/FAIL logic description | Evaluation rules as protocol obligations; "Lab rules" as "protocol must" |
| **meta/ops/** | Authoring workflow; Contribution guidelines | Any protocol semantic assertions |
| **governance/** | Freeze declarations; Process definitions | Technical detail definitions (must reference repo/schema) |

### 2.2 Verdict Rules

- **specification/** content in guides/ → MOVE
- **guides/** content in specification/ → REMOVE
- New semantics anywhere → FAIL + MPGC escalation

---

## 3. Mandatory Sections

### 3.1 specification/* (Every page MUST contain)

1. **Purpose** — What this document describes
2. **Scope / Non-Goals** — Explicit boundaries (may inherit with declaration)
3. **Authority & Version Anchor** — "MPGC • MPLP v1.0.0 frozen"
4. **Schema References** — Minimum: schema filename + JSON Pointer
5. **Semantics** — Restatement only, no new definitions
6. **Constraints** — Copied from schema with pointers
7. **Lifecycle Role** — Position in Golden Flows / 11 Duties
8. **Examples** — MUST declare: "Examples are non-normative"

### 3.2 guides/* (Every page MUST contain)

1. **Purpose**
2. **Audience & Preconditions** — Avoid framework endorsement
3. **What this guide does NOT do** — Explicit scope limitation
4. **References** — Links to spec pages + schema with authority attribution
5. **Examples** — MUST declare non-normative

### 3.3 evaluation/* (Every page MUST contain)

1. **Scope** — "Evaluation scope ≠ protocol scope"
2. **Ruleset Version Anchor** — Relationship to MPLP v1.0.0
3. **Required Evidence** — Manifest / trace / confirm / snapshot
4. **Verdict Semantics** — PASS/FAIL/NOT-EVALUATED meanings
5. **Non-endorsement Block** — MUST be present

---

## 4. Depth Rules

### 4.1 What specification/ pages MAY answer

- What is this field?
- Where does it come from? (schema pointer)
- What are its constraints?
- Which lifecycle point does it relate to?

### 4.2 What specification/ pages MUST NOT answer

- How to implement this
- How to optimize this
- What runtime/framework to use
- What is "better" or "recommended"

### 4.3 Depth Test

> **A reader of this page shall NOT gain any understanding of obligations or capabilities that are not already defined in schemas.**

If the page adds information beyond schema → FAIL.

---

## 5. Forbidden Claims

The following claim types are **grounds for immediate REMOVE/REWORD**:

### 5.1 Capability Claims (Forbidden)

- "MPLP supports X" — unless X is explicitly in schema + Golden Flows
- "MPLP guarantees X" — never allowed in docs

### 5.2 Obligation Claims (Forbidden without Schema Pointer)

- "must implement" / "required to implement"
- "shall provide" / "shall ensure"

### 5.3 Endorsement Claims (Absolutely Forbidden)

- "certified" / "compliant" / "endorsed"
- "recommended by MPLP"
- "official implementation"

### 5.4 Positioning Claims (Website Only)

- "best" / "first" / "only standard"
- "industry-leading" / "de facto"

### 5.5 Scope Claims (Forbidden)

- New abstraction layers (L0/L5)
- New modules not in schema
- New flows beyond GF-01~GF-05

### 5.6 Readability Drift (Detect & Reword)

- New terminology not in glossary
- New classifications for "clarity"
- Sub-module names created for "organization"

---

## 6. Terminology Governance

### 6.1 Term Introduction Rule

New terms in docs require:
1. Glossary RFC (even lightweight)
2. MPGC record
3. No retroactive terminology allowed

### 6.2 Automated Detection

Any term not in `docs/docs/meta/index/glossary.md` appearing in specification/ is flagged.

### 6.3 Verdict

- Found in glossary → PASS
- Not in glossary but schema-derived → PASS with note
- Not in glossary and not in schema → FAIL

---

## 7. JSON-LD Usage Policy

### 7.1 specification/* — Absolutely Forbidden

> **No JSON-LD may appear in specification/ pages.**

JSON-LD declares machine-level authority. It conflicts with docs' role as derived truth source.

### 7.2 guides/* — Principle Forbidden

JSON-LD SHOULD NOT be used. Exceptions require DTAA explicit approval.

### 7.3 evaluation/* — Controlled Use Only

Allowed JSON-LD types:
- `Dataset`
- `CreativeWork` (report-style)
- `SoftwareSourceCode` (cautious)

**Mandatory conditions**:
- Explicit non-endorsement statement
- Bound to `ruleset_version` + `mplp_protocol_version`
- No `defines`, `specification`, `standard`, `compliant`, `certified`

### 7.4 Website (Out of Docs Scope)

Website and Validation Lab may use JSON-LD for positioning per Entry Model (CONST-001).

---

## 8. Normative Language Governance

### 8.1 RFC 2119 Language Scope

| Keyword | specification/ | guides/ | evaluation/ |
|:---|:---:|:---:|:---:|
| MUST / MUST NOT | ✅ with pointer | ❌ Forbidden | ⚠️ Ruleset only |
| SHALL / SHALL NOT | ✅ with pointer | ❌ Forbidden | ⚠️ Ruleset only |
| SHOULD / SHOULD NOT | ✅ | ⚠️ Caution | ✅ |
| MAY | ✅ | ✅ | ✅ |

### 8.2 Pointer Requirement

Any MUST/SHALL in specification/ MUST be accompanied by:
- Schema filename
- JSON Pointer (e.g., `/properties/agent_id`)
- Or explicit "per CONST-00X" reference

### 8.3 Default Rule

> **MUST in docs ≠ new obligation.
> MUST in docs = restated schema constraint.**

If a MUST cannot point to schema → FAIL.

---

## 9. Docs Change Classification & Gate

### 9.1 Change Taxonomy

Every docs change MUST be classified:

| Type | Definition | v1.0 Gate |
|:---|:---|:---|
| **Editorial** | Typo, formatting, link fix | ✅ Allowed |
| **Clarifying** | Reword for clarity, no semantic change | ✅ Allowed with review |
| **Semantic** | New/changed meaning, obligation, capability | ❌ Forbidden under v1.0 frozen |

### 9.2 Clarifying Change Constraints

A change claims to be "Clarifying" only if:
- No new assertions introduced
- No removed schema pointers
- No changed constraint language
- DTAA scan PASS

### 9.3 Semantic Change Escalation

> **Semantic change to docs requires MPGC process
> and is out of scope for DTAA.**

Any proposed semantic change during DTAA execution → STOP + escalate.

---

## 10. Enforcement

### 10.1 DTAA as Operationalization

This Constitution is enforced via METHOD-DTAA-01.
CONST-005 defines **what**.
METHOD-DTAA-01 defines **how and when**.

### 10.2 Violation Handling

| Violation Level | Handling |
|:---|:---|
| Minor (missing section) | REWORD required |
| Major (forbidden claim) | REMOVE + re-adjudicate |
| Critical (new semantics) | FAIL + MPGC escalation |

---

## Document Status

| Property | Value |
|:---|:---|
| Document Type | Governance Specification |
| Status | FROZEN |
| Supersedes | None |
| References | CONST-001, CONST-002, CONST-003, CONST-004, METHOD-DTAA-01 |

---

**© 2026 MPGC — MPLP Protocol Governance Committee**
