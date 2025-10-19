/**
 * CoreOrchestrator统一入口
 *
 * @description 提供CoreOrchestrator的统一初始化、配置和管理接口
 * @version 1.0.0
 * @layer 模块层 - 统一入口
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的统一入口模式
 */
import { CoreOrchestratorFactoryConfig } from './infrastructure/factories/core-orchestrator.factory';
import { CoreOrchestrator } from '../../core/orchestrator/core.orchestrator';
import { ReservedInterfaceActivator } from './domain/activators/reserved-interface.activator';
/**
 * CoreOrchestrator初始化选项
 */
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
/**
 * CoreOrchestrator初始化结果
 */
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
/**
 * 初始化CoreOrchestrator
 *
 * @description 创建并配置CoreOrchestrator实例，返回统一的访问接口
 */
export declare function initializeCoreOrchestrator(options?: CoreOrchestratorOptions): Promise<CoreOrchestratorResult>;
/**
 * 快速初始化CoreOrchestrator（使用默认配置）
 */
export declare function quickInitializeCoreOrchestrator(): Promise<CoreOrchestratorResult>;
/**
 * 初始化生产环境CoreOrchestrator
 */
export declare function initializeProductionCoreOrchestrator(): Promise<CoreOrchestratorResult>;
/**
 * 初始化测试环境CoreOrchestrator
 */
export declare function initializeTestCoreOrchestrator(): Promise<CoreOrchestratorResult>;
/**
 * 创建CoreOrchestrator配置预设
 */
export declare function createCoreOrchestratorConfig(preset: 'minimal' | 'standard' | 'enterprise'): CoreOrchestratorOptions;
/**
 * 验证CoreOrchestrator配置
 */
export declare function validateCoreOrchestratorConfig(options: CoreOrchestratorOptions): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};
/**
 * CoreOrchestrator默认配置
 */
export declare const DEFAULT_CORE_ORCHESTRATOR_CONFIG: CoreOrchestratorOptions;
export * from '../../core/orchestrator/core.orchestrator';
export * from './domain/activators/reserved-interface.activator';
export * from './infrastructure/factories/core-orchestrator.factory';
//# sourceMappingURL=orchestrator.d.ts.map