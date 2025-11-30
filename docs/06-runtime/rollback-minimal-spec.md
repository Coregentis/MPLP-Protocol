# Rollback Minimal Spec (Non-Enterprise v1.0)

**Purpose**: Define minimum viable rollback semantics for MPLP v1.0 compliant runtimes.

---

## 1. Scope

This specification defines **minimal rollback** behaviors:
- PSG-level rollback (restore graph snapshot)
- Repository-level rollback (informative, not protocol-mandated)
- Integration with Trace & Observability events

**Explicitly Out-of-Scope**:
- Enterprise-grade HA/DR (High Availability / Disaster Recovery)
- Distributed two-phase commit (2PC)
- Saga patterns for long-running transactions
- Cross-system ACID guarantees

---

## 2. Snapshot Granularity

### 2.1 PSG Snapshot (Primary Focus)

**Contents**:
- Complete graph structure (all nodes, all edges)
- Node/edge attributes
- Metadata (snapshot_id, timestamp, hash)

**Storage** (implementation-specific):
- In-memory (for short sessions)
- File system (JSON, binary)
- Graph database native snapshots
- Version control (Git-like for PSG)

**Example Structure**:
```json
{
  "snapshot_id": "snap-2025-11-30-001",
  "captured_at": "2025-11-30T10:00:00Z",
  "graph_hash": "sha256:abc123...",
  "nodes": {
    "node_1": {"type": "context", "status": "active", ...},
    "node_2": {"type": "plan", "status": "approved", ...}
  },
  "edges": [
    {"from": "node_1", "to": "node_2", "type": "context_to_plan"}
  ]
}
```

---

### 2.2 Repository Snapshot (Informative)

**Note**: Protocol does NOT mandate repo rollback, but spec acknowledges it.

**Contents** (if implemented):
- Git commit SHA (for code repositories)
- Working tree status
- File system snapshot (for non-Git projects)

**Integration**: Some runtimes may synchronize PSG snapshots with Git commits.

---

## 3. Trigger Points for Snapshots

A minimal implementation **SHOULD** take snapshots at:

### 3.1 Before High-Risk Confirm Decisions
**Rationale**: Allow rollback if approval leads to failure

**Trigger**: When `Confirm.target_plan` has high-risk indicators
- Breaking changes
- Large-scale refactors
- External system integrations

**Example**:
```
on Confirm.create(confirm_obj):
  if confirm_obj.risk_level == "high":
    snapshot_id = take_psg_snapshot()
    confirm_obj.metadata.rollback_snapshot_id = snapshot_id
```

---

### 3.2 Before Applying Major Plan Changes
**Rationale**: Allow rollback if plan execution fails

**Trigger**: When Plan update affects >30% of steps

**Example**:
```
on Plan.update(plan_obj, delta_intent):
  if delta_intent.change_scope > 0.3:
    snapshot_id = take_psg_snapshot()
    plan_obj.metadata.pre_update_snapshot_id = snapshot_id
```

---

### 3.3 On Pipeline Stage Failures
**Rationale**: Restore PSG to pre-stage state

**Trigger**: When `PipelineStageEvent.stage_status == "failed"`

**Example**:
```
on PipelineStageEvent(stage_status="failed"):
  if config.rollback_on_failure:
    snapshot_id = pipeline_state.last_stage_snapshot_id
    restore_psg_from_snapshot(snapshot_id)
```

---

### 3.4 When Severe Drift Detected
**Rationale**: Revert to known-good state

**Trigger**: When drift detection crosses threshold (see [Drift Detection Spec](drift-detection-spec.md))

**Example**:
```
on DriftDetected(severity="critical"):
  if config.rollback_on_drift:
    snapshot_id = find_last_healthy_snapshot()
    restore_psg_from_snapshot(snapshot_id)
```

---

## 4. Rollback Process (Minimal)

### 4.1 PSG Restoration

**Steps**:
1. Identify target snapshot (`snapshot_id`)
2. Load snapshot data
3. Replace current PSG with snapshot PSG
4. Re-index/re-validate graph (if needed)
5. Emit audit events

**Pseudo-code**:
```
def restore_psg_from_snapshot(snapshot_id):
  snapshot_data = load_snapshot(snapshot_id)
  
  # Clear current PSG
  psg.clear_all_nodes()
  psg.clear_all_edges()
  
  # Restore from snapshot
  for node in snapshot_data.nodes:
    psg.add_node(node)
  
  for edge in snapshot_data.edges:
    psg.add_edge(edge)
  
  # Emit events
  emit GraphUpdateEvent({
    update_kind: "bulk",
    node_delta: -current_nodes_count + snapshot_nodes_count,
    source_module: "Rollback"
  })
  
  emit RuntimeExecutionEvent({
    execution_id: gen_uuid(),
    executor_kind: "worker",
    status: "completed",
    metadata: {
      operation: "psg_rollback",
      snapshot_id: snapshot_id
    }
  })
```

---

### 4.2 Repository Rollback (Optional)

**IF implemented** (product-specific):
```
def rollback_repo(commit_sha):
  git checkout commit_sha
  # OR: restore file system from snapshot
```

**Synchronization**: Some runtimes may:
1. Rollback PSG
2. Rollback repo to matching commit
3. Update Context/Plan to reflect rolled-back state

---

## 5. Integration with Trace & Events

### 5.1 Trace Recording

**Requirement**: Rollback operations MUST be recorded in Trace module.

**Example Trace Entry**:
```json
{
  "event_id": "evt-rollback-001",
  "event_type": "rollback_executed",
  "timestamp": "2025-11-30T12:00:00Z",
  "metadata": {
    "trigger": "pipeline_failure",
    "snapshot_id": "snap-2025-11-30-001",
    "nodes_reverted": 1523,
    "edges_reverted": 2104
  }
}
```

