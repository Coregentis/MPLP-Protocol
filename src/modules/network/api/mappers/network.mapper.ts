/**
 * Network模块API层映射器
 * 
 * 严格遵循MPLP模块标准化规则和双重命名约定
 * - Schema层使用snake_case命名
 * - TypeScript层使用camelCase命名
 * - 提供完整的双向映射功能
 * 
 * @version 1.0.0
 * @created 2025-08-10
 * @compliance 模块标准化规则 - API层Mapper (MANDATORY)
 * @compliance 双重命名约定 - Schema↔TypeScript映射 (MANDATORY)
 */

import { UUID, Timestamp, Version } from '../../../../public/shared/types';
import {
  CreateNetworkRequestDto,
  UpdateNetworkRequestDto,
  NetworkQueryRequestDto,
  NetworkResponseDto,
  NetworkOperationResultDto,
  NetworkListResultDto,
  NetworkNodeDto,
  NetworkConnectionDto,
  NetworkConfigurationDto,
  NetworkSecurityDto,
  NetworkMetadataDto,
  NodeRegistrationRequestDto,
  NodeRegistrationResultDto,
  NodeAddressDto,
  NodeMetadataDto,
  LoadBalancingDto,
  FailoverDto,
  EncryptionDto,
  AuthenticationDto,
  AuthorizationDto,
  FirewallDto,
  NetworkTopologyDto,
  NodeTypeDto,
  NodeStatusDto,
  ConnectionStatusDto,
  ConnectionTypeDto
} from '../dto/network.dto';

// ===== Schema层接口定义 (snake_case) =====

/**
 * Network协议Schema接口 (Schema层 - snake_case)
 */
