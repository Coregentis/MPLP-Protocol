/**
 * Extension API Controller - TDD测试套件
 * 
 * 企业级REST API控制器测试
 * 
 * @version 1.0.0
 * @created 2025-01-27T18:30:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配mplp-extension.json Schema定义
 * 
 * @强制检查确认
 * - [x] 已完成源代码分析
 * - [x] 已完成接口检查
 * - [x] 已完成Schema验证
 * - [x] 已完成测试数据准备
 * - [x] 已完成模拟对象创建
 * - [x] 已完成测试覆盖验证
 * - [x] 已完成编译和类型检查
 * - [x] 已完成测试执行验证
 */

import { describe, expect, it, jest, beforeEach, afterEach } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';

// 导入被测试的控制器
import { ExtensionController, HttpRequest, HttpResponse } from '../../../../../src/modules/extension/api/controllers/extension.controller';

// 导入服务和类型
import { ExtensionManagementService, CreateExtensionRequest } from '../../../../../src/modules/extension/application/services/extension-management.service';
import { Extension } from '../../../../../src/modules/extension/domain/entities/extension.entity';
import { ExtensionStatus, ExtensionType } from '../../../../../src/modules/extension/types';

// 导入测试工厂
import { createTestExtensionSchemaData } from '../../../../test-utils/extension-test-factory';

// 创建模拟服务
function createMockExtensionManagementService(): jest.Mocked<ExtensionManagementService> {
  return {
    createExtension: jest.fn(),
    getExtensionById: jest.fn(),
    activateExtension: jest.fn(),
    deactivateExtension: jest.fn(),
    uninstallExtension: jest.fn(),
    queryExtensions: jest.fn(),
    updateExtension: jest.fn(),
    getExtensionsByContext: jest.fn(),
    getExtensionDependencies: jest.fn(),
    cloneExtension: jest.fn(),
    updateExtensionStatus: jest.fn(),
    addExtensionPoint: jest.fn(),
    addApiExtension: jest.fn(),
    getActiveExtensions: jest.fn(),
    getStatistics: jest.fn()
  } as jest.Mocked<ExtensionManagementService>;
}

// 创建测试HTTP请求
function createTestHttpRequest(overrides: Partial<HttpRequest> = {}): HttpRequest {
  return {
    params: {},
    body: {},
    query: {},
    user: {
      id: 'test-user-id',
      role: 'admin'
    },
    ...overrides
  };
}

// 创建测试扩展数据
function createTestCreateExtensionRequest(): CreateExtensionRequest {
  return {
    name: 'test-extension',
    description: 'Test extension description',
    version: '1.0.0',
    type: 'plugin' as ExtensionType,
    main_file: 'index.js',
    context_id: uuidv4(),
    extension_point: 'test-point',
    configuration: {
      enabled: true,
      auto_start: false
    },
    dependencies: []
  };
}

