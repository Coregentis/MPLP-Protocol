/**
 * Network管理服务
 *
 * @description Network模块的核心业务逻辑服务，基于DDD架构
 * @version 1.0.0
 * @layer 应用层 - 服务
 */
import { NetworkEntity, NetworkNode } from '../../domain/entities/network.entity';
import { INetworkRepository } from '../../domain/repositories/network-repository.interface';
import { NetworkTopology, NodeType, NodeStatus, NetworkStatus, DiscoveryMechanism, RoutingStrategy, PerformanceMetrics, MonitoringIntegration, SearchMetadata, EventIntegration } from '../../types';
/**
 * 创建网络的数据传输对象
 */
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
/**
 * 更新网络的数据传输对象
 */
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
/**
 * Network管理服务
 */
export declare class NetworkManagementService {
    private readonly networkRepository;
    constructor(networkRepository: INetworkRepository);
    /**
     * 创建新网络
     */
    createNetwork(data: CreateNetworkData): Promise<NetworkEntity>;
    /**
     * 根据ID获取网络
     */
    getNetworkById(networkId: string): Promise<NetworkEntity | null>;
    /**
     * 根据名称获取网络
     */
    getNetworkByName(name: string): Promise<NetworkEntity | null>;
    /**
     * 根据上下文ID获取网络列表
     */
    getNetworksByContextId(contextId: string): Promise<NetworkEntity[]>;
    /**
     * 更新网络
     */
    updateNetwork(networkId: string, data: UpdateNetworkData): Promise<NetworkEntity | null>;
    /**
     * 删除网络
     */
    deleteNetwork(networkId: string): Promise<boolean>;
    /**
     * 添加节点到网络
     */
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
    /**
     * 从网络移除节点
     */
    removeNodeFromNetwork(networkId: string, nodeId: string): Promise<NetworkEntity | null>;
    /**
     * 更新节点状态
     */
    updateNodeStatus(networkId: string, nodeId: string, status: NodeStatus): Promise<NetworkEntity | null>;
    /**
     * 添加边缘连接
     */
    addEdgeToNetwork(networkId: string, edgeData: {
        sourceNodeId: string;
        targetNodeId: string;
        edgeType: string;
        direction: 'bidirectional' | 'unidirectional';
        weight?: number;
    }): Promise<NetworkEntity | null>;
    /**
     * 获取网络统计信息
     */
    getNetworkStatistics(networkId: string): Promise<{
        totalNodes: number;
        onlineNodes: number;
        totalEdges: number;
        activeEdges: number;
        topologyEfficiency: number;
    } | null>;
    /**
     * 检查网络健康状态
     */
    checkNetworkHealth(networkId: string): Promise<boolean | null>;
    /**
     * 获取节点的邻居
     */
    getNodeNeighbors(networkId: string, nodeId: string): Promise<NetworkNode[] | null>;
    /**
     * 搜索网络
     */
    searchNetworks(query: string, filters?: {
        topology?: string;
        status?: string;
        tags?: string[];
    }): Promise<NetworkEntity[]>;
    /**
     * 获取所有网络的统计信息
     */
    getGlobalStatistics(): Promise<{
        totalNetworks: number;
        activeNetworks: number;
        totalNodes: number;
        totalEdges: number;
        topologyDistribution: Record<string, number>;
        statusDistribution: Record<string, number>;
    }>;
    /**
     * 生成网络ID
     */
    private generateNetworkId;
    /**
     * 生成节点ID
     */
    private generateNodeId;
    /**
     * 生成边缘ID
     */
    private generateEdgeId;
}
//# sourceMappingURL=network-management.service.d.ts.map