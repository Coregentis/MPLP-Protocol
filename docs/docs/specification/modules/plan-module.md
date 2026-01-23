---
entry_surface: documentation
doc_type: normative
normativity: normative
status: draft
authority: protocol
protocol_version: "1.0.0"
doc_id: "DOC-MOD-PLAN-001"
repo_refs:
  schemas:
    - "schemas/v2/mplp-plan.schema.json"
external_standards:
  w3c_trace_context: none
  opentelemetry: none

# UI metadata (non-normative; excluded from protocol semantics)
title: Plan Module
sidebar_label: Plan Module
sidebar_position: 3
description: "MPLP module specification: Plan Module. Defines schema requirements and invariants."
---

# Plan Module

## Scope

This specification defines the normative schema requirements and lifecycle obligations for the **Plan module** as represented by `schemas/v2/mplp-plan.schema.json`.

## Non-Goals

This specification does not define implementation details, runtime behavior beyond schema-defined obligations, or vendor/framework-specific integrations.

---

## 1. Purpose

The **Plan Module** is the engine of agency. It provides the standard structure for decomposing a high-level `objective` into executable `steps`. A Plan is a **Directed Acyclic Graph (DAG)** where steps can depend on the completion of others.

**Design Principle**: "Structured intent Verifiable execution path"

## 2. Canonical Schema

**From**: `schemas/v2/mplp-plan.schema.json`

### 2.1 Required Fields

| Field | Type | Description |
|:---|:---|:---|
| **`meta`** | Object | Protocol metadata (version, source) |
| **`plan_id`** | UUID v4 | Global unique identifier |
| **`context_id`** | UUID v4 | Link to parent Context |
| **`title`** | String (min 1 char) | Brief plan name |
| **`objective`** | String (min 1 char) | Detailed goal description |
| **`status`** | Enum | Plan lifecycle state |
| **`steps`** | Array (min 1) | List of PlanStep objects |

### 2.2 Optional Fields

| Field | Type | Description |
|:---|:---|:---|
| `trace` | Object | Execution trace reference |
| `events` | Array | Lifecycle events (approvals, status changes) |

### 2.3 The `PlanStep` Object

**Required**: `step_id`, `description`, `status`

| Field | Type | Description |
|:---|:---|:---|
| **`step_id`** | UUID v4 | Unique step identifier |
| **`description`** | String (min 1 char) | Work content |
| **`status`** | Enum | Step execution state |
| `dependencies` | Array[UUID] | Step IDs this step depends on |
| `agent_role` | String | Role responsible (role_id) |
| `order_index` | Integer 0 | Display/execution order |

## 3. Lifecycle State Machine

### 3.1 Plan Status

**From schema**: `["draft", "proposed", "approved", "in_progress", "completed", "cancelled", "failed"]`

<MermaidDiagram id="fe61fa5dc7c27657" />

### 3.2 Step Status

**From schema**: `["pending", "in_progress", "completed", "blocked", "skipped", "failed"]`

<MermaidDiagram id="83fa0e9e559b8ea2" />

### 3.3 Valid Transitions

**Plan Status**:
| From | To | Trigger |
|:---|:---|:---|
| draft | proposed | Agent submits |
| draft | cancelled | User abandons |
| proposed | approved | Confirm.approved=true |
| proposed | draft | Confirm.approved=false |
| approved | in_progress | Runtime starts |
| in_progress | completed | All steps completed |
| in_progress | failed | Critical step failed |
| in_progress | cancelled | User requests |

**Step Status**:
| From | To | Trigger |
|:---|:---|:---|
| pending | in_progress | All dependencies completed |
| pending | blocked | Any dependency failed |
| pending | skipped | Conditional logic |
| in_progress | completed | Execution success |
| in_progress | failed | Execution error |
| blocked | pending | Dependency retry success |

## 4. DAG Dependency Model

### 4.1 Dependency Rules

1. **Acyclic**: No circular dependencies allowed
2. **Referential**: Dependencies MUST reference valid step_id within same Plan
3. **Execution Order**: Step executes only when ALL dependencies are `completed`

