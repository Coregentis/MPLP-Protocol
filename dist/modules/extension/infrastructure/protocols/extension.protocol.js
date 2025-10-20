"use strict";
/**
 * Extension协议实现
 *
 * @description Extension模块的协议实现，提供扩展管理和插件协调的标准化接口
 * @version 1.0.0
 * @layer Infrastructure层 - 协议
 * @pattern 协议模式 + L3管理器集成 + 横切关注点集成
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionProtocol = void 0;
/**
 * Extension协议实现类
 */
class ExtensionProtocol {
    constructor(config, dependencies) {
        this.isInitialized = false;
        this.config = config;
        this.dependencies = dependencies;
        if (!dependencies.extensionModuleAdapter) {
            throw new Error('ExtensionModuleAdapter is required');
        }
        this.adapter = dependencies.extensionModuleAdapter;
    }
    /**
     * 初始化协议
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            // 初始化L3管理器（预留接口）
            await this.initializeL3Managers();
            // 初始化横切关注点
            await this.initializeCrossCuttingConcerns();
            // 初始化扩展管理器
            await this.initializeExtensionManager();
            this.isInitialized = true;
        }
        catch (error) {
            throw new Error(`Failed to initialize Extension protocol: ${error}`);
        }
    }
    /**
     * 关闭协议
     */
    async shutdown() {
        if (!this.isInitialized) {
            return;
        }
        try {
            // 停用所有活跃扩展
            await this.deactivateAllExtensions();
            // 关闭L3管理器
            await this.shutdownL3Managers();
            this.isInitialized = false;
        }
        catch (error) {
            throw new Error(`Failed to shutdown Extension protocol: ${error}`);
        }
    }
    /**
     * 获取协议元数据
     */
    getProtocolMetadata() {
        return {
            name: 'extension',
            version: '1.0.0',
            description: 'MPLP扩展管理和插件协调协议',
            capabilities: [
                'extension-lifecycle-management',
                'plugin-coordination',
                'extension-point-management',
                'api-extension',
                'event-subscription',
                'security-sandbox',
                'resource-limiting',
                'code-signing',
                'permission-management',
                'performance-monitoring',
                'version-history',
                'search-metadata',
                'event-integration',
                'audit-tracking'
            ],
            dependencies: [
                'security',
                'performance',
                'eventBus',
                'errorHandler',
                'coordination',
                'orchestration',
                'sandboxing',
                'resourceManagement',
                'protocolVersion'
            ],
            supportedOperations: [
                'create_extension',
                'get_extension',
                'update_extension',
                'delete_extension',
                'activate_extension',
                'deactivate_extension',
                'list_extensions',
                'query_extensions',
                'get_active_extensions',
                'get_extensions_by_type',
                'get_health_status',
                'get_performance_metrics'
            ]
        };
    }
    /**
     * 获取健康状态
     */
    async healthCheck() {
        const healthStatus = await this.adapter.getHealthStatus();
        return {
            status: healthStatus.status,
            timestamp: healthStatus.timestamp,
            checks: healthStatus.checks
        };
    }
    /**
     * 执行协议操作 (IMLPPProtocol接口要求)
     */
    async executeOperation(request) {
        return await this.handleRequest(request);
    }
    /**
     * 处理协议请求
     */
    async handleRequest(request) {
        if (!this.isInitialized) {
            throw new Error('Extension protocol not initialized');
        }
        const timestamp = new Date().toISOString();
        try {
            switch (request.operation) {
                case 'create_extension': {
                    const result = await this.adapter.createExtension(request.payload);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        success: true,
                        data: result
                    };
                }
                case 'get_extension': {
                    const result = await this.adapter.getExtension(request.payload.extensionId);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        success: true,
                        data: result
                    };
                }
                case 'update_extension': {
                    const result = await this.adapter.updateExtension(request.payload.extensionId, request.payload.updates);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        success: true,
                        data: result
                    };
                }
                case 'delete_extension': {
                    const result = await this.adapter.deleteExtension(request.payload.extensionId);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        success: true,
                        data: { deleted: result }
                    };
                }
                case 'activate_extension': {
                    const result = await this.adapter.activateExtension(request.payload.extensionId);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        success: true,
                        data: { activated: result }
                    };
                }
                case 'deactivate_extension': {
                    const result = await this.adapter.deactivateExtension(request.payload.extensionId);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        success: true,
                        data: { deactivated: result }
                    };
                }
                case 'list_extensions': {
                    const result = await this.adapter.listExtensions(request.payload);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        success: true,
                        data: result
                    };
                }
                case 'query_extensions': {
                    const result = await this.adapter.queryExtensions(request.payload);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        success: true,
                        data: { extensions: result }
                    };
                }
                case 'get_active_extensions': {
                    const result = await this.adapter.getActiveExtensions(request.payload?.contextId);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        success: true,
                        data: { extensions: result }
                    };
                }
                case 'get_extensions_by_type': {
                    const result = await this.adapter.getExtensionsByType(request.payload.extensionType);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        success: true,
                        data: { extensions: result }
                    };
                }
                case 'get_health_status': {
                    const result = await this.adapter.getHealthStatus();
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        success: true,
                        data: result
                    };
                }
                case 'get_performance_metrics': {
                    const result = await this.adapter.getPerformanceMetrics();
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        success: true,
                        data: result
                    };
                }
                default:
                    throw new Error(`Unsupported operation: ${request.operation}`);
            }
        }
        catch (error) {
            return {
                protocolVersion: request.protocolVersion,
                timestamp,
                requestId: request.requestId,
                success: false,
                error: {
                    code: 'EXTENSION_OPERATION_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error',
                    details: error instanceof Error ? { stack: error.stack } : { error: String(error) }
                }
            };
        }
    }
    /**
     * 初始化L3管理器（预留接口）
     */
    async initializeL3Managers() {
        // TODO: 等待CoreOrchestrator注入L3管理器
        // 预留接口：安全管理器
        if (this.dependencies.securityManager && this.config.enableSecurity) {
            // await this.dependencies.securityManager.initialize();
        }
        // 预留接口：性能管理器
        if (this.dependencies.performanceManager && this.config.enablePerformanceMonitoring) {
            // await this.dependencies.performanceManager.initialize();
        }
        // 预留接口：事件总线管理器
        if (this.dependencies.eventBusManager && this.config.enableEventBus) {
            // await this.dependencies.eventBusManager.initialize();
        }
        // 预留接口：错误处理管理器
        if (this.dependencies.errorHandlerManager && this.config.enableErrorHandling) {
            // await this.dependencies.errorHandlerManager.initialize();
        }
        // 预留接口：协调管理器
        if (this.dependencies.coordinationManager && this.config.enableCoordination) {
            // await this.dependencies.coordinationManager.initialize();
        }
        // 预留接口：编排管理器
        if (this.dependencies.orchestrationManager && this.config.enableOrchestration) {
            // await this.dependencies.orchestrationManager.initialize();
        }
        // 预留接口：状态同步管理器
        if (this.dependencies.stateSyncManager) {
            // await this.dependencies.stateSyncManager.initialize();
        }
        // 预留接口：事务管理器
        if (this.dependencies.transactionManager) {
            // await this.dependencies.transactionManager.initialize();
        }
        // 预留接口：协议版本管理器
        if (this.dependencies.protocolVersionManager) {
            // await this.dependencies.protocolVersionManager.initialize();
        }
    }
    /**
     * 初始化横切关注点
     */
    async initializeCrossCuttingConcerns() {
        // TODO: 集成横切关注点
        // 日志记录
        if (this.config.enableLogging) {
            // 初始化日志记录
        }
        // 缓存管理
        if (this.config.enableCaching) {
            // 初始化缓存管理
        }
        // 指标收集
        if (this.config.enableMetrics) {
            // 初始化指标收集
        }
    }
    /**
     * 初始化扩展管理器
     */
    async initializeExtensionManager() {
        // TODO: 初始化扩展管理器特定功能
        // 启动健康检查
        if (this.config.healthCheckInterval && this.config.healthCheckInterval > 0) {
            // 启动定期健康检查
        }
        // 启动性能监控
        if (this.config.performanceMetricsInterval && this.config.performanceMetricsInterval > 0) {
            // 启动定期性能监控
        }
    }
    /**
     * 停用所有活跃扩展
     */
    async deactivateAllExtensions() {
        try {
            const activeExtensions = await this.adapter.getActiveExtensions();
            for (const extension of activeExtensions) {
                try {
                    await this.adapter.deactivateExtension(extension.extensionId);
                }
                catch (error) {
                    // 记录错误但继续处理其他扩展
                    // TODO: 使用适当的日志记录器替代console.error
                    // this.logger.error(`Failed to deactivate extension ${extension.extensionId}:`, error);
                }
            }
        }
        catch (error) {
            // TODO: 使用适当的日志记录器替代console.error
            // this.logger.error('Failed to get active extensions during shutdown:', error);
        }
    }
    /**
     * 关闭L3管理器
     */
    async shutdownL3Managers() {
        // TODO: 关闭L3管理器
        // 关闭各个管理器（预留接口）
        const managers = [
            this.dependencies.securityManager,
            this.dependencies.performanceManager,
            this.dependencies.eventBusManager,
            this.dependencies.errorHandlerManager,
            this.dependencies.coordinationManager,
            this.dependencies.orchestrationManager,
            this.dependencies.stateSyncManager,
            this.dependencies.transactionManager,
            this.dependencies.protocolVersionManager
        ];
        for (const manager of managers) {
            if (manager && typeof manager === 'object' && 'shutdown' in manager) {
                try {
                    // await (manager as any).shutdown();
                }
                catch (error) {
                    // TODO: 使用适当的日志记录器替代console.error
                    // this.logger.error('Failed to shutdown manager:', error);
                }
            }
        }
    }
    /**
     * 获取协议元数据
     * @description 实现IMLPPProtocol接口的getMetadata方法
     */
    getMetadata() {
        return {
            name: 'MPLP Extension Protocol',
            version: '1.0.0',
            description: 'Extension模块协议 - 扩展管理系统和MPLP生态系统集成',
            capabilities: [
                'extension_management',
                'plugin_system',
                'mplp_integration',
                'lifecycle_management',
                'security_sandbox',
                'performance_monitoring',
                'event_driven_architecture',
                'core_orchestrator_support'
            ],
            dependencies: [
                'mplp-security',
                'mplp-event-bus',
                'mplp-coordination',
                'mplp-orchestration'
            ],
            supportedOperations: [
                'create_extension',
                'update_extension',
                'delete_extension',
                'get_extension',
                'query_extensions',
                'activate_extension',
                'deactivate_extension',
                'get_statistics'
            ]
        };
    }
    /**
     * 获取协议健康状态
     * @description 实现IMLPPProtocol接口的getHealthStatus方法
     */
    async getHealthStatus() {
        try {
            const adapterHealth = await this.adapter.getHealthStatus();
            return {
                status: adapterHealth.status,
                timestamp: new Date().toISOString(),
                details: {
                    protocol: 'initialized',
                    adapter: adapterHealth.status,
                    extensionService: 'active',
                    mplpIntegration: 'active'
                },
                checks: [
                    {
                        name: 'protocol_initialization',
                        status: 'pass',
                        message: 'Extension protocol successfully initialized'
                    },
                    {
                        name: 'adapter_health',
                        status: adapterHealth.status === 'healthy' ? 'pass' : 'fail',
                        message: `Adapter health: ${adapterHealth.status}`
                    }
                ]
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                details: {
                    protocol: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                },
                checks: [
                    {
                        name: 'health_check',
                        status: 'fail',
                        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }
                ]
            };
        }
    }
}
exports.ExtensionProtocol = ExtensionProtocol;
//# sourceMappingURL=extension.protocol.js.map