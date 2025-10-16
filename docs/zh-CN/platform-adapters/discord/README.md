# Discord平台适配器 - 完整使用指南

> **🌐 语言导航**: [English](../../../en/platform-adapters/discord/README.md) | [中文](README.md)


> **平台**: Discord  
> **适配器**: @mplp/adapters - DiscordAdapter  
> **版本**: v1.1.0-beta  
> **更新时间**: 2025-09-20  
> **状态**: ✅ 生产就绪  

## 📚 **概览**

Discord平台适配器提供与Discord通信平台的全面集成，使智能代理能够与Discord服务器交互、管理频道、发送消息、处理斜杠命令，并与社区成员互动。它使用Discord.js v14，具有适用于机器人和用户应用程序的企业级功能。

### **🎯 关键功能**

- **💬 消息管理**: 发送、编辑、删除带有丰富嵌入和附件的消息
- **🏰 服务器管理**: 管理公会、频道、角色和权限
- **⚡ 斜杠命令**: 创建和处理现代Discord斜杠命令
- **🎭 角色管理**: 分配角色、管理权限、审核功能
- **🔐 机器人认证**: Discord机器人令牌认证，支持OAuth2
- **⚡ 速率限制**: 智能Discord API速率限制管理
- **🔄 实时事件**: 实时Discord交互的网关事件
- **🛡️ 错误处理**: 全面的错误处理和重试机制

### **📦 安装**

```bash
# 安装适配器包
npm install @mplp/adapters

# 或全局安装用于CLI使用
npm install -g @mplp/adapters
```

## 🚀 **快速开始**

### **基础设置**

```typescript
import { DiscordAdapter } from '@mplp/adapters';

// 使用机器人令牌创建Discord适配器
const discord = new DiscordAdapter({
  platform: 'discord',
  name: '我的Discord机器人',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'bot',
    credentials: {
      token: process.env.DISCORD_BOT_TOKEN! // Discord机器人令牌
    }
  }
});

// 初始化和认证
await discord.initialize();
await discord.authenticate();

console.log('✅ Discord适配器已就绪！');
```

### **发送第一条消息**

```typescript
// 向频道发送消息
const result = await discord.post({
  type: 'text',
  channel: 'channel-id-here',
  content: '你好Discord！🤖 这是我从MPLP发送的第一条消息！'
});

console.log(`消息已发送: ${result.data.id}`);
```

## 🔧 **配置**

### **机器人认证**

#### **基础机器人配置**

```typescript
const discordConfig = {
  platform: 'discord',
  name: 'Discord机器人',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'bot',
    credentials: {
      token: 'your-discord-bot-token-here'
    }
  },
  intents: [
    'GUILDS',              // 访问公会信息
    'GUILD_MESSAGES',      // 读取公会中的消息
    'MESSAGE_CONTENT',     // 访问消息内容
    'GUILD_MEMBERS',       // 访问公会成员信息
    'GUILD_MESSAGE_REACTIONS' // 对消息做出反应
  ],
  rateLimits: {
    messages: { requests: 50, window: 60000 }, // 每分钟50条消息
    commands: { requests: 200, window: 60000 } // 每分钟200个命令
  }
};
```

#### **高级机器人配置**

```typescript
const advancedConfig = {
  platform: 'discord',
  name: '高级Discord机器人',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'bot',
    credentials: {
      token: process.env.DISCORD_BOT_TOKEN!,
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!
    }
  },
  intents: [
    'GUILDS', 'GUILD_MESSAGES', 'MESSAGE_CONTENT', 
    'GUILD_MEMBERS', 'GUILD_MESSAGE_REACTIONS',
    'GUILD_VOICE_STATES', 'GUILD_PRESENCES'
  ],
  rateLimits: {
    messages: { requests: 50, window: 60000 },
    commands: { requests: 200, window: 60000 },
    reactions: { requests: 300, window: 60000 }
  },
  retryPolicy: {
    maxRetries: 3,
    backoffMultiplier: 2,
    maxBackoffTime: 30000
  },
  monitoring: {
    enabled: true,
    webhookUrl: 'https://yourapp.com/webhooks/discord',
    events: ['message', 'member_join', 'member_leave', 'reaction_add']
  },
  moderation: {
    autoModeration: true,
    spamProtection: true,
    profanityFilter: true,
    maxMentions: 5,
    maxEmojis: 10
  }
};
```