### 4.2 DAG Validation

```typescript
function validatePlanDAG(plan: Plan): ValidationResult {
  const stepIds = new Set(plan.steps.map(s => s.step_id));
  const errors: string[] = [];
  
  // Check referential integrity
  for (const step of plan.steps) {
    for (const dep of step.dependencies || []) {
      if (!stepIds.has(dep)) {
        errors.push(`Step ${step.step_id} depends on non-existent ${dep}`);
      }
    }
  }
  
  // Check for cycles (DFS)
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function hasCycle(stepId: string): boolean {
    if (recursionStack.has(stepId)) return true;
    if (visited.has(stepId)) return false;
    
    visited.add(stepId);
    recursionStack.add(stepId);
    
    const step = plan.steps.find(s => s.step_id === stepId);
    for (const dep of step?.dependencies || []) {
      if (hasCycle(dep)) return true;
    }
    
    recursionStack.delete(stepId);
    return false;
  }
  
  for (const step of plan.steps) {
    if (hasCycle(step.step_id)) {
      errors.push('Cyclic dependency detected');
      break;
    }
  }
  
  return { valid: errors.length === 0, errors };
}
```

### 4.3 Example DAG

<MermaidDiagram id="3823eeb044d6f498" />

```json
{
  "steps": [
    { "step_id": "s1", "description": "Analyze Requirements", "dependencies": [] },
    { "step_id": "s2", "description": "Design Architecture", "dependencies": ["s1"] },
    { "step_id": "s3", "description": "Setup Testing", "dependencies": ["s1"] },
    { "step_id": "s4", "description": "Implement Core", "dependencies": ["s2"] },
    { "step_id": "s5", "description": "Integration Test", "dependencies": ["s3", "s4"] }
  ]
}
```

## 5. Normative Requirements

**From**: `schemas/v2/invariants/sa-invariants.yaml`

### 5.1 Core Invariants

| ID | Rule | Description |
|:---|:---|:---|
| `sa_plan_min_steps` | `steps.length >= 1` | Plan MUST have at least one step |
| `sa_plan_context_binding` | `plan.context_id == context.context_id` | Plan bound to loaded Context |
| `sa_plan_step_unique_ids` | All step_id unique | No duplicate step IDs |
| `sa_plan_dag_acyclic` | No cycles | Dependencies form valid DAG |

### 5.2 Execution Invariants

- Plan can only transition to `in_progress` when Context `status == 'active'`
- Step can only be `in_progress` when Plan `status == 'in_progress'`
- Plan is `completed` when ALL steps are `completed` or `skipped`
- Plan is `failed` when ANY critical step is `failed`

## 6. Module Interactions

### 6.1 Dependency Map

<MermaidDiagram id="5cd6cf2e8cb9f239" />

## 7. SDK Examples

### 7.1 TypeScript (Creating Plan)

```typescript
import { v4 as uuidv4 } from 'uuid';

type PlanStatus = 'draft' | 'proposed' | 'approved' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
type StepStatus = 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped' | 'failed';

interface PlanStep {
  step_id: string;
  description: string;
  status: StepStatus;
  dependencies?: string[];
  agent_role?: string;
  order_index?: number;
}

interface Plan {
  meta: { protocolVersion: string };
  plan_id: string;
  context_id: string;
  title: string;
  objective: string;
  status: PlanStatus;
  steps: PlanStep[];
}

function createPlan(
  context_id: string,
  title: string,
  objective: string,
  steps: Omit<PlanStep, 'status'>[]
): Plan {
  return {
    meta: { protocolVersion: '1.0.0' },
    plan_id: uuidv4(),
    context_id,
    title,
    objective,
    status: 'draft',
    steps: steps.map((s, i) => ({
      ...s,
      status: 'pending' as StepStatus,
      order_index: i
    }))
  };
}

// Usage
const plan = createPlan(
  'ctx-123',
  'Fix Login Bug',
  'Investigate and fix 500 error on /login',
  [
    { step_id: 's1', description: 'Read error logs', dependencies: [] },
    { step_id: 's2', description: 'Identify root cause', dependencies: ['s1'] },
    { step_id: 's3', description: 'Write fix', dependencies: ['s2'], agent_role: 'coder' }
  ]
);
```

