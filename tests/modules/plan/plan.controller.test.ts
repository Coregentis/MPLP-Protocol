/**
 * Plan控制器单元测试
 *
 * @description 验证Plan控制器的API功能和错误处理
 * @version 1.0.0
 * @layer 测试层 - 单元测试
 * @coverage 目标覆盖率 95%+
 * @pattern 与Context模块使用IDENTICAL的控制器测试模式
 */

import { PlanController } from '../../../src/modules/plan/api/controllers/plan.controller';
import { PlanManagementService } from '../../../src/modules/plan/application/services/plan-management.service';
import {
  CreatePlanDto,
  UpdatePlanDto,
  PlanQueryDto,
  PlanResponseDto,
  PlanOperationResultDto
} from '../../../src/modules/plan/api/dto/plan.dto';
import { PlanEntityData } from '../../../src/modules/plan/api/mappers/plan.mapper';

// Mock PlanManagementService
jest.mock('../../../src/modules/plan/application/services/plan-management.service');

describe('PlanController单元测试', () => {
  let controller: PlanController;
  let mockPlanManagementService: jest.Mocked<PlanManagementService>;

  beforeEach(() => {
    // 创建mock服务
    mockPlanManagementService = {
      createPlan: jest.fn(),
      getPlan: jest.fn(),
      updatePlan: jest.fn(),
      deletePlan: jest.fn(),
      executePlan: jest.fn(),
      optimizePlan: jest.fn(),
      validatePlan: jest.fn()
    } as any;

    // 创建控制器实例
    controller = new PlanController(mockPlanManagementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPlan方法测试', () => {
    it('应该成功创建Plan', async () => {
      // 📋 Arrange
      const createDto: CreatePlanDto = {
        contextId: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Test Plan',
        description: 'Test plan description',
        priority: 'high',
        tasks: [
          {
            name: 'Test Task',
            type: 'atomic',
            priority: 'medium'
          }
        ]
      };

      const mockPlanData: PlanEntityData = {
        protocolVersion: '1.0.0',
        timestamp: new Date(),
        planId: '550e8400-e29b-41d4-a716-446655440011',
        contextId: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Test Plan',
        description: 'Test plan description',
        status: 'draft',
        priority: 'high',
        tasks: [
          {
            taskId: 'task-001',
            name: 'Test Task',
            type: 'atomic',
            status: 'pending',
            priority: 'medium'
          }
        ],
        auditTrail: {
          enabled: true,
          retentionDays: 90
        },
        monitoringIntegration: {},
        performanceMetrics: {}
      };

      mockPlanManagementService.createPlan.mockResolvedValue(mockPlanData);

      // 🎬 Act
      const result = await controller.createPlan(createDto);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.planId).toBe('550e8400-e29b-41d4-a716-446655440011');
      expect(result.message).toBe('Plan created successfully');
      expect(result.metadata).toEqual({
        name: 'Test Plan',
        status: 'draft',
        priority: 'high',
        taskCount: 1
      });
      expect(mockPlanManagementService.createPlan).toHaveBeenCalledWith({
        contextId: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Test Plan',
        description: 'Test plan description',
        priority: 'high',
        tasks: [
          {
            name: 'Test Task',
            description: undefined,
            type: 'atomic',
            priority: 'medium'
          }
        ]
      });
    });

    it('应该处理创建Plan时的验证错误', async () => {
      // 📋 Arrange
      const invalidDto: CreatePlanDto = {
        contextId: '',
        name: '',
        description: 'Invalid plan'
      };

      // 🎬 Act
      const result = await controller.createPlan(invalidDto);

      // ✅ Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('PLAN_CREATION_FAILED');
      expect(result.error?.message).toContain('Plan name is required');
      expect(mockPlanManagementService.createPlan).not.toHaveBeenCalled();
    });

    it('应该处理服务层抛出的错误', async () => {
      // 📋 Arrange
      const createDto: CreatePlanDto = {
        contextId: '550e8400-e29b-41d4-a716-446655440012',
        name: 'Test Plan'
      };

      mockPlanManagementService.createPlan.mockRejectedValue(new Error('Database connection failed'));

      // 🎬 Act
      const result = await controller.createPlan(createDto);

      // ✅ Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('PLAN_CREATION_FAILED');
      expect(result.error?.message).toBe('Database connection failed');
    });
  });

  describe('getPlanById方法测试', () => {
    it('应该成功获取Plan', async () => {
      // 📋 Arrange
      const planId = '550e8400-e29b-41d4-a716-446655440000';
      const mockPlanData: PlanEntityData = {
        protocolVersion: '1.0.0',
        timestamp: new Date('2024-01-01T00:00:00.000Z'),
        planId: '550e8400-e29b-41d4-a716-446655440000',
        contextId: '550e8400-e29b-41d4-a716-446655440013',
        name: 'Test Plan',
        description: 'Test plan description',
        status: 'active',
        priority: 'high',
        tasks: [],
        auditTrail: {
          enabled: true,
          retentionDays: 90
        },
        monitoringIntegration: {},
        performanceMetrics: {}
      };

      mockPlanManagementService.getPlan.mockResolvedValue(mockPlanData);

      // 🎬 Act
      const result = await controller.getPlanById(planId);

      // ✅ Assert
      expect(result).not.toBeNull();
      expect(result?.planId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result?.name).toBe('Test Plan');
      expect(result?.status).toBe('active');
      expect(result?.priority).toBe('high');
      expect(mockPlanManagementService.getPlan).toHaveBeenCalledWith(planId);
    });

    it('应该处理Plan不存在的情况', async () => {
      // 📋 Arrange
      const planId = '550e8400-e29b-41d4-a716-446655440001';
      mockPlanManagementService.getPlan.mockResolvedValue(null);

      // 🎬 Act
      const result = await controller.getPlanById(planId);

      // ✅ Assert
      expect(result).toBeNull();
      expect(mockPlanManagementService.getPlan).toHaveBeenCalledWith(planId);
    });

    it('应该处理无效的UUID格式', async () => {
      // 📋 Arrange
      const invalidPlanId = 'invalid-uuid';

      // 🎬 Act & Assert
      await expect(controller.getPlanById(invalidPlanId)).rejects.toThrow('Invalid plan ID format');
      expect(mockPlanManagementService.getPlan).not.toHaveBeenCalled();
    });
  });

  describe('updatePlan方法测试', () => {
    it('应该成功更新Plan', async () => {
      // 📋 Arrange
      const planId = '550e8400-e29b-41d4-a716-446655440002';
      const updateDto: UpdatePlanDto = {
        planId: planId,
        name: 'Updated Plan Name',
        description: 'Updated description',
        status: 'active',
        priority: 'critical'
      };

      const mockUpdatedPlan: PlanEntityData = {
        protocolVersion: '1.0.0',
        timestamp: new Date(),
        planId: planId,
        contextId: '550e8400-e29b-41d4-a716-446655440014',
        name: 'Updated Plan Name',
        description: 'Updated description',
        status: 'active',
        priority: 'critical',
        tasks: [],
        auditTrail: {
          enabled: true,
          retentionDays: 90
        },
        monitoringIntegration: {},
        performanceMetrics: {}
      };

      mockPlanManagementService.updatePlan.mockResolvedValue(mockUpdatedPlan);

      // 🎬 Act
      const result = await controller.updatePlan(planId, updateDto);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.planId).toBe(planId);
      expect(result.message).toBe('Plan updated successfully');
      expect(result.metadata).toEqual({
        name: 'Updated Plan Name',
        status: 'active',
        priority: 'critical',
        taskCount: 0
      });
      expect(mockPlanManagementService.updatePlan).toHaveBeenCalledWith({
        planId: planId,
        name: 'Updated Plan Name',
        description: 'Updated description',
        status: 'active',
        priority: 'critical'
      });
    });

    it('应该处理更新验证错误', async () => {
      // 📋 Arrange
      const planId = '550e8400-e29b-41d4-a716-446655440003';
      const invalidUpdateDto: UpdatePlanDto = {
        planId: planId,
        name: '' // 空名称应该触发验证错误
      };

      // 🎬 Act
      const result = await controller.updatePlan(planId, invalidUpdateDto);

      // ✅ Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('PLAN_UPDATE_FAILED');
      expect(result.error?.message).toContain('Plan name cannot be empty');
      expect(mockPlanManagementService.updatePlan).not.toHaveBeenCalled();
    });
  });

  describe('deletePlan方法测试', () => {
    it('应该成功删除Plan', async () => {
      // 📋 Arrange
      const planId = '550e8400-e29b-41d4-a716-446655440004';
      mockPlanManagementService.deletePlan.mockResolvedValue(undefined);

      // 🎬 Act
      const result = await controller.deletePlan(planId);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.planId).toBe(planId);
      expect(result.message).toBe('Plan deleted successfully');
      expect(mockPlanManagementService.deletePlan).toHaveBeenCalledWith(planId);
    });

    it('应该处理删除时的服务错误', async () => {
      // 📋 Arrange
      const planId = '550e8400-e29b-41d4-a716-446655440005';
      mockPlanManagementService.deletePlan.mockRejectedValue(new Error('Plan not found'));

      // 🎬 Act
      const result = await controller.deletePlan(planId);

      // ✅ Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('PLAN_DELETION_FAILED');
      expect(result.error?.message).toBe('Plan not found');
    });
  });

  describe('queryPlans方法测试', () => {
    it('应该返回空结果（暂未实现）', async () => {
      // 📋 Arrange
      const queryDto: PlanQueryDto = {
        status: 'active',
        priority: 'high'
      };
      const pagination = { page: 1, limit: 10 };

      // 🎬 Act
      const result = await controller.queryPlans(queryDto, pagination);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      });
    });

    it('应该处理查询验证错误', async () => {
      // 📋 Arrange
      const invalidQueryDto: PlanQueryDto = {
        contextId: 'invalid-uuid'
      };

      // 🎬 Act
      const result = await controller.queryPlans(invalidQueryDto);

      // ✅ Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('PLAN_QUERY_FAILED');
      expect(result.error?.message).toContain('Invalid context ID format');
    });
  });

  describe('executePlan方法测试', () => {
    it('应该成功执行Plan', async () => {
      // 📋 Arrange
      const planId = '550e8400-e29b-41d4-a716-446655440006';
      const mockExecutionResult = {
        status: 'completed' as const,
        totalTasks: 5,
        completedTasks: 5,
        errors: []
      };

      mockPlanManagementService.executePlan.mockResolvedValue(mockExecutionResult);

      // 🎬 Act
      const result = await controller.executePlan(planId);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.planId).toBe(planId);
      expect(result.message).toBe('Plan execution completed');
      expect(result.metadata).toEqual({
        status: 'completed',
        totalTasks: 5,
        completedTasks: 5
      });
      expect(mockPlanManagementService.executePlan).toHaveBeenCalledWith(planId);
    });
  });

  describe('optimizePlan方法测试', () => {
    it('应该成功优化Plan', async () => {
      // 📋 Arrange
      const planId = '550e8400-e29b-41d4-a716-446655440007';
      const mockOptimizationResult = {
        originalScore: 75,
        optimizedScore: 90,
        improvements: ['Task reordering', 'Resource optimization']
      };

      mockPlanManagementService.optimizePlan.mockResolvedValue(mockOptimizationResult);

      // 🎬 Act
      const result = await controller.optimizePlan(planId);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.planId).toBe(planId);
      expect(result.message).toBe('Plan optimization completed');
      expect(result.metadata).toEqual({
        originalScore: 75,
        optimizedScore: 90,
        improvements: ['Task reordering', 'Resource optimization']
      });
    });
  });

  describe('validatePlan方法测试', () => {
    it('应该成功验证Plan', async () => {
      // 📋 Arrange
      const planId = '550e8400-e29b-41d4-a716-446655440008';
      const mockValidationResult = {
        isValid: true,
        violations: [],
        recommendations: ['Consider adding more tasks']
      };

      mockPlanManagementService.validatePlan.mockResolvedValue(mockValidationResult);

      // 🎬 Act
      const result = await controller.validatePlan(planId);

      // ✅ Assert
      expect(result.success).toBe(true);
      expect(result.planId).toBe(planId);
      expect(result.message).toBe('Plan validation completed');
      expect(result.metadata).toEqual({
        isValid: true,
        violationCount: 0,
        recommendationCount: 1
      });
    });
  });

  describe('辅助方法测试', () => {
    it('应该正确验证UUID格式', () => {
      // 测试私有方法通过公共方法的行为来验证
      // 有效UUID应该不抛出错误
      expect(async () => {
        await controller.getPlanById('550e8400-e29b-41d4-a716-446655440000');
      }).not.toThrow();
    });

    it('应该正确转换实体数据为响应DTO', async () => {
      // 📋 Arrange
      const planId = '550e8400-e29b-41d4-a716-446655440009';
      const mockPlanData: PlanEntityData = {
        protocolVersion: '1.0.0',
        timestamp: new Date('2024-01-01T12:00:00.000Z'),
        planId: '550e8400-e29b-41d4-a716-446655440009',
        contextId: '550e8400-e29b-41d4-a716-446655440015',
        name: 'Test Plan',
        description: 'Test description',
        status: 'active',
        priority: 'high',
        tasks: [
          {
            taskId: 'task-001',
            name: 'Test Task',
            type: 'atomic',
            status: 'pending',
            priority: 'medium'
          }
        ],
        auditTrail: {
          enabled: true,
          retentionDays: 90
        },
        monitoringIntegration: { enabled: true },
        performanceMetrics: { responseTime: 100 },
        createdAt: new Date('2024-01-01T10:00:00.000Z'),
        updatedAt: new Date('2024-01-01T11:00:00.000Z')
      };

      mockPlanManagementService.getPlan.mockResolvedValue(mockPlanData);

      // 🎬 Act
      const result = await controller.getPlanById(planId);

      // ✅ Assert
      expect(result).not.toBeNull();
      expect(result?.planId).toBe('550e8400-e29b-41d4-a716-446655440009');
      expect(result?.contextId).toBe('550e8400-e29b-41d4-a716-446655440015');
      expect(result?.name).toBe('Test Plan');
      expect(result?.status).toBe('active');
      expect(result?.priority).toBe('high');
      expect(result?.timestamp).toBe('2024-01-01T12:00:00.000Z');
      expect(result?.tasks).toHaveLength(1);
      expect(result?.tasks[0].taskId).toBe('task-001');
      expect(result?.tasks[0].name).toBe('Test Task');
      expect(result?.auditTrail).toEqual({
        enabled: true,
        retentionDays: 90
      });
      expect(result?.createdAt).toBe('2024-01-01T10:00:00.000Z');
      expect(result?.updatedAt).toBe('2024-01-01T11:00:00.000Z');
    });
  });
});
