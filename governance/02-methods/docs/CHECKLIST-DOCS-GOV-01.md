---
entry_surface: repository
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "CHECKLIST-DOCS-GOV-01"
---



# CHECKLIST-DOCS-GOV-01 — Docs Governance Execution

**Gate Order**: DGA → DTAA → DTV → Freeze Draft → **PDA** → **ECCA** → Freeze OK  
**Default Scope**: `docs/docs/specification/**` (100%)  
**Evidence Root**: `artifacts/04-records/docs-gov/<RUN_ID>/`

---

## 0. Governing References (MUST READ)

| Ref | Document | Purpose |
|:---|:---|:---|
| CONST-001 | Entry Authority | Repo > Docs > Validation Lab > Website |
| CONST-003 | Frozen Header Spec | Meaning & preconditions |
| CONST-005 | Authoring Constitution | Semantic change forbidden; change classes |
| CONST-006 | Doc Type Outlines | Layer boundaries; entry contracts; F1–F4 |
| METHOD-DGA-01 | Narrative Audit | Drift fingerprints |
| METHOD-DTAA-01 | Truth Alignment | Semantic purity |
| METHOD-DTV-01 | Truth Verification | Evidence binding |
| METHOD-PDA-01 | Per-Document Audit | Execution enforcement |
| METHOD-ECCA-01 | Editorial Clarity Audit | Slot/term/pronoun gates |
| SOP-AUDIT-01 | Audit SOP | Step-by-step execution |
| SOP-ECCA-01 | ECCA SOP | Clarity audit execution |
| SOP-DTAA-06 | Remediation SOP | Patch logging |

> **Rule**: Any checklist step that cannot cite one of the above is invalid.

---

# Phase 0 — Run Initialization (REQUIRED)

## 0.1 Create RUN_ID
- [ ] Format: `DOCS-GOV-RUN-YYYY-MM-DD-XX`
- [ ] Output: `inputs/RUN_CONTEXT.md`
- **PASS**: RUN_ID used consistently in all outputs

## 0.2 Freeze Input State
- [ ] Record git commit hash
- [ ] Record branch
- [ ] Record protocol version (v1.0.0)
- [ ] Record docs target scope
- [ ] Output: `inputs/RUN_CONTEXT.md`
- **PASS**: Reproducible checkout possible

## 0.3 Create Evidence Directory Skeleton
- [ ] Create `inputs/` `outputs/` `logs/`
- **PASS**: Directories exist

---

# Phase 1 — DGA Gate (Narrative & Entry Alignment) [Hard Gate]

## 1.1 Track A — Structural Compliance Scan

### 1.1.1 Frontmatter Validity
- [ ] Check: every doc has `doc_type`, `entry_surface`, `authority`, `status`
- [ ] Rule: values consistent with location
- **PASS**: 100% present & valid
- **FAIL**: Flag to `outputs/<RUN_ID>__DGA_FLAGS_FRONTMATTER.md`
- **Ref**: CONST-006 §3; METHOD-DGA-01 §2.1

### 1.1.2 Mandatory Sections Present
- [ ] Check: required sections exist per doc_type
- **PASS**: missing=0
- **FAIL**: Log missing sections
- **Output**: `outputs/<RUN_ID>__DGA_FLAGS_SECTIONS.md`
- **Ref**: CONST-006 §2; METHOD-DGA-01 §2.1

### 1.1.3 Forbidden Narrative Patterns (F1–F4)
- [ ] F1: Implementation Prescription (Step 1/2/3; build guides)
- [ ] F2: Capability Packaging (features/benefits)
- [ ] F3: Endorsement Drift (tiering, certification claims)
- [ ] F4: Authority Inversion (definitions in prose)
- **PASS**: 0 hard hits
- **FAIL**: Produce drift findings with excerpt
- **Outputs**: `outputs/<RUN_ID>__DGA_SCAN_REPORT.md`, `outputs/<RUN_ID>__DGA_DRIFT_FINDINGS.md`
- **Ref**: CONST-006 §4; METHOD-DGA-01 §3

