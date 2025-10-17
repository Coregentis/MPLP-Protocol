import { CoreOrchestratorFactoryConfig } from './infrastructure/factories/core-orchestrator.factory';
import { CoreOrchestrator } from '../../core/orchestrator/core.orchestrator';
import { ReservedInterfaceActivator } from './domain/activators/reserved-interface.activator';
export interface CoreOrchestratorOptions {
    environment?: 'development' | 'production' | 'testing';
    enableLogging?: boolean;
    enableMetrics?: boolean;
    enableCaching?: boolean;
    maxConcurrentWorkflows?: number;
    workflowTimeout?: number;
    enableReservedInterfaces?: boolean;
    enableModuleCoordination?: boolean;
    customConfig?: CoreOrchestratorFactoryConfig;
}
export interface CoreOrchestratorResult {
    orchestrator: CoreOrchestrator;
    interfaceActivator: ReservedInterfaceActivator;
    healthCheck: () => Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        components: Record<string, boolean>;
        metrics: Record<string, number>;
    }>;
    shutdown: () => Promise<void>;
    getStatistics: () => Promise<{
        activeWorkflows: number;
        completedWorkflows: number;
        failedWorkflows: number;
        averageExecutionTime: number;
        resourceUtilization: number;
        moduleCoordinationCount: number;
        interfaceActivationCount: number;
    }>;
    getModuleInfo: () => {
        name: string;
        version: string;
        description: string;
        layer: string;
        status: string;
        capabilities: string[];
        supportedModules: string[];
    };
}
export declare function initializeCoreOrchestrator(options?: CoreOrchestratorOptions): Promise<CoreOrchestratorResult>;
export declare function quickInitializeCoreOrchestrator(): Promise<CoreOrchestratorResult>;
export declare function initializeProductionCoreOrchestrator(): Promise<CoreOrchestratorResult>;
export declare function initializeTestCoreOrchestrator(): Promise<CoreOrchestratorResult>;
export declare function createCoreOrchestratorConfig(preset: 'minimal' | 'standard' | 'enterprise'): CoreOrchestratorOptions;
export declare function validateCoreOrchestratorConfig(options: CoreOrchestratorOptions): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};
export declare const DEFAULT_CORE_ORCHESTRATOR_CONFIG: CoreOrchestratorOptions;
export * from '../../core/orchestrator/core.orchestrator';
export * from './domain/activators/reserved-interface.activator';
export * from './infrastructure/factories/core-orchestrator.factory';
//# sourceMappingURL=orchestrator.d.ts.map