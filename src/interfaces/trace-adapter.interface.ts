/**
 * Trace适配器接口
 * 
 * 定义追踪适配器的标准接口
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { MPLPTraceData } from '../modules/trace/types';

export enum AdapterType {
  BASE = 'base',
  CONSOLE = 'console',
  FILE = 'file',
  DATABASE = 'database',
  REMOTE = 'remote',
  CUSTOM = 'custom',
  ENHANCED = 'enhanced'
}

export interface AdapterConfig {
  name: string;
  version: string;
  enabled?: boolean;
  options?: Record<string, any>;
}

export interface AdapterInfo {
  type: string;
  version: string;
  name: string;
  description?: string;
  capabilities?: string[];
  status: 'active' | 'inactive' | 'error';
}

export interface AdapterHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  details?: Record<string, any>;
  last_check: string;
}

export interface SyncResult {
  success: boolean;
  synced_count: number;
  failed_count: number;
  errors?: string[];
  duration_ms: number;
}

export interface FailureReport {
  error_code: string;
  error_message: string;
  timestamp: string;
  context?: Record<string, any>;
}

export interface RecoverySuggestion {
  action: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_time?: string;
}

export interface TraceHistoryOptions {
  start_time?: string;
  end_time?: string;
  trace_types?: string[];
  severities?: string[];
  page_size?: number;
  page?: number;
}

export interface TraceHistoryResult {
  history: MPLPTraceData[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

/**
 * 追踪适配器接口
 */
export interface ITraceAdapter {
  /**
   * 获取适配器信息
   */
  getAdapterInfo(): AdapterInfo;

  /**
   * 初始化适配器
   */
  initialize(config: AdapterConfig): Promise<void>;

  /**
   * 记录追踪数据
   */
  recordTrace(traceData: Partial<MPLPTraceData>): Promise<{ success: boolean; data?: MPLPTraceData; error?: string }>;

  /**
   * 批量记录追踪数据
   */
  batchRecordTrace(traceDataList: Partial<MPLPTraceData>[]): Promise<SyncResult>;

  /**
   * 获取追踪历史
   */
  getTraceHistory(contextId: string, options?: TraceHistoryOptions): Promise<TraceHistoryResult>;

  /**
   * 检查健康状态
   */
  checkHealth(): Promise<AdapterHealth>;

  /**
   * 同步数据
   */
  sync(): Promise<SyncResult>;

  /**
   * 清理过期数据
   */
  cleanup(olderThanDays: number): Promise<{ deleted_count: number }>;

  /**
   * 关闭适配器
   */
  close(): Promise<void>;
}
