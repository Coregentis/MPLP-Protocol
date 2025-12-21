# Docs Usage Boundary

This documentation site is part of the MPLP ecosystem and is governed
by the MPLP Documentation Reconstruction Ledger.

## What This Site Is

- A technical reference for the MPLP protocol
- An implementation guide for runtimes, agents, and tools
- A source of self-verification procedures (conformance checklists, test flows)
- An informative explanation of protocol mechanisms and execution models

## What This Site Is Not

This site does **not**:
- Standards relationships (ISO, NIST, etc.)
- Enterprise evaluation and adoption signals

Any document that appears to cross these boundaries
must be revised or removed.

---

## Normative vs Informative Classification

| Directory | Default Classification | Notes |
|:---|:---|:---|
| `01-architecture/*` | **Normative** | Protocol structure definition |
| `02-modules/*` | **Normative** | Module specifications |
| `03-profiles/*` | **Normative** | Profile requirements |
| `04-observability/*` | **Normative** | Event and trace formats |
| `05-learning/*` | **Informative** | Educational content |
| `06-runtime/*` | **Normative** | Execution layer specs |
| `07-integration/*` | **Normative** | Integration requirements |
| `08-guides/*` | **Informative** | Implementation guidance |
| `09-tests/*` | **Normative** | Test specifications |
| `10-sdk/*` | **Informative** | SDK guides (not protocol) |
| `11-examples/*` | **Informative** | Example code |
| `12-governance/*` | **Governance** | Process documents |
| `13-release/*` | **Governance** | Release artifacts |

> [!NOTE]
> **Labels do not alter protocol obligations.**
> Classification indicates citation authority, not compliance requirements.

---

## Non-Goals (Out of Scope)

The MPLP protocol explicitly does **not** define:

- **Optimization strategies** — Runtime performance tuning is implementation-defined
- **Resource allocation policies** — Memory, CPU, network management is out of scope
- **Efficiency benchmarks** — No protocol-level performance requirements exist

> [!NOTE]
> **Optimization strategies remain implementation-defined.**
> MPLP specifies behavior correctness, not performance characteristics.
