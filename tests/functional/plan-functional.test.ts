/**
 * Plan模块功能场景测试
 * 
 * 基于实际功能实现的功能场景测试，确保90%功能场景覆盖率
 * 测试覆盖：计划创建验证、任务管理、依赖关系处理、执行控制、进度跟踪、资源分配、失败恢复、并行执行、动态调整、性能优化
 * 
 * @version 1.0.0
 * @created 2025-08-02
 */

import { Plan } from '../../src/modules/plan/domain/entities/plan.entity';
import { PlanFactoryService } from '../../src/modules/plan/domain/services/plan-factory.service';
import { PlanValidationService } from '../../src/modules/plan/domain/services/plan-validation.service';
import { PlanManagementService } from '../../src/modules/plan/application/services/plan-management.service';
import { createPlanTask } from '../../src/modules/plan/domain/value-objects/plan-task.value-object';
import { createPlanDependency } from '../../src/modules/plan/domain/value-objects/plan-dependency.value-object';
import { createPlanConfiguration } from '../../src/modules/plan/domain/value-objects/plan-configuration.value-object';
import { PlanStatus, TaskStatus, ExecutionStrategy, Priority } from '../../src/public/shared/types/plan-types';
import {
  CreatePlanRequest,
  UpdatePlanRequest,
  PlanOperationRequest,
  PlanSyncRequest,
  PlanAnalysisRequest,
  PlanExecutionRequest,
  PlanOptimizationRequest,
  PlanFilter,
  StatusOptions,
  PlanType,
} from '../../src/modules/plan/types';
import { v4 as uuidv4 } from 'uuid';

