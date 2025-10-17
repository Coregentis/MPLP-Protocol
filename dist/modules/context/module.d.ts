import { ContextModuleAdapter } from './infrastructure/adapters/context-module.adapter';
import { ContextController } from './api/controllers/context.controller';
import { ContextManagementService } from './application/services/context-management.service';
import { MemoryContextRepository } from './infrastructure/repositories/context.repository';
export interface ContextModuleOptions {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    dataSource?: unknown;
    maxCacheSize?: number;
    cacheTimeout?: number;
}
export interface ContextModuleResult {
    contextController: ContextController;
    contextManagementService: ContextManagementService;
    contextRepository: MemoryContextRepository;
    contextModuleAdapter: ContextModuleAdapter;
    healthCheck: () => Promise<boolean>;
    shutdown: () => Promise<void>;
    getStatistics: () => Promise<Record<string, unknown>>;
}
export declare function initializeContextModule(options?: ContextModuleOptions): Promise<ContextModuleResult>;
export declare const ContextModulePresets: {
    development: () => ContextModuleOptions;
    testing: () => ContextModuleOptions;
    production: () => ContextModuleOptions;
    highPerformance: () => ContextModuleOptions;
};
export declare class ContextModuleFactory {
    static createForDevelopment(): Promise<ContextModuleResult>;
    static createForTesting(): Promise<ContextModuleResult>;
    static createForProduction(): Promise<ContextModuleResult>;
    static createForHighPerformance(): Promise<ContextModuleResult>;
    static createWithCustomConfig(options: ContextModuleOptions): Promise<ContextModuleResult>;
}
export default initializeContextModule;
export declare const ContextModuleInfo: {
    name: string;
    version: string;
    description: string;
    author: string;
    license: string;
    dependencies: {
        typescript: string;
    };
    features: string[];
    architecture: {
        layer: string;
        pattern: string;
        concerns: string[];
    };
};
//# sourceMappingURL=module.d.ts.map