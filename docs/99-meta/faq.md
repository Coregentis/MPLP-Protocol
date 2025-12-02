---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# Frequently Asked Questions (FAQ)

## General

### What is MPLP?
MPLP (Multi-Agent Lifecycle Protocol) is an open standard that defines the lifecycle of AI agents—from planning and execution to observability and learning. It provides a vendor-neutral schema for how agents interact, ensuring interoperability and auditability.

### Is MPLP a framework like LangChain or AutoGen?
No. MPLP is a **protocol**, not a framework. It sits *underneath* frameworks. You can build an MPLP-compliant runtime using LangChain, AutoGen, or your own custom code. MPLP standardizes the *data structures* (Context, Plan, Trace) and *lifecycle events*, not the implementation logic.

### Who maintains MPLP?
MPLP is maintained by Coregentis and the open-source community. Changes are governed by the [MIP (MPLP Improvement Proposal)](../12-governance/mip-process.md) process.

## Architecture (L1-L4)

### What are the 4 Layers?
1.  **L1 Schemas**: The normative JSON Schemas defining the data structures.
2.  **L2 Modules**: The functional components (Context, Plan, Confirm, etc.).
3.  **L3 Runtime Glue**: The specifications for how a runtime should manage state (PSG) and execution.
4.  **L4 Integration**: The events and standards for connecting to IDEs and tools.

### What is the Project Semantic Graph (PSG)?
The PSG is the "brain" of an MPLP project. It projects all Context, Plans, Traces, and Events into a single queryable graph. This allows for advanced features like drift detection and impact analysis.

## SDKs & Tools

### Which SDKs are official?
Currently, the **TypeScript SDK** (`@mplp/sdk-ts`) is the Official Reference Implementation. The **Python SDK** is in Preview. Go and Java examples are provided for reference but are not yet official SDKs.

### Can I use MPLP with any LLM?
Yes. MPLP is model-agnostic. The protocol defines how to structure the *inputs* (Context) and *outputs* (Plan/Trace), but it does not dictate which model generates them.

## Governance & Compliance

### How do I ensure my agent is MPLP compliant?
1.  Validate your outputs against the **L1 Schemas**.
2.  Pass the **Golden Test Suite** flows.
3.  Adhere to the **SA (Single-Agent)** or **MAP (Multi-Agent)** Profile requirements.

### Can I modify the schemas?
Normative schemas are frozen for v1.0.0. If you need changes, please submit a MIP for a future version. You can use the `Extension` module for custom data without breaking compliance.
