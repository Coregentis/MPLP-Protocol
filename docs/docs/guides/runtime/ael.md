---
sidebar_position: 3

doc_type: normative
normativity: normative
status: draft
authority: MPGC
description: "Action Execution Layer (AEL) reference for runtime implementers."
title: AEL - Action Execution Layer

---


# AEL - Action Execution Layer


## 1. Scope

This specification defines the normative requirements for **AEL – Action Execution Layer**.

## 2. Non-Goals

This specification does not mandate specific implementation details beyond the defined interfaces and invariants.

## 3. Purpose

The **Action Execution Layer (AEL)** is the "CPU" of the MPLP runtime – the abstraction that executes all side-effects and external interactions. AEL provides a clean interface between the pure protocol logic (L1/L2) and the messy real world (LLM APIs, tools, files, networks).

**Key Responsibilities**:
- Execute LLM API calls (OpenAI, Anthropic, local models)
- Invoke external tools (linters, formatters, test runners)
- Manage agent handoffs (MAP Profile)
- Enforce security boundaries (sandboxing, permissions)
- Emit observability events for all executions

**Design Principle**: "Actions are first-class citizens with isolation, observability, and control"

## 4. Normative Interface

### 4.1 Core Interface

**From**: `packages/sdk-ts/src/runtime-minimal/index.ts` (lines 29-31)

```typescript
export interface ActionExecutionLayer {
  execute(action: any): Promise<any>;
}
```

**Simple yet powerful**: Single `execute()` method handles all action types

### 4.2 Reference Implementation

**InMemoryAEL** (`runtime-minimal/index.ts` lines 39-41):

```typescript
export class InMemoryAEL implements ActionExecutionLayer {
  async execute(action: any) { 
    return { status: 'executed', action }; 
  }
}
```

**Purpose**: Minimal implementation for testing/prototyping

### 4.3 Production Interface (Extended)

```typescript
export interface ActionExecutionLayerExtended extends ActionExecutionLayer {
  // Core execution
  execute(action: Action): Promise<ActionResult>;
  
  // Lifecycle hooks
  beforeExecute?(action: Action): Promise<void>;
  afterExecute?(action: Action, result: ActionResult): Promise<void>;
  onError?(action: Action, error: Error): Promise<void>;
  
  // Resource management
  setResourceLimits?(limits: ResourceLimits): void;
  getCurrentUsage?(): Promise<ResourceUsage>;
  
  // Observability
  getExecutionMetrics?(): Promise<ExecutionMetrics>;
}

interface Action {
  action_id: string;       // UUID v4
  action_type: string;     // 'llm_call' | 'tool_call' | 'agent_handoff'
  executor_kind: string;   // 'llm' | 'tool' | 'agent' |'worker' | 'external'
  params: Record<string, any>;
  timeout_ms?: number;
  retry_policy?: RetryPolicy;
}

interface ActionResult {
  action_id: string;
  status: 'completed' | 'failed' | 'cancelled';
  output?: any;
  error?: Error;
  duration_ms: number;
  token_usage?: { prompt: number; completion: number; total: number };
}
```

## 5. Action Types

### 5.1 LLM Call

**Example**:
```typescript
const action: Action = {
  action_id: "550e8400-e29b-41d4-a716-446655440000",
  action_type: "llm_call",
  executor_kind: "llm",
  params: {
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Write a function to reverse a string." }
    ],
    temperature: 0.7,
    max_tokens: 500
  },
  timeout_ms: 30000
};

const result = await ael.execute(action);
```

**Result**:
```json
{
  "action_id": "550e8400-...",
  "status": "completed",
  "output": {
    "content": "def reverse_string(s): return s[::-1]",
    "finish_reason": "stop"
  },
  "duration_ms": 2340,
  "token_usage": { "prompt": 25, "completion": 15, "total": 40 }
}
```

### 5.2 Tool Call

**Example**:
```typescript
const action: Action = {
  action_id: "123e4567-...",
  action_type: "tool_call",
  executor_kind: "tool",
  params: {
    tool_name: "eslint",
    tool_args: {
      file_paths: ["src/index.ts"],
      config: ".eslintrc.json"
    }
  },
  timeout_ms: 10000
};

const result = await ael.execute(action);
```

