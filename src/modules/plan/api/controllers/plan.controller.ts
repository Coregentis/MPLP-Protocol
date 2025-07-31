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
const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
import { APIResponse, AuthenticatedRequest } from '../../../../types/express-extensions';
import { CreatePlanCommandHandler } from '../../application/commands/create-plan.command';
import { GetPlanQueryHandler } from '../../application/queries/get-plan.query';
import { PlanManagementService } from '../../application/services/plan-management.service';
import { PlanExecutionService, PlanExecutionRequest } from '../../application/services/plan-execution.service';
import { Logger } from '../../../../public/utils/logger';





/**
 * Plan控制器
 */
export class PlanController {
  private router: any;
  private readonly logger: Logger;
  private readonly createPlanCommandHandler: CreatePlanCommandHandler;
  private readonly getPlanQueryHandler: GetPlanQueryHandler;
  private readonly planManagementService: PlanManagementService;
  private readonly planExecutionService: PlanExecutionService;
  
  constructor(
    createPlanCommandHandler: CreatePlanCommandHandler,
    getPlanQueryHandler: GetPlanQueryHandler,
    planManagementService: PlanManagementService,
    planExecutionService: PlanExecutionService,
    logger: Logger = new Logger('PlanController')
  ) {
    this.router = express();
    this.logger = logger;
    this.createPlanCommandHandler = createPlanCommandHandler;
    this.getPlanQueryHandler = getPlanQueryHandler;
    this.planManagementService = planManagementService;
    this.planExecutionService = planExecutionService;
    
    this.setupRoutes();
  }
  
  /**
   * 获取路由器实例
   */
  public getRouter(): any {
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
  private async createPlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const requestId = this.generateRequestId();
    
    try {
      this.logger.debug('Creating plan', { requestId });
      
      const result = await this.createPlanCommandHandler.execute({
        context_id: req.body.context_id,
        name: req.body.name,
        description: req.body.description,
        goals: req.body.goals,
        tasks: req.body.tasks,
        dependencies: req.body.dependencies,
        execution_strategy: req.body.execution_strategy,
        priority: req.body.priority,
        estimated_duration: req.body.estimated_duration,
        configuration: req.body.configuration,
        metadata: req.body.metadata
      });
      
      if (result.success) {
        res.status(201).json(this.buildAPIResponse(result.data, requestId));
      } else {
        res.status(400).json(this.buildErrorResponse({
          code: 'VALIDATION_ERROR',
          message: result.error || 'Failed to create plan',
          details: result.validationErrors
        }, requestId));
      }
    } catch (error: unknown) {
      next(error);
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

      const result = await this.getPlanQueryHandler.execute({ plan_id: planId });

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
  private async updatePlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const requestId = this.generateRequestId();
    
    try {
      const planId = req.params.planId;
      this.logger.debug('Updating plan', { planId, requestId });
      
      const result = await this.planManagementService.updatePlan(planId, req.body);
      
      if (result.success && result.data) {
        res.status(200).json(this.buildAPIResponse(result.data, requestId));
      } else if (result.error?.includes('not found')) {
        res.status(404).json(this.buildErrorResponse({
          code: 'NOT_FOUND',
          message: `Plan with ID ${planId} not found`
        }, requestId));
      } else {
        res.status(400).json(this.buildErrorResponse({
          code: 'VALIDATION_ERROR',
          message: result.error || 'Failed to update plan',
          details: result.validationErrors
        }, requestId));
      }
    } catch (error: unknown) {
      next(error);
    }
  }
  
  /**
   * 删除计划
   */
  private async deletePlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const requestId = this.generateRequestId();

    try {
      const planId = req.params.planId;
      this.logger.debug('Deleting plan', { planId, requestId });

      const result = await this.planManagementService.deletePlan(planId);

      if (result.success) {
        res.status(204).end();
      } else if (result.error?.includes('not found')) {
        res.status(404).json(this.buildErrorResponse({
          code: 'NOT_FOUND',
          message: `Plan with ID ${planId} not found`
        }, requestId));
      } else {
        res.status(400).json(this.buildErrorResponse({
          code: 'DELETE_ERROR',
          message: result.error || 'Failed to delete plan'
        }, requestId));
      }
    } catch (error: unknown) {
      next(error);
    }
  }
  
  /**
   * 执行计划
   */
  private async executePlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const requestId = this.generateRequestId();
    
    try {
      const planId = req.params.planId;
      this.logger.debug('Executing plan', { planId, requestId });
      
      const executionRequest: PlanExecutionRequest = {
        plan_id: planId,
        execution_context: req.body.execution_context,
        execution_options: req.body.execution_options,
        execution_variables: req.body.execution_variables,
        conditions: req.body.conditions
      };
      
      const result = await this.planExecutionService.executePlan(executionRequest);
      
      if (result.success) {
        res.status(200).json(this.buildAPIResponse(result, requestId));
      } else if (result.error?.includes('not found')) {
        res.status(404).json(this.buildErrorResponse({
          code: 'NOT_FOUND',
          message: `Plan with ID ${planId} not found`
        }, requestId));
      } else {
        res.status(400).json(this.buildErrorResponse({
          code: 'EXECUTION_ERROR',
          message: result.error || 'Failed to execute plan'
        }, requestId));
      }
    } catch (error: unknown) {
      next(error);
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
      const result = await this.getPlanQueryHandler.execute({ plan_id: planId });
      
      if (result.success && result.data) {
        // 只返回状态相关信息
        const statusInfo = {
          plan_id: result.data.plan_id,
          status: result.data.status,
          progress: result.data.progress,
          updated_at: result.data.updated_at
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
} 