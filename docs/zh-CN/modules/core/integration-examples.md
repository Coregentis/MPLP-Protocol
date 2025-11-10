# Core模块集成示例

> **🌐 语言导航**: [English](../../../en/modules/core/integration-examples.md) | [中文](integration-examples.md)

**CoreOrchestrator与其他模块集成 - MPLP v1.0 Alpha**

[![集成](https://img.shields.io/badge/guide-集成示例-blue.svg)](./README.md)
[![版本](https://img.shields.io/badge/version-1.0.0--alpha-green.svg)](../../../../ALPHA-RELEASE-NOTES.md)

---

## 🎯 概述

本文档提供CoreOrchestrator与MPLP其他9个模块集成的完整示例。

## 🔄 与Context模块集成

### **创建和管理上下文**

```typescript
import { initializeCoreOrchestrator } from 'mplp/modules/core';
import { ContextController } from 'mplp/modules/context';

// 1. 初始化Core和Context
const coreResult = await initializeCoreOrchestrator();
const contextController = new ContextController();

// 2. 创建上下文
const context = await contextController.createContext({
  name: '多智能体协作上下文',
  description: '用于多智能体协作的共享上下文',
  type: 'collaboration'
});

// 3. 使用Core协调上下文操作
const workflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'context-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context'],
    executionMode: 'sequential'
  },
  executionContext: {
    userId: 'user-001',
    operation: 'context_management'
  }
});
```

## 📋 与Plan模块集成

### **规划和执行工作流**

```typescript
import { PlanController } from 'mplp/modules/plan';

// 1. 创建规划
const planController = new PlanController();
const plan = await planController.createPlan({
  contextId: context.contextId,
  name: '多阶段工作流规划',
  description: '包含多个执行阶段的复杂规划',
  planType: 'workflow'
});

// 2. 使用Core执行规划工作流
const planWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'plan-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'plan'],
    executionMode: 'sequential',
    priority: 'high'
  },
  executionContext: {
    userId: 'user-001',
    planId: plan.planId
  }
});
```

## 👥 与Role模块集成

### **角色权限管理**

```typescript
import { RoleController } from 'mplp/modules/role';

// 1. 创建角色
const roleController = new RoleController();
const role = await roleController.createRole({
  contextId: context.contextId,
  name: '工作流管理员',
  description: '负责管理和执行工作流',
  roleType: 'admin'
});

// 2. 使用Core协调角色验证
const roleWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'role-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'role'],
    executionMode: 'sequential',
    security: {
      requireAuthorization: true,
      allowedRoles: ['admin']
    }
  },
  executionContext: {
    userId: 'user-001',
    userRoles: ['admin']
  }
});
```

## ✅ 与Confirm模块集成

### **审批工作流**

```typescript
import { ConfirmController } from 'mplp/modules/confirm';

// 1. 创建审批请求
const confirmController = new ConfirmController();
const confirm = await confirmController.createConfirm({
  contextId: context.contextId,
  planId: plan.planId,
  requesterId: 'user-001',
  confirmType: 'approval',
  priority: 'high'
});

// 2. 使用Core执行审批工作流
const approvalWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'approval-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'plan', 'role', 'confirm'],
    executionMode: 'sequential',
    priority: 'high'
  },
  executionContext: {
    userId: 'user-001',
    confirmId: confirm.confirmId
  }
});
```

## 📊 与Trace模块集成

### **执行监控和跟踪**

```typescript
import { TraceController } from 'mplp/modules/trace';

// 1. 创建跟踪记录
const traceController = new TraceController();
const trace = await traceController.createTrace({
  contextId: context.contextId,
  planId: plan.planId,
  traceType: 'workflow_execution',
  status: 'active'
});

// 2. 使用Core执行完整监控工作流
const monitoringWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'monitoring-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'plan', 'confirm', 'trace'],
    executionMode: 'sequential',
    monitoring: {
      enabled: true,
      collectMetrics: true
    }
  },
  executionContext: {
    userId: 'user-001',
    traceId: trace.traceId
  }
});
```

## 🔌 与Extension模块集成

### **扩展管理**

```typescript
import { ExtensionController } from 'mplp/modules/extension';

// 1. 注册扩展
const extensionController = new ExtensionController();
const extension = await extensionController.registerExtension({
  contextId: context.contextId,
  name: '自定义工作流扩展',
  extensionType: 'workflow',
  version: '1.0.0'
});

// 2. 使用Core协调扩展
const extensionWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'extension-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'extension'],
    executionMode: 'sequential'
  },
  executionContext: {
    userId: 'user-001',
    extensionId: extension.extensionId
  }
});
```

## 💬 与Dialog模块集成

### **对话驱动工作流**

```typescript
import { DialogController } from 'mplp/modules/dialog';

// 1. 创建对话
const dialogController = new DialogController();
const dialog = await dialogController.createDialog({
  contextId: context.contextId,
  dialogType: 'workflow_interaction',
  participants: ['user-001', 'agent-001']
});

// 2. 使用Core执行对话驱动工作流
const dialogWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'dialog-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'dialog'],
    executionMode: 'sequential'
  },
  executionContext: {
    userId: 'user-001',
    dialogId: dialog.dialogId
  }
});
```

## 🤝 与Collab模块集成

### **多智能体协作**

```typescript
import { CollabController } from 'mplp/modules/collab';

// 1. 创建协作会话
const collabController = new CollabController();
const collab = await collabController.createCollaboration({
  contextId: context.contextId,
  collabType: 'multi_agent',
  participants: ['agent-001', 'agent-002', 'agent-003']
});

// 2. 使用Core协调多智能体协作
const collabWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'collab-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'collab'],
    executionMode: 'parallel',
    parallelExecution: true
  },
  executionContext: {
    userId: 'user-001',
    collabId: collab.collabId
  }
});
```

## 🌐 与Network模块集成

### **分布式通信**

```typescript
import { NetworkController } from 'mplp/modules/network';

// 1. 建立网络连接
const networkController = new NetworkController();
const network = await networkController.createNetwork({
  contextId: context.contextId,
  networkType: 'distributed',
  nodes: ['node-001', 'node-002', 'node-003']
});

// 2. 使用Core协调分布式工作流
const networkWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'network-workflow-001',
  contextId: context.contextId,
  workflowConfig: {
    stages: ['context', 'network'],
    executionMode: 'parallel',
    distributed: true
  },
  executionContext: {
    userId: 'user-001',
    networkId: network.networkId
  }
});
```

## 🎯 完整集成示例

### **端到端多模块工作流**

```typescript
// 1. 初始化所有模块
const coreResult = await initializeCoreOrchestrator({
  environment: 'production',
  enableLogging: true,
  enableMetrics: true,
  maxConcurrentWorkflows: 1000
});

// 2. 创建完整的多模块工作流
const fullWorkflow = await coreResult.orchestrator.executeWorkflow({
  workflowId: 'full-workflow-001',
  contextId: 'context-001',
  workflowConfig: {
    // 包含所有9个模块
    stages: [
      'context',
      'plan',
      'role',
      'confirm',
      'trace',
      'extension',
      'dialog',
      'collab',
      'network'
    ],
    executionMode: 'hybrid',
    parallelExecution: true,
    priority: 'critical',
    timeout: 600000,
    retryPolicy: {
      maxRetries: 3,
      backoffMs: 1000
    }
  },
  executionContext: {
    userId: 'user-001',
    sessionId: 'session-001',
    metadata: {
      source: 'api',
      version: '1.0.0',
      environment: 'production'
    }
  }
});

// 3. 检查执行结果
console.log('工作流状态:', fullWorkflow.status);
console.log('执行时间:', fullWorkflow.executionTime, 'ms');
console.log('各阶段结果:', fullWorkflow.results);

// 4. 获取统计信息
const stats = coreResult.getStatistics();
console.log('总工作流数:', stats.totalWorkflows);
console.log('成功率:', stats.successRate);
```

## 🔄 模块协调示例

### **批量模块协调**

```typescript
// 协调多个模块的状态同步
const coordination = await coreResult.orchestrator.coordinateModules(
  ['context', 'plan', 'role', 'confirm', 'trace'],
  'sync_state',
  {
    contextId: 'context-001',
    syncMode: 'full',
    priority: 'high',
    timeout: 60000
  }
);

console.log('协调状态:', coordination.status);
console.log('协调结果:', coordination.results);
```

### **预留接口批量激活**

```typescript
// 激活所有模块的预留接口
const modules = [
  'context', 'plan', 'role', 'confirm', 'trace',
  'extension', 'dialog', 'collab', 'network'
];

for (const module of modules) {
  await coreResult.interfaceActivator.activateInterface(module);
  console.log(`${module}模块预留接口已激活`);
}
```

---

**相关文档**:
- [API参考](./api-reference.md)
- [配置指南](./configuration-guide.md)
- [实现指南](./implementation-guide.md)
- [性能指南](./performance-guide.md)
- [测试指南](./testing-guide.md)

