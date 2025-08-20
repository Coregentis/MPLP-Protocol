/**
 * Confirm Repository单元测试
 * 
 * 测试数据持久化层的功能
 * 验证企业级审批工作流的数据管理
 * 
 * @version 1.0.0
 * @created 2025-08-18
 */

import { ConfirmRepository, ExtendedConfirmFilter } from '../../../src/modules/confirm/infrastructure/repositories/confirm.repository';
import { ConfirmMapper } from '../../../src/modules/confirm/api/mappers/confirm.mapper';
import { Confirm } from '../../../src/modules/confirm/domain/entities/confirm.entity';

describe('ConfirmRepository单元测试', () => {
  let repository: ConfirmRepository;

  beforeEach(() => {
    repository = new ConfirmRepository();
  });

  // 辅助函数：创建Confirm实体
  const createConfirm = (overrides: Partial<any> = {}) => {
    const confirmData = ConfirmMapper.createDefaultEntityData({
      confirmId: 'confirm-123',
      contextId: 'context-123',
      confirmationType: 'plan_approval',
      priority: 'medium',
      ...overrides
    });
    return new Confirm(confirmData);
  };

  describe('基础CRUD操作', () => {
    it('应该保存和检索确认', async () => {
      const confirm = createConfirm();
      await repository.save(confirm);

      const retrieved = await repository.findById('confirm-123');
      expect(retrieved).toBeDefined();
      expect(retrieved!.confirmId).toBe('confirm-123');
      expect(retrieved!.contextId).toBe('context-123');
      expect(retrieved!.confirmationType).toBe('plan_approval');
      expect(retrieved!.priority).toBe('high');
    });

    it('应该更新确认', async () => {
      const confirm = createConfirm({
        confirmId: 'confirm-123',
        status: 'pending',
      });

      await repository.save(confirm);

      const updatedData = { ...confirmData, status: 'approved' as const };
      await repository.update(updatedData);

      const retrieved = await repository.findById('confirm-123');
      expect(retrieved!.status).toBe('approved');
    });

    it('应该删除确认', async () => {
      const confirmData = ConfirmMapper.createDefaultEntityData({
        confirmId: 'confirm-123',
      });

      await repository.save(confirmData);
      expect(await repository.findById('confirm-123')).toBeDefined();

      await repository.delete('confirm-123');
      expect(await repository.findById('confirm-123')).toBeNull();
    });

    it('应该检查确认是否存在', async () => {
      const confirmData = ConfirmMapper.createDefaultEntityData({
        confirmId: 'confirm-123',
      });

      expect(await repository.exists('confirm-123')).toBe(false);

      await repository.save(confirmData);
      expect(await repository.exists('confirm-123')).toBe(true);
    });
  });

  describe('查询操作', () => {
    beforeEach(async () => {
      // 准备测试数据
      const testData = [
        ConfirmMapper.createDefaultEntityData({
          confirmId: 'confirm-1',
          contextId: 'context-1',
          confirmationType: 'plan_approval',
          priority: 'high',
          status: 'pending',
        }),
        ConfirmMapper.createDefaultEntityData({
          confirmId: 'confirm-2',
          contextId: 'context-1',
          confirmationType: 'task_approval',
          priority: 'normal',
          status: 'approved',
        }),
        ConfirmMapper.createDefaultEntityData({
          confirmId: 'confirm-3',
          contextId: 'context-2',
          confirmationType: 'plan_approval',
          priority: 'urgent',
          status: 'rejected',
        }),
      ];

      for (const data of testData) {
        await repository.save(data);
      }
    });

    it('应该根据上下文ID查找确认', async () => {
      const results = await repository.findByContextId('context-1');
      expect(results).toHaveLength(2);
      expect(results.every(r => r.contextId === 'context-1')).toBe(true);
    });

    it('应该根据计划ID查找确认', async () => {
      const confirmData = ConfirmMapper.createDefaultEntityData({
        confirmId: 'confirm-4',
        planId: 'plan-123',
      });
      await repository.save(confirmData);

      const results = await repository.findByPlanId('plan-123');
      expect(results).toHaveLength(1);
      expect(results[0].planId).toBe('plan-123');
    });

    it('应该根据审批者ID查找确认', async () => {
      const confirmData = ConfirmMapper.createDefaultEntityData({
        confirmId: 'confirm-5',
        approvalWorkflow: {
          workflowType: 'single_approver',
          currentStep: 1,
          totalSteps: 1,
          steps: [
            {
              stepId: 'step-1',
              stepName: 'Manager Approval',
              approverId: 'manager-123',
              approverName: 'Jane Manager',
              approverRole: 'manager',
              status: 'pending',
            },
          ],
        },
      });
      await repository.save(confirmData);

      const results = await repository.findByApproverId('manager-123');
      expect(results).toHaveLength(1);
      expect(results[0].confirmId).toBe('confirm-5');
    });

    it('应该查找待审批的确认', async () => {
      const confirmData = ConfirmMapper.createDefaultEntityData({
        confirmId: 'confirm-6',
        status: 'pending',
        approvalWorkflow: {
          workflowType: 'single_approver',
          currentStep: 1,
          totalSteps: 1,
          steps: [
            {
              stepId: 'step-1',
              stepName: 'Manager Approval',
              approverId: 'manager-123',
              approverName: 'Jane Manager',
              approverRole: 'manager',
              status: 'pending',
            },
          ],
        },
      });
      await repository.save(confirmData);

      const results = await repository.findPendingApprovals('manager-123');
      expect(results).toHaveLength(1);
      expect(results[0].confirmId).toBe('confirm-6');
    });

    it('应该查找已升级的确认', async () => {
      const confirmData = ConfirmMapper.createDefaultEntityData({
        confirmId: 'confirm-7',
        status: 'escalated',
      });
      await repository.save(confirmData);

      const results = await repository.findEscalatedConfirms();
      expect(results).toHaveLength(1);
      expect(results[0].status).toBe('escalated');
    });

    it('应该根据风险级别查找确认', async () => {
      const confirmData = ConfirmMapper.createDefaultEntityData({
        confirmId: 'confirm-8',
        subject: {
          title: 'High Risk Approval',
          description: 'High risk approval description',
          riskLevel: 'high',
        },
      });
      await repository.save(confirmData);

      const results = await repository.findByRiskLevel('high');
      expect(results).toHaveLength(1);
      expect(results[0].subject.riskLevel).toBe('high');
    });
  });

  describe('搜索功能', () => {
    beforeEach(async () => {
      const confirmData = ConfirmMapper.createDefaultEntityData({
        confirmId: 'confirm-search',
        subject: {
          title: 'Important Project Approval',
          description: 'This is a critical project that needs immediate approval',
        },
        searchMetadata: {
          indexedFields: ['title', 'description'],
          searchTags: ['important', 'critical', 'project'],
          fullTextContent: 'Important Project Approval This is a critical project that needs immediate approval',
        },
      });
      await repository.save(confirmData);
    });

    it('应该执行全文搜索', async () => {
      const results = await repository.fullTextSearch('important project');
      expect(results).toHaveLength(1);
      expect(results[0].confirmId).toBe('confirm-search');
    });

    it('应该根据标签查找确认', async () => {
      const results = await repository.findByTags(['important', 'critical']);
      expect(results).toHaveLength(1);
      expect(results[0].confirmId).toBe('confirm-search');
    });

    it('应该处理不匹配的搜索', async () => {
      const results = await repository.fullTextSearch('nonexistent terms');
      expect(results).toHaveLength(0);
    });
  });

  describe('统计功能', () => {
    beforeEach(async () => {
      const testData = [
        ConfirmMapper.createDefaultEntityData({
          confirmId: 'confirm-stat-1',
          status: 'pending',
          confirmationType: 'plan_approval',
          priority: 'high',
          performanceMetrics: { approvalTimeHours: 24 },
        }),
        ConfirmMapper.createDefaultEntityData({
          confirmId: 'confirm-stat-2',
          status: 'approved',
          confirmationType: 'plan_approval',
          priority: 'normal',
          performanceMetrics: { approvalTimeHours: 12 },
        }),
        ConfirmMapper.createDefaultEntityData({
          confirmId: 'confirm-stat-3',
          status: 'escalated',
          confirmationType: 'task_approval',
          priority: 'urgent',
          performanceMetrics: { approvalTimeHours: 48 },
        }),
      ];

      for (const data of testData) {
        await repository.save(data);
      }
    });

    it('应该获取聚合统计信息', async () => {
      const stats = await repository.getAggregationResult();
      
      expect(stats.totalCount).toBe(3);
      expect(stats.statusCounts.pending).toBe(1);
      expect(stats.statusCounts.approved).toBe(1);
      expect(stats.statusCounts.escalated).toBe(1);
      expect(stats.typeCounts.plan_approval).toBe(2);
      expect(stats.typeCounts.task_approval).toBe(1);
      expect(stats.priorityCounts.high).toBe(1);
      expect(stats.priorityCounts.normal).toBe(1);
      expect(stats.priorityCounts.urgent).toBe(1);
      expect(stats.averageApprovalTimeHours).toBe(28); // (24 + 12 + 48) / 3
      expect(stats.escalationRate).toBe(1/3); // 1 escalated out of 3 total
    });

    it('应该获取基础统计信息', async () => {
      const stats = await repository.getStatistics();
      
      expect(stats.total).toBe(3);
      expect(stats.by_status.pending).toBe(1);
      expect(stats.by_status.approved).toBe(1);
      expect(stats.by_status.escalated).toBe(1);
    });
  });

  describe('批量操作', () => {
    it('应该批量保存确认', async () => {
      const testData = [
        ConfirmMapper.createDefaultEntityData({ confirmId: 'batch-1' }),
        ConfirmMapper.createDefaultEntityData({ confirmId: 'batch-2' }),
        ConfirmMapper.createDefaultEntityData({ confirmId: 'batch-3' }),
      ];

      await repository.saveBatch(testData);

      expect(await repository.count()).toBe(3);
      expect(await repository.exists('batch-1')).toBe(true);
      expect(await repository.exists('batch-2')).toBe(true);
      expect(await repository.exists('batch-3')).toBe(true);
    });

    it('应该批量删除确认', async () => {
      const testData = [
        ConfirmMapper.createDefaultEntityData({ confirmId: 'batch-1' }),
        ConfirmMapper.createDefaultEntityData({ confirmId: 'batch-2' }),
        ConfirmMapper.createDefaultEntityData({ confirmId: 'batch-3' }),
      ];

      await repository.saveBatch(testData);
      expect(await repository.count()).toBe(3);

      await repository.deleteBatch(['batch-1', 'batch-3']);
      expect(await repository.count()).toBe(1);
      expect(await repository.exists('batch-1')).toBe(false);
      expect(await repository.exists('batch-2')).toBe(true);
      expect(await repository.exists('batch-3')).toBe(false);
    });
  });

  describe('清理操作', () => {
    it('应该清空所有确认', async () => {
      const confirmData = ConfirmMapper.createDefaultEntityData({
        confirmId: 'confirm-clear',
      });
      await repository.save(confirmData);

      expect(await repository.count()).toBe(1);

      await repository.clear();
      expect(await repository.count()).toBe(0);
      expect(await repository.findById('confirm-clear')).toBeNull();
    });
  });
});
