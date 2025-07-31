# Core Module

## 📋 Overview

The Core Module serves as the runtime orchestrator for MPLP v1.0, providing workflow coordination, module management, and execution orchestration across all protocol modules. It implements the central coordination logic that enables seamless multi-agent collaboration.

## 🏗️ Architecture

### Core Components

```
src/modules/core/
├── orchestrator/           # Core Orchestrator
│   └── core-orchestrator.ts
├── workflow/              # Workflow Management
│   └── workflow-manager.ts
├── coordination/          # Module Coordination
│   └── module-coordinator.ts
├── types/                 # Type Definitions
│   └── core.types.ts
└── index.ts              # Public exports
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { initializeCoreModule, WorkflowTemplates } from 'mplp';

// Initialize Core with all module services
const moduleServices = {
  contextService: await initializeContextModule(),
  planService: await initializePlanModule(),
  confirmService: await initializeConfirmModule(),
  traceService: await initializeTraceModule(),
  roleService: await initializeRoleModule(),
  extensionService: await initializeExtensionModule()
};

const core = await initializeCoreModule(moduleServices);

// Execute a workflow
const result = await core.orchestrator.executeWorkflow('context-id', {
  stages: ['context', 'plan', 'confirm', 'trace'],
  parallel_execution: false,
  timeout_ms: 300000
});
```

## 📖 API Reference

### Core Orchestrator

#### executeWorkflow()

Executes a complete workflow with specified stages.

```typescript
async executeWorkflow(
  contextId: UUID,
  workflowConfig?: Partial<WorkflowConfiguration>
): Promise<WorkflowExecutionResult>
```

#### getActiveExecutions()

Retrieves all currently active workflow executions.

```typescript
getActiveExecutions(): ExecutionContext[]
```

#### getModuleStatuses()

Gets the current status of all registered modules.

```typescript
getModuleStatuses(): Map<ProtocolModule, ModuleStatus>
```

### Workflow Manager

#### getTemplate()

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

#### createCustomWorkflow()

Creates a custom workflow configuration.

```typescript
createCustomWorkflow(
  stages: WorkflowStage[],
  options?: WorkflowOptions
): WorkflowConfiguration
```

### Module Coordinator

#### checkModuleDependencies()

Verifies that all required modules are available.

```typescript
checkModuleDependencies(): {
  satisfied: boolean;
  missing: ProtocolModule[];
}
```

#### getModuleHealthStatus()

Gets the health status of all modules.

```typescript
getModuleHealthStatus(): Map<ProtocolModule, boolean>
```

## 🎯 Workflow Templates

### Standard MPLP Workflow

```typescript
const standardWorkflow = {
  stages: ['context', 'plan', 'confirm', 'trace'],
  parallel_execution: false,
  timeout_ms: 300000,
  retry_policy: {
    max_attempts: 3,
    delay_ms: 1000,
    backoff_multiplier: 2
  },
  error_handling: {
    continue_on_error: false,
    rollback_on_failure: true,
    notification_enabled: true
  }
};
```

### Fast Execution Workflow

```typescript
const fastWorkflow = {
  stages: ['context', 'plan', 'trace'],
  parallel_execution: false,
  timeout_ms: 60000,
  retry_policy: {
    max_attempts: 2,
    delay_ms: 500
  },
  error_handling: {
    continue_on_error: true,
    rollback_on_failure: false
  }
};
```

## 🔧 Configuration

### Orchestrator Configuration

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

## 📊 Events

### Coordination Events

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

### Event Handling

```typescript
core.orchestrator.addEventListener((event) => {
  console.log(`Event: ${event.event_type} for execution ${event.execution_id}`);
  
  if (event.event_type === 'stage_completed') {
    console.log(`Stage ${event.stage} completed successfully`);
  }
});
```

## 🧪 Testing

### Unit Tests

```typescript
describe('Core Orchestrator', () => {
  test('should execute workflow successfully', async () => {
    const result = await orchestrator.executeWorkflow('test-context', {
      stages: ['context', 'plan', 'trace'],
      timeout_ms: 30000
    });
    
    expect(result.status).toBe('completed');
    expect(result.stages).toHaveLength(3);
  });
});
```

### Integration Tests

```typescript
describe('Workflow Integration', () => {
  test('should coordinate all modules', async () => {
    const core = await initializeCoreModule(moduleServices);
    
    const result = await core.orchestrator.executeWorkflow('integration-test');
    
    expect(result.status).toBe('completed');
    expect(result.stages.every(s => s.status === 'completed')).toBe(true);
  });
});
```

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

## 🚨 Error Handling

### Error Recovery

The Core orchestrator provides automatic error recovery mechanisms:

1. **Retry Logic**: Configurable retry attempts with exponential backoff
2. **Circuit Breaker**: Automatic failure isolation
3. **Graceful Degradation**: Continue execution when possible
4. **Rollback Support**: Undo operations on failure

### Common Error Types

- **ModuleNotFoundError**: Required module is not registered
- **WorkflowTimeoutError**: Workflow execution exceeded timeout
- **StageExecutionError**: Individual stage execution failed
- **DependencyError**: Module dependencies not satisfied

## 🔗 Integration

### Module Integration

The Core module coordinates with all other MPLP modules:

- **Context Module**: Manages workflow contexts
- **Plan Module**: Orchestrates planning stages
- **Confirm Module**: Handles approval workflows
- **Trace Module**: Monitors execution and events
- **Role Module**: Enforces access control
- **Extension Module**: Manages plugins and extensions

### External Integration

```typescript
// Custom module integration
const customModule: ModuleInterface = {
  module_name: 'custom',
  initialize: async () => { /* init logic */ },
  execute: async (context) => { /* execution logic */ },
  cleanup: async () => { /* cleanup logic */ },
  getStatus: () => ({ /* status info */ })
};

core.orchestrator.registerModule(customModule);
```

---

The Core Module provides the essential orchestration capabilities that make MPLP a powerful platform for multi-agent collaboration and workflow management.
