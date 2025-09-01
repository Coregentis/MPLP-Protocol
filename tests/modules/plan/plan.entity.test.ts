/**
 * Plan实体单元测试
 *
 * @description 基于实际接口的PlanEntity测试
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 * @pattern 与Context模块使用IDENTICAL的测试模式
 */

import { PlanEntity } from '../../../src/modules/plan/domain/entities/plan.entity';
import { PlanEntityData } from '../../../src/modules/plan/api/mappers/plan.mapper';

describe('PlanEntity测试', () => {

  describe('构造函数和基本属性测试', () => {
    it('应该正确创建Plan实体并设置所有属性', () => {
      // 📋 Arrange - 基于实际PlanEntity构造函数
      const planData: Partial<PlanEntityData> = {
        name: 'Test Plan',
        description: 'Test plan description',
        contextId: 'ctx-test-123',
        priority: 'high',
        tasks: [
          {
            taskId: 'task-1',
            name: 'Test Task',
            type: 'atomic',
            status: 'pending',
            priority: 'medium'
          }
        ]
      };

      // 🎬 Act
      const entity = new PlanEntity(planData);

      // ✅ Assert - 使用实际的getter属性
      expect(entity.name).toBe('Test Plan');
      expect(entity.description).toBe('Test plan description');
      expect(entity.contextId).toBe('ctx-test-123');
      expect(entity.status).toBe('draft'); // 默认值
      expect(entity.priority).toBe('high');
      expect(entity.protocolVersion).toBe('1.0.0'); // 默认值
      expect(entity.planId).toBeDefined(); // 自动生成
      expect(entity.timestamp).toBeDefined(); // 自动生成
      expect(entity.tasks).toHaveLength(1);
      expect(entity.tasks[0].name).toBe('Test Task');
    });

    it('应该正确处理最小化的Plan数据', () => {
      // 📋 Arrange - 最小化数据
      const minimalData: Partial<PlanEntityData> = {
        name: 'Minimal Plan'
      };

      // 🎬 Act
      const entity = new PlanEntity(minimalData);

      // ✅ Assert
      expect(entity.name).toBe('Minimal Plan');
      expect(entity.description).toBeUndefined();
      expect(entity.status).toBe('draft'); // 默认值
      expect(entity.priority).toBe('medium'); // 默认值
      expect(entity.protocolVersion).toBe('1.0.0'); // 默认值
      expect(entity.planId).toBeDefined(); // 自动生成
      expect(entity.timestamp).toBeDefined(); // 自动生成
      expect(entity.tasks).toHaveLength(0); // 默认空数组
    });

    it('应该在名称为空时抛出错误', () => {
      // 📋 Arrange
      const invalidData: Partial<PlanEntityData> = {
        name: ''
      };

      // 🎬 Act & Assert
      expect(() => new PlanEntity(invalidData)).toThrow('Plan name is required and cannot be empty');
    });

    it('应该在名称过长时抛出错误', () => {
      // 📋 Arrange
      const longName = 'a'.repeat(256);
      const invalidData: Partial<PlanEntityData> = {
        name: longName
      };

      // 🎬 Act & Assert
      expect(() => new PlanEntity(invalidData)).toThrow('Plan name cannot exceed 255 characters');
    });

    it('应该在描述过长时抛出错误', () => {
      // 📋 Arrange
      const longDescription = 'a'.repeat(2001);
      const invalidData: Partial<PlanEntityData> = {
        name: 'Valid Name',
        description: longDescription
      };

      // 🎬 Act & Assert
      expect(() => new PlanEntity(invalidData)).toThrow('Plan description cannot exceed 2000 characters');
    });
  });

  describe('状态管理功能测试', () => {
    let entity: PlanEntity;

    beforeEach(() => {
      entity = new PlanEntity({ name: 'Status Test Plan' });
    });

    it('应该成功激活计划', () => {
      // 🎬 Act
      const result = entity.activate();

      // ✅ Assert
      expect(result).toBe(true);
      expect(entity.status).toBe('active');
      expect(entity.updatedAt).toBeDefined();
    });

    it('应该成功暂停活跃的计划', () => {
      // 📋 Arrange
      entity.activate();

      // 🎬 Act
      const result = entity.pause();

      // ✅ Assert
      expect(result).toBe(true);
      expect(entity.status).toBe('paused');
    });

    it('应该成功完成活跃的计划', () => {
      // 📋 Arrange
      entity.activate();

      // 🎬 Act
      const result = entity.complete();

      // ✅ Assert
      expect(result).toBe(true);
      expect(entity.status).toBe('completed');
    });

    it('应该成功取消计划', () => {
      // 🎬 Act
      const result = entity.cancel();

      // ✅ Assert
      expect(result).toBe(true);
      expect(entity.status).toBe('cancelled');
    });

    it('应该在无效状态转换时返回false', () => {
      // 📋 Arrange - 设置为completed状态
      entity.activate();
      entity.complete();

      // 🎬 Act - 尝试从completed激活
      const result = entity.activate();

      // ✅ Assert
      expect(result).toBe(false);
      expect(entity.status).toBe('completed');
    });
  });

  describe('任务管理功能测试', () => {
    let entity: PlanEntity;

    beforeEach(() => {
      entity = new PlanEntity({ name: 'Task Management Test Plan' });
    });

    it('应该成功添加任务', () => {
      // 📋 Arrange
      const taskData = {
        name: 'New Task',
        type: 'atomic' as const,
        status: 'pending' as const,
        priority: 'high' as const
      };

      // 🎬 Act
      entity.addTask(taskData);

      // ✅ Assert
      expect(entity.tasks).toHaveLength(1);
      expect(entity.tasks[0].name).toBe('New Task');
      expect(entity.tasks[0].taskId).toBeDefined();
      expect(entity.updatedAt).toBeDefined();
    });

    it('应该成功移除任务', () => {
      // 📋 Arrange
      entity.addTask({
        name: 'Task to Remove',
        type: 'atomic',
        status: 'pending'
      });
      const taskId = entity.tasks[0].taskId;

      // 🎬 Act
      const result = entity.removeTask(taskId);

      // ✅ Assert
      expect(result).toBe(true);
      expect(entity.tasks).toHaveLength(0);
    });

    it('应该在移除不存在的任务时返回false', () => {
      // 📋 Arrange
      const nonExistentTaskId = 'non-existent-task-id';

      // 🎬 Act
      const result = entity.removeTask(nonExistentTaskId);

      // ✅ Assert
      expect(result).toBe(false);
      expect(entity.tasks).toHaveLength(0);
    });

    it('应该成功更新任务状态', () => {
      // 📋 Arrange
      entity.addTask({
        name: 'Task to Update',
        type: 'atomic',
        status: 'pending'
      });
      const taskId = entity.tasks[0].taskId;

      // 🎬 Act
      const result = entity.updateTaskStatus(taskId, 'completed');

      // ✅ Assert
      expect(result).toBe(true);
      expect(entity.tasks[0].status).toBe('completed');
    });

    it('应该在更新不存在的任务时返回false', () => {
      // 📋 Arrange
      const nonExistentTaskId = 'non-existent-task-id';

      // 🎬 Act
      const result = entity.updateTaskStatus(nonExistentTaskId, 'completed');

      // ✅ Assert
      expect(result).toBe(false);
    });
  });

  describe('进度计算功能测试', () => {
    let entity: PlanEntity;

    beforeEach(() => {
      entity = new PlanEntity({ name: 'Progress Test Plan' });
    });

    it('应该在没有任务时返回0%进度', () => {
      // 🎬 Act
      const progress = entity.getProgress();

      // ✅ Assert
      expect(progress).toBe(0);
    });

    it('应该正确计算进度百分比', () => {
      // 📋 Arrange
      entity.addTask({ name: 'Task 1', type: 'atomic', status: 'completed' });
      entity.addTask({ name: 'Task 2', type: 'atomic', status: 'completed' });
      entity.addTask({ name: 'Task 3', type: 'atomic', status: 'pending' });
      entity.addTask({ name: 'Task 4', type: 'atomic', status: 'running' });

      // 🎬 Act
      const progress = entity.getProgress();

      // ✅ Assert
      expect(progress).toBe(50); // 2/4 = 50%
    });
  });

  describe('执行检查功能测试', () => {
    it('应该在approved状态时允许执行', () => {
      // 📋 Arrange
      const entity = new PlanEntity({
        name: 'Execution Test Plan',
        status: 'approved'
      });

      // 🎬 Act
      const canExecute = entity.canExecute();

      // ✅ Assert
      expect(canExecute).toBe(true);
    });

    it('应该在active状态时允许执行', () => {
      // 📋 Arrange
      const entity = new PlanEntity({ name: 'Active Plan' });
      entity.activate();

      // 🎬 Act
      const canExecute = entity.canExecute();

      // ✅ Assert
      expect(canExecute).toBe(true);
    });

    it('应该在draft状态时不允许执行', () => {
      // 📋 Arrange
      const entity = new PlanEntity({ name: 'Draft Plan' });

      // 🎬 Act
      const canExecute = entity.canExecute();

      // ✅ Assert
      expect(canExecute).toBe(false);
    });
  });

  describe('元数据管理功能测试', () => {
    let entity: PlanEntity;

    beforeEach(() => {
      entity = new PlanEntity({ name: 'Metadata Test Plan' });
    });

    it('应该成功更新元数据', () => {
      // 📋 Arrange
      const metadata = {
        category: 'test',
        priority: 'high',
        tags: ['testing', 'unit-test']
      };

      // 🎬 Act
      entity.updateMetadata(metadata);

      // ✅ Assert
      expect(entity.metadata).toEqual(metadata);
      expect(entity.updatedAt).toBeDefined();
    });

    it('应该合并现有元数据', () => {
      // 📋 Arrange
      entity.updateMetadata({ category: 'initial', version: '1.0' });
      const newMetadata = { category: 'updated', priority: 'high' };

      // 🎬 Act
      entity.updateMetadata(newMetadata);

      // ✅ Assert
      expect(entity.metadata).toEqual({
        category: 'updated',
        version: '1.0',
        priority: 'high'
      });
    });
  });

  describe('数据访问功能测试', () => {
    it('应该返回实体数据的深拷贝', () => {
      // 📋 Arrange
      const entity = new PlanEntity({
        name: 'Data Access Test Plan',
        tasks: [{ taskId: 'task-1', name: 'Test Task', type: 'atomic', status: 'pending' }]
      });

      // 🎬 Act
      const data = entity.toData();

      // ✅ Assert
      expect(data).not.toBe(entity); // 不是同一个对象
      expect(data.name).toBe(entity.name);
      expect(data.tasks).toEqual(entity.tasks);
      expect(data.tasks).not.toBe(entity.tasks); // 深拷贝
    });

    it('应该成功更新实体数据', () => {
      // 📋 Arrange
      const entity = new PlanEntity({ name: 'Update Test Plan' });
      const updates: Partial<PlanEntityData> = {
        name: 'Updated Plan Name',
        description: 'Updated description',
        priority: 'critical'
      };

      // 🎬 Act
      entity.update(updates);

      // ✅ Assert
      expect(entity.name).toBe('Updated Plan Name');
      expect(entity.description).toBe('Updated description');
      expect(entity.priority).toBe('critical');
      expect(entity.updatedAt).toBeDefined();
    });

    it('应该保护不可变字段', () => {
      // 📋 Arrange
      const entity = new PlanEntity({ name: 'Immutable Test Plan' });
      const originalPlanId = entity.planId;
      const originalContextId = entity.contextId;
      const originalCreatedAt = entity.createdAt;

      // 🎬 Act
      entity.update({
        planId: 'new-plan-id',
        contextId: 'new-context-id',
        createdAt: new Date(),
        name: 'Updated Name'
      } as Partial<PlanEntityData>);

      // ✅ Assert
      expect(entity.planId).toBe(originalPlanId); // 不变
      expect(entity.contextId).toBe(originalContextId); // 不变
      expect(entity.createdAt).toBe(originalCreatedAt); // 不变
      expect(entity.name).toBe('Updated Name'); // 已更新
    });
  });

  describe('不变量验证测试', () => {
    it('应该在任务ID重复时抛出错误', () => {
      // 📋 Arrange
      const duplicateTaskId = 'duplicate-task-id';
      const invalidData: Partial<PlanEntityData> = {
        name: 'Invalid Plan',
        tasks: [
          { taskId: duplicateTaskId, name: 'Task 1', type: 'atomic', status: 'pending' },
          { taskId: duplicateTaskId, name: 'Task 2', type: 'atomic', status: 'pending' }
        ]
      };

      // 🎬 Act & Assert
      expect(() => new PlanEntity(invalidData)).toThrow('Task IDs must be unique within a plan');
    });
  });
});
