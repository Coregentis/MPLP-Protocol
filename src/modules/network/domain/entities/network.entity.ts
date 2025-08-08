/**
 * MPLP Network Entity - Domain Entity
 *
 * @version v1.0.0
 * @created 2025-08-02T01:31:00+08:00
 * @description 网络领域实体，包含网络的核心业务逻辑
 */

import { v4 as uuidv4 } from 'uuid';
import {
  NetworkEntity,
  NetworkNode,
  NetworkEdge,
  NetworkTopology,
  DiscoveryMechanism,
  RoutingStrategy,
  NetworkStatus,
  NodeType,
  NodeStatus,
  NodeCapability,
  NodeAddress,
} from '../../types';

/**
 * 网络领域实体
 */
export class Network {
  private _network_id: string;
  private _version: string;
  private _timestamp: string;
  private _context_id: string;
  private _name: string;
  private _description?: string;
  private _topology: NetworkTopology;
  private _nodes: NetworkNode[];
  private _edges?: NetworkEdge[];
  private _discovery_mechanism: DiscoveryMechanism;
  private _routing_strategy: RoutingStrategy;
  private _status: NetworkStatus;
  private _created_at: string;
  private _updated_at: string;
  private _created_by: string;
  private _metadata?: Record<string, any>;

  constructor(data: Partial<NetworkEntity>) {
    this._network_id = data.networkId || uuidv4();
    this._version = data.version || '1.0.0';
    this._timestamp = data.timestamp || new Date().toISOString();
    this._context_id = data.contextId!;
    this._name = data.name!;
    this._description = data.description;
    this._topology = data.topology!;
    this._nodes = data.nodes || [];
    this._edges = data.edges;
    this._discovery_mechanism = data.discoveryMechanism!;
    this._routing_strategy = data.routingStrategy!;
    this._status = data.status || 'pending';
    this._created_at = data.createdAt || new Date().toISOString();
    this._updated_at = data.updatedAt || new Date().toISOString();
    this._created_by = data.createdBy!;
    this._metadata = data.metadata;

    this.validate();
  }

  // ==================== Getters ====================

  get networkId(): string {
    return this._network_id;
  }
  get version(): string {
    return this._version;
  }
  get timestamp(): string {
    return this._timestamp;
  }
  get contextId(): string {
    return this._context_id;
  }
  get name(): string {
    return this._name;
  }
  get description(): string | undefined {
    return this._description;
  }
  get topology(): NetworkTopology {
    return this._topology;
  }
  get nodes(): NetworkNode[] {
    return [...this._nodes];
  }
  get edges(): NetworkEdge[] | undefined {
    return this._edges ? [...this._edges] : undefined;
  }
  get discoveryMechanism(): DiscoveryMechanism {
    return { ...this._discovery_mechanism };
  }
  get routingStrategy(): RoutingStrategy {
    return { ...this._routing_strategy };
  }
  get status(): NetworkStatus {
    return this._status;
  }
  get createdAt(): string {
    return this._created_at;
  }
  get updatedAt(): string {
    return this._updated_at;
  }
  get createdBy(): string {
    return this._created_by;
  }
  get metadata(): Record<string, any> | undefined {
    return this._metadata ? { ...this._metadata } : undefined;
  }

  // ==================== 业务方法 ====================

  /**
   * 添加节点
   */
  addNode(node: Omit<NetworkNode, 'node_id'>): void {
    // 验证节点数量限制
    if (this._nodes.length >= 1000) {
      throw new Error('网络节点数量已达上限');
    }

    // 验证Agent不重复
    if (this._nodes.some(n => n.agentId === node.agentId)) {
      throw new Error('Agent已经是网络节点');
    }

    // 验证地址不重复（如果提供了地址）
    if (node.address) {
      const existingNode = this._nodes.find(
        n =>
          n.address &&
          n.address.host === node.address!.host &&
          n.address.port === node.address!.port
      );
      if (existingNode) {
        throw new Error(
          `地址已被使用: ${node.address.host}:${node.address.port}`
        );
      }
    }

    const newNode: NetworkNode = {
      node_id: uuidv4(),
      ...node,
    };

    this._nodes.push(newNode);
    this.updateTimestamp();
  }

  /**
   * 移除节点
   */
  removeNode(node_id: string): void {
    const index = this._nodes.findIndex(n => n.node_id === node_id);
    if (index === -1) {
      throw new Error('节点不存在');
    }

    // 检查最小节点数量
    if (this._nodes.length <= 1) {
      throw new Error('网络至少需要1个节点');
    }

    this._nodes.splice(index, 1);

    // 清理相关的边
    if (this._edges) {
      this._edges = this._edges.filter(
        edge =>
          edge.source_node_id !== node_id && edge.target_node_id !== node_id
      );
    }

    this.updateTimestamp();
  }

