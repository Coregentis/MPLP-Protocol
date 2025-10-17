export interface PlanTaskSchema {
    task_id: string;
    name: string;
    description?: string;
    type: 'atomic' | 'composite' | 'milestone' | 'checkpoint';
    status: 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped';
    priority?: 'critical' | 'high' | 'medium' | 'low';
    assignee?: {
        user_id?: string;
        role?: string;
        team?: string;
    };
    estimated_effort?: {
        value: number;
        unit: 'hours' | 'days' | 'story_points';
    };
    actual_effort?: {
        value: number;
        unit: 'hours' | 'days' | 'story_points';
    };
    resources_required?: Array<{
        resource_type: string;
        amount: number;
        unit: string;
        availability: 'required' | 'preferred' | 'optional';
    }>;
    acceptance_criteria?: Array<{
        id: string;
        description: string;
        type: 'functional' | 'non_functional' | 'quality';
        status: 'pending' | 'met' | 'not_met';
        verification_method?: 'manual' | 'automated' | 'review';
    }>;
    sub_tasks?: Array<PlanTaskSchema>;
    metadata?: {
        tags?: string[];
        category?: string;
        source?: string;
        complexity_score?: number;
        risk_level?: string;
        automation_level?: string;
        retry_count?: number;
        max_retry_count?: number;
        intervention_required?: boolean;
        intervention_reason?: string;
        intervention_requested_at?: string;
        rollback_reason?: string;
        rollback_target?: string;
        skip_reason?: string;
        skip_dependents?: boolean;
    };
}
export interface PlanResourceConstraintsSchema {
    [resourceType: string]: {
        amount: number;
        unit: string;
        availability: 'required' | 'preferred' | 'optional';
    };
}
export interface PlanOptimizationParametersSchema {
    [parameterName: string]: string | number | boolean;
}
export interface PlanMetadataSchema {
    [key: string]: string | number | boolean | null | undefined;
}
export interface PlanAuditEventDetailsSchema {
    [key: string]: string | number | boolean | string[] | null | undefined;
}
export interface PlanSchema {
    protocol_version: string;
    timestamp: string;
    plan_id: string;
    context_id: string;
    name: string;
    description?: string;
    status: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
    priority?: 'critical' | 'high' | 'medium' | 'low';
    timeline?: {
        start_date?: string;
        end_date?: string;
        estimated_duration: {
            value: number;
            unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
        };
        actual_duration?: {
            value: number;
            unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
        };
    };
    tasks: Array<{
        task_id: string;
        name: string;
        description?: string;
        type: 'atomic' | 'composite' | 'milestone' | 'checkpoint';
        status: 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped';
        priority?: 'critical' | 'high' | 'medium' | 'low';
        assignee?: {
            user_id?: string;
            role?: string;
            team?: string;
        };
        estimated_effort?: {
            value: number;
            unit: 'hours' | 'days' | 'story_points';
        };
        actual_effort?: {
            value: number;
            unit: 'hours' | 'days' | 'story_points';
        };
        resources_required?: Array<{
            resource_type: string;
            amount: number;
            unit: string;
            availability: 'required' | 'preferred' | 'optional';
        }>;
        acceptance_criteria?: Array<{
            id: string;
            description: string;
            type: 'functional' | 'non_functional' | 'quality';
            status: 'pending' | 'met' | 'not_met';
            verification_method?: 'manual' | 'automated' | 'review';
        }>;
        sub_tasks?: Array<PlanTaskSchema>;
        metadata?: {
            tags?: string[];
            category?: string;
            source?: string;
            complexity_score?: number;
            risk_level?: string;
            automation_level?: string;
            retry_count?: number;
            max_retry_count?: number;
            intervention_required?: boolean;
            intervention_reason?: string;
            intervention_requested_at?: string;
            rollback_reason?: string;
            rollback_target?: string;
            skip_reason?: string;
            skip_dependents?: boolean;
        };
    }>;
    dependencies?: Array<{
        id: string;
        source_task_id: string;
        target_task_id: string;
        dependency_type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
        lag?: {
            value: number;
            unit: 'minutes' | 'hours' | 'days';
        };
        criticality: 'blocking' | 'important' | 'nice_to_have';
        condition?: string;
    }>;
    milestones?: Array<{
        id: string;
        name: string;
        description?: string;
        target_date: string;
        status: 'upcoming' | 'at_risk' | 'achieved' | 'missed';
        success_criteria?: Array<{
            metric: string;
            target_value: string | number | boolean;
            actual_value?: string | number | boolean;
            status: 'pending' | 'achieved' | 'not_achieved';
        }>;
    }>;
    optimization?: {
        strategy: 'time_optimal' | 'resource_optimal' | 'cost_optimal' | 'quality_optimal' | 'balanced';
        constraints?: {
            max_duration?: {
                value: number;
                unit: 'hours' | 'days' | 'weeks';
            };
            max_cost?: number;
            min_quality?: number;
            available_resources?: PlanResourceConstraintsSchema;
        };
        parameters?: PlanOptimizationParametersSchema;
    };
    risk_assessment?: {
        overall_risk_level?: 'low' | 'medium' | 'high' | 'critical';
        risks?: Array<{
            id: string;
            name: string;
            description?: string;
            level: 'low' | 'medium' | 'high' | 'critical';
            category: 'technical' | 'resource' | 'schedule' | 'scope' | 'external';
            probability?: number;
            impact?: number;
            status: 'identified' | 'mitigated' | 'accepted' | 'closed';
            mitigation_plan?: string;
        }>;
    };
    failure_resolver?: {
        enabled: boolean;
        strategies: Array<'retry' | 'rollback' | 'skip' | 'manual_intervention'>;
        retry_config?: {
            max_attempts: number;
            delay_ms: number;
            backoff_factor?: number;
            max_delay_ms?: number;
        };
        rollback_config?: {
            enabled: boolean;
            checkpoint_frequency?: number;
            max_rollback_depth?: number;
        };
        manual_intervention_config?: {
            timeout_ms?: number;
            escalation_levels?: string[];
            approval_required?: boolean;
        };
        notification_channels?: string[];
        performance_thresholds?: {
            max_execution_time_ms?: number;
            max_memory_usage_mb?: number;
            max_cpu_usage_percent?: number;
        };
    };
    configuration?: {
        auto_scheduling_enabled?: boolean;
        dependency_validation_enabled?: boolean;
        risk_monitoring_enabled?: boolean;
        failure_recovery_enabled?: boolean;
        performance_tracking_enabled?: boolean;
        notification_settings?: {
            enabled: boolean;
            channels?: string[];
            events?: string[];
            task_completion?: boolean;
        };
        optimization_settings?: {
            enabled: boolean;
            strategy: 'time_optimal' | 'resource_optimal' | 'cost_optimal' | 'quality_optimal' | 'balanced';
            auto_reoptimize?: boolean;
        };
        timeout_settings?: {
            default_task_timeout_ms?: number;
            plan_execution_timeout_ms?: number;
            dependency_resolution_timeout_ms?: number;
        };
        parallel_execution_limit?: number;
    };
    metadata?: PlanMetadataSchema;
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    updated_by?: string;
    audit_trail: {
        enabled: boolean;
        retention_days: number;
        audit_events?: Array<{
            event_id: string;
            event_type: 'plan_created' | 'plan_updated' | 'plan_deleted' | 'plan_executed' | 'plan_paused' | 'plan_resumed' | 'plan_completed' | 'plan_failed' | 'task_added' | 'task_removed' | 'dependency_changed';
            timestamp: string;
            user_id: string;
            user_role?: string;
            action: string;
            resource: string;
            plan_operation?: string;
            plan_id?: string;
            plan_name?: string;
            plan_status?: string;
            task_ids?: string[];
            execution_stage?: string;
            plan_details?: PlanAuditEventDetailsSchema;
            old_value?: PlanAuditEventDetailsSchema;
            new_value?: PlanAuditEventDetailsSchema;
            ip_address?: string;
            user_agent?: string;
            session_id?: string;
            correlation_id?: string;
        }>;
        compliance_settings?: {
            gdpr_enabled?: boolean;
            hipaa_enabled?: boolean;
            sox_enabled?: boolean;
            plan_audit_level?: 'basic' | 'detailed' | 'comprehensive';
            plan_data_logging?: boolean;
            custom_compliance?: string[];
        };
    };
    monitoring_integration: {
        enabled: boolean;
        supported_providers: Array<'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom'>;
        integration_endpoints?: {
            metrics_api?: string;
            plan_execution_api?: string;
            task_metrics_api?: string;
            resource_metrics_api?: string;
        };
        plan_metrics?: {
            track_execution_progress?: boolean;
            track_task_performance?: boolean;
            track_resource_usage?: boolean;
            track_failure_recovery?: boolean;
        };
        export_formats?: Array<'prometheus' | 'opentelemetry' | 'custom'>;
    };
    performance_metrics: {
        enabled: boolean;
        collection_interval_seconds: number;
        metrics?: {
            plan_execution_latency_ms?: number;
            task_completion_rate_percent?: number;
            plan_optimization_score?: number;
            dependency_resolution_accuracy_percent?: number;
            plan_execution_efficiency_score?: number;
            active_plans_count?: number;
            plan_operations_per_second?: number;
            plan_memory_usage_mb?: number;
            average_plan_complexity_score?: number;
        };
        health_status?: {
            status: 'healthy' | 'degraded' | 'unhealthy' | 'blocked';
            last_check: string;
            checks?: Array<{
                check_name: string;
                status: 'pass' | 'fail' | 'warn';
                message?: string;
                duration_ms?: number;
            }>;
        };
        alerting?: {
            enabled?: boolean;
            thresholds?: {
                max_plan_execution_latency_ms?: number;
                min_task_completion_rate_percent?: number;
                min_plan_optimization_score?: number;
                min_dependency_resolution_accuracy_percent?: number;
                min_plan_execution_efficiency_score?: number;
            };
            notification_channels?: Array<'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty'>;
        };
    };
    version_history: {
        enabled: boolean;
        max_versions: number;
        versions?: Array<{
            version_id: string;
            version_number: number;
            created_at: string;
            created_by: string;
            change_summary?: string;
            plan_snapshot?: PlanMetadataSchema;
            change_type: 'plan_created' | 'configuration_updated' | 'tasks_modified' | 'dependencies_changed' | 'execution_optimized';
        }>;
        auto_versioning?: {
            enabled?: boolean;
            version_on_config_change?: boolean;
            version_on_task_change?: boolean;
            version_on_dependency_change?: boolean;
        };
    };
    search_metadata: {
        enabled: boolean;
        indexing_strategy: 'full_text' | 'keyword' | 'semantic' | 'hybrid';
        searchable_fields?: Array<'plan_id' | 'plan_name' | 'plan_status' | 'task_ids' | 'execution_stage' | 'plan_data' | 'performance_metrics' | 'metadata' | 'audit_logs'>;
        search_indexes?: Array<{
            index_id: string;
            index_name: string;
            fields: string[];
            index_type: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
            created_at: string;
            last_updated: string;
        }>;
        plan_indexing?: {
            enabled?: boolean;
            index_plan_data?: boolean;
            index_performance_metrics?: boolean;
            index_audit_logs?: boolean;
        };
        auto_indexing?: {
            enabled?: boolean;
            index_new_plans?: boolean;
            reindex_interval_hours?: number;
        };
    };
    caching_policy: {
        enabled: boolean;
        cache_strategy: 'lru' | 'lfu' | 'ttl' | 'adaptive';
        cache_levels?: Array<{
            level: string;
            backend: 'memory' | 'redis' | 'memcached' | 'database';
            ttl_seconds: number;
            max_size_mb?: number;
            eviction_policy?: 'lru' | 'lfu' | 'random' | 'ttl';
        }>;
        cache_warming?: {
            enabled?: boolean;
            strategies?: string[];
        };
    };
    event_integration: {
        enabled: boolean;
        event_bus_connection?: {
            bus_type?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
            connection_string?: string;
            topic_prefix?: string;
            consumer_group?: string;
        };
        published_events?: Array<'plan_created' | 'plan_updated' | 'plan_deleted' | 'plan_executed' | 'plan_paused' | 'plan_resumed' | 'plan_completed' | 'plan_failed' | 'plan_task_added' | 'plan_task_removed' | 'plan_dependency_changed'>;
        subscribed_events?: Array<'context_updated' | 'confirm_approved' | 'trace_completed' | 'role_assigned' | 'extension_activated' | 'dialog_started' | 'network_connected' | 'collab_coordinated' | 'orchestration_executed' | 'coordination_synchronized' | 'eventbus_message_published' | 'statesync_sync_completed' | 'transaction_committed' | 'protocolversion_version_checked' | 'errorhandling_error_occurred' | 'security_authentication_attempted' | 'performance_metric_collected'>;
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
export interface PlanTaskData {
    taskId: string;
    name: string;
    description?: string;
    type: 'atomic' | 'composite' | 'milestone' | 'checkpoint';
    status: 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped';
    priority?: 'critical' | 'high' | 'medium' | 'low';
    assignee?: {
        userId?: string;
        role?: string;
        team?: string;
    };
    estimatedEffort?: {
        value: number;
        unit: 'hours' | 'days' | 'story_points';
    };
    actualEffort?: {
        value: number;
        unit: 'hours' | 'days' | 'story_points';
    };
    resourcesRequired?: Array<{
        resourceType: string;
        amount: number;
        unit: string;
        availability: 'required' | 'preferred' | 'optional';
    }>;
    acceptanceCriteria?: Array<{
        id: string;
        description: string;
        type: 'functional' | 'non_functional' | 'quality';
        status: 'pending' | 'met' | 'not_met';
        verificationMethod?: 'manual' | 'automated' | 'review';
    }>;
    subTasks?: Array<PlanTaskData>;
    metadata?: {
        tags?: string[];
        category?: string;
        source?: string;
        complexityScore?: number;
        riskLevel?: string;
        automationLevel?: string;
        retryCount?: number;
        maxRetryCount?: number;
        interventionRequired?: boolean;
        interventionReason?: string;
        interventionRequestedAt?: Date;
        rollbackReason?: string;
        rollbackTarget?: string;
        skipReason?: string;
        skipDependents?: boolean;
    };
}
export interface PlanResourceConstraints {
    [resourceType: string]: {
        amount: number;
        unit: string;
        availability: 'required' | 'preferred' | 'optional';
    };
}
export interface PlanOptimizationParameters {
    [parameterName: string]: string | number | boolean;
}
export interface PlanMetadata {
    [key: string]: string | number | boolean | Date | null | undefined;
}
export interface PlanAuditEventDetails {
    [key: string]: string | number | boolean | Date | string[] | null | undefined;
}
export interface PlanEntityData {
    protocolVersion: string;
    timestamp: Date;
    planId: string;
    contextId: string;
    name: string;
    description?: string;
    status: 'draft' | 'approved' | 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
    priority?: 'critical' | 'high' | 'medium' | 'low';
    confidence?: number;
    resultId?: string;
    planData?: Record<string, unknown>;
    timeline?: {
        startDate?: Date;
        endDate?: Date;
        estimatedDuration: {
            value: number;
            unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
        };
        actualDuration?: {
            value: number;
            unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
        };
    };
    tasks: Array<{
        taskId: string;
        name: string;
        description?: string;
        type: 'atomic' | 'composite' | 'milestone' | 'checkpoint';
        status: 'pending' | 'ready' | 'running' | 'blocked' | 'completed' | 'failed' | 'skipped';
        priority?: 'critical' | 'high' | 'medium' | 'low';
        assignee?: {
            userId?: string;
            role?: string;
            team?: string;
        };
        estimatedEffort?: {
            value: number;
            unit: 'hours' | 'days' | 'story_points';
        };
        actualEffort?: {
            value: number;
            unit: 'hours' | 'days' | 'story_points';
        };
        resourcesRequired?: Array<{
            resourceType: string;
            amount: number;
            unit: string;
            availability: 'required' | 'preferred' | 'optional';
        }>;
        acceptanceCriteria?: Array<{
            id: string;
            description: string;
            type: 'functional' | 'non_functional' | 'quality';
            status: 'pending' | 'met' | 'not_met';
            verificationMethod?: 'manual' | 'automated' | 'review';
        }>;
        subTasks?: Array<PlanTaskData>;
        metadata?: {
            tags?: string[];
            category?: string;
            source?: string;
            complexityScore?: number;
            riskLevel?: string;
            automationLevel?: string;
            retryCount?: number;
            maxRetryCount?: number;
            interventionRequired?: boolean;
            interventionReason?: string;
            interventionRequestedAt?: Date;
            rollbackReason?: string;
            rollbackTarget?: string;
            skipReason?: string;
            skipDependents?: boolean;
        };
    }>;
    dependencies?: Array<{
        id: string;
        sourceTaskId: string;
        targetTaskId: string;
        dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
        lag?: {
            value: number;
            unit: 'minutes' | 'hours' | 'days';
        };
        criticality: 'blocking' | 'important' | 'nice_to_have';
        condition?: string;
    }>;
    milestones?: Array<{
        id: string;
        name: string;
        description?: string;
        targetDate: Date;
        status: 'upcoming' | 'at_risk' | 'achieved' | 'missed';
        successCriteria?: Array<{
            metric: string;
            targetValue: string | number | boolean;
            actualValue?: string | number | boolean;
            status: 'pending' | 'achieved' | 'not_achieved';
        }>;
    }>;
    optimization?: {
        strategy: 'time_optimal' | 'resource_optimal' | 'cost_optimal' | 'quality_optimal' | 'balanced';
        constraints?: {
            maxDuration?: {
                value: number;
                unit: 'hours' | 'days' | 'weeks';
            };
            maxCost?: number;
            minQuality?: number;
            availableResources?: PlanResourceConstraints;
        };
        parameters?: PlanOptimizationParameters;
    };
    riskAssessment?: {
        overallRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
        risks?: Array<{
            id: string;
            name: string;
            description?: string;
            level: 'low' | 'medium' | 'high' | 'critical';
            category: 'technical' | 'resource' | 'schedule' | 'scope' | 'external';
            probability?: number;
            impact?: number;
            status: 'identified' | 'mitigated' | 'accepted' | 'closed';
            mitigationPlan?: string;
        }>;
    };
    failureResolver?: {
        enabled: boolean;
        strategies: Array<'retry' | 'rollback' | 'skip' | 'manual_intervention'>;
        retryConfig?: {
            maxAttempts: number;
            delayMs: number;
            backoffFactor?: number;
            maxDelayMs?: number;
        };
        rollbackConfig?: {
            enabled: boolean;
            checkpointFrequency?: number;
            maxRollbackDepth?: number;
        };
        manualInterventionConfig?: {
            timeoutMs?: number;
            escalationLevels?: string[];
            approvalRequired?: boolean;
        };
        notificationChannels?: string[];
        performanceThresholds?: {
            maxExecutionTimeMs?: number;
            maxMemoryUsageMb?: number;
            maxCpuUsagePercent?: number;
        };
    };
    configuration?: {
        autoSchedulingEnabled?: boolean;
        dependencyValidationEnabled?: boolean;
        riskMonitoringEnabled?: boolean;
        failureRecoveryEnabled?: boolean;
        performanceTrackingEnabled?: boolean;
        notificationSettings?: {
            enabled: boolean;
            channels?: string[];
            events?: string[];
            taskCompletion?: boolean;
        };
        optimizationSettings?: {
            enabled: boolean;
            strategy: 'time_optimal' | 'resource_optimal' | 'cost_optimal' | 'quality_optimal' | 'balanced';
            autoReoptimize?: boolean;
        };
        timeoutSettings?: {
            defaultTaskTimeoutMs?: number;
            planExecutionTimeoutMs?: number;
            dependencyResolutionTimeoutMs?: number;
        };
        parallelExecutionLimit?: number;
    };
    metadata?: PlanMetadata;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
    auditTrail: {
        enabled: boolean;
        retentionDays: number;
        auditEvents?: Array<{
            eventId: string;
            eventType: 'plan_created' | 'plan_updated' | 'plan_deleted' | 'plan_executed' | 'plan_paused' | 'plan_resumed' | 'plan_completed' | 'plan_failed' | 'task_added' | 'task_removed' | 'dependency_changed';
            timestamp: Date;
            userId: string;
            userRole?: string;
            action: string;
            resource: string;
            planOperation?: string;
            planId?: string;
            planName?: string;
            planStatus?: string;
            taskIds?: string[];
            executionStage?: string;
            planDetails?: PlanAuditEventDetails;
            oldValue?: PlanAuditEventDetails;
            newValue?: PlanAuditEventDetails;
            ipAddress?: string;
            userAgent?: string;
            sessionId?: string;
            correlationId?: string;
        }>;
        complianceSettings?: {
            gdprEnabled?: boolean;
            hipaaEnabled?: boolean;
            soxEnabled?: boolean;
            planAuditLevel?: 'basic' | 'detailed' | 'comprehensive';
            planDataLogging?: boolean;
            customCompliance?: string[];
        };
    };
    monitoringIntegration: {
        enabled: boolean;
        supportedProviders: Array<'prometheus' | 'grafana' | 'datadog' | 'new_relic' | 'elastic_apm' | 'custom'>;
        integrationEndpoints?: {
            metricsApi?: string;
            planExecutionApi?: string;
            taskMetricsApi?: string;
            resourceMetricsApi?: string;
        };
        planMetrics?: {
            trackExecutionProgress?: boolean;
            trackTaskPerformance?: boolean;
            trackResourceUsage?: boolean;
            trackFailureRecovery?: boolean;
        };
        exportFormats?: Array<'prometheus' | 'opentelemetry' | 'custom'>;
    };
    performanceMetrics: {
        enabled: boolean;
        collectionIntervalSeconds: number;
        metrics?: {
            planExecutionLatencyMs?: number;
            taskCompletionRatePercent?: number;
            planOptimizationScore?: number;
            dependencyResolutionAccuracyPercent?: number;
            planExecutionEfficiencyScore?: number;
            activePlansCount?: number;
            planOperationsPerSecond?: number;
            planMemoryUsageMb?: number;
            averagePlanComplexityScore?: number;
        };
        healthStatus?: {
            status: 'healthy' | 'degraded' | 'unhealthy' | 'blocked';
            lastCheck: Date;
            checks?: Array<{
                checkName: string;
                status: 'pass' | 'fail' | 'warn';
                message?: string;
                durationMs?: number;
            }>;
        };
        alerting?: {
            enabled?: boolean;
            thresholds?: {
                maxPlanExecutionLatencyMs?: number;
                minTaskCompletionRatePercent?: number;
                minPlanOptimizationScore?: number;
                minDependencyResolutionAccuracyPercent?: number;
                minPlanExecutionEfficiencyScore?: number;
            };
            notificationChannels?: Array<'email' | 'slack' | 'webhook' | 'sms' | 'pagerduty'>;
        };
    };
    versionHistory: {
        enabled: boolean;
        maxVersions: number;
        versions?: Array<{
            versionId: string;
            versionNumber: number;
            createdAt: Date;
            createdBy: string;
            changeSummary?: string;
            planSnapshot?: PlanMetadata;
            changeType: 'plan_created' | 'configuration_updated' | 'tasks_modified' | 'dependencies_changed' | 'execution_optimized';
        }>;
        autoVersioning?: {
            enabled?: boolean;
            versionOnConfigChange?: boolean;
            versionOnTaskChange?: boolean;
            versionOnDependencyChange?: boolean;
        };
    };
    searchMetadata: {
        enabled: boolean;
        indexingStrategy: 'full_text' | 'keyword' | 'semantic' | 'hybrid';
        searchableFields?: Array<'plan_id' | 'plan_name' | 'plan_status' | 'task_ids' | 'execution_stage' | 'plan_data' | 'performance_metrics' | 'metadata' | 'audit_logs'>;
        searchIndexes?: Array<{
            indexId: string;
            indexName: string;
            fields: string[];
            indexType: 'btree' | 'hash' | 'gin' | 'gist' | 'full_text';
            createdAt: Date;
            lastUpdated: Date;
        }>;
        planIndexing?: {
            enabled?: boolean;
            indexPlanData?: boolean;
            indexPerformanceMetrics?: boolean;
            indexAuditLogs?: boolean;
        };
        autoIndexing?: {
            enabled?: boolean;
            indexNewPlans?: boolean;
            reindexIntervalHours?: number;
        };
    };
    cachingPolicy: {
        enabled: boolean;
        cacheStrategy: 'lru' | 'lfu' | 'ttl' | 'adaptive';
        cacheLevels?: Array<{
            level: string;
            backend: 'memory' | 'redis' | 'memcached' | 'database';
            ttlSeconds: number;
            maxSizeMb?: number;
            evictionPolicy?: 'lru' | 'lfu' | 'random' | 'ttl';
        }>;
        cacheWarming?: {
            enabled?: boolean;
            strategies?: string[];
        };
    };
    eventIntegration: {
        enabled: boolean;
        eventBusConnection?: {
            busType?: 'kafka' | 'rabbitmq' | 'redis' | 'nats' | 'custom';
            connectionString?: string;
            topicPrefix?: string;
            consumerGroup?: string;
        };
        publishedEvents?: Array<'plan_created' | 'plan_updated' | 'plan_deleted' | 'plan_executed' | 'plan_paused' | 'plan_resumed' | 'plan_completed' | 'plan_failed' | 'plan_task_added' | 'plan_task_removed' | 'plan_dependency_changed'>;
        subscribedEvents?: Array<'context_updated' | 'confirm_approved' | 'trace_completed' | 'role_assigned' | 'extension_activated' | 'dialog_started' | 'network_connected' | 'collab_coordinated' | 'orchestration_executed' | 'coordination_synchronized' | 'eventbus_message_published' | 'statesync_sync_completed' | 'transaction_committed' | 'protocolversion_version_checked' | 'errorhandling_error_occurred' | 'security_authentication_attempted' | 'performance_metric_collected'>;
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
export declare class PlanMapper {
    static toSchema(entity: PlanEntityData): PlanSchema;
    static fromSchema(schema: PlanSchema): PlanEntityData;
    static validateSchema(data: unknown): data is PlanSchema;
    static toSchemaArray(entities: PlanEntityData[]): PlanSchema[];
    static fromSchemaArray(schemas: PlanSchema[]): PlanEntityData[];
    private static mapTaskToSchema;
    private static mapTaskFromSchema;
    private static mapResourceConstraintsToSchema;
    private static mapResourceConstraintsFromSchema;
    private static mapOptimizationParametersToSchema;
    private static mapOptimizationParametersFromSchema;
    private static mapMetadataToSchema;
    private static mapMetadataFromSchema;
    private static mapAuditEventDetailsToSchema;
    private static mapAuditEventDetailsFromSchema;
    private static objectToSnakeCase;
    private static objectToCamelCase;
    static mapSecurityContextToSchema(securityContext: Record<string, unknown>): Record<string, unknown>;
    static mapSecurityContextFromSchema(securityContext: Record<string, unknown>): Record<string, unknown>;
    static mapPerformanceMetricsToSchema(performanceMetrics: Record<string, unknown>): Record<string, unknown>;
    static mapPerformanceMetricsFromSchema(performanceMetrics: Record<string, unknown>): Record<string, unknown>;
    static mapEventBusToSchema(eventBus: Record<string, unknown>): Record<string, unknown>;
    static mapEventBusFromSchema(eventBus: Record<string, unknown>): Record<string, unknown>;
    static mapErrorHandlingToSchema(errorHandling: Record<string, unknown>): Record<string, unknown>;
    static mapErrorHandlingFromSchema(errorHandling: Record<string, unknown>): Record<string, unknown>;
    static mapCoordinationToSchema(coordination: Record<string, unknown>): Record<string, unknown>;
    static mapCoordinationFromSchema(coordination: Record<string, unknown>): Record<string, unknown>;
    static mapOrchestrationToSchema(orchestration: Record<string, unknown>): Record<string, unknown>;
    static mapOrchestrationFromSchema(orchestration: Record<string, unknown>): Record<string, unknown>;
    static mapStateSyncToSchema(stateSync: Record<string, unknown>): Record<string, unknown>;
    static mapStateSyncFromSchema(stateSync: Record<string, unknown>): Record<string, unknown>;
    static mapTransactionToSchema(transaction: Record<string, unknown>): Record<string, unknown>;
    static mapTransactionFromSchema(transaction: Record<string, unknown>): Record<string, unknown>;
    static mapProtocolVersionToSchema(protocolVersion: Record<string, unknown>): Record<string, unknown>;
    static mapProtocolVersionFromSchema(protocolVersion: Record<string, unknown>): Record<string, unknown>;
}
//# sourceMappingURL=plan.mapper.d.ts.map