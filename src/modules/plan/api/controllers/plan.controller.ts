/**
 * Plan控制器
 * 
 * 提供Plan模块的REST API接口
 * 
 * @version v1.0.0
 * @created 2025-07-26T19:45:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配plan-protocol.json
 */

import { Request, Response, NextFunction } from 'express';
import express = require('express');
const { body, param, validationResult } = require('express-validator');
import { APIResponse, AuthenticatedRequest } from '../../../../types/express-extensions';

// Express Router接口定义
interface ExpressRouter {
  post(path: string, ...handlers: (Function | Function[])[]): void;
  get(path: string, ...handlers: (Function | Function[])[]): void;
  put(path: string, ...handlers: (Function | Function[])[]): void;
  delete(path: string, ...handlers: (Function | Function[])[]): void;
}
import { CreatePlanCommandHandler } from '../../application/commands/create-plan.command';
import { UpdatePlanCommandHandler } from '../../application/commands/update-plan.command';
import { DeletePlanCommandHandler } from '../../application/commands/delete-plan.command';
import { GetPlanQueryHandler } from '../../application/queries/get-plan.query';
import { GetPlanByIdQueryHandler } from '../../application/queries/get-plan-by-id.query';
import { GetPlansQueryHandler } from '../../application/queries/get-plans.query';
import { PlanManagementService } from '../../application/services/plan-management.service';
import { PlanExecutionService, PlanExecutionRequest } from '../../application/services/plan-execution.service';
import { PlanModuleAdapter } from '../../infrastructure/adapters/plan-module.adapter';
import { PlanStatus, Priority } from '../../types';
import { Logger } from '../../../../public/utils/logger';





/**
 * Plan控制器
 */
export class PlanController {
  private router: ExpressRouter;
  private readonly logger: Logger;
  private readonly createPlanCommandHandler: CreatePlanCommandHandler;
  private readonly updatePlanCommandHandler: UpdatePlanCommandHandler;
  private readonly deletePlanCommandHandler: DeletePlanCommandHandler;
  private readonly getPlanQueryHandler: GetPlanQueryHandler;
  private readonly getPlanByIdQueryHandler: GetPlanByIdQueryHandler;
  private readonly getPlansQueryHandler: GetPlansQueryHandler;
  private readonly planManagementService: PlanManagementService;
  private readonly planExecutionService: PlanExecutionService;
  private readonly planModuleAdapter: PlanModuleAdapter;

  constructor(
    createPlanCommandHandler: CreatePlanCommandHandler,
    updatePlanCommandHandler: UpdatePlanCommandHandler,
    deletePlanCommandHandler: DeletePlanCommandHandler,
    getPlanByIdQueryHandler: GetPlanByIdQueryHandler,
    getPlansQueryHandler: GetPlansQueryHandler,
    planManagementService: PlanManagementService,
    planModuleAdapter: PlanModuleAdapter,
    getPlanQueryHandler?: GetPlanQueryHandler,
    planExecutionService?: PlanExecutionService,
    logger: Logger = new Logger('PlanController')
  ) {
    this.router = (express as { Router: () => ExpressRouter }).Router();
    this.logger = logger;
    this.createPlanCommandHandler = createPlanCommandHandler;
    this.updatePlanCommandHandler = updatePlanCommandHandler;
    this.deletePlanCommandHandler = deletePlanCommandHandler;
    this.getPlanQueryHandler = getPlanQueryHandler || new GetPlanQueryHandler(planManagementService);
    this.getPlanByIdQueryHandler = getPlanByIdQueryHandler;
    this.getPlansQueryHandler = getPlansQueryHandler;
    this.planManagementService = planManagementService;
    this.planExecutionService = planExecutionService || {} as PlanExecutionService;
    this.planModuleAdapter = planModuleAdapter;

    this.setupRoutes();
  }
  
  /**
   * 获取路由器实例
   */
  public getRouter(): ExpressRouter {
    return this.router;
  }
  