export interface NetworkProtocolSchema {
  network_id: UUID;
  version: Version;
  timestamp: Timestamp;
  context_id: UUID;
  name: string;
  description?: string;
  topology: NetworkTopologyDto;
  nodes: NetworkNodeSchema[];
  connections: NetworkConnectionSchema[];
  configuration?: NetworkConfigurationSchema;
  security?: NetworkSecuritySchema;
  metadata?: NetworkMetadataSchema;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

/**
 * 网络节点Schema (Schema层 - snake_case)
 */
export interface NetworkNodeSchema {
  node_id: UUID;
  agent_id: UUID;
  node_type: NodeTypeDto;
  status: NodeStatusDto;
  capabilities: string[];
  address: NodeAddressSchema;
  metadata?: NodeMetadataSchema;
  last_seen?: Timestamp;
  joined_at: Timestamp;
}

/**
 * 节点地址Schema (Schema层 - snake_case)
 */
export interface NodeAddressSchema {
  host: string;
  port: number;
  protocol: string;
  path?: string;
}

/**
 * 节点元数据Schema (Schema层 - snake_case)
 */
export interface NodeMetadataSchema {
  version?: string;
  platform?: string;
  region?: string;
  zone?: string;
  tags?: string[];
  custom_properties?: Record<string, unknown>;
}

/**
 * 网络连接Schema (Schema层 - snake_case)
 */
export interface NetworkConnectionSchema {
  connection_id: UUID;
  source_node_id: UUID;
  target_node_id: UUID;
  connection_type: ConnectionTypeDto;
  status: ConnectionStatusDto;
  latency?: number;
  bandwidth?: number;
  reliability?: number;
  established_at: Timestamp;
  last_activity?: Timestamp;
}

/**
 * 网络配置Schema (Schema层 - snake_case)
 */
export interface NetworkConfigurationSchema {
  max_nodes?: number;
  max_connections?: number;
  heartbeat_interval?: number;
  connection_timeout?: number;
  retry_attempts?: number;
  load_balancing?: LoadBalancingSchema;
  failover?: FailoverSchema;
}

/**
 * 负载均衡Schema (Schema层 - snake_case)
 */
export interface LoadBalancingSchema {
  enabled: boolean;
  algorithm: string;
  weights?: Record<string, number>;
}

/**
 * 故障转移Schema (Schema层 - snake_case)
 */
export interface FailoverSchema {
  enabled: boolean;
  strategy: string;
  backup_nodes?: UUID[];
  switchover_time?: number;
}

/**
 * 网络安全Schema (Schema层 - snake_case)
 */
export interface NetworkSecuritySchema {
  encryption: EncryptionSchema;
  authentication: AuthenticationSchema;
  authorization?: AuthorizationSchema;
  firewall?: FirewallSchema;
}

/**
 * 加密Schema (Schema层 - snake_case)
 */
export interface EncryptionSchema {
  enabled: boolean;
  algorithm: string;
  key_size?: number;
}

/**
 * 认证Schema (Schema层 - snake_case)
 */
export interface AuthenticationSchema {
  method: string;
  token_expiry?: number;
  refresh_enabled?: boolean;
}

/**
 * 授权Schema (Schema层 - snake_case)
 */
export interface AuthorizationSchema {
  enabled: boolean;
  policies: AuthorizationPolicySchema[];
}

/**
 * 授权策略Schema (Schema层 - snake_case)
 */
export interface AuthorizationPolicySchema {
  policy_id: UUID;
  name: string;
  rules: AuthorizationRuleSchema[];
}

/**
 * 授权规则Schema (Schema层 - snake_case)
 */
export interface AuthorizationRuleSchema {
  resource: string;
  action: string;
  effect: 'allow' | 'deny';
  conditions?: Record<string, unknown>;
}

/**
 * 防火墙Schema (Schema层 - snake_case)
 */
export interface FirewallSchema {
  enabled: boolean;
  rules: FirewallRuleSchema[];
}

/**
 * 防火墙规则Schema (Schema层 - snake_case)
 */
export interface FirewallRuleSchema {
  rule_id: UUID;
  name: string;
  action: 'allow' | 'deny' | 'log';
  source?: string;
  destination?: string;
  port?: number;
  protocol?: string;
}

/**
 * 网络元数据Schema (Schema层 - snake_case)
 */
export interface NetworkMetadataSchema {
  owner?: string;
  organization?: string;
  environment?: string;
  region?: string;
  tags?: string[];
  custom_properties?: Record<string, unknown>;
}

// ===== Network映射器类 =====

/**
 * Network模块映射器
 * 实现Schema层(snake_case)和TypeScript层(camelCase)之间的双向映射
 */
export class NetworkMapper {
  /**
   * TypeScript实体 → Schema格式 (camelCase → snake_case)
   */
  static toSchema(dto: NetworkResponseDto): NetworkProtocolSchema {
    return {
      network_id: dto.networkId,
      version: dto.version,
      timestamp: dto.timestamp,
      context_id: dto.contextId,
      name: dto.name,
      description: dto.description,
      topology: dto.topology,
      nodes: dto.nodes.map(node => this.mapNodeToSchema(node)),
      connections: dto.connections.map(conn => this.mapConnectionToSchema(conn)),
      configuration: dto.configuration ? this.mapConfigurationToSchema(dto.configuration) : undefined,
      security: dto.security ? this.mapSecurityToSchema(dto.security) : undefined,
      metadata: dto.metadata ? this.mapMetadataToSchema(dto.metadata) : undefined,
      created_at: dto.createdAt,
      updated_at: dto.updatedAt
    };
  }

  /**
   * Schema格式 → TypeScript数据 (snake_case → camelCase)
   */
  static fromSchema(schema: NetworkProtocolSchema): NetworkResponseDto {
    return {
      networkId: schema.network_id,
      version: schema.version,
      timestamp: schema.timestamp,
      contextId: schema.context_id,
      name: schema.name,
      description: schema.description,
      topology: schema.topology,
      nodes: schema.nodes.map(node => this.mapNodeFromSchema(node)),
      connections: schema.connections.map(conn => this.mapConnectionFromSchema(conn)),
      configuration: schema.configuration ? this.mapConfigurationFromSchema(schema.configuration) : undefined,
      security: schema.security ? this.mapSecurityFromSchema(schema.security) : undefined,
      metadata: schema.metadata ? this.mapMetadataFromSchema(schema.metadata) : undefined,
      createdAt: schema.created_at || schema.timestamp,
      updatedAt: schema.updated_at || schema.timestamp
    };
  }

