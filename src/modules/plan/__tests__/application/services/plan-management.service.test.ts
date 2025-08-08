/**
 * Plan Management Service 测试
 * 
 * 完整测试Plan管理服务的所有功能，目标覆盖率90%+
 * 
 * @version v1.0.0
 * @created 2025-01-28
 * @compliance 100% Schema合规性 - 基于实际实现编写测试
 */

import { PlanManagementService, OperationResult } from '../../../application/services/plan-management.service';
import { Plan } from '../../../domain/entities/plan.entity';
import { IPlanRepository, PlanFilter } from '../../../domain/repositories/plan-repository.interface';
import { PlanValidationService, ValidationResult } from '../../../domain/services/plan-validation.service';
import { PlanFactoryService } from '../../../domain/services/plan-factory.service';
import { Priority, PlanStatus, TaskStatus, ExecutionStrategy } from '../../../types';
import { UUID } from '../../../../../public/shared/types';

describe('PlanManagementService - 协议级完整测试', () => {
  let service: PlanManagementService;
  let mockRepository: jest.Mocked<IPlanRepository>;
  let mockValidationService: jest.Mocked<PlanValidationService>;
  let mockFactoryService: jest.Mocked<PlanFactoryService>;

  // 测试数据
  const validPlanParams = {
    planId: 'plan-123',
    contextId: 'ctx-456',
    name: 'Test Plan',
    description: 'Test Description',
    goals: ['Goal 1', 'Goal 2'],
    tasks: [{
      task_id: 'task-1',
      name: 'Task 1',
      description: 'Task Description',
      status: TaskStatus.PENDING,
      priority: Priority.HIGH,
      dependencies: [],
      estimated_duration: 3600000,
      assigned_to: 'agent-1'
    }],
    dependencies: [],
    executionStrategy: 'sequential' as ExecutionStrategy,
    priority: Priority.HIGH,
    estimatedDuration: { value: 1, unit: 'hour' },
    configuration: {},
    metadata: { source: 'test' }
  };

  const mockPlan = new Plan({
    planId: validPlanParams.planId,
    contextId: validPlanParams.contextId,
    name: validPlanParams.name,
    description: validPlanParams.description,
    goals: validPlanParams.goals,
    tasks: validPlanParams.tasks,
    dependencies: validPlanParams.dependencies,
    executionStrategy: validPlanParams.executionStrategy,
    priority: validPlanParams.priority,
    status: PlanStatus.DRAFT,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    createdBy: 'test-user'
  });

  beforeEach(() => {
    // 创建Mock对象
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

    mockValidationService = {
      validatePlanName: jest.fn(),
      validatePlanDescription: jest.fn(),
      validatePlanGoals: jest.fn(),
      validatePlanTasks: jest.fn(),
      validatePlanDependencies: jest.fn(),
      validatePlanConfiguration: jest.fn(),
      validatePlan: jest.fn()
    } as jest.Mocked<PlanValidationService>;

    mockFactoryService = {
      createPlan: jest.fn(),
      createPlanFromTemplate: jest.fn(),
      clonePlan: jest.fn()
    } as jest.Mocked<PlanFactoryService>;

    service = new PlanManagementService(
      mockRepository,
      mockValidationService,
      mockFactoryService
    );

    // 重置所有Mock
    jest.clearAllMocks();
  });

  describe('🔴 协议核心 - createPlan功能', () => {
    it('应该成功创建有效的计划', async () => {
      // Arrange
      mockValidationService.validatePlanName.mockReturnValue({
        valid: true,
        errors: []
      });
      mockValidationService.validatePlan.mockReturnValue({
        valid: true,
        errors: []
      });
      mockFactoryService.createPlan.mockReturnValue(mockPlan);
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue(mockPlan);

      // Act
      const result = await service.createPlan(validPlanParams);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.planId).toBe(validPlanParams.planId);
      expect(mockValidationService.validatePlanName).toHaveBeenCalledWith(validPlanParams.name);
      expect(mockValidationService.validatePlan).toHaveBeenCalledWith(mockPlan);
      expect(mockRepository.exists).toHaveBeenCalledWith(validPlanParams.planId);
      expect(mockFactoryService.createPlan).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(mockPlan);
    });

    it('应该支持snake_case参数转换', async () => {
      // Arrange
      const snakeCaseParams = {
        ...validPlanParams,
        context_id: 'ctx-snake',
        execution_strategy: 'parallel' as ExecutionStrategy,
        estimated_duration: { value: 2, unit: 'hours' }
      };
      delete (snakeCaseParams as any).contextId;
      delete (snakeCaseParams as any).executionStrategy;
      delete (snakeCaseParams as any).estimatedDuration;

      mockValidationService.validatePlanName.mockReturnValue({
        valid: true,
        errors: []
      });
      mockValidationService.validatePlan.mockReturnValue({
        valid: true,
        errors: []
      });
      mockFactoryService.createPlan.mockReturnValue(mockPlan);
      mockRepository.exists.mockResolvedValue(false);
      mockRepository.create.mockResolvedValue(mockPlan);

      // Act
      const result = await service.createPlan(snakeCaseParams);

      // Assert
      expect(result.success).toBe(true);
      expect(mockFactoryService.createPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          contextId: 'ctx-snake',
          executionStrategy: 'parallel',
          estimatedDuration: { value: 2, unit: 'hours' }
        })
      );
    });

    it('应该拒绝无效的计划名称', async () => {
      // Arrange
      mockValidationService.validatePlanName.mockReturnValue({
        valid: false,
        errors: ['Plan name is too short']
      });

      // Act
      const result = await service.createPlan({
        ...validPlanParams,
        name: 'x'
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid plan name');
      expect(result.validationErrors).toEqual(['Plan name is too short']);
      expect(mockFactoryService.createPlan).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('应该拒绝缺少contextId的请求', async () => {
      // Arrange
      mockValidationService.validatePlanName.mockReturnValue({
        valid: true,
        errors: []
      });

      const paramsWithoutContext = { ...validPlanParams };
      delete (paramsWithoutContext as any).contextId;

      // Act
      const result = await service.createPlan(paramsWithoutContext);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Context ID is required');
      expect(mockFactoryService.createPlan).not.toHaveBeenCalled();
    });

    it('应该处理Repository创建失败', async () => {
      // Arrange
      mockValidationService.validatePlanName.mockReturnValue({
        valid: true,
        errors: []
      });
      mockFactoryService.createPlan.mockReturnValue(mockPlan);
      mockRepository.create.mockRejectedValue(new Error('Database connection failed'));

      // Act
      const result = await service.createPlan(validPlanParams);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create plan');
    });

    it('应该处理Factory创建失败', async () => {
      // Arrange
      mockValidationService.validatePlanName.mockReturnValue({
        valid: true,
        errors: []
      });
      mockFactoryService.createPlan.mockImplementation(() => {
        throw new Error('Invalid plan parameters');
      });

      // Act
      const result = await service.createPlan(validPlanParams);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create plan');
    });
  });

  describe('🔴 协议核心 - getPlanById功能', () => {
    it('应该成功获取存在的计划', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockPlan);

      // Act
      const result = await service.getPlanById('plan-123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.planId).toBe('plan-123');
      expect(mockRepository.findById).toHaveBeenCalledWith('plan-123');
    });

    it('应该处理计划不存在的情况', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(undefined);

      // Act
      const result = await service.getPlanById('non-existent');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it('应该处理Repository查询失败', async () => {
      // Arrange
      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await service.getPlanById('plan-123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to get plan');
    });

    it('应该处理空planId参数', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(undefined);

      // Act
      const result = await service.getPlanById('');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(mockRepository.findById).toHaveBeenCalledWith('');
    });
  });

  describe('🔴 协议核心 - updatePlan功能', () => {
    const updateParams = {
      name: 'Updated Plan Name',
      description: 'Updated Description',
      status: PlanStatus.ACTIVE,
      priority: Priority.MEDIUM
    };

    it('应该成功更新存在的计划', async () => {
      // Arrange
      const mockPlanWithToObject = {
        ...mockPlan,
        toObject: jest.fn().mockReturnValue({
          planId: mockPlan.planId,
          contextId: mockPlan.contextId,
          name: mockPlan.name,
          description: mockPlan.description
        })
      };

      mockRepository.findById.mockResolvedValue(mockPlanWithToObject as any);
      mockValidationService.validatePlanName.mockReturnValue({
        valid: true,
        errors: []
      });
      mockValidationService.validatePlan.mockReturnValue({
        valid: true,
        errors: []
      });
      const updatedPlan = { ...mockPlan, name: updateParams.name };
      mockRepository.update.mockResolvedValue(updatedPlan as Plan);

      // Act
      const result = await service.updatePlan('plan-123', updateParams);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockRepository.findById).toHaveBeenCalledWith('plan-123');
      expect(mockValidationService.validatePlanName).toHaveBeenCalledWith(updateParams.name);
      expect(mockValidationService.validatePlan).toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('应该处理计划不存在的情况', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(undefined);

      // Act
      const result = await service.updatePlan('non-existent', updateParams);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Plan with ID non-existent not found');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('应该验证更新参数', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockPlan);
      mockValidationService.validatePlanName.mockReturnValue({
        valid: false,
        errors: ['Invalid name format']
      });

      // Act
      const result = await service.updatePlan('plan-123', {
        name: 'invalid@name'
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid plan name');
      expect(result.validationErrors).toEqual(['Invalid name format']);
    });

    it('应该处理Repository更新失败', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(mockPlan);
      mockValidationService.validatePlanName.mockReturnValue({
        valid: true,
        errors: []
      });
      mockRepository.update.mockRejectedValue(new Error('Update failed'));

      // Act
      const result = await service.updatePlan('plan-123', updateParams);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to update plan');
    });
  });

  describe('🔴 协议核心 - deletePlan功能', () => {
    it('应该成功删除存在的计划', async () => {
      // Arrange
      mockRepository.exists.mockResolvedValue(true);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      const result = await service.deletePlan('plan-123');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(mockRepository.exists).toHaveBeenCalledWith('plan-123');
      expect(mockRepository.delete).toHaveBeenCalledWith('plan-123');
    });

    it('应该处理计划不存在的情况', async () => {
      // Arrange
      mockRepository.exists.mockResolvedValue(false);

      // Act
      const result = await service.deletePlan('non-existent');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Plan with ID non-existent not found');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('应该处理Repository删除失败', async () => {
      // Arrange
      mockRepository.exists.mockResolvedValue(true);
      mockRepository.delete.mockRejectedValue(new Error('Delete failed'));

      // Act
      const result = await service.deletePlan('plan-123');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to delete plan');
    });

    it('应该处理空planId参数', async () => {
      // Arrange
      mockRepository.exists.mockResolvedValue(false);

      // Act
      const result = await service.deletePlan('');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Plan with ID  not found');
      expect(mockRepository.exists).toHaveBeenCalledWith('');
    });
  });

  describe('🔴 协议核心 - getPlans功能', () => {
    const mockPlans = [mockPlan, { ...mockPlan, planId: 'plan-456' }];

    it('应该成功获取计划列表', async () => {
      // Arrange
      mockRepository.findByContextId.mockResolvedValue(mockPlans as Plan[]);

      // Act
      const result = await service.getPlans({});

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.plans).toBeDefined();
      expect(Array.isArray(result.data?.plans)).toBe(true);
      expect(result.data?.plans.length).toBe(2);
      expect(result.data?.total).toBe(2);
      expect(result.data?.page).toBe(1);
      expect(result.data?.limit).toBe(10);
      expect(result.data?.totalPages).toBe(1);
      expect(mockRepository.findByContextId).toHaveBeenCalledWith('');
    });

    it('应该支持分页查询', async () => {
      // Arrange
      const query = {
        contextId: 'ctx-456',
        page: 2,
        limit: 1
      };
      mockRepository.findByContextId.mockResolvedValue(mockPlans as Plan[]);

      // Act
      const result = await service.getPlans(query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.plans.length).toBe(1);
      expect(result.data?.page).toBe(2);
      expect(result.data?.limit).toBe(1);
      expect(result.data?.totalPages).toBe(2);
      expect(mockRepository.findByContextId).toHaveBeenCalledWith('ctx-456');
    });

    it('应该处理Repository查询失败', async () => {
      // Arrange
      mockRepository.findByContextId.mockRejectedValue(new Error('Query failed'));

      // Act
      const result = await service.getPlans({});

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to get plans');
    });

    it('应该处理空结果', async () => {
      // Arrange
      mockRepository.findByContextId.mockResolvedValue([]);

      // Act
      const result = await service.getPlans({});

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.plans).toEqual([]);
      expect(result.data?.total).toBe(0);
    });
  });
});
