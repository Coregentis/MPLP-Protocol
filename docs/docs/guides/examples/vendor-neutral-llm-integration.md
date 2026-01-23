---
sidebar_position: 2

doc_type: reference
normativity: informative
title: Vendor-Neutral LLM Integration
description: Example demonstrating vendor-neutral LLM integration through MPLP abstractions.
sidebar_label: Vendor-Neutral LLM
status: active
authority: Documentation Governance
canonical: /docs/guides/examples/vendor-neutral-llm-integration

---



# Vendor-Neutral LLM Integration


**Related Golden Flows**: `flow-04-single-agent-llm-enrichment-single-agent-llm-enrichment`

## 1. Design Philosophy

MPLP achieves **vendor neutrality** by defining an abstract `LlmClient` interface that isolates the protocol logic from specific LLM provider APIs. This design ensures:

- **Portability**: The same agent code runs with OpenAI, Anthropic, local Llama models, or any OpenAI-compatible API.
- **Testability**: Mock LLM clients can be injected for testing without external dependencies.
- **Cost Control**: Easy to switch providers based on cost, latency, or feature requirements.

## 2. The `LlmClient` Interface

**Package**: `@mplp/integration-llm-http`

The interface abstracts all LLM interactions to a single method:

```typescript
interface LlmClient {
  generate(request: LlmGenerationRequest): Promise<LlmGenerationResult>;
}
```

### 2.1. Request Structure

```typescript
interface LlmGenerationRequest {
  model: string;                    // e.g., "gpt-4", "claude-3-opus", "llama-3-70b"
  input: string;                    // The prompt text
  temperature?: number;             // Sampling temperature (0.0 - 1.0)
  maxTokens?: number;               // Maximum tokens to generate
  stopSequences?: string[];         // Stop generation at these sequences
  additionalParams?: Record<string, any>;  // Provider-specific parameters
}
```

### 2.2. Result Structure

```typescript
interface LlmGenerationResult {
  output: string;                   // The generated text
  finishReason: 'stop' | 'length' | 'error';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  raw?: any;                        // Provider-specific raw response (for debugging)
}
```

## 3. The `HttpLlmClient` Implementation

The `HttpLlmClient` is a reference implementation that works with any OpenAI-compatible HTTP endpoint.

### 3.1. Configuration

```typescript
import { HttpLlmClient } from '@mplp/integration-llm-http';

const client = new HttpLlmClient({
  baseUrl: "https://api.openai.com/v1/chat/completions",
  defaultHeaders: {
    "Authorization": "Bearer sk-...",
    "Content-Type": "application/json"
  },
  timeout: 30000  // 30 seconds
}, fetch);
```

### 3.2. Usage Example

```typescript
const request: LlmGenerationRequest = {
  model: "gpt-4",
  input: "Explain quantum computing in simple terms.",
  temperature: 0.7,
  maxTokens: 200
};

const result = await client.generate(request);
console.log(result.output);
```

### 3.3. Provider-Specific Configurations

#### OpenAI

```typescript
const openai = new HttpLlmClient({
  baseUrl: "https://api.openai.com/v1/chat/completions",
  defaultHeaders: { "Authorization": "Bearer YOUR_API_KEY" }
}, fetch);
```

#### Anthropic Claude

```typescript
const anthropic = new HttpLlmClient({
  baseUrl: "https://api.anthropic.com/v1/messages",
  defaultHeaders: {
    "x-api-key": "YOUR_API_KEY",
    "anthropic-version": "2023-06-01"
  }
}, fetch);
```

#### Local Llama (via llama.cpp server)

```typescript
const llama = new HttpLlmClient({
  baseUrl: "http://localhost:8080/v1/chat/completions",
  defaultHeaders: {}
}, fetch);
```

#### Azure OpenAI

```typescript
const azure = new HttpLlmClient({
  baseUrl: "https://YOUR_RESOURCE.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT/chat/completions?api-version=2023-05-15",
  defaultHeaders: { "api-key": "YOUR_AZURE_KEY" }
}, fetch);
```

## 4. Integration with MPLP Runtime

### 4.1. Injecting into Module Handlers

