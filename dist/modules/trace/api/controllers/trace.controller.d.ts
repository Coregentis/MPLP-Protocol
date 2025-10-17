import { TraceManagementService } from '../../application/services/trace-management.service';
import { CreateTraceDto, UpdateTraceDto, TraceQueryDto, TraceQueryResultDto, TraceOperationResultDto, BatchOperationResultDto, HealthStatusDto } from '../dto/trace.dto';
import { UUID, PaginationParams } from '../../../../shared/types';
export declare class TraceController {
    private readonly traceManagementService;
    constructor(traceManagementService: TraceManagementService);
    createTrace(dto: CreateTraceDto): Promise<TraceOperationResultDto>;
    getTrace(traceId: UUID): Promise<TraceOperationResultDto>;
    updateTrace(traceId: UUID, dto: UpdateTraceDto): Promise<TraceOperationResultDto>;
    deleteTrace(traceId: UUID): Promise<TraceOperationResultDto>;
    queryTraces(queryDto: TraceQueryDto, pagination?: PaginationParams): Promise<TraceQueryResultDto>;
    getTraceCount(queryDto?: TraceQueryDto): Promise<{
        count: number;
    }>;
    traceExists(traceId: UUID): Promise<{
        exists: boolean;
    }>;
    createTraceBatch(dtos: CreateTraceDto[]): Promise<BatchOperationResultDto>;
    deleteTraceBatch(traceIds: UUID[]): Promise<BatchOperationResultDto>;
    getHealthStatus(): Promise<HealthStatusDto>;
    private validateCreateDto;
    private validateUpdateDto;
    private mapToResponseDto;
}
//# sourceMappingURL=trace.controller.d.ts.map