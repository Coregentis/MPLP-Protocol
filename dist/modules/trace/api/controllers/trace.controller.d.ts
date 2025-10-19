/**
 * Trace控制器
 *
 * @description Trace模块的API控制器，严格基于Schema驱动开发和双重命名约定
 * @version 1.0.0
 * @layer API层 - 控制器
 * @pattern 基于Context模块的IDENTICAL企业级模式
 * @schema 基于src/schemas/core-modules/mplp-trace.json
 * @naming Schema(snake_case) ↔ TypeScript(camelCase)
 */
import { TraceManagementService } from '../../application/services/trace-management.service';
import { CreateTraceDto, UpdateTraceDto, TraceQueryDto, TraceQueryResultDto, TraceOperationResultDto, BatchOperationResultDto, HealthStatusDto } from '../dto/trace.dto';
import { UUID, PaginationParams } from '../../../../shared/types';
/**
 * Trace API控制器
 *
 * @description 提供Trace的RESTful API接口，严格遵循MPLP v1.0协议标准
 */
export declare class TraceController {
    private readonly traceManagementService;
    constructor(traceManagementService: TraceManagementService);
    /**
     * 创建新Trace
     * POST /traces
     */
    createTrace(dto: CreateTraceDto): Promise<TraceOperationResultDto>;
    /**
     * 获取Trace详情
     * GET /traces/:id
     */
    getTrace(traceId: UUID): Promise<TraceOperationResultDto>;
    /**
     * 更新Trace
     * PUT /traces/:id
     */
    updateTrace(traceId: UUID, dto: UpdateTraceDto): Promise<TraceOperationResultDto>;
    /**
     * 删除Trace
     * DELETE /traces/:id
     */
    deleteTrace(traceId: UUID): Promise<TraceOperationResultDto>;
    /**
     * 查询Traces
     * GET /traces
     */
    queryTraces(queryDto: TraceQueryDto, pagination?: PaginationParams): Promise<TraceQueryResultDto>;
    /**
     * 获取Trace数量
     * GET /traces/count
     */
    getTraceCount(queryDto?: TraceQueryDto): Promise<{
        count: number;
    }>;
    /**
     * 检查Trace是否存在
     * HEAD /traces/:id
     */
    traceExists(traceId: UUID): Promise<{
        exists: boolean;
    }>;
    /**
     * 批量创建Traces
     * POST /traces/batch
     */
    createTraceBatch(dtos: CreateTraceDto[]): Promise<BatchOperationResultDto>;
    /**
     * 批量删除Traces
     * DELETE /traces/batch
     */
    deleteTraceBatch(traceIds: UUID[]): Promise<BatchOperationResultDto>;
    /**
     * 获取健康状态
     * GET /traces/health
     */
    getHealthStatus(): Promise<HealthStatusDto>;
    /**
     * 验证创建DTO
     */
    private validateCreateDto;
    /**
     * 验证更新DTO
     */
    private validateUpdateDto;
    /**
     * 映射到响应DTO
     * 确保使用camelCase命名，符合MPLP v1.0协议标准
     */
    private mapToResponseDto;
}
//# sourceMappingURL=trace.controller.d.ts.map