/**
 * MPLP Context API控制器
 * 
 * Context模块REST API接口实现
 * 严格按照 context-protocol.json Schema规范定义
 * 
 * @version v1.0.2
 * @updated 2025-07-10T17:30:00+08:00
 * @compliance 100% Schema合规性 - 完全匹配context-protocol.json Schema定义
 * @schema_path src/schemas/context-protocol.json
 */

import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ContextService } from './context-service';
import { 
  ContextProtocol,
  CreateContextRequest,
  UpdateContextRequest,
  BatchContextRequest,
  ContextResponse,
  ContextFilter,
  ContextOperationResult,
  ContextStatus,
  ContextLifecycleStage,
  UUID,
  ContextError,
  ValidationError
} from './types';
import { logger } from '../../utils/logger';

// ===== API响应类型定义 =====

/**
 * 标准API响应格式
 */
interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    execution_time_ms: number;
    timestamp: string;
    request_id?: string;
  };
}

/**
 * 认证用户信息
 */
interface AuthenticatedUser {
  id: string;
  role: string;
  permissions?: string[];
}

/**
 * 扩展Request接口
 */
interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

// ===== 控制器实现 =====

/**
 * Context模块API控制器
 * 
 * 提供RESTful API接口用于Context管理
 * 所有接口都遵循Schema规范和标准HTTP状态码
 */
export class ContextController {
  private router: Router;
  private contextService: ContextService;

  constructor(contextService: ContextService) {
    this.router = Router();
    this.contextService = contextService;
    this.setupRoutes();
  }

  /**
   * 获取路由器实例
   */
  public getRouter(): Router {
    return this.router;
  }

  // ===== 路由设置 =====

  /**
   * 设置所有路由
   */
  private setupRoutes(): void {
    // Context CRUD路由
    this.router.post(
      '/',
      this.validateCreateContext(),
      this.handleValidationErrors,
      this.createContext.bind(this)
    );

    this.router.get(
      '/:contextId',
      this.validateContextId(),
      this.handleValidationErrors,
      this.getContext.bind(this)
    );

    this.router.put(
      '/:contextId',
      this.validateContextId(),
      this.validateUpdateContext(),
      this.handleValidationErrors,
      this.updateContext.bind(this)
    );

    this.router.delete(
      '/:contextId',
      this.validateContextId(),
      this.handleValidationErrors,
      this.deleteContext.bind(this)
    );

    this.router.get(
      '/',
      this.validateQueryContexts(),
      this.handleValidationErrors,
      this.queryContexts.bind(this)
    );

    // 批量操作路由
    this.router.post(
      '/batch',
      this.validateBatchRequest(),
      this.handleValidationErrors,
      this.batchProcessContexts.bind(this)
    );

    // 状态管理路由
    this.router.patch(
      '/:contextId/status',
      this.validateContextId(),
      this.validateUpdateStatus(),
      this.handleValidationErrors,
      this.updateStatus.bind(this)
    );

    this.router.patch(
      '/:contextId/lifecycle',
      this.validateContextId(),
      this.validateUpdateLifecycle(),
      this.handleValidationErrors,
      this.updateLifecycle.bind(this)
    );
  }

  // ===== API处理方法 =====

  /**
   * 创建Context
   * POST /api/v1/contexts
   */
  private async createContext(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();

    try {
      const createRequest: CreateContextRequest = req.body;
      const user = this.getAuthenticatedUser(req);

      const result = await this.contextService.createContext(
        createRequest,
        user.id,
        user.role
      );

      const response = this.buildAPIResponse(result, startTime, requestId);

      if (result.success) {
        res.status(201).json(response);
        logger.info('Context created successfully', {
          context_id: result.data?.context_id,
          user_id: user.id,
          execution_time_ms: result.execution_time_ms
        });
      } else {
        res.status(400).json(response);
        logger.warn('Context creation failed', {
          error: result.error?.message,
          user_id: user.id,
          execution_time_ms: result.execution_time_ms
        });
      }

    } catch (error) {
      const response = this.buildErrorResponse(error, startTime, requestId);
      res.status(500).json(response);
      next(error);
    }
  }

  /**
   * 获取Context
   * GET /api/v1/contexts/:contextId
   */
  private async getContext(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();

    try {
      const contextId = req.params.contextId as UUID;

      const result = await this.contextService.getContext(contextId);
      const response = this.buildAPIResponse(result, startTime, requestId);

      if (result.success) {
        if (result.data) {
          res.status(200).json(response);
        } else {
          res.status(404).json({
            success: false,
            error: {
              code: 'CONTEXT_NOT_FOUND',
              message: `Context not found: ${contextId}`
            },
            metadata: {
              execution_time_ms: performance.now() - startTime,
              timestamp: new Date().toISOString(),
              request_id: requestId
            }
          });
        }
      } else {
        res.status(400).json(response);
      }

    } catch (error) {
      const response = this.buildErrorResponse(error, startTime, requestId);
      res.status(500).json(response);
      next(error);
    }
  }

