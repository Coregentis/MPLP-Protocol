# @mplp/orchestrator API Reference

## Overview

The `@mplp/orchestrator` package provides a comprehensive multi-agent workflow orchestration system for the MPLP platform. It enables the creation, management, and execution of complex workflows involving multiple intelligent agents.

## Core Classes

### MultiAgentOrchestrator

The main orchestrator class for managing agents and executing workflows.

```typescript
import { MultiAgentOrchestrator } from '@mplp/orchestrator';

const orchestrator = new MultiAgentOrchestrator();
```

#### Methods

##### Agent Management

- `registerAgent(agent: IAgent): Promise<void>` - Register an agent
- `unregisterAgent(agentId: string): Promise<void>` - Unregister an agent
- `getAgent(agentId: string): IAgent | undefined` - Get an agent by ID
- `listAgents(): IAgent[]` - List all registered agents

##### Workflow Management

- `registerWorkflow(workflow: WorkflowDefinition): Promise<void>` - Register a workflow
- `unregisterWorkflow(workflowId: string): Promise<void>` - Unregister a workflow
- `getWorkflow(workflowId: string): WorkflowDefinition | undefined` - Get a workflow by ID
- `listWorkflows(): WorkflowDefinition[]` - List all registered workflows

##### Workflow Execution

- `executeWorkflow(workflowId: string, parameters?: Record<string, unknown>): Promise<WorkflowResult>` - Execute a workflow
- `getExecutionStatus(executionId: string): WorkflowResult | undefined` - Get execution status
- `listExecutions(): WorkflowResult[]` - List all executions

##### Event Handling

- `onProgress(handler: ProgressHandler): void` - Register progress handler
- `onError(handler: ErrorHandler): void` - Register error handler

##### Static Methods

- `MultiAgentOrchestrator.create(): MultiAgentOrchestrator` - Create orchestrator instance
- `MultiAgentOrchestrator.createWorkflow(name: string): WorkflowBuilder` - Create workflow builder

### WorkflowBuilder

A fluent API for building complex workflows.

```typescript
import { WorkflowBuilder } from '@mplp/orchestrator';

const workflow = new WorkflowBuilder('MyWorkflow')
  .description('A sample workflow')
  .step('step1', {
    name: 'First Step',
    agentId: 'agent1',
    action: 'process'
  })
  .build();
```

#### Methods

##### Basic Configuration

- `description(description: string): WorkflowBuilder` - Set workflow description
- `version(version: string): WorkflowBuilder` - Set workflow version
- `timeout(timeout: number): WorkflowBuilder` - Set workflow timeout
- `retries(retries: number): WorkflowBuilder` - Set retry count
- `metadata(metadata: Record<string, unknown>): WorkflowBuilder` - Set metadata

##### Step Types

- `step(id: string, config: AgentStepConfig): WorkflowBuilder` - Add agent step
- `parallel(id: string, config: ParallelStepConfig): WorkflowBuilder` - Add parallel step
- `sequential(id: string, config: SequentialStepConfig): WorkflowBuilder` - Add sequential step
- `condition(id: string, config: ConditionalStepConfig): WorkflowBuilder` - Add conditional step
- `loop(id: string, config: LoopStepConfig): WorkflowBuilder` - Add loop step

##### Build

- `build(): WorkflowDefinition` - Build the workflow definition

##### Static Methods

- `WorkflowBuilder.create(name: string, id?: string): WorkflowBuilder` - Create builder instance

### ExecutionEngine

The workflow execution engine that handles step execution and coordination.

```typescript
import { ExecutionEngine } from '@mplp/orchestrator';

const engine = new ExecutionEngine();
```

#### Methods

##### Agent Management

- `registerAgent(agent: IAgent): void` - Register an agent
- `unregisterAgent(agentId: string): void` - Unregister an agent
- `getAgent(agentId: string): IAgent | undefined` - Get an agent by ID

##### Workflow Execution

- `executeWorkflow(workflow: WorkflowDefinition, parameters?: Record<string, unknown>): Promise<WorkflowResult>` - Execute a workflow

##### Execution Management

- `getExecution(executionId: string): WorkflowResult | undefined` - Get execution result
- `listExecutions(): WorkflowResult[]` - List all executions

## Type Definitions

### Core Types

```typescript
// Agent interface
interface IAgent {
  id: string;
  name: string;
  status: 'idle' | 'busy' | 'error';
}

// Workflow definition
interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  version?: string;
  steps: StepConfig[];
  timeout?: number;
  retries?: number;
  metadata?: Record<string, unknown>;
}

// Workflow result
interface WorkflowResult {
  workflowId: string;
  executionId: string;
  status: WorkflowStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  steps: StepResult[];
  error?: Error;
  metadata?: Record<string, unknown>;
}
```

