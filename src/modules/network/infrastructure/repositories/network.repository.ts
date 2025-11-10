/**
 * Network仓储实现
 * 
 * @description Network模块的内存仓储实现，基于DDD架构
 * @version 1.0.0
 * @layer 基础设施层 - 仓储实现
 */

import { NetworkEntity } from '../../domain/entities/network.entity';
import { INetworkRepository } from '../../domain/repositories/network-repository.interface';

/**
 * 内存Network仓储实现
 */
export class MemoryNetworkRepository implements INetworkRepository {
  private networks: Map<string, NetworkEntity> = new Map();
  private cache: Map<string, unknown> = new Map();

  /**
   * 保存网络实体
   */
  async save(network: NetworkEntity): Promise<NetworkEntity> {
    this.networks.set(network.networkId, network);
    this.clearRelatedCache(network.networkId);
    return network;
  }

  /**
   * 根据ID查找网络
   */
  async findById(networkId: string): Promise<NetworkEntity | null> {
    const cacheKey = `findById:${networkId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as NetworkEntity | null;
    }

    const network = this.networks.get(networkId) || null;
    this.cache.set(cacheKey, network);
    return network;
  }

  /**
   * 根据名称查找网络
   */
  async findByName(name: string): Promise<NetworkEntity | null> {
    const cacheKey = `findByName:${name}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as NetworkEntity | null;
    }

    for (const network of this.networks.values()) {
      if (network.name === name) {
        this.cache.set(cacheKey, network);
        return network;
      }
    }

