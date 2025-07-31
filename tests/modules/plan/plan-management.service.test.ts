/**
 * Plan管理服务单元测试
 * 
 * 基于Schema驱动测试原则，测试PlanManagementService的所有功能
 * 确保100%分支覆盖，发现并修复源代码问题
 * 
 * @version 1.0.0
 * @created 2025-01-28T16:00:00+08:00
 */

import { jest } from '@jest/globals';
import { PlanManagementService, OperationResult } from '../../../src/modules/plan/application/services/plan-management.service';
import { Plan } from '../../../src/modules/plan/domain/entities/plan.entity';
import { PlanFactoryService } from '../../../src/modules/plan/domain/services/plan-factory.service';
import { IPlanRepository } from '../../../src/modules/plan/domain/repositories/plan-repository.interface';
import { PlanValidationService, ValidationResult } from '../../../src/modules/plan/domain/services/plan-validation.service';
import { PlanConfiguration, createDefaultPlanConfiguration } from '../../../src/modules/plan/domain/value-objects/plan-configuration.value-object';
import { UUID, PlanStatus, ExecutionStrategy, Priority } from '../../../src/public/shared/types/plan-types';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';
import { PERFORMANCE_THRESHOLDS } from '../../test-config';

describe('PlanManagementService', () => {
  let service: PlanManagementService;
  let mockRepository: jest.Mocked<IPlanRepository>;
  let mockFactoryService: jest.Mocked<PlanFactoryService>;
  let mockValidationService: jest.Mocked<PlanValidationService>;

  beforeEach(() => {
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

    mockFactoryService = {
      createPlan: jest.fn(),
      createTask: jest.fn(),
      createDependency: jest.fn(),
      createTimeline: jest.fn(),
      createRiskAssessment: jest.fn()
    } as jest.Mocked<PlanFactoryService>;

    mockValidationService = {
      validatePlan: jest.fn(),
      validateTasks: jest.fn(),
      validateDependencies: jest.fn(),
      validatePlanExecutability: jest.fn(),
      validatePlanName: jest.fn(),
      validateTaskName: jest.fn(),
      detectCycles: jest.fn()
    } as unknown as jest.Mocked<PlanValidationService>;

    // 创建服务实例 - 基于实际构造函数
    service = new PlanManagementService(
      mockRepository,
      mockValidationService,
      mockFactoryService
    );
  });

  afterEach(async () => {
    // 清理测试数据
    await TestDataFactory.Manager.cleanup();
    jest.clearAllMocks();
  });

  describe('createPlan', () => {
    it('应该成功创建Plan', async () => {
      // 准备测试数据 - 基于实际Schema
      const createParams = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Plan',
        description: 'Test plan description',
        goals: ['Goal 1', 'Goal 2'],
        execution_strategy: 'sequential' as ExecutionStrategy,
        priority: 'medium' as Priority,
        estimated_duration: { value: 60, unit: 'minutes' },
        configuration: {},
        metadata: { test: true }
      };

      const mockPlan = new Plan({
        plan_id: TestDataFactory.Base.generateUUID(),
        context_id: createParams.context_id,
        name: createParams.name,
        description: createParams.description,
        status: 'draft' as PlanStatus,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: createParams.goals,
        tasks: [],
        dependencies: [],
        execution_strategy: createParams.execution_strategy,
        priority: createParams.priority,
        estimated_duration: createParams.estimated_duration,
        progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
        configuration: createDefaultPlanConfiguration(),
        metadata: createParams.metadata
      });

      // 设置Mock返回值 - 基于实际接口
      const validationResult: ValidationResult = { valid: true, errors: [] };
      mockValidationService.validatePlanName.mockReturnValue(validationResult);
      mockFactoryService.createPlan.mockReturnValue(mockPlan);
      mockValidationService.validatePlan.mockReturnValue(validationResult);
      mockRepository.create.mockResolvedValue(mockPlan);

      // 执行测试
      const result = await TestHelpers.Performance.expectExecutionTime(
        () => service.createPlan(createParams),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.PLAN_CREATION
      );

      // 验证结果 - 基于实际返回类型
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPlan);
      expect(mockValidationService.validatePlanName).toHaveBeenCalledWith(createParams.name);
      expect(mockFactoryService.createPlan).toHaveBeenCalledWith(expect.objectContaining({
        context_id: createParams.context_id,
        name: createParams.name,
        description: createParams.description
      }));
      expect(mockValidationService.validatePlan).toHaveBeenCalledWith(mockPlan);
      expect(mockRepository.create).toHaveBeenCalledWith(mockPlan);
    });

    it('应该处理计划名称验证失败', async () => {
      // 准备测试数据
      const createParams = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: '', // 无效名称
        description: 'Test description',
        goals: ['Goal 1']
      };

      const validationResult: ValidationResult = { 
        valid: false, 
        errors: ['Plan name is required'] 
      };
      mockValidationService.validatePlanName.mockReturnValue(validationResult);

      // 执行测试
      const result = await service.createPlan(createParams);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid plan name');
      expect(result.validationErrors).toEqual(['Plan name is required']);
      expect(mockFactoryService.createPlan).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('应该处理计划验证失败', async () => {
      // 准备测试数据
      const createParams = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Plan',
        description: 'Test description',
        goals: ['Goal 1']
      };

      const mockPlan = new Plan({
        plan_id: TestDataFactory.Base.generateUUID(),
        context_id: createParams.context_id,
        name: createParams.name,
        description: createParams.description,
        status: 'draft' as PlanStatus,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: createParams.goals,
        tasks: [],
        dependencies: [],
        execution_strategy: 'sequential',
        priority: 'medium',
        progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
        configuration: createDefaultPlanConfiguration()
      });

      const nameValidationResult: ValidationResult = { valid: true, errors: [] };
      const planValidationResult: ValidationResult = { 
        valid: false, 
        errors: ['Invalid plan configuration'] 
      };

      mockValidationService.validatePlanName.mockReturnValue(nameValidationResult);
      mockFactoryService.createPlan.mockReturnValue(mockPlan);
      mockValidationService.validatePlan.mockReturnValue(planValidationResult);

      // 执行测试
      const result = await service.createPlan(createParams);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('Plan validation failed');
      expect(result.validationErrors).toEqual(['Invalid plan configuration']);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('应该处理数据库错误', async () => {
      // 准备测试数据
      const createParams = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Plan',
        description: 'Test description',
        goals: ['Goal 1']
      };

      const mockPlan = new Plan({
        plan_id: TestDataFactory.Base.generateUUID(),
        context_id: createParams.context_id,
        name: createParams.name,
        description: createParams.description,
        status: 'draft' as PlanStatus,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: createParams.goals,
        tasks: [],
        dependencies: [],
        execution_strategy: 'sequential',
        priority: 'medium',
        progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
        configuration: createDefaultPlanConfiguration()
      });

      const validationResult: ValidationResult = { valid: true, errors: [] };
      const dbError = new Error('Database connection failed');

      mockValidationService.validatePlanName.mockReturnValue(validationResult);
      mockFactoryService.createPlan.mockReturnValue(mockPlan);
      mockValidationService.validatePlan.mockReturnValue(validationResult);
      mockRepository.create.mockRejectedValue(dbError);

      // 执行测试
      const result = await service.createPlan(createParams);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create plan: Database connection failed');
    });

    it('应该测试边界条件', async () => {
      const boundaryTests = [
        {
          name: '空字符串名称',
          input: { 
            context_id: TestDataFactory.Base.generateUUID(),
            name: '', 
            description: 'Test' 
          },
          expectedError: 'Invalid plan name'
        },
        {
          name: '超长名称',
          input: { 
            context_id: TestDataFactory.Base.generateUUID(),
            name: 'a'.repeat(1000), 
            description: 'Test' 
          },
          expectedError: 'Invalid plan name'
        },
        {
          name: '空目标数组',
          input: { 
            context_id: TestDataFactory.Base.generateUUID(),
            name: 'Valid Name', 
            description: 'Test',
            goals: []
          },
          expectedSuccess: true
        }
      ];

      for (const test of boundaryTests) {
        if (test.expectedError) {
          const validationResult: ValidationResult = { 
            valid: false, 
            errors: [test.expectedError] 
          };
          mockValidationService.validatePlanName.mockReturnValue(validationResult);
          
          const result = await service.createPlan(test.input);
          expect(result.success).toBe(false);
          expect(result.error).toBe(test.expectedError);
        } else if (test.expectedSuccess) {
          const validationResult: ValidationResult = { valid: true, errors: [] };
          const mockPlan = new Plan({
            plan_id: TestDataFactory.Base.generateUUID(),
            context_id: test.input.context_id,
            name: test.input.name,
            description: test.input.description,
            status: 'draft' as PlanStatus,
            version: '1.0.0',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            goals: test.input.goals || [],
            tasks: [],
            dependencies: [],
            execution_strategy: 'sequential',
            priority: 'medium',
            progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
            configuration: createDefaultPlanConfiguration()
          });

          mockValidationService.validatePlanName.mockReturnValue(validationResult);
          mockFactoryService.createPlan.mockReturnValue(mockPlan);
          mockValidationService.validatePlan.mockReturnValue(validationResult);
          mockRepository.create.mockResolvedValue(mockPlan);

          const result = await service.createPlan(test.input);
          expect(result.success).toBe(true);
        }
        
        // 清理Mock状态
        jest.clearAllMocks();
      }
    });
  });

  describe('getPlan', () => {
    it('应该成功获取Plan', async () => {
      // 准备测试数据
      const planId = TestDataFactory.Base.generateUUID();
      const mockPlan = new Plan({
        plan_id: planId,
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Plan',
        description: 'Test Description',
        status: 'active' as PlanStatus,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: ['Goal 1'],
        tasks: [],
        dependencies: [],
        execution_strategy: 'sequential',
        priority: 'medium',
        progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
        configuration: createDefaultPlanConfiguration()
      });

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(mockPlan);

      // 执行测试
      const result = await TestHelpers.Performance.expectExecutionTime(
        () => service.getPlan(planId),
        PERFORMANCE_THRESHOLDS.UNIT_TEST.SERVICE_OPERATION
      );

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPlan);
      expect(mockRepository.findById).toHaveBeenCalledWith(planId);
    });

    it('应该处理Plan不存在的情况', async () => {
      // 准备测试数据
      const planId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(undefined);

      // 执行测试
      const result = await service.getPlan(planId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe(`Plan with ID ${planId} not found`);
    });

    it('应该处理数据库错误', async () => {
      // 准备测试数据
      const planId = TestDataFactory.Base.generateUUID();
      const dbError = new Error('Database connection failed');

      // 设置Mock返回值
      mockRepository.findById.mockRejectedValue(dbError);

      // 执行测试
      const result = await service.getPlan(planId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to get plan: Database connection failed');
    });
  });

  describe('updatePlan', () => {
    it('应该成功更新Plan', async () => {
      // 准备测试数据
      const planId = TestDataFactory.Base.generateUUID();
      const updateData = {
        name: 'Updated Plan Name',
        description: 'Updated Description'
      };

      const existingPlan = new Plan({
        plan_id: planId,
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Original Plan',
        description: 'Original Description',
        status: 'active' as PlanStatus,
        version: '1.0.0',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        goals: ['Goal 1'],
        tasks: [],
        dependencies: [],
        execution_strategy: 'sequential',
        priority: 'medium',
        progress: { completed_tasks: 0, total_tasks: 0, percentage: 0 },
        configuration: createDefaultPlanConfiguration()
      });

      const updatedPlan = new Plan({
        ...existingPlan.toObject(),
        ...updateData,
        updated_at: new Date().toISOString()
      });

      const validationResult: ValidationResult = { valid: true, errors: [] };

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(existingPlan);
      mockValidationService.validatePlanName.mockReturnValue(validationResult);
      mockValidationService.validatePlan.mockReturnValue(validationResult);
      mockRepository.update.mockResolvedValue(updatedPlan);

      // 执行测试
      const result = await service.updatePlan(planId, updateData);

      // 验证结果
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockRepository.findById).toHaveBeenCalledWith(planId);
      expect(mockValidationService.validatePlanName).toHaveBeenCalledWith(updateData.name);
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it('应该处理Plan不存在的情况', async () => {
      // 准备测试数据
      const planId = TestDataFactory.Base.generateUUID();
      const updateData = { name: 'Updated Plan' };

      // 设置Mock返回值
      mockRepository.findById.mockResolvedValue(undefined);

      // 执行测试
      const result = await service.updatePlan(planId, updateData);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe(`Plan with ID ${planId} not found`);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deletePlan', () => {
    it('应该成功删除Plan', async () => {
      // 准备测试数据
      const planId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockRepository.exists.mockResolvedValue(true);
      mockRepository.delete.mockResolvedValue(true);

      // 执行测试
      const result = await service.deletePlan(planId);

      // 验证结果
      expect(result.success).toBe(true);
      expect(mockRepository.exists).toHaveBeenCalledWith(planId);
      expect(mockRepository.delete).toHaveBeenCalledWith(planId);
    });

    it('应该处理Plan不存在的情况', async () => {
      // 准备测试数据
      const planId = TestDataFactory.Base.generateUUID();

      // 设置Mock返回值
      mockRepository.exists.mockResolvedValue(false);

      // 执行测试
      const result = await service.deletePlan(planId);

      // 验证结果
      expect(result.success).toBe(false);
      expect(result.error).toBe(`Plan with ID ${planId} not found`);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
