/**
 * @fileoverview LinkedInAdapter tests
 */

import { LinkedInAdapter, LinkedInLearningConfig, LinkedInAdvancedAnalyticsConfig, LinkedInCompanyPageConfig } from '../LinkedInAdapter';
import { AdapterConfig, ContentItem } from '../../../core/types';

describe('LinkedInAdapter测试', () => {
  let adapter: LinkedInAdapter;
  let config: AdapterConfig;

  beforeEach(() => {
    config = {
      platform: 'linkedin',
      name: 'Test LinkedIn Adapter',
      version: '1.0.0',
      enabled: true,
      auth: {
        type: 'oauth2',
        credentials: {
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret',
          accessToken: 'test-access-token'
        }
      }
    };

    adapter = new LinkedInAdapter(config);
  });

  describe('初始化测试', () => {
    it('应该正确初始化适配器', () => {
      expect(adapter.config).toEqual(config);
      expect(adapter.capabilities.canPost).toBe(true);
      expect(adapter.capabilities.maxContentLength).toBe(3000);
    });

    it('应该设置正确的平台能力', () => {
      const capabilities = adapter.capabilities;
      
      expect(capabilities.canPost).toBe(true);
      expect(capabilities.canComment).toBe(true);
      expect(capabilities.canShare).toBe(true);
      expect(capabilities.canLike).toBe(true);
      expect(capabilities.canFollow).toBe(true);
      expect(capabilities.supportsAnalytics).toBe(true);
      expect(capabilities.supportsWebhooks).toBe(false);
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

    it('应该成功发布LinkedIn帖子', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Hello LinkedIn! This is a professional update.'
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.platform).toBe('linkedin');
    });

    it('应该处理带链接的帖子', async () => {
      const content: ContentItem = {
        type: 'link',
        content: 'Check out this article',
        metadata: {
          url: 'https://example.com/article',
          title: 'Great Article',
          description: 'This is a great article'
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

    it('应该成功评论帖子', async () => {
      const result = await adapter.comment('post123', 'Great post!');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });

    it('应该成功分享帖子', async () => {
      const result = await adapter.share('post123', 'Sharing this great content');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });

    it('应该成功点赞帖子', async () => {
      const result = await adapter.like('post123');
      
      expect(result.success).toBe(true);
      expect(result.data?.platform).toBe('linkedin');
    });
  });

  describe('数据获取测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该获取用户资料', async () => {
      const profile = await adapter.getProfile();
      
      expect(profile.username).toBe('johndoe');
      expect(profile.displayName).toBe('John Doe');
      expect(profile.bio).toBe('Software Engineer at Tech Company');
    });

    it('应该获取帖子内容', async () => {
      const content = await adapter.getContent('post123');
      
      expect(content.id).toBe('post123');
      expect(content.type).toBe('text');
      expect(content.content).toBe('Sample LinkedIn post content');
    });

    it('应该搜索帖子', async () => {
      const results = await adapter.search('technology');
      
      expect(results).toHaveLength(1);
      expect(results[0].content).toContain('technology');
    });
  });

  describe('企业级功能测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该成功配置LinkedIn Learning', async () => {
      const learningConfig: LinkedInLearningConfig = {
        apiKey: 'test-learning-api-key',
        organizationId: 'org-12345',
        features: {
          courseRecommendations: true,
          learningPaths: true,
          skillAssessments: true,
          certificates: true,
          analytics: true
        },
        integrations: {
          lms: 'Cornerstone',
          hrSystem: 'Workday',
          performanceManagement: 'BambooHR'
        }
      };

      await expect(adapter.configureLearning(learningConfig)).resolves.not.toThrow();
    });

    it('应该获取课程推荐', async () => {
      const learningConfig: LinkedInLearningConfig = {
        apiKey: 'test-api-key',
        organizationId: 'org-12345',
        features: {
          courseRecommendations: true,
          learningPaths: false,
          skillAssessments: false,
          certificates: false,
          analytics: false
        },
        integrations: {}
      };

      await adapter.configureLearning(learningConfig);
      const recommendations = await adapter.getCourseRecommendations('user-123', ['JavaScript', 'Leadership']);

      expect(recommendations).toHaveLength(2);
      expect(recommendations[0]).toHaveProperty('courseId');
      expect(recommendations[0]).toHaveProperty('title');
      expect(recommendations[0]).toHaveProperty('skills');
      expect(recommendations[0]).toHaveProperty('relevanceScore');
    });

    it('应该成功配置高级分析', async () => {
      const analyticsConfig: LinkedInAdvancedAnalyticsConfig = {
        metrics: ['impressions', 'clicks', 'shares', 'comments'],
        reportingFrequency: 'weekly',
        customDashboards: [
          {
            name: 'Executive Dashboard',
            widgets: [
              { type: 'engagement-chart', config: { timeRange: '30d' } },
              { type: 'audience-growth', config: { showTrend: true } }
            ]
          }
        ],
        alerts: [
          { metric: 'engagement_rate', threshold: 5.0, action: 'email' },
          { metric: 'follower_growth', threshold: -10, action: 'slack' }
        ]
      };

      await expect(adapter.configureAdvancedAnalytics(analyticsConfig)).resolves.not.toThrow();
    });

    it('应该获取高级分析数据', async () => {
      const analyticsConfig: LinkedInAdvancedAnalyticsConfig = {
        metrics: ['impressions', 'clicks'],
        reportingFrequency: 'daily',
        customDashboards: [],
        alerts: []
      };

      await adapter.configureAdvancedAnalytics(analyticsConfig);
      const analytics = await adapter.getAdvancedAnalytics({
        start: '2023-01-01',
        end: '2023-12-31'
      });

      expect(analytics.period).toBeDefined();
      expect(analytics.engagement).toBeDefined();
      expect(analytics.audience).toBeDefined();
      expect(analytics.content).toBeDefined();
      expect(typeof analytics.engagement.totalImpressions).toBe('number');
      expect(typeof analytics.audience.totalFollowers).toBe('number');
      expect(Array.isArray(analytics.content.topPosts)).toBe(true);
    });

    it('应该成功配置企业页面管理', async () => {
      const companyPageConfig: LinkedInCompanyPageConfig = {
        companyId: 'company-12345',
        permissions: {
          contentManagement: true,
          analytics: true,
          advertising: true,
          employeeAdvocacy: true
        },
        branding: {
          logo: 'https://example.com/logo.png',
          banner: 'https://example.com/banner.jpg',
          colors: {
            primary: '#0077B5',
            secondary: '#00A0DC'
          }
        },
        automation: {
          autoPost: true,
          contentApproval: true,
          responseTemplates: true
        }
      };

      await expect(adapter.configureCompanyPage(companyPageConfig)).resolves.not.toThrow();
    });
  });
});