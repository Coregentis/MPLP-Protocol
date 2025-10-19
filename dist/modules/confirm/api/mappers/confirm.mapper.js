"use strict";
/**
 * MPLP Confirm Module - Schema-TypeScript Mapper
 * @description 基于实际Schema的完整双重命名约定映射器
 * @version 1.0.0
 * @module ConfirmMapper
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmMapper = void 0;
// ===== CONFIRM MAPPER CLASS =====
/**
 * ConfirmMapper - 完整的Schema-TypeScript双向映射器
 * 基于mplp-confirm.json实际Schema实现
 */
class ConfirmMapper {
    /**
     * TypeScript实体 → Schema格式 (snake_case)
     * @param entity ConfirmEntityData
     * @returns ConfirmSchema
     */
    static toSchema(entity) {
        return {
            // 基础协议字段映射
            protocol_version: entity.protocolVersion,
            timestamp: entity.timestamp.toISOString(),
            confirm_id: entity.confirmId,
            context_id: entity.contextId,
            plan_id: entity.planId,
            // 业务核心字段映射
            confirmation_type: entity.confirmationType,
            status: entity.status,
            priority: entity.priority,
            // 请求者信息映射
            requester: {
                user_id: entity.requester.userId,
                role: entity.requester.role,
                department: entity.requester.department,
                request_reason: entity.requester.requestReason
            },
            // 审批工作流映射
            approval_workflow: {
                workflow_type: entity.approvalWorkflow.workflowType,
                steps: entity.approvalWorkflow.steps.map(step => ({
                    step_id: step.stepId,
                    step_order: step.stepOrder,
                    approver: {
                        user_id: step.approver.userId,
                        role: step.approver.role,
                        is_required: step.approver.isRequired,
                        delegation_allowed: step.approver.delegationAllowed
                    },
                    approval_criteria: step.approvalCriteria?.map(criteria => ({
                        criterion: criteria.criterion,
                        required: criteria.required,
                        weight: criteria.weight
                    })),
                    status: step.status,
                    decision: step.decision ? {
                        outcome: step.decision.outcome,
                        comments: step.decision.comments,
                        conditions: step.decision.conditions,
                        timestamp: step.decision.timestamp.toISOString(),
                        signature: step.decision.signature
                    } : undefined,
                    timeout: step.timeout ? {
                        duration: step.timeout.duration,
                        unit: step.timeout.unit,
                        action_on_timeout: step.timeout.actionOnTimeout
                    } : undefined
                })),
                escalation_rules: entity.approvalWorkflow.escalationRules?.map(rule => ({
                    trigger: rule.trigger,
                    escalate_to: {
                        user_id: rule.escalateTo.userId,
                        role: rule.escalateTo.role
                    },
                    notification_delay: rule.notificationDelay
                }))
            },
            // 确认主题映射
            subject: {
                title: entity.subject.title,
                description: entity.subject.description,
                impact_assessment: {
                    scope: entity.subject.impactAssessment.scope,
                    affected_systems: entity.subject.impactAssessment.affectedSystems,
                    affected_users: entity.subject.impactAssessment.affectedUsers,
                    business_impact: entity.subject.impactAssessment.businessImpact,
                    technical_impact: entity.subject.impactAssessment.technicalImpact
                },
                attachments: entity.subject.attachments?.map(attachment => ({
                    file_id: attachment.fileId,
                    filename: attachment.filename,
                    mime_type: attachment.mimeType,
                    size: attachment.size,
                    description: attachment.description
                }))
            },
            // 风险评估映射
            risk_assessment: {
                overall_risk_level: entity.riskAssessment.overallRiskLevel,
                risk_factors: entity.riskAssessment.riskFactors.map(factor => ({
                    factor: factor.factor,
                    description: factor.description,
                    probability: factor.probability,
                    impact: factor.impact,
                    mitigation: factor.mitigation
                })),
                compliance_requirements: entity.riskAssessment.complianceRequirements?.map(req => ({
                    regulation: req.regulation,
                    requirement: req.requirement,
                    compliance_status: req.complianceStatus,
                    evidence: req.evidence
                }))
            },
            // 通知设置映射
            notification_settings: {
                notify_on_events: entity.notificationSettings.notifyOnEvents,
                notification_channels: entity.notificationSettings.notificationChannels,
                stakeholders: entity.notificationSettings.stakeholders?.map(stakeholder => ({
                    user_id: stakeholder.userId,
                    role: stakeholder.role,
                    notification_preference: stakeholder.notificationPreference
                }))
            },
            // 审计追踪映射
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
                    confirm_operation: event.confirmOperation,
                    confirm_id: event.confirmId,
                    confirmation_type: event.confirmationType,
                    confirm_status: event.confirmStatus,
                    approval_step: event.approvalStep,
                    decision_reason: event.decisionReason,
                    approver_ids: event.approverIds,
                    confirm_details: event.confirmDetails,
                    old_value: event.oldValue,
                    new_value: event.newValue,
                    ip_address: event.ipAddress,
                    user_agent: event.userAgent,
                    session_id: event.sessionId,
                    correlation_id: event.correlationId
                })),
                compliance_settings: entity.auditTrail.complianceSettings ? {
                    gdpr_enabled: entity.auditTrail.complianceSettings.gdprEnabled,
                    hipaa_enabled: entity.auditTrail.complianceSettings.hipaaEnabled,
                    sox_enabled: entity.auditTrail.complianceSettings.soxEnabled,
                    confirm_audit_level: entity.auditTrail.complianceSettings.confirmAuditLevel,
                    confirm_data_logging: entity.auditTrail.complianceSettings.confirmDataLogging,
                    custom_compliance: entity.auditTrail.complianceSettings.customCompliance
                } : undefined
            },
            // 监控集成映射
            monitoring_integration: {
                enabled: entity.monitoringIntegration.enabled,
                supported_providers: entity.monitoringIntegration.supportedProviders,
                integration_endpoints: entity.monitoringIntegration.integrationEndpoints ? {
                    metrics_api: entity.monitoringIntegration.integrationEndpoints.metricsApi,
                    approval_metrics_api: entity.monitoringIntegration.integrationEndpoints.approvalMetricsApi,
                    workflow_metrics_api: entity.monitoringIntegration.integrationEndpoints.workflowMetricsApi,
                    compliance_metrics_api: entity.monitoringIntegration.integrationEndpoints.complianceMetricsApi
                } : undefined,
                approval_metrics: entity.monitoringIntegration.approvalMetrics ? {
                    track_approval_times: entity.monitoringIntegration.approvalMetrics.trackApprovalTimes,
                    track_workflow_performance: entity.monitoringIntegration.approvalMetrics.trackWorkflowPerformance,
                    track_decision_patterns: entity.monitoringIntegration.approvalMetrics.trackDecisionPatterns,
                    track_compliance_metrics: entity.monitoringIntegration.approvalMetrics.trackComplianceMetrics
                } : undefined,
                export_formats: entity.monitoringIntegration.exportFormats
            },
            // 性能指标映射
            performance_metrics: {
                enabled: entity.performanceMetrics.enabled,
                collection_interval_seconds: entity.performanceMetrics.collectionIntervalSeconds,
                metrics: entity.performanceMetrics.metrics ? {
                    confirm_processing_latency_ms: entity.performanceMetrics.metrics.confirmProcessingLatencyMs,
                    approval_rate_percent: entity.performanceMetrics.metrics.approvalRatePercent,
                    confirm_workflow_efficiency_score: entity.performanceMetrics.metrics.confirmWorkflowEfficiencyScore,
                    decision_accuracy_percent: entity.performanceMetrics.metrics.decisionAccuracyPercent,
                    confirm_compliance_score: entity.performanceMetrics.metrics.confirmComplianceScore,
                    active_confirmations_count: entity.performanceMetrics.metrics.activeConfirmationsCount,
                    confirm_operations_per_second: entity.performanceMetrics.metrics.confirmOperationsPerSecond,
                    confirm_memory_usage_mb: entity.performanceMetrics.metrics.confirmMemoryUsageMb,
                    average_approval_complexity_score: entity.performanceMetrics.metrics.averageApprovalComplexityScore
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
                        max_confirm_processing_latency_ms: entity.performanceMetrics.alerting.thresholds.maxConfirmProcessingLatencyMs,
                        min_approval_rate_percent: entity.performanceMetrics.alerting.thresholds.minApprovalRatePercent,
                        min_confirm_workflow_efficiency_score: entity.performanceMetrics.alerting.thresholds.minConfirmWorkflowEfficiencyScore,
                        min_decision_accuracy_percent: entity.performanceMetrics.alerting.thresholds.minDecisionAccuracyPercent,
                        min_confirm_compliance_score: entity.performanceMetrics.alerting.thresholds.minConfirmComplianceScore
                    } : undefined,
                    notification_channels: entity.performanceMetrics.alerting.notificationChannels
                } : undefined
            },
            // 版本历史映射
            version_history: {
                enabled: entity.versionHistory.enabled,
                max_versions: entity.versionHistory.maxVersions,
                versions: entity.versionHistory.versions?.map(version => ({
                    version_id: version.versionId,
                    version_number: version.versionNumber,
                    created_at: version.createdAt.toISOString(),
                    created_by: version.createdBy,
                    change_summary: version.changeSummary,
                    confirm_snapshot: version.confirmSnapshot,
                    change_type: version.changeType
                })),
                auto_versioning: entity.versionHistory.autoVersioning ? {
                    enabled: entity.versionHistory.autoVersioning.enabled,
                    version_on_config_change: entity.versionHistory.autoVersioning.versionOnConfigChange,
                    version_on_workflow_change: entity.versionHistory.autoVersioning.versionOnWorkflowChange,
                    version_on_status_change: entity.versionHistory.autoVersioning.versionOnStatusChange
                } : undefined
            },
            // 搜索元数据映射
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
                    last_updated: index.lastUpdated?.toISOString()
                })),
                confirm_indexing: entity.searchMetadata.confirmIndexing ? {
                    enabled: entity.searchMetadata.confirmIndexing.enabled,
                    index_confirm_data: entity.searchMetadata.confirmIndexing.indexConfirmData,
                    index_performance_metrics: entity.searchMetadata.confirmIndexing.indexPerformanceMetrics,
                    index_audit_logs: entity.searchMetadata.confirmIndexing.indexAuditLogs
                } : undefined,
                auto_indexing: entity.searchMetadata.autoIndexing ? {
                    enabled: entity.searchMetadata.autoIndexing.enabled,
                    index_new_confirmations: entity.searchMetadata.autoIndexing.indexNewConfirmations,
                    reindex_interval_hours: entity.searchMetadata.autoIndexing.reindexIntervalHours
                } : undefined
            },
            // AI集成接口映射
            ai_integration_interface: {
                enabled: entity.aiIntegrationInterface.enabled,
                supported_providers: entity.aiIntegrationInterface.supportedProviders,
                integration_endpoints: entity.aiIntegrationInterface.integrationEndpoints ? {
                    decision_support_api: entity.aiIntegrationInterface.integrationEndpoints.decisionSupportApi,
                    recommendation_api: entity.aiIntegrationInterface.integrationEndpoints.recommendationApi,
                    risk_assessment_api: entity.aiIntegrationInterface.integrationEndpoints.riskAssessmentApi
                } : undefined,
                request_format: entity.aiIntegrationInterface.requestFormat ? {
                    input_schema: entity.aiIntegrationInterface.requestFormat.inputSchema,
                    output_schema: entity.aiIntegrationInterface.requestFormat.outputSchema,
                    authentication: entity.aiIntegrationInterface.requestFormat.authentication ? {
                        type: entity.aiIntegrationInterface.requestFormat.authentication.type,
                        config: entity.aiIntegrationInterface.requestFormat.authentication.config
                    } : undefined
                } : undefined,
                response_handling: entity.aiIntegrationInterface.responseHandling ? {
                    timeout_ms: entity.aiIntegrationInterface.responseHandling.timeoutMs,
                    retry_policy: entity.aiIntegrationInterface.responseHandling.retryPolicy ? {
                        max_attempts: entity.aiIntegrationInterface.responseHandling.retryPolicy.maxAttempts,
                        backoff_strategy: entity.aiIntegrationInterface.responseHandling.retryPolicy.backoffStrategy
                    } : undefined,
                    fallback_behavior: entity.aiIntegrationInterface.responseHandling.fallbackBehavior
                } : undefined
            },
            // 决策支持接口映射
            decision_support_interface: {
                enabled: entity.decisionSupportInterface.enabled,
                external_decision_engines: entity.decisionSupportInterface.externalDecisionEngines?.map(engine => ({
                    engine_id: engine.engineId,
                    engine_name: engine.engineName,
                    engine_type: engine.engineType,
                    endpoint: engine.endpoint,
                    priority: engine.priority,
                    enabled: engine.enabled
                })),
                decision_criteria: entity.decisionSupportInterface.decisionCriteria ? {
                    supported_criteria: entity.decisionSupportInterface.decisionCriteria.supportedCriteria,
                    criteria_weights: entity.decisionSupportInterface.decisionCriteria.criteriaWeights
                } : undefined,
                fallback_strategy: {
                    when_engines_unavailable: entity.decisionSupportInterface.fallbackStrategy.whenEnginesUnavailable,
                    when_engines_disagree: entity.decisionSupportInterface.fallbackStrategy.whenEnginesDisagree
                }
            },
            // 确认操作和详情映射
            confirm_operation: entity.confirmOperation,
            confirm_details: entity.confirmDetails ? {
                approval_level: entity.confirmDetails.approvalLevel,
                timeout_seconds: entity.confirmDetails.timeoutSeconds,
                escalation_policy: entity.confirmDetails.escalationPolicy
            } : undefined,
            // 事件集成映射
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
            }
        };
    }
    /**
     * Schema格式 → TypeScript实体 (camelCase)
     * @param schema ConfirmSchema
     * @returns ConfirmEntityData
     */
    static fromSchema(schema) {
        return {
            // 基础协议字段映射
            protocolVersion: schema.protocol_version,
            timestamp: new Date(schema.timestamp),
            confirmId: schema.confirm_id,
            contextId: schema.context_id,
            planId: schema.plan_id,
            // 业务核心字段映射
            confirmationType: schema.confirmation_type,
            status: schema.status,
            priority: schema.priority,
            // 请求者信息映射
            requester: {
                userId: schema.requester.user_id,
                role: schema.requester.role,
                department: schema.requester.department,
                requestReason: schema.requester.request_reason
            },
            // 审批工作流映射
            approvalWorkflow: {
                workflowType: schema.approval_workflow.workflow_type,
                steps: schema.approval_workflow.steps.map(step => ({
                    stepId: step.step_id,
                    stepOrder: step.step_order,
                    approver: {
                        userId: step.approver.user_id,
                        role: step.approver.role,
                        isRequired: step.approver.is_required,
                        delegationAllowed: step.approver.delegation_allowed
                    },
                    approvalCriteria: step.approval_criteria?.map(criteria => ({
                        criterion: criteria.criterion,
                        required: criteria.required,
                        weight: criteria.weight
                    })),
                    status: step.status,
                    decision: step.decision ? {
                        outcome: step.decision.outcome,
                        comments: step.decision.comments,
                        conditions: step.decision.conditions,
                        timestamp: new Date(step.decision.timestamp),
                        signature: step.decision.signature
                    } : undefined,
                    timeout: step.timeout ? {
                        duration: step.timeout.duration,
                        unit: step.timeout.unit,
                        actionOnTimeout: step.timeout.action_on_timeout
                    } : undefined
                })),
                escalationRules: schema.approval_workflow.escalation_rules?.map(rule => ({
                    trigger: rule.trigger,
                    escalateTo: {
                        userId: rule.escalate_to.user_id,
                        role: rule.escalate_to.role
                    },
                    notificationDelay: rule.notification_delay
                }))
            },
            // 确认主题映射
            subject: {
                title: schema.subject.title,
                description: schema.subject.description,
                impactAssessment: {
                    scope: schema.subject.impact_assessment.scope,
                    affectedSystems: schema.subject.impact_assessment.affected_systems,
                    affectedUsers: schema.subject.impact_assessment.affected_users,
                    businessImpact: schema.subject.impact_assessment.business_impact,
                    technicalImpact: schema.subject.impact_assessment.technical_impact
                },
                attachments: schema.subject.attachments?.map(attachment => ({
                    fileId: attachment.file_id,
                    filename: attachment.filename,
                    mimeType: attachment.mime_type,
                    size: attachment.size,
                    description: attachment.description
                }))
            },
            // 风险评估映射
            riskAssessment: {
                overallRiskLevel: schema.risk_assessment.overall_risk_level,
                riskFactors: schema.risk_assessment.risk_factors.map(factor => ({
                    factor: factor.factor,
                    description: factor.description,
                    probability: factor.probability,
                    impact: factor.impact,
                    mitigation: factor.mitigation
                })),
                complianceRequirements: schema.risk_assessment.compliance_requirements?.map(req => ({
                    regulation: req.regulation,
                    requirement: req.requirement,
                    complianceStatus: req.compliance_status,
                    evidence: req.evidence
                }))
            },
            // 通知设置映射
            notificationSettings: {
                notifyOnEvents: schema.notification_settings.notify_on_events,
                notificationChannels: schema.notification_settings.notification_channels,
                stakeholders: schema.notification_settings.stakeholders?.map(stakeholder => ({
                    userId: stakeholder.user_id,
                    role: stakeholder.role,
                    notificationPreference: stakeholder.notification_preference
                }))
            },
            // 审计追踪映射
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
                    confirmOperation: event.confirm_operation,
                    confirmId: event.confirm_id,
                    confirmationType: event.confirmation_type,
                    confirmStatus: event.confirm_status,
                    approvalStep: event.approval_step,
                    decisionReason: event.decision_reason,
                    approverIds: event.approver_ids,
                    confirmDetails: event.confirm_details,
                    oldValue: event.old_value,
                    newValue: event.new_value,
                    ipAddress: event.ip_address,
                    userAgent: event.user_agent,
                    sessionId: event.session_id,
                    correlationId: event.correlation_id
                })),
                complianceSettings: schema.audit_trail.compliance_settings ? {
                    gdprEnabled: schema.audit_trail.compliance_settings.gdpr_enabled,
                    hipaaEnabled: schema.audit_trail.compliance_settings.hipaa_enabled,
                    soxEnabled: schema.audit_trail.compliance_settings.sox_enabled,
                    confirmAuditLevel: schema.audit_trail.compliance_settings.confirm_audit_level,
                    confirmDataLogging: schema.audit_trail.compliance_settings.confirm_data_logging,
                    customCompliance: schema.audit_trail.compliance_settings.custom_compliance
                } : undefined
            },
            // 监控集成映射
            monitoringIntegration: {
                enabled: schema.monitoring_integration.enabled,
                supportedProviders: schema.monitoring_integration.supported_providers,
                integrationEndpoints: schema.monitoring_integration.integration_endpoints ? {
                    metricsApi: schema.monitoring_integration.integration_endpoints.metrics_api,
                    approvalMetricsApi: schema.monitoring_integration.integration_endpoints.approval_metrics_api,
                    workflowMetricsApi: schema.monitoring_integration.integration_endpoints.workflow_metrics_api,
                    complianceMetricsApi: schema.monitoring_integration.integration_endpoints.compliance_metrics_api
                } : undefined,
                approvalMetrics: schema.monitoring_integration.approval_metrics ? {
                    trackApprovalTimes: schema.monitoring_integration.approval_metrics.track_approval_times,
                    trackWorkflowPerformance: schema.monitoring_integration.approval_metrics.track_workflow_performance,
                    trackDecisionPatterns: schema.monitoring_integration.approval_metrics.track_decision_patterns,
                    trackComplianceMetrics: schema.monitoring_integration.approval_metrics.track_compliance_metrics
                } : undefined,
                exportFormats: schema.monitoring_integration.export_formats
            },
            // 性能指标映射
            performanceMetrics: {
                enabled: schema.performance_metrics.enabled,
                collectionIntervalSeconds: schema.performance_metrics.collection_interval_seconds,
                metrics: schema.performance_metrics.metrics ? {
                    confirmProcessingLatencyMs: schema.performance_metrics.metrics.confirm_processing_latency_ms,
                    approvalRatePercent: schema.performance_metrics.metrics.approval_rate_percent,
                    confirmWorkflowEfficiencyScore: schema.performance_metrics.metrics.confirm_workflow_efficiency_score,
                    decisionAccuracyPercent: schema.performance_metrics.metrics.decision_accuracy_percent,
                    confirmComplianceScore: schema.performance_metrics.metrics.confirm_compliance_score,
                    activeConfirmationsCount: schema.performance_metrics.metrics.active_confirmations_count,
                    confirmOperationsPerSecond: schema.performance_metrics.metrics.confirm_operations_per_second,
                    confirmMemoryUsageMb: schema.performance_metrics.metrics.confirm_memory_usage_mb,
                    averageApprovalComplexityScore: schema.performance_metrics.metrics.average_approval_complexity_score
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
                        maxConfirmProcessingLatencyMs: schema.performance_metrics.alerting.thresholds.max_confirm_processing_latency_ms,
                        minApprovalRatePercent: schema.performance_metrics.alerting.thresholds.min_approval_rate_percent,
                        minConfirmWorkflowEfficiencyScore: schema.performance_metrics.alerting.thresholds.min_confirm_workflow_efficiency_score,
                        minDecisionAccuracyPercent: schema.performance_metrics.alerting.thresholds.min_decision_accuracy_percent,
                        minConfirmComplianceScore: schema.performance_metrics.alerting.thresholds.min_confirm_compliance_score
                    } : undefined,
                    notificationChannels: schema.performance_metrics.alerting.notification_channels
                } : undefined
            },
            // 版本历史映射
            versionHistory: {
                enabled: schema.version_history.enabled,
                maxVersions: schema.version_history.max_versions,
                versions: schema.version_history.versions?.map(version => ({
                    versionId: version.version_id,
                    versionNumber: version.version_number,
                    createdAt: new Date(version.created_at),
                    createdBy: version.created_by,
                    changeSummary: version.change_summary,
                    confirmSnapshot: version.confirm_snapshot,
                    changeType: version.change_type
                })),
                autoVersioning: schema.version_history.auto_versioning ? {
                    enabled: schema.version_history.auto_versioning.enabled,
                    versionOnConfigChange: schema.version_history.auto_versioning.version_on_config_change,
                    versionOnWorkflowChange: schema.version_history.auto_versioning.version_on_workflow_change,
                    versionOnStatusChange: schema.version_history.auto_versioning.version_on_status_change
                } : undefined
            },
            // 搜索元数据映射
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
                    lastUpdated: index.last_updated ? new Date(index.last_updated) : undefined
                })),
                confirmIndexing: schema.search_metadata.confirm_indexing ? {
                    enabled: schema.search_metadata.confirm_indexing.enabled,
                    indexConfirmData: schema.search_metadata.confirm_indexing.index_confirm_data,
                    indexPerformanceMetrics: schema.search_metadata.confirm_indexing.index_performance_metrics,
                    indexAuditLogs: schema.search_metadata.confirm_indexing.index_audit_logs
                } : undefined,
                autoIndexing: schema.search_metadata.auto_indexing ? {
                    enabled: schema.search_metadata.auto_indexing.enabled,
                    indexNewConfirmations: schema.search_metadata.auto_indexing.index_new_confirmations,
                    reindexIntervalHours: schema.search_metadata.auto_indexing.reindex_interval_hours
                } : undefined
            },
            // AI集成接口映射
            aiIntegrationInterface: {
                enabled: schema.ai_integration_interface.enabled,
                supportedProviders: schema.ai_integration_interface.supported_providers,
                integrationEndpoints: schema.ai_integration_interface.integration_endpoints ? {
                    decisionSupportApi: schema.ai_integration_interface.integration_endpoints.decision_support_api,
                    recommendationApi: schema.ai_integration_interface.integration_endpoints.recommendation_api,
                    riskAssessmentApi: schema.ai_integration_interface.integration_endpoints.risk_assessment_api
                } : undefined,
                requestFormat: schema.ai_integration_interface.request_format ? {
                    inputSchema: schema.ai_integration_interface.request_format.input_schema,
                    outputSchema: schema.ai_integration_interface.request_format.output_schema,
                    authentication: schema.ai_integration_interface.request_format.authentication ? {
                        type: schema.ai_integration_interface.request_format.authentication.type,
                        config: schema.ai_integration_interface.request_format.authentication.config
                    } : undefined
                } : undefined,
                responseHandling: schema.ai_integration_interface.response_handling ? {
                    timeoutMs: schema.ai_integration_interface.response_handling.timeout_ms,
                    retryPolicy: schema.ai_integration_interface.response_handling.retry_policy ? {
                        maxAttempts: schema.ai_integration_interface.response_handling.retry_policy.max_attempts,
                        backoffStrategy: schema.ai_integration_interface.response_handling.retry_policy.backoff_strategy
                    } : undefined,
                    fallbackBehavior: schema.ai_integration_interface.response_handling.fallback_behavior
                } : undefined
            },
            // 决策支持接口映射
            decisionSupportInterface: {
                enabled: schema.decision_support_interface.enabled,
                externalDecisionEngines: schema.decision_support_interface.external_decision_engines?.map(engine => ({
                    engineId: engine.engine_id,
                    engineName: engine.engine_name,
                    engineType: engine.engine_type,
                    endpoint: engine.endpoint,
                    priority: engine.priority,
                    enabled: engine.enabled
                })),
                decisionCriteria: schema.decision_support_interface.decision_criteria ? {
                    supportedCriteria: schema.decision_support_interface.decision_criteria.supported_criteria,
                    criteriaWeights: schema.decision_support_interface.decision_criteria.criteria_weights
                } : undefined,
                fallbackStrategy: {
                    whenEnginesUnavailable: schema.decision_support_interface.fallback_strategy.when_engines_unavailable,
                    whenEnginesDisagree: schema.decision_support_interface.fallback_strategy.when_engines_disagree
                }
            },
            // 确认操作和详情映射
            confirmOperation: schema.confirm_operation,
            confirmDetails: schema.confirm_details ? {
                approvalLevel: schema.confirm_details.approval_level,
                timeoutSeconds: schema.confirm_details.timeout_seconds,
                escalationPolicy: schema.confirm_details.escalation_policy
            } : undefined,
            // 事件集成映射
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
            }
        };
    }
    /**
     * 验证Schema格式数据
     * @param data unknown
     * @returns data is ConfirmSchema
     */
    static validateSchema(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        const schema = data;
        // 验证必需字段
        const requiredFields = [
            'protocol_version',
            'timestamp',
            'confirm_id',
            'context_id',
            'confirmation_type',
            'status',
            'priority',
            'audit_trail',
            'monitoring_integration',
            'performance_metrics',
            'version_history',
            'search_metadata',
            'ai_integration_interface',
            'decision_support_interface',
            'event_integration'
        ];
        for (const field of requiredFields) {
            if (!(field in schema)) {
                return false;
            }
        }
        // 验证协议版本
        if (schema.protocol_version !== '1.0.0') {
            return false;
        }
        // 验证UUID格式
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
        if (typeof schema.confirm_id !== 'string' || !uuidRegex.test(schema.confirm_id)) {
            return false;
        }
        if (typeof schema.context_id !== 'string' || !uuidRegex.test(schema.context_id)) {
            return false;
        }
        // 验证时间戳格式
        if (typeof schema.timestamp !== 'string') {
            return false;
        }
        try {
            new Date(schema.timestamp);
        }
        catch {
            return false;
        }
        return true;
    }
    /**
     * 批量转换 TypeScript实体数组 → Schema数组
     * @param entities ConfirmEntityData[]
     * @returns ConfirmSchema[]
     */
    static toSchemaArray(entities) {
        return entities.map(entity => this.toSchema(entity));
    }
    /**
     * 批量转换 Schema数组 → TypeScript实体数组
     * @param schemas ConfirmSchema[]
     * @returns ConfirmEntityData[]
     */
    static fromSchemaArray(schemas) {
        return schemas.map(schema => this.fromSchema(schema));
    }
}
exports.ConfirmMapper = ConfirmMapper;
//# sourceMappingURL=confirm.mapper.js.map