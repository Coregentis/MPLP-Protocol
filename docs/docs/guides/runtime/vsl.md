---
sidebar_position: 4

doc_type: normative
normativity: normative
status: frozen
authority: MPGC
description: "Value State Layer (VSL) reference for state persistence implementations."
title: VSL - Value State Layer

---


# VSL - Value State Layer


## 1. Scope

This specification defines the normative requirements for **VSL – Value State Layer**.

## 2. Non-Goals

This specification does not mandate specific implementation details beyond the defined interfaces and invariants.

## 3. Purpose

The **Value State Layer (VSL)** is the "Memory" of the MPLP runtime – the abstraction that persists all project state, events, and execution history. VSL provides a clean separation between logical state (PSG) and physical storage (filesystem, database, object store).

**Key Responsibilities**:
- Persist protocol objects (Context, Plan, Trace, etc.)
- Store event logs (observability, runtime execution)
- Provide snapshot/restore for rollback
- Abstract storage backends (in-memory, Redis, Postgres, S3)
- Ensure consistency for concurrent access

**Design Principle**: "VSL is a dumb storet persists bytes, the runtime provides semantics"

## 4. Normative Interface

### 4.1 Core Interface

**From**: `packages/sdk-ts/src/runtime-minimal/index.ts` (lines 24-27)

```typescript
export interface ValueStateLayer {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
}
```

**Minimal yet sufficient**: Two methods handle all persistence

### 4.2 Reference Implementation

**InMemoryVSL** (`runtime-minimal/index.ts` lines 33-37):

```typescript
export class InMemoryVSL implements ValueStateLayer {
  private store = new Map<string, any>();
  async get(key: string) { return this.store.get(key); }
  async set(key: string, value: any) { this.store.set(key, value); }
}
```

**Purpose**: Development/testing onlytate lost on restart

### 4.3 Production Interface (Extended)

**From**: `docs/01-architecture/l1-l4-architecture-deep-dive.md`

```typescript
export interface VSLExtended extends ValueStateLayer {
  // Core K-V operations
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  
  // Node-level operations (PSG abstraction)
  readNode(type: string, id: string): Promise<Node>;
  writeNode(type: string, id: string, data: Node): Promise<void>;
  deleteNode(type: string, id: string): Promise<void>;
  
  // Query operations
  queryGraph(query: GraphQuery): Promise<Node[]>;
  queryByType(type: string): Promise<Node[]>;
  queryByField(field: string, value: any): Promise<Node[]>;
  
  // Snapshot/restore (for rollback)
  createSnapshot(): Promise<string>;           // Returns snapshot ID
  restoreSnapshot(snapshotId: string): Promise<void>;
  listSnapshots(): Promise<SnapshotInfo[]>;
  deleteSnapshot(snapshotId: string): Promise<void>;
  
  // Transaction support (ACID VSL only)
  beginTransaction(): Promise<TransactionHandle>;
  commitTransaction(handle: TransactionHandle): Promise<void>;
  rollbackTransaction(handle: TransactionHandle): Promise<void>;
  
  // Append-only log (for events)
  appendEvent(event: MplpEvent): Promise<void>;
  getEventsByTraceId(trace_id: string): Promise<MplpEvent[]>;
  getEventsByContextId(context_id: string): Promise<MplpEvent[]>;
  
  // Maintenance
  compact?(): Promise<void>;                    // Garbage collection
  getMetrics?(): Promise<StorageMetrics>;
}

interface Node {
  type: string;      // 'Context' | 'Plan' | 'Trace' | ...
  id: string;        // UUID v4
  data: any;         // JSON-serializable object
  created_at?: string;
  updated_at?: string;
}

interface GraphQuery {
  type?: string;
  filters?: { field: string; op: '=' | '!=' | '>' | '<'; value: any }[];
  limit?: number;
  offset?: number;
}

interface SnapshotInfo {
  snapshot_id: string;
  created_at: string;
  size_bytes: number;
  description?: string;
}

interface TransactionHandle {
  tx_id: string;
  isolation_level: 'read_uncommitted' | 'read_committed' | 'repeatable_read' | 'serializable';
}
```

## 5. Normative Requirements (MUST/SHALL)

### 5.1 Key-Value Interface

**Requirement**: The VSL **MUST** provide a Key-Value interface for Protocol Object storage

**Operations**: `get(key)`, `set(key, value)`, `delete(key)`

**Example**:
```typescript
// Store Plan
await vsl.set('plans/plan-123', {
  plan_id: 'plan-123',
  context_id: 'ctx-456',
  title: 'Fix Bug',
  status: 'in_progress',
  steps: [...]
});

// Retrieve Plan
const plan = await vsl.get('plans/plan-123');
```

**Key Convention**:
- `contexts/<context_id>` Context objects
- `plans/<plan_id>` Plan objects
- `traces/<trace_id>` Trace objects
- `events/<event_id>` Event objects (if not using append-only log)

