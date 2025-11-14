# Slack平台适配器 - 完整使用指南

> **🌐 语言导航**: [English](../../../en/platform-adapters/slack/README.md) | [中文](README.md)


> **平台**: Slack  
> **适配器**: @mplp/adapters - SlackAdapter  
> **版本**: v1.1.0  
> **更新时间**: 2025-09-20  
> **状态**: ✅ 生产就绪  

## 📚 **概览**

Slack平台适配器提供与Slack团队协作平台的全面集成，使智能代理能够与Slack工作区交互、管理频道、发送消息、处理斜杠命令，并自动化团队工作流程。它使用Slack的Web API和Socket模式，具有适用于机器人和应用程序集成的企业级功能。

### **🎯 关键功能**

- **💬 消息管理**: 发送、更新、删除带有丰富格式和附件的消息
- **🏢 工作区管理**: 管理频道、用户和工作区设置
- **⚡ 斜杠命令**: 创建和处理自定义Slack斜杠命令
- **🔔 交互组件**: 按钮、模态框、选择菜单和工作流程
- **🔐 OAuth认证**: Slack应用OAuth，具有细粒度权限
- **⚡ 速率限制**: 智能Slack API速率限制管理
- **🔄 实时事件**: Socket模式实现实时Slack交互
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
import { SlackAdapter } from '@mplp/adapters';

// 使用机器人令牌创建Slack适配器
const slack = new SlackAdapter({
  platform: 'slack',
  name: '我的Slack机器人',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'bot',
    credentials: {
      token: process.env.SLACK_BOT_TOKEN!, // 机器人用户OAuth令牌
      signingSecret: process.env.SLACK_SIGNING_SECRET!
    }
  }
});

// 初始化和认证
await slack.initialize();
await slack.authenticate();

console.log('✅ Slack适配器已就绪！');
```

### **发送第一条消息**

```typescript
// 向频道发送消息
const result = await slack.post({
  type: 'text',
  channel: 'C1234567890', // 频道ID
  content: '你好Slack！🤖 这是我从MPLP发送的第一条消息！'
});