### 1.1.4 SEO / Entry-Surface Boundary Checks
- [ ] Docs pages MUST NOT contain JSON-LD blocks or marketing CTA sections
- [ ] Docs pages MUST NOT claim certification/endorsement/guarantee
- [ ] Website-only positioning language must not appear in docs structure (features/benefits/pricing)
- **Output**: `outputs/<RUN_ID>__DGA_FLAGS_ENTRY_SEMANTICS.md`
- **Ref**: CONST-001; CONST-006 §3; CONST-006 §4 (F2/F3)

## 1.2 Track B — Narrative Adjudication (Manual)

### 1.2.1 Layer Boundary Check
- [ ] L1/L2/L3/L4 boundaries respected
- **PASS**: No layer-overreach
- **FAIL**: Verdict MOVE/REWORD/REMOVE
- **Ref**: CONST-006 §1; METHOD-DGA-01 §2.2

### 1.2.2 Entry Surface Contract Check
- [ ] Docs ≠ Website ≠ Repo narrative
- **PASS**: No marketing/certification narrative
- **FAIL**: Verdict MOVE/REWORD
- **Output**: `outputs/<RUN_ID>__DGA_ADJUDICATION_TABLE.md`
- **Ref**: CONST-006 §3; METHOD-DGA-01 §2.2

### 1.2.3 Subject/Action Grammar Test (Gap Fix #2)
- [ ] **Subject Test**: Paragraph subject must be protocol/specification/schema/invariant, NOT system/platform/framework/runtime
- [ ] **Action Test**: Action executor must NOT be "MPLP" (MPLP only defines constraints, does not execute)
- **PASS**: All paragraphs pass both tests
- **FAIL**: Verdict REWORD (change subject/action framing)
- **Output**: `outputs/<RUN_ID>__DGA_SUBJECT_ACTION_TEST.md`
- **Ref**: CONST-006 §1; METHOD-DGA-01 §2.2

> **Gate Exit**: No unresolved FINDING; all pages PASS or have REWORD/MOVE plan

---

# Phase 2 — DTAA Gate (Semantic Purity) [Hard Gate]

## 2.1 Authority / Frozen Legality
- [ ] Informative docs: no frozen header (use Authority Block)
- [ ] Normative docs: meet CONST-003 preconditions
- **PASS**: 100% legal
- **Output**: `outputs/<RUN_ID>__DTAA_FLAGS_AUTHORITY.md`
- **Ref**: CONST-003 §4, §7.1; CONST-005

## 2.2 Semantic Violations Scan
- [ ] No new definitions in prose
- [ ] No new layers/modules/flows
- [ ] No normative claims without evidence
- **PASS**: 0 violations
- **Output**: `outputs/<RUN_ID>__DTAA_SCAN_REPORT.md`
- **Ref**: METHOD-DTAA-01; CONST-005

## 2.3 Normative Language Control (MUST/SHALL)
- [ ] MUST/SHALL only if schema-derived + anchored
- [ ] Informative: downgrade or add disclaimer
- **PASS**: 0 unanchored MUST/SHALL
- **Outputs**: `outputs/<RUN_ID>__DTAA_POINTER_MAP.md`, `outputs/<RUN_ID>__DTAA_POINTERS_PATCHLOG.md`
- **Ref**: METHOD-DTAA-01; SOP-DTAA-06

> **Gate Exit**: Semantic violations=0; authority legality=100%

---

# Phase 3 — DTV Gate (Truth Verification) [Hard Gate]

## 3.0 Assertion Classification (REQUIRED) (Gap Fix #1)

### 3.0.1 Assertion Extraction Rules
- [ ] **Numeric assertions**: ALL sentences containing numbers/counts (10 modules, 11 duties, 5 flows, versions, dates)
- [ ] **Normative assertions**: ALL sentences with MUST/SHALL/SHOULD/MAY or equivalent expressions
- [ ] **Definitional assertions**: ALL sentences with is/are/defines/requires/includes/consists of
- **Coverage**: assertion_coverage = 100% of (numeric + normative + definitional)

### 3.0.2 Classification
- [ ] Classify each assertion into Evidence Type:
  - Schema / Invariant / Constitutional / Method / Implementation / Test / Interpretive
