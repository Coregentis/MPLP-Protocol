---
entry_surface: documentation
doc_type: informative
normativity: informative
status: draft
protocol_version: "1.0.0"
doc_id: "DOC-ARCH-DEEP-DIVE-001"

# UI metadata (non-normative; excluded from protocol semantics)
title: L1-L4 Architecture Deep Dive
sidebar_label: Architecture Deep Dive
sidebar_position: 6
description: "MPLP architecture documentation: L1-L4 Architecture Deep Dive. Defines structural requirements and layer responsibilities."
authority: Documentation Governance
---

# L1-L4 Architecture Deep Dive

## Scope

This document provides a comprehensive technical deep dive into the MPLP v1.0 four-layer architecture, focusing on advanced topics, internal mechanics, and complex inter-layer interactions.

**Intended Audience:**
- Runtime Architects designing MPLP-conformant runtimes
- Advanced Implementers building production-grade systems
- Protocol Contributors extending MPLP with custom profiles

## Non-Goals

This document does not define normative obligations. It provides explanatory content and design rationale only.

---

## 1. Purpose & Scope

This document serves as the **implementation guide** for MPLP runtime developers. It bridges the gap between the abstract specifications (L1-L4 layer documents) and production-grade implementations.

**What This Document Covers**:
- Detailed interface contracts for AEL, VSL, and PSG
- Algorithmic patterns for orchestration and coordination
- Implementation examples with code snippets
- Advanced topics: drift detection, encryption, caching, parallelization

**What This Document Does NOT Cover**:
- Normative protocol obligations (see L1-L4 layer documents)
- Conformance testing procedures (see Golden Flows)
- SDK usage tutorials (see SDK documentation)

## 2. Architecture Review (Quick Reference)

| Layer | Name | Responsibility | Key Modules |
|:------|:-----|:---------------|:------------|
| **L1** | Core Protocol | Schema definitions, data types | Context, Plan, Trace, Confirm |
| **L2** | Coordination & Governance | State machines, lifecycle rules | Role, Collab, Dialog |
| **L3** | Execution & Orchestration | Runtime abstraction | AEL, VSL, PSG, Orchestrator |
| **L4** | Integration Infrastructure | External system binding | Extension, Network |

**Key Runtime Abstractions**:

```
┌─────────────────────────────────────────────────┐
│                  Orchestrator                    │
│         (Scheduling & Coordination)              │
├──────────────────┬──────────────────────────────┤
│       AEL        │            VSL               │
│  (Action Layer)  │       (State Layer)          │
├──────────────────┴──────────────────────────────┤
│                      PSG                         │
│           (Project Semantic Graph)               │
└─────────────────────────────────────────────────┘
```

## 3. Core Abstractions

### 3.1 AEL (Action Execution Layer)

**Definition**: The runtime component that abstracts **action invocation** (LLM calls, tool execution, agent handoffs). Acts as the "CPU" of the MPLP runtime.

**Reference Interface** (`packages/sources/sdk-ts/src/runtime-minimal/index.ts` lines 29-31):
```typescript
export interface ActionExecutionLayer {
  execute(action: any): Promise<any>;
}
```

**Reference Implementation** (InMemoryAEL, lines 39-41):
```typescript
export class InMemoryAEL implements ActionExecutionLayer {
  async execute(action: any) {
    return { status: 'executed', action };
  }
}
```

**Action Types**:
1. `llm_call` - LLM API invocation (OpenAI, Anthropic, etc.)
2. `tool_call` - External tool execution (linters, formatters, tests)
3. `agent_handoff` - Transfer control between agents (MAP Profile)
4. `file_operation` - File read/write via L4 integration
5. `custom_action` - Vendor-specific extensions

### 3.2 VSL (Value State Layer)

**Definition**: The runtime component that abstracts **state persistence**. Acts as the "Memory" of the MPLP runtime.

**Reference Interface** (`packages/sources/sdk-ts/src/runtime-minimal/index.ts` lines 24-27):
```typescript
export interface ValueStateLayer {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
}
```

**Reference Implementation** (InMemoryVSL, lines 33-37):
```typescript
export class InMemoryVSL implements ValueStateLayer {
  private store = new Map<string, any>();
  async get(key: string) { return this.store.get(key); }
  async set(key: string, value: any) { this.store.set(key, value); }
}
```

