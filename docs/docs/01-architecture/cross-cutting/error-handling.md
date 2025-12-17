---
title: Error Handling
description: Error handling strategies in MPLP including fail-fast vs fail-safe,
  retry policies, circuit breakers, rollback mechanisms, and structured error
  events.
keywords:
  - error handling
  - recovery strategies
  - retry policy
  - circuit breaker
  - rollback
  - fail-safe
  - error events
  - MPLP errors
sidebar_label: Error Handling
doc_status: normative
doc_role: normative_spec
protocol_version: 1.0.0
spec_level: CrossCutting
normative_id: MPLP-CC-ERROR
permalink: /architecture/cross-cutting/error-handling
cross_cutting:
  - error-handling
normative_refs: []
protocol_alignment:
  truth_level: T2
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
sidebar_position: 9
---
> [!FROZEN]
> **MPLP Protocol v1.0.0  Frozen Specification**
> **Freeze Date**: 2025-12-03
> **Status**: FROZEN (no breaking changes permitted)
> **Governance**: MPLP Protocol Governance Committee (MPGC)
> **License**: Apache-2.0
> **Note**: Any normative change requires a new protocol version.

# Error Handling

## 1. Purpose

**Error Handling** is the cross-cutting concern that defines how MPLP runtimes detect, classify, respond to, and recover from failures. Unlike traditional error handling which focuses on catching exceptions, MPLP error handling is **protocol-aware**: it understands Plan failures, Step failures, agent errors, and state corruption, and provides normative recovery strategies.

**Key Responsibilities**:
- Detect failures at all layers (L1 validation, L2 state transitions, L3 runtime, L4 integration)
- Classify errors by severity and recoverability
- Emit structured error events for observability
- Provide rollback/compensation mechanisms
- Enable graceful degradation vs. hard failure
- Support retry policies with exponential backoff

**Design Principle**: "Fail explicitly, recover gracefully, never lose data"

## 2. Error Taxonomy

### 2.1 Error Categories

**Classification by Layer**:

| Category | Layer | Example | Recoverable |
|:---|:---|:---|:---|
| **Validation Errors** | L1 | Invalid UUID, missing required field | No |
| **State Transition Errors** | L2 | Invalid Plan status transition (draft in_progress) | No |
| **Runtime Errors** | L3 | LLM API timeout, tool execution failure | Yes (retry) |
| **Integration Errors** | L4 | File system permission denied, Git merge conflict |  Maybe |

**Classification by Severity**:

| Level | Severity | Action | Example |
|:---|:---|:---|:---|
| **Fatal** | Unrecoverable | Abort Plan, escalate to human | PSG corruption detected |
| **Error** | Recoverable with intervention | Pause Plan, await fix | Required API key missing |
| **Warning** | Recoverable automatically | Retry with backoff | Network timeout |
| **Info** | Non-blocking | Log and continue | Deprecation notice |

### 2.2 Structural Error Types

**From actual codebase patterns**:

```typescript
// L1 Schema Validation Error
interface SchemaValidationError {
  error_type: 'schema_validation';
  schema_id: string;
  field_path: string;         // e.g., "plan.steps[0].step_id"
  expected: string;            // Expected type/format
  actual: string;              // Actual value
  message: string;
}

// L2 State Transition Error
interface StateTransitionError {
  error_type: 'state_transition';
  module: string;              // e.g., "Plan"
  entity_id: string;
  current_status: string;
  attempted_status: string;
  valid_transitions: string[];
  message: string;
}

// L3 Runtime Execution Error
interface RuntimeExecutionError {
  error_type: 'runtime_execution';
  execution_id: string;
  executor_kind: 'llm' | 'tool' | 'agent' | 'worker';
  action_type: string;
  error_code: string;          // e.g., "ECONNREFUSED", "ETIMEDOUT"
  message: string;
  stack_trace?: string;
  retry_count: number;
}

// L4 Integration Error
interface IntegrationError {
  error_type: 'integration';
  integration_kind: 'file' | 'git' | 'ci' | 'tool';
  operation: string;
  error_code: string;
  message: string;
  recoverable: boolean;
}
```

