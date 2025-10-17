import { MLPPSecurityManager, MLPPPerformanceMonitor, MLPPEventBusManager, MLPPErrorHandler, MLPPCoordinationManager, MLPPOrchestrationManager, MLPPStateSyncManager, MLPPTransactionManager, MLPPProtocolVersionManager, CrossCuttingConcernsFactory } from '../../../../core/protocols/cross-cutting-concerns';
export interface CrossCuttingConcernsIntegrationStatus {
    security: {
        enabled: boolean;
        manager: MLPPSecurityManager | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    performance: {
        enabled: boolean;
        manager: MLPPPerformanceMonitor | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    eventBus: {
        enabled: boolean;
        manager: MLPPEventBusManager | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    errorHandler: {
        enabled: boolean;
        manager: MLPPErrorHandler | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    coordination: {
        enabled: boolean;
        manager: MLPPCoordinationManager | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    orchestration: {
        enabled: boolean;
        manager: MLPPOrchestrationManager | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    stateSync: {
        enabled: boolean;
        manager: MLPPStateSyncManager | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    transaction: {
        enabled: boolean;
        manager: MLPPTransactionManager | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
    protocolVersion: {
        enabled: boolean;
        manager: MLPPProtocolVersionManager | null;
        status: 'active' | 'inactive' | 'error';
        lastCheck: string;
    };
}
export declare class CrossCuttingConcernsIntegrationValidator {
    private readonly crossCuttingFactory;
    constructor(crossCuttingFactory: CrossCuttingConcernsFactory);
    validateIntegration(): Promise<CrossCuttingConcernsIntegrationStatus>;
    generateIntegrationReport(): Promise<{
        summary: {
            totalConcerns: number;
            activeConcerns: number;
            inactiveConcerns: number;
            errorConcerns: number;
            integrationRate: number;
        };
        details: CrossCuttingConcernsIntegrationStatus;
        recommendations: string[];
    }>;
    validateSpecificConcern(concernName: keyof CrossCuttingConcernsIntegrationStatus): Promise<{
        name: string;
        status: 'active' | 'inactive' | 'error';
        functionality: {
            basicOperations: boolean;
            advancedFeatures: boolean;
            errorHandling: boolean;
        };
        performance: {
            responseTime: number;
            memoryUsage: number;
        };
    }>;
    private checkManagerStatus;
    private testBasicOperations;
    private testAdvancedFeatures;
    private testErrorHandling;
}
export declare function createCrossCuttingConcernsValidator(): CrossCuttingConcernsIntegrationValidator;
export declare function quickValidateCrossCuttingConcerns(): Promise<boolean>;
//# sourceMappingURL=cross-cutting-concerns-integration.d.ts.map