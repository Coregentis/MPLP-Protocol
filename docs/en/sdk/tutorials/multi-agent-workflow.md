# Multi-Agent Workflow Tutorial

> **🎯 Learning Objectives**: Master multi-agent collaboration and workflow orchestration  
> **⏱️ Estimated Time**: 60 minutes  
> **📚 Prerequisites**: Basic Agent development, TypeScript async programming  
> **🌐 Language**: English | [中文](../../docs-sdk/tutorials/multi-agent-workflow.md)

---

## 📋 **Tutorial Overview**

This tutorial provides in-depth coverage of building multi-agent collaboration systems, including:

1. ✅ Inter-agent communication mechanisms
2. ✅ Workflow orchestration patterns
3. ✅ Coordination strategies
4. ✅ Error handling and recovery
5. ✅ Performance optimization

---

## 🏗️ **Part 1: Multi-Agent Architecture Design**

### **1.1 Collaboration Patterns**

**Master-Worker Pattern**:
```
Master Agent
    ├── Worker Agent 1
    ├── Worker Agent 2
    └── Worker Agent 3
```

**Pipeline Pattern**:
```
Agent A → Agent B → Agent C → Agent D
```

**Publish-Subscribe Pattern**:
```
        Event Bus
       /    |    \
Agent A  Agent B  Agent C
```

### **1.2 Communication Mechanisms**

**Direct Invocation**:
```typescript
const result = await agentB.processData(data);
```

**Event-Driven**:
```typescript
eventBus.emit('task.completed', { taskId, result });
```

**Message Queue**:
```typescript
await messageQueue.publish('task.queue', task);
```

---

## 💻 **Part 2: Implementing Collaboration System**

### **2.1 Project Structure**

```
multi-agent-system/
├── src/
│   ├── agents/
│   │   ├── MasterAgent.ts
│   │   ├── WorkerAgent.ts
│   │   └── CoordinatorAgent.ts
│   ├── core/
│   │   ├── EventBus.ts
│   │   ├── MessageQueue.ts
│   │   └── WorkflowEngine.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── tests/
└── package.json
```

### **2.2 Event Bus Implementation**

**core/EventBus.ts**:
```typescript
type EventHandler = (data: any) => void | Promise<void>;

export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  /**
   * Subscribe to event
   */
  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  /**
   * Unsubscribe from event
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Publish event
   */
  async emit(event: string, data: any): Promise<void> {
    const handlers = this.handlers.get(event);
    if (!handlers) return;

    const promises = Array.from(handlers).map(handler => 
      Promise.resolve(handler(data))
    );

    await Promise.all(promises);
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.handlers.clear();
  }
}
```

### **2.3 Master Agent Implementation**

**agents/MasterAgent.ts**:
```typescript
import { MPLP, createMPLP } from 'mplp';
import { EventBus } from '../core/EventBus';
import { WorkerAgent } from './WorkerAgent';

export class MasterAgent {
  private mplp?: MPLP;
  private eventBus: EventBus;
  private workers: WorkerAgent[] = [];
  private initialized: boolean = false;

  constructor(private workerCount: number = 3) {
    this.eventBus = new EventBus();
  }

  /**
   * Initialize Master and Workers
   */
  async initialize(): Promise<void> {
    console.log('🚀 Initializing MasterAgent...');

    // Initialize MPLP
    this.mplp = await createMPLP({
      modules: ['context', 'plan', 'core', 'collab']
    });

    // Create Worker Agents
    for (let i = 0; i < this.workerCount; i++) {
      const worker = new WorkerAgent(`worker-${i + 1}`, this.eventBus);
      await worker.initialize();
      this.workers.push(worker);
    }

    // Subscribe to Worker completion events
    this.eventBus.on('worker.completed', this.handleWorkerCompleted.bind(this));
    this.eventBus.on('worker.failed', this.handleWorkerFailed.bind(this));

    this.initialized = true;
    console.log(`✅ MasterAgent initialized, ${this.workerCount} Workers ready`);
  }

  /**
   * Distribute task to Workers
   */
  async distributeTask(task: any): Promise<void> {
    console.log(`📋 Distributing task: ${task.name}`);

    // Use Collab module for coordination
    const collabModule = this.mplp?.getModule('collab');
    if (collabModule) {
      console.log('🤝 Using Collab module to coordinate task distribution');
    }

    // Find available Worker
    const availableWorker = this.workers.find(w => w.isAvailable());
    
    if (!availableWorker) {
      console.warn('⚠️  No available Workers, task queued');
      // Implement task queue logic
      return;
    }

    // Assign task
    await availableWorker.executeTask(task);
  }

  /**
   * Process batch of tasks
   */
  async processBatch(tasks: any[]): Promise<void> {
    console.log(`📦 Processing batch of ${tasks.length} tasks`);

    // Distribute tasks in parallel
    await Promise.all(
      tasks.map(task => this.distributeTask(task))
    );
  }

  /**
   * Handle Worker completion event
   */
  private async handleWorkerCompleted(data: any): Promise<void> {
    console.log(`✅ Worker ${data.workerId} completed task: ${data.taskId}`);
    
    // Use Context module to record result
    const contextModule = this.mplp?.getModule('context');
    if (contextModule) {
      // Save task result to context
    }
  }

  /**
   * Handle Worker failure event
   */
  private async handleWorkerFailed(data: any): Promise<void> {
    console.error(`❌ Worker ${data.workerId} task failed: ${data.taskId}`);
    
    // Retry logic
    if (data.retryCount < 3) {
      console.log(`🔄 Retrying task (${data.retryCount + 1}/3)`);
      await this.distributeTask({
        ...data.task,
        retryCount: data.retryCount + 1
      });
    }
  }

  /**
   * Shutdown all Agents
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down MasterAgent and all Workers...');

    await Promise.all(
      this.workers.map(worker => worker.shutdown())
    );

    this.eventBus.clear();
    this.initialized = false;

    console.log('✅ Shutdown complete');
  }
}
```

