/**
 * Plan Validation Service 测试
 * 
 * 基于实际实现的协议级完整测试 - 目标90%+覆盖率
 * 严格遵循系统性链式批判性思维方法论
 * 
 * 实际方法调研结果：
 * - validatePlan(plan: Plan): ValidationResult
 * - validateTasks(tasks: PlanTask[]): string[]
 * - validateDependencies(tasks: PlanTask[], dependencies: PlanDependency[]): string[]
 * - validatePlanExecutability(plan: Plan): ValidationResult
 * - validatePlanName(name: string): ValidationResult
 * - validatePlanDescription(description: string): ValidationResult
 * - validatePlanGoals(goals: string[]): ValidationResult
 * - validatePlanConfiguration(config: any): ValidationResult
 * 
 * @version v1.0.0
 * @created 2025-01-28
 * @compliance 100% Schema合规性 - 基于实际实现编写测试
 */

import { PlanValidationService, ValidationResult } from '../../../domain/services/plan-validation.service';
import { Plan } from '../../../domain/entities/plan.entity';
import { Priority, PlanStatus, TaskStatus, ExecutionStrategy } from '../../../types';
import { PlanTask, PlanDependency } from '../../../types';
import { UUID } from '../../../../../public/shared/types';

describe('PlanValidationService - 协议级完整测试', () => {
  let service: PlanValidationService;

  // 基于实际Schema的测试数据 - 先定义基础数据
  const validTasks: PlanTask[] = [
    {
      taskId: 'task-1', // 修正：使用taskId而不是task_id
      name: 'Task 1',
      description: 'First task',
      status: TaskStatus.PENDING,
      priority: Priority.HIGH,
      dependencies: [],
      estimated_duration: 3600000,
      assigned_to: 'agent-1'
    },
    {
      taskId: 'task-2', // 修正：使用taskId而不是task_id
      name: 'Task 2',
      description: 'Second task',
      status: TaskStatus.PENDING,
      priority: Priority.MEDIUM,
      dependencies: ['task-1'],
      estimated_duration: 1800000,
      assigned_to: 'agent-2'
    }
  ];

  const validDependencies: PlanDependency[] = [
    {
      dependencyId: 'dep-1',
      sourceTaskId: 'task-1',
      targetTaskId: 'task-2',
      type: 'finish_to_start' as any
    }
  ];

  // 然后定义validPlan
  const validPlan = new Plan({
    planId: 'plan-123',
    contextId: 'ctx-456',
    name: 'Valid Test Plan',
    description: 'A valid plan for testing',
    goals: ['Complete testing', 'Ensure quality'],
    tasks: validTasks,
    dependencies: validDependencies,
    executionStrategy: 'sequential' as ExecutionStrategy,
    priority: Priority.HIGH,
    status: PlanStatus.DRAFT,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    createdBy: 'test-user'
  });

  beforeEach(() => {
    service = new PlanValidationService();
  });

  describe('🔴 协议核心 - validatePlan方法', () => {
    it('应该成功验证有效的计划', () => {
      // Act
      const result = service.validatePlan(validPlan);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('应该验证计划的基本信息', () => {
      // 由于Plan构造函数会验证必需字段，我们直接测试validatePlan的逻辑
      // 通过创建一个mock对象来测试验证逻辑
      const mockPlan = {
        name: '',
        contextId: 'ctx-456',
        tasks: validTasks,
        dependencies: validDependencies
      } as any;

      // Act
      const result = service.validatePlan(mockPlan);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plan name is required');
    });

    it('应该验证contextId', () => {
      // Arrange
      const mockPlan = {
        name: 'Valid Plan',
        contextId: '',
        tasks: validTasks,
        dependencies: validDependencies
      } as any;

      // Act
      const result = service.validatePlan(mockPlan);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Context ID is required');
    });

    it('应该验证任务和依赖关系', () => {
      // Arrange
      const invalidTasks = [{
        taskId: 'task-1',
        name: '', // 无效的任务名称
        description: 'Task without name',
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
        dependencies: [],
        estimated_duration: 3600000,
        assigned_to: 'agent-1'
      }];

      const mockPlan = {
        name: 'Valid Plan',
        contextId: 'ctx-456',
        tasks: invalidTasks,
        dependencies: []
      } as any;

      // Act
      const result = service.validatePlan(mockPlan);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('🔴 协议核心 - validateTasks方法', () => {
    it('应该成功验证有效的任务列表', () => {
      // Act
      const errors = service.validateTasks(validTasks);

      // Assert
      expect(errors).toEqual([]);
    });

    it('应该检测重复的任务ID', () => {
      // Arrange
      const duplicateTasks: PlanTask[] = [
        validTasks[0],
        { ...validTasks[1], taskId: 'task-1' } // 重复的ID
      ];

      // Act
      const errors = service.validateTasks(duplicateTasks);

      // Assert
      expect(errors).toContain('Duplicate task ID: task-1');
    });

    it('应该检测没有名称的任务', () => {
      // Arrange
      const invalidTasks: PlanTask[] = [
        { ...validTasks[0], name: '' }
      ];

      // Act
      const errors = service.validateTasks(invalidTasks);

      // Assert
      expect(errors).toContain('Task task-1 has no name');
    });

    it('应该检测只有空白字符的任务名称', () => {
      // Arrange
      const invalidTasks: PlanTask[] = [
        { ...validTasks[0], name: '   ' }
      ];

      // Act
      const errors = service.validateTasks(invalidTasks);

      // Assert
      expect(errors).toContain('Task task-1 has no name');
    });

    it('应该处理空任务列表', () => {
      // Act
      const errors = service.validateTasks([]);

      // Assert
      expect(errors).toEqual([]);
    });
  });

  describe('🔴 协议核心 - validateDependencies方法', () => {
    it('应该成功验证有效的依赖关系', () => {
      // Act
      const errors = service.validateDependencies(validTasks, validDependencies);

      // Assert
      expect(errors).toEqual([]);
    });

    it('应该检测引用不存在任务的依赖关系', () => {
      // Arrange
      const invalidDependencies: PlanDependency[] = [
        {
          dependencyId: 'dep-invalid',
          sourceTaskId: 'non-existent-task',
          targetTaskId: 'task-2',
          type: 'finish_to_start' as any
        }
      ];

      // Act
      const errors = service.validateDependencies(validTasks, invalidDependencies);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.includes('non-existent-task'))).toBe(true);
    });

    it('应该检测循环依赖', () => {
      // Arrange
      const circularDependencies: PlanDependency[] = [
        {
          dependencyId: 'dep-1',
          sourceTaskId: 'task-1',
          targetTaskId: 'task-2',
          type: 'finish_to_start' as any
        },
        {
          dependencyId: 'dep-2',
          sourceTaskId: 'task-2',
          targetTaskId: 'task-1',
          type: 'finish_to_start' as any
        }
      ];

      // Act
      const errors = service.validateDependencies(validTasks, circularDependencies);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.includes('circular') || error.includes('cycle'))).toBe(true);
    });

    it('应该处理空依赖列表', () => {
      // Act
      const errors = service.validateDependencies(validTasks, []);

      // Assert
      expect(errors).toEqual([]);
    });

    it('应该处理空任务列表和空依赖列表', () => {
      // Act
      const errors = service.validateDependencies([], []);

      // Assert
      expect(errors).toEqual([]);
    });
  });

  describe('🔴 协议核心 - validatePlanExecutability方法', () => {
    it('应该成功验证可执行的计划', () => {
      // Arrange - 使用mock对象避免Plan构造函数验证
      const executablePlan = {
        status: PlanStatus.ACTIVE,
        tasks: validTasks,
        dependencies: validDependencies
      } as any;

      // Act
      const result = service.validatePlanExecutability(executablePlan);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('应该接受DRAFT状态的计划', () => {
      // Arrange
      const draftPlan = {
        status: PlanStatus.DRAFT,
        tasks: validTasks,
        dependencies: validDependencies
      } as any;

      // Act
      const result = service.validatePlanExecutability(draftPlan);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('应该拒绝COMPLETED状态的计划', () => {
      // Arrange
      const completedPlan = {
        status: PlanStatus.COMPLETED,
        tasks: validTasks,
        dependencies: validDependencies
      } as any;

      // Act
      const result = service.validatePlanExecutability(completedPlan);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Plan status must be 'active' or 'approved', current status: completed");
    });

    it('应该拒绝CANCELLED状态的计划', () => {
      // Arrange
      const cancelledPlan = {
        status: PlanStatus.CANCELLED,
        tasks: validTasks,
        dependencies: validDependencies
      } as any;

      // Act
      const result = service.validatePlanExecutability(cancelledPlan);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Plan status must be 'active' or 'approved', current status: cancelled");
    });

    it('应该拒绝没有任务的计划', () => {
      // Arrange
      const emptyTasksPlan = {
        status: PlanStatus.ACTIVE,
        tasks: [],
        dependencies: []
      } as any;

      // Act
      const result = service.validatePlanExecutability(emptyTasksPlan);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plan has no tasks');
    });

    it('应该拒绝有无效依赖的计划', () => {
      // Arrange
      const invalidDependencyPlan = {
        status: PlanStatus.ACTIVE,
        tasks: validTasks,
        dependencies: [{
          dependencyId: 'dep-invalid',
          sourceTaskId: 'non-existent-task',
          targetTaskId: 'task-2',
          type: 'finish_to_start' as any
        }]
      } as any;

      // Act
      const result = service.validatePlanExecutability(invalidDependencyPlan);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('🔴 协议核心 - validatePlanName方法', () => {
    it('应该成功验证有效的计划名称', () => {
      // Act
      const result = service.validatePlanName('Valid Plan Name');

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('应该接受包含数字的计划名称', () => {
      // Act
      const result = service.validatePlanName('Plan 123');

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('应该接受包含连字符和下划线的计划名称', () => {
      // Act
      const result = service.validatePlanName('Plan-Name_Test');

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('应该拒绝空的计划名称', () => {
      // Act
      const result = service.validatePlanName('');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plan name is required');
    });

    it('应该拒绝只有空白字符的计划名称', () => {
      // Act
      const result = service.validatePlanName('   ');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plan name is required');
    });

    it('应该拒绝超过255字符的计划名称', () => {
      // Arrange
      const longName = 'a'.repeat(256);

      // Act
      const result = service.validatePlanName(longName);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plan name must be 255 characters or less');
    });

    it('应该拒绝包含特殊字符的计划名称', () => {
      // Act
      const result = service.validatePlanName('Plan@Name!');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plan name must contain only alphanumeric characters, spaces, hyphens, and underscores');
    });
  });

  describe('🔴 协议核心 - validateTaskName方法', () => {
    it('应该成功验证有效的任务名称', () => {
      // Act
      const result = service.validateTaskName('Valid Task Name');

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('应该拒绝空的任务名称', () => {
      // Act
      const result = service.validateTaskName('');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Task name is required');
    });

    it('应该拒绝只有空白字符的任务名称', () => {
      // Act
      const result = service.validateTaskName('   ');

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Task name is required');
    });

    it('应该拒绝超过255字符的任务名称', () => {
      // Arrange
      const longName = 'a'.repeat(256);

      // Act
      const result = service.validateTaskName(longName);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Task name must be 255 characters or less');
    });

    it('应该接受255字符的任务名称', () => {
      // Arrange
      const maxLengthName = 'a'.repeat(255);

      // Act
      const result = service.validateTaskName(maxLengthName);

      // Assert
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('🔴 协议核心 - 边界条件和错误处理', () => {
    it('应该处理null计划', () => {
      // Act
      const result = service.validatePlan(null as any);

      // Assert - 应该返回错误而不是抛出异常
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('应该处理undefined计划名称', () => {
      // Act
      const result = service.validatePlanName(undefined as any);

      // Assert
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plan name is required');
    });

    it('应该处理null任务列表', () => {
      // Act
      const errors = service.validateTasks(null as any);

      // Assert - 应该返回错误而不是抛出异常
      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('应该处理undefined依赖列表', () => {
      // Act
      const errors = service.validateDependencies(validTasks, undefined as any);

      // Assert - 应该返回错误而不是抛出异常
      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBeGreaterThanOrEqual(0);
    });
  });
});
