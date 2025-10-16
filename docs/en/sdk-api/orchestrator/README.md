# @mplp/orchestrator API Reference

> **🌐 Language Navigation**: [English](README.md) | [中文](../../../zh-CN/sdk-api/orchestrator/README.md)


> **Package**: @mplp/orchestrator  
> **Version**: v1.1.0-beta  
> **Last Updated**: 2025-09-20  
> **Status**: ✅ Production Ready  

## 📚 **Package Overview**

The `@mplp/orchestrator` package provides a comprehensive multi-agent workflow orchestration system for the MPLP platform. It enables the creation, management, and execution of complex workflows involving multiple intelligent agents with enterprise-grade features for production deployment.

### **🎯 Key Features**

- **Multi-Agent Orchestration**: Coordinate multiple agents in complex workflows
- **Workflow Builder**: Fluent API for building sophisticated workflows with steps, conditions, and parallel execution
- **Execution Engine**: High-performance workflow execution with error handling and recovery
- **Event-Driven Architecture**: Real-time progress monitoring and event handling
- **Load Balancing**: Intelligent agent load balancing and resource optimization
- **Enterprise Features**: Performance metrics, audit logging, security policies
- **Error Handling**: Comprehensive error handling with retry mechanisms and recovery strategies
- **TypeScript Support**: 100% type safety with comprehensive interfaces

### **📦 Installation**

```bash
npm install @mplp/orchestrator
```

### **🏗️ Architecture**

```
┌─────────────────────────────────────────┐
│        MultiAgentOrchestrator           │
│     (Main Orchestration Engine)        │
├─────────────────────────────────────────┤
│  WorkflowBuilder | ExecutionEngine     │
│  LoadBalancer | PerformanceMetrics     │
├─────────────────────────────────────────┤
│         Registered Agents               │
│  Agent1 | Agent2 | Agent3 | Agent4...  │
└─────────────────────────────────────────┘
```

## 🚀 **Quick Start**

### **Basic Workflow Creation**

```typescript
import { MultiAgentOrchestrator, WorkflowBuilder } from '@mplp/orchestrator';
import { AgentBuilder } from '@mplp/agent-builder';

// Create orchestrator
const orchestrator = new MultiAgentOrchestrator();

// Create and register agents
const dataAgent = new AgentBuilder('data-processor')
  .withCapability('process', async (data) => ({ processed: true, count: data.length }))
  .build();

const validatorAgent = new AgentBuilder('validator')
  .withCapability('validate', async (data) => ({ valid: true, errors: [] }))
  .build();

await orchestrator.registerAgent(dataAgent);
await orchestrator.registerAgent(validatorAgent);

// Create workflow
const workflow = new WorkflowBuilder('data-processing-workflow')
  .description('Process and validate data')
  .step('process-data', async (input) => {
    return await dataAgent.executeCapability('process', input.data);
  })
  .step('validate-results', async (input) => {
    return await validatorAgent.executeCapability('validate', input.processedData);
  })
  .build();

// Execute workflow
const result = await orchestrator.executeWorkflow(workflow, { data: [1, 2, 3, 4, 5] });
console.log('Workflow completed:', result);
```

### **Advanced Parallel Workflow**

```typescript
const complexWorkflow = new WorkflowBuilder('parallel-processing')
  .description('Complex parallel data processing workflow')
  .parallel([
    {
      name: 'analyze-sentiment',
      handler: async (input) => await sentimentAgent.executeCapability('analyze', input.text)
    },
    {
      name: 'extract-entities',
      handler: async (input) => await entityAgent.executeCapability('extract', input.text)
    },
    {
      name: 'classify-content',
      handler: async (input) => await classifierAgent.executeCapability('classify', input.text)
    }
  ])
  .step('combine-results', async (input) => {
    return {
      sentiment: input.sentiment,
      entities: input.entities,
      classification: input.classification,
      combined: true
    };
  })
  .build();
```

## 📋 **Core Classes**

### **MultiAgentOrchestrator**

The main orchestrator class for managing agents and executing workflows.

#### **Constructor**

```typescript
constructor()
```

**Example:**
```typescript
const orchestrator = new MultiAgentOrchestrator();
```

#### **Agent Management Methods**

##### `registerAgent(agent: IAgent): Promise<void>`

Registers an agent with the orchestrator.

```typescript
await orchestrator.registerAgent(myAgent);
```

