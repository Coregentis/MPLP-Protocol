/**
 * ExtensionManagementService真实实现单元测试
 * 
 * 基于实际实现的方法和返回值进行测试
 * 严格遵循测试规则：基于真实源代码功能实现方式构建测试文件
 * 验证所有业务逻辑的正确性
 * 
 * @version 1.0.0
 * @created 2025-08-11
 */

import { ExtensionManagementService, CreateExtensionRequest, OperationResult } from '../../../src/modules/extension/application/services/extension-management.service';
import { Extension } from '../../../src/modules/extension/domain/entities/extension.entity';
import { IExtensionRepository, ExtensionFilter, PaginationOptions, PaginatedResult } from '../../../src/modules/extension/domain/repositories/extension-repository.interface';
import { ExtensionType, ExtensionStatus, ExtensionPoint, ApiExtension } from '../../../src/modules/extension/types';
import { v4 as uuidv4 } from 'uuid';

describe('ExtensionManagementService真实实现单元测试', () => {
  let service: ExtensionManagementService;
  let mockRepository: jest.Mocked<IExtensionRepository>;

  beforeEach(() => {
    // 创建Mock Repository
    mockRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findByContextId: jest.fn(),
      findByFilter: jest.fn(),
      findActiveExtensions: jest.fn(),
      findWithApiExtensions: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      isNameUnique: jest.fn(),
      checkDependencies: jest.fn(),
      findDependents: jest.fn(),
      batchUpdateStatus: jest.fn(),
      getStatistics: jest.fn(),
    } as jest.Mocked<IExtensionRepository>;

    service = new ExtensionManagementService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 辅助函数：创建有效的Extension实例
  const createValidExtension = (overrides: {
    extensionId?: string;
    contextId?: string;
    name?: string;
    version?: string;
    type?: ExtensionType;
    status?: ExtensionStatus;
  } = {}): Extension => {
    const now = new Date().toISOString();
    
    const schemaData = {
      protocol_version: '1.0.1',
      timestamp: now,
      extension_id: overrides.extensionId || uuidv4(),
      context_id: overrides.contextId || uuidv4(),
      name: overrides.name || 'test-extension',
      display_name: 'Test Extension',
      description: 'Test extension description',
      version: overrides.version || '1.0.0',
      extension_type: overrides.type || 'plugin',
      status: overrides.status || 'installed',
      compatibility: {
        mplp_version: '1.0.0',
        required_modules: [],
        dependencies: [],
        conflicts: [],
      },
      configuration: {
        schema: {},
        current_config: {},
      },
      extension_points: [],
      api_extensions: [],
      event_subscriptions: [],
      lifecycle: {
        install_date: now,
        activation_count: 0,
        error_count: 0,
        auto_start: false,
        load_priority: 0,
      },
      security: {
        sandbox_enabled: true,
        resource_limits: {
          max_memory_mb: 512,
          max_cpu_percent: 50,
          max_file_size_mb: 1024,
          max_network_connections: 50,
        },
        permissions: [],
      },
      metadata: {
        author: 'Test Author',
        license: 'MIT',
        homepage: 'https://test.com',
        repository: 'https://github.com/test/test',
        keywords: ['test'],
        category: 'utility',
      },
    };

    return Extension.fromSchema(schemaData);
  };

  describe('createExtension()', () => {
    it('应该成功创建扩展', async () => {
      const request: CreateExtensionRequest = {
        context_id: uuidv4(),
        name: 'test-extension',
        version: '1.0.0',
        type: 'plugin',
        display_name: 'Test Extension',
        description: 'Test description',
      };

      mockRepository.isNameUnique.mockResolvedValue(true);
      mockRepository.save.mockResolvedValue();

      const result = await service.createExtension(request);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe('test-extension');
      expect(result.data?.version).toBe('1.0.0');
      expect(result.data?.type).toBe('plugin');
      expect(mockRepository.isNameUnique).toHaveBeenCalledWith(request.name, request.context_id);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('应该拒绝重复的扩展名称', async () => {
      const request: CreateExtensionRequest = {
        context_id: uuidv4(),
        name: 'duplicate-extension',
        version: '1.0.0',
        type: 'plugin',
      };

      mockRepository.isNameUnique.mockResolvedValue(false);

      const result = await service.createExtension(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('扩展名称已存在');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('应该验证输入参数', async () => {
      const invalidRequest: CreateExtensionRequest = {
        context_id: '',
        name: '',
        version: '',
        type: 'plugin',
      };

      const result = await service.createExtension(invalidRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('上下文ID不能为空');
    });

    it('应该验证依赖关系', async () => {
      const dependencyId = uuidv4();
      const request: CreateExtensionRequest = {
        context_id: uuidv4(),
        name: 'dependent-extension',
        version: '1.0.0',
        type: 'plugin',
        dependencies: [
          {
            extension_id: dependencyId,
            name: 'dependency',
            version_range: '^1.0.0',
            optional: false,
          }
        ],
      };

      mockRepository.isNameUnique.mockResolvedValue(true);
      mockRepository.findById.mockResolvedValue(null); // 依赖不存在

      const result = await service.createExtension(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('依赖验证失败');
    });

    it('应该验证冲突关系', async () => {
      const conflictId = uuidv4();
      const conflictingExtension = createValidExtension({
        extensionId: conflictId,
        status: 'active',
      });

      const request: CreateExtensionRequest = {
        context_id: uuidv4(),
        name: 'conflicting-extension',
        version: '1.0.0',
        type: 'plugin',
        conflicts: [
          {
            extension_id: conflictId,
            name: 'conflicting',
            reason: 'incompatible',
          }
        ],
      };

      mockRepository.isNameUnique.mockResolvedValue(true);
      mockRepository.findById.mockResolvedValue(conflictingExtension);

      const result = await service.createExtension(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('冲突检测失败');
    });
  });

  describe('getExtensionById()', () => {
    it('应该成功获取扩展', async () => {
      const extensionId = uuidv4();
      const extension = createValidExtension({ extensionId });

      mockRepository.findById.mockResolvedValue(extension);

      const result = await service.getExtensionById(extensionId);

      expect(result.success).toBe(true);
      expect(result.data).toBe(extension);
      expect(mockRepository.findById).toHaveBeenCalledWith(extensionId);
    });

    it('应该处理扩展不存在的情况', async () => {
      const extensionId = uuidv4();

      mockRepository.findById.mockResolvedValue(null);

      const result = await service.getExtensionById(extensionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('扩展不存在');
    });

    it('应该验证扩展ID', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.getExtensionById('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('扩展不存在');
    });
  });

  describe('activateExtension()', () => {
    it('应该成功激活已安装的扩展', async () => {
      const extensionId = uuidv4();
      const extension = createValidExtension({ 
        extensionId, 
        status: 'installed' 
      });

      mockRepository.findById.mockResolvedValue(extension);
      mockRepository.checkDependencies.mockResolvedValue({
        satisfied: true,
        missing: [],
      });
      mockRepository.update.mockResolvedValue();

      const result = await service.activateExtension(extensionId);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('active');
      expect(mockRepository.update).toHaveBeenCalledWith(extension);
    });

    it('应该检查依赖关系', async () => {
      const extensionId = uuidv4();
      const extension = createValidExtension({ 
        extensionId, 
        status: 'installed' 
      });

      mockRepository.findById.mockResolvedValue(extension);
      mockRepository.checkDependencies.mockResolvedValue({
        satisfied: false,
        missing: ['dependency-1'],
      });

      const result = await service.activateExtension(extensionId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('依赖不满足');
    });

    it('应该拒绝激活不存在的扩展', async () => {
      const extensionId = uuidv4();

      mockRepository.findById.mockResolvedValue(null);

      const result = await service.activateExtension(extensionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('扩展不存在');
    });
  });

  describe('deactivateExtension()', () => {
    it('应该成功停用已激活的扩展', async () => {
      const extensionId = uuidv4();
      const extension = createValidExtension({ 
        extensionId, 
        status: 'active' 
      });

      mockRepository.findById.mockResolvedValue(extension);
      mockRepository.findDependents.mockResolvedValue([]);
      mockRepository.update.mockResolvedValue();

      const result = await service.deactivateExtension(extensionId);

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('inactive');
      expect(mockRepository.update).toHaveBeenCalledWith(extension);
    });

    it('应该拒绝停用不存在的扩展', async () => {
      const extensionId = uuidv4();

      mockRepository.findById.mockResolvedValue(null);

      const result = await service.deactivateExtension(extensionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('扩展不存在');
    });
  });

  describe('queryExtensions()', () => {
    it('应该成功查询扩展列表', async () => {
      const filter: ExtensionFilter = {
        contextId: uuidv4(),
        status: 'active',
      };
      const pagination: PaginationOptions = {
        page: 1,
        limit: 10,
      };

      const extensions = [
        createValidExtension({ name: 'ext1' }),
        createValidExtension({ name: 'ext2' }),
      ];

      const paginatedResult: PaginatedResult<Extension> = {
        items: extensions,
        total: 2,
        page: 1,
        limit: 10,
        total_pages: 1,
      };

      mockRepository.findByFilter.mockResolvedValue(paginatedResult);

      const result = await service.queryExtensions(filter, pagination);

      expect(result.success).toBe(true);
      expect(result.data?.items).toHaveLength(2);
      expect(result.data?.total).toBe(2);
      expect(mockRepository.findByFilter).toHaveBeenCalledWith(filter, pagination);
    });

    it('应该处理空结果', async () => {
      const filter: ExtensionFilter = {
        contextId: uuidv4(),
      };

      const emptyResult: PaginatedResult<Extension> = {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        total_pages: 0,
      };

      mockRepository.findByFilter.mockResolvedValue(emptyResult);

      const result = await service.queryExtensions(filter);

      expect(result.success).toBe(true);
      expect(result.data?.items).toHaveLength(0);
      expect(result.data?.total).toBe(0);
    });
  });

  describe('getActiveExtensions()', () => {
    it('应该获取活跃扩展列表', async () => {
      const contextId = uuidv4();
      const activeExtensions = [
        createValidExtension({ status: 'active' }),
        createValidExtension({ status: 'active' }),
      ];

      mockRepository.findActiveExtensions.mockResolvedValue(activeExtensions);

      const result = await service.getActiveExtensions(contextId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockRepository.findActiveExtensions).toHaveBeenCalledWith(contextId);
    });

    it('应该处理没有活跃扩展的情况', async () => {
      mockRepository.findActiveExtensions.mockResolvedValue([]);

      const result = await service.getActiveExtensions();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('deleteExtension()', () => {
    it('应该成功删除扩展', async () => {
      const extensionId = uuidv4();
      const extension = createValidExtension({
        extensionId,
        status: 'inactive'
      });

      mockRepository.findById.mockResolvedValue(extension);
      mockRepository.findDependents.mockResolvedValue([]);
      mockRepository.delete.mockResolvedValue();

      const result = await service.deleteExtension(extensionId);

      expect(result.success).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith(extensionId);
    });

    it('应该拒绝删除有依赖的扩展', async () => {
      const extensionId = uuidv4();
      const extension = createValidExtension({
        extensionId,
        status: 'inactive'
      });
      const dependentExtension = createValidExtension({ name: 'dependent' });

      mockRepository.findById.mockResolvedValue(extension);
      mockRepository.findDependents.mockResolvedValue([dependentExtension]);

      const result = await service.deleteExtension(extensionId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('无法卸载，有其他扩展依赖此扩展');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('应该拒绝删除不存在的扩展', async () => {
      const extensionId = uuidv4();

      mockRepository.findById.mockResolvedValue(null);

      const result = await service.deleteExtension(extensionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('扩展不存在');
    });
  });

  describe('updateExtensionStatus()', () => {
    it('应该成功更新扩展状态', async () => {
      const extensionId = uuidv4();
      const extension = createValidExtension({
        extensionId,
        status: 'installed'
      });

      mockRepository.findById.mockResolvedValue(extension);
      mockRepository.update.mockResolvedValue();

      const result = await service.updateExtensionStatus(extensionId, 'disabled');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('disabled');
      expect(mockRepository.update).toHaveBeenCalledWith(extension);
    });

    it('应该拒绝更新不存在扩展的状态', async () => {
      const extensionId = uuidv4();

      mockRepository.findById.mockResolvedValue(null);

      const result = await service.updateExtensionStatus(extensionId, 'disabled');

      expect(result.success).toBe(false);
      expect(result.error).toBe('扩展不存在');
    });
  });

  describe('addExtensionPoint()', () => {
    it('应该成功添加扩展点', async () => {
      const extensionId = uuidv4();
      const extension = createValidExtension({ extensionId });
      const extensionPoint: ExtensionPoint = {
        name: 'test-point',
        type: 'hook',
        description: 'Test extension point',
        interface_definition: {},
      };

      mockRepository.findById.mockResolvedValue(extension);
      mockRepository.update.mockResolvedValue();

      const result = await service.addExtensionPoint(extensionId, extensionPoint);

      expect(result.success).toBe(true);
      expect(result.data?.extensionPoints).toHaveLength(1);
      expect(mockRepository.update).toHaveBeenCalledWith(extension);
    });

    it('应该拒绝为不存在的扩展添加扩展点', async () => {
      const extensionId = uuidv4();
      const extensionPoint: ExtensionPoint = {
        name: 'test-point',
        type: 'hook',
        description: 'Test extension point',
        interface_definition: {},
      };

      mockRepository.findById.mockResolvedValue(null);

      const result = await service.addExtensionPoint(extensionId, extensionPoint);

      expect(result.success).toBe(false);
      expect(result.error).toBe('扩展不存在');
    });
  });

  describe('addApiExtension()', () => {
    it('应该成功添加API扩展', async () => {
      const extensionId = uuidv4();
      const extension = createValidExtension({ extensionId });
      const apiExtension: ApiExtension = {
        endpoint_id: 'test-endpoint',
        path: '/api/test',
        method: 'GET',
        handler: 'testHandler',
        middleware: [],
        authentication_required: false,
      };

      mockRepository.findById.mockResolvedValue(extension);
      mockRepository.update.mockResolvedValue();

      const result = await service.addApiExtension(extensionId, apiExtension);

      expect(result.success).toBe(true);
      expect(result.data?.apiExtensions).toHaveLength(1);
      expect(mockRepository.update).toHaveBeenCalledWith(extension);
    });

    it('应该拒绝为不存在的扩展添加API扩展', async () => {
      const extensionId = uuidv4();
      const apiExtension: ApiExtension = {
        endpoint_id: 'test-endpoint',
        path: '/api/test',
        method: 'GET',
        handler: 'testHandler',
        middleware: [],
        authentication_required: false,
      };

      mockRepository.findById.mockResolvedValue(null);

      const result = await service.addApiExtension(extensionId, apiExtension);

      expect(result.success).toBe(false);
      expect(result.error).toBe('扩展不存在');
    });
  });

  describe('getStatistics()', () => {
    it('应该获取统计信息', async () => {
      const contextId = uuidv4();
      const statistics = {
        total: 10,
        active: 5,
        inactive: 3,
        disabled: 2,
      };

      mockRepository.getStatistics.mockResolvedValue(statistics);

      const result = await service.getStatistics(contextId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(statistics);
      expect(mockRepository.getStatistics).toHaveBeenCalledWith(contextId);
    });
  });

  describe('getExtensionsByContext()', () => {
    it('应该根据上下文获取扩展', async () => {
      const contextId = uuidv4();
      const extensions = [
        createValidExtension({ contextId }),
        createValidExtension({ contextId }),
      ];

      mockRepository.findByContextId.mockResolvedValue(extensions);

      const result = await service.getExtensionsByContext(contextId);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockRepository.findByContextId).toHaveBeenCalledWith(contextId);
    });
  });

  describe('错误处理', () => {
    it('应该处理Repository抛出的异常', async () => {
      const extensionId = uuidv4();

      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      const result = await service.getExtensionById(extensionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('应该处理未知异常', async () => {
      const extensionId = uuidv4();

      mockRepository.findById.mockRejectedValue('Unknown error');

      const result = await service.getExtensionById(extensionId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('获取扩展失败');
    });
  });
});