- [ ] Any assertion without valid Evidence Type → downgrade to Interpretive + add disclaimer

- **PASS**: assertion_coverage = 100%; all classified
- **Output**: `outputs/<RUN_ID>__DTV_ASSERTION_INDEX.md`
- **Ref**: METHOD-DTV-01 §1 (Evidence Types)

## 3.1 Pointer Existence Verification
- [ ] Every evidence block: schema file exists
- [ ] JSON Pointer resolves
- **PASS**: resolved=100%
- **Output**: `outputs/<RUN_ID>__DTV_POINTER_VALIDITY.md`
- **Ref**: METHOD-DTV-01 §2.1

## 3.2 Example Validity Verification
- [ ] JSON/YAML examples validate against schema
- **PASS**: FAIL=0 or marked non-normative
- **Output**: `outputs/<RUN_ID>__DTV_EXAMPLE_VALIDITY.md`
- **Ref**: METHOD-DTV-01 §2.2

## 3.3 Implementation Reference Validity (Gap Fix #3)

### Claim Types (v1.0 scope)
| Type | Description | v1.0 Scope |
|:---|:---|:---|
| **A** | Existence (file/symbol exists) | ✅ Required |
| **B** | Signature consistency (types/params) | ✅ Best-effort |
| **C** | Behavior consistency | ❌ Out of scope (requires test evidence) |

### Checks
- [ ] Type A: SDK/code references exist
- [ ] Type B: Version/signature matches (best-effort)
- [ ] All Implementation claims MUST include disclaimer: "non-normative / best-effort / may diverge"
- **PASS**: All resolvable (Type A) + disclaimed
- **Output**: `outputs/<RUN_ID>__DTV_IMPLEMENTATION_REF_VALIDITY.md`
- **Ref**: METHOD-DTV-01 §2.3

> **Gate Exit**: Pointer 100%; examples 100%; refs verifiable; all assertions classified

---

# Phase 4 — Remediation & Re-run

## 4.1 Remediation Order
1. [ ] Fix DGA findings (MOVE/REWORD)
2. [ ] Fix DTAA (authority, anchoring)
3. [ ] Fix DTV (pointer/example validity)
4. [ ] Re-run Phase 1–3
- **Output**: `outputs/<RUN_ID>__REMEDIATION_LOG.md`
- **Ref**: SOP-DTAA-06; CONST-005 §9

---

# Phase 5 — Freeze Declaration

## 5.1 Generate Freeze Record
- [ ] Output: `outputs/<RUN_ID>__DOCS_GOV_FREEZE_DECLARATION.md`
- [ ] Include: scope, counts, artifact list, metrics
- **Ref**: CONST-003; CONST-005; METHOD-DTAA-01

## 5.2 Sign-off
| Role | Date | Signature |
|:---|:---|:---|
| Auditor | | |
| Reviewer (MPGC) | | |

> [!IMPORTANT]
> Phase 5 generates DRAFT Freeze. Freeze becomes EFFECTIVE only after Phase 6 completes.

---

# Phase 6 — Per-Document Audit Execution (PDA) [Hard Gate]

> **Ref**: METHOD-PDA-01; SOP-AUDIT-01

## 6.0 PDA Prerequisites
- [ ] Phase 1-5 complete (Freeze Draft exists)
- [ ] HIGH_RISK_PAGES_REGISTRY available
- [ ] RUN_ID established

## 6.1 Batch Execution Order (Mandatory)

| Batch | Directory | Priority | Waiver |
|:---:|:---|:---|:---:|
| 1 | `architecture/*.md` | 🔴 Critical | ❌ |
| 2 | `architecture/cross-cutting-kernel-duties/*.md` | 🔴 Critical | ❌ |
| 3 | `golden-flows/*.md` | 🔴 Critical | ❌ |
| 4 | `evaluation/*.md`, `semantic-alignment-*.md` | 🟠 High | ❌ |
| 5 | `modules/*.md` | 🟡 Medium | ✅ |
| 6 | Other specification files | 🟢 Standard | ✅ |

## 6.2 Per-Document Audit Steps

For EACH document, execute:

