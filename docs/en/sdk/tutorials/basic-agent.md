# Basic Agent Development Tutorial

> **🎯 Learning Objectives**: Master core MPLP Agent development patterns  
> **⏱️ Estimated Time**: 45 minutes  
> **📚 Prerequisites**: TypeScript basics, asynchronous programming  
> **🌐 Language**: English | [中文](../../docs-sdk/tutorials/basic-agent.md)

---

## 📋 **Tutorial Overview**

This tutorial provides in-depth coverage of developing a fully functional MPLP Agent, including:

1. ✅ Agent architecture design
2. ✅ Module integration and usage
3. ✅ State management
4. ✅ Error handling
5. ✅ Testing and debugging

---

## 🏗️ **Part 1: Agent Architecture Design**

### **1.1 Understanding Agent Structure**

A standard MPLP Agent contains the following components:

```
Agent
├── Configuration Layer
│   ├── Environment configuration
│   ├── Module configuration
│   └── Custom configuration
├── Core Logic Layer
│   ├── Initialization logic
│   ├── Business logic
│   └── Lifecycle management
├── Module Integration Layer
│   ├── Context management
│   ├── Plan orchestration
│   └── Role permissions
└── Error Handling Layer
    ├── Exception capture
    ├── Error recovery
    └── Logging
```

### **1.2 Design Principles**

**SOLID Principles Application**:
- **S**ingle Responsibility: Each Agent focuses on a single responsibility
- **O**pen/Closed: Extend through configuration, don't modify core code
- **L**iskov Substitution: Agents are interchangeable
- **I**nterface Segregation: Clear module interface separation
- **D**ependency Inversion: Depend on abstractions, not concrete implementations

---

## 💻 **Part 2: Implementing Complete Agent**

### **2.1 Project Structure**

```
task-agent/
├── src/
│   ├── config/
│   │   ├── agent.config.ts      # Agent configuration
│   │   └── module.config.ts     # Module configuration
│   ├── core/
│   │   ├── TaskAgent.ts         # Agent main class
│   │   └── AgentLifecycle.ts    # Lifecycle management
│   ├── services/
│   │   ├── TaskService.ts       # Task service
│   │   └── ContextService.ts    # Context service
│   ├── types/
│   │   └── index.ts             # Type definitions
│   └── index.ts                 # Entry file
├── tests/
│   ├── unit/                    # Unit tests
│   └── integration/             # Integration tests
└── package.json
```

### **2.2 Configuration Layer Implementation**

**config/agent.config.ts**:
```typescript
import { MPLPConfig } from 'mplp';

export interface TaskAgentConfig extends MPLPConfig {
  customConfig: {
    maxConcurrentTasks: number;
    taskTimeout: number;
    retryAttempts: number;
  };
}

export const defaultConfig: TaskAgentConfig = {
  protocolVersion: '1.1.0',
  environment: 'development',
  logLevel: 'info',
  modules: ['context', 'plan', 'role', 'trace'],
  customConfig: {
    maxConcurrentTasks: 5,
    taskTimeout: 30000,  // 30 seconds
    retryAttempts: 3
  }
};
```

### **2.3 Type Definitions**

**types/index.ts**:
```typescript
import { UUID } from 'mplp';

export interface Task {
  id: UUID;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface TaskResult {
  taskId: UUID;
  success: boolean;
  result?: any;
  error?: Error;
  duration: number;
}
```

### **2.4 Core Agent Implementation**

**core/TaskAgent.ts**:
```typescript
import { MPLP } from 'mplp';
import { TaskAgentConfig, defaultConfig } from '../config/agent.config';
import { Task, TaskResult, TaskStatus } from '../types';
import { TaskService } from '../services/TaskService';
import { ContextService } from '../services/ContextService';

export class TaskAgent {
  private mplp: MPLP;
  private config: TaskAgentConfig;
  private taskService: TaskService;
  private contextService: ContextService;
  private initialized: boolean = false;
  private activeTasks: Map<string, Task> = new Map();

  constructor(config: Partial<TaskAgentConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.mplp = new MPLP(this.config);
    this.taskService = new TaskService();
    this.contextService = new ContextService();
  }

  /**
   * Initialize Agent
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('⚠️  TaskAgent already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing TaskAgent...');
      
      // Initialize MPLP
      await this.mplp.initialize();
      
      // Initialize services
      await this.taskService.initialize(this.mplp);
      await this.contextService.initialize(this.mplp);
      
      this.initialized = true;
      console.log('✅ TaskAgent initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize TaskAgent:', error);
      throw error;
    }
  }

  /**
   * Create task
   */
  async createTask(
    name: string,
    description: string,
    priority: TaskPriority = TaskPriority.MEDIUM
  ): Promise<Task> {
    this.ensureInitialized();

    const task: Task = {
      id: this.generateTaskId(),
      name,
      description,
      status: TaskStatus.PENDING,
      priority,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create context using Context module
    await this.contextService.createTaskContext(task);
    
    // Create execution plan using Plan module
    await this.taskService.createTaskPlan(task);
    
    this.activeTasks.set(task.id, task);
    console.log(`📋 Task created: ${task.name} (${task.id})`);
    
    return task;
  }

  /**
   * Execute task
   */
  async executeTask(taskId: string): Promise<TaskResult> {
    this.ensureInitialized();

    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const startTime = Date.now();
    
    try {
      console.log(`▶️  Executing task: ${task.name}`);
      
      // Update task status
      task.status = TaskStatus.RUNNING;
      task.updatedAt = new Date();
      
      // Track execution using Trace module
      const traceModule = this.mplp.getModule('trace');
      if (traceModule) {
        // Start tracing
      }
      
      // Execute task logic
      const result = await this.taskService.execute(task);
      
      // Update task status
      task.status = TaskStatus.COMPLETED;
      task.updatedAt = new Date();
      
      const duration = Date.now() - startTime;
      console.log(`✅ Task completed: ${task.name} (${duration}ms)`);
      
      return {
        taskId: task.id,
        success: true,
        result,
        duration
      };
      
    } catch (error) {
      task.status = TaskStatus.FAILED;
      task.updatedAt = new Date();
      
      const duration = Date.now() - startTime;
      console.error(`❌ Task failed: ${task.name}`, error);
      
      return {
        taskId: task.id,
        success: false,
        error: error as Error,
        duration
      };
    }
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): TaskStatus | undefined {
    const task = this.activeTasks.get(taskId);
    return task?.status;
  }

  /**
   * Get all active tasks
   */
  getActiveTasks(): Task[] {
    return Array.from(this.activeTasks.values());
  }

  /**
   * Cancel task
   */
  async cancelTask(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    if (task.status === TaskStatus.RUNNING) {
      task.status = TaskStatus.CANCELLED;
      task.updatedAt = new Date();
      console.log(`🛑 Task cancelled: ${task.name}`);
    }
  }

  /**
   * Shutdown Agent
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down TaskAgent...');
    
    // Cancel all running tasks
    for (const task of this.activeTasks.values()) {
      if (task.status === TaskStatus.RUNNING) {
        await this.cancelTask(task.id);
      }
    }
    
    this.activeTasks.clear();
    this.initialized = false;
    
    console.log('✅ TaskAgent shutdown complete');
  }

  /**
   * Ensure initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('TaskAgent not initialized. Call initialize() first.');
    }
  }

  /**
   * Generate task ID
   */
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### **2.5 Service Layer Implementation**

**services/TaskService.ts**:
```typescript
import { MPLP } from 'mplp';
import { Task } from '../types';

