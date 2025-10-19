# @mplp/dev-tools API参考文档

> **🌐 语言导航**: [English](../../../en/sdk-api/dev-tools/README.md) | [中文](README.md)


> **包名**: @mplp/dev-tools  
> **版本**: v1.1.0-beta  
> **更新时间**: 2025-09-20  
> **状态**: ✅ 生产就绪  

## 📚 **包概览**

`@mplp/dev-tools`包为MPLP应用程序提供全面的开发工具和实用程序，包括调试、监控、性能分析和日志管理。它提供编程API和CLI工具，以增强开发体验。

### **📦 包关系说明**

**重要**: MPLP开发工具 (`@mplp/dev-tools`) 是一个**仅用于开发的包**。对于MPLP应用程序，您需要：

1. **MPLP核心包** (`mplp@beta`): 包含L1-L3协议栈的主包（必需）
2. **MPLP开发工具** (`@mplp/dev-tools`): 开发和调试实用程序（可选）

### **🎯 关键功能**

- **🐛 调试工具**: 代理调试器、工作流调试器、协议检查器、状态检查器
- **📊 性能分析**: 指标收集、性能分析、基准测试、瓶颈检测
- **📈 实时监控**: 系统健康监控、仪表板、告警、资源跟踪
- **📝 日志管理**: 结构化日志、日志分析、日志查看器、搜索功能
- **🌐 Web仪表板**: 所有开发工具的实时Web界面
- **⚡ CLI工具**: 用于调试、监控和分析的命令行界面
- **🔧 集成**: 与MPLP应用程序和CI/CD管道的无缝集成

### **📦 安装**

#### **步骤1: 安装MPLP核心包** ⚡

```bash
# 安装MPLP核心包（必需）
npm install mplp@beta

# 验证安装
node -e "const mplp = require('mplp'); console.log('MPLP版本:', mplp.MPLP_VERSION);"
# 预期输出: MPLP版本: 1.1.0-beta
```

#### **步骤2: 安装开发工具（可选）**

```bash
# 本地安装（推荐）
npm install @mplp/dev-tools

# 全局安装CLI工具
npm install -g @mplp/dev-tools

# 验证开发工具安装
mplp-debug --version
```

### **🏗️ 架构**

```
┌─────────────────────────────────────────┐
│           @mplp/dev-tools               │
│         (开发工具套件)                  │
├─────────────────────────────────────────┤
│  DebugManager | PerformanceAnalyzer    │
│  MonitoringDashboard | LogManager      │
├─────────────────────────────────────────┤
│         专业化工具                      │
│  AgentDebugger | WorkflowDebugger      │
│  ProtocolInspector | StateInspector    │
├─────────────────────────────────────────┤
│         CLI和Web界面                    │
│  mplp-debug | mplp-monitor | Dashboard │
└─────────────────────────────────────────┘
```

## 🚀 **快速开始**

### **一体化设置**

```typescript
import { startDevTools } from '@mplp/dev-tools';

// 启动所有开发工具
await startDevTools({
  server: { port: 3002 },
  debug: { enabled: true, logLevel: 'info' },
  performance: { enabled: true, interval: 5000 },
  monitoring: { enabled: true, dashboard: true },
  logging: { enabled: true, structured: true }
});

console.log('🛠️ 所有开发工具已在 http://localhost:3002 启动');
```

### **单独工具使用**

```typescript
import { 
  DebugManager, 
  PerformanceAnalyzer, 
  MonitoringDashboard,
  LogManager 
} from '@mplp/dev-tools';

// 调试管理器
const debugManager = new DebugManager({
  enabled: true,
  logLevel: 'info',
  breakpoints: ['agent:created', 'workflow:started']
});
await debugManager.start();

// 性能分析器
const perfAnalyzer = new PerformanceAnalyzer();
await perfAnalyzer.start();
perfAnalyzer.recordMetric('response_time', 150);

// 监控仪表板
const monitor = new MonitoringDashboard({
  interval: 5000,
  alerts: true
});
await monitor.start();

// 日志管理器
const logManager = new LogManager({
  structured: true,
  level: 'info'
});
await logManager.start();
```

