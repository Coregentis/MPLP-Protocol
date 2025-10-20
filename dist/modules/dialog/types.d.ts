/**
 * Dialog Module Type Definitions
 * @description TypeScript类型定义 - 基于mplp-dialog.json Schema
 * @version 1.0.0
 */
export type UUID = string;
export type Timestamp = string;
export type DialogOperation = 'start' | 'continue' | 'pause' | 'resume' | 'end';
export type DialogType = 'interactive' | 'batch' | 'streaming';
export type TurnManagement = 'strict' | 'flexible' | 'free_form';
export type ContextRetention = 'none' | 'session' | 'persistent';
export type DialogStrategyType = 'fixed' | 'adaptive' | 'goal_driven' | 'exploratory';
export type AnalysisDepth = 'surface' | 'moderate' | 'deep';
export type Modality = 'text' | 'audio' | 'image' | 'video' | 'file';
export type ContentType = 'message' | 'question' | 'command' | 'feedback';
export type ContentPriority = 'low' | 'normal' | 'high' | 'urgent';
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'interrupted';
export type CheckStatus = 'pass' | 'fail' | 'warn';
export type AuditEventType = 'dialog_started' | 'dialog_ended' | 'message_sent' | 'message_received' | 'participant_joined' | 'participant_left' | 'content_moderated' | 'privacy_violation' | 'dialog_updated';
export type PublishedEventType = 'dialog_started' | 'dialog_ended' | 'message_sent' | 'message_received' | 'participant_joined' | 'participant_left' | 'quality_degraded' | 'satisfaction_low';
export type SubscribedEventType = 'context_updated' | 'plan_executed' | 'confirm_approved' | 'user_authenticated' | 'system_maintenance';
export type ChangeType = 'created' | 'updated' | 'configured' | 'participants_changed' | 'capabilities_updated';
export type MonitoringProvider = 'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom';
export type ExportFormat = 'prometheus' | 'opentelemetry' | 'custom';
export type NotificationChannel = 'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty';
export type EventBusType = 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
export type IndexingStrategy = 'full_text' | 'keyword' | 'semantic' | 'hybrid';
export type SearchableField = 'dialog_id' | 'name' | 'participants' | 'messages' | 'capabilities' | 'metadata' | 'tags';
export type IndexType = 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
export type AuditLevel = 'basic' | 'detailed' | 'comprehensive';
export interface DialogSchema {
    protocol_version: string;
    timestamp: Timestamp;
    dialog_id: UUID;
    name: string;
    description?: string;
    participants: string[];
    capabilities: DialogCapabilitiesSchema;
    strategy?: DialogStrategySchema;
    context?: DialogContextSchema;
    configuration?: DialogConfigurationSchema;
    metadata?: Record<string, unknown>;
    audit_trail: AuditTrailSchema;
    monitoring_integration: MonitoringIntegrationSchema;
    performance_metrics: PerformanceMetricsSchema;
    version_history: VersionHistorySchema;
    search_metadata: SearchMetadataSchema;
    dialog_operation: DialogOperation;
    dialog_details?: DialogDetailsSchema;
    event_integration: EventIntegrationSchema;
}
export interface DialogCapabilitiesSchema {
    basic: {
        enabled: true;
        message_history: boolean;
        participant_management: boolean;
    };
    intelligent_control?: {
        enabled: boolean;
        adaptive_rounds?: boolean;
        dynamic_strategy?: boolean;
        completeness_evaluation?: boolean;
    };
    critical_thinking?: {
        enabled: boolean;
        analysis_depth?: AnalysisDepth;
        question_generation?: boolean;
        logic_validation?: boolean;
    };
    knowledge_search?: {
        enabled: boolean;
        real_time_search?: boolean;
        knowledge_validation?: boolean;
        source_verification?: boolean;
    };
    multimodal?: {
        enabled: boolean;
        supported_modalities?: Modality[];
        cross_modal_translation?: boolean;
    };
}
export interface DialogStrategySchema {
    type: DialogStrategyType;
    rounds?: {
        min?: number;
        max?: number;
        target?: number;
    };
    exit_criteria?: {
        completeness_threshold?: number;
        user_satisfaction_threshold?: number;
        time_limit?: number;
    };
}
export interface DialogContextSchema {
    session_id?: string;
    context_id?: string;
    knowledge_base?: string;
    previous_dialogs?: string[];
}
export interface DialogConfigurationSchema {
    timeout?: number;
    max_participants?: number;
    retry_policy?: {
        max_retries?: number;
        backoff_ms?: number;
    };
    security?: {
        encryption?: boolean;
        authentication?: boolean;
        audit_logging?: boolean;
    };
}
export interface AuditTrailSchema {
    enabled: boolean;
    retention_days: number;
    audit_events?: AuditEventSchema[];
    compliance_settings?: {
        gdpr_enabled?: boolean;
        hipaa_enabled?: boolean;
        sox_enabled?: boolean;
        dialog_audit_level?: AuditLevel;
        dialog_data_logging?: boolean;
        content_retention_policy?: string;
        privacy_protection?: boolean;
        custom_compliance?: string[];
    };
}
export interface AuditEventSchema {
    event_id: UUID;
    event_type: AuditEventType;
    timestamp: Timestamp;
    user_id: string;
    user_role?: string;
    action: string;
    resource: string;
    dialog_operation?: string;
    dialog_id?: UUID;
    dialog_name?: string;
    dialog_type?: string;
    participant_ids?: string[];
    dialog_status?: string;
    content_hash?: string;
    dialog_details?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
    correlation_id?: UUID;
}
export interface MonitoringIntegrationSchema {
    enabled: boolean;
    supported_providers: MonitoringProvider[];
    integration_endpoints?: {
        metrics_api?: string;
        dialog_quality_api?: string;
        response_time_api?: string;
        satisfaction_api?: string;
    };
    dialog_metrics?: {
        track_response_times?: boolean;
        track_dialog_quality?: boolean;
        track_user_satisfaction?: boolean;
        track_content_moderation?: boolean;
    };
    export_formats?: ExportFormat[];
}
export interface PerformanceMetricsSchema {
    enabled: boolean;
    collection_interval_seconds: number;
    metrics?: {
        dialog_response_latency_ms?: number;
        dialog_completion_rate_percent?: number;
        dialog_quality_score?: number;
        user_experience_satisfaction_percent?: number;
        dialog_interaction_efficiency_score?: number;
        active_dialogs_count?: number;
        dialog_operations_per_second?: number;
        dialog_memory_usage_mb?: number;
        average_dialog_complexity_score?: number;
    };
    health_status?: {
        status: HealthStatus;
        last_check?: Timestamp;
        checks?: HealthCheckSchema[];
    };
    alerting?: {
        enabled?: boolean;
        thresholds?: {
            max_dialog_response_latency_ms?: number;
            min_dialog_completion_rate_percent?: number;
            min_dialog_quality_score?: number;
            min_user_experience_satisfaction_percent?: number;
            min_dialog_interaction_efficiency_score?: number;
        };
        notification_channels?: NotificationChannel[];
    };
}
export interface HealthCheckSchema {
    check_name: string;
    status: CheckStatus;
    message?: string;
    duration_ms?: number;
}
export interface VersionHistorySchema {
    enabled: boolean;
    max_versions: number;
    versions?: VersionSchema[];
    auto_versioning?: {
        enabled?: boolean;
        version_on_config_change?: boolean;
        version_on_participant_change?: boolean;
    };
}
export interface VersionSchema {
    version_id: UUID;
    version_number: number;
    created_at: Timestamp;
    created_by: string;
    change_summary?: string;
    dialog_snapshot?: Record<string, unknown>;
    change_type: ChangeType;
}
export interface SearchMetadataSchema {
    enabled: boolean;
    indexing_strategy: IndexingStrategy;
    searchable_fields?: SearchableField[];
    search_indexes?: SearchIndexSchema[];
    content_indexing?: {
        enabled?: boolean;
        index_message_content?: boolean;
        privacy_filtering?: boolean;
        sensitive_data_masking?: boolean;
    };
    auto_indexing?: {
        enabled?: boolean;
        index_new_dialogs?: boolean;
        reindex_interval_hours?: number;
    };
}
export interface SearchIndexSchema {
    index_id: string;
    index_name: string;
    fields: string[];
    index_type: IndexType;
    created_at?: Timestamp;
    last_updated?: Timestamp;
}
export interface DialogDetailsSchema {
    dialog_type?: DialogType;
    turn_management?: TurnManagement;
    context_retention?: ContextRetention;
}
export interface EventIntegrationSchema {
    enabled: boolean;
    event_bus_connection?: {
        bus_type?: EventBusType;
        connection_string?: string;
        topic_prefix?: string;
        consumer_group?: string;
    };
    published_events?: PublishedEventType[];
    subscribed_events?: SubscribedEventType[];
    event_routing?: {
        routing_rules?: EventRoutingRuleSchema[];
    };
}
export interface EventRoutingRuleSchema {
    rule_id: string;
    condition: string;
    target_topic: string;
    enabled?: boolean;
}
/**
 * 对话流程引擎接口 - 指南第75行要求
 */