1. [ ] **Step 1**: Extract metadata (doc_type, layer, entry_surface, authority)
2. [ ] **Step 2**: DGA Structural Check (Sections, F1-F4, Subject/Action)
3. [ ] **Step 3**: DTAA Semantic Check (New concepts, Normative language)
4. [ ] **Step 4**: DTV Assertion Index (Numeric/Normative/Definitional → Evidence Type)
5. [ ] **Step 5**: Issue Verdict (PASS/REWORD/MOVE/REMOVE)

**Outputs per document**:
- `outputs/<RUN_ID>__AUDIT_<filename>.md`

**Outputs per batch**:
- `outputs/<RUN_ID>__PDA_VERDICT_TABLE.md`
- `outputs/<RUN_ID>__PDA_BATCH_SUMMARY.md`

## 6.3 Auditor Constraints

| Permitted | Forbidden |
|:---|:---|
| Extract metadata | Modify content |
| Scan patterns | Interpret MPLP |
| Classify assertions | Optimize style |
| Issue Verdict | Skip sentences |
| Generate patch | Give PASS without tables |

## 6.4 Gate Rules

- [ ] 100% of Batch 1-4 (Critical/High) files audited
- [ ] 100% of Batch 1-4 files have Verdict = PASS (or remediated)
- [ ] All REWORD patches applied and re-audited
- **Gate Exit**: No FAIL in Critical/High batches; waivers only for Batch 5-6

> [!CAUTION]
> **Phase 5 Freeze Declaration is INVALID until Phase 6 Gate Exit is achieved for Batch 1-4.**

## 6.5 Finalize Freeze

- [ ] Update Freeze Declaration with PDA completion status
- [ ] Add PDA evidence artifacts to artifact list
- [ ] MPGC sign-off on effective Freeze
- **Output**: Updated `outputs/<RUN_ID>__DOCS_GOV_FREEZE_DECLARATION.md`

> [!IMPORTANT]
> Phase 6 PDA completion enables Freeze Draft → Phase 7 ECCA is required for Freeze OK.

---

# Phase 7 — ECCA Gate (Clarity & Completeness) [Hard Gate for High-Risk]

> **Ref**: METHOD-ECCA-01; SOP-ECCA-01

**Default Scope**: `docs/docs/specification/**` (100%)
**Evidence Root**: `artifacts/04-records/docs-gov/<RUN_ID>/ecca/`

## 7.0 ECCA Prerequisites
- [ ] Phase 6 PDA complete (100% PASS)
- [ ] All specification files available
- [ ] RUN_ID established (same or new)

## 7.1 ECCA-H — Structural Slot Completeness (Hard)

- [ ] Verify each doc has required slots per doc_type (METHOD-ECCA-01 §4.1)
- [ ] Normative docs: Purpose, Scope, Non-Goals, Interfaces/Boundaries, Authority, Misread Guard
- [ ] Module docs: Purpose, Protocol Role, Schema Reference, Constraints, Lifecycle, See Also
- [ ] Informative explained: What it is, Why, What it is NOT, Normative anchor, Common Misreads
- [ ] Golden Flows: Scenario, Evidence, PASS/FAIL Criteria, Non-Endorsement, Anchors
- **PASS**: missing_slots = 0
- **FAIL**: Any missing slot (normative/golden-flows)
- **REWORD**: Missing slot in informative (if no interpretive drift)
- **Output**: `outputs/<RUN_ID>__ECCA_AUDIT_<filename>.md`

## 7.2 ECCA-H — Term & Reference Consistency (Hard)

- [ ] Abbreviation expansion: First occurrence must expand
- [ ] Canonical baseline: 10 modules, 11 duties, 5 flows, v1.0.0
- [ ] Cross-references: All See Also / repo_refs / schema refs exist
- **PASS**: 0 inconsistencies, 0 broken refs
- **FAIL**: Any mismatch or broken ref
- **Ref**: METHOD-ECCA-01 §4.2

## 7.3 ECCA-H — Pronoun / Subject Clarity (Hard)

- [ ] Paragraph subject test: First sentence has explicit subject noun
- [ ] Pronoun resolution: it/this/they resolvable within same paragraph
- **PASS**: 0 ambiguous findings
- **FAIL**: Any ambiguity
- **Ref**: METHOD-ECCA-01 §4.3

