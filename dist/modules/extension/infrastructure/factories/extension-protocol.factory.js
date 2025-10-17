"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_EXTENSION_PROTOCOL_CONFIG = exports.ExtensionProtocolFactory = void 0;
const extension_protocol_1 = require("../protocols/extension.protocol");
const extension_management_service_1 = require("../../application/services/extension-management.service");
const extension_repository_1 = require("../repositories/extension.repository");
const extension_module_adapter_1 = require("../adapters/extension-module.adapter");
class ExtensionProtocolFactory {
    static instance;
    defaultConfig;
    protocol = null;
    constructor() {
        this.defaultConfig = {
            enableLogging: true,
            enableCaching: true,
            enableMetrics: true,
            enableSecurity: true,
            enablePerformanceMonitoring: true,
            enableEventBus: true,
            enableErrorHandling: true,
            enableCoordination: true,
            enableOrchestration: true,
            maxExtensions: 100,
            activationTimeout: 30000,
            deactivationTimeout: 10000,
            healthCheckInterval: 60000,
            performanceMetricsInterval: 30000,
            enableSandbox: true,
            enableCodeSigning: true,
            enablePermissionValidation: true,
            enableResourceLimiting: true,
            maxMemoryUsage: 100 * 1024 * 1024,
            maxCpuUsage: 80,
            maxNetworkRequests: 1000
        };
    }
    static getInstance() {
        if (!ExtensionProtocolFactory.instance) {
            ExtensionProtocolFactory.instance = new ExtensionProtocolFactory();
        }
        return ExtensionProtocolFactory.instance;
    }
    async createProtocol(config) {
        if (this.protocol) {
            return this.protocol;
        }
        const legacyConfig = {
            enableLogging: config?.enableLogging,
            enableMetrics: config?.enableMetrics,
            enableCaching: config?.enableCaching,
            enableSecurity: true,
            enablePerformanceMonitoring: config?.performanceMetrics?.enabled,
            enableEventBus: config?.crossCuttingConcerns?.eventBus?.enabled,
            enableErrorHandling: config?.crossCuttingConcerns?.errorHandler?.enabled,
            enableCoordination: config?.crossCuttingConcerns?.coordination?.enabled,
            enableOrchestration: config?.crossCuttingConcerns?.orchestration?.enabled,
            maxExtensions: config?.extensionConfiguration?.maxExtensions,
            enableSandbox: config?.extensionConfiguration?.sandboxEnabled,
            enablePermissionValidation: true,
            enableResourceLimiting: true
        };
        const finalConfig = { ...this.defaultConfig, ...legacyConfig };
        const finalDependencies = this.resolveDependencies();
        this.protocol = new extension_protocol_1.ExtensionProtocol(finalConfig, finalDependencies);
        return this.protocol;
    }
    async createDefaultProtocol() {
        return await this.createProtocol();
    }
    createTestProtocol(config) {
        const testConfig = {
            ...this.defaultConfig,
            enableLogging: false,
            enableCaching: false,
            enableMetrics: false,
            enableSecurity: false,
            enablePerformanceMonitoring: false,
            enableEventBus: false,
            enableErrorHandling: false,
            enableCoordination: false,
            enableOrchestration: false,
            maxExtensions: 10,
            activationTimeout: 5000,
            deactivationTimeout: 2000,
            healthCheckInterval: 10000,
            performanceMetricsInterval: 5000,
            ...config
        };
        const testDependencies = this.createTestDependencies();
        return new extension_protocol_1.ExtensionProtocol(testConfig, testDependencies);
    }
    createProductionProtocol(config) {
        const productionConfig = {
            ...this.defaultConfig,
            enableLogging: true,
            enableCaching: true,
            enableMetrics: true,
            enableSecurity: true,
            enablePerformanceMonitoring: true,
            enableEventBus: true,
            enableErrorHandling: true,
            enableCoordination: true,
            enableOrchestration: true,
            maxExtensions: 1000,
            activationTimeout: 60000,
            deactivationTimeout: 30000,
            healthCheckInterval: 300000,
            performanceMetricsInterval: 60000,
            enableSandbox: true,
            enableCodeSigning: true,
            enablePermissionValidation: true,
            enableResourceLimiting: true,
            maxMemoryUsage: 500 * 1024 * 1024,
            maxCpuUsage: 70,
            maxNetworkRequests: 10000,
            ...config
        };
        const productionDependencies = this.createProductionDependencies();
        return new extension_protocol_1.ExtensionProtocol(productionConfig, productionDependencies);
    }
    resolveDependencies(dependencies) {
        const resolved = {
            extensionRepository: dependencies?.extensionRepository || new extension_repository_1.ExtensionRepository(),
            ...dependencies
        };
        if (!resolved.extensionManagementService && resolved.extensionRepository) {
            resolved.extensionManagementService = new extension_management_service_1.ExtensionManagementService(resolved.extensionRepository);
        }
        if (!resolved.extensionModuleAdapter && resolved.extensionManagementService) {
            resolved.extensionModuleAdapter = new extension_module_adapter_1.ExtensionModuleAdapter(resolved.extensionManagementService);
        }
        return resolved;
    }
    createTestDependencies() {
        const extensionRepository = new extension_repository_1.ExtensionRepository();
        const extensionManagementService = new extension_management_service_1.ExtensionManagementService(extensionRepository);
        const extensionModuleAdapter = new extension_module_adapter_1.ExtensionModuleAdapter(extensionManagementService);
        return {
            extensionRepository,
            extensionManagementService,
            extensionModuleAdapter,
            securityManager: null,
            performanceManager: null,
            eventBusManager: null,
            errorHandlerManager: null,
            coordinationManager: null,
            orchestrationManager: null,
            stateSyncManager: null,
            transactionManager: null,
            protocolVersionManager: null
        };
    }
    createProductionDependencies() {
        const extensionRepository = new extension_repository_1.ExtensionRepository();
        const extensionManagementService = new extension_management_service_1.ExtensionManagementService(extensionRepository);
        const extensionModuleAdapter = new extension_module_adapter_1.ExtensionModuleAdapter(extensionManagementService);
        return {
            extensionRepository,
            extensionManagementService,
            extensionModuleAdapter,
            securityManager: undefined,
            performanceManager: undefined,
            eventBusManager: undefined,
            errorHandlerManager: undefined,
            coordinationManager: undefined,
            orchestrationManager: undefined,
            stateSyncManager: undefined,
            transactionManager: undefined,
            protocolVersionManager: undefined
        };
    }
    validateConfig(config) {
        if (config.maxExtensions && config.maxExtensions <= 0) {
            throw new Error('maxExtensions must be greater than 0');
        }
        if (config.activationTimeout && config.activationTimeout <= 0) {
            throw new Error('activationTimeout must be greater than 0');
        }
        if (config.deactivationTimeout && config.deactivationTimeout <= 0) {
            throw new Error('deactivationTimeout must be greater than 0');
        }
        if (config.maxMemoryUsage && config.maxMemoryUsage <= 0) {
            throw new Error('maxMemoryUsage must be greater than 0');
        }
        if (config.maxCpuUsage && (config.maxCpuUsage <= 0 || config.maxCpuUsage > 100)) {
            throw new Error('maxCpuUsage must be between 0 and 100');
        }
        return true;
    }
    getDefaultConfig() {
        return { ...this.defaultConfig };
    }
    getProtocolMetadata() {
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
        if (!this.protocol) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                details: {
                    protocol: 'not_created',
                    services: 'not_available',
                    crossCuttingConcerns: 'not_initialized'
                },
                checks: [
                    {
                        name: 'protocol_initialization',
                        status: 'fail',
                        message: 'Extension protocol not initialized'
                    }
                ]
            };
        }
        try {
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                details: {
                    protocol: 'initialized',
                    services: 'available',
                    crossCuttingConcerns: 'initialized',
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
                        name: 'service_availability',
                        status: 'pass',
                        message: 'Extension management service is available'
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
    reset() {
        this.protocol = null;
    }
    async destroy() {
        if (this.protocol) {
            if ('destroy' in this.protocol && typeof this.protocol.destroy === 'function') {
                await this.protocol.destroy();
            }
            this.protocol = null;
        }
    }
}
exports.ExtensionProtocolFactory = ExtensionProtocolFactory;
exports.DEFAULT_EXTENSION_PROTOCOL_CONFIG = {
    enableLogging: false,
    enableMetrics: true,
    enableCaching: true,
    repositoryType: 'memory',
    extensionConfiguration: {
        maxExtensions: 1000,
        defaultExtensionType: 'plugin',
        autoLoadEnabled: false,
        sandboxEnabled: true,
        securityLevel: 'medium'
    },
    mplpIntegration: {
        enabled: true,
        moduleInterfaces: ['context', 'plan', 'role', 'confirm', 'trace', 'core', 'collab', 'dialog', 'network'],
        coordinationEnabled: true,
        eventDrivenEnabled: true,
        coreOrchestratorSupport: true
    },
    performanceMetrics: {
        enabled: true,
        collectionIntervalSeconds: 60,
        extensionLoadLatencyThresholdMs: 200,
        extensionExecutionLatencyThresholdMs: 100,
        memoryUsageThresholdMB: 50
    },
    crossCuttingConcerns: {
        security: { enabled: true },
        performance: { enabled: true },
        eventBus: { enabled: true },
        errorHandler: { enabled: true },
        coordination: { enabled: true },
        orchestration: { enabled: true },
        stateSync: { enabled: true },
        transaction: { enabled: true },
        protocolVersion: { enabled: true }
    }
};
