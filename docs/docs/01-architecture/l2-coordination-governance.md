---
title: L2 Coordination & Governance
description: L2 layer defining domain logic, 10 core module lifecycles, SA/MAP execution profiles, coordination patterns, and governance mechanisms for MPLP v1.0.
keywords: [MPLP, Multi-Agent Lifecycle Protocol, Agent OS Protocol, AI Agent, Observable, Governed, Vendor-neutral, L2 Coordination, module lifecycle, SA Profile, MAP Profile, state transitions, coordination patterns, governance, MPLP modules]
sidebar_label: L2 Coordination & Governance
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# L2 Coordination & Governance

## 1. Purpose

The **L2 Coordination & Governance** layer defines the domain logic, behavioral semantics, and coordination patterns that bring MPLP's declarative L1 schemas to life. While L1 prescribes *WHAT* data structures look like, L2 prescribes *HOW* those structures should behave, transition through states, and interact.

L2 is **normative** for compliancemplementations MUST adhere to the lifecycle rules, state transitions, and coordination patterns defined here. However, L2 is **implementation-agnostic**: it specifies observable outcomes without dictating internal algorithms or storage mechanisms (those belong to L3 Runtime).

L2 encompasses:
- **10 Core Modules**: State machines with defined lifecycle transitions
- **2 Execution Profiles**: SA (REQUIRED) and MAP (RECOMMENDED)
- **Module Interactions**: Cross-module dependencies and event flows
- **Governance Mechanisms**: Version control, locking, approval workflows

## 2. Scope & Boundaries

### 2.1 L2 Encompasses

Based on actual schemas ( `schemas/v2/mplp-*.schema.json`) and module documents (`docs/02-modules/*.md`):

1.  **Module Lifecycles**: State machines for all 10 modules with normative transitions
2.  **Execution Profiles**: SA (8 invariants) and MAP (9 invariants) from `schemas/v2/invariants/`
3.  **Coordination Patterns**: 5 multi-agent modes from `mplp-collab.schema.json`
4.  **Cross-Module Logic**: Dependencies, bindings, ref integrity
5.  **Governance Metadata**: From `metadata.schema.json` and `governance` blocks in schemas

### 2.2 L2 Explicitly Excludes

- **Physical Storage** (L3): PSG backends, databases, state persistence
- **Execution Engines** (L3): How to run steps, invoke LLMs, call tools
- **External Integration** (L4): File system access, Git operations, CI hooks
- **Low-Level Orchestration** (L3): Scheduling algorithms, resource allocation

## 3. Ten Core Modules

Each module governs a specific domain with defined state machines. Status enums are extracted from actual `schemas/v2/mplp-*.schema.json` files.

### 3.1 Module Catalog & Lifecycles

