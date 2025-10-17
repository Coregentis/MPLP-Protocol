import { UUID } from '../../../../shared/types';
import { ExtensionEntityData, ExtensionType, ExtensionStatus } from '../../types';
export interface ExtensionQueryFilter {
    contextId?: UUID;
    extensionType?: ExtensionType | ExtensionType[];
    status?: ExtensionStatus | ExtensionStatus[];
    name?: string;
    version?: string;
    author?: string;
    organization?: string;
    category?: string;
    keywords?: string[];
    createdAfter?: string;
    createdBefore?: string;
    lastUpdateAfter?: string;
    lastUpdateBefore?: string;
    hasErrors?: boolean;
    isActive?: boolean;
    compatibleWithVersion?: string;
    hasExtensionPointType?: string;
    hasApiExtensions?: boolean;
    hasEventSubscriptions?: boolean;
    healthStatus?: 'healthy' | 'degraded' | 'unhealthy';
    performanceThreshold?: {
        errorRate?: number;
        availability?: number;
        responseTime?: number;
    };
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
}
export interface SortParams {
    field: string;
    direction: 'asc' | 'desc';
}
export interface ExtensionQueryResult {
    extensions: ExtensionEntityData[];
    total: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
}
export interface BatchOperationResult {
    successCount: number;
    failureCount: number;
    results: Array<{
        id: UUID;
        success: boolean;
        error?: string;
    }>;
}
export interface ExtensionStatistics {
    totalExtensions: number;
    activeExtensions: number;
    inactiveExtensions: number;
    errorExtensions: number;
    extensionsByType: Record<ExtensionType, number>;
    extensionsByStatus: Record<ExtensionStatus, number>;
    averagePerformanceMetrics: {
        responseTime: number;
        errorRate: number;
        availability: number;
        throughput: number;
    };
    topPerformingExtensions: Array<{
        extensionId: UUID;
        name: string;
        performanceScore: number;
    }>;
    recentlyUpdated: Array<{
        extensionId: UUID;
        name: string;
        lastUpdate: string;
    }>;
}
export interface IExtensionRepository {
    create(extension: ExtensionEntityData): Promise<ExtensionEntityData>;
    findById(extensionId: UUID): Promise<ExtensionEntityData | null>;
    update(extensionId: UUID, updates: Partial<ExtensionEntityData>): Promise<ExtensionEntityData>;
    delete(extensionId: UUID): Promise<boolean>;
    findAll(): Promise<ExtensionEntityData[]>;
    findByFilter(filter: ExtensionQueryFilter, pagination?: PaginationParams, sort?: SortParams[]): Promise<ExtensionQueryResult>;
    findByContextId(contextId: UUID): Promise<ExtensionEntityData[]>;
    findByType(extensionType: ExtensionType, status?: ExtensionStatus): Promise<ExtensionEntityData[]>;
    findByStatus(status: ExtensionStatus): Promise<ExtensionEntityData[]>;
    findByName(name: string, exactMatch?: boolean): Promise<ExtensionEntityData[]>;
    search(searchTerm: string, searchFields?: string[], pagination?: PaginationParams): Promise<ExtensionQueryResult>;
    count(filter?: ExtensionQueryFilter): Promise<number>;
    exists(extensionId: UUID): Promise<boolean>;
    nameExists(name: string, excludeId?: UUID): Promise<boolean>;
    getStatistics(filter?: ExtensionQueryFilter): Promise<ExtensionStatistics>;
    createBatch(extensions: ExtensionEntityData[]): Promise<BatchOperationResult>;
    updateBatch(updates: Array<{
        extensionId: UUID;
        updates: Partial<ExtensionEntityData>;
    }>): Promise<BatchOperationResult>;
    deleteBatch(extensionIds: UUID[]): Promise<BatchOperationResult>;
    updateStatusBatch(extensionIds: UUID[], status: ExtensionStatus): Promise<BatchOperationResult>;
    findActiveExtensions(contextId?: UUID): Promise<ExtensionEntityData[]>;
    findExtensionsWithErrors(contextId?: UUID): Promise<ExtensionEntityData[]>;
    findExtensionsNeedingUpdate(currentVersion: string): Promise<ExtensionEntityData[]>;
    findCompatibleExtensions(mplpVersion: string, requiredModules?: string[]): Promise<ExtensionEntityData[]>;
    findExtensionsWithExtensionPoint(extensionPointType: string): Promise<ExtensionEntityData[]>;
    findExtensionsWithApiExtensions(endpoint?: string, method?: string): Promise<ExtensionEntityData[]>;
    findExtensionsSubscribedToEvent(eventPattern: string): Promise<ExtensionEntityData[]>;
    updatePerformanceMetrics(extensionId: UUID, metrics: Partial<ExtensionEntityData['performanceMetrics']>): Promise<void>;
    findTopPerformingExtensions(limit?: number, metric?: 'responseTime' | 'throughput' | 'availability' | 'efficiencyScore'): Promise<ExtensionEntityData[]>;
    findRecentlyUpdatedExtensions(limit?: number, days?: number): Promise<ExtensionEntityData[]>;
    clear(): Promise<void>;
    cleanupExpiredAuditRecords(retentionDays: number): Promise<number>;
    optimize(): Promise<void>;
}
//# sourceMappingURL=extension.repository.interface.d.ts.map