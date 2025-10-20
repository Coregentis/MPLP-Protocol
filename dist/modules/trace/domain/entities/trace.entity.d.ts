/**
 * Trace领域实体
 *
 * @description Trace模块的核心领域实体，包含业务逻辑和不变量
 * @version 1.0.0
 * @layer 领域层 - 实体
 * @pattern 基于Context模块的IDENTICAL企业级模式
 */
import { TraceEntityData, TraceType, Severity, TraceOperation, EventObject, ContextSnapshot, ErrorInformation, DecisionLog, TraceDetails, SpanEntity, TraceStatistics } from '../../types';
import { UUID, Timestamp } from '../../../../shared/types';
/**
 * Trace领域实体
 *
 * @description 封装Trace的业务逻辑和不变量
 */
export declare class TraceEntity {
    private data;
    constructor(data: Partial<TraceEntityData>);
    get traceId(): UUID;
    get contextId(): UUID;
    get planId(): UUID | undefined;
    get taskId(): UUID | undefined;
    get traceType(): TraceType;
    get severity(): Severity;
    get event(): EventObject;
    get timestamp(): Timestamp;
    get status(): string;
    get duration(): number | undefined;
    get spans(): SpanEntity[];
    get containsSensitiveData(): boolean;
    /**
     * 添加跨度
     */
    addSpan(span: SpanEntity): void;
    /**
     * 结束追踪
     */
    end(endTime: Date, finalStatus: string): void;
    /**
     * 设置统计信息
     */
    setStatistics(statistics: TraceStatistics): void;
    /**
     * 标记为包含敏感数据
     */
    markAsSensitive(): void;
    get traceOperation(): TraceOperation;
    get contextSnapshot(): ContextSnapshot | undefined;
    get errorInformation(): ErrorInformation | undefined;
    get decisionLog(): DecisionLog | undefined;
    get traceDetails(): TraceDetails | undefined;
    /**
     * 更新追踪严重程度
     */
    updateSeverity(newSeverity: Severity): void;
    /**
     * 添加错误信息
     */
    addErrorInformation(errorInfo: ErrorInformation): void;
    /**
     * 添加决策日志
     */
    addDecisionLog(decisionLog: DecisionLog): void;
    /**
     * 更新上下文快照
     */
    updateContextSnapshot(snapshot: ContextSnapshot): void;
    /**
     * 检查是否为错误追踪
     */
    isError(): boolean;
    /**
     * 检查是否包含决策信息
     */
    hasDecision(): boolean;
    /**
     * 获取追踪持续时间（如果有结束时间）
     */
    getDuration(): number | undefined;
    /**
     * 转换为数据对象
     */
    toData(): TraceEntityData;
    /**
     * 初始化数据
     */
    private initializeData;
    /**
     * 验证不变量
     */
    private validateInvariants;
    /**
     * 验证严重程度
     */
    private validateSeverity;
    /**
     * 验证追踪类型
     */
    private validateTraceType;
    /**
     * 验证错误信息
     */
    private validateErrorInformation;
    /**
     * 验证决策日志
     */
    private validateDecisionLog;
    /**
     * 生成追踪ID
     */
    private generateTraceId;
    /**
     * 创建默认事件
     */
    private createDefaultEvent;
    /**
     * 更新时间戳
     */
    private updateTimestamp;
}
//# sourceMappingURL=trace.entity.d.ts.map