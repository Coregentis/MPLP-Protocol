# FLOW-04 – Single Agent with LLM Enrichment

**Category**: A: Single Agent Basics  
**Status**: 🔄 In Progress (README Correction)  
**Last Updated**: 2025-11-30

## 2. MPLP Surface (L2 Modules)

This flow exercises the following L2 protocol modules:

### **Context**
- **Role**: Establishes the problem domain for LLM-powered workflows
- **Key Fields**: `context_id`, `title`, `summary`, `root.domain`, `root.environment`, `status`
- **Behavior**: Context provides semantic grounding; `summary` field can contain high-level objective that might guide LLM processing

### **Plan**
- **Role**: Defines execution steps, some of which involve LLM execution
- **Key Fields**:
  - `plan_id`, `context_id`, `title`, `objective`, `status`
  - `steps[]`: Array of step objects
    - `step_id`, `description`, `status`
    - **`agent_role`**: Indicates which executor type (tool/LLM/agent) handles this step
    - `dependencies` (optional): For sequencing LLM steps after tool steps
- **Behavior**:
  - Steps with `agent_role: "llm_claude"` indicate Claude LLM execution
  - Steps with `agent_role: "llm_gpt"` indicate GPT LLM execution
  - Steps with `agent_role: "curl_executor"` indicate tool execution (from FLOW-03)
  - Steps with `agent_role: "agent"` indicate standard agent logic
  - No `llm_model`, `enrichment_metadata`, or `meta.llm_provider` fields exist in schema

### **Trace** (Not Covered in Initial FLOW-04)
- **Role**: Would record LLM invocation events and results (future enhancement)
- For FLOW-04, we focus on **plan structure validation only** (like FLOW-01/02/03)

---

## 3. Integration Dimensions (L3/L4)

### **LLM Integration** (via Runtime, not Protocol)
- LLMs are **runtime capabilities**, not L2 protocol constructs
- The `agent_role` field provides protocol-level indication of LLM usage
- Actual LLM invocation happens at L4 (Runtime Agent Execution layer)
- For golden tests: LLM outputs would be **pre-determined** (no real API calls)

**FLOW-04 focuses on** protocol-level representation, not actual LLM execution.

---

## 4. Input / Expected Fixtures

### 4.1 Input Fixtures (`input/`)

**`input/context.json`**
```json
{
  "meta": {
    "protocol_version": "1.0.0",
    "schema_version": "1.0.0",
    "created_at": "2025-12-01T10:00:00.000Z"
  },
  "context_id": "550e8400-e29b-41d4-a716-446655440400",
  "title": "LLM Text Processing Workflow",
  "root": {
    "domain": "golden-test",
    "environment": "test"
  },
  "status": "active"
}
```

**`input/plan.json`** (6 steps: tool → LLM → agent pattern)
```json
{
  "meta": {...},
  "plan_id": "550e8400-e29b-41d4-a716-446655440401",
  "context_id": "550e8400-e29b-41d4-a716-446655440400",
  "title": "Article Processing with LLM",
  "objective": "Fetch, summarize, and reformat article using LLM",
  "status": "draft",
  "steps": [
    {
      "step_id": "550e8400-e29b-41d4-a716-446655440410",
      "description": "Fetch article via HTTP",
      "status": "pending",
      "agent_role": "curl_executor"
    },
    {
      "step_id": "550e8400-e29b-41d4-a716-446655440411",
      "description": "Parse article JSON",
      "status": "pending",
      "agent_role": "jq_processor",
      "dependencies": ["550e8400-e29b-41d4-a716-446655440410"]
    },
    {
      "step_id": "550e8400-e29b-41d4-a716-446655440412",
      "description": "Summarize article using LLM",
      "status": "pending",
      "agent_role": "llm_claude",
      "dependencies": ["550e8400-e29b-41d4-a716-446655440411"]
    },
    {
      "step_id": "550e8400-e29b-41d4-a716-446655440413",
      "description": "Validate summary format",
      "status": "pending",
      "agent_role": "agent",
      "dependencies": ["550e8400-e29b-41d4-a716-446655440412"]
    },
    {
      "step_id": "550e8400-e29b-41d4-a716-446655440414",
      "description": "Rewrite summary into bullet points using LLM",
      "status": "pending",
      "agent_role": "llm_gpt",
      "dependencies": ["550e8400-e29b-41d4-a716-446655440413"]
    },
    {
      "step_id": "550e8400-e29b-41d4-a716-446655440415",
      "description": "Final quality check and prepare report",
      "status": "pending",
      "agent_role": "agent",
      "dependencies": ["550e8400-e29b-41d4-a716-446655440414"]
    }
  ]
}
```