  /**
   * 设置所有路由
   */
  private setupRoutes(): void {
    // 创建计划
    this.router.post(
      '/',
      this.validateCreatePlan(),
      this.handleValidationErrors.bind(this),
      this.createPlan.bind(this)
    );
    
    // 获取计划
    this.router.get(
      '/:planId',
      this.validatePlanId(),
      this.handleValidationErrors.bind(this),
      this.getPlan.bind(this)
    );
    
    // 更新计划
    this.router.put(
      '/:planId',
      this.validatePlanId(),
      this.validateUpdatePlan(),
      this.handleValidationErrors.bind(this),
      this.updatePlan.bind(this)
    );
    
    // 删除计划
    this.router.delete(
      '/:planId',
      this.validatePlanId(),
      this.handleValidationErrors.bind(this),
      this.deletePlan.bind(this)
    );
    
    // 执行计划
    this.router.post(
      '/:planId/execute',
      this.validatePlanId(),
      this.validateExecutePlan(),
      this.handleValidationErrors.bind(this),
      this.executePlan.bind(this)
    );
    
    // 获取计划状态
    this.router.get(
      '/:planId/status',
      this.validatePlanId(),
      this.handleValidationErrors.bind(this),
      this.getPlanStatus.bind(this)
    );
  }
  
  /**
   * 创建计划
   */
  private async createPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    const requestId = this.generateRequestId();
    
    try {
      this.logger.debug('Creating plan', { requestId });

      // 验证请求体
      if (!req.body) {
        res.status(400).json({
          success: false,
          error: 'Request body is required'
        });
        return;
      }

      const result = await this.createPlanCommandHandler.execute({
        contextId: req.body.context_id || req.body.contextId,
        name: req.body.name,
        description: req.body.description,
        goals: req.body.goals,
        tasks: req.body.tasks,
        dependencies: req.body.dependencies,
        executionStrategy: req.body.execution_strategy || req.body.executionStrategy,
        priority: req.body.priority,
        estimatedDuration: req.body.estimated_duration || req.body.estimatedDuration,
        configuration: req.body.configuration,
        metadata: req.body.metadata
      });
      
      if (result.success) {
        res.status(201).json({
          success: true,
          data: result.data
        });
      } else {
        // 检查是否是请求过大的错误
        if (result.error && result.error.includes('Request payload too large')) {
          res.status(413).json({
            success: false,
            error: result.error
          });
        } else {
          res.status(400).json({
            success: false,
            error: result.error || 'Failed to create plan'
          });
        }
      }
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
  
  /**
   * 获取计划
   */
  private async getPlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const requestId = this.generateRequestId();

    try {
      const planId = req.params.planId;
      this.logger.debug('Getting plan', { planId, requestId });

      const result = await this.getPlanQueryHandler.execute({ planId: planId });

      if (result.success && result.data) {
        res.status(200).json(this.buildAPIResponse(result.data, requestId));
      } else {
        res.status(404).json(this.buildErrorResponse({
          code: 'NOT_FOUND',
          message: `Plan with ID ${planId} not found`
        }, requestId));
      }
    } catch (error: unknown) {
      next(error);
    }
  }
  