  /**
   * 更新节点状态
   */
  updateNodeStatus(node_id: string, status: NodeStatus): void {
    const node = this._nodes.find(n => n.node_id === node_id);
    if (!node) {
      throw new Error('节点不存在');
    }

    node.status = status;
    this.updateTimestamp();
  }

  /**
   * 更新节点能力
   */
  updateNodeCapabilities(
    node_id: string,
    capabilities: NodeCapability[]
  ): void {
    const node = this._nodes.find(n => n.node_id === node_id);
    if (!node) {
      throw new Error('节点不存在');
    }

    node.capabilities = capabilities;
    this.updateTimestamp();
  }

  /**
   * 更新节点地址
   */
  updateNodeAddress(node_id: string, address: NodeAddress): void {
    const node = this._nodes.find(n => n.node_id === node_id);
    if (!node) {
      throw new Error('节点不存在');
    }

    // 验证地址不重复
    const existingNode = this._nodes.find(
      n =>
        n.node_id !== node_id &&
        n.address &&
        n.address.host === address.host &&
        n.address.port === address.port
    );
    if (existingNode) {
      throw new Error(`地址已被使用: ${address.host}:${address.port}`);
    }

    node.address = address;
    this.updateTimestamp();
  }

  /**
   * 更新节点信息（通用方法）
   */
  updateNode(
    node_id: string,
    updates: Partial<
      Pick<NetworkNode, 'status' | 'capabilities' | 'address' | 'metadata'>
    >
  ): void {
    const node = this._nodes.find(n => n.node_id === node_id);
    if (!node) {
      throw new Error('节点不存在');
    }

    if (updates.status !== undefined) {node.status = updates.status;}
    if (updates.capabilities !== undefined)
      {node.capabilities = updates.capabilities;}
    if (updates.address !== undefined) {
      // 验证地址不重复
      const existingNode = this._nodes.find(
        n =>
          n.node_id !== node_id &&
          n.address &&
          n.address.host === updates.address!.host &&
          n.address.port === updates.address!.port
      );
      if (existingNode) {
        throw new Error(
          `地址已被使用: ${updates.address.host}:${updates.address.port}`
        );
      }
      node.address = updates.address;
    }
    if (updates.metadata !== undefined) {node.metadata = updates.metadata;}

    this.updateTimestamp();
  }

  /**
   * 添加边
   */
  addEdge(edge: Omit<NetworkEdge, 'edge_id'>): void {
    // 验证源节点存在
    const sourceNode = this._nodes.find(n => n.node_id === edge.source_node_id);
    if (!sourceNode) {
      throw new Error('源节点不存在');
    }

    // 验证目标节点存在
    const targetNode = this._nodes.find(n => n.node_id === edge.target_node_id);
    if (!targetNode) {
      throw new Error('目标节点不存在');
    }

    // 初始化edges数组（如果不存在）
    if (!this._edges) {
      this._edges = [];
    }

    const newEdge: NetworkEdge = {
      edge_id: uuidv4(),
      ...edge,
    };

    this._edges.push(newEdge);
    this.updateTimestamp();
  }

  /**
   * 查找节点
   */
  findNode(node_id: string): NetworkNode | undefined {
    return this._nodes.find(n => n.node_id === node_id);
  }

  /**
   * 根据Agent ID查找节点
   */
  findNodeByAgentId(agent_id: string): NetworkNode | undefined {
    return this._nodes.find(n => n.agentId === agent_id);
  }

  /**
   * 根据类型查找节点
   */
  findNodesByType(node_type: NodeType): NetworkNode[] {
    return this._nodes.filter(n => n.node_type === node_type);
  }

  /**
   * 根据能力查找节点
   */
  findNodesByCapability(capability: NodeCapability): NetworkNode[] {
    return this._nodes.filter(n => n.capabilities.includes(capability));
  }

  /**
   * 获取在线节点
   */
  getOnlineNodes(): NetworkNode[] {
    return this._nodes.filter(n => n.status === 'online');
  }

  /**
   * 获取网络健康度
   */
  getNetworkHealth(): number {
    if (this._nodes.length === 0) {return 0;}

    const onlineNodes = this.getOnlineNodes().length;
    return onlineNodes / this._nodes.length;
  }

  /**
   * 启动网络
   */
  start(): void {
    if (this._status !== 'pending') {
      throw new Error(`无法启动网络，当前状态: ${this._status}`);
    }

    // 验证至少有一个节点
    if (this._nodes.length === 0) {
      throw new Error('网络至少需要1个节点才能启动');
    }

    this._status = 'active';
    this.updateTimestamp();
  }

