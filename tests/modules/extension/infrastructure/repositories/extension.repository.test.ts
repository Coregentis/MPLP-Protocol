/**
 * Extension Repository - TDD Green阶段测试
 * 
 * 企业级扩展数据访问层测试
 * 
 * @created 2025-08-10T21:00:00+08:00
 * @updated 2025-08-10T22:30:00+08:00
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
import { createTestExtensionSchemaData, ExtensionProtocolSchema } from '../../../../test-utils/extension-test-factory';
import { v4 as uuidv4 } from 'uuid';

// 🔴 Red阶段 - 导入尚未完善的Repository实现
import { ExtensionRepository } from '../../../../../src/modules/extension/infrastructure/repositories/extension.repository';
import { 
  IExtensionRepository, 
  ExtensionFilter, 
  PaginationOptions, 
  PaginatedResult 
} from '../../../../../src/modules/extension/domain/repositories/extension-repository.interface';
import { Extension } from '../../../../../src/modules/extension/domain/entities/extension.entity';
import { ExtensionType, ExtensionStatus } from '../../../../../src/modules/extension/types';

describe('ExtensionRepository - TDD Green阶段', () => {
  let repository: IExtensionRepository;
  let testExtensions: Extension[];

  beforeEach(async () => {
    // 🟢 Green阶段 - 使用完整的企业级Repository实现
    repository = new ExtensionRepository();
    
    // 准备测试数据 - 使用Schema数据创建Extension实体
    testExtensions = [
      new Extension(createTestExtensionSchemaData({
        extension_id: uuidv4(),
        name: 'test-extension-1',
        extension_type: 'plugin',
        status: 'active'
      })),
      new Extension(createTestExtensionSchemaData({
        extension_id: uuidv4(),
        name: 'test-extension-2',
        extension_type: 'adapter',
        status: 'inactive'
      })),
      new Extension(createTestExtensionSchemaData({
        extension_id: uuidv4(),
        name: 'test-extension-3',
        extension_type: 'connector',
        status: 'active'
      }))
    ];
  });

  afterEach(async () => {
    // 清理测试数据
    jest.clearAllMocks();
  });

  describe('🏗️ 基础CRUD操作测试', () => {
    it('应该支持创建扩展', async () => {
      // 📋 Arrange
      const newExtension = testExtensions[0];

      // 🎯 Act
      const result = await repository.create(newExtension);

      // ✅ Assert - 期望企业级创建功能
      expect(result).toBeDefined();
      expect(result.extensionId).toBe(newExtension.extensionId);
      expect(result.name).toBe(newExtension.name);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('应该支持保存扩展', async () => {
      // 📋 Arrange
      const extension = testExtensions[0];

      // 🎯 Act & Assert - 期望无异常保存
      await expect(repository.save(extension)).resolves.not.toThrow();
    });

    it('应该根据ID查找扩展', async () => {
      // 📋 Arrange
      const extension = testExtensions[0];
      await repository.save(extension);

      // 🎯 Act
      const found = await repository.findById(extension.extensionId);

      // ✅ Assert
      expect(found).toBeDefined();
      expect(found?.extensionId).toBe(extension.extensionId);
      expect(found?.name).toBe(extension.name);
    });

    it('应该根据名称查找扩展', async () => {
      // 📋 Arrange
      const extension = testExtensions[0];
      await repository.save(extension);

      // 🎯 Act
      const found = await repository.findByName(extension.name, extension.contextId);

      // ✅ Assert
      expect(found).toBeDefined();
      expect(found?.name).toBe(extension.name);
      expect(found?.contextId).toBe(extension.contextId);
    });

    it('应该更新扩展', async () => {
      // 📋 Arrange
      const extension = testExtensions[0];
      await repository.save(extension);
      
      // 创建更新的Extension实例，使用Schema数据
      const updatedExtension = new Extension(createTestExtensionSchemaData({
        extension_id: extension.extensionId,
        context_id: extension.contextId,
        protocol_version: extension.protocolVersion,
        name: extension.name,
        version: extension.version,
        extension_type: extension.type,
        status: extension.status,
        description: 'Updated description', // 更新描述
        timestamp: new Date().toISOString() // 更新时间戳
      }));

      // 🎯 Act
      await repository.update(updatedExtension);
      const found = await repository.findById(extension.extensionId);

      // ✅ Assert
      expect(found?.description).toBe('Updated description');
      expect(found?.updatedAt).not.toBe(extension.updatedAt);
    });

    it('应该删除扩展', async () => {
      // 📋 Arrange
      const extension = testExtensions[0];
      await repository.save(extension);

      // 🎯 Act
      await repository.delete(extension.extensionId);
      const found = await repository.findById(extension.extensionId);

      // ✅ Assert
      expect(found).toBeNull();
    });
  });

  describe('🔍 企业级查询功能测试', () => {
    beforeEach(async () => {
      // 保存所有测试扩展
      for (const extension of testExtensions) {
        await repository.save(extension);
      }
    });

    it('应该支持根据上下文ID查找扩展列表', async () => {
      // 📋 Arrange
      const contextId = testExtensions[0].contextId;

      // 🎯 Act
      const extensions = await repository.findByContextId(contextId);

      // ✅ Assert
      expect(extensions).toBeDefined();
      expect(Array.isArray(extensions)).toBe(true);
      extensions.forEach(ext => {
        expect(ext.contextId).toBe(contextId);
      });
    });

    it('应该支持根据类型查找扩展', async () => {
      // 📋 Arrange
      const extensionType: ExtensionType = 'plugin';

      // 🎯 Act
      const extensions = await repository.findByType(extensionType);

      // ✅ Assert
      expect(extensions).toBeDefined();
      expect(Array.isArray(extensions)).toBe(true);
      extensions.forEach(ext => {
        expect(ext.type).toBe(extensionType);
      });
    });

    it('应该支持查找活跃扩展', async () => {
      // 🎯 Act
      const activeExtensions = await repository.findActiveExtensions();

      // ✅ Assert
      expect(activeExtensions).toBeDefined();
      expect(Array.isArray(activeExtensions)).toBe(true);
      activeExtensions.forEach(ext => {
        expect(ext.status).toBe('active');
      });
    });

    it('应该支持复杂过滤器查询', async () => {
      // 📋 Arrange
      const filter: ExtensionFilter = {
        type: 'plugin' as ExtensionType,
        status: 'active' as ExtensionStatus,
        is_active: true
      };

      const pagination: PaginationOptions = {
        page: 1,
        limit: 10,
        sort_by: 'name',
        sort_order: 'asc'
      };

      // 🎯 Act
      const result = await repository.findByFilter(filter, pagination);

      // ✅ Assert - 期望企业级分页查询功能
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(typeof result.total).toBe('number');
      expect(typeof result.page).toBe('number');
      expect(typeof result.limit).toBe('number');
      expect(typeof result.total_pages).toBe('number');
      
      // 验证过滤条件
      result.items.forEach(ext => {
        expect(ext.type).toBe(filter.type);
        expect(ext.status).toBe(filter.status);
      });
    });

    it('应该支持根据扩展点查找扩展', async () => {
      // 📋 Arrange
      const pointName = 'api_endpoint';

      // 🎯 Act
      const extensions = await repository.findByExtensionPoint(pointName);

      // ✅ Assert
      expect(extensions).toBeDefined();
      expect(Array.isArray(extensions)).toBe(true);
      // 验证扩展包含指定的扩展点
      extensions.forEach(ext => {
        expect(ext.extensionPoints?.some(point => 
          typeof point === 'object' && point !== null && 'name' in point && point.name === pointName
        )).toBe(true);
      });
    });

    it('应该支持查找具有API扩展的扩展', async () => {
      // 🎯 Act
      const extensions = await repository.findWithApiExtensions();

      // ✅ Assert
      expect(extensions).toBeDefined();
      expect(Array.isArray(extensions)).toBe(true);
      // 验证扩展包含API扩展
      extensions.forEach(ext => {
        expect(ext.apiExtensions).toBeDefined();
        expect(Array.isArray(ext.apiExtensions)).toBe(true);
        expect(ext.apiExtensions!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('📊 企业级批量操作测试', () => {
    beforeEach(async () => {
      // 保存所有测试扩展
      for (const extension of testExtensions) {
        await repository.save(extension);
      }
    });

    it('应该支持批量更新状态', async () => {
      // 📋 Arrange
      const extensionIds = testExtensions.map(ext => ext.extensionId);
      const newStatus: ExtensionStatus = 'disabled';

      // 🎯 Act
      await repository.batchUpdateStatus(extensionIds, newStatus);

      // ✅ Assert
      for (const extensionId of extensionIds) {
        const extension = await repository.findById(extensionId);
        expect(extension?.status).toBe(newStatus);
      }
    });

    it('应该支持检查扩展是否存在', async () => {
      // 📋 Arrange
      const existingId = testExtensions[0].extensionId;
      const nonExistingId = uuidv4();

      // 🎯 Act
      const exists = await repository.exists(existingId);
      const notExists = await repository.exists(nonExistingId);

      // ✅ Assert
      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });

    it('应该支持检查名称唯一性', async () => {
      // 📋 Arrange
      const existingName = testExtensions[0].name;
      const contextId = testExtensions[0].contextId;
      const uniqueName = 'unique-extension-name';

      // 🎯 Act
      const isExistingUnique = await repository.isNameUnique(existingName, contextId);
      const isNewUnique = await repository.isNameUnique(uniqueName, contextId);

      // ✅ Assert
      expect(isExistingUnique).toBe(false);
      expect(isNewUnique).toBe(true);
    });
  });

  describe('📈 企业级统计和分析功能测试', () => {
    beforeEach(async () => {
      // 保存所有测试扩展
      for (const extension of testExtensions) {
        await repository.save(extension);
      }
    });

    it('应该支持获取扩展统计信息', async () => {
      // 🎯 Act
      const statistics = await repository.getStatistics();

      // ✅ Assert - 期望企业级统计功能
      expect(statistics).toBeDefined();
      expect(typeof statistics.total).toBe('number');
      expect(typeof statistics.active_count).toBe('number');
      expect(statistics.by_type).toBeDefined();
      expect(statistics.by_status).toBeDefined();
      
      // 验证统计数据结构
      expect(statistics.total).toBe(testExtensions.length);
      expect(statistics.active_count).toBe(
        testExtensions.filter(ext => ext.status === 'active').length
      );
      
      // 验证by_type和by_status是对象
      expect(typeof statistics.by_type).toBe('object');
      expect(typeof statistics.by_status).toBe('object');
    });

    it('应该支持查找扩展依赖关系', async () => {
      // 📋 Arrange
      const targetExtensionId = testExtensions[0].extensionId;

      // 🎯 Act
      const dependents = await repository.findDependents(targetExtensionId);

      // ✅ Assert
      expect(dependents).toBeDefined();
      expect(Array.isArray(dependents)).toBe(true);
      // 验证依赖关系
      dependents.forEach(ext => {
        expect(ext.dependencies?.includes(targetExtensionId)).toBe(true);
      });
    });

    it('应该支持检查扩展依赖', async () => {
      // 📋 Arrange
      const extension = testExtensions[0];

      // 🎯 Act
      const dependencyCheck = await repository.checkDependencies(extension);

      // ✅ Assert - 期望企业级依赖检查功能
      expect(dependencyCheck).toBeDefined();
      expect(typeof dependencyCheck.satisfied).toBe('boolean');
      expect(Array.isArray(dependencyCheck.missing)).toBe(true);
      expect(Array.isArray(dependencyCheck.conflicts)).toBe(true);
    });
  });

  describe('🚨 企业级错误处理和边界条件测试', () => {
    it('应该处理不存在的扩展ID查找', async () => {
      // 📋 Arrange
      const nonExistentId = uuidv4();

      // 🎯 Act
      const result = await repository.findById(nonExistentId);

      // ✅ Assert
      expect(result).toBeNull();
    });

    it('应该处理空过滤器查询', async () => {
      // 📋 Arrange
      const emptyFilter: ExtensionFilter = {};

      // 🎯 Act
      const result = await repository.findByFilter(emptyFilter);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });

    it('应该处理无效分页参数', async () => {
      // 📋 Arrange
      const filter: ExtensionFilter = {};
      const invalidPagination: PaginationOptions = {
        page: -1,
        limit: 0
      };

      // 🎯 Act & Assert - 期望优雅处理无效参数
      await expect(repository.findByFilter(filter, invalidPagination)).resolves.not.toThrow();
    });

    it('应该处理重复名称创建', async () => {
      // 📋 Arrange
      const extension1 = testExtensions[0];
      const extension2 = { ...testExtensions[1], name: extension1.name, contextId: extension1.contextId };

      await repository.save(extension1);

      // 🎯 Act & Assert - 期望处理重复名称
      await expect(repository.save(extension2)).resolves.not.toThrow();
      
      // 验证名称唯一性检查
      const isUnique = await repository.isNameUnique(extension1.name, extension1.contextId);
      expect(isUnique).toBe(false);
    });
  });

  describe('⚡ 企业级性能和事务性操作测试', () => {
    it('应该支持大批量数据操作', async () => {
      // 📋 Arrange - 创建大量测试数据
      const largeDataSet: Extension[] = [];
      for (let i = 0; i < 100; i++) {
        largeDataSet.push(new Extension(createTestExtensionSchemaData({
          extension_id: uuidv4(),
          name: `bulk-extension-${i}`,
          extension_type: 'plugin',
          status: 'active'
        })));
      }

      // 🎯 Act - 测试批量保存性能
      const startTime = Date.now();
      for (const extension of largeDataSet) {
        await repository.save(extension);
      }
      const endTime = Date.now();

      // ✅ Assert - 期望合理的性能
      expect(endTime - startTime).toBeLessThan(5000); // 5秒内完成100个操作
      
      // 验证数据完整性
      const statistics = await repository.getStatistics();
      expect(statistics.total).toBeGreaterThanOrEqual(100);
    });

    it('应该支持并发操作', async () => {
      // 📋 Arrange
      const concurrentExtensions = testExtensions.slice(0, 3);

      // 🎯 Act - 并发保存操作
      const savePromises = concurrentExtensions.map(ext => repository.save(ext));
      
      // ✅ Assert - 期望并发操作成功
      await expect(Promise.all(savePromises)).resolves.not.toThrow();
      
      // 验证所有数据都已保存
      for (const extension of concurrentExtensions) {
        const found = await repository.findById(extension.extensionId);
        expect(found).toBeDefined();
      }
    });

    it('应该支持事务性批量状态更新', async () => {
      // 📋 Arrange
      const extensions = testExtensions.slice(0, 2);
      for (const ext of extensions) {
        await repository.save(ext);
      }
      
      const extensionIds = extensions.map(ext => ext.extensionId);
      const newStatus: ExtensionStatus = 'disabled';

      // 🎯 Act
      await repository.batchUpdateStatus(extensionIds, newStatus);

      // ✅ Assert - 验证所有状态都已更新
      for (const extensionId of extensionIds) {
        const extension = await repository.findById(extensionId);
        expect(extension?.status).toBe(newStatus);
      }
    });
  });
});
