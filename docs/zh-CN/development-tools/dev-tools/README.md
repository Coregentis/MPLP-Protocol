# MPLP开发工具 - 完整开发与调试指南

> **🌐 语言导航**: [English](../../../en/development-tools/dev-tools/README.md) | [中文](README.md)


> **包名**: @mplp/dev-tools  
> **版本**: v1.1.0-beta  
> **更新时间**: 2025-09-20  
> **状态**: ✅ 生产就绪  

## 📚 **概览**

MPLP开发工具为多智能体协议生命周期平台应用程序提供了全面的开发和调试实用程序套件。它提供实时监控、性能分析、调试工具和分析功能，以增强开发体验并确保最佳应用程序性能。

### **📦 包关系说明**

**重要**: MPLP开发工具 (`@mplp/dev-tools`) 是一个**仅用于开发的包**，用于调试和监控。对于MPLP应用程序，您需要：

1. **MPLP核心包** (`mplp@beta`): 包含L1-L3协议栈和所有10个核心模块的主包（必需）
2. **MPLP开发工具** (`@mplp/dev-tools`): 开发和调试实用程序（可选，仅用于开发）

**快速开始**:
```bash
# 安装MPLP核心包（必需）
npm install mplp@beta

# 作为开发依赖安装开发工具（可选）
npm install --save-dev @mplp/dev-tools
```

### **🎯 关键功能**

- **📊 实时监控**: 智能体活动、协议通信和系统指标的实时监控
- **⚡ 性能分析**: 详细的性能分析、瓶颈检测和优化建议
- **🐛 高级调试**: 交互式调试工具、断点和逐步执行
- **📈 分析仪表板**: 带有可视化和报告的综合分析
- **🔍 协议检查器**: MPLP协议消息和工作流的深度检查
- **🚨 错误跟踪**: 高级错误跟踪、日志记录和警报系统
- **🔧 开发实用程序**: 代码生成助手、测试实用程序和开发快捷方式
- **📱 实时重载**: 热模块替换和实时重载，加快开发周期

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
# 作为开发依赖安装（推荐）
npm install --save-dev @mplp/dev-tools

# 全局安装用于CLI使用
npm install -g @mplp/dev-tools

# 使用yarn
yarn add --dev @mplp/dev-tools

# 使用pnpm
pnpm add -D @mplp/dev-tools
```

## 🚀 **快速开始**

### **基础设置**

```typescript
import { DevTools, DevToolsConfig } from '@mplp/dev-tools';

// 初始化开发工具
const devTools = new DevTools({
  enabled: process.env.NODE_ENV === 'development',
  port: 3001,
  monitoring: {
    agents: true,
    protocols: true,
    performance: true
  },
  debugging: {
    breakpoints: true,
    stepThrough: true,
    variableInspection: true
  }
});

// 启动开发工具服务器
await devTools.start();

console.log('🛠️ MPLP开发工具运行在 http://localhost:3001');
```

### **与MPLP应用程序集成**

```typescript
import { MPLPApplication } from '@mplp/sdk-core';
import { DevTools } from '@mplp/dev-tools';

const app = new MPLPApplication({
  name: 'MyAgent',
  version: '1.0.0'
});

// 在开发环境中附加开发工具
if (process.env.NODE_ENV === 'development') {
  const devTools = new DevTools();
  await devTools.attach(app);
}

await app.start();
```

## 📊 **实时监控**

### **智能体活动监控器**

实时跟踪智能体生命周期、状态变化和交互。

```typescript
import { AgentMonitor } from '@mplp/dev-tools';

const monitor = new AgentMonitor({
  trackLifecycle: true,
  trackStateChanges: true,
  trackInteractions: true,
  updateInterval: 1000 // 1秒
});

// 监控特定智能体
monitor.watchAgent('ChatBot', {
  onStateChange: (agent, oldState, newState) => {
    console.log(`智能体 ${agent.name}: ${oldState} → ${newState}`);
  },
  onInteraction: (agent, interaction) => {
    console.log(`智能体 ${agent.name} 交互:`, interaction);
  },
  onError: (agent, error) => {
    console.error(`智能体 ${agent.name} 错误:`, error);
  }
});

