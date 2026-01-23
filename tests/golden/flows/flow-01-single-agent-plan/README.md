# FLOW-01 – Single Agent – Happy Path

**Category**: A: Single Agent Basics  
**Status**: ✅ Implemented  
**Last Updated**: 2025-11-29

## 2. MPLP Surface (L2 Modules)

This flow exercises the following L2 protocol modules:

### **Context**
- **Role**: Establishes the problem domain and execution environment for the agent workflow.
- **Key Fields**:
  - `context_id`: Unique identifier for this context instance (UUID v4)
  - `root.domain`: Categorizes the context ("golden-test" for test scenarios)
  - `root.environment`: Execution environment ("simulation" for golden tests)
  - `title`: Human-readable context name
  - `summary`: Brief description of the problem being solved
  - `status`: Context lifecycle state ("draft", "active", "archived")
  - `owner_role`: Who owns this context ("agent" for single-agent flows)
  - `language`: Natural language for context description ("en-US")
- **Behavior**:
  - Context is created once and remains immutable throughout the flow
  - All subsequent operations (Plan, Confirm, Trace) reference this context via `context_id`
  - Context serves as the semantic anchor for the entire workflow

### **Plan**
- **Role**: Defines the execution strategy as a sequence of steps.
- **Key Fields**:
  - `plan_id`: Unique identifier for this plan (UUID v4)
  - `context_id`: Reference to the parent context
  - `title`: Human-readable plan name
  - `objective`: High-level goal this plan achieves
  - `status`: Plan lifecycle state ("draft", "ready", "confirmed", "executing", "completed")
  - `steps[]`: Ordered array of execution steps (2 steps in FLOW-01)
    - Each step has: `step_id`, `description`, `status`, `dependencies` (optional)
  - `meta.protocol_version`: MPLP protocol version (1.0.0)
  - `created_at`, `updated_at`: Timestamps (ISO 8601 format)
- **Behavior**:
  - Plan is generated from Context
  - FLOW-01 uses a minimal 2-step plan to validate basic semantics
  - All `step_id` values must be unique UUID v4
  - All `description` fields must be non-empty (tested via `steps[*].description` invariant)

### **Confirm**
- **Role**: Represents the approval/rejection decision for executing the plan.
- **Key Fields**:
  - `confirm_id`: Unique identifier for this confirmation (UUID v4)
  - `plan_id`: Reference to the plan being confirmed
  - `context_id`: Reference back to the context
  - `status`: Confirmation outcome ("pending", "approved", "rejected")
  - `approver_role`: Who is authorized to approve ("human-reviewer", "agent-self")
  - `approval_timestamp`: When the approval occurred (ISO 8601)
  - `approval_notes`: Optional human-readable justification
- **Behavior**:
  - FLOW-01 demonstrates a **single-pass approval**: plan is approved immediately
  - This validates the "happy path" where no revisions are needed
  - For multi-round approval, see FLOW-05

### **Trace**
- **Role**: Records the actual execution of the plan, capturing all runtime events.
- **Key Fields**:
  - `trace_id`: Unique identifier for this execution trace (UUID v4)
  - `context_id`: Reference to the context
  - `root_span`: Top-level execution span containing metadata about the full workflow
    - `span_id`, `start_time`, `end_time`, `status`
  - `spans[]`: Hierarchical execution timeline (optional; FLOW-01 uses simple flat structure)
  - `events[]`: Chronologically ordered events (step start, step completion, errors, etc.)
  - `meta.total_duration_ms`: Total execution time
- **Behavior**:
  - Trace is generated during plan execution
  - FLOW-01 validates that trace correctly records:
    - Plan start/complete events
    - Step execution events (one per step)
    - Proper timestamp ordering
  - All event timestamps must be deterministic in golden tests (hardcoded values)

---

## 3. Integration Dimensions (L3/L4)

**None**. FLOW-01 deliberately excludes all L3/L4 integration capabilities to isolate L2 protocol validation:

- **No Tool Integration**: Steps do not invoke external tools
- **No LLM Backend**: Plan is human-authored, not AI-generated
- **No Storage Integration**: No external persistence beyond in-memory protocol objects
- **No Runtime Agent Complexity**: Single-agent, no multi-agent coordination

This minimal footprint ensures that any validation failures are attributable to the L2 protocol layer, not integration issues.

---

## 4. Input / Expected Fixtures

### 4.1 Input Fixtures (`input/`)

