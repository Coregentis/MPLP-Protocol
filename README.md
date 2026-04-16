# MPLP — Multi-Agent Lifecycle Protocol

> **Repository Role:** Source of Truth  
> **protocol_version:** `1.0.0` — FROZEN  
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

For the detailed mapping table, see the Documentation (Non-Normative): **"POSIX Analogy — Conceptual Mapping"** at [docs.mplp.io](https://docs.mplp.io/docs/introduction/posix-analogy-mapping).

---

## This Repository Is the Source of Truth

This repository hosts the **canonical source artifacts** of MPLP.

MPLP is publicly presented through four official surfaces under a 3+1 constitutional entry model.

The Repository is the **only authoritative truth source** for:

- protocol definitions
- schema truth
- invariant truth
- governance source records

Other official MPLP surfaces exist with bounded roles:

- **Documentation** projects and explains protocol/reference material
- **Website** provides discovery and public framing
- **Validation Lab** adjudicates evidence within its bounded Lab scope

Repository truth plus Documentation reference together form the active
authoritative documentation chain for MPLP. Website and Validation Lab remain
bounded outward-facing projection surfaces.

Historical, archived, or generated materials in this repository are not part of
the active truth chain unless they are explicitly cited as current source
records.

**This repository is not a marketing site and not a tutorial.**
It is also not the primary place for package-specific implementation guidance or
current release walkthroughs.

Downstream-driven candidate tracking, when present, lives under
`governance/backlog/` as non-normative governance only.
Those backlog files do not alter frozen protocol core truth.
Downstream candidate-only closure records may also be recorded under
`governance/backlog/` and `governance/releases/` as non-normative governance
only; they do not imply schema change, package change, or protocol promotion.

## Version Semantics

MPLP uses version domains rather than a single undifferentiated version label.

Canonical version meanings are defined in:

- [`governance/05-versioning/VERSION-TAXONOMY-MANIFEST.md`](./governance/05-versioning/VERSION-TAXONOMY-MANIFEST.md)
- [`governance/05-versioning/version-taxonomy-manifest.json`](./governance/05-versioning/version-taxonomy-manifest.json)

In repository-facing documentation:

- protocol changes are identified by `protocol_version`
- schema and invariant bundle changes are identified by `schema_bundle_version` and `invariant_bundle_version`
- Validation Lab release identity and adjudication rulesets are versioned separately as `validation_lab_release_version` and `validation_ruleset_version`
- website, documentation, and SDK release identities are versioned independently of `protocol_version`
- `VERSION.txt` remains a repository convenience marker for the frozen protocol
  line; it does not replace explicit version-domain meaning in outward-facing
  release language
- the root workspace `package.json` version is a private workspace/tooling
  marker, not a canonical public version domain

Directory labels such as `schemas/v2/` remain valid path names, but they do not by themselves replace explicit version-domain meaning.

---

## Public-Facing Surfaces

MPLP uses a **3+1 constitutional entry model** and exposes **four public-facing surfaces**.

| Surface | Constitutional Class | Role | Purpose |
|---------|----------------------|------|---------|
| **Website** | Primary | Discovery & Positioning | Establish MPLP's public framing and discovery path |
| **Documentation** | Primary | Specification & Reference | Explain how the protocol works and project normative requirements |
| **Validation Lab** | Auxiliary | Evidence Adjudication | Evidence-based verdicts under versioned Lab rulesets |
| **Repository (this)** | Primary | Source of Truth | Schemas, code, tests, governance sources |

Validation Lab is a public-facing surface, but it is **not** a protocol-defining primary surface.
The Repository alone remains authoritative for protocol truth; the other three
surfaces are official MPLP surfaces with bounded roles.

**Choose the correct entry:**

- 👉 **New to MPLP?** Start at **[https://www.mplp.io/what-is-mplp](https://www.mplp.io/what-is-mplp)**
- 👉 **Implementing MPLP?** Read **[https://docs.mplp.io/docs/reference/entrypoints](https://docs.mplp.io/docs/reference/entrypoints)**
- 👉 **Evaluating evidence?** See **[https://lab.mplp.io](https://lab.mplp.io)**
- 👉 **Auditing or building against MPLP?** You are in the right place

### Anchor Closure

Each public-facing surface has stable anchors for cross-referencing:

**Website Anchors**:
- [What is MPLP?](https://www.mplp.io/what-is-mplp) — Definition & disambiguation
- [Entity Card](https://www.mplp.io/assets/geo/mplp-entity.json) — Machine-readable definition
- [POSIX Analogy](https://www.mplp.io/posix-analogy) — Conceptual lens (not compatibility)

**Documentation Anchors**:
- [Entry Points Reference](https://docs.mplp.io/docs/reference/entrypoints) — 3+1 constitutional model, four public-facing surfaces, and anchors
- [Specification](https://docs.mplp.io/docs/specification) — Normative requirements
- [Validation Lab Reference](https://docs.mplp.io/docs/evaluation/validation-lab) — Lab overview & terminology

**Validation Lab Anchors**:
- [Lab Site](https://lab.mplp.io) — Evidence adjudication UI
- [Coregentis/MPLP-Validation-Lab](https://github.com/Coregentis/MPLP-Validation-Lab) — Separate Validation Lab release-line repository

**Repository Anchors**:
- [Schemas](./schemas/v2/) — Repository truth-source anchor for JSON Schema definitions
- [Tests](./tests/golden/flows/) — Golden flows & validators
- [Entity Definition](./governance/05-specialized/entity.json) — Canonical machine-readable entity package

**Disambiguation**: MPLP = Multi-Agent Lifecycle Protocol (not a license). MPLP is not POSIX (conceptual lens only).

---

## Validation Lab (Auxiliary Public-Facing Surface)

The **Validation Lab** is a public-facing auxiliary surface for evidence adjudication under MPLP's 3+1 constitutional entry model.

Validation Lab does not define protocol truth; protocol truth remains anchored in repository-backed schemas and invariants.

| Property | Value |
|:---|:---|
| **Constitutional Class** | Auxiliary |
| **Role** | Evidence-based adjudication under versioned Lab rulesets |
| **Lab Site** | [https://lab.mplp.io](https://lab.mplp.io) |
| **Lab Repository** | [Coregentis/MPLP-Validation-Lab](https://github.com/Coregentis/MPLP-Validation-Lab) |

### Four Boundaries (Non-Negotiable)

1. **Non-Certifying** — Verdicts are evidence-based outputs, not official marks or endorsements
2. **Non-Normative** — Lab does not define protocol semantics; see MPLP Docs for specifications
3. **No Execution Hosting** — Lab does not accept uploads or run your code; you generate evidence locally
4. **Deterministic Ruleset** — Same evidence + same `validation_ruleset_version` = same verdict hash

### Bounded Governance Chain

> **Bounded Role**: Validation Lab rulesets, contract surfaces, and evidence
> adjudication assets are governed in the separate release-line repository
> [Coregentis/MPLP-Validation-Lab](https://github.com/Coregentis/MPLP-Validation-Lab)
> and exposed publicly via [https://lab.mplp.io](https://lab.mplp.io). The root
> MPLP protocol repository links to that Lab surface but does not host it as an
> in-repository public source surface. This bounded Lab role does not supersede
> repository authority on protocol truth, schema truth, or invariant truth.

### Terminology Partition

| Term | Definition | Owned By |
|:---|:---|:---|
| **Flow-01~05** | Protocol Test Scenarios | This repository (`tests/golden/flows/`) |
| **LG-01~05** | Legacy V1 guarantee line (Lab adjudication targets) | Validation Lab |
| **V2 Clause IDs** | V2 clause-bundle adjudication identifiers | Validation Lab |

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

> This is a navigation overview. Source-of-truth boundaries are defined by the repository contents and governance documents.

```
.
├── schemas/                  # Frozen protocol schemas (v2)
│   └── v2/                   # 10 module schemas + invariants + events
├── packages/                 # Published package surfaces and source mirrors
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

- **protocol_version:** `1.0.0`
- **Specification State:** **FROZEN** (no breaking changes permitted)
- **Schemas:** Frozen under `schemas/v2/`
- **Golden Flows:** Implemented as protocol evaluation scenarios (Core + profile flows)
- **Published package surfaces / reference consumers:** Partial by design (non-normative)

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

## Published SDK Package Surfaces (Non-Normative)

Published SDK packages are maintained as **protocol consumers** of the schemas and governance baseline (schemas remain authoritative).

### TypeScript Standard Library (`@mplp/*`)

Primary packages include:

| Package | Role |
|---------|------|
| `@mplp/sdk-ts` | Public TypeScript facade helper package |
| `@mplp/core` | Derived core helper package |
| `@mplp/schema` | Public schema/data mirror package |
| `@mplp/coordination` | Derived coordination helper package |
| `@mplp/modules` | Module helper package |
| `@mplp/conformance` | Public compatibility alias for conformance tooling |
| `@mplp/runtime-minimal` | Public minimal runtime helper package |
| `@mplp/devtools` | Developer-tooling convenience package |

> For published `sdk_version` values, refer to [npm package listings](https://www.npmjs.com/org/mplp) and/or the repository's version governance records.

### Python SDK

| Package | Role |
|---------|------|
| `mplp-sdk` | Published Python protocol helper package surface |

> For published `sdk_version` values, refer to [PyPI](https://pypi.org/project/mplp-sdk/).

### SDK Package Surface Boundaries

- `packages/sources/*` are source-side SDK package mirrors used for build and release preparation. They are not protocol truth surfaces and are not the public publish set.
- `packages/npm/*` and `packages/pypi/*` are the public publish surfaces for npm and PyPI.
- `@mplp/sdk-ts` is the public TypeScript facade package; `@mplp/runtime-minimal` is the separate public runtime package.
- `mplp-sdk` currently ships a minimal Python protocol helper surface (`mplp.__version__`, `mplp.MPLP_PROTOCOL_VERSION`, and Kernel Duty exports) and does not yet ship a full Python SDK/runtime implementation.
- `@mplp/schema` carries the canonical public package mirror of the Kernel Duty baseline.
- `@mplp/sdk-ts` and `mplp-sdk` expose consumer-facing Kernel Duty exports derived from that baseline.
- The canonical upstream 11-duty baseline remains in:
  - [`schemas/v2/taxonomy/kernel-duties.yaml`](./schemas/v2/taxonomy/kernel-duties.yaml)
- Public package mirror artifacts include:
  - [`packages/npm/schema/schemas/kernel-duties.json`](./packages/npm/schema/schemas/kernel-duties.json)

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
