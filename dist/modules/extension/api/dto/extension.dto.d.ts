import { UUID } from '../../../../shared/types';
import { ExtensionType, ExtensionStatus } from '../../types';
export interface CreateExtensionRequestDto {
    contextId: UUID;
    name: string;
    displayName: string;
    description?: string;
    version: string;
    extensionType: ExtensionType;
    compatibility?: ExtensionCompatibilityDto;
    configuration?: ExtensionConfigurationDto;
    extensionPoints?: ExtensionPointDto[];
    apiExtensions?: ApiExtensionDto[];
    eventSubscriptions?: EventSubscriptionDto[];
    security?: ExtensionSecurityDto;
    metadata?: ExtensionMetadataDto;
}
export interface UpdateExtensionRequestDto {
    displayName?: string;
    description?: string;
    configuration?: Record<string, unknown>;
    extensionPoints?: ExtensionPointDto[];
    apiExtensions?: ApiExtensionDto[];
    eventSubscriptions?: EventSubscriptionDto[];
    metadata?: Partial<ExtensionMetadataDto>;
}
export interface QueryExtensionsRequestDto {
    contextId?: UUID;
    extensionType?: ExtensionType | ExtensionType[];
    status?: ExtensionStatus | ExtensionStatus[];
    name?: string;
    version?: string;
    author?: string;
    organization?: string;
    category?: string;
    keywords?: string[];
    createdAfter?: string;
    createdBefore?: string;
    lastUpdateAfter?: string;
    lastUpdateBefore?: string;
    hasErrors?: boolean;
    isActive?: boolean;
    compatibleWithVersion?: string;
    hasExtensionPointType?: string;
    hasApiExtensions?: boolean;
    hasEventSubscriptions?: boolean;
    healthStatus?: 'healthy' | 'degraded' | 'unhealthy';
    performanceThreshold?: {
        errorRate?: number;
        availability?: number;
        responseTime?: number;
    };
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface ExtensionActivationRequestDto {
    userId?: string;
    force?: boolean;
}
export interface BatchOperationRequestDto {
    extensionIds: UUID[];
    operation: 'activate' | 'deactivate' | 'delete' | 'update';
    parameters?: Record<string, unknown>;
}
export interface ExtensionResponseDto {
    extensionId: UUID;
    contextId: UUID;
    name: string;
    displayName: string;
    description?: string;
    version: string;
    extensionType: ExtensionType;
    status: ExtensionStatus;
    protocolVersion: string;
    timestamp: string;
    compatibility: ExtensionCompatibilityDto;
    configuration: ExtensionConfigurationDto;
    extensionPoints: ExtensionPointDto[];
    apiExtensions: ApiExtensionDto[];
    eventSubscriptions: EventSubscriptionDto[];
    lifecycle: ExtensionLifecycleDto;
    security: ExtensionSecurityDto;
    metadata: ExtensionMetadataDto;
    auditTrail: AuditTrailDto;
    performanceMetrics: ExtensionPerformanceMetricsDto;
    monitoringIntegration: MonitoringIntegrationDto;
    versionHistory: VersionHistoryDto;
    searchMetadata: SearchMetadataDto;
    eventIntegration: EventIntegrationDto;
}
export interface ExtensionListResponseDto {
    extensions: ExtensionResponseDto[];
    total: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
}
export interface BatchOperationResponseDto {
    successCount: number;
    failureCount: number;
    results: Array<{
        id: UUID;
        success: boolean;
        error?: string;
    }>;
}
export interface ExtensionStatisticsResponseDto {
    totalExtensions: number;
    activeExtensions: number;
    inactiveExtensions: number;
    errorExtensions: number;
    extensionsByType: Record<ExtensionType, number>;
    extensionsByStatus: Record<ExtensionStatus, number>;
    averagePerformanceMetrics: {
        responseTime: number;
        errorRate: number;
        availability: number;
        throughput: number;
    };
    topPerformingExtensions: Array<{
        extensionId: UUID;
        name: string;
        performanceScore: number;
    }>;
    recentlyUpdated: Array<{
        extensionId: UUID;
        name: string;
        lastUpdate: string;
    }>;
}
export interface HealthStatusResponseDto {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    details?: {
        service: string;
        version: string;
        repository: {
            status: string;
            extensionCount: number;
            activeExtensions: number;
            lastOperation: string;
        };
        performance: {
            averageResponseTime: number;
            totalExtensions: number;
            errorRate: number;
        };
    };
}
export interface ExtensionCompatibilityDto {
    mplpVersion: string;
    requiredModules?: string[];
    dependencies?: ExtensionDependencyDto[];
    conflicts?: ExtensionConflictDto[];
}
export interface ExtensionDependencyDto {
    name: string;
    version: string;
    optional?: boolean;
    reason?: string;
}
export interface ExtensionConflictDto {
    name: string;
    version: string;
    reason: string;
}
export interface ExtensionConfigurationDto {
    schema: Record<string, unknown>;
    currentConfig: Record<string, unknown>;
    defaultConfig: Record<string, unknown>;
    validationRules: ValidationRuleDto[];
}
export interface ValidationRuleDto {
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
export interface ExtensionPointDto {
    id: string;
    name: string;
    type: 'hook' | 'filter' | 'action' | 'api_endpoint' | 'event_listener';
    description?: string;
    parameters: ExtensionPointParameterDto[];
    returnType?: string;
    async: boolean;
    timeout?: number;
    retryPolicy?: RetryPolicyDto;
    conditionalExecution?: ConditionalExecutionDto;
    executionOrder: number;
}
export interface ExtensionPointParameterDto {
    name: string;
    type: string;
    required: boolean;
    description?: string;
    defaultValue?: unknown;
}
export interface RetryPolicyDto {
    maxAttempts: number;
    backoffStrategy: 'fixed' | 'exponential' | 'linear';
    initialDelay: number;
    maxDelay: number;
    retryableErrors: string[];
}
export interface ConditionalExecutionDto {
    condition: string;
    parameters: Record<string, unknown>;
}
export interface ApiExtensionDto {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
    handler: string;
    middleware?: string[];
    authentication: AuthenticationConfigDto;
    rateLimit: RateLimitConfigDto;
    validation: ValidationConfigDto;
    documentation: ApiDocumentationDto;
}
export interface AuthenticationConfigDto {
    required: boolean;
    schemes: string[];
    permissions: string[];
}
export interface RateLimitConfigDto {
    enabled: boolean;
    requestsPerMinute: number;
    burstSize: number;
    keyGenerator: string;
}
export interface ValidationConfigDto {
    requestSchema?: Record<string, unknown>;
    responseSchema?: Record<string, unknown>;
    strictMode: boolean;
}
export interface ApiDocumentationDto {
    summary: string;
    description?: string;
    tags: string[];
    examples: ApiExampleDto[];
}
export interface ApiExampleDto {
    name: string;
    description?: string;
    request: Record<string, unknown>;
    response: Record<string, unknown>;
}
export interface EventSubscriptionDto {
    eventPattern: string;
    handler: string;
    filterConditions: FilterConditionDto[];
    deliveryGuarantee: 'at_least_once' | 'at_most_once' | 'exactly_once';
    deadLetterQueue: DeadLetterQueueConfigDto;
    retryPolicy: RetryPolicyDto;
    batchProcessing: BatchProcessingConfigDto;
}
export interface FilterConditionDto {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'regex';
    value: unknown;
}
export interface DeadLetterQueueConfigDto {
    enabled: boolean;
    maxRetries: number;
    retentionPeriod: number;
}
export interface BatchProcessingConfigDto {
    enabled: boolean;
    batchSize: number;
    flushInterval: number;
}
export interface ExtensionLifecycleDto {
    installDate: string;
    lastUpdate: string;
    activationCount: number;
    errorCount: number;
    performanceMetrics: {
        averageResponseTime: number;
        throughput: number;
        errorRate: number;
        memoryUsage: number;
        cpuUsage: number;
        lastMeasurement: string;
    };
    healthCheck: {
        enabled: boolean;
        interval: number;
        timeout: number;
        endpoint?: string;
        expectedStatus: number;
        healthyThreshold: number;
        unhealthyThreshold: number;
    };
}
export interface ExtensionSecurityDto {
    sandboxEnabled: boolean;
    resourceLimits: {
        maxMemory: number;
        maxCpu: number;
        maxFileSize: number;
        maxNetworkConnections: number;
        allowedDomains: string[];
        blockedDomains: string[];
    };
    codeSigning: {
        required: boolean;
        trustedSigners: string[];
        verificationEndpoint?: string;
    };
    permissions: {
        fileSystem: {
            read: string[];
            write: string[];
            execute: string[];
        };
        network: {
            allowedHosts: string[];
            allowedPorts: number[];
            protocols: string[];
        };
        database: {
            read: string[];
            write: string[];
            admin: string[];
        };
        api: {
            endpoints: string[];
            methods: string[];
            rateLimit: number;
        };
    };
}
export interface ExtensionMetadataDto {
    author: {
        name: string;
        email?: string;
        url?: string;
    };
    organization?: {
        name: string;
        url?: string;
        email?: string;
    };
    license: {
        type: string;
        url?: string;
    };
    homepage?: string;
    repository?: {
        type: string;
        url: string;
        directory?: string;
    };
    documentation?: string;
    support?: {
        email?: string;
        url?: string;
        issues?: string;
    };
    keywords: string[];
    category: string;
    screenshots: string[];
}
export interface AuditTrailDto {
    events: unknown[];
    complianceSettings: unknown;
}
export interface ExtensionPerformanceMetricsDto {
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
    alerts: unknown[];
}
export interface MonitoringIntegrationDto {
    providers: string[];
    endpoints: unknown[];
    dashboards: unknown[];
    alerting: unknown;
}
export interface VersionHistoryDto {
    versions: unknown[];
    autoVersioning: unknown;
}
export interface SearchMetadataDto {
    indexedFields: string[];
    searchStrategies: unknown[];
    facets: unknown[];
}
export interface EventIntegrationDto {
    eventBus: unknown;
    eventRouting: unknown;
    eventTransformation: unknown;
}
//# sourceMappingURL=extension.dto.d.ts.map