**`input/context.json`**
- A minimal but complete Context object.
- Example structure (actual fixture):
  ```json
  {
    "meta": {
      "protocol_version": "1.0.0"
    },
    "context_id": "550e8400-e29b-41d4-a716-446655440000",
    "root": {
      "domain": "golden-test",
      "environment": "simulation"
    },
    "title": "Golden Test Context - FLOW-01",
    "summary": "Baseline single-agent workflow for protocol validation",
    "status": "active",
    "owner_role": "agent",
    "language": "en-US",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
  ```

**`input/plan.json`**
- A 2-step plan representing a trivial automation task.
- Example structure (actual fixture):
  ```json
  {
    "meta": {
      "protocol_version": "1.0.0"
    },
    "plan_id": "550e8400-e29b-41d4-a716-446655440001",
    "context_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Golden Plan",
    "objective": "Demonstrate basic plan execution",
    "status": "ready",
    "steps": [
      {
        "step_id": "550e8400-e29b-41d4-a716-446655440100",
        "description": "Step 1",
        "status": "pending"
      },
      {
        "step_id": "550e8400-e29b-41d4-a716-446655440101",
        "description": "Step 2",
        "status": "pending"
      }
    ],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
  ```

### 4.2 Expected Fixtures (`expected/`)

**`expected/context.json`**
- Structurally identical to `input/context.json` (context is immutable in FLOW-01).
- May include updated `updated_at` timestamp if context metadata changes.

**`expected/plan.json`**
- Identical to `input/plan.json` with possible status transitions.
- In FLOW-01, plan moves from "ready" → "confirmed" → "completed".

**`expected/confirm.json`** (Optional in current implementation)
- Not yet implemented in initial FLOW-01 fixtures, but planned for completeness.

**`expected/trace.json`** (Optional in current implementation)
- Not yet implemented in initial FLOW-01 fixtures, but should contain:
  ```json
  {
    "trace_id": "...",
    "context_id": "550e8400-e29b-41d4-a716-446655440000",
    "root_span": {
      "span_id": "...",
      "name": "FLOW-01 Execution",
      "start_time": "2025-01-01T00:00:00.000Z",
      "end_time": "2025-01-01T00:00:10.000Z",
      "status": "completed"
    },
    "events": [
      {
        "event_id": "...",
        "type": "plan_execution_start",
        "timestamp": "2025-01-01T00:00:00.000Z"
      },
      {
        "event_id": "...",
        "type": "step_completed",
        "timestamp": "2025-01-01T00:00:05.000Z",
        "data": {"step_id": "550e8400-e29b-41d4-a716-446655440100"}
      },
      {
        "event_id": "...",
        "type": "step_completed",
        "timestamp": "2025-01-01T00:00:08.000Z",
        "data": {"step_id": "550e8400-e29b-41d4-a716-446655440101"}
      },
      {
        "event_id": "...",
        "type": "plan_execution_complete",
        "timestamp": "2025-01-01T00:00:10.000Z"
      }
    ]
  }
  ```

---

## 5. Invariants Design

FLOW-01 validates both **global invariants** (applicable to all flows) and serves as the reference for how invariant evaluation works.

### 5.1 Global Invariants (Defined in `tests/golden/invariants/`)

From `plan.yaml`:
```yaml
- id: plan_id_must_be_uuid
  path: plan_id
  rule: uuid-v4
  description: "Plan ID must be a valid UUID v4"

- id: plan_context_id_match
  path: context_id
  rule: eq(context.context_id)
  description: "Plan's context_id must match the Context's context_id"

- id: step_ids_must_be_uuid
  path: steps[*].step_id
  rule: uuid-v4
  description: "All Step IDs must be valid UUID v4"

- id: step_descriptions_must_be_non_empty
  path: steps[*].description
  rule: non-empty-string
  description: "All Step descriptions must be non-empty strings"
```

From `context.yaml`:
```yaml
- id: context_id_must_be_uuid
  path: context_id
  rule: uuid-v4
  description: "Context ID must be a valid UUID v4"

- id: context_status_must_be_valid
  path: status
  rule: enum("draft", "active", "archived")
  description: "Context status must be a valid enum value"
```

### 5.2 Critical Invariant Test: Wildcard Path Expansion

**FLOW-01 is the first test of wildcard path semantics**:

The invariant `steps[*].description` with rule `non-empty-string` must:
1. Parse the wildcard `[*]` correctly (not treat it as literal string)
2. Expand to `steps[0].description` and `steps[1].description`
3. Validate **each step individually** (not validate the array as a whole)
4. Report precise error paths (e.g., `plan.steps[1].description` if step 1 fails)

