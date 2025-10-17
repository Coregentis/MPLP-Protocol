import { TraceEntityData, TraceQueryFilter, CreateTraceRequest, UpdateTraceRequest, TimeRange, TraceFilters } from '../../types';
import { UUID, PaginationParams } from '../../../../shared/types';
import { ITraceRepository } from '../../domain/repositories/trace-repository.interface';
import { TraceEntity } from '../../domain/entities/trace.entity';
export interface TraceRepositoryConfig {
    enableCaching?: boolean;
    maxCacheSize?: number;
    cacheTimeout?: number;
}
export declare class TraceRepository implements ITraceRepository {
    private traces;
    private config;
    constructor(config?: TraceRepositoryConfig);
    create(request: CreateTraceRequest): Promise<TraceEntityData>;
    private validateCreateRequest;
    private buildTraceEntity;
    private generateTraceId;
    private buildEventObject;
    private buildCompleteErrorInformation;
    private buildCompleteDecisionLog;
    private buildDefaultAuditTrail;
    private buildDefaultPerformanceMetrics;
    private buildDefaultMonitoringIntegration;
    private buildDefaultVersionHistory;
    private buildDefaultSearchMetadata;
    private buildDefaultTraceDetails;
    private buildDefaultEventIntegration;
    findById(traceId: UUID): Promise<TraceEntityData | null>;
    update(request: UpdateTraceRequest): Promise<TraceEntityData>;
    update(trace: TraceEntity): Promise<TraceEntity>;
    delete(traceId: UUID): Promise<boolean>;
    query(filter: TraceQueryFilter, pagination?: PaginationParams): Promise<{
        traces: TraceEntityData[];
        total: number;
    }>;
    private applyFilters;
    exists(traceId: UUID): Promise<boolean>;
    count(filter?: Partial<TraceQueryFilter>): Promise<number>;
    createBatch(_requests: CreateTraceRequest[]): Promise<TraceEntityData[]>;
    deleteBatch(traceIds: UUID[]): Promise<number>;
    getHealthStatus(): Promise<{
        status: "healthy";
        timestamp: string;
        details: {
            repository: string;
            version: string;
            tracesCount: number;
            config: Required<TraceRepositoryConfig>;
        };
    }>;
    save(trace: TraceEntity): Promise<TraceEntity>;
    queryByTimeRange(timeRange: TimeRange, filters?: TraceFilters): Promise<TraceEntity[]>;
    getStorageStatistics(): Promise<{
        totalTraces: number;
        totalStorageSize: number;
        averageTraceSize: number;
        compressionRatio: number;
    }>;
}
//# sourceMappingURL=trace.repository.d.ts.map