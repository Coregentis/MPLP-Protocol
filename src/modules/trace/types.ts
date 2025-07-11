/**
 * MPLP Trace模块类型定义
 * 
 * @version v1.0.1
 * @created 2025-07-10T14:30:00+08:00
 * @compliance 完全匹配trace-protocol.json Schema v1.0.1
 */

// ===== 导入公共基础类型 =====
import type { UUID, Timestamp, Version, Priority } from '../../types/index';

// ===== 重新导出基础类型 (确保模块可访问) =====
export type { UUID, Timestamp, Version, Priority };

// ===== 协议版本常量 =====
export const PROTOCOL_VERSION = '1.0.1';

// ===== 默认值常量 =====
export const DEFAULT_SEVERITY: TraceSeverity = 'info';
export const DEFAULT_TRACE_TYPE: TraceType = 'execution';
export const DEFAULT_EVENT_CATEGORY: EventCategory = 'system';
export const DEFAULT_EVENT_TYPE: EventType = 'start';
export const DEFAULT_SAMPLING_RATE = 1.0;

// ===== 其他常量 =====
export const TRACE_CONSTANTS = {
  PROTOCOL_VERSION,
  MAX_EVENT_NAME_LENGTH: 255,
  MAX_ERROR_MESSAGE_LENGTH: 1000,
  MAX_BATCH_SIZE: 100,
  DEFAULT_FLUSH_INTERVAL_MS: 1000,
  DEFAULT_HISTORY_SIZE: 10000
};

// ===== Trace协议主接口 (Schema根节点) =====

/**
 * Trace协议主接口
 * 完全符合trace-protocol.json Schema规范
 */
export interface TraceProtocol {
  // Schema必需字段
  protocol_version: Version;
  timestamp: Timestamp;
  trace_id: UUID;
  context_id: UUID;
  plan_id?: UUID;
  task_id?: UUID;
  trace_type: TraceType;
  severity: TraceSeverity;
  event: TraceEvent;
  performance_metrics?: PerformanceMetrics;
  context_snapshot?: ContextSnapshot;
  error_information?: ErrorInformation;
  decision_log?: DecisionLog;
  correlations?: TraceCorrelation[];
}

// ===== 基础枚举类型 (Schema定义) =====

/**
 * 跟踪类型 (Schema定义)
 */
export type TraceType = 'execution' | 'monitoring' | 'audit' | 'performance' | 'error' | 'decision';

/**
 * 严重程度 (Schema定义)
 */
export type TraceSeverity = 'debug' | 'info' | 'warn' | 'error' | 'critical';

// ===== 事件结构 (Schema定义) =====

/**
 * 跟踪事件 (Schema定义)
 */
export interface TraceEvent {
  type: EventType;
  name: string;
  description?: string;
  category: EventCategory;
  source: EventSource;
  data?: Record<string, unknown>;
}

/**
 * 事件类型 (Schema定义)
 */
export type EventType = 'start' | 'progress' | 'checkpoint' | 'completion' | 'failure' | 'timeout' | 'interrupt';

/**
 * 事件类别 (Schema定义)
 */
export type EventCategory = 'system' | 'user' | 'external' | 'automatic';

/**
 * 事件源 (Schema定义)
 */
export interface EventSource {
  component: string;
  module?: string;
  function?: string;
  line_number?: number;
}

// ===== 性能指标 (Schema定义) =====

/**
 * 性能指标 (Schema定义)
 */
export interface PerformanceMetrics {
  execution_time?: ExecutionTime;
  resource_usage?: ResourceUsage;
  custom_metrics?: Record<string, CustomMetric>;
}

/**
 * 执行时间 (Schema定义)
 */
export interface ExecutionTime {
  start_time: Timestamp;
  end_time?: Timestamp;
  duration_ms: number;
  cpu_time_ms?: number;
}

/**
 * 资源使用情况 (Schema定义)
 */
export interface ResourceUsage {
  memory?: MemoryUsage;
  cpu?: CpuUsage;
  network?: NetworkUsage;
  storage?: StorageUsage;
}

/**
 * 内存使用 (Schema定义)
 */
export interface MemoryUsage {
  peak_usage_mb?: number;
  average_usage_mb?: number;
  allocations?: number;
  deallocations?: number;
}

/**
 * CPU使用 (Schema定义)
 */
