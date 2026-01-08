---
sidebar_position: 3

doc_type: reference
normativity: informative
title: Tool Execution Integration
description: Example showing how agents integrate with external tools via MPLP Extension module.
sidebar_label: Tool Execution
status: active
authority: Documentation Governance
canonical: /docs/guides/examples/tool-execution-integration

---



# Tool Execution Integration


**Related Golden Flows**: `flow-03-single-agent-with-tools-single-agent-with-tools`

## 1. Design Philosophy

The `ToolExecutor` abstraction enables MPLP agents to interact with external systems and APIs in a controlled, auditable manner. This design provides:

- **Sandboxing**: Tools run in isolated contexts with clear input/output contracts.
- **Auditability**: All tool invocations are logged as part of the MPLP trace.
- **Flexibility**: Tools can be local functions, HTTP APIs, or even subprocess calls.

## 2. The `ToolExecutor` Interface

**Package**: `@mplp/integration-tools-generic`

The interface standardizes all tool interactions:

```typescript
interface ToolExecutor {
  invoke(invocation: ToolInvocation): Promise<ToolInvocationResult>;
}
```

### 2.1. Invocation Structure

```typescript
interface ToolInvocation {
  toolName: string;                 // Name of the tool to invoke
  payload: Record<string, any>;     // Input parameters for the tool
  context?: {                       // Optional contextual metadata
    traceId?: string;
    userId?: string;
    tags?: string[];
  };
}
```

### 2.2. Result Structure

```typescript
interface ToolInvocationResult {
  success: boolean;                 // Whether the tool executed successfully
  output?: any;                     // The tool's return value
  errorMessage?: string;            // Error description if success=false
  metadata?: {                      // Optional execution metadata
    duration?: number;              // Execution time in ms
    cost?: number;                  // Cost in credits/tokens
  };
}
```

## 3. The `InMemoryToolExecutor` Implementation

The reference implementation maintains a registry of tool handlers in memory.

### 3.1. Basic Usage

```typescript
import { InMemoryToolExecutor } from '@mplp/integration-tools-generic';

const executor = new InMemoryToolExecutor({
  // Define tools as async functions
  "get_weather": async ({ city, country }) => {
    // Simulated API call
    const response = await fetch(`https://api.weather.com/current?city=${city}&country=${country}`);
    const data = await response.json();
    return `Weather in ${city}: ${data.temperature}C, ${data.condition}`;
  },

  "calculate": async ({ expression }) => {
    // Safe math evaluation (in production, use a proper math parser)
    const allowedChars = /^[0-9+\-*/().\s]+$/;
    if (!allowedChars.test(expression)) {
      throw new Error("Invalid expression");
    }
    return eval(expression);
  },

  "send_email": async ({ to, subject, body }) => {
    // Email sending logic
    console.log(`Sending email to ${to}: ${subject}`);
    return { sent: true, messageId: "msg-123" };
  }
});
```

### 3.2. Invoking Tools

```typescript
const result = await executor.invoke({
  toolName: "get_weather",
  payload: { city: "Paris", country: "FR" }
});

if (result.success) {
  console.log("Weather:", result.output);
} else {
  console.error("Error:", result.errorMessage);
}
```

## 4. Advanced Patterns

### 4.1. Tool with Authentication

Inject credentials via closure:

```typescript
const createAuthenticatedTools = (apiKey: string) => {
  return {
    "query_database": async ({ query }) => {
      const response = await fetch("https://api.db.com/query", {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ query })
      });
      return response.json();
    }
  };
};

const executor = new InMemoryToolExecutor(createAuthenticatedTools(process.env.DB_API_KEY));
```

### 4.2. Timeout Protection

Wrap tools with timeout logic:

```typescript
const withTimeout = (fn: Function, timeoutMs: number) => {
  return async (payload: any) => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeoutMs)
    );

    return Promise.race([fn(payload), timeoutPromise]);
  };
};

const executor = new InMemoryToolExecutor({
  "long_running_task": withTimeout(async ({ data }) => {
    // ... potentially slow logic
  }, 30000)  // 30 second timeout
});
```

### 4.3. Rate Limiting

Track and limit tool invocations:

```typescript
class RateLimitedExecutor implements ToolExecutor {
  private callCounts = new Map<string, number>();
  private limits = { "expensive_api": 10 };  // 10 calls per minute

  constructor(private inner: ToolExecutor) {}

  async invoke(invocation: ToolInvocation): Promise<ToolInvocationResult> {
    const count = this.callCounts.get(invocation.toolName) || 0;
    const limit = this.limits[invocation.toolName] || Infinity;

    if (count >= limit) {
      return {
        success: false,
        errorMessage: `Rate limit exceeded for ${invocation.toolName}`
      };
    }

    this.callCounts.set(invocation.toolName, count + 1);
    setTimeout(() => this.callCounts.delete(invocation.toolName), 60000);  // Reset after 1 min

    return this.inner.invoke(invocation);
  }
}
```

## 5. Integration with MPLP Runtime

### 5.1. Using in Module Handlers

Tools are typically invoked from step execution logic:

```typescript
import { TraceModuleHandler } from '@mplp/coordination';
import { ToolExecutor } from '@mplp/integration-tools-generic';

