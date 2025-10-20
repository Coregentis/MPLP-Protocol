/**
 * MPLP Role Module - Schema-TypeScript Mapper
 * @description 基于实际Schema的完整双重命名约定映射器 - 企业级RBAC安全中心
 * @version 1.0.0
 * @module RoleMapper
 */
import { UUID, Priority, RoleType, RoleStatus, AgentType, AgentStatus, ExpertiseLevel, CommunicationStyle, ConflictResolutionStrategy, GrantType, InheritanceType, MergeStrategy, ConflictResolution, SecurityClearance, SeniorityLevel, HealthStatus, CheckStatus, Agent } from '../../types';
/**
 * Role Schema Interface - 基于mplp-role.json
 * 所有字段使用snake_case命名约定
 */
export interface RoleSchema {
    protocol_version: string;
    timestamp: string;
    role_id: UUID;
    context_id: UUID;
    name: string;
    display_name?: string;
    description?: string;
    role_type: RoleType;
    status: RoleStatus;
    scope?: {
        level: 'global' | 'organization' | 'project' | 'team' | 'individual';
        context_ids?: UUID[];
        plan_ids?: UUID[];
        resource_constraints?: {
            max_contexts?: number;
            max_plans?: number;
            allowed_resource_types?: string[];
        };
    };
    permissions: Array<{
        permission_id: UUID;
        resource_type: 'context' | 'plan' | 'task' | 'confirmation' | 'trace' | 'role' | 'extension' | 'system';
        resource_id: UUID | '*';
        actions: Array<'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'monitor' | 'admin'>;
        conditions?: {
            time_based?: {
                start_time?: string;
                end_time?: string;
                timezone?: string;
                days_of_week?: number[];
            };
            location_based?: {
                allowed_ip_ranges?: string[];
                geo_restrictions?: string[];
            };
            context_based?: {
                required_attributes?: Record<string, unknown>;
                forbidden_attributes?: Record<string, unknown>;
            };
            approval_required?: {
                for_actions?: string[];
                approval_threshold?: number;
                approver_roles?: string[];
            };
        };
        grant_type: GrantType;
        expiry?: string;
    }>;
    inheritance?: {
        parent_roles?: Array<{
            role_id: UUID;
            inheritance_type: InheritanceType;
            excluded_permissions?: UUID[];
            conditions?: Record<string, unknown>;
        }>;
        child_roles?: Array<{
            role_id: UUID;
            delegation_level: number;
            can_further_delegate: boolean;
        }>;
        inheritance_rules?: {
            merge_strategy: MergeStrategy;
            conflict_resolution: ConflictResolution;
            max_inheritance_depth?: number;
        };
    };
    delegation?: {
        can_delegate: boolean;
        delegatable_permissions?: UUID[];
        delegation_constraints?: {
            max_delegation_depth?: number;
            time_limit?: number;
            require_approval?: boolean;
            revocable?: boolean;
        };
        active_delegations?: Array<{
            delegation_id: UUID;
            delegated_to: string;
            permissions: UUID[];
            start_time: string;
            end_time?: string;
            status: 'active' | 'suspended' | 'revoked' | 'expired';
        }>;
    };
    attributes?: {
        security_clearance?: SecurityClearance;
        department?: string;
        seniority_level?: SeniorityLevel;
        certification_requirements?: Array<{
            certification: string;
            level: string;
            expiry?: string;
            issuer?: string;
        }>;
        custom_attributes?: Record<string, string | number | boolean>;
    };
    validation_rules?: {
        assignment_rules?: Array<{
            rule_id: UUID;
            condition: string;
            action: 'allow' | 'deny' | 'require_approval';
            message?: string;
        }>;
        separation_of_duties?: Array<{
            conflicting_roles: UUID[];
            severity: 'warning' | 'error' | 'critical';
            exception_approval_required?: boolean;
        }>;
    };
    audit_settings?: {
        audit_enabled: boolean;
        audit_events?: Array<'assignment' | 'revocation' | 'delegation' | 'permission_change' | 'login' | 'action_performed'>;
        retention_period?: string;
        compliance_frameworks?: string[];
    };
    agents?: Array<{
        agent_id: UUID;
        name: string;
        type: AgentType;
        domain: string;
        status: AgentStatus;
        capabilities: {
            core: {
                critical_thinking: boolean;
                scenario_validation: boolean;
                ddsc_dialog: boolean;
                mplp_protocols: string[];
            };
            specialist: {
                domain: string;
                expertise_level: ExpertiseLevel;
                knowledge_areas: string[];
                tools?: string[];
            };
            collaboration: {
                communication_style: CommunicationStyle;
                conflict_resolution: ConflictResolutionStrategy;
                decision_weight: number;
                trust_level: number;
            };
            learning: {
                experience_accumulation: boolean;
                pattern_recognition: boolean;
                adaptation_mechanism: boolean;
                performance_optimization: boolean;
            };
        };
        configuration?: {
            basic: {
                max_concurrent_tasks: number;
                timeout_ms: number;
                retry_policy?: {
                    max_retries: number;
                    backoff_ms: number;
                    backoff_multiplier?: number;
                    max_backoff_ms?: number;
                };
                priority_level?: Priority;
            };
            communication: {
                protocols: string[];
                message_format: string;
                encryption_enabled?: boolean;
                compression_enabled?: boolean;
            };
            security: {
                authentication_required: boolean;
                authorization_level?: string;
                audit_logging: boolean;
                data_encryption?: boolean;
            };
        };
        performance_metrics?: {
            response_time_ms?: number;
            throughput_ops_per_sec?: number;
            success_rate?: number;
            error_rate?: number;
            last_updated?: string;
        };
        created_at: string;
        updated_at?: string;
        created_by: string;
    }>;
    agent_management?: {
        max_agents?: number;
        auto_scaling?: boolean;
        load_balancing?: boolean;
        health_check_interval_ms?: number;
        default_agent_config?: Record<string, unknown>;
    };
    team_configuration?: {
        max_team_size?: number;
        collaboration_rules?: Array<{
            rule_name: string;
            rule_type: 'communication' | 'decision' | 'conflict_resolution' | 'resource_sharing';
            rule_config?: Record<string, unknown>;
        }>;
        decision_mechanism?: {
            type: 'consensus' | 'majority' | 'weighted' | 'authority';
            threshold?: number;
            timeout_ms?: number;
        };
    };
    performance_metrics: {
        enabled: boolean;
        collection_interval_seconds: number;
        metrics?: {
            role_assignment_latency_ms?: number;
            permission_check_latency_ms?: number;
            role_security_score?: number;
            permission_accuracy_percent?: number;
            role_management_efficiency_score?: number;
            active_roles_count?: number;
            role_operations_per_second?: number;
            role_memory_usage_mb?: number;
            average_role_complexity_score?: number;
        };
        health_status?: {
            status: HealthStatus;
            last_check?: string;
            checks?: Array<{
                check_name: string;
                status: CheckStatus;
                message?: string;
                duration_ms?: number;
            }>;
        };
        alerting?: {
            enabled?: boolean;
            thresholds?: {
                max_role_assignment_latency_ms?: number;
                max_permission_check_latency_ms?: number;
                min_role_security_score?: number;
                min_permission_accuracy_percent?: number;
                min_role_management_efficiency_score?: number;
            };
            notification_channels?: Array<'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty'>;
        };
    };
    monitoring_integration: {
        enabled: boolean;
        supported_providers: Array<'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom'>;
        integration_endpoints?: {
            metrics_api?: string;
            role_access_api?: string;
            permission_metrics_api?: string;
            security_events_api?: string;
        };
        role_metrics?: {
            track_role_usage?: boolean;
            track_permission_checks?: boolean;
            track_access_patterns?: boolean;
            track_security_events?: boolean;
        };
        export_formats?: Array<'prometheus' | 'opentelemetry' | 'custom'>;
    };
    version_history: {
        enabled: boolean;
        max_versions: number;
        versions?: Array<{
            version_id: UUID;
            version_number: number;
            created_at: string;
            created_by: string;
            change_summary?: string;
            role_snapshot?: Record<string, unknown>;
            change_type: 'created' | 'updated' | 'permission_changed' | 'status_changed' | 'deleted';
        }>;
        auto_versioning?: {
            enabled?: boolean;
            version_on_permission_change?: boolean;
            version_on_status_change?: boolean;
        };
    };
    search_metadata: {
        enabled: boolean;
        indexing_strategy: 'full_text' | 'keyword' | 'semantic' | 'hybrid';
        searchable_fields?: Array<'role_id' | 'name' | 'role_type' | 'permissions' | 'agents' | 'metadata' | 'description'>;
        search_indexes?: Array<{
            index_id: string;
            index_name: string;
            fields: string[];
            index_type: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
            created_at?: string;
            last_updated?: string;
        }>;
        auto_indexing?: {
            enabled?: boolean;
            index_new_roles?: boolean;
            reindex_interval_hours?: number;
        };
    };
    role_operation: 'create' | 'assign' | 'revoke' | 'update' | 'delete';
    event_integration: {
        enabled: boolean;
        event_bus_connection?: {
            bus_type?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
            connection_string?: string;
            topic_prefix?: string;
            consumer_group?: string;
        };
        published_events?: Array<'role_created' | 'role_updated' | 'role_deleted' | 'permission_granted' | 'permission_revoked' | 'access_granted' | 'access_denied'>;
        subscribed_events?: Array<'context_updated' | 'plan_executed' | 'confirm_approved' | 'security_alert'>;
        event_routing?: {
            routing_rules?: Array<{
                rule_id?: string;
                condition?: string;
                target_topic?: string;
                enabled?: boolean;
            }>;
        };
    };
    audit_trail: {
        enabled: boolean;
        retention_days: number;
        audit_events?: Array<{
            event_id: UUID;
            event_type: 'role_created' | 'role_updated' | 'role_assigned' | 'role_revoked' | 'permission_granted' | 'permission_revoked' | 'role_activated' | 'role_deactivated';
            timestamp: string;
            user_id: string;
            user_role?: string;
            action: string;
            resource: string;
            role_operation?: string;
            role_id?: UUID;
            role_name?: string;
            role_type?: string;
            permission_ids?: string[];
            role_status?: string;
            role_details?: Record<string, unknown>;
            ip_address?: string;
            user_agent?: string;
            session_id?: string;
            correlation_id?: UUID;
        }>;
        compliance_settings?: {
            gdpr_enabled?: boolean;
            hipaa_enabled?: boolean;
            sox_enabled?: boolean;
            role_audit_level?: 'basic' | 'detailed' | 'comprehensive';
            role_data_logging?: boolean;
            custom_compliance?: string[];
        };
    };
}
/**
 * Role Entity Data Interface - TypeScript层
 * 所有字段使用camelCase命名约定
 */
