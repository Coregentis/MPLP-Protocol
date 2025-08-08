/**
 * PlanValidationService单元测试
 * 基于实际实现的Schema驱动测试，确保100%分支覆盖
 * 测试目的：发现并修复源代码问题，确保生产环境稳定运行
 */

import { PlanValidationService } from '../../../src/modules/plan/domain/services/plan-validation.service';
import { Plan } from '../../../src/modules/plan/domain/entities/plan.entity';
import { createDefaultPlanConfiguration } from '../../../src/modules/plan/domain/value-objects/plan-configuration.value-object';
import { UUID, PlanStatus, ExecutionStrategy, Priority, TaskStatus } from '../../../src/public/shared/types/plan-types';
import { v4 as uuidv4 } from 'uuid';

// 创建模拟的Plan实例
function createMockPlan(overrides: Partial<any> = {}): Plan {
  const planId = uuidv4();
  const contextId = uuidv4();

  const defaultPlan = {
    planId,
    contextId,
    name: 'Test Plan',
    description: 'Test plan description',
    status: PlanStatus.DRAFT,
    version: '1.0.0',
    goals: [],
    tasks: [],
    dependencies: [],
    executionStrategy: ExecutionStrategy.SEQUENTIAL,
    priority: Priority.MEDIUM,
    completionPercentage: 0,
    configuration: createDefaultPlanConfiguration(),
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };

  return new Plan(defaultPlan);
}