| Module | Schema | Primary Responsibility | Status Enum | Terminal States | Module Doc |
|:---|:---|:---|:---|:---|:---|
| **Context** | `mplp-context.schema.json` | Project scope & environment | N/A (inferred: active, suspended, closed) | `closed` | [context-module.md](../02-modules/context-module.md) |
| **Plan** | `mplp-plan.schema.json` | Executable step DAG | `draft`, `proposed`, `approved`, `in_progress`, `completed`, `cancelled`, `failed` | `completed`, `cancelled`, `failed` | [plan-module.md](../02-modules/plan-module.md) |
| **Confirm** | `mplp-confirm.schema.json` | Human-in-the-loop approvals | `pending`, `approved`, `rejected`, `override` | `approved`, `rejected`, `override` | [confirm-module.md](../02-modules/confirm-module.md) |
| **Trace** | `mplp-trace.schema.json` | Execution audit log | `active`, `completed`, `failed`, `cancelled` | `completed`, `failed`, `cancelled` | [trace-module.md](../02-modules/trace-module.md) |
| **Role** | `mplp-role.schema.json` | Capability definitions | N/A (declarative, no lifecycle) | N/A | [role-module.md](../02-modules/role-module.md) |
| **Dialog** | `mplp-dialog.schema.json` | Multi-turn conversations | `active`, `paused`, `completed`, `cancelled` | `completed`, `cancelled` | [dialog-module.md](../02-modules/dialog-module.md) |
| **Collab** | `mplp-collab.schema.json` | Multi-agent sessions | `draft`, `active`, `suspended`, `completed`, `cancelled` | `completed`, `cancelled` | [collab-module.md](../02-modules/collab-module.md) |
| **Extension** | `mplp-extension.schema.json` | Tool/capability registry | `registered`, `active`, `inactive`, `deprecated` | `inactive`, `deprecated` | [extension-module.md](../02-modules/extension-module.md) |
| **Core** | `mplp

-core.schema.json` | Central governance | `draft`, `active`, `deprecated`, `archived` | `archived` | [core-module.md](../02-modules/core-module.md) |
| **Network** | `mplp-network.schema.json` | Distributed topology | `draft`, `provisioning`, `active`, `degraded`, `maintenance`, `retired` | `retired` | [network-module.md](../02-modules/network-module.md) |

### 3.2 Plan Module Lifecycle (Detailed Example)

**From**: `schemas/v2/mplp-plan.schema.json` (lines 35-43) + `docs/02-modules/plan-module.md`

**7 Status States**:

```mermaid
stateDiagram-v2
    [*] --> draft
    draft --> proposed
    proposed --> approved: Confirm.approved
    proposed --> draft: Confirm.rejected
    approved --> in_progress
    in_progress --> completed: All steps completed
    in_progress --> failed: Critical step failed
    in_progress --> cancelled: User abort
    completed --> [*]
    failed --> [*]
    cancelled --> [*]
```

**Normative Transitions**:

| From | To | Trigger | Requirements |
|:---|:---|:---|:---|
| `draft` | `proposed` | Agent completes planning | Plan has  step (SA invariant `sa_plan_has_steps`) |
| `proposed` | `approved` | Confirm Module | `Confirm.status = approved` |
| `proposed` | `draft` | Confirm Module | `Confirm.status = rejected` |
| `approved` | `in_progress` | Runtime starts execution | `context_id` binding valid |
| `in_progress` | `completed` | All steps done | All steps `status = completed` |
| `in_progress` | `failed` | Critical error | At least one step `status = failed` |
| `in_progress` | `cancelled` | User cancellation | External cancellation signal |

**Forbidden Transitions** (MUST be rejected):
- `draft` `in_progress` (missing approval)
- `completed` `in_progress` (terminal state)
- `approved` `draft` (cannot revert after approval)

**Step Status** (from schema lines 160-167):
- `pending`: Awaiting dependencies
- `in_progress`: Agent working
- `completed`: Finished successfully
- `blocked`: Dependency failed
- `skipped`: Conditional skip
- `failed`: Execution error

### 3.3 Other Module Lifecycles

#### Context Module
**Inferred States** (not explicitly in schema but documented):
- Created (implicit initial state)
- `active`: Ready for agent execution (SA invariant `sa_context_must_be_active`)
- `suspended`: Temporarily paused
- `closed`: Project completed/archived

**Key Behavior**: SA Profile REQUIRES Context status = `active`

#### Confirm Module
**4 Status States** (from `mplp-confirm.schema.json`):
- `pending`: Awaiting decision
- `approved`: Decision maker approved
- `rejected`: Decision maker rejected
- `override`: Governance override (bypass normal approval)

**Key Behavior**: Blocks Plan transitions from `proposed` `approved`

#### Trace Module
**4 Status States**:
- `active`: Currently recording events
- `completed`: Execution finished normally
- `failed`: Execution encountered error
- `cancelled`: Execution aborted

**Key Behavior**: MUST emit  event (SA invariant `sa_trace_not_empty`)

