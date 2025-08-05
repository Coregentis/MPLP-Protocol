# MPLP Core协议使用指南

## 概述

MPLP Core协议是多智能体项目生命周期协议（MPLP）的核心协调协议，负责统一管理和协调所有9个MPLP协议模块的执行。Core协议提供了工作流编排、模块协调、事件处理和状态监控等核心功能。

## 核心特性

### 🎯 工作流编排
- **顺序执行**：按照定义的阶段顺序执行协议模块
- **并行执行**：同时执行多个独立的协议模块
- **条件执行**：根据条件动态选择执行路径
- **混合执行**：结合顺序和并行的复杂执行模式

### 🔗 模块协调
- **适配器模式**：统一的模块接口，支持厂商中立
- **数据流管理**：协议间的数据传递和转换
- **超时控制**：模块执行的超时和重试机制
- **健康检查**：实时监控模块健康状态

### 📊 状态监控
- **实时状态**：工作流和模块的实时执行状态
- **执行历史**：完整的执行历史和结果记录
- **性能指标**：执行时间、吞吐量等性能数据
- **错误追踪**：详细的错误信息和堆栈跟踪

### 🎪 事件处理
- **事件发布**：工作流生命周期事件的发布
- **事件订阅**：灵活的事件监听和处理机制
- **事件路由**：基于条件的事件路由规则
- **异步处理**：非阻塞的事件处理机制

## 快速开始

### 安装

```bash
npm install @mplp/core
```

### 基本使用

```typescript
import { createCoreOrchestrator, WorkflowStage, ExecutionMode } from '@mplp/core';

// 创建Core协调器
const orchestrator = createCoreOrchestrator({
  module_timeout_ms: 30000,
  max_concurrent_executions: 10,
  enable_metrics: true,
  enable_events: true
});

// 执行工作流
const result = await orchestrator.executeWorkflow('my-context-id', {
  name: '我的第一个工作流',
  stages: [
    WorkflowStage.CONTEXT,
    WorkflowStage.PLAN,
    WorkflowStage.CONFIRM,
    WorkflowStage.TRACE
  ],
  execution_mode: ExecutionMode.SEQUENTIAL,
  timeout_ms: 60000
});

if (result.success) {
  console.log('工作流执行成功:', result.data);
} else {
  console.error('工作流执行失败:', result.error);
}
```

## 工作流配置

### 基本配置

```typescript
interface WorkflowConfig {
  name: string;                           // 工作流名称
  description?: string;                   // 工作流描述
  stages: WorkflowStage[];               // 执行阶段列表
  execution_mode: ExecutionMode;         // 执行模式
  timeout_ms?: number;                   // 超时时间
  max_concurrent_executions?: number;    // 最大并发数
  retry_policy?: RetryPolicy;            // 重试策略
}
```

### 执行模式

```typescript
enum ExecutionMode {
  SEQUENTIAL = 'sequential',    // 顺序执行
  PARALLEL = 'parallel',        // 并行执行
  CONDITIONAL = 'conditional',  // 条件执行
  HYBRID = 'hybrid'            // 混合执行
}
```

### 工作流阶段

```typescript
enum WorkflowStage {
  CONTEXT = 'context',       // 上下文管理
  PLAN = 'plan',            // 计划制定
  CONFIRM = 'confirm',      // 确认审批
  TRACE = 'trace',          // 追踪监控
  ROLE = 'role',            // 角色管理
  EXTENSION = 'extension',  // 扩展管理
  COLLAB = 'collab',        // 协作决策
  DIALOG = 'dialog',        // 对话交互
  NETWORK = 'network'       // 网络拓扑
}
```

## 模块适配器

### 创建自定义适配器

```typescript
import { ModuleAdapterBase, WorkflowStage, OperationResult } from '@mplp/core';

class MyCustomAdapter extends ModuleAdapterBase {
  constructor() {
    super(WorkflowStage.CONTEXT, {
      timeout_ms: 10000,
      retry_attempts: 3,
      enable_health_check: true
    });
  }

  async execute(input: Record<string, any>): Promise<OperationResult> {
    try {
      // 实现你的业务逻辑
      const result = await this.processInput(input);
      
      return this.buildSuccessResult(result);
    } catch (error) {
      return this.buildErrorResult(error.message);
    }
  }

  protected async performHealthCheck(): Promise<boolean> {
    // 实现健康检查逻辑
    return true;
  }

  protected getCapabilities(): string[] {
    return ['custom-processing', 'data-transformation'];
  }

  private async processInput(input: Record<string, any>): Promise<any> {
    // 你的具体实现
    return { processed: true, timestamp: new Date().toISOString() };
  }
}

// 注册适配器
await orchestrator.registerModuleAdapter(WorkflowStage.CONTEXT, new MyCustomAdapter());
```

