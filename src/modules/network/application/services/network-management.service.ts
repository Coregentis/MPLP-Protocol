/**
 * Network管理服务
 * 
 * @description Network模块的核心业务逻辑服务，基于DDD架构
 * @version 1.0.0
 * @layer 应用层 - 服务
 */

import { NetworkEntity, NetworkNode, NetworkEdge } from '../../domain/entities/network.entity';
import { INetworkRepository } from '../../domain/repositories/network-repository.interface';
import {
  NetworkTopology,
  NodeType,
  NodeStatus,
  NodeCapability,
  NodeAddress,
  NetworkStatus,
  DiscoveryMechanism,
  RoutingStrategy,
  PerformanceMetrics,
  MonitoringIntegration,
  SearchMetadata,
  EventIntegration,
  NetworkOperation as _NetworkOperation
} from '../../types';

/**
 * 创建网络的数据传输对象
 */
export interface CreateNetworkData {
  contextId: string;
  name: string;
  description?: string;
  topology: NetworkTopology;
  nodes: Array<{
    agentId: string;
    nodeType: NodeType;
    capabilities?: string[];
    address?: {
      host: string;
      port: number;
      protocol: string;
    };
  }>;
  discoveryMechanism: DiscoveryMechanism;
  routingStrategy: RoutingStrategy;
  createdBy: string;
}

/**
 * 更新网络的数据传输对象
 */
export interface UpdateNetworkData {
  name?: string;
  description?: string;
  status?: NetworkStatus;
  discoveryMechanism?: DiscoveryMechanism;
  routingStrategy?: RoutingStrategy;
  performanceMetrics?: PerformanceMetrics;
  monitoringIntegration?: MonitoringIntegration;
  searchMetadata?: SearchMetadata;
  eventIntegration?: EventIntegration;
}

/**
 * Network管理服务
 */
export class NetworkManagementService {
  constructor(
    private readonly networkRepository: INetworkRepository
  ) {}

  /**
   * 创建新网络
   */
  async createNetwork(data: CreateNetworkData): Promise<NetworkEntity> {
    // 生成网络ID
    const networkId = this.generateNetworkId();
    
    // 创建节点实体
    const nodes = data.nodes.map(nodeData => {
      const nodeId = this.generateNodeId();
      return new NetworkNode(
        nodeId,
        nodeData.agentId,
        nodeData.nodeType,
        'offline', // 初始状态为离线
        nodeData.capabilities as NodeCapability[] || [],
        nodeData.address as NodeAddress,
        {}
      );
    });

    // 创建网络实体
    const network = new NetworkEntity({
      networkId,
      protocolVersion: '1.0.0',
      timestamp: new Date(),
      contextId: data.contextId,
      name: data.name,
      topology: data.topology,
      nodes,
      discoveryMechanism: data.discoveryMechanism,
      routingStrategy: data.routingStrategy,
      status: 'pending',
      createdAt: new Date(),
      createdBy: data.createdBy,
      auditTrail: [],
      monitoringIntegration: { enabled: false, endpoints: [], configuration: {} },
      performanceMetrics: { enabled: false, collectionIntervalSeconds: 60, metrics: {} },
      versionHistory: [],
      searchMetadata: { tags: [], keywords: [], categories: [], indexed: false },
      networkOperation: 'connect',
      eventIntegration: { enabled: false, eventTypes: [], configuration: {} },
      description: data.description,
      edges: [],
      updatedAt: undefined
    });

    // 保存到仓储
    return await this.networkRepository.save(network);
  }

  /**
   * 根据ID获取网络
   */
  async getNetworkById(networkId: string): Promise<NetworkEntity | null> {
    return await this.networkRepository.findById(networkId);
  }

  /**
   * 根据名称获取网络
   */
  async getNetworkByName(name: string): Promise<NetworkEntity | null> {
    return await this.networkRepository.findByName(name);
  }

  /**
   * 根据上下文ID获取网络列表
   */
  async getNetworksByContextId(contextId: string): Promise<NetworkEntity[]> {
    return await this.networkRepository.findByContextId(contextId);
  }

