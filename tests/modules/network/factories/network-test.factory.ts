// Network测试工厂 - 统一测试数据生成
// 基于MPLP v1.0统一测试标准，与其他8个已完成模块使用IDENTICAL测试模式

import { v4 as uuidv4 } from 'uuid';
import { NetworkEntity, NetworkNode, NetworkEdge, NetworkEntityData } from '../../../../src/modules/network/domain/entities/network.entity';
import { NetworkEntityData, NetworkNodeEntityData, NetworkEdgeEntityData, DiscoveryMechanismEntityData, RoutingStrategyEntityData, NetworkSchema } from '../../../../src/modules/network/api/mappers/network.mapper';

// 添加DTO类型定义
interface CreateNetworkDto {
  contextId: string;
  name: string;
  description?: string;
  topology: string;
  nodes: any[];
  discoveryMechanism: any;
  routingStrategy: any;
  createdBy: string;
}

/**
 * Network模块测试数据工厂
 * 基于统一测试标准模板实现，确保测试数据的一致性和完整性
 */
export class NetworkTestFactory {
  /**
   * 创建标准Network实体数据
   * @param overrides 可选的覆盖数据
   * @returns NetworkEntityData
   */
  static createNetworkEntityData(overrides?: Partial<NetworkEntityData>): NetworkEntityData {
    const defaultData: NetworkEntityData = {
      networkId: uuidv4(),
      protocolVersion: '1.0.0',
      timestamp: new Date(),
      contextId: uuidv4(),
      name: 'Test Network',
      description: 'Test network for unit testing',
      topology: 'star',
      nodes: [
        this.createNetworkNodeEntity(),
        this.createNetworkNodeEntity({ nodeType: 'worker' })
      ],
      edges: [
        this.createNetworkEdgeEntity()
      ],
      discoveryMechanism: {
        type: 'registry',
        enabled: true,
        configuration: {}
      },
      routingStrategy: {
        algorithm: 'shortest_path',
        loadBalancing: 'round_robin',
        configuration: {}
      },
      status: 'active',
      createdAt: new Date(),
      createdBy: uuidv4(),
      auditTrail: [],
      monitoringIntegration: {
        enabled: true,
        endpoints: [],
        configuration: {}
      },
      performanceMetrics: {
        enabled: true,
        collectionIntervalSeconds: 60,
        metrics: {}
      },
      versionHistory: [],
      searchMetadata: {
        tags: [],
        keywords: [],
        categories: [],
        indexed: false
      },
      networkOperation: 'connect',
      eventIntegration: {
        enabled: true,
        eventTypes: [],
        configuration: {}
      }
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * 创建Network实体
   * @param overrides 可选的覆盖数据
   * @returns NetworkEntity
   */
  static createNetworkEntity(overrides?: Partial<NetworkEntityData>): NetworkEntity {
    const data = this.createNetworkEntityData(overrides);
    return new NetworkEntity(data);
  }

  /**
   * 创建NetworkNode实体
   */
  static createNetworkNodeEntity(overrides: any = {}): NetworkNode {
    return new NetworkNode(
      overrides.nodeId || uuidv4(),
      overrides.agentId || uuidv4(),
      overrides.nodeType || 'coordinator',
      overrides.status || 'online',
      overrides.capabilities || ['routing', 'monitoring'],
      overrides.address || {
        host: '127.0.0.1',
        port: 8080,
        protocol: 'http'
      },
      overrides.metadata || {}
    );
  }

  /**
   * 创建NetworkEdge实体
   */
  static createNetworkEdgeEntity(overrides: any = {}): NetworkEdge {
    return new NetworkEdge(
      overrides.edgeId || uuidv4(),
      overrides.sourceNodeId || uuidv4(),
      overrides.targetNodeId || uuidv4(),
      overrides.edgeType || 'data',
      overrides.direction || 'bidirectional',
      overrides.status || 'active',
      overrides.weight || 1,
      overrides.metadata || {}
    );
  }

  /**
   * 创建Network Schema数据
   * @param overrides 可选的覆盖数据
   * @returns NetworkSchema
   */
  static createNetworkSchema(overrides?: Partial<any>): NetworkSchema {
    const entityData = this.createNetworkEntityData();
    const defaultSchema: NetworkSchema = {
      network_id: entityData.networkId,
      protocol_version: entityData.protocolVersion,
      timestamp: entityData.timestamp,
      context_id: entityData.contextId,
      name: entityData.name,
      description: entityData.description,
      topology: entityData.topology,
      nodes: entityData.nodes.map(node => ({
        node_id: node.nodeId,
        agent_id: node.agentId,
        node_type: node.nodeType as any,
        status: node.status as any,
        capabilities: node.capabilities,
        address: node.address,
        metadata: node.metadata
      })),
      edges: entityData.edges?.map(edge => ({
        edge_id: edge.edgeId,
        source_node_id: edge.sourceNodeId,
        target_node_id: edge.targetNodeId,
        edge_type: edge.edgeType as any,
        direction: edge.direction as any,
        status: edge.status as any,
        weight: edge.weight,
        metadata: edge.metadata
      })),
      discovery_mechanism: {
        type: entityData.discoveryMechanism.type as any,
        registry_config: entityData.discoveryMechanism.registryConfig ? {
          endpoint: entityData.discoveryMechanism.registryConfig.endpoint,
          authentication: entityData.discoveryMechanism.registryConfig.authentication,
          refresh_interval: entityData.discoveryMechanism.registryConfig.refreshInterval
        } : undefined
      },
      routing_strategy: {
        algorithm: entityData.routingStrategy.algorithm as any,
        load_balancing: entityData.routingStrategy.loadBalancing ? {
          method: entityData.routingStrategy.loadBalancing.method as any
        } : undefined
      },
      status: entityData.status as any,
      created_at: entityData.createdAt,
      updated_at: entityData.updatedAt,
      created_by: entityData.createdBy,
      metadata: entityData.metadata,
      audit_trail: entityData.auditTrail as any,
      monitoring_integration: entityData.monitoringIntegration as any,
      performance_metrics: entityData.performanceMetrics as any,
      version_history: entityData.versionHistory as any,
      search_metadata: entityData.searchMetadata as any,
      network_operation: entityData.networkOperation as any,
      network_details: entityData.networkDetails as any,
      event_integration: entityData.eventIntegration as any
    };

    return { ...defaultSchema, ...overrides };
  }

  /**
   * 创建网络节点实体数据
   * @param overrides 可选的覆盖数据
   * @returns NetworkNodeEntityData
   */
  static createNetworkNodeEntityData(overrides?: Partial<NetworkNodeEntityData>): NetworkNodeEntityData {
    const defaultData: NetworkNodeEntityData = {
      nodeId: uuidv4(),
      agentId: uuidv4(),
      nodeType: 'coordinator',
      status: 'online',
      capabilities: ['routing', 'monitoring'],
      address: {
        host: '127.0.0.1',
        port: 8080,
        protocol: 'http'
      },
      metadata: {
        region: 'us-east-1',
        zone: 'a'
      }
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * 创建网络连接实体数据
   * @param overrides 可选的覆盖数据
   * @returns NetworkEdgeEntityData
   */
  static createNetworkEdgeEntityData(overrides?: Partial<NetworkEdgeEntityData>): NetworkEdgeEntityData {
    const defaultData: NetworkEdgeEntityData = {
      edgeId: uuidv4(),
      sourceNodeId: uuidv4(),
      targetNodeId: uuidv4(),
      edgeType: 'data',
      direction: 'bidirectional',
      status: 'active',
      weight: 1.0,
      metadata: {
        bandwidth: '1Gbps',
        latency: '10ms'
      }
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * 创建发现机制实体数据
   * @param overrides 可选的覆盖数据
   * @returns DiscoveryMechanismEntityData
   */
  static createDiscoveryMechanismEntityData(overrides?: Partial<DiscoveryMechanismEntityData>): DiscoveryMechanismEntityData {
    const defaultData: DiscoveryMechanismEntityData = {
      type: 'registry',
      registryConfig: {
        endpoint: 'http://registry.example.com',
        authentication: true,
        refreshInterval: 30
      }
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * 创建路由策略实体数据
   * @param overrides 可选的覆盖数据
   * @returns RoutingStrategyEntityData
   */
  static createRoutingStrategyEntityData(overrides?: Partial<RoutingStrategyEntityData>): RoutingStrategyEntityData {
    const defaultData: RoutingStrategyEntityData = {
      algorithm: 'shortest_path',
      loadBalancing: {
        method: 'round_robin'
      }
    };

    return { ...defaultData, ...overrides };
  }

  /**
   * 创建Network实体数组
   * @param count 数组长度，默认3个
   * @returns NetworkEntity[]
   */
  static createNetworkEntityArray(count: number = 3): NetworkEntity[] {
    return Array.from({ length: count }, (_, index) => 
      this.createNetworkEntity({
        name: `Test Network ${index + 1}`,
        topology: ['star', 'mesh', 'tree'][index % 3] as any
      })
    );
  }

  /**
   * 创建性能测试数据
   * @param count 数据量，默认1000个
   * @returns NetworkEntity[]
   */
  static createPerformanceTestData(count: number = 1000): NetworkEntity[] {
    return Array.from({ length: count }, (_, index) => 
      this.createNetworkEntity({
        name: `Performance Test Network ${index + 1}`,
        nodes: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, () => 
          this.createNetworkNodeEntityData()
        )
      })
    );
  }

  /**
   * 创建边界测试数据
   * @returns 包含最小和最大配置的测试数据
   */
  static createBoundaryTestData(): { minimalNetwork: NetworkEntity; maximalNetwork: NetworkEntity } {
    const minimalNetwork = this.createNetworkEntity({
      name: 'Minimal Network',
      description: undefined,
      nodes: [this.createNetworkNodeEntityData()],
      edges: undefined,
      metadata: undefined
    });

    const maximalNetwork = this.createNetworkEntity({
      name: 'Maximal Network',
      description: 'Network with maximum configuration for boundary testing',
      topology: 'hierarchical',
      nodes: Array.from({ length: 100 }, (_, i) => 
        this.createNetworkNodeEntityData({
          nodeType: ['coordinator', 'worker', 'gateway', 'relay', 'monitor', 'backup'][i % 6] as any,
          capabilities: ['routing', 'monitoring', 'load_balancing', 'security', 'analytics']
        })
      ),
      edges: Array.from({ length: 200 }, () => this.createNetworkEdgeEntityData()),
      metadata: {
        environment: 'production',
        region: 'global',
        compliance: ['SOC2', 'GDPR', 'HIPAA'],
        tags: ['critical', 'high-availability', 'multi-region']
      }
    });

    return { minimalNetwork, maximalNetwork };
  }

  /**
   * 创建错误场景测试数据
   * @returns 包含各种错误场景的测试数据
   */
  static createErrorScenarioData(): {
    invalidNetwork: any;
    networkWithInvalidNodes: NetworkEntityData;
    networkWithCircularEdges: NetworkEntityData;
  } {
    const invalidNetwork = {
      // 缺少必需字段
      name: 'Invalid Network'
      // 缺少 networkId, protocolVersion 等必需字段
    };

    const networkWithInvalidNodes = this.createNetworkEntityData({
      nodes: [
        {
          ...this.createNetworkNodeEntityData(),
          nodeId: '', // 无效的节点ID
          status: 'invalid_status' as any // 无效的状态
        }
      ]
    });

    const nodeIds = [uuidv4(), uuidv4()];
    const networkWithCircularEdges = this.createNetworkEntityData({
      nodes: nodeIds.map(id => this.createNetworkNodeEntityData({ nodeId: id })),
      edges: [
        this.createNetworkEdgeEntityData({
          sourceNodeId: nodeIds[0],
          targetNodeId: nodeIds[1]
        }),
        this.createNetworkEdgeEntityData({
          sourceNodeId: nodeIds[1],
          targetNodeId: nodeIds[0]
        })
      ]
    });

    return {
      invalidNetwork,
      networkWithInvalidNodes,
      networkWithCircularEdges
    };
  }

  /**
   * 创建不同拓扑类型的测试数据
   * @returns 包含所有拓扑类型的测试数据
   */
  static createTopologyTestData(): Record<string, NetworkEntity> {
    const topologies: Array<'star' | 'mesh' | 'tree' | 'ring' | 'bus' | 'hybrid' | 'hierarchical'> = 
      ['star', 'mesh', 'tree', 'ring', 'bus', 'hybrid', 'hierarchical'];

    const result: Record<string, NetworkEntity> = {};

    topologies.forEach(topology => {
      result[topology] = this.createNetworkEntity({
        name: `${topology.charAt(0).toUpperCase() + topology.slice(1)} Network`,
        topology,
        nodes: Array.from({ length: topology === 'star' ? 5 : 8 }, () => 
          this.createNetworkNodeEntityData()
        )
      });
    });

    return result;
  }

  /**
   * 创建网络数据 (用于服务层测试)
   */
  static createNetworkData(overrides: Partial<CreateNetworkDto> = {}): CreateNetworkDto {
    return this.createNetworkDto(overrides);
  }

  /**
   * 创建网络DTO (用于控制器测试)
   */
  static createNetworkDto(overrides: Partial<CreateNetworkDto> = {}): CreateNetworkDto {
    return {
      contextId: overrides.contextId || `context-${Date.now()}`,
      name: overrides.name || 'Test Network',
      description: overrides.description || 'Test network description',
      topology: overrides.topology || 'star',
      nodes: overrides.nodes || [
        {
          agentId: 'agent-001',
          nodeType: 'coordinator',
          capabilities: ['compute', 'coordination'],
          address: {
            host: 'localhost',
            port: 8001,
            protocol: 'http'
          }
        },
        {
          agentId: 'agent-002',
          nodeType: 'worker',
          capabilities: ['compute'],
          address: {
            host: 'localhost',
            port: 8002,
            protocol: 'http'
          }
        }
      ],
      discoveryMechanism: overrides.discoveryMechanism || {
        type: 'registry',
        enabled: true,
        configuration: {}
      },
      routingStrategy: overrides.routingStrategy || {
        algorithm: 'shortest_path',
        loadBalancing: 'round_robin',
        configuration: {}
      },
      createdBy: overrides.createdBy || 'test-user'
    };
  }

  /**
   * 创建节点数据 (用于服务层测试)
   */
  static createNodeData(overrides: any = {}): any {
    return {
      agentId: overrides.agentId || uuidv4(),
      nodeType: overrides.nodeType || 'worker',
      capabilities: overrides.capabilities || ['compute'],
      address: overrides.address || {
        host: 'localhost',
        port: 8000 + Math.floor(Math.random() * 1000),
        protocol: 'http'
      }
    };
  }

  /**
   * 创建边缘数据 (用于服务层测试)
   */
  static createEdgeData(overrides: any = {}): any {
    return {
      sourceNodeId: overrides.sourceNodeId || 'source-node-id',
      targetNodeId: overrides.targetNodeId || 'target-node-id',
      edgeType: overrides.edgeType || 'data',
      direction: overrides.direction || 'bidirectional',
      weight: overrides.weight || 1.0
    };
  }

  /**
   * 创建带有节点的网络实体 (用于路由测试)
   */
  static createNetworkEntityWithNodes(overrides?: Partial<NetworkEntityData>): NetworkEntity {
    const nodeIds = ['node-1', 'node-2', 'node-3'];
    const nodes = nodeIds.map(nodeId => this.createNetworkNodeEntity({ nodeId }));
    const edges = [
      this.createNetworkEdgeEntity({
        sourceNodeId: nodeIds[0],
        targetNodeId: nodeIds[1],
        weight: 1,
        metadata: { latency: 10, bandwidth: 100, reliability: 0.99 }
      }),
      this.createNetworkEdgeEntity({
        sourceNodeId: nodeIds[1],
        targetNodeId: nodeIds[2],
        weight: 2,
        metadata: { latency: 20, bandwidth: 50, reliability: 0.95 }
      })
    ];

    return this.createNetworkEntity({
      nodes,
      edges,
      ...overrides
    });
  }

  /**
   * 创建网络Schema (用于Mapper测试)
   */
  static createNetworkSchemaData(overrides: any = {}): any {
    return {
      network_id: overrides.network_id || uuidv4(),
      protocol_version: overrides.protocol_version || '1.0.0',
      timestamp: overrides.timestamp || new Date().toISOString(),
      context_id: overrides.context_id || uuidv4(),
      name: overrides.name || 'Test Network',
      description: overrides.description || 'Test network description',
      topology: overrides.topology || 'star',
      nodes: overrides.nodes || [
        {
          node_id: uuidv4(),
          agent_id: uuidv4(),
          node_type: 'coordinator',
          status: 'online',
          capabilities: ['routing', 'monitoring'],
          address: {
            host: '127.0.0.1',
            port: 8080,
            protocol: 'http'
          },
          metadata: {}
        }
      ],
      edges: overrides.edges || [
        {
          edge_id: uuidv4(),
          source_node_id: uuidv4(),
          target_node_id: uuidv4(),
          edge_type: 'data',
          direction: 'bidirectional',
          status: 'active',
          weight: 1,
          metadata: {}
        }
      ],
      discovery_mechanism: overrides.discovery_mechanism || {
        type: 'registry',
        enabled: true,
        configuration: {}
      },
      routing_strategy: overrides.routing_strategy || {
        algorithm: 'shortest_path',
        load_balancing: 'round_robin',
        configuration: {}
      },
      status: overrides.status || 'active',
      created_at: overrides.created_at || new Date().toISOString(),
      updated_at: overrides.updated_at,
      created_by: overrides.created_by || uuidv4(),
      audit_trail: overrides.audit_trail || [],
      monitoring_integration: overrides.monitoring_integration || {
        enabled: true,
        endpoints: [],
        configuration: {}
      },
      performance_metrics: overrides.performance_metrics || {
        enabled: true,
        collection_interval_seconds: 60,
        metrics: {}
      },
      version_history: overrides.version_history || [],
      search_metadata: overrides.search_metadata || {
        tags: [],
        keywords: [],
        categories: [],
        indexed: false
      },
      network_operation: overrides.network_operation || 'connect',
      event_integration: overrides.event_integration || {
        enabled: true,
        event_types: [],
        configuration: {}
      }
    };
  }
}
