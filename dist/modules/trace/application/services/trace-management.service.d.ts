import { TraceEntityData, TraceSchema, CreateTraceRequest, UpdateTraceRequest, TraceQueryFilter, TraceAnalysisResult, TraceValidationResult, StartTraceData, EndTraceData, SpanData, SpanEntity, TraceQuery, TraceStatistics, IDataCollector, ILogger } from '../../types';
import { UUID, PaginationParams } from '../../../../shared/types';
import { ITraceRepository } from '../../domain/repositories/trace-repository.interface';
import { TraceEntity } from '../../domain/entities/trace.entity';
export declare class TraceManagementService {
    private readonly _repository;
    private readonly _dataCollector?;
    private readonly _logger?;
    constructor(_repository: ITraceRepository, _dataCollector?: IDataCollector | undefined, _logger?: ILogger | undefined);
    startTrace(data: StartTraceData): Promise<TraceEntity>;
    addSpan(traceId: string, spanData: SpanData): Promise<SpanEntity>;
    endTrace(traceId: string, endData?: EndTraceData): Promise<TraceEntity>;
    getTrace(traceId: string): Promise<TraceEntity | null>;
    queryTraces(queryOrFilter: TraceQuery | TraceQueryFilter, pagination?: PaginationParams): Promise<TraceEntity[] | {
        traces: TraceEntityData[];
        total: number;
    }>;
    getTraceStatistics(traceId: string): Promise<TraceStatistics>;
    deleteTrace(traceId: string): Promise<boolean>;
    createTrace(request: CreateTraceRequest): Promise<TraceEntityData>;
    private validateTraceData;
    private calculateTraceStatistics;
    private calculateCriticalPath;
    private identifyBottlenecks;
    private generateTraceId;
    private generateSpanId;
    private validateCreateRequest;
    private buildTraceEntity;
    private buildEventObject;
    private buildDefaultAuditTrail;
    private buildDefaultPerformanceMetrics;
    private buildDefaultMonitoringIntegration;
    private buildDefaultVersionHistory;
    private buildDefaultSearchMetadata;
    private buildDefaultTraceDetails;
    private buildDefaultEventIntegration;
    private buildCompleteErrorInformation;
    private buildCompleteDecisionLog;
    private recordAuditEvent;
    updateTrace(request: UpdateTraceRequest): Promise<TraceEntityData>;
    getTraceById(traceId: UUID): Promise<TraceEntityData | null>;
    traceExists(traceId: UUID): Promise<boolean>;
    getTraceCount(filter?: Partial<TraceQueryFilter>): Promise<number>;
    createTraceBatch(requests: CreateTraceRequest[]): Promise<TraceEntityData[]>;
    deleteTraceBatch(traceIds: UUID[]): Promise<number>;
    analyzeTrace(_traceId: UUID): Promise<TraceAnalysisResult>;
    validateTrace(_traceData: TraceSchema): Promise<TraceValidationResult>;
    getHealthStatus(): Promise<{
        status: string;
        timestamp: string;
        details: {
            service: string;
            version: string;
            repository: {
                status: "healthy" | "degraded" | "unhealthy";
                timestamp: string;
                details?: Record<string, unknown>;
            };
        };
    }>;
}
//# sourceMappingURL=trace-management.service.d.ts.map