#### Collab Module (MAP-Specific)
**5 Status States** (from `mplp-collab.schema.json` lines 69-75):
- `draft`: Session being configured
- `active`: Agents collaborating
- `suspended`: Temporarily paused
- `completed`: Session finished
- `cancelled`: Session aborted

**Key Behavior**: MAP Profile REQUIRES  participants (invariant `map_session_requires_multiple_participants`)

#### Extension Module
**4 Status States**:
- `registered`: Tool registered, not yet activated
- `active`: Available for use
- `inactive`: Temporarily disabled
- `deprecated`: Marked for removal

**Key Behavior**: Provides plugin mechanism for tools/capabilities

#### Dialog Module
**4 Status States**:
- `active`: Conversation ongoing
- `paused`: Temporarily suspended
- `completed`: Conversation finished
- `cancelled`: Conversation terminated

**Key Behavior**: Stores multi-turn conversation threads

#### Core Module
**4 Status States**:
- `draft`: System being configured
- `active`: Operational
- `deprecated`: Being phased out
- `archived`: Historical record only

**Key Behavior**: Central registry tracking enabled modules

#### Network Module
**6 Status States** (most complex):
- `draft`: Topology being defined
- `provisioning`: Resources being allocated
- `active`: Fully operational
- `degraded`: Partial functionality
- `maintenance`: Under repair/upgrade
- `retired`: Decommissioned

**Key Behavior**: Maps roles to physical/virtual execution nodes

#### Role Module
**No Lifecycle**: Role is purely declarative (no status field)

**Key Behavior**: Defines `capabilities[]` array with permission strings (e.g., `plan.create`, `confirm.approve`)

## 4. Execution Profiles

Profiles define higher-level execution patterns that span multiple modules.

### 4.1 SA Profile (Single-Agent) **REQUIRED**

**Status**: **REQUIRED** for MPLP v1.0 compliance  
**Normative Specification**: `schemas/v2/invariants/sa-invariants.yaml` (8 rules)  
**Reference Implementation**: `packages/sdk-ts/src/runtime-minimal/index.ts`

#### 4.1.1 SA Invariants (8 Rules)

From `schemas/v2/invariants/sa-invariants.yaml`:

| ID | Scope | Path | Rule | Description |
|:---|:---|:---|:---|:---|
| `sa_requires_context` | Context | `context_id` | uuid-v4 | SA execution requires valid Context with UUID v4 |
| `sa_context_must_be_active` | Context | `status` | enum(active) | Context status must be `active` |
| `sa_plan_context_binding` | Plan | `context_id` | eq(context.context_id) | Plan's context_id must match SA's Context |
| `sa_plan_has_steps` | Plan | `steps` | min-length(1) | Plan must contain  executable step |
| `sa_steps_have_valid_ids` | Plan | `steps[*].step_id` | uuid-v4 | All step IDs must be UUID v4 |
| `sa_steps_have_agent_role` | Plan | `steps[*].agent_role` | non-empty-string | All steps must specify `agent_role` |
| `sa_trace_not_empty` | Trace | `events` | min-length(1) | SA must emit  trace event before completion |
| `sa_trace_context_binding` | Trace | `context_id` | eq(context.context_id) | Trace context_id must match |
| `sa_trace_plan_binding` | Trace | `plan_id` | eq(plan.plan_id) | Trace plan_id must match |

**Note**: Last two listed as separate rules in YAML, total = 8

#### 4.1.2 SA Minimal Flow

**Required Modules**: Context, Plan, Trace  
**Optional Modules**: Confirm (for approval workflows), Role (for capability checks)

**Normative Execution Sequence**:

