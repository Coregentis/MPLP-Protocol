/**
 * Extension模块类型定义
 *
 * @description 基于mplp-extension.json Schema的完整TypeScript类型定义
 * @version 1.0.0
 * @layer Domain层 - 类型定义
 * @pattern Schema驱动开发 + 双重命名约定
 */
import { UUID } from '../../shared/types';
/**
 * 扩展类型枚举
 */
export type ExtensionType = 'plugin' | 'adapter' | 'connector' | 'middleware' | 'hook' | 'transformer';
/**
 * 扩展状态枚举
 */
export type ExtensionStatus = 'installed' | 'active' | 'inactive' | 'disabled' | 'error' | 'updating' | 'uninstalling';
/**
 * 扩展点类型枚举
 */
export type ExtensionPointType = 'hook' | 'filter' | 'action' | 'api_endpoint' | 'event_listener';
/**
 * HTTP方法枚举
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
/**
 * 事件投递保证枚举
 */
export type DeliveryGuarantee = 'at_least_once' | 'at_most_once' | 'exactly_once';
/**
 * 监控提供商枚举
 */
export type MonitoringProvider = 'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom';
/**
 * 审计事件类型枚举
 */
export type AuditEventType = 'install' | 'uninstall' | 'activate' | 'deactivate' | 'configure' | 'update' | 'error' | 'security_violation';
/**
 * 扩展兼容性信息
 */
export interface ExtensionCompatibility {
    mplpVersion: string;
    requiredModules: string[];
    dependencies: ExtensionDependency[];
    conflicts: ExtensionConflict[];
}
/**
 * 扩展依赖
 */
export interface ExtensionDependency {
    name: string;
    version: string;
    optional: boolean;
    reason?: string;
}
/**
 * 扩展冲突
 */
export interface ExtensionConflict {
    name: string;
    version: string;
    reason: string;
}
/**
 * 扩展配置
 */
export interface ExtensionConfiguration {
    schema: Record<string, unknown>;
    currentConfig: Record<string, unknown>;
    defaultConfig: Record<string, unknown>;
    validationRules: ValidationRule[];
}
/**
 * 验证规则
 */
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
/**
 * 扩展点定义
 */
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
/**
 * 扩展点参数
 */
export interface ExtensionPointParameter {
    name: string;
    type: string;
    required: boolean;
    description?: string;
    defaultValue?: unknown;
}
/**
 * 重试策略
 */
export interface RetryPolicy {
    maxAttempts: number;
    backoffStrategy: 'fixed' | 'exponential' | 'linear';
    initialDelay: number;
    maxDelay: number;
    retryableErrors: string[];
}
/**
 * 条件执行
 */
export interface ConditionalExecution {
    condition: string;
    parameters: Record<string, unknown>;
}
/**
 * API扩展定义
 */
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
/**
 * 认证配置
 */
export interface AuthenticationConfig {
    required: boolean;
    schemes: string[];
    permissions: string[];
}
/**
 * 速率限制配置
 */
export interface RateLimitConfig {
    enabled: boolean;
    requestsPerMinute: number;
    burstSize: number;
    keyGenerator: string;
}
/**
 * 验证配置
 */
export interface ValidationConfig {
    requestSchema?: Record<string, unknown>;
    responseSchema?: Record<string, unknown>;
    strictMode: boolean;
}
/**
 * API文档
 */
export interface ApiDocumentation {
    summary: string;
    description?: string;
    tags: string[];
    examples: ApiExample[];
}
/**
 * API示例
 */
export interface ApiExample {
    name: string;
    description?: string;
    request: Record<string, unknown>;
    response: Record<string, unknown>;
}
/**
 * 事件订阅
 */
export interface EventSubscription {
    eventPattern: string;
    handler: string;
    filterConditions: FilterCondition[];
    deliveryGuarantee: DeliveryGuarantee;
    deadLetterQueue: DeadLetterQueueConfig;
    retryPolicy: RetryPolicy;
    batchProcessing: BatchProcessingConfig;
}
/**
 * 过滤条件
 */
export interface FilterCondition {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex';
    value: unknown;
}
/**
 * 死信队列配置
 */
export interface DeadLetterQueueConfig {
    enabled: boolean;
    maxRetries: number;
    retentionPeriod: number;
}
/**
 * 批处理配置
 */
export interface BatchProcessingConfig {
    enabled: boolean;
    batchSize: number;
    flushInterval: number;
}
/**
 * 扩展生命周期信息
 */
