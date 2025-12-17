---
title: Transaction
description: Transactional semantics in MPLP covering ACID properties, VSL
  snapshots, compensation plans, Git-based transactions, and two-phase commit
  for distributed resources.
keywords:
  - transaction
  - ACID
  - snapshot isolation
  - rollback
  - compensation plan
  - two-phase commit
  - atomicity
  - file backup
sidebar_label: Transaction
doc_status: informative
doc_role: guide
protocol_alignment:
  truth_level: T2
  protocol_version: 1.0.0
  schema_refs: []
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes: []
  doc_status: informative
sidebar_position: 8
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Transaction

## 1. Purpose

The **Transaction** cross-cutting concern ensures the atomicity and integrity of state changes in MPLP. When a Plan involves multiple steps, file changes, and PSG updates, the system must prevent partial failures that leave the project in an inconsistent state.

**Design Principle**: "All-or-nothing execution with clean rollback on failure"

## 2. Atomic Units

**From**: L2 Plan Module

MPLP defines the **Plan** as the primary unit of transactional work:
- **All-or-Nothing**: A Plan should result in complete success or clean failure (rollback)
- **Isolation**: Changes are not visible externally until Plan completion
- **Durability**: Once committed, changes persist across restarts

## 3. Snapshot Isolation

**From**: `docs/01-architecture/l1-l4-architecture-deep-dive.md` (VSL snapshot/restore)

### 3.1 VSL Snapshot Interface

```typescript
interface VSLExtended extends ValueStateLayer {
  // Snapshot operations
  createSnapshot(): Promise<string>;           // Returns snapshot ID
  restoreSnapshot(snapshotId: string): Promise<void>;
  listSnapshots(): Promise<SnapshotInfo[]>;
  deleteSnapshot(snapshotId: string): Promise<void>;
}
```

### 3.2 Transaction Flow

**Before Plan Execution**:
1. **Begin**: Take snapshot of PSG state
2. **Execute**: Apply changes to working copy
3. **Commit**: Finalize changes (discard snapshot)
4. **Rollback**: Restore snapshot if failure (discard changes)

**Implementation**:
```typescript
async function executePlanWithTransaction(
  plan: Plan,
  vsl: VSLExtended
): Promise<void> {
  // 1. Create snapshot
  const snapshotId = await vsl.createSnapshot();
  console.log(`Transaction started: ${snapshotId}`);
  
  try {
    // 2. Execute plan
    await executePlan(plan);
    
    // 3. Commit (delete snapshot)
    await vsl.deleteSnapshot(snapshotId);
    console.log('Transaction committed');
  } catch (error) {
    // 4. Rollback (restore snapshot)
    console.error(`Transaction failed: ${error.message}`);
    await vsl.restoreSnapshot(snapshotId);
    console.log('Transaction rolled back');
    
    throw error;
  }
}
```

## 4. Compensation for Side Effects

### 4.1 Problem: Non-Reversible Operations

Some operations cannot be simply "rolled back":
- External API calls (create repository, send email)
- Third-party service mutations
- Published events (already consumed)

### 4.2 Compensation Plan Pattern

**From**: `compensation_plan` event family

**Strategy**: Define inverse operations for each action

**Example**:
```json
{
  "compensation_plan": {
    "plan_id": "plan-123",
    "original_actions": [
      {
        "action_id": "action-1",
        "type": "create_github_repo",
        "params": { "name": "test-repo" }
      },
      {
        "action_id": "action-2",
        "type": "send_notification",
        "params": { "message": "Deploy started" }
      }
    ],
    "compensation_actions": [
      {
        "action_id": "comp-1",
        "type": "delete_github_repo",
        "params": { "name": "test-repo" },
        "compensates": "action-1"
      },
      {
        "action_id": "comp-2",
        "type": "send_notification",
        "params": { "message": "Deploy cancelled" },
        "compensates": "action-2"
      }
    ]
  }
}
```

