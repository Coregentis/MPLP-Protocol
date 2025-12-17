---
title: Golden Test Suite Details
description: Technical details of the MPLP Golden Test Suite. Covers test scope,
  flow catalog, cross-language harness architecture (TS/Python), CI integration,
  and how to run tests.
keywords:
  - Golden Test Suite Details
  - MPLP testing harness
  - cross-language testing
  - CI integration
  - running tests
  - test architecture
  - flow catalog
sidebar_label: Test Suite Details
doc_status: informative
doc_role: guide
normative_refs:
  - MPLP-CORPUS-v1.0.0
protocol_alignment:
  truth_level: T2
  protocol_version: 1.0.0
  schema_refs: []
  invariant_refs: []
  golden_refs:
    - local_path: tests/golden/flows/sa-flow-02-step-evaluation
      binding: mention
    - local_path: tests/golden/flows/sa-flow-01-basic
      binding: mention
    - local_path: tests/golden/flows/map-flow-02-broadcast-fanout
      binding: mention
    - local_path: tests/golden/flows/map-flow-01-turn-taking
      binding: mention
    - local_path: tests/golden/flows/flow-02-single-agent-large-plan
      binding: mention
    - local_path: tests/golden/flows/flow-01-single-agent-plan
      binding: mention
  code_refs:
    ts: []
    py: []
  evidence_notes: []
  doc_status: informative
sidebar_position: 3
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.
## Table of Contents

