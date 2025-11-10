# 多Agent协作工作流教程

> **🎯 学习目标**: 掌握多Agent协作和工作流编排  
> **⏱️ 预计时间**: 60分钟  
> **📚 前置知识**: 基础Agent开发、TypeScript异步编程  
> **🌐 语言**: [English](../../docs-sdk-en/tutorials/multi-agent-workflow.md) | 中文

---

## 📋 **教程概览**

本教程深入讲解如何构建多Agent协作系统，包括：

1. ✅ Agent间通信机制
2. ✅ 工作流编排模式
3. ✅ 协调策略
4. ✅ 错误处理和恢复
5. ✅ 性能优化

---

## 🏗️ **第1部分：多Agent架构设计**

### **1.1 协作模式**

**主从模式 (Master-Worker)**:
```
Master Agent
    ├── Worker Agent 1
    ├── Worker Agent 2
    └── Worker Agent 3
```

**管道模式 (Pipeline)**:
```
Agent A → Agent B → Agent C → Agent D
```

**发布订阅模式 (Pub-Sub)**:
```
        Event Bus
       /    |    \
Agent A  Agent B  Agent C
```

### **1.2 通信机制**

**直接调用**:
```typescript
const result = await agentB.processData(data);
```

**事件驱动**:
```typescript
eventBus.emit('task.completed', { taskId, result });
```

**消息队列**:
```typescript
await messageQueue.publish('task.queue', task);
```

---

## 💻 **第2部分：实现协作系统**

### **2.1 项目结构**

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

### **2.2 事件总线实现**

**core/EventBus.ts**:
```typescript
type EventHandler = (data: any) => void | Promise<void>;

export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  /**
   * 订阅事件
   */
  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  /**
   * 取消订阅
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * 发布事件
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
   * 清除所有订阅
   */
  clear(): void {
    this.handlers.clear();
  }
}
```

### **2.3 Master Agent实现**

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
   * 初始化Master和Workers
   */
  async initialize(): Promise<void> {
    console.log('🚀 初始化MasterAgent...');

    // 初始化MPLP
    this.mplp = await createMPLP({
      modules: ['context', 'plan', 'core', 'collab']
    });

    // 创建Worker Agents
    for (let i = 0; i < this.workerCount; i++) {
      const worker = new WorkerAgent(`worker-${i + 1}`, this.eventBus);
      await worker.initialize();
      this.workers.push(worker);
    }

    // 订阅Worker完成事件
    this.eventBus.on('worker.completed', this.handleWorkerCompleted.bind(this));
    this.eventBus.on('worker.failed', this.handleWorkerFailed.bind(this));

    this.initialized = true;
    console.log(`✅ MasterAgent初始化完成，${this.workerCount}个Workers就绪`);
  }

  /**
   * 分发任务到Workers
   */
  async distributeTask(task: any): Promise<void> {
    console.log(`📋 分发任务: ${task.name}`);

    // 使用Collab模块协调
    const collabModule = this.mplp?.getModule('collab');
    if (collabModule) {
      console.log('🤝 使用Collab模块协调任务分发');
    }

    // 找到空闲的Worker
    const availableWorker = this.workers.find(w => w.isAvailable());
    
    if (!availableWorker) {
      console.warn('⚠️  没有可用的Worker，任务排队');
      // 实现任务队列逻辑
      return;
    }

    // 分配任务
    await availableWorker.executeTask(task);
  }

  /**
   * 批量处理任务
   */
  async processBatch(tasks: any[]): Promise<void> {
    console.log(`📦 批量处理 ${tasks.length} 个任务`);

    // 并行分发任务
    await Promise.all(
      tasks.map(task => this.distributeTask(task))
    );
  }

  /**
   * 处理Worker完成事件
   */
  private async handleWorkerCompleted(data: any): Promise<void> {
    console.log(`✅ Worker ${data.workerId} 完成任务: ${data.taskId}`);
    
    // 使用Context模块记录结果
    const contextModule = this.mplp?.getModule('context');
    if (contextModule) {
      // 保存任务结果到上下文
    }
  }

  /**
   * 处理Worker失败事件
   */
  private async handleWorkerFailed(data: any): Promise<void> {
    console.error(`❌ Worker ${data.workerId} 任务失败: ${data.taskId}`);
    
    // 重试逻辑
    if (data.retryCount < 3) {
      console.log(`🔄 重试任务 (${data.retryCount + 1}/3)`);
      await this.distributeTask({
        ...data.task,
        retryCount: data.retryCount + 1
      });
    }
  }

  /**
   * 关闭所有Agents
   */
  async shutdown(): Promise<void> {
    console.log('🛑 关闭MasterAgent和所有Workers...');

    await Promise.all(
      this.workers.map(worker => worker.shutdown())
    );

    this.eventBus.clear();
    this.initialized = false;

    console.log('✅ 关闭完成');
  }
}
```

### **2.4 Worker Agent实现**

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
   * 初始化Worker
   */
  async initialize(): Promise<void> {
    this.mplp = await createMPLP({
      modules: ['context', 'trace']
    });
    console.log(`✅ Worker ${this.workerId} 初始化完成`);
  }

  /**
   * 执行任务
   */
  async executeTask(task: any): Promise<void> {
    this.available = false;
    console.log(`⚙️  Worker ${this.workerId} 开始执行: ${task.name}`);

    try {
      // 使用Trace模块跟踪执行
      const traceModule = this.mplp?.getModule('trace');
      if (traceModule) {
        // 开始跟踪
      }

      // 模拟任务执行
      await this.delay(Math.random() * 2000 + 1000);

      // 发布完成事件
      await this.eventBus.emit('worker.completed', {
        workerId: this.workerId,
        taskId: task.id,
        result: { success: true }
      });

    } catch (error) {
      // 发布失败事件
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
   * 检查是否可用
   */
  isAvailable(): boolean {
    return this.available;
  }

  /**
   * 关闭Worker
   */
  async shutdown(): Promise<void> {
    console.log(`🛑 关闭Worker ${this.workerId}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### **2.5 工作流引擎实现**

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
   * 添加工作流步骤
   */
  addStep(step: WorkflowStep): void {
    this.steps.push(step);
  }

  /**
   * 执行工作流
   */
  async execute(initialInput: any): Promise<any> {
    console.log('🔄 开始执行工作流...');
    
    let currentInput = initialInput;

    for (const [index, step] of this.steps.entries()) {
      console.log(`📍 步骤 ${index + 1}/${this.steps.length}: ${step.name}`);
      
      try {
        currentInput = await step.execute(currentInput);
        
        await this.eventBus.emit('workflow.step.completed', {
          stepIndex: index,
          stepName: step.name,
          output: currentInput
        });

      } catch (error) {
        console.error(`❌ 步骤 ${step.name} 失败:`, error);
        
        await this.eventBus.emit('workflow.step.failed', {
          stepIndex: index,
          stepName: step.name,
          error
        });

        throw error;
      }
    }

    console.log('✅ 工作流执行完成');
    return currentInput;
  }

  /**
   * 订阅工作流事件
   */
  on(event: string, handler: (data: any) => void): void {
    this.eventBus.on(event, handler);
  }
}
```

---

## 🧪 **第3部分：使用示例**

### **3.1 Master-Worker模式**

```typescript
import { MasterAgent } from './agents/MasterAgent';

