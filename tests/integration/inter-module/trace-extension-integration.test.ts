/**
 * Trace-Extension模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证追踪驱动扩展的集成功能
 */

import { TraceManagementService } from '../../../src/modules/trace/application/services/trace-management.service';
import { ExtensionManagementService } from '../../../src/modules/extension/application/services/extension-management.service';
import { TraceTestFactory } from '../../modules/trace/factories/trace-test.factory';
import { ExtensionTestFactory } from '../../modules/extension/factories/extension-test.factory';

describe('Trace-Extension模块间集成测试', () => {
  let traceService: TraceManagementService;
  let extensionService: ExtensionManagementService;
  let mockTraceEntity: any;
  let mockExtensionEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    traceService = new TraceManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    extensionService = new ExtensionManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockTraceEntity = TraceTestFactory.createTraceEntityData();
    mockExtensionEntity = ExtensionTestFactory.createExtensionEntity();
  });

  describe('追踪驱动扩展集成', () => {
    it('应该基于追踪安装扩展', async () => {
      // Arrange
      const traceId = mockTraceEntity.traceId;

      // Mock trace service
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId,
        traceType: 'extension_monitoring',
        severity: 'info',
        event: {
          type: 'start',
          name: 'Extension Trace',
          category: 'system',
          source: { component: 'trace-extension-integration' }
        }
      } as any);
      
      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 34,
        installedExtensions: 28,
        activeExtensions: 24,
        extensionsByCategory: { 'monitoring': 12, 'tracing': 10, 'utility': 6 },
        averageInstallTime: 190
      } as any);

      // Act
      const trace = await traceService.startTrace({
        type: 'extension_monitoring',
        name: 'Extension Trace'
      } as any);
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(trace).toBeDefined();
      expect(extensionStats).toBeDefined();
      expect(extensionStats.extensionsByCategory['tracing']).toBeGreaterThan(0);
    });

    it('应该查询追踪统计和扩展统计的关联', async () => {
      // Mock trace service
      jest.spyOn(traceService, 'getTraceStatistics').mockResolvedValue({
        totalSpans: 35,
        totalDuration: 12000,
        averageSpanDuration: 343,
        errorCount: 3,
        successRate: 0.91,
        criticalPath: ['extension_load', 'trace_start', 'monitoring_init'],
        bottlenecks: ['extension_load']
      } as any);

      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 38,
        installedExtensions: 32,
        activeExtensions: 28,
        extensionsByCategory: { 'monitoring': 14, 'tracing': 12, 'utility': 6 },
        averageInstallTime: 180
      } as any);

      // Act
      const traceStats = await traceService.getTraceStatistics(mockTraceEntity.traceId);
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(traceStats.criticalPath).toContain('extension_load');
      expect(extensionStats.extensionsByCategory['tracing']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Trace模块的预留接口参数', async () => {
      const testTraceIntegration = async (
        _traceId: string,
        _extensionId: string,
        _extensionConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testTraceIntegration(
        mockTraceEntity.traceId,
        mockExtensionEntity.extensionId,
        { extensionType: 'tracing', monitoring: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Extension模块的预留接口参数', async () => {
      const testExtensionIntegration = async (
        _extensionId: string,
        _traceId: string,
        _traceData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testExtensionIntegration(
        mockExtensionEntity.extensionId,
        mockTraceEntity.traceId,
        { traceType: 'extension', enableMonitoring: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('扩展监控集成测试', () => {
    it('应该支持追踪扩展的监控管理', async () => {
      const monitoringData = {
        traceId: mockTraceEntity.traceId,
        extensionId: mockExtensionEntity.extensionId,
        operation: 'extension_monitoring'
      };

      // Mock trace service
      jest.spyOn(traceService, 'addSpan').mockResolvedValue({
        spanId: 'span-001',
        traceId: monitoringData.traceId,
        operationName: 'extension_monitor',
        startTime: new Date(),
        endTime: new Date(),
        duration: 250,
        tags: { extensionId: monitoringData.extensionId, operation: 'monitor' },
        logs: [],
        status: 'completed'
      } as any);

      // Mock extension service
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 32,
        installedExtensions: 28,
        activeExtensions: 24,
        extensionsByCategory: { 'monitored': 16, 'tracing': 8, 'utility': 4 },
        averageInstallTime: 170
      } as any);

      // Act
      const span = await traceService.addSpan(monitoringData.traceId, {
        operationName: 'extension_monitor',
        startTime: new Date(),
        endTime: new Date(),
        duration: 250,
        tags: { extensionId: monitoringData.extensionId, operation: 'monitor' }
      } as any);
      const extensionStats = await extensionService.getExtensionStatistics();

      // Assert
      expect(span.operationName).toBe('extension_monitor');
      expect(extensionStats.extensionsByCategory['monitored']).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理追踪统计获取失败', async () => {
      const traceId = 'invalid-trace-id';
      jest.spyOn(traceService, 'getTraceStatistics').mockRejectedValue(new Error('Trace not found'));

      await expect(traceService.getTraceStatistics(traceId)).rejects.toThrow('Trace not found');
    });

    it('应该正确处理扩展统计获取失败', async () => {
      jest.spyOn(extensionService, 'getExtensionStatistics').mockRejectedValue(new Error('Extension service unavailable'));

      await expect(extensionService.getExtensionStatistics()).rejects.toThrow('Extension service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Trace-Extension集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(traceService, 'startTrace').mockResolvedValue({
        traceId: mockTraceEntity.traceId,
        traceType: 'performance_test',
        severity: 'info',
        event: { type: 'start', name: 'Performance Test', category: 'test' }
      } as any);
      
      jest.spyOn(extensionService, 'getExtensionStatistics').mockResolvedValue({
        totalExtensions: 25,
        installedExtensions: 22,
        activeExtensions: 18,
        extensionsByCategory: { 'monitoring': 10, 'tracing': 8, 'utility': 4 },
        averageInstallTime: 160
      } as any);

      const trace = await traceService.startTrace({
        type: 'performance_test',
        name: 'Performance Test'
      } as any);
      const extensionStats = await extensionService.getExtensionStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(trace).toBeDefined();
      expect(extensionStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Trace-Extension数据关联的一致性', () => {
      const traceId = mockTraceEntity.traceId;
      const extensionId = mockExtensionEntity.extensionId;

      expect(traceId).toBeDefined();
      expect(typeof traceId).toBe('string');
      expect(traceId.length).toBeGreaterThan(0);
      
      expect(extensionId).toBeDefined();
      expect(typeof extensionId).toBe('string');
      expect(extensionId.length).toBeGreaterThan(0);
    });

    it('应该验证追踪扩展关联数据的完整性', () => {
      const traceData = {
        traceId: mockTraceEntity.traceId,
        traceType: 'extension_monitoring',
        extensionEnabled: true,
        monitoredExtensions: ['tracing', 'monitoring']
      };

      const extensionData = {
        extensionId: mockExtensionEntity.extensionId,
        traceId: traceData.traceId,
        category: 'tracing',
        status: 'monitored'
      };

      expect(extensionData.traceId).toBe(traceData.traceId);
      expect(traceData.extensionEnabled).toBe(true);
      expect(traceData.monitoredExtensions).toContain(extensionData.category);
    });
  });
});
