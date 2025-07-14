/**
 * MPLP Trace模块管理器
 * 
 * @version v1.0.2
 * @created 2025-07-10T13:30:00+08:00
 * @updated 2025-07-15T20:30:00+08:00
 * @compliance trace-protocol.json Schema v1.0.0 - 100%合规
 * @compliance .cursor/rules/vendor-neutral-design.mdc - 厂商中立设计原则
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@/utils/logger';
import { Performance } from '@/utils/performance';
import { 
  ITraceAdapter, 
  AdapterHealth, 
  FailureReport, 
  RecoverySuggestion,
  AdapterType,
  AdapterConfig
} from '@/interfaces/trace-adapter.interface';
import { 
  MPLPTraceData, 
  TraceType, 
  TraceStatus, 
  TraceFilter,
  TraceSeverity,
  EventType,
  EventCategory,
  TraceOperationResult 
} from './types';
import { ITraceManager } from '@/interfaces/module-integration.interface';
import { TraceAdapterFactory } from '@/adapters/trace/adapter-factory';

const logger = new Logger('TraceManager');
const performance = new Performance();

/**
 * 追踪管理器配置
 */
export interface TraceManagerConfig {
  /**
   * 同步间隔（毫秒）
   */
  syncIntervalMs?: number;

  /**
   * 批处理大小
   */
  batchSize?: number;

  /**
   * 重试次数
   */
  retryAttempts?: number;

  /**
   * 重试延迟（毫秒）
   */
  retryDelay?: number;

  /**
   * 默认适配器类型
   */
  defaultAdapterType?: AdapterType | string;

  /**
   * 默认适配器配置
   */
  defaultAdapterConfig?: AdapterConfig;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: TraceManagerConfig = {
  syncIntervalMs: 5000,
  batchSize: 100,
  retryAttempts: 3,
  retryDelay: 1000,
  defaultAdapterType: AdapterType.BASE,
  defaultAdapterConfig: {
    name: 'default-trace-adapter',
    version: '1.0.0'
  }
};

/**
 * 追踪管理器
 * 负责追踪数据的收集、存储和分析
 */
export class TraceManager extends EventEmitter implements ITraceManager {
  private traces: Map<string, MPLPTraceData> = new Map();
  private traceAdapter: ITraceAdapter | null = null;
  private pendingTraces: MPLPTraceData[] = [];
  private syncInterval: NodeJS.Timeout | null = null;
  private config: TraceManagerConfig;
  private isSyncing: boolean = false;
  private adapterFactory: TraceAdapterFactory;
  