    this.cache.set(cacheKey, null);
    return null;
  }

  /**
   * 根据上下文ID查找网络
   */
  async findByContextId(contextId: string): Promise<NetworkEntity[]> {
    const cacheKey = `findByContextId:${contextId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as NetworkEntity[];
    }

    const results = Array.from(this.networks.values()).filter(
      network => network.contextId === contextId
    );

    this.cache.set(cacheKey, results);
    return results;
  }

  /**
   * 根据拓扑类型查找网络
   */
  async findByTopology(topology: string): Promise<NetworkEntity[]> {
    const cacheKey = `findByTopology:${topology}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as NetworkEntity[];
    }

    const results = Array.from(this.networks.values()).filter(
      network => network.topology === topology
    );

    this.cache.set(cacheKey, results);
    return results;
  }

  /**
   * 根据状态查找网络
   */
  async findByStatus(status: string): Promise<NetworkEntity[]> {
    const cacheKey = `findByStatus:${status}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as NetworkEntity[];
    }

    const results = Array.from(this.networks.values()).filter(
      network => network.status === status
    );

    this.cache.set(cacheKey, results);
    return results;
  }

  /**
   * 查找所有网络
   */
  async findAll(): Promise<NetworkEntity[]> {
    const cacheKey = 'findAll';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as NetworkEntity[];
    }

    const results = Array.from(this.networks.values());
    this.cache.set(cacheKey, results);
    return results;
  }

  /**
   * 分页查询网络
   */
  async findWithPagination(
    page: number,
    limit: number,
    filters?: {
      contextId?: string;
      topology?: string;
      status?: string;
      createdBy?: string;
    }
  ): Promise<{
    networks: NetworkEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let results = Array.from(this.networks.values());

    // 应用过滤器
    if (filters) {
      if (filters.contextId) {
        results = results.filter(n => n.contextId === filters.contextId);
      }
      if (filters.topology) {
        results = results.filter(n => n.topology === filters.topology);
      }
      if (filters.status) {
        results = results.filter(n => n.status === filters.status);
      }
      if (filters.createdBy) {
        results = results.filter(n => n.createdBy === filters.createdBy);
      }
    }

    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const networks = results.slice(startIndex, endIndex);

    return {
      networks,
      total,
      page,
      limit,
      totalPages
    };
  }

  /**
   * 更新网络实体
   */
  async update(networkId: string, updates: Partial<NetworkEntity>): Promise<NetworkEntity | null> {
    const network = this.networks.get(networkId);
    if (!network) {
      return null;
    }

    // 应用更新
    Object.assign(network, updates);
    this.networks.set(networkId, network);
    this.clearRelatedCache(networkId);

    return network;
  }

  /**
   * 删除网络
   */
  async delete(networkId: string): Promise<boolean> {
    const deleted = this.networks.delete(networkId);
    if (deleted) {
      this.clearRelatedCache(networkId);
    }
    return deleted;
  }

  /**
   * 检查网络是否存在
   */
  async exists(networkId: string): Promise<boolean> {
    return this.networks.has(networkId);
  }

  /**
   * 根据节点ID查找包含该节点的网络
   */
  async findByNodeId(nodeId: string): Promise<NetworkEntity[]> {
    const cacheKey = `findByNodeId:${nodeId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as NetworkEntity[];
    }

    const results = Array.from(this.networks.values()).filter(
      network => network.nodes.some(node => node.nodeId === nodeId)
    );

    this.cache.set(cacheKey, results);
    return results;
  }

  /**
   * 根据Agent ID查找网络
   */
  async findByAgentId(agentId: string): Promise<NetworkEntity[]> {
    const cacheKey = `findByAgentId:${agentId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as NetworkEntity[];
    }

    const results = Array.from(this.networks.values()).filter(
      network => network.nodes.some(node => node.agentId === agentId)
    );

    this.cache.set(cacheKey, results);
    return results;
  }

  /**
   * 查找活跃的网络
   */
  async findActiveNetworks(): Promise<NetworkEntity[]> {
    return this.findByStatus('active');
  }

  /**
   * 根据性能指标查询网络
   */
  async findByPerformanceThreshold(
    metric: string,
    threshold: number,
    operator: 'gt' | 'lt' | 'eq'
  ): Promise<NetworkEntity[]> {
    const results = Array.from(this.networks.values()).filter(network => {
      const metricValue = network.performanceMetrics.metrics[metric] as number;
      if (typeof metricValue !== 'number') return false;

      switch (operator) {
        case 'gt': return metricValue > threshold;
        case 'lt': return metricValue < threshold;
        case 'eq': return metricValue === threshold;
        default: return false;
      }
    });

    return results;
  }

  /**
   * 搜索网络
   */
  async search(
    query: string,
    filters?: {
      topology?: string;
      status?: string;
      tags?: string[];
    }
  ): Promise<NetworkEntity[]> {
    const queryLower = query.toLowerCase();
    let results = Array.from(this.networks.values()).filter(network => {
      const nameMatch = network.name.toLowerCase().includes(queryLower);
      const descMatch = network.description?.toLowerCase().includes(queryLower) || false;
      const tagMatch = network.searchMetadata.tags.some(tag => 
        tag.toLowerCase().includes(queryLower)
      );
      const keywordMatch = network.searchMetadata.keywords.some(keyword => 
        keyword.toLowerCase().includes(queryLower)
      );

      return nameMatch || descMatch || tagMatch || keywordMatch;
    });

    // 应用过滤器
    if (filters) {
      if (filters.topology) {
        results = results.filter(n => n.topology === filters.topology);
      }
      if (filters.status) {
        results = results.filter(n => n.status === filters.status);
      }
      if (filters.tags && filters.tags.length > 0) {
        const tags = filters.tags;
        results = results.filter(n =>
          tags.some(tag => n.searchMetadata.tags.includes(tag))
        );
      }
    }

    return results;
  }

  /**
   * 获取网络统计信息
   */
  async getStatistics(): Promise<{
    totalNetworks: number;
    activeNetworks: number;
    totalNodes: number;
    totalEdges: number;
    topologyDistribution: { [topology: string]: number };
    statusDistribution: { [status: string]: number };
  }> {
    const networks = Array.from(this.networks.values());
    const totalNetworks = networks.length;
    const activeNetworks = networks.filter(n => n.status === 'active').length;
    const totalNodes = networks.reduce((sum, n) => sum + n.nodes.length, 0);
    const totalEdges = networks.reduce((sum, n) => sum + n.edges.length, 0);

    const topologyDistribution: { [topology: string]: number } = {};
    const statusDistribution: { [status: string]: number } = {};

    networks.forEach(network => {
      topologyDistribution[network.topology] = (topologyDistribution[network.topology] || 0) + 1;
      statusDistribution[network.status] = (statusDistribution[network.status] || 0) + 1;
    });

    return {
      totalNetworks,
      activeNetworks,
      totalNodes,
      totalEdges,
      topologyDistribution,
      statusDistribution
    };
  }

  /**
   * 批量保存网络
   */
  async saveBatch(networks: NetworkEntity[]): Promise<NetworkEntity[]> {
    networks.forEach(network => {
      this.networks.set(network.networkId, network);
      this.clearRelatedCache(network.networkId);
    });
    return networks;
  }

  /**
   * 批量删除网络
   */
  async deleteBatch(networkIds: string[]): Promise<boolean> {
    let allDeleted = true;
    networkIds.forEach(id => {
      const deleted = this.networks.delete(id);
      if (deleted) {
        this.clearRelatedCache(id);
      } else {
        allDeleted = false;
      }
    });
    return allDeleted;
  }

  /**
   * 清空缓存
   */
  async clearCache(): Promise<void> {
    this.cache.clear();
  }

  /**
   * 获取网络的版本历史
   */
  async getVersionHistory(networkId: string): Promise<{
    networkId: string;
    versions: Array<{
      version: string;
      timestamp: string;
      changes: string[];
      author: string;
    }>;
  }> {
    const network = this.networks.get(networkId);
    if (!network) {
      return { networkId, versions: [] };
    }

    return {
      networkId,
      versions: network.versionHistory
    };
  }

  /**
   * 根据创建时间范围查找网络
   */
  async findByCreatedAtRange(startDate: Date, endDate: Date): Promise<NetworkEntity[]> {
    return Array.from(this.networks.values()).filter(network => {
      const createdAt = network.createdAt;
      return createdAt >= startDate && createdAt <= endDate;
    });
  }

  /**
   * 根据更新时间范围查找网络
   */
  async findByUpdatedAtRange(startDate: Date, endDate: Date): Promise<NetworkEntity[]> {
    return Array.from(this.networks.values()).filter(network => {
      const updatedAt = network.updatedAt;
      return updatedAt && updatedAt >= startDate && updatedAt <= endDate;
    });
  }

  /**
   * 获取网络的审计追踪
   */
  async getAuditTrail(
    networkId: string,
    limit?: number,
    offset?: number
  ): Promise<{
    networkId: string;
    auditEntries: Array<{
      timestamp: string;
      action: string;
      actor: string;
      details: { [key: string]: unknown };
    }>;
    total: number;
  }> {
    const network = this.networks.get(networkId);
    if (!network) {
      return { networkId, auditEntries: [], total: 0 };
    }

    const total = network.auditTrail.length;
    let auditEntries = network.auditTrail;

    if (offset !== undefined) {
      auditEntries = auditEntries.slice(offset);
    }
    if (limit !== undefined) {
      auditEntries = auditEntries.slice(0, limit);
    }

    return {
      networkId,
      auditEntries,
      total
    };
  }

  /**
   * 根据标签查找网络
   */
  async findByTags(tags: string[]): Promise<NetworkEntity[]> {
    return Array.from(this.networks.values()).filter(network =>
      tags.some(tag => network.searchMetadata.tags.includes(tag))
    );
  }

  /**
   * 根据关键词查找网络
   */
  async findByKeywords(keywords: string[]): Promise<NetworkEntity[]> {
    return Array.from(this.networks.values()).filter(network =>
      keywords.some(keyword => network.searchMetadata.keywords.includes(keyword))
    );
  }

  /**
   * 获取网络拓扑图数据
   */
  async getTopologyData(networkId: string): Promise<{
    nodes: Array<{
      id: string;
      type: string;
      status: string;
      position?: { x: number; y: number };
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      type: string;
      weight: number;
    }>;
  } | null> {
    const network = this.networks.get(networkId);
    if (!network) {
      return null;
    }

    const nodes = network.nodes.map(node => ({
      id: node.nodeId,
      type: node.nodeType,
      status: node.status,
      position: node.metadata.position as { x: number; y: number } | undefined
    }));

    const edges = network.edges.map(edge => ({
      id: edge.edgeId,
      source: edge.sourceNodeId,
      target: edge.targetNodeId,
      type: edge.edgeType,
      weight: edge.weight
    }));

    return { nodes, edges };
  }

  /**
   * 更新网络拓扑
   */
  async updateTopology(
    networkId: string,
    topologyData: {
      nodes: Array<{ id: string; position?: { x: number; y: number } }>;
      edges: Array<{ source: string; target: string; weight?: number }>;
    }
  ): Promise<boolean> {
    const network = this.networks.get(networkId);
    if (!network) {
      return false;
    }

    // 更新节点位置
    topologyData.nodes.forEach(nodeData => {
      const node = network.getNode(nodeData.id);
      if (node && nodeData.position) {
        node.metadata.position = nodeData.position;
      }
    });

    // 更新边缘权重
    topologyData.edges.forEach(edgeData => {
      const edge = network.edges.find(e =>
        e.sourceNodeId === edgeData.source && e.targetNodeId === edgeData.target
      );
      if (edge && edgeData.weight !== undefined) {
        edge.updateWeight(edgeData.weight);
      }
    });

    this.clearRelatedCache(networkId);
    return true;
  }

  /**
   * 获取网络健康状态
   */
  async getHealthStatus(networkId: string): Promise<{
    networkId: string;
    isHealthy: boolean;
    healthScore: number;
    issues: string[];
    recommendations: string[];
  } | null> {
    const network = this.networks.get(networkId);
    if (!network) {
      return null;
    }

    const stats = network.getNetworkStats();
    const issues: string[] = [];
    const recommendations: string[] = [];

    // 检查网络健康状态
    if (stats.onlineNodes === 0) {
      issues.push('No online nodes');
      recommendations.push('Activate at least one node');
    }

    if (stats.activeEdges === 0) {
      issues.push('No active connections');
      recommendations.push('Establish connections between nodes');
    }

    if (stats.topologyEfficiency < 0.5) {
      issues.push('Low topology efficiency');
      recommendations.push('Optimize network topology');
    }

    const healthScore = Math.max(0, Math.min(1,
      (stats.onlineNodes / Math.max(stats.totalNodes, 1)) * 0.4 +
      (stats.activeEdges / Math.max(stats.totalEdges, 1)) * 0.3 +
      stats.topologyEfficiency * 0.3
    ));

    return {
      networkId,
      isHealthy: network.isHealthy(),
      healthScore,
      issues,
      recommendations
    };
  }

  /**
   * 清除相关缓存
   */
  private clearRelatedCache(networkId: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.includes(networkId) ||
          key.startsWith('findAll') ||
          key.startsWith('findBy')) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}
