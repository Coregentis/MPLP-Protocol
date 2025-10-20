/**
 * Confirm协议简化测试
 * 
 * @description 测试ConfirmProtocol的MPLP协议接口实现
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import { ConfirmProtocol } from '../../../src/modules/confirm/infrastructure/protocols/confirm.protocol';
import { ConfirmManagementService } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { 
  MLPPRequest, 
  MLPPResponse
} from '../../../src/core/protocols/mplp-protocol-base';
import { CreateConfirmRequest, UUID } from '../../../src/modules/confirm/types';
import { createMockConfirmEntityData, createMockCreateConfirmRequest } from './test-data-factory';

// Mock所有依赖
jest.mock('../../../src/modules/confirm/application/services/confirm-management.service');
jest.mock('../../../src/core/protocols/cross-cutting-concerns', () => ({
  MLPPSecurityManager: jest.fn().mockImplementation(() => ({})),
  MLPPPerformanceMonitor: jest.fn().mockImplementation(() => ({})),
  MLPPEventBusManager: jest.fn().mockImplementation(() => ({})),
  MLPPErrorHandler: jest.fn().mockImplementation(() => ({})),
  MLPPCoordinationManager: jest.fn().mockImplementation(() => ({})),
  MLPPOrchestrationManager: jest.fn().mockImplementation(() => ({})),
  MLPPStateSyncManager: jest.fn().mockImplementation(() => ({})),
  MLPPTransactionManager: jest.fn().mockImplementation(() => ({})),
  MLPPProtocolVersionManager: jest.fn().mockImplementation(() => ({}))
}));

describe('ConfirmProtocol简化测试', () => {
  let confirmProtocol: ConfirmProtocol;
  let mockConfirmService: jest.Mocked<ConfirmManagementService>;
  let mockConfirmData: any;

  beforeEach(() => {
    // 创建mock服务
    mockConfirmService = new ConfirmManagementService(null as any) as jest.Mocked<ConfirmManagementService>;
    mockConfirmData = createMockConfirmEntityData();

    // 创建协议实例
    confirmProtocol = new ConfirmProtocol(
      mockConfirmService,
      {} as any, // securityManager
      {} as any, // performanceMonitor
      {} as any, // eventBusManager
      {} as any, // errorHandler
      {} as any, // coordinationManager
      {} as any, // orchestrationManager
      {} as any, // stateSyncManager
      {} as any, // transactionManager
      {} as any  // protocolVersionManager
    );

    // 重置所有mock
    jest.clearAllMocks();
  });

  describe('execute方法测试', () => {
    it('应该成功处理create操作', async () => {
      const createRequest = createMockCreateConfirmRequest();
      mockConfirmService.createConfirm.mockResolvedValue(mockConfirmData);

      const request: MLPPRequest = {
        operation: 'create',
        payload: createRequest,
        metadata: { requestId: 'req-001', timestamp: Date.now() }
      };

      const response = await confirmProtocol.executeOperation(request);

      expect(response.status).toBe('success');
      expect(response.result).toEqual(mockConfirmData);
      expect(mockConfirmService.createConfirm).toHaveBeenCalledWith(createRequest);
    });

    it('应该成功处理approve操作', async () => {
      const approvePayload = {
        confirmId: 'confirm-test-001' as UUID,
        approverId: 'tech-lead-001' as UUID,
        comments: 'Approved for deployment'
      };

      const mockResult = { ...mockConfirmData, status: 'approved' };
      mockConfirmService.approveConfirm.mockResolvedValue(mockResult);

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
        approverId: 'tech-lead-001' as UUID,
        reason: 'Security concerns'
      };

      const mockResult = { ...mockConfirmData, status: 'rejected' };
      mockConfirmService.rejectConfirm.mockResolvedValue(mockResult);

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
      const getPayload = { confirmId: 'confirm-test-001' as UUID };
      mockConfirmService.getConfirm.mockResolvedValue(mockConfirmData);

      const request: MLPPRequest = {
        operation: 'get',
        payload: getPayload,
        metadata: { requestId: 'req-004', timestamp: Date.now() }
      };

      const response = await confirmProtocol.executeOperation(request);

      expect(response.status).toBe('success');
      expect(response.result).toEqual(mockConfirmData);
      expect(mockConfirmService.getConfirm).toHaveBeenCalledWith(getPayload.confirmId);
    });

    it('应该成功处理list操作', async () => {
      const listPayload = { pagination: { page: 1, limit: 10 } };
      const mockResult = {
        items: [mockConfirmData],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrevious: false
      };
      mockConfirmService.listConfirms.mockResolvedValue(mockResult);

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
      const createRequest = createMockCreateConfirmRequest();
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
      expect(metadata.supportedOperations).toContain('get');
      expect(metadata.supportedOperations).toContain('list');
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

  describe('协议标准符合性测试', () => {
    it('应该实现IMLPPProtocol接口', () => {
      expect(typeof confirmProtocol.executeOperation).toBe('function');
      expect(typeof confirmProtocol.getMetadata).toBe('function');
      expect(typeof confirmProtocol.healthCheck).toBe('function');
    });

    it('execute方法应该返回标准MLPPResponse', async () => {
      const createRequest = createMockCreateConfirmRequest();
      mockConfirmService.createConfirm.mockResolvedValue(mockConfirmData);

      const request: MLPPRequest = {
        operation: 'create',
        payload: createRequest,
        metadata: { requestId: 'req-001', timestamp: Date.now() }
      };

      const response = await confirmProtocol.executeOperation(request);

      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('result');
      expect(response).toHaveProperty('timestamp');
      expect(typeof response.status).toBe('string');
      expect(typeof response.timestamp).toBe('string');
    });

    it('错误响应应该包含errors数组', async () => {
      const request: MLPPRequest = {
        operation: 'unsupported' as any,
        payload: {},
        metadata: { requestId: 'req-001', timestamp: Date.now() }
      };

      const response = await confirmProtocol.executeOperation(request);

      expect(response.status).toBe('error');
      expect(response.error).toBeDefined();
      expect(response.error!.message).toBeDefined();
    });
  });

  describe('性能测试', () => {
    it('应该在合理时间内处理请求', async () => {
      const createRequest = createMockCreateConfirmRequest();
      mockConfirmService.createConfirm.mockResolvedValue(mockConfirmData);

      const request: MLPPRequest = {
        operation: 'create',
        payload: createRequest,
        metadata: { requestId: 'req-001', timestamp: Date.now() }
      };

      const startTime = Date.now();
      await confirmProtocol.executeOperation(request);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
    });
  });
});