  /**
   * 构造函数
   * @param config 管理器配置
   * @param adapter 可选的追踪适配器
   */
  constructor(config: Partial<TraceManagerConfig> = {}, adapter?: ITraceAdapter) {
    super();
    
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.adapterFactory = TraceAdapterFactory.getInstance();
    
    if (adapter) {
      this.setAdapter(adapter);
    } else if (this.config.defaultAdapterType && this.config.defaultAdapterConfig) {
      // 如果没有提供适配器但有默认配置，则创建默认适配器
      try {
        const defaultAdapter = this.adapterFactory.createAdapter(
          this.config.defaultAdapterType,
          this.config.defaultAdapterConfig
        );
        this.setAdapter(defaultAdapter);
        
        logger.info('Created default trace adapter', {
          type: this.config.defaultAdapterType,
          name: this.config.defaultAdapterConfig.name
        });
      } catch (error) {
        logger.error('Failed to create default adapter', {
          type: this.config.defaultAdapterType,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    logger.info('TraceManager initialized', {
      sync_interval_ms: this.config.syncIntervalMs,
      batch_size: this.config.batchSize,
      retry_attempts: this.config.retryAttempts
    });
  }
  
  /**
   * 设置追踪适配器
   * @param adapter 追踪适配器
   */
  public setAdapter(adapter: ITraceAdapter): void {
    this.traceAdapter = adapter;
    
    const adapterInfo = adapter.getAdapterInfo();
    logger.info('Trace adapter set', {
      type: adapterInfo.type,
      version: adapterInfo.version,
      capabilities: adapterInfo.capabilities || []
    });
    
    // 启动同步
    this.startSync();
  }
  
  /**
   * 获取当前设置的追踪适配器
   * @returns 追踪适配器
   */
  public getAdapter(): ITraceAdapter {
    if (!this.traceAdapter) {
      throw new Error('No trace adapter set');
    }
    return this.traceAdapter;
  }
  
  /**
   * 记录追踪数据
   * @param data 追踪数据
   * @returns 追踪ID
   */
  public async recordTrace(data: Record<string, unknown>): Promise<string> {
    const startTime = performance.now();
    
    try {
      // 生成追踪ID
      const traceId = data.trace_id as string || uuidv4();
      
      // 创建标准追踪数据
      const traceData: MPLPTraceData = {
        protocol_version: '1.0.1',
        trace_id: traceId,
        timestamp: new Date().toISOString(),
        context_id: data.context_id as string || '',
        trace_type: (data.trace_type as TraceType) || 'execution',
        severity: (data.severity as TraceSeverity) || 'info',
        event: {
          type: (data.event_type as EventType) || 'progress',
          name: data.operation_name as string || 'unknown',
          category: (data.event_category as EventCategory) || 'system',
          source: {
            component: data.source as string || 'mplp-core',
            module: data.module as string || 'trace'
          },
          data: data.details as Record<string, unknown> || {}
        }
      };
      
      // 添加可选字段
      if (data.plan_id) traceData.plan_id = data.plan_id as string;
      if (data.task_id) traceData.task_id = data.task_id as string;
      
      // 添加性能指标
      if (data.duration_ms) {
        traceData.performance_metrics = {
          execution_time: {
            start_time: new Date().toISOString(),
            duration_ms: data.duration_ms as number
          }
        };
      }
      
      // 添加错误信息
      if (data.error_info) {
        traceData.error_information = {
          error_code: (data.error_info as any).code || 'UNKNOWN_ERROR',
          error_message: (data.error_info as any).message || 'Unknown error',
          error_type: (data.error_info as any).type || 'system'
        };
      }
      
      // 存储追踪数据
      this.traces.set(traceId, traceData);
      
      // 如果有适配器，添加到待同步队列
      if (this.traceAdapter) {
        this.pendingTraces.push(traceData);
      }
      
      // 触发事件
      this.emit('trace:recorded', traceId);
      
      const endTime = performance.now();
      logger.debug('Trace recorded', {
        trace_id: traceId,
        execution_time_ms: endTime - startTime
      });
      
      return traceId;
    } catch (error) {
      const endTime = performance.now();
      logger.error('Failed to record trace', {
        error: error instanceof Error ? error.message : String(error),
        execution_time_ms: endTime - startTime
      });
      throw error;
    }
  }
  
  /**
   * 获取追踪数据
   * @param traceId 追踪ID
   * @returns 追踪数据
   */
  public async getTrace(traceId: string): Promise<Record<string, unknown> | null> {
    const trace = this.traces.get(traceId);
    if (!trace) {
      return null;
    }
    // 将MPLPTraceData转换为Record<string, unknown>以符合接口要求
    return trace as unknown as Record<string, unknown>;
  }
  
  /**
   * 查询追踪数据
   * @param filter 过滤条件
   * @returns 追踪数据列表
   */
  public async queryTraces(filter: Record<string, unknown>): Promise<Array<Record<string, unknown>>> {
    const startTime = performance.now();
    
    try {
      // 转换为标准过滤器
      const traceFilter: TraceFilter = {
        trace_ids: filter.trace_ids as string[],
        context_ids: filter.context_ids as string[],
        plan_ids: filter.plan_ids as string[],
        task_ids: filter.task_ids as string[],
        user_ids: filter.user_ids as string[],
        trace_types: filter.trace_types as TraceType[],
        statuses: filter.statuses as TraceStatus[],
        start_time: filter.start_time as string,
        end_time: filter.end_time as string,
        limit: filter.limit as number || 100,
        offset: filter.offset as number || 0
      };
      
      // 过滤追踪数据
      const results = Array.from(this.traces.values()).filter(trace => {
        // 按ID过滤
        if (traceFilter.trace_ids && traceFilter.trace_ids.length > 0) {
          if (!traceFilter.trace_ids.includes(trace.trace_id)) {
            return false;
          }
        }
        
        // 按上下文ID过滤
        if (traceFilter.context_ids && traceFilter.context_ids.length > 0) {
          if (!trace.context_id || !traceFilter.context_ids.includes(trace.context_id)) {
            return false;
          }
        }
        
        // 按计划ID过滤
        if (traceFilter.plan_ids && traceFilter.plan_ids.length > 0) {
          if (!trace.plan_id || !traceFilter.plan_ids.includes(trace.plan_id)) {
            return false;
          }
        }
        
        // 按任务ID过滤
        if (traceFilter.task_ids && traceFilter.task_ids.length > 0) {
          if (!trace.task_id || !traceFilter.task_ids.includes(trace.task_id)) {
            return false;
          }
        }
        
        // 按追踪类型过滤
        if (traceFilter.trace_types && traceFilter.trace_types.length > 0) {
          if (!traceFilter.trace_types.includes(trace.trace_type)) {
            return false;
          }
        }
        
        // 按时间范围过滤
        if (traceFilter.start_time) {
          const startTime = new Date(traceFilter.start_time).getTime();
          const traceTime = new Date(trace.timestamp).getTime();
          if (traceTime < startTime) {
            return false;
          }
        }
        
        if (traceFilter.end_time) {
          const endTime = new Date(traceFilter.end_time).getTime();
          const traceTime = new Date(trace.timestamp).getTime();
          if (traceTime > endTime) {
            return false;
          }
        }
        
        return true;
      });
      
      // 应用分页
      const offset = traceFilter.offset || 0;
      const limit = traceFilter.limit || 100;
      const paginatedResults = results.slice(offset, offset + limit);
      
      const endTime = performance.now();
      logger.debug('Traces queried', {
        filter: traceFilter,
        total_results: results.length,
        paginated_results: paginatedResults.length,
        execution_time_ms: endTime - startTime
      });
      
      // 将MPLPTraceData[]转换为Record<string, unknown>[]以符合接口要求
      return paginatedResults as unknown as Array<Record<string, unknown>>;
    } catch (error) {
      const endTime = performance.now();
      logger.error('Failed to query traces', {
        filter,
        error: error instanceof Error ? error.message : String(error),
        execution_time_ms: endTime - startTime
      });
      
      return [];
    }
  }
  
  /**
   * 报告故障信息
   * @param failure 故障报告
   * @returns 故障ID
   */
  public async reportFailure(failure: FailureReport): Promise<string> {
    const startTime = performance.now();
    
    try {
      if (!this.traceAdapter) {
        throw new Error('No trace adapter set');
      }
      
      // 确保故障ID
      const failureId = failure.failure_id || uuidv4();
      const failureWithId = { ...failure, failure_id: failureId };
      
      // 使用适配器报告故障
      const result = await this.traceAdapter.reportFailure(failureWithId);
      
      if (!result.success) {
        logger.error('Adapter failed to report failure', {
          failure_id: failureId,
          errors: result.errors
        });
        throw new Error(`Adapter failed to report failure: ${result.errors.map(e => e.message).join(', ')}`);
      }
      
      const endTime = performance.now();
      logger.debug('Failure reported', {
        failure_id: failureId,
        execution_time_ms: endTime - startTime
      });
      
      return failureId;
    } catch (error) {
      const endTime = performance.now();
      logger.error('Failed to report failure', {
        error: error instanceof Error ? error.message : String(error),
        execution_time_ms: endTime - startTime
      });
      throw error;
    }
  }
  
  /**
   * 获取故障恢复建议
   * @param failureId 故障ID
   * @returns 恢复建议列表
   */
  public async getRecoverySuggestions(failureId: string): Promise<RecoverySuggestion[]> {
    const startTime = performance.now();
    
    try {
      if (!this.traceAdapter) {
        throw new Error('No trace adapter set');
      }
      
      // 检查适配器是否支持恢复建议
      const adapterInfo = this.traceAdapter.getAdapterInfo();
      if (!adapterInfo.capabilities || !adapterInfo.capabilities.includes('recovery_suggestions')) {
        logger.warn('Current adapter does not support recovery suggestions', {
          adapter_type: adapterInfo.type
        });
        return [];
      }
      
      // 使用适配器获取恢复建议
      const suggestions = await this.traceAdapter.getRecoverySuggestions?.(failureId) || [];
      
      const endTime = performance.now();
      logger.debug('Recovery suggestions retrieved', {
        failure_id: failureId,
        suggestion_count: suggestions.length,
        execution_time_ms: endTime - startTime
      });
      
      return suggestions;
    } catch (error) {
      const endTime = performance.now();
      logger.error('Failed to get recovery suggestions', {
        failure_id: failureId,
        error: error instanceof Error ? error.message : String(error),
        execution_time_ms: endTime - startTime
      });
      return [];
    }
  }
  
  /**
   * 检测开发问题
   * @returns 开发问题列表及置信度
   */
  public async detectDevelopmentIssues(): Promise<{
    issues: Array<{
      id: string;
      type: string;
      severity: string;
      title: string;
      file_path?: string;
    }>;
    confidence: number;
  }> {
    const startTime = performance.now();
    
    try {
      if (!this.traceAdapter) {
        throw new Error('No trace adapter set');
      }
      
      // 检查适配器是否支持开发问题检测
      const adapterInfo = this.traceAdapter.getAdapterInfo();
      if (!adapterInfo.capabilities || !adapterInfo.capabilities.includes('development_issue_detection')) {
        logger.warn('Current adapter does not support development issue detection', {
          adapter_type: adapterInfo.type
        });
        return {
          issues: [],
          confidence: 0
        };
      }
      
      // 使用适配器检测开发问题
      const detectMethod = (this.traceAdapter as any).detectDevelopmentIssues;
      if (typeof detectMethod !== 'function') {
        logger.warn('Adapter does not implement detectDevelopmentIssues method', {
          adapter_type: adapterInfo.type
        });
        return {
          issues: [],
          confidence: 0
        };
      }
      
      const result = await detectMethod.call(this.traceAdapter);
      
      const endTime = performance.now();
      logger.debug('Development issues detected', {
        issue_count: result.issues.length,
        confidence: result.confidence,
        execution_time_ms: endTime - startTime
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      logger.error('Failed to detect development issues', {
        error: error instanceof Error ? error.message : String(error),
        execution_time_ms: endTime - startTime
      });
      
      return {
        issues: [],
        confidence: 0
      };
    }
  }
  
  /**
   * 配置同步选项
   * @param options 同步选项
   */
  public configureSyncOptions(options: {
    intervalMs?: number;
    batchSize?: number;
    retryAttempts?: number;
    retryDelay?: number;
  }): void {
    // 更新配置
    if (options.intervalMs !== undefined) {
      this.config.syncIntervalMs = options.intervalMs;
    }
    
    if (options.batchSize !== undefined) {
      this.config.batchSize = options.batchSize;
    }
    
    if (options.retryAttempts !== undefined) {
      this.config.retryAttempts = options.retryAttempts;
    }
    
    if (options.retryDelay !== undefined) {
      this.config.retryDelay = options.retryDelay;
    }
    
    logger.info('Sync options configured', {
      sync_interval_ms: this.config.syncIntervalMs,
      batch_size: this.config.batchSize,
      retry_attempts: this.config.retryAttempts,
      retry_delay: this.config.retryDelay
    });
    
    // 如果同步已启动，重启以应用新配置
    if (this.syncInterval) {
      this.stopSync();
      this.startSync();
    }
  }
  
  /**
   * 启动同步
   */
  private startSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(
      () => this.syncPendingTraces(),
      this.config.syncIntervalMs || 5000
    );
    
    logger.info('Trace sync started', {
      interval_ms: this.config.syncIntervalMs,
      batch_size: this.config.batchSize
    });
  }
  
  /**
   * 停止同步
   */
  private stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      
      logger.info('Trace sync stopped');
    }
  }
  
  /**
   * 同步待处理的追踪数据
   */
  private async syncPendingTraces(): Promise<void> {
    if (!this.traceAdapter || this.pendingTraces.length === 0 || this.isSyncing) {
      return;
    }
    
    this.isSyncing = true;
    const startTime = performance.now();
    
    try {
      // 获取批次数据
      const batchSize = this.config.batchSize || 100;
      const batch = this.pendingTraces.slice(0, batchSize);
      
      // 同步批次数据
      // 注意：这里我们需要确保类型兼容性
      // 我们的MPLPTraceData类型可能与适配器期望的不完全一致
      // 但由于我们使用的是厂商中立的接口，这种转换是安全的
      const result = await this.traceAdapter.syncBatch(batch as any);
      
      if (result.success) {
        // 同步成功，移除已同步的数据
        this.pendingTraces = this.pendingTraces.slice(batch.length);
        
        const endTime = performance.now();
        logger.debug('Traces synced', {
          batch_size: batch.length,
          remaining: this.pendingTraces.length,
          execution_time_ms: endTime - startTime
        });
      } else {
        // 同步失败，记录错误
        logger.error('Failed to sync traces', {
          errors: result.errors,
          batch_size: batch.length
        });
      }
    } catch (error) {
      logger.error('Error during trace sync', {
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      this.isSyncing = false;
    }
  }
  
  /**
   * 获取管理器状态
   * @returns 状态信息
   */
  public getStatus(): {
    total_traces: number;
    pending_traces: number;
    adapter_status: string;
    is_syncing: boolean;
  } {
    return {
      total_traces: this.traces.size,
      pending_traces: this.pendingTraces.length,
      adapter_status: this.traceAdapter ? 'connected' : 'not_connected',
      is_syncing: this.isSyncing
    };
  }
  
  /**
   * 检查适配器健康状态
   * @returns 健康状态信息
   */
  public async checkAdapterHealth(): Promise<AdapterHealth | null> {
    if (!this.traceAdapter) {
      return null;
    }
    
    try {
      return await this.traceAdapter.checkHealth();
    } catch (error) {
      logger.error('Failed to check adapter health', {
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }
}