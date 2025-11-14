# 基础Agent开发教程

> **🎯 学习目标**: 掌握MPLP Agent的核心开发模式  
> **⏱️ 预计时间**: 45分钟  
> **📚 前置知识**: TypeScript基础、异步编程  
> **🌐 语言**: [English](../../docs-sdk-en/tutorials/basic-agent.md) | 中文

---

## 📋 **教程概览**

本教程将深入讲解如何开发一个功能完整的MPLP Agent，包括：

1. ✅ Agent架构设计
2. ✅ 模块集成与使用
3. ✅ 状态管理
4. ✅ 错误处理
5. ✅ 测试与调试

---

## 🏗️ **第1部分：Agent架构设计**

### **1.1 理解Agent结构**

一个标准的MPLP Agent包含以下组件：

```
Agent
├── Configuration (配置层)
│   ├── 环境配置
│   ├── 模块配置
│   └── 自定义配置
├── Core Logic (核心逻辑层)
│   ├── 初始化逻辑
│   ├── 业务逻辑
│   └── 生命周期管理
├── Module Integration (模块集成层)
│   ├── Context管理
│   ├── Plan编排
│   └── Role权限
└── Error Handling (错误处理层)
    ├── 异常捕获
    ├── 错误恢复
    └── 日志记录
```

### **1.2 设计原则**

**SOLID原则应用**:
- **S**ingle Responsibility: 每个Agent专注单一职责
- **O**pen/Closed: 通过配置扩展，不修改核心代码
- **L**iskov Substitution: Agent可互换使用
- **I**nterface Segregation: 模块接口清晰分离
- **D**ependency Inversion: 依赖抽象而非具体实现

---

## 💻 **第2部分：实现完整Agent**

### **2.1 项目结构**

```
task-agent/
├── src/
│   ├── config/
│   │   ├── agent.config.ts      # Agent配置
│   │   └── module.config.ts     # 模块配置
│   ├── core/
│   │   ├── TaskAgent.ts         # Agent主类
│   │   └── AgentLifecycle.ts    # 生命周期管理
│   ├── services/
│   │   ├── TaskService.ts       # 任务服务
│   │   └── ContextService.ts    # 上下文服务
│   ├── types/
│   │   └── index.ts             # 类型定义
│   └── index.ts                 # 入口文件
├── tests/
│   ├── unit/                    # 单元测试
│   └── integration/             # 集成测试
└── package.json
```

### **2.2 配置层实现**

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
    taskTimeout: 30000,  // 30秒
    retryAttempts: 3
  }
};
```

### **2.3 类型定义**

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

### **2.4 核心Agent实现**

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
   * 初始化Agent
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('⚠️  TaskAgent already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing TaskAgent...');
      
      // 初始化MPLP
      await this.mplp.initialize();
      
      // 初始化服务
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
   * 创建任务
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

    // 使用Context模块创建上下文
    await this.contextService.createTaskContext(task);
    
    // 使用Plan模块创建执行计划
    await this.taskService.createTaskPlan(task);
    
    this.activeTasks.set(task.id, task);
    console.log(`📋 Task created: ${task.name} (${task.id})`);
    
    return task;
  }

  /**
   * 执行任务
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
      
      // 更新任务状态
      task.status = TaskStatus.RUNNING;
      task.updatedAt = new Date();
      
      // 使用Trace模块追踪执行
      const traceModule = this.mplp.getModule('trace');
      if (traceModule) {
        // 开始追踪
      }
      
      // 执行任务逻辑
      const result = await this.taskService.execute(task);
      
      // 更新任务状态
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
   * 获取任务状态
   */
  getTaskStatus(taskId: string): TaskStatus | undefined {
    const task = this.activeTasks.get(taskId);
    return task?.status;
  }

  /**
   * 获取所有活动任务
   */
  getActiveTasks(): Task[] {
    return Array.from(this.activeTasks.values());
  }

  /**
   * 取消任务
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
   * 关闭Agent
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down TaskAgent...');
    
    // 取消所有运行中的任务
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
   * 确保已初始化
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('TaskAgent not initialized. Call initialize() first.');
    }
  }

  /**
   * 生成任务ID
   */
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### **2.5 服务层实现**

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

    // 创建任务执行计划
    console.log(`📝 Creating plan for task: ${task.name}`);
  }

  async execute(task: Task): Promise<any> {
    // 模拟任务执行
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

    // 创建任务上下文
    console.log(`🔧 Creating context for task: ${task.name}`);
  }
}
```

---

## 🧪 **第3部分：测试Agent**

### **3.1 单元测试**

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

### **3.2 运行测试**

```bash
# 安装测试依赖
npm install -D jest @types/jest ts-jest

# 运行测试
npm test
```

---

## 📚 **第4部分：使用Agent**

### **4.1 基础使用**

```typescript
import { TaskAgent } from './core/TaskAgent';
import { TaskPriority } from './types';

async function main() {
  const agent = new TaskAgent();
  
  try {
    // 初始化
    await agent.initialize();
    
    // 创建任务
    const task = await agent.createTask(
      'Process Data',
      'Process user data',
      TaskPriority.HIGH
    );
    
    // 执行任务
    const result = await agent.executeTask(task.id);
    console.log('Result:', result);
    
    // 关闭
    await agent.shutdown();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

---

## 🎯 **总结**

你已经学会了：
- ✅ 设计Agent架构
- ✅ 实现完整的Agent类
- ✅ 集成MPLP模块
- ✅ 编写测试用例
- ✅ 处理错误和异常

## 📚 **下一步**

- [多Agent协作](multi-agent-workflow.md)
- [最佳实践指南](../guides/best-practices.md)
- [完整示例](../examples/)

---

**版本**: v1.1.0  
**更新时间**: 2025-10-22  
**作者**: MPLP Team

