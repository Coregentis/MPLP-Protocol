/**
 * Plan Execution Service 测试
 * 
 * 基于实际实现编写测试 - 严格遵循系统性链式批判性思维方法论
 * 
 * 实际方法调研结果：
 * - 只有一个公共方法：executePlan(request: PlanExecutionRequest)
 * - 执行流程：获取计划 → 验证可执行性 → 更新状态为ACTIVE → 执行任务 → 更新最终状态
 * - 依赖：IPlanRepository, PlanValidationService
 * 
 * @version v1.0.0
 * @created 2025-01-28
 * @compliance 100% Schema合规性 - 基于实际实现编写测试
 */

import { PlanExecutionService, PlanExecutionRequest, PlanExecutionResult } from '../../../application/services/plan-execution.service';
import { Plan } from '../../../domain/entities/plan.entity';
import { IPlanRepository } from '../../../domain/repositories/plan-repository.interface';
import { PlanValidationService, ValidationResult } from '../../../domain/services/plan-validation.service';
import { Priority, PlanStatus, TaskStatus, ExecutionStrategy } from '../../../types';
import { UUID } from '../../../../../public/shared/types';

describe('PlanExecutionService - 基于实际实现的协议级测试', () => {
  let service: PlanExecutionService;
  let mockRepository: jest.Mocked<IPlanRepository>;
  let mockValidationService: jest.Mocked<PlanValidationService>;

  // 基于实际Schema的测试数据
  const mockPlan = new Plan({
    planId: 'plan-123',
    contextId: 'ctx-456',
    name: 'Test Execution Plan',
    description: 'Plan for execution testing',
    goals: ['Execute successfully'],
    tasks: [{
      task_id: 'task-1',
      name: 'Task 1',
      description: 'First task',
      status: TaskStatus.PENDING,
      priority: Priority.HIGH,
      dependencies: [],
      estimated_duration: 3600000,
      assigned_to: 'agent-1'
    }, {
      task_id: 'task-2',
      name: 'Task 2',
      description: 'Second task',
      status: TaskStatus.PENDING,
      priority: Priority.MEDIUM,
      dependencies: ['task-1'],
      estimated_duration: 1800000,
      assigned_to: 'agent-2'
    }],
    dependencies: [],
    executionStrategy: 'sequential' as ExecutionStrategy,
    priority: Priority.HIGH,
    status: PlanStatus.APPROVED,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    createdBy: 'test-user'
  });

  const validExecutionRequest: PlanExecutionRequest = {
    planId: 'plan-123',
    executionContext: { environment: 'test' },
    executionOptions: {
      parallelLimit: 2,
      timeoutMs: 30000,
      retryFailedTasks: true,
      failureStrategy: 'stop_on_failure'
    },
    executionVariables: { debug: true },
    conditions: { prerequisite: 'met' }
  };

  beforeEach(() => {
    // 基于实际接口创建Mock对象
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      findByFilter: jest.fn(),
      findAll: jest.fn(),
      findByContextId: jest.fn()
    } as jest.Mocked<IPlanRepository>;

    // 基于实际PlanValidationService接口创建Mock
    mockValidationService = {
      validatePlanName: jest.fn(),
      validatePlanDescription: jest.fn(),
      validatePlanGoals: jest.fn(),
      validatePlanTasks: jest.fn(),
      validatePlanDependencies: jest.fn(),
      validatePlanConfiguration: jest.fn(),
      validatePlan: jest.fn(),
      validatePlanExecutability: jest.fn()
    } as jest.Mocked<PlanValidationService>;

    service = new PlanExecutionService(
      mockRepository,
      mockValidationService
    );

    // 重置所有Mock
    jest.clearAllMocks();
  });

  describe('🔴 协议核心 - executePlan方法（唯一公共方法）', () => {
    it('应该成功执行有效的计划 - 完整流程验证', async () => {
      // Arrange - 基于实际执行流程设置Mock
      const mockPlanWithMethods = {
        ...mockPlan,
        planId: mockPlan.planId, // 确保planId属性正确传递
        updateStatus: jest.fn(), // Plan实体的实际方法
        tasks: mockPlan.tasks, // 确保tasks属性正确传递
        dependencies: mockPlan.dependencies, // 确保dependencies属性正确传递
        executionStrategy: mockPlan.executionStrategy, // 确保executionStrategy属性正确传递
        configuration: mockPlan.configuration || {} // 确保configuration属性存在
      };
      
      mockRepository.findById.mockResolvedValue(mockPlanWithMethods as any);
      mockValidationService.validatePlanExecutability.mockReturnValue({
        valid: true,
        errors: []
      } as ValidationResult);
      mockRepository.update.mockResolvedValue(mockPlanWithMethods as any);

      // Act
      const result = await service.executePlan(validExecutionRequest);

      // Assert - 验证实际的执行流程
      // 注意：实际实现中，executeTasksInPlan会模拟执行任务
      expect(result.success).toBe(true);
      expect(result.plan_id).toBe(validExecutionRequest.planId);
      expect(result.execution_id).toBeDefined();
      expect(result.started_at).toBeDefined();
      expect(result.execution_time_ms).toBeGreaterThan(0);
      expect(result.tasks_status).toBeDefined();
      expect(result.tasks_status.total).toBe(2);
      expect(result.execution_mode).toBe('sequential'); // 基于mockPlan的executionStrategy
      
      // 验证实际的方法调用序列
      expect(mockRepository.findById).toHaveBeenCalledWith(validExecutionRequest.planId);
      expect(mockValidationService.validatePlanExecutability).toHaveBeenCalledWith(mockPlanWithMethods);
      expect(mockPlanWithMethods.updateStatus).toHaveBeenCalledWith(PlanStatus.ACTIVE);
      expect(mockRepository.update).toHaveBeenCalledTimes(2); // 开始时和结束时各一次
    });

    it('应该处理计划不存在的情况 - 实际错误处理', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(undefined);

      // Act
      const result = await service.executePlan(validExecutionRequest);

      // Assert - 验证实际的错误处理逻辑
      expect(result.success).toBe(false);
      expect(result.error).toBe('Plan with ID plan-123 not found');
      expect(result.plan_id).toBe(validExecutionRequest.planId);
      expect(result.execution_time_ms).toBeGreaterThanOrEqual(0);
      
      // 验证不会调用后续方法
      expect(mockValidationService.validatePlanExecutability).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('应该处理计划不可执行的情况 - 验证失败处理', async () => {
      // Arrange
      const mockPlanWithMethods = {
        ...mockPlan,
        updateStatus: jest.fn()
      };
      
      mockRepository.findById.mockResolvedValue(mockPlanWithMethods as any);
      mockValidationService.validatePlanExecutability.mockReturnValue({
        valid: false,
        errors: ['Plan status is not executable', 'Missing required tasks']
      } as ValidationResult);

      // Act
      const result = await service.executePlan(validExecutionRequest);

      // Assert - 验证实际的验证失败处理
      expect(result.success).toBe(false);
      expect(result.error).toBe('Plan is not executable: Plan status is not executable, Missing required tasks');
      expect(result.plan_id).toBe(validExecutionRequest.planId);
      
      // 验证调用了验证但没有更新状态
      expect(mockValidationService.validatePlanExecutability).toHaveBeenCalledWith(mockPlanWithMethods);
      expect(mockPlanWithMethods.updateStatus).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('应该处理Repository查询失败 - 异常处理', async () => {
      // Arrange
      mockRepository.findById.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await service.executePlan(validExecutionRequest);

      // Assert - 验证实际的异常处理逻辑
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to execute plan: Database connection failed');
      expect(result.plan_id).toBe(validExecutionRequest.planId);
      expect(result.execution_time_ms).toBeGreaterThanOrEqual(0); // buildFailureResult使用Date.now() - startTime
    });

    it('应该处理Repository更新失败 - 状态更新异常', async () => {
      // Arrange
      const mockPlanWithMethods = {
        ...mockPlan,
        updateStatus: jest.fn()
      };
      
      mockRepository.findById.mockResolvedValue(mockPlanWithMethods as any);
      mockValidationService.validatePlanExecutability.mockReturnValue({
        valid: true,
        errors: []
      } as ValidationResult);
      mockRepository.update.mockRejectedValue(new Error('Database update failed'));

      // Act
      const result = await service.executePlan(validExecutionRequest);

      // Assert - 验证更新失败的处理
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to execute plan: Database update failed');
      expect(mockPlanWithMethods.updateStatus).toHaveBeenCalledWith(PlanStatus.ACTIVE);
    });
  });

  describe('🔴 协议核心 - 边界条件和错误处理', () => {
    it('应该处理空planId', async () => {
      // Arrange
      const emptyPlanIdRequest = { ...validExecutionRequest, planId: '' };
      mockRepository.findById.mockResolvedValue(undefined);

      // Act
      const result = await service.executePlan(emptyPlanIdRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Plan with ID  not found');
      expect(result.plan_id).toBe('');
    });

    it('应该处理缺少可选参数的执行请求', async () => {
      // Arrange - 基于实际接口，只有planId是必需的
      const minimalRequest = {
        planId: 'valid-plan-id'
        // 其他参数都是可选的
      } as PlanExecutionRequest;

      const mockPlanWithMethods = {
        ...mockPlan,
        planId: 'valid-plan-id', // 确保planId匹配
        updateStatus: jest.fn(),
        tasks: mockPlan.tasks, // 确保tasks属性正确传递
        dependencies: mockPlan.dependencies, // 确保dependencies属性正确传递
        executionStrategy: mockPlan.executionStrategy, // 确保executionStrategy属性正确传递
        configuration: mockPlan.configuration || {} // 确保configuration属性存在
      };

      mockRepository.findById.mockResolvedValue(mockPlanWithMethods as any);
      mockValidationService.validatePlanExecutability.mockReturnValue({
        valid: true,
        errors: []
      } as ValidationResult);
      mockRepository.update.mockResolvedValue(mockPlanWithMethods as any);

      // Act
      const result = await service.executePlan(minimalRequest);

      // Assert - 验证可以处理最小参数集
      expect(result.success).toBe(true);
      expect(result.plan_id).toBe('valid-plan-id');
      expect(result.execution_id).toBeDefined();
      expect(result.tasks_status).toBeDefined();
    });
  });
});