export interface RoleEntityData {
    protocolVersion: string;
    timestamp: Date;
    roleId: UUID;
    contextId: UUID;
    name: string;
    displayName?: string;
    description?: string;
    roleType: RoleType;
    status: RoleStatus;
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
    permissions: Array<{
        permissionId: UUID;
        resourceType: 'context' | 'plan' | 'task' | 'confirmation' | 'trace' | 'role' | 'extension' | 'system';
        resourceId: UUID | '*';
        actions: Array<'create' | 'read' | 'update' | 'delete' | 'execute' | 'approve' | 'monitor' | 'admin'>;
        conditions?: {
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
        };
        grantType: GrantType;
        expiry?: Date;
    }>;
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
            startTime: Date;
            endTime?: Date;
            status: 'active' | 'suspended' | 'revoked' | 'expired';
        }>;
    };
    attributes?: {
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
    };
    validationRules?: {
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
    };
    auditSettings?: {
        auditEnabled: boolean;
        auditEvents?: Array<'assignment' | 'revocation' | 'delegation' | 'permission_change' | 'login' | 'action_performed'>;
        retentionPeriod?: string;
        complianceFrameworks?: string[];
    };
    agents?: Agent[];
    agentManagement?: {
        maxAgents?: number;
        autoScaling?: boolean;
        loadBalancing?: boolean;
        healthCheckIntervalMs?: number;
        defaultAgentConfig?: Record<string, unknown>;
    };
    teamConfiguration?: {
        maxTeamSize?: number;
        collaborationRules?: Array<{
            ruleName: string;
            ruleType: 'communication' | 'decision' | 'conflict_resolution' | 'resource_sharing';
            ruleConfig?: Record<string, unknown>;
        }>;
        decisionMechanism?: {
            type: 'consensus' | 'majority' | 'weighted' | 'authority';
            threshold?: number;
            timeoutMs?: number;
        };
    };
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
    };
    searchMetadata: {
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
        eventRouting?: {
            routingRules?: Array<{
                ruleId?: string;
                condition?: string;
                targetTopic?: string;
                enabled?: boolean;
            }>;
        };
    };
    auditTrail: {
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
    };
}
/**
 * Role模块Schema-TypeScript映射器
 *
 * @description 提供Role模块Schema和TypeScript实体间的双向映射
 * @implements 双重命名约定：Schema(snake_case) ↔ TypeScript(camelCase)
 * @version 1.0.0
 */
