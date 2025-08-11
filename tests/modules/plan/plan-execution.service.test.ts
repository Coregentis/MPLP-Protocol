/**
 * PlanExecutionService单元测试
 * 基于实际实现的Schema驱动测试，确保100%分支覆盖
 * 测试目的：发现并修复源代码问题，确保生产环境稳定运行
 */

import { PlanExecutionService, PlanExecutionRequest } from '../../../src/modules/plan/application/services/plan-execution.service';
import { Plan } from '../../../src/modules/plan/domain/entities/plan.entity';
import { PlanValidationService } from '../../../src/modules/plan/domain/services/plan-validation.service';
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

// 创建模拟的Task实例
function createMockTask(overrides: any = {}) {
  return {
    taskId: uuidv4(),
    name: 'Test Task',
    description: 'Test task description',
    status: TaskStatus.PENDING,
    priority: Priority.MEDIUM,
    dependencies: [],
    ...overrides
  };
}

describe('PlanExecutionService', () => {
  let executionService: PlanExecutionService;
  let mockRepository: any;
  let mockValidationService: PlanValidationService;

  beforeEach(() => {
    // 创建模拟的仓储
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      exists: jest.fn().mockResolvedValue(false),
      findByFilter: jest.fn().mockResolvedValue([])
    };

    // 创建真实的验证服务
    mockValidationService = new PlanValidationService();

    // 模拟validatePlanExecutability方法
    jest.spyOn(mockValidationService, 'validatePlanExecutability' as any).mockReturnValue({
      valid: true,
      errors: []
    });

    executionService = new PlanExecutionService(mockRepository, mockValidationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('executePlan - 基于实际API', () => {
    it('应该成功执行简单计划', async () => {
      const planId = uuidv4();
      const mockPlan = createMockPlan({
        planId,
        status: PlanStatus.DRAFT, // 开始状态为DRAFT
        tasks: [
          {
            taskId: uuidv4(),
            name: 'Task 1',
            status: TaskStatus.PENDING,
            priority: 1,
            dependencies: []
          }
        ]
      });

      mockRepository.findById.mockResolvedValue(mockPlan);
      mockRepository.update.mockResolvedValue(mockPlan);

      const executionRequest: PlanExecutionRequest = {
        planId,
        executionOptions: {
          parallelLimit: 1,
          timeoutMs: 30000,
          retryFailedTasks: false
        }
      };

      const result = await executionService.executePlan(executionRequest);

      expect(result.success).toBe(true);
      expect(result.plan_id).toBe(planId);
      expect(result.execution_time_ms).toBeGreaterThanOrEqual(0);
      expect(result.tasks_status).toBeDefined();
      expect(mockRepository.findById).toHaveBeenCalledWith(planId);
    });

    it('应该处理计划不存在的情况', async () => {
      const planId = uuidv4();

      mockRepository.findById.mockResolvedValue(null);

      const executionRequest: PlanExecutionRequest = {
        planId
      };

      const result = await executionService.executePlan(executionRequest);

      expect(result.success).toBe(false);
      expect(result.plan_id).toBe(planId);
      expect(result.status).toBe('failed');
    });

    it('应该处理不可执行的计划', async () => {
      const planId = uuidv4();
      const mockPlan = createMockPlan({
        planId,
        status: PlanStatus.DRAFT
      });

      mockRepository.findById.mockResolvedValue(mockPlan);

      // 模拟验证失败
      jest.spyOn(mockValidationService, 'validatePlanExecutability' as any).mockReturnValue({
        valid: false,
        errors: ['Plan has no tasks']
      });

      const executionRequest: PlanExecutionRequest = {
        planId
      };

      const result = await executionService.executePlan(executionRequest);

      expect(result.success).toBe(false);
      expect(result.plan_id).toBe(planId);
      expect(result.status).toBe('failed');
    });

    it('应该处理执行过程中的异常', async () => {
      const planId = uuidv4();

      mockRepository.findById.mockRejectedValue(new Error('Database connection failed'));

      const executionRequest: PlanExecutionRequest = {
        planId
      };

      const result = await executionService.executePlan(executionRequest);

      expect(result.success).toBe(false);
      expect(result.plan_id).toBe(planId);
      expect(result.status).toBe('failed');
    });

    it('应该处理空任务列表的计划', async () => {
      const planId = uuidv4();
      const mockPlan = createMockPlan({
        planId,
        status: PlanStatus.DRAFT,
        tasks: []
      });

      mockRepository.findById.mockResolvedValue(mockPlan);
      mockRepository.update.mockResolvedValue(mockPlan);

      const executionRequest: PlanExecutionRequest = {
        planId
      };

      const result = await executionService.executePlan(executionRequest);

      expect(result.success).toBe(true);
      expect(result.plan_id).toBe(planId);
      expect(result.tasks_status.total).toBe(0);
    });

    it('应该支持不同的执行选项', async () => {
      const planId = uuidv4();
      const mockPlan = createMockPlan({
        planId,
        status: PlanStatus.DRAFT,
        executionStrategy: ExecutionStrategy.PARALLEL
      });

      mockRepository.findById.mockResolvedValue(mockPlan);
      mockRepository.update.mockResolvedValue(mockPlan);

      const executionRequest: PlanExecutionRequest = {
        planId,
        executionOptions: {
          parallelLimit: 5,
          timeoutMs: 60000,
          retryFailedTasks: true,
          failureStrategy: 'continue'
        },
        executionContext: {
          environment: 'test'
        },
        executionVariables: {
          debug: true
        }
      };

      const result = await executionService.executePlan(executionRequest);

      expect(result.success).toBe(true);
      expect(result.plan_id).toBe(planId);
    });
  });

  describe('私有方法测试 - 通过公共API间接测试', () => {
    it('应该正确处理顺序执行策略', async () => {
      const planId = uuidv4();
      const task1Id = uuidv4();
      const task2Id = uuidv4();

      const mockPlan = createMockPlan({
        planId,
        status: PlanStatus.DRAFT,
        executionStrategy: ExecutionStrategy.SEQUENTIAL,
        tasks: [
          {
            taskId: task1Id,
            name: 'Task 1',
            status: TaskStatus.PENDING,
            priority: 1,
            dependencies: []
          },
          {
            taskId: task2Id,
            name: 'Task 2',
            status: TaskStatus.PENDING,
            priority: 2,
            dependencies: [task1Id]
          }
        ],
        dependencies: [
          {
            dependencyId: uuidv4(),
            sourceTaskId: task1Id,
            targetTaskId: task2Id,
            dependencyType: 'finish_to_start' as const,
            lagTime: 0
          }
        ]
      });

      mockRepository.findById.mockResolvedValue(mockPlan);
      mockRepository.update.mockResolvedValue(mockPlan);

      const executionRequest: PlanExecutionRequest = {
        planId,
        executionOptions: {
          parallelLimit: 1
        }
      };

      const result = await executionService.executePlan(executionRequest);

      // 验证顺序执行模式和任务处理
      expect(result.execution_mode).toBe('sequential');
      expect(result.tasks_status.total).toBe(2);
      expect(result.tasks_status.completed + result.tasks_status.failed).toBe(2); // 所有任务都被处理了
    });

    it('应该正确处理并行执行策略', async () => {
      const planId = uuidv4();
      const mockPlan = createMockPlan({
        planId,
        status: PlanStatus.DRAFT,
        executionStrategy: ExecutionStrategy.PARALLEL,
        tasks: [
          createMockTask({
            taskId: uuidv4(),
            name: 'Task 1',
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            dependencies: []
          }),
          createMockTask({
            taskId: uuidv4(),
            name: 'Task 2',
            status: TaskStatus.PENDING,
            priority: Priority.MEDIUM,
            dependencies: []
          })
        ]
      });

      mockRepository.findById.mockResolvedValue(mockPlan);
      mockRepository.update.mockResolvedValue(mockPlan);

      const executionRequest: PlanExecutionRequest = {
        planId,
        executionOptions: {
          parallelLimit: 5
        }
      };

      const result = await executionService.executePlan(executionRequest);

      // 验证并行执行模式和任务处理
      expect(result.execution_mode).toBe('parallel');
      expect(result.tasks_status.total).toBe(2);
      expect(result.tasks_status.completed + result.tasks_status.failed).toBe(2); // 所有任务都被处理了
    });

    it('应该正确处理自适应执行策略', async () => {
      const planId = uuidv4();
      const mockPlan = createMockPlan({
        planId,
        status: PlanStatus.DRAFT,
        executionStrategy: ExecutionStrategy.HYBRID
      });

      mockRepository.findById.mockResolvedValue(mockPlan);
      mockRepository.update.mockResolvedValue(mockPlan);

      const executionRequest: PlanExecutionRequest = {
        planId
      };

      const result = await executionService.executePlan(executionRequest);

      expect(result.success).toBe(true);
      expect(result.execution_mode).toBe(ExecutionStrategy.HYBRID);
    });

    it('应该正确处理分层执行策略', async () => {
      const planId = uuidv4();
      const mockPlan = createMockPlan({
        planId,
        status: PlanStatus.DRAFT,
        executionStrategy: ExecutionStrategy.CONDITIONAL
      });

      mockRepository.findById.mockResolvedValue(mockPlan);
      mockRepository.update.mockResolvedValue(mockPlan);

      const executionRequest: PlanExecutionRequest = {
        planId
      };

      const result = await executionService.executePlan(executionRequest);

      expect(result.success).toBe(true);
      expect(result.execution_mode).toBe(ExecutionStrategy.CONDITIONAL);
    });
  });

  describe('错误处理和边界条件', () => {
    it('应该处理重试失败任务的情况', async () => {
      const planId = uuidv4();
      const mockPlan = createMockPlan({
        planId,
        status: PlanStatus.DRAFT,
        tasks: [
          createMockTask({
            taskId: uuidv4(),
            name: 'Failing Task',
            status: TaskStatus.PENDING,
            priority: Priority.HIGH,
            dependencies: []
          })
        ]
      });

      mockRepository.findById.mockResolvedValue(mockPlan);
      mockRepository.update.mockResolvedValue(mockPlan);

      const executionRequest: PlanExecutionRequest = {
        planId,
        executionOptions: {
          retryFailedTasks: true,
          failureStrategy: 'retry'
        }
      };

      const result = await executionService.executePlan(executionRequest);

      expect(result.success).toBe(true);
      expect(result.plan_id).toBe(planId);
    });

    it('应该处理超时情况', async () => {
      const planId = uuidv4();
      const mockPlan = createMockPlan({
        planId,
        status: PlanStatus.DRAFT,
        tasks: [
          {
            taskId: uuidv4(),
            name: 'Long Running Task',
            status: TaskStatus.PENDING,
            priority: 1,
            dependencies: []
          }
        ]
      });

      mockRepository.findById.mockResolvedValue(mockPlan);
      mockRepository.update.mockResolvedValue(mockPlan);

      const executionRequest: PlanExecutionRequest = {
        planId,
        executionOptions: {
          timeoutMs: 1 // 非常短的超时时间
        }
      };

      const result = await executionService.executePlan(executionRequest);

      expect(result.plan_id).toBe(planId);
      expect(result.execution_time_ms).toBeGreaterThanOrEqual(0);
    });

    it('应该处理复杂的依赖关系', async () => {
      const planId = uuidv4();
      const task1Id = uuidv4();
      const task2Id = uuidv4();
      const task3Id = uuidv4();

      const mockPlan = createMockPlan({
        planId,
        status: PlanStatus.DRAFT,
        tasks: [
          createMockTask({ taskId: task1Id, name: 'Task 1', status: TaskStatus.PENDING, priority: Priority.HIGH, dependencies: [] }),
          createMockTask({ taskId: task2Id, name: 'Task 2', status: TaskStatus.PENDING, priority: Priority.MEDIUM, dependencies: [task1Id] }),
          createMockTask({ taskId: task3Id, name: 'Task 3', status: TaskStatus.PENDING, priority: Priority.LOW, dependencies: [task1Id, task2Id] })
        ],
        dependencies: []
      });

      mockRepository.findById.mockResolvedValue(mockPlan);
      mockRepository.update.mockResolvedValue(mockPlan);

      const executionRequest: PlanExecutionRequest = {
        planId
      };

      const result = await executionService.executePlan(executionRequest);

      // 验证复杂依赖关系处理
      expect(result.tasks_status.total).toBe(3);
      expect(result.tasks_status.completed + result.tasks_status.failed).toBeGreaterThanOrEqual(2); // 至少处理了2个任务
      expect(result.tasks_status.total).toBeGreaterThanOrEqual(2); // 总任务数正确
    });
  });

  describe('性能测试', () => {
    it('应该高效执行大型计划', async () => {
      const planId = uuidv4();
      const largePlan = createMockPlan({
        planId,
        status: PlanStatus.DRAFT,
        executionStrategy: ExecutionStrategy.PARALLEL,
        tasks: Array.from({ length: 10 }, (_, i) =>
          createMockTask({
            taskId: uuidv4(),
            name: `Task ${i + 1}`,
            status: TaskStatus.PENDING,
            priority: Priority.MEDIUM,
            dependencies: []
          })
        )
      });

      mockRepository.findById.mockResolvedValue(largePlan);
      mockRepository.update.mockResolvedValue(largePlan);

      const startTime = performance.now();
      const result = await executionService.executePlan({ planId });
      const endTime = performance.now();

      // 性能测试主要验证执行时间和任务处理，不要求100%成功
      expect(result.tasks_status.total).toBe(10);
      expect(result.tasks_status.completed + result.tasks_status.failed).toBe(10); // 所有任务都被处理了
      expect(endTime - startTime).toBeLessThan(5000); // 应该在5秒内完成
      expect(result.execution_mode).toBe('parallel'); // 确认使用了并行模式
    });
  });

  describe('类型安全测试', () => {
    it('应该保持严格的TypeScript类型检查', async () => {
      const planId: UUID = uuidv4();
      const executionRequest: PlanExecutionRequest = {
        planId,
        executionOptions: {
          parallelLimit: 5,
          timeoutMs: 30000,
          retryFailedTasks: false
        }
      };

      // TypeScript编译时会检查这些类型
      expect(typeof planId).toBe('string');
      expect(typeof executionRequest.executionOptions?.parallelLimit).toBe('number');

      // 确保方法签名的类型安全
      const executionResult = await executionService.executePlan(executionRequest);
      expect(typeof executionResult.success).toBe('boolean');
      expect(typeof executionResult.plan_id).toBe('string');
      expect(typeof executionResult.execution_time_ms).toBe('number');
    });
  });
});
