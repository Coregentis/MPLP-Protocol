/**
 * Context模块初始化
 *
 * @description Context模块的统一初始化和配置管理
 * @version 1.0.0
 * @layer 模块层 - 初始化
 */
import { ContextModuleAdapter } from './infrastructure/adapters/context-module.adapter';
import { ContextController } from './api/controllers/context.controller';
import { ContextManagementService } from './application/services/context-management.service';
import { MemoryContextRepository } from './infrastructure/repositories/context.repository';
/**
 * Context模块选项
 */
export interface ContextModuleOptions {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    dataSource?: unknown;
    maxCacheSize?: number;
    cacheTimeout?: number;
}
/**
 * Context模块结果
 */
export interface ContextModuleResult {
    contextController: ContextController;
    contextManagementService: ContextManagementService;
    contextRepository: MemoryContextRepository;
    contextModuleAdapter: ContextModuleAdapter;
    healthCheck: () => Promise<boolean>;
    shutdown: () => Promise<void>;
    getStatistics: () => Promise<Record<string, unknown>>;
}
/**
 * 初始化Context模块
 *
 * @description 创建和配置Context模块的所有组件
 * @param options - 模块配置选项
 * @returns Promise<ContextModuleResult> - 初始化结果
 */
export declare function initializeContextModule(options?: ContextModuleOptions): Promise<ContextModuleResult>;
/**
 * 创建Context模块的快速配置
 *
 * @description 提供常用配置的快速创建方法
 */
export declare const ContextModulePresets: {
    /**
     * 开发环境配置
     */
    development: () => ContextModuleOptions;
    /**
     * 测试环境配置
     */
    testing: () => ContextModuleOptions;
    /**
     * 生产环境配置
     */
    production: () => ContextModuleOptions;
    /**
     * 高性能配置
     */
    highPerformance: () => ContextModuleOptions;
};
/**
 * Context模块工厂
 *
 * @description 提供不同环境的Context模块创建方法
 */
export declare class ContextModuleFactory {
    /**
     * 创建开发环境的Context模块
     */
    static createForDevelopment(): Promise<ContextModuleResult>;
    /**
     * 创建测试环境的Context模块
     */
    static createForTesting(): Promise<ContextModuleResult>;
    /**
     * 创建生产环境的Context模块
     */
    static createForProduction(): Promise<ContextModuleResult>;
    /**
     * 创建高性能的Context模块
     */
    static createForHighPerformance(): Promise<ContextModuleResult>;
    /**
     * 创建自定义配置的Context模块
     */
    static createWithCustomConfig(options: ContextModuleOptions): Promise<ContextModuleResult>;
}
/**
 * 默认导出：初始化函数
 */
export default initializeContextModule;
/**
 * Context模块版本信息
 */
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