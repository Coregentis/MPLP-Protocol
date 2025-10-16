# @mplp/orchestrator Best Practices

This guide provides best practices for using the MPLP Orchestrator effectively in production environments.

## Workflow Design Principles

### 1. Keep Workflows Focused and Modular

**Good:**
```typescript
// Focused workflow for a specific business process
const orderProcessingWorkflow = new WorkflowBuilder('OrderProcessing')
  .description('Process customer orders')
  .step('validate-order', { /* ... */ })
  .step('check-inventory', { /* ... */ })
  .step('process-payment', { /* ... */ })
  .step('fulfill-order', { /* ... */ })
  .build();
```

**Avoid:**
```typescript
// Overly complex workflow trying to do everything
const megaWorkflow = new WorkflowBuilder('EverythingWorkflow')
  .description('Does everything in the system')
  // 50+ steps handling multiple unrelated processes
  .build();
```

### 2. Use Meaningful Names and Descriptions

**Good:**
```typescript
const workflow = new WorkflowBuilder('CustomerOnboarding')
  .description('Complete customer onboarding process including verification, setup, and welcome')
  .step('verify-identity', {
    name: 'Verify Customer Identity',
    agentId: 'identity-verifier',
    action: 'verify-documents'
  })
  .step('setup-account', {
    name: 'Set Up Customer Account',
    agentId: 'account-manager',
    action: 'create-account'
  })
  .build();
```

**Avoid:**
```typescript
const workflow = new WorkflowBuilder('Workflow1')
  .step('step1', {
    name: 'Step 1',
    agentId: 'agent1',
    action: 'do-stuff'
  })
  .build();
```

### 3. Design for Failure and Recovery

```typescript
const resilientWorkflow = new WorkflowBuilder('ResilientProcessing')
  .description('Data processing with error handling and recovery')
  .timeout(300000) // 5 minutes timeout
  .retries(3) // Retry failed workflow up to 3 times
  
  .step('process-data', {
    name: 'Process Data',
    agentId: 'data-processor',
    action: 'process',
    timeout: 60000, // 1 minute per step
    retries: 2, // Retry failed steps
    priority: 'high'
  })
  
  // Always include cleanup steps
  .step('cleanup-temp-files', {
    name: 'Clean Up Temporary Files',
    agentId: 'file-manager',
    action: 'cleanup',
    dependencies: ['process-data']
  })
  
  .build();
```

## Agent Management

### 1. Agent Registration Strategy

```typescript
class AgentManager {
  private orchestrator: MultiAgentOrchestrator;
  
  constructor(orchestrator: MultiAgentOrchestrator) {
    this.orchestrator = orchestrator;
  }
  
  async initializeAgents(): Promise<void> {
    // Register agents in dependency order
    const coreAgents = [
      { id: 'logger', name: 'Logging Agent' },
      { id: 'monitor', name: 'Monitoring Agent' },
      { id: 'config-manager', name: 'Configuration Manager' }
    ];
    
    const businessAgents = [
      { id: 'data-processor', name: 'Data Processing Agent' },
      { id: 'report-generator', name: 'Report Generator' },
      { id: 'notification-sender', name: 'Notification Sender' }
    ];
    
    // Register core agents first
    for (const agent of coreAgents) {
      await this.orchestrator.registerAgent({
        ...agent,
        status: 'idle'
      });
    }
    
    // Then register business agents
    for (const agent of businessAgents) {
      await this.orchestrator.registerAgent({
        ...agent,
        status: 'idle'
      });
    }
  }
  
  async healthCheck(): Promise<boolean> {
    const agents = this.orchestrator.listAgents();
    return agents.every(agent => agent.status !== 'error');
  }
}
```

### 2. Agent Lifecycle Management

```typescript
class AgentLifecycleManager {
  private orchestrator: MultiAgentOrchestrator;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  
  constructor(orchestrator: MultiAgentOrchestrator) {
    this.orchestrator = orchestrator;
  }
  
  startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      const agents = this.orchestrator.listAgents();
      
      for (const agent of agents) {
        try {
          // Perform health check (implementation depends on agent type)
          const isHealthy = await this.checkAgentHealth(agent);
          
          if (!isHealthy && agent.status !== 'error') {
            console.warn(`Agent ${agent.id} is unhealthy`);
            // Implement recovery logic
            await this.recoverAgent(agent);
          }
        } catch (error) {
          console.error(`Health check failed for agent ${agent.id}:`, error);
        }
      }
    }, 30000); // Check every 30 seconds
  }
  
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
  
  private async checkAgentHealth(agent: IAgent): Promise<boolean> {
    // Implementation depends on your agent architecture
    return agent.status !== 'error';
  }
  
  private async recoverAgent(agent: IAgent): Promise<void> {
    // Implement agent recovery logic
    console.log(`Attempting to recover agent ${agent.id}`);
  }
}
```

