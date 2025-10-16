# MPLP Platform Adapters

## 概述

MPLP Platform Adapters 是一个统一的多平台社交媒体和开发平台适配器系统，提供标准化的接口来与Twitter、LinkedIn、GitHub等平台进行交互。

## 特性

### 🌐 支持的平台
- **Twitter**: 推文发布、互动、监控
- **LinkedIn**: 内容发布、网络建设、企业页面管理
- **GitHub**: 仓库管理、Issue/PR处理、社区互动

### 🏗️ 核心架构
- **统一接口**: 所有平台使用相同的API接口
- **工厂模式**: 统一的适配器创建和配置验证
- **事件驱动**: 基于EventEmitter的实时事件处理
- **类型安全**: 完整的TypeScript类型定义

### 🚀 高级功能
- **批量操作**: 同时向多个平台发布内容
- **智能内容处理**: 自动内容验证和转换
- **速率限制**: 智能API调用频率控制
- **错误处理**: 完善的错误处理和重试机制
- **实时监控**: 提及、消息和事件监控
- **Webhook集成**: 实时事件推送支持

## 快速开始

### 安装

```bash
npm install @mplp/adapters
```

### 基本使用

```typescript
import { AdapterFactory, AdapterManager } from '@mplp/adapters';

// 创建适配器工厂
const factory = AdapterFactory.getInstance();

// 创建Twitter适配器
const twitterAdapter = factory.createAdapter('twitter', {
  platform: 'twitter',
  name: 'My Twitter Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'oauth1',
    credentials: {
      apiKey: 'your-api-key',
      apiSecret: 'your-api-secret',
      accessToken: 'your-access-token',
      accessTokenSecret: 'your-access-token-secret'
    }
  }
});

// 创建适配器管理器
const manager = new AdapterManager();
await manager.addAdapter('twitter', twitterAdapter);

// 发布内容
const content = {
  type: 'text',
  content: 'Hello from MPLP! 🚀'
};

const result = await manager.postToAll(content);
console.log('发布结果:', result);
```

## 平台适配器详解

### Twitter适配器

```typescript
import { TwitterAdapter } from '@mplp/adapters';

const twitterConfig = {
  platform: 'twitter',
  name: 'Twitter Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'oauth1',
    credentials: {
      apiKey: 'your-twitter-api-key',
      apiSecret: 'your-twitter-api-secret',
      accessToken: 'your-access-token',
      accessTokenSecret: 'your-access-token-secret'
    }
  }
};

const twitter = new TwitterAdapter(twitterConfig);
await twitter.initialize();
await twitter.authenticate();

// 发布推文
await twitter.post({
  type: 'text',
  content: 'Hello Twitter! 🐦',
  media: [{
    type: 'image',
    url: 'https://example.com/image.jpg'
  }]
});

// 回复推文
await twitter.comment('tweet-id', 'Great tweet!');

// 转发推文
await twitter.share('tweet-id', 'Sharing this amazing content');

// 关注用户
await twitter.follow('username');
```

### LinkedIn适配器

```typescript
import { LinkedInAdapter } from '@mplp/adapters';

const linkedinConfig = {
  platform: 'linkedin',
  name: 'LinkedIn Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'oauth2',
    credentials: {
      clientId: 'your-linkedin-client-id',
      clientSecret: 'your-linkedin-client-secret',
      accessToken: 'your-access-token'
    }
  }
};

const linkedin = new LinkedInAdapter(linkedinConfig);
await linkedin.initialize();
await linkedin.authenticate();

// 发布LinkedIn帖子
await linkedin.post({
  type: 'text',
  content: 'Professional update from MPLP 💼',
  tags: ['technology', 'automation']
});

// 发布带链接的帖子
await linkedin.post({
  type: 'link',
  content: 'Check out this amazing article',
  metadata: {
    url: 'https://example.com/article',
    title: 'Amazing Article',
    description: 'This article is amazing'
  }
});
```

### GitHub适配器