export interface ExtensionLifecycle {
    installDate: string;
    lastUpdate: string;
    activationCount: number;
    errorCount: number;
    performanceMetrics: PerformanceMetrics;
    healthCheck: HealthCheckConfig;
}
/**
 * 性能指标
 */
export interface PerformanceMetrics {
    averageResponseTime: number;
    throughput: number;
    errorRate: number;
    memoryUsage: number;
    cpuUsage: number;
    lastMeasurement: string;
}
/**
 * 健康检查配置
 */
export interface HealthCheckConfig {
    enabled: boolean;
    interval: number;
    timeout: number;
    endpoint?: string;
    expectedStatus: number;
    healthyThreshold: number;
    unhealthyThreshold: number;
}
/**
 * 扩展安全配置
 */
export interface ExtensionSecurity {
    sandboxEnabled: boolean;
    resourceLimits: ResourceLimits;
    codeSigning: CodeSigningConfig;
    permissions: ExtensionPermissions;
}
/**
 * 资源限制
 */
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
/**
 * 代码签名配置
 */
export interface CodeSigningConfig {
    required: boolean;
    trustedSigners: string[];
    verificationEndpoint?: string;
}
/**
 * 扩展权限
 */
export interface ExtensionPermissions {
    fileSystem: FileSystemPermissions;
    network: NetworkPermissions;
    database: DatabasePermissions;
    api: ApiPermissions;
}
/**
 * 文件系统权限
 */
export interface FileSystemPermissions {
    read: string[];
    write: string[];
    execute: string[];
}
/**
 * 网络权限
 */
export interface NetworkPermissions {
    allowedHosts: string[];
    allowedPorts: number[];
    protocols: string[];
}
/**
 * 数据库权限
 */
export interface DatabasePermissions {
    read: string[];
    write: string[];
    admin: string[];
}
/**
 * API权限
 */
export interface ApiPermissions {
    endpoints: string[];
    methods: HttpMethod[];
    rateLimit: number;
}
/**
 * 扩展实体数据接口
 * 对应Schema中的根对象，使用camelCase命名
 */
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
/**
 * 扩展元数据
 */
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
/**
 * 作者信息
 */
export interface AuthorInfo {
    name: string;
    email?: string;
    url?: string;
}
/**
 * 组织信息
 */
export interface OrganizationInfo {
    name: string;
    url?: string;
    email?: string;
}
/**
 * 许可证信息
 */
export interface LicenseInfo {
    type: string;
    url?: string;
}
/**
 * 仓库信息
 */
export interface RepositoryInfo {
    type: string;
    url: string;
    directory?: string;
}
/**
 * 支持信息
 */
export interface SupportInfo {
    email?: string;
    url?: string;
    issues?: string;
}
/**
 * 审计跟踪
 */
export interface AuditTrail {
    events: AuditEvent[];
    complianceSettings: ComplianceSettings;
}
/**
 * 审计事件
 */
export interface AuditEvent {
    id: string;
    timestamp: string;
    eventType: AuditEventType;
    userId?: string;
    details: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
}
/**
 * 合规设置
 */
export interface ComplianceSettings {
    retentionPeriod: number;
    encryptionEnabled: boolean;
    accessLogging: boolean;
    dataClassification: string;
}
/**
 * 扩展性能指标
 */
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
/**
 * 性能告警
 */
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
/**
 * 监控集成
 */
export interface MonitoringIntegration {
    providers: MonitoringProvider[];
    endpoints: MonitoringEndpoint[];
    dashboards: DashboardConfig[];
    alerting: AlertingConfig;
}
/**
 * 监控端点
 */
export interface MonitoringEndpoint {
    provider: MonitoringProvider;
    url: string;
    credentials?: CredentialConfig;
    metrics: string[];
}
/**
 * 凭证配置
 */
export interface CredentialConfig {
    type: 'api_key' | 'oauth' | 'basic_auth';
    value: string;
}
/**
 * 仪表板配置
 */
export interface DashboardConfig {
    name: string;
    provider: MonitoringProvider;
    url: string;
    widgets: WidgetConfig[];
}
/**
 * 组件配置
 */
export interface WidgetConfig {
    type: string;
    title: string;
    query: string;
    visualization: string;
}
/**
 * 告警配置
 */
export interface AlertingConfig {
    enabled: boolean;
    channels: AlertChannel[];
    rules: AlertRule[];
}
/**
 * 告警渠道
 */
