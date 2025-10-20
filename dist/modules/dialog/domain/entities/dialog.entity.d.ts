/**
 * Dialog Domain Entity
 * @description Dialog模块领域实体 - TypeScript层(camelCase)
 * @version 1.0.0
 */
import { UUID, Timestamp, DialogOperation, DialogType, TurnManagement, ContextRetention, DialogStrategyType, AnalysisDepth, Modality, HealthStatus, CheckStatus, AuditEventType, ChangeType, MonitoringProvider, ExportFormat, NotificationChannel, EventBusType, IndexingStrategy, SearchableField, IndexType, AuditLevel, PublishedEventType, SubscribedEventType } from '../../types';
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
export interface DialogContext {
    sessionId?: string;
    contextId?: string;
    knowledgeBase?: string;
    previousDialogs?: string[];
}
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
export interface HealthCheck {
    checkName: string;
    status: CheckStatus;
    message?: string;
    durationMs?: number;
}
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
export interface Version {
    versionId: UUID;
    versionNumber: number;
    createdAt: Timestamp;
    createdBy: string;
    changeSummary?: string;
    dialogSnapshot?: Record<string, unknown>;
    changeType: ChangeType;
}
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
export interface SearchIndex {
    indexId: string;
    indexName: string;
    fields: string[];
    indexType: IndexType;
    createdAt?: Timestamp;
    lastUpdated?: Timestamp;
}
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
export interface DialogDetails {
    dialogType?: DialogType;
    turnManagement?: TurnManagement;
    contextRetention?: ContextRetention;
}
export interface EventRoutingRule {
    ruleId: string;
    condition: string;
    targetTopic: string;
    enabled?: boolean;
}
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
export declare class DialogEntity {
    readonly protocolVersion: string;
    readonly timestamp: Timestamp;
    readonly dialogId: UUID;
    name: string;
    description?: string;
    participants: string[];
    capabilities: DialogCapabilities;
    readonly strategy?: DialogStrategy;
    readonly context?: DialogContext;
    readonly configuration?: DialogConfiguration;
    readonly metadata?: Record<string, unknown>;
    readonly auditTrail: AuditTrail;
    readonly monitoringIntegration: MonitoringIntegration;
    readonly performanceMetrics: PerformanceMetrics;
    readonly versionHistory: VersionHistory;
    readonly searchMetadata: SearchMetadata;
    dialogOperation: DialogOperation;
    readonly dialogDetails?: DialogDetails;
    readonly eventIntegration: EventIntegration;
    constructor(dialogId: UUID, name: string, participants: string[], capabilities: DialogCapabilities, auditTrail: AuditTrail, monitoringIntegration: MonitoringIntegration, performanceMetrics: PerformanceMetrics, versionHistory: VersionHistory, searchMetadata: SearchMetadata, dialogOperation: DialogOperation, eventIntegration: EventIntegration, protocolVersion?: string, timestamp?: Timestamp, description?: string, strategy?: DialogStrategy, context?: DialogContext, configuration?: DialogConfiguration, metadata?: Record<string, unknown>, dialogDetails?: DialogDetails);
    /**
     * 检查对话是否启用了智能控制
     */
    hasIntelligentControl(): boolean;
    /**
     * 检查对话是否启用了批判性思维
     */
    hasCriticalThinking(): boolean;
    /**
     * 检查对话是否启用了知识搜索
     */
    hasKnowledgeSearch(): boolean;
    /**
     * 检查对话是否启用了多模态交互
     */
    hasMultimodal(): boolean;
    /**
     * 获取参与者数量
     */
    getParticipantCount(): number;
    /**
     * 检查是否达到最大参与者数量
     */
    isAtMaxParticipants(): boolean;
    /**
     * 检查对话是否健康
     */
    isHealthy(): boolean;
    /**
     * 获取对话复杂度评分
     */
    getComplexityScore(): number;
    /**
     * 继续对话
     */
    continueDialog(): void;
    /**
     * 暂停对话
     */
    pauseDialog(): void;
    /**
     * 恢复对话
     */
    resumeDialog(): void;
    /**
     * 结束对话
     */
    endDialog(): void;
    /**
     * 检查对话是否活跃
     */
    isActive(): boolean;
    /**
     * 检查对话是否暂停
     */
    isPaused(): boolean;
    /**
     * 检查对话是否结束
     */
    isEnded(): boolean;
    /**
     * 检查是否可以暂停对话
     */
    canPause(): boolean;
    /**
     * 检查是否可以恢复对话
     */
    canResume(): boolean;
    /**
     * 检查是否可以结束对话
     */
    canEnd(): boolean;
    /**
     * 检查是否可以开始对话
     */
    canStart(): boolean;
    /**
     * 添加参与者
     */
    addParticipant(participantId: string): void;
    /**
     * 移除参与者
     */
    removeParticipant(participantId: string): void;
    /**
     * 检查参与者是否存在
     */
    hasParticipant(participantId: string): boolean;
    /**
     * 更新对话信息
     */
    updateDialog(updates: {
        name?: string;
        description?: string;
    }): void;
    /**
     * 更新能力配置
     */
    updateCapabilities(capabilities: DialogCapabilities): void;
    /**
     * 验证策略配置
     */
    validateStrategy(strategy: DialogStrategy): boolean;
    /**
     * 创建对话快照
     */
    toSnapshot(): Record<string, unknown>;
    private _domainEvents;
    /**
     * 获取领域事件
     */
    getDomainEvents(): Record<string, unknown>[];
    /**
     * 清除领域事件
     */
    clearDomainEvents(): void;
    /**
     * 添加领域事件
     */
    private addDomainEvent;
}
//# sourceMappingURL=dialog.entity.d.ts.map