  /**
   * 更新Context
   * PUT /api/v1/contexts/:contextId
   */
  private async updateContext(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();

    try {
      const contextId = req.params.contextId as UUID;
      const updateRequest: UpdateContextRequest = {
        context_id: contextId,
        ...req.body
      };

      const result = await this.contextService.updateContext(updateRequest);
      const response = this.buildAPIResponse(result, startTime, requestId);

      if (result.success) {
        res.status(200).json(response);
        logger.info('Context updated successfully', {
          context_id: contextId,
          execution_time_ms: result.execution_time_ms
        });
      } else {
        res.status(400).json(response);
        logger.warn('Context update failed', {
          context_id: contextId,
          error: result.error?.message,
          execution_time_ms: result.execution_time_ms
        });
      }

    } catch (error) {
      const response = this.buildErrorResponse(error, startTime, requestId);
      res.status(500).json(response);
      next(error);
    }
  }

  /**
   * 删除Context
   * DELETE /api/v1/contexts/:contextId
   */
  private async deleteContext(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();

    try {
      const contextId = req.params.contextId as UUID;

      const result = await this.contextService.deleteContext(contextId);
      const response = this.buildAPIResponse(result, startTime, requestId);

      if (result.success) {
        res.status(204).send(); // No Content
        logger.info('Context deleted successfully', {
          context_id: contextId,
          execution_time_ms: result.execution_time_ms
        });
      } else {
        res.status(400).json(response);
        logger.warn('Context deletion failed', {
          context_id: contextId,
          error: result.error?.message,
          execution_time_ms: result.execution_time_ms
        });
      }

    } catch (error) {
      const response = this.buildErrorResponse(error, startTime, requestId);
      res.status(500).json(response);
      next(error);
    }
  }

  /**
   * 查询Contexts
   * GET /api/v1/contexts
   */
  private async queryContexts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();