## 3. Error Detection

### 3.1 L1 Schema Validation

**Detection**: Use AJV (TypeScript) or Pydantic (Python) validators

**Example** (TypeScript + AJV):
```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

function validatePlan(plan: any): SchemaValidationError[] {
  const planSchema = require('./schemas/v2/mplp-plan.schema.json');
  const validate = ajv.compile(planSchema);
  
  const valid = validate(plan);
  if (valid) return [];
  
  // Convert AJV errors to structured format
  return (validate.errors || []).map(error => ({
    error_type: 'schema_validation',
    schema_id: planSchema.$id,
    field_path: error.instancePath || 'root',
    expected: error.params.type || error.schema?.type,
    actual: typeof plan,
    message: ajv.errorsText([error])
  }));
}
```

**Example** (Python + Pydantic):
```python
from pydantic import BaseModel, ValidationError, Field
from typing import List

class Plan(BaseModel):
    plan_id: str = Field(..., regex=r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
    title: str = Field(..., min_length=1)
    steps: List[Step] = Field(..., min_items=1)

def validate_plan(data: dict) -> List[SchemaValidationError]:
    try:
        Plan(**data)
        return []
    except ValidationError as e:
        return [
            SchemaValidationError(
                error_type='schema_validation',
                field_path='.'.join(str(loc) for loc in err['loc']),
                expected=err['type'],
                message=err['msg']
            )
            for err in e.errors()
        ]
```

### 3.2 L2 State Transition Validation

**Detection**: Check transition against valid state machine

**From**: L2 coordination-governance spec

**Example**:
```typescript
const VALID_PLAN_TRANSITIONS = {
  draft: ['proposed'],
  proposed: ['approved', 'draft'],  // Can return to draft
  approved: ['in_progress'],
  in_progress: ['completed', 'failed', 'cancelled'],
  completed: [],  // Terminal state
  failed: [],     // Terminal state
  cancelled: []   // Terminal state
};

function validateTransition(
  currentStatus: PlanStatus,
  newStatus: PlanStatus
): StateTransitionError | null {
  const validNextStates = VALID_PLAN_TRANSITIONS[currentStatus];
  
  if (!validNextStates.includes(newStatus)) {
    return {
      error_type: 'state_transition',
      module: 'Plan',
      entity_id: plan.plan_id,
      current_status: currentStatus,
      attempted_status: newStatus,
      valid_transitions: validNextStates,
      message: `Invalid transition: ${currentStatus} ${newStatus}. Valid: [${validNextStates.join(', ')}]`
    };
  }
  
  return null;  // Valid transition
}
```

### 3.3 L3 Runtime Error Detection

**Detection**: Catch exceptions from AEL, timeout detection, resource exhaustion

**Example** (with timeout):
```typescript
async function executeWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  actionId: string
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new RuntimeExecutionError({
        error_type: 'runtime_execution',
        execution_id: actionId,
        executor_kind: 'llm',
        action_type: 'llm_call',
        error_code: 'ETIMEDOUT',
        message: `Execution exceeded timeout of ${timeoutMs}ms`,
        retry_count: 0
      })),
      timeoutMs
    )
  );
  
  return Promise.race([promise, timeout]);
}
```

### 3.4 PSG Integrity Checks

**Detection**: Validate PSG invariants periodically

