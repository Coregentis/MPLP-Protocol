# MAP-FLOW-02: MAP Broadcast Fan-out

**Flow Type**: MAP Profile Validation  
**Category**: Profile-Level (not part of v1.0 compliance boundary)  
**Status**: ✅ Implemented

## Test Scenario

**Scenario**: Distributed search - one query, multiple searchers, result aggregation

**Flow**:
1. MAP session initialized (broadcast mode)
2. Roles assigned: 1 orchestrator + 3 searchers
3. Orchestrator broadcasts search query
4. Searcher A/B/C execute searches in parallel (against different databases)
5. Orchestrator aggregates results
6. Session completion

---

## Fixtures

### Input

**`input/context.json`**:
- `context_id`: `650e8400-e29b-41d4-a716-446655444000`
- `title`: `MAP Broadcast Fan-out Demo`
- `status`: `active`
- `root.domain`: `map-broadcast-demo`

**`input/plan.json`**:
- `plan_id`: `650e8400-e29b-41d4-a716-446655444001`
- `context_id`: Matches Context
- `steps`: Array with 5 steps
  - Step 0: **`agent_role: orchestrator`** - Broadcast query
  - Step 1: `agent_role: searcher` - Search DB A (depends on Step 0)
  - Step 2: `agent_role: searcher` - Search DB B (depends on Step 0)
  - Step 3: `agent_role: searcher` - Search DB C (depends on Step 0)
  - Step 4: **`agent_role: orchestrator`** - Aggregate results (depends on Step 1/2/3)

**`input/collab.json`**:
- `collab_id`: `650e8400-e29b-41d4-a716-446655444002`
- `context_id`: Matches Context
- `mode`: **`broadcast`** ← MAP broadcast pattern
- `participants`: Array with 4 participants
  - Orchestrator: `role_id: ...4020`, `kind: agent`
  - Searcher A: `role_id: ...4021`, `kind: agent`
  - Searcher B: `role_id: ...4022`, `kind: agent`
  - Searcher C: `role_id: ...4023`, `kind: agent`

### Expected

**`expected/context.json`**: Same as input (Context immutable)

**`expected/plan.json`**: Same as input (Plan structure unchanged)

**`expected/collab.json`**: Same as input (Collab structure unchanged)

---

## Invariants Validated

This flow validates 14 invariants:

**Context (2)**:
1. `context_id` is UUID v4
2. `status` is `active`

**Plan (5)**:
3. `plan_id` is UUID v4
4. `plan.context_id` == `context.context_id`
5. Plan has ≥3 steps (min-length 3)
6. All steps have non-empty `agent_role`
7. All step_id are UUID v4

**Collab (7)**:
8. `collab_id` is UUID v4
9. `collab.context_id` == `context.context_id`
10. `mode` is `broadcast`
11. Collab has ≥2 participants (min-length 2)
12. All participants have non-empty `role_id`
13. All participant `kind` is valid enum
14. All participant_id are non-empty strings

---

## MAP Lifecycle Coverage

This flow exercises the MAP broadcast lifecycle:

```
initialize_session → assign_roles → dispatch_turn (broadcast) → 
  collect_results (parallel) → resolve_conflicts → broadcast_updates → complete_session
```

**Key Lifecycle Events** (logical, not validated in fixtures):
- `MAPSessionStarted`
- `MAPRolesAssigned` (4 participants)
- `MAPBroadcastSent` (orchestrator → searchers)
- `MAPBroadcastReceived` (Searcher A)
- `MAPBroadcastReceived` (Searcher B)
- `MAPBroadcastReceived` (Searcher C)
- `MAPSessionCompleted`

---

## Collaboration Pattern: Broadcast Fan-out

**Pattern Characteristics**:
- **Parallel execution**: Multiple agents execute simultaneously (logically)
- **No token transfer**: All responders have implicit permission
- **Fan-out → Fan-in**: Broadcast → Responses → Aggregation

**Dependency Structure**:
```
Step 0 (Broadcast)
  ├── Step 1 (Searcher A)
  ├── Step 2 (Searcher B)
  └── Step 3 (Searcher C)
       ↓
Step 4 (Aggregate) - depends on all searchers
```

**Conflict Resolution**:
- Responses timestamped
- No concurrent writes (each searcher has isolated scope)
- Aggregation happens after all responses collected

---

## Relationship to SA Profile

**Integration**:
- Each searcher runs SA internally (search task execution)
- Orchestrator runs SA for broadcast and aggregation
- MAP coordinates WHO executes WHEN (parallel dispatch)

**Example**:
- Orchestrator SA: broadcast query
- 3 Searcher SAs: execute searches (parallel, independent)
- Orchestrator SA: aggregate results

---

## Usage

Run with Golden Harness (TypeScript or Python):

```bash
# TypeScript
npx ts-node tests/golden/harness/ts/golden-runner.ts

# Python
python -m pytest packages/sdk-py/tests/golden/test_golden_flow_01.py -v
```

Expected result: ✅ PASS for map-flow-02-broadcast-fanout

---

**End of MAP-FLOW-02 README**