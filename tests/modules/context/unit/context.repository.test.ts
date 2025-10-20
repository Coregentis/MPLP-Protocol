/**
 * Context仓库单元测试
 * 
 * @description 基于实际接口的MemoryContextRepository测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 */

import { MemoryContextRepository } from '../../../../src/modules/context/infrastructure/repositories/context.repository';
import { ContextEntity } from '../../../../src/modules/context/domain/entities/context.entity';
import { ContextQueryFilter } from '../../../../src/modules/context/types';
import { UUID } from '../../../../src/shared/types/index';

describe('MemoryContextRepository测试', () => {
  let repository: MemoryContextRepository;

  beforeEach(() => {
    repository = new MemoryContextRepository();
  });

  describe('基础CRUD操作测试', () => {
    describe('save功能测试', () => {
      it('应该成功保存Context实体', async () => {
        // 📋 Arrange
        const contextEntity = new ContextEntity({
          name: 'Test Context',
          description: 'Test context for save operation'
        });

        // 🎬 Act
        const result = await repository.save(contextEntity);

        // ✅ Assert
        expect(result).toBe(contextEntity);
        expect(result.contextId).toBe(contextEntity.contextId);
        expect(result.name).toBe('Test Context');
      });

      it('应该更新名称索引', async () => {
        // 📋 Arrange
        const contextEntity = new ContextEntity({
          name: 'Indexed Context'
        });

        // 🎬 Act
        await repository.save(contextEntity);
        const foundByName = await repository.findByName('Indexed Context');

        // ✅ Assert
        expect(foundByName).not.toBeNull();
        expect(foundByName!.contextId).toBe(contextEntity.contextId);
      });
    });

    describe('findById功能测试', () => {
      it('应该成功根据ID查找Context', async () => {
        // 📋 Arrange
        const contextEntity = new ContextEntity({
          name: 'Find By ID Context'
        });
        await repository.save(contextEntity);

        // 🎬 Act
        const result = await repository.findById(contextEntity.contextId);

        // ✅ Assert
        expect(result).not.toBeNull();
        expect(result!.contextId).toBe(contextEntity.contextId);
        expect(result!.name).toBe('Find By ID Context');
      });

      it('应该在Context不存在时返回null', async () => {
        // 📋 Arrange
        const nonExistentId = 'ctx-non-existent' as UUID;

        // 🎬 Act
        const result = await repository.findById(nonExistentId);

        // ✅ Assert
        expect(result).toBeNull();
      });
    });

    describe('findByName功能测试', () => {
      it('应该成功根据名称查找Context', async () => {
        // 📋 Arrange
        const contextEntity = new ContextEntity({
          name: 'Find By Name Context'
        });
        await repository.save(contextEntity);

        // 🎬 Act
        const result = await repository.findByName('Find By Name Context');

        // ✅ Assert
        expect(result).not.toBeNull();
        expect(result!.name).toBe('Find By Name Context');
        expect(result!.contextId).toBe(contextEntity.contextId);
      });

      it('应该在名称不存在时返回null', async () => {
        // 📋 Arrange
        const nonExistentName = 'Non-existent Context';

        // 🎬 Act
        const result = await repository.findByName(nonExistentName);

        // ✅ Assert
        expect(result).toBeNull();
      });
    });

    describe('update功能测试', () => {
      it('应该成功更新存在的Context', async () => {
        // 📋 Arrange
        const contextEntity = new ContextEntity({
          name: 'Original Context'
        });
        await repository.save(contextEntity);

        // 修改实体
        contextEntity.updateName('Updated Context');

        // 🎬 Act
        const result = await repository.update(contextEntity);

        // ✅ Assert
        expect(result.name).toBe('Updated Context');
        expect(result.contextId).toBe(contextEntity.contextId);

        // 验证更新后的实体可以被查找到
        const foundContext = await repository.findById(contextEntity.contextId);
        expect(foundContext!.name).toBe('Updated Context');
      });

      it('应该在Context不存在时抛出错误', async () => {
        // 📋 Arrange - 创建一个Context但不保存到仓库
        const nonExistentContext = new ContextEntity({
          name: 'Non-existent Context'
        });

        // 🎬 Act & Assert
        await expect(repository.update(nonExistentContext))
          .rejects
          .toThrow(`Context with ID '${nonExistentContext.contextId}' not found`);
      });
    });

    describe('delete功能测试', () => {
      it('应该成功删除存在的Context', async () => {
        // 📋 Arrange
        const contextEntity = new ContextEntity({
          name: 'Delete Test Context'
        });
        await repository.save(contextEntity);

        // 🎬 Act
        const result = await repository.delete(contextEntity.contextId);

        // ✅ Assert
        expect(result).toBe(true);

        // 验证Context已被删除
        const foundContext = await repository.findById(contextEntity.contextId);
        expect(foundContext).toBeNull();

        // 验证名称索引也被删除
        const foundByName = await repository.findByName('Delete Test Context');
        expect(foundByName).toBeNull();
      });

      it('应该在Context不存在时返回false', async () => {
        // 📋 Arrange
        const nonExistentId = 'ctx-non-existent' as UUID;

        // 🎬 Act
        const result = await repository.delete(nonExistentId);

        // ✅ Assert
        expect(result).toBe(false);
      });
    });

    describe('exists功能测试', () => {
      it('应该正确检查Context是否存在', async () => {
        // 📋 Arrange
        const contextEntity = new ContextEntity({
          name: 'Exists Test Context'
        });
        await repository.save(contextEntity);

        // 🎬 Act
        const exists = await repository.exists(contextEntity.contextId);
        const notExists = await repository.exists('ctx-non-existent' as UUID);

        // ✅ Assert
        expect(exists).toBe(true);
        expect(notExists).toBe(false);
      });
    });
  });

  describe('查询操作测试', () => {
    beforeEach(async () => {
      // 创建测试数据
      const contexts = [
        new ContextEntity({ name: 'Active Context 1', status: 'active' }),
        new ContextEntity({ name: 'Active Context 2', status: 'active' }),
        new ContextEntity({ name: 'Completed Context 1', status: 'completed' }),
        new ContextEntity({ name: 'Suspended Context 1', status: 'suspended' })
      ];

      for (const context of contexts) {
        await repository.save(context);
      }
    });

    describe('findAll功能测试', () => {
      it('应该返回所有Context', async () => {
        // 🎬 Act
        const result = await repository.findAll();

        // ✅ Assert
        expect(result.data).toHaveLength(4);
        expect(result.total).toBe(4);
        expect(result.page).toBe(1);
        expect(result.totalPages).toBe(1);
      });

      it('应该支持分页查询', async () => {
        // 🎬 Act
        const result = await repository.findAll({ page: 1, limit: 2 });

        // ✅ Assert
        expect(result.data).toHaveLength(2);
        expect(result.total).toBe(4);
        expect(result.page).toBe(1);
        expect(result.limit).toBe(2);
        expect(result.totalPages).toBe(2);
      });
    });

    describe('findByFilter功能测试', () => {
      it('应该根据状态过滤Context', async () => {
        // 📋 Arrange
        const filter: ContextQueryFilter = {
          status: 'active'
        };

        // 🎬 Act
        const result = await repository.findByFilter(filter);

        // ✅ Assert
        expect(result.data).toHaveLength(2);
        result.data.forEach(context => {
          expect(context.status).toBe('active');
        });
      });

      it('应该支持多状态过滤', async () => {
        // 📋 Arrange
        const filter: ContextQueryFilter = {
          status: ['active', 'completed']
        };

        // 🎬 Act
        const result = await repository.findByFilter(filter);

        // ✅ Assert
        expect(result.data).toHaveLength(3);
        result.data.forEach(context => {
          expect(['active', 'completed']).toContain(context.status);
        });
      });
    });
  });

  describe('统计操作测试', () => {
    beforeEach(async () => {
      // 创建测试数据
      const contexts = [
        new ContextEntity({ name: 'Stats Context 1', status: 'active', lifecycleStage: 'planning' }),
        new ContextEntity({ name: 'Stats Context 2', status: 'active', lifecycleStage: 'executing' }),
        new ContextEntity({ name: 'Stats Context 3', status: 'completed', lifecycleStage: 'completed' })
      ];

      for (const context of contexts) {
        await repository.save(context);
      }
    });

    describe('count功能测试', () => {
      it('应该返回正确的总数', async () => {
        // 🎬 Act
        const count = await repository.count();

        // ✅ Assert
        expect(count).toBe(3);
      });
    });

    describe('countByStatus功能测试', () => {
      it('应该根据状态统计数量', async () => {
        // 🎬 Act
        const activeCount = await repository.countByStatus('active');
        const completedCount = await repository.countByStatus('completed');

        // ✅ Assert
        expect(activeCount).toBe(2);
        expect(completedCount).toBe(1);
      });

      it('应该支持多状态统计', async () => {
        // 🎬 Act
        const count = await repository.countByStatus(['active', 'completed']);

        // ✅ Assert
        expect(count).toBe(3);
      });
    });

    describe('countByLifecycleStage功能测试', () => {
      it('应该根据生命周期阶段统计数量', async () => {
        // 🎬 Act
        const planningCount = await repository.countByLifecycleStage('planning');
        const executingCount = await repository.countByLifecycleStage('executing');
        const completedCount = await repository.countByLifecycleStage('completed');

        // ✅ Assert
        expect(planningCount).toBe(1);
        expect(executingCount).toBe(1);
        expect(completedCount).toBe(1);
      });
    });

    describe('getStatistics功能测试', () => {
      it('应该返回完整的统计信息', async () => {
        // 🎬 Act
        const stats = await repository.getStatistics();

        // ✅ Assert
        expect(stats.totalContexts).toBe(3);
        expect(stats.activeContexts).toBe(2);
        expect(stats.completedContexts).toBe(1);
        expect(stats.suspendedContexts).toBe(0);
        expect(stats.terminatedContexts).toBe(0);
      });
    });
  });

  describe('批量操作测试', () => {
    describe('saveMany功能测试', () => {
      it('应该成功批量保存Context', async () => {
        // 📋 Arrange
        const contexts = [
          new ContextEntity({ name: 'Batch Context 1' }),
          new ContextEntity({ name: 'Batch Context 2' }),
          new ContextEntity({ name: 'Batch Context 3' })
        ];

        // 🎬 Act
        const results = await repository.saveMany(contexts);

        // ✅ Assert
        expect(results).toHaveLength(3);
        expect(results[0].name).toBe('Batch Context 1');
        expect(results[1].name).toBe('Batch Context 2');
        expect(results[2].name).toBe('Batch Context 3');

        // 验证所有Context都被保存
        const count = await repository.count();
        expect(count).toBe(3);
      });
    });

    describe('deleteMany功能测试', () => {
      it('应该成功批量删除Context', async () => {
        // 📋 Arrange
        const contexts = [
          new ContextEntity({ name: 'Delete Batch 1' }),
          new ContextEntity({ name: 'Delete Batch 2' })
        ];
        await repository.saveMany(contexts);
        const contextIds = contexts.map(ctx => ctx.contextId);

        // 🎬 Act
        const deletedCount = await repository.deleteMany(contextIds);

        // ✅ Assert
        expect(deletedCount).toBe(2);

        // 验证Context已被删除
        const count = await repository.count();
        expect(count).toBe(0);
      });
    });
  });

  describe('缓存操作测试', () => {
    beforeEach(async () => {
      // 创建测试数据
      const context = new ContextEntity({ name: 'Cache Test Context' });
      await repository.save(context);
    });

    describe('clearCache功能测试', () => {
      it('应该清空所有缓存数据', async () => {
        // 🎬 Act
        await repository.clearCache();

        // ✅ Assert
        const count = await repository.count();
        expect(count).toBe(0);
      });
    });

    describe('clearCacheForContext功能测试', () => {
      it('应该清空特定Context的缓存', async () => {
        // 📋 Arrange
        const context = new ContextEntity({ name: 'Specific Cache Context' });
        await repository.save(context);

        // 🎬 Act
        await repository.clearCacheForContext(context.contextId);

        // ✅ Assert
        const foundContext = await repository.findById(context.contextId);
        expect(foundContext).toBeNull();
      });
    });
  });

  describe('healthCheck功能测试', () => {
    it('应该返回健康状态', async () => {
      // 🎬 Act
      const isHealthy = await repository.healthCheck();

      // ✅ Assert
      expect(isHealthy).toBe(true);
    });
  });
});
