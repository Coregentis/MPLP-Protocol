# MPLP — Multi-Agent Lifecycle Protocol

> **Repository Role:** Source of Truth  
> **Protocol Version:** v1.0.0 — FROZEN  
> **License:** Apache-2.0

**MPLP is a vendor-neutral lifecycle protocol for AI agent systems — defining how agents are created, operated, audited, and decommissioned.**

*Not a framework. Not a runtime. Not a platform.*

---

## Conceptual Positioning (POSIX Analogy, Informative)

MPLP uses **POSIX** as a conceptual analogy for *protocol-level interface standardization*:

- **POSIX "standard interface" → MPLP "schema-defined lifecycle interface"** (Context / Plan / Confirm / Trace)
- **POSIX contracts → MPLP module contracts & kernel duties** (invariants, failure semantics, expected signals)
- **POSIX conformance tests → MPLP Golden Flows & evidence-based verdicts** (evidence-only evaluation)
- **POSIX portability → MPLP portability across substrates** (models / frameworks / runtimes / vendors)
- **POSIX logging/debugging → MPLP Trace & Evidence Pack** (replayable, auditable artifacts)

> **Boundary:** This is an analogy for conceptual positioning only. MPLP is not POSIX, does not implement an OS or runtime, and does not make any POSIX compatibility or certification claim.

