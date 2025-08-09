/**
 * Confirm控制器
 * 
 * API层控制器，处理HTTP请求
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

// UUID 类型已在其他地方定义
import { CreateConfirmHandler, CreateConfirmCommand } from '../../application/commands/create-confirm.command';
import { GetConfirmByIdHandler } from '../../application/queries/get-confirm-by-id.query';
import { ConfirmManagementService } from '../../application/services/confirm-management.service';
import {
  ConfirmFilter,
  ConfirmStatus,
  ConfirmationType,
  Priority,
  ConfirmDecision
} from '../../types';

/**
 * HTTP请求接口
 */
export interface HttpRequest {
  params: Record<string, string>;
  body: unknown;
  query: Record<string, string | string[] | undefined>;
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
  data?: unknown;
  error?: string;
  message?: string;
}

/**
 * 安全地获取查询参数的字符串值
 */
function getQueryString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

/**
 * 安全地获取查询参数的枚举值
 */
function getQueryEnum<T>(value: string | string[] | undefined, validValues: readonly string[]): T | undefined {
  const stringValue = getQueryString(value);
  if (stringValue && validValues.includes(stringValue)) {
    return stringValue as T;
  }
  return undefined;
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
      const result = await this.createConfirmHandler.handle(req.body as CreateConfirmCommand);
      
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
      const result = await this.getConfirmByIdHandler.handle({ confirmId: confirmId });
      
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
      const body = req.body as { status: string; decision?: unknown };
      const { status, decision } = body;

      const result = await this.confirmManagementService.updateConfirmStatus(
        confirmId,
        status as ConfirmStatus,
        decision as ConfirmDecision | undefined
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
        contextId: getQueryString(req.query.contextId),
        planId: getQueryString(req.query.planId),
        confirmationType: getQueryEnum<ConfirmationType>(req.query.confirmationType, Object.values(ConfirmationType)),
        status: getQueryEnum<ConfirmStatus>(req.query.status, Object.values(ConfirmStatus)),
        priority: getQueryEnum<Priority>(req.query.priority, Object.values(Priority)),
        requesterId: getQueryString(req.query.requester_user_id),
        createdAfter: getQueryString(req.query.created_after),
        createdBefore: getQueryString(req.query.created_before),
        expiresAfter: getQueryString(req.query.expires_after),
        expiresBefore: getQueryString(req.query.expires_before)
      };

      const pagination = {
        page: parseInt(getQueryString(req.query.page) || '1') || 1,
        limit: parseInt(getQueryString(req.query.limit) || '10') || 10,
        sort_by: getQueryString(req.query.sort_by),
        sort_order: getQueryString(req.query.sort_order) as 'asc' | 'desc' | undefined
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
      const userId = getQueryString(req.query.userId) || req.user?.id;
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
      const contextId = getQueryString(req.query.contextId);
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
      const body = req.body as { confirm_ids: string[]; status: ConfirmStatus };
      const { confirm_ids, status } = body;
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
