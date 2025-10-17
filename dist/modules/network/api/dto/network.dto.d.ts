import { NetworkTopology, NodeType, NodeStatus, NodeCapability, CommunicationProtocol, NetworkStatus, DiscoveryType, RoutingAlgorithm, LoadBalancingStrategy, NetworkOperation } from '../../types';
export interface NodeAddressDto {
    host: string;
    port: number;
    protocol: CommunicationProtocol;
}
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
export interface DiscoveryMechanismDto {
    type: DiscoveryType;
    enabled: boolean;
    configuration: {
        [key: string]: unknown;
    };
}
export interface RoutingStrategyDto {
    algorithm: RoutingAlgorithm;
    loadBalancing: LoadBalancingStrategy;
    configuration: {
        [key: string]: unknown;
    };
}
export interface PerformanceMetricsDto {
    enabled: boolean;
    collectionIntervalSeconds: number;
    metrics: {
        [key: string]: unknown;
    };
}
export interface MonitoringIntegrationDto {
    enabled: boolean;
    endpoints: string[];
    configuration: {
        [key: string]: unknown;
    };
}
export interface AuditTrailEntryDto {
    timestamp: string;
    action: string;
    actor: string;
    details: {
        [key: string]: unknown;
    };
}
export interface VersionHistoryEntryDto {
    version: string;
    timestamp: string;
    changes: string[];
    author: string;
}
export interface SearchMetadataDto {
    tags: string[];
    keywords: string[];
    categories: string[];
    indexed: boolean;
}
export interface EventIntegrationDto {
    enabled: boolean;
    eventTypes: string[];
    configuration: {
        [key: string]: unknown;
    };
}
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
export interface AddNodeDto {
    agentId: string;
    nodeType: NodeType;
    capabilities?: NodeCapability[];
    address?: NodeAddressDto;
}
export interface UpdateNodeStatusDto {
    status: NodeStatus;
}
export interface AddEdgeDto {
    sourceNodeId: string;
    targetNodeId: string;
    edgeType: string;
    direction: 'bidirectional' | 'unidirectional';
    weight?: number;
}
export interface NetworkStatsDto {
    totalNodes: number;
    onlineNodes: number;
    totalEdges: number;
    activeEdges: number;
    topologyEfficiency: number;
}
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
export interface NetworkSearchDto {
    query: string;
    filters?: {
        topology?: string;
        status?: string;
        tags?: string[];
    };
}
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
export interface NetworkPaginationResultDto {
    networks: NetworkDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface NetworkHealthDto {
    networkId: string;
    isHealthy: boolean;
    healthScore: number;
    issues: string[];
    recommendations: string[];
}
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