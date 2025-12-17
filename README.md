<div align="center">

<img src="assets/readme-banner.svg" width="100%" />

</div>

<br>

<div align="center">

# <span style="color:#1A73E8">**Multi-Agent Lifecycle Protocol (MPLP)**</span>

## <span style="color:#1A73E8">**The Agent OS Protocol**</span>

### **The Lifecycle Protocol for AI Agents**

### **Observable. Governed. Vendor-neutral.**

</div>

<br>

<p align="center">
  <img src="https://img.shields.io/badge/Protocol-v1.0.0(FROZEN)-1A73E8?style=flat-square" />
  <img src="https://img.shields.io/badge/License-Apache 2.0-43A047?style=flat-square" />
</p>

---

## Official Entry Points

| Resource | URL |
|:---------|:----|
| 🌐 **Website** | https://mplp.io |
| 📘 **Documentation** | https://docs.mplp.io |
| 🧪 **Golden Flows & Conformance** | https://docs.mplp.io/tests/golden-test-suite-overview |
| 📦 **NPM** | https://www.npmjs.com/org/mplp |
| 🐍 **PyPI** | https://pypi.org/project/mplp-sdk/ |
| 📂 **GitHub Pages (mirror)** | https://coregentis.github.io/MPLP-Protocol/ |

---

<div align="center">

Frameworks help you **build** agents.  
Protocols ensure agents **work together safely and consistently**.

If HTTP is how **documents** travel across the internet,  
**MPLP is how *work* travels between agents.**

</div>

> **Normative Truth Boundary**
>
> This README is **informative only**.  
> All normative definitions, invariants, and compliance rules live exclusively in:
>
> • Schemas  
> • Invariants  
> • Golden Flows  
> • Normative documentation on https://docs.mplp.io
>
> This file introduces MPLP — it does not define protocol constraints.

---

# Quickstart — Implement & Validate MPLP in 10 Minutes

### Step 1 — Install SDK

```bash
# TypeScript
npm install @mplp/sdk-ts

# Python
pip install mplp-sdk
```

### Step 2 — Run a Minimal Example

Emit your first Trace event:  
→ https://docs.mplp.io/examples

### Step 3 — Validate with Golden Flows

Validate your implementation against official Golden Flows:  
→ https://docs.mplp.io/tests/golden-test-suite-overview

---

# What Is MPLP?

MPLP is the **lifecycle protocol for multi-agent AI systems** — the OS-level contract that defines how agents plan, coordinate, execute, and learn.

A real Agent OS must define:

**Lifecycle • Governance • State • Observability**

Frameworks ≠ OS. Runtimes ≠ OS.  
**Only a protocol can define the OS layer.**

---

# MPLP Architecture (L1 → L4)

<div align="center">
<img src="assets/architecture-diagram.svg" width="100%" />
</div>

| Layer | Name | Description |
|:------|:-----|:------------|
| **L1** | Core Protocol | Schemas, invariants, event families |
| **L2** | Coordination & Governance | 10 modules + 11 kernel duties |
| **L3** | Execution Runtime | PSG, AEL, VSL, orchestration |
| **L4** | Integration Layer | Git/CI, tools, adapters |

→ Full architecture details: https://docs.mplp.io/architecture

---

# The 10 Modules

| Module | Description |
|:-------|:------------|
| **Context** | Initialize lifecycle constraints & objectives |
| **Plan** | Deterministic reasoning & orchestration intent |
| **Confirm** | Governance, permissions, risk scoring |
| **Trace** | Replayable reasoning & action audit |
| **Role** | Persona & capability definitions |
| **Dialog** | Structured reasoning boundaries |
| **Collab** | Multi-agent workflow semantics |
| **Extension** | Safe extensibility model |
| **Core** | Identity, invariants, protocol constants |
| **Network** | External IO under protocol semantics |

→ Module details: https://docs.mplp.io/modules

---

# Execution Profiles

| Profile | Purpose |
|:--------|:--------|
| **SA** | Deterministic single agent |
| **MAP** | Governed multi-agent collaboration |

→ Profile specifications: https://docs.mplp.io/profiles

---

# Conformance

Full MPLP conformance is defined by the official Compliance Checklist and Golden Flows:

→ **Compliance Checklist**: https://docs.mplp.io/guides/mplp-v1.0-compliance-checklist  
→ **Golden Flows**: https://docs.mplp.io/tests/golden-test-suite-overview

---

# SDKs & Packages

### Recommended Entry SDKs

| Package | Language | Description |
|:--------|:---------|:------------|
| `@mplp/sdk-ts` | TypeScript | Canonical TypeScript entry |
| `mplp-sdk` | Python | Canonical Python entry |

Other packages (`@mplp/core`, `@mplp/schema`, `@mplp/modules`, etc.) are internal modular components used by runtimes and reference implementations.

→ SDK documentation: https://docs.mplp.io/sdk

---

# Protocol Status & Governance

| Property | Value |
|:---------|:------|
| **Version** | v1.0.0 (FROZEN) |
| **Governance** | MPLP Protocol Governance Committee (MPGC) |
| **License** | Apache-2.0 |

Any normative breaking change requires a new protocol version.

---

# Documentation vs Specification

| Resource | Role |
|:---------|:-----|
| `README.md` | Project introduction & entry point |
| `docs.mplp.io` | Normative protocol documentation |
| `schemas / invariants / golden-flows` | Executable truth |

**If you are implementing or validating MPLP, docs.mplp.io is the authoritative source.**

---

# Contributing

Contributions are welcome.  
Please see `CONTRIBUTING.md` for submission process and coding standards.

---

# License & Copyright

This project is licensed under the **Apache License, Version 2.0**.  
You may obtain a copy of the License at:

> http://www.apache.org/licenses/LICENSE-2.0

**Copyright © 2025 Bangshi Beijing Network Technology Limited Company.**  
Governed by MPLP Protocol Governance Committee. Licensed under Apache 2.0.
