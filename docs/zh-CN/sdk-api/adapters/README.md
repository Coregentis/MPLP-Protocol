# @mplp/adapters API参考文档

> **🌐 语言导航**: [English](../../../en/sdk-api/adapters/README.md) | [中文](README.md)


> **包名**: @mplp/adapters  
> **版本**: v1.1.0-beta  
> **更新时间**: 2025-09-20  
> **状态**: ✅ 生产就绪  

## 📚 **包概览**

`@mplp/adapters`包提供了全面统一的多平台社交媒体和通信平台适配器系统。它为与Twitter、LinkedIn、GitHub、Discord、Slack、Reddit、Medium等平台交互提供标准化接口，具有企业级功能。

### **🎯 关键功能**

- **7个平台适配器**: Twitter、LinkedIn、GitHub、Discord、Slack、Reddit、Medium
- **统一API接口**: 所有平台使用一致的接口
- **适配器管理器**: 多个平台适配器的集中管理
- **事件驱动架构**: 基于EventEmitter的实时事件处理
- **速率限制**: 智能API调用频率控制和配额管理
- **批量操作**: 同时向多个平台发布内容
- **错误处理**: 全面的错误处理和重试机制
- **TypeScript支持**: 完整的TypeScript类型定义和类型安全

### **📦 安装**

```bash
npm install @mplp/adapters
```

### **🏗️ 架构**

```
┌─────────────────────────────────────────┐
│            AdapterManager               │
│        (集中式多平台管理)               │
├─────────────────────────────────────────┤
│  TwitterAdapter | LinkedInAdapter      │
│  GitHubAdapter  | DiscordAdapter       │
│  SlackAdapter   | RedditAdapter        │
│  MediumAdapter  | BaseAdapter          │
├─────────────────────────────────────────┤
│         平台APIs                        │
│  Twitter API | LinkedIn API | etc.     │
└─────────────────────────────────────────┘
```

## 🚀 **快速开始**

### **基础多平台设置**

```typescript
import { AdapterManager, TwitterAdapter, DiscordAdapter } from '@mplp/adapters';

// 创建适配器管理器
const manager = new AdapterManager();

// 创建平台适配器
const twitterAdapter = new TwitterAdapter({
  platform: 'twitter',
  name: 'Twitter机器人',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'oauth1',
    credentials: {
      apiKey: process.env.TWITTER_API_KEY!,
      apiSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!
    }
  }
});

const discordAdapter = new DiscordAdapter({
  platform: 'discord',
  name: 'Discord机器人',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'token',
    credentials: {
      token: process.env.DISCORD_TOKEN!
    }
  }
});

// 将适配器添加到管理器
await manager.addAdapter('twitter', twitterAdapter);
await manager.addAdapter('discord', discordAdapter);

// 发布到所有平台
const content = {
  type: 'text',
  content: '来自MPLP的问候！🚀',
  metadata: {
    tags: ['mplp', 'automation']
  }
};

const results = await manager.postToAll(content);
console.log('发布结果:', results);
```

### **单平台使用**

```typescript
import { TwitterAdapter } from '@mplp/adapters';

const twitter = new TwitterAdapter({
  platform: 'twitter',
  name: '我的Twitter机器人',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'oauth1',
    credentials: {
      apiKey: process.env.TWITTER_API_KEY!,
      apiSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!
    }
  }
});

await twitter.initialize();
await twitter.authenticate();

// 发布推文
const result = await twitter.post({
  type: 'text',
  content: '你好Twitter！🐦',
  media: [{
    type: 'image',
    url: 'https://example.com/image.jpg'
  }]
});

console.log('推文已发布:', result);
```

## 📋 **核心类**

### **AdapterManager**

支持批量操作的多平台适配器集中管理器。

#### **构造函数**

```typescript
constructor()
```

#### **适配器管理方法**

##### `addAdapter(name: string, adapter: IPlatformAdapter): Promise<void>`

向管理器添加平台适配器。

```typescript
await manager.addAdapter('twitter', twitterAdapter);
```

##### `removeAdapter(name: string): Promise<void>`

从管理器移除平台适配器。

```typescript
await manager.removeAdapter('twitter');
```

##### `getAdapter(name: string): IPlatformAdapter | undefined`

通过名称获取特定适配器。

```typescript
const twitter = manager.getAdapter('twitter');
if (twitter) {
  console.log(`Twitter适配器状态: ${twitter.isAuthenticated}`);
}
```

##### `get adapters(): Map<string, IPlatformAdapter>`

获取所有已注册的适配器。

```typescript
const allAdapters = manager.adapters;
console.log(`适配器总数: ${allAdapters.size}`);
```

#### **批量操作**

##### `postToAll(content: ContentItem, platforms?: string[]): Promise<Map<string, ActionResult>>`

向所有已注册平台或指定平台发布内容。

```typescript
const results = await manager.postToAll({
  type: 'text',
  content: '多平台公告！🚀'
});

// 检查结果
for (const [platform, result] of results) {
  if (result.success) {
    console.log(`✅ 已发布到 ${platform}: ${result.data?.id}`);
  } else {
    console.error(`❌ 发布到 ${platform} 失败: ${result.error}`);
  }
}
```

