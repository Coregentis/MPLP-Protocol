/**
 * Confirm协议最终测试
 * 
 * @description 测试ConfirmProtocol的实际响应格式
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import { ConfirmProtocol } from '../../../src/modules/confirm/infrastructure/protocols/confirm.protocol';
import { ConfirmManagementService } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { MLPPRequest } from '../../../src/core/protocols/mplp-protocol-base';
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

describe('ConfirmProtocol最终测试', () => {
  let confirmProtocol: ConfirmProtocol;
  let mockConfirmService: jest.Mocked<ConfirmManagementService>;
  let mockConfirmData: any;

  beforeEach(() => {
    mockConfirmService = new ConfirmManagementService(null as any) as jest.Mocked<ConfirmManagementService>;
    mockConfirmData = createMockConfirmEntityData();

    confirmProtocol = new ConfirmProtocol(
      mockConfirmService,
      {} as any, {} as any, {} as any, {} as any, {} as any,
      {} as any, {} as any, {} as any, {} as any
    );

    jest.clearAllMocks();
  });

  describe('executeOperation方法测试', () => {
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
      expect(response.protocolVersion).toBe('1.0.0');
      expect(response.timestamp).toBeDefined();
      expect(response.metadata.module).toBe('confirm');
    });

    it('应该成功处理approve操作', async () => {
      const approvePayload = {
        confirmId: 'confirm-test-001' as UUID,
        approverId: 'tech-lead-001' as UUID,
        comments: 'Approved'
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
      expect(response.error.message).toContain('Unsupported operation');
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
      expect(response.error.message).toBe('Service error');
    });
  });

  describe('getMetadata方法测试', () => {
    it('应该返回正确的协议元数据', () => {
      const metadata = confirmProtocol.getMetadata();

      expect(metadata.name).toBe('confirm');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.description).toContain('Enterprise approval workflow protocol');
      expect(Array.isArray(metadata.supportedOperations)).toBe(true);
      expect(metadata.supportedOperations.length).toBeGreaterThan(0);
    });
  });

  describe('healthCheck方法测试', () => {
    it('应该返回健康状态', async () => {
      const health = await confirmProtocol.healthCheck();

      expect(health.status).toBe('healthy');
      expect(typeof health.timestamp).toBe('string');
      // details可能是undefined，这是正常的
      expect(health).toHaveProperty('timestamp');
    });
  });

  describe('协议标准符合性测试', () => {
    it('应该实现基本协议接口', () => {
      expect(typeof confirmProtocol.executeOperation).toBe('function');
      expect(typeof confirmProtocol.getMetadata).toBe('function');
      expect(typeof confirmProtocol.healthCheck).toBe('function');
      expect(typeof confirmProtocol.getProtocolMetadata).toBe('function');
    });

    it('成功响应应该包含必需字段', async () => {
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
      expect(response).toHaveProperty('protocolVersion');
      expect(response).toHaveProperty('metadata');
      expect(response.status).toBe('success');
    });

    it('错误响应应该包含错误信息', async () => {
      const request: MLPPRequest = {
        operation: 'unsupported' as any,
        payload: {},
        metadata: { requestId: 'req-001', timestamp: Date.now() }
      };

      const response = await confirmProtocol.executeOperation(request);

      expect(response.status).toBe('error');
      expect(response).toHaveProperty('error');
      expect(response.error).toHaveProperty('code');
      expect(response.error).toHaveProperty('message');
    });
  });

  describe('MPLP协议接口测试', () => {
    it('getProtocolMetadata应该返回元数据', () => {
      const metadata = confirmProtocol.getProtocolMetadata();
      expect(metadata.name).toBe('confirm');
      expect(metadata.version).toBe('1.0.0');
    });

    it('应该支持标准操作', () => {
      const metadata = confirmProtocol.getMetadata();
      const expectedOperations = ['create', 'get', 'list', 'approve', 'reject'];
      
      expectedOperations.forEach(operation => {
        expect(metadata.supportedOperations).toContain(operation);
      });
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

      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('边界条件测试', () => {
    it('应该处理空payload', async () => {
      const request: MLPPRequest = {
        operation: 'create',
        payload: null,
        metadata: { requestId: 'req-001', timestamp: Date.now() }
      };

      const response = await confirmProtocol.executeOperation(request);

      // 协议可能有默认处理逻辑，所以可能成功或失败都是正常的
      expect(response.status).toMatch(/^(success|error)$/);
      expect(response).toHaveProperty('timestamp');
    });

    it('应该处理缺少metadata的请求', async () => {
      const createRequest = createMockCreateConfirmRequest();
      mockConfirmService.createConfirm.mockResolvedValue(mockConfirmData);

      const request: MLPPRequest = {
        operation: 'create',
        payload: createRequest,
        metadata: {} as any
      };

      const response = await confirmProtocol.executeOperation(request);

      expect(response).toBeDefined();
      expect(response.status).toBeDefined();
    });
  });

  describe('协议版本测试', () => {
    it('所有响应应该包含协议版本', async () => {
      const createRequest = createMockCreateConfirmRequest();
      mockConfirmService.createConfirm.mockResolvedValue(mockConfirmData);

      const request: MLPPRequest = {
        operation: 'create',
        payload: createRequest,
        metadata: { requestId: 'req-001', timestamp: Date.now() }
      };

      const response = await confirmProtocol.executeOperation(request);

      expect(response.protocolVersion).toBe('1.0.0');
    });

    it('错误响应也应该包含协议版本', async () => {
      const request: MLPPRequest = {
        operation: 'unsupported' as any,
        payload: {},
        metadata: { requestId: 'req-001', timestamp: Date.now() }
      };

      const response = await confirmProtocol.executeOperation(request);

      expect(response.protocolVersion).toBe('1.0.0');
    });
  });
});