**Example**:
```typescript
async function validatePSGIntegrity(psg: PSG): Promise<IntegrityError[]> {
  const errors: IntegrityError[] = [];
  
  // Check 1: Referential integrity
  const plans = await psg.queryByType('Plan');
  for (const plan of plans) {
    const contextExists = await psg.nodeExists('Context', plan.context_id);
    if (!contextExists) {
      errors.push({
        error_type: 'psg_integrity',
        check: 'referential_integrity',
        node_id: plan.plan_id,
        message: `Plan ${plan.plan_id} references non-existent Context ${plan.context_id}`
      });
    }
  }
  
  // Check 2: DAG property (no cycles)
  for (const plan of plans) {
    const cycle = detectCycle(plan.steps);
    if (cycle) {
      errors.push({
        error_type: 'psg_integrity',
        check: 'dag_property',
        node_id: plan.plan_id,
        message: `Plan ${plan.plan_id} has circular dependencies: ${cycle.join(' ')}`
      });
    }
  }
  
  // Check 3: Trace segment immutability
  const traces = await psg.queryByType('Trace');
  for (const trace of traces) {
    const modified = await checkSegmentModification(trace);
    if (modified.length > 0) {
      errors.push({
        error_type: 'psg_integrity',
        check: 'trace_immutability',
        node_id: trace.trace_id,
        message: `Trace ${trace.trace_id} has ${modified.length} modified segments (MUST be immutable)`
      });
    }
  }
  
  return errors;
}
```

## 4. Error Response Strategies

### 4.1 Fail-Fast vs. Fail-Safe

**Fail-Fast**: Abort immediately on error (default for L1/L2 errors)

```typescript
function processPlan(plan: Plan): void {
  // Validate schema (fail-fast)
  const errors = validatePlan(plan);
  if (errors.length > 0) {
    throw new Error(`Plan validation failed: ${JSON.stringify(errors)}`);
  }
  
  // Proceed with execution
  executePlan(plan);
}
```

**Fail-Safe**: Continue execution with degraded functionality (for L3/L4 errors)

```typescript
async function executePlanWithFallback(plan: Plan): Promise<void> {
  for (const step of plan.steps) {
    try {
      await executeStep(step);
    } catch (error) {
      if (error.error_type === 'runtime_execution') {
        // Retry with exponential backoff
        await retryWithBackoff(step, 3);
      } else {
        // Log error but continue
        console.error(`Step ${step.step_id} failed, skipping:`, error);
        step.status = 'failed';
        step.error = error;
      }
    }
  }
}
```

### 4.2 Retry Policies

**Exponential Backoff**:

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;  // Max retries reached
      }
      
      // Exponential backoff: 1s, 2s, 4s, 8s, ...
      const delayMs = initialDelayMs * Math.pow(2, attempt);
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${delayMs}ms`);
      await sleep(delayMs);
    }
  }
  
  throw lastError!;
}
```

**Jittered Exponential Backoff** (avoid thundering herd):

```typescript
function jitteredBackoffMs(
  attempt: number,
  baseMs: number = 1000,
  maxMs: number = 30000
): number {
  const exponential = baseMs * Math.pow(2, attempt);
  const capped = Math.min(exponential, maxMs);
  const jitter = Math.random() * 0.3 * capped;  // 30% jitter
  return capped + jitter;
}
```

### 4.3 Circuit Breaker

**Pattern**: Prevent cascading failures by stopping requests to failing service

```typescript
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private failureThreshold: number = 5,
    private resetTimeoutMs: number = 60000
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed < this.resetTimeoutMs) {
        throw new Error('Circuit breaker OPEN - service unavailable');
      }
      // Try half-open
      this.state = 'half-open';
    }
    
    try {
      const result = await fn();
      
      // Success - close circuit
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failureCount = 0;
      }
      
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      
      if (this.failureCount >= this.failureThreshold) {
        this.state = 'open';
        console.error(`Circuit breaker OPENED after ${this.failureCount} failures`);
      }
      
      throw error;
    }
  }
}

// Usage
const llmCircuitBreaker = new CircuitBreaker(5, 60000);

async function callLLM(prompt: string): Promise<string> {
  return llmCircuitBreaker.execute(async () => {
    return await openai.chat.completions.create({ messages: [{ role: 'user', content: prompt }] });
  });
}
```

## 5. Recovery Mechanisms

### 5.1 Rollback (PSG Snapshots)

**From**: `docs/06-runtime/drift-and-rollback.md`

**Strategy**: Save PSG state before risky operation, restore on failure