export interface IDialogFlowEngine {
    initializeFlow(dialogId: UUID, flowTemplate?: string): Promise<DialogFlow>;
    executeStep(flowId: string, currentStep: string, message: DialogMessage): Promise<FlowExecutionResult>;
    getFlowStatus(flowId: string): Promise<FlowStatus>;
    updateFlowStep(flowId: string, newStep: string): Promise<void>;
}
/**
 * 对话状态管理器接口 - 指南第80行要求
 */
export interface IDialogStateManager {
    initializeState(dialogId: UUID, initialState?: Record<string, unknown>): Promise<void>;
    updateState(dialogId: UUID, message: DialogMessage, currentState: Record<string, unknown>): Promise<Record<string, unknown>>;
    getState(dialogId: UUID): Promise<Record<string, unknown>>;
    validateStateTransition(currentState: Record<string, unknown>, newState: Record<string, unknown>): Promise<boolean>;
}
/**
 * NLP处理器接口 - 指南第534行要求
 */
export interface INLPProcessor {
    extractTopics(content: string): Promise<string[]>;
    analyzeSentiment(content: string): Promise<SentimentResult>;
    extractKeyPhrases(content: string): Promise<string[]>;
    analyzeComplexity(content: string): Promise<LanguageComplexity>;
    detectLanguage(content: string): Promise<LanguageDetectionResult>;
}
/**
 * 分析引擎接口 - 指南第430行要求
 */
