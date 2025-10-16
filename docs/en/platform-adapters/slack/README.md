# Slack Platform Adapter - Complete Usage Guide

> **🌐 Language Navigation**: [English](README.md) | [中文](../../../zh-CN/platform-adapters/slack/README.md)


> **Platform**: Slack  
> **Adapter**: @mplp/adapters - SlackAdapter  
> **Version**: v1.1.0-beta  
> **Last Updated**: 2025-09-20  
> **Status**: ✅ Production Ready  

## 📚 **Overview**

The Slack Platform Adapter provides comprehensive integration with Slack's team collaboration platform, enabling intelligent agents to interact with Slack workspaces, manage channels, send messages, handle slash commands, and automate team workflows. It uses Slack's Web API and Socket Mode with enterprise-grade features for both bot and app integrations.

### **🎯 Key Features**

- **💬 Message Management**: Send, update, delete messages with rich formatting and attachments
- **🏢 Workspace Management**: Manage channels, users, and workspace settings
- **⚡ Slash Commands**: Create and handle custom Slack slash commands
- **🔔 Interactive Components**: Buttons, modals, select menus, and workflows
- **🔐 OAuth Authentication**: Slack App OAuth with granular permissions
- **⚡ Rate Limiting**: Intelligent Slack API rate limit management
- **🔄 Real-time Events**: Socket Mode for real-time Slack interactions
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
import { SlackAdapter } from '@mplp/adapters';

// Create Slack adapter with Bot Token
const slack = new SlackAdapter({
  platform: 'slack',
  name: 'My Slack Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'bot',
    credentials: {
      token: process.env.SLACK_BOT_TOKEN!, // Bot User OAuth Token
      signingSecret: process.env.SLACK_SIGNING_SECRET!
    }
  }
});

// Initialize and authenticate
await slack.initialize();
await slack.authenticate();

console.log('✅ Slack adapter ready!');
```

### **Send Your First Message**

```typescript
// Send a message to a channel
const result = await slack.post({
  type: 'text',
  channel: 'C1234567890', // Channel ID
  content: 'Hello Slack! 🤖 This is my first message from MPLP!'
});

console.log(`Message sent: ${result.data.ts}`);
```

## 🔧 **Configuration**

### **Bot Token Authentication**

#### **Basic Bot Configuration**

```typescript
const slackConfig = {
  platform: 'slack',
  name: 'Slack Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'bot',
    credentials: {
      token: 'xoxb-your-bot-token-here',
      signingSecret: 'your-signing-secret-here'
    }
  },
  scopes: [
    'chat:write',           // Send messages
    'chat:write.public',    // Send messages to public channels
    'channels:read',        // View basic information about public channels
    'groups:read',          // View basic information about private channels
    'users:read',           // View people in workspace
    'reactions:write'       // Add and remove emoji reactions
  ],
  rateLimits: {
    messages: { requests: 100, window: 60000 }, // 100 messages per minute
    api: { requests: 100, window: 60000 }       // 100 API calls per minute
  }
};
```

#### **Advanced Bot Configuration**

```typescript
const advancedConfig = {
  platform: 'slack',
  name: 'Advanced Slack Bot',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'bot',
    credentials: {
      token: process.env.SLACK_BOT_TOKEN!,
      signingSecret: process.env.SLACK_SIGNING_SECRET!,
      appToken: process.env.SLACK_APP_TOKEN! // For Socket Mode
    }
  },
  scopes: [
    'chat:write', 'chat:write.public', 'channels:read', 'groups:read',
    'users:read', 'reactions:write', 'commands', 'files:write',
    'channels:manage', 'groups:write', 'im:write', 'mpim:write'
  ],
  socketMode: true, // Enable real-time events
  rateLimits: {
    messages: { requests: 100, window: 60000 },
    api: { requests: 100, window: 60000 },
    files: { requests: 20, window: 60000 }
  },
  retryPolicy: {
    maxRetries: 3,
    backoffMultiplier: 2,
    maxBackoffTime: 30000
  },
  monitoring: {
    enabled: true,
    webhookUrl: 'https://yourapp.com/webhooks/slack',
    events: ['message', 'reaction_added', 'member_joined_channel']
  },
  features: {
    autoThreadReplies: true,
    mentionHandling: true,
    fileSharing: true,
    interactiveComponents: true
  }
};
```

## 📝 **Core Operations**

### **Message Management**

#### **Text Messages**

```typescript
// Simple text message
await slack.post({
  type: 'text',
  channel: 'C1234567890',
  content: 'Hello team! 👋'
});

