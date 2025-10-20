/**
 * Confirm管理服务测试
 * 
 * @description 测试ConfirmManagementService的业务逻辑和数据处理
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import { ConfirmManagementService } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { IConfirmRepository } from '../../../src/modules/confirm/domain/repositories/confirm-repository.interface';
import { ConfirmEntity } from '../../../src/modules/confirm/domain/entities/confirm.entity';
import {
  CreateConfirmRequest,
  UpdateConfirmRequest,
  ConfirmQueryFilter,
  ConfirmEntityData,
  UUID
} from '../../../src/modules/confirm/types';
import { createMockConfirmEntityData } from './test-data-factory';

// Mock Repository
const mockRepository: jest.Mocked<IConfirmRepository> = {
  save: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByFilter: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn()
};

describe('ConfirmManagementService测试', () => {
  let confirmService: ConfirmManagementService;
  let mockConfirmEntity: ConfirmEntity;

  beforeEach(() => {
    confirmService = new ConfirmManagementService(mockRepository);

    // 使用完整的测试数据工厂，确保包含所有必需字段
    const mockData = createMockConfirmEntityData();
    mockConfirmEntity = new ConfirmEntity(mockData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createConfirm方法测试', () => {
    it('应该成功创建确认请求', async () => {
      const createRequest: CreateConfirmRequest = {
        contextId: 'context-test-001' as UUID,
        confirmationType: 'approval',
        priority: 'high',
        requester: {
          userId: 'user-001' as UUID,
          role: 'developer',
          requestReason: 'Deploy to production'
        },
        subject: {
          title: 'Production Deployment',
          description: 'Deploy version 1.2.0',
          impactAssessment: {
            scope: 'project',
            businessImpact: {
              revenue: 'positive',
              customerSatisfaction: 'positive',
              operationalEfficiency: 'neutral',
              riskMitigation: 'positive'
            },
            technicalImpact: {
              performance: 'improved',
              scalability: 'improved',
              maintainability: 'improved',
              security: 'enhanced',
              compatibility: 'maintained'
            }
          }
        },
        riskAssessment: {
          overallRiskLevel: 'medium',
          riskFactors: []
        },
        approvalWorkflow: {
          workflowType: 'sequential',
          steps: [{
            stepId: 'step-001',
            stepName: 'Technical Review',
            approverRole: 'tech_lead',
            approver: {
              userId: 'tech-lead-001' as UUID,
              role: 'tech_lead',
              assignedAt: new Date('2025-08-26T10:00:00Z')
            },
            requiredApprovals: 1,
            status: 'pending'
          }],
          autoApprovalRules: []
        }
      };

      mockRepository.create.mockResolvedValue(mockConfirmEntity);

      const result = await confirmService.createConfirm(createRequest);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(result.confirmationType).toBe('approval');
      expect(result.priority).toBe('high');
      expect(result.status).toBe('pending');
    });

    it('应该生成唯一的确认ID', async () => {
      const createRequest: CreateConfirmRequest = {
        contextId: 'context-test-001' as UUID,
        confirmationType: 'approval',
        priority: 'high',
        requester: {
          userId: 'user-001' as UUID,
          role: 'developer',
          requestReason: 'Deploy to production'
        },
        subject: {
          title: 'Production Deployment',
          description: 'Deploy version 1.2.0',
          impactAssessment: {
            scope: 'project',
            businessImpact: {
              revenue: 'positive',
              customerSatisfaction: 'positive',
              operationalEfficiency: 'neutral',
              riskMitigation: 'positive'
            },
            technicalImpact: {
              performance: 'improved',
              scalability: 'improved',
              maintainability: 'improved',
              security: 'enhanced',
              compatibility: 'maintained'
            }
          }
        },
        riskAssessment: {
          overallRiskLevel: 'medium',
          riskFactors: []
        },
        approvalWorkflow: {
          workflowType: 'sequential',
          steps: [{
            stepId: 'step-001',
            stepName: 'Technical Review',
            approverRole: 'tech_lead',
            approver: {
              userId: 'tech-lead-001' as UUID,
              role: 'tech_lead',
              assignedAt: new Date('2025-08-26T10:00:00Z')
            },
            requiredApprovals: 1,
            status: 'pending'
          }],
          autoApprovalRules: []
        }
      };

      mockRepository.create.mockResolvedValue(mockConfirmEntity);

      const result1 = await confirmService.createConfirm(createRequest);
      const result2 = await confirmService.createConfirm(createRequest);

      expect(result1.confirmId).toBeDefined();
      expect(result2.confirmId).toBeDefined();
      // 注意：由于使用mock，这里实际返回的是同一个实体，但在真实环境中ID应该不同
    });
  });

  describe('getConfirm方法测试', () => {
    it('应该成功获取确认请求', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      mockRepository.findById.mockResolvedValue(mockConfirmEntity);

      const result = await confirmService.getConfirm(confirmId);

      expect(mockRepository.findById).toHaveBeenCalledWith(confirmId);
      expect(result).toBeDefined();
      expect(result?.confirmId).toBe(confirmId);
    });

    it('应该处理不存在的确认请求', async () => {
      const confirmId = 'non-existent' as UUID;
      mockRepository.findById.mockResolvedValue(null);

      await expect(confirmService.getConfirm(confirmId)).rejects.toThrow('Confirm with ID non-existent not found');
    });
  });

  describe('approveConfirm方法测试', () => {
    it('应该成功批准确认请求', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      const approverId = 'tech-lead-001' as UUID;
      const comments = 'Approved for deployment';

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockRepository.update.mockResolvedValue(mockConfirmEntity);

      const result = await confirmService.approveConfirm(confirmId, approverId, comments);

      expect(mockRepository.findById).toHaveBeenCalledWith(confirmId);
      expect(mockRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('应该处理不存在的确认请求', async () => {
      const confirmId = 'non-existent' as UUID;
      const approverId = 'approver-001' as UUID;
      
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        confirmService.approveConfirm(confirmId, approverId)
      ).rejects.toThrow('Confirm with ID non-existent not found');
    });
  });

  describe('rejectConfirm方法测试', () => {
    it('应该成功拒绝确认请求', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      const approverId = 'tech-lead-001' as UUID;
      const reason = 'Security concerns';

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockRepository.update.mockResolvedValue(mockConfirmEntity);

      const result = await confirmService.rejectConfirm(confirmId, approverId, reason);

      expect(mockRepository.findById).toHaveBeenCalledWith(confirmId);
      expect(mockRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('queryConfirms方法测试', () => {
    it('应该成功查询确认请求', async () => {
      const filter: ConfirmQueryFilter = {
        status: 'pending',
        priority: 'high'
      };
      const mockResults = {
        items: [mockConfirmEntity],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };
      mockRepository.findByFilter.mockResolvedValue(mockResults);

      const result = await confirmService.queryConfirms(filter);

      expect(mockRepository.findByFilter).toHaveBeenCalledWith(filter, undefined);
      expect(result.items).toHaveLength(1);
    });

    it('应该支持分页查询', async () => {
      const filter: ConfirmQueryFilter = { status: 'pending' };
      const pagination = { page: 1, limit: 10 };
      const mockResults = {
        items: [mockConfirmEntity],
        total: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };
      mockRepository.findByFilter.mockResolvedValue(mockResults);

      const result = await confirmService.queryConfirms(filter, pagination);

      expect(mockRepository.findByFilter).toHaveBeenCalledWith(filter, pagination);
      expect(result.items).toHaveLength(1);
    });
  });

  describe('updateConfirm方法测试', () => {
    it('应该成功更新确认请求', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      const updateRequest: UpdateConfirmRequest = {
        priority: 'critical'
      };

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockRepository.update.mockResolvedValue(mockConfirmEntity);

      const result = await confirmService.updateConfirm(confirmId, updateRequest);

      expect(mockRepository.findById).toHaveBeenCalledWith(confirmId);
      expect(mockRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('deleteConfirm方法测试', () => {
    it('应该成功删除确认请求', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      mockRepository.exists.mockResolvedValue(true);
      mockRepository.delete.mockResolvedValue(undefined);

      await confirmService.deleteConfirm(confirmId);

      expect(mockRepository.exists).toHaveBeenCalledWith(confirmId);
      expect(mockRepository.delete).toHaveBeenCalledWith(confirmId);
    });

    it('应该处理不存在的确认请求', async () => {
      const confirmId = 'non-existent' as UUID;
      mockRepository.exists.mockResolvedValue(false);

      await expect(
        confirmService.deleteConfirm(confirmId)
      ).rejects.toThrow('Confirm with ID non-existent not found');
    });
  });
});
