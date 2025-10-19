/**
 * Trace仓库实现 (预留实现)
 *
 * @description Trace模块的数据访问层实现，当前为内存存储的预留实现
 * @version 1.0.0
 * @layer 基础设施层 - 仓库实现
 * @pattern 仓库模式，预留接口等待完整实现
 */
import { TraceEntityData, TraceQueryFilter, CreateTraceRequest, UpdateTraceRequest, TimeRange, TraceFilters } from '../../types';
import { UUID, PaginationParams } from '../../../../shared/types';
import { ITraceRepository } from '../../domain/repositories/trace-repository.interface';
import { TraceEntity } from '../../domain/entities/trace.entity';
/**
 * Trace仓库配置
 */
export interface TraceRepositoryConfig {
    enableCaching?: boolean;
    maxCacheSize?: number;
    cacheTimeout?: number;
}
/**
 * Trace仓库实现 (预留实现)
 *
 * @description 提供内存存储的预留实现，等待完整的数据库实现
 */
export declare class TraceRepository implements ITraceRepository {
    private traces;
    private config;
    constructor(config?: TraceRepositoryConfig);
    /**
     * 创建追踪记录 - 完整实现
     */
    create(request: CreateTraceRequest): Promise<TraceEntityData>;
    /**
     * 验证创建请求
     */
    private validateCreateRequest;
    /**
     * 构建追踪实体
     */
    private buildTraceEntity;
    /**
     * 生成追踪ID
     */
    private generateTraceId;
    /**
     * 构建事件对象
     */
    private buildEventObject;
    /**
     * 构建完整的错误信息
     */
    private buildCompleteErrorInformation;
    /**
     * 构建完整的决策日志
     */
    private buildCompleteDecisionLog;
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
     * 根据ID获取追踪记录 (预留)
     */
    findById(traceId: UUID): Promise<TraceEntityData | null>;
    /**
     * 更新追踪记录 - 完整实现 (重载方法)
     */
    update(request: UpdateTraceRequest): Promise<TraceEntityData>;
    update(trace: TraceEntity): Promise<TraceEntity>;
    /**
     * 删除追踪记录 (预留)
     */
    delete(traceId: UUID): Promise<boolean>;
    /**
     * 查询追踪记录 - 完整实现
     */
    query(filter: TraceQueryFilter, pagination?: PaginationParams): Promise<{
        traces: TraceEntityData[];
        total: number;
    }>;
    /**
     * 应用过滤条件
     */
    private applyFilters;
    /**
     * 检查追踪记录是否存在 (预留)
     */
    exists(traceId: UUID): Promise<boolean>;
    /**
     * 获取追踪记录数量 - 完整实现
     */
    count(filter?: Partial<TraceQueryFilter>): Promise<number>;
    /**
     * 批量创建追踪记录 (预留)
     */
    createBatch(_requests: CreateTraceRequest[]): Promise<TraceEntityData[]>;
    /**
     * 批量删除追踪记录 (预留)
     */
    deleteBatch(traceIds: UUID[]): Promise<number>;
    /**
     * 获取健康状态 (预留)
     */
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
    /**
     * 保存追踪实体
     */
    save(trace: TraceEntity): Promise<TraceEntity>;
    /**
     * 按时间范围查询
     */
    queryByTimeRange(timeRange: TimeRange, filters?: TraceFilters): Promise<TraceEntity[]>;
    /**
     * 获取存储统计信息
     */
    getStorageStatistics(): Promise<{
        totalTraces: number;
        totalStorageSize: number;
        averageTraceSize: number;
        compressionRatio: number;
    }>;
}
//# sourceMappingURL=trace.repository.d.ts.map