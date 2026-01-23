# FLOW-05 – Single Agent with Confirm Required

**Category**: A: Single Agent Basics  
**Status**: 🔄 In Progress (README Correction)  
**Last Updated**: 2025-11-30

## 2. MPLP Surface (L2 Modules)

This flow exercises the following L2 protocol modules:

### **Context**
- **Role**: Establishes the problem domain, remains stable across confirmation rounds
- **Key Fields**: `context_id`, `title`, `root.domain`, `root.environment`, `status`
- **Behavior**: Context is the immutable anchor for both Plan and Confirm

### **Plan**
- **Role**: Contains the execution strategy requiring approval
- **Key Fields**: `plan_id`, `context_id`, `title`, `objective`, `status`, `steps[]`
- **Behavior**: 
  - Plan `status` may transition based on Confirm decisions
  - Plan itself doesn't change in FLOW-05 (immutability)
  - Multi-round approval tracked in Confirm's `decisions[]` array

### **Confirm**
- **Role**: Records approval/rejection decisions for the Plan
- **Key Fields**:
  - `confirm_id`: Unique identifier  
  - `target_type`: "plan"
  - `target_id`: References `plan_id`
  - `status`: Overall Confirm status (pending → rejected → approved)
  - `requested_by_role`: Who requested approval
  - `requested_at`: When requested
  - **`decisions[]`**: Array of decision records
    - `decision_id`, `status`, `decided_by_role`, `decided_at`, `reason`
- **Behavior**:
  - ONE Confirm object tracks full approval lifecycle
  - Multiple `decisions` added sequentially (reject, then approve)
  - `decisions[0].status: "rejected"` with rejection reason
  - `decisions[1].status: "approved"` with approval notes

### **Trace**
- **Role**: Records all confirmation lifecycle events
- **Key Fields**: `trace_id`, `context_id`, `plan_id`, `events[]`
- **Behavior**:
  - Events capture: confirm_submitted, reject_decision, approve_decision
  - All events reference `confirm_id` and `decision_id`
  - Enables full audit trail

---

## 3. Integration Dimensions (L3/L4)

**Minimal Integration** for FLOW-05:
- **No Tool Integration**: Plan contains simple agent steps only
- **No LLM Backend**: Focuses on pure confirmation semantics
- **No Runtime Execution**: Trace contains confirmation events, not execution events

---

## 4. Input / Expected Fixtures

### 4.1 Input Fixtures (`input/`)

**`input/context.json`**
```json
{
  "meta": {
    "protocol_version": "1.0.0",
    "schema_version": "1.0.0",
    "created_at": "2025-12-01T12:00:00.000Z"
  },
  "context_id": "550e8400-e29b-41d4-a716-446655440500",
  "title": "Database Migration Workflow",
  "root": {
    "domain": "golden-test",
    "environment": "test"
  },
  "status": "active"
}
```

**`input/plan.json`**
```json
{
  "meta": {...},
  "plan_id": "550e8400-e29b-41d4-a716-446655440501",
  "context_id": "550e8400-e29b-41d4-a716-446655440500",
  "title": "Database Migration Plan",
  "objective": "Migrate data with zero downtime",
  "status": "pending_approval",
  "steps": [
    {
      "step_id": "550e8400-e29b-41d4-a716-446655440510",
      "description": "Export user table from MySQL",
      "status": "pending",
      "agent_role": "agent"
    },
    {
      "step_id": "550e8400-e29b-41d4-a716-446655440511",
      "description": "Import to PostgreSQL",
      "status": "pending",
      "agent_role": "agent",
      "dependencies": ["550e8400-e29b-41d4-a716-446655440510"]
    },
    {
      "step_id": "550e8400-e29b-41d4-a716-446655440512",
      "description": "Verify row counts",
      "status": "pending",
      "agent_role": "agent",
      "dependencies": ["550e8400-e29b-41d4-a716-446655440511"]
    }
  ]
}
```

**`input/confirm.json`** (Initial request)
```json
{
  "meta": {...},
  "confirm_id": "550e8400-e29b-41d4-a716-446655440520",
  "target_type": "plan",
  "target_id": "550e8400-e29b-41d4-a716-446655440501",
  "status": "pending",
  "requested_by_role": "agent",
  "requested_at": "2025-12-01T12:01:00.000Z",
  "reason": "High-risk migration requires approval",
  "decisions": []
}
```

### 4.2 Expected Fixtures (`expected/`)

**`expected/context.json`**: Identical to `input/context.json`

**`expected/plan.json`**: Identical to `input/plan.json` (Plan unchanged)

**`expected/confirm.json`** (With two decisions)
```json
{
  "meta": {...},
  "confirm_id": "550e8400-e29b-41d4-a716-446655440520",
  "target_type": "plan",
  "target_id": "550e8400-e29b-41d4-a716-446655440501",
  "status": "approved",
  "requested_by_role": "agent",
  "requested_at": "2025-12-01T12:01:00.000Z",
  "reason": "High-risk migration requires approval",
  "decisions": [
    {
      "decision_id": "550e8400-e29b-41d4-a716-446655440521",
      "status": "rejected",
      "decided_by_role": "dba_reviewer",
      "decided_at": "2025-12-01T12:05:00.000Z",
      "reason": "Missing rollback plan"
    },
    {
      "decision_id": "550e8400-e29b-41d4-a716-446655440522",
      "status": "approved",
      "decided_by_role": "dba_reviewer",
      "decided_at": "2025-12-01T12:15:00.000Z",
      "reason": "Rollback addressed via manual procedure doc"
    }
  ]
}
```

