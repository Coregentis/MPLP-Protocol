/**
 * Plan模块与Core模块协调器集成测试
 * @description 验证Plan模块适配器与Core模块的协调接口
 * @author MPLP Team
 * @version 2.0.0
 * @created 2025-08-04 23:09
 * 
 * 基于实际实现的测试，遵循MPLP测试策略规则：
 * 1. 基于实际Schema和实现编写测试
 * 2. 使用TestDataFactory生成测试数据
 * 3. 基于实际构造函数创建Mock依赖
 * 4. 发现并修复源代码问题，而不是绕过问题
 */

import { jest } from '@jest/globals';
import { PlanModuleAdapter } from '../../src/modules/plan/infrastructure/adapters/plan-module.adapter';
import { PlanManagementService } from '../../src/modules/plan/application/services/plan-management.service';
import { PlanExecutionService } from '../../src/modules/plan/application/services/plan-execution.service';
import { PlanFactoryService } from '../../src/modules/plan/domain/services/plan-factory.service';
import { PlanValidationService } from '../../src/modules/plan/domain/services/plan-validation.service';
import { IPlanRepository } from '../../src/modules/plan/domain/repositories/plan-repository.interface';
import { Plan } from '../../src/modules/plan/domain/entities/plan.entity';
import { createDefaultPlanConfiguration } from '../../src/modules/plan/domain/value-objects/plan-configuration.value-object';
import { PlanningCoordinationRequest, PlanningResult } from '../../src/public/modules/core/types/core.types';
import { PlanStatus, ExecutionStrategy, Priority } from '../../src/public/shared/types/plan-types';
import { TestDataFactory } from '../public/test-utils/test-data-factory';
import { TestHelpers } from '../public/test-utils/test-helpers';

