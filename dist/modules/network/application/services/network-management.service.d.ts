import { NetworkEntity, NetworkNode } from '../../domain/entities/network.entity';
import { INetworkRepository } from '../../domain/repositories/network-repository.interface';
import { NetworkTopology, NodeType, NodeStatus, NetworkStatus, DiscoveryMechanism, RoutingStrategy, PerformanceMetrics, MonitoringIntegration, SearchMetadata, EventIntegration } from '../../types';
export interface CreateNetworkData {
    contextId: string;
    name: string;
    description?: string;
    topology: NetworkTopology;
    nodes: Array<{
        agentId: string;
        nodeType: NodeType;
        capabilities?: string[];
        address?: {
            host: string;
            port: number;
            protocol: string;
        };
    }>;
    discoveryMechanism: DiscoveryMechanism;
    routingStrategy: RoutingStrategy;
    createdBy: string;
}
export interface UpdateNetworkData {
    name?: string;
    description?: string;
    status?: NetworkStatus;
    discoveryMechanism?: DiscoveryMechanism;
    routingStrategy?: RoutingStrategy;
    performanceMetrics?: PerformanceMetrics;
    monitoringIntegration?: MonitoringIntegration;
    searchMetadata?: SearchMetadata;
    eventIntegration?: EventIntegration;
}
export declare class NetworkManagementService {
    private readonly networkRepository;
    constructor(networkRepository: INetworkRepository);
    createNetwork(data: CreateNetworkData): Promise<NetworkEntity>;
    getNetworkById(networkId: string): Promise<NetworkEntity | null>;
    getNetworkByName(name: string): Promise<NetworkEntity | null>;
    getNetworksByContextId(contextId: string): Promise<NetworkEntity[]>;
    updateNetwork(networkId: string, data: UpdateNetworkData): Promise<NetworkEntity | null>;
    deleteNetwork(networkId: string): Promise<boolean>;
    addNodeToNetwork(networkId: string, nodeData: {
        agentId: string;
        nodeType: NodeType;
        capabilities?: string[];
        address?: {
            host: string;
            port: number;
            protocol: string;
        };
    }): Promise<NetworkEntity | null>;
    removeNodeFromNetwork(networkId: string, nodeId: string): Promise<NetworkEntity | null>;
    updateNodeStatus(networkId: string, nodeId: string, status: NodeStatus): Promise<NetworkEntity | null>;
    addEdgeToNetwork(networkId: string, edgeData: {
        sourceNodeId: string;
        targetNodeId: string;
        edgeType: string;
        direction: 'bidirectional' | 'unidirectional';
        weight?: number;
    }): Promise<NetworkEntity | null>;
    getNetworkStatistics(networkId: string): Promise<{
        totalNodes: number;
        onlineNodes: number;
        totalEdges: number;
        activeEdges: number;
        topologyEfficiency: number;
    } | null>;
    checkNetworkHealth(networkId: string): Promise<boolean | null>;
    getNodeNeighbors(networkId: string, nodeId: string): Promise<NetworkNode[] | null>;
    searchNetworks(query: string, filters?: {
        topology?: string;
        status?: string;
        tags?: string[];
    }): Promise<NetworkEntity[]>;
    getGlobalStatistics(): Promise<{
        totalNetworks: number;
        activeNetworks: number;
        totalNodes: number;
        totalEdges: number;
        topologyDistribution: Record<string, number>;
        statusDistribution: Record<string, number>;
    }>;
    private generateNetworkId;
    private generateNodeId;
    private generateEdgeId;
}
//# sourceMappingURL=network-management.service.d.ts.map