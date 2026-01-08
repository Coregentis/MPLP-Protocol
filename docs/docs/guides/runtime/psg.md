---
sidebar_position: 2

doc_type: normative
normativity: normative
status: frozen
authority: MPGC
description: "The Project Semantic Graph (PSG) is the runtime state substrate of MPLP."
title: PSG – Project Semantic Graph
keywords: [MPLP, PSG, Project Semantic Graph, Runtime, State Graph]
sidebar_label: PSG - Project Semantic Graph

---


# PSG – Project Semantic Graph


## 1. Scope

This specification defines the normative requirements for **PSG – Project Semantic Graph**.

## 2. Non-Goals

This specification does not mandate specific implementation details beyond the defined interfaces and invariants.

## 3. Purpose

The **Project Semantic Graph (PSG)** is the "Brain" of the MPLP runtime – the semantic substrate that models all entities, relationships, and state transitions within an agent project. PSG provides a clean graph abstraction over raw storage (VSL).

**Key Responsibilities**:
- Model protocol entities (Context, Plan, Step, Trace, etc.)
- Enforce semantic relationships (Plan → Context, Step → Plan)
- Track state transitions with history
- Provide graph queries for complex lookups
- Enable drift detection by comparing reality vs. expected state

**Design Principle**: "PSG is the semantic truth; VSL is the physical storage"

## 4. Core Concepts

### 4.1 Nodes

PSG organizes protocol objects as **nodes** in a directed property graph:

| Node Type | Description | Key Fields |
|:---|:---|:---|
| **ContextNode** | Root of a lifecycle | `context_id`, `source`, `constraints` |
| **PlanNode** | A sequence of proposed actions | `plan_id`, `context_id`, `steps[]` |
| **StepNode** | Atomic unit of work | `step_id`, `plan_id`, `status` |
| **TraceNode** | Execution record | `trace_id`, `context_id`, `segments[]` |
| **ConfirmNode** | Governance gate | `confirm_id`, `target_id`, `status` |
| **RoleNode** | Agent identity and capabilities | `role_id`, `capabilities[]` |
| **CollabNode** | Multi-agent session state | `collab_id`, `participants[]` |
| **DialogNode** | Message exchange | `dialog_id`, `turns[]` |
| **ExtensionNode** | Tool/integration registry | `extension_id`, `tools[]` |
| **NetworkNode** | Agent topology | `network_id`, `connections[]` |

### 4.2 Edges

Nodes are connected by **typed edges** that enforce semantic integrity:

| Edge Type | Description | Example |
|:---|:---|:---|
| `HAS_CONTEXT` | Links Plan → Context | `plan.context_id → context` |
| `CONTAINS` | Links Plan → Step[] | `plan.steps → step[]` |
| `DEPENDS_ON` | Links Step B → Step A | `step.dependencies → step_id[]` |
| `ASSIGNED_TO` | Links Step → Role | `step.agent_role → role_id` |
| `TRACES` | Links Trace → Context | `trace.context_id → context` |
| `CONFIRMS` | Links Confirm → Target | `confirm.target_id → plan/step` |
| `PRODUCES` | Links Step → Artifact | `step.outputs → artifact[]` |

## 5. Normative Interface

### 5.1 Core Interface

```typescript
export interface ProjectSemanticGraph {
  // Node operations
  getNode<T>(type: string, id: string): Promise<T | null>;
  putNode<T>(type: string, id: string, data: T): Promise<void>;
  deleteNode(type: string, id: string): Promise<void>;
  
  // Edge operations
  getEdges(fromType: string, fromId: string, edgeType: string): Promise<Edge[]>;
  addEdge(from: NodeRef, to: NodeRef, edgeType: string): Promise<void>;
  removeEdge(from: NodeRef, to: NodeRef, edgeType: string): Promise<void>;
  
  // Query operations
  query(query: GraphQuery): Promise<Node[]>;
  traverse(startId: string, edgeTypes: string[], depth: number): Promise<Node[]>;
}

interface NodeRef {
  type: string;
  id: string;
}

interface Edge {
  from: NodeRef;
  to: NodeRef;
  edgeType: string;
  metadata?: Record<string, any>;
}
```

### 5.2 Reference Implementation

**InMemoryPSG**:

