---
MPLP Protocol: v1.0.0 — Frozen Specification
Freeze Date: 2025-12-03
Status: FROZEN (no breaking changes permitted)
Governance: MPLP Protocol Governance Committee (MPGC)
Copyright: © 2025 邦士（北京）网络科技有限公司
License: Apache-2.0
Any normative change requires a new protocol version.
---

---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
## 10 Core Modules (L2)

| Module | Schema File | Documentation | Description |
| :--- | :--- | :--- | :--- |
| **Context** | `schemas/v2/mplp-context.schema.json` | [Spec](../02-modules/context-module.md) | Project root, environment, constraints. |
| **Plan** | `schemas/v2/mplp-plan.schema.json` | [Spec](../02-modules/plan-module.md) | Executable steps and dependencies. |
| **Confirm** | `schemas/v2/mplp-confirm.schema.json` | [Spec](../02-modules/confirm-module.md) | Human approval decisions. |
| **Trace** | `schemas/v2/mplp-trace.schema.json` | [Spec](../02-modules/trace-module.md) | Execution history and spans. |
| **Role** | `schemas/v2/mplp-role.schema.json` | [Spec](../02-modules/role-module.md) | Agent capabilities and assignments. |
| **Extension** | `schemas/v2/mplp-extension.schema.json` | [Spec](../02-modules/extension-module.md) | Tool adapters and plugins. |
| **Dialog** | `schemas/v2/mplp-dialog.schema.json` | [Spec](../02-modules/dialog-module.md) | Multi-turn conversation threads. |
| **Collab** | `schemas/v2/mplp-collab.schema.json` | [Spec](../02-modules/collab-module.md) | Multi-agent sessions. |
| **Core** | `schemas/v2/mplp-core.schema.json` | [Spec](../02-modules/core-module.md) | Orchestration and governance. |
| **Network** | `schemas/v2/mplp-network.schema.json` | [Spec](../02-modules/network-module.md) | External system topology. |

---

## Execution Profiles

| Profile | ID | Documentation | Key Features |
| :--- | :--- | :--- | :--- |
| **SA Profile** | `sa_profile` | [Spec](../03-profiles/mplp-sa-profile.md) | Single-agent, sequential execution. **REQUIRED**. |
| **MAP Profile** | `map_profile` | [Spec](../03-profiles/mplp-map-profile.md) | Multi-agent, turn-taking, broadcast. **RECOMMENDED**. |

---

## 12 Observability Event Families (Phase 3)

| Event Family | Schema File | Compliance | Description |
| :--- | :--- | :--- | :--- |
| **GraphUpdateEvent** | `mplp-graph-update-event.schema.json` | **REQUIRED** | PSG structural changes (nodes/edges). |
| **PipelineStageEvent** | `mplp-pipeline-stage-event.schema.json` | **REQUIRED** | Pipeline stage transitions. |
| **RuntimeExecutionEvent** | `mplp-runtime-execution-event.schema.json` | RECOMMENDED | Agent/tool/LLM execution lifecycle. |
| **ImportProcessEvent** | `mplp-event-core.schema.json` | RECOMMENDED | Project import activities. |
| **IntentEvent** | `mplp-event-core.schema.json` | RECOMMENDED | User intent capture. |
| **DeltaIntentEvent** | `mplp-event-core.schema.json` | OPTIONAL | Change requests. |
| **ImpactAnalysisEvent** | `mplp-event-core.schema.json` | OPTIONAL | Change impact assessment. |
| **CompensationPlanEvent** | `mplp-event-core.schema.json` | OPTIONAL | Rollback planning. |
| **MethodologyEvent** | `mplp-event-core.schema.json` | OPTIONAL | Reasoning process tracking. |
| **ReasoningGraphEvent** | `mplp-event-core.schema.json` | OPTIONAL | Thought graph construction. |
| **CostAndBudgetEvent** | `mplp-event-core.schema.json` | RECOMMENDED | Token/cost tracking. |
| **ExternalIntegrationEvent** | `mplp-event-core.schema.json` | RECOMMENDED | External API calls. |

---

## 4 Integration Event Families (Phase 6)

| Event Family | Schema File | Compliance | Description |
| :--- | :--- | :--- | :--- |
| **file_update_event** | `mplp-integration-file-event.schema.json` | OPTIONAL | IDE file changes. |
| **git_event** | `mplp-integration-git-event.schema.json` | OPTIONAL | Git operations. |
| **ci_event** | `mplp-integration-ci-event.schema.json` | OPTIONAL | CI pipeline status. |
| **tool_event** | `mplp-integration-tool-event.schema.json` | OPTIONAL | External tool execution. |

---

## 6 Learning Sample Families (Phase 4)

| Sample Family | Schema File | Compliance | Description |
| :--- | :--- | :--- | :--- |
| **intent_resolution** | `mplp-learning-intent-resolution.schema.json` | RECOMMENDED | User intent → Plan mapping. |
| **delta_impact** | `mplp-learning-delta-impact.schema.json` | RECOMMENDED | Change → Impact prediction. |
| **pipeline_outcome** | `mplp-learning-pipeline-outcome.schema.json` | RECOMMENDED | Plan → Success/Failure. |
| **confirm_decision** | `mplp-learning-confirm-decision.schema.json` | RECOMMENDED | Plan → Approval/Rejection. |
| **graph_evolution** | `mplp-learning-graph-evolution.schema.json` | RECOMMENDED | PSG topology changes. |
| **multi_agent_coordination** | `mplp-learning-multi-agent.schema.json` | RECOMMENDED | MAP session patterns. |

---

## Golden Test Flows

| ID | Name | Description |
| :--- | :--- | :--- |
| **FLOW-01** | Single Agent Plan | Basic Context → Plan → Trace flow. |
| **FLOW-02** | Single Agent Large Plan | Scalability test with many steps. |
| **FLOW-03** | Single Agent With Tools | Extension module usage. |
| **FLOW-04** | Single Agent LLM Enrichment | Intent → Plan refinement. |
| **FLOW-05** | Single Agent Confirm Required | Human approval workflow. |
| **SA-01** | SA Profile Basic | SA-specific lifecycle validation. |
| **SA-02** | SA Profile Error | Error handling in SA mode. |
| **MAP-01** | Turn-Taking | Sequential agent handoffs. |
| **MAP-02** | Broadcast Fanout | One-to-many coordination. |

---

**End of API Quick Reference**