## 7.4 ECCA-S — Reader Path & Usability (Soft, Mandatory Logging)

- [ ] Reading order guidance present?
- [ ] Minimal comprehension aid (diagram/table/example) present?
- **PASS**: Present (or not applicable by doc_type)
- **LOG**: Missing items → `outputs/<RUN_ID>__ECCA_BACKLOG.md`
- **Note**: Non-blocking but must be logged
- **Ref**: METHOD-ECCA-01 §5

## 7.5 Gate Rules

| Batch | ECCA-H Rule | ECCA-S Rule | REWORD Handling |
|:---:|:---|:---|:---|
| 1-4 (High-Risk) | 100% PASS | Backlog logged | Treated as FAIL |
| 5-6 (Standard) | No FAIL | Backlog logged | Must remediate before Freeze OK |

- **Gate Exit**: All ECCA-H PASS for Batch 1-4; no FAIL for Batch 5-6

> [!CAUTION]
> **Freeze OK is INVALID until Phase 7 ECCA Gate Exit is achieved.**

## 7.6 Finalize Freeze OK

- [ ] ECCA-H 100% PASS (all 50 files)
- [ ] ECCA-S backlog generated
- [ ] Update Freeze Declaration with ECCA completion status
- [ ] MPGC sign-off on Freeze OK
- **Output**: Final `outputs/<RUN_ID>__DOCS_GOV_FREEZE_DECLARATION.md`

## 7.7 Required Artifacts

| Template ID | Artifact | Scope |
|:---|:---|:---|
| T12 | `<RUN_ID>__ECCA_AUDIT_<filename>.md` | Per document |
| T13 | `<RUN_ID>__ECCA_BATCH_<N>_SUMMARY.md` | Per batch |
| T14 | `<RUN_ID>__ECCA_FINAL_SUMMARY.md` | Per run |
| T15 | `<RUN_ID>__ECCA_BACKLOG.md` | Per run |

---

# Appendix A — Verdict Vocabulary

| Verdict | Meaning |
|:---|:---|
| **PASS** | Compliant |
| **REWORD** | Minor drift, fix in place |
| **MOVE** | Wrong location |
| **REMOVE** | Irreparable |
| **ESCALATE** | MPGC required |

---

# Appendix B — Required Output Templates (MUST FOLLOW)

## T0) DTV_ASSERTION_INDEX Template
File: `outputs/<RUN_ID>__DTV_ASSERTION_INDEX.md`

| Doc | Assertion (short) | Evidence Type | Source | Pointer/Ref | Verifiable | Action |
|:---|:---|:---|:---|:---|:---:|:---|

---

## T1) DGA_SCAN_REPORT Template
File: `outputs/<RUN_ID>__DGA_SCAN_REPORT.md`

### Required Fields
- Run ID
- Commit / Branch
- Scope
- Total files scanned
- Flags summary (counts)
- Tooling / scripts used (if any)

### Required Tables
**A. Frontmatter Flags**
| File | Missing Keys | Invalid Values | Notes |
|:---|:---|:---|:---|

**B. Section Flags**
| File | Doc Type | Missing Sections | Severity | Notes |
|:---|:---|:---|:---:|:---|

**C. Drift Fingerprints (Auto-detected)**
| File | Fingerprint (F1–F4) | Evidence Excerpt | Verdict | Remediation |
|:---|:---|:---|:---|:---|

PASS condition: all tables present, counts consistent.

---

## T2) DGA_DRIFT_FINDINGS Template
File: `outputs/<RUN_ID>__DGA_DRIFT_FINDINGS.md`

| Finding ID | File | Fingerprint | Evidence (excerpt ≤ 40 words) | Why Drift | Verdict | Fix |
|:---|:---|:---|:---|:---|:---|:---|

---

## T3) DGA_ADJUDICATION_TABLE Template
File: `outputs/<RUN_ID>__DGA_ADJUDICATION_TABLE.md`

