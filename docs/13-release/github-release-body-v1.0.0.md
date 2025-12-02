# MPLP v1.0.0 — Frozen Open Protocol

## 1. Overview
**Multi-Agent Lifecycle Protocol (MPLP)** v1.0.0 is the first stable, frozen release of the open standard for governing agentic AI systems. It provides a vendor-neutral, schema-driven framework to replace fragile prompt engineering with robust protocol engineering.

This release marks the completion of the core specification, defining the data structures, behavioral rules, and compliance requirements for interoperable multi-agent systems.

## 2. What’s Included in v1.0

### Core Protocol (L1 & L2)
- **10 Normative Modules**: Context, Plan, Confirm, Trace, Role, Collab, Dialog, Extension, Core, Network.
- **9 Cross-Cutting Concerns**: Security, Error Handling, State Sync, etc.
- **Full JSON Schema Suite**: `schemas/v2/*.schema.json` defining the strict data shape for all protocol entities.

### Execution Profiles
- **SA Profile (Single-Agent)**: The baseline standard for autonomous task execution.
- **MAP Profile (Multi-Agent)**: Patterns for Turn-Taking, Broadcast, and Orchestrated collaboration.

### Runtime & Observability (L3)
- **Project Semantic Graph (PSG)**: Specifications for the single source of truth state model.
- **Observability**: 12 standardized event families for auditability and monitoring.

## 3. SDKs & Examples

This release includes reference implementations to help developers get started:

- **TypeScript SDK**: `@mplp/sdk-ts` (Reference Runtime)
- **Python SDK**: `mplp-sdk` (Builder & Validation patterns)
- **Examples**:
  - `examples/ts-single-agent-basic`: Complete end-to-end flow in TypeScript.
  - `examples/py-basic-flow`: SDK usage demonstration in Python.

## 4. Compliance & Testing

- **Golden Test Suite**: 9 verified workflows (FLOW-01 to FLOW-05, SA-01/02, MAP-01/02) ensuring cross-language consistency.
- **Compliance Guide**: Detailed checklist for implementers to verify runtime conformity.

## 5. Assets

- **Source Code**: Full repository access.
- **Schemas Bundle**: `schemas/v2/` directory containing all normative schemas.
- **Documentation**: Complete `docs/` hierarchy (00-13) with frozen specifications.
- **PDF Spec**: Available in the release assets.

## 6. License

**Apache License 2.0**
Copyright © 2025 邦士（北京）网络科技有限公司

---
*MPLP v1.0.0 is a frozen specification. Any normative changes will require a protocol version upgrade.*
