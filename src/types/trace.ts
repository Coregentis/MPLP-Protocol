/**
 * Trace Types - 追踪相关类型定义 - 厂商中立设计
 * 
 * 定义了MPLP追踪系统中使用的所有类型，
 * 确保与trace-protocol.json Schema定义完全一致，支持厂商中立原则。
 * 
 * @version v2.1.1
 * @created 2025-01-09T25:10:00+08:00
 * @updated 2025-08-15T19:30:00+08:00
 * @description 统一的追踪类型定义，与modules/trace/types.ts保持同步
 * @compliance .cursor/rules/development-standards.mdc - 厂商中立原则
 * @compliance .cursor/rules/schema-standards.mdc - Schema驱动开发原则
 * @schema_path trace-protocol.json
 */

import { BaseProtocol } from './index';

/**
 * 追踪类型枚举
 * 
 * @schema_path #/properties/trace_type
 */
export type TraceType = 'operation' | 'request' | 'event' | 'error';

/**
 * 追踪状态枚举
 * 
 * @schema_path #/properties/status
 */
export type TraceStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

/**
 * 事件类型枚举
 * 
 * @schema_path #/properties/events/items/properties/event_type
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
 * 操作详情接口
 * 
 * @schema_path #/properties/operation
 */
export interface OperationDetail {
  /**
   * 操作名称
   */
  name: string;
  
  /**
   * 操作类型
   */
  type: string;
  
  /**
   * 操作持续时间(毫秒)
   */
  duration_ms: number;
  
  /**
   * 操作状态
   */
  status: string;
  
  /**
   * 操作时间戳 (ISO 8601格式)
   */
  timestamp: string;
}

/**
 * 上下文快照接口
 * 
 * @schema_path #/properties/context_snapshot
 */
export interface ContextSnapshot {
  /**
   * 上下文变量
   */
  variables: Record<string, unknown>;
  
  /**
   * 调用堆栈
   */
  call_stack: Array<{
    /**
     * 文件路径
     */
    file: string;
    
    /**
     * 行号
     */
    line: number;
    
    /**
     * 函数名
     */
    function: string;
  }>;
}

/**
 * 错误详情接口
 * 
 * @schema_path #/properties/error_information
 */
export interface ErrorInformation {
  /**
   * 错误类型
   */
  error_type: string;
  
  /**
   * 错误消息
   */
  error_message: string;
  
  /**
   * 堆栈跟踪
   */
  stack_trace: Array<{
    /**
     * 文件路径
     */
    file: string;
    
    /**
     * 行号
     */
    line: number;
    
    /**
     * 函数名
     */
    function: string;
  }>;
  
  /**
   * 错误时间戳 (ISO 8601格式)
   */
  timestamp: string;
}

/**
 * 性能指标接口
 * 
 * @schema_path #/properties/performance_metrics
 */
export interface PerformanceMetrics {
  /**
   * CPU使用率 (0-100)
   */
  cpu_usage: number;
  
  /**
   * 内存使用量 (MB)
   */
  memory_usage_mb: number;
  
  /**
   * 网络IO字节数
   */
  network_io_bytes: number;
  
  /**
   * 磁盘IO字节数
   */
  disk_io_bytes: number;
  
  /**
   * 数据库查询次数 (可选)
   */
  db_query_count?: number;
  
  /**
   * 数据库查询总时间 (可选)
   */
  db_query_time_ms?: number;
  
  /**
   * API调用次数 (可选)
   */
  api_call_count?: number;
  
  /**
   * API调用总时间 (可选)
   */
  api_call_time_ms?: number;
  
  /**
   * 资源使用详情
   */
  resource_usage?: {
    /**
     * 内存使用详情
     */
    memory: {
      /**
       * 峰值内存使用 (MB)
       */
      peak_usage_mb: number;
      
      /**
       * 平均内存使用 (MB)
       */
      average_usage_mb: number;
      
      /**
       * GC次数
       */
      gc_count: number;
    };
    
    /**
     * CPU使用详情
     */
    cpu: {
      /**
       * 峰值CPU使用率 (%)
       */
      peak_usage_percent: number;
      
      /**
       * 平均CPU使用率 (%)
       */
      average_usage_percent: number;
    };
    
    /**
     * 网络使用详情
     */
    network: {
      /**
       * 总传输字节数
       */
      total_bytes: number;
      
      /**
       * 请求数量
       */
      request_count: number;
    };
  };
}

