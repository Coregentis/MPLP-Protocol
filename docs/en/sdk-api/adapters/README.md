# @mplp/adapters API Reference

> **🌐 Language Navigation**: [English](README.md) | [中文](../../../zh-CN/sdk-api/adapters/README.md)


> **Package**: @mplp/adapters  
> **Version**: v1.1.0  
> **Last Updated**: 2025-09-20  
> **Status**: ✅ Production Ready  

## 📚 **Package Overview**

The `@mplp/adapters` package provides a comprehensive unified multi-platform social media and communication platform adapter system. It offers standardized interfaces for interacting with Twitter, LinkedIn, GitHub, Discord, Slack, Reddit, Medium, and other platforms with enterprise-grade features.

### **🎯 Key Features**

- **7 Platform Adapters**: Twitter, LinkedIn, GitHub, Discord, Slack, Reddit, Medium
- **Unified API Interface**: Consistent interface across all platforms
- **Adapter Manager**: Centralized management of multiple platform adapters
- **Event-Driven Architecture**: Real-time event handling based on EventEmitter
- **Rate Limiting**: Intelligent API call frequency control and quota management
- **Bulk Operations**: Simultaneous content publishing to multiple platforms
- **Error Handling**: Comprehensive error handling and retry mechanisms
- **TypeScript Support**: Complete TypeScript type definitions and type safety

### **📦 Installation**

```bash
npm install @mplp/adapters
```

### **🏗️ Architecture**

```
┌─────────────────────────────────────────┐
│            AdapterManager               │
│     (Centralized Multi-Platform)       │
├─────────────────────────────────────────┤
│  TwitterAdapter | LinkedInAdapter      │
│  GitHubAdapter  | DiscordAdapter       │
│  SlackAdapter   | RedditAdapter        │
│  MediumAdapter  | BaseAdapter          │
├─────────────────────────────────────────┤
│         Platform APIs                   │
│  Twitter API | LinkedIn API | etc.     │
└─────────────────────────────────────────┘
```

## 🚀 **Quick Start**

### **Basic Multi-Platform Setup**

```typescript
import { AdapterManager, TwitterAdapter, DiscordAdapter } from '@mplp/adapters';

// Create adapter manager
const manager = new AdapterManager();

// Create platform adapters
const twitterAdapter = new TwitterAdapter({
  platform: 'twitter',
  name: 'Twitter Bot',
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
  name: 'Discord Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'token',
    credentials: {
      token: process.env.DISCORD_TOKEN!
    }
  }
});

// Add adapters to manager
await manager.addAdapter('twitter', twitterAdapter);
await manager.addAdapter('discord', discordAdapter);

// Post to all platforms
const content = {
  type: 'text',
  content: 'Hello from MPLP! 🚀',
  metadata: {
    tags: ['mplp', 'automation']
  }
};

const results = await manager.postToAll(content);
console.log('Publishing results:', results);
```

### **Single Platform Usage**

```typescript
import { TwitterAdapter } from '@mplp/adapters';

const twitter = new TwitterAdapter({
  platform: 'twitter',
  name: 'My Twitter Bot',
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

// Post a tweet
const result = await twitter.post({
  type: 'text',
  content: 'Hello Twitter! 🐦',
  media: [{
    type: 'image',
    url: 'https://example.com/image.jpg'
  }]
});

console.log('Tweet posted:', result);
```

## 📋 **Core Classes**

### **AdapterManager**

Centralized manager for multiple platform adapters with bulk operations support.

#### **Constructor**

```typescript
constructor()
```

#### **Adapter Management Methods**

##### `addAdapter(name: string, adapter: IPlatformAdapter): Promise<void>`

Adds a platform adapter to the manager.

```typescript
await manager.addAdapter('twitter', twitterAdapter);
```

##### `removeAdapter(name: string): Promise<void>`

Removes a platform adapter from the manager.

```typescript
await manager.removeAdapter('twitter');
```

##### `getAdapter(name: string): IPlatformAdapter | undefined`

Gets a specific adapter by name.

```typescript
const twitter = manager.getAdapter('twitter');
if (twitter) {
  console.log(`Twitter adapter status: ${twitter.isAuthenticated}`);
}
```

##### `get adapters(): Map<string, IPlatformAdapter>`

Gets all registered adapters.

```typescript
const allAdapters = manager.adapters;
console.log(`Total adapters: ${allAdapters.size}`);
```

#### **Bulk Operations**

