/**
 * Network领域实体
 * 
 * @description Network模块的核心领域实体，基于DDD架构设计
 * @version 1.0.0
 * @layer 领域层 - 实体
 */

import {
  NetworkTopology,
  NodeType,
  NodeStatus,
  NodeCapability,
  NodeAddress,
  NodeMetadata,
  DiscoveryMechanism,
  RoutingStrategy,
  NetworkStatus,
  PerformanceMetrics,
  MonitoringIntegration,
  AuditTrailEntry,
  VersionHistoryEntry,
  SearchMetadata,
  EventIntegration,
  NetworkOperation
} from '../../types';

/**
 * 网络节点实体
 */
export class NetworkNode {
  constructor(
    public readonly nodeId: string,
    public readonly agentId: string,
    public readonly nodeType: NodeType,
    public status: NodeStatus,
    public capabilities: NodeCapability[] = [],
    public address?: NodeAddress,
    public metadata: NodeMetadata = {}
  ) {}

  /**
   * 更新节点状态
   */
  updateStatus(newStatus: NodeStatus): void {
    this.status = newStatus;
  }

  /**
   * 添加能力
   */
  addCapability(capability: NodeCapability): void {
    if (!this.capabilities.includes(capability)) {
      this.capabilities.push(capability);
    }
  }

  /**
   * 移除能力
   */
  removeCapability(capability: NodeCapability): void {
    const index = this.capabilities.indexOf(capability);
    if (index > -1) {
      this.capabilities.splice(index, 1);
    }
  }

  /**
   * 检查是否在线
   */
  isOnline(): boolean {
    return this.status === 'online';
  }

  /**
   * 检查是否具有特定能力
   */
  hasCapability(capability: NodeCapability): boolean {
    return this.capabilities.includes(capability);
  }
}

/**
 * 网络边缘连接实体
 */
export class NetworkEdge {
  constructor(
    public readonly edgeId: string,
    public readonly sourceNodeId: string,
    public readonly targetNodeId: string,
    public readonly edgeType: string,
    public readonly direction: 'bidirectional' | 'unidirectional',
    public status: string,
    public weight: number = 1.0,
    public metadata: { [key: string]: unknown } = {}
  ) {}

  /**
   * 更新边缘状态
   */
  updateStatus(newStatus: string): void {
    this.status = newStatus;
  }

  /**
   * 更新权重
   */
  updateWeight(newWeight: number): void {
    if (newWeight >= 0) {
      this.weight = newWeight;
    }
  }

  /**
   * 检查连接是否活跃
   */
  isActive(): boolean {
    return this.status === 'active';
  }
}

/**
 * Network实体构造参数接口
 */
export interface NetworkEntityData {
  networkId: string;
  protocolVersion: string;
  timestamp: Date;
  contextId: string;
  name: string;
  topology: NetworkTopology;
  nodes: NetworkNode[];
  discoveryMechanism: DiscoveryMechanism;
  routingStrategy: RoutingStrategy;
  status: NetworkStatus;
  createdAt: Date;
  createdBy: string;
  auditTrail: AuditTrailEntry[];
  monitoringIntegration: MonitoringIntegration;
  performanceMetrics: PerformanceMetrics;
  versionHistory: VersionHistoryEntry[];
  searchMetadata: SearchMetadata;
  networkOperation: NetworkOperation;
  eventIntegration: EventIntegration;
  description?: string;
  edges?: NetworkEdge[];
  updatedAt?: Date;
}

/**
 * Network核心实体
 */
export class NetworkEntity {
  public readonly networkId: string;
  public readonly protocolVersion: string;
  public readonly timestamp: Date;
  public readonly contextId: string;
  public name: string;
  public readonly topology: NetworkTopology;
  public nodes: NetworkNode[];
  public discoveryMechanism: DiscoveryMechanism;
  public routingStrategy: RoutingStrategy;
  public status: NetworkStatus;
  public readonly createdAt: Date;
  public readonly createdBy: string;
  public auditTrail: AuditTrailEntry[];
  public monitoringIntegration: MonitoringIntegration;
  public performanceMetrics: PerformanceMetrics;
  public versionHistory: VersionHistoryEntry[];
  public searchMetadata: SearchMetadata;
  public networkOperation: NetworkOperation;
  public eventIntegration: EventIntegration;
  public description?: string;
  public edges: NetworkEdge[];
  public updatedAt?: Date;

