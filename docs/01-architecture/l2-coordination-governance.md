---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# L2: Coordination & Governance

## 1. Scope

This document defines **L2 (Coordination & Governance)**, the layer responsible for **module interactions, execution profiles, and event taxonomies**. L2 transforms static L1 data structures into dynamic behavioral patterns.

**Boundaries**:
- **In Scope**: Module logic, SA/MAP Profiles, Event definitions, Flow contracts.
- **Out of Scope**: Runtime implementation (PSG, AEL), external integration.

## 2. Normative Definitions

- **Execution Profile**: A named set of behavioral rules and constraints (e.g., `sa_profile`, `map_profile`).
- **Event Family**: A logical grouping of related events (e.g., `GraphUpdateEvent`, `PipelineStageEvent`).
- **Flow Contract**: A formal specification of a sequence of operations (e.g., "Context must be initialized before Plan creation").

## 3. Responsibilities (MUST/SHALL)

1.  **Profile Enforcement**: L2 **MUST** define and enforce the rules of the active Execution Profile (SA or MAP).
2.  **Event Emission**: L2 **MUST** define the schema and trigger conditions for all 12 Observability Event Families.
3.  **Module Coordination**: L2 **MUST** govern how modules interact (e.g., Plan module reading from Context module).
4.  **Flow Integrity**: L2 **SHALL** ensure that agent execution follows valid state transitions defined in Flow Contracts.

## 4. Architecture Structure

L2 is organized into three pillars:

```mermaid
graph TD
    Profiles[Execution Profiles<br/>(docs/03-profiles)] --> Logic
    Events[Event System<br/>(docs/04-observability)] --> Logic
    Modules[Module Logic<br/>(docs/02-modules)] --> Logic[L2 Coordination Logic]
```

### Execution Profiles
| Profile | ID | Compliance | Description |
| :--- | :--- | :--- | :--- |
| **SA Profile** | `sa_profile` | ✅ Required | Single-Agent, sequential execution. |
| **MAP Profile** | `map_profile` | ⚠️ Recommended | Multi-Agent, turn-taking, broadcast. |

### Event System (12 Families)
1.  **GraphUpdateEvent** (Required)
2.  **PipelineStageEvent** (Required)
3.  **RuntimeExecutionEvent**
4.  **ImportProcessEvent**
5.  **IntentEvent**
6.  **DeltaIntentEvent**
7.  **ImpactAnalysisEvent**
8.  **CompensationPlanEvent**
9.  **MethodologyEvent**
10. **ReasoningGraphEvent**
11. **CostAndBudgetEvent**
12. **ExternalIntegrationEvent**

## 5. Binding Points

### 5.1 Schema Binding (L1)
- L2 Events are defined by `schemas/v2/events/*.json`.
- L2 Profiles are defined by `schemas/v2/invariants/*.yaml`.

### 5.2 Event Binding (L3)
- L2 defines **WHAT** events exist and **WHEN** they should be emitted.
- L3 implements the **Event Bus** that actually routes these events.

### 5.3 PSG Binding (L3)
- L2 defines logical operations (e.g., "Add Step to Plan").
- L3 binds these to PSG mutations (e.g., `psg.addNode('step', ...)`).

## 6. Interaction Model

### SA Profile Interaction
1.  **Context Phase**: Agent reads Context, emits `PipelineStageEvent(context)`.
2.  **Plan Phase**: Agent generates Plan, emits `GraphUpdateEvent`.
3.  **Execute Phase**: Agent executes Steps, emits `RuntimeExecutionEvent`.
4.  **Trace Phase**: Agent records Trace, emits `GraphUpdateEvent`.

### MAP Profile Interaction
1.  **Session Start**: Orchestrator initializes MAP session.
2.  **Turn Taking**: Orchestrator dispatches turn to Agent A.
3.  **Handoff**: Agent A completes task, returns control to Orchestrator.
4.  **Broadcast**: Orchestrator broadcasts update to all Agents.

## 7. Versioning & Invariants

- **Profile Versioning**: Profiles are versioned with the protocol. New profiles can be added in Minor versions.
- **Event Versioning**: Adding fields to events is Minor. Removing fields is Major.
- **Invariants**:
    - SA Profile: "Only one active agent at a time."
    - MAP Profile: "All agents must share the same Context."

## 8. Security / Safety Considerations

- **Role-Based Access Control (RBAC)**: L2 defines the `Role` module to restrict agent capabilities.
- **Event Sanitization**: Events **SHOULD** be sanitized of secrets before emission.
- **Flow Constraints**: L2 prevents illegal state transitions (e.g., executing a Plan before approval).

## 9. References

- [L1: Core Protocol](l1-core-protocol.md)
- [SA Profile](../03-profiles/mplp-sa-profile.md)
- [MAP Profile](../03-profiles/mplp-map-profile.md)
- [Observability Overview](../04-observability/mplp-observability-overview.md)
