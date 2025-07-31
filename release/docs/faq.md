# 常见问题解答 (FAQ)

## 🤔 基础问题

### Q: MPLP是什么？
A: MPLP (Multi-Agent Project Lifecycle Protocol) 是一个开源的多智能体协作框架，为AI Agent生态系统提供统一的生命周期管理和工作流编排能力。

### Q: MPLP适用于什么场景？
A: MPLP适用于需要多个AI智能体协作的场景，如：
- AI客户服务系统
- 智能内容生成流水线
- 自动化业务流程
- 复杂决策支持系统
- 多模态AI应用

### Q: MPLP与其他工作流框架有什么区别？
A: MPLP的特点：
- 专为AI Agent设计
- 厂商中立，不绑定特定AI服务
- 内置性能优化（缓存、批处理）
- Schema驱动开发
- 完整的监控和追踪

## 🚀 安装和配置

### Q: 支持哪些Node.js版本？
A: MPLP支持Node.js 16.0.0及以上版本。推荐使用LTS版本。

### Q: 是否支持JavaScript项目？
A: 是的，MPLP完全支持JavaScript项目。虽然使用TypeScript开发，但提供了完整的JavaScript兼容性。

```javascript
const { CoreOrchestrator } = require('mplp');
// 正常使用
```

### Q: 如何在现有项目中集成MPLP？
A: 集成步骤：
1. 安装MPLP: `npm install mplp`
2. 创建调度器配置
3. 实现业务模块
4. 注册模块并执行工作流

详见[快速开始指南](./getting-started.md)。

## ⚡ 性能相关

### Q: CoreOrchestrator和PerformanceEnhancedOrchestrator有什么区别？
A: 
- **CoreOrchestrator**: 基础版本，适合简单场景，资源占用少
- **PerformanceEnhancedOrchestrator**: 增强版本，内置缓存和批处理优化，适合生产环境

### Q: 性能优化效果如何？
A: 根据基准测试：
- 缓存命中时性能提升57%+
- 平均响应时间347ms
- 吞吐量37+ ops/sec
- 支持500+并发连接

### Q: 如何监控性能？
A: 使用内置的性能监控：
```typescript
const stats = orchestrator.getPerformanceStats();
console.log(`缓存命中率: ${stats.cacheHitRate * 100}%`);
```

## 🔧 开发问题

### Q: 如何创建自定义模块？
A: 实现ModuleInterface接口：
```typescript
const myModule = {
  module_name: 'my-module',
  async initialize() { /* 初始化逻辑 */ },
  async execute(context) { /* 执行逻辑 */ },
  async cleanup() { /* 清理逻辑 */ },
  getStatus() { /* 状态信息 */ }
};
```

### Q: 如何处理模块间的依赖？
A: 通过工作流阶段顺序和context传递数据：
```typescript
const config = {
  default_workflow: {
    stages: ['context', 'plan', 'confirm', 'trace'], // 按依赖顺序
    parallel_execution: false // 串行执行
  }
};
```

### Q: 如何处理错误和重试？
A: 配置重试策略：
```typescript
const config = {
  default_workflow: {
    retry_policy: {
      max_attempts: 3,
      delay_ms: 1000,
      backoff_multiplier: 2.0
    }
  }
};
```

### Q: 如何实现并行执行？
A: 设置parallel_execution为true：
```typescript
const config = {
  default_workflow: {
    stages: ['module1', 'module2'],
    parallel_execution: true
  }
};
```

## 🐛 故障排除

### Q: 遇到"Cannot find module"错误怎么办？
A: 检查：
1. 是否正确安装了MPLP
2. 导入路径是否正确
3. TypeScript配置是否正确

### Q: 工作流执行超时怎么办？
A: 调整超时配置：
```typescript
const config = {
  default_workflow: {
    timeout_ms: 60000 // 增加到60秒
  },
  module_timeout_ms: 15000 // 增加模块超时
};
```

### Q: 内存使用过高怎么办？
A: 优化建议：
1. 使用PerformanceEnhancedOrchestrator的缓存管理
2. 及时清理不需要的数据
3. 调整max_concurrent_executions
4. 监控内存使用情况

### Q: 如何调试工作流执行？
A: 启用事件日志：
```typescript
const config = {
  enable_event_logging: true
};

orchestrator.addEventListener((event) => {
  console.log('事件:', event);
});
```

## 🔒 安全相关

### Q: MPLP是否安全？
A: MPLP采用多层安全措施：
- 输入验证和清理
- 错误信息不泄露敏感数据
- 支持自定义安全策略
- 定期安全更新

### Q: 如何报告安全问题？
A: 请查看[安全政策](../SECURITY.md)了解如何报告安全问题。

## 📚 学习资源

### Q: 有哪些学习资源？
A: 
- [快速开始指南](./getting-started.md)
- [API参考文档](./api-reference.md)
- [示例代码](../examples/)
- [GitHub讨论区](https://github.com/your-org/mplp/discussions)

### Q: 如何获得帮助？
A: 
1. 查看文档和FAQ
2. 搜索[GitHub Issues](https://github.com/your-org/mplp/issues)
3. 在[讨论区](https://github.com/your-org/mplp/discussions)提问
4. 提交新的Issue

## 🤝 贡献相关

### Q: 如何贡献代码？
A: 请查看[贡献指南](../CONTRIBUTING.md)了解详细流程。

### Q: 如何报告Bug？
A: 在[GitHub Issues](https://github.com/your-org/mplp/issues)提交Bug报告，请包含：
- 详细的问题描述
- 复现步骤
- 环境信息
- 错误日志

### Q: 如何提出功能建议？
A: 在[GitHub Issues](https://github.com/your-org/mplp/issues)提交功能请求，说明：
- 功能需求
- 使用场景
- 预期收益

---

## 📞 还有其他问题？

如果这里没有找到答案，请：
- 查看[完整文档](https://mplp.dev/docs)
- 在[GitHub讨论区](https://github.com/your-org/mplp/discussions)提问
- 提交[Issue](https://github.com/your-org/mplp/issues)

我们会持续更新FAQ，感谢您的反馈！