// 监控所有智能体
monitor.watchAll({
  filter: (agent) => agent.type === 'conversational',
  metrics: ['responseTime', 'successRate', 'errorRate']
});
```

### **协议通信监控器**

监控MPLP协议消息和通信模式。

```typescript
import { ProtocolMonitor } from '@mplp/dev-tools';

const protocolMonitor = new ProtocolMonitor({
  captureMessages: true,
  analyzePatterns: true,
  detectAnomalies: true
});

// 监控协议层
protocolMonitor.watchProtocol('L2-Coordination', {
  onMessage: (message) => {
    console.log('协议消息:', {
      type: message.type,
      source: message.source,
      target: message.target,
      payload: message.payload
    });
  },
  onPattern: (pattern) => {
    console.log('检测到通信模式:', pattern);
  },
  onAnomaly: (anomaly) => {
    console.warn('协议异常:', anomaly);
  }
});

// 导出通信日志
const logs = await protocolMonitor.exportLogs({
  format: 'json',
  timeRange: { start: Date.now() - 3600000, end: Date.now() },
  includePayloads: true
});
```

### **系统指标仪表板**

实时系统性能和资源使用监控。

```typescript
import { MetricsDashboard } from '@mplp/dev-tools';

const dashboard = new MetricsDashboard({
  port: 3002,
  updateInterval: 5000,
  metrics: [
    'cpu',
    'memory',
    'eventLoop',
    'httpRequests',
    'agentCount',
    'protocolMessages'
  ]
});

// 启动指标仪表板
await dashboard.start();

// 自定义指标
dashboard.addMetric('customMetric', {
  name: '智能体响应时间',
  type: 'histogram',
  description: '智能体响应时间分布',
  collect: async () => {
    // 自定义指标收集逻辑
    return await getAgentResponseTimes();
  }
});

// 警报
dashboard.addAlert('highMemoryUsage', {
  condition: (metrics) => metrics.memory.usage > 0.8,
  message: '内存使用率超过80%',
  severity: 'warning'
});
```

## ⚡ **性能分析**

### **性能分析器**

详细的性能分析和瓶颈检测。

```typescript
import { PerformanceProfiler } from '@mplp/dev-tools';

const profiler = new PerformanceProfiler({
  sampleRate: 100, // 每100毫秒采样
  trackFunctions: true,
  trackAsyncOperations: true,
  trackMemoryAllocations: true
});

// 开始分析
profiler.start();

// 分析特定操作
const profile = await profiler.profile(async () => {
  // 要分析的代码
  const result = await agent.processMessage(message);
  return result;
});

console.log('性能分析:', {
  duration: profile.duration,
  cpuUsage: profile.cpuUsage,
  memoryUsage: profile.memoryUsage,
  hotspots: profile.hotspots
});

// 生成性能报告
const report = await profiler.generateReport({
  format: 'html',
  includeFlameGraph: true,
  includeCallTree: true
});
```

### **瓶颈检测器**

自动检测和分析性能瓶颈。

```typescript
import { BottleneckDetector } from '@mplp/dev-tools';

const detector = new BottleneckDetector({
  thresholds: {
    responseTime: 1000, // 1秒
    cpuUsage: 0.8,      // 80%
    memoryUsage: 0.9,   // 90%
    eventLoopDelay: 100 // 100毫秒
  },
  analysisWindow: 60000 // 1分钟
});

detector.on('bottleneck', (bottleneck) => {
  console.log('检测到瓶颈:', {
    type: bottleneck.type,
    severity: bottleneck.severity,
    location: bottleneck.location,
    suggestions: bottleneck.suggestions
  });
});

// 手动瓶颈分析
const analysis = await detector.analyze({
  timeRange: { start: Date.now() - 3600000, end: Date.now() },
  includeRecommendations: true
});
```

### **内存泄漏检测器**

检测和分析MPLP应用程序中的内存泄漏。

```typescript
import { MemoryLeakDetector } from '@mplp/dev-tools';

