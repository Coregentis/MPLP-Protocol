#!/usr/bin/env node

/**
 * @fileoverview Test runner for MPLP Platform Adapters
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 MPLP Platform Adapters - Test Runner');
console.log('=====================================\n');

// Test configuration
const testConfig = {
  testTimeout: 30000,
  verbose: true,
  coverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
    '!src/index.ts'
  ]
};

// Test suites
const testSuites = [
  {
    name: 'Core Tests',
    pattern: 'src/core/__tests__/**/*.test.ts',
    description: 'Core adapter functionality tests'
  },
  {
    name: 'Twitter Adapter Tests',
    pattern: 'src/platforms/twitter/__tests__/**/*.test.ts',
    description: 'Twitter platform adapter tests'
  },
  {
    name: 'LinkedIn Adapter Tests',
    pattern: 'src/platforms/linkedin/__tests__/**/*.test.ts',
    description: 'LinkedIn platform adapter tests'
  },
  {
    name: 'GitHub Adapter Tests',
    pattern: 'src/platforms/github/__tests__/**/*.test.ts',
    description: 'GitHub platform adapter tests'
  },
  {
    name: 'Utils Tests',
    pattern: 'src/utils/__tests__/**/*.test.ts',
    description: 'Utility functions tests'
  }
];

// Create missing test files
function createMissingTestFiles() {
  console.log('📝 Creating missing test files...\n');

  // LinkedIn adapter test
  const linkedinTestPath = 'src/platforms/linkedin/__tests__/LinkedInAdapter.test.ts';
  if (!fs.existsSync(linkedinTestPath)) {
    const linkedinTestContent = `/**
 * @fileoverview LinkedInAdapter tests
 */

import { LinkedInAdapter } from '../LinkedInAdapter';
import { AdapterConfig, ContentItem } from '../../core/types';

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
});`;

    fs.writeFileSync(linkedinTestPath, linkedinTestContent);
    console.log('✅ Created LinkedIn adapter test');
  }

  // GitHub adapter test
  const githubTestPath = 'src/platforms/github/__tests__/GitHubAdapter.test.ts';
  if (!fs.existsSync(githubTestPath)) {
    const githubTestContent = `/**
 * @fileoverview GitHubAdapter tests
 */

import { GitHubAdapter } from '../GitHubAdapter';
import { AdapterConfig, ContentItem } from '../../core/types';

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
});`;

    fs.writeFileSync(githubTestPath, githubTestContent);
    console.log('✅ Created GitHub adapter test');
  }

  // Utils test
  const utilsTestPath = 'src/utils/__tests__/index.test.ts';
  if (!fs.existsSync(utilsTestPath)) {
    fs.mkdirSync('src/utils/__tests__', { recursive: true });
    const utilsTestContent = `/**
 * @fileoverview Utils tests
 */

import {
  ContentValidator,
  ContentTransformer,
  RateLimitHelper,
  ConfigHelper,
  UrlHelper,
  ErrorHelper,
  AnalyticsHelper
} from '../index';
import { ContentItem, AdapterConfig } from '../core/types';

describe('Utils测试', () => {
  describe('ContentValidator测试', () => {
    it('应该验证Twitter内容', () => {
      const validContent: ContentItem = {
        type: 'text',
        content: 'Valid tweet'
      };
      
      expect(ContentValidator.validateForPlatform(validContent, 'twitter')).toBe(true);
      
      const invalidContent: ContentItem = {
        type: 'text',
        content: 'a'.repeat(281)
      };
      
      expect(ContentValidator.validateForPlatform(invalidContent, 'twitter')).toBe(false);
    });

    it('应该验证LinkedIn内容', () => {
      const validContent: ContentItem = {
        type: 'text',
        content: 'Valid LinkedIn post'
      };
      
      expect(ContentValidator.validateForPlatform(validContent, 'linkedin')).toBe(true);
      
      const invalidContent: ContentItem = {
        type: 'text',
        content: 'a'.repeat(3001)
      };
      
      expect(ContentValidator.validateForPlatform(invalidContent, 'linkedin')).toBe(false);
    });
  });

  describe('ContentTransformer测试', () => {
    it('应该为Twitter转换内容', () => {
      const content: ContentItem = {
        type: 'text',
        content: 'Hello world',
        tags: ['test', 'twitter'],
        mentions: ['user1']
      };
      
      const transformed = ContentTransformer.transformForPlatform(content, 'twitter');
      
      expect(transformed.content).toContain('@user1');
      expect(transformed.content).toContain('#test');
      expect(transformed.content).toContain('#twitter');
    });
  });

  describe('RateLimitHelper测试', () => {
    it('应该计算指数退避延迟', () => {
      expect(RateLimitHelper.calculateBackoffDelay(0)).toBe(1000);
      expect(RateLimitHelper.calculateBackoffDelay(1)).toBe(2000);
      expect(RateLimitHelper.calculateBackoffDelay(2)).toBe(4000);
    });

    it('应该计算线性延迟', () => {
      expect(RateLimitHelper.calculateLinearDelay(0)).toBe(1000);
      expect(RateLimitHelper.calculateLinearDelay(1)).toBe(2000);
      expect(RateLimitHelper.calculateLinearDelay(2)).toBe(3000);
    });
  });

  describe('UrlHelper测试', () => {
    it('应该提取URL', () => {
      const text = 'Check out https://example.com and https://test.com';
      const urls = UrlHelper.extractUrls(text);
      
      expect(urls).toHaveLength(2);
      expect(urls).toContain('https://example.com');
      expect(urls).toContain('https://test.com');
    });

    it('应该构建平台URL', () => {
      expect(UrlHelper.buildPlatformUrl('twitter', 'status', '123'))
        .toBe('https://twitter.com/user/status/123');
      
      expect(UrlHelper.buildPlatformUrl('linkedin', 'update', '456'))
        .toBe('https://www.linkedin.com/feed/update/456');
      
      expect(UrlHelper.buildPlatformUrl('github', 'repo', 'owner/repo'))
        .toBe('https://github.com/owner/repo');
    });
  });

  describe('ErrorHelper测试', () => {
    it('应该创建错误结果', () => {
      const error = new Error('Test error');
      const result = ErrorHelper.createErrorResult(error);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('应该识别速率限制错误', () => {
      const rateLimitError = { message: 'Rate limit exceeded' };
      expect(ErrorHelper.isRateLimitError(rateLimitError)).toBe(true);
      
      const normalError = { message: 'Normal error' };
      expect(ErrorHelper.isRateLimitError(normalError)).toBe(false);
    });
  });

  describe('AnalyticsHelper测试', () => {
    it('应该计算参与率', () => {
      const metrics = {
        likes: 10,
        shares: 5,
        comments: 3,
        views: 100
      };
      
      const engagementRate = AnalyticsHelper.calculateEngagementRate(metrics);
      expect(engagementRate).toBe(18); // (10+5+3)/100 * 100
    });

    it('应该聚合指标', () => {
      const metricsMap = new Map([
        ['twitter', { likes: 10, views: 100 }],
        ['linkedin', { likes: 5, views: 50 }]
      ]);
      
      const aggregated = AnalyticsHelper.aggregateMetrics(metricsMap);
      
      expect(aggregated.likes).toBe(15);
      expect(aggregated.views).toBe(150);
      expect(aggregated.platforms).toBe(2);
    });
  });
});`;

    fs.writeFileSync(utilsTestPath, utilsTestContent);
    console.log('✅ Created utils test');
  }

  console.log('');
}