**Throws:**
- `OrchestratorError` - If agent is invalid or already registered

##### `unregisterAgent(agentId: string): Promise<void>`

Unregisters an agent from the orchestrator.

```typescript
await orchestrator.unregisterAgent('my-agent-id');
```

##### `getAgent(agentId: string): IAgent | undefined`

Gets a registered agent by ID.

```typescript
const agent = orchestrator.getAgent('my-agent-id');
if (agent) {
  console.log(`Found agent: ${agent.name}`);
}
```

##### `listAgents(): IAgent[]`

Lists all registered agents.

```typescript
const agents = orchestrator.listAgents();
console.log(`Total agents: ${agents.length}`);
```

#### **Workflow Management Methods**

##### `createWorkflow(name: string): WorkflowBuilder`

Creates a new workflow builder.

```typescript
const workflow = orchestrator.createWorkflow('my-workflow')
  .description('My custom workflow')
  .step('first-step', async (input) => {
    // Step logic
    return { result: 'processed' };
  })
  .build();
```

##### `registerWorkflow(workflow: WorkflowDefinition): void`

Registers a workflow for reuse.

```typescript
orchestrator.registerWorkflow(workflow);
```

##### `executeWorkflow(workflow: WorkflowDefinition, parameters?: Record<string, unknown>, options?: ExecutionOptions): Promise<WorkflowResult>`

Executes a workflow with the given parameters.

```typescript
const result = await orchestrator.executeWorkflow(workflow, {
  inputData: 'Hello World',
  config: { timeout: 30000 }
});

console.log(`Execution status: ${result.status}`);
console.log(`Result: ${JSON.stringify(result.result)}`);
```

##### `getExecutionStatus(executionId: string): WorkflowResult | undefined`

Gets the status of a workflow execution.

```typescript
const status = orchestrator.getExecutionStatus('execution-123');
if (status) {
  console.log(`Status: ${status.status}, Progress: ${status.progress}%`);
}
```

#### **Enterprise Features**

##### `getPerformanceMetrics(): PerformanceMetrics`

Gets performance metrics for the orchestrator.

```typescript
const metrics = orchestrator.getPerformanceMetrics();
console.log(`Average execution time: ${metrics.averageExecutionTime}ms`);
console.log(`Success rate: ${metrics.successRate}%`);
```

##### `getOptimalAgent(agentType: string): string | null`

Gets the optimal agent for execution based on load balancing.

```typescript
const optimalAgentId = orchestrator.getOptimalAgent('data-processor');
if (optimalAgentId) {
  const agent = orchestrator.getAgent(optimalAgentId);
  // Use the optimal agent
}
```

##### `setSecurityPolicy(policy: SecurityPolicy): void`

Sets security policies for workflow execution.

```typescript
orchestrator.setSecurityPolicy({
  requireAuthentication: true,
  allowedRoles: ['admin', 'operator'],
  maxExecutionTime: 300000,
  auditLogging: true
});
```

#### **Events**

The orchestrator emits various events during operation:

```typescript
orchestrator.on('agentRegistered', (agent) => {
  console.log(`Agent registered: ${agent.id}`);
});

orchestrator.on('workflowStarted', (executionId, workflowId) => {
  console.log(`Workflow ${workflowId} started with execution ${executionId}`);
});

orchestrator.on('workflowCompleted', (result) => {
  console.log(`Workflow completed: ${result.status}`);
});

orchestrator.on('workflowFailed', (error, executionId) => {
  console.error(`Workflow ${executionId} failed:`, error);
});

orchestrator.on('stepCompleted', (stepId, result) => {
  console.log(`Step ${stepId} completed with result:`, result);
});
```

### **WorkflowBuilder**

A fluent API for building complex workflows with steps, conditions, and parallel execution.

#### **Constructor**

```typescript
constructor(name: string, id?: string)
```

**Parameters:**
- `name`: Workflow name
- `id` (optional): Unique workflow ID

#### **Configuration Methods**

##### `description(description: string): WorkflowBuilder`

Sets the workflow description.

```typescript
const workflow = new WorkflowBuilder('my-workflow')
  .description('Processes customer data and generates reports')
  .build();
```

##### `version(version: string): WorkflowBuilder`

Sets the workflow version.

```typescript
const workflow = new WorkflowBuilder('my-workflow')
  .version('2.1.0')
  .build();
```

##### `timeout(timeout: number): WorkflowBuilder`

Sets the workflow timeout in milliseconds.