console.log(`消息已发送: ${result.data.ts}`);
```

## 🔧 **配置**

### **机器人令牌认证**

#### **基础机器人配置**

```typescript
const slackConfig = {
  platform: 'slack',
  name: 'Slack机器人',
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
    'chat:write',           // 发送消息
    'chat:write.public',    // 向公共频道发送消息
    'channels:read',        // 查看公共频道的基本信息
    'groups:read',          // 查看私有频道的基本信息
    'users:read',           // 查看工作区中的人员
    'reactions:write'       // 添加和删除表情符号反应
  ],
  rateLimits: {
    messages: { requests: 100, window: 60000 }, // 每分钟100条消息
    api: { requests: 100, window: 60000 }       // 每分钟100次API调用
  }
};
```

#### **高级机器人配置**

```typescript
const advancedConfig = {
  platform: 'slack',
  name: '高级Slack机器人',
  version: '1.0.0',
  enabled: true,
  auth: {
    type: 'bot',
    credentials: {
      token: process.env.SLACK_BOT_TOKEN!,
      signingSecret: process.env.SLACK_SIGNING_SECRET!,
      appToken: process.env.SLACK_APP_TOKEN! // 用于Socket模式
    }
  },
  scopes: [
    'chat:write', 'chat:write.public', 'channels:read', 'groups:read',
    'users:read', 'reactions:write', 'commands', 'files:write',
    'channels:manage', 'groups:write', 'im:write', 'mpim:write'
  ],
  socketMode: true, // 启用实时事件
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

## 📝 **核心操作**

### **消息管理**

#### **文本消息**

```typescript
// 简单文本消息
await slack.post({
  type: 'text',
  channel: 'C1234567890',
  content: '大家好！👋'
});

// 带提及的消息
await slack.post({
  type: 'text',
  channel: 'C1234567890',
  content: '项目做得很好，<@U1234567890>！🎉',
  metadata: {
    mentions: ['U1234567890']
  }
});

// 带频道提及的消息
await slack.post({
  type: 'text',
  channel: 'C1234567890',
  content: '请查看 <#C0987654321> 频道中的更新 📢'
});
```

#### **丰富块消息**

```typescript
// 带部分的丰富块消息
await slack.post({
  type: 'blocks',
  channel: 'C1234567890',
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🚀 项目更新'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '我们在AI集成项目上取得了重大进展！'
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*状态:*\n✅ 已完成'
        },
        {
          type: 'mrkdwn',
          text: '*进度:*\n85%'
        },
        {
          type: 'mrkdwn',
          text: '*截止日期:*\n2025年9月30日'
        },
        {
          type: 'mrkdwn',
          text: '*团队:*\n5名开发者'
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
        text: '*下一步:*\n• 最终测试阶段\n• 文档更新\n• 部署准备'
      }
    }
  ]
});

// 带交互按钮的消息
await slack.post({
  type: 'blocks',
  channel: 'C1234567890',
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '🎯 *冲刺规划会议*\n准备开始规划我们的下一个冲刺了吗？'
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '加入会议'
          },
          style: 'primary',
          action_id: 'join_meeting',
          url: 'https://zoom.us/j/123456789'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '查看议程'
          },
          action_id: 'view_agenda'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '稍后再说'
          },
          style: 'danger',
          action_id: 'maybe_later'
        }
      ]
    }
  ]
});
```

#### **带文件的消息**

```typescript
// 带文件附件的消息
await slack.post({
  type: 'text',
  channel: 'C1234567890',
  content: '这是最新的项目报告！📊',
  attachments: [
    {
      filename: 'project-report.pdf',
      url: 'https://example.com/reports/project-report.pdf',
      title: '第三季度项目报告',
      filetype: 'pdf'
    }
  ]
});

// 上传并分享文件
await slack.uploadFile({
  channels: 'C1234567890',
  file: './documents/presentation.pptx',
  filename: '冲刺回顾演示.pptx',
  title: '冲刺回顾 - 2025年第三季度',
  initialComment: '这是我们的冲刺回顾演示！🎯'
});
```

### **斜杠命令**

#### **创建斜杠命令**

```typescript
// 注册斜杠命令（在Slack应用配置中完成）
// 处理斜杠命令交互
slack.on('slash_command', async (command) => {
  switch (command.command) {
    case '/standup':
      await slack.respond(command.response_url, {
        response_type: 'ephemeral', // 仅对用户可见
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '📝 *每日站会*\n您昨天做了什么工作？'
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
                text: '描述您昨天完成的工作...'
              }
            },
            label: {
              type: 'plain_text',
              text: '昨天的工作'
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
                text: '您今天要做什么工作？'
              }
            },
            label: {
              type: 'plain_text',
              text: '今天的计划'
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '提交站会'
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
        response_type: 'in_channel', // 对所有人可见
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🌤️ *${location}的天气*\n*温度:* ${weatherData.temp}°C\n*天气:* ${weatherData.condition}\n*湿度:* ${weatherData.humidity}%`
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
              text: `📊 *投票: ${question.trim()}*`
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

### **交互组件**

#### **按钮交互**

```typescript
// 处理按钮点击
slack.on('interactive', async (interaction) => {
  if (interaction.type === 'block_actions') {
    const action = interaction.actions[0];
    
    switch (action.action_id) {
      case 'join_meeting':
        await slack.respond(interaction.response_url, {
          response_type: 'ephemeral',
          text: '🎯 太好了！为您打开会议链接...'
        });
        break;

      case 'view_agenda':
        await slack.openModal({
          trigger_id: interaction.trigger_id,
          view: {
            type: 'modal',
            title: {
              type: 'plain_text',
              text: '冲刺规划议程'
            },
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: '*冲刺规划议程*\n\n1. 回顾上一个冲刺\n2. 讨论即将到来的功能\n3. 估算故事点\n4. 分配任务\n5. 设定冲刺目标'
                }
              }
            ]
          }
        });
        break;

      case 'submit_standup':
        const yesterday = interaction.state.values.yesterday_block.yesterday_input.value;
        const today = interaction.state.values.today_block.today_input.value;
        
        // 将站会发布到团队频道
        await slack.post({
          type: 'blocks',
          channel: 'C1234567890', // 团队频道
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `📝 *<@${interaction.user.id}>的站会*`
              }
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*昨天:*\n${yesterday}`
                },
                {
                  type: 'mrkdwn',
                  text: `*今天:*\n${today}`
                }
              ]
            }
          ]
        });
        
        await slack.respond(interaction.response_url, {
          response_type: 'ephemeral',
          text: '✅ 您的站会已发布到团队频道！'
        });
        break;
    }
  }
});
```

### **频道和用户管理**

#### **频道操作**

```typescript
// 创建新频道
await slack.createChannel({
  name: 'ai-project-discussion',
  is_private: false,
  topic: '关于AI集成项目的讨论',
  purpose: '协作AI功能并分享更新'
});