describe('Plan模块功能场景测试', () => {
  let planFactory: PlanFactoryService;
  let validationService: PlanValidationService;

  // 全局Mock变量，用于统一标准接口功能测试
  let planValidationService: jest.Mocked<PlanValidationService>;
  let planFactoryService: jest.Mocked<PlanFactoryService>;

  beforeEach(() => {
    planFactory = new PlanFactoryService();
    validationService = new PlanValidationService();

    // 创建Mock服务，用于统一标准接口功能测试
    planValidationService = {
      validateCreateRequest: jest.fn().mockReturnValue({ isValid: true, errors: [], warnings: [] }),
      validatePlan: jest.fn().mockReturnValue([]),
      validateUpdateRequest: jest.fn().mockReturnValue({ isValid: true, errors: [], warnings: [] })
    } as any;

    planFactoryService = {
      createPlan: jest.fn().mockReturnValue({
        name: 'Mock计划',
        type: 'basic',
        status: 'draft'
      }),
      createTask: jest.fn().mockReturnValue({
        name: 'Mock任务',
        type: 'basic',
        status: 'pending'
      })
    } as any;
  });

  describe('1. 计划创建和验证场景', () => {
    describe('正常创建场景', () => {
      it('应该成功创建基本计划', () => {
        const plan = planFactory.createPlan({
          context_id: uuidv4(),
          name: 'Test Plan',
          description: 'A test plan for functional testing'
        });

        expect(plan).toBeInstanceOf(Plan);
        expect(plan.name).toBe('Test Plan');
        expect(plan.description).toBe('A test plan for functional testing');
        expect(plan.status).toBe('draft');
        expect(plan.version).toBe('1.0.0');
        expect(plan.execution_strategy).toBe('sequential');
        expect(plan.priority).toBe('normal');
        expect(plan.goals).toEqual([]);
        expect(plan.tasks).toEqual([]);
        expect(plan.dependencies).toEqual([]);
        expect(plan.plan_id).toBeDefined();
        expect(plan.context_id).toBeDefined();
        expect(plan.created_at).toBeDefined();
        expect(plan.updated_at).toBeDefined();
      });

      it('应该成功创建带任务的计划', () => {
        const task1 = planFactory.createTask({
          name: 'Task 1',
          description: 'First task'
        });
        const task2 = planFactory.createTask({
          name: 'Task 2',
          description: 'Second task'
        });

        const plan = planFactory.createPlan({
          context_id: uuidv4(),
          name: 'Plan with Tasks',
          description: 'Plan containing multiple tasks',
          tasks: [task1, task2],
          goals: ['Complete all tasks', 'Deliver on time']
        });

        expect(plan.tasks).toHaveLength(2);
        expect(plan.goals).toHaveLength(2);
        expect(plan.progress.total_tasks).toBe(2);
        expect(plan.progress.completed_tasks).toBe(0);
        expect(plan.progress.percentage).toBe(0);
      });

      it('应该成功创建带配置的计划', () => {
        const configuration = createPlanConfiguration({
          execution_settings: {
            max_parallel_tasks: 5,
            timeout_ms: 60000,
            retry_policy: {
              max_retries: 3,
              backoff_ms: 1000
            }
          }
        });

        const plan = planFactory.createPlan({
          context_id: uuidv4(),
          name: 'Configured Plan',
          description: 'Plan with custom configuration',
          configuration,
          execution_strategy: 'parallel',
          priority: 'high'
        });

        expect(plan.execution_strategy).toBe('parallel');
        expect(plan.priority).toBe('high');
        expect(plan.configuration.execution_settings.max_parallel_tasks).toBe(5);
      });
    });

    describe('验证场景', () => {
      it('应该验证计划的基本信息', () => {
        const plan = planFactory.createPlan({
          context_id: uuidv4(),
          name: 'Valid Plan',
          description: 'A valid plan'
        });

        const validation = validationService.validatePlan(plan);
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      });

      it('应该拒绝创建空名称的计划（已修复源代码问题）', () => {
        // 基于实际实现：PlanFactoryService不会抛出错误，验证在ValidationService中进行
        const planWithEmptyName = planFactory.createPlan({
          context_id: uuidv4(),
          name: '',
          description: 'Plan with empty name'
        });

        // 验证服务会检测到错误
        const validation = validationService.validatePlan(planWithEmptyName);
        expect(validation.valid).toBe(false);
        expect(validation.errors).toContain('Plan name is required');

        // 验证正常计划
        const validPlan = planFactory.createPlan({
          context_id: uuidv4(),
          name: 'Valid Plan',
          description: 'Valid plan description'
        });
        const validValidation = validationService.validatePlan(validPlan);
        expect(validValidation.valid).toBe(true);
      });

      it('应该验证计划的可执行性', () => {
        const task = planFactory.createTask({
          name: 'Executable Task',
          description: 'A task that can be executed'
        });

        const plan = planFactory.createPlan({
          context_id: uuidv4(),
          name: 'Executable Plan',
          description: 'A plan that can be executed',
          status: 'approved',
          tasks: [task]
        });

        const validation = validationService.validatePlanExecutability(plan);
        expect(validation.valid).toBe(true);
        expect(validation.errors).toHaveLength(0);
      });

      it('应该拒绝没有任务的计划执行', () => {
        const plan = planFactory.createPlan({
          context_id: uuidv4(),
          name: 'Empty Plan',
          description: 'Plan without tasks',
          status: 'approved'
        });

        const validation = validationService.validatePlanExecutability(plan);
        expect(validation.valid).toBe(false);
        expect(validation.errors).toContain('Plan has no tasks');
      });
    });
  });

  describe('2. 任务管理场景', () => {
    let plan: Plan;

    beforeEach(() => {
      plan = planFactory.createPlan({
        context_id: uuidv4(),
        name: 'Task Management Plan',
        description: 'Plan for testing task management'
      });
    });

    describe('任务添加场景', () => {
      it('应该成功添加任务', () => {
        const task = planFactory.createTask({
          name: 'New Task',
          description: 'A newly added task'
        });

        plan.addTask(task);

        expect(plan.tasks).toHaveLength(1);
        expect(plan.tasks[0].name).toBe('New Task');
        expect(plan.progress.total_tasks).toBe(1);
      });

      it('应该拒绝添加重复ID的任务', () => {
        const taskId = uuidv4();
        const task1 = planFactory.createTask({
          task_id: taskId,
          name: 'Task 1',
          description: 'First task'
        });
        const task2 = planFactory.createTask({
          task_id: taskId,
          name: 'Task 2',
          description: 'Duplicate task'
        });

        plan.addTask(task1);

        expect(() => {
          plan.addTask(task2);
        }).toThrow(`Task with ID ${taskId} already exists`);
      });

      it('应该支持批量添加任务', () => {
        const tasks = Array.from({ length: 5 }, (_, i) => 
          planFactory.createTask({
            name: `Task ${i + 1}`,
            description: `Task number ${i + 1}`
          })
        );

        tasks.forEach(task => plan.addTask(task));

        expect(plan.tasks).toHaveLength(5);
        expect(plan.progress.total_tasks).toBe(5);
      });
    });

    describe('任务更新场景', () => {
      let taskId: string;

      beforeEach(() => {
        const task = planFactory.createTask({
          name: 'Updatable Task',
          description: 'A task that can be updated',
          status: 'pending'
        });
        taskId = task.task_id;
        plan.addTask(task);
      });

      it('应该成功更新任务状态', () => {
        const result = plan.updateTask(taskId, { status: 'in_progress' });

        expect(result).toBe(true);
        expect(plan.tasks[0].status).toBe('in_progress');
      });

      it('应该成功更新任务信息', () => {
        const result = plan.updateTask(taskId, {
          name: 'Updated Task Name',
          description: 'Updated description',
          priority: 'high'
        });

        expect(result).toBe(true);
        expect(plan.tasks[0].name).toBe('Updated Task Name');
        expect(plan.tasks[0].description).toBe('Updated description');
        expect(plan.tasks[0].priority).toBe('high');
      });

      it('应该拒绝更新不存在的任务', () => {
        const nonExistentId = uuidv4();
        const result = plan.updateTask(nonExistentId, { status: 'completed' });

        expect(result).toBe(false);
      });

      it('应该验证任务状态转换', () => {
        // 先将任务设为进行中状态，再设为完成状态
        const result1 = plan.updateTask(taskId, { status: 'in_progress' });
        expect(result1).toBe(true);

        const result2 = plan.updateTask(taskId, { status: 'completed' });
        expect(result2).toBe(true);
        expect(plan.tasks[0].status).toBe('completed');

        // 尝试从completed转换到pending（无效转换）
        const result3 = plan.updateTask(taskId, { status: 'pending' });

        expect(result3).toBe(false);
        expect(plan.tasks[0].status).toBe('completed');
      });
    });

    describe('进度计算场景', () => {
      it('应该正确计算进度', () => {
        const tasks = [
          planFactory.createTask({ name: 'Task 1', description: 'Task 1', status: 'completed' }),
          planFactory.createTask({ name: 'Task 2', description: 'Task 2', status: 'completed' }),
          planFactory.createTask({ name: 'Task 3', description: 'Task 3', status: 'in_progress' }),
          planFactory.createTask({ name: 'Task 4', description: 'Task 4', status: 'pending' })
        ];

        tasks.forEach(task => plan.addTask(task));

        expect(plan.progress.total_tasks).toBe(4);
        expect(plan.progress.completed_tasks).toBe(2);
        expect(plan.progress.percentage).toBe(50);
      });

      it('应该处理空任务列表的进度计算', () => {
        expect(plan.progress.total_tasks).toBe(0);
        expect(plan.progress.completed_tasks).toBe(0);
        expect(plan.progress.percentage).toBe(0);
      });

      it('应该在任务状态变更时自动重新计算进度', () => {
        const task = planFactory.createTask({
          name: 'Progress Task',
          description: 'Task for progress testing',
          status: 'pending'
        });
        plan.addTask(task);

        expect(plan.progress.percentage).toBe(0);

        // 先转换到in_progress，再转换到completed
        plan.updateTask(task.task_id, { status: 'in_progress' });
        plan.updateTask(task.task_id, { status: 'completed' });

        expect(plan.progress.percentage).toBe(100);
      });
    });
  });

  describe('3. 依赖关系处理场景', () => {
    let plan: Plan;
    let task1: any, task2: any, task3: any;

    beforeEach(() => {
      plan = planFactory.createPlan({
        context_id: uuidv4(),
        name: 'Dependency Plan',
        description: 'Plan for testing dependencies'
      });

      task1 = planFactory.createTask({ name: 'Task 1', description: 'First task' });
      task2 = planFactory.createTask({ name: 'Task 2', description: 'Second task' });
      task3 = planFactory.createTask({ name: 'Task 3', description: 'Third task' });

      plan.addTask(task1);
      plan.addTask(task2);
      plan.addTask(task3);
    });

    describe('依赖添加场景', () => {
      it('应该成功添加有效依赖', () => {
        const dependency = createPlanDependency({
          id: uuidv4(),
          source_task_id: task1.task_id,
          target_task_id: task2.task_id,
          dependency_type: 'finish_to_start'
        });

        const result = plan.addDependency(dependency);

        expect(result).toBe(true);
        expect(plan.dependencies).toHaveLength(1);
        expect(plan.dependencies[0].source_task_id).toBe(task1.task_id);
        expect(plan.dependencies[0].target_task_id).toBe(task2.task_id);
      });

      it('应该拒绝添加不存在任务的依赖', () => {
        const nonExistentTaskId = uuidv4();
        const dependency = createPlanDependency({
          id: uuidv4(),
          source_task_id: nonExistentTaskId,
          target_task_id: task2.task_id
        });

        const result = plan.addDependency(dependency);

        expect(result).toBe(false);
        expect(plan.dependencies).toHaveLength(0);
      });

      it('应该拒绝添加重复的依赖', () => {
        const dependency1 = createPlanDependency({
          id: uuidv4(),
          source_task_id: task1.task_id,
          target_task_id: task2.task_id
        });
        const dependency2 = createPlanDependency({
          id: uuidv4(),
          source_task_id: task1.task_id,
          target_task_id: task2.task_id
        });

        plan.addDependency(dependency1);
        const result = plan.addDependency(dependency2);

        expect(result).toBe(false);
        expect(plan.dependencies).toHaveLength(1);
      });

      it('应该检测并拒绝循环依赖', () => {
        // 创建循环依赖：task1 -> task2 -> task3 -> task1
        const dep1 = createPlanDependency({
          id: uuidv4(),
          source_task_id: task1.task_id,
          target_task_id: task2.task_id
        });
        const dep2 = createPlanDependency({
          id: uuidv4(),
          source_task_id: task2.task_id,
          target_task_id: task3.task_id
        });
        const dep3 = createPlanDependency({
          id: uuidv4(),
          source_task_id: task3.task_id,
          target_task_id: task1.task_id
        });

        plan.addDependency(dep1);
        plan.addDependency(dep2);
        const result = plan.addDependency(dep3);

        expect(result).toBe(false);
        expect(plan.dependencies).toHaveLength(2);
      });
    });

    describe('复杂依赖场景', () => {
      it('应该支持多种依赖类型', () => {
        const dependencies = [
          createPlanDependency({
            id: uuidv4(),
            source_task_id: task1.task_id,
            target_task_id: task2.task_id,
            dependency_type: 'finish_to_start'
          }),
          createPlanDependency({
            id: uuidv4(),
            source_task_id: task2.task_id,
            target_task_id: task3.task_id,
            dependency_type: 'start_to_start'
          })
        ];

        dependencies.forEach(dep => {
          const result = plan.addDependency(dep);
          expect(result).toBe(true);
        });

        expect(plan.dependencies).toHaveLength(2);
        expect(plan.dependencies[0].dependency_type).toBe('finish_to_start');
        expect(plan.dependencies[1].dependency_type).toBe('start_to_start');
      });

      it('应该支持关键性级别设置', () => {
        const criticalDep = createPlanDependency({
          id: uuidv4(),
          source_task_id: task1.task_id,
          target_task_id: task2.task_id,
          criticality: 'critical'
        });

        plan.addDependency(criticalDep);

        expect(plan.dependencies[0].criticality).toBe('critical');
      });
    });
  });

  describe('4. 执行控制场景', () => {
    let plan: Plan;

    beforeEach(() => {
      const task = planFactory.createTask({
        name: 'Execution Task',
        description: 'Task for execution testing'
      });

      plan = planFactory.createPlan({
        context_id: uuidv4(),
        name: 'Execution Plan',
        description: 'Plan for testing execution control',
        tasks: [task]
      });
    });

    describe('状态转换场景', () => {
      it('应该成功从draft转换到active', () => {
        expect(plan.status).toBe('draft');

        const result = plan.updateStatus('active');
        expect(result).toBe(true);
        expect(plan.status).toBe('active');
      });

      it('应该成功从draft转换到approved', () => {
        const result = plan.updateStatus('approved');
        expect(result).toBe(true);
        expect(plan.status).toBe('approved');
      });

      it('应该支持完整的状态转换流程', () => {
        // draft -> approved -> active -> completed -> archived
        expect(plan.updateStatus('approved')).toBe(true);
        expect(plan.updateStatus('active')).toBe(true);
        expect(plan.updateStatus('completed')).toBe(true);
        expect(plan.updateStatus('archived')).toBe(true);

        expect(plan.status).toBe('archived');
      });

      it('应该拒绝无效的状态转换', () => {
        // 尝试从draft直接转换到completed（无效）
        const result = plan.updateStatus('completed');
        expect(result).toBe(false);
        expect(plan.status).toBe('draft');
      });

      it('应该支持失败恢复流程', () => {
        plan.updateStatus('active');
        plan.updateStatus('failed');

        // 从failed可以回到draft或active
        expect(plan.updateStatus('draft')).toBe(true);
        expect(plan.status).toBe('draft');
      });
    });

    describe('可执行性检查场景', () => {
      it('应该检查计划的可执行性', () => {
        plan.updateStatus('approved');
        const result = plan.isExecutable();

        expect(result.executable).toBe(true);
        expect(result.reasons).toHaveLength(0);
      });

      it('应该拒绝draft状态的计划执行', () => {
        const result = plan.isExecutable();

        expect(result.executable).toBe(false);
        expect(result.reasons).toContain("Plan status must be 'active' or 'approved', current status: draft");
      });

      it('应该拒绝没有任务的计划执行', () => {
        const emptyPlan = planFactory.createPlan({
          context_id: uuidv4(),
          name: 'Empty Plan',
          description: 'Plan without tasks',
          status: 'approved'
        });

        const result = emptyPlan.isExecutable();

        expect(result.executable).toBe(false);
        expect(result.reasons).toContain('Plan has no tasks');
      });
    });
  });

  describe('5. 进度跟踪场景', () => {
    let plan: Plan;

    beforeEach(() => {
      plan = planFactory.createPlan({
        context_id: uuidv4(),
        name: 'Progress Tracking Plan',
        description: 'Plan for testing progress tracking'
      });
    });

    describe('实时进度更新场景', () => {
      it('应该实时更新进度', () => {
        const tasks = Array.from({ length: 10 }, (_, i) =>
          planFactory.createTask({
            name: `Task ${i + 1}`,
            description: `Task number ${i + 1}`,
            status: 'pending'
          })
        );

        tasks.forEach(task => plan.addTask(task));
        expect(plan.progress.percentage).toBe(0);

        // 完成前5个任务
        for (let i = 0; i < 5; i++) {
          plan.updateTask(tasks[i].task_id, { status: 'in_progress' });
          plan.updateTask(tasks[i].task_id, { status: 'completed' });
        }

        expect(plan.progress.completed_tasks).toBe(5);
        expect(plan.progress.percentage).toBe(50);

        // 完成剩余任务
        for (let i = 5; i < 10; i++) {
          plan.updateTask(tasks[i].task_id, { status: 'in_progress' });
          plan.updateTask(tasks[i].task_id, { status: 'completed' });
        }

        expect(plan.progress.completed_tasks).toBe(10);
        expect(plan.progress.percentage).toBe(100);
      });

      it('应该处理任务状态回退对进度的影响', () => {
        const task = planFactory.createTask({
          name: 'Rollback Task',
          description: 'Task for rollback testing',
          status: 'pending'
        });

        plan.addTask(task);

        // 先完成任务
        plan.updateTask(task.task_id, { status: 'in_progress' });
        plan.updateTask(task.task_id, { status: 'completed' });
        expect(plan.progress.percentage).toBe(100);

        // 由于completed状态不能转换到其他状态，我们测试failed状态的恢复
        const failedTask = planFactory.createTask({
          name: 'Failed Task',
          description: 'Task that will fail',
          status: 'pending'
        });

        plan.addTask(failedTask);
        plan.updateTask(failedTask.task_id, { status: 'in_progress' });
        plan.updateTask(failedTask.task_id, { status: 'failed' });

        // 现在有1个completed，1个failed，进度应该是50%
        expect(plan.progress.percentage).toBe(50);

        // 恢复失败的任务
        plan.updateTask(failedTask.task_id, { status: 'in_progress' });
        plan.updateTask(failedTask.task_id, { status: 'completed' });

        expect(plan.progress.percentage).toBe(100);
      });
    });

    describe('进度历史跟踪场景', () => {
      it('应该跟踪进度变化的时间戳', async () => {
        const task = planFactory.createTask({
          name: 'Timestamped Task',
          description: 'Task for timestamp testing'
        });

        const initialTime = plan.updated_at;

        // 等待1毫秒确保时间戳不同
        await new Promise(resolve => setTimeout(resolve, 1));

        plan.addTask(task);

        // 更新时间应该改变
        expect(plan.updated_at).not.toBe(initialTime);
      });
    });
  });

  describe('6. 资源分配场景', () => {
    let plan: Plan;

    beforeEach(() => {
      plan = planFactory.createPlan({
        context_id: uuidv4(),
        name: 'Resource Allocation Plan',
        description: 'Plan for testing resource allocation'
      });
    });

    describe('任务分配场景', () => {
      it('应该支持任务分配给特定执行者', () => {
        const task = planFactory.createTask({
          name: 'Assigned Task',
          description: 'Task with assignee',
          assignee: {
            id: uuidv4(),
            name: 'John Doe',
            role: 'developer'
          }
        });

        plan.addTask(task);

        expect(plan.tasks[0].assignee).toBeDefined();
        expect(plan.tasks[0].assignee!.name).toBe('John Doe');
        expect(plan.tasks[0].assignee!.role).toBe('developer');
      });

      it('应该支持资源需求定义', () => {
        const task = planFactory.createTask({
          name: 'Resource Task',
          description: 'Task with resource requirements',
          resource_requirements: [
            {
              resource_type: 'cpu',
              amount: 2,
              unit: 'cores',
              mandatory: true
            },
            {
              resource_type: 'memory',
              amount: 4,
              unit: 'GB',
              mandatory: true
            }
          ]
        });

        plan.addTask(task);

        expect(plan.tasks[0].resource_requirements).toHaveLength(2);
        expect(plan.tasks[0].resource_requirements![0].resource_type).toBe('cpu');
        expect(plan.tasks[0].resource_requirements![1].resource_type).toBe('memory');
      });
    });

    describe('并行执行配置场景', () => {
      it('应该支持并行执行策略配置', () => {
        const configuration = createPlanConfiguration({
          execution_settings: {
            max_parallel_tasks: 3,
            timeout_ms: 30000
          }
        });

        plan.updateConfiguration(configuration);

        expect(plan.configuration.execution_settings.max_parallel_tasks).toBe(3);
        expect(plan.configuration.execution_settings.timeout_ms).toBe(30000);
      });

      it('应该支持执行策略切换', () => {
        expect(plan.execution_strategy).toBe('sequential');

        // 通过工厂创建并行执行的计划
        const parallelPlan = planFactory.createPlan({
          context_id: uuidv4(),
          name: 'Parallel Plan',
          description: 'Plan with parallel execution',
          execution_strategy: 'parallel'
        });

        expect(parallelPlan.execution_strategy).toBe('parallel');
      });
    });
  });

  describe('7. 失败恢复场景', () => {
    let plan: Plan;

    beforeEach(() => {
      const task = planFactory.createTask({
        name: 'Recovery Task',
        description: 'Task for recovery testing'
      });

      plan = planFactory.createPlan({
        context_id: uuidv4(),
        name: 'Recovery Plan',
        description: 'Plan for testing failure recovery',
        tasks: [task]
      });
    });

    describe('计划级恢复场景', () => {
      it('应该支持从失败状态恢复', () => {
        plan.updateStatus('active');
        plan.updateStatus('failed');

        expect(plan.status).toBe('failed');

        // 从failed可以恢复到active
        const result = plan.updateStatus('active');
        expect(result).toBe(true);
        expect(plan.status).toBe('active');
      });

      it('应该支持从失败状态回到draft重新规划', () => {
        plan.updateStatus('active');
        plan.updateStatus('failed');

        const result = plan.updateStatus('draft');
        expect(result).toBe(true);
        expect(plan.status).toBe('draft');
      });
    });

    describe('任务级恢复场景', () => {
      it('应该支持失败任务的重试', () => {
        const task = plan.tasks[0];

        // 模拟任务执行失败
        plan.updateTask(task.task_id, { status: 'in_progress' });
        plan.updateTask(task.task_id, { status: 'failed' });

        expect(plan.tasks[0].status).toBe('failed');

        // 重试失败的任务
        const result = plan.updateTask(task.task_id, { status: 'pending' });
        expect(result).toBe(true);
        expect(plan.tasks[0].status).toBe('pending');
      });

      it('应该支持跳过失败的任务', () => {
        const task = plan.tasks[0];

        plan.updateTask(task.task_id, { status: 'failed' });
        const result = plan.updateTask(task.task_id, { status: 'skipped' });

        expect(result).toBe(true);
        expect(plan.tasks[0].status).toBe('skipped');
      });
    });

    describe('重试策略场景', () => {
      it('应该支持配置重试策略', () => {
        const configuration = createPlanConfiguration({
          execution_settings: {
            retry_policy: {
              max_retries: 5,
              backoff_ms: 2000
            }
          }
        });

        plan.updateConfiguration(configuration);

        expect(plan.configuration.execution_settings.retry_policy.max_retries).toBe(5);
        expect(plan.configuration.execution_settings.retry_policy.backoff_ms).toBe(2000);
      });
    });
  });

  describe('8. 并行执行场景', () => {
    let plan: Plan;

    beforeEach(() => {
      plan = planFactory.createPlan({
        context_id: uuidv4(),
        name: 'Parallel Execution Plan',
        description: 'Plan for testing parallel execution',
        execution_strategy: 'parallel'
      });
    });

    describe('并行任务管理场景', () => {
      it('应该支持并行任务执行', () => {
        const tasks = Array.from({ length: 5 }, (_, i) =>
          planFactory.createTask({
            name: `Parallel Task ${i + 1}`,
            description: `Parallel task number ${i + 1}`,
            status: 'ready'
          })
        );

        tasks.forEach(task => plan.addTask(task));

        // 模拟并行执行
        tasks.forEach(task => {
          plan.updateTask(task.task_id, { status: 'in_progress' });
        });

        const inProgressTasks = plan.tasks.filter(t => t.status === 'in_progress');
        expect(inProgressTasks).toHaveLength(5);
      });

      it('应该支持混合执行策略', () => {
        const hybridPlan = planFactory.createPlan({
          context_id: uuidv4(),
          name: 'Hybrid Plan',
          description: 'Plan with hybrid execution strategy',
          execution_strategy: 'hybrid'
        });

        expect(hybridPlan.execution_strategy).toBe('hybrid');
      });
    });

    describe('并发控制场景', () => {
      it('应该支持最大并行任务数限制', () => {
        const configuration = createPlanConfiguration({
          execution_settings: {
            max_parallel_tasks: 2
          }
        });

        plan.updateConfiguration(configuration);

        expect(plan.configuration.execution_settings.max_parallel_tasks).toBe(2);
      });
    });
  });

  describe('9. 动态调整场景', () => {
    let plan: Plan;

    beforeEach(() => {
      plan = planFactory.createPlan({
        context_id: uuidv4(),
        name: 'Dynamic Plan',
        description: 'Plan for testing dynamic adjustments'
      });
    });

    describe('运行时修改场景', () => {
      it('应该支持运行时添加新任务', () => {
        plan.updateStatus('active');

        const newTask = planFactory.createTask({
          name: 'Runtime Task',
          description: 'Task added during execution'
        });

        plan.addTask(newTask);

        expect(plan.tasks).toHaveLength(1);
        expect(plan.tasks[0].name).toBe('Runtime Task');
      });

      it('应该支持运行时修改计划配置', () => {
        plan.updateStatus('active');

        const newConfig = createPlanConfiguration({
          execution_settings: {
            timeout_ms: 60000
          }
        });

        plan.updateConfiguration(newConfig);

        expect(plan.configuration.execution_settings.timeout_ms).toBe(60000);
      });

      it('应该支持运行时更新元数据', () => {
        const metadata = {
          lastModified: new Date().toISOString(),
          modifiedBy: 'system',
          reason: 'dynamic adjustment'
        };

        plan.updateMetadata(metadata);

        expect(plan.metadata).toEqual(metadata);
      });
    });

    describe('优先级调整场景', () => {
      it('应该支持任务优先级动态调整', () => {
        const task = planFactory.createTask({
          name: 'Priority Task',
          description: 'Task for priority testing',
          priority: 'medium'
        });

        plan.addTask(task);

        const result = plan.updateTask(task.task_id, { priority: 'critical' });
        expect(result).toBe(true);
        expect(plan.tasks[0].priority).toBe('critical');
      });
    });
  });

  describe('10. 性能优化场景', () => {
    describe('大规模任务处理场景', () => {
      it('应该高效处理大量任务', () => {
        const plan = planFactory.createPlan({
          context_id: uuidv4(),
          name: 'Large Scale Plan',
          description: 'Plan with many tasks'
        });

        const startTime = Date.now();

        // 添加1000个任务
        for (let i = 0; i < 1000; i++) {
          const task = planFactory.createTask({
            name: `Task ${i + 1}`,
            description: `Task number ${i + 1}`
          });
          plan.addTask(task);
        }

        const endTime = Date.now();

        expect(plan.tasks).toHaveLength(1000);
        expect(endTime - startTime).toBeLessThan(5000); // 应该在5秒内完成
      });

      it('应该高效处理复杂依赖关系', () => {
        const plan = planFactory.createPlan({
          context_id: uuidv4(),
          name: 'Complex Dependencies Plan',
          description: 'Plan with complex dependencies'
        });

        // 创建100个任务
        const tasks = Array.from({ length: 100 }, (_, i) =>
          planFactory.createTask({
            name: `Task ${i + 1}`,
            description: `Task number ${i + 1}`
          })
        );

        tasks.forEach(task => plan.addTask(task));

        const startTime = Date.now();

        // 创建链式依赖
        for (let i = 0; i < 99; i++) {
          const dependency = createPlanDependency({
            id: uuidv4(),
            source_task_id: tasks[i].task_id,
            target_task_id: tasks[i + 1].task_id
          });
          plan.addDependency(dependency);
        }

        const endTime = Date.now();

        expect(plan.dependencies).toHaveLength(99);
        expect(endTime - startTime).toBeLessThan(2000); // 应该在2秒内完成
      });
    });

    describe('内存优化场景', () => {
      it('应该支持计划对象序列化', () => {
        const task = planFactory.createTask({
          name: 'Serializable Task',
          description: 'Task for serialization testing'
        });

        const plan = planFactory.createPlan({
          context_id: uuidv4(),
          name: 'Serializable Plan',
          description: 'Plan for serialization testing',
          tasks: [task]
        });

        const serialized = JSON.stringify(plan.toObject());
        const parsed = JSON.parse(serialized);

        expect(parsed.plan_id).toBe(plan.plan_id);
        expect(parsed.name).toBe(plan.name);
        expect(parsed.tasks).toHaveLength(1);
      });
    });
  });

  // ==================== 新增：统一标准接口测试 ====================

  describe('统一标准接口功能测试', () => {
    describe('1. 基础计划管理场景', () => {
      it('应该支持创建基础计划', async () => {
        // 用户场景：简单项目需要基础计划管理
        const createRequest: CreatePlanRequest = {
          name: '简单项目计划',
          description: '用于管理项目任务和进度',
          type: 'basic',
          capabilities: {
            planning: {
              taskManagement: true,
              dependencyTracking: true,
              progressMonitoring: true,
              resourceAllocation: false
            }
          }
        };

        // 基于实际构造函数创建Mock依赖
        const mockRepository = {} as any;
        const mockPlanValidationService = {
          validateCreateRequest: jest.fn().mockReturnValue({ isValid: true, errors: [], warnings: [] }),
          validatePlan: jest.fn().mockReturnValue([])
        } as any;
        const mockPlanFactoryService = {
          createPlan: jest.fn().mockReturnValue({
            name: '基础计划',
            type: 'basic',
            status: 'draft'
          })
        } as any;

        const planService = new PlanManagementService(
          mockRepository,
          mockPlanValidationService,
          mockPlanFactoryService
        );

        const result = await planService.createPlan(createRequest);

        expect(result.success).toBe(true);
        expect(result.data?.name).toBe('简单项目计划');
        expect(result.data?.type).toBe('basic');
        expect(result.data?.capabilities.planning.taskManagement).toBe(true);
        expect(result.data?.status).toBe('draft');
      });

      it('应该支持创建项目计划', async () => {
        // 用户场景：复杂项目需要完整的计划管理
        const createRequest: CreatePlanRequest = {
          name: 'TracePilot开发计划',
          description: 'DDSC项目的完整开发计划',
          type: 'project',
          capabilities: {
            planning: {
              taskManagement: true,
              dependencyTracking: true,
              progressMonitoring: true,
              resourceAllocation: true
            },
            orchestration: {
              autoDecomposition: true,
              dynamicScheduling: true,
              conflictResolution: true,
              adaptiveExecution: false
            },
            optimization: {
              timeOptimization: true,
              resourceOptimization: true,
              costOptimization: false,
              qualityOptimization: true
            },
            analytics: {
              progressAnalysis: true,
              riskAssessment: true,
              performancePrediction: false,
              bottleneckDetection: true
            }
          },
          configuration: {
            basic: {
              priority: 'high',
              timeout: 3600000,
              maxTasks: 50
            },
            orchestration: {
              schedulingStrategy: 'adaptive',
              conflictResolution: 'automatic',
              adaptationThreshold: 0.8
            }
          },
          tasks: [
            {
              name: '需求分析',
              description: '分析用户需求和系统要求',
              type: 'composite',
              priority: 'high',
              estimatedDuration: 7200,
              dependencies: []
            },
            {
              name: '架构设计',
              description: '设计系统架构和技术方案',
              type: 'composite',
              priority: 'high',
              estimatedDuration: 14400,
              dependencies: ['需求分析']
            }
          ]
        };

        const planService = new PlanManagementService(
          {} as any, // mockRepository
          planValidationService,
          planFactoryService
        );

        const result = await planService.createPlan(createRequest);

        expect(result.success).toBe(true);
        expect(result.data?.name).toBe('TracePilot开发计划');
        expect(result.data?.type).toBe('project');
        expect(result.data?.capabilities.orchestration?.autoDecomposition).toBe(true);
        expect(result.data?.capabilities.optimization?.timeOptimization).toBe(true);
        expect(result.data?.capabilities.analytics?.progressAnalysis).toBe(true);
      });
    });

    describe('2. 多Agent协作场景', () => {
      it('应该支持创建多Agent计划', async () => {
        // 用户场景：TracePilot多Agent协作需要计划协调
        const createRequest: CreatePlanRequest = {
          name: 'DDSC多Agent协作计划',
          type: 'multi_agent',
          capabilities: {
            planning: {
              taskManagement: true,
              dependencyTracking: true,
              progressMonitoring: true,
              resourceAllocation: true
            },
            collaboration: {
              multiAgent: true,
              taskDistribution: true,
              progressSync: true,
              workloadBalancing: true
            },
            orchestration: {
              autoDecomposition: true,
              dynamicScheduling: true,
              conflictResolution: true,
              adaptiveExecution: true
            }
          },
          configuration: {
            collaboration: {
              maxAgents: 5,
              loadBalancingStrategy: 'capability_based',
              syncInterval: 5000
            }
          }
        };

        const planService = new PlanManagementService(
          {} as any, // mockRepository
          planValidationService,
          planFactoryService
        );

        const result = await planService.createPlan(createRequest);

        expect(result.success).toBe(true);
        expect(result.data?.type).toBe('multi_agent');
        expect(result.data?.capabilities.collaboration?.multiAgent).toBe(true);
        expect(result.data?.capabilities.collaboration?.taskDistribution).toBe(true);
        expect(result.data?.capabilities.orchestration?.autoDecomposition).toBe(true);
      });

      it('应该支持计划同步操作', async () => {
        const planId = uuidv4();
        const syncRequest: PlanSyncRequest = {
          planId,
          targetPlans: [uuidv4(), uuidv4()],
          syncMode: 'incremental',
          conflictResolution: 'merge',
          options: {
            timeout: 30000,
            retryCount: 3,
            validateAfterSync: true
          }
        };

        const planService = new PlanManagementService(
          {} as any, // mockRepository
          planValidationService,
          planFactoryService
        );

        const result = await planService.syncPlan(syncRequest);

        expect(result.success).toBe(true);
        expect(result.data?.planId).toBe(planId);
        expect(result.data?.syncStatus).toBe('synchronized');
        expect(result.data?.conflicts).toEqual([]);
      });
    });

    describe('3. 计划操作场景', () => {
      it('应该支持启动计划操作', async () => {
        const planId = uuidv4();
        const operationRequest: PlanOperationRequest = {
          planId,
          operation: {
            type: 'start',
            conditions: { readyTasks: 3 }
          },
          options: {
            enableAnalysis: true,
            syncMode: 'immediate'
          }
        };

        const planService = new PlanManagementService(
          {} as any, // mockRepository
          planValidationService,
          planFactoryService
        );

        const result = await planService.operatePlan(operationRequest);

        expect(result.success).toBe(true);
        expect(result.result.operation).toBe('start');
        expect(result.result.status).toBe('completed');
        expect(result.planState?.version).toBeGreaterThan(0);
        expect(result.metadata.capabilitiesUsed).toContain('planning');
      });

      it('应该支持优化计划操作', async () => {
        const planId = uuidv4();
        const operationRequest: PlanOperationRequest = {
          planId,
          operation: {
            type: 'optimize',
            data: {
              optimizationType: ['time', 'resources'],
              constraints: { maxDuration: 86400 }
            }
          },
          options: {
            enableAnalysis: false,
            syncMode: 'eventual'
          }
        };

        const planService = new PlanManagementService(
          {} as any, // mockRepository
          planValidationService,
          planFactoryService
        );

        const result = await planService.operatePlan(operationRequest);

        expect(result.success).toBe(true);
        expect(result.result.operation).toBe('optimize');
        expect(result.result.data).toEqual(operationRequest.operation.data);
        expect(result.metadata.resourceUsage.memory).toBeGreaterThan(0);
      });
    });

    describe('4. 计划状态管理', () => {
      it('应该支持获取详细状态信息', async () => {
        const planId = uuidv4();
        const options: StatusOptions = {
          includeProgress: true,
          includePerformance: true,
          includeHealth: true,
          includeTasks: true,
          includeAnalysis: true
        };

        const planService = new PlanManagementService(
          {} as any, // mockRepository
          planValidationService,
          planFactoryService
        );

        // 模拟存在的计划
        const mockPlan = planFactoryService.createPlan({
          context_id: uuidv4(),
          name: 'Test Plan',
          description: 'Test Description'
        });
        jest.spyOn(planService, 'getPlanById').mockResolvedValue(mockPlan);

        const result = await planService.getPlanStatus(planId, options);

        expect(result.success).toBe(true);
        expect(result.data?.planId).toBe(planId);
        expect(result.data?.status).toBeDefined();
        expect(result.data?.progress).toBeDefined(); // 因为includeProgress为true
        expect(result.data?.performance).toBeDefined(); // 因为includePerformance为true
        expect(result.data?.health).toBeDefined(); // 因为includeHealth为true
        expect(result.data?.tasks).toBeDefined(); // 因为includeTasks为true
        expect(result.data?.progress?.overall).toBeGreaterThanOrEqual(0);
        expect(result.data?.health?.overall).toMatch(/healthy|warning|critical|unknown/);
      });

      it('应该支持更新计划配置', async () => {
        const planId = uuidv4();
        const updateRequest: UpdatePlanRequest = {
          planId,
          name: '更新后的计划',
          capabilities: {
            planning: {
              taskManagement: true,
              dependencyTracking: true,
              progressMonitoring: true,
              resourceAllocation: true
            },
            optimization: {
              timeOptimization: true,
              resourceOptimization: true,
              costOptimization: false,
              qualityOptimization: true
            }
          },
          configuration: {
            basic: {
              priority: 'critical',
              timeout: 7200000
            }
          }
        };

        const planService = new PlanManagementService(
          {} as any, // mockRepository
          planValidationService,
          planFactoryService
        );

        const result = await planService.updatePlan(updateRequest);

        expect(result.success).toBe(true);
        expect(result.data?.planId).toBe(planId);
        expect(result.data?.name).toBe('更新后的计划');
        expect(result.data?.capabilities.planning.resourceAllocation).toBe(true);
        expect(result.data?.capabilities.optimization?.timeOptimization).toBe(true);
      });
    });

    describe('5. 计划分析场景', () => {
      it('应该支持质量分析', async () => {
        const planId = uuidv4();
        const analysisRequest: PlanAnalysisRequest = {
          planId,
          analysisType: ['quality', 'performance', 'optimization'],
          options: {
            depth: 'deep',
            includeRecommendations: true,
            compareWith: [uuidv4()]
          }
        };

        const planService = new PlanManagementService(
          {} as any, // mockRepository
          planValidationService,
          planFactoryService
        );

        const result = await planService.analyzePlan(analysisRequest);

        expect(result.success).toBe(true);
        expect(result.data?.planId).toBe(planId);
        expect(result.data?.quality).toBeDefined();
        expect(result.data?.quality.overall).toBeGreaterThan(0);
        expect(result.data?.quality.overall).toBeLessThanOrEqual(1);
        expect(result.data?.recommendations).toBeInstanceOf(Array);
        expect(result.data?.insights).toBeInstanceOf(Array);

        // 验证推荐内容
        if (result.data?.recommendations.length > 0) {
          const recommendation = result.data.recommendations[0];
          expect(recommendation.type).toMatch(/optimization|risk_mitigation|performance|quality/);
          expect(recommendation.priority).toMatch(/low|medium|high|critical/);
          expect(recommendation.actions).toBeInstanceOf(Array);
        }
      });

      it('应该支持风险评估', async () => {
        const planId = uuidv4();
        const analysisRequest: PlanAnalysisRequest = {
          planId,
          analysisType: ['risks', 'bottlenecks'],
          options: {
            depth: 'moderate',
            includeRecommendations: false
          }
        };

        const planService = new PlanManagementService(
          {} as any, // mockRepository
          planValidationService,
          planFactoryService
        );

        const result = await planService.analyzePlan(analysisRequest);

        expect(result.success).toBe(true);
        expect(result.data?.insights).toBeInstanceOf(Array);

        // 验证洞察内容
        if (result.data?.insights.length > 0) {
          const insight = result.data.insights[0];
          expect(insight.category).toMatch(/progress|performance|risks|trends/);
          expect(insight.confidence).toBeGreaterThan(0);
          expect(insight.confidence).toBeLessThanOrEqual(1);
          expect(insight.data).toBeDefined();
        }
      });
    });

    describe('6. 计划执行场景', () => {
      it('应该支持启动计划执行', async () => {
        const planId = uuidv4();
        const executionRequest: PlanExecutionRequest = {
          planId,
          executionMode: 'adaptive',
          options: {
            dryRun: false,
            continueOnError: true,
            maxConcurrency: 3,
            timeout: 3600000
          }
        };

        const planService = new PlanManagementService(
          {} as any, // mockRepository
          planValidationService,
          planFactoryService
        );

        const result = await planService.executePlan(executionRequest);

        expect(result.success).toBe(true);
        expect(result.data?.planId).toBe(planId);
        expect(result.data?.executionId).toBeDefined();
        expect(result.data?.status).toBe('started');
        expect(result.data?.progress.overall).toBeGreaterThanOrEqual(0);
        expect(result.data?.estimatedCompletion).toBeDefined();
      });

      it('应该支持计划优化', async () => {
        const planId = uuidv4();
        const optimizationRequest: PlanOptimizationRequest = {
          planId,
          optimizationType: ['time', 'resources'],
          constraints: {
            maxDuration: 86400,
            maxCost: 10000,
            minQuality: 0.8
          },
          options: {
            preserveOrder: false,
            allowRestructuring: true
          }
        };

        const planService = new PlanManagementService(
          {} as any, // mockRepository
          planValidationService,
          planFactoryService
        );

        const result = await planService.optimizePlan(optimizationRequest);

        expect(result.success).toBe(true);
        expect(result.data?.planId).toBe(planId);
        expect(result.data?.optimizationId).toBeDefined();
        expect(result.data?.improvements).toBeInstanceOf(Array);
        expect(result.data?.newSchedule).toBeInstanceOf(Array);
        expect(result.data?.estimatedSavings).toBeDefined();

        // 验证改进内容
        if (result.data?.improvements.length > 0) {
          const improvement = result.data.improvements[0];
          expect(improvement.type).toMatch(/time|resources|cost|quality/);
          expect(improvement.confidence).toBeGreaterThan(0);
          expect(improvement.confidence).toBeLessThanOrEqual(1);
          expect(improvement.impact.improvement).toBeGreaterThan(0);
        }
      });
    });

    describe('7. 查询和管理场景', () => {
      it('应该支持按条件查询计划', async () => {
        const filter: PlanFilter = {
          type: ['project', 'multi_agent'],
          status: ['active', 'draft'],
          capabilities: ['orchestration', 'collaboration'],
          dateRange: {
            start: '2025-01-01T00:00:00Z',
            end: '2025-12-31T23:59:59Z'
          },
          limit: 10,
          offset: 0
        };

        const planService = new PlanManagementService(
          {} as any, // mockRepository
          planValidationService,
          planFactoryService
        );

        // 模拟查询结果
        const mockPlans = [
          planFactoryService.createPlan({ context_id: uuidv4(), name: 'Plan 1', description: 'Description 1' }),
          planFactoryService.createPlan({ context_id: uuidv4(), name: 'Plan 2', description: 'Description 2' })
        ];
        jest.spyOn(planService, 'getPlans').mockResolvedValue(mockPlans);

        const result = await planService.queryPlans(filter);

        expect(result.success).toBe(true);
        expect(result.data?.plans).toBeInstanceOf(Array);
        expect(result.data?.total).toBeGreaterThanOrEqual(0);
        expect(result.data?.hasMore).toBeDefined();
      });

      it('应该支持删除计划', async () => {
        const planId = uuidv4();

        const planService = new PlanManagementService(
          {} as any, // mockRepository
          planValidationService,
          planFactoryService
        );

        // 模拟删除成功
        jest.spyOn(planService, 'deleteLegacyPlan').mockResolvedValue({
          success: true,
          data: true
        });

        const result = await planService.deletePlan(planId);

        expect(result.success).toBe(true);
      });
    });

    describe('8. TracePilot复杂场景', () => {
      it('应该支持创建完整的DDSC项目计划', async () => {
        // 用户场景：TracePilot创建完整的DDSC项目计划
        const ddscPlanRequest: CreatePlanRequest = {
          name: 'TracePilot DDSC项目完整计划',
          description: '对话驱动式系统构建项目的完整计划管理',
          type: 'distributed',
          capabilities: {
            planning: {
              taskManagement: true,
              dependencyTracking: true,
              progressMonitoring: true,
              resourceAllocation: true
            },
            orchestration: {
              autoDecomposition: true,
              dynamicScheduling: true,
              conflictResolution: true,
              adaptiveExecution: true
            },
            collaboration: {
              multiAgent: true,
              taskDistribution: true,
              progressSync: true,
              workloadBalancing: true
            },
            optimization: {
              timeOptimization: true,
              resourceOptimization: true,
              costOptimization: false,
              qualityOptimization: true
            },
            analytics: {
              progressAnalysis: true,
              riskAssessment: true,
              performancePrediction: true,
              bottleneckDetection: true
            }
          },
          configuration: {
            basic: {
              priority: 'critical',
              timeout: 7200000,
              maxTasks: 100
            },
            orchestration: {
              schedulingStrategy: 'adaptive',
              conflictResolution: 'automatic',
              adaptationThreshold: 0.9
            },
            collaboration: {
              maxAgents: 10,
              loadBalancingStrategy: 'capability_based',
              syncInterval: 3000
            }
          },
          tasks: [
            {
              name: '需求分析阶段',
              description: '深度分析用户需求和系统要求',
              type: 'composite',
              priority: 'critical',
              estimatedDuration: 14400,
              dependencies: [],
              resources: [
                { type: 'ProductOwnerAgent', amount: 1, unit: 'agent', availability: 'required' },
                { type: 'AnalystAgent', amount: 2, unit: 'agent', availability: 'required' }
              ]
            },
            {
              name: '架构设计阶段',
              description: '设计系统架构和技术方案',
              type: 'composite',
              priority: 'critical',
              estimatedDuration: 21600,
              dependencies: ['需求分析阶段'],
              resources: [
                { type: 'ArchitectAgent', amount: 1, unit: 'agent', availability: 'required' },
                { type: 'TechLeadAgent', amount: 1, unit: 'agent', availability: 'required' }
              ]
            },
            {
              name: '开发实现阶段',
              description: '并行开发各个模块',
              type: 'composite',
              priority: 'high',
              estimatedDuration: 86400,
              dependencies: ['架构设计阶段'],
              resources: [
                { type: 'DeveloperAgent', amount: 5, unit: 'agent', availability: 'required' },
                { type: 'DevOpsAgent', amount: 1, unit: 'agent', availability: 'preferred' }
              ]
            }
          ],
          dependencies: [
            {
              sourceTaskId: '需求分析阶段',
              targetTaskId: '架构设计阶段',
              type: 'finish_to_start',
              lag: 0
            },
            {
              sourceTaskId: '架构设计阶段',
              targetTaskId: '开发实现阶段',
              type: 'finish_to_start',
              lag: 3600
            }
          ],
          context: {
            projectType: 'DDSC',
            methodology: 'dialog-driven-system-construction',
            targetPlatform: 'web',
            qualityGates: ['code_review', 'testing', 'security_scan']
          },
          metadata: {
            version: '1.0.0',
            created_by: 'TracePilot',
            project_id: 'ddsc-2025-001',
            priority: 'critical',
            tags: ['DDSC', 'multi-agent', 'production', 'TracePilot']
          }
        };

        const planService = new PlanManagementService(
          {} as any, // mockRepository
          planValidationService,
          planFactoryService
        );

        const result = await planService.createPlan(ddscPlanRequest);

        expect(result.success).toBe(true);
        expect(result.data?.name).toBe('TracePilot DDSC项目完整计划');
        expect(result.data?.type).toBe('distributed');
        expect(result.data?.capabilities.planning.taskManagement).toBe(true);
        expect(result.data?.capabilities.orchestration?.autoDecomposition).toBe(true);
        expect(result.data?.capabilities.collaboration?.multiAgent).toBe(true);
        expect(result.data?.capabilities.optimization?.timeOptimization).toBe(true);
        expect(result.data?.capabilities.analytics?.predictiveAnalysis).toBe(true);
      });
    });
  });
});
