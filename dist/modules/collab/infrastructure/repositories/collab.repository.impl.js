"use strict";
/**
 * Collab Repository Implementation - Infrastructure Layer
 * @description Concrete implementation of Collab repository with cross-cutting concerns integration
 * @version 1.0.0
 * @author MPLP Development Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollabRepositoryImpl = void 0;
const utils_1 = require("../../../../shared/utils");
const collab_entity_1 = require("../../domain/entities/collab.entity");
const collab_mapper_1 = require("../../api/mappers/collab.mapper");
/**
 * Collab Repository Implementation
 * Implements persistence operations with full cross-cutting concerns integration
 */
class CollabRepositoryImpl {
    constructor() {
        this.collabStorage = new Map();
    }
    // ===== BASIC CRUD OPERATIONS =====
    async findById(id) {
        // ===== CROSS-CUTTING CONCERNS =====
        // Performance: Caching will be handled by L3 Manager
        // Security: Access control will be handled by L3 Manager
        // Monitoring: Metrics collection will be handled by L3 Manager
        const schema = this.collabStorage.get(id);
        if (!schema) {
            return null;
        }
        // Convert schema to entity data first, then create entity
        const entityData = collab_mapper_1.CollabMapper.fromSchema(schema);
        return this.createEntityFromData(entityData);
    }
    async findByIds(ids) {
        const entities = [];
        for (const id of ids) {
            const entity = await this.findById(id);
            if (entity) {
                entities.push(entity);
            }
        }
        return entities;
    }
    async save(entity) {
        // ===== CONVERT TO SCHEMA =====
        const entityData = this.convertEntityToEntityData(entity);
        const schema = collab_mapper_1.CollabMapper.toSchema(entityData);
        // ===== CROSS-CUTTING CONCERNS INTEGRATION =====
        // Add audit trail
        schema.audit_trail = {
            enabled: true,
            retention_days: 365,
            events: [{
                    event_id: (0, utils_1.generateUUID)(),
                    event_type: 'collaboration_created',
                    timestamp: new Date().toISOString(),
                    user_id: schema.created_by,
                    details: {
                        collaboration_id: schema.collaboration_id,
                        mode: schema.mode,
                        participant_count: schema.participants.length
                    }
                }]
        };
        // Add monitoring integration
        schema.monitoring_integration = {
            enabled: true,
            trace_id: (0, utils_1.generateUUID)(),
            metrics_collection: true,
            alerting: {
                enabled: true,
                thresholds: {
                    max_participants: 100,
                    max_duration_hours: 24,
                    min_success_rate: 0.8
                }
            }
        };
        // Add performance metrics
        schema.performance_metrics = {
            enabled: true,
            collection_interval_seconds: 60,
            metrics: {
                coordination_latency_ms: 0,
                participant_response_time_ms: 0,
                success_rate_percent: 100,
                throughput_operations_per_second: 0
            }
        };
        // Add version history
        schema.version_history = {
            enabled: true,
            max_versions: 10,
            versions: [{
                    version_id: (0, utils_1.generateUUID)(),
                    version_number: '1.0.0',
                    created_at: schema.created_at,
                    created_by: schema.created_by,
                    changes: ['Initial creation']
                }]
        };
        // Add search metadata
        schema.search_metadata = {
            enabled: true,
            indexed_fields: ['name', 'description', 'mode', 'status'],
            search_tags: [schema.mode, schema.status, `participants:${schema.participants.length}`],
            full_text_search: true
        };
        // Add operation tracking
        schema.collab_operation = {
            operation_id: (0, utils_1.generateUUID)(),
            operation_type: 'create',
            status: 'completed',
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            result: {
                success: true,
                collaboration_id: schema.collaboration_id
            }
        };
        // Add event integration
        schema.event_integration = {
            enabled: true,
            subscribed_events: ['participant_status_changed', 'coordination_strategy_updated'],
            published_events: ['collaboration_created', 'collaboration_updated'],
            event_routing: {
                routing_rules: [{
                        rule_id: (0, utils_1.generateUUID)(),
                        condition: 'status == "active"',
                        target_topic: 'active_collaborations',
                        enabled: true
                    }]
            }
        };
        // ===== PERSIST TO STORAGE =====
        this.collabStorage.set(entity.id, schema);
        // ===== PUBLISH DOMAIN EVENTS =====
        // Domain events will be published by L3 Manager
        // For now, we just clear them from the entity
        entity.clearDomainEvents();
        return entity;
    }
    async update(entity) {
        const existingSchema = this.collabStorage.get(entity.id);
        if (!existingSchema) {
            throw new Error('Collaboration not found for update');
        }
        // Convert entity to schema
        const entityData = this.convertEntityToEntityData(entity);
        const updatedSchema = collab_mapper_1.CollabMapper.toSchema(entityData);
        // Preserve cross-cutting concerns from existing schema
        updatedSchema.audit_trail = existingSchema.audit_trail;
        updatedSchema.monitoring_integration = existingSchema.monitoring_integration;
        updatedSchema.performance_metrics = existingSchema.performance_metrics;
        updatedSchema.version_history = existingSchema.version_history;
        updatedSchema.search_metadata = existingSchema.search_metadata;
        updatedSchema.event_integration = existingSchema.event_integration;
        // Update operation tracking
        updatedSchema.collab_operation = {
            operation_id: (0, utils_1.generateUUID)(),
            operation_type: 'update',
            status: 'completed',
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            result: {
                success: true,
                collaboration_id: updatedSchema.collaboration_id
            }
        };
        // Add audit event
        updatedSchema.audit_trail.events.push({
            event_id: (0, utils_1.generateUUID)(),
            event_type: 'collaboration_updated',
            timestamp: new Date().toISOString(),
            user_id: updatedSchema.updated_by || 'system',
            details: {
                collaboration_id: updatedSchema.collaboration_id,
                changes: ['Updated collaboration properties']
            }
        });
        // Update version history
        updatedSchema.version_history.versions.push({
            version_id: (0, utils_1.generateUUID)(),
            version_number: `1.${updatedSchema.version_history.versions.length}.0`,
            created_at: new Date().toISOString(),
            created_by: updatedSchema.updated_by || 'system',
            changes: ['Updated collaboration']
        });
        this.collabStorage.set(entity.id, updatedSchema);
        // Clear domain events
        entity.clearDomainEvents();
        return entity;
    }
    async delete(id) {
        const schema = this.collabStorage.get(id);
        if (!schema) {
            throw new Error('Collaboration not found for deletion');
        }
        // Add deletion audit event
        schema.audit_trail.events.push({
            event_id: (0, utils_1.generateUUID)(),
            event_type: 'collaboration_deleted',
            timestamp: new Date().toISOString(),
            user_id: 'system',
            details: {
                collaboration_id: id,
                deletion_reason: 'User requested deletion'
            }
        });
        // In a real implementation, we might soft delete or archive
        this.collabStorage.delete(id);
    }
    async exists(id) {
        return this.collabStorage.has(id);
    }
    // ===== QUERY OPERATIONS =====
    async list(query) {
        const allSchemas = Array.from(this.collabStorage.values());
        // Apply filters
        let filteredSchemas = allSchemas;
        if (query.status) {
            filteredSchemas = filteredSchemas.filter(s => s.status === query.status);
        }
        if (query.mode) {
            filteredSchemas = filteredSchemas.filter(s => s.mode === query.mode);
        }
        if (query.contextId) {
            filteredSchemas = filteredSchemas.filter(s => s.context_id === query.contextId);
        }
        if (query.planId) {
            filteredSchemas = filteredSchemas.filter(s => s.plan_id === query.planId);
        }
        if (query.participantId) {
            filteredSchemas = filteredSchemas.filter(s => s.participants.some(p => p.participant_id === query.participantId));
        }
        // Apply sorting
        const sortBy = query.sortBy || 'created_at';
        const sortOrder = query.sortOrder || 'desc';
        filteredSchemas.sort((a, b) => {
            let aValue, bValue;
            switch (sortBy) {
                case 'name':
                    aValue = a.name;
                    bValue = b.name;
                    break;
                case 'createdAt':
                    aValue = a.created_at;
                    bValue = b.created_at;
                    break;
                case 'updatedAt':
                    aValue = a.updated_at || a.created_at;
                    bValue = b.updated_at || b.created_at;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    aValue = a.created_at;
                    bValue = b.created_at;
            }
            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            }
            else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });
        // Apply pagination
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;
        const paginatedSchemas = filteredSchemas.slice(offset, offset + limit);
        const entities = paginatedSchemas.map(schema => {
            const entityData = collab_mapper_1.CollabMapper.fromSchema(schema);
            return this.createEntityFromData(entityData);
        });
        return {
            items: entities,
            pagination: {
                page,
                limit,
                total: filteredSchemas.length,
                totalPages: Math.ceil(filteredSchemas.length / limit)
            }
        };
    }
    async search(query) {
        const startTime = Date.now();
        const allSchemas = Array.from(this.collabStorage.values());
        // Simple text search implementation
        const searchTerm = query.query.toLowerCase();
        let matchedSchemas = allSchemas.filter(schema => {
            const searchableText = [
                schema.name,
                schema.description || '',
                schema.mode,
                schema.status,
                ...schema.participants.map(p => p.agent_id)
            ].join(' ').toLowerCase();
            return searchableText.includes(searchTerm);
        });
        // Apply filters
        if (query.filters?.status) {
            matchedSchemas = matchedSchemas.filter(s => query.filters.status.includes(s.status));
        }
        if (query.filters?.mode) {
            matchedSchemas = matchedSchemas.filter(s => query.filters.mode.includes(s.mode));
        }
        if (query.filters?.dateRange) {
            const from = new Date(query.filters.dateRange.from);
            const to = new Date(query.filters.dateRange.to);
            matchedSchemas = matchedSchemas.filter(s => {
                const createdAt = new Date(s.created_at);
                return createdAt >= from && createdAt <= to;
            });
        }
        // Apply pagination
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;
        const paginatedSchemas = matchedSchemas.slice(offset, offset + limit);
        const entities = paginatedSchemas.map(schema => {
            const entityData = collab_mapper_1.CollabMapper.fromSchema(schema);
            return this.createEntityFromData(entityData);
        });
        const executionTime = Date.now() - startTime;
        return {
            items: entities,
            pagination: {
                page,
                limit,
                total: matchedSchemas.length,
                totalPages: Math.ceil(matchedSchemas.length / limit)
            },
            searchMetadata: {
                query: query.query,
                executionTimeMs: executionTime,
                totalMatches: matchedSchemas.length
            }
        };
    }
    async count(filters) {
        if (!filters) {
            return this.collabStorage.size;
        }
        const query = { ...filters, page: 1, limit: 1000000 };
        const result = await this.list(query);
        return result.pagination.total;
    }
    // ===== HELPER METHODS =====
    /**
     * Create CollabEntity from entity data
     * This helper creates a proper entity instance from data
     */
    createEntityFromData(entityData) {
        // Create coordination strategy
        const coordinationStrategy = new collab_entity_1.CollabCoordinationStrategy(entityData.coordinationStrategy?.type || 'distributed', entityData.coordinationStrategy?.decisionMaking || 'consensus', entityData.coordinationStrategy?.coordinatorId);
        // Create participants
        const participants = (entityData.participants || []).map((p) => new collab_entity_1.CollabParticipant(p.participantId || (0, utils_1.generateUUID)(), p.agentId, p.roleId, p.status || 'pending', p.capabilities || [], new Date(p.joinedAt || Date.now()), p.lastActivity ? new Date(p.lastActivity) : undefined));
        // Create entity
        const entity = new collab_entity_1.CollabEntity(entityData.collaborationId || (0, utils_1.generateUUID)(), entityData.contextId, entityData.planId, entityData.name, entityData.mode, coordinationStrategy, entityData.createdBy || 'system', entityData.description);
        // Add participants
        for (const participant of participants) {
            entity.addParticipant(participant, entityData.createdBy || 'system');
        }
        return entity;
    }
    /**
     * Convert CollabEntity to CollabEntityData for mapping
     * This is a temporary helper until we have proper entity data extraction
     */
    convertEntityToEntityData(entity) {
        return {
            collaborationId: entity.id,
            protocolVersion: entity.protocolVersion,
            timestamp: entity.timestamp,
            contextId: entity.contextId,
            planId: entity.planId,
            name: entity.name,
            description: entity.description,
            mode: entity.mode,
            status: entity.status,
            participants: entity.participants,
            coordinationStrategy: entity.coordinationStrategy,
            createdAt: new Date(), // TODO: Add to entity
            createdBy: entity.createdBy,
            updatedAt: entity.updatedBy ? new Date() : undefined,
            updatedBy: entity.updatedBy,
            // Cross-cutting concerns will be added by the repository
            auditTrail: { enabled: true, retentionDays: 365, events: [] },
            monitoringIntegration: { enabled: true, metricsCollection: true, alerting: { enabled: true, thresholds: {} } },
            performanceMetrics: { enabled: true, collectionIntervalSeconds: 60, metrics: { coordinationLatencyMs: 0, participantResponseTimeMs: 0, successRatePercent: 100, throughputOperationsPerSecond: 0 } },
            versionHistory: { enabled: true, maxVersions: 10, versions: [] },
            searchMetadata: { enabled: true, indexedFields: [], searchTags: [], fullTextSearch: true },
            collabOperation: { operationId: (0, utils_1.generateUUID)(), operationType: 'create', status: 'completed', startedAt: new Date(), result: {} },
            eventIntegration: { enabled: true, subscribedEvents: [], publishedEvents: [], eventRouting: { routingRules: [] } }
        };
    }
}
exports.CollabRepositoryImpl = CollabRepositoryImpl;
//# sourceMappingURL=collab.repository.impl.js.map