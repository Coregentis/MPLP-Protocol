/**
 * 监控集成服务测试
 */

import {
  MonitoringIntegrationService,
  MonitoringIntegrationConfig,
  MonitoringProvider,
  ExportFormat,
  IntegrationEndpoints,
  ContextMetricsConfig
} from '../../../src/modules/context/application/services/monitoring-integration.service';
import { UUID } from '../../../src/modules/context/types';

describe('MonitoringIntegrationService', () => {
  let service: MonitoringIntegrationService;
  let mockContextId: UUID;

  beforeEach(() => {
    service = new MonitoringIntegrationService();
    mockContextId = 'context-123e4567-e89b-42d3-a456-426614174000' as UUID;
  });

  describe('getDefaultConfig', () => {
    it('应该返回默认监控集成配置', () => {
      const defaultConfig = service.getDefaultConfig();

      expect(defaultConfig.enabled).toBe(true);
      expect(defaultConfig.supportedProviders).toContain('prometheus');
      expect(defaultConfig.supportedProviders).toContain('grafana');
      expect(defaultConfig.contextMetrics?.trackStateChanges).toBe(true);
      expect(defaultConfig.contextMetrics?.trackCachePerformance).toBe(true);
      expect(defaultConfig.contextMetrics?.trackSyncOperations).toBe(true);
      expect(defaultConfig.contextMetrics?.trackAccessPatterns).toBe(false);
      expect(defaultConfig.exportFormats).toContain('prometheus');
      expect(defaultConfig.exportFormats).toContain('opentelemetry');
    });
  });

  describe('connectToProvider', () => {
    it('应该成功连接到支持的提供商', async () => {
      const result = await service.connectToProvider('prometheus', 'http://localhost:9090');

      expect(result).toBe(true);
    });

    it('应该拒绝连接到不支持的提供商', async () => {
      const limitedService = new MonitoringIntegrationService({
        supportedProviders: ['prometheus']
      });

      const result = await limitedService.connectToProvider('datadog', 'http://datadog.com');

      expect(result).toBe(false);
    });

    it('应该在服务禁用时拒绝连接', async () => {
      const disabledService = new MonitoringIntegrationService({ enabled: false });

      const result = await disabledService.connectToProvider('prometheus', 'http://localhost:9090');

      expect(result).toBe(false);
    });

    it('应该支持带API密钥的连接', async () => {
      const result = await service.connectToProvider('grafana', 'http://grafana.com', 'api-key-123');

      expect(result).toBe(true);
    });

    it('应该支持所有监控提供商类型', async () => {
      const providers: MonitoringProvider[] = ['prometheus', 'grafana', 'datadog', 'new_relic', 'elastic_apm', 'custom'];
      
      for (const provider of providers) {
        const result = await service.connectToProvider(provider, `http://${provider}.com`, 'test-key');
        expect(result).toBe(true);
      }
    });
  });

  describe('disconnectFromProvider', () => {
    beforeEach(async () => {
      await service.connectToProvider('prometheus', 'http://localhost:9090');
    });

    it('应该成功断开连接', async () => {
      const result = await service.disconnectFromProvider('prometheus');

      expect(result).toBe(true);
    });

    it('应该处理断开不存在的连接', async () => {
      const result = await service.disconnectFromProvider('datadog');

      expect(result).toBe(true);
    });
  });

  describe('collectMetrics', () => {
    it('应该成功收集指标', async () => {
      const result = await service.collectMetrics(
        mockContextId,
        'context_access_latency',
        50.5,
        { operation: 'read', user: 'test-user' }
      );

      expect(result).toBe(true);
    });

    it('应该在服务禁用时拒绝收集指标', async () => {
      const disabledService = new MonitoringIntegrationService({ enabled: false });

      const result = await disabledService.collectMetrics(mockContextId, 'test_metric', 100);

      expect(result).toBe(false);
    });

    it('应该支持不同类型的指标', async () => {
      const metrics = [
        { type: 'context_access_latency', value: 50.5 },
        { type: 'cache_hit_rate', value: 85.2 },
        { type: 'sync_success_rate', value: 99.1 },
        { type: 'memory_usage', value: 128.7 }
      ];

      for (const metric of metrics) {
        const result = await service.collectMetrics(mockContextId, metric.type, metric.value);
        expect(result).toBe(true);
      }
    });

    it('应该正确处理标签', async () => {
      const labels = {
        environment: 'production',
        service: 'context-service',
        version: '1.0.0'
      };

      const result = await service.collectMetrics(mockContextId, 'test_metric', 100, labels);

      expect(result).toBe(true);
    });
  });

  describe('exportMetrics', () => {
    beforeEach(async () => {
      await service.connectToProvider('prometheus', 'http://localhost:9090');
      await service.collectMetrics(mockContextId, 'test_metric_1', 100);
      await service.collectMetrics(mockContextId, 'test_metric_2', 200);
    });

    it('应该成功导出指标到Prometheus', async () => {
      const result = await service.exportMetrics('prometheus', 'prometheus');

      expect(result.success).toBe(true);
      expect(result.provider).toBe('prometheus');
      expect(result.format).toBe('prometheus');
      expect(result.recordsExported).toBe(2);
      expect(result.errors).toHaveLength(0);
    });

    it('应该支持OpenTelemetry格式导出', async () => {
      const result = await service.exportMetrics('prometheus', 'opentelemetry');

      expect(result.success).toBe(true);
      expect(result.format).toBe('opentelemetry');
    });

    it('应该支持自定义格式导出', async () => {
      const result = await service.exportMetrics('prometheus', 'custom');

      expect(result.success).toBe(true);
      expect(result.format).toBe('custom');
    });

    it('应该在没有连接时返回错误', async () => {
      const result = await service.exportMetrics('datadog', 'prometheus');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No active connection to datadog');
    });

    it('应该在服务禁用时返回错误', async () => {
      const disabledService = new MonitoringIntegrationService({ enabled: false });

      const result = await disabledService.exportMetrics('prometheus', 'prometheus');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Monitoring integration is disabled');
    });

    it('应该在没有指标时成功返回', async () => {
      // 先导出一次清空缓冲区
      await service.exportMetrics('prometheus', 'prometheus');
      
      // 再次导出应该成功但没有记录
      const result = await service.exportMetrics('prometheus', 'prometheus');

      expect(result.success).toBe(true);
      expect(result.recordsExported).toBe(0);
    });
  });

  describe('getConnectionStatus', () => {
    it('应该返回空数组当没有连接时', () => {
      const status = service.getConnectionStatus();

      expect(status).toEqual([]);
    });

    it('应该返回连接状态', async () => {
      await service.connectToProvider('prometheus', 'http://localhost:9090');
      await service.connectToProvider('grafana', 'http://grafana.com', 'api-key');

      const status = service.getConnectionStatus();

      expect(status).toHaveLength(2);
      expect(status[0].provider).toBe('prometheus');
      expect(status[0].isConnected).toBe(true);
      expect(status[1].provider).toBe('grafana');
      expect(status[1].isConnected).toBe(true);
    });
  });

  describe('getBufferedMetricsCount', () => {
    it('应该返回0当没有指标时', () => {
      const count = service.getBufferedMetricsCount();

      expect(count).toBe(0);
    });

    it('应该返回正确的指标数量', async () => {
      await service.collectMetrics(mockContextId, 'metric1', 100);
      await service.collectMetrics(mockContextId, 'metric2', 200);
      await service.collectMetrics('other-context' as UUID, 'metric3', 300);

      const count = service.getBufferedMetricsCount();

      expect(count).toBe(3);
    });
  });

  describe('performHealthCheck', () => {
    it('应该返回unhealthy当没有连接时', async () => {
      const health = await service.performHealthCheck();

      expect(health.overall).toBe('unhealthy');
      expect(Object.keys(health.providers)).toHaveLength(0);
    });

    it('应该返回healthy当所有连接正常时', async () => {
      await service.connectToProvider('prometheus', 'http://localhost:9090');

      const health = await service.performHealthCheck();

      expect(health.overall).toBe('healthy');
      expect(health.providers.prometheus).toBe('connected');
    });

    it('应该返回degraded当部分连接正常时', async () => {
      await service.connectToProvider('prometheus', 'http://localhost:9090');
      await service.connectToProvider('grafana', 'http://grafana.com');
      
      // 断开一个连接
      await service.disconnectFromProvider('grafana');

      const health = await service.performHealthCheck();

      expect(health.overall).toBe('degraded');
      expect(health.providers.prometheus).toBe('connected');
      expect(health.providers.grafana).toBe('disconnected');
    });
  });

  describe('updateConfig', () => {
    it('应该成功更新配置', async () => {
      const newConfig: Partial<MonitoringIntegrationConfig> = {
        supportedProviders: ['prometheus', 'datadog'],
        contextMetrics: {
          trackStateChanges: false,
          trackCachePerformance: true,
          trackSyncOperations: true,
          trackAccessPatterns: true
        }
      };

      const result = await service.updateConfig(newConfig);

      expect(result).toBe(true);
    });

    it('应该部分更新配置', async () => {
      const partialConfig: Partial<MonitoringIntegrationConfig> = {
        enabled: false
      };

      const result = await service.updateConfig(partialConfig);

      expect(result).toBe(true);
    });
  });

  describe('集成测试', () => {
    it('应该完整的监控集成流程', async () => {
      // 1. 连接到提供商
      const connected = await service.connectToProvider('prometheus', 'http://localhost:9090');
      expect(connected).toBe(true);

      // 2. 收集指标
      await service.collectMetrics(mockContextId, 'test_metric', 100, { test: 'true' });
      expect(service.getBufferedMetricsCount()).toBe(1);

      // 3. 导出指标
      const exported = await service.exportMetrics('prometheus', 'prometheus');
      expect(exported.success).toBe(true);
      expect(exported.recordsExported).toBe(1);

      // 4. 验证缓冲区已清空
      expect(service.getBufferedMetricsCount()).toBe(0);

      // 5. 健康检查
      const health = await service.performHealthCheck();
      expect(health.overall).toBe('healthy');
    });

    it('应该处理多个提供商的并发操作', async () => {
      const providers: MonitoringProvider[] = ['prometheus', 'grafana', 'datadog'];
      
      // 连接到多个提供商
      for (const provider of providers) {
        const connected = await service.connectToProvider(provider, `http://${provider}.com`);
        expect(connected).toBe(true);
      }

      // 收集指标
      await service.collectMetrics(mockContextId, 'concurrent_metric', 100);

      // 并发导出到所有提供商
      const exportPromises = providers.map(provider => 
        service.exportMetrics(provider, 'prometheus')
      );

      const results = await Promise.all(exportPromises);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('应该正确处理指标缓冲区限制', async () => {
      // 收集超过1000个指标来测试缓冲区限制
      for (let i = 0; i < 1100; i++) {
        await service.collectMetrics(mockContextId, 'buffer_test', i);
      }

      const count = service.getBufferedMetricsCount();
      expect(count).toBeLessThanOrEqual(1000);
    });
  });
});
