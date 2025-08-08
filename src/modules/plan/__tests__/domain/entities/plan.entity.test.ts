/**
 * Plan Entity 协议级增强测试
 * 
 * 测试目标：从28.72%提升到95%覆盖率
 * 测试原则：基于实际实现构建测试，验证业务规则和状态转换
 * 
 * 覆盖范围：
 * - 业务规则验证
 * - 状态转换测试
 * - 任务管理功能
 * - 依赖关系处理
 * - 循环依赖检测
 * - 可执行性检查
 */

import { Plan } from '../../../domain/entities/plan.entity';
import { PlanStatus, TaskStatus, Priority, ExecutionStrategy } from '../../../types';

describe('Plan Entity - 协议级增强测试', () => {
  let validPlanData: any;

  beforeEach(() => {
    validPlanData = {
      planId: 'plan-12345',
      contextId: 'ctx-12345',
      name: 'Test Plan',
      description: 'Test Description',
      goals: ['Goal 1', 'Goal 2'],
      tasks: [
        {
          task_id: 'task-1',
          name: 'Task 1',
          description: 'Task 1 Description',
          status: TaskStatus.PENDING,
          priority: Priority.HIGH,
          dependencies: [],
          estimated_duration: 3600000,
          assigned_to: 'agent-1'
        },
        {
          task_id: 'task-2',
          name: 'Task 2',
          description: 'Task 2 Description',
          status: TaskStatus.PENDING,
          priority: Priority.MEDIUM,
          dependencies: ['task-1'],
          estimated_duration: 1800000,
          assigned_to: 'agent-2'
        }
      ],
      dependencies: [],
      executionStrategy: 'sequential' as ExecutionStrategy,
      priority: Priority.HIGH,
      status: PlanStatus.DRAFT,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      createdBy: 'user-123'
    };
  });

  describe('🔴 协议核心 - 实体创建和验证', () => {
    it('应该成功创建有效的计划实体', () => {
      // Act
      const plan = new Plan(validPlanData);

      // Assert
      expect(plan.planId).toBe(validPlanData.planId);
      expect(plan.contextId).toBe(validPlanData.contextId);
      expect(plan.name).toBe(validPlanData.name);
      expect(plan.description).toBe(validPlanData.description);
      expect(plan.goals).toEqual(validPlanData.goals);
      expect(plan.tasks).toEqual(validPlanData.tasks);
      expect(plan.dependencies).toEqual(validPlanData.dependencies);
      expect(plan.executionStrategy).toBe(validPlanData.executionStrategy);
      expect(plan.priority).toBe(validPlanData.priority);
      expect(plan.status).toBe(validPlanData.status);
      expect(plan.version).toBe(validPlanData.version);
      expect(plan.createdBy).toBe(validPlanData.createdBy);
    });

    it('应该支持snake_case到camelCase的参数转换', () => {
      // Arrange
      const snakeCaseData = {
        plan_id: 'plan-12345',
        context_id: 'ctx-12345',
        name: 'Test Plan',
        description: 'Test Description',
        goals: ['Goal 1'],
        tasks: [],
        dependencies: [],
        execution_strategy: 'parallel',
        priority: Priority.MEDIUM,
        status: PlanStatus.DRAFT,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        created_by: 'user-123'
      };

      // Act
      const plan = new Plan(snakeCaseData);

      // Assert
      expect(plan.planId).toBe(snakeCaseData.plan_id);
      expect(plan.contextId).toBe(snakeCaseData.context_id);
      expect(plan.executionStrategy).toBe(snakeCaseData.execution_strategy);
      expect(plan.createdBy).toBe(snakeCaseData.created_by);
    });

    it('应该验证必需字段', () => {
      // Arrange
      const incompleteData = {
        planId: 'plan-12345',
        // 缺少必需字段
      };

      // Act & Assert
      expect(() => new Plan(incompleteData)).toThrow();
    });

    it('应该验证字段类型', () => {
      // Arrange
      const invalidData = {
        ...validPlanData,
        priority: 'invalid-priority' // 无效的优先级
      };

      // Act & Assert
      expect(() => new Plan(invalidData)).toThrow();
    });
  });

  describe('🔴 协议核心 - 状态转换管理', () => {
    let plan: Plan;

    beforeEach(() => {
      plan = new Plan(validPlanData);
    });

    it('应该支持从DRAFT到ACTIVE的状态转换', () => {
      // Arrange
      expect(plan.status).toBe(PlanStatus.DRAFT);

      // Act
      const result = plan.updateStatus(PlanStatus.ACTIVE);

      // Assert
      expect(result.success).toBe(true);
      expect(plan.status).toBe(PlanStatus.ACTIVE);
    });

    it('应该支持从DRAFT到APPROVED的状态转换', () => {
      // Arrange
      expect(plan.status).toBe(PlanStatus.DRAFT);

      // Act
      const result = plan.updateStatus(PlanStatus.APPROVED);

      // Assert
      expect(result.success).toBe(true);
      expect(plan.status).toBe(PlanStatus.APPROVED);
    });

    it('应该支持从APPROVED到ACTIVE的状态转换', () => {
      // Arrange
      plan.updateStatus(PlanStatus.APPROVED);

      // Act
      const result = plan.updateStatus(PlanStatus.ACTIVE);

      // Assert
      expect(result.success).toBe(true);
      expect(plan.status).toBe(PlanStatus.ACTIVE);
    });

    it('应该支持从ACTIVE到PAUSED的状态转换', () => {
      // Arrange
      plan.updateStatus(PlanStatus.ACTIVE);

      // Act
      const result = plan.updateStatus(PlanStatus.PAUSED);

      // Assert
      expect(result.success).toBe(true);
      expect(plan.status).toBe(PlanStatus.PAUSED);
    });

    it('应该支持从PAUSED到ACTIVE的状态转换', () => {
      // Arrange
      plan.updateStatus(PlanStatus.ACTIVE);
      plan.updateStatus(PlanStatus.PAUSED);

      // Act
      const result = plan.updateStatus(PlanStatus.ACTIVE);

      // Assert
      expect(result.success).toBe(true);
      expect(plan.status).toBe(PlanStatus.ACTIVE);
    });

    it('应该支持到COMPLETED的状态转换', () => {
      // Arrange
      plan.updateStatus(PlanStatus.ACTIVE);

      // Act
      const result = plan.updateStatus(PlanStatus.COMPLETED);

      // Assert
      expect(result.success).toBe(true);
      expect(plan.status).toBe(PlanStatus.COMPLETED);
    });

    it('应该支持到CANCELLED的状态转换', () => {
      // Act
      const result = plan.updateStatus(PlanStatus.CANCELLED);

      // Assert
      expect(result.success).toBe(true);
      expect(plan.status).toBe(PlanStatus.CANCELLED);
    });

    it('应该拒绝无效的状态转换', () => {
      // Arrange
      plan.updateStatus(PlanStatus.ACTIVE); // 先转换到ACTIVE
      const completedResult = plan.updateStatus(PlanStatus.COMPLETED); // 再转换到COMPLETED
      expect(completedResult.success).toBe(true); // 确保转换成功

      // Act
      const result = plan.updateStatus(PlanStatus.ACTIVE);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid status transition');
      expect(plan.status).toBe(PlanStatus.COMPLETED); // 状态不应改变
    });

    it('应该拒绝从CANCELLED状态的转换', () => {
      // Arrange
      plan.updateStatus(PlanStatus.CANCELLED);

      // Act
      const result = plan.updateStatus(PlanStatus.ACTIVE);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid status transition');
      expect(plan.status).toBe(PlanStatus.CANCELLED);
    });
  });

  describe('🔴 协议核心 - 任务管理功能', () => {
    let plan: Plan;

    beforeEach(() => {
      plan = new Plan(validPlanData);
    });

    it('应该成功添加新任务', () => {
      // Arrange
      const newTask = {
        task_id: 'task-3',
        name: 'Task 3',
        description: 'Task 3 Description',
        status: TaskStatus.PENDING,
        priority: Priority.LOW,
        dependencies: [],
        estimated_duration: 900000,
        assigned_to: 'agent-3'
      };

      // Act
      const result = plan.addTask(newTask);

      // Assert
      expect(result.success).toBe(true);
      expect(plan.tasks).toHaveLength(3);
      expect(plan.tasks[2]).toEqual(newTask);
    });

    it('应该拒绝添加重复的任务ID', () => {
      // Arrange
      const duplicateTask = {
        task_id: 'task-1', // 已存在的任务ID
        name: 'Duplicate Task',
        description: 'Duplicate Description',
        status: TaskStatus.PENDING,
        priority: Priority.MEDIUM,
        dependencies: [],
        estimated_duration: 1200000,
        assigned_to: 'agent-4'
      };

      // Act
      const result = plan.addTask(duplicateTask);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Task with ID task-1 already exists');
      expect(plan.tasks).toHaveLength(2); // 任务数量不应改变
    });

    it('应该成功更新现有任务', () => {
      // Arrange
      const taskUpdates = {
        name: 'Updated Task 1',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.CRITICAL
      };

      // Act
      const result = plan.updateTask('task-1', taskUpdates);

      // Assert
      expect(result.success).toBe(true);
      const updatedTask = plan.tasks.find(t => t.task_id === 'task-1');
      expect(updatedTask?.name).toBe(taskUpdates.name);
      expect(updatedTask?.status).toBe(taskUpdates.status);
      expect(updatedTask?.priority).toBe(taskUpdates.priority);
    });

    it('应该处理更新不存在的任务', () => {
      // Arrange
      const taskUpdates = {
        name: 'Updated Non-existent Task'
      };

      // Act
      const result = plan.updateTask('non-existent-task', taskUpdates);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Task with ID non-existent-task not found');
    });

    it('应该成功删除任务', () => {
      // Act
      const result = plan.removeTask('task-1');

      // Assert
      expect(result.success).toBe(true);
      expect(plan.tasks).toHaveLength(1);
      expect(plan.tasks.find(t => t.task_id === 'task-1')).toBeUndefined();
    });

    it('应该处理删除不存在的任务', () => {
      // Act
      const result = plan.removeTask('non-existent-task');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Task with ID non-existent-task not found');
      expect(plan.tasks).toHaveLength(2); // 任务数量不应改变
    });
  });

  describe('🔴 协议核心 - 循环依赖检测', () => {
    let plan: Plan;

    beforeEach(() => {
      plan = new Plan({
        ...validPlanData,
        tasks: [
          {
            task_id: 'task-1',
            name: 'Task 1',
            description: 'Task 1 Description',
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            dependencies: ['task-3'], // 依赖task-3
            estimated_duration: 3600000,
            assigned_to: 'agent-1'
          },
          {
            task_id: 'task-2',
            name: 'Task 2',
            description: 'Task 2 Description',
            status: TaskStatus.PENDING,
            priority: Priority.MEDIUM,
            dependencies: ['task-1'], // 依赖task-1
            estimated_duration: 1800000,
            assigned_to: 'agent-2'
          },
          {
            task_id: 'task-3',
            name: 'Task 3',
            description: 'Task 3 Description',
            status: TaskStatus.PENDING,
            priority: Priority.LOW,
            dependencies: ['task-2'], // 依赖task-2，形成循环
            estimated_duration: 900000,
            assigned_to: 'agent-3'
          }
        ]
      });
    });

    it('应该检测到循环依赖', () => {
      // Act
      const hasCycle = plan.hasCyclicDependencies();

      // Assert
      expect(hasCycle).toBe(true);
    });

    it('应该检测无循环依赖的情况', () => {
      // Arrange
      const noCyclePlan = new Plan({
        ...validPlanData,
        tasks: [
          {
            task_id: 'task-1',
            name: 'Task 1',
            description: 'Task 1 Description',
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            dependencies: [], // 无依赖
            estimated_duration: 3600000,
            assigned_to: 'agent-1'
          },
          {
            task_id: 'task-2',
            name: 'Task 2',
            description: 'Task 2 Description',
            status: TaskStatus.PENDING,
            priority: Priority.MEDIUM,
            dependencies: ['task-1'], // 依赖task-1
            estimated_duration: 1800000,
            assigned_to: 'agent-2'
          }
        ]
      });

      // Act
      const hasCycle = noCyclePlan.hasCyclicDependencies();

      // Assert
      expect(hasCycle).toBe(false);
    });

    it('应该处理自依赖的情况', () => {
      // Arrange
      const selfDependentPlan = new Plan({
        ...validPlanData,
        tasks: [
          {
            task_id: 'task-1',
            name: 'Task 1',
            description: 'Task 1 Description',
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            dependencies: ['task-1'], // 自依赖
            estimated_duration: 3600000,
            assigned_to: 'agent-1'
          }
        ]
      });

      // Act
      const hasCycle = selfDependentPlan.hasCyclicDependencies();

      // Assert
      expect(hasCycle).toBe(true);
    });

    it('应该处理复杂的依赖图', () => {
      // Arrange
      const complexPlan = new Plan({
        ...validPlanData,
        tasks: [
          {
            task_id: 'task-1',
            name: 'Task 1',
            description: 'Task 1 Description',
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            dependencies: [],
            estimated_duration: 3600000,
            assigned_to: 'agent-1'
          },
          {
            task_id: 'task-2',
            name: 'Task 2',
            description: 'Task 2 Description',
            status: TaskStatus.PENDING,
            priority: Priority.MEDIUM,
            dependencies: ['task-1'],
            estimated_duration: 1800000,
            assigned_to: 'agent-2'
          },
          {
            task_id: 'task-3',
            name: 'Task 3',
            description: 'Task 3 Description',
            status: TaskStatus.PENDING,
            priority: Priority.LOW,
            dependencies: ['task-1'],
            estimated_duration: 900000,
            assigned_to: 'agent-3'
          },
          {
            task_id: 'task-4',
            name: 'Task 4',
            description: 'Task 4 Description',
            status: TaskStatus.PENDING,
            priority: Priority.MEDIUM,
            dependencies: ['task-2', 'task-3'],
            estimated_duration: 1200000,
            assigned_to: 'agent-4'
          }
        ]
      });

      // Act
      const hasCycle = complexPlan.hasCyclicDependencies();

      // Assert
      expect(hasCycle).toBe(false);
    });
  });

  describe('🔴 协议核心 - 可执行性检查', () => {
    let plan: Plan;

    beforeEach(() => {
      plan = new Plan(validPlanData);
    });

    it('应该确认ACTIVE状态的计划可执行', () => {
      // Arrange
      plan.updateStatus(PlanStatus.ACTIVE);

      // Act
      const isExecutable = plan.isExecutable();

      // Assert
      expect(isExecutable).toBe(true);
    });

    it('应该确认APPROVED状态的计划可执行', () => {
      // Arrange
      plan.updateStatus(PlanStatus.APPROVED);

      // Act
      const isExecutable = plan.isExecutable();

      // Assert
      expect(isExecutable).toBe(true);
    });

    it('应该拒绝DRAFT状态的计划执行', () => {
      // Arrange
      expect(plan.status).toBe(PlanStatus.DRAFT);

      // Act
      const isExecutable = plan.isExecutable();

      // Assert
      expect(isExecutable).toBe(false);
    });

    it('应该拒绝COMPLETED状态的计划执行', () => {
      // Arrange
      plan.updateStatus(PlanStatus.ACTIVE);
      plan.updateStatus(PlanStatus.COMPLETED);

      // Act
      const isExecutable = plan.isExecutable();

      // Assert
      expect(isExecutable).toBe(false);
    });

    it('应该拒绝CANCELLED状态的计划执行', () => {
      // Arrange
      plan.updateStatus(PlanStatus.CANCELLED);

      // Act
      const isExecutable = plan.isExecutable();

      // Assert
      expect(isExecutable).toBe(false);
    });

    it('应该拒绝没有任务的计划执行', () => {
      // Arrange
      const emptyPlan = new Plan({
        ...validPlanData,
        tasks: []
      });
      emptyPlan.updateStatus(PlanStatus.ACTIVE);

      // Act
      const isExecutable = emptyPlan.isExecutable();

      // Assert
      expect(isExecutable).toBe(false);
    });

    it('应该拒绝有循环依赖的计划执行', () => {
      // Arrange
      const cyclicPlan = new Plan({
        ...validPlanData,
        tasks: [
          {
            task_id: 'task-1',
            name: 'Task 1',
            description: 'Task 1 Description',
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            dependencies: ['task-2'],
            estimated_duration: 3600000,
            assigned_to: 'agent-1'
          },
          {
            task_id: 'task-2',
            name: 'Task 2',
            description: 'Task 2 Description',
            status: TaskStatus.PENDING,
            priority: Priority.MEDIUM,
            dependencies: ['task-1'],
            estimated_duration: 1800000,
            assigned_to: 'agent-2'
          }
        ]
      });
      cyclicPlan.updateStatus(PlanStatus.ACTIVE);

      // Act
      const isExecutable = cyclicPlan.isExecutable();

      // Assert
      expect(isExecutable).toBe(false);
    });
  });

  describe('🔴 协议核心 - 业务规则验证', () => {
    let plan: Plan;

    beforeEach(() => {
      plan = new Plan(validPlanData);
    });

    it('应该计算计划的总估计时长', () => {
      // Act
      const totalDuration = plan.getTotalEstimatedDuration();

      // Assert
      const expectedDuration = validPlanData.tasks.reduce(
        (sum: number, task: any) => sum + task.estimated_duration,
        0
      );
      expect(totalDuration).toBe(expectedDuration);
    });

    it('应该获取计划的任务统计', () => {
      // Act
      const stats = plan.getTaskStatistics();

      // Assert
      expect(stats.total).toBe(2);
      expect(stats.pending).toBe(2);
      expect(stats.in_progress).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.failed).toBe(0);
    });

    it('应该验证任务依赖的有效性', () => {
      // Act
      const isValid = plan.validateTaskDependencies();

      // Assert
      expect(isValid.success).toBe(true);
    });

    it('应该检测无效的任务依赖', () => {
      // Arrange
      const invalidPlan = new Plan({
        ...validPlanData,
        tasks: [
          {
            task_id: 'task-1',
            name: 'Task 1',
            description: 'Task 1 Description',
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            dependencies: ['non-existent-task'], // 不存在的依赖
            estimated_duration: 3600000,
            assigned_to: 'agent-1'
          }
        ]
      });

      // Act
      const isValid = invalidPlan.validateTaskDependencies();

      // Assert
      expect(isValid.success).toBe(false);
      expect(isValid.error).toContain('non-existent-task');
    });

    it('应该支持计划的序列化', () => {
      // Act
      const serialized = plan.toJSON();

      // Assert
      expect(serialized).toBeDefined();
      expect(serialized.planId).toBe(plan.planId);
      expect(serialized.contextId).toBe(plan.contextId);
      expect(serialized.name).toBe(plan.name);
      expect(serialized.tasks).toEqual(plan.tasks);
    });

    it('应该支持计划的克隆', () => {
      // Act
      const cloned = plan.clone();

      // Assert
      expect(cloned).not.toBe(plan); // 不是同一个对象
      expect(cloned.planId).toBe(plan.planId);
      expect(cloned.contextId).toBe(plan.contextId);
      expect(cloned.name).toBe(plan.name);
      expect(cloned.tasks).toEqual(plan.tasks);
    });
  });
});