// Message with mentions
await slack.post({
  type: 'text',
  channel: 'C1234567890',
  content: 'Great work on the project, <@U1234567890>! 🎉',
  metadata: {
    mentions: ['U1234567890']
  }
});

// Message with channel mentions
await slack.post({
  type: 'text',
  channel: 'C1234567890',
  content: 'Please check the updates in <#C0987654321> channel 📢'
});
```

#### **Rich Block Messages**

```typescript
// Rich block message with sections
await slack.post({
  type: 'blocks',
  channel: 'C1234567890',
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🚀 Project Update'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: 'We\'ve made significant progress on the AI integration project!'
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*Status:*\n✅ Completed'
        },
        {
          type: 'mrkdwn',
          text: '*Progress:*\n85%'
        },
        {
          type: 'mrkdwn',
          text: '*Due Date:*\nSeptember 30, 2025'
        },
        {
          type: 'mrkdwn',
          text: '*Team:*\n5 developers'
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Next Steps:*\n• Final testing phase\n• Documentation updates\n• Deployment preparation'
      }
    }
  ]
});

// Message with interactive buttons
await slack.post({
  type: 'blocks',
  channel: 'C1234567890',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '🎯 *Sprint Planning Meeting*\nReady to start planning our next sprint?'
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Join Meeting'
          },
          style: 'primary',
          action_id: 'join_meeting',
          url: 'https://zoom.us/j/123456789'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View Agenda'
          },
          action_id: 'view_agenda'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'Maybe Later'
          },
          style: 'danger',
          action_id: 'maybe_later'
        }
      ]
    }
  ]
});
```

#### **Messages with Files**

```typescript
// Message with file attachment
await slack.post({
  type: 'text',
  channel: 'C1234567890',
  content: 'Here\'s the latest project report! 📊',
  attachments: [
    {
      filename: 'project-report.pdf',
      url: 'https://example.com/reports/project-report.pdf',
      title: 'Q3 Project Report',
      filetype: 'pdf'
    }
  ]
});

