import { NetworkManagementService } from '../../application/services/network-management.service';
import { NetworkDto, NetworkNodeDto, AuditTrailEntryDto, VersionHistoryEntryDto, PerformanceMetricsDto, CreateNetworkDto, UpdateNetworkDto, AddNodeDto, UpdateNodeStatusDto, AddEdgeDto, NetworkStatsDto, GlobalStatsDto, NetworkSearchDto, NetworkPaginationDto, NetworkPaginationResultDto, NetworkHealthDto, TopologyDataDto, UpdateTopologyDto } from '../dto/network.dto';
export declare class NetworkController {
    private readonly networkManagementService;
    constructor(networkManagementService: NetworkManagementService);
    createNetwork(createDto: CreateNetworkDto): Promise<NetworkDto>;
    getNetworkById(networkId: string): Promise<NetworkDto | null>;
    getNetworkByName(name: string): Promise<NetworkDto | null>;
    getNetworksByContextId(contextId: string): Promise<NetworkDto[]>;
    updateNetwork(networkId: string, updateDto: UpdateNetworkDto): Promise<NetworkDto | null>;
    deleteNetwork(networkId: string): Promise<boolean>;
    addNodeToNetwork(networkId: string, addNodeDto: AddNodeDto): Promise<NetworkDto | null>;
    removeNodeFromNetwork(networkId: string, nodeId: string): Promise<NetworkDto | null>;
    updateNodeStatus(networkId: string, nodeId: string, updateStatusDto: UpdateNodeStatusDto): Promise<NetworkDto | null>;
    addEdgeToNetwork(networkId: string, addEdgeDto: AddEdgeDto): Promise<NetworkDto | null>;
    getNetworkStatistics(networkId: string): Promise<NetworkStatsDto | null>;
    checkNetworkHealth(networkId: string): Promise<boolean | null>;
    getNodeNeighbors(networkId: string, nodeId: string): Promise<NetworkNodeDto[] | null>;
    searchNetworks(searchDto: NetworkSearchDto): Promise<NetworkDto[]>;
    getGlobalStatistics(): Promise<GlobalStatsDto>;
    getNetworksWithPagination(paginationDto: NetworkPaginationDto): Promise<NetworkPaginationResultDto>;
    getNetworkHealthDetails(networkId: string): Promise<NetworkHealthDto | null>;
    getNetworkTopology(_networkId: string): Promise<TopologyDataDto | null>;
    updateNetworkTopology(_networkId: string, _topologyDto: UpdateTopologyDto): Promise<boolean>;
    getNetworkAuditTrail(_networkId: string, _limit?: number, _offset?: number): Promise<{
        networkId: string;
        auditEntries: AuditTrailEntryDto[];
        total: number;
    } | null>;
    getNetworkVersionHistory(_networkId: string): Promise<{
        networkId: string;
        versions: VersionHistoryEntryDto[];
    } | null>;
    getNetworksByTags(_tags: string[]): Promise<NetworkDto[]>;
    getNetworksByKeywords(_keywords: string[]): Promise<NetworkDto[]>;
    activateNetwork(networkId: string): Promise<NetworkDto | null>;
    deactivateNetwork(networkId: string): Promise<NetworkDto | null>;
    restartNetwork(networkId: string): Promise<NetworkDto | null>;
    getNetworkPerformanceMetrics(networkId: string): Promise<PerformanceMetricsDto | null>;
    updateNetworkPerformanceMetrics(networkId: string, metrics: PerformanceMetricsDto): Promise<NetworkDto | null>;
}
//# sourceMappingURL=network.controller.d.ts.map