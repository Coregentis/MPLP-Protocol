/**
 * Trace领域实体
 * 
 * @description Trace模块的核心领域实体，包含业务逻辑和不变量
 * @version 1.0.0
 * @layer 领域层 - 实体
 * @pattern 基于Context模块的IDENTICAL企业级模式
 */

import {
  TraceEntityData,
  TraceType,
  Severity,
  EventType,
  EventCategory,
  TraceOperation,
  EventObject,
  ContextSnapshot,
  ErrorInformation,
  DecisionLog,
  TraceDetails,
  SpanEntity,
  TraceStatistics
} from '../../types';
import { UUID, Timestamp } from '../../../../shared/types';

/**
 * Trace领域实体
 * 
 * @description 封装Trace的业务逻辑和不变量
 */
export class TraceEntity {
  private data: TraceEntityData;

  constructor(data: Partial<TraceEntityData>) {
    this.data = this.initializeData(data);
    this.validateInvariants();
  }

  // ===== 访问器方法 =====

  get traceId(): UUID {
    return this.data.traceId;
  }

  get contextId(): UUID {
    return this.data.contextId;
  }

  get planId(): UUID | undefined {
    return this.data.planId;
  }

  get taskId(): UUID | undefined {
    return this.data.taskId;
  }

  get traceType(): TraceType {
    return this.data.traceType;
  }

  get severity(): Severity {
    return this.data.severity;
  }

  get event(): EventObject {
    return this.data.event;
  }

  get timestamp(): Timestamp {
    return this.data.timestamp;
  }

  get status(): string {
    return this.data.traceOperation || 'active';
  }

  get duration(): number | undefined {
    return this.data.performanceMetrics?.metrics?.traceProcessingLatencyMs;
  }

  get spans(): SpanEntity[] {
    return this.data.spans || [];
  }

  get containsSensitiveData(): boolean {
    return this.data.containsSensitiveData || false;
  }

  // ===== 新增业务方法 =====

  /**
   * 添加跨度
   */
  addSpan(span: SpanEntity): void {
    if (!this.data.spans) {
      this.data.spans = [];
    }
    this.data.spans.push(span);
  }

  /**
   * 结束追踪
   */
  end(endTime: Date, finalStatus: string): void {
    this.data.traceOperation = finalStatus as TraceOperation;
    this.data.timestamp = endTime.toISOString();

    // 计算持续时间
    if (this.data.performanceMetrics) {
      const startTime = new Date(this.data.timestamp);
      // 更新traceProcessingLatencyMs指标
      if (!this.data.performanceMetrics.metrics) {
        this.data.performanceMetrics.metrics = {};
      }
      this.data.performanceMetrics.metrics.traceProcessingLatencyMs = endTime.getTime() - startTime.getTime();
    }
  }

  /**
   * 设置统计信息
   */
  setStatistics(statistics: TraceStatistics): void {
    this.data.statistics = statistics;
  }

  /**
   * 标记为包含敏感数据
   */
  markAsSensitive(): void {
    this.data.containsSensitiveData = true;
  }

  get traceOperation(): TraceOperation {
    return this.data.traceOperation;
  }

  get contextSnapshot(): ContextSnapshot | undefined {
    return this.data.contextSnapshot;
  }

  get errorInformation(): ErrorInformation | undefined {
    return this.data.errorInformation;
  }

  get decisionLog(): DecisionLog | undefined {
    return this.data.decisionLog;
  }

  get traceDetails(): TraceDetails | undefined {
    return this.data.traceDetails;
  }

  // ===== 业务方法 =====

  /**
   * 更新追踪严重程度
   */
  updateSeverity(newSeverity: Severity): void {
    this.validateSeverity(newSeverity);
    this.data.severity = newSeverity;
    this.updateTimestamp();
  }

  /**
   * 添加错误信息
   */
  addErrorInformation(errorInfo: ErrorInformation): void {
    this.validateErrorInformation(errorInfo);
    this.data.errorInformation = errorInfo;
    this.updateSeverity('error'); // 自动提升严重程度
    this.updateTimestamp();
  }

  /**
   * 添加决策日志
   */
  addDecisionLog(decisionLog: DecisionLog): void {
    this.validateDecisionLog(decisionLog);
    this.data.decisionLog = decisionLog;
    this.updateTimestamp();
  }

  /**
   * 更新上下文快照
   */
  updateContextSnapshot(snapshot: ContextSnapshot): void {
    this.data.contextSnapshot = snapshot;
    this.updateTimestamp();
  }

  /**
   * 检查是否为错误追踪
   */
  isError(): boolean {
    return this.data.severity === 'error' || this.data.errorInformation !== undefined;
  }

  /**
   * 检查是否包含决策信息
   */
  hasDecision(): boolean {
    return this.data.decisionLog !== undefined;
  }

  /**
   * 获取追踪持续时间（如果有结束时间）
   */
  getDuration(): number | undefined {
    if (this.data.traceDetails?.samplingRate) {
      // 基于采样率计算估算持续时间
      return Date.now() - new Date(this.data.timestamp).getTime();
    }
    return undefined;
  }

  /**
   * 转换为数据对象
   */
  toData(): TraceEntityData {
    return { ...this.data };
  }

  // ===== 私有方法 =====

  /**
   * 初始化数据
   */
  private initializeData(data: Partial<TraceEntityData>): TraceEntityData {
    const now = new Date().toISOString();
    
    return {
      protocolVersion: '1.0.0',
      timestamp: now,
      traceId: data.traceId || this.generateTraceId(),
      contextId: data.contextId!,
      traceType: data.traceType || 'execution',
      severity: data.severity || 'info',
      event: data.event || this.createDefaultEvent(),
      traceOperation: data.traceOperation || 'start',
      
      // 可选字段
      planId: data.planId,
      taskId: data.taskId,
      contextSnapshot: data.contextSnapshot,
      errorInformation: data.errorInformation,
      decisionLog: data.decisionLog,
      traceDetails: data.traceDetails,
      
      // 系统字段
      auditTrail: data.auditTrail || { enabled: true, retentionDays: 30 },
      performanceMetrics: data.performanceMetrics || { enabled: true, collectionIntervalSeconds: 60 },
      monitoringIntegration: data.monitoringIntegration || { enabled: true, supportedProviders: ['prometheus'] },
      versionHistory: data.versionHistory || { enabled: true, maxVersions: 10 },
      searchMetadata: data.searchMetadata || { enabled: true, indexingStrategy: 'keyword' },
      eventIntegration: data.eventIntegration || { enabled: true },
      correlations: data.correlations || []
    };
  }

  /**
   * 验证不变量
   */
  private validateInvariants(): void {
    if (!this.data.contextId) {
      throw new Error('Context ID is required');
    }
    
    if (!this.data.event?.name) {
      throw new Error('Event name is required');
    }
    
    this.validateSeverity(this.data.severity);
    this.validateTraceType(this.data.traceType);
  }

  /**
   * 验证严重程度
   */
  private validateSeverity(severity: Severity): void {
    const validSeverities: Severity[] = ['debug', 'info', 'warn', 'error', 'critical'];
    if (!validSeverities.includes(severity)) {
      throw new Error(`Invalid severity: ${severity}`);
    }
  }

  /**
   * 验证追踪类型
   */
  private validateTraceType(traceType: TraceType): void {
    const validTypes: TraceType[] = ['execution', 'monitoring', 'audit', 'performance', 'error', 'decision'];
    if (!validTypes.includes(traceType)) {
      throw new Error(`Invalid trace type: ${traceType}`);
    }
  }

  /**
   * 验证错误信息
   */
  private validateErrorInformation(errorInfo: ErrorInformation): void {
    if (!errorInfo.errorCode || !errorInfo.errorMessage) {
      throw new Error('Error code and message are required');
    }
  }

  /**
   * 验证决策日志
   */
  private validateDecisionLog(decisionLog: DecisionLog): void {
    if (!decisionLog.decisionPoint || !decisionLog.selectedOption) {
      throw new Error('Decision point and selected option are required');
    }
  }

  /**
   * 生成追踪ID
   */
  private generateTraceId(): UUID {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `trace-${timestamp}-${random}` as UUID;
  }

  /**
   * 创建默认事件
   */
  private createDefaultEvent(): EventObject {
    return {
      type: 'start' as EventType,
      name: 'Default Trace Event',
      category: 'system' as EventCategory,
      source: {
        component: 'trace-entity'
      }
    };
  }

  /**
   * 更新时间戳
   */
  private updateTimestamp(): void {
    this.data.timestamp = new Date().toISOString();
  }

  // toData方法已在上面定义，避免重复
}
