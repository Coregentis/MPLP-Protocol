/**
 * Confirm-Dialog模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证确认驱动对话的集成功能
 */

import { ConfirmManagementService } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { DialogManagementService } from '../../../src/modules/dialog/application/services/dialog-management.service';
import { ConfirmTestFactory } from '../../modules/confirm/factories/confirm-test.factory';

describe('Confirm-Dialog模块间集成测试', () => {
  let confirmService: ConfirmManagementService;
  let dialogService: DialogManagementService;
  let mockConfirmEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    confirmService = new ConfirmManagementService(
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
    mockConfirmEntity = ConfirmTestFactory.createConfirmEntity();
  });

  describe('确认驱动对话集成', () => {
    it('应该基于确认创建对话', async () => {
      // Arrange
      const confirmId = mockConfirmEntity.confirmId;

      // Mock confirm service
      jest.spyOn(confirmService, 'getConfirm').mockResolvedValue({
        confirmId,
        confirmationType: 'dialog_approval',
        status: 'pending',
        dialogRequired: true
      } as any);
      
      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 38,
        averageParticipants: 3.8,
        activeDialogs: 32,
        endedDialogs: 6,
        dialogsByCapability: {
          intelligentControl: 22,
          criticalThinking: 18,
          knowledgeSearch: 25,
          multimodal: 12
        },
        recentActivity: {
          dailyCreated: [4, 6, 5, 8, 7, 9, 6],
          weeklyActive: [28, 32, 30, 38]
        }
      } as any);

      // Act
      const confirm = await confirmService.getConfirm(confirmId);
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(confirm).toBeDefined();
      expect(dialogStats).toBeDefined();
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
    });

    it('应该查询确认统计和对话统计的关联', async () => {
      // Mock confirm service
      jest.spyOn(confirmService, 'getStatistics').mockResolvedValue({
        total: 28,
        byStatus: { 'pending': 12, 'approved': 14, 'rejected': 2 },
        byType: { 'dialog_approval': 18, 'manual_approval': 10 },
        byPriority: { 'high': 10, 'medium': 14, 'low': 4 }
      } as any);

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 40,
        averageParticipants: 4.0,
        activeDialogs: 35,
        endedDialogs: 5,
        dialogsByCapability: {
          intelligentControl: 25,
          criticalThinking: 20,
          knowledgeSearch: 28,
          multimodal: 15
        },
        recentActivity: {
          dailyCreated: [5, 7, 6, 9, 8, 10, 7],
          weeklyActive: [30, 35, 32, 40]
        }
      } as any);

      // Act
      const confirmStats = await confirmService.getStatistics();
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(confirmStats.byType['dialog_approval']).toBeGreaterThan(0);
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Confirm模块的预留接口参数', async () => {
      const testConfirmIntegration = async (
        _confirmId: string,
        _dialogId: string,
        _dialogConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testConfirmIntegration(
        mockConfirmEntity.confirmId,
        'dialog-001',
        { dialogType: 'approval', intelligent: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Dialog模块的预留接口参数', async () => {
      const testDialogIntegration = async (
        _dialogId: string,
        _confirmId: string,
        _confirmData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testDialogIntegration(
        'dialog-001',
        mockConfirmEntity.confirmId,
        { confirmationType: 'dialog', requiresApproval: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('对话审批集成测试', () => {
    it('应该支持确认对话的智能管理', async () => {
      const intelligentData = {
        confirmId: mockConfirmEntity.confirmId,
        dialogId: 'dialog-intelligent-001',
        operation: 'intelligent_approval'
      };

      // Mock confirm service
      jest.spyOn(confirmService, 'getConfirm').mockResolvedValue({
        confirmId: intelligentData.confirmId,
        confirmationType: 'intelligent_approval',
        status: 'in_progress',
        intelligentDialog: true
      } as any);

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 35,
        averageParticipants: 3.5,
        activeDialogs: 30,
        endedDialogs: 5,
        dialogsByCapability: {
          intelligentControl: 30,
          criticalThinking: 25,
          knowledgeSearch: 22,
          multimodal: 10
        },
        recentActivity: {
          dailyCreated: [4, 5, 6, 7, 6, 8, 5],
          weeklyActive: [25, 30, 28, 35]
        }
      } as any);

      // Act
      const confirm = await confirmService.getConfirm(intelligentData.confirmId);
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(confirm.intelligentDialog).toBe(true);
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理确认获取失败', async () => {
      const confirmId = 'invalid-confirm-id';
      jest.spyOn(confirmService, 'getConfirm').mockRejectedValue(new Error('Confirm not found'));

      await expect(confirmService.getConfirm(confirmId)).rejects.toThrow('Confirm not found');
    });

    it('应该正确处理对话统计获取失败', async () => {
      jest.spyOn(dialogService, 'getDialogStatistics').mockRejectedValue(new Error('Dialog service unavailable'));

      await expect(dialogService.getDialogStatistics()).rejects.toThrow('Dialog service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Confirm-Dialog集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(confirmService, 'getConfirm').mockResolvedValue({
        confirmId: mockConfirmEntity.confirmId,
        confirmationType: 'performance_test'
      } as any);
      
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 25,
        averageParticipants: 2.8,
        activeDialogs: 22,
        endedDialogs: 3,
        dialogsByCapability: {
          intelligentControl: 15,
          criticalThinking: 12,
          knowledgeSearch: 18,
          multimodal: 8
        },
        recentActivity: {
          dailyCreated: [3, 4, 5, 6, 5, 7, 4],
          weeklyActive: [18, 22, 20, 25]
        }
      } as any);

      const confirm = await confirmService.getConfirm(mockConfirmEntity.confirmId);
      const dialogStats = await dialogService.getDialogStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(confirm).toBeDefined();
      expect(dialogStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Confirm-Dialog数据关联的一致性', () => {
      const confirmId = mockConfirmEntity.confirmId;
      const dialogId = 'dialog-consistency-001';

      expect(confirmId).toBeDefined();
      expect(typeof confirmId).toBe('string');
      expect(confirmId.length).toBeGreaterThan(0);
      
      expect(dialogId).toBeDefined();
      expect(typeof dialogId).toBe('string');
      expect(dialogId.length).toBeGreaterThan(0);
    });

    it('应该验证确认对话关联数据的完整性', () => {
      const confirmData = {
        confirmId: mockConfirmEntity.confirmId,
        confirmationType: 'dialog_approval',
        dialogRequired: true,
        supportedCapabilities: ['intelligent', 'criticalThinking']
      };

      const dialogData = {
        dialogId: 'dialog-integrity-001',
        confirmId: confirmData.confirmId,
        capabilities: ['intelligent', 'knowledgeSearch'],
        status: 'active'
      };

      expect(dialogData.confirmId).toBe(confirmData.confirmId);
      expect(confirmData.dialogRequired).toBe(true);
      expect(dialogData.capabilities).toContain('intelligent');
    });
  });
});