### 5.2 Append-Only Event Log

**Requirement**: The VSL **MUST** provide an Append-Only interface for Event Logs

**Why**: Events are append-only historical recordsppend-only ensures integrity

**Example**:
```typescript
await vsl.appendEvent({
  event_id: "550e8400-e29b-41d4-a716-446655440000",
  event_family: "pipeline_stage",
  event_type: "plan_status_changed",
  timestamp: "2025-12-07T00:00:00.000Z",
  payload: {
    plan_id: "plan-123",
    old_status: "approved",
    new_status: "in_progress"
  }
});
```

**Append-Only Invariant**: Once appended, events **MUST NOT** be modified

### 5.3 Read-After-Write Consistency

**Requirement**: The VSL **MUST** provide Read-after-Write consistency for the Orchestrator

**Why**: Orchestrator must see its own writes immediately to maintain PSG integrity

**Example** (MUST work):
```typescript
// Write
await vsl.set('plans/plan-123', plan);

// Read (MUST return the plan just written, not stale data)
const retrieved = await vsl.get('plans/plan-123');
assert.deepEqual(retrieved, plan);  // MUST pass
```

**Note**: Eventual consistency is INSUFFICIENT for single-runtime execution

### 5.4 Pluggable Backends

**Requirement**: The VSL **SHOULD** support pluggable backends

**Backends**:
1.  **In-Memory** (development)
2.  **FileSystem** (simple deployments)
3.  **Redis** (production, distributed)
4.  **PostgreSQL** (production, ACID)
5.  **S3/GCS** (archival, cold storage)

**Example** (Backend abstraction):
```typescript
class FileSystemVSL implements ValueStateLayer {
  private basePath: string;
  
  async get(key: string): Promise<any> {
    const filePath = path.join(this.basePath, `${key}.json`);
    const data = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  }
  
  async set(key: string, value: any): Promise<void> {
    const filePath = path.join(this.basePath, `${key}.json`);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, JSON.stringify(value, null, 2));
  }
}

class RedisVSL implements ValueStateLayer {
  private client: RedisClient;
  
  async get(key: string): Promise<any> {
    const data = await this.client.get(key);
    return data  JSON.parse(data) : null;
  }
  
  async set(key: string, value: any): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
  }
}
```

### 5.5 Durability Policy

**Requirement**: The VSL **MUST** persist data according to the configured durability policy

**Policies**:
-   **Ephemeral**: In-memory only (testing)
-   **Durable**: Persist to disk/database (production)
-   **Replicated**: Multi-node replication (high availability)

**Example** (Durability levels):
```typescript
enum DurabilityLevel {
  EPHEMERAL = 0,      // No persistence
  DURABLE = 1,        // fsync after write
  REPLICATED = 2      // Wait for 2+ replicas
}

class DurableVSL implements ValueStateLayer {
  constructor(private level: DurabilityLevel) {}
  
  async set(key: string, value: any): Promise<void> {
    await this.writeToStorage(key, value);
    
    if (this.level >= DurabilityLevel.DURABLE) {
      await this.fsync();  // Force flush to disk
    }
    
    if (this.level >= DurabilityLevel.REPLICATED) {
      await this.waitForReplication(key, 2);  // Wait for 2 replicas
    }
  }
}
```

### 5.6 Event Retrieval by ID

**Requirement**: The VSL **MUST** support retrieval of events by `trace_id` or `context_id`

**Why**: Enable trace reconstruction, audit queries

**Example**:
```typescript
// Get all events for a trace
const events = await vsl.getEventsByTraceId('trace-789');

// Get all events for a context
const contextEvents = await vsl.getEventsByContextId('ctx-456');
```

**Index Requirements**: VSL implementation SHOULD index events by `trace_id` and `context_id` for performance

### 5.7 Data Integrity

**Requirement**: The VSL **MUST NOT** modify the data payload (it is a dumb store)

**Bad** 
```typescript
async set(key: string, value: any): Promise<void> {
  // VSL modifies data
  value.modified_at = new Date().toISOString();
  await this.storage.put(key, value);
}
```

**Good** 
```typescript
async set(key: string, value: any): Promise<void> {
  // VSL stores data as-is
  await this.storage.put(key, value);
}
```

**Rationale**: Metadata enrichment is the runtime's responsibility, not VSL's

### 5.8 Concurrent Access Safety

**Requirement**: The VSL **SHALL** handle concurrent access safely (e.g., file locking)

**Challenge**: Multiple processes/threads accessing same VSL

**Solutions**:
1.  **File Locking** (filesystem VSL)
2.  **Optimistic Locking** (with version numbers)
3.  **Database Transactions** (Postgres VSL)

