---
sidebar_position: 5

doc_type: normative
normativity: normative
status: draft
authority: MPGC
description: "Drift Detection and Rollback Mechanisms for MPLP runtimes."
title: Drift and Rollback
keywords: [MPLP, Drift Detection, Rollback, PSG, Runtime, Transaction]
sidebar_label: Drift and Rollback

---


# Drift and Rollback


## 1. Purpose

This document specifies the **Drift Detection** and **Rollback** mechanisms for MPLP runtimes. These mechanisms ensure the Protocol State Graph (PSG) remains accurate and provide transactional safety for agent actions.

**Related Crosscuts**:
- **error-handling**: Failure detection and recovery
- **transaction**: Atomicity and rollback support
- **state-sync**: PSG consistency invariant

## 2. Non-Goals

This specification does not mandate:
- Specific storage engine implementation
- Enterprise-grade HA/DR patterns
- Distributed consensus algorithms (2PC, saga)

---

## 3. Drift Detection

### 3.1 Purpose

**Drift** occurs when the PSG state diverges from the actual state of external systems (file system, databases, APIs). Detection mechanisms ensure early identification of inconsistencies.

### 3.2 Detection Strategies

| Strategy | Description | When Used |
|:---|:---|:---|
| **Passive** | Compare on read - detect divergence when data is accessed | Low overhead |
| **Active** | Periodic polling of external state | Background reconciliation |
| **Invariant-based** | Validate invariant rules on every PSG update | Real-time detection |

### 3.3 Drift Detection Events

| Event | Purpose | Conformance |
|:---|:---|:---|
| `DriftDetectedEvent` | Signals detected divergence | MUST emit |
| `DriftResolvedEvent` | Signals drift has been corrected | SHOULD emit |

### 3.4 Invariant-Based Detection

**Conformance**: **REQUIRED** for v1.0

On every PSG update:
1. Evaluate relevant invariants (SA, MAP, Observability)
2. If violation detected:
   - Emit `DriftDetectedEvent`
   - Log violation details in Trace
   - Trigger rollback if severity is HIGH

**Example**:
```
on psg.update(node):
  for invariant in applicable_invariants(node):
    if not invariant.validate(node):
      emit DriftDetectedEvent({
        drift_type: "invariant_violation",
        invariant_id: invariant.id,
        node_id: node.id,
        severity: invariant.severity
      })
```

---

## 4. Rollback Mechanisms

### 4.1 Purpose

**Rollback** provides transactional safety for agent actions. If a multi-step Plan fails midway, the system reverts to a consistent state, preventing a "broken build" scenario.

### 4.2 Snapshot Mechanism

**Conformance**: **REQUIRED** for v1.0

Before executing a Plan, the Runtime MUST maintain **Snapshots**:

#### 4.2.1 Snapshot Granularity
- **Minimum**: At Pipeline Stage boundaries
- **Recommended**: At Plan execution start

#### 4.2.2 Snapshot Contents

| Target | Snapshot Method |
|:---|:---|
| **PSG State** | Serialize graph to JSON checkpoint |
| **File System (Git)** | Create temporary branch or stash |
| **File System (Non-Git)** | Create backup copies |

#### 4.2.3 Storage Options
- Full copies (simple, more storage)
- Delta logs (efficient, more complex)

### 4.3 Rollback Triggers

A rollback is triggered by:

| Trigger | Source | Severity |
|:---|:---|:---|
| **Plan Failure** | Critical step fails, no recovery path | High |
| **User Rejection** | User rejects outcome during Confirm | Medium |
| **Policy Violation** | Safety violation detected | Critical |
| **Manual Abort** | User explicitly cancels operation | Medium |
| **Transaction Abort** | Failure in multi-step atomic operation | High |
| **User Request** | Explicit `IntentEvent` to undo | Medium |

### 4.4 Rollback Procedure

<MermaidDiagram id="7ff3e2ed31e8415f" />

### 4.5 Consistency Requirements

**When performing rollback**:

1. **Trace Integrity**: The Trace MUST NOT be deleted
   - Rollback itself is an event appended to the Trace
   - Preserves audit trail

2. **PSG Reversion**: Restore to snapshot state
   - `project_root` nodes
   - `plans` nodes
   - `context` nodes

3. **Event Compensation**: Best-effort for external side-effects
   - If external API calls were made, attempt inverse operations
   - Example: `delete_repo` to undo `create_repo`
   - If automatic compensation fails, alert user with action log

### 4.6 Rollback Events

A Rollback operation produces:

| Event | Purpose |
|:---|:---|
| `RollbackInitiated` | Marks start of rollback |
| `RollbackCompleted` | Marks successful completion |
| New **Trace Span** | Represents re-execution path |

### 4.7 Compensation Logic

For side effects that cannot be simply reverted:

```typescript
interface CompensationAction {
  original_action: string;
  compensation_action: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

// Example compensation registry
const compensations: Record<string, string> = {
  'create_file': 'delete_file',
  'create_branch': 'delete_branch',
  'api.create_resource': 'api.delete_resource'
};
```

---

## 5. Conformance Summary

| Requirement | Level | Description |
|:---|:---|:---|
| Invariant-based drift detection | **MUST** | Evaluate invariants on PSG updates |
| PSG snapshots at stage boundaries | **MUST** | Enable rollback capability |
| DriftDetectedEvent emission | **MUST** | Audit trail for detected drift |
| Rollback event emission | **MUST** | Audit trail for rollback operations |
| Trace preservation on rollback | **MUST** | Never delete trace history |
| External compensation | **SHOULD** | Best-effort for side-effects |
| Hybrid detection strategy | **SHOULD** | Passive + Active detection |

---

## 6. Related Documents

- [PSG Overview](psg.md)
- [Runtime Glue Overview](runtime-glue-overview.md)
- [Crosscut PSG Event Binding](crosscut-psg-event-binding.md)

---

**Detection**: Passive + Active + Invariant-based (hybrid)  
**Rollback**: PSG snapshots + compensation logic