  /**
   * 验证Schema数据
   */
  static validateSchema(data: unknown): data is NetworkProtocolSchema {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const schema = data as Record<string, unknown>;
    
    // 验证必需字段
    const requiredFields = [
      'network_id',
      'version',
      'timestamp',
      'context_id',
      'name',
      'topology',
      'nodes',
      'connections'
    ];

    return requiredFields.every(field => 
      field in schema && schema[field] !== undefined && schema[field] !== null
    );
  }

  /**
   * 批量转换方法 (TypeScript → Schema)
   */
  static toSchemaArray(dtos: NetworkResponseDto[]): NetworkProtocolSchema[] {
    return dtos.map(dto => this.toSchema(dto));
  }

  /**
   * 批量转换方法 (Schema → TypeScript)
   */
  static fromSchemaArray(schemas: NetworkProtocolSchema[]): NetworkResponseDto[] {
    return schemas.map(schema => this.fromSchema(schema));
  }

  // ===== 私有映射方法 =====

  private static mapNodeToSchema(dto: NetworkNodeDto): NetworkNodeSchema {
    return {
      node_id: dto.nodeId,
      agent_id: dto.agentId,
      node_type: dto.nodeType,
      status: dto.status,
      capabilities: dto.capabilities,
      address: {
        host: dto.address.host,
        port: dto.address.port,
        protocol: dto.address.protocol,
        path: dto.address.path
      },
      metadata: dto.metadata ? {
        version: dto.metadata.version,
        platform: dto.metadata.platform,
        region: dto.metadata.region,
        zone: dto.metadata.zone,
        tags: dto.metadata.tags,
        custom_properties: dto.metadata.customProperties
      } : undefined,
      last_seen: dto.lastSeen,
      joined_at: dto.joinedAt
    };
  }

  private static mapNodeFromSchema(schema: NetworkNodeSchema): NetworkNodeDto {
    return {
      nodeId: schema.node_id,
      agentId: schema.agent_id,
      nodeType: schema.node_type,
      status: schema.status,
      capabilities: schema.capabilities as any[],
      address: {
        host: schema.address.host,
        port: schema.address.port,
        protocol: schema.address.protocol as any,
        path: schema.address.path
      },
      metadata: schema.metadata ? {
        version: schema.metadata.version,
        platform: schema.metadata.platform,
        region: schema.metadata.region,
        zone: schema.metadata.zone,
        tags: schema.metadata.tags,
        customProperties: schema.metadata.custom_properties
      } : undefined,
      lastSeen: schema.last_seen,
      joinedAt: schema.joined_at
    };
  }

  private static mapConnectionToSchema(dto: NetworkConnectionDto): NetworkConnectionSchema {
    return {
      connection_id: dto.connectionId,
      source_node_id: dto.sourceNodeId,
      target_node_id: dto.targetNodeId,
      connection_type: dto.connectionType,
      status: dto.status,
      latency: dto.latency,
      bandwidth: dto.bandwidth,
      reliability: dto.reliability,
      established_at: dto.establishedAt,
      last_activity: dto.lastActivity
    };
  }

  private static mapConnectionFromSchema(schema: NetworkConnectionSchema): NetworkConnectionDto {
    return {
      connectionId: schema.connection_id,
      sourceNodeId: schema.source_node_id,
      targetNodeId: schema.target_node_id,
      connectionType: schema.connection_type,
      status: schema.status,
      latency: schema.latency,
      bandwidth: schema.bandwidth,
      reliability: schema.reliability,
      establishedAt: schema.established_at,
      lastActivity: schema.last_activity
    };
  }

  private static mapConfigurationToSchema(dto: NetworkConfigurationDto): NetworkConfigurationSchema {
    return {
      max_nodes: dto.maxNodes,
      max_connections: dto.maxConnections,
      heartbeat_interval: dto.heartbeatInterval,
      connection_timeout: dto.connectionTimeout,
      retry_attempts: dto.retryAttempts,
      load_balancing: dto.loadBalancing ? {
        enabled: dto.loadBalancing.enabled,
        algorithm: dto.loadBalancing.algorithm,
        weights: dto.loadBalancing.weights
      } : undefined,
      failover: dto.failover ? {
        enabled: dto.failover.enabled,
        strategy: dto.failover.strategy,
        backup_nodes: dto.failover.backupNodes,
        switchover_time: dto.failover.switchoverTime
      } : undefined
    };
  }

