/**
 * Trace管理服务 (预留实现)
 *
 * @description Trace模块的核心业务逻辑服务，预留接口等待完整实现
 * @version 1.0.0
 * @layer 应用层 - 服务
 * @pattern 预留接口模式，等待阶段4完整实现
 */
import { TraceEntityData, TraceSchema, CreateTraceRequest, UpdateTraceRequest, TraceQueryFilter, TraceAnalysisResult, TraceValidationResult, StartTraceData, EndTraceData, SpanData, SpanEntity, TraceQuery, TraceStatistics, IDataCollector, ILogger } from '../../types';
import { UUID, PaginationParams } from '../../../../shared/types';
import { ITraceRepository } from '../../domain/repositories/trace-repository.interface';
import { TraceEntity } from '../../domain/entities/trace.entity';
/**
 * 核心追踪管理服务
 *
 * @description 提供Trace模块的核心追踪和监控管理功能，遵循统一架构标准
 * @version 1.0.0
 * @layer 应用层 - 服务
 * @pattern 基于统一架构标准的企业级服务实现
 */
export declare class TraceManagementService {
    private readonly _repository;
    private readonly _dataCollector?;
    private readonly _logger?;
    constructor(_repository: ITraceRepository, _dataCollector?: IDataCollector | undefined, _logger?: ILogger | undefined);
    /**
     * 开始追踪
     */
    startTrace(data: StartTraceData): Promise<TraceEntity>;
    /**
     * 添加追踪跨度
     */
    addSpan(traceId: string, spanData: SpanData): Promise<SpanEntity>;
    /**
     * 结束追踪
     */
    endTrace(traceId: string, endData?: EndTraceData): Promise<TraceEntity>;
    /**
     * 获取追踪
     */
    getTrace(traceId: string): Promise<TraceEntity | null>;
    /**
     * 查询追踪 (重载方法)
     */
    queryTraces(queryOrFilter: TraceQuery | TraceQueryFilter, pagination?: PaginationParams): Promise<TraceEntity[] | {
        traces: TraceEntityData[];
        total: number;
    }>;
    /**
     * 获取追踪统计
     */
    getTraceStatistics(traceId: string): Promise<TraceStatistics>;
    /**
     * 删除追踪 (兼容性方法)
     */
    deleteTrace(traceId: string): Promise<boolean>;
    /**
     * 创建追踪记录 (兼容性方法)
     */
    createTrace(request: CreateTraceRequest): Promise<TraceEntityData>;
    private validateTraceData;
    private calculateTraceStatistics;
    private calculateCriticalPath;
    private identifyBottlenecks;
    private generateTraceId;
    private generateSpanId;
    /**
     * 验证创建请求
     */
    private validateCreateRequest;
    /**
     * 构建追踪实体
     */
    private buildTraceEntity;
    /**
     * 构建事件对象
     */
    private buildEventObject;
    /**
     * 构建默认审计跟踪
     */
    private buildDefaultAuditTrail;
    /**
     * 构建默认性能指标
     */
    private buildDefaultPerformanceMetrics;
    /**
     * 构建默认监控集成
     */
    private buildDefaultMonitoringIntegration;
    /**
     * 构建默认版本历史
     */
    private buildDefaultVersionHistory;
    /**
     * 构建默认搜索元数据
     */
    private buildDefaultSearchMetadata;
    /**
     * 构建默认追踪详情
     */
    private buildDefaultTraceDetails;
    /**
     * 构建默认事件集成
     */
    private buildDefaultEventIntegration;
    /**
     * 构建完整的错误信息
     */
    private buildCompleteErrorInformation;
    /**
     * 构建完整的决策日志
     */
    private buildCompleteDecisionLog;
    /**
     * 记录审计事件
     */
    private recordAuditEvent;
    /**
     * 更新追踪记录 - 兼容性方法
     */
    updateTrace(request: UpdateTraceRequest): Promise<TraceEntityData>;
    /**
     * 获取追踪记录 (别名方法，用于测试兼容性)
     */
    getTraceById(traceId: UUID): Promise<TraceEntityData | null>;
    /**
     * 检查追踪记录是否存在
     */
    traceExists(traceId: UUID): Promise<boolean>;
    /**
     * 获取追踪记录数量
     */
    getTraceCount(filter?: Partial<TraceQueryFilter>): Promise<number>;
    /**
     * 批量创建追踪记录
     */
    createTraceBatch(requests: CreateTraceRequest[]): Promise<TraceEntityData[]>;
    /**
     * 批量删除追踪记录
     */
    deleteTraceBatch(traceIds: UUID[]): Promise<number>;
    /**
     * 分析追踪数据 (预留)
     */
    analyzeTrace(_traceId: UUID): Promise<TraceAnalysisResult>;
    /**
     * 验证追踪数据 (预留)
     */
    validateTrace(_traceData: TraceSchema): Promise<TraceValidationResult>;
    /**
     * 获取健康状态 - 完整实现
     */
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