**Extended VSL Interface** (for production runtimes):
```typescript
interface VSLExtended extends ValueStateLayer {
  // Node-level operations
  readNode(type: string, id: string): Promise<Node>;
  writeNode(type: string, id: string, data: Node): Promise<void>;
  deleteNode(type: string, id: string): Promise<void>;
  
  // Graph-level operations
  queryGraph(query: GraphQuery): Promise<Node[]>;
  
  // Snapshot/restore for rollback
  createSnapshot(): Promise<string>;
  restoreSnapshot(snapshotId: string): Promise<void>;
  
  // Transactional support (ACID VSL only)
  beginTransaction(): Promise<TransactionHandle>;
  commitTransaction(handle: TransactionHandle): Promise<void>;
  rollbackTransaction(handle: TransactionHandle): Promise<void>;
}
```

### 3.3 PSG (Project Semantic Graph)

**Definition**: The hypergraph data structure representing the project state. Serves as the single source of truth.

**Graph Structure**:
```
G = (N, E)
  N = {Context, Plan, Steps[], Trace, Segments[], Confirm, ...}
  E = {(Plan, Context), (Step[i], Step[j]), (Trace, Plan), ...}
```

**Graph Properties** (normative):
1. **DAG for Plans**: Plan steps form directed acyclic graph (no cycles)
2. **Referential Integrity**: All `*_id` references resolve to valid nodes
3. **Temporal Ordering**: Trace segments have monotonic timestamps
4. **Immutable History**: Trace nodes cannot be modified after creation

**PSG Operations**:
From `docs/14-runtime/module-psg-paths.md`:
- **Create**: `POST /psg/contexts`, `POST /psg/plans`
- **Read**: `GET /psg/contexts/:id`, `GET /psg/plans/:id`
- **Update**: `PATCH /psg/plans/:id/status`
- **Delete**: `DELETE /psg/plans/:id` (soft delete with tombstone)

### 3.4 Orchestrator

**Definition**: The control loop that schedules AEL operations based on PSG state and L2 Profile rules.

**Orchestration Algorithm** (SA Profile):
```python
def orchestrate_sa_profile(context, plan, vsl, ael):
  # 1. Validate SA invariants
  assert plan.context_id == context.context_id
  assert len(plan.steps) >= 1
  assert context.status == "active"
  
  # 2. Transition Plan status
  plan.status = "in_progress"
  emit_pipeline_stage_event(plan, "in_progress")
  
  # 3. Execute steps in dependency order
  for step in topological_sort(plan.steps):
    # Wait for dependencies
    wait_for_dependencies(step, vsl)
    
    # Execute step
    step.status = "in_progress"
    emit_pipeline_stage_event(step, "in_progress")
    
    action = {
      "type": "step_execution",
      "step_id": step.step_id,
      "agent_role": step.agent_role
    }
    result = await ael.execute(action)
    
    # Update PSG
    step.status = "completed" if result.success else "failed"
    vsl.set(f"steps/{step.step_id}", step)
    emit_graph_update_event("node_update", step.step_id)
    emit_pipeline_stage_event(step, step.status)
  
  # 4. Finalize Plan
  plan.status = "completed" if all_steps_succeeded(plan) else "failed"
  vsl.set(f"plans/{plan.plan_id}", plan)
  emit_pipeline_stage_event(plan, plan.status)
```

## 4. Binding Points & Contracts

### 4.1 L1 L2 Binding

**Contract**: L2 modules MUST use L1 schemas for all data structures

**Example**:
```typescript
// L1 defines Plan schema
const planSchema = require('schemas/v2/mplp-plan.schema.json');

// L2 Plan Module MUST validate against L1 schema
function createPlan(data: any): Plan {
  const valid = ajv.validate(planSchema, data);
  if (!valid) {
    throw new Error(`Invalid Plan: ${ajv.errorsText()}`);
  }
  return data as Plan;
}
```

### 4.2 L2 L3 Binding

**Contract**: L3 runtime MUST enforce L2 state transition rules

