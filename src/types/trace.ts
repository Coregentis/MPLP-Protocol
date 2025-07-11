/**
 * Trace Types - 追踪相关类型定义
 * 
 * @version v2.0.0
 * @created 2025-01-09T25:10:00+08:00
 * @description 统一的追踪类型定义，与modules/trace/types.ts保持同步
 */

import { BaseProtocol } from './index';

/**
 * 追踪类型枚举
 */
export type TraceType = 'operation' | 'request' | 'event' | 'error';

/**
 * 追踪状态枚举
 */
export type TraceStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

/**
 * 事件类型枚举
 */
export type EventType = 
  | 'trace_start' 
  | 'trace_end' 
  | 'trace_error'
  | 'operation_start'
  | 'operation_end'
  | 'api_call'
  | 'database_query'
  | 'validation'
  | 'transformation'
  | 'error'
  | 'warning'
  | 'performance_warning'
  | 'quality_check'
  | 'user_interaction';

/**
 * 性能指标接口
 */
export interface PerformanceMetrics {
  cpu_usage: number;          // CPU使用率 (0-100)
  memory_usage_mb: number;    // 内存使用量 (MB)
  network_io_bytes: number;   // 网络IO字节数
  disk_io_bytes: number;      // 磁盘IO字节数
  db_query_count?: number;    // 数据库查询次数 (可选)
  db_query_time_ms?: number;  // 数据库查询总时间 (可选)
  api_call_count?: number;    // API调用次数 (可选)
  api_call_time_ms?: number;  // API调用总时间 (可选)
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  error_type: string;         // 错误类型
  error_message: string;      // 错误消息
  stack_trace: string;        // 堆栈跟踪
  timestamp: string;          // 错误发生时间
}

/**
 * 追踪事件接口
 */
export interface TraceEvent {
  event_id: string;           // 事件唯一标识
  timestamp: string;          // ISO 8601时间戳
  event_type: EventType;      // 事件类型
  operation_name: string;     // 操作名称
  data: Record<string, any>;  // 事件数据
  duration_ms: number;        // 事件持续时间
}

/**
 * 基础追踪数据接口
 */
export interface TraceData extends BaseProtocol {
  trace_id: string;                    // 追踪唯一标识
  context_id: string;                  // 关联的上下文ID
  operation_name: string;              // 操作名称
  start_time: string;                  // 开始时间
  end_time: string;                    // 结束时间
  duration_ms: number;                 // 持续时间(毫秒)
  trace_type: TraceType;               // 追踪类型
  status: TraceStatus;                 // 追踪状态
  metadata: Record<string, any>;       // 元数据
  events: TraceEvent[];                // 事件列表
  performance_metrics: PerformanceMetrics; // 性能指标
  error_info: ErrorInfo | null;       // 错误信息
  parent_trace_id: string | null;     // 父追踪ID
  
  // 扩展字段
  tags?: Record<string, any>;          // 标签 (可选)
  error_message?: string;              // 错误消息 (可选)
  result_data?: any;                   // 结果数据 (可选)
}

/**
 * TracePilot元数据接口
 */
export interface TracePilotMetadata {
  agent_id: string;                    // 代理ID
  session_id: string;                  // 会话ID
  operation_complexity: 'low' | 'medium' | 'high'; // 操作复杂度
  expected_duration_ms: number;        // 预期持续时间
  quality_gates: QualityGates;         // 质量门禁
}

/**
 * 质量门禁接口
 */
export interface QualityGates {
  max_duration_ms: number;             // 最大持续时间
  max_memory_mb: number;               // 最大内存使用
  max_error_rate: number;              // 最大错误率
  required_events: EventType[];        // 必需事件
}

/**
 * MPLP追踪数据接口 (扩展基础追踪数据)
 */
export interface MPLPTraceData extends TraceData {
  tracepilot_metadata: TracePilotMetadata; // TracePilot元数据
}

/**
 * 追踪配置接口
 */
export interface TracingOptions {
  enabled?: boolean;                   // 是否启用追踪
  batchSize?: number;                  // 批处理大小
  flushInterval?: number;              // 刷新间隔(毫秒)
  maxHistorySize?: number;             // 最大历史记录大小
  performanceThresholds?: {            // 性能阈值
    warning: number;
    critical: number;
  };
}

/**
 * 追踪操作结果接口
 */
export interface TraceOperationResult {
  success: boolean;                    // 是否成功
  trace_id: string;                    // 追踪ID
  duration_ms?: number;                // 持续时间
  performance_metrics?: PerformanceMetrics; // 性能指标
  performance_analysis?: PerformanceAnalysis; // 性能分析
  error?: string;                      // 错误信息
}

/**
 * 性能分析接口
 */
export interface PerformanceAnalysis {
  rating: 'excellent' | 'good' | 'average' | 'poor' | 'critical'; // 评级
  duration_ms: number;                 // 实际持续时间
  predicted_ms: number;                // 预测持续时间
  variance_percent: number;            // 偏差百分比
  recommendations: string[];           // 优化建议
  quality_score: number;               // 质量分数 (0-100)
}

/**
 * 追踪查询接口
 */
export interface TraceQuery {
  context_id?: string;                 // 上下文ID筛选
  operation_name?: string;             // 操作名称筛选
  status?: TraceStatus;                // 状态筛选
  trace_type?: TraceType;              // 类型筛选
  start_time?: string;                 // 开始时间范围
  end_time?: string;                   // 结束时间范围
  min_duration?: number;               // 最小持续时间
  max_duration?: number;               // 最大持续时间
  limit?: number;                      // 返回数量限制
  offset?: number;                     // 偏移量
}

/**
 * 类型守卫函数
 */
export function isTraceData(obj: any): obj is TraceData {
  return obj && 
    typeof obj.trace_id === 'string' &&
    typeof obj.context_id === 'string' &&
    typeof obj.operation_name === 'string' &&
    typeof obj.start_time === 'string' &&
    typeof obj.duration_ms === 'number' &&
    Array.isArray(obj.events);
}

export function isMPLPTraceData(obj: any): obj is MPLPTraceData {
  return obj && 
    typeof obj.trace_id === 'string' &&
    typeof obj.context_id === 'string' &&
    typeof obj.operation_name === 'string' &&
    typeof obj.start_time === 'string' &&
    typeof obj.duration_ms === 'number' &&
    Array.isArray(obj.events) &&
    obj.tracepilot_metadata &&
    typeof obj.tracepilot_metadata.agent_id === 'string';
}

export function isTraceEvent(obj: any): obj is TraceEvent {
  return obj &&
    typeof obj.event_id === 'string' &&
    typeof obj.timestamp === 'string' &&
    typeof obj.event_type === 'string' &&
    typeof obj.operation_name === 'string' &&
    typeof obj.duration_ms === 'number';
}

/**
 * 默认配置常量
 */
export const DEFAULT_TRACING_OPTIONS: Required<TracingOptions> = {
  enabled: true,
  batchSize: 100,
  flushInterval: 1000,
  maxHistorySize: 10000,
  performanceThresholds: {
    warning: 100,
    critical: 500
  }
};

export const DEFAULT_QUALITY_GATES: QualityGates = {
  max_duration_ms: 1000,
  max_memory_mb: 100,
  max_error_rate: 0.01,
  required_events: ['trace_start', 'trace_end']
}; 