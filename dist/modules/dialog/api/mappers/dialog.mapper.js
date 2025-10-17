"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DialogMapper = void 0;
const dialog_entity_1 = require("../../domain/entities/dialog.entity");
class DialogMapper {
    static toSchema(entity) {
        return {
            protocol_version: entity.protocolVersion,
            timestamp: entity.timestamp,
            dialog_id: entity.dialogId,
            name: entity.name,
            description: entity.description,
            participants: entity.participants,
            capabilities: this.capabilitiesToSchema(entity.capabilities),
            strategy: entity.strategy ? this.strategyToSchema(entity.strategy) : undefined,
            context: entity.context ? this.contextToSchema(entity.context) : undefined,
            configuration: entity.configuration ? {
                timeout: entity.configuration.timeout,
                max_participants: entity.configuration.maxParticipants,
                retry_policy: entity.configuration.retryPolicy ? {
                    max_retries: entity.configuration.retryPolicy.maxRetries,
                    backoff_ms: entity.configuration.retryPolicy.backoffMs
                } : undefined,
                security: entity.configuration.security ? {
                    encryption: entity.configuration.security.encryption,
                    authentication: entity.configuration.security.authentication,
                    audit_logging: entity.configuration.security.auditLogging
                } : undefined
            } : undefined,
            metadata: entity.metadata,
            audit_trail: {
                enabled: entity.auditTrail.enabled,
                retention_days: entity.auditTrail.retentionDays,
                audit_events: entity.auditTrail.auditEvents?.map((event) => ({
                    event_id: event.eventId,
                    event_type: event.eventType,
                    timestamp: event.timestamp,
                    user_id: event.userId,
                    user_role: event.userRole,
                    action: event.action,
                    resource: event.resource,
                    dialog_operation: event.dialogOperation,
                    dialog_id: event.dialogId,
                    dialog_name: event.dialogName,
                    dialog_type: event.dialogType,
                    participant_ids: event.participantIds,
                    dialog_status: event.dialogStatus,
                    content_hash: event.contentHash,
                    dialog_details: event.dialogDetails,
                    ip_address: event.ipAddress,
                    user_agent: event.userAgent,
                    session_id: event.sessionId,
                    correlation_id: event.correlationId
                })),
                compliance_settings: entity.auditTrail.complianceSettings ? {
                    gdpr_enabled: entity.auditTrail.complianceSettings.gdprEnabled,
                    hipaa_enabled: entity.auditTrail.complianceSettings.hipaaEnabled,
                    sox_enabled: entity.auditTrail.complianceSettings.soxEnabled,
                    dialog_audit_level: entity.auditTrail.complianceSettings.dialogAuditLevel,
                    dialog_data_logging: entity.auditTrail.complianceSettings.dialogDataLogging,
                    content_retention_policy: entity.auditTrail.complianceSettings.contentRetentionPolicy,
                    privacy_protection: entity.auditTrail.complianceSettings.privacyProtection,
                    custom_compliance: entity.auditTrail.complianceSettings.customCompliance
                } : undefined
            },
            monitoring_integration: {
                enabled: entity.monitoringIntegration.enabled,
                supported_providers: entity.monitoringIntegration.supportedProviders,
                integration_endpoints: entity.monitoringIntegration.integrationEndpoints ? {
                    metrics_api: entity.monitoringIntegration.integrationEndpoints.metricsApi,
                    dialog_quality_api: entity.monitoringIntegration.integrationEndpoints.dialogQualityApi,
                    response_time_api: entity.monitoringIntegration.integrationEndpoints.responseTimeApi,
                    satisfaction_api: entity.monitoringIntegration.integrationEndpoints.satisfactionApi
                } : undefined,
                dialog_metrics: entity.monitoringIntegration.dialogMetrics ? {
                    track_response_times: entity.monitoringIntegration.dialogMetrics.trackResponseTimes,
                    track_dialog_quality: entity.monitoringIntegration.dialogMetrics.trackDialogQuality,
                    track_user_satisfaction: entity.monitoringIntegration.dialogMetrics.trackUserSatisfaction,
                    track_content_moderation: entity.monitoringIntegration.dialogMetrics.trackContentModeration
                } : undefined,
                export_formats: entity.monitoringIntegration.exportFormats
            },
            performance_metrics: {
                enabled: entity.performanceMetrics.enabled,
                collection_interval_seconds: entity.performanceMetrics.collectionIntervalSeconds,
                metrics: entity.performanceMetrics.metrics ? {
                    dialog_response_latency_ms: entity.performanceMetrics.metrics.dialogResponseLatencyMs,
                    dialog_completion_rate_percent: entity.performanceMetrics.metrics.dialogCompletionRatePercent,
                    dialog_quality_score: entity.performanceMetrics.metrics.dialogQualityScore,
                    user_experience_satisfaction_percent: entity.performanceMetrics.metrics.userExperienceSatisfactionPercent,
                    dialog_interaction_efficiency_score: entity.performanceMetrics.metrics.dialogInteractionEfficiencyScore,
                    active_dialogs_count: entity.performanceMetrics.metrics.activeDialogsCount,
                    dialog_operations_per_second: entity.performanceMetrics.metrics.dialogOperationsPerSecond,
                    dialog_memory_usage_mb: entity.performanceMetrics.metrics.dialogMemoryUsageMb,
                    average_dialog_complexity_score: entity.performanceMetrics.metrics.averageDialogComplexityScore
                } : undefined,
                health_status: entity.performanceMetrics.healthStatus ? {
                    status: entity.performanceMetrics.healthStatus.status,
                    last_check: entity.performanceMetrics.healthStatus.lastCheck,
                    checks: entity.performanceMetrics.healthStatus.checks?.map((check) => ({
                        check_name: check.checkName,
                        status: check.status,
                        message: check.message,
                        duration_ms: check.durationMs
                    }))
                } : undefined,
                alerting: entity.performanceMetrics.alerting ? {
                    enabled: entity.performanceMetrics.alerting.enabled,
                    thresholds: entity.performanceMetrics.alerting.thresholds ? {
                        max_dialog_response_latency_ms: entity.performanceMetrics.alerting.thresholds.maxDialogResponseLatencyMs,
                        min_dialog_completion_rate_percent: entity.performanceMetrics.alerting.thresholds.minDialogCompletionRatePercent,
                        min_dialog_quality_score: entity.performanceMetrics.alerting.thresholds.minDialogQualityScore,
                        min_user_experience_satisfaction_percent: entity.performanceMetrics.alerting.thresholds.minUserExperienceSatisfactionPercent,
                        min_dialog_interaction_efficiency_score: entity.performanceMetrics.alerting.thresholds.minDialogInteractionEfficiencyScore
                    } : undefined,
                    notification_channels: entity.performanceMetrics.alerting.notificationChannels
                } : undefined
            },
            version_history: {
                enabled: entity.versionHistory.enabled,
                max_versions: entity.versionHistory.maxVersions,
                versions: entity.versionHistory.versions?.map((version) => ({
                    version_id: version.versionId,
                    version_number: version.versionNumber,
                    created_at: version.createdAt,
                    created_by: version.createdBy,
                    change_summary: version.changeSummary,
                    dialog_snapshot: version.dialogSnapshot,
                    change_type: version.changeType
                })),
                auto_versioning: entity.versionHistory.autoVersioning ? {
                    enabled: entity.versionHistory.autoVersioning.enabled,
                    version_on_config_change: entity.versionHistory.autoVersioning.versionOnConfigChange,
                    version_on_participant_change: entity.versionHistory.autoVersioning.versionOnParticipantChange
                } : undefined
            },
            search_metadata: {
                enabled: entity.searchMetadata.enabled,
                indexing_strategy: entity.searchMetadata.indexingStrategy,
                searchable_fields: entity.searchMetadata.searchableFields,
                search_indexes: entity.searchMetadata.searchIndexes?.map((index) => ({
                    index_id: index.indexId,
                    index_name: index.indexName,
                    fields: index.fields,
                    index_type: index.indexType,
                    created_at: index.createdAt,
                    last_updated: index.lastUpdated
                })),
                content_indexing: entity.searchMetadata.contentIndexing ? {
                    enabled: entity.searchMetadata.contentIndexing.enabled,
                    index_message_content: entity.searchMetadata.contentIndexing.indexMessageContent,
                    privacy_filtering: entity.searchMetadata.contentIndexing.privacyFiltering,
                    sensitive_data_masking: entity.searchMetadata.contentIndexing.sensitiveDataMasking
                } : undefined,
                auto_indexing: entity.searchMetadata.autoIndexing ? {
                    enabled: entity.searchMetadata.autoIndexing.enabled,
                    index_new_dialogs: entity.searchMetadata.autoIndexing.indexNewDialogs,
                    reindex_interval_hours: entity.searchMetadata.autoIndexing.reindexIntervalHours
                } : undefined
            },
            dialog_operation: entity.dialogOperation,
            dialog_details: entity.dialogDetails ? {
                dialog_type: entity.dialogDetails.dialogType,
                turn_management: entity.dialogDetails.turnManagement,
                context_retention: entity.dialogDetails.contextRetention
            } : undefined,
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
                    routing_rules: entity.eventIntegration.eventRouting.routingRules?.map((rule) => ({
                        rule_id: rule.ruleId,
                        condition: rule.condition,
                        target_topic: rule.targetTopic,
                        enabled: rule.enabled
                    }))
                } : undefined
            }
        };
    }
    static fromSchema(schema) {
        return new dialog_entity_1.DialogEntity(schema.dialog_id, schema.name, schema.participants, this.capabilitiesFromSchema(schema.capabilities), this.auditTrailFromSchema(schema.audit_trail), this.monitoringFromSchema(schema.monitoring_integration), this.performanceFromSchema(schema.performance_metrics), this.versionHistoryFromSchema(schema.version_history), this.searchMetadataFromSchema(schema.search_metadata), schema.dialog_operation, this.eventIntegrationFromSchema(schema.event_integration), schema.protocol_version, schema.timestamp, schema.description, schema.strategy ? this.strategyFromSchema(schema.strategy) : undefined, schema.context ? this.contextFromSchema(schema.context) : undefined, this.configurationFromSchema(schema.configuration), schema.metadata, schema.dialog_details ? this.dialogDetailsFromSchema(schema.dialog_details) : undefined);
    }
    static auditTrailFromSchema(auditTrail) {
        return {
            enabled: auditTrail.enabled,
            retentionDays: auditTrail.retention_days,
            auditEvents: auditTrail.audit_events?.map((event) => ({
                eventId: event.event_id,
                eventType: event.event_type,
                timestamp: event.timestamp,
                userId: event.user_id,
                userRole: event.user_role,
                action: event.action,
                resource: event.resource,
                dialogOperation: event.dialog_operation,
                dialogId: event.dialog_id,
                dialogName: event.dialog_name,
                dialogType: event.dialog_type,
                participantIds: event.participant_ids,
                dialogStatus: event.dialog_status,
                contentHash: event.content_hash,
                dialogDetails: event.dialog_details,
                ipAddress: event.ip_address,
                userAgent: event.user_agent,
                sessionId: event.session_id,
                correlationId: event.correlation_id
            })),
            complianceSettings: auditTrail.compliance_settings ? {
                gdprEnabled: auditTrail.compliance_settings.gdpr_enabled,
                hipaaEnabled: auditTrail.compliance_settings.hipaa_enabled,
                soxEnabled: auditTrail.compliance_settings.sox_enabled,
                dialogAuditLevel: auditTrail.compliance_settings.dialog_audit_level,
                dialogDataLogging: auditTrail.compliance_settings.dialog_data_logging,
                contentRetentionPolicy: auditTrail.compliance_settings.content_retention_policy,
                privacyProtection: auditTrail.compliance_settings.privacy_protection,
                customCompliance: auditTrail.compliance_settings.custom_compliance
            } : undefined
        };
    }
    static monitoringFromSchema(monitoring) {
        return {
            enabled: monitoring.enabled,
            supportedProviders: monitoring.supported_providers,
            integrationEndpoints: monitoring.integration_endpoints ? {
                metricsApi: monitoring.integration_endpoints.metrics_api,
                dialogQualityApi: monitoring.integration_endpoints.dialog_quality_api,
                responseTimeApi: monitoring.integration_endpoints.response_time_api,
                satisfactionApi: monitoring.integration_endpoints.satisfaction_api
            } : undefined,
            exportFormats: monitoring.export_formats
        };
    }
    static performanceFromSchema(performance) {
        return {
            enabled: performance.enabled,
            collectionIntervalSeconds: performance.collection_interval_seconds,
            metrics: performance.metrics ? {
                dialogResponseLatencyMs: performance.metrics.dialog_response_latency_ms,
                dialogCompletionRatePercent: performance.metrics.dialog_completion_rate_percent,
                dialogQualityScore: performance.metrics.dialog_quality_score,
                userExperienceSatisfactionPercent: performance.metrics.user_experience_satisfaction_percent,
                dialogInteractionEfficiencyScore: performance.metrics.dialog_interaction_efficiency_score,
                activeDialogsCount: performance.metrics.active_dialogs_count,
                dialogOperationsPerSecond: performance.metrics.dialog_operations_per_second,
                dialogMemoryUsageMb: performance.metrics.dialog_memory_usage_mb,
                averageDialogComplexityScore: performance.metrics.average_dialog_complexity_score
            } : undefined,
            healthStatus: performance.health_status ? {
                status: performance.health_status.status,
                lastCheck: performance.health_status.last_check,
                checks: performance.health_status.checks?.map(check => ({
                    checkName: check.check_name,
                    status: check.status,
                    message: check.message,
                    durationMs: check.duration_ms
                }))
            } : undefined,
            alerting: performance.alerting ? {
                enabled: performance.alerting.enabled,
                thresholds: performance.alerting.thresholds ? {
                    maxDialogResponseLatencyMs: performance.alerting.thresholds.max_dialog_response_latency_ms,
                    minDialogCompletionRatePercent: performance.alerting.thresholds.min_dialog_completion_rate_percent,
                    minDialogQualityScore: performance.alerting.thresholds.min_dialog_quality_score,
                    minUserExperienceSatisfactionPercent: performance.alerting.thresholds.min_user_experience_satisfaction_percent,
                    minDialogInteractionEfficiencyScore: performance.alerting.thresholds.min_dialog_interaction_efficiency_score
                } : undefined,
                notificationChannels: performance.alerting.notification_channels
            } : undefined
        };
    }
    static versionHistoryFromSchema(versionHistory) {
        return {
            enabled: versionHistory.enabled,
            maxVersions: versionHistory.max_versions,
            versions: versionHistory.versions?.map((version) => ({
                versionId: version.version_id,
                versionNumber: version.version_number,
                createdAt: version.created_at,
                createdBy: version.created_by,
                changeSummary: version.change_summary,
                dialogSnapshot: version.dialog_snapshot,
                changeType: version.change_type
            })),
            autoVersioning: versionHistory.auto_versioning ? {
                enabled: versionHistory.auto_versioning.enabled,
                versionOnConfigChange: versionHistory.auto_versioning.version_on_config_change,
                versionOnParticipantChange: versionHistory.auto_versioning.version_on_participant_change
            } : undefined
        };
    }
    static searchMetadataFromSchema(searchMetadata) {
        return {
            enabled: searchMetadata.enabled,
            indexingStrategy: searchMetadata.indexing_strategy,
            searchableFields: searchMetadata.searchable_fields,
            searchIndexes: searchMetadata.search_indexes?.map((index) => ({
                indexId: index.index_id,
                indexName: index.index_name,
                fields: index.fields,
                indexType: index.index_type,
                createdAt: index.created_at,
                lastUpdated: index.last_updated
            })),
            contentIndexing: searchMetadata.content_indexing ? {
                enabled: searchMetadata.content_indexing.enabled,
                indexMessageContent: searchMetadata.content_indexing.index_message_content,
                privacyFiltering: searchMetadata.content_indexing.privacy_filtering,
                sensitiveDataMasking: searchMetadata.content_indexing.sensitive_data_masking
            } : undefined,
            autoIndexing: searchMetadata.auto_indexing ? {
                enabled: searchMetadata.auto_indexing.enabled,
                indexNewDialogs: searchMetadata.auto_indexing.index_new_dialogs,
                reindexIntervalHours: searchMetadata.auto_indexing.reindex_interval_hours
            } : undefined
        };
    }
    static eventIntegrationFromSchema(eventIntegration) {
        return {
            enabled: eventIntegration.enabled,
            eventBusConnection: eventIntegration.event_bus_connection ? {
                busType: eventIntegration.event_bus_connection.bus_type,
                connectionString: eventIntegration.event_bus_connection.connection_string,
                topicPrefix: eventIntegration.event_bus_connection.topic_prefix,
                consumerGroup: eventIntegration.event_bus_connection.consumer_group
            } : undefined,
            publishedEvents: eventIntegration.published_events,
            subscribedEvents: eventIntegration.subscribed_events,
            eventRouting: eventIntegration.event_routing ? {
                routingRules: eventIntegration.event_routing.routing_rules?.map((rule) => ({
                    ruleId: rule.rule_id,
                    condition: rule.condition,
                    targetTopic: rule.target_topic,
                    enabled: rule.enabled
                }))
            } : undefined
        };
    }
    static configurationFromSchema(configuration) {
        if (!configuration)
            return undefined;
        return {
            timeout: configuration.timeout,
            maxParticipants: configuration.max_participants,
            retryPolicy: configuration.retry_policy ? {
                maxRetries: configuration.retry_policy.max_retries,
                backoffMs: configuration.retry_policy.backoff_ms
            } : undefined,
            security: configuration.security ? {
                encryption: configuration.security.encryption,
                authentication: configuration.security.authentication,
                auditLogging: configuration.security.audit_logging
            } : undefined
        };
    }
    static dialogDetailsFromSchema(dialogDetails) {
        return {
            dialogType: dialogDetails.dialog_type,
            turnManagement: dialogDetails.turn_management,
            contextRetention: dialogDetails.context_retention
        };
    }
    static validateSchema(schema) {
        const errors = [];
        if (!schema.protocol_version)
            errors.push('protocol_version is required');
        if (!schema.timestamp)
            errors.push('timestamp is required');
        if (!schema.dialog_id)
            errors.push('dialog_id is required');
        if (!schema.name)
            errors.push('name is required');
        if (schema.name && schema.name.length > 255)
            errors.push('name must be 255 characters or less');
        if (!schema.participants || schema.participants.length === 0)
            errors.push('at least one participant is required');
        if (!schema.capabilities)
            errors.push('capabilities is required');
        if (!schema.audit_trail)
            errors.push('audit_trail is required');
        if (!schema.monitoring_integration)
            errors.push('monitoring_integration is required');
        if (!schema.performance_metrics)
            errors.push('performance_metrics is required');
        if (!schema.version_history)
            errors.push('version_history is required');
        if (!schema.search_metadata)
            errors.push('search_metadata is required');
        if (!schema.dialog_operation)
            errors.push('dialog_operation is required');
        if (!schema.event_integration)
            errors.push('event_integration is required');
        if (schema.capabilities && !schema.capabilities.basic) {
            errors.push('capabilities.basic is required');
        }
        if (schema.capabilities && schema.capabilities.basic && !schema.capabilities.basic.enabled) {
            errors.push('basic capabilities must be enabled');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    static capabilitiesToSchema(capabilities) {
        return {
            basic: {
                enabled: capabilities.basic.enabled,
                message_history: capabilities.basic.messageHistory,
                participant_management: capabilities.basic.participantManagement
            },
            intelligent_control: capabilities.intelligentControl ? {
                enabled: capabilities.intelligentControl.enabled,
                adaptive_rounds: capabilities.intelligentControl.adaptiveRounds,
                dynamic_strategy: capabilities.intelligentControl.dynamicStrategy,
                completeness_evaluation: capabilities.intelligentControl.completenessEvaluation
            } : undefined,
            critical_thinking: capabilities.criticalThinking ? {
                enabled: capabilities.criticalThinking.enabled,
                analysis_depth: capabilities.criticalThinking.analysisDepth,
                question_generation: capabilities.criticalThinking.questionGeneration,
                logic_validation: capabilities.criticalThinking.logicValidation
            } : undefined,
            knowledge_search: capabilities.knowledgeSearch ? {
                enabled: capabilities.knowledgeSearch.enabled,
                real_time_search: capabilities.knowledgeSearch.realTimeSearch,
                knowledge_validation: capabilities.knowledgeSearch.knowledgeValidation,
                source_verification: capabilities.knowledgeSearch.sourceVerification
            } : undefined,
            multimodal: capabilities.multimodal ? {
                enabled: capabilities.multimodal.enabled,
                supported_modalities: capabilities.multimodal.supportedModalities,
                cross_modal_translation: capabilities.multimodal.crossModalTranslation
            } : undefined
        };
    }
    static capabilitiesFromSchema(schema) {
        return {
            basic: {
                enabled: schema.basic.enabled,
                messageHistory: schema.basic.message_history,
                participantManagement: schema.basic.participant_management
            },
            intelligentControl: schema.intelligent_control ? {
                enabled: schema.intelligent_control.enabled,
                adaptiveRounds: schema.intelligent_control.adaptive_rounds,
                dynamicStrategy: schema.intelligent_control.dynamic_strategy,
                completenessEvaluation: schema.intelligent_control.completeness_evaluation
            } : undefined,
            criticalThinking: schema.critical_thinking ? {
                enabled: schema.critical_thinking.enabled,
                analysisDepth: schema.critical_thinking.analysis_depth,
                questionGeneration: schema.critical_thinking.question_generation,
                logicValidation: schema.critical_thinking.logic_validation
            } : undefined,
            knowledgeSearch: schema.knowledge_search ? {
                enabled: schema.knowledge_search.enabled,
                realTimeSearch: schema.knowledge_search.real_time_search,
                knowledgeValidation: schema.knowledge_search.knowledge_validation,
                sourceVerification: schema.knowledge_search.source_verification
            } : undefined,
            multimodal: schema.multimodal ? {
                enabled: schema.multimodal.enabled,
                supportedModalities: schema.multimodal.supported_modalities,
                crossModalTranslation: schema.multimodal.cross_modal_translation
            } : undefined
        };
    }
    static strategyToSchema(strategy) {
        return {
            type: strategy.type,
            rounds: strategy.rounds ? {
                min: strategy.rounds.min,
                max: strategy.rounds.max,
                target: strategy.rounds.target
            } : undefined,
            exit_criteria: strategy.exitCriteria ? {
                completeness_threshold: strategy.exitCriteria.completenessThreshold,
                user_satisfaction_threshold: strategy.exitCriteria.userSatisfactionThreshold,
                time_limit: strategy.exitCriteria.timeLimit
            } : undefined
        };
    }
    static strategyFromSchema(schema) {
        return {
            type: schema.type,
            rounds: schema.rounds ? {
                min: schema.rounds.min,
                max: schema.rounds.max,
                target: schema.rounds.target
            } : undefined,
            exitCriteria: schema.exit_criteria ? {
                completenessThreshold: schema.exit_criteria.completeness_threshold,
                userSatisfactionThreshold: schema.exit_criteria.user_satisfaction_threshold,
                timeLimit: schema.exit_criteria.time_limit
            } : undefined
        };
    }
    static contextToSchema(context) {
        return {
            session_id: context.sessionId,
            context_id: context.contextId,
            knowledge_base: context.knowledgeBase,
            previous_dialogs: context.previousDialogs
        };
    }
    static contextFromSchema(schema) {
        return {
            sessionId: schema.session_id,
            contextId: schema.context_id,
            knowledgeBase: schema.knowledge_base,
            previousDialogs: schema.previous_dialogs
        };
    }
    static fromSchemaArray(schemas) {
        return schemas.map(schema => this.fromSchema(schema));
    }
    static toSchemaArray(entities) {
        return entities.map(entity => this.toSchema(entity));
    }
}
exports.DialogMapper = DialogMapper;
