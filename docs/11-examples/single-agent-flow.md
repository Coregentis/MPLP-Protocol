Stage 1: Context Initialized ---
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
---

© 2025 邦士（北京）网络科技有限公司
Licensed under the Apache License, Version 2.0.
