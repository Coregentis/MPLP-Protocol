---
sidebar_position: 5
doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "Quick reference for MPLP observability event families and invariant rules."
title: API Quick Reference
---

## 12 Observability Event Families

Based on `schemas/v2/events/mplp-event-core.schema.json`:

| Event Family | Schema | Schema-required? (derived) | Description |
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

## Invariant Reference

| Invariant Source | Scope | Description |
|:---|:---|:---|
| `schemas/v2/invariants/sa-invariants.yaml` | SA Profile | 9 rules (context binding, plan structure, trace requirements) |
| `schemas/v2/invariants/map-invariants.yaml` | MAP Profile | 9 rules (multi-participant requirements, role bindings) |
| `schemas/v2/invariants/observability-invariants.yaml` | Events | Event structure and emission rules |
| `schemas/v2/invariants/integration-invariants.yaml` | L4 Integration | External event validation |
| `schemas/v2/invariants/learning-invariants.yaml` | Learning | Sample structure requirements |

---

**For comprehensive documentation**, see:
- [Protocol Overview](mplp-v1.0-protocol-overview.md)
- [Glossary](glossary.md)
- [Documentation Map](mplp-v1.0-docs-map.md)