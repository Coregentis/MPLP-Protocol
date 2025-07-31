# 🚀 MPLP 快速开始指南

欢迎使用 MPLP (Multi-Agent Project Lifecycle Protocol) v1.0！本指南将帮助您快速上手并开始使用 MPLP 构建多智能体协作系统。

## 📦 安装

### 使用 npm
```bash
npm install mplp
```

### 使用 yarn
```bash
yarn add mplp
```

### 使用 pnpm
```bash
pnpm add mplp
```

## 🎯 核心概念

MPLP 是一个多智能体项目生命周期协议，提供了6个核心模块：

- **Context** - 上下文和全局状态管理
- **Plan** - 计划制定和任务分解
- **Confirm** - 确认和审批流程
- **Trace** - 追踪记录和监控分析
- **Role** - 角色权限和访问控制
- **Extension** - 扩展机制和插件系统

## 🏃‍♂️ 快速开始

### 1. 基础使用

```typescript
import { CoreOrchestrator } from 'mplp';

// 创建配置
const config = {
  default_workflow: {
    stages: ['context', 'plan', 'confirm', 'trace'],
    timeout_ms: 30000
  },
  module_timeout_ms: 5000,
  max_concurrent_executions: 10,
  enable_performance_monitoring: true,
  enable_event_logging: true
};

// 创建调度器
const orchestrator = new CoreOrchestrator(config);

// 注册模块
orchestrator.registerModule(yourModule);

// 执行工作流
const result = await orchestrator.executeWorkflow('context-id');
console.log('工作流执行结果:', result);
```

### 2. 性能优化使用

```typescript
import { PerformanceEnhancedOrchestrator } from 'mplp';

// 创建性能增强调度器
const orchestrator = new PerformanceEnhancedOrchestrator(config);

// 预热缓存
await orchestrator.warmupCache(['common-context-1', 'common-context-2']);

// 执行工作流 (自动缓存优化)
const result = await orchestrator.executeWorkflow('context-id');

// 查看性能统计
const stats = orchestrator.getPerformanceStats();
console.log(`缓存命中率: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
```

## 📊 性能对比

| 指标 | CoreOrchestrator | PerformanceEnhancedOrchestrator |
|------|------------------|--------------------------------|
| 平均响应时间 | 347ms | 347ms (首次) / 148ms (缓存) |
| 吞吐量 | 37 ops/sec | 37+ ops/sec |
| 缓存优化 | - | 57%性能提升 |
| 内存效率 | 良好 | 优秀 |

## 🔧 配置选项

### OrchestratorConfiguration

```typescript
interface OrchestratorConfiguration {
  default_workflow: WorkflowConfiguration;
  module_timeout_ms: number;
  max_concurrent_executions: number;
  enable_performance_monitoring: boolean;
  enable_event_logging: boolean;
}
```

### WorkflowConfiguration

```typescript
interface WorkflowConfiguration {
  stages: WorkflowStage[];
  timeout_ms: number;
  retry_policy?: {
    max_retries: number;
    backoff_ms: number;
  };
}
```

## 🧪 运行测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行端到端测试
npm run test:e2e

# 运行性能测试
npm run test:performance
```

## 📚 更多资源

- [API 参考文档](./api-reference.md)
- [性能优化指南](./performance-guide.md)
- [架构设计文档](./architecture.md)
- [示例代码](../examples/)

## 🤝 社区支持

- GitHub Issues: [报告问题](https://github.com/your-org/mplp/issues)
- 讨论区: [参与讨论](https://github.com/your-org/mplp/discussions)
- 文档: [完整文档](https://mplp.dev/docs)

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件

---

🎉 恭喜！您已经完成了 MPLP 的快速开始。现在可以开始构建您的多智能体协作系统了！
