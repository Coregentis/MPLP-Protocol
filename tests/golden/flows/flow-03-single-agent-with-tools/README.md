# FLOW-03 – Single Agent – With Tools

**Category**: A: Single Agent Basics  
**Status**: 🔄 In Progress (README Correction)  
**Last Updated**: 2025-11-30

## 2. MPLP Surface (L2 Modules)

This flow exercises the following L2 protocol modules:

### **Context**
- **Role**: Establishes the problem domain for tool-enabled workflows
- **Key Fields**: `context_id`, `title`, `root.domain`, `root.environment`, `status`
- **Behavior**: Context remains immutable; provides semantic anchor for tool-based plan

### **Plan**
- **Role**: Defines execution steps, some of which involve tool execution
- **Key Fields**:
  - `plan_id`, `context_id`, `title`, `objective`, `status`
  - `steps[]`: Array of step objects
    - `step_id`, `description`, `status`
    - **`agent_role`**: Indicates which role/tool executes this step
    - `dependencies` (optional): For sequencing tool steps
- **Behavior**:
  - Steps with `agent_role: "curl_executor"` indicate curl tool usage
  - Steps with `agent_role: "agent"` indicate standard agent logic
  - No `tool_name` or `parameters` fields exist in schema

### **Trace**
- **Role**: Records tool invocation events and results
- **Key Fields**:
  - `trace_id`, `context_id`, `plan_id`, `status`
  - `events[]`: Chronologically ordered events
    - Tool invocation events (type, timestamp, step reference)
    - Tool result events (output summary, errors)
- **Behavior**:
  - Each tool step generates trace events
  - Events include deterministic tool outputs (for golden tests)

---

## 3. Integration Dimensions (L3/L4)

### **Tool Integration** (via Runtime, not Protocol)
- Tools are **runtime capabilities**, not L2 protocol constructs
- The `agent_role` field provides protocol-level indication of tool usage
- Actual tool execution happens at L4 (Runtime Agent Execution layer)
- For golden tests: tool outputs are **pre-determined** (no real HTTP calls)

---

## 4. Input / Expected Fixtures

### 4.1 Input Fixtures (`input/`)

**`input/context.json`**
```json
{
  "meta": {"protocol_version": "1.0.0", "schema_version": "1.0.0", "created_at": "..."},
  "context_id": "550e8400-e29b-41d4-a716-446655440300",
  "title": "API Testing Workflow with Tools",
  "root": {"domain": "golden-test", "environment": "test"},
  "status": "active"
}
```

**`input/plan.json`** (8 steps: 3 tool-based, 5 agent logic)
```json
{
  "meta": {...},
  "plan_id": "550e8400-e29b-41d4-a716-446655440301",
  "context_id": "550e8400-e29b-41d4-a716-446655440300",
  "title": "API Testing Plan",
  "objective": "Test REST API endpoints using curl and jq",
  "status": "draft",
  "steps": [
    {
      "step_id": "550e8400-e29b-41d4-a716-446655440310",
      "description": "Fetch user list from API endpoint",
      "status": "pending",
      "agent_role": "curl_executor"
    },
    {
      "step_id": "550e8400-e29b-41d4-a716-446655440311",
      "description": "Parse JSON response to extract user names",
      "status": "pending",
      "agent_role": "jq_processor",
      "dependencies": ["550e8400-e29b-41d4-a716-446655440310"]
    },
    {
      "step_id": "550e8400-e29b-41d4-a716-446655440312",
      "description": "Analyze response structure for schema compliance",
      "status": "pending",
      "agent_role": "agent"
    },
    // ... 5 more steps
  ]
}
```

### 4.2 Expected Fixtures (`expected/`)

**`expected/context.json`**: Identical to `input/context.json` (context unchanged)

**`expected/plan.json`**: Identical to `input/plan.json` (plan unchanged in this flow)

**`expected/trace.json`**: Contains tool execution events (deterministic outputs)

---

## 5. Invariants Design

### 5.1 Global Invariants (Already Defined)
Standard plan invariants apply (uuid-v4, non-empty-string for descriptions)

### 5.2 Flow-Specific Invariants

**`flow-03-single-agent-with-tools/invariants.yaml`**:
```yaml
invariants:
  - id: flow03_plan_minimum_steps
    scope: plan
    path: steps
    rule: min-length(6)
    
  - id: flow03_step_ids_are_uuid
    scope: plan
    path: steps[*].step_id
    rule: uuid-v4
    
  - id: flow03_step_descriptions_non_empty
    scope: plan
    path: steps[*].description
    rule: non-empty-string
    
  - id: flow03_step_status_valid
    scope: plan
    path: steps[*].status
    rule: enum(pending,in_progress,completed,blocked,skipped,failed)
    
  - id: flow03_agent_role_non_empty
    scope: plan
    path: steps[*].agent_role
    rule: non-empty-string
    description: "All steps must specify which role/tool executes them"
```

**No new rule types needed** - uses existing 7 rules from FLOW-01/02.

---

## 6. Cross-Language Expectations

### 6.1 TypeScript Golden Harness
- Load fixtures, validate against schema
- Apply invariants (agent_role must be non-empty for all steps)
- Verify structural equivalence (no trace comparison in initial version)

### 6.2 Python Golden Harness
- Identical fixture loading and validation
- Identical invariant application
- Structurally equivalent results

### 6.3 Determinism Requirements
- All UUIDs hardcoded
- All timestamps hardcoded
- Tool outputs in trace.json are pre-determined (no real curl calls)

---

## 7. Relationship to Other Flows

### Preceding Flows
- **FLOW-01**: Baseline (2 steps, no tools)
- **FLOW-02**: Large scale (25 steps, no tools)

### Differentiation
- **FLOW-03 vs FLOW-01/02**: Introduces tool semantics via `agent_role` field
- **FLOW-03 vs FLOW-04**: Tools (external commands) vs LLM enrichment (internal reasoning)

---

## 8. Success Criteria

FLOW-03 is **successfully implemented** when:

1. **Fixtures Complete**: 8-step plan with 3 tool roles (curl_executor, jq_processor, agent)
2. **Invariants Pass**: All 5 invariants validate correctly (no new rule types)
3. **Cross-Language Alignment**: TS and Python both pass (3/3 flows)
4. **No Schema Violations**: Zero fictional fields; only uses actual schema fields
5. **README Accuracy**: This document describes actual protocol, not imagined extensions

---

## 9. References

- [MPLP Plan Schema](../../schemas/v2/mplp-plan.schema.json) - Actual schema definition
- [FLOW-02 README](../flow-02-single-agent-large-plan/README.md) - Volumetric baseline
- [Protocol Engineering Lessons](../../../.gemini/antigravity/brain/.../protocol_engineering_lessons.md)

---

**End of FLOW-03 README (Schema-Corrected Version)**

*This document reflects the actual MPLP v1.0 protocol schema. No fictional fields are described.*