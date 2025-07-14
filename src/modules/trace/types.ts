/**
 * MPLP Trace模块类型定义
 * 
 * @version v1.0.1
 * @created 2025-07-10T13:30:00+08:00
 * @compliance trace-protocol.json Schema v1.0.0 - 100%合规
 */

import { UUID, Timestamp } from '../../types';

/**
 * 追踪类型 - 严格匹配Schema定义
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
 */
export type TraceSeverity =
  | 'debug'         // 调试级别
  | 'info'          // 信息级别
  | 'warn'          // 警告级别
  | 'error'         // 错误级别
  | 'critical';     // 关键级别

/**
 * 事件类型 - 严格匹配Schema定义
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
 */
export type EventCategory =
  | 'system'        // 系统事件
  | 'user'          // 用户事件
  | 'external'      // 外部事件
  | 'automatic';    // 自动事件

/**
 * 错误类型 - 严格匹配Schema定义
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
 */
export type RecoveryActionType =
  | 'retry'         // 重试
  | 'fallback'      // 回退
  | 'escalate'      // 升级
  | 'ignore'        // 忽略
  | 'abort';        // 中止

/**
 * 关联类型 - 严格匹配Schema定义
 */
export type CorrelationType =
  | 'causation'     // 因果关联
  | 'temporal'      // 时间关联
  | 'spatial'       // 空间关联
  | 'logical';      // 逻辑关联

/**
 * 指标类型 - 严格匹配Schema定义
 */
export type MetricType =
  | 'counter'       // 计数器
  | 'gauge'         // 仪表盘
  | 'histogram'     // 直方图
  | 'summary';      // 摘要

/**
 * MPLP追踪数据 - 严格匹配Schema定义
 */
export interface MPLPTraceData {
  // 基础信息 - 必需字段
  protocol_version: string;    // 协议版本
  timestamp: string;           // ISO 8601时间戳
  trace_id: string;            // 追踪唯一标识符
  context_id: string;          // 上下文ID
  trace_type: TraceType;       // 追踪类型
  severity: TraceSeverity;     // 严重程度
  event: {                     // 事件信息
    type: EventType;           // 事件类型
    name: string;              // 事件名称
    description?: string;      // 事件描述
    category: EventCategory;   // 事件类别
    source: {                  // 事件源
      component: string;       // 组件名称
      module?: string;         // 模块名称
      function?: string;       // 函数名称
      line_number?: number;    // 行号
    };
    data?: Record<string, unknown>; // 事件数据
  };
  
