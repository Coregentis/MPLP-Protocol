import { UUID } from '../../../../shared/types';
import { IExtensionRepository, ExtensionQueryFilter, PaginationParams, SortParams, ExtensionQueryResult, BatchOperationResult, ExtensionStatistics } from '../../domain/repositories/extension.repository.interface';
import { ExtensionEntityData, ExtensionType, ExtensionStatus, ExtensionConfiguration, ExtensionPoint, ApiExtension, EventSubscription, ExtensionPerformanceMetrics } from '../../types';
export interface CreateExtensionRequest {
    contextId: UUID;
    name: string;
    displayName: string;
    description: string;
    version: string;
    extensionType: ExtensionType;
    compatibility: ExtensionEntityData['compatibility'];
    configuration: ExtensionConfiguration;
    extensionPoints?: ExtensionPoint[];
    apiExtensions?: ApiExtension[];
    eventSubscriptions?: EventSubscription[];
    security: ExtensionEntityData['security'];
    metadata: ExtensionEntityData['metadata'];
}
export interface UpdateExtensionRequest {
    extensionId: UUID;
    displayName?: string;
    description?: string;
    configuration?: Record<string, unknown>;
    extensionPoints?: ExtensionPoint[];
    apiExtensions?: ApiExtension[];
    eventSubscriptions?: EventSubscription[];
    metadata?: Partial<ExtensionEntityData['metadata']>;
}
export interface ExtensionActivationRequest {
    extensionId: UUID;
    userId?: string;
    force?: boolean;
}
export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    details?: {
        service: string;
        version: string;
        repository: {
            status: string;
            extensionCount: number;
            activeExtensions: number;
            lastOperation: string;
        };
        performance: {
            averageResponseTime: number;
            totalExtensions: number;
            errorRate: number;
        };
    };
}
export declare class ExtensionManagementService {
    private readonly extensionRepository;
    constructor(extensionRepository: IExtensionRepository);
    applyAllCrossCuttingConcerns(extension: ExtensionEntityData): Promise<void>;
    removeAllCrossCuttingConcerns(extensionId: UUID): Promise<void>;
    private coordinateWithModule;
    private trackExtensionPerformance;
    private validateExtensionSecurity;
    private validateExtensionProtocolVersion;
    private publishExtensionEvent;
    private syncExtensionState;
    private handleExtensionError;
    createExtension(request: CreateExtensionRequest): Promise<ExtensionEntityData>;
    getExtensionById(extensionId: UUID): Promise<ExtensionEntityData | null>;
    updateExtension(request: UpdateExtensionRequest): Promise<ExtensionEntityData>;
    deleteExtension(extensionId: UUID): Promise<boolean>;
    activateExtension(request: ExtensionActivationRequest): Promise<boolean>;
    deactivateExtension(extensionId: UUID, userId?: string): Promise<boolean>;
    updateExtensionVersion(extensionId: UUID, newVersion: string, changelog: string, userId?: string): Promise<ExtensionEntityData>;
    queryExtensions(filter: ExtensionQueryFilter, pagination?: PaginationParams, sort?: SortParams[]): Promise<ExtensionQueryResult>;
    getExtensionsByContextId(contextId: UUID): Promise<ExtensionEntityData[]>;
    getExtensionsByType(extensionType: ExtensionType, status?: ExtensionStatus): Promise<ExtensionEntityData[]>;
    getActiveExtensions(contextId?: UUID): Promise<ExtensionEntityData[]>;
    searchExtensions(searchTerm: string, searchFields?: string[], pagination?: PaginationParams): Promise<ExtensionQueryResult>;
    getExtensionCount(filter?: ExtensionQueryFilter): Promise<number>;
    extensionExists(extensionId: UUID): Promise<boolean>;
    getExtensionStatistics(filter?: ExtensionQueryFilter): Promise<ExtensionStatistics>;
    updatePerformanceMetrics(extensionId: UUID, metrics: Partial<ExtensionPerformanceMetrics>): Promise<void>;
    createExtensionBatch(requests: CreateExtensionRequest[]): Promise<BatchOperationResult>;
    deleteExtensionBatch(extensionIds: UUID[]): Promise<BatchOperationResult>;
    updateExtensionStatusBatch(extensionIds: UUID[], status: ExtensionStatus): Promise<BatchOperationResult>;
    getHealthStatus(): Promise<HealthStatus>;
    private generateExtensionId;
    private prepareExtensionData;
    private createInitialLifecycle;
    private createInitialAuditTrail;
    private createInitialPerformanceMetrics;
    private createInitialMonitoringIntegration;
    private createInitialVersionHistory;
    private createInitialSearchMetadata;
    private createInitialEventIntegration;
    listExtensions(options?: {
        contextId?: UUID;
        extensionType?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        extensions: ExtensionEntityData[];
        totalCount: number;
        hasMore: boolean;
    }>;
}
//# sourceMappingURL=extension-management.service.d.ts.map