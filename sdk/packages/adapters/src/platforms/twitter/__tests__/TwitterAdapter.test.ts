/**
 * @fileoverview TwitterAdapter tests
 */

import { TwitterAdapter } from '../TwitterAdapter';
import { AdapterConfig, ContentItem } from '../../../core/types';

describe('TwitterAdapter测试', () => {
  let adapter: TwitterAdapter;
  let config: AdapterConfig;

  beforeEach(() => {
    config = {
      platform: 'twitter',
      name: 'Test Twitter Adapter',
      version: '1.0.0',
      enabled: true,
      auth: {
        type: 'oauth1',
        credentials: {
          apiKey: 'test-api-key',
          apiSecret: 'test-api-secret',
          accessToken: 'test-access-token',
          accessTokenSecret: 'test-access-token-secret'
        }
      }
    };

    adapter = new TwitterAdapter(config);
  });

  describe('初始化测试', () => {
    it('应该正确初始化适配器', () => {
      expect(adapter.config).toEqual(config);
      expect(adapter.capabilities.canPost).toBe(true);
      expect(adapter.capabilities.canComment).toBe(true);
      expect(adapter.capabilities.maxContentLength).toBe(280);
    });

    it('应该设置正确的平台能力', () => {
      const capabilities = adapter.capabilities;
      
      expect(capabilities.canPost).toBe(true);
      expect(capabilities.canComment).toBe(true);
      expect(capabilities.canShare).toBe(true);
      expect(capabilities.canDelete).toBe(true);
      expect(capabilities.canEdit).toBe(false); // Twitter doesn't support editing
      expect(capabilities.canLike).toBe(true);
      expect(capabilities.canFollow).toBe(true);
      expect(capabilities.canMessage).toBe(true);
      expect(capabilities.canMention).toBe(true);
      expect(capabilities.supportsPolls).toBe(true);
      expect(capabilities.supportsAnalytics).toBe(true);
      expect(capabilities.supportsWebhooks).toBe(true);
    });
  });

  describe('生命周期测试', () => {
    it('应该成功初始化', async () => {
      await expect(adapter.initialize()).resolves.not.toThrow();
      expect(adapter.isAuthenticated).toBe(false); // Not authenticated yet
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

  describe('内容发布测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该成功发布推文', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Hello Twitter! This is a test tweet.'
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.url).toContain('twitter.com');
      expect(result.data?.platform).toBe('twitter');
    });

    it('应该处理带媒体的推文', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Tweet with image',
        media: [{
          type: 'image',
          url: 'https://example.com/image.jpg',
          filename: 'image.jpg'
        }]
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });

    it('应该处理带提及的推文', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Hello world!',
        mentions: ['testuser', 'anotheruser']
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });

    it('应该在未初始化时抛出错误', async () => {
      const uninitializedAdapter = new TwitterAdapter(config);
      
      const content: ContentItem = {
        type: 'text',
        content: 'Test tweet'
      };

      const result = await uninitializedAdapter.post(content);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Twitter client not initialized');
    });
  });

  describe('互动功能测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该成功回复推文', async () => {
      const result = await adapter.comment('tweet123', 'This is a reply');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.platform).toBe('twitter');
    });

    it('应该成功转发推文', async () => {
      const result = await adapter.share('tweet123');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.platform).toBe('twitter');
    });

    it('应该成功带评论转发', async () => {
      const result = await adapter.share('tweet123', 'Great tweet!');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });

    it('应该成功点赞推文', async () => {
      const result = await adapter.like('tweet123');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('tweet123');
      expect(result.data?.platform).toBe('twitter');
    });

    it('应该成功取消点赞', async () => {
      const result = await adapter.unlike('tweet123');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('tweet123');
    });

    it('应该成功关注用户', async () => {
      const result = await adapter.follow('testuser');
      
      expect(result.success).toBe(true);
      expect(result.data?.userId).toBe('testuser');
      expect(result.data?.platform).toBe('twitter');
    });

    it('应该成功取消关注', async () => {
      const result = await adapter.unfollow('testuser');
      
      expect(result.success).toBe(true);
      expect(result.data?.userId).toBe('testuser');
    });

    it('应该成功删除推文', async () => {
      const result = await adapter.delete('tweet123');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('tweet123');
    });
  });

  describe('数据获取测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该获取用户资料', async () => {
      const profile = await adapter.getProfile('testuser');
      
      expect(profile.id).toBe('testuser');
      expect(profile.username).toBe('testuser');
      expect(profile.displayName).toBe('Test User');
      expect(profile.bio).toBe('Test user bio');
      expect(profile.verified).toBe(false);
      expect(profile.followers).toBe(100);
      expect(profile.following).toBe(50);
    });

    it('应该获取推文内容', async () => {
      const content = await adapter.getContent('tweet123');
      
      expect(content.id).toBe('tweet123');
      expect(content.type).toBe('text');
      expect(content.content).toBe('Sample tweet content');
      expect(content.metadata?.author).toBe('user123');
      expect(content.metrics?.likes).toBe(10);
      expect(content.metrics?.shares).toBe(5);
    });

    it('应该搜索推文', async () => {
      const results = await adapter.search('test query');
      
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('search_result_1');
      expect(results[0].content).toContain('test query');
      expect(results[0].metadata?.author).toBe('user456');
    });

    it('应该获取推文分析数据', async () => {
      const analytics = await adapter.getAnalytics('tweet123');
      
      expect(analytics.likes).toBe(10);
      expect(analytics.shares).toBe(5);
      expect(analytics.comments).toBe(2);
      expect(analytics.views).toBe(100);
    });
  });

  describe('Webhook功能测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该成功设置webhook', async () => {
      const result = await adapter.setupWebhook('https://example.com/webhook', ['tweet', 'mention']);
      
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
        content: 'Valid tweet content'
      };

      const isValid = await (adapter as any).doValidateContent(content);
      expect(isValid).toBe(true);
    });

    it('应该拒绝过长的内容', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'a'.repeat(281) // Exceeds Twitter's 280 character limit
      };

      const isValid = await (adapter as any).doValidateContent(content);
      expect(isValid).toBe(false);
    });

    it('应该拒绝过多提及的内容', async () => {
      const mentions = Array.from({ length: 11 }, (_, i) => `@user${i}`).join(' ');
      const content: ContentItem = {
        type: 'text',
        content: `${mentions} Hello everyone!`
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
          type: 'oauth1' as const,
          credentials: {}
        }
      };

      const invalidAdapter = new TwitterAdapter(invalidConfig);
      await invalidAdapter.initialize();
      
      const result = await invalidAdapter.authenticate();
      expect(result).toBe(false);
    });

    it('应该处理API错误', async () => {
      await adapter.initialize();
      
      // Mock client to throw error
      const mockClient = {
        tweet: jest.fn().mockRejectedValue(new Error('API Error'))
      };
      (adapter as any).client = mockClient;

      const content: ContentItem = {
        type: 'text',
        content: 'Test tweet'
      };

      const result = await adapter.post(content);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to post tweet:');
    });
  });
});
