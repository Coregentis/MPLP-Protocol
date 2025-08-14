/**
 * ExtensionController真实实现单元测试
 * 
 * 基于实际实现的方法和返回值进行测试
 * 严格遵循测试规则：基于真实源代码功能实现方式构建测试文件
 * 验证API层控制器的正确性
 * 
 * @version 1.0.0
 * @created 2025-08-11
 */

import { ExtensionController, HttpRequest, HttpResponse } from '../../../src/modules/extension/api/controllers/extension.controller';
import { ExtensionManagementService, CreateExtensionRequest, OperationResult } from '../../../src/modules/extension/application/services/extension-management.service';
import { Extension } from '../../../src/modules/extension/domain/entities/extension.entity';
import { ExtensionPoint, ApiExtension, ExtensionStatus } from '../../../src/modules/extension/types';
import { PaginatedResult } from '../../../src/modules/extension/domain/repositories/extension-repository.interface';
import { v4 as uuidv4 } from 'uuid';

describe('ExtensionController真实实现单元测试', () => {
  let controller: ExtensionController;
  let mockService: jest.Mocked<ExtensionManagementService>;

  beforeEach(() => {
    // 创建Mock Service
    mockService = {
      createExtension: jest.fn(),
      getExtensionById: jest.fn(),
      activateExtension: jest.fn(),
      deactivateExtension: jest.fn(),
      updateExtensionStatus: jest.fn(),
      addExtensionPoint: jest.fn(),
      addApiExtension: jest.fn(),
      queryExtensions: jest.fn(),
      getActiveExtensions: jest.fn(),
      uninstallExtension: jest.fn(),
      getStatistics: jest.fn(),
      updateExtension: jest.fn(),
      getExtensionDependencies: jest.fn(),
      getExtensionsByContext: jest.fn(),
      deleteExtension: jest.fn(),
      getExtensions: jest.fn(),
    } as jest.Mocked<ExtensionManagementService>;

    controller = new ExtensionController(mockService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // 辅助函数：创建有效的Extension实例
  const createValidExtension = (overrides: {
    extensionId?: string;
    contextId?: string;
    name?: string;
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
      version: '1.0.0',
      extension_type: 'plugin',
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
      const extension = createValidExtension();
      const successResult: OperationResult<Extension> = {
        success: true,
        data: extension,
      };

      mockService.createExtension.mockResolvedValue(successResult);

      const req: HttpRequest = {
        params: {},
        body: {
          context_id: uuidv4(),
          name: 'test-extension',
          version: '1.0.0',
          type: 'plugin',
        },
        query: {},
      };

      const response = await controller.createExtension(req);

      expect(response.status).toBe(201);
      expect(response.data).toBe(extension);
      expect(mockService.createExtension).toHaveBeenCalledWith(req.body);
    });

    it('应该处理无效的请求体', async () => {
      const req: HttpRequest = {
        params: {},
        body: null,
        query: {},
      };

      const response = await controller.createExtension(req);

      expect(response.status).toBe(400);
      expect(response.error).toBe('Invalid request body');
      expect(mockService.createExtension).not.toHaveBeenCalled();
    });

    it('应该处理服务失败', async () => {
      const failureResult: OperationResult<Extension> = {
        success: false,
        error: 'Extension creation failed',
      };

      mockService.createExtension.mockResolvedValue(failureResult);

      const req: HttpRequest = {
        params: {},
        body: {
          context_id: uuidv4(),
          name: 'test-extension',
          version: '1.0.0',
          type: 'plugin',
        },
        query: {},
      };

      const response = await controller.createExtension(req);

      expect(response.status).toBe(400);
      expect(response.error).toBe('Extension creation failed');
    });

    it('应该处理异常', async () => {
      mockService.createExtension.mockRejectedValue(new Error('Service error'));

      const req: HttpRequest = {
        params: {},
        body: {
          context_id: uuidv4(),
          name: 'test-extension',
          version: '1.0.0',
          type: 'plugin',
        },
        query: {},
      };

      const response = await controller.createExtension(req);

      expect(response.status).toBe(500);
      expect(response.error).toBe('Service error');
    });
  });

  describe('getExtensionById()', () => {
    it('应该成功获取扩展', async () => {
      const extensionId = uuidv4();
      const extension = createValidExtension({ extensionId });
      const successResult: OperationResult<Extension> = {
        success: true,
        data: extension,
      };

      mockService.getExtensionById.mockResolvedValue(successResult);

      const req: HttpRequest = {
        params: { id: extensionId },
        body: {},
        query: {},
      };

      const response = await controller.getExtensionById(req);

      expect(response.status).toBe(200);
      expect(response.data).toBe(extension);
      expect(mockService.getExtensionById).toHaveBeenCalledWith(extensionId);
    });

    it('应该处理扩展不存在', async () => {
      const extensionId = uuidv4();
      const failureResult: OperationResult<Extension> = {
        success: false,
        error: 'Extension not found',
      };

      mockService.getExtensionById.mockResolvedValue(failureResult);

      const req: HttpRequest = {
        params: { id: extensionId },
        body: {},
        query: {},
      };

      const response = await controller.getExtensionById(req);

      expect(response.status).toBe(404);
      expect(response.error).toBe('Extension not found');
    });
  });

  describe('activateExtension()', () => {
    it('应该成功激活扩展', async () => {
      const extensionId = uuidv4();
      const extension = createValidExtension({ extensionId, status: 'active' });
      const successResult: OperationResult<Extension> = {
        success: true,
        data: extension,
      };

      mockService.activateExtension.mockResolvedValue(successResult);

      const req: HttpRequest = {
        params: { id: extensionId },
        body: {},
        query: {},
      };

      const response = await controller.activateExtension(req);

      expect(response.status).toBe(200);
      expect(response.data).toBe(extension);
      expect(response.message).toBe('Extension activated successfully');
      expect(mockService.activateExtension).toHaveBeenCalledWith(extensionId);
    });

    it('应该处理激活失败', async () => {
      const extensionId = uuidv4();
      const failureResult: OperationResult<Extension> = {
        success: false,
        error: 'Activation failed',
      };

      mockService.activateExtension.mockResolvedValue(failureResult);

      const req: HttpRequest = {
        params: { id: extensionId },
        body: {},
        query: {},
      };

      const response = await controller.activateExtension(req);

      expect(response.status).toBe(400);
      expect(response.error).toBe('Activation failed');
    });
  });

  describe('deactivateExtension()', () => {
    it('应该成功停用扩展', async () => {
      const extensionId = uuidv4();
      const extension = createValidExtension({ extensionId, status: 'inactive' });
      const successResult: OperationResult<Extension> = {
        success: true,
        data: extension,
      };

      mockService.deactivateExtension.mockResolvedValue(successResult);

      const req: HttpRequest = {
        params: { id: extensionId },
        body: {},
        query: {},
      };

      const response = await controller.deactivateExtension(req);

      expect(response.status).toBe(200);
      expect(response.data).toBe(extension);
      expect(response.message).toBe('Extension deactivated successfully');
      expect(mockService.deactivateExtension).toHaveBeenCalledWith(extensionId);
    });

    it('应该处理停用失败', async () => {
      const extensionId = uuidv4();
      const failureResult: OperationResult<Extension> = {
        success: false,
        error: 'Deactivation failed',
      };

      mockService.deactivateExtension.mockResolvedValue(failureResult);

      const req: HttpRequest = {
        params: { id: extensionId },
        body: {},
        query: {},
      };

      const response = await controller.deactivateExtension(req);

      expect(response.status).toBe(400);
      expect(response.error).toBe('Deactivation failed');
    });
  });

  describe('updateExtensionStatus()', () => {
    it('应该成功更新扩展状态', async () => {
      const extensionId = uuidv4();
      const extension = createValidExtension({ extensionId, status: 'disabled' });
      const successResult: OperationResult<Extension> = {
        success: true,
        data: extension,
      };

      mockService.updateExtensionStatus.mockResolvedValue(successResult);

      const req: HttpRequest = {
        params: { id: extensionId },
        body: { status: 'disabled' },
        query: {},
      };

      const response = await controller.updateExtensionStatus(req);

      expect(response.status).toBe(200);
      expect(response.data).toBe(extension);
      expect(mockService.updateExtensionStatus).toHaveBeenCalledWith(extensionId, 'disabled');
    });

    it('应该处理无效的请求体', async () => {
      const extensionId = uuidv4();

      const req: HttpRequest = {
        params: { id: extensionId },
        body: null,
        query: {},
      };

      const response = await controller.updateExtensionStatus(req);

      expect(response.status).toBe(400);
      expect(response.error).toBe('Invalid request body');
    });

    it('应该处理缺少状态字段', async () => {
      const extensionId = uuidv4();

      const req: HttpRequest = {
        params: { id: extensionId },
        body: {},
        query: {},
      };

      const response = await controller.updateExtensionStatus(req);

      expect(response.status).toBe(400);
      expect(response.error).toBe('Status is required');
    });
  });

  describe('queryExtensions()', () => {
    it('应该成功查询扩展列表', async () => {
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

      const successResult: OperationResult<PaginatedResult<Extension>> = {
        success: true,
        data: paginatedResult,
      };

      mockService.queryExtensions.mockResolvedValue(successResult);

      const req: HttpRequest = {
        params: {},
        body: {},
        query: {
          contextId: uuidv4(),
          page: '1',
          limit: '10',
        },
      };

      const response = await controller.queryExtensions(req);

      expect(response.status).toBe(200);
      expect(response.data).toBe(paginatedResult);
      expect(mockService.queryExtensions).toHaveBeenCalled();
    });

    it('应该处理查询失败', async () => {
      const failureResult: OperationResult<PaginatedResult<Extension>> = {
        success: false,
        error: 'Query failed',
      };

      mockService.queryExtensions.mockResolvedValue(failureResult);

      const req: HttpRequest = {
        params: {},
        body: {},
        query: {},
      };

      const response = await controller.queryExtensions(req);

      expect(response.status).toBe(400);
      expect(response.error).toBe('Query failed');
    });
  });

  describe('getActiveExtensions()', () => {
    it('应该获取活跃扩展列表', async () => {
      const activeExtensions = [
        createValidExtension({ status: 'active' }),
        createValidExtension({ status: 'active' }),
      ];

      const successResult: OperationResult<Extension[]> = {
        success: true,
        data: activeExtensions,
      };

      mockService.getActiveExtensions.mockResolvedValue(successResult);

      const req: HttpRequest = {
        params: {},
        body: {},
        query: { contextId: uuidv4() },
      };

      const response = await controller.getActiveExtensions(req);

      expect(response.status).toBe(200);
      expect(response.data).toBe(activeExtensions);
      expect(mockService.getActiveExtensions).toHaveBeenCalledWith(req.query.contextId);
    });
  });

  describe('uninstallExtension()', () => {
    it('应该成功卸载扩展', async () => {
      const extensionId = uuidv4();
      const successResult: OperationResult<void> = {
        success: true,
      };

      mockService.uninstallExtension.mockResolvedValue(successResult);

      const req: HttpRequest = {
        params: { id: extensionId },
        body: {},
        query: {},
      };

      const response = await controller.uninstallExtension(req);

      expect(response.status).toBe(200);
      expect(response.message).toBe('Extension uninstalled successfully');
      expect(mockService.uninstallExtension).toHaveBeenCalledWith(extensionId);
    });

    it('应该处理卸载失败', async () => {
      const extensionId = uuidv4();
      const failureResult: OperationResult<void> = {
        success: false,
        error: 'Uninstall failed',
      };

      mockService.uninstallExtension.mockResolvedValue(failureResult);

      const req: HttpRequest = {
        params: { id: extensionId },
        body: {},
        query: {},
      };

      const response = await controller.uninstallExtension(req);

      expect(response.status).toBe(400);
      expect(response.error).toBe('Uninstall failed');
    });
  });

  describe('addExtensionPoint()', () => {
    it('应该成功添加扩展点', async () => {
      const extensionId = uuidv4();
      const extension = createValidExtension({ extensionId });
      const successResult: OperationResult<Extension> = {
        success: true,
        data: extension,
      };

      mockService.addExtensionPoint.mockResolvedValue(successResult);

      const extensionPoint: ExtensionPoint = {
        name: 'test-point',
        type: 'hook',
        description: 'Test extension point',
        interface_definition: {},
      };

      const req: HttpRequest = {
        params: { id: extensionId },
        body: extensionPoint,
        query: {},
      };

      const response = await controller.addExtensionPoint(req);

      expect(response.status).toBe(201);
      expect(response.data).toBe(extension);
      expect(mockService.addExtensionPoint).toHaveBeenCalledWith(extensionId, extensionPoint);
    });

    it('应该处理无效的请求体', async () => {
      const extensionId = uuidv4();

      const req: HttpRequest = {
        params: { id: extensionId },
        body: null,
        query: {},
      };

      const response = await controller.addExtensionPoint(req);

      expect(response.status).toBe(400);
      expect(response.error).toBe('Invalid request body');
    });
  });

  describe('addApiExtension()', () => {
    it('应该成功添加API扩展', async () => {
      const extensionId = uuidv4();
      const extension = createValidExtension({ extensionId });
      const successResult: OperationResult<Extension> = {
        success: true,
        data: extension,
      };

      mockService.addApiExtension.mockResolvedValue(successResult);

      const apiExtension: ApiExtension = {
        endpoint_id: 'test-endpoint',
        path: '/api/test',
        method: 'GET',
        handler: 'testHandler',
        middleware: [],
        authentication_required: false,
      };

      const req: HttpRequest = {
        params: { id: extensionId },
        body: apiExtension,
        query: {},
      };

      const response = await controller.addApiExtension(req);

      expect(response.status).toBe(201);
      expect(response.data).toBe(extension);
      expect(mockService.addApiExtension).toHaveBeenCalledWith(extensionId, apiExtension);
    });
  });

  describe('getStatistics()', () => {
    it('应该获取统计信息', async () => {
      const statistics = {
        total: 10,
        active: 5,
        inactive: 3,
        disabled: 2,
      };

      const successResult: OperationResult<any> = {
        success: true,
        data: statistics,
      };

      mockService.getStatistics.mockResolvedValue(successResult);

      const req: HttpRequest = {
        params: {},
        body: {},
        query: { contextId: uuidv4() },
      };

      const response = await controller.getStatistics(req);

      expect(response.status).toBe(200);
      expect(response.data).toBe(statistics);
      expect(mockService.getStatistics).toHaveBeenCalledWith(req.query.contextId);
    });
  });

  describe('getExtensionsByContext()', () => {
    it('应该根据上下文获取扩展', async () => {
      const contextId = uuidv4();
      const extensions = [
        createValidExtension({ contextId }),
        createValidExtension({ contextId }),
      ];

      const successResult: OperationResult<Extension[]> = {
        success: true,
        data: extensions,
      };

      mockService.getExtensionsByContext.mockResolvedValue(successResult);

      const req: HttpRequest = {
        params: { contextId },
        body: {},
        query: {},
      };

      const response = await controller.getExtensionsByContext(req);

      expect(response.status).toBe(200);
      expect(response.data).toBe(extensions);
      expect(mockService.getExtensionsByContext).toHaveBeenCalledWith(contextId);
    });
  });

  describe('错误处理', () => {
    it('应该处理服务抛出的异常', async () => {
      const extensionId = uuidv4();

      mockService.getExtensionById.mockRejectedValue(new Error('Service error'));

      const req: HttpRequest = {
        params: { id: extensionId },
        body: {},
        query: {},
      };

      const response = await controller.getExtensionById(req);

      expect(response.status).toBe(500);
      expect(response.error).toBe('Service error');
    });

    it('应该处理未知异常', async () => {
      const extensionId = uuidv4();

      mockService.getExtensionById.mockRejectedValue('Unknown error');

      const req: HttpRequest = {
        params: { id: extensionId },
        body: {},
        query: {},
      };

      const response = await controller.getExtensionById(req);

      expect(response.status).toBe(500);
      expect(response.error).toBe('Internal server error');
    });
  });
});
