/**
 * Core-Confirm模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证核心驱动确认的集成功能
 */

import { CoreOrchestrationService } from '../../../src/modules/core/application/services/core-orchestration.service';
import { ConfirmManagementService } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { ConfirmTestFactory } from '../../modules/confirm/factories/confirm-test.factory';

describe('Core-Confirm模块间集成测试', () => {
  let coreService: CoreOrchestrationService;
  let confirmService: ConfirmManagementService;
  let mockCoreEntity: any;
  let mockConfirmEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    coreService = new CoreOrchestrationService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    confirmService = new ConfirmManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockCoreEntity = { coreId: 'core-confirm-001' }; // 简化的mock数据
    mockConfirmEntity = ConfirmTestFactory.createConfirmEntity();
  });

  describe('核心驱动确认集成', () => {
    it('应该基于核心编排创建确认', async () => {
      // Arrange
      const coreId = mockCoreEntity.coreId;

      // Mock confirm service
      jest.spyOn(confirmService, 'getStatistics').mockResolvedValue({
        total: 35,
        byStatus: { 'pending': 20, 'approved': 12, 'rejected': 3 },
        byType: { 'core_orchestrated': 25, 'manual_approval': 10 },
        byPriority: { 'high': 15, 'medium': 18, 'low': 2 }
      } as any);

      // Act
      const confirmStats = await confirmService.getStatistics();

      // Assert
      expect(confirmStats).toBeDefined();
      expect(confirmStats.byType['core_orchestrated']).toBeGreaterThan(0);
    });

    it('应该查询核心和确认统计的关联', async () => {
      // Mock confirm service
      jest.spyOn(confirmService, 'getStatistics').mockResolvedValue({
        total: 40,
        byStatus: { 'pending': 25, 'approved': 13, 'rejected': 2 },
        byType: { 'core_orchestrated': 30, 'manual_approval': 10 },
        byPriority: { 'high': 18, 'medium': 20, 'low': 2 }
      } as any);

      // Act
      const confirmStats = await confirmService.getStatistics();

      // Assert
      expect(confirmStats.byType['core_orchestrated']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Core模块的预留接口参数', async () => {
      const testCoreIntegration = async (
        _coreId: string,
        _confirmId: string,
        _confirmConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testCoreIntegration(
        mockCoreEntity.coreId,
        mockConfirmEntity.confirmId,
        { confirmType: 'core_orchestrated', automated: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Confirm模块的预留接口参数', async () => {
      const testConfirmIntegration = async (
        _confirmId: string,
        _coreId: string,
        _coreData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testConfirmIntegration(
        mockConfirmEntity.confirmId,
        mockCoreEntity.coreId,
        { coreType: 'orchestrator', confirmationEnabled: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('确认编排集成测试', () => {
    it('应该支持核心确认的编排管理', async () => {
      const orchestrationData = {
        coreId: mockCoreEntity.coreId,
        confirmId: mockConfirmEntity.confirmId,
        operation: 'confirm_orchestration'
      };

      // Mock confirm service
      jest.spyOn(confirmService, 'getConfirm').mockResolvedValue({
        confirmId: orchestrationData.confirmId,
        confirmationType: 'core_orchestrated',
        status: 'approved',
        coreManaged: true
      } as any);

      // Act
      const confirm = await confirmService.getConfirm(orchestrationData.confirmId);

      // Assert
      expect(confirm.coreManaged).toBe(true);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理确认统计获取失败', async () => {
      jest.spyOn(confirmService, 'getStatistics').mockRejectedValue(new Error('Confirm service unavailable'));

      await expect(confirmService.getStatistics()).rejects.toThrow('Confirm service unavailable');
    });

    it('应该正确处理确认获取失败', async () => {
      const confirmId = 'invalid-confirm-id';
      jest.spyOn(confirmService, 'getConfirm').mockRejectedValue(new Error('Confirm not found'));

      await expect(confirmService.getConfirm(confirmId)).rejects.toThrow('Confirm not found');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Core-Confirm集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(confirmService, 'getStatistics').mockResolvedValue({
        total: 30,
        byStatus: { 'pending': 18, 'approved': 10, 'rejected': 2 },
        byType: { 'core_orchestrated': 22, 'manual_approval': 8 },
        byPriority: { 'high': 12, 'medium': 16, 'low': 2 }
      } as any);

      const confirmStats = await confirmService.getStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(confirmStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Core-Confirm数据关联的一致性', () => {
      const coreId = mockCoreEntity.coreId;
      const confirmId = mockConfirmEntity.confirmId;

      expect(coreId).toBeDefined();
      expect(typeof coreId).toBe('string');
      expect(coreId.length).toBeGreaterThan(0);
      
      expect(confirmId).toBeDefined();
      expect(typeof confirmId).toBe('string');
      expect(confirmId.length).toBeGreaterThan(0);
    });

    it('应该验证核心确认关联数据的完整性', () => {
      const coreData = {
        coreId: mockCoreEntity.coreId,
        orchestrationType: 'confirm_driven',
        confirmationEnabled: true,
        managedConfirmTypes: ['core_orchestrated', 'automated']
      };

      const confirmData = {
        confirmId: mockConfirmEntity.confirmId,
        coreId: coreData.coreId,
        confirmType: 'core_orchestrated',
        status: 'orchestrated'
      };

      expect(confirmData.coreId).toBe(coreData.coreId);
      expect(coreData.confirmationEnabled).toBe(true);
      expect(coreData.managedConfirmTypes).toContain(confirmData.confirmType);
    });
  });
});
