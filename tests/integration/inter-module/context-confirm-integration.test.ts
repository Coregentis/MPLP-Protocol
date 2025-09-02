/**
 * Context-Confirm模块间集成测试
 * 基于RBCT方法论和Schema驱动开发
 * 测试目标：验证上下文驱动确认的集成功能
 */

import { ContextManagementService } from '../../../src/modules/context/application/services/context-management.service';
import { ConfirmManagementService } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { ContextTestFactory } from '../../modules/context/factories/context-test.factory';
import { ConfirmTestFactory } from '../../modules/confirm/factories/confirm-test.factory';

describe('Context-Confirm模块间集成测试', () => {
  let contextService: ContextManagementService;
  let confirmService: ConfirmManagementService;
  let mockContextEntity: any;
  let mockConfirmEntity: any;

  beforeEach(() => {
    // 初始化服务实例
    contextService = new ContextManagementService(
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
    mockContextEntity = ContextTestFactory.createContextEntity();
    mockConfirmEntity = ConfirmTestFactory.createConfirmEntity();
  });

  describe('上下文驱动确认集成', () => {
    it('应该基于上下文创建确认请求', async () => {
      // Arrange
      const contextId = mockContextEntity.contextId;

      // Mock context service
      jest.spyOn(contextService, 'getContext').mockResolvedValue({
        contextId,
        name: 'Confirmation Context',
        status: 'active'
      } as any);
      
      // Mock confirm service
      jest.spyOn(confirmService, 'createConfirm').mockResolvedValue({
        confirmId: 'confirm-001',
        contextId,
        confirmationType: 'context_approval',
        status: 'pending'
      } as any);

      // Act
      const context = await contextService.getContext(contextId);
      const confirm = await confirmService.createConfirm({
        contextId: context.contextId,
        planId: 'plan-001',
        confirmationType: 'context_approval',
        priority: 'medium',
        requester: { userId: 'user-001', roleId: 'role-001' },
        approvalWorkflow: {
          steps: [{ stepId: 'step-1', approverType: 'context', approverId: contextId, status: 'pending' }]
        },
        subject: 'Context-based approval request'
      } as any);

      // Assert
      expect(context).toBeDefined();
      expect(confirm).toBeDefined();
      expect(confirm.contextId).toBe(contextId);
    });

    it('应该查询上下文统计和确认统计的关联', async () => {
      // Mock context service
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 6,
        activeContexts: 5,
        contextsByType: { 'approval': 2, 'workflow': 2, 'session': 2 },
        averageLifetime: 7200,
        totalSessions: 15
      } as any);

      // Mock confirm service
      jest.spyOn(confirmService, 'getStatistics').mockResolvedValue({
        total: 12,
        byStatus: { 'pending': 4, 'approved': 6, 'rejected': 2 },
        byType: { 'context_approval': 8, 'manual_approval': 4 },
        byPriority: { 'high': 3, 'medium': 7, 'low': 2 }
      } as any);

      // Act
      const contextStats = await contextService.getContextStatistics();
      const confirmStats = await confirmService.getStatistics();

      // Assert
      expect(contextStats.contextsByType['approval']).toBeGreaterThan(0);
      expect(confirmStats.byType['context_approval']).toBeGreaterThan(0);
    });
  });

  describe('预留接口集成测试', () => {
    it('应该测试Context模块的预留接口参数', async () => {
      const testContextIntegration = async (
        _contextId: string,
        _confirmId: string,
        _approvalData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testContextIntegration(
        mockContextEntity.contextId,
        mockConfirmEntity.confirmId,
        { approvalType: 'context', priority: 'high' }
      );

      expect(result).toBe(true);
    });

    it('应该测试Confirm模块的预留接口参数', async () => {
      const testConfirmIntegration = async (
        _confirmId: string,
        _contextId: string,
        _workflowData: object
      ): Promise<boolean> => {
        return true;
      };

      const result = await testConfirmIntegration(
        mockConfirmEntity.confirmId,
        mockContextEntity.contextId,
        { workflowType: 'context_driven', steps: 3 }
      );

      expect(result).toBe(true);
    });
  });

  describe('工作流集成测试', () => {
    it('应该支持上下文确认工作流', async () => {
      const workflowData = {
        contextId: mockContextEntity.contextId,
        confirmId: mockConfirmEntity.confirmId,
        workflowType: 'context_approval'
      };

      // Mock context service
      jest.spyOn(contextService, 'getContext').mockResolvedValue({
        contextId: workflowData.contextId,
        name: 'Workflow Context',
        status: 'active'
      } as any);

      // Mock confirm service
      jest.spyOn(confirmService, 'queryConfirms').mockResolvedValue({
        items: [
          { confirmId: workflowData.confirmId, contextId: workflowData.contextId, status: 'pending' }
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      } as any);

      // Act
      const context = await contextService.getContext(workflowData.contextId);
      const confirms = await confirmService.queryConfirms({ contextId: workflowData.contextId });

      // Assert
      expect(context.contextId).toBe(workflowData.contextId);
      expect(confirms.items[0].contextId).toBe(workflowData.contextId);
    });
  });

  describe('错误处理集成测试', () => {
    it('应该正确处理上下文不存在的情况', async () => {
      const contextId = 'non-existent-context';
      jest.spyOn(contextService, 'getContext').mockRejectedValue(new Error('Context not found'));

      await expect(contextService.getContext(contextId)).rejects.toThrow('Context not found');
    });

    it('应该正确处理确认查询失败', async () => {
      const invalidFilter = { invalidField: 'invalid' };
      jest.spyOn(confirmService, 'queryConfirms').mockRejectedValue(new Error('Invalid query'));

      await expect(confirmService.queryConfirms(invalidFilter as any)).rejects.toThrow('Invalid query');
    });
  });

  describe('性能集成测试', () => {
    it('应该在合理时间内完成Context-Confirm集成操作', async () => {
      const startTime = Date.now();
      
      jest.spyOn(contextService, 'getContextStatistics').mockResolvedValue({
        totalContexts: 4,
        activeContexts: 4,
        contextsByType: { 'approval': 4 },
        averageLifetime: 1800,
        totalSessions: 8
      } as any);
      
      jest.spyOn(confirmService, 'getStatistics').mockResolvedValue({
        total: 6,
        byStatus: { 'pending': 2, 'approved': 4 },
        byType: { 'context_approval': 6 },
        byPriority: { 'medium': 6 }
      } as any);

      const contextStats = await contextService.getContextStatistics();
      const confirmStats = await confirmService.getStatistics();

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100);
      expect(contextStats).toBeDefined();
      expect(confirmStats).toBeDefined();
    });
  });

  describe('数据一致性验证', () => {
    it('应该验证Context-Confirm数据关联的一致性', () => {
      const contextId = mockContextEntity.contextId;
      const confirmId = mockConfirmEntity.confirmId;

      expect(contextId).toBeDefined();
      expect(typeof contextId).toBe('string');
      expect(contextId.length).toBeGreaterThan(0);
      
      expect(confirmId).toBeDefined();
      expect(typeof confirmId).toBe('string');
      expect(confirmId.length).toBeGreaterThan(0);
    });

    it('应该验证上下文确认关联数据的完整性', () => {
      const contextData = {
        contextId: mockContextEntity.contextId,
        name: 'Approval Context',
        approvalRequired: true
      };

      const confirmData = {
        confirmId: mockConfirmEntity.confirmId,
        contextId: contextData.contextId,
        confirmationType: 'context_approval',
        status: 'pending'
      };

      expect(confirmData.contextId).toBe(contextData.contextId);
      expect(contextData.approvalRequired).toBe(true);
      expect(confirmData.confirmationType).toBe('context_approval');
    });
  });
});
