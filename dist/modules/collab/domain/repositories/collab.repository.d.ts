import { UUID } from '../../../../shared/types';
import { CollabEntity } from '../entities/collab.entity';
export interface CollabListQuery {
    page?: number;
    limit?: number;
    status?: string;
    mode?: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh';
    contextId?: UUID;
    planId?: UUID;
    participantId?: UUID;
    sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'status';
    sortOrder?: 'asc' | 'desc';
}
export interface CollabSearchQuery {
    query: string;
    fields?: string[];
    filters?: {
        status?: string[];
        mode?: string[];
        dateRange?: {
            from: Date;
            to: Date;
        };
    };
    page?: number;
    limit?: number;
}
export interface CollabListResult {
    items: CollabEntity[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface CollabSearchResult {
    items: CollabEntity[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    searchMetadata: {
        query: string;
        executionTimeMs: number;
        totalMatches: number;
    };
}
export interface CollabStatistics {
    totalCollaborations: number;
    activeCollaborations: number;
    completedCollaborations: number;
    failedCollaborations: number;
    averageParticipants: number;
    averageDurationMinutes: number;
    successRate: number;
    modeDistribution: {
        sequential: number;
        parallel: number;
        hybrid: number;
        pipeline: number;
        mesh: number;
    };
    coordinationStrategyDistribution: {
        centralized: number;
        distributed: number;
        hierarchical: number;
        peer_to_peer: number;
    };
}
export interface ICollabRepository {
    findById(id: UUID): Promise<CollabEntity | null>;
    findByIds(ids: UUID[]): Promise<CollabEntity[]>;
    save(entity: CollabEntity): Promise<CollabEntity>;
    update(entity: CollabEntity): Promise<CollabEntity>;
    delete(id: UUID): Promise<void>;
    exists(id: UUID): Promise<boolean>;
    list(query: CollabListQuery): Promise<CollabListResult>;
    search(query: CollabSearchQuery): Promise<CollabSearchResult>;
    count(filters?: Partial<CollabListQuery>): Promise<number>;
    findByContextId(contextId: UUID): Promise<CollabEntity[]>;
    findByPlanId(planId: UUID): Promise<CollabEntity[]>;
    findByParticipantId(participantId: UUID): Promise<CollabEntity[]>;
    findByAgentId(agentId: UUID): Promise<CollabEntity[]>;
    findByRoleId(roleId: UUID): Promise<CollabEntity[]>;
    findByCoordinatorId(coordinatorId: UUID): Promise<CollabEntity[]>;
    findByStatus(status: string): Promise<CollabEntity[]>;
    findByMode(mode: 'sequential' | 'parallel' | 'hybrid' | 'pipeline' | 'mesh'): Promise<CollabEntity[]>;
    findActive(): Promise<CollabEntity[]>;
    findCompleted(): Promise<CollabEntity[]>;
    findFailed(): Promise<CollabEntity[]>;
    findByDateRange(from: Date, to: Date): Promise<CollabEntity[]>;
    findByCreatedBy(userId: string): Promise<CollabEntity[]>;
    findByUpdatedBy(userId: string): Promise<CollabEntity[]>;
    findRecent(limit?: number): Promise<CollabEntity[]>;
    findStale(olderThanHours: number): Promise<CollabEntity[]>;
    getStatistics(): Promise<CollabStatistics>;
    getStatisticsForPeriod(from: Date, to: Date): Promise<CollabStatistics>;
    getParticipantStatistics(): Promise<{
        totalParticipants: number;
        activeParticipants: number;
        averageParticipantsPerCollaboration: number;
        topAgents: Array<{
            agentId: UUID;
            collaborationCount: number;
        }>;
        topRoles: Array<{
            roleId: UUID;
            collaborationCount: number;
        }>;
    }>;
    getPerformanceMetrics(): Promise<{
        averageCreationTime: number;
        averageCompletionTime: number;
        successRate: number;
        errorRate: number;
        throughput: number;
    }>;
    batchSave(entities: CollabEntity[]): Promise<CollabEntity[]>;
    batchUpdate(entities: CollabEntity[]): Promise<CollabEntity[]>;
    batchDelete(ids: UUID[]): Promise<void>;
    withTransaction<T>(operation: (repository: ICollabRepository) => Promise<T>): Promise<T>;
    healthCheck(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        responseTime: number;
        connectionStatus: 'connected' | 'disconnected';
        lastError?: string;
    }>;
    cleanup(olderThanDays: number): Promise<{
        deletedCount: number;
        cleanupDuration: number;
    }>;
    optimize(): Promise<{
        optimizationDuration: number;
        improvements: string[];
    }>;
}
//# sourceMappingURL=collab.repository.d.ts.map