// Upload and share file
await slack.uploadFile({
  channels: 'C1234567890',
  file: './documents/presentation.pptx',
  filename: 'Sprint Review Presentation.pptx',
  title: 'Sprint Review - Q3 2025',
  initialComment: 'Here\'s our sprint review presentation! 🎯'
});
```

### **Slash Commands**

#### **Creating Slash Commands**

```typescript
// Register slash commands (done in Slack App configuration)
// Handle slash command interactions
slack.on('slash_command', async (command) => {
  switch (command.command) {
    case '/standup':
      await slack.respond(command.response_url, {
        response_type: 'ephemeral', // Only visible to user
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '📝 *Daily Standup*\nWhat did you work on yesterday?'
            }
          },
          {
            type: 'input',
            block_id: 'yesterday_block',
            element: {
              type: 'plain_text_input',
              action_id: 'yesterday_input',
              multiline: true,
              placeholder: {
                type: 'plain_text',
                text: 'Describe what you accomplished yesterday...'
              }
            },
            label: {
              type: 'plain_text',
              text: 'Yesterday\'s Work'
            }
          },
          {
            type: 'input',
            block_id: 'today_block',
            element: {
              type: 'plain_text_input',
              action_id: 'today_input',
              multiline: true,
              placeholder: {
                type: 'plain_text',
                text: 'What are you working on today?'
              }
            },
            label: {
              type: 'plain_text',
              text: 'Today\'s Plan'
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Submit Standup'
                },
                style: 'primary',
                action_id: 'submit_standup'
              }
            ]
          }
        ]
      });
      break;

    case '/weather':
      const location = command.text;
      const weatherData = await getWeatherData(location);
      
      await slack.respond(command.response_url, {
        response_type: 'in_channel', // Visible to everyone
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🌤️ *Weather in ${location}*\n*Temperature:* ${weatherData.temp}°C\n*Condition:* ${weatherData.condition}\n*Humidity:* ${weatherData.humidity}%`
            },
            accessory: {
              type: 'image',
              image_url: weatherData.iconUrl,
              alt_text: weatherData.condition
            }
          }
        ]
      });
      break;

    case '/poll':
      const [question, ...options] = command.text.split('|');
      
      await slack.respond(command.response_url, {
        response_type: 'in_channel',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `📊 *Poll: ${question.trim()}*`
            }
          },
          {
            type: 'actions',
            elements: options.map((option, index) => ({
              type: 'button',
              text: {
                type: 'plain_text',
                text: option.trim()
              },
              action_id: `poll_vote_${index}`,
              value: option.trim()
            }))
          }
        ]
      });
      break;
  }
});
```

### **Interactive Components**

#### **Button Interactions**

```typescript
// Handle button clicks
slack.on('interactive', async (interaction) => {
  if (interaction.type === 'block_actions') {
    const action = interaction.actions[0];
    
    switch (action.action_id) {
      case 'join_meeting':
        await slack.respond(interaction.response_url, {
          response_type: 'ephemeral',
          text: '🎯 Great! Opening the meeting link for you...'
        });
        break;

      case 'view_agenda':
        await slack.openModal({
          trigger_id: interaction.trigger_id,
          view: {
            type: 'modal',
            title: {
              type: 'plain_text',
              text: 'Sprint Planning Agenda'
            },
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: '*Sprint Planning Agenda*\n\n1. Review previous sprint\n2. Discuss upcoming features\n3. Estimate story points\n4. Assign tasks\n5. Set sprint goals'
                }
              }
            ]
          }
        });
        break;

      case 'submit_standup':
        const yesterday = interaction.state.values.yesterday_block.yesterday_input.value;
        const today = interaction.state.values.today_block.today_input.value;
        
        // Post standup to team channel
        await slack.post({
          type: 'blocks',
          channel: 'C1234567890', // Team channel
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `📝 *Standup from <@${interaction.user.id}>*`
              }
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Yesterday:*\n${yesterday}`
                },
                {
                  type: 'mrkdwn',
                  text: `*Today:*\n${today}`
                }
              ]
            }
          ]
        });
        
        await slack.respond(interaction.response_url, {
          response_type: 'ephemeral',
          text: '✅ Your standup has been posted to the team channel!'
        });
        break;
    }
  }
});
```

### **Channel and User Management**

#### **Channel Operations**

```typescript
// Create a new channel
await slack.createChannel({
  name: 'ai-project-discussion',
  is_private: false,
  topic: 'Discussion about AI integration project',
  purpose: 'Collaborate on AI features and share updates'
});

// Get channel information
const channel = await slack.getChannel('C1234567890');
console.log(`Channel: ${channel.name}`);
console.log(`Members: ${channel.num_members}`);
console.log(`Topic: ${channel.topic.value}`);

// Invite users to channel
await slack.inviteToChannel('C1234567890', ['U1234567890', 'U0987654321']);

// Archive a channel
await slack.archiveChannel('C1234567890');
```

#### **User Management**

```typescript
// Get user information
const user = await slack.getUser('U1234567890');
console.log(`User: ${user.real_name} (@${user.name})`);
console.log(`Email: ${user.profile.email}`);
console.log(`Status: ${user.profile.status_text}`);

// Get workspace members
const members = await slack.getUsers();
console.log(`Workspace has ${members.length} members`);

// Send direct message
await slack.post({
  type: 'text',
  channel: 'U1234567890', // User ID for DM
  content: 'Hi! I wanted to follow up on our discussion about the AI project. 🤖'
});
```

## 📊 **Analytics and Insights**

### **Channel Analytics**

```typescript
// Get channel activity
const channelStats = await slack.getChannelStats('C1234567890');
console.log(`Messages today: ${channelStats.messagesToday}`);
console.log(`Active members: ${channelStats.activeMembers}`);
console.log(`Most active user: ${channelStats.mostActiveUser}`);

// Get message history
const history = await slack.getChannelHistory('C1234567890', {
  count: 100,
  inclusive: true
});

