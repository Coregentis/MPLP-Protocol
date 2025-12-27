---
doc_type: reference
status: active
authority: Documentation Governance
description: ""
title: API Quick Reference
---

# API Quick Reference

> **Status**: Informative
> **Version**: 1.0.0
> **Authority**: Documentation Governance

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

## Learning Sample Types

Based on `schemas/v2/learning/`:

| Sample Type | Schema | Purpose |
|:---|:---|:---|
| **Core Sample** | `schemas/v2/common/learning-sample.schema.json` | Base structure with feedback |
| **Intent Resolution** | `schemas/v2/learning/mplp-learning-sample-intent.schema.json`  | Intent Plan mappings |
| **Delta Impact** | `schemas/v2/learning/mplp-learning-sample-delta.schema.json` | Change Impact predictions |

**Learning Details**: See [05-learning/learning-overview.md](../05-learning/learning-overview.md).

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