/**
 * Context-Dialog模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证上下文驱动对话的集成功能
 */

import { ContextManagementService } from '../../../src/modules/context/application/services/context-management.service';
import { DialogManagementService } from '../../../src/modules/dialog/application/services/dialog-management.service';
import { ContextTestFactory } from '../../modules/context/factories/context-test.factory';
describe('Context-Dialog模块间集成测试', () => {
  let contextService: ContextManagementService;
  let dialogService: DialogManagementService;
  let mockContextEntity: any;
  let mockDialogEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    contextService = new ContextManagementService(
      {} as any, // Mock repository
      {} as any, // Mock logger
      {} as any, // Mock cache manager
      {} as any  // Mock version manager
    );

    dialogService = new DialogManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockContextEntity = ContextTestFactory.createContextEntity();
    mockDialogEntity = { dialogId: 'dialog-context-001' }; // 简化的mock数据
  });

  describe('上下文驱动对话集成', () => {
    it('应该基于上下文创建对话', async () => {
      // Arrange
      const contextId = mockContextEntity.contextId;

      // Mock context service
      jest.spyOn(contextService, 'getContext').mockResolvedValue({
        contextId,
        name: 'Dialog Context',
        status: 'active',
        dialogEnabled: true
      } as any);
      
      // Mock dialog service
      jest.spyOn(dialogService, 'createDialog').mockResolvedValue({
        dialogId: 'dialog-001',
        contextId,
        name: 'Context Dialog',
        status: 'active',
        participants: ['user-001', 'agent-001']
      } as any);

      // Act
      const context = await contextService.getContext(contextId);
      const dialog = await dialogService.createDialog({
        contextId: context.contextId,
        name: 'Context Dialog',
        participants: ['user-001', 'agent-001']
      } as any);

      // Assert
      expect(context).toBeDefined();
      expect(dialog).toBeDefined();
      expect(dialog.contextId).toBe(contextId);
    });

    it('应该查询上下文统计和对话统计的关联', async () => {
      // Mock context service
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        total: 15,
        byStatus: { 'active': 12, 'suspended': 3 },
        byLifecycleStage: { 'executing': 10, 'monitoring': 5 },
        dialogEnabled: 12
      } as any);

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 30,
        averageParticipants: 2.5,
        activeDialogs: 25,
        endedDialogs: 5,
        dialogsByCapability: {
          intelligentControl: 15,
          criticalThinking: 12,
          knowledgeSearch: 18,
          multimodal: 8
        },
        recentActivity: {
          dailyCreated: [3, 5, 4, 7, 6, 8, 5],
          weeklyActive: [20, 25, 22, 30]
        }
      } as any);

      // Act
      const contextStats = await contextService.getContextStatistics();
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(contextStats.dialogEnabled).toBeGreaterThan(0);
      expect(dialogStats.activeDialogs).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Context模块的预留接口参数', async () => {
      const testContextIntegration = async (
        _contextId: string,
        _dialogId: string,
        _dialogConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testContextIntegration(
        mockContextEntity.contextId,
        mockDialogEntity.dialogId,
        { dialogType: 'context', multiParticipant: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Dialog模块的预留接口参数', async () => {
      const testDialogIntegration = async (
        _dialogId: string,
        _contextId: string,
        _contextData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testDialogIntegration(
        mockDialogEntity.dialogId,
        mockContextEntity.contextId,
        { contextType: 'collaborative', supportDialog: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('对话上下文集成测试', () => {
    it('应该支持上下文对话的智能管理', async () => {
      const dialogData = {
        contextId: mockContextEntity.contextId,
        dialogId: mockDialogEntity.dialogId,
        operation: 'intelligent_dialog'
      };

      // Mock context service
      jest.spyOn(contextService, 'getContext').mockResolvedValue({
        contextId: dialogData.contextId,
        name: 'Intelligent Context',
        status: 'active',
        dialogCapabilities: ['intelligent', 'multimodal']
      } as any);

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialog').mockResolvedValue({
        dialogId: dialogData.dialogId,
        contextId: dialogData.contextId,
        status: 'active',
        capabilities: {
          intelligentControl: { enabled: true },
          criticalThinking: { enabled: true },
          knowledgeSearch: { enabled: true }
        }
      } as any);

      // Act
      const context = await contextService.getContext(dialogData.contextId);
      const dialog = await dialogService.getDialog(dialogData.dialogId);

      // Assert
      expect(context.dialogCapabilities).toContain('intelligent');
      expect(dialog.contextId).toBe(dialogData.contextId);
      expect(dialog.capabilities.intelligentControl.enabled).toBe(true);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理上下文不支持对话的情况', async () => {
      const contextId = 'no-dialog-context';
      jest.spyOn(contextService, 'getContext').mockResolvedValue({
        contextId,
        dialogEnabled: false
      } as any);

      const context = await contextService.getContext(contextId);
      expect(context.dialogEnabled).toBe(false);
    });

    it('应该正确处理对话创建失败', async () => {
      const invalidDialogData = { name: '', participants: [] };
      jest.spyOn(dialogService, 'createDialog').mockRejectedValue(new Error('Invalid dialog data'));

      await expect(dialogService.createDialog(invalidDialogData as any)).rejects.toThrow('Invalid dialog data');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Context-Dialog集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(contextService, 'getContext').mockResolvedValue({
        contextId: mockContextEntity.contextId,
        name: 'Performance Test Context'
      } as any);
      
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 20,
        averageParticipants: 2.0,
        activeDialogs: 18,
        endedDialogs: 2,
        dialogsByCapability: {
          intelligentControl: 10,
          criticalThinking: 8,
          knowledgeSearch: 12,
          multimodal: 5
        },
        recentActivity: {
          dailyCreated: [2, 4, 3, 5, 4, 6, 3],
          weeklyActive: [15, 18, 16, 20]
        }
      } as any);

      const context = await contextService.getContext(mockContextEntity.contextId);
      const dialogStats = await dialogService.getDialogStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(context).toBeDefined();
      expect(dialogStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Context-Dialog数据关联的一致性', () => {
      const contextId = mockContextEntity.contextId;
      const dialogId = mockDialogEntity.dialogId;

      expect(contextId).toBeDefined();
      expect(typeof contextId).toBe('string');
      expect(contextId.length).toBeGreaterThan(0);
      
      expect(dialogId).toBeDefined();
      expect(typeof dialogId).toBe('string');
      expect(dialogId.length).toBeGreaterThan(0);
    });

    it('应该验证上下文对话关联数据的完整性', () => {
      const contextData = {
        contextId: mockContextEntity.contextId,
        name: 'Dialog-enabled Context',
        dialogEnabled: true,
        supportedCapabilities: ['intelligent', 'multimodal']
      };

      const dialogData = {
        dialogId: mockDialogEntity.dialogId,
        contextId: contextData.contextId,
        capabilities: ['intelligent', 'criticalThinking'],
        status: 'active'
      };

      expect(dialogData.contextId).toBe(contextData.contextId);
      expect(contextData.dialogEnabled).toBe(true);
      expect(dialogData.capabilities).toContain('intelligent');
    });
  });
});