| File | Claimed Layer | Actual Layer | Doc Type | Entry Contract OK | Drift (F1–F4) | Verdict | Notes |
|:---|:---|:---|:---|:---:|:---|:---|:---|

---

## T4) DTAA_SCAN_REPORT Template
File: `outputs/<RUN_ID>__DTAA_SCAN_REPORT.md`

### Required Tables
**A. Semantic Violations**
| ID | File | Violation Type | Evidence | Verdict | Remediation |
|:---|:---|:---|:---|:---|:---|

**B. MUST/SHALL Without Anchor**
| File | Statement | Evidence Block Present | Schema/Pointer | Action |
|:---|:---|:---:|:---|:---|

PASS condition: violations=0, unanchored MUST/SHALL=0.

---

## T5) DTAA_POINTERS_PATCHLOG Template
File: `outputs/<RUN_ID>__DTAA_POINTERS_PATCHLOG.md`

| File | Original Text | Change Type | Evidence Type | Source | Pointer/Ref |
|:---|:---|:---|:---|:---|:---|

Change Type: ADD_POINTER / DOWNGRADE / DISCLAIMER

---

## T6) DTV_POINTER_VALIDITY Template
File: `outputs/<RUN_ID>__DTV_POINTER_VALIDITY.md`

| Schema File | Pointer | Used By (doc path) | Resolves | Notes |
|:---|:---|:---|:---:|:---|

PASS condition: Resolves=true for all rows.

---

## T7) DTV_EXAMPLE_VALIDITY Template
File: `outputs/<RUN_ID>__DTV_EXAMPLE_VALIDITY.md`

| Doc | Example Block ID | Declared Schema | Validates | Error (if fail) | Action |
|:---|:---|:---|:---:|:---|:---|

---

## T8) DTV_IMPLEMENTATION_REF_VALIDITY Template
File: `outputs/<RUN_ID>__DTV_IMPLEMENTATION_REF_VALIDITY.md`

| Doc | Claim | Evidence Type | Source Path / Package | Verifiable | Disclaimer Added |
|:---|:---|:---|:---|:---:|:---:|

---

## T9) REMEDIATION_LOG Template
File: `outputs/<RUN_ID>__REMEDIATION_LOG.md`

| Phase | File | Finding ID | Fix Applied | Commit | Re-run Result |
|:---|:---|:---|:---|:---|:---|

---

## T10) DOCS_GOV_FREEZE_DECLARATION Template (Gap Fix #4)
File: `outputs/<RUN_ID>__DOCS_GOV_FREEZE_DECLARATION.md`

### Required Content
- Scope table (files, directories)
- Evidence artifact inventory (with paths)
- Gate metrics: drift=0, semantic=0, pointer=100%, examples=100%
- **Delta vs previous run** (counts diff, if not first run)
- **Allowlist/Waiver** (if any tolerances applied, must log waiver_id; default: none)
- Sign-off table

### Delta Table (if applicable)
| Metric | Previous | Current | Delta | Status |
|:---|:---:|:---:|:---:|:---|
| drift | | | | |
| semantic | | | | |
| pointer | | | | |
| examples | | | | |

---

## T11) DGA_FLAGS_ENTRY_SEMANTICS Template
File: `outputs/<RUN_ID>__DGA_FLAGS_ENTRY_SEMANTICS.md`

| File | JSON-LD Present | Marketing CTA | Certification Claim | Verdict | Action |
|:---|:---:|:---:|:---:|:---|:---|

---

**Document Status**: Ready for Execution (v2.1.0)
**References**: CONST-001~006, METHOD-DGA-01, METHOD-DTAA-01, METHOD-DTV-01, SOP-DTAA-06

---

# Appendix C — Gap Fixes Applied (v2.1.0)

| Gap | Issue | Fix |
|:---|:---|:---|
| #1 | DTV assertion coverage insufficient | Expanded 3.0 to require numeric+normative+definitional |
| #2 | DGA can be evaded by narrative framing | Added 1.2.3 Subject/Action Grammar Test |
| #3 | Impl ref only verifies existence | Added Claim Types A/B/C + mandatory disclaimer |
| #4 | Freeze lacks baseline comparison | Added Delta table + Waiver registry to T10 |