```typescript
import { GitHubAdapter } from '@mplp/adapters';

const githubConfig = {
  platform: 'github',
  name: 'GitHub Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'bearer',
    credentials: {
      token: 'your-github-personal-access-token'
    }
  },
  settings: {
    defaultRepository: 'owner/repo'
  }
};

const github = new GitHubAdapter(githubConfig);
await github.initialize();
await github.authenticate();

// 创建Issue
await github.post({
  type: 'text',
  content: 'This is a bug report',
  metadata: {
    title: 'Bug: Something is broken',
    repository: 'owner/repo'
  }
});

// 创建Pull Request
await github.post({
  type: 'text',
  content: 'This PR fixes the bug',
  metadata: {
    type: 'pull_request',
    title: 'Fix: Resolve the bug',
    head: 'feature-branch',
    base: 'main',
    repository: 'owner/repo'
  }
});

// 创建Release
await github.post({
  type: 'text',
  content: 'Release notes for v1.0.0',
  metadata: {
    type: 'release',
    title: 'Version 1.0.0',
    tag: 'v1.0.0',
    repository: 'owner/repo'
  }
});
```

## 适配器管理器

AdapterManager 提供了统一管理多个适配器的功能：

```typescript
import { AdapterManager, AdapterFactory } from '@mplp/adapters';

const manager = new AdapterManager();
const factory = AdapterFactory.getInstance();

// 添加多个适配器
const twitterAdapter = factory.createAdapter('twitter', twitterConfig);
const linkedinAdapter = factory.createAdapter('linkedin', linkedinConfig);
const githubAdapter = factory.createAdapter('github', githubConfig);

await manager.addAdapter('twitter', twitterAdapter);
await manager.addAdapter('linkedin', linkedinAdapter);
await manager.addAdapter('github', githubAdapter);

// 向所有平台发布内容
const results = await manager.postToAll({
  type: 'text',
  content: 'Multi-platform announcement! 🚀'
});

// 向特定平台发布
const specificResults = await manager.postToMultiple({
  type: 'text',
  content: 'Professional announcement 💼'
}, ['linkedin', 'twitter']);

// 启动所有平台监控
await manager.startMonitoringAll();

// 获取聚合分析数据
const analytics = await manager.getAggregatedAnalytics('post-id');

// 批量关注操作
const followResults = await manager.followOnAll('target-user');

// 跨平台搜索
const searchResults = await manager.searchAll('MPLP platform');
```

## 事件处理

所有适配器都支持事件驱动的架构：

```typescript
// 监听适配器事件
adapter.on('content:posted', (result) => {
  console.log('内容已发布:', result);
});

adapter.on('mention:received', (mention) => {
  console.log('收到提及:', mention);
});

adapter.on('adapter:error', (error) => {
  console.error('适配器错误:', error);
});

// 监听管理器事件
manager.on('adapter:added', (name, adapter) => {
  console.log(`适配器 ${name} 已添加`);
});

manager.on('bulk:post:complete', (results) => {
  console.log('批量发布完成:', results);
});
```

## 内容处理工具

### 内容验证

```typescript
import { ContentValidator } from '@mplp/adapters';

const content = {
  type: 'text',
  content: 'Hello world!'
};

// 验证内容是否适合特定平台
const isValidForTwitter = ContentValidator.validateForPlatform(content, 'twitter');
const isValidForLinkedIn = ContentValidator.validateForPlatform(content, 'linkedin');
```

### 内容转换

```typescript
import { ContentTransformer } from '@mplp/adapters';

const content = {
  type: 'text',
  content: 'Hello world',
  tags: ['mplp', 'automation'],
  mentions: ['user1', 'user2']
};

// 为不同平台转换内容
const twitterContent = ContentTransformer.transformForPlatform(content, 'twitter');
const linkedinContent = ContentTransformer.transformForPlatform(content, 'linkedin');
```

### 速率限制处理

