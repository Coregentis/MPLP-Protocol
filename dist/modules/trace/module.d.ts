/**
 * Trace模块初始化
 *
 * @description Trace模块的统一初始化和配置管理，严格遵循MPLP v1.0协议标准
 * @version 1.0.0
 * @layer 模块层 - 初始化
 * @pattern 基于Context模块的IDENTICAL企业级模式
 * @schema 基于src/schemas/core-modules/mplp-trace.json
 */
import { TraceModuleAdapter } from './infrastructure/adapters/trace-module.adapter';
import { TraceController } from './api/controllers/trace.controller';
import { TraceManagementService } from './application/services/trace-management.service';
import { TraceAnalyticsService } from './application/services/trace-analytics.service';
import { TraceSecurityService } from './application/services/trace-security.service';
import { TraceRepository } from './infrastructure/repositories/trace.repository';
/**
 * Trace模块选项
 */
export interface TraceModuleOptions {
    enableLogging?: boolean;
    enableCaching?: boolean;
    enableMetrics?: boolean;
    repositoryType?: 'memory' | 'database' | 'file';
    dataSource?: unknown;
    maxCacheSize?: number;
    cacheTimeout?: number;
    traceRetentionDays?: number;
    samplingRate?: number;
    enablePerformanceMonitoring?: boolean;
    enableErrorTracking?: boolean;
    enableDecisionLogging?: boolean;
}
/**
 * Trace模块结果
 */
export interface TraceModuleResult {
    traceController: TraceController;
    traceManagementService: TraceManagementService;
    traceAnalyticsService: TraceAnalyticsService;
    traceSecurityService: TraceSecurityService;
    traceRepository: TraceRepository;
    traceModuleAdapter: TraceModuleAdapter;
    healthCheck: () => Promise<boolean>;
    shutdown: () => Promise<void>;
    getStatistics: () => Promise<Record<string, unknown>>;
    getTraceMetrics: () => Promise<Record<string, unknown>>;
}
/**
 * 初始化Trace模块
 *
 * @description 创建和配置Trace模块的所有组件，遵循MPLP v1.0协议标准
 * @param options - 模块配置选项
 * @returns Promise<TraceModuleResult> - 初始化结果
 */
export declare function initializeTraceModule(options?: TraceModuleOptions): Promise<TraceModuleResult>;
/**
 * 默认Trace模块实例
 *
 * @description 提供默认配置的Trace模块实例，用于快速启动
 */
export declare const defaultTraceModule: {
    /**
     * 使用默认配置初始化Trace模块
     */
    initialize: () => Promise<TraceModuleResult>;
    /**
     * 使用生产环境配置初始化Trace模块
     */
    initializeForProduction: () => Promise<TraceModuleResult>;
    /**
     * 使用开发环境配置初始化Trace模块
     */
    initializeForDevelopment: () => Promise<TraceModuleResult>;
    /**
     * 使用测试环境配置初始化Trace模块
     */
    initializeForTesting: () => Promise<TraceModuleResult>;
};
export * from './types';
export * from './api/dto/trace.dto';
export * from './api/controllers/trace.controller';
export * from './application/services/trace-management.service';
export * from './application/services/trace-analytics.service';
export * from './application/services/trace-security.service';
export * from './infrastructure/repositories/trace.repository';
export * from './infrastructure/adapters/trace-module.adapter';
//# sourceMappingURL=module.d.ts.map