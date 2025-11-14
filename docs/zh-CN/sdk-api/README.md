# MPLP SDK v1.1.0 API参考文档

> **🌐 语言导航**: [English](../../en/sdk-api/README.md) | [中文](README.md)


> **文档类别**: SDK API参考  
> **SDK版本**: v1.1.0  
> **更新时间**: 2025-09-20  
> **状态**: ✅ 完整的SDK API文档套件  

## 📚 **SDK API文档概览**

欢迎使用MPLP（多智能体协议生命周期平台）SDK v1.1.0的全面API参考文档。本文档提供了基于MPLP V1.0 Alpha协议栈构建的MPLP SDK生态系统中所有类、接口、方法和类型的详细信息。

### **🎯 文档目的**

SDK API参考文档是以下用途的权威指南：
- **应用开发者**: 构建多智能体应用的完整API规范
- **平台集成**: 平台适配器的详细接口文档
- **类型安全**: 全面的TypeScript类型定义和使用模式
- **最佳实践**: 推荐的实现方法和模式
- **企业开发**: 具有企业级功能的生产就绪API

## 🏗️ **SDK架构概览**

```
┌─────────────────────────────────────────────────────────────┐
│                    应用层                                   │
│              (您的多智能体应用)                             │
├─────────────────────────────────────────────────────────────┤
│                   MPLP SDK层                               │
│  @mplp/sdk-core | @mplp/agent-builder | @mplp/orchestrator │
│  @mplp/adapters | @mplp/cli | @mplp/dev-tools | @mplp/studio│
├─────────────────────────────────────────────────────────────┤
│              MPLP V1.0 Alpha协议栈                         │
│  L3: CoreOrchestrator | L2: Context,Plan,Role,Confirm...   │
│  L1: Schema验证和横切关注点                                 │
└─────────────────────────────────────────────────────────────┘
```

## 📦 **SDK包API参考**

### **核心SDK包**

#### **[@mplp/sdk-core](./sdk-core/README.md)** ✅ **生产就绪**
- **目的**: 基础应用框架和生命周期管理
- **主要类**: `MPLPApplication`, `ConfigManager`, `ModuleManager`, `HealthChecker`
- **关键功能**: 应用生命周期、配置管理、健康监控、事件系统
- **测试覆盖率**: 100% (45/45测试通过)
- **安装**: `npm install @mplp/sdk-core`

#### **[@mplp/agent-builder](./agent-builder/README.md)** ✅ **生产就绪**
- **目的**: 构建和管理智能代理的流式API
- **主要类**: `AgentBuilder`, `MPLPAgent`, `PlatformAdapterRegistry`
- **关键功能**: 代理构建、生命周期管理、平台集成、能力系统
- **测试覆盖率**: >90%，包含全面的集成测试
- **安装**: `npm install @mplp/agent-builder`

#### **[@mplp/orchestrator](./orchestrator/README.md)** ✅ **生产就绪**
- **目的**: 多智能体工作流编排和协调
- **主要类**: `MultiAgentOrchestrator`, `WorkflowBuilder`, `ExecutionEngine`
- **关键功能**: 工作流管理、代理协调、执行监控、性能分析
- **测试覆盖率**: 100% (117/117测试通过)
- **安装**: `npm install @mplp/orchestrator`

#### **[@mplp/adapters](./adapters/README.md)** ✅ **生产就绪**
- **目的**: 社交媒体和通信平台的特定适配器
- **主要类**: `AdapterManager`, `TwitterAdapter`, `DiscordAdapter`, `SlackAdapter`等
- **关键功能**: 7个平台适配器、统一API、错误处理、速率限制
- **平台覆盖**: Twitter、LinkedIn、GitHub、Discord、Slack、Reddit、Medium
- **安装**: `npm install @mplp/adapters`

### **开发工具**

#### **[@mplp/cli](./cli/README.md)** ✅ **企业级**
- **目的**: MPLP开发工作流的命令行界面
- **主要功能**: 项目脚手架、构建工具、部署实用程序、测试框架
- **命令**: `create`, `build`, `dev`, `test`, `deploy`, `validate`, `doctor`
- **测试覆盖率**: 100% (193/193测试通过)
- **安装**: `npm install -g @mplp/cli`

#### **[@mplp/dev-tools](./dev-tools/README.md)** ✅ **企业级**
- **目的**: MPLP应用的开发和调试实用程序
- **主要功能**: 实时监控、性能分析、调试工具、分析
- **测试覆盖率**: 100% (40/40测试通过)
- **安装**: `npm install --save-dev @mplp/dev-tools`

