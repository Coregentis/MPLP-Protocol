/**
 * Confirm控制器
 *
 * API层控制器，处理HTTP请求
 * 支持企业级审批工作流和跨模块集成
 * 基于完整的DTO定义实现RESTful API
 *
 * @version 1.0.0
 * @created 2025-08-18
 */

import { ConfirmManagementService } from '../../application/services/confirm-management.service';
import {
  CreateConfirmRequestDto,
  UpdateConfirmStatusRequestDto,
  ConfirmResponseDto,
  ConfirmSubjectDto,
  ApprovalWorkflowDto,
} from '../dto/confirm.dto';
// import { ConfirmMapper, ConfirmEntityData } from '../mappers/confirm.mapper'; // 暂时未使用
import { Confirm } from '../../domain/entities/confirm.entity';
import {
  ConfirmStatus,
  ConfirmationType,
  Priority,
  // ConfirmDecision // 暂时未使用
} from '../../types';
// 工具函数
const getQueryString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined;
};

const _getQueryEnum = <T>(value: unknown, validValues: T[]): T | undefined => {
  if (typeof value === 'string' && validValues.includes(value as T)) {
    return value as T;
  }
  return undefined;
};

const validateRequiredFields = (body: Record<string, unknown>, fields: string[]): string[] => {
  return fields.filter(field => !body[field]);
};

const createErrorResponse = (status: number, error: string, requestId?: string): HttpResponse<unknown> => {
  return {
    status,
    error,
    timestamp: new Date().toISOString(),
    requestId
  };
};

/**
 * HTTP请求接口
 */
export interface HttpRequest<T = unknown> {
  params: Record<string, string>;
  body: T;
  query: Record<string, string | string[] | undefined>;
  headers: Record<string, string>;
  user?: {
    id: string;
    role: string;
    permissions: string[];
  };
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

/**
 * HTTP响应接口
 */
export interface HttpResponse<T = unknown> {
  status: number;
  data?: T;
  error?: string;
  message?: string;
  warnings?: string[];
  timestamp: string;
  requestId?: string;
}

/**
 * 工具函数
 */
class ControllerUtils {
  /**
   * 安全地获取查询参数的字符串值
   */
  static getQueryString(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }
    return value;
  }

  /**
   * 安全地获取查询参数的数字值
   */
  static getQueryNumber(value: string | string[] | undefined): number | undefined {
    const stringValue = this.getQueryString(value);
    if (stringValue) {
      const num = parseInt(stringValue, 10);
      return isNaN(num) ? undefined : num;
    }
    return undefined;
  }

  /**
   * 安全地获取查询参数的布尔值
   */
  static getQueryBoolean(value: string | string[] | undefined): boolean | undefined {
    const stringValue = this.getQueryString(value);
    if (stringValue === 'true') return true;
    if (stringValue === 'false') return false;
    return undefined;
  }

  /**
   * 安全地获取查询参数的枚举值
   */
  static getQueryEnum<T>(value: string | string[] | undefined, validValues: readonly string[]): T | undefined {
    const stringValue = this.getQueryString(value);
    if (stringValue && validValues.includes(stringValue)) {
      return stringValue as T;
    }
    return undefined;
  }

