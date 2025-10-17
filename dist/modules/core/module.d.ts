import { CoreModuleAdapter } from './infrastructure/adapters/core-module.adapter';
import { CoreController } from './api/controllers/core.controller';
import { CoreManagementService } from './application/services/core-management.service';
import { CoreMonitoringService } from './application/services/core-monitoring.service';
import { CoreOrchestrationService } from './application/services/core-orchestration.service';
import { CoreResourceService } from './application/services/core-resource.service';
import { CoreReservedInterfacesService } from './application/services/core-reserved-interfaces.service';
import { CoreServicesCoordinator } from './application/coordinators/core-services-coordinator';
import { MemoryCoreRepository } from './infrastructure/repositories/core.repository';
import { CoreProtocol } from './infrastructure/protocols/core.protocol';
export interface CoreModuleOptions {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    dataSource?: unknown;
    maxCacheSize?: number;
    cacheTimeout?: number;
    enableCoordination?: boolean;
    enableReservedInterfaces?: boolean;
}
export interface CoreModuleResult {
    coreController: CoreController;
    managementService: CoreManagementService;
    monitoringService: CoreMonitoringService;
    orchestrationService: CoreOrchestrationService;
    resourceService: CoreResourceService;
    reservedInterfacesService?: CoreReservedInterfacesService;
    coordinator?: CoreServicesCoordinator;
    repository: MemoryCoreRepository;
    protocol: CoreProtocol;
    moduleAdapter: CoreModuleAdapter;
    healthCheck: () => Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        components: Record<string, boolean>;
        timestamp: string;
    }>;
    shutdown: () => Promise<void>;
    getStatistics: () => Promise<{
        totalWorkflows: number;
        activeWorkflows: number;
        completedWorkflows: number;
        failedWorkflows: number;
        averageDuration: number;
        resourceUtilization: number;
    }>;
    getModuleInfo: () => {
        name: string;
        version: string;
        description: string;
        layer: string;
        status: string;
        features: string[];
        dependencies: string[];
    };
}
export declare function initializeCoreModule(options?: CoreModuleOptions): Promise<CoreModuleResult>;
export declare function createCoreModuleConfig(preset: 'development' | 'production' | 'testing'): CoreModuleOptions;
export declare function validateCoreModuleConfig(options: CoreModuleOptions): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};
export declare const DEFAULT_CORE_MODULE_CONFIG: CoreModuleOptions;
export declare function quickInitializeCoreModule(): Promise<CoreModuleResult>;
export declare function initializeCoreModuleForDevelopment(): Promise<CoreModuleResult>;
export declare function initializeCoreModuleForProduction(dataSource?: unknown): Promise<CoreModuleResult>;
export declare function initializeCoreModuleForTesting(): Promise<CoreModuleResult>;
//# sourceMappingURL=module.d.ts.map