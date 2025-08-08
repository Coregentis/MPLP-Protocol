/**
 * MPLP Trace Types - Trace模块类型定义
 * 
 * 提供Trace模块相关的类型定义
 * 
 * @version 1.0.3
 * @created 2025-07-09T21:00:00+08:00
 * @updated 2025-08-15T20:45:00+08:00
 */

import { UUID, Timestamp } from './index';

// ===== Trace基础类型 =====

/**
 * 追踪类型枚举
 */
export type TraceType = 
  | 'execution'     // 执行追踪
  | 'monitoring'    // 监控追踪
  | 'audit'         // 审计追踪
  | 'performance'   // 性能追踪
  | 'error'         // 错误追踪
  | 'decision';     // 决策追踪

/**
 * 追踪状态枚举
 */
export type TraceStatus = 'active' | 'completed' | 'failed' | 'cancelled' | 'expired';

/**
 * 事件级别枚举
 */
export type EventLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

/**
 * 事件类型枚举
 */
export type EventType = 
  | 'start'         // 开始事件
  | 'end'           // 结束事件
  | 'checkpoint'    // 检查点事件
  | 'error'         // 错误事件
  | 'warning'       // 警告事件
  | 'info'          // 信息事件
  | 'custom';       // 自定义事件

/**
 * 性能指标类型枚举
 */
export type MetricType = 
  | 'duration'      // 持续时间
  | 'memory'        // 内存使用
  | 'cpu'           // CPU使用
  | 'network'       // 网络使用
  | 'disk'          // 磁盘使用
  | 'custom';       // 自定义指标

// ===== Trace接口定义 =====

/**
 * Trace创建请求
 */
export interface CreateTraceRequest {
  contextId: UUID;
  execution_id?: UUID;
  traceType: TraceType;
  name: string;
  description?: string;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

/**
 * Trace更新请求
 */
export interface UpdateTraceRequest {
  name?: string;
  description?: string;
  status?: TraceStatus;
  metadata?: Record<string, unknown>;
  tags?: string[];
}

/**
 * 事件记录请求
 */
export interface RecordEventRequest {
  traceId: UUID;
  event_type: EventType;
  level: EventLevel;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: Timestamp;
  duration_ms?: number;
}

/**
 * Trace查询参数
 */
export interface TraceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  traceType?: TraceType;
  status?: TraceStatus;
  contextId?: UUID;
  execution_id?: UUID;
  start_date?: Timestamp;
  end_date?: Timestamp;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Trace数据接口
 */
export interface TraceData {
  traceId: UUID;
  contextId: UUID;
  execution_id?: UUID;
  traceType: TraceType;
  name: string;
  description?: string;
  status: TraceStatus;
  start_time: Timestamp;
  end_time?: Timestamp;
  duration_ms?: number;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * 事件数据接口
 */
export interface EventData {
  event_id: UUID;
  traceId: UUID;
  event_type: EventType;
  level: EventLevel;
  message?: string;
  data?: Record<string, unknown>;
  timestamp: Timestamp;
  duration_ms?: number;
  source?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 性能指标数据接口
 */
export interface MetricData {
  metric_id: UUID;
  traceId: UUID;
  metric_type: MetricType;
  name: string;
  value: number;
  unit: string;
  timestamp: Timestamp;
  tags?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

/**
 * 追踪统计数据接口
 */
export interface TraceStatistics {
  total_traces: number;
  active_traces: number;
  completed_traces: number;
  failed_traces: number;
  average_duration_ms: number;
  total_events: number;
  error_rate: number;
  performanceMetrics: {
    avg_cpu_usage: number;
    avg_memory_usage: number;
    avg_network_usage: number;
  };
}

/**
 * 追踪摘要数据接口
 */
export interface TraceSummary {
  traceId: UUID;
  name: string;
  traceType: TraceType;
  status: TraceStatus;
  start_time: Timestamp;
  end_time?: Timestamp;
  duration_ms?: number;
  event_count: number;
  error_count: number;
  warning_count: number;
}

/**
 * 追踪详情数据接口
 */
export interface TraceDetails extends TraceData {
  events: EventData[];
  metrics: MetricData[];
  statistics: {
    total_events: number;
    error_events: number;
    warning_events: number;
    info_events: number;
    debug_events: number;
    avg_event_duration_ms: number;
  };
}

/**
 * 追踪过滤器接口
 */
export interface TraceFilter {
  trace_types?: TraceType[];
  statuses?: TraceStatus[];
  context_ids?: UUID[];
  execution_ids?: UUID[];
  date_range?: {
    start: Timestamp;
    end: Timestamp;
  };
  tags?: string[];
  has_errors?: boolean;
  min_duration_ms?: number;
  max_duration_ms?: number;
}

/**
 * 追踪导出选项接口
 */
export interface TraceExportOptions {
  format: 'json' | 'csv' | 'xml';
  include_events?: boolean;
  include_metrics?: boolean;
  date_range?: {
    start: Timestamp;
    end: Timestamp;
  };
  filter?: TraceFilter;
}
