/**
 * Dialog Data Transfer Objects
 * @description Dialog模块DTO定义 - API层数据传输对象
 * @version 1.0.0
 */

import { type UUID, type DialogOperation, type DialogType, type TurnManagement, type ContextRetention } from '../../types';

// ===== 创建对话DTO =====
export interface CreateDialogDto {
  name: string;
  description?: string;
  participants: string[];
  capabilities?: DialogCapabilitiesDto;
  strategy?: DialogStrategyDto;
  context?: DialogContextDto;
  configuration?: DialogConfigurationDto;
  metadata?: Record<string, unknown>;
}

// ===== 更新对话DTO =====
export interface UpdateDialogDto {
  name?: string;
  description?: string;
  participants?: string[];
  capabilities?: DialogCapabilitiesDto;
  strategy?: DialogStrategyDto;
  context?: DialogContextDto;
  configuration?: DialogConfigurationDto;
  metadata?: Record<string, unknown>;
}

// ===== 对话响应DTO =====
export interface DialogResponseDto {
  success: boolean;
  data?: DialogDto;
  error?: string;
  message?: string;
}

// ===== 完整对话DTO =====
export interface DialogDto {
  dialogId: UUID;
  name: string;
  description?: string;
  participants: string[];
  capabilities: DialogCapabilitiesDto;
  strategy?: DialogStrategyDto;
  context?: DialogContextDto;
  configuration?: DialogConfigurationDto;
  metadata?: Record<string, unknown>;
  auditTrail: AuditTrailDto;
  monitoringIntegration: MonitoringIntegrationDto;
  performanceMetrics: PerformanceMetricsDto;
  versionHistory: VersionHistoryDto;
  searchMetadata: SearchMetadataDto;
  dialogOperation: DialogOperation;
  dialogDetails?: DialogDetailsDto;
  eventIntegration: EventIntegrationDto;
  protocolVersion: string;
  timestamp: string;
}

// ===== 对话能力DTO =====
export interface DialogCapabilitiesDto {
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
    analysisDepth?: 'surface' | 'moderate' | 'deep';
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
    supportedModalities?: string[];
    crossModalTranslation?: boolean;
  };
}

// ===== 对话策略DTO =====
export interface DialogStrategyDto {
  type: 'fixed' | 'adaptive' | 'goal_driven' | 'exploratory';
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

// ===== 对话上下文DTO =====
export interface DialogContextDto {
  sessionId?: string;
  contextId?: string;
  knowledgeBase?: string;
  previousDialogs?: string[];
}

// ===== 对话配置DTO =====
export interface DialogConfigurationDto {
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

// ===== 审计追踪DTO =====
export interface AuditTrailDto {
  enabled: boolean;
  retentionDays: number;
  auditEvents?: AuditEventDto[];
  complianceSettings?: {
    gdprEnabled?: boolean;
    hipaaEnabled?: boolean;
    soxEnabled?: boolean;
    dialogAuditLevel?: 'basic' | 'detailed' | 'comprehensive';
    dialogDataLogging?: boolean;
    contentRetentionPolicy?: string;
    privacyProtection?: boolean;
    customCompliance?: string[];
  };
}

// ===== 审计事件DTO =====
export interface AuditEventDto {
  eventId: UUID;
  eventType: string;
  timestamp: string;
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

// ===== 监控集成DTO =====
export interface MonitoringIntegrationDto {
  enabled: boolean;
  supportedProviders: string[];
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
  exportFormats?: string[];
}

// ===== 性能指标DTO =====
export interface PerformanceMetricsDto {
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
    status: 'healthy' | 'degraded' | 'unhealthy' | 'interrupted';
    lastCheck?: string;
    checks?: HealthCheckDto[];
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
    notificationChannels?: string[];
  };
}

// ===== 健康检查DTO =====
export interface HealthCheckDto {
  checkName: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  durationMs?: number;
}

// ===== 版本历史DTO =====
export interface VersionHistoryDto {
  enabled: boolean;
  maxVersions: number;
  versions?: VersionDto[];
  autoVersioning?: {
    enabled?: boolean;
    versionOnConfigChange?: boolean;
    versionOnParticipantChange?: boolean;
  };
}

// ===== 版本DTO =====
export interface VersionDto {
  versionId: UUID;
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  changeSummary?: string;
  dialogSnapshot?: Record<string, unknown>;
  changeType: 'created' | 'updated' | 'configured' | 'participants_changed' | 'capabilities_updated';
}

// ===== 搜索元数据DTO =====
export interface SearchMetadataDto {
  enabled: boolean;
  indexingStrategy: 'full_text' | 'keyword' | 'semantic' | 'hybrid';
  searchableFields?: string[];
  searchIndexes?: SearchIndexDto[];
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

// ===== 搜索索引DTO =====
export interface SearchIndexDto {
  indexId: string;
  indexName: string;
  fields: string[];
  indexType: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
  createdAt?: string;
  lastUpdated?: string;
}

// ===== 对话详情DTO =====
export interface DialogDetailsDto {
  dialogType?: DialogType;
  turnManagement?: TurnManagement;
  contextRetention?: ContextRetention;
}

// ===== 事件集成DTO =====
export interface EventIntegrationDto {
  enabled: boolean;
  eventBusConnection?: {
    busType?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
    connectionString?: string;
    topicPrefix?: string;
    consumerGroup?: string;
  };
  publishedEvents?: string[];
  subscribedEvents?: string[];
  eventRouting?: {
    routingRules?: EventRoutingRuleDto[];
  };
}

// ===== 事件路由规则DTO =====
export interface EventRoutingRuleDto {
  ruleId: string;
  condition: string;
  targetTopic: string;
  enabled?: boolean;
}
