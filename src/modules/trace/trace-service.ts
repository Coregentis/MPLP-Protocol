/**
 * MPLP Trace服务
 * 完全符合trace-protocol.json Schema规范
 * 
 * @version 1.0.1
 * @created 2025-07-10T14:30:00+08:00
 * @compliance trace-protocol.json Schema v1.0.1
 * @architecture Interface-based service design
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

import {
  TraceProtocol,
  CreateTraceRequest,
  UpdateTraceRequest,
  TraceFilter,
  TraceOperationResult,
  TraceType,
  TraceSeverity,
  EventType,
  EventCategory,
  TraceEvent,
  PerformanceMetrics,
  ContextSnapshot,
  ErrorInformation,
  DecisionLog,
  TraceCorrelation,
  UUID,
  Timestamp,
  Version,
  TraceErrorCode,
  TRACE_CONSTANTS,
  PROTOCOL_VERSION,
  ITraceRepository,
  ITraceValidator,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from './types';

// ================== 服务元数据 ==================

/**
 * Trace服务元数据
 */
export interface TraceServiceMetadata {
  version: string;
  supportedProtocolVersions: string[];
  implementationName: string;
  features: string[];
}

// ================== Main Service Class ==================

/**
 * Trace服务主类
 * 提供完整的追踪管理功能，符合MPLP协议规范
 */
export class TraceService extends EventEmitter {
  private readonly repository: ITraceRepository;
  private readonly validator: ITraceValidator;

  constructor(
    repository: ITraceRepository,
    validator: ITraceValidator
  ) {
    super();
    this.repository = repository;
    this.validator = validator;
  }

  // ================== 核心CRUD操作 ==================

  /**
   * 创建新的追踪记录
   */
  async createTrace(data: CreateTraceRequest): Promise<TraceOperationResult<TraceProtocol>> {
    const startTime = Date.now();

    try {
      // 1. 验证输入数据
      const validation = this.validator.validateTrace(data as Partial<TraceProtocol>);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: TraceErrorCode.INVALID_TRACE_DATA,
            message: '追踪数据验证失败',
            details: validation.errors
          },
          execution_time_ms: Date.now() - startTime
        };
      }

      // 2. 构建追踪协议对象
      const trace: TraceProtocol = {
        protocol_version: PROTOCOL_VERSION,
        timestamp: new Date().toISOString(),
        trace_id: uuidv4(),
        context_id: data.context_id,
        plan_id: data.plan_id,
        task_id: data.task_id,
        trace_type: data.trace_type,
        severity: data.severity,
        event: data.event,
        performance_metrics: data.performance_metrics,
        context_snapshot: data.context_snapshot,
        error_information: data.error_information as ErrorInformation | undefined,
        decision_log: data.decision_log as DecisionLog | undefined,
        correlations: []
      };

      // 3. 验证完整协议对象
      const protocolValidation = this.validator.validateTrace(trace);
      if (!protocolValidation.isValid) {
        return {
          success: false,
          error: {
            code: TraceErrorCode.INVALID_TRACE_DATA,
            message: '追踪协议验证失败',
            details: protocolValidation.errors
          },
          execution_time_ms: Date.now() - startTime
        };
      }

      // 4. 保存到数据库
      const result = await this.repository.save(trace);
      
      if (result.success && result.data) {
        // 5. 发出事件
        this.emit('trace:created', result.data);
      }

      return {
        ...result,
        execution_time_ms: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        error: {
          code: TraceErrorCode.INTERNAL_ERROR,
          message: `创建追踪失败: ${errorMessage}`
        },
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * 获取追踪记录
   */
  async getTrace(traceId: UUID): Promise<TraceOperationResult<TraceProtocol>> {
    const startTime = Date.now();

    try {
      const result = await this.repository.findById(traceId);

      return {
        ...result,
        execution_time_ms: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        error: {
          code: TraceErrorCode.INTERNAL_ERROR,
          message: `获取追踪失败: ${errorMessage}`
        },
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * 更新追踪记录
   */
  async updateTrace(traceId: UUID, data: UpdateTraceRequest): Promise<TraceOperationResult<TraceProtocol>> {
    const startTime = Date.now();

    try {
      // 1. 验证输入数据
      const validation = this.validator.validateTrace(data as Partial<TraceProtocol>);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: TraceErrorCode.INVALID_TRACE_DATA,
            message: '追踪数据验证失败',
            details: validation.errors
          },
          execution_time_ms: Date.now() - startTime
        };
      }

      // 2. 检查追踪是否存在
      const existingTrace = await this.repository.findById(traceId);
      if (!existingTrace.success || !existingTrace.data) {
        return {
          success: false,
          error: {
            code: TraceErrorCode.TRACE_NOT_FOUND,
            message: `追踪不存在: ${traceId}`
          },
          execution_time_ms: Date.now() - startTime
        };
      }

      // 3. 更新追踪
      const updates = {
        ...data,
        timestamp: new Date().toISOString()
      };

      const result = await this.repository.update(traceId, updates);
      
      if (result.success && result.data) {
        // 4. 发出事件
        this.emit('trace:updated', result.data);
      }

      return {
        ...result,
        execution_time_ms: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        error: {
          code: TraceErrorCode.INTERNAL_ERROR,
          message: `更新追踪失败: ${errorMessage}`
        },
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * 删除追踪记录
   */
  async deleteTrace(traceId: UUID): Promise<TraceOperationResult<boolean>> {
    const startTime = Date.now();

    try {
      // 1. 检查追踪是否存在
      const existingTrace = await this.repository.findById(traceId);
      if (!existingTrace.success || !existingTrace.data) {
        return {
          success: false,
          error: {
            code: TraceErrorCode.TRACE_NOT_FOUND,
            message: `追踪不存在: ${traceId}`
          },
          execution_time_ms: Date.now() - startTime
        };
      }

      // 2. 删除追踪
      const result = await this.repository.delete(traceId);
      
      if (result.success) {
        // 3. 发出事件
        this.emit('trace:deleted', traceId);
      }

      return {
        ...result,
        execution_time_ms: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        error: {
          code: TraceErrorCode.INTERNAL_ERROR,
          message: `删除追踪失败: ${errorMessage}`
        },
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * 查询追踪记录
   */
  async queryTraces(filter: TraceFilter): Promise<TraceOperationResult<TraceProtocol[]>> {
    const startTime = Date.now();

    try {
      const result = await this.repository.findByFilter(filter);

      return {
        ...result,
        execution_time_ms: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        error: {
          code: TraceErrorCode.INTERNAL_ERROR,
          message: `查询追踪失败: ${errorMessage}`
        },
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * 获取上下文相关追踪
   */
  async getTracesByContext(contextId: UUID): Promise<TraceOperationResult<TraceProtocol[]>> {
    return this.queryTraces({ context_ids: [contextId] });
  }

  /**
   * 获取计划相关追踪
   */
  async getTracesByPlan(planId: UUID): Promise<TraceOperationResult<TraceProtocol[]>> {
    return this.queryTraces({ plan_ids: [planId] });
  }

  /**
   * 获取任务相关追踪
   */
  async getTracesByTask(taskId: UUID): Promise<TraceOperationResult<TraceProtocol[]>> {
    return this.queryTraces({ task_ids: [taskId] });
  }

  /**
   * 创建多个追踪记录
   */
  async createManyTraces(requests: CreateTraceRequest[]): Promise<TraceOperationResult<TraceProtocol[]>> {
    const startTime = Date.now();

    try {
      // 1. 验证所有请求数据
      const validationResults = await Promise.all(
        requests.map(request => this.validator.validateTrace(request as Partial<TraceProtocol>))
      );
      
      const invalidResults = validationResults.filter(result => !result.isValid);
      if (invalidResults.length > 0) {
        return {
          success: false,
          error: {
            code: TraceErrorCode.INVALID_TRACE_DATA,
            message: `${invalidResults.length}个追踪数据验证失败`,
            details: invalidResults.flatMap(result => result.errors)
          },
          execution_time_ms: Date.now() - startTime
        };
      }

      // 2. 构建追踪协议对象
      const traces: TraceProtocol[] = requests.map(request => {
        return {
          protocol_version: PROTOCOL_VERSION,
          timestamp: new Date().toISOString(),
          trace_id: uuidv4(),
          context_id: request.context_id,
          plan_id: request.plan_id,
          task_id: request.task_id,
          trace_type: request.trace_type,
          severity: request.severity,
          event: request.event,
          performance_metrics: request.performance_metrics,
          context_snapshot: request.context_snapshot,
          error_information: request.error_information as ErrorInformation | undefined,
          decision_log: request.decision_log as DecisionLog | undefined,
          correlations: []
        };
      });

      // 3. 批量保存
      const result = await this.repository.saveMany(traces);
      
      if (result.success && result.data) {
        // 4. 发出事件
        for (const trace of result.data) {
          this.emit('trace:created', trace);
        }
      }

      return {
        ...result,
        execution_time_ms: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        error: {
          code: TraceErrorCode.INTERNAL_ERROR,
          message: `批量创建追踪失败: ${errorMessage}`
        },
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * 获取追踪统计信息
   */
  async getTraceStats(filter?: TraceFilter): Promise<TraceOperationResult<Record<string, unknown>>> {
    const startTime = Date.now();

    try {
      // 1. 获取符合条件的追踪
      const tracesResult = await this.queryTraces(filter || {});
      if (!tracesResult.success) {
        return {
          success: false,
          error: tracesResult.error,
          execution_time_ms: Date.now() - startTime
        };
      }

      const traces = tracesResult.data || [];

      // 2. 计算统计信息
      const stats: Record<string, unknown> = {
        total_count: traces.length,
        by_severity: this.countBySeverity(traces),
        by_type: this.countByType(traces),
        performance: this.calculatePerformanceStats(traces)
      };

      return {
        success: true,
        data: stats,
        execution_time_ms: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        error: {
          code: TraceErrorCode.INTERNAL_ERROR,
          message: `获取追踪统计失败: ${errorMessage}`
        },
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * 按严重程度统计
   */
  private countBySeverity(traces: TraceProtocol[]): Record<TraceSeverity, number> {
    const result: Record<TraceSeverity, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      critical: 0
    };
    
    for (const trace of traces) {
      result[trace.severity]++;
    }
    
    return result;
  }

  /**
   * 按类型统计
   */
  private countByType(traces: TraceProtocol[]): Record<string, number> {
    const result: Record<string, number> = {};
    
    for (const trace of traces) {
      if (!result[trace.trace_type]) {
        result[trace.trace_type] = 0;
      }
      result[trace.trace_type]++;
    }
    
    return result;
  }

  /**
   * 计算性能统计
   */
  private calculatePerformanceStats(traces: TraceProtocol[]): Record<string, unknown> {
    // 提取所有性能指标
    const metrics = traces
      .filter(trace => trace.performance_metrics?.execution_time)
      .map(trace => trace.performance_metrics!.execution_time!);
    
    if (metrics.length === 0) {
      return {
        count: 0
      };
    }
    
    // 计算持续时间统计
    const durations = metrics.map(m => m.duration_ms);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const avgDuration = totalDuration / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);
    
    // 计算百分位数
    durations.sort((a, b) => a - b);
    const p50 = durations[Math.floor(durations.length * 0.5)];
    const p95 = durations[Math.floor(durations.length * 0.95)];
    const p99 = durations[Math.floor(durations.length * 0.99)];
    
    return {
      count: metrics.length,
      duration: {
        total_ms: totalDuration,
        avg_ms: avgDuration,
        max_ms: maxDuration,
        min_ms: minDuration,
        p50_ms: p50,
        p95_ms: p95,
        p99_ms: p99
      }
    };
  }

  /**
   * 获取追踪数量
   */
  async getTraceCount(filter?: TraceFilter): Promise<TraceOperationResult<number>> {
    const startTime = Date.now();

    try {
      const result = await this.repository.count(filter);

      return {
        ...result,
        execution_time_ms: Date.now() - startTime
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        error: {
          code: TraceErrorCode.INTERNAL_ERROR,
          message: `获取追踪数量失败: ${errorMessage}`
        },
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  /**
   * 获取服务元数据
   */
  getMetadata(): TraceServiceMetadata {
    return {
      version: '1.0.1',
      supportedProtocolVersions: [PROTOCOL_VERSION],
      implementationName: 'MPLP Trace Service',
      features: [
        'real-time-tracing',
        'performance-monitoring',
        'error-tracking',
        'correlation-analysis',
        'decision-logging',
        'batch-processing'
      ]
    };
  }
}

/**
 * 创建追踪服务
 */
export function createTraceService(
  repository: ITraceRepository,
  validator: ITraceValidator
): TraceService {
  return new TraceService(repository, validator);
} 