### 使用现有适配器

```typescript
import { ContextAdapter, PlanAdapter } from '@mplp/adapters';

// 注册现有适配器
await orchestrator.registerModuleAdapter(WorkflowStage.CONTEXT, new ContextAdapter());
await orchestrator.registerModuleAdapter(WorkflowStage.PLAN, new PlanAdapter());
```

## 工作流控制

### 状态监控

```typescript
// 获取活跃工作流
const activeWorkflows = await orchestrator.getActiveExecutions();
console.log('活跃工作流:', activeWorkflows);

// 获取工作流状态
const status = await orchestrator.getExecutionStatus('workflow-id');
if (status.success) {
  console.log('工作流状态:', status.data.status);
  console.log('当前阶段:', status.data.current_stage);
  console.log('已完成阶段:', status.data.completed_stages);
}

// 获取模块状态
const moduleStatuses = await orchestrator.getModuleStatuses();
console.log('模块状态:', moduleStatuses);
```

### 工作流控制

```typescript
// 暂停工作流
const pauseResult = await orchestrator.pauseWorkflow('workflow-id');
if (pauseResult.success) {
  console.log('工作流已暂停');
}

// 恢复工作流
const resumeResult = await orchestrator.resumeWorkflow('workflow-id');
if (resumeResult.success) {
  console.log('工作流已恢复');
}

// 取消工作流
const cancelResult = await orchestrator.cancelWorkflow('workflow-id');
if (cancelResult.success) {
  console.log('工作流已取消');
}
```

## 事件处理

### 事件监听

```typescript
import { EventType } from '@mplp/core';

// 监听工作流事件
orchestrator.addEventListener(EventType.WORKFLOW_STARTED, (event) => {
  console.log('工作流开始:', event.data.workflow_id);
});

orchestrator.addEventListener(EventType.WORKFLOW_COMPLETED, (event) => {
  console.log('工作流完成:', event.data.workflow_id);
});

orchestrator.addEventListener(EventType.STAGE_FAILED, (event) => {
  console.error('阶段失败:', event.data.stage, event.data.error);
});

// 移除事件监听器
const handler = (event) => console.log('事件:', event);
orchestrator.addEventListener(EventType.WORKFLOW_STARTED, handler);
orchestrator.removeEventListener(EventType.WORKFLOW_STARTED, handler);
```

### 自定义事件处理

```typescript
// 创建带有事件处理的协调器
const orchestrator = createCoreOrchestrator({
  enable_events: true,
  event_handling: {
    event_listeners: [
      {
        event_type: EventType.WORKFLOW_FAILED,
        handler: 'error-notification-handler',
        config: {
          email: 'admin@example.com',
          slack_webhook: 'https://hooks.slack.com/...'
        }
      }
    ],
    event_routing: {
      default_handler: 'default-logger',
      routing_rules: [
        {
          condition: 'event.data.priority === "critical"',
          handler: 'critical-alert-handler'
        }
      ]
    }
  }
});
```

## 高级用法

### 自定义工作流模板

```typescript
// 定义工作流模板
const templates = {
  // 完整MPLP工作流
  full_mplp: {
    name: '完整MPLP生命周期',
    stages: [
      WorkflowStage.CONTEXT,
      WorkflowStage.PLAN,
      WorkflowStage.CONFIRM,
      WorkflowStage.TRACE,
      WorkflowStage.ROLE,
      WorkflowStage.EXTENSION,
      WorkflowStage.COLLAB,
      WorkflowStage.DIALOG,
      WorkflowStage.NETWORK
    ],
    execution_mode: ExecutionMode.SEQUENTIAL
  },
  
  // 核心6协议工作流
  core_six: {
    name: '核心6协议工作流',
    stages: [
      WorkflowStage.CONTEXT,
      WorkflowStage.PLAN,
      WorkflowStage.CONFIRM,
      WorkflowStage.TRACE,
      WorkflowStage.ROLE,
      WorkflowStage.EXTENSION
    ],
    execution_mode: ExecutionMode.SEQUENTIAL
  },
  
  // L4智能协议工作流
  l4_intelligent: {
    name: 'L4智能协议工作流',
    stages: [
      WorkflowStage.COLLAB,
      WorkflowStage.DIALOG,
      WorkflowStage.NETWORK
    ],
    execution_mode: ExecutionMode.PARALLEL
  }
};

// 使用模板
const result = await orchestrator.executeWorkflow('context-id', templates.full_mplp);
```