export interface AlertChannel {
    type: 'email' | 'slack' | 'webhook' | 'sms';
    config: Record<string, unknown>;
}
/**
 * 告警规则
 */
export interface AlertRule {
    name: string;
    condition: string;
    threshold: number;
    duration: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    channels: string[];
}
/**
 * 版本历史
 */
export interface VersionHistory {
    versions: VersionInfo[];
    autoVersioning: AutoVersioningConfig;
}
/**
 * 版本信息
 */
export interface VersionInfo {
    version: string;
    releaseDate: string;
    changelog: string;
    breaking: boolean;
    deprecated: string[];
    migration?: MigrationInfo;
}
/**
 * 迁移信息
 */
export interface MigrationInfo {
    from: string;
    to: string;
    script?: string;
    manual: boolean;
    instructions: string;
}
/**
 * 自动版本控制配置
 */
export interface AutoVersioningConfig {
    enabled: boolean;
    strategy: 'semantic' | 'timestamp' | 'build_number';
    prerelease: boolean;
    buildMetadata: boolean;
}
/**
 * 搜索元数据
 */
export interface SearchMetadata {
    indexedFields: string[];
    searchStrategies: SearchStrategy[];
    facets: SearchFacet[];
}
/**
 * 搜索策略
 */
export interface SearchStrategy {
    name: string;
    type: 'exact' | 'fuzzy' | 'semantic' | 'regex';
    weight: number;
    fields: string[];
}
/**
 * 搜索分面
 */
export interface SearchFacet {
    field: string;
    type: 'terms' | 'range' | 'date_histogram';
    size: number;
}
/**
 * 事件集成
 */
export interface EventIntegration {
    eventBus: EventBusConnection;
    eventRouting: EventRoutingConfig;
    eventTransformation: EventTransformationConfig;
}
/**
 * 事件总线连接
 */
export interface EventBusConnection {
    provider: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
    connectionString: string;
    credentials?: CredentialConfig;
    topics: string[];
}
/**
 * 事件路由配置
 */
export interface EventRoutingConfig {
    rules: EventRoutingRule[];
    defaultRoute?: string;
    errorHandling: EventErrorHandling;
}
/**
 * 事件路由规则
 */
export interface EventRoutingRule {
    pattern: string;
    destination: string;
    transformation?: string;
    condition?: string;
}
/**
 * 事件错误处理
 */
export interface EventErrorHandling {
    strategy: 'retry' | 'dead_letter' | 'ignore' | 'alert';
    maxRetries: number;
    backoffStrategy: 'fixed' | 'exponential' | 'linear';
    deadLetterTopic?: string;
}
/**
 * 事件转换配置
 */
export interface EventTransformationConfig {
    enabled: boolean;
    transformers: EventTransformer[];
}
/**
 * 事件转换器
 */
export interface EventTransformer {
    name: string;
    type: 'map' | 'filter' | 'aggregate' | 'enrich';
    config: Record<string, unknown>;
    order: number;
}
/**
 * Extension Schema接口 (snake_case命名)
 * 对应mplp-extension.json中的根对象
 */
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
/**
 * Schema层完整接口定义 (snake_case命名)
 * 基于mplp-extension.json的精确映射
 */
/**
 * 兼容性Schema接口
 */
export interface ExtensionCompatibilitySchema {
    mplp_version: string;
    required_modules?: RequiredModuleSchema[];
    dependencies?: DependencySchema[];
    conflicts?: ConflictSchema[];
}
/**
 * 必需模块Schema接口
 */
export interface RequiredModuleSchema {
    module: string;
    min_version?: string;
    max_version?: string;
}
/**
 * 依赖Schema接口
 */
export interface DependencySchema {
    extension_id: string;
    name: string;
    version_range: string;
    optional?: boolean;
}
/**
 * 冲突Schema接口
 */
export interface ConflictSchema {
    extension_id: string;
    name: string;
    reason: string;
}
/**
 * 配置Schema接口
 */
export interface ExtensionConfigurationSchema {
    schema: Record<string, unknown>;
    current_config: Record<string, unknown>;
    default_config?: Record<string, unknown>;
    validation_rules?: ValidationRuleSchema[];
}
/**
 * 验证规则Schema接口
 */
export interface ValidationRuleSchema {
    rule: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
}
/**
 * 扩展点Schema接口
 */
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
/**
 * 处理器Schema接口
 */
