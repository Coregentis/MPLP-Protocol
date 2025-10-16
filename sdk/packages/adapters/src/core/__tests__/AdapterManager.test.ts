/**
 * @fileoverview AdapterManager tests
 */

import { AdapterManager } from '../AdapterManager';
import { TwitterAdapter } from '../../platforms/twitter/TwitterAdapter';
import { GitHubAdapter } from '../../platforms/github/GitHubAdapter';
import { AdapterConfig, ContentItem } from '../types';

describe('AdapterManager测试', () => {
  let manager: AdapterManager;
  let twitterConfig: AdapterConfig;
  let githubConfig: AdapterConfig;

  beforeEach(() => {
    manager = new AdapterManager();
    
    twitterConfig = {
      platform: 'twitter',
      name: 'Test Twitter',
      version: '1.0.0',
      enabled: true,
      auth: {
        type: 'oauth1',
        credentials: {
          api_key: 'test-api-key',
          api_secret: 'test-api-secret',
          access_token: 'test-access-token',
          access_token_secret: 'test-access-token-secret',
          bearer_token: 'test-bearer-token'
        }
      }
    };

    githubConfig = {
      platform: 'github',
      name: 'Test GitHub',
      version: '1.0.0',
      enabled: true,
      auth: {
        type: 'bearer',
        credentials: {
          token: 'test-token'
        }
      },
      settings: {
        defaultRepository: 'test-owner/test-repo'
      }
    };
  });

  describe('适配器管理测试', () => {
    it('应该添加适配器', async () => {
      const adapter = new TwitterAdapter(twitterConfig);
      
      await manager.addAdapter('twitter', adapter);
      
      expect(manager.adapters.size).toBe(1);
      expect(manager.getAdapter('twitter')).toBe(adapter);
    });

    it('应该移除适配器', async () => {
      const adapter = new TwitterAdapter(twitterConfig);
      
      await manager.addAdapter('twitter', adapter);
      expect(manager.adapters.size).toBe(1);
      
      await manager.removeAdapter('twitter');
      expect(manager.adapters.size).toBe(0);
      expect(manager.getAdapter('twitter')).toBeUndefined();
    });

    it('应该获取指定平台的适配器', async () => {
      const twitterAdapter = new TwitterAdapter(twitterConfig);
      const githubAdapter = new GitHubAdapter(githubConfig);
      
      await manager.addAdapter('twitter1', twitterAdapter);
      await manager.addAdapter('twitter2', new TwitterAdapter(twitterConfig));
      await manager.addAdapter('github1', githubAdapter);
      
      const twitterAdapters = manager.getAdaptersByPlatform('twitter');
      expect(twitterAdapters).toHaveLength(2);
      
      const githubAdapters = manager.getAdaptersByPlatform('github');
      expect(githubAdapters).toHaveLength(1);
    });
  });

  describe('内容发布测试', () => {
    it('应该向所有适配器发布内容', async () => {
      const twitterAdapter = new TwitterAdapter(twitterConfig);
      const githubAdapter = new GitHubAdapter(githubConfig);
      
      await manager.addAdapter('twitter', twitterAdapter);
      await manager.addAdapter('github', githubAdapter);
      
      const content: ContentItem = {
        type: 'text',
        content: 'Test post content'
      };
      
      const results = await manager.postToAll(content);
      
      expect(results.size).toBe(2);
      expect(results.get('twitter')?.success).toBe(true);
      expect(results.get('github')?.success).toBe(true);
    });

    it('应该向指定平台发布内容', async () => {
      const twitterAdapter = new TwitterAdapter(twitterConfig);
      const githubAdapter = new GitHubAdapter(githubConfig);
      
      await manager.addAdapter('twitter', twitterAdapter);
      await manager.addAdapter('github', githubAdapter);
      
      const content: ContentItem = {
        type: 'text',
        content: 'Test post content'
      };
      
      const results = await manager.postToMultiple(content, ['twitter']);
      
      expect(results.size).toBe(1);
      expect(results.get('twitter')?.success).toBe(true);
      expect(results.get('github')).toBeUndefined();
    });

    it('应该处理不支持发布的适配器', async () => {
      // Create a mock adapter that doesn't support posting
      const mockAdapter = new TwitterAdapter(twitterConfig);
      mockAdapter.capabilities.canPost = false;
      
      await manager.addAdapter('mock', mockAdapter);
      
      const content: ContentItem = {
        type: 'text',
        content: 'Test post content'
      };
      
      const results = await manager.postToAll(content);
      
      expect(results.size).toBe(1);
      expect(results.get('mock')?.success).toBe(false);
      expect(results.get('mock')?.error).toContain('does not support posting');
    });
  });

  describe('监控功能测试', () => {
    it('应该启动所有适配器的监控', async () => {
      const twitterAdapter = new TwitterAdapter(twitterConfig);
      const githubAdapter = new GitHubAdapter(githubConfig);
      
      const twitterStartSpy = jest.spyOn(twitterAdapter, 'startMonitoring');
      const githubStartSpy = jest.spyOn(githubAdapter, 'startMonitoring');
      
      await manager.addAdapter('twitter', twitterAdapter);
      await manager.addAdapter('github', githubAdapter);
      
      await manager.startMonitoringAll();
      
      expect(twitterStartSpy).toHaveBeenCalled();
      expect(githubStartSpy).toHaveBeenCalled();
    });

    it('应该停止所有适配器的监控', async () => {
      const twitterAdapter = new TwitterAdapter(twitterConfig);
      const githubAdapter = new GitHubAdapter(githubConfig);
      
      const twitterStopSpy = jest.spyOn(twitterAdapter, 'stopMonitoring');
      const githubStopSpy = jest.spyOn(githubAdapter, 'stopMonitoring');
      
      await manager.addAdapter('twitter', twitterAdapter);
      await manager.addAdapter('github', githubAdapter);
      
      await manager.stopMonitoringAll();
      
      expect(twitterStopSpy).toHaveBeenCalled();
      expect(githubStopSpy).toHaveBeenCalled();
    });
  });

  describe('分析功能测试', () => {
    it('应该获取聚合分析数据', async () => {
      const twitterAdapter = new TwitterAdapter(twitterConfig);
      const githubAdapter = new GitHubAdapter(githubConfig);
      
      await manager.addAdapter('twitter', twitterAdapter);
      await manager.addAdapter('github', githubAdapter);
      
      const analytics = await manager.getAggregatedAnalytics('test-post-id');
      
      expect(analytics.size).toBe(2);
      expect(analytics.get('twitter')).toBeDefined();
      expect(analytics.get('github')).toBeDefined();
    });
  });

  describe('批量操作测试', () => {
    it('应该在所有平台关注用户', async () => {
      const twitterAdapter = new TwitterAdapter(twitterConfig);
      const githubAdapter = new GitHubAdapter(githubConfig);
      
      await manager.addAdapter('twitter', twitterAdapter);
      await manager.addAdapter('github', githubAdapter);
      
      const results = await manager.followOnAll('testuser');
      
      expect(results.size).toBe(2);
      expect(results.get('twitter')?.success).toBe(true);
      expect(results.get('github')?.success).toBe(true);
    });

    it('应该在所有平台搜索内容', async () => {
      const twitterAdapter = new TwitterAdapter(twitterConfig);
      const githubAdapter = new GitHubAdapter(githubConfig);
      
      await manager.addAdapter('twitter', twitterAdapter);
      await manager.addAdapter('github', githubAdapter);
      
      const results = await manager.searchAll('test query');
      
      expect(results.size).toBe(2);
      expect(results.get('twitter')).toBeDefined();
      expect(results.get('github')).toBeDefined();
    });
  });

  describe('状态管理测试', () => {
    it('应该获取所有适配器状态', async () => {
      const twitterAdapter = new TwitterAdapter(twitterConfig);
      const githubAdapter = new GitHubAdapter(githubConfig);
      
      await manager.addAdapter('twitter', twitterAdapter);
      await manager.addAdapter('github', githubAdapter);
      
      const statuses = manager.getAdapterStatuses();
      
      expect(statuses.size).toBe(2);
      expect(statuses.get('twitter')?.platform).toBe('twitter');
      expect(statuses.get('github')?.platform).toBe('github');
    });

    it('应该获取已认证的适配器', async () => {
      const twitterAdapter = new TwitterAdapter(twitterConfig);
      const githubAdapter = new GitHubAdapter(githubConfig);
      
      // Mock authentication status
      Object.defineProperty(twitterAdapter, 'isAuthenticated', {
        get: () => true
      });
      Object.defineProperty(githubAdapter, 'isAuthenticated', {
        get: () => false
      });
      
      await manager.addAdapter('twitter', twitterAdapter);
      await manager.addAdapter('github', githubAdapter);
      
      const authenticated = manager.getAuthenticatedAdapters();
      
      expect(authenticated.size).toBe(1);
      expect(authenticated.get('twitter')).toBe(twitterAdapter);
    });

    it('应该获取平台适配器数量统计', async () => {
      const twitterAdapter1 = new TwitterAdapter(twitterConfig);
      const twitterAdapter2 = new TwitterAdapter(twitterConfig);
      const githubAdapter = new GitHubAdapter(githubConfig);
      
      await manager.addAdapter('twitter1', twitterAdapter1);
      await manager.addAdapter('twitter2', twitterAdapter2);
      await manager.addAdapter('github1', githubAdapter);
      
      const counts = manager.getAdapterCountByPlatform();
      
      expect(counts.get('twitter')).toBe(2);
      expect(counts.get('github')).toBe(1);
    });
  });

  describe('配置验证测试', () => {
    it('应该验证所有适配器配置', async () => {
      const twitterAdapter = new TwitterAdapter(twitterConfig);
      const githubAdapter = new GitHubAdapter(githubConfig);
      
      await manager.addAdapter('twitter', twitterAdapter);
      await manager.addAdapter('github', githubAdapter);
      
      const validations = manager.validateAllConfigurations();
      
      expect(validations.size).toBe(2);
      expect(validations.get('twitter')).toBe(true);
      expect(validations.get('github')).toBe(true);
    });
  });

  describe('事件处理测试', () => {
    it('应该转发适配器事件', async () => {
      const twitterAdapter = new TwitterAdapter(twitterConfig);
      
      const eventSpy = jest.fn();
      manager.on('adapter:ready', eventSpy);
      
      await manager.addAdapter('twitter', twitterAdapter);
      
      // Simulate adapter ready event
      twitterAdapter.emit('adapter:ready');
      
      expect(eventSpy).toHaveBeenCalledWith('twitter');
    });

    it('应该处理适配器错误事件', async () => {
      const twitterAdapter = new TwitterAdapter(twitterConfig);
      
      const errorSpy = jest.fn();
      manager.on('adapter:error', errorSpy);
      
      await manager.addAdapter('twitter', twitterAdapter);
      
      // Simulate adapter error
      const error = new Error('Test error');
      twitterAdapter.emit('adapter:error', error);
      
      expect(errorSpy).toHaveBeenCalledWith('twitter', error);
    });
  });

  describe('清理功能测试', () => {
    it('应该断开所有适配器连接', async () => {
      const twitterAdapter = new TwitterAdapter(twitterConfig);
      const githubAdapter = new GitHubAdapter(githubConfig);
      
      const twitterDisconnectSpy = jest.spyOn(twitterAdapter, 'disconnect');
      const githubDisconnectSpy = jest.spyOn(githubAdapter, 'disconnect');
      
      await manager.addAdapter('twitter', twitterAdapter);
      await manager.addAdapter('github', githubAdapter);
      
      await manager.disconnectAll();
      
      expect(twitterDisconnectSpy).toHaveBeenCalled();
      expect(githubDisconnectSpy).toHaveBeenCalled();
      expect(manager.adapters.size).toBe(0);
    });
  });
});
