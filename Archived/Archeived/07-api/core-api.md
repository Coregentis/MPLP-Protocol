# Core API Reference

## 🎯 Overview

The Core API provides workflow orchestration and module coordination capabilities. It serves as the central runtime that manages the execution of multi-agent workflows across all MPLP modules.

## 🚀 Quick Start

```typescript
import { initializeCoreModule, WorkflowTemplates } from 'mplp';

// Initialize Core module with all dependencies
const core = await initializeCoreModule(moduleServices);

// Execute a workflow
const result = await core.orchestrator.executeWorkflow('context-id', {
  stages: ['context', 'plan', 'confirm', 'trace'],
  parallel_execution: false,
  timeout_ms: 300000
});
```

## 📋 Core Orchestrator API

### executeWorkflow()

Executes a complete workflow with specified stages and configuration.

```typescript
async executeWorkflow(
  contextId: UUID,
  workflowConfig?: Partial<WorkflowConfiguration>
): Promise<WorkflowExecutionResult>
```

**Parameters:**
- `contextId` (string): Unique identifier for the workflow context
- `workflowConfig` (object, optional): Workflow configuration options

**Workflow Configuration:**
```typescript
interface WorkflowConfiguration {
  stages: WorkflowStage[];           // ['context', 'plan', 'confirm', 'trace']
  parallel_execution?: boolean;      // Execute stages in parallel (default: false)
  timeout_ms?: number;              // Workflow timeout (default: 300000)
  retry_policy?: RetryPolicy;       // Retry configuration
  error_handling?: ErrorHandlingPolicy; // Error handling strategy
}
```

**Response:**
```typescript
interface WorkflowExecutionResult {
  execution_id: UUID;
  context_id: UUID;
  status: 'completed' | 'failed' | 'cancelled';
  stages: StageExecutionResult[];
  total_duration_ms: number;
  started_at: Timestamp;
  completed_at?: Timestamp;
  error?: Error;
}
```

**Example:**
```typescript
const result = await core.orchestrator.executeWorkflow('ctx-123', {
  stages: ['context', 'plan', 'trace'],
  parallel_execution: false,
  timeout_ms: 60000,
  retry_policy: {
    max_attempts: 3,
    delay_ms: 1000,
    backoff_multiplier: 2
  }
});

if (result.status === 'completed') {
  console.log(`Workflow completed in ${result.total_duration_ms}ms`);
} else {
  console.error('Workflow failed:', result.error);
}
```

### getActiveExecutions()

Retrieves all currently active workflow executions.

```typescript
getActiveExecutions(): ExecutionContext[]
```

**Response:**
```typescript
interface ExecutionContext {
  execution_id: UUID;
  context_id: UUID;
  workflow_config: WorkflowConfiguration;
  current_stage: WorkflowStage;
  stage_results: Map<WorkflowStage, any>;
  metadata: Record<string, any>;
  started_at: Timestamp;
  updated_at: Timestamp;
}
```

### getModuleStatuses()

Gets the current status of all registered modules.

```typescript
getModuleStatuses(): Map<ProtocolModule, ModuleStatus>
```

**Response:**
```typescript
interface ModuleStatus {
  module_name: ProtocolModule;
  status: 'initialized' | 'running' | 'idle' | 'error';
  last_execution?: Timestamp;
  error_count: number;
  performance_metrics?: PerformanceMetrics;
}
```

## 🔧 Workflow Manager API

### getTemplate()

Retrieves a predefined workflow template.

```typescript
getTemplate(templateName: string): WorkflowConfiguration | undefined
```

**Available Templates:**
- `'standard'` - Full MPLP workflow (Context → Plan → Confirm → Trace)
- `'fast'` - Quick execution (Context → Plan → Trace)
- `'parallel'` - Parallel execution workflow
- `'monitoring'` - Monitoring only (Context → Trace)
- `'approval'` - Approval focused (Context → Plan → Confirm)

**Example:**
```typescript
const standardWorkflow = core.workflowManager.getTemplate('standard');
const fastWorkflow = core.workflowManager.getTemplate('fast');

// Execute with template
const result = await core.orchestrator.executeWorkflow('ctx-123', standardWorkflow);
```

### createCustomWorkflow()

Creates a custom workflow configuration.

```typescript
createCustomWorkflow(
  stages: WorkflowStage[],
  options?: {
    parallel?: boolean;
    timeout_ms?: number;
    retry_policy?: Partial<RetryPolicy>;
    error_handling?: Partial<ErrorHandlingPolicy>;
  }
): WorkflowConfiguration
```

