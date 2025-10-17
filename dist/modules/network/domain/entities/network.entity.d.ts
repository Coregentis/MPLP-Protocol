import { NetworkTopology, NodeType, NodeStatus, NodeCapability, NodeAddress, NodeMetadata, DiscoveryMechanism, RoutingStrategy, NetworkStatus, PerformanceMetrics, MonitoringIntegration, AuditTrailEntry, VersionHistoryEntry, SearchMetadata, EventIntegration, NetworkOperation } from '../../types';
export declare class NetworkNode {
    readonly nodeId: string;
    readonly agentId: string;
    readonly nodeType: NodeType;
    status: NodeStatus;
    capabilities: NodeCapability[];
    address?: NodeAddress | undefined;
    metadata: NodeMetadata;
    constructor(nodeId: string, agentId: string, nodeType: NodeType, status: NodeStatus, capabilities?: NodeCapability[], address?: NodeAddress | undefined, metadata?: NodeMetadata);
    updateStatus(newStatus: NodeStatus): void;
    addCapability(capability: NodeCapability): void;
    removeCapability(capability: NodeCapability): void;
    isOnline(): boolean;
    hasCapability(capability: NodeCapability): boolean;
}
export declare class NetworkEdge {
    readonly edgeId: string;
    readonly sourceNodeId: string;
    readonly targetNodeId: string;
    readonly edgeType: string;
    readonly direction: 'bidirectional' | 'unidirectional';
    status: string;
    weight: number;
    metadata: {
        [key: string]: unknown;
    };
    constructor(edgeId: string, sourceNodeId: string, targetNodeId: string, edgeType: string, direction: 'bidirectional' | 'unidirectional', status: string, weight?: number, metadata?: {
        [key: string]: unknown;
    });
    updateStatus(newStatus: string): void;
    updateWeight(newWeight: number): void;
    isActive(): boolean;
}
export interface NetworkEntityData {
    networkId: string;
    protocolVersion: string;
    timestamp: Date;
    contextId: string;
    name: string;
    topology: NetworkTopology;
    nodes: NetworkNode[];
    discoveryMechanism: DiscoveryMechanism;
    routingStrategy: RoutingStrategy;
    status: NetworkStatus;
    createdAt: Date;
    createdBy: string;
    auditTrail: AuditTrailEntry[];
    monitoringIntegration: MonitoringIntegration;
    performanceMetrics: PerformanceMetrics;
    versionHistory: VersionHistoryEntry[];
    searchMetadata: SearchMetadata;
    networkOperation: NetworkOperation;
    eventIntegration: EventIntegration;
    description?: string;
    edges?: NetworkEdge[];
    updatedAt?: Date;
}
export declare class NetworkEntity {
    readonly networkId: string;
    readonly protocolVersion: string;
    readonly timestamp: Date;
    readonly contextId: string;
    name: string;
    readonly topology: NetworkTopology;
    nodes: NetworkNode[];
    discoveryMechanism: DiscoveryMechanism;
    routingStrategy: RoutingStrategy;
    status: NetworkStatus;
    readonly createdAt: Date;
    readonly createdBy: string;
    auditTrail: AuditTrailEntry[];
    monitoringIntegration: MonitoringIntegration;
    performanceMetrics: PerformanceMetrics;
    versionHistory: VersionHistoryEntry[];
    searchMetadata: SearchMetadata;
    networkOperation: NetworkOperation;
    eventIntegration: EventIntegration;
    description?: string;
    edges: NetworkEdge[];
    updatedAt?: Date;
    constructor(data: NetworkEntityData);
    addNode(node: NetworkNode): void;
    removeNode(nodeId: string): boolean;
    getNode(nodeId: string): NetworkNode | undefined;
    getOnlineNodes(): NetworkNode[];
    addEdge(edge: NetworkEdge): void;
    removeEdge(edgeId: string): boolean;
    updateStatus(newStatus: NetworkStatus): void;
    private addAuditEntry;
    getNetworkStats(): {
        totalNodes: number;
        onlineNodes: number;
        totalEdges: number;
        activeEdges: number;
        topologyEfficiency: number;
    };
    isHealthy(): boolean;
    getNodeNeighbors(nodeId: string): NetworkNode[];
}
//# sourceMappingURL=network.entity.d.ts.map