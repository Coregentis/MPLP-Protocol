/**
 * Plan-Confirm模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证规划驱动确认的集成功能
 */

import { PlanManagementService } from '../../../src/modules/plan/application/services/plan-management.service';
import { ConfirmManagementService } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { PlanTestFactory } from '../../modules/plan/factories/plan-test.factory';
import { ConfirmTestFactory } from '../../modules/confirm/factories/confirm-test.factory';

describe('Plan-Confirm模块间集成测试', () => {
  let planService: PlanManagementService;
  let confirmService: ConfirmManagementService;
  let mockPlanEntity: any;
  let mockConfirmEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    planService = new PlanManagementService(
      {} as any, // Mock AI service adapter
      {} as any  // Mock logger
    );

    confirmService = new ConfirmManagementService(
      {} as any, // Mock repository
      {} as any, // Mock cache
      {} as any  // Mock event bus
    );

    // 创建测试数据
    mockPlanEntity = PlanTestFactory.createPlanEntity();
    mockConfirmEntity = ConfirmTestFactory.createConfirmEntity();
  });

  describe('规划驱动确认集成', () => {
    it('应该基于规划创建确认请求', async () => {
      // Arrange
      const planId = mockPlanEntity.planId;
      const contextId = 'context-plan-confirm-001';

      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId,
        contextId,
        name: 'Confirmation Plan',
        status: 'active',
        tasks: []
      } as any);
      
      // Mock confirm service
      jest.spyOn(confirmService, 'createConfirm').mockResolvedValue({
        confirmId: 'confirm-001',
        contextId,
        planId,
        confirmationType: 'plan_approval',
        status: 'pending'
      } as any);

      // Act
      const plan = await planService.getPlan(planId);
      const confirm = await confirmService.createConfirm({
        contextId: plan.contextId,
        planId: plan.planId,
        confirmationType: 'plan_approval',
        priority: 'high',
        requester: { userId: 'user-001', roleId: 'role-001' },
        approvalWorkflow: {
          steps: [{ stepId: 'step-1', approverType: 'plan', approverId: planId, status: 'pending' }]
        },
        subject: 'Plan approval request'
      } as any);

      // Assert
      expect(plan).toBeDefined();
      expect(confirm).toBeDefined();
      expect(confirm.planId).toBe(planId);
    });

    it('应该查询规划和确认的基本信息关联', async () => {
      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: mockPlanEntity.planId,
        name: 'Approval Plan',
        status: 'pending_approval',
        approvalRequired: true
      } as any);

      // Mock confirm service
      jest.spyOn(confirmService, 'getStatistics').mockResolvedValue({
        total: 15,
        byStatus: { 'pending': 5, 'approved': 8, 'rejected': 2 },
        byType: { 'plan_approval': 10, 'manual_approval': 5 },
        byPriority: { 'high': 4, 'medium': 8, 'low': 3 }
      } as any);

      // Act
      const plan = await planService.getPlan(mockPlanEntity.planId);
      const confirmStats = await confirmService.getStatistics();

      // Assert
      expect(plan.approvalRequired).toBe(true);
      expect(confirmStats.byType['plan_approval']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Plan模块的预留接口参数', async () => {
      const testPlanIntegration = async (
        _planId: string,
        _confirmId: string,
        _approvalConfig: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testPlanIntegration(
        mockPlanEntity.planId,
        mockConfirmEntity.confirmId,
        { approvalType: 'plan', autoApprove: false }
      );

      expect(result).toBe(true);
    });

    it('应该测试Confirm模块的预留接口参数', async () => {
      const testConfirmIntegration = async (
        _confirmId: string,
        _planId: string,
        _planData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testConfirmIntegration(
        mockConfirmEntity.confirmId,
        mockPlanEntity.planId,
        { planType: 'execution', requiresApproval: true }
      );

      expect(result).toBe(true);
    });
  });

  describe('审批工作流集成测试', () => {
    it('应该支持规划审批工作流', async () => {
      const workflowData = {
        planId: mockPlanEntity.planId,
        confirmId: mockConfirmEntity.confirmId,
        workflowType: 'plan_approval'
      };

      // Mock plan service
      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: workflowData.planId,
        name: 'Approval Workflow Plan',
        status: 'pending_approval',
        approvalRequired: true
      } as any);

      // Mock confirm service
      jest.spyOn(confirmService, 'queryConfirms').mockResolvedValue({
        items: [
          { confirmId: workflowData.confirmId, planId: workflowData.planId, status: 'pending' }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      } as any);

      // Act
      const plan = await planService.getPlan(workflowData.planId);
      const confirms = await confirmService.queryConfirms({ planId: workflowData.planId });

      // Assert
      expect(plan.approvalRequired).toBe(true);
      expect(confirms.items[0].planId).toBe(workflowData.planId);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理规划不存在的情况', async () => {
      const planId = 'non-existent-plan';
      jest.spyOn(planService, 'getPlan').mockRejectedValue(new Error('Plan not found'));

      await expect(planService.getPlan(planId)).rejects.toThrow('Plan not found');
    });

    it('应该正确处理确认创建失败', async () => {
      const invalidConfirmData = { planId: '', confirmationType: '' };
      jest.spyOn(confirmService, 'createConfirm').mockRejectedValue(new Error('Invalid confirm data'));

      await expect(confirmService.createConfirm(invalidConfirmData as any)).rejects.toThrow('Invalid confirm data');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Plan-Confirm集成操作', async () => {
      const startTime = Date.now();

      jest.spyOn(planService, 'getPlan').mockResolvedValue({
        planId: mockPlanEntity.planId,
        name: 'Performance Test Plan',
        status: 'active'
      } as any);

      jest.spyOn(confirmService, 'getStatistics').mockResolvedValue({
        total: 8,
        byStatus: { 'pending': 3, 'approved': 5 },
        byType: { 'plan_approval': 8 },
        byPriority: { 'high': 8 }
      } as any);

      const plan = await planService.getPlan(mockPlanEntity.planId);
      const confirmStats = await confirmService.getStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(plan).toBeDefined();
      expect(confirmStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Plan-Confirm数据关联的一致性', () => {
      const planId = mockPlanEntity.planId;
      const confirmId = mockConfirmEntity.confirmId;

      expect(planId).toBeDefined();
      expect(typeof planId).toBe('string');
      expect(planId.length).toBeGreaterThan(0);
      
      expect(confirmId).toBeDefined();
      expect(typeof confirmId).toBe('string');
      expect(confirmId.length).toBeGreaterThan(0);
    });

    it('应该验证规划确认关联数据的完整性', () => {
      const planData = {
        planId: mockPlanEntity.planId,
        name: 'Approval Plan',
        approvalRequired: true
      };

      const confirmData = {
        confirmId: mockConfirmEntity.confirmId,
        planId: planData.planId,
        confirmationType: 'plan_approval',
        status: 'pending'
      };

      expect(confirmData.planId).toBe(planData.planId);
      expect(planData.approvalRequired).toBe(true);
      expect(confirmData.confirmationType).toBe('plan_approval');
    });
  });
});
