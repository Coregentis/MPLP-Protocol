---

doc_type: reference
normativity: informative
status: active
authority: Documentation Governance
description: "Example showing a complete Single Agent (SA) flow using MPLP TypeScript SDK."
title: Single Agent Flow
keywords: [MPLP, Example, Single Agent, SA Profile, TypeScript]
sidebar_label: Single Agent Flow
sidebar_position: 1

---



# Single Agent Flow


This document describes the **Single Agent (SA) Flow** example, which demonstrates a complete, runnable implementation of the MPLP Protocol v1.0.0 using the TypeScript SDK.

## How to Use This Section

| Your Goal | Start Here |
|:---|:---|
| **Run the code** | [Running the Example](#3-running-the-example) |
| **Understand components** | [Key Components](#4-key-components) |
| **See multi-agent** | [Multi-Agent Collab Flow](./multi-agent-collab-flow.md) |
| **Integrate tools** | [Tool Execution Integration](./tool-execution-integration.md) |

## 1. Overview

**Location**: `examples/ts-single-agent-basic/`

**Related Golden Flow**: `flow-01-single-agent-plan`

This example shows:
- Creating a Context with metadata
- Building a Plan with sequential steps
- Executing steps through the runtime
- Generating Trace spans for observability

## 2. Directory Structure

```
examples/ts-single-agent-basic/
├── src/
│   └── index.ts          # Main entry point
├── data/                  # Persisted state output
├── package.json
├── tsconfig.json
└── README.md
```

## 3. Running the Example

### Prerequisites

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm -r build
```

### Execute

```bash
pnpm examples:ts-single-agent
```

Or with debug logging:

```bash
DEBUG=mplp:* pnpm examples:ts-single-agent
```

## 4. Key Components

### 4.1 SDK Import

```typescript
import { 
  createContext, 
  createPlan, 
  addStep,
  createTrace,
  appendSegment
} from '@mplp/sdk-ts';
```

> [!IMPORTANT]
> **API Policy**
> 
> MPLP's canonical SDK surface is **declarative, function-based object creation**. Builders are optional conveniences and must never be required to follow the examples.

### 4.2 Context Creation

```typescript
const context = createContext({
  source: 'user',
  initial_objectives: ['Complete the demo task'],
  constraints: {
    budget_limit_usd: 10.0
  },
  metadata: {
    domain: 'demo',
    environment: 'dev',
    protocol_version: '1.0.0'
  }
});

console.log('Context ID:', context.context_id);
```

### 4.3 Plan Definition

```typescript
const plan = createPlan({
  context_id: context.context_id,
  title: 'Hello World Demo',
  status: 'draft'
});

// Add steps sequentially
addStep(plan, {
  description: 'Initialize environment',
  agent_role: 'executor',
  status: 'pending'
});

addStep(plan, {
  description: 'Execute main task',
  agent_role: 'executor',
  dependencies: [plan.steps[0].step_id],
  status: 'pending'
});

addStep(plan, {
  description: 'Generate report',
  agent_role: 'executor',
  dependencies: [plan.steps[1].step_id],
  status: 'pending'
});

console.log('Plan ID:', plan.plan_id);
console.log('Total Steps:', plan.steps.length);
```

### 4.4 Step Execution

```typescript
// Execute each step
for (const step of plan.steps) {
  step.status = 'running';
  
  // Simulate step execution
  await executeStep(step);
  
  step.status = 'completed';
  step.completed_at = new Date().toISOString();
}

plan.status = 'completed';
```

### 4.5 Trace Recording

```typescript
const trace = createTrace({
  context_id: context.context_id,
  plan_id: plan.plan_id,
  status: 'running'
});

// Record execution segments
for (const step of plan.steps) {
  appendSegment(trace, {
    label: step.description,
    operation: 'step_execution',
    status: 'completed',
    attributes: {
      'mplp.step_id': step.step_id,
      'mplp.agent_role': step.agent_role,
      'mplp.duration_ms': 1500
    }
  });
}

trace.status = 'completed';
console.log('Trace ID:', trace.trace_id);
console.log('Total Segments:', trace.segments.length);
```

## 5. Expected Output

```
Single Agent Flow completed successfully
Context ID: ctx-xxx
Plan Status: completed
Trace ID: trace-xxx
Total Segments: 3
```

## 6. Extending the Example

To turn this into a production application:

1. **Add real LLM integration** using `@mplp/integration-llm-http`
2. **Add tool handlers** for external API calls
3. **Connect to persistent storage** for state management

## 7. Related Documentation

- [TypeScript SDK Guide](/docs/guides/sdk/ts-sdk-guide.md)
- [SA Profile Specification](/docs/specification/profiles/sa-profile.md)
- [Golden Flow Registry](/docs/evaluation/golden-flows/index.mdx)

---

## Optional: Builder Pattern

> [!NOTE]
> Builders are optional conveniences. The canonical API is function-based creation for auditability and stability.

If you prefer the Builder pattern for complex objects, the SDK also provides Builder classes:

```typescript
import { ContextBuilder, PlanBuilder } from '@mplp/sdk-ts';

// Builder pattern (optional)
const context = new ContextBuilder()
  .setSource('user')
  .setObjectives(['Complete the demo task'])
  .setConstraints({ budget_limit_usd: 10.0 })
  .setMetadata({ domain: 'demo' })
  .build();

const plan = new PlanBuilder()
  .setContextId(context.context_id)
  .setTitle('Hello World Demo')
  .addStep({ description: 'Step 1', agent_role: 'executor' })
  .addStep({ description: 'Step 2', agent_role: 'executor' })
  .build();
```

Builders are useful for:
- Template-based object creation
- Progressive construction of complex Plans
- Reusable configuration patterns

---

**API Style**: Function-based (default), Builder (optional)  
**Location**: `examples/ts-single-agent-basic/`