**Implementation**:
```typescript
class RollbackManager {
  async executeWithRollback<T>(
    plan: Plan,
    fn: () => Promise<T>,
    vsl: VSLExtended
  ): Promise<T> {
    // Create snapshot
    const snapshotId = await vsl.createSnapshot();
    console.log(`Snapshot created: ${snapshotId}`);
    
    try {
      const result = await fn();
      
      // Success - delete snapshot
      await vsl.deleteSnapshot(snapshotId);
      return result;
    } catch (error) {
      // Failure - restore snapshot
      console.error(`Error: ${error.message}, restoring snapshot ${snapshotId}`);
      await vsl.restoreSnapshot(snapshotId);
      
      // Emit rollback event
      await emitEvent({
        event_family: 'compensation_plan',
        event_type: 'rollback_executed',
        payload: {
          snapshot_id: snapshotId,
          plan_id: plan.plan_id,
          error: error.message
        }
      });
      
      throw error;
    }
  }
}
```

### 5.2 Compensation Actions

**Strategy**: Define inverse operations for each action, execute in reverse on failure

**Example**:
```typescript
interface CompensableAction {
  forward: () => Promise<void>;
  backward: () => Promise<void>;  // Compensation
  description: string;
}

class CompensationExecutor {
  private executedActions: CompensableAction[] = [];
  
  async execute(action: CompensableAction): Promise<void> {
    try {
      await action.forward();
      this.executedActions.push(action);
    } catch (error) {
      // Compensate all previous actions in reverse order
      await this.compensate();
      throw error;
    }
  }
  
  async compensate(): Promise<void> {
    console.log(`Compensating ${this.executedActions.length} actions...`);
    
    for (const action of this.executedActions.reverse()) {
      try {
        await action.backward();
        console.log(`Compensated: ${action.description}`);
      } catch (compError) {
        console.error(`Compensation failed for ${action.description}:`, compError);
        // Continue compensating other actions
      }
    }
    
    this.executedActions = [];
  }
}

// Usage
const executor = new CompensationExecutor();

try {
  await executor.execute({
    forward: async () => {
      await fs.promises.writeFile('config.json', '{"debug": true}');
    },
    backward: async () => {
      await fs.promises.writeFile('config.json', '{"debug": false}');
    },
    description: 'Enable debug mode'
  });
  
  await executor.execute({
    forward: async () => {
      await deployToProduction();
    },
    backward: async () => {
      await rollbackDeployment();
    },
    description: 'Deploy to production'
  });
} catch (error) {
  // All actions automatically compensated
}
```

### 5.3 Graceful Degradation

**Strategy**: Continue with reduced functionality rather than complete failure

**Example**:
```typescript
async function executePlanWithDegradation(plan: Plan): Promise<void> {
  const results = {
    succeeded: [],
    failed: [],
    degraded: []
  };
  
  for (const step of plan.steps) {
    try {
      // Try primary execution
      await executeStep(step);
      results.succeeded.push(step.step_id);
    } catch (primaryError) {
      // Try fallback execution
      try {
        await executeFallback(step);
        results.degraded.push(step.step_id);
        console.warn(`Step ${step.step_id} executed with degraded quality`);
      } catch (fallbackError) {
        // Both primary and fallback failed
        results.failed.push(step.step_id);
        console.error(`Step ${step.step_id} failed completely`);
      }
    }
  }
  
  // Report results
  console.log(`Plan execution: ${results.succeeded.length} succeeded, ${results.degraded.length} degraded, ${results.failed.length} failed`);
  
  if (results.failed.length > 0) {
    throw new Error(`Plan partially failed: ${results.failed.length}/${plan.steps.length} steps`);
  }
}

async function executeFallback(step: Step): Promise<void> {
  // Fallback strategies
  if (step.action_type === 'llm_call') {
    // Fallback to simpler model
    return executeLLMWithSimpleModel(step);
  } else if (step.action_type === 'tool_call') {
    // Fallback to manual mode
    return executeToolManually(step);
  }
  
  throw new Error('No fallback available');
}
```

## 6. Error Observability

### 6.1 Structured Error Events

**Requirement**: All errors MUST be emitted as structured events