## Error Handling and Monitoring

### 1. Comprehensive Error Handling

```typescript
class WorkflowExecutor {
  private orchestrator: MultiAgentOrchestrator;
  private logger: Logger;
  private metrics: MetricsCollector;
  
  constructor(orchestrator: MultiAgentOrchestrator) {
    this.orchestrator = orchestrator;
    this.setupErrorHandling();
  }
  
  private setupErrorHandling(): void {
    this.orchestrator.onError(async (error) => {
      // Log error with context
      this.logger.error('Workflow execution error', {
        workflowId: error.workflowId,
        stepId: error.stepId,
        errorType: error.constructor.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      // Update metrics
      this.metrics.incrementCounter('workflow_errors_total', {
        workflow_id: error.workflowId,
        error_type: error.constructor.name
      });
      
      // Send alerts for critical errors
      if (error instanceof WorkflowExecutionError) {
        await this.sendAlert({
          severity: 'high',
          message: `Workflow ${error.workflowId} failed: ${error.message}`,
          details: error
        });
      }
      
      // Implement automatic recovery for certain error types
      if (error instanceof StepExecutionError) {
        await this.attemptStepRecovery(error);
      }
    });
  }
  
  async executeWorkflowSafely(workflowId: string, parameters?: Record<string, unknown>): Promise<WorkflowResult> {
    const startTime = Date.now();
    
    try {
      // Pre-execution validation
      await this.validateWorkflowExecution(workflowId);
      
      // Execute workflow
      const result = await this.orchestrator.executeWorkflow(workflowId, parameters);
      
      // Post-execution metrics
      const duration = Date.now() - startTime;
      this.metrics.recordHistogram('workflow_duration_ms', duration, {
        workflow_id: workflowId,
        status: result.status
      });
      
      return result;
      
    } catch (error) {
      // Handle unexpected errors
      this.logger.error('Unexpected workflow execution error', {
        workflowId,
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }
  
  private async validateWorkflowExecution(workflowId: string): Promise<void> {
    const workflow = this.orchestrator.getWorkflow(workflowId);
    if (!workflow) {
      throw new WorkflowNotFoundError(workflowId);
    }
    
    // Validate all required agents are available
    const requiredAgents = getWorkflowAgentIds(workflow);
    for (const agentId of requiredAgents) {
      const agent = this.orchestrator.getAgent(agentId);
      if (!agent) {
        throw new AgentNotFoundError(agentId);
      }
      if (agent.status === 'error') {
        throw new OrchestratorError(`Agent ${agentId} is in error state`);
      }
    }
  }
}
```

### 2. Progress Monitoring and Metrics

```typescript
class WorkflowMonitor {
  private orchestrator: MultiAgentOrchestrator;
  private activeExecutions = new Map<string, ExecutionMetrics>();
  
  constructor(orchestrator: MultiAgentOrchestrator) {
    this.orchestrator = orchestrator;
    this.setupProgressMonitoring();
  }
  
  private setupProgressMonitoring(): void {
    this.orchestrator.onProgress((progress) => {
      // Update execution metrics
      this.activeExecutions.set(progress.executionId, {
        workflowId: progress.workflowId,
        startTime: progress.startTime,
        currentStep: progress.currentStep,
        completedSteps: progress.completedSteps,
        totalSteps: progress.totalSteps,
        percentage: progress.percentage
      });
      
      // Send progress updates to monitoring dashboard
      this.sendProgressUpdate(progress);
      
      // Check for stuck workflows
      this.checkForStuckWorkflows();
    });
  }
  
  private checkForStuckWorkflows(): void {
    const now = Date.now();
    const stuckThreshold = 10 * 60 * 1000; // 10 minutes
    
    for (const [executionId, metrics] of this.activeExecutions) {
      const runtime = now - metrics.startTime.getTime();
      
      if (runtime > stuckThreshold && metrics.percentage < 100) {
        console.warn(`Workflow execution ${executionId} appears stuck`, {
          workflowId: metrics.workflowId,
          runtime: runtime,
          currentStep: metrics.currentStep,
          progress: metrics.percentage
        });
        
        // Implement stuck workflow recovery
        this.handleStuckWorkflow(executionId, metrics);
      }
    }
  }
  
  getExecutionMetrics(executionId: string): ExecutionMetrics | undefined {
    return this.activeExecutions.get(executionId);
  }
  
  getAllActiveExecutions(): ExecutionMetrics[] {
    return Array.from(this.activeExecutions.values());
  }
}
```

## Performance Optimization

### 1. Workflow Optimization

