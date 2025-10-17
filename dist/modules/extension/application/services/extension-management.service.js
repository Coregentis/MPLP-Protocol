"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionManagementService = void 0;
const extension_entity_1 = require("../../domain/entities/extension.entity");
class ExtensionManagementService {
    extensionRepository;
    constructor(extensionRepository) {
        this.extensionRepository = extensionRepository;
    }
    async applyAllCrossCuttingConcerns(extension) {
        const extensionId = extension.extensionId;
        try {
            if (extension.contextId) {
                await this.coordinateWithModule(extensionId, 'context', extension.contextId);
            }
            await this.trackExtensionPerformance(extensionId, {
                timestamp: new Date().toISOString(),
                operation: 'initialization',
                metrics: extension.performanceMetrics
            });
            await this.validateExtensionSecurity(extensionId, extension.security);
            await this.validateExtensionProtocolVersion(extensionId, extension.protocolVersion);
            await this.publishExtensionEvent(extensionId, {
                eventType: 'extension.created',
                extensionId,
                contextId: extension.contextId,
                extensionType: extension.extensionType,
                timestamp: new Date().toISOString()
            });
            await this.syncExtensionState(extensionId, {
                status: extension.status,
                version: extension.version,
                timestamp: extension.timestamp
            });
        }
        catch (error) {
            await this.handleExtensionError(extensionId, error);
            throw error;
        }
    }
    async removeAllCrossCuttingConcerns(extensionId) {
        try {
            await this.publishExtensionEvent(extensionId, {
                eventType: 'extension.deleted',
                extensionId,
                timestamp: new Date().toISOString()
            });
            await this.trackExtensionPerformance(extensionId, {
                timestamp: new Date().toISOString(),
                operation: 'cleanup',
                final: true
            });
        }
        catch (error) {
            await this.handleExtensionError(extensionId, error);
            throw error;
        }
    }
    async coordinateWithModule(_extensionId, _targetModule, _targetId) {
    }
    async trackExtensionPerformance(_extensionId, _metrics) {
    }
    async validateExtensionSecurity(_extensionId, _securityConfig) {
        return true;
    }
    async validateExtensionProtocolVersion(_extensionId, _version) {
        return true;
    }
    async publishExtensionEvent(_extensionId, _event) {
    }
    async syncExtensionState(_extensionId, _state) {
    }
    async handleExtensionError(_extensionId, _error) {
    }
    async createExtension(request) {
        const nameExists = await this.extensionRepository.nameExists(request.name);
        if (nameExists) {
            throw new Error(`Extension with name '${request.name}' already exists`);
        }
        const extensionId = this.generateExtensionId();
        const extensionData = {
            protocolVersion: '1.0.0',
            timestamp: new Date().toISOString(),
            extensionId,
            contextId: request.contextId,
            name: request.name,
            displayName: request.displayName,
            description: request.description,
            version: request.version,
            extensionType: request.extensionType,
            status: 'installed',
            compatibility: request.compatibility,
            configuration: request.configuration,
            extensionPoints: request.extensionPoints || [],
            apiExtensions: request.apiExtensions || [],
            eventSubscriptions: request.eventSubscriptions || [],
            lifecycle: this.createInitialLifecycle(),
            security: request.security,
            metadata: request.metadata,
            auditTrail: this.createInitialAuditTrail(),
            performanceMetrics: this.createInitialPerformanceMetrics(),
            monitoringIntegration: this.createInitialMonitoringIntegration(),
            versionHistory: this.createInitialVersionHistory(request.version),
            searchMetadata: this.createInitialSearchMetadata(request),
            eventIntegration: this.createInitialEventIntegration()
        };
        const extensionEntity = new extension_entity_1.ExtensionEntity(extensionData);
        const createdExtension = await this.extensionRepository.create(extensionEntity.toData());
        return createdExtension;
    }
    async getExtensionById(extensionId) {
        return await this.extensionRepository.findById(extensionId);
    }
    async updateExtension(request) {
        const existingExtension = await this.extensionRepository.findById(request.extensionId);
        if (!existingExtension) {
            throw new Error(`Extension with ID '${request.extensionId}' not found`);
        }
        const extensionEntity = new extension_entity_1.ExtensionEntity(existingExtension);
        const updatedData = { ...existingExtension };
        if (request.displayName !== undefined) {
            updatedData.displayName = request.displayName;
        }
        if (request.description !== undefined) {
            updatedData.description = request.description;
        }
        if (request.configuration) {
            extensionEntity.updateConfiguration(request.configuration);
            updatedData.configuration = extensionEntity.toData().configuration;
        }
        if (request.extensionPoints) {
        }
        const updatedExtension = await this.extensionRepository.update(request.extensionId, updatedData);
        return updatedExtension;
    }
    async deleteExtension(extensionId) {
        const extension = await this.extensionRepository.findById(extensionId);
        if (!extension) {
            return false;
        }
        if (extension.status === 'active') {
            throw new Error('Cannot delete active extension. Please deactivate first.');
        }
        const deleted = await this.extensionRepository.delete(extensionId);
        if (deleted) {
        }
        return deleted;
    }
    async activateExtension(request) {
        const extensionData = await this.extensionRepository.findById(request.extensionId);
        if (!extensionData) {
            throw new Error(`Extension with ID '${request.extensionId}' not found`);
        }
        const extensionEntity = new extension_entity_1.ExtensionEntity(extensionData);
        const activated = extensionEntity.activate(request.userId);
        if (activated) {
            await this.extensionRepository.update(request.extensionId, extensionEntity.toData());
        }
        return activated;
    }
    async deactivateExtension(extensionId, userId) {
        const extensionData = await this.extensionRepository.findById(extensionId);
        if (!extensionData) {
            throw new Error(`Extension with ID '${extensionId}' not found`);
        }
        const extensionEntity = new extension_entity_1.ExtensionEntity(extensionData);
        const deactivated = extensionEntity.deactivate(userId);
        if (deactivated) {
            await this.extensionRepository.update(extensionId, extensionEntity.toData());
        }
        return deactivated;
    }
    async updateExtensionVersion(extensionId, newVersion, changelog, userId) {
        const extensionData = await this.extensionRepository.findById(extensionId);
        if (!extensionData) {
            throw new Error(`Extension with ID '${extensionId}' not found`);
        }
        const extensionEntity = new extension_entity_1.ExtensionEntity(extensionData);
        extensionEntity.updateVersion(newVersion, changelog, userId);
        const updatedExtension = await this.extensionRepository.update(extensionId, extensionEntity.toData());
        return updatedExtension;
    }
    async queryExtensions(filter, pagination, sort) {
        return await this.extensionRepository.findByFilter(filter, pagination, sort);
    }
    async getExtensionsByContextId(contextId) {
        return await this.extensionRepository.findByContextId(contextId);
    }
    async getExtensionsByType(extensionType, status) {
        return await this.extensionRepository.findByType(extensionType, status);
    }
    async getActiveExtensions(contextId) {
        return await this.extensionRepository.findActiveExtensions(contextId);
    }
    async searchExtensions(searchTerm, searchFields, pagination) {
        return await this.extensionRepository.search(searchTerm, searchFields, pagination);
    }
    async getExtensionCount(filter) {
        return await this.extensionRepository.count(filter);
    }
    async extensionExists(extensionId) {
        return await this.extensionRepository.exists(extensionId);
    }
    async getExtensionStatistics(filter) {
        return await this.extensionRepository.getStatistics(filter);
    }
    async updatePerformanceMetrics(extensionId, metrics) {
        await this.extensionRepository.updatePerformanceMetrics(extensionId, metrics);
    }
    async createExtensionBatch(requests) {
        const extensions = [];
        for (const request of requests) {
            try {
                const extensionData = await this.prepareExtensionData(request);
                extensions.push(extensionData);
            }
            catch (error) {
            }
        }
        return await this.extensionRepository.createBatch(extensions);
    }
    async deleteExtensionBatch(extensionIds) {
        return await this.extensionRepository.deleteBatch(extensionIds);
    }
    async updateExtensionStatusBatch(extensionIds, status) {
        return await this.extensionRepository.updateStatusBatch(extensionIds, status);
    }
    async getHealthStatus() {
        try {
            const stats = await this.extensionRepository.getStatistics();
            const recentExtensions = await this.extensionRepository.findRecentlyUpdatedExtensions(5);
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                details: {
                    service: 'ExtensionManagementService',
                    version: '1.0.0',
                    repository: {
                        status: 'operational',
                        extensionCount: stats.totalExtensions,
                        activeExtensions: stats.activeExtensions,
                        lastOperation: recentExtensions.length > 0 ? recentExtensions[0].timestamp : 'none'
                    },
                    performance: {
                        averageResponseTime: stats.averagePerformanceMetrics.responseTime,
                        totalExtensions: stats.totalExtensions,
                        errorRate: stats.averagePerformanceMetrics.errorRate
                    }
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                details: {
                    service: 'ExtensionManagementService',
                    version: '1.0.0',
                    repository: {
                        status: 'error',
                        extensionCount: 0,
                        activeExtensions: 0,
                        lastOperation: 'error'
                    },
                    performance: {
                        averageResponseTime: 0,
                        totalExtensions: 0,
                        errorRate: 1.0
                    }
                }
            };
        }
    }
    generateExtensionId() {
        return `ext-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    async prepareExtensionData(request) {
        const extensionId = this.generateExtensionId();
        return {
            protocolVersion: '1.0.0',
            timestamp: new Date().toISOString(),
            extensionId,
            contextId: request.contextId,
            name: request.name,
            displayName: request.displayName,
            description: request.description,
            version: request.version,
            extensionType: request.extensionType,
            status: 'installed',
            compatibility: request.compatibility,
            configuration: request.configuration,
            extensionPoints: request.extensionPoints || [],
            apiExtensions: request.apiExtensions || [],
            eventSubscriptions: request.eventSubscriptions || [],
            lifecycle: this.createInitialLifecycle(),
            security: request.security,
            metadata: request.metadata,
            auditTrail: this.createInitialAuditTrail(),
            performanceMetrics: this.createInitialPerformanceMetrics(),
            monitoringIntegration: this.createInitialMonitoringIntegration(),
            versionHistory: this.createInitialVersionHistory(request.version),
            searchMetadata: this.createInitialSearchMetadata(request),
            eventIntegration: this.createInitialEventIntegration()
        };
    }
    createInitialLifecycle() {
        return {
            installDate: new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
            activationCount: 0,
            errorCount: 0,
            performanceMetrics: {
                averageResponseTime: 0,
                throughput: 0,
                errorRate: 0,
                memoryUsage: 0,
                cpuUsage: 0,
                lastMeasurement: new Date().toISOString()
            },
            healthCheck: {
                enabled: true,
                interval: 60000,
                timeout: 5000,
                expectedStatus: 200,
                healthyThreshold: 3,
                unhealthyThreshold: 3
            }
        };
    }
    createInitialAuditTrail() {
        return {
            events: [],
            complianceSettings: {
                retentionPeriod: 365,
                encryptionEnabled: true,
                accessLogging: true,
                dataClassification: 'internal'
            }
        };
    }
    createInitialPerformanceMetrics() {
        return {
            activationLatency: 0,
            executionTime: 0,
            memoryFootprint: 0,
            cpuUtilization: 0,
            networkLatency: 0,
            errorRate: 0,
            throughput: 0,
            availability: 1.0,
            efficiencyScore: 1.0,
            healthStatus: 'healthy',
            alerts: []
        };
    }
    createInitialMonitoringIntegration() {
        return {
            providers: [],
            endpoints: [],
            dashboards: [],
            alerting: {
                enabled: false,
                channels: [],
                rules: []
            }
        };
    }
    createInitialVersionHistory(version) {
        return {
            versions: [{
                    version,
                    releaseDate: new Date().toISOString(),
                    changelog: 'Initial version',
                    breaking: false,
                    deprecated: []
                }],
            autoVersioning: {
                enabled: false,
                strategy: 'semantic',
                prerelease: false,
                buildMetadata: false
            }
        };
    }
    createInitialSearchMetadata(_request) {
        return {
            indexedFields: ['name', 'displayName', 'description', 'keywords'],
            searchStrategies: [{
                    name: 'default',
                    type: 'fuzzy',
                    weight: 1.0,
                    fields: ['name', 'displayName', 'description']
                }],
            facets: [{
                    field: 'extensionType',
                    type: 'terms',
                    size: 10
                }]
        };
    }
    createInitialEventIntegration() {
        return {
            eventBus: {
                provider: 'custom',
                connectionString: '',
                topics: []
            },
            eventRouting: {
                rules: [],
                errorHandling: {
                    strategy: 'retry',
                    maxRetries: 3,
                    backoffStrategy: 'exponential'
                }
            },
            eventTransformation: {
                enabled: false,
                transformers: []
            }
        };
    }
    async listExtensions(options = {}) {
        try {
            let extensions = await this.extensionRepository.findAll();
            if (options.contextId) {
                extensions = extensions.filter((ext) => ext.contextId === options.contextId);
            }
            if (options.extensionType) {
                extensions = extensions.filter((ext) => ext.extensionType === options.extensionType);
            }
            if (options.status) {
                extensions = extensions.filter((ext) => ext.status === options.status);
            }
            const totalCount = extensions.length;
            const page = options.page || 1;
            const limit = options.limit || 10;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedExtensions = extensions.slice(startIndex, endIndex);
            return {
                extensions: paginatedExtensions,
                totalCount,
                hasMore: endIndex < totalCount
            };
        }
        catch (error) {
            throw new Error(`Failed to list extensions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.ExtensionManagementService = ExtensionManagementService;