**Example** (File locking):
```typescript
class LockingFileSystemVSL implements ValueStateLayer {
  private locks = new Map<string, Promise<void>>();
  
  async set(key: string, value: any): Promise<void> {
    // Acquire lock
    const lock = this.acquireLock(key);
    await lock;
    
    try {
      // Write file
      await fs.promises.writeFile(this.getPath(key), JSON.stringify(value));
    } finally {
      // Release lock
      this.releaseLock(key);
    }
  }
  
  private async acquireLock(key: string): Promise<void> {
    while (this.locks.has(key)) {
      await this.locks.get(key);
    }
    const resolve = () => {};
    this.locks.set(key, new Promise(resolve));
  }
}
```

## 6. Cross-Module Bindings

**All Modules** persist state via VSL:

| Module | VSL Key Pattern | Example |
|:---|:---|:---|
| Context | `contexts/<context_id>` | `contexts/ctx-123` |
| Plan | `plans/<plan_id>` | `plans/plan-456` |
| Trace | `traces/<trace_id>` | `traces/trace-789` |
| Confirm | `confirms/<confirm_id>` | `confirms/confirm-abc` |
| Role | `roles/<role_id>` | `roles/role-def` |
| Dialog | `dialogs/<dialog_id>` | `dialogs/dialog-ghi` |
| Collab | `collabs/<collab_id>` | `collabs/collab-jkl` |
| Extension | `extensions/<extension_id>` | `extensions/ext-mno` |
| Core | `core/<core_id>` | `core/core-pqr` |
| Network | `networks/<network_id>` | `networks/net-stu` |

**Event Logs**:
- `events/trace/<trace_id>/<event_id>` Trace-scoped events
- `events/global/<event_id>` Global events

## 7. PSG Relationship

### 7.1 VSL as PSG Backing Store

**Concept**: PSG (Project Semantic Graph) is a **logical** graph; VSL is the **physical** storage

```
Logical Layer (PSG):
  Context --owns--> Plan --contains--> Steps[]
  
Physical Layer (VSL):
  K-V Store:
    - contexts/ctx-123 {context_id, ...}
    - plans/plan-456 {plan_id, context_id, steps: [...]}
    - steps/step-789 {step_id, plan_id, ...}
```

### 7.2 Graph Query Translation

**Runtime translates graph queries to VSL operations**:

```typescript
// Graph Query (logical)
const plan = await psg.getNode('Plan', 'plan-456');

// VSL Query (physical)
const plan = await vsl.get('plans/plan-456');
```

**Complex Query**:
```typescript
// Graph Query: Get all Plans for a Context
const plans = await psg.query({
  type: 'Plan',
 filters: [{ field: 'context_id', op: '=', value: 'ctx-123' }]
});

// VSL Implementation: Scan all plans (not efficient!)
const allPlans = await vsl.queryByType('Plan');
const filtered = allPlans.filter(p => p.context_id === 'ctx-123');
```

**Optimization**: Maintain secondary indexes in VSL for common queries

## 8. Invariants

### 8.1 Event Finality

**Invariant**: Events in the log **MUST NOT** be modified after append

**Enforcement**:
```typescript
class ImmutableEventLog {
  async appendEvent(event: MplpEvent): Promise<void> {
    const eventKey = `events/${event.event_id}`;
    
    // Check if event already exists
    const existing = await this.vsl.get(eventKey);
    if (existing) {
      throw new Error("Event already exists and cannot be modified");
    }
    
    // Append (write-once)
    await this.vsl.set(eventKey, event);
  }
}
```

### 8.2 Acknowledged Write Durability

**Invariant**: Acknowledged writes **MUST** survive process restart (if persistent backend used)

**Test**:
```typescript
// Write data
await vsl.set('test-key', { data: 'important' });

// Kill process
process.exit();

// Restart process
const data = await vsl.get('test-key');
assert(data.data === 'important');  // MUST pass for durable VSL
```

## 9. Governance Considerations

### 9.1 Portability

**Requirement**: Agents should be able to move between runtimes by transferring the VSL state

**Approach**: Export/Import VSL state as JSON

**Example**:
```typescript
// Export VSL state
async function exportVSL(vsl: VSL): Promise<string> {
  const data = {
    contexts: await vsl.queryByType('Context'),
    plans: await vsl.queryByType('Plan'),
    traces: await vsl.queryByType('Trace'),
    events: await vsl.getAllEvents()
  };
  return JSON.stringify(data);
}

// Import VSL state
async function importVSL(vsl: VSL, backup: string): Promise<void> {
  const data = JSON.parse(backup);
  for (const context of data.contexts) {
    await vsl.writeNode('Context', context.context_id, context);
  }
  // ... import other types
}
```

### 9.2 Privacy & Encryption

**Requirement**: VSL stores all user data. Encryption at rest is **RECOMMENDED**.

