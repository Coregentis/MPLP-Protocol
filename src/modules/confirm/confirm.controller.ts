/**
 * MPLP Confirm模块控制器
 * 
 * @version v1.0.2
 * @updated 2025-07-10T17:04:47+08:00
 * @compliance 100% Schema合规性 - 基于confirm-protocol.json重构
 * @description REST API控制器，提供确认验证决策的HTTP接口
 */

import { Request, Response } from 'express';
import { ConfirmService } from './confirm-service';
import { 
  ConfirmProtocol,
  CreateConfirmRequest,
  UpdateConfirmRequest,
  ConfirmResponse,
  BatchConfirmRequest,
  BatchConfirmResponse,
  StepActionRequest,
  WorkflowActionResponse,
  ConfirmFilter,
  ConfirmationType,
  ConfirmStatus,
  Priority,
  UUID
} from './types';
import { logger } from '../../utils/logger';

/**
 * Confirm模块REST API控制器
 * 
 * 提供确认验证决策的HTTP接口：
 * - POST /confirmations - 创建确认请求
 * - PUT /confirmations/:id - 更新确认
 * - GET /confirmations/:id - 获取确认详情
 * - GET /confirmations - 查询确认列表
 * - POST /confirmations/:id/actions - 处理工作流步骤
 * - POST /confirmations/batch - 批量处理
 * - GET /health - 健康检查
 */
export class ConfirmController {
  private confirmService: ConfirmService;

