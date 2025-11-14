# @mplp/orchestrator API参考文档

> **🌐 语言导航**: [English](../../../en/sdk-api/orchestrator/README.md) | [中文](README.md)


> **包名**: @mplp/orchestrator  
> **版本**: v1.1.0  
> **更新时间**: 2025-09-20  
> **状态**: ✅ 生产就绪  

## 📚 **包概览**

`@mplp/orchestrator`包为MPLP平台提供了全面的多智能体工作流编排系统。它支持创建、管理和执行涉及多个智能代理的复杂工作流，具有企业级功能，适用于生产部署。

### **🎯 关键功能**

- **多智能体编排**: 在复杂工作流中协调多个代理
- **工作流构建器**: 流式API，用于构建具有步骤、条件和并行执行的复杂工作流
- **执行引擎**: 高性能工作流执行，具有错误处理和恢复功能
- **事件驱动架构**: 实时进度监控和事件处理
- **负载均衡**: 智能代理负载均衡和资源优化
- **企业功能**: 性能指标、审计日志、安全策略
- **错误处理**: 全面的错误处理，具有重试机制和恢复策略
- **TypeScript支持**: 100%类型安全，全面的接口定义

### **📦 安装**

```bash
npm install @mplp/orchestrator
```

### **🏗️ 架构**

```
┌─────────────────────────────────────────┐
│        MultiAgentOrchestrator           │
│        (主编排引擎)                     │
├─────────────────────────────────────────┤
│  WorkflowBuilder | ExecutionEngine     │
│  LoadBalancer | PerformanceMetrics     │
├─────────────────────────────────────────┤
│         已注册代理                      │
│  Agent1 | Agent2 | Agent3 | Agent4...  │
└─────────────────────────────────────────┘
```

## 🚀 **快速开始**

### **基础工作流创建**

```typescript
import { MultiAgentOrchestrator, WorkflowBuilder } from '@mplp/orchestrator';
import { AgentBuilder } from '@mplp/agent-builder';

// 创建编排器
const orchestrator = new MultiAgentOrchestrator();

// 创建并注册代理
const dataAgent = new AgentBuilder('data-processor')
  .withCapability('process', async (data) => ({ processed: true, count: data.length }))
  .build();

const validatorAgent = new AgentBuilder('validator')
  .withCapability('validate', async (data) => ({ valid: true, errors: [] }))
  .build();

await orchestrator.registerAgent(dataAgent);
await orchestrator.registerAgent(validatorAgent);

// 创建工作流
const workflow = new WorkflowBuilder('data-processing-workflow')
  .description('处理和验证数据')
  .step('process-data', async (input) => {
    return await dataAgent.executeCapability('process', input.data);
  })
  .step('validate-results', async (input) => {
    return await validatorAgent.executeCapability('validate', input.processedData);
  })
  .build();

// 执行工作流
const result = await orchestrator.executeWorkflow(workflow, { data: [1, 2, 3, 4, 5] });
console.log('工作流完成:', result);
```

### **高级并行工作流**

```typescript
const complexWorkflow = new WorkflowBuilder('parallel-processing')
  .description('复杂的并行数据处理工作流')
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

## 📋 **核心类**

### **MultiAgentOrchestrator**

管理代理和执行工作流的主编排器类。

#### **构造函数**

```typescript
constructor()
```

**示例:**
```typescript
const orchestrator = new MultiAgentOrchestrator();
```

#### **代理管理方法**

##### `registerAgent(agent: IAgent): Promise<void>`

向编排器注册代理。

```typescript
await orchestrator.registerAgent(myAgent);
```

**抛出异常:**
- `OrchestratorError` - 如果代理无效或已注册

##### `unregisterAgent(agentId: string): Promise<void>`

从编排器注销代理。

```typescript
await orchestrator.unregisterAgent('my-agent-id');
```

##### `getAgent(agentId: string): IAgent | undefined`

通过ID获取已注册的代理。

```typescript
const agent = orchestrator.getAgent('my-agent-id');
if (agent) {
  console.log(`找到代理: ${agent.name}`);
}
```

##### `listAgents(): IAgent[]`

列出所有已注册的代理。

```typescript
const agents = orchestrator.listAgents();
console.log(`代理总数: ${agents.length}`);
```

#### **工作流管理方法**

##### `createWorkflow(name: string): WorkflowBuilder`

创建新的工作流构建器。

```typescript
const workflow = orchestrator.createWorkflow('my-workflow')
  .description('我的自定义工作流')
  .step('first-step', async (input) => {
    // 步骤逻辑
    return { result: 'processed' };
  })
  .build();