##### `postToMultiple(content: ContentItem, platforms: string[]): Promise<Map<string, ActionResult>>`

向特定平台发布内容。

```typescript
const results = await manager.postToMultiple({
  type: 'text',
  content: '专业公告💼'
}, ['linkedin', 'twitter']);
```

#### **监控操作**

##### `startMonitoringAll(): Promise<void>`

在所有支持的平台上启动监控。

```typescript
await manager.startMonitoringAll();
console.log('所有平台监控已启动');
```

##### `stopMonitoringAll(): Promise<void>`

停止所有平台的监控。

```typescript
await manager.stopMonitoringAll();
console.log('所有平台监控已停止');
```

#### **分析操作**

##### `getAggregatedAnalytics(postId: string): Promise<Map<string, ContentMetrics>>`

获取跨平台的聚合分析数据。

```typescript
const analytics = await manager.getAggregatedAnalytics('post-123');
for (const [platform, metrics] of analytics) {
  console.log(`${platform}: ${metrics.views} 次浏览, ${metrics.engagements} 次互动`);
}
```

#### **事件**

AdapterManager发出各种事件：

```typescript
manager.on('adapter:added', (name, adapter) => {
  console.log(`适配器已添加: ${name}`);
});

manager.on('adapter:removed', (name) => {
  console.log(`适配器已移除: ${name}`);
});

manager.on('content:posted', (platform, result) => {
  console.log(`内容已发布到 ${platform}:`, result);
});

manager.on('error', (error, platform) => {
  console.error(`${platform} 上的错误:`, error);
});
```

### **BaseAdapter**

所有平台适配器扩展的抽象基类。

#### **属性**

```typescript
abstract class BaseAdapter implements IPlatformAdapter {
  readonly config: AdapterConfig;
  readonly capabilities: PlatformCapabilities;
  readonly isAuthenticated: boolean;
  readonly rateLimitInfo: RateLimitInfo | null;
}
```

#### **抽象方法**

所有平台适配器必须实现这些方法：

```typescript
abstract initialize(): Promise<void>;
abstract authenticate(): Promise<boolean>;
abstract post(content: ContentItem): Promise<ActionResult>;
abstract getProfile(userId?: string): Promise<UserProfile>;
abstract startMonitoring(config?: any): Promise<void>;
abstract stopMonitoring(): Promise<void>;
abstract handleWebhook(event: WebhookEvent): Promise<void>;
```

## 🌐 **平台适配器**

### **TwitterAdapter**

具有高级功能的全功能Twitter集成。

#### **配置**

```typescript
interface TwitterConfig extends AdapterConfig {
  auth: {
    type: 'oauth1';
    credentials: {
      apiKey: string;
      apiSecret: string;
      accessToken: string;
      accessTokenSecret: string;
    };
  };
}
```

#### **关键功能**

- 带媒体附件的推文发布
- 高级搜索和过滤
- 实时监控和webhooks
- 分析和互动指标
- 速率限制和配额管理

#### **使用示例**

```typescript
const twitter = new TwitterAdapter(twitterConfig);
await twitter.initialize();
await twitter.authenticate();

// 发布带媒体的推文
await twitter.post({
  type: 'text',
  content: '看看这个惊人的景色！🌅',
  media: [{
    type: 'image',
    url: 'https://example.com/sunset.jpg',
    altText: '山上美丽的日落'
  }]
});

// 开始监控提及
await twitter.startMonitoring({
  keywords: ['@mybot', '#mplp'],
  realTimeUpdates: true
});
```

### **DiscordAdapter**

全面的Discord机器人集成。

#### **配置**

```typescript
interface DiscordConfig extends AdapterConfig {
  auth: {
    type: 'token';
    credentials: {
      token: string;
    };
  };
  guildId?: string;
  defaultChannelId?: string;
}
```

#### **关键功能**

- 向频道和私信发送消息
- 频道和服务器管理
- 用户交互（反应、回复）
- 文件附件和嵌入
- 实时事件处理

#### **使用示例**

```typescript
const discord = new DiscordAdapter(discordConfig);
await discord.initialize();
await discord.authenticate();

// 向频道发送消息
await discord.post({
  type: 'text',
  content: '你好Discord社区！👋',
  metadata: {
    channelId: 'your-channel-id',
    embed: {
      title: 'MPLP更新',
      description: '新功能可用！',
      color: 0x00ff00
    }
  }
});
```

### **SlackAdapter**

企业Slack工作区集成。

#### **配置**

```typescript
interface SlackConfig extends AdapterConfig {
  auth: {
    type: 'oauth2';
    credentials: {
      token: string;
      signingSecret: string;
    };
  };
  workspaceId?: string;
  defaultChannel?: string;
}
```

#### **关键功能**

- 向频道和私信发布消息
- 交互式组件（按钮、模态框）
- 文件共享和附件
- 工作流自动化
- 企业安全功能

