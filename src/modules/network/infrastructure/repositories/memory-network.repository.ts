/**
 * MPLP Memory Network Repository - Infrastructure Implementation
 *
 * @version v1.0.0
 * @created 2025-08-02T01:34:00+08:00
 * @description 网络内存仓储实现，用于开发和测试
 */

import { Network } from '../../domain/entities/network.entity';
import {
  NetworkRepository,
  NodeDiscoveryRepository,
  RoutingRepository,
  NetworkStatistics,
} from '../../domain/repositories/network.repository';
import {
  NetworkNode,
  NetworkQueryParams,
  NodeDiscoveryRequest,
  RoutingRequest,
  RoutingResult,
} from '../../types';
import { Logger } from '../../../../public/utils/logger';

/**
 * 内存网络仓储实现
 */
export class MemoryNetworkRepository implements NetworkRepository {
  private networks = new Map<string, Network>();
  private logger = new Logger('MemoryNetworkRepository');

  /**
   * 保存网络
   */
  async save(network: Network): Promise<void> {
    this.logger.debug('保存网络', { network_id: network.networkId });
    this.networks.set(network.networkId, network);
  }

  /**
   * 根据ID查找网络
   */
  async findById(network_id: string): Promise<Network | null> {
    this.logger.debug('根据ID查找网络', { network_id });
    return this.networks.get(network_id) || null;
  }

  /**
   * 根据上下文ID查找网络列表
   */
  async findByContextId(context_id: string): Promise<Network[]> {
    this.logger.debug('根据上下文ID查找网络列表', { context_id });
    return Array.from(this.networks.values()).filter(
      network => network.contextId === context_id
    );
  }

  /**
   * 根据创建者查找网络列表
   */
  async findByCreatedBy(created_by: string): Promise<Network[]> {
    this.logger.debug('根据创建者查找网络列表', { created_by });
    return Array.from(this.networks.values()).filter(
      network => network.createdBy === created_by
    );
  }

  /**
   * 根据查询参数查找网络列表
   */
  async findByQuery(params: NetworkQueryParams): Promise<{
    networks: Network[];
    total: number;
  }> {
    this.logger.debug('根据查询参数查找网络列表', { params });

    let networks = Array.from(this.networks.values());

    // 应用过滤条件
    if (params.contextId) {
      networks = networks.filter(n => n.contextId === params.contextId);
    }
    if (params.status) {
      networks = networks.filter(n => n.status === params.status);
    }
    if (params.topology) {
      networks = networks.filter(n => n.topology === params.topology);
    }
    if (params.createdBy) {
      networks = networks.filter(n => n.createdBy === params.createdBy);
    }

    const total = networks.length;

    // 应用排序
    const sortBy = params.sort_by || 'created_at';
    const sortOrder = params.sort_order || 'desc';

    networks.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updated_at':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // 应用分页
    const offset = params.offset || 0;
    const limit = params.limit || 10;
    const paginatedNetworks = networks.slice(offset, offset + limit);

    return {
      networks: paginatedNetworks,
      total,
    };
  }

  /**
   * 检查网络是否存在
   */
  async exists(network_id: string): Promise<boolean> {
    this.logger.debug('检查网络是否存在', { network_id });
    return this.networks.has(network_id);
  }

  /**
   * 删除网络
   */
  async delete(network_id: string): Promise<void> {
    this.logger.debug('删除网络', { network_id });
    this.networks.delete(network_id);
  }

  /**
   * 批量删除网络
   */
  async deleteBatch(network_ids: string[]): Promise<void> {
    this.logger.debug('批量删除网络', { network_ids });
    network_ids.forEach(id => this.networks.delete(id));
  }

  /**
   * 更新网络状态
   */
  async updateStatus(network_id: string, status: string): Promise<void> {
    this.logger.debug('更新网络状态', { network_id, status });

    const network = this.networks.get(network_id);
    if (!network) {
      throw new Error('网络不存在');
    }

    // 通过实体方法来更新状态
    switch (status) {
      case 'active':
        if (network.status === 'pending') {
          network.start();
        } else if (network.status === 'inactive') {
          network.resume();
        }
        break;
      case 'inactive':
        if (network.status === 'active') {
          network.pause();
        }
        break;
      case 'completed':
        network.complete();
        break;
      case 'cancelled':
        network.cancel();
        break;
      case 'failed':
        network.fail();
        break;
    }
  }

