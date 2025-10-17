"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionModule = void 0;
exports.createExtensionModule = createExtensionModule;
exports.initializeExtensionModule = initializeExtensionModule;
const extension_management_service_1 = require("./application/services/extension-management.service");
const extension_repository_1 = require("./infrastructure/repositories/extension.repository");
class ExtensionModule {
    extensionManagementService;
    extensionRepository;
    isInitialized = false;
    moduleOptions = {};
    initializationTime = 0;
    async initialize(config) {
        if (this.isInitialized) {
            return;
        }
        try {
            this.moduleOptions = this.parseConfiguration(config);
            await this.initializeRepository();
            await this.initializeServices();
            if (this.moduleOptions.enableCrossCuttingConcerns !== false) {
                await this.initializeCrossCuttingConcerns();
            }
            this.isInitialized = true;
            this.initializationTime = Date.now();
            if (this.moduleOptions.enableMetrics) {
                await this.recordInitializationMetrics();
            }
        }
        catch (error) {
            throw new Error(`Extension module initialization failed: ${error.message}`);
        }
    }
    async shutdown() {
        if (!this.isInitialized) {
            return;
        }
        try {
            await this.cleanupResources();
            this.isInitialized = false;
            this.extensionManagementService = undefined;
            this.extensionRepository = undefined;
        }
        catch (error) {
            throw new Error(`Extension module shutdown failed: ${error.message}`);
        }
    }
    getMetadata() {
        return {
            name: 'Extension',
            version: '1.0.0',
            description: 'MPLP Extension Management Module - Enterprise-grade extension lifecycle management',
            author: 'MPLP Development Team',
            dependencies: [
                'mplp-coordination',
                'mplp-error-handling',
                'mplp-event-bus',
                'mplp-orchestration',
                'mplp-performance',
                'mplp-protocol-version',
                'mplp-security',
                'mplp-state-sync',
                'mplp-transaction'
            ]
        };
    }
    async executeOperation(request) {
        const timestamp = new Date().toISOString();
        try {
            switch (request.operation) {
                case 'create_extension': {
                    const createResult = await this.createExtension(request.payload);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        status: 'success',
                        success: true,
                        data: createResult
                    };
                }
                case 'get_extension': {
                    const getResult = await this.getExtension(request.payload.extensionId);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        status: 'success',
                        success: true,
                        data: getResult
                    };
                }
                case 'list_extensions': {
                    const listResult = await this.listExtensions(request.payload);
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        status: 'success',
                        success: true,
                        data: listResult
                    };
                }
                default:
                    return {
                        protocolVersion: request.protocolVersion,
                        timestamp,
                        requestId: request.requestId,
                        status: 'error',
                        success: false,
                        error: `Unsupported operation: ${request.operation}`
                    };
            }
        }
        catch (error) {
            return {
                protocolVersion: request.protocolVersion,
                timestamp,
                requestId: request.requestId,
                status: 'error',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    getProtocolMetadata() {
        return {
            name: 'extension',
            version: '1.0.0',
            description: 'MPLP Extension Management Protocol - Multi-Agent Protocol Lifecycle Platform Extension Management',
            capabilities: [
                'extension-lifecycle-management',
                'plugin-coordination',
                'ai-driven-recommendations',
                'security-validation',
                'performance-monitoring',
                'cross-cutting-concerns-integration',
                'distributed-extension-management',
                'enterprise-grade-features'
            ],
            dependencies: [
                'security',
                'performance',
                'eventBus',
                'errorHandler',
                'coordination',
                'orchestration',
                'stateSync',
                'transaction',
                'protocolVersion'
            ],
            supportedOperations: [
                'create_extension',
                'update_extension',
                'delete_extension',
                'get_extension',
                'list_extensions',
                'activate_extension',
                'deactivate_extension',
                'query_extensions',
                'get_health_status'
            ]
        };
    }
    async healthCheck() {
        const timestamp = new Date().toISOString();
        const checks = [];
        if (!this.isInitialized) {
            return {
                status: 'unhealthy',
                timestamp,
                details: {
                    module: 'extension',
                    initialized: false,
                    repository: 'disconnected'
                },
                checks: [
                    {
                        name: 'initialization',
                        status: 'fail',
                        message: 'Module not initialized'
                    }
                ]
            };
        }
        try {
            if (!this.extensionManagementService) {
                checks.push({
                    name: 'extension_management_service',
                    status: 'fail',
                    message: 'ExtensionManagementService not available'
                });
            }
            else {
                checks.push({
                    name: 'extension_management_service',
                    status: 'pass',
                    message: 'ExtensionManagementService operational'
                });
            }
            if (!this.extensionRepository) {
                checks.push({
                    name: 'repository',
                    status: 'fail',
                    message: 'ExtensionRepository not available'
                });
            }
            else {
                checks.push({
                    name: 'repository',
                    status: 'pass',
                    message: 'ExtensionRepository connected'
                });
            }
            const serviceHealthStatus = this.extensionManagementService
                ? await this.extensionManagementService.getHealthStatus()
                : { status: 'unhealthy' };
            const isHealthy = serviceHealthStatus.status === 'healthy';
            return {
                status: isHealthy ? 'healthy' : 'degraded',
                timestamp,
                details: {
                    module: 'extension',
                    initialized: true,
                    repository: 'connected',
                    service: serviceHealthStatus.status,
                    uptime: Date.now() - this.initializationTime,
                    crossCuttingConcerns: this.moduleOptions.enableCrossCuttingConcerns ? 'enabled' : 'disabled'
                },
                checks
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp,
                details: {
                    module: 'extension',
                    initialized: this.isInitialized,
                    repository: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                },
                checks: [
                    {
                        name: 'health_check',
                        status: 'fail',
                        message: error instanceof Error ? error.message : 'Health check failed'
                    }
                ]
            };
        }
    }
    getVersion() {
        return '1.0.0';
    }
    getExtensionManagementService() {
        if (!this.isInitialized || !this.extensionManagementService) {
            throw new Error('Extension module is not initialized');
        }
        return this.extensionManagementService;
    }
    getCrossCuttingConcernsService() {
        return this.getExtensionManagementService();
    }
    async createExtension(request) {
        const service = this.getExtensionManagementService();
        const fullRequest = {
            ...request,
            compatibility: {
                mplpVersion: '1.0.0',
                requiredModules: [],
                dependencies: [],
                conflicts: []
            },
            configuration: {
                schema: {},
                currentConfig: {},
                defaultConfig: {},
                validationRules: []
            },
            security: {
                sandboxEnabled: true,
                resourceLimits: {
                    maxMemory: 100 * 1024 * 1024,
                    maxCpu: 50,
                    maxFileSize: 10 * 1024 * 1024,
                    maxNetworkConnections: 10,
                    allowedDomains: [],
                    blockedDomains: [],
                    allowedHosts: [],
                    allowedPorts: [80, 443],
                    protocols: ['http', 'https']
                },
                codeSigning: {
                    required: false,
                    trustedSigners: []
                },
                permissions: {
                    fileSystem: { read: [], write: [], execute: [] },
                    network: { allowedHosts: [], allowedPorts: [], protocols: [] },
                    database: { read: [], write: [], admin: [] },
                    api: { endpoints: [], methods: [], rateLimit: 100 }
                }
            },
            metadata: {
                author: { name: 'Unknown' },
                license: { type: 'MIT' },
                keywords: [],
                category: 'general',
                screenshots: []
            }
        };
        return await service.createExtension(fullRequest);
    }
    async getExtension(extensionId) {
        const service = this.getExtensionManagementService();
        return await service.getExtensionById(extensionId);
    }
    async activateExtension(extensionId, userId) {
        const service = this.getExtensionManagementService();
        return await service.activateExtension({ extensionId, userId });
    }
    async deactivateExtension(extensionId, userId) {
        const service = this.getExtensionManagementService();
        return await service.deactivateExtension(extensionId, userId);
    }
    async updateExtension(extensionId, updateData) {
        const service = this.getExtensionManagementService();
        try {
            const result = await service.updateExtension({
                extensionId,
                ...updateData
            });
            return result;
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('not found')) {
                return null;
            }
            throw error;
        }
    }
    async listExtensions(options = {}) {
        const service = this.getExtensionManagementService();
        return await service.listExtensions(options);
    }
    async deleteExtension(extensionId) {
        const service = this.getExtensionManagementService();
        return await service.deleteExtension(extensionId);
    }
    async getActiveExtensions(contextId) {
        const service = this.getExtensionManagementService();
        return await service.getActiveExtensions(contextId);
    }
    parseConfiguration(config) {
        const defaultOptions = {
            enableLogging: true,
            enableCaching: false,
            enableMetrics: true,
            repositoryType: 'memory',
            extensionRetentionDays: 90,
            maxExtensionsPerContext: 100,
            enablePerformanceMonitoring: true,
            enableSecurityValidation: true,
            enableEventPublishing: true,
            enableCrossCuttingConcerns: true
        };
        return { ...defaultOptions, ...config };
    }
    async initializeRepository() {
        switch (this.moduleOptions.repositoryType) {
            case 'memory':
                this.extensionRepository = new extension_repository_1.ExtensionRepository();
                break;
            case 'database':
                throw new Error('Database repository not implemented yet');
            case 'file':
                throw new Error('File repository not implemented yet');
            default:
                throw new Error(`Unknown repository type: ${this.moduleOptions.repositoryType}`);
        }
    }
    async initializeServices() {
        if (!this.extensionRepository) {
            throw new Error('Repository must be initialized before services');
        }
        this.extensionManagementService = new extension_management_service_1.ExtensionManagementService(this.extensionRepository);
    }
    async initializeCrossCuttingConcerns() {
    }
    async recordInitializationMetrics() {
    }
    async cleanupResources() {
    }
}
exports.ExtensionModule = ExtensionModule;
function createExtensionModule(_options) {
    return new ExtensionModule();
}
async function initializeExtensionModule(options) {
    const module = createExtensionModule(options);
    await module.initialize(options);
    return module;
}
exports.default = ExtensionModule;