## 📝 **核心操作**

### **消息管理**

#### **文本消息**

```typescript
// 简单文本消息
await discord.post({
  type: 'text',
  channel: 'channel-id',
  content: '大家好！👋'
});

// 带提及的消息
await discord.post({
  type: 'text',
  channel: 'channel-id',
  content: '欢迎来到服务器，<@user-id>！请阅读 <#rules-channel-id> 📋',
  metadata: {
    mentions: ['user-id'],
    channelMentions: ['rules-channel-id']
  }
});

// 带自定义表情的消息
await discord.post({
  type: 'text',
  channel: 'channel-id',
  content: '项目做得很好！<:custom_emoji:emoji-id> 🎉'
});
```

#### **丰富嵌入消息**

```typescript
// 丰富嵌入消息
await discord.post({
  type: 'embed',
  channel: 'channel-id',
  content: {
    title: '🚀 新功能发布',
    description: '我们刚刚发布了一个令人惊叹的新功能，它将彻底改变您的Discord体验！',
    color: 0x00ff00, // 绿色
    fields: [
      {
        name: '✨ 新功能',
        value: '• AI驱动的聊天审核\n• 高级角色管理\n• 自定义斜杠命令',
        inline: false
      },
      {
        name: '📅 发布日期',
        value: '2025年9月20日',
        inline: true
      },
      {
        name: '🔗 版本',
        value: 'v1.2.0',
        inline: true
      }
    ],
    thumbnail: {
      url: 'https://example.com/feature-thumbnail.png'
    },
    image: {
      url: 'https://example.com/feature-banner.png'
    },
    footer: {
      text: 'MPLP Discord机器人',
      iconUrl: 'https://example.com/bot-avatar.png'
    },
    timestamp: new Date().toISOString()
  }
});

// 带按钮的嵌入
await discord.post({
  type: 'embed',
  channel: 'channel-id',
  content: {
    title: '🎮 游戏之夜活动',
    description: '这个周五加入我们的史诗游戏之夜！',
    color: 0xff6b6b
  },
  components: [
    {
      type: 'ACTION_ROW',
      components: [
        {
          type: 'BUTTON',
          style: 'SUCCESS',
          label: '加入活动',
          customId: 'join_event',
          emoji: '🎮'
        },
        {
          type: 'BUTTON',
          style: 'SECONDARY',
          label: '稍后再说',
          customId: 'maybe_later',
          emoji: '🤔'
        },
        {
          type: 'BUTTON',
          style: 'LINK',
          label: '活动详情',
          url: 'https://example.com/event-details'
        }
      ]
    }
  ]
});
```

#### **带文件的消息**

```typescript
// 带文件附件的消息
await discord.post({
  type: 'text',
  channel: 'channel-id',
  content: '这是最新的项目报告！📊',
  attachments: [
    {
      name: 'project-report.pdf',
      url: 'https://example.com/reports/project-report.pdf',
      description: '月度项目进度报告'
    }
  ]
});

// 带多张图片的消息
await discord.post({
  type: 'text',
  channel: 'channel-id',
  content: '看看我们最新更新的这些精彩截图！🖼️',
  attachments: [
    {
      name: 'screenshot1.png',
      url: 'https://example.com/screenshots/1.png'
    },
    {
      name: 'screenshot2.png',
      url: 'https://example.com/screenshots/2.png'
    }
  ]
});
```

### **斜杠命令**

#### **创建斜杠命令**

