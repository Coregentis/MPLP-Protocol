/**
 * MPLP Role Module - Type Definitions
 * @description Role模块的完整类型定义 - 企业级RBAC安全中心
 * @version 1.0.0
 * @module RoleTypes
 */
/**
 * UUID类型
 */
export type UUID = string;
/**
 * 优先级枚举
 */
export type Priority = 'critical' | 'high' | 'medium' | 'low';
/**
 * 角色类型枚举
 */
export type RoleType = 'system' | 'organizational' | 'functional' | 'project' | 'temporary';
/**
 * 角色状态枚举
 */
export type RoleStatus = 'active' | 'inactive' | 'deprecated' | 'suspended';
/**
 * Agent类型枚举
 */
export type AgentType = 'core' | 'specialist' | 'stakeholder' | 'coordinator' | 'custom';
/**
 * Agent状态枚举
 */
export type AgentStatus = 'active' | 'inactive' | 'busy' | 'error' | 'maintenance' | 'retired';
/**
 * 专业技能水平枚举
 */
export type ExpertiseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
/**
 * 沟通风格枚举
 */
export type CommunicationStyle = 'formal' | 'casual' | 'technical' | 'collaborative' | 'directive';
/**
 * 冲突解决策略枚举
 */
export type ConflictResolutionStrategy = 'consensus' | 'majority' | 'authority' | 'compromise' | 'avoidance';
/**
 * 权限授予类型枚举
 */
export type GrantType = 'direct' | 'inherited' | 'delegated' | 'temporary';
/**
 * 继承类型枚举
 */
export type InheritanceType = 'full' | 'partial' | 'conditional';
/**
 * 合并策略枚举
 */
export type MergeStrategy = 'union' | 'intersection' | 'priority' | 'custom';
/**
 * 冲突解决枚举
 */
export type ConflictResolution = 'deny' | 'allow' | 'escalate' | 'most_restrictive' | 'least_restrictive';
/**
 * 安全级别枚举
 */
export type SecurityClearance = 'public' | 'internal' | 'confidential' | 'secret' | 'top_secret';
/**
 * 资历级别枚举
 */
export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
/**
 * 健康状态枚举
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unauthorized';
/**
 * 检查状态枚举
 */
export type CheckStatus = 'pass' | 'fail' | 'warn';
/**
 * 权限接口
 */
export interface Permission {
    permissionId: UUID;
    resourceType: 'context' | 'plan' | 'task' | 'confirmation' | 'trace' | 'role' | 'extension' | 'system';
    resourceId: UUID | '*';
    actions: Array<'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'monitor' | 'admin'>;
    conditions?: PermissionConditions;
    grantType: GrantType;
    expiry?: Date;
}
/**
 * 权限条件接口
 */
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
/**
 * 角色继承接口
 */
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
/**
 * 角色委托接口
 */
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
/**
 * 角色属性接口
 */
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
/**
 * 验证规则接口
 */
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
/**
 * 审计设置接口
 */
export interface AuditSettings {
    auditEnabled: boolean;
    auditEvents?: Array<'assignment' | 'revocation' | 'delegation' | 'permission_change' | 'login' | 'action_performed'>;
    retentionPeriod?: string;
    complianceFrameworks?: string[];
}
/**
 * Agent能力接口
 */
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
/**
 * Agent配置接口
 */
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
/**
 * Agent接口
 */
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
/**
 * 性能指标接口
 */
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
/**
 * 监控集成接口
 */
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
/**
 * 版本历史接口
 */
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
/**
 * 搜索元数据接口
 */
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
/**
 * 事件集成接口
 */
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
/**
 * 审计跟踪接口
 */
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
/**
 * Role协议工厂配置类型
 * @description 基于mplp-role.json Schema的工厂配置
 */
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