# MPLP SDK v1.1.0-beta 文档

## 🎯 **文档概览**

欢迎使用MPLP SDK文档！这里包含了使用MPLP SDK构建多智能体应用所需的所有信息。

### **文档结构**

```
docs-sdk/
├── README.md                    # 文档首页（本文件）
├── getting-started/             # 快速开始指南
│   ├── installation.md          # 安装指南
│   ├── quick-start.md           # 快速开始
│   └── first-agent.md           # 第一个Agent
├── api-reference/               # API参考文档
│   ├── sdk-core.md              # 核心SDK API
│   ├── agent-builder.md         # Agent构建器 API
│   ├── orchestrator.md          # 编排器 API
│   ├── cli.md                   # CLI工具 API
│   └── dev-tools.md             # 开发工具 API
├── tutorials/                   # 教程指南
│   ├── basic-agent.md           # 基础Agent教程
│   ├── multi-agent-workflow.md  # 多Agent工作流
│   └── platform-integration.md  # 平台集成教程
├── guides/                      # 开发指南
│   ├── architecture.md          # 架构指南
│   ├── best-practices.md        # 最佳实践
│   ├── testing.md               # 测试指南
│   └── deployment.md            # 部署指南
├── adapters/                    # 适配器文档
│   ├── overview.md              # 适配器概览
│   ├── twitter.md               # Twitter适配器
│   ├── linkedin.md              # LinkedIn适配器
│   ├── github.md                # GitHub适配器
│   ├── discord.md               # Discord适配器
│   ├── slack.md                 # Slack适配器
│   ├── reddit.md                # Reddit适配器
│   └── medium.md                # Medium适配器
└── examples/                    # 示例文档
    ├── marketing-automation.md  # 营销自动化示例
    ├── social-media-bot.md      # 社交媒体机器人
    └── agent-orchestrator.md    # Agent编排示例
```

## 🚀 **快速开始**

### **30分钟构建第一个多智能体应用**

1. **安装SDK**
   ```bash
   npm install @mplp/sdk-core @mplp/agent-builder @mplp/orchestrator
   ```

2. **创建基础应用**
   ```typescript
   import { MPLPApplication } from '@mplp/sdk-core';
   import { AgentBuilder } from '@mplp/agent-builder';
   import { MultiAgentOrchestrator } from '@mplp/orchestrator';

   // 创建应用
   const app = new MPLPApplication('MyFirstApp');

   // 创建Agent
   const agent = new AgentBuilder('HelloAgent')
     .withCapability('greeting')
     .build();

   // 创建编排器
   const orchestrator = new MultiAgentOrchestrator();
   orchestrator.registerAgent(agent);

   // 启动应用
   await app.start();
   ```

3. **运行应用**
   ```bash
   npm start
   ```

## 📚 **核心概念**

### **MPLP架构层次**
- **L1 协议层**: 基础协议定义（MPLP v1.0 Alpha）
- **L2 协调层**: 模块协调和管理
- **L3 执行层**: 工作流执行和编排
- **L4 应用层**: 具体的智能体应用（SDK构建）

### **SDK核心组件**
- **sdk-core**: 应用框架和基础设施
- **agent-builder**: 智能体构建和配置
- **orchestrator**: 多智能体编排和协调
- **cli**: 命令行工具和脚手架
- **dev-tools**: 开发调试和监控工具
- **studio**: 可视化开发环境

## 🔗 **相关链接**

- [MPLP v1.0 Alpha 协议文档](../docs/en/README.md)
- [GitHub 仓库](https://github.com/mplp-org/mplp)
- [社区讨论](https://github.com/mplp-org/mplp/discussions)
- [问题反馈](https://github.com/mplp-org/mplp/issues)

## 📝 **贡献指南**

我们欢迎社区贡献！请参考：
- [贡献指南](../CONTRIBUTING.md)
- [行为准则](../CODE_OF_CONDUCT.md)
- [开发指南](guides/development.md)

## 📄 **许可证**

MPLP SDK 采用 MIT 许可证。详见 [LICENSE](../LICENSE) 文件。

---

**版本**: v1.1.0-beta  
**更新时间**: 2025年9月  
**维护者**: MPLP Team