export interface IAnalyticsEngine {
    predict(features: Record<string, unknown>, modelType: string): Promise<PredictionResult>;
    analyzePatterns(data: unknown[]): Promise<PatternAnalysisResult>;
    generateInsights(data: unknown[]): Promise<AnalyticsInsight[]>;
    calculateMetrics(data: unknown[]): Promise<MetricsResult>;
}
/**
 * 内容审核器接口 - 指南第842行要求
 */
export interface IContentModerator {
    moderate(content: string): Promise<ModerationResult>;
    detectInappropriateContent(content: string): Promise<ContentViolation[]>;
    sanitizeContent(content: string): Promise<string>;
    checkContentPolicy(content: string, policy: string): Promise<PolicyCheckResult>;
}
/**
 * 隐私保护器接口 - 指南第867行要求
 */
export interface IPrivacyProtector {
    protectContent(content: string): Promise<string>;
    detectSensitiveData(content: string): Promise<boolean>;
    anonymizeData(data: Record<string, unknown>): Promise<Record<string, unknown>>;
    checkPrivacyCompliance(data: Record<string, unknown>, standard: string): Promise<ComplianceResult>;
}
export interface DialogFlow {
    flowId: string;
    dialogId: UUID;
    template: string;
    currentStep: string;
    steps: FlowStep[];
    status: 'active' | 'paused' | 'completed' | 'failed';
    createdAt: string;
    updatedAt: string;
}
export interface FlowStep {
    stepId: string;
    name: string;
    type: 'input' | 'process' | 'decision' | 'output';
    conditions?: Record<string, unknown>;
    actions?: string[];
    nextSteps?: string[];
}
export interface FlowExecutionResult {
    success: boolean;
    nextStep: string;
    suggestions?: string[];
    metadata?: Record<string, unknown>;
    errors?: string[];
}
export interface FlowStatus {
    flowId: string;
    status: 'active' | 'paused' | 'completed' | 'failed';
    currentStep: string;
    progress: number;
    startTime: string;
    lastActivity: string;
}
export interface DialogMessage {
    messageId: string;
    senderId: string;
    content: string;
    type: ContentType;
    timestamp: Date;
    metadata?: Record<string, unknown>;
    processed?: boolean;
}
export interface SentimentResult {
    score: number;
    label: 'positive' | 'neutral' | 'negative';
    confidence: number;
}
export interface LanguageComplexity {
    readabilityScore: number;
    vocabularyLevel: 'basic' | 'intermediate' | 'advanced';
    sentenceComplexity: number;
    technicalTerms: string[];
}
export interface LanguageDetectionResult {
    language: string;
    confidence: number;
    alternativeLanguages?: Array<{
        language: string;
        confidence: number;
    }>;
}
export interface PredictionResult {
    outcome: string;
    confidence: number;
    factors: string[];
    metadata?: Record<string, unknown>;
}
export interface PatternAnalysisResult {
    patterns: Array<{
        patternId: string;
        name: string;
        frequency: number;
        confidence: number;
        examples: unknown[];
    }>;
    insights: string[];
}
export interface AnalyticsInsight {
    type: 'trend' | 'anomaly' | 'pattern' | 'recommendation';
    title: string;
    description: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    actionable: boolean;
}
export interface MetricsResult {
    metrics: Record<string, number>;
    aggregations: Record<string, unknown>;
    timeRange: {
        start: string;
        end: string;
    };
}
export interface ModerationResult {
    approved: boolean;
    confidence: number;
    violations: ContentViolation[];
    sanitizedContent?: string;
}
export interface ContentViolation {
    type: 'profanity' | 'hate_speech' | 'spam' | 'inappropriate' | 'personal_info';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location?: {
        start: number;
        end: number;
    };
    suggestion?: string;
}
export interface PolicyCheckResult {
    compliant: boolean;
    policy: string;
    violations: string[];
    score: number;
}
export interface ComplianceResult {
    standard: string;
    compliant: boolean;
    score: number;
    violations: string[];
    recommendations: string[];
}
//# sourceMappingURL=types.d.ts.map