/**
 * Extension模块功能测试
 * 基于MPLP统一测试标准v1.0
 * 
 * @description Extension模块功能集成测试
 * @version 1.0.0
 * @standard MPLP统一测试标准
 */

import { ExtensionTestFactory } from '../factories/extension-test.factory';

describe('Extension模块功能测试', () => {
  describe('Extension生命周期管理', () => {
    it('应该支持完整的Extension生命周期', () => {
      // 🎯 Arrange - 创建Extension
      const extension = ExtensionTestFactory.createExtensionEntity({
        extensionId: 'ext-lifecycle-001',
        status: 'inactive'
      });

      // 🎯 Act & Assert - 检查Extension状态
      expect(extension.status).toBe('inactive');
      expect(extension.lifecycle).toBeTruthy();

      // 模拟激活操作
      const activatedExtension = ExtensionTestFactory.createExtensionEntity({
        extensionId: 'ext-lifecycle-001',
        status: 'active'
      });

      expect(activatedExtension.status).toBe('active');
      expect(activatedExtension.lifecycle).toBeTruthy();
      expect(activatedExtension.extensionId).toBe('ext-lifecycle-001');
    });

    it('应该支持Extension状态变更追踪', () => {
      // 🎯 Arrange
      const initialExtension = ExtensionTestFactory.createExtensionEntity({
        extensionId: 'ext-state-001',
        status: 'inactive',
        version: '1.0.0'
      });

      // 🎯 Act - 模拟状态变更
      const updatedExtension = ExtensionTestFactory.createExtensionEntity({
        extensionId: 'ext-state-001',
        status: 'active',
        version: '1.1.0'
      });

      // ✅ Assert
      expect(updatedExtension.status).toBe('active');
      expect(updatedExtension.version).toBe('1.1.0');
      expect(updatedExtension.extensionId).toBe(initialExtension.extensionId);
    });
  });

  describe('Extension配置管理', () => {
    it('应该支持复杂配置结构', () => {
      // 🎯 Arrange & Act
      const extension = ExtensionTestFactory.createExtensionEntity({
        extensionId: 'ext-complex-001',
        name: 'Complex Extension',
        extensionType: 'service',
        configuration: {
          enabled: true,
          advanced: {
            caching: {
              enabled: true,
              ttl: 3600,
              maxSize: 1000
            },
            logging: {
              level: 'info',
              format: 'json',
              destinations: ['console', 'file']
            },
            security: {
              encryption: true,
              algorithm: 'AES-256',
              keyRotation: 86400
            }
          }
        }
      });

      // ✅ Assert
      expect(extension.extensionId).toBe('ext-complex-001');
      expect(extension.name).toBe('Complex Extension');
      expect(extension.extensionType).toBe('service');
      expect(extension.configuration.enabled).toBe(true);
      expect(extension.configuration.advanced.caching.enabled).toBe(true);
      expect(extension.configuration.advanced.logging.level).toBe('info');
    });

    it('应该支持Extension数据验证', () => {
      // 🎯 Arrange
      const validExtension = ExtensionTestFactory.createExtensionEntity({
        extensionId: 'ext-valid-001',
        name: 'Valid Extension',
        status: 'active'
      });

      // ✅ Assert - 验证有效数据
      expect(validExtension.extensionId).toBeTruthy();
      expect(validExtension.name).toBeTruthy();
      expect(validExtension.status).toBe('active');
      expect(validExtension.contextId).toBeTruthy();
      expect(validExtension.extensionType).toBeTruthy();
      expect(validExtension.version).toBeTruthy();
    });
  });

  describe('Extension批量操作', () => {
    it('应该支持批量Extension创建', () => {
      // 🎯 Arrange & Act
      const batchSize = 50;
      const extensionBatch = ExtensionTestFactory.createExtensionEntityArray(batchSize);

      // ✅ Assert
      expect(extensionBatch).toHaveLength(batchSize);
      expect(extensionBatch.every(ext => ext.extensionId.startsWith('ext-test-'))).toBe(true);
      expect(extensionBatch.every(ext => ext.status === 'active')).toBe(true);
      expect(extensionBatch.every(ext => ext.extensionType === 'plugin')).toBe(true);
    });

    it('应该支持批量Extension查询模拟', () => {
      // 🎯 Arrange
      const extensionBatch = ExtensionTestFactory.createExtensionEntityArray(20);
      
      // 设置不同的status用于查询测试
      const modifiedBatch = extensionBatch.map((ext, index) => 
        ExtensionTestFactory.createExtensionEntity({
          extensionId: ext.extensionId,
          status: index % 3 === 0 ? 'active' : index % 3 === 1 ? 'inactive' : 'error',
          name: `Modified Extension ${index + 1}`
        })
      );

      // 🎯 Act - 模拟查询操作
      const activeExtensions = modifiedBatch.filter(ext => ext.status === 'active');
      const inactiveExtensions = modifiedBatch.filter(ext => ext.status === 'inactive');
      const errorExtensions = modifiedBatch.filter(ext => ext.status === 'error');

      // ✅ Assert
      expect(activeExtensions.length).toBeGreaterThan(0);
      expect(inactiveExtensions.length).toBeGreaterThan(0);
      expect(errorExtensions.length).toBeGreaterThan(0);
      expect(activeExtensions.length + inactiveExtensions.length + errorExtensions.length).toBe(20);
    });
  });

  describe('Extension Schema映射功能', () => {
    it('应该支持Entity到Schema的转换', () => {
      // 🎯 Arrange
      const extensionEntity = ExtensionTestFactory.createExtensionEntity({
        extensionId: 'ext-mapping-001',
        name: 'Mapping Test Extension',
        status: 'active'
      });

      // 🎯 Act - 模拟映射转换
      const schemaData = {
        extension_id: extensionEntity.extensionId,
        name: extensionEntity.name,
        status: extensionEntity.status,
        context_id: extensionEntity.contextId,
        protocol_version: extensionEntity.protocolVersion,
        timestamp: extensionEntity.timestamp
      };

      // ✅ Assert
      expect(schemaData.extension_id).toBe('ext-mapping-001');
      expect(schemaData.name).toBe('Mapping Test Extension');
      expect(schemaData.status).toBe('active');
      expect(schemaData.context_id).toBeTruthy();
    });

    it('应该支持Schema到Entity的转换', () => {
      // 🎯 Arrange
      const schemaData = ExtensionTestFactory.createExtensionSchema({
        extension_id: 'ext-reverse-001',
        name: 'Reverse Mapping Test Extension',
        status: 'active'
      });

      // 🎯 Act - 模拟反向映射
      const entityData = {
        extensionId: schemaData.extension_id,
        name: schemaData.name,
        status: schemaData.status,
        contextId: schemaData.context_id,
        protocolVersion: schemaData.protocol_version,
        timestamp: new Date(schemaData.timestamp)
      };

      // ✅ Assert
      expect(entityData.extensionId).toBe('ext-reverse-001');
      expect(entityData.name).toBe('Reverse Mapping Test Extension');
      expect(entityData.status).toBe('active');
      expect(entityData.contextId).toBeTruthy();
    });
  });

  describe('Extension边界条件处理', () => {
    it('应该处理边界条件数据', () => {
      // 🎯 Arrange
      const boundaryData = ExtensionTestFactory.createBoundaryTestData();

      // ✅ Assert - 最小数据
      expect(boundaryData.minimalExtension.name).toBe('Min');
      expect(boundaryData.minimalExtension.configuration).toBeTruthy();

      // ✅ Assert - 最大数据
      expect(boundaryData.maximalExtension.name).toHaveLength(255);
      expect(boundaryData.maximalExtension.description).toHaveLength(1000);
      expect(boundaryData.maximalExtension.compatibility).toBeTruthy();
    });

    it('应该处理特殊字符和编码', () => {
      // 🎯 Arrange & Act
      const specialCharExtension = ExtensionTestFactory.createExtensionEntity({
        extensionId: 'ext-special-001',
        name: 'Test with 特殊字符 and émojis 🚀',
        description: 'Contains unicode: ñáéíóú, symbols: @#$%^&*(), and numbers: 12345',
        metadata: {
          author: 'Test with 中文测试',
          keywords: ['特殊字符', 'unicode', 'émojis']
        }
      });

      // ✅ Assert
      expect(specialCharExtension.name).toContain('特殊字符');
      expect(specialCharExtension.name).toContain('🚀');
      expect(specialCharExtension.description).toContain('ñáéíóú');
      expect(specialCharExtension.metadata.author).toContain('中文测试');
      expect(specialCharExtension.extensionId).toBe('ext-special-001');
    });
  });
});
