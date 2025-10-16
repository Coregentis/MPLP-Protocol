# MPLP Extended Platform Adapters

## 📋 Overview

The MPLP Extended Platform Adapters provide comprehensive integration with Discord, Slack, Reddit, and Medium platforms. These adapters extend the core platform adapter architecture to support platform-specific features and workflows.

## 🎯 Supported Platforms

### 💬 Discord Adapter

**Features:**
- Message sending to channels and DMs
- Channel management (create, delete, manage)
- User interaction (reactions, replies, mentions)
- Bot permission management
- Webhook support for real-time events
- File attachments and embeds

**Configuration:**
```typescript
const discordConfig: AdapterConfig = {
  platform: 'discord',
  name: 'Discord Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'bearer',
    credentials: {
      token: 'your-discord-bot-token'
    }
  },
  settings: {
    defaultChannel: '123456789012345678',
    defaultReaction: '👍'
  }
};
```

**Usage:**
```typescript
import { DiscordAdapter } from '@mplp/adapters';

const adapter = new DiscordAdapter(discordConfig);
await adapter.initialize();
await adapter.authenticate();

// Send message
await adapter.post({
  type: 'text',
  content: 'Hello Discord! 🎮',
  metadata: {
    channelId: '123456789012345678'
  }
});

// Add reaction
await adapter.like('123456789012345678/987654321098765432');
```

### 💼 Slack Adapter

**Features:**
- Message sending to channels and DMs
- Channel management (create, archive, manage)
- Workflow integration with Slack's workflow builder
- Enterprise features (workspace management, permissions)
- Scheduled messages
- File uploads and rich formatting

**Configuration:**
```typescript
const slackConfig: AdapterConfig = {
  platform: 'slack',
  name: 'Slack Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'bearer',
    credentials: {
      token: 'xoxb-your-slack-bot-token'
    }
  },
  settings: {
    defaultChannel: 'C1234567890',
    workspace: 'your-workspace'
  }
};
```

**Usage:**
```typescript
import { SlackAdapter } from '@mplp/adapters';

const adapter = new SlackAdapter(slackConfig);
await adapter.initialize();
await adapter.authenticate();

// Send message with blocks
await adapter.post({
  type: 'text',
  content: 'Hello Slack!',
  metadata: {
    channel: 'C1234567890',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Hello from MPLP! :wave:'
        }
      }
    ]
  }
});

// Schedule message
await adapter.post({
  type: 'text',
  content: 'Scheduled message',
  metadata: {
    channel: 'C1234567890',
    scheduleTime: '2024-01-01T12:00:00Z'
  }
});
```

### 📱 Reddit Adapter

**Features:**
- Post publishing to subreddits
- Comment interaction functionality
- Community management features
- Content monitoring and moderation tools
- Voting system (upvote/downvote)
- Flair and NSFW/spoiler support

**Configuration:**
```typescript
const redditConfig: AdapterConfig = {
  platform: 'reddit',
  name: 'Reddit Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'oauth2',
    credentials: {
      clientId: 'your-reddit-client-id',
      clientSecret: 'your-reddit-client-secret',
      username: 'your-reddit-username',
      password: 'your-reddit-password'
    }
  },
  settings: {
    defaultSubreddit: 'test',
    userAgent: 'MPLP Bot v1.0'
  }
};
```

**Usage:**
```typescript
import { RedditAdapter } from '@mplp/adapters';

const adapter = new RedditAdapter(redditConfig);
await adapter.initialize();
await adapter.authenticate();

// Submit post
await adapter.post({
  type: 'text',
  content: 'This is the post content',
  metadata: {
    title: 'My Reddit Post',
    subreddit: 'test',
    flair: {
      id: 'flair-id',
      text: 'Discussion'
    },
    nsfw: false,
    spoiler: false
  }
});

// Upvote post
await adapter.like('t3_post_id');

// Comment on post
await adapter.comment('t3_post_id', 'Great post!');
```

### 📝 Medium Adapter

**Features:**
- Article publishing functionality
- Content management (drafts, published articles)
- Reader interaction features
- Statistics and analytics data retrieval
- Publication support
- Canonical URL and licensing options

**Configuration:**
```typescript
const mediumConfig: AdapterConfig = {
  platform: 'medium',
  name: 'Medium Publisher',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'bearer',
    credentials: {
      accessToken: 'your-medium-access-token'
    }
  }
};
```

**Usage:**
```typescript
import { MediumAdapter } from '@mplp/adapters';

const adapter = new MediumAdapter(mediumConfig);
await adapter.initialize();
await adapter.authenticate();

// Publish article
await adapter.post({
  type: 'text',
  content: '# My Article\n\nThis is the article content in Markdown.',
  metadata: {
    title: 'My Medium Article',
    publishStatus: 'public', // 'public', 'draft', 'unlisted'
    license: 'all-rights-reserved',
    canonicalUrl: 'https://example.com/original-article'
  },
  tags: ['technology', 'programming', 'medium']
});

// Get user's publications
const publications = await adapter.getPublications();

// Publish to publication
await adapter.post({
  type: 'text',
  content: '# Publication Article\n\nContent for publication.',
  metadata: {
    title: 'Article in Publication',
    publishStatus: 'public',
    publicationId: 'publication-id'
  }
});
```

