---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "PATTERN-LIBRARY-DOCS-01"
---



# PATTERN-LIBRARY-DOCS-01 — Writing Examples

**Purpose**: Provide "how to write / how NOT to write" patterns for drift detection.

---

## Governing References

| Ref | Purpose |
|:---|:---|
| CONST-006 | Layer boundaries; doc type outlines; F1–F4 |
| CONST-005 | No new semantics |
| METHOD-DGA-01 | Drift fingerprints |
| METHOD-DTAA-01 | Anchoring requirements |
| METHOD-DTV-01 | Evidence binding |

---

## 1. L1 Documents (Core Protocol)

### ✅ Allowed

```markdown
# Good: Definition + Boundary
MPLP defines protocol ontology via versioned schemas.

> **Evidence**
> Type: Schema
> Source: schemas/v2/mplp-core.schema.json
```

```markdown
# Good: Negative scope declaration
L1 does not define runtime behavior; execution belongs to L3.

> **Evidence**
> Type: Constitutional
> Source: CONST-006 §1
```

### ❌ Forbidden

```markdown
# Bad: Capability packaging + layer overreach
MPLP provides a runtime that orchestrates agents end-to-end.

Drift: F2 Capability Packaging
Verdict: MOVE (Website) or REWORD
```

```markdown
# Bad: Guarantee claim
MPLP guarantees rollback and audit correctness.

Drift: F2 + forbidden truth claim
Verdict: REWORD + add negative disclaimer
```

---

## 2. L2 Documents (Coordination)

### ✅ Allowed

```markdown
# Good: Behavioral semantics with evidence
This document specifies lifecycle states and invariants.

> **Evidence**
> Type: Invariant
> Source: schemas/v2/invariants/sa-invariants.yaml
> RuleID: sa_plan_context_binding
```

```markdown
# Good: Constraint (not algorithm) declaration
Transition rules are defined as constraints, not algorithms.

> **Evidence**
> Type: Constitutional
> Source: CONST-006 §2.2
```

### ❌ Forbidden

```markdown
# Bad: Implementation prescription (F1)
Implement the state machine using queue X and storage Y.

Drift: F1 Implementation Prescription
Verdict: MOVE to guides/ or REMOVE
```

---

## 3. L3 Documents (Execution)

### ✅ Allowed

```markdown
# Good: Interface contract
AEL MUST implement execute(step) → Promise<result>

> **Evidence**
> Type: Schema (runtime interface)
> Source: L3 interface definition
```

### ❌ Forbidden

```markdown
# Bad: Vendor recommendation
Use Redis for VSL in production for best performance.

Drift: F1 Implementation Prescription
Verdict: REMOVE or MOVE to guides/
```

---

## 4. Informative Documents — MUST Handling

### ✅ Allowed

```markdown
# Good: Explicit non-normative restatement
MUST (restated from schema; non-normative): Plans reference context_id.

> **Evidence**
> Type: Schema
> Source: mplp-plan.schema.json
> Pointer: #/properties/context_id
> Note: Informative restatement only.
```

```markdown
# Good: External interoperability with disclaimer
For interoperability with W3C Trace Context, implementations SHOULD...

> **Note**: This is not a protocol obligation.
```

### ❌ Forbidden

```markdown
# Bad: Informative doc with normative section title
## Normative Requirements
Implementations MUST...

Problem: Section title implies normativity in non-normative doc
Verdict: REWORD (rename section + add disclaimer)
```

---

## 5. Evaluation / Golden Flows

### ✅ Allowed

```markdown
# Good: Non-endorsement disclaimer
PASS/FAIL are evidence adjudications under ruleset X.
This is not certification.

> **Evidence**
> Type: Method
> Source: Evaluation ruleset
```

### ❌ Forbidden

```markdown
# Bad: Certification language (F3)
Passing this flow means MPLP compliant.

Drift: F3 Endorsement Drift
Verdict: REWORD + non-endorsement block
```

---

## 6. Authority Inversion (F4)

### ❌ Forbidden

```markdown
# Bad: New definition in prose
MPLP defines "execution frame" as a bounded execution context...

Problem: Term not in schema/glossary
Drift: F4 Authority Inversion + DTAA semantic violation
Verdict: REMOVE or ESCALATE
```

### ✅ Allowed

```markdown
# Good: Explicit restatement
This text restates schema meaning for readability.
Schema is authoritative.

> **Evidence**: Type=Schema, Pointer=...
```

---

## 7. Drift Fingerprint Quick Reference

| ID | Pattern | Detection Signal | Verdict |
|:---|:---|:---|:---|
| **F1** | Implementation Prescription | Step 1/2/3; architecture diagrams; deploy guides | MOVE/REMOVE |
| **F2** | Capability Packaging | Features/benefits; "MPLP provides..." | MOVE (Website) |
| **F3** | Endorsement Drift | Tiers; "must pass for compliant" | REWORD |
| **F4** | Authority Inversion | New terms in prose; decorative pointers | REMOVE/ESCALATE |

---

## 8. Verb Control

### ✅ Allowed Verbs (L1/L2)
- defines, constrains, scopes, excludes, distinguishes, specifies

### ❌ Forbidden Verbs
- runs, executes, implements, guarantees, ensures, validates, enforces

---

**Document Status**: Reference Library
**Usage**: Consult during DGA Phase 1.1.3 (F1–F4 detection)