If this invariant fails in FLOW-01, it indicates a fundamental path resolution bug, NOT a flow-specific issue.

### 5.3 Flow-Specific Invariants (If Any)

FLOW-01 does not currently define flow-specific invariants. All validation is performed using global invariants. This keeps FLOW-01 as the "pure baseline" without special-case logic.

---

## 6. Cross-Language Expectations

### 6.1 TypeScript Golden Harness

The TypeScript harness (`tests/golden/harness/ts/`) must:
- Load `input/context.json` and `input/plan.json`
- Validate both against `@mplp/core-protocol` schemas
  - Use `validateContext()` and `validatePlan()` from validators
  - Ensure no schema validation errors
- Apply global invariants using `path-utils.ts` wildcard expansion
  - Validate `plan_id`, `context_id`, `step_id` fields are UUID v4
  - Validate `steps[*].description` are non-empty strings
  - Validate `context_id` cross-reference (`plan.context_id == context.context_id`)
- Compare runtime output against `expected/*.json` using `compare.ts`
  - Ignore non-deterministic fields (IDs, timestamps) as configured
- Report **exact failure paths** if any validation fails

**Current Status**: ✅ PASSING (1/1 flows passing)

### 6.2 Python Golden Harness

The Python harness (`packages/sdk-py/tests/golden/harness/`) must:
- Load identical fixtures
- Validate using `mplp_sdk.validation` schemas
  - Ensure schema validation produces identical error codes/paths as TypeScript
- Apply identical invariants using `path_utils.py`
  - Ensure wildcard expansion produces identical node paths
- Compare outputs using `golden_validator.py`
  - Ensure structural comparison uses identical ignore rules
- Produce **structurally equivalent validation results** as TypeScript

**Current Status**: ✅ PASSING (test_golden_flow_01.py passes, 2/2 tests)

### 6.3 Determinism Requirements

**Critical**: FLOW-01 must be **fully deterministic** across implementations:
- **All UUIDs** are hardcoded (e.g., `550e8400-e29b-41d4-a716-446655440000`)
- **All timestamps** are hardcoded (e.g., `2025-01-01T00:00:00.000Z`)
- **Step ordering** is fixed (Step 1, then Step 2)
- **Validation errors** (if any) must have identical `path` and `code` fields in both TypeScript and Python

This ensures that FLOW-01 serves as the **cross-language compatibility baseline**.

---

## 7. Relationship to Other Flows

### Purpose in the Suite Hierarchy

FLOW-01 is the **foundation** upon which all other flows are built:

| Flow | Extends FLOW-01 With |
|------|---------------------|
| FLOW-02 | Volumetric scale (20+ steps vs 2 steps) |
| FLOW-03 | Tool integration (Extension + Network modules) |
| FLOW-04 | LLM enrichment (Core + AEL integration) |
| FLOW-05 | Multi-round confirmation (version chains, rejection handling) |
| FLOW-06+ | Multi-agent coordination, advanced scenarios |

### Differentiation

- **FLOW-01 vs FLOW-02**: Minimal plan (2 steps) vs large plan (20+ steps)
- **FLOW-01 vs FLOW-03**: No tools vs tool invocations
- **FLOW-01 vs FLOW-04**: No AI vs LLM-enriched plan
- **FLOW-01 vs FLOW-05**: Single-pass approval vs multi-round confirmation

**Rule of Thumb**: If a feature breaks FLOW-01, it's a fundamental protocol issue. If it only breaks advanced flows, it's a feature-specific issue.

---

## 8. Implementation History

### Initial Implementation (P7.3.D - TypeScript)
- Created minimal `input/context.json` and `input/plan.json` fixtures
- Defined global invariants in `tests/golden/invariants/plan.yaml`
- Implemented `path-utils.ts` with wildcard expansion for `steps[*]`
- Implemented `golden-validator.ts` with schema, structural, and invariant checks
- Implemented `golden-runner.ts` to orchestrate validation
- **Result**: ✅ FLOW-01 passes (1/1 flows passing)

### Python Implementation (P7.3.E)
- Replicated TS fixtures (byte-for-byte identical input JSONs)
- Implemented `path_utils.py` with semantically equivalent wildcard logic
- Implemented `invariant_rules.py` with all 5 rules (uuid-v4, non-empty-string, etc.)
- Implemented `golden_validator.py` mirroring TS validation pipeline
- Implemented `runner.py` and pytest integration
- **Result**: ✅ FLOW-01 passes in Python (identical to TS output)