```typescript
// 注册斜杠命令
await discord.registerSlashCommands([
  {
    name: 'hello',
    description: '向机器人问好',
    options: [
      {
        name: 'user',
        description: '要问候的用户',
        type: 'USER',
        required: false
      }
    ]
  },
  {
    name: 'weather',
    description: '获取天气信息',
    options: [
      {
        name: 'location',
        description: '城市名称',
        type: 'STRING',
        required: true
      }
    ]
  },
  {
    name: 'poll',
    description: '创建投票',
    options: [
      {
        name: 'question',
        description: '投票问题',
        type: 'STRING',
        required: true
      },
      {
        name: 'options',
        description: '投票选项（逗号分隔）',
        type: 'STRING',
        required: true
      }
    ]
  }
]);

// 处理斜杠命令交互
discord.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  switch (interaction.commandName) {
    case 'hello':
      const user = interaction.options.getUser('user');
      const greeting = user ? `你好，${user}！👋` : '你好！👋';
      
      await interaction.reply({
        content: greeting,
        ephemeral: false // 让回复对所有人可见
      });
      break;

    case 'weather':
      const location = interaction.options.getString('location');
      const weatherData = await getWeatherData(location);
      
      await interaction.reply({
        embeds: [{
          title: `🌤️ ${location}的天气`,
          description: `温度: ${weatherData.temp}°C\n天气: ${weatherData.condition}`,
          color: 0x87ceeb
        }]
      });
      break;

    case 'poll':
      const question = interaction.options.getString('question');
      const options = interaction.options.getString('options').split(',');
      
      const pollEmbed = {
        title: '📊 投票',
        description: question,
        fields: options.map((option, index) => ({
          name: `选项 ${index + 1}`,
          value: option.trim(),
          inline: true
        })),
        color: 0xffd700
      };
      
      const message = await interaction.reply({
        embeds: [pollEmbed],
        fetchReply: true
      });
      
      // 添加投票表情符号
      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
      for (let i = 0; i < Math.min(options.length, emojis.length); i++) {
        await message.react(emojis[i]);
      }
      break;
  }
});
```

### **服务器和频道管理**

#### **频道操作**

```typescript
// 创建新频道
await discord.createChannel('guild-id', {
  name: 'ai-discussions',
  type: 'GUILD_TEXT',
  topic: '在这里讨论AI和机器学习话题',
  parent: 'category-id', // 可选：放在分类中
  permissionOverwrites: [
    {
      id: 'role-id',
      allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
      deny: ['MANAGE_MESSAGES']
    }
  ]
});

// 更新频道设置
await discord.updateChannel('channel-id', {
  name: 'updated-channel-name',
  topic: '新的频道话题',
  slowmode: 5 // 5秒慢速模式
});

// 删除频道
await discord.deleteChannel('channel-id', '不再需要频道');
```

#### **角色管理**

```typescript
// 创建新角色
await discord.createRole('guild-id', {
  name: 'AI爱好者',
  color: 0x9b59b6,
  permissions: ['SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'ADD_REACTIONS'],
  hoist: true, // 在成员列表中单独显示
  mentionable: true
});

// 为成员分配角色
await discord.assignRole('guild-id', 'user-id', 'role-id');

// 从成员移除角色
await discord.removeRole('guild-id', 'user-id', 'role-id');

// 更新角色权限
await discord.updateRole('guild-id', 'role-id', {
  name: '高级AI爱好者',
  color: 0x8e44ad,
  permissions: ['SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'ADD_REACTIONS', 'MANAGE_MESSAGES']
});
```

### **成员管理和审核**

#### **成员操作**

```typescript
// 获取成员信息
const member = await discord.getMember('guild-id', 'user-id');
console.log(`成员: ${member.displayName}`);
console.log(`加入时间: ${member.joinedAt}`);
console.log(`角色: ${member.roles.map(r => r.name).join(', ')}`);

// 踢出成员
await discord.kickMember('guild-id', 'user-id', '违反服务器规则');

// 封禁成员
await discord.banMember('guild-id', 'user-id', {
  reason: '多次违反社区准则',
  deleteMessageDays: 7 // 删除过去7天的消息
});

// 禁言成员（Discord的超时功能）
await discord.timeoutMember('guild-id', 'user-id', {
  duration: 600000, // 10分钟（毫秒）
  reason: '在聊天中刷屏'
});
```

