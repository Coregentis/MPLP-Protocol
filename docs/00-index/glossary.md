---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# MPLP v1.0 Glossary

**Version**: 1.0.0
**Last Updated**: 2025-12-01
**Status**: Normative Definitions

This glossary defines the official terminology for the **Multi-Agent Lifecycle Protocol (MPLP)**. All terms listed here are normative.

---

## A - C

**Broadcast**
A collaboration pattern in the MAP Profile where one agent sends a message or task to multiple responders in parallel.
*Source: [MAP Profile](../03-profiles/mplp-map-profile.md)*

**Collab**
L2 Core Module responsible for managing multi-agent collaboration sessions, participants, and coordination modes.
*Source: [Collab Schema](../../schemas/v2/mplp-collab.schema.json)*

**CompensationPlanEvent**
Observability event emitted when a compensation plan is generated to handle failures or intent changes.
*Source: [Event Taxonomy](../04-observability/mplp-event-taxonomy.yaml)*

**Compliance**
The state of adhering to all REQUIRED schemas, invariants, and behavioral contracts defined in the MPLP specification.
*Source: [Compliance Guide](../08-guides/mplp-v1.0-compliance-guide.md)*

**Confirm**
L2 Core Module responsible for capturing human or automated approval decisions for plans or critical actions.
*Source: [Confirm Schema](../../schemas/v2/mplp-confirm.schema.json)*

**Context**
L2 Core Module defining the project scope, environment, constraints, and initial state. The root of the project lifecycle.
*Source: [Context Schema](../../schemas/v2/mplp-context.schema.json)*

**Core**
L2 Core Module responsible for orchestration, governance, and enforcing protocol-level policies.
*Source: [Core Schema](../../schemas/v2/mplp-core.schema.json)*

**CostAndBudgetEvent**
Observability event emitted to track token usage, financial costs, and budget enforcement.
*Source: [Event Taxonomy](../04-observability/mplp-event-taxonomy.yaml)*

## D - F

**DeltaIntentEvent**
Observability event emitted when a change request (delta) is issued against an existing plan or intent.
*Source: [Event Taxonomy](../04-observability/mplp-event-taxonomy.yaml)*

**Dialog**
L2 Core Module responsible for managing multi-turn conversation threads between agents or between user and agent.
*Source: [Dialog Schema](../../schemas/v2/mplp-dialog.schema.json)*

**Drift Detection**
The runtime capability to detect discrepancies between the intended state (Plan) and the actual state (PSG/Environment).
*Source: [Drift Detection Spec](../06-runtime/drift-detection-spec.md)*

**Execution Token**
A logical authorization token in the MAP Profile that grants a specific agent the right to execute or modify state during a turn.
*Source: [MAP Profile](../03-profiles/mplp-map-profile.md)*

**Extension**
L2 Core Module defining adapters for external tools, APIs, and plugins.
*Source: [Extension Schema](../../schemas/v2/mplp-extension.schema.json)*

**ExternalIntegrationEvent**
Observability event emitted when the system interacts with external tools, APIs, or services.
*Source: [Event Taxonomy](../04-observability/mplp-event-taxonomy.yaml)*

## G - I

**Golden Flow**
A standardized, protocol-invariant test scenario used to validate runtime compliance (e.g., FLOW-01).
*Source: [Golden Test Suite](../09-tests/golden-test-suite-overview.md)*

**GraphUpdateEvent**
**REQUIRED** Observability event emitted whenever the Project Semantic Graph (PSG) structure (nodes/edges) is modified.
*Source: [GraphUpdateEvent Schema](../../schemas/v2/events/mplp-graph-update-event.schema.json)*

**ImpactAnalysisEvent**
Observability event emitted when the impact of a proposed change (delta) is assessed.
*Source: [Event Taxonomy](../04-observability/mplp-event-taxonomy.yaml)*

**ImportProcessEvent**
Observability event emitted during the project initialization and import phase.
*Source: [Event Taxonomy](../04-observability/mplp-event-taxonomy.yaml)*

