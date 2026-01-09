# MAP-FLOW-01: MAP Turn-Taking Session

**Flow Type**: MAP Profile Validation  
**Category**: Profile-Level (not part of v1.0 compliance boundary)  
**Status**: ✅ Implemented

## Test Scenario

**Scenario**: Two-agent sequential collaboration with role rotation

**Flow**:
1. MAP session initialized (round_robin mode)
2. Roles assigned: Agent A → planner, Agent B → reviewer
3. Turn 1: Planner (Agent A) creates initial plan
4. Turn 2: Reviewer (Agent B) reviews plan
5. Turn 3: Planner (Agent A) revises based on review
6. Session completion

---

## Fixtures

### Input

**`input/context.json`**:
- `context_id`: `650e8400-e29b-41d4-a716-446655443000`
- `title`: `MAP Turn-Taking Collaboration Demo`
- `status`: `active`
- `root.domain`: `map-turn-taking-demo`

**`input/plan.json`**:
- `plan_id`: `650e8400-e29b-41d4-a716-446655443001`
- `context_id`: Matches Context
- `steps`: Array with 3 steps
  - Step 0: `agent_role: planner`, order_index: 0
  - Step 1: `agent_role: reviewer`, order_index: 1, depends on Step 0
  - Step 2: `agent_role: planner`, order_index: 2, depends on Step 1

**`input/collab.json`**:
- `collab_id`: `650e8400-e29b-41d4-a716-446655443002`
- `context_id`: Matches Context
- `mode`: **`round_robin`** ← MAP turn-taking pattern
- `participants`: Array with 2 participants
  - Participant 1: `role_id: ...3020`, `kind: agent`, `display_name: Agent A (Planner)`
  - Participant 2: `role_id: ...3021`, `kind: agent`, `display_name: Agent B (Reviewer)`

### Expected

**`expected/context.json`**: Same as input (Context immutable)

**`expected/plan.json`**: Same as input (Plan structure unchanged)

**`expected/collab.json`**: Same as input (Collab structure unchanged)

---

## Invariants Validated

This flow validates 12 invariants:

**Context (2)**:
1. `context_id` is UUID v4
2. `status` is `active`

**Plan (4)**:
3. `plan_id` is UUID v4
4. `plan.context_id` == `context.context_id`
5. Plan has ≥2 steps (min-length 2)
6. All steps have non-empty `agent_role`

**Collab (6)**:
7. `collab_id` is UUID v4
8. `collab.context_id` == `context.context_id`
9. `mode` is `round_robin`
10. Collab has ≥2 participants (min-length 2)
11. All participants have non-empty `role_id`
12. All participant `kind` is valid enum (agent, human, system, external)

---

## MAP Lifecycle Coverage

This flow exercises the MAP session lifecycle:

```
initialize_session → assign_roles → dispatch_turn (×3) → 
  collect_results (×3) → resolve_conflicts → broadcast_updates → complete_session
```

**Key Lifecycle Events** (logical, not validated in fixtures):
- `MAPSessionStarted`
- `MAPRolesAssigned` (2 participants)
- `MAPTurnDispatched` (Turn 1: planner)
- `MAPTurnCompleted` (Turn 1)
- `MAPTurnDispatched` (Turn 2: reviewer)
- `MAPTurnCompleted` (Turn 2)
- `MAPTurnDispatched` (Turn 3: planner)
- `MAPTurnCompleted` (Turn 3)
- `MAPSessionCompleted`

---

## Collaboration Pattern: Turn-Taking

**Pattern Characteristics**:
- **Exclusive execution**: Only one agent active at a time
- **Token-based**: Execution token transferred sequentially
- **Ordered**: Turn sequence respects Plan.steps order_index + dependencies

**Role Rotation**:
- Planner role executed twice (Step 0, Step 2)
- Reviewer role executed once (Step 1)
- Demonstrates role re-assignment within single session

---

## Relationship to SA Profile

**Integration**:
- Each turn can be implemented as an SA execution internally
- MAP coordinates WHEN agents execute (turn order)
- SA defines HOW each agent executes (single-agent lifecycle)

**Example**:
- Turn 1: Agent A runs SA lifecycle (initialize → execute step 0 → complete)
- MAP transfers token
- Turn 2: Agent B runs SA lifecycle (initialize → execute step 1 → complete)

---

## Usage

Run with Golden Harness (TypeScript or Python):

```bash
# TypeScript
npx ts-node tests/golden/harness/ts/golden-runner.ts

# Python
python -m pytest packages/sdk-py/tests/golden/test_golden_flow_01.py -v
```

Expected result: ✅ PASS for map-flow-01-turn-taking

---

**End of MAP-FLOW-01 README**