/**
 * Core领域实体
 *
 * @description Core模块的核心领域实体，封装MPLP协议栈的核心工作流和协调逻辑
 * @version 1.0.0
 * @layer 领域层 - 实体
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的DDD实体封装模式
 */

import {
  UUID,
  Timestamp,
  Version,
  WorkflowStageType,
  CoreOperation,
  AuditEventType,
  WorkflowConfig,
  ExecutionContext,
  ExecutionStatus,
  ModuleCoordination,
  EventHandling,
  AuditTrail,
  MonitoringIntegration,
  PerformanceMetricsConfig,
  VersionHistory,
  SearchMetadata,
  EventIntegration,
  CoreDetails
} from '../../types';

/**
 * Core核心实体
 * 代表MPLP协议栈的核心工作流和协调实体
 */
export class CoreEntity {
  public readonly protocolVersion: Version;
  public readonly timestamp: Timestamp;
  public readonly workflowId: UUID;
  public readonly orchestratorId: UUID;
  public workflowConfig: WorkflowConfig;
  public executionContext: ExecutionContext;
  public executionStatus: ExecutionStatus;
  public moduleCoordination?: ModuleCoordination;
  public eventHandling?: EventHandling;
  public auditTrail: AuditTrail;
  public monitoringIntegration: MonitoringIntegration;
  public performanceMetrics: PerformanceMetricsConfig;
  public versionHistory: VersionHistory;
  public searchMetadata: SearchMetadata;
  public coreOperation: CoreOperation;
  public coreDetails?: CoreDetails;
  public eventIntegration: EventIntegration;

  constructor(data: {
    protocolVersion: Version;
    timestamp: Timestamp;
    workflowId: UUID;
    orchestratorId: UUID;
    workflowConfig: WorkflowConfig;
    executionContext: ExecutionContext;
    executionStatus: ExecutionStatus;
    moduleCoordination?: ModuleCoordination;
    eventHandling?: EventHandling;
    auditTrail: AuditTrail;
    monitoringIntegration: MonitoringIntegration;
    performanceMetrics: PerformanceMetricsConfig;
    versionHistory: VersionHistory;
    searchMetadata: SearchMetadata;
    coreOperation: CoreOperation;
    coreDetails?: CoreDetails;
    eventIntegration: EventIntegration;
  }) {
    // 验证必需字段
    this.validateRequiredFields(data);

    this.protocolVersion = data.protocolVersion;
    this.timestamp = data.timestamp;
    this.workflowId = data.workflowId;
    this.orchestratorId = data.orchestratorId;
    this.workflowConfig = data.workflowConfig;
    this.executionContext = data.executionContext;
    this.executionStatus = data.executionStatus;
    this.moduleCoordination = data.moduleCoordination;
    this.eventHandling = data.eventHandling;
    this.auditTrail = data.auditTrail;
    this.monitoringIntegration = data.monitoringIntegration;
    this.performanceMetrics = data.performanceMetrics;
    this.versionHistory = data.versionHistory;
    this.searchMetadata = data.searchMetadata;
    this.coreOperation = data.coreOperation;
    this.coreDetails = data.coreDetails;
    this.eventIntegration = data.eventIntegration;
  }

  /**
   * 验证必需字段
   * @param data 实体数据
   */
  private validateRequiredFields(data: {
    protocolVersion: Version;
    timestamp: Timestamp;
    workflowId: UUID;
    orchestratorId: UUID;
    workflowConfig: WorkflowConfig;
    executionContext: ExecutionContext;
    executionStatus: ExecutionStatus;
    auditTrail: AuditTrail;
    monitoringIntegration: MonitoringIntegration;
    performanceMetrics: PerformanceMetricsConfig;
    versionHistory: VersionHistory;
    searchMetadata: SearchMetadata;
    coreOperation: CoreOperation;
    eventIntegration: EventIntegration;
  }): void {
    const requiredFields = [
      'protocolVersion',
      'timestamp',
      'workflowId',
      'orchestratorId',
      'workflowConfig',
      'executionContext',
      'executionStatus',
      'auditTrail',
      'monitoringIntegration',
      'performanceMetrics',
      'versionHistory',
      'searchMetadata',
      'coreOperation',
      'eventIntegration'
    ];

    for (const field of requiredFields) {
      if (!data[field as keyof typeof data]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // 验证协议版本
    if (data.protocolVersion !== '1.0.0') {
      throw new Error('Invalid protocol version, must be "1.0.0"');
    }

    // 验证UUID格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    if (!uuidRegex.test(data.workflowId)) {
      throw new Error('Invalid workflowId UUID format');
    }
    if (!uuidRegex.test(data.orchestratorId)) {
      throw new Error('Invalid orchestratorId UUID format');
    }

    // 验证时间戳格式
    const date = new Date(data.timestamp);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp format');
    }
  }

  /**
   * 更新工作流配置
   * @param config 新的工作流配置
   */
  updateWorkflowConfig(config: WorkflowConfig): void {
    this.workflowConfig = config;
  }

  /**
   * 更新执行状态
   * @param status 新的执行状态
   */
  updateExecutionStatus(status: ExecutionStatus): void {
    this.executionStatus = status;
  }

  /**
   * 添加审计事件
   * @param event 审计事件
   */
  addAuditEvent(event: {
    eventId: UUID;
    eventType: AuditEventType;
    timestamp: Timestamp;
    userId: string;
    userRole?: string;
    action: string;
    resource: string;
    systemOperation?: string;
    workflowId?: UUID;
    orchestratorId?: UUID;
    coreOperation?: string;
    coreStatus?: string;
    moduleIds?: string[];
    coreDetails?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    correlationId?: UUID;
  }): void {
    if (!this.auditTrail.auditEvents) {
      this.auditTrail.auditEvents = [];
    }
    this.auditTrail.auditEvents.push(event);
  }

  /**
   * 检查工作流是否完成
   * @returns 是否完成
   */
  isWorkflowCompleted(): boolean {
    return this.executionStatus.status === 'completed';
  }

  /**
   * 检查工作流是否失败
   * @returns 是否失败
   */
  isWorkflowFailed(): boolean {
    return this.executionStatus.status === 'failed';
  }

  /**
   * 检查工作流是否正在进行
   * @returns 是否正在进行
   */
  isWorkflowInProgress(): boolean {
    return this.executionStatus.status === 'in_progress';
  }

  /**
   * 获取当前阶段
   * @returns 当前阶段
   */
  getCurrentStage(): WorkflowStageType | undefined {
    return this.executionStatus.currentStage;
  }

  /**
   * 获取已完成的阶段
   * @returns 已完成的阶段列表
   */
  getCompletedStages(): WorkflowStageType[] {
    return this.executionStatus.completedStages || [];
  }

  /**
   * 获取工作流持续时间
   * @returns 持续时间（毫秒）
   */
  getWorkflowDuration(): number | undefined {
    return this.executionStatus.durationMs;
  }

  /**
   * 检查是否启用了审计
   * @returns 是否启用审计
   */
  isAuditEnabled(): boolean {
    return this.auditTrail.enabled;
  }

  /**
   * 检查是否启用了监控
   * @returns 是否启用监控
   */
  isMonitoringEnabled(): boolean {
    return this.monitoringIntegration.enabled;
  }

  /**
   * 检查是否启用了性能指标收集
   * @returns 是否启用性能指标收集
   */
  isPerformanceMetricsEnabled(): boolean {
    return this.performanceMetrics.enabled;
  }

  /**
   * 检查是否启用了版本历史
   * @returns 是否启用版本历史
   */
  isVersionHistoryEnabled(): boolean {
    return this.versionHistory.enabled;
  }

  /**
   * 检查是否启用了搜索元数据
   * @returns 是否启用搜索元数据
   */
  isSearchMetadataEnabled(): boolean {
    return this.searchMetadata.enabled;
  }

  /**
   * 检查是否启用了事件集成
   * @returns 是否启用事件集成
   */
  isEventIntegrationEnabled(): boolean {
    return this.eventIntegration.enabled;
  }

  /**
   * 获取实体的JSON表示
   * @returns JSON对象
   */
  toJSON(): Record<string, unknown> {
    return {
      protocolVersion: this.protocolVersion,
      timestamp: this.timestamp,
      workflowId: this.workflowId,
      orchestratorId: this.orchestratorId,
      workflowConfig: this.workflowConfig,
      executionContext: this.executionContext,
      executionStatus: this.executionStatus,
      moduleCoordination: this.moduleCoordination,
      eventHandling: this.eventHandling,
      auditTrail: this.auditTrail,
      monitoringIntegration: this.monitoringIntegration,
      performanceMetrics: this.performanceMetrics,
      versionHistory: this.versionHistory,
      searchMetadata: this.searchMetadata,
      coreOperation: this.coreOperation,
      coreDetails: this.coreDetails,
      eventIntegration: this.eventIntegration
    };
  }

  /**
   * 创建实体的副本
   * @returns 新的实体实例
   */
  clone(): CoreEntity {
    return new CoreEntity({
      protocolVersion: this.protocolVersion,
      timestamp: this.timestamp,
      workflowId: this.workflowId,
      orchestratorId: this.orchestratorId,
      workflowConfig: { ...this.workflowConfig },
      executionContext: { ...this.executionContext },
      executionStatus: { ...this.executionStatus },
      moduleCoordination: this.moduleCoordination ? { ...this.moduleCoordination } : undefined,
      eventHandling: this.eventHandling ? { ...this.eventHandling } : undefined,
      auditTrail: { ...this.auditTrail },
      monitoringIntegration: { ...this.monitoringIntegration },
      performanceMetrics: { ...this.performanceMetrics },
      versionHistory: { ...this.versionHistory },
      searchMetadata: { ...this.searchMetadata },
      coreOperation: this.coreOperation,
      coreDetails: this.coreDetails ? { ...this.coreDetails } : undefined,
      eventIntegration: { ...this.eventIntegration }
    });
  }
}