  // 可选字段
  plan_id?: string;            // 计划ID
  task_id?: string;            // 任务ID
  performance_metrics?: {      // 性能指标
    execution_time?: {         // 执行时间
      start_time: string;      // 开始时间
      end_time?: string;       // 结束时间
      duration_ms: number;     // 持续时间(毫秒)
      cpu_time_ms?: number;    // CPU时间(毫秒)
    };
    resource_usage?: {         // 资源使用
      memory?: {               // 内存使用
        peak_usage_mb?: number;     // 峰值使用(MB)
        average_usage_mb?: number;  // 平均使用(MB)
        allocations?: number;       // 分配次数
        deallocations?: number;     // 释放次数
      };
      cpu?: {                  // CPU使用
        utilization_percent?: number; // 使用率(百分比)
        instructions?: number;        // 指令数
        cache_misses?: number;        // 缓存未命中
      };
      network?: {              // 网络使用
        bytes_sent?: number;        // 发送字节数
        bytes_received?: number;    // 接收字节数
        requests_count?: number;    // 请求数
        error_count?: number;       // 错误数
      };
      storage?: {              // 存储使用
        reads?: number;             // 读取次数
        writes?: number;            // 写入次数
        bytes_read?: number;        // 读取字节数
        bytes_written?: number;     // 写入字节数
      };
    };
    custom_metrics?: Record<string, {  // 自定义指标
      value: number | string | boolean; // 指标值
      unit?: string;                   // 单位
      type: MetricType;                // 指标类型
    }>;
  };
  context_snapshot?: {         // 上下文快照
    variables?: Record<string, unknown>;  // 变量
    environment?: {            // 环境信息
      os?: string;                  // 操作系统
      platform?: string;            // 平台
      runtime_version?: string;     // 运行时版本
      environment_variables?: Record<string, string>; // 环境变量
    };
    call_stack?: Array<{       // 调用堆栈
      function: string;             // 函数名
      file?: string;                // 文件名
      line?: number;                // 行号
      arguments?: Record<string, unknown>; // 参数
    }>;
  };
  error_information?: {        // 错误信息
    error_code: string;             // 错误代码
    error_message: string;          // 错误消息
    error_type: ErrorType;          // 错误类型
    stack_trace?: Array<{           // 堆栈跟踪
      file: string;                     // 文件名
      function: string;                 // 函数名
      line: number;                     // 行号
      column?: number;                  // 列号
    }>;
    recovery_actions?: Array<{      // 恢复操作
      action: RecoveryActionType;       // 操作类型
      description: string;              // 描述
      parameters?: Record<string, unknown>; // 参数
    }>;
  };
  decision_log?: {             // 决策日志
    decision_point: string;         // 决策点
    options_considered: Array<{     // 考虑的选项
      option: string;                   // 选项
      score: number;                    // 分数
      rationale?: string;               // 理由
      risk_factors?: string[];          // 风险因素
    }>;
    selected_option: string;        // 选中的选项
    decision_criteria?: Array<{     // 决策标准
      criterion: string;                // 标准
      weight: number;                   // 权重
      evaluation?: string;              // 评估
    }>;
    confidence_level?: number;      // 置信度
  };
  correlations?: Array<{       // 关联
    correlation_id: string;         // 关联ID
    type: CorrelationType;          // 关联类型
    related_trace_id: string;       // 关联的追踪ID
    strength?: number;              // 关联强度
    description?: string;           // 描述
  }>;
  
  // 运行时扩展字段 (非Schema定义)
  user_id?: string;            // 用户ID
  source?: string;             // 追踪来源
  status?: string;             // 追踪状态
  operation?: {                // 操作信息
    name: string;              // 操作名称
    duration_ms: number;       // 操作耗时
    details: Record<string, unknown>; // 操作详情
  };
  metadata?: Record<string, unknown>; // 元数据
}

/**
 * 追踪状态 - 运行时扩展 (非Schema定义)
 */
export type TraceStatus =
  | 'success'         // 成功
  | 'failure'         // 失败
  | 'warning'         // 警告
  | 'info'            // 信息
  | 'pending';        // 待处理

/**
 * 追踪过滤条件
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
 * 追踪指标类型
 */
export interface TraceMetrics {
  // 基础指标
  total_traces: number;
  traces_by_type: Record<TraceType, number>;
  traces_by_severity: Record<TraceSeverity, number>;
  
  // 性能指标
  avg_operation_duration_ms: number;
  p95_operation_duration_ms: number;
  p99_operation_duration_ms: number;
  
  // 错误指标
  error_count: number;
  error_rate: number;
  
  // 时间范围
  time_range: {
    start: string;
    end: string;
    duration_ms: number;
  };
}

/**
 * 追踪分析结果
 */
export interface TraceAnalysis {
  metrics: TraceMetrics;
  patterns: Array<{
    pattern_id: string;
    pattern_name: string;
    occurrence_count: number;
    confidence: number;
  }>;
  anomalies: Array<{
    anomaly_id: string;
    anomaly_type: string;
    severity: string;
    description: string;
    affected_traces: string[];
  }>;
  recommendations: string[];
}

/**
 * 追踪配置
 */
export interface TraceConfig {
  enabled: boolean;
  sampling_rate: number;
  batch_size: number;
  sync_interval_ms: number;
  retention_days: number;
  performance_thresholds: {
    warning_ms: number;
    critical_ms: number;
  };
}