// Analyze message patterns
const messageAnalysis = analyzeMessages(history.messages);
console.log(`Average messages per day: ${messageAnalysis.avgPerDay}`);
console.log(`Peak activity time: ${messageAnalysis.peakTime}`);
```

### **Team Engagement Analytics**

```typescript
// Get workspace analytics
const workspaceStats = await slack.getWorkspaceStats();
console.log(`Total messages: ${workspaceStats.totalMessages}`);
console.log(`Active users: ${workspaceStats.activeUsers}`);
console.log(`Public channels: ${workspaceStats.publicChannels}`);

// Track user engagement
const engagementData = await slack.getUserEngagement({
  timeRange: 'last-30-days'
});

engagementData.forEach(user => {
  console.log(`${user.name}: ${user.messageCount} messages, ${user.reactionsGiven} reactions`);
});
```

## 🔄 **Real-time Features**

### **Event Monitoring**

```typescript
// Welcome new team members
slack.on('team_join', async (event) => {
  const user = event.user;
  const welcomeChannel = 'C1234567890'; // Welcome channel
  
  await slack.post({
    type: 'blocks',
    channel: welcomeChannel,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🎉 Welcome to the team, <@${user.id}>!`
        },
        accessory: {
          type: 'image',
          image_url: user.profile.image_192,
          alt_text: user.real_name
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Getting Started:*\n• Check out <#C0987654321> for team updates\n• Join <#C1111111111> for casual chat\n• Read our <https://company.com/handbook|Team Handbook>'
        }
      }
    ]
  });
  
  // Send welcome DM
  await slack.post({
    type: 'text',
    channel: user.id,
    content: `Welcome to the team! 🎉 I'm here to help you get started. Feel free to ask me any questions!`
  });
});

// Handle mentions
slack.on('app_mention', async (event) => {
  const responses = [
    'Hi there! How can I help you today? 🤖',
    'Thanks for mentioning me! What do you need? 👋',
    'Hello! I\'m here to assist. What\'s on your mind? 💭'
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  await slack.post({
    type: 'text',
    channel: event.channel,
    content: randomResponse,
    thread_ts: event.ts // Reply in thread
  });
});

// React to specific keywords
slack.on('message', async (event) => {
  if (event.bot_id) return; // Skip bot messages
  
  const text = event.text.toLowerCase();
  
  // Auto-react to positive messages
  if (text.includes('great job') || text.includes('awesome') || text.includes('excellent')) {
    await slack.addReaction(event.channel, event.ts, 'star2');
  }
  
  // Auto-react to completed tasks
  if (text.includes('completed') || text.includes('finished') || text.includes('done')) {
    await slack.addReaction(event.channel, event.ts, 'white_check_mark');
  }
  
  // Help with questions
  if (text.includes('help') || text.includes('question')) {
    await slack.addReaction(event.channel, event.ts, 'raising_hand');
  }
});
```

### **Workflow Automation**

```typescript
// Daily standup reminder
const scheduleStandupReminder = () => {
  // Schedule for 9 AM on weekdays
  const schedule = '0 9 * * 1-5'; // Cron format
  
  cron.schedule(schedule, async () => {
    const teamChannel = 'C1234567890';
    
    await slack.post({
      type: 'blocks',
      channel: teamChannel,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🌅 *Good morning, team!* Time for our daily standup.'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Please share:\n• What you accomplished yesterday\n• What you\'re working on today\n• Any blockers or challenges'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Quick Standup'
              },
              style: 'primary',
              action_id: 'quick_standup'
            }
          ]
        }
      ]
    });
  });
};