### **LinkedInAdapter**

专业LinkedIn集成。

#### **关键功能**

- 向个人和公司页面发布内容
- 专业网络管理
- 内容分析和洞察
- 潜在客户生成工具
- 公司页面管理

### **GitHubAdapter**

面向开发者的GitHub集成。

#### **关键功能**

- 仓库管理
- Issue和PR自动化
- 代码审查工作流
- 发布管理
- 社区互动

### **RedditAdapter**

Reddit社区参与。

#### **关键功能**

- 子版块发布和评论
- 社区管理工具
- 内容监控
- 声望和互动跟踪
- 多子版块管理

### **MediumAdapter**

内容发布平台集成。

#### **关键功能**

- 文章发布和管理
- 出版物管理
- 内容分析
- 草稿和修订管理
- 跨平台发布功能

## 🔧 **类型定义**

### **ContentItem**

```typescript
interface ContentItem {
  type: 'text' | 'image' | 'video' | 'link' | 'poll';
  content: string;
  media?: MediaItem[];
  metadata?: Record<string, any>;
  scheduling?: {
    publishAt: Date;
    timezone?: string;
  };
}
```

### **ActionResult**

```typescript
interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    platform: string;
    timestamp: Date;
    rateLimitInfo?: RateLimitInfo;
  };
}
```

### **AdapterConfig**

```typescript
interface AdapterConfig {
  platform: string;
  name: string;
  version: string;
  enabled: boolean;
  auth: AuthConfig;
  rateLimiting?: RateLimitConfig;
  monitoring?: MonitoringConfig;
}
```

## 🎯 **高级使用示例**

### **企业多平台内容分发**

```typescript
import { AdapterManager, TwitterAdapter, LinkedInAdapter, SlackAdapter } from '@mplp/adapters';

// 创建企业内容分发系统
const contentDistributor = new AdapterManager();

// 添加企业适配器
await contentDistributor.addAdapter('twitter', new TwitterAdapter(twitterConfig));
await contentDistributor.addAdapter('linkedin', new LinkedInAdapter(linkedinConfig));
await contentDistributor.addAdapter('slack', new SlackAdapter(slackConfig));

// 企业内容发布工作流
const publishContent = async (content: ContentItem, targetAudience: string[]) => {
  // 为不同平台定制内容
  const platformContent = {
    twitter: {
      ...content,
      content: content.content.substring(0, 280), // Twitter字符限制
      metadata: { ...content.metadata, hashtags: ['#enterprise', '#automation'] }
    },
    linkedin: {
      ...content,
      metadata: { ...content.metadata, professional: true }
    },
    slack: {
      ...content,
      metadata: { ...content.metadata, channel: '#announcements' }
    }
  };

  // 发布到选定平台
  const results = new Map();
  for (const platform of targetAudience) {
    if (platformContent[platform]) {
      const result = await contentDistributor.getAdapter(platform)?.post(platformContent[platform]);
      results.set(platform, result);
    }
  }

  return results;
};

// 使用
const results = await publishContent({
  type: 'text',
  content: '激动人心的消息！我们的新产品功能现已上线。快来看看吧！',
  media: [{
    type: 'image',
    url: 'https://company.com/product-announcement.jpg'
  }]
}, ['twitter', 'linkedin', 'slack']);
```

### **实时社交媒体监控**

```typescript
// 设置跨平台综合监控
const setupMonitoring = async () => {
  const platforms = ['twitter', 'reddit', 'discord'];
  
  for (const platformName of platforms) {
    const adapter = contentDistributor.getAdapter(platformName);
    if (adapter) {
      // 开始监控
      await adapter.startMonitoring({
        keywords: ['@ourcompany', '#ourproduct', '客户反馈'],
        realTimeUpdates: true,
        filters: {
          sentiment: ['positive', 'negative'],
          languages: ['zh', 'en', 'es']
        }
      });

      // 处理传入的提及和反馈
      adapter.on('mention:received', async (mention) => {
        console.log(`${platformName} 上的新提及:`, mention);
        
        // 自动回复正面提及
        if (mention.sentiment === 'positive') {
          await adapter.post({
            type: 'text',
            content: '感谢您的正面反馈！🙏',
            metadata: { replyTo: mention.id }
          });
        }
        
        // 标记负面提及供人工审查
        if (mention.sentiment === 'negative') {
          await notifyCustomerService(mention);
        }
      });
    }
  }
};

await setupMonitoring();
```

## 🔗 **相关文档**

- [SDK Core API](../sdk-core/README.md) - 应用框架和生命周期管理
- [Agent Builder API](../agent-builder/README.md) - 使用平台适配器构建代理
- [Orchestrator API](../orchestrator/README.md) - 多智能体工作流编排
- [CLI Tools](../cli/README.md) - 开发和部署实用程序

---

**包维护者**: MPLP Adapters团队  
**最后审查**: 2025-09-20  
**平台覆盖**: 7个平台 (Twitter, LinkedIn, GitHub, Discord, Slack, Reddit, Medium)  
**状态**: ✅ 生产就绪
