/**
 * Network模块DTO定义
 *
 * @description Network模块的数据传输对象，基于DDD架构
 * @version 1.0.0
 * @layer API层 - DTO
 */
import { NetworkTopology, NodeType, NodeStatus, NodeCapability, CommunicationProtocol, NetworkStatus, DiscoveryType, RoutingAlgorithm, LoadBalancingStrategy, NetworkOperation } from '../../types';
/**
 * 节点地址DTO
 */
export interface NodeAddressDto {
    host: string;
    port: number;
    protocol: CommunicationProtocol;
}
/**
 * 网络节点DTO
 */
export interface NetworkNodeDto {
    nodeId: string;
    agentId: string;
    nodeType: NodeType;
    status: NodeStatus;
    capabilities: NodeCapability[];
    address?: NodeAddressDto;
    metadata: {
        [key: string]: unknown;
    };
}
/**
 * 网络边缘连接DTO
 */
export interface NetworkEdgeDto {
    edgeId: string;
    sourceNodeId: string;
    targetNodeId: string;
    edgeType: string;
    direction: 'bidirectional' | 'unidirectional';
    status: string;
    weight: number;
    metadata: {
        [key: string]: unknown;
    };
}
/**
 * 发现机制DTO
 */
export interface DiscoveryMechanismDto {
    type: DiscoveryType;
    enabled: boolean;
    configuration: {
        [key: string]: unknown;
    };
}
/**
 * 路由策略DTO
 */
export interface RoutingStrategyDto {
    algorithm: RoutingAlgorithm;
    loadBalancing: LoadBalancingStrategy;
    configuration: {
        [key: string]: unknown;
    };
}
/**
 * 性能指标DTO
 */
export interface PerformanceMetricsDto {
    enabled: boolean;
    collectionIntervalSeconds: number;
    metrics: {
        [key: string]: unknown;
    };
}
/**
 * 监控集成DTO
 */
export interface MonitoringIntegrationDto {
    enabled: boolean;
    endpoints: string[];
    configuration: {
        [key: string]: unknown;
    };
}
/**
 * 审计追踪条目DTO
 */
export interface AuditTrailEntryDto {
    timestamp: string;
    action: string;
    actor: string;
    details: {
        [key: string]: unknown;
    };
}
/**
 * 版本历史条目DTO
 */
export interface VersionHistoryEntryDto {
    version: string;
    timestamp: string;
    changes: string[];
    author: string;
}
/**
 * 搜索元数据DTO
 */
export interface SearchMetadataDto {
    tags: string[];
    keywords: string[];
    categories: string[];
    indexed: boolean;
}
/**
 * 事件集成DTO
 */
export interface EventIntegrationDto {
    enabled: boolean;
    eventTypes: string[];
    configuration: {
        [key: string]: unknown;
    };
}
/**
 * Network主DTO
 */
export interface NetworkDto {
    networkId: string;
    protocolVersion: string;
    timestamp: string;
    contextId: string;
    name: string;
    description?: string;
    topology: NetworkTopology;
    nodes: NetworkNodeDto[];
    edges: NetworkEdgeDto[];
    discoveryMechanism: DiscoveryMechanismDto;
    routingStrategy: RoutingStrategyDto;
    status: NetworkStatus;
    createdAt: string;
    updatedAt?: string;
    createdBy: string;
    auditTrail: AuditTrailEntryDto[];
    monitoringIntegration: MonitoringIntegrationDto;
    performanceMetrics: PerformanceMetricsDto;
    versionHistory: VersionHistoryEntryDto[];
    searchMetadata: SearchMetadataDto;
    networkOperation: NetworkOperation;
    eventIntegration: EventIntegrationDto;
}
/**
 * 创建网络DTO
 */
export interface CreateNetworkDto {
    contextId: string;
    name: string;
    description?: string;
    topology: NetworkTopology;
    nodes: Array<{
        agentId: string;
        nodeType: NodeType;
        capabilities?: NodeCapability[];
        address?: NodeAddressDto;
    }>;
    discoveryMechanism: DiscoveryMechanismDto;
    routingStrategy: RoutingStrategyDto;
    createdBy: string;
}
/**
 * 更新网络DTO
 */
export interface UpdateNetworkDto {
    name?: string;
    description?: string;
    status?: NetworkStatus;
    discoveryMechanism?: DiscoveryMechanismDto;
    routingStrategy?: RoutingStrategyDto;
    performanceMetrics?: PerformanceMetricsDto;
    monitoringIntegration?: MonitoringIntegrationDto;
    searchMetadata?: SearchMetadataDto;
    eventIntegration?: EventIntegrationDto;
}
/**
 * 添加节点DTO
 */
export interface AddNodeDto {
    agentId: string;
    nodeType: NodeType;
    capabilities?: NodeCapability[];
    address?: NodeAddressDto;
}
/**
 * 更新节点状态DTO
 */
export interface UpdateNodeStatusDto {
    status: NodeStatus;
}
/**
 * 添加边缘连接DTO
 */
export interface AddEdgeDto {
    sourceNodeId: string;
    targetNodeId: string;
    edgeType: string;
    direction: 'bidirectional' | 'unidirectional';
    weight?: number;
}
/**
 * 网络统计信息DTO
 */
export interface NetworkStatsDto {
    totalNodes: number;
    onlineNodes: number;
    totalEdges: number;
    activeEdges: number;
    topologyEfficiency: number;
}
/**
 * 全局统计信息DTO
 */
export interface GlobalStatsDto {
    totalNetworks: number;
    activeNetworks: number;
    totalNodes: number;
    totalEdges: number;
    topologyDistribution: {
        [topology: string]: number;
    };
    statusDistribution: {
        [status: string]: number;
    };
}
/**
 * 网络搜索DTO
 */
export interface NetworkSearchDto {
    query: string;
    filters?: {
        topology?: string;
        status?: string;
        tags?: string[];
    };
}
/**
 * 分页查询DTO
 */
export interface NetworkPaginationDto {
    page: number;
    limit: number;
    filters?: {
        contextId?: string;
        topology?: string;
        status?: string;
        createdBy?: string;
    };
}
/**
 * 分页结果DTO
 */
export interface NetworkPaginationResultDto {
    networks: NetworkDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
/**
 * 网络健康状态DTO
 */
export interface NetworkHealthDto {
    networkId: string;
    isHealthy: boolean;
    healthScore: number;
    issues: string[];
    recommendations: string[];
}
/**
 * 拓扑数据DTO
 */
export interface TopologyDataDto {
    nodes: Array<{
        id: string;
        type: string;
        status: string;
        position?: {
            x: number;
            y: number;
        };
    }>;
    edges: Array<{
        id: string;
        source: string;
        target: string;
        type: string;
        weight: number;
    }>;
}
/**
 * 更新拓扑DTO
 */
export interface UpdateTopologyDto {
    nodes: Array<{
        id: string;
        position?: {
            x: number;
            y: number;
        };
    }>;
    edges: Array<{
        source: string;
        target: string;
        weight?: number;
    }>;
}
//# sourceMappingURL=network.dto.d.ts.map