**Example** (Plan Module):
```typescript
const validTransitions = {
  draft: ["proposed"],
  proposed: ["approved", "draft"],
  approved: ["in_progress"],
  in_progress: ["completed", "failed", "cancelled"]
};

function transitionPlanStatus(plan: Plan, newStatus: PlanStatus): Plan {
  if (!validTransitions[plan.status].includes(newStatus)) {
    throw new Error(`Invalid transition: ${plan.status} ${newStatus}`);
  }
  plan.status = newStatus;
  return plan;
}
```

### 4.3 L3 L4 Binding

**Contract**: L4 emits integration events, L3 consumes them

**Example** (File Update Event):
```typescript
// L4 Adapter emits
const fileEvent: FileUpdateEvent = {
  file_path: "/src/index.ts",
  change_type: "modified",
  timestamp: new Date().toISOString()
};
eventBus.emit('integration.file_update', fileEvent);

// L3 Runtime consumes
eventBus.on('integration.file_update', async (event) => {
  await detectDrift(event);
  await updatePSGMetadata(event);
  await emit('observability.graph_update', {...});
});
```

## 5. Advanced Interaction Models

### 5.1 Drift Detection Flow (Detailed)

**From** `docs/14-runtime/drift-and-rollback.md` + implementation analysis:

**Passive Strategy** (Event-Driven):
<MermaidDiagram id="2d4ae71db41b70f6" />

**Active Strategy** (Polling):
```python
async def active_drift_detection(psg, vsl, interval_ms=5000):
  while True:
    await asyncio.sleep(interval_ms / 1000)
    
    # 1. Get all files from PSG
    psg_files = await psg.query({type: "file"})
    
    # 2. Scan file system
    fs_files = await scan_file_system()
    
    # 3. Compute diff
    added = fs_files - psg_files
    deleted = psg_files - fs_files
    modified = [f for f in psg_files & fs_files 
                if hash(fs[f]) != hash(psg[f])]
    
    # 4. Reconcile
    for file in added + modified:
      await reconcile_file(file, strategy="fs_wins")
    for file in deleted:
      await reconcile_file(file, strategy="psg_wins")
```

### 5.2 MAP Coordination Flow (Broadcast Mode)

**From**: `schemas/v2/invariants/map-invariants.yaml` + `mplp-collab.schema.json`

**Broadcast Coordination** (detailed algorithm):
```python
async def broadcast_coordination(collab_session, plan, ael):
  # Validate MAP invariants
  assert len(collab_session.participants) >= 2
  assert collab_session.mode == "broadcast"
  
  # Get parallel steps (no dependencies)
  parallel_steps = [
    step for step in plan.steps 
    if len(step.dependencies) == 0
  ]
  
  # Dispatch turns
  turn_ids = []
  for step in parallel_steps:
    # Find participant with matching role
    participant = next(
      p for p in collab_session.participants 
      if p.role_id == step.agent_role
    )
    
    # Emit MAPTurnDispatched event
    turn_id = uuid.v4()
    emit_event({
      "event_family": "external_integration",
      "event_type": "map_turn_dispatched",
      "session_id": collab_session.collab_id,
      "turn_id": turn_id,
      "participant_id": participant.participant_id,
      "step_id": step.step_id
    })
    turn_ids.append(turn_id)
  
  # Parallel execution
  results = await asyncio.gather(*[
    ael.execute({
      "type": "agent_execution",
      "participant_id": p.participant_id,
      "context": {...}
    })
    for p in matching_participants
  ])
  
  # Validate turn completion events
  for turn_id in turn_ids:
    assert received_turn_completed_event(turn_id), \
      f"MAP invariant violated: turn {turn_id} did not complete"
  
  # Merge results into PSG
  for step, result in zip(parallel_steps, results):
    step.status = "completed"
    step.output = result
    update_psg_node(step)
```

### 5.3 Round-Robin Coordination

```python
async def round_robin_coordination(collab_session, plan, ael):
  assert collab_session.mode == "round_robin"
  assert len(collab_session.participants) >= 2
  
  # Execute steps in strict order
  for step in topological_sort(plan.steps):
    # Find next participant in round-robin order
    current_turn = step.order_index % len(collab_session.participants)
    participant = collab_session.participants[current_turn]
    
    # Execute step
    result = await ael.execute({
      "type": "agent_execution",
      "participant_id": participant.participant_id,
      "step": step
    })
    
    # Update PSG
    step.status = "completed"
    step.executed_by = participant.participant_id
    update_psg_node(step)
```

