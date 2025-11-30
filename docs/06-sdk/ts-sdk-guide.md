# TypeScript SDK Guide

> **Status**: ✅ **Implemented in Phase P7**

## 1. Introduction

The TypeScript SDK (`@mplp/sdk-ts`) provides a developer-friendly interface for building MPLP-compliant agents. It wraps the low-level Core Protocol types and Reference Runtime into a fluent API, making it easy to bootstrap agents without manually constructing complex JSON objects.

## 2. Installation

```bash
pnpm add @mplp/sdk-ts
```

## 3. Core Features

### 3.1. Protocol Object Builders

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

### 3.2. Runtime Client

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

### 3.3. Customizing Modules

You can inject custom logic (e.g., real LLM calls) by passing a `ModuleRegistry` to the client.

```typescript
import { MplpRuntimeClient } from '@mplp/sdk-ts';

const client = new MplpRuntimeClient({
    modules: {
        plan: async ({ ctx }) => {
            // Custom planning logic (e.g., call OpenAI)
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
