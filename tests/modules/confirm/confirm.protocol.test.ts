/**
 * Confirm协议测试
 * 
 * @description 测试ConfirmProtocol的MPLP协议接口实现
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import { ConfirmProtocol } from '../../../src/modules/confirm/infrastructure/protocols/confirm.protocol';
import { ConfirmManagementService } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { 
  MLPPRequest, 
  MLPPResponse,
  HealthStatus 
} from '../../../src/core/protocols/mplp-protocol-base';
import { 
  MLPPSecurityManager,
  MLPPPerformanceMonitor,
  MLPPEventBusManager,
  MLPPErrorHandler,
  MLPPCoordinationManager,
  MLPPOrchestrationManager,
  MLPPStateSyncManager,
  MLPPTransactionManager,
  MLPPProtocolVersionManager
} from '../../../src/core/protocols/cross-cutting-concerns';
import { CreateConfirmRequest, UUID } from '../../../src/modules/confirm/types';

// Mock所有依赖
jest.mock('../../../src/modules/confirm/application/services/confirm-management.service');
jest.mock('../../../src/core/protocols/cross-cutting-concerns');

describe('ConfirmProtocol测试', () => {
  let confirmProtocol: ConfirmProtocol;
  let mockConfirmService: jest.Mocked<ConfirmManagementService>;
  let mockSecurityManager: jest.Mocked<MLPPSecurityManager>;
  let mockPerformanceMonitor: jest.Mocked<MLPPPerformanceMonitor>;
  let mockEventBusManager: jest.Mocked<MLPPEventBusManager>;
  let mockErrorHandler: jest.Mocked<MLPPErrorHandler>;
  let mockCoordinationManager: jest.Mocked<MLPPCoordinationManager>;
  let mockOrchestrationManager: jest.Mocked<MLPPOrchestrationManager>;
  let mockStateSyncManager: jest.Mocked<MLPPStateSyncManager>;
  let mockTransactionManager: jest.Mocked<MLPPTransactionManager>;
  let mockProtocolVersionManager: jest.Mocked<MLPPProtocolVersionManager>;

  beforeEach(() => {
    // 创建所有mock实例
    mockConfirmService = new ConfirmManagementService(null as any) as jest.Mocked<ConfirmManagementService>;
    mockSecurityManager = {} as jest.Mocked<MLPPSecurityManager>;
    mockPerformanceMonitor = {} as jest.Mocked<MLPPPerformanceMonitor>;
    mockEventBusManager = {} as jest.Mocked<MLPPEventBusManager>;
    mockErrorHandler = {} as jest.Mocked<MLPPErrorHandler>;
    mockCoordinationManager = {} as jest.Mocked<MLPPCoordinationManager>;
    mockOrchestrationManager = {} as jest.Mocked<MLPPOrchestrationManager>;
    mockStateSyncManager = {} as jest.Mocked<MLPPStateSyncManager>;
    mockTransactionManager = {} as jest.Mocked<MLPPTransactionManager>;
    mockProtocolVersionManager = {} as jest.Mocked<MLPPProtocolVersionManager>;

    confirmProtocol = new ConfirmProtocol(
      mockConfirmService,
      mockSecurityManager,
      mockPerformanceMonitor,
      mockEventBusManager,
      mockErrorHandler,
      mockCoordinationManager,
      mockOrchestrationManager,
      mockStateSyncManager,
      mockTransactionManager,
      mockProtocolVersionManager
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute方法测试', () => {
    it('应该成功处理create操作', async () => {
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

      const mockResult = {
        confirmId: 'confirm-test-001' as UUID,
        ...createRequest,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
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

      mockConfirmService.createConfirm.mockResolvedValue(mockResult);

      const request: MLPPRequest = {
        operation: 'create',
        payload: createRequest,
        metadata: { requestId: 'req-001', timestamp: Date.now() }
      };

      const response = await confirmProtocol.executeOperation(request);

      expect(response.status).toBe('success');
      expect(response.result).toEqual(mockResult);
      expect(mockConfirmService.createConfirm).toHaveBeenCalledWith(createRequest);
    });

    it('应该成功处理approve操作', async () => {
      const approvePayload = {
        confirmId: 'confirm-test-001' as UUID,
        approverId: 'approver-001' as UUID,
        comments: 'Approved for deployment'
      };

      const mockResult = {
        confirmId: 'confirm-test-001' as UUID,
        status: 'approved',
        updatedAt: new Date()
      };

      mockConfirmService.approveConfirm.mockResolvedValue(mockResult as any);

      const request: MLPPRequest = {
        operation: 'approve',
        payload: approvePayload,
        metadata: { requestId: 'req-002', timestamp: Date.now() }
      };

      const response = await confirmProtocol.executeOperation(request);

      expect(response.status).toBe('success');
      expect(response.result).toEqual(mockResult);
      expect(mockConfirmService.approveConfirm).toHaveBeenCalledWith(
        approvePayload.confirmId,
        approvePayload.approverId,
        approvePayload.comments
      );
    });

    it('应该成功处理reject操作', async () => {
      const rejectPayload = {
        confirmId: 'confirm-test-001' as UUID,
        approverId: 'approver-001' as UUID,
        reason: 'Security concerns'
      };

      const mockResult = {
        confirmId: 'confirm-test-001' as UUID,
        status: 'rejected',
        updatedAt: new Date()
      };

      mockConfirmService.rejectConfirm.mockResolvedValue(mockResult as any);

      const request: MLPPRequest = {
        operation: 'reject',
        payload: rejectPayload,
        metadata: { requestId: 'req-003', timestamp: Date.now() }
      };

      const response = await confirmProtocol.executeOperation(request);

      expect(response.status).toBe('success');
      expect(response.result).toEqual(mockResult);
      expect(mockConfirmService.rejectConfirm).toHaveBeenCalledWith(
        rejectPayload.confirmId,
        rejectPayload.approverId,
        rejectPayload.reason
      );
    });

    it('应该成功处理get操作', async () => {
      const getPayload = {
        confirmId: 'confirm-test-001' as UUID
      };

      const mockResult = {
        confirmId: 'confirm-test-001' as UUID,
        status: 'pending'
      };

      mockConfirmService.getConfirm.mockResolvedValue(mockResult as any);

      const request: MLPPRequest = {
        operation: 'get',
        payload: getPayload,
        metadata: { requestId: 'req-004', timestamp: Date.now() }
      };

      const response = await confirmProtocol.executeOperation(request);

      expect(response.status).toBe('success');
      expect(response.result).toEqual(mockResult);
      expect(mockConfirmService.getConfirm).toHaveBeenCalledWith(getPayload.confirmId);
    });

    it('应该成功处理list操作', async () => {
      const listPayload = {
        pagination: { page: 1, limit: 10 }
      };

      const mockResult = [
        { confirmId: 'confirm-test-001' as UUID, status: 'pending' },
        { confirmId: 'confirm-test-002' as UUID, status: 'approved' }
      ];

      mockConfirmService.listConfirms.mockResolvedValue(mockResult as any);

      const request: MLPPRequest = {
        operation: 'list',
        payload: listPayload,
        metadata: { requestId: 'req-005', timestamp: Date.now() }
      };

      const response = await confirmProtocol.executeOperation(request);

      expect(response.status).toBe('success');
      expect(response.result).toEqual(mockResult);
      expect(mockConfirmService.listConfirms).toHaveBeenCalledWith(listPayload.pagination);
    });

    it('应该处理不支持的操作', async () => {
      const request: MLPPRequest = {
        operation: 'unsupported' as any,
        payload: {},
        metadata: { requestId: 'req-006', timestamp: Date.now() }
      };

      const response = await confirmProtocol.executeOperation(request);

      expect(response.status).toBe('error');
      expect(response.error).toBeDefined();
      expect(response.error!.message).toContain('Unsupported operation');
    });

    it('应该处理服务层错误', async () => {
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

      mockConfirmService.createConfirm.mockRejectedValue(new Error('Service error'));

      const request: MLPPRequest = {
        operation: 'create',
        payload: createRequest,
        metadata: { requestId: 'req-007', timestamp: Date.now() }
      };

      const response = await confirmProtocol.executeOperation(request);

      expect(response.status).toBe('error');
      expect(response.error).toBeDefined();
      expect(response.error!.message).toBe('Service error');
    });
  });

  describe('getMetadata方法测试', () => {
    it('应该返回正确的协议元数据', () => {
      const metadata = confirmProtocol.getMetadata();

      expect(metadata.name).toBe('confirm');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.description).toContain('approval workflow protocol');
      expect(metadata.supportedOperations).toContain('create');
      expect(metadata.supportedOperations).toContain('approve');
      expect(metadata.supportedOperations).toContain('reject');
    });
  });

  describe('healthCheck方法测试', () => {
    it('应该返回健康状态', async () => {
      const health = await confirmProtocol.healthCheck();

      expect(health.status).toBe('healthy');
      expect(typeof health.timestamp).toBe('string');
      expect(health.metadata).toBeDefined();
      expect(health.metadata.module).toBe('confirm');
    });
  });
});