```

##### `registerWorkflow(workflow: WorkflowDefinition): void`

注册工作流以供重用。

```typescript
orchestrator.registerWorkflow(workflow);
```

##### `executeWorkflow(workflow: WorkflowDefinition, parameters?: Record<string, unknown>, options?: ExecutionOptions): Promise<WorkflowResult>`

使用给定参数执行工作流。

```typescript
const result = await orchestrator.executeWorkflow(workflow, {
  inputData: 'Hello World',
  config: { timeout: 30000 }
});

console.log(`执行状态: ${result.status}`);
console.log(`结果: ${JSON.stringify(result.result)}`);
```

##### `getExecutionStatus(executionId: string): WorkflowResult | undefined`

获取工作流执行的状态。

```typescript
const status = orchestrator.getExecutionStatus('execution-123');
if (status) {
  console.log(`状态: ${status.status}, 进度: ${status.progress}%`);
}
```

#### **企业功能**

##### `getPerformanceMetrics(): PerformanceMetrics`

获取编排器的性能指标。

```typescript
const metrics = orchestrator.getPerformanceMetrics();
console.log(`平均执行时间: ${metrics.averageExecutionTime}ms`);
console.log(`成功率: ${metrics.successRate}%`);
```

##### `getOptimalAgent(agentType: string): string | null`

基于负载均衡获取执行的最优代理。

```typescript
const optimalAgentId = orchestrator.getOptimalAgent('data-processor');
if (optimalAgentId) {
  const agent = orchestrator.getAgent(optimalAgentId);
  // 使用最优代理
}
```

##### `setSecurityPolicy(policy: SecurityPolicy): void`

为工作流执行设置安全策略。

```typescript
orchestrator.setSecurityPolicy({
  requireAuthentication: true,
  allowedRoles: ['admin', 'operator'],
  maxExecutionTime: 300000,
  auditLogging: true
});
```

#### **事件**

编排器在操作期间发出各种事件：

```typescript
orchestrator.on('agentRegistered', (agent) => {
  console.log(`代理已注册: ${agent.id}`);
});

orchestrator.on('workflowStarted', (executionId, workflowId) => {
  console.log(`工作流 ${workflowId} 已启动，执行ID ${executionId}`);
});

orchestrator.on('workflowCompleted', (result) => {
  console.log(`工作流完成: ${result.status}`);
});

orchestrator.on('workflowFailed', (error, executionId) => {
  console.error(`工作流 ${executionId} 失败:`, error);
});

orchestrator.on('stepCompleted', (stepId, result) => {
  console.log(`步骤 ${stepId} 完成，结果:`, result);
});
```

### **WorkflowBuilder**

用于构建具有步骤、条件和并行执行的复杂工作流的流式API。

#### **构造函数**

```typescript
constructor(name: string, id?: string)
```

**参数:**
- `name`: 工作流名称
- `id` (可选): 唯一工作流ID

#### **配置方法**

##### `description(description: string): WorkflowBuilder`

设置工作流描述。

```typescript
const workflow = new WorkflowBuilder('my-workflow')
  .description('处理客户数据并生成报告')
  .build();
```

##### `version(version: string): WorkflowBuilder`

设置工作流版本。

```typescript
const workflow = new WorkflowBuilder('my-workflow')
  .version('2.1.0')
  .build();
```

##### `timeout(timeout: number): WorkflowBuilder`

设置工作流超时时间（毫秒）。

```typescript
const workflow = new WorkflowBuilder('my-workflow')
  .timeout(60000) // 1分钟超时
  .build();
```

##### `retries(retries: number): WorkflowBuilder`

设置失败步骤的重试次数。

```typescript
const workflow = new WorkflowBuilder('my-workflow')
  .retries(3)
  .build();
