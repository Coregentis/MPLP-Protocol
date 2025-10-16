/**
 * @fileoverview SlackAdapter tests
 */

import { SlackAdapter } from '../SlackAdapter';
import { AdapterConfig, ContentItem } from '../../../core/types';

describe('SlackAdapter测试', () => {
  let adapter: SlackAdapter;
  let config: AdapterConfig;

  beforeEach(() => {
    config = {
      platform: 'slack',
      name: 'Test Slack Adapter',
      version: '1.0.0',
      enabled: true,
      auth: {
        type: 'bearer',
        credentials: {
          bot_token: 'xoxb-test-bot-token',
          app_token: 'xapp-test-app-token',
          signing_secret: 'test-signing-secret'
        }
      },
      settings: {
        defaultChannel: '#general'
      }
    };

    adapter = new SlackAdapter(config);
  });

  describe('初始化测试', () => {
    it('应该正确初始化适配器', () => {
      expect(adapter.config).toEqual(config);
      expect(adapter.capabilities.canPost).toBe(true);
      expect(adapter.capabilities.maxContentLength).toBe(4000);
    });

    it('应该设置正确的平台能力', () => {
      const capabilities = adapter.capabilities;
      
      expect(capabilities.canPost).toBe(true);
      expect(capabilities.canComment).toBe(true);
      expect(capabilities.canEdit).toBe(true);
      expect(capabilities.canDelete).toBe(true);
      expect(capabilities.canLike).toBe(true);
      expect(capabilities.canShare).toBe(true);
      expect(capabilities.supportsWebhooks).toBe(true);
      expect(capabilities.supportsAnalytics).toBe(true);
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
  });

  describe('内容发布测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该成功发布消息', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Hello Slack!',
        metadata: {
          channel: '#general'
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.platform).toBe('slack');
    });

    it('应该成功发布带附件的消息', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Check out this file!',
        metadata: {
          channel: '#general',
          attachments: [
            {
              type: 'file',
              url: 'https://example.com/document.pdf',
              title: 'Important Document'
            }
          ]
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });

    it('应该成功发布富文本消息', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Rich text message',
        metadata: {
          channel: '#general',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*Bold text* and _italic text_'
              }
            }
          ]
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });
  });

  describe('互动功能测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该成功回复消息', async () => {
      const result = await adapter.comment('C1234567890:1234567890.123456', 'This is a reply');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });

    it('应该成功添加反应', async () => {
      const result = await adapter.like('C1234567890:1234567890.123456');
      
      expect(result.success).toBe(true);
      expect(result.data?.reaction).toBeDefined();
    });

    it('应该成功分享消息', async () => {
      const result = await adapter.share('C1234567890:1234567890.123456');
      
      expect(result.success).toBe(true);
      expect(result.data?.sharedTo).toBeDefined();
    });

    it('应该成功删除消息', async () => {
      const result = await adapter.delete('C1234567890:1234567890.123456');
      
      expect(result.success).toBe(true);
    });
  });

  describe('数据获取测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该获取用户资料', async () => {
      const profile = await adapter.getProfile('U1234567890');
      
      expect(profile.username).toBe('testuser');
      expect(profile.displayName).toBe('Test User');
      expect(profile.email).toBe('test@example.com');
    });

    it('应该获取消息内容', async () => {
      const content = await adapter.getContent('C1234567890:1234567890.123456');
      
      expect(content.id).toBe('1234567890.123456');
      expect(content.type).toBe('text');
      expect(content.content).toBe('Test message content');
    });

    it('应该搜索消息', async () => {
      const results = await adapter.search('test query');
      
      expect(results).toHaveLength(1);
      expect(results[0].content).toContain('test query');
    });

    it('应该获取频道列表', async () => {
      const channels = await adapter.getChannels();
      
      expect(Array.isArray(channels)).toBe(true);
      expect(channels.length).toBeGreaterThan(0);
      expect(channels[0]).toHaveProperty('id');
      expect(channels[0]).toHaveProperty('name');
    });
  });

  describe('Webhook功能测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该成功设置webhook', async () => {
      const result = await adapter.setupWebhook('https://example.com/webhook', ['message', 'reaction_added']);

      expect(result).toBe(true);
    });

    it('应该成功移除webhook', async () => {
      await adapter.setupWebhook('https://example.com/webhook', ['message']);
      const result = await adapter.removeWebhook('webhook-123');

      expect(result).toBe(true);
    });
  });

  describe('监控功能测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该成功启动监控', async () => {
      await expect(adapter.startMonitoring(['message', 'reaction_added'])).resolves.not.toThrow();
    });

    it('应该成功停止监控', async () => {
      await adapter.startMonitoring(['message']);
      await expect(adapter.stopMonitoring()).resolves.not.toThrow();
    });
  });

  describe('内容验证测试', () => {
    it('应该验证有效内容', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Valid message',
        metadata: { channel: '#general' }
      };

      const result = await adapter.validateContent(content);

      expect(result).toBe(true);
    });

    it('应该拒绝过长的内容', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'x'.repeat(5000), // 超过4000字符限制
        metadata: { channel: '#general' }
      };

      const result = await adapter.validateContent(content);

      expect(result).toBe(false);
    });

    it('应该拒绝无效频道的内容', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Valid message',
        metadata: { channel: 'invalid-channel' }
      };

      const result = await adapter.validateContent(content);

      expect(result).toBe(false);
    });
  });

  describe('错误处理测试', () => {
    it('应该处理认证失败', async () => {
      const invalidConfig = { ...config };
      invalidConfig.auth.credentials.bot_token = 'invalid-token';

      const invalidAdapter = new SlackAdapter(invalidConfig);
      await invalidAdapter.initialize();

      const result = await invalidAdapter.authenticate();
      expect(result).toBe(false);
      expect(invalidAdapter.isAuthenticated).toBe(false);
    });

    it('应该处理API错误', async () => {
      await adapter.initialize();
      await adapter.authenticate();

      // 模拟API错误
      const content: ContentItem = {
        type: 'text',
        content: 'Test message',
        metadata: { channel: '#nonexistent' }
      };

      const result = await adapter.post(content);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Channel not found');
    });
  });
});
