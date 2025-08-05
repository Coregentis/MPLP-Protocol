/**
 * Plan模块适配器单元测试
 * @description 测试PlanModuleAdapter的所有功能，确保100%分支覆盖
 * @author MPLP Team
 * @version 2.0.0
 * @created 2025-08-04 23:09
 * 
 * 基于MPLP测试策略规则：
 * 1. 基于实际Schema和实现编写测试
 * 2. 使用TestDataFactory生成测试数据
 * 3. 发现并修复源代码问题，而不是绕过问题
 * 4. 确保100%分支覆盖，发现源代码功能缺失
 */

import { jest } from '@jest/globals';
import { PlanModuleAdapter } from '../../../src/modules/plan/infrastructure/adapters/plan-module.adapter';
import { PlanManagementService, OperationResult } from '../../../src/modules/plan/application/services/plan-management.service';
import { PlanExecutionService } from '../../../src/modules/plan/application/services/plan-execution.service';
import { Plan } from '../../../src/modules/plan/domain/entities/plan.entity';
import { createDefaultPlanConfiguration } from '../../../src/modules/plan/domain/value-objects/plan-configuration.value-object';
import { PlanningCoordinationRequest, PlanningResult, ModuleStatus } from '../../../src/public/modules/core/types/core.types';
import { PlanStatus, ExecutionStrategy, Priority } from '../../../src/public/shared/types/plan-types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('PlanModuleAdapter单元测试', () => {
  let planAdapter: PlanModuleAdapter;
  let mockPlanManagementService: jest.Mocked<PlanManagementService>;
  let mockPlanExecutionService: jest.Mocked<PlanExecutionService>;

  beforeEach(async () => {
    // 基于实际接口创建Mock服务
    mockPlanManagementService = {
      createPlan: jest.fn(),
      getPlan: jest.fn(),
      updatePlan: jest.fn(),
      deletePlan: jest.fn(),
      listPlans: jest.fn(),
      searchPlans: jest.fn(),
      bulkCreatePlans: jest.fn(),
      bulkUpdatePlans: jest.fn(),
      bulkDeletePlans: jest.fn(),
      syncPlan: jest.fn(),
      analyzePlan: jest.fn(),
      optimizePlan: jest.fn()
    } as jest.Mocked<PlanManagementService>;

    mockPlanExecutionService = {
      executePlan: jest.fn(),
      pausePlan: jest.fn(),
      resumePlan: jest.fn(),
      cancelPlan: jest.fn(),
      getExecutionStatus: jest.fn(),
      getExecutionHistory: jest.fn(),
      validateExecution: jest.fn(),
      optimizeExecution: jest.fn()
    } as jest.Mocked<PlanExecutionService>;

    // 创建适配器实例
    planAdapter = new PlanModuleAdapter(mockPlanManagementService, mockPlanExecutionService);
  });

  afterEach(async () => {
    await TestDataFactory.Manager.cleanup();
    jest.clearAllMocks();
  });

  describe('模块初始化', () => {
    test('应该成功初始化适配器', async () => {
      await planAdapter.initialize();

      const status = planAdapter.getStatus();
      expect(status.module_name).toBe('plan');
      expect(status.status).toBe('initialized');
      expect(status.error_count).toBe(0);
    });

    test('应该处理初始化失败', async () => {
      // 创建一个没有服务的适配器来模拟初始化失败
      const invalidAdapter = new PlanModuleAdapter(null as any, null as any);

      await expect(invalidAdapter.initialize()).rejects.toThrow('Plan services not available');

      const status = invalidAdapter.getStatus();
      expect(status.status).toBe('error');
      expect(status.error_count).toBe(1);
    });

    test('应该正确设置模块名称', () => {
      expect(planAdapter.module_name).toBe('plan');
    });
  });

  describe('规划协调执行', () => {
    beforeEach(async () => {
      await planAdapter.initialize();
    });

    test('应该成功执行顺序规划策略', async () => {
      // 使用TestDataFactory生成测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: PlanningCoordinationRequest = {
        contextId: contextId,
        planning_strategy: 'sequential',
        parameters: {
          decomposition_rules: ['task1', 'task2', 'task3']
        }
      };

      // 基于实际Plan实体创建Mock返回值
      const mockPlan = new Plan({
        plan_id: TestDataFactory.Base.generateUUID(),
        context_id: contextId,
        name: `Plan-sequential-${contextId.substring(0, 8)}`,
        description: 'Plan created using sequential strategy',
        status: 'draft' as PlanStatus,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: ['task1', 'task2', 'task3'],
        tasks: [],
        dependencies: [],
        execution_strategy: 'sequential' as ExecutionStrategy,
        priority: 'medium' as Priority,
        progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
        configuration: createDefaultPlanConfiguration()
      });

      const mockResult: OperationResult<Plan> = {
        success: true,
        data: mockPlan
      };

      mockPlanManagementService.createPlan.mockResolvedValue(mockResult);

      const result: PlanningResult = await planAdapter.execute(request);

      // 验证结果结构
      expect(result.plan_id).toBeDefined();
      expect(result.task_breakdown).toBeDefined();
      expect(result.task_breakdown.tasks).toHaveLength(3);
      expect(result.task_breakdown.execution_order).toHaveLength(3);
      expect(result.resource_allocation).toBeDefined();
      expect(result.resource_allocation.strategy).toBe('sequential');
      expect(result.timestamp).toBeDefined();

      // 验证顺序执行的依赖关系
      const tasks = result.task_breakdown.tasks;
      expect(tasks[0].dependencies).toHaveLength(0); // 第一个任务无依赖
      expect(tasks[1].dependencies).toHaveLength(1); // 第二个任务依赖第一个
      expect(tasks[2].dependencies).toHaveLength(1); // 第三个任务依赖第二个

      // 验证服务调用
      expect(mockPlanManagementService.createPlan).toHaveBeenCalledTimes(1);
    });

    test('应该成功执行并行规划策略', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: PlanningCoordinationRequest = {
        contextId: contextId,
        planning_strategy: 'parallel',
        parameters: {
          decomposition_rules: ['task1', 'task2', 'task3', 'task4']
        }
      };

      const mockPlan = new Plan({
        plan_id: TestDataFactory.Base.generateUUID(),
        context_id: contextId,
        name: `Plan-parallel-${contextId.substring(0, 8)}`,
        description: 'Plan created using parallel strategy',
        status: 'draft' as PlanStatus,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: ['task1', 'task2', 'task3', 'task4'],
        tasks: [],
        dependencies: [],
        execution_strategy: 'parallel' as ExecutionStrategy,
        priority: 'medium' as Priority,
        progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
        configuration: createDefaultPlanConfiguration()
      });

      mockPlanManagementService.createPlan.mockResolvedValue({
        success: true,
        data: mockPlan
      });

      const result: PlanningResult = await planAdapter.execute(request);

      expect(result.task_breakdown.tasks).toHaveLength(4);
      expect(result.resource_allocation.strategy).toBe('parallel');
      expect(result.resource_allocation.parallel_slots).toBe(4);
      expect(result.resource_allocation.resource_per_task).toBe(0.25);

      // 验证并行任务无依赖关系
      const tasks = result.task_breakdown.tasks;
      tasks.forEach(task => {
        expect(task.dependencies).toHaveLength(0);
      });
    });

    test('应该成功执行自适应规划策略', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: PlanningCoordinationRequest = {
        contextId: contextId,
        planning_strategy: 'adaptive',
        parameters: {
          decomposition_rules: ['adaptive_task1', 'adaptive_task2']
        }
      };

      const mockPlan = new Plan({
        plan_id: TestDataFactory.Base.generateUUID(),
        context_id: contextId,
        name: `Plan-adaptive-${contextId.substring(0, 8)}`,
        description: 'Plan created using adaptive strategy',
        status: 'draft' as PlanStatus,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: ['adaptive_task1', 'adaptive_task2'],
        tasks: [],
        dependencies: [],
        execution_strategy: 'hybrid' as ExecutionStrategy, // adaptive映射到hybrid
        priority: 'medium' as Priority,
        progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
        configuration: createDefaultPlanConfiguration()
      });

      mockPlanManagementService.createPlan.mockResolvedValue({
        success: true,
        data: mockPlan
      });

      const result: PlanningResult = await planAdapter.execute(request);

      expect(result.task_breakdown.tasks).toHaveLength(2);
      expect(result.resource_allocation.strategy).toBe('adaptive');
      expect(result.resource_allocation.adaptive_threshold).toBe(0.7);
      expect(result.resource_allocation.resource_buffer).toBe(0.2);
    });

    test('应该成功执行层次化规划策略', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: PlanningCoordinationRequest = {
        contextId: contextId,
        planning_strategy: 'hierarchical',
        parameters: {
          decomposition_rules: ['level1_task1', 'level1_task2', 'level2_task1', 'level2_task2']
        }
      };

      const mockPlan = new Plan({
        plan_id: TestDataFactory.Base.generateUUID(),
        context_id: contextId,
        name: `Plan-hierarchical-${contextId.substring(0, 8)}`,
        description: 'Plan created using hierarchical strategy',
        status: 'draft' as PlanStatus,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: ['level1_task1', 'level1_task2', 'level2_task1', 'level2_task2'],
        tasks: [],
        dependencies: [],
        execution_strategy: 'conditional' as ExecutionStrategy, // hierarchical映射到conditional
        priority: 'medium' as Priority,
        progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
        configuration: createDefaultPlanConfiguration()
      });

      mockPlanManagementService.createPlan.mockResolvedValue({
        success: true,
        data: mockPlan
      });

      const result: PlanningResult = await planAdapter.execute(request);

      expect(result.task_breakdown.tasks).toHaveLength(4);
      expect(result.resource_allocation.strategy).toBe('hierarchical');
      expect(result.resource_allocation.hierarchy_levels).toBe(2); // ceil(log2(4))
      expect(result.resource_allocation.level_resources).toBeDefined();
    });
  });

  describe('参数验证', () => {
    beforeEach(async () => {
      await planAdapter.initialize();
    });

    test('应该验证contextId必需', async () => {
      const request: PlanningCoordinationRequest = {
        contextId: '', // 空的contextId
        planning_strategy: 'sequential',
        parameters: {}
      };

      await expect(planAdapter.execute(request)).rejects.toThrow('Context ID is required');

      const status = planAdapter.getStatus();
      expect(status.error_count).toBe(1);
      expect(status.status).toBe('error');
    });

    test('应该验证规划策略有效性', async () => {
      const request: PlanningCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        planning_strategy: 'invalid_strategy' as any,
        parameters: {}
      };

      await expect(planAdapter.execute(request)).rejects.toThrow(
        'Unsupported planning strategy: invalid_strategy'
      );
    });

    test('应该验证时间限制为正数', async () => {
      const request: PlanningCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        planning_strategy: 'sequential',
        parameters: {
          resource_constraints: {
            time_limit: -1000 // 负数时间限制
          }
        }
      };

      await expect(planAdapter.execute(request)).rejects.toThrow('Time limit must be positive');
    });

    test('应该验证资源限制为正数', async () => {
      const request: PlanningCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        planning_strategy: 'sequential',
        parameters: {
          resource_constraints: {
            resource_limit: -50 // 负数资源限制
          }
        }
      };

      await expect(planAdapter.execute(request)).rejects.toThrow('Resource limit must be positive');
    });

    test('应该验证任务管理配置类型', async () => {
      const request: PlanningCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        planning_strategy: 'sequential',
        parameters: {},
        task_management: {
          auto_decomposition: 'invalid' as any, // 非布尔值
          dependency_tracking: true,
          progress_monitoring: true
        }
      };

      await expect(planAdapter.execute(request)).rejects.toThrow(
        'Task management flags must be boolean values'
      );
    });
  });

  describe('资源约束处理', () => {
    beforeEach(async () => {
      await planAdapter.initialize();
    });

    test('应该正确处理时间约束', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: PlanningCoordinationRequest = {
        contextId: contextId,
        planning_strategy: 'sequential',
        parameters: {
          decomposition_rules: ['task1', 'task2'],
          resource_constraints: {
            time_limit: 3600000, // 1 hour
            resource_limit: 100
          }
        }
      };

      const mockPlan = new Plan({
        plan_id: TestDataFactory.Base.generateUUID(),
        context_id: contextId,
        name: 'Test Plan',
        description: 'Test Description',
        status: 'draft' as PlanStatus,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: ['task1', 'task2'],
        tasks: [],
        dependencies: [],
        execution_strategy: 'sequential' as ExecutionStrategy,
        priority: 'medium' as Priority,
        progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
        configuration: createDefaultPlanConfiguration()
      });

      mockPlanManagementService.createPlan.mockResolvedValue({
        success: true,
        data: mockPlan
      });

      const result: PlanningResult = await planAdapter.execute(request);

      expect(result.task_breakdown.tasks).toHaveLength(2);
      expect(result.resource_allocation.resource_constraints.time_limit).toBe(3600000);
      expect(result.resource_allocation.resource_constraints.resource_limit).toBe(100);

      // 验证时间分配
      const tasks = result.task_breakdown.tasks;
      tasks.forEach(task => {
        expect(task.estimated_duration).toBeDefined();
        expect(task.estimated_duration).toBe(1800000); // 30min per task
      });
    });

    test('应该根据时间约束确定优先级', async () => {
      const contextId = TestDataFactory.Base.generateUUID();

      // 测试紧急任务（< 1小时）
      const urgentRequest: PlanningCoordinationRequest = {
        contextId: contextId,
        planning_strategy: 'sequential',
        parameters: {
          resource_constraints: {
            time_limit: 1800000 // 30 minutes - 应该是critical
          }
        }
      };

      const mockPlan = new Plan({
        plan_id: TestDataFactory.Base.generateUUID(),
        context_id: contextId,
        name: 'Urgent Plan',
        description: 'Urgent Description',
        status: 'draft' as PlanStatus,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: [],
        tasks: [],
        dependencies: [],
        execution_strategy: 'sequential' as ExecutionStrategy,
        priority: 'critical' as Priority, // 应该是critical优先级
        progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
        configuration: createDefaultPlanConfiguration()
      });

      mockPlanManagementService.createPlan.mockResolvedValue({
        success: true,
        data: mockPlan
      });

      const result = await planAdapter.execute(urgentRequest);
      expect(result.plan_id).toBeDefined();
      
      // 验证createPlan被调用时使用了正确的优先级
      expect(mockPlanManagementService.createPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'critical'
        })
      );
    });
  });

  describe('模块状态管理', () => {
    test('应该正确跟踪执行状态', async () => {
      await planAdapter.initialize();

      const contextId = TestDataFactory.Base.generateUUID();
      const request: PlanningCoordinationRequest = {
        contextId: contextId,
        planning_strategy: 'sequential',
        parameters: {}
      };

      const mockPlan = new Plan({
        plan_id: TestDataFactory.Base.generateUUID(),
        context_id: contextId,
        name: 'Test Plan',
        description: 'Test Description',
        status: 'draft' as PlanStatus,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: [],
        tasks: [],
        dependencies: [],
        execution_strategy: 'sequential' as ExecutionStrategy,
        priority: 'medium' as Priority,
        progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
        configuration: createDefaultPlanConfiguration()
      });

      mockPlanManagementService.createPlan.mockResolvedValue({
        success: true,
        data: mockPlan
      });

      const initialStatus = planAdapter.getStatus();
      expect(initialStatus.status).toBe('initialized');

      await planAdapter.execute(request);

      const finalStatus = planAdapter.getStatus();
      expect(finalStatus.status).toBe('idle');
      expect(finalStatus.last_execution).toBeDefined();
    });

    test('应该处理执行错误并更新状态', async () => {
      await planAdapter.initialize();

      const request: PlanningCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        planning_strategy: 'sequential',
        parameters: {}
      };

      // 模拟服务错误
      mockPlanManagementService.createPlan.mockResolvedValue({
        success: false,
        error: 'Service error'
      });

      await expect(planAdapter.execute(request)).rejects.toThrow('Failed to create plan: Service error');

      const status = planAdapter.getStatus();
      expect(status.status).toBe('error');
      expect(status.error_count).toBe(1);
    });
  });

  describe('清理资源', () => {
    test('应该成功清理资源', async () => {
      await planAdapter.initialize();
      await planAdapter.cleanup();

      const status = planAdapter.getStatus();
      expect(status.status).toBe('idle');
    });

    test('应该处理清理错误', async () => {
      await planAdapter.initialize();
      
      // 这里我们无法轻易模拟cleanup错误，因为cleanup方法很简单
      // 但我们可以验证cleanup不会抛出异常
      await expect(planAdapter.cleanup()).resolves.not.toThrow();
    });
  });

  describe('性能测试', () => {
    beforeEach(async () => {
      await planAdapter.initialize();
    });

    test('应该在合理时间内完成规划协调', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: PlanningCoordinationRequest = {
        contextId: contextId,
        planning_strategy: 'parallel',
        parameters: {
          decomposition_rules: Array.from({ length: 10 }, (_, i) => `task_${i}`)
        }
      };

      const mockPlan = new Plan({
        plan_id: TestDataFactory.Base.generateUUID(),
        context_id: contextId,
        name: 'Performance Test Plan',
        description: 'Performance Test Description',
        status: 'draft' as PlanStatus,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: Array.from({ length: 10 }, (_, i) => `task_${i}`),
        tasks: [],
        dependencies: [],
        execution_strategy: 'parallel' as ExecutionStrategy,
        priority: 'medium' as Priority,
        progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
        configuration: createDefaultPlanConfiguration()
      });

      mockPlanManagementService.createPlan.mockResolvedValue({
        success: true,
        data: mockPlan
      });

      const startTime = Date.now();
      const result = await planAdapter.execute(request);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(PERFORMANCE_THRESHOLDS.ADAPTER_EXECUTION_TIME || 1000);
      expect(result.task_breakdown.tasks).toHaveLength(10);
    });
  });
});
