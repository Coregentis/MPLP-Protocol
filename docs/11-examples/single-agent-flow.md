---
**MPLP Protocol 1.0.0 — Frozen Specification**  
**Status**: Frozen as of 2025-11-30  
**Copyright**: © 2025 邦士（北京）网络科技有限公司  
**License**: Apache License 2.0 (see LICENSE at repository root)  
**Any normative change requires a new protocol version.**
---

# Single Agent Flow: Complete Design & Implementation Guide

**Related Golden Flows**: `FLOW-01`, `SA-01`

## 1. Introduction

The **Single Agent Flow** is the fundamental execution pattern in MPLP. It represents a complete lifecycle from problem definition to execution tracking, orchestrated by a single autonomous agent.

This document provides a comprehensive guide to understanding, implementing, and extending the Single Agent Flow.

## 2. Conceptual Model

### 2.1. The Four-Stage Lifecycle

The flow progresses through four mandatory stages, each producing a distinct Protocol Object:

```
User Request → [Context] → [Plan] → [Confirm] → [Trace] → Results
```

1.  **Context**: Establishes the boundary and requirements.
2.  **Plan**: Decomposes the objective into actionable steps.
3.  **Confirm**: Validates the plan before execution (human-in-the-loop checkpoint).
4.  **Trace**: Records the execution and outcomes.

### 2.2. Protocol Objects

Each stage produces a **L1 Protocol Object** that conforms to the JSON Schemas defined in `schemas/v2/`.

**Context Object Example**:
```json
{
  "meta": {
    "protocol_version": "1.0.0",
    "schema_version": "1.0.0",
    "created_at": "2025-11-29T10:00:00Z"
  },
  "context_id": "550e8400-e29b-41d4-a716-446655440000",
  "root": {
    "domain": "customer-support",
    "environment": "production"
  },
  "title": "Process Refund Request",
  "status": "active"
}
```

**Plan Object Example**:
```json
{
  "meta": {
    "protocol_version": "1.0.0",
    "schema_version": "1.0.0",
    "created_at": "2025-11-29T10:01:00Z"
  },
  "plan_id": "550e8400-e29b-41d4-a716-446655440001",
  "context_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Refund Processing Plan",
  "objective": "Verify eligibility and issue refund",
  "status": "proposed",
  "steps": [
    {
      "step_id": "550e8400-e29b-41d4-a716-446655440100",
      "description": "Check if order is within refund window",
      "status": "pending",
      "agent_role": "agent"
    },
    {
      "step_id": "550e8400-e29b-41d4-a716-446655440101",
      "description": "Calculate refund amount",
      "status": "pending",
      "agent_role": "agent"
    }
  ]
}
```

**Confirm Object Example**:
```json
{
  "meta": {
    "protocol_version": "1.0.0",
    "schema_version": "1.0.0",
    "created_at": "2025-11-29T10:05:00Z"
  },
  "confirm_id": "550e8400-e29b-41d4-a716-446655440002",
  "target_type": "plan",
  "target_id": "550e8400-e29b-41d4-a716-446655440001",
  "requested_by_role": "assistant",
  "requested_at": "2025-11-29T10:05:00Z",
  "status": "approved",
  "decisions": [
      {
          "decision_id": "dec-001",
          "approver_role": "user",
          "outcome": "approved",
          "timestamp": "2025-11-29T10:06:00Z"
      }
  ]
}
```

**Trace Object Example**:
```json
{
  "meta": {
    "protocol_version": "1.0.0",
    "schema_version": "1.0.0",
    "created_at": "2025-11-29T10:10:00Z"
  },
  "trace_id": "550e8400-e29b-41d4-a716-446655440003",
  "context_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "events": [
      {
          "id": "evt-001",
          "type": "SAInitialized",
          "timestamp": "2025-11-29T10:10:01Z",
          "data": { "context_id": "550e8400-e29b-41d4-a716-446655440000" }
      }
  ]
}
}
```

## 3. Reference Implementation

### 3.1. Architecture

The Reference Runtime (`@mplp/reference-runtime`) implements this flow via the `runSingleAgentFlow` orchestrator.