```typescript
export class InMemoryPSG implements ProjectSemanticGraph {
  private nodes = new Map<string, Map<string, any>>();  // type -> id -> data
  private edges = new Map<string, Edge[]>();            // fromKey -> edges
  
  async getNode<T>(type: string, id: string): Promise<T | null> {
    const typeMap = this.nodes.get(type);
    return typeMap?.get(id) || null;
  }
  
  async putNode<T>(type: string, id: string, data: T): Promise<void> {
    if (!this.nodes.has(type)) {
      this.nodes.set(type, new Map());
    }
    this.nodes.get(type)!.set(id, data);
  }
  
  async query(query: GraphQuery): Promise<Node[]> {
    const typeMap = this.nodes.get(query.type);
    if (!typeMap) return [];
    
    return Array.from(typeMap.values())
      .filter(node => this.matchesFilters(node, query.filters || []))
      .slice(query.offset || 0, (query.offset || 0) + (query.limit || 100));
  }
}
```

### 5.3 Production Interface (Extended)

```typescript
export interface PSGExtended extends ProjectSemanticGraph {
  // Lifecycle operations
  initialize(): Promise<void>;
  close(): Promise<void>;
  
  // Bulk operations
  bulkPut(nodes: { type: string; id: string; data: any }[]): Promise<void>;
  bulkQuery(queries: GraphQuery[]): Promise<Node[][]>;
  
  // Snapshot for drift detection
  getStateHash(): Promise<string>;
  compareState(expectedHash: string): Promise<DriftResult>;
  
  // Event binding
  onNodeChange(callback: (event: NodeChangeEvent) => void): void;
  onEdgeChange(callback: (event: EdgeChangeEvent) => void): void;
  
  // VSL binding
  getVSL(): ValueStateLayer;
}

interface DriftResult {
  hasDrift: boolean;
  driftedNodes: { type: string; id: string; reason: string }[];
}

interface NodeChangeEvent {
  type: 'created' | 'updated' | 'deleted';
  nodeType: string;
  nodeId: string;
  oldValue?: any;
  newValue?: any;
}
```

## 6. Normative Requirements (MUST/SHALL)

### 6.1 Semantic Integrity

**Requirement**: The PSG **MUST** enforce parent-child relationships

**Example** (invalid operation):
```typescript
// MUST fail: Step without Plan
await psg.putNode('Step', 'step-123', {
  step_id: 'step-123',
  plan_id: 'plan-nonexistent',  // Plan doesn't exist
  description: 'Orphan step'
});
// Error: Cannot create Step without existing Plan
```

**Enforcement**:
```typescript
async putNode<T>(type: string, id: string, data: T): Promise<void> {
  // Validate parent references
  if (type === 'Step' && data.plan_id) {
    const plan = await this.getNode('Plan', data.plan_id);
    if (!plan) {
      throw new Error(`Plan ${data.plan_id} does not exist`);
    }
  }
  
  if (type === 'Plan' && data.context_id) {
    const context = await this.getNode('Context', data.context_id);
    if (!context) {
      throw new Error(`Context ${data.context_id} does not exist`);
    }
  }
  
  await this.storage.put(type, id, data);
}
```

### 6.2 Unique IDs

**Requirement**: The PSG **MUST** ensure all node IDs are unique within their type

**Enforcement**:
```typescript
async putNode<T>(type: string, id: string, data: T): Promise<void> {
  // UUID v4 format validation
  if (!isValidUUIDv4(id)) {
    throw new Error(`Invalid ID format: ${id}`);
  }
  
  await this.storage.put(type, id, data);
}
```

### 6.3 Status Transition Validation

**Requirement**: The PSG **MUST** validate status transitions for lifecycle objects

**Valid Transitions**:

| Object | Valid Transitions |
|:---|:---|
| Plan | `draft → proposed → approved → in_progress → completed/failed` |
| Step | `pending → running → completed/failed/skipped` |
| Confirm | `pending → approved/rejected/cancelled` |
| Trace | `recording → completed` |

**Enforcement**:
```typescript
async updateStatus(type: string, id: string, newStatus: string): Promise<void> {
  const node = await this.getNode(type, id);
  const currentStatus = node.status;
  
  if (!this.isValidTransition(type, currentStatus, newStatus)) {
    throw new Error(
      `Invalid status transition: ${type} cannot go from ${currentStatus} to ${newStatus}`
    );
  }
  
  node.status = newStatus;
  await this.putNode(type, id, node);
}
```

### 6.4 Read-After-Write Consistency

**Requirement**: The PSG **MUST** provide read-after-write consistency

**Test**:
```typescript
// Write
await psg.putNode('Plan', 'plan-123', { plan_id: 'plan-123', status: 'draft' });

// Read (MUST return the plan just written)
const plan = await psg.getNode('Plan', 'plan-123');
assert(plan.status === 'draft');  // MUST pass
```

### 6.5 Event Emission

**Requirement**: The PSG **SHALL** emit events for all state changes

