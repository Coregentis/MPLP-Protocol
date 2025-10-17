export type UUID = string;
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type RoleType = 'system' | 'organizational' | 'functional' | 'project' | 'temporary';
export type RoleStatus = 'active' | 'inactive' | 'deprecated' | 'suspended';
export type AgentType = 'core' | 'specialist' | 'stakeholder' | 'coordinator' | 'custom';
export type AgentStatus = 'active' | 'inactive' | 'busy' | 'error' | 'maintenance' | 'retired';
export type ExpertiseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
export type CommunicationStyle = 'formal' | 'casual' | 'technical' | 'collaborative' | 'directive';
export type ConflictResolutionStrategy = 'consensus' | 'majority' | 'authority' | 'compromise' | 'avoidance';
export type GrantType = 'direct' | 'inherited' | 'delegated' | 'temporary';
export type InheritanceType = 'full' | 'partial' | 'conditional';
export type MergeStrategy = 'union' | 'intersection' | 'priority' | 'custom';
export type ConflictResolution = 'deny' | 'allow' | 'escalate' | 'most_restrictive' | 'least_restrictive';
export type SecurityClearance = 'public' | 'internal' | 'confidential' | 'secret' | 'top_secret';
export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unauthorized';
export type CheckStatus = 'pass' | 'fail' | 'warn';
export interface Permission {
    permissionId: UUID;
    resourceType: 'context' | 'plan' | 'task' | 'confirmation' | 'trace' | 'role' | 'extension' | 'system';
    resourceId: UUID | '*';
    actions: Array<'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'monitor' | 'admin'>;
    conditions?: PermissionConditions;
    grantType: GrantType;
    expiry?: Date;
}
export interface PermissionConditions {
    timeBased?: {
        startTime?: Date;
        endTime?: Date;
        timezone?: string;
        daysOfWeek?: number[];
    };
    locationBased?: {
        allowedIpRanges?: string[];
        geoRestrictions?: string[];
    };
    contextBased?: {
        requiredAttributes?: Record<string, unknown>;
        forbiddenAttributes?: Record<string, unknown>;
    };
    approvalRequired?: {
        forActions?: string[];
        approvalThreshold?: number;
        approverRoles?: string[];
    };
}
export interface RoleInheritance {
    parentRoles?: Array<{
        roleId: UUID;
        inheritanceType: InheritanceType;
        excludedPermissions?: UUID[];
        conditions?: Record<string, unknown>;
    }>;
    childRoles?: Array<{
        roleId: UUID;
        delegationLevel: number;
        canFurtherDelegate: boolean;
    }>;
    inheritanceRules?: {
        mergeStrategy: MergeStrategy;
        conflictResolution: ConflictResolution;
        maxInheritanceDepth?: number;
    };
}
export interface RoleDelegation {
    canDelegate: boolean;
    delegatablePermissions?: UUID[];
    delegationConstraints?: {
        maxDelegationDepth?: number;
        timeLimit?: number;
        requireApproval?: boolean;
        revocable?: boolean;
    };
    activeDelegations?: Array<{
        delegationId: UUID;
        delegatedTo: string;
        permissions: UUID[];
        startTime: Date;
        endTime?: Date;
        status: 'active' | 'suspended' | 'revoked' | 'expired';
    }>;
}
export interface RoleAttributes {
    securityClearance?: SecurityClearance;
    department?: string;
    seniorityLevel?: SeniorityLevel;
    certificationRequirements?: Array<{
        certification: string;
        level: string;
        expiry?: Date;
        issuer?: string;
    }>;
    customAttributes?: Record<string, string | number | boolean>;
}
export interface ValidationRules {
    assignmentRules?: Array<{
        ruleId: UUID;
        condition: string;
        action: 'allow' | 'deny' | 'require_approval';
        message?: string;
    }>;
    separationOfDuties?: Array<{
        conflictingRoles: UUID[];
        severity: 'warning' | 'error' | 'critical';
        exceptionApprovalRequired?: boolean;
    }>;
}
export interface AuditSettings {
    auditEnabled: boolean;
    auditEvents?: Array<'assignment' | 'revocation' | 'delegation' | 'permission_change' | 'login' | 'action_performed'>;
    retentionPeriod?: string;
    complianceFrameworks?: string[];
}
export interface AgentCapabilities {
    core: {
        criticalThinking: boolean;
        scenarioValidation: boolean;
        ddscDialog: boolean;
        mplpProtocols: string[];
    };
    specialist: {
        domain: string;
        expertiseLevel: ExpertiseLevel;
        knowledgeAreas: string[];
        tools?: string[];
    };
    collaboration: {
        communicationStyle: CommunicationStyle;
        conflictResolution: ConflictResolutionStrategy;
        decisionWeight: number;
        trustLevel: number;
    };
    learning: {
        experienceAccumulation: boolean;
        patternRecognition: boolean;
        adaptationMechanism: boolean;
        performanceOptimization: boolean;
    };
}
export interface AgentConfiguration {
    basic: {
        maxConcurrentTasks: number;
        timeoutMs: number;
        retryPolicy?: {
            maxRetries: number;
            backoffMs: number;
            backoffMultiplier?: number;
            maxBackoffMs?: number;
        };
        priorityLevel?: Priority;
    };
    communication: {
        protocols: string[];
        messageFormat: string;
        encryptionEnabled?: boolean;
        compressionEnabled?: boolean;
    };
    security: {
        authenticationRequired: boolean;
        authorizationLevel?: string;
        auditLogging: boolean;
        dataEncryption?: boolean;
    };
}
export interface Agent {
    agentId: UUID;
    name: string;
    type: AgentType;
    domain: string;
    status: AgentStatus;
    capabilities: AgentCapabilities;
    configuration?: AgentConfiguration;
    performanceMetrics?: {
        responseTimeMs?: number;
        throughputOpsPerSec?: number;
        successRate?: number;
        errorRate?: number;
        lastUpdated?: Date;
    };
    createdAt: Date;
    updatedAt?: Date;
    createdBy: string;
}
export interface PerformanceMetrics {
    enabled: boolean;
    collectionIntervalSeconds: number;
    metrics?: {
        roleAssignmentLatencyMs?: number;
        permissionCheckLatencyMs?: number;
        roleSecurityScore?: number;
        permissionAccuracyPercent?: number;
        roleManagementEfficiencyScore?: number;
        activeRolesCount?: number;
        roleOperationsPerSecond?: number;
        roleMemoryUsageMb?: number;
        averageRoleComplexityScore?: number;
    };
    healthStatus?: {
        status: HealthStatus;
        lastCheck?: Date;
        checks?: Array<{
            checkName: string;
            status: CheckStatus;
            message?: string;
            durationMs?: number;
        }>;
    };
    alerting?: {
        enabled?: boolean;
        thresholds?: {
            maxRoleAssignmentLatencyMs?: number;
            maxPermissionCheckLatencyMs?: number;
            minRoleSecurityScore?: number;
            minPermissionAccuracyPercent?: number;
            minRoleManagementEfficiencyScore?: number;
        };
        notificationChannels?: Array<'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty'>;
    };
}
export interface MonitoringIntegration {
    enabled: boolean;
    supportedProviders: Array<'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom'>;
    integrationEndpoints?: {
        metricsApi?: string;
        roleAccessApi?: string;
        permissionMetricsApi?: string;
        securityEventsApi?: string;
    };
    roleMetrics?: {
        trackRoleUsage?: boolean;
        trackPermissionChecks?: boolean;
        trackAccessPatterns?: boolean;
        trackSecurityEvents?: boolean;
    };
    exportFormats?: Array<'prometheus' | 'opentelemetry' | 'custom'>;
}
export interface VersionHistory {
    enabled: boolean;
    maxVersions: number;
    versions?: Array<{
        versionId: UUID;
        versionNumber: number;
        createdAt: Date;
        createdBy: string;
        changeSummary?: string;
        roleSnapshot?: Record<string, unknown>;
        changeType: 'created' | 'updated' | 'permission_changed' | 'status_changed' | 'deleted';
    }>;
    autoVersioning?: {
        enabled?: boolean;
        versionOnPermissionChange?: boolean;
        versionOnStatusChange?: boolean;
    };
}
export interface SearchMetadata {
    enabled: boolean;
    indexingStrategy: 'full_text' | 'keyword' | 'semantic' | 'hybrid';
    searchableFields?: Array<'role_id' | 'name' | 'role_type' | 'permissions' | 'agents' | 'metadata' | 'description'>;
    searchIndexes?: Array<{
        indexId: string;
        indexName: string;
        fields: string[];
        indexType: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
        createdAt?: Date;
        lastUpdated?: Date;
    }>;
    autoIndexing?: {
        enabled?: boolean;
        indexNewRoles?: boolean;
        reindexIntervalHours?: number;
    };
}
export interface EventIntegration {
    enabled: boolean;
    eventBusConnection?: {
        busType?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
        connectionString?: string;
        topicPrefix?: string;
        consumerGroup?: string;
    };
    publishedEvents?: Array<'role_created' | 'role_updated' | 'role_deleted' | 'permission_granted' | 'permission_revoked' | 'access_granted' | 'access_denied'>;
    subscribedEvents?: Array<'context_updated' | 'plan_executed' | 'confirm_approved' | 'security_alert'>;
    eventRouting?: {
        routingRules?: Array<{
            ruleId?: string;
            condition?: string;
            targetTopic?: string;
            enabled?: boolean;
        }>;
    };
}
export interface AuditTrail {
    enabled: boolean;
    retentionDays: number;
    auditEvents?: Array<{
        eventId: UUID;
        eventType: 'role_created' | 'role_updated' | 'role_assigned' | 'role_revoked' | 'permission_granted' | 'permission_revoked' | 'role_activated' | 'role_deactivated';
        timestamp: Date;
        userId: string;
        userRole?: string;
        action: string;
        resource: string;
        roleOperation?: string;
        roleId?: UUID;
        roleName?: string;
        roleType?: string;
        permissionIds?: string[];
        roleStatus?: string;
        roleDetails?: Record<string, unknown>;
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
        correlationId?: UUID;
    }>;
    complianceSettings?: {
        gdprEnabled?: boolean;
        hipaaEnabled?: boolean;
        soxEnabled?: boolean;
        roleAuditLevel?: 'basic' | 'detailed' | 'comprehensive';
        roleDataLogging?: boolean;
        customCompliance?: string[];
    };
}
export interface RoleProtocolFactoryConfig {
    enableLogging?: boolean;
    enableMetrics?: boolean;
    enableCaching?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    roleConfiguration?: {
        maxRoles?: number;
        defaultRoleType?: RoleType;
        permissionModel?: 'rbac' | 'abac' | 'hybrid';
        inheritanceMode?: 'none' | 'single' | 'multiple';
        auditEnabled?: boolean;
        securityClearanceRequired?: boolean;
    };
    agentManagement?: {
        maxAgents?: number;
        autoScaling?: boolean;
        loadBalancing?: boolean;
        healthCheckIntervalMs?: number;
    };
    performanceMetrics?: {
        enabled?: boolean;
        collectionIntervalSeconds?: number;
        roleAssignmentLatencyThresholdMs?: number;
        permissionCheckLatencyThresholdMs?: number;
        securityScoreThreshold?: number;
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