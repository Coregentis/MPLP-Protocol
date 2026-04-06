---
sidebar_position: 1

doc_type: informative
normativity: informative
status: active
authority: Documentation Governance
description: "Frequently Asked Questions about MPLP."
title: FAQ

---

# FAQ

## General

### What is MPLP?

MPLP is a **vendor-neutral lifecycle protocol for AI agent systems**.

### What problem does MPLP address?

MPLP addresses protocol-level concerns such as:

- lifecycle structure
- observability
- governance hooks
- portability across implementations

These are protocol properties, not guarantees of any specific runtime or
product.

### Is MPLP open source?

Yes. MPLP repository, docs, and related public package surfaces are published
under Apache 2.0.

## Architecture

### What are the protocol layers?

| Layer | Scope |
|:---|:---|
| **L1** | core protocol objects and schema layer |
| **L2** | coordination/module semantics |
| **L3** | runtime realization layer |
| **L4** | integration boundary layer |

L3 and L4 should not be read as mandatory runtime products.

### What is PSG?

PSG is a runtime-side concept used in some implementation guidance.
It is not a protocol-core object and should not be used as the primary entry
point for reading MPLP semantics.

## Implementation

### Can I modify the schemas?

The frozen protocol line is `protocol_version: 1.0.0`.
Use the repository versioning and governance records for current change policy.

### How do I verify my implementation?

Start with:

1. [Entry Points](/docs/reference/entrypoints)
2. [Specification](/docs/specification)
3. [Golden Flows](/docs/evaluation/golden-flows)
4. [Validation Lab Overview](/docs/evaluation/validation-lab) when Lab-side
   adjudication context is needed

### Which package surfaces are available?

| Surface | Role |
|:---|:---|
| `@mplp/schema` | direct schema/data mirror |
| `@mplp/sdk-ts` | TypeScript facade helper |
| `@mplp/runtime-minimal` | runtime-minimal helper |
| `mplp-sdk` | Python protocol helper |

Availability does not imply endorsement or completeness beyond the published
surface itself.

## Support

### Where can I report bugs?

GitHub Issues: https://github.com/Coregentis/MPLP-Protocol/issues

### How do I contribute?

Start with the repository governance source tree and the docs-side governance
helper pages under `/docs/evaluation/governance`.
