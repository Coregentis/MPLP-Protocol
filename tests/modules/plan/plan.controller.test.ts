/**
 * Plan Controller单元测试
 *
 * 基于Schema驱动测试原则，测试Plan Controller的所有API端点
 * 确保100%分支覆盖，发现并修复源代码问题
 *
 * @version 1.0.0
 * @created 2025-01-28T20:00:00+08:00
 */

// Mock express-validator completely
jest.mock('express-validator', () => {
  const mockChain = {
    isUUID: jest.fn().mockReturnThis(),
    isString: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    isArray: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    isIn: jest.fn().mockReturnThis(),
    isObject: jest.fn().mockReturnThis(),
    isNumeric: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis()
  };

  return {
    body: jest.fn(() => mockChain),
    param: jest.fn(() => mockChain),
    validationResult: jest.fn(() => ({
      isEmpty: jest.fn(() => true),
      array: jest.fn(() => [])
    }))
  };
});

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { PlanController } from '../../../src/modules/plan/api/controllers/plan.controller';
import { CreatePlanCommandHandler } from '../../../src/modules/plan/application/commands/create-plan.command';
import { GetPlanQueryHandler } from '../../../src/modules/plan/application/queries/get-plan.query';
import { PlanManagementService } from '../../../src/modules/plan/application/services/plan-management.service';
import { PlanExecutionService } from '../../../src/modules/plan/application/services/plan-execution.service';
import { Logger } from '../../../src/public/utils/logger';
import { TestDataFactory } from '../../public/test-utils/test-data-factory';
import { TestHelpers } from '../../public/test-utils/test-helpers';

// Mock express
const mockRouter = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
};

jest.mock('express', () => ({
  Router: () => mockRouter
}));