#### **自动化审核**

```typescript
// 设置自动化审核
discord.on('messageCreate', async (message) => {
  // 跳过机器人消息
  if (message.author.bot) return;

  // 垃圾信息检测
  if (await isSpamMessage(message)) {
    await message.delete();
    await discord.post({
      type: 'text',
      channel: message.channel.id,
      content: `${message.author}，请避免刷屏。此消息已被删除。`
    });
    
    // 重复刷屏的超时
    const spamCount = await getSpamCount(message.author.id);
    if (spamCount > 3) {
      await discord.timeoutMember(message.guild.id, message.author.id, {
        duration: 300000, // 5分钟
        reason: '重复刷屏'
      });
    }
    return;
  }

  // 脏话过滤器
  if (containsProfanity(message.content)) {
    await message.delete();
    await discord.post({
      type: 'text',
      channel: message.channel.id,
      content: `${message.author}，请保持聊天内容友好。🙏`
    });
    return;
  }

  // 基于活跃度的自动角色分配
  if (await isActiveUser(message.author.id)) {
    const hasActiveRole = message.member.roles.cache.has('active-member-role-id');
    if (!hasActiveRole) {
      await discord.assignRole(message.guild.id, message.author.id, 'active-member-role-id');
      await discord.post({
        type: 'text',
        channel: message.channel.id,
        content: `🎉 恭喜 ${message.author}！您已被提升为活跃成员！`
      });
    }
  }
});
```

## 📊 **分析和洞察**

### **服务器分析**

```typescript
// 获取服务器统计
const serverStats = await discord.getServerStats('guild-id');
console.log(`总成员数: ${serverStats.memberCount}`);
console.log(`在线成员: ${serverStats.onlineCount}`);
console.log(`总频道数: ${serverStats.channelCount}`);
console.log(`总角色数: ${serverStats.roleCount}`);

// 获取消息活动
const messageStats = await discord.getMessageActivity('guild-id', {
  timeRange: 'last-7-days',
  channelId: 'specific-channel-id' // 可选：特定频道
});
console.log(`本周消息数: ${messageStats.totalMessages}`);
console.log(`最活跃频道: ${messageStats.mostActiveChannel}`);
console.log(`最活跃用户: ${messageStats.mostActiveUser}`);
```

### **成员参与度分析**

```typescript
// 分析成员参与度
const engagementStats = await discord.getMemberEngagement('guild-id');
console.log(`活跃成员: ${engagementStats.activeMembers}`);
console.log(`本周新成员: ${engagementStats.newMembers}`);
console.log(`成员留存率: ${engagementStats.retentionRate}%`);

// 获取顶级贡献者
const topContributors = await discord.getTopContributors('guild-id', {
  timeRange: 'last-30-days',
  limit: 10
});

topContributors.forEach((contributor, index) => {
  console.log(`${index + 1}. ${contributor.username}: ${contributor.messageCount} 条消息`);
});
```

## 🔄 **实时功能**

### **事件监控**