### 数据流配置

```typescript
const workflowWithDataFlow = {
  name: '数据流工作流',
  stages: [WorkflowStage.CONTEXT, WorkflowStage.PLAN, WorkflowStage.CONFIRM],
  execution_mode: ExecutionMode.SEQUENTIAL,
  module_coordination: {
    data_flow: {
      input_mappings: {
        'plan_input': {
          source_stage: WorkflowStage.CONTEXT,
          source_field: 'context_id',
          target_field: 'context_id'
        }
      },
      output_mappings: {
        'confirm_input': {
          target_stage: WorkflowStage.CONFIRM,
          source_field: 'plan_id',
          target_field: 'plan_id'
        }
      }
    }
  }
};
```

## 最佳实践

### 1. 错误处理

```typescript
try {
  const result = await orchestrator.executeWorkflow(contextId, config);
  
  if (!result.success) {
    // 处理业务逻辑错误
    console.error('工作流执行失败:', result.error);
    
    // 根据错误类型进行不同处理
    if (result.error.includes('timeout')) {
      // 处理超时错误
    } else if (result.error.includes('validation')) {
      // 处理验证错误
    }
  }
} catch (error) {
  // 处理系统级错误
  console.error('系统错误:', error);
}
```

### 2. 性能优化

```typescript
// 使用并行执行提高性能
const parallelConfig = {
  name: '并行优化工作流',
  stages: [WorkflowStage.CONTEXT, WorkflowStage.ROLE, WorkflowStage.EXTENSION],
  execution_mode: ExecutionMode.PARALLEL,
  max_concurrent_executions: 3
};

// 设置合理的超时时间
const optimizedConfig = {
  name: '优化配置工作流',
  stages: [WorkflowStage.CONTEXT, WorkflowStage.PLAN],
  execution_mode: ExecutionMode.SEQUENTIAL,
  timeout_ms: 30000,  // 30秒超时
  retry_policy: {
    max_attempts: 3,
    delay_ms: 1000,
    backoff_factor: 2.0
  }
};
```

### 3. 监控和日志

```typescript
// 启用详细监控
const monitoredOrchestrator = createCoreOrchestrator({
  enable_metrics: true,
  enable_events: true,
  module_timeout_ms: 30000
});

// 添加监控事件
monitoredOrchestrator.addEventListener(EventType.STAGE_STARTED, (event) => {
  console.log(`阶段开始: ${event.data.stage} at ${event.timestamp}`);
});

monitoredOrchestrator.addEventListener(EventType.STAGE_COMPLETED, (event) => {
  const duration = event.data.duration_ms;
  console.log(`阶段完成: ${event.data.stage}, 耗时: ${duration}ms`);
});
```

## 故障排除

### 常见问题

1. **模块未注册错误**
   ```
   Error: No adapter registered for stage: plan
   ```
   解决方案：确保所有使用的工作流阶段都已注册相应的适配器。

2. **超时错误**
   ```
   Error: Operation timeout after 30000ms
   ```
   解决方案：增加超时时间或优化模块执行性能。

3. **并发限制错误**
   ```
   Error: Maximum concurrent executions reached
   ```
   解决方案：增加最大并发数或等待现有工作流完成。

### 调试技巧

```typescript
// 启用调试模式
const debugOrchestrator = createCoreOrchestrator({
  enable_metrics: true,
  enable_events: true,
  module_timeout_ms: 60000  // 增加超时时间用于调试
});

// 添加详细日志
debugOrchestrator.addEventListener(EventType.STAGE_STARTED, (event) => {
  console.debug('DEBUG: Stage started', event);
});

debugOrchestrator.addEventListener(EventType.STAGE_FAILED, (event) => {
  console.error('DEBUG: Stage failed', event);
});
```

## 相关资源

- [MPLP协议规范](./mplp-protocol-spec.md)
- [API参考文档](./api-reference.md)
- [示例代码库](../examples/)
- [常见问题解答](./faq.md)

## 版本信息

- **当前版本**: 1.0.0
- **协议版本**: 1.0.0
- **兼容性**: Node.js 18+, TypeScript 5.0+
- **更新日期**: 2025-08-03