const leakDetector = new MemoryLeakDetector({
  checkInterval: 30000, // 30秒
  thresholds: {
    heapGrowth: 10 * 1024 * 1024, // 10MB
    objectCount: 10000
  }
});

leakDetector.on('leak', (leak) => {
  console.warn('检测到内存泄漏:', {
    type: leak.type,
    size: leak.size,
    objects: leak.objects,
    stackTrace: leak.stackTrace
  });
});

// 获取堆快照
const snapshot = await leakDetector.takeSnapshot();
await snapshot.save('./heap-snapshot.heapsnapshot');
```

## 🐛 **高级调试**

### **交互式调试器**

带有断点和变量检查的逐步调试。

```typescript
import { InteractiveDebugger } from '@mplp/dev-tools';

const debugger = new InteractiveDebugger({
  port: 9229,
  breakOnExceptions: true,
  breakOnUncaughtExceptions: true
});

// 设置断点
debugger.setBreakpoint('src/agents/ChatBot.ts', 42);
debugger.setBreakpoint('src/workflows/MessageProcessing.ts', 15);

// 条件断点
debugger.setBreakpoint('src/agents/ChatBot.ts', 55, {
  condition: 'message.type === "error"'
});

// 启动调试会话
await debugger.start();

// 调试特定函数
debugger.debug(async () => {
  const result = await agent.processMessage(message);
  return result;
});
```

### **变量检查器**

在调试期间检查变量、对象和应用程序状态。

```typescript
import { VariableInspector } from '@mplp/dev-tools';

const inspector = new VariableInspector();

// 检查智能体状态
const agentState = inspector.inspect(agent, {
  depth: 3,
  includePrivate: true,
  includeFunctions: false
});

console.log('智能体状态:', agentState);

// 监视变量变化
inspector.watch('agent.state', (oldValue, newValue) => {
  console.log(`智能体状态变化: ${oldValue} → ${newValue}`);
});

// 评估表达式
const result = inspector.evaluate('agent.capabilities.length > 0');
console.log('具有能力:', result);
```

### **调用栈分析器**

分析调用栈和执行路径。

```typescript
import { CallStackAnalyzer } from '@mplp/dev-tools';

const analyzer = new CallStackAnalyzer({
  captureStackTraces: true,
  analyzeExecutionPaths: true,
  detectRecursion: true
});

// 分析当前调用栈
const stack = analyzer.getCurrentStack();
console.log('调用栈:', stack.frames);

// 检测无限递归
analyzer.on('recursion', (recursion) => {
  console.warn('潜在的无限递归:', {
    function: recursion.function,
    depth: recursion.depth,
    stackTrace: recursion.stackTrace
  });
});
```

## 📈 **分析仪表板**

### **基于Web的仪表板**

用于监控和分析的综合Web界面。

```typescript
import { WebDashboard } from '@mplp/dev-tools';

const dashboard = new WebDashboard({
  port: 3003,
  title: 'MPLP开发仪表板',
  theme: 'dark',
  features: {
    monitoring: true,
    profiling: true,
    debugging: true,
    analytics: true,
    logs: true
  }
});

// 添加自定义面板
dashboard.addPanel('agentMetrics', {
  title: '智能体指标',
  type: 'chart',
  data: async () => await getAgentMetrics(),
  refreshInterval: 5000
});

dashboard.addPanel('protocolFlow', {
  title: '协议流',
  type: 'network',
  data: async () => await getProtocolFlowData()
});

await dashboard.start();
```

### **自定义分析**

创建自定义分析和报告。

```typescript
import { Analytics } from '@mplp/dev-tools';

const analytics = new Analytics({
  storage: 'memory', // 或 'file', 'database'
  retentionPeriod: 7 * 24 * 60 * 60 * 1000 // 7天
});