  /**
   * 获取网络统计信息
   */
  async getStatistics(): Promise<NetworkStatistics> {
    this.logger.debug('获取网络统计信息');

    const networks = Array.from(this.networks.values());
    const total = networks.length;

    if (total === 0) {
      return {
        total_networks: 0,
        active_networks: 0,
        completed_networks: 0,
        failed_networks: 0,
        total_nodes: 0,
        average_nodes_per_network: 0,
        most_used_topology: '',
        most_used_discovery_type: '',
      };
    }

    const activeCount = networks.filter(n => n.status === 'active').length;
    const completedCount = networks.filter(
      n => n.status === 'completed'
    ).length;
    const failedCount = networks.filter(n => n.status === 'failed').length;

    const totalNodes = networks.reduce((sum, n) => sum + n.nodes.length, 0);
    const averageNodes = Math.round((totalNodes / total) * 100) / 100;

    // 统计最常用的拓扑
    const topologyCount = new Map<string, number>();
    networks.forEach(n => {
      const count = topologyCount.get(n.topology) || 0;
      topologyCount.set(n.topology, count + 1);
    });
    const mostUsedTopology =
      Array.from(topologyCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      '';

    // 统计最常用的发现类型
    const discoveryCount = new Map<string, number>();
    networks.forEach(n => {
      const count = discoveryCount.get(n.discoveryMechanism.type) || 0;
      discoveryCount.set(n.discoveryMechanism.type, count + 1);
    });
    const mostUsedDiscoveryType =
      Array.from(discoveryCount.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] || '';

    return {
      total_networks: total,
      active_networks: activeCount,
      completed_networks: completedCount,
      failed_networks: failedCount,
      total_nodes: totalNodes,
      average_nodes_per_network: averageNodes,
      most_used_topology: mostUsedTopology,
      most_used_discovery_type: mostUsedDiscoveryType,
    };
  }

  /**
   * 清空所有数据（仅用于测试）
   */
  async clear(): Promise<void> {
    this.logger.debug('清空所有网络数据');
    this.networks.clear();
  }

  /**
   * 获取所有网络数量（仅用于测试）
   */
  async count(): Promise<number> {
    return this.networks.size;
  }
}

/**
 * 内存节点发现仓储实现
 */
export class MemoryNodeDiscoveryRepository implements NodeDiscoveryRepository {
  private nodeRegistry = new Map<string, Map<string, NetworkNode>>(); // networkId -> nodeId -> node
  private logger = new Logger('MemoryNodeDiscoveryRepository');

  /**
   * 发现节点
   */
  async discoverNodes(request: NodeDiscoveryRequest): Promise<NetworkNode[]> {
    this.logger.debug('发现节点', { request });

    let nodes: NetworkNode[] = [];

    if (request.networkId) {
      const networkNodes = this.nodeRegistry.get(request.networkId);
      if (networkNodes) {
        nodes = Array.from(networkNodes.values());
      }
    } else {
      // 搜索所有网络
      for (const networkNodes of this.nodeRegistry.values()) {
        nodes.push(...Array.from(networkNodes.values()));
      }
    }

    // 应用过滤器
    if (request.node_type) {
      nodes = nodes.filter(node => node.node_type === request.node_type);
    }

    if (request.capabilities && request.capabilities.length > 0) {
      nodes = nodes.filter(node =>
        request.capabilities!.some(cap => node.capabilities.includes(cap))
      );
    }

    if (request.region && nodes.length > 0) {
      nodes = nodes.filter(node => node.metadata?.region === request.region);
    }

    return nodes;
  }

  /**
   * 注册节点
   */
  async registerNode(network_id: string, node: NetworkNode): Promise<void> {
    this.logger.debug('注册节点', { network_id, node_id: node.node_id });

    if (!this.nodeRegistry.has(network_id)) {
      this.nodeRegistry.set(network_id, new Map());
    }

    const networkNodes = this.nodeRegistry.get(network_id)!;
    networkNodes.set(node.node_id, node);
  }

  /**
   * 注销节点
   */
  async unregisterNode(network_id: string, node_id: string): Promise<void> {
    this.logger.debug('注销节点', { network_id, node_id });

    const networkNodes = this.nodeRegistry.get(network_id);
    if (networkNodes) {
      networkNodes.delete(node_id);
    }
  }

  /**
   * 更新节点状态
   */
  async updateNodeStatus(
    network_id: string,
    node_id: string,
    status: string
  ): Promise<void> {
    this.logger.debug('更新节点状态', { network_id, node_id, status });

    const networkNodes = this.nodeRegistry.get(network_id);
    if (networkNodes) {
      const node = networkNodes.get(node_id);
      if (node) {
        node.status = status as any;
      }
    }
  }

  /**
   * 获取网络中的所有节点
   */
  async getNetworkNodes(network_id: string): Promise<NetworkNode[]> {
    this.logger.debug('获取网络中的所有节点', { network_id });

    const networkNodes = this.nodeRegistry.get(network_id);
    return networkNodes ? Array.from(networkNodes.values()) : [];
  }

