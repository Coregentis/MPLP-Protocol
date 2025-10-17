import { UUID, Timestamp, Version, PriorityType, WorkflowStageType, WorkflowStatusType, ExecutionModeType, StageStatus, CoreOperation, OrchestrationMode, ResourceAllocation, FaultTolerance, AuditEventType, ComplianceLevel, MonitoringProvider, ExportFormat, HealthStatus, CheckStatus, NotificationChannel, ChangeType, IndexingStrategy, SearchableField, IndexType, BusType, PublishedEvent, SubscribedEvent } from '../../types';
export interface RetryPolicyDto {
    maxAttempts: number;
    delayMs: number;
    backoffFactor?: number;
}
export interface WorkflowConfigDto {
    name?: string;
    description?: string;
    stages: WorkflowStageType[];
    executionMode: ExecutionModeType;
    parallelExecution: boolean;
    priority: PriorityType;
    timeoutMs?: number;
    maxConcurrentExecutions?: number;
    retryPolicy?: RetryPolicyDto;
}
export interface ExecutionContextDto {
    userId?: string;
    sessionId?: UUID;
    requestId?: UUID;
    priority?: PriorityType;
    metadata?: Record<string, unknown>;
    variables?: Record<string, unknown>;
}
export interface StageResultDto {
    status: StageStatus;
    startTime?: Timestamp;
    endTime?: Timestamp;
    durationMs?: number;
    result?: Record<string, unknown>;
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}
export interface ExecutionStatusDto {
    status: WorkflowStatusType;
    currentStage?: WorkflowStageType;
    completedStages?: WorkflowStageType[];
    stageResults?: Record<string, StageResultDto>;
    startTime?: Timestamp;
    endTime?: Timestamp;
    durationMs?: number;
    retryCount?: number;
}
export interface ModuleAdapterDto {
    adapterType: string;
    config?: Record<string, unknown>;
    timeoutMs?: number;
    retryPolicy?: {
        maxAttempts: number;
        delayMs: number;
    };
}
export interface DataMappingDto {
    sourceStage: WorkflowStageType;
    sourceField: string;
    targetField: string;
    transformation?: string;
}
export interface DataFlowDto {
    inputMappings?: Record<string, DataMappingDto>;
    outputMappings?: Record<string, DataMappingDto>;
}
export interface ModuleCoordinationDto {
    moduleAdapters?: Record<string, ModuleAdapterDto>;
    dataFlow?: DataFlowDto;
}
export interface EventListenerDto {
    eventType: string;
    handler: string;
    config?: Record<string, unknown>;
}
export interface EventRoutingDto {
    defaultHandler?: string;
    routingRules?: Array<{
        condition: string;
        handler: string;
    }>;
}
export interface EventHandlingDto {
    eventListeners?: EventListenerDto[];
    eventRouting?: EventRoutingDto;
}
export interface AuditEventDto {
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
}
export interface ComplianceSettingsDto {
    gdprEnabled?: boolean;
    hipaaEnabled?: boolean;
    soxEnabled?: boolean;
    coreAuditLevel?: ComplianceLevel;
    coreDataLogging?: boolean;
    customCompliance?: string[];
}
export interface AuditTrailDto {
    enabled: boolean;
    retentionDays: number;
    auditEvents?: AuditEventDto[];
    complianceSettings?: ComplianceSettingsDto;
}
export interface IntegrationEndpointsDto {
    metricsApi?: string;
    systemHealthApi?: string;
    workflowMetricsApi?: string;
    resourceMetricsApi?: string;
}
export interface SystemMetricsDto {
    trackWorkflowExecution?: boolean;
    trackModuleCoordination?: boolean;
    trackResourceUsage?: boolean;
    trackSystemHealth?: boolean;
}
export interface MonitoringIntegrationDto {
    enabled: boolean;
    supportedProviders: MonitoringProvider[];
    integrationEndpoints?: IntegrationEndpointsDto;
    systemMetrics?: SystemMetricsDto;
    exportFormats?: ExportFormat[];
}
export interface PerformanceMetricsDto {
    coreOrchestrationLatencyMs?: number;
    workflowCoordinationEfficiencyScore?: number;
    systemReliabilityScore?: number;
    moduleIntegrationSuccessPercent?: number;
    coreManagementEfficiencyScore?: number;
    activeWorkflowsCount?: number;
    coreOperationsPerSecond?: number;
    coreMemoryUsageMb?: number;
    averageWorkflowComplexityScore?: number;
}
export interface HealthCheckDto {
    checkName: string;
    status: CheckStatus;
    message?: string;
    durationMs?: number;
}
export interface HealthStatusDto {
    status?: HealthStatus;
    lastCheck?: Timestamp;
    checks?: HealthCheckDto[];
}
export interface AlertingThresholdsDto {
    maxCoreOrchestrationLatencyMs?: number;
    minWorkflowCoordinationEfficiencyScore?: number;
    minSystemReliabilityScore?: number;
    minModuleIntegrationSuccessPercent?: number;
    minCoreManagementEfficiencyScore?: number;
}
export interface AlertingDto {
    enabled?: boolean;
    thresholds?: AlertingThresholdsDto;
    notificationChannels?: NotificationChannel[];
}
export interface PerformanceMetricsConfigDto {
    enabled: boolean;
    collectionIntervalSeconds: number;
    metrics?: PerformanceMetricsDto;
    healthStatus?: HealthStatusDto;
    alerting?: AlertingDto;
}
export interface VersionHistoryEntryDto {
    versionId: UUID;
    versionNumber: number;
    createdAt: Timestamp;
    createdBy: string;
    changeSummary?: string;
    systemSnapshot?: Record<string, unknown>;
    changeType: ChangeType;
}
export interface AutoVersioningDto {
    enabled?: boolean;
    versionOnConfigChange?: boolean;
    versionOnDeployment?: boolean;
    versionOnScaling?: boolean;
}
export interface VersionHistoryDto {
    enabled: boolean;
    maxVersions: number;
    versions?: VersionHistoryEntryDto[];
    autoVersioning?: AutoVersioningDto;
}
export interface SearchIndexDto {
    indexId: string;
    indexName: string;
    fields: string[];
    indexType: IndexType;
    createdAt: Timestamp;
    lastUpdated?: Timestamp;
}
export interface SystemIndexingDto {
    enabled?: boolean;
    indexWorkflowData?: boolean;
    indexSystemMetrics?: boolean;
    indexAuditLogs?: boolean;
}
export interface AutoIndexingDto {
    enabled?: boolean;
    indexNewWorkflows?: boolean;
    reindexIntervalHours?: number;
}
export interface SearchMetadataDto {
    enabled: boolean;
    indexingStrategy: IndexingStrategy;
    searchableFields?: SearchableField[];
    searchIndexes?: SearchIndexDto[];
    systemIndexing?: SystemIndexingDto;
    autoIndexing?: AutoIndexingDto;
}
export interface CoreDetailsDto {
    orchestrationMode?: OrchestrationMode;
    resourceAllocation?: ResourceAllocation;
    faultTolerance?: FaultTolerance;
}
export interface EventBusConnectionDto {
    busType?: BusType;
    connectionString?: string;
    topicPrefix?: string;
    consumerGroup?: string;
}
export interface EventRoutingRuleDto {
    ruleId: string;
    condition: string;
    targetTopic: string;
    enabled?: boolean;
}
export interface EventRoutingConfigDto {
    routingRules?: EventRoutingRuleDto[];
}
export interface EventIntegrationDto {
    enabled: boolean;
    eventBusConnection?: EventBusConnectionDto;
    publishedEvents?: PublishedEvent[];
    subscribedEvents?: SubscribedEvent[];
    eventRouting?: EventRoutingConfigDto;
}
export interface CoreDto {
    protocolVersion: Version;
    timestamp: Timestamp;
    workflowId: UUID;
    orchestratorId: UUID;
    workflowConfig: WorkflowConfigDto;
    executionContext: ExecutionContextDto;
    executionStatus: ExecutionStatusDto;
    moduleCoordination?: ModuleCoordinationDto;
    eventHandling?: EventHandlingDto;
    auditTrail: AuditTrailDto;
    monitoringIntegration: MonitoringIntegrationDto;
    performanceMetrics: PerformanceMetricsConfigDto;
    versionHistory: VersionHistoryDto;
    searchMetadata: SearchMetadataDto;
    coreOperation: CoreOperation;
    coreDetails?: CoreDetailsDto;
    eventIntegration: EventIntegrationDto;
}
//# sourceMappingURL=core.dto.d.ts.map