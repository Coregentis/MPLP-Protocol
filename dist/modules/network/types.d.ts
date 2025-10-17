export type NetworkTopology = 'star' | 'mesh' | 'tree' | 'ring' | 'bus' | 'hybrid' | 'hierarchical';
export type NodeType = 'coordinator' | 'worker' | 'gateway' | 'relay' | 'monitor' | 'backup';
export type NodeStatus = 'online' | 'offline' | 'connecting' | 'disconnecting' | 'error' | 'maintenance';
export type NodeCapability = 'compute' | 'storage' | 'network' | 'coordination' | 'monitoring' | 'security';
export type CommunicationProtocol = 'http' | 'https' | 'ws' | 'wss' | 'tcp' | 'udp';
export type NetworkStatus = 'active' | 'inactive' | 'pending' | 'completed' | 'failed' | 'cancelled';
export type DiscoveryType = 'broadcast' | 'multicast' | 'registry' | 'gossip' | 'dht' | 'manual';
export type RoutingAlgorithm = 'shortest_path' | 'load_balanced' | 'priority_based' | 'adaptive' | 'flooding' | 'custom';
export type LoadBalancingStrategy = 'round_robin' | 'weighted_round_robin' | 'least_connections' | 'least_response_time' | 'resource_based' | 'custom';
export type NetworkOperation = 'connect' | 'disconnect' | 'route' | 'broadcast' | 'discover';
export interface NodeAddress {
    host: string;
    port: number;
    protocol: CommunicationProtocol;
}
export interface NodeMetadata {
    [key: string]: unknown;
}
export interface DiscoveryMechanism {
    type: DiscoveryType;
    enabled: boolean;
    configuration: {
        [key: string]: unknown;
    };
}
export interface RoutingStrategy {
    algorithm: RoutingAlgorithm;
    loadBalancing: LoadBalancingStrategy;
    configuration: {
        [key: string]: unknown;
    };
}
export interface PerformanceMetrics {
    enabled: boolean;
    collectionIntervalSeconds: number;
    metrics: {
        [key: string]: unknown;
    };
}
export interface MonitoringIntegration {
    enabled: boolean;
    endpoints: string[];
    configuration: {
        [key: string]: unknown;
    };
}
export interface AuditTrailEntry {
    timestamp: string;
    action: string;
    actor: string;
    details: {
        [key: string]: unknown;
    };
}
export interface VersionHistoryEntry {
    version: string;
    timestamp: string;
    changes: string[];
    author: string;
}
export interface SearchMetadata {
    tags: string[];
    keywords: string[];
    categories: string[];
    indexed: boolean;
}
export interface EventIntegration {
    enabled: boolean;
    eventTypes: string[];
    configuration: {
        [key: string]: unknown;
    };
}
//# sourceMappingURL=types.d.ts.map