import { TraceEntityData, TraceQueryFilter, CreateTraceRequest, UpdateTraceRequest, TimeRange, TraceFilters } from '../../types';
import { UUID, PaginationParams } from '../../../../shared/types';
import { TraceEntity } from '../entities/trace.entity';
export interface ITraceRepository {
    create(request: CreateTraceRequest): Promise<TraceEntityData>;
    findById(traceId: UUID): Promise<TraceEntityData | null>;
    update(request: UpdateTraceRequest): Promise<TraceEntityData>;
    delete(traceId: UUID): Promise<boolean>;
    query(filter: TraceQueryFilter, pagination?: PaginationParams): Promise<{
        traces: TraceEntityData[];
        total: number;
    }>;
    exists(traceId: UUID): Promise<boolean>;
    count(filter?: Partial<TraceQueryFilter>): Promise<number>;
    createBatch(requests: CreateTraceRequest[]): Promise<TraceEntityData[]>;
    deleteBatch(traceIds: UUID[]): Promise<number>;
    save(trace: TraceEntity): Promise<TraceEntity>;
    update(trace: TraceEntity): Promise<TraceEntity>;
    queryByTimeRange(timeRange: TimeRange, filters?: TraceFilters): Promise<TraceEntity[]>;
    getHealthStatus(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        timestamp: string;
        details?: Record<string, unknown>;
    }>;
}
//# sourceMappingURL=trace-repository.interface.d.ts.map