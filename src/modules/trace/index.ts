/**
 * MPLP Trace模块导出文件
 * 完全符合trace-protocol.json Schema规范
 * 
 * @version 1.0.1
 * @created 2025-07-10T14:30:00+08:00
 * @compliance trace-protocol.json Schema v1.0.1
 * @architecture Interface-based service design
 */

import {
  TraceEvent,
  EventType,
  EventCategory,
  PerformanceMetrics,
  ErrorInformation,
  ErrorType,
  TraceCorrelation,
  CorrelationType,
  TraceFilter,
  TraceType,
  TraceSeverity,
  UUID,
  Timestamp,
  PROTOCOL_VERSION,
  TraceProtocol
} from './types';

// ================== 主要服务类 ==================
export {
  TraceService,
  createTraceService,
  TraceServiceMetadata,
} from './trace-service';

// ================== 追踪管理器 ==================
export {
  TraceManager,
  TraceManagerConfig,
  DEFAULT_TRACE_MANAGER_CONFIG
} from './trace-manager';

// ================== 服务接口 ==================
export type {
  ITraceRepository,
  ITraceValidator,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './types';

// ================== 核心协议类型 ==================
export type {
  TraceProtocol,
  TraceType,
  TraceSeverity,
  TraceEvent,
  EventType,
  EventCategory,
  EventSource,
  PerformanceMetrics,
  ExecutionTime,
  ResourceUsage,
  MemoryUsage,
  CpuUsage,
  NetworkUsage,
  StorageUsage,
  CustomMetric,
  MetricType,
  ContextSnapshot,
  Environment,
  CallStackFrame,
  ErrorInformation,
  ErrorType,
  StackTraceFrame,
  RecoveryAction,
  RecoveryActionType,
  DecisionLog,
  DecisionOption,
  DecisionCriterion,
  TraceCorrelation,
  CorrelationType,
} from './types';

// ================== 请求/响应类型 ==================
export type {
  CreateTraceRequest,
  UpdateTraceRequest,
  TraceFilter,
  TraceOperationResult,
} from './types';

// ================== 基础类型 ==================
export type {
  UUID,
  Timestamp,
  Version,
  Priority,
} from './types';

// ================== 常量和枚举 ==================
export {
  TRACE_CONSTANTS,
  TraceErrorCode,
  PROTOCOL_VERSION,
  DEFAULT_SEVERITY,
  DEFAULT_TRACE_TYPE,
  DEFAULT_EVENT_CATEGORY,
  DEFAULT_EVENT_TYPE,
  DEFAULT_SAMPLING_RATE,
} from './types';

// ================== 工厂和构建器函数 ==================

/**
 * 创建基础追踪事件
 */
export function createTraceEvent(
  type: EventType,
  name: string,
  category: EventCategory = 'system',
  component: string,
  data?: Record<string, unknown>
): TraceEvent {
  return {
    type,
    name,
    category,
    source: { component },
    data: data || {}
  };
}

/**
 * 创建基础性能指标
 */
export function createPerformanceMetrics(
  durationMs: number,
  startTime?: Timestamp
): PerformanceMetrics {
  const timestamp = startTime || new Date().toISOString();
  return {
    execution_time: {
      start_time: timestamp,
      duration_ms: durationMs
    }
  };
}

/**
 * 创建基础错误信息
 */
export function createErrorInformation(
  code: string,
  message: string,
  type: ErrorType = 'system'
): ErrorInformation {
  return {
    error_code: code,
    error_message: message,
    error_type: type
  };
}

/**
 * 创建追踪关联
 */
export function createTraceCorrelation(
  type: CorrelationType,
  relatedTraceId: UUID,
  strength?: number
): TraceCorrelation {
  const { v4: uuidv4 } = require('uuid');
  return {
    correlation_id: uuidv4(),
    type,
    related_trace_id: relatedTraceId,
    strength
  };
}

// ================== 过滤器构建器 ==================

/**
 * 扩展的追踪过滤器
 */
interface ExtendedTraceFilter extends TraceFilter {
  duration_min?: number;
  duration_max?: number;
}

/**
 * Trace过滤器构建器
 */
export class TraceFilterBuilder {
  private filter: ExtendedTraceFilter = {};

  /**
   * 按追踪ID过滤
   */
  withTraceIds(traceIds: UUID[]): this {
    this.filter.trace_ids = traceIds;
    return this;
  }

  /**
   * 按上下文ID过滤
   */
  withContextIds(contextIds: UUID[]): this {
    this.filter.context_ids = contextIds;
    return this;
  }

  /**
   * 按计划ID过滤
   */
  withPlanIds(planIds: UUID[]): this {
    this.filter.plan_ids = planIds;
    return this;
  }

  /**
   * 按任务ID过滤
   */
  withTaskIds(taskIds: UUID[]): this {
    this.filter.task_ids = taskIds;
    return this;
  }

  /**
   * 按追踪类型过滤
   */
  withTraceTypes(traceTypes: TraceType[]): this {
    this.filter.trace_types = traceTypes;
    return this;
  }

  /**
   * 按严重程度过滤
   */
  withSeverities(severities: TraceSeverity[]): this {
    this.filter.severities = severities;
    return this;
  }

  /**
   * 按事件类型过滤
   */
  withEventTypes(eventTypes: EventType[]): this {
    this.filter.event_types = eventTypes;
    return this;
  }

  /**
   * 按时间范围过滤
   */
  withTimeRange(startTime: Timestamp, endTime: Timestamp): this {
    this.filter.created_after = startTime;
    this.filter.created_before = endTime;
    return this;
  }

  /**
   * 按持续时间范围过滤
   */
  withDurationRange(minMs: number, maxMs: number): this {
    this.filter.duration_min = minMs;
    this.filter.duration_max = maxMs;
    return this;
  }

  /**
   * 构建过滤器
   * 
   * @returns 追踪过滤器
   */
  build(): ExtendedTraceFilter {
    return { ...this.filter };
  }
}

/**
 * 创建追踪过滤器构建器
 */
export function createTraceFilter(): TraceFilterBuilder {
  return new TraceFilterBuilder();
}

/**
 * 验证UUID是否有效
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * 验证时间戳是否有效
 */
export function isValidTimestamp(value: string): boolean {
  try {
    const date = new Date(value);
    // 检查是否为有效日期
    if (isNaN(date.getTime())) {
      return false;
    }
    
    // 检查是否为ISO 8601格式
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;
    return isoRegex.test(value);
  } catch {
    return false;
  }
}

/**
 * 验证版本号是否有效
 */
export function isValidVersion(value: string): boolean {
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverRegex.test(value);
}

/**
 * 验证对象是否为有效的追踪协议
 */
export function isValidTraceProtocol(obj: unknown): obj is TraceProtocol {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  const trace = obj as Partial<TraceProtocol>;
  
  // 检查必需字段
  if (!trace.protocol_version || 
      !trace.timestamp ||
      !trace.trace_id ||
      !trace.context_id ||
      !trace.trace_type ||
      !trace.severity ||
      !trace.event) {
    return false;
  }
  
  // 验证字段格式
  if (!isValidVersion(trace.protocol_version) ||
      !isValidTimestamp(trace.timestamp) ||
      !isValidUUID(trace.trace_id) ||
      !isValidUUID(trace.context_id)) {
    return false;
  }
  
  // 验证事件
  const event = trace.event;
  if (!event.type || !event.name || !event.category || !event.source || !event.source.component) {
    return false;
  }
  
  return true;
}

// ================== 模块元数据 ==================

/**
 * Trace模块元数据
 */
export const TraceModuleMetadata = {
  name: 'Trace',
  version: PROTOCOL_VERSION,
  description: 'MPLP追踪记录和监控分析模块',
  compliance: 'trace-protocol.json Schema v1.0',
  dependencies: ['Context'],
  optionalDependencies: ['Plan', 'Task'],
  features: [
    '追踪记录管理',
    '性能监控',
    '错误跟踪',
    '决策日志',
    'TracePilot集成',
    '关联分析',
    '批量操作',
    '统计分析'
  ],
  supportedFormats: ['json', 'csv', 'xml'],
  exportFormats: ['jaeger', 'zipkin', 'otlp', 'custom']
} as const;

/**
 * 默认配置
 */
export const DEFAULT_TRACE_CONFIG = {
  enabled: true,
  samplingRate: 1.0,
  batchSize: 100,
  timeoutMs: 5000,
  maxRetries: 3,
  tracePilotIntegration: {
    enabled: true,
    autoDetection: true,
  }
} as const; 