describe('PlanValidationService', () => {
  let validationService: PlanValidationService;

  beforeEach(() => {
    validationService = new PlanValidationService();
  });

  describe('validatePlan - 基于实际API', () => {
    it('应该验证有效的计划', () => {
      const plan = createMockPlan({
        name: 'Valid Plan',
        contextId: uuidv4(),
        tasks: [],
        dependencies: []
      });

      const result = validationService.validatePlan(plan);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('应该拒绝没有名称的计划', () => {
      const plan = createMockPlan({
        name: '',
        contextId: uuidv4()
      });

      const result = validationService.validatePlan(plan);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Plan name is required');
    });

    it('应该拒绝没有contextId的计划', () => {
      const plan = createMockPlan({
        name: 'Valid Plan',
        contextId: null
      });

      const result = validationService.validatePlan(plan);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Context ID is required');
    });

    it('应该验证包含任务的计划', () => {
      const taskId = uuidv4();
      const plan = createMockPlan({
        name: 'Plan with Tasks',
        contextId: uuidv4(),
        tasks: [{
          taskId,
          name: 'Valid Task',
          status: TaskStatus.PENDING,
          priority: 1,
          dependencies: []
        }]
      });

      const result = validationService.validatePlan(plan);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('validateTasks - 基于实际API', () => {
    it('应该验证有效的任务列表', () => {
      const tasks = [
        {
          taskId: uuidv4(),
          name: 'Task 1',
          status: TaskStatus.PENDING,
          priority: 1,
          dependencies: []
        },
        {
          taskId: uuidv4(),
          name: 'Task 2',
          status: TaskStatus.PENDING,
          priority: 2,
          dependencies: []
        }
      ];

      const errors = validationService.validateTasks(tasks);

      expect(errors).toEqual([]);
    });

    it('应该检测重复的任务ID', () => {
      const duplicateId = uuidv4();
      const tasks = [
        {
          taskId: duplicateId,
          name: 'Task 1',
          status: TaskStatus.PENDING,
          priority: 1,
          dependencies: []
        },
        {
          taskId: duplicateId, // 重复ID
          name: 'Task 2',
          status: TaskStatus.PENDING,
          priority: 2,
          dependencies: []
        }
      ];

      const errors = validationService.validateTasks(tasks);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.includes('Duplicate task ID'))).toBe(true);
    });

    it('应该检测没有名称的任务', () => {
      const tasks = [
        {
          taskId: uuidv4(),
          name: '', // 空名称
          status: TaskStatus.PENDING,
          priority: 1,
          dependencies: []
        }
      ];

      const errors = validationService.validateTasks(tasks);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.includes('has no name'))).toBe(true);
    });

    it('应该处理空任务列表', () => {
      const tasks: any[] = [];

      const errors = validationService.validateTasks(tasks);

      expect(errors).toEqual([]);
    });
  });

  describe('validateDependencies - 基于实际API', () => {
    it('应该验证有效的依赖关系', () => {
      const taskId1 = uuidv4();
      const taskId2 = uuidv4();

      const tasks = [
        {
          taskId: taskId1,
          name: 'Task 1',
          status: TaskStatus.PENDING,
          priority: 1,
          dependencies: []
        },
        {
          taskId: taskId2,
          name: 'Task 2',
          status: TaskStatus.PENDING,
          priority: 2,
          dependencies: []
        }
      ];

      const dependencies = [
        {
          dependencyId: uuidv4(),
          sourceTaskId: taskId1,
          targetTaskId: taskId2,
          dependencyType: 'finish_to_start' as const,
          lagTime: 0
        }
      ];

      const errors = validationService.validateDependencies(tasks, dependencies);

      expect(errors).toEqual([]);
    });

    it('应该检测重复的依赖ID', () => {
      const duplicateDepId = uuidv4();
      const taskId1 = uuidv4();
      const taskId2 = uuidv4();

      const tasks = [
        { taskId: taskId1, name: 'Task 1', status: TaskStatus.PENDING, priority: 1, dependencies: [] },
        { taskId: taskId2, name: 'Task 2', status: TaskStatus.PENDING, priority: 2, dependencies: [] }
      ];

      const dependencies = [
        {
          dependencyId: duplicateDepId,
          sourceTaskId: taskId1,
          targetTaskId: taskId2,
          dependencyType: 'finish_to_start' as const,
          lagTime: 0
        },
        {
          dependencyId: duplicateDepId, // 重复ID
          sourceTaskId: taskId2,
          targetTaskId: taskId1,
          dependencyType: 'finish_to_start' as const,
          lagTime: 0
        }
      ];

      const errors = validationService.validateDependencies(tasks, dependencies);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.includes('Duplicate dependency ID'))).toBe(true);
    });

    it('应该检测不存在的源任务', () => {
      const nonExistentTaskId = uuidv4();
      const taskId2 = uuidv4();

      const tasks = [
        { taskId: taskId2, name: 'Task 2', status: TaskStatus.PENDING, priority: 2, dependencies: [] }
      ];

      const dependencies = [
        {
          dependencyId: uuidv4(),
          sourceTaskId: nonExistentTaskId, // 不存在的任务
          targetTaskId: taskId2,
          dependencyType: 'finish_to_start' as const,
          lagTime: 0
        }
      ];

      const errors = validationService.validateDependencies(tasks, dependencies);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.includes('non-existent source task'))).toBe(true);
    });

    it('应该检测自引用依赖', () => {
      const taskId = uuidv4();

      const tasks = [
        { taskId, name: 'Task 1', status: TaskStatus.PENDING, priority: 1, dependencies: [] }
      ];

      const dependencies = [
        {
          dependencyId: uuidv4(),
          sourceTaskId: taskId,
          targetTaskId: taskId, // 自引用
          dependencyType: 'finish_to_start' as const,
          lagTime: 0
        }
      ];

      const errors = validationService.validateDependencies(tasks, dependencies);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.includes('Self-dependency detected'))).toBe(true);
    });

    it('应该处理空依赖列表', () => {
      const tasks = [
        { taskId: uuidv4(), name: 'Task 1', status: TaskStatus.PENDING, priority: 1, dependencies: [] }
      ];
      const dependencies: any[] = [];

      const errors = validationService.validateDependencies(tasks, dependencies);

      expect(errors).toEqual([]);
    });
  });

  describe('复合验证场景', () => {
    it('应该处理包含多个错误的计划', () => {
      const plan = createMockPlan({
        name: '', // 空名称
        contextId: null, // 空contextId
        tasks: [
          {
            taskId: uuidv4(),
            name: '', // 空任务名称
            status: TaskStatus.PENDING,
            priority: 1,
            dependencies: []
          }
        ]
      });

      const result = validationService.validatePlan(plan);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1); // 多个错误
      expect(result.errors).toContain('Plan name is required');
      expect(result.errors).toContain('Context ID is required');
    });

    it('应该验证复杂的任务依赖关系', () => {
      const taskId1 = uuidv4();
      const taskId2 = uuidv4();
      const taskId3 = uuidv4();

      const plan = createMockPlan({
        name: 'Complex Dependencies Plan',
        contextId: uuidv4(),
        tasks: [
          { taskId: taskId1, name: 'Task 1', status: TaskStatus.PENDING, priority: 1, dependencies: [] },
          { taskId: taskId2, name: 'Task 2', status: TaskStatus.PENDING, priority: 2, dependencies: [taskId1] },
          { taskId: taskId3, name: 'Task 3', status: TaskStatus.PENDING, priority: 3, dependencies: [taskId1, taskId2] }
        ],
        dependencies: [
          {
            dependencyId: uuidv4(),
            sourceTaskId: taskId1,
            targetTaskId: taskId2,
            dependencyType: 'finish_to_start' as const,
            lagTime: 0
          },
          {
            dependencyId: uuidv4(),
            sourceTaskId: taskId2,
            targetTaskId: taskId3,
            dependencyType: 'finish_to_start' as const,
            lagTime: 0
          }
        ]
      });

      const result = validationService.validatePlan(plan);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('性能测试', () => {
    it('应该高效验证大型计划', () => {
      const largePlan = createMockPlan({
        name: 'Large Performance Test Plan',
        contextId: uuidv4(),
        tasks: Array.from({ length: 100 }, (_, i) => ({
          taskId: uuidv4(),
          name: `Task ${i + 1}`,
          status: TaskStatus.PENDING,
          priority: i + 1,
          dependencies: []
        }))
      });

      const startTime = performance.now();
      const result = validationService.validatePlan(largePlan);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
      expect(result.valid).toBe(true);
    });

    it('应该高效处理批量验证', () => {
      const batchSize = 50;
      const plans = Array.from({ length: batchSize }, (_, i) =>
        createMockPlan({
          name: `Batch Plan ${i + 1}`,
          contextId: uuidv4()
        })
      );

      const startTime = performance.now();

      const results = plans.map(plan =>
        validationService.validatePlan(plan)
      );

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(results.length).toBe(batchSize);
      expect(results.every(r => r.valid)).toBe(true);
      expect(totalTime).toBeLessThan(500); // 应该在500ms内完成
    });
  });

  describe('边界条件测试', () => {
    it('应该处理极端情况', () => {
      // 测试非常长的名称
      const longName = 'A'.repeat(1000);
      const plan = createMockPlan({
        name: longName,
        contextId: uuidv4()
      });

      const result = validationService.validatePlan(plan);
      expect(result.valid).toBe(true);
    });

    it('应该处理特殊字符', () => {
      const specialCharsName = '特殊字符测试 !@#$%^&*()_+-=[]{}|;:,.<>?';
      const plan = createMockPlan({
        name: specialCharsName,
        contextId: uuidv4()
      });

      const result = validationService.validatePlan(plan);
      expect(result.valid).toBe(true);
    });
  });

  describe('类型安全测试', () => {
    it('应该保持严格的TypeScript类型检查', () => {
      const plan = createMockPlan();

      // TypeScript编译时会检查这些类型
      expect(typeof plan.planId).toBe('string');
      expect(typeof plan.contextId).toBe('string');
      expect(typeof plan.name).toBe('string');

      const result = validationService.validatePlan(plan);
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });
});
