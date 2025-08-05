/**
 * Trace管理服务
 * 
 * 应用层服务，协调领域对象和基础设施层
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID } from '../../../shared/types';
import { Trace } from '../../domain/entities/trace.entity';
import { ITraceRepository, TraceFilter, PaginationOptions, PaginatedResult, TraceStatistics } from '../../domain/repositories/trace-repository.interface';
import { TraceFactory, CreateTraceRequest } from '../../domain/factories/trace.factory';
import { TraceAnalysisService, AnalysisResult, PerformanceAnalysis } from '../../domain/services/trace-analysis.service';
import { 
  TraceType, 
  TraceSeverity,
  Correlation,
  PerformanceMetrics,
  ErrorInformation 
} from '../../shared/types';

/**
 * 操作结果
 */
export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

/**
 * Trace管理服务
 */
export class TraceManagementService {
  constructor(
    private readonly traceRepository: ITraceRepository,
    private readonly traceFactory: TraceFactory,
    private readonly analysisService: TraceAnalysisService
  ) {}

  /**
   * 创建追踪
   */
  async createTrace(request: CreateTraceRequest): Promise<OperationResult<Trace>> {
    try {
      // 验证请求
      const validation = TraceFactory.validateCreateRequest(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join('; ')
        };
      }

      // 创建追踪实体
      const trace = TraceFactory.create(request);

      // 保存到仓库
      await this.traceRepository.save(trace);

      return {
        success: true,
        data: trace
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建追踪失败'
      };
    }
  }

  /**
   * 获取追踪详情
   */
  async getTraceById(traceId: UUID): Promise<OperationResult<Trace>> {
    try {
      const trace = await this.traceRepository.findById(traceId);
      
      if (!trace) {
        return {
          success: false,
          error: '追踪不存在'
        };
      }

      return {
        success: true,
        data: trace
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取追踪失败'
      };
    }
  }

  /**
   * 查询追踪列表
   */
  async queryTraces(
    filter: TraceFilter,
    pagination?: PaginationOptions
  ): Promise<OperationResult<PaginatedResult<Trace>>> {
    try {
      const result = await this.traceRepository.findByFilter(filter, pagination);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '查询追踪列表失败'
      };
    }
  }

  /**
   * 获取错误追踪
   */
  async getErrorTraces(contextId?: UUID, limit?: number): Promise<OperationResult<Trace[]>> {
    try {
      const traces = await this.traceRepository.findErrors(contextId, limit);
      
      return {
        success: true,
        data: traces
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取错误追踪失败'
      };
    }
  }

  /**
   * 获取性能追踪
   */
  async getPerformanceTraces(contextId?: UUID, limit?: number): Promise<OperationResult<Trace[]>> {
    try {
      const traces = await this.traceRepository.findPerformanceTraces(contextId, limit);
      
      return {
        success: true,
        data: traces
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取性能追踪失败'
      };
    }
  }

  /**
   * 添加关联
   */
  async addCorrelation(traceId: UUID, correlation: Correlation): Promise<OperationResult<Trace>> {
    try {
      const trace = await this.traceRepository.findById(traceId);
      
      if (!trace) {
        return {
          success: false,
          error: '追踪不存在'
        };
      }

      trace.addCorrelation(correlation);
      await this.traceRepository.update(trace);

      return {
        success: true,
        data: trace
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '添加关联失败'
      };
    }
  }

  /**
   * 更新性能指标
   */
  async updatePerformanceMetrics(
    traceId: UUID, 
    metrics: PerformanceMetrics
  ): Promise<OperationResult<Trace>> {
    try {
      const trace = await this.traceRepository.findById(traceId);
      
      if (!trace) {
        return {
          success: false,
          error: '追踪不存在'
        };
      }

      trace.updatePerformanceMetrics(metrics);
      await this.traceRepository.update(trace);

      return {
        success: true,
        data: trace
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新性能指标失败'
      };
    }
  }

  /**
   * 设置错误信息
   */
  async setErrorInformation(
    traceId: UUID, 
    errorInfo: ErrorInformation
  ): Promise<OperationResult<Trace>> {
    try {
      const trace = await this.traceRepository.findById(traceId);
      
      if (!trace) {
        return {
          success: false,
          error: '追踪不存在'
        };
      }

      trace.setErrorInformation(errorInfo);
      await this.traceRepository.update(trace);

      return {
        success: true,
        data: trace
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '设置错误信息失败'
      };
    }
  }

  /**
   * 分析追踪
   */
  async analyzeTraces(contextId?: UUID): Promise<OperationResult<AnalysisResult>> {
    try {
      let traces: Trace[];
      
      if (contextId) {
        traces = await this.traceRepository.findByContextId(contextId);
      } else {
        const result = await this.traceRepository.findByFilter({}, { page: 1, limit: 1000 });
        traces = result.items;
      }

      const analysis = this.analysisService.analyzeTraces(traces);
      
      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '分析追踪失败'
      };
    }
  }

  /**
   * 性能分析
   */
  async analyzePerformance(contextId?: UUID): Promise<OperationResult<PerformanceAnalysis>> {
    try {
      let traces: Trace[];
      
      if (contextId) {
        traces = await this.traceRepository.findByContextId(contextId);
      } else {
        traces = await this.traceRepository.findPerformanceTraces();
      }

      const analysis = this.analysisService.analyzePerformance(traces);
      
      return {
        success: true,
        data: analysis
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '性能分析失败'
      };
    }
  }

  /**
   * 获取追踪链
   */
  async getTraceChain(traceId: UUID): Promise<OperationResult<Trace[]>> {
    try {
      const traceChain = await this.traceRepository.getTraceChain(traceId);
      
      return {
        success: true,
        data: traceChain
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取追踪链失败'
      };
    }
  }

  /**
   * 获取统计信息
   */
  async getStatistics(
    contextId?: UUID, 
    timeRange?: { start: string; end: string }
  ): Promise<OperationResult<TraceStatistics>> {
    try {
      const statistics = await this.traceRepository.getStatistics(contextId, timeRange);
      
      return {
        success: true,
        data: statistics
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取统计信息失败'
      };
    }
  }

  /**
   * 搜索追踪
   */
  async searchTraces(query: string, filter?: TraceFilter): Promise<OperationResult<Trace[]>> {
    try {
      const traces = await this.traceRepository.search(query, filter);
      
      return {
        success: true,
        data: traces
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '搜索追踪失败'
      };
    }
  }

  /**
   * 清理过期追踪
   */
  async cleanupExpiredTraces(olderThanDays: number): Promise<OperationResult<number>> {
    try {
      const deletedCount = await this.traceRepository.cleanupExpiredTraces(olderThanDays);
      
      return {
        success: true,
        data: deletedCount
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '清理过期追踪失败'
      };
    }
  }

  /**
   * 删除追踪
   */
  async deleteTrace(traceId: UUID): Promise<OperationResult<void>> {
    try {
      await this.traceRepository.delete(traceId);
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除追踪失败'
      };
    }
  }

  /**
   * 批量删除追踪
   */
  async batchDeleteTraces(traceIds: UUID[]): Promise<OperationResult<void>> {
    try {
      await this.traceRepository.batchDelete(traceIds);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '批量删除追踪失败'
      };
    }
  }

  /**
   * 自动检测关联
   */
  async detectAndAddCorrelations(traceId: UUID): Promise<OperationResult<Correlation[]>> {
    try {
      const trace = await this.traceRepository.findById(traceId);
      if (!trace) {
        return {
          success: false,
          error: '追踪不存在'
        };
      }

      // 获取相关的追踪记录
      const relatedTraces = await this.traceRepository.findByContextId(trace.context_id);

      // 检测关联
      const correlations = this.analysisService.detectCorrelations(trace, relatedTraces);

      // 添加检测到的关联
      for (const correlation of correlations) {
        trace.addCorrelation(correlation);
      }

      if (correlations.length > 0) {
        await this.traceRepository.update(trace);
      }

      return {
        success: true,
        data: correlations
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '自动检测关联失败'
      };
    }
  }
}
