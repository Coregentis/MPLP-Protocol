---
title: Performance
description: Performance optimization for MPLP including latency tracking, token
  cost management, semantic caching, context pruning, and budget enforcement.
keywords:
  - performance
  - latency
  - token usage
  - cost tracking
  - semantic caching
  - context pruning
  - budget enforcement
  - LLM costs
sidebar_label: Performance
doc_status: informative
doc_role: functional-spec
normative_refs:
  - MPLP-CORPUS-v1.0.0
protocol_alignment:
  truth_level: T0
  protocol_version: 1.0.0
  schema_refs:
    - schema_id: https://schemas.mplp.dev/v1.0/common/trace-base.schema.json
      binding: manual
  invariant_refs: []
  golden_refs: []
  code_refs:
    ts: []
    py: []
  evidence_notes:
    - Manual binding applied per Remediation Option A/B.
  doc_status: normative
  normativity_scope: protocol_function
normative_id: MPLP-CORE-PERFORMANCE
sidebar_position: 14
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Performance

## 1. Purpose

The **Performance** cross-cutting concern addresses efficiency, latency, and resource consumption of the multi-agent system. Given the high cost and latency of LLM calls, performance management is critical for viable production deployments.

**Design Principle**: "Optimize for token efficiency and parallel execution"

## 2. Core Metrics (MUST Track)

**From**: `cost_budget` event family + observability requirements

Runtimes **MUST** track the following metrics:

| Metric | Unit | Source | Purpose |
|:---|:---|:---|:---|
| **Latency** | milliseconds | `runtime_execution` events | Identify slow operations |
| **Throughput** | steps/minute | `pipeline_stage` events | Measure execution speed |
| **Token Usage** | tokens | `cost_budget` events | Control costs |
| **Error Rate** | percentage | Failed `pipeline_stage` events | Track reliability |

### 2.1 Metric Collection

```typescript
class MetricsCollector {
  constructor(private eventBus: EventBus) {
    this.subscribeToMetrics();
  }
  
  private subscribeToMetrics(): void {
    // Latency tracking
    this.eventBus.subscribe('runtime_execution', async (event) => {
      if (event.event_type === 'execution_completed') {
        this.recordLatency(event.payload.executor_kind, event.payload.duration_ms);
      }
    });
    
    // Token usage tracking
    this.eventBus.subscribe('cost_budget', async (event) => {
      this.recordTokenUsage(event.payload.tokens_used, event.payload.cost_usd);
    });
    
    // Error rate tracking
    this.eventBus.subscribe('pipeline_stage', async (event) => {
      if (event.event_type === 'step_failed') {
        this.recordFailure(event.payload.step_id);
      }
    });
  }
}
```

## 3. Cost Tracking

**From**: `schemas/v2/events/mplp-cost-budget-event.schema.json`

### 3.1 CostAndBudgetEvent Schema

```json
{
  "event_family": "cost_budget",
  "event_type": "tokens_consumed",
  "payload": {
    "plan_id": "plan-123",
    "step_id": "step-456",
    "executor_kind": "llm",
    "model": "gpt-4",
    "tokens_used": {
      "prompt": 250,
      "completion": 180,
      "total": 430
    },
    "cost_usd": 0.012,
    "budget_remaining_usd": 9.988
  }
}
```

### 3.2 Budget Enforcement

```typescript
class BudgetEnforcer {
  private budgetRemaining: number;
  
  constructor(private initialBudget: number) {
    this.budgetRemaining = initialBudget;
  }
  
  async checkBudget(estimatedCost: number): Promise<boolean> {
    if (estimatedCost > this.budgetRemaining) {
      // Emit budget exceeded event
      await eventBus.emit({
        event_family: 'cost_budget',
        event_type: 'budget_exceeded',
        payload: {
          estimated_cost: estimatedCost,
          budget_remaining: this.budgetRemaining
        }
      });
      
      return false;  // Budget exceeded
    }
    
    return true;  // Budget OK
  }
  
  recordUsage(actualCost: number): void {
    this.budgetRemaining -= actualCost;
  }
}
```

## 4. Optimization Strategies

### 4.1 Parallel Execution

**From**: SA Profile + Orchestration

**Execute independent steps concurrently**:

```typescript
async function executePlanParallel(plan: Plan): Promise<void> {
  const completed = new Set<string>();
  
  while (completed.size < plan.steps.length) {
    // Find ready steps (all dependencies completed)
    const ready = plan.steps.filter(step =>
      !completed.has(step.step_id) &&
      step.dependencies.every(dep => completed.has(dep))
    );
    
    // Execute all ready steps in parallel
    await Promise.all(
      ready.map(async step => {
        await executeStep(step);
        completed.add(step.step_id);
      })
    );
  }
}
```

**Speedup**: Linear in number of independent steps

### 4.2 Semantic Caching

**Cache LLM responses** for identical prompts:

