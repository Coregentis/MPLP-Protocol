"use strict";
/**
 * Trace模块DTO定义
 *
 * @description API层数据传输对象，严格基于Schema驱动开发和双重命名约定
 * @version 1.0.0
 * @layer API层 - 数据传输对象
 * @pattern 基于Context模块的IDENTICAL企业级模式
 * @schema 基于src/schemas/core-modules/mplp-trace.json
 * @naming Schema(snake_case) ↔ TypeScript(camelCase)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthStatusDto = exports.BatchOperationResultDto = exports.TraceOperationResultDto = exports.TraceQueryResultDto = exports.TraceResponseDto = exports.TraceDetailsDto = exports.DecisionLogDto = exports.ErrorInformationDto = exports.ContextSnapshotDto = exports.EventObjectDto = exports.TraceQueryDto = exports.UpdateTraceDto = exports.CreateTraceDto = void 0;
/**
 * 创建Trace请求DTO
 * 基于CreateTraceRequest接口，确保与Schema一致
 */
class CreateTraceDto {
}
exports.CreateTraceDto = CreateTraceDto;
/**
 * 更新Trace请求DTO
 * 基于UpdateTraceRequest接口，确保与Schema一致
 */
class UpdateTraceDto {
}
exports.UpdateTraceDto = UpdateTraceDto;
/**
 * Trace查询DTO
 * 基于TraceQueryFilter接口，确保与Schema一致
 */
class TraceQueryDto {
}
exports.TraceQueryDto = TraceQueryDto;
/**
 * 事件对象DTO
 * 基于EventObject接口，确保与Schema一致
 */
class EventObjectDto {
    constructor() {
        this.type = 'start';
        this.name = '';
        this.category = 'system';
        this.source = {
            component: ''
        };
    }
}
exports.EventObjectDto = EventObjectDto;
/**
 * 上下文快照DTO
 * 基于ContextSnapshot接口，确保与Schema一致
 */
class ContextSnapshotDto {
}
exports.ContextSnapshotDto = ContextSnapshotDto;
/**
 * 错误信息DTO
 * 基于ErrorInformation接口，确保与Schema一致
 */
class ErrorInformationDto {
}
exports.ErrorInformationDto = ErrorInformationDto;
/**
 * 决策日志DTO
 * 基于DecisionLog接口，确保与Schema一致
 */
class DecisionLogDto {
}
exports.DecisionLogDto = DecisionLogDto;
/**
 * 追踪详情DTO
 * 基于TraceDetails接口，确保与Schema一致
 */
class TraceDetailsDto {
}
exports.TraceDetailsDto = TraceDetailsDto;
/**
 * Trace响应DTO
 * 基于TraceEntityData，使用camelCase命名
 */
class TraceResponseDto {
    /**
     * 构造函数 - 初始化所有camelCase字段以确保命名约定测试通过
     */
    constructor(data) {
        this.traceId = '';
        this.contextId = '';
        this.planId = undefined;
        this.taskId = undefined;
        this.traceType = 'execution';
        this.severity = 'info';
        this.event = new EventObjectDto();
        this.timestamp = '';
        // 修复：'create'不是有效的TraceOperation值，使用'start'代替
        // TraceOperation定义：'start' | 'record' | 'analyze' | 'export' | 'archive' | 'update'
        this.traceOperation = 'start';
        this.contextSnapshot = undefined;
        this.errorInformation = undefined;
        this.decisionLog = undefined;
        this.traceDetails = undefined;
        this.protocolVersion = '1.0.0';
        if (data) {
            Object.assign(this, data);
        }
    }
}
exports.TraceResponseDto = TraceResponseDto;
/**
 * Trace查询结果DTO
 * 基于Repository查询结果，使用标准分页格式
 */
class TraceQueryResultDto {
}
exports.TraceQueryResultDto = TraceQueryResultDto;
/**
 * Trace操作结果DTO
 * 基于Context模块的操作结果模式
 */
class TraceOperationResultDto {
}
exports.TraceOperationResultDto = TraceOperationResultDto;
/**
 * 批量操作结果DTO
 * 基于Repository批量操作结果
 */
class BatchOperationResultDto {
}
exports.BatchOperationResultDto = BatchOperationResultDto;
/**
 * 健康状态DTO
 * 基于Service健康检查结果
 */
class HealthStatusDto {
}
exports.HealthStatusDto = HealthStatusDto;
//# sourceMappingURL=trace.dto.js.map