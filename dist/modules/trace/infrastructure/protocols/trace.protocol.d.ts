/**
 * Trace协议实现
 *
 * @description Trace模块的MPLP协议实现，基于实际的管理器接口集成所有9个L3横切关注点管理器
 * @version 1.0.0
 * @layer 基础设施层 - 协议
 * @integration 统一L3管理器注入模式，与Context、Plan、Role、Confirm模块IDENTICAL架构
 * @reference Context模块成功实现模式
 */
import { TraceManagementService } from '../../application/services/trace-management.service';
import { TraceEntityData, TraceSchema, CreateTraceRequest, UpdateTraceRequest, TraceQueryFilter, TraceExecutionResult, TraceAnalysisResult, TraceValidationResult } from '../../types';
import { UUID, PaginationParams } from '../../../../shared/types';
interface MockL3Manager {
    getHealthStatus(): Promise<{
        status: string;
        timestamp: string;
    }>;
}
interface MockPerformanceMonitor extends MockL3Manager {
    startOperation(operation: string): Promise<string>;
    endOperation(operationId: string, success?: boolean): Promise<void>;
    getOperationDuration(operationId: string): Promise<number>;
}
interface MockEventBusManager extends MockL3Manager {
    publishEvent(eventType: string, data: Record<string, unknown>): Promise<void>;
}
interface MockErrorHandler extends MockL3Manager {
    handleError(error: unknown, context: Record<string, unknown>): Promise<{
        code: string;
        message: string;
        details?: unknown;
    }>;
}
interface MockTransactionManager extends MockL3Manager {
    beginTransaction(): Promise<string>;
    commitTransaction(transactionId: string): Promise<void>;
    rollbackTransaction(transactionId: string): Promise<void>;
}
interface MockCoordinationManager extends MockL3Manager {
    registerIntegration(sourceModule: string, targetModule: string): Promise<void>;
}
import { ProtocolMetadata, ProtocolHealthStatus } from '../../types';
interface IMLPPProtocol {
    getMetadata(): ProtocolMetadata;
    getHealthStatus(): Promise<ProtocolHealthStatus>;
}
/**
 * Trace协议类
 *
 * @description 实现MPLP协议标准，集成9个L3横切关注点管理器
 * @pattern 与其他8个模块使用IDENTICAL的直接实现IMLPPProtocol模式
 */
export declare class TraceProtocol implements IMLPPProtocol {
    private readonly traceManagementService;
    private readonly securityManager;
    private readonly performanceMonitor;
    private readonly eventBusManager;
    private readonly errorHandler;
    private readonly coordinationManager;
    private readonly orchestrationManager;
    private readonly stateSyncManager;
    private readonly transactionManager;
    private readonly protocolVersionManager;
    constructor(traceManagementService: TraceManagementService, securityManager: MockL3Manager, performanceMonitor: MockPerformanceMonitor, eventBusManager: MockEventBusManager, errorHandler: MockErrorHandler, coordinationManager: MockCoordinationManager, orchestrationManager: MockL3Manager, stateSyncManager: MockL3Manager, transactionManager: MockTransactionManager, protocolVersionManager: MockL3Manager);
    /**
     * 创建追踪记录
     *
     * @description 使用标准6步调用序列：性能监控→事务→业务逻辑→提交→事件→监控结束
     */
    createTrace(request: CreateTraceRequest): Promise<TraceExecutionResult>;
    /**
     * 更新追踪记录
     */
    updateTrace(request: UpdateTraceRequest): Promise<TraceExecutionResult>;
    /**
     * 获取追踪记录
     */
    getTrace(traceId: UUID): Promise<TraceEntityData | null>;
    /**
     * 查询追踪记录
     */
    queryTraces(filter: TraceQueryFilter, pagination?: PaginationParams): Promise<{
        traces: TraceEntityData[];
        total: number;
    }>;
    /**
     * 分析追踪数据
     */
    analyzeTrace(traceId: UUID): Promise<TraceAnalysisResult>;
    /**
     * 验证追踪数据
     */
    validateTrace(traceData: TraceSchema): Promise<TraceValidationResult>;
    /**
     * 获取协议元数据
     */
    getMetadata(): ProtocolMetadata;
    /**
     * 获取协议健康状态
     */
    getHealthStatus(): Promise<ProtocolHealthStatus>;
    /**
     * 获取横切关注点管理器
     */
    getCrossCuttingManagers(): {
        security: MockL3Manager;
        performance: MockPerformanceMonitor;
        eventBus: MockEventBusManager;
        errorHandler: MockErrorHandler;
        coordination: MockCoordinationManager;
        orchestration: MockL3Manager;
        stateSync: MockL3Manager;
        transaction: MockTransactionManager;
        protocolVersion: MockL3Manager;
    };
    /**
     * Context模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    integrateWithContext(_contextId: UUID, _operation: string): Promise<void>;
    /**
     * Plan模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    integrateWithPlan(_planId: UUID, _operation: string): Promise<void>;
    /**
     * Confirm模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    integrateWithConfirm(_confirmId: UUID, _operation: string): Promise<void>;
    /**
     * Role模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    integrateWithRole(_roleId: UUID, _operation: string): Promise<void>;
    /**
     * Extension模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    integrateWithExtension(_extensionId: UUID, _operation: string): Promise<void>;
    /**
     * Core模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    integrateWithCore(_coreId: UUID, _operation: string): Promise<void>;
    /**
     * Collab模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    integrateWithCollab(_collabId: UUID, _operation: string): Promise<void>;
    /**
     * Dialog模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    integrateWithDialog(_dialogId: UUID, _operation: string): Promise<void>;
    /**
     * Network模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    integrateWithNetwork(_networkId: UUID, _operation: string): Promise<void>;
}
export {};
//# sourceMappingURL=trace.protocol.d.ts.map