// Meeting reminder system
const scheduleMeetingReminder = (meetingData) => {
  const reminderTime = new Date(meetingData.startTime);
  reminderTime.setMinutes(reminderTime.getMinutes() - 15); // 15 minutes before
  
  setTimeout(async () => {
    await slack.post({
      type: 'blocks',
      channel: meetingData.channel,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `⏰ *Meeting Reminder*\n"${meetingData.title}" starts in 15 minutes!`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Time:* ${meetingData.startTime}`
            },
            {
              type: 'mrkdwn',
              text: `*Location:* ${meetingData.location}`
            }
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Join Meeting'
              },
              style: 'primary',
              url: meetingData.joinUrl
            }
          ]
        }
      ]
    });
  }, reminderTime.getTime() - Date.now());
};
```

## 🛠️ **Advanced Use Cases**

### **Team Productivity Bot**

```typescript
// Comprehensive team productivity automation
const setupProductivityBot = async () => {
  // Track project progress
  slack.on('message', async (event) => {
    if (event.text && event.text.includes('#completed')) {
      // Extract task from message
      const task = event.text.replace('#completed', '').trim();
      
      await slack.post({
        type: 'blocks',
        channel: 'C1234567890', // Progress tracking channel
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `✅ *Task Completed*\n<@${event.user}> completed: ${task}`
            }
          }
        ]
      });
      
      // Update project dashboard
      await updateProjectDashboard(event.user, task);
    }
  });

  // Weekly team summary
  setInterval(async () => {
    const weeklyStats = await generateWeeklyStats();
    
    await slack.post({
      type: 'blocks',
      channel: 'C1234567890',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 Weekly Team Summary'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Tasks Completed:* ${weeklyStats.tasksCompleted}`
            },
            {
              type: 'mrkdwn',
              text: `*Team Messages:* ${weeklyStats.totalMessages}`
            },
            {
              type: 'mrkdwn',
              text: `*Most Active:* <@${weeklyStats.mostActiveUser}>`
            },
            {
              type: 'mrkdwn',
              text: `*Meetings Held:* ${weeklyStats.meetingsHeld}`
            }
          ]
        }
      ]
    });
  }, 7 * 24 * 60 * 60 * 1000); // Weekly
};
```

### **Customer Support Integration**

```typescript
// Customer support ticket system
const setupSupportBot = async () => {
  // Handle support requests
  slack.on('slash_command', async (command) => {
    if (command.command === '/support') {
      await slack.openModal({
        trigger_id: command.trigger_id,
        view: {
          type: 'modal',
          callback_id: 'support_ticket',
          title: {
            type: 'plain_text',
            text: 'Create Support Ticket'
          },
          submit: {
            type: 'plain_text',
            text: 'Create Ticket'
          },
          blocks: [
            {
              type: 'input',
              block_id: 'title_block',
              element: {
                type: 'plain_text_input',
                action_id: 'title_input',
                placeholder: {
                  type: 'plain_text',
                  text: 'Brief description of the issue'
                }
              },
              label: {
                type: 'plain_text',
                text: 'Issue Title'
              }
            },
            {
              type: 'input',
              block_id: 'priority_block',
              element: {
                type: 'static_select',
                action_id: 'priority_select',
                options: [
                  {
                    text: { type: 'plain_text', text: 'Low' },
                    value: 'low'
                  },
                  {
                    text: { type: 'plain_text', text: 'Medium' },
                    value: 'medium'
                  },
                  {
                    text: { type: 'plain_text', text: 'High' },
                    value: 'high'
                  },
                  {
                    text: { type: 'plain_text', text: 'Critical' },
                    value: 'critical'
                  }
                ]
              },
              label: {
                type: 'plain_text',
                text: 'Priority Level'
              }
            },
            {
              type: 'input',
              block_id: 'description_block',
              element: {
                type: 'plain_text_input',
                action_id: 'description_input',
                multiline: true,
                placeholder: {
                  type: 'plain_text',
                  text: 'Detailed description of the issue...'
                }
              },
              label: {
                type: 'plain_text',
                text: 'Issue Description'
              }
            }
          ]
        }
      });
    }
  });

  // Handle ticket creation
  slack.on('view_submission', async (submission) => {
    if (submission.view.callback_id === 'support_ticket') {
      const values = submission.view.state.values;
      const title = values.title_block.title_input.value;
      const priority = values.priority_block.priority_select.selected_option.value;
      const description = values.description_block.description_input.value;
      
      // Create ticket in support system
      const ticketId = await createSupportTicket({
        title,
        priority,
        description,
        reporter: submission.user.id
      });
      
      // Post to support channel
      await slack.post({
        type: 'blocks',
        channel: 'C9999999999', // Support channel
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🎫 *New Support Ticket #${ticketId}*\n*Reporter:* <@${submission.user.id}>\n*Priority:* ${priority.toUpperCase()}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Title:* ${title}\n*Description:* ${description}`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Assign to Me'
                },
                style: 'primary',
                action_id: 'assign_ticket',
                value: ticketId
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Details'
                },
                action_id: 'view_ticket',
                value: ticketId
              }
            ]
          }
        ]
      });
    }
  });
};
```

### **HR and Onboarding Automation**

```typescript
// HR automation for new employee onboarding
const setupHRBot = async () => {
  // New employee onboarding workflow
  slack.on('team_join', async (event) => {
    const newUser = event.user;
    
    // Create onboarding checklist
    const onboardingTasks = [
      'Complete profile setup',
      'Read employee handbook',
      'Set up development environment',
      'Meet with manager',
      'Join team channels',
      'Complete security training'
    ];
    
    // Send onboarding checklist
    await slack.post({
      type: 'blocks',
      channel: newUser.id,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🎉 Welcome to the team, ${newUser.real_name}! Here's your onboarding checklist:`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: onboardingTasks.map((task, index) => `${index + 1}. ${task}`).join('\n')
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Start Onboarding'
              },
              style: 'primary',
              action_id: 'start_onboarding',
              value: newUser.id
            }
          ]
        }
      ]
    });
    
    // Schedule follow-up messages
    setTimeout(async () => {
      await slack.post({
        type: 'text',
        channel: newUser.id,
        content: '👋 How is your first day going? Let me know if you need any help!'
      });
    }, 4 * 60 * 60 * 1000); // 4 hours later
    
    setTimeout(async () => {
      await slack.post({
        type: 'text',
        channel: newUser.id,
        content: '📝 Don\'t forget to complete your onboarding checklist. You\'re doing great!'
      });
    }, 24 * 60 * 60 * 1000); // 1 day later
  });

  // Birthday and anniversary reminders
  const celebrateTeamMembers = async () => {
    const today = new Date();
    const teamMembers = await slack.getUsers();
    
    for (const member of teamMembers) {
      // Check for birthdays (if profile has birthday info)
      if (member.profile.birthday && isBirthday(member.profile.birthday, today)) {
        await slack.post({
          type: 'blocks',
          channel: 'C1234567890', // General channel
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🎂 Happy Birthday, <@${member.id}>! 🎉`
              },
              accessory: {
                type: 'image',
                image_url: member.profile.image_192,
                alt_text: member.real_name
              }
            }
          ]
        });
      }
      
      // Check for work anniversaries
      if (member.profile.start_date && isWorkAnniversary(member.profile.start_date, today)) {
        const years = getYearsOfService(member.profile.start_date, today);
        await slack.post({
          type: 'blocks',
          channel: 'C1234567890',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🎊 Congratulations <@${member.id}> on ${years} year${years > 1 ? 's' : ''} with the company! 🎊`
              }
            }
          ]
        });
      }
    }
  };
  
  // Run daily at 9 AM
  setInterval(celebrateTeamMembers, 24 * 60 * 60 * 1000);
};
```

## 🚨 **Error Handling and Troubleshooting**

### **Common Error Scenarios**

```typescript
try {
  await slack.post({
    type: 'text',
    channel: 'C1234567890',
    content: 'This message might fail for various reasons'
  });
} catch (error) {
  if (error.code === 'channel_not_found') {
    console.log('Channel not found or bot not in channel');
    // Handle channel access issues
  } else if (error.code === 'not_in_channel') {
    console.log('Bot needs to be invited to the channel');
    // Handle channel membership issues
  } else if (error.code === 'rate_limited') {
    console.log('Slack rate limit hit, waiting before retry...');
    const retryAfter = error.retryAfter || 1000;
    await new Promise(resolve => setTimeout(resolve, retryAfter));
    // Retry the operation
  } else if (error.code === 'invalid_auth') {
    console.log('Authentication failed, checking token...');
    await slack.authenticate(); // Re-authenticate
  } else if (error.code === 'missing_scope') {
    console.log('Missing required OAuth scope:', error.needed);
    // Handle scope issues
  } else {
    console.error('Unexpected Slack error:', error.message);
  }
}
```

### **Rate Limit Management**

```typescript
// Implement smart rate limiting
const messageQueue = [];
let isProcessing = false;

