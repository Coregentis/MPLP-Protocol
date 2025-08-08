/**
 * MPLP Network Module - Type Definitions
 *
 * @version v1.0.0
 * @created 2025-08-02T01:30:00+08:00
 * @description Network模块的TypeScript类型定义，基于现有network-manager.ts迁移
 */

// ==================== 核心实体类型 ====================

/**
 * 网络实体
 */
export interface NetworkEntity {
  networkId: string;
  version: string;
  timestamp: string;
  contextId: string;
  name: string;
  description?: string;
  topology: NetworkTopology;
  nodes: NetworkNode[];
  edges?: NetworkEdge[];
  discoveryMechanism: DiscoveryMechanism;
  routingStrategy: RoutingStrategy;
  status: NetworkStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  metadata?: Record<string, unknown>;
}

/**
 * 网络节点
 */
export interface NetworkNode {
  node_id: string;
  agentId: string;
  nodeType: NodeType;
  status: NodeStatus;
  capabilities: NodeCapability[];
  address?: NodeAddress;
  metadata?: Record<string, unknown>;
}

/**
 * 网络连接
 */
export interface NetworkEdge {
  edge_id: string;
  source_node_id: string;
  target_node_id: string;
  edge_type: EdgeType;
  direction: EdgeDirection;
  status: EdgeStatus;
  weight?: number;
  metadata?: Record<string, unknown>;
}

/**
 * 节点地址
 */
export interface NodeAddress {
  host: string;
  port: number;
  protocol: NodeProtocol;
}

/**
 * 发现机制
 */
export interface DiscoveryMechanism {
  type: DiscoveryType;
  registry_config?: RegistryConfig;
}

/**
 * 注册中心配置
 */
export interface RegistryConfig {
  endpoint?: string;
  authentication?: boolean;
  refresh_interval?: number;
}

/**
 * 路由策略
 */
export interface RoutingStrategy {
  algorithm: RoutingAlgorithm;
  load_balancing?: LoadBalancingConfig;
}

/**
 * 负载均衡配置
 */
export interface LoadBalancingConfig {
  method: LoadBalancingMethod;
}

// ==================== 枚举类型 ====================

/**
 * 网络拓扑类型
 */
export type NetworkTopology =
  | 'star'
  | 'mesh'
  | 'tree'
  | 'ring'
  | 'bus'
  | 'hybrid'
  | 'hierarchical';

/**
 * 网络状态
 */
export type NetworkStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * 节点类型
 */
export type NodeType =
  | 'coordinator'
  | 'worker'
  | 'gateway'
  | 'relay'
  | 'monitor'
  | 'backup';

/**
 * 节点状态
 */
export type NodeStatus =
  | 'online'
  | 'offline'
  | 'connecting'
  | 'disconnecting'
  | 'error'
  | 'maintenance';

/**
 * 节点能力
 */
export type NodeCapability =
  | 'compute'
  | 'storage'
  | 'network'
  | 'coordination'
  | 'monitoring'
  | 'security';

/**
 * 节点协议
 */
export type NodeProtocol = 'http' | 'https' | 'ws' | 'wss' | 'tcp' | 'udp';

/**
 * 连接类型
 */
export type EdgeType = 'data' | 'control' | 'monitoring' | 'backup';

/**
 * 连接方向
 */
export type EdgeDirection = 'unidirectional' | 'bidirectional';

/**
 * 连接状态
 */
export type EdgeStatus =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * 发现机制类型
 */
export type DiscoveryType =
  | 'static'
  | 'dynamic'
  | 'hybrid'
  | 'dns'
  | 'registry'
  | 'broadcast';

/**
 * 路由算法
 */
export type RoutingAlgorithm =
  | 'shortest_path'
  | 'load_balanced'
  | 'priority_based'
  | 'custom';

/**
 * 负载均衡方法
 */
export type LoadBalancingMethod =
  | 'round_robin'
  | 'weighted'
  | 'least_connections'
  | 'random';

// ==================== 请求/响应类型 ====================

/**
 * 创建网络请求
 */
export interface CreateNetworkRequest {
  contextId: string;
  name: string;
  description?: string;
  topology: NetworkTopology;
  nodes: Omit<NetworkNode, 'node_id'>[];
  discoveryMechanism: DiscoveryMechanism;
  routingStrategy: RoutingStrategy;
  metadata?: Record<string, unknown>;
}

/**
 * 更新网络请求
 */