```
1. Load/Create Context Validate: context_id is UUID v4, status = "active"
   
2. Generate Plan Validate: plan.context_id matches, steps.length 1, all step_id are UUID v4
   
3. [Optional] Request Confirmation If required, wait for Confirm.status = "approved"
   
4. Execute Steps Sequentially Transition Plan.status: approved in_progress For each step: emit Trace events with valid trace_id, span_id
   
5. Complete Execution Transition Plan.status: in_progress completed/failed/cancelled Transition Trace.status: active completed/failed/cancelled Validate: Trace has  event
```

**Reference Implementation**: `packages/sdk-ts/src/runtime-minimal/index.ts`
```typescript
export async function runSingleAgentFlow(
  options: RunSingleAgentFlowOptions
): Promise<RuntimeResult> {
  // 1. Execute context module
  if (options.modules.context) {
    await options.modules.context({ ctx: {} });
  }
  // 2. Execute plan module
  if (options.modules.plan) {
    await options.modules.plan({ 
      ctx: { context: { title: "..." } } 
    });
  }
  // 3. Return result
  return { success: true, output: {...} };
}
```

### 4.2 MAP Profile (Multi-Agent) **RECOMMENDED**

**Status**: **RECOMMENDED** for MPLP v1.0 (REQUIRED for multi-agent systems)  
**Normative Specification**: `schemas/v2/invariants/map-invariants.yaml` (9 rules)

#### 4.2.1 MAP Invariants (9 Rules)

From `schemas/v2/invariants/map-invariants.yaml` (64 lines):

**Structural Rules** (7 enforceable):

| ID | Path | Rule | Description |
|:---|:---|:---|:---|
| `map_session_requires_multiple_participants` | `collab.participants` | min-length(2) | MAP sessions require  participants |
| `map_collab_mode_valid` | `collab.mode` | enum(broadcast, round_robin, orchestrated, swarm, pair) | Valid collaboration pattern |
| `map_session_id_is_uuid` | `collab.collab_id` | uuid-v4 | Session ID must be UUID v4 |
| `map_participants_have_role_ids` | `collab.participants[*].role_id` | non-empty-string | All participants need role bindings |
| `map_role_ids_are_uuids` | `collab.participants[*].role_id` | uuid-v4 | All role_ids must be UUID v4 |
| `map_participant_ids_are_non_empty` | `collab.participants[*].participant_id` | non-empty-string | Participant IDs must be non-empty |
| `map_participant_kind_valid` | `collab.participants[*].kind` | enum(agent, human, system, external) | Valid participant kind |

**Event Consistency Rules** (2 descriptive, require trace analysis):
- `map_turn_completion_matches_dispatch`: Every MAPTurnDispatched must have corresponding MAPTurnCompleted
- `map_broadcast_has_receivers`: MAPBroadcastSent must have  MAPBroadcastReceived

**Total**: 9 rules (7 structural + 2 event-based)

#### 4.2.2 MAP Coordination Modes (5 Patterns)

From `schemas/v2/mplp-collab.schema.json` (lines 58-64):

| Mode | Description | Use Case | Turn-Taking | Determinism |
|:---|:---|:---|:---|:---|
| **`broadcast`** | One-to-many task distribution | Parallel execution of independent tasks | No turns, all work simultaneously | Non-deterministic (race conditions possible) |
| **`round_robin`** | Sequential ordered turn-taking | Ordered pipeline (Planner Coder Reviewer) | Strict sequential turns | Deterministic |
| **`orchestrated`** | Centralized coordinator | Complex workflows with conditional branching | Coordinator dispatches turns | Deterministic (coordinator decides) |
| **`swarm`** | Self-organizing emergent collaboration | Decentralized problem-solving | Emergent, no fixed order | Non-deterministic |
| **`pair`** | 1:1 focused collaboration | Paired programming, focused review | Alternating turns between 2 agents | Deterministic |

#### 4.2.3 MAP Extended Modules

Beyond SA's {Context, Plan, Trace}, MAP adds:

- **Collab**: Session management, participant roster, turn dispatch
- **Dialog**: Inter-agent communication threads
- **Network**: Role-to-node topology mapping (which agent runs where)
- **Role**: Capability-based access control for multi-user scenarios

