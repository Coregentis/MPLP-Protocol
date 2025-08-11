/**
 * MPLP Trace模块类型定义
 * 
 * @version v1.1.0
 * @created 2025-07-10T13:30:00+08:00
 * @updated 2025-08-12T16:30:00+08:00
 * @compliance trace-protocol.json Schema v1.0.1 - 100%合规
 * @description 定义Trace模块的所有类型，严格匹配Schema
 */

/**
 * 追踪类型 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/trace_type
 */
export type TraceType = 
  | 'execution'     // 执行追踪
  | 'monitoring'    // 监控追踪
  | 'audit'         // 审计追踪
  | 'performance'   // 性能追踪
  | 'error'         // 错误追踪
  | 'decision';     // 决策追踪

/**
 * 追踪严重程度 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/severity
 */
export type TraceSeverity =
  | 'debug'         // 调试级别
  | 'info'          // 信息级别
  | 'warn'          // 警告级别
  | 'error'         // 错误级别
  | 'critical';     // 关键级别

/**
 * 事件类型 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/event/properties/type
 */
export type EventType =
  | 'start'         // 开始事件
  | 'progress'      // 进度事件
  | 'checkpoint'    // 检查点事件
  | 'completion'    // 完成事件
  | 'failure'       // 失败事件
  | 'timeout'       // 超时事件
  | 'interrupt';    // 中断事件

/**
 * 事件类别 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/event/properties/category
 */
export type EventCategory =
  | 'system'        // 系统事件
  | 'user'          // 用户事件
  | 'external'      // 外部事件
  | 'automatic';    // 自动事件

/**
 * 错误类型 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/error_information/properties/error_type
 */
export type ErrorType =
  | 'system'        // 系统错误
  | 'business'      // 业务错误
  | 'validation'    // 验证错误
  | 'network'       // 网络错误
  | 'timeout'       // 超时错误
  | 'security';     // 安全错误

/**
 * 恢复操作类型 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/error_information/properties/recovery_actions/items/properties/action
 */
export type RecoveryActionType =
  | 'retry'         // 重试
  | 'fallback'      // 回退
  | 'escalate'      // 升级
  | 'ignore'        // 忽略
  | 'abort';        // 中止

/**
 * 关联类型 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/correlations/items/properties/type
 */
export type CorrelationType =
  | 'causation'     // 因果关联
  | 'temporal'      // 时间关联
  | 'spatial'       // 空间关联
  | 'logical';      // 逻辑关联

/**
 * 指标类型 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/performance_metrics/properties/custom_metrics/additionalProperties/properties/type
 */
export type MetricType =
  | 'counter'       // 计数器
  | 'gauge'         // 仪表盘
  | 'histogram'     // 直方图
  | 'summary';      // 摘要

/**
 * 事件源 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/event/properties/source
 */
export interface EventSource {
  component: string;       // 组件名称 (必需)
  module?: string;         // 模块名称
  function?: string;       // 函数名称
  line_number?: number;    // 行号
}

/**
 * 事件信息 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/event
 */
export interface TraceEvent {
  type: EventType;                     // 事件类型 (必需)
  name: string;                        // 事件名称 (必需)
  description?: string;                // 事件描述
  category: EventCategory;             // 事件类别 (必需)
  source: EventSource;                 // 事件源 (必需)
  data?: Record<string, unknown>;      // 事件数据
}

/**
 * 执行时间 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/performance_metrics/properties/execution_time
 */
export interface ExecutionTime {
  start_time: string;      // 开始时间 (必需)
  end_time?: string;       // 结束时间
  duration_ms: number;     // 持续时间(毫秒) (必需)
  cpu_time_ms?: number;    // CPU时间(毫秒)
}

/**
 * 内存使用 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/performance_metrics/properties/resource_usage/properties/memory
 */
export interface MemoryUsage {
  peak_usage_mb?: number;      // 峰值使用(MB)
  average_usage_mb?: number;   // 平均使用(MB)
  allocations?: number;        // 分配次数
  deallocations?: number;      // 释放次数
}

/**
 * CPU使用 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/performance_metrics/properties/resource_usage/properties/cpu
 */
export interface CPUUsage {
  utilization_percent?: number;  // 使用率(百分比)
  instructions?: number;         // 指令数
  cache_misses?: number;         // 缓存未命中
}

/**
 * 网络使用 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/performance_metrics/properties/resource_usage/properties/network
 */
export interface NetworkUsage {
  bytes_sent?: number;           // 发送字节数
  bytes_received?: number;       // 接收字节数
  requests_count?: number;       // 请求数
  error_count?: number;          // 错误数
}

/**
 * 存储使用 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/performance_metrics/properties/resource_usage/properties/storage
 */
export interface StorageUsage {
  reads?: number;                // 读取次数
  writes?: number;               // 写入次数
  bytes_read?: number;           // 读取字节数
  bytes_written?: number;        // 写入字节数
}

/**
 * 资源使用 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/performance_metrics/properties/resource_usage
 */
export interface ResourceUsage {
  memory?: MemoryUsage;          // 内存使用
  cpu?: CPUUsage;                // CPU使用
  network?: NetworkUsage;        // 网络使用
  storage?: StorageUsage;        // 存储使用
}