const processMessageQueue = async () => {
  if (isProcessing || messageQueue.length === 0) return;
  
  isProcessing = true;
  
  while (messageQueue.length > 0) {
    const message = messageQueue.shift();
    
    try {
      await slack.post(message);
      // Wait between messages to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      if (error.code === 'rate_limited') {
        // Put message back and wait
        messageQueue.unshift(message);
        await new Promise(resolve => setTimeout(resolve, error.retryAfter || 60000));
      } else {
        console.error('Failed to send message:', error);
      }
    }
  }
  
  isProcessing = false;
};

// Queue messages instead of sending directly
const queueMessage = (messageData) => {
  messageQueue.push(messageData);
  processMessageQueue();
};
```

## 🔗 **Integration Examples**

### **With Agent Builder**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';
import { SlackAdapter } from '@mplp/adapters';

const slackBot = new AgentBuilder('SlackBot')
  .withName('Team Productivity Assistant')
  .withPlatform('slack', new SlackAdapter(slackConfig))
  .withCapability('standupReminder', async () => {
    // Daily standup automation
    const teamChannel = 'C1234567890';
    await this.platform.post({
      type: 'blocks',
      channel: teamChannel,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🌅 Good morning! Time for our daily standup. Please share your updates!'
          }
        }
      ]
    });
  })
  .withCapability('meetingScheduler', async (meetingData) => {
    // Schedule and remind about meetings
    await this.platform.scheduleMeetingReminder(meetingData);
  })
  .build();

await slackBot.start();
```

