/**
 * Context管理服务单元测试
 * 
 * @description 基于实际接口的ContextManagementService测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 */

import { ContextManagementService } from '../../../../src/modules/context/application/services/context-management.service';
import { MemoryContextRepository } from '../../../../src/modules/context/infrastructure/repositories/context.repository';
import { ContextEntity } from '../../../../src/modules/context/domain/entities/context.entity';
import { CreateContextData, UpdateContextData } from '../../../../src/modules/context/types';
import { UUID } from '../../../src/shared/types/index';

describe('ContextManagementService测试', () => {
  let service: ContextManagementService;
  let repository: MemoryContextRepository;
  let mockLogger: any;
  let mockCacheManager: any;
  let mockVersionManager: any;

  beforeEach(() => {
    repository = new MemoryContextRepository();

    // 创建logger mock
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    // 创建cacheManager mock
    mockCacheManager = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn().mockResolvedValue(undefined)
    };

    // 创建versionManager mock
    mockVersionManager = {
      createVersion: jest.fn().mockResolvedValue('1.0.0'),
      getVersionHistory: jest.fn().mockResolvedValue([]),
      getVersion: jest.fn().mockResolvedValue(null),
      compareVersions: jest.fn().mockResolvedValue({ added: {}, modified: {}, removed: [] })
    };

    service = new ContextManagementService(repository, mockLogger, mockCacheManager, mockVersionManager);
  });

  describe('createContext功能测试', () => {
    it('应该成功创建Context并返回实体', async () => {
      // 📋 Arrange - 基于实际CreateContextData接口
      const createRequest: CreateContextData = {
        name: 'Test Context',
        description: 'Test context for unit testing',
        sharedState: {
          variables: {
            testKey: 'testValue',
            counter: 42
          }
        }
      };

      // 🎬 Act - 调用实际的createContext方法
      const result = await service.createContext(createRequest);

      // ✅ Assert - 验证返回的ContextEntity（使用实际的getter属性）
      expect(result).toBeInstanceOf(ContextEntity);
      expect(result.contextId).toBeDefined();
      expect(result.name).toBe(createRequest.name);
      expect(result.description).toBe(createRequest.description);
      expect(result.sharedState.variables).toEqual(createRequest.sharedState?.variables);
      expect(result.status).toBe('active');
      expect(result.lifecycleStage).toBe('planning');
      expect(result.protocolVersion).toBe('1.0.0');
      expect(result.timestamp).toBeDefined();
    });

    it('应该为新Context生成唯一ID', async () => {
      // 📋 Arrange
      const createRequest1: CreateContextData = {
        name: 'Test Context 1'
      };
      const createRequest2: CreateContextData = {
        name: 'Test Context 2'
      };

      // 🎬 Act
      const context1 = await service.createContext(createRequest1);
      const context2 = await service.createContext(createRequest2);

      // ✅ Assert
      expect(context1.contextId).not.toBe(context2.contextId);
      expect(context1.contextId).toBeDefined();
      expect(context2.contextId).toBeDefined();
    });

    it('应该在名称重复时抛出错误', async () => {
      // 📋 Arrange
      const createRequest: CreateContextData = {
        name: 'Duplicate Name Context'
      };

      // 先创建一个Context
      await service.createContext(createRequest);

      // 🎬 Act & Assert - 尝试创建同名Context应该失败
      await expect(service.createContext(createRequest))
        .rejects
        .toThrow(`Context with name 'Duplicate Name Context' already exists`);
    });
  });

  describe('getContextById功能测试', () => {
    it('应该成功获取存在的Context', async () => {
      // 📋 Arrange
      const createRequest: CreateContextData = {
        name: 'Get Test Context',
        description: 'Context for get testing'
      };
      const createdContext = await service.createContext(createRequest);

      // 🎬 Act
      const retrievedContext = await service.getContextById(createdContext.contextId);

      // ✅ Assert
      expect(retrievedContext).not.toBeNull();
      expect(retrievedContext!.contextId).toBe(createdContext.contextId);
      expect(retrievedContext!.name).toBe(createdContext.name);
      expect(retrievedContext!.description).toBe(createdContext.description);
    });

    it('应该在Context不存在时返回null', async () => {
      // 📋 Arrange
      const nonExistentId = 'ctx-non-existent-id' as UUID;

      // 🎬 Act
      const result = await service.getContextById(nonExistentId);

      // ✅ Assert
      expect(result).toBeNull();
    });
  });

  describe('getContextByName功能测试', () => {
    it('应该成功根据名称获取Context', async () => {
      // 📋 Arrange
      const createRequest: CreateContextData = {
        name: 'Named Context Test',
        description: 'Context for name-based retrieval'
      };
      const createdContext = await service.createContext(createRequest);

      // 🎬 Act
      const retrievedContext = await service.getContextByName(createdContext.name);

      // ✅ Assert
      expect(retrievedContext).not.toBeNull();
      expect(retrievedContext!.contextId).toBe(createdContext.contextId);
      expect(retrievedContext!.name).toBe(createdContext.name);
    });

    it('应该在名称不存在时返回null', async () => {
      // 📋 Arrange
      const nonExistentName = 'Non-existent Context Name';

      // 🎬 Act
      const result = await service.getContextByName(nonExistentName);

      // ✅ Assert
      expect(result).toBeNull();
    });
  });

  describe('updateContext功能测试', () => {
    it('应该成功更新Context', async () => {
      // 📋 Arrange
      const createRequest: CreateContextData = {
        name: 'Original Context',
        description: 'Original description'
      };
      const originalContext = await service.createContext(createRequest);
      const originalTimestamp = originalContext.timestamp;

      // 等待一毫秒确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1));

      const updateRequest: UpdateContextData = {
        name: 'Updated Context',
        description: 'Updated description',
        sharedState: {
          variables: {
            newKey: 'newValue'
          }
        }
      };

      // 🎬 Act
      const updatedContext = await service.updateContext(originalContext.contextId, updateRequest);

      // ✅ Assert
      expect(updatedContext.contextId).toBe(originalContext.contextId);
      expect(updatedContext.name).toBe('Updated Context');
      expect(updatedContext.description).toBe('Updated description');
      expect(updatedContext.sharedState.variables.newKey).toBe('newValue');
      expect(new Date(updatedContext.timestamp).getTime()).toBeGreaterThanOrEqual(new Date(originalTimestamp).getTime());
    });

    it('应该在Context不存在时抛出错误', async () => {
      // 📋 Arrange
      const nonExistentId = 'ctx-non-existent-id' as UUID;
      const updateRequest: UpdateContextData = {
        name: 'Updated Name'
      };

      // 🎬 Act & Assert
      await expect(service.updateContext(nonExistentId, updateRequest))
        .rejects
        .toThrow(`Context with ID '${nonExistentId}' not found`);
    });
  });

  describe('deleteContext功能测试', () => {
    it('应该成功删除存在的Context', async () => {
      // 📋 Arrange
      const createRequest: CreateContextData = {
        name: 'Delete Test Context'
      };
      const createdContext = await service.createContext(createRequest);
      const contextId = createdContext.contextId;

      // 先将Context状态改为可删除的状态
      await service.updateContext(contextId, { status: 'completed' });

      // 🎬 Act
      const result = await service.deleteContext(contextId);

      // ✅ Assert
      expect(result).toBe(true);

      // 验证Context已被删除
      const retrievedContext = await service.getContextById(contextId);
      expect(retrievedContext).toBeNull();
    });

    it('应该在Context不存在时抛出错误', async () => {
      // 📋 Arrange
      const nonExistentId = 'ctx-non-existent-id' as UUID;

      // 🎬 Act & Assert
      await expect(service.deleteContext(nonExistentId))
        .rejects
        .toThrow(`Context with ID '${nonExistentId}' not found`);
    });
  });

  describe('getContextStatistics功能测试', () => {
    beforeEach(async () => {
      // 创建测试数据
      const contexts = [
        { name: 'Active Context 1' },
        { name: 'Active Context 2' },
        { name: 'Active Context 3' }
      ];

      for (const contextData of contexts) {
        await service.createContext(contextData);
      }
    });

    it('应该返回正确的统计信息', async () => {
      // 🎬 Act
      const stats = await service.getContextStatistics();

      // ✅ Assert
      expect(stats.total).toBe(3);
      expect(stats.byStatus).toBeDefined();
      expect(stats.byLifecycleStage).toBeDefined();
      expect(typeof stats.byStatus).toBe('object');
      expect(typeof stats.byLifecycleStage).toBe('object');
    });
  });

  describe('createMultipleContexts功能测试', () => {
    it('应该成功批量创建多个Context', async () => {
      // 📋 Arrange
      const requests: CreateContextData[] = [
        { name: 'Batch Context 1' },
        { name: 'Batch Context 2' },
        { name: 'Batch Context 3' }
      ];

      // 🎬 Act
      const results = await service.createMultipleContexts(requests);

      // ✅ Assert
      expect(results).toHaveLength(3);
      expect(results[0].name).toBe('Batch Context 1');
      expect(results[1].name).toBe('Batch Context 2');
      expect(results[2].name).toBe('Batch Context 3');
      
      // 验证每个Context都有唯一ID
      const ids = results.map(ctx => ctx.contextId);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });
  });

  describe('healthCheck功能测试', () => {
    it('应该返回健康状态', async () => {
      // 🎬 Act
      const isHealthy = await service.healthCheck();

      // ✅ Assert
      expect(typeof isHealthy).toBe('boolean');
      expect(isHealthy).toBe(true);
    });
  });
});
