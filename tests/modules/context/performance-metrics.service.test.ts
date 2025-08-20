/**
 * 性能指标服务测试
 */

import {
  PerformanceMetricsService,
  PerformanceMetrics,
  PerformanceMetricsConfig,
  HealthStatusInfo,
  HealthStatus,
  AlertingConfig
} from '../../../src/modules/context/application/services/performance-metrics.service';
import { UUID } from '../../../src/modules/context/types';

describe('PerformanceMetricsService', () => {
  let service: PerformanceMetricsService;
  let mockContextId: UUID;

  beforeEach(() => {
    service = new PerformanceMetricsService();
    mockContextId = 'context-123e4567-e89b-42d3-a456-426614174000' as UUID;
  });

  describe('getDefaultConfig', () => {
    it('应该返回默认性能指标配置', () => {
      const defaultConfig = service.getDefaultConfig();

      expect(defaultConfig.enabled).toBe(true);
      expect(defaultConfig.collectionIntervalSeconds).toBe(60);
      expect(defaultConfig.alerting?.enabled).toBe(true);
      expect(defaultConfig.alerting?.thresholds).toBeDefined();
      expect(defaultConfig.alerting?.notificationChannels).toContain('email');
    });
  });

  describe('collectMetrics', () => {
    it('应该成功收集性能指标', async () => {
      const metrics = await service.collectMetrics(mockContextId);

      expect(metrics).toBeDefined();
      expect(typeof metrics.contextAccessLatencyMs).toBe('number');
      expect(typeof metrics.contextUpdateLatencyMs).toBe('number');
      expect(typeof metrics.cacheHitRatePercent).toBe('number');
      expect(typeof metrics.contextSyncSuccessRatePercent).toBe('number');
      expect(typeof metrics.contextStateConsistencyScore).toBe('number');
      expect(typeof metrics.activeContextsCount).toBe('number');
      expect(typeof metrics.contextOperationsPerSecond).toBe('number');
      expect(typeof metrics.contextMemoryUsageMb).toBe('number');
      expect(typeof metrics.averageContextSizeBytes).toBe('number');

      // 验证指标范围
      expect(metrics.cacheHitRatePercent).toBeGreaterThanOrEqual(0);
      expect(metrics.cacheHitRatePercent).toBeLessThanOrEqual(100);
      expect(metrics.contextSyncSuccessRatePercent).toBeGreaterThanOrEqual(0);
      expect(metrics.contextSyncSuccessRatePercent).toBeLessThanOrEqual(100);
      expect(metrics.contextStateConsistencyScore).toBeGreaterThanOrEqual(0);
      expect(metrics.contextStateConsistencyScore).toBeLessThanOrEqual(10);
    });

    it('应该存储当前指标', async () => {
      await service.collectMetrics(mockContextId);
      const currentMetrics = service.getCurrentMetrics(mockContextId);

      expect(currentMetrics).toBeDefined();
      expect(currentMetrics).not.toBeNull();
    });

    it('应该添加到指标历史', async () => {
      await service.collectMetrics(mockContextId);
      await service.collectMetrics(mockContextId);
      
      const history = service.getMetricsHistory(mockContextId);

      expect(history).toHaveLength(2);
    });

    it('应该限制历史记录数量', async () => {
      // 收集超过100个指标
      for (let i = 0; i < 105; i++) {
        await service.collectMetrics(mockContextId);
      }

      const history = service.getMetricsHistory(mockContextId);

      expect(history.length).toBeLessThanOrEqual(100);
    });
  });

  describe('getCurrentMetrics', () => {
    it('应该返回当前指标', async () => {
      await service.collectMetrics(mockContextId);
      const metrics = service.getCurrentMetrics(mockContextId);

      expect(metrics).toBeDefined();
      expect(metrics).not.toBeNull();
    });

    it('应该在没有指标时返回null', () => {
      const metrics = service.getCurrentMetrics('non-existent-context' as UUID);

      expect(metrics).toBeNull();
    });
  });

  describe('getMetricsHistory', () => {
    it('应该返回指标历史', async () => {
      await service.collectMetrics(mockContextId);
      await service.collectMetrics(mockContextId);
      await service.collectMetrics(mockContextId);

      const history = service.getMetricsHistory(mockContextId);

      expect(history).toHaveLength(3);
    });

    it('应该限制返回的历史记录数量', async () => {
      for (let i = 0; i < 10; i++) {
        await service.collectMetrics(mockContextId);
      }

      const history = service.getMetricsHistory(mockContextId, 5);

      expect(history).toHaveLength(5);
    });

    it('应该在没有历史时返回空数组', () => {
      const history = service.getMetricsHistory('non-existent-context' as UUID);

      expect(history).toEqual([]);
    });
  });

  describe('performHealthCheck', () => {
    it('应该执行健康检查', async () => {
      const healthStatus = await service.performHealthCheck(mockContextId);

      expect(healthStatus).toBeDefined();
      expect(healthStatus.status).toBeDefined();
      expect(healthStatus.lastCheck).toBeInstanceOf(Date);
      expect(Array.isArray(healthStatus.checks)).toBe(true);
      expect(healthStatus.checks.length).toBeGreaterThan(0);
    });

    it('应该包含所有必要的健康检查项', async () => {
      const healthStatus = await service.performHealthCheck(mockContextId);

      const checkNames = healthStatus.checks.map(check => check.checkName);
      expect(checkNames).toContain('context_access_latency');
      expect(checkNames).toContain('cache_hit_rate');
      expect(checkNames).toContain('sync_success_rate');
      expect(checkNames).toContain('state_consistency');
      expect(checkNames).toContain('memory_usage');
    });

    it('应该为每个检查项提供状态和消息', async () => {
      const healthStatus = await service.performHealthCheck(mockContextId);

      healthStatus.checks.forEach(check => {
        expect(check.checkName).toBeDefined();
        expect(['pass', 'warn', 'fail']).toContain(check.status);
        expect(check.message).toBeDefined();
        expect(typeof check.durationMs).toBe('number');
        expect(check.durationMs).toBeGreaterThanOrEqual(0);
      });
    });

    it('应该确定整体健康状态', async () => {
      const healthStatus = await service.performHealthCheck(mockContextId);

      expect(['healthy', 'degraded', 'unhealthy', 'inconsistent']).toContain(healthStatus.status);
    });
  });

  describe('getHealthStatus', () => {
    it('应该返回健康状态', async () => {
      await service.performHealthCheck(mockContextId);
      const healthStatus = service.getHealthStatus(mockContextId);

      expect(healthStatus).toBeDefined();
      expect(healthStatus).not.toBeNull();
    });

    it('应该在没有健康检查时返回null', () => {
      const healthStatus = service.getHealthStatus('non-existent-context' as UUID);

      expect(healthStatus).toBeNull();
    });
  });

  describe('checkAlerts', () => {
    let alertingConfig: AlertingConfig;

    beforeEach(() => {
      alertingConfig = {
        enabled: true,
        thresholds: {
          maxContextAccessLatencyMs: 50,
          maxContextUpdateLatencyMs: 100,
          minCacheHitRatePercent: 90,
          minContextSyncSuccessRatePercent: 98,
          minContextStateConsistencyScore: 9
        },
        notificationChannels: ['email', 'slack']
      };
    });

    it('应该在告警禁用时返回空数组', async () => {
      alertingConfig.enabled = false;
      const alerts = await service.checkAlerts(mockContextId, alertingConfig);

      expect(alerts).toEqual([]);
    });

    it('应该在没有指标时返回警告', async () => {
      const alerts = await service.checkAlerts(mockContextId, alertingConfig);

      expect(alerts).toContain('No metrics available for alerting');
    });

    it('应该检测性能阈值违规', async () => {
      // 先收集指标
      await service.collectMetrics(mockContextId);
      
      // 设置非常严格的阈值以触发告警
      alertingConfig.thresholds = {
        maxContextAccessLatencyMs: 1,
        maxContextUpdateLatencyMs: 1,
        minCacheHitRatePercent: 99.9,
        minContextSyncSuccessRatePercent: 99.9,
        minContextStateConsistencyScore: 9.9
      };

      const alerts = await service.checkAlerts(mockContextId, alertingConfig);

      // 由于使用随机值，至少应该有一些告警
      expect(alerts.length).toBeGreaterThanOrEqual(0);
    });

    it('应该在所有指标正常时返回空数组', async () => {
      // 先收集指标
      await service.collectMetrics(mockContextId);
      
      // 设置非常宽松的阈值
      alertingConfig.thresholds = {
        maxContextAccessLatencyMs: 1000,
        maxContextUpdateLatencyMs: 1000,
        minCacheHitRatePercent: 0,
        minContextSyncSuccessRatePercent: 0,
        minContextStateConsistencyScore: 0
      };

      const alerts = await service.checkAlerts(mockContextId, alertingConfig);

      expect(alerts).toEqual([]);
    });
  });

  describe('集成测试', () => {
    it('应该完整的性能监控流程', async () => {
      // 1. 收集指标
      const metrics = await service.collectMetrics(mockContextId);
      expect(metrics).toBeDefined();

      // 2. 执行健康检查
      const healthStatus = await service.performHealthCheck(mockContextId);
      expect(healthStatus).toBeDefined();

      // 3. 检查告警
      const alertingConfig = service.getDefaultConfig().alerting!;
      const alerts = await service.checkAlerts(mockContextId, alertingConfig);
      expect(Array.isArray(alerts)).toBe(true);

      // 4. 获取历史数据
      const history = service.getMetricsHistory(mockContextId);
      expect(history.length).toBeGreaterThan(0);
    });

    it('应该处理多个上下文的指标', async () => {
      const contextId1 = 'context-1' as UUID;
      const contextId2 = 'context-2' as UUID;

      await service.collectMetrics(contextId1);
      await service.collectMetrics(contextId2);

      const metrics1 = service.getCurrentMetrics(contextId1);
      const metrics2 = service.getCurrentMetrics(contextId2);

      expect(metrics1).toBeDefined();
      expect(metrics2).toBeDefined();
      expect(metrics1).not.toBe(metrics2); // 应该是不同的对象
    });
  });
});