### **2.4 Worker Agent Implementation**

**agents/WorkerAgent.ts**:
```typescript
import { MPLP, createMPLP } from 'mplp';
import { EventBus } from '../core/EventBus';

export class WorkerAgent {
  private mplp?: MPLP;
  private available: boolean = true;

  constructor(
    private workerId: string,
    private eventBus: EventBus
  ) {}

  /**
   * Initialize Worker
   */
  async initialize(): Promise<void> {
    this.mplp = await createMPLP({
      modules: ['context', 'trace']
    });
    console.log(`✅ Worker ${this.workerId} initialized`);
  }

  /**
   * Execute task
   */
  async executeTask(task: any): Promise<void> {
    this.available = false;
    console.log(`⚙️  Worker ${this.workerId} executing: ${task.name}`);

    try {
      // Use Trace module to track execution
      const traceModule = this.mplp?.getModule('trace');
      if (traceModule) {
        // Start tracing
      }

      // Simulate task execution
      await this.delay(Math.random() * 2000 + 1000);

      // Publish completion event
      await this.eventBus.emit('worker.completed', {
        workerId: this.workerId,
        taskId: task.id,
        result: { success: true }
      });

    } catch (error) {
      // Publish failure event
      await this.eventBus.emit('worker.failed', {
        workerId: this.workerId,
        taskId: task.id,
        task,
        error,
        retryCount: task.retryCount || 0
      });

    } finally {
      this.available = true;
    }
  }

  /**
   * Check if available
   */
  isAvailable(): boolean {
    return this.available;
  }

  /**
   * Shutdown Worker
   */
  async shutdown(): Promise<void> {
    console.log(`🛑 Shutting down Worker ${this.workerId}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### **2.5 Workflow Engine Implementation**

**core/WorkflowEngine.ts**:
```typescript
import { EventBus } from './EventBus';

interface WorkflowStep {
  name: string;
  agent: any;
  execute: (input: any) => Promise<any>;
}

export class WorkflowEngine {
  private steps: WorkflowStep[] = [];
  private eventBus: EventBus;

  constructor() {
    this.eventBus = new EventBus();
  }

  /**
   * Add workflow step
   */
  addStep(step: WorkflowStep): void {
    this.steps.push(step);
  }

  /**
   * Execute workflow
   */
  async execute(initialInput: any): Promise<any> {
    console.log('🔄 Starting workflow execution...');
    
    let currentInput = initialInput;

    for (const [index, step] of this.steps.entries()) {
      console.log(`📍 Step ${index + 1}/${this.steps.length}: ${step.name}`);
      
      try {
        currentInput = await step.execute(currentInput);
        
        await this.eventBus.emit('workflow.step.completed', {
          stepIndex: index,
          stepName: step.name,
          output: currentInput
        });

      } catch (error) {
        console.error(`❌ Step ${step.name} failed:`, error);
        
        await this.eventBus.emit('workflow.step.failed', {
          stepIndex: index,
          stepName: step.name,
          error
        });

        throw error;
      }
    }

    console.log('✅ Workflow execution complete');
    return currentInput;
  }

  /**
   * Subscribe to workflow events
   */
  on(event: string, handler: (data: any) => void): void {
    this.eventBus.on(event, handler);
  }
}
```

---

## 🧪 **Part 3: Usage Examples**

### **3.1 Master-Worker Pattern**

```typescript
import { MasterAgent } from './agents/MasterAgent';

async function masterWorkerExample() {
  const master = new MasterAgent(3);
  await master.initialize();

  // Process batch of tasks
  const tasks = [
    { id: 1, name: 'Task 1', data: 'data1' },
    { id: 2, name: 'Task 2', data: 'data2' },
    { id: 3, name: 'Task 3', data: 'data3' },
    { id: 4, name: 'Task 4', data: 'data4' },
    { id: 5, name: 'Task 5', data: 'data5' }
  ];

  await master.processBatch(tasks);

  // Wait for all tasks to complete
  await new Promise(resolve => setTimeout(resolve, 5000));

  await master.shutdown();
}
```

### **3.2 Pipeline Pattern**

```typescript
import { WorkflowEngine } from './core/WorkflowEngine';

async function pipelineExample() {
  const workflow = new WorkflowEngine();

  // Add workflow steps
  workflow.addStep({
    name: 'Data Collection',
    agent: null,
    execute: async (input) => {
      console.log('📥 Collecting data...');
      return { ...input, collected: true };
    }
  });

  workflow.addStep({
    name: 'Data Processing',
    agent: null,
    execute: async (input) => {
      console.log('⚙️  Processing data...');
      return { ...input, processed: true };
    }
  });

  workflow.addStep({
    name: 'Data Storage',
    agent: null,
    execute: async (input) => {
      console.log('💾 Storing data...');
      return { ...input, stored: true };
    }
  });

  // Execute workflow
  const result = await workflow.execute({ data: 'initial' });
  console.log('Final result:', result);
}
```

---

## 📚 **Summary**

You have learned:
- ✅ Design multi-agent collaboration architecture
- ✅ Implement event-driven communication
- ✅ Build Master-Worker pattern
- ✅ Create Pipeline workflows
- ✅ Handle errors in collaboration

## 🔗 **Next Steps**

- [Best Practices Guide](../guides/best-practices.md)
- [Architecture Guide](../guides/architecture.md)
- [Performance Optimization](../guides/performance.md)
- [API Reference](../api-reference/sdk-core.md)

---

**Version**: v1.1.0-beta  
**Last Updated**: 2025-10-22  
**Author**: MPLP Team

