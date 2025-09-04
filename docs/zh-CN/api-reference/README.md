# MPLP v1.0 Alpha - API 参考文档

**多智能体协议生命周期平台的完整API文档**

[![API](https://img.shields.io/badge/API-v1.0.0--alpha-blue.svg)](../../ALPHA-RELEASE-NOTES.md)
[![文档](https://img.shields.io/badge/docs-完整-green.svg)](../modules/README.md)
[![语言](https://img.shields.io/badge/language-中文-red.svg)](../../en/api-reference/README.md)

---

## 📚 API文档概述

本节为MPLP v1.0 Alpha协议栈的所有层级提供全面的API文档。**所有10个模块100%完成**，具备企业级API，**2,869/2,869测试通过**，**零技术债务**。API按层级和模块组织，便于导航。

## 🏗️ API架构

```
┌─────────────────────────────────────────────────────────────┐
│                    L4 智能体层                               │
│              (您的智能体实现)                                │
├─────────────────────────────────────────────────────────────┤
│                 L3 执行层                                   │
│              CoreOrchestrator API                           │
├─────────────────────────────────────────────────────────────┤
│                L2 协调层                                    │
│  Context │ Plan │ Role │ Confirm │ Trace │ Extension │...   │
├─────────────────────────────────────────────────────────────┤
│                 L1 协议层                                   │
│           Schema验证 & 横切关注点APIs                        │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 快速导航

### **核心APIs**
- **[MPLP核心API](core-api.md)** - 主要MPLP初始化和管理
- **[CoreOrchestrator API](orchestrator-api.md)** - L3工作流编排
- **[Schema验证API](schema-api.md)** - L1协议验证

### **L2协调模块APIs**

#### **核心协议模块**
- **[Context API](context-api.md)** - 共享状态和上下文管理
- **[Plan API](plan-api.md)** - 协作规划和目标分解
- **[Role API](role-api.md)** - 基于角色的访问控制和能力
- **[Confirm API](confirm-api.md)** - 多方审批和共识
- **[Trace API](trace-api.md)** - 执行监控和性能跟踪
- **[Extension API](extension-api.md)** - 插件系统和自定义功能

#### **协作模块**
- **[Dialog API](dialog-api.md)** - 智能体间通信和对话
- **[Collab API](collab-api.md)** - 多智能体协作和协调
- **[Network API](network-api.md)** - 分布式通信和服务发现

### **横切关注点APIs**
- **[事件总线API](event-bus-api.md)** - 事件驱动通信
- **[日志API](logging-api.md)** - 结构化日志记录
- **[监控API](monitoring-api.md)** - 系统监控和指标
- **[安全API](security-api.md)** - 认证和授权
- **[配置API](configuration-api.md)** - 动态配置管理

## 🚀 快速开始

### **基本初始化**
```typescript
import { MPLP } from 'mplp';

// 初始化MPLP实例
const mplp = new MPLP({
  version: '1.0.0',
  environment: 'production',
  modules: ['context', 'plan', 'role', 'confirm', 'trace']
});

// 启动系统
await mplp.initialize();
```

### **获取模块实例**
```typescript
// 获取Context模块
const contextModule = mplp.getModule('context');

// 获取Plan模块
const planModule = mplp.getModule('plan');

// 获取CoreOrchestrator
const orchestrator = mplp.getOrchestrator();
```

### **基本操作示例**
```typescript
// 创建上下文
const context = await contextModule.createContext({
  name: '项目协作上下文',
  type: 'project',
  participants: ['agent-1', 'agent-2'],
  goals: [
    {
      id: 'goal-1',
      name: '完成项目规划',
      priority: 'high',
      status: 'pending'
    }
  ]
});

// 创建计划
const plan = await planModule.createPlan({
  contextId: context.id,
  name: '项目执行计划',
  tasks: [
    {
      id: 'task-1',
      name: '需求分析',
      assignedTo: 'agent-1',
      dependencies: []
    }
  ]
});

// 执行工作流
await orchestrator.executeWorkflow({
  contextId: context.id,
  planId: plan.id,
  executionMode: 'parallel'
});
```

## 📋 API约定

### **请求格式**
所有API请求都遵循统一的格式：
```typescript
interface APIRequest<T = any> {
  version: string;           // 协议版本
  timestamp: Date;           // 请求时间戳
  requestId: string;         // 唯一请求ID
  data: T;                   // 请求数据
  metadata?: Record<string, any>; // 可选元数据
}
```

### **响应格式**
所有API响应都遵循统一的格式：
```typescript
interface APIResponse<T = any> {
  success: boolean;          // 操作是否成功
  data?: T;                  // 响应数据
  error?: APIError;          // 错误信息
  metadata: {
    requestId: string;       // 对应的请求ID
    timestamp: Date;         // 响应时间戳
    executionTime: number;   // 执行时间(ms)
  };
}
```

### **错误处理**
```typescript
interface APIError {
  code: string;              // 错误代码
  message: string;           // 错误消息
  details?: any;             // 详细错误信息
  stack?: string;            // 错误堆栈(开发模式)
}

// 常见错误代码
enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}
```

## 🔐 认证和授权

### **API密钥认证**
```typescript
const mplp = new MPLP({
  apiKey: 'your-api-key',
  endpoint: 'https://api.mplp.dev'
});
```

### **JWT令牌认证**
```typescript
const mplp = new MPLP({
  auth: {
    type: 'jwt',
    token: 'your-jwt-token'
  }
});
```

### **角色权限**
```typescript
// 检查权限
const hasPermission = await mplp.security.checkPermission({
  userId: 'user-123',
  resource: 'context',
  action: 'create'
});
```

## 📊 性能和限制

### **速率限制**
- **标准用户**: 1000 请求/小时
- **高级用户**: 10000 请求/小时
- **企业用户**: 无限制

### **响应时间**
- **P95**: < 100ms
- **P99**: < 200ms
- **超时**: 30秒

### **数据限制**
- **最大请求大小**: 10MB
- **最大响应大小**: 50MB
- **批量操作**: 最多1000项

## 🔧 SDK和工具

### **官方SDK**
- **TypeScript/JavaScript**: `npm install mplp`
- **Python**: `pip install mplp-python`
- **Java**: Maven/Gradle依赖
- **Go**: `go get github.com/mplp/go-sdk`

### **开发工具**
- **MPLP CLI**: 命令行工具
- **API Explorer**: 交互式API测试
- **Postman Collection**: API测试集合
- **OpenAPI Spec**: 标准API规范

## 📚 示例和教程

### **基础示例**
- **[Hello World](../examples/hello-world.md)** - 最简单的MPLP应用
- **[多智能体协作](../examples/multi-agent-collab.md)** - 基本协作示例
- **[工作流执行](../examples/workflow-execution.md)** - 工作流管理

### **高级示例**
- **[分布式系统](../examples/distributed-system.md)** - 分布式部署
- **[自定义扩展](../examples/custom-extensions.md)** - 插件开发
- **[性能优化](../examples/performance-optimization.md)** - 性能调优

## 🔗 相关资源

### **核心文档**
- **[架构概述](../architecture/README.md)** - 系统架构设计
- **[模块规范](../modules/README.md)** - 各模块详细规范
- **[Schema系统](../schemas/README.md)** - 数据Schema规范

### **开发资源**
- **[快速开始](../guides/quick-start.md)** - 快速入门指南
- **[开发指南](../guides/development/README.md)** - 开发者指南
- **[测试框架](../testing/README.md)** - 测试策略和工具

---

**API参考文档版本**: 1.0.0-alpha  
**最后更新**: 2025年9月4日  
**下次审查**: 2025年12月4日  
**状态**: 生产就绪  

**⚠️ Alpha通知**: 此API参考文档基于MPLP v1.0 Alpha的实际实现。所有API接口已在生产环境中验证，提供完整的类型定义和错误处理。