**Example** (AES-256-GCM encryption from deep-dive doc):
```typescript
class EncryptedVSL implements ValueStateLayer {
  private backend: ValueStateLayer;
  private key: Buffer;
  
  async get(key: string): Promise<any> {
    const encrypted = await this.backend.get(key);
    if (!encrypted) return null;
    
    // Decrypt
    const [iv, authTag, ciphertext] = encrypted.split('::');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }
  
  async set(key: string, value: any): Promise<void> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    
    let encrypted = cipher.update(JSON.stringify(value), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    const payload = `${iv.toString('hex')}::${authTag.toString('hex')}::${encrypted}`;
    await this.backend.set(key, payload);
  }
}
```

## 10. Implementation Patterns

### 10.1 Snapshot/Restore (for Rollback)

**Use Case**: Save PSG state before risky operation, restore on failure

**Example**:
```typescript
// Create snapshot before executing Plan
const snapshotId = await vsl.createSnapshot();
console.log(`Snapshot created: ${snapshotId}`);

try {
  await executePlan(plan);
} catch (error) {
  // Restore snapshot on failure
  console.log(`Error: ${error.message}, restoring snapshot ${snapshotId}`);
  await vsl.restoreSnapshot(snapshotId);
}
```

**Implementation** (filesystem backup):
```typescript
class SnapshottingVSL implements VSLExtended {
  async createSnapshot(): Promise<string> {
    const snapshotId = `snapshot-${Date.now()}`;
    const snapshotDir = path.join(this.basePath, 'snapshots', snapshotId);
    
    // Copy all files
    await fs.promises.cp(
      path.join(this.basePath, 'data'),
      snapshotDir,
      { recursive: true }
    );
    
    return snapshotId;
  }
  
  async restoreSnapshot(snapshotId: string): Promise<void> {
    const snapshotDir = path.join(this.basePath, 'snapshots', snapshotId);
    const dataDir = path.join(this.basePath, 'data');
    
    // Clear current data
    await fs.promises.rm(dataDir, { recursive: true, force: true });
    
    // Restore from snapshot
    await fs.promises.cp(snapshotDir, dataDir, { recursive: true });
  }
}
```

### 10.2 Transaction Support (ACID VSL)

**Example** (PostgreSQL VSL):
```typescript
class PostgresVSL implements VSLExtended {
  async beginTransaction(): Promise<TransactionHandle> {
    const client = await this.pool.connect();
    await client.query('BEGIN');
    return { tx_id: generateUUID(), client };
  }
  
  async writeNode(type: string, id: string, data: Node, tx?: TransactionHandle): Promise<void> {
    const client = tx?.client || this.pool;
    await client.query(
      'INSERT INTO nodes (type, id, data) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET data = $3',
      [type, id, JSON.stringify(data)]
    );
  }
  
  async commitTransaction(tx: TransactionHandle): Promise<void> {
    await tx.client.query('COMMIT');
    tx.client.release();
  }
  
  async rollbackTransaction(tx: TransactionHandle): Promise<void> {
    await tx.client.query('ROLLBACK');
    tx.client.release();
  }
}
```

## 11. Backend Comparison

| Backend | Consistency | Durability | Performance | Scalability | Complexity |
|:---|:---|:---|:---|:---|:---|
| **In-Memory** | Strong | None | Excellent | Single-node | Minimal |
| **FileSystem** | Strong | Good | Good | Single-node | Low |
| **Redis** | Strong (single-node) / Eventual (cluster) | Configurable | Excellent | Horizontal | Medium |
| **PostgreSQL** | Strong (ACID) | Excellent | Good | Vertical | Medium |
| **S3/GCS** | Eventual | Excellent | Fair | Massive | High |

**Recommendations**:
-   **Development**: In-Memory
-   **Testing**: FileSystem
-   **Production (single-node)**: PostgreSQL
-   **Production (distributed)**: Redis Cluster
-   **Archival**: S3/GCS

## 12. Related Documents

**Architecture**:
- [L3 Execution & Orchestration](/docs/specification/architecture)
- [L1-L4 Deep Dive](/docs/specification/architecture) (VSLExtended interface)

**Runtime Components**:
- [AEL (Action Execution Layer)](ael.md)
- [PSG (Project Semantic Graph)](psg.md)

**Kernel Duties**:
- [Transaction](/docs/specification/architecture/cross-cutting-kernel-duties)
- [State Sync](/docs/specification/architecture/cross-cutting-kernel-duties)

**Reference Implementation**:
- `packages/sdk-ts/src/runtime-minimal/index.ts` (lines 24-37)

---

**Core Interface**: `get(key): Promise<any>`, `set(key, value): Promise<void>`  
**Reference Implementation**: InMemoryVSL (4 lines)  
**Invariants**: Event finality, Acknowledged write durability  
**Privacy**: Encryption at rest RECOMMENDED