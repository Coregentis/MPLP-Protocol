# Repo-Docs-Code Alignment Index

> **Status**: Normative | FROZEN
> **Compliance**: ✅ THREE-ENTRY COMPLIANT
> **Version**: 1.0.0
> **Last Updated**: 2025-12-21

This document maps every **Docs specification claim** to its corresponding **repository artifact** (Schema, Package, or Test). This ensures that the Documentation site is not "documentation-only" but is verifiable against the actual codebase.

---

## 1. L2 Module Specifications → Schemas

Each L2 Module documented in `docs/docs/02-modules/` MUST have a corresponding JSON Schema.

| Module | Docs Page | Schema Path | Status |
|:-------|:----------|:------------|:-------|
| **Context** | `/docs/modules/context-module` | `schemas/v2/mplp-context.schema.json` | ✅ Aligned |
| **Plan** | `/docs/modules/plan-module` | `schemas/v2/mplp-plan.schema.json` | ✅ Aligned |
| **Confirm** | `/docs/modules/confirm-module` | `schemas/v2/mplp-confirm.schema.json` | ✅ Aligned |
| **Trace** | `/docs/modules/trace-module` | `schemas/v2/mplp-trace.schema.json` | ✅ Aligned |
| **Role** | `/docs/modules/role-module` | `schemas/v2/mplp-role.schema.json` | ✅ Aligned |
| **Dialog** | `/docs/modules/dialog-module` | `schemas/v2/mplp-dialog.schema.json` | ✅ Aligned |
| **Collab** | `/docs/modules/collab-module` | `schemas/v2/mplp-collab.schema.json` | ✅ Aligned |
| **Extension** | `/docs/modules/extension-module` | `schemas/v2/mplp-extension.schema.json` | ✅ Aligned |
| **Core** | `/docs/modules/core-module` | `schemas/v2/mplp-core.schema.json` | ✅ Aligned |
| **Network** | `/docs/modules/network-module` | `schemas/v2/mplp-network.schema.json` | ✅ Aligned |

---

## 2. L3 Runtime → Packages

| Runtime Component | Docs Page | Package Path | Status |
|:------------------|:----------|:-------------|:-------|
| **AEL (Action Execution Layer)** | `/docs/runtime/runtime-glue-overview` | `packages/npm/runtime-minimal/` | ✅ Aligned |
| **VSL (Value State Layer)** | `/docs/runtime/runtime-glue-overview` | `packages/npm/runtime-minimal/` | ✅ Aligned |
| **PSG (Project Semantic Graph)** | `/docs/runtime/runtime-glue-overview` | `packages/npm/runtime-minimal/` | ✅ Aligned |

---

## 3. SDK Packages → NPM/PyPI

| SDK | Docs Page | Package Path | Published |
|:----|:----------|:-------------|:----------|
| **@mplp/core** | `/docs/sdk/ts-sdk-guide` | `packages/npm/core/` | ✅ |
| **@mplp/schema** | `/docs/sdk/ts-sdk-guide` | `packages/npm/schema/` | ✅ |
| **@mplp/modules** | `/docs/sdk/ts-sdk-guide` | `packages/npm/modules/` | ✅ |
| **@mplp/coordination** | `/docs/sdk/ts-sdk-guide` | `packages/npm/coordination/` | ✅ |
| **@mplp/compliance** | `/docs/sdk/ts-sdk-guide` | `packages/npm/compliance/` | ✅ |
| **@mplp/devtools** | `/docs/sdk/ts-sdk-guide` | `packages/npm/devtools/` | ✅ |
| **@mplp/runtime-minimal** | `/docs/sdk/ts-sdk-guide` | `packages/npm/runtime-minimal/` | ✅ |
| **@mplp/sdk-ts** | `/docs/sdk/ts-sdk-guide` | `packages/npm/sdk-ts/` | ✅ |
| **mplp (Python)** | `/docs/sdk/py-sdk-guide` | `packages/pypi/` | ✅ |

---

## 4. Golden Flows → Tests

| Golden Flow | Docs Page | Test Path | Runnable |
|:------------|:----------|:----------|:---------|
| **GF-01: SA Lifecycle** | `/docs/golden-flows` | `packages/sources/sdk-ts/__tests__/` | ✅ |
| **GF-02: MAP Coordination** | `/docs/golden-flows` | `packages/sources/sdk-ts/__tests__/` | ✅ |
| **GF-03: Drift Detection** | `/docs/golden-flows` | `packages/sources/sdk-ts/__tests__/` | ✅ |
| **GF-04: Delta-Intent** | `/docs/golden-flows` | `packages/sources/sdk-ts/__tests__/` | ✅ |
| **GF-05: Governance** | `/docs/golden-flows` | `packages/sources/sdk-ts/__tests__/` | ✅ |

---

## 5. Cross-Cutting Duties → Implementation

| Duty | Docs Reference | Implementation Location |
|:-----|:---------------|:------------------------|
| **Trace Append** | `/docs/architecture/architecture-overview` | `packages/npm/runtime-minimal/src/trace/` |
| **Drift Detection** | `/docs/architecture/architecture-overview` | `packages/npm/runtime-minimal/src/drift/` |
| **Confirm Hook** | `/docs/architecture/architecture-overview` | `packages/npm/runtime-minimal/src/confirm/` |
| **Policy Enforcement** | `/docs/architecture/architecture-overview` | `packages/npm/runtime-minimal/src/governance/` |

---

## 6. Governance

This index MUST be updated whenever:
1. A new schema is added
2. A new package is published
3. A new Golden Flow is defined
4. Documentation claims change

**Authority**: Documentation Governance
