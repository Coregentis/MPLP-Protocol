# MPLP - Multi-Agent Project Lifecycle Protocol

[![npm version](https://badge.fury.io/js/mplp.svg)](https://badge.fury.io/js/mplp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/your-org/mplp)
[![Coverage](https://img.shields.io/badge/coverage-89%25-green.svg)](https://github.com/your-org/mplp)

🤖 **MPLP (Multi-Agent Project Lifecycle Protocol)** 是一个开源的多智能体协作框架，为AI Agent生态系统提供统一的生命周期管理和工作流编排能力。

## 🌟 为什么选择 MPLP？

- 🚀 **生产级性能**: 平均响应时间347ms，缓存优化提升57%性能
- 🔧 **开箱即用**: 完整的工具链和最佳实践，快速上手
- 🏗️ **企业级架构**: DDD设计模式，支持大规模部署
- 🔒 **厂商中立**: 不绑定特定AI服务商，支持多种AI模型
- 📊 **完整监控**: 内置性能监控、错误追踪和告警机制
- 🧪 **测试驱动**: 204个测试用例，89%测试覆盖率

## 🚀 特性

- **多智能体协作**: 支持复杂的多智能体工作流编排
- **高性能**: 内置缓存和批处理优化，性能提升57%+
- **类型安全**: 完整的TypeScript支持
- **可扩展**: 模块化设计，易于扩展
- **生产就绪**: 完整的错误处理、重试机制和监控

## 📦 安装

```bash
npm install mplp
```

## 🎯 快速开始

### 基础使用

```typescript
import { CoreOrchestrator } from 'mplp';

// 创建调度器
const orchestrator = new CoreOrchestrator({
  default_workflow: {
    stages: ['context', 'plan', 'confirm', 'trace'],
    parallel_execution: false,
    timeout_ms: 30000
  },
  module_timeout_ms: 10000,
  max_concurrent_executions: 50
});

// 注册模块
orchestrator.registerModule(yourModule);

// 执行工作流
const result = await orchestrator.executeWorkflow('context-id');
```


### 性能优化使用

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

| 版本 | 响应时间 | 吞吐量 | 缓存优化 |
|------|----------|--------|----------|
| CoreOrchestrator | 347ms | 37 ops/sec | - |
| PerformanceEnhancedOrchestrator | 148ms (缓存命中) | 37+ ops/sec | 57%提升 |


## 📚 文档

- [API 参考](./docs/api-reference.md)
- [性能优化指南](./docs/performance-guide.md)
- [示例代码](./examples/)

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行性能测试
npm run test:performance

# 运行单元测试
npm run test:unit
```

## 🤝 贡献

我们欢迎所有形式的贡献！无论是报告bug、提出新功能建议，还是提交代码改进。

### 如何贡献

1. **Fork** 本仓库
2. **创建** 你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. **提交** 你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. **推送** 到分支 (`git push origin feature/AmazingFeature`)
5. **打开** 一个 Pull Request

### 开发指南

```bash
# 克隆仓库
git clone https://github.com/your-org/mplp.git
cd mplp

# 安装依赖
npm install

# 运行测试
npm test

# 构建项目
npm run build
```

详细信息请查看 [贡献指南](./CONTRIBUTING.md)。

## 🌟 Star History

如果这个项目对你有帮助，请给我们一个 ⭐️！

[![Star History Chart](https://api.star-history.com/svg?repos=your-org/mplp&type=Date)](https://star-history.com/#your-org/mplp&Date)

## 💬 社区

- 💬 [GitHub Discussions](https://github.com/your-org/mplp/discussions) - 讨论和问答
- 🐛 [GitHub Issues](https://github.com/your-org/mplp/issues) - 报告bug和功能请求
- 📧 [邮件列表](mailto:mplp@your-org.com) - 重要更新通知

## 📊 项目统计

- 🏗️ **架构**: Domain-Driven Design (DDD)
- 🧪 **测试**: 204个测试用例，89%覆盖率
- 📦 **包大小**: 59.6 kB (压缩后)
- ⚡ **性能**: 平均响应时间 347ms
- 🔧 **语言**: 100% TypeScript

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 🔗 相关链接

- 📚 [完整文档](https://mplp.dev/docs)
- 🚀 [快速开始](./docs/getting-started.md)
- 📖 [API 参考](./docs/api-reference.md)
- 🎯 [示例代码](./examples/)
- 📝 [更新日志](./CHANGELOG.md)
- 🔒 [安全政策](./SECURITY.md)

---

<div align="center">
  <p>由 ❤️ 和 ☕ 制作</p>
  <p>如果你喜欢这个项目，请考虑 <a href="https://github.com/your-org/mplp">给我们一个星标</a> ⭐</p>
</div>
