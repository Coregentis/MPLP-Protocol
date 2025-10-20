"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceController = void 0;
/**
 * Trace API控制器
 *
 * @description 提供Trace的RESTful API接口，严格遵循MPLP v1.0协议标准
 */
class TraceController {
    constructor(traceManagementService) {
        this.traceManagementService = traceManagementService;
    }
    // ===== RESTful API方法 =====
    /**
     * 创建新Trace
     * POST /traces
     */
    async createTrace(dto) {
        try {
            // 验证DTO
            this.validateCreateDto(dto);
            // 调用应用服务
            const trace = await this.traceManagementService.createTrace(dto);
            return {
                success: true,
                traceId: trace.traceId,
                message: 'Trace created successfully',
                data: this.mapToResponseDto(trace)
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to create trace',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * 获取Trace详情
     * GET /traces/:id
     */
    async getTrace(traceId) {
        try {
            const trace = await this.traceManagementService.getTraceById(traceId);
            if (!trace) {
                return {
                    success: false,
                    message: 'Trace not found'
                };
            }
            return {
                success: true,
                traceId: trace.traceId,
                message: 'Trace retrieved successfully',
                data: this.mapToResponseDto(trace)
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to retrieve trace',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * 更新Trace
     * PUT /traces/:id
     */
    async updateTrace(traceId, dto) {
        try {
            // 设置traceId
            dto.traceId = traceId;
            // 验证DTO
            this.validateUpdateDto(dto);
            // 调用应用服务
            const trace = await this.traceManagementService.updateTrace(dto);
            return {
                success: true,
                traceId: trace.traceId,
                message: 'Trace updated successfully',
                data: this.mapToResponseDto(trace)
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to update trace',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * 删除Trace
     * DELETE /traces/:id
     */
    async deleteTrace(traceId) {
        try {
            const deleted = await this.traceManagementService.deleteTrace(traceId);
            if (deleted) {
                return {
                    success: true,
                    traceId,
                    message: 'Trace deleted successfully'
                };
            }
            else {
                return {
                    success: false,
                    traceId,
                    message: 'Trace not found or already deleted'
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to delete trace',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * 查询Traces
     * GET /traces
     */
    async queryTraces(queryDto, pagination) {
        try {
            const result = await this.traceManagementService.queryTraces(queryDto, pagination);
            // 确保result是正确的分页查询结果类型
            const queryResult = result;
            return {
                traces: queryResult.traces.map((trace) => this.mapToResponseDto(trace)),
                total: queryResult.total,
                page: pagination?.page,
                limit: pagination?.limit
            };
        }
        catch (error) {
            throw new Error(`Failed to query traces: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * 获取Trace数量
     * GET /traces/count
     */
    async getTraceCount(queryDto) {
        try {
            const count = await this.traceManagementService.getTraceCount(queryDto);
            return { count };
        }
        catch (error) {
            throw new Error(`Failed to get trace count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * 检查Trace是否存在
     * HEAD /traces/:id
     */
    async traceExists(traceId) {
        try {
            const exists = await this.traceManagementService.traceExists(traceId);
            return { exists };
        }
        catch (error) {
            throw new Error(`Failed to check trace existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * 批量创建Traces
     * POST /traces/batch
     */
    async createTraceBatch(dtos) {
        try {
            // 验证所有DTOs
            dtos.forEach(dto => this.validateCreateDto(dto));
            const traces = await this.traceManagementService.createTraceBatch(dtos);
            return {
                successCount: traces.length,
                failureCount: 0,
                results: traces.map(trace => ({
                    id: trace.traceId,
                    success: true
                }))
            };
        }
        catch (error) {
            return {
                successCount: 0,
                failureCount: dtos.length,
                results: dtos.map((_, index) => ({
                    id: `batch-${index}`,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }))
            };
        }
    }
    /**
     * 批量删除Traces
     * DELETE /traces/batch
     */
    async deleteTraceBatch(traceIds) {
        try {
            const deletedCount = await this.traceManagementService.deleteTraceBatch(traceIds);
            return {
                successCount: deletedCount,
                failureCount: traceIds.length - deletedCount,
                results: traceIds.map(id => ({
                    id,
                    success: true
                }))
            };
        }
        catch (error) {
            return {
                successCount: 0,
                failureCount: traceIds.length,
                results: traceIds.map(id => ({
                    id,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                }))
            };
        }
    }
    /**
     * 获取健康状态
     * GET /traces/health
     */
    async getHealthStatus() {
        try {
            const health = await this.traceManagementService.getHealthStatus();
            // 构建符合HealthStatusDto格式的响应
            return {
                status: health.status,
                timestamp: new Date().toISOString(),
                details: {
                    service: 'TraceManagementService',
                    version: '1.0.0',
                    repository: {
                        status: 'healthy',
                        recordCount: 0,
                        lastOperation: 'health-check'
                    }
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                details: {
                    service: 'TraceManagementService',
                    version: '1.0.0',
                    repository: {
                        status: 'error',
                        recordCount: 0,
                        lastOperation: 'health-check'
                    }
                }
            };
        }
    }
    // ===== 私有辅助方法 =====
    /**
     * 验证创建DTO
     */
    validateCreateDto(dto) {
        if (!dto.contextId) {
            throw new Error('Context ID is required');
        }
        if (!dto.traceType) {
            throw new Error('Trace type is required');
        }
        if (!dto.severity) {
            throw new Error('Severity is required');
        }
        if (!dto.event?.name) {
            throw new Error('Event name is required');
        }
        if (!dto.traceOperation) {
            throw new Error('Trace operation is required');
        }
    }
    /**
     * 验证更新DTO
     */
    validateUpdateDto(dto) {
        if (!dto.traceId) {
            throw new Error('Trace ID is required for update');
        }
    }
    /**
     * 映射到响应DTO
     * 确保使用camelCase命名，符合MPLP v1.0协议标准
     */
    mapToResponseDto(trace) {
        return {
            traceId: trace.traceId,
            contextId: trace.contextId,
            planId: trace.planId,
            taskId: trace.taskId,
            traceType: trace.traceType,
            severity: trace.severity,
            event: trace.event,
            timestamp: trace.timestamp,
            traceOperation: trace.traceOperation,
            contextSnapshot: trace.contextSnapshot ? {
                variables: trace.contextSnapshot.variables,
                callStack: trace.contextSnapshot.callStack?.map(frame => ({
                    function: frame.function,
                    file: frame.file || '',
                    line: frame.line || 0,
                    arguments: frame.arguments
                })),
                environment: trace.contextSnapshot.environment ? {
                    os: trace.contextSnapshot.environment.os || '',
                    platform: trace.contextSnapshot.environment.platform || '',
                    runtimeVersion: trace.contextSnapshot.environment.runtimeVersion || '',
                    environmentVariables: trace.contextSnapshot.environment.environmentVariables
                } : undefined
            } : undefined,
            errorInformation: trace.errorInformation,
            decisionLog: trace.decisionLog ? {
                decisionPoint: trace.decisionLog.decisionPoint,
                optionsConsidered: trace.decisionLog.optionsConsidered,
                selectedOption: trace.decisionLog.selectedOption,
                decisionCriteria: trace.decisionLog.decisionCriteria?.map(criterion => ({
                    criterion: criterion.criterion,
                    weight: criterion.weight,
                    evaluation: criterion.evaluation || ''
                })),
                confidenceLevel: trace.decisionLog.confidenceLevel
            } : undefined,
            traceDetails: trace.traceDetails,
            protocolVersion: trace.protocolVersion || '1.0.0'
        };
    }
}
exports.TraceController = TraceController;
//# sourceMappingURL=trace.controller.js.map