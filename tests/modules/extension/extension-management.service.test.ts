/**
 * Extension管理服务单元测试
 * 
 * 基于Schema驱动测试原则，测试ExtensionManagementService的所有功能
 * 确保100%分支覆盖，发现并修复源代码问题
 * 
 * @version 1.0.0
 * @created 2025-01-28T19:00:00+08:00
 */

import { jest } from '@jest/globals';
import { ExtensionManagementService, OperationResult, CreateExtensionRequest } from '../../../src/modules/extension/application/services/extension-management.service';
import { Extension } from '../../../src/modules/extension/domain/entities/extension.entity';
import { IExtensionRepository, ExtensionFilter, PaginationOptions, PaginatedResult } from '../../../src/modules/extension/domain/repositories/extension-repository.interface';
import { 
  ExtensionType, 
  ExtensionStatus, 
  ExtensionConfiguration,
  ExtensionPoint,
  ApiExtension,
  EventSubscription,
  ExtensionPointType,
  TargetModule,
  HttpMethod,
  EventSource,
  DeliveryGuarantee
} from '../../../src/modules/extension/types';
import { UUID, Version } from '../../../src/public/shared/types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('ExtensionManagementService', () => {
  let service: ExtensionManagementService;
  let mockRepository: jest.Mocked<IExtensionRepository>;

  // 辅助函数：创建有效的ExtensionConfiguration
  const createValidConfiguration = (): ExtensionConfiguration => ({
    schema: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
        debug: { type: 'boolean' },
        timeout: { type: 'number' }
      }
    },
    current_config: {
      enabled: true,
      debug: false,
      timeout: 5000
    },
    default_config: {
      enabled: true,
      debug: false,
      timeout: 3000
    }
  });

  // 辅助函数：创建有效的ExtensionPoint
  const createValidExtensionPoint = (): ExtensionPoint => ({
    point_id: TestDataFactory.Base.generateUUID(),
    name: 'test_hook',
    type: 'hook' as ExtensionPointType,
    target_module: 'context' as TargetModule,
    event_name: 'before_context_create',
    execution_order: 10,
    enabled: true,
    handler: {
      function_name: 'handleBeforeContextCreate',
      timeout_ms: 5000
    },
    conditions: {
      when: 'context.type === "project"',
      required_permissions: ['read:context'],
      context_filters: { type: 'project' }
    }
  });

  beforeEach(() => {
    // 基于实际接口创建Mock依赖
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByFilter: jest.fn(),
      findByName: jest.fn(),
      findActiveExtensions: jest.fn(),
      isNameUnique: jest.fn(),
      exists: jest.fn(),
      count: jest.fn(),
      checkDependencies: jest.fn(),
      findDependents: jest.fn(),

    } as unknown as jest.Mocked<IExtensionRepository>;

    // 创建服务实例 - 基于实际构造函数
    service = new ExtensionManagementService(mockRepository);
  });

  afterEach(async () => {
    // 清理测试数据
    await TestDataFactory.Manager.cleanup();
    jest.clearAllMocks();
  });

  describe('createExtension', () => {
    it('应该成功创建Extension', async () => {
      // 准备测试数据 - 基于实际Schema
      const createRequest: CreateExtensionRequest = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'test-extension',
        version: '1.0.0',
        type: 'plugin',
        display_name: 'Test Extension',
        description: 'A test extension for MPLP',
        configuration: createValidConfiguration()
      };

      // 设置Mock返回值 - 基于实际接口
      mockRepository.isNameUnique.mockResolvedValue(true);
      mockRepository.save.mockResolvedValue(undefined);

      // 执行测试
      const result = await TestHelpers.Performance.expectExecutionTime(
        () => service.createExtension(createRequest),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.SERVICE_OPERATION
      );

      // 验证结果 - 基于实际返回类型
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe(createRequest.name);
      expect(result.data?.version).toBe(createRequest.version);
      expect(result.data?.type).toBe(createRequest.type);
      expect(result.data?.display_name).toBe(createRequest.display_name);
      expect(result.data?.description).toBe(createRequest.description);
      expect(result.data?.configuration).toEqual(createRequest.configuration);
      expect(mockRepository.isNameUnique).toHaveBeenCalledWith(createRequest.name, createRequest.context_id);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('应该处理扩展名称重复', async () => {
      // 准备测试数据
      const createRequest: CreateExtensionRequest = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'duplicate-extension',
        version: '1.0.0',
        type: 'plugin'
      };

      // 设置Mock返回值
      mockRepository.isNameUnique.mockResolvedValue(false);

      // 执行测试
      const result = await service.createExtension(createRequest);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('扩展名称已存在');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('应该处理数据库错误', async () => {
      // 准备测试数据
      const createRequest: CreateExtensionRequest = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'test-extension',
        version: '1.0.0',
        type: 'plugin'
      };

      const dbError = new Error('Database connection failed');

      // 设置Mock返回值
      mockRepository.isNameUnique.mockResolvedValue(true);
      mockRepository.save.mockRejectedValue(dbError);

      // 执行测试
      const result = await service.createExtension(createRequest);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });

    it('应该测试边界条件', async () => {
      const boundaryTests = [
        {
          name: '最小必需参数',
          input: { 
            context_id: TestDataFactory.Base.generateUUID(),
            name: 'minimal-extension',
            version: '1.0.0' as Version,
            type: 'plugin' as ExtensionType
          },
          expectedSuccess: true
        },
        {
          name: '包含所有可选参数',
          input: { 
            context_id: TestDataFactory.Base.generateUUID(),
            name: 'full-extension',
            version: '2.0.0' as Version,
            type: 'middleware' as ExtensionType,
            display_name: 'Full Featured Extension',
            description: 'Complete extension with all features',
            configuration: createValidConfiguration()
          },
          expectedSuccess: true
        },
        {
          name: '不同扩展类型',
          input: { 
            context_id: TestDataFactory.Base.generateUUID(),
            name: 'adapter-extension',
            version: '1.5.0' as Version,
            type: 'adapter' as ExtensionType
          },
          expectedSuccess: true
        }
      ];

      for (const test of boundaryTests) {
        if (test.expectedSuccess) {
          mockRepository.isNameUnique.mockResolvedValue(true);
          mockRepository.save.mockResolvedValue(undefined);

          const result = await service.createExtension(test.input);
          expect(result.success).toBe(true);
          expect(result.data?.name).toBe(test.input.name);
          expect(result.data?.version).toBe(test.input.version);
          expect(result.data?.type).toBe(test.input.type);
        }
        
        // 清理Mock状态
        jest.clearAllMocks();
      }
    });
  });

  describe('getExtensionById', () => {
    it('应该成功获取Extension', async () => {
      // 准备测试数据
      const extensionId = TestDataFactory.Base.generateUUID();
      const mockExtension = new Extension(
        extensionId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'test-extension',
        '1.0.0',
        'plugin',
        'installed',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(mockExtension);

      // 执行测试
      const result = await TestHelpers.Performance.expectExecutionTime(
        () => service.getExtensionById(extensionId),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.SERVICE_OPERATION
      );

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockExtension);
      expect(mockRepository.findById).toHaveBeenCalledWith(extensionId);
    });

    it('应该处理Extension不存在的情况', async () => {
      // 准备测试数据
      const extensionId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.getExtensionById(extensionId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('扩展不存在');
    });

    it('应该处理数据库错误', async () => {
      // 准备测试数据
      const extensionId = TestDataFactory.Base.generateUUID();
      const dbError = new Error('Database connection failed');

      // 设置Mock返回值
      mockRepository.findById.mockRejectedValue(dbError);

      // 执行测试
      const result = await service.getExtensionById(extensionId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('activateExtension', () => {
    it('应该成功激活Extension', async () => {
      // 准备测试数据
      const extensionId = TestDataFactory.Base.generateUUID();
      const existingExtension = new Extension(
        extensionId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'test-extension',
        '1.0.0',
        'plugin',
        'installed',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(existingExtension);
      mockRepository.checkDependencies.mockResolvedValue({
        satisfied: true,
        missing: [],
        conflicts: []
      });
      mockRepository.update.mockResolvedValue(undefined);

      // 执行测试
      const result = await service.activateExtension(extensionId);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockRepository.findById).toHaveBeenCalledWith(extensionId);
      expect(mockRepository.checkDependencies).toHaveBeenCalledWith(existingExtension);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('应该处理Extension不存在的情况', async () => {
      // 准备测试数据
      const extensionId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.activateExtension(extensionId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('扩展不存在');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('应该处理依赖不满足的情况', async () => {
      // 准备测试数据
      const extensionId = TestDataFactory.Base.generateUUID();
      const existingExtension = new Extension(
        extensionId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'test-extension',
        '1.0.0',
        'plugin',
        'installed',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(existingExtension);
      mockRepository.checkDependencies.mockResolvedValue({
        satisfied: false,
        missing: ['dependency-1', 'dependency-2'],
        conflicts: []
      });

      // 执行测试
      const result = await service.activateExtension(extensionId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('依赖不满足: dependency-1, dependency-2');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deactivateExtension', () => {
    it('应该成功停用Extension', async () => {
      // 准备测试数据
      const extensionId = TestDataFactory.Base.generateUUID();
      const existingExtension = new Extension(
        extensionId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'test-extension',
        '1.0.0',
        'plugin',
        'active',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(existingExtension);
      mockRepository.findDependents.mockResolvedValue([]);
      mockRepository.update.mockResolvedValue(undefined);

      // 执行测试
      const result = await service.deactivateExtension(extensionId);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockRepository.findById).toHaveBeenCalledWith(extensionId);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('应该处理Extension不存在的情况', async () => {
      // 准备测试数据
      const extensionId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.deactivateExtension(extensionId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('扩展不存在');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });



  describe('queryExtensions', () => {
    it('应该成功查询Extension列表', async () => {
      // 准备测试数据
      const filter: ExtensionFilter = {
        context_id: TestDataFactory.Base.generateUUID(),
        type: 'plugin'
      };
      const pagination: PaginationOptions = {
        page: 1,
        limit: 10
      };

      const mockResult: PaginatedResult<Extension> = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        total_pages: 0
      };

      // 设置Mock返回值
      mockRepository.findByFilter.mockResolvedValue(mockResult);

      // 执行测试
      const result = await service.queryExtensions(filter, pagination);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockRepository.findByFilter).toHaveBeenCalledWith(filter, pagination);
    });

    it('应该处理无分页参数的查询', async () => {
      // 准备测试数据
      const filter: ExtensionFilter = {
        status: 'active'
      };

      const mockResult: PaginatedResult<Extension> = {
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        total_pages: 0
      };

      // 设置Mock返回值
      mockRepository.findByFilter.mockResolvedValue(mockResult);

      // 执行测试
      const result = await service.queryExtensions(filter);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockRepository.findByFilter).toHaveBeenCalledWith(filter, undefined);
    });
  });

  describe('getActiveExtensions', () => {
    it('应该成功获取活跃扩展', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const mockExtensions: Extension[] = [];

      // 设置Mock返回值
      mockRepository.findActiveExtensions.mockResolvedValue(mockExtensions);

      // 执行测试
      const result = await service.getActiveExtensions(contextId);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockExtensions);
      expect(mockRepository.findActiveExtensions).toHaveBeenCalledWith(contextId);
    });

    it('应该处理无上下文ID的查询', async () => {
      // 准备测试数据
      const mockExtensions: Extension[] = [];

      // 设置Mock返回值
      mockRepository.findActiveExtensions.mockResolvedValue(mockExtensions);

      // 执行测试
      const result = await service.getActiveExtensions();

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockExtensions);
      expect(mockRepository.findActiveExtensions).toHaveBeenCalledWith(undefined);
    });

    it('应该处理数据库错误', async () => {
      // 准备测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      const dbError = new Error('Database connection failed');

      // 设置Mock返回值
      mockRepository.findActiveExtensions.mockRejectedValue(dbError);

      // 执行测试
      const result = await service.getActiveExtensions(contextId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('addExtensionPoint', () => {
    it('应该成功为扩展添加扩展点', async () => {
      // 准备测试数据
      const extensionId = TestDataFactory.Base.generateUUID();
      const existingExtension = new Extension(
        extensionId,
        TestDataFactory.Base.generateUUID(),
        '1.0.0',
        'test-extension',
        '1.0.0',
        'plugin',
        'installed',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      );

      const newExtensionPoint = createValidExtensionPoint();

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(existingExtension);
      mockRepository.update.mockResolvedValue(undefined);

      // 执行测试
      const result = await service.addExtensionPoint(extensionId, newExtensionPoint);

      // 验证结果
      expect(result.success).toBe(true);
      expect(mockRepository.findById).toHaveBeenCalledWith(extensionId);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('应该处理扩展不存在的情况', async () => {
      // 准备测试数据
      const extensionId = TestDataFactory.Base.generateUUID();
      const extensionPoint = createValidExtensionPoint();

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(null);

      // 执行测试
      const result = await service.addExtensionPoint(extensionId, extensionPoint);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('扩展不存在');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });


});