**IntentEvent**
Observability event emitted when a user or system intent is captured or clarified.
*Source: [Event Taxonomy](../04-observability/mplp-event-taxonomy.yaml)*

**Invariant**
A mandatory rule or condition that must always hold true for a valid MPLP execution state.
*Source: [Invariants](../../schemas/v2/invariants/)*

## L - N

**LearningSample**
A structured data object capturing a unit of execution experience for future model training (e.g., intent resolution, pipeline outcome).
*Source: [Learning Schema](../../schemas/v2/learning/mplp-learning-sample-core.schema.json)*

**MAP Profile**
**Multi-Agent Profile**. A standard execution profile defining patterns for multi-agent collaboration (turn-taking, broadcast).
*Source: [MAP Profile](../03-profiles/mplp-map-profile.yaml)*

**MethodologyEvent**
Observability event emitted when a specific methodology or reasoning process is applied.
*Source: [Event Taxonomy](../04-observability/mplp-event-taxonomy.yaml)*

**Multi-Agent Lifecycle Protocol (MPLP)**
The official name of the protocol defined in this specification. A vendor-neutral standard for agentic AI development.
*Source: [Protocol Overview](mplp-v1.0-protocol-overview.md)*

**Network**
L2 Core Module defining the topology of agents and nodes available for collaboration.
*Source: [Network Schema](../../schemas/v2/mplp-network.schema.json)*

## O - R

**Orchestrated**
A collaboration pattern in the MAP Profile where a central coordinator agent manages task distribution and result aggregation.
*Source: [MAP Profile](../03-profiles/mplp-map-profile.md)*

**PipelineStageEvent**
**REQUIRED** Observability event emitted when a pipeline stage transitions (e.g., pending -> running -> completed).
*Source: [PipelineStageEvent Schema](../../schemas/v2/events/mplp-pipeline-stage-event.schema.json)*

**Plan**
L2 Core Module defining a sequence of executable steps and dependencies to achieve a goal.
*Source: [Plan Schema](../../schemas/v2/mplp-plan.schema.json)*

**Project Semantic Graph (PSG)**
The single source of truth for all project state at runtime, represented as a graph of nodes and edges.
*Source: [Runtime Glue Overview](../06-runtime/mplp-runtime-glue-overview.md)*

**ReasoningGraphEvent**
Observability event emitted to capture the internal reasoning structure of an agent.
*Source: [Event Taxonomy](../04-observability/mplp-event-taxonomy.yaml)*

**Role**
L2 Core Module defining the capabilities, permissions, and identity of an agent or participant.
*Source: [Role Schema](../../schemas/v2/mplp-role.schema.json)*

**Rollback**
The runtime capability to revert the PSG to a previous consistent state (Snapshot) upon failure.
*Source: [Rollback Spec](../06-runtime/rollback-minimal-spec.md)*

**RuntimeExecutionEvent**
**RECOMMENDED** Observability event emitted to track the execution lifecycle of agents, tools, or LLM calls.
*Source: [RuntimeExecutionEvent Schema](../../schemas/v2/events/mplp-runtime-execution-event.schema.json)*

## S - Z

**SA Profile**
**Single Agent Profile**. A standard execution profile defining the minimal lifecycle for a single agent.
*Source: [SA Profile](../03-profiles/mplp-sa-profile.yaml)*

**Snapshot**
A captured state of the Project Semantic Graph (PSG) at a specific point in time, used for drift detection and rollback.
*Source: [Runtime Glue Overview](../06-runtime/mplp-runtime-glue-overview.md)*

**Trace**
L2 Core Module responsible for recording the execution history, events, and outcomes.
*Source: [Trace Schema](../../schemas/v2/mplp-trace.schema.json)*

**Turn-taking**
A collaboration pattern in the MAP Profile where agents execute sequentially, passing an execution token.
*Source: [MAP Profile](../03-profiles/mplp-map-profile.md)*

---

**End of Glossary**