/**
 * 错误信息接口
 * 
 * @schema_path #/properties/error_info
 */
export interface ErrorInfo {
  /**
   * 错误类型
   */
  error_type: string;
  
  /**
   * 错误消息
   */
  error_message: string;
  
  /**
   * 堆栈跟踪
   */
  stack_trace: string;
  
  /**
   * 错误发生时间 (ISO 8601格式)
   */
  timestamp: string;
}

/**
 * 追踪事件接口
 * 
 * @schema_path #/properties/events/items
 */
export interface TraceEvent {
  /**
   * 事件唯一标识
   */
  event_id: string;
  
  /**
   * ISO 8601时间戳
   */
  timestamp: string;
  
  /**
   * 事件类型
   */
  event_type: EventType;
  
  /**
   * 操作名称
   */
  operation_name: string;
  
  /**
   * 事件数据
   */
  data: Record<string, unknown>;
  
  /**
   * 事件持续时间 (毫秒)
   */
  duration_ms: number;
}

/**
 * 基础追踪数据接口
 * 
 * @schema_path #/
 */
export interface TraceData extends BaseProtocol {
  /**
   * 追踪唯一标识
   */
  trace_id: string;
  
  /**
   * 关联的上下文ID
   */
  context_id: string;
  
  /**
   * 操作名称
   */
  operation_name: string;
  
  /**
   * 开始时间 (ISO 8601格式)
   */
  start_time: string;
  
  /**
   * 结束时间 (ISO 8601格式)
   */
  end_time: string;
  
  /**
   * 持续时间 (毫秒)
   */
  duration_ms: number;
  
  /**
   * 追踪类型
   */
  trace_type: TraceType;
  
  /**
   * 追踪状态
   */
  status: TraceStatus;
  
  /**
   * 元数据
   */
  metadata: Record<string, unknown>;
  
  /**
   * 事件列表
   */
  events: TraceEvent[];
  
  /**
   * 性能指标
   */
  performance_metrics: PerformanceMetrics;
  
  /**
   * 错误信息
   */
  error_info: ErrorInfo | null;
  
  /**
   * 父追踪ID
   */
  parent_trace_id: string | null;
  
  /**
   * 标签 (可选)
   */
  tags?: Record<string, unknown>;
  
  /**
   * 错误消息 (可选)
   */
  error_message?: string;
  
  /**
   * 结果数据 (可选)
   */
  result_data?: unknown;
}

/**
 * 适配器元数据接口 - 厂商中立命名
 * 
 * @schema_path #/properties/adapter_metadata
 */
export interface AdapterMetadata {
  /**
   * 代理ID
   */
  agent_id: string;
  
  /**
   * 会话ID
   */
  session_id: string;
  
  /**
   * 操作复杂度
   */
  operation_complexity: 'low' | 'medium' | 'high';
  
  /**
   * 预期持续时间 (毫秒)
   */
  expected_duration_ms: number;
  
  /**
   * 质量门禁
   */
  quality_gates: QualityGates;
}

/**
 * 质量门禁接口
 * 
 * @schema_path #/properties/adapter_metadata/properties/quality_gates
 */
export interface QualityGates {
  /**
   * 最大持续时间 (毫秒)
   */
  max_duration_ms: number;
  
  /**
   * 最大内存使用 (MB)
   */
  max_memory_mb: number;
  
  /**
   * 最大错误率
   */
  max_error_rate: number;
  
  /**
   * 必需事件
   */
  required_events: EventType[];
}

/**
 * MPLP追踪数据接口 (扩展基础追踪数据)
 * 
 * @schema_path #/
 */
export interface MPLPTraceData extends TraceData {
  /**
   * 适配器元数据 - 厂商中立命名
   */
  adapter_metadata: AdapterMetadata;
  
  /**
   * 追踪来源 (可选)
   */
  source?: string;
  
  /**
   * 操作详情 (可选)
   */
  operation?: OperationDetail;
  
  /**
   * 上下文快照 (可选)
   */
  context_snapshot?: ContextSnapshot;
  
  /**
   * 错误详情 (可选)
   */
  error_information?: ErrorInformation;
}

/**
 * 追踪配置接口
 */
