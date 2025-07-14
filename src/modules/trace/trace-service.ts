/**
 * MPLP Trace模块服务
 * 
 * @version v1.0.2
 * @created 2025-07-10T13:30:00+08:00
 * @updated 2025-07-15T20:00:00+08:00
 * @compliance trace-protocol.json Schema v1.0.0 - 100%合规
 * @compliance .cursor/rules/vendor-neutral-design.mdc - 厂商中立设计原则
 */

import { v4 as uuidv4 } from 'uuid';
import { Logger } from '@/utils/logger';
import { Performance } from '@/utils/performance';
import { 
  ITraceAdapter, 
  AdapterType, 
  AdapterConfig, 
  AdapterHealth 
} from '@/interfaces/trace-adapter.interface';
import { TraceAdapterFactory } from '@/adapters/trace/adapter-factory';
import { TraceManager } from './trace-manager';
import { 
  MPLPTraceData, 
  TraceType,
  TraceStatus,
  TraceFilter,
  TraceOperationResult,
  TraceAnalysis,
  TraceConfig
} from './types';

const logger = new Logger('TraceService');
const performance = new Performance();

/**
 * 追踪服务配置
 */
export interface TraceServiceConfig {
  /**
   * 是否启用追踪
   */
  enabled: boolean;

  /**
   * 采样率（0-1）
   */
  sampling_rate: number;

  /**
   * 适配器类型
   */
  adapter_type?: AdapterType | string;

  /**
   * 适配器配置
   */
  adapter_config?: AdapterConfig;
}

/**
 * 默认追踪服务配置
 */
const DEFAULT_CONFIG: TraceServiceConfig = {
  enabled: true,
  sampling_rate: 1.0,
  adapter_type: AdapterType.BASE,
  adapter_config: {
    name: 'default-adapter',
    version: '1.0.0'
  }
};

/**
 * 追踪服务
 * 提供追踪数据记录、分析和管理功能
 */
export class TraceService {
  private config: TraceServiceConfig;
  private traceManager: TraceManager;
  private adapterFactory: TraceAdapterFactory;
  