## 📋 **核心类**

### **DebugManager**

管理所有调试活动的中央调试协调器。

#### **构造函数**

```typescript
constructor(config?: DebugConfig)
```

**配置选项:**
```typescript
interface DebugConfig {
  enabled?: boolean;           // 启用调试（默认: true）
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  breakpoints?: string[];      // 初始断点
  watchExpressions?: string[]; // 监视表达式
  sessionTimeout?: number;     // 会话超时时间（毫秒）
}
```

#### **核心方法**

##### `start(): Promise<void>`

启动调试会话和所有子调试器。

```typescript
const debugManager = new DebugManager({
  enabled: true,
  logLevel: 'info'
});

await debugManager.start();
console.log('🐛 调试已启动');
```

##### `stop(): Promise<void>`

停止调试会话并清理资源。

```typescript
await debugManager.stop();
console.log('🐛 调试已停止');
```

##### `createSession(sessionId: string, target: any): DebugSession`

为特定目标创建新的调试会话。

```typescript
const session = debugManager.createSession('agent-123', myAgent);
console.log(`调试会话已创建: ${session.id}`);
```

##### `attachToAgent(agentId: string): Promise<void>`

将调试器附加到特定代理。

```typescript
await debugManager.attachToAgent('my-agent-id');
console.log('调试器已附加到代理');
```

##### `startWorkflowDebugging(workflowId: string, workflowName: string): Promise<void>`

开始调试特定工作流。

```typescript
await debugManager.startWorkflowDebugging('workflow-123', 'DataProcessing');
console.log('工作流调试已启动');
```

#### **断点管理**

##### `addBreakpoint(sessionId: string, location: string, condition?: string): void`

向调试会话添加断点。

```typescript
debugManager.addBreakpoint('session-1', 'agent:message:received', 'message.type === "urgent"');
```

##### `removeBreakpoint(sessionId: string, breakpointId: string): void`

移除特定断点。

```typescript
debugManager.removeBreakpoint('session-1', 'bp_1234567890');
```

#### **事件**

```typescript
debugManager.on('started', () => {
  console.log('调试管理器已启动');
});

debugManager.on('sessionCreated', (session) => {
  console.log(`新调试会话: ${session.id}`);
});

debugManager.on('breakpointHit', (event) => {
  console.log(`断点命中: ${event.location}`);
});

debugManager.on('error', (error) => {
  console.error('调试错误:', error);
});
```

### **PerformanceAnalyzer**

全面的性能监控和分析工具。

#### **构造函数**

```typescript
constructor(config?: PerformanceConfig)
```

#### **核心方法**

##### `start(): Promise<void>`

启动性能监控。

```typescript
const perfAnalyzer = new PerformanceAnalyzer({
  interval: 1000,
  metrics: ['cpu', 'memory', 'response_time']
});

await perfAnalyzer.start();
```

##### `recordMetric(name: string, value: number, tags?: Record<string, string>): void`

记录性能指标。

```typescript
perfAnalyzer.recordMetric('api_response_time', 245, {
  endpoint: '/api/agents',
  method: 'GET'
});
```

##### `getMetrics(name?: string): PerformanceMetric[]`

检索性能指标。

```typescript
// 获取所有指标
const allMetrics = perfAnalyzer.getMetrics();

// 获取特定指标
const responseTimeMetrics = perfAnalyzer.getMetrics('api_response_time');
```

##### `generateReport(): PerformanceReport`

生成全面的性能报告。

```typescript
const report = perfAnalyzer.generateReport();
console.log(`总体评分: ${report.overallScore}`);
console.log(`瓶颈数量: ${report.bottlenecks.length}`);
```

#### **性能分析方法**

##### `startProfiling(name: string): string`

启动性能分析会话。

```typescript
const profileId = perfAnalyzer.startProfiling('workflow_execution');
// ... 执行工作流
const duration = perfAnalyzer.endProfiling(profileId);
console.log(`工作流耗时 ${duration}ms`);
```