---

### 5.2 Observability Events

**Events to Emit**:
1. **GraphUpdateEvent** (MUST from Phase 3):
   - `update_kind`: "bulk"
   - `node_delta`: negative (nodes removed) + positive (nodes restored)
   - `source_module`: "Rollback"

2. **RuntimeExecutionEvent** (RECOMMENDED):
   - `executor_kind`: "worker"
   - `status`: "completed" or "failed" (if rollback fails)
   - `metadata.operation`: "psg_rollback"

3. **ExternalIntegrationEvent** (if affected):
   - If rollback involves external systems (e.g., reverting API calls)

---

## 6. Error Handling During Rollback

### 6.1 Rollback Failure Scenarios
- Snapshot corrupted/unreadable
- PSG restoration fails (constraint violations)
- Repository rollback fails (uncommitted changes block checkout)

### 6.2 Failure Response

**Minimal Action**: Log error + alert human operator

**Advanced (optional)**: Attempt partial rollback or degraded mode

**Example**:
```
try:
  restore_psg_from_snapshot(snapshot_id)
except SnapshotCorruptedError:
  log_error("Rollback failed: snapshot corrupted")
  emit RuntimeExecutionEvent(status="failed", error="snapshot_corrupted")
  alert_operator("Manual intervention required")
```

---

## 7. Snapshot Retention Policy

### 7.1 Minimal Retention (Recommended)

**Keep at least**:
- Last 3 successful pipeline stage snapshots
- Last snapshot before each high-risk Confirm
- Snapshots for active sessions (not yet completed)

**Delete when**:
- Pipeline completes successfully (keep final snapshot only)
- Session ends without issues
- After retention period (e.g., 7 days for completed projects)

---

### 7.2 Storage Considerations

**Trade-offs**:
- More snapshots = better rollback granularity, higher storage cost
- Fewer snapshots = lower storage cost, coarser rollback

**Recommendation**: Balance based on project criticality and storage budget.

---

## 8. Rollback vs Compensation

### 8.1 Rollback (This Spec)
**Definition**: Restore PSG to previous snapshot (undo all changes)

**Use Cases**:
- Pipeline failure
- High-risk Confirm rejection
- Severe drift

---

### 8.2 Compensation (Related but Different)
**Definition**: Apply compensating actions to reverse specific changes (from Phase 3 - Observability CompensationPlanEvent)

**Use Cases**:
- Partial rollback (undo specific changes, keep others)
- External system state correction

**Note**: Compensation is more granular than full rollback.

---

## 9. In-Scope vs Out-of-Scope

### ✅ In-Scope (v1.0 Minimal Spec)
- PSG snapshot capture
- PSG restoration from snapshot
- Rollback trigger points
- Trace + event integration
- Snapshot retention guidance

### ❌ Out-of-Scope (Enterprise Features)
- Distributed two-phase commit (2PC)
- Saga patterns for long-running transactions
- Cross-database ACID guarantees
- High-availability failover
- Disaster recovery (geographic replication)
- Time-travel queries on PSG history

---

## 10. Compliance Notes

**v1.0 Rollback Compliance**:
- ⚠️ **RECOMMENDED** (not REQUIRED) for v1.0 protocol compliance
- IF implemented, runtime MUST:
  1. Use PSG as primary rollback target
  2. Record rollback in Trace
  3. Emit GraphUpdateEvent (bulk) on rollback
  4. Document rollback trigger points

**Rationale for RECOMMENDED**:
- Rollback adds robustness
- But implementation complexity varies (simple in-memory vs distributed systems)
- v1.0 focuses on core protocol, not enterprise resilience

---

## 11. Example: Complete Rollback Flow

**Scenario**: High-risk plan refactor fails during execution.

**Steps**:
1. **Before Refactor**: Take PSG snapshot
   ```
   snapshot_id = take_psg_snapshot()
   plan.metadata.pre_refactor_snapshot = snapshot_id
   ```

2. **During Execution**: Pipeline stage 3 fails
   ```
   emit PipelineStageEvent(stage_status="failed")
   ```

3. **Trigger Rollback**: Detect failure
   ```
   on PipelineStageEvent(stage_status="failed"):
     if plan.risk_level == "high":
       restore_psg_from_snapshot(plan.metadata.pre_refactor_snapshot)
   ```

4. **Restoration**: Load snapshot
5. **Emit Events**:
   ```
   emit GraphUpdateEvent(update_kind="bulk", source_module="Rollback")
   emit RuntimeExecutionEvent(operation="psg_rollback", status="completed")
   ```

6. **Record in Trace**:
   ```
   trace.events.append({
     event_type: "rollback_executed",
     snapshot_id: snapshot_id
   })
   ```

7. **Alert User**: "Pipeline failed, PSG rolled back to pre-refactor state"

---

## 12. References

- [Runtime Glue Overview](mplp-runtime-glue-overview.md)
- [Module→PSG Paths](module-psg-paths.md)
- [Drift Detection Spec](drift-detection-spec.md)
- [Crosscut→PSG & Events Binding](crosscut-psg-event-binding.md)
- [GraphUpdateEvent](../04-observability/mplp-event-taxonomy.yaml)
- [CompensationPlanEvent](../04-observability/mplp-event-taxonomy.yaml)

---

**End of Rollback Minimal Spec**

*This specification defines the minimum viable rollback behaviors for MPLP v1.0 compliant runtimes, enabling PSG-level state restoration while maintaining flexibility in implementation strategies and excluding enterprise-grade distributed transaction patterns.*