```

##### `metadata(metadata: Record<string, unknown>): WorkflowBuilder`

设置工作流元数据。

```typescript
const workflow = new WorkflowBuilder('my-workflow')
  .metadata({
    author: '张三',
    department: '工程部',
    priority: 'high'
  })
  .build();
```

#### **步骤定义方法**

##### `step(name: string, handler: StepHandler): WorkflowBuilder`

向工作流添加顺序步骤。

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

添加并发执行的并行步骤。

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

基于谓词添加条件执行。

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

添加在条件为真时重复步骤的循环。

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

#### **构建方法**

##### `build(): WorkflowDefinition`

构建并返回工作流定义。

```typescript
const workflow = new WorkflowBuilder('complete-workflow')
  .description('完整的工作流示例')
  .timeout(120000)
  .retries(2)
  .step('initialize', async () => ({ initialized: true }))
  .step('process', async (input) => ({ processed: input.initialized }))
  .build();
```

### **ExecutionEngine**

处理工作流实际执行的工作流执行引擎。

#### **方法**

##### `registerAgent(agent: IAgent): void`

为工作流执行注册代理。

```typescript
const engine = new ExecutionEngine();
engine.registerAgent(myAgent);
```

##### `executeWorkflow(workflow: WorkflowDefinition, parameters?: Record<string, unknown>, options?: ExecutionOptions): Promise<WorkflowResult>`

使用给定参数执行工作流。

```typescript
const result = await engine.executeWorkflow(workflow, {
  inputData: 'test data',
  config: { maxRetries: 3 }
});
```

##### `getExecution(executionId: string): WorkflowResult | undefined`

获取特定执行的结果。

```typescript
const execution = engine.getExecution('execution-123');
if (execution) {
  console.log(`状态: ${execution.status}`);
}
```

## 🔧 **类型定义**

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

## 🎯 **高级使用示例**

### **企业内容处理管道**

```typescript
import { MultiAgentOrchestrator, WorkflowBuilder } from '@mplp/orchestrator';
import { AgentBuilder } from '@mplp/agent-builder';

// 创建专业化代理
const contentExtractor = new AgentBuilder('content-extractor')
  .withCapability('extract', async (url: string) => {
    // 从URL提取内容
    return { content: '提取的内容', metadata: {} };
  })
  .build();

const contentAnalyzer = new AgentBuilder('content-analyzer')
  .withCapability('analyze', async (content: string) => {
    // AI驱动的内容分析
    return { sentiment: 'positive', topics: ['tech', 'ai'], score: 0.85 };
  })
  .build();

const contentPublisher = new AgentBuilder('content-publisher')
  .withCapability('publish', async (content: any, platforms: string[]) => {
    // 多平台发布
    return { published: true, platforms, timestamp: new Date() };
  })
  .build();

// 创建编排器并注册代理
const orchestrator = new MultiAgentOrchestrator();
await orchestrator.registerAgent(contentExtractor);
await orchestrator.registerAgent(contentAnalyzer);
await orchestrator.registerAgent(contentPublisher);

// 构建企业内容管道
const contentPipeline = new WorkflowBuilder('enterprise-content-pipeline')
  .description('跨平台提取、分析和发布内容')
  .version('2.0.0')
  .timeout(300000) // 5分钟
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
        // 为每个内容生成摘要
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
        return { flagged: true, reason: '情感分数低', reviewRequired: true };
      }
    }
  )
  .build();

// 执行管道
const result = await orchestrator.executeWorkflow(contentPipeline, {
  urls: [
    'https://example.com/article1',
    'https://example.com/article2',
    'https://example.com/article3'
  ]
});

console.log('内容管道完成:', result.status);
```

## 🔗 **相关文档**

- [SDK Core API](../sdk-core/README.md) - 应用框架和生命周期管理
- [Agent Builder API](../agent-builder/README.md) - 构建和管理智能代理
- [Platform Adapters API](../adapters/README.md) - 平台集成和通信
- [CLI Tools](../cli/README.md) - 开发和部署实用程序

---

**包维护者**: MPLP Orchestrator团队  
**最后审查**: 2025-09-20  
**测试覆盖率**: 100% (117/117测试通过)  
**状态**: ✅ 生产就绪
