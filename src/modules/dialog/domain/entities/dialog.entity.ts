/**
 * Dialog Domain Entity
 * @description Dialog模块领域实体 - TypeScript层(camelCase)
 * @version 1.0.0
 */

import { 
  UUID, 
  Timestamp, 
  DialogOperation, 
  DialogType, 
  TurnManagement, 
  ContextRetention,
  DialogStrategyType,
  AnalysisDepth,
  Modality,
  HealthStatus,
  CheckStatus,
  AuditEventType,
  ChangeType,
  MonitoringProvider,
  ExportFormat,
  NotificationChannel,
  EventBusType,
  IndexingStrategy,
  SearchableField,
  IndexType,
  AuditLevel,
  PublishedEventType,
  SubscribedEventType
} from '../../types';

// ===== 对话能力接口 =====
export interface DialogCapabilities {
  basic: {
    enabled: true;
    messageHistory: boolean;
    participantManagement: boolean;
  };
  intelligentControl?: {
    enabled: boolean;
    adaptiveRounds?: boolean;
    dynamicStrategy?: boolean;
    completenessEvaluation?: boolean;
  };
  criticalThinking?: {
    enabled: boolean;
    analysisDepth?: AnalysisDepth;
    questionGeneration?: boolean;
    logicValidation?: boolean;
  };
  knowledgeSearch?: {
    enabled: boolean;
    realTimeSearch?: boolean;
    knowledgeValidation?: boolean;
    sourceVerification?: boolean;
  };
  multimodal?: {
    enabled: boolean;
    supportedModalities?: Modality[];
    crossModalTranslation?: boolean;
  };
}

// ===== 对话策略接口 =====
export interface DialogStrategy {
  type: DialogStrategyType;
  rounds?: {
    min?: number;
    max?: number;
    target?: number;
  };
  exitCriteria?: {
    completenessThreshold?: number;
    userSatisfactionThreshold?: number;
    timeLimit?: number;
  };
}

// ===== 对话上下文接口 =====
export interface DialogContext {
  sessionId?: string;
  contextId?: string;
  knowledgeBase?: string;
  previousDialogs?: string[];
}

// ===== 对话配置接口 =====
export interface DialogConfiguration {
  timeout?: number;
  maxParticipants?: number;
  retryPolicy?: {
    maxRetries?: number;
    backoffMs?: number;
  };
  security?: {
    encryption?: boolean;
    authentication?: boolean;
    auditLogging?: boolean;
  };
}

// ===== 审计事件接口 =====
export interface AuditEvent {
  eventId: UUID;
  eventType: AuditEventType;
  timestamp: Timestamp;
  userId: string;
  userRole?: string;
  action: string;
  resource: string;
  dialogOperation?: string;
  dialogId?: UUID;
  dialogName?: string;
  dialogType?: string;
  participantIds?: string[];
  dialogStatus?: string;
  contentHash?: string;
  dialogDetails?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  correlationId?: UUID;
}

// ===== 审计追踪接口 =====
export interface AuditTrail {
  enabled: boolean;
  retentionDays: number;
  auditEvents?: AuditEvent[];
  complianceSettings?: {
    gdprEnabled?: boolean;
    hipaaEnabled?: boolean;
    soxEnabled?: boolean;
    dialogAuditLevel?: AuditLevel;
    dialogDataLogging?: boolean;
    contentRetentionPolicy?: string;
    privacyProtection?: boolean;
    customCompliance?: string[];
  };
}

// ===== 监控集成接口 =====
export interface MonitoringIntegration {
  enabled: boolean;
  supportedProviders: MonitoringProvider[];
  integrationEndpoints?: {
    metricsApi?: string;
    dialogQualityApi?: string;
    responseTimeApi?: string;
    satisfactionApi?: string;
  };
  dialogMetrics?: {
    trackResponseTimes?: boolean;
    trackDialogQuality?: boolean;
    trackUserSatisfaction?: boolean;
    trackContentModeration?: boolean;
  };
  exportFormats?: ExportFormat[];
}

// ===== 健康检查接口 =====
export interface HealthCheck {
  checkName: string;
  status: CheckStatus;
  message?: string;
  durationMs?: number;
}