```typescript
const workflow = new WorkflowBuilder('my-workflow')
  .timeout(60000) // 1 minute timeout
  .build();
```

##### `retries(retries: number): WorkflowBuilder`

Sets the number of retry attempts for failed steps.

```typescript
const workflow = new WorkflowBuilder('my-workflow')
  .retries(3)
  .build();
```

##### `metadata(metadata: Record<string, unknown>): WorkflowBuilder`

Sets workflow metadata.

```typescript
const workflow = new WorkflowBuilder('my-workflow')
  .metadata({
    author: 'John Doe',
    department: 'Engineering',
    priority: 'high'
  })
  .build();
```

#### **Step Definition Methods**

##### `step(name: string, handler: StepHandler): WorkflowBuilder`

Adds a sequential step to the workflow.

```typescript
const workflow = new WorkflowBuilder('data-pipeline')
  .step('fetch-data', async (input) => {
    const data = await fetchFromAPI(input.url);
    return { data, timestamp: new Date().toISOString() };
  })
  .step('process-data', async (input) => {
    const processed = await processData(input.data);
    return { processed, count: processed.length };
  })
  .build();
```

##### `parallel(steps: ParallelStepConfig[]): WorkflowBuilder`

Adds parallel steps that execute concurrently.

```typescript
const workflow = new WorkflowBuilder('parallel-analysis')
  .parallel([
    {
      name: 'analyze-text',
      handler: async (input) => await textAnalyzer.analyze(input.content)
    },
    {
      name: 'analyze-images',
      handler: async (input) => await imageAnalyzer.analyze(input.images)
    },
    {
      name: 'analyze-metadata',
      handler: async (input) => await metadataAnalyzer.analyze(input.metadata)
    }
  ])
  .build();
```

##### `condition(predicate: PredicateFunction, thenStep: StepConfig, elseStep?: StepConfig): WorkflowBuilder`

Adds conditional execution based on a predicate.

```typescript
const workflow = new WorkflowBuilder('conditional-processing')
  .step('check-data', async (input) => {
    return { isValid: input.data && input.data.length > 0 };
  })
  .condition(
    (context) => context.results.get('check-data')?.isValid === true,
    {
      name: 'process-valid-data',
      handler: async (input) => await processValidData(input.data)
    },
    {
      name: 'handle-invalid-data',
      handler: async (input) => await handleInvalidData(input.data)
    }
  )
  .build();
```

##### `loop(condition: LoopCondition, steps: StepConfig[]): WorkflowBuilder`

Adds a loop that repeats steps while a condition is true.

```typescript
const workflow = new WorkflowBuilder('batch-processor')
  .loop(
    (context) => context.variables.get('hasMoreBatches') === true,
    [
      {
        name: 'process-batch',
        handler: async (input) => {
          const batch = await getNextBatch();
          const result = await processBatch(batch);
          return { ...result, hasMoreBatches: batch.hasMore };
        }
      }
    ]
  )
  .build();
```

#### **Build Method**

##### `build(): WorkflowDefinition`

Builds and returns the workflow definition.

```typescript
const workflow = new WorkflowBuilder('complete-workflow')
  .description('A complete workflow example')
  .timeout(120000)
  .retries(2)
  .step('initialize', async () => ({ initialized: true }))
  .step('process', async (input) => ({ processed: input.initialized }))
  .build();
```

### **ExecutionEngine**

The workflow execution engine that handles the actual execution of workflows.

#### **Methods**

##### `registerAgent(agent: IAgent): void`

Registers an agent for workflow execution.

```typescript
const engine = new ExecutionEngine();
engine.registerAgent(myAgent);
```

##### `executeWorkflow(workflow: WorkflowDefinition, parameters?: Record<string, unknown>, options?: ExecutionOptions): Promise<WorkflowResult>`

Executes a workflow with the given parameters.

```typescript
const result = await engine.executeWorkflow(workflow, {
  inputData: 'test data',
  config: { maxRetries: 3 }
});
```

##### `getExecution(executionId: string): WorkflowResult | undefined`

Gets the result of a specific execution.

```typescript
const execution = engine.getExecution('execution-123');
if (execution) {
  console.log(`Status: ${execution.status}`);
}
```

## 🔧 **Type Definitions**

### **WorkflowDefinition**

```typescript
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
```

### **WorkflowResult**