    try {
      const filter: ContextFilter = {
        context_ids: req.query.context_ids ? (req.query.context_ids as string).split(',') : undefined,
        names: req.query.names ? (req.query.names as string).split(',') : undefined,
        statuses: req.query.statuses ? (req.query.statuses as string).split(',') as ContextStatus[] : undefined,
        lifecycle_stages: req.query.lifecycle_stages ? (req.query.lifecycle_stages as string).split(',') as ContextLifecycleStage[] : undefined,
        owner_user_ids: req.query.owner_user_ids ? (req.query.owner_user_ids as string).split(',') : undefined,
        created_after: req.query.created_after as string,
        created_before: req.query.created_before as string
      };

      const result = await this.contextService.queryContexts(filter);
      const response = this.buildAPIResponse(result, startTime, requestId);

      if (result.success) {
        res.status(200).json(response);
        logger.info('Contexts queried successfully', {
          count: result.data?.length || 0,
          execution_time_ms: result.execution_time_ms
        });
      } else {
        res.status(400).json(response);
      }

    } catch (error) {
      const response = this.buildErrorResponse(error, startTime, requestId);
      res.status(500).json(response);
      next(error);
    }
  }

  /**
   * 批量处理Contexts
   * POST /api/v1/contexts/batch
   */
  private async batchProcessContexts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();

    try {
      const batchRequest: BatchContextRequest = req.body;

      const result = await this.contextService.batchProcessContexts(batchRequest);
      const response = this.buildAPIResponse(result, startTime, requestId);

      if (result.success) {
        res.status(200).json(response);
        logger.info('Batch processing completed', {
          total: result.data?.summary.total,
          successful: result.data?.summary.successful,
          failed: result.data?.summary.failed,
          execution_time_ms: result.execution_time_ms
        });
      } else {
        res.status(400).json(response);
      }

    } catch (error) {
      const response = this.buildErrorResponse(error, startTime, requestId);
      res.status(500).json(response);
      next(error);
    }
  }

  /**
   * 更新Context状态
   * PATCH /api/v1/contexts/:contextId/status
   */
  private async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();

    try {
      const contextId = req.params.contextId as UUID;
      const { status } = req.body;

      const result = await this.contextService.updateStatus(contextId, status);
      const response = this.buildAPIResponse(result, startTime, requestId);

      if (result.success) {
        res.status(200).json(response);
        logger.info('Context status updated', {
          context_id: contextId,
          new_status: status,
          execution_time_ms: result.execution_time_ms
        });
      } else {
        res.status(400).json(response);
      }

    } catch (error) {
      const response = this.buildErrorResponse(error, startTime, requestId);
      res.status(500).json(response);
      next(error);
    }
  }

  /**
   * 更新生命周期阶段
   * PATCH /api/v1/contexts/:contextId/lifecycle
   */
  private async updateLifecycle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();

    try {
      const contextId = req.params.contextId as UUID;
      const { lifecycle_stage } = req.body;

      const result = await this.contextService.updateLifecycleStage(contextId, lifecycle_stage);
      const response = this.buildAPIResponse(result, startTime, requestId);

      if (result.success) {
        res.status(200).json(response);
        logger.info('Context lifecycle updated', {
          context_id: contextId,
          new_lifecycle_stage: lifecycle_stage,
          execution_time_ms: result.execution_time_ms
        });
      } else {
        res.status(400).json(response);
      }

    } catch (error) {
      const response = this.buildErrorResponse(error, startTime, requestId);
      res.status(500).json(response);
      next(error);
    }
  }

  // ===== 验证中间件 =====

  /**
   * 验证创建Context请求
   */
  private validateCreateContext() {
    return [
      body('name').isString().isLength({ min: 1, max: 255 }).trim(),
      body('description').optional().isString().isLength({ max: 1000 }).trim(),
      body('shared_state').optional().isObject(),
      body('access_control').optional().isObject(),
      body('configuration').optional().isObject()
    ];
  }

  /**
   * 验证Context ID参数
   */
  private validateContextId() {
    return [
      param('contextId').isUUID(4).withMessage('Context ID must be a valid UUID v4')
    ];
  }

  /**
   * 验证更新Context请求
   */
  private validateUpdateContext() {
    return [
      body('name').optional().isString().isLength({ min: 1, max: 255 }).trim(),
      body('description').optional().isString().isLength({ max: 1000 }).trim(),
      body('status').optional().isIn(['active', 'suspended', 'completed', 'terminated']),
      body('lifecycle_stage').optional().isIn(['planning', 'executing', 'monitoring', 'completed']),
      body('shared_state').optional().isObject(),
      body('access_control').optional().isObject(),
      body('configuration').optional().isObject()
    ];
  }

  /**
   * 验证查询参数
   */
  private validateQueryContexts() {
    return [
      query('context_ids').optional().isString(),
      query('names').optional().isString(),
      query('statuses').optional().isString(),
      query('lifecycle_stages').optional().isString(),
      query('owner_user_ids').optional().isString(),
      query('created_after').optional().isISO8601(),
      query('created_before').optional().isISO8601()
    ];
  }

  /**
   * 验证批量请求
   */
  private validateBatchRequest() {
    return [
      body('operations').isArray().isLength({ min: 1, max: 100 }),
      body('operations.*.type').isIn(['create', 'update', 'delete']),
      body('operations.*.data').isObject()
    ];
  }

  /**
   * 验证状态更新
   */
  private validateUpdateStatus() {
    return [
      body('status').isIn(['active', 'suspended', 'completed', 'terminated'])
    ];
  }

  /**
   * 验证生命周期更新
   */
  private validateUpdateLifecycle() {
    return [
      body('lifecycle_stage').isIn(['planning', 'executing', 'monitoring', 'completed'])
    ];
  }

  // ===== 辅助方法 =====

  /**
   * 处理验证错误
   */
  private handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: errors.array()
        }
      });
      return;
    }
    next();
  }

  /**
   * 获取认证用户信息
   */
  private getAuthenticatedUser(req: AuthenticatedRequest): AuthenticatedUser {
    if (req.user) {
      return req.user;
    }
    
    // 从header获取用户信息 (临时方案)
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    
    if (!userId) {
      throw new ValidationError('User authentication required');
    }
    
    return {
      id: userId,
      role: userRole || 'user'
    };
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 构建API响应
   */
  private buildAPIResponse<T>(
    result: ContextOperationResult<T>,
    startTime: number,
    requestId: string
  ): APIResponse<T> {
    const executionTime = performance.now() - startTime;

    if (result.success) {
      return {
        success: true,
        data: result.data,
        metadata: {
          execution_time_ms: result.execution_time_ms || executionTime,
          timestamp: new Date().toISOString(),
          request_id: requestId
        }
      };
    } else {
      return {
        success: false,
        error: {
          code: result.error?.code || 'UNKNOWN_ERROR',
          message: result.error?.message || 'An unknown error occurred',
          details: result.error?.details
        },
        metadata: {
          execution_time_ms: result.execution_time_ms || executionTime,
          timestamp: new Date().toISOString(),
          request_id: requestId
        }
      };
    }
  }

  /**
   * 构建错误响应
   */
  private buildErrorResponse(error: unknown, startTime: number, requestId: string): APIResponse {
    const executionTime = performance.now() - startTime;
    
    let contextError: ContextError;
    if (error instanceof ContextError) {
      contextError = error;
    } else if (error instanceof Error) {
      contextError = new ContextError(error.message, 'INTERNAL_ERROR', { originalError: error });
    } else {
      contextError = new ContextError('Unknown error occurred', 'UNKNOWN_ERROR', { error });
    }

    return {
      success: false,
      error: {
        code: contextError.code,
        message: contextError.message,
        details: contextError.details
      },
      metadata: {
        execution_time_ms: executionTime,
        timestamp: new Date().toISOString(),
        request_id: requestId
      }
    };
  }
} 