// 获取频道信息
const channel = await slack.getChannel('C1234567890');
console.log(`频道: ${channel.name}`);
console.log(`成员: ${channel.num_members}`);
console.log(`话题: ${channel.topic.value}`);

// 邀请用户到频道
await slack.inviteToChannel('C1234567890', ['U1234567890', 'U0987654321']);

// 归档频道
await slack.archiveChannel('C1234567890');
```

#### **用户管理**

```typescript
// 获取用户信息
const user = await slack.getUser('U1234567890');
console.log(`用户: ${user.real_name} (@${user.name})`);
console.log(`邮箱: ${user.profile.email}`);
console.log(`状态: ${user.profile.status_text}`);

// 获取工作区成员
const members = await slack.getUsers();
console.log(`工作区有 ${members.length} 名成员`);

// 发送私信
await slack.post({
  type: 'text',
  channel: 'U1234567890', // 用户ID用于私信
  content: '你好！我想跟进我们关于AI项目的讨论。🤖'
});
```

## 📊 **分析和洞察**

### **频道分析**

```typescript
// 获取频道活动
const channelStats = await slack.getChannelStats('C1234567890');
console.log(`今日消息数: ${channelStats.messagesToday}`);
console.log(`活跃成员: ${channelStats.activeMembers}`);
console.log(`最活跃用户: ${channelStats.mostActiveUser}`);

// 获取消息历史
const history = await slack.getChannelHistory('C1234567890', {
  count: 100,
  inclusive: true
});

// 分析消息模式
const messageAnalysis = analyzeMessages(history.messages);
console.log(`每日平均消息数: ${messageAnalysis.avgPerDay}`);
console.log(`活动高峰时间: ${messageAnalysis.peakTime}`);
```

### **团队参与度分析**

```typescript
// 获取工作区分析
const workspaceStats = await slack.getWorkspaceStats();
console.log(`总消息数: ${workspaceStats.totalMessages}`);
console.log(`活跃用户: ${workspaceStats.activeUsers}`);
console.log(`公共频道: ${workspaceStats.publicChannels}`);

// 跟踪用户参与度
const engagementData = await slack.getUserEngagement({
  timeRange: 'last-30-days'
});