// ===== 性能指标接口 =====
export interface PerformanceMetrics {
  enabled: boolean;
  collectionIntervalSeconds: number;
  metrics?: {
    dialogResponseLatencyMs?: number;
    dialogCompletionRatePercent?: number;
    dialogQualityScore?: number;
    userExperienceSatisfactionPercent?: number;
    dialogInteractionEfficiencyScore?: number;
    activeDialogsCount?: number;
    dialogOperationsPerSecond?: number;
    dialogMemoryUsageMb?: number;
    averageDialogComplexityScore?: number;
  };
  healthStatus?: {
    status: HealthStatus;
    lastCheck?: Timestamp;
    checks?: HealthCheck[];
  };
  alerting?: {
    enabled?: boolean;
    thresholds?: {
      maxDialogResponseLatencyMs?: number;
      minDialogCompletionRatePercent?: number;
      minDialogQualityScore?: number;
      minUserExperienceSatisfactionPercent?: number;
      minDialogInteractionEfficiencyScore?: number;
    };
    notificationChannels?: NotificationChannel[];
  };
}

// ===== 版本接口 =====
export interface Version {
  versionId: UUID;
  versionNumber: number;
  createdAt: Timestamp;
  createdBy: string;
  changeSummary?: string;
  dialogSnapshot?: Record<string, unknown>;
  changeType: ChangeType;
}

// ===== 版本历史接口 =====
export interface VersionHistory {
  enabled: boolean;
  maxVersions: number;
  versions?: Version[];
  autoVersioning?: {
    enabled?: boolean;
    versionOnConfigChange?: boolean;
    versionOnParticipantChange?: boolean;
  };
}

// ===== 搜索索引接口 =====
export interface SearchIndex {
  indexId: string;
  indexName: string;
  fields: string[];
  indexType: IndexType;
  createdAt?: Timestamp;
  lastUpdated?: Timestamp;
}

// ===== 搜索元数据接口 =====
export interface SearchMetadata {
  enabled: boolean;
  indexingStrategy: IndexingStrategy;
  searchableFields?: SearchableField[];
  searchIndexes?: SearchIndex[];
  contentIndexing?: {
    enabled?: boolean;
    indexMessageContent?: boolean;
    privacyFiltering?: boolean;
    sensitiveDataMasking?: boolean;
  };
  autoIndexing?: {
    enabled?: boolean;
    indexNewDialogs?: boolean;
    reindexIntervalHours?: number;
  };
}

// ===== 对话详情接口 =====
export interface DialogDetails {
  dialogType?: DialogType;
  turnManagement?: TurnManagement;
  contextRetention?: ContextRetention;
}

// ===== 事件路由规则接口 =====
export interface EventRoutingRule {
  ruleId: string;
  condition: string;
  targetTopic: string;
  enabled?: boolean;
}

// ===== 事件集成接口 =====
export interface EventIntegration {
  enabled: boolean;
  eventBusConnection?: {
    busType?: EventBusType;
    connectionString?: string;
    topicPrefix?: string;
    consumerGroup?: string;
  };
  publishedEvents?: PublishedEventType[];
  subscribedEvents?: SubscribedEventType[];
  eventRouting?: {
    routingRules?: EventRoutingRule[];
  };
}

// ===== Dialog实体构造参数接口 =====
export interface DialogEntityProps {
  protocolVersion: string;
  timestamp: Timestamp;
  dialogId: UUID;
  name: string;
  description?: string;
  participants: string[];
  capabilities: DialogCapabilities;
  strategy?: DialogStrategy;
  context?: DialogContext;
  configuration?: DialogConfiguration;
  metadata?: Record<string, unknown>;
  auditTrail: AuditTrail;
  monitoringIntegration: MonitoringIntegration;
  performanceMetrics: PerformanceMetrics;
  versionHistory: VersionHistory;
  searchMetadata: SearchMetadata;
  dialogOperation: DialogOperation;
  dialogDetails?: DialogDetails;
  eventIntegration: EventIntegration;
}

// ===== Dialog领域实体类 =====
export class DialogEntity {
  public readonly protocolVersion: string;
  public readonly timestamp: Timestamp;
  public readonly dialogId: UUID;
  public name: string;
  public description?: string;
  public participants: string[];
  public capabilities: DialogCapabilities;
  public readonly strategy?: DialogStrategy;
  public readonly context?: DialogContext;
  public readonly configuration?: DialogConfiguration;
  public readonly metadata?: Record<string, unknown>;
  public readonly auditTrail: AuditTrail;
  public readonly monitoringIntegration: MonitoringIntegration;
  public readonly performanceMetrics: PerformanceMetrics;
  public readonly versionHistory: VersionHistory;
  public readonly searchMetadata: SearchMetadata;
  public dialogOperation: DialogOperation;
  public readonly dialogDetails?: DialogDetails;
  public readonly eventIntegration: EventIntegration;

