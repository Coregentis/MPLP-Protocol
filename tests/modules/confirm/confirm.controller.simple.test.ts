/**
 * Confirm控制器简化测试
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
  UUID
} from '../../../src/modules/confirm/types';
import { createMockConfirmEntityData, createMockCreateConfirmRequest } from './test-data-factory';

// Mock ConfirmManagementService
jest.mock('../../../src/modules/confirm/application/services/confirm-management.service');

describe('ConfirmController简化测试', () => {
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
    it('应该成功创建确认请求', async () => {
      const createRequest = createMockCreateConfirmRequest();
      mockConfirmService.createConfirm.mockResolvedValue(mockConfirmData);

      const result = await confirmController.createConfirm(createRequest);

      expect(mockConfirmService.createConfirm).toHaveBeenCalledWith(createRequest);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockConfirmData);
      expect(result.message).toBe('Confirmation created successfully');
    });

    it('应该处理创建失败的情况', async () => {
      const createRequest = createMockCreateConfirmRequest();
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
      mockConfirmService.getConfirm.mockRejectedValue(new Error('Confirm with ID non-existent-confirm not found'));

      const result = await confirmController.getConfirm(confirmId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Confirm with ID non-existent-confirm not found');
    });
  });

  describe('listConfirms方法测试', () => {
    it('应该成功获取确认请求列表', async () => {
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

      expect(mockConfirmService.listConfirms).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: mockList,
        timestamp: expect.any(String)
      });
    });

    it('应该支持分页参数', async () => {
      const pagination = { page: 1, limit: 10 };
      const mockList = {
        items: [mockConfirmData],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrevious: false
      };
      mockConfirmService.listConfirms.mockResolvedValue(mockList);

      const result = await confirmController.listConfirms(pagination);

      expect(mockConfirmService.listConfirms).toHaveBeenCalledWith(pagination);
      expect(result).toEqual({
        success: true,
        data: mockList,
        timestamp: expect.any(String)
      });
    });
  });

  describe('queryConfirms方法测试', () => {
    it('应该成功查询确认请求', async () => {
      const filter: ConfirmQueryFilter = {
        status: ['pending'],
        priority: ['high'],
        confirmationType: ['approval']
      };
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

      expect(mockConfirmService.queryConfirms).toHaveBeenCalledWith(filter, undefined);
      expect(result).toEqual({
        success: true,
        data: mockResults,
        timestamp: expect.any(String)
      });
    });

    it('应该支持分页查询', async () => {
      const filter: ConfirmQueryFilter = { status: ['pending'] };
      const pagination = { page: 1, limit: 5 };
      const mockResults = {
        items: [mockConfirmData],
        total: 1,
        page: 1,
        limit: 5,
        hasNext: false,
        hasPrevious: false
      };
      mockConfirmService.queryConfirms.mockResolvedValue(mockResults);

      const result = await confirmController.queryConfirms(filter, pagination);

      expect(mockConfirmService.queryConfirms).toHaveBeenCalledWith(filter, pagination);
      expect(result).toEqual({
        success: true,
        data: mockResults,
        timestamp: expect.any(String)
      });
    });
  });

  describe('updateConfirm方法测试', () => {
    it('应该成功更新确认请求', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      const updateRequest: UpdateConfirmRequest = {
        priority: 'critical'
      };

      const updatedData = { ...mockConfirmData, priority: 'critical' };
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
      const approverId = 'tech-lead-001' as UUID;
      const comments = 'Approved for deployment';

      const approvedData = { ...mockConfirmData, status: 'approved' };
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
      const approverId = 'tech-lead-001' as UUID;
      const reason = 'Security concerns';

      const rejectedData = { ...mockConfirmData, status: 'rejected' };
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