// 跟踪自定义事件
analytics.track('agent.message.processed', {
  agentId: 'ChatBot',
  messageType: 'text',
  processingTime: 150,
  success: true
});

// 创建自定义指标
analytics.createMetric('averageResponseTime', {
  type: 'gauge',
  description: '平均智能体响应时间',
  calculate: (events) => {
    const times = events.map(e => e.processingTime);
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
});

// 生成报告
const report = await analytics.generateReport({
  timeRange: { start: Date.now() - 86400000, end: Date.now() },
  metrics: ['averageResponseTime', 'successRate', 'errorRate'],
  format: 'json'
});
```

## 🔍 **协议检查器**

### **消息检查器**

MPLP协议消息的深度检查。

```typescript
import { MessageInspector } from '@mplp/dev-tools';

const inspector = new MessageInspector({
  captureAll: true,
  validateSchema: true,
  analyzePatterns: true
});

// 检查特定消息
const inspection = inspector.inspect(message, {
  validateAgainstSchema: true,
  analyzePayload: true,
  checkCompliance: true
});

console.log('消息检查:', {
  valid: inspection.valid,
  errors: inspection.errors,
  warnings: inspection.warnings,
  metadata: inspection.metadata
});

// 消息流可视化
const flow = inspector.visualizeFlow(messages, {
  format: 'mermaid',
  includeTimestamps: true,
  groupByAgent: true
});
```

### **工作流调试器**

调试MPLP工作流和编排。

```typescript
import { WorkflowDebugger } from '@mplp/dev-tools';

const workflowDebugger = new WorkflowDebugger({
  trackExecution: true,
  captureState: true,
  validateTransitions: true
});

// 调试工作流执行
const execution = await workflowDebugger.debug(workflow, {
  input: testData,
  breakpoints: ['step2', 'step5'],
  stepThrough: true
});

console.log('工作流执行:', {
  steps: execution.steps,
  duration: execution.duration,
  errors: execution.errors,
  finalState: execution.finalState
});
```

## 🔧 **开发实用程序**

### **代码生成器**

生成样板代码和组件。

```typescript
import { CodeGenerator } from '@mplp/dev-tools';

const generator = new CodeGenerator({
  templatesDir: './templates',
  outputDir: './src/generated'
});

// 生成智能体类
await generator.generate('agent', {
  name: 'WeatherBot',
  capabilities: ['weather-query', 'location-detection'],
  platforms: ['discord', 'slack']
});

// 生成测试文件
await generator.generate('test', {
  target: 'src/agents/WeatherBot.ts',
  testType: 'unit',
  coverage: 'full'
});

// 自定义模板
await generator.generate('custom', {
  template: 'my-template',
  variables: {
    className: 'MyClass',
    methods: ['init', 'process', 'cleanup']
  }
});
```

### **测试实用程序**

MPLP应用程序的增强测试实用程序。

```typescript
import { TestUtils } from '@mplp/dev-tools';

const testUtils = new TestUtils();

// 模拟智能体
const mockAgent = testUtils.createMockAgent({
  name: 'TestAgent',
  capabilities: ['test-capability'],
  responses: {
    'hello': '你好！',
    'error': new Error('测试错误')
  }
});

// 模拟协议消息
const mockMessage = testUtils.createMockMessage({
  type: 'request',
  source: 'agent1',
  target: 'agent2',
  payload: { action: 'process', data: 'test' }
});

// 测试环境
const testEnv = await testUtils.createTestEnvironment({
  agents: [mockAgent],
  protocols: ['L2-Coordination'],
  monitoring: false
});

// 性能测试
const perfTest = await testUtils.performanceTest(async () => {
  return await agent.processMessage(mockMessage);
}, {
  iterations: 1000,
  warmup: 100,
  timeout: 5000
});
```

## 🚨 **错误跟踪和日志记录**

### **高级错误跟踪**

全面的错误跟踪和分析。

```typescript
import { ErrorTracker } from '@mplp/dev-tools';

const errorTracker = new ErrorTracker({
  captureStackTraces: true,
  groupSimilarErrors: true,
  trackErrorFrequency: true,
  alertThresholds: {
    errorRate: 0.05, // 5%
    criticalErrors: 1
  }
});

// 自动跟踪错误
errorTracker.install();

// 手动错误跟踪
errorTracker.captureError(error, {
  context: 'agent-processing',
  user: 'user123',
  extra: { messageId: 'msg456' }
});

// 错误分析
const analysis = await errorTracker.analyze({
  timeRange: { start: Date.now() - 3600000, end: Date.now() },
  groupBy: 'errorType',
  includeStackTraces: true
});
```

### **结构化日志记录**

带有结构化数据和过滤的增强日志记录。

```typescript
import { Logger } from '@mplp/dev-tools';

const logger = new Logger({
  level: 'debug',
  format: 'json',
  outputs: ['console', 'file'],
  file: {
    path: './logs/app.log',
    maxSize: '10MB',
    maxFiles: 5
  }
});

// 结构化日志记录
logger.info('智能体消息已处理', {
  agentId: 'ChatBot',
  messageId: 'msg123',
  processingTime: 150,
  success: true
});

// 上下文日志记录
const childLogger = logger.child({ component: 'workflow' });
childLogger.debug('工作流步骤已执行', { step: 'validation' });

// 性能日志记录
logger.time('operation');
await performOperation();
logger.timeEnd('operation');
```

## 🔗 **集成示例**

### **Express.js集成**

```typescript
import express from 'express';
import { DevTools, devToolsMiddleware } from '@mplp/dev-tools';

const app = express();
const devTools = new DevTools();

// 添加开发工具中间件
if (process.env.NODE_ENV === 'development') {
  app.use('/dev-tools', devToolsMiddleware(devTools));
}

app.listen(3000, () => {
  console.log('服务器运行，开发工具在 http://localhost:3000/dev-tools');
});
```

### **Jest集成**

```typescript
// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['@mplp/dev-tools/jest-setup'],
  testEnvironment: '@mplp/dev-tools/jest-environment'
};