## 6. Schema-Derived Constraints (Informative)

> **Note**: The following constraints are schema-derived restatements for explanatory purposes.
> They do not define protocol obligations. See source schemas for normative definitions.

### 6.1 Atomic State Transitions

**Constraint**: The VSL is expected to ensure that PSG updates are atomic to prevent inconsistent states.

> **Schema**: `runtime-minimal interface`
> **Note**: Informative restatement. Not a protocol obligation.

**Implementation** (for ACID VSL):
```typescript
async function atomicPlanTransition(
  plan: Plan,
  newStatus: PlanStatus,
  vsl: VSLExtended
): Promise<Plan> {
  const tx = await vsl.beginTransaction();
  try {
    // 1. Validate transition
    if (!isValidTransition(plan.status, newStatus)) {
      throw new Error("Invalid transition");
    }
    
    // 2. Update plan
    plan.status = newStatus;
    await vsl.writeNode("Plan", plan.plan_id, plan, tx);
    
    // 3. Update dependent nodes (e.g., Trace)
    const trace = await vsl.readNode("Trace", plan.trace_id, tx);
    trace.plan_status = newStatus;
    await vsl.writeNode("Trace", trace.trace_id, trace, tx);
    
    // 4. Commit transaction
    await vsl.commitTransaction(tx);
    return plan;
  } catch (error) {
    await vsl.rollbackTransaction(tx);
    throw error;
  }
}
```

### 6.2 Deterministic Execution

**Requirement**: Given the same PSG state and inputs, the Orchestrator SHOULD make deterministic scheduling decisions.

**Implementation**:
```python
def deterministic_step_order(plan: Plan) -> List[Step]:
  # Topological sort with tie-breaking
  sorted_steps = topological_sort(plan.steps)
  
  # For steps with no dependencies (tie), use order_index
  def compare_steps(a, b):
    if len(a.dependencies) == len(b.dependencies):
      return a.order_index - b.order_index  # Deterministic tie-breaker
    return len(a.dependencies) - len(b.dependencies)
  
  sorted_steps.sort(key=cmp_to_key(compare_steps))
  return sorted_steps
```

### 6.3 Event Causality

**Constraint**: The runtime is expected to preserve the causal ordering of events (e.g., a Plan cannot be executed before it is created).

> **Note**: Informative restatement. Not a protocol obligation.

**Implementation** (Lamport timestamps):
```typescript
class CausalEventBus {
  private clock: number = 0;
  
  emit(event: Event): void {
    // Increment logical clock
    this.clock++;
    event.lamport_timestamp = this.clock;
    
    // Validate causality
    if (event.event_type === "plan_execution_started") {
      const planCreatedEvent = this.findEvent({
        event_type: "plan_created",
        plan_id: event.plan_id
      });
      
      if (!planCreatedEvent) {
        throw new Error("Causality violation: Plan executed before creation");
      }
      
      if (planCreatedEvent.lamport_timestamp >= event.lamport_timestamp) {
        throw new Error("Causality violation: Timestamps out of order");
      }
    }
    
    this.publishEvent(event);
  }
}
```

## 7. Versioning & Migration

### 7.1 State Migration

**Requirement**: When upgrading Runtime versions, the VSL MUST provide migration logic for PSG schema changes.

**Example** (v1.0.0 v1.1.0 migration):
```typescript
async function migratePSG_v1_to_v1_1(vsl: VSL): Promise<void> {
  // 1. Check current version
  const version = await vsl.get("psg_schema_version");
  if (version !== "1.0.0") {
    throw new Error(`Expected v1.0.0, found ${version}`);
  }
  
  // 2. Migrate Plans (add new "priority" field)
  const plans = await vsl.queryGraph({ type: "Plan" });
  for (const plan of plans) {
    plan.priority = plan.priority || "medium"; // Default value
    await vsl.writeNode("Plan", plan.plan_id, plan);
  }
  
  // 3. Update version
  await vsl.set("psg_schema_version", "1.1.0");
}
```

### 7.2 Protocol Compatibility

**Requirement**: Runtimes SHOULD declare which Protocol Version they support in metadata.