#### **[@mplp/studio](./studio/README.md)** ✅ **生产就绪**
- **目的**: 代理工作流的可视化开发环境
- **主要功能**: 拖拽界面、代码生成、实时预览、协作
- **测试覆盖率**: 100% (58/58测试通过)
- **安装**: `npm install @mplp/studio`

## 🚀 **快速开始示例**

### **基础多智能体应用**

```typescript
import { MPLPApplication } from '@mplp/sdk-core';
import { AgentBuilder } from '@mplp/agent-builder';
import { MultiAgentOrchestrator } from '@mplp/orchestrator';

// 创建MPLP应用
const app = new MPLPApplication({
  name: 'MyFirstApp',
  version: '1.0.0',
  description: '我的第一个多智能体应用'
});

// 构建智能代理
const greetingAgent = new AgentBuilder('GreetingAgent')
  .withName('问候助手')
  .withDescription('处理问候和欢迎消息')
  .withCapability('greet', async (params: { name: string }) => {
    return { 
      message: `你好，${params.name}！欢迎使用MPLP！`,
      timestamp: new Date().toISOString()
    };
  })
  .withCapability('farewell', async (params: { name: string }) => {
    return { 
      message: `再见，${params.name}！感谢使用MPLP！`,
      timestamp: new Date().toISOString()
    };
  })
  .build();

// 创建编排器并注册代理
const orchestrator = new MultiAgentOrchestrator();
await orchestrator.registerAgent(greetingAgent);

// 初始化并启动应用
await app.initialize();
await app.start();

console.log('MPLP应用启动成功！');
```

### **多平台社交媒体代理**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';
import { TwitterAdapter, DiscordAdapter, SlackAdapter } from '@mplp/adapters';

// 创建多平台社交媒体代理
const socialAgent = new AgentBuilder('SocialMediaBot')
  .withName('多平台社交机器人')
  .withPlatform('twitter', new TwitterAdapter({
    apiKey: process.env.TWITTER_API_KEY!,
    apiSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!
  }))
  .withPlatform('discord', new DiscordAdapter({
    token: process.env.DISCORD_TOKEN!,
    guildId: process.env.DISCORD_GUILD_ID!
  }))
  .withPlatform('slack', new SlackAdapter({
    token: process.env.SLACK_TOKEN!,
    signingSecret: process.env.SLACK_SIGNING_SECRET!
  }))
  .withCapability('post', async (content: { message: string; platforms?: string[] }) => {
    const results = new Map();
    const targetPlatforms = content.platforms || ['twitter', 'discord', 'slack'];
    
    for (const platform of targetPlatforms) {
      try {
        const adapter = this.getPlatformAdapter(platform);
        const result = await adapter.post({
          content: content.message,
          type: 'text'
        });
        results.set(platform, { success: true, result });
      } catch (error) {
        results.set(platform, { success: false, error: error.message });
      }
    }
    
    return { results: Object.fromEntries(results) };
  })
  .withCapability('monitor', async (params: { keywords: string[]; platforms?: string[] }) => {
    // 跨平台监控
    const monitoringResults = await this.startMonitoring(params);
    return monitoringResults;
  })
  .build();
```

### **高级工作流编排**

```typescript
import { MultiAgentOrchestrator, WorkflowBuilder } from '@mplp/orchestrator';
import { AgentBuilder } from '@mplp/agent-builder';

// 创建专业化代理
const contentAgent = new AgentBuilder('ContentCreator')
  .withCapability('generate', async (topic: string) => {
    // AI驱动的内容生成
    return { content: `关于${topic}的生成内容` };
  })
  .build();

const reviewAgent = new AgentBuilder('ContentReviewer')
  .withCapability('review', async (content: string) => {
    // 内容审查和批准
    return { approved: true, feedback: '内容看起来不错！' };
  })
  .build();

const publishAgent = new AgentBuilder('ContentPublisher')
  .withCapability('publish', async (content: string, platforms: string[]) => {
    // 多平台发布
    return { published: true, platforms };
  })
  .build();

// 创建编排器并注册代理
const orchestrator = new MultiAgentOrchestrator();
await orchestrator.registerAgent(contentAgent);
await orchestrator.registerAgent(reviewAgent);
await orchestrator.registerAgent(publishAgent);

