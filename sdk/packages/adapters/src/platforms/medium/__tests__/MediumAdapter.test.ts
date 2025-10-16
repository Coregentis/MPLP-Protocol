/**
 * @fileoverview MediumAdapter tests - 企业级测试套件
 */

import { MediumAdapter } from '../MediumAdapter';
import { AdapterConfig, ContentItem } from '../../../core/types';

describe('MediumAdapter测试', () => {
  let adapter: MediumAdapter;
  let config: AdapterConfig;

  beforeEach(() => {
    config = {
      platform: 'medium',
      name: 'Test Medium Adapter',
      version: '1.0.0',
      enabled: true,
      auth: {
        type: 'oauth2',
        credentials: {
          access_token: 'test-access-token',
          client_id: 'test-client-id',
          client_secret: 'test-client-secret'
        }
      },
      settings: {
        defaultPublishStatus: 'draft'
      }
    };

    adapter = new MediumAdapter(config);
  });

  describe('初始化测试', () => {
    it('应该正确初始化适配器', () => {
      expect(adapter.config).toEqual(config);
      expect(adapter.capabilities.canPost).toBe(true);
      expect(adapter.capabilities.canComment).toBe(false);
      expect(adapter.capabilities.maxContentLength).toBe(100000);
    });

    it('应该设置正确的平台能力', () => {
      const capabilities = adapter.capabilities;
      
      expect(capabilities.canPost).toBe(true);
      expect(capabilities.canComment).toBe(false); // Medium doesn't support comments via API
      expect(capabilities.canShare).toBe(false); // Medium doesn't support direct sharing
      expect(capabilities.canDelete).toBe(false); // Medium doesn't allow deletion via API
      expect(capabilities.canEdit).toBe(true); // Limited editing capabilities
      expect(capabilities.canLike).toBe(false); // Medium doesn't expose likes via API
      expect(capabilities.canFollow).toBe(false); // Medium doesn't expose following via API
      expect(capabilities.canMessage).toBe(false); // No messaging API
      expect(capabilities.canMention).toBe(false); // No mention system
      expect(capabilities.supportsPolls).toBe(false);
      expect(capabilities.supportsScheduling).toBe(false);
      expect(capabilities.supportsAnalytics).toBe(true);
      expect(capabilities.supportsWebhooks).toBe(false);
      expect(capabilities.supportsContentManagement).toBe(true);
      expect(capabilities.supportsPublicationManagement).toBe(true);
      expect(capabilities.supportsBulkOperations).toBe(true);
      expect(capabilities.supportedContentTypes).toContain('text');
      expect(capabilities.supportedContentTypes).toContain('image');
      expect(capabilities.maxContentLength).toBe(100000);
      expect(capabilities.maxMediaSize).toBe(25 * 1024 * 1024);
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

    it('应该成功发布文章', async () => {
      const content: ContentItem = {
        type: 'text',
        content: '# Test Article\n\nThis is a test Medium article with **markdown** formatting.',
        metadata: {
          title: 'Test Article Title',
          tags: ['test', 'article'],
          publishStatus: 'draft'
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('url');
      expect(result.data).toHaveProperty('publishStatus', 'draft');
    });

    it('应该成功发布到出版物', async () => {
      const content: ContentItem = {
        type: 'text',
        content: '# Publication Article\n\nThis article will be published to a publication.',
        metadata: {
          title: 'Publication Article Title',
          tags: ['publication', 'test'],
          publishStatus: 'public',
          publicationId: 'pub_123'
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('publicationId', 'pub_123');
      expect(result.data).toHaveProperty('publishStatus', 'public');
    });

    it('应该处理不同的发布状态', async () => {
      const content: ContentItem = {
        type: 'text',
        content: '# Draft Article\n\nThis is a draft article.',
        metadata: {
          title: 'Draft Article',
          publishStatus: 'unlisted'
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('publishStatus', 'unlisted');
    });

    it('应该处理文章标签', async () => {
      const content: ContentItem = {
        type: 'text',
        content: '# Tagged Article\n\nThis article has multiple tags.',
        metadata: {
          title: 'Tagged Article',
          tags: ['javascript', 'programming', 'tutorial', 'web-development', 'coding']
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
    });

    it('应该处理许可证设置', async () => {
      const content: ContentItem = {
        type: 'text',
        content: '# Licensed Article\n\nThis article has a specific license.',
        metadata: {
          title: 'Licensed Article',
          license: 'cc-40-by'
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('id');
    });
  });

  describe('不支持的功能测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    afterEach(async () => {
      await adapter.disconnect();
    });

    it('评论功能应该抛出错误', async () => {
      await expect(adapter.comment('test_post_123', 'Test comment')).rejects.toThrow('Platform medium does not support commenting');
    });

    it('分享功能应该抛出错误', async () => {
      await expect(adapter.share('test_post_123')).rejects.toThrow('Platform medium does not support sharing');
    });

    it('删除功能应该抛出错误', async () => {
      await expect(adapter.delete('test_post_123')).rejects.toThrow('Platform medium does not support deletion');
    });

    it('点赞功能应该抛出错误', async () => {
      await expect(adapter.like('test_post_123')).rejects.toThrow('Platform medium does not support liking');
    });

    it('取消点赞功能应该抛出错误', async () => {
      const result = await adapter.unlike('test_post_123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Medium does not support unlikes');
    });

    it('关注功能应该抛出错误', async () => {
      await expect(adapter.follow('test_user_123')).rejects.toThrow('Platform medium does not support following');
    });

    it('取消关注功能应该抛出错误', async () => {
      const result = await adapter.unfollow('test_user_123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Medium does not support unfollowing');
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
      expect(result).toHaveProperty('displayName', 'Test User');
      expect(result).toHaveProperty('bio');
      expect(result).toHaveProperty('avatar');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('metadata');
    });

    it('应该获取文章内容', async () => {
      const result = await adapter.getContent('test_post_123');
      
      expect(result).toHaveProperty('id', 'test_post_123');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('author');
      expect(result).toHaveProperty('metadata');
    });

    it('应该获取文章分析数据', async () => {
      const result = await adapter.getAnalytics('test_post_123');
      
      expect(result).toHaveProperty('id', 'test_post_123');
      expect(result).toHaveProperty('views');
      expect(result).toHaveProperty('reads');
      expect(result).toHaveProperty('fans');
      expect(result).toHaveProperty('claps');
    });

    it('应该搜索文章', async () => {
      const results = await adapter.search('javascript programming');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('title');
      expect(results[0]).toHaveProperty('content');
    });
  });

  describe('内容验证测试', () => {
    it('应该验证有效内容', () => {
      const content: ContentItem = {
        type: 'text',
        content: '# Valid Article\n\nThis is a valid Medium article.',
        metadata: {
          title: 'Valid Article Title'
        }
      };

      expect(() => adapter.validateContent(content)).not.toThrow();
    });

    it('应该拒绝过长的内容', async () => {
      const longContent = 'a'.repeat(150000); // Exceeds 100000 character limit
      const content: ContentItem = {
        type: 'text',
        content: longContent,
        metadata: {
          title: 'Long Content Test'
        }
      };

      const result = await adapter.validateContent(content);
      expect(result).toBe(false);
    });

    it('应该拒绝缺少标题的内容', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Content without title',
        metadata: {}
      };

      try {
        await adapter.validateContent(content);
        fail('Expected validation to throw an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Title is required for Medium articles');
      }
    });

    it('应该拒绝过多的标签', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Content with too many tags',
        metadata: {
          title: 'Test Title',
          tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'] // Medium allows max 5 tags
        }
      };

      await expect(adapter.validateContent(content)).rejects.toThrow('Too many tags');
    });
  });

  describe('错误处理测试', () => {
    it('应该处理认证失败', async () => {
      const invalidConfig = {
        ...config,
        auth: {
          type: 'oauth2' as const,
          credentials: {
            access_token: ''
          }
        }
      };

      const invalidAdapter = new MediumAdapter(invalidConfig);
      await expect(invalidAdapter.initialize()).rejects.toThrow('Missing required Medium access token');
    });

    it('应该处理API错误', async () => {
      await adapter.initialize();
      await adapter.authenticate();

      // 模拟API错误
      const content: ContentItem = {
        type: 'text',
        content: 'Test content',
        metadata: {
          title: 'Error Test',
          publicationId: 'invalid_publication_id'
        }
      };

      const result = await adapter.post(content);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid publication ID');
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

    describe('内容管理测试', () => {
      it('应该成功保存草稿', async () => {
        const result = await adapter.manageContent('draft', 'test_post_123', {
          title: 'Draft Article',
          content: 'This is a draft article',
          tags: ['draft', 'test']
        });

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('postId', 'test_post_123');
        expect(result.data).toHaveProperty('action', 'draft');
        expect(result.data).toHaveProperty('managedBy');
      });

      it('应该成功安排发布', async () => {
        const publishAt = new Date(Date.now() + 86400000).toISOString(); // 1 day later
        const result = await adapter.manageContent('schedule', 'test_post_123', { publishAt });

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('action', 'schedule');
      });

      it('应该成功发布草稿', async () => {
        const result = await adapter.manageContent('publish', 'test_post_123', {
          publishStatus: 'public'
        });

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('action', 'publish');
      });

      it('应该成功归档文章', async () => {
        const result = await adapter.manageContent('archive', 'test_post_123');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('action', 'archive');
      });
    });

    describe('批量操作测试', () => {
      it('应该成功批量发布', async () => {
        const postIds = ['post1', 'post2', 'post3'];
        const result = await adapter.bulkContentOperation('publish', postIds);

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('total', 3);
        expect(result.data).toHaveProperty('operation', 'publish');
        expect(result.data).toHaveProperty('successful');
      });

      it('应该成功批量归档', async () => {
        const postIds = ['post1', 'post2'];
        const result = await adapter.bulkContentOperation('archive', postIds);

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('operation', 'archive');
      });

      it('应该成功批量更新标签', async () => {
        const postIds = ['post1', 'post2'];
        const result = await adapter.bulkContentOperation('update_tags', postIds, {
          tags: ['updated', 'bulk', 'operation']
        });

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('operation', 'update_tags');
      });

      it('应该拒绝过多的批量操作', async () => {
        const postIds = Array.from({ length: 51 }, (_, i) => `post${i}`);
        const result = await adapter.bulkContentOperation('publish', postIds);

        expect(result.success).toBe(false);
        expect(result.error).toContain('Cannot process more than 50 posts');
      });
    });

    describe('出版物管理测试', () => {
      it('应该获取出版物统计', async () => {
        const result = await adapter.managePublication('pub_123', 'get_stats');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('publicationId', 'pub_123');
        expect(result.data).toHaveProperty('action', 'get_stats');
        expect(result.data.result).toHaveProperty('followers');
        expect(result.data.result).toHaveProperty('totalPosts');
        expect(result.data.result).toHaveProperty('totalViews');
      });

      it('应该获取出版物贡献者', async () => {
        const result = await adapter.managePublication('pub_123', 'get_contributors');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('action', 'get_contributors');
        expect(result.data.result).toHaveProperty('contributors');
        expect(Array.isArray(result.data.result.contributors)).toBe(true);
      });

      it('应该获取出版物投稿', async () => {
        const result = await adapter.managePublication('pub_123', 'manage_submissions');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('action', 'manage_submissions');
        expect(result.data.result).toHaveProperty('submissions');
        expect(Array.isArray(result.data.result.submissions)).toBe(true);
      });
    });

    describe('高级分析测试', () => {
      it('应该获取日分析数据', async () => {
        const result = await adapter.getAdvancedAnalytics('test_post_123', 'day');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('postId', 'test_post_123');
        expect(result.data).toHaveProperty('timeRange', 'day');
        expect(result.data).toHaveProperty('views');
        expect(result.data).toHaveProperty('reads');
        expect(result.data).toHaveProperty('readRatio');
        expect(result.data).toHaveProperty('fans');
        expect(result.data).toHaveProperty('claps');
        expect(result.data).toHaveProperty('referrers');
        expect(result.data).toHaveProperty('countries');
        expect(result.data).toHaveProperty('memberTraction');
        expect(result.data).toHaveProperty('totalEarnings');
      });

      it('应该获取周分析数据', async () => {
        const result = await adapter.getAdvancedAnalytics('test_post_123', 'week');

        expect(result.success).toBe(true);
        expect(result.data).toHaveProperty('timeRange', 'week');
      });

      it('应该获取月分析数据', async () => {
        const result = await adapter.getAdvancedAnalytics('test_post_123', 'month');

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
        expect(stats).toHaveProperty('publications');
        expect(stats).toHaveProperty('posts');
        expect(typeof stats.users).toBe('number');
        expect(typeof stats.publications).toBe('number');
        expect(typeof stats.posts).toBe('number');
      });

      it('应该获取草稿统计', () => {
        const stats = adapter.getDraftStats();

        expect(stats).toHaveProperty('drafts');
        expect(stats).toHaveProperty('scheduled');
        expect(typeof stats.drafts).toBe('number');
        expect(typeof stats.scheduled).toBe('number');
      });
    });
  });
});
