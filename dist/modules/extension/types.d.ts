import { UUID } from '../../shared/types';
export type ExtensionType = 'plugin' | 'adapter' | 'connector' | 'middleware' | 'hook' | 'transformer';
export type ExtensionStatus = 'installed' | 'active' | 'inactive' | 'disabled' | 'error' | 'updating' | 'uninstalling';
export type ExtensionPointType = 'hook' | 'filter' | 'action' | 'api_endpoint' | 'event_listener';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
export type DeliveryGuarantee = 'at_least_once' | 'at_most_once' | 'exactly_once';
export type MonitoringProvider = 'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom';
export type AuditEventType = 'install' | 'uninstall' | 'activate' | 'deactivate' | 'configure' | 'update' | 'error' | 'security_violation';
export interface ExtensionCompatibility {
    mplpVersion: string;
    requiredModules: string[];
    dependencies: ExtensionDependency[];
    conflicts: ExtensionConflict[];
}
export interface ExtensionDependency {
    name: string;
    version: string;
    optional: boolean;
    reason?: string;
}
export interface ExtensionConflict {
    name: string;
    version: string;
    reason: string;
}
export interface ExtensionConfiguration {
    schema: Record<string, unknown>;
    currentConfig: Record<string, unknown>;
    defaultConfig: Record<string, unknown>;
    validationRules: ValidationRule[];
}
export interface ValidationRule {
    field: string;
    type: string;
    required: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    enum?: string[];
}
export interface ExtensionPoint {
    id: string;
    name: string;
    type: ExtensionPointType;
    description?: string;
    parameters: ExtensionPointParameter[];
    returnType?: string;
    async: boolean;
    timeout?: number;
    retryPolicy?: RetryPolicy;
    conditionalExecution?: ConditionalExecution;
    executionOrder: number;
}
export interface ExtensionPointParameter {
    name: string;
    type: string;
    required: boolean;
    description?: string;
    defaultValue?: unknown;
}
export interface RetryPolicy {
    maxAttempts: number;
    backoffStrategy: 'fixed' | 'exponential' | 'linear';
    initialDelay: number;
    maxDelay: number;
    retryableErrors: string[];
}
export interface ConditionalExecution {
    condition: string;
    parameters: Record<string, unknown>;
}
export interface ApiExtension {
    endpoint: string;
    method: HttpMethod;
    handler: string;
    middleware: string[];
    authentication: AuthenticationConfig;
    rateLimit: RateLimitConfig;
    validation: ValidationConfig;
    documentation: ApiDocumentation;
}
export interface AuthenticationConfig {
    required: boolean;
    schemes: string[];
    permissions: string[];
}
export interface RateLimitConfig {
    enabled: boolean;
    requestsPerMinute: number;
    burstSize: number;
    keyGenerator: string;
}
export interface ValidationConfig {
    requestSchema?: Record<string, unknown>;
    responseSchema?: Record<string, unknown>;
    strictMode: boolean;
}
export interface ApiDocumentation {
    summary: string;
    description?: string;
    tags: string[];
    examples: ApiExample[];
}
export interface ApiExample {
    name: string;
    description?: string;
    request: Record<string, unknown>;
    response: Record<string, unknown>;
}
export interface EventSubscription {
    eventPattern: string;
    handler: string;
    filterConditions: FilterCondition[];
    deliveryGuarantee: DeliveryGuarantee;
    deadLetterQueue: DeadLetterQueueConfig;
    retryPolicy: RetryPolicy;
    batchProcessing: BatchProcessingConfig;
}
export interface FilterCondition {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex';
    value: unknown;
}
export interface DeadLetterQueueConfig {
    enabled: boolean;
    maxRetries: number;
    retentionPeriod: number;
}
export interface BatchProcessingConfig {
    enabled: boolean;
    batchSize: number;
    flushInterval: number;
}
export interface ExtensionLifecycle {
    installDate: string;
    lastUpdate: string;
    activationCount: number;
    errorCount: number;
    performanceMetrics: PerformanceMetrics;
    healthCheck: HealthCheckConfig;
}
export interface PerformanceMetrics {
    averageResponseTime: number;
    throughput: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
    lastMeasurement: string;
}
export interface HealthCheckConfig {
    enabled: boolean;
    interval: number;
    timeout: number;
    endpoint?: string;
    expectedStatus: number;
    healthyThreshold: number;
    unhealthyThreshold: number;
}
export interface ExtensionSecurity {
    sandboxEnabled: boolean;
    resourceLimits: ResourceLimits;
    codeSigning: CodeSigningConfig;
    permissions: ExtensionPermissions;
}
export interface ResourceLimits {
    maxMemory: number;
    maxCpu: number;
    maxFileSize: number;
    maxNetworkConnections: number;
    allowedDomains: string[];
    blockedDomains: string[];
    allowedHosts: string[];
    allowedPorts: number[];
    protocols: string[];
}
export interface CodeSigningConfig {
    required: boolean;
    trustedSigners: string[];
    verificationEndpoint?: string;
}
export interface ExtensionPermissions {
    fileSystem: FileSystemPermissions;
    network: NetworkPermissions;
    database: DatabasePermissions;
    api: ApiPermissions;
}
export interface FileSystemPermissions {
    read: string[];
    write: string[];
    execute: string[];
}
export interface NetworkPermissions {
    allowedHosts: string[];
    allowedPorts: number[];
    protocols: string[];
}
export interface DatabasePermissions {
    read: string[];
    write: string[];
    admin: string[];
}
export interface ApiPermissions {
    endpoints: string[];
    methods: HttpMethod[];
    rateLimit: number;
}
export interface ExtensionEntityData {
    protocolVersion: string;
    timestamp: string;
    extensionId: UUID;
    contextId: UUID;
    name: string;
    displayName: string;
    description: string;
    version: string;
    extensionType: ExtensionType;
    status: ExtensionStatus;
    compatibility: ExtensionCompatibility;
    configuration: ExtensionConfiguration;
    extensionPoints: ExtensionPoint[];
    apiExtensions: ApiExtension[];
    eventSubscriptions: EventSubscription[];
    lifecycle: ExtensionLifecycle;
    security: ExtensionSecurity;
    metadata: ExtensionMetadata;
    auditTrail: AuditTrail;
    performanceMetrics: ExtensionPerformanceMetrics;
    monitoringIntegration: MonitoringIntegration;
    versionHistory: VersionHistory;
    searchMetadata: SearchMetadata;
    eventIntegration: EventIntegration;
}
export interface ExtensionMetadata {
    author: AuthorInfo;
    organization?: OrganizationInfo;
    license: LicenseInfo;
    homepage?: string;
    repository?: RepositoryInfo;
    documentation?: string;
    support?: SupportInfo;
    keywords: string[];
    category: string;
    screenshots: string[];
    changelog?: string;
}
export interface AuthorInfo {
    name: string;
    email?: string;
    url?: string;
}
export interface OrganizationInfo {
    name: string;
    url?: string;
    email?: string;
}
export interface LicenseInfo {
    type: string;
    url?: string;
}
export interface RepositoryInfo {
    type: string;
    url: string;
    directory?: string;
}
export interface SupportInfo {
    email?: string;
    url?: string;
    issues?: string;
}
export interface AuditTrail {
    events: AuditEvent[];
    complianceSettings: ComplianceSettings;
}
export interface AuditEvent {
    id: string;
    timestamp: string;
    eventType: AuditEventType;
    userId?: string;
    details: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}