describe('PlanController', () => {
  let controller: PlanController;
  let mockCreatePlanCommandHandler: jest.Mocked<CreatePlanCommandHandler>;
  let mockUpdatePlanCommandHandler: any;
  let mockDeletePlanCommandHandler: any;
  let mockGetPlanByIdQueryHandler: any;
  let mockGetPlansQueryHandler: any;
  let mockGetPlanQueryHandler: jest.Mocked<GetPlanQueryHandler>;
  let mockPlanManagementService: jest.Mocked<PlanManagementService>;
  let mockPlanModuleAdapter: any;
  let mockPlanExecutionService: jest.Mocked<PlanExecutionService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let mockValidationResult: jest.MockedFunction<typeof validationResult>;

  beforeEach(() => {
    // 重置所有mock
    jest.clearAllMocks();

    // 重置router mock
    mockRouter.post.mockClear();
    mockRouter.get.mockClear();
    mockRouter.put.mockClear();
    mockRouter.delete.mockClear();

    // 创建mock服务
    mockCreatePlanCommandHandler = {
      execute: jest.fn()
    } as any;

    mockUpdatePlanCommandHandler = {
      execute: jest.fn()
    } as any;

    mockDeletePlanCommandHandler = {
      execute: jest.fn()
    } as any;

    mockGetPlanByIdQueryHandler = {
      execute: jest.fn()
    } as any;

    mockGetPlansQueryHandler = {
      execute: jest.fn()
    } as any;

    mockGetPlanQueryHandler = {
      execute: jest.fn()
    } as any;

    mockPlanManagementService = {
      createPlan: jest.fn(),
      getPlan: jest.fn(),
      updatePlan: jest.fn(),
      deletePlan: jest.fn()
    } as any;

    mockPlanModuleAdapter = {
      processRequest: jest.fn(),
      processResponse: jest.fn()
    } as any;

    mockPlanExecutionService = {
      executePlan: jest.fn()
    } as any;

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    } as any;

    // 创建controller实例
    controller = new PlanController(
      mockCreatePlanCommandHandler,
      mockUpdatePlanCommandHandler,
      mockDeletePlanCommandHandler,
      mockGetPlanByIdQueryHandler,
      mockGetPlansQueryHandler,
      mockPlanManagementService,
      mockPlanModuleAdapter,
      mockGetPlanQueryHandler,
      mockPlanExecutionService,
      mockLogger
    );

    // 创建mock request/response
    mockRequest = {
      body: {},
      params: {},
      query: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    // Get the mocked validationResult
    mockValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;
  });

  describe('构造函数和初始化', () => {
    it('应该正确初始化Controller', () => {
      expect(controller).toBeInstanceOf(PlanController);
      expect(mockRouter.post).toHaveBeenCalledTimes(2); // '/' 和 '/:planId/execute'
      expect(mockRouter.get).toHaveBeenCalledTimes(2); // '/:planId' 和 '/:planId/status'
      expect(mockRouter.put).toHaveBeenCalledTimes(1); // '/:planId'
      expect(mockRouter.delete).toHaveBeenCalledTimes(1); // '/:planId'
    });

    it('应该返回router实例', () => {
      const router = controller.getRouter();
      expect(router).toBe(mockRouter);
    });
  });

  describe('POST / - 创建计划', () => {
    beforeEach(() => {
      mockRequest.body = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Plan',
        description: 'Test Description',
        goals: ['Goal 1', 'Goal 2'],
        execution_strategy: 'sequential',
        priority: 'high'
      };

      // Mock validation result - no errors
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });
    });

    it('应该成功创建计划', async () => {
      const planId = TestDataFactory.Base.generateUUID();
      const mockPlan = TestDataFactory.Plan.createValidPlanRequest({
        planId,
        contextId: mockRequest.body.context_id,
        name: mockRequest.body.name
      });

      mockCreatePlanCommandHandler.execute.mockResolvedValue({
        success: true,
        data: mockPlan
      });

      // 获取实际的路由处理器
      const createPlanHandler = mockRouter.post.mock.calls.find(call => call[0] === '/')[3];
      
      await createPlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCreatePlanCommandHandler.execute).toHaveBeenCalledWith({
        contextId: mockRequest.body.context_id,
        name: mockRequest.body.name,
        description: mockRequest.body.description,
        goals: mockRequest.body.goals,
        tasks: undefined,
        dependencies: undefined,
        executionStrategy: mockRequest.body.execution_strategy,
        priority: mockRequest.body.priority,
        estimatedDuration: undefined,
        configuration: undefined,
        metadata: undefined
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockPlan,
          meta: expect.objectContaining({
            timestamp: expect.any(String),
            requestId: expect.any(String),
            version: '1.0.0'
          })
        })
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('Creating plan', { requestId: expect.any(String) });
    });

    it('应该处理创建计划失败', async () => {
      mockCreatePlanCommandHandler.execute.mockResolvedValue({
        success: false,
        error: 'Validation failed',
        validationErrors: ['Name is required']
      });

      const createPlanHandler = mockRouter.post.mock.calls.find(call => call[0] === '/')[3];
      
      await createPlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: ['Name is required']
          })
        })
      );
    });

    it('应该处理异常错误', async () => {
      const error = new Error('Database connection failed');
      mockCreatePlanCommandHandler.execute.mockRejectedValue(error);

      const createPlanHandler = mockRouter.post.mock.calls.find(call => call[0] === '/')[3];
      
      await createPlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('验证错误处理', () => {
    it('应该处理验证错误', async () => {
      // Mock validation errors
      mockValidationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [
          { field: 'name', message: 'Name is required' },
          { field: 'contextId', message: 'Invalid UUID' }
        ]
      });

      // 获取验证错误处理器
      const validationHandler = mockRouter.post.mock.calls.find(call => call[0] === '/')[2];

      await validationHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: [
              { field: 'name', message: 'Name is required' },
              { field: 'contextId', message: 'Invalid UUID' }
            ]
          })
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该在没有验证错误时调用next', async () => {
      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      const validationHandler = mockRouter.post.mock.calls.find(call => call[0] === '/')[2];

      await validationHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('GET /:planId - 获取计划', () => {
    beforeEach(() => {
      mockRequest.params = {
        planId: TestDataFactory.Base.generateUUID()
      };

      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });
    });

    it('应该成功获取计划', async () => {
      const mockPlan = TestDataFactory.Plan.createValidPlanRequest({
        planId: mockRequest.params.planId
      });

      mockGetPlanQueryHandler.execute.mockResolvedValue({
        success: true,
        data: mockPlan
      });

      const getPlanHandler = mockRouter.get.mock.calls.find(call => call[0] === '/:planId')[3];

      await getPlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockGetPlanQueryHandler.execute).toHaveBeenCalledWith({
        planId: mockRequest.params.planId
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockPlan
        })
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('Getting plan', {
        planId: mockRequest.params.planId,
        requestId: expect.any(String)
      });
    });

    it('应该处理计划不存在', async () => {
      mockGetPlanQueryHandler.execute.mockResolvedValue({
        success: false,
        data: null
      });

      const getPlanHandler = mockRouter.get.mock.calls.find(call => call[0] === '/:planId')[3];

      await getPlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'NOT_FOUND',
            message: `Plan with ID ${mockRequest.params.planId} not found`
          })
        })
      );
    });

    it('应该处理获取计划异常', async () => {
      const error = new Error('Database error');
      mockGetPlanQueryHandler.execute.mockRejectedValue(error);

      const getPlanHandler = mockRouter.get.mock.calls.find(call => call[0] === '/:planId')[3];

      await getPlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('PUT /:planId - 更新计划', () => {
    beforeEach(() => {
      mockRequest.params = {
        planId: TestDataFactory.Base.generateUUID()
      };
      mockRequest.body = {
        name: 'Updated Plan',
        description: 'Updated Description',
        status: 'active'
      };

      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });
    });

    it('应该成功更新计划', async () => {
      const mockUpdatedPlan = TestDataFactory.Plan.createValidPlanRequest({
        planId: mockRequest.params.planId,
        name: mockRequest.body.name,
        description: mockRequest.body.description
      });

      mockPlanManagementService.updatePlan.mockResolvedValue({
        success: true,
        data: mockUpdatedPlan
      });

      const updatePlanHandler = mockRouter.put.mock.calls.find(call => call[0] === '/:planId')[4];

      await updatePlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPlanManagementService.updatePlan).toHaveBeenCalledWith(
        mockRequest.params.planId,
        mockRequest.body
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUpdatedPlan
        })
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('Updating plan', {
        planId: mockRequest.params.planId,
        requestId: expect.any(String)
      });
    });

    it('应该处理计划不存在的更新', async () => {
      mockPlanManagementService.updatePlan.mockResolvedValue({
        success: false,
        error: 'Plan not found'
      });

      const updatePlanHandler = mockRouter.put.mock.calls.find(call => call[0] === '/:planId')[4];

      await updatePlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'NOT_FOUND',
            message: `Plan with ID ${mockRequest.params.planId} not found`
          })
        })
      );
    });

    it('应该处理更新验证失败', async () => {
      mockPlanManagementService.updatePlan.mockResolvedValue({
        success: false,
        error: 'Validation failed',
        validationErrors: ['Invalid status']
      });

      const updatePlanHandler = mockRouter.put.mock.calls.find(call => call[0] === '/:planId')[4];

      await updatePlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: ['Invalid status']
          })
        })
      );
    });
  });

  describe('DELETE /:planId - 删除计划', () => {
    beforeEach(() => {
      mockRequest.params = {
        planId: TestDataFactory.Base.generateUUID()
      };

      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });
    });

    it('应该成功删除计划', async () => {
      mockPlanManagementService.deletePlan.mockResolvedValue({
        success: true,
        data: undefined
      });

      const deletePlanHandler = mockRouter.delete.mock.calls.find(call => call[0] === '/:planId')[3];

      await deletePlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPlanManagementService.deletePlan).toHaveBeenCalledWith(mockRequest.params.planId);

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.end).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith('Deleting plan', {
        planId: mockRequest.params.planId,
        requestId: expect.any(String)
      });
    });

    it('应该处理删除不存在的计划', async () => {
      mockPlanManagementService.deletePlan.mockResolvedValue({
        success: false,
        error: 'Plan not found'
      });

      const deletePlanHandler = mockRouter.delete.mock.calls.find(call => call[0] === '/:planId')[3];

      await deletePlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'NOT_FOUND',
            message: `Plan with ID ${mockRequest.params.planId} not found`
          })
        })
      );
    });

    it('应该处理删除异常', async () => {
      const error = new Error('Database error');
      mockPlanManagementService.deletePlan.mockRejectedValue(error);

      const deletePlanHandler = mockRouter.delete.mock.calls.find(call => call[0] === '/:planId')[3];

      await deletePlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('POST /:planId/execute - 执行计划', () => {
    beforeEach(() => {
      mockRequest.params = {
        planId: TestDataFactory.Base.generateUUID()
      };
      mockRequest.body = {
        execution_context: { environment: 'test' },
        execution_options: {
          parallel_limit: 5,
          timeout_ms: 30000
        }
      };

      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });
    });

    it('应该成功执行计划', async () => {
      const mockExecutionResult = {
        success: true,
        plan_id: mockRequest.params.planId,
        execution_time_ms: 1500,
        tasks_status: [
          { taskId: 'task-1', status: 'completed' },
          { taskId: 'task-2', status: 'completed' }
        ]
      };

      mockPlanExecutionService.executePlan.mockResolvedValue(mockExecutionResult);

      const executePlanHandler = mockRouter.post.mock.calls.find(call => call[0] === '/:planId/execute')[4];

      await executePlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockPlanExecutionService.executePlan).toHaveBeenCalledWith({
        planId: mockRequest.params.planId,
        executionContext: mockRequest.body.execution_context,
        executionOptions: mockRequest.body.execution_options,
        executionVariables: undefined,
        conditions: undefined
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockExecutionResult
        })
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('Executing plan', {
        planId: mockRequest.params.planId,
        requestId: expect.any(String)
      });
    });

    it('应该处理执行不存在的计划', async () => {
      mockPlanExecutionService.executePlan.mockResolvedValue({
        success: false,
        error: 'Plan not found'
      });

      const executePlanHandler = mockRouter.post.mock.calls.find(call => call[0] === '/:planId/execute')[4];

      await executePlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'NOT_FOUND',
            message: `Plan with ID ${mockRequest.params.planId} not found`
          })
        })
      );
    });

    it('应该处理执行失败', async () => {
      mockPlanExecutionService.executePlan.mockResolvedValue({
        success: false,
        error: 'Execution failed: Task dependency not met'
      });

      const executePlanHandler = mockRouter.post.mock.calls.find(call => call[0] === '/:planId/execute')[4];

      await executePlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'EXECUTION_ERROR',
            message: 'Execution failed: Task dependency not met'
          })
        })
      );
    });

    it('应该处理执行异常', async () => {
      const error = new Error('Execution service unavailable');
      mockPlanExecutionService.executePlan.mockRejectedValue(error);

      const executePlanHandler = mockRouter.post.mock.calls.find(call => call[0] === '/:planId/execute')[4];

      await executePlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('GET /:planId/status - 获取计划状态', () => {
    beforeEach(() => {
      mockRequest.params = {
        planId: TestDataFactory.Base.generateUUID()
      };

      mockValidationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });
    });

    it('应该成功获取计划状态', async () => {
      const mockPlan = TestDataFactory.Plan.createValidPlanRequest({
        planId: mockRequest.params.planId,
        status: 'active'
      });

      mockGetPlanQueryHandler.execute.mockResolvedValue({
        success: true,
        data: mockPlan
      });

      const getPlanStatusHandler = mockRouter.get.mock.calls.find(call => call[0] === '/:planId/status')[3];

      await getPlanStatusHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockGetPlanQueryHandler.execute).toHaveBeenCalledWith({
        planId: mockRequest.params.planId
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            plan_id: mockPlan.planId,
            status: mockPlan.status,
            progress: mockPlan.progress,
            updated_at: mockPlan.updatedAt
          })
        })
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('Getting plan status', {
        planId: mockRequest.params.planId,
        requestId: expect.any(String)
      });
    });

    it('应该处理状态查询时计划不存在', async () => {
      mockGetPlanQueryHandler.execute.mockResolvedValue({
        success: false,
        data: null
      });

      const getPlanStatusHandler = mockRouter.get.mock.calls.find(call => call[0] === '/:planId/status')[3];

      await getPlanStatusHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'NOT_FOUND',
            message: `Plan with ID ${mockRequest.params.planId} not found`
          })
        })
      );
    });
  });

  describe('辅助方法测试', () => {
    it('应该生成唯一的请求ID', () => {
      // 通过调用一个API方法来间接测试generateRequestId
      const createPlanHandler = mockRouter.post.mock.calls.find(call => call[0] === '/')[3];

      mockCreatePlanCommandHandler.execute.mockResolvedValue({
        success: true,
        data: TestDataFactory.Plan.createValidPlanRequest()
      });

      mockRequest.body = {
        contextId: TestDataFactory.Base.generateUUID(),
        name: 'Test Plan'
      };

      createPlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      // 验证requestId格式
      expect(mockLogger.debug).toHaveBeenCalledWith('Creating plan', {
        requestId: expect.stringMatching(/^req-\d+-\d+$/)
      });
    });

    it('应该构建正确的API响应格式', async () => {
      const mockPlan = TestDataFactory.Plan.createValidPlanRequest();

      mockCreatePlanCommandHandler.execute.mockResolvedValue({
        success: true,
        data: mockPlan
      });

      mockRequest.body = {
        contextId: TestDataFactory.Base.generateUUID(),
        name: 'Test Plan'
      };

      const createPlanHandler = mockRouter.post.mock.calls.find(call => call[0] === '/')[3];

      await createPlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockPlan,
          meta: expect.objectContaining({
            timestamp: expect.any(String),
            requestId: expect.any(String),
            version: '1.0.0'
          })
        })
      );
    });

    it('应该构建正确的错误响应格式', async () => {
      mockCreatePlanCommandHandler.execute.mockResolvedValue({
        success: false,
        error: 'Test error'
      });

      mockRequest.body = {
        context_id: TestDataFactory.Base.generateUUID(),
        name: 'Test Plan'
      };

      const createPlanHandler = mockRouter.post.mock.calls.find(call => call[0] === '/')[3];

      await createPlanHandler(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Test error'
          }),
          meta: expect.objectContaining({
            timestamp: expect.any(String),
            requestId: expect.any(String),
            version: '1.0.0'
          })
        })
      );
    });
  });
});
