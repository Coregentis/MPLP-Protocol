/**
 * Dialog Data Transfer Objects
 * @description Dialog模块DTO定义 - API层数据传输对象
 * @version 1.0.0
 */
import { type UUID, type DialogOperation, type DialogType, type TurnManagement, type ContextRetention } from '../../types';
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
export interface DialogResponseDto {
    success: boolean;
    data?: DialogDto;
    error?: string;
    message?: string;
}
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
export interface DialogContextDto {
    sessionId?: string;
    contextId?: string;
    knowledgeBase?: string;
    previousDialogs?: string[];
}
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
export interface HealthCheckDto {
    checkName: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    durationMs?: number;
}
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
export interface VersionDto {
    versionId: UUID;
    versionNumber: number;
    createdAt: string;
    createdBy: string;
    changeSummary?: string;
    dialogSnapshot?: Record<string, unknown>;
    changeType: 'created' | 'updated' | 'configured' | 'participants_changed' | 'capabilities_updated';
}
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
export interface SearchIndexDto {
    indexId: string;
    indexName: string;
    fields: string[];
    indexType: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
    createdAt?: string;
    lastUpdated?: string;
}
export interface DialogDetailsDto {
    dialogType?: DialogType;
    turnManagement?: TurnManagement;
    contextRetention?: ContextRetention;
}
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
export interface EventRoutingRuleDto {
    ruleId: string;
    condition: string;
    targetTopic: string;
    enabled?: boolean;
}
//# sourceMappingURL=dialog.dto.d.ts.map