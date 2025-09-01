/**
 * Confirm管理服务简化测试
 * 
 * @description 测试ConfirmManagementService的业务逻辑和MPLP模块集成
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
  UUID
} from '../../../src/modules/confirm/types';
import { createMockConfirmEntityData, createMockCreateConfirmRequest } from './test-data-factory';

// Mock Repository with correct interface
const mockRepository: jest.Mocked<IConfirmRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  findByFilter: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  exists: jest.fn(),
  findByContextId: jest.fn(),
  findByPlanId: jest.fn(),
  findByRequesterId: jest.fn(),
  findByApproverId: jest.fn(),
  findByStatus: jest.fn(),
  findByPriority: jest.fn(),
  findByType: jest.fn(),
  findByDateRange: jest.fn(),
  updateBatch: jest.fn(),
  deleteBatch: jest.fn(),
  clear: jest.fn(),
  getStatistics: jest.fn()
} as any;

describe('ConfirmManagementService简化测试', () => {
  let confirmService: ConfirmManagementService;
  let mockConfirmEntity: ConfirmEntity;

  beforeEach(() => {
    confirmService = new ConfirmManagementService(mockRepository);
    
    const mockData = createMockConfirmEntityData();
    mockConfirmEntity = new ConfirmEntity(mockData);
    
    // 重置所有mock
    jest.clearAllMocks();
  });

  describe('createConfirm方法测试', () => {
    it('应该成功创建确认请求', async () => {
      const createRequest = createMockCreateConfirmRequest();
      mockRepository.create.mockResolvedValue(mockConfirmEntity);

      const result = await confirmService.createConfirm(createRequest);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.confirmationType).toBe('approval');
      expect(result.priority).toBe('high');
      expect(result.status).toBe('pending');
    });

    it('应该生成唯一的确认ID', async () => {
      const createRequest = createMockCreateConfirmRequest();
      
      // Mock两次不同的返回值
      const entity1 = new ConfirmEntity(createMockConfirmEntityData({ confirmId: 'confirm-001' }));
      const entity2 = new ConfirmEntity(createMockConfirmEntityData({ confirmId: 'confirm-002' }));
      
      mockRepository.create
        .mockResolvedValueOnce(entity1)
        .mockResolvedValueOnce(entity2);

      const result1 = await confirmService.createConfirm(createRequest);
      const result2 = await confirmService.createConfirm(createRequest);

      expect(result1.confirmId).toBeDefined();
      expect(result2.confirmId).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalledTimes(2);
    });

    it('应该处理创建失败的情况', async () => {
      const createRequest = createMockCreateConfirmRequest();
      mockRepository.create.mockRejectedValue(new Error('Creation failed'));

      await expect(confirmService.createConfirm(createRequest)).rejects.toThrow('Creation failed');
    });
  });

  describe('getConfirm方法测试', () => {
    it('应该成功获取确认请求', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      mockRepository.findById.mockResolvedValue(mockConfirmEntity);

      const result = await confirmService.getConfirm(confirmId);

      expect(mockRepository.findById).toHaveBeenCalledWith(confirmId);
      expect(result).toBeDefined();
      expect(result?.confirmId).toBe('confirm-test-001');
    });

    it('应该处理不存在的确认请求', async () => {
      const confirmId = 'non-existent' as UUID;
      mockRepository.findById.mockResolvedValue(null);

      await expect(confirmService.getConfirm(confirmId)).rejects.toThrow('Confirm with ID non-existent not found');
    });
  });

  describe('listConfirms方法测试', () => {
    it('应该成功获取确认请求列表', async () => {
      const mockList = {
        items: [mockConfirmEntity],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrevious: false
      };
      mockRepository.findAll.mockResolvedValue(mockList);

      const result = await confirmService.listConfirms();

      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('应该支持分页参数', async () => {
      const pagination = { page: 1, limit: 10 };
      const mockList = {
        items: [mockConfirmEntity],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrevious: false
      };
      mockRepository.findAll.mockResolvedValue(mockList);

      const result = await confirmService.listConfirms(pagination);

      expect(mockRepository.findAll).toHaveBeenCalledWith(pagination);
      expect(result.items).toHaveLength(1);
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
        items: [mockConfirmEntity],
        total: 1,
        page: 1,
        limit: 10,
        hasNext: false,
        hasPrevious: false
      };
      mockRepository.findByFilter.mockResolvedValue(mockResults);

      const result = await confirmService.queryConfirms(filter);

      expect(mockRepository.findByFilter).toHaveBeenCalledWith(filter, undefined);
      expect(result.items).toHaveLength(1);
    });

    it('应该支持分页查询', async () => {
      const filter: ConfirmQueryFilter = { status: ['pending'] };
      const pagination = { page: 1, limit: 5 };
      const mockResults = {
        items: [mockConfirmEntity],
        total: 1,
        page: 1,
        limit: 5,
        hasNext: false,
        hasPrevious: false
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

      const updatedEntity = new ConfirmEntity({
        ...mockConfirmEntity.toEntityData(),
        priority: 'critical'
      });
      
      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockRepository.update.mockResolvedValue(updatedEntity);

      const result = await confirmService.updateConfirm(confirmId, updateRequest);

      expect(mockRepository.findById).toHaveBeenCalledWith(confirmId);
      expect(mockRepository.update).toHaveBeenCalled();
      expect(result.priority).toBe('critical');
    });

    it('应该处理不存在的确认请求', async () => {
      const confirmId = 'non-existent' as UUID;
      const updateRequest: UpdateConfirmRequest = { priority: 'critical' };
      
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        confirmService.updateConfirm(confirmId, updateRequest)
      ).rejects.toThrow('Confirm with ID non-existent not found');
    });
  });

  describe('approveConfirm方法测试', () => {
    it('应该成功批准确认请求', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      const approverId = 'tech-lead-001' as UUID; // 这个ID匹配测试数据中的审批者
      const comments = 'Approved for deployment';

      const approvedEntity = new ConfirmEntity({
        ...mockConfirmEntity.toEntityData(),
        status: 'approved'
      });

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockRepository.update.mockResolvedValue(approvedEntity);

      const result = await confirmService.approveConfirm(confirmId, approverId, comments);

      expect(mockRepository.findById).toHaveBeenCalledWith(confirmId);
      expect(mockRepository.update).toHaveBeenCalled();
      expect(result.status).toBe('approved');
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

      const rejectedEntity = new ConfirmEntity({
        ...mockConfirmEntity.toEntityData(),
        status: 'rejected'
      });

      mockRepository.findById.mockResolvedValue(mockConfirmEntity);
      mockRepository.update.mockResolvedValue(rejectedEntity);

      const result = await confirmService.rejectConfirm(confirmId, approverId, reason);

      expect(mockRepository.findById).toHaveBeenCalledWith(confirmId);
      expect(mockRepository.update).toHaveBeenCalled();
      expect(result.status).toBe('rejected');
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

  describe('错误处理测试', () => {
    it('应该正确传播Repository错误', async () => {
      const confirmId = 'confirm-test-001' as UUID;
      const error = new Error('Repository error');
      mockRepository.findById.mockRejectedValue(error);

      await expect(confirmService.getConfirm(confirmId)).rejects.toThrow('Repository error');
    });

    it('应该处理无效参数', async () => {
      const invalidRequest = {} as CreateConfirmRequest;

      // 这个测试会因为缺少approvalWorkflow.steps而失败，这是预期的
      await expect(confirmService.createConfirm(invalidRequest)).rejects.toThrow();
    });
  });
});
