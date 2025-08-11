/**
 * Trace管理服务
 * 
 * 应用层服务，协调领域对象和基础设施层
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID, Timestamp } from '../../../../public/shared/types';
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
} from '../../types';

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
        error: `创建追踪失败: ${error instanceof Error ? error.message : '未知错误'}`
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
        error: `获取追踪失败: ${error instanceof Error ? error.message : '未知错误'}`
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
        error: `分析追踪失败: ${error instanceof Error ? error.message : '未知错误'}`
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
   * 记录事件
   */
  async recordEvent(request: {
    trace_id: UUID;
    event_type: string;
    level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
    timestamp: Date;
    data?: Record<string, any>;
  }): Promise<OperationResult<Record<string, unknown>>> {
    try {
      const trace = await this.traceRepository.findById(request.trace_id);

      if (!trace) {
        return {
          success: false,
          error: '追踪不存在'
        };
      }

      // 更新追踪的元数据以记录事件
      const existingEvents = Array.isArray(trace.metadata?.events) ? trace.metadata.events : [];
      const updatedMetadata = {
        ...trace.metadata,
        events: [
          ...existingEvents,
          {
            event_type: request.event_type,
            level: request.level,
            timestamp: request.timestamp.toISOString(),
            data: request.data
          }
        ]
      };

      // 更新追踪
      trace.updateMetadata(updatedMetadata);
      await this.traceRepository.save(trace);

      return {
        success: true,
        data: {
          event_id: `${request.trace_id}_${Date.now()}`,
          recorded_at: request.timestamp.toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '记录事件失败'
      };
    }
  }

  /**
   * 清理过期追踪（基础版本）
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
        error: `清理过期追踪失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }

  /**
   * 高级数据保留策略清理
   */
  async cleanupWithRetentionPolicy(policy: {
    defaultRetentionDays: number;
    errorTraceRetentionDays: number;
    performanceTraceRetentionDays: number;
    auditTraceRetentionDays: number;
    maxTraceCount?: number;
    preserveImportantTraces?: boolean;
  }): Promise<OperationResult<{
    deletedCount: number;
    preservedCount: number;
    details: Record<string, number>;
  }>> {
    try {
      let totalDeleted = 0;
      let totalPreserved = 0;
      const details: Record<string, number> = {};

      // 按类型清理不同保留期的追踪
      const traceTypes: Array<{ type: TraceType; retentionDays: number }> = [
        { type: 'error', retentionDays: policy.errorTraceRetentionDays },
        { type: 'performance', retentionDays: policy.performanceTraceRetentionDays },
        { type: 'audit', retentionDays: policy.auditTraceRetentionDays }
      ];

      for (const { type, retentionDays } of traceTypes) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const result = await this.traceRepository.findByFilter({
          trace_type: type,
          timestamp_before: cutoffDate.toISOString()
        });

        const tracesToDelete = result.items.filter(trace => {
          // 如果启用了重要追踪保护，检查是否为重要追踪
          if (policy.preserveImportantTraces) {
            return !this.isImportantTrace(trace);
          }
          return true;
        });

        const tracesToPreserve = result.items.length - tracesToDelete.length;

        // 执行删除
        if (tracesToDelete.length > 0) {
          await this.traceRepository.batchDelete(tracesToDelete.map(t => t.traceId));
        }

        totalDeleted += tracesToDelete.length;
        totalPreserved += tracesToPreserve;
        details[`${type}_deleted`] = tracesToDelete.length;
        details[`${type}_preserved`] = tracesToPreserve;
      }

      // 处理其他类型的追踪（使用默认保留期）
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - policy.defaultRetentionDays);

      const otherTracesResult = await this.traceRepository.findByFilter({
        timestamp_before: cutoffDate.toISOString()
      });

      const otherTraces = otherTracesResult.items.filter(trace =>
        !['error', 'performance', 'audit'].includes(trace.traceType)
      );

      const otherTracesToDelete = otherTraces.filter(trace => {
        if (policy.preserveImportantTraces) {
          return !this.isImportantTrace(trace);
        }
        return true;
      });

      if (otherTracesToDelete.length > 0) {
        await this.traceRepository.batchDelete(otherTracesToDelete.map(t => t.traceId));
      }

      totalDeleted += otherTracesToDelete.length;
      totalPreserved += (otherTraces.length - otherTracesToDelete.length);
      details['other_deleted'] = otherTracesToDelete.length;
      details['other_preserved'] = otherTraces.length - otherTracesToDelete.length;

      // 如果设置了最大追踪数量限制，进行额外清理
      if (policy.maxTraceCount) {
        const allTracesResult = await this.traceRepository.findByFilter({});
        if (allTracesResult.total > policy.maxTraceCount) {
          const excessCount = allTracesResult.total - policy.maxTraceCount;
          // 删除最旧的非重要追踪
          const oldestTraces = allTracesResult.items
            .filter(trace => !policy.preserveImportantTraces || !this.isImportantTrace(trace))
            .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
            .slice(0, excessCount);

          if (oldestTraces.length > 0) {
            await this.traceRepository.batchDelete(oldestTraces.map(t => t.traceId));
            totalDeleted += oldestTraces.length;
            details['excess_deleted'] = oldestTraces.length;
          }
        }
      }

      return {
        success: true,
        data: {
          deletedCount: totalDeleted,
          preservedCount: totalPreserved,
          details
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '高级清理策略执行失败'
      };
    }
  }

  /**
   * 判断是否为重要追踪
   */
  private isImportantTrace(trace: Trace): boolean {
    // 重要追踪的判断标准
    return (
      trace.severity === 'error' ||  // 错误追踪
      trace.traceType === 'audit' || // 审计追踪
      Boolean(trace.metadata?.important) || // 标记为重要的追踪
      (trace.correlations && trace.correlations.length > 0) || // 有关联的追踪
      (trace.performanceMetrics?.execution_time?.duration_ms !== undefined &&
       trace.performanceMetrics.execution_time.duration_ms > 10000) // 长时间执行的追踪
    );
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
      const relatedTraces = await this.traceRepository.findByContextId(trace.contextId);

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

  /**
   * 根据任务ID获取追踪列表
   */
  async getTracesByTaskId(taskId: UUID): Promise<OperationResult<Trace[]>> {
    try {
      const result = await this.traceRepository.findByFilter({
        task_id: taskId
      });

      return {
        success: true,
        data: result.items
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 获取任务级别的追踪统计
   */
  async getTaskTraceStatistics(taskId: UUID): Promise<OperationResult<{
    totalTraces: number;
    tracesByType: Record<TraceType, number>;
    tracesBySeverity: Record<TraceSeverity, number>;
    averageExecutionTime: number;
    errorRate: number;
    lastActivity: string;
  }>> {
    try {
      const result = await this.traceRepository.findByFilter({
        task_id: taskId
      });

      const traces = result.items;

      if (traces.length === 0) {
        return {
          success: true,
          data: {
            totalTraces: 0,
            tracesByType: {} as Record<TraceType, number>,
            tracesBySeverity: {} as Record<TraceSeverity, number>,
            averageExecutionTime: 0,
            errorRate: 0,
            lastActivity: new Date().toISOString()
          }
        };
      }

      // 统计分析
      const tracesByType: Record<string, number> = {};
      const tracesBySeverity: Record<string, number> = {};
      let totalExecutionTime = 0;
      let errorCount = 0;
      let lastActivity = traces[0].timestamp;

      traces.forEach(trace => {
        // 按类型统计
        tracesByType[trace.traceType] = (tracesByType[trace.traceType] || 0) + 1;

        // 按严重程度统计
        tracesBySeverity[trace.severity] = (tracesBySeverity[trace.severity] || 0) + 1;

        // 执行时间统计
        if (trace.performanceMetrics?.execution_time?.duration_ms) {
          totalExecutionTime += trace.performanceMetrics.execution_time.duration_ms;
        }

        // 错误统计
        if (trace.severity === 'error') {
          errorCount++;
        }

        // 最后活动时间
        if (trace.timestamp > lastActivity) {
          lastActivity = trace.timestamp;
        }
      });

      return {
        success: true,
        data: {
          totalTraces: traces.length,
          tracesByType: tracesByType as Record<TraceType, number>,
          tracesBySeverity: tracesBySeverity as Record<TraceSeverity, number>,
          averageExecutionTime: totalExecutionTime / traces.length,
          errorRate: errorCount / traces.length,
          lastActivity
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 获取追踪统计信息
   */
  async getTraceStatistics(contextId?: UUID, timeRange?: { start: string; end: string }): Promise<OperationResult<TraceStatistics>> {
    try {
      const statistics = await this.traceRepository.getStatistics(contextId, timeRange);

      return {
        success: true,
        data: statistics
      };
    } catch (error) {
      return {
        success: false,
        error: `获取统计信息失败: ${error instanceof Error ? error.message : '未知错误'}`
      };
    }
  }
}