```typescript
import { RateLimitHelper } from '@mplp/adapters';

// 计算退避延迟
const backoffDelay = RateLimitHelper.calculateBackoffDelay(3); // 第3次重试
const linearDelay = RateLimitHelper.calculateLinearDelay(2); // 第2次重试

// 检查速率限制状态
const isLimited = RateLimitHelper.isRateLimited(rateLimitInfo);
const resetTime = RateLimitHelper.getTimeUntilReset(rateLimitInfo);
```

## 配置管理

### 配置验证

```typescript
import { ConfigHelper } from '@mplp/adapters';

const config = {
  platform: 'twitter',
  name: 'My Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'oauth1',
    credentials: {
      apiKey: 'key',
      apiSecret: 'secret'
    }
  }
};

// 验证配置
const validation = ConfigHelper.validateConfig(config);
if (!validation.valid) {
  console.error('配置错误:', validation.errors);
}

// 合并配置
const baseConfig = factory.getDefaultConfig('twitter');
const mergedConfig = ConfigHelper.mergeConfigs(baseConfig, config);
```

### 配置模板

```typescript
// 获取平台配置模板
const twitterTemplate = factory.getConfigTemplate('twitter');
const linkedinTemplate = factory.getConfigTemplate('linkedin');
const githubTemplate = factory.getConfigTemplate('github');

// 获取平台能力信息
const twitterCapabilities = factory.getPlatformCapabilities('twitter');
console.log('Twitter支持的功能:', twitterCapabilities.features);
console.log('Twitter内容长度限制:', twitterCapabilities.limits.maxContentLength);
```

## 错误处理

```typescript
import { ErrorHelper } from '@mplp/adapters';

try {
  await adapter.post(content);
} catch (error) {
  // 检查错误类型
  if (ErrorHelper.isRateLimitError(error)) {
    const retryDelay = ErrorHelper.getRetryDelay(error);
    console.log(`速率限制，${retryDelay}ms后重试`);
    
    setTimeout(() => {
      // 重试逻辑
    }, retryDelay);
  } else if (ErrorHelper.isAuthError(error)) {
    console.log('认证错误，需要重新认证');
    await adapter.authenticate();
  } else {
    console.error('其他错误:', error.message);
  }
}
```

## 分析和监控

```typescript
import { AnalyticsHelper } from '@mplp/adapters';

// 获取单个帖子的分析数据
const analytics = await adapter.getAnalytics('post-id');
console.log('参与率:', AnalyticsHelper.calculateEngagementRate(analytics));

// 聚合多平台分析数据
const allAnalytics = await manager.getAggregatedAnalytics('post-id');
const aggregated = AnalyticsHelper.aggregateMetrics(allAnalytics);
console.log('总参与度:', aggregated.engagement);
console.log('覆盖平台数:', aggregated.platforms);
```

## 最佳实践

### 1. 错误处理和重试

```typescript
async function postWithRetry(adapter, content, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await adapter.post(content);
    } catch (error) {
      if (ErrorHelper.isRateLimitError(error) && attempt < maxRetries - 1) {
        const delay = RateLimitHelper.calculateBackoffDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

### 2. 批量操作优化

```typescript
// 使用适配器管理器进行批量操作
const results = await manager.postToAll(content);

// 检查结果并处理失败的平台
for (const [platform, result] of results) {
  if (!result.success) {
    console.error(`${platform} 发布失败:`, result.error);
    // 实施重试或备用策略
  }
}
```

### 3. 监控和日志

```typescript
// 设置全面的事件监听
manager.on('adapter:error', (name, error) => {
  console.error(`适配器 ${name} 错误:`, error);
  // 发送到日志系统
});

manager.on('content:posted', (name, result) => {
  console.log(`内容已发布到 ${name}:`, result.data?.url);
  // 记录成功指标
});
```

## API参考

详细的API文档请参考：
- [Types API](./types.md) - 类型定义
- [BaseAdapter API](./base-adapter.md) - 基础适配器
- [AdapterFactory API](./adapter-factory.md) - 适配器工厂
- [AdapterManager API](./adapter-manager.md) - 适配器管理器
- [Utils API](./utils.md) - 工具函数

## 许可证

MIT License