## 5. Module Interactions

### 5.1 Core Dependencies (All Profiles)

```mermaid
graph TD
    Context[Context<br/>Root Scope] -->|context_id| Plan[Plan<br/>Executable Steps]
    Context -->|context_id| Dialog[Dialog<br/>Conversations]
    Plan -->|plan_id| Confirm[Confirm<br/>Approvals]
    Plan -->|plan_id| Trace[Trace<br/>Audit Log]
    Confirm -->|approval decision| Plan
    Role[Role<br/>Capabilities] -->|role_id| Plan
    Extension[Extension<br/>Tools] -->|tool references| Plan
```

**Binding Rules** (normative):
1. Plan MUST reference valid `context_id` (SA invariant `sa_plan_context_binding`)
2. Trace MUST reference valid `context_id` and `plan_id` (SA invariants)
3. Confirm MUST reference valid `target_id` (typically `plan_id`)
4. Dialog SHOULD reference `context_id` for conversation scoping

### 5.2 MAP Extensions

```mermaid
graph TD
    Collab[Collab<br/>Session] -->|participants[]| Role[Role<br/>Capabilities]
    Collab -->|collab_id| Dialog[Dialog<br/>Coordination Messages]
    Collab -->|session context| Plan[Plan<br/>Collaborative Work]
    Network[Network<br/>Topology] -->|node assignments| Role
```

**Additional Binding Rules** (MAP-specific):
1. Collab MUST have  participants (invariant `map_session_requires_multiple_participants`)
2. All `participants[*].role_id` MUST be valid UUIDs (invariant `map_role_ids_are_uuids`)
3. Collab `mode` MUST be valid enum (invariant `map_collab_mode_valid`)

### 5.3 Tool Integration (Extension Module)

```mermaid
graph LR
    Plan[Plan] -->|steps[].tool_id| Extension[Extension Registry]
    Extension -->|capability injection| Runtime[L3 Runtime]
    Runtime -->|invocation logs| Trace[Trace]
```

**Integration Pattern**:
1. Extensions register in Extension module with `extension_type` {capability, policy, integration, transformation, validation}
2. Plan steps reference `tool_id` matching `extension_id`
3. Runtime resolves tool references and invokes
4. Trace captures tool invocation results

## 6. State Transition Enforcement

### 6.1 Normative Rules

**All Implementations MUST**:

1. **Validate State Transitions**: Reject invalid transitions (e.g., `draft` `in_progress` without approval for Plan)
2. **Emit Lifecycle Events**: Publish `pipeline_stage` events on status changes
3. **Enforce Cross-Module Refs**: Ensure `context_id`, `plan_id`, `role_id` reference valid objects
4. **Respect Terminal States**: Prevent transitions out of terminal states (`completed`, `failed`, `cancelled`, `archived`, `retired`)

**Example Enforcement Code** (pseudocode):
```typescript
function transitionPlanStatus(
  plan: Plan,
  newStatus: PlanStatus
): Result<Plan, Error> {
  const validTransitions = {
    draft: ["proposed"],
    proposed: ["approved", "draft"],
    approved: ["in_progress"],
    in_progress: ["completed", "failed", "cancelled"],
    // Terminal states: no outgoing transitions
    completed: [],
    failed: [],
    cancelled: []
  };
  
  if (!validTransitions[plan.status].includes(newStatus)) {
    return Error(`Invalid transition: ${plan.status} ${newStatus}`);
  }
  
  // Additional checks
  if (newStatus === "in_progress") {
    if (plan.status !== "approved") {
      return Error("Plan must be approved before execution");
    }
    if (plan.steps.length === 0) {
      return Error("Plan must have  step (SA invariant)");
    }
  }
  
  plan.status = newStatus;
  emit_pipeline_stage_event(plan, newStatus);
  return Ok(plan);
}
```

