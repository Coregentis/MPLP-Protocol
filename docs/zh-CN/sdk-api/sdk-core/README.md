# @mplp/sdk-core API参考文档

> **🌐 语言导航**: [English](../../../en/sdk-api/sdk-core/README.md) | [中文](README.md)


> **包名**: @mplp/sdk-core  
> **版本**: v1.1.0  
> **更新时间**: 2025-09-20  
> **状态**: ✅ 生产就绪  

## 📚 **包概览**

`@mplp/sdk-core`包提供了构建多智能体协议生命周期平台的基础应用框架。它处理应用生命周期管理、配置、健康监控和核心系统协调。

### **🎯 关键功能**

- **应用生命周期管理**: 完整的应用创建、初始化、启动和关闭流程
- **模块管理系统**: 动态模块注册、加载和管理
- **配置管理**: 类型安全的配置系统，支持验证和热重载
- **健康监控**: 应用和模块健康状态监控，包含指标
- **事件驱动架构**: 基于事件的组件通信和协调
- **错误处理**: 全面的错误处理和恢复机制
- **TypeScript支持**: 100%类型安全，零`any`类型
- **企业功能**: 生产就绪，包含监控、日志和诊断

### **📦 安装**

```bash
npm install @mplp/sdk-core
```

### **🏗️ 架构**

```
┌─────────────────────────────────────────┐
│           MPLPApplication               │
│        (主应用编排器)                   │
├─────────────────────────────────────────┤
│  ConfigManager | ModuleManager         │
│  HealthChecker | EventBus | Logger     │
├─────────────────────────────────────────┤
│         MPLP V1.0 Alpha协议            │
│    (Context, Plan, Role, Confirm...)   │
└─────────────────────────────────────────┘
```

## 🚀 **快速开始**

### **基础应用设置**

```typescript
import { MPLPApplication } from '@mplp/sdk-core';

// 使用基础配置创建应用
const app = new MPLPApplication({
  name: 'MyFirstApp',
  version: '1.0.0',
  description: '我的第一个MPLP应用',
  environment: 'development'
});

// 初始化并启动
await app.initialize();
await app.start();

console.log('应用启动成功！');
```

### **高级配置**

```typescript
import { MPLPApplication, LogLevel } from '@mplp/sdk-core';

const app = new MPLPApplication({
  name: 'ProductionApp',
  version: '2.1.0',
  environment: 'production',
  config: {
    logging: {
      level: LogLevel.INFO,
      enableConsole: true,
      enableFile: true,
      filePath: './logs/app.log'
    },
    health: {
      checkInterval: 30000,
      enableMetrics: true,
      metricsPort: 9090
    },
    modules: {
      autoLoad: true,
      loadTimeout: 10000
    }
  }
});
```

## 📋 **核心类**

### **MPLPApplication**

主应用类，编排所有核心组件并管理应用生命周期。

#### **构造函数**

```typescript
constructor(config?: Partial<MPLPApplicationConfig>)
```

**参数:**
- `config` (可选): 应用配置对象

**示例:**
```typescript
const app = new MPLPApplication({
  name: 'MyApp',
  version: '1.0.0',
  environment: 'development'
});
```

#### **方法**

##### `initialize(): Promise<void>`

初始化应用和所有注册的模块。

```typescript
await app.initialize();
```

**抛出异常:**
- `ApplicationInitializationError` - 如果初始化失败
- `ModuleLoadError` - 如果模块加载失败

##### `start(): Promise<void>`

启动应用并开始处理。

```typescript
await app.start();
```

**抛出异常:**
- `ApplicationStartError` - 如果启动失败

##### `stop(): Promise<void>`

优雅地停止应用和所有模块。

```typescript
await app.stop();
```

##### `restart(): Promise<void>`

重启应用（停止 + 启动）。

```typescript
await app.restart();
```

##### `getStatus(): ApplicationStatus`

返回当前应用状态。

```typescript
const status = app.getStatus();
console.log(`应用状态: ${status.state}`); // 'initializing' | 'running' | 'stopped' | 'error'
```

##### `getHealth(): HealthStatus`

返回全面的健康信息。

```typescript
const health = await app.getHealth();
console.log(`健康状态: ${health.status}`); // 'healthy' | 'degraded' | 'unhealthy'
```

##### `registerModule(name: string, module: IModule): void`

向应用注册自定义模块。

```typescript
import { IModule } from '@mplp/sdk-core';

class CustomModule implements IModule {
  async initialize(): Promise<void> {
    // 模块初始化逻辑
  }
  
  async start(): Promise<void> {
    // 模块启动逻辑
  }
  
  async stop(): Promise<void> {
    // 模块清理逻辑
  }
}

app.registerModule('custom', new CustomModule());
```

#### **事件**

MPLPApplication在其生命周期中发出各种事件：

```typescript
app.on('initialized', () => {
  console.log('应用已初始化');
});

app.on('started', () => {
  console.log('应用已启动');
});

app.on('stopped', () => {
  console.log('应用已停止');
});

app.on('error', (error) => {
  console.error('应用错误:', error);
});

app.on('health-changed', (health) => {
  console.log('健康状态变更:', health);
});
```

### **ConfigManager**

管理应用配置，具有类型安全和验证功能。

#### **方法**

##### `get<T>(key: string): T`

通过键获取配置值。

```typescript
const dbUrl = app.config.get<string>('database.url');
const port = app.config.get<number>('server.port');
```

##### `set<T>(key: string, value: T): void`

设置配置值。

