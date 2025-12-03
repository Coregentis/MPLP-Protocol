---
MPLP Protocol: v1.0.0 — Frozen Specification
Freeze Date: 2025-12-03
Status: FROZEN (no breaking changes permitted)
Governance: MPLP Protocol Governance Committee (MPGC)
Copyright: © 2025 邦士（北京）网络科技有限公司
License: Apache-2.0
Any normative change requires a new protocol version.
---

---
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
**MPLP Protocol 1.0.0 — Frozen Specification**
**Status**: Frozen as of 2025-11-30
**Copyright**: © 2025 邦士（北京）网络科技有限公司
**License**: Apache License 2.0 (see LICENSE at repository root)
**Any normative change requires a new protocol version.**
---

# TypeScript SDK Guide

> **Status**: **Official / Reference Implementation**
> **Package**: `@mplp/sdk-ts`
> **Support**: Full (Schema v2, Validation, Builders)


## 1. Introduction

The TypeScript SDK (`@mplp/sdk-ts`) provides a developer-friendly interface for building MPLP-compliant agents. It wraps the low-level Core Protocol types and Reference Runtime into a fluent API, making it easy to bootstrap agents without manually constructing complex JSON objects.

## 2. Vendor Neutrality

The SDK is designed to be **Vendor Neutral**. It provides:
- **Protocol Types**: Generated from `schemas/v2/`.
- **Validation Logic**: Based on `schemas/v2/invariants/`.
- **Runtime Interfaces**: Abstract definitions for execution.

It does **NOT** include:
- Hardcoded dependencies on specific LLM providers (e.g., OpenAI, Anthropic).
- Proprietary cloud service bindings.

Developers are free to implement the `Executor` interfaces using any backend technology.

## 3. Installation

```bash
pnpm add @mplp/sdk-ts
```

## 4. Core Features

### 4.1. Protocol Object Builders

The SDK provides helper functions to create valid L1 Protocol Objects. These builders handle ID generation, timestamping, and schema validation automatically.

```typescript
import { createContext, createPlan, createConfirm, appendTrace } from '@mplp/sdk-ts';

// 1. Create Context
const context = createContext({
    title: "Data Analysis Task",
    root: { domain: "analytics", environment: "prod" }
});

// 2. Create Plan
const plan = createPlan(context, {
    title: "Analyze Sales Data",
    objective: "Calculate monthly growth",
    steps: [
        { description: "Load CSV data" },
        { description: "Compute metrics" }
    ]
});

// 3. Create Confirm
const confirm = createConfirm(plan, {
    status: "approved"
});

// 4. Create Trace
const trace = appendTrace(context, plan, {
    status: "completed"
});
```

### 4.2. Runtime Client

The `MplpRuntimeClient` simplifies the execution of flows by wrapping the `@mplp/reference-runtime`. It allows you to run a flow by simply providing the options for each stage.

```typescript
import { MplpRuntimeClient } from '@mplp/sdk-ts';

const client = new MplpRuntimeClient();

const result = await client.runSingleAgentFlow({
    contextOptions: {
        title: "My Task",
        root: { domain: "demo", environment: "dev" }
    },
    planOptions: {
        title: "My Plan",
        objective: "Do it",
        steps: [{ description: "Step 1" }]
    },
    confirmOptions: {
        status: "approved"
    },
    traceOptions: {
        status: "completed"
    }
});

if (result.success) {
    console.log("Flow completed!", result.output);
}
```

### 4.3. Customizing Modules

You can inject custom logic (e.g., real LLM calls) by passing a `ModuleRegistry` to the client.

```typescript
import { MplpRuntimeClient } from '@mplp/sdk-ts';

const client = new MplpRuntimeClient({
    modules: {
        plan: async ({ ctx }) => {
            // Custom planning logic (e.g., call OpenAI)
        }
    }
});
```

### 3.4. Event System & Observability

The SDK strictly adheres to the **"3 Physical / 12 Logical"** event strategy defined in MPLP v1.0.

#### Physical Event Types
All emitted events conform to one of 3 physical schemas (plus core):
1. `PipelineStageEvent` (Stage transitions)
2. `GraphUpdateEvent` (PSG mutations)
3. `RuntimeExecutionEvent` (Generic execution logs)

#### Logical Event Families
The SDK provides helper methods to emit the 12 logical event families using these physical types:
- **Pipeline**: `emitStageStart`, `emitStageEnd`
- **Graph**: `emitNodeAdd`, `emitEdgeAdd`
- **Execution**: `emitToolCall`, `emitLlmCall`

```typescript
// Example: Emitting a logical 'ToolExecution' event (Physical: RuntimeExecutionEvent)
client.events.emitToolCall({
    toolName: "calculator",
    input: { expression: "1 + 1" }
});
```
            // ...
            return { output: { plan: myCustomPlan }, events: [] };
        }
    }
});
    }
});
```

### 3.4. Validation

The SDK provides standardized validation functions that return structured error information.

```typescript
import { validateContext } from '@mplp/core-protocol';

const result = validateContext(myContext);

if (!result.ok) {
    console.error("Validation failed:");
    result.errors.forEach(err => {
        console.error(`- [${err.code}] ${err.path}: ${err.message}`);
    });
}
```

## 4. API Reference

### `createContext(options)`
- `options.title`: string
- `options.root`: { domain, environment }
- `options.metadata`: object (optional)

### `createPlan(context, options)`
- `context`: Context object
- `options.title`: string
- `options.objective`: string
- `options.steps`: Array<{ description, ... }>

### `createConfirm(plan, options)`
- `plan`: Plan object
- `options.status`: "approved" | "rejected" | "needs_review"

### `appendTrace(context, plan, options)`
- `context`: Context object
- `plan`: Plan object
- `options.status`: "completed" | "failed" | "in_progress"

## 5. Integration with Reference Runtime

The SDK is built on top of `@mplp/reference-runtime`. It uses the same `RuntimeContext` and `RuntimeResult` types, ensuring full compatibility with the lower-level runtime components.
