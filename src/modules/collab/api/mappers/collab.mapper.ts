/**
 * Collab Mapper - Schema-TypeScript Mapping
 * @description Implements MPLP dual naming convention for Collab module
 * @version 1.0.0
 * @author MPLP Development Team
 */

import { UUID } from '../../../../shared/types';
import { generateUUID } from '../../../../shared/utils';
import { CollabEntity } from '../../domain/entities/collab.entity';

// ===== SCHEMA INTERFACES (snake_case) =====

/**
 * Collab Schema Interface - Based on mplp-collab.json
 * Uses snake_case naming convention for Schema layer
 */
export interface CollabSchema {
  // ===== BASIC PROTOCOL FIELDS =====
  collaboration_id: string;
  protocol_version: string;
  timestamp: string;
  context_id: string;
  plan_id: string;
  name: string;
  description?: string;
  mode: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh';
  status: string;

  // ===== COLLABORATION SPECIFIC FIELDS =====
  participants: CollabParticipantSchema[];
  coordination_strategy: CollabCoordinationStrategySchema;

  // ===== CROSS-CUTTING CONCERNS FIELDS =====
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

// ===== TYPESCRIPT ENTITY INTERFACES (camelCase) =====

/**
 * Collab Entity Data Interface - TypeScript layer
 * Uses camelCase naming convention for TypeScript layer
 */
export interface CollabEntityData {
  // ===== BASIC PROTOCOL FIELDS =====
  id: UUID; // Entity ID for domain layer
  collaborationId: UUID; // Schema ID for protocol layer
  protocolVersion: string;
  timestamp: Date;
  contextId: UUID;
  planId: UUID;
  name: string;
  description?: string;
  mode: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh';
  status: string;

  // ===== COLLABORATION SPECIFIC FIELDS =====
  participants: CollabParticipantEntityData[];
  coordinationStrategy: CollabCoordinationStrategyEntityData;

