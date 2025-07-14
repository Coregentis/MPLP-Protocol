/**
 * 追踪适配器接口 - 厂商中立设计
 * 
 * 定义了MPLP与外部追踪系统集成的标准接口。
 * 所有追踪适配器实现必须遵循此接口。
 * 
 * @version v1.0.3
 * @created 2025-07-10T13:30:00+08:00
 * @updated 2025-07-15T19:45:00+08:00
 * @compliance trace-protocol.json Schema v1.0.0 - 100%合规
 * @compliance extension-protocol.mdc - 厂商中立设计
 */

import { MPLPTraceData } from '../types/trace';

/**
 * 适配器类型枚举
 */
export enum AdapterType {
  BASE = 'base',
  ENHANCED = 'enhanced',
  CUSTOM = 'custom'
}

/**
 * 基础适配器配置接口
 */
export interface AdapterConfig {
  name?: string;
  version?: string;
  type?: AdapterType;
  batchSize?: number;
  cacheEnabled?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * 故障报告接口
 */
export interface FailureReport {
  failure_id: string;
  task_id: string;
  plan_id: string;
  failure_type: string;
  failure_details: Record<string, unknown>;
  timestamp: string;
  recovery_suggestions?: string[];
  // 增强属性 - 用于故障分析和恢复
  component?: string;         // 失败的组件名称
  error_type?: string;        // 错误类型
  dependency?: string;        // 依赖项名称
  resource?: string;          // 资源名称
  code_location?: string;     // 代码位置
}

/**
 * 同步结果错误接口
 */
export interface SyncError {
  code: string;
  message: string;
  field: string | null;
}

/**
 * 同步结果接口
 */
export interface SyncResult {
  success: boolean;
  sync_id?: string;
  sync_timestamp: string;
  latency_ms: number;
  errors: SyncError[];
}

/**
 * 适配器健康状态接口
 */
export interface AdapterHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  last_check: string;
  metrics: {
    avg_latency_ms: number;
    success_rate: number;
    error_rate: number;
  };
}

/**
 * 恢复建议接口
 */
export interface RecoverySuggestion {
  suggestion_id: string;
  failure_id: string;
  suggestion: string;
  confidence_score: number;
  estimated_effort: 'low' | 'medium' | 'high';
  code_snippet?: string;
  code_reference?: string;    // 代码引用路径
}

/**
 * 追踪适配器接口 - 厂商中立
 */
export interface ITraceAdapter {
  /**
   * 获取适配器信息
   * @returns 包含适配器类型、版本和能力的对象
   */
  getAdapterInfo(): { type: AdapterType; version: string; capabilities?: string[] };
  
  /**
   * 同步单条追踪数据
   * @param traceData 追踪数据
   * @returns 同步结果
   */
  syncTraceData(traceData: MPLPTraceData): Promise<SyncResult>;
  
  /**
   * 批量同步追踪数据
   * @param traceBatch 追踪数据数组
   * @returns 批量同步结果
   */
  syncBatch(traceBatch: MPLPTraceData[]): Promise<SyncResult>;
  
  /**
   * 报告故障信息
   * @param failure 故障报告
   * @returns 同步结果
   */
  reportFailure(failure: FailureReport): Promise<SyncResult>;
  
  /**
   * 检查适配器健康状态
   * @returns 健康状态信息
   */
  checkHealth(): Promise<AdapterHealth>;
  
  /**
   * 获取故障恢复建议
   * @param failureId 故障ID
   * @returns 恢复建议列表
   */
  getRecoverySuggestions?(failureId: string): Promise<RecoverySuggestion[]>;
  
  /**
   * 获取分析数据
   * @param query 查询参数
   * @returns 分析结果
   */
  getAnalytics?(query: Record<string, unknown>): Promise<Record<string, unknown>>;
  
  /**
   * 检测开发问题
   * @returns 开发问题列表及置信度
   */
  detectDevelopmentIssues?(): Promise<{
    issues: Array<{
      id: string;
      type: string;
      severity: string;
      title: string;
      file_path?: string;
    }>;
    confidence: number;
  }>;
} 