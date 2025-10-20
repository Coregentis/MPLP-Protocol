/**
 * Confirm控制器测试
 * 
 * @description 测试ConfirmController的API接口和请求处理逻辑
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import { ConfirmController } from '../../../src/modules/confirm/api/controllers/confirm.controller';
import { ConfirmManagementService } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { 
  CreateConfirmRequest,
  UpdateConfirmRequest,
  ConfirmQueryFilter,
  ConfirmEntityData,
  UUID
} from '../../../src/modules/confirm/types';

// Mock ConfirmManagementService
jest.mock('../../../src/modules/confirm/application/services/confirm-management.service');

describe('ConfirmController测试', () => {
  let confirmController: ConfirmController;
  let mockConfirmService: jest.Mocked<ConfirmManagementService>;
  let mockConfirmData: ConfirmEntityData;

  beforeEach(() => {
    mockConfirmService = new ConfirmManagementService(null as any) as jest.Mocked<ConfirmManagementService>;
    confirmController = new ConfirmController(mockConfirmService);

    mockConfirmData = {
      confirmId: 'confirm-test-001' as UUID,
      contextId: 'context-test-001' as UUID,
      confirmationType: 'approval',
      status: 'pending',
      priority: 'high',
      createdAt: new Date('2025-08-26T10:00:00Z'),
      updatedAt: new Date('2025-08-26T10:00:00Z'),
      requester: {
        userId: 'user-001' as UUID,
        role: 'developer',
        requestReason: 'Deploy to production',
        requestedAt: new Date('2025-08-26T10:00:00Z')
      },
      subject: {
        title: 'Production Deployment',
        description: 'Deploy version 1.2.0',
        impactAssessment: {
          scope: 'project',
          affectedSystems: ['api-gateway'],
          affectedUsers: ['end-users'],
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
      workflow: {
        workflowType: 'sequential',
        currentStep: 0,
        steps: [],
        autoApprovalRules: []
      },
      approvals: [],
      auditTrail: [],
      notifications: {
        channels: ['email'],
        recipients: [],
        templates: {
          pending: 'approval-request-template',
          approved: 'approval-granted-template',
          rejected: 'approval-rejected-template'
        }
      },
      integrations: {
        externalSystems: [],
        webhooks: []
      }
    };
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
            affectedSystems: ['api-gateway'],
            affectedUsers: ['end-users'],
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
        }
      };

      mockConfirmService.createConfirm.mockResolvedValue(mockConfirmData);

      const result = await confirmController.createConfirm(createRequest);

      expect(mockConfirmService.createConfirm).toHaveBeenCalledWith(createRequest);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConfirmData);
    });

    it('应该处理创建失败的情况', async () => {
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
        }
      };

      mockConfirmService.createConfirm.mockRejectedValue(new Error('Creation failed'));

      const result = await confirmController.createConfirm(createRequest);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Creation failed');
    });
  });

  describe('getConfirm方法测试', () => {
    it('应该成功获取确认请求', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      mockConfirmService.getConfirm.mockResolvedValue(mockConfirmData);

      const result = await confirmController.getConfirm(confirmId);

      expect(mockConfirmService.getConfirm).toHaveBeenCalledWith(confirmId);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConfirmData);
    });

    it('应该处理确认请求不存在的情况', async () => {
      const confirmId = 'non-existent-confirm' as UUID;
      mockConfirmService.getConfirm.mockResolvedValue(null);

      const result = await confirmController.getConfirm(confirmId);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('listConfirms方法测试', () => {
    it('应该成功获取确认请求列表', async () => {
      const mockList = [mockConfirmData];
      mockConfirmService.listConfirms.mockResolvedValue(mockList);

      const result = await confirmController.listConfirms();

      expect(mockConfirmService.listConfirms).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockList);
    });

    it('应该支持分页参数', async () => {
      const pagination = { page: 1, limit: 10 };
      const mockList = [mockConfirmData];
      mockConfirmService.listConfirms.mockResolvedValue(mockList);

      const result = await confirmController.listConfirms(pagination);

      expect(mockConfirmService.listConfirms).toHaveBeenCalledWith(pagination);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockList);
    });
  });

  describe('queryConfirms方法测试', () => {
    it('应该成功查询确认请求', async () => {
      const filter: ConfirmQueryFilter = {
        status: 'pending',
        priority: 'high',
        confirmationType: 'approval'
      };
      const mockResults = [mockConfirmData];
      mockConfirmService.queryConfirms.mockResolvedValue(mockResults);

      const result = await confirmController.queryConfirms(filter);

      expect(mockConfirmService.queryConfirms).toHaveBeenCalledWith(filter, undefined);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResults);
    });

    it('应该支持分页查询', async () => {
      const filter: ConfirmQueryFilter = {
        status: 'pending'
      };
      const pagination = { page: 1, limit: 5 };
      const mockResults = [mockConfirmData];
      mockConfirmService.queryConfirms.mockResolvedValue(mockResults);

      const result = await confirmController.queryConfirms(filter, pagination);

      expect(mockConfirmService.queryConfirms).toHaveBeenCalledWith(filter, pagination);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResults);
    });
  });

  describe('updateConfirm方法测试', () => {
    it('应该成功更新确认请求', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      const updateRequest: UpdateConfirmRequest = {
        priority: 'critical',
        subject: {
          title: 'Updated Production Deployment',
          description: 'Updated deploy version 1.2.1',
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
        }
      };

      const updatedData = { ...mockConfirmData, priority: 'critical' as const };
      mockConfirmService.updateConfirm.mockResolvedValue(updatedData);

      const result = await confirmController.updateConfirm(confirmId, updateRequest);

      expect(mockConfirmService.updateConfirm).toHaveBeenCalledWith(confirmId, updateRequest);
      expect(result.success).toBe(true);
      expect(result.data.priority).toBe('critical');
    });
  });

  describe('approveConfirm方法测试', () => {
    it('应该成功批准确认请求', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      const approverId = 'approver-001' as UUID;
      const comments = 'Approved for deployment';

      const approvedData = { ...mockConfirmData, status: 'approved' as const };
      mockConfirmService.approveConfirm.mockResolvedValue(approvedData);

      const result = await confirmController.approveConfirm(confirmId, approverId, comments);

      expect(mockConfirmService.approveConfirm).toHaveBeenCalledWith(confirmId, approverId, comments);
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('approved');
    });
  });

  describe('rejectConfirm方法测试', () => {
    it('应该成功拒绝确认请求', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      const approverId = 'approver-001' as UUID;
      const reason = 'Security concerns';

      const rejectedData = { ...mockConfirmData, status: 'rejected' as const };
      mockConfirmService.rejectConfirm.mockResolvedValue(rejectedData);

      const result = await confirmController.rejectConfirm(confirmId, approverId, reason);

      expect(mockConfirmService.rejectConfirm).toHaveBeenCalledWith(confirmId, approverId, reason);
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('rejected');
    });
  });

  describe('deleteConfirm方法测试', () => {
    it('应该成功删除确认请求', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      mockConfirmService.deleteConfirm.mockResolvedValue(undefined);

      await confirmController.deleteConfirm(confirmId);

      expect(mockConfirmService.deleteConfirm).toHaveBeenCalledWith(confirmId);
    });
  });

  describe('错误处理测试', () => {
    it('应该正确传播服务层错误', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      const error = new Error('Service error');
      mockConfirmService.getConfirm.mockRejectedValue(error);

      const result = await confirmController.getConfirm(confirmId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Service error');
    });

    it('应该处理无效参数', async () => {
      const invalidRequest = {} as CreateConfirmRequest;
      mockConfirmService.createConfirm.mockRejectedValue(new Error('Invalid request'));

      const result = await confirmController.createConfirm(invalidRequest);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid request');
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内处理请求', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      mockConfirmService.getConfirm.mockResolvedValue(mockConfirmData);

      const startTime = Date.now();
      await confirmController.getConfirm(confirmId);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });
  });
});