async function masterWorkerExample() {
  const master = new MasterAgent(3);
  await master.initialize();

  // 批量处理任务
  const tasks = [
    { id: 1, name: '任务1', data: 'data1' },
    { id: 2, name: '任务2', data: 'data2' },
    { id: 3, name: '任务3', data: 'data3' },
    { id: 4, name: '任务4', data: 'data4' },
    { id: 5, name: '任务5', data: 'data5' }
  ];

  await master.processBatch(tasks);

  // 等待所有任务完成
  await new Promise(resolve => setTimeout(resolve, 5000));

  await master.shutdown();
}
```

### **3.2 Pipeline模式**

```typescript
import { WorkflowEngine } from './core/WorkflowEngine';

async function pipelineExample() {
  const workflow = new WorkflowEngine();

  // 添加工作流步骤
  workflow.addStep({
    name: '数据收集',
    agent: null,
    execute: async (input) => {
      console.log('📥 收集数据...');
      return { ...input, collected: true };
    }
  });

  workflow.addStep({
    name: '数据处理',
    agent: null,
    execute: async (input) => {
      console.log('⚙️  处理数据...');
      return { ...input, processed: true };
    }
  });

  workflow.addStep({
    name: '数据存储',
    agent: null,
    execute: async (input) => {
      console.log('💾 存储数据...');
      return { ...input, stored: true };
    }
  });

  // 执行工作流
  const result = await workflow.execute({ data: 'initial' });
  console.log('最终结果:', result);
}
```

---

## 📚 **总结**

你已经学会了：
- ✅ 设计多Agent协作架构
- ✅ 实现事件驱动通信
- ✅ 构建Master-Worker模式
- ✅ 创建Pipeline工作流
- ✅ 处理协作中的错误

## 🔗 **下一步**

- [最佳实践指南](../guides/best-practices.md)
- [架构指南](../guides/architecture.md)
- [性能优化](../guides/performance.md)
- [API参考](../api-reference/sdk-core.md)

---

**版本**: v1.1.0-beta  
**更新时间**: 2025-10-22  
**作者**: MPLP Team

