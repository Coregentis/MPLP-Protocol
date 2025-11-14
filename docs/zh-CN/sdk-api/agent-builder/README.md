# @mplp/agent-builder API参考文档

> **🌐 语言导航**: [English](../../../en/sdk-api/agent-builder/README.md) | [中文](README.md)


> **包名**: @mplp/agent-builder  
> **版本**: v1.1.0  
> **更新时间**: 2025-09-20  
> **状态**: ✅ 生产就绪  

## 📚 **包概览**

`@mplp/agent-builder`包提供了强大的流式API，用于构建和管理具有平台适配器和全面生命周期管理的智能代理。它使开发者能够以最小的代码复杂度构建复杂的多智能体系统。

### **🎯 关键功能**

- **流式构建器API**: 基于链式的配置，直观的代理构建
- **平台适配器系统**: 不同平台的统一接口（Twitter、Discord、Slack等）
- **生命周期管理**: 完整的代理生命周期，包含启动、停止、监控和清理
- **能力系统**: 模块化能力注册和执行
- **状态监控**: 实时代理状态跟踪和报告
- **错误处理**: 健壮的错误处理和恢复机制
- **事件驱动架构**: 基于事件的代理通信和协调
- **TypeScript支持**: 100%类型安全，全面的接口定义

### **📦 安装**

```bash
npm install @mplp/agent-builder
```

### **🏗️ 架构**

```
┌─────────────────────────────────────────┐
│            AgentBuilder                 │
│        (流式配置API)                    │
├─────────────────────────────────────────┤
│  MPLPAgent | PlatformAdapterRegistry   │
│  CapabilityManager | LifecycleManager  │
├─────────────────────────────────────────┤
│         平台适配器                      │
│  Twitter | Discord | Slack | GitHub... │
└─────────────────────────────────────────┘
```

## 🚀 **快速开始**

### **基础代理创建**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';

// 创建简单的问候代理
const greetingAgent = new AgentBuilder('GreetingBot')
  .withName('友好问候机器人')
  .withDescription('处理问候和欢迎消息')
  .withCapability('greet', async (params: { name: string }) => {
    return { message: `你好，${params.name}！欢迎！` };
  })
  .build();

// 启动代理
await greetingAgent.start();
```

### **多平台代理**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';
import { TwitterAdapter, DiscordAdapter } from '@mplp/adapters';

const socialAgent = new AgentBuilder('SocialBot')
  .withName('多平台社交机器人')
  .withPlatform('twitter', new TwitterAdapter({
    apiKey: process.env.TWITTER_API_KEY!,
    apiSecret: process.env.TWITTER_API_SECRET!
  }))
  .withPlatform('discord', new DiscordAdapter({
    token: process.env.DISCORD_TOKEN!
  }))
  .withCapability('post', async (content: string) => {
    // 发布到所有连接的平台
    return await this.postToAllPlatforms(content);
  })
  .build();
```

## 📋 **核心类**

### **AgentBuilder**

使用流式API创建代理的主要构建器类。

#### **构造函数**

```typescript
constructor(id: string)
```

**参数:**
- `id`: 代理的唯一标识符

**示例:**
```typescript
const builder = new AgentBuilder('my-agent-001');
```

#### **配置方法**

##### `withName(name: string): AgentBuilder`

设置代理的显示名称。

```typescript
const agent = new AgentBuilder('bot-1')
  .withName('客户支持机器人')
  .build();
```

##### `withDescription(description: string): AgentBuilder`

设置代理的描述。

```typescript
const agent = new AgentBuilder('analyzer')
  .withDescription('分析客户反馈和情感')
  .build();
```

##### `withCapability(name: string, handler: CapabilityHandler): AgentBuilder`

向代理添加能力。

```typescript
const agent = new AgentBuilder('processor')
  .withCapability('process-data', async (data: any[]) => {
    // 处理数据
    return { processed: data.length, results: processedData };
  })
  .withCapability('validate-data', async (data: any) => {
    // 验证数据
    return { valid: true, errors: [] };
  })
  .build();
```

##### `withCapabilities(capabilities: Record<string, CapabilityHandler>): AgentBuilder`

一次添加多个能力。

```typescript
const capabilities = {
  'analyze': async (text: string) => ({ sentiment: 'positive', score: 0.8 }),
  'summarize': async (text: string) => ({ summary: '简要摘要...' }),
  'translate': async (text: string, lang: string) => ({ translated: '...' })
};

const agent = new AgentBuilder('nlp-agent')
  .withCapabilities(capabilities)
  .build();
```

##### `withPlatform(name: string, adapter: IPlatformAdapter): AgentBuilder`

将代理连接到平台。

```typescript
import { TwitterAdapter } from '@mplp/adapters';

const agent = new AgentBuilder('social-bot')
  .withPlatform('twitter', new TwitterAdapter({
    apiKey: process.env.TWITTER_API_KEY!,
    apiSecret: process.env.TWITTER_API_SECRET!
  }))
  .build();
```

