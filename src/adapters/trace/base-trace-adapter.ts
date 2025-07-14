/**
 * MPLP 基础追踪适配器 - 厂商中立设计
 * 
 * @version v1.0.0
 * @created 2025-07-15T19:00:00+08:00
 * @compliance .cursor/rules/vendor-neutral-design.mdc - 厂商中立设计原则
 * @compliance trace-protocol.json Schema v1.0.0 - 100%合规
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { 
  ITraceAdapter, 
  AdapterType, 
  AdapterConfig,
  SyncResult, 
  AdapterHealth, 
  FailureReport, 
  RecoverySuggestion,
  SyncError
} from '../../interfaces/trace-adapter.interface';
import { MPLPTraceData } from '../../types/trace';
import { logger } from '../../utils/logger';

/**
 * 基础追踪适配器配置
 */
export interface BaseTraceAdapterConfig extends AdapterConfig {
  /**
   * 批处理大小
   */
  batchSize?: number;

  /**
   * 是否启用缓存
   */
  cacheEnabled?: boolean;

  /**
   * 最大重试次数
   */
  retryAttempts?: number;

  /**
   * 重试间隔(毫秒)
   */
  retryDelay?: number;

  /**
   * 超时时间(毫秒)
   */
  timeout?: number;
}

/**
 * 默认适配器配置
 */
const DEFAULT_CONFIG: BaseTraceAdapterConfig = {
  name: 'base-trace-adapter',
  version: '1.0.0',
  type: AdapterType.BASE,
  batchSize: 100,
  cacheEnabled: true,
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 30000
};

/**
 * 基础追踪适配器
 * 提供基本的追踪数据同步和查询功能
 */
export class BaseTraceAdapter extends EventEmitter implements ITraceAdapter {
  protected config: BaseTraceAdapterConfig;
  protected pendingTraces: MPLPTraceData[] = [];
  protected pendingFailures: FailureReport[] = [];
  protected isSyncing: boolean = false;
  protected healthStatus: AdapterHealth = {
    status: 'healthy',
    last_check: new Date().toISOString(),
    metrics: {
      avg_latency_ms: 0,
      success_rate: 1.0,
      error_rate: 0.0
    }
  };

  /**
   * 构造函数
   * @param config 适配器配置
   */
  constructor(config: Partial<BaseTraceAdapterConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };

    logger.info('BaseTraceAdapter initialized', {
      name: this.config.name,
      version: this.config.version,
      batch_size: this.config.batchSize,
      cache_enabled: this.config.cacheEnabled
    });
  }

  /**
   * 获取适配器信息
   * @returns 适配器信息
   */
  getAdapterInfo(): { type: AdapterType; version: string; capabilities: string[] } {
    return {
      type: this.config.type || AdapterType.BASE,
      version: this.config.version || '1.0.0',
      capabilities: ['basic_tracing']
    };
  }

  /**
   * 同步单条追踪数据
   * @param traceData 追踪数据
   * @returns 同步结果
   */
  async syncTraceData(traceData: MPLPTraceData): Promise<SyncResult> {
    const startTime = performance.now();

    try {
      // 验证追踪数据
      this.validateTraceData(traceData);

      // 添加到待处理队列
      this.pendingTraces.push(traceData);

      // 如果队列达到批处理大小，执行批量同步
      if (this.pendingTraces.length >= (this.config.batchSize || 100)) {
        await this.syncBatch(this.pendingTraces);
        this.pendingTraces = [];
      }

      const endTime = performance.now();
      const latency = endTime - startTime;

      // 更新健康状态指标
      this.updateHealthMetrics(latency, true);

      return {
        success: true,
        sync_id: uuidv4(),
        sync_timestamp: new Date().toISOString(),
        latency_ms: latency,
        errors: []
      };
    } catch (error) {
      const endTime = performance.now();
      const latency = endTime - startTime;

      // 更新健康状态指标
      this.updateHealthMetrics(latency, false);

      logger.error('Failed to sync trace data', {
        error: error instanceof Error ? error.message : String(error),
        trace_id: traceData.trace_id
      });

      const syncError: SyncError = {
        code: 'SYNC_ERROR',
        message: error instanceof Error ? error.message : String(error),
        field: null
      };

      return {
        success: false,
        sync_id: uuidv4(),
        sync_timestamp: new Date().toISOString(),
        latency_ms: latency,
        errors: [syncError]
      };
    }
  }

  /**
   * 批量同步追踪数据
   * @param traceBatch 追踪数据批次
   * @returns 同步结果
   */
  async syncBatch(traceBatch: MPLPTraceData[]): Promise<SyncResult> {
    const startTime = performance.now();

    try {
      if (traceBatch.length === 0) {
        return {
          success: true,
          sync_id: uuidv4(),
          sync_timestamp: new Date().toISOString(),
          latency_ms: 0,
          errors: []
        };
      }

      // 在实际实现中，这里会将数据发送到存储系统
      // 这里仅模拟同步过程
      await this.simulateSyncDelay(traceBatch.length);

      const endTime = performance.now();
      const latency = endTime - startTime;

      // 更新健康状态指标
      this.updateHealthMetrics(latency, true);

      // 触发同步完成事件
      this.emit('batch_synced', {
        count: traceBatch.length,
        latency_ms: latency
      });

      return {
        success: true,
        sync_id: uuidv4(),
        sync_timestamp: new Date().toISOString(),
        latency_ms: latency,
        errors: []
      };
    } catch (error) {
      const endTime = performance.now();
      const latency = endTime - startTime;

      // 更新健康状态指标
      this.updateHealthMetrics(latency, false);

      logger.error('Failed to sync trace batch', {
        error: error instanceof Error ? error.message : String(error),
        batch_size: traceBatch.length
      });

      const syncError: SyncError = {
        code: 'BATCH_SYNC_ERROR',
        message: error instanceof Error ? error.message : String(error),
        field: null
      };

      return {
        success: false,
        sync_id: uuidv4(),
        sync_timestamp: new Date().toISOString(),
        latency_ms: latency,
        errors: [syncError]
      };
    }
  }

  /**
   * 报告故障信息
   * @param failure 故障报告
   * @returns 同步结果
   */
  async reportFailure(failure: FailureReport): Promise<SyncResult> {
    const startTime = performance.now();

    try {
      // 验证故障报告
      this.validateFailureReport(failure);

      // 添加到待处理队列
      this.pendingFailures.push(failure);

      // 模拟处理延迟
      await this.simulateSyncDelay(1);

      const endTime = performance.now();
      const latency = endTime - startTime;

      // 更新健康状态指标
      this.updateHealthMetrics(latency, true);

      return {
        success: true,
        sync_id: uuidv4(),
        sync_timestamp: new Date().toISOString(),
        latency_ms: latency,
        errors: []
      };
    } catch (error) {
      const endTime = performance.now();
      const latency = endTime - startTime;

      // 更新健康状态指标
      this.updateHealthMetrics(latency, false);

      logger.error('Failed to report failure', {
        error: error instanceof Error ? error.message : String(error),
        failure_id: failure.failure_id
      });

      const syncError: SyncError = {
        code: 'FAILURE_REPORT_ERROR',
        message: error instanceof Error ? error.message : String(error),
        field: null
      };

      return {
        success: false,
        sync_id: uuidv4(),
        sync_timestamp: new Date().toISOString(),
        latency_ms: latency,
        errors: [syncError]
      };
    }
  }

  /**
   * 检查适配器健康状态
   * @returns 健康状态信息
   */
  async checkHealth(): Promise<AdapterHealth> {
    this.healthStatus.last_check = new Date().toISOString();
    return this.healthStatus;
  }

  /**
   * 获取故障恢复建议
   * 基础适配器不支持此功能，返回空数组
   * @param failureId 故障ID
   * @returns 恢复建议列表
   */
  async getRecoverySuggestions?(failureId: string): Promise<RecoverySuggestion[]> {
    logger.warn('Recovery suggestions not supported in base adapter', {
      failure_id: failureId
    });
    return [];
  }

  /**
   * 验证追踪数据
   * @param traceData 追踪数据
   * @throws 如果数据无效
   */
  protected validateTraceData(traceData: MPLPTraceData): void {
    if (!traceData) {
      throw new Error('Trace data is required');
    }

    if (!traceData.trace_id) {
      throw new Error('Trace ID is required');
    }

    // 更多验证逻辑可以根据需要添加
  }

  /**
   * 验证故障报告
   * @param failure 故障报告
   * @throws 如果报告无效
   */
  protected validateFailureReport(failure: FailureReport): void {
    if (!failure) {
      throw new Error('Failure report is required');
    }

    if (!failure.failure_id) {
      throw new Error('Failure ID is required');
    }

    if (!failure.task_id) {
      throw new Error('Task ID is required');
    }

    if (!failure.plan_id) {
      throw new Error('Plan ID is required');
    }

    // 更多验证逻辑可以根据需要添加
  }

  /**
   * 更新健康状态指标
   * @param latency 操作延迟
   * @param success 操作是否成功
   */
  protected updateHealthMetrics(latency: number, success: boolean): void {
    // 更新平均延迟
    const oldLatency = this.healthStatus.metrics.avg_latency_ms;
    this.healthStatus.metrics.avg_latency_ms = 
      (oldLatency * 0.9) + (latency * 0.1);

    // 更新成功率和错误率
    if (success) {
      this.healthStatus.metrics.success_rate = 
        (this.healthStatus.metrics.success_rate * 0.9) + 0.1;
      this.healthStatus.metrics.error_rate = 
        this.healthStatus.metrics.error_rate * 0.9;
    } else {
      this.healthStatus.metrics.success_rate = 
        this.healthStatus.metrics.success_rate * 0.9;
      this.healthStatus.metrics.error_rate = 
        (this.healthStatus.metrics.error_rate * 0.9) + 0.1;
    }

    // 更新健康状态
    if (this.healthStatus.metrics.error_rate > 0.5) {
      this.healthStatus.status = 'unhealthy';
    } else if (this.healthStatus.metrics.error_rate > 0.2) {
      this.healthStatus.status = 'degraded';
    } else {
      this.healthStatus.status = 'healthy';
    }
  }

  /**
   * 模拟同步延迟
   * @param itemCount 项目数量
   */
  protected async simulateSyncDelay(itemCount: number): Promise<void> {
    // 模拟延迟，每个项目1ms
    const delay = Math.min(itemCount, 100);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
} 