/**
 * 基础追踪适配器
 *
 * 提供基本的追踪功能实现
 *
 * @version 1.0.0
 * @created 2025-09-16
 */

import {
  ITraceAdapter,
  AdapterConfig,
  AdapterInfo,
  AdapterHealth,
  SyncResult,
  TraceHistoryOptions,
  TraceHistoryResult
} from '../../interfaces/trace-adapter.interface';
import { MPLPTraceData } from '../../modules/trace/types';
import { Logger } from '../../public/utils/logger';



/**
 * 基础追踪适配器类
 */
export class BaseTraceAdapter implements ITraceAdapter {
  protected logger: Logger;
  protected config: AdapterConfig;
  protected traces: Map<string, MPLPTraceData>;
  protected initialized: boolean;

  constructor() {
    this.logger = new Logger('BaseTraceAdapter');
    this.traces = new Map();
    this.initialized = false;
    this.config = {
      name: 'base-adapter',
      version: '1.0.0',
      enabled: true
    };
  }

  /**
   * 获取适配器信息
   */
  getAdapterInfo(): AdapterInfo {
    return {
      type: 'base',
      version: '1.0.0',
      name: this.config.name,
      description: '基础追踪适配器，提供内存存储',
      capabilities: ['record', 'batch_record', 'history', 'cleanup'],
      status: this.initialized ? 'active' : 'inactive'
    };
  }

  /**
   * 初始化适配器
   */
  async initialize(config: AdapterConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    this.initialized = true;
    
    this.logger.info('基础追踪适配器初始化完成', {
      name: this.config.name,
      version: this.config.version
    });
  }

  /**
   * 记录追踪数据
   */
  async recordTrace(traceData: Partial<MPLPTraceData>): Promise<{ success: boolean; data?: MPLPTraceData; error?: string }> {
    try {
      if (!this.initialized) {
        throw new Error('适配器未初始化');
      }

      // 补充必要字段
      const fullTraceData: MPLPTraceData = {
        protocol_version: '1.0.1',
        timestamp: new Date().toISOString(),
        trace_id: traceData.trace_id || `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        context_id: traceData.context_id || '',
        trace_type: traceData.trace_type || 'execution',
        severity: traceData.severity || 'info',
        event: traceData.event || {
          type: 'start',
          name: 'unknown',
          category: 'system',
          source: { component: 'base-adapter' }
        },
        ...traceData
      };

      this.traces.set(fullTraceData.trace_id, fullTraceData);
      
      this.logger.debug('记录追踪数据', {
        trace_id: fullTraceData.trace_id,
        context_id: fullTraceData.context_id,
        trace_type: fullTraceData.trace_type
      });

      return {
        success: true,
        data: fullTraceData
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('记录追踪数据失败', { error: errorMessage });
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * 批量记录追踪数据
   */
  async batchRecordTrace(traceDataList: Partial<MPLPTraceData>[]): Promise<SyncResult> {
    const startTime = Date.now();
    let syncedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const traceData of traceDataList) {
      const result = await this.recordTrace(traceData);
      if (result.success) {
        syncedCount++;
      } else {
        failedCount++;
        if (result.error) {
          errors.push(result.error);
        }
      }
    }

    const duration = Date.now() - startTime;

    this.logger.info('批量记录追踪数据完成', {
      total: traceDataList.length,
      synced: syncedCount,
      failed: failedCount,
      duration_ms: duration
    });

    return {
      success: failedCount === 0,
      synced_count: syncedCount,
      failed_count: failedCount,
      errors: errors.length > 0 ? errors : undefined,
      duration_ms: duration
    };
  }

  /**
   * 获取追踪历史
   */
  async getTraceHistory(contextId: string, options: TraceHistoryOptions = {}): Promise<TraceHistoryResult> {
    const {
      start_time,
      end_time,
      trace_types,
      severities,
      page_size = 50,
      page = 1
    } = options;

    // 过滤追踪数据
    let filteredTraces = Array.from(this.traces.values()).filter(trace => {
      if (trace.context_id !== contextId) return false;
      
      if (start_time && trace.timestamp < start_time) return false;
      if (end_time && trace.timestamp > end_time) return false;
      
      if (trace_types && trace_types.length > 0 && !trace_types.includes(trace.trace_type)) return false;
      if (severities && severities.length > 0 && !severities.includes(trace.severity)) return false;
      
      return true;
    });

    // 排序（最新的在前）
    filteredTraces.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 分页
    const totalCount = filteredTraces.length;
    const startIndex = (page - 1) * page_size;
    const endIndex = startIndex + page_size;
    const paginatedTraces = filteredTraces.slice(startIndex, endIndex);

    return {
      history: paginatedTraces,
      total_count: totalCount,
      page,
      page_size,
      has_more: endIndex < totalCount
    };
  }

  /**
   * 检查健康状态
   */
  async checkHealth(): Promise<AdapterHealth> {
    return {
      status: this.initialized ? 'healthy' : 'unhealthy',
      message: this.initialized ? '适配器运行正常' : '适配器未初始化',
      details: {
        initialized: this.initialized,
        trace_count: this.traces.size,
        memory_usage: process.memoryUsage()
      },
      last_check: new Date().toISOString()
    };
  }

  /**
   * 同步数据
   */
  async sync(): Promise<SyncResult> {
    // 基础适配器不需要同步，直接返回成功
    return {
      success: true,
      synced_count: this.traces.size,
      failed_count: 0,
      duration_ms: 0
    };
  }

  /**
   * 清理过期数据
   */
  async cleanup(olderThanDays: number): Promise<{ deleted_count: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const cutoffTimestamp = cutoffDate.toISOString();

    let deletedCount = 0;
    
    for (const [traceId, trace] of this.traces.entries()) {
      if (trace.timestamp < cutoffTimestamp) {
        this.traces.delete(traceId);
        deletedCount++;
      }
    }

    this.logger.info('清理过期追踪数据', {
      older_than_days: olderThanDays,
      deleted_count: deletedCount,
      remaining_count: this.traces.size
    });

    return { deleted_count: deletedCount };
  }

  /**
   * 关闭适配器
   */
  async close(): Promise<void> {
    this.traces.clear();
    this.initialized = false;

    this.logger.info('基础追踪适配器已关闭');
  }
}