  private static mapConfigurationFromSchema(schema: NetworkConfigurationSchema): NetworkConfigurationDto {
    return {
      maxNodes: schema.max_nodes,
      maxConnections: schema.max_connections,
      heartbeatInterval: schema.heartbeat_interval,
      connectionTimeout: schema.connection_timeout,
      retryAttempts: schema.retry_attempts,
      loadBalancing: schema.load_balancing ? {
        enabled: schema.load_balancing.enabled,
        algorithm: schema.load_balancing.algorithm as any,
        weights: schema.load_balancing.weights
      } : undefined,
      failover: schema.failover ? {
        enabled: schema.failover.enabled,
        strategy: schema.failover.strategy as any,
        backupNodes: schema.failover.backup_nodes,
        switchoverTime: schema.failover.switchover_time
      } : undefined
    };
  }

  private static mapSecurityToSchema(dto: NetworkSecurityDto): NetworkSecuritySchema {
    return {
      encryption: {
        enabled: dto.encryption.enabled,
        algorithm: dto.encryption.algorithm,
        key_size: dto.encryption.keySize
      },
      authentication: {
        method: dto.authentication.method,
        token_expiry: dto.authentication.tokenExpiry,
        refresh_enabled: dto.authentication.refreshEnabled
      },
      authorization: dto.authorization ? {
        enabled: dto.authorization.enabled,
        policies: dto.authorization.policies.map(policy => ({
          policy_id: policy.policyId,
          name: policy.name,
          rules: policy.rules.map(rule => ({
            resource: rule.resource,
            action: rule.action,
            effect: rule.effect,
            conditions: rule.conditions
          }))
        }))
      } : undefined,
      firewall: dto.firewall ? {
        enabled: dto.firewall.enabled,
        rules: dto.firewall.rules.map(rule => ({
          rule_id: rule.ruleId,
          name: rule.name,
          action: rule.action,
          source: rule.source,
          destination: rule.destination,
          port: rule.port,
          protocol: rule.protocol
        }))
      } : undefined
    };
  }

  private static mapSecurityFromSchema(schema: NetworkSecuritySchema): NetworkSecurityDto {
    return {
      encryption: {
        enabled: schema.encryption.enabled,
        algorithm: schema.encryption.algorithm as any,
        keySize: schema.encryption.key_size
      },
      authentication: {
        method: schema.authentication.method as any,
        tokenExpiry: schema.authentication.token_expiry,
        refreshEnabled: schema.authentication.refresh_enabled
      },
      authorization: schema.authorization ? {
        enabled: schema.authorization.enabled,
        policies: schema.authorization.policies.map(policy => ({
          policyId: policy.policy_id,
          name: policy.name,
          rules: policy.rules.map(rule => ({
            resource: rule.resource,
            action: rule.action,
            effect: rule.effect,
            conditions: rule.conditions
          }))
        }))
      } : undefined,
      firewall: schema.firewall ? {
        enabled: schema.firewall.enabled,
        rules: schema.firewall.rules.map(rule => ({
          ruleId: rule.rule_id,
          name: rule.name,
          action: rule.action,
          source: rule.source,
          destination: rule.destination,
          port: rule.port,
          protocol: rule.protocol as any
        }))
      } : undefined
    };
  }

  private static mapMetadataToSchema(dto: NetworkMetadataDto): NetworkMetadataSchema {
    return {
      owner: dto.owner,
      organization: dto.organization,
      environment: dto.environment,
      region: dto.region,
      tags: dto.tags,
      custom_properties: dto.customProperties
    };
  }

  private static mapMetadataFromSchema(schema: NetworkMetadataSchema): NetworkMetadataDto {
    return {
      owner: schema.owner,
      organization: schema.organization,
      environment: schema.environment,
      region: schema.region,
      tags: schema.tags,
      customProperties: schema.custom_properties
    };
  }
}
