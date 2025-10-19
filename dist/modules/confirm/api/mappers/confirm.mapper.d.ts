/**
 * MPLP Confirm Module - Schema-TypeScript Mapper
 * @description 基于实际Schema的完整双重命名约定映射器
 * @version 1.0.0
 * @module ConfirmMapper
 */
import { UUID, Priority, ConfirmationType, ConfirmationStatus, WorkflowType, StepStatus, DecisionOutcome, RiskLevel, ImpactLevel, BusinessImpact, TechnicalImpact, NotificationEvent, NotificationChannel, AuditEventType, HealthStatus, CheckStatus, AIProvider, AuthenticationType, FallbackBehavior, ConfirmOperation } from '../../types';
/**
 * Confirm Schema Interface - 基于mplp-confirm.json
 * 所有字段使用snake_case命名约定
 */
export interface ConfirmSchema {
    protocol_version: string;
    timestamp: string;
    confirm_id: UUID;
    context_id: UUID;
    plan_id?: UUID;
    confirmation_type: ConfirmationType;
    status: ConfirmationStatus;
    priority: Priority;
    requester: {
        user_id: string;
        role: string;
        department?: string;
        request_reason: string;
    };
    approval_workflow: {
        workflow_type: WorkflowType;
        steps: Array<{
            step_id: UUID;
            step_order: number;
            approver: {
                user_id: string;
                role: string;
                is_required: boolean;
                delegation_allowed?: boolean;
            };
            approval_criteria?: Array<{
                criterion: string;
                required: boolean;
                weight?: number;
            }>;
            status: StepStatus;
            decision?: {
                outcome: DecisionOutcome;
                comments?: string;
                conditions?: string[];
                timestamp: string;
                signature?: string;
            };
            timeout?: {
                duration: number;
                unit: 'minutes' | 'hours' | 'days';
                action_on_timeout: 'auto_approve' | 'auto_reject' | 'escalate' | 'extend';
            };
        }>;
        escalation_rules?: Array<{
            trigger: 'timeout' | 'rejection' | 'manual' | 'system';
            escalate_to: {
                user_id: string;
                role: string;
            };
            notification_delay?: number;
        }>;
    };
    subject: {
        title: string;
        description: string;
        impact_assessment: {
            scope: 'task' | 'project' | 'organization' | 'external';
            affected_systems?: string[];
            affected_users?: string[];
            business_impact: BusinessImpact;
            technical_impact: TechnicalImpact;
        };
        attachments?: Array<{
            file_id: string;
            filename: string;
            mime_type: string;
            size: number;
            description?: string;
        }>;
    };
    risk_assessment: {
        overall_risk_level: RiskLevel;
        risk_factors: Array<{
            factor: string;
            description?: string;
            probability: number;
            impact: ImpactLevel;
            mitigation?: string;
        }>;
        compliance_requirements?: Array<{
            regulation: string;
            requirement: string;
            compliance_status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable';
            evidence?: string;
        }>;
    };
    notification_settings: {
        notify_on_events: NotificationEvent[];
        notification_channels: NotificationChannel[];
        stakeholders?: Array<{
            user_id: string;
            role: string;
            notification_preference: 'all' | 'important' | 'critical' | 'none';
        }>;
    };
    audit_trail: {
        enabled: boolean;
        retention_days: number;
        audit_events?: Array<{
            event_id: UUID;
            event_type: AuditEventType;
            timestamp: string;
            user_id: string;
            user_role?: string;
            action: string;
            resource: string;
            confirm_operation?: string;
            confirm_id?: UUID;
            confirmation_type?: string;
            confirm_status?: string;
            approval_step?: string;
            decision_reason?: string;
            approver_ids?: string[];
            confirm_details?: Record<string, unknown>;
            old_value?: Record<string, unknown>;
            new_value?: Record<string, unknown>;
            ip_address?: string;
            user_agent?: string;
            session_id?: string;
            correlation_id?: UUID;
        }>;
        compliance_settings?: {
            gdpr_enabled?: boolean;
            hipaa_enabled?: boolean;
            sox_enabled?: boolean;
            confirm_audit_level?: 'basic' | 'detailed' | 'comprehensive';
            confirm_data_logging?: boolean;
            custom_compliance?: string[];
        };
    };
    monitoring_integration: {
        enabled: boolean;
        supported_providers: Array<'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom'>;
        integration_endpoints?: {
            metrics_api?: string;
            approval_metrics_api?: string;
            workflow_metrics_api?: string;
            compliance_metrics_api?: string;
        };
        approval_metrics?: {
            track_approval_times?: boolean;
            track_workflow_performance?: boolean;
            track_decision_patterns?: boolean;
            track_compliance_metrics?: boolean;
        };
        export_formats?: Array<'prometheus' | 'opentelemetry' | 'custom'>;
    };
    performance_metrics: {
        enabled: boolean;
        collection_interval_seconds: number;
        metrics?: {
            confirm_processing_latency_ms?: number;
            approval_rate_percent?: number;
            confirm_workflow_efficiency_score?: number;
            decision_accuracy_percent?: number;
            confirm_compliance_score?: number;
            active_confirmations_count?: number;
            confirm_operations_per_second?: number;
            confirm_memory_usage_mb?: number;
            average_approval_complexity_score?: number;
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
                max_confirm_processing_latency_ms?: number;
                min_approval_rate_percent?: number;
                min_confirm_workflow_efficiency_score?: number;
                min_decision_accuracy_percent?: number;
                min_confirm_compliance_score?: number;
            };
            notification_channels?: Array<'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty'>;
        };
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
            confirm_snapshot?: Record<string, unknown>;
            change_type: 'confirm_created' | 'configuration_updated' | 'workflow_modified' | 'approver_changed' | 'status_updated';
        }>;
        auto_versioning?: {
            enabled?: boolean;
            version_on_config_change?: boolean;
            version_on_workflow_change?: boolean;
            version_on_status_change?: boolean;
        };
    };
    search_metadata: {
        enabled: boolean;
        indexing_strategy: 'full_text' | 'keyword' | 'semantic' | 'hybrid';
        searchable_fields?: Array<'confirm_id' | 'confirmation_type' | 'confirm_status' | 'approver_ids' | 'decision_reason' | 'confirm_data' | 'performance_metrics' | 'metadata' | 'audit_logs'>;
        search_indexes?: Array<{
            index_id: string;
            index_name: string;
            fields: string[];
            index_type: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
            created_at: string;
            last_updated?: string;
        }>;
        confirm_indexing?: {
            enabled?: boolean;
            index_confirm_data?: boolean;
            index_performance_metrics?: boolean;
            index_audit_logs?: boolean;
        };
        auto_indexing?: {
            enabled?: boolean;
            index_new_confirmations?: boolean;
            reindex_interval_hours?: number;
        };
    };
    ai_integration_interface: {
        enabled: boolean;
        supported_providers: AIProvider[];
        integration_endpoints?: {
            decision_support_api?: string;
            recommendation_api?: string;
            risk_assessment_api?: string;
        };
        request_format?: {
            input_schema?: string;
            output_schema?: string;
            authentication?: {
                type: AuthenticationType;
                config?: Record<string, unknown>;
            };
        };
        response_handling?: {
            timeout_ms?: number;
            retry_policy?: {
                max_attempts?: number;
                backoff_strategy?: 'linear' | 'exponential' | 'fixed';
            };
            fallback_behavior?: FallbackBehavior;
        };
    };
    decision_support_interface: {
        enabled: boolean;
        external_decision_engines?: Array<{
            engine_id: string;
            engine_name: string;
            engine_type: 'rule_engine' | 'ml_model' | 'expert_system' | 'hybrid';
            endpoint: string;
            priority: number;
            enabled: boolean;
        }>;
        decision_criteria?: {
            supported_criteria?: Array<'budget_threshold' | 'risk_level' | 'compliance_requirement' | 'resource_availability' | 'timeline_constraint'>;
            criteria_weights?: Record<string, number>;
        };
        fallback_strategy: {
            when_engines_unavailable?: 'manual_review' | 'default_workflow' | 'escalate';
            when_engines_disagree?: 'manual_review' | 'highest_priority_engine' | 'consensus_required';
        };
    };
    confirm_operation?: ConfirmOperation;
    confirm_details?: {
        approval_level?: number;
        timeout_seconds?: number;
        escalation_policy?: 'auto' | 'manual' | 'none';
    };
    event_integration: {
        enabled: boolean;
        event_bus_connection?: {
            bus_type?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
            connection_string?: string;
            topic_prefix?: string;
            consumer_group?: string;
        };
        published_events?: AuditEventType[];
        subscribed_events?: string[];
        event_routing?: {
            routing_rules?: Array<{
                rule_id: string;
                condition: string;
                target_topic: string;
                enabled?: boolean;
            }>;
        };
    };
}
/**
 * Confirm Entity Data Interface - TypeScript层
 * 所有字段使用camelCase命名约定
 */
