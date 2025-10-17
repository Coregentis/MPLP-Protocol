"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkMapper = void 0;
const network_entity_1 = require("../../domain/entities/network.entity");
class NetworkMapper {
    static toSchema(entity) {
        return {
            network_id: entity.networkId,
            protocol_version: entity.protocolVersion,
            timestamp: entity.timestamp.toISOString(),
            context_id: entity.contextId,
            name: entity.name,
            description: entity.description,
            topology: entity.topology,
            nodes: entity.nodes.map(node => ({
                node_id: node.nodeId,
                agent_id: node.agentId,
                node_type: node.nodeType,
                status: node.status,
                capabilities: node.capabilities,
                address: node.address ? {
                    host: node.address.host,
                    port: node.address.port,
                    protocol: node.address.protocol
                } : undefined,
                metadata: node.metadata
            })),
            edges: entity.edges.map(edge => ({
                edge_id: edge.edgeId,
                source_node_id: edge.sourceNodeId,
                target_node_id: edge.targetNodeId,
                edge_type: edge.edgeType,
                direction: edge.direction,
                status: edge.status,
                weight: edge.weight,
                metadata: edge.metadata
            })),
            discovery_mechanism: {
                type: entity.discoveryMechanism.type,
                enabled: entity.discoveryMechanism.enabled,
                configuration: entity.discoveryMechanism.configuration
            },
            routing_strategy: {
                algorithm: entity.routingStrategy.algorithm,
                load_balancing: entity.routingStrategy.loadBalancing,
                configuration: entity.routingStrategy.configuration
            },
            status: entity.status,
            created_at: entity.createdAt.toISOString(),
            updated_at: entity.updatedAt ? (entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt) : undefined,
            created_by: entity.createdBy,
            audit_trail: entity.auditTrail.map(entry => ({
                timestamp: entry.timestamp,
                action: entry.action,
                actor: entry.actor,
                details: entry.details
            })),
            monitoring_integration: {
                enabled: entity.monitoringIntegration.enabled,
                endpoints: entity.monitoringIntegration.endpoints,
                configuration: entity.monitoringIntegration.configuration
            },
            performance_metrics: {
                enabled: entity.performanceMetrics.enabled,
                collection_interval_seconds: entity.performanceMetrics.collectionIntervalSeconds,
                metrics: entity.performanceMetrics.metrics
            },
            version_history: entity.versionHistory.map(version => ({
                version: version.version,
                timestamp: version.timestamp,
                changes: version.changes,
                author: version.author
            })),
            search_metadata: {
                tags: entity.searchMetadata.tags,
                keywords: entity.searchMetadata.keywords,
                categories: entity.searchMetadata.categories,
                indexed: entity.searchMetadata.indexed
            },
            network_operation: entity.networkOperation,
            event_integration: {
                enabled: entity.eventIntegration.enabled,
                event_types: entity.eventIntegration.eventTypes,
                configuration: entity.eventIntegration.configuration
            }
        };
    }
    static fromSchema(schema) {
        const nodes = schema.nodes.map(nodeSchema => new network_entity_1.NetworkNode(nodeSchema.node_id, nodeSchema.agent_id, nodeSchema.node_type, nodeSchema.status, nodeSchema.capabilities, nodeSchema.address ? {
            host: nodeSchema.address.host,
            port: nodeSchema.address.port,
            protocol: nodeSchema.address.protocol
        } : undefined, nodeSchema.metadata));
        const edges = (schema.edges || []).map(edgeSchema => new network_entity_1.NetworkEdge(edgeSchema.edge_id, edgeSchema.source_node_id, edgeSchema.target_node_id, edgeSchema.edge_type, edgeSchema.direction, edgeSchema.status, edgeSchema.weight, edgeSchema.metadata));
        return new network_entity_1.NetworkEntity({
            networkId: schema.network_id,
            protocolVersion: schema.protocol_version,
            timestamp: new Date(schema.timestamp),
            contextId: schema.context_id,
            name: schema.name,
            topology: schema.topology,
            nodes,
            discoveryMechanism: {
                type: schema.discovery_mechanism.type,
                enabled: schema.discovery_mechanism.enabled,
                configuration: schema.discovery_mechanism.configuration
            },
            routingStrategy: {
                algorithm: schema.routing_strategy.algorithm,
                loadBalancing: schema.routing_strategy.load_balancing,
                configuration: schema.routing_strategy.configuration
            },
            status: schema.status,
            createdAt: new Date(schema.created_at),
            createdBy: schema.created_by,
            auditTrail: schema.audit_trail.map(entry => ({
                timestamp: entry.timestamp,
                action: entry.action,
                actor: entry.actor,
                details: entry.details
            })),
            monitoringIntegration: {
                enabled: schema.monitoring_integration.enabled,
                endpoints: schema.monitoring_integration.endpoints,
                configuration: schema.monitoring_integration.configuration
            },
            performanceMetrics: {
                enabled: schema.performance_metrics.enabled,
                collectionIntervalSeconds: schema.performance_metrics.collection_interval_seconds,
                metrics: schema.performance_metrics.metrics
            },
            versionHistory: schema.version_history.map(version => ({
                version: version.version,
                timestamp: version.timestamp,
                changes: version.changes,
                author: version.author
            })),
            searchMetadata: {
                tags: schema.search_metadata.tags,
                keywords: schema.search_metadata.keywords,
                categories: schema.search_metadata.categories,
                indexed: schema.search_metadata.indexed
            },
            networkOperation: schema.network_operation,
            eventIntegration: {
                enabled: schema.event_integration.enabled,
                eventTypes: schema.event_integration.event_types,
                configuration: schema.event_integration.configuration
            },
            description: schema.description,
            edges,
            updatedAt: schema.updated_at ? new Date(schema.updated_at) : undefined
        });
    }
    static toDto(entity) {
        return {
            networkId: entity.networkId,
            protocolVersion: entity.protocolVersion,
            timestamp: entity.timestamp.toISOString(),
            contextId: entity.contextId,
            name: entity.name,
            description: entity.description,
            topology: entity.topology,
            nodes: entity.nodes.map(node => ({
                nodeId: node.nodeId,
                agentId: node.agentId,
                nodeType: node.nodeType,
                status: node.status,
                capabilities: node.capabilities,
                address: node.address,
                metadata: node.metadata
            })),
            edges: entity.edges.map(edge => ({
                edgeId: edge.edgeId,
                sourceNodeId: edge.sourceNodeId,
                targetNodeId: edge.targetNodeId,
                edgeType: edge.edgeType,
                direction: edge.direction,
                status: edge.status,
                weight: edge.weight,
                metadata: edge.metadata
            })),
            discoveryMechanism: entity.discoveryMechanism,
            routingStrategy: entity.routingStrategy,
            status: entity.status,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt?.toISOString(),
            createdBy: entity.createdBy,
            auditTrail: entity.auditTrail,
            monitoringIntegration: entity.monitoringIntegration,
            performanceMetrics: entity.performanceMetrics,
            versionHistory: entity.versionHistory,
            searchMetadata: entity.searchMetadata,
            networkOperation: entity.networkOperation,
            eventIntegration: entity.eventIntegration
        };
    }
    static validateSchema(schema) {
        if (!schema || typeof schema !== 'object') {
            return false;
        }
        const s = schema;
        return (typeof s.network_id === 'string' &&
            typeof s.protocol_version === 'string' &&
            typeof s.timestamp === 'string' &&
            typeof s.context_id === 'string' &&
            typeof s.name === 'string' &&
            typeof s.topology === 'string' &&
            Array.isArray(s.nodes) &&
            typeof s.discovery_mechanism === 'object' &&
            typeof s.routing_strategy === 'object' &&
            typeof s.status === 'string' &&
            typeof s.created_at === 'string' &&
            typeof s.created_by === 'string');
    }
    static toSchemaArray(entities) {
        return entities.map(entity => this.toSchema(entity));
    }
    static fromSchemaArray(schemas) {
        return schemas.map(schema => this.fromSchema(schema));
    }
    static toDtoArray(entities) {
        return entities.map(entity => this.toDto(entity));
    }
}
exports.NetworkMapper = NetworkMapper;