export interface HandlerSchema {
    function_name: string;
    parameters?: Record<string, unknown>;
    timeout_ms?: number;
    retry_policy?: RetryPolicySchema;
}
/**
 * 重试策略Schema接口
 */
export interface RetryPolicySchema {
    max_retries?: number;
    retry_delay_ms?: number;
    backoff_strategy?: 'fixed' | 'exponential' | 'linear';
}
/**
 * 条件Schema接口
 */
export interface ConditionsSchema {
    when?: string;
    required_permissions?: string[];
    context_filters?: Record<string, unknown>;
}
/**
 * API扩展Schema接口
 */
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
/**
 * 速率限制Schema接口
 */
export interface RateLimitSchema {
    requests_per_minute?: number;
    burst_size?: number;
}
/**
 * 事件订阅Schema接口
 */
export interface EventSubscriptionSchema {
    subscription_id: string;
    event_pattern: string;
    source_module: string;
    handler: string;
    filter_conditions?: Record<string, unknown>;
    delivery_guarantees: 'at_least_once' | 'at_most_once' | 'exactly_once';
    dead_letter_queue?: boolean;
}
/**
 * 生命周期Schema接口
 */
export interface ExtensionLifecycleSchema {
    install_date: string;
    last_update?: string;
    activation_count: number;
    error_count: number;
    last_error?: LastErrorSchema;
    performance_metrics?: PerformanceMetricsSchema;
    health_check?: HealthCheckSchema;
}
/**
 * 最后错误Schema接口
 */
export interface LastErrorSchema {
    timestamp: string;
    error_type: string;
    message: string;
    stack_trace?: string;
}
/**
 * 性能指标Schema接口
 */
export interface PerformanceMetricsSchema {
    average_execution_time_ms?: number;
    total_executions?: number;
    success_rate?: number;
    memory_usage_mb?: number;
}
/**
 * 健康检查Schema接口
 */
export interface HealthCheckSchema {
    endpoint?: string;
    interval_seconds?: number;
    timeout_ms?: number;
    failure_threshold?: number;
}
/**
 * 安全Schema接口
 */
export interface ExtensionSecuritySchema {
    sandbox_enabled: boolean;
    resource_limits: ResourceLimitsSchema;
    code_signing?: CodeSigningSchema;
    permissions?: PermissionsSchema[];
}
/**
 * 资源限制Schema接口
 */
export interface ResourceLimitsSchema {
    max_memory_mb?: number;
    max_cpu_percent?: number;
    max_file_size_mb?: number;
    network_access?: boolean;
    file_system_access?: 'none' | 'read_only' | 'sandbox' | 'full';
}
/**
 * 代码签名Schema接口
 */
export interface CodeSigningSchema {
    required?: boolean;
    signature?: string;
    certificate?: string;
    timestamp?: string;
}
/**
 * 权限Schema接口
 */
export interface PermissionsSchema {
    permission: string;
    justification: string;
    approved: boolean;
    approved_by?: string;
    approval_date?: string;
}
/**
 * 元数据Schema接口
 */
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
/**
 * 截图Schema接口
 */
export interface ScreenshotSchema {
    url: string;
    caption?: string;
}
/**
 * 审计跟踪Schema接口
 */
export interface AuditTrailSchema {
    enabled: boolean;
    retention_days: number;
    audit_events?: AuditEventSchema[];
    compliance_settings?: ComplianceSettingsSchema;
}
/**
 * 审计事件Schema接口
 */
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
/**
 * 合规设置Schema接口
 */
export interface ComplianceSettingsSchema {
    gdpr_enabled?: boolean;
    hipaa_enabled?: boolean;
    sox_enabled?: boolean;
    extension_audit_level?: 'basic' | 'detailed' | 'comprehensive';
    extension_data_logging?: boolean;
    custom_compliance?: string[];
}
/**
 * 扩展性能指标Schema接口
 */
export interface ExtensionPerformanceMetricsSchema {
    enabled: boolean;
    collection_interval_seconds: number;
    metrics?: MetricsSchema;
    health_status?: HealthStatusSchema;
    alerting?: AlertingSchema;
}
/**
 * 指标Schema接口
 */
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
/**
 * 健康状态Schema接口
 */
export interface HealthStatusSchema {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'incompatible';
    last_check: string;
    checks?: HealthCheckResultSchema[];
}
/**
 * 健康检查结果Schema接口
 */