  constructor(data: NetworkEntityData) {
    this.networkId = data.networkId;
    this.protocolVersion = data.protocolVersion;
    this.timestamp = data.timestamp;
    this.contextId = data.contextId;
    this.name = data.name;
    this.topology = data.topology;
    this.nodes = data.nodes || [];
    this.discoveryMechanism = data.discoveryMechanism;
    this.routingStrategy = data.routingStrategy;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.createdBy = data.createdBy;
    this.auditTrail = data.auditTrail || [];
    this.monitoringIntegration = data.monitoringIntegration;
    this.performanceMetrics = data.performanceMetrics;
    this.versionHistory = data.versionHistory || [];
    this.searchMetadata = data.searchMetadata;
    this.networkOperation = data.networkOperation;
    this.eventIntegration = data.eventIntegration;
    this.description = data.description;
    this.edges = data.edges || [];
    this.updatedAt = data.updatedAt;
  }

  /**
   * 添加节点
   */
  addNode(node: NetworkNode): void {
    if (!this.nodes.find(n => n.nodeId === node.nodeId)) {
      this.nodes.push(node);
      this.addAuditEntry('node_added', 'system', { nodeId: node.nodeId });
    }
  }

  /**
   * 移除节点
   */
  removeNode(nodeId: string): boolean {
    const index = this.nodes.findIndex(n => n.nodeId === nodeId);
    if (index > -1) {
      this.nodes.splice(index, 1);
      this.addAuditEntry('node_removed', 'system', { nodeId });
      return true;
    }
    return false;
  }

  /**
   * 获取节点
   */
  getNode(nodeId: string): NetworkNode | undefined {
    return this.nodes.find(n => n.nodeId === nodeId);
  }

  /**
   * 获取在线节点
   */
  getOnlineNodes(): NetworkNode[] {
    return this.nodes.filter(node => node.isOnline());
  }

  /**
   * 添加边缘连接
   */
  addEdge(edge: NetworkEdge): void {
    if (!this.edges.find(e => e.edgeId === edge.edgeId)) {
      this.edges.push(edge);
      this.addAuditEntry('edge_added', 'system', { edgeId: edge.edgeId });
    }
  }

  /**
   * 移除边缘连接
   */
  removeEdge(edgeId: string): boolean {
    const index = this.edges.findIndex(e => e.edgeId === edgeId);
    if (index > -1) {
      this.edges.splice(index, 1);
      this.addAuditEntry('edge_removed', 'system', { edgeId });
      return true;
    }
    return false;
  }

  /**
   * 更新网络状态
   */
  updateStatus(newStatus: NetworkStatus): void {
    const oldStatus = this.status;
    this.status = newStatus;
    this.updatedAt = new Date();
    this.addAuditEntry('status_changed', 'system', { 
      oldStatus, 
      newStatus 
    });
  }

  /**
   * 添加审计条目
   */
  private addAuditEntry(action: string, actor: string, details: { [key: string]: unknown }): void {
    this.auditTrail.push({
      timestamp: new Date().toISOString(),
      action,
      actor,
      details
    });
  }

  /**
   * 获取网络统计信息
   */
  getNetworkStats(): {
    totalNodes: number;
    onlineNodes: number;
    totalEdges: number;
    activeEdges: number;
    topologyEfficiency: number;
  } {
    const totalNodes = this.nodes.length;
    const onlineNodes = this.getOnlineNodes().length;
    const totalEdges = this.edges.length;
    const activeEdges = this.edges.filter(e => e.isActive()).length;
    
    // 简单的拓扑效率计算
    const topologyEfficiency = totalNodes > 0 ? (activeEdges / Math.max(totalNodes - 1, 1)) : 0;

    return {
      totalNodes,
      onlineNodes,
      totalEdges,
      activeEdges,
      topologyEfficiency: Math.min(topologyEfficiency, 1.0)
    };
  }

  /**
   * 检查网络是否健康
   */
  isHealthy(): boolean {
    const stats = this.getNetworkStats();
    return stats.onlineNodes > 0 && 
           stats.activeEdges > 0 && 
           this.status === 'active';
  }

  /**
   * 获取节点的邻居
   */
  getNodeNeighbors(nodeId: string): NetworkNode[] {
    const neighbors: NetworkNode[] = [];
    
    for (const edge of this.edges) {
      if (edge.isActive()) {
        if (edge.sourceNodeId === nodeId) {
          const neighbor = this.getNode(edge.targetNodeId);
          if (neighbor) neighbors.push(neighbor);
        } else if (edge.targetNodeId === nodeId && edge.direction === 'bidirectional') {
          const neighbor = this.getNode(edge.sourceNodeId);
          if (neighbor) neighbors.push(neighbor);
        }
      }
    }
    
    return neighbors;
  }
}
