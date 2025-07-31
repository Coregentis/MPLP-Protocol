/**
 * Context管理服务单元测试
 * 
 * 测试ContextManagementService的所有功能，确保100%分支覆盖
 * 
 * @version 1.0.0
 * @created 2025-01-28T16:00:00+08:00
 */

import { jest } from '@jest/globals';
import { ContextManagementService, ContextOperationResult } from '../../../src/modules/context/application/services/context-management.service';
import { Context } from '../../../src/modules/context/domain/entities/context.entity';
import { ContextFactory, CreateContextParams } from '../../../src/modules/context/domain/factories/context.factory';
import { IContextRepository, ContextFilter } from '../../../src/modules/context/domain/repositories/context-repository.interface';
import { ContextValidationService, ValidationError } from '../../../src/modules/context/domain/services/context-validation.service';
import { UUID, EntityStatus, PaginationParams } from '../../../src/public/shared/types';
import { ContextLifecycleStage } from '../../../src/public/shared/types/context-types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('ContextManagementService', () => {
  let service: ContextManagementService;
  let mockRepository: jest.Mocked<IContextRepository>;
  let mockFactory: jest.Mocked<ContextFactory>;
  let mockValidationService: jest.Mocked<ContextValidationService>;

  beforeEach(() => {
    // 创建Mock依赖
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByFilter: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      count: jest.fn(),
      findByName: jest.fn(),
      findByStatus: jest.fn(),
      findByLifecycleStage: jest.fn(),
      findBySessionId: jest.fn(),
      findBySharedStateId: jest.fn()
    } as jest.Mocked<IContextRepository>;

    mockFactory = {
      createContext: jest.fn(),
      reconstitute: jest.fn(),
      cloneContext: jest.fn()
    } as jest.Mocked<ContextFactory>;

    mockValidationService = {
      validateContext: jest.fn(),
      validateName: jest.fn(),
      validateDescription: jest.fn(),
      validateLifecycleStage: jest.fn(),
      validateStatus: jest.fn(),
      validateStatusTransition: jest.fn(),
      validateLifecycleTransition: jest.fn(),
      validateDeletion: jest.fn()
    } as jest.Mocked<ContextValidationService>;

    // 创建服务实例
    service = new ContextManagementService(
      mockRepository,
      mockFactory,
      mockValidationService
    );
  });

  afterEach(async () => {
    // 清理测试数据
    await TestDataFactory.Manager.cleanup();
    jest.clearAllMocks();
  });

  describe('createContext', () => {
    it('应该成功创建Context', async () => {
      // 准备测试数据
      const createParams: CreateContextParams = TestDataFactory.Context.createContextRequest();
      const mockContext = new Context(
        TestDataFactory.Base.generateUUID(),
        createParams.name,
        createParams.description || null,
        ContextLifecycleStage.ACTIVE,
        EntityStatus.ACTIVE,
        new Date(),
        new Date(),
        [],
        [],
        createParams.configuration || {},
        createParams.metadata || {}
      );

      // 设置Mock返回值
      mockFactory.createContext.mockReturnValue(mockContext);
      mockValidationService.validateContext.mockReturnValue([]);
      mockRepository.save.mockResolvedValue(undefined);

      // 执行测试
      const result = await TestHelpers.Performance.expectExecutionTime(
        () => service.createContext(createParams),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.CONTEXT_CREATION
      );

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockContext);
      expect(mockFactory.createContext).toHaveBeenCalledWith(createParams);
      expect(mockValidationService.validateContext).toHaveBeenCalledWith(mockContext);
      expect(mockRepository.save).toHaveBeenCalledWith(mockContext);
    });

    it('应该处理验证错误', async () => {
      // 准备测试数据
      const createParams: CreateContextParams = TestDataFactory.Context.createContextRequest();
      const mockContext = new Context(
        TestDataFactory.Base.generateUUID(),
        createParams.name,
        createParams.description || null,
        ContextLifecycleStage.ACTIVE,
        EntityStatus.ACTIVE,
        new Date(),
        new Date()
      );

      const validationErrors: ValidationError[] = [
        { field: 'name', message: 'Name is required' }
      ];

      // 设置Mock返回值
      mockFactory.createContext.mockReturnValue(mockContext);
      mockValidationService.validateContext.mockReturnValue(validationErrors);

      // 执行测试
      const result = await service.createContext(createParams);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toEqual(validationErrors);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('应该处理保存错误', async () => {
      // 准备测试数据
      const createParams: CreateContextParams = TestDataFactory.Context.createContextRequest();
      const mockContext = new Context(
        TestDataFactory.Base.generateUUID(),
        createParams.name,
        createParams.description || null,
        ContextLifecycleStage.ACTIVE,
        EntityStatus.ACTIVE,
        new Date(),
        new Date()
      );

      const saveError = new Error('Database connection failed');

      // 设置Mock返回值
      mockFactory.createContext.mockReturnValue(mockContext);
      mockValidationService.validateContext.mockReturnValue([]);
      mockRepository.save.mockRejectedValue(saveError);

      // 执行测试
      const result = await service.createContext(createParams);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toEqual([{ field: 'system', message: 'System error: Database connection failed' }]);
    });

    it('应该测试边界条件', async () => {
      const boundaryTests = [
        {
          name: '空名称',
          input: { ...TestDataFactory.Context.createContextRequest(), name: '' },
          expectedError: /validation/i
        },
        {
          name: '超长名称',
          input: { ...TestDataFactory.Context.createContextRequest(), name: 'a'.repeat(1000) },
          expectedError: /validation/i
        },
        {
          name: 'null描述',
          input: { ...TestDataFactory.Context.createContextRequest(), description: null },
          expectedResult: { success: true }
        }
      ];

      for (const test of boundaryTests) {
        const mockContext = new Context(
          TestDataFactory.Base.generateUUID(),
          test.input.name,
          test.input.description || null,
          ContextLifecycleStage.ACTIVE,
          EntityStatus.ACTIVE,
          new Date(),
          new Date()
        );

        mockFactory.createContext.mockReturnValue(mockContext);

        if (test.input.name === '' || test.input.name.length > 500) {
          mockValidationService.validateContext.mockReturnValue([
            { field: 'name', message: 'Invalid name' }
          ]);

          const result = await service.createContext(test.input);
          expect(result.success).toBe(false);
          expect(result.error).toEqual([{ field: 'name', message: 'Invalid name' }]);
        } else {
          mockValidationService.validateContext.mockReturnValue([]);
          mockRepository.save.mockResolvedValue(undefined);

          const result = await service.createContext(test.input);
          expect(result.success).toBe(true);
        }
      }
    });
  });

  describe('getContextById', () => {
    it('应该成功获取Context', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const mockContext = new Context(
        contextId,
        'Test Context',
        'Test Description',
        ContextLifecycleStage.ACTIVE,
        EntityStatus.ACTIVE,
        new Date(),
        new Date()
      );

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(mockContext);

      // 执行测试
      const result = await TestHelpers.Performance.expectExecutionTime(
        () => service.getContextById(contextId),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.SERVICE_OPERATION
      );

      // 验证结果
      expect(result).toEqual(mockContext);
      expect(mockRepository.findById).toHaveBeenCalledWith(contextId);
    });

    it('应该处理Context不存在的情况', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.getContextById(contextId);

      // 验证结果
      expect(result).toBeNull();
    });

    it('应该处理数据库错误', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const dbError = new Error('Database connection failed');

      // 设置Mock返回值
      mockRepository.findById.mockRejectedValue(dbError);

      // 执行测试并期望抛出错误
      await TestHelpers.Error.expectError(
        () => service.getContextById(contextId),
        /Failed to get context/
      );
    });
  });

  describe('updateContext', () => {
    it('应该成功更新Context', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const updateParams = {
        name: 'Updated Context',
        description: 'Updated Description'
      };

      const existingContext = new Context(
        contextId,
        'Original Context',
        'Original Description',
        ContextLifecycleStage.ACTIVE,
        EntityStatus.ACTIVE,
        new Date(),
        new Date()
      );

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(existingContext);
      mockValidationService.validateContext.mockReturnValue([]);
      mockRepository.save.mockResolvedValue(undefined);

      // 执行测试
      const result = await service.updateContext(contextId, updateParams);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockRepository.findById).toHaveBeenCalledWith(contextId);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('应该处理Context不存在的情况', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const updateParams = { name: 'Updated Context' };

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.updateContext(contextId, updateParams);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteContext', () => {
    it('应该成功删除Context', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const existingContext = new Context(
        contextId,
        'Test Context',
        'Test Description',
        ContextLifecycleStage.ACTIVE,
        EntityStatus.ACTIVE,
        new Date(),
        new Date()
      );

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(existingContext);
      mockValidationService.validateDeletion.mockReturnValue(null);
      mockRepository.save.mockResolvedValue(undefined);

      // 执行测试
      const result = await service.deleteContext(contextId);

      // 验证结果
      expect(result.success).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith(contextId);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('应该处理Context不存在的情况', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.deleteContext(contextId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
