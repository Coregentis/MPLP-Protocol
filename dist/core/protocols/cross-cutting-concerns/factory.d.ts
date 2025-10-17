import { MLPPSecurityManager } from './security-manager';
import { MLPPPerformanceMonitor } from './performance-monitor';
import { MLPPEventBusManager } from './event-bus-manager';
import { MLPPErrorHandler } from './error-handler';
import { MLPPCoordinationManager } from './coordination-manager';
import { MLPPOrchestrationManager } from './orchestration-manager';
import { MLPPStateSyncManager } from './state-sync-manager';
import { MLPPTransactionManager } from './transaction-manager';
import { MLPPProtocolVersionManager } from './protocol-version-manager';
export interface CrossCuttingConcernsConfig {
    security?: {
        enabled: boolean;
        authenticationMethods?: string[];
        sessionTimeout?: number;
    };
    performance?: {
        enabled: boolean;
        collectionInterval?: number;
        retentionPeriod?: number;
    };
    eventBus?: {
        enabled: boolean;
        maxListeners?: number;
    };
    errorHandler?: {
        enabled: boolean;
        logLevel?: string;
        maxErrors?: number;
    };
    coordination?: {
        enabled: boolean;
        timeout?: number;
    };
    orchestration?: {
        enabled: boolean;
        maxConcurrentWorkflows?: number;
    };
    stateSync?: {
        enabled: boolean;
        syncInterval?: number;
    };
    transaction?: {
        enabled: boolean;
        defaultTimeout?: number;
    };
    protocolVersion?: {
        enabled: boolean;
        strictVersioning?: boolean;
    };
}
export interface CrossCuttingManagers {
    security: MLPPSecurityManager;
    performance: MLPPPerformanceMonitor;
    eventBus: MLPPEventBusManager;
    errorHandler: MLPPErrorHandler;
    coordination: MLPPCoordinationManager;
    orchestration: MLPPOrchestrationManager;
    stateSync: MLPPStateSyncManager;
    transaction: MLPPTransactionManager;
    protocolVersion: MLPPProtocolVersionManager;
}
export declare class CrossCuttingConcernsFactory {
    private static instance;
    private managers;
    private constructor();
    static getInstance(): CrossCuttingConcernsFactory;
    createManagers(config?: CrossCuttingConcernsConfig): CrossCuttingManagers;
    getManagers(): CrossCuttingManagers | null;
    reset(): void;
    private applyConfiguration;
    private applySecurityConfig;
    private applyPerformanceConfig;
    private applyEventBusConfig;
    private applyErrorHandlerConfig;
    private applyCoordinationConfig;
    private applyOrchestrationConfig;
    private applyStateSyncConfig;
    private applyTransactionConfig;
    private applyProtocolVersionConfig;
    healthCheckAll(): Promise<Record<string, boolean>>;
}
//# sourceMappingURL=factory.d.ts.map