export interface UpdateNetworkRequest {
  networkId: string;
  name?: string;
  description?: string;
  status?: NetworkStatus; // 修复：添加缺失的status字段
  topology?: NetworkTopology;
  discoveryMechanism?: Partial<DiscoveryMechanism>;
  routingStrategy?: Partial<RoutingStrategy>;
  metadata?: Record<string, unknown>;
}

/**
 * 网络查询参数
 */
export interface NetworkQueryParams {
  contextId?: string;
  status?: NetworkStatus;
  topology?: NetworkTopology;
  createdBy?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'updated_at' | 'name';
  sort_order?: 'asc' | 'desc';
}

/**
 * 节点发现请求
 */
export interface NodeDiscoveryRequest {
  networkId?: string;
  nodeType?: NodeType;
  capabilities?: NodeCapability[];
  region?: string;
  timeout?: number;
}

/**
 * 节点注册请求
 */
export interface NodeRegistrationRequest {
  networkId: string;
  agentId: string;
  nodeType: NodeType;
  capabilities: NodeCapability[];
  address?: NodeAddress;
  metadata?: Record<string, unknown>;
}

/**
 * 路由请求
 */
export interface RoutingRequest {
  networkId: string;
  source_node_id: string;
  target_node_id: string;
  message_type?: string;
  priority?: number;
  requirements?: RoutingRequirements;
}

/**
 * 路由要求
 */
export interface RoutingRequirements {
  max_latency?: number;
  min_bandwidth?: number;
  reliability?: number;
  security?: boolean;
}

/**
 * 网络响应
 */
export interface NetworkResponse {
  success: boolean;
  data?: NetworkEntity;
  error?: string;
  timestamp: string;
}

/**
 * 网络列表响应
 */
export interface NetworkListResponse {
  success: boolean;
  data?: {
    networks: NetworkEntity[];
    total: number;
    limit: number;
    offset: number;
  };
  error?: string;
  timestamp: string;
}

/**
 * 节点发现响应
 */
export interface NodeDiscoveryResponse {
  success: boolean;
  data?: NetworkNode[];
  error?: string;
  timestamp: string;
}

/**
 * 路由结果
 */
export interface RoutingResult {
  path: string[];
  estimated_latency: number;
  estimated_cost: number;
  reliability: number;
  alternative_paths?: string[][];
}

/**
 * 路由响应
 */
export interface RoutingResponse {
  success: boolean;
  data?: RoutingResult;
  error?: string;
  timestamp: string;
}

// ==================== 节点管理类型 ====================

/**
 * 添加节点请求
 */
export interface AddNodeRequest {
  networkId: string;
  agentId: string;
  nodeType: NodeType;
  capabilities: NodeCapability[];
  address?: NodeAddress;
  metadata?: Record<string, unknown>;
}

/**
 * 移除节点请求
 */
export interface RemoveNodeRequest {
  networkId: string;
  node_id: string;
  reason?: string;
}

/**
 * 更新节点请求
 */
export interface UpdateNodeRequest {
  networkId: string;
  node_id: string;
  nodeType?: NodeType;
  capabilities?: NodeCapability[];
  address?: NodeAddress;
  status?: NodeStatus;
  metadata?: Record<string, unknown>;
}

// ==================== 事件类型 ====================

/**
 * 网络事件
 */
export interface NetworkEvent {
  event_id: string;
  networkId: string;
  event_type: NetworkEventType;
  data: unknown;
  timestamp: string;
  source: string;
}

/**
 * 网络事件类型
 */
export type NetworkEventType =
  | 'network_created'
  | 'network_updated'
  | 'network_deleted'
  | 'node_added'
  | 'node_removed'
  | 'node_updated'
  | 'node_discovered'
  | 'node_registered'
  | 'topology_changed'
  | 'route_calculated'
  | 'connection_established'
  | 'connection_lost';

// ==================== 配置类型 ====================

/**
 * 网络模块配置
 */
export interface NetworkModuleConfig {
  max_nodes: number;
  max_networks: number;
  discovery_timeout: number;
  routing_timeout: number;
  enable_monitoring: boolean;
  enable_caching: boolean;
  cache_ttl: number;
  health_check_interval: number;
}

/**
 * 网络性能指标
 */
export interface NetworkPerformanceMetrics {
  networkId: string;
  node_count: number;
  edge_count: number;
  average_latency: number;
  total_throughput: number;
  error_rate: number;
  availability: number;
  topology_health: number;
  last_updated: string;
}
