/**
 * TracePilotAdapter - TracePilot集成的基础适配器
 * 
 * 该适配器实现了通用ITraceAdapter接口，
 * 作为MPLP与TracePilot平台集成的参考实现。
 * 
 * @version v1.0.2
 * @created 2025-07-12T14:45:00+08:00
 * @updated 2025-07-15T20:30:00+08:00
 * @compliance trace-protocol.json Schema v1.0.0 - 100%合规
 * @compliance extension-protocol.mdc - 厂商中立设计
 * @deprecated 推荐使用厂商中立的适配器 (src/adapters/trace/base-trace-adapter.ts)
 */

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger';
import { Performance } from '../utils/performance';
import { MPLPTraceData } from '../types/trace';
import { 
  ITraceAdapter, 
  FailureReport, 
  SyncResult, 
  AdapterHealth,
  RecoverySuggestion,
  SyncError,
  AdapterType
} from '../interfaces/trace-adapter.interface';
import { BaseTraceAdapter } from '../adapters/trace/base-trace-adapter';

// TracePilot配置接口
export interface TracePilotConfig {
  api_endpoint: string;
  api_key: string;
  organization_id: string;
  project_id?: string;
  environment?: 'production' | 'staging' | 'development';
  sync_interval_ms: number;
  batch_size: number;
}

/**
 * TracePilot错误类型
 */
export interface TracePilotError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * TracePilotAdapter - 基础TracePilot适配器
 * 
 * 实现了通用ITraceAdapter接口，
 * 提供与TracePilot平台的基础集成功能。
 * 
 * 注意：此适配器仅作为参考实现，展示如何通过Extension模块集成第三方服务
 * 
 * @deprecated 推荐使用厂商中立的适配器 (src/adapters/trace/base-trace-adapter.ts)
 */
export class TracePilotAdapter implements ITraceAdapter {
  private config: TracePilotConfig;
  private logger = new Logger('TracePilotAdapter');
  private performance = new Performance();
  private traceEndpoint: string;
  private batchEndpoint: string;
  private failureEndpoint: string;
  private analyticsEndpoint: string;
  private healthEndpoint: string;
  private baseAdapter: BaseTraceAdapter | null = null;
  
  constructor(config: TracePilotConfig) {
    this.config = config;
    
    // API端点
    this.traceEndpoint = `${config.api_endpoint}/v1/traces`;
    this.batchEndpoint = `${config.api_endpoint}/v1/traces/batch`;
    this.failureEndpoint = `${config.api_endpoint}/v1/failures`;
    this.analyticsEndpoint = `${config.api_endpoint}/v1/analytics`;
    this.healthEndpoint = `${config.api_endpoint}/v1/health`;
    
    this.logger.info('TracePilotAdapter initialized', {
      api_endpoint: config.api_endpoint,
      environment: config.environment || 'development'
    });
    
    this.logger.warn('TracePilotAdapter is deprecated, use BaseTraceAdapter instead');
  }
  
  /**
   * 获取适配器信息
   */
  getAdapterInfo(): { type: AdapterType; version: string; capabilities?: string[] } {
    return {
      type: AdapterType.CUSTOM,
      version: '1.0.2',
      capabilities: ['basic_tracing', 'error_reporting']
    };
  }
  
  /**
   * 获取或创建基础适配器
   * @returns 基础适配器实例
   */
  private getBaseAdapter(): BaseTraceAdapter {
    if (!this.baseAdapter) {
      this.baseAdapter = new BaseTraceAdapter({
        name: 'tracepilot-base',
        version: '1.0.2',
        batchSize: this.config.batch_size,
        cacheEnabled: true
      });
    }
    return this.baseAdapter;
  }
  