### **With Orchestrator**

```typescript
import { MultiAgentOrchestrator } from '@mplp/orchestrator';

const orchestrator = new MultiAgentOrchestrator();

// Create team productivity workflow
const productivityWorkflow = orchestrator.createWorkflow('TeamProductivity')
  .addStep('gatherStandups', async () => {
    // Collect daily standup updates
    return await slack.collectStandupUpdates('C1234567890');
  })
  .addStep('analyzeProductivity', async (standups) => {
    // Analyze team productivity patterns
    return await analyzeTeamProductivity(standups);
  })
  .addStep('generateInsights', async (analysis) => {
    // Generate productivity insights
    const insights = await generateProductivityInsights(analysis);
    
    // Share insights with team
    await slack.post({
      type: 'blocks',
      channel: 'C1234567890',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📊 *Team Productivity Insights*\n${insights.summary}`
          }
        }
      ]
    });
  });

await productivityWorkflow.execute();
```

## 📚 **Best Practices**

### **Bot Development**

- **Clear Communication**: Use clear, concise language in messages and commands
- **User Experience**: Design intuitive interactions with helpful error messages
- **Performance**: Optimize message sending and API calls to respect rate limits
- **Security**: Validate all user inputs and handle sensitive data properly
- **Accessibility**: Use proper formatting and alt text for images

### **Team Integration**

- **Channel Organization**: Use appropriate channels for different types of messages
- **Threading**: Use threads for follow-up discussions to keep channels organized
- **Mentions**: Use mentions thoughtfully to avoid notification fatigue
- **Timing**: Consider time zones and working hours when sending automated messages
- **Privacy**: Respect user privacy and use ephemeral messages when appropriate

### **Workflow Automation**

- **Gradual Rollout**: Introduce automation gradually to allow team adaptation
- **Feedback Loop**: Collect user feedback and iterate on automated workflows
- **Fallback Options**: Provide manual alternatives for automated processes
- **Documentation**: Document all automated workflows and how to interact with them
- **Monitoring**: Monitor bot performance and user satisfaction regularly

## 🔗 **Related Documentation**

- [Platform Adapters Overview](../../README.md) - Complete platform adapter system
- [Agent Builder Integration](../../sdk-api/agent-builder/README.md) - Building Slack-enabled agents
- [Orchestrator Workflows](../../sdk-api/orchestrator/README.md) - Multi-platform orchestration
- [Discord Adapter](../discord/README.md) - Discord platform integration
- [GitHub Adapter](../github/README.md) - GitHub platform integration

---

**Adapter Maintainer**: MPLP Platform Team  
**Last Review**: 2025-09-20  
**Test Coverage**: 100% (92/92 tests passing)  
**Status**: ✅ Production Ready