  /**
   * 暂停网络
   */
  pause(): void {
    if (this._status !== 'active') {
      throw new Error(`无法暂停网络，当前状态: ${this._status}`);
    }

    this._status = 'inactive';
    this.updateTimestamp();
  }

  /**
   * 恢复网络
   */
  resume(): void {
    if (this._status !== 'inactive') {
      throw new Error(`无法恢复网络，当前状态: ${this._status}`);
    }

    this._status = 'active';
    this.updateTimestamp();
  }

  /**
   * 完成网络
   */
  complete(): void {
    if (!['active', 'inactive'].includes(this._status)) {
      throw new Error(`无法完成网络，当前状态: ${this._status}`);
    }

    this._status = 'completed';
    this.updateTimestamp();
  }

  /**
   * 取消网络
   */
  cancel(): void {
    if (['completed', 'cancelled'].includes(this._status)) {
      throw new Error(`无法取消网络，当前状态: ${this._status}`);
    }

    this._status = 'cancelled';
    this.updateTimestamp();
  }

  /**
   * 标记为失败
   */
  fail(reason?: string): void {
    this._status = 'failed';
    if (reason && this._metadata) {
      this._metadata.failure_reason = reason;
    }
    this.updateTimestamp();
  }

  /**
   * 更新状态（通用方法）
   */
  updateStatus(status: NetworkStatus): void {
    switch (status) {
      case 'active':
        if (this._status === 'pending') {
          this.start();
        } else if (this._status === 'inactive') {
          this.resume();
        }
        break;
      case 'inactive':
        if (this._status === 'active') {
          this.pause();
        }
        break;
      case 'completed':
        this.complete();
        break;
      case 'cancelled':
        this.cancel();
        break;
      case 'failed':
        this.fail();
        break;
      default:
        this._status = status;
        this.updateTimestamp();
    }
  }

  /**
   * 更新基本信息
   */
  updateBasicInfo(updates: {
    name?: string;
    description?: string;
    topology?: NetworkTopology;
  }): void {
    if (updates.name) {
      this._name = updates.name;
    }
    if ('description' in updates) {
      this._description = updates.description;
    }
    if (updates.topology) {
      this._topology = updates.topology;
    }
    this.updateTimestamp();
  }

  /**
   * 更新拓扑
   */
  updateTopology(topology: NetworkTopology): void {
    this._topology = topology;
    this.updateTimestamp();
  }

  /**
   * 更新发现机制
   */
  updateDiscoveryMechanism(mechanism: Partial<DiscoveryMechanism>): void {
    this._discovery_mechanism = { ...this._discovery_mechanism, ...mechanism };
    this.updateTimestamp();
  }

  /**
   * 更新路由策略
   */
  updateRoutingStrategy(strategy: Partial<RoutingStrategy>): void {
    this._routing_strategy = { ...this._routing_strategy, ...strategy };
    this.updateTimestamp();
  }

  /**
   * 更新元数据
   */
  updateMetadata(metadata: Record<string, any>): void {
    this._metadata = { ...this._metadata, ...metadata };
    this.updateTimestamp();
  }

  // ==================== 辅助方法 ====================

  /**
   * 更新时间戳
   */
  private updateTimestamp(): void {
    this._updated_at = new Date().toISOString();
  }

  /**
   * 验证实体数据
   */
  private validate(): void {
    if (!this._context_id) {throw new Error('context_id是必需的');}
    if (!this._name || this._name.trim().length === 0)
      {throw new Error('name是必需的');}
    if (!this._topology) {throw new Error('topology是必需的');}
    if (!this._discovery_mechanism)
      {throw new Error('discovery_mechanism是必需的');}
    if (!this._routing_strategy) {throw new Error('routing_strategy是必需的');}
    if (!this._created_by) {throw new Error('created_by是必需的');}
  }

  /**
   * 转换为普通对象
   */
  toObject(): NetworkEntity {
    return {
      networkId: this._network_id,
      version: this._version,
      timestamp: this._timestamp,
      contextId: this._context_id,
      name: this._name,
      description: this._description,
      topology: this._topology,
      nodes: [...this._nodes],
      edges: this._edges ? [...this._edges] : undefined,
      discovery_mechanism: { ...this._discovery_mechanism },
      routing_strategy: { ...this._routing_strategy },
      status: this._status,
      createdAt: this._created_at,
      updatedAt: this._updated_at,
      createdBy: this._created_by,
      metadata: this._metadata ? { ...this._metadata } : undefined,
    };
  }

  /**
   * 从普通对象创建实体
   */
  static fromObject(data: NetworkEntity): Network {
    return new Network(data);
  }
}
