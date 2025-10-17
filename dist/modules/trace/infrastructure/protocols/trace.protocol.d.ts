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
    createTrace(request: CreateTraceRequest): Promise<TraceExecutionResult>;
    updateTrace(request: UpdateTraceRequest): Promise<TraceExecutionResult>;
    getTrace(traceId: UUID): Promise<TraceEntityData | null>;
    queryTraces(filter: TraceQueryFilter, pagination?: PaginationParams): Promise<{
        traces: TraceEntityData[];
        total: number;
    }>;
    analyzeTrace(traceId: UUID): Promise<TraceAnalysisResult>;
    validateTrace(traceData: TraceSchema): Promise<TraceValidationResult>;
    getMetadata(): ProtocolMetadata;
    getHealthStatus(): Promise<ProtocolHealthStatus>;
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
    integrateWithContext(_contextId: UUID, _operation: string): Promise<void>;
    integrateWithPlan(_planId: UUID, _operation: string): Promise<void>;
    integrateWithConfirm(_confirmId: UUID, _operation: string): Promise<void>;
    integrateWithRole(_roleId: UUID, _operation: string): Promise<void>;
    integrateWithExtension(_extensionId: UUID, _operation: string): Promise<void>;
    integrateWithCore(_coreId: UUID, _operation: string): Promise<void>;
    integrateWithCollab(_collabId: UUID, _operation: string): Promise<void>;
    integrateWithDialog(_dialogId: UUID, _operation: string): Promise<void>;
    integrateWithNetwork(_networkId: UUID, _operation: string): Promise<void>;
}
export {};
//# sourceMappingURL=trace.protocol.d.ts.map