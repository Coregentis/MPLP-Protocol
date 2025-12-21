# MPLP — Multi-Agent Lifecycle Protocol

**The Agent OS Protocol**

> **Status**: Protocol v1.0.0 — FROZEN
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0

---

## What This Repository Is

This repository hosts the **canonical source artifacts** of the
**MPLP (Multi-Agent Lifecycle Protocol)**.

It is the **single authoritative location** for:

* Protocol schemas (frozen)
* Reference SDK source packages
* Cross-language and Golden Flow tests
* Documentation source (docs.mplp.io)
* Governance and change-control records

This repository is **not** a marketing site and **not** a tutorial blog.

---

## Entry Model (Read This First)

MPLP uses a **three-entry model**. Each surface has a strict role.

| Surface               | Role                      | Purpose                          |
| --------------------- | ------------------------- | -------------------------------- |
| **Website**           | Discovery & Positioning   | What MPLP is and why it exists   |
| **Documentation**     | Specification & Reference | How the protocol works           |
| **Repository (this)** | Source of Truth           | Schemas, code, tests, governance |

**Choose the correct entry:**

* 👉 **New to MPLP?** Start at **[https://www.mplp.io](https://www.mplp.io)**
* 👉 **Implementing MPLP?** Read **[https://docs.mplp.io](https://docs.mplp.io)**
* 👉 **Auditing or building against MPLP?** You are in the right place

---

## Repository Structure

```
.
├── docs/                 # Documentation source (docs.mplp.io)
├── docs-governance/      # Documentation governance & standards
├── website-governance/   # Website governance & claim boundaries
├── schemas/              # Frozen protocol schemas (L1/L2)
├── packages/             # Reference SDKs (TypeScript / Python)
├── examples/             # Usage examples (non-normative)
├── tests/                # Golden Flows, cross-language & invariant tests
├── reports/              # CEAP / audit / alignment reports
└── tools/                # Linting, audit, and governance tooling
```

---

## Protocol Status

* **Protocol Version**: MPLP v1.0.0
* **Specification State**: **FROZEN** (no breaking changes permitted)
* **Schemas**: Frozen under `schemas/v2/`
* **Golden Flows**: GF-01 → GF-05 verified via cross-language tests
* **Reference Implementations**: Partial by design (non-normative)

> **Important**
> Absence of a reference SDK implementation **does not imply** a module is experimental.
> Protocol obligations are defined by schemas and specifications, not by SDK coverage.

---

## 📦 Reference SDKs

The following SDKs are maintained in this repository as **Reference Implementations** of the protocol.

### TypeScript Standard Library (`@mplp/*`)

| Package | Description | Version | Links |
| :--- | :--- | :--- | :--- |
| **`@mplp/sdk-ts`** | **Main Entry Point** (Developer SDK) | `v1.0.5` | [**npm**](https://www.npmjs.com/package/@mplp/sdk-ts) |
| `@mplp/core` | L1 Protocol Primitives & Types | `v1.0.5` | [npm](https://www.npmjs.com/package/@mplp/core) |
| `@mplp/schema` | JSON Schema Validators | `v1.0.5` | [npm](https://www.npmjs.com/package/@mplp/schema) |
| `@mplp/coordination` | L2 Coordination & State Machine | `v1.0.5` | [npm](https://www.npmjs.com/package/@mplp/coordination) |
| `@mplp/modules` | L2 Governance Modules | `v1.0.5` | [npm](https://www.npmjs.com/package/@mplp/modules) |
| `@mplp/compliance` | Compliance & Audit Tools | `v1.0.5` | [npm](https://www.npmjs.com/package/@mplp/compliance) |
| `@mplp/runtime-minimal` | Reference Runtime Implementation | `v1.0.5` | [npm](https://www.npmjs.com/package/@mplp/runtime-minimal) |
| `@mplp/devtools` | CLI & Debugging Tools | `v1.0.5` | [npm](https://www.npmjs.com/package/@mplp/devtools) |
| `@mplp/integration-llm-http` | HTTP LLM Client Adapter | `v1.0.5` | [npm](https://www.npmjs.com/package/@mplp/integration-llm-http) |
| `@mplp/integration-storage-fs` | File System Storage Adapter | `v1.0.5` | [npm](https://www.npmjs.com/package/@mplp/integration-storage-fs) |
| `@mplp/integration-storage-kv` | Key-Value Storage Adapter | `v1.0.5` | [npm](https://www.npmjs.com/package/@mplp/integration-storage-kv) |
| `@mplp/integration-tools-generic` | Generic Tool Executor | `v1.0.5` | [npm](https://www.npmjs.com/package/@mplp/integration-tools-generic) |

### Python SDK

| Package | Description | Version | Links |
| :--- | :--- | :--- | :--- |
| **`mplp-sdk`** | **Main Entry Point** (Developer SDK) | `v1.0.3` | [**PyPI**](https://pypi.org/project/mplp-sdk/) |

---

## What This Repository Does NOT Do

To avoid ambiguity and scope drift, this repository **explicitly does not**:

* ❌ Provide marketing or positioning narratives
* ❌ Replace the official documentation site
* ❌ Offer certification or compliance guarantees
* ❌ Endorse vendors, runtimes, or agent frameworks
* ❌ Act as a tutorial or learning platform

---

## Documentation

The official documentation is built from `/docs` and published at:

👉 **[https://docs.mplp.io](https://docs.mplp.io)**

Documentation includes:

* Architecture (L1–L4)
* All L2 modules (Context, Plan, Confirm, Trace, Role, Dialog, Collab, Extension, Core, Network)
* Golden Flows (normative validation scenarios)
* Standards mappings (ISO / NIST / W3C — informative only)
* Governance, versioning, and change control

---

## Governance & Change Control

* **Protocol Governance**: MPGC
* **Documentation Governance**: Defined under `docs-governance/`
* **Website Claim Governance**: Defined under `website-governance/`

Any change that affects:

* normative obligations
* schemas
* protocol semantics

**must** follow the MPGC process.

---

## Contributing

This repository accepts contributions **only** within defined governance boundaries.

Before proposing changes, review:

* `docs-governance/`
* `website-governance/`
* Contribution and MIP processes (if applicable)

Pull requests that introduce:

* new protocol semantics
* schema changes
* compliance claims

**will be rejected without governance approval.**

---

## License

Apache License 2.0
© 2025 Bangshi Beijing Network Technology Limited Company

---

### Final Note

If you are reading this README expecting a tutorial or a sales pitch,
**you are intentionally in the wrong place**.

This repository exists to ensure that:

> **MPLP remains observable, governed, and vendor-neutral at the protocol level.**
