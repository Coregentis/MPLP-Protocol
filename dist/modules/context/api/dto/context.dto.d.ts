import { ContextStatus, LifecycleStage, CreateContextRequest, UpdateContextRequest, ContextQueryFilter } from '../../types';
export declare class CreateContextDto implements CreateContextRequest {
    name: string;
    description?: string;
    sharedState?: Record<string, unknown>;
    accessControl?: Record<string, unknown>;
    configuration?: Record<string, unknown>;
}
export declare class UpdateContextDto implements UpdateContextRequest {
    name?: string;
    description?: string;
    status?: ContextStatus;
    lifecycleStage?: LifecycleStage;
    sharedState?: Record<string, unknown>;
    accessControl?: Record<string, unknown>;
    configuration?: Record<string, unknown>;
}
export declare class ContextQueryDto implements ContextQueryFilter {
    status?: ContextStatus | ContextStatus[];
    lifecycleStage?: LifecycleStage | LifecycleStage[];
    owner?: string;
    createdAfter?: string;
    createdBefore?: string;
    namePattern?: string;
}
export declare class ContextResponseDto {
    contextId: string;
    name: string;
    description?: string;
    status: ContextStatus;
    lifecycleStage: LifecycleStage;
    protocolVersion: string;
    timestamp: string;
    sharedState: Record<string, unknown>;
    accessControl: Record<string, unknown>;
    configuration: Record<string, unknown>;
    auditTrail: Record<string, unknown>;
    monitoringIntegration: Record<string, unknown>;
    performanceMetrics: Record<string, unknown>;
    versionHistory: Record<string, unknown>;
    searchMetadata: Record<string, unknown>;
    cachingPolicy: Record<string, unknown>;
    syncConfiguration: Record<string, unknown>;
    errorHandling: Record<string, unknown>;
    integrationEndpoints: Record<string, unknown>;
    eventIntegration: Record<string, unknown>;
}
export declare class PaginatedContextResponseDto {
    data: ContextResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class ContextOperationResultDto {
    success: boolean;
    contextId?: string;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    metadata?: Record<string, unknown>;
}
//# sourceMappingURL=context.dto.d.ts.map