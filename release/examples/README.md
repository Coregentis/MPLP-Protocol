# MPLP 示例代码

这个目录包含了MPLP的各种使用示例，从简单的快速开始到复杂的真实业务场景。

## 📁 示例文件

### 🚀 [quick-start.ts](./quick-start.ts)
**5分钟快速上手**
- 最简单的MPLP使用方式
- 基础配置和模块创建
- 单任务和批量任务执行
- 适合初学者

```bash
npx ts-node examples/quick-start.ts
```

### 📚 [basic-usage.ts](./basic-usage.ts)
**基础使用示例**
- 完整的配置选项
- 错误处理和重试机制
- 模块生命周期管理
- 性能监控基础

```bash
npx ts-node examples/basic-usage.ts
```

### ⚡ [performance-optimized.ts](./performance-optimized.ts)
**性能优化示例**
- PerformanceEnhancedOrchestrator使用
- 缓存预热和优化
- 性能监控和统计
- 批处理优化

```bash
npx ts-node examples/performance-optimized.ts
```

### 🔧 [advanced-usage.ts](./advanced-usage.ts)
**高级功能示例**
- 复杂的模块实现
- 事件监听和处理
- 性能告警设置
- 资源管理和清理

```bash
npx ts-node examples/advanced-usage.ts
```

### 🏢 [real-world-scenario.ts](./real-world-scenario.ts)
**真实业务场景**
- AI客户服务系统
- 完整的业务流程
- 多模块协作
- 质量控制和追踪

```bash
npx ts-node examples/real-world-scenario.ts
```

## 🎯 选择合适的示例

### 如果你是新手
1. 从 `quick-start.ts` 开始
2. 然后查看 `basic-usage.ts`
3. 根据需要参考其他示例

### 如果你关注性能
1. 查看 `performance-optimized.ts`
2. 参考 `advanced-usage.ts` 中的监控设置

### 如果你要构建生产系统
1. 研究 `real-world-scenario.ts`
2. 参考 `advanced-usage.ts` 的错误处理
3. 使用 `performance-optimized.ts` 的优化技巧

## 🔧 运行示例

### 环境要求
- Node.js >= 16.0.0
- TypeScript >= 4.5.0

### 安装依赖
```bash
npm install mplp
npm install -D typescript ts-node @types/node
```

### 运行单个示例
```bash
# 快速开始
npx ts-node examples/quick-start.ts

# 基础使用
npx ts-node examples/basic-usage.ts

# 性能优化
npx ts-node examples/performance-optimized.ts

# 高级功能
npx ts-node examples/advanced-usage.ts

# 真实场景
npx ts-node examples/real-world-scenario.ts
```

### 在JavaScript项目中使用
```javascript
// 如果你使用JavaScript而不是TypeScript
const { CoreOrchestrator } = require('mplp');

const orchestrator = new CoreOrchestrator({
  default_workflow: {
    stages: ['context'],
    timeout_ms: 10000
  },
  module_timeout_ms: 5000,
  max_concurrent_executions: 5
});

// ... 其余代码类似
```

## 📊 示例对比

| 示例 | 复杂度 | 功能特性 | 适用场景 |
|------|--------|----------|----------|
| quick-start | ⭐ | 基础执行 | 学习入门 |
| basic-usage | ⭐⭐ | 完整配置 | 简单项目 |
| performance-optimized | ⭐⭐⭐ | 性能优化 | 高性能需求 |
| advanced-usage | ⭐⭐⭐⭐ | 高级功能 | 复杂系统 |
| real-world-scenario | ⭐⭐⭐⭐⭐ | 完整业务 | 生产环境 |

## 🎓 学习路径

### 第1天：基础概念
- 运行 `quick-start.ts`
- 理解核心概念：调度器、模块、工作流
- 修改示例，尝试不同配置

### 第2天：深入功能
- 运行 `basic-usage.ts`
- 学习错误处理和重试机制
- 了解模块生命周期

### 第3天：性能优化
- 运行 `performance-optimized.ts`
- 学习缓存和批处理
- 理解性能监控

### 第4天：高级特性
- 运行 `advanced-usage.ts`
- 学习事件系统
- 掌握资源管理

### 第5天：实战应用
- 运行 `real-world-scenario.ts`
- 分析业务流程设计
- 开始构建自己的应用

## 🤝 贡献示例

如果你有好的示例想要分享：

1. Fork 项目
2. 在 `examples/` 目录添加你的示例
3. 更新这个 README
4. 提交 Pull Request

### 示例规范
- 文件名使用 kebab-case
- 包含详细的注释
- 提供运行说明
- 展示最佳实践

## 📚 更多资源

- [API 文档](../docs/api-reference.md)
- [快速开始指南](../docs/getting-started.md)
- [性能优化指南](../docs/performance-guide.md)
- [GitHub 仓库](https://github.com/your-org/mplp)

## 💬 获取帮助

如果在运行示例时遇到问题：

- 查看 [FAQ](../docs/faq.md)
- 提交 [Issue](https://github.com/your-org/mplp/issues)
- 参与 [讨论](https://github.com/your-org/mplp/discussions)

---

🎉 开始你的MPLP之旅吧！
