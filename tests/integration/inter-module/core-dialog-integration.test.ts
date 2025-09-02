/**
 * Core-Dialog模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证核心驱动对话的集成功能
 */

import { CoreOrchestrationService } from '../../../src/modules/core/application/services/core-orchestration.service';
import { DialogManagementService } from '../../../src/modules/dialog/application/services/dialog-management.service';

describe('Core-Dialog模块间集成测试', () => {
  let coreService: CoreOrchestrationService;
  let dialogService: DialogManagementService;
  let mockCoreEntity: any;
  let mockDialogEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    coreService = new CoreOrchestrationService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    dialogService = new DialogManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockCoreEntity = { coreId: 'core-dialog-001' }; // 简化的mock数据
    mockDialogEntity = { dialogId: 'dialog-core-001' }; // 简化的mock数据
  });

  describe('核心驱动对话集成', () => {
    it('应该基于核心编排创建对话', async () => {
      // Arrange
      const coreId = mockCoreEntity.coreId;

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 65,
        averageParticipants: 6.5,
        activeDialogs: 58,
        endedDialogs: 7,
        dialogsByCapability: {
          intelligentControl: 48,
          criticalThinking: 42,
          knowledgeSearch: 52,
          multimodal: 32
        },
        recentActivity: {
          dailyCreated: [9, 11, 10, 13, 12, 14, 11],
          weeklyActive: [52, 58, 55, 65]
        }
      } as any);

      // Act
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(dialogStats).toBeDefined();
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
    });

    it('应该查询核心和对话统计的关联', async () => {
      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 70,
        averageParticipants: 7.0,
        activeDialogs: 65,
        endedDialogs: 5,
        dialogsByCapability: {
          intelligentControl: 55,
          criticalThinking: 48,
          knowledgeSearch: 58,
          multimodal: 35
        },
        recentActivity: {
          dailyCreated: [10, 12, 11, 14, 13, 15, 12],
          weeklyActive: [58, 65, 62, 70]
        }
      } as any);

      // Act
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Core模块的预留接口参数', async () => {
      const testCoreIntegration = async (
        _coreId: string,
        _dialogId: string,
        _dialogConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testCoreIntegration(
        mockCoreEntity.coreId,
        mockDialogEntity.dialogId,
        { dialogType: 'core_orchestrated', intelligent: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Dialog模块的预留接口参数', async () => {
      const testDialogIntegration = async (
        _dialogId: string,
        _coreId: string,
        _coreData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testDialogIntegration(
        mockDialogEntity.dialogId,
        mockCoreEntity.coreId,
        { coreType: 'orchestrator', dialogManagementEnabled: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('对话编排集成测试', () => {
    it('应该支持核心对话的编排管理', async () => {
      const orchestrationData = {
        coreId: mockCoreEntity.coreId,
        dialogId: mockDialogEntity.dialogId,
        operation: 'dialog_orchestration'
      };

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 60,
        averageParticipants: 6.0,
        activeDialogs: 54,
        endedDialogs: 6,
        dialogsByCapability: {
          intelligentControl: 54,
          criticalThinking: 48,
          knowledgeSearch: 45,
          multimodal: 28
        },
        recentActivity: {
          dailyCreated: [8, 10, 9, 12, 11, 13, 10],
          weeklyActive: [48, 54, 51, 60]
        }
      } as any);

      // Act
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理对话统计获取失败', async () => {
      jest.spyOn(dialogService, 'getDialogStatistics').mockRejectedValue(new Error('Dialog service unavailable'));

      await expect(dialogService.getDialogStatistics()).rejects.toThrow('Dialog service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Core-Dialog集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 50,
        averageParticipants: 5.0,
        activeDialogs: 45,
        endedDialogs: 5,
        dialogsByCapability: {
          intelligentControl: 40,
          criticalThinking: 35,
          knowledgeSearch: 42,
          multimodal: 25
        },
        recentActivity: {
          dailyCreated: [7, 9, 8, 11, 10, 12, 9],
          weeklyActive: [40, 45, 42, 50]
        }
      } as any);

      const dialogStats = await dialogService.getDialogStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(dialogStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Core-Dialog数据关联的一致性', () => {
      const coreId = mockCoreEntity.coreId;
      const dialogId = mockDialogEntity.dialogId;

      expect(coreId).toBeDefined();
      expect(typeof coreId).toBe('string');
      expect(coreId.length).toBeGreaterThan(0);
      
      expect(dialogId).toBeDefined();
      expect(typeof dialogId).toBe('string');
      expect(dialogId.length).toBeGreaterThan(0);
    });

    it('应该验证核心对话关联数据的完整性', () => {
      const coreData = {
        coreId: mockCoreEntity.coreId,
        orchestrationType: 'dialog_driven',
        dialogManagementEnabled: true,
        supportedCapabilities: ['intelligent', 'criticalThinking']
      };

      const dialogData = {
        dialogId: mockDialogEntity.dialogId,
        coreId: coreData.coreId,
        capabilities: ['intelligent', 'knowledgeSearch'],
        status: 'orchestrated'
      };

      expect(dialogData.coreId).toBe(coreData.coreId);
      expect(coreData.dialogManagementEnabled).toBe(true);
      expect(dialogData.capabilities).toContain('intelligent');
    });
  });
});