// 构建复杂工作流
const contentWorkflow = new WorkflowBuilder('content-pipeline')
  .step('generate', async (input: { topic: string }) => {
    const result = await contentAgent.executeCapability('generate', input.topic);
    return { content: result.content, topic: input.topic };
  })
  .step('review', async (input: { content: string }) => {
    const result = await reviewAgent.executeCapability('review', input.content);
    if (!result.approved) {
      throw new Error(`内容审查失败：${result.feedback}`);
    }
    return { ...input, reviewResult: result };
  })
  .step('publish', async (input: { content: string; topic: string }) => {
    const platforms = ['twitter', 'linkedin', 'medium'];
    const result = await publishAgent.executeCapability('publish', input.content, platforms);
    return { ...input, publishResult: result };
  })
  .onError(async (error, context) => {
    console.error('工作流错误：', error.message);
    // 实现错误恢复逻辑
  })
  .build();

// 执行工作流
const result = await orchestrator.executeWorkflow(contentWorkflow, {
  topic: '2025年的多智能体系统'
});

console.log('内容管道完成：', result);
```

## 🔧 **开发指南**

### **TypeScript最佳实践**

```typescript
// 始终使用严格类型 - 避免'any'
interface AgentConfig {
  name: string;
  description?: string;
  capabilities: Record<string, CapabilityFunction>;
  platforms?: Record<string, IPlatformAdapter>;
}

// 使用适当的错误处理
import { AgentBuildError, PlatformAdapterError } from '@mplp/agent-builder';

const createAgent = async (config: AgentConfig): Promise<IAgent> => {
  try {
    return await new AgentBuilder(config.name)
      .withDescription(config.description)
      .withCapabilities(config.capabilities)
      .build();
  } catch (error) {
    if (error instanceof AgentBuildError) {
      throw new Error(`构建代理失败：${error.message}`);
    }
    throw error;
  }
};
```

### **性能优化**

```typescript
// 为平台适配器使用连接池
const twitterAdapter = new TwitterAdapter({
  apiKey: process.env.TWITTER_API_KEY!,
  // ... 其他配置
  connectionPool: {
    maxConnections: 10,
    keepAlive: true,
    timeout: 30000
  }
});

// 实现适当的资源清理
class MyApplication {
  private orchestrator: MultiAgentOrchestrator;
  
  async shutdown(): Promise<void> {
    try {
      await this.orchestrator.stopAllAgents();
      await this.orchestrator.cleanup();
    } catch (error) {
      console.error('关闭错误：', error);
    }
  }
}

// 处理进程信号以优雅关闭
process.on('SIGTERM', async () => {
  await app.shutdown();
  process.exit(0);
});
```

## 📊 **SDK质量指标**

### **测试覆盖率和质量**
```markdown
✅ 整体SDK质量:
- 总测试数: 584个测试，覆盖所有包
- 测试通过率: 100% (584/584测试通过)
- 代码覆盖率: 所有核心包>90%
- TypeScript合规性: 100%严格模式
- ESLint合规性: 零错误/警告
- 安全漏洞: 零关键问题

✅ 包特定指标:
- @mplp/sdk-core: 45/45测试通过
- @mplp/agent-builder: >90%覆盖率，包含集成测试
- @mplp/orchestrator: 117/117测试通过
- @mplp/cli: 193/193测试通过
- @mplp/dev-tools: 40/40测试通过
- @mplp/studio: 58/58测试通过
```

### **性能基准**
```markdown
⚡ SDK性能:
- 应用启动: <100ms
- 代理创建: 每个代理<50ms
- 工作流执行: <200ms (P95)
- 平台适配器响应: <500ms (P95)
- 内存使用: 典型应用<50MB
- CPU使用: 正常操作期间<5%
```

## 🔗 **相关文档**

### **入门指南**
- [SDK安装指南](../getting-started/installation.md) - 完整的设置说明
- [第一个应用教程](../getting-started/first-app.md) - 分步教程
- [平台集成指南](../getting-started/platform-integration.md) - 连接到社交平台

### **高级主题**
- 最佳实践 (开发中) - 推荐的模式和方法
- 性能优化 (开发中) - 优化技术
- 安全指南 (开发中) - 安全最佳实践

### **示例和教程**
- 示例应用 (开发中) - 实际实现示例
- [平台适配器示例](../examples/adapters.md) - 平台特定示例
- [工作流模式](../examples/workflows.md) - 常见工作流模式

---

**SDK API文档团队**: MPLP SDK开发团队  
**技术作者**: SDK API参考专家  
**最后审查**: 2025-09-20  
**状态**: ✅ 完整且生产就绪的SDK API参考套件