```typescript
// Use parallel execution for independent steps
const optimizedWorkflow = new WorkflowBuilder('OptimizedDataProcessing')
  .description('Optimized data processing workflow')
  
  // Parallel data extraction
  .parallel('extract-data', {
    name: 'Extract Data from Multiple Sources',
    steps: [
      {
        id: 'extract-db1',
        type: 'agent',
        name: 'Extract from Database 1',
        agentId: 'db-extractor',
        action: 'extract',
        parameters: { source: 'db1' }
      },
      {
        id: 'extract-db2',
        type: 'agent',
        name: 'Extract from Database 2',
        agentId: 'db-extractor',
        action: 'extract',
        parameters: { source: 'db2' }
      },
      {
        id: 'extract-api',
        type: 'agent',
        name: 'Extract from API',
        agentId: 'api-extractor',
        action: 'extract'
      }
    ]
  })
  
  // Sequential processing (data dependency)
  .sequential('process-data', {
    name: 'Process Extracted Data',
    dependencies: ['extract-data'],
    steps: [
      {
        id: 'clean-data',
        type: 'agent',
        name: 'Clean Data',
        agentId: 'data-cleaner',
        action: 'clean'
      },
      {
        id: 'transform-data',
        type: 'agent',
        name: 'Transform Data',
        agentId: 'data-transformer',
        action: 'transform'
      }
    ]
  })
  
  // Parallel output generation
  .parallel('generate-outputs', {
    name: 'Generate Multiple Outputs',
    dependencies: ['process-data'],
    steps: [
      {
        id: 'generate-report',
        type: 'agent',
        name: 'Generate Report',
        agentId: 'report-generator',
        action: 'generate'
      },
      {
        id: 'update-dashboard',
        type: 'agent',
        name: 'Update Dashboard',
        agentId: 'dashboard-updater',
        action: 'update'
      },
      {
        id: 'send-notifications',
        type: 'agent',
        name: 'Send Notifications',
        agentId: 'notifier',
        action: 'notify'
      }
    ]
  })
  
  .build();
```

### 2. Resource Management

```typescript
class ResourceManager {
  private maxConcurrentWorkflows = 10;
  private activeWorkflows = new Set<string>();
  private workflowQueue: Array<{ workflowId: string; parameters?: Record<string, unknown> }> = [];
  
  async executeWorkflow(
    orchestrator: MultiAgentOrchestrator,
    workflowId: string,
    parameters?: Record<string, unknown>
  ): Promise<WorkflowResult> {
    // Check if we can execute immediately
    if (this.activeWorkflows.size < this.maxConcurrentWorkflows) {
      return this.executeImmediately(orchestrator, workflowId, parameters);
    }
    
    // Queue the workflow
    return this.queueWorkflow(orchestrator, workflowId, parameters);
  }
  
  private async executeImmediately(
    orchestrator: MultiAgentOrchestrator,
    workflowId: string,
    parameters?: Record<string, unknown>
  ): Promise<WorkflowResult> {
    this.activeWorkflows.add(workflowId);
    
    try {
      const result = await orchestrator.executeWorkflow(workflowId, parameters);
      return result;
    } finally {
      this.activeWorkflows.delete(workflowId);
      
      // Process next workflow in queue
      this.processQueue(orchestrator);
    }
  }
  
  private async queueWorkflow(
    orchestrator: MultiAgentOrchestrator,
    workflowId: string,
    parameters?: Record<string, unknown>
  ): Promise<WorkflowResult> {
    return new Promise((resolve, reject) => {
      this.workflowQueue.push({
        workflowId,
        parameters,
        resolve,
        reject
      } as any);
    });
  }
  
  private async processQueue(orchestrator: MultiAgentOrchestrator): Promise<void> {
    if (this.workflowQueue.length === 0 || this.activeWorkflows.size >= this.maxConcurrentWorkflows) {
      return;
    }
    
    const next = this.workflowQueue.shift();
    if (next) {
      try {
        const result = await this.executeImmediately(orchestrator, next.workflowId, next.parameters);
        (next as any).resolve(result);
      } catch (error) {
        (next as any).reject(error);
      }
    }
  }
}
```

## Testing Strategies

### 1. Unit Testing Workflows