/**
 * 自定义指标 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/performance_metrics/properties/custom_metrics/additionalProperties
 */
export interface CustomMetric {
  value: number | string | boolean;  // 指标值 (必需)
  unit?: string;                     // 单位
  type: MetricType;                  // 指标类型 (必需)
}

/**
 * 性能指标 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/performance_metrics
 */
export interface PerformanceMetrics {
  execution_time?: ExecutionTime;                // 执行时间
  resource_usage?: ResourceUsage;                // 资源使用
  custom_metrics?: Record<string, CustomMetric>; // 自定义指标
}

/**
 * 环境信息 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/context_snapshot/properties/environment
 */
export interface EnvironmentInfo {
  os?: string;                                   // 操作系统
  platform?: string;                             // 平台
  runtime_version?: string;                      // 运行时版本
  environment_variables?: Record<string, string>; // 环境变量
}

/**
 * 调用堆栈项 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/context_snapshot/properties/call_stack/items
 */
export interface CallStackItem {
  function: string;                              // 函数名 (必需)
  file?: string;                                 // 文件名
  line?: number;                                 // 行号
  arguments?: Record<string, unknown>;           // 参数
}

/**
 * 上下文快照 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/context_snapshot
 */
export interface ContextSnapshot {
  variables?: Record<string, unknown>;           // 变量
  environment?: EnvironmentInfo;                 // 环境信息
  call_stack?: CallStackItem[];                  // 调用堆栈
}

/**
 * 堆栈跟踪项 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/error_information/properties/stack_trace/items
 */
export interface StackTraceItem {
  file: string;                                  // 文件名 (必需)
  function: string;                              // 函数名 (必需)
  line: number;                                  // 行号 (必需)
  column?: number;                               // 列号
}

/**
 * 恢复操作 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/error_information/properties/recovery_actions/items
 */
export interface RecoveryAction {
  action: RecoveryActionType;                    // 操作类型 (必需)
  description: string;                           // 描述 (必需)
  parameters?: Record<string, unknown>;          // 参数
}

/**
 * 错误信息 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/error_information
 */
export interface ErrorInformation {
  error_code: string;                            // 错误代码 (必需)
  error_message: string;                         // 错误消息 (必需)
  error_type: ErrorType;                         // 错误类型 (必需)
  stack_trace?: StackTraceItem[];                // 堆栈跟踪
  recovery_actions?: RecoveryAction[];           // 恢复操作
}

/**
 * 决策选项 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/decision_log/properties/options_considered/items
 */
export interface DecisionOption {
  option: string;                                // 选项 (必需)
  score: number;                                 // 分数 (必需)
  rationale?: string;                            // 理由
  risk_factors?: string[];                       // 风险因素
}

/**
 * 决策标准 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/decision_log/properties/decision_criteria/items
 */
export interface DecisionCriterion {
  criterion: string;                             // 标准 (必需)
  weight: number;                                // 权重 (必需)
  evaluation?: string;                           // 评估
}

/**
 * 决策日志 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/decision_log
 */
export interface DecisionLog {
  decision_point: string;                        // 决策点 (必需)
  options_considered: DecisionOption[];          // 考虑的选项 (必需)
  selected_option: string;                       // 选中的选项 (必需)
  decision_criteria?: DecisionCriterion[];       // 决策标准
  confidence_level?: number;                     // 置信度
}

/**
 * 关联 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/correlations/items
 */
export interface Correlation {
  correlation_id: string;                        // 关联ID (必需)
  type: CorrelationType;                         // 关联类型 (必需)
  related_trace_id: string;                      // 关联的追踪ID (必需)
  strength?: number;                             // 关联强度
  description?: string;                          // 描述
}

/**
 * MPLP追踪数据 - 严格匹配Schema定义
 * @schema trace-protocol.json
 */
export interface MPLPTraceData {
  // 基础信息 - 必需字段
  protocolVersion: string;                      // 协议版本 (必需)
  timestamp: string;                             // ISO 8601时间戳 (必需)
  traceId: string;                              // 追踪唯一标识符 (必需)
  contextId: string;                            // 上下文ID (必需)
  traceType: TraceType;                         // 追踪类型 (必需)
  severity: TraceSeverity;                       // 严重程度 (必需)
  event: TraceEvent;                             // 事件信息 (必需)
  
  // 可选字段
  planId?: string;                              // 计划ID
  taskId?: string;                              // 任务ID
  performanceMetrics?: PerformanceMetrics;      // 性能指标
  contextSnapshot?: ContextSnapshot;            // 上下文快照
  errorInformation?: ErrorInformation;          // 错误信息
  decisionLog?: DecisionLog;                    // 决策日志
  correlations?: Correlation[];                  // 关联
  
  // 运行时扩展字段 (非Schema定义)
  /**
   * @note 以下字段为运行时扩展，非Schema原始定义，用于增强功能
   */
  userId?: string;                              // 用户ID
  source?: string;                               // 追踪来源
  status?: TraceStatus;                          // 追踪状态
  operation?: {                                  // 操作信息
    name: string;                                // 操作名称
    duration_ms: number;                         // 操作耗时
    details: Record<string, unknown>;            // 操作详情
  };
  metadata?: Record<string, unknown>;            // 元数据
}

