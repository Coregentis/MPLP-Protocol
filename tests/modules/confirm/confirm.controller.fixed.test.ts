/**
 * Confirm控制器修复测试
 * 
 * @description 测试ConfirmController的API响应格式和错误处理
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 */

import { ConfirmController } from '../../../src/modules/confirm/api/controllers/confirm.controller';
import { ConfirmManagementService } from '../../../src/modules/confirm/application/services/confirm-management.service';
import { 
  CreateConfirmRequest,
  UpdateConfirmRequest,
  ConfirmQueryFilter,
  UUID
} from '../../../src/modules/confirm/types';
import { createMockConfirmEntityData, createMockCreateConfirmRequest } from './test-data-factory';

// Mock ConfirmManagementService
jest.mock('../../../src/modules/confirm/application/services/confirm-management.service');

describe('ConfirmController修复测试', () => {
  let confirmController: ConfirmController;
  let mockConfirmService: jest.Mocked<ConfirmManagementService>;
  let mockConfirmData: any;

  beforeEach(() => {
    mockConfirmService = new ConfirmManagementService(null as any) as jest.Mocked<ConfirmManagementService>;
    confirmController = new ConfirmController(mockConfirmService);
    mockConfirmData = createMockConfirmEntityData();
    
    // 重置所有mock
    jest.clearAllMocks();
  });

  describe('createConfirm方法测试', () => {
    it('应该返回成功响应', async () => {
      const createRequest = createMockCreateConfirmRequest();
      mockConfirmService.createConfirm.mockResolvedValue(mockConfirmData);

      const result = await confirmController.createConfirm(createRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConfirmData);
      expect(result.message).toBe('Confirmation created successfully');
      expect(result.timestamp).toBeDefined();
    });

    it('应该返回错误响应', async () => {
      const createRequest = createMockCreateConfirmRequest();
      mockConfirmService.createConfirm.mockRejectedValue(new Error('Creation failed'));

      const result = await confirmController.createConfirm(createRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Creation failed');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('getConfirm方法测试', () => {
    it('应该返回成功响应', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      mockConfirmService.getConfirm.mockResolvedValue(mockConfirmData);

      const result = await confirmController.getConfirm(confirmId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConfirmData);
      expect(result.timestamp).toBeDefined();
    });

    it('应该返回错误响应', async () => {
      const confirmId = 'non-existent' as UUID;
      mockConfirmService.getConfirm.mockRejectedValue(new Error('Not found'));

      const result = await confirmController.getConfirm(confirmId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not found');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('listConfirms方法测试', () => {
    it('应该返回成功响应', async () => {
      const mockList = {
        items: [mockConfirmData],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrevious: false
      };
      mockConfirmService.listConfirms.mockResolvedValue(mockList);

      const result = await confirmController.listConfirms();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockList);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('queryConfirms方法测试', () => {
    it('应该返回成功响应', async () => {
      const filter: ConfirmQueryFilter = { status: ['pending'] };
      const mockResults = {
        items: [mockConfirmData],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrevious: false
      };
      mockConfirmService.queryConfirms.mockResolvedValue(mockResults);

      const result = await confirmController.queryConfirms(filter);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResults);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('updateConfirm方法测试', () => {
    it('应该返回成功响应', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      const updateRequest: UpdateConfirmRequest = { priority: 'critical' };
      const updatedData = { ...mockConfirmData, priority: 'critical' };
      
      mockConfirmService.updateConfirm.mockResolvedValue(updatedData);

      const result = await confirmController.updateConfirm(confirmId, updateRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedData);
      expect(result.message).toBe('Confirmation updated successfully');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('approveConfirm方法测试', () => {
    it('应该返回成功响应', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      const approverId = 'tech-lead-001' as UUID;
      const comments = 'Approved';
      const approvedData = { ...mockConfirmData, status: 'approved' };
      
      mockConfirmService.approveConfirm.mockResolvedValue(approvedData);

      const result = await confirmController.approveConfirm(confirmId, approverId, comments);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(approvedData);
      expect(result.message).toBe('Confirmation approved successfully');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('rejectConfirm方法测试', () => {
    it('应该返回成功响应', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      const approverId = 'tech-lead-001' as UUID;
      const reason = 'Security concerns';
      const rejectedData = { ...mockConfirmData, status: 'rejected' };
      
      mockConfirmService.rejectConfirm.mockResolvedValue(rejectedData);

      const result = await confirmController.rejectConfirm(confirmId, approverId, reason);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(rejectedData);
      expect(result.message).toBe('Confirmation rejected successfully');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('deleteConfirm方法测试', () => {
    it('应该返回成功响应', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      mockConfirmService.deleteConfirm.mockResolvedValue(undefined);

      const result = await confirmController.deleteConfirm(confirmId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Confirmation deleted successfully');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('错误处理测试', () => {
    it('应该正确处理服务层错误', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      mockConfirmService.getConfirm.mockRejectedValue(new Error('Service error'));

      const result = await confirmController.getConfirm(confirmId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Service error');
      expect(result.timestamp).toBeDefined();
    });

    it('应该处理无效参数', async () => {
      const invalidRequest = {} as CreateConfirmRequest;
      mockConfirmService.createConfirm.mockRejectedValue(new Error('Invalid request'));

      const result = await confirmController.createConfirm(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid request');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('响应格式测试', () => {
    it('成功响应应该包含必需字段', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      mockConfirmService.getConfirm.mockResolvedValue(mockConfirmData);

      const result = await confirmController.getConfirm(confirmId);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.timestamp).toBe('string');
    });

    it('错误响应应该包含必需字段', async () => {
      const confirmId = 'non-existent' as UUID;
      mockConfirmService.getConfirm.mockRejectedValue(new Error('Not found'));

      const result = await confirmController.getConfirm(confirmId);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('timestamp');
      expect(result.success).toBe(false);
      expect(typeof result.error).toBe('string');
      expect(typeof result.timestamp).toBe('string');
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