```typescript
describe('DataProcessingWorkflow', () => {
  let orchestrator: MultiAgentOrchestrator;
  let mockAgents: Map<string, MockAgent>;
  
  beforeEach(async () => {
    orchestrator = new MultiAgentOrchestrator();
    mockAgents = new Map();
    
    // Register mock agents
    const agentIds = ['data-processor', 'validator', 'reporter'];
    for (const agentId of agentIds) {
      const mockAgent = new MockAgent(agentId);
      mockAgents.set(agentId, mockAgent);
      await orchestrator.registerAgent(mockAgent);
    }
  });
  
  it('should process data successfully', async () => {
    // Arrange
    const workflow = createDataProcessingWorkflow();
    await orchestrator.registerWorkflow(workflow);
    
    // Configure mock responses
    mockAgents.get('data-processor')?.setResponse('process', { success: true, records: 100 });
    mockAgents.get('validator')?.setResponse('validate', { valid: true, errors: [] });
    mockAgents.get('reporter')?.setResponse('generate', { reportId: 'report-123' });
    
    // Act
    const result = await orchestrator.executeWorkflow(workflow.id);
    
    // Assert
    expect(result.status).toBe(WorkflowStatus.COMPLETED);
    expect(result.steps).toHaveLength(3);
    expect(result.steps.every(step => step.status === StepStatus.COMPLETED)).toBe(true);
  });
  
  it('should handle validation failure', async () => {
    // Arrange
    const workflow = createDataProcessingWorkflow();
    await orchestrator.registerWorkflow(workflow);
    
    // Configure mock responses
    mockAgents.get('data-processor')?.setResponse('process', { success: true, records: 100 });
    mockAgents.get('validator')?.setResponse('validate', { valid: false, errors: ['Invalid format'] });
    
    // Act
    const result = await orchestrator.executeWorkflow(workflow.id);
    
    // Assert
    expect(result.status).toBe(WorkflowStatus.FAILED);
    expect(result.steps.find(s => s.stepId === 'validate-data')?.status).toBe(StepStatus.FAILED);
  });
});
```

### 2. Integration Testing

```typescript
describe('WorkflowIntegration', () => {
  let orchestrator: MultiAgentOrchestrator;
  let testDatabase: TestDatabase;
  let testApiServer: TestApiServer;
  
  beforeAll(async () => {
    // Set up test infrastructure
    testDatabase = new TestDatabase();
    await testDatabase.start();
    
    testApiServer = new TestApiServer();
    await testApiServer.start();
    
    // Create orchestrator with real agents
    orchestrator = new MultiAgentOrchestrator();
    await setupRealAgents(orchestrator, testDatabase, testApiServer);
  });
  
  afterAll(async () => {
    await testDatabase.stop();
    await testApiServer.stop();
  });
  
  it('should execute end-to-end data pipeline', async () => {
    // Arrange
    await testDatabase.seedData('test-data.sql');
    const workflow = createDataPipelineWorkflow();
    await orchestrator.registerWorkflow(workflow);
    
    // Act
    const result = await orchestrator.executeWorkflow(workflow.id, {
      inputTable: 'test_input',
      outputTable: 'test_output'
    });
    
    // Assert
    expect(result.status).toBe(WorkflowStatus.COMPLETED);
    
    // Verify data was processed correctly
    const outputData = await testDatabase.query('SELECT * FROM test_output');
    expect(outputData).toHaveLength(100);
  });
});
```

## Security Considerations

### 1. Secure Parameter Handling

```typescript
class SecureWorkflowExecutor {
  private secretsManager: SecretsManager;
  
  constructor(secretsManager: SecretsManager) {
    this.secretsManager = secretsManager;
  }
  
  async executeWorkflowSecurely(
    orchestrator: MultiAgentOrchestrator,
    workflowId: string,
    parameters: Record<string, unknown>
  ): Promise<WorkflowResult> {
    // Sanitize and validate parameters
    const sanitizedParameters = this.sanitizeParameters(parameters);
    
    // Inject secrets securely
    const parametersWithSecrets = await this.injectSecrets(sanitizedParameters);
    
    try {
      return await orchestrator.executeWorkflow(workflowId, parametersWithSecrets);
    } finally {
      // Clear sensitive data from memory
      this.clearSensitiveData(parametersWithSecrets);
    }
  }
  
  private sanitizeParameters(parameters: Record<string, unknown>): Record<string, unknown> {
    // Remove potentially dangerous parameters
    const sanitized = { ...parameters };
    delete sanitized.__proto__;
    delete sanitized.constructor;
    
    // Validate parameter types and values
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        // Prevent injection attacks
        sanitized[key] = value.replace(/[<>'"]/g, '');
      }
    }
    
    return sanitized;
  }
  
  private async injectSecrets(parameters: Record<string, unknown>): Promise<Record<string, unknown>> {
    const result = { ...parameters };
    
    // Replace secret references with actual values
    for (const [key, value] of Object.entries(result)) {
      if (typeof value === 'string' && value.startsWith('secret:')) {
        const secretName = value.substring(7);
        result[key] = await this.secretsManager.getSecret(secretName);
      }
    }
    
    return result;
  }
  
  private clearSensitiveData(parameters: Record<string, unknown>): void {
    // Clear sensitive data from memory
    for (const key of Object.keys(parameters)) {
      if (key.toLowerCase().includes('password') || 
          key.toLowerCase().includes('token') || 
          key.toLowerCase().includes('secret')) {
        delete parameters[key];
      }
    }
  }
}
```

These best practices will help you build robust, scalable, and maintainable multi-agent workflows using the MPLP Orchestrator. Remember to adapt these patterns to your specific use cases and requirements.