engagementData.forEach(user => {
  console.log(`${user.name}: ${user.messageCount} 条消息, ${user.reactionsGiven} 个反应`);
});
```

## 🔄 **实时功能**

### **事件监控**

```typescript
// 欢迎新团队成员
slack.on('team_join', async (event) => {
  const user = event.user;
  const welcomeChannel = 'C1234567890'; // 欢迎频道
  
  await slack.post({
    type: 'blocks',
    channel: welcomeChannel,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🎉 欢迎加入团队，<@${user.id}>！`
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
          text: '*入门指南:*\n• 查看 <#C0987654321> 获取团队更新\n• 加入 <#C1111111111> 进行休闲聊天\n• 阅读我们的 <https://company.com/handbook|团队手册>'
        }
      }
    ]
  });
  
  // 发送欢迎私信
  await slack.post({
    type: 'text',
    channel: user.id,
    content: `欢迎加入团队！🎉 我在这里帮助您开始。如有任何问题，请随时询问！`
  });
});

// 处理提及
slack.on('app_mention', async (event) => {
  const responses = [
    '你好！今天我能为您做些什么？🤖',
    '感谢提及我！您需要什么？👋',
    '您好！我在这里协助。您在想什么？💭'
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  await slack.post({
    type: 'text',
    channel: event.channel,
    content: randomResponse,
    thread_ts: event.ts // 在线程中回复
  });
});

// 对特定关键词做出反应
slack.on('message', async (event) => {
  if (event.bot_id) return; // 跳过机器人消息
  
  const text = event.text.toLowerCase();
  
  // 对积极消息自动反应
  if (text.includes('great job') || text.includes('awesome') || text.includes('excellent')) {
    await slack.addReaction(event.channel, event.ts, 'star2');
  }
  
  // 对完成的任务自动反应
  if (text.includes('completed') || text.includes('finished') || text.includes('done')) {
    await slack.addReaction(event.channel, event.ts, 'white_check_mark');
  }
  
  // 帮助解答问题
  if (text.includes('help') || text.includes('question')) {
    await slack.addReaction(event.channel, event.ts, 'raising_hand');
  }
});
```

### **工作流程自动化**

```typescript
// 每日站会提醒
const scheduleStandupReminder = () => {
  // 工作日上午9点安排
  const schedule = '0 9 * * 1-5'; // Cron格式
  
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
            text: '🌅 *早上好，团队！* 是时候进行每日站会了。'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '请分享:\n• 您昨天完成的工作\n• 您今天要做的工作\n• 任何阻碍或挑战'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '快速站会'
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

// 会议提醒系统
const scheduleMeetingReminder = (meetingData) => {
  const reminderTime = new Date(meetingData.startTime);
  reminderTime.setMinutes(reminderTime.getMinutes() - 15); // 提前15分钟
  
  setTimeout(async () => {
    await slack.post({
      type: 'blocks',
      channel: meetingData.channel,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `⏰ *会议提醒*\n"${meetingData.title}" 将在15分钟后开始！`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*时间:* ${meetingData.startTime}`
            },
            {
              type: 'mrkdwn',
              text: `*地点:* ${meetingData.location}`
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
                text: '加入会议'
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

## 🛠️ **高级用例**

### **团队生产力机器人**

```typescript
// 全面的团队生产力自动化
const setupProductivityBot = async () => {
  // 跟踪项目进度
  slack.on('message', async (event) => {
    if (event.text && event.text.includes('#completed')) {
      // 从消息中提取任务
      const task = event.text.replace('#completed', '').trim();
      
      await slack.post({
        type: 'blocks',
        channel: 'C1234567890', // 进度跟踪频道
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `✅ *任务完成*\n<@${event.user}> 完成了: ${task}`
            }
          }
        ]
      });
      
      // 更新项目仪表板
      await updateProjectDashboard(event.user, task);
    }
  });

  // 每周团队总结
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
            text: '📊 每周团队总结'
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*完成任务:* ${weeklyStats.tasksCompleted}`
            },
            {
              type: 'mrkdwn',
              text: `*团队消息:* ${weeklyStats.totalMessages}`
            },
            {
              type: 'mrkdwn',
              text: `*最活跃:* <@${weeklyStats.mostActiveUser}>`
            },
            {
              type: 'mrkdwn',
              text: `*举行会议:* ${weeklyStats.meetingsHeld}`
            }
          ]
        }
      ]
    });
  }, 7 * 24 * 60 * 60 * 1000); // 每周
};
```

### **客户支持集成**

```typescript
// 客户支持工单系统
const setupSupportBot = async () => {
  // 处理支持请求
  slack.on('slash_command', async (command) => {
    if (command.command === '/support') {
      await slack.openModal({
        trigger_id: command.trigger_id,
        view: {
          type: 'modal',
          callback_id: 'support_ticket',
          title: {
            type: 'plain_text',
            text: '创建支持工单'
          },
          submit: {
            type: 'plain_text',
            text: '创建工单'
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
                  text: '问题的简要描述'
                }
              },
              label: {
                type: 'plain_text',
                text: '问题标题'
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
                    text: { type: 'plain_text', text: '低' },
                    value: 'low'
                  },
                  {
                    text: { type: 'plain_text', text: '中' },
                    value: 'medium'
                  },
                  {
                    text: { type: 'plain_text', text: '高' },
                    value: 'high'
                  },
                  {
                    text: { type: 'plain_text', text: '紧急' },
                    value: 'critical'
                  }
                ]
              },
              label: {
                type: 'plain_text',
                text: '优先级'
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
                  text: '问题的详细描述...'
                }
              },
              label: {
                type: 'plain_text',
                text: '问题描述'
              }
            }
          ]
        }
      });
    }
  });

  // 处理工单创建
  slack.on('view_submission', async (submission) => {
    if (submission.view.callback_id === 'support_ticket') {
      const values = submission.view.state.values;
      const title = values.title_block.title_input.value;
      const priority = values.priority_block.priority_select.selected_option.value;
      const description = values.description_block.description_input.value;
      
      // 在支持系统中创建工单
      const ticketId = await createSupportTicket({
        title,
        priority,
        description,
        reporter: submission.user.id
      });
      
      // 发布到支持频道
      await slack.post({
        type: 'blocks',
        channel: 'C9999999999', // 支持频道
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `🎫 *新支持工单 #${ticketId}*\n*报告者:* <@${submission.user.id}>\n*优先级:* ${priority.toUpperCase()}`
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*标题:* ${title}\n*描述:* ${description}`
            }
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '分配给我'
                },
                style: 'primary',
                action_id: 'assign_ticket',
                value: ticketId
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '查看详情'
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

### **HR和入职自动化**

```typescript
// 新员工入职的HR自动化
const setupHRBot = async () => {
  // 新员工入职工作流程
  slack.on('team_join', async (event) => {
    const newUser = event.user;
    
    // 创建入职清单
    const onboardingTasks = [
      '完成个人资料设置',
      '阅读员工手册',
      '设置开发环境',
      '与经理会面',
      '加入团队频道',
      '完成安全培训'
    ];
    
    // 发送入职清单
    await slack.post({
      type: 'blocks',
      channel: newUser.id,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🎉 欢迎加入团队，${newUser.real_name}！这是您的入职清单:`
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
                text: '开始入职'
              },
              style: 'primary',
              action_id: 'start_onboarding',
              value: newUser.id
            }
          ]
        }
      ]
    });
    
    // 安排后续消息
    setTimeout(async () => {
      await slack.post({
        type: 'text',
        channel: newUser.id,
        content: '👋 您的第一天过得怎么样？如果需要任何帮助，请告诉我！'
      });
    }, 4 * 60 * 60 * 1000); // 4小时后
    
    setTimeout(async () => {
      await slack.post({
        type: 'text',
        channel: newUser.id,
        content: '📝 别忘了完成您的入职清单。您做得很好！'
      });
    }, 24 * 60 * 60 * 1000); // 1天后
  });

  // 生日和周年纪念提醒
  const celebrateTeamMembers = async () => {
    const today = new Date();
    const teamMembers = await slack.getUsers();
    
    for (const member of teamMembers) {
      // 检查生日（如果个人资料有生日信息）
      if (member.profile.birthday && isBirthday(member.profile.birthday, today)) {
        await slack.post({
          type: 'blocks',
          channel: 'C1234567890', // 通用频道
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `🎂 生日快乐，<@${member.id}>！🎉`
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
      
      // 检查工作周年纪念
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
                text: `🎊 恭喜 <@${member.id}> 在公司工作${years}年！🎊`
              }
            }
          ]
        });
      }
    }
  };
  
  // 每天上午9点运行
  setInterval(celebrateTeamMembers, 24 * 60 * 60 * 1000);
};
```

## 🚨 **错误处理和故障排除**

### **常见错误场景**

```typescript
try {
  await slack.post({
    type: 'text',
    channel: 'C1234567890',
    content: '这条消息可能因各种原因失败'
  });
} catch (error) {
  if (error.code === 'channel_not_found') {
    console.log('频道未找到或机器人不在频道中');
    // 处理频道访问问题
  } else if (error.code === 'not_in_channel') {
    console.log('机器人需要被邀请到频道');
    // 处理频道成员资格问题
  } else if (error.code === 'rate_limited') {
    console.log('Slack速率限制达到，等待重试...');
    const retryAfter = error.retryAfter || 1000;
    await new Promise(resolve => setTimeout(resolve, retryAfter));
    // 重试操作
  } else if (error.code === 'invalid_auth') {
    console.log('认证失败，检查令牌...');
    await slack.authenticate(); // 重新认证
  } else if (error.code === 'missing_scope') {
    console.log('缺少必需的OAuth范围:', error.needed);
    // 处理范围问题
  } else {
    console.error('意外的Slack错误:', error.message);
  }
}
```

### **速率限制管理**

```typescript
// 实现智能速率限制
const messageQueue = [];
let isProcessing = false;

const processMessageQueue = async () => {
  if (isProcessing || messageQueue.length === 0) return;
  
  isProcessing = true;
  
  while (messageQueue.length > 0) {
    const message = messageQueue.shift();
    
    try {
      await slack.post(message);
      // 在消息之间等待以遵守速率限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      if (error.code === 'rate_limited') {
        // 将消息放回并等待
        messageQueue.unshift(message);
        await new Promise(resolve => setTimeout(resolve, error.retryAfter || 60000));
      } else {
        console.error('发送消息失败:', error);
      }
    }
  }
  
  isProcessing = false;
};

// 将消息排队而不是直接发送
const queueMessage = (messageData) => {
  messageQueue.push(messageData);
  processMessageQueue();
};
```

## 🔗 **集成示例**

### **与Agent Builder集成**

```typescript
import { AgentBuilder } from '@mplp/agent-builder';
import { SlackAdapter } from '@mplp/adapters';

const slackBot = new AgentBuilder('SlackBot')
  .withName('团队生产力助手')
  .withPlatform('slack', new SlackAdapter(slackConfig))
  .withCapability('standupReminder', async () => {
    // 每日站会自动化
    const teamChannel = 'C1234567890';
    await this.platform.post({
      type: 'blocks',
      channel: teamChannel,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🌅 早上好！是时候进行每日站会了。请分享您的更新！'
          }
        }
      ]
    });
  })
  .withCapability('meetingScheduler', async (meetingData) => {
    // 安排和提醒会议
    await this.platform.scheduleMeetingReminder(meetingData);
  })
  .build();

await slackBot.start();
```

### **与Orchestrator集成**

```typescript
import { MultiAgentOrchestrator } from '@mplp/orchestrator';

const orchestrator = new MultiAgentOrchestrator();

// 创建团队生产力工作流程
const productivityWorkflow = orchestrator.createWorkflow('TeamProductivity')
  .addStep('gatherStandups', async () => {
    // 收集每日站会更新
    return await slack.collectStandupUpdates('C1234567890');
  })
  .addStep('analyzeProductivity', async (standups) => {
    // 分析团队生产力模式
    return await analyzeTeamProductivity(standups);
  })
  .addStep('generateInsights', async (analysis) => {
    // 生成生产力洞察
    const insights = await generateProductivityInsights(analysis);
    
    // 与团队分享洞察
    await slack.post({
      type: 'blocks',
      channel: 'C1234567890',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📊 *团队生产力洞察*\n${insights.summary}`
          }
        }
      ]
    });
  });

await productivityWorkflow.execute();
```

## 📚 **最佳实践**

### **机器人开发**

- **清晰沟通**: 在消息和命令中使用清晰、简洁的语言
- **用户体验**: 设计直观的交互，提供有用的错误消息
- **性能**: 优化消息发送和API调用以遵守速率限制
- **安全**: 验证所有用户输入并正确处理敏感数据
- **可访问性**: 使用适当的格式和图像的替代文本

### **团队集成**

- **频道组织**: 为不同类型的消息使用适当的频道
- **线程**: 使用线程进行后续讨论以保持频道整洁
- **提及**: 谨慎使用提及以避免通知疲劳
- **时机**: 发送自动消息时考虑时区和工作时间
- **隐私**: 尊重用户隐私，适当时使用临时消息

### **工作流程自动化**

- **渐进推出**: 逐步引入自动化以允许团队适应
- **反馈循环**: 收集用户反馈并迭代自动化工作流程
- **备用选项**: 为自动化流程提供手动替代方案
- **文档**: 记录所有自动化工作流程以及如何与之交互
- **监控**: 定期监控机器人性能和用户满意度

## 🔗 **相关文档**

- [平台适配器概览](../../README.md) - 完整的平台适配器系统
- [Agent Builder集成](../../sdk-api/agent-builder/README.md) - 构建支持Slack的代理
- [Orchestrator工作流](../../sdk-api/orchestrator/README.md) - 多平台编排
- [Discord适配器](../discord/README.md) - Discord平台集成
- [GitHub适配器](../github/README.md) - GitHub平台集成

---

**适配器维护者**: MPLP平台团队  
**最后审查**: 2025-09-20  
**测试覆盖率**: 100% (92/92测试通过)  
**状态**: ✅ 生产就绪
