import { UUID } from '../../../../shared/types';
import { CollabEntity } from '../../domain/entities/collab.entity';
export interface CollabSchema {
    collaboration_id: string;
    protocol_version: string;
    timestamp: string;
    context_id: string;
    plan_id: string;
    name: string;
    description?: string;
    mode: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh';
    status: string;
    participants: CollabParticipantSchema[];
    coordination_strategy: CollabCoordinationStrategySchema;
    created_at: string;
    created_by: string;
    updated_at?: string;
    updated_by?: string;
    audit_trail: CollabAuditTrailSchema;
    monitoring_integration: CollabMonitoringIntegrationSchema;
    performance_metrics: CollabPerformanceMetricsSchema;
    version_history: CollabVersionHistorySchema;
    search_metadata: CollabSearchMetadataSchema;
    collab_operation: CollabOperationSchema;
    event_integration: CollabEventIntegrationSchema;
}
export interface CollabParticipantSchema {
    participant_id: string;
    agent_id: string;
    role_id: string;
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    capabilities?: string[];
    joined_at: string;
    last_activity?: string;
}
export interface CollabCoordinationStrategySchema {
    type: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
    coordinator_id?: string;
    decision_making: 'consensus' | 'majority' | 'weighted' | 'coordinator';
}
export interface CollabAuditTrailSchema {
    enabled: boolean;
    retention_days: number;
    events: CollabAuditEventSchema[];
}
export interface CollabAuditEventSchema {
    event_id: string;
    event_type: string;
    timestamp: string;
    user_id: string;
    details: Record<string, unknown>;
}
export interface CollabMonitoringIntegrationSchema {
    enabled: boolean;
    trace_id?: string;
    metrics_collection: boolean;
    alerting: {
        enabled: boolean;
        thresholds: Record<string, number>;
    };
}
export interface CollabPerformanceMetricsSchema {
    enabled: boolean;
    collection_interval_seconds: number;
    metrics: {
        coordination_latency_ms: number;
        participant_response_time_ms: number;
        success_rate_percent: number;
        throughput_operations_per_second: number;
    };
}
export interface CollabVersionHistorySchema {
    enabled: boolean;
    max_versions: number;
    versions: CollabVersionSchema[];
}
export interface CollabVersionSchema {
    version_id: string;
    version_number: string;
    created_at: string;
    created_by: string;
    changes: string[];
}
export interface CollabSearchMetadataSchema {
    enabled: boolean;
    indexed_fields: string[];
    search_tags: string[];
    full_text_search: boolean;
}
export interface CollabOperationSchema {
    operation_id: string;
    operation_type: string;
    status: string;
    started_at: string;
    completed_at?: string;
    result?: Record<string, unknown>;
}
export interface CollabEventIntegrationSchema {
    enabled: boolean;
    subscribed_events: string[];
    published_events: string[];
    event_routing: {
        routing_rules: CollabEventRoutingRuleSchema[];
    };
}
export interface CollabEventRoutingRuleSchema {
    rule_id: string;
    condition: string;
    target_topic: string;
    enabled: boolean;
}
export interface CollabEntityData {
    id: UUID;
    collaborationId: UUID;
    protocolVersion: string;
    timestamp: Date;
    contextId: UUID;
    planId: UUID;
    name: string;
    description?: string;
    mode: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh';
    status: string;
    participants: CollabParticipantEntityData[];
    coordinationStrategy: CollabCoordinationStrategyEntityData;
    createdAt: Date;
    createdBy: string;
    updatedAt?: Date;
    updatedBy?: string;
    auditTrail: CollabAuditTrailEntityData;
    monitoringIntegration: CollabMonitoringIntegrationEntityData;
    performanceMetrics: CollabPerformanceMetricsEntityData;
    versionHistory: CollabVersionHistoryEntityData;
    searchMetadata: CollabSearchMetadataEntityData;
    collabOperation: CollabOperationEntityData;
    eventIntegration: CollabEventIntegrationEntityData;
}
export interface CollabParticipantEntityData {
    participantId: UUID;
    agentId: UUID;
    roleId: UUID;
    status: 'active' | 'inactive' | 'pending' | 'suspended';
    capabilities?: string[];
    joinedAt: Date;
    lastActivity?: Date;
}
export interface CollabCoordinationStrategyEntityData {
    type: 'centralized' | 'distributed' | 'hierarchical' | 'peer_to_peer';
    coordinatorId?: UUID;
    decisionMaking: 'consensus' | 'majority' | 'weighted' | 'coordinator';
}
export interface CollabAuditTrailEntityData {
    enabled: boolean;
    retentionDays: number;
    events: CollabAuditEventEntityData[];
}
export interface CollabAuditEventEntityData {
    eventId: UUID;
    eventType: string;
    timestamp: Date;
    userId: UUID;
    details: Record<string, unknown>;
}
export interface CollabMonitoringIntegrationEntityData {
    enabled: boolean;
    traceId?: UUID;
    metricsCollection: boolean;
    alerting: {
        enabled: boolean;
        thresholds: Record<string, number>;
    };
}
export interface CollabPerformanceMetricsEntityData {
    enabled: boolean;
    collectionIntervalSeconds: number;
    metrics: {
        coordinationLatencyMs: number;
        participantResponseTimeMs: number;
        successRatePercent: number;
        throughputOperationsPerSecond: number;
    };
}
export interface CollabVersionHistoryEntityData {
    enabled: boolean;
    maxVersions: number;
    versions: CollabVersionEntityData[];
}
export interface CollabVersionEntityData {
    versionId: UUID;
    versionNumber: string;
    createdAt: Date;
    createdBy: string;
    changes: string[];
}
export interface CollabSearchMetadataEntityData {
    enabled: boolean;
    indexedFields: string[];
    searchTags: string[];
    fullTextSearch: boolean;
}
export interface CollabOperationEntityData {
    operationId: UUID;
    operationType: string;
    status: string;
    startedAt: Date;
    completedAt?: Date;
    result?: Record<string, unknown>;
}
export interface CollabEventIntegrationEntityData {
    enabled: boolean;
    subscribedEvents: string[];
    publishedEvents: string[];
    eventRouting: {
        routingRules: CollabEventRoutingRuleEntityData[];
    };
}
export interface CollabEventRoutingRuleEntityData {
    ruleId: UUID;
    condition: string;
    targetTopic: string;
    enabled: boolean;
}
export declare class CollabMapper {
    static toSchema(entity: CollabEntityData): CollabSchema;
    static fromSchema(schema: CollabSchema): CollabEntityData;
    static validateSchema(data: unknown): data is CollabSchema;
    private static mapParticipantToSchema;
    private static mapParticipantFromSchema;
    private static mapCoordinationStrategyToSchema;
    private static mapCoordinationStrategyFromSchema;
    private static mapAuditTrailToSchema;
    private static mapAuditTrailFromSchema;
    private static mapMonitoringIntegrationToSchema;
    private static mapMonitoringIntegrationFromSchema;
    private static mapPerformanceMetricsToSchema;
    private static mapPerformanceMetricsFromSchema;
    private static mapVersionHistoryToSchema;
    private static mapVersionHistoryFromSchema;
    private static mapSearchMetadataToSchema;
    private static mapSearchMetadataFromSchema;
    private static mapOperationToSchema;
    private static mapOperationFromSchema;
    private static mapEventIntegrationToSchema;
    private static mapEventIntegrationFromSchema;
    static fromCreateDTO(dto: CollabCreateDTO): Partial<CollabEntityData>;
    static fromUpdateDTO(dto: CollabUpdateDTO): Partial<CollabEntityData>;
    static toResponseDTO(entity: CollabEntity): CollabResponseDTO;
    static toResponseDTOArray(entities: CollabEntity[]): CollabResponseDTO[];
    static fromSchemaArray(schemas: CollabSchema[]): CollabEntityData[];
    static toSchemaArray(entities: CollabEntityData[]): CollabSchema[];
}
import { CollabCreateDTO, CollabUpdateDTO, CollabResponseDTO } from '../dto/collab.dto';
//# sourceMappingURL=collab.mapper.d.ts.map