/**
 * MPLP Plan模块 - 模拟追踪适配器
 * 
 * @version v1.0.2
 * @created 2025-07-12T14:30:00+08:00
 * @updated 2025-07-15T17:50:00+08:00
 * @compliance .cursor/rules/test-style.mdc - 测试辅助工具
 * @compliance .cursor/rules/test-data.mdc - 测试数据规范
 * @compliance .cursor/rules/vendor-neutral-design.mdc - 厂商中立设计原则
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { 
  ITraceAdapter, 
  SyncResult, 
  SyncError,
  AdapterHealth, 
  FailureReport,
  RecoverySuggestion,
  AdapterConfig,
  AdapterType
} from '../../../interfaces/trace-adapter.interface';
import { MPLPTraceData } from '../../../types/trace';

/**
 * 模拟追踪适配器配置
 */
export interface MockTraceAdapterConfig extends AdapterConfig {
  simulateLatency?: boolean;
  simulateErrors?: boolean;
  errorRate?: number;
  enhancedFeatures?: boolean;
}

/**
 * 模拟追踪适配器 - 用于测试厂商中立设计
 */
export class MockTraceAdapter extends EventEmitter implements ITraceAdapter {
  private adapterType: AdapterType;
  private adapterVersion: string;
  private isEnhanced: boolean;
  private healthStatus: AdapterHealth;
  private traceData: MPLPTraceData[] = [];
  private failureReports: FailureReport[] = [];
  private recoverySuggestions: Map<string, RecoverySuggestion[]> = new Map();
  private developmentIssues: Array<{
    id: string;
    type: string;
    severity: string;
    title: string;
    file_path?: string;
  }> = [];
  private config: MockTraceAdapterConfig;
  private simulateLatency: boolean;
  private simulateErrors: boolean;
  private errorRate: number;

  constructor(config: MockTraceAdapterConfig) {
    super();
    this.adapterType = config.type || AdapterType.BASE;
    this.adapterVersion = config.version || '1.0.2';
    this.isEnhanced = config.enhancedFeatures || false;
    this.config = config;
    this.simulateLatency = config.simulateLatency || false;
    this.simulateErrors = config.simulateErrors || false;
    this.errorRate = config.errorRate || 0.05;
    this.healthStatus = {
      status: 'healthy',
      last_check: new Date().toISOString(),
      metrics: {
        avg_latency_ms: 5,
        success_rate: 1.0,
        error_rate: 0.0
      }
    };
  }

  /**
   * 获取适配器信息
   */
  getAdapterInfo(): { type: AdapterType; version: string; capabilities: string[] } {
    return {
      type: this.adapterType,
      version: this.adapterVersion,
      capabilities: this.isEnhanced 
        ? ['basic_tracing', 'failure_resolution', 'development_issues', 'analytics'] 
        : ['basic_tracing']
    };
  }

  /**
   * 同步单条追踪数据
   */
  async syncTraceData(traceData: MPLPTraceData): Promise<SyncResult> {
    // 模拟延迟
    if (this.simulateLatency) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    }
    
    // 模拟错误
    if (this.simulateErrors && Math.random() < this.errorRate) {
      return {
        success: false,
        sync_id: uuidv4(),
        sync_timestamp: new Date().toISOString(),
        latency_ms: 5,
        errors: [{
          code: 'SYNC_ERROR',
          message: 'Simulated sync error',
          field: null
        }]
      };
    }
    