// Run tests
function runTests() {
  console.log('🧪 Running tests...\n');

  try {
    // Install dependencies if needed
    if (!fs.existsSync('node_modules')) {
      console.log('📦 Installing dependencies...');
      execSync('npm install', { stdio: 'inherit' });
      console.log('');
    }

    // Run TypeScript compilation check
    console.log('🔍 Running TypeScript check...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'inherit' });
      console.log('✅ TypeScript check passed\n');
    } catch (error) {
      console.log('❌ TypeScript check failed\n');
      throw error;
    }

    // Run tests
    console.log('🧪 Running Jest tests...');
    const jestCommand = [
      'npx jest',
      '--verbose',
      '--coverage',
      '--testTimeout=30000',
      '--collectCoverageFrom="src/**/*.ts"',
      '--collectCoverageFrom="!src/**/*.test.ts"',
      '--collectCoverageFrom="!src/**/__tests__/**"',
      '--collectCoverageFrom="!src/index.ts"'
    ].join(' ');

    execSync(jestCommand, { stdio: 'inherit' });
    
    console.log('\n🎉 All tests passed!');
    
    // Test summary
    console.log('\n📊 Test Summary:');
    console.log('================');
    testSuites.forEach(suite => {
      console.log(`✅ ${suite.name}: ${suite.description}`);
    });
    
    return true;
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    return false;
  }
}

// Main execution
function main() {
  try {
    createMissingTestFiles();
    const success = runTests();
    
    if (success) {
      console.log('\n🚀 MPLP Platform Adapters - All tests completed successfully!');
      console.log('📈 Test coverage report generated in coverage/ directory');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, runTests, createMissingTestFiles };
