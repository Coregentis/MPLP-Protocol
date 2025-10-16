# MPLP核心API参考文档

> **🌐 语言导航**: [English](../../en/api-reference/core-api.md) | [中文](core-api.md)



**主要MPLP初始化和管理API**

[![Core](https://img.shields.io/badge/module-Core-blue.svg)](../modules/core/README.md)
[![API](https://img.shields.io/badge/API-v1.0.0--alpha-green.svg)](./README.md)
[![测试](https://img.shields.io/badge/tests-584%2F584%20通过-green.svg)](../testing/README.md)
[![语言](https://img.shields.io/badge/language-中文-red.svg)](../../en/api-reference/core-api.md)

---

## 🎯 概述

`MPLPCore` 类是MPLP v1.0 Alpha协议栈的主要入口点。它提供初始化、配置和访问所有L1-L3层组件的功能。

## 📦 导入

```typescript
import { MPLPCore, MPLPConfig } from 'mplp';
```

## 🏗️ 构造函数

### `new MPLPCore(config?: MPLPConfig)`

使用可选配置创建新的MPLP实例。

```typescript
const mplp = new MPLPCore({
  version: '1.0.0-alpha',
  environment: 'development',
  logLevel: 'info'
});
```

#### **参数**

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `config` | `MPLPConfig` | 否 | 配置选项 |

#### **MPLPConfig接口**

```typescript
interface MPLPConfig {
  // 核心设置
  version?: string;                    // MPLP版本 (默认: '1.0.0-alpha')
  environment?: 'development' | 'testing' | 'production'; // 环境
  logLevel?: 'debug' | 'info' | 'warn' | 'error';        // 日志级别
  
  // 认证
  auth?: {
    type: 'bearer' | 'basic' | 'custom';
    token?: string;
    credentials?: Record<string, unknown>;
  };
  
  // 模块配置
  modules?: {
    enabled: string[];                 // 启用的模块列表
    config: Record<string, any>;       // 模块特定配置
  };
  
  // 网络配置
  network?: {
    endpoint?: string;                 // API端点
    timeout?: number;                  // 请求超时(ms)
    retries?: number;                  // 重试次数
    rateLimit?: {
      requests: number;                // 请求数量
      window: number;                  // 时间窗口(ms)
    };
  };
  
  // 存储配置
  storage?: {
    type: 'memory' | 'redis' | 'mongodb' | 'custom';
    connection?: string;               // 连接字符串
    options?: Record<string, any>;     // 存储选项
  };
  
  // 监控配置
  monitoring?: {
    enabled: boolean;                  // 是否启用监控
    metricsInterval?: number;          // 指标收集间隔(ms)
    healthCheckInterval?: number;      // 健康检查间隔(ms)
  };
}
```

## 🚀 主要方法

### **初始化**

#### `async initialize(): Promise<void>`

初始化MPLP系统和所有启用的模块。

```typescript
const mplp = new MPLPCore({
  modules: {
    enabled: ['context', 'plan', 'role', 'confirm', 'trace'],
    config: {
      context: { maxContexts: 1000 },
      plan: { maxPlans: 500 }
    }
  }
});

await mplp.initialize();
console.log('MPLP系统初始化完成');
```

#### `async shutdown(): Promise<void>`

优雅地关闭MPLP系统。

```typescript
// 应用程序关闭时
process.on('SIGTERM', async () => {
  await mplp.shutdown();
  process.exit(0);
});
```

### **模块管理**

#### `getModule<T>(name: string): T`

获取指定模块的实例。

```typescript
// 获取Context模块
const contextModule = mplp.getModule('context');

// 获取Plan模块
const planModule = mplp.getModule('plan');

// 获取Role模块
const roleModule = mplp.getModule('role');
```

#### `hasModule(name: string): boolean`

检查模块是否已加载。

```typescript
if (mplp.hasModule('context')) {
  const contextModule = mplp.getModule('context');
  // 使用context模块
}
```

#### `getLoadedModules(): string[]`

获取所有已加载模块的名称列表。

```typescript
const loadedModules = mplp.getLoadedModules();
console.log('已加载的模块:', loadedModules);
```

### **编排器访问**

#### `getOrchestrator(): CoreOrchestrator`

获取CoreOrchestrator实例用于工作流编排。

```typescript
const orchestrator = mplp.getOrchestrator();

// 执行工作流
await orchestrator.executeWorkflow({
  contextId: 'ctx-123',
  planId: 'plan-456',
  executionMode: 'sequential'
});
```

### **配置管理**

#### `getConfig(): MPLPConfig`

获取当前配置。

```typescript
const config = mplp.getConfig();
console.log('当前环境:', config.environment);
```

#### `updateConfig(updates: Partial<MPLPConfig>): void`

更新配置（部分更新）。

```typescript
mplp.updateConfig({
  logLevel: 'debug',
  monitoring: {
    enabled: true,
    metricsInterval: 5000
  }
});
```

### **状态管理**

#### `getStatus(): MPLPStatus`

获取系统状态信息。

```typescript
interface MPLPStatus {
  initialized: boolean;              // 是否已初始化
  version: string;                   // 版本号
  uptime: number;                    // 运行时间(ms)
  modules: {
    [name: string]: {
      loaded: boolean;               // 是否已加载
      status: 'healthy' | 'degraded' | 'error'; // 模块状态
      lastCheck: Date;               // 最后检查时间
    };
  };
  performance: {
    memoryUsage: NodeJS.MemoryUsage; // 内存使用情况
    cpuUsage: NodeJS.CpuUsage;       // CPU使用情况
  };
}

const status = mplp.getStatus();
console.log('系统状态:', status);
```

#### `isHealthy(): boolean`

检查系统是否健康。

```typescript
if (mplp.isHealthy()) {
  console.log('系统运行正常');
} else {
  console.log('系统存在问题');
}
```

### **事件管理**

#### `on(event: string, listener: Function): void`

监听系统事件。

```typescript
// 监听模块加载事件
mplp.on('module:loaded', (moduleName) => {
  console.log(`模块 ${moduleName} 已加载`);
});

// 监听错误事件
mplp.on('error', (error) => {
  console.error('系统错误:', error);
});

// 监听状态变化
mplp.on('status:changed', (status) => {
  console.log('状态变化:', status);
});
```

#### `off(event: string, listener?: Function): void`

移除事件监听器。

```typescript
const errorHandler = (error) => console.error(error);

// 添加监听器
mplp.on('error', errorHandler);

// 移除特定监听器
mplp.off('error', errorHandler);

// 移除所有监听器
mplp.off('error');
```

#### `emit(event: string, ...args: any[]): void`

触发事件。

```typescript
// 触发自定义事件
mplp.emit('custom:event', { data: 'example' });
```

## 🔧 工具方法

### **日志记录**

#### `getLogger(name?: string): Logger`

获取日志记录器实例。

```typescript
const logger = mplp.getLogger('MyComponent');

logger.debug('调试信息');
logger.info('信息日志');
logger.warn('警告信息');
logger.error('错误信息');
```

### **指标收集**

#### `getMetrics(): Metrics`

获取系统指标。

```typescript
interface Metrics {
  requests: {
    total: number;                   // 总请求数
    successful: number;              // 成功请求数
    failed: number;                  // 失败请求数
    averageResponseTime: number;     // 平均响应时间
  };
  modules: {
    [name: string]: {
      operations: number;            // 操作次数
      errors: number;                // 错误次数
      averageExecutionTime: number;  // 平均执行时间
    };
  };
  system: {
    uptime: number;                  // 运行时间
    memoryUsage: number;             // 内存使用量
    cpuUsage: number;                // CPU使用率
  };
}

const metrics = mplp.getMetrics();
console.log('系统指标:', metrics);
```

### **健康检查**

#### `async healthCheck(): Promise<HealthCheckResult>`

执行完整的系统健康检查。

```typescript
interface HealthCheckResult {
  healthy: boolean;                  // 整体健康状态
  checks: {
    [component: string]: {
      healthy: boolean;              // 组件健康状态
      message?: string;              // 状态消息
      responseTime: number;          // 响应时间
    };
  };
  timestamp: Date;                   // 检查时间
}

const healthResult = await mplp.healthCheck();
if (healthResult.healthy) {
  console.log('所有组件运行正常');
} else {
  console.log('发现问题:', healthResult.checks);
}
```

## 🔐 安全功能

### **认证管理**

#### `authenticate(credentials: AuthCredentials): Promise<AuthResult>`

执行用户认证。

```typescript
const authResult = await mplp.authenticate({
  type: 'bearer',
  token: 'your-jwt-token'
});

if (authResult.success) {
  console.log('认证成功:', authResult.user);
}
```

### **权限检查**

#### `checkPermission(userId: string, resource: string, action: string): Promise<boolean>`

检查用户权限。

```typescript
const hasPermission = await mplp.checkPermission(
  'user-123',
  'context',
  'create'
);

if (hasPermission) {
  // 允许创建上下文
}
```

## 🚨 错误处理

MPLPCore使用标准的错误代码：

- `INITIALIZATION_FAILED`: 初始化失败
- `MODULE_NOT_FOUND`: 模块未找到
- `MODULE_LOAD_FAILED`: 模块加载失败
- `CONFIGURATION_ERROR`: 配置错误
- `AUTHENTICATION_FAILED`: 认证失败
- `PERMISSION_DENIED`: 权限不足

```typescript
try {
  await mplp.initialize();
} catch (error) {
  switch (error.code) {
    case 'INITIALIZATION_FAILED':
      console.error('初始化失败:', error.message);
      break;
    case 'MODULE_LOAD_FAILED':
      console.error('模块加载失败:', error.details);
      break;
    default:
      console.error('未知错误:', error);
  }
}
```

## 📊 使用示例

### **基本使用**

```typescript
import { MPLPCore } from 'mplp';

// 创建MPLP实例
const mplp = new MPLPCore({
  environment: 'production',
  modules: {
    enabled: ['context', 'plan', 'role', 'confirm'],
    config: {
      context: { maxContexts: 1000 },
      plan: { maxPlans: 500 }
    }
  },
  monitoring: {
    enabled: true,
    metricsInterval: 10000
  }
});

// 初始化系统
await mplp.initialize();

// 获取模块并使用
const contextModule = mplp.getModule('context');
const context = await contextModule.createContext({
  name: '示例上下文',
  type: 'project'
});

// 执行工作流
const orchestrator = mplp.getOrchestrator();
await orchestrator.executeWorkflow({
  contextId: context.id,
  steps: [
    { type: 'plan', action: 'create' },
    { type: 'confirm', action: 'approve' },
    { type: 'trace', action: 'monitor' }
  ]
});

// 关闭系统
await mplp.shutdown();
```

### **高级配置**

```typescript
const mplp = new MPLPCore({
  environment: 'production',
  auth: {
    type: 'bearer',
    token: process.env.MPLP_TOKEN
  },
  network: {
    endpoint: 'https://api.mplp.dev',
    timeout: 30000,
    retries: 3,
    rateLimit: {
      requests: 1000,
      window: 3600000 // 1小时
    }
  },
  storage: {
    type: 'redis',
    connection: 'redis://localhost:6379',
    options: {
      keyPrefix: 'mplp:',
      retryDelayOnFailover: 100
    }
  },
  monitoring: {
    enabled: true,
    metricsInterval: 5000,
    healthCheckInterval: 30000
  }
});
```

---

## 🔗 相关资源

- **[Core模块文档](../modules/core/README.md)** - 详细的模块规范
- **[CoreOrchestrator API](./orchestrator-api.md)** - 编排器API文档
- **[配置指南](../guides/configuration.md)** - 详细配置说明
- **[部署指南](../implementation/deployment-models.md)** - 部署最佳实践

---

**MPLP核心API版本**: 1.0.0-alpha  
**最后更新**: 2025年9月4日  
**状态**: 生产就绪  

**⚠️ Alpha通知**: MPLP核心API已在v1.0 Alpha中完全实现并验证，支持584/584测试用例，提供企业级的系统管理能力。