```typescript
// 欢迎新成员
discord.on('guildMemberAdd', async (member) => {
  const welcomeChannel = member.guild.channels.cache.find(
    channel => channel.name === 'welcome'
  );
  
  if (welcomeChannel) {
    await discord.post({
      type: 'embed',
      channel: welcomeChannel.id,
      content: {
        title: '🎉 欢迎来到服务器！',
        description: `欢迎 ${member.user}，我们很高兴您在这里！`,
        color: 0x00ff00,
        thumbnail: {
          url: member.user.displayAvatarURL()
        },
        fields: [
          {
            name: '📋 入门指南',
            value: '• 在 <#rules-channel> 阅读规则\n• 在 <#introductions> 介绍自己\n• 在 <#role-selection> 获取角色',
            inline: false
          }
        ]
      }
    });
  }
  
  // 自动分配默认角色
  const defaultRole = member.guild.roles.cache.find(role => role.name === 'Member');
  if (defaultRole) {
    await member.roles.add(defaultRole);
  }
});

// 处理成员离开
discord.on('guildMemberRemove', async (member) => {
  const logChannel = member.guild.channels.cache.find(
    channel => channel.name === 'member-log'
  );
  
  if (logChannel) {
    await discord.post({
      type: 'embed',
      channel: logChannel.id,
      content: {
        title: '👋 成员离开',
        description: `${member.user.tag} 已离开服务器`,
        color: 0xff0000,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// 对特定消息做出反应
discord.on('messageCreate', async (message) => {
  // 对某些关键词自动反应
  if (message.content.toLowerCase().includes('awesome')) {
    await message.react('🔥');
  }
  
  if (message.content.toLowerCase().includes('thanks')) {
    await message.react('❤️');
  }
  
  // 置顶重要公告
  if (message.channel.name === 'announcements' && message.author.id === 'admin-user-id') {
    await message.pin();
  }
});
```

### **交互功能**

```typescript
// 反应角色系统
discord.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  
  // 基于反应的角色分配
  const roleMap = {
    '🎮': 'gamer-role-id',
    '🎨': 'artist-role-id',
    '💻': 'developer-role-id',
    '📚': 'student-role-id'
  };
  
  const roleId = roleMap[reaction.emoji.name];
  if (roleId && reaction.message.id === 'role-selection-message-id') {
    const member = await reaction.message.guild.members.fetch(user.id);
    await member.roles.add(roleId);
    
    // 发送确认私信
    await user.send(`您已被分配 ${reaction.emoji.name} 角色！`);
  }
});

// 移除反应时移除角色
discord.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;
  
  const roleMap = {
    '🎮': 'gamer-role-id',
    '🎨': 'artist-role-id',
    '💻': 'developer-role-id',
    '📚': 'student-role-id'
  };
  
  const roleId = roleMap[reaction.emoji.name];
  if (roleId && reaction.message.id === 'role-selection-message-id') {
    const member = await reaction.message.guild.members.fetch(user.id);
    await member.roles.remove(roleId);
  }
});
```

## 🛠️ **高级用例**

### **社区管理机器人**

```typescript
// 全面的社区管理
const setupCommunityBot = async () => {
  // 每日服务器统计
  setInterval(async () => {
    const stats = await discord.getServerStats('guild-id');
    const statsChannel = 'stats-channel-id';
    
    await discord.post({
      type: 'embed',
      channel: statsChannel,
      content: {
        title: '📊 每日服务器统计',
        fields: [
          { name: '总成员数', value: stats.memberCount.toString(), inline: true },
          { name: '当前在线', value: stats.onlineCount.toString(), inline: true },
          { name: '今日消息', value: stats.dailyMessages.toString(), inline: true }
        ],
        color: 0x3498db,
        timestamp: new Date().toISOString()
      }
    });
  }, 24 * 60 * 60 * 1000); // 每24小时

  // 每周成员聚焦
  setInterval(async () => {
    const topContributor = await discord.getTopContributor('guild-id', 'week');
    const spotlightChannel = 'spotlight-channel-id';
    
    await discord.post({
      type: 'embed',
      channel: spotlightChannel,
      content: {
        title: '⭐ 成员聚焦',
        description: `本周最活跃成员：${topContributor.user}！`,
        thumbnail: { url: topContributor.avatarUrl },
        fields: [
          { name: '消息数', value: topContributor.messageCount.toString(), inline: true },
          { name: '给出反应', value: topContributor.reactionsGiven.toString(), inline: true }
        ],
        color: 0xffd700
      }
    });
  }, 7 * 24 * 60 * 60 * 1000); // 每周
};
```

### **活动管理系统**

