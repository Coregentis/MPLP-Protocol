/**
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
import { ContentItem, AdapterConfig } from '../../core/types';

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
});