/**
 * 追踪元数据 - 严格匹配Schema定义
 * @schema trace-protocol.json#/properties/metadata
 */
export type TraceMetadata = Record<string, unknown>;

/**
 * 追踪状态 - 运行时扩展 (非Schema定义)
 * @note 此类型为运行时扩展，不在trace-protocol.json Schema中定义
 */
export type TraceStatus =
  | 'success'         // 成功
  | 'failure'         // 失败
  | 'warning'         // 警告
  | 'info'            // 信息
  | 'pending';        // 待处理

/**
 * 追踪过滤条件
 * @note 用于查询追踪数据，非Schema定义
 */
export interface TraceFilter {
  trace_ids?: string[];            // 追踪ID列表
  context_ids?: string[];          // 上下文ID列表
  plan_ids?: string[];             // 计划ID列表
  task_ids?: string[];             // 任务ID列表
  user_ids?: string[];             // 用户ID列表
  trace_types?: TraceType[];       // 追踪类型列表
  severities?: TraceSeverity[];    // 严重程度列表
  event_types?: EventType[];       // 事件类型列表
  error_types?: ErrorType[];       // 错误类型列表
  statuses?: TraceStatus[];        // 追踪状态列表 (运行时扩展)
  start_time?: string;             // 开始时间
  end_time?: string;               // 结束时间
  limit?: number;                  // 限制数量
  offset?: number;                 // 偏移量
}

/**
 * 追踪操作结果
 * @note 用于表示操作结果，非Schema定义
 */
export interface TraceOperationResult<T = unknown> {
  success: boolean;               // 操作是否成功
  data?: T;                       // 返回数据
  error?: {                       // 错误信息
    code: string;                 // 错误代码
    message: string;              // 错误消息
    details?: unknown;            // 错误详情
  };
  execution_time_ms?: number;     // 执行时间(毫秒)
}

/**
 * 追踪指标
 * @note 用于统计分析，非Schema定义
 */
export interface TraceMetrics {
  // 基础指标
  total_traces: number;                         // 追踪总数
  traces_by_type: Record<TraceType, number>;    // 按类型统计的追踪数
  traces_by_severity: Record<TraceSeverity, number>; // 按严重程度统计的追踪数
  
  // 性能指标
  avg_operation_duration_ms: number;            // 平均操作时长(毫秒)
  p95_operation_duration_ms: number;            // 95%操作时长(毫秒)
  p99_operation_duration_ms: number;            // 99%操作时长(毫秒)
  
  // 错误指标
  error_count: number;                          // 错误数量
  error_rate: number;                           // 错误率
  
  // 时间范围
  time_range: {
    start: string;                              // 开始时间
    end: string;                                // 结束时间
    duration_ms: number;                        // 持续时间(毫秒)
  };
}

/**
 * 追踪分析
 * @note 用于高级分析，非Schema定义
 */
export interface TraceAnalysis {
  metrics: TraceMetrics;                       // 基础指标
  patterns: Array<{                            // 识别的模式
    pattern_id: string;                        // 模式ID
    pattern_name: string;                      // 模式名称
    occurrence_count: number;                  // 出现次数
    confidence: number;                        // 置信度
  }>;
  anomalies: Array<{                           // 发现的异常
    anomaly_id: string;                        // 异常ID
    anomaly_type: string;                      // 异常类型
    severity: string;                          // 严重程度
    description: string;                       // 描述
    affected_traces: string[];                 // 受影响的追踪
  }>;
  recommendations: string[];                   // 改进建议
}

/**
 * 追踪配置
 * @note 用于配置追踪模块，非Schema定义
 */
export interface TraceConfig {
  enabled: boolean;                            // 是否启用
  sampling_rate: number;                       // 采样率
  batch_size: number;                          // 批处理大小
  sync_interval_ms: number;                    // 同步间隔(毫秒)
  retention_days: number;                      // 保留天数
  performance_thresholds: {                    // 性能阈值
    warning_ms: number;                        // 警告阈值(毫秒)
    critical_ms: number;                       // 严重阈值(毫秒)
  };
}

/**
 * 创建追踪请求（内部camelCase版本）
 * @note 用于TraceMapper.fromSchema的返回类型，遵循TypeScript层camelCase约定
 */
export interface CreateTraceRequestInternal {
  traceId?: string;                            // 追踪ID（可选，通常由工厂生成）
  contextId: string;                           // 上下文ID
  planId?: string;                             // 计划ID（可选）
  traceType: TraceType;                        // 追踪类型
  severity: TraceSeverity;                     // 严重程度
  event: TraceEvent;                           // 事件信息
  timestamp?: string;                          // 时间戳（可选）
  performanceMetrics?: PerformanceMetrics;     // 性能指标（可选）
  errorInformation?: ErrorInformation;         // 错误信息（可选）
  correlations?: Correlation[];                // 关联关系（可选）
  metadata?: Record<string, unknown>;          // 元数据（可选）
}