export class TaskService {
  private mplp?: MPLP;

  async initialize(mplp: MPLP): Promise<void> {
    this.mplp = mplp;
  }

  async createTaskPlan(task: Task): Promise<void> {
    const planModule = this.mplp?.getModule('plan');
    if (!planModule) {
      console.warn('Plan module not available');
      return;
    }

    // Create task execution plan
    console.log(`📝 Creating plan for task: ${task.name}`);
  }

  async execute(task: Task): Promise<any> {
    // Simulate task execution
    await this.delay(1000);
    return { message: `Task ${task.name} executed successfully` };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

**services/ContextService.ts**:
```typescript
import { MPLP } from 'mplp';
import { Task } from '../types';

export class ContextService {
  private mplp?: MPLP;

  async initialize(mplp: MPLP): Promise<void> {
    this.mplp = mplp;
  }

  async createTaskContext(task: Task): Promise<void> {
    const contextModule = this.mplp?.getModule('context');
    if (!contextModule) {
      console.warn('Context module not available');
      return;
    }

    // Create task context
    console.log(`🔧 Creating context for task: ${task.name}`);
  }
}
```

---

## 🧪 **Part 3: Testing Agent**

### **3.1 Unit Tests**

**tests/unit/TaskAgent.test.ts**:
```typescript
import { TaskAgent } from '../../src/core/TaskAgent';
import { TaskPriority, TaskStatus } from '../../src/types';

describe('TaskAgent', () => {
  let agent: TaskAgent;

  beforeEach(async () => {
    agent = new TaskAgent();
    await agent.initialize();
  });

  afterEach(async () => {
    await agent.shutdown();
  });

  it('should create a task', async () => {
    const task = await agent.createTask(
      'Test Task',
      'This is a test task',
      TaskPriority.HIGH
    );

    expect(task.name).toBe('Test Task');
    expect(task.status).toBe(TaskStatus.PENDING);
    expect(task.priority).toBe(TaskPriority.HIGH);
  });

  it('should execute a task', async () => {
    const task = await agent.createTask('Execute Test', 'Test execution');
    const result = await agent.executeTask(task.id);

    expect(result.success).toBe(true);
    expect(result.taskId).toBe(task.id);
    expect(agent.getTaskStatus(task.id)).toBe(TaskStatus.COMPLETED);
  });

  it('should cancel a running task', async () => {
    const task = await agent.createTask('Cancel Test', 'Test cancellation');
    await agent.cancelTask(task.id);

    expect(agent.getTaskStatus(task.id)).toBe(TaskStatus.CANCELLED);
  });
});
```

### **3.2 Running Tests**

```bash
# Install test dependencies
npm install -D jest @types/jest ts-jest

# Run tests
npm test
```

---

## 📚 **Part 4: Using the Agent**

### **4.1 Basic Usage**

```typescript
import { TaskAgent } from './core/TaskAgent';
import { TaskPriority } from './types';

async function main() {
  const agent = new TaskAgent();
  
  try {
    // Initialize
    await agent.initialize();
    
    // Create task
    const task = await agent.createTask(
      'Process Data',
      'Process user data',
      TaskPriority.HIGH
    );
    
    // Execute task
    const result = await agent.executeTask(task.id);
    console.log('Result:', result);
    
    // Shutdown
    await agent.shutdown();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

---

## 🎯 **Summary**

You have learned:
- ✅ Design Agent architecture
- ✅ Implement complete Agent class
- ✅ Integrate MPLP modules
- ✅ Write test cases
- ✅ Handle errors and exceptions

## 📚 **Next Steps**

- [Multi-Agent Collaboration](multi-agent-workflow.md)
- [Best Practices Guide](../guides/best-practices.md)
- [Complete Examples](../examples/)

---

**Version**: v1.1.0  
**Last Updated**: 2025-10-22  
**Author**: MPLP Team