**`expected/trace.json`**
```json
{
  "meta": {...},
  "trace_id": "550e8400-e29b-41d4-a716-446655440550",
  "context_id": "550e8400-e29b-41d4-a716-446655440500",
  "plan_id": "550e8400-e29b-41d4-a716-446655440501",
  "root_span": {
    "span_id": "550e8400-e29b-41d4-a716-446655440551",
    "name": "Confirm Lifecycle",
    "start_time": "2025-12-01T12:01:00.000Z",
    "end_time": "2025-12-01T12:15:00.000Z"
  },
  "status": "completed",
  "started_at": "2025-12-01T12:01:00.000Z",
  "finished_at": "2025-12-01T12:15:00.000Z",
  "events": [
    {
      "event_id": "550e8400-e29b-41d4-a716-446655440560",
      "event_type": "confirm_submitted",
      "timestamp": "2025-12-01T12:01:00.000Z",
      "data": {
        "confirm_id": "550e8400-e29b-41d4-a716-446655440520",
        "target_id": "550e8400-e29b-41d4-a716-446655440501"
      }
    },
    {
      "event_id": "550e8400-e29b-41d4-a716-446655440561",
      "event_type": "decision_rejected",
      "timestamp": "2025-12-01T12:05:00.000Z",
      "data": {
        "confirm_id": "550e8400-e29b-41d4-a716-446655440520",
        "decision_id": "550e8400-e29b-41d4-a716-446655440521",
        "reason": "Missing rollback plan"
      }
    },
    {
      "event_id": "550e8400-e29b-41d4-a716-446655440562",
      "event_type": "decision_approved",
      "timestamp": "2025-12-01T12:15:00.000Z",
      "data": {
        "confirm_id": "550e8400-e29b-41d4-a716-446655440520",
        "decision_id": "550e8400-e29b-41d4-a716-446655440522",
        "reason": "Rollback addressed"
      }
    }
  ]
}
```

---

## 5. Invariants Design

Using **only existing 7 rule types**:

**`flow-05-single-agent-confirm-required/invariants.yaml`**:
```yaml
invariants:
  # Plan structure
  - id: flow05_plan_minimum_steps
    scope: plan
    path: steps
    rule: min-length(3)
    
  - id: flow05_plan_id_is_uuid
    scope: plan
    path: plan_id
    rule: uuid-v4
  
  # ID binding relationships (using eq!)
  - id: flow05_plan_context_matches
    scope: plan
    path: context_id
    rule: eq(context.context_id)
    
  - id: flow05_confirm_target_matches_plan
    scope: confirm
    path: target_id
    rule: eq(plan.plan_id)
    
  - id: flow05_trace_context_matches
    scope: trace
    path: context_id
    rule: eq(context.context_id)
    
  - id: flow05_trace_plan_matches
    scope: trace
    path: plan_id
    rule: eq(plan.plan_id)
  
  # Confirm status
  - id: flow05_confirm_status_valid
    scope: confirm
    path: status
    rule: enum(pending,approved,rejected,cancelled)
    
  - id: flow05_confirm_target_type_is_plan
    scope: confirm
    path: target_type
    rule: enum(plan)
  
  # Decisions array
  - id: flow05_confirm_has_decisions
    scope: confirm
    path: decisions
    rule: min-length(1)
    
  - id: flow05_decisions_have_uuid
    scope: confirm
    path: decisions[*].decision_id
    rule: uuid-v4
    
  - id: flow05_decisions_have_valid_status
    scope: confirm
    path: decisions[*].status
    rule: enum(approved,rejected,cancelled)
    
  - id: flow05_decision_reasons_non_empty
    scope: confirm
    path: decisions[*].reason
    rule: non-empty-string
  
  # Trace events
  - id: flow05_trace_has_events
    scope: trace
    path: events
    rule: min-length(2)
```

**Zero New Rules**: All invariants use existing rule types.

---

## 6. Success Criteria

FLOW-05 is **successfully implemented** when:

1. **Fixtures Complete**: Multi-round confirm with `decisions[]` array
2. **Invariants Pass**: ID bindings validated via `eq()`, decisions array validated
3. **Cross-Language Alignment**: TS and Python both pass (5/5 flows)
4. **No Schema Violations**: Zero fictional fields (no parent_plan_id, version, etc.)
5. **Trace Integration**: First flow to include trace.json in Golden Suite
6. **README Accuracy**: Describes actual protocol, no imagined versioning

---

## 7. References

- [MPLP Confirm Schema](../../schemas/v2/mplp-confirm.schema.json) - Actual schema
- [MPLP Trace Schema](../../schemas/v2/mplp-trace.schema.json) - Actual schema
- [MPLP Plan Schema](../../schemas/v2/mplp-plan.schema.json) - No versioning fields

---

**End of FLOW-05 README (Schema-Corrected Version)**

*This document reflects the actual MPLP v1.0 protocol schemas. No fictional fields (parent_plan_id, version, revision_reason, snapshot_id) are described.*

**Protocol Invariant Milestone**: FLOW-05 completion locks down Context, Plan, Confirm, and Trace minimum behavioral invariants for MPLP v1.0.