**Component Diagram**:
```
┌─────────────────────────────────────┐
│   User Application / CLI            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  SingleAgentOrchestrator             │
│  - Drives the 4-stage lifecycle      │
│  - Emits events at each transition   │
└──────┬──────────────────────────────┘
       │
       ├──► [Module: Context Handler]
       ├──► [Module: Plan Handler]
       ├──► [Module: Confirm Handler]
       └──► [Module: Trace Handler]
               │
               ▼
┌─────────────────────────────────────┐
│  Value State Layer (VSL)             │
│  - Persists Protocol Objects         │
│  - Appends Events to log             │
└─────────────────────────────────────┘
```

### 3.2. Execution Sequence

1.  **Initialization**:
    - A `RuntimeContext` is created with a unique `runId`.
    - The initial `Context` object is provided by the user or a default template.

2.  **Stage 1: Context**:
    - The Context handler validates the input.
    - The Context object is stored in the VSL.
    - Event `context.initialized` is emitted.

3.  **Stage 2: Plan**:
    - The Plan handler (possibly an LLM) generates a decomposed plan.
    - The Plan object is validated against the schema.
    - Event `plan.created` is emitted.

4.  **Stage 3: Confirm**:
    - The Confirm handler requests approval (could be automatic or user-prompted).
    - If approved, the Confirm object has `status: "approved"`.
    - Event `confirm.approved` is emitted.

5.  **Stage 4: Trace**:
    - The Trace handler initializes the execution trace.
    - As each step executes, trace spans are added.
    - Event `trace.finalized` is emitted when all steps complete.

6.  **Result**:
    - A `RuntimeResult` object is returned with:
      - `success: true/false`
      - `output`: The final results from the trace.
      - `context`: The `RuntimeContext` containing all state.

### 3.3. Code Example

**File**: `examples/ts-single-agent-basic/src/index.ts`

```typescript
import { RuntimeContext } from '@mplp/reference-runtime';
import { runSingleAgentFlow } from '@mplp/reference-runtime';
import { Context } from '@mplp/core-protocol';

async function main() {
  // Step 1: Define the initial Context
  const initialContext: Context = {
    meta: {
      protocol_version: "1.0.0",
      schema_version: "1.0.0",
      created_at: new Date().toISOString()
    },
    context_id: uuidv4(),
    root: { domain: "demo", environment: "dev" },
    title: "My First MPLP Task",
    status: "active"
  };

  // Step 2: Initialize the Runtime
  const runtimeContext = new RuntimeContext(uuidv4());
  
  // Step 3: Execute the flow
  const result = await runSingleAgentFlow({
    context: runtimeContext,
    initialInput: initialContext,
    modules: createStubModules(),  // In production, use real LLM handlers
    vsl: new InMemoryVSL()
  });

  // Step 4: Check results
  if (result.success) {
    console.log("✅ Flow completed successfully!");
    console.log("Plan ID:", result.context.coordination.plan?.plan_id);
  } else {
    console.error("❌ Flow failed:", result.error);
  }
}
```

## 4. Running the Example

### 4.1. Prerequisites

- Node.js v18+
- pnpm v8+

### 4.2. Installation

From the repository root:

```bash
pnpm install
pnpm -r build
```

### 4.3. Execution

```bash
pnpm examples:ts-single-agent
```

### 4.4. Expected Output

```text
Starting Single Agent Basic Example...
[2025-11-29T10:00:00.000Z] Info: Storage initialized
[2025-11-29T10:00:01.234Z] Info: Flow started with Run ID: abc-123

--- Stage 1: Context Initialized ---
Context ID: 550e8400-e29b-41d4-a716-446655440000
Domain:     demo

--- Stage 2: Plan Generated ---
Plan ID:    550e8400-e29b-41d4-a716-446655440001
Steps:      2

--- Stage 3: Plan Confirmed ---
Confirm ID: 550e8400-e29b-41d4-a716-446655440002
Status:     approved

--- Stage 4: Trace Started ---
Trace ID:   550e8400-e29b-41d4-a716-446655440003
Spans:      3

✅ Flow succeeded!
Total Events Emitted: 12
```

