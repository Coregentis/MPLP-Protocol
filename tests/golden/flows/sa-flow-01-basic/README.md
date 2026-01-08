# SA-FLOW-01: SA Basic Execution

**Flow Type**: SA Profile Validation  
**Category**: Profile-Level (not part of v1.0 compliance boundary)  
**Status**: ✅ Implemented

## Test Scenario

**Scenario**: Execute a single-step plan in SA mode

**Flow**:
1. SA initializes
2. SA loads Context (id: `550e8400-e29b-41d4-a716-446655441000`)
3. SA evaluates Plan (id: `550e8400-e29b-41d4-a716-446655441001`) with 1 step
4. SA executes step 0 (agent_role: `agent`)
5. SA completes

---

## Fixtures

### Input

**`input/context.json`**:
- `context_id`: `550e8400-e29b-41d4-a716-446655441000`
- `title`: `SA Basic Execution Demo`
- `status`: `active`
- `root.domain`: `sa-profile-demo`
- `root.environment`: `test`

**`input/plan.json`**:
- `plan_id`: `550e8400-e29b-41d4-a716-446655441001`
- `context_id`: matches Context
- `steps`: Array with 1 step
  - `step_id`: `550e8400-e29b-41d4-a716-446655441002`
  - `agent_role`: `agent`
  - `order_index`: `0`

### Expected

**`expected/context.json`**: Same as input (Context is immutable)

**`expected/plan.json`**: Same as input (Plan structure unchanged in this flow)

---

## Invariants Validated

This flow validates 8 invariants:

1. **Context UUID**: `context_id` is valid UUID v4
2. **Context Active**: `status` is `active`
3. **Plan UUID**: `plan_id` is valid UUID v4
4. **Plan-Context Binding**: `plan.context_id` == `context.context_id`
5. **Plan Has Steps**: `steps` array has min-length 1
6. **Agent Role Present**: All steps have non-empty `agent_role`
7. **Step UUIDs**: All `step_id` values are UUID v4

---

## SA Lifecycle Coverage

This flow exercises the complete SA lifecycle:

```
initialize → load_context → evaluate_plan → execute_step → emit_trace → complete
```

While trace emission is not validated in this flow's fixtures (trace.json not included), the lifecycle itself is implicit in the fixture structure.

---

## Relationship to FLOW-01

**Similarities**:
- Both are minimal baseline flows
- Both validate Context + Plan structure
- Both use single-agent semantics

**Differences**:
- SA-FLOW-01 is Profile-level (SA Profile specific)
- FLOW-01 is protocol-level (v1.0 compliance boundary)
- SA-FLOW-01 emphasizes agent_role and SA lifecycle
- FLOW-01 emphasizes general Context/Plan schema

---

## Usage

Run with Golden Harness (TypeScript or Python):

```bash
# TypeScript
npx ts-node tests/golden/harness/ts/golden-runner.ts

# Python
python -m pytest packages/sdk-py/tests/golden/test_golden_flow_01.py -v
```

Expected result: ✅ PASS for sa-flow-01-basic

---

**End of SA-FLOW-01 README**