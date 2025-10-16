/**
 * @fileoverview GitHubAdapter tests
 */

import { GitHubAdapter, GitHubEnterpriseConfig, AdvancedWorkflowConfig, CodeReviewAutomationConfig } from '../GitHubAdapter';
import { AdapterConfig, ContentItem } from '../../../core/types';

describe('GitHubAdapter测试', () => {
  let adapter: GitHubAdapter;
  let config: AdapterConfig;

  beforeEach(() => {
    config = {
      platform: 'github',
      name: 'Test GitHub Adapter',
      version: '1.0.0',
      enabled: true,
      auth: {
        type: 'bearer',
        credentials: {
          token: 'test-github-token'
        }
      },
      settings: {
        defaultRepository: 'owner/repo'
      }
    };

    adapter = new GitHubAdapter(config);
  });

  describe('初始化测试', () => {
    it('应该正确初始化适配器', () => {
      expect(adapter.config).toEqual(config);
      expect(adapter.capabilities.canPost).toBe(true);
      expect(adapter.capabilities.maxContentLength).toBe(65536);
    });

    it('应该设置正确的平台能力', () => {
      const capabilities = adapter.capabilities;
      
      expect(capabilities.canPost).toBe(true);
      expect(capabilities.canComment).toBe(true);
      expect(capabilities.canEdit).toBe(true);
      expect(capabilities.canLike).toBe(true);
      expect(capabilities.canFollow).toBe(true);
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

    it('应该成功创建Issue', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'This is a bug report',
        metadata: {
          title: 'Bug: Something is broken',
          repository: 'owner/repo'
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.number).toBeDefined();
      expect(result.data?.platform).toBe('github');
    });

    it('应该成功创建Pull Request', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'This PR fixes the bug',
        metadata: {
          type: 'pull_request',
          title: 'Fix: Resolve the bug',
          head: 'feature-branch',
          base: 'main',
          repository: 'owner/repo'
        }
      };

      const result = await adapter.post(content);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });

    it('应该成功创建Release', async () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Release notes for v1.0.0',
        metadata: {
          type: 'release',
          title: 'Version 1.0.0',
          tag: 'v1.0.0',
          repository: 'owner/repo'
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

    it('应该成功评论Issue', async () => {
      const result = await adapter.comment('owner/repo#123', 'This is a comment');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });

    it('应该成功Star仓库', async () => {
      const result = await adapter.like('owner/repo#123');
      
      expect(result.success).toBe(true);
      expect(result.data?.repository).toBe('owner/repo');
    });

    it('应该成功关注用户', async () => {
      const result = await adapter.follow('username');
      
      expect(result.success).toBe(true);
      expect(result.data?.userId).toBe('username');
    });
  });

  describe('数据获取测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该获取用户资料', async () => {
      const profile = await adapter.getProfile('testuser');
      
      expect(profile.username).toBe('testuser');
      expect(profile.displayName).toBe('Test User');
      expect(profile.bio).toBe('Software developer');
    });

    it('应该获取Issue内容', async () => {
      const content = await adapter.getContent('owner/repo#123');
      
      expect(content.id).toBe('123');
      expect(content.type).toBe('text');
      expect(content.metadata?.title).toBe('Sample Issue');
    });

    it('应该搜索Issues', async () => {
      const results = await adapter.search('bug');
      
      expect(results).toHaveLength(1);
      expect(results[0].content).toContain('bug');
    });
  });

  describe('企业级功能测试', () => {
    beforeEach(async () => {
      await adapter.initialize();
      await adapter.authenticate();
    });

    it('应该成功配置GitHub Enterprise', async () => {
      const enterpriseConfig: GitHubEnterpriseConfig = {
        baseUrl: 'https://github.enterprise.com/api/v3',
        apiVersion: '2022-11-28',
        timeout: 30000,
        retries: 3,
        sso: {
          enabled: true,
          provider: 'SAML',
          domain: 'enterprise.com'
        },
        compliance: {
          auditLogging: true,
          dataRetention: 365,
          encryptionAtRest: true
        }
      };

      await expect(adapter.configureEnterprise(enterpriseConfig)).resolves.not.toThrow();
    });

    it('应该成功设置高级自动化工作流', async () => {
      const workflowConfig: AdvancedWorkflowConfig = {
        triggers: [
          {
            event: 'pull_request',
            conditions: { target_branch: 'main' },
            actions: [
              { type: 'run_tests', config: { suite: 'full' } },
              { type: 'security_scan', config: { level: 'strict' } }
            ]
          }
        ],
        approvalRules: {
          requiredReviewers: 2,
          dismissStaleReviews: true,
          requireCodeOwnerReviews: true,
          restrictPushes: true
        },
        automatedTesting: {
          runOnPR: true,
          runOnPush: true,
          testSuites: ['unit', 'integration', 'e2e'],
          coverageThreshold: 80
        }
      };

      await expect(adapter.setupAdvancedWorkflow(workflowConfig)).resolves.not.toThrow();
    });

    it('应该成功配置代码审查自动化', async () => {
      const reviewConfig: CodeReviewAutomationConfig = {
        autoAssignment: {
          enabled: true,
          algorithm: 'expertise-based',
          reviewerPool: ['reviewer1', 'reviewer2', 'reviewer3'],
          minReviewers: 1,
          maxReviewers: 3
        },
        qualityGates: {
          linting: true,
          testing: true,
          security: true,
          performance: true
        },
        notifications: {
          slack: '#dev-team',
          email: ['team@company.com'],
          teams: 'DevTeam'
        }
      };

      await expect(adapter.setupCodeReviewAutomation(reviewConfig)).resolves.not.toThrow();
    });

    it('应该获取企业级分析数据', async () => {
      const analytics = await adapter.getEnterpriseAnalytics({
        org: 'test-org',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        metrics: ['repositories', 'users', 'pullRequests']
      });

      expect(analytics.organization).toBe('test-org');
      expect(analytics.period).toBeDefined();
      expect(analytics.metrics).toBeDefined();
      expect(analytics.compliance).toBeDefined();
      expect(analytics.performance).toBeDefined();
      expect(typeof analytics.metrics.totalRepositories).toBe('number');
      expect(typeof analytics.metrics.activeUsers).toBe('number');
      expect(typeof analytics.metrics.pullRequests).toBe('number');
    });
  });
});