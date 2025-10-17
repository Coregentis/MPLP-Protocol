"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionModuleAdapter = void 0;
class ExtensionModuleAdapter {
    extensionManagementService;
    constructor(extensionManagementService) {
        this.extensionManagementService = extensionManagementService;
    }
    async createExtension(request) {
        const serviceRequest = {
            contextId: request.contextId,
            name: request.name,
            displayName: request.displayName,
            description: request.description,
            version: request.version,
            extensionType: request.extensionType,
            compatibility: request.compatibility || {
                mplpVersion: '1.0.0',
                requiredModules: [],
                dependencies: [],
                conflicts: []
            },
            configuration: request.configuration || {
                schema: {},
                currentConfig: {},
                defaultConfig: {},
                validationRules: []
            },
            security: request.security || {
                sandboxEnabled: true,
                resourceLimits: {
                    maxMemory: 512,
                    maxCpu: 50,
                    maxFileSize: 100,
                    maxNetworkConnections: 10,
                    allowedDomains: [],
                    blockedDomains: [],
                    allowedHosts: [],
                    allowedPorts: [],
                    protocols: ['https']
                },
                codeSigning: {
                    required: false,
                    trustedSigners: [],
                    verificationEndpoint: undefined
                },
                permissions: {
                    fileSystem: { read: [], write: [], execute: [] },
                    network: { allowedHosts: [], allowedPorts: [], protocols: [] },
                    database: { read: [], write: [], admin: [] },
                    api: { endpoints: [], methods: [], rateLimit: 100 }
                }
            },
            metadata: request.metadata || {
                author: { name: 'Unknown' },
                license: { type: 'MIT' },
                keywords: [],
                category: 'general',
                screenshots: []
            }
        };
        return await this.extensionManagementService.createExtension(serviceRequest);
    }
    async getExtension(extensionId) {
        return await this.extensionManagementService.getExtensionById(extensionId);
    }
    async updateExtension(extensionId, updates) {
        const serviceRequest = {
            extensionId,
            displayName: updates.displayName,
            description: updates.description,
            configuration: updates.configuration,
            metadata: updates.metadata
        };
        return await this.extensionManagementService.updateExtension(serviceRequest);
    }
    async deleteExtension(extensionId) {
        return await this.extensionManagementService.deleteExtension(extensionId);
    }
    async activateExtension(extensionId) {
        const activationRequest = {
            extensionId,
            force: false
        };
        const result = await this.extensionManagementService.activateExtension(activationRequest);
        return result !== null;
    }
    async deactivateExtension(extensionId) {
        const result = await this.extensionManagementService.deactivateExtension(extensionId);
        return result !== null;
    }
    async listExtensions(options) {
        const result = await this.extensionManagementService.queryExtensions({
            extensionType: options.extensionType,
            status: options.status,
            contextId: options.contextId
        }, {
            page: options.page,
            limit: options.limit || 10,
            offset: ((options.page || 1) - 1) * (options.limit || 10)
        });
        return {
            extensions: result.extensions,
            totalCount: result.total,
            hasMore: result.hasMore || false,
            nextPage: result.hasMore ? (options.page || 1) + 1 : undefined
        };
    }
    async queryExtensions(criteria) {
        const result = await this.extensionManagementService.queryExtensions({
            extensionType: criteria.extensionType,
            status: criteria.status,
            name: criteria.name,
            category: criteria.category
        });
        return result.extensions;
    }
    async getActiveExtensions(contextId) {
        return await this.extensionManagementService.getActiveExtensions(contextId);
    }
    async getExtensionsByType(extensionType) {
        const result = await this.extensionManagementService.queryExtensions({
            extensionType
        });
        return result.extensions;
    }
    async getHealthStatus() {
        const healthStatus = await this.extensionManagementService.getHealthStatus();
        return {
            status: healthStatus.status,
            timestamp: healthStatus.timestamp,
            checks: healthStatus.details?.repository ? [{
                    name: 'repository',
                    status: 'pass',
                    message: `Repository status: ${healthStatus.details.repository.status}`,
                    duration: 0
                }] : [],
            metrics: {
                totalExtensions: healthStatus.details?.repository?.extensionCount || 0,
                activeExtensions: healthStatus.details?.repository?.activeExtensions || 0,
                errorCount: 0,
                averageResponseTime: healthStatus.details?.performance?.averageResponseTime || 0
            }
        };
    }
    async getPerformanceMetrics() {
        return {
            activationLatency: 100,
            memoryUsage: 50000000,
            cpuUsage: 25,
            networkRequests: 10,
            errorRate: 0,
            throughput: 1000,
            responseTime: 50,
            healthStatus: 'healthy',
            alerts: []
        };
    }
}
exports.ExtensionModuleAdapter = ExtensionModuleAdapter;