##### `postToAll(content: ContentItem, platforms?: string[]): Promise<Map<string, ActionResult>>`

Posts content to all registered platforms or specified platforms.

```typescript
const results = await manager.postToAll({
  type: 'text',
  content: 'Multi-platform announcement! 🚀'
});

// Check results
for (const [platform, result] of results) {
  if (result.success) {
    console.log(`✅ Posted to ${platform}: ${result.data?.id}`);
  } else {
    console.error(`❌ Failed to post to ${platform}: ${result.error}`);
  }
}
```

##### `postToMultiple(content: ContentItem, platforms: string[]): Promise<Map<string, ActionResult>>`

Posts content to specific platforms.

```typescript
const results = await manager.postToMultiple({
  type: 'text',
  content: 'Professional announcement 💼'
}, ['linkedin', 'twitter']);
```

#### **Monitoring Operations**

##### `startMonitoringAll(): Promise<void>`

Starts monitoring on all platforms that support it.

```typescript
await manager.startMonitoringAll();
console.log('Monitoring started on all platforms');
```

##### `stopMonitoringAll(): Promise<void>`

Stops monitoring on all platforms.

```typescript
await manager.stopMonitoringAll();
console.log('Monitoring stopped on all platforms');
```

#### **Analytics Operations**

##### `getAggregatedAnalytics(postId: string): Promise<Map<string, ContentMetrics>>`

Gets aggregated analytics data across platforms.

```typescript
const analytics = await manager.getAggregatedAnalytics('post-123');
for (const [platform, metrics] of analytics) {
  console.log(`${platform}: ${metrics.views} views, ${metrics.engagements} engagements`);
}
```

#### **Events**

The AdapterManager emits various events:

```typescript
manager.on('adapter:added', (name, adapter) => {
  console.log(`Adapter added: ${name}`);
});

manager.on('adapter:removed', (name) => {
  console.log(`Adapter removed: ${name}`);
});

manager.on('content:posted', (platform, result) => {
  console.log(`Content posted to ${platform}:`, result);
});

manager.on('error', (error, platform) => {
  console.error(`Error on ${platform}:`, error);
});
```

### **BaseAdapter**

Abstract base class that all platform adapters extend.

#### **Properties**

```typescript
abstract class BaseAdapter implements IPlatformAdapter {
  readonly config: AdapterConfig;
  readonly capabilities: PlatformCapabilities;
  readonly isAuthenticated: boolean;
  readonly rateLimitInfo: RateLimitInfo | null;
}
```

#### **Abstract Methods**

All platform adapters must implement these methods:

```typescript
abstract initialize(): Promise<void>;
abstract authenticate(): Promise<boolean>;
abstract post(content: ContentItem): Promise<ActionResult>;
abstract getProfile(userId?: string): Promise<UserProfile>;
abstract startMonitoring(config?: any): Promise<void>;
abstract stopMonitoring(): Promise<void>;
abstract handleWebhook(event: WebhookEvent): Promise<void>;
```

## 🌐 **Platform Adapters**

### **TwitterAdapter**

Full-featured Twitter integration with advanced capabilities.

#### **Configuration**

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

#### **Key Features**

- Tweet posting with media attachments
- Advanced search and filtering
- Real-time monitoring and webhooks
- Analytics and engagement metrics
- Rate limiting and quota management

#### **Usage Example**

```typescript
const twitter = new TwitterAdapter(twitterConfig);
await twitter.initialize();
await twitter.authenticate();

// Post with media
await twitter.post({
  type: 'text',
  content: 'Check out this amazing view! 🌅',
  media: [{
    type: 'image',
    url: 'https://example.com/sunset.jpg',
    altText: 'Beautiful sunset over the mountains'
  }]
});

// Start monitoring mentions
await twitter.startMonitoring({
  keywords: ['@mybot', '#mplp'],
  realTimeUpdates: true
});
```

### **DiscordAdapter**

Comprehensive Discord bot integration.

#### **Configuration**

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

#### **Key Features**

- Message sending to channels and DMs
- Channel and server management
- User interaction (reactions, replies)
- File attachments and embeds
- Real-time event handling

#### **Usage Example**

```typescript
const discord = new DiscordAdapter(discordConfig);
await discord.initialize();
await discord.authenticate();

// Send message to channel
await discord.post({
  type: 'text',
  content: 'Hello Discord community! 👋',
  metadata: {
    channelId: 'your-channel-id',
    embed: {
      title: 'MPLP Update',
      description: 'New features available!',
      color: 0x00ff00
    }
  }
});
```

