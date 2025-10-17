"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollabMapper = void 0;
const utils_1 = require("../../../../shared/utils");
class CollabMapper {
    static toSchema(entity) {
        return {
            collaboration_id: entity.collaborationId,
            protocol_version: entity.protocolVersion,
            timestamp: entity.timestamp.toISOString(),
            context_id: entity.contextId,
            plan_id: entity.planId,
            name: entity.name,
            description: entity.description,
            mode: entity.mode,
            status: entity.status,
            participants: entity.participants.map(p => this.mapParticipantToSchema(p)),
            coordination_strategy: this.mapCoordinationStrategyToSchema(entity.coordinationStrategy),
            created_at: entity.createdAt.toISOString(),
            created_by: entity.createdBy,
            updated_at: entity.updatedAt?.toISOString(),
            updated_by: entity.updatedBy,
            audit_trail: this.mapAuditTrailToSchema(entity.auditTrail),
            monitoring_integration: this.mapMonitoringIntegrationToSchema(entity.monitoringIntegration),
            performance_metrics: this.mapPerformanceMetricsToSchema(entity.performanceMetrics),
            version_history: this.mapVersionHistoryToSchema(entity.versionHistory),
            search_metadata: this.mapSearchMetadataToSchema(entity.searchMetadata),
            collab_operation: this.mapOperationToSchema(entity.collabOperation),
            event_integration: this.mapEventIntegrationToSchema(entity.eventIntegration)
        };
    }
    static fromSchema(schema) {
        return {
            id: schema.collaboration_id,
            collaborationId: schema.collaboration_id,
            protocolVersion: schema.protocol_version,
            timestamp: new Date(schema.timestamp),
            contextId: schema.context_id,
            planId: schema.plan_id,
            name: schema.name,
            description: schema.description,
            mode: schema.mode,
            status: schema.status,
            participants: schema.participants.map(p => this.mapParticipantFromSchema(p)),
            coordinationStrategy: this.mapCoordinationStrategyFromSchema(schema.coordination_strategy),
            createdAt: new Date(schema.created_at),
            createdBy: schema.created_by,
            updatedAt: schema.updated_at ? new Date(schema.updated_at) : undefined,
            updatedBy: schema.updated_by,
            auditTrail: this.mapAuditTrailFromSchema(schema.audit_trail),
            monitoringIntegration: this.mapMonitoringIntegrationFromSchema(schema.monitoring_integration),
            performanceMetrics: this.mapPerformanceMetricsFromSchema(schema.performance_metrics),
            versionHistory: this.mapVersionHistoryFromSchema(schema.version_history),
            searchMetadata: this.mapSearchMetadataFromSchema(schema.search_metadata),
            collabOperation: this.mapOperationFromSchema(schema.collab_operation),
            eventIntegration: this.mapEventIntegrationFromSchema(schema.event_integration)
        };
    }
    static validateSchema(data) {
        if (!data || typeof data !== 'object')
            return false;
        const schema = data;
        const requiredFields = [
            'collaboration_id', 'protocol_version', 'timestamp', 'context_id',
            'plan_id', 'name', 'mode', 'participants', 'coordination_strategy',
            'status', 'created_at', 'created_by', 'audit_trail',
            'monitoring_integration', 'performance_metrics', 'version_history',
            'search_metadata', 'collab_operation', 'event_integration'
        ];
        return requiredFields.every(field => field in schema);
    }
    static mapParticipantToSchema(participant) {
        return {
            participant_id: participant.participantId,
            agent_id: participant.agentId,
            role_id: participant.roleId,
            status: participant.status,
            capabilities: participant.capabilities,
            joined_at: participant.joinedAt.toISOString(),
            last_activity: participant.lastActivity?.toISOString()
        };
    }
    static mapParticipantFromSchema(schema) {
        return {
            participantId: schema.participant_id,
            agentId: schema.agent_id,
            roleId: schema.role_id,
            status: schema.status,
            capabilities: schema.capabilities,
            joinedAt: new Date(schema.joined_at),
            lastActivity: schema.last_activity ? new Date(schema.last_activity) : undefined
        };
    }
    static mapCoordinationStrategyToSchema(strategy) {
        return {
            type: strategy.type,
            coordinator_id: strategy.coordinatorId,
            decision_making: strategy.decisionMaking
        };
    }
    static mapCoordinationStrategyFromSchema(schema) {
        return {
            type: schema.type,
            coordinatorId: schema.coordinator_id,
            decisionMaking: schema.decision_making
        };
    }
    static mapAuditTrailToSchema(auditTrail) {
        return {
            enabled: auditTrail.enabled,
            retention_days: auditTrail.retentionDays,
            events: auditTrail.events.map(event => ({
                event_id: event.eventId,
                event_type: event.eventType,
                timestamp: event.timestamp.toISOString(),
                user_id: event.userId,
                details: event.details
            }))
        };
    }
    static mapAuditTrailFromSchema(schema) {
        return {
            enabled: schema.enabled,
            retentionDays: schema.retention_days,
            events: schema.events.map(event => ({
                eventId: event.event_id,
                eventType: event.event_type,
                timestamp: new Date(event.timestamp),
                userId: event.user_id,
                details: event.details
            }))
        };
    }
    static mapMonitoringIntegrationToSchema(monitoring) {
        return {
            enabled: monitoring.enabled,
            trace_id: monitoring.traceId,
            metrics_collection: monitoring.metricsCollection,
            alerting: {
                enabled: monitoring.alerting.enabled,
                thresholds: monitoring.alerting.thresholds
            }
        };
    }
    static mapMonitoringIntegrationFromSchema(schema) {
        return {
            enabled: schema.enabled,
            traceId: schema.trace_id,
            metricsCollection: schema.metrics_collection,
            alerting: {
                enabled: schema.alerting.enabled,
                thresholds: schema.alerting.thresholds
            }
        };
    }
    static mapPerformanceMetricsToSchema(metrics) {
        return {
            enabled: metrics.enabled,
            collection_interval_seconds: metrics.collectionIntervalSeconds,
            metrics: {
                coordination_latency_ms: metrics.metrics.coordinationLatencyMs,
                participant_response_time_ms: metrics.metrics.participantResponseTimeMs,
                success_rate_percent: metrics.metrics.successRatePercent,
                throughput_operations_per_second: metrics.metrics.throughputOperationsPerSecond
            }
        };
    }
    static mapPerformanceMetricsFromSchema(schema) {
        return {
            enabled: schema.enabled,
            collectionIntervalSeconds: schema.collection_interval_seconds,
            metrics: {
                coordinationLatencyMs: schema.metrics.coordination_latency_ms,
                participantResponseTimeMs: schema.metrics.participant_response_time_ms,
                successRatePercent: schema.metrics.success_rate_percent,
                throughputOperationsPerSecond: schema.metrics.throughput_operations_per_second
            }
        };
    }
    static mapVersionHistoryToSchema(versionHistory) {
        return {
            enabled: versionHistory.enabled,
            max_versions: versionHistory.maxVersions,
            versions: versionHistory.versions.map(version => ({
                version_id: version.versionId,
                version_number: version.versionNumber,
                created_at: version.createdAt.toISOString(),
                created_by: version.createdBy,
                changes: version.changes
            }))
        };
    }
    static mapVersionHistoryFromSchema(schema) {
        return {
            enabled: schema.enabled,
            maxVersions: schema.max_versions,
            versions: schema.versions.map(version => ({
                versionId: version.version_id,
                versionNumber: version.version_number,
                createdAt: new Date(version.created_at),
                createdBy: version.created_by,
                changes: version.changes
            }))
        };
    }
    static mapSearchMetadataToSchema(searchMetadata) {
        return {
            enabled: searchMetadata.enabled,
            indexed_fields: searchMetadata.indexedFields,
            search_tags: searchMetadata.searchTags,
            full_text_search: searchMetadata.fullTextSearch
        };
    }
    static mapSearchMetadataFromSchema(schema) {
        return {
            enabled: schema.enabled,
            indexedFields: schema.indexed_fields,
            searchTags: schema.search_tags,
            fullTextSearch: schema.full_text_search
        };
    }
    static mapOperationToSchema(operation) {
        return {
            operation_id: operation.operationId,
            operation_type: operation.operationType,
            status: operation.status,
            started_at: operation.startedAt.toISOString(),
            completed_at: operation.completedAt?.toISOString(),
            result: operation.result
        };
    }
    static mapOperationFromSchema(schema) {
        return {
            operationId: schema.operation_id,
            operationType: schema.operation_type,
            status: schema.status,
            startedAt: new Date(schema.started_at),
            completedAt: schema.completed_at ? new Date(schema.completed_at) : undefined,
            result: schema.result
        };
    }
    static mapEventIntegrationToSchema(eventIntegration) {
        return {
            enabled: eventIntegration.enabled,
            subscribed_events: eventIntegration.subscribedEvents,
            published_events: eventIntegration.publishedEvents,
            event_routing: {
                routing_rules: eventIntegration.eventRouting.routingRules.map(rule => ({
                    rule_id: rule.ruleId,
                    condition: rule.condition,
                    target_topic: rule.targetTopic,
                    enabled: rule.enabled
                }))
            }
        };
    }
    static mapEventIntegrationFromSchema(schema) {
        return {
            enabled: schema.enabled,
            subscribedEvents: schema.subscribed_events,
            publishedEvents: schema.published_events,
            eventRouting: {
                routingRules: schema.event_routing.routing_rules.map(rule => ({
                    ruleId: rule.rule_id,
                    condition: rule.condition,
                    targetTopic: rule.target_topic,
                    enabled: rule.enabled
                }))
            }
        };
    }
    static fromCreateDTO(dto) {
        return {
            contextId: dto.contextId,
            planId: dto.planId,
            name: dto.name,
            description: dto.description,
            mode: dto.mode,
            participants: dto.participants.map(p => ({
                participantId: (0, utils_1.generateUUID)(),
                agentId: p.agentId,
                roleId: p.roleId,
                status: 'pending',
                capabilities: p.capabilities,
                joinedAt: new Date(),
                lastActivity: undefined
            })),
            coordinationStrategy: {
                type: dto.coordinationStrategy.type,
                coordinatorId: dto.coordinationStrategy.coordinatorId,
                decisionMaking: dto.coordinationStrategy.decisionMaking
            }
        };
    }
    static fromUpdateDTO(dto) {
        const updateData = {};
        if (dto.name !== undefined)
            updateData.name = dto.name;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.mode !== undefined)
            updateData.mode = dto.mode;
        if (dto.status !== undefined)
            updateData.status = dto.status;
        if (dto.participants) {
            updateData.participants = dto.participants.map(p => ({
                participantId: p.participantId,
                agentId: '',
                roleId: '',
                status: p.status || 'active',
                capabilities: p.capabilities,
                joinedAt: new Date(),
                lastActivity: new Date()
            }));
        }
        if (dto.coordinationStrategy) {
            updateData.coordinationStrategy = {
                type: dto.coordinationStrategy.type || 'centralized',
                coordinatorId: dto.coordinationStrategy.coordinatorId,
                decisionMaking: dto.coordinationStrategy.decisionMaking || 'consensus'
            };
        }
        return updateData;
    }
    static toResponseDTO(entity) {
        return {
            collaborationId: entity.id,
            protocolVersion: entity.protocolVersion,
            timestamp: entity.timestamp.toISOString(),
            contextId: entity.contextId,
            planId: entity.planId,
            name: entity.name,
            description: entity.description,
            mode: entity.mode,
            status: entity.status,
            participants: entity.participants.map(p => ({
                participantId: p.participantId,
                agentId: p.agentId,
                roleId: p.roleId,
                status: p.status,
                capabilities: p.capabilities,
                joinedAt: p.joinedAt.toISOString(),
                lastActivity: p.lastActivity?.toISOString()
            })),
            coordinationStrategy: {
                type: entity.coordinationStrategy.type,
                coordinatorId: entity.coordinationStrategy.coordinatorId,
                decisionMaking: entity.coordinationStrategy.decisionMaking
            },
            createdAt: new Date().toISOString(),
            createdBy: entity.createdBy,
            updatedAt: entity.updatedBy ? new Date().toISOString() : undefined,
            updatedBy: entity.updatedBy
        };
    }
    static toResponseDTOArray(entities) {
        return entities.map(entity => this.toResponseDTO(entity));
    }
    static fromSchemaArray(schemas) {
        return schemas.map(schema => this.fromSchema(schema));
    }
    static toSchemaArray(entities) {
        return entities.map(entity => this.toSchema(entity));
    }
}
exports.CollabMapper = CollabMapper;