**Result**:
```json
{
  "action_id": "123e4567-...",
  "status": "completed",
  "output": {
    "exit_code": 0,
    "stdout": "?No problems found",
    "issues_found": 0
  },
  "duration_ms": 1250
}
```

### 5.3 Agent Handoff (MAP Profile)

**Example**:
```typescript
const action: Action = {
  action_id: "789abc...",
  action_type: "agent_handoff",
  executor_kind: "agent",
  params: {
    from_role: "architect",
    to_role: "coder",
    handoff_data: {
      plan_id: "plan-123",
      step_id: "step-456",
      instructions: "Implement the design from step 1"
    }
  }
};
```

## 6. Normative Requirements (MUST/SHALL)

### 6.1 Action Interception

**Requirement**: The AEL **MUST** intercept ALL requests for external execution

**Rationale**: Prevents bypass of security/observability controls

**Implementation**:
```typescript
class SecureAEL implements ActionExecutionLayer {
  async execute(action: Action): Promise<ActionResult> {
      event_type: 'execution_started',
      action_id: action.action_id,
      executor_kind: action.executor_kind
    });
    
    // 4. Execute
    const result = await this.executeInternal(action);
    
    // 5. Emit completion event
    await this.emit({
      event_family: 'runtime_execution',
      event_type: 'execution_completed',
      action_id: action.action_id,
      status: result.status,
      duration_ms: result.duration_ms
    });
    
    return result;
  }
}
```

### 6.2 Schema Validation

**Requirement**: The AEL **MUST** validate the `Action` payload against schema before execution

**Why**: Prevent type errors, malformed requests that crash tools/LLMs

### 6.3 Event Emission (REQUIRED)

**Requirement**: The AEL **MUST** emit a `RuntimeExecutionEvent` for every execution attempt (start AND finish)

**From**: `schemas/v2/invariants/observability-invariants.yaml` (lines 72-92)

**Events Required**:
1. **execution_started**: When action begins
2. **execution_completed** OR **execution_failed**: When action finishes

**Event Schema** (from `mplp-runtime-execution-event.schema.json`):
```json
{
  "event_id": "uuid-v4",
  "event_family": "runtime_execution",
  "event_type": "execution_started" | "execution_completed" | "execution_failed",
  "timestamp": "ISO-8601",
  "execution_id": "uuid-v4",
  "executor_kind": "llm" | "tool" | "agent" | "worker" | "external",
  "status": "pending" | "running" | "completed" | "failed" | "cancelled",
  "payload": { action details }
}
```

### 6.4 Rate Limiting & Timeouts

**Requirement**: The AEL **SHALL** enforce configured rate limits and timeouts

**Example**:
```typescript
class RateLimitedAEL implements ActionExecutionLayer {
  private rateLimiter: RateLimiter;
  
  constructor() {
    this.rateLimiter = new RateLimiter({
      maxRequestsPerSecond: 10,
      maxRequestsPerMinute: 500
    });
  }
  
  async execute(action: Action): Promise<ActionResult> {
    // Check rate limit
    if (!this.rateLimiter.allow(action.executor_kind)) {
      throw new Error("Rate limit exceeded");
    }
    
    // Set timeout
    const timeout = action.timeout_ms || 30000;
    return Promise.race([
      this.executeInternal(action),
      this.createTimeout(timeout, action.action_id)
    ]);
  }
}
```

### 6.5 Security Isolation

**Requirement**: The AEL **MUST NOT** expose internal runtime state (credentials, raw PSG) to the executing tool unless explicitly authorized

**Bad Example** 
```typescript
// INSECURE: Exposes all PSG data to tool
const result = await tool.execute({
  psg: runtime.psg,  // Full PSG access
  api_key: process.env.API_KEY  // Credentials exposed
});
```