**Example:**
```typescript
const customWorkflow = core.workflowManager.createCustomWorkflow(
  ['context', 'plan', 'trace'],
  {
    parallel: true,
    timeout_ms: 120000,
    retry_policy: { max_attempts: 2 },
    error_handling: { continue_on_error: true }
  }
);
```

### validateWorkflowConfiguration()

Validates a workflow configuration for correctness.

```typescript
validateWorkflowConfiguration(config: WorkflowConfiguration): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

### analyzeWorkflowResult()

Analyzes workflow execution results for performance insights.

```typescript
analyzeWorkflowResult(result: WorkflowExecutionResult): {
  performance_score: number;
  bottlenecks: string[];
  recommendations: string[];
}
```

## 🔗 Module Coordinator API

### checkModuleDependencies()

Verifies that all required modules are available and properly initialized.

```typescript
checkModuleDependencies(): {
  satisfied: boolean;
  missing: ProtocolModule[];
}
```

### getModuleHealthStatus()

Gets the health status of all modules.

```typescript
getModuleHealthStatus(): Map<ProtocolModule, boolean>
```

### getModuleInterface()

Retrieves the interface for a specific module.

```typescript
getModuleInterface(moduleName: ProtocolModule): ModuleInterface | undefined
```

## 📊 Event System

### addEventListener()

Registers an event listener for coordination events.

```typescript
addEventListener(listener: (event: CoordinationEvent) => void): void
```

**Event Types:**
```typescript
interface CoordinationEvent {
  event_id: UUID;
  event_type: 'stage_started' | 'stage_completed' | 'stage_failed' | 
              'workflow_completed' | 'workflow_failed';
  execution_id: UUID;
  stage?: WorkflowStage;
  data?: any;
  timestamp: Timestamp;
}
```

**Example:**
```typescript
core.orchestrator.addEventListener((event) => {
  console.log(`Event: ${event.event_type} for execution ${event.execution_id}`);
  
  if (event.event_type === 'stage_completed') {
    console.log(`Stage ${event.stage} completed successfully`);
  }
});
```

## 🛠️ Lifecycle Management

### initialize()

Initializes the Core orchestrator and all registered modules.

```typescript
async initialize(): Promise<void>
```

### cleanup()

Cleans up resources and shuts down the orchestrator gracefully.

```typescript
async cleanup(): Promise<void>
```

## ⚙️ Configuration Options

### OrchestratorConfiguration

```typescript
interface OrchestratorConfiguration {
  default_workflow: WorkflowConfiguration;
  module_timeout_ms: number;
  max_concurrent_executions: number;
  enable_performance_monitoring: boolean;
  enable_event_logging: boolean;
  lifecycle_hooks?: LifecycleHooks;
}
```

### Lifecycle Hooks

```typescript
interface LifecycleHooks {
  beforeStage?: (stage: WorkflowStage, context: ExecutionContext) => Promise<void>;
  afterStage?: (stage: WorkflowStage, result: StageExecutionResult, context: ExecutionContext) => Promise<void>;
  onError?: (error: Error, stage: WorkflowStage, context: ExecutionContext) => Promise<void>;
  beforeWorkflow?: (context: ExecutionContext) => Promise<void>;
  afterWorkflow?: (result: WorkflowExecutionResult) => Promise<void>;
}
```

## 🚨 Error Handling

### Common Error Types

- **ModuleNotFoundError**: Required module is not registered
- **WorkflowTimeoutError**: Workflow execution exceeded timeout
- **StageExecutionError**: Individual stage execution failed
- **DependencyError**: Module dependencies not satisfied
- **ConfigurationError**: Invalid workflow configuration

### Error Recovery

The Core orchestrator provides automatic error recovery mechanisms:

1. **Retry Logic**: Configurable retry attempts with exponential backoff
2. **Circuit Breaker**: Automatic failure isolation
3. **Graceful Degradation**: Continue execution when possible
4. **Rollback Support**: Undo operations on failure

## 📈 Performance Monitoring

### Built-in Metrics

- Workflow execution times
- Stage-level performance
- Module response times
- Error rates and patterns
- Concurrent execution counts

### Custom Metrics

```typescript
// Access performance data
const metrics = core.orchestrator.getPerformanceMetrics();
console.log('Average execution time:', metrics.averageExecutionTime);
console.log('Success rate:', metrics.successRate);
```

---

The Core API provides comprehensive workflow orchestration capabilities while maintaining simplicity and flexibility for various use cases.
