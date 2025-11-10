# MPLP Development Best Practices

> **🎯 Goal**: Master MPLP development best practices and design patterns  
> **📚 Audience**: All MPLP developers  
> **🌐 Language**: English | [中文](../../docs-sdk/guides/best-practices.md)

---

## 📋 **Table of Contents**

1. [Architecture Design Principles](#architecture-design-principles)
2. [Code Organization](#code-organization)
3. [Module Usage](#module-usage)
4. [Error Handling](#error-handling)
5. [Performance Optimization](#performance-optimization)
6. [Security Practices](#security-practices)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Recommendations](#deployment-recommendations)

---

## 🏗️ **Architecture Design Principles**

### **1.1 Single Responsibility Principle**

Each Agent should focus on a single responsibility.

**❌ Not Recommended**:
```typescript
class SuperAgent {
  async processData() { }
  async sendEmail() { }
  async generateReport() { }
  async manageUsers() { }
  // Too many responsibilities
}
```

**✅ Recommended**:
```typescript
class DataProcessingAgent {
  async processData() { }
}

class EmailAgent {
  async sendEmail() { }
}

class ReportAgent {
  async generateReport() { }
}
```

### **1.2 Dependency Injection**

Use dependency injection to improve testability and flexibility.

**✅ Recommended**:
```typescript
export class MyAgent {
  constructor(
    private mplp: MPLP,
    private logger: Logger,
    private config: AgentConfig
  ) {}
}

// Usage
const agent = new MyAgent(mplp, logger, config);
```

### **1.3 Interface Segregation**

Define clear interfaces, avoid overly large interfaces.

**✅ Recommended**:
```typescript
interface ITaskExecutor {
  execute(task: Task): Promise<TaskResult>;
}

interface ITaskMonitor {
  monitor(taskId: string): TaskStatus;
}

interface ITaskManager {
  create(task: Task): Promise<void>;
  cancel(taskId: string): Promise<void>;
}
```

---

## 📁 **Code Organization**

### **2.1 Recommended Project Structure**

```
my-agent/
├── src/
│   ├── config/              # Configuration files
│   │   ├── index.ts
│   │   └── agent.config.ts
│   ├── core/                # Core logic
│   │   ├── Agent.ts
│   │   └── Lifecycle.ts
│   ├── services/            # Business services
│   │   ├── TaskService.ts
│   │   └── ContextService.ts
│   ├── models/              # Data models
│   │   └── Task.ts
│   ├── types/               # Type definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── helpers.ts
│   └── index.ts             # Entry file
├── tests/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                    # Documentation
├── package.json
└── tsconfig.json
```

### **2.2 Naming Conventions**

**File Naming**:
- Class files: `PascalCase.ts` (e.g., `TaskAgent.ts`)
- Utility files: `camelCase.ts` (e.g., `helpers.ts`)
- Test files: `*.test.ts` or `*.spec.ts`

**Variable Naming**:
- Constants: `UPPER_SNAKE_CASE`
- Variables: `camelCase`
- Classes: `PascalCase`
- Interfaces: `IPascalCase` or `PascalCase`

---

## 📦 **Module Usage**

### **3.1 Load Modules On-Demand**

Only load the modules you need to improve startup speed.

**✅ Recommended**:
```typescript
const mplp = await createMPLP({
  modules: ['context', 'plan', 'role']  // Only load needed modules
});
```

**❌ Not Recommended**:
```typescript
const mplp = await quickStart();  // Loads all 10 modules (if not needed)
```

### **3.2 Module Initialization Check**

Always check if modules are successfully loaded.

**✅ Recommended**:
```typescript
const contextModule = mplp.getModule('context');
if (!contextModule) {
  throw new Error('Context module not loaded');
}

// Safe to use
await contextModule.createContext(data);
```

### **3.3 Module Reuse**

Cache module references within the Agent.

**✅ Recommended**:
```typescript
export class MyAgent {
  private contextModule: any;
  private planModule: any;

  async initialize() {
    this.contextModule = this.mplp.getModule('context');
    this.planModule = this.mplp.getModule('plan');
  }

  async doWork() {
    // Use cached references directly
    await this.contextModule.createContext(data);
  }
}
```

---

## 🚨 **Error Handling**

### **4.1 Use Custom Error Classes**

Define clear error types.

**✅ Recommended**:
```typescript
export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export class TaskExecutionError extends AgentError {
  constructor(taskId: string, cause: Error) {
    super(
      `Task execution failed: ${taskId}`,
      'TASK_EXECUTION_FAILED',
      { taskId, cause }
    );
  }
}

// Usage
throw new TaskExecutionError(task.id, error);
```

### **4.2 Graceful Error Handling**

**✅ Recommended**:
```typescript
async function executeTask(task: Task): Promise<TaskResult> {
  try {
    const result = await processTask(task);
    return { success: true, result };
  } catch (error) {
    logger.error('Task execution failed', {
      taskId: task.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}
```

### **4.3 Error Recovery Strategy**

Implement retry mechanism.

**✅ Recommended**:
```typescript
async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Usage
const result = await executeWithRetry(
  () => agent.executeTask(taskId),
  3,
  2000
);
```

---

## ⚡ **Performance Optimization**

### **5.1 Use Connection Pools**

Use connection pools for frequent operations.

**✅ Recommended**:
```typescript
class AgentPool {
  private agents: MyAgent[] = [];
  private available: MyAgent[] = [];

  async acquire(): Promise<MyAgent> {
    if (this.available.length > 0) {
      return this.available.pop()!;
    }
    
    const agent = new MyAgent();
    await agent.initialize();
    this.agents.push(agent);
    return agent;
  }

  release(agent: MyAgent): void {
    this.available.push(agent);
  }
}
```

### **5.2 Batch Operations**

Process tasks in batches instead of one by one.

**✅ Recommended**:
```typescript
async function processBatch(tasks: Task[]): Promise<TaskResult[]> {
  // Parallel processing
  return Promise.all(
    tasks.map(task => agent.executeTask(task.id))
  );
}
```

**❌ Not Recommended**:
```typescript
async function processSequential(tasks: Task[]): Promise<TaskResult[]> {
  const results = [];
  for (const task of tasks) {
    results.push(await agent.executeTask(task.id));  // Sequential processing
  }
  return results;
}
```

### **5.3 Caching Strategy**

Cache frequently accessed data.

**✅ Recommended**:
```typescript
class CachedAgent {
  private cache = new Map<string, any>();
  private cacheTTL = 60000; // 60 seconds

  async getData(key: string): Promise<any> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    const data = await this.fetchData(key);
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}
```

---

## 🔒 **Security Practices**

### **6.1 Input Validation**

Always validate input data.

**✅ Recommended**:
```typescript
function validateTask(task: unknown): Task {
  if (!task || typeof task !== 'object') {
    throw new Error('Invalid task: must be an object');
  }

  const t = task as any;
  
  if (!t.name || typeof t.name !== 'string') {
    throw new Error('Invalid task: name is required');
  }

  if (!t.description || typeof t.description !== 'string') {
    throw new Error('Invalid task: description is required');
  }

  return t as Task;
}
```

### **6.2 Sensitive Information Handling**

Don't log sensitive information.

**✅ Recommended**:
```typescript
function sanitizeForLog(data: any): any {
  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '***REDACTED***';
    }
  }
  
  return sanitized;
}

logger.info('User data', sanitizeForLog(userData));
```

### **6.3 Use Environment Variables**

Use environment variables for sensitive configuration.

**✅ Recommended**:
```typescript
import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  apiKey: process.env.API_KEY,
  dbPassword: process.env.DB_PASSWORD,
  // Don't hardcode sensitive information
};
```

---

## 🧪 **Testing Strategy**

### **7.1 Testing Pyramid**

Follow the testing pyramid principle.

```
        /\
       /E2E\        10% - End-to-end tests
      /------\
     /  Integ \     20% - Integration tests
    /----------\
   /    Unit    \   70% - Unit tests
  /--------------\
```

### **7.2 Unit Testing**

**✅ Recommended**:
```typescript
describe('TaskAgent', () => {
  let agent: TaskAgent;
  let mockMPLP: jest.Mocked<MPLP>;

  beforeEach(() => {
    mockMPLP = {
      initialize: jest.fn(),
      getModule: jest.fn(),
      // ...
    } as any;

    agent = new TaskAgent(mockMPLP);
  });

  it('should create task', async () => {
    const task = await agent.createTask('Test', 'Description');
    expect(task.name).toBe('Test');
  });
});
```

### **7.3 Integration Testing**

**✅ Recommended**:
```typescript
describe('TaskAgent Integration', () => {
  let agent: TaskAgent;
  let mplp: MPLP;

  beforeAll(async () => {
    mplp = await createTestMPLP();
    agent = new TaskAgent(mplp);
    await agent.initialize();
  });

  afterAll(async () => {
    await agent.shutdown();
  });

  it('should execute task end-to-end', async () => {
    const task = await agent.createTask('Integration Test', 'Test');
    const result = await agent.executeTask(task.id);
    expect(result.success).toBe(true);
  });
});
```

---

## 🚀 **Deployment Recommendations**

### **8.1 Environment Configuration**

Use different configurations for different environments.

**✅ Recommended**:
```typescript
const config = {
  development: {
    logLevel: 'debug',
    modules: ['context', 'plan', 'role', 'trace']
  },
  production: {
    logLevel: 'warn',
    modules: ['context', 'plan', 'role', 'core']
  },
  test: {
    logLevel: 'error',
    modules: ['context', 'plan']
  }
};

const env = process.env.NODE_ENV || 'development';
const mplp = await createMPLP(config[env]);
```

### **8.2 Health Checks**

Implement health check endpoints.

**✅ Recommended**:
```typescript
export class HealthCheck {
  constructor(private agent: MyAgent) {}

  async check(): Promise<HealthStatus> {
    return {
      status: this.agent.isInitialized() ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: MPLP_VERSION,
      uptime: process.uptime()
    };
  }
}
```

### **8.3 Graceful Shutdown**

Implement graceful shutdown mechanism.

**✅ Recommended**:
```typescript
async function gracefulShutdown(agent: MyAgent) {
  console.log('Received shutdown signal');
  
  // Stop accepting new tasks
  agent.stopAcceptingTasks();
  
  // Wait for active tasks to complete
  await agent.waitForActiveTasks(30000); // 30 second timeout
  
  // Shutdown Agent
  await agent.shutdown();
  
  console.log('Shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown(agent));
process.on('SIGINT', () => gracefulShutdown(agent));
```

---

## 📚 **Summary**

Following these best practices will help you:
- ✅ Build maintainable code
- ✅ Improve application performance
- ✅ Enhance system security
- ✅ Simplify testing and deployment

## 🔗 **Related Resources**

- [Architecture Guide](architecture.md)
- [Testing Guide](testing.md)
- [Deployment Guide](deployment.md)
- [API Reference](../api-reference/sdk-core.md)

---

**Version**: v1.1.0-beta  
**Last Updated**: 2025-10-22  
**Maintainer**: MPLP Team

