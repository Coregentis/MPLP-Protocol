/**
 * Core模块初始化
 *
 * @description 基于Context、Plan、Role、Confirm等模块的企业级标准，提供Core模块的统一初始化和配置管理
 * @version 1.0.0
 * @layer 模块层 - 初始化
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的模块初始化模式
 */
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
/**
 * Core模块选项
 */
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
/**
 * Core模块初始化结果
 */
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
/**
 * 初始化Core模块
 *
 * @description 创建并配置Core模块的所有组件，返回统一的访问接口
 */
export declare function initializeCoreModule(options?: CoreModuleOptions): Promise<CoreModuleResult>;
/**
 * 创建Core模块的快速配置
 */
export declare function createCoreModuleConfig(preset: 'development' | 'production' | 'testing'): CoreModuleOptions;
/**
 * 验证Core模块配置
 */
export declare function validateCoreModuleConfig(options: CoreModuleOptions): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * Core模块默认配置
 */
export declare const DEFAULT_CORE_MODULE_CONFIG: CoreModuleOptions;
/**
 * 使用默认配置快速初始化Core模块
 */
export declare function quickInitializeCoreModule(): Promise<CoreModuleResult>;
/**
 * 使用开发配置初始化Core模块
 */
export declare function initializeCoreModuleForDevelopment(): Promise<CoreModuleResult>;
/**
 * 使用生产配置初始化Core模块
 */
export declare function initializeCoreModuleForProduction(dataSource?: unknown): Promise<CoreModuleResult>;
/**
 * 使用测试配置初始化Core模块
 */
export declare function initializeCoreModuleForTesting(): Promise<CoreModuleResult>;
//# sourceMappingURL=module.d.ts.map