### 4.5. Output Files

The example writes state snapshots to `examples/ts-single-agent-basic/data/`:

- `startup-log.json`: Initial runtime configuration.
- `context-snapshot.json`: The Context object.
- `plan-snapshot.json`: The Plan object.
- `trace-snapshot.json`: The Trace object.

### 4.6. Using @mplp/sdk-ts to Simplify Bootstrap

Instead of manually constructing the `RuntimeContext` and `ModuleRegistry` as shown above, you can use the `@mplp/sdk-ts` package for a more concise setup.

```typescript
import { MplpRuntimeClient } from '@mplp/sdk-ts';

const client = new MplpRuntimeClient();

// Run the flow declaratively
const result = await client.runSingleAgentFlow({
    contextOptions: {
        title: "My First MPLP Task",
        root: { domain: "demo", environment: "dev" }
    },
    planOptions: {
        title: "Generated Plan",
        objective: "Execute task",
        steps: [{ description: "Step 1" }]
    },
    confirmOptions: { status: "approved" },
    traceOptions: { status: "completed" }
});
```

## 5. Extension Patterns

### 5.1. Custom Module Handlers

To replace the stub handlers with real LLM-powered logic:

```typescript
import { PlanModuleHandler } from '@mplp/coordination';
import { HttpLlmClient } from '@mplp/integration-llm-http';

const llm = new HttpLlmClient({
  baseUrl: "https://api.openai.com/v1/chat/completions",
  defaultHeaders: { "Authorization": "Bearer YOUR_KEY" }
}, fetch);

const planHandler: PlanModuleHandler = async (input) => {
  const prompt = `Generate a plan to: ${input.context.title}`;
  const response = await llm.generate({ model: "gpt-4", input: prompt });
  
  // Parse LLM response into Plan object
  return parsePlanFromLLM(response.output);
};
```

### 5.2. Database-Backed VSL

To persist state to a database:

```typescript
import { PostgresVSL } from '@mplp/integration-storage-postgres';

const vsl = new PostgresVSL({
  connectionString: process.env.DATABASE_URL
});
```

### 5.3. Human-in-the-Loop Confirm

To prompt the user for approval:

```typescript
const confirmHandler: ConfirmModuleHandler = async (input) => {
  const plan = input.coordination.plan;
  
  console.log("Plan to approve:");
  console.log(JSON.stringify(plan, null, 2));
  
  const answer = await prompt("Approve? (yes/no): ");
  
  return {
    confirm_id: uuidv4(),
    target_type: "plan",
    target_id: plan.plan_id,
    status: answer === "yes" ? "approved" : "rejected"
  };
};
```

## 6. Testing & Validation

### 6.1. Unit Tests

Each module handler should be tested in isolation:

```typescript
import { test } from 'vitest';

test('Plan handler generates valid plan', async () => {
  const input = { context: mockContext };
  const result = await planHandler(input);
  
  expect(validatePlan(result).ok).toBe(true);
  expect(result.steps.length).toBeGreaterThan(0);
});
```

### 6.2. Integration Tests

Test the full flow end-to-end:

```bash
pnpm test:integration
```

### 6.4. End-to-End Validation with TypeScript & Python SDKs

The Single Agent Flow is rigorously tested for cross-language compatibility. The runtime output is verified to be:
1.  **Valid** according to both TypeScript and Python SDK validators.
2.  **Equivalent** in structure across both languages (when serialized to JSON).

This ensures that any agent built with the TypeScript runtime can be seamlessly consumed by Python-based tools or services.

## 7. Troubleshooting

### Common Issues

1.  **Validation Errors**: Ensure all IDs are valid UUIDv4 format.
2.  **Missing Dependencies**: Run `pnpm install` and `pnpm -r build`.
3.  **Storage Permissions**: Ensure the `data/` directory is writable.

### Debug Mode

Set the `DEBUG` environment variable for verbose logging:

```bash
DEBUG=mplp:* pnpm examples:ts-single-agent
```
