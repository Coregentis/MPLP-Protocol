# @mplp/orchestrator Examples

This document provides practical examples of using the MPLP Orchestrator for various multi-agent workflow scenarios.

## Basic Usage

### Simple Sequential Workflow

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
```

### Parallel Processing Workflow

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
      },
      {
        id: 'process-source-3',
        type: 'agent',
        name: 'Process Source 3',
        agentId: 'data-processor',
        action: 'process',
        parameters: { source: 'api-endpoint' }
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

## Advanced Workflows

### Conditional Workflow

```typescript
const conditionalWorkflow = new WorkflowBuilder('ConditionalProcessing')
  .description('Process data with conditional logic')
  .step('validate-data', {
    name: 'Validate Input Data',
    agentId: 'validator',
    action: 'validate'
  })
  .condition('check-data-quality', {
    name: 'Check Data Quality',
    condition: {
      predicate: async (context) => {
        const validationResult = context.getStepResult('validate-data');
        return validationResult?.result?.isValid === true;
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

### Loop Workflow

```typescript
const loopWorkflow = new WorkflowBuilder('IterativeProcessing')
  .description('Process data iteratively until convergence')
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
  .step('finalize', {
    name: 'Finalize Results',
    agentId: 'finalizer',
    action: 'finalize',
    dependencies: ['iterative-processing']
  })
  .build();
```

## Complex Multi-Agent Scenarios

### Data Pipeline Workflow

```typescript
const dataPipelineWorkflow = new WorkflowBuilder('DataPipeline')
  .description('Complete data processing pipeline')
  .metadata({ 
    version: '1.0.0',
    author: 'Data Team',
    category: 'ETL'
  })
  .timeout(300000) // 5 minutes
  .retries(2)
  
  // Extract phase
  .parallel('extract-phase', {
    name: 'Data Extraction Phase',
    steps: [
      {
        id: 'extract-database',
        type: 'agent',
        name: 'Extract from Database',
        agentId: 'database-extractor',
        action: 'extract',
        parameters: { 
          connectionString: 'postgresql://...',
          query: 'SELECT * FROM transactions'
        }
      },
      {
        id: 'extract-api',
        type: 'agent',
        name: 'Extract from API',
        agentId: 'api-extractor',
        action: 'extract',
        parameters: {
          endpoint: 'https://api.example.com/data',
          headers: { 'Authorization': 'Bearer token' }
        }
      },
      {
        id: 'extract-files',
        type: 'agent',
        name: 'Extract from Files',
        agentId: 'file-extractor',
        action: 'extract',
        parameters: {
          directory: '/data/input',
          pattern: '*.csv'
        }
      }
    ]
  })
  
  // Transform phase
  .sequential('transform-phase', {
    name: 'Data Transformation Phase',
    dependencies: ['extract-phase'],
    steps: [
      {
        id: 'clean-data',
        type: 'agent',
        name: 'Clean Data',
        agentId: 'data-cleaner',
        action: 'clean',
        parameters: {
          removeNulls: true,
          standardizeFormats: true
        }
      },
      {
        id: 'validate-data',
        type: 'agent',
        name: 'Validate Data',
        agentId: 'data-validator',
        action: 'validate',
        parameters: {
          schema: 'transaction-schema.json'
        }
      },
      {
        id: 'enrich-data',
        type: 'agent',
        name: 'Enrich Data',
        agentId: 'data-enricher',
        action: 'enrich',
        parameters: {
          lookupTables: ['customer', 'product', 'location']
        }
      }
    ]
  })
  
  // Load phase
  .step('load-data', {
    name: 'Load Data to Warehouse',
    agentId: 'data-loader',
    action: 'load',
    dependencies: ['transform-phase'],
    parameters: {
      destination: 'data-warehouse',
      table: 'processed_transactions',
      mode: 'append'
    }
  })
  
  // Notification
  .step('notify-completion', {
    name: 'Send Completion Notification',
    agentId: 'notifier',
    action: 'notify',
    dependencies: ['load-data'],
    parameters: {
      recipients: ['data-team@company.com'],
      template: 'pipeline-completion'
    }
  })
  
  .build();
```

### Machine Learning Pipeline

```typescript
const mlPipelineWorkflow = new WorkflowBuilder('MLPipeline')
  .description('Machine learning model training and deployment pipeline')
  
  // Data preparation
  .step('prepare-data', {
    name: 'Prepare Training Data',
    agentId: 'data-preparer',
    action: 'prepare',
    parameters: {
      dataset: 'customer-churn',
      splitRatio: 0.8,
      features: ['age', 'tenure', 'monthly_charges']
    }
  })
  
  // Model training (parallel)
  .parallel('train-models', {
    name: 'Train Multiple Models',
    dependencies: ['prepare-data'],
    steps: [
      {
        id: 'train-rf',
        type: 'agent',
        name: 'Train Random Forest',
        agentId: 'ml-trainer',
        action: 'train',
        parameters: {
          algorithm: 'random-forest',
          hyperparameters: { n_estimators: 100, max_depth: 10 }
        }
      },
      {
        id: 'train-xgb',
        type: 'agent',
        name: 'Train XGBoost',
        agentId: 'ml-trainer',
        action: 'train',
        parameters: {
          algorithm: 'xgboost',
          hyperparameters: { learning_rate: 0.1, max_depth: 6 }
        }
      },
      {
        id: 'train-nn',
        type: 'agent',
        name: 'Train Neural Network',
        agentId: 'ml-trainer',
        action: 'train',
        parameters: {
          algorithm: 'neural-network',
          hyperparameters: { layers: [64, 32, 16], epochs: 100 }
        }
      }
    ]
  })
  
  // Model evaluation
  .step('evaluate-models', {
    name: 'Evaluate and Compare Models',
    agentId: 'model-evaluator',
    action: 'evaluate',
    dependencies: ['train-models'],
    parameters: {
      metrics: ['accuracy', 'precision', 'recall', 'f1-score']
    }
  })
  
  // Model selection
  .step('select-best-model', {
    name: 'Select Best Performing Model',
    agentId: 'model-selector',
    action: 'select',
    dependencies: ['evaluate-models'],
    parameters: {
      criterion: 'f1-score',
      threshold: 0.85
    }
  })
  
  // Conditional deployment
  .condition('check-model-quality', {
    name: 'Check Model Quality',
    dependencies: ['select-best-model'],
    condition: {
      predicate: async (context) => {
        const selection = context.getStepResult('select-best-model');
        return selection?.result?.score >= 0.85;
      },
      description: 'Model meets quality threshold'
    },
    thenStep: {
      id: 'deploy-model',
      type: 'agent',
      name: 'Deploy Model to Production',
      agentId: 'model-deployer',
      action: 'deploy',
      parameters: {
        environment: 'production',
        endpoint: '/api/v1/predict'
      }
    },
    elseStep: {
      id: 'retrain-notification',
      type: 'agent',
      name: 'Send Retraining Notification',
      agentId: 'notifier',
      action: 'notify',
      parameters: {
        message: 'Model quality below threshold, retraining required'
      }
    }
  })
  
  .build();
```

## Event Handling and Monitoring

```typescript
// Set up event handlers
orchestrator.onProgress((progress) => {
  console.log(`Workflow: ${progress.workflowId}`);
  console.log(`Progress: ${progress.completedSteps}/${progress.totalSteps} (${progress.percentage}%)`);
  console.log(`Current Step: ${progress.currentStep}`);
});

orchestrator.onError((error) => {
  console.error('Workflow Error:', {
    workflowId: error.workflowId,
    stepId: error.stepId,
    message: error.message,
    timestamp: new Date().toISOString()
  });
  
  // Send alert to monitoring system
  sendAlert({
    type: 'workflow-error',
    severity: 'high',
    details: error
  });
});

// Execute workflow with monitoring
const result = await orchestrator.executeWorkflow('DataPipeline');

// Check execution results
if (result.status === 'completed') {
  console.log('Workflow completed successfully');
  console.log(`Duration: ${result.duration}ms`);
  console.log(`Steps completed: ${result.steps.filter(s => s.status === 'completed').length}`);
} else {
  console.error('Workflow failed:', result.error?.message);
  
  // Get failed steps for debugging
  const failedSteps = result.steps.filter(s => s.status === 'failed');
  failedSteps.forEach(step => {
    console.error(`Failed step: ${step.stepId} - ${step.error?.message}`);
  });
}
```

## Integration with Other MPLP Packages

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
  .withCapability('validate', async (params) => {
    // Data validation logic
    return { valid: true, errors: [] };
  })
  .build();

// Create orchestrator and register agents
const orchestrator = new MultiAgentOrchestrator();
await orchestrator.registerAgent(dataAgent);

// Register orchestrator with application
app.registerService('orchestrator', orchestrator);

// Start application
await app.start();

console.log('Multi-agent workflow system ready!');
```

These examples demonstrate the flexibility and power of the MPLP Orchestrator for building complex multi-agent workflows. For more advanced patterns and best practices, see the [Best Practices](./BEST-PRACTICES.md) guide.