  /**
   * 创建成功响应
   */
  static createSuccessResponse<T>(data: T, message?: string, requestId?: string): HttpResponse<T> {
    return {
      status: 200,
      data,
      message,
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  /**
   * 创建错误响应
   */
  static createErrorResponse(status: number, error: string, requestId?: string): HttpResponse {
    return {
      status,
      error,
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  /**
   * 验证必需字段
   */
  static validateRequiredFields(obj: Record<string, unknown>, fields: string[]): string[] {
    const missing: string[] = [];
    for (const field of fields) {
      if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
        missing.push(field);
      }
    }
    return missing;
  }
}

/**
 * 企业级审批和决策协调控制器
 */
export class ConfirmController {
  constructor(
    private readonly confirmManagementService: ConfirmManagementService
  ) {}

  /**
   * 转换实体数据为响应DTO (简化版本)
   */
  private convertToResponseDto(data: Confirm): Partial<ConfirmResponseDto> {
    return {
      protocolVersion: data.protocolVersion,
      timestamp: data.timestamp.toISOString(),
      confirmId: data.confirmId,
      contextId: data.contextId,
      planId: data.planId,
      confirmationType: data.confirmationType as ConfirmationType,
      status: data.status as ConfirmStatus,
      priority: data.priority as Priority,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      expiresAt: data.expiresAt?.toISOString(),
      // 简化的subject转换
      subject: {
        title: data.subject.title,
        description: data.subject.description,
        rationale: '', // ConfirmSubject没有rationale字段，使用默认值
        impactAssessment: typeof data.subject.impactAssessment === 'string'
          ? data.subject.impactAssessment
          : data.subject.impactAssessment?.businessImpact || '',
        riskLevel: data.subject.impactAssessment?.riskLevel || 'low',
      } as ConfirmSubjectDto,
      requester: data.requester,
      // 简化的approvalWorkflow转换
      approvalWorkflow: {
        workflowType: data.approvalWorkflow.workflowType || 'sequential',
        currentStep: 1,
        totalSteps: Math.max(1, data.approvalWorkflow.steps.length),
        steps: [],
      } as ApprovalWorkflowDto,
    };
  }

  /**
   * 创建确认
   * POST /api/v1/confirms
   */
  async createConfirm(req: HttpRequest<CreateConfirmRequestDto>): Promise<HttpResponse> {
    try {
      const requestId = req.requestId || `req-${Date.now()}`;

      // 验证必需字段
      const requiredFields = ['contextId', 'confirmationType', 'priority', 'subject', 'requester', 'approvalWorkflow', 'notificationSettings'];
      const missingFields = validateRequiredFields(req.body as unknown as Record<string, unknown>, requiredFields);

      if (missingFields.length > 0) {
        return createErrorResponse(
          400,
          `缺少必需字段: ${missingFields.join(', ')}`,
          requestId
        );
      }

      // 直接使用CreateConfirmRequestDto
      const result = await this.confirmManagementService.createConfirm(req.body);

      if (!result.success) {
        const errorMessage = Array.isArray(result.error) ? result.error.join(', ') : (result.error || '创建失败');
        return createErrorResponse(400, errorMessage, requestId);
      }

      // 转换为响应DTO
      const responseData = this.convertToResponseDto(result.data!);

      return {
        status: 201,
        data: responseData,
        message: '确认创建成功',
        timestamp: new Date().toISOString(),
        requestId,
      };
    } catch (error) {
      return ControllerUtils.createErrorResponse(
        500,
        error instanceof Error ? error.message : '服务器内部错误',
        req.requestId
      );
    }
  }

  /**
   * 获取确认详情
   * GET /api/v1/confirms/:id
   */
  async getConfirmById(req: HttpRequest): Promise<HttpResponse> {
    try {
      const requestId = req.requestId || `req-${Date.now()}`;
      const confirmId = req.params.id;

      if (!confirmId) {
        return ControllerUtils.createErrorResponse(400, '缺少确认ID', requestId);
      }

      const result = await this.confirmManagementService.getConfirmById(confirmId);

      if (!result.success) {
        const errorMessage = Array.isArray(result.error) ? result.error.join(', ') : (result.error || '确认不存在');
        return ControllerUtils.createErrorResponse(404, errorMessage, requestId);
      }

      // 转换为响应DTO
      const responseData = this.convertToResponseDto(result.data!);

      return ControllerUtils.createSuccessResponse(responseData, undefined, requestId);
    } catch (error) {
      return ControllerUtils.createErrorResponse(
        500,
        error instanceof Error ? error.message : '服务器内部错误',
        req.requestId
      );
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
      const { status, decision: _decision } = body;

      const updateRequest: UpdateConfirmStatusRequestDto = {
        status: status as ConfirmStatus,
        comments: '状态更新',
        approverId: req.user?.id
      };

      const result = await this.confirmManagementService.updateConfirmStatus(
        confirmId,
        updateRequest
      );
      
      if (!result.success) {
        const errorMessage = Array.isArray(result.error) ? result.error.join(', ') : (result.error || '状态更新失败');
        return {
          status: 400,
          error: errorMessage,
          timestamp: new Date().toISOString()
        };
      }

      return {
        status: 200,
        data: result.data, // 移除toProtocol()调用
        message: '确认状态更新成功',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
        timestamp: new Date().toISOString()
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
        const errorMessage = Array.isArray(result.error) ? result.error.join(', ') : (result.error || '取消失败');
        return {
          status: 400,
          error: errorMessage,
          timestamp: new Date().toISOString()
        };
      }

      return {
        status: 200,
        data: result.data, // 移除toProtocol()调用，直接返回ConfirmEntityData
        message: '确认已取消',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 查询确认列表
   * GET /api/v1/confirms
   */
  async queryConfirms(_req: HttpRequest): Promise<HttpResponse> {
    try {
      // 简化实现：使用现有的getPendingConfirms方法
      const result = await this.confirmManagementService.getPendingConfirms();
      
      if (!result.success) {
        const errorMessage = Array.isArray(result.error) ? result.error.join(', ') : (result.error || '查询失败');
        return {
          status: 400,
          error: errorMessage,
          timestamp: new Date().toISOString()
        };
      }

      return {
        status: 200,
        data: result.data, // 直接返回ConfirmEntityData[]数组
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 获取待处理确认
   * GET /api/v1/confirms/pending
   */
  async getPendingConfirms(_req: HttpRequest): Promise<HttpResponse> {
    try {
      // getPendingConfirms方法不需要参数
      const result = await this.confirmManagementService.getPendingConfirms();

      if (!result.success) {
        const errorMessage = Array.isArray(result.error) ? result.error.join(', ') : (result.error || '获取待处理确认失败');
        return {
          status: 400,
          error: errorMessage,
          timestamp: new Date().toISOString()
        };
      }

      return {
        status: 200,
        data: result.data, // 直接返回ConfirmEntityData[]数组
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 获取确认统计信息
   * GET /api/v1/confirms/statistics
   */
  async getConfirmStatistics(req: HttpRequest): Promise<HttpResponse> {
    try {
      const _contextId = getQueryString(req.query.contextId);
      // 使用现有的getStatistics方法
      const result = await this.confirmManagementService.getStatistics();
      
      if (!result.success) {
        const errorMessage = Array.isArray(result.error) ? result.error.join(', ') : (result.error || '获取统计信息失败');
        return {
          status: 400,
          error: errorMessage,
          timestamp: new Date().toISOString()
        };
      }

      return {
        status: 200,
        data: result.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 批量更新确认状态
   * PUT /api/v1/confirms/batch/status
   */
  async batchUpdateStatus(req: HttpRequest): Promise<HttpResponse> {
    try {
      const body = req.body as { confirmIds: string[]; status: ConfirmStatus };
      const { confirmIds, status } = body;
      const result = await this.confirmManagementService.batchUpdateStatus(confirmIds, status);
      
      if (!result.success) {
        const errorMessage = Array.isArray(result.error) ? result.error.join(', ') : (result.error || '批量更新失败');
        return {
          status: 400,
          error: errorMessage,
          timestamp: new Date().toISOString()
        };
      }

      return {
        status: 200,
        data: { updated_count: result.data },
        message: '批量更新成功',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误',
        timestamp: new Date().toISOString()
      };
    }
  }
}
