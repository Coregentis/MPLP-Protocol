# CONST-006: Doc Type Outlines & Depth Rules

> **Constitutional Specification**
>
> Version: 1.0.0
> Status: FROZEN
> Authority: MPGC
> Effective: 2026-01-05

---

## 0. Purpose

This document defines **what each document type must and must not contain**, ensuring that documentation remains within its designated epistemic and entry boundaries.

> **CONST-006 addresses the "how to write" dimension that CONST-005 (Authoring Constitution) does not cover.**

---

## 1. Layered Knowledge Boundary

Each MPLP architecture layer has a defined knowledge scope. Documentation at each layer must not exceed its boundary.

### 1.1 Layer Definitions

| Layer | Knowledge Scope | May Describe | Must Not Describe |
|:---|:---|:---|:---|
| **L1 Core Protocol** | Protocol ontology | What MPLP is, schema inventory, boundaries, non-goals | Runtime behavior, implementation, SDK APIs |
| **L2 Coordination** | Behavioral semantics | Lifecycles, state machines, invariants, profiles | Execution algorithms, storage, performance |
| **L3 Execution** | Runtime abstraction | AEL/VSL interfaces, orchestration patterns | Vendor implementations, specific runtimes |
| **L4 Integration** | External boundaries | Integration event schemas, adapter contracts | IDE specifics, CI/CD product details |

### 1.2 Boundary Violation Test

> **A document violates its layer boundary if it:**
> - Describes behavior that belongs to a lower layer
> - Prescribes implementation that belongs to L3/L4
> - Makes capability claims that belong to Website

---

## 2. Doc Type Outlines

### 2.1 L1 Core Protocol Documents

**Purpose**: Define what MPLP is at the protocol level.

#### Mandatory Sections
1. **Scope** — What this document covers
2. **Non-Goals** — What this document explicitly excludes
3. **Protocol Ontology** — What MPLP defines/constrains
4. **Schema Inventory** — Pointers to relevant schemas
5. **Layer Boundaries** — How L1 relates to L2/L3/L4

#### Allowed Content
- Declarative statements about protocol existence
- Schema structure descriptions (with pointers)
- Boundary statements ("L1 does not define...")
- Non-goals and exclusions

#### Forbidden Content (regardless of wording)
- Runtime behavior descriptions ("the system runs/executes...")
- SDK API references ("use @mplp/sdk-ts to...")
- Implementation recommendations ("we recommend...")
- Performance characteristics
- Step-by-step implementation guides
- Capability marketing ("MPLP provides/enables...")

#### Allowed Verbs
- defines, constrains, scopes, excludes, distinguishes, specifies

#### Forbidden Verbs
- runs, executes, implements, guarantees, ensures, validates, enforces

---

### 2.2 L2 Coordination Documents

**Purpose**: Define behavioral semantics and coordination patterns.

#### Mandatory Sections
1. **Scope**
2. **Non-Goals**
3. **State Machine / Lifecycle** — Status enums, transitions
4. **Invariants** — With pointers to invariant files
5. **Module Interactions** — Cross-module dependencies
6. **Profile Requirements** — SA/MAP if applicable

#### Allowed Content
- State machine definitions
- Transition rules
- Invariant references (with pointers)
- Module interaction diagrams
- Profile-specific requirements

#### Forbidden Content
- Execution algorithms ("how to implement the state machine")
- Storage mechanisms
- Performance tuning
- SDK code examples (unless clearly marked non-normative)

---

### 2.3 L3 Execution Documents

**Purpose**: Define runtime abstraction interfaces.

#### Mandatory Sections
1. **Scope**
2. **Non-Goals**
3. **Interface Definitions** — AEL, VSL, Orchestrator
4. **Extension Points**
5. **Reference Implementation Notes** (informative only)

#### Allowed Content
- Interface contracts (get/set, execute)
- Extension mechanisms
- Reference implementation descriptions (marked informative)

#### Forbidden Content
- Vendor-specific implementations
- "Best" runtime recommendations
- Production deployment guides

---

### 2.4 Module Specification Documents

**Purpose**: Define individual module schema and lifecycle.

#### Mandatory Sections
1. **Scope**
2. **Non-Goals**
3. **Schema Reference** — Pointer to schema file
4. **Field Definitions** — Schema-derived restatement
5. **Lifecycle / Status Enum**
6. **Constraints / Invariants**
7. **Module Interactions** — Dependencies on other modules

