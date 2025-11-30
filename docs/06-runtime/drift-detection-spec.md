# Drift Detection – Minimal Spec (v1.0)

**Purpose**: Define minimum viable drift detection requirements for MPLP v1.0 compliant runtimes.

---

## 1. Definition

**Drift** = divergence between intended project state and actual implemented state.

### 1.1 Types of Drift

1. **Intent Drift**: User intent vs implemented solution
2. **Documentation Drift**: Documented architecture vs actual code
3. **Code Drift**: Planned modules vs implemented modules
4. **Graph Drift (PSG-level)**: Expected PSG structure vs actual PSG structure

---

## 2. Drift Signals (Inputs for Detection)

### 2.1 Required Signals
- **GraphUpdateEvent** (REQUIRED from Phase 3):
  - Every PSG structural change
  - `node_delta`, `edge_delta` track cumulative changes
- **PSG Snapshots**:
  - Captured at milestones (after major Plan updates, pipeline stages)
- **PipelineStageEvent** (REQUIRED from Phase 3):
  - Stage-level success/failure patterns

### 2.2 Optional Signals
- **Trace module records**: Execution history for forensic analysis
- **LearningSamples** (Phase 4):
  - `delta_impact` samples for change prediction accuracy
  - `pipeline_outcome` samples for failure pattern detection

---

## 3. Minimal Requirements for v1.0

A compliant runtime **SHOULD** (RECOMMENDED, not MUST):

### 3.1 Take PSG Snapshots at Milestones

**Milestones**:
1. After Plan creation/major update
2. After pipeline stage completion
3. Before high-risk Confirm operations
4. At MAP session boundaries (if using MAP Profile)

**Snapshot Contents**:
- PSG node count
- PSG edge count
- Hash/checksum of graph structure
- Timestamp

**Example**:
```
snapshot_id: "snap-2025-11-30-001"
node_count: 1523
edge_count: 2104
graph_hash: "sha256:abc123..."
captured_at: "2025-11-30T10:00:00Z"
```

---

### 3.2 Compare PSG Against Intended State

**Comparison Points**:
- Latest IntentModel / Plan
- Expected PSG structure (from previous snapshot + planned changes)

**Detection Criteria**:
1. **Missing Nodes**: Expected nodes not present in PSG
2. **Extra Nodes**: Unexpected nodes present in PSG
3. **Mis matched Attributes**: Node/edge attributes differ from expected values
4. **Broken Dependencies**: Expected edges missing

**Example Detection Logic** (pseudo-code):
```
def detect_drift(current_psg, expected_psg_state):
  missing_nodes = expected_nodes - current_nodes
  extra_nodes = current_nodes - expected_nodes
  
  for node in current_nodes ∩ expected_nodes:
    if current_psg[node].status != expected_psg_state[node].status:
      flag_drift("status_mismatch", node)
  
  return DriftReport(missing_nodes, extra_nodes, mismatches)
```

---

### 3.3 Flag Drift When Thresholds Crossed

**Threshold Examples** (implementation-specific):
- > 10% nodes missing/extra
- Critical invariant violated (e.g., Context→Plan binding broken)
- Pipeline stages failed unexpectedly

---

## 4. Example Detection Flows

### 4.1 Flow: Plan Refactor Drift

**Scenario**: User refactors Plan, expects 20 steps removed, 5 added.

**Detection**:
1. Observe GraphUpdateEvent batch for plan refactor
2. Compute snapshot diff:
   - Expected: node_delta = -15 (net)
   - Actual from events: node_delta = -10
3. Flag drift: 5 expected deletions not applied

---

### 4.2 Flow: Pipeline Stage Failure Drift

**Scenario**: Stage 3 expected to complete, but fails.

**Detection**:
1. Receive PipelineStageEvent(stage_status="failed")
2. Compare against expected pipeline path:
   - Expected: all stages "completed"
   - Actual: stage_3 "failed"
3. Flag drift: Pipeline execution deviated from plan

---

### 4.3 Flow: Intent vs Implementation Drift

**Scenario**: User intent requires 3 modules, only 2 implemented.

**Detection**:
1. Query PSG for implemented modules:
   - Found: module_A, module_B
   - Expected (from IntentModel): module_A, module_B, module_C
2. Flag drift: module_C missing

---

## 5. Drift Reporting

### 5.1 Report Structure (Recommended)

```json
{
  "drift_id": "drift-2025-11-30-001",
  "detected_at": "2025-11-30T11:00:00Z",
  "drift_type": "graph_drift",
  "severity": "medium",
  "details": {
    "missing_nodes": ["node_123", "node_456"],
    "extra_nodes": [],
    "attribute_mismatches": [
      {
        "node_id": "node_789",
        "attribute": "status",
        "expected": "completed",
        "actual": "failed"
      }
    ]
  },
  "snapshot_comparison": {
    "baseline_snapshot_id": "snap-2025-11-30-001",
    "current_snapshot_id": "snap-2025-11-30-002"
  }
}
```

### 5.2 Drift Actions (Implementation-Specific)

**Possible Responses** (out-of-scope for v1.0 spec):
- Alert human reviewer
- Trigger auto-remediation workflow
- Halt pipeline execution
- Request user confirmation to proceed

Protocol only requires: **Drift MUST be traceable via PSG + events**.

---

## 6. Integration with Observability & Learning

### 6.1 Observability Events
- Drift detection can emit **custom DriftDetectedEvent** (vendor-specific)
- OR: Log drift as RuntimeExecutionEvent with custom metadata

### 6.2 Learning Samples
- **delta_impact** samples:
  - `input.delta_id` → change that caused drift
  - `output.actual_impact_summary` → observed drift
  - `meta.predicted_vs_actual_accuracy` → "underestimated" if drift unexpected

---

## 7. In-Scope vs Out-of-Scope

### ✅ In-Scope (v1.0 Minimal Spec)
- PSG snapshot comparison
- Graph structure drift detection (nodes, edges, attributes)
- Pipeline execution drift (stage failures)
- Drift reporting structure

### ❌ Out-of-Scope (v1.0)
- Automatic drift remediation strategies
- Machine learning-based drift prediction
- Enterprise-grade policy engines
- Integration with external governance systems
- Real-time drift alerts (though vendor may implement)

---

## 8. Compliance Notes

**v1.0 Drift Detection Compliance**:
- ⚠️ **RECOMMENDED** (not REQUIRED) for v1.0 protocol compliance
- IF implemented, runtime MUST:
  1. Document drift detection logic
  2. Use PSG as comparison basis
  3. Make drift traceable via PSG + events

**Rationale for RECOMMENDED**:
- Drift detection adds significant value
- But implementation complexity varies widely
- v1.0 focuses on foundational protocol, not enterprise governance

---

## 9. References

- [Runtime Glue Overview](mplp-runtime-glue-overview.md)
- [Module→PSG Paths](module-psg-paths.md)
- [Crosscut→PSG & Events Binding](crosscut-psg-event-binding.md)
- [Rollback Minimal Spec](rollback-minimal-spec.md)
- [GraphUpdateEvent Schema](../04-observability/mplp-event-taxonomy.yaml)
- [Delta Impact Samples](../05-learning/mplp-learning-taxonomy.yaml)

---

**End of Drift Detection Minimal Spec**

*This specification defines the minimum viable drift detection behaviors for MPLP v1.0 compliant runtimes, enabling implementations to detect divergence between intended and actual project state while maintaining flexibility in detection strategies.*
