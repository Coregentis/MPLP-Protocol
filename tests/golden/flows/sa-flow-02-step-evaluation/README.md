# SA-FLOW-02: SA Multi-Step Evaluation

**Flow Type**: SA Profile Validation  
**Category**: Profile-Level (not part of v1.0 compliance boundary)  
**Status**: ✅ Implemented

## Test Scenario

**Scenario**: Execute a 4-step linear plan with dependencies

**Flow**:
1. SA initializes
2. SA loads Context (id: `550e8400-e29b-41d4-a716-446655442000`)
3. SA evaluates Plan (id: `550e8400-e29b-41d4-a716-446655442001`) with 4 steps
4. SA resolves step dependencies:
   - Step 0: No dependencies (execute first)
   - Step 1: Depends on Step 0
   - Step 2: Depends on Step 1
   - Step 3: Depends on Step 2
5. SA executes steps in order: 0 → 1 → 2 → 3
6. SA completes

---

## Fixtures

### Input

**`input/context.json`**:
- `context_id`: `550e8400-e29b-41d4-a716-446655442000`
- `title`: `SA Multi-Step Evaluation Demo`
- `status`: `active`
- `root.domain`: `sa-step-evaluation`
- `root.environment`: `test`

**`input/plan.json`**:
- `plan_id`: `550e8400-e29b-41d4-a716-446655442001`
- `context_id`: matches Context
- `steps`: Array with 4 steps in linear dependency chain
  - Step 0: `order_index: 0`, `dependencies: []`
  - Step 1: `order_index: 1`, `dependencies: [step-0-id]`
  - Step 2: `order_index: 2`, `dependencies: [step-1-id]`
  - Step 3: `order_index: 3`, `dependencies: [step-2-id]`

### Expected

**`expected/context.json`**: Same as input (Context is immutable)

**`expected/plan.json`**: Same as input (Plan structure unchanged)

---

## Invariants Validated

This flow validates 8 invariants:

1. **Context UUID**: `context_id` is valid UUID v4
2. **Context Active**: `status` is `active`
3. **Plan UUID**: `plan_id` is valid UUID v4
4. **Plan-Context Binding**: `plan.context_id` == `context.context_id`
5. **Min 3 Steps**: `steps` array has min-length 3 (actually has 4)
6. **Step UUIDs**: All `step_id` values are UUID v4
7. **Agent Roles Present**: All steps have non-empty `agent_role`
8. **Descriptions Present**: All steps have non-empty `description`

---

## SA Lifecycle Coverage

This flow exercises the SA lifecycle with emphasis on **evaluate_plan** and **execute_step** states:

```
initialize → load_context → evaluate_plan ← (dependency resolution)
                                ↓
                           execute_step (×4 steps)
                                ↓
                           emit_trace → complete
```

The **evaluate_plan** state must:
- Parse 4 steps
- Build dependency graph
- Determine execution order: [0, 1, 2, 3]

---

## Dependency Resolution

**Dependency Chain**:
```
Step 0 (Initialize)
  ↓
Step 1 (Process) - depends on Step 0
  ↓
Step 2 (Generate) - depends on Step 1
  ↓
Step 3 (Validate) - depends on Step 2
```

**Expected Execution Order**: Must be sequential (0 → 1 → 2 → 3)

**Invalid Orders** (should be prevented by SA):
- Executing Step 2 before Step 1
- Executing Step 3 before Step 2
- Parallel execution of dependent steps

---

## Relationship to FLOW-02

**Similarities**:
- Both test multi-step plans
- Both validate step ordering

**Differences**:
- SA-FLOW-02 emphasizes SA Profile lifecycle
- FLOW-02 tests volumetric scalability (25 steps)
- SA-FLOW-02 has explicit dependencies array
- FLOW-02 validates wildcard invariants (`steps[*]`)

---

## Usage

Run with Golden Harness (TypeScript or Python):

```bash
# TypeScript
npx ts-node tests/golden/harness/ts/golden-runner.ts

# Python
python -m pytest packages/sdk-py/tests/golden/test_golden_flow_01.py -v
```

Expected result: ✅ PASS for sa-flow-02-step-evaluation

---

**End of SA-FLOW-02 README**