## 🏭 Factory Integration

All extended adapters are integrated with the AdapterFactory:

```typescript
import { AdapterFactory } from '@mplp/adapters';

const factory = AdapterFactory.getInstance();

// Create Discord adapter
const discordAdapter = factory.createAdapter('discord', discordConfig);

// Create Slack adapter
const slackAdapter = factory.createAdapter('slack', slackConfig);

// Create Reddit adapter
const redditAdapter = factory.createAdapter('reddit', redditConfig);

// Create Medium adapter
const mediumAdapter = factory.createAdapter('medium', mediumConfig);

// Get all supported platforms
const platforms = factory.getSupportedPlatforms();
// Returns: ['twitter', 'linkedin', 'github', 'discord', 'slack', 'reddit', 'medium']
```

## 🔧 Manager Integration

Use AdapterManager for multi-platform operations:

```typescript
import { AdapterManager } from '@mplp/adapters';

const manager = new AdapterManager();

// Add adapters
manager.addAdapter('discord', discordAdapter);
manager.addAdapter('slack', slackAdapter);
manager.addAdapter('reddit', redditAdapter);
manager.addAdapter('medium', mediumAdapter);

// Bulk post to all platforms
await manager.postToAll({
  type: 'text',
  content: 'Hello from all platforms!',
  metadata: {
    // Platform-specific metadata will be handled automatically
  }
});

// Search across all platforms
const searchResults = await manager.searchAll('MPLP');

// Get aggregated analytics
const analytics = await manager.getAggregatedAnalytics();
```

## 📊 Platform Capabilities

| Feature | Discord | Slack | Reddit | Medium |
|---------|---------|-------|--------|--------|
| Post | ✅ | ✅ | ✅ | ✅ |
| Comment | ✅ | ✅ | ✅ | ❌ |
| Share | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ✅ | ✅ |
| Like/React | ✅ | ✅ | ✅ | ❌ |
| Follow | ❌ | ❌ | ❌ | ❌ |
| Message | ✅ | ✅ | ❌ | ❌ |
| Mention | ✅ | ✅ | ✅ | ❌ |
| Polls | ❌ | ❌ | ✅ | ❌ |
| Scheduling | ❌ | ✅ | ❌ | ❌ |
| Analytics | ❌ | ❌ | ❌ | ✅ |
| Webhooks | ✅ | ✅ | ❌ | ❌ |

## 🔒 Authentication

### Discord
- **Type**: Bearer Token
- **Required**: Bot Token from Discord Developer Portal
- **Scopes**: bot, send_messages, manage_channels, add_reactions

### Slack
- **Type**: Bearer Token  
- **Required**: Bot User OAuth Token
- **Scopes**: chat:write, channels:manage, reactions:write, files:write

### Reddit
- **Type**: OAuth2
- **Required**: Client ID, Client Secret, Username, Password
- **Scopes**: submit, edit, read, vote, identity

### Medium
- **Type**: Bearer Token
- **Required**: Integration Token from Medium Settings
- **Scopes**: basicProfile, publishPost, listPublications

## 🚀 Getting Started

1. **Install the package:**
```bash
npm install @mplp/adapters
```

2. **Import and configure:**
```typescript
import { DiscordAdapter, SlackAdapter, RedditAdapter, MediumAdapter } from '@mplp/adapters';
```

3. **Initialize adapters:**
```typescript
const adapters = [
  new DiscordAdapter(discordConfig),
  new SlackAdapter(slackConfig),
  new RedditAdapter(redditConfig),
  new MediumAdapter(mediumConfig)
];

// Initialize all adapters
await Promise.all(adapters.map(adapter => adapter.initialize()));
await Promise.all(adapters.map(adapter => adapter.authenticate()));
```

4. **Start using:**
```typescript
// Post to Discord
await discordAdapter.post({
  type: 'text',
  content: 'Hello Discord!',
  metadata: { channelId: 'your-channel-id' }
});

// Publish to Medium
await mediumAdapter.post({
  type: 'text',
  content: '# My Article\n\nContent here...',
  metadata: { 
    title: 'My Article',
    publishStatus: 'public'
  }
});
```

## 📚 API Reference

For detailed API documentation, see:
- [Discord Adapter API](./discord-api.md)
- [Slack Adapter API](./slack-api.md)
- [Reddit Adapter API](./reddit-api.md)
- [Medium Adapter API](./medium-api.md)

## 🧪 Testing

All adapters include comprehensive test suites with mock clients for development and testing:

```bash
npm test
```

## 🔧 Configuration Examples

See the [examples](./examples/) directory for complete configuration examples and use cases.

## 📝 License

MIT License - see LICENSE file for details.