export interface CpuUsage {
  utilization_percent?: number;
  instructions?: number;
  cache_misses?: number;
}

/**
 * 网络使用 (Schema定义)
 */
export interface NetworkUsage {
  bytes_sent?: number;
  bytes_received?: number;
  requests_count?: number;
  error_count?: number;
}

/**
 * 存储使用 (Schema定义)
 */
export interface StorageUsage {
  reads?: number;
  writes?: number;
  bytes_read?: number;
  bytes_written?: number;
}

/**
 * 自定义指标 (Schema定义)
 */
export interface CustomMetric {
  value: number | string | boolean;
  unit?: string;
  type: MetricType;
}

/**
 * 指标类型 (Schema定义)
 */
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

// ===== 上下文快照 (Schema定义) =====

/**
 * 上下文快照 (Schema定义)
 */
export interface ContextSnapshot {
  variables?: Record<string, unknown>;
  environment?: Environment;
  call_stack?: CallStackFrame[];
}

/**
 * 环境信息 (Schema定义)
 */
export interface Environment {
  os?: string;
  platform?: string;
  runtime_version?: string;
  environment_variables?: Record<string, string>;
}

/**
 * 调用堆栈帧 (Schema定义)
 */
export interface CallStackFrame {
  function: string;
  file?: string;
  line?: number;
  arguments?: Record<string, unknown>;
}

// ===== 错误信息 (Schema定义) =====

/**
 * 错误信息 (Schema定义)
 */
export interface ErrorInformation {
  error_code: string;
  error_message: string;
  error_type: ErrorType;
  stack_trace?: StackTraceFrame[];
  recovery_actions?: RecoveryAction[];
}

/**
 * 错误类型 (Schema定义)
 */
export type ErrorType = 'system' | 'business' | 'validation' | 'network' | 'timeout' | 'security';

/**
 * 堆栈跟踪帧 (Schema定义)
 */
export interface StackTraceFrame {
  file: string;
  function: string;
  line: number;
  column?: number;
}

/**
 * 恢复操作 (Schema定义)
 */
export interface RecoveryAction {
  action: RecoveryActionType;
  description: string;
  parameters?: Record<string, unknown>;
}

/**
 * 恢复操作类型 (Schema定义)
 */
export type RecoveryActionType = 'retry' | 'fallback' | 'escalate' | 'ignore' | 'abort';

// ===== 决策日志 (Schema定义) =====

/**
 * 决策日志 (Schema定义)
 */
export interface DecisionLog {
  decision_point: string;
  options_considered: DecisionOption[];
  selected_option: string;
  decision_criteria?: DecisionCriterion[];
  confidence_level?: number;
}

/**
 * 决策选项 (Schema定义)
 */
export interface DecisionOption {
  option: string;
  score: number;
  rationale?: string;
  risk_factors?: string[];
}

/**
 * 决策标准 (Schema定义)
 */
export interface DecisionCriterion {
  criterion: string;
  weight: number;
  evaluation?: string;
}

// ===== 追踪关联 (Schema定义) =====

/**
 * 追踪关联 (Schema定义)
 */
export interface TraceCorrelation {
  correlation_id: UUID;
  type: CorrelationType;
  related_trace_id: UUID;
  strength?: number;
  description?: string;
}

/**
 * 关联类型 (Schema定义)
 */
export type CorrelationType = 'causation' | 'temporal' | 'spatial' | 'logical';

// ===== 请求/响应接口 =====

/**
 * 创建追踪请求接口
 */
export interface CreateTraceRequest {
  context_id: UUID;
  plan_id?: UUID;
  task_id?: UUID;
  trace_type: TraceType;
  severity: TraceSeverity;
  event: TraceEvent;
  performance_metrics?: Partial<PerformanceMetrics>;
  context_snapshot?: Partial<ContextSnapshot>;
  error_information?: Partial<ErrorInformation>;
  decision_log?: Partial<DecisionLog>;
}

/**
 * 更新追踪请求接口
 */
export interface UpdateTraceRequest {
  trace_id: UUID;
  severity?: TraceSeverity;
  event?: Partial<TraceEvent>;
  performance_metrics?: Partial<PerformanceMetrics>;
  context_snapshot?: Partial<ContextSnapshot>;
  error_information?: Partial<ErrorInformation>;
  decision_log?: Partial<DecisionLog>;
  correlations?: Partial<TraceCorrelation>[];
}

