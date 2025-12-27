# FLOW-02 – Single Agent – Large Plan

**Category**: A: Single Agent Basics  
**Status**: ✅ Implemented  
**Last Updated**: 2025-11-30

## 2. MPLP Surface (L2 Modules)

This flow exercises the following L2 protocol modules:
  - `events[]`: Step completion events, errors, retries (if applicable)
- **Behavior**:
  - Trace must handle volumetric event streams efficiently
  - Event ordering must be preserved (temporal causality)
  - No performance degradation as event count grows

---

## 3. Integration Dimensions (L3/L4)

**None**. This flow intentionally excludes:
- **Tool Integration**: No tool calls to avoid mixing concerns
- **LLM Backend**: No AEL enrichment; plan is pre-generated
- **Storage Integration**: No external I/O beyond protocol-level serialization

The isolation ensures that any performance or correctness issues observed are attributable to the protocol layer (L2), not to integration overhead (L3/L4).

---

## 4. Input / Expected Fixtures

### 4.1 Input Fixtures (`input/`)

**`input/context.json`**
- A standard Context object framing a "large-scale refactoring" or "batch processing" scenario.
- Must include:
  - `context_id`: Valid UUID v4
  - `title`: Descriptive (e.g., "Large-Scale Refactoring Context")
  - `root.domain`: "golden-test"
  - `root.environment`: "simulation"
  - `constraints`: Optional cost/resource limits (for future budget flows)
  
**`input/plan.json`**
- Contains **20-30 steps** in the `steps[]` array.
- Each step must have:
  - `step_id`: Unique UUID v4
  - `description`: Non-empty string (e.g., "Analyze module X", "Refactor function Y")
  - `status`: Typically "pending" or "in_progress"
  - `dependencies`: Optional array of prior step IDs (for dependency chains)
  - `agent_role`: Optional string indicating which role executes this step
  - `order_index`: Optional integer for explicit ordering
- The plan should demonstrate:
  - **Heterogeneous steps**: Mix of analysis, implementation, and validation tasks
  - **Dependency chains** (optional): Some steps may reference prior step IDs
  - **Realistic descriptions**: Not placeholder text; actual task descriptions

### 4.2 Expected Fixtures (`expected/`)

**`expected/context.json`**
- Should be structurally identical to `input/context.json`, with possible additions:
  - `updated_at`: Timestamp reflecting plan linkage
  - `plan_id`: Reference to the created plan's ID

**`expected/plan.json`**
- Structurally identical to `input/plan.json`, but with:
  - `plan_id`: Filled in (deterministic UUID for golden tests)
  - `created_at`: Hardcoded timestamp for deterministic comparison
  - All `step_id` values: Deterministic UUIDs (to allow exact structural matching)
  - `status`: May transition from "draft" to "ready" or "confirmed" depending on flow stage

**`expected/trace.json`** (Optional for FLOW-02)
- If the flow includes execution simulation:
  - Contains `spans[]` with one entry per step (20-30 spans)
  - Contains `events[]` with step completion events
  - All timestamps: Hardcoded for determinism
- If execution is not simulated in this flow, `trace.json` may be omitted.

---

## 5. Invariants Design

This flow validates both **global invariants** (from `tests/golden/invariants/plan.yaml`) and potential **flow-specific invariants**. Key validations:

### 5.1 Global Invariants (Already Defined)

From `plan.yaml`:
```yaml
- id: plan_id_must_be_uuid
  path: plan_id
  rule: uuid-v4
  description: "Plan ID must be a valid UUID v4"

- id: step_ids_must_be_uuid
  path: steps[*].step_id
  rule: uuid-v4
  description: "All Step IDs must be valid UUID v4"

- id: step_descriptions_must_be_non_empty
  path: steps[*].description
  rule: non-empty-string
  description: "All Step descriptions must be non-empty strings"
```

**Critical Test**: The `steps[*]` wildcard must correctly iterate over **all 20-30 steps**, validating each step's `step_id` and `description` individually. This tests the wildcard expansion logic's scalability.

### 5.2 Flow-Specific Invariants (To Be Defined)

Proposed additions for FLOW-02:

1. **`plan_must_have_min_20_steps`**
## 6. Cross-Language Expectations

### 6.1 TypeScript Golden Harness