**Good Example** 
```typescript
// SECURE: Provides scoped data only
const result = await tool.execute({
  context_id: action.params.context_id,  // Scoped to specific context
  role_permissions: await getRolePermissions(action.role_id),  // Filtered
  // No credentials, no full PSG access
});
```

### 6.6 Result Normalization

**Requirement**: The AEL **MUST** capture and normalize execution results (success/failure, output, metadata)

**Why**: Different tools return data in different formats; AEL normalizes to consistent `ActionResult`

### 6.7 Sandboxing (SHOULD)

**Requirement**: The AEL **SHOULD** implement sandboxing for untrusted code execution

**Options**:
1. **Docker Containers** (strong isolation)
2. **VM Sandboxes** (vm2 for Node.js)
3. **WebAssembly** (emerging standard)

**Example** (Docker):
```typescript
class DockerAEL implements ActionExecutionLayer {
  async execute(action: Action): Promise<ActionResult> {
    const containerId = await docker.run({
      image: 'mplp/sandbox:latest',
      cmd: ['execute-tool', action.params.tool_name],
      limits: {
        cpus: 1,
        memory: '512m',
        network: 'none'  // No network access
      },
      timeout: action.timeout_ms
    });
    
    const result = await docker.logs(containerId);
    await docker.remove(containerId);
    return parseResult(result);
  }
}
```

### 6.8 Trace Propagation

**Requirement**: The AEL **MUST** propagate the `trace_id` to the external system if supported

**Why**: Enable distributed tracing across MPLP runtime + external tools/LLMs

**Example** (OpenAI):
```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [...],
  headers: {
    'X-Trace-ID': action.trace_id,  // Propagate trace context
    'X-Span-ID': action.action_id
  }
});
```

## 7. Cross-Module Bindings

| Module | Relationship | Direction | Example |
|:---|:---|:---|:---|
| **Plan Module** | Generates `Action` objects | Plan AEL | Plan step specifies `tool_call` action |
| **Trace Module** | Records `RuntimeExecutionEvent` | AEL Trace | AEL emits events, Trace stores |
| **Extension Module** | Defines `Tool` definitions | Extension AEL | AEL looks up tool schema from Extension registry |
| **Role Module** | Defines permissions | Role AEL | AEL checks role capabilities before execution |

**Example Flow**:
```
Plan Module creates action:
  { action_type: 'tool_call', tool_name: 'eslint', ... } 
AEL validates action schema (L1)
AEL checks permissions (Role Module)
AEL executes tool (via L4 adapter)
AEL emits RuntimeExecutionEvent 
Trace Module captures event
```

## 8. Observability Invariants

From `schemas/v2/invariants/observability-invariants.yaml`:

| Invariant ID | Rule | Description |
|:---|:---|:---|
| `obs_runtime_event_has_execution_id` | uuid-v4 | Every execution MUST have UUID v4 ID |
| `obs_runtime_executor_kind_valid` | enum(agent, tool, llm, worker, external) | Executor kind MUST be valid enum |
| `obs_runtime_status_valid` | enum(pending, running, completed, failed, cancelled) | Status transitions MUST follow lifecycle |

## 9. PSG Bindings

### 9.1 Write Operations

**MUST write to**: `psg.execution_traces` (via Trace module logic or direct event append)

**Example**:
```typescript
await psg.append('execution_traces', {
  trace_id: context.trace_id,
  span_id: action.action_id,
  parent_span_id: context.current_span_id,
  name: `execute:${action.action_type}`,
  start_time: startTime.toISOString(),
  end_time: endTime.toISOString(),
  status: result.status,
  attributes: {
    executor_kind: action.executor_kind,
    duration_ms: result.duration_ms,
    token_usage: result.token_usage
  }
});
```

### 9.2 Read Operations

**MUST read from**:
1. `psg.agent_roles` (for permission checks)
2. `psg.constraints` (for budget/timeout checks)

**Example**:
```typescript
const role = await psg.getNode('Role', action.role_id);
if (!role.capabilities.includes('llm.gpt4')) {
  throw new Error('Role does not have gpt-4 permission');
}

const constraints = await psg.getNode('Constraints', context.context_id);
if (constraints.max_tokens_per_hour < estimatedTokens) {
  throw new Error('Token budget exceeded');
}
```