**Example**:
```json
{
  "runtime_name": "mplp-runtime-ts",
  "runtime_version": "2.0.0",
  "supported_protocol_versions": ["1.0.0", "1.0.1"],
  "supported_profiles": ["SA", "MAP"]
}
```

## 8. Security & Safety

### 8.1 AEL Sandboxing

**Constraint**: In multi-tenant environments, the AEL is expected to enforce strict resource limits on agent execution.

> **Note**: Informative restatement. Not a protocol obligation.

**Implementation** (using Docker containers):
```yaml
# docker-compose.yml
services:
  agent-executor:
    image: mplp/agent-executor
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    environment:
      - MAX_EXECUTION_TIME=300s
      - NETWORK_ISOLATION=true
```

**Alternative** (Node.js vm2 sandboxing):
```typescript
import { VM } from 'vm2';

async function executeAgentCode(code: string, timeout: number = 30000): Promise<any> {
  const vm = new VM({
    timeout: timeout,
    sandbox: {
      // Provide safe APIs only
      console: { log: (...args) => logger.info(...args) },
      // Block dangerous APIs
      require: undefined,
      process: undefined,
      global: undefined
    }
  });
  
  return vm.run(code);
}
```

### 8.2 VSL Encryption

**Requirement**: In sensitive environments, the VSL SHOULD encrypt PSG data at rest.

**Implementation** (AES-256-GCM):
```typescript
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

class EncryptedVSL implements ValueStateLayer {
  private backend: ValueStateLayer;
  private key: Buffer;
  
  constructor(backend: ValueStateLayer, encryptionKey: string) {
    this.backend = backend;
    this.key = Buffer.from(encryptionKey, 'hex');
  }
  
  async get(key: string): Promise<any> {
    const encrypted = await this.backend.get(key);
    if (!encrypted) return null;
    
    const [iv, authTag, ciphertext] = encrypted.split('::');
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }
  
  async set(key: string, value: any): Promise<void> {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    
    let encrypted = cipher.update(JSON.stringify(value), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    const payload = `${iv.toString('hex')}::${authTag.toString('hex')}::${encrypted}`;
    await this.backend.set(key, payload);
  }
}
```

## 9. Performance Considerations

### 9.1 VSL Caching

**Strategy**: Cache frequently accessed PSG nodes in memory

```typescript
class CachedVSL implements ValueStateLayer {
  private backend: ValueStateLayer;
  private cache: Map<string, { value: any, timestamp: number }> = new Map();
  private ttl: number = 60000; // 60 seconds
  
  async get(key: string): Promise<any> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.value;
    }
    
    const value = await this.backend.get(key);
    this.cache.set(key, { value, timestamp: Date.now() });
    return value;
  }
  
  async set(key: string, value: any): Promise<void> {
    await this.backend.set(key, value);
    this.cache.set(key, { value, timestamp: Date.now() });
  }
}
```

### 9.2 AEL Parallelization

**Strategy**: Execute independent actions in parallel

```typescript
async function parallelAELExecution(
  actions: Action[],
  ael: ActionExecutionLayer
): Promise<ActionResult[]> {
  // Identify independent actions (no data dependencies)
  const independentGroups = partitionByDependencies(actions);
  
  const results: ActionResult[] = [];
  for (const group of independentGroups) {
    // Execute group in parallel
    const groupResults = await Promise.all(
      group.map(action => ael.execute(action))
    );
    results.push(...groupResults);
  }
  
  return results;
}
```

## 10. Related Documents

**Layer Specifications**:
- [Architecture Overview](index.mdx)
- [L1 Core Protocol](l1-core-protocol.md)
- [L2 Coordination & Governance](l2-coordination-governance.md)
- [L3 Execution & Orchestration](l3-execution-orchestration.md)
- [L4 Integration Infrastructure](l4-integration-infra.md)
[AEL](/docs/guides/runtime/ael.md)
[VSL](/docs/guides/runtime/vsl.md)
---

**Core Abstractions**: AEL (execute), VSL (get/set/snapshot/restore), PSG (graph), Orchestrator (scheduler)  
**Advanced Topics**: Drift detection algorithms (passive/active), MAP coordination (broadcast/round-robin), atomic transactions, encryption, caching, parallelization  
**Reference Implementations**: InMemoryVSL (37 lines), InMemoryAEL (41 lines), EncryptedVSL (example), CachedVSL (example)