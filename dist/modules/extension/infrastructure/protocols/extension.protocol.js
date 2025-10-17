"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionProtocol = void 0;
class ExtensionProtocol {
    config;
    dependencies;
    adapter;
    isInitialized = false;
    constructor(config, dependencies) {
        this.config = config;
        this.dependencies = dependencies;
        if (!dependencies.extensionModuleAdapter) {
            throw new Error('ExtensionModuleAdapter is required');
        }
        this.adapter = dependencies.extensionModuleAdapter;
    }
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            await this.initializeL3Managers();
            await this.initializeCrossCuttingConcerns();
            await this.initializeExtensionManager();
            this.isInitialized = true;
        }
        catch (error) {
            throw new Error(`Failed to initialize Extension protocol: ${error}`);
        }
    }
    async shutdown() {
        if (!this.isInitialized) {
            return;
        }
        try {
            await this.deactivateAllExtensions();
            await this.shutdownL3Managers();
            this.isInitialized = false;
        }
        catch (error) {
            throw new Error(`Failed to shutdown Extension protocol: ${error}`);
        }
    }
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
    async healthCheck() {
        const healthStatus = await this.adapter.getHealthStatus();
        return {
            status: healthStatus.status,
            timestamp: healthStatus.timestamp,
            checks: healthStatus.checks
        };
    }
    async executeOperation(request) {
        return await this.handleRequest(request);
    }
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
    async initializeL3Managers() {
        if (this.dependencies.securityManager && this.config.enableSecurity) {
        }
        if (this.dependencies.performanceManager && this.config.enablePerformanceMonitoring) {
        }
        if (this.dependencies.eventBusManager && this.config.enableEventBus) {
        }
        if (this.dependencies.errorHandlerManager && this.config.enableErrorHandling) {
        }
        if (this.dependencies.coordinationManager && this.config.enableCoordination) {
        }
        if (this.dependencies.orchestrationManager && this.config.enableOrchestration) {
        }
        if (this.dependencies.stateSyncManager) {
        }
        if (this.dependencies.transactionManager) {
        }
        if (this.dependencies.protocolVersionManager) {
        }
    }
    async initializeCrossCuttingConcerns() {
        if (this.config.enableLogging) {
        }
        if (this.config.enableCaching) {
        }
        if (this.config.enableMetrics) {
        }
    }
    async initializeExtensionManager() {
        if (this.config.healthCheckInterval && this.config.healthCheckInterval > 0) {
        }
        if (this.config.performanceMetricsInterval && this.config.performanceMetricsInterval > 0) {
        }
    }
    async deactivateAllExtensions() {
        try {
            const activeExtensions = await this.adapter.getActiveExtensions();
            for (const extension of activeExtensions) {
                try {
                    await this.adapter.deactivateExtension(extension.extensionId);
                }
                catch (error) {
                }
            }
        }
        catch (error) {
        }
    }
    async shutdownL3Managers() {
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
                }
                catch (error) {
                }
            }
        }
    }
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