### 4.3 Compensation Executor

**Implementation**:
```typescript
class CompensationExecutor {
  private executedActions: Action[] = [];
  
  async executeWithCompensation(action: Action): Promise<void> {
    try {
      // Execute forward action
      await this.ael.execute(action);
      this.executedActions.push(action);
    } catch (error) {
      // Failure - compensate all previous actions
      await this.compensateAll();
      throw error;
    }
  }
  
  private async compensateAll(): Promise<void> {
    // Execute compensation actions in reverse order
    for (const action of this.executedActions.reverse()) {
      const compensationAction = this.getCompensation(action);
      
      try {
        await this.ael.execute(compensationAction);
        console.log(`Compensated: ${action.action_id}`);
      } catch (compError) {
        console.error(`Compensation failed for ${action.action_id}:`, compError);
        // Continue compensating other actions
      }
    }
  }
  
  private getCompensation(action: Action): Action {
    // Map forward actions to compensation actions
    const compensationMap = {
      'create_github_repo': 'delete_github_repo',
      'deploy_app': 'rollback_deployment',
      'send_email': 'send_cancellation_email'
    };
    
    return {
      action_type: compensationMap[action.action_type],
      params: action.params
    };
  }
}
```

## 5. ACID Properties

### 5.1 Atomicity

**Guarantee**: Plan either fully succeeds or fully fails

**Mechanism**: VSL snapshots + compensation plans

### 5.2 Consistency

**Guarantee**: PSG always satisfies invariants

**Mechanism**: Schema validation before commit

```typescript
async function commitWithValidation(
  plan: Plan,
  vsl: VSLExtended,
  snapshotId: string
): Promise<void> {
  // Validate PSG integrity before commit
  const errors = await validatePSGIntegrity(plan);
  
  if (errors.length > 0) {
    // Integrity violated - rollback
    await vsl.restoreSnapshot(snapshotId);
    throw new Error(`PSG integrity check failed: ${errors.join(', ')}`);
  }
  
  // Commit
  await vsl.deleteSnapshot(snapshotId);
}
```

### 5.3 Isolation

**Guarantee**: Concurrent Plans don't interfere

**Mechanism**: Pessimistic locking (exclusive write access)

**From**: Coordination cross-cutting concern

```typescript
async function acquirePlanLock(
  plan_id: string,
  vsl: VSL
): Promise<boolean> {
  const lockKey = `locks/plan/${plan_id}`;
  
  // Try to acquire lock
  const existing = await vsl.get(lockKey);
  if (existing) {
    return false;  // Lock held by another process
  }
  
  // Acquire lock
  await vsl.set(lockKey, {
    holder: process.pid,
    acquired_at: new Date().toISOString()
  });
  
  return true;
}
```

### 5.4 Durability

**Guarantee**: Committed changes survive process restart

**Mechanism**: VSL persistence layer (filesystem, database)

**Configuration**:
```typescript
const vsl = new FileSystemVSL({
  basePath: './mplp-state',
  durability: 'DURABLE',  // fsync after writes
  backup: true            // Automatic backups
});
```

## 6. File System Transactions

### 6.1 Git-Based Transactions

**For Git repositories**:

```typescript
async function executePlanWithGit(plan: Plan): Promise<void> {
  // 1. Create temporary branch
  await git.checkoutNewBranch(`mplp-tx-${plan.plan_id}`);
  
  try {
    // 2. Execute plan (makes file changes)
    await executePlan(plan);
    
    // 3. Commit changes
    await git.add('.');
    await git.commit(`Plan ${plan.plan_id}: ${plan.title}`);
    
    // 4. Merge back to main
    await git.checkout('main');
    await git.merge(`mplp-tx-${plan.plan_id}`);
    
    // 5. Clean up transaction branch
    await git.deleteBranch(`mplp-tx-${plan.plan_id}`);
  } catch (error) {
    // Rollback: discard branch
    await git.checkout('main');
    await git.deleteBranch(`mplp-tx-${plan.plan_id}`, { force: true });
    
    throw error;
  }
}
```

