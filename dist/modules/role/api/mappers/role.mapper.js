"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleMapper = void 0;
const crypto_1 = require("crypto");
class RoleMapper {
    static toSchema(entity) {
        return {
            protocol_version: entity.protocolVersion,
            timestamp: entity.timestamp.toISOString(),
            role_id: entity.roleId,
            context_id: entity.contextId,
            name: entity.name,
            display_name: entity.displayName,
            description: entity.description,
            role_type: entity.roleType,
            status: entity.status,
            scope: entity.scope ? {
                level: entity.scope.level,
                context_ids: entity.scope.contextIds,
                plan_ids: entity.scope.planIds,
                resource_constraints: entity.scope.resourceConstraints ? {
                    max_contexts: entity.scope.resourceConstraints.maxContexts,
                    max_plans: entity.scope.resourceConstraints.maxPlans,
                    allowed_resource_types: entity.scope.resourceConstraints.allowedResourceTypes
                } : undefined
            } : undefined,
            permissions: entity.permissions.map(permission => ({
                permission_id: permission.permissionId,
                resource_type: permission.resourceType,
                resource_id: permission.resourceId,
                actions: permission.actions,
                conditions: permission.conditions ? {
                    time_based: permission.conditions.timeBased ? {
                        start_time: permission.conditions.timeBased.startTime?.toISOString(),
                        end_time: permission.conditions.timeBased.endTime?.toISOString(),
                        timezone: permission.conditions.timeBased.timezone,
                        days_of_week: permission.conditions.timeBased.daysOfWeek
                    } : undefined,
                    location_based: permission.conditions.locationBased ? {
                        allowed_ip_ranges: permission.conditions.locationBased.allowedIpRanges,
                        geo_restrictions: permission.conditions.locationBased.geoRestrictions
                    } : undefined,
                    context_based: permission.conditions.contextBased ? {
                        required_attributes: permission.conditions.contextBased.requiredAttributes,
                        forbidden_attributes: permission.conditions.contextBased.forbiddenAttributes
                    } : undefined,
                    approval_required: permission.conditions.approvalRequired ? {
                        for_actions: permission.conditions.approvalRequired.forActions,
                        approval_threshold: permission.conditions.approvalRequired.approvalThreshold,
                        approver_roles: permission.conditions.approvalRequired.approverRoles
                    } : undefined
                } : undefined,
                grant_type: permission.grantType,
                expiry: permission.expiry?.toISOString()
            })),
            inheritance: entity.inheritance ? {
                parent_roles: entity.inheritance.parentRoles?.map(parent => ({
                    role_id: parent.roleId,
                    inheritance_type: parent.inheritanceType,
                    excluded_permissions: parent.excludedPermissions,
                    conditions: parent.conditions
                })),
                child_roles: entity.inheritance.childRoles?.map(child => ({
                    role_id: child.roleId,
                    delegation_level: child.delegationLevel,
                    can_further_delegate: child.canFurtherDelegate
                })),
                inheritance_rules: entity.inheritance.inheritanceRules ? {
                    merge_strategy: entity.inheritance.inheritanceRules.mergeStrategy,
                    conflict_resolution: entity.inheritance.inheritanceRules.conflictResolution,
                    max_inheritance_depth: entity.inheritance.inheritanceRules.maxInheritanceDepth
                } : undefined
            } : undefined,
            delegation: entity.delegation ? {
                can_delegate: entity.delegation.canDelegate,
                delegatable_permissions: entity.delegation.delegatablePermissions,
                delegation_constraints: entity.delegation.delegationConstraints ? {
                    max_delegation_depth: entity.delegation.delegationConstraints.maxDelegationDepth,
                    time_limit: entity.delegation.delegationConstraints.timeLimit,
                    require_approval: entity.delegation.delegationConstraints.requireApproval,
                    revocable: entity.delegation.delegationConstraints.revocable
                } : undefined,
                active_delegations: entity.delegation.activeDelegations?.map(delegation => ({
                    delegation_id: delegation.delegationId,
                    delegated_to: delegation.delegatedTo,
                    permissions: delegation.permissions,
                    start_time: delegation.startTime.toISOString(),
                    end_time: delegation.endTime?.toISOString(),
                    status: delegation.status
                }))
            } : undefined,
            attributes: entity.attributes ? {
                security_clearance: entity.attributes.securityClearance,
                department: entity.attributes.department,
                seniority_level: entity.attributes.seniorityLevel,
                certification_requirements: entity.attributes.certificationRequirements?.map(cert => ({
                    certification: cert.certification,
                    level: cert.level,
                    expiry: cert.expiry?.toISOString(),
                    issuer: cert.issuer
                })),
                custom_attributes: entity.attributes.customAttributes
            } : undefined,
            validation_rules: entity.validationRules ? {
                assignment_rules: entity.validationRules.assignmentRules?.map(rule => ({
                    rule_id: rule.ruleId,
                    condition: rule.condition,
                    action: rule.action,
                    message: rule.message
                })),
                separation_of_duties: entity.validationRules.separationOfDuties?.map(sod => ({
                    conflicting_roles: sod.conflictingRoles,
                    severity: sod.severity,
                    exception_approval_required: sod.exceptionApprovalRequired
                }))
            } : undefined,
            audit_settings: entity.auditSettings ? {
                audit_enabled: entity.auditSettings.auditEnabled,
                audit_events: entity.auditSettings.auditEvents,
                retention_period: entity.auditSettings.retentionPeriod,
                compliance_frameworks: entity.auditSettings.complianceFrameworks
            } : undefined,
            agents: [],
            agent_management: entity.agentManagement ? {
                max_agents: entity.agentManagement.maxAgents,
                auto_scaling: entity.agentManagement.autoScaling,
                load_balancing: entity.agentManagement.loadBalancing,
                health_check_interval_ms: entity.agentManagement.healthCheckIntervalMs,
                default_agent_config: entity.agentManagement.defaultAgentConfig
            } : undefined,
            team_configuration: entity.teamConfiguration ? {
                max_team_size: entity.teamConfiguration.maxTeamSize,
                collaboration_rules: entity.teamConfiguration.collaborationRules?.map(rule => ({
                    rule_name: rule.ruleName,
                    rule_type: rule.ruleType,
                    rule_config: rule.ruleConfig
                })),
                decision_mechanism: entity.teamConfiguration.decisionMechanism ? {
                    type: entity.teamConfiguration.decisionMechanism.type,
                    threshold: entity.teamConfiguration.decisionMechanism.threshold,
                    timeout_ms: entity.teamConfiguration.decisionMechanism.timeoutMs
                } : undefined
            } : undefined,
            performance_metrics: {
                enabled: entity.performanceMetrics.enabled,
                collection_interval_seconds: entity.performanceMetrics.collectionIntervalSeconds,
                metrics: entity.performanceMetrics.metrics ? {
                    role_assignment_latency_ms: entity.performanceMetrics.metrics.roleAssignmentLatencyMs,
                    permission_check_latency_ms: entity.performanceMetrics.metrics.permissionCheckLatencyMs,
                    role_security_score: entity.performanceMetrics.metrics.roleSecurityScore,
                    permission_accuracy_percent: entity.performanceMetrics.metrics.permissionAccuracyPercent,
                    role_management_efficiency_score: entity.performanceMetrics.metrics.roleManagementEfficiencyScore,
                    active_roles_count: entity.performanceMetrics.metrics.activeRolesCount,
                    role_operations_per_second: entity.performanceMetrics.metrics.roleOperationsPerSecond,
                    role_memory_usage_mb: entity.performanceMetrics.metrics.roleMemoryUsageMb,
                    average_role_complexity_score: entity.performanceMetrics.metrics.averageRoleComplexityScore
                } : undefined,
                health_status: entity.performanceMetrics.healthStatus ? {
                    status: entity.performanceMetrics.healthStatus.status,
                    last_check: entity.performanceMetrics.healthStatus.lastCheck?.toISOString(),
                    checks: entity.performanceMetrics.healthStatus.checks?.map(check => ({
                        check_name: check.checkName,
                        status: check.status,
                        message: check.message,
                        duration_ms: check.durationMs
                    }))
                } : undefined,
                alerting: entity.performanceMetrics.alerting ? {
                    enabled: entity.performanceMetrics.alerting.enabled,
                    thresholds: entity.performanceMetrics.alerting.thresholds ? {
                        max_role_assignment_latency_ms: entity.performanceMetrics.alerting.thresholds.maxRoleAssignmentLatencyMs,
                        max_permission_check_latency_ms: entity.performanceMetrics.alerting.thresholds.maxPermissionCheckLatencyMs,
                        min_role_security_score: entity.performanceMetrics.alerting.thresholds.minRoleSecurityScore,
                        min_permission_accuracy_percent: entity.performanceMetrics.alerting.thresholds.minPermissionAccuracyPercent,
                        min_role_management_efficiency_score: entity.performanceMetrics.alerting.thresholds.minRoleManagementEfficiencyScore
                    } : undefined,
                    notification_channels: entity.performanceMetrics.alerting.notificationChannels
                } : undefined
            },
            monitoring_integration: {
                enabled: entity.monitoringIntegration.enabled,
                supported_providers: entity.monitoringIntegration.supportedProviders,
                integration_endpoints: entity.monitoringIntegration.integrationEndpoints ? {
                    metrics_api: entity.monitoringIntegration.integrationEndpoints.metricsApi,
                    role_access_api: entity.monitoringIntegration.integrationEndpoints.roleAccessApi,
                    permission_metrics_api: entity.monitoringIntegration.integrationEndpoints.permissionMetricsApi,
                    security_events_api: entity.monitoringIntegration.integrationEndpoints.securityEventsApi
                } : undefined,
                role_metrics: entity.monitoringIntegration.roleMetrics ? {
                    track_role_usage: entity.monitoringIntegration.roleMetrics.trackRoleUsage,
                    track_permission_checks: entity.monitoringIntegration.roleMetrics.trackPermissionChecks,
                    track_access_patterns: entity.monitoringIntegration.roleMetrics.trackAccessPatterns,
                    track_security_events: entity.monitoringIntegration.roleMetrics.trackSecurityEvents
                } : undefined,
                export_formats: entity.monitoringIntegration.exportFormats
            },
            version_history: {
                enabled: entity.versionHistory.enabled,
                max_versions: entity.versionHistory.maxVersions,
                versions: entity.versionHistory.versions?.map(version => ({
                    version_id: version.versionId,
                    version_number: version.versionNumber,
                    created_at: version.createdAt.toISOString(),
                    created_by: version.createdBy,
                    change_summary: version.changeSummary,
                    role_snapshot: version.roleSnapshot,
                    change_type: version.changeType
                })),
                auto_versioning: entity.versionHistory.autoVersioning ? {
                    enabled: entity.versionHistory.autoVersioning.enabled,
                    version_on_permission_change: entity.versionHistory.autoVersioning.versionOnPermissionChange,
                    version_on_status_change: entity.versionHistory.autoVersioning.versionOnStatusChange
                } : undefined
            },
            search_metadata: {
                enabled: entity.searchMetadata.enabled,
                indexing_strategy: entity.searchMetadata.indexingStrategy,
                searchable_fields: entity.searchMetadata.searchableFields,
                search_indexes: entity.searchMetadata.searchIndexes?.map(index => ({
                    index_id: index.indexId,
                    index_name: index.indexName,
                    fields: index.fields,
                    index_type: index.indexType,
                    created_at: index.createdAt?.toISOString(),
                    last_updated: index.lastUpdated?.toISOString()
                })),
                auto_indexing: entity.searchMetadata.autoIndexing ? {
                    enabled: entity.searchMetadata.autoIndexing.enabled,
                    index_new_roles: entity.searchMetadata.autoIndexing.indexNewRoles,
                    reindex_interval_hours: entity.searchMetadata.autoIndexing.reindexIntervalHours
                } : undefined
            },
            role_operation: entity.roleOperation,
            event_integration: {
                enabled: entity.eventIntegration.enabled,
                event_bus_connection: entity.eventIntegration.eventBusConnection ? {
                    bus_type: entity.eventIntegration.eventBusConnection.busType,
                    connection_string: entity.eventIntegration.eventBusConnection.connectionString,
                    topic_prefix: entity.eventIntegration.eventBusConnection.topicPrefix,
                    consumer_group: entity.eventIntegration.eventBusConnection.consumerGroup
                } : undefined,
                published_events: entity.eventIntegration.publishedEvents,
                subscribed_events: entity.eventIntegration.subscribedEvents,
                event_routing: entity.eventIntegration.eventRouting ? {
                    routing_rules: entity.eventIntegration.eventRouting.routingRules?.map(rule => ({
                        rule_id: rule.ruleId,
                        condition: rule.condition,
                        target_topic: rule.targetTopic,
                        enabled: rule.enabled
                    }))
                } : undefined
            },
            audit_trail: {
                enabled: entity.auditTrail.enabled,
                retention_days: entity.auditTrail.retentionDays,
                audit_events: entity.auditTrail.auditEvents?.map(event => ({
                    event_id: event.eventId,
                    event_type: event.eventType,
                    timestamp: event.timestamp.toISOString(),
                    user_id: event.userId,
                    user_role: event.userRole,
                    action: event.action,
                    resource: event.resource,
                    role_operation: event.roleOperation,
                    role_id: event.roleId,
                    role_name: event.roleName,
                    role_type: event.roleType,
                    permission_ids: event.permissionIds,
                    role_status: event.roleStatus,
                    role_details: event.roleDetails,
                    ip_address: event.ipAddress,
                    user_agent: event.userAgent,
                    session_id: event.sessionId,
                    correlation_id: event.correlationId
                })),
                compliance_settings: entity.auditTrail.complianceSettings ? {
                    gdpr_enabled: entity.auditTrail.complianceSettings.gdprEnabled,
                    hipaa_enabled: entity.auditTrail.complianceSettings.hipaaEnabled,
                    sox_enabled: entity.auditTrail.complianceSettings.soxEnabled,
                    role_audit_level: entity.auditTrail.complianceSettings.roleAuditLevel,
                    role_data_logging: entity.auditTrail.complianceSettings.roleDataLogging,
                    custom_compliance: entity.auditTrail.complianceSettings.customCompliance
                } : undefined
            }
        };
    }
    static fromSchema(schema) {
        return {
            protocolVersion: schema.protocol_version,
            timestamp: new Date(schema.timestamp),
            roleId: schema.role_id,
            contextId: schema.context_id,
            name: schema.name,
            displayName: schema.display_name,
            description: schema.description,
            roleType: schema.role_type,
            status: schema.status,
            scope: schema.scope ? {
                level: schema.scope.level,
                contextIds: schema.scope.context_ids,
                planIds: schema.scope.plan_ids,
                resourceConstraints: schema.scope.resource_constraints ? {
                    maxContexts: schema.scope.resource_constraints.max_contexts,
                    maxPlans: schema.scope.resource_constraints.max_plans,
                    allowedResourceTypes: schema.scope.resource_constraints.allowed_resource_types
                } : undefined
            } : undefined,
            permissions: schema.permissions.map(permission => ({
                permissionId: permission.permission_id,
                resourceType: permission.resource_type,
                resourceId: permission.resource_id,
                actions: permission.actions,
                conditions: permission.conditions ? {
                    timeBased: permission.conditions.time_based ? {
                        startTime: permission.conditions.time_based.start_time ? new Date(permission.conditions.time_based.start_time) : undefined,
                        endTime: permission.conditions.time_based.end_time ? new Date(permission.conditions.time_based.end_time) : undefined,
                        timezone: permission.conditions.time_based.timezone,
                        daysOfWeek: permission.conditions.time_based.days_of_week
                    } : undefined,
                    locationBased: permission.conditions.location_based ? {
                        allowedIpRanges: permission.conditions.location_based.allowed_ip_ranges,
                        geoRestrictions: permission.conditions.location_based.geo_restrictions
                    } : undefined,
                    contextBased: permission.conditions.context_based ? {
                        requiredAttributes: permission.conditions.context_based.required_attributes,
                        forbiddenAttributes: permission.conditions.context_based.forbidden_attributes
                    } : undefined,
                    approvalRequired: permission.conditions.approval_required ? {
                        forActions: permission.conditions.approval_required.for_actions,
                        approvalThreshold: permission.conditions.approval_required.approval_threshold,
                        approverRoles: permission.conditions.approval_required.approver_roles
                    } : undefined
                } : undefined,
                grantType: permission.grant_type,
                expiry: permission.expiry ? new Date(permission.expiry) : undefined
            })),
            inheritance: schema.inheritance ? {
                parentRoles: schema.inheritance.parent_roles?.map(parent => ({
                    roleId: parent.role_id,
                    inheritanceType: parent.inheritance_type,
                    excludedPermissions: parent.excluded_permissions,
                    conditions: parent.conditions
                })),
                childRoles: schema.inheritance.child_roles?.map(child => ({
                    roleId: child.role_id,
                    delegationLevel: child.delegation_level,
                    canFurtherDelegate: child.can_further_delegate
                })),
                inheritanceRules: schema.inheritance.inheritance_rules ? {
                    mergeStrategy: schema.inheritance.inheritance_rules.merge_strategy,
                    conflictResolution: schema.inheritance.inheritance_rules.conflict_resolution,
                    maxInheritanceDepth: schema.inheritance.inheritance_rules.max_inheritance_depth
                } : undefined
            } : undefined,
            delegation: schema.delegation ? {
                canDelegate: schema.delegation.can_delegate,
                delegatablePermissions: schema.delegation.delegatable_permissions,
                delegationConstraints: schema.delegation.delegation_constraints ? {
                    maxDelegationDepth: schema.delegation.delegation_constraints.max_delegation_depth,
                    timeLimit: schema.delegation.delegation_constraints.time_limit,
                    requireApproval: schema.delegation.delegation_constraints.require_approval,
                    revocable: schema.delegation.delegation_constraints.revocable
                } : undefined,
                activeDelegations: schema.delegation.active_delegations?.map(delegation => ({
                    delegationId: delegation.delegation_id,
                    delegatedTo: delegation.delegated_to,
                    permissions: delegation.permissions,
                    startTime: new Date(delegation.start_time),
                    endTime: delegation.end_time ? new Date(delegation.end_time) : undefined,
                    status: delegation.status
                }))
            } : undefined,
            attributes: schema.attributes ? {
                securityClearance: schema.attributes.security_clearance,
                department: schema.attributes.department,
                seniorityLevel: schema.attributes.seniority_level,
                certificationRequirements: schema.attributes.certification_requirements?.map(cert => ({
                    certification: cert.certification,
                    level: cert.level,
                    expiry: cert.expiry ? new Date(cert.expiry) : undefined,
                    issuer: cert.issuer
                })),
                customAttributes: schema.attributes.custom_attributes
            } : undefined,
            validationRules: schema.validation_rules ? {
                assignmentRules: schema.validation_rules.assignment_rules?.map(rule => ({
                    ruleId: rule.rule_id,
                    condition: rule.condition,
                    action: rule.action,
                    message: rule.message
                })),
                separationOfDuties: schema.validation_rules.separation_of_duties?.map(sod => ({
                    conflictingRoles: sod.conflicting_roles,
                    severity: sod.severity,
                    exceptionApprovalRequired: sod.exception_approval_required
                }))
            } : undefined,
            auditSettings: schema.audit_settings ? {
                auditEnabled: schema.audit_settings.audit_enabled,
                auditEvents: schema.audit_settings.audit_events,
                retentionPeriod: schema.audit_settings.retention_period,
                complianceFrameworks: schema.audit_settings.compliance_frameworks
            } : undefined,
            performanceMetrics: {
                enabled: schema.performance_metrics.enabled,
                collectionIntervalSeconds: schema.performance_metrics.collection_interval_seconds,
                metrics: schema.performance_metrics.metrics ? {
                    roleAssignmentLatencyMs: schema.performance_metrics.metrics.role_assignment_latency_ms,
                    permissionCheckLatencyMs: schema.performance_metrics.metrics.permission_check_latency_ms,
                    roleSecurityScore: schema.performance_metrics.metrics.role_security_score,
                    permissionAccuracyPercent: schema.performance_metrics.metrics.permission_accuracy_percent,
                    roleManagementEfficiencyScore: schema.performance_metrics.metrics.role_management_efficiency_score,
                    activeRolesCount: schema.performance_metrics.metrics.active_roles_count,
                    roleOperationsPerSecond: schema.performance_metrics.metrics.role_operations_per_second,
                    roleMemoryUsageMb: schema.performance_metrics.metrics.role_memory_usage_mb,
                    averageRoleComplexityScore: schema.performance_metrics.metrics.average_role_complexity_score
                } : undefined,
                healthStatus: schema.performance_metrics.health_status ? {
                    status: schema.performance_metrics.health_status.status,
                    lastCheck: schema.performance_metrics.health_status.last_check ? new Date(schema.performance_metrics.health_status.last_check) : undefined,
                    checks: schema.performance_metrics.health_status.checks?.map(check => ({
                        checkName: check.check_name,
                        status: check.status,
                        message: check.message,
                        durationMs: check.duration_ms
                    }))
                } : undefined,
                alerting: schema.performance_metrics.alerting ? {
                    enabled: schema.performance_metrics.alerting.enabled,
                    thresholds: schema.performance_metrics.alerting.thresholds ? {
                        maxRoleAssignmentLatencyMs: schema.performance_metrics.alerting.thresholds.max_role_assignment_latency_ms,
                        maxPermissionCheckLatencyMs: schema.performance_metrics.alerting.thresholds.max_permission_check_latency_ms,
                        minRoleSecurityScore: schema.performance_metrics.alerting.thresholds.min_role_security_score,
                        minPermissionAccuracyPercent: schema.performance_metrics.alerting.thresholds.min_permission_accuracy_percent,
                        minRoleManagementEfficiencyScore: schema.performance_metrics.alerting.thresholds.min_role_management_efficiency_score
                    } : undefined,
                    notificationChannels: schema.performance_metrics.alerting.notification_channels
                } : undefined
            },
            monitoringIntegration: {
                enabled: schema.monitoring_integration.enabled,
                supportedProviders: schema.monitoring_integration.supported_providers,
                integrationEndpoints: schema.monitoring_integration.integration_endpoints ? {
                    metricsApi: schema.monitoring_integration.integration_endpoints.metrics_api,
                    roleAccessApi: schema.monitoring_integration.integration_endpoints.role_access_api,
                    permissionMetricsApi: schema.monitoring_integration.integration_endpoints.permission_metrics_api,
                    securityEventsApi: schema.monitoring_integration.integration_endpoints.security_events_api
                } : undefined,
                roleMetrics: schema.monitoring_integration.role_metrics ? {
                    trackRoleUsage: schema.monitoring_integration.role_metrics.track_role_usage,
                    trackPermissionChecks: schema.monitoring_integration.role_metrics.track_permission_checks,
                    trackAccessPatterns: schema.monitoring_integration.role_metrics.track_access_patterns,
                    trackSecurityEvents: schema.monitoring_integration.role_metrics.track_security_events
                } : undefined,
                exportFormats: schema.monitoring_integration.export_formats
            },
            versionHistory: {
                enabled: schema.version_history.enabled,
                maxVersions: schema.version_history.max_versions,
                versions: schema.version_history.versions?.map(version => ({
                    versionId: version.version_id,
                    versionNumber: version.version_number,
                    createdAt: new Date(version.created_at),
                    createdBy: version.created_by,
                    changeSummary: version.change_summary,
                    roleSnapshot: version.role_snapshot,
                    changeType: version.change_type
                })),
                autoVersioning: schema.version_history.auto_versioning ? {
                    enabled: schema.version_history.auto_versioning.enabled,
                    versionOnPermissionChange: schema.version_history.auto_versioning.version_on_permission_change,
                    versionOnStatusChange: schema.version_history.auto_versioning.version_on_status_change
                } : undefined
            },
            searchMetadata: {
                enabled: schema.search_metadata.enabled,
                indexingStrategy: schema.search_metadata.indexing_strategy,
                searchableFields: schema.search_metadata.searchable_fields,
                searchIndexes: schema.search_metadata.search_indexes?.map(index => ({
                    indexId: index.index_id,
                    indexName: index.index_name,
                    fields: index.fields,
                    indexType: index.index_type,
                    createdAt: index.created_at ? new Date(index.created_at) : undefined,
                    lastUpdated: index.last_updated ? new Date(index.last_updated) : undefined
                })),
                autoIndexing: schema.search_metadata.auto_indexing ? {
                    enabled: schema.search_metadata.auto_indexing.enabled,
                    indexNewRoles: schema.search_metadata.auto_indexing.index_new_roles,
                    reindexIntervalHours: schema.search_metadata.auto_indexing.reindex_interval_hours
                } : undefined
            },
            roleOperation: schema.role_operation,
            eventIntegration: {
                enabled: schema.event_integration.enabled,
                eventBusConnection: schema.event_integration.event_bus_connection ? {
                    busType: schema.event_integration.event_bus_connection.bus_type,
                    connectionString: schema.event_integration.event_bus_connection.connection_string,
                    topicPrefix: schema.event_integration.event_bus_connection.topic_prefix,
                    consumerGroup: schema.event_integration.event_bus_connection.consumer_group
                } : undefined,
                publishedEvents: schema.event_integration.published_events,
                subscribedEvents: schema.event_integration.subscribed_events,
                eventRouting: schema.event_integration.event_routing ? {
                    routingRules: schema.event_integration.event_routing.routing_rules?.map(rule => ({
                        ruleId: rule.rule_id,
                        condition: rule.condition,
                        targetTopic: rule.target_topic,
                        enabled: rule.enabled
                    }))
                } : undefined
            },
            auditTrail: {
                enabled: schema.audit_trail.enabled,
                retentionDays: schema.audit_trail.retention_days,
                auditEvents: schema.audit_trail.audit_events?.map(event => ({
                    eventId: event.event_id,
                    eventType: event.event_type,
                    timestamp: new Date(event.timestamp),
                    userId: event.user_id,
                    userRole: event.user_role,
                    action: event.action,
                    resource: event.resource,
                    roleOperation: event.role_operation,
                    roleId: event.role_id,
                    roleName: event.role_name,
                    roleType: event.role_type,
                    permissionIds: event.permission_ids,
                    roleStatus: event.role_status,
                    roleDetails: event.role_details,
                    ipAddress: event.ip_address,
                    userAgent: event.user_agent,
                    sessionId: event.session_id,
                    correlationId: event.correlation_id
                })),
                complianceSettings: schema.audit_trail.compliance_settings ? {
                    gdprEnabled: schema.audit_trail.compliance_settings.gdpr_enabled,
                    hipaaEnabled: schema.audit_trail.compliance_settings.hipaa_enabled,
                    soxEnabled: schema.audit_trail.compliance_settings.sox_enabled,
                    roleAuditLevel: schema.audit_trail.compliance_settings.role_audit_level,
                    roleDataLogging: schema.audit_trail.compliance_settings.role_data_logging,
                    customCompliance: schema.audit_trail.compliance_settings.custom_compliance
                } : undefined
            }
        };
    }
    static validateSchema(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        const schema = data;
        const requiredFields = [
            'protocol_version',
            'timestamp',
            'role_id',
            'context_id',
            'name',
            'role_type',
            'status',
            'permissions',
            'performance_metrics',
            'monitoring_integration',
            'version_history',
            'search_metadata',
            'role_operation',
            'event_integration',
            'audit_trail'
        ];
        for (const field of requiredFields) {
            if (!(field in schema)) {
                return false;
            }
        }
        if (typeof schema.protocol_version !== 'string' ||
            typeof schema.timestamp !== 'string' ||
            typeof schema.role_id !== 'string' ||
            typeof schema.context_id !== 'string' ||
            typeof schema.name !== 'string' ||
            typeof schema.role_type !== 'string' ||
            typeof schema.status !== 'string' ||
            !Array.isArray(schema.permissions)) {
            return false;
        }
        if (typeof schema.performance_metrics !== 'object' ||
            typeof schema.monitoring_integration !== 'object' ||
            typeof schema.version_history !== 'object' ||
            typeof schema.search_metadata !== 'object' ||
            typeof schema.event_integration !== 'object' ||
            typeof schema.audit_trail !== 'object') {
            return false;
        }
        return true;
    }
    static toSchemaArray(entities) {
        return entities.map(entity => this.toSchema(entity));
    }
    static fromSchemaArray(schemas) {
        return schemas.map(schema => this.fromSchema(schema));
    }
    static validateSchemaArray(dataArray) {
        return dataArray.every(data => this.validateSchema(data));
    }
    static createDefault(overrides = {}) {
        const defaultData = {
            protocolVersion: '1.0.0',
            timestamp: new Date(),
            roleId: (0, crypto_1.randomUUID)(),
            contextId: (0, crypto_1.randomUUID)(),
            name: 'default-role',
            roleType: 'organizational',
            status: 'active',
            permissions: [],
            performanceMetrics: {
                enabled: true,
                collectionIntervalSeconds: 60
            },
            monitoringIntegration: {
                enabled: false,
                supportedProviders: []
            },
            versionHistory: {
                enabled: true,
                maxVersions: 50
            },
            searchMetadata: {
                enabled: true,
                indexingStrategy: 'keyword'
            },
            roleOperation: 'create',
            eventIntegration: {
                enabled: false
            },
            auditTrail: {
                enabled: true,
                retentionDays: 365
            }
        };
        return { ...defaultData, ...overrides };
    }
    static clone(entity) {
        return JSON.parse(JSON.stringify(entity));
    }
    static equals(entity1, entity2) {
        return JSON.stringify(this.toSchema(entity1)) === JSON.stringify(this.toSchema(entity2));
    }
    static getHash(entity) {
        const schema = this.toSchema(entity);
        const str = JSON.stringify(schema);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
    static objectToSnakeCase(obj) {
        if (!obj || typeof obj !== 'object')
            return obj;
        const toSnakeCase = (str) => {
            return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        };
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            const snakeKey = toSnakeCase(key);
            if (Array.isArray(value)) {
                result[snakeKey] = value.map(item => typeof item === 'object' && item !== null ? this.objectToSnakeCase(item) : item);
            }
            else if (typeof value === 'object' && value !== null) {
                result[snakeKey] = this.objectToSnakeCase(value);
            }
            else {
                result[snakeKey] = value;
            }
        }
        return result;
    }
    static objectToCamelCase(obj) {
        if (!obj || typeof obj !== 'object')
            return obj;
        const toCamelCase = (str) => {
            return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        };
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            const camelKey = toCamelCase(key);
            if (Array.isArray(value)) {
                result[camelKey] = value.map(item => typeof item === 'object' && item !== null ? this.objectToCamelCase(item) : item);
            }
            else if (typeof value === 'object' && value !== null) {
                result[camelKey] = this.objectToCamelCase(value);
            }
            else {
                result[camelKey] = value;
            }
        }
        return result;
    }
    static mapSecurityContextToSchema(securityContext) {
        return this.objectToSnakeCase(securityContext);
    }
    static mapSecurityContextFromSchema(securityContext) {
        return this.objectToCamelCase(securityContext);
    }
    static mapPerformanceMetricsToSchema(performanceMetrics) {
        return this.objectToSnakeCase(performanceMetrics);
    }
    static mapPerformanceMetricsFromSchema(performanceMetrics) {
        return this.objectToCamelCase(performanceMetrics);
    }
    static mapEventBusToSchema(eventBus) {
        return this.objectToSnakeCase(eventBus);
    }
    static mapEventBusFromSchema(eventBus) {
        return this.objectToCamelCase(eventBus);
    }
    static mapErrorHandlingToSchema(errorHandling) {
        return this.objectToSnakeCase(errorHandling);
    }
    static mapErrorHandlingFromSchema(errorHandling) {
        return this.objectToCamelCase(errorHandling);
    }
    static mapCoordinationToSchema(coordination) {
        return this.objectToSnakeCase(coordination);
    }
    static mapCoordinationFromSchema(coordination) {
        return this.objectToCamelCase(coordination);
    }
    static mapOrchestrationToSchema(orchestration) {
        return this.objectToSnakeCase(orchestration);
    }
    static mapOrchestrationFromSchema(orchestration) {
        return this.objectToCamelCase(orchestration);
    }
    static mapStateSyncToSchema(stateSync) {
        return this.objectToSnakeCase(stateSync);
    }
    static mapStateSyncFromSchema(stateSync) {
        return this.objectToCamelCase(stateSync);
    }
    static mapTransactionToSchema(transaction) {
        return this.objectToSnakeCase(transaction);
    }
    static mapTransactionFromSchema(transaction) {
        return this.objectToCamelCase(transaction);
    }
    static mapProtocolVersionToSchema(protocolVersion) {
        return this.objectToSnakeCase(protocolVersion);
    }
    static mapProtocolVersionFromSchema(protocolVersion) {
        return this.objectToCamelCase(protocolVersion);
    }
}
exports.RoleMapper = RoleMapper;