**Event Schema**:
```json
{
  "event_id": "uuid-v4",
  "event_family": "compensation_plan",
  "event_type": "error_detected",
  "timestamp": "2025-12-07T00:00:00.000Z",
  "payload": {
    "error_type": "runtime_execution",
    "severity": "error",
    "recoverable": true,
    "plan_id": "plan-123",
    "step_id": "step-456",
    "error_code": "ETIMEDOUT",
    "message": "LLM API call timed out after 30s",
    "retry_count": 2,
    "stack_trace": "Error: timeout\n  at LLMAdapter.execute(...)"
  }
}
```

### 6.2 Error Metrics

**Track error rates over time**:

```typescript
class ErrorMetrics {
  private errorCounts = new Map<string, number>();
  
  recordError(errorType: string, errorCode: string): void {
    const key = `${errorType}:${errorCode}`;
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
  }
  
  getTopErrors(limit: number = 10): Array<{ key: string; count: number }> {
    return Array.from(this.errorCounts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

// Usage
const metrics = new ErrorMetrics();

try {
  await executePlan(plan);
} catch (error) {
  metrics.recordError(error.error_type, error.error_code);
  throw error;
}

// Report top errors
console.log('Top errors:', metrics.getTopErrors(5));
```

## 7. Best Practices

### 7.1 Error Context

**Include sufficient context for debugging**:

```typescript
class ContextualError extends Error {
  constructor(
    message: string,
    public context: {
      plan_id?: string;
      step_id?: string;
      action_id?: string;
      trace_id?: string;
      [key: string]: any;
    }
  ) {
    super(message);
    this.name = 'ContextualError';
  }
  
  toString(): string {
    return `${this.message}\nContext: ${JSON.stringify(this.context, null, 2)}`;
  }
}

// Usage
throw new ContextualError('Step execution failed', {
  plan_id: plan.plan_id,
  step_id: step.step_id,
  action_id: action.action_id,
  trace_id: context.trace_id,
  executor_kind: 'llm',
  model: 'gpt-4'
});
```

### 7.2 Error Logging Levels

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

class ErrorLogger {
  logError(error: Error, level: LogLevel, context: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      error_type: error.constructor.name,
      message: error.message,
      stack: error.stack,
      context: context
    };
    
    if (level >= LogLevel.ERROR) {
      console.error(JSON.stringify(logEntry));
    } else if (level === LogLevel.WARN) {
      console.warn(JSON.stringify(log Entry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }
}
```

### 7.3 Error Boundaries

**Isolate failures to prevent cascading**:

```typescript
async function executeStepsWithBoundaries(steps: Step[]): Promise<void> {
  for (const step of steps) {
    try {
      await executeStep(step);
    } catch (error) {
      // Boundary prevents error from propagating
      console.error(`Step ${step.step_id} failed, but continuing:`, error);
      step.status = 'failed';
      step.error = error;
      
      // Emit error event
      await emitErrorEvent(step, error);
    }
  }
}
```

## 8. Related Documents

**Architecture**:
- [L1 Core Protocol](../l1-core-protocol.md)
- [L2 Coordination & Governance](../l2-coordination-governance.md)
- [L3 Execution & Orchestration](../l3-execution-orchestration.md)

**Cross-Cutting Concerns**:
- [Transaction](transaction.md) (rollback mechanisms)
- [Observability](observability.md) (error event emission)
- [AEL](ael.md) (execution error handling)

**Runtime Details**:
- [Rollback Mechanisms](../../06-runtime/drift-and-rollback.md)
- [Drift Detection](../../06-runtime/drift-and-rollback.md)

---

**Document Status**: Specification (Normative error response patterns)  
**Error Categories**: 4 layers (L1 validation, L2 state, L3 runtime, L4 integration)  
**Recovery Strategies**: Retry with backoff, circuit breaker, rollback, compensation, graceful degradation  
**Required Events**: compensation_plan (error_detected, rollback_executed)  
**Best Practices**: Contextual errors, structured logging, error boundaries
---

 2025 Bangshi Beijing Network Technology Limited Company
Licensed under the Apache License, Version 2.0.
