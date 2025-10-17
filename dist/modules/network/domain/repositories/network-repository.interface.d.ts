import { NetworkEntity } from '../entities/network.entity';
export interface INetworkRepository {
    save(network: NetworkEntity): Promise<NetworkEntity>;
    findById(networkId: string): Promise<NetworkEntity | null>;
    findByName(name: string): Promise<NetworkEntity | null>;
    findByContextId(contextId: string): Promise<NetworkEntity[]>;
    findByTopology(topology: string): Promise<NetworkEntity[]>;
    findByStatus(status: string): Promise<NetworkEntity[]>;
    findAll(): Promise<NetworkEntity[]>;
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
    update(networkId: string, updates: Partial<NetworkEntity>): Promise<NetworkEntity | null>;
    delete(networkId: string): Promise<boolean>;
    exists(networkId: string): Promise<boolean>;
    findByNodeId(nodeId: string): Promise<NetworkEntity[]>;
    findByAgentId(agentId: string): Promise<NetworkEntity[]>;
    findActiveNetworks(): Promise<NetworkEntity[]>;
    findByPerformanceThreshold(metric: string, threshold: number, operator: 'gt' | 'lt' | 'eq'): Promise<NetworkEntity[]>;
    search(query: string, filters?: {
        topology?: string;
        status?: string;
        tags?: string[];
    }): Promise<NetworkEntity[]>;
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
    saveBatch(networks: NetworkEntity[]): Promise<NetworkEntity[]>;
    deleteBatch(networkIds: string[]): Promise<boolean>;
    clearCache(): Promise<void>;
    getVersionHistory(networkId: string): Promise<{
        networkId: string;
        versions: Array<{
            version: string;
            timestamp: string;
            changes: string[];
            author: string;
        }>;
    }>;
    findByCreatedAtRange(startDate: Date, endDate: Date): Promise<NetworkEntity[]>;
    findByUpdatedAtRange(startDate: Date, endDate: Date): Promise<NetworkEntity[]>;
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
    findByTags(tags: string[]): Promise<NetworkEntity[]>;
    findByKeywords(keywords: string[]): Promise<NetworkEntity[]>;
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
    getHealthStatus(networkId: string): Promise<{
        networkId: string;
        isHealthy: boolean;
        healthScore: number;
        issues: string[];
        recommendations: string[];
    } | null>;
}
//# sourceMappingURL=network-repository.interface.d.ts.map