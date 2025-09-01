/**
 * Network映射器
 * 
 * @description Network模块的Schema-TypeScript双向映射器，基于DDD架构
 * @version 1.0.0
 * @layer API层 - 映射器
 */

import { NetworkEntity, NetworkNode, NetworkEdge } from '../../domain/entities/network.entity';
import {
  NodeType,
  NodeStatus,
  NodeCapability,
  CommunicationProtocol,
  NetworkTopology,
  NetworkStatus,
  DiscoveryType,
  RoutingAlgorithm,
  LoadBalancingStrategy,
  NetworkOperation
} from '../../types';
import {
  NetworkDto,
  NetworkNodeDto as _NetworkNodeDto,
  NetworkEdgeDto as _NetworkEdgeDto,
  NodeAddressDto as _NodeAddressDto,
  DiscoveryMechanismDto as _DiscoveryMechanismDto,
  RoutingStrategyDto as _RoutingStrategyDto,
  PerformanceMetricsDto as _PerformanceMetricsDto,
  MonitoringIntegrationDto as _MonitoringIntegrationDto,
  AuditTrailEntryDto as _AuditTrailEntryDto,
  VersionHistoryEntryDto as _VersionHistoryEntryDto,
  SearchMetadataDto as _SearchMetadataDto,
  EventIntegrationDto as _EventIntegrationDto
} from '../dto/network.dto';

/**
 * Network Schema接口 (snake_case) - 基于mplp-network.json
 */
export interface NetworkSchema {
  network_id: string;
  protocol_version: string;
  timestamp: string;
  context_id: string;
  name: string;
  description?: string;
  topology: string;
  nodes: Array<{
    node_id: string;
    agent_id: string;
    node_type: string;
    status: string;
    capabilities: string[];
    address?: {
      host: string;
      port: number;
      protocol: string;
    };
    metadata: { [key: string]: unknown };
  }>;
  edges?: Array<{
    edge_id: string;
    source_node_id: string;
    target_node_id: string;
    edge_type: string;
    direction: string;
    status: string;
    weight: number;
    metadata: { [key: string]: unknown };
  }>;
  discovery_mechanism: {
    type: string;
    enabled: boolean;
    configuration: { [key: string]: unknown };
  };
  routing_strategy: {
    algorithm: string;
    load_balancing: string;
    configuration: { [key: string]: unknown };
  };
  status: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
  audit_trail: Array<{
    timestamp: string;
    action: string;
    actor: string;
    details: { [key: string]: unknown };
  }>;
  monitoring_integration: {
    enabled: boolean;
    endpoints: string[];
    configuration: { [key: string]: unknown };
  };
  performance_metrics: {
    enabled: boolean;
    collection_interval_seconds: number;
    metrics: { [key: string]: unknown };
  };
  version_history: Array<{
    version: string;
    timestamp: string;
    changes: string[];
    author: string;
  }>;
  search_metadata: {
    tags: string[];
    keywords: string[];
    categories: string[];
    indexed: boolean;
  };
  network_operation: string;
  event_integration: {
    enabled: boolean;
    event_types: string[];
    configuration: { [key: string]: unknown };
  };
}

/**
 * Network映射器类
 */
export class NetworkMapper {
  /**
   * 将NetworkEntity转换为Schema格式 (snake_case)
   */
  static toSchema(entity: NetworkEntity): NetworkSchema {
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

  /**
   * 将Schema格式转换为NetworkEntity (snake_case -> camelCase)
   */
  static fromSchema(schema: NetworkSchema): NetworkEntity {
    // 创建节点实体
    const nodes = schema.nodes.map(nodeSchema => 
      new NetworkNode(
        nodeSchema.node_id,
        nodeSchema.agent_id,
        nodeSchema.node_type as NodeType,
        nodeSchema.status as NodeStatus,
        nodeSchema.capabilities as NodeCapability[],
        nodeSchema.address ? {
          host: nodeSchema.address.host,
          port: nodeSchema.address.port,
          protocol: nodeSchema.address.protocol as CommunicationProtocol
        } : undefined,
        nodeSchema.metadata
      )
    );

    // 创建边缘连接实体
    const edges = (schema.edges || []).map(edgeSchema =>
      new NetworkEdge(
        edgeSchema.edge_id,
        edgeSchema.source_node_id,
        edgeSchema.target_node_id,
        edgeSchema.edge_type,
        edgeSchema.direction as 'bidirectional' | 'unidirectional',
        edgeSchema.status,
        edgeSchema.weight,
        edgeSchema.metadata
      )
    );

    // 创建网络实体
    return new NetworkEntity({
      networkId: schema.network_id,
      protocolVersion: schema.protocol_version,
      timestamp: new Date(schema.timestamp),
      contextId: schema.context_id,
      name: schema.name,
      topology: schema.topology as NetworkTopology,
      nodes,
      discoveryMechanism: {
        type: schema.discovery_mechanism.type as DiscoveryType,
        enabled: schema.discovery_mechanism.enabled,
        configuration: schema.discovery_mechanism.configuration
      },
      routingStrategy: {
        algorithm: schema.routing_strategy.algorithm as RoutingAlgorithm,
        loadBalancing: schema.routing_strategy.load_balancing as LoadBalancingStrategy,
        configuration: schema.routing_strategy.configuration
      },
      status: schema.status as NetworkStatus,
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
      networkOperation: schema.network_operation as NetworkOperation,
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

  /**
   * 将NetworkEntity转换为DTO格式 (camelCase)
   */
  static toDto(entity: NetworkEntity): NetworkDto {
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

  /**
   * 验证Schema格式数据
   */
  static validateSchema(schema: unknown): schema is NetworkSchema {
    if (!schema || typeof schema !== 'object') {
      return false;
    }

    const s = schema as Record<string, unknown>;
    return (
      typeof s.network_id === 'string' &&
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
      typeof s.created_by === 'string'
    );
  }

  /**
   * 批量转换为Schema格式
   */
  static toSchemaArray(entities: NetworkEntity[]): NetworkSchema[] {
    return entities.map(entity => this.toSchema(entity));
  }

  /**
   * 批量转换为Entity格式
   */
  static fromSchemaArray(schemas: NetworkSchema[]): NetworkEntity[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  /**
   * 批量转换为DTO格式
   */
  static toDtoArray(entities: NetworkEntity[]): NetworkDto[] {
    return entities.map(entity => this.toDto(entity));
  }
}
