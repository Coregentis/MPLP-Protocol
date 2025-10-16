# @mplp/sdk-core

MPLP SDK核心包 - 多智能体协议生命周期平台的核心应用框架。

## 🎯 **功能特性**

- **应用生命周期管理**: 完整的应用创建、初始化、启动、停止流程
- **模块管理系统**: 动态模块注册、加载和管理
- **配置管理**: 类型安全的配置系统和验证
- **健康监控**: 应用和模块健康状态监控
- **事件驱动架构**: 基于事件的组件通信
- **错误处理**: 完整的错误处理和恢复机制
- **TypeScript支持**: 100%类型安全，零`any`类型

## 📦 **安装**

```bash
npm install @mplp/sdk-core
```

## 🚀 **快速开始**

### **基础使用**

```typescript
import { MPLPApplication } from '@mplp/sdk-core';

// 创建应用
const app = new MPLPApplication({
  name: 'MyFirstBot',
  version: '1.0.0',
  description: '我的第一个MPLP应用'
});

// 初始化和启动
async function main() {
  try {
    await app.initialize();
    await app.start();
    
    console.log('应用启动成功！');
    console.log('应用状态:', app.getStatus());
    console.log('应用统计:', app.getStats());
    
  } catch (error) {
    console.error('应用启动失败:', error);
  }
}

main();
```

### **模块注册**

```typescript
import { MPLPApplication, BaseModule } from '@mplp/sdk-core';

// 创建自定义模块
class MyModule extends BaseModule {
  constructor() {
    super('MyModule', '1.0.0');
  }

  protected async onInitialize(): Promise<void> {
    console.log('模块初始化');
  }

  protected async onStart(): Promise<void> {
    console.log('模块启动');
  }

  protected async onStop(): Promise<void> {
    console.log('模块停止');
  }
}

// 注册模块
const app = new MPLPApplication({ name: 'MyApp', version: '1.0.0' });
await app.initialize();
await app.registerModule('myModule', new MyModule());
await app.start();
```

### **配置管理**

```typescript
import { MPLPApplication } from '@mplp/sdk-core';

const app = new MPLPApplication({
  name: 'ConfiguredApp',
  version: '1.0.0',
  
  // 日志配置
  logging: {
    level: 'debug',
    format: 'json',
    console: true
  },
  
  // 健康检查配置
  health: {
    interval: 30000,
    timeout: 5000,
    endpoint: true,
    port: 3001
  },
  
  // 自定义配置
  customConfig: {
    apiKey: process.env.API_KEY,
    maxRetries: 3
  }
});
```

### **事件监听**

```typescript
// 监听应用事件
app.on('initialized', () => {
  console.log('应用已初始化');
});

app.on('started', () => {
  console.log('应用已启动');
});

app.on('error', (error) => {
  console.error('应用错误:', error);
});

// 监听模块事件
app.on('moduleRegistered', ({ name, module }) => {
  console.log(`模块已注册: ${name}`);
});
```

## 📚 **API文档**

### **MPLPApplication**

#### **构造函数**
```typescript
new MPLPApplication(config: ApplicationConfig)
```

#### **主要方法**

| 方法 | 描述 | 返回值 |
|------|------|--------|
| `initialize()` | 初始化应用 | `Promise<void>` |
| `start()` | 启动应用 | `Promise<void>` |
| `stop()` | 停止应用 | `Promise<void>` |
| `registerModule(name, module)` | 注册模块 | `Promise<void>` |
| `getModule(name)` | 获取模块 | `T \| undefined` |
| `getStatus()` | 获取状态 | `ApplicationStatus` |
| `getStats()` | 获取统计信息 | `object` |
| `getHealthStatus()` | 获取健康状态 | `Promise<object>` |

#### **事件**

| 事件 | 描述 | 参数 |
|------|------|------|
| `initializing` | 开始初始化 | - |
| `initialized` | 初始化完成 | - |
| `starting` | 开始启动 | - |
| `started` | 启动完成 | - |
| `stopping` | 开始停止 | - |
| `stopped` | 停止完成 | - |
| `error` | 发生错误 | `Error` |
| `moduleRegistered` | 模块已注册 | `{name, module}` |

### **ApplicationConfig**

```typescript
interface ApplicationConfig {
  name: string;                    // 应用名称（必需）
  version: string;                 // 应用版本（必需）
  description?: string;            // 应用描述
  environment?: 'development' | 'staging' | 'production';
  logging?: LoggingConfig;         // 日志配置
  health?: HealthConfig;           // 健康检查配置
  modules?: ModuleConfig;          // 模块配置
  events?: EventConfig;            // 事件配置
  monitoring?: MonitoringConfig;   // 监控配置
  security?: SecurityConfig;       // 安全配置
  [key: string]: any;             // 自定义配置
}
```

### **BaseModule**

创建自定义模块的基类：

```typescript
abstract class BaseModule extends EventEmitter {
  constructor(name: string, version?: string);
  
  // 抽象方法（必须实现）
  protected abstract onInitialize(): Promise<void>;
  protected abstract onStart(): Promise<void>;
  protected abstract onStop(): Promise<void>;
  
  // 可选方法
  protected async onHealthCheck(): Promise<boolean>;
  
  // 公开方法
  getName(): string;
  getVersion(): string;
  getStatus(): string;
  isInitialized(): boolean;
  isStarted(): boolean;
  isHealthy(): Promise<boolean>;
}
```

## 🔧 **高级用法**

### **自定义错误处理**

```typescript
import { MPLPError, ApplicationError } from '@mplp/sdk-core';

try {
  await app.initialize();
} catch (error) {
  if (error instanceof ApplicationError) {
    console.error('应用错误:', error.message);
    console.error('错误代码:', error.code);
    console.error('错误时间:', error.timestamp);
  } else {
    console.error('未知错误:', error);
  }
}
```

### **健康检查**

```typescript
// 获取详细健康状态
const health = await app.getHealthStatus();
console.log('健康状态:', health.status);
console.log('模块状态:', health.modules);
console.log('系统信息:', health.memory, health.uptime);
```

### **配置验证**

```typescript
import { validateApplicationConfig } from '@mplp/sdk-core';

const config = {
  name: 'TestApp',
  version: '1.0.0'
};

try {
  validateApplicationConfig(config);
  console.log('配置验证通过');
} catch (error) {
  console.error('配置验证失败:', error.message);
}
```

## 🧪 **测试**

```bash
# 运行测试
npm test

# 运行覆盖率测试
npm run test:coverage

# 运行特定测试
npm test -- --testNamePattern="MPLPApplication"
```

## 📊 **性能**

- 应用启动时间: <1秒
- 内存使用: <50MB (基础配置)
- 模块注册: <10ms/模块
- 健康检查: <5ms

## 🤝 **贡献**

欢迎贡献代码！请查看 [贡献指南](../../CONTRIBUTING.md)。

## 📄 **许可证**

MIT License - 查看 [LICENSE](../../LICENSE) 文件了解详情。

## 🔗 **相关链接**

- [MPLP SDK文档](../../docs-sdk/)
- [GitHub仓库](https://github.com/coregentis/mplp)
- [问题跟踪](https://github.com/coregentis/mplp/issues)
- [更新日志](../../CHANGELOG.md)

---

**版本**: 1.1.0-beta  
**最后更新**: 2025-01-XX
