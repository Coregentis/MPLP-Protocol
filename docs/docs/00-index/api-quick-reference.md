---
title: API Quick Reference
description: Quick reference guide for MPLP v1.0 API components including 10
  core modules, 12 event families, execution profiles, SDK installation, and
  schema references.
keywords:
  - MPLP API
  - protocol reference
  - core modules
  - event families
  - SDK reference
  - JSON schema
  - TypeScript SDK
  - Python SDK
sidebar_label: API Quick Reference
doc_status: informative
doc_role: guide
normative_refs:
  - MPLP-CORPUS-v1.0.0
protocol_alignment:
  truth_level: T2
  protocol_version: 1.0.0
  schema_refs: []
  invariant_refs: []
  golden_refs:
    - local_path: tests/golden/flows/sa-flow-02-step-evaluation
      binding: mention
    - local_path: tests/golden/flows/sa-flow-01-basic
      binding: mention
    - local_path: tests/golden/flows/map-flow-02-broadcast-fanout
      binding: mention
    - local_path: tests/golden/flows/map-flow-01-turn-taking
      binding: mention
    - local_path: tests/golden/flows/flow-05-single-agent-confirm-required
      binding: mention
    - local_path: tests/golden/flows/flow-04-single-agent-llm-enrichment
      binding: mention
    - local_path: tests/golden/flows/flow-03-single-agent-with-tools
      binding: mention
    - local_path: tests/golden/flows/flow-02-single-agent-large-plan
      binding: mention
    - local_path: tests/golden/flows/flow-01-single-agent-plan
      binding: mention
  code_refs:
    ts: []
    py: []
  evidence_notes: []
  doc_status: informative
sidebar_position: 6
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# API Quick Reference

This document provides a rapid navigation guide to MPLP v1.0 core components, organized by layer and purpose. All references point to actual schemas and implementations in the codebase.

## 10 Core Modules (L2)

| Module | Schema | Key Fields | Status Enum |
|:---|:---|:---|:---|
| **Context** | `schemas/v2/mplp-context.schema.json` | `context_id`, `root.domain`, `root.environment` | `active`, `suspended`, `closed` |
| **Plan** | `schemas/v2/mplp-plan.schema.json` | `plan_id`, `context_id`, `steps[]` | `draft`, `proposed`, `approved`, `in_progress`, `cancelled`, `completed` |
| **Confirm** | `schemas/v2/mplp-confirm.schema.json` | `confirm_id`, `target_id`, `target_type`, `decisions[]` | `pending`, `approved`, `rejected`, `override` |
| **Trace** | `schemas/v2/mplp-trace.schema.json` | `trace_id`, `context_id`, `plan_id`, `segments[]` | `active`, `completed`, `failed`, `cancelled` |
| **Role** | `schemas/v2/mplp-role.schema.json` | `role_id`, `name`, `capabilities[]` | N/A |
| **Dialog** | `schemas/v2/mplp-dialog.schema.json` | `dialog_id`, `messages[]`, `thread_id` | `active`, `paused`, `completed`, `cancelled` |
| **Collab** | `schemas/v2/mplp-collab.schema.json` | `collab_id`, `mode`, `participants[]` | `draft`, `active`, `suspended`, `completed`, `cancelled` |
| **Extension** | `schemas/v2/mplp-extension.schema.json` | `extension_id`, `extension_type`, `version` | `registered`, `active`, `inactive`, `deprecated` |
| **Core** | `schemas/v2/mplp-core.schema.json` | `core_id`, `protocol_version`, `modules[]` | `draft`, `active`, `deprecated`, `archived` |
| **Network** | `schemas/v2/mplp-network.schema.json` | `network_id`, `topology_type`, `nodes[]` | `draft`, `provisioning`, `active`, `degraded`, `maintenance`, `retired` |

**Module Details**: See [Modules Overview](../02-modules/context-module.md) for complete specifications.

---

## Execution Profiles

| Profile | Invariants File | Required Modules | Compliance |
|:---|:---|:---|:---|
| **SA** (Single-Agent) | `schemas/v2/invariants/sa-invariants.yaml` | Context, Plan, Trace | **REQUIRED** |
| **MAP** (Multi-Agent) | `schemas/v2/invariants/map-invariants.yaml` | SA + Collab, Dialog, Network | **RECOMMENDED** |

**Profile Details**: See [03-profiles/sa-profile.md](../03-profiles/sa-profile.md) and [03-profiles/map-profile.md](../03-profiles/map-profile.md).

---

## 12 Observability Event Families

Based on `schemas/v2/events/mplp-event-core.schema.json`:

| Event Family | Schema | Required | Description |
|:---|:---|:---|:---|
| **pipeline_stage** | `schemas/v2/events/mplp-pipeline-stage-event.schema.json` | **YES** | Plan/Step lifecycle transitions |
| **graph_update** | `schemas/v2/events/mplp-graph-update-event.schema.json` | **YES** | PSG structural changes |
| **import_process** | Core event payload | No | Project initialization |
| **intent** | Core event payload | No | User's original request |
| **delta_intent** | Core event payload | No | Intent modifications |
| **methodology** | Core event payload | No | Approach selection |
| **reasoning_graph** | Core event payload | No | Chain-of-thought traces |
| **runtime_execution** | `schemas/v2/events/mplp-runtime-execution-event.schema.json` | No | LLM/tool execution details |
| **impact_analysis** | Core event payload | No | Change impact predictions |
| **compensation_plan** | Core event payload | No | Rollback strategies |
| **cost_budget** | Core event payload | No | Token/cost tracking |
| **external_integration** | Core event payload | No | L4 system events |

