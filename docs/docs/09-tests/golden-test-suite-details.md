---
doc_type: reference
status: active
authority: Documentation Governance
description: ""
title: Golden Test Suite Details
---

# Golden Test Suite Details

> **Status**: Informative
> **Version**: 1.0.0
> **Authority**: Documentation Governance

## Table of Contents

1. [Golden Suite Scope](#golden-suite-scope)
2. [Test Flow Catalog](#test-flow-catalog)
3. [Cross-Language Harness](#cross-language-harness)
4. [CI Integration](#ci-integration)
5. [How to Run Tests](#how-to-run-tests)
6. [How to Add New Flows (v1.1+)](#how-to-add-new-flows-v11)
7. [Relationship to v1.0 Compliance](#relationship-to-v10-compliance)

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

#### FLOW-03: Single Agent With Tools
**Path**: `tests/golden/flows/flow-03-single-agent-tools/`

**Purpose**: Extension module + tool execution

**Validates**:
- Extension schema (tool adapters)
- `agent_role` polymorphism (`curl_executor`, `jq_processor`)
- Trace spans for tool invocations

**Fixture**: Single-agent uses curl and jq tools

**Expected Outcome**: Extension schema valid, tool traces captured

#### FLOW-05: Single Agent Confirm Required
**Path**: `tests/golden/flows/flow-05-confirm-required/`

**Purpose**: Approval workflow (Plan Confirm Trace)

**Validates**:
- Confirm schema: `confirm_id`, `target_plan`, `decisions[]`
- Multi-round approval semantics
- `status` transitions (pending approved/rejected)

**Fixture**: Plan requires user approval before execution

**Expected Outcome**: Confirm schema valid, approval flow correct

#### SA-02: SA Step Evaluation
**Path**: `tests/golden/flows/sa-flow-02-step-evaluation/`

**Purpose**: Step-by-step execution tracking

**Validates**:
- Step evaluation semantics
- Trace spans per step
- Step status transitions

**Fixture**: SA executes plan with step-level tracing

**Expected Outcome**: All steps traced correctly

#### MAP-02: Broadcast Fanout
**Path**: `tests/golden/flows/map-flow-02-broadcast-fanout/`

**Purpose**: One-to-many agent dispatch

**Validates**:
- Broadcast coordination pattern
- Parallel agent execution
- Result aggregation

**Fixture**: Orchestrator dispatches to Worker? Worker? Worker?

**Expected Outcome**: MAP Profile conformant, broadcast correct

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

## How to Run Tests

### Option 1: TypeScript Harness (Recommended)

```bash

pnpm install


pnpm run test:golden

npx ts-node --transpile-only tests/golden/harness/ts/golden-runner.ts
```

### Option 3: Run Single Flow (Debug)

```bash

npx ts-node --transpile-only tests/golden/harness/ts/golden-runner.ts --flow flow-01


pytest tests/golden/harness/py/test_golden.py::test_flow_01 -v
```

### Step 2: Add Fixture Files

**Required files**:
- `context.json` - Context module fixture
- `plan.json` - Plan module fixture
- `confirm.json` - (Optional) Confirm module fixture
- `trace.json` - Trace module fixture
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

### Step 4: Run& Verify

```bash

npx ts-node tests/golden/harness/ts/golden-runner.ts --flow flow-06


pytest tests/golden/harness/py/test_golden.py::test_flow_06 -v
```

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
4. All tests pass? v1.0 conformant 

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

**For more information**:
- [Golden Suite Overview](golden-test-suite-overview.md)
- [Conformance Guide](../08-guides/conformance-guide.md)
- [Conformance Checklist](../08-guides/conformance-checklist.md)

---

**End of Golden Test Suite Technical Details**

*This document provides comprehensive guidance for running, extending, and troubleshooting the MPLP v1.0 Golden Test Suite.*