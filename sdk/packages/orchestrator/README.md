# @mplp/orchestrator

Multi-agent workflow orchestration and execution engine for the MPLP platform.

## Overview

The `@mplp/orchestrator` package provides a comprehensive solution for orchestrating complex multi-agent workflows. It enables you to define, manage, and execute workflows that coordinate multiple intelligent agents to accomplish complex tasks.

## Key Features

- **🤖 Multi-Agent Orchestration**: Seamlessly coordinate multiple intelligent agents
- **🔧 Fluent Workflow Builder**: Intuitive API for building complex workflows
- **⚡ Parallel Execution**: Execute independent steps concurrently for optimal performance
- **🔀 Advanced Control Flow**: Support for conditional logic, loops, and complex branching
- **🛡️ Robust Error Handling**: Comprehensive error handling, recovery, and retry mechanisms
- **📊 Real-time Monitoring**: Event-driven progress tracking and monitoring
- **🔒 Type Safety**: Full TypeScript support with strict typing and IntelliSense
- **🔌 MPLP Integration**: Native integration with other MPLP platform components

## Installation

```bash
npm install @mplp/orchestrator
```

## Quick Start

### Basic Workflow

```typescript
import { MultiAgentOrchestrator, WorkflowBuilder } from '@mplp/orchestrator';

// Create orchestrator
const orchestrator = new MultiAgentOrchestrator();

// Register agents
await orchestrator.registerAgent({
  id: 'data-processor',
  name: 'Data Processing Agent',
  status: 'idle'
});

await orchestrator.registerAgent({
  id: 'report-generator',
  name: 'Report Generation Agent',
  status: 'idle'
});

// Create workflow
const workflow = new WorkflowBuilder('DataProcessingWorkflow')
  .description('Process data and generate report')
  .step('process-data', {
    name: 'Process Raw Data',
    agentId: 'data-processor',
    action: 'process',
    parameters: { inputFile: 'data.csv' }
  })
  .step('generate-report', {
    name: 'Generate Report',
    agentId: 'report-generator',
    action: 'generate',
    parameters: { format: 'pdf' },
    dependencies: ['process-data']
  })
  .build();

// Register and execute workflow
await orchestrator.registerWorkflow(workflow);
const result = await orchestrator.executeWorkflow(workflow.id);

console.log('Workflow completed:', result.status);
console.log('Duration:', result.duration, 'ms');
```

### Parallel Processing

```typescript
const parallelWorkflow = new WorkflowBuilder('ParallelProcessing')
  .description('Process multiple data sources in parallel')
  .parallel('parallel-processing', {
    name: 'Parallel Data Processing',
    steps: [
      {
        id: 'process-source-1',
        type: 'agent',
        name: 'Process Source 1',
        agentId: 'data-processor',
        action: 'process',
        parameters: { source: 'database-1' }
      },
      {
        id: 'process-source-2',
        type: 'agent',
        name: 'Process Source 2',
        agentId: 'data-processor',
        action: 'process',
        parameters: { source: 'database-2' }
      }
    ]
  })
  .step('merge-results', {
    name: 'Merge Processing Results',
    agentId: 'data-processor',
    action: 'merge',
    dependencies: ['parallel-processing']
  })
  .build();
```

### Event Monitoring

```typescript
// Set up event handlers
orchestrator.onProgress((progress) => {
  console.log(`Progress: ${progress.completedSteps}/${progress.totalSteps} (${progress.percentage}%)`);
});

orchestrator.onError((error) => {
  console.error('Workflow error:', error.message);
});

// Execute with monitoring
const result = await orchestrator.executeWorkflow('ParallelProcessing');
```

## Core Concepts

### Workflow Types

- **Sequential Steps**: Execute steps one after another
- **Parallel Steps**: Execute multiple steps concurrently
- **Conditional Steps**: Execute steps based on runtime conditions
- **Loop Steps**: Repeat steps until a condition is met
- **Agent Steps**: Execute actions on specific agents

### Error Handling

The orchestrator provides multiple levels of error handling:

- **Step-level retries**: Automatically retry failed steps
- **Workflow-level retries**: Retry entire workflows on failure
- **Custom error handlers**: Define custom error handling logic
- **Graceful degradation**: Continue execution when possible

### Monitoring and Observability

- **Real-time progress tracking**: Monitor workflow execution in real-time
- **Detailed execution logs**: Comprehensive logging of all workflow activities
- **Performance metrics**: Track execution times and resource usage
- **Event-driven architecture**: React to workflow events as they occur

## Advanced Features

### Conditional Workflows

```typescript
const conditionalWorkflow = new WorkflowBuilder('ConditionalProcessing')
  .step('validate-data', {
    name: 'Validate Input Data',
    agentId: 'validator',
    action: 'validate'
  })
  .condition('check-data-quality', {
    name: 'Check Data Quality',
    condition: {
      predicate: async (context) => {
        const result = context.getStepResult('validate-data');
        return result?.result?.isValid === true;
      },
      description: 'Data is valid and meets quality standards'
    },
    thenStep: {
      id: 'process-high-quality',
      type: 'agent',
      name: 'Process High Quality Data',
      agentId: 'advanced-processor',
      action: 'process-advanced'
    },
    elseStep: {
      id: 'process-low-quality',
      type: 'agent',
      name: 'Process Low Quality Data',
      agentId: 'basic-processor',
      action: 'process-basic'
    }
  })
  .build();
```

### Loop Workflows

```typescript
const loopWorkflow = new WorkflowBuilder('IterativeProcessing')
  .step('initialize', {
    name: 'Initialize Processing',
    agentId: 'initializer',
    action: 'initialize'
  })
  .loop('iterative-processing', {
    name: 'Iterative Processing Loop',
    condition: {
      predicate: async (context) => {
        const iteration = context.getVariable('iteration') || 0;
        const converged = context.getVariable('converged') || false;
        return iteration < 10 && !converged;
      },
      description: 'Continue until convergence or max iterations'
    },
    body: {
      id: 'process-iteration',
      type: 'agent',
      name: 'Process Single Iteration',
      agentId: 'iterative-processor',
      action: 'iterate'
    },
    maxIterations: 10
  })
  .build();
```

## Integration with MPLP Platform

The orchestrator integrates seamlessly with other MPLP components:

```typescript
import { MPLPApplication } from '@mplp/sdk-core';
import { AgentBuilder } from '@mplp/agent-builder';
import { MultiAgentOrchestrator } from '@mplp/orchestrator';

// Create MPLP application
const app = new MPLPApplication({
  name: 'Multi-Agent Workflow System',
  version: '1.0.0'
});

// Build agents using agent builder
const dataAgent = new AgentBuilder('data-processor')
  .withName('Data Processing Agent')
  .withCapability('process', async (params) => {
    // Data processing logic
    return { processed: true, records: params.records?.length || 0 };
  })
  .build();

// Create orchestrator and register agents
const orchestrator = new MultiAgentOrchestrator();
await orchestrator.registerAgent(dataAgent);

// Register orchestrator with application
app.registerService('orchestrator', orchestrator);

// Start application
await app.start();
```

## Documentation

- **[API Reference](./docs/API.md)** - Complete API documentation
- **[Examples](./docs/EXAMPLES.md)** - Practical usage examples
- **[Best Practices](./docs/BEST-PRACTICES.md)** - Production-ready patterns and practices

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- 📖 Check the [documentation](./docs/)
- 🐛 Report issues on GitHub
- 💬 Join our community discussions

---

**Part of the MPLP (Multi-Agent Protocol Lifecycle Platform) ecosystem** 🚀