##### `benchmark(name: string, fn: () => Promise<any>, iterations?: number): Promise<BenchmarkResult>`

运行基准测试。

```typescript
const result = await perfAnalyzer.benchmark('agent_creation', async () => {
  return new MyAgent();
}, 100);

console.log(`平均时间: ${result.averageTime}ms`);
console.log(`最小/最大: ${result.minTime}ms / ${result.maxTime}ms`);
```

### **MonitoringDashboard**

实时系统监控和告警。

#### **构造函数**

```typescript
constructor(config?: MonitoringConfig)
```

#### **核心方法**

##### `start(): Promise<void>`

启动监控仪表板。

```typescript
const monitor = new MonitoringDashboard({
  interval: 5000,
  alerts: {
    enabled: true,
    thresholds: {
      cpu: 80,
      memory: 90,
      responseTime: 1000
    }
  }
});

await monitor.start();
```

##### `addAlert(name: string, condition: AlertCondition): void`

添加自定义告警条件。

```typescript
monitor.addAlert('high_error_rate', {
  metric: 'error_rate',
  threshold: 5,
  operator: '>',
  duration: 60000 // 1分钟
});
```

##### `getSystemHealth(): SystemHealthStatus`

获取当前系统健康状态。

```typescript
const health = monitor.getSystemHealth();
console.log(`系统状态: ${health.status}`);
console.log(`CPU: ${health.cpu}%, 内存: ${health.memory}%`);
```

### **LogManager**

具有结构化日志和分析功能的高级日志管理。

#### **构造函数**

```typescript
constructor(config?: LogConfig)
```

#### **核心方法**

##### `start(): Promise<void>`

启动日志管理器。

```typescript
const logManager = new LogManager({
  structured: true,
  level: 'info',
  outputs: ['console', 'file'],
  rotation: {
    enabled: true,
    maxSize: '10MB',
    maxFiles: 5
  }
});

await logManager.start();
```

##### 日志记录方法

```typescript
// 不同日志级别
logManager.debug('调试消息', 'module-name', { userId: '123' });
logManager.info('信息消息', 'module-name', { action: 'user_login' });
logManager.warn('警告消息', 'module-name', { warning: 'deprecated_api' });
logManager.error('错误消息', 'module-name', { error: 'connection_failed' }, error);
```

##### `searchEntries(query: string, filter?: LogFilter): LogEntry[]`

使用高级过滤搜索日志条目。

```typescript
const results = logManager.searchEntries('error', {
  level: 'error',
  timeRange: {
    start: new Date(Date.now() - 3600000), // 最近一小时
    end: new Date()
  },
  source: 'agent-manager'
});
```

##### `getStatistics(): LogStatistics`

获取日志统计和分析。

```typescript
const stats = logManager.getStatistics();
console.log(`总条目数: ${stats.totalEntries}`);
console.log(`错误率: ${stats.errorRate}%`);
```

## ⚡ **CLI工具**

### **全局命令**

```bash
# 全局安装CLI工具
npm install -g @mplp/dev-tools

# 启动所有开发工具
mplp-dev-tools start-all --port 3002

# 检查所有工具状态
mplp-dev-tools status

# 停止所有工具
mplp-dev-tools stop-all
```

### **调试CLI (mplp-debug)**

```bash
# 启动调试
mplp-debug --start

# 连接到应用程序
mplp-debug connect localhost:3000

# 设置断点
mplp-debug breakpoint add "agent:created"
mplp-debug breakpoint add "workflow:started" --condition "workflow.priority > 5"

# 检查对象
mplp-debug inspect agent <agentId>
mplp-debug inspect workflow <workflowId>
mplp-debug inspect context <contextId>

# 查看调试会话
mplp-debug sessions list
mplp-debug sessions attach <sessionId>
```

### **性能CLI (mplp-analyze)**

```bash
# 启动性能分析
mplp-analyze --start

# 记录自定义指标
mplp-analyze metric record "custom_metric" 123.45

# 生成性能报告
mplp-analyze report --format json --output performance-report.json

# 运行基准测试
mplp-analyze benchmark --name "agent_creation" --iterations 100

# 分析应用程序
mplp-analyze profile start --name "workflow_execution"
mplp-analyze profile stop --name "workflow_execution"
```