### 6.2 Non-Git File Backup

**For non-Git projects**:

```typescript
async function executeWithFileBackup(plan: Plan): Promise<void> {
  const backupDir = `/tmp/mplp-backup-${plan.plan_id}`;
  
  // 1. Backup modified files
  const modifiedFiles = await getModifiedFiles(plan);
  for (const file of modifiedFiles) {
    await fs.promises.copyFile(file, path.join(backupDir, file));
  }
  
  try {
    // 2. Execute plan
    await executePlan(plan);
  } catch (error) {
    // 3. Restore files on failure
    for (const file of modifiedFiles) {
      await fs.promises.copyFile(path.join(backupDir, file), file);
    }
    
    throw error;
  } finally {
    // Clean up backup
    await fs.promises.rm(backupDir, { recursive: true });
  }
}
```

## 7. Multi-Resource Transactions

### 7.1 Two-Phase Commit (2PC)

**For distributed transactions** across VSL + File System + External APIs:

```typescript
async function twoPhaseCommit(
  plan: Plan,
  resources: Resource[]
): Promise<void> {
  // Phase 1: Prepare
  const prepared: Resource[] = [];
  
  for (const resource of resources) {
    try {
      await resource.prepare();
      prepared.push(resource);
    } catch (error) {
      // Abort all prepared resources
      for (const r of prepared) {
        await r.abort();
      }
      throw error;
    }
  }
  
  // Phase 2: Commit
  for (const resource of prepared) {
    try {
      await resource.commit();
    } catch (error) {
      console.error(`Commit failed for ${resource.name}:`, error);
      // Cannot rollback after commit phase started
      // This is a serious error - manual intervention needed
    }
  }
}

interface Resource {
  name: string;
  prepare(): Promise<void>;
  commit(): Promise<void>;
  abort(): Promise<void>;
}
```

## 8. Best Practices

### 8.1 Transaction Scope

**Keep transactions small**:
- One Plan = One transaction
- Multiple Plans = One transaction (too large)

**Why**: Smaller transactions reduce lock contention and rollback complexity

### 8.2 Idempotency

**Make operations idempotent** where possible:

```typescript
async function createFileIdempotent(path: string, content: string): Promise<void> {
  // Check if file already exists with same content
  if (await fs.promises.exists(path)) {
    const existing = await fs.promises.readFile(path, 'utf-8');
    if (existing === content) {
      return;  // Already in desired state
    }
  }
  
  await fs.promises.writeFile(path, content);
}
```

**Benefit**: Safe to retry on failure without duplication

### 8.3 Compensation Logging

**Log all compensation actions**:

```typescript
async function compensate(action: Action): Promise<void> {
  // Emit compensation event
  await eventBus.emit({
    event_family: 'compensation_plan',
    event_type: 'compensation_executed',
    payload: {
      original_action_id: action.action_id,
      compensation_action: this.getCompensation(action)
    }
  });
  
  await this.ael.execute(this.getCompensation(action));
}
```

**Benefit**: Audit trail for understanding what was undone

## 9. Related Documents

**Architecture**:
- [VSL (Value State Layer)](vsl.md) - Snapshot/restore mechanisms
- [L1-L4 Deep Dive](../l1-l4-architecture-deep-dive.md) - Extended VSL interface

**Cross-Cutting Concerns**:
- [Error Handling](error-handling.md) - Rollback strategies
- [Coordination](coordination.md) - Lock management
- [Observability](observability.md) - Compensation events

**Event Schemas**:
- `compensation_plan` event family

---

**Document Status**: Specification (Normative transactional semantics)  
**Primary Mechanism**: VSL snapshots for PSG, Git branches for files  
**Compensation**: Required for non-reversible external operations  
**ACID**: Atomicity (snapshots), Consistency (validation), Isolation (locks), Durability (VSL persistence)
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
