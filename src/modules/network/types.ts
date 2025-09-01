/**
 * Network模块类型定义
 * 
 * @description Network模块的TypeScript类型定义
 * @version 1.0.0
 * @layer 类型层
 */

// ===== 基础类型定义 =====

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
 * 通信协议
 */
export type CommunicationProtocol = 
  | 'http'
  | 'https'
  | 'ws'
  | 'wss'
  | 'tcp'
  | 'udp';

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
 * 发现机制类型
 */
export type DiscoveryType = 
  | 'broadcast'
  | 'multicast'
  | 'registry'
  | 'gossip'
  | 'dht'
  | 'manual';

/**
 * 路由算法
 */
export type RoutingAlgorithm = 
  | 'shortest_path'
  | 'load_balanced'
  | 'priority_based'
  | 'adaptive'
  | 'flooding'
  | 'custom';

/**
 * 负载均衡策略
 */
export type LoadBalancingStrategy = 
  | 'round_robin'
  | 'weighted_round_robin'
  | 'least_connections'
  | 'least_response_time'
  | 'resource_based'
  | 'custom';

/**
 * 网络操作类型
 */
export type NetworkOperation = 
  | 'connect'
  | 'disconnect'
  | 'route'
  | 'broadcast'
  | 'discover';

// ===== 复合类型定义 =====

/**
 * 节点地址信息
 */
export interface NodeAddress {
  host: string;
  port: number;
  protocol: CommunicationProtocol;
}

/**
 * 节点元数据
 */
export interface NodeMetadata {
  [key: string]: unknown;
}

/**
 * 发现机制配置
 */
export interface DiscoveryMechanism {
  type: DiscoveryType;
  enabled: boolean;
  configuration: {
    [key: string]: unknown;
  };
}

/**
 * 路由策略配置
 */
export interface RoutingStrategy {
  algorithm: RoutingAlgorithm;
  loadBalancing: LoadBalancingStrategy;
  configuration: {
    [key: string]: unknown;
  };
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  enabled: boolean;
  collectionIntervalSeconds: number;
  metrics: {
    [key: string]: unknown;
  };
}

/**
 * 监控集成配置
 */
export interface MonitoringIntegration {
  enabled: boolean;
  endpoints: string[];
  configuration: {
    [key: string]: unknown;
  };
}

/**
 * 审计追踪条目
 */
export interface AuditTrailEntry {
  timestamp: string;
  action: string;
  actor: string;
  details: {
    [key: string]: unknown;
  };
}

/**
 * 版本历史条目
 */
export interface VersionHistoryEntry {
  version: string;
  timestamp: string;
  changes: string[];
  author: string;
}

/**
 * 搜索元数据
 */
export interface SearchMetadata {
  tags: string[];
  keywords: string[];
  categories: string[];
  indexed: boolean;
}

/**
 * 事件集成配置
 */
export interface EventIntegration {
  enabled: boolean;
  eventTypes: string[];
  configuration: {
    [key: string]: unknown;
  };
}