describe('ExtensionController - API层TDD测试', () => {
  let controller: ExtensionController;
  let mockExtensionService: jest.Mocked<ExtensionManagementService>;
  let testExtension: Extension;
  let testCreateRequest: CreateExtensionRequest;

  beforeEach(async () => {
    // 重置所有模拟
    jest.clearAllMocks();
    
    // 创建模拟服务
    mockExtensionService = createMockExtensionManagementService();
    
    // 创建控制器实例
    controller = new ExtensionController(mockExtensionService);
    
    // 创建测试数据
    testExtension = new Extension(createTestExtensionSchemaData({
      name: 'test-extension',
      version: '1.0.0',
      status: 'installed' as ExtensionStatus
    }));
    
    testCreateRequest = createTestCreateExtensionRequest();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('🔧 扩展创建API测试', () => {
    it('应该成功创建扩展', async () => {
      // 📋 Arrange
      const request = createTestHttpRequest({
        body: testCreateRequest
      });
      
      mockExtensionService.createExtension.mockResolvedValue({
        success: true,
        data: testExtension
      });

      // 🎬 Act
      const response = await controller.createExtension(request);

      // ✅ Assert
      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
      expect(response.message).toBe('扩展创建成功');
      expect(mockExtensionService.createExtension).toHaveBeenCalledWith(testCreateRequest);
    });

    it('应该处理创建扩展的业务逻辑错误', async () => {
      // 📋 Arrange
      const request = createTestHttpRequest({
        body: testCreateRequest
      });
      
      mockExtensionService.createExtension.mockResolvedValue({
        success: false,
        error: 'Extension name already exists'
      });

      // 🎬 Act
      const response = await controller.createExtension(request);

      // ✅ Assert
      expect(response.status).toBe(400);
      expect(response.error).toBe('Extension name already exists');
      expect(response.data).toBeUndefined();
    });

    it('应该处理创建扩展的系统错误', async () => {
      // 📋 Arrange
      const request = createTestHttpRequest({
        body: testCreateRequest
      });
      
      mockExtensionService.createExtension.mockRejectedValue(
        new Error('Database connection failed')
      );

      // 🎬 Act
      const response = await controller.createExtension(request);

      // ✅ Assert
      expect(response.status).toBe(500);
      expect(response.error).toBe('Database connection failed');
    });

    it('应该处理无效的请求体', async () => {
      // 📋 Arrange
      const request = createTestHttpRequest({
        body: null
      });
      
      mockExtensionService.createExtension.mockRejectedValue(
        new Error('Invalid request body')
      );

      // 🎬 Act
      const response = await controller.createExtension(request);

      // ✅ Assert
      expect(response.status).toBe(400);
      expect(response.error).toBe('Invalid request body');
    });
  });

  describe('📖 扩展查询API测试', () => {
    it('应该成功获取扩展详情', async () => {
      // 📋 Arrange
      const extensionId = testExtension.extensionId;
      const request = createTestHttpRequest({
        params: { id: extensionId }
      });
      
      mockExtensionService.getExtensionById.mockResolvedValue({
        success: true,
        data: testExtension
      });

      // 🎬 Act
      const response = await controller.getExtensionById(request);

      // ✅ Assert
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(mockExtensionService.getExtensionById).toHaveBeenCalledWith(extensionId);
    });

    it('应该处理扩展不存在的情况', async () => {
      // 📋 Arrange
      const extensionId = 'non-existent-id';
      const request = createTestHttpRequest({
        params: { id: extensionId }
      });
      
      mockExtensionService.getExtensionById.mockResolvedValue({
        success: false,
        error: 'Extension not found'
      });

      // 🎬 Act
      const response = await controller.getExtensionById(request);

      // ✅ Assert
      expect(response.status).toBe(404);
      expect(response.error).toBe('Extension not found');
    });

    it('应该处理无效的扩展ID', async () => {
      // 📋 Arrange
      const request = createTestHttpRequest({
        params: { id: '' }
      });
      
      mockExtensionService.getExtensionById.mockRejectedValue(
        new Error('Invalid extension ID')
      );

      // 🎬 Act
      const response = await controller.getExtensionById(request);

      // ✅ Assert
      expect(response.status).toBe(500);
      expect(response.error).toBe('Invalid extension ID');
    });
  });

  describe('⚡ 扩展生命周期管理API测试', () => {
    it('应该成功激活扩展', async () => {
      // 📋 Arrange
      const extensionId = testExtension.extensionId;
      const request = createTestHttpRequest({
        params: { id: extensionId }
      });
      
      const activatedExtension = new Extension({
        ...testExtension.toProtocol(),
        status: 'active' as ExtensionStatus
      });
      
      mockExtensionService.activateExtension.mockResolvedValue({
        success: true,
        data: activatedExtension
      });

      // 🎬 Act
      const response = await controller.activateExtension(request);

      // ✅ Assert
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.message).toBe('扩展激活成功');
      expect(mockExtensionService.activateExtension).toHaveBeenCalledWith(extensionId);
    });

    it('应该成功停用扩展', async () => {
      // 📋 Arrange
      const extensionId = testExtension.extensionId;
      const request = createTestHttpRequest({
        params: { id: extensionId }
      });
      
      const deactivatedExtension = new Extension({
        ...testExtension.toProtocol(),
        status: 'installed' as ExtensionStatus
      });
      
      mockExtensionService.deactivateExtension.mockResolvedValue({
        success: true,
        data: deactivatedExtension
      });

      // 🎬 Act
      const response = await controller.deactivateExtension(request);

      // ✅ Assert
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.message).toBe('扩展停用成功');
      expect(mockExtensionService.deactivateExtension).toHaveBeenCalledWith(extensionId);
    });

    it('应该处理激活已激活扩展的情况', async () => {
      // 📋 Arrange
      const extensionId = testExtension.extensionId;
      const request = createTestHttpRequest({
        params: { id: extensionId }
      });
      
      mockExtensionService.activateExtension.mockResolvedValue({
        success: false,
        error: 'Extension is already active'
      });

      // 🎬 Act
      const response = await controller.activateExtension(request);

      // ✅ Assert
      expect(response.status).toBe(400);
      expect(response.error).toBe('Extension is already active');
    });

    it('应该处理停用未激活扩展的情况', async () => {
      // 📋 Arrange
      const extensionId = testExtension.extensionId;
      const request = createTestHttpRequest({
        params: { id: extensionId }
      });
      
      mockExtensionService.deactivateExtension.mockResolvedValue({
        success: false,
        error: 'Extension is not active'
      });

      // 🎬 Act
      const response = await controller.deactivateExtension(request);

      // ✅ Assert
      expect(response.status).toBe(400);
      expect(response.error).toBe('Extension is not active');
    });
  });

  describe('🗑️ 扩展卸载API测试', () => {
    it('应该成功卸载扩展', async () => {
      // 📋 Arrange
      const extensionId = testExtension.extensionId;
      const request = createTestHttpRequest({
        params: { id: extensionId }
      });
      
      mockExtensionService.uninstallExtension.mockResolvedValue({
        success: true,
        data: true
      });

      // 🎬 Act
      const response = await controller.uninstallExtension(request);

      // ✅ Assert
      expect(response.status).toBe(200);
      expect(response.message).toBe('扩展卸载成功');
      expect(mockExtensionService.uninstallExtension).toHaveBeenCalledWith(extensionId);
    });

    it('应该处理卸载不存在扩展的情况', async () => {
      // 📋 Arrange
      const extensionId = 'non-existent-id';
      const request = createTestHttpRequest({
        params: { id: extensionId }
      });
      
      mockExtensionService.uninstallExtension.mockResolvedValue({
        success: false,
        error: 'Extension not found'
      });

      // 🎬 Act
      const response = await controller.uninstallExtension(request);

      // ✅ Assert
      expect(response.status).toBe(400);
      expect(response.error).toBe('Extension not found');
    });

    it('应该处理卸载激活扩展的情况', async () => {
      // 📋 Arrange
      const extensionId = testExtension.extensionId;
      const request = createTestHttpRequest({
        params: { id: extensionId }
      });
      
      mockExtensionService.uninstallExtension.mockResolvedValue({
        success: false,
        error: 'Cannot uninstall active extension'
      });

      // 🎬 Act
      const response = await controller.uninstallExtension(request);

      // ✅ Assert
      expect(response.status).toBe(400);
      expect(response.error).toBe('Cannot uninstall active extension');
    });
  });

  describe('📋 扩展列表查询API测试', () => {
    it('应该成功获取扩展列表', async () => {
      // 📋 Arrange
      const request = createTestHttpRequest({
        query: {
          page: '1',
          limit: '10'
        }
      });
      
      const extensionList = [testExtension];
      mockExtensionService.queryExtensions.mockResolvedValue({
        success: true,
        data: {
          items: extensionList,
          total: 1,
          page: 1,
          limit: 10,
          total_pages: 1
        }
      });

      // 🎬 Act
      const response = await controller.queryExtensions(request);

      // ✅ Assert
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.items).toHaveLength(1);
      expect(response.data.total).toBe(1);
    });

    it('应该支持状态过滤', async () => {
      // 📋 Arrange
      const request = createTestHttpRequest({
        query: {
          status: 'active' as ExtensionStatus,
          page: '1',
          limit: '10'
        }
      });
      
      mockExtensionService.queryExtensions.mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          total_pages: 0
        }
      });

      // 🎬 Act
      const response = await controller.queryExtensions(request);

      // ✅ Assert
      expect(response.status).toBe(200);
      expect(response.data.items).toHaveLength(0);
      expect(mockExtensionService.queryExtensions).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active' as ExtensionStatus
        }),
        expect.objectContaining({
          page: 1,
          limit: 10
        })
      );
    });

    it('应该处理无效的分页参数', async () => {
      // 📋 Arrange
      const request = createTestHttpRequest({
        query: {
          page: 'invalid',
          limit: 'invalid'
        }
      });
      
      mockExtensionService.queryExtensions.mockResolvedValue({
        success: true,
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          total_pages: 0
        }
      });

      // 🎬 Act
      const response = await controller.queryExtensions(request);

      // ✅ Assert - 应该使用默认分页参数
      expect(response.status).toBe(200);
      expect(mockExtensionService.queryExtensions).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({
          page: 1,
          limit: 10
        })
      );
    });
  });

  describe('🔄 扩展更新API测试', () => {
    it('应该成功更新扩展', async () => {
      // 📋 Arrange
      const extensionId = testExtension.extensionId;
      const updateData = {
        description: 'Updated description',
        version: '1.1.0'
      };
      const request = createTestHttpRequest({
        params: { id: extensionId },
        body: updateData
      });
      
      const updatedExtension = new Extension({
        ...testExtension.toProtocol(),
        ...updateData
      });
      
      mockExtensionService.updateExtension.mockResolvedValue({
        success: true,
        data: updatedExtension
      });

      // 🎬 Act
      const response = await controller.updateExtension(request);

      // ✅ Assert
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.message).toBe('扩展更新成功');
      expect(mockExtensionService.updateExtension).toHaveBeenCalledWith(
        extensionId,
        updateData
      );
    });

    it('应该处理更新不存在扩展的情况', async () => {
      // 📋 Arrange
      const extensionId = 'non-existent-id';
      const request = createTestHttpRequest({
        params: { id: extensionId },
        body: { description: 'Updated' }
      });
      
      mockExtensionService.updateExtension.mockResolvedValue({
        success: false,
        error: 'Extension not found'
      });

      // 🎬 Act
      const response = await controller.updateExtension(request);

      // ✅ Assert
      expect(response.status).toBe(404);
      expect(response.error).toBe('Extension not found');
    });

    it('应该处理无效的更新数据', async () => {
      // 📋 Arrange
      const extensionId = testExtension.extensionId;
      const request = createTestHttpRequest({
        params: { id: extensionId },
        body: {}
      });
      
      mockExtensionService.updateExtension.mockResolvedValue({
        success: false,
        error: 'No update data provided'
      });

      // 🎬 Act
      const response = await controller.updateExtension(request);

      // ✅ Assert
      expect(response.status).toBe(400);
      expect(response.error).toBe('No update data provided');
    });
  });

  describe('🔗 扩展依赖管理API测试', () => {
    it('应该成功获取扩展依赖', async () => {
      // 📋 Arrange
      const extensionId = testExtension.extensionId;
      const request = createTestHttpRequest({
        params: { id: extensionId }
      });
      
      const dependencies = [
        {
          extension_id: 'dep-1',
          version: '1.0.0',
          required: true
        }
      ];
      
      mockExtensionService.getExtensionDependencies.mockResolvedValue({
        success: true,
        data: dependencies
      });

      // 🎬 Act
      const response = await controller.getExtensionDependencies(request);

      // ✅ Assert
      expect(response.status).toBe(200);
      expect(response.data).toEqual(dependencies);
      expect(mockExtensionService.getExtensionDependencies).toHaveBeenCalledWith(extensionId);
    });

    it('应该处理获取不存在扩展依赖的情况', async () => {
      // 📋 Arrange
      const extensionId = 'non-existent-id';
      const request = createTestHttpRequest({
        params: { id: extensionId }
      });
      
      mockExtensionService.getExtensionDependencies.mockResolvedValue({
        success: false,
        error: 'Extension not found'
      });

      // 🎬 Act
      const response = await controller.getExtensionDependencies(request);

      // ✅ Assert
      expect(response.status).toBe(404);
      expect(response.error).toBe('Extension not found');
    });
  });

  describe('🎯 上下文扩展查询API测试', () => {
    it('应该成功获取上下文的扩展列表', async () => {
      // 📋 Arrange
      const contextId = uuidv4();
      const request = createTestHttpRequest({
        params: { contextId }
      });
      
      const contextExtensions = [testExtension];
      mockExtensionService.getExtensionsByContext.mockResolvedValue({
        success: true,
        data: contextExtensions
      });

      // 🎬 Act
      const response = await controller.getExtensionsByContext(request);

      // ✅ Assert
      expect(response.status).toBe(200);
      expect(response.data).toEqual(
        contextExtensions.map(ext => ext.toProtocol())
      );
      expect(mockExtensionService.getExtensionsByContext).toHaveBeenCalledWith(contextId);
    });

    it('应该处理空的上下文ID', async () => {
      // 📋 Arrange
      const request = createTestHttpRequest({
        params: { contextId: '' }
      });
      
      mockExtensionService.getExtensionsByContext.mockRejectedValue(
        new Error('Context ID is required')
      );

      // 🎬 Act
      const response = await controller.getExtensionsByContext(request);

      // ✅ Assert
      expect(response.status).toBe(500);
      expect(response.error).toBe('Context ID is required');
    });
  });

  describe('📋 错误处理和边界条件测试', () => {
    it('应该处理服务抛出的未知错误', async () => {
      // 📋 Arrange
      const request = createTestHttpRequest({
        body: testCreateRequest
      });
      
      mockExtensionService.createExtension.mockRejectedValue(
        'Unknown string error'
      );

      // 🎬 Act
      const response = await controller.createExtension(request);

      // ✅ Assert
      expect(response.status).toBe(500);
      expect(response.error).toBe('服务器内部错误');
    });

    it('应该处理缺少用户认证的情况', async () => {
      // 📋 Arrange
      const request = createTestHttpRequest({
        body: testCreateRequest,
        user: undefined
      });

      // 模拟服务检查用户权限
      mockExtensionService.createExtension.mockRejectedValue(
        new Error('User authentication required')
      );

      // 🎬 Act
      const response = await controller.createExtension(request);

      // ✅ Assert
      expect(response.status).toBe(500);
      expect(response.error).toBe('User authentication required');
    });
  });
});