#### Allowed Content
- Schema field descriptions (restated, not invented)
- Status enum values (from schema)
- Invariant references
- Module dependency statements

#### Forbidden Content
- New field definitions not in schema
- Implementation-specific behavior
- "Best practices" as obligations

---

### 2.5 Golden Flow Documents

**Purpose**: Define evaluation flows for conformance testing.

#### Mandatory Sections
1. **Scope** — This is evaluation, not protocol definition
2. **Non-Goals** — Evaluation ≠ protocol obligation
3. **Flow Steps** — Numbered sequence
4. **Evidence Requirements** — What must be captured
5. **Verdict Semantics** — PASS/FAIL meanings
6. **Non-Endorsement Block**

#### Allowed Content
- Evaluation methodology
- Evidence format requirements
- PASS/FAIL criteria

#### Forbidden Content
- "Passing this flow means MPLP compliant"
- Certification language
- Protocol obligations disguised as evaluation rules

---

### 2.6 Governance Documents

**Purpose**: Define governance processes and constitutional rules.

#### Mandatory Sections
1. **Authority** — MPGC
2. **Scope**
3. **Rules / Procedures**
4. **Amendment Process**

#### Allowed Content
- Process definitions
- Role definitions
- Amendment rules

#### Forbidden Content
- Technical implementation details (must reference repo/schema)
- New protocol semantics

---

## 3. Entry Surface Contracts

Each entry surface has a specific purpose. Content must match.

### 3.1 Contract-DOC (Documentation)

| Dimension | Requirement |
|:---|:---|
| **Primary Purpose** | Specification, reference, explanation |
| **Truth Claim Type** | Derived from schema/repo |
| **Allowed Narrative** | Descriptive, boundary-defining |
| **Forbidden Narrative** | Capability marketing, positioning, endorsement |

### 3.2 Contract-WEB (Website)

| Dimension | Requirement |
|:---|:---|
| **Primary Purpose** | Discovery, positioning |
| **Truth Claim Type** | Positioning claims allowed |
| **Allowed Narrative** | Market positioning, value proposition |
| **Forbidden Narrative** | Normative definitions, implementation details |

### 3.3 Contract-REPO (Repository)

| Dimension | Requirement |
|:---|:---|
| **Primary Purpose** | Source of truth |
| **Truth Claim Type** | Primary truth |
| **Allowed Narrative** | Code, schemas, tests |
| **Forbidden Narrative** | Prose rewriting of schema semantics |

---

## 4. Narrative Drift Fingerprints

### 4.1 Drift-F1: Implementation Prescription

**Pattern**: Document becomes a "how to build" guide instead of "what the protocol is".

**Signals**:
- Chapter structure dominated by Step 1/2/3
- System architecture diagrams (not schema/flow diagrams)
- Chapter titles: "Architecture / Deployment / Runtime"

**Verdict**: MOVE to guides/ or REMOVE

---

### 4.2 Drift-F2: Capability Packaging

**Pattern**: Document reads like product documentation ("what you get").

**Signals**:
- "Features / Benefits / What you get" sections
- Missing Non-Goals
- Schema pointers present but decorative

**Verdict**: MOVE to Website or REMOVE

---

### 4.3 Drift-F3: Endorsement Drift

**Pattern**: Evaluation becomes certification.

**Signals**:
- Ranking, tiers, recommended stacks
- "Must pass to be conformant" (evaluation ≠ protocol)

**Verdict**: REWORD with strict non-endorsement

---

### 4.4 Drift-F4: Authority Inversion

**Pattern**: Docs prose becomes the definition, not schema.

**Signals**:
- Key definitions in prose, not schema
- Pointer exists but prose adds new semantics

**Verdict**: REWORD to strict restatement

---

## 5. Enforcement

### 5.1 Audit Method

This Constitution is enforced via **METHOD-DGA-01** (Docs Narrative & Entry Alignment Audit).

### 5.2 Relationship to DTAA

| Concern | Governed By |
|:---|:---|
| No new semantics | DTAA (CONST-005) |
| Correct layer/entry | DGA (CONST-006) |
| Evidence binding | DTV (METHOD-DTV-01) |

---

## Document Status

| Property | Value |
|:---|:---|
| Document Type | Constitutional Specification |
| Status | FROZEN |
| Supersedes | None |
| References | CONST-001, CONST-005, METHOD-DGA-01 |

---

**© 2026 MPGC — MPLP Protocol Governance Committee**
