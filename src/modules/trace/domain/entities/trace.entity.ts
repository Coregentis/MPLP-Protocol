/**
 * Trace领域实体
 * 
 * 追踪记录的核心领域实体，封装追踪业务逻辑和不变性约束
 * 
 * @version 1.0.0
 * @created 2025-09-16
 */

import { UUID, Timestamp } from '../../../../public/shared/types';
import { 
  TraceType, 
  TraceSeverity, 
  TraceEvent,
  PerformanceMetrics,
  ErrorInformation,
  Correlation,
  TraceMetadata
} from '../../types';

/**
 * Trace领域实体
 */
export class Trace {
  private _trace_id: UUID;
  private _context_id: UUID;
  private _plan_id?: UUID;
  private _protocol_version: string;
  private _trace_type: TraceType;
  private _severity: TraceSeverity;
  private _event: TraceEvent;
  private _timestamp: Timestamp;
  private _performance_metrics?: PerformanceMetrics;
  private _error_information?: ErrorInformation;
  private _correlations: Correlation[];
  private _metadata?: TraceMetadata;
  private _created_at: Timestamp;
  private _updated_at: Timestamp;

    /**
   * 任务ID
   */
  public taskId?: string;

  /**
   * 上下文快照
   */
  public contextSnapshot?: Record<string, unknown>;

  /**
   * 决策日志
   */
  public decisionLog?: unknown[];

constructor(
    traceId: UUID,
    contextId: UUID,
    protocolVersion: string,
    traceType: TraceType,
    severity: TraceSeverity,
    event: TraceEvent,
    timestamp: Timestamp,
    createdAt: Timestamp,
    updatedAt: Timestamp,
    planId?: UUID,
    performanceMetrics?: PerformanceMetrics,
    errorInformation?: ErrorInformation,
    correlations: Correlation[] = [],
    metadata?: TraceMetadata
  ) {
    this._trace_id = traceId;
    this._context_id = contextId;
    this._plan_id = planId;
    this._protocol_version = protocolVersion;
    this._trace_type = traceType;
    this._severity = severity;
    this._event = event;
    this._timestamp = timestamp;
    this._performance_metrics = performanceMetrics;
    this._error_information = errorInformation;
    this._correlations = correlations;
    this._metadata = metadata;
    this._created_at = createdAt;
    this._updated_at = updatedAt;

    this.validateInvariants();
  }

  // Getters
  get traceId(): UUID { return this._trace_id; }
  get contextId(): UUID { return this._context_id; }
  get planId(): UUID | undefined { return this._plan_id; }
  get protocolVersion(): string { return this._protocol_version; }
  get traceType(): TraceType { return this._trace_type; }
  get severity(): TraceSeverity { return this._severity; }
  get event(): TraceEvent { return this._event; }
  get timestamp(): Timestamp { return this._timestamp; }
  get performanceMetrics(): PerformanceMetrics | undefined { return this._performance_metrics; }
  get errorInformation(): ErrorInformation | undefined { return this._error_information; }
  get correlations(): Correlation[] { return [...this._correlations]; }
  get metadata(): TraceMetadata | undefined { return this._metadata; }
  get createdAt(): Timestamp { return this._created_at; }
  get updatedAt(): Timestamp { return this._updated_at; }

  /**
   * 添加关联
   */
  addCorrelation(correlation: Correlation): void {
    // 检查是否已存在相同的关联
    const exists = this._correlations.some(c => 
      c.related_trace_id === correlation.related_trace_id && 
      c.type === correlation.type
    );
    
    if (!exists) {
      this._correlations.push(correlation);
      this._updated_at = new Date().toISOString();
    }
  }

  /**
   * 移除关联
   */
  removeCorrelation(relatedTraceId: UUID, type: string): void {
    const initialLength = this._correlations.length;
    this._correlations = this._correlations.filter(c => 
      !(c.related_trace_id === relatedTraceId && c.type === type)
    );
    
    if (this._correlations.length !== initialLength) {
      this._updated_at = new Date().toISOString();
    }
  }

  /**
   * 更新性能指标
   */
  updatePerformanceMetrics(metrics: PerformanceMetrics): void {
    this._performance_metrics = metrics;
    this._updated_at = new Date().toISOString();
  }

  /**
   * 设置错误信息
   */
  setErrorInformation(errorInfo: ErrorInformation): void {
    this._error_information = errorInfo;
    this._severity = 'error'; // 有错误时自动设置为错误级别
    this._updated_at = new Date().toISOString();
  }

  /**
   * 更新元数据
   */
  updateMetadata(metadata: TraceMetadata): void {
    this._metadata = { ...this._metadata, ...metadata };
    this._updated_at = new Date().toISOString();
  }

  /**
   * 检查是否为错误追踪
   */
  isError(): boolean {
    return this._trace_type === 'error' || this._severity === 'error' || this._severity === 'critical';
  }

  /**
   * 检查是否为性能追踪
   */
  isPerformanceTrace(): boolean {
    return this._trace_type === 'performance' || !!this._performance_metrics;
  }

  /**
   * 获取执行持续时间
   */
  getExecutionDuration(): number | undefined {
    return this._performance_metrics?.execution_time?.duration_ms;
  }

  /**
   * 验证领域不变性
   */
  private validateInvariants(): void {
    if (!this._trace_id) {
      throw new Error('追踪ID不能为空');
    }
    if (!this._context_id) {
      throw new Error('上下文ID不能为空');
    }
    if (!this._event.name || this._event.name.trim().length === 0) {
      throw new Error('事件名称不能为空');
    }
    if (!this._event.source.component) {
      throw new Error('事件源组件不能为空');
    }
    if (this._trace_type === 'error' && !this._error_information) {
      throw new Error('错误类型的追踪必须包含错误信息');
    }
  }

  /**
   * 转换为协议格式
   */
  toProtocol(): any {
    return {
      traceId: this._trace_id,
      contextId: this._context_id,
      planId: this._plan_id,
      protocolVersion: this._protocol_version,
      traceType: this._trace_type,
      severity: this._severity,
      event: this._event,
      timestamp: this._timestamp,
      performanceMetrics: this._performance_metrics,
      errorInformation: this._error_information,
      correlations: this._correlations,
      metadata: this._metadata,
      createdAt: this._created_at,
      updatedAt: this._updated_at
    };
  }

  /**
   * 从协议格式创建实体
   */
  static fromProtocol(protocol: any): Trace {
    return new Trace(
      protocol.traceId,
      protocol.contextId,
      protocol.protocolVersion,
      protocol.traceType,
      protocol.severity,
      protocol.event,
      protocol.timestamp,
      protocol.createdAt,
      protocol.updatedAt,
      protocol.planId,
      protocol.performanceMetrics,
      protocol.errorInformation,
      protocol.correlations || [],
      protocol.metadata
    );
  }
}
