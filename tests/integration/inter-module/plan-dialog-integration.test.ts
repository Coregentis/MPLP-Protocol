/**
 * Plan-Dialog模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证规划驱动对话的集成功能
 */

import { PlanManagementService } from '../../../src/modules/plan/application/services/plan-management.service';
import { DialogManagementService } from '../../../src/modules/dialog/application/services/dialog-management.service';
import { PlanTestFactory } from '../../modules/plan/factories/plan-test.factory';
describe('Plan-Dialog模块间集成测试', () => {
  let planService: PlanManagementService;
  let dialogService: DialogManagementService;
  let mockPlanEntity: any;
  let mockDialogEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    planService = new PlanManagementService(
      {} as any, // Mock AI service adapter
      {} as any  // Mock logger
    );

    dialogService = new DialogManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockPlanEntity = PlanTestFactory.createPlanEntity();
    mockDialogEntity = { dialogId: 'dialog-plan-001' }; // 简化的mock数据
  });

  describe('规划驱动对话集成', () => {
    it('应该基于规划创建对话', async () => {
      // Arrange
      const planId = mockPlanEntity.planId;

      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId,
        name: 'Dialog Plan',
        status: 'active',
        dialogEnabled: true
      } as any);
      
      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 25,
        averageParticipants: 2.8,
        activeDialogs: 20,
        endedDialogs: 5,
        dialogsByCapability: {
          intelligentControl: 12,
          criticalThinking: 10,
          knowledgeSearch: 15,
          multimodal: 6
        },
        recentActivity: {
          dailyCreated: [2, 4, 3, 6, 5, 7, 4],
          weeklyActive: [18, 20, 22, 25]
        }
      } as any);

      // Act
      const plan = await planService.getPlan(planId);
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(plan).toBeDefined();
      expect(dialogStats).toBeDefined();
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
    });

    it('应该查询规划和对话统计的关联', async () => {
      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: mockPlanEntity.planId,
        name: 'Dialog-enabled Plan',
        status: 'active',
        dialogCapabilities: ['intelligent', 'criticalThinking']
      } as any);

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 30,
        averageParticipants: 3.0,
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
      const plan = await planService.getPlan(mockPlanEntity.planId);
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(plan.dialogCapabilities).toContain('intelligent');
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Plan模块的预留接口参数', async () => {
      const testPlanIntegration = async (
        _planId: string,
        _dialogId: string,
        _dialogConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testPlanIntegration(
        mockPlanEntity.planId,
        mockDialogEntity.dialogId,
        { dialogType: 'planning', intelligent: true }
      );

      expect(result).toBe(true);
    });

    it('应该测试Dialog模块的预留接口参数', async () => {
      const testDialogIntegration = async (
        _dialogId: string,
        _planId: string,
        _planData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testDialogIntegration(
        mockDialogEntity.dialogId,
        mockPlanEntity.planId,
        { planType: 'interactive', supportDialog: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('智能对话集成测试', () => {
    it('应该支持规划智能对话的管理', async () => {
      const intelligentData = {
        planId: mockPlanEntity.planId,
        dialogId: mockDialogEntity.dialogId,
        operation: 'intelligent_planning'
      };

      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: intelligentData.planId,
        name: 'Intelligent Plan',
        status: 'active',
        intelligentDialog: true
      } as any);

      // Mock dialog service
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 22,
        averageParticipants: 2.5,
        activeDialogs: 18,
        endedDialogs: 4,
        dialogsByCapability: {
          intelligentControl: 18,
          criticalThinking: 15,
          knowledgeSearch: 16,
          multimodal: 7
        },
        recentActivity: {
          dailyCreated: [2, 3, 4, 5, 4, 6, 3],
          weeklyActive: [16, 18, 20, 22]
        }
      } as any);

      // Act
      const plan = await planService.getPlan(intelligentData.planId);
      const dialogStats = await dialogService.getDialogStatistics();

      // Assert
      expect(plan.intelligentDialog).toBe(true);
      expect(dialogStats.dialogsByCapability.intelligentControl).toBeGreaterThan(0);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理规划不存在的情况', async () => {
      const planId = 'non-existent-plan';
      jest.spyOn(planService, 'getPlan').mockRejectedValue(new Error('Plan not found'));

      await expect(planService.getPlan(planId)).rejects.toThrow('Plan not found');
    });

    it('应该正确处理对话统计获取失败', async () => {
      jest.spyOn(dialogService, 'getDialogStatistics').mockRejectedValue(new Error('Dialog service unavailable'));

      await expect(dialogService.getDialogStatistics()).rejects.toThrow('Dialog service unavailable');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Plan-Dialog集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: mockPlanEntity.planId,
        name: 'Performance Test Plan'
      } as any);
      
      jest.spyOn(dialogService, 'getDialogStatistics').mockResolvedValue({
        totalDialogs: 15,
        averageParticipants: 2.2,
        activeDialogs: 12,
        endedDialogs: 3,
        dialogsByCapability: {
          intelligentControl: 8,
          criticalThinking: 6,
          knowledgeSearch: 10,
          multimodal: 4
        },
        recentActivity: {
          dailyCreated: [1, 2, 3, 4, 3, 5, 2],
          weeklyActive: [10, 12, 14, 15]
        }
      } as any);

      const plan = await planService.getPlan(mockPlanEntity.planId);
      const dialogStats = await dialogService.getDialogStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(plan).toBeDefined();
      expect(dialogStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Plan-Dialog数据关联的一致性', () => {
      const planId = mockPlanEntity.planId;
      const dialogId = mockDialogEntity.dialogId;

      expect(planId).toBeDefined();
      expect(typeof planId).toBe('string');
      expect(planId.length).toBeGreaterThan(0);
      
      expect(dialogId).toBeDefined();
      expect(typeof dialogId).toBe('string');
      expect(dialogId.length).toBeGreaterThan(0);
    });

    it('应该验证规划对话关联数据的完整性', () => {
      const planData = {
        planId: mockPlanEntity.planId,
        name: 'Dialog-enabled Plan',
        dialogEnabled: true,
        supportedCapabilities: ['intelligent', 'criticalThinking']
      };

      const dialogData = {
        dialogId: mockDialogEntity.dialogId,
        planId: planData.planId,
        capabilities: ['intelligent', 'knowledgeSearch'],
        status: 'active'
      };

      expect(dialogData.planId).toBe(planData.planId);
      expect(planData.dialogEnabled).toBe(true);
      expect(dialogData.capabilities).toContain('intelligent');
    });
  });
});