```typescript
app.config.set('server.port', 3000);
app.config.set('database.url', 'mongodb://localhost:27017');
```

##### `has(key: string): boolean`

检查配置键是否存在。

```typescript
if (app.config.has('redis.url')) {
  // Redis已配置
}
```

##### `validate(): ValidationResult`

验证当前配置。

```typescript
const result = app.config.validate();
if (!result.valid) {
  console.error('配置错误:', result.errors);
}
```

### **ModuleManager**

管理动态模块加载和生命周期。

#### **方法**

##### `register(name: string, module: IModule): void`

注册模块。

```typescript
app.modules.register('analytics', new AnalyticsModule());
```

##### `unregister(name: string): void`

注销模块。

```typescript
app.modules.unregister('analytics');
```

##### `get<T extends IModule>(name: string): T | undefined`

获取已注册的模块。

```typescript
const analytics = app.modules.get<AnalyticsModule>('analytics');
```

##### `getAll(): Map<string, IModule>`

获取所有已注册的模块。

```typescript
const allModules = app.modules.getAll();
for (const [name, module] of allModules) {
  console.log(`模块: ${name}`);
}
```

### **HealthChecker**

监控应用和模块健康状态。

#### **方法**

##### `check(): Promise<HealthStatus>`

执行全面的健康检查。

```typescript
const health = await app.health.check();
console.log(`整体健康状态: ${health.status}`);
console.log(`检查项: ${health.checks.length}`);
```

##### `addCheck(name: string, check: HealthCheck): void`

添加自定义健康检查。

```typescript
app.health.addCheck('database', async () => {
  try {
    await database.ping();
    return { status: 'healthy', message: '数据库连接正常' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
});
```

##### `removeCheck(name: string): void`

移除健康检查。

```typescript
app.health.removeCheck('database');
```

### **EventBus**

提供组件间的事件驱动通信。

#### **方法**

##### `emit(event: string, ...args: any[]): boolean`

发出事件。

```typescript
app.events.emit('user-action', { userId: '123', action: 'login' });
```

##### `on(event: string, listener: (...args: any[]) => void): this`

注册事件监听器。

```typescript
app.events.on('user-action', (data) => {
  console.log(`用户 ${data.userId} 执行了 ${data.action}`);
});
```

##### `off(event: string, listener: (...args: any[]) => void): this`

移除事件监听器。

```typescript
app.events.off('user-action', myListener);
```

##### `once(event: string, listener: (...args: any[]) => void): this`

注册一次性事件监听器。

```typescript
app.events.once('startup-complete', () => {
  console.log('应用启动完成');
});
```

## 🔧 **配置架构**

### **MPLPApplicationConfig**

```typescript
interface MPLPApplicationConfig {
  name: string;
  version: string;
  description?: string;
  environment: 'development' | 'staging' | 'production';
  config?: {
    logging?: LoggingConfig;
    health?: HealthConfig;
    modules?: ModuleConfig;
    events?: EventConfig;
  };
}
```

### **LoggingConfig**

```typescript
interface LoggingConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  maxFileSize?: number;
  maxFiles?: number;
  format?: 'json' | 'text';
}
```

### **HealthConfig**

```typescript
interface HealthConfig {
  checkInterval: number;
  enableMetrics: boolean;
  metricsPort?: number;
  endpoint?: string;
  timeout?: number;
}
```

## 🎯 **使用示例**

### **企业应用设置**

```typescript
import { MPLPApplication, LogLevel } from '@mplp/sdk-core';

const app = new MPLPApplication({
  name: 'EnterpriseBot',
  version: '3.2.1',
  environment: 'production',
  config: {
    logging: {
      level: LogLevel.INFO,
      enableConsole: false,
      enableFile: true,
      filePath: '/var/log/mplp/app.log',
      format: 'json'
    },
    health: {
      checkInterval: 15000,
      enableMetrics: true,
      metricsPort: 9090,
      endpoint: '/health'
    }
  }
});

// 添加自定义健康检查
app.health.addCheck('external-api', async () => {
  try {
    const response = await fetch('https://api.example.com/health');
    return response.ok 
      ? { status: 'healthy', message: 'API可访问' }
      : { status: 'unhealthy', message: 'API无响应' };
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
});

// 处理优雅关闭
process.on('SIGTERM', async () => {
  console.log('收到SIGTERM，正在优雅关闭');
  await app.stop();
  process.exit(0);
});

// 启动应用
await app.initialize();
await app.start();
```

### **开发环境热重载**

```typescript
import { MPLPApplication, LogLevel } from '@mplp/sdk-core';

const app = new MPLPApplication({
  name: 'DevApp',
  version: '1.0.0-dev',
  environment: 'development',
  config: {
    logging: {
      level: LogLevel.DEBUG,
      enableConsole: true,
      format: 'text'
    }
  }
});

// 启用开发功能
if (process.env.NODE_ENV === 'development') {
  // 监听配置变更
  app.config.enableHotReload();
  
  // 启用详细错误报告
  app.on('error', (error) => {
    console.error('详细错误:', error.stack);
  });
}
```

## 🔗 **相关文档**

- [Agent Builder API](../agent-builder/README.md) - 构建智能代理
- [Orchestrator API](../orchestrator/README.md) - 管理多智能体工作流
- [Platform Adapters API](../adapters/README.md) - 集成外部平台
- [CLI Tools](../cli/README.md) - 命令行开发工具

---

**包维护者**: MPLP SDK核心团队  
**最后审查**: 2025-09-20  
**测试覆盖率**: 100% (45/45测试通过)  
**状态**: ✅ 生产就绪