For the detailed mapping table, see the Documentation (Non-Normative): **"POSIX Analogy — Conceptual Mapping"** at [docs.mplp.io](https://docs.mplp.io).

---

## This Repository Is the Source of Truth

This repository hosts the **canonical source artifacts** of MPLP.

It is the **single authoritative location** for:

- Protocol schemas (frozen)
- Reference SDK source packages
- Golden Flow tests & cross-language validation
- Documentation source (docs.mplp.io)
- Governance constitution files
- Conformance & interoperability definitions

**This repository is not a marketing site and not a tutorial.**

---

## Four-Entry Model

MPLP uses a four-entry model. Each surface has a strict, non-overlapping role.

| Surface | Role | Purpose |
|---------|------|---------|
| **Website** | Protocol Legitimacy & Evaluation Entry | Establish MPLP as a defined, governed, evaluable protocol |
| **Documentation** | Specification & Reference | Explain how the protocol works |
| **Repository (this)** | Source of Truth | Schemas, code, tests, governance |
| **Validation Lab** | Evidence Adjudication | Evidence-based verdicts for Lifecycle Guarantees |

**Choose the correct entry:**

- 👉 **New to MPLP?** Start at **[https://www.mplp.io](https://www.mplp.io)**
- 👉 **Implementing MPLP?** Read **[https://docs.mplp.io](https://docs.mplp.io)**
- 👉 **Evaluating evidence?** See **[https://lab.mplp.io](https://lab.mplp.io)**
- 👉 **Auditing or building against MPLP?** You are in the right place

### Anchor Closure

Each entry point has stable anchors for cross-referencing:

**Website Anchors**:
- [What is MPLP?](https://www.mplp.io/definition) — Definition & disambiguation
- [Entity Card](https://www.mplp.io/assets/geo/mplp-entity.json) — Machine-readable definition
- [POSIX Analogy](https://www.mplp.io/posix-analogy) — Conceptual lens (not compatibility)

**Documentation Anchors**:
- [Entry Points Reference](https://docs.mplp.io/docs/reference/entrypoints) — Four-entry model & anchors
- [Specification](https://docs.mplp.io/docs/specification) — Normative requirements
- [Validation Lab Reference](https://docs.mplp.io/docs/evaluation/validation-lab) — Lab overview & terminology

**Repository Anchors**:
- [Schemas](./schemas/v2/) — JSON Schema definitions (authoritative)
- [Tests](./tests/golden/flows/) — Golden flows & validators
- [Entity Definition](./governance/entity/) — Canonical entity package

**Validation Lab Anchors**:
- [Lab Site](https://lab.mplp.io) — Evidence adjudication UI
- [Lab Repository](https://github.com/Coregentis/MPLP-Validation-Lab) — Lab SSOT

**Disambiguation**: MPLP = Multi-Agent Lifecycle Protocol (not a license). MPLP is not POSIX (conceptual lens only).

---

## Validation Lab (Fourth Surface)

The **Validation Lab** is the evidence adjudication projection of MPLP Protocol.

| Property | Value |
|:---|:---|
| **Role** | Evidence-based verdict generation for Lifecycle Guarantees (LG-01~05) |
| **Lab Site** | [https://lab.mplp.io](https://lab.mplp.io) |
| **Lab Repository** | [https://github.com/Coregentis/MPLP-Validation-Lab](https://github.com/Coregentis/MPLP-Validation-Lab) |

### Four Boundaries (Non-Negotiable)

1. **Non-Certifying** — Verdicts are evidence-based outputs, not official marks or endorsements
2. **Non-Normative** — Lab does not define protocol semantics; see MPLP Docs for specifications
3. **No Execution Hosting** — Lab does not accept uploads or run your code; you generate evidence locally
4. **Deterministic Ruleset** — Same evidence + same ruleset version = same verdict hash

### Authority Chain

> **Authority**: Rulesets and evidence contracts are versioned and governed in the **Validation Lab repository**; this repository only links to them.

### Terminology Partition

| Term | Definition | Owned By |
|:---|:---|:---|
| **Flow-01~05** | Protocol Test Scenarios | This repository (`tests/golden/flows/`) |
| **LG-01~05** | Lifecycle Guarantees (adjudication targets) | Validation Lab |

These are **distinct naming spaces** and should not be conflated.

---

## 4-Layer Architecture (L1–L4)

MPLP is defined as a four-layer protocol topology:

| Layer | Name | Scope |
|-------|------|-------|
| **L1** | Core Protocol (Normative) | Schemas, invariants, lifecycle primitives |
| **L2** | Coordination & Governance (Normative) | Module semantics and kernel duties |
| **L3** | Execution Runtime (Non-prescriptive) | Runtime realization (evidence-producing behaviors) |
| **L4** | Integration Layer (Optional boundary) | Governed integration boundaries with external systems |

> **Boundary:** L4 is optional and defines integration boundaries; it does not imply hosted execution, vendor endorsement, or certification.

---

## Repository Structure (High-Level)

> This is a navigation overview. The authoritative boundaries are defined by the repo contents and governance documents.

```
.
├── schemas/                  # Frozen protocol schemas (v2)
│   └── v2/                   # 10 module schemas + invariants + events
├── packages/                 # Reference SDKs
│   ├── npm/                  # TypeScript packages (@mplp/*)
│   ├── pypi/                 # Python SDK (mplp-sdk)
│   └── sources/              # SDK source code
├── tests/                    # Protocol validation suites
│   ├── golden/               # Golden Flow tests (GF + profiles)
│   ├── cross-language/       # Cross-language validation
│   ├── runtime-compat/       # Runtime compatibility tests
│   └── schema-alignment/     # Schema alignment tests
├── docs/                     # Documentation source (docs.mplp.io)
├── governance/               # Constitution & governance files
│   └── 01-constitutional/    # CONST-001 to CONST-006
├── examples/                 # Usage examples (multi-language)
├── scripts/                  # Build & validation scripts
└── assets/                   # Diagrams & brand resources
```

---

## Protocol Status

- **Protocol Version:** MPLP v1.0.0
- **Specification State:** **FROZEN** (no breaking changes permitted)
- **Schemas:** Frozen under `schemas/v2/`
- **Golden Flows:** Implemented as protocol evaluation scenarios (Core + profile flows)
- **Reference Implementations:** Partial by design (non-normative)

> **Note:** Absence of a reference SDK implementation does not imply a module is experimental.
> Protocol obligations are defined by **schemas and specifications**, not by SDK coverage.

---

## Test Suites (Protocol Validation)

MPLP provides test suites for protocol validation and interoperability evidence:

### Golden Flows (Evaluation Scenarios)

Golden Flows validate **lifecycle invariants** via replayable evidence (not via vendor endorsement).

- Core Golden Flows: `flow-01` … `flow-05`
- Profile Flows: `sa-flow-*`, `map-flow-*` (when applicable)

### Validation Suites

- **Cross-Language Tests:** Validate consistent behavior across TypeScript, Python, Go
- **Runtime Compatibility:** Ensure runtime integrations produce evaluable evidence
- **Schema Alignment:** Verify schema consistency across modules and consumers

---

## Interoperability Levels (IL1–IL3)

MPLP defines **Interoperability Levels** (not certification tiers) to describe evaluable evidence boundaries:

| Level | Name | Scope |
|-------|------|-------|
| **IL1** | Schema | Data interoperability (valid instances) |
| **IL2** | Governance | Module semantics & lifecycle interoperability |
| **IL3** | Behavioral | Runtime evidence & Golden Flow interoperability |

Any claim of "MPLP interoperability" must map to these definitions and be backed by evidence.

> **Disambiguation:** These interoperability levels (IL1–IL3) are intentionally **not** the same as the L1–L4 architecture layers.  
> **L4 (Integration Layer)** is an optional boundary layer and is not an interoperability "tier"; it scopes how external systems are integrated without leaking concerns into the core protocol.

---

## Reference SDKs (Non-Normative)

SDKs are maintained as **reference consumers** of the protocol (schemas remain authoritative).

### TypeScript Standard Library (`@mplp/*`)

Primary packages include:

| Package | Role |
|---------|------|
| `@mplp/sdk-ts` | Main developer entry |
| `@mplp/core` | Protocol primitives & types |
| `@mplp/schema` | Schema validators |
| `@mplp/coordination` | Coordination & state-machine helpers |
| `@mplp/modules` | L2 governance module helpers |
| `@mplp/conformance` | Conformance kit & validation tooling |
| `@mplp/runtime-minimal` | Minimal reference runtime (evidence producer) |
| `@mplp/devtools` | CLI & debugging tools |

> For current published versions, refer to [npm package listings](https://www.npmjs.com/org/mplp) and/or the repository's version governance records.

### Python SDK

| Package | Role |
|---------|------|
| `mplp-sdk` | Main developer entry |

> For current published version, refer to [PyPI](https://pypi.org/project/mplp-sdk/).

---

## What This Repository Does NOT Do

To maintain strict boundaries, this repository does **not**:

- Provide marketing or positioning narratives (use the Website)
- Replace the official documentation site (use Documentation)
- Offer certification or compliance guarantees
- Endorse vendors, runtimes, or agent frameworks
- Act as a tutorial or learning platform

---

## Documentation

The official documentation is built from `/docs` and published at:

👉 **[https://docs.mplp.io](https://docs.mplp.io)**

Documentation includes:

- Architecture (L1–L4)
- All L2 modules (Context, Plan, Confirm, Trace, Role, Dialog, Collab, Extension, Core, Network)
- Golden Flows (evaluation scenarios)
- Standards mappings (ISO / NIST / W3C — informative only)
- Governance, versioning, and change control
- POSIX analogy mapping (informative / non-normative)

---

## Governance

- **Protocol Governance:** MPGC (MPLP Protocol Governance Committee)
- **Constitution Files:** Located in `governance/01-constitutional/`
  - `CONST-001` — Entry Model Specification
  - `CONST-002` — Document Format Specification
  - `CONST-003` — Frozen Header Specification
  - `CONST-004` — Doc Audit Methodology
  - `CONST-005` — Authoring Constitution
  - `CONST-006` — Document Type Outlines & Depth Rules

Any change that affects schemas or protocol semantics follows the MPGC process.

---

## Contributing

This repository accepts contributions within defined governance boundaries.

Before proposing changes, review the constitution files in `governance/01-constitutional/`.

Pull requests that introduce new protocol semantics, schema changes, or compliance/certification claims will be reviewed under MPGC governance.

---

## License

Apache License 2.0  
© 2026 Bangshi Beijing Network Technology Limited Company

---

## Final Note

If you are reading this README expecting a tutorial or a sales pitch,
**you are intentionally in the wrong place**.

This repository exists to ensure that:

> **MPLP remains observable, governed, and vendor-neutral at the protocol level.**