  constructor(
    dialogId: UUID,
    name: string,
    participants: string[],
    capabilities: DialogCapabilities,
    auditTrail: AuditTrail,
    monitoringIntegration: MonitoringIntegration,
    performanceMetrics: PerformanceMetrics,
    versionHistory: VersionHistory,
    searchMetadata: SearchMetadata,
    dialogOperation: DialogOperation,
    eventIntegration: EventIntegration,
    protocolVersion: string = '1.0.0',
    timestamp: Timestamp = new Date().toISOString(),
    description?: string,
    strategy?: DialogStrategy,
    context?: DialogContext,
    configuration?: DialogConfiguration,
    metadata?: Record<string, unknown>,
    dialogDetails?: DialogDetails
  ) {
    // 基于Schema驱动开发 - 验证必需字段
    if (!dialogId) throw new Error('dialogId is required');
    if (!name || name.trim().length === 0) throw new Error('name is required and cannot be empty');
    if (!participants || participants.length === 0) throw new Error('participants is required and cannot be empty');
    if (!capabilities || !capabilities.basic?.enabled) throw new Error('basic capabilities must be enabled');

    this.protocolVersion = protocolVersion;
    this.timestamp = timestamp;
    this.dialogId = dialogId;
    this.name = name;
    this.description = description;
    this.participants = participants;
    this.capabilities = capabilities;
    this.strategy = strategy;
    this.context = context;
    this.configuration = configuration;
    this.metadata = metadata;
    this.auditTrail = auditTrail;
    this.monitoringIntegration = monitoringIntegration;
    this.performanceMetrics = performanceMetrics;
    this.versionHistory = versionHistory;
    this.searchMetadata = searchMetadata;
    this.dialogOperation = dialogOperation;
    this.dialogDetails = dialogDetails;
    this.eventIntegration = eventIntegration;

    // 添加创建事件
    this.addDomainEvent({
      eventType: 'DialogCreated',
      aggregateId: this.dialogId,
      timestamp: this.timestamp,
      data: { name: this.name, participants: this.participants }
    });
  }

  // ===== 业务方法 =====
  
  /**
   * 检查对话是否启用了智能控制
   */
  public hasIntelligentControl(): boolean {
    return this.capabilities.intelligentControl?.enabled === true;
  }

  /**
   * 检查对话是否启用了批判性思维
   */
  public hasCriticalThinking(): boolean {
    return this.capabilities.criticalThinking?.enabled === true;
  }

  /**
   * 检查对话是否启用了知识搜索
   */
  public hasKnowledgeSearch(): boolean {
    return this.capabilities.knowledgeSearch?.enabled === true;
  }

  /**
   * 检查对话是否启用了多模态交互
   */
  public hasMultimodal(): boolean {
    return this.capabilities.multimodal?.enabled === true;
  }

  /**
   * 获取参与者数量
   */
  public getParticipantCount(): number {
    return this.participants.length;
  }

  /**
   * 检查是否达到最大参与者数量
   */
  public isAtMaxParticipants(): boolean {
    if (!this.configuration?.maxParticipants) return false;
    return this.participants.length >= this.configuration.maxParticipants;
  }

  /**
   * 检查对话是否健康
   */
  public isHealthy(): boolean {
    return this.performanceMetrics.healthStatus?.status === 'healthy';
  }

  /**
   * 获取对话复杂度评分
   */
  public getComplexityScore(): number {
    return this.performanceMetrics.metrics?.averageDialogComplexityScore || 0;
  }

  // ===== 状态管理方法 =====

  /**
   * 继续对话
   */
  public continueDialog(): void {
    this.dialogOperation = 'continue';
  }

  /**
   * 暂停对话
   */
  public pauseDialog(): void {
    if (this.dialogOperation === 'end') {
      throw new Error('Cannot pause ended dialog');
    }
    this.dialogOperation = 'pause';
  }

  /**
   * 恢复对话
   */
  public resumeDialog(): void {
    if (this.dialogOperation !== 'pause') {
      throw new Error('Cannot resume non-paused dialog');
    }
    this.dialogOperation = 'resume';
  }

  /**
   * 结束对话
   */
  public endDialog(): void {
    this.dialogOperation = 'end';
  }

