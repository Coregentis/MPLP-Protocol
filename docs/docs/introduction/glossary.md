---
sidebar_position: 6
doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "Navigation glossary for key MPLP terms and where to read them first."
title: Glossary
---

> [!NOTE]
> **Navigation Glossary**
>
> This page is a reading aid. It does not create a second definition layer for
> MPLP terms. Formal protocol meaning remains in repository-backed schemas,
> invariants, approved governance records, and the linked specification/reference
> pages.

## How To Use This Page

Use each row as a pointer:

- **Classification** tells you which layer the term belongs to.
- **Read First** tells you where to start for trustworthy meaning.
- When a term is a runtime or evaluation concept, do not read it back into the
  protocol core unless the specification baseline says so.

## Protocol Object Families

| Term | Classification | Read First |
|:---|:---|:---|
| Context | Protocol object family | [Modules Overview](/docs/specification/modules), then `schemas/v2/mplp-context.schema.json` and [Context Module](/docs/specification/modules/context-module.md) |
| Plan | Protocol object family | [Modules Overview](/docs/specification/modules), then `schemas/v2/mplp-plan.schema.json` and [Plan Module](/docs/specification/modules/plan-module.md) |
| Confirm | Protocol object family | [Modules Overview](/docs/specification/modules), then `schemas/v2/mplp-confirm.schema.json` and [Confirm Module](/docs/specification/modules/confirm-module.md) |
| Trace | Protocol object family | [Modules Overview](/docs/specification/modules), then `schemas/v2/mplp-trace.schema.json` and [Trace Module](/docs/specification/modules/trace-module.md) |
| Role | Protocol object family | [Modules Overview](/docs/specification/modules), then `schemas/v2/mplp-role.schema.json` and [Role Module](/docs/specification/modules/role-module.md) |
| Dialog | Protocol object family | [Modules Overview](/docs/specification/modules), then `schemas/v2/mplp-dialog.schema.json` and [Dialog Module](/docs/specification/modules/dialog-module.md) |
| Collab | Protocol object family | [Modules Overview](/docs/specification/modules), then `schemas/v2/mplp-collab.schema.json` and [Collab Module](/docs/specification/modules/collab-module.md) |
| Extension | Protocol object family | [Modules Overview](/docs/specification/modules), then `schemas/v2/mplp-extension.schema.json` and [Extension Module](/docs/specification/modules/extension-module.md) |
| Core | Protocol object family | [Modules Overview](/docs/specification/modules), then `schemas/v2/mplp-core.schema.json` and [Core Module](/docs/specification/modules/core-module.md) |
| Network | Protocol object family | [Modules Overview](/docs/specification/modules), then `schemas/v2/mplp-network.schema.json` and [Network Module](/docs/specification/modules/network-module.md) |

## Profiles and Observability

| Term | Classification | Read First |
|:---|:---|:---|
| SA | Profile baseline | [Profiles Overview](/docs/specification/profiles), then `schemas/v2/profiles/sa-profile.yaml` and [SA Profile](/docs/specification/profiles/sa-profile.md) |
| MAP | Profile baseline | [Profiles Overview](/docs/specification/profiles), then `schemas/v2/profiles/map-profile.yaml` and [MAP Profile](/docs/specification/profiles/map-profile.md) |
| Event Family | Observability classification | [Observability Overview](/docs/specification/observability), then `schemas/v2/taxonomy/event-taxonomy.yaml` and [Event Taxonomy](/docs/specification/observability/event-taxonomy.md) |
| Invariant | Validation rule family | [Protocol Truth Index](/docs/evaluation/governance/protocol-truth-index), then the relevant file under `schemas/v2/invariants/` |
| Kernel Duty | Cross-cutting taxonomy term | `schemas/v2/taxonomy/kernel-duties.yaml`, then [Architecture](/docs/specification/architecture) for section-level context |

## Runtime Concepts

| Term | Classification | Read First |
|:---|:---|:---|
| PSG | Runtime concept | [Runtime Guides](/docs/guides/runtime), then [PSG](/docs/guides/runtime/psg.md) |
| AEL | Runtime concept | [Runtime Guides](/docs/guides/runtime), then [AEL](/docs/guides/runtime/ael.md) |
| VSL | Runtime concept | [Runtime Guides](/docs/guides/runtime), then [VSL](/docs/guides/runtime/vsl.md) |
| Drift Detection | Runtime behavior concept | [Runtime Guides](/docs/guides/runtime), then [Drift and Rollback](/docs/guides/runtime/drift-and-rollback.md) |
| Runtime Glue | Runtime-oriented guide concept | [Runtime Guides](/docs/guides/runtime), then [Runtime Glue Overview](/docs/guides/runtime/runtime-glue-overview.md) |

Runtime concepts are not protocol core objects. Read them as implementation
realization guidance unless a schema-backed specification page explicitly says
otherwise.

## Evaluation and Validation Lab Terms

| Term | Classification | Read First |
|:---|:---|:---|
| Evidence Pack | Evaluation / adjudication input | [Evaluation & Governance](/docs/evaluation), then [Conformance](/docs/evaluation/conformance) and [Validation Lab Overview](/docs/evaluation/validation-lab) |
| Ruleset | Validation Lab adjudication term | [Validation Lab Overview](/docs/evaluation/validation-lab), then [Rulesets](/docs/evaluation/validation-lab/rulesets.mdx) |
| Lifecycle Guarantee (LG) | Validation Lab adjudication target | [Validation Lab Overview](/docs/evaluation/validation-lab), then [Lifecycle Guarantees](/docs/evaluation/validation-lab/lifecycle-guarantees.mdx) |
| Flow / Golden Flow | Protocol test and teaching term | [Evaluation & Governance](/docs/evaluation), then [Golden Flows](/docs/evaluation/golden-flows) |
| Conformance | Evaluation term | [Conformance](/docs/evaluation/conformance) |
| Validation Lab | Auxiliary adjudication surface | [Entry Points](/docs/reference/entrypoints), then [Validation Lab Overview](/docs/evaluation/validation-lab) |

## Version and Surface Terms

| Term | Classification | Read First |
|:---|:---|:---|
| Repository | Authoritative truth source surface | [Entry Points](/docs/reference/entrypoints) |
| Documentation | Specification/reference projection surface | [Entry Points](/docs/reference/entrypoints) |
| Website | Discovery and positioning surface | [Entry Points](/docs/reference/entrypoints) |
| `protocol_version` | Canonical version domain | [Entry Points](/docs/reference/entrypoints), then [Versioning Policy](/docs/evaluation/governance/versioning-policy.md) |
| `validation_ruleset_version` | Validation Lab version domain | [Validation Lab Overview](/docs/evaluation/validation-lab) |
| `validation_lab_release_version` | Validation Lab release domain | [Validation Lab Overview](/docs/evaluation/validation-lab) |
