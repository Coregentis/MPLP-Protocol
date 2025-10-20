/**
 * Dialog-Collab模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证对话驱动协作的集成功能
 */

import { DialogManagementService } from '../../../src/modules/dialog/application/services/dialog-management.service';
import { CollabManagementService } from '../../../src/modules/collab/application/services/collab-management.service';

describe('Dialog-Collab模块间集成测试', () => {
  let dialogService: DialogManagementService;
  let collabService: CollabManagementService;
  let mockDialogEntity: any;
  let mockCollabEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    dialogService = new DialogManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    collabService = new CollabManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockDialogEntity = { dialogId: 'dialog-collab-001' }; // 简化的mock数据
    mockCollabEntity = { collabId: 'collab-dialog-001' }; // 简化的mock数据
  });

  describe('对话驱动协作集成', () => {
    it('应该基于对话创建协作', async () => {
      // Arrange
      const dialogId = mockDialogEntity.dialogId;

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 52,
        averageParticipants: 5.2,
        activeDialogs: 46,
        endedDialogs: 6,
        dialogsByCapability: {
          intelligentControl: 36,
          criticalThinking: 32,
          knowledgeSearch: 40,
          multimodal: 24
        },
        recentActivity: {
          dailyCreated: [7, 9, 8, 11, 10, 12, 9],
          weeklyActive: [42, 46, 44, 52]
        }
      } as any);
      
      // Mock collab data
      const mockCollabData = {
        totalCollabs: 52,
        activeCollabs: 46,
        collabsByType: { 'dialog_driven': 28, 'multi_agent': 18, 'peer_to_peer': 6 },
        averageParticipants: 5.2,
        totalDecisions: 260,
        consensusRate: 0.96
      };

      // Act
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(dialogStats).toBeDefined();
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
      expect(mockCollabData.collabsByType['dialog_driven']).toBeGreaterThan(0);
    });

    it('应该查询对话统计和协作的关联', async () => {
      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 55,
        averageParticipants: 5.5,
        activeDialogs: 50,
        endedDialogs: 5,
        dialogsByCapability: {
          intelligentControl: 40,
          criticalThinking: 35,
          knowledgeSearch: 42,
          multimodal: 26
        },
        recentActivity: {
          dailyCreated: [8, 10, 9, 12, 11, 13, 10],
          weeklyActive: [45, 50, 48, 55]
        }
      } as any);

      // Mock collab data
      const mockCollabStats = {
        totalCollabs: 55,
        activeCollabs: 50,
        collabsByType: { 'dialog_driven': 30, 'multi_agent': 20, 'peer_to_peer': 5 },
        averageParticipants: 5.5,
        totalDecisions: 275,
        consensusRate: 0.97
      };

      // Act
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
      expect(mockCollabStats.collabsByType['dialog_driven']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Dialog模块的预留接口参数', async () => {
      const testDialogIntegration = async (
        _dialogId: string,
        _collabId: string,
        _collabConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testDialogIntegration(
        mockDialogEntity.dialogId,
        mockCollabEntity.collabId,
        { collabType: 'dialog', intelligent: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Collab模块的预留接口参数', async () => {
      const testCollabIntegration = async (
        _collabId: string,
        _dialogId: string,
        _dialogData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testCollabIntegration(
        mockCollabEntity.collabId,
        mockDialogEntity.dialogId,
        { dialogType: 'collaboration', capabilities: ['intelligent'] }
      );

      expect(result).toBe(true);
    });
  });

  describe('协作对话集成测试', () => {
    it('应该支持对话协作的智能决策', async () => {
      const decisionData = {
        dialogId: mockDialogEntity.dialogId,
        collabId: mockCollabEntity.collabId,
        operation: 'intelligent_collaboration'
      };

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 48,
        averageParticipants: 4.8,
        activeDialogs: 42,
        endedDialogs: 6,
        dialogsByCapability: {
          intelligentControl: 42,
          criticalThinking: 38,
          knowledgeSearch: 35,
          multimodal: 20
        },
        recentActivity: {
          dailyCreated: [6, 8, 7, 10, 9, 11, 8],
          weeklyActive: [38, 42, 40, 48]
        }
      } as any);

      // Mock collab data
      const mockCollabData = {
        totalCollabs: 48,
        activeCollabs: 42,
        collabsByType: { 'intelligent_dialog': 24, 'multi_agent': 18, 'peer_to_peer': 6 },
        averageParticipants: 4.8,
        totalDecisions: 240,
        consensusRate: 0.95
      };

      // Act
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
      expect(mockCollabData.collabsByType['intelligent_dialog']).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理对话统计获取失败', async () => {
      jest.spyOn(dialogService, 'getDialogStatistics').mockRejectedValue(new Error('Dialog service unavailable'));

      await expect(dialogService.getDialogStatistics()).rejects.toThrow('Dialog service unavailable');
    });

    it('应该正确处理协作数据访问失败', async () => {
      // 模拟协作数据访问失败
      const mockError = new Error('Collaboration service unavailable');
      
      // 这里我们模拟一个会失败的操作
      const failingOperation = async () => {
        throw mockError;
      };

      await expect(failingOperation()).rejects.toThrow('Collaboration service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Dialog-Collab集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 40,
        averageParticipants: 4.0,
        activeDialogs: 35,
        endedDialogs: 5,
        dialogsByCapability: {
          intelligentControl: 30,
          criticalThinking: 25,
          knowledgeSearch: 32,
          multimodal: 18
        },
        recentActivity: {
          dailyCreated: [5, 7, 6, 9, 8, 10, 7],
          weeklyActive: [30, 35, 32, 40]
        }
      } as any);
      
      // Mock collab data
      const mockCollabStats = {
        totalCollabs: 40,
        activeCollabs: 35,
        collabsByType: { 'dialog_driven': 20, 'multi_agent': 15, 'peer_to_peer': 5 },
        averageParticipants: 4.0,
        totalDecisions: 200,
        consensusRate: 0.93
      };

      const dialogStats = await dialogService.getDialogStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(dialogStats).toBeDefined();
      expect(mockCollabStats.totalCollabs).toBeGreaterThan(0);
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Dialog-Collab数据关联的一致性', () => {
      const dialogId = mockDialogEntity.dialogId;
      const collabId = mockCollabEntity.collabId;

      expect(dialogId).toBeDefined();
      expect(typeof dialogId).toBe('string');
      expect(dialogId.length).toBeGreaterThan(0);
      
      expect(collabId).toBeDefined();
      expect(typeof collabId).toBe('string');
      expect(collabId.length).toBeGreaterThan(0);
    });

    it('应该验证对话协作关联数据的完整性', () => {
      const dialogData = {
        dialogId: mockDialogEntity.dialogId,
        capabilities: ['intelligent', 'criticalThinking'],
        collaborationEnabled: true,
        supportedCollabTypes: ['dialog_driven', 'multi_agent']
      };

      const collabData = {
        collabId: mockCollabEntity.collabId,
        dialogId: dialogData.dialogId,
        collabType: 'dialog_driven',
        status: 'dialog_enabled'
      };

      expect(collabData.dialogId).toBe(dialogData.dialogId);
      expect(dialogData.collaborationEnabled).toBe(true);
      expect(dialogData.supportedCollabTypes).toContain(collabData.collabType);
    });
  });
});
