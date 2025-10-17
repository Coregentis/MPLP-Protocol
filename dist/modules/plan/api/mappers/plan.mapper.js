"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanMapper = void 0;
const utils_1 = require("../../../../shared/utils");
class PlanMapper {
    static toSchema(entity) {
        return {
            protocol_version: entity.protocolVersion,
            timestamp: entity.timestamp instanceof Date ? entity.timestamp.toISOString() : entity.timestamp,
            plan_id: entity.planId,
            context_id: entity.contextId,
            name: entity.name,
            description: entity.description,
            status: entity.status,
            priority: entity.priority,
            timeline: entity.timeline ? {
                start_date: entity.timeline.startDate?.toISOString(),
                end_date: entity.timeline.endDate?.toISOString(),
                estimated_duration: entity.timeline.estimatedDuration,
                actual_duration: entity.timeline.actualDuration,
            } : undefined,
            tasks: entity.tasks.map(task => ({
                task_id: task.taskId,
                name: task.name,
                description: task.description,
                type: task.type,
                status: task.status,
                priority: task.priority,
                assignee: task.assignee ? {
                    user_id: task.assignee.userId,
                    role: task.assignee.role,
                    team: task.assignee.team,
                } : undefined,
                estimated_effort: task.estimatedEffort,
                actual_effort: task.actualEffort,
                resources_required: task.resourcesRequired?.map(resource => ({
                    resource_type: resource.resourceType,
                    amount: resource.amount,
                    unit: resource.unit,
                    availability: resource.availability,
                })),
                acceptance_criteria: task.acceptanceCriteria?.map(criteria => ({
                    id: criteria.id,
                    description: criteria.description,
                    type: criteria.type,
                    status: criteria.status,
                    verification_method: criteria.verificationMethod,
                })),
                sub_tasks: task.subTasks?.map(subTask => this.mapTaskToSchema(subTask)),
                metadata: task.metadata ? {
                    tags: task.metadata.tags,
                    category: task.metadata.category,
                    source: task.metadata.source,
                    complexity_score: task.metadata.complexityScore,
                    risk_level: task.metadata.riskLevel,
                    automation_level: task.metadata.automationLevel,
                    retry_count: task.metadata.retryCount,
                    max_retry_count: task.metadata.maxRetryCount,
                    intervention_required: task.metadata.interventionRequired,
                    intervention_reason: task.metadata.interventionReason,
                    intervention_requested_at: task.metadata.interventionRequestedAt?.toISOString(),
                    rollback_reason: task.metadata.rollbackReason,
                    rollback_target: task.metadata.rollbackTarget,
                    skip_reason: task.metadata.skipReason,
                    skip_dependents: task.metadata.skipDependents,
                } : undefined,
            })),
            dependencies: entity.dependencies?.map(dep => ({
                id: dep.id,
                source_task_id: dep.sourceTaskId,
                target_task_id: dep.targetTaskId,
                dependency_type: dep.dependencyType,
                lag: dep.lag,
                criticality: dep.criticality,
                condition: dep.condition,
            })),
            milestones: entity.milestones?.map(milestone => ({
                id: milestone.id,
                name: milestone.name,
                description: milestone.description,
                target_date: milestone.targetDate.toISOString(),
                status: milestone.status,
                success_criteria: milestone.successCriteria?.map(criteria => ({
                    metric: criteria.metric,
                    target_value: criteria.targetValue,
                    actual_value: criteria.actualValue,
                    status: criteria.status,
                })),
            })),
            optimization: entity.optimization ? {
                strategy: entity.optimization.strategy,
                constraints: entity.optimization.constraints ? {
                    max_duration: entity.optimization.constraints.maxDuration,
                    max_cost: entity.optimization.constraints.maxCost,
                    min_quality: entity.optimization.constraints.minQuality,
                    available_resources: entity.optimization.constraints.availableResources ?
                        this.mapResourceConstraintsToSchema(entity.optimization.constraints.availableResources) : undefined,
                } : undefined,
                parameters: entity.optimization.parameters ?
                    this.mapOptimizationParametersToSchema(entity.optimization.parameters) : undefined,
            } : undefined,
            risk_assessment: entity.riskAssessment ? {
                overall_risk_level: entity.riskAssessment.overallRiskLevel,
                risks: entity.riskAssessment.risks?.map(risk => ({
                    id: risk.id,
                    name: risk.name,
                    description: risk.description,
                    level: risk.level,
                    category: risk.category,
                    probability: risk.probability,
                    impact: risk.impact,
                    status: risk.status,
                    mitigation_plan: risk.mitigationPlan,
                })),
            } : undefined,
            failure_resolver: entity.failureResolver ? {
                enabled: entity.failureResolver.enabled,
                strategies: entity.failureResolver.strategies,
                retry_config: entity.failureResolver.retryConfig ? {
                    max_attempts: entity.failureResolver.retryConfig.maxAttempts,
                    delay_ms: entity.failureResolver.retryConfig.delayMs,
                    backoff_factor: entity.failureResolver.retryConfig.backoffFactor,
                    max_delay_ms: entity.failureResolver.retryConfig.maxDelayMs,
                } : undefined,
                rollback_config: entity.failureResolver.rollbackConfig ? {
                    enabled: entity.failureResolver.rollbackConfig.enabled,
                    checkpoint_frequency: entity.failureResolver.rollbackConfig.checkpointFrequency,
                    max_rollback_depth: entity.failureResolver.rollbackConfig.maxRollbackDepth,
                } : undefined,
                manual_intervention_config: entity.failureResolver.manualInterventionConfig ? {
                    timeout_ms: entity.failureResolver.manualInterventionConfig.timeoutMs,
                    escalation_levels: entity.failureResolver.manualInterventionConfig.escalationLevels,
                    approval_required: entity.failureResolver.manualInterventionConfig.approvalRequired,
                } : undefined,
                notification_channels: entity.failureResolver.notificationChannels,
                performance_thresholds: entity.failureResolver.performanceThresholds ? {
                    max_execution_time_ms: entity.failureResolver.performanceThresholds.maxExecutionTimeMs,
                    max_memory_usage_mb: entity.failureResolver.performanceThresholds.maxMemoryUsageMb,
                    max_cpu_usage_percent: entity.failureResolver.performanceThresholds.maxCpuUsagePercent,
                } : undefined,
            } : undefined,
            configuration: entity.configuration ? {
                auto_scheduling_enabled: entity.configuration.autoSchedulingEnabled,
                dependency_validation_enabled: entity.configuration.dependencyValidationEnabled,
                risk_monitoring_enabled: entity.configuration.riskMonitoringEnabled,
                failure_recovery_enabled: entity.configuration.failureRecoveryEnabled,
                performance_tracking_enabled: entity.configuration.performanceTrackingEnabled,
                notification_settings: entity.configuration.notificationSettings ? {
                    enabled: entity.configuration.notificationSettings.enabled,
                    channels: entity.configuration.notificationSettings.channels,
                    events: entity.configuration.notificationSettings.events,
                    task_completion: entity.configuration.notificationSettings.taskCompletion,
                } : undefined,
                optimization_settings: entity.configuration.optimizationSettings ? {
                    enabled: entity.configuration.optimizationSettings.enabled,
                    strategy: entity.configuration.optimizationSettings.strategy,
                    auto_reoptimize: entity.configuration.optimizationSettings.autoReoptimize,
                } : undefined,
                timeout_settings: entity.configuration.timeoutSettings ? {
                    default_task_timeout_ms: entity.configuration.timeoutSettings.defaultTaskTimeoutMs,
                    plan_execution_timeout_ms: entity.configuration.timeoutSettings.planExecutionTimeoutMs,
                    dependency_resolution_timeout_ms: entity.configuration.timeoutSettings.dependencyResolutionTimeoutMs,
                } : undefined,
                parallel_execution_limit: entity.configuration.parallelExecutionLimit,
            } : undefined,
            metadata: entity.metadata ? this.mapMetadataToSchema(entity.metadata) : undefined,
            created_at: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
            updated_at: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt,
            created_by: entity.createdBy,
            updated_by: entity.updatedBy,
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
                    plan_operation: event.planOperation,
                    plan_id: event.planId,
                    plan_name: event.planName,
                    plan_status: event.planStatus,
                    task_ids: event.taskIds,
                    execution_stage: event.executionStage,
                    plan_details: event.planDetails ? this.mapAuditEventDetailsToSchema(event.planDetails) : undefined,
                    old_value: event.oldValue ? this.mapAuditEventDetailsToSchema(event.oldValue) : undefined,
                    new_value: event.newValue ? this.mapAuditEventDetailsToSchema(event.newValue) : undefined,
                    ip_address: event.ipAddress,
                    user_agent: event.userAgent,
                    session_id: event.sessionId,
                    correlation_id: event.correlationId,
                })),
                compliance_settings: entity.auditTrail.complianceSettings ? {
                    gdpr_enabled: entity.auditTrail.complianceSettings.gdprEnabled,
                    hipaa_enabled: entity.auditTrail.complianceSettings.hipaaEnabled,
                    sox_enabled: entity.auditTrail.complianceSettings.soxEnabled,
                    plan_audit_level: entity.auditTrail.complianceSettings.planAuditLevel,
                    plan_data_logging: entity.auditTrail.complianceSettings.planDataLogging,
                    custom_compliance: entity.auditTrail.complianceSettings.customCompliance,
                } : undefined,
            },
            monitoring_integration: {
                enabled: entity.monitoringIntegration.enabled,
                supported_providers: entity.monitoringIntegration.supportedProviders,
                integration_endpoints: entity.monitoringIntegration.integrationEndpoints ? {
                    metrics_api: entity.monitoringIntegration.integrationEndpoints.metricsApi,
                    plan_execution_api: entity.monitoringIntegration.integrationEndpoints.planExecutionApi,
                    task_metrics_api: entity.monitoringIntegration.integrationEndpoints.taskMetricsApi,
                    resource_metrics_api: entity.monitoringIntegration.integrationEndpoints.resourceMetricsApi,
                } : undefined,
                plan_metrics: entity.monitoringIntegration.planMetrics ? {
                    track_execution_progress: entity.monitoringIntegration.planMetrics.trackExecutionProgress,
                    track_task_performance: entity.monitoringIntegration.planMetrics.trackTaskPerformance,
                    track_resource_usage: entity.monitoringIntegration.planMetrics.trackResourceUsage,
                    track_failure_recovery: entity.monitoringIntegration.planMetrics.trackFailureRecovery,
                } : undefined,
                export_formats: entity.monitoringIntegration.exportFormats,
            },
            performance_metrics: {
                enabled: entity.performanceMetrics.enabled,
                collection_interval_seconds: entity.performanceMetrics.collectionIntervalSeconds,
                metrics: entity.performanceMetrics.metrics ? {
                    plan_execution_latency_ms: entity.performanceMetrics.metrics.planExecutionLatencyMs,
                    task_completion_rate_percent: entity.performanceMetrics.metrics.taskCompletionRatePercent,
                    plan_optimization_score: entity.performanceMetrics.metrics.planOptimizationScore,
                    dependency_resolution_accuracy_percent: entity.performanceMetrics.metrics.dependencyResolutionAccuracyPercent,
                    plan_execution_efficiency_score: entity.performanceMetrics.metrics.planExecutionEfficiencyScore,
                    active_plans_count: entity.performanceMetrics.metrics.activePlansCount,
                    plan_operations_per_second: entity.performanceMetrics.metrics.planOperationsPerSecond,
                    plan_memory_usage_mb: entity.performanceMetrics.metrics.planMemoryUsageMb,
                    average_plan_complexity_score: entity.performanceMetrics.metrics.averagePlanComplexityScore,
                } : undefined,
                health_status: entity.performanceMetrics.healthStatus ? {
                    status: entity.performanceMetrics.healthStatus.status,
                    last_check: entity.performanceMetrics.healthStatus.lastCheck.toISOString(),
                    checks: entity.performanceMetrics.healthStatus.checks?.map(check => ({
                        check_name: check.checkName,
                        status: check.status,
                        message: check.message,
                        duration_ms: check.durationMs,
                    })),
                } : undefined,
                alerting: entity.performanceMetrics.alerting ? {
                    enabled: entity.performanceMetrics.alerting.enabled,
                    thresholds: entity.performanceMetrics.alerting.thresholds ? {
                        max_plan_execution_latency_ms: entity.performanceMetrics.alerting.thresholds.maxPlanExecutionLatencyMs,
                        min_task_completion_rate_percent: entity.performanceMetrics.alerting.thresholds.minTaskCompletionRatePercent,
                        min_plan_optimization_score: entity.performanceMetrics.alerting.thresholds.minPlanOptimizationScore,
                        min_dependency_resolution_accuracy_percent: entity.performanceMetrics.alerting.thresholds.minDependencyResolutionAccuracyPercent,
                        min_plan_execution_efficiency_score: entity.performanceMetrics.alerting.thresholds.minPlanExecutionEfficiencyScore,
                    } : undefined,
                    notification_channels: entity.performanceMetrics.alerting.notificationChannels,
                } : undefined,
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
                    plan_snapshot: version.planSnapshot ? this.mapMetadataToSchema(version.planSnapshot) : undefined,
                    change_type: version.changeType,
                })),
                auto_versioning: entity.versionHistory.autoVersioning ? {
                    enabled: entity.versionHistory.autoVersioning.enabled,
                    version_on_config_change: entity.versionHistory.autoVersioning.versionOnConfigChange,
                    version_on_task_change: entity.versionHistory.autoVersioning.versionOnTaskChange,
                    version_on_dependency_change: entity.versionHistory.autoVersioning.versionOnDependencyChange,
                } : undefined,
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
                    created_at: index.createdAt.toISOString(),
                    last_updated: index.lastUpdated.toISOString(),
                })),
                plan_indexing: entity.searchMetadata.planIndexing ? {
                    enabled: entity.searchMetadata.planIndexing.enabled,
                    index_plan_data: entity.searchMetadata.planIndexing.indexPlanData,
                    index_performance_metrics: entity.searchMetadata.planIndexing.indexPerformanceMetrics,
                    index_audit_logs: entity.searchMetadata.planIndexing.indexAuditLogs,
                } : undefined,
                auto_indexing: entity.searchMetadata.autoIndexing ? {
                    enabled: entity.searchMetadata.autoIndexing.enabled,
                    index_new_plans: entity.searchMetadata.autoIndexing.indexNewPlans,
                    reindex_interval_hours: entity.searchMetadata.autoIndexing.reindexIntervalHours,
                } : undefined,
            },
            caching_policy: {
                enabled: entity.cachingPolicy.enabled,
                cache_strategy: entity.cachingPolicy.cacheStrategy,
                cache_levels: entity.cachingPolicy.cacheLevels?.map(level => ({
                    level: level.level,
                    backend: level.backend,
                    ttl_seconds: level.ttlSeconds,
                    max_size_mb: level.maxSizeMb,
                    eviction_policy: level.evictionPolicy,
                })),
                cache_warming: entity.cachingPolicy.cacheWarming ? {
                    enabled: entity.cachingPolicy.cacheWarming.enabled,
                    strategies: entity.cachingPolicy.cacheWarming.strategies,
                } : undefined,
            },
            event_integration: {
                enabled: entity.eventIntegration.enabled,
                event_bus_connection: entity.eventIntegration.eventBusConnection ? {
                    bus_type: entity.eventIntegration.eventBusConnection.busType,
                    connection_string: entity.eventIntegration.eventBusConnection.connectionString,
                    topic_prefix: entity.eventIntegration.eventBusConnection.topicPrefix,
                    consumer_group: entity.eventIntegration.eventBusConnection.consumerGroup,
                } : undefined,
                published_events: entity.eventIntegration.publishedEvents,
                subscribed_events: entity.eventIntegration.subscribedEvents,
                event_routing: entity.eventIntegration.eventRouting ? {
                    routing_rules: entity.eventIntegration.eventRouting.routingRules?.map(rule => ({
                        rule_id: rule.ruleId,
                        condition: rule.condition,
                        target_topic: rule.targetTopic,
                        enabled: rule.enabled,
                    })),
                } : undefined,
            },
        };
    }
    static fromSchema(schema) {
        return {
            protocolVersion: schema.protocol_version,
            timestamp: new Date(schema.timestamp),
            planId: schema.plan_id,
            contextId: schema.context_id,
            name: schema.name,
            description: schema.description,
            status: schema.status,
            priority: schema.priority,
            timeline: schema.timeline ? {
                startDate: schema.timeline.start_date ? new Date(schema.timeline.start_date) : undefined,
                endDate: schema.timeline.end_date ? new Date(schema.timeline.end_date) : undefined,
                estimatedDuration: schema.timeline.estimated_duration,
                actualDuration: schema.timeline.actual_duration,
            } : undefined,
            tasks: schema.tasks.map(task => ({
                taskId: task.task_id,
                name: task.name,
                description: task.description,
                type: task.type,
                status: task.status,
                priority: task.priority,
                assignee: task.assignee ? {
                    userId: task.assignee.user_id,
                    role: task.assignee.role,
                    team: task.assignee.team,
                } : undefined,
                estimatedEffort: task.estimated_effort,
                actualEffort: task.actual_effort,
                resourcesRequired: task.resources_required?.map(resource => ({
                    resourceType: resource.resource_type,
                    amount: resource.amount,
                    unit: resource.unit,
                    availability: resource.availability,
                })),
                acceptanceCriteria: task.acceptance_criteria?.map(criteria => ({
                    id: criteria.id,
                    description: criteria.description,
                    type: criteria.type,
                    status: criteria.status,
                    verificationMethod: criteria.verification_method,
                })),
                subTasks: task.sub_tasks?.map(subTask => this.mapTaskFromSchema(subTask)),
                metadata: task.metadata ? {
                    tags: task.metadata.tags,
                    category: task.metadata.category,
                    source: task.metadata.source,
                    complexityScore: task.metadata.complexity_score,
                    riskLevel: task.metadata.risk_level,
                    automationLevel: task.metadata.automation_level,
                    retryCount: task.metadata.retry_count,
                    maxRetryCount: task.metadata.max_retry_count,
                    interventionRequired: task.metadata.intervention_required,
                    interventionReason: task.metadata.intervention_reason,
                    interventionRequestedAt: task.metadata.intervention_requested_at ? new Date(task.metadata.intervention_requested_at) : undefined,
                    rollbackReason: task.metadata.rollback_reason,
                    rollbackTarget: task.metadata.rollback_target,
                    skipReason: task.metadata.skip_reason,
                    skipDependents: task.metadata.skip_dependents,
                } : undefined,
            })),
            dependencies: schema.dependencies?.map(dep => ({
                id: dep.id,
                sourceTaskId: dep.source_task_id,
                targetTaskId: dep.target_task_id,
                dependencyType: dep.dependency_type,
                lag: dep.lag,
                criticality: dep.criticality,
                condition: dep.condition,
            })),
            milestones: schema.milestones?.map(milestone => ({
                id: milestone.id,
                name: milestone.name,
                description: milestone.description,
                targetDate: new Date(milestone.target_date),
                status: milestone.status,
                successCriteria: milestone.success_criteria?.map(criteria => ({
                    metric: criteria.metric,
                    targetValue: criteria.target_value,
                    actualValue: criteria.actual_value,
                    status: criteria.status,
                })),
            })),
            optimization: schema.optimization ? {
                strategy: schema.optimization.strategy,
                constraints: schema.optimization.constraints ? {
                    maxDuration: schema.optimization.constraints.max_duration,
                    maxCost: schema.optimization.constraints.max_cost,
                    minQuality: schema.optimization.constraints.min_quality,
                    availableResources: schema.optimization.constraints.available_resources ?
                        this.mapResourceConstraintsFromSchema(schema.optimization.constraints.available_resources) : undefined,
                } : undefined,
                parameters: schema.optimization.parameters ?
                    this.mapOptimizationParametersFromSchema(schema.optimization.parameters) : undefined,
            } : undefined,
            metadata: schema.metadata ? this.mapMetadataFromSchema(schema.metadata) : undefined,
            createdAt: schema.created_at ? new Date(schema.created_at) : undefined,
            updatedAt: schema.updated_at ? new Date(schema.updated_at) : undefined,
            createdBy: schema.created_by,
            updatedBy: schema.updated_by,
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
                    planOperation: event.plan_operation,
                    planId: event.plan_id,
                    planName: event.plan_name,
                    planStatus: event.plan_status,
                    taskIds: event.task_ids,
                    executionStage: event.execution_stage,
                    planDetails: event.plan_details ? this.mapAuditEventDetailsFromSchema(event.plan_details) : undefined,
                    oldValue: event.old_value ? this.mapAuditEventDetailsFromSchema(event.old_value) : undefined,
                    newValue: event.new_value ? this.mapAuditEventDetailsFromSchema(event.new_value) : undefined,
                    ipAddress: event.ip_address,
                    userAgent: event.user_agent,
                    sessionId: event.session_id,
                    correlationId: event.correlation_id,
                })),
                complianceSettings: schema.audit_trail.compliance_settings ? {
                    gdprEnabled: schema.audit_trail.compliance_settings.gdpr_enabled,
                    hipaaEnabled: schema.audit_trail.compliance_settings.hipaa_enabled,
                    soxEnabled: schema.audit_trail.compliance_settings.sox_enabled,
                    planAuditLevel: schema.audit_trail.compliance_settings.plan_audit_level,
                    planDataLogging: schema.audit_trail.compliance_settings.plan_data_logging,
                    customCompliance: schema.audit_trail.compliance_settings.custom_compliance,
                } : undefined,
            },
            monitoringIntegration: {
                enabled: schema.monitoring_integration.enabled,
                supportedProviders: schema.monitoring_integration.supported_providers,
                integrationEndpoints: schema.monitoring_integration.integration_endpoints ? {
                    metricsApi: schema.monitoring_integration.integration_endpoints.metrics_api,
                    planExecutionApi: schema.monitoring_integration.integration_endpoints.plan_execution_api,
                    taskMetricsApi: schema.monitoring_integration.integration_endpoints.task_metrics_api,
                    resourceMetricsApi: schema.monitoring_integration.integration_endpoints.resource_metrics_api,
                } : undefined,
                planMetrics: schema.monitoring_integration.plan_metrics ? {
                    trackExecutionProgress: schema.monitoring_integration.plan_metrics.track_execution_progress,
                    trackTaskPerformance: schema.monitoring_integration.plan_metrics.track_task_performance,
                    trackResourceUsage: schema.monitoring_integration.plan_metrics.track_resource_usage,
                    trackFailureRecovery: schema.monitoring_integration.plan_metrics.track_failure_recovery,
                } : undefined,
                exportFormats: schema.monitoring_integration.export_formats,
            },
            performanceMetrics: {
                enabled: schema.performance_metrics.enabled,
                collectionIntervalSeconds: schema.performance_metrics.collection_interval_seconds,
                metrics: schema.performance_metrics.metrics ? {
                    planExecutionLatencyMs: schema.performance_metrics.metrics.plan_execution_latency_ms,
                    taskCompletionRatePercent: schema.performance_metrics.metrics.task_completion_rate_percent,
                    planOptimizationScore: schema.performance_metrics.metrics.plan_optimization_score,
                    dependencyResolutionAccuracyPercent: schema.performance_metrics.metrics.dependency_resolution_accuracy_percent,
                    planExecutionEfficiencyScore: schema.performance_metrics.metrics.plan_execution_efficiency_score,
                    activePlansCount: schema.performance_metrics.metrics.active_plans_count,
                    planOperationsPerSecond: schema.performance_metrics.metrics.plan_operations_per_second,
                    planMemoryUsageMb: schema.performance_metrics.metrics.plan_memory_usage_mb,
                    averagePlanComplexityScore: schema.performance_metrics.metrics.average_plan_complexity_score,
                } : undefined,
                healthStatus: schema.performance_metrics.health_status ? {
                    status: schema.performance_metrics.health_status.status,
                    lastCheck: new Date(schema.performance_metrics.health_status.last_check),
                    checks: schema.performance_metrics.health_status.checks?.map(check => ({
                        checkName: check.check_name,
                        status: check.status,
                        message: check.message,
                        durationMs: check.duration_ms,
                    })),
                } : undefined,
                alerting: schema.performance_metrics.alerting ? {
                    enabled: schema.performance_metrics.alerting.enabled,
                    thresholds: schema.performance_metrics.alerting.thresholds ? {
                        maxPlanExecutionLatencyMs: schema.performance_metrics.alerting.thresholds.max_plan_execution_latency_ms,
                        minTaskCompletionRatePercent: schema.performance_metrics.alerting.thresholds.min_task_completion_rate_percent,
                        minPlanOptimizationScore: schema.performance_metrics.alerting.thresholds.min_plan_optimization_score,
                        minDependencyResolutionAccuracyPercent: schema.performance_metrics.alerting.thresholds.min_dependency_resolution_accuracy_percent,
                        minPlanExecutionEfficiencyScore: schema.performance_metrics.alerting.thresholds.min_plan_execution_efficiency_score,
                    } : undefined,
                    notificationChannels: schema.performance_metrics.alerting.notification_channels,
                } : undefined,
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
                    planSnapshot: version.plan_snapshot ? this.mapMetadataFromSchema(version.plan_snapshot) : undefined,
                    changeType: version.change_type,
                })),
                autoVersioning: schema.version_history.auto_versioning ? {
                    enabled: schema.version_history.auto_versioning.enabled,
                    versionOnConfigChange: schema.version_history.auto_versioning.version_on_config_change,
                    versionOnTaskChange: schema.version_history.auto_versioning.version_on_task_change,
                    versionOnDependencyChange: schema.version_history.auto_versioning.version_on_dependency_change,
                } : undefined,
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
                    createdAt: new Date(index.created_at),
                    lastUpdated: new Date(index.last_updated),
                })),
                planIndexing: schema.search_metadata.plan_indexing ? {
                    enabled: schema.search_metadata.plan_indexing.enabled,
                    indexPlanData: schema.search_metadata.plan_indexing.index_plan_data,
                    indexPerformanceMetrics: schema.search_metadata.plan_indexing.index_performance_metrics,
                    indexAuditLogs: schema.search_metadata.plan_indexing.index_audit_logs,
                } : undefined,
                autoIndexing: schema.search_metadata.auto_indexing ? {
                    enabled: schema.search_metadata.auto_indexing.enabled,
                    indexNewPlans: schema.search_metadata.auto_indexing.index_new_plans,
                    reindexIntervalHours: schema.search_metadata.auto_indexing.reindex_interval_hours,
                } : undefined,
            },
            cachingPolicy: {
                enabled: schema.caching_policy.enabled,
                cacheStrategy: schema.caching_policy.cache_strategy,
                cacheLevels: schema.caching_policy.cache_levels?.map(level => ({
                    level: level.level,
                    backend: level.backend,
                    ttlSeconds: level.ttl_seconds,
                    maxSizeMb: level.max_size_mb,
                    evictionPolicy: level.eviction_policy,
                })),
                cacheWarming: schema.caching_policy.cache_warming ? {
                    enabled: schema.caching_policy.cache_warming.enabled,
                    strategies: schema.caching_policy.cache_warming.strategies,
                } : undefined,
            },
            eventIntegration: {
                enabled: schema.event_integration.enabled,
                eventBusConnection: schema.event_integration.event_bus_connection ? {
                    busType: schema.event_integration.event_bus_connection.bus_type,
                    connectionString: schema.event_integration.event_bus_connection.connection_string,
                    topicPrefix: schema.event_integration.event_bus_connection.topic_prefix,
                    consumerGroup: schema.event_integration.event_bus_connection.consumer_group,
                } : undefined,
                publishedEvents: schema.event_integration.published_events,
                subscribedEvents: schema.event_integration.subscribed_events,
                eventRouting: schema.event_integration.event_routing ? {
                    routingRules: schema.event_integration.event_routing.routing_rules?.map(rule => ({
                        ruleId: rule.rule_id,
                        condition: rule.condition,
                        targetTopic: rule.target_topic,
                        enabled: rule.enabled,
                    })),
                } : undefined,
            },
        };
    }
    static validateSchema(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        const schema = data;
        const requiredFields = [
            'protocol_version', 'timestamp', 'plan_id', 'context_id', 'name', 'status', 'tasks',
            'audit_trail', 'monitoring_integration', 'performance_metrics', 'version_history',
            'search_metadata', 'caching_policy', 'event_integration'
        ];
        for (const field of requiredFields) {
            if (!(field in schema)) {
                return false;
            }
        }
        if (schema.protocol_version !== '1.0.0') {
            return false;
        }
        const validStatuses = ['draft', 'approved', 'active', 'paused', 'completed', 'cancelled', 'failed'];
        if (!validStatuses.includes(schema.status)) {
            return false;
        }
        if (!Array.isArray(schema.tasks)) {
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
    static mapTaskToSchema(task) {
        return {
            task_id: task.taskId,
            name: task.name,
            description: task.description,
            type: task.type,
            status: task.status,
            priority: task.priority,
            assignee: task.assignee ? {
                user_id: task.assignee.userId,
                role: task.assignee.role,
                team: task.assignee.team,
            } : undefined,
            estimated_effort: task.estimatedEffort,
            actual_effort: task.actualEffort,
            resources_required: task.resourcesRequired?.map(resource => ({
                resource_type: resource.resourceType,
                amount: resource.amount,
                unit: resource.unit,
                availability: resource.availability,
            })),
            acceptance_criteria: task.acceptanceCriteria?.map(criteria => ({
                id: criteria.id,
                description: criteria.description,
                type: criteria.type,
                status: criteria.status,
                verification_method: criteria.verificationMethod,
            })),
            sub_tasks: task.subTasks?.map(subTask => this.mapTaskToSchema(subTask)),
            metadata: task.metadata ? {
                tags: task.metadata.tags,
                category: task.metadata.category,
                source: task.metadata.source,
                complexity_score: task.metadata.complexityScore,
                risk_level: task.metadata.riskLevel,
                automation_level: task.metadata.automationLevel,
                retry_count: task.metadata.retryCount,
                max_retry_count: task.metadata.maxRetryCount,
                intervention_required: task.metadata.interventionRequired,
                intervention_reason: task.metadata.interventionReason,
                intervention_requested_at: task.metadata.interventionRequestedAt?.toISOString(),
                rollback_reason: task.metadata.rollbackReason,
                rollback_target: task.metadata.rollbackTarget,
                skip_reason: task.metadata.skipReason,
                skip_dependents: task.metadata.skipDependents,
            } : undefined,
        };
    }
    static mapTaskFromSchema(task) {
        return {
            taskId: task.task_id,
            name: task.name,
            description: task.description,
            type: task.type,
            status: task.status,
            priority: task.priority,
            assignee: task.assignee ? {
                userId: task.assignee.user_id,
                role: task.assignee.role,
                team: task.assignee.team,
            } : undefined,
            estimatedEffort: task.estimated_effort,
            actualEffort: task.actual_effort,
            resourcesRequired: task.resources_required?.map((resource) => ({
                resourceType: resource.resource_type,
                amount: resource.amount,
                unit: resource.unit,
                availability: resource.availability,
            })),
            acceptanceCriteria: task.acceptance_criteria?.map((criteria) => ({
                id: criteria.id,
                description: criteria.description,
                type: criteria.type,
                status: criteria.status,
                verificationMethod: criteria.verification_method,
            })),
            subTasks: task.sub_tasks?.map((subTask) => this.mapTaskFromSchema(subTask)),
            metadata: task.metadata ? {
                tags: task.metadata.tags,
                category: task.metadata.category,
                source: task.metadata.source,
                complexityScore: task.metadata.complexity_score,
                riskLevel: task.metadata.risk_level,
                automationLevel: task.metadata.automation_level,
                retryCount: task.metadata.retry_count,
                maxRetryCount: task.metadata.max_retry_count,
                interventionRequired: task.metadata.intervention_required,
                interventionReason: task.metadata.intervention_reason,
                interventionRequestedAt: task.metadata.intervention_requested_at ? new Date(task.metadata.intervention_requested_at) : undefined,
                rollbackReason: task.metadata.rollback_reason,
                rollbackTarget: task.metadata.rollback_target,
                skipReason: task.metadata.skip_reason,
                skipDependents: task.metadata.skip_dependents,
            } : undefined,
        };
    }
    static mapResourceConstraintsToSchema(constraints) {
        const result = {};
        for (const [resourceType, constraint] of Object.entries(constraints)) {
            result[resourceType] = {
                amount: constraint.amount,
                unit: constraint.unit,
                availability: constraint.availability,
            };
        }
        return result;
    }
    static mapResourceConstraintsFromSchema(constraints) {
        const result = {};
        for (const [resourceType, constraint] of Object.entries(constraints)) {
            result[resourceType] = {
                amount: constraint.amount,
                unit: constraint.unit,
                availability: constraint.availability,
            };
        }
        return result;
    }
    static mapOptimizationParametersToSchema(parameters) {
        return { ...parameters };
    }
    static mapOptimizationParametersFromSchema(parameters) {
        return { ...parameters };
    }
    static mapMetadataToSchema(metadata) {
        const result = {};
        for (const [key, value] of Object.entries(metadata)) {
            if (value instanceof Date) {
                result[key] = value.toISOString();
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
    static mapMetadataFromSchema(metadata) {
        const result = {};
        for (const [key, value] of Object.entries(metadata)) {
            if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                result[key] = new Date(value);
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
    static mapAuditEventDetailsToSchema(details) {
        const result = {};
        for (const [key, value] of Object.entries(details)) {
            if (value instanceof Date) {
                result[key] = value.toISOString();
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
    static mapAuditEventDetailsFromSchema(details) {
        const result = {};
        for (const [key, value] of Object.entries(details)) {
            if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                result[key] = new Date(value);
            }
            else {
                result[key] = value;
            }
        }
        return result;
    }
    static objectToSnakeCase(obj) {
        if (!obj || typeof obj !== 'object')
            return obj;
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            const snakeKey = (0, utils_1.toSnakeCase)(key);
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
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            const camelKey = (0, utils_1.toCamelCase)(key);
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
exports.PlanMapper = PlanMapper;
