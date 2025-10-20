/**
 * ExtensionModule集成测试
 * 基于实际源代码实现的测试 - 验证模块协议接口和生命周期管理
 */

import { ExtensionModule } from '../../../src/modules/extension/module';
import { ExtensionType, ExtensionStatus } from '../../../src/modules/extension/types';
import { UUID } from '../../../src/types/common.types';

describe('ExtensionModule集成测试', () => {
  let extensionModule: ExtensionModule;

  beforeEach(async () => {
    extensionModule = new ExtensionModule();
    await extensionModule.initialize();
  });

  afterEach(async () => {
    if (extensionModule) {
      await extensionModule.shutdown();
    }
  });

  describe('模块初始化和配置', () => {
    it('应该成功初始化默认配置的Extension模块', async () => {
      // 🎯 Arrange
      const newModule = new ExtensionModule();

      // 🎯 Act
      await newModule.initialize();

      // ✅ Assert
      expect(newModule).toBeDefined();
      const healthStatus = await newModule.healthCheck();
      expect(healthStatus.status).toBe('healthy');

      // 清理
      await newModule.shutdown();
    });

    it('应该成功初始化自定义配置的Extension模块', async () => {
      // 🎯 Arrange
      const customConfig = {
        enableLogging: true,
        enableCaching: true,
        enableMetrics: true,
        repositoryType: 'memory' as const,
        extensionRetentionDays: 60,
        maxExtensionsPerContext: 25
      };
      const newModule = new ExtensionModule();

      // 🎯 Act
      await newModule.initialize(customConfig);

      // ✅ Assert
      expect(newModule).toBeDefined();
      const healthStatus = await newModule.healthCheck();
      expect(healthStatus.status).toBe('healthy');

      // 清理
      await newModule.shutdown();
    });
  });

  describe('协议接口实现', () => {
    it('应该正确实现IMLPPProtocol接口', async () => {
      // ✅ Assert - 验证协议接口方法存在
      expect(typeof extensionModule.executeOperation).toBe('function');
      expect(typeof extensionModule.getProtocolMetadata).toBe('function');
      expect(typeof extensionModule.healthCheck).toBe('function');
    });

    it('应该返回正确的协议元数据', () => {
      // 🎯 Act
      const metadata = extensionModule.getProtocolMetadata();

      // ✅ Assert - 验证元数据结构
      expect(metadata.name).toBe('extension');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.description).toContain('Extension');
      expect(Array.isArray(metadata.capabilities)).toBe(true);
      expect(metadata.capabilities.length).toBeGreaterThan(0);
      expect(Array.isArray(metadata.dependencies)).toBe(true);
      expect(Array.isArray(metadata.supportedOperations)).toBe(true);

      // 验证Extension特定能力
      expect(metadata.capabilities).toContain('extension-lifecycle-management');
      expect(metadata.capabilities).toContain('plugin-coordination');
    });

    it('应该提供详细的健康检查信息', async () => {
      // 🎯 Act
      const healthStatus = await extensionModule.healthCheck();

      // ✅ Assert
      expect(healthStatus.status).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(healthStatus.status);
      expect(healthStatus.timestamp).toBeDefined();
      expect(Array.isArray(healthStatus.checks)).toBe(true);
    });
  });

  describe('扩展生命周期管理', () => {
    it('应该成功创建扩展', async () => {
      // 🎯 Arrange
      const createRequest = {
        contextId: 'ctx-test-001' as UUID,
        name: 'test-extension',
        displayName: 'Test Extension',
        description: 'A test extension for unit testing',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType
      };

      // 🎯 Act
      const createdExtension = await extensionModule.createExtension(createRequest);

      // ✅ Assert
      expect(createdExtension).toBeDefined();
      expect(createdExtension.name).toBe(createRequest.name);
      expect(createdExtension.displayName).toBe(createRequest.displayName);
      expect(createdExtension.version).toBe(createRequest.version);
      expect(createdExtension.extensionType).toBe(createRequest.extensionType);
    });

    it('应该成功获取已创建的扩展', async () => {
      // 🎯 Arrange
      const createRequest = {
        contextId: 'ctx-test-002' as UUID,
        name: 'get-test-extension',
        displayName: 'Get Test Extension',
        description: 'Extension for get testing',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType
      };
      const createdExtension = await extensionModule.createExtension(createRequest);

      // 🎯 Act
      const retrievedExtension = await extensionModule.getExtension(createdExtension.extensionId);

      // ✅ Assert
      expect(retrievedExtension).toBeDefined();
      expect(retrievedExtension?.extensionId).toBe(createdExtension.extensionId);
      expect(retrievedExtension?.name).toBe(createRequest.name);
    });

    it('应该成功更新扩展', async () => {
      // 🎯 Arrange
      const createRequest = {
        contextId: 'ctx-test-003' as UUID,
        name: 'update-test-extension',
        displayName: 'Update Test Extension',
        description: 'Extension for update testing',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType
      };
      const createdExtension = await extensionModule.createExtension(createRequest);
      
      const updateRequest = {
        displayName: 'Updated Test Extension',
        description: 'Updated description',
        status: 'active'
      };

      // 🎯 Act
      const updatedExtension = await extensionModule.updateExtension(
        createdExtension.extensionId,
        updateRequest
      );

      // ✅ Assert
      expect(updatedExtension).toBeDefined();
      expect(updatedExtension?.displayName).toBe(updateRequest.displayName);
      expect(updatedExtension?.description).toBe(updateRequest.description);
      expect(updatedExtension?.name).toBe(createRequest.name); // 未更新的字段保持不变
    });

    it('应该成功删除扩展', async () => {
      // 🎯 Arrange
      const createRequest = {
        contextId: 'ctx-test-004' as UUID,
        name: 'delete-test-extension',
        displayName: 'Delete Test Extension',
        description: 'Extension for delete testing',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType
      };
      const createdExtension = await extensionModule.createExtension(createRequest);

      // 🎯 Act
      const deleteResult = await extensionModule.deleteExtension(createdExtension.extensionId);

      // ✅ Assert
      expect(deleteResult).toBe(true);
      
      // 验证扩展已被删除
      const retrievedExtension = await extensionModule.getExtension(createdExtension.extensionId);
      expect(retrievedExtension).toBeNull();
    });

    it('应该成功列出扩展', async () => {
      // 🎯 Arrange
      const createRequest = {
        contextId: 'ctx-test-005' as UUID,
        name: 'list-test-extension',
        displayName: 'List Test Extension',
        description: 'Extension for list testing',
        version: '1.0.0',
        extensionType: 'plugin' as ExtensionType
      };
      await extensionModule.createExtension(createRequest);

      // 🎯 Act
      const listResult = await extensionModule.listExtensions({
        contextId: createRequest.contextId,
        limit: 10
      });

      // ✅ Assert
      expect(listResult).toBeDefined();
      expect(Array.isArray(listResult.extensions)).toBe(true);
      expect(typeof listResult.totalCount).toBe('number');
      expect(typeof listResult.hasMore).toBe('boolean');
      expect(listResult.extensions.length).toBeGreaterThan(0);
    });
  });

  describe('模块生命周期管理', () => {
    it('应该正确处理模块关闭', async () => {
      // 🎯 Act & Assert
      await expect(extensionModule.shutdown()).resolves.not.toThrow();
    });

    it('应该支持多次初始化和关闭', async () => {
      // 🎯 Arrange
      const testModule = new ExtensionModule();

      // 🎯 Act & Assert
      await expect(testModule.initialize()).resolves.not.toThrow();
      await expect(testModule.shutdown()).resolves.not.toThrow();
      await expect(testModule.initialize()).resolves.not.toThrow();
      await expect(testModule.shutdown()).resolves.not.toThrow();
    });
  });

  describe('错误处理和边界情况', () => {
    it('应该正确处理获取不存在扩展的情况', async () => {
      // 🎯 Arrange
      const nonExistentId = 'nonexistent-extension-id' as UUID;

      // 🎯 Act
      const result = await extensionModule.getExtension(nonExistentId);

      // ✅ Assert
      expect(result).toBeNull();
    });

    it('应该正确处理更新不存在扩展的情况', async () => {
      // 🎯 Arrange
      const nonExistentId = 'nonexistent-extension-id' as UUID;
      const updateData = { displayName: 'Updated Name' };

      // 🎯 Act
      const result = await extensionModule.updateExtension(nonExistentId, updateData);

      // ✅ Assert
      expect(result).toBeNull();
    });

    it('应该正确处理删除不存在扩展的情况', async () => {
      // 🎯 Arrange
      const nonExistentId = 'nonexistent-extension-id' as UUID;

      // 🎯 Act
      const result = await extensionModule.deleteExtension(nonExistentId);

      // ✅ Assert
      expect(result).toBe(false);
    });
  });
});