### **SlackAdapter**

Enterprise Slack workspace integration.

#### **Configuration**

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

#### **Key Features**

- Message posting to channels and DMs
- Interactive components (buttons, modals)
- File sharing and attachments
- Workflow automation
- Enterprise security features

### **LinkedInAdapter**

Professional LinkedIn integration.

#### **Key Features**

- Post publishing to personal and company pages
- Professional network management
- Content analytics and insights
- Lead generation tools
- Company page management

### **GitHubAdapter**

Developer-focused GitHub integration.

#### **Key Features**

- Repository management
- Issue and PR automation
- Code review workflows
- Release management
- Community interaction

### **RedditAdapter**

Reddit community engagement.

#### **Key Features**

- Subreddit posting and commenting
- Community moderation tools
- Content monitoring
- Karma and engagement tracking
- Multi-subreddit management

### **MediumAdapter**

Content publishing platform integration.

#### **Key Features**

- Article publishing and management
- Publication management
- Content analytics
- Draft and revision management
- Cross-posting capabilities

## 🔧 **Type Definitions**

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

## 🎯 **Advanced Usage Examples**

### **Enterprise Multi-Platform Content Distribution**

```typescript
import { AdapterManager, TwitterAdapter, LinkedInAdapter, SlackAdapter } from '@mplp/adapters';

// Create enterprise content distribution system
const contentDistributor = new AdapterManager();

// Add enterprise adapters
await contentDistributor.addAdapter('twitter', new TwitterAdapter(twitterConfig));
await contentDistributor.addAdapter('linkedin', new LinkedInAdapter(linkedinConfig));
await contentDistributor.addAdapter('slack', new SlackAdapter(slackConfig));

// Enterprise content publishing workflow
const publishContent = async (content: ContentItem, targetAudience: string[]) => {
  // Customize content for different platforms
  const platformContent = {
    twitter: {
      ...content,
      content: content.content.substring(0, 280), // Twitter character limit
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

  // Publish to selected platforms
  const results = new Map();
  for (const platform of targetAudience) {
    if (platformContent[platform]) {
      const result = await contentDistributor.getAdapter(platform)?.post(platformContent[platform]);
      results.set(platform, result);
    }
  }

  return results;
};

// Usage
const results = await publishContent({
  type: 'text',
  content: 'Exciting news! Our new product features are now live. Check them out!',
  media: [{
    type: 'image',
    url: 'https://company.com/product-announcement.jpg'
  }]
}, ['twitter', 'linkedin', 'slack']);
```

### **Real-Time Social Media Monitoring**

```typescript
// Set up comprehensive monitoring across platforms
const setupMonitoring = async () => {
  const platforms = ['twitter', 'reddit', 'discord'];
  
  for (const platformName of platforms) {
    const adapter = contentDistributor.getAdapter(platformName);
    if (adapter) {
      // Start monitoring
      await adapter.startMonitoring({
        keywords: ['@ourcompany', '#ourproduct', 'customer feedback'],
        realTimeUpdates: true,
        filters: {
          sentiment: ['positive', 'negative'],
          languages: ['en', 'es', 'fr']
        }
      });

      // Handle incoming mentions and feedback
      adapter.on('mention:received', async (mention) => {
        console.log(`New mention on ${platformName}:`, mention);
        
        // Auto-respond to positive mentions
        if (mention.sentiment === 'positive') {
          await adapter.post({
            type: 'text',
            content: 'Thank you for the positive feedback! 🙏',
            metadata: { replyTo: mention.id }
          });
        }
        
        // Flag negative mentions for human review
        if (mention.sentiment === 'negative') {
          await notifyCustomerService(mention);
        }
      });
    }
  }
};

await setupMonitoring();
```

## 🔗 **Related Documentation**

- [SDK Core API](../sdk-core/README.md) - Application framework and lifecycle management
- [Agent Builder API](../agent-builder/README.md) - Building agents with platform adapters
- [Orchestrator API](../orchestrator/README.md) - Multi-agent workflow orchestration
- [CLI Tools](../cli/README.md) - Development and deployment utilities

---

**Package Maintainer**: MPLP Adapters Team  
**Last Review**: 2025-09-20  
**Platform Coverage**: 7 platforms (Twitter, LinkedIn, GitHub, Discord, Slack, Reddit, Medium)  
**Status**: ✅ Production Ready