1. [Golden Suite Scope](#golden-suite-scope)
2. [Test Flow Catalog](#test-flow-catalog)
3. [Cross-Language Harness](#cross-language-harness)
4. [CI Integration](#ci-integration)
5. [How to Run Tests](#how-to-run-tests)
6. [How to Add New Flows (v1.1+)](#how-to-add-new-flows-v11)
7. [Relationship to v1.0 Compliance](#relationship-to-v10-compliance)

---

## Golden Suite Scope

**Purpose**: Validate protocol-invariant behaviors across MPLP implementations

**What Golden Tests DO**:
- Validate L1/L2 schema conformance (Context, Plan, Confirm, Trace)
- Validate core invariants (UUID format, ISO datetime, non-empty strings, etc.)
- Validate SA/MAP Profile semantics (execution flows)
- Provide reproducible baseline for protocol compliance

**What Golden Tests DO NOT**:
- Validate runtime event emission (Observability layer)
- Validate LearningSample collection (Learning layer)
- Validate PSG operations (Runtime Glue layer)
- Validate Integration events (Integration layer)

**Rationale**: Golden Tests focus on **L1/L2 protocol-invariants**, not runtime implementation details.

---

## Test Flow Catalog

### Core Protocol Flows (FLOW-01~05)

#### FLOW-01: Single Agent Plan
**Path**: `tests/golden/flows/flow-01-single-agent-plan/`

**Purpose**: Basic Context Plan Trace flow

**Validates**:
- Context schema: `context_id`, `title`, `timestamp`
- Plan schema: `plan_id`, `context_id`, `steps[]`, `dependencies[]`
- Trace schema: `trace_id`, `context_id`, `events[]`
- Basic invariants: UUID v4, ISO datetime

**Fixture**: Single-agent generates 3-step plan, no confirmation

**Expected Outcome**: All schemas validate, all invariants pass

---

#### FLOW-02: Single Agent Large Plan
**Path**: `tests/golden/flows/flow-02-single-agent-large-plan/`

**Purpose**: Scale test with complex plan (10+ steps)

**Validates**:
- Plan complexity handling
- Dependency graph validation
- Step ordering semantics

**Fixture**: Single-agent generates 15-step plan with dependencies

**Expected Outcome**: All schemas validate, dependency graph consistent

---

#### FLOW-03: Single Agent With Tools
**Path**: `tests/golden/flows/flow-03-single-agent-tools/`

**Purpose**: Extension Module + tool execution

**Validates**:
- Extension schema (tool adapters)
- `agent_role` polymorphism (`curl_executor`, `jq_processor`)
- Trace spans for tool invocations

**Fixture**: Single-agent uses curl and jq tools

**Expected Outcome**: Extension schema valid, tool traces captured

---

#### FLOW-04: Single Agent LLM Enrichment
**Path**: `tests/golden/flows/flow-04-llm-enrichment/`

**Purpose**: Intent Plan generation with LLM

**Validates**:
- `agent_role` polymorphism (`llm_claude`, `llm_gpt`)
- Intent to Plan mapping
- LLM invocation traces

**Fixture**: User intent enriched by LLM into structured plan

**Expected Outcome**: Plan generated from intent, LLM traces captured

---

#### FLOW-05: Single Agent Confirm Required
**Path**: `tests/golden/flows/flow-05-confirm-required/`

**Purpose**: Approval workflow (Plan Confirm Trace)

**Validates**:
- Confirm schema: `confirm_id`, `target_plan`, `decisions[]`
- Multi-round approval semantics
- `status` transitions (pending approved/rejected)

**Fixture**: Plan requires user approval before execution

**Expected Outcome**: Confirm schema valid, approval flow correct

---

### SA Profile Flows (SA-01/02)

#### SA-01: SA Basic
**Path**: `tests/golden/flows/sa-flow-01-basic/`

**Purpose**: SA Profile baseline validation

**Validates**:
- SA Profile event schema
- Single-agent execution semantics
- SA-specific invariants

**Fixture**: Minimal SA Profile execution

**Expected Outcome**: SA Profile compliant

---

#### SA-02: SA Step Evaluation
**Path**: `tests/golden/flows/sa-flow-02-step-evaluation/`

**Purpose**: Step-by-step execution tracking

**Validates**:
- Step evaluation semantics
- Trace spans per step
- Step status transitions

**Fixture**: SA executes plan with step-level tracing

**Expected Outcome**: All steps traced correctly

---

### MAP Profile Flows (MAP-01/02)

#### MAP-01: Turn Taking
**Path**: `tests/golden/flows/map-flow-01-turn-taking/`

**Purpose**: Sequential agent handoffs

**Validates**:
- MAP Profile event schema
- Turn-taking coordination
- Collab Module usage
- MAP-specific invariants

**Fixture**: Agent A Agent B Agent C sequential execution

**Expected Outcome**: MAP Profile compliant, turn-taking correct

---

#### MAP-02: Broadcast Fanout
**Path**: `tests/golden/flows/map-flow-02-broadcast-fanout/`

**Purpose**: One-to-many agent dispatch

**Validates**:
- Broadcast coordination pattern
- Parallel agent execution
- Result aggregation

**Fixture**: Orchestrator dispatches to Worker? Worker? Worker?

**Expected Outcome**: MAP Profile compliant, broadcast correct

---

## Cross-Language Harness

### TypeScript Harness

**Location**: `tests/golden/harness/ts/`

**Entry Point**: `golden-runner.ts`

**Dependencies**:
- Node.js v18+
- TypeScript 5.x
- Ajv (JSON Schema validator)
- ts-node

**Run Command**:
```bash
npx ts-node --transpile-only tests/golden/harness/ts/golden-runner.ts
```

**Output**:
```
 Starting Golden Test Suite...
Found 9 flows.

Running FLOW-01: Single Agent Plan... PASS

Running FLOW-02: Single Agent Large Plan... PASS

...

Summary: 9/9 Passed.
```

**Architecture**:
```
golden-runner.ts
   discover_flows() - Scan tests/golden/flows/
   load_fixture() - Load context.json, plan.json, etc.
   validate_schemas() - Run Ajv validation
   validate_invariants() - Check UUID, datetime, etc.
   report_results() - Print summary
```

---

### Python Harness

**Location**: `tests/golden/harness/py/`

**Entry Point**: `test_golden.py`

**Dependencies**:
- Python 3.9+
- pytest
- jsonschema

**Run Command**:
```bash
pytest tests/golden/harness/py/test_golden.py -v
```

**Output**:
```
tests/golden/harness/py/test_golden.py::test_flow_01 PASSED
tests/golden/harness/py/test_golden.py::test_flow_02 PASSED
...
tests/golden/harness/py/test_golden.py::test_map_flow_02 PASSED

========== 9 passed in 2.35s ==========
```

**Architecture**:
```python
test_golden.py
   discover_flows() - Scan fixtures
   load_fixture() - Load JSON files
   validate_schema() - jsonschema validation
   validate_invariants() - Custom validators
   pytest.mark.parametrize() - Run all flows
```

---

## CI Integration

### GitHub Actions Workflow

**File**: `.github/workflows/golden-tests.yml`

**Triggers**:
- On push to `main`
- On pull request to `main`
- Manual workflow_dispatch

**Jobs**:
1. **TypeScript Golden Tests**:
   ```yaml
   - name: Run TypeScript Golden Harness
     run: npx ts-node --transpile-only tests/golden/harness/ts/golden-runner.ts
   ```

2. **Python Golden Tests**:
   ```yaml
   - name: Run Python Golden Harness
     run: pytest tests/golden/harness/py/test_golden.py -v
   ```

**Success Criteria**: Both harnesses must pass (9/9 flows)

**Failure Handling**:
- GitHub Action fails
- Pull request blocked
- Developer investigates failed flow

---

## How to Run Tests

### Option 1: TypeScript Harness (Recommended)

```bash
# Install dependencies
pnpm install

# Run Golden Tests
pnpm run test:golden
# OR
npx ts-node --transpile-only tests/golden/harness/ts/golden-runner.ts
```

---

### Option 2: Python Harness

```bash
# Install dependencies
pip install -r tests/golden/harness/py/requirements.txt

# Run Golden Tests
pytest tests/golden/harness/py/test_golden.py -v
```

---

### Option 3: Run Single Flow (Debug)

```bash
# TypeScript
npx ts-node --transpile-only tests/golden/harness/ts/golden-runner.ts --flow flow-01

# Python
pytest tests/golden/harness/py/test_golden.py::test_flow_01 -v
```

---

## How to Add New Flows (v1.1+)

### Step 1: Create Fixture Directory

```bash
mkdir -p tests/golden/flows/flow-06-new-feature/
```

---

### Step 2: Add Fixture Files

**Required files**:
- `context.json` - Context Module fixture
- `plan.json` - Plan Module fixture
- `confirm.json` - (Optional) Confirm Module fixture
- `trace.json` - Trace Module fixture
- `meta.json` - Test metadata

**Example `meta.json`**:
```json
{
  "flow_id": "FLOW-06",
  "flow_name": "New Feature Test",
  "description": "Validates new v1.1 feature",
  "modules_tested": ["Context", "Plan", "Trace", "NewModule"],
  "phase": 1,
  "compliance_level": "optional"
}
```

---

### Step 3: Update Harness (if needed)

**TypeScript**: `tests/golden/harness/ts/golden-runner.ts`
- Add flow discovery logic (automatic if following naming convention)
- Add custom validators (if new invariants)

**Python**: `tests/golden/harness/py/test_golden.py`
- Add parametrized test case
- Add custom assertions

---

### Step 4: Run& Verify

```bash
# TypeScript
npx ts-node tests/golden/harness/ts/golden-runner.ts --flow flow-06

# Python
pytest tests/golden/harness/py/test_golden.py::test_flow_06 -v
```

---

### Step 5: Update Documentation

- Add flow description to [Golden Suite Overview](golden-test-suite-overview.md)
- Update compliance matrix (if new compliance requirements)
- Document new schemas/invariants (if added)

---

## Relationship to v1.0 Compliance

### Golden Tests as Validation Mechanism

**Compliance Requirement**:
- **v1.0 REQUIRED**: Pass all 9 Golden Flows
  - FLOW-01~05 (Core protocol)
  - SA-01/02 (SA Profile)
  - MAP-01/02 (MAP Profile, if implementing MAP)

**Self-Validation**:
1. Clone MPLP protocol repository
2. Replace fixtures with your runtime's output
3. Run Golden Harness
4. All tests pass? v1.0 compliant 

---

### Reusing Fixtures in Your Runtime

**Pattern**: Use Golden Fixtures as integration test inputs

**Example**:
```typescript
// Your runtime
import { flow01Context } from 'mplp-protocol/tests/golden/flows/flow-01/context.json';

// Test your implementation
const result = await myRuntime.processContext(flow01Context);

// Validate output matches expectations
assert(result.plan_id === ...);
```

**Benefits**:
- Consistent test baseline across implementations
- Protocol-level interoperability validation
- Easy compliance verification

---

## Troubleshooting

### Common Issues

**1. Schema Validation Fails**
- **Cause**: JSON doesn't match schema
- **Fix**: Check `additionalProperties`, required fields, field types

**2. Invariant Violation**
- **Cause**: UUID not v4, datetime not ISO 8601, etc.
- **Fix**: Regenerate UUIDs, format timestamps correctly

**3. Dependency Graph Invalid**
- **Cause**: Circular dependencies, missing step references
- **Fix**: Validate step IDs, check dependency array

**4. CI Fails Locally Passes**
- **Cause**: Environment differences (Node version, Python version)
- **Fix**: Match CI environment versions locally

---

## Advanced Topics

### Custom Validators

**TypeScript Example**:
```typescript
function validateStepDependencies(plan: Plan): boolean {
  const stepIds = new Set(plan.steps.map(s => s.step_id));
  for (const dep of plan.dependencies) {
    if (!stepIds.has(dep.from) || !stepIds.has(dep.to)) {
      return false; // Invalid dependency reference
    }
  }
  return true;
}
```

**Python Example**:
```python
def validate_step_dependencies(plan):
    step_ids = {s['step_id'] for s in plan['steps']}
    for dep in plan.get('dependencies', []):
        if dep['from'] not in step_ids or dep['to'] not in step_ids:
            return False
    return True
```

---

## Performance Benchmarking

**Golden Tests can measure**:
- Schema validation time
- Invariant check time
- Large plan processing (FLOW-02)

**Example**:
```typescript
const start = Date.now();
validateSchema(largePlan, planSchema);
const duration = Date.now() - start;
console.log(`FLOW-02 validation: ${duration}ms`);
```

---

## Summary

**Golden Test Suite**:
- 9 flows covering core protocol + SA/MAP profiles
- Cross-language harness (TypeScript + Python)
- CI integration with GitHub Actions
- Extensible for v1.1+ features
- Foundation for v1.0 compliance validation

**Key Takeaways**:
- Golden Tests validate **protocol-invariants** (schemas, invariants)
- NOT runtime behaviors (events, learning, PSG operations)
- Passing all 9 flows is **REQUIRED** for v1.0 compliance
- Fixtures can be reused as integration test baselines

---

**For more information**:
- [Golden Suite Overview](golden-test-suite-overview.md)
- [Compliance Guide](../08-guides/mplp-v1.0-compliance-guide.md)
- [Compliance Checklist](../08-guides/mplp-v1.0-compliance-checklist.md)

---

**End of Golden Test Suite Technical Details**

*This document provides comprehensive guidance for running, extending, and troubleshooting the MPLP v1.0 Golden Test Suite.*
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