  /**
   * 同步追踪数据到TracePilot
   */
  async syncTraceData(traceData: MPLPTraceData): Promise<SyncResult> {
    const startTime = this.performance.now();
    
    try {
      const response = await axios.post(
        this.traceEndpoint,
        {
          trace_data: traceData,
          client_info: {
            adapter_version: this.getAdapterInfo().version,
            client_timestamp: new Date().toISOString()
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.api_key}`,
            'X-Organization-ID': this.config.organization_id,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const endTime = this.performance.now();
      
      return {
        success: true,
        sync_id: response.data.sync_id,
        sync_timestamp: new Date().toISOString(),
        latency_ms: endTime - startTime,
        errors: []
      };
    } catch (error) {
      this.logger.error('Failed to sync trace data', {
        error: error instanceof Error ? error.message : 'Unknown error',
        trace_id: traceData.trace_id
      });
      
      const endTime = this.performance.now();
      
      const syncError: SyncError = {
        code: 'SYNC_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        field: null
      };
      
      return {
        success: false,
        sync_timestamp: new Date().toISOString(),
        latency_ms: endTime - startTime,
        errors: [syncError]
      };
    }
  }
  
  /**
   * 报告故障信息
   */
  async reportFailure(failure: FailureReport): Promise<SyncResult> {
    const startTime = this.performance.now();
    
    try {
      const response = await axios.post(
        this.failureEndpoint,
        {
          failure_data: failure,
          client_info: {
            adapter_version: this.getAdapterInfo().version,
            client_timestamp: new Date().toISOString()
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.api_key}`,
            'X-Organization-ID': this.config.organization_id,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const endTime = this.performance.now();
      
      return {
        success: true,
        sync_id: response.data.sync_id,
        sync_timestamp: new Date().toISOString(),
        latency_ms: endTime - startTime,
        errors: []
      };
    } catch (error) {
      this.logger.error('Failed to report failure', {
        error: error instanceof Error ? error.message : 'Unknown error',
        failure_id: failure.failure_id
      });
      
      const endTime = this.performance.now();
      
      const syncError: SyncError = {
        code: 'FAILURE_REPORT_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        field: null
      };
      
      return {
        success: false,
        sync_timestamp: new Date().toISOString(),
        latency_ms: endTime - startTime,
        errors: [syncError]
      };
    }
  }
  
  /**
   * 检查适配器健康状态
   */
  async checkHealth(): Promise<AdapterHealth> {
    try {
      const response = await axios.get(
        this.healthEndpoint,
        {
          headers: {
            'Authorization': `Bearer ${this.config.api_key}`,
            'X-Organization-ID': this.config.organization_id
          }
        }
      );
      
      return {
        status: response.data.status === 'ok' ? 'healthy' : 'degraded',
        last_check: new Date().toISOString(),
        metrics: {
          avg_latency_ms: response.data.metrics?.avg_latency_ms || 0,
          success_rate: response.data.metrics?.success_rate || 1.0,
          error_rate: response.data.metrics?.error_rate || 0.0
        }
      };
    } catch (error) {
      this.logger.error('Health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        status: 'unhealthy',
        last_check: new Date().toISOString(),
        metrics: {
          avg_latency_ms: 0,
          success_rate: 0,
          error_rate: 1.0
        }
      };
    }
  }

  /**
   * 获取故障恢复建议
   * @param failureId 故障ID
   * @returns 恢复建议列表
   */
  async getRecoverySuggestions(failureId: string): Promise<RecoverySuggestion[]> {
    try {
      const response = await axios.get(
        `${this.failureEndpoint}/${failureId}/suggestions`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.api_key}`,
            'X-Organization-ID': this.config.organization_id
          }
        }
      );
      
      return response.data.suggestions.map((suggestion: any) => ({
        suggestion_id: suggestion.id,
        failure_id: failureId,
        suggestion: suggestion.text,
        confidence_score: suggestion.confidence,
        estimated_effort: suggestion.effort,
        code_snippet: suggestion.code_snippet
      }));
    } catch (error) {
      this.logger.error('Failed to get recovery suggestions', {
        error: error instanceof Error ? error.message : 'Unknown error',
        failure_id: failureId
      });
      
      return [];
    }
  }
  
  /**
   * 追踪事件
   * @param eventData 事件数据
   * @returns 同步结果
   */
  async trackEvent(eventData: {
    event_type: string;
    context_id: string;
    timestamp: string;
    data: Record<string, unknown>;
    source: string;
  }): Promise<SyncResult> {
    const startTime = this.performance.now();
    
    try {
      const response = await axios.post(
        `${this.traceEndpoint}/events`,
        {
          event_data: eventData,
          client_info: {
            adapter_version: this.getAdapterInfo().version,
            client_timestamp: new Date().toISOString()
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.api_key}`,
            'X-Organization-ID': this.config.organization_id,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const endTime = this.performance.now();
      
      return {
        success: true,
        sync_id: response.data.sync_id,
        sync_timestamp: new Date().toISOString(),
        latency_ms: endTime - startTime,
        errors: []
      };
    } catch (error) {
      this.logger.error('Failed to track event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        event_type: eventData.event_type
      });
      
      const endTime = this.performance.now();
      
      const syncError: SyncError = {
        code: 'EVENT_TRACKING_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        field: null
      };
      
      return {
        success: false,
        sync_timestamp: new Date().toISOString(),
        latency_ms: endTime - startTime,
        errors: [syncError]
      };
    }
  }
  
  /**
   * 批量同步追踪数据
   */
  async syncBatch(traceBatch: MPLPTraceData[]): Promise<SyncResult> {
    const startTime = this.performance.now();
    
    try {
      const response = await axios.post(
        this.batchEndpoint,
        {
          traces: traceBatch,
          client_info: {
            adapter_version: this.getAdapterInfo().version,
            client_timestamp: new Date().toISOString(),
            batch_size: traceBatch.length
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.api_key}`,
            'X-Organization-ID': this.config.organization_id,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const endTime = this.performance.now();
      
      return {
        success: true,
        sync_id: response.data.sync_id,
        sync_timestamp: new Date().toISOString(),
        latency_ms: endTime - startTime,
        errors: []
      };
    } catch (error) {
      this.logger.error('Failed to sync trace batch', {
        error: error instanceof Error ? error.message : 'Unknown error',
        batch_size: traceBatch.length
      });
      
      const endTime = this.performance.now();
      
      const syncError: SyncError = {
        code: 'BATCH_SYNC_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        field: null
      };
      
      return {
        success: false,
        sync_timestamp: new Date().toISOString(),
        latency_ms: endTime - startTime,
        errors: [syncError]
      };
    }
  }
  
  /**
   * 获取分析数据
   */
  async getAnalytics(query: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const response = await axios.post(
        this.analyticsEndpoint,
        {
          query,
          client_info: {
            adapter_version: this.getAdapterInfo().version,
            client_timestamp: new Date().toISOString()
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.api_key}`,
            'X-Organization-ID': this.config.organization_id,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.results;
    } catch (error) {
      this.logger.error('Failed to get analytics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        query
      };
    }
  }
  
  /**
   * 检测开发问题
   */
  async detectDevelopmentIssues(): Promise<{
    issues: Array<{
      id: string;
      type: string;
      severity: string;
      title: string;
      file_path?: string;
    }>;
    confidence: number;
  }> {
    try {
      const response = await axios.get(
        `${this.analyticsEndpoint}/development-issues`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.api_key}`,
            'X-Organization-ID': this.config.organization_id
          }
        }
      );
      
      return {
        issues: response.data.issues,
        confidence: response.data.confidence
      };
    } catch (error) {
      this.logger.error('Failed to detect development issues', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        issues: [],
        confidence: 0
      };
    }
  }
} 