**Event Details**: See [04-observability/event-taxonomy.md](../04-observability/event-taxonomy.md).

---

## 4 Integration Event Types (L4)

| Event Type | Schema | Description |
|:---|:---|:---|
| **File Update** | `schemas/v2/integration/mplp-file-update-event.schema.json` | IDE file changes (created, modified, deleted, renamed) |
| **Git** | `schemas/v2/integration/mplp-git-event.schema.json` | Git operations (commit, push, merge, tag) |
| **CI** | `schemas/v2/integration/mplp-ci-event.schema.json` | CI/CD pipeline status |
| **Tool** | `schemas/v2/integration/mplp-tool-event.schema.json` | External tool invocations (linter, formatter, test) |

**Integration Details**: See [07-integration/integration-spec.md](../07-integration/integration-spec.md).

---

## Learning Sample Types

Based on `schemas/v2/learning/`:

| Sample Type | Schema | Purpose |
|:---|:---|:---|
| **Core Sample** | `schemas/v2/common/learning-sample.schema.json` | Base structure with feedback |
| **Intent Resolution** | `schemas/v2/learning/mplp-learning-sample-intent.schema.json`  | Intent Plan mappings |
| **Delta Impact** | `schemas/v2/learning/mplp-learning-sample-delta.schema.json` | Change Impact predictions |

**Learning Details**: See [05-learning/learning-overview.md](../05-learning/learning-overview.md).

---

## Golden Flow Tests

Based on actual test directories in `tests/golden/flows/`:

| Flow ID | Directory | Description |
|:---|:---|:---|
| **FLOW-01** | `flow-01-single-agent-plan/` | Basic Context Plan Trace flow |
| **FLOW-02** | `flow-02-single-agent-large-plan/` | Scalability test with multiple steps |
| **FLOW-03** | `flow-03-single-agent-with-tools/` | Extension Module integration |
| **FLOW-04** | `flow-04-single-agent-llm-enrichment/` | Intent Plan refinement |
| **FLOW-05** | `flow-05-single-agent-confirm-required/` | Human approval workflow |
| **SA-01** | `sa-flow-01-basic/` | SA Profile basic validation |
| **SA-02** | `sa-flow-02-step-evaluation/` | SA Profile step execution |
| **MAP-01** | `map-flow-01-turn-taking/` | Sequential agent handoffs |
| **MAP-02** | `map-flow-02-broadcast-fanout/` | One-to-many coordination |

---

## SDK Quick Links

### TypeScript SDK (`@mplp/sdk-ts` v1.0.3)

**Installation:**
```bash
npm install @mplp/sdk-ts
```

**Key Exports** (from `packages/sdk-ts/src/index.ts`):
- `core/validators` - Schema validation (AJV)
- `builders/*` - Context, Plan, Confirm, Trace builders
- `coordination` - SA/MAP coordination logic
- `runtime-minimal` - Minimal reference runtime
- `client/runtime-client` - Runtime API client

**Documentation**: [10-sdk/ts-sdk-guide.md](../10-sdk/ts-sdk-guide.md)

### Python SDK (`@mplp/sdk-py` v1.0.3)

**Installation:**
```bash
pip install mplp-sdk
```

**Key Components**:
- `mplp.core` - Pydantic models
- `mplp.validators` - Schema validation

**Documentation**: [10-sdk/py-sdk-guide.md](../10-sdk/py-sdk-guide.md)

---

## Common Schema References

| Schema | Path | Purpose |
|:---|:---|:---|
| **Identifiers** | `schemas/v2/common/identifiers.schema.json` | UUID v4 format |
| **Metadata** | `schemas/v2/common/metadata.schema.json` | Protocol version, freeze status |
| **Trace Base** | `schemas/v2/common/trace-base.schema.json` | Span structure (W3C compatible) |
| **Common Types** | `schemas/v2/common/common-types.schema.json` | Ref, annotations, tags |
| **Events** | `schemas/v2/common/events.schema.json` | Event array definitions |

---

## Invariants Quick Reference

| File | Scope | Rules |
|:---|:---|:---|
| `schemas/v2/invariants/sa-invariants.yaml` | SA Profile | 8 rules (context binding, plan structure, trace requirements) |
| `schemas/v2/invariants/map-invariants.yaml` | MAP Profile | 7 rules (multi-participant requirements, role bindings) |
| `schemas/v2/invariants/observability-invariants.yaml` | Events | Event structure and emission rules |
| `schemas/v2/invariants/integration-invariants.yaml` | L4 Integration | External event validation |
| `schemas/v2/invariants/learning-invariants.yaml` | Learning | Sample structure requirements |

---

**For comprehensive documentation**, see:
- [Protocol Overview](mplp-v1.0-protocol-overview.md)
- [Glossary](glossary.md)
- [Documentation Map](mplp-v1.0-docs-map.md)
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
```