export declare class RoleMapper {
    /**
     * TypeScript实体 → Schema格式
     * @param entity Role实体数据
     * @returns Schema格式数据
     */
    static toSchema(entity: RoleEntityData): RoleSchema;
    /**
     * Schema格式 → TypeScript实体
     * @param schema Schema格式数据
     * @returns TypeScript实体数据
     */
    static fromSchema(schema: RoleSchema): RoleEntityData;
    /**
     * 验证Schema格式数据
     * @param data 待验证数据
     * @returns 是否为有效的RoleSchema
     */
    static validateSchema(data: unknown): data is RoleSchema;
    /**
     * 批量转换：TypeScript实体数组 → Schema数组
     * @param entities TypeScript实体数组
     * @returns Schema格式数组
     */
    static toSchemaArray(entities: RoleEntityData[]): RoleSchema[];
    /**
     * 批量转换：Schema数组 → TypeScript实体数组
     * @param schemas Schema格式数组
     * @returns TypeScript实体数组
     */
    static fromSchemaArray(schemas: RoleSchema[]): RoleEntityData[];
    /**
     * 批量验证Schema数组
     * @param dataArray 待验证数据数组
     * @returns 验证结果数组
     */
    static validateSchemaArray(dataArray: unknown[]): boolean;
    /**
     * 创建默认的Role实体数据
     * @param overrides 覆盖的字段
     * @returns 默认Role实体数据
     */
    static createDefault(overrides?: Partial<RoleEntityData>): RoleEntityData;
    /**
     * 深度克隆Role实体数据
     * @param entity 原始实体数据
     * @returns 克隆的实体数据
     */
    static clone(entity: RoleEntityData): RoleEntityData;
    /**
     * 比较两个Role实体数据是否相等
     * @param entity1 实体1
     * @param entity2 实体2
     * @returns 是否相等
     */
    static equals(entity1: RoleEntityData, entity2: RoleEntityData): boolean;
    /**
     * 获取实体数据的哈希值
     * @param entity 实体数据
     * @returns 哈希值
     */
    static getHash(entity: RoleEntityData): string;
    /**
     * 将对象键名转换为snake_case
     * @param obj 原始对象
     * @returns snake_case格式的对象
     */
    private static objectToSnakeCase;
    /**
     * 将对象键名转换为camelCase
     * @param obj 原始对象
     * @returns camelCase格式的对象
     */
    private static objectToCamelCase;
    /**
     * 1. 安全上下文映射到Schema (SecurityManager)
     * @description 将TypeScript安全上下文对象转换为Schema格式
     * @param securityContext 安全上下文对象
     * @returns Schema格式的安全上下文
     */
    static mapSecurityContextToSchema(securityContext: Record<string, unknown>): Record<string, unknown>;
    /**
     * 1. Schema安全上下文映射到TypeScript (SecurityManager)
     * @description 将Schema格式的安全上下文转换为TypeScript对象
     * @param securityContext Schema格式的安全上下文
     * @returns TypeScript格式的安全上下文
     */
    static mapSecurityContextFromSchema(securityContext: Record<string, unknown>): Record<string, unknown>;
    /**
     * 2. 性能指标映射到Schema (PerformanceMonitor)
     * @description 将TypeScript性能指标对象转换为Schema格式
     * @param performanceMetrics 性能指标对象
     * @returns Schema格式的性能指标
     */
    static mapPerformanceMetricsToSchema(performanceMetrics: Record<string, unknown>): Record<string, unknown>;
    /**
     * 2. Schema性能指标映射到TypeScript (PerformanceMonitor)
     * @description 将Schema格式的性能指标转换为TypeScript对象
     * @param performanceMetrics Schema格式的性能指标
     * @returns TypeScript格式的性能指标
     */
    static mapPerformanceMetricsFromSchema(performanceMetrics: Record<string, unknown>): Record<string, unknown>;
    /**
     * 3. 事件总线映射到Schema (EventBusManager)
     * @description 将TypeScript事件总线对象转换为Schema格式
     * @param eventBus 事件总线对象
     * @returns Schema格式的事件总线
     */
    static mapEventBusToSchema(eventBus: Record<string, unknown>): Record<string, unknown>;
    /**
     * 3. Schema事件总线映射到TypeScript (EventBusManager)
     * @description 将Schema格式的事件总线转换为TypeScript对象
     * @param eventBus Schema格式的事件总线
     * @returns TypeScript格式的事件总线
     */
    static mapEventBusFromSchema(eventBus: Record<string, unknown>): Record<string, unknown>;
    /**
     * 4. 错误处理映射到Schema (ErrorHandler)
     * @description 将TypeScript错误处理对象转换为Schema格式
     * @param errorHandling 错误处理对象
     * @returns Schema格式的错误处理
     */
    static mapErrorHandlingToSchema(errorHandling: Record<string, unknown>): Record<string, unknown>;
    /**
     * 4. Schema错误处理映射到TypeScript (ErrorHandler)
     * @description 将Schema格式的错误处理转换为TypeScript对象
     * @param errorHandling Schema格式的错误处理
     * @returns TypeScript格式的错误处理
     */
    static mapErrorHandlingFromSchema(errorHandling: Record<string, unknown>): Record<string, unknown>;
    /**
     * 5. 协调管理映射到Schema (CoordinationManager)
     * @description 将TypeScript协调管理对象转换为Schema格式
     * @param coordination 协调管理对象
     * @returns Schema格式的协调管理
     */
    static mapCoordinationToSchema(coordination: Record<string, unknown>): Record<string, unknown>;
    /**
     * 5. Schema协调管理映射到TypeScript (CoordinationManager)
     * @description 将Schema格式的协调管理转换为TypeScript对象
     * @param coordination Schema格式的协调管理
     * @returns TypeScript格式的协调管理
     */
    static mapCoordinationFromSchema(coordination: Record<string, unknown>): Record<string, unknown>;
    /**
     * 6. 编排管理映射到Schema (OrchestrationManager)
     * @description 将TypeScript编排管理对象转换为Schema格式
     * @param orchestration 编排管理对象
     * @returns Schema格式的编排管理
     */
    static mapOrchestrationToSchema(orchestration: Record<string, unknown>): Record<string, unknown>;
    /**
     * 6. Schema编排管理映射到TypeScript (OrchestrationManager)
     * @description 将Schema格式的编排管理转换为TypeScript对象
     * @param orchestration Schema格式的编排管理
     * @returns TypeScript格式的编排管理
     */
    static mapOrchestrationFromSchema(orchestration: Record<string, unknown>): Record<string, unknown>;
    /**
     * 7. 状态同步映射到Schema (StateSyncManager)
     * @description 将TypeScript状态同步对象转换为Schema格式
     * @param stateSync 状态同步对象
     * @returns Schema格式的状态同步
     */
    static mapStateSyncToSchema(stateSync: Record<string, unknown>): Record<string, unknown>;
    /**
     * 7. Schema状态同步映射到TypeScript (StateSyncManager)
     * @description 将Schema格式的状态同步转换为TypeScript对象
     * @param stateSync Schema格式的状态同步
     * @returns TypeScript格式的状态同步
     */
    static mapStateSyncFromSchema(stateSync: Record<string, unknown>): Record<string, unknown>;
    /**
     * 8. 事务管理映射到Schema (TransactionManager)
     * @description 将TypeScript事务管理对象转换为Schema格式
     * @param transaction 事务管理对象
     * @returns Schema格式的事务管理
     */
    static mapTransactionToSchema(transaction: Record<string, unknown>): Record<string, unknown>;
    /**
     * 8. Schema事务管理映射到TypeScript (TransactionManager)
     * @description 将Schema格式的事务管理转换为TypeScript对象
     * @param transaction Schema格式的事务管理
     * @returns TypeScript格式的事务管理
     */
    static mapTransactionFromSchema(transaction: Record<string, unknown>): Record<string, unknown>;
    /**
     * 9. 协议版本映射到Schema (ProtocolVersionManager)
     * @description 将TypeScript协议版本对象转换为Schema格式
     * @param protocolVersion 协议版本对象
     * @returns Schema格式的协议版本
     */
    static mapProtocolVersionToSchema(protocolVersion: Record<string, unknown>): Record<string, unknown>;
    /**
     * 9. Schema协议版本映射到TypeScript (ProtocolVersionManager)
     * @description 将Schema格式的协议版本转换为TypeScript对象
     * @param protocolVersion Schema格式的协议版本
     * @returns TypeScript格式的协议版本
     */
    static mapProtocolVersionFromSchema(protocolVersion: Record<string, unknown>): Record<string, unknown>;
}
//# sourceMappingURL=role.mapper.d.ts.map