**Events**:
- `GraphUpdateEvent` — Emitted on node/edge changes
- Maps to `graph_update` event family in observability

**Example**:
```typescript
async putNode<T>(type: string, id: string, data: T): Promise<void> {
  const existing = await this.getNode(type, id);
  
  await this.storage.put(type, id, data);
  
  // Emit event
  await this.eventBus.emit({
    event_family: 'graph_update',
    event_type: existing ? 'node_updated' : 'node_created',
    payload: {
      node_type: type,
      node_id: id,
      old_value: existing,
      new_value: data
    }
  });
}
```

## 7. Cross-Module Bindings

| Module | PSG Path | Operations |
|:---|:---|:---|
| **Context** | `psg.contexts/<context_id>` | CRUD for Context objects |
| **Plan** | `psg.plans/<plan_id>` | CRUD + status transitions |
| **Trace** | `psg.traces/<trace_id>` | Append-only segments |
| **Confirm** | `psg.confirms/<confirm_id>` | Status + decisions |
| **Role** | `psg.roles/<role_id>` | Capabilities lookup |
| **Collab** | `psg.collabs/<collab_id>` | Session state |
| **Dialog** | `psg.dialogs/<dialog_id>` | Turn append |
| **Extension** | `psg.extensions/<ext_id>` | Tool registry |
| **Network** | `psg.networks/<net_id>` | Topology |

## 8. VSL Relationship

### 8.1 PSG over VSL

PSG is a **logical layer** over VSL (physical storage):

```
┌─────────────────────────────────────┐
│           PSG (Semantic)            │
│  Nodes, Edges, Queries, Validation  │
├─────────────────────────────────────┤
│           VSL (Physical)            │
│  K-V Store, Event Log, Snapshots    │
└─────────────────────────────────────┘
```

### 8.2 Translation

```typescript
// PSG operation (semantic)
const plan = await psg.getNode('Plan', 'plan-123');

// Translates to VSL operation (physical)
const plan = await vsl.get('plans/plan-123');
```

## 9. Invariants

### 9.1 Parent Existence

**Invariant**: A child node **MUST NOT** exist without its parent

| Child | Parent Requirement |
|:---|:---|
| Plan | Context MUST exist |
| Step | Plan MUST exist |
| Trace | Context MUST exist |
| Confirm | Target (Plan/Step) MUST exist |

### 9.2 Terminal State Immutability

**Invariant**: Nodes in terminal states **MUST NOT** be modified

| Object | Terminal States |
|:---|:---|
| Plan | `completed`, `failed`, `cancelled` |
| Step | `completed`, `failed`, `skipped` |
| Trace | `completed` |

### 9.3 ID Immutability

**Invariant**: Node IDs **MUST NOT** change after creation

## 10. Governance Considerations

### 10.1 Auditability

PSG provides complete audit trail via:
- `GraphUpdateEvent` for all changes
- `Trace` segments for execution history
- Immutable terminal states

### 10.2 Portability

PSG state can be exported/imported via VSL:

```typescript
// Export PSG
const state = {
  contexts: await psg.query({ type: 'Context' }),
  plans: await psg.query({ type: 'Plan' }),
  traces: await psg.query({ type: 'Trace' })
};

// Import PSG
for (const context of state.contexts) {
  await psg.putNode('Context', context.context_id, context);
}
```

### 10.3 Drift Detection

PSG enables drift detection by comparing expected vs. actual state:

```typescript
async function detectDrift(psg: PSG, expectedHash: string): Promise<DriftResult> {
  const currentHash = await psg.getStateHash();
  
  if (currentHash === expectedHash) {
    return { hasDrift: false, driftedNodes: [] };
  }
  
  // Identify specific drift
  const driftedNodes = await psg.compareState(expectedHash);
  return { hasDrift: true, driftedNodes };
}
```

## 11. Related Documents

**Architecture**:
- [L3 Execution & Orchestration](/docs/specification/architecture)
- [L1-L4 Deep Dive](/docs/specification/architecture)

**Runtime Components**:
- [VSL (Value State Layer)](vsl.md)
- [AEL (Action Execution Layer)](ael.md)
- [Drift and Rollback](drift-and-rollback.md)
- [Module-PSG Paths](module-psg-paths.md)

**Observability**:
- [Graph Update Events](/docs/specification/observability/event-taxonomy.md)

---

**Core Interface**: `getNode()`, `putNode()`, `query()`  
**Reference Implementation**: InMemoryPSG  
**Invariants**: Parent existence, Terminal immutability, ID immutability  
**Relationship**: PSG (semantic) over VSL (physical)