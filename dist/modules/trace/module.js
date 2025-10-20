"use strict";
/**
 * Trace模块初始化
 *
 * @description Trace模块的统一初始化和配置管理，严格遵循MPLP v1.0协议标准
 * @version 1.0.0
 * @layer 模块层 - 初始化
 * @pattern 基于Context模块的IDENTICAL企业级模式
 * @schema 基于src/schemas/core-modules/mplp-trace.json
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTraceModule = void 0;
exports.initializeTraceModule = initializeTraceModule;
const tslib_1 = require("tslib");
const trace_module_adapter_1 = require("./infrastructure/adapters/trace-module.adapter");
const trace_controller_1 = require("./api/controllers/trace.controller");
const trace_management_service_1 = require("./application/services/trace-management.service");
const trace_analytics_service_1 = require("./application/services/trace-analytics.service");
const trace_security_service_1 = require("./application/services/trace-security.service");
const trace_repository_1 = require("./infrastructure/repositories/trace.repository");
/**
 * 初始化Trace模块
 *
 * @description 创建和配置Trace模块的所有组件，遵循MPLP v1.0协议标准
 * @param options - 模块配置选项
 * @returns Promise<TraceModuleResult> - 初始化结果
 */
async function initializeTraceModule(options = {}) {
    try {
        // 1. 设置默认配置
        const config = {
            enableLogging: options.enableLogging ?? true,
            enableCaching: options.enableCaching ?? true,
            enableMetrics: options.enableMetrics ?? true,
            repositoryType: options.repositoryType ?? 'memory',
            maxCacheSize: options.maxCacheSize ?? 1000,
            cacheTimeout: options.cacheTimeout ?? 300000, // 5分钟
            traceRetentionDays: options.traceRetentionDays ?? 30,
            samplingRate: options.samplingRate ?? 1.0,
            enablePerformanceMonitoring: options.enablePerformanceMonitoring ?? true,
            enableErrorTracking: options.enableErrorTracking ?? true,
            enableDecisionLogging: options.enableDecisionLogging ?? true,
            dataSource: options.dataSource
        };
        // 2. 初始化Repository层
        const traceRepository = new trace_repository_1.TraceRepository();
        // 3. 初始化Application Service层
        const traceManagementService = new trace_management_service_1.TraceManagementService(traceRepository);
        const traceAnalyticsService = new trace_analytics_service_1.TraceAnalyticsService(traceRepository);
        const traceSecurityService = new trace_security_service_1.TraceSecurityService(traceRepository);
        // 4. 初始化API Controller层
        const traceController = new trace_controller_1.TraceController(traceManagementService);
        // 5. 初始化Module Adapter
        const adapterConfig = {
            enableLogging: config.enableLogging,
            enableCaching: config.enableCaching,
            enableMetrics: config.enableMetrics,
            maxTraceRetentionDays: config.traceRetentionDays,
            enableRealTimeMonitoring: config.enablePerformanceMonitoring,
            enableCorrelationAnalysis: config.enableErrorTracking,
            enableDistributedTracing: config.enableDecisionLogging
        };
        const traceModuleAdapter = new trace_module_adapter_1.TraceModuleAdapter(adapterConfig);
        // 6. 健康检查函数
        const healthCheck = async () => {
            try {
                const health = await traceManagementService.getHealthStatus();
                return health.status === 'healthy';
            }
            catch (error) {
                // TODO: 使用标准日志系统替代console
                return false;
            }
        };
        // 7. 关闭函数
        const shutdown = async () => {
            // 清理资源
            // await traceModuleAdapter.shutdown(); // TODO: 实现shutdown方法
            // TODO: 使用标准日志系统记录关闭完成
        };
        // 8. 统计信息函数
        const getStatistics = async () => {
            try {
                const traceCount = await traceManagementService.getTraceCount();
                const health = await traceManagementService.getHealthStatus();
                return {
                    totalTraces: traceCount,
                    healthStatus: health.status,
                    moduleVersion: '1.0.0',
                    protocolVersion: '1.0.0',
                    configuration: {
                        enableLogging: config.enableLogging,
                        enableCaching: config.enableCaching,
                        enableMetrics: config.enableMetrics,
                        repositoryType: config.repositoryType,
                        traceRetentionDays: config.traceRetentionDays,
                        samplingRate: config.samplingRate
                    },
                    timestamp: new Date().toISOString()
                };
            }
            catch (error) {
                // TODO: 使用标准日志系统记录统计获取失败
                return {
                    error: 'Failed to retrieve statistics',
                    timestamp: new Date().toISOString()
                };
            }
        };
        // 9. 追踪指标函数
        const getTraceMetrics = async () => {
            try {
                const totalTraces = await traceManagementService.getTraceCount();
                const errorTraces = await traceManagementService.getTraceCount({ hasErrors: true });
                const decisionTraces = await traceManagementService.getTraceCount({ hasDecisions: true });
                return {
                    totalTraces,
                    errorTraces,
                    decisionTraces,
                    errorRate: totalTraces > 0 ? (errorTraces / totalTraces) * 100 : 0,
                    decisionRate: totalTraces > 0 ? (decisionTraces / totalTraces) * 100 : 0,
                    samplingRate: config.samplingRate,
                    retentionDays: config.traceRetentionDays,
                    timestamp: new Date().toISOString()
                };
            }
            catch (error) {
                // TODO: 使用标准日志系统记录指标获取失败
                return {
                    error: 'Failed to retrieve metrics',
                    timestamp: new Date().toISOString()
                };
            }
        };
        // 10. 返回模块结果
        const result = {
            traceController,
            traceManagementService,
            traceAnalyticsService,
            traceSecurityService,
            traceRepository,
            traceModuleAdapter,
            healthCheck,
            shutdown,
            getStatistics,
            getTraceMetrics
        };
        // TODO: 使用标准日志系统记录初始化成功
        return result;
    }
    catch (error) {
        // TODO: 使用标准日志系统记录初始化失败
        throw new Error(`Trace module initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * 默认Trace模块实例
 *
 * @description 提供默认配置的Trace模块实例，用于快速启动
 */
exports.defaultTraceModule = {
    /**
     * 使用默认配置初始化Trace模块
     */
    initialize: () => initializeTraceModule(),
    /**
     * 使用生产环境配置初始化Trace模块
     */
    initializeForProduction: () => initializeTraceModule({
        enableLogging: true,
        enableCaching: true,
        enableMetrics: true,
        repositoryType: 'database',
        traceRetentionDays: 90,
        samplingRate: 0.1, // 10%采样率
        enablePerformanceMonitoring: true,
        enableErrorTracking: true,
        enableDecisionLogging: true
    }),
    /**
     * 使用开发环境配置初始化Trace模块
     */
    initializeForDevelopment: () => initializeTraceModule({
        enableLogging: true,
        enableCaching: false,
        enableMetrics: true,
        repositoryType: 'memory',
        traceRetentionDays: 7,
        samplingRate: 1.0, // 100%采样率
        enablePerformanceMonitoring: true,
        enableErrorTracking: true,
        enableDecisionLogging: true
    }),
    /**
     * 使用测试环境配置初始化Trace模块
     */
    initializeForTesting: () => initializeTraceModule({
        enableLogging: false,
        enableCaching: false,
        enableMetrics: false,
        repositoryType: 'memory',
        traceRetentionDays: 1,
        samplingRate: 1.0,
        enablePerformanceMonitoring: false,
        enableErrorTracking: true,
        enableDecisionLogging: true
    })
};
// 导出类型和接口
tslib_1.__exportStar(require("./types"), exports);
tslib_1.__exportStar(require("./api/dto/trace.dto"), exports);
tslib_1.__exportStar(require("./api/controllers/trace.controller"), exports);
tslib_1.__exportStar(require("./application/services/trace-management.service"), exports);
tslib_1.__exportStar(require("./application/services/trace-analytics.service"), exports);
tslib_1.__exportStar(require("./application/services/trace-security.service"), exports);
tslib_1.__exportStar(require("./infrastructure/repositories/trace.repository"), exports);
tslib_1.__exportStar(require("./infrastructure/adapters/trace-module.adapter"), exports);
//# sourceMappingURL=module.js.map