  /**
   * 更新网络
   */
  async updateNetwork(networkId: string, data: UpdateNetworkData): Promise<NetworkEntity | null> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      return null;
    }

    // 更新网络属性
    if (data.name !== undefined) {
      network.name = data.name;
    }
    if (data.description !== undefined) {
      network.description = data.description;
    }
    if (data.status !== undefined) {
      network.updateStatus(data.status);
    }
    if (data.discoveryMechanism !== undefined) {
      network.discoveryMechanism = data.discoveryMechanism;
    }
    if (data.routingStrategy !== undefined) {
      network.routingStrategy = data.routingStrategy;
    }
    if (data.performanceMetrics !== undefined) {
      network.performanceMetrics = data.performanceMetrics;
    }
    if (data.monitoringIntegration !== undefined) {
      network.monitoringIntegration = data.monitoringIntegration;
    }
    if (data.searchMetadata !== undefined) {
      network.searchMetadata = data.searchMetadata;
    }
    if (data.eventIntegration !== undefined) {
      network.eventIntegration = data.eventIntegration;
    }

    network.updatedAt = new Date();

    return await this.networkRepository.save(network);
  }

  /**
   * 删除网络
   */
  async deleteNetwork(networkId: string): Promise<boolean> {
    return await this.networkRepository.delete(networkId);
  }

  /**
   * 添加节点到网络
   */
  async addNodeToNetwork(
    networkId: string,
    nodeData: {
      agentId: string;
      nodeType: NodeType;
      capabilities?: string[];
      address?: {
        host: string;
        port: number;
        protocol: string;
      };
    }
  ): Promise<NetworkEntity | null> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      return null;
    }

    const nodeId = this.generateNodeId();
    const node = new NetworkNode(
      nodeId,
      nodeData.agentId,
      nodeData.nodeType,
      'offline',
      nodeData.capabilities as NodeCapability[] || [],
      nodeData.address as NodeAddress,
      {}
    );

    network.addNode(node);
    return await this.networkRepository.save(network);
  }

  /**
   * 从网络移除节点
   */
  async removeNodeFromNetwork(networkId: string, nodeId: string): Promise<NetworkEntity | null> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      return null;
    }

    const removed = network.removeNode(nodeId);
    if (!removed) {
      return null;
    }

    return await this.networkRepository.save(network);
  }

  /**
   * 更新节点状态
   */
  async updateNodeStatus(
    networkId: string,
    nodeId: string,
    status: NodeStatus
  ): Promise<NetworkEntity | null> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      return null;
    }

    const node = network.getNode(nodeId);
    if (!node) {
      return null;
    }

    node.updateStatus(status);
    return await this.networkRepository.save(network);
  }

  /**
   * 添加边缘连接
   */
  async addEdgeToNetwork(
    networkId: string,
    edgeData: {
      sourceNodeId: string;
      targetNodeId: string;
      edgeType: string;
      direction: 'bidirectional' | 'unidirectional';
      weight?: number;
    }
  ): Promise<NetworkEntity | null> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      return null;
    }

    const edgeId = this.generateEdgeId();
    const edge = new NetworkEdge(
      edgeId,
      edgeData.sourceNodeId,
      edgeData.targetNodeId,
      edgeData.edgeType,
      edgeData.direction,
      'active',
      edgeData.weight || 1.0,
      {}
    );

    network.addEdge(edge);
    return await this.networkRepository.save(network);
  }

  /**
   * 获取网络统计信息
   */
  async getNetworkStatistics(networkId: string): Promise<{
    totalNodes: number;
    onlineNodes: number;
    totalEdges: number;
    activeEdges: number;
    topologyEfficiency: number;
  } | null> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      return null;
    }

    return network.getNetworkStats();
  }

  /**
   * 检查网络健康状态
   */
  async checkNetworkHealth(networkId: string): Promise<boolean | null> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      return null;
    }

    return network.isHealthy();
  }

  /**
   * 获取节点的邻居
   */
  async getNodeNeighbors(networkId: string, nodeId: string): Promise<NetworkNode[] | null> {
    const network = await this.networkRepository.findById(networkId);
    if (!network) {
      return null;
    }

    return network.getNodeNeighbors(nodeId);
  }

  /**
   * 搜索网络
   */
  async searchNetworks(
    query: string,
    filters?: {
      topology?: string;
      status?: string;
      tags?: string[];
    }
  ): Promise<NetworkEntity[]> {
    return await this.networkRepository.search(query, filters);
  }

  /**
   * 获取所有网络的统计信息
   */
  async getGlobalStatistics(): Promise<{
    totalNetworks: number;
    activeNetworks: number;
    totalNodes: number;
    totalEdges: number;
    topologyDistribution: Record<string, number>;
    statusDistribution: Record<string, number>;
  }> {
    const stats = await this.networkRepository.getStatistics();
    return {
      ...stats,
      topologyDistribution: {},
      statusDistribution: {}
    };
  }

  /**
   * 生成网络ID
   */
  private generateNetworkId(): string {
    return `network-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 生成节点ID
   */
  private generateNodeId(): string {
    return `node-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 生成边缘ID
   */
  private generateEdgeId(): string {
    return `edge-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
