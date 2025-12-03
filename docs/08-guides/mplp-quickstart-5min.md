---
MPLP Protocol: v1.0.0 — Frozen Specification
Freeze Date: 2025-12-03
Status: FROZEN (no breaking changes permitted)
Governance: MPLP Protocol Governance Committee (MPGC)
Copyright: © 2025 邦士（北京）网络科技有限公司
License: Apache-2.0
Any normative change requires a new protocol version.
---

# 5-Minute Quickstart Guide

This guide will help you validate the MPLP protocol schemas and run a basic agent flow in under 5 minutes.

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **pnpm**: v8+ (or npm/yarn)

## 1. Clone & Install

```bash
git clone https://github.com/Coregentis/MPLP.git
cd MPLP/V1.0-release
pnpm install
```

## 2. Validate Protocol Schemas

Ensure that the JSON Schemas in this repository are valid and self-consistent.

```bash
# Run the schema validation suite
pnpm test
```

*Expected Output:*
```text
> mplp-protocol@1.0.0 test
> ...
> Validating schemas...
> ...
> All schemas valid.
```

## 3. Run a Golden Flow (TypeScript)

Execute the "Single Agent Basic" example using the Reference Runtime.

```bash
# Run the example script
pnpm examples:ts-single-agent
```

*What happens:*
1.  **Context** is initialized.
2.  **Plan** is created (mocked).
3.  **Trace** records the execution.
4.  **Events** are emitted to the console.

## 4. Explore the Protocol

Now that you have it running, explore the core definitions:

- **Schemas**: `schemas/v2/` (The source of truth)
- **Documentation**: `docs/00-index/mplp-v1.0-docs-map.md` (Start here)
- **SDKs**: `packages/sdk-ts` (TypeScript) or `packages/sdk-py` (Python)

## Next Steps

- Read the [Architecture Overview](../01-architecture/l1-core-protocol.md)
- Check the [SDK Support Matrix](../10-sdk/sdk-support-matrix.md)
- Review the [Golden Test Suite](../09-tests/golden-test-suite-overview.md)

## 5. Troubleshooting

### Q: `pnpm` not found?
MPLP uses `pnpm` for strict dependency management. You can install it via `npm i -g pnpm` or use `npm` (but you may need to adjust scripts).

### Q: Schema validation fails?
Ensure you are on the `release/v1.0.0` branch. If you modified schemas locally, revert changes or run `pnpm test` to see specific validation errors.

### Q: "Cannot find module" in TS examples?
Make sure you ran `pnpm install` in the root directory *and* in the example directory if it has its own `package.json`.

### Q: Where are the Python models?
They are generated in `packages/sdk-py/src/mplp_sdk/models`. If missing, run `pnpm codegen:py-models`.

### Q: How do I visualize the Trace?
MPLP Traces are JSON. You can use any JSON viewer. A dedicated "Trace Viewer" is planned for v1.1.