### Current Status (P7.3.F)
- FLOW-01 serves as the baseline for expanding to 25 flows (P7.3.F)
- All new flows (FLOW-02~25) must maintain FLOW-01's passing status
- FLOW-01 fixtures are considered **frozen** (no changes without protocol version bump)

---

## 9. Common Pitfalls & Mitigations

### Pitfall 1: Wildcard Path Not Recognized
**Risk**: Harness treats `steps[*]` as literal property name `"steps[*]"`.  
**Symptom**: Invariant `step_descriptions_must_be_non_empty` fails with "path not found".  
**Mitigation**: Ensure `parsePath()` correctly tokenizes `[*]` into `WildcardToken`.

### Pitfall 2: Cross-Reference Invariant Fails
**Risk**: `eq(context.context_id)` rule doesn't resolve `context.context_id` correctly.  
**Symptom**: Invariant `plan_context_id_match` fails even though IDs are identical.  
**Mitigation**: Ensure `getValueByPath()` (for `eq()` rule) handles cross-scope references.

### Pitfall 3: Schema Validation Rejects Valid Input
**Risk**: Fixtures don't match schema v2 exactly (e.g., missing `meta.protocol_version`).  
**Symptom**: Schema validation errors before invariant checks even run.  
**Mitigation**: Validate fixtures against schema during fixture creation, not during test execution.

### Pitfall 4: Timestamp Determinism Breaks
**Risk**: Different runs generate different timestamps (e.g., using `new Date()` instead of hardcoded values).  
**Symptom**: Structural comparison fails on `created_at` fields.  
**Mitigation**: Use hardcoded timestamps in all golden fixtures; never generate dynamically.

---

## 10. Success Criteria

FLOW-01 is considered **successfully implemented and stable** when:

1. **Fixtures Complete & Frozen**:
   - `input/context.json`, `input/plan.json` are complete and schema-valid
   - `expected/context.json`, `expected/plan.json` are deterministic golden snapshots
   - Fixtures are checked into version control and treated as immutable

2. **Invariants Pass**:
   - All global invariants in `plan.yaml` and `context.yaml` pass
   - Wildcard invariant `steps[*].description` correctly validates both steps
   - Cross-reference invariant `eq(context.context_id)` passes

3. **Cross-Language Alignment**:
   - TypeScript: `pnpm test:golden` reports "1/1 Passed"
   - Python: `pytest packages/sdk-py/tests/golden/test_golden_flow_01.py` reports "2/2 passed"
   - Both produce byte-for-byte identical validation results (no differences in error messages, paths, or codes)

4. **No Regressions**:
   - Adding FLOW-02~25 must not break FLOW-01
   - Updating harness logic must not cause FLOW-01 to fail

5. **Documentation Updated**:
   - This README accurately reflects implementation details
   - `docs/08-tests/golden-test-suite-overview.md` lists FLOW-01 as ✅ Implemented

---

## 11. Future Enhancements

### Potential Extensions (Not Currently Planned)

1. **Add Confirm & Trace Fixtures**: Complete the full Context → Plan → Confirm → Trace cycle in FLOW-01 fixtures.
2. **Add Performance Benchmarks**: Record validation latency for FLOW-01 as a baseline for performance regression testing.
3. **Add Negative Test Variants**: Create deliberately invalid FLOW-01 variants to test error handling (e.g., missing `step_id`, invalid UUID format).
4. **Add Snapshot-Based Regression Detection**: Automatically compare FLOW-01 validation output against historical snapshots to catch unintended changes.

---

## 12. References

- [Golden Test Suite Overview](../../docs/08-tests/golden-test-suite-overview.md)
- [MPLP Spec v1.0 - Context Module](../../docs/00-spec/mplp-spec-v1.0.md#context-module)
- [MPLP Spec v1.0 - Plan Module](../../docs/00-spec/mplp-spec-v1.0.md#plan-module)
- [Path Utils (TS)](../harness/ts/path-utils.ts) - Wildcard expansion implementation
- [Path Utils (Python)](../../packages/sdk-py/tests/golden/harness/path_utils.py) - Python equivalent
- [P7.3.D Completion Report](../../../../.gemini/antigravity/brain/f6c4e1f7-2980-409f-bd7c-f72de87f52c7/p7_3d_final_completion.md)
- [P7.3.E Completion Report](../../../../.gemini/antigravity/brain/f6c4e1f7-2980-409f-bd7c-f72de87f52c7/p7_3e_final_completion.md)

---

**End of FLOW-01 README**

*This document reflects the current state of FLOW-01 as the foundational baseline for the MPLP Golden Test Suite.*