/**
 * Plan仓库单元测试
 *
 * @description 基于实际接口的PlanRepository测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 * @pattern 与Context模块使用IDENTICAL的测试模式
 */

import { PlanRepository } from '../../../src/modules/plan/infrastructure/repositories/plan.repository';
import { PlanEntity } from '../../../src/modules/plan/domain/entities/plan.entity';
import { PlanQueryFilter } from '../../../src/modules/plan/domain/repositories/plan-repository.interface';
import { UUID } from '../../../src/shared/types';

describe('PlanRepository测试', () => {
  let repository: PlanRepository;

  beforeEach(() => {
    repository = new PlanRepository();
  });

  describe('基础CRUD操作测试', () => {
    describe('save功能测试', () => {
      it('应该成功保存Plan实体', async () => {
        // 📋 Arrange
        const planEntity = new PlanEntity({
          name: 'Test Plan',
          description: 'Test plan for save operation',
          contextId: 'ctx-test-123'
        });

        // 🎬 Act
        const result = await repository.save(planEntity);

        // ✅ Assert
        expect(result).toBe(planEntity);
        expect(result.planId).toBe(planEntity.planId);
        expect(result.name).toBe('Test Plan');
      });

      it('应该保存多个不同的Plan实体', async () => {
        // 📋 Arrange
        const plan1 = new PlanEntity({ name: 'Plan 1', contextId: 'ctx-1' });
        const plan2 = new PlanEntity({ name: 'Plan 2', contextId: 'ctx-2' });

        // 🎬 Act
        await repository.save(plan1);
        await repository.save(plan2);
        const count = await repository.count();

        // ✅ Assert
        expect(count).toBe(2);
      });
    });

    describe('findById功能测试', () => {
      it('应该成功根据ID查找Plan', async () => {
        // 📋 Arrange
        const planEntity = new PlanEntity({
          name: 'Find By ID Plan',
          contextId: 'ctx-find-test'
        });
        await repository.save(planEntity);

        // 🎬 Act
        const result = await repository.findById(planEntity.planId);

        // ✅ Assert
        expect(result).not.toBeNull();
        expect(result!.planId).toBe(planEntity.planId);
        expect(result!.name).toBe('Find By ID Plan');
      });

      it('应该在Plan不存在时返回null', async () => {
        // 📋 Arrange
        const nonExistentId = 'plan-non-existent' as UUID;

        // 🎬 Act
        const result = await repository.findById(nonExistentId);

        // ✅ Assert
        expect(result).toBeNull();
      });
    });

    describe('findByName功能测试', () => {
      it('应该成功根据名称查找Plan', async () => {
        // 📋 Arrange
        const planEntity = new PlanEntity({
          name: 'Find By Name Plan',
          contextId: 'ctx-name-test'
        });
        await repository.save(planEntity);

        // 🎬 Act
        const result = await repository.findByName('Find By Name Plan');

        // ✅ Assert
        expect(result).not.toBeNull();
        expect(result!.name).toBe('Find By Name Plan');
        expect(result!.planId).toBe(planEntity.planId);
      });

      it('应该在名称不存在时返回null', async () => {
        // 📋 Arrange
        const nonExistentName = 'Non-existent Plan';

        // 🎬 Act
        const result = await repository.findByName(nonExistentName);

        // ✅ Assert
        expect(result).toBeNull();
      });
    });

    describe('update功能测试', () => {
      it('应该成功更新Plan实体', async () => {
        // 📋 Arrange
        const planEntity = new PlanEntity({
          name: 'Original Plan',
          contextId: 'ctx-update-test'
        });
        await repository.save(planEntity);
        
        planEntity.update({ name: 'Updated Plan', description: 'Updated description' });

        // 🎬 Act
        const result = await repository.update(planEntity);

        // ✅ Assert
        expect(result.name).toBe('Updated Plan');
        expect(result.description).toBe('Updated description');
      });

      it('应该在Plan不存在时抛出错误', async () => {
        // 📋 Arrange
        const nonExistentPlan = new PlanEntity({
          name: 'Non-existent Plan',
          contextId: 'ctx-non-existent'
        });

        // 🎬 Act & Assert
        await expect(repository.update(nonExistentPlan))
          .rejects.toThrow(`Plan with ID ${nonExistentPlan.planId} not found`);
      });
    });

    describe('delete功能测试', () => {
      it('应该成功删除Plan实体', async () => {
        // 📋 Arrange
        const planEntity = new PlanEntity({
          name: 'Delete Test Plan',
          contextId: 'ctx-delete-test'
        });
        await repository.save(planEntity);

        // 🎬 Act
        const result = await repository.delete(planEntity.planId);

        // ✅ Assert
        expect(result).toBe(true);
        
        // 验证已删除
        const deletedPlan = await repository.findById(planEntity.planId);
        expect(deletedPlan).toBeNull();
      });

      it('应该在Plan不存在时返回false', async () => {
        // 📋 Arrange
        const nonExistentId = 'plan-non-existent' as UUID;

        // 🎬 Act
        const result = await repository.delete(nonExistentId);

        // ✅ Assert
        expect(result).toBe(false);
      });
    });

    describe('exists功能测试', () => {
      it('应该正确检查Plan是否存在', async () => {
        // 📋 Arrange
        const planEntity = new PlanEntity({
          name: 'Exists Test Plan',
          contextId: 'ctx-exists-test'
        });
        await repository.save(planEntity);

        // 🎬 Act
        const exists = await repository.exists(planEntity.planId);
        const notExists = await repository.exists('plan-non-existent' as UUID);

        // ✅ Assert
        expect(exists).toBe(true);
        expect(notExists).toBe(false);
      });
    });
  });

  describe('查询操作测试', () => {
    beforeEach(async () => {
      // 创建测试数据
      const plans = [
        new PlanEntity({ name: 'Active Plan 1', status: 'active', priority: 'high', contextId: 'ctx-1' }),
        new PlanEntity({ name: 'Draft Plan 1', status: 'draft', priority: 'medium', contextId: 'ctx-2' }),
        new PlanEntity({ name: 'Completed Plan 1', status: 'completed', priority: 'low', contextId: 'ctx-3' }),
        new PlanEntity({ name: 'Active Plan 2', status: 'active', priority: 'critical', contextId: 'ctx-1' })
      ];

      for (const plan of plans) {
        await repository.save(plan);
      }
    });

    describe('findAll功能测试', () => {
      it('应该返回所有Plan实体', async () => {
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

    describe('findByStatus功能测试', () => {
      it('应该根据单个状态查找Plan', async () => {
        // 🎬 Act
        const result = await repository.findByStatus('active');

        // ✅ Assert
        expect(result.data).toHaveLength(2);
        expect(result.data.every(plan => plan.status === 'active')).toBe(true);
      });

      it('应该根据多个状态查找Plan', async () => {
        // 🎬 Act
        const result = await repository.findByStatus(['active', 'completed']);

        // ✅ Assert
        expect(result.data).toHaveLength(3);
        expect(result.data.every(plan => 
          plan.status === 'active' || plan.status === 'completed'
        )).toBe(true);
      });
    });

    describe('findByPriority功能测试', () => {
      it('应该根据优先级查找Plan', async () => {
        // 🎬 Act
        const result = await repository.findByPriority('high');

        // ✅ Assert
        expect(result.data).toHaveLength(1);
        expect(result.data[0].priority).toBe('high');
      });

      it('应该根据多个优先级查找Plan', async () => {
        // 🎬 Act
        const result = await repository.findByPriority(['high', 'critical']);

        // ✅ Assert
        expect(result.data).toHaveLength(2);
        expect(result.data.every(plan => 
          plan.priority === 'high' || plan.priority === 'critical'
        )).toBe(true);
      });
    });

    describe('findByContextId功能测试', () => {
      it('应该根据Context ID查找Plan', async () => {
        // 🎬 Act
        const result = await repository.findByContextId('ctx-1');

        // ✅ Assert
        expect(result.data).toHaveLength(2);
        expect(result.data.every(plan => plan.contextId === 'ctx-1')).toBe(true);
      });
    });

    describe('searchByName功能测试', () => {
      it('应该支持名称模式搜索', async () => {
        // 🎬 Act
        const result = await repository.searchByName('Active');

        // ✅ Assert
        expect(result.data).toHaveLength(2);
        expect(result.data.every(plan => plan.name.includes('Active'))).toBe(true);
      });

      it('应该支持大小写不敏感搜索', async () => {
        // 🎬 Act
        const result = await repository.searchByName('active');

        // ✅ Assert
        expect(result.data).toHaveLength(2);
        expect(result.data.every(plan => plan.name.toLowerCase().includes('active'))).toBe(true);
      });
    });

    describe('findByFilter功能测试', () => {
      it('应该支持复合条件过滤', async () => {
        // 📋 Arrange
        const filter: PlanQueryFilter = {
          status: 'active',
          priority: ['high', 'critical']
        };

        // 🎬 Act
        const result = await repository.findByFilter(filter);

        // ✅ Assert
        expect(result.data).toHaveLength(2);
        expect(result.data.every(plan => 
          plan.status === 'active' && 
          (plan.priority === 'high' || plan.priority === 'critical')
        )).toBe(true);
      });

      it('应该支持名称模式过滤', async () => {
        // 📋 Arrange
        const filter: PlanQueryFilter = {
          namePattern: 'Draft'
        };

        // 🎬 Act
        const result = await repository.findByFilter(filter);

        // ✅ Assert
        expect(result.data).toHaveLength(1);
        expect(result.data[0].name).toContain('Draft');
      });
    });
  });

  describe('统计操作测试', () => {
    beforeEach(async () => {
      // 创建测试数据
      const plans = [
        new PlanEntity({ name: 'Stats Plan 1', status: 'active', priority: 'high', contextId: 'ctx-stats-1' }),
        new PlanEntity({ name: 'Stats Plan 2', status: 'active', priority: 'medium', contextId: 'ctx-stats-2' }),
        new PlanEntity({ name: 'Stats Plan 3', status: 'completed', priority: 'low', contextId: 'ctx-stats-1' })
      ];

      for (const plan of plans) {
        await repository.save(plan);
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
    });

    describe('countByPriority功能测试', () => {
      it('应该根据优先级统计数量', async () => {
        // 🎬 Act
        const highCount = await repository.countByPriority('high');
        const mediumCount = await repository.countByPriority('medium');

        // ✅ Assert
        expect(highCount).toBe(1);
        expect(mediumCount).toBe(1);
      });
    });

    describe('countByContextId功能测试', () => {
      it('应该根据Context ID统计数量', async () => {
        // 🎬 Act
        const ctx1Count = await repository.countByContextId('ctx-stats-1');
        const ctx2Count = await repository.countByContextId('ctx-stats-2');

        // ✅ Assert
        expect(ctx1Count).toBe(2);
        expect(ctx2Count).toBe(1);
      });
    });
  });

  describe('业务特定操作测试', () => {
    beforeEach(async () => {
      // 创建测试数据
      const plans = [
        new PlanEntity({ name: 'Active Plan', status: 'active', priority: 'critical', contextId: 'ctx-biz-1' }),
        new PlanEntity({ name: 'Approved Plan', status: 'approved', priority: 'high', contextId: 'ctx-biz-2' }),
        new PlanEntity({ name: 'Completed Plan', status: 'completed', priority: 'medium', contextId: 'ctx-biz-3' }),
        new PlanEntity({ name: 'Draft Plan', status: 'draft', priority: 'low', contextId: 'ctx-biz-4' })
      ];

      for (const plan of plans) {
        await repository.save(plan);
      }
    });

    it('应该查找活跃的Plan', async () => {
      // 🎬 Act
      const result = await repository.findActivePlans();

      // ✅ Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('active');
    });

    it('应该查找可执行的Plan', async () => {
      // 🎬 Act
      const result = await repository.findExecutablePlans();

      // ✅ Assert
      expect(result.data).toHaveLength(2);
      expect(result.data.every(plan => 
        plan.status === 'approved' || plan.status === 'active'
      )).toBe(true);
    });

    it('应该查找已完成的Plan', async () => {
      // 🎬 Act
      const result = await repository.findCompletedPlans();

      // ✅ Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('completed');
    });

    it('应该查找高优先级Plan', async () => {
      // 🎬 Act
      const result = await repository.findHighPriorityPlans();

      // ✅ Assert
      expect(result.data).toHaveLength(2);
      expect(result.data.every(plan => 
        plan.priority === 'critical' || plan.priority === 'high'
      )).toBe(true);
    });
  });

  describe('批量操作测试', () => {
    it('应该支持批量保存Plan', async () => {
      // 📋 Arrange
      const plans = [
        new PlanEntity({ name: 'Batch Plan 1', contextId: 'ctx-batch-1' }),
        new PlanEntity({ name: 'Batch Plan 2', contextId: 'ctx-batch-2' }),
        new PlanEntity({ name: 'Batch Plan 3', contextId: 'ctx-batch-3' })
      ];

      // 🎬 Act
      const result = await repository.saveMany(plans);

      // ✅ Assert
      expect(result).toHaveLength(3);
      expect(result.every(plan => plan.name.startsWith('Batch Plan'))).toBe(true);
    });

    it('应该支持批量删除Plan', async () => {
      // 📋 Arrange
      const plans = [
        new PlanEntity({ name: 'Delete Plan 1', contextId: 'ctx-del-1' }),
        new PlanEntity({ name: 'Delete Plan 2', contextId: 'ctx-del-2' })
      ];

      for (const plan of plans) {
        await repository.save(plan);
      }

      const planIds = plans.map(plan => plan.planId);

      // 🎬 Act
      const deletedCount = await repository.deleteMany(planIds);

      // ✅ Assert
      expect(deletedCount).toBe(2);

      // 验证已删除
      for (const planId of planIds) {
        const exists = await repository.exists(planId);
        expect(exists).toBe(false);
      }
    });

    it('应该支持批量状态更新', async () => {
      // 📋 Arrange
      const plans = [
        new PlanEntity({ name: 'Status Plan 1', status: 'draft', contextId: 'ctx-status-1' }),
        new PlanEntity({ name: 'Status Plan 2', status: 'draft', contextId: 'ctx-status-2' })
      ];

      for (const plan of plans) {
        await repository.save(plan);
      }

      const planIds = plans.map(plan => plan.planId);

      // 🎬 Act
      const updatedCount = await repository.updateStatusMany(planIds, 'active');

      // ✅ Assert
      expect(updatedCount).toBe(2);

      // 验证状态已更新
      for (const planId of planIds) {
        const plan = await repository.findById(planId);
        expect(plan!.status).toBe('active');
      }
    });
  });

  describe('事务操作测试', () => {
    it('应该支持事务操作', async () => {
      // 📋 Arrange
      const plan1 = new PlanEntity({ name: 'Transaction Plan 1', contextId: 'ctx-tx-1' });
      const plan2 = new PlanEntity({ name: 'Transaction Plan 2', contextId: 'ctx-tx-2' });

      // 🎬 Act
      const result = await repository.transaction(async (txRepo) => {
        await txRepo.save(plan1);
        await txRepo.save(plan2);
        return await txRepo.count();
      });

      // ✅ Assert
      expect(result).toBe(2);

      // 验证事务外也能看到数据
      const count = await repository.count();
      expect(count).toBe(2);
    });

    it('应该在事务失败时回滚', async () => {
      // 📋 Arrange
      const plan = new PlanEntity({ name: 'Rollback Plan', contextId: 'ctx-rollback' });
      await repository.save(plan);
      const initialCount = await repository.count();

      // 🎬 Act & Assert
      await expect(repository.transaction(async (txRepo) => {
        await txRepo.save(new PlanEntity({ name: 'New Plan', contextId: 'ctx-new' }));
        throw new Error('Transaction failed');
      })).rejects.toThrow('Transaction failed');

      // 验证回滚
      const finalCount = await repository.count();
      expect(finalCount).toBe(initialCount);
    });
  });
});