```typescript
class SemanticCache {
  private cache = new Map<string, CachedResponse>();
  
  async get(prompt: string, model: string): Promise<string | null> {
    const key = this.computeKey(prompt, model);
    const cached = this.cache.get(key);
    
    if (cached && !this.isExpired(cached)) {
      return cached.response;
    }
    
    return null;
  }
  
  set(prompt: string, model: string, response: string): void {
    const key = this.computeKey(prompt, model);
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      ttl: 3600000  // 1 hour
    });
  }
  
  private computeKey(prompt: string, model: string): string {
    return `${model}:${sha256(prompt)}`;
  }
  
  private isExpired(cached: CachedResponse): boolean {
    return Date.now() - cached.timestamp > cached.ttl;
  }
}

// Usage in AEL
class CachingAEL implements ActionExecutionLayer {
  constructor(
    private baseAEL: ActionExecutionLayer,
    private cache: SemanticCache
  ) {}
  
  async execute(action: Action): Promise<ActionResult> {
    if (action.action_type === 'llm_call') {
      // Check cache first
      const cached = await this.cache.get(action.params.prompt, action.params.model);
      if (cached) {
        return { status: 'completed', output: cached, from_cache: true };
      }
      
      // Execute and cache
      const result = await this.baseAEL.execute(action);
      this.cache.set(action.params.prompt, action. params.model, result.output);
      return result;
    }
    
    return this.baseAEL.execute(action);
  }
}
```

**Savings**: 100% cost reduction for cached prompts

### 4.3 Context Pruning

**Minimize token usage** by pruning unnecessary context:

```typescript
function pruneContext(
  context: string,
  maxTokens: number
): string {
  const tokens = tokenize(context);
  
  if (tokens.length <= maxTokens) {
    return context;  // No pruning needed
  }
  
  // Keep most recent context (sliding window)
  const prunedTokens = tokens.slice(-maxTokens);
  return detokenize(prunedTokens);
}

// Usage
const fullContext = buildFullContext(plan, history);
const prunedContext = pruneContext(fullContext, 4000);  // GPT-4 limit
```

**Savings**: Reduced prompt tokens = lower cost

### 4.4 Streaming Responses

**Stream LLM responses** instead of waiting for completion:

```typescript
async function* streamLLMResponse(prompt: string): AsyncGenerator<string> {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    stream: true
  });
  
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    yield content;
  }
}

// Usage - start processing immediately
for await (const chunk of streamLLMResponse(prompt)) {
  processChunk(chunk);  // Process as data arrives
}
```

**Benefit**: Lower perceived latency

## 5. Performance Monitoring

### 5.1 Real-Time Dashboard

```typescript
class PerformanceDashboard {
  async getMetrics(): Promise<DashboardMetrics> {
    const events = await eventBus.getRecentEvents('runtime_execution', 1000);
    
    return {
      avgLatency: this.calculateAvgLatency(events),
      p95Latency: this.calculatePercentile(events, 0.95),
      throughput: events.length / 60,  // events per minute
      errorRate: this.calculateErrorRate(events),
      totalCost: this.calculateTotalCost(events)
    };
  }
  
  private calculateAvgLatency(events: MplpEvent[]): number {
    const latencies = events
      .filter(e => e.payload.duration_ms)
      .map(e => e.payload.duration_ms);
    
    return latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
  }
}
```

### 5.2 Alerting

```typescript
class PerformanceAlerter {
  private thresholds = {
    maxLatencyMs: 30000,      // 30 seconds
    maxErrorRate: 0.05,      // 5%
    maxCostPerHour: 10.0      // $10/hour
  };
  
  async checkAlerts(): Promise<void> {
    const metrics = await this.dashboard.getMetrics();
    
    if (metrics.avgLatency > this.thresholds.maxLatencyMs) {
      await this.alert('High latency detected', metrics);
    }
    
    if (metrics.errorRate > this.thresholds.maxErrorRate) {
      await this.alert('High error rate detected', metrics);
    }
  }
}
```

## 6. Best Practices

### 6.1 Profile Before Optimizing

**Measure actual performance** before optimizing:

```typescript
async function profileExecution(fn: () => Promise<void>): Promise<Profile> {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();
  
  await fn();
  
  const endTime = Date.now();
  const endMemory = process.memoryUsage();
  
  return {
    duration_ms: endTime - startTime,
    memory_delta_mb: (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024
  };
}
```

### 6.2 Batch Small Operations

**Combine multiple small operations** into single request:

```typescript
// Bad: Multiple individual updates
for (const step of plan.steps) {
  await psg.updateNode(step.step_id, { status: 'completed' });
}

// Good: Single batch update
await psg.batchUpdate(
  plan.steps.map(step => ({
    node_id: step.step_id,
    updates: { status: 'completed' }
  }))
);
```

### 6.3 Use Cheaper Models When Appropriate

**GPT-4 for complex tasks, GPT-3.5 for simple ones**:

```typescript
function selectModel(complexity: 'simple' | 'medium' | 'complex'): string {
  switch (complexity) {
    case 'simple':
      return 'gpt-3.5-turbo';  // 10x cheaper
    case 'medium':
      return 'gpt-4';
    case 'complex':
      return 'gpt-4-32k';
  }
}
```

## 7. Related Documents

**Architecture**:
- [Orchestration](orchestration.md) - Parallel execution
- [AEL](ael.md) - Execution layer optimizations

**Cross-Cutting Concerns**:
- [Observability](observability.md) - Metrics collection
- [Event Bus](event-bus.md) - Event routing

**Event Schemas**:
- `cost_budget` event family

---

**Document Status**: Best Practices (RECOMMENDED optimizations)  
**Key Metrics**: Latency, Throughput, Token Usage, Error Rate  
**Strategies**: Parallel execution, semantic caching, context pruning, streaming  
**Cost Tracking**: CostAndBudgetEvent, budget enforcement
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