##### `withBehavior(behavior: AgentBehavior): AgentBuilder`

设置代理行为配置。

```typescript
const agent = new AgentBuilder('worker-bot')
  .withBehavior({
    autoStart: true,
    retryAttempts: 3,
    retryDelay: 1000,
    maxConcurrentTasks: 5,
    healthCheckInterval: 30000
  })
  .build();
```

##### `withConfig(config: Partial<AgentConfig>): AgentBuilder`

设置额外的配置选项。

```typescript
const agent = new AgentBuilder('enterprise-bot')
  .withConfig({
    logging: { level: 'info', enableFile: true },
    monitoring: { enableMetrics: true, metricsPort: 9091 },
    security: { enableAuth: true, tokenExpiry: 3600 }
  })
  .build();
```

#### **构建方法**

##### `build(): Promise<IAgent>`

构建并返回配置的代理。

```typescript
const agent = await new AgentBuilder('my-bot')
  .withName('我的机器人')
  .withCapability('hello', async () => ({ message: '你好！' }))
  .build();
```

### **IAgent接口**

与构建的代理交互的主要接口。

#### **属性**

```typescript
interface IAgent {
  readonly id: string;
  readonly name: string;
  readonly capabilities: AgentCapability[];
  readonly status: AgentStatus;
}
```

#### **方法**

##### `start(): Promise<void>`

启动代理并初始化所有平台。

```typescript
await agent.start();
console.log('代理启动成功');
```

##### `stop(): Promise<void>`

停止代理并清理资源。

```typescript
await agent.stop();
console.log('代理已停止');
```

##### `getStatus(): AgentStatusInfo`

返回详细的状态信息。

```typescript
const status = agent.getStatus();
console.log(`状态: ${status.state}`); // 'idle' | 'running' | 'stopped' | 'error'
console.log(`运行时间: ${status.uptime}ms`);
console.log(`完成任务: ${status.tasksCompleted}`);
```

##### `executeCapability(name: string, ...args: any[]): Promise<any>`

执行特定能力。

```typescript
const result = await agent.executeCapability('greet', { name: 'Alice' });
console.log(result.message); // "你好，Alice！欢迎！"
```

##### `sendMessage(message: unknown): Promise<void>`

通过代理的平台发送消息。

```typescript
await agent.sendMessage({
  content: '来自代理的问候！',
  platforms: ['twitter', 'discord']
});
```

##### `updateConfig(config: Partial<AgentConfig>): Promise<void>`

在运行时更新代理的配置。

```typescript
await agent.updateConfig({
  behavior: { maxConcurrentTasks: 10 }
});
```

##### `destroy(): Promise<void>`

完全销毁代理并释放所有资源。

```typescript
await agent.destroy();
```

#### **事件**

代理在其生命周期中发出各种事件：

```typescript
agent.on('started', () => {
  console.log('代理已启动');
});

agent.on('stopped', () => {
  console.log('代理已停止');
});

agent.on('capability-executed', (name, result) => {
  console.log(`能力 ${name} 已执行:`, result);
});

agent.on('error', (error) => {
  console.error('代理错误:', error);
});

agent.on('platform-connected', (platformName) => {
  console.log(`已连接到 ${platformName}`);
});

agent.on('platform-disconnected', (platformName) => {
  console.log(`已断开与 ${platformName} 的连接`);
});
```

### **PlatformAdapterRegistry**

管理平台适配器注册和发现。

#### **方法**

##### `register(name: string, adapter: IPlatformAdapter): void`

注册平台适配器。

```typescript
import { PlatformAdapterRegistry } from '@mplp/agent-builder';
import { CustomAdapter } from './CustomAdapter';

PlatformAdapterRegistry.register('custom', new CustomAdapter());
```

##### `get(name: string): IPlatformAdapter | undefined`

获取已注册的适配器。

```typescript
const twitterAdapter = PlatformAdapterRegistry.get('twitter');
```

##### `getAll(): Map<string, IPlatformAdapter>`

获取所有已注册的适配器。

```typescript
const allAdapters = PlatformAdapterRegistry.getAll();
for (const [name, adapter] of allAdapters) {
  console.log(`可用适配器: ${name}`);
}
```

##### `unregister(name: string): void`

注销适配器。

```typescript
PlatformAdapterRegistry.unregister('custom');
```

## 🔧 **类型定义**

### **AgentConfig**

```typescript
interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  capabilities: Record<string, CapabilityHandler>;
  platforms: Record<string, IPlatformAdapter>;
  behavior: AgentBehavior;
  logging?: LoggingConfig;
  monitoring?: MonitoringConfig;
  security?: SecurityConfig;
}
```

### **AgentCapability**