### Step Types

```typescript
// Agent step configuration
interface AgentStepConfig {
  id: string;
  type: 'agent';
  name: string;
  agentId: string;
  action: string;
  parameters?: Record<string, unknown>;
  timeout?: number;
  retries?: number;
  priority?: StepPriority;
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

// Parallel step configuration
interface ParallelStepConfig {
  id: string;
  type: 'parallel';
  name: string;
  steps: StepConfig[];
  timeout?: number;
  metadata?: Record<string, unknown>;
}

// Sequential step configuration
interface SequentialStepConfig {
  id: string;
  type: 'sequential';
  name: string;
  steps: StepConfig[];
  timeout?: number;
  metadata?: Record<string, unknown>;
}

// Conditional step configuration
interface ConditionalStepConfig {
  id: string;
  type: 'conditional';
  name: string;
  condition: {
    predicate: (context: WorkflowContext) => Promise<boolean>;
    description: string;
  };
  thenStep: StepConfig;
  elseStep?: StepConfig;
  metadata?: Record<string, unknown>;
}

// Loop step configuration
interface LoopStepConfig {
  id: string;
  type: 'loop';
  name: string;
  condition: {
    predicate: (context: WorkflowContext) => Promise<boolean>;
    description: string;
  };
  body: StepConfig;
  maxIterations?: number;
  metadata?: Record<string, unknown>;
}
```

### Enums

```typescript
// Workflow status
enum WorkflowStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Step status
enum StepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  CANCELLED = 'cancelled'
}

// Step priority
enum StepPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical'
}
```

## Error Classes

### OrchestratorError

Base error class for orchestrator-related errors.

```typescript
class OrchestratorError extends Error {
  constructor(message: string, code?: string, details?: Record<string, unknown>)
}
```

### WorkflowDefinitionError

Error thrown when workflow definition is invalid.

```typescript
class WorkflowDefinitionError extends OrchestratorError {
  constructor(message: string, details?: Record<string, unknown>)
}
```

### WorkflowExecutionError

Error thrown during workflow execution.

```typescript
class WorkflowExecutionError extends OrchestratorError {
  constructor(message: string, workflowId: string, details?: Record<string, unknown>)
}
```

### StepExecutionError

Error thrown during step execution.

```typescript
class StepExecutionError extends OrchestratorError {
  constructor(message: string, stepId: string, details?: Record<string, unknown>)
}
```

### AgentNotFoundError

Error thrown when referenced agent is not found.

```typescript
class AgentNotFoundError extends OrchestratorError {
  constructor(agentId: string)
}
```

### WorkflowNotFoundError

Error thrown when referenced workflow is not found.

```typescript
class WorkflowNotFoundError extends OrchestratorError {
  constructor(workflowId: string)
}
```

## Utility Functions

The package also exports various utility functions for workflow management:

- `cloneWorkflow(workflow: WorkflowDefinition): WorkflowDefinition` - Clone a workflow
- `validateWorkflowStructure(workflow: WorkflowDefinition): boolean` - Validate workflow structure
- `getWorkflowStepIds(workflow: WorkflowDefinition): string[]` - Get all step IDs
- `getWorkflowAgentIds(workflow: WorkflowDefinition): string[]` - Get all agent IDs
- `hasCircularDependencies(workflow: WorkflowDefinition): boolean` - Check for circular dependencies
- `calculateProgress(steps: StepResult[]): ProgressInfo` - Calculate execution progress
- `getExecutionSummary(result: WorkflowResult): ExecutionSummary` - Get execution summary
- `isExecutionSuccessful(result: WorkflowResult): boolean` - Check if execution was successful
- `getFailedSteps(result: WorkflowResult): StepResult[]` - Get failed steps
- `formatDuration(ms: number): string` - Format duration in human-readable format

## Event System

The orchestrator uses an event-driven architecture. You can listen to various events:

```typescript
orchestrator.onProgress((progress) => {
  console.log(`Workflow progress: ${progress.percentage}%`);
});

orchestrator.onError((error) => {
  console.error('Workflow error:', error);
});
```

## Integration

The orchestrator integrates seamlessly with other MPLP packages:

- `@mplp/sdk-core` - Core SDK functionality
- `@mplp/agent-builder` - Agent construction and management

For complete examples and best practices, see the [Examples](./EXAMPLES.md) and [Best Practices](./BEST-PRACTICES.md) documentation.
