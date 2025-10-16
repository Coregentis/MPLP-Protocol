/**
 * @fileoverview DiscordAdapter tests
 */

import { DiscordAdapter } from '../DiscordAdapter';
import { AdapterConfig, ContentItem } from '../../../core/types';

describe('DiscordAdapter测试', () => {
  let adapter: DiscordAdapter;
  let config: AdapterConfig;

  beforeEach(() => {
    config = {
      platform: 'discord',
      name: 'Test Discord Adapter',
      version: '1.0.0',
      enabled: true,
      auth: {
        type: 'bearer',
        credentials: {
          token: 'test-discord-bot-token'
        }
      },
      settings: {
        defaultReaction: '👍'
      }
    };

    adapter = new DiscordAdapter(config);
  });

  describe('初始化测试', () => {
    it('应该正确初始化适配器', () => {
      expect(adapter.config).toEqual(config);
      expect(adapter.capabilities.canPost).toBe(true);
      expect(adapter.capabilities.canComment).toBe(true);
      expect(adapter.capabilities.maxContentLength).toBe(2000);
    });

    it('应该设置正确的平台能力', () => {
      const capabilities = adapter.capabilities;
      
      expect(capabilities.canPost).toBe(true);
      expect(capabilities.canComment).toBe(true);
      expect(capabilities.canShare).toBe(true); // Discord supports quoting messages
      expect(capabilities.canDelete).toBe(true);
      expect(capabilities.canEdit).toBe(true);
      expect(capabilities.canLike).toBe(true); // Reactions
      expect(capabilities.canFollow).toBe(false); // Discord doesn't have following
      expect(capabilities.canMessage).toBe(true);
      expect(capabilities.canMention).toBe(true);
      expect(capabilities.supportsWebhooks).toBe(true);
      expect(capabilities.supportsVoice).toBe(true);
      expect(capabilities.supportsRoles).toBe(true);
      expect(capabilities.supportsBulkOperations).toBe(true);
      expect(capabilities.supportedContentTypes).toContain('text');
      expect(capabilities.supportedContentTypes).toContain('image');
      expect(capabilities.supportedContentTypes).toContain('audio');
    });
  });

  describe('生命周期测试', () => {
    it('应该成功初始化', async () => {
      await expect(adapter.initialize()).resolves.not.toThrow();
    });

    it('应该成功认证', async () => {
      await adapter.initialize();
      const result = await adapter.authenticate();
      
      expect(result).toBe(true);
      expect(adapter.isAuthenticated).toBe(true);
    });

    it('应该成功断开连接', async () => {
      await adapter.initialize();
      await adapter.authenticate();
      
      await expect(adapter.disconnect()).resolves.not.toThrow();
      expect(adapter.isAuthenticated).toBe(false);
    });
  });

  describe('消息发送测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该成功发送Discord消息', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Hello Discord! 🎮',
        metadata: {
          channelId: '123456789012345678'
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.channelId).toBe('123456789012345678');
      expect(result.data?.platform).toBe('discord');
    });

    it('应该处理带嵌入的消息', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Check out this embed!',
        metadata: {
          channelId: '123456789012345678',
          title: 'Embed Title',
          description: 'This is an embed description',
          color: 0x00ff00
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });

    it('应该处理带文件附件的消息', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Message with attachment',
        metadata: {
          channelId: '123456789012345678'
        },
        media: [{
          type: 'image',
          url: 'https://example.com/image.png',
          filename: 'image.png'
        }]
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });

    it('应该在未指定频道时抛出错误', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Message without channel',
        metadata: {} // 明确不包含channelId
      };

      const result = await adapter.post(content);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Channel ID not specified');
    });
  });

  describe('互动功能测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该成功回复消息', async () => {
      const result = await adapter.comment('123456789012345678/987654321098765432', 'This is a reply');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.channelId).toBe('123456789012345678');
      expect(result.data?.platform).toBe('discord');
    });

    it('应该成功分享消息（引用）', async () => {
      const result = await adapter.share('123456789012345678/987654321098765432', 'Sharing this message');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.originalMessageId).toBe('987654321098765432');
    });

    it('应该成功添加反应', async () => {
      const result = await adapter.like('123456789012345678/987654321098765432');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('123456789012345678/987654321098765432');
      expect(result.data?.emoji).toBe('👍');
      expect(result.data?.platform).toBe('discord');
    });

    it('应该成功移除反应', async () => {
      const result = await adapter.unlike('123456789012345678/987654321098765432');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('123456789012345678/987654321098765432');
      expect(result.data?.emoji).toBe('👍');
    });

    it('应该成功删除消息', async () => {
      const result = await adapter.delete('123456789012345678/987654321098765432');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('123456789012345678/987654321098765432');
    });

    it('关注用户应该抛出错误', async () => {
      await expect(adapter.follow('user123'))
        .rejects.toThrow('Platform discord does not support following');
    });
  });

  describe('数据获取测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该获取用户资料', async () => {
      const profile = await adapter.getProfile('user123');
      
      expect(profile.id).toBe('user123');
      expect(profile.username).toBe('testuser');
      expect(profile.displayName).toBe('Test User');
      expect(profile.metadata?.discriminator).toBe('0001');
      expect(profile.metadata?.bot).toBe(false);
    });

    it('应该获取消息内容', async () => {
      const content = await adapter.getContent('123456789012345678/987654321098765432');
      
      expect(content.id).toBe('987654321098765432');
      expect(content.type).toBe('text');
      expect(content.content).toBe('Test message content');
      expect(content.metadata?.channelId).toBe('123456789012345678');
      expect(content.metadata?.author).toBe('test_user_123');
    });

    it('应该获取消息分析数据', async () => {
      const analytics = await adapter.getAnalytics('123456789012345678/987654321098765432');
      
      expect(analytics.reactions).toBe(0);
    });
  });

  describe('Webhook功能测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该成功设置webhook', async () => {
      const result = await adapter.setupWebhook('https://example.com/webhook', ['message', 'reaction']);
      
      expect(result).toBe(true);
    });

    it('应该成功移除webhook', async () => {
      const result = await adapter.removeWebhook('webhook123');
      
      expect(result).toBe(true);
    });
  });

  describe('监控功能测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该成功启动监控', async () => {
      await expect(adapter.startMonitoring()).resolves.not.toThrow();
    });

    it('应该成功停止监控', async () => {
      await adapter.startMonitoring();
      await expect(adapter.stopMonitoring()).resolves.not.toThrow();
    });
  });

  describe('内容验证测试', () => {
    it('应该验证有效内容', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Valid Discord message',
        metadata: {
          channelId: '123456789012345678'
        }
      };

      const isValid = await (adapter as any).doValidateContent(content);
      expect(isValid).toBe(true);
    });

    it('应该拒绝过长的内容', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'a'.repeat(2001), // Exceeds Discord's 2000 character limit
        metadata: {
          channelId: '123456789012345678'
        }
      };

      const isValid = await (adapter as any).doValidateContent(content);
      expect(isValid).toBe(false);
    });

    it('应该拒绝无效的频道ID', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Valid message',
        metadata: {
          channelId: 'invalid-channel-id'
        }
      };

      const isValid = await (adapter as any).doValidateContent(content);
      expect(isValid).toBe(false);
    });
  });

  describe('错误处理测试', () => {
    it('应该处理认证失败', async () => {
      const invalidConfig = {
        ...config,
        auth: {
          type: 'bearer' as const,
          credentials: {}
        }
      };

      const invalidAdapter = new DiscordAdapter(invalidConfig);
      await invalidAdapter.initialize();
      
      const result = await invalidAdapter.authenticate();
      expect(result).toBe(false);
    });

    it('应该处理API错误', async () => {
      await adapter.initialize();
      
      // Mock client to throw error
      const mockClient = {
        sendMessage: jest.fn().mockRejectedValue(new Error('Discord API Error'))
      };
      (adapter as any).client = mockClient;

      const content: ContentItem = {
        type: 'text',
        content: 'Test message',
        metadata: {
          channelId: '123456789012345678'
        }
      };

      const result = await adapter.post(content);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to send Discord message');
    });

    it('应该处理无效的postId格式', async () => {
      await adapter.initialize();
      await adapter.authenticate();

      const result = await adapter.comment('invalid-post-id', 'Reply');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid Discord post ID format: invalid-post-id');
    });
  });

  describe('企业级功能测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    afterEach(async () => {
      await adapter.disconnect();
    });

    describe('语音功能测试', () => {
      it('应该成功加入语音频道', async () => {
        const result = await adapter.joinVoiceChannel('voice_channel_123');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('channelId', 'voice_channel_123');
        expect(result.data).toHaveProperty('connected', true);
      });

      it('应该成功离开语音频道', async () => {
        const result = await adapter.leaveVoiceChannel('guild_123');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('guildId', 'guild_123');
        expect(result.data).toHaveProperty('disconnected', true);
      });
    });

    describe('角色管理测试', () => {
      it('应该成功添加角色', async () => {
        const result = await adapter.manageRole('guild_123', 'user_123', 'role_123', 'add');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('userId', 'user_123');
        expect(result.data).toHaveProperty('roleId', 'role_123');
        expect(result.data).toHaveProperty('action', 'add');
      });

      it('应该成功移除角色', async () => {
        const result = await adapter.manageRole('guild_123', 'user_123', 'role_123', 'remove');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('action', 'remove');
      });

      it('应该成功检查权限', async () => {
        const result = await adapter.checkPermissions('guild_123', 'user_123', ['SEND_MESSAGES', 'MANAGE_MESSAGES']);

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('permissions');
        expect(result.data.permissions).toHaveProperty('SEND_MESSAGES');
        expect(result.data.permissions).toHaveProperty('MANAGE_MESSAGES');
      });
    });

    describe('批量操作测试', () => {
      it('应该成功批量删除消息', async () => {
        const messageIds = ['msg1', 'msg2', 'msg3'];
        const result = await adapter.bulkDeleteMessages('channel_123', messageIds);

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('deletedCount', 3);
        expect(result.data).toHaveProperty('channelId', 'channel_123');
      });

      it('应该拒绝删除过多消息', async () => {
        const messageIds = Array.from({ length: 101 }, (_, i) => `msg${i}`);
        const result = await adapter.bulkDeleteMessages('channel_123', messageIds);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Cannot delete more than 100 messages');
      });
    });

    describe('高级分析测试', () => {
      it('应该获取日分析数据', async () => {
        const result = await adapter.getAdvancedAnalytics('guild_123', 'day');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('guildId', 'guild_123');
        expect(result.data).toHaveProperty('timeRange', 'day');
        expect(result.data).toHaveProperty('memberCount');
        expect(result.data).toHaveProperty('activeMembers');
        expect(result.data).toHaveProperty('messageCount');
        expect(result.data).toHaveProperty('channelActivity');
        expect(result.data).toHaveProperty('topChannels');
        expect(result.data).toHaveProperty('memberGrowth');
      });

      it('应该获取周分析数据', async () => {
        const result = await adapter.getAdvancedAnalytics('guild_123', 'week');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('timeRange', 'week');
      });

      it('应该获取月分析数据', async () => {
        const result = await adapter.getAdvancedAnalytics('guild_123', 'month');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('timeRange', 'month');
      });
    });

    describe('缓存管理测试', () => {
      it('应该成功清理缓存', () => {
        expect(() => adapter.clearCache()).not.toThrow();
      });
    });
  });
});
