/**
 * Confirm控制器
 * 
 * API层控制器，处理HTTP请求
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../../public/shared/types';
import { CreateConfirmHandler } from '../../application/commands/create-confirm.command';
import { GetConfirmByIdHandler } from '../../application/queries/get-confirm-by-id.query';
import { ConfirmManagementService } from '../../application/services/confirm-management.service';
import { 
  ConfirmStatus, 
  ConfirmDecision,
  ConfirmFilter 
} from '../../types';

/**
 * HTTP请求接口
 */
export interface HttpRequest {
  params: Record<string, any>;
  body: any;
  query: Record<string, any>;
  user?: {
    id: string;
    role: string;
  };
}

/**
 * HTTP响应接口
 */
export interface HttpResponse {
  status: number;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Confirm控制器
 */
export class ConfirmController {
  constructor(
    private readonly createConfirmHandler: CreateConfirmHandler,
    private readonly getConfirmByIdHandler: GetConfirmByIdHandler,
    private readonly confirmManagementService: ConfirmManagementService
  ) {}

  /**
   * 创建确认
   * POST /api/v1/confirms
   */
  async createConfirm(req: HttpRequest): Promise<HttpResponse> {
    try {
      const result = await this.createConfirmHandler.handle(req.body);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 201,
        data: result.data?.toProtocol(),
        message: '确认创建成功'
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 获取确认详情
   * GET /api/v1/confirms/:id
   */
  async getConfirmById(req: HttpRequest): Promise<HttpResponse> {
    try {
      const confirmId = req.params.id;
      const result = await this.getConfirmByIdHandler.handle({ confirm_id: confirmId });
      
      if (!result.success) {
        return {
          status: 404,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol()
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 更新确认状态
   * PUT /api/v1/confirms/:id/status
   */
  async updateConfirmStatus(req: HttpRequest): Promise<HttpResponse> {
    try {
      const confirmId = req.params.id;
      const { status, decision } = req.body;

      const result = await this.confirmManagementService.updateConfirmStatus(
        confirmId,
        status,
        decision
      );
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol(),
        message: '确认状态更新成功'
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 取消确认
   * PUT /api/v1/confirms/:id/cancel
   */
  async cancelConfirm(req: HttpRequest): Promise<HttpResponse> {
    try {
      const confirmId = req.params.id;
      const result = await this.confirmManagementService.cancelConfirm(confirmId);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol(),
        message: '确认已取消'
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 查询确认列表
   * GET /api/v1/confirms
   */
  async queryConfirms(req: HttpRequest): Promise<HttpResponse> {
    try {
      const filter: ConfirmFilter = {
        context_id: req.query.context_id,
        plan_id: req.query.plan_id,
        confirmation_type: req.query.confirmation_type,
        status: req.query.status,
        priority: req.query.priority,
        requester_user_id: req.query.requester_user_id,
        created_after: req.query.created_after,
        created_before: req.query.created_before,
        expires_after: req.query.expires_after,
        expires_before: req.query.expires_before
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order as 'asc' | 'desc'
      };

      const result = await this.confirmManagementService.queryConfirms(filter, pagination);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: {
          ...result.data,
          items: result.data?.items.map(confirm => confirm.toProtocol())
        }
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 获取待处理确认
   * GET /api/v1/confirms/pending
   */
  async getPendingConfirms(req: HttpRequest): Promise<HttpResponse> {
    try {
      const userId = req.query.user_id || req.user?.id;
      const result = await this.confirmManagementService.getPendingConfirms(userId);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data?.map(confirm => confirm.toProtocol())
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 获取确认统计信息
   * GET /api/v1/confirms/statistics
   */
  async getConfirmStatistics(req: HttpRequest): Promise<HttpResponse> {
    try {
      const contextId = req.query.context_id;
      const result = await this.confirmManagementService.getConfirmStatistics(contextId);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 批量更新确认状态
   * PUT /api/v1/confirms/batch/status
   */
  async batchUpdateStatus(req: HttpRequest): Promise<HttpResponse> {
    try {
      const { confirm_ids, status } = req.body;
      const result = await this.confirmManagementService.batchUpdateStatus(confirm_ids, status);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: { updated_count: result.data },
        message: '批量更新成功'
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }
}