  /**
   * 根据类型查找节点
   */
  async findNodesByType(
    network_id: string,
    node_type: string
  ): Promise<NetworkNode[]> {
    this.logger.debug('根据类型查找节点', { network_id, node_type });

    const nodes = await this.getNetworkNodes(network_id);
    return nodes.filter(node => node.node_type === node_type);
  }

  /**
   * 根据能力查找节点
   */
  async findNodesByCapability(
    network_id: string,
    capability: string
  ): Promise<NetworkNode[]> {
    this.logger.debug('根据能力查找节点', { network_id, capability });

    const nodes = await this.getNetworkNodes(network_id);
    return nodes.filter(node => node.capabilities.includes(capability as any));
  }

  /**
   * 检查节点健康状态
   */
  async checkNodeHealth(network_id: string, node_id: string): Promise<boolean> {
    this.logger.debug('检查节点健康状态', { network_id, node_id });

    const networkNodes = this.nodeRegistry.get(network_id);
    if (networkNodes) {
      const node = networkNodes.get(node_id);
      return node ? node.status === 'online' : false;
    }
    return false;
  }

  /**
   * 清空所有数据（仅用于测试）
   */
  async clear(): Promise<void> {
    this.logger.debug('清空所有节点数据');
    this.nodeRegistry.clear();
  }
}

/**
 * 内存路由仓储实现
 */
export class MemoryRoutingRepository implements RoutingRepository {
  private routeCache = new Map<string, RoutingResult>();
  private topologyCache = new Map<string, Map<string, string[]>>(); // networkId -> adjacency list
  private logger = new Logger('MemoryRoutingRepository');

  /**
   * 计算路由
   */
  async calculateRoute(request: RoutingRequest): Promise<RoutingResult> {
    this.logger.debug('计算路由', { request });

    // 简化的路由计算实现
    const path = [request.source_node_id, request.target_node_id];

    return {
      path,
      estimated_latency: 100, // 模拟延迟
      estimated_cost: 1.0, // 模拟成本
      reliability: 0.95, // 模拟可靠性
      alternative_paths: [],
    };
  }

  /**
   * 缓存路由结果
   */
  async cacheRoute(
    request: RoutingRequest,
    result: RoutingResult
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(request);
    this.logger.debug('缓存路由结果', { cacheKey });
    this.routeCache.set(cacheKey, result);
  }

  /**
   * 获取缓存的路由
   */
  async getCachedRoute(request: RoutingRequest): Promise<RoutingResult | null> {
    const cacheKey = this.generateCacheKey(request);
    this.logger.debug('获取缓存的路由', { cacheKey });
    return this.routeCache.get(cacheKey) || null;
  }

  /**
   * 清除路由缓存
   */
  async clearRouteCache(network_id: string): Promise<void> {
    this.logger.debug('清除路由缓存', { network_id });

    const keysToDelete: string[] = [];
    for (const key of this.routeCache.keys()) {
      if (key.startsWith(`${network_id}:`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.routeCache.delete(key));
    this.topologyCache.delete(network_id);
  }

  /**
   * 更新网络拓扑
   */
  async updateTopology(
    network_id: string,
    nodes: NetworkNode[]
  ): Promise<void> {
    this.logger.debug('更新网络拓扑', { network_id, node_count: nodes.length });

    // 简化的拓扑构建
    const adjacencyList = new Map<string, string[]>();

    nodes.forEach(node => {
      adjacencyList.set(node.node_id, []);
    });

    // 为简化，假设所有节点都相互连接（完全图）
    nodes.forEach(node => {
      const neighbors = nodes
        .filter(n => n.node_id !== node.node_id)
        .map(n => n.node_id);
      adjacencyList.set(node.node_id, neighbors);
    });

    this.topologyCache.set(network_id, adjacencyList);
  }

  /**
   * 获取网络拓扑
   */
  async getTopology(network_id: string): Promise<Map<string, string[]> | null> {
    this.logger.debug('获取网络拓扑', { network_id });
    return this.topologyCache.get(network_id) || null;
  }

  /**
   * 验证路由路径
   */
  async validateRoute(network_id: string, path: string[]): Promise<boolean> {
    this.logger.debug('验证路由路径', { network_id, path });

    const topology = this.topologyCache.get(network_id);
    if (!topology || path.length < 2) {
      return false;
    }

    // 验证路径中每一步都是有效的连接
    for (let i = 0; i < path.length - 1; i++) {
      const currentNode = path[i];
      const nextNode = path[i + 1];
      const neighbors = topology.get(currentNode);

      if (!neighbors || !neighbors.includes(nextNode)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(request: RoutingRequest): string {
    return `${request.networkId}:${request.source_node_id}:${request.target_node_id}`;
  }

  /**
   * 清空所有数据（仅用于测试）
   */
  async clear(): Promise<void> {
    this.logger.debug('清空所有路由数据');
    this.routeCache.clear();
    this.topologyCache.clear();
  }
}
