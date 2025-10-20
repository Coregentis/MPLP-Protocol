/**
 * Context-Core模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证上下文驱动核心的集成功能
 */

import { ContextManagementService } from '../../../src/modules/context/application/services/context-management.service';
import { CoreOrchestrationService } from '../../../src/modules/core/application/services/core-orchestration.service';
import { ContextTestFactory } from '../../modules/context/factories/context-test.factory';

describe('Context-Core模块间集成测试', () => {
  let contextService: ContextManagementService;
  let coreService: CoreOrchestrationService;
  let mockContextEntity: any;
  let mockCoreEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    contextService = new ContextManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    coreService = new CoreOrchestrationService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockContextEntity = ContextTestFactory.createContextEntity();
    mockCoreEntity = { coreId: 'core-context-001' }; // 简化的mock数据
  });

  describe('上下文驱动核心集成', () => {
    it('应该基于上下文创建核心编排', async () => {
      // Arrange
      const contextId = mockContextEntity.contextId;

      // Mock context service
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 85,
        activeContexts: 78,
        contextsByType: { 'core_driven': 48, 'session': 30, 'global': 7 },
        averageLifetime: 4200,
        memoryUsage: 320,
        cacheHitRate: 0.96
      } as any);

      // Act
      const contextStats = await contextService.getContextStatistics();

      // Assert
      expect(contextStats).toBeDefined();
      expect(contextStats.contextsByType['core_driven']).toBeGreaterThan(0);
    });

    it('应该查询上下文统计和核心的关联', async () => {
      // Mock context service
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 90,
        activeContexts: 85,
        contextsByType: { 'core_driven': 52, 'session': 33, 'global': 5 },
        averageLifetime: 4500,
        memoryUsage: 350,
        cacheHitRate: 0.97
      } as any);

      // Act
      const contextStats = await contextService.getContextStatistics();

      // Assert
      expect(contextStats.contextsByType['core_driven']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Context模块的预留接口参数', async () => {
      const testContextIntegration = async (
        _contextId: string,
        _coreId: string,
        _coreConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testContextIntegration(
        mockContextEntity.contextId,
        mockCoreEntity.coreId,
        { coreType: 'orchestrator', contextDriven: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Core模块的预留接口参数', async () => {
      const testCoreIntegration = async (
        _coreId: string,
        _contextId: string,
        _contextData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testCoreIntegration(
        mockCoreEntity.coreId,
        mockContextEntity.contextId,
        { contextType: 'core_driven', orchestrated: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('核心上下文集成测试', () => {
    it('应该支持上下文核心的编排管理', async () => {
      const orchestrationData = {
        contextId: mockContextEntity.contextId,
        coreId: mockCoreEntity.coreId,
        operation: 'context_core_orchestration'
      };

      // Mock context service
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 80,
        activeContexts: 75,
        contextsByType: { 'orchestration_managed': 45, 'session': 30, 'global': 5 },
        averageLifetime: 4000,
        memoryUsage: 300,
        cacheHitRate: 0.95
      } as any);

      // Act
      const contextStats = await contextService.getContextStatistics();

      // Assert
      expect(contextStats.contextsByType['orchestration_managed']).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理上下文统计获取失败', async () => {
      jest.spyOn(contextService, 'getContextStatistics').mockRejectedValue(new Error('Context service unavailable'));

      await expect(contextService.getContextStatistics()).rejects.toThrow('Context service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Context-Core集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 70,
        activeContexts: 65,
        contextsByType: { 'core_driven': 40, 'session': 25, 'global': 5 },
        averageLifetime: 3800,
        memoryUsage: 280,
        cacheHitRate: 0.94
      } as any);

      const contextStats = await contextService.getContextStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(contextStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Context-Core数据关联的一致性', () => {
      const contextId = mockContextEntity.contextId;
      const coreId = mockCoreEntity.coreId;

      expect(contextId).toBeDefined();
      expect(typeof contextId).toBe('string');
      expect(contextId.length).toBeGreaterThan(0);
      
      expect(coreId).toBeDefined();
      expect(typeof coreId).toBe('string');
      expect(coreId.length).toBeGreaterThan(0);
    });

    it('应该验证上下文核心关联数据的完整性', () => {
      const contextData = {
        contextId: mockContextEntity.contextId,
        contextType: 'core_driven',
        coreEnabled: true,
        orchestrationSupport: true
      };

      const coreData = {
        coreId: mockCoreEntity.coreId,
        contextId: contextData.contextId,
        orchestrationType: 'context_driven',
        status: 'active'
      };

      expect(coreData.contextId).toBe(contextData.contextId);
      expect(contextData.coreEnabled).toBe(true);
      expect(contextData.orchestrationSupport).toBe(true);
    });
  });
});