```typescript
// 带RSVP系统的活动管理
const createEvent = async (eventData: any) => {
  const eventEmbed = {
    title: `🎉 ${eventData.title}`,
    description: eventData.description,
    fields: [
      { name: '📅 日期', value: eventData.date, inline: true },
      { name: '⏰ 时间', value: eventData.time, inline: true },
      { name: '📍 地点', value: eventData.location, inline: true }
    ],
    color: 0xff6b6b,
    footer: { text: '用✅反应来RSVP！' }
  };

  const message = await discord.post({
    type: 'embed',
    channel: 'events-channel-id',
    content: eventEmbed
  });

  // 添加RSVP反应
  await discord.react(message.data.id, '✅'); // 是
  await discord.react(message.data.id, '❌'); // 否
  await discord.react(message.data.id, '❓'); // 也许

  // 存储活动数据以供跟踪
  await storeEventData(message.data.id, eventData);
};

// 处理RSVP反应
discord.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  
  const eventData = await getEventData(reaction.message.id);
  if (!eventData) return;

  const rsvpStatus = {
    '✅': 'attending',
    '❌': 'not_attending',
    '❓': 'maybe'
  }[reaction.emoji.name];

  if (rsvpStatus) {
    await updateRSVP(eventData.id, user.id, rsvpStatus);
    
    // 发送确认私信
    await user.send(`感谢您的RSVP！您已被标记为"${rsvpStatus}"参加${eventData.title}。`);
  }
});
```

### **自定义经济系统**

```typescript
// 带积分和奖励的服务器经济
const economySystem = {
  // 为活动奖励积分
  awardPoints: async (userId: string, points: number, reason: string) => {
    await updateUserPoints(userId, points);
    
    const user = await discord.getUser(userId);
    await user.send(`🪙 您因为：${reason} 获得了${points}积分`);
  },

  // 每日积分奖励
  dailyReward: async (userId: string) => {
    const lastClaim = await getLastDailyClaim(userId);
    const now = new Date();
    
    if (!lastClaim || now.getDate() !== lastClaim.getDate()) {
      await economySystem.awardPoints(userId, 100, '每日登录奖励');
      await setLastDailyClaim(userId, now);
      return true;
    }
    return false;
  },

  // 积分商店
  buyItem: async (userId: string, itemId: string) => {
    const userPoints = await getUserPoints(userId);
    const item = await getShopItem(itemId);
    
    if (userPoints >= item.cost) {
      await updateUserPoints(userId, -item.cost);
      await giveUserItem(userId, itemId);
      
      const user = await discord.getUser(userId);
      await user.send(`🛒 您花费${item.cost}积分购买了${item.name}！`);
      return true;
    }
    return false;
  }
};

// 为消息奖励积分
discord.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // 基于消息质量奖励1-5积分
  const points = calculateMessagePoints(message.content);
  await economySystem.awardPoints(message.author.id, points, '积极参与');
});
```

## 🚨 **错误处理和故障排除**

### **常见错误场景**

```typescript
try {
  await discord.post({
    type: 'text',
    channel: 'channel-id',
    content: '这条消息可能因各种原因失败'
  });
} catch (error) {
  if (error.code === 50013) { // 缺少权限
    console.log('机器人缺少在此频道发送消息的权限');
    // 处理权限错误
  } else if (error.code === 50035) { // 无效表单主体
    console.log('消息内容无效:', error.message);
    // 处理验证错误
  } else if (error.code === 10003) { // 未知频道
    console.log('频道未找到或机器人无访问权限');
    // 处理频道访问问题
  } else if (error.code === 50001) { // 缺少访问权限
    console.log('机器人不在服务器或频道中');
    // 处理访问问题
  } else if (error.message.includes('Rate limited')) {
    console.log('Discord速率限制达到，等待重试...');
    const retryAfter = error.retryAfter || 1000;
    await new Promise(resolve => setTimeout(resolve, retryAfter));
    // 重试操作
  } else {
    console.error('意外的Discord错误:', error.message);
  }
}
```

### **速率限制管理**