  /**
   * 构造函数
   * @param traceManager 追踪管理器
   * @param config 服务配置
   */
  constructor(traceManager: TraceManager, config: Partial<TraceServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.traceManager = traceManager;
    this.adapterFactory = TraceAdapterFactory.getInstance();
    
    // 如果配置了适配器类型，自动创建并设置适配器
    if (this.config.adapter_type && this.config.adapter_config) {
      try {
        const adapter = this.adapterFactory.createAdapter(
          this.config.adapter_type,
          this.config.adapter_config
        );
        this.setAdapter(adapter);
        
        logger.info('Automatically created and set trace adapter', {
          type: this.config.adapter_type,
          name: this.config.adapter_config.name
        });
      } catch (error) {
        logger.error('Failed to create adapter automatically', {
          type: this.config.adapter_type,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    logger.info('TraceService initialized', {
      enabled: this.config.enabled,
      sampling_rate: this.config.sampling_rate,
      adapter_type: this.config.adapter_type || 'not_configured'
    });
  }
  
  /**
   * 设置追踪适配器
   * @param adapter 追踪适配器
   */
  public setAdapter(adapter: ITraceAdapter): void {
    this.traceManager.setAdapter(adapter);
    
    const adapterInfo = adapter.getAdapterInfo();
    logger.info('Trace adapter set', {
      type: adapterInfo.type,
      version: adapterInfo.version,
      capabilities: adapterInfo.capabilities || []
    });
  }
  
  /**
   * 获取追踪适配器
   * @returns 追踪适配器
   */
  public getAdapter(): ITraceAdapter {
    return this.traceManager.getAdapter();
  }
  
  /**
   * 创建并设置追踪适配器
   * @param type 适配器类型
   * @param config 适配器配置
   * @returns 创建的适配器
   */
  public createAndSetAdapter(type: AdapterType | string, config: AdapterConfig): ITraceAdapter {
    const adapter = this.adapterFactory.createAdapter(type, config);
    this.setAdapter(adapter);
    return adapter;
  }
  
  /**
   * 记录操作追踪
   * @param operation 操作名称
   * @param context 上下文信息
   * @param details 操作详情
   * @returns 追踪ID
   */
  public async recordOperation(
    operation: string,
    context: {
      context_id?: string;
      plan_id?: string;
      task_id?: string;
      user_id?: string;
    },
    details: Record<string, unknown> = {}
  ): Promise<string> {
    if (!this.config.enabled) {
      return '';
    }
    
    // 采样控制
    if (Math.random() > this.config.sampling_rate) {
      return '';
    }
    
    const startTime = performance.now();
    
    try {
      const traceData: Record<string, unknown> = {
        operation_name: operation,
        trace_type: 'operation',
        status: 'success',
        duration_ms: details.duration_ms || 0,
        details,
        ...context
      };
      
      const traceId = await this.traceManager.recordTrace(traceData);
      
      const endTime = performance.now();
      logger.debug('Operation recorded', {
        operation,
        trace_id: traceId,
        execution_time_ms: endTime - startTime
      });
      
      return traceId;
    } catch (error) {
      const endTime = performance.now();
      logger.error('Failed to record operation', {
        operation,
        error: error instanceof Error ? error.message : String(error),
        execution_time_ms: endTime - startTime
      });
      
      return '';
    }
  }
  
  /**
   * 记录状态变更
   * @param fromState 原状态
   * @param toState 新状态
   * @param context 上下文信息
   * @param details 变更详情
   * @returns 追踪ID
   */
  public async recordStateChange(
    fromState: string,
    toState: string,
    context: {
      context_id?: string;
      plan_id?: string;
      task_id?: string;
      user_id?: string;
    },
    details: Record<string, unknown> = {}
  ): Promise<string> {
    if (!this.config.enabled) {
      return '';
    }
    
    const startTime = performance.now();
    
    try {
      const traceData: Record<string, unknown> = {
        operation_name: 'state_change',
        trace_type: 'state_change',
        status: 'success',
        duration_ms: 0,
        details: {
          from_state: fromState,
          to_state: toState,
          ...details
        },
        ...context
      };
      
      const traceId = await this.traceManager.recordTrace(traceData);
      
      const endTime = performance.now();
      logger.debug('State change recorded', {
        from: fromState,
        to: toState,
        trace_id: traceId,
        execution_time_ms: endTime - startTime
      });
      
      return traceId;
    } catch (error) {
      const endTime = performance.now();
      logger.error('Failed to record state change', {
        from: fromState,
        to: toState,
        error: error instanceof Error ? error.message : String(error),
        execution_time_ms: endTime - startTime
      });
      
      return '';
    }
  }
  
  /**
   * 记录性能指标
   * @param metrics 性能指标
   * @param context 上下文信息
   * @returns 是否成功
   */
  public async recordPerformanceMetrics(
    metrics: Record<string, unknown>,
    context: {
      context_id?: string;
      plan_id?: string;
      task_id?: string;
      user_id?: string;
    } = {}
  ): Promise<boolean> {
    if (!this.config.enabled) {
      return false;
    }
    
    const startTime = performance.now();
    
    try {
      const traceData: Record<string, unknown> = {
        operation_name: 'performance_metrics',
        trace_type: 'performance',
        status: 'success',
        duration_ms: 0,
        metrics,
        ...context
      };
      
      await this.traceManager.recordTrace(traceData);
      
      const endTime = performance.now();
      logger.debug('Performance metrics recorded', {
        metrics_count: Object.keys(metrics).length,
        execution_time_ms: endTime - startTime
      });
      
      return true;
    } catch (error) {
      const endTime = performance.now();
      logger.error('Failed to record performance metrics', {
        error: error instanceof Error ? error.message : String(error),
        execution_time_ms: endTime - startTime
      });
      
      return false;
    }
  }
  
  /**
   * 报告错误
   * @param error 错误对象
   * @param context 上下文信息
   * @returns 追踪ID
   */
  public async reportError(
    error: Error,
    context: {
      context_id?: string;
      plan_id?: string;
      task_id?: string;
      user_id?: string;
      operation_name?: string;
      severity?: string;
      error_type?: string;
    } = {}
  ): Promise<string> {
    if (!this.config.enabled) {
      return '';
    }
    
    const startTime = performance.now();
    
    try {
      const traceData: Record<string, unknown> = {
        operation_name: context.operation_name || 'error',
        trace_type: 'error',
        status: 'failure',
        severity: context.severity || 'error',
        error_info: {
          message: error.message,
          name: error.name,
          stack: error.stack,
          type: context.error_type || 'unknown'
        },
        ...context
      };
      
      const traceId = await this.traceManager.recordTrace(traceData);
      
      const endTime = performance.now();
      logger.debug('Error reported', {
        error_name: error.name,
        trace_id: traceId,
        execution_time_ms: endTime - startTime
      });
      
      return traceId;
    } catch (reportError) {
      const endTime = performance.now();
      logger.error('Failed to report error', {
        original_error: error.message,
        report_error: reportError instanceof Error ? reportError.message : String(reportError),
        execution_time_ms: endTime - startTime
      });
      
      return '';
    }
  }
  
  /**
   * 查询追踪数据
   * @param filter 过滤条件
   * @returns 追踪数据列表
   */
  public async queryTraces(filter: TraceFilter): Promise<MPLPTraceData[]> {
    const startTime = performance.now();
    
    try {
      // 将TraceFilter转换为Record<string, unknown>以符合接口要求
      const filterRecord: Record<string, unknown> = {
        trace_ids: filter.trace_ids,
        context_ids: filter.context_ids,
        plan_ids: filter.plan_ids,
        task_ids: filter.task_ids,
        user_ids: filter.user_ids,
        trace_types: filter.trace_types,
        statuses: filter.statuses,
        start_time: filter.start_time,
        end_time: filter.end_time,
        limit: filter.limit,
        offset: filter.offset
      };
      
      const results = await this.traceManager.queryTraces(filterRecord);
      
      const endTime = performance.now();
      logger.debug('Traces queried', {
        filter,
        result_count: results.length,
        execution_time_ms: endTime - startTime
      });
      
      // 安全地转换为MPLPTraceData[]
      return results as unknown as MPLPTraceData[];
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
   * 获取恢复建议
   * @param failureId 故障ID
   * @returns 恢复建议列表
   */
  public async getRecoverySuggestions(failureId: string): Promise<string[]> {
    const startTime = performance.now();
    
    try {
      // 检查适配器是否支持恢复建议
      const adapter = this.traceManager.getAdapter();
      const adapterInfo = adapter.getAdapterInfo();
      
      if (!adapterInfo.capabilities || !adapterInfo.capabilities.includes('recovery_suggestions')) {
        logger.warn('Current adapter does not support recovery suggestions', {
          adapter_type: adapterInfo.type,
          failure_id: failureId
        });
        return ['当前适配器不支持恢复建议功能'];
      }
      
      // 获取恢复建议
      const suggestions = await this.traceManager.getRecoverySuggestions(failureId);
      
      const endTime = performance.now();
      logger.debug('Recovery suggestions retrieved', {
        failure_id: failureId,
        suggestion_count: suggestions.length,
        execution_time_ms: endTime - startTime
      });
      
      // 提取建议文本
      return suggestions.map(s => s.suggestion);
    } catch (error) {
      const endTime = performance.now();
      logger.error('Failed to get recovery suggestions', {
        failure_id: failureId,
        error: error instanceof Error ? error.message : String(error),
        execution_time_ms: endTime - startTime
      });
      
      return ['获取恢复建议时发生错误'];
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
      // 检查适配器是否支持开发问题检测
      const adapter = this.traceManager.getAdapter();
      const adapterInfo = adapter.getAdapterInfo();
      
      if (!adapterInfo.capabilities || !adapterInfo.capabilities.includes('development_issue_detection')) {
        logger.warn('Current adapter does not support development issue detection', {
          adapter_type: adapterInfo.type
        });
        return {
          issues: [],
          confidence: 0
        };
      }
      
      // 获取开发问题
      const result = await this.traceManager.detectDevelopmentIssues();
      
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
   * 配置追踪服务
   * @param config 配置参数
   */
  public configure(config: Partial<TraceServiceConfig>): void {
    this.config = { ...this.config, ...config };
    
    logger.info('TraceService reconfigured', {
      enabled: this.config.enabled,
      sampling_rate: this.config.sampling_rate
    });
    
    // 如果配置了新的适配器类型，自动创建并设置适配器
    if (config.adapter_type && config.adapter_config) {
      try {
        const adapter = this.adapterFactory.createAdapter(
          config.adapter_type,
          config.adapter_config
        );
        this.setAdapter(adapter);
        
        logger.info('Adapter reconfigured', {
          type: config.adapter_type,
          name: config.adapter_config.name
        });
      } catch (error) {
        logger.error('Failed to reconfigure adapter', {
          type: config.adapter_type,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }
  
  /**
   * 获取服务状态
   * @returns 服务状态信息
   */
  public async getStatus(): Promise<{
    enabled: boolean;
    sampling_rate: number;
    trace_manager_status: Record<string, unknown>;
    adapter_health: AdapterHealth | null;
  }> {
    const traceManagerStatus = this.traceManager.getStatus();
    let adapterHealth: AdapterHealth | null = null;
    
    try {
      adapterHealth = await this.traceManager.checkAdapterHealth();
    } catch (error) {
      logger.error('Failed to check adapter health', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    return {
      enabled: this.config.enabled,
      sampling_rate: this.config.sampling_rate,
      trace_manager_status: traceManagerStatus,
      adapter_health: adapterHealth
    };
  }
} 