  /**
   * 更新计划
   */
  async updatePlan(req: AuthenticatedRequest, res: Response, next?: NextFunction): Promise<void> {
    try {
      const planId = req.params.id || req.params.planId;
      const updateData = req.body;
      this.logger.debug('Updating plan', { planId, updateData });

      // 执行更新计划命令
      const command = {
        planId,
        ...updateData
      };

      const result = await this.updatePlanCommandHandler.execute(command);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || 'Failed to update plan'
        });
      }
    } catch (error: unknown) {
      if (next) next(error);
    }
  }
  
  /**
   * 删除计划
   */
  async deletePlan(req: AuthenticatedRequest, res: Response, next?: NextFunction): Promise<void> {
    try {
      const planId = req.params.id || req.params.planId;
      this.logger.debug('Deleting plan', { planId });

      // 执行删除计划命令
      const command = { planId };
      const result = await this.deletePlanCommandHandler.execute(command);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Plan deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Plan not found'
        });
      }
    } catch (error: unknown) {
      if (next) next(error);
    }
  }
  
  /**
   * 执行计划
   */
  async executePlan(req: AuthenticatedRequest, res: Response, next?: NextFunction): Promise<void> {
    try {
      const planId = req.params.id || req.params.planId;
      this.logger.debug('Executing plan', { planId });

      const executionRequest: PlanExecutionRequest = {
        planId: planId,
        executionContext: req.body.execution_context,
        executionOptions: req.body.execution_options,
        executionVariables: req.body.execution_variables,
        conditions: req.body.conditions
      };

      const result = await this.planExecutionService.executePlan(executionRequest);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || 'Failed to execute plan'
        });
      }
    } catch (error: unknown) {
      if (next) next(error);
    }
  }
  
  /**
   * 获取计划状态
   */
  private async getPlanStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const requestId = this.generateRequestId();
    
    try {
      const planId = req.params.planId;
      this.logger.debug('Getting plan status', { planId, requestId });
      
      // 获取计划
      const result = await this.getPlanQueryHandler.execute({ planId: planId });
      
      if (result.success && result.data) {
        // 只返回状态相关信息
        const statusInfo = {
          plan_id: result.data.planId,
          status: result.data.status,
          progress: result.data.progress,
          updated_at: result.data.updatedAt
        };
        
        res.status(200).json(this.buildAPIResponse(statusInfo, requestId));
      } else {
        res.status(404).json(this.buildErrorResponse({
          code: 'NOT_FOUND',
          message: `Plan with ID ${planId} not found`
        }, requestId));
      }
    } catch (error: unknown) {
      next(error);
    }
  }
  
  /**
   * 验证创建计划请求
   */
  private validateCreatePlan() {
    return [
      body('context_id').isUUID().withMessage('Context ID must be a valid UUID'),
      body('name').isString().notEmpty().withMessage('Name is required').isLength({ max: 255 }).withMessage('Name must be 255 characters or less'),
      body('description').isString().withMessage('Description must be a string'),
      body('goals').optional().isArray().withMessage('Goals must be an array'),
      body('tasks').optional().isArray().withMessage('Tasks must be an array'),
      body('dependencies').optional().isArray().withMessage('Dependencies must be an array'),
      body('execution_strategy').optional().isIn(['sequential', 'parallel', 'conditional']).withMessage('Invalid execution strategy'),
      body('priority').optional().isIn(['critical', 'high', 'normal', 'medium', 'low']).withMessage('Invalid priority'),
      body('estimated_duration').optional().isObject().withMessage('Estimated duration must be an object'),
      body('estimated_duration.value').optional().isNumeric().withMessage('Estimated duration value must be a number'),
      body('estimated_duration.unit').optional().isIn(['minutes', 'hours', 'days', 'weeks']).withMessage('Invalid duration unit'),
      body('configuration').optional().isObject().withMessage('Configuration must be an object'),
      body('metadata').optional().isObject().withMessage('Metadata must be an object')
    ];
  }
  
  /**
   * 验证计划ID
   */
  private validatePlanId() {
    return [
      param('planId').isUUID().withMessage('Plan ID must be a valid UUID')
    ];
  }
  
  /**
   * 验证更新计划请求
   */
  private validateUpdatePlan() {
    return [
      body('name').optional().isString().notEmpty().withMessage('Name must be a non-empty string').isLength({ max: 255 }).withMessage('Name must be 255 characters or less'),
      body('description').optional().isString().withMessage('Description must be a string'),
      body('status').optional().isIn(['draft', 'active', 'paused', 'completed', 'cancelled', 'failed', 'approved']).withMessage('Invalid status'),
      body('goals').optional().isArray().withMessage('Goals must be an array'),
      body('tasks').optional().isArray().withMessage('Tasks must be an array'),
      body('dependencies').optional().isArray().withMessage('Dependencies must be an array'),
      body('execution_strategy').optional().isIn(['sequential', 'parallel', 'conditional']).withMessage('Invalid execution strategy'),
      body('priority').optional().isIn(['critical', 'high', 'normal', 'medium', 'low']).withMessage('Invalid priority'),
      body('estimated_duration').optional().isObject().withMessage('Estimated duration must be an object'),
      body('configuration').optional().isObject().withMessage('Configuration must be an object'),
      body('metadata').optional().isObject().withMessage('Metadata must be an object')
    ];
  }
  
  /**
   * 验证执行计划请求
   */
  private validateExecutePlan() {
    return [
      body('execution_context').optional().isObject().withMessage('Execution context must be an object'),
      body('execution_options').optional().isObject().withMessage('Execution options must be an object'),
      body('execution_variables').optional().isObject().withMessage('Execution variables must be an object'),
      body('conditions').optional().isObject().withMessage('Conditions must be an object')
    ];
  }
  
  /**
   * 处理验证错误
   */
  private handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const requestId = this.generateRequestId();

      res.status(400).json(this.buildErrorResponse({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array()
      }, requestId));
      return;
    }
    
    next();
  }
  
  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }
  
  /**
   * 构建API响应
   */
  private buildAPIResponse<T>(
    data: T,
    requestId: string
  ): APIResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: requestId,
        version: '1.0.0'
      }
    };
  }
  
  /**
   * 构建错误响应
   */
  private buildErrorResponse(
    error: {
      code: string;
      message: string;
      details?: unknown;
    },
    requestId: string
  ): APIResponse {
    return {
      success: false,
      error,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: requestId,
        version: '1.0.0'
      }
    };
  }

  /**
   * 通过ID获取计划
   */
  async getPlanById(req: AuthenticatedRequest, res: Response, next?: NextFunction): Promise<void> {
    const requestId = this.generateRequestId();

    try {
      const planId = req.params.id || req.params.planId;
      this.logger.debug('Getting plan by ID', { planId, requestId });

      const result = await this.getPlanByIdQueryHandler.execute({ planId });

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Plan not found'
        });
      }
    } catch (error: unknown) {
      if (next) next(error);
    }
  }

  /**
   * 获取计划列表
   */
  async getPlans(req: AuthenticatedRequest, res: Response, next?: NextFunction): Promise<void> {
    const requestId = this.generateRequestId();

    try {
      this.logger.debug('Getting plans list', { requestId });

      // 构建查询参数
      const query: Record<string, unknown> = {};

      if (req.query.contextId) query.contextId = req.query.contextId as string;
      if (req.query.status) query.status = req.query.status as PlanStatus;
      if (req.query.priority) query.priority = req.query.priority as Priority;
      if (req.query.page) query.page = parseInt(req.query.page as string);
      if (req.query.limit) query.limit = parseInt(req.query.limit as string);
      if (req.query.search) query.search = req.query.search as string;
      if (req.query.sortBy) query.sortBy = req.query.sortBy as string;
      if (req.query.sortOrder) query.sortOrder = req.query.sortOrder as 'asc' | 'desc';

      // 验证查询参数
      if (query.page && typeof query.page === 'number' && query.page < 1) {
        res.status(400).json({
          success: false,
          error: 'Page must be greater than 0'
        });
        return;
      }

      if (query.limit && typeof query.limit === 'number' && (query.limit < 1 || query.limit > 100)) {
        res.status(400).json({
          success: false,
          error: 'Limit must be between 1 and 100'
        });
        return;
      }

      const result = await this.getPlansQueryHandler.execute(query);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          error: (typeof result.error === 'string' ? result.error : 'Failed to get plans')
        });
      }
    } catch (error: unknown) {
      if (next) next(error);
    }
  }

  /**
   * 规划协调功能
   */
  async coordinatePlanning(req: AuthenticatedRequest, res: Response, next?: NextFunction): Promise<void> {
    const requestId = this.generateRequestId();

    try {
      const coordinationRequest = req.body;
      this.logger.debug('Coordinating planning', { coordinationRequest, requestId });

      if (!coordinationRequest) {
        res.status(400).json({
          success: false,
          error: 'Coordination request is required'
        });
        return;
      }

      // 执行规划协调
      const result = await this.planModuleAdapter.coordinatePlanning(coordinationRequest);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          error: (typeof result.error === 'string' ? result.error : 'Planning coordination failed')
        });
      }
    } catch (error: unknown) {
      if (next) next(error);
    }
  }
}