### 4.2 Expected Fixtures (`expected/`)

**`expected/context.json`**: Identical to `input/context.json` (context unchanged)

**`expected/plan.json`**: Identical to `input/plan.json` (plan unchanged in this flow)

**No `trace.json`**: Like FLOW-01/02/03, FLOW-04 is a plan-only validation flow.

---

## 5. Invariants Design

### 5.1 Global Invariants (Already Defined)
Standard plan invariants apply (uuid-v4, non-empty-string for descriptions)

### 5.2 Flow-Specific Invariants

**`flow-04-single-agent-llm-enrichment/invariants.yaml`**:
```yaml
invariants:
  - id: flow04_plan_minimum_steps
    scope: plan
    path: steps
    rule: min-length(6)
    
  - id: flow04_step_ids_are_uuid
    scope: plan
    path: steps[*].step_id
    rule: uuid-v4
    
  - id: flow04_step_descriptions_non_empty
    scope: plan
    path: steps[*].description
    rule: non-empty-string
    
  - id: flow04_step_status_valid
    scope: plan
    path: steps[*].status
    rule: enum(pending,in_progress,completed,blocked,skipped,failed)
    
  - id: flow04_agent_role_non_empty
    scope: plan
    path: steps[*].agent_role
    rule: non-empty-string
    description: "All steps must specify executor type (tool/LLM/agent)"
```

**Zero New Rules**: All 5 invariants use existing rule types from FLOW-01/02/03.

---

## 6. Cross-Language Expectations

### 6.1 TypeScript Golden Harness
- Load fixtures, validate against schema
- Apply invariants (agent_role must be non-empty for all steps)
- Verify LLM roles are valid strings

### 6.2 Python Golden Harness
- Identical fixture loading and validation
- Identical invariant application
- Structurally equivalent results

### 6.3 Determinism Requirements
- All UUIDs hardcoded
- All timestamps hardcoded
- No actual LLM calls (plan structure validation only)

---

## 7. Relationship to Other Flows

### Preceding Flows
- **FLOW-01**: Baseline (2 steps, agent only)
- **FLOW-02**: Large scale (25 steps, agent only)
- **FLOW-03**: Tools (8 steps, agent + tool roles)

### Differentiation
- **FLOW-04 vs FLOW-01/02**: Introduces LLM executor semantics via `agent_role`
- **FLOW-04 vs FLOW-03**: Extends tool pattern with LLM roles (Tool + LLM + Agent)
- **FLOW-04 vs FLOW-05**: LLM enrichment vs Confirm workflow

---

## 8. Success Criteria

FLOW-04 is **successfully implemented** when:

1. **Fixtures Complete**: 6-step plan with tool/LLM/agent roles using `agent_role` field
2. **Invariants Pass**: All 5 invariants validate correctly (no new rule types)
3. **Cross-Language Alignment**: TS and Python both pass (4/4 flows)
4. **No Schema Violations**: Zero fictional fields; only uses actual schema fields
5. **README Accuracy**: This document describes actual protocol, not imagined extensions

---

## 9. References

- [MPLP Plan Schema](../../schemas/v2/mplp-plan.schema.json) - Actual schema definition
- [FLOW-03 README](../flow-03-single-agent-with-tools/README.md) - Tool integration pattern
- [Protocol Engineering Lessons](../../../.gemini/antigravity/brain/.../protocol_engineering_lessons.md)

---

**End of FLOW-04 README (Schema-Corrected Version)**

*This document reflects the actual MPLP v1.0 protocol schema. No fictional fields are described.*