/**
 * Extension仓储单元测试
 *
 * @description 基于实际ExtensionRepository实现的完整测试套件
 * @version 1.0.0
 * @layer 测试层 - 仓储测试
 * @coverage 目标覆盖率 95%+
 * @pattern 与Context、Plan、Role、Confirm模块使用IDENTICAL的仓储测试模式
 */

import { ExtensionRepository } from '../../../src/modules/extension/infrastructure/repositories/extension.repository';
import { 
  IExtensionRepository,
  ExtensionQueryFilter,
  PaginationParams,
  SortParams,
  ExtensionQueryResult,
  BatchOperationResult,
  ExtensionStatistics
} from '../../../src/modules/extension/domain/repositories/extension.repository.interface';
import { ExtensionEntityData, ExtensionType, ExtensionStatus } from '../../../src/modules/extension/types';
import { UUID } from '../../../src/shared/types';
import { createMockExtensionEntityData, generateTestUUID } from './test-data-factory';

describe('ExtensionRepository测试', () => {
  let repository: ExtensionRepository;

  beforeEach(() => {
    // 创建新的仓储实例
    repository = new ExtensionRepository();
  });

  describe('create - 创建扩展', () => {
    it('应该成功创建扩展记录', async () => {
      // 📋 Arrange - 基于实际ExtensionEntityData结构
      const extensionData: ExtensionEntityData = createMockExtensionEntityData({
        extensionId: generateTestUUID('ext'),
        name: 'test-extension',
        displayName: 'Test Extension',
        extensionType: 'plugin' as ExtensionType,
        status: 'inactive' as ExtensionStatus
      });

      // 🎯 Act - 执行创建操作
      const result = await repository.create(extensionData);

      // ✅ Assert - 验证创建结果
      expect(result).toEqual(extensionData);
      expect(result.extensionId).toBe(extensionData.extensionId);
      expect(result.name).toBe(extensionData.name);
      expect(result.displayName).toBe(extensionData.displayName);
      expect(result.extensionType).toBe(extensionData.extensionType);
      expect(result.status).toBe(extensionData.status);
    });

    it('应该拒绝创建重复ID的扩展', async () => {
      // 📋 Arrange - 创建第一个扩展
      const extensionId = generateTestUUID('ext');
      const firstExtension = createMockExtensionEntityData({
        extensionId: extensionId,
        name: 'first-extension'
      });

      const duplicateExtension = createMockExtensionEntityData({
        extensionId: extensionId, // 相同的ID
        name: 'duplicate-extension'
      });

      // 先创建第一个扩展
      await repository.create(firstExtension);

      // 🎯 Act & Assert - 尝试创建重复ID的扩展应该抛出错误
      await expect(repository.create(duplicateExtension)).rejects.toThrow(
        `Extension with ID '${extensionId}' already exists`
      );
    });

    it('应该拒绝创建重复名称的扩展', async () => {
      // 📋 Arrange - 创建第一个扩展
      const extensionName = 'unique-extension';
      const firstExtension = createMockExtensionEntityData({
        extensionId: generateTestUUID('ext1'),
        name: extensionName
      });

      const duplicateNameExtension = createMockExtensionEntityData({
        extensionId: generateTestUUID('ext2'),
        name: extensionName // 相同的名称
      });

      // 先创建第一个扩展
      await repository.create(firstExtension);

      // 🎯 Act & Assert - 尝试创建重复名称的扩展应该抛出错误
      await expect(repository.create(duplicateNameExtension)).rejects.toThrow(
        `Extension with name '${extensionName}' already exists`
      );
    });
  });

  describe('findById - 根据ID查找扩展', () => {
    it('应该成功根据ID查找存在的扩展', async () => {
      // 📋 Arrange - 创建测试扩展
      const extensionId = generateTestUUID('ext');
      const extensionData = createMockExtensionEntityData({
        extensionId: extensionId,
        name: 'findable-extension'
      });

      await repository.create(extensionData);

      // 🎯 Act - 根据ID查找扩展
      const result = await repository.findById(extensionId);

      // ✅ Assert - 验证查找结果
      expect(result).not.toBeNull();
      expect(result?.extensionId).toBe(extensionId);
      expect(result?.name).toBe('findable-extension');
      expect(result).toEqual(extensionData);
    });

    it('应该在扩展不存在时返回null', async () => {
      // 📋 Arrange - 不存在的扩展ID
      const nonExistentId = generateTestUUID('nonexistent');

      // 🎯 Act - 查找不存在的扩展
      const result = await repository.findById(nonExistentId);

      // ✅ Assert - 应该返回null
      expect(result).toBeNull();
    });
  });

  describe('findByName - 根据名称查找扩展', () => {
    it('应该成功根据名称查找存在的扩展', async () => {
      // 📋 Arrange - 创建测试扩展
      const extensionName = 'searchable-extension';
      const extensionData = createMockExtensionEntityData({
        name: extensionName,
        displayName: 'Searchable Extension'
      });

      await repository.create(extensionData);

      // 🎯 Act - 根据名称查找扩展
      const result = await repository.findByName(extensionName);

      // ✅ Assert - 验证查找结果
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe(extensionName);
      expect(result[0].displayName).toBe('Searchable Extension');
    });

    it('应该在扩展不存在时返回null', async () => {
      // 📋 Arrange - 不存在的扩展名称
      const nonExistentName = 'non-existent-extension';

      // 🎯 Act - 查找不存在的扩展
      const result = await repository.findByName(nonExistentName);

      // ✅ Assert - 应该返回空数组
      expect(result).toHaveLength(0);
    });

    it('应该支持模糊匹配查找', async () => {
      // 📋 Arrange - 创建多个扩展用于模糊匹配测试
      const extension1 = createMockExtensionEntityData({
        name: 'test-extension-1',
        contextId: generateTestUUID('ctx1')
      });

      const extension2 = createMockExtensionEntityData({
        name: 'test-extension-2',
        contextId: generateTestUUID('ctx2')
      });

      const extension3 = createMockExtensionEntityData({
        name: 'other-extension',
        contextId: generateTestUUID('ctx3')
      });

      await repository.create(extension1);
      await repository.create(extension2);
      await repository.create(extension3);

      // 🎯 Act - 使用模糊匹配查找包含'test'的扩展
      const result = await repository.findByName('test', false);

      // ✅ Assert - 应该返回包含'test'的扩展
      expect(result).toHaveLength(2);
      expect(result.map(ext => ext.name)).toContain('test-extension-1');
      expect(result.map(ext => ext.name)).toContain('test-extension-2');
      expect(result.map(ext => ext.name)).not.toContain('other-extension');
    });
  });

  describe('update - 更新扩展', () => {
    it('应该成功更新存在的扩展', async () => {
      // 📋 Arrange - 创建原始扩展
      const extensionId = generateTestUUID('ext');
      const originalExtension = createMockExtensionEntityData({
        extensionId: extensionId,
        name: 'original-extension',
        displayName: 'Original Extension',
        status: 'inactive' as ExtensionStatus
      });

      await repository.create(originalExtension);

      // 准备更新数据
      const updateData: Partial<ExtensionEntityData> = {
        displayName: 'Updated Extension',
        description: 'Updated description',
        status: 'active' as ExtensionStatus
      };

      // 🎯 Act - 执行更新操作
      const result = await repository.update(extensionId, updateData);

      // ✅ Assert - 验证更新结果
      expect(result).not.toBeNull();
      expect(result?.displayName).toBe('Updated Extension');
      expect(result?.description).toBe('Updated description');
      expect(result?.status).toBe('active');
      expect(result?.name).toBe('original-extension'); // 未更新的字段应保持不变
    });

    it('应该在扩展不存在时抛出错误', async () => {
      // 📋 Arrange - 不存在的扩展ID
      const nonExistentId = generateTestUUID('nonexistent');
      const updateData: Partial<ExtensionEntityData> = {
        displayName: 'Updated Extension'
      };

      // 🎯 Act & Assert - 尝试更新不存在的扩展应该抛出错误
      await expect(repository.update(nonExistentId, updateData)).rejects.toThrow('Extension with ID');
    });
  });

  describe('delete - 删除扩展', () => {
    it('应该成功删除存在的扩展', async () => {
      // 📋 Arrange - 创建测试扩展
      const extensionId = generateTestUUID('ext');
      const extensionData = createMockExtensionEntityData({
        extensionId: extensionId,
        name: 'deletable-extension'
      });

      await repository.create(extensionData);

      // 验证扩展存在
      const beforeDelete = await repository.findById(extensionId);
      expect(beforeDelete).not.toBeNull();

      // 🎯 Act - 执行删除操作
      const result = await repository.delete(extensionId);

      // ✅ Assert - 验证删除结果
      expect(result).toBe(true);

      // 验证扩展已被删除
      const afterDelete = await repository.findById(extensionId);
      expect(afterDelete).toBeNull();
    });

    it('应该在扩展不存在时返回false', async () => {
      // 📋 Arrange - 不存在的扩展ID
      const nonExistentId = generateTestUUID('nonexistent');

      // 🎯 Act - 尝试删除不存在的扩展
      const result = await repository.delete(nonExistentId);

      // ✅ Assert - 应该返回false
      expect(result).toBe(false);
    });
  });

  describe('findAll - 查找所有扩展', () => {
    it('应该返回所有扩展记录', async () => {
      // 📋 Arrange - 创建多个测试扩展
      const extension1 = createMockExtensionEntityData({
        name: 'extension-1',
        extensionType: 'plugin' as ExtensionType
      });

      const extension2 = createMockExtensionEntityData({
        name: 'extension-2',
        extensionType: 'adapter' as ExtensionType
      });

      const extension3 = createMockExtensionEntityData({
        name: 'extension-3',
        extensionType: 'connector' as ExtensionType
      });

      await repository.create(extension1);
      await repository.create(extension2);
      await repository.create(extension3);

      // 🎯 Act - 查找所有扩展
      const result = await repository.findAll();

      // ✅ Assert - 验证查找结果
      expect(result).toHaveLength(3);
      expect(result.map(ext => ext.name)).toContain('extension-1');
      expect(result.map(ext => ext.name)).toContain('extension-2');
      expect(result.map(ext => ext.name)).toContain('extension-3');
    });

    it('应该在没有扩展时返回空数组', async () => {
      // 🎯 Act - 查找所有扩展（空仓储）
      const result = await repository.findAll();

      // ✅ Assert - 应该返回空数组
      expect(result).toEqual([]);
    });
  });

  describe('findByType - 根据类型查找扩展', () => {
    it('应该成功根据扩展类型查找扩展', async () => {
      // 📋 Arrange - 创建不同类型的扩展
      const pluginExtension = createMockExtensionEntityData({
        name: 'plugin-extension',
        extensionType: 'plugin' as ExtensionType
      });

      const adapterExtension = createMockExtensionEntityData({
        name: 'adapter-extension',
        extensionType: 'adapter' as ExtensionType
      });

      const connectorExtension = createMockExtensionEntityData({
        name: 'connector-extension',
        extensionType: 'connector' as ExtensionType
      });

      await repository.create(pluginExtension);
      await repository.create(adapterExtension);
      await repository.create(connectorExtension);

      // 🎯 Act - 根据类型查找扩展
      const pluginResults = await repository.findByType('plugin');
      const adapterResults = await repository.findByType('adapter');

      // ✅ Assert - 验证查找结果
      expect(pluginResults).toHaveLength(1);
      expect(pluginResults[0].name).toBe('plugin-extension');
      expect(pluginResults[0].extensionType).toBe('plugin');

      expect(adapterResults).toHaveLength(1);
      expect(adapterResults[0].name).toBe('adapter-extension');
      expect(adapterResults[0].extensionType).toBe('adapter');
    });

    it('应该在没有匹配类型的扩展时返回空数组', async () => {
      // 📋 Arrange - 创建一个plugin类型的扩展
      const pluginExtension = createMockExtensionEntityData({
        extensionType: 'plugin' as ExtensionType
      });

      await repository.create(pluginExtension);

      // 🎯 Act - 查找不存在的类型
      const result = await repository.findByType('middleware');

      // ✅ Assert - 应该返回空数组
      expect(result).toEqual([]);
    });
  });

  describe('findByStatus - 根据状态查找扩展', () => {
    it('应该成功根据扩展状态查找扩展', async () => {
      // 📋 Arrange - 创建不同状态的扩展
      const activeExtension = createMockExtensionEntityData({
        name: 'active-extension',
        status: 'active' as ExtensionStatus
      });

      const inactiveExtension = createMockExtensionEntityData({
        name: 'inactive-extension',
        status: 'inactive' as ExtensionStatus
      });

      const disabledExtension = createMockExtensionEntityData({
        name: 'disabled-extension',
        status: 'disabled' as ExtensionStatus
      });

      await repository.create(activeExtension);
      await repository.create(inactiveExtension);
      await repository.create(disabledExtension);

      // 🎯 Act - 根据状态查找扩展
      const activeResults = await repository.findByStatus('active');
      const inactiveResults = await repository.findByStatus('inactive');

      // ✅ Assert - 验证查找结果
      expect(activeResults).toHaveLength(1);
      expect(activeResults[0].name).toBe('active-extension');
      expect(activeResults[0].status).toBe('active');

      expect(inactiveResults).toHaveLength(1);
      expect(inactiveResults[0].name).toBe('inactive-extension');
      expect(inactiveResults[0].status).toBe('inactive');
    });
  });

  describe('count - 统计扩展数量', () => {
    it('应该正确统计扩展总数', async () => {
      // 📋 Arrange - 创建多个扩展
      const extension1 = createMockExtensionEntityData({ name: 'ext-1' });
      const extension2 = createMockExtensionEntityData({ name: 'ext-2' });
      const extension3 = createMockExtensionEntityData({ name: 'ext-3' });

      await repository.create(extension1);
      await repository.create(extension2);
      await repository.create(extension3);

      // 🎯 Act - 统计扩展数量
      const count = await repository.count();

      // ✅ Assert - 验证统计结果
      expect(count).toBe(3);
    });

    it('应该在空仓储时返回0', async () => {
      // 🎯 Act - 统计空仓储的扩展数量
      const count = await repository.count();

      // ✅ Assert - 应该返回0
      expect(count).toBe(0);
    });
  });
});
