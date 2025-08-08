/**
 * Trace控制器
 * 
 * API层控制器，处理HTTP请求
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../../public/shared/types';
import { TraceManagementService } from '../../application/services/trace-management.service';
import { TraceFilter } from '../../domain/repositories/trace-repository.interface';
import { CreateTraceRequest } from '../../domain/factories/trace.factory';
import { 
  TraceType, 
  TraceSeverity,
  Correlation,
  PerformanceMetrics,
  ErrorInformation 
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
      const createRequest: CreateTraceRequest = req.body;
      const result = await this.traceManagementService.createTrace(createRequest);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 201,
        data: result.data?.toProtocol(),
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
      const traceId = req.params.id;
      const result = await this.traceManagementService.getTraceById(traceId);
      
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
   * 查询追踪列表
   * GET /api/v1/traces
   */
  async queryTraces(req: HttpRequest): Promise<HttpResponse> {
    try {
      const filter: TraceFilter = {
        context_id: req.query.contextId,
        plan_id: req.query.planId,
        trace_type: req.query.traceType,
        severity: req.query.severity,
        event_type: req.query.event_type,
        event_category: req.query.event_category,
        source_component: req.query.source_component,
        timestamp_after: req.query.timestamp_after,
        timestamp_before: req.query.timestamp_before,
        has_errors: req.query.has_errors === 'true',
        has_performance_metrics: req.query.has_performance_metrics === 'true',
        correlation_trace_id: req.query.correlation_trace_id
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sort_by: req.query.sort_by,
        sort_order: req.query.sort_order as 'asc' | 'desc'
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
          items: result.data?.items.map(trace => trace.toProtocol())
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
      const contextId = req.query.contextId;
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      
      const result = await this.traceManagementService.getErrorTraces(contextId, limit);
      
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
   * 获取性能追踪
   * GET /api/v1/traces/performance
   */
  async getPerformanceTraces(req: HttpRequest): Promise<HttpResponse> {
    try {
      const contextId = req.query.contextId;
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      
      const result = await this.traceManagementService.getPerformanceTraces(contextId, limit);
      
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
   * 添加关联
   * POST /api/v1/traces/:id/correlations
   */
  async addCorrelation(req: HttpRequest): Promise<HttpResponse> {
    try {
      const traceId = req.params.id;
      const correlation: Correlation = req.body;
      
      const result = await this.traceManagementService.addCorrelation(traceId, correlation);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol(),
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
      const traceId = req.params.id;
      const metrics: PerformanceMetrics = req.body;
      
      const result = await this.traceManagementService.updatePerformanceMetrics(traceId, metrics);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol(),
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
      const traceId = req.params.id;
      const errorInfo: ErrorInformation = req.body;
      
      const result = await this.traceManagementService.setErrorInformation(traceId, errorInfo);
      
      if (!result.success) {
        return {
          status: 400,
          error: result.error
        };
      }

      return {
        status: 200,
        data: result.data?.toProtocol(),
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
      const contextId = req.query.contextId;
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
      const contextId = req.query.contextId;
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
      const traceId = req.params.id;
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
      const contextId = req.query.contextId;
      const timeRange = req.query.start && req.query.end ? {
        start: req.query.start,
        end: req.query.end
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
      const query = req.query.q;
      if (!query) {
        return {
          status: 400,
          error: '搜索查询不能为空'
        };
      }

      const filter: TraceFilter = {
        context_id: req.query.contextId,
        trace_type: req.query.traceType,
        severity: req.query.severity
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
      const traceId = req.params.id;
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
      const olderThanDays = parseInt(req.body.older_than_days) || 30;
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
