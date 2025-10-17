import { UUID } from '../../shared/types';
export type { UUID };
export type Timestamp = string;
export type TraceType = 'execution' | 'monitoring' | 'audit' | 'performance' | 'error' | 'decision';
export type Severity = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type TraceSeverity = Severity;
export type EventType = 'start' | 'progress' | 'checkpoint' | 'completion' | 'failure' | 'timeout' | 'interrupt';
export type EventCategory = 'system' | 'user' | 'external' | 'automatic';
export type ErrorType = 'system' | 'business' | 'validation' | 'network' | 'timeout' | 'security';
export type RecoveryActionType = 'retry' | 'fallback' | 'escalate' | 'ignore' | 'abort';
export type CorrelationType = 'causation' | 'temporal' | 'spatial' | 'logical';
export type MonitoringProvider = 'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'jaeger' | 'zipkin' | 'custom';
export type ExportFormat = 'opentelemetry' | 'jaeger' | 'zipkin' | 'prometheus' | 'custom';
export type IndexingStrategy = 'full_text' | 'keyword' | 'semantic' | 'hybrid';
export type SearchableField = 'trace_id' | 'context_id' | 'trace_type' | 'severity' | 'event' | 'tags' | 'metadata' | 'performance_metrics';
export type TraceOperation = 'start' | 'record' | 'analyze' | 'export' | 'archive' | 'update';
export type PublishedEvent = 'trace_created' | 'trace_updated' | 'trace_analyzed' | 'trace_correlated' | 'trace_archived';
export type SubscribedEvent = 'context_updated' | 'plan_executed' | 'confirm_approved' | 'system_alert';
export interface EventSource {
    component: string;
    module?: string;
    function?: string;
    lineNumber?: number;
}
export interface EventObject {
    type: EventType;
    name: string;
    description?: string;
    category: EventCategory;
    source: EventSource;
    data?: Record<string, unknown>;
}
export interface Environment {
    os?: string;
    platform?: string;
    runtimeVersion?: string;
    environmentVariables?: Record<string, string>;
}
export interface CallStackFrame {
    function: string;
    file?: string;
    line?: number;
    arguments?: Record<string, unknown>;
}
export interface ContextSnapshot {
    variables?: Record<string, unknown>;
    environment?: Environment;
    callStack?: CallStackFrame[];
}
export interface StackFrame {
    file: string;
    function: string;
    line: number;
    column?: number;
}
export interface RecoveryAction {
    action: RecoveryActionType;
    description: string;
    parameters?: Record<string, unknown>;
}
export interface ErrorInformation {
    errorCode: string;
    errorMessage: string;
    errorType: ErrorType;
    stackTrace?: StackFrame[];
    recoveryActions?: RecoveryAction[];
}
export interface DecisionOption {
    option: string;
    score: number;
    rationale?: string;
    riskFactors?: string[];
}
export interface DecisionCriterion {
    criterion: string;
    weight: number;
    evaluation?: string;
}
export interface DecisionLog {
    decisionPoint: string;
    optionsConsidered: DecisionOption[];
    selectedOption: string;
    decisionCriteria?: DecisionCriterion[];
    confidenceLevel?: number;
}
export interface Correlation {
    correlationId: UUID;
    type: CorrelationType;
    relatedTraceId: UUID;
    strength?: number;
    description?: string;
}
export interface AuditEvent {
    eventId: UUID;
    eventType: string;
    timestamp: Timestamp;
    userId: string;
    userRole?: string;
    action: string;
    resource: string;
    traceOperation?: string;
    traceId?: UUID;
    traceType?: string;
    severity?: string;
    spanIds?: UUID[];
    traceStatus?: string;
    traceDetails?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    correlationId?: UUID;
}
export interface ComplianceSettings {
    gdprEnabled?: boolean;
    hipaaEnabled?: boolean;
    soxEnabled?: boolean;
    traceAuditLevel?: 'basic' | 'detailed' | 'comprehensive';
    traceDataLogging?: boolean;
    customCompliance?: string[];
}
export interface AuditTrail {
    enabled: boolean;
    retentionDays: number;
    auditEvents?: AuditEvent[];
    complianceSettings?: ComplianceSettings;
}
export interface MetricsData {
    traceProcessingLatencyMs?: number;
    spanCollectionRatePerSecond?: number;
    traceAnalysisAccuracyPercent?: number;
    distributedTracingCoveragePercent?: number;
    traceMonitoringEfficiencyScore?: number;
    activeTracesCount?: number;
    traceOperationsPerSecond?: number;
    traceStorageUsageMb?: number;
    averageTraceComplexityScore?: number;
}
export interface HealthCheck {
    checkName: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    durationMs?: number;
}
export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'sampling';
    lastCheck?: Timestamp;
    checks?: HealthCheck[];
}
export interface AlertingThresholds {
    maxTraceProcessingLatencyMs?: number;
    minSpanCollectionRatePerSecond?: number;
    minTraceAnalysisAccuracyPercent?: number;
    minDistributedTracingCoveragePercent?: number;
    minTraceMonitoringEfficiencyScore?: number;
}
export interface AlertingConfig {
    enabled?: boolean;
    thresholds?: AlertingThresholds;
    notificationChannels?: ('email' | 'slack' | 'webhook' | 'sms' | 'pagerduty')[];
}
export interface PerformanceMetrics {
    enabled: boolean;
    collectionIntervalSeconds: number;
    metrics?: MetricsData;
    healthStatus?: HealthStatus;
    alerting?: AlertingConfig;
}
export interface IntegrationEndpoints {
    metricsApi?: string;
    tracingApi?: string;
    alertingApi?: string;
    dashboardApi?: string;
}
export interface SamplingConfig {
    samplingRate?: number;
    adaptiveSampling?: boolean;
    maxTracesPerSecond?: number;
}
export interface MonitoringIntegration {
    enabled: boolean;
    supportedProviders: MonitoringProvider[];
    integrationEndpoints?: IntegrationEndpoints;
    exportFormats?: ExportFormat[];
    samplingConfig?: SamplingConfig;
}
export interface VersionRecord {
    versionId: UUID;
    versionNumber: number;
    createdAt: Timestamp;
    createdBy: string;
    changeSummary?: string;
    traceSnapshot?: Record<string, unknown>;
    changeType: 'created' | 'updated' | 'analyzed' | 'enriched' | 'corrected';
}
export interface AutoVersioning {
    enabled?: boolean;
    versionOnUpdate?: boolean;
    versionOnAnalysis?: boolean;
}
export interface VersionHistory {
    enabled: boolean;
    maxVersions: number;
    versions?: VersionRecord[];
    autoVersioning?: AutoVersioning;
}
export interface SearchIndex {
    indexId: string;
    indexName: string;
    fields: string[];
    indexType: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
    createdAt?: Timestamp;
    lastUpdated?: Timestamp;
}
export interface AutoIndexing {
    enabled?: boolean;
    indexNewTraces?: boolean;
    reindexIntervalHours?: number;
}
export interface SearchMetadata {
    enabled: boolean;
    indexingStrategy: IndexingStrategy;
    searchableFields?: SearchableField[];
    searchIndexes?: SearchIndex[];
    autoIndexing?: AutoIndexing;
}
export interface EventBusConnection {
    busType?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
    connectionString?: string;
    topicPrefix?: string;
    consumerGroup?: string;
}
export interface EventRoutingRule {
    ruleId: string;
    condition: string;
    targetTopic: string;
    enabled?: boolean;
}
export interface EventRouting {
    routingRules?: EventRoutingRule[];
}
export interface EventIntegration {
    enabled: boolean;
    eventBusConnection?: EventBusConnection;
    publishedEvents?: PublishedEvent[];
    subscribedEvents?: SubscribedEvent[];
    eventRouting?: EventRouting;
}
export interface TraceDetails {
    traceLevel?: 'basic' | 'detailed' | 'comprehensive';
    samplingRate?: number;
    retentionDays?: number;
}
export interface TraceEntityData {
    protocolVersion: string;
    timestamp: Timestamp;
    traceId: UUID;
    contextId: UUID;
    planId?: UUID;
    taskId?: UUID;
    traceType: TraceType;
    severity: Severity;
    event: EventObject;
    contextSnapshot?: ContextSnapshot;
    errorInformation?: ErrorInformation;
    decisionLog?: DecisionLog;
    correlations?: Correlation[];
    auditTrail: AuditTrail;
    performanceMetrics: PerformanceMetrics;
    monitoringIntegration: MonitoringIntegration;
    versionHistory: VersionHistory;
    searchMetadata: SearchMetadata;
    traceOperation: TraceOperation;
    traceDetails?: TraceDetails;
    eventIntegration: EventIntegration;
    spans?: SpanEntity[];
    statistics?: TraceStatistics;
    containsSensitiveData?: boolean;
}
export interface StartTraceData {
    name: string;
    type: TraceType;
    contextId: UUID;
    parentTraceId?: UUID;
    tags?: Record<string, string>;
    metadata?: Record<string, unknown>;
    collectionConfig?: DataCollectionConfig;
}
export interface EndTraceData {
    endTime?: Date;
    finalStatus?: 'completed' | 'error' | 'cancelled';
}
export interface SpanData {
    parentSpanId?: string;
    operationName: string;
    startTime?: Date;
    endTime?: Date;
    duration?: number;
    tags?: Record<string, string>;
    logs?: LogEntry[];
    status?: 'active' | 'completed' | 'error';
}
export interface SpanEntity {
    spanId: string;
    traceId: string;
    parentSpanId?: string;
    operationName: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    tags: Record<string, string>;
    logs: LogEntry[];
    status: 'active' | 'completed' | 'error';
}
export interface LogEntry {
    timestamp: Date;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    fields?: Record<string, unknown>;
}
export interface TraceQuery {
    contextId?: UUID;
    traceType?: TraceType | TraceType[];
    severity?: Severity | Severity[];
    startTime?: Date;
    endTime?: Date;
    tags?: Record<string, string>;
    limit?: number;
    offset?: number;
}
export interface TraceStatistics {
    totalSpans: number;
    totalDuration: number;
    averageSpanDuration: number;
    errorCount: number;
    successRate: number;
    criticalPath: string[];
    bottlenecks: string[];
}
export interface DataCollectionConfig {
    samplingRate?: number;
    enableMetrics?: boolean;
    enableLogs?: boolean;
    bufferSize?: number;
}
export interface IDataCollector {
    startCollection(traceId: string, config: DataCollectionConfig): Promise<void>;
    stopCollection(traceId: string): Promise<void>;
}
export interface ILogger {
    debug(message: string, meta?: Record<string, unknown>): void;
    info(message: string, meta?: Record<string, unknown>): void;
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, meta?: Record<string, unknown>): void;
}
export interface TracePerformanceAnalysis {
    traceId: string;
    timestamp: string;
    performance: {
        totalDuration: number;
        spanCount: number;
        averageSpanDuration: number;
        slowestOperations: Array<{
            operation: string;
            duration: number;
        }>;
        fastestOperations: Array<{
            operation: string;
            duration: number;
        }>;
    };
    bottlenecks: {
        criticalPath: string[];
        performanceBottlenecks: string[];
        resourceBottlenecks: string[];
    };
    recommendations: string[];
}
export interface TraceTrends {
    timeRange: TimeRange;
    totalTraces: number;
    trends: {
        volumeTrend: {
            trend: string;
            change: number;
        };
        performanceTrend: {
            trend: string;
            change: number;
        };
        errorRateTrend: {
            trend: string;
            change: number;
        };
        durationTrend: {
            trend: string;
            change: number;
        };
    };
    insights: {
        peakHours: string[];
        commonPatterns: string[];
        performanceRegression: boolean;
    };
}
export interface TimeRange {
    startTime: Date;
    endTime: Date;
}
export interface TraceFilters {
    contextId?: string;
    traceType?: TraceType;
    severity?: Severity;
}
export interface TraceAnomaly {
    type: 'performance' | 'error' | 'volume';
    severity: 'low' | 'medium' | 'high';
    description: string;
    timestamp: string;
    affectedTraces: string[];
}
export type AnalysisReportType = 'performance' | 'availability' | 'error_analysis' | 'capacity_planning';
export interface ReportParams {
    timeRange: TimeRange;
    filters?: TraceFilters;
    includeDetails?: boolean;
}
export interface AnalysisReport {
    reportType: AnalysisReportType;
    generatedAt: string;
    data: Record<string, unknown>;
}
export interface RealtimeMetrics {
    timestamp: string;
    metrics: {
        activeTraces: number;
        completedTraces: number;
        errorTraces: number;
        averageResponseTime: number;
        throughput: number;
        errorRate: number;
    };
    alerts: Alert[];
}
export interface Alert {
    type: string;
    severity: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
}
export interface TraceSecurityAudit {
    auditId: string;
    timeRange: TimeRange;
    startTime: Date;
    endTime: Date;
    securityFindings: SecurityFinding[];
    complianceFindings: ComplianceFinding[];
    overallScore: number;
    recommendations: string[];
}
export interface SecurityFinding {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
}
export interface ComplianceFinding {
    id: string;
    standard: ComplianceStandard;
    violation: string;
    severity: 'low' | 'medium' | 'high';
    remediation: string;
}
export type ComplianceStandard = 'GDPR' | 'HIPAA' | 'SOX';
export interface ComplianceResult {
    compliant: boolean;
    findings: string[];
    score: number;
}
export interface DataRetentionPolicy {
    name: string;
    retentionPeriod: number;
    archiveBeforeDelete: boolean;
}
export interface DataRetentionResult {
    totalProcessed: number;
    archived: number;
    deleted: number;
    errors: Array<{
        traceId: string;
        error: string;
    }>;
}
export interface CreateTraceRequest {
    contextId: UUID;
    planId?: UUID;
    taskId?: UUID;
    traceType: TraceType;
    severity: Severity;
    event: Partial<EventObject>;
    contextSnapshot?: Partial<ContextSnapshot>;
    errorInformation?: Partial<ErrorInformation>;
    decisionLog?: Partial<DecisionLog>;
    traceOperation: TraceOperation;
    traceDetails?: Partial<TraceDetails>;
}
export interface UpdateTraceRequest {
    traceId: UUID;
    severity?: Severity;
    event?: Partial<EventObject>;
    contextSnapshot?: Partial<ContextSnapshot>;
    errorInformation?: Partial<ErrorInformation>;
    decisionLog?: Partial<DecisionLog>;
    correlations?: Partial<Correlation>[];
    traceDetails?: Partial<TraceDetails>;
}
export interface TraceQueryFilter {
    traceType?: TraceType | TraceType[];
    severity?: Severity | Severity[];
    contextId?: UUID;
    planId?: UUID;
    taskId?: UUID;
    createdAfter?: Timestamp;
    createdBefore?: Timestamp;
    eventCategory?: EventCategory;
    hasErrors?: boolean;
    hasDecisions?: boolean;
}
export interface TraceExecutionResult {
    success: boolean;
    traceId?: UUID;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    metadata?: {
        processingTime: number;
        correlationsFound: number;
        metricsCollected: number;
    };
}
export interface TraceAnalysisResult {
    traceId: UUID;
    analysisType: 'performance' | 'error' | 'decision' | 'correlation';
    results: {
        insights: string[];
        recommendations: string[];
        anomalies: string[];
        patterns: string[];
    };
    confidence: number;
    analysisTime: number;
}
export interface TraceValidationResult {
    isValid: boolean;
    violations: string[];
    warnings: string[];
    recommendations: string[];
}
export interface ProtocolMetadata {
    name: string;
    version: string;
    description: string;
    capabilities: string[];
    supportedOperations: string[];
    crossCuttingConcerns: Record<string, boolean>;
}
export interface ProtocolHealthStatus {
    status: string;
    timestamp: string;
    details?: Record<string, unknown>;
    error?: string;
}
export type SchemaEventType = 'start' | 'progress' | 'checkpoint' | 'completion' | 'failure' | 'timeout' | 'interrupt';
export type SchemaEventCategory = 'system' | 'user' | 'external' | 'automatic';
export interface TraceCorrelation {
    correlationId: string;
    type: 'causation' | 'temporal' | 'spatial' | 'logical';
    relatedTraceId: string;
    strength?: number;
    description?: string;
}
export type SchemaTraceType = 'execution' | 'monitoring' | 'audit' | 'performance' | 'error' | 'decision';
export type SchemaSeverity = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type SchemaErrorType = 'system' | 'business' | 'validation' | 'network' | 'timeout' | 'security';
export type SchemaRecoveryAction = 'retry' | 'fallback' | 'escalate' | 'ignore' | 'abort';
export type SchemaCorrelationType = 'causation' | 'temporal' | 'spatial' | 'logical';
export type SchemaAuditEventType = 'trace_created' | 'trace_updated' | 'trace_analyzed' | 'trace_archived' | 'trace_deleted' | 'span_created' | 'span_completed' | 'metrics_collected';
export type SchemaHealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'sampling';
export type SchemaCheckStatus = 'pass' | 'fail' | 'warn';
export type SchemaNotificationChannel = 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
export type SchemaMonitoringProvider = 'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'jaeger' | 'zipkin' | 'custom';
export type SchemaExportFormat = 'opentelemetry' | 'jaeger' | 'zipkin' | 'prometheus' | 'custom';
export type SchemaEventBusType = 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
export type SchemaIndexType = 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
export type SchemaIndexingStrategy = 'full_text' | 'keyword' | 'semantic' | 'hybrid';
export type SchemaSearchableField = 'trace_id' | 'context_id' | 'trace_type' | 'severity' | 'event' | 'tags' | 'metadata' | 'performance_metrics';
export type SchemaTraceLevel = 'basic' | 'detailed' | 'comprehensive';
export type SchemaChangeType = 'created' | 'updated' | 'analyzed' | 'enriched' | 'corrected';
export interface TraceSchema {
    protocol_version: string;
    timestamp: string;
    trace_id: string;
    context_id: string;
    plan_id?: string;
    task_id?: string;
    trace_type: string;
    severity: string;
    event: {
        type: string;
        name: string;
        description?: string;
        category: string;
        source: {
            component: string;
            module?: string;
            function?: string;
            line_number?: number;
        };
        data?: Record<string, unknown>;
    };
    context_snapshot?: {
        variables?: Record<string, unknown>;
        environment?: {
            os?: string;
            platform?: string;
            runtime_version?: string;
            environment_variables?: Record<string, string>;
        };
        call_stack?: Array<{
            function: string;
            file?: string;
            line?: number;
            arguments?: Record<string, unknown>;
        }>;
    };
    error_information?: {
        error_code: string;
        error_message: string;
        error_type: string;
        stack_trace?: Array<{
            file: string;
            function: string;
            line: number;
            column?: number;
        }>;
        recovery_actions?: Array<{
            action: string;
            description: string;
            parameters?: Record<string, unknown>;
        }>;
    };
    decision_log?: {
        decision_point: string;
        options_considered: Array<{
            option: string;
            score: number;
            rationale?: string;
            risk_factors?: string[];
        }>;
        selected_option: string;
        decision_criteria?: Array<{
            criterion: string;
            weight: number;
            evaluation?: string;
        }>;
        confidence_level?: number;
    };
    correlations?: Array<{
        correlation_id: string;
        type: string;
        related_trace_id: string;
        strength?: number;
        description?: string;
    }>;
    audit_trail: {
        enabled: boolean;
        retention_days: number;
        audit_events?: Array<{
            event_id: string;
            event_type: string;
            timestamp: string;
            user_id: string;
            user_role?: string;
            action: string;
            resource: string;
            trace_operation?: string;
            trace_id?: string;
            trace_type?: string;
            severity?: string;
            span_ids?: string[];
            trace_status?: string;
            trace_details?: Record<string, unknown>;
            ip_address?: string;
            user_agent?: string;
            session_id?: string;
            correlation_id?: string;
        }>;
        compliance_settings?: {
            gdpr_enabled?: boolean;
            hipaa_enabled?: boolean;
            sox_enabled?: boolean;
            trace_audit_level?: string;
            trace_data_logging?: boolean;
            custom_compliance?: string[];
        };
    };
    performance_metrics: {
        enabled: boolean;
        collection_interval_seconds: number;
        metrics?: {
            trace_processing_latency_ms?: number;
            span_collection_rate_per_second?: number;
            trace_analysis_accuracy_percent?: number;
            distributed_tracing_coverage_percent?: number;
            trace_monitoring_efficiency_score?: number;
            active_traces_count?: number;
            trace_operations_per_second?: number;
            trace_storage_usage_mb?: number;
            average_trace_complexity_score?: number;
        };
        health_status?: {
            status: string;
            last_check?: string;
            checks?: Array<{
                check_name: string;
                status: string;
                message?: string;
                duration_ms?: number;
            }>;
        };
        alerting?: {
            enabled?: boolean;
            thresholds?: {
                max_trace_processing_latency_ms?: number;
                min_span_collection_rate_per_second?: number;
                min_trace_analysis_accuracy_percent?: number;
                min_distributed_tracing_coverage_percent?: number;
                min_trace_monitoring_efficiency_score?: number;
            };
            notification_channels?: string[];
        };
    };
    monitoring_integration: {
        enabled: boolean;
        supported_providers: string[];
        integration_endpoints?: {
            metrics_api?: string;
            tracing_api?: string;
            alerting_api?: string;
            dashboard_api?: string;
        };
        export_formats?: string[];
        sampling_config?: {
            sampling_rate?: number;
            adaptive_sampling?: boolean;
            max_traces_per_second?: number;
        };
    };
    version_history: {
        enabled: boolean;
        max_versions: number;
        versions?: Array<{
            version_id: string;
            version_number: number;
            created_at: string;
            created_by: string;
            change_summary?: string;
            trace_snapshot?: Record<string, unknown>;
            change_type: string;
        }>;
        auto_versioning?: {
            enabled?: boolean;
            version_on_update?: boolean;
            version_on_analysis?: boolean;
        };
    };
    search_metadata: {
        enabled: boolean;
        indexing_strategy: string;
        searchable_fields?: string[];
        search_indexes?: Array<{
            index_id: string;
            index_name: string;
            fields: string[];
            index_type: string;
            created_at?: string;
            last_updated?: string;
        }>;
        auto_indexing?: {
            enabled?: boolean;
            index_new_traces?: boolean;
            reindex_interval_hours?: number;
        };
    };
    trace_operation: string;
    trace_details?: {
        trace_level?: string;
        sampling_rate?: number;
        retention_days?: number;
    };
    event_integration: {
        enabled: boolean;
        event_bus_connection?: {
            bus_type?: string;
            connection_string?: string;
            topic_prefix?: string;
            consumer_group?: string;
        };
        published_events?: string[];
        subscribed_events?: string[];
        event_routing?: {
            routing_rules?: Array<{
                rule_id: string;
                condition: string;
                target_topic: string;
                enabled?: boolean;
            }>;
        };
    };
}
export interface TraceProtocolFactoryConfig {
    enableLogging?: boolean;
    enableMetrics?: boolean;
    enableCaching?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    traceConfiguration?: {
        maxTraces?: number;
        defaultTraceType?: TraceType;
        retentionPeriodDays?: number;
        compressionEnabled?: boolean;
        indexingEnabled?: boolean;
    };
    monitoringConfiguration?: {
        enabled?: boolean;
        samplingRate?: number;
        alertThresholds?: {
            errorRate?: number;
            latencyP99Ms?: number;
            throughputRps?: number;
        };
        exportInterval?: number;
    };
    performanceMetrics?: {
        enabled?: boolean;
        collectionIntervalSeconds?: number;
        traceCreationLatencyThresholdMs?: number;
        traceQueryLatencyThresholdMs?: number;
        storageEfficiencyThreshold?: number;
    };
    crossCuttingConcerns?: {
        security?: {
            enabled: boolean;
        };
        performance?: {
            enabled: boolean;
        };
        eventBus?: {
            enabled: boolean;
        };
        errorHandler?: {
            enabled: boolean;
        };
        coordination?: {
            enabled: boolean;
        };
        orchestration?: {
            enabled: boolean;
        };
        stateSync?: {
            enabled: boolean;
        };
        transaction?: {
            enabled: boolean;
        };
        protocolVersion?: {
            enabled: boolean;
        };
    };
}
export type TraceOperationResult = {
    success: boolean;
    traceId?: UUID;
    error?: string;
    metadata?: Record<string, unknown>;
};
//# sourceMappingURL=types.d.ts.map