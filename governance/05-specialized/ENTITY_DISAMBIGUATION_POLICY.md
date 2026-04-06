---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "ENTITY_DISAMBIGUATION_POLICY"
---

# Entity Disambiguation Policy

> **Status**: Governance Policy  
> **Authority**: MPGC  
> **Purpose**: Prevent semantic misidentification of MPLP entity

---

## Standard Disambiguation Blocks

These blocks MUST be used for auto-insertion and CI gate validation.

### Block 1: Definition (Minimal)

```
MPLP stands for Multi-Agent Lifecycle Protocol.
```

**Usage**: Minimum required disambiguation on any page mentioning MPLP.

---

### Block 2: Not-a-License (Required on high-traffic pages)

```
MPLP is not a software license and does not define licensing terms.
```

**Usage**: 
- Website footer
- Website anchor page (/what-is-mplp)
- Docs anchor page (/reference/entrypoints)
- Repo README public-facing surfaces section
- Any page discussing protocol positioning

---

### Block 3: Informative Disclaimer (Docs/Website non-normative pages)

```
This page is informative and non-normative. For normative requirements, see the Specification.
```

**Usage**:
- All non-normative docs pages
- Website positioning/analogy pages
- Evaluation/conformance pages

---

### Block 4: POSIX Lens Clarification (POSIX analogy pages only)

```
This is a conceptual lens for understanding, not a compatibility claim. MPLP is not POSIX and does not implement POSIX APIs.
```

**Usage**:
- Website /posix-analogy page
- Docs POSIX analogy mapping page
- Any content using POSIX as conceptual reference

---

## Prohibited Patterns

These patterns MUST trigger CI gate FAIL if found.

### High Severity (Misidentification Triggers)

| Pattern | Reason | Gate Action |
|---------|--------|-------------|
| `MPLP is a license` | Direct misidentification | FAIL |
| `licensing protocol` | Semantic confusion with license | FAIL |
| `MPLP-compliant` | Incorrect terminology (use `conformant`) | FAIL |
| `Multi-Perspective License Protocol` | Incorrect expansion | FAIL |

### Medium Severity (Authority Claims)

| Pattern | Reason | Gate Action |
|---------|--------|-------------|
| `the POSIX of agents` | Unqualified authority claim | FAIL |
| `industry standard` | Premature positioning claim | FAIL |
| `certified` | Implies certification program | FAIL |
| `official endorsement` | Implies external authority | FAIL |
| `certification` | Implies certification process | FAIL |
| `badge` | Implies badging/ranking system | FAIL |
| `ranking` | Implies competitive ranking | FAIL |

### Low Severity (Positioning Overreach)

| Pattern | Reason | Gate Action |
|---------|--------|-------------|
| Unqualified `compatible` | Needs qualification (e.g., "conceptually similar") | WARN |
| Unqualified `equivalent` | Needs qualification | WARN |
| `same as` | Overstates relationship | WARN |

---

## Correct Terminology

| Instead of | Use |
|------------|-----|
| MPLP-compliant | MPLP-conformant |
| certified | conformant (with evidence) |
| compatible | conformant / interoperable |
| the POSIX of agents | POSIX-like abstraction layer (qualified) |

---

## Enforcement

### CI Gates
- Gate 1 (Acronym): Catches incorrect expansions
- Gate 4 (Claim): Catches prohibited patterns

### Manual Review
- High-traffic pages must include Block 2
- POSIX analogy pages must include Block 4
- Non-normative pages should include Block 3

---

## Common Misidentification Scenarios

### Scenario 1: License Confusion
**Trigger**: External documentation refers to "MPLP license"  
**Response**: Block 2 must appear prominently on all entry pages

### Scenario 2: Authority Overreach
**Trigger**: Content claims "MPLP is the industry standard"  
**Response**: Gate 4 FAIL, remove claim or qualify with evidence

### Scenario 3: POSIX Compatibility Claim
**Trigger**: Content states "MPLP is POSIX-compatible"  
**Response**: Block 4 required, clarify as conceptual lens only

---

**Last Updated**: 2026-01-08  
**Next Review**: Upon any entity definition change