const traceHandler = (toolExecutor: ToolExecutor): TraceModuleHandler => {
  return async (input) => {
    const plan = input.coordination.plan;
    const traceSpans = [];

    for (const step of plan.steps) {
      // Execute step using tools
      const result = await toolExecutor.invoke({
        toolName: step.toolName,  // Assume step defines toolName
        payload: step.parameters
      });

      traceSpans.push({
        span_id: uuidv4(),
        trace_id: input.coordination.trace.trace_id,
        status: result.success  'completed' : 'failed',
        attributes: { output: result.output }
      });
    }

    return {
      trace_id: input.coordination.trace.trace_id,
      status: 'completed',
      spans: traceSpans
    };
  };
};
```

### 5.2. Using with Action Execution Layer (AEL)

The AEL can expose a catalog of tools to the Agent:

```typescript
class ToolAwareAEL implements ActionExecutionLayer {
  constructor(private toolExecutor: ToolExecutor) {}

  async execute(action: Action): Promise<ActionResult> {
    if (action.type === 'use_tool') {
      const result = await this.toolExecutor.invoke({
        toolName: action.toolName,
        payload: action.parameters
      });

      return {
        success: result.success,
        output: result.output,
        error: result.errorMessage
      };
    }
    // ... other action types
  }
}
```

## 6. Tool Discovery & Schema

### 6.1. Defining Tool Schemas

For LLM-based tool selection, define schemas that describe available tools:

```typescript
const toolSchemas = {
  "get_weather": {
    description: "Retrieves current weather for a city",
    parameters: {
      type: "object",
      properties: {
        city: { type: "string", description: "City name" },
        country: { type: "string", description: "2-letter country code" }
      },
      required: ["city"]
    }
  },
  "calculate": {
    description: "Performs mathematical calculations",
    parameters: {
      type: "object",
      properties: {
        expression: { type: "string", description: "Math expression, e.g. '2 + 2'" }
      },
      required: ["expression"]
    }
  }
};
```

### 6.2. LLM Tool Selection

Pass schemas to the LLM for function calling:

```typescript
const prompt = `
You have access to these tools:
${JSON.stringify(toolSchemas, null, 2)}

User request: "${userRequest}"

Select which tool to use and provide the parameters.
`;

const llmResponse = await llmClient.generate({ model: "gpt-4", input: prompt });
const { toolName, parameters } = JSON.parse(llmResponse.output);

const result = await toolExecutor.invoke({ toolName, payload: parameters });
```

## 7. Security Considerations

### 7.1. Input Validation

Always validate tool inputs:

```typescript
const tools = {
  "file_read": async ({ path }) => {
    // Prevent path traversal
    if (path.includes("..") || path.startsWith("/")) {
      throw new Error("Invalid path");
    }
    return fs.readFileSync(`./data/${path}`, 'utf-8');
  }
};
```

### 7.2. Sandboxing

For untrusted code execution, use a sandbox:

```typescript
import { VM } from 'vm2';

const tools = {
  "run_code": async ({ code }) => {
    const vm = new VM({
      timeout: 1000,
      sandbox: { /* limited globals */ }
    });

    return vm.run(code);
  }
};
```

### 7.3. Audit Logging

Log all tool invocations for compliance:

```typescript
class AuditedToolExecutor implements ToolExecutor {
  constructor(private inner: ToolExecutor, private logger: Logger) {}

  async invoke(invocation: ToolInvocation): Promise<ToolInvocationResult> {
    const startTime = Date.now();
    this.logger.info("Tool invoked", { tool: invocation.toolName, payload: invocation.payload });

    const result = await this.inner.invoke(invocation);

    this.logger.info("Tool completed", {
      tool: invocation.toolName,
      success: result.success,
      duration: Date.now() - startTime
    });

    return result;
  }
}
```

## 8. Testing

### 8.1. Mock Tools for Unit Tests

```typescript
const mockExecutor = new InMemoryToolExecutor({
  "get_weather": async () => "Sunny, 22C",
  "send_email": async () => ({ sent: true })
});

// Use in tests
const handler = createTraceHandler(mockExecutor);
```

### 8.2. Integration Tests

```typescript
import { test } from 'vitest';

test('Tool executor handles errors gracefully', async () => {
  const executor = new InMemoryToolExecutor({
    "failing_tool": async () => { throw new Error("Simulated failure"); }
  });

  const result = await executor.invoke({ toolName: "failing_tool", payload: {} });

  expect(result.success).toBe(false);
  expect(result.errorMessage).toContain("Simulated failure");
});
```

## 9. Best Practices

1.  **Explicit Permissions**: Document what each tool can access.
2.  **Idempotency**: Design tools to be idempotent where possible.
3. **Error Handling**: Always return structured errors in `ToolInvocationResult`.
4.  **Resource Cleanup**: Ensure tools release resources (files, connections) after execution.
5.  **Documentation**: Maintain clear schemas for all tools.

## 10. Current Implementation Status

As of P6:
- `ToolExecutor` interface defined
- `InMemoryToolExecutor` implemented
- Basic error handling
-  Rate limiting (manual implementation required)
-  Sandboxing (manual implementation required)
- Tool discovery API (planned for P7)
- Remote tool execution via HTTP (planned for P7)