// 在测试文件中
import { testUtils } from '@mplp/dev-tools';

describe('智能体测试', () => {
  beforeEach(() => {
    testUtils.resetMocks();
  });

  it('应该处理消息', async () => {
    const mockAgent = testUtils.createMockAgent();
    const result = await mockAgent.processMessage('hello');
    expect(result).toBe('你好！');
  });
});
```

### **Docker集成**

```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# 安装开发依赖
COPY package*.json ./
RUN npm install

# 复制源代码
COPY . .

# 暴露开发工具端口
EXPOSE 3001

# 使用开发工具启动
CMD ["npm", "run", "dev:with-tools"]
```

## 📚 **最佳实践**

### **开发工作流程**

- 仅在开发环境中启用开发工具
- 使用性能分析尽早识别瓶颈
- 设置自动化错误跟踪和警报
- 定期分析协议通信模式
- 对复杂问题使用交互式调试

### **性能优化**

- 在开发期间定期进行性能分析
- 监控内存使用并尽早检测泄漏
- 使用瓶颈检测优化关键路径
- 分析智能体交互模式以提高效率
- 设置性能回归测试

### **调试策略**

- 策略性地使用断点，不要过度使用
- 利用变量检查进行状态分析
- 分析调用栈以理解执行流程
- 对特定场景使用条件断点
- 结合多种调试工具进行综合分析

## 🔗 **相关文档**

- [MPLP CLI指南](../cli/README.md) - 命令行界面和项目管理
- [SDK核心文档](../../sdk-api/sdk-core/README.md) - 核心SDK功能
- [智能体构建器指南](../../sdk-api/agent-builder/README.md) - 构建智能代理
- [编排器文档](../../sdk-api/orchestrator/README.md) - 多智能体工作流

---

**开发工具维护者**: MPLP平台团队  
**最后审查**: 2025-09-20  
**测试覆盖率**: 100% (40/40测试通过)  
**状态**: ✅ 生产就绪