The LLM client is typically injected into the **Plan Module Handler** or other reasoning modules:

```typescript
import { PlanModuleHandler } from '@mplp/coordination';
import { HttpLlmClient } from '@mplp/integration-llm-http';

const llmClient = new HttpLlmClient({ /* config */ }, fetch);

const planHandler: PlanModuleHandler = async (input) => {
  const context = input.coordination.context;

  // Construct prompt from the context
  const prompt = `
    Create a detailed plan to accomplish the following objective:
    Title: ${context.title}
    Domain: ${context.root.domain}

    Respond with a JSON array of steps.
  `;

  const result = await llmClient.generate({
    model: "gpt-4",
    input: prompt,
    temperature: 0.3
  });

  const stepsJson = JSON.parse(result.output);

  return {
    meta: { protocol_version: "1.0.0", schema_version: "1.0.0", created_at: new Date().toISOString() },
    plan_id: uuidv4(),
    context_id: context.context_id,
    title: `Plan for ${context.title}`,
    objective: context.title,
    status: "proposed",
    steps: stepsJson.map((s: any) => ({
      step_id: uuidv4(),
      description: s.description,
      status: "pending"
    }))
  };
};
```

### 4.2. Using with Action Execution Layer (AEL)

The AEL can also use the LLM client for tool use planning or code generation:

```typescript
class LlmPoweredAEL implements ActionExecutionLayer {
  constructor(private llm: LlmClient) {}

  async execute(action: Action): Promise<ActionResult> {
    if (action.type === 'generate_code') {
      const result = await this.llm.generate({
        model: "gpt-4",
        input: `Generate Python code to: ${action.description}`
      });

      return { success: true, output: result.output };
    }
    // ... other action types
  }
}
```

## 5. Error Handling & Retries

### 5.1. Built-in Error Types

The `HttpLlmClient` throws typed errors:

```typescript
try {
  const result = await client.generate(request);
} catch (error) {
  if (error instanceof LlmRateLimitError) {
    // Wait and retry
    await sleep(60000);
  } else if (error instanceof LlmAuthenticationError) {
    // Invalid API key
    console.error("Authentication failed");
  } else if (error instanceof LlmTimeoutError) {
    // Request took too long
  }
}
```

### 5.2. Retry Strategy

Implement exponential backoff for rate limits:

```typescript
async function generateWithRetry(client: LlmClient, request: LlmGenerationRequest, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await client.generate(request);
    } catch (error) {
      if (error instanceof LlmRateLimitError && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;  // 1s, 2s, 4s
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }
}
```

## 6. Testing

### 6.1. Mock Client for Unit Tests

```typescript
class MockLlmClient implements LlmClient {
  async generate(request: LlmGenerationRequest): Promise<LlmGenerationResult> {
    return {
      output: "Mock response",
      finishReason: 'stop',
      usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 }
    };
  }
}

// In tests
const mockClient = new MockLlmClient();
const handler = createPlanHandler(mockClient);
```

## 7. Cost Tracking

Track token usage across all LLM calls:

```typescript
class TokenTracker {
  private totalTokens = 0;

  wrap(client: LlmClient): LlmClient {
    return {
      generate: async (req) => {
        const result = await client.generate(req);
        this.totalTokens += result.usage?.totalTokens || 0;
        return result;
      }
    };
  }

  getTotal() { return this.totalTokens; }
}
```

## 8. Best Practices

1.  **Use Environment Variables**: Store API keys in `.env` files, never hardcode.
2.  **Set Timeouts**: Always configure reasonable timeouts to prevent hanging.
3.  **Log Requests**: Log prompts and responses for debugging and audit trails.
4.  **Validate Outputs**: Always validate LLM JSON outputs before using them as Protocol Objects.
5.  **Fallback Models**: If primary model fails, fallback to a cheaper/smaller model.

## 9. Current Implementation Status

As of P6:
- `LlmClient` interface defined
- `HttpLlmClient` implemented- Basic error handling
-  Advanced retry logic (manual implementation required)
-  Cost tracking (manual implementation required)
- WebSocket streaming support (planned for P7)