  /**
   * 构造函数
   */
  constructor() {
    this.confirmService = new ConfirmService();
    logger.info('ConfirmController initialized', {
      controller: 'confirm',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 创建确认请求
   * POST /api/v1/confirmations
   * 
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async createConfirmation(req: Request, res: Response): Promise<void> {
    const startTime = performance.now();

    try {
      const request: CreateConfirmRequest = req.body;

      // 基础验证
      if (!request.context_id || !request.confirmation_type || !request.priority) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: context_id, confirmation_type, priority',
          error_code: 'MISSING_FIELDS'
        });
        return;
      }

      // 创建确认
      const result = await this.confirmService.createConfirmation(request);

      const operationTime = performance.now() - startTime;

      if (result.success) {
        logger.info('Confirmation created via API', {
          confirm_id: result.data?.confirm_id,
          type: request.confirmation_type,
          priority: request.priority,
          operation_time_ms: operationTime
        });

        res.status(201).json({
          success: true,
          data: result.data,
          metadata: {
            ...result.metadata,
            operation_time_ms: operationTime
          }
        });
      } else {
        logger.warn('Failed to create confirmation via API', {
          error: result.error?.message,
          error_code: result.error?.code,
          operation_time_ms: operationTime
        });

        res.status(400).json({
          success: false,
          error: result.error?.message,
          error_code: result.error?.code,
          details: result.error?.details,
          metadata: {
            ...result.metadata,
            operation_time_ms: operationTime
          }
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const operationTime = performance.now() - startTime;

      logger.error('Error in createConfirmation API', {
        error: errorMessage,
        operation_time_ms: operationTime
      });

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        error_code: 'INTERNAL_ERROR',
        metadata: {
          operation_time_ms: operationTime
        }
      });
    }
  }

  /**
   * 更新确认
   * PUT /api/v1/confirmations/:id
   * 
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async updateConfirmation(req: Request, res: Response): Promise<void> {
    const startTime = performance.now();

    try {
      const confirmId = req.params.id as UUID;
      const request: UpdateConfirmRequest = {
        confirm_id: confirmId,
        ...req.body
      };

      // 验证确认ID
      if (!confirmId) {
        res.status(400).json({
          success: false,
          error: 'Missing confirmation ID',
          error_code: 'MISSING_ID'
        });
        return;
      }

      const result = await this.confirmService.updateConfirmation(confirmId, request);

      const operationTime = performance.now() - startTime;

      if (result.success) {
        logger.info('Confirmation updated via API', {
          confirm_id: confirmId,
          operation_time_ms: operationTime
        });

        res.status(200).json({
          success: true,
          data: result.data,
          metadata: {
            ...result.metadata,
            operation_time_ms: operationTime
          }
        });
      } else {
        logger.warn('Failed to update confirmation via API', {
          confirm_id: confirmId,
          error: result.error?.message,
          error_code: result.error?.code,
          operation_time_ms: operationTime
        });

        res.status(400).json({
          success: false,
          error: result.error?.message,
          error_code: result.error?.code,
          details: result.error?.details,
          metadata: {
            ...result.metadata,
            operation_time_ms: operationTime
          }
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const operationTime = performance.now() - startTime;

      logger.error('Error in updateConfirmation API', {
        error: errorMessage,
        operation_time_ms: operationTime
      });

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        error_code: 'INTERNAL_ERROR',
        metadata: {
          operation_time_ms: operationTime
        }
      });
    }
  }

  /**
   * 处理工作流步骤操作
   * POST /api/v1/confirmations/:id/actions
   * 
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async processStepAction(req: Request, res: Response): Promise<void> {
    const startTime = performance.now();

    try {
      const confirmId = req.params.id as UUID;
      const request: StepActionRequest = req.body;

      // 验证请求参数
      if (!confirmId || !request.step_id || !request.action) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: step_id, action',
          error_code: 'MISSING_FIELDS'
        });
        return;
      }

      // 验证决策值
      const validActions = ['approve', 'reject', 'request_changes', 'delegate'];
      if (!validActions.includes(request.action)) {
        res.status(400).json({
          success: false,
          error: `Invalid action. Must be one of: ${validActions.join(', ')}`,
          error_code: 'INVALID_ACTION'
        });
        return;
      }

      const result = await this.confirmService.processStepAction(confirmId, request);

      const operationTime = performance.now() - startTime;

      logger.info('Step action processed via API', {
        confirm_id: confirmId,
        step_id: request.step_id,
        action: request.action,
        workflow_completed: result.workflow_completed,
        operation_time_ms: operationTime
      });

      res.status(200).json({
        success: true,
        data: {
          updated_confirmation: result.updated_confirmation,
          next_steps: result.next_steps,
          workflow_completed: result.workflow_completed
        },
        metadata: {
          operation_time_ms: operationTime
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const operationTime = performance.now() - startTime;

      logger.error('Error in processStepAction API', {
        error: errorMessage,
        operation_time_ms: operationTime
      });

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        error_code: 'INTERNAL_ERROR',
        metadata: {
          operation_time_ms: operationTime
        }
      });
    }
  }

  /**
   * 获取确认详情
   * GET /api/v1/confirmations/:id
   * 
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async getConfirmation(req: Request, res: Response): Promise<void> {
    const startTime = performance.now();

    try {
      const confirmId = req.params.id as UUID;

      if (!confirmId) {
        res.status(400).json({
          success: false,
          error: 'Missing confirmation ID',
          error_code: 'MISSING_ID'
        });
        return;
      }

      // 这里需要实现获取单个确认的逻辑
      // const confirmation = await this.confirmService.getConfirmationById(confirmId);

      const operationTime = performance.now() - startTime;

      logger.info('Confirmation retrieved via API', {
        confirm_id: confirmId,
        operation_time_ms: operationTime
      });

      res.status(200).json({
        success: true,
        data: null, // TODO: 实现获取逻辑
        metadata: {
          operation_time_ms: operationTime
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const operationTime = performance.now() - startTime;

      logger.error('Error in getConfirmation API', {
        error: errorMessage,
        operation_time_ms: operationTime
      });

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        error_code: 'INTERNAL_ERROR',
        metadata: {
          operation_time_ms: operationTime
        }
      });
    }
  }

  /**
   * 查询确认列表
   * GET /api/v1/confirmations
   * 
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async queryConfirmations(req: Request, res: Response): Promise<void> {
    const startTime = performance.now();

    try {
      // 构建查询过滤器
      const filter: ConfirmFilter = {
        confirmation_types: req.query.types ? (req.query.types as string).split(',') as ConfirmationType[] : undefined,
        statuses: req.query.statuses ? (req.query.statuses as string).split(',') as ConfirmStatus[] : undefined,
        priorities: req.query.priorities ? (req.query.priorities as string).split(',') as Priority[] : undefined,
        context_ids: req.query.context_ids ? (req.query.context_ids as string).split(',') as UUID[] : undefined,
        plan_ids: req.query.plan_ids ? (req.query.plan_ids as string).split(',') as UUID[] : undefined
      };

      const results = await this.confirmService.queryConfirmations(filter);

      const operationTime = performance.now() - startTime;

      logger.info('Confirmations queried via API', {
        result_count: results.length,
        filter,
        operation_time_ms: operationTime
      });

      res.status(200).json({
        success: true,
        data: results,
        metadata: {
          count: results.length,
          operation_time_ms: operationTime
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const operationTime = performance.now() - startTime;

      logger.error('Error in queryConfirmations API', {
        error: errorMessage,
        operation_time_ms: operationTime
      });

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        error_code: 'INTERNAL_ERROR',
        metadata: {
          operation_time_ms: operationTime
        }
      });
    }
  }

  /**
   * 批量处理确认
   * POST /api/v1/confirmations/batch
   * 
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async processBatchConfirmations(req: Request, res: Response): Promise<void> {
    const startTime = performance.now();

    try {
      const batchRequest: BatchConfirmRequest = req.body;

      // 验证批量请求
      if (!batchRequest.requests || !Array.isArray(batchRequest.requests) || batchRequest.requests.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Missing or empty requests array',
          error_code: 'MISSING_REQUESTS'
        });
        return;
      }

      const result = await this.confirmService.batchCreateConfirmations(batchRequest);

      const operationTime = performance.now() - startTime;

      logger.info('Batch confirmations processed via API', {
        total_requests: batchRequest.requests.length,
        succeeded: result.summary.succeeded,
        failed: result.summary.failed,
        operation_time_ms: operationTime
      });

      res.status(200).json({
        success: result.success,
        data: {
          results: result.results,
          summary: result.summary
        },
        metadata: {
          operation_time_ms: operationTime
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const operationTime = performance.now() - startTime;

      logger.error('Error in processBatchConfirmations API', {
        error: errorMessage,
        operation_time_ms: operationTime
      });

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        error_code: 'INTERNAL_ERROR',
        metadata: {
          operation_time_ms: operationTime
        }
      });
    }
  }

  /**
   * 健康检查
   * GET /api/v1/confirmations/health
   * 
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async healthCheck(req: Request, res: Response): Promise<void> {
    const startTime = performance.now();

    try {
      const healthStatus = await this.confirmService.getHealthStatus();

      const operationTime = performance.now() - startTime;

      const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        success: healthStatus.status === 'healthy',
        data: {
          status: healthStatus.status,
          checks: healthStatus.checks,
          timestamp: new Date().toISOString()
        },
        metadata: {
          operation_time_ms: operationTime
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const operationTime = performance.now() - startTime;

      logger.error('Error in healthCheck API', {
        error: errorMessage,
        operation_time_ms: operationTime
      });

      res.status(503).json({
        success: false,
        error: 'Health check failed',
        error_code: 'HEALTH_CHECK_FAILED',
        metadata: {
          operation_time_ms: operationTime
        }
      });
    }
  }
} 