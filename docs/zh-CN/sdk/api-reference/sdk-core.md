# MPLP SDK Core API 参考

> **📚 版本**: v1.1.0-beta  
> **🎯 目标**: 完整的SDK核心API文档  
> **🌐 语言**: [English](../../docs-sdk-en/api-reference/sdk-core.md) | 中文

---

## 📋 **目录**

- [MPLP类](#mplp类)
- [工厂函数](#工厂函数)
- [配置接口](#配置接口)
- [模块管理](#模块管理)
- [版本信息](#版本信息)
- [类型定义](#类型定义)

---

## 🏗️ **MPLP类**

MPLP主类是SDK的核心入口点，提供统一的API来初始化和使用MPLP的所有功能。

### **构造函数**

```typescript
constructor(config?: MPLPConfig)
```

**参数**:
- `config` (可选): MPLP配置对象

**示例**:
```typescript
import { MPLP } from 'mplp';

// 使用默认配置
const mplp = new MPLP();

// 使用自定义配置
const mplp = new MPLP({
  environment: 'production',
  logLevel: 'warn',
  modules: ['context', 'plan', 'role']
});
```

---

### **initialize()**

初始化MPLP实例，加载所有配置的模块。

```typescript
async initialize(): Promise<void>
```

**返回值**: `Promise<void>`

**异常**:
- 如果已经初始化，抛出`Error`
- 如果模块加载失败，抛出`Error`

**示例**:
```typescript
const mplp = new MPLP();
await mplp.initialize();
console.log('MPLP initialized successfully');
```

---

### **getModule()**

获取已加载的模块实例。

```typescript
getModule<T = any>(moduleName: string): T | undefined
```

**参数**:
- `moduleName`: 模块名称 ('context' | 'plan' | 'role' | 'confirm' | 'trace' | 'extension' | 'dialog' | 'collab' | 'core' | 'network')

**返回值**: 模块实例或`undefined`（如果模块未加载）

**示例**:
```typescript
// 获取Context模块
const contextModule = mplp.getModule('context');
if (contextModule) {
  // 使用Context模块
  console.log('Context module loaded');
}

// 获取Plan模块
const planModule = mplp.getModule('plan');
```

---

### **getVersion()**

获取MPLP版本信息。

```typescript
getVersion(): string
```

**返回值**: 版本字符串 (例如: "1.1.0-beta")

**示例**:
```typescript
const version = mplp.getVersion();
console.log('MPLP Version:', version); // "1.1.0-beta"
```

---

### **getLoadedModules()**

获取已加载的模块列表。

```typescript
getLoadedModules(): string[]
```

**返回值**: 模块名称数组

**示例**:
```typescript
const modules = mplp.getLoadedModules();
console.log('Loaded modules:', modules);
// ['context', 'plan', 'role']
```

---

### **isInitialized()**

检查MPLP是否已初始化。

```typescript
isInitialized(): boolean
```

**返回值**: `true`如果已初始化，否则`false`

**示例**:
```typescript
if (mplp.isInitialized()) {
  console.log('MPLP is ready');
} else {
  await mplp.initialize();
}
```

---

### **getConfig()**

获取当前配置。

```typescript
getConfig(): Readonly<MPLPConfig>
```

**返回值**: 只读的配置对象

**示例**:
```typescript
const config = mplp.getConfig();
console.log('Environment:', config.environment);
console.log('Log Level:', config.logLevel);
```

---

## 🏭 **工厂函数**

SDK提供了便捷的工厂函数来快速创建MPLP实例。

### **createMPLP()**

创建并初始化MPLP实例。

```typescript
async function createMPLP(config?: MPLPConfig): Promise<MPLP>
```

**参数**:
- `config` (可选): MPLP配置对象

**返回值**: 已初始化的MPLP实例

**示例**:
```typescript
import { createMPLP } from 'mplp';

// 创建并初始化
const mplp = await createMPLP({
  environment: 'development',
  modules: ['context', 'plan']
});

// 立即可用
const contextModule = mplp.getModule('context');
```

---

### **quickStart()**

快速启动MPLP，使用默认配置加载所有模块。

```typescript
async function quickStart(): Promise<MPLP>
```

**返回值**: 已初始化的MPLP实例（加载所有10个模块）

**示例**:
```typescript
import { quickStart } from 'mplp';

// 一行代码启动
const mplp = await quickStart();

// 所有模块已加载
console.log('Loaded modules:', mplp.getLoadedModules());
// ['context', 'plan', 'role', 'confirm', 'trace', 'extension', 'dialog', 'collab', 'core', 'network']
```

---

### **createProductionMPLP()**

创建生产环境优化的MPLP实例。

```typescript
async function createProductionMPLP(config?: Partial<MPLPConfig>): Promise<MPLP>
```

**参数**:
- `config` (可选): 额外的配置选项

**返回值**: 已初始化的MPLP实例

**特性**:
- 环境设置为`production`
- 日志级别设置为`warn`
- 性能优化配置

**示例**:
```typescript
import { createProductionMPLP } from 'mplp';

const mplp = await createProductionMPLP({
  modules: ['context', 'plan', 'role', 'core']
});
```

---

### **createTestMPLP()**

创建测试环境的MPLP实例。

```typescript
async function createTestMPLP(config?: Partial<MPLPConfig>): Promise<MPLP>
```

**参数**:
- `config` (可选): 额外的配置选项

**返回值**: 已初始化的MPLP实例

**特性**:
- 环境设置为`test`
- 日志级别设置为`debug`
- 测试友好配置

**示例**:
```typescript
import { createTestMPLP } from 'mplp';

// 在测试中使用
describe('My Agent Tests', () => {
  let mplp: MPLP;

  beforeEach(async () => {
    mplp = await createTestMPLP();
  });

  it('should work correctly', () => {
    expect(mplp.isInitialized()).toBe(true);
  });
});
```

---

## ⚙️ **配置接口**

### **MPLPConfig**

MPLP配置接口定义。

```typescript
interface MPLPConfig {
  // 协议版本
  protocolVersion?: string;
  
  // 运行环境
  environment?: 'development' | 'production' | 'test';
  
  // 日志级别
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  
  // 要加载的模块列表
  modules?: ModuleName[];
  
  // 自定义配置
  customConfig?: Record<string, any>;
}
```

**字段说明**:

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `protocolVersion` | `string` | `'1.1.0-beta'` | MPLP协议版本 |
| `environment` | `'development' \| 'production' \| 'test'` | `'development'` | 运行环境 |
| `logLevel` | `'debug' \| 'info' \| 'warn' \| 'error'` | `'info'` | 日志级别 |
| `modules` | `ModuleName[]` | 所有模块 | 要加载的模块列表 |
| `customConfig` | `Record<string, any>` | `{}` | 自定义配置对象 |

**示例**:
```typescript
const config: MPLPConfig = {
  protocolVersion: '1.1.0-beta',
  environment: 'production',
  logLevel: 'warn',
  modules: ['context', 'plan', 'role', 'core'],
  customConfig: {
    appName: 'MyApp',
    features: ['feature1', 'feature2']
  }
};
```

---

## 📦 **模块管理**

### **可用模块列表**

MPLP提供10个核心模块：

```typescript
type ModuleName = 
  | 'context'    // 上下文管理
  | 'plan'       // 计划编排
  | 'role'       // 角色权限
  | 'confirm'    // 确认审批
  | 'trace'      // 执行追踪
  | 'extension'  // 扩展管理
  | 'dialog'     // 对话管理
  | 'collab'     // 协作管理
  | 'core'       // 核心编排
  | 'network';   // 网络通信
```

### **模块加载示例**

```typescript
// 加载特定模块
const mplp = await createMPLP({
  modules: ['context', 'plan', 'role']
});

// 检查模块是否加载
const hasContext = mplp.getLoadedModules().includes('context');

// 获取模块实例
const contextModule = mplp.getModule('context');
const planModule = mplp.getModule('plan');
const roleModule = mplp.getModule('role');
```

---

## 📊 **版本信息**

### **MPLP_VERSION**

当前MPLP版本常量。

```typescript
const MPLP_VERSION: string = "1.1.0-beta";
```

**示例**:
```typescript
import { MPLP_VERSION } from 'mplp';
console.log('MPLP Version:', MPLP_VERSION);
```

---

### **MPLP_INFO**

完整的MPLP项目信息。

```typescript
const MPLP_INFO: {
  readonly name: "MPLP";
  readonly version: "1.1.0-beta";
  readonly fullName: "Multi-Agent Protocol Lifecycle Platform";
  readonly description: string;
  readonly architecture: "L1-L3 Layered Architecture";
  readonly status: "Production Ready";
  readonly modules: readonly ModuleName[];
  readonly capabilities: string[];
  readonly license: "MIT";
  readonly repository: string;
  readonly documentation: string;
}
```

**示例**:
```typescript
import { MPLP_INFO } from 'mplp';

console.log('Project:', MPLP_INFO.fullName);
console.log('Version:', MPLP_INFO.version);
console.log('Modules:', MPLP_INFO.modules);
console.log('Status:', MPLP_INFO.status);
```

---

## 🔧 **完整使用示例**

### **基础使用**

```typescript
import { MPLP } from 'mplp';

async function basicExample() {
  // 创建实例
  const mplp = new MPLP({
    environment: 'development',
    logLevel: 'info',
    modules: ['context', 'plan', 'role']
  });

  // 初始化
  await mplp.initialize();

  // 获取版本
  console.log('Version:', mplp.getVersion());

  // 获取模块
  const contextModule = mplp.getModule('context');
  const planModule = mplp.getModule('plan');

  // 使用模块...
}
```

### **快速启动**

```typescript
import { quickStart } from 'mplp';

async function quickExample() {
  // 一行启动
  const mplp = await quickStart();

  // 立即使用
  console.log('Loaded:', mplp.getLoadedModules());
}
```

### **生产环境**

```typescript
import { createProductionMPLP } from 'mplp';

async function productionExample() {
  const mplp = await createProductionMPLP({
    modules: ['context', 'plan', 'role', 'core']
  });

  // 生产环境优化配置已应用
  console.log('Environment:', mplp.getConfig().environment); // 'production'
  console.log('Log Level:', mplp.getConfig().logLevel);     // 'warn'
}
```

---

## 📚 **相关文档**

- [第一个Agent教程](../getting-started/first-agent.md)
- [模块API参考](../../docs/en/api-reference/)
- [最佳实践指南](../guides/best-practices.md)
- [完整示例](../examples/)

---

**版本**: v1.1.0-beta  
**更新时间**: 2025-10-22  
**维护者**: MPLP Team