export interface ComplianceSettings {
    retentionPeriod: number;
    encryptionEnabled: boolean;
    accessLogging: boolean;
    dataClassification: string;
}
export interface ExtensionPerformanceMetrics {
    activationLatency: number;
    executionTime: number;
    memoryFootprint: number;
    cpuUtilization: number;
    networkLatency: number;
    errorRate: number;
    throughput: number;
    availability: number;
    efficiencyScore: number;
    healthStatus: 'healthy' | 'degraded' | 'unhealthy';
    alerts: PerformanceAlert[];
}
export interface PerformanceAlert {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: string;
    threshold: number;
    currentValue: number;
    resolved: boolean;
}
export interface MonitoringIntegration {
    providers: MonitoringProvider[];
    endpoints: MonitoringEndpoint[];
    dashboards: DashboardConfig[];
    alerting: AlertingConfig;
}
export interface MonitoringEndpoint {
    provider: MonitoringProvider;
    url: string;
    credentials?: CredentialConfig;
    metrics: string[];
}
export interface CredentialConfig {
    type: 'api_key' | 'oauth' | 'basic_auth';
    value: string;
}
export interface DashboardConfig {
    name: string;
    provider: MonitoringProvider;
    url: string;
    widgets: WidgetConfig[];
}
export interface WidgetConfig {
    type: string;
    title: string;
    query: string;
    visualization: string;
}
export interface AlertingConfig {
    enabled: boolean;
    channels: AlertChannel[];
    rules: AlertRule[];
}
export interface AlertChannel {
    type: 'email' | 'slack' | 'webhook' | 'sms';
    config: Record<string, unknown>;
}
export interface AlertRule {
    name: string;
    condition: string;
    threshold: number;
    duration: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    channels: string[];
}
export interface VersionHistory {
    versions: VersionInfo[];
    autoVersioning: AutoVersioningConfig;
}
export interface VersionInfo {
    version: string;
    releaseDate: string;
    changelog: string;
    breaking: boolean;
    deprecated: string[];
    migration?: MigrationInfo;
}
export interface MigrationInfo {
    from: string;
    to: string;
    script?: string;
    manual: boolean;
    instructions: string;
}
export interface AutoVersioningConfig {
    enabled: boolean;
    strategy: 'semantic' | 'timestamp' | 'build_number';
    prerelease: boolean;
    buildMetadata: boolean;
}
export interface SearchMetadata {
    indexedFields: string[];
    searchStrategies: SearchStrategy[];
    facets: SearchFacet[];
}
export interface SearchStrategy {
    name: string;
    type: 'exact' | 'fuzzy' | 'semantic' | 'regex';
    weight: number;
    fields: string[];
}
export interface SearchFacet {
    field: string;
    type: 'terms' | 'range' | 'date_histogram';
    size: number;
}
export interface EventIntegration {
    eventBus: EventBusConnection;
    eventRouting: EventRoutingConfig;
    eventTransformation: EventTransformationConfig;
}
export interface EventBusConnection {
    provider: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
    connectionString: string;
    credentials?: CredentialConfig;
    topics: string[];
}
export interface EventRoutingConfig {
    rules: EventRoutingRule[];
    defaultRoute?: string;
    errorHandling: EventErrorHandling;
}
export interface EventRoutingRule {
    pattern: string;
    destination: string;
    transformation?: string;
    condition?: string;
}
export interface EventErrorHandling {
    strategy: 'retry' | 'dead_letter' | 'ignore' | 'alert';
    maxRetries: number;
    backoffStrategy: 'fixed' | 'exponential' | 'linear';
    deadLetterTopic?: string;
}
export interface EventTransformationConfig {
    enabled: boolean;
    transformers: EventTransformer[];
}
export interface EventTransformer {
    name: string;
    type: 'map' | 'filter' | 'aggregate' | 'enrich';
    config: Record<string, unknown>;
    order: number;
}
export interface ExtensionSchema {
    protocol_version: string;
    timestamp: string;
    extension_id: string;
    context_id: string;
    name: string;
    display_name: string;
    description: string;
    version: string;
    extension_type: ExtensionType;
    status: ExtensionStatus;
    compatibility: ExtensionCompatibilitySchema;
    configuration: ExtensionConfigurationSchema;
    extension_points: ExtensionPointSchema[];
    api_extensions: ApiExtensionSchema[];
    event_subscriptions: EventSubscriptionSchema[];
    lifecycle: ExtensionLifecycleSchema;
    security: ExtensionSecuritySchema;
    metadata: ExtensionMetadataSchema;
    audit_trail: AuditTrailSchema;
    performance_metrics: ExtensionPerformanceMetricsSchema;
    monitoring_integration: MonitoringIntegrationSchema;
    version_history: VersionHistorySchema;
    search_metadata: SearchMetadataSchema;
    event_integration: EventIntegrationSchema;
}
export interface ExtensionCompatibilitySchema {
    mplp_version: string;
    required_modules?: RequiredModuleSchema[];
    dependencies?: DependencySchema[];
    conflicts?: ConflictSchema[];
}
export interface RequiredModuleSchema {
    module: string;
    min_version?: string;
    max_version?: string;
}
export interface DependencySchema {
    extension_id: string;
    name: string;
    version_range: string;
    optional?: boolean;
}
export interface ConflictSchema {
    extension_id: string;
    name: string;
    reason: string;
}
export interface ExtensionConfigurationSchema {
    schema: Record<string, unknown>;
    current_config: Record<string, unknown>;
    default_config?: Record<string, unknown>;
    validation_rules?: ValidationRuleSchema[];
}
export interface ValidationRuleSchema {
    rule: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
}
export interface ExtensionPointSchema {
    point_id: string;
    name: string;
    type: 'hook' | 'filter' | 'action' | 'api_endpoint' | 'event_listener';
    target_module: string;
    event_name?: string;
    execution_order: number;
    enabled: boolean;
    handler: HandlerSchema;
    conditions?: ConditionsSchema;
}
export interface HandlerSchema {
    function_name: string;
    parameters?: Record<string, unknown>;
    timeout_ms?: number;
    retry_policy?: RetryPolicySchema;
}
export interface RetryPolicySchema {
    max_retries?: number;
    retry_delay_ms?: number;
    backoff_strategy?: 'fixed' | 'exponential' | 'linear';
}
export interface ConditionsSchema {
    when?: string;
    required_permissions?: string[];
    context_filters?: Record<string, unknown>;
}
export interface ApiExtensionSchema {
    endpoint_id: string;
    path: string;
    method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head';
    description?: string;
    handler: string;
    middleware?: string[];
    authentication_required: boolean;
    required_permissions?: string[];
    rate_limit?: RateLimitSchema;
    request_schema?: Record<string, unknown>;
    response_schema?: Record<string, unknown>;
}
export interface RateLimitSchema {
    requests_per_minute?: number;
    burst_size?: number;
}
export interface EventSubscriptionSchema {
    subscription_id: string;
    event_pattern: string;
    source_module: string;
    handler: string;
    filter_conditions?: Record<string, unknown>;
    delivery_guarantees: 'at_least_once' | 'at_most_once' | 'exactly_once';
    dead_letter_queue?: boolean;
}
export interface ExtensionLifecycleSchema {
    install_date: string;
    last_update?: string;
    activation_count: number;
    error_count: number;
    last_error?: LastErrorSchema;
    performance_metrics?: PerformanceMetricsSchema;
    health_check?: HealthCheckSchema;
}
export interface LastErrorSchema {
    timestamp: string;
    error_type: string;
    message: string;
    stack_trace?: string;
}
export interface PerformanceMetricsSchema {
    average_execution_time_ms?: number;
    total_executions?: number;
    success_rate?: number;
    memory_usage_mb?: number;
}
export interface HealthCheckSchema {
    endpoint?: string;
    interval_seconds?: number;
    timeout_ms?: number;
    failure_threshold?: number;
}
export interface ExtensionSecuritySchema {
    sandbox_enabled: boolean;
    resource_limits: ResourceLimitsSchema;
    code_signing?: CodeSigningSchema;
    permissions?: PermissionsSchema[];
}
export interface ResourceLimitsSchema {
    max_memory_mb?: number;
    max_cpu_percent?: number;
    max_file_size_mb?: number;
    network_access?: boolean;
    file_system_access?: 'none' | 'read_only' | 'sandbox' | 'full';
}
export interface CodeSigningSchema {
    required?: boolean;
    signature?: string;
    certificate?: string;
    timestamp?: string;
}
export interface PermissionsSchema {
    permission: string;
    justification: string;
    approved: boolean;
    approved_by?: string;
    approval_date?: string;
}
export interface ExtensionMetadataSchema {
    author?: string;
    organization?: string;
    license?: string;
    homepage?: string;
    repository?: string;
    documentation?: string;
    support_contact?: string;
    keywords?: string[];
    categories?: string[];
    screenshots?: ScreenshotSchema[];
}
export interface ScreenshotSchema {
    url: string;
    caption?: string;
}
export interface AuditTrailSchema {
    enabled: boolean;
    retention_days: number;
    audit_events?: AuditEventSchema[];
    compliance_settings?: ComplianceSettingsSchema;
}
export interface AuditEventSchema {
    event_id: string;
    event_type: string;
    timestamp: string;
    user_id: string;
    user_role?: string;
    action: string;
    resource: string;
    extension_operation?: string;
    extension_id?: string;
    extension_name?: string;
    extension_type?: string;
    extension_version?: string;
    lifecycle_stage?: string;
    extension_status?: string;
    extension_details?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
    correlation_id?: string;
}
export interface ComplianceSettingsSchema {
    gdpr_enabled?: boolean;
    hipaa_enabled?: boolean;
    sox_enabled?: boolean;
    extension_audit_level?: 'basic' | 'detailed' | 'comprehensive';
    extension_data_logging?: boolean;
    custom_compliance?: string[];
}
export interface ExtensionPerformanceMetricsSchema {
    enabled: boolean;
    collection_interval_seconds: number;
    metrics?: MetricsSchema;
    health_status?: HealthStatusSchema;
    alerting?: AlertingSchema;
}
export interface MetricsSchema {
    extension_activation_latency_ms?: number;
    extension_lifecycle_efficiency_score?: number;
    extension_ecosystem_health_score?: number;
    extension_compatibility_percent?: number;
    extension_management_efficiency_score?: number;
    active_extensions_count?: number;
    extension_operations_per_second?: number;
    extension_memory_usage_mb?: number;
    average_extension_complexity_score?: number;
}
export interface HealthStatusSchema {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'incompatible';
    last_check: string;
    checks?: HealthCheckResultSchema[];
}
export interface HealthCheckResultSchema {
    check_name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    duration_ms?: number;
}
export interface AlertingSchema {
    enabled?: boolean;
    thresholds?: ThresholdsSchema;
    notification_channels?: ('email' | 'slack' | 'webhook' | 'sms' | 'pagerduty')[];
}
export interface ThresholdsSchema {
    max_extension_activation_latency_ms?: number;
    min_extension_lifecycle_efficiency_score?: number;
    min_extension_ecosystem_health_score?: number;
    min_extension_compatibility_percent?: number;
    min_extension_management_efficiency_score?: number;
}
export interface MonitoringIntegrationSchema {
    enabled: boolean;
    supported_providers: ('prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom')[];
    integration_endpoints?: IntegrationEndpointsSchema;
    extension_metrics?: ExtensionMetricsSchema;
    export_formats?: ('prometheus' | 'opentelemetry' | 'custom')[];
}
export interface IntegrationEndpointsSchema {
    metrics_api?: string;
    extension_lifecycle_api?: string;
    performance_metrics_api?: string;
    security_events_api?: string;
}
export interface ExtensionMetricsSchema {
    track_lifecycle_events?: boolean;
    track_performance_impact?: boolean;
    track_usage_statistics?: boolean;
    track_security_events?: boolean;
}
export interface VersionHistorySchema {
    enabled: boolean;
    max_versions: number;
    versions?: VersionSchema[];
    auto_versioning?: AutoVersioningSchema;
}
export interface VersionSchema {
    version_id: string;
    version_number: number;
    created_at: string;
    created_by: string;
    change_summary?: string;
    extension_snapshot?: Record<string, unknown>;
    change_type: 'installed' | 'updated' | 'configured' | 'activated' | 'deactivated' | 'uninstalled';
}
export interface AutoVersioningSchema {
    enabled?: boolean;
    version_on_install?: boolean;
    version_on_update?: boolean;
    version_on_config_change?: boolean;
}
export interface SearchMetadataSchema {
    enabled: boolean;
    indexing_strategy: 'full_text' | 'keyword' | 'semantic' | 'hybrid';
    searchable_fields?: ('extension_id' | 'name' | 'type' | 'description' | 'tags' | 'capabilities' | 'dependencies' | 'metadata')[];
    search_indexes?: SearchIndexSchema[];
    auto_indexing?: AutoIndexingSchema;
}
export interface SearchIndexSchema {
    index_id: string;
    index_name: string;
    fields: string[];
    index_type: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
    created_at: string;
    last_updated?: string;
}
export interface AutoIndexingSchema {
    enabled?: boolean;
    index_new_extensions?: boolean;
    reindex_interval_hours?: number;
}
export interface EventIntegrationSchema {
    enabled: boolean;
    event_bus_connection?: EventBusConnectionSchema;
    published_events?: ('extension_installed' | 'extension_activated' | 'extension_deactivated' | 'extension_updated' | 'extension_uninstalled' | 'extension_error' | 'extension_performance_alert')[];
    subscribed_events?: ('context_updated' | 'plan_executed' | 'confirm_approved' | 'system_shutdown' | 'security_alert')[];
    event_routing?: EventRoutingSchema;
}
export interface EventBusConnectionSchema {
    bus_type?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
    connection_string?: string;
    topic_prefix?: string;
    consumer_group?: string;
}
export interface EventRoutingSchema {
    routing_rules?: RoutingRuleSchema[];
}
export interface RoutingRuleSchema {
    rule_id: string;
    condition: string;
    target_topic: string;
    enabled?: boolean;
}
export interface ExtensionProtocolFactoryConfig {
    enableLogging?: boolean;
    enableMetrics?: boolean;
    enableCaching?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    extensionConfiguration?: {
        maxExtensions?: number;
        defaultExtensionType?: ExtensionType;
        autoLoadEnabled?: boolean;
        sandboxEnabled?: boolean;
        securityLevel?: 'low' | 'medium' | 'high';
    };
    mplpIntegration?: {
        enabled?: boolean;
        moduleInterfaces?: string[];
        coordinationEnabled?: boolean;
        eventDrivenEnabled?: boolean;
        coreOrchestratorSupport?: boolean;
    };
    performanceMetrics?: {
        enabled?: boolean;
        collectionIntervalSeconds?: number;
        extensionLoadLatencyThresholdMs?: number;
        extensionExecutionLatencyThresholdMs?: number;
        memoryUsageThresholdMB?: number;
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
//# sourceMappingURL=types.d.ts.map