export interface HealthCheckResultSchema {
    check_name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    duration_ms?: number;
}
/**
 * 告警Schema接口
 */
export interface AlertingSchema {
    enabled?: boolean;
    thresholds?: ThresholdsSchema;
    notification_channels?: ('email' | 'slack' | 'webhook' | 'sms' | 'pagerduty')[];
}
/**
 * 阈值Schema接口
 */
export interface ThresholdsSchema {
    max_extension_activation_latency_ms?: number;
    min_extension_lifecycle_efficiency_score?: number;
    min_extension_ecosystem_health_score?: number;
    min_extension_compatibility_percent?: number;
    min_extension_management_efficiency_score?: number;
}
/**
 * 监控集成Schema接口
 */
export interface MonitoringIntegrationSchema {
    enabled: boolean;
    supported_providers: ('prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom')[];
    integration_endpoints?: IntegrationEndpointsSchema;
    extension_metrics?: ExtensionMetricsSchema;
    export_formats?: ('prometheus' | 'opentelemetry' | 'custom')[];
}
/**
 * 集成端点Schema接口
 */
export interface IntegrationEndpointsSchema {
    metrics_api?: string;
    extension_lifecycle_api?: string;
    performance_metrics_api?: string;
    security_events_api?: string;
}
/**
 * 扩展指标Schema接口
 */
export interface ExtensionMetricsSchema {
    track_lifecycle_events?: boolean;
    track_performance_impact?: boolean;
    track_usage_statistics?: boolean;
    track_security_events?: boolean;
}
/**
 * 版本历史Schema接口
 */
export interface VersionHistorySchema {
    enabled: boolean;
    max_versions: number;
    versions?: VersionSchema[];
    auto_versioning?: AutoVersioningSchema;
}
/**
 * 版本Schema接口
 */
export interface VersionSchema {
    version_id: string;
    version_number: number;
    created_at: string;
    created_by: string;
    change_summary?: string;
    extension_snapshot?: Record<string, unknown>;
    change_type: 'installed' | 'updated' | 'configured' | 'activated' | 'deactivated' | 'uninstalled';
}
/**
 * 自动版本控制Schema接口
 */
export interface AutoVersioningSchema {
    enabled?: boolean;
    version_on_install?: boolean;
    version_on_update?: boolean;
    version_on_config_change?: boolean;
}
/**
 * 搜索元数据Schema接口
 */
export interface SearchMetadataSchema {
    enabled: boolean;
    indexing_strategy: 'full_text' | 'keyword' | 'semantic' | 'hybrid';
    searchable_fields?: ('extension_id' | 'name' | 'type' | 'description' | 'tags' | 'capabilities' | 'dependencies' | 'metadata')[];
    search_indexes?: SearchIndexSchema[];
    auto_indexing?: AutoIndexingSchema;
}
/**
 * 搜索索引Schema接口
 */
export interface SearchIndexSchema {
    index_id: string;
    index_name: string;
    fields: string[];
    index_type: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
    created_at: string;
    last_updated?: string;
}
/**
 * 自动索引Schema接口
 */
export interface AutoIndexingSchema {
    enabled?: boolean;
    index_new_extensions?: boolean;
    reindex_interval_hours?: number;
}
/**
 * 事件集成Schema接口
 */
export interface EventIntegrationSchema {
    enabled: boolean;
    event_bus_connection?: EventBusConnectionSchema;
    published_events?: ('extension_installed' | 'extension_activated' | 'extension_deactivated' | 'extension_updated' | 'extension_uninstalled' | 'extension_error' | 'extension_performance_alert')[];
    subscribed_events?: ('context_updated' | 'plan_executed' | 'confirm_approved' | 'system_shutdown' | 'security_alert')[];
    event_routing?: EventRoutingSchema;
}
/**
 * 事件总线连接Schema接口
 */
export interface EventBusConnectionSchema {
    bus_type?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
    connection_string?: string;
    topic_prefix?: string;
    consumer_group?: string;
}
/**
 * 事件路由Schema接口
 */
export interface EventRoutingSchema {
    routing_rules?: RoutingRuleSchema[];
}
/**
 * 路由规则Schema接口
 */
export interface RoutingRuleSchema {
    rule_id: string;
    condition: string;
    target_topic: string;
    enabled?: boolean;
}
/**
 * Extension协议工厂配置类型
 * @description 基于mplp-extension.json Schema的工厂配置
 */
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