The TypeScript harness (`tests/golden/harness/ts/`) must:
- Load `input/context.json` and `input/plan.json`
- Validate against `@mplp/core-protocol` schemas
- Apply all global + flow-specific invariants using `path-utils.ts` wildcard expansion
- Compare runtime output (if simulated) against `expected/*.json` using `compare.ts`
- Report **exact failure paths** (e.g., `plan.steps[17].description` if step 17's description is empty)

### 6.2 Python Golden Harness

The Python harness (`packages/sdk-py/tests/golden/harness/`) must:
- Load identical fixtures
- Validate against `mplp_sdk.validation` schemas
- Apply identical invariants using `path_utils.py` wildcard expansion
- Compare outputs using `golden_validator.py`
- Produce **structurally equivalent error reports** as TypeScript

### 6.3 Determinism Requirements

- **All UUIDs** in expected fixtures must be hardcoded (e.g., `550e8400-e29b-41d4-a716-446655XXXXXX`)
- **All timestamps** must be hardcoded (e.g., `2025-01-01T00:00:00.000Z`)
- **Step ordering** must be identical across languages
- **Validation errors** must have identical `path` and `code` fields in both languages

### 6.4 Performance Expectations

While not enforced programmatically in the golden suite, FLOW-02 should ideally complete within:
- **TypeScript**: <500ms for full validation
- **Python**: <1s for full validation

This ensures that large plans don't introduce unacceptable overhead.

---

## 7. Relationship to Other Flows

### Preceding Flow
- **FLOW-01 (Single Agent - Happy Path)**: Establishes the baseline single-agent workflow with minimal steps (2 steps). FLOW-02 extends this to volumetric scale.

### Subsequent Flows
- **FLOW-03 (With Tool Calls)**: Introduces tool integration on top of the multi-step foundation.
- **FLOW-04 (LLM Enrichment)**: Adds AEL reasoning on top of the multi-step foundation.

### Differentiation
- **FLOW-02 vs FLOW-01**: Volumetric scale (20+ steps vs 2 steps)
- **FLOW-02 vs FLOW-03**: No tool integration (pure plan validation)
- **FLOW-02 vs FLOW-04**: No LLM backend (pure protocol-level serialization)

---

## 8. Implementation Phases

### Phase 1: Fixture Creation (P7.3.F3)
1. Generate realistic `input/plan.json` with 20-30 steps
2. Create deterministic `expected/plan.json` with hardcoded UUIDs/timestamps
3. Optionally create `expected/trace.json` if execution simulation is included

### Phase 2: Invariant Definition (P7.3.F4)
1. Add flow-specific invariants to `invariants.yaml`
2. Test wildcard invariants with 20-30 step array
3. Verify error reporting for out-of-range indices (e.g., `steps[25].description`)

### Phase 3: Harness Integration (P7.3.F5)
1. Ensure TS and Python loaders discover FLOW-02
2. Run golden tests and fix any structural comparison failures
3. Validate that both languages report identical results

### Phase 4: Documentation (P7.3.F6)
1. Update `golden-test-suite-overview.md` status to ✅ Implemented
2. Add any lessons learned to this README
3. Document performance metrics if observed

---

## 9. Common Pitfalls & Mitigations

### Pitfall 1: Wildcard Invariant Performance
**Risk**: Iterating over 20-30 steps might be slow if path resolution is naive.  
**Mitigation**: Ensure `getValueNodesByPath` uses efficient array iteration, not regex matching for every index.

### Pitfall 2: Hardcoded UUIDs Collision
**Risk**: Reusing UUIDs from FLOW-01 in FLOW-02 causes assertion conflicts.  
**Mitigation**: Use distinct UUID prefix for each flow (e.g., FLOW-01 uses `...440000`, FLOW-02 uses `...440200`).

### Pitfall 3: Trace Event Explosion
**Risk**: If trace includes verbose logging, 20-30 steps might generate 100+ events, causing fixture bloat.  
**Mitigation**: Use minimal event payloads in golden fixtures (only essential fields).

---

## 10. Success Criteria

FLOW-02 is considered **successfully implemented** when:

1. **Fixtures Complete**:
   - `input/context.json`, `input/plan.json` contain realistic, valid data
   - `expected/context.json`, `expected/plan.json` (and optionally `trace.json`) are deterministic golden snapshots

2. **Invariants Pass**:
   - All global `plan.yaml` invariants pass (uuid-v4, non-empty-string)
   - All flow-specific invariants (>=20 steps, status enums) pass

3. **Cross-Language Alignment**:
   - TypeScript: `pnpm test:golden` includes FLOW-02 and reports PASS
   - Python: `pytest packages/sdk-py/tests/golden/` includes FLOW-02 and reports PASS
   - Both produce structurally identical validation results

4. **No Regressions**:
   - FLOW-01 continues to pass
   - No performance degradation in TS/Python runners

5. **Documentation Updated**:
   - `docs/08-tests/golden-test-suite-overview.md` shows FLOW-02 as ✅ Implemented
   - This README reflects any implementation-specific notes

---

## 11. Future Enhancements

### Potential Extensions (Not in Scope for Initial Implementation)

1. **Dependency Validation**: Add invariants to check that `step.dependencies[]` references valid prior step IDs.
2. **Parallel Execution**: Simulate concurrent execution of independent steps in trace.
3. **Step-Level Timing**: Add performance benchmarks for each step's execution time.
4. **Error Injection**: Test error recovery by marking step 15 as "failed" and validating retry logic (related to FLOW-16/17).

---

## 12. References

- [Golden Test Suite Overview](../../docs/08-tests/golden-test-suite-overview.md)
- [MPLP Spec v1.0 - Plan Module](../../docs/00-spec/mplp-spec-v1.0.md#plan-module)
- [Path Utils (TS)](../harness/ts/path-utils.ts) - Wildcard expansion implementation
- [Path Utils (Python)](../../packages/sdk-py/tests/golden/harness/path_utils.py) - Python equivalent

---

**End of FLOW-02 README**

*This document will be updated as fixtures and invariants are implemented in subsequent P7.3.F phases.*