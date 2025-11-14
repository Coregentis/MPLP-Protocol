# MPLP开发最佳实践

> **🎯 目标**: 掌握MPLP开发的最佳实践和设计模式  
> **📚 适用对象**: 所有MPLP开发者  
> **🌐 语言**: [English](../../docs-sdk-en/guides/best-practices.md) | 中文

---

## 📋 **目录**

1. [架构设计原则](#架构设计原则)
2. [代码组织](#代码组织)
3. [模块使用](#模块使用)
4. [错误处理](#错误处理)
5. [性能优化](#性能优化)
6. [安全实践](#安全实践)
7. [测试策略](#测试策略)
8. [部署建议](#部署建议)

---

## 🏗️ **架构设计原则**

### **1.1 单一职责原则**

每个Agent应该专注于单一职责。

**❌ 不推荐**:
```typescript
class SuperAgent {
  async processData() { }
  async sendEmail() { }
  async generateReport() { }
  async manageUsers() { }
  // 太多职责
}
```

**✅ 推荐**:
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

### **1.2 依赖注入**

使用依赖注入提高可测试性和灵活性。

**✅ 推荐**:
```typescript
export class MyAgent {
  constructor(
    private mplp: MPLP,
    private logger: Logger,
    private config: AgentConfig
  ) {}
}

// 使用
const agent = new MyAgent(mplp, logger, config);
```

### **1.3 接口隔离**

定义清晰的接口，避免过大的接口。

**✅ 推荐**:
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

## 📁 **代码组织**

### **2.1 推荐的项目结构**

```
my-agent/
├── src/
│   ├── config/              # 配置文件
│   │   ├── index.ts
│   │   └── agent.config.ts
│   ├── core/                # 核心逻辑
│   │   ├── Agent.ts
│   │   └── Lifecycle.ts
│   ├── services/            # 业务服务
│   │   ├── TaskService.ts
│   │   └── ContextService.ts
│   ├── models/              # 数据模型
│   │   └── Task.ts
│   ├── types/               # 类型定义
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   └── helpers.ts
│   └── index.ts             # 入口文件
├── tests/                   # 测试文件
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                    # 文档
├── package.json
└── tsconfig.json
```

### **2.2 命名约定**

**文件命名**:
- 类文件: `PascalCase.ts` (例如: `TaskAgent.ts`)
- 工具文件: `camelCase.ts` (例如: `helpers.ts`)
- 测试文件: `*.test.ts` 或 `*.spec.ts`

**变量命名**:
- 常量: `UPPER_SNAKE_CASE`
- 变量: `camelCase`
- 类: `PascalCase`
- 接口: `IPascalCase` 或 `PascalCase`

---

## 📦 **模块使用**

### **3.1 按需加载模块**

只加载需要的模块，提高启动速度。

**✅ 推荐**:
```typescript
const mplp = await createMPLP({
  modules: ['context', 'plan', 'role']  // 只加载需要的模块
});
```

**❌ 不推荐**:
```typescript
const mplp = await quickStart();  // 加载所有10个模块（如果不需要）
```

### **3.2 模块初始化检查**

始终检查模块是否成功加载。

**✅ 推荐**:
```typescript
const contextModule = mplp.getModule('context');
if (!contextModule) {
  throw new Error('Context module not loaded');
}

// 安全使用
await contextModule.createContext(data);
```

### **3.3 模块复用**

在Agent内部缓存模块引用。

**✅ 推荐**:
```typescript
export class MyAgent {
  private contextModule: any;
  private planModule: any;

  async initialize() {
    this.contextModule = this.mplp.getModule('context');
    this.planModule = this.mplp.getModule('plan');
  }

  async doWork() {
    // 直接使用缓存的引用
    await this.contextModule.createContext(data);
  }
}
```

---

## 🚨 **错误处理**

### **4.1 使用自定义错误类**

定义清晰的错误类型。

**✅ 推荐**:
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

// 使用
throw new TaskExecutionError(task.id, error);
```

### **4.2 优雅的错误处理**

**✅ 推荐**:
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

### **4.3 错误恢复策略**

实现重试机制。

**✅ 推荐**:
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

// 使用
const result = await executeWithRetry(
  () => agent.executeTask(taskId),
  3,
  2000
);
```

---

## ⚡ **性能优化**

### **5.1 使用连接池**

对于频繁的操作，使用连接池。

**✅ 推荐**:
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

### **5.2 批量操作**

批量处理任务而不是逐个处理。

**✅ 推荐**:
```typescript
async function processBatch(tasks: Task[]): Promise<TaskResult[]> {
  // 并行处理
  return Promise.all(
    tasks.map(task => agent.executeTask(task.id))
  );
}
```

**❌ 不推荐**:
```typescript
async function processSequential(tasks: Task[]): Promise<TaskResult[]> {
  const results = [];
  for (const task of tasks) {
    results.push(await agent.executeTask(task.id));  // 串行处理
  }
  return results;
}
```

### **5.3 缓存策略**

缓存频繁访问的数据。

**✅ 推荐**:
```typescript
class CachedAgent {
  private cache = new Map<string, any>();
  private cacheTTL = 60000; // 60秒

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

## 🔒 **安全实践**

### **6.1 输入验证**

始终验证输入数据。

**✅ 推荐**:
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

### **6.2 敏感信息处理**

不要在日志中记录敏感信息。

**✅ 推荐**:
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

### **6.3 使用环境变量**

敏感配置使用环境变量。

**✅ 推荐**:
```typescript
import * as dotenv from 'dotenv';
dotenv.config();

const config = {
  apiKey: process.env.API_KEY,
  dbPassword: process.env.DB_PASSWORD,
  // 不要硬编码敏感信息
};
```

---

## 🧪 **测试策略**

### **7.1 测试金字塔**

遵循测试金字塔原则。

```
        /\
       /E2E\        10% - 端到端测试
      /------\
     /  集成  \      20% - 集成测试
    /----------\
   /    单元    \    70% - 单元测试
  /--------------\
```

### **7.2 单元测试**

**✅ 推荐**:
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

### **7.3 集成测试**

**✅ 推荐**:
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

## 🚀 **部署建议**

### **8.1 环境配置**

为不同环境使用不同配置。

**✅ 推荐**:
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

### **8.2 健康检查**

实现健康检查端点。

**✅ 推荐**:
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

### **8.3 优雅关闭**

实现优雅关闭机制。

**✅ 推荐**:
```typescript
async function gracefulShutdown(agent: MyAgent) {
  console.log('Received shutdown signal');
  
  // 停止接受新任务
  agent.stopAcceptingTasks();
  
  // 等待当前任务完成
  await agent.waitForActiveTasks(30000); // 30秒超时
  
  // 关闭Agent
  await agent.shutdown();
  
  console.log('Shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown(agent));
process.on('SIGINT', () => gracefulShutdown(agent));
```

---

## 📚 **总结**

遵循这些最佳实践可以帮助你：
- ✅ 构建可维护的代码
- ✅ 提高应用性能
- ✅ 增强系统安全性
- ✅ 简化测试和部署

## 🔗 **相关资源**

- [架构指南](architecture.md)
- [测试指南](testing.md)
- [部署指南](deployment.md)
- [API参考](../api-reference/sdk-core.md)

---

**版本**: v1.1.0  
**更新时间**: 2025-10-22  
**维护者**: MPLP Team

