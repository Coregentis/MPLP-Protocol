/**
 * Trace控制器
 *
 * API层控制器，处理HTTP请求
 *
 * @version 1.0.0
 * @created 2025-09-16
 */

import { TraceManagementService } from '../../application/services/trace-management.service';
import { TraceFilter } from '../../domain/repositories/trace-repository.interface';
import { CreateTraceRequest } from '../../domain/factories/trace.factory';
import {
  TraceType,
  TraceSeverity,
  EventType,
  Correlation,
  PerformanceMetrics,
  ErrorInformation
} from '../../types';
import { TraceMapper } from '../mappers/trace.mapper';


/**
 * HTTP请求接口
 */
export interface HttpRequest {
  params: Record<string, unknown>;
  body: Record<string, unknown>;
  query: Record<string, unknown>;
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
 * Trace控制器
 */
export class TraceController {
  constructor(
    private readonly traceManagementService: TraceManagementService
  ) {}

  /**
   * 创建追踪
   * POST /api/v1/traces
   */
  async createTrace(req: HttpRequest): Promise<HttpResponse> {
    try {
      // 使用TraceMapper将Schema负载转换为内部请求格式
      const internalRequest = TraceMapper.fromSchema(req.body);

      // 转换为工厂期望的snake_case格式
      const createRequest: CreateTraceRequest = {
        context_id: internalRequest.contextId,
        plan_id: internalRequest.planId,
        trace_type: internalRequest.traceType,
        severity: internalRequest.severity,
        event: internalRequest.event,
        timestamp: internalRequest.timestamp,
        performance_metrics: internalRequest.performanceMetrics,
        error_information: internalRequest.errorInformation,
        correlations: internalRequest.correlations,
        metadata: internalRequest.metadata
      };

      const result = await this.traceManagementService.createTrace(createRequest);

      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 201,
        data: result.data ? TraceMapper.toSchema(result.data) : undefined,
        message: '追踪创建成功'
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 获取追踪详情
   * GET /api/v1/traces/:id
   */
  async getTraceById(req: HttpRequest): Promise<HttpResponse> {
    try {
      const traceId = req.params.id as string;
      const result = await this.traceManagementService.getTraceById(traceId);

      if (!result.success) {
        return {
          status: 404,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data ? TraceMapper.toSchema(result.data) : undefined
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 查询追踪列表
   * GET /api/v1/traces
   */
  async queryTraces(req: HttpRequest): Promise<HttpResponse> {
    try {
      const filter: TraceFilter = {
        context_id: req.query.contextId as string | undefined,
        plan_id: req.query.planId as string | undefined,
        task_id: req.query.taskId as string | undefined,
        trace_type: req.query.traceType as TraceType | undefined,
        severity: req.query.severity as TraceSeverity | undefined,
        event_type: req.query.event_type as EventType | undefined,
        event_category: req.query.event_category as string | undefined,
        source_component: req.query.source_component as string | undefined,
        timestamp_after: req.query.timestamp_after as string | undefined,
        timestamp_before: req.query.timestamp_before as string | undefined,
        has_errors: req.query.has_errors === 'true',
        has_performance_metrics: req.query.has_performance_metrics === 'true',
        correlation_trace_id: req.query.correlation_trace_id as string | undefined
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sort_by: req.query.sort_by as string | undefined,
        sort_order: (req.query.sort_order as 'asc' | 'desc') || 'desc'
      };

      const result = await this.traceManagementService.queryTraces(filter, pagination);

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
          items: result.data?.items.map(trace => TraceMapper.toSchema(trace))
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
   * 获取错误追踪
   * GET /api/v1/traces/errors
   */
  async getErrorTraces(req: HttpRequest): Promise<HttpResponse> {
    try {
      const contextId = req.query.contextId as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const result = await this.traceManagementService.getErrorTraces(contextId, limit);

      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: {
          traces: result.data?.map(trace => TraceMapper.toSchema(trace)) || []
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
   * 获取性能追踪
   * GET /api/v1/traces/performance
   */
  async getPerformanceTraces(req: HttpRequest): Promise<HttpResponse> {
    try {
      const contextId = req.query.contextId as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const result = await this.traceManagementService.getPerformanceTraces(contextId, limit);

      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: {
          traces: result.data?.map(trace => TraceMapper.toSchema(trace)) || []
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
   * 添加关联
   * POST /api/v1/traces/:id/correlations
   */
  async addCorrelation(req: HttpRequest): Promise<HttpResponse> {
    try {
      const traceId = req.params.id as string;
      const correlation = req.body as unknown as Correlation;

      const result = await this.traceManagementService.addCorrelation(traceId, correlation);

      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data ? TraceMapper.toSchema(result.data) : undefined,
        message: '关联添加成功'
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 更新性能指标
   * PUT /api/v1/traces/:id/performance
   */
  async updatePerformanceMetrics(req: HttpRequest): Promise<HttpResponse> {
    try {
      const traceId = req.params.id as string;
      const metrics = req.body as unknown as PerformanceMetrics;

      const result = await this.traceManagementService.updatePerformanceMetrics(traceId, metrics);

      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data ? TraceMapper.toSchema(result.data) : undefined,
        message: '性能指标更新成功'
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 设置错误信息
   * PUT /api/v1/traces/:id/error
   */
  async setErrorInformation(req: HttpRequest): Promise<HttpResponse> {
    try {
      const traceId = req.params.id as string;
      const errorInfo = req.body as unknown as ErrorInformation;

      const result = await this.traceManagementService.setErrorInformation(traceId, errorInfo);

      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data ? TraceMapper.toSchema(result.data) : undefined,
        message: '错误信息设置成功'
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 分析追踪
   * GET /api/v1/traces/analysis
   */
  async analyzeTraces(req: HttpRequest): Promise<HttpResponse> {
    try {
      const contextId = req.query.contextId as string | undefined;
      const result = await this.traceManagementService.analyzeTraces(contextId);

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
   * 性能分析
   * GET /api/v1/traces/performance-analysis
   */
  async analyzePerformance(req: HttpRequest): Promise<HttpResponse> {
    try {
      const contextId = req.query.contextId as string | undefined;
      const result = await this.traceManagementService.analyzePerformance(contextId);

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
   * 获取追踪链
   * GET /api/v1/traces/:id/chain
   */
  async getTraceChain(req: HttpRequest): Promise<HttpResponse> {
    try {
      const traceId = req.params.id as string;
      const result = await this.traceManagementService.getTraceChain(traceId);

      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data?.map(trace => trace.toProtocol())
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 获取统计信息
   * GET /api/v1/traces/statistics
   */
  async getStatistics(req: HttpRequest): Promise<HttpResponse> {
    try {
      const contextId = req.query.contextId as string | undefined;
      const timeRange = req.query.start && req.query.end ? {
        start: req.query.start as string,
        end: req.query.end as string
      } : undefined;

      const result = await this.traceManagementService.getStatistics(contextId, timeRange);

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
   * 搜索追踪
   * GET /api/v1/traces/search
   */
  async searchTraces(req: HttpRequest): Promise<HttpResponse> {
    try {
      const query = req.query.q as string;
      if (!query) {
        return {
          status: 400,
          error: '搜索查询不能为空'
        };
      }

      const filter: TraceFilter = {
        context_id: req.query.contextId as string | undefined,
        trace_type: req.query.traceType as TraceType | undefined,
        severity: req.query.severity as TraceSeverity | undefined
      };

      const result = await this.traceManagementService.searchTraces(query, filter);

      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data?.map(trace => trace.toProtocol())
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 删除追踪
   * DELETE /api/v1/traces/:id
   */
  async deleteTrace(req: HttpRequest): Promise<HttpResponse> {
    try {
      const traceId = req.params.id as string;
      const result = await this.traceManagementService.deleteTrace(traceId);

      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        message: '追踪删除成功'
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }

  /**
   * 清理过期追踪
   * POST /api/v1/traces/cleanup
   */
  async cleanupExpiredTraces(req: HttpRequest): Promise<HttpResponse> {
    try {
      const olderThanDays = parseInt(req.body.older_than_days as string) || 30;
      const result = await this.traceManagementService.cleanupExpiredTraces(olderThanDays);

      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: { deleted_count: result.data },
        message: '过期追踪清理完成'
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : '服务器内部错误'
      };
    }
  }
}
