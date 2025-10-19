/**
 * Network仓储实现
 *
 * @description Network模块的内存仓储实现，基于DDD架构
 * @version 1.0.0
 * @layer 基础设施层 - 仓储实现
 */
import { NetworkEntity } from '../../domain/entities/network.entity';
import { INetworkRepository } from '../../domain/repositories/network-repository.interface';
/**
 * 内存Network仓储实现
 */
export declare class MemoryNetworkRepository implements INetworkRepository {
    private networks;
    private cache;
    /**
     * 保存网络实体
     */
    save(network: NetworkEntity): Promise<NetworkEntity>;
    /**
     * 根据ID查找网络
     */
    findById(networkId: string): Promise<NetworkEntity | null>;
    /**
     * 根据名称查找网络
     */
    findByName(name: string): Promise<NetworkEntity | null>;
    /**
     * 根据上下文ID查找网络
     */
    findByContextId(contextId: string): Promise<NetworkEntity[]>;
    /**
     * 根据拓扑类型查找网络
     */
    findByTopology(topology: string): Promise<NetworkEntity[]>;
    /**
     * 根据状态查找网络
     */
    findByStatus(status: string): Promise<NetworkEntity[]>;
    /**
     * 查找所有网络
     */
    findAll(): Promise<NetworkEntity[]>;
    /**
     * 分页查询网络
     */
    findWithPagination(page: number, limit: number, filters?: {
        contextId?: string;
        topology?: string;
        status?: string;
        createdBy?: string;
    }): Promise<{
        networks: NetworkEntity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * 更新网络实体
     */
    update(networkId: string, updates: Partial<NetworkEntity>): Promise<NetworkEntity | null>;
    /**
     * 删除网络
     */
    delete(networkId: string): Promise<boolean>;
    /**
     * 检查网络是否存在
     */
    exists(networkId: string): Promise<boolean>;
    /**
     * 根据节点ID查找包含该节点的网络
     */
    findByNodeId(nodeId: string): Promise<NetworkEntity[]>;
    /**
     * 根据Agent ID查找网络
     */
    findByAgentId(agentId: string): Promise<NetworkEntity[]>;
    /**
     * 查找活跃的网络
     */
    findActiveNetworks(): Promise<NetworkEntity[]>;
    /**
     * 根据性能指标查询网络
     */
    findByPerformanceThreshold(metric: string, threshold: number, operator: 'gt' | 'lt' | 'eq'): Promise<NetworkEntity[]>;
    /**
     * 搜索网络
     */
    search(query: string, filters?: {
        topology?: string;
        status?: string;
        tags?: string[];
    }): Promise<NetworkEntity[]>;
    /**
     * 获取网络统计信息
     */
    getStatistics(): Promise<{
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
    }>;
    /**
     * 批量保存网络
     */
    saveBatch(networks: NetworkEntity[]): Promise<NetworkEntity[]>;
    /**
     * 批量删除网络
     */
    deleteBatch(networkIds: string[]): Promise<boolean>;
    /**
     * 清空缓存
     */
    clearCache(): Promise<void>;
    /**
     * 获取网络的版本历史
     */
    getVersionHistory(networkId: string): Promise<{
        networkId: string;
        versions: Array<{
            version: string;
            timestamp: string;
            changes: string[];
            author: string;
        }>;
    }>;
    /**
     * 根据创建时间范围查找网络
     */
    findByCreatedAtRange(startDate: Date, endDate: Date): Promise<NetworkEntity[]>;
    /**
     * 根据更新时间范围查找网络
     */
    findByUpdatedAtRange(startDate: Date, endDate: Date): Promise<NetworkEntity[]>;
    /**
     * 获取网络的审计追踪
     */
    getAuditTrail(networkId: string, limit?: number, offset?: number): Promise<{
        networkId: string;
        auditEntries: Array<{
            timestamp: string;
            action: string;
            actor: string;
            details: {
                [key: string]: unknown;
            };
        }>;
        total: number;
    }>;
    /**
     * 根据标签查找网络
     */
    findByTags(tags: string[]): Promise<NetworkEntity[]>;
    /**
     * 根据关键词查找网络
     */
    findByKeywords(keywords: string[]): Promise<NetworkEntity[]>;
    /**
     * 获取网络拓扑图数据
     */
    getTopologyData(networkId: string): Promise<{
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
    } | null>;
    /**
     * 更新网络拓扑
     */
    updateTopology(networkId: string, topologyData: {
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
    }): Promise<boolean>;
    /**
     * 获取网络健康状态
     */
    getHealthStatus(networkId: string): Promise<{
        networkId: string;
        isHealthy: boolean;
        healthScore: number;
        issues: string[];
        recommendations: string[];
    } | null>;
    /**
     * 清除相关缓存
     */
    private clearRelatedCache;
}
//# sourceMappingURL=network.repository.d.ts.map