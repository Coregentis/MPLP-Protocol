/**
 * Network控制器
 *
 * @description Network模块的API控制器，基于DDD架构
 * @version 1.0.0
 * @layer API层 - 控制器
 */
import { NetworkManagementService } from '../../application/services/network-management.service';
import { NetworkDto, NetworkNodeDto, AuditTrailEntryDto, VersionHistoryEntryDto, PerformanceMetricsDto, CreateNetworkDto, UpdateNetworkDto, AddNodeDto, UpdateNodeStatusDto, AddEdgeDto, NetworkStatsDto, GlobalStatsDto, NetworkSearchDto, NetworkPaginationDto, NetworkPaginationResultDto, NetworkHealthDto, TopologyDataDto, UpdateTopologyDto } from '../dto/network.dto';
/**
 * Network控制器
 */
export declare class NetworkController {
    private readonly networkManagementService;
    constructor(networkManagementService: NetworkManagementService);
    /**
     * 创建新网络
     */
    createNetwork(createDto: CreateNetworkDto): Promise<NetworkDto>;
    /**
     * 根据ID获取网络
     */
    getNetworkById(networkId: string): Promise<NetworkDto | null>;
    /**
     * 根据名称获取网络
     */
    getNetworkByName(name: string): Promise<NetworkDto | null>;
    /**
     * 根据上下文ID获取网络列表
     */
    getNetworksByContextId(contextId: string): Promise<NetworkDto[]>;
    /**
     * 更新网络
     */
    updateNetwork(networkId: string, updateDto: UpdateNetworkDto): Promise<NetworkDto | null>;
    /**
     * 删除网络
     */
    deleteNetwork(networkId: string): Promise<boolean>;
    /**
     * 添加节点到网络
     */
    addNodeToNetwork(networkId: string, addNodeDto: AddNodeDto): Promise<NetworkDto | null>;
    /**
     * 从网络移除节点
     */
    removeNodeFromNetwork(networkId: string, nodeId: string): Promise<NetworkDto | null>;
    /**
     * 更新节点状态
     */
    updateNodeStatus(networkId: string, nodeId: string, updateStatusDto: UpdateNodeStatusDto): Promise<NetworkDto | null>;
    /**
     * 添加边缘连接
     */
    addEdgeToNetwork(networkId: string, addEdgeDto: AddEdgeDto): Promise<NetworkDto | null>;
    /**
     * 获取网络统计信息
     */
    getNetworkStatistics(networkId: string): Promise<NetworkStatsDto | null>;
    /**
     * 检查网络健康状态
     */
    checkNetworkHealth(networkId: string): Promise<boolean | null>;
    /**
     * 获取节点的邻居
     */
    getNodeNeighbors(networkId: string, nodeId: string): Promise<NetworkNodeDto[] | null>;
    /**
     * 搜索网络
     */
    searchNetworks(searchDto: NetworkSearchDto): Promise<NetworkDto[]>;
    /**
     * 获取全局统计信息
     */
    getGlobalStatistics(): Promise<GlobalStatsDto>;
    /**
     * 分页查询网络
     */
    getNetworksWithPagination(paginationDto: NetworkPaginationDto): Promise<NetworkPaginationResultDto>;
    /**
     * 获取网络健康详情
     */
    getNetworkHealthDetails(networkId: string): Promise<NetworkHealthDto | null>;
    /**
     * 获取网络拓扑数据
     */
    getNetworkTopology(_networkId: string): Promise<TopologyDataDto | null>;
    /**
     * 更新网络拓扑
     */
    updateNetworkTopology(_networkId: string, _topologyDto: UpdateTopologyDto): Promise<boolean>;
    /**
     * 获取网络的审计追踪
     */
    getNetworkAuditTrail(_networkId: string, _limit?: number, _offset?: number): Promise<{
        networkId: string;
        auditEntries: AuditTrailEntryDto[];
        total: number;
    } | null>;
    /**
     * 获取网络的版本历史
     */
    getNetworkVersionHistory(_networkId: string): Promise<{
        networkId: string;
        versions: VersionHistoryEntryDto[];
    } | null>;
    /**
     * 根据标签查找网络
     */
    getNetworksByTags(_tags: string[]): Promise<NetworkDto[]>;
    /**
     * 根据关键词查找网络
     */
    getNetworksByKeywords(_keywords: string[]): Promise<NetworkDto[]>;
    /**
     * 激活网络
     */
    activateNetwork(networkId: string): Promise<NetworkDto | null>;
    /**
     * 停用网络
     */
    deactivateNetwork(networkId: string): Promise<NetworkDto | null>;
    /**
     * 重启网络
     */
    restartNetwork(networkId: string): Promise<NetworkDto | null>;
    /**
     * 获取网络性能指标
     */
    getNetworkPerformanceMetrics(networkId: string): Promise<PerformanceMetricsDto | null>;
    /**
     * 更新网络性能指标
     */
    updateNetworkPerformanceMetrics(networkId: string, metrics: PerformanceMetricsDto): Promise<NetworkDto | null>;
}
//# sourceMappingURL=network.controller.d.ts.map