  // ===== CROSS-CUTTING CONCERNS FIELDS =====
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

// ===== MAPPER CLASS =====

/**
 * Collab Mapper - Complete Schema-TypeScript Mapping
 *
 * Implements MPLP dual naming convention with cross-cutting concerns integration
 */
export class CollabMapper {
  /**
   * TypeScript Entity → Schema Format (camelCase → snake_case)
   */
  static toSchema(entity: CollabEntityData): CollabSchema {
    return {
      // ===== BASIC PROTOCOL FIELDS =====
      collaboration_id: entity.collaborationId,
      protocol_version: entity.protocolVersion,
      timestamp: entity.timestamp.toISOString(),
      context_id: entity.contextId,
      plan_id: entity.planId,
      name: entity.name,
      description: entity.description,
      mode: entity.mode,
      status: entity.status,

      // ===== COLLABORATION SPECIFIC FIELDS =====
      participants: entity.participants.map(p => this.mapParticipantToSchema(p)),
      coordination_strategy: this.mapCoordinationStrategyToSchema(entity.coordinationStrategy),

      // ===== CROSS-CUTTING CONCERNS FIELDS =====
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

  /**
   * Schema Format → TypeScript Entity (snake_case → camelCase)
   */
  static fromSchema(schema: CollabSchema): CollabEntityData {
    return {
      // ===== BASIC PROTOCOL FIELDS =====
      id: schema.collaboration_id as UUID, // Map collaboration_id to both id and collaborationId
      collaborationId: schema.collaboration_id as UUID,
      protocolVersion: schema.protocol_version,
      timestamp: new Date(schema.timestamp),
      contextId: schema.context_id as UUID,
      planId: schema.plan_id as UUID,
      name: schema.name,
      description: schema.description,
      mode: schema.mode,
      status: schema.status,

      // ===== COLLABORATION SPECIFIC FIELDS =====
      participants: schema.participants.map(p => this.mapParticipantFromSchema(p)),
      coordinationStrategy: this.mapCoordinationStrategyFromSchema(schema.coordination_strategy),

      // ===== CROSS-CUTTING CONCERNS FIELDS =====
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

  /**
   * Validate Schema format
   */
  static validateSchema(data: unknown): data is CollabSchema {
    if (!data || typeof data !== 'object') return false;

    const schema = data as Record<string, unknown>;

    // Check required fields
    const requiredFields = [
      'collaboration_id', 'protocol_version', 'timestamp', 'context_id',
      'plan_id', 'name', 'mode', 'participants', 'coordination_strategy',
      'status', 'created_at', 'created_by', 'audit_trail',
      'monitoring_integration', 'performance_metrics', 'version_history',
      'search_metadata', 'collab_operation', 'event_integration'
    ];

    return requiredFields.every(field => field in schema);
  }

  // ===== PARTICIPANT MAPPING =====
  private static mapParticipantToSchema(participant: CollabParticipantEntityData): CollabParticipantSchema {
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

  private static mapParticipantFromSchema(schema: CollabParticipantSchema): CollabParticipantEntityData {
    return {
      participantId: schema.participant_id as UUID,
      agentId: schema.agent_id as UUID,
      roleId: schema.role_id as UUID,
      status: schema.status,
      capabilities: schema.capabilities,
      joinedAt: new Date(schema.joined_at),
      lastActivity: schema.last_activity ? new Date(schema.last_activity) : undefined
    };
  }

  // ===== COORDINATION STRATEGY MAPPING =====
  private static mapCoordinationStrategyToSchema(strategy: CollabCoordinationStrategyEntityData): CollabCoordinationStrategySchema {
    return {
      type: strategy.type,
      coordinator_id: strategy.coordinatorId,
      decision_making: strategy.decisionMaking
    };
  }

  private static mapCoordinationStrategyFromSchema(schema: CollabCoordinationStrategySchema): CollabCoordinationStrategyEntityData {
    return {
      type: schema.type,
      coordinatorId: schema.coordinator_id as UUID,
      decisionMaking: schema.decision_making
    };
  }

  // ===== AUDIT TRAIL MAPPING =====
  private static mapAuditTrailToSchema(auditTrail: CollabAuditTrailEntityData): CollabAuditTrailSchema {
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

  private static mapAuditTrailFromSchema(schema: CollabAuditTrailSchema): CollabAuditTrailEntityData {
    return {
      enabled: schema.enabled,
      retentionDays: schema.retention_days,
      events: schema.events.map(event => ({
        eventId: event.event_id as UUID,
        eventType: event.event_type,
        timestamp: new Date(event.timestamp),
        userId: event.user_id as UUID,
        details: event.details
      }))
    };
  }

  // ===== MONITORING INTEGRATION MAPPING =====
  private static mapMonitoringIntegrationToSchema(monitoring: CollabMonitoringIntegrationEntityData): CollabMonitoringIntegrationSchema {
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

  private static mapMonitoringIntegrationFromSchema(schema: CollabMonitoringIntegrationSchema): CollabMonitoringIntegrationEntityData {
    return {
      enabled: schema.enabled,
      traceId: schema.trace_id as UUID,
      metricsCollection: schema.metrics_collection,
      alerting: {
        enabled: schema.alerting.enabled,
        thresholds: schema.alerting.thresholds
      }
    };
  }

  // ===== PERFORMANCE METRICS MAPPING =====
  private static mapPerformanceMetricsToSchema(metrics: CollabPerformanceMetricsEntityData): CollabPerformanceMetricsSchema {
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

  private static mapPerformanceMetricsFromSchema(schema: CollabPerformanceMetricsSchema): CollabPerformanceMetricsEntityData {
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

  // ===== VERSION HISTORY MAPPING =====
  private static mapVersionHistoryToSchema(versionHistory: CollabVersionHistoryEntityData): CollabVersionHistorySchema {
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

  private static mapVersionHistoryFromSchema(schema: CollabVersionHistorySchema): CollabVersionHistoryEntityData {
    return {
      enabled: schema.enabled,
      maxVersions: schema.max_versions,
      versions: schema.versions.map(version => ({
        versionId: version.version_id as UUID,
        versionNumber: version.version_number,
        createdAt: new Date(version.created_at),
        createdBy: version.created_by,
        changes: version.changes
      }))
    };
  }

  // ===== SEARCH METADATA MAPPING =====
  private static mapSearchMetadataToSchema(searchMetadata: CollabSearchMetadataEntityData): CollabSearchMetadataSchema {
    return {
      enabled: searchMetadata.enabled,
      indexed_fields: searchMetadata.indexedFields,
      search_tags: searchMetadata.searchTags,
      full_text_search: searchMetadata.fullTextSearch
    };
  }

  private static mapSearchMetadataFromSchema(schema: CollabSearchMetadataSchema): CollabSearchMetadataEntityData {
    return {
      enabled: schema.enabled,
      indexedFields: schema.indexed_fields,
      searchTags: schema.search_tags,
      fullTextSearch: schema.full_text_search
    };
  }

  // ===== OPERATION MAPPING =====
  private static mapOperationToSchema(operation: CollabOperationEntityData): CollabOperationSchema {
    return {
      operation_id: operation.operationId,
      operation_type: operation.operationType,
      status: operation.status,
      started_at: operation.startedAt.toISOString(),
      completed_at: operation.completedAt?.toISOString(),
      result: operation.result
    };
  }

  private static mapOperationFromSchema(schema: CollabOperationSchema): CollabOperationEntityData {
    return {
      operationId: schema.operation_id as UUID,
      operationType: schema.operation_type,
      status: schema.status,
      startedAt: new Date(schema.started_at),
      completedAt: schema.completed_at ? new Date(schema.completed_at) : undefined,
      result: schema.result
    };
  }

  // ===== EVENT INTEGRATION MAPPING =====
  private static mapEventIntegrationToSchema(eventIntegration: CollabEventIntegrationEntityData): CollabEventIntegrationSchema {
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

  private static mapEventIntegrationFromSchema(schema: CollabEventIntegrationSchema): CollabEventIntegrationEntityData {
    return {
      enabled: schema.enabled,
      subscribedEvents: schema.subscribed_events,
      publishedEvents: schema.published_events,
      eventRouting: {
        routingRules: schema.event_routing.routing_rules.map(rule => ({
          ruleId: rule.rule_id as UUID,
          condition: rule.condition,
          targetTopic: rule.target_topic,
          enabled: rule.enabled
        }))
      }
    };
  }

  // ===== DTO MAPPING METHODS =====

  /**
   * Create DTO → Entity Data
   */
  static fromCreateDTO(dto: CollabCreateDTO): Partial<CollabEntityData> {
    return {
      contextId: dto.contextId,
      planId: dto.planId,
      name: dto.name,
      description: dto.description,
      mode: dto.mode,
      participants: dto.participants.map(p => ({
        participantId: generateUUID(),
        agentId: p.agentId,
        roleId: p.roleId,
        status: 'pending' as const,
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

  /**
   * Update DTO → Partial Entity Data
   */
  static fromUpdateDTO(dto: CollabUpdateDTO): Partial<CollabEntityData> {
    const updateData: Partial<CollabEntityData> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.mode !== undefined) updateData.mode = dto.mode;
    if (dto.status !== undefined) updateData.status = dto.status;

    if (dto.participants) {
      updateData.participants = dto.participants.map(p => ({
        participantId: p.participantId,
        agentId: '' as UUID, // Will be filled from existing data
        roleId: '' as UUID, // Will be filled from existing data
        status: p.status || 'active',
        capabilities: p.capabilities,
        joinedAt: new Date(), // Will be filled from existing data
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

  /**
   * Entity → Response DTO
   */
  static toResponseDTO(entity: CollabEntity): CollabResponseDTO {
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
      createdAt: new Date().toISOString(), // TODO: Add createdAt to entity
      createdBy: entity.createdBy,
      updatedAt: entity.updatedBy ? new Date().toISOString() : undefined, // TODO: Add updatedAt to entity
      updatedBy: entity.updatedBy
    };
  }

  /**
   * Batch conversion: Entity Array → Response DTO Array
   */
  static toResponseDTOArray(entities: CollabEntity[]): CollabResponseDTO[] {
    return entities.map(entity => this.toResponseDTO(entity));
  }

  /**
   * Batch conversion: Schema Array → Entity Array
   */
  static fromSchemaArray(schemas: CollabSchema[]): CollabEntityData[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  /**
   * Batch conversion: Entity Array → Schema Array
   */
  static toSchemaArray(entities: CollabEntityData[]): CollabSchema[] {
    return entities.map(entity => this.toSchema(entity));
  }
}

// Import DTO types for mapping
import {
  CollabCreateDTO,
  CollabUpdateDTO,
  CollabResponseDTO
} from '../dto/collab.dto';