    this.traceData.push(traceData);
    return {
      success: true,
      sync_id: uuidv4(),
      sync_timestamp: new Date().toISOString(),
      latency_ms: 5,
      errors: []
    };
  }

  /**
   * 批量同步追踪数据
   */
  async syncBatch(traceBatch: MPLPTraceData[]): Promise<SyncResult> {
    // 模拟延迟
    if (this.simulateLatency) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    }
    
    // 模拟错误
    if (this.simulateErrors && Math.random() < this.errorRate) {
      return {
        success: false,
        sync_id: uuidv4(),
        sync_timestamp: new Date().toISOString(),
        latency_ms: 10,
        errors: [{
          code: 'BATCH_SYNC_ERROR',
          message: 'Simulated batch sync error',
          field: null
        }]
      };
    }
    
    this.traceData.push(...traceBatch);
    return {
      success: true,
      sync_id: uuidv4(),
      sync_timestamp: new Date().toISOString(),
      latency_ms: 10,
      errors: []
    };
  }

  /**
   * 报告故障信息
   */
  async reportFailure(failure: FailureReport): Promise<SyncResult> {
    // 模拟延迟
    if (this.simulateLatency) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 30));
    }
    
    // 模拟错误
    if (this.simulateErrors && Math.random() < this.errorRate) {
      return {
        success: false,
        sync_id: uuidv4(),
        sync_timestamp: new Date().toISOString(),
        latency_ms: 8,
        errors: [{
          code: 'FAILURE_REPORT_ERROR',
          message: 'Simulated failure report error',
          field: null
        }]
      };
    }
    
    this.failureReports.push(failure);
    return {
      success: true,
      sync_id: uuidv4(),
      sync_timestamp: new Date().toISOString(),
      latency_ms: 8,
      errors: []
    };
  }

  /**
   * 检查适配器健康状态
   */
  async checkHealth(): Promise<AdapterHealth> {
    return this.healthStatus;
  }

  /**
   * 设置健康状态 (仅用于测试)
   */
  setHealthStatus(status: 'healthy' | 'degraded' | 'unhealthy'): void {
    this.healthStatus.status = status;
    this.healthStatus.last_check = new Date().toISOString();
  }

  /**
   * 获取故障恢复建议 (增强型适配器功能)
   */
  async getRecoverySuggestions(failureId: string): Promise<RecoverySuggestion[]> {
    if (!this.isEnhanced) {
      throw new Error('Method not implemented in basic adapter');
    }
    
    return this.recoverySuggestions.get(failureId) || [];
  }

  /**
   * 添加恢复建议 (仅用于测试)
   */
  addRecoverySuggestion(failureId: string, suggestion: RecoverySuggestion): void {
    if (!this.recoverySuggestions.has(failureId)) {
      this.recoverySuggestions.set(failureId, []);
    }
    
    this.recoverySuggestions.get(failureId)!.push(suggestion);
  }

  /**
   * 检测开发问题 (增强型适配器功能)
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
    if (!this.isEnhanced) {
      throw new Error('Method not implemented in basic adapter');
    }
    
    return {
      issues: this.developmentIssues,
      confidence: 0.9
    };
  }

  /**
   * 添加开发问题 (仅用于测试)
   */
  addDevelopmentIssue(issue: {
    id: string;
    type: string;
    severity: string;
    title: string;
    file_path?: string;
  }): void {
    this.developmentIssues.push(issue);
  }

  /**
   * 获取分析数据 (增强型适配器功能)
   */
  async getAnalytics(query: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (!this.isEnhanced) {
      throw new Error('Method not implemented in basic adapter');
    }
    
    return {
      total_traces: this.traceData.length,
      total_failures: this.failureReports.length,
      avg_latency_ms: 15,
      success_rate: 0.95
    };
  }

  /**
   * 获取收集的追踪数据 (仅用于测试)
   */
  getCollectedTraceData(): MPLPTraceData[] {
    return this.traceData;
  }

  /**
   * 获取收集的故障报告 (仅用于测试)
   */
  getCollectedFailureReports(): FailureReport[] {
    return this.failureReports;
  }

  /**
   * 清除收集的数据 (仅用于测试)
   */
  clearCollectedData(): void {
    this.traceData = [];
    this.failureReports = [];
    this.recoverySuggestions.clear();
    this.developmentIssues = [];
  }
} 