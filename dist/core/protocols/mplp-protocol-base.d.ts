import { MLPPSecurityManager } from './cross-cutting-concerns/security-manager.js';
import { MLPPPerformanceMonitor } from './cross-cutting-concerns/performance-monitor.js';
import { MLPPEventBusManager } from './cross-cutting-concerns/event-bus-manager.js';
import { MLPPErrorHandler } from './cross-cutting-concerns/error-handler.js';
import { MLPPCoordinationManager } from './cross-cutting-concerns/coordination-manager.js';
import { MLPPOrchestrationManager } from './cross-cutting-concerns/orchestration-manager.js';
import { MLPPStateSyncManager } from './cross-cutting-concerns/state-sync-manager.js';
import { MLPPTransactionManager } from './cross-cutting-concerns/transaction-manager.js';
import { MLPPProtocolVersionManager } from './cross-cutting-concerns/protocol-version-manager.js';
export interface MLPPRequest {
    protocolVersion: string;
    timestamp: string;
    requestId: string;
    operation: string;
    payload: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}
export interface MLPPResponse {
    protocolVersion: string;
    timestamp: string;
    requestId: string;
    status?: 'success' | 'error' | 'pending';
    success?: boolean;
    data?: unknown;
    result?: Record<string, unknown>;
    message?: string;
    error?: string | {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    metadata?: Record<string, unknown>;
}
export interface ProtocolMetadata {
    name: string;
    moduleName?: string;
    version: string;
    description: string;
    capabilities: string[];
    dependencies: string[];
    supportedOperations: string[];
    crossCuttingConcerns?: string[];
    slaGuarantees?: Record<string, string>;
}
export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string | Date;
    details?: Record<string, unknown>;
    checks: Array<{
        name: string;
        status: 'pass' | 'fail' | 'warn';
        message?: string;
        duration?: number;
    }>;
    metadata?: Record<string, unknown>;
}
export interface IMLPPProtocol {
    executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    getProtocolMetadata(): ProtocolMetadata;
    healthCheck(): Promise<HealthStatus>;
}
export declare abstract class MLPPProtocolBase implements IMLPPProtocol {
    protected readonly securityManager: MLPPSecurityManager;
    protected readonly performanceMonitor: MLPPPerformanceMonitor;
    protected readonly eventBusManager: MLPPEventBusManager;
    protected readonly errorHandler: MLPPErrorHandler;
    protected readonly coordinationManager: MLPPCoordinationManager;
    protected readonly orchestrationManager: MLPPOrchestrationManager;
    protected readonly stateSyncManager: MLPPStateSyncManager;
    protected readonly transactionManager: MLPPTransactionManager;
    protected readonly protocolVersionManager: MLPPProtocolVersionManager;
    protected constructor(securityManager: MLPPSecurityManager, performanceMonitor: MLPPPerformanceMonitor, eventBusManager: MLPPEventBusManager, errorHandler: MLPPErrorHandler, coordinationManager: MLPPCoordinationManager, orchestrationManager: MLPPOrchestrationManager, stateSyncManager: MLPPStateSyncManager, transactionManager: MLPPTransactionManager, protocolVersionManager: MLPPProtocolVersionManager);
    abstract executeOperation(request: MLPPRequest): Promise<MLPPResponse>;
    abstract getProtocolMetadata(): ProtocolMetadata;
    healthCheck(): Promise<HealthStatus>;
    private checkManagerHealth;
    protected performModuleHealthChecks(): Promise<HealthStatus['checks']>;
    protected createResponse(request: MLPPRequest, status: MLPPResponse['status'], result?: Record<string, unknown>, error?: MLPPResponse['error']): MLPPResponse;
    protected createErrorResponse(request: MLPPRequest, code: string, message: string, details?: Record<string, unknown>): MLPPResponse;
}
//# sourceMappingURL=mplp-protocol-base.d.ts.map