export interface TracingOptions {
  /**
   * 是否启用追踪
   */
  enabled?: boolean;
  
  /**
   * 批处理大小
   */
  batchSize?: number;
  
  /**
   * 刷新间隔 (毫秒)
   */
  flushInterval?: number;
  
  /**
   * 最大历史记录大小
   */
  maxHistorySize?: number;
  
  /**
   * 性能阈值
   */
  performanceThresholds?: {
    /**
     * 警告阈值
     */
    warning: number;
    
    /**
     * 严重阈值
     */
    critical: number;
  };
}

/**
 * 追踪操作结果接口
 */
export interface TraceOperationResult {
  /**
   * 是否成功
   */
  success: boolean;
  
  /**
   * 追踪ID
   */
  trace_id: string;
  
  /**
   * 持续时间 (毫秒)
   */
  duration_ms?: number;
  
  /**
   * 性能指标
   */
  performance_metrics?: PerformanceMetrics;
  
  /**
   * 性能分析
   */
  performance_analysis?: PerformanceAnalysis;
  
  /**
   * 错误信息
   */
  error?: string;
}

/**
 * 性能分析接口
 */
export interface PerformanceAnalysis {
  /**
   * 评级
   */
  rating: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
  
  /**
   * 实际持续时间 (毫秒)
   */
  duration_ms: number;
  
  /**
   * 预测持续时间 (毫秒)
   */
  predicted_ms: number;
  
  /**
   * 偏差百分比
   */
  variance_percent: number;
  
  /**
   * 优化建议
   */
  recommendations: string[];
  
  /**
   * 质量分数 (0-100)
   */
  quality_score: number;
}

/**
 * 追踪查询接口
 */
export interface TraceQuery {
  /**
   * 上下文ID筛选
   */
  context_id?: string;
  
  /**
   * 操作名称筛选
   */
  operation_name?: string;
  
  /**
   * 状态筛选
   */
  status?: TraceStatus;
  
  /**
   * 类型筛选
   */
  trace_type?: TraceType;
  
  /**
   * 开始时间范围 (ISO 8601格式)
   */
  start_time?: string;
  
  /**
   * 结束时间范围 (ISO 8601格式)
   */
  end_time?: string;
  
  /**
   * 最小持续时间 (毫秒)
   */
  min_duration?: number;
  
  /**
   * 最大持续时间 (毫秒)
   */
  max_duration?: number;
  
  /**
   * 返回数量限制
   */
  limit?: number;
  
  /**
   * 偏移量
   */
  offset?: number;
}

/**
 * 类型守卫：检查对象是否为TraceData
 * 
 * @param obj 要检查的对象
 * @returns 是否为TraceData类型
 */
export function isTraceData(obj: unknown): obj is TraceData {
  if (!obj || typeof obj !== 'object') return false;
  
  const data = obj as Partial<TraceData>;
  return (
    typeof data.trace_id === 'string' &&
    typeof data.operation_name === 'string' &&
    typeof data.start_time === 'string' &&
    typeof data.end_time === 'string' &&
    typeof data.duration_ms === 'number' &&
    Array.isArray(data.events)
  );
}

/**
 * 类型守卫：检查对象是否为MPLPTraceData
 * 
 * @param obj 要检查的对象
 * @returns 是否为MPLPTraceData类型
 */
export function isMPLPTraceData(obj: unknown): obj is MPLPTraceData {
  if (!isTraceData(obj)) return false;
  
  const data = obj as Partial<MPLPTraceData>;
  return (
    data.adapter_metadata !== undefined &&
    typeof data.adapter_metadata === 'object' &&
    data.adapter_metadata !== null
  );
}

/**
 * 类型守卫：检查对象是否为TraceEvent
 * 
 * @param obj 要检查的对象
 * @returns 是否为TraceEvent类型
 */
export function isTraceEvent(obj: unknown): obj is TraceEvent {
  if (!obj || typeof obj !== 'object') return false;
  
  const event = obj as Partial<TraceEvent>;
  return (
    typeof event.event_id === 'string' &&
    typeof event.timestamp === 'string' &&
    typeof event.event_type === 'string' &&
    typeof event.operation_name === 'string' &&
    typeof event.duration_ms === 'number' &&
    event.data !== undefined &&
    typeof event.data === 'object'
  );
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