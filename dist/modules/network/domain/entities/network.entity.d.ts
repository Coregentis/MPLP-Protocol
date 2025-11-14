/**
 * Network领域实体
 *
 * @description Network模块的核心领域实体，基于DDD架构设计
 * @version 1.0.0
 * @layer 领域层 - 实体
 */
import { NetworkTopology, NodeType, NodeStatus, NodeCapability, NodeAddress, NodeMetadata, DiscoveryMechanism, RoutingStrategy, NetworkStatus, PerformanceMetrics, MonitoringIntegration, AuditTrailEntry, VersionHistoryEntry, SearchMetadata, EventIntegration, NetworkOperation } from '../../types';
/**
 * 网络节点实体
 */
export declare class NetworkNode {
    readonly nodeId: string;
    readonly agentId: string;
    readonly nodeType: NodeType;
    status: NodeStatus;
    capabilities: NodeCapability[];
    address?: NodeAddress | undefined;
    metadata: NodeMetadata;
    constructor(nodeId: string, agentId: string, nodeType: NodeType, status: NodeStatus, capabilities?: NodeCapability[], address?: NodeAddress | undefined, metadata?: NodeMetadata);
    /**
     * 更新节点状态
     */
    updateStatus(newStatus: NodeStatus): void;
    /**
     * 添加能力
     */
    addCapability(capability: NodeCapability): void;
    /**
     * 移除能力
     */
    removeCapability(capability: NodeCapability): void;
    /**
     * 检查是否在线
     */
    isOnline(): boolean;
    /**
     * 检查是否具有特定能力
     */
    hasCapability(capability: NodeCapability): boolean;
}
/**
 * 网络边缘连接实体
 */
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
    /**
     * 更新边缘状态
     */
    updateStatus(newStatus: string): void;
    /**
     * 更新权重
     */
    updateWeight(newWeight: number): void;
    /**
     * 检查连接是否活跃
     */
    isActive(): boolean;
}
/**
 * Network实体构造参数接口
 */
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
/**
 * Network核心实体
 */
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
    /**
     * 添加节点
     */
    addNode(node: NetworkNode): void;
    /**
     * 移除节点
     */
    removeNode(nodeId: string): boolean;
    /**
     * 获取节点
     */
    getNode(nodeId: string): NetworkNode | undefined;
    /**
     * 获取在线节点
     */
    getOnlineNodes(): NetworkNode[];
    /**
     * 添加边缘连接
     */
    addEdge(edge: NetworkEdge): void;
    /**
     * 移除边缘连接
     */
    removeEdge(edgeId: string): boolean;
    /**
     * 更新网络状态
     */
    updateStatus(newStatus: NetworkStatus): void;
    /**
     * 添加审计条目
     */
    private addAuditEntry;
    /**
     * 获取网络统计信息
     */
    getNetworkStats(): {
        totalNodes: number;
        onlineNodes: number;
        totalEdges: number;
        activeEdges: number;
        topologyEfficiency: number;
    };
    /**
     * 检查网络是否健康
     */
    isHealthy(): boolean;
    /**
     * 获取节点的邻居
     */
    getNodeNeighbors(nodeId: string): NetworkNode[];
}
//# sourceMappingURL=network.entity.d.ts.map