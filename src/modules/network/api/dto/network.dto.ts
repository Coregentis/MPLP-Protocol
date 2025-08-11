/**
 * Network模块API层数据传输对象 (DTO)
 * 
 * 严格遵循MPLP模块标准化规则和双重命名约定
 * - API层使用camelCase命名
 * - 与Schema层(snake_case)通过Mapper进行转换
 * 
 * @version 1.0.0
 * @created 2025-08-10
 * @compliance 模块标准化规则 - API层DTO (MANDATORY)
 * @compliance 双重命名约定 - camelCase (MANDATORY)
 */

import { UUID, Timestamp, Version } from '../../../../public/shared/types';

// ===== 基础DTO接口 =====

/**
 * Network创建请求DTO (API层 - camelCase)
 */
export interface CreateNetworkRequestDto {
  contextId: UUID;
  name: string;
  description?: string;
  topology: NetworkTopologyDto;
  configuration?: NetworkConfigurationDto;
  security?: NetworkSecurityDto;
  metadata?: NetworkMetadataDto;
}

/**
 * Network更新请求DTO (API层 - camelCase)
 */
export interface UpdateNetworkRequestDto {
  networkId: UUID;
  name?: string;
  description?: string;
  topology?: NetworkTopologyDto;
  configuration?: NetworkConfigurationDto;
  security?: NetworkSecurityDto;
  metadata?: NetworkMetadataDto;
}

/**
 * Network查询请求DTO (API层 - camelCase)
 */
export interface NetworkQueryRequestDto {
  contextId?: UUID;
  topology?: NetworkTopologyDto;
  status?: NetworkStatusDto;
  name?: string;
  limit?: number;
  offset?: number;
}

/**
 * Network响应DTO (API层 - camelCase)
 */
