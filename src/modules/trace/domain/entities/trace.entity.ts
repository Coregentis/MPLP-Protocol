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
  TraceMetadata,
  ContextSnapshot,
  DecisionLog
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
  private _context_snapshot?: ContextSnapshot;

  /**
   * 决策日志
   */
  private _decision_log?: DecisionLog;

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
    metadata?: TraceMetadata,
    contextSnapshot?: ContextSnapshot,
    decisionLog?: DecisionLog
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
    this._context_snapshot = contextSnapshot;
    this._decision_log = decisionLog;

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
  get contextSnapshot(): ContextSnapshot | undefined { return this._context_snapshot; }
  get decisionLog(): DecisionLog | undefined { return this._decision_log; }

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
   * 设置上下文快照
   */
  setContextSnapshot(snapshot: ContextSnapshot): void {
    this._context_snapshot = snapshot;
    this._updated_at = new Date().toISOString();
  }

  /**
   * 设置决策日志
   */
  setDecisionLog(decisionLog: DecisionLog): void {
    this._decision_log = decisionLog;
    this._updated_at = new Date().toISOString();
  }

  /**
   * 捕获当前上下文快照
   */
  captureContextSnapshot(variables?: Record<string, unknown>, callStack?: string[]): void {
    const snapshot: ContextSnapshot = {
      variables: variables || {},
      environment: {
        os: process.platform,
        platform: process.arch,
        runtime_version: process.version,
        environment_variables: Object.fromEntries(
          Object.entries(process.env).filter(([, value]) => value !== undefined)
        ) as Record<string, string>
      },
      call_stack: callStack?.map((func, index) => ({
        function: func,
        file: 'unknown',
        line: index + 1
      }))
    };
    this.setContextSnapshot(snapshot);
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
    // 错误类型的追踪可以没有详细错误信息，允许简单错误追踪
    // if (this._trace_type === 'error' && !this._error_information) {
    //   throw new Error('错误类型的追踪必须包含错误信息');
    // }
  }

  /**
   * 转换为内部协议格式（camelCase）
   * @deprecated 使用 TraceMapper.toSchema() 进行对外Schema输出
   */
  toProtocol(): Record<string, unknown> {
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
      contextSnapshot: this._context_snapshot,
      decisionLog: this._decision_log,
      createdAt: this._created_at,
      updatedAt: this._updated_at
    };
  }



  /**
   * 从协议格式创建实体
   */
  static fromProtocol(protocol: Record<string, unknown>): Trace {
    return new Trace(
      protocol.traceId as string,
      protocol.contextId as string,
      protocol.protocolVersion as string,
      protocol.traceType as TraceType,
      protocol.severity as TraceSeverity,
      protocol.event as TraceEvent,
      protocol.timestamp as string,
      protocol.createdAt as string,
      protocol.updatedAt as string,
      protocol.planId as string | undefined,
      protocol.performanceMetrics as PerformanceMetrics | undefined,
      protocol.errorInformation as ErrorInformation | undefined,
      (protocol.correlations as Correlation[]) || [],
      protocol.metadata as TraceMetadata | undefined,
      protocol.contextSnapshot as ContextSnapshot | undefined,
      protocol.decisionLog as DecisionLog | undefined
    );
  }
}