### **监控CLI (mplp-monitor)**

```bash
# 启动监控
mplp-monitor --start

# 查看系统健康状态
mplp-monitor health

# 设置告警
mplp-monitor alert add --name "high_cpu" --metric "cpu" --threshold 80

# 查看仪表板
mplp-monitor dashboard --open

# 导出指标
mplp-monitor export --format prometheus --output metrics.txt
```

## 🎯 **高级使用示例**

### **完整开发环境设置**

```typescript
import { 
  startDevTools, 
  DebugManager, 
  PerformanceAnalyzer, 
  MonitoringDashboard 
} from '@mplp/dev-tools';
import { MPLPApplication } from '@mplp/sdk-core';

// 创建MPLP应用程序
const app = new MPLPApplication({
  name: 'my-enterprise-app',
  version: '1.0.0'
});

// 启动全面的开发工具
await startDevTools({
  server: { 
    port: 3002,
    cors: true,
    authentication: false // 生产环境启用
  },
  debug: { 
    enabled: true,
    logLevel: 'info',
    breakpoints: ['agent:error', 'workflow:timeout']
  },
  performance: { 
    enabled: true,
    interval: 1000,
    metrics: ['cpu', 'memory', 'response_time', 'throughput']
  },
  monitoring: { 
    enabled: true,
    dashboard: true,
    alerts: {
      cpu: 80,
      memory: 90,
      errorRate: 5
    }
  }
});

// 与应用程序事件集成
app.on('agentCreated', (agent) => {
  console.log(`🤖 代理已创建: ${agent.id}`);
});

app.on('workflowStarted', (workflow) => {
  console.log(`🔄 工作流已启动: ${workflow.id}`);
});

console.log('🛠️ 开发环境已就绪，访问 http://localhost:3002');
```

### **CI/CD集成**

```yaml
# .github/workflows/performance-analysis.yml
name: 性能分析

on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: 设置Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: 安装依赖
        run: |
          npm install
          npm install -g @mplp/dev-tools
          
      - name: 运行性能分析
        run: |
          mplp-analyze --start
          npm test
          mplp-analyze report --format json --output performance-report.json
          mplp-analyze --stop
          
      - name: 上传性能报告
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: performance-report.json
```

### **生产监控设置**

```typescript
import { MonitoringDashboard, LogManager } from '@mplp/dev-tools';

// 生产监控配置
const monitor = new MonitoringDashboard({
  interval: 30000, // 30秒
  alerts: {
    enabled: true,
    thresholds: {
      cpu: 70,
      memory: 85,
      responseTime: 2000,
      errorRate: 1
    },
    notifications: {
      email: ['ops@company.com'],
      slack: '#alerts',
      webhook: 'https://hooks.company.com/alerts'
    }
  },
  retention: {
    metrics: '7d',
    logs: '30d'
  }
});

// 生产日志
const logManager = new LogManager({
  structured: true,
  level: 'warn', // 生产环境只记录警告和错误
  outputs: ['file', 'elasticsearch'],
  elasticsearch: {
    host: 'elasticsearch.company.com',
    index: 'mplp-logs'
  },
  rotation: {
    enabled: true,
    maxSize: '100MB',
    maxFiles: 10
  }
});

await Promise.all([
  monitor.start(),
  logManager.start()
]);

console.log('📊 生产监控已激活');
```

## 🔗 **相关文档**

- [SDK Core API](../sdk-core/README.md) - 应用框架和生命周期管理
- [Agent Builder API](../agent-builder/README.md) - 构建和管理智能代理
- [Orchestrator API](../orchestrator/README.md) - 多智能体工作流编排
- [CLI Tools](../cli/README.md) - 开发和部署实用程序

---

**包维护者**: MPLP Dev Tools团队  
**最后审查**: 2025-09-20  
**Node.js要求**: >=18.0.0  
**状态**: ✅ 生产就绪