describe('Plan模块与Core模块协调器集成测试', () => {
  let planAdapter: PlanModuleAdapter;
  let planManagementService: PlanManagementService;
  let planExecutionService: PlanExecutionService;
  let mockRepository: jest.Mocked<IPlanRepository>;
  let mockValidationService: jest.Mocked<PlanValidationService>;
  let mockFactoryService: jest.Mocked<PlanFactoryService>;

  beforeEach(async () => {
    // 基于实际接口创建Mock依赖
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByFilter: jest.fn(),
      bulkCreate: jest.fn(),
      bulkUpdate: jest.fn(),
      bulkDelete: jest.fn(),
      findByContextId: jest.fn(),
      findByStatus: jest.fn(),
      exists: jest.fn(),
      count: jest.fn()
    } as jest.Mocked<IPlanRepository>;

    mockValidationService = {
      validatePlan: jest.fn(),
      validateTasks: jest.fn(),
      validateDependencies: jest.fn(),
      validatePlanExecutability: jest.fn(),
      validatePlanName: jest.fn(),
      validateTaskName: jest.fn(),
      detectCycles: jest.fn()
    } as unknown as jest.Mocked<PlanValidationService>;

    mockFactoryService = {
      createPlan: jest.fn(),
      createTask: jest.fn(),
      createDependency: jest.fn(),
      createTimeline: jest.fn(),
      createRiskAssessment: jest.fn()
    } as jest.Mocked<PlanFactoryService>;

    // 基于实际构造函数创建服务实例
    planManagementService = new PlanManagementService(
      mockRepository,
      mockValidationService,
      mockFactoryService
    );

    planExecutionService = new PlanExecutionService(mockRepository);

    // 创建Plan适配器
    planAdapter = new PlanModuleAdapter(planManagementService, planExecutionService);
    await planAdapter.initialize();
  });

  afterEach(async () => {
    await planAdapter.cleanup();
    await TestDataFactory.Manager.cleanup();
    jest.clearAllMocks();
  });

  describe('Core协调器接口集成', () => {
    test('应该成功初始化Plan模块适配器', async () => {
      const status = planAdapter.getStatus();
      
      expect(status.module_name).toBe('plan');
      expect(status.status).toBe('initialized');
      expect(status.error_count).toBe(0);
    });

    test('应该实现ModuleInterface接口', () => {
      expect(planAdapter.module_name).toBe('plan');
      expect(typeof planAdapter.initialize).toBe('function');
      expect(typeof planAdapter.execute).toBe('function');
      expect(typeof planAdapter.cleanup).toBe('function');
      expect(typeof planAdapter.getStatus).toBe('function');
    });
  });

  describe('Core.coordinatePlanning集成测试', () => {
    test('应该成功处理顺序规划协调请求', async () => {
      // 使用TestDataFactory生成测试数据
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: PlanningCoordinationRequest = {
        contextId: contextId,
        planning_strategy: 'sequential',
        parameters: {
          decomposition_rules: ['task1', 'task2', 'task3']
        }
      };

      // 设置Mock返回值 - 基于实际Plan实体结构
      const mockPlan = new Plan({
        plan_id: TestDataFactory.Base.generateUUID(),
        context_id: contextId,
        name: `Plan-sequential-${request.contextId.substring(0, 8)}`,
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

      // 设置验证服务Mock
      mockValidationService.validatePlanName.mockReturnValue({ valid: true, errors: [] });
      mockValidationService.validatePlan.mockReturnValue({ valid: true, errors: [] });

      // 设置工厂服务Mock
      mockFactoryService.createPlan.mockReturnValue(mockPlan);

      // 设置仓库Mock
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue(mockPlan);

      // 执行协调请求
      const result: PlanningResult = await planAdapter.execute(request);

      // 验证结果结构
      expect(result.plan_id).toBeDefined();
      expect(result.task_breakdown).toBeDefined();
      expect(result.task_breakdown.tasks).toHaveLength(3);
      expect(result.task_breakdown.execution_order).toHaveLength(3);
      expect(result.resource_allocation).toBeDefined();
      expect(result.resource_allocation.strategy).toBe('sequential');
      expect(result.timestamp).toBeDefined();

      // 验证服务调用
      expect(mockValidationService.validatePlanName).toHaveBeenCalled();
      expect(planManagementService).toBeDefined();
    });

    test('应该正确处理并行规划协调请求', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: PlanningCoordinationRequest = {
        contextId: contextId,
        planning_strategy: 'parallel',
        parameters: {
          decomposition_rules: ['task1', 'task2', 'task3', 'task4']
        }
      };

      // 基于实际Plan实体创建Mock数据
      const mockPlan = new Plan({
        plan_id: TestDataFactory.Base.generateUUID(),
        context_id: contextId,
        name: `Plan-parallel-${request.contextId.substring(0, 8)}`,
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

      mockValidationService.validatePlanName.mockReturnValue({ valid: true, errors: [] });
      mockValidationService.validatePlan.mockReturnValue({ valid: true, errors: [] });
      mockFactoryService.createPlan.mockReturnValue(mockPlan);
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue(mockPlan);

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

    test('应该处理规划协调错误', async () => {
      const request: PlanningCoordinationRequest = {
        contextId: '', // 无效的contextId
        planning_strategy: 'sequential',
        parameters: {}
      };

      await expect(planAdapter.execute(request)).rejects.toThrow(
        'Context ID is required'
      );

      // 验证错误计数增加
      const status = planAdapter.getStatus();
      expect(status.error_count).toBe(1);
      expect(status.status).toBe('error');
    });

    test('应该处理不支持的规划策略', async () => {
      const request: PlanningCoordinationRequest = {
        contextId: TestDataFactory.Base.generateUUID(),
        planning_strategy: 'invalid_strategy' as any,
        parameters: {}
      };

      await expect(planAdapter.execute(request)).rejects.toThrow(
        'Unsupported planning strategy: invalid_strategy'
      );
    });
  });

  describe('模块状态管理', () => {
    test('应该正确跟踪模块执行状态', async () => {
      const contextId = TestDataFactory.Base.generateUUID();
      
      const request: PlanningCoordinationRequest = {
        contextId: contextId,
        planning_strategy: 'sequential',
        parameters: {}
      };

      // 设置必要的Mock
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

      mockValidationService.validatePlanName.mockReturnValue({ valid: true, errors: [] });
      mockValidationService.validatePlan.mockReturnValue({ valid: true, errors: [] });
      mockFactoryService.createPlan.mockReturnValue(mockPlan);
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue(mockPlan);

      const initialStatus = planAdapter.getStatus();
      expect(initialStatus.status).toBe('initialized');

      await planAdapter.execute(request);

      const finalStatus = planAdapter.getStatus();
      expect(finalStatus.status).toBe('idle');
      expect(finalStatus.last_execution).toBeDefined();
    });
  });

  describe('资源约束处理', () => {
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

      mockValidationService.validatePlanName.mockReturnValue({ valid: true, errors: [] });
      mockValidationService.validatePlan.mockReturnValue({ valid: true, errors: [] });
      mockFactoryService.createPlan.mockReturnValue(mockPlan);
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue(mockPlan);

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
  });
});
