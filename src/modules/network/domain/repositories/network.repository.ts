/**
 * MPLP Network Repository Interface - Domain Repository
 *
 * @version v1.0.0
 * @created 2025-08-02T01:32:00+08:00
 * @description 网络仓储接口，定义数据访问抽象
 */

import { Network } from '../entities/network.entity';
import {
  NetworkNode,
  NetworkQueryParams,
  NodeDiscoveryRequest,
  RoutingRequest,
  RoutingResult,
} from '../../types';

/**
 * 网络仓储接口
 */
export interface NetworkRepository {
  /**
   * 保存网络
   */
  save(network: Network): Promise<void>;

  /**
   * 根据ID查找网络
   */
  findById(network_id: string): Promise<Network | null>;

  /**
   * 根据上下文ID查找网络列表
   */
  findByContextId(context_id: string): Promise<Network[]>;

  /**
   * 根据创建者查找网络列表
   */
  findByCreatedBy(created_by: string): Promise<Network[]>;

  /**
   * 根据查询参数查找网络列表
   */
  findByQuery(params: NetworkQueryParams): Promise<{
    networks: Network[];
    total: number;
  }>;

  /**
   * 检查网络是否存在
   */
  exists(network_id: string): Promise<boolean>;

  /**
   * 删除网络
   */
  delete(network_id: string): Promise<void>;

  /**
   * 批量删除网络
   */
  deleteBatch(network_ids: string[]): Promise<void>;

  /**
   * 更新网络状态
   */
  updateStatus(network_id: string, status: string): Promise<void>;

  /**
   * 获取网络统计信息
   */
  getStatistics(): Promise<NetworkStatistics>;
}

/**
 * 节点发现仓储接口
 */
export interface NodeDiscoveryRepository {
  /**
   * 发现节点
   */
  discoverNodes(request: NodeDiscoveryRequest): Promise<NetworkNode[]>;

  /**
   * 注册节点
   */
  registerNode(network_id: string, node: NetworkNode): Promise<void>;

  /**
   * 注销节点
   */
  unregisterNode(network_id: string, node_id: string): Promise<void>;

  /**
   * 更新节点状态
   */
  updateNodeStatus(
    network_id: string,
    node_id: string,
    status: string
  ): Promise<void>;

  /**
   * 获取网络中的所有节点
   */
  getNetworkNodes(network_id: string): Promise<NetworkNode[]>;

  /**
   * 根据类型查找节点
   */
  findNodesByType(
    network_id: string,
    node_type: string
  ): Promise<NetworkNode[]>;

  /**
   * 根据能力查找节点
   */
  findNodesByCapability(
    network_id: string,
    capability: string
  ): Promise<NetworkNode[]>;

  /**
   * 检查节点健康状态
   */
  checkNodeHealth(network_id: string, node_id: string): Promise<boolean>;
}

/**
 * 路由仓储接口
 */
export interface RoutingRepository {
  /**
   * 计算路由
   */
  calculateRoute(request: RoutingRequest): Promise<RoutingResult>;

  /**
   * 缓存路由结果
   */
  cacheRoute(request: RoutingRequest, result: RoutingResult): Promise<void>;

  /**
   * 获取缓存的路由
   */
  getCachedRoute(request: RoutingRequest): Promise<RoutingResult | null>;

  /**
   * 清除路由缓存
   */
  clearRouteCache(network_id: string): Promise<void>;

  /**
   * 更新网络拓扑
   */
  updateTopology(network_id: string, nodes: NetworkNode[]): Promise<void>;

  /**
   * 获取网络拓扑
   */
  getTopology(network_id: string): Promise<Map<string, string[]> | null>;

  /**
   * 验证路由路径
   */
  validateRoute(network_id: string, path: string[]): Promise<boolean>;
}

/**
 * 网络统计信息
 */
export interface NetworkStatistics {
  total_networks: number;
  active_networks: number;
  completed_networks: number;
  failed_networks: number;
  total_nodes: number;
  average_nodes_per_network: number;
  most_used_topology: string;
  most_used_discovery_type: string;
}
