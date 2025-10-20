/**
 * Role数据传输对象
 *
 * @description Role模块的API层数据传输对象定义 - 企业级RBAC安全中心
 * @version 1.0.0
 * @layer API层 - DTO
 */
import { UUID, RoleType, RoleStatus, GrantType, InheritanceType, MergeStrategy, ConflictResolution, SecurityClearance, SeniorityLevel, AgentType, AgentStatus, ExpertiseLevel, CommunicationStyle, ConflictResolutionStrategy } from '../../types';
/**
 * 创建角色请求DTO
 */
export interface CreateRoleRequestDTO {
    contextId: UUID;
    name: string;
    displayName?: string;
    description?: string;
    roleType: RoleType;
    permissions: Array<{
        permissionId: UUID;
        resourceType: 'context' | 'plan' | 'task' | 'confirmation' | 'trace' | 'role' | 'extension' | 'system';
        resourceId: UUID | '*';
        actions: Array<'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'monitor' | 'admin'>;
        conditions?: {
            timeBased?: {
                startTime?: string;
                endTime?: string;
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
        };
        grantType: GrantType;
        expiry?: string;
    }>;
    scope?: {
        level: 'global' | 'organization' | 'project' | 'team' | 'individual';
        contextIds?: UUID[];
        planIds?: UUID[];
        resourceConstraints?: {
            maxContexts?: number;
            maxPlans?: number;
            allowedResourceTypes?: string[];
        };
    };
    attributes?: {
        securityClearance?: SecurityClearance;
        department?: string;
        seniorityLevel?: SeniorityLevel;
        certificationRequirements?: Array<{
            certification: string;
            level: string;
            expiry?: string;
            issuer?: string;
        }>;
        customAttributes?: Record<string, string | number | boolean>;
    };
}
/**
 * 更新角色请求DTO
 */
export interface UpdateRoleRequestDTO {
    displayName?: string;
    description?: string;
    status?: RoleStatus;
    permissions?: CreateRoleRequestDTO['permissions'];
    attributes?: CreateRoleRequestDTO['attributes'];
}
/**
 * 角色响应DTO
 */
export interface RoleResponseDTO {
    protocolVersion: string;
    timestamp: string;
    roleId: UUID;
    contextId: UUID;
    name: string;
    displayName?: string;
    description?: string;
    roleType: RoleType;
    status: RoleStatus;
    scope?: CreateRoleRequestDTO['scope'];
    permissions: CreateRoleRequestDTO['permissions'];
    inheritance?: {
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
    };
    delegation?: {
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
            startTime: string;
            endTime?: string;
            status: 'active' | 'suspended' | 'revoked' | 'expired';
        }>;
    };
    attributes?: CreateRoleRequestDTO['attributes'];
    agents?: Array<{
        agentId: UUID;
        name: string;
        type: AgentType;
        domain: string;
        status: AgentStatus;
        capabilities: {
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
        };
        createdAt: string;
        updatedAt?: string;
        createdBy: string;
    }>;
    performanceMetrics: {
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
            status: 'healthy' | 'degraded' | 'unhealthy' | 'unauthorized';
            lastCheck?: string;
            checks?: Array<{
                checkName: string;
                status: 'pass' | 'fail' | 'warn';
                message?: string;
                durationMs?: number;
            }>;
        };
    };
    monitoringIntegration: {
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
    };
    versionHistory: {
        enabled: boolean;
        maxVersions: number;
        versions?: Array<{
            versionId: UUID;
            versionNumber: number;
            createdAt: string;
            createdBy: string;
            changeSummary?: string;
            changeType: 'created' | 'updated' | 'permission_changed' | 'status_changed' | 'deleted';
        }>;
    };
    searchMetadata: {
        enabled: boolean;
        indexingStrategy: 'full_text' | 'keyword' | 'semantic' | 'hybrid';
        searchableFields?: Array<'role_id' | 'name' | 'role_type' | 'permissions' | 'agents' | 'metadata' | 'description'>;
    };
    roleOperation: 'create' | 'assign' | 'revoke' | 'update' | 'delete';
    eventIntegration: {
        enabled: boolean;
        eventBusConnection?: {
            busType?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
            connectionString?: string;
            topicPrefix?: string;
            consumerGroup?: string;
        };
        publishedEvents?: Array<'role_created' | 'role_updated' | 'role_deleted' | 'permission_granted' | 'permission_revoked' | 'access_granted' | 'access_denied'>;
        subscribedEvents?: Array<'context_updated' | 'plan_executed' | 'confirm_approved' | 'security_alert'>;
    };
    auditTrail: {
        enabled: boolean;
        retentionDays: number;
        auditEvents?: Array<{
            eventId: UUID;
            eventType: 'role_created' | 'role_updated' | 'role_assigned' | 'role_revoked' | 'permission_granted' | 'permission_revoked' | 'role_activated' | 'role_deactivated';
            timestamp: string;
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
    };
}
/**
 * 角色查询过滤器DTO
 */
export interface RoleQueryFilterDTO {
    roleType?: RoleType[];
    status?: RoleStatus[];
    name?: string;
    displayName?: string;
    contextId?: UUID;
    securityClearance?: SecurityClearance[];
    department?: string;
    hasPermission?: {
        resourceType: string;
        resourceId: string;
        action: string;
    };
    createdAfter?: string;
    createdBefore?: string;
    updatedAfter?: string;
    updatedBefore?: string;
    agentCount?: {
        min?: number;
        max?: number;
    };
    complexityScore?: {
        min?: number;
        max?: number;
    };
}
/**
 * 分页参数DTO
 */
export interface PaginationParamsDTO {
    page?: number;
    limit?: number;
    offset?: number;
}
/**
 * 角色排序选项DTO
 */
export interface RoleSortOptionsDTO {
    field: 'name' | 'roleType' | 'status' | 'createdAt' | 'updatedAt' | 'complexityScore';
    direction: 'asc' | 'desc';
}
/**
 * 权限检查请求DTO
 */
export interface CheckPermissionRequestDTO {
    resourceType: string;
    resourceId: string;
    action: string;
}
/**
 * 批量操作结果DTO
 */
export interface BulkOperationResultDTO {
    success: number;
    failed: number;
    errors: Array<{
        roleId: UUID;
        error: string;
    }>;
}
/**
 * 角色统计信息DTO
 */
export interface RoleStatisticsDTO {
    totalRoles: number;
    activeRoles: number;
    inactiveRoles: number;
    rolesByType: Record<RoleType, number>;
    averageComplexityScore: number;
    totalPermissions: number;
    totalAgents: number;
}
/**
 * 角色复杂度分布DTO
 */
export interface RoleComplexityDistributionDTO {
    range: string;
    count: number;
    percentage: number;
}
//# sourceMappingURL=role.dto.d.ts.map