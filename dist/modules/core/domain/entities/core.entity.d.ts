/**
 * Core领域实体
 *
 * @description Core模块的核心领域实体，封装MPLP协议栈的核心工作流和协调逻辑
 * @version 1.0.0
 * @layer 领域层 - 实体
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的DDD实体封装模式
 */
import { UUID, Timestamp, Version, WorkflowStageType, CoreOperation, AuditEventType, WorkflowConfig, ExecutionContext, ExecutionStatus, ModuleCoordination, EventHandling, AuditTrail, MonitoringIntegration, PerformanceMetricsConfig, VersionHistory, SearchMetadata, EventIntegration, CoreDetails } from '../../types';
/**
 * Core核心实体
 * 代表MPLP协议栈的核心工作流和协调实体
 */
export declare class CoreEntity {
    readonly protocolVersion: Version;
    readonly timestamp: Timestamp;
    readonly workflowId: UUID;
    readonly orchestratorId: UUID;
    workflowConfig: WorkflowConfig;
    executionContext: ExecutionContext;
    executionStatus: ExecutionStatus;
    moduleCoordination?: ModuleCoordination;
    eventHandling?: EventHandling;
    auditTrail: AuditTrail;
    monitoringIntegration: MonitoringIntegration;
    performanceMetrics: PerformanceMetricsConfig;
    versionHistory: VersionHistory;
    searchMetadata: SearchMetadata;
    coreOperation: CoreOperation;
    coreDetails?: CoreDetails;
    eventIntegration: EventIntegration;
    constructor(data: {
        protocolVersion: Version;
        timestamp: Timestamp;
        workflowId: UUID;
        orchestratorId: UUID;
        workflowConfig: WorkflowConfig;
        executionContext: ExecutionContext;
        executionStatus: ExecutionStatus;
        moduleCoordination?: ModuleCoordination;
        eventHandling?: EventHandling;
        auditTrail: AuditTrail;
        monitoringIntegration: MonitoringIntegration;
        performanceMetrics: PerformanceMetricsConfig;
        versionHistory: VersionHistory;
        searchMetadata: SearchMetadata;
        coreOperation: CoreOperation;
        coreDetails?: CoreDetails;
        eventIntegration: EventIntegration;
    });
    /**
     * 验证必需字段
     * @param data 实体数据
     */
    private validateRequiredFields;
    /**
     * 更新工作流配置
     * @param config 新的工作流配置
     */
    updateWorkflowConfig(config: WorkflowConfig): void;
    /**
     * 更新执行状态
     * @param status 新的执行状态
     */
    updateExecutionStatus(status: ExecutionStatus): void;
    /**
     * 添加审计事件
     * @param event 审计事件
     */
    addAuditEvent(event: {
        eventId: UUID;
        eventType: AuditEventType;
        timestamp: Timestamp;
        userId: string;
        userRole?: string;
        action: string;
        resource: string;
        systemOperation?: string;
        workflowId?: UUID;
        orchestratorId?: UUID;
        coreOperation?: string;
        coreStatus?: string;
        moduleIds?: string[];
        coreDetails?: Record<string, unknown>;
        ipAddress?: string;
        userAgent?: string;
        sessionId?: string;
        correlationId?: UUID;
    }): void;
    /**
     * 检查工作流是否完成
     * @returns 是否完成
     */
    isWorkflowCompleted(): boolean;
    /**
     * 检查工作流是否失败
     * @returns 是否失败
     */
    isWorkflowFailed(): boolean;
    /**
     * 检查工作流是否正在进行
     * @returns 是否正在进行
     */
    isWorkflowInProgress(): boolean;
    /**
     * 获取当前阶段
     * @returns 当前阶段
     */
    getCurrentStage(): WorkflowStageType | undefined;
    /**
     * 获取已完成的阶段
     * @returns 已完成的阶段列表
     */
    getCompletedStages(): WorkflowStageType[];
    /**
     * 获取工作流持续时间
     * @returns 持续时间（毫秒）
     */
    getWorkflowDuration(): number | undefined;
    /**
     * 检查是否启用了审计
     * @returns 是否启用审计
     */
    isAuditEnabled(): boolean;
    /**
     * 检查是否启用了监控
     * @returns 是否启用监控
     */
    isMonitoringEnabled(): boolean;
    /**
     * 检查是否启用了性能指标收集
     * @returns 是否启用性能指标收集
     */
    isPerformanceMetricsEnabled(): boolean;
    /**
     * 检查是否启用了版本历史
     * @returns 是否启用版本历史
     */
    isVersionHistoryEnabled(): boolean;
    /**
     * 检查是否启用了搜索元数据
     * @returns 是否启用搜索元数据
     */
    isSearchMetadataEnabled(): boolean;
    /**
     * 检查是否启用了事件集成
     * @returns 是否启用事件集成
     */
    isEventIntegrationEnabled(): boolean;
    /**
     * 获取实体的JSON表示
     * @returns JSON对象
     */
    toJSON(): Record<string, unknown>;
    /**
     * 创建实体的副本
     * @returns 新的实体实例
     */
    clone(): CoreEntity;
}
//# sourceMappingURL=core.entity.d.ts.map