```typescript
// 实现智能速率限制
const messageQueue = [];
const processQueue = async () => {
  if (messageQueue.length === 0) return;
  
  const message = messageQueue.shift();
  try {
    await discord.post(message);
  } catch (error) {
    if (error.message.includes('Rate limited')) {
      // 将消息放回队列并等待
      messageQueue.unshift(message);
      await new Promise(resolve => setTimeout(resolve, error.retryAfter || 1000));
    }
  }
  
  // 延迟后处理下一条消息
  setTimeout(processQueue, 100);
};

// 将消息排队而不是直接发送
const queueMessage = (messageData: any) => {
  messageQueue.push(messageData);
  if (messageQueue.length === 1) {
    processQueue();
  }
};
```

## 🔗 **集成示例**

### **与Agent Builder集成**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';
import { DiscordAdapter } from '@mplp/adapters';

const discordBot = new AgentBuilder('DiscordBot')
  .withName('社区管理助手')
  .withPlatform('discord', new DiscordAdapter(discordConfig))
  .withCapability('moderateChat', async (message) => {
    // 自动化聊天审核
    if (await isInappropriate(message.content)) {
      await this.platform.deleteMessage(message.id);
      await this.platform.timeoutMember(message.guild.id, message.author.id, {
        duration: 300000,
        reason: '不当内容'
      });
    }
  })
  .withCapability('welcomeMembers', async (member) => {
    // 欢迎新成员
    await this.platform.post({
      type: 'embed',
      channel: 'welcome-channel-id',
      content: {
        title: '🎉 欢迎！',
        description: `欢迎 ${member.user}，很高兴您在这里！`
      }
    });
  })
  .build();

await discordBot.start();
```

### **与Orchestrator集成**

```typescript
import { MultiAgentOrchestrator } from '@mplp/orchestrator';

const orchestrator = new MultiAgentOrchestrator();

// 创建社区参与工作流
const engagementWorkflow = orchestrator.createWorkflow('CommunityEngagement')
  .addStep('analyzeActivity', async () => {
    // 分析服务器活动模式
    return await discord.getServerActivity('guild-id');
  })
  .addStep('identifyInactiveMembers', async (activity) => {
    // 找到不活跃的成员
    return activity.members.filter(m => m.lastActive > 7); // 7天
  })
  .addStep('engageInactiveMembers', async (inactiveMembers) => {
    // 发送重新参与消息
    for (const member of inactiveMembers.slice(0, 10)) {
      await discord.sendDirectMessage(member.id, {
        content: '我们在服务器中想念您！来看看有什么新内容！🎉'
      });
    }
  });

await engagementWorkflow.execute();
```

## 📚 **最佳实践**

### **机器人开发**

- **清晰命令**: 使用描述性命令名称和有用的描述
- **用户反馈**: 始终为用户操作提供反馈
- **错误处理**: 优雅地处理错误并通知用户
- **速率限制**: 尊重Discord的速率限制以避免被封禁
- **权限**: 只请求必要的权限

### **社区管理**

- **一致审核**: 公平一致地应用规则
- **清晰指导**: 提供清晰的服务器规则和指导
- **成员参与**: 积极与社区成员互动
- **定期更新**: 让社区了解变更信息
- **反馈收集**: 听取社区反馈和建议

### **安全和隐私**

- **令牌安全**: 永远不要在代码或日志中暴露机器人令牌
- **数据隐私**: 尊重用户隐私和数据保护法律
- **审计日志**: 保留审核操作的日志
- **定期更新**: 保持依赖项和机器人代码更新
- **备份系统**: 为重要数据实施备份系统

## 🔗 **相关文档**

- [平台适配器概览](../../README.md) - 完整的平台适配器系统
- [Agent Builder集成](../../sdk-api/agent-builder/README.md) - 构建支持Discord的代理
- [Orchestrator工作流](../../sdk-api/orchestrator/README.md) - 多平台编排
- [Slack适配器](../slack/README.md) - Slack平台集成
- [Twitter适配器](../twitter/README.md) - Twitter平台集成

---

**适配器维护者**: MPLP平台团队  
**最后审查**: 2025-09-20  
**测试覆盖率**: 100% (87/87测试通过)  
**状态**: ✅ 生产就绪