## 10. Governance Considerations

### 10.1 Security

**Critical**: AEL is the **primary security boundary** for the agent. Vulnerabilities here compromise the host.

**Threat Model**:
1. **Malicious Tools**: Untrusted tools execute arbitrary code
2. **Prompt Injection**: LLMs tricked into executing unauthorized actions
3. **Credential Leakage**: API keys exposed to tools
4. **Resource Exhaustion**: Infinite loops, memory bombs

**Mitigations**:
- Sandboxing (Docker, vm2, WASM)
- Permission checks before execution
- Resource limits (CPU, memory, timeout)
- Audit logging (all executions tracked)

### 10.2 Determinism

**Requirement**: AEL implementations **SHOULD** strive for determinism where possible

**Challenges**:
- LLMs are non-deterministic by nature
- External tools depend on system state

**Best Practices**:
- Use fixed seeds for LLMs when available (`seed` parameter in OpenAI)
- Cache deterministic tool results
- Document non-deterministic behaviors

## 11. Implementation Patterns

### 11.1 Adapter Pattern

**Problem**: Different tools/LLMs have different APIs

**Solution**: Adapter wraps external API, presents uniform `Action` interface

```typescript
interface LLMAdapter {
  execute(action: Action): Promise<ActionResult>;
}

class OpenAIAdapter implements LLMAdapter {
  async execute(action: Action): Promise<ActionResult> {
    const response = await openai.chat.completions.create({
      model: action.params.model,
      messages: action.params.messages,
      temperature: action.params.temperature
    });
    
    return {
      action_id: action.action_id,
      status: 'completed',
      output: response.choices[0].message,
      token_usage: response.usage
    };
  }
}

class AnthropicAdapter implements LLMAdapter {
  async execute(action: Action): Promise<ActionResult> {
    const response = await anthropic.messages.create({
      model: action.params.model,
      messages: action.params.messages
    });
    
    return {
      action_id: action.action_id,
      status: 'completed',
      output: response.content[0],
      token_usage: {  // Anthropic format differs
        prompt: response.usage.input_tokens,
        completion: response.usage.output_tokens
      }
    };
  }
}
```

### 11.2 Retry Logic

```typescript
class RetryableAEL implements ActionExecutionLayer {
  async execute(action: Action): Promise<ActionResult> {
    const policy = action.retry_policy || {
      max_retries: 3,
      backoff_ms: [1000, 2000, 4000]
    };
    
    for (let attempt = 0; attempt <= policy.max_retries; attempt++) {
      try {
        return await this.executeInternal(action);
      } catch (error) {
        if (attempt === policy.max_retries) throw error;
        if (!this.isRetryable(error)) throw error;
        
        await this.sleep(policy.backoff_ms[attempt]);
      }
    }
  }
  
  private isRetryable(error: Error): boolean {
    // Retry on transient errors only
    return error.message.includes('rate limit') ||
           error.message.includes('timeout') ||
           error.message.includes('503');
  }
}
```

## 12. Related Documents

**Architecture**:
- [L3 Execution & Orchestration](/docs/specification/architecture)
- [L1-L4 Deep Dive](/docs/specification/architecture)

**Runtime Components**:
- [VSL (Value State Layer)](vsl.md)
- [PSG (Project Semantic Graph)](psg.md)

**Kernel Duties**:
- [Observability](/docs/specification/observability/observability-overview.md)
- [Security](/docs/specification/architecture/cross-cutting-kernel-duties)

**Invariants**:
- `schemas/v2/invariants/observability-invariants.yaml` (lines 72-92)

**Reference Implementation**:
- `packages/sdk-ts/src/runtime-minimal/index.ts` (lines 29-41)

---

**Core Interface**: `execute(action: Action): Promise<ActionResult>`  
**Reference Implementation**: InMemoryAEL (3 lines)  
**Required Events**: RuntimeExecutionEvent (start + completion)  
**Security**: Primary boundary, MUST sandbox untrusted code