```typescript
interface AgentCapability {
  name: string;
  description?: string;
  handler: CapabilityHandler;
  metadata?: Record<string, any>;
}

type CapabilityHandler = (...args: any[]) => Promise<any>;
```

### **AgentBehavior**

```typescript
interface AgentBehavior {
  autoStart?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  maxConcurrentTasks?: number;
  healthCheckInterval?: number;
  gracefulShutdownTimeout?: number;
}
```

### **AgentStatus**

```typescript
type AgentStatus = 'idle' | 'running' | 'stopped' | 'error';

interface AgentStatusInfo {
  state: AgentStatus;
  uptime: number;
  tasksCompleted: number;
  tasksInProgress: number;
  lastError?: Error;
  platformStatuses: Record<string, PlatformStatus>;
  memoryUsage: NodeJS.MemoryUsage;
}
```

## 🎯 **高级使用示例**

### **企业级代理完整配置**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';
import { TwitterAdapter, SlackAdapter } from '@mplp/adapters';

const enterpriseAgent = new AgentBuilder('enterprise-support-bot')
  .withName('企业支持机器人')
  .withDescription('跨多个渠道处理客户支持')
  .withPlatform('twitter', new TwitterAdapter({
    apiKey: process.env.TWITTER_API_KEY!,
    apiSecret: process.env.TWITTER_API_SECRET!,
    accessToken: process.env.TWITTER_ACCESS_TOKEN!,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!
  }))
  .withPlatform('slack', new SlackAdapter({
    token: process.env.SLACK_TOKEN!,
    signingSecret: process.env.SLACK_SIGNING_SECRET!
  }))
  .withCapability('handle-support-ticket', async (ticket: SupportTicket) => {
    // AI驱动的工单分析和响应
    const analysis = await analyzeTicket(ticket);
    const response = await generateResponse(analysis);
    
    return {
      ticketId: ticket.id,
      priority: analysis.priority,
      response: response.text,
      estimatedResolutionTime: analysis.eta
    };
  })
  .withCapability('escalate-ticket', async (ticketId: string, reason: string) => {
    // 升级到人工代理
    await notifyHumanAgent(ticketId, reason);
    return { escalated: true, timestamp: new Date().toISOString() };
  })
  .withBehavior({
    autoStart: true,
    retryAttempts: 3,
    maxConcurrentTasks: 10,
    healthCheckInterval: 15000
  })
  .withConfig({
    logging: { level: 'info', enableFile: true, filePath: './logs/support-bot.log' },
    monitoring: { enableMetrics: true, metricsPort: 9092 },
    security: { enableAuth: true, tokenExpiry: 7200 }
  })
  .build();

// 设置事件处理器
enterpriseAgent.on('capability-executed', (name, result) => {
  if (name === 'handle-support-ticket') {
    console.log(`工单 ${result.ticketId} 已处理，优先级 ${result.priority}`);
  }
});

// 启动代理
await enterpriseAgent.start();
```

### **AI驱动的内容创作代理**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';
import { TwitterAdapter, LinkedInAdapter, MediumAdapter } from '@mplp/adapters';

const contentAgent = new AgentBuilder('ai-content-creator')
  .withName('AI内容创作者')
  .withDescription('跨平台创建和发布AI生成的内容')
  .withPlatform('twitter', new TwitterAdapter({ /* 配置 */ }))
  .withPlatform('linkedin', new LinkedInAdapter({ /* 配置 */ }))
  .withPlatform('medium', new MediumAdapter({ /* 配置 */ }))
  .withCapability('generate-content', async (topic: string, style: string) => {
    // AI内容生成
    const content = await generateAIContent(topic, style);
    return {
      title: content.title,
      body: content.body,
      tags: content.tags,
      estimatedReadTime: content.readTime
    };
  })
  .withCapability('optimize-for-platform', async (content: any, platform: string) => {
    // 平台特定优化
    const optimized = await optimizeContent(content, platform);
    return optimized;
  })
  .withCapability('schedule-post', async (content: any, platforms: string[], scheduleTime: Date) => {
    // 跨平台调度内容
    const scheduled = await scheduleAcrossPlatforms(content, platforms, scheduleTime);
    return { scheduled: true, postIds: scheduled.ids };
  })
  .withBehavior({
    maxConcurrentTasks: 3, // 限制并发内容生成
    retryAttempts: 2
  })
  .build();
```

## 🔗 **相关文档**

- [SDK Core API](../sdk-core/README.md) - 应用框架和生命周期
- [Orchestrator API](../orchestrator/README.md) - 多智能体工作流管理
- [Platform Adapters API](../adapters/README.md) - 平台集成详情
- [CLI Tools](../cli/README.md) - 开发和部署工具

---

**包维护者**: MPLP Agent Builder团队  
**最后审查**: 2025-09-20  
**测试覆盖率**: >90%，包含全面的集成测试  
**状态**: ✅ 生产就绪
