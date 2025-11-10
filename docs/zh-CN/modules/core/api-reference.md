# Core模块API参考

> **🌐 语言导航**: [English](../../../en/modules/core/api-reference.md) | [中文](api-reference.md)

**MPLP生态系统中央协调器 - MPLP v1.0 Alpha**

[![API](https://img.shields.io/badge/api-Core%20模块-blue.svg)](./README.md)
[![Schema](https://img.shields.io/badge/schema-mplp--core.json-green.svg)](../../schemas/README.md)
[![状态](https://img.shields.io/badge/status-生产就绪-green.svg)](../../../../ALPHA-RELEASE-NOTES.md)
[![语言](https://img.shields.io/badge/language-简体中文-red.svg)](../../en/modules/core/api-reference.md)

---

## 🎯 概述

Core API提供MPLP生态系统的中央协调功能。CoreOrchestrator作为L3执行层的核心组件，负责协调所有L2模块、管理工作流执行、分配系统资源，并确保整个系统的健康运行。

## 📦 导入

```typescript
import { 
  initializeCoreOrchestrator,
  CoreOrchestrator,
  CoreOrchestratorOptions,
  WorkflowConfig,
  WorkflowResult
} from 'mplp/modules/core';

// 或使用模块接口
import { MPLP } from 'mplp';
const mplp = new MPLP();
const coreModule = mplp.getModule('core');
```

## 🏗️ 核心接口

### **CoreOrchestratorOptions** (初始化选项)

```typescript
interface CoreOrchestratorOptions {
  // 环境配置
  environment?: 'development' | 'production' | 'testing';
  
  // 功能开关
  enableLogging?: boolean;           // 启用日志记录
  enableMetrics?: boolean;           // 启用性能指标
  enableCaching?: boolean;           // 启用缓存
  
  // 性能配置
  maxConcurrentWorkflows?: number;   // 最大并发工作流数
  workflowTimeout?: number;          // 工作流超时时间(ms)
  
  // 模块协调
  enableReservedInterfaces?: boolean; // 启用预留接口
  enableModuleCoordination?: boolean; // 启用模块协调
  
  // 自定义配置
  customConfig?: CoreOrchestratorFactoryConfig;
}
```

### **WorkflowConfig** (工作流配置)

```typescript
interface WorkflowConfig {
  // 工作流阶段
  stages: WorkflowStageType[];       // 执行阶段列表
  
  // 执行模式
  executionMode: ExecutionModeType;  // 'sequential' | 'parallel' | 'hybrid'
  parallelExecution?: boolean;       // 是否并行执行
  
  // 优先级和超时
  priority?: Priority;               // 'low' | 'medium' | 'high' | 'critical'
  timeout?: number;                  // 超时时间(ms)
  
  // 错误处理
  retryPolicy?: RetryPolicy;         // 重试策略
  errorHandling?: ErrorHandlingConfig; // 错误处理配置
}
```

### **WorkflowResult** (工作流结果)

```typescript
interface WorkflowResult {
  // 基础信息
  workflowId: string;                // 工作流ID
  status: WorkflowStatusType;        // 执行状态
  
  // 执行结果
  results: Record<string, any>;      // 各阶段结果
  errors?: Error[];                  // 错误列表
  
  // 性能指标
  executionTime: number;             // 执行时间(ms)
  resourceUsage: ResourceUsage;      // 资源使用情况
  
  // 元数据
  startTime: Date;                   // 开始时间
  endTime: Date;                     // 结束时间
  metadata?: Record<string, any>;    // 自定义元数据
}
```

## 🚀 主要API

### **initializeCoreOrchestrator()**

初始化CoreOrchestrator实例。

```typescript
async function initializeCoreOrchestrator(
  options?: CoreOrchestratorOptions
): Promise<CoreOrchestratorResult>
```

**参数**:
- `options`: 可选的初始化选项

**返回值**:
```typescript
interface CoreOrchestratorResult {
  orchestrator: CoreOrchestrator;           // 协调器实例
  interfaceActivator: ReservedInterfaceActivator; // 接口激活器
  healthCheck: () => Promise<HealthStatus>; // 健康检查
  shutdown: () => Promise<void>;            // 关闭函数
  getStatistics: () => Statistics;          // 获取统计信息
  getModuleInfo: () => ModuleInfo;          // 获取模块信息
}
```

**示例**:
```typescript
const coreResult = await initializeCoreOrchestrator({
  environment: 'production',
  enableLogging: true,
  enableMetrics: true,
  maxConcurrentWorkflows: 1000,
  workflowTimeout: 300000
});

const orchestrator = coreResult.orchestrator;
```

### **CoreOrchestrator.executeWorkflow()**

执行完整的多模块工作流。

```typescript
async executeWorkflow(
  requestOrWorkflowId: WorkflowExecutionRequest | string
): Promise<WorkflowResult>
```

**参数**:
- `requestOrWorkflowId`: 工作流执行请求或工作流ID

**示例**:
```typescript
const result = await orchestrator.executeWorkflow({
  workflowId: 'workflow-001',
  contextId: 'context-001',
  workflowConfig: {
    stages: ['context', 'plan', 'confirm', 'trace'],
    executionMode: 'sequential',
    priority: 'high',
    timeout: 300000
  },
  executionContext: {
    userId: 'user-001',
    sessionId: 'session-001'
  }
});

console.log('工作流状态:', result.status);
console.log('执行时间:', result.executionTime, 'ms');
```

### **CoreOrchestrator.coordinateModules()**

协调多个模块的操作。

```typescript
async coordinateModules(
  modules: string[],
  operation: string,
  parameters: Record<string, unknown>
): Promise<CoordinationResult>
```

**参数**:
- `modules`: 要协调的模块列表
- `operation`: 操作类型
- `parameters`: 操作参数

**示例**:
```typescript
const coordination = await orchestrator.coordinateModules(
  ['context', 'plan', 'role'],
  'sync_state',
  {
    contextId: 'context-001',
    syncMode: 'full'
  }
);
```

### **CoreOrchestrator.manageResources()**

管理系统资源分配。

```typescript
async manageResources(
  requirements: ResourceRequirements
): Promise<ResourceAllocation>
```

**参数**:
- `requirements`: 资源需求

**示例**:
```typescript
const allocation = await orchestrator.manageResources({
  cpu: { cores: 4, priority: 'high' },
  memory: { size: 8192, unit: 'MB' },
  network: { bandwidth: 1000, unit: 'Mbps' }
});
```

## 📊 辅助API

### **健康检查**

```typescript
const health = await coreResult.healthCheck();
console.log('系统状态:', health.status);
console.log('活跃工作流:', health.activeWorkflows);
```

### **获取统计信息**

```typescript
const stats = coreResult.getStatistics();
console.log('总工作流数:', stats.totalWorkflows);
console.log('成功率:', stats.successRate);
```

### **获取模块信息**

```typescript
const info = coreResult.getModuleInfo();
console.log('模块名称:', info.name);
console.log('支持的模块:', info.supportedModules);
```

### **关闭协调器**

```typescript
await coreResult.shutdown();
console.log('CoreOrchestrator已安全关闭');
```

## 🔧 高级功能

### **预留接口激活**

```typescript
// 激活与其他模块的预留接口
await coreResult.interfaceActivator.activateInterface('context');
await coreResult.interfaceActivator.activateInterface('plan');
```

### **自定义工作流阶段**

```typescript
const customWorkflow = await orchestrator.executeWorkflow({
  workflowId: 'custom-001',
  contextId: 'context-001',
  workflowConfig: {
    stages: ['context', 'plan', 'role', 'confirm', 'trace'],
    executionMode: 'hybrid',
    parallelExecution: true,
    priority: 'critical'
  }
});
```

## 📝 类型定义

### **WorkflowStageType**

```typescript
type WorkflowStageType = 
  | 'context' | 'plan' | 'role' | 'confirm' 
  | 'trace' | 'extension' | 'dialog' 
  | 'collab' | 'network';
```

### **ExecutionModeType**

```typescript
type ExecutionModeType = 
  | 'sequential'  // 顺序执行
  | 'parallel'    // 并行执行
  | 'hybrid';     // 混合模式
```

### **WorkflowStatusType**

```typescript
type WorkflowStatusType = 
  | 'pending'     // 等待中
  | 'running'     // 运行中
  | 'completed'   // 已完成
  | 'failed'      // 失败
  | 'cancelled';  // 已取消
```

## 🎯 最佳实践

1. **生产环境配置**
   ```typescript
   const coreResult = await initializeCoreOrchestrator({
     environment: 'production',
     enableMetrics: true,
     enableCaching: true,
     maxConcurrentWorkflows: 1000
   });
   ```

2. **错误处理**
   ```typescript
   try {
     const result = await orchestrator.executeWorkflow(request);
   } catch (error) {
     console.error('工作流执行失败:', error);
     // 实施错误恢复策略
   }
   ```

3. **资源管理**
   ```typescript
   // 执行完成后释放资源
   await coreResult.shutdown();
   ```

---

**相关文档**:
- [配置指南](./configuration-guide.md)
- [实现指南](./implementation-guide.md)
- [集成示例](./integration-examples.md)
- [性能指南](./performance-guide.md)
- [测试指南](./testing-guide.md)

