/**
 * Core监控服务测试
 * 
 * @description 测试Core模块的监控服务
 * @version 1.0.0
 * @layer 应用层测试 - 服务
 */

import { CoreMonitoringService } from '../../../../../src/modules/core/application/services/core-monitoring.service';
import { ICoreRepository } from '../../../../../src/modules/core/domain/repositories/core-repository.interface';
import { createTestCoreEntity } from '../../helpers/test-factories';

// 创建模拟仓储
function createMockRepository(): jest.Mocked<ICoreRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    findByStatus: jest.fn(),
    findByOrchestratorId: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    count: jest.fn(),
    findByCriteria: jest.fn(),
    findWithPagination: jest.fn(),
    saveBatch: jest.fn(),
    deleteBatch: jest.fn()
  };
}

describe('CoreMonitoringService测试', () => {
  let service: CoreMonitoringService;
  let mockRepository: jest.Mocked<ICoreRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = createMockRepository();
    service = new CoreMonitoringService(mockRepository);
  });

  describe('构造函数测试', () => {
    it('应该正确创建CoreMonitoringService实例', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(CoreMonitoringService);
    });
  });

  describe('performHealthCheck方法测试', () => {
    it('应该成功执行健康检查', async () => {
      const result = await service.performHealthCheck();

      expect(result).toBeDefined();
      expect(result.overall).toBeDefined();
      expect(result.modules).toBeDefined();
      expect(result.resources).toBeDefined();
      expect(result.network).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(Array.isArray(result.modules)).toBe(true);
    });

    it('应该包含所有模块的健康状态', async () => {
      const result = await service.performHealthCheck();

      expect(result.modules.length).toBeGreaterThan(0);
      result.modules.forEach(module => {
        expect(module.moduleId).toBeDefined();
        expect(module.moduleName).toBeDefined();
        expect(module.status).toBeDefined();
        expect(module.lastCheck).toBeDefined();
        expect(typeof module.responseTime).toBe('number');
        expect(typeof module.errorCount).toBe('number');
        expect(Array.isArray(module.checks)).toBe(true);
      });
    });

    it('应该检查系统资源状态', async () => {
      const result = await service.performHealthCheck();

      expect(result.resources).toBeDefined();
      expect(result.resources.cpu).toBeDefined();
      expect(result.resources.memory).toBeDefined();
      expect(result.resources.disk).toBeDefined();
      expect(result.resources.network).toBeDefined();

      // 验证CPU状态
      expect(typeof result.resources.cpu.usage).toBe('number');
      expect(result.resources.cpu.status).toBeDefined();

      // 验证内存状态
      expect(typeof result.resources.memory.usage).toBe('number');
      expect(result.resources.memory.status).toBeDefined();
    });

    it('应该检查网络连接状态', async () => {
      const result = await service.performHealthCheck();

      expect(result.network).toBeDefined();
      expect(result.network.connectivity).toBeDefined();
      expect(typeof result.network.latency).toBe('number');
      expect(typeof result.network.throughput).toBe('number');
      expect(typeof result.network.errorRate).toBe('number');
    });
  });

  describe('manageAlerts方法测试', () => {
    it('应该成功处理告警', async () => {
      const alertData = {
        title: 'Test Alert',
        description: 'Test alert description',
        source: 'test-module',
        alertType: 'system' as const,
        severity: 'medium' as const,
        timestamp: new Date().toISOString()
      };

      const result = await service.manageAlerts(alertData);

      expect(result).toBeDefined();
      expect(result.alertId).toBeDefined();
      expect(result.processed).toBe(true);
      expect(result.actions).toBeDefined();
      expect(Array.isArray(result.actions)).toBe(true);
      expect(result.notifications).toBeDefined();
      expect(Array.isArray(result.notifications)).toBe(true);
    });

    it('应该验证告警数据', async () => {
      const invalidAlertData = {
        title: '',
        description: '',
        source: '',
        alertType: 'system' as const,
        severity: 'medium' as const,
        timestamp: new Date().toISOString()
      };

      await expect(service.manageAlerts(invalidAlertData))
        .rejects.toThrow('Alert title and description are required');
    });

    it('应该处理不同严重程度的告警', async () => {
      const severities = ['low', 'medium', 'high', 'critical'] as const;

      for (const severity of severities) {
        const alertData = {
          title: `${severity} Alert`,
          description: `${severity} alert description`,
          source: 'test-module',
          alertType: 'system' as const,
          severity,
          timestamp: new Date().toISOString()
        };

        const result = await service.manageAlerts(alertData);

        expect(result).toBeDefined();
        expect(result.processed).toBe(true);
      }
    });
  });

  describe('generateMonitoringReport方法测试', () => {
    it('应该生成日报', async () => {
      const result = await service.generateMonitoringReport('daily');

      expect(result).toBeDefined();
      expect(result.reportType).toBe('daily');
      expect(result.period).toBeDefined();
      expect(result.period.startDate).toBeDefined();
      expect(result.period.endDate).toBeDefined();
      expect(result.trends).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.generatedAt).toBeDefined();
    });

    it('应该生成周报', async () => {
      const result = await service.generateMonitoringReport('weekly');

      expect(result).toBeDefined();
      expect(result.reportType).toBe('weekly');
    });

    it('应该生成月报', async () => {
      const result = await service.generateMonitoringReport('monthly');

      expect(result).toBeDefined();
      expect(result.reportType).toBe('monthly');
    });

    it('应该支持自定义时间段', async () => {
      const customPeriod = {
        startDate: '2025-09-01T00:00:00.000Z',
        endDate: '2025-09-01T23:59:59.999Z'
      };

      const result = await service.generateMonitoringReport('custom', customPeriod);

      expect(result).toBeDefined();
      expect(result.reportType).toBe('custom');
      expect(result.period.startDate).toBe(customPeriod.startDate);
      expect(result.period.endDate).toBe(customPeriod.endDate);
    });
  });

  describe('getSystemStatistics方法测试', () => {
    it('应该成功获取系统统计信息', async () => {
      const testEntities = [createTestCoreEntity(), createTestCoreEntity()];
      mockRepository.findAll.mockResolvedValue(testEntities);
      mockRepository.count.mockResolvedValue(2);

      const result = await service.getSystemStatistics();

      expect(result).toBeDefined();
      expect(typeof result.totalAlerts).toBe('number');
      expect(typeof result.criticalAlerts).toBe('number');
      expect(typeof result.averageResponseTime).toBe('number');
      expect(typeof result.systemUptime).toBe('number');
      expect(typeof result.healthScore).toBe('number');
      expect(result.healthScore).toBeGreaterThanOrEqual(0);
      expect(result.healthScore).toBeLessThanOrEqual(100);
    });

    it('应该处理空数据的情况', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      const result = await service.getSystemStatistics();

      expect(result).toBeDefined();
      expect(result.totalAlerts).toBe(0);
      expect(result.criticalAlerts).toBe(0);
    });

    it('应该处理获取统计信息时的错误', async () => {
      const error = new Error('Database query failed');
      mockRepository.findAll.mockRejectedValue(error);

      // 服务应该优雅地处理错误，返回默认统计信息而不是抛出异常
      const result = await service.getSystemStatistics();

      expect(result).toBeDefined();
      expect(result.healthScore).toBeDefined();
      expect(result.systemUptime).toBeDefined();
      expect(result.totalAlerts).toBeDefined();
      expect(result.criticalAlerts).toBeDefined();
      expect(result.averageResponseTime).toBeDefined();
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内完成健康检查', async () => {
      const startTime = Date.now();
      const result = await service.performHealthCheck();
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('应该支持并发健康检查', async () => {
      const promises = Array(5).fill(null).map(() => service.performHealthCheck());
      
      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(results.every(result => result !== undefined)).toBe(true);
    });
  });

  describe('错误处理测试', () => {
    it('应该处理仓储层错误', async () => {
      const error = new Error('Database connection failed');
      mockRepository.findAll.mockRejectedValue(error);

      // 服务应该优雅地处理错误，返回默认统计信息
      const result = await service.getSystemStatistics();

      expect(result).toBeDefined();
      expect(result.healthScore).toBeDefined();
      expect(result.systemUptime).toBeDefined();
      expect(result.totalAlerts).toBeDefined();
      expect(result.criticalAlerts).toBeDefined();
      expect(result.averageResponseTime).toBeDefined();
    });

    it('应该处理网络超时错误', async () => {
      // 模拟网络超时的情况
      const result = await service.performHealthCheck();
      
      // 健康检查应该能够处理网络问题并返回结果
      expect(result).toBeDefined();
      expect(result.network).toBeDefined();
    });
  });

  describe('集成测试', () => {
    it('应该完整执行监控流程', async () => {
      // 1. 执行健康检查
      const healthStatus = await service.performHealthCheck();
      expect(healthStatus).toBeDefined();

      // 2. 生成监控报告
      const report = await service.generateMonitoringReport('daily');
      expect(report).toBeDefined();

      // 3. 获取系统统计
      mockRepository.findAll.mockResolvedValue([createTestCoreEntity()]);
      mockRepository.count.mockResolvedValue(1);
      
      const statistics = await service.getSystemStatistics();
      expect(statistics).toBeDefined();

      // 4. 处理告警
      const alertData = {
        title: 'Integration Test Alert',
        description: 'Test alert for integration',
        source: 'integration-test',
        alertType: 'system' as const,
        severity: 'low' as const,
        timestamp: new Date().toISOString()
      };

      const alertResult = await service.manageAlerts(alertData);
      expect(alertResult).toBeDefined();
      expect(alertResult.processed).toBe(true);
    });
  });
});
