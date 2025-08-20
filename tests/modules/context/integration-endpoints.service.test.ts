/**
 * 集成端点服务测试
 */

import {
  IntegrationEndpointsService,
  IntegrationEndpointsConfig,
  WebhookConfig,
  ApiEndpointConfig,
  AuthenticationType,
  HttpMethod,
  WebhookEvent
} from '../../../src/modules/context/application/services/integration-endpoints.service';

describe('IntegrationEndpointsService', () => {
  let service: IntegrationEndpointsService;

  beforeEach(() => {
    service = new IntegrationEndpointsService();
  });

  describe('getDefaultConfig', () => {
    it('应该返回默认集成端点配置', () => {
      const defaultConfig = service.getDefaultConfig();

      expect(defaultConfig.enabled).toBe(true);
      expect(defaultConfig.webhooks).toHaveLength(1);
      expect(defaultConfig.webhooks![0].webhookId).toBe('context-events');
      expect(defaultConfig.webhooks![0].events).toContain('context.created');
      expect(defaultConfig.webhooks![0].authentication.type).toBe('bearer');
      expect(defaultConfig.apiEndpoints).toHaveLength(1);
      expect(defaultConfig.apiEndpoints![0].endpointId).toBe('external-api');
      expect(defaultConfig.apiEndpoints![0].method).toBe('POST');
      expect(defaultConfig.apiEndpoints![0].authentication.type).toBe('basic');
    });
  });

  describe('addWebhook', () => {
    it('应该成功添加Webhook', async () => {
      const webhook: WebhookConfig = {
        webhookId: 'test-webhook',
        url: 'https://example.com/webhook',
        events: ['context.created', 'context.updated'],
        authentication: { type: 'none' },
        enabled: true
      };

      const result = await service.addWebhook(webhook);
      expect(result).toBe(true);

      const stats = service.getStatistics();
      expect(stats.endpointStatistics['test-webhook']).toBeDefined();
    });

    it('应该拒绝添加重复的Webhook', async () => {
      const webhook: WebhookConfig = {
        webhookId: 'duplicate-webhook',
        url: 'https://example.com/webhook',
        events: ['context.created'],
        authentication: { type: 'none' },
        enabled: true
      };

      await service.addWebhook(webhook);
      const result = await service.addWebhook(webhook);
      expect(result).toBe(false);
    });

    it('应该在服务禁用时拒绝添加Webhook', async () => {
      const disabledService = new IntegrationEndpointsService({ enabled: false });
      const webhook: WebhookConfig = {
        webhookId: 'test-webhook',
        url: 'https://example.com/webhook',
        events: ['context.created'],
        authentication: { type: 'none' },
        enabled: true
      };

      const result = await disabledService.addWebhook(webhook);
      expect(result).toBe(false);
    });

    it('应该支持所有认证类型', async () => {
      const authTypes: AuthenticationType[] = ['none', 'basic', 'bearer', 'hmac'];
      
      for (const authType of authTypes) {
        const webhook: WebhookConfig = {
          webhookId: `webhook-${authType}`,
          url: 'https://example.com/webhook',
          events: ['context.created'],
          authentication: { type: authType },
          enabled: true
        };

        const result = await service.addWebhook(webhook);
        expect(result).toBe(true);
      }
    });

    it('应该支持所有事件类型', async () => {
      const events: WebhookEvent[] = [
        'context.created', 'context.updated', 'context.deleted',
        'state.changed', 'performance.alert', 'audit.logged'
      ];
      
      for (const event of events) {
        const webhook: WebhookConfig = {
          webhookId: `webhook-${event}`,
          url: 'https://example.com/webhook',
          events: [event],
          authentication: { type: 'none' },
          enabled: true
        };

        const result = await service.addWebhook(webhook);
        expect(result).toBe(true);
      }
    });
  });

  describe('removeWebhook', () => {
    beforeEach(async () => {
      await service.addWebhook({
        webhookId: 'removable-webhook',
        url: 'https://example.com/webhook',
        events: ['context.created'],
        authentication: { type: 'none' },
        enabled: true
      });
    });

    it('应该成功移除Webhook', async () => {
      const result = await service.removeWebhook('removable-webhook');
      expect(result).toBe(true);

      const stats = service.getStatistics();
      expect(stats.endpointStatistics['removable-webhook']).toBeUndefined();
    });

    it('应该处理移除不存在的Webhook', async () => {
      const result = await service.removeWebhook('non-existent-webhook');
      expect(result).toBe(false);
    });
  });

  describe('addApiEndpoint', () => {
    it('应该成功添加API端点', async () => {
      const endpoint: ApiEndpointConfig = {
        endpointId: 'test-endpoint',
        path: '/api/test',
        method: 'GET',
        authentication: { type: 'none' },
        enabled: true
      };

      const result = await service.addApiEndpoint(endpoint);
      expect(result).toBe(true);

      const stats = service.getStatistics();
      expect(stats.endpointStatistics['test-endpoint']).toBeDefined();
    });

    it('应该拒绝添加重复的API端点', async () => {
      const endpoint: ApiEndpointConfig = {
        endpointId: 'duplicate-endpoint',
        path: '/api/test',
        method: 'GET',
        authentication: { type: 'none' },
        enabled: true
      };

      await service.addApiEndpoint(endpoint);
      const result = await service.addApiEndpoint(endpoint);
      expect(result).toBe(false);
    });

    it('应该在服务禁用时拒绝添加API端点', async () => {
      const disabledService = new IntegrationEndpointsService({ enabled: false });
      const endpoint: ApiEndpointConfig = {
        endpointId: 'test-endpoint',
        path: '/api/test',
        method: 'GET',
        authentication: { type: 'none' },
        enabled: true
      };

      const result = await disabledService.addApiEndpoint(endpoint);
      expect(result).toBe(false);
    });

    it('应该支持所有HTTP方法', async () => {
      const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      
      for (const method of methods) {
        const endpoint: ApiEndpointConfig = {
          endpointId: `endpoint-${method}`,
          path: `/api/${method.toLowerCase()}`,
          method,
          authentication: { type: 'none' },
          enabled: true
        };

        const result = await service.addApiEndpoint(endpoint);
        expect(result).toBe(true);
      }
    });
  });

  describe('removeApiEndpoint', () => {
    beforeEach(async () => {
      await service.addApiEndpoint({
        endpointId: 'removable-endpoint',
        path: '/api/test',
        method: 'GET',
        authentication: { type: 'none' },
        enabled: true
      });
    });

    it('应该成功移除API端点', async () => {
      const result = await service.removeApiEndpoint('removable-endpoint');
      expect(result).toBe(true);

      const stats = service.getStatistics();
      expect(stats.endpointStatistics['removable-endpoint']).toBeUndefined();
    });

    it('应该处理移除不存在的API端点', async () => {
      const result = await service.removeApiEndpoint('non-existent-endpoint');
      expect(result).toBe(false);
    });
  });

  describe('triggerWebhook', () => {
    beforeEach(async () => {
      await service.addWebhook({
        webhookId: 'trigger-webhook',
        url: 'https://example.com/webhook',
        events: ['context.created', 'context.updated'],
        authentication: { type: 'none' },
        enabled: true
      });
    });

    it('应该成功触发Webhook', async () => {
      const payload = { contextId: 'test-context', data: 'test-data' };
      
      const result = await service.triggerWebhook('trigger-webhook', 'context.created', payload);

      expect(result.webhookId).toBe('trigger-webhook');
      expect(result.success).toBe(true);
      expect(result.responseTime).toBeGreaterThan(0);
      expect(result.retryCount).toBe(0);
    });

    it('应该拒绝触发不存在的Webhook', async () => {
      const result = await service.triggerWebhook('non-existent-webhook', 'context.created', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Webhook not found or disabled');
    });

    it('应该拒绝触发未订阅的事件', async () => {
      const result = await service.triggerWebhook('trigger-webhook', 'audit.logged', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Event audit.logged not subscribed');
    });

    it('应该处理禁用的Webhook', async () => {
      await service.addWebhook({
        webhookId: 'disabled-webhook',
        url: 'https://example.com/webhook',
        events: ['context.created'],
        authentication: { type: 'none' },
        enabled: false
      });

      const result = await service.triggerWebhook('disabled-webhook', 'context.created', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Webhook not found or disabled');
    });
  });

  describe('callApiEndpoint', () => {
    beforeEach(async () => {
      await service.addApiEndpoint({
        endpointId: 'call-endpoint',
        path: '/api/test',
        method: 'POST',
        authentication: { type: 'none' },
        enabled: true
      });
    });

    it('应该成功调用API端点', async () => {
      const data = { test: 'data' };
      
      const result = await service.callApiEndpoint('call-endpoint', data);

      expect(result.endpointId).toBe('call-endpoint');
      expect(result.success).toBe(true);
      expect(result.responseTime).toBeGreaterThan(0);
    });

    it('应该拒绝调用不存在的API端点', async () => {
      const result = await service.callApiEndpoint('non-existent-endpoint', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('API endpoint not found or disabled');
    });

    it('应该处理禁用的API端点', async () => {
      await service.addApiEndpoint({
        endpointId: 'disabled-endpoint',
        path: '/api/test',
        method: 'GET',
        authentication: { type: 'none' },
        enabled: false
      });

      const result = await service.callApiEndpoint('disabled-endpoint', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('API endpoint not found or disabled');
    });

    it('应该处理速率限制', async () => {
      await service.addApiEndpoint({
        endpointId: 'rate-limited-endpoint',
        path: '/api/test',
        method: 'GET',
        authentication: { type: 'none' },
        rateLimit: { requestsPerMinute: 1 },
        enabled: true
      });

      // 第一次调用应该成功
      const result1 = await service.callApiEndpoint('rate-limited-endpoint', {});
      expect(result1.success).toBe(true);

      // 第二次调用应该被速率限制
      const result2 = await service.callApiEndpoint('rate-limited-endpoint', {});
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Rate limit exceeded');
    });
  });

  describe('getStatistics', () => {
    beforeEach(async () => {
      await service.addWebhook({
        webhookId: 'stats-webhook',
        url: 'https://example.com/webhook',
        events: ['context.created'],
        authentication: { type: 'none' },
        enabled: true
      });
      await service.addApiEndpoint({
        endpointId: 'stats-endpoint',
        path: '/api/test',
        method: 'GET',
        authentication: { type: 'none' },
        enabled: true
      });
    });

    it('应该返回正确的统计信息', async () => {
      // 执行一些调用
      await service.triggerWebhook('stats-webhook', 'context.created', {});
      await service.callApiEndpoint('stats-endpoint', {});

      const stats = service.getStatistics();

      expect(stats.webhooks.totalCalls).toBe(1);
      expect(stats.apiEndpoints.totalCalls).toBe(1);
      expect(stats.endpointStatistics['stats-webhook']).toBeDefined();
      expect(stats.endpointStatistics['stats-endpoint']).toBeDefined();
      expect(stats.endpointStatistics['stats-webhook'].calls).toBe(1);
      expect(stats.endpointStatistics['stats-endpoint'].calls).toBe(1);
    });

    it('应该正确计算成功和失败统计', async () => {
      // 执行多次调用
      for (let i = 0; i < 10; i++) {
        await service.triggerWebhook('stats-webhook', 'context.created', {});
      }

      const stats = service.getStatistics();
      expect(stats.webhooks.totalCalls).toBe(10);
      expect(stats.webhooks.successfulCalls + stats.webhooks.failedCalls).toBe(10);
    });
  });

  describe('getCallHistory', () => {
    beforeEach(async () => {
      await service.addWebhook({
        webhookId: 'history-webhook',
        url: 'https://example.com/webhook',
        events: ['context.created'],
        authentication: { type: 'none' },
        enabled: true
      });
    });

    it('应该返回调用历史', async () => {
      await service.triggerWebhook('history-webhook', 'context.created', {});
      await service.triggerWebhook('history-webhook', 'context.created', {});

      const history = service.getCallHistory('history-webhook');
      expect(history).toHaveLength(2);
      expect(history[0].timestamp).toBeDefined();
      expect(history[1].timestamp).toBeDefined();
    });

    it('应该限制历史记录数量', async () => {
      const history = service.getCallHistory('history-webhook', 1);
      expect(history.length).toBeLessThanOrEqual(1);
    });

    it('应该返回空数组对于不存在的端点', () => {
      const history = service.getCallHistory('non-existent-endpoint');
      expect(history).toEqual([]);
    });
  });

  describe('getHealthStatus', () => {
    it('应该返回健康状态当没有端点时', () => {
      const health = service.getHealthStatus();

      expect(health.overall).toBe('healthy');
      expect(Object.keys(health.webhooks)).toHaveLength(0);
      expect(Object.keys(health.apiEndpoints)).toHaveLength(0);
    });

    it('应该返回健康状态当所有端点正常时', async () => {
      await service.addWebhook({
        webhookId: 'healthy-webhook',
        url: 'https://example.com/webhook',
        events: ['context.created'],
        authentication: { type: 'none' },
        enabled: true
      });

      const health = service.getHealthStatus();
      expect(health.overall).toBe('healthy');
      expect(health.webhooks['healthy-webhook']).toBe('healthy');
    });
  });

  describe('updateConfig', () => {
    it('应该成功更新配置', async () => {
      const newConfig: Partial<IntegrationEndpointsConfig> = {
        enabled: false
      };

      const result = await service.updateConfig(newConfig);
      expect(result).toBe(true);
    });

    it('应该支持部分配置更新', async () => {
      const partialConfig: Partial<IntegrationEndpointsConfig> = {
        webhooks: []
      };

      const result = await service.updateConfig(partialConfig);
      expect(result).toBe(true);
    });
  });

  describe('集成测试', () => {
    it('应该完整的集成端点生命周期', async () => {
      // 1. 添加Webhook和API端点
      await service.addWebhook({
        webhookId: 'integration-webhook',
        url: 'https://example.com/webhook',
        events: ['context.created', 'context.updated'],
        authentication: { type: 'bearer', credentials: { token: 'test-token' } },
        enabled: true
      });

      await service.addApiEndpoint({
        endpointId: 'integration-endpoint',
        path: '/api/integration',
        method: 'POST',
        authentication: { type: 'basic', credentials: { username: 'user', password: 'pass' } },
        enabled: true
      });

      // 2. 触发Webhook
      const webhookResult = await service.triggerWebhook('integration-webhook', 'context.created', { test: 'data' });
      expect(webhookResult.success).toBe(true);

      // 3. 调用API端点
      const apiResult = await service.callApiEndpoint('integration-endpoint', { test: 'data' });
      expect(apiResult.success).toBe(true);

      // 4. 检查统计
      const stats = service.getStatistics();
      expect(stats.webhooks.totalCalls).toBe(1);
      expect(stats.apiEndpoints.totalCalls).toBe(1);

      // 5. 检查历史
      const webhookHistory = service.getCallHistory('integration-webhook');
      const apiHistory = service.getCallHistory('integration-endpoint');
      expect(webhookHistory).toHaveLength(1);
      expect(apiHistory).toHaveLength(1);

      // 6. 健康检查
      const health = service.getHealthStatus();
      expect(health.overall).toBe('healthy');

      // 7. 移除端点
      await service.removeWebhook('integration-webhook');
      await service.removeApiEndpoint('integration-endpoint');

      const finalStats = service.getStatistics();
      expect(finalStats.endpointStatistics['integration-webhook']).toBeUndefined();
      expect(finalStats.endpointStatistics['integration-endpoint']).toBeUndefined();
    });

    it('应该处理并发调用', async () => {
      await service.addWebhook({
        webhookId: 'concurrent-webhook',
        url: 'https://example.com/webhook',
        events: ['context.created'],
        authentication: { type: 'none' },
        enabled: true
      });

      // 并发触发多个Webhook
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(service.triggerWebhook('concurrent-webhook', 'context.created', { index: i }));
      }

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.webhookId).toBe('concurrent-webhook');
      });

      const stats = service.getStatistics();
      expect(stats.webhooks.totalCalls).toBe(10);
    });

    it('应该正确处理重试机制', async () => {
      await service.addWebhook({
        webhookId: 'retry-webhook',
        url: 'https://example.com/webhook',
        events: ['context.created'],
        authentication: { type: 'none' },
        retryPolicy: {
          maxRetries: 2,
          retryDelayMs: 10,
          backoffMultiplier: 2,
          maxDelayMs: 1000
        },
        enabled: true
      });

      const result = await service.triggerWebhook('retry-webhook', 'context.created', {});
      expect(result.webhookId).toBe('retry-webhook');
      expect(result.retryCount).toBeGreaterThanOrEqual(0);
    });
  });
});