```typescript
interface WorkflowResult {
  workflowId: string;
  executionId: string;
  status: WorkflowStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  steps: StepResult[];
  result?: unknown;
  error?: Error;
  metadata?: Record<string, unknown>;
}
```

### **StepConfig**

```typescript
interface StepConfig {
  id: string;
  name: string;
  type: StepType;
  handler: StepHandler;
  dependencies?: string[];
  timeout?: number;
  retries?: number;
  condition?: PredicateFunction;
}

type StepHandler = (input: any, context: WorkflowContext) => Promise<any>;
```

### **ExecutionOptions**

```typescript
interface ExecutionOptions {
  timeout?: number;
  retries?: number;
  metadata?: Record<string, unknown>;
  progressHandler?: ProgressHandler;
  errorHandler?: ErrorHandler;
}
```

## 🎯 **Advanced Usage Examples**

### **Enterprise Content Processing Pipeline**

```typescript
import { MultiAgentOrchestrator, WorkflowBuilder } from '@mplp/orchestrator';
import { AgentBuilder } from '@mplp/agent-builder';

// Create specialized agents
const contentExtractor = new AgentBuilder('content-extractor')
  .withCapability('extract', async (url: string) => {
    // Extract content from URL
    return { content: 'extracted content', metadata: {} };
  })
  .build();

const contentAnalyzer = new AgentBuilder('content-analyzer')
  .withCapability('analyze', async (content: string) => {
    // AI-powered content analysis
    return { sentiment: 'positive', topics: ['tech', 'ai'], score: 0.85 };
  })
  .build();

const contentPublisher = new AgentBuilder('content-publisher')
  .withCapability('publish', async (content: any, platforms: string[]) => {
    // Multi-platform publishing
    return { published: true, platforms, timestamp: new Date() };
  })
  .build();

// Create orchestrator and register agents
const orchestrator = new MultiAgentOrchestrator();
await orchestrator.registerAgent(contentExtractor);
await orchestrator.registerAgent(contentAnalyzer);
await orchestrator.registerAgent(contentPublisher);

// Build enterprise content pipeline
const contentPipeline = new WorkflowBuilder('enterprise-content-pipeline')
  .description('Extract, analyze, and publish content across platforms')
  .version('2.0.0')
  .timeout(300000) // 5 minutes
  .retries(2)
  .step('extract-content', async (input: { urls: string[] }) => {
    const results = await Promise.all(
      input.urls.map(url => contentExtractor.executeCapability('extract', url))
    );
    return { extractedContent: results };
  })
  .parallel([
    {
      name: 'analyze-sentiment',
      handler: async (input) => {
        const analyses = await Promise.all(
          input.extractedContent.map((content: any) => 
            contentAnalyzer.executeCapability('analyze', content.content)
          )
        );
        return { sentimentAnalysis: analyses };
      }
    },
    {
      name: 'generate-summaries',
      handler: async (input) => {
        // Generate summaries for each piece of content
        return { summaries: input.extractedContent.map((c: any) => c.content.substring(0, 100)) };
      }
    }
  ])
  .condition(
    (context) => {
      const sentiment = context.results.get('analyze-sentiment')?.sentimentAnalysis;
      return sentiment && sentiment.some((s: any) => s.score > 0.7);
    },
    {
      name: 'publish-positive-content',
      handler: async (input) => {
        const platforms = ['twitter', 'linkedin', 'medium'];
        return await contentPublisher.executeCapability('publish', input, platforms);
      }
    },
    {
      name: 'flag-for-review',
      handler: async (input) => {
        return { flagged: true, reason: 'Low sentiment score', reviewRequired: true };
      }
    }
  )
  .build();

// Execute the pipeline
const result = await orchestrator.executeWorkflow(contentPipeline, {
  urls: [
    'https://example.com/article1',
    'https://example.com/article2',
    'https://example.com/article3'
  ]
});

console.log('Content pipeline completed:', result.status);
```

## 🔗 **Related Documentation**

- [SDK Core API](../sdk-core/README.md) - Application framework and lifecycle management
- [Agent Builder API](../agent-builder/README.md) - Building and managing intelligent agents
- [Platform Adapters API](../adapters/README.md) - Platform integration and communication
- [CLI Tools](../cli/README.md) - Development and deployment utilities

---

**Package Maintainer**: MPLP Orchestrator Team  
**Last Review**: 2025-09-20  
**Test Coverage**: 100% (117/117 tests passing)  
**Status**: ✅ Production Ready