export interface ConfirmEntityData {
    protocolVersion: string;
    timestamp: Date;
    confirmId: UUID;
    contextId: UUID;
    planId?: UUID;
    confirmationType: ConfirmationType;
    status: ConfirmationStatus;
    priority: Priority;
    requester: {
        userId: string;
        role: string;
        department?: string;
        requestReason: string;
    };
    approvalWorkflow: {
        workflowType: WorkflowType;
        steps: Array<{
            stepId: UUID;
            stepOrder: number;
            approver: {
                userId: string;
                role: string;
                isRequired: boolean;
                delegationAllowed?: boolean;
            };
            approvalCriteria?: Array<{
                criterion: string;
                required: boolean;
                weight?: number;
            }>;
            status: StepStatus;
            decision?: {
                outcome: DecisionOutcome;
                comments?: string;
                conditions?: string[];
                timestamp: Date;
                signature?: string;
            };
            timeout?: {
                duration: number;
                unit: 'minutes' | 'hours' | 'days';
                actionOnTimeout: 'auto_approve' | 'auto_reject' | 'escalate' | 'extend';
            };
        }>;
        escalationRules?: Array<{
            trigger: 'timeout' | 'rejection' | 'manual' | 'system';
            escalateTo: {
                userId: string;
                role: string;
            };
            notificationDelay?: number;
        }>;
    };
    subject: {
        title: string;
        description: string;
        impactAssessment: {
            scope: 'task' | 'project' | 'organization' | 'external';
            affectedSystems?: string[];
            affectedUsers?: string[];
            businessImpact: BusinessImpact;
            technicalImpact: TechnicalImpact;
        };
        attachments?: Array<{
            fileId: string;
            filename: string;
            mimeType: string;
            size: number;
            description?: string;
        }>;
    };
    riskAssessment: {
        overallRiskLevel: RiskLevel;
        riskFactors: Array<{
            factor: string;
            description?: string;
            probability: number;
            impact: ImpactLevel;
            mitigation?: string;
        }>;
        complianceRequirements?: Array<{
            regulation: string;
            requirement: string;
            complianceStatus: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_applicable';
            evidence?: string;
        }>;
    };
    notificationSettings: {
        notifyOnEvents: NotificationEvent[];
        notificationChannels: NotificationChannel[];
        stakeholders?: Array<{
            userId: string;
            role: string;
            notificationPreference: 'all' | 'important' | 'critical' | 'none';
        }>;
    };
    auditTrail: {
        enabled: boolean;
        retentionDays: number;
        auditEvents?: Array<{
            eventId: UUID;
            eventType: AuditEventType;
            timestamp: Date;
            userId: string;
            userRole?: string;
            action: string;
            resource: string;
            confirmOperation?: string;
            confirmId?: UUID;
            confirmationType?: string;
            confirmStatus?: string;
            approvalStep?: string;
            decisionReason?: string;
            approverIds?: string[];
            confirmDetails?: Record<string, unknown>;
            oldValue?: Record<string, unknown>;
            newValue?: Record<string, unknown>;
            ipAddress?: string;
            userAgent?: string;
            sessionId?: string;
            correlationId?: UUID;
        }>;
        complianceSettings?: {
            gdprEnabled?: boolean;
            hipaaEnabled?: boolean;
            soxEnabled?: boolean;
            confirmAuditLevel?: 'basic' | 'detailed' | 'comprehensive';
            confirmDataLogging?: boolean;
            customCompliance?: string[];
        };
    };
    monitoringIntegration: {
        enabled: boolean;
        supportedProviders: Array<'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom'>;
        integrationEndpoints?: {
            metricsApi?: string;
            approvalMetricsApi?: string;
            workflowMetricsApi?: string;
            complianceMetricsApi?: string;
        };
        approvalMetrics?: {
            trackApprovalTimes?: boolean;
            trackWorkflowPerformance?: boolean;
            trackDecisionPatterns?: boolean;
            trackComplianceMetrics?: boolean;
        };
        exportFormats?: Array<'prometheus' | 'opentelemetry' | 'custom'>;
    };
    performanceMetrics: {
        enabled: boolean;
        collectionIntervalSeconds: number;
        metrics?: {
            confirmProcessingLatencyMs?: number;
            approvalRatePercent?: number;
            confirmWorkflowEfficiencyScore?: number;
            decisionAccuracyPercent?: number;
            confirmComplianceScore?: number;
            activeConfirmationsCount?: number;
            confirmOperationsPerSecond?: number;
            confirmMemoryUsageMb?: number;
            averageApprovalComplexityScore?: number;
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
                maxConfirmProcessingLatencyMs?: number;
                minApprovalRatePercent?: number;
                minConfirmWorkflowEfficiencyScore?: number;
                minDecisionAccuracyPercent?: number;
                minConfirmComplianceScore?: number;
            };
            notificationChannels?: Array<'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty'>;
        };
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
            confirmSnapshot?: Record<string, unknown>;
            changeType: 'confirm_created' | 'configuration_updated' | 'workflow_modified' | 'approver_changed' | 'status_updated';
        }>;
        autoVersioning?: {
            enabled?: boolean;
            versionOnConfigChange?: boolean;
            versionOnWorkflowChange?: boolean;
            versionOnStatusChange?: boolean;
        };
    };
    searchMetadata: {
        enabled: boolean;
        indexingStrategy: 'full_text' | 'keyword' | 'semantic' | 'hybrid';
        searchableFields?: Array<'confirm_id' | 'confirmation_type' | 'confirm_status' | 'approver_ids' | 'decision_reason' | 'confirm_data' | 'performance_metrics' | 'metadata' | 'audit_logs'>;
        searchIndexes?: Array<{
            indexId: string;
            indexName: string;
            fields: string[];
            indexType: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
            createdAt: Date;
            lastUpdated?: Date;
        }>;
        confirmIndexing?: {
            enabled?: boolean;
            indexConfirmData?: boolean;
            indexPerformanceMetrics?: boolean;
            indexAuditLogs?: boolean;
        };
        autoIndexing?: {
            enabled?: boolean;
            indexNewConfirmations?: boolean;
            reindexIntervalHours?: number;
        };
    };
    aiIntegrationInterface: {
        enabled: boolean;
        supportedProviders: AIProvider[];
        integrationEndpoints?: {
            decisionSupportApi?: string;
            recommendationApi?: string;
            riskAssessmentApi?: string;
        };
        requestFormat?: {
            inputSchema?: string;
            outputSchema?: string;
            authentication?: {
                type: AuthenticationType;
                config?: Record<string, unknown>;
            };
        };
        responseHandling?: {
            timeoutMs?: number;
            retryPolicy?: {
                maxAttempts?: number;
                backoffStrategy?: 'linear' | 'exponential' | 'fixed';
            };
            fallbackBehavior?: FallbackBehavior;
        };
    };
    decisionSupportInterface: {
        enabled: boolean;
        externalDecisionEngines?: Array<{
            engineId: string;
            engineName: string;
            engineType: 'rule_engine' | 'ml_model' | 'expert_system' | 'hybrid';
            endpoint: string;
            priority: number;
            enabled: boolean;
        }>;
        decisionCriteria?: {
            supportedCriteria?: Array<'budget_threshold' | 'risk_level' | 'compliance_requirement' | 'resource_availability' | 'timeline_constraint'>;
            criteriaWeights?: Record<string, number>;
        };
        fallbackStrategy: {
            whenEnginesUnavailable?: 'manual_review' | 'default_workflow' | 'escalate';
            whenEnginesDisagree?: 'manual_review' | 'highest_priority_engine' | 'consensus_required';
        };
    };
    confirmOperation?: ConfirmOperation;
    confirmDetails?: {
        approvalLevel?: number;
        timeoutSeconds?: number;
        escalationPolicy?: 'auto' | 'manual' | 'none';
    };
    eventIntegration: {
        enabled: boolean;
        eventBusConnection?: {
            busType?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
            connectionString?: string;
            topicPrefix?: string;
            consumerGroup?: string;
        };
        publishedEvents?: AuditEventType[];
        subscribedEvents?: string[];
        eventRouting?: {
            routingRules?: Array<{
                ruleId: string;
                condition: string;
                targetTopic: string;
                enabled?: boolean;
            }>;
        };
    };
}
/**
 * ConfirmMapper - 完整的Schema-TypeScript双向映射器
 * 基于mplp-confirm.json实际Schema实现
 */
export declare class ConfirmMapper {
    /**
     * TypeScript实体 → Schema格式 (snake_case)
     * @param entity ConfirmEntityData
     * @returns ConfirmSchema
     */
    static toSchema(entity: ConfirmEntityData): ConfirmSchema;
    /**
     * Schema格式 → TypeScript实体 (camelCase)
     * @param schema ConfirmSchema
     * @returns ConfirmEntityData
     */
    static fromSchema(schema: ConfirmSchema): ConfirmEntityData;
    /**
     * 验证Schema格式数据
     * @param data unknown
     * @returns data is ConfirmSchema
     */
    static validateSchema(data: unknown): data is ConfirmSchema;
    /**
     * 批量转换 TypeScript实体数组 → Schema数组
     * @param entities ConfirmEntityData[]
     * @returns ConfirmSchema[]
     */
    static toSchemaArray(entities: ConfirmEntityData[]): ConfirmSchema[];
    /**
     * 批量转换 Schema数组 → TypeScript实体数组
     * @param schemas ConfirmSchema[]
     * @returns ConfirmEntityData[]
     */
    static fromSchemaArray(schemas: ConfirmSchema[]): ConfirmEntityData[];
}
//# sourceMappingURL=confirm.mapper.d.ts.map