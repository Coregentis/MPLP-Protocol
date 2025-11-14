# Discord Platform Adapter - Complete Usage Guide

> **🌐 Language Navigation**: [English](README.md) | [中文](../../../zh-CN/platform-adapters/discord/README.md)


> **Platform**: Discord  
> **Adapter**: @mplp/adapters - DiscordAdapter  
> **Version**: v1.1.0  
> **Last Updated**: 2025-09-20  
> **Status**: ✅ Production Ready  

## 📚 **Overview**

The Discord Platform Adapter provides comprehensive integration with Discord's communication platform, enabling intelligent agents to interact with Discord servers, manage channels, send messages, handle slash commands, and engage with community members. It uses Discord.js v14 with enterprise-grade features for both bot and user applications.

### **🎯 Key Features**

- **💬 Message Management**: Send, edit, delete messages with rich embeds and attachments
- **🏰 Server Management**: Manage guilds, channels, roles, and permissions
- **⚡ Slash Commands**: Create and handle modern Discord slash commands
- **🎭 Role Management**: Assign roles, manage permissions, moderation features
- **🔐 Bot Authentication**: Discord Bot Token authentication with OAuth2 support
- **⚡ Rate Limiting**: Intelligent Discord API rate limit management
- **🔄 Real-time Events**: Gateway events for real-time Discord interactions
- **🛡️ Error Handling**: Comprehensive error handling and retry mechanisms

### **📦 Installation**

```bash
# Install the adapters package
npm install @mplp/adapters

# Or install globally for CLI usage
npm install -g @mplp/adapters
```

## 🚀 **Quick Start**

### **Basic Setup**

```typescript
import { DiscordAdapter } from '@mplp/adapters';

// Create Discord adapter with Bot Token
const discord = new DiscordAdapter({
  platform: 'discord',
  name: 'My Discord Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'bot',
    credentials: {
      token: process.env.DISCORD_BOT_TOKEN! // Discord Bot Token
    }
  }
});

// Initialize and authenticate
await discord.initialize();
await discord.authenticate();

console.log('✅ Discord adapter ready!');
```

### **Send Your First Message**

```typescript
// Send a message to a channel
const result = await discord.post({
  type: 'text',
  channel: 'channel-id-here',
  content: 'Hello Discord! 🤖 This is my first message from MPLP!'
});

console.log(`Message sent: ${result.data.id}`);
```

## 🔧 **Configuration**

### **Bot Authentication**

#### **Basic Bot Configuration**

```typescript
const discordConfig = {
  platform: 'discord',
  name: 'Discord Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'bot',
    credentials: {
      token: 'your-discord-bot-token-here'
    }
  },
  intents: [
    'GUILDS',              // Access to guild information
    'GUILD_MESSAGES',      // Read messages in guilds
    'MESSAGE_CONTENT',     // Access to message content
    'GUILD_MEMBERS',       // Access to guild member information
    'GUILD_MESSAGE_REACTIONS' // React to messages
  ],
  rateLimits: {
    messages: { requests: 50, window: 60000 }, // 50 messages per minute
    commands: { requests: 200, window: 60000 } // 200 commands per minute
  }
};
```

#### **Advanced Bot Configuration**

```typescript
const advancedConfig = {
  platform: 'discord',
  name: 'Advanced Discord Bot',
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

## 📝 **Core Operations**

### **Message Management**

#### **Text Messages**

```typescript
// Simple text message
await discord.post({
  type: 'text',
  channel: 'channel-id',
  content: 'Hello everyone! 👋'
});

// Message with mentions
await discord.post({
  type: 'text',
  channel: 'channel-id',
  content: 'Welcome to the server, <@user-id>! Please read <#rules-channel-id> 📋',
  metadata: {
    mentions: ['user-id'],
    channelMentions: ['rules-channel-id']
  }
});

// Message with custom emoji
await discord.post({
  type: 'text',
  channel: 'channel-id',
  content: 'Great work on the project! <:custom_emoji:emoji-id> 🎉'
});
```

#### **Rich Embed Messages**

```typescript
// Rich embed message
await discord.post({
  type: 'embed',
  channel: 'channel-id',
  content: {
    title: '🚀 New Feature Release',
    description: 'We\'ve just released an amazing new feature that will revolutionize your Discord experience!',
    color: 0x00ff00, // Green color
    fields: [
      {
        name: '✨ What\'s New',
        value: '• AI-powered chat moderation\n• Advanced role management\n• Custom slash commands',
        inline: false
      },
      {
        name: '📅 Release Date',
        value: 'September 20, 2025',
        inline: true
      },
      {
        name: '🔗 Version',
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
      text: 'MPLP Discord Bot',
      iconUrl: 'https://example.com/bot-avatar.png'
    },
    timestamp: new Date().toISOString()
  }
});

// Embed with buttons
await discord.post({
  type: 'embed',
  channel: 'channel-id',
  content: {
    title: '🎮 Game Night Event',
    description: 'Join us for an epic game night this Friday!',
    color: 0xff6b6b
  },
  components: [
    {
      type: 'ACTION_ROW',
      components: [
        {
          type: 'BUTTON',
          style: 'SUCCESS',
          label: 'Join Event',
          customId: 'join_event',
          emoji: '🎮'
        },
        {
          type: 'BUTTON',
          style: 'SECONDARY',
          label: 'Maybe Later',
          customId: 'maybe_later',
          emoji: '🤔'
        },
        {
          type: 'BUTTON',
          style: 'LINK',
          label: 'Event Details',
          url: 'https://example.com/event-details'
        }
      ]
    }
  ]
});
```

#### **Messages with Files**

```typescript
// Message with file attachment
await discord.post({
  type: 'text',
  channel: 'channel-id',
  content: 'Here\'s the latest project report! 📊',
  attachments: [
    {
      name: 'project-report.pdf',
      url: 'https://example.com/reports/project-report.pdf',
      description: 'Monthly project progress report'
    }
  ]
});

// Message with multiple images
await discord.post({
  type: 'text',
  channel: 'channel-id',
  content: 'Check out these amazing screenshots from our latest update! 🖼️',
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

### **Slash Commands**

#### **Creating Slash Commands**

```typescript
// Register slash commands
await discord.registerSlashCommands([
  {
    name: 'hello',
    description: 'Say hello to the bot',
    options: [
      {
        name: 'user',
        description: 'User to greet',
        type: 'USER',
        required: false
      }
    ]
  },
  {
    name: 'weather',
    description: 'Get weather information',
    options: [
      {
        name: 'location',
        description: 'City name',
        type: 'STRING',
        required: true
      }
    ]
  },
  {
    name: 'poll',
    description: 'Create a poll',
    options: [
      {
        name: 'question',
        description: 'Poll question',
        type: 'STRING',
        required: true
      },
      {
        name: 'options',
        description: 'Poll options (comma-separated)',
        type: 'STRING',
        required: true
      }
    ]
  }
]);

// Handle slash command interactions
discord.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  switch (interaction.commandName) {
    case 'hello':
      const user = interaction.options.getUser('user');
      const greeting = user ? `Hello, ${user}! 👋` : 'Hello there! 👋';
      
      await interaction.reply({
        content: greeting,
        ephemeral: false // Make reply visible to everyone
      });
      break;

    case 'weather':
      const location = interaction.options.getString('location');
      const weatherData = await getWeatherData(location);
      
      await interaction.reply({
        embeds: [{
          title: `🌤️ Weather in ${location}`,
          description: `Temperature: ${weatherData.temp}°C\nCondition: ${weatherData.condition}`,
          color: 0x87ceeb
        }]
      });
      break;

    case 'poll':
      const question = interaction.options.getString('question');
      const options = interaction.options.getString('options').split(',');
      
      const pollEmbed = {
        title: '📊 Poll',
        description: question,
        fields: options.map((option, index) => ({
          name: `Option ${index + 1}`,
          value: option.trim(),
          inline: true
        })),
        color: 0xffd700
      };
      
      const message = await interaction.reply({
        embeds: [pollEmbed],
        fetchReply: true
      });
      
      // Add reaction emojis for voting
      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
      for (let i = 0; i < Math.min(options.length, emojis.length); i++) {
        await message.react(emojis[i]);
      }
      break;
  }
});
```

### **Server and Channel Management**

#### **Channel Operations**

```typescript
// Create a new channel
await discord.createChannel('guild-id', {
  name: 'ai-discussions',
  type: 'GUILD_TEXT',
  topic: 'Discuss AI and machine learning topics here',
  parent: 'category-id', // Optional: place in category
  permissionOverwrites: [
    {
      id: 'role-id',
      allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
      deny: ['MANAGE_MESSAGES']
    }
  ]
});

// Update channel settings
await discord.updateChannel('channel-id', {
  name: 'updated-channel-name',
  topic: 'New channel topic',
  slowmode: 5 // 5 second slowmode
});

// Delete a channel
await discord.deleteChannel('channel-id', 'Channel no longer needed');
```

#### **Role Management**

```typescript
// Create a new role
await discord.createRole('guild-id', {
  name: 'AI Enthusiast',
  color: 0x9b59b6,
  permissions: ['SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'ADD_REACTIONS'],
  hoist: true, // Display separately in member list
  mentionable: true
});

// Assign role to member
await discord.assignRole('guild-id', 'user-id', 'role-id');

// Remove role from member
await discord.removeRole('guild-id', 'user-id', 'role-id');

// Update role permissions
await discord.updateRole('guild-id', 'role-id', {
  name: 'Senior AI Enthusiast',
  color: 0x8e44ad,
  permissions: ['SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'ADD_REACTIONS', 'MANAGE_MESSAGES']
});
```

### **Member Management and Moderation**

#### **Member Operations**

```typescript
// Get member information
const member = await discord.getMember('guild-id', 'user-id');
console.log(`Member: ${member.displayName}`);
console.log(`Joined: ${member.joinedAt}`);
console.log(`Roles: ${member.roles.map(r => r.name).join(', ')}`);

// Kick a member
await discord.kickMember('guild-id', 'user-id', 'Violation of server rules');

// Ban a member
await discord.banMember('guild-id', 'user-id', {
  reason: 'Repeated violations of community guidelines',
  deleteMessageDays: 7 // Delete messages from last 7 days
});

// Timeout a member (Discord's timeout feature)
await discord.timeoutMember('guild-id', 'user-id', {
  duration: 600000, // 10 minutes in milliseconds
  reason: 'Spamming in chat'
});
```

#### **Automated Moderation**

```typescript
// Set up automated moderation
discord.on('messageCreate', async (message) => {
  // Skip bot messages
  if (message.author.bot) return;

  // Spam detection
  if (await isSpamMessage(message)) {
    await message.delete();
    await discord.post({
      type: 'text',
      channel: message.channel.id,
      content: `${message.author}, please avoid spamming. This message has been removed.`
    });
    
    // Timeout for repeated spam
    const spamCount = await getSpamCount(message.author.id);
    if (spamCount > 3) {
      await discord.timeoutMember(message.guild.id, message.author.id, {
        duration: 300000, // 5 minutes
        reason: 'Repeated spamming'
      });
    }
    return;
  }

  // Profanity filter
  if (containsProfanity(message.content)) {
    await message.delete();
    await discord.post({
      type: 'text',
      channel: message.channel.id,
      content: `${message.author}, please keep the chat family-friendly. 🙏`
    });
    return;
  }

  // Auto-role assignment based on activity
  if (await isActiveUser(message.author.id)) {
    const hasActiveRole = message.member.roles.cache.has('active-member-role-id');
    if (!hasActiveRole) {
      await discord.assignRole(message.guild.id, message.author.id, 'active-member-role-id');
      await discord.post({
        type: 'text',
        channel: message.channel.id,
        content: `🎉 Congratulations ${message.author}! You've been promoted to Active Member!`
      });
    }
  }
});
```

## 📊 **Analytics and Insights**

### **Server Analytics**

```typescript
// Get server statistics
const serverStats = await discord.getServerStats('guild-id');
console.log(`Total members: ${serverStats.memberCount}`);
console.log(`Online members: ${serverStats.onlineCount}`);
console.log(`Total channels: ${serverStats.channelCount}`);
console.log(`Total roles: ${serverStats.roleCount}`);

// Get message activity
const messageStats = await discord.getMessageActivity('guild-id', {
  timeRange: 'last-7-days',
  channelId: 'specific-channel-id' // Optional: specific channel
});
console.log(`Messages this week: ${messageStats.totalMessages}`);
console.log(`Most active channel: ${messageStats.mostActiveChannel}`);
console.log(`Most active user: ${messageStats.mostActiveUser}`);
```

### **Member Engagement Analytics**

```typescript
// Analyze member engagement
const engagementStats = await discord.getMemberEngagement('guild-id');
console.log(`Active members: ${engagementStats.activeMembers}`);
console.log(`New members this week: ${engagementStats.newMembers}`);
console.log(`Member retention rate: ${engagementStats.retentionRate}%`);

// Get top contributors
const topContributors = await discord.getTopContributors('guild-id', {
  timeRange: 'last-30-days',
  limit: 10
});

topContributors.forEach((contributor, index) => {
  console.log(`${index + 1}. ${contributor.username}: ${contributor.messageCount} messages`);
});
```

## 🔄 **Real-time Features**

### **Event Monitoring**

```typescript
// Welcome new members
discord.on('guildMemberAdd', async (member) => {
  const welcomeChannel = member.guild.channels.cache.find(
    channel => channel.name === 'welcome'
  );
  
  if (welcomeChannel) {
    await discord.post({
      type: 'embed',
      channel: welcomeChannel.id,
      content: {
        title: '🎉 Welcome to the Server!',
        description: `Welcome ${member.user}, we're glad to have you here!`,
        color: 0x00ff00,
        thumbnail: {
          url: member.user.displayAvatarURL()
        },
        fields: [
          {
            name: '📋 Getting Started',
            value: '• Read the rules in <#rules-channel>\n• Introduce yourself in <#introductions>\n• Get roles in <#role-selection>',
            inline: false
          }
        ]
      }
    });
  }
  
  // Auto-assign default role
  const defaultRole = member.guild.roles.cache.find(role => role.name === 'Member');
  if (defaultRole) {
    await member.roles.add(defaultRole);
  }
});

// Handle member leaving
discord.on('guildMemberRemove', async (member) => {
  const logChannel = member.guild.channels.cache.find(
    channel => channel.name === 'member-log'
  );
  
  if (logChannel) {
    await discord.post({
      type: 'embed',
      channel: logChannel.id,
      content: {
        title: '👋 Member Left',
        description: `${member.user.tag} has left the server`,
        color: 0xff0000,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// React to specific messages
discord.on('messageCreate', async (message) => {
  // Auto-react to certain keywords
  if (message.content.toLowerCase().includes('awesome')) {
    await message.react('🔥');
  }
  
  if (message.content.toLowerCase().includes('thanks')) {
    await message.react('❤️');
  }
  
  // Pin important announcements
  if (message.channel.name === 'announcements' && message.author.id === 'admin-user-id') {
    await message.pin();
  }
});
```

### **Interactive Features**

```typescript
// Reaction role system
discord.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  
  // Role assignment based on reactions
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
    
    // Send confirmation DM
    await user.send(`You've been assigned the ${reaction.emoji.name} role!`);
  }
});

// Remove role when reaction is removed
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

## 🛠️ **Advanced Use Cases**

### **Community Management Bot**

```typescript
// Comprehensive community management
const setupCommunityBot = async () => {
  // Daily server statistics
  setInterval(async () => {
    const stats = await discord.getServerStats('guild-id');
    const statsChannel = 'stats-channel-id';
    
    await discord.post({
      type: 'embed',
      channel: statsChannel,
      content: {
        title: '📊 Daily Server Stats',
        fields: [
          { name: 'Total Members', value: stats.memberCount.toString(), inline: true },
          { name: 'Online Now', value: stats.onlineCount.toString(), inline: true },
          { name: 'Messages Today', value: stats.dailyMessages.toString(), inline: true }
        ],
        color: 0x3498db,
        timestamp: new Date().toISOString()
      }
    });
  }, 24 * 60 * 60 * 1000); // Every 24 hours

  // Weekly member spotlight
  setInterval(async () => {
    const topContributor = await discord.getTopContributor('guild-id', 'week');
    const spotlightChannel = 'spotlight-channel-id';
    
    await discord.post({
      type: 'embed',
      channel: spotlightChannel,
      content: {
        title: '⭐ Member Spotlight',
        description: `This week's most active member: ${topContributor.user}!`,
        thumbnail: { url: topContributor.avatarUrl },
        fields: [
          { name: 'Messages', value: topContributor.messageCount.toString(), inline: true },
          { name: 'Reactions Given', value: topContributor.reactionsGiven.toString(), inline: true }
        ],
        color: 0xffd700
      }
    });
  }, 7 * 24 * 60 * 60 * 1000); // Every week
};
```

### **Event Management System**

```typescript
// Event management with RSVP system
const createEvent = async (eventData: any) => {
  const eventEmbed = {
    title: `🎉 ${eventData.title}`,
    description: eventData.description,
    fields: [
      { name: '📅 Date', value: eventData.date, inline: true },
      { name: '⏰ Time', value: eventData.time, inline: true },
      { name: '📍 Location', value: eventData.location, inline: true }
    ],
    color: 0xff6b6b,
    footer: { text: 'React with ✅ to RSVP!' }
  };

  const message = await discord.post({
    type: 'embed',
    channel: 'events-channel-id',
    content: eventEmbed
  });

  // Add RSVP reactions
  await discord.react(message.data.id, '✅'); // Yes
  await discord.react(message.data.id, '❌'); // No
  await discord.react(message.data.id, '❓'); // Maybe

  // Store event data for tracking
  await storeEventData(message.data.id, eventData);
};

// Handle RSVP reactions
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
    
    // Send confirmation DM
    await user.send(`Thanks for your RSVP! You're marked as "${rsvpStatus}" for ${eventData.title}.`);
  }
});
```

### **Custom Economy System**

```typescript
// Server economy with points and rewards
const economySystem = {
  // Award points for activity
  awardPoints: async (userId: string, points: number, reason: string) => {
    await updateUserPoints(userId, points);
    
    const user = await discord.getUser(userId);
    await user.send(`🪙 You earned ${points} points for: ${reason}`);
  },

  // Daily point rewards
  dailyReward: async (userId: string) => {
    const lastClaim = await getLastDailyClaim(userId);
    const now = new Date();
    
    if (!lastClaim || now.getDate() !== lastClaim.getDate()) {
      await economySystem.awardPoints(userId, 100, 'Daily login bonus');
      await setLastDailyClaim(userId, now);
      return true;
    }
    return false;
  },

  // Point shop
  buyItem: async (userId: string, itemId: string) => {
    const userPoints = await getUserPoints(userId);
    const item = await getShopItem(itemId);
    
    if (userPoints >= item.cost) {
      await updateUserPoints(userId, -item.cost);
      await giveUserItem(userId, itemId);
      
      const user = await discord.getUser(userId);
      await user.send(`🛒 You purchased ${item.name} for ${item.cost} points!`);
      return true;
    }
    return false;
  }
};

// Award points for messages
discord.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // Award 1-5 points based on message quality
  const points = calculateMessagePoints(message.content);
  await economySystem.awardPoints(message.author.id, points, 'Active participation');
});
```

## 🚨 **Error Handling and Troubleshooting**

### **Common Error Scenarios**

```typescript
try {
  await discord.post({
    type: 'text',
    channel: 'channel-id',
    content: 'This message might fail for various reasons'
  });
} catch (error) {
  if (error.code === 50013) { // Missing Permissions
    console.log('Bot lacks permissions to send messages in this channel');
    // Handle permission errors
  } else if (error.code === 50035) { // Invalid Form Body
    console.log('Message content is invalid:', error.message);
    // Handle validation errors
  } else if (error.code === 10003) { // Unknown Channel
    console.log('Channel not found or bot has no access');
    // Handle channel access issues
  } else if (error.code === 50001) { // Missing Access
    console.log('Bot is not in the server or channel');
    // Handle access issues
  } else if (error.message.includes('Rate limited')) {
    console.log('Discord rate limit hit, waiting before retry...');
    const retryAfter = error.retryAfter || 1000;
    await new Promise(resolve => setTimeout(resolve, retryAfter));
    // Retry the operation
  } else {
    console.error('Unexpected Discord error:', error.message);
  }
}
```

### **Rate Limit Management**

```typescript
// Implement smart rate limiting
const messageQueue = [];
const processQueue = async () => {
  if (messageQueue.length === 0) return;
  
  const message = messageQueue.shift();
  try {
    await discord.post(message);
  } catch (error) {
    if (error.message.includes('Rate limited')) {
      // Put message back in queue and wait
      messageQueue.unshift(message);
      await new Promise(resolve => setTimeout(resolve, error.retryAfter || 1000));
    }
  }
  
  // Process next message after delay
  setTimeout(processQueue, 100);
};