### 7.2 Python (Pydantic Model)

```python
from pydantic import BaseModel, Field
from uuid import uuid4
from typing import List, Optional
from enum import Enum

class PlanStatus(str, Enum):
    DRAFT = 'draft'
    PROPOSED = 'proposed'
    APPROVED = 'approved'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    FAILED = 'failed'

class StepStatus(str, Enum):
    PENDING = 'pending'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    BLOCKED = 'blocked'
    SKIPPED = 'skipped'
    FAILED = 'failed'

class PlanStep(BaseModel):
    step_id: str = Field(default_factory=lambda: str(uuid4()))
    description: str = Field(..., min_length=1)
    status: StepStatus = StepStatus.PENDING
    dependencies: List[str] = []
    agent_role: Optional[str] = None
    order_index: Optional[int] = None

class Plan(BaseModel):
    plan_id: str = Field(default_factory=lambda: str(uuid4()))
    context_id: str
    title: str = Field(..., min_length=1)
    objective: str = Field(..., min_length=1)
    status: PlanStatus = PlanStatus.DRAFT
    steps: List[PlanStep] = Field(..., min_items=1)

# Usage
plan = Plan(
    context_id='ctx-123',
    title='Fix Login Bug',
    objective='Investigate and fix 500 error on /login',
    steps=[
        PlanStep(step_id='s1', description='Read error logs'),
        PlanStep(step_id='s2', description='Identify root cause', dependencies=['s1'])
    ]
)
```

## 8. Complete JSON Example

```json
{
  "meta": {
    "protocolVersion": "1.0.0",
    "source": "mplp-sdk-ts"
  },
  "plan_id": "plan-550e8400-e29b-41d4-a716-446655440001",
  "context_id": "ctx-550e8400-e29b-41d4-a716-446655440000",
  "title": "Fix Login Bug",
  "objective": "Investigate and fix the 500 error on /login endpoint in production",
  "status": "in_progress",
  "steps": [
    {
      "step_id": "s1",
      "description": "Read server error logs from past 24 hours",
      "status": "completed",
      "dependencies": [],
      "agent_role": "debugger",
      "order_index": 0
    },
    {
      "step_id": "s2",
      "description": "Identify root cause from stack traces",
      "status": "completed",
      "dependencies": ["s1"],
      "agent_role": "debugger",
      "order_index": 1
    },
    {
      "step_id": "s3",
      "description": "Write code patch for null pointer exception",
      "status": "in_progress",
      "dependencies": ["s2"],
      "agent_role": "coder",
      "order_index": 2
    },
    {
      "step_id": "s4",
      "description": "Write unit tests for the fix",
      "status": "pending",
      "dependencies": ["s3"],
      "agent_role": "coder",
      "order_index": 3
    },
    {
      "step_id": "s5",
      "description": "Deploy to staging and verify",
      "status": "pending",
      "dependencies": ["s3", "s4"],
      "agent_role": "devops",
      "order_index": 4
    }
  ],
  "trace": {
    "trace_id": "trace-plan-550e8401"
  }
}
```
**Schemas**:
- `schemas/v2/mplp-plan.schema.json`
- `schemas/v2/invariants/sa-invariants.yaml`

## 9. Related Documents

**Architecture**:
- [L3 Execution & Orchestration](/docs/specification/architecture/l3-execution-orchestration)

**Modules**:
- [Context Module](context-module.md)
- [Trace Module](trace-module.md)
- [Confirm Module](confirm-module.md)

---

**Required Fields**: meta, plan_id, context_id, title, objective, status, steps  
**Plan Status**: draft proposed approved in_progress completed/failed/cancelled  
**Step Status**: pending in_progress completed/failed/blocked/skipped  
**Key Invariant**: steps.length 1, DAG must be acyclic