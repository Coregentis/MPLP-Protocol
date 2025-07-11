/**
 * MPLP Trace Manager - 追踪管理器
 * 
 * @version v1.0.1
 * @created 2025-07-10T14:30:00+08:00
 * @compliance trace-protocol.json Schema v1.0.1
 * @description 标准协议的追踪管理系统，遵循Plan → Confirm → Trace → Delivery流程
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utils/logger';
import { Performance } from '../../utils/performance';
import { 
  TraceProtocol,
  TraceEvent, 
  TraceType, 
  TraceSeverity,
  EventType,
  EventCategory,
  TraceOperationResult,
  PerformanceMetrics,
  ErrorInformation,
  TraceFilter,
  TRACE_CONSTANTS,
  ITraceRepository,
  ITraceValidator,
  ValidationResult,
  CreateTraceRequest,
  UpdateTraceRequest,
  TraceErrorCode,
  ExecutionTime,
  ResourceUsage,
  PROTOCOL_VERSION,
  DecisionLog
} from './types';

/**
 * 追踪管理器配置接口
 */
export interface TraceManagerConfig {
  enabled: boolean;
  batchSize: number;
  flushInterval: number;
  maxHistorySize: number;
  performanceThresholds: {
    warning: number;
    critical: number;
  };
  samplingRate: number;
}

/**
 * 默认追踪管理器配置
 */
export const DEFAULT_TRACE_MANAGER_CONFIG: TraceManagerConfig = {
  enabled: true,
  batchSize: 100,
  flushInterval: 1000,
  maxHistorySize: 10000,
  performanceThresholds: {
    warning: 100,
    critical: 500
  },
  samplingRate: 1.0
};

/**
 * 追踪管理器
 * 
 * 核心功能：
 * - 实时性能追踪
 * - 异常检测
 * - 批量处理
 * - 追踪关联分析
 * - 支持Plan → Confirm → Trace → Delivery流程
 */
export class TraceManager extends EventEmitter {
  private activeTraces: Map<string, TraceProtocol> = new Map();
  private traceHistory: TraceProtocol[] = [];
  private batchBuffer: CreateTraceRequest[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private config: TraceManagerConfig;
  private performance: Performance;
  private repository: ITraceRepository;
  private validator: ITraceValidator;

  constructor(
    repository: ITraceRepository,
    validator: ITraceValidator,
    config: Partial<TraceManagerConfig> = {}
  ) {
    super();
    this.repository = repository;
    this.validator = validator;
    this.config = { ...DEFAULT_TRACE_MANAGER_CONFIG, ...config };
    this.performance = new Performance();
    
    this.startBatchProcessor();
    
    logger.info('Trace Manager初始化完成', {
      batch_size: this.config.batchSize,
      flush_interval: this.config.flushInterval,
      tracing_enabled: this.config.enabled
    });
  }

  /**
   * 创建新的追踪
   * 
   * @param request 创建追踪请求
   * @returns 追踪操作结果，包含创建的追踪协议对象
   */
  async createTrace(request: CreateTraceRequest): Promise<TraceOperationResult<TraceProtocol>> {
    const startTime = this.performance.now();

    try {
      // 1. 检查追踪是否启用
      if (!this.config.enabled) {
        return {
          success: false,
          error: {
            code: TraceErrorCode.INTERNAL_ERROR,
            message: '追踪功能已禁用'
          }
        };
      }

      // 2. 采样控制
      if (Math.random() > this.config.samplingRate) {
        return {
          success: true,
          data: undefined,
          execution_time_ms: 0
        };
      }

      // 3. 验证请求数据
      const validationResult = this.validator.validateTrace(request as Partial<TraceProtocol>);
      if (!validationResult.isValid) {
      return {
        success: false,
          error: {
            code: TraceErrorCode.INVALID_TRACE_DATA,
            message: '追踪数据验证失败',
            details: validationResult.errors
          },
          execution_time_ms: this.performance.since(startTime)
        };
      }

      // 4. 创建追踪协议对象
      const traceId = uuidv4();
      const now = new Date().toISOString();
      
      const trace: TraceProtocol = {
        protocol_version: PROTOCOL_VERSION,
        timestamp: now,
        trace_id: traceId,
        context_id: request.context_id,
        plan_id: request.plan_id,
        task_id: request.task_id,
        trace_type: request.trace_type,
        severity: request.severity,
        event: request.event,
        performance_metrics: this.createPerformanceMetrics(request.performance_metrics),
        context_snapshot: request.context_snapshot,
        error_information: request.error_information as ErrorInformation,
        decision_log: request.decision_log as DecisionLog,
        correlations: []
      };

      // 5. 批处理或直接保存
      if (this.shouldBatchProcess(trace)) {
        this.addToBatch(request);

        // 记录到活动追踪
        this.activeTraces.set(traceId, trace);
        
        return {
          success: true,
          data: trace,
          execution_time_ms: this.performance.since(startTime)
        };
      } else {
        // 直接保存
        const result = await this.repository.save(trace);
        
        if (result.success) {
          // 记录到活动追踪和历史
          this.activeTraces.set(traceId, trace);
          this.addToHistory(trace);
          
          // 发出事件
          this.emit('trace:created', trace);
        }
        
        return {
          ...result,
          execution_time_ms: this.performance.since(startTime)
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logger.error('创建追踪失败', { error: errorMessage });
      
      return {
        success: false,
        error: {
          code: TraceErrorCode.INTERNAL_ERROR,
          message: `创建追踪失败: ${errorMessage}`
        },
        execution_time_ms: this.performance.since(startTime)
      };
    }
  }

  /**
   * 获取追踪
   * 
   * @param traceId 追踪ID
   * @returns 追踪操作结果，包含追踪协议对象
   */
  async getTrace(traceId: string): Promise<TraceOperationResult<TraceProtocol>> {
    const startTime = this.performance.now();

    try {
      // 1. 检查活动追踪
    const activeTrace = this.activeTraces.get(traceId);
    if (activeTrace) {
        return {
          success: true,
          data: activeTrace,
          execution_time_ms: this.performance.since(startTime)
        };
    }

      // 2. 从仓库获取
      const result = await this.repository.findById(traceId);
      return {
        ...result,
        execution_time_ms: this.performance.since(startTime)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error('获取追踪失败', { trace_id: traceId, error: errorMessage });

      return {
        success: false,
        error: {
          code: TraceErrorCode.INTERNAL_ERROR,
          message: `获取追踪失败: ${errorMessage}`
        },
        execution_time_ms: this.performance.since(startTime)
      };
    }
  }

  /**
   * 更新追踪
   * 
   * @param traceId 追踪ID
   * @param updates 更新内容
   * @returns 追踪操作结果，包含更新后的追踪协议对象
   */
  async updateTrace(traceId: string, updates: UpdateTraceRequest): Promise<TraceOperationResult<TraceProtocol>> {
    const startTime = this.performance.now();

    try {
      // 1. 验证更新数据
      const validationResult = this.validator.validateTrace(updates as Partial<TraceProtocol>);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            code: TraceErrorCode.INVALID_TRACE_DATA,
            message: '追踪数据验证失败',
            details: validationResult.errors
          },
          execution_time_ms: this.performance.since(startTime)
        };
      }

      // 2. 检查追踪是否存在
      const existingTrace = this.activeTraces.get(traceId);
      if (!existingTrace) {
        // 从仓库查找
        const findResult = await this.repository.findById(traceId);
        if (!findResult.success || !findResult.data) {
          return {
            success: false,
            error: {
              code: TraceErrorCode.TRACE_NOT_FOUND,
              message: `追踪不存在: ${traceId}`
            },
            execution_time_ms: this.performance.since(startTime)
          };
        }
      }

      // 3. 更新追踪
      const result = await this.repository.update(traceId, updates);
    
      if (result.success && result.data) {
        // 更新活动追踪
        if (this.activeTraces.has(traceId)) {
          this.activeTraces.set(traceId, result.data);
    }

        // 更新历史记录
        this.updateHistory(traceId, result.data);
        
        // 发出事件
        this.emit('trace:updated', result.data);
      }
      
      return {
        ...result,
        execution_time_ms: this.performance.since(startTime)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logger.error('更新追踪失败', { trace_id: traceId, error: errorMessage });

    return {
        success: false,
        error: {
          code: TraceErrorCode.INTERNAL_ERROR,
          message: `更新追踪失败: ${errorMessage}`
        },
        execution_time_ms: this.performance.since(startTime)
      };
    }
  }

  /**
   * 添加追踪事件
   * 
   * @param traceId 追踪ID
   * @param event 事件
   * @returns 追踪操作结果
   */
  async addTraceEvent(traceId: string, event: TraceEvent): Promise<TraceOperationResult<void>> {
    const startTime = this.performance.now();

    try {
      // 1. 验证事件数据
      const validationResult = this.validator.validateEvent(event);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: {
            code: TraceErrorCode.INVALID_EVENT_DATA,
            message: '事件数据验证失败',
            details: validationResult.errors
          },
          execution_time_ms: this.performance.since(startTime)
    };
  }

      // 2. 获取追踪
      const getResult = await this.getTrace(traceId);
      if (!getResult.success || !getResult.data) {
        return {
          success: false,
          error: {
            code: TraceErrorCode.TRACE_NOT_FOUND,
            message: `追踪不存在: ${traceId}`
          },
          execution_time_ms: this.performance.since(startTime)
        };
  }

      // 3. 创建更新请求
      const trace = getResult.data;
      const updates: UpdateTraceRequest = {
        trace_id: traceId,
        event: event
      };

      // 4. 更新追踪
      const updateResult = await this.updateTrace(traceId, updates);
      if (!updateResult.success) {
        return {
          success: false,
          error: updateResult.error,
          execution_time_ms: this.performance.since(startTime)
        };
      }

      return {
        success: true,
        execution_time_ms: this.performance.since(startTime)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logger.error('添加追踪事件失败', { trace_id: traceId, error: errorMessage });
      
      return {
        success: false,
        error: {
          code: TraceErrorCode.INTERNAL_ERROR,
          message: `添加追踪事件失败: ${errorMessage}`
        },
        execution_time_ms: this.performance.since(startTime)
      };
    }
  }

  /**
   * 查询追踪
   * 
   * @param filter 过滤条件
   * @returns 追踪操作结果，包含符合条件的追踪协议对象列表
   */
  async queryTraces(filter: TraceFilter): Promise<TraceOperationResult<TraceProtocol[]>> {
    const startTime = this.performance.now();

    try {
      const result = await this.repository.findByFilter(filter);
      return {
        ...result,
        execution_time_ms: this.performance.since(startTime)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logger.error('查询追踪失败', { filter, error: errorMessage });
      
      return {
        success: false,
        error: {
          code: TraceErrorCode.INTERNAL_ERROR,
          message: `查询追踪失败: ${errorMessage}`
        },
        execution_time_ms: this.performance.since(startTime)
      };
    }
  }

  /**
   * 获取上下文相关追踪
   * 
   * @param contextId 上下文ID
   * @returns 追踪操作结果，包含相关追踪协议对象列表
   */
  async getTracesByContext(contextId: string): Promise<TraceOperationResult<TraceProtocol[]>> {
    return this.queryTraces({ context_ids: [contextId] });
  }

  /**
   * 获取计划相关追踪
   * 
   * @param planId 计划ID
   * @returns 追踪操作结果，包含相关追踪协议对象列表
   */
  async getTracesByPlan(planId: string): Promise<TraceOperationResult<TraceProtocol[]>> {
    return this.queryTraces({ plan_ids: [planId] });
  }

  /**
   * 获取任务相关追踪
   * 
   * @param taskId 任务ID
   * @returns 追踪操作结果，包含相关追踪协议对象列表
   */
  async getTracesByTask(taskId: string): Promise<TraceOperationResult<TraceProtocol[]>> {
    return this.queryTraces({ task_ids: [taskId] });
  }

  /**
   * 创建性能指标
   * 
   * @param metrics 性能指标
   * @returns 完整的性能指标
   */
  private createPerformanceMetrics(metrics?: Partial<PerformanceMetrics>): PerformanceMetrics {
    const now = new Date().toISOString();
    
    // 默认执行时间
    const executionTime: ExecutionTime = {
      start_time: now,
      duration_ms: 0
    };
    
    // 默认资源使用
    const resourceUsage: ResourceUsage = {
      memory: {
        peak_usage_mb: 0,
        average_usage_mb: 0
      },
      cpu: {
        utilization_percent: 0
      }
    };
    
    // 合并默认值和提供的指标
    return {
      execution_time: {
        ...executionTime,
        ...metrics?.execution_time
      },
      resource_usage: {
        ...resourceUsage,
        ...metrics?.resource_usage
      },
      custom_metrics: metrics?.custom_metrics || {}
    };
  }

  /**
   * 判断是否应该批处理
   * 
   * @param trace 追踪协议对象
   * @returns 是否应该批处理
   */
  private shouldBatchProcess(trace: TraceProtocol): boolean {
    // 如果是错误或关键级别的追踪，不进行批处理
    if (trace.severity === 'error' || trace.severity === 'critical') {
      return false;
  }

    // 如果包含错误信息，不进行批处理
    if (trace.error_information) {
      return false;
    }
    
    // 如果批处理已禁用，不进行批处理
    if (this.config.batchSize <= 1) {
      return false;
    }
    
    return true;
  }

  /**
   * 添加到批处理缓冲区
   * 
   * @param request 创建追踪请求
   */
  private addToBatch(request: CreateTraceRequest): void {
    this.batchBuffer.push(request);
    
    // 如果达到批处理大小，立即刷新
    if (this.batchBuffer.length >= this.config.batchSize) {
      this.flushBatch();
    }
  }

  /**
   * 添加到历史记录
   * 
   * @param trace 追踪协议对象
   */
  private addToHistory(trace: TraceProtocol): void {
    this.traceHistory.push(trace);
    
    // 如果超出最大历史记录大小，删除最旧的记录
    if (this.traceHistory.length > this.config.maxHistorySize) {
      this.traceHistory.shift();
    }
  }

  /**
   * 更新历史记录
   * 
   * @param traceId 追踪ID
   * @param trace 追踪协议对象
   */
  private updateHistory(traceId: string, trace: TraceProtocol): void {
    const index = this.traceHistory.findIndex(t => t.trace_id === traceId);
    if (index !== -1) {
      this.traceHistory[index] = trace;
    }
  }

  /**
   * 启动批处理器
   */
  private startBatchProcessor(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      if (this.batchBuffer.length > 0) {
        this.flushBatch();
      }
    }, this.config.flushInterval);
  }

  /**
   * 刷新批处理缓冲区
   */
  private async flushBatch(): Promise<void> {
    if (this.batchBuffer.length === 0) {
      return;
    }
    
    const startTime = this.performance.now();
    const batchSize = this.batchBuffer.length;
    
    try {
      // 1. 复制并清空缓冲区
      const requests = [...this.batchBuffer];
      this.batchBuffer = [];
      
      // 2. 创建追踪协议对象
      const traces: TraceProtocol[] = requests.map(request => {
        const traceId = uuidv4();
        const now = new Date().toISOString();
        
        return {
          protocol_version: PROTOCOL_VERSION,
          timestamp: now,
          trace_id: traceId,
          context_id: request.context_id,
          plan_id: request.plan_id,
          task_id: request.task_id,
          trace_type: request.trace_type,
          severity: request.severity,
          event: request.event,
          performance_metrics: this.createPerformanceMetrics(request.performance_metrics),
          context_snapshot: request.context_snapshot,
          error_information: request.error_information as ErrorInformation,
          decision_log: request.decision_log as DecisionLog,
          correlations: []
        };
      });
      
      // 3. 批量保存
      const result = await this.repository.saveMany(traces);
      
      if (result.success && result.data) {
        // 4. 更新活动追踪和历史记录
        for (const trace of result.data) {
          this.activeTraces.set(trace.trace_id, trace);
          this.addToHistory(trace);
          
          // 发出事件
          this.emit('trace:created', trace);
        }
        
        logger.debug('批量保存追踪成功', {
          batch_size: batchSize,
          duration_ms: this.performance.since(startTime)
        });
      } else {
        logger.error('批量保存追踪失败', {
          batch_size: batchSize,
          error: result.error
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logger.error('批量处理失败', {
        batch_size: batchSize,
        error: errorMessage
      });
    }
  }

  /**
   * 获取追踪统计信息
   * 
   * @returns 统计信息
   */
  getTraceStats(): Record<string, unknown> {
    return {
      active_traces: this.activeTraces.size,
      history_size: this.traceHistory.length,
      batch_buffer_size: this.batchBuffer.length,
      by_severity: this.countBySeverity(),
      by_type: this.countByType(),
      config: {
        batch_size: this.config.batchSize,
        flush_interval: this.config.flushInterval,
        max_history_size: this.config.maxHistorySize,
        sampling_rate: this.config.samplingRate
      }
    };
  }

  /**
   * 按严重程度统计
   * 
   * @returns 按严重程度统计的结果
   */
  private countBySeverity(): Record<TraceSeverity, number> {
    const result: Record<TraceSeverity, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      critical: 0
    };
    
    for (const trace of this.traceHistory) {
      result[trace.severity]++;
    }
    
    return result;
  }

  /**
   * 按类型统计
   * 
   * @returns 按类型统计的结果
   */
  private countByType(): Record<TraceType, number> {
    const result: Record<string, number> = {};
    
    for (const trace of this.traceHistory) {
      if (!result[trace.trace_type]) {
        result[trace.trace_type] = 0;
      }
      result[trace.trace_type]++;
      }
    
    return result as Record<TraceType, number>;
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // 刷新剩余的批处理缓冲区
    if (this.batchBuffer.length > 0) {
      this.flushBatch();
    }
    
    this.activeTraces.clear();
    this.traceHistory = [];
    this.batchBuffer = [];
    
    this.removeAllListeners();
  }
}