  /**
   * 检查对话是否活跃
   */
  public isActive(): boolean {
    return this.dialogOperation === 'start' || this.dialogOperation === 'continue' || this.dialogOperation === 'resume';
  }

  /**
   * 检查对话是否暂停
   */
  public isPaused(): boolean {
    return this.dialogOperation === 'pause';
  }

  /**
   * 检查对话是否结束
   */
  public isEnded(): boolean {
    return this.dialogOperation === 'end';
  }

  /**
   * 检查是否可以暂停对话
   */
  public canPause(): boolean {
    return this.dialogOperation !== 'pause' && this.dialogOperation !== 'end';
  }

  /**
   * 检查是否可以恢复对话
   */
  public canResume(): boolean {
    return this.dialogOperation === 'pause';
  }

  /**
   * 检查是否可以结束对话
   */
  public canEnd(): boolean {
    return this.dialogOperation !== 'end';
  }

  /**
   * 检查是否可以开始对话
   */
  public canStart(): boolean {
    return this.dialogOperation !== 'end';
  }

  // ===== 参与者管理方法 =====

  /**
   * 添加参与者
   */
  public addParticipant(participantId: string): void {
    if (!this.participants) {
      throw new Error('Participants array not initialized');
    }
    if (this.participants.includes(participantId)) {
      throw new Error('Participant already exists');
    }
    this.participants.push(participantId);
  }

  /**
   * 移除参与者
   */
  public removeParticipant(participantId: string): void {
    if (!this.participants) {
      throw new Error('Participants array not initialized');
    }
    const index = this.participants.indexOf(participantId);
    if (index === -1) {
      throw new Error('Participant not found');
    }
    if (this.participants.length <= 1) {
      throw new Error('Cannot remove last participant');
    }
    this.participants.splice(index, 1);
  }

  /**
   * 检查参与者是否存在
   */
  public hasParticipant(participantId: string): boolean {
    if (!this.participants) {
      return false;
    }
    return this.participants.includes(participantId);
  }

  // ===== 更新方法 =====

  /**
   * 更新对话信息
   */
  public updateDialog(updates: { name?: string; description?: string }): void {
    if (updates.name !== undefined) {
      if (!updates.name || updates.name.trim().length === 0) {
        throw new Error('Name cannot be empty');
      }
      if (updates.name.length > 255) {
        throw new Error('Name too long');
      }
      this.name = updates.name;
    }
    if (updates.description !== undefined) {
      if (updates.description && updates.description.length > 1000) {
        throw new Error('Description too long');
      }
      this.description = updates.description;
    }

    // 添加更新事件
    this.addDomainEvent({
      eventType: 'DialogUpdated',
      aggregateId: this.dialogId,
      timestamp: new Date().toISOString(),
      data: updates
    });
  }

  /**
   * 更新能力配置
   */
  public updateCapabilities(capabilities: DialogCapabilities): void {
    if (!capabilities.basic?.enabled) {
      throw new Error('Basic capabilities must be enabled');
    }
    this.capabilities = capabilities;
  }

  /**
   * 验证策略配置
   */
  public validateStrategy(strategy: DialogStrategy): boolean {
    if (strategy.rounds && strategy.rounds.min !== undefined && strategy.rounds.min < 0) {
      return false;
    }
    if (strategy.exitCriteria && strategy.exitCriteria.completenessThreshold !== undefined && strategy.exitCriteria.completenessThreshold > 1.0) {
      return false;
    }
    return true;
  }

  // ===== 快照和事件方法 =====

  /**
   * 创建对话快照
   */
  public toSnapshot(): Record<string, unknown> {
    return {
      dialogId: this.dialogId,
      name: this.name,
      description: this.description,
      participants: [...this.participants],
      capabilities: this.capabilities,
      strategy: this.strategy,
      context: this.context,
      configuration: this.configuration,
      metadata: this.metadata,
      dialogOperation: this.dialogOperation,
      protocolVersion: this.protocolVersion,
      timestamp: this.timestamp
    };
  }

  private _domainEvents: Record<string, unknown>[] = [];

  /**
   * 获取领域事件
   */
  public getDomainEvents(): Record<string, unknown>[] {
    return [...this._domainEvents];
  }

  /**
   * 清除领域事件
   */
  public clearDomainEvents(): void {
    this._domainEvents = [];
  }

  /**
   * 添加领域事件
   */
  private addDomainEvent(event: Record<string, unknown>): void {
    this._domainEvents.push(event);
  }
}