/**
 * 追踪过滤器接口
 */
export interface TraceFilter {
  trace_ids?: UUID[];
  context_ids?: UUID[];
  plan_ids?: UUID[];
  task_ids?: UUID[];
  trace_types?: TraceType[];
  severities?: TraceSeverity[];
  event_types?: EventType[];
  event_categories?: EventCategory[];
  error_types?: ErrorType[];
  created_after?: Timestamp;
  created_before?: Timestamp;
  has_errors?: boolean;
  correlation_types?: CorrelationType[];
}

/**
 * 追踪操作结果接口
 */
export interface TraceOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  execution_time_ms?: number;
}

/**
 * 批量追踪请求接口
 */
export interface BatchTraceRequest {
  traces: CreateTraceRequest[];
  batch_options?: BatchTraceOptions;
}

/**
 * 批量追踪选项接口
 */
export interface BatchTraceOptions {
  parallel_processing: boolean;
  stop_on_error: boolean;
  max_concurrent: number;
  timeout_ms: number;
}

/**
 * 追踪配置接口
 */
export interface TraceConfiguration {
  collection_enabled: boolean;
  performance_monitoring_enabled: boolean;
  error_tracking_enabled: boolean;
  decision_logging_enabled: boolean;
  correlation_analysis_enabled: boolean;
  sampling_settings: {
    enabled: boolean;
    rate: number;
    adaptive_sampling: boolean;
  };
  storage_settings: {
    retention_days: number;
    compression_enabled: boolean;
    archival_enabled: boolean;
  };
  privacy_settings: {
    pii_masking_enabled: boolean;
    sensitive_data_exclusion: string[];
    anonymization_level: AnonymizationLevel;
  };
}

/**
 * 匿名化级别
 */
export type AnonymizationLevel = 'none' | 'basic' | 'advanced' | 'full';

// ===== 服务接口 =====

/**
 * 追踪仓库接口
 */
export interface ITraceRepository {
  save(trace: TraceProtocol): Promise<TraceOperationResult<TraceProtocol>>;
  findById(traceId: UUID): Promise<TraceOperationResult<TraceProtocol>>;
  findByFilter(filter: TraceFilter): Promise<TraceOperationResult<TraceProtocol[]>>;
  update(traceId: UUID, updates: UpdateTraceRequest): Promise<TraceOperationResult<TraceProtocol>>;
  delete(traceId: UUID): Promise<TraceOperationResult<boolean>>;
  correlate(sourceTraceId: UUID, correlation: TraceCorrelation): Promise<TraceOperationResult<void>>;
  saveMany(traces: TraceProtocol[]): Promise<TraceOperationResult<TraceProtocol[]>>;
  count(filter?: TraceFilter): Promise<TraceOperationResult<number>>;
}

/**
 * 追踪验证器接口
 */
export interface ITraceValidator {
  validateTrace(trace: Partial<TraceProtocol>): ValidationResult;
  validateEvent(event: TraceEvent): ValidationResult;
  validatePerformanceMetrics(metrics: PerformanceMetrics): ValidationResult;
  validateCorrelation(correlation: TraceCorrelation): ValidationResult;
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * 验证错误接口
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'critical';
}

/**
 * 验证警告接口
 */
export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  suggestion?: string;
}

/**
 * 追踪错误代码枚举
 */
export enum TraceErrorCode {
  TRACE_NOT_FOUND = 'TRACE_NOT_FOUND',
  TRACE_ALREADY_EXISTS = 'TRACE_ALREADY_EXISTS',
  INVALID_TRACE_DATA = 'INVALID_TRACE_DATA',
  INVALID_EVENT_DATA = 'INVALID_EVENT_DATA',
  INVALID_PERFORMANCE_METRICS = 'INVALID_PERFORMANCE_METRICS',
  INVALID_CORRELATION_DATA = 'INVALID_CORRELATION_DATA',
  CORRELATION_NOT_FOUND = 'CORRELATION_NOT_FOUND',
  BATCH_OPERATION_FAILED = 'BATCH_OPERATION_FAILED',
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  CONTEXT_NOT_FOUND = 'CONTEXT_NOT_FOUND',
  PLAN_NOT_FOUND = 'PLAN_NOT_FOUND',
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  ACCESS_DENIED = 'ACCESS_DENIED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}