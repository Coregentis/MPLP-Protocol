/**
 * Plan Controller 协议级测试
 * 
 * 测试目标：达到协议级100%覆盖率标准
 * 测试原则：基于实际实现构建测试，发现源代码问题时修复源代码
 * 
 * 覆盖范围：
 * - API端点100%测试
 * - 请求/响应格式验证
 * - 错误处理验证
 * - Schema验证测试
 * - 业务逻辑验证
 */

import { Request, Response } from 'express';
import { PlanController } from '../../../api/controllers/plan.controller';
import { CreatePlanCommandHandler } from '../../../application/commands/create-plan.command';
import { UpdatePlanCommandHandler } from '../../../application/commands/update-plan.command';
import { DeletePlanCommandHandler } from '../../../application/commands/delete-plan.command';
import { GetPlanByIdQueryHandler } from '../../../application/queries/get-plan-by-id.query';
import { GetPlansQueryHandler } from '../../../application/queries/get-plans.query';
import { PlanManagementService } from '../../../application/services/plan-management.service';
import { PlanModuleAdapter } from '../../../infrastructure/adapters/plan-module.adapter';
import { Plan } from '../../../domain/entities/plan.entity';
import { PlanStatus, TaskStatus, Priority } from '../../../types';

// Mock dependencies
jest.mock('../../../application/commands/create-plan.command');
jest.mock('../../../application/commands/update-plan.command');
jest.mock('../../../application/commands/delete-plan.command');
jest.mock('../../../application/queries/get-plan-by-id.query');
jest.mock('../../../application/queries/get-plans.query');
jest.mock('../../../application/services/plan-management.service');
jest.mock('../../../infrastructure/adapters/plan-module.adapter');

describe('PlanController - 协议级测试', () => {
  let controller: PlanController;
  let mockCreateCommandHandler: jest.Mocked<CreatePlanCommandHandler>;
  let mockUpdateCommandHandler: jest.Mocked<UpdatePlanCommandHandler>;
  let mockDeleteCommandHandler: jest.Mocked<DeletePlanCommandHandler>;
  let mockGetByIdQueryHandler: jest.Mocked<GetPlanByIdQueryHandler>;
  let mockGetPlansQueryHandler: jest.Mocked<GetPlansQueryHandler>;
  let mockPlanManagementService: jest.Mocked<PlanManagementService>;
  let mockPlanModuleAdapter: jest.Mocked<PlanModuleAdapter>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // 创建mock实例
    mockCreateCommandHandler = new CreatePlanCommandHandler({} as any) as jest.Mocked<CreatePlanCommandHandler>;
    mockUpdateCommandHandler = new UpdatePlanCommandHandler({} as any) as jest.Mocked<UpdatePlanCommandHandler>;
    mockDeleteCommandHandler = new DeletePlanCommandHandler({} as any) as jest.Mocked<DeletePlanCommandHandler>;
    mockGetByIdQueryHandler = new GetPlanByIdQueryHandler({} as any) as jest.Mocked<GetPlanByIdQueryHandler>;
    mockGetPlansQueryHandler = new GetPlansQueryHandler({} as any) as jest.Mocked<GetPlansQueryHandler>;
    mockPlanManagementService = new PlanManagementService({} as any) as jest.Mocked<PlanManagementService>;
    mockPlanModuleAdapter = new PlanModuleAdapter({} as any) as jest.Mocked<PlanModuleAdapter>;

    // 创建controller实例
    controller = new PlanController(
      mockCreateCommandHandler,
      mockUpdateCommandHandler,
      mockDeleteCommandHandler,
      mockGetByIdQueryHandler,
      mockGetPlansQueryHandler,
      mockPlanManagementService,
      mockPlanModuleAdapter
    );

    // 创建mock request和response
    mockRequest = {
      body: {},
      params: {},
      query: {},
      headers: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    // 重置所有mocks
    jest.clearAllMocks();
  });

  describe('🔴 协议核心 - createPlan', () => {
    it('应该成功创建计划 - 标准snake_case格式', async () => {
      // Arrange
      const requestData = {
        context_id: 'ctx-12345',
        name: 'Test Plan',
        description: 'Test Description',
        goals: ['Goal 1', 'Goal 2'],
        tasks: [
          {
            task_id: 'task-1',
            name: 'Task 1',
            description: 'Task 1 Description',
            status: TaskStatus.PENDING,
            priority: Priority.MEDIUM
          }
        ],
        dependencies: [],
        execution_strategy: 'sequential',
        priority: Priority.HIGH
      };

      const expectedPlan = new Plan({
        planId: 'plan-12345',
        contextId: 'ctx-12345',
        name: 'Test Plan',
        description: 'Test Description',
        goals: ['Goal 1', 'Goal 2'],
        tasks: requestData.tasks,
        dependencies: [],
        executionStrategy: 'sequential',
        priority: Priority.HIGH,
        status: PlanStatus.DRAFT,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        createdBy: 'system'
      });

      mockRequest.body = requestData;
      mockCreateCommandHandler.execute = jest.fn().mockResolvedValue({
        success: true,
        data: expectedPlan
      });

      // Act
      await controller.createPlan(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCreateCommandHandler.execute).toHaveBeenCalledWith({
        contextId: requestData.context_id,
        name: requestData.name,
        description: requestData.description,
        goals: requestData.goals,
        tasks: requestData.tasks,
        dependencies: requestData.dependencies,
        executionStrategy: requestData.execution_strategy,
        priority: requestData.priority
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedPlan
      });
    });

    it('应该成功创建计划 - 兼容camelCase格式', async () => {
      // Arrange
      const requestData = {
        contextId: 'ctx-12345',
        name: 'Test Plan',
        description: 'Test Description',
        goals: ['Goal 1', 'Goal 2'],
        tasks: [],
        dependencies: [],
        executionStrategy: 'parallel',
        priority: Priority.LOW
      };

      mockRequest.body = requestData;
      mockCreateCommandHandler.execute = jest.fn().mockResolvedValue({
        success: true,
        data: {} as Plan
      });

      // Act
      await controller.createPlan(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCreateCommandHandler.execute).toHaveBeenCalledWith({
        contextId: requestData.contextId,
        name: requestData.name,
        description: requestData.description,
        goals: requestData.goals,
        tasks: requestData.tasks,
        dependencies: requestData.dependencies,
        executionStrategy: requestData.executionStrategy,
        priority: requestData.priority
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('应该处理创建失败的情况', async () => {
      // Arrange
      const requestData = {
        context_id: 'ctx-12345',
        name: 'Test Plan'
      };

      mockRequest.body = requestData;
      mockCreateCommandHandler.execute = jest.fn().mockResolvedValue({
        success: false,
        error: 'Validation failed: missing required fields'
      });

      // Act
      await controller.createPlan(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed: missing required fields'
      });
    });

    it('应该处理服务器内部错误', async () => {
      // Arrange
      mockRequest.body = { context_id: 'ctx-12345' };
      mockCreateCommandHandler.execute = jest.fn().mockRejectedValue(
        new Error('Database connection failed')
      );

      // Act
      await controller.createPlan(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });
    });
  });

  describe('🔴 协议核心 - getPlanById', () => {
    it('应该成功获取计划详情', async () => {
      // Arrange
      const planId = 'plan-12345';
      const expectedPlan = new Plan({
        planId,
        contextId: 'ctx-12345',
        name: 'Test Plan',
        description: 'Test Description',
        goals: ['Goal 1'],
        tasks: [],
        dependencies: [],
        executionStrategy: 'sequential',
        priority: Priority.MEDIUM,
        status: PlanStatus.ACTIVE,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        createdBy: 'user-123'
      });

      mockRequest.params = { id: planId };
      mockGetByIdQueryHandler.execute = jest.fn().mockResolvedValue({
        success: true,
        data: expectedPlan
      });

      // Act
      await controller.getPlanById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockGetByIdQueryHandler.execute).toHaveBeenCalledWith({ planId });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedPlan
      });
    });

    it('应该处理计划不存在的情况', async () => {
      // Arrange
      const planId = 'non-existent-plan';
      mockRequest.params = { id: planId };
      mockGetByIdQueryHandler.execute = jest.fn().mockResolvedValue({
        success: false,
        error: 'Plan not found'
      });

      // Act
      await controller.getPlanById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Plan not found'
      });
    });
  });

  describe('🔴 协议核心 - updatePlan', () => {
    it('应该成功更新计划', async () => {
      // Arrange
      const planId = 'plan-12345';
      const updateData = {
        name: 'Updated Plan Name',
        description: 'Updated Description',
        status: PlanStatus.ACTIVE
      };

      mockRequest.params = { id: planId };
      mockRequest.body = updateData;
      mockUpdateCommandHandler.execute = jest.fn().mockResolvedValue({
        success: true,
        data: { ...updateData, planId }
      });

      // Act
      await controller.updatePlan(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockUpdateCommandHandler.execute).toHaveBeenCalledWith({
        planId,
        ...updateData
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('应该处理更新失败的情况', async () => {
      // Arrange
      const planId = 'plan-12345';
      mockRequest.params = { id: planId };
      mockRequest.body = { status: 'invalid-status' };
      mockUpdateCommandHandler.execute = jest.fn().mockResolvedValue({
        success: false,
        error: 'Invalid status value'
      });

      // Act
      await controller.updatePlan(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('🔴 协议核心 - deletePlan', () => {
    it('应该成功删除计划', async () => {
      // Arrange
      const planId = 'plan-12345';
      mockRequest.params = { id: planId };
      mockDeleteCommandHandler.execute = jest.fn().mockResolvedValue({
        success: true,
        data: { deleted: true }
      });

      // Act
      await controller.deletePlan(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockDeleteCommandHandler.execute).toHaveBeenCalledWith({ planId });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('应该处理删除不存在计划的情况', async () => {
      // Arrange
      const planId = 'non-existent-plan';
      mockRequest.params = { id: planId };
      mockDeleteCommandHandler.execute = jest.fn().mockResolvedValue({
        success: false,
        error: 'Plan not found'
      });

      // Act
      await controller.deletePlan(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
    });
  });

  describe('🔴 协议核心 - getPlans', () => {
    it('应该成功获取计划列表', async () => {
      // Arrange
      const mockPlans = [
        new Plan({
          planId: 'plan-1',
          contextId: 'ctx-1',
          name: 'Plan 1',
          description: 'Description 1',
          goals: [],
          tasks: [],
          dependencies: [],
          executionStrategy: 'sequential',
          priority: Priority.HIGH,
          status: PlanStatus.ACTIVE,
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          createdBy: 'user-1'
        }),
        new Plan({
          planId: 'plan-2',
          contextId: 'ctx-2',
          name: 'Plan 2',
          description: 'Description 2',
          goals: [],
          tasks: [],
          dependencies: [],
          executionStrategy: 'parallel',
          priority: Priority.MEDIUM,
          status: PlanStatus.DRAFT,
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          createdBy: 'user-2'
        })
      ];

      mockRequest.query = { contextId: 'ctx-1' };
      mockGetPlansQueryHandler.execute = jest.fn().mockResolvedValue({
        success: true,
        data: mockPlans
      });

      // Act
      await controller.getPlans(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockGetPlansQueryHandler.execute).toHaveBeenCalledWith({
        contextId: 'ctx-1'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPlans
      });
    });

    it('应该处理查询参数验证', async () => {
      // Arrange
      mockRequest.query = { limit: 'invalid-number' };
      mockGetPlansQueryHandler.execute = jest.fn().mockResolvedValue({
        success: false,
        error: 'Invalid query parameters'
      });

      // Act
      await controller.getPlans(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('🔴 协议核心 - 规划协调功能', () => {
    it('应该成功执行规划协调', async () => {
      // Arrange
      const coordinationRequest = {
        context_id: 'ctx-12345',
        strategy: 'adaptive',
        parameters: {
          max_parallel_tasks: 3,
          timeout_ms: 30000
        }
      };

      mockRequest.body = coordinationRequest;
      mockPlanModuleAdapter.coordinatePlanning = jest.fn().mockResolvedValue({
        success: true,
        result: {
          planId: 'plan-12345',
          strategy: 'adaptive',
          tasks_allocated: 5,
          estimated_duration: 3600000
        }
      });

      // Act
      await controller.coordinatePlanning(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockPlanModuleAdapter.coordinatePlanning).toHaveBeenCalledWith(coordinationRequest);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('应该处理规划协调失败', async () => {
      // Arrange
      mockRequest.body = { context_id: 'invalid-context' };
      mockPlanModuleAdapter.coordinatePlanning = jest.fn().mockResolvedValue({
        success: false,
        error: 'Invalid context for planning coordination'
      });

      // Act
      await controller.coordinatePlanning(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('🔴 协议核心 - 错误处理和边界条件', () => {
    it('应该处理空请求体', async () => {
      // Arrange
      mockRequest.body = {};
      mockCreateCommandHandler.execute = jest.fn().mockResolvedValue({
        success: false,
        error: 'Missing required fields'
      });

      // Act
      await controller.createPlan(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('应该处理无效的JSON格式', async () => {
      // Arrange
      mockRequest.body = null;

      // Act
      await controller.createPlan(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('应该处理超大请求数据', async () => {
      // Arrange
      const largeTaskArray = Array(1000).fill(null).map((_, index) => ({
        task_id: `task-${index}`,
        name: `Task ${index}`,
        description: 'A'.repeat(1000), // 大量数据
        status: TaskStatus.PENDING,
        priority: Priority.LOW
      }));

      mockRequest.body = {
        context_id: 'ctx-12345',
        name: 'Large Plan',
        tasks: largeTaskArray
      };

      mockCreateCommandHandler.execute = jest.fn().mockResolvedValue({
        success: false,
        error: 'Request payload too large'
      });

      // Act
      await controller.createPlan(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(413);
    });
  });
});