### 6.2 Compliance Testing

**Validation Method**: Golden Flow tests

Example test structure:
```
tests/golden/flows/sa-flow-01-basic/
   input.json          # Initial Context
   expected/    plan.json       # Plan with valid transitions    trace.json      # Trace with  event    final_state.json
   invalid/
       plan_skip_approval.json  # MUST be rejected
```

## 7. Governance Mechanisms

> [!NOTE]
> **Standards Mapping (Informative)**
> MPLP governance mechanisms **may be mapped** to certain ISO/IEC 42001 objectives (e.g., A.6.1 AI System Lifecycle).
> This documentation does not claim compliance or certification. See the canonical positioning at [mplp.io/standards/positioning](https://mplp.io/standards/positioning).

### 7.1 Version Control (from `metadata.schema.json`)

**All L2 objects MUST include**:
- `meta.protocol_version`: SemVer (e.g., "1.0.0")
- `meta.schema_version`: SemVer (e.g., "2.0.0")

**Compatibility Checks**:
```typescript
if (plan.meta.protocol_version !== "1.0.0") {
  throw new Error("Incompatible protocol version");
}
```

### 7.2 Governance Metadata (from module schemas)

**From Context/Collab schemas** (`governance` block):

```json
{
  "governance": {
    "lifecyclePhase": "implementation",
    "truthDomain": "requirements",
    "locked": false,
    "lastConfirmRef": {
      "id": "confirm-123",
      "kind": "Confirm"
    }
  }
}
```

**Fields**:
- `lifecyclePhase`: Current project phase (e.g., "design", "implementation", "review")
- `truthDomain`: Authority domain (e.g., "requirements", "architecture")
- `locked`: Boolean - if true, object cannot be modified without governance override
- `lastConfirmRef`: Link to last approval decision

### 7.3 Cross-Cutting Concerns (from `meta.cross_cutting[]`)

Modules opt-in to 9 of the 11 Kernel Duties via the `metadata.cross_cutting` enum (Observability and Learning Feedback are handled via dedicated mechanisms):

1. `coordination` - Multi-agent handoffs
2. `error-handling` - Failure recovery
3. `event-bus` - Event routing
4. `orchestration` - Step sequencing
5. `performance` - Metrics tracking
6. `protocol-version` - Compatibility checks
7. `security` - Access control
8. `state-sync` - PSG consistency
9. `transaction` - Atomicity requirements

**Example**:
```json
{
  "meta": {
    "cross_cutting": ["security", "transaction", "audit"]
    // Note: "audit" not in enum, would fail validation
  }
}
```

## 8. L2 Compliance Requirements

To claim **L2 Compliance**, implementations MUST:

| Requirement | Verification Method |
|:---|:---|
| **Implement All 10 Module Lifecycles** | State machine tests for each module |
| **Enforce State Transition Rules** | Golden flow tests with invalid transitions (MUST be rejected) |
| **Support SA Profile (8 Invariants)** | SA invariant validation suite |
| **Validate Cross-Module References** | Referential integrity tests (invalid `context_id` MUST error) |
| **Emit Lifecycle Events** | `pipeline_stage` event capture on every status change |
| **Respect Terminal States** | Tests attempting transitions from terminal states (MUST fail) |
| **Support Governance Metadata** | `meta.protocol_version` and `meta.schema_version` parsing |

**Optional but Recommended**:
- MAP Profile (9 Invariants)
- Collab Module with all 5 coordination modes
- Dialog Module for inter-agent communication
- Network Module for distributed topologies

## 9. Relationship to L1 and L3

### 9.1 L1 L2 Dependency

| L1 Responsibility | L2 Responsibility | Example |
|:---|:---|:---|
| Define `Plan` schema | Define Plan lifecycle transitions | Draft Proposed Approved |
| Define `steps[]` array | Define DAG dependency resolution | Step 2 waits for Step 1 completion |
| Define `status` enum | Define valid status transitions | Approved In Progress (valid)<br/>Draft In Progress (invalid) |
| Define UUID v4 format | Validate all ID bindings | `plan.context_id` MUST match `context.context_id` |

**Layering Principle**: L2 **imports** L1 schemas and **adds** behavioral semantics

### 9.2 L2 L3 Delegation

| L2 Responsibility | L3 Responsibility | Example |
|:---|:---|:---|
| **Define outcomes** | **Implement mechanisms** | L2: "Emit pipeline_stage event on status change"<br/>L3: Choose event bus (Redis, Kafka, in-memory) |
| **Specify state machines** | **Store state** | L2: "Plan has 7 status values"<br/>L3: Store in Postgres / Redis / in-memory Map |
| **Require PSG integrity** | **Maintain PSG** | L2: "Graph must be DAG"<br/>L3: Detect cycles, maintain edge list |

**Independence**: Multiple L3 runtimes can implement the same L2 semantics differently

## 10. Extensibility & Customization

### 10.1 Allowed Extensions

- **Custom Tags**: via `meta.tags[]`
- **Cross-Cutting Opt-In**: via `meta.cross_cutting[]` (limited to 9 enum values)
- **Vendor-Specific Metadata**: Some schemas allow additional fields in designated areas

### 10.2 Forbidden Modifications

-?**Changing Status Enums**: Cannot add/remove values from `status` enums
- **Skipping State Transitions**: Cannot bypass normative transitions (e.g., skip approval)
- **Modifying Invariant Rules**: SA/MAP invariants are frozen
- **Breaking Cross-Module Bindings**: Cannot make `plan.context_id` optional

**Rationale**: L2 semantics are frozen to ensure interoperability

## 11. Related Documents

**Architecture**:
- [Architecture Overview](architecture-overview.md)
- [L1 Core Protocol](l1-core-protocol.md)
- [L3 Execution & Orchestration](l3-execution-orchestration.md)

**Module Specifications** (complete details):
- [02-modules/context-module.md](../02-modules/context-module.md)
- [02-modules/plan-module.md](../02-modules/plan-module.md)
- [02-modules/confirm-module.md](../02-modules/confirm-module.md)
- [02-modules/trace-module.md](../02-modules/trace-module.md)
- [02-modules/role-module.md](../02-modules/role-module.md)
- [02-modules/dialog-module.md](../02-modules/dialog-module.md)
- [02-modules/collab-module.md](../02-modules/collab-module.md)
- [02-modules/extension-module.md](../02-modules/extension-module.md)
- [02-modules/core-module.md]( ../02-modules/core-module.md)
- [02-modules/network-module.md](../02-modules/network-module.md)
- [02-modules/module-interactions.md](../02-modules/module-interactions.md)

**Profiles**:
- [03-profiles/sa-profile.md](../03-profiles/sa-profile.md)
- [03-profiles/map-profile.md](../03-profiles/map-profile.md)
- [03-profiles/multi-agent-governance-profile.md](../03-profiles/multi-agent-governance-profile.md)

**Cross-Cutting Concerns**:
- [cross-cutting-kernel-duties/coordination.md](cross-cutting-kernel-duties/coordination.md)
- [cross-cutting-kernel-duties/orchestration.md](cross-cutting-kernel-duties/orchestration.md)

**Compliance**:
- [08-guides/conformance-guide.md](../08-guides/conformance-guide.md)

---

**Document Status**: Normative  
**Total Modules**: 10 (all with defined lifecycles except Role)  
**Total Profiles**: 2 (SA: REQUIRED 8 invariants, MAP: RECOMMENDED 9 invariants)  
**Coordination Modes**: 5 (broadcast, round_robin, orchestrated, swarm, pair)  
**Governance Fields**: protocol_version, schema_version, lifecyclePhase, truthDomain, locked, lastConfirmRef
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