// Queue messages instead of sending directly
const queueMessage = (messageData: any) => {
  messageQueue.push(messageData);
  if (messageQueue.length === 1) {
    processQueue();
  }
};
```

## 🔗 **Integration Examples**

### **With Agent Builder**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';
import { DiscordAdapter } from '@mplp/adapters';

const discordBot = new AgentBuilder('DiscordBot')
  .withName('Community Management Assistant')
  .withPlatform('discord', new DiscordAdapter(discordConfig))
  .withCapability('moderateChat', async (message) => {
    // Automated chat moderation
    if (await isInappropriate(message.content)) {
      await this.platform.deleteMessage(message.id);
      await this.platform.timeoutMember(message.guild.id, message.author.id, {
        duration: 300000,
        reason: 'Inappropriate content'
      });
    }
  })
  .withCapability('welcomeMembers', async (member) => {
    // Welcome new members
    await this.platform.post({
      type: 'embed',
      channel: 'welcome-channel-id',
      content: {
        title: '🎉 Welcome!',
        description: `Welcome ${member.user}, glad to have you here!`
      }
    });
  })
  .build();

await discordBot.start();
```

### **With Orchestrator**

```typescript
import { MultiAgentOrchestrator } from '@mplp/orchestrator';

const orchestrator = new MultiAgentOrchestrator();

// Create community engagement workflow
const engagementWorkflow = orchestrator.createWorkflow('CommunityEngagement')
  .addStep('analyzeActivity', async () => {
    // Analyze server activity patterns
    return await discord.getServerActivity('guild-id');
  })
  .addStep('identifyInactiveMembers', async (activity) => {
    // Find members who haven't been active
    return activity.members.filter(m => m.lastActive > 7); // 7 days
  })
  .addStep('engageInactiveMembers', async (inactiveMembers) => {
    // Send re-engagement messages
    for (const member of inactiveMembers.slice(0, 10)) {
      await discord.sendDirectMessage(member.id, {
        content: 'We miss you in the server! Come check out what\'s new! 🎉'
      });
    }
  });

await engagementWorkflow.execute();
```

## 📚 **Best Practices**

### **Bot Development**

- **Clear Commands**: Use descriptive command names and helpful descriptions
- **User Feedback**: Always provide feedback for user actions
- **Error Handling**: Gracefully handle errors and inform users
- **Rate Limiting**: Respect Discord's rate limits to avoid being banned
- **Permissions**: Request only necessary permissions

### **Community Management**

- **Consistent Moderation**: Apply rules fairly and consistently
- **Clear Guidelines**: Provide clear server rules and guidelines
- **Member Engagement**: Actively engage with community members
- **Regular Updates**: Keep the community informed about changes
- **Feedback Collection**: Listen to community feedback and suggestions

### **Security and Privacy**

- **Token Security**: Never expose bot tokens in code or logs
- **Data Privacy**: Respect user privacy and data protection laws
- **Audit Logs**: Keep logs of moderation actions
- **Regular Updates**: Keep dependencies and bot code updated
- **Backup Systems**: Implement backup systems for important data

## 🔗 **Related Documentation**

- [Platform Adapters Overview](../../README.md) - Complete platform adapter system
- [Agent Builder Integration](../../sdk-api/agent-builder/README.md) - Building Discord-enabled agents
- [Orchestrator Workflows](../../sdk-api/orchestrator/README.md) - Multi-platform orchestration
- [Slack Adapter](../slack/README.md) - Slack platform integration
- [Twitter Adapter](../twitter/README.md) - Twitter platform integration

---

**Adapter Maintainer**: MPLP Platform Team  
**Last Review**: 2025-09-20  
**Test Coverage**: 100% (87/87 tests passing)  
**Status**: ✅ Production Ready