export interface NetworkResponseDto {
  networkId: UUID;
  version: Version;
  timestamp: Timestamp;
  contextId: UUID;
  name: string;
  description?: string;
  topology: NetworkTopologyDto;
  nodes: NetworkNodeDto[];
  connections: NetworkConnectionDto[];
  configuration?: NetworkConfigurationDto;
  security?: NetworkSecurityDto;
  metadata?: NetworkMetadataDto;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ===== 枚举类型DTO =====

/**
 * 网络拓扑类型DTO (API层 - camelCase)
 */
export type NetworkTopologyDto = 
  | 'star'
  | 'mesh'
  | 'tree'
  | 'ring'
  | 'bus'
  | 'hybrid'
  | 'hierarchical';

/**
 * 网络状态DTO (API层 - camelCase)
 */
export type NetworkStatusDto = 
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * 节点类型DTO (API层 - camelCase)
 */
export type NodeTypeDto = 
  | 'coordinator'
  | 'worker'
  | 'gateway'
  | 'relay'
  | 'monitor'
  | 'backup';

/**
 * 节点状态DTO (API层 - camelCase)
 */
export type NodeStatusDto = 
  | 'online'
  | 'offline'
  | 'connecting'
  | 'disconnecting'
  | 'error'
  | 'maintenance';

/**
 * 节点能力DTO (API层 - camelCase)
 */
export type NodeCapabilityDto = 
  | 'compute'
  | 'storage'
  | 'network'
  | 'coordination'
  | 'monitoring'
  | 'security';

/**
 * 连接状态DTO (API层 - camelCase)
 */
export type ConnectionStatusDto = 
  | 'established'
  | 'connecting'
  | 'disconnected'
  | 'failed'
  | 'timeout';

// ===== 复杂对象DTO =====

/**
 * 网络节点DTO (API层 - camelCase)
 */
export interface NetworkNodeDto {
  nodeId: UUID;
  agentId: UUID;
  nodeType: NodeTypeDto;
  status: NodeStatusDto;
  capabilities: NodeCapabilityDto[];
  address: NodeAddressDto;
  metadata?: NodeMetadataDto;
  lastSeen?: Timestamp;
  joinedAt: Timestamp;
}

/**
 * 节点地址DTO (API层 - camelCase)
 */
export interface NodeAddressDto {
  host: string;
  port: number;
  protocol: ProtocolTypeDto;
  path?: string;
}

/**
 * 协议类型DTO (API层 - camelCase)
 */
export type ProtocolTypeDto = 
  | 'http'
  | 'https'
  | 'ws'
  | 'wss'
  | 'tcp'
  | 'udp'
  | 'grpc';

/**
 * 节点元数据DTO (API层 - camelCase)
 */
export interface NodeMetadataDto {
  version?: string;
  platform?: string;
  region?: string;
  zone?: string;
  tags?: string[];
  customProperties?: Record<string, unknown>;
}

/**
 * 网络连接DTO (API层 - camelCase)
 */
export interface NetworkConnectionDto {
  connectionId: UUID;
  sourceNodeId: UUID;
  targetNodeId: UUID;
  connectionType: ConnectionTypeDto;
  status: ConnectionStatusDto;
  latency?: number;
  bandwidth?: number;
  reliability?: number;
  establishedAt: Timestamp;
  lastActivity?: Timestamp;
}

/**
 * 连接类型DTO (API层 - camelCase)
 */
export type ConnectionTypeDto = 
  | 'direct'
  | 'relay'
  | 'tunnel'
  | 'proxy';

/**
 * 网络配置DTO (API层 - camelCase)
 */
export interface NetworkConfigurationDto {
  maxNodes?: number;
  maxConnections?: number;
  heartbeatInterval?: number;
  connectionTimeout?: number;
  retryAttempts?: number;
  loadBalancing?: LoadBalancingDto;
  failover?: FailoverDto;
}

/**
 * 负载均衡DTO (API层 - camelCase)
 */
export interface LoadBalancingDto {
  enabled: boolean;
  algorithm: LoadBalancingAlgorithmDto;
  weights?: Record<string, number>;
}

/**
 * 负载均衡算法DTO (API层 - camelCase)
 */
export type LoadBalancingAlgorithmDto = 
  | 'round_robin'
  | 'weighted_round_robin'
  | 'least_connections'
  | 'random'
  | 'hash';

/**
 * 故障转移DTO (API层 - camelCase)
 */
export interface FailoverDto {
  enabled: boolean;
  strategy: FailoverStrategyDto;
  backupNodes?: UUID[];
  switchoverTime?: number;
}

/**
 * 故障转移策略DTO (API层 - camelCase)
 */
export type FailoverStrategyDto = 
  | 'automatic'
  | 'manual'
  | 'hybrid';

/**
 * 网络安全DTO (API层 - camelCase)
 */
export interface NetworkSecurityDto {
  encryption: EncryptionDto;
  authentication: AuthenticationDto;
  authorization?: AuthorizationDto;
  firewall?: FirewallDto;
}

/**
 * 加密DTO (API层 - camelCase)
 */
export interface EncryptionDto {
  enabled: boolean;
  algorithm: EncryptionAlgorithmDto;
  keySize?: number;
}

/**
 * 加密算法DTO (API层 - camelCase)
 */
export type EncryptionAlgorithmDto = 
  | 'AES-256'
  | 'ChaCha20'
  | 'RSA-2048'
  | 'RSA-4096';

/**
 * 认证DTO (API层 - camelCase)
 */
export interface AuthenticationDto {
  method: AuthenticationMethodDto;
  tokenExpiry?: number;
  refreshEnabled?: boolean;
}

/**
 * 认证方法DTO (API层 - camelCase)
 */
export type AuthenticationMethodDto = 
  | 'jwt'
  | 'oauth2'
  | 'api_key'
  | 'certificate';

/**
 * 授权DTO (API层 - camelCase)
 */
export interface AuthorizationDto {
  enabled: boolean;
  policies: AuthorizationPolicyDto[];
}

/**
 * 授权策略DTO (API层 - camelCase)
 */
export interface AuthorizationPolicyDto {
  policyId: UUID;
  name: string;
  rules: AuthorizationRuleDto[];
}

/**
 * 授权规则DTO (API层 - camelCase)
 */
export interface AuthorizationRuleDto {
  resource: string;
  action: string;
  effect: AuthorizationEffectDto;
  conditions?: Record<string, unknown>;
}

/**
 * 授权效果DTO (API层 - camelCase)
 */
export type AuthorizationEffectDto = 'allow' | 'deny';

/**
 * 防火墙DTO (API层 - camelCase)
 */
export interface FirewallDto {
  enabled: boolean;
  rules: FirewallRuleDto[];
}

/**
 * 防火墙规则DTO (API层 - camelCase)
 */
export interface FirewallRuleDto {
  ruleId: UUID;
  name: string;
  action: FirewallActionDto;
  source?: string;
  destination?: string;
  port?: number;
  protocol?: ProtocolTypeDto;
}

/**
 * 防火墙动作DTO (API层 - camelCase)
 */
export type FirewallActionDto = 'allow' | 'deny' | 'log';

/**
 * 网络元数据DTO (API层 - camelCase)
 */
export interface NetworkMetadataDto {
  owner?: string;
  organization?: string;
  environment?: string;
  region?: string;
  tags?: string[];
  customProperties?: Record<string, unknown>;
}

// ===== 操作结果DTO =====

/**
 * Network操作结果DTO (API层 - camelCase)
 */
export interface NetworkOperationResultDto {
  success: boolean;
  networkId?: UUID;
  message?: string;
  errors?: string[];
  data?: NetworkResponseDto;
}

/**
 * Network列表结果DTO (API层 - camelCase)
 */
export interface NetworkListResultDto {
  success: boolean;
  networks: NetworkResponseDto[];
  total: number;
  limit: number;
  offset: number;
  message?: string;
}

// ===== 节点操作DTO =====

/**
 * 节点注册请求DTO (API层 - camelCase)
 */
export interface NodeRegistrationRequestDto {
  networkId: UUID;
  agentId: UUID;
  nodeType: NodeTypeDto;
  capabilities: NodeCapabilityDto[];
  address: NodeAddressDto;
  metadata?: NodeMetadataDto;
}

/**
 * 节点注册结果DTO (API层 - camelCase)
 */
export interface NodeRegistrationResultDto {
  success: boolean;
  nodeId?: UUID;
  message?: string;
  errors?: string[];
  data?: NetworkNodeDto;
}
