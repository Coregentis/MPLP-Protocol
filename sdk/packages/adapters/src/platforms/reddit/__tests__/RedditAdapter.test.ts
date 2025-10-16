/**
 * @fileoverview RedditAdapter tests - 企业级测试套件
 */

import { RedditAdapter } from '../RedditAdapter';
import { AdapterConfig, ContentItem } from '../../../core/types';

describe('RedditAdapter测试', () => {
  let adapter: RedditAdapter;
  let config: AdapterConfig;

  beforeEach(() => {
    config = {
      platform: 'reddit',
      name: 'Test Reddit Adapter',
      version: '1.0.0',
      enabled: true,
      auth: {
        type: 'oauth2',
        credentials: {
          client_id: 'test-client-id',
          client_secret: 'test-client-secret',
          username: 'testuser',
          password: 'testpass',
          user_agent: 'MPLP-Reddit-Adapter/1.0'
        }
      },
      settings: {
        defaultSubreddit: 'test'
      }
    };

    adapter = new RedditAdapter(config);
  });

  describe('初始化测试', () => {
    it('应该正确初始化适配器', () => {
      expect(adapter.config).toEqual(config);
      expect(adapter.capabilities.canPost).toBe(true);
      expect(adapter.capabilities.canComment).toBe(true);
      expect(adapter.capabilities.maxContentLength).toBe(40000);
    });

    it('应该设置正确的平台能力', () => {
      const capabilities = adapter.capabilities;
      
      expect(capabilities.canPost).toBe(true);
      expect(capabilities.canComment).toBe(true);
      expect(capabilities.canShare).toBe(false); // Reddit doesn't have direct sharing
      expect(capabilities.canDelete).toBe(true);
      expect(capabilities.canEdit).toBe(true);
      expect(capabilities.canLike).toBe(true); // Upvote/downvote
      expect(capabilities.canFollow).toBe(false); // Reddit doesn't have following
      expect(capabilities.canMessage).toBe(false); // Private messaging is separate
      expect(capabilities.canMention).toBe(true);
      expect(capabilities.supportsPolls).toBe(true);
      expect(capabilities.supportsWebhooks).toBe(false);
      expect(capabilities.supportsModeration).toBe(true);
      expect(capabilities.supportsRealTimeMonitoring).toBe(true);
      expect(capabilities.supportsBulkOperations).toBe(true);
      expect(capabilities.supportedContentTypes).toContain('text');
      expect(capabilities.supportedContentTypes).toContain('link');
      expect(capabilities.supportedContentTypes).toContain('image');
      expect(capabilities.supportedContentTypes).toContain('video');
    });
  });

  describe('生命周期测试', () => {
    it('应该成功初始化', async () => {
      await expect(adapter.initialize()).resolves.not.toThrow();
    });

    it('应该成功认证', async () => {
      await adapter.initialize();
      await expect(adapter.authenticate()).resolves.toBe(true);
    });

    it('应该成功断开连接', async () => {
      await adapter.initialize();
      await adapter.authenticate();
      await expect(adapter.disconnect()).resolves.not.toThrow();
    });
  });

  describe('内容发布测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    afterEach(async () => {
      await adapter.disconnect();
    });

    it('应该成功发布文本帖子', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'This is a test Reddit post',
        metadata: {
          title: 'Test Post Title',
          subreddit: 'test'
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('url');
      expect(result.data).toHaveProperty('subreddit', 'test');
    });

    it('应该成功发布链接帖子', async () => {
      const content: ContentItem = {
        type: 'link',
        content: 'https://example.com',
        metadata: {
          title: 'Test Link Post',
          subreddit: 'test',
          url: 'https://example.com'
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('url');
    });

    it('应该成功发布图片帖子', async () => {
      const content: ContentItem = {
        type: 'image',
        content: 'Image post description',
        metadata: {
          title: 'Test Image Post',
          subreddit: 'test'
        },
        media: [{
          type: 'image',
          url: 'https://example.com/image.jpg',
          filename: 'test.jpg',
          size: 1024
        }]
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
    });

    it('应该处理NSFW和剧透标签', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'NSFW content',
        metadata: {
          title: 'NSFW Test Post',
          subreddit: 'test',
          nsfw: true,
          spoiler: true
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
    });

    it('应该处理帖子标签', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Post with flair',
        metadata: {
          title: 'Flair Test Post',
          subreddit: 'test',
          flair: {
            id: 'discussion',
            text: 'Discussion'
          }
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
    });
  });

  describe('互动功能测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    afterEach(async () => {
      await adapter.disconnect();
    });

    it('应该成功评论帖子', async () => {
      const result = await adapter.comment('test_post_123', 'This is a test comment');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('url');
    });

    it('应该成功点赞帖子', async () => {
      const result = await adapter.like('test_post_123');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id', 'test_post_123');
      expect(result.data).toHaveProperty('liked', true);
    });

    it('应该成功取消点赞', async () => {
      const result = await adapter.unlike('test_post_123');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id', 'test_post_123');
      expect(result.data).toHaveProperty('liked', false);
    });

    it('应该成功删除帖子', async () => {
      const result = await adapter.delete('test_post_123');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id', 'test_post_123');
      expect(result.data).toHaveProperty('deleted', true);
    });

    it('分享功能应该抛出错误', async () => {
      await expect(adapter.share('test_post_123')).rejects.toThrow('Platform reddit does not support sharing');
    });
  });

  describe('数据获取测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    afterEach(async () => {
      await adapter.disconnect();
    });

    it('应该获取用户资料', async () => {
      const result = await adapter.getProfile('testuser');

      expect(result).toHaveProperty('id', 'testuser');
      expect(result).toHaveProperty('username', 'testuser');
      expect(result).toHaveProperty('displayName', 'testuser');
      expect(result).toHaveProperty('karma');
      expect(result).toHaveProperty('created');
    });

    it('应该获取帖子内容', async () => {
      const result = await adapter.getContent('test_post_123');

      expect(result).toHaveProperty('id', 'test_post_123');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('author');
      expect(result).toHaveProperty('metadata');
    });

    it('应该获取帖子分析数据', async () => {
      const result = await adapter.getAnalytics('test_post_123');

      expect(result).toHaveProperty('id', 'test_post_123');
      expect(result).toHaveProperty('upvotes');
      expect(result).toHaveProperty('comments');
      expect(result).toHaveProperty('views');
      expect(result).toHaveProperty('crossposts');
    });
  });

  describe('内容验证测试', () => {
    it('应该验证有效内容', () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Valid Reddit post',
        metadata: {
          title: 'Valid Title',
          subreddit: 'test'
        }
      };

      expect(() => adapter.validateContent(content)).not.toThrow();
    });

    it('应该拒绝过长的内容', async () => {
      const longContent = 'a'.repeat(50000); // Exceeds 40000 character limit
      const content: ContentItem = {
        type: 'text',
        content: longContent,
        metadata: {
          title: 'Long Content Test',
          subreddit: 'test'
        }
      };

      const result = await adapter.validateContent(content);
      expect(result).toBe(false);
    });

    it('应该拒绝缺少标题的内容', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Content without title',
        metadata: {
          subreddit: 'test'
        }
      };

      try {
        await adapter.validateContent(content);
        fail('Expected validation to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Title is required');
      }
    });

    it('应该拒绝缺少子版块的内容', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Content without subreddit',
        metadata: {
          title: 'Test Title'
        }
      };

      try {
        await adapter.validateContent(content);
        fail('Expected validation to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Subreddit is required');
      }
    });
  });

  describe('错误处理测试', () => {
    it('应该处理认证失败', async () => {
      const invalidConfig = {
        ...config,
        auth: {
          type: 'oauth2' as const,
          credentials: {
            client_id: '',
            client_secret: '',
            username: '',
            password: '',
            user_agent: ''
          }
        }
      };

      const invalidAdapter = new RedditAdapter(invalidConfig);

      await expect(invalidAdapter.initialize()).rejects.toThrow('Missing required Reddit authentication credentials');
    });

    it('应该处理API错误', async () => {
      await adapter.initialize();
      await adapter.authenticate();

      // 模拟API错误
      const content: ContentItem = {
        type: 'text',
        content: 'Test content',
        metadata: {
          title: 'Test Title',
          subreddit: 'nonexistent_subreddit_error'
        }
      };

      const result = await adapter.post(content);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Subreddit does not exist');
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

    describe('版主功能测试', () => {
      it('应该成功审批帖子', async () => {
        const result = await adapter.moderatePost('test_post_123', 'approve', 'Good content');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('postId', 'test_post_123');
        expect(result.data).toHaveProperty('action', 'approve');
        expect(result.data).toHaveProperty('reason', 'Good content');
        expect(result.data).toHaveProperty('moderatedBy');
      });

      it('应该成功移除帖子', async () => {
        const result = await adapter.moderatePost('test_post_123', 'remove', 'Violates rules');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('action', 'remove');
        expect(result.data).toHaveProperty('reason', 'Violates rules');
      });

      it('应该成功批量版主操作', async () => {
        const postIds = ['post1', 'post2', 'post3'];
        const result = await adapter.bulkModerate(postIds, 'approve', 'Bulk approval');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('total', 3);
        expect(result.data).toHaveProperty('action', 'approve');
        expect(result.data).toHaveProperty('reason', 'Bulk approval');
      });

      it('应该拒绝过多的批量操作', async () => {
        const postIds = Array.from({ length: 101 }, (_, i) => `post${i}`);
        const result = await adapter.bulkModerate(postIds, 'approve');

        expect(result.success).toBe(false);
        expect(result.error).toContain('Cannot moderate more than 100 posts');
      });
    });

    describe('实时监控测试', () => {
      it('应该成功启动监控', async () => {
        const subreddits = ['test', 'programming'];
        const keywords = ['bug', 'issue'];
        const callback = jest.fn();

        const result = await adapter.startAdvancedMonitoring(subreddits, keywords, callback);

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('subreddits', subreddits);
        expect(result.data).toHaveProperty('keywords', keywords);
        expect(result.data).toHaveProperty('status', 'active');

        // 清理
        await adapter.stopAdvancedMonitoring();
      });

      it('应该成功停止监控', async () => {
        // 先启动监控
        await adapter.startAdvancedMonitoring(['test'], ['keyword'], jest.fn());

        const result = await adapter.stopAdvancedMonitoring();

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('status', 'stopped');
      });

      it('应该处理重复启动监控', async () => {
        await adapter.startAdvancedMonitoring(['test'], ['keyword'], jest.fn());

        const result = await adapter.startAdvancedMonitoring(['test2'], ['keyword2'], jest.fn());

        expect(result.success).toBe(false);
        expect(result.error).toContain('Monitoring is already active');

        // 清理
        await adapter.stopAdvancedMonitoring();
      });

      it('应该处理停止未启动的监控', async () => {
        const result = await adapter.stopAdvancedMonitoring();

        expect(result.success).toBe(false);
        expect(result.error).toContain('Monitoring is not active');
      });
    });

    describe('高级分析测试', () => {
      it('应该获取日分析数据', async () => {
        const result = await adapter.getAdvancedAnalytics('test', 'day');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('subreddit', 'test');
        expect(result.data).toHaveProperty('timeRange', 'day');
        expect(result.data).toHaveProperty('subscribers');
        expect(result.data).toHaveProperty('activeUsers');
        expect(result.data).toHaveProperty('postsCount');
        expect(result.data).toHaveProperty('commentsCount');
        expect(result.data).toHaveProperty('topPosts');
        expect(result.data).toHaveProperty('engagementRate');
        expect(result.data).toHaveProperty('moderationActions');
      });

      it('应该获取周分析数据', async () => {
        const result = await adapter.getAdvancedAnalytics('programming', 'week');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('timeRange', 'week');
      });

      it('应该获取月分析数据', async () => {
        const result = await adapter.getAdvancedAnalytics('technology', 'month');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('timeRange', 'month');
      });
    });

    describe('缓存管理测试', () => {
      it('应该成功清理缓存', () => {
        expect(() => adapter.clearCache()).not.toThrow();
      });

      it('应该获取缓存统计', () => {
        const stats = adapter.getCacheStats();

        expect(stats).toHaveProperty('users');
        expect(stats).toHaveProperty('subreddits');
        expect(stats).toHaveProperty('posts');
        expect(typeof stats.users).toBe('number');
        expect(typeof stats.subreddits).toBe('number');
        expect(typeof stats.posts).toBe('number');
      });
    });
  });
});
