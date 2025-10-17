"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextModuleAdapter = void 0;
const context_management_service_1 = require("../../application/services/context-management.service");
const context_repository_1 = require("../repositories/context.repository");
const context_controller_1 = require("../../api/controllers/context.controller");
const context_mapper_1 = require("../../api/mappers/context.mapper");
const context_protocol_js_1 = require("../protocols/context.protocol.js");
const context_protocol_factory_js_1 = require("../factories/context-protocol.factory.js");
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
class ContextModuleAdapter {
    repository;
    service;
    controller;
    protocol;
    config;
    isInitialized = false;
    logger;
    cacheManager;
    versionManager;
    crossCuttingFactory;
    securityManager;
    performanceMonitor;
    eventBusManager;
    errorHandler;
    coordinationManager;
    orchestrationManager;
    stateSyncManager;
    transactionManager;
    protocolVersionManager;
    constructor(config = {}) {
        this.config = {
            enableLogging: true,
            enableCaching: false,
            enableMetrics: false,
            repositoryType: 'memory',
            maxCacheSize: 1000,
            cacheTimeout: 300000,
            ...config
        };
        this.crossCuttingFactory = cross_cutting_concerns_1.CrossCuttingConcernsFactory.getInstance();
        const managers = this.crossCuttingFactory.createManagers({
            security: { enabled: true },
            performance: { enabled: this.config.enableMetrics || false },
            eventBus: { enabled: true },
            errorHandler: { enabled: true },
            coordination: { enabled: true },
            orchestration: { enabled: true },
            stateSync: { enabled: true },
            transaction: { enabled: true },
            protocolVersion: { enabled: true }
        });
        this.securityManager = managers.security;
        this.performanceMonitor = managers.performance;
        this.eventBusManager = managers.eventBus;
        this.errorHandler = managers.errorHandler;
        this.coordinationManager = managers.coordination;
        this.orchestrationManager = managers.orchestration;
        this.stateSyncManager = managers.stateSync;
        this.transactionManager = managers.transaction;
        this.protocolVersionManager = managers.protocolVersion;
        this.logger = {
            debug: () => { },
            info: () => { },
            warn: () => { },
            error: () => { }
        };
        this.cacheManager = {
            get: async () => null,
            set: async () => { },
            delete: async () => { },
            clear: async () => { }
        };
        this.versionManager = {
            createVersion: async () => '1.0.0',
            getVersionHistory: async () => [],
            getVersion: async () => null,
            compareVersions: async () => ({ added: {}, modified: {}, removed: [] })
        };
        this.repository = new context_repository_1.MemoryContextRepository();
        this.service = new context_management_service_1.ContextManagementService(this.repository, this.logger, this.cacheManager, this.versionManager);
        this.controller = new context_controller_1.ContextController(this.service);
        const analyticsService = {
            analyzeContext: async () => ({ usage: {}, patterns: {}, performance: {}, insights: [] }),
            searchContexts: async () => ({ results: [], total: 0 }),
            generateReport: async () => ({ reportId: '', data: {} })
        };
        const securityService = {
            validateAccess: async () => true,
            performSecurityAudit: async () => ({ status: 'pass', findings: [] })
        };
        this.protocol = new context_protocol_js_1.ContextProtocol(this.service, analyticsService, securityService, this.securityManager, this.performanceMonitor, this.eventBusManager, this.errorHandler, this.coordinationManager, this.orchestrationManager, this.stateSyncManager, this.transactionManager, this.protocolVersionManager);
    }
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            const isHealthy = await this.repository.healthCheck();
            if (!isHealthy) {
                throw new Error('Repository health check failed');
            }
            this.isInitialized = true;
            if (this.config.enableLogging) {
                void 'Context module adapter initialized successfully';
            }
        }
        catch (error) {
            throw new Error(`Failed to initialize Context module adapter: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async shutdown() {
        if (!this.isInitialized) {
            return;
        }
        try {
            await this.repository.clearCache();
            this.isInitialized = false;
            if (this.config.enableLogging) {
                void 'Context module adapter shut down successfully';
            }
        }
        catch (error) {
            if (this.config.enableLogging) {
                void error;
            }
        }
    }
    getController() {
        this.ensureInitialized();
        return this.controller;
    }
    getService() {
        this.ensureInitialized();
        return this.service;
    }
    getRepository() {
        this.ensureInitialized();
        return this.repository;
    }
    async createContext(request) {
        this.ensureInitialized();
        return await this.service.createContext(request);
    }
    async getContext(contextId) {
        this.ensureInitialized();
        return await this.service.getContextById(contextId);
    }
    async updateContext(contextId, request) {
        this.ensureInitialized();
        return await this.service.updateContext(contextId, request);
    }
    async deleteContext(contextId) {
        this.ensureInitialized();
        await this.service.deleteContext(contextId);
        return true;
    }
    async searchContexts(namePattern) {
        this.ensureInitialized();
        const result = await this.service.searchContexts(namePattern);
        return result.data;
    }
    entityToSchema(entity) {
        return context_mapper_1.ContextMapper.toSchema(entity);
    }
    schemaToEntity(schema) {
        return context_mapper_1.ContextMapper.fromSchema(schema);
    }
    validateSchema(data) {
        return context_mapper_1.ContextMapper.validateSchema(data);
    }
    validateMappingConsistency(entity, schema) {
        return context_mapper_1.ContextMapper.validateMappingConsistency(entity, schema);
    }
    async getStatistics() {
        this.ensureInitialized();
        const repositoryStats = await this.repository.getStatistics();
        return {
            module: 'Context',
            version: '1.0.0',
            isInitialized: this.isInitialized,
            config: this.config,
            repository: {
                totalContexts: repositoryStats.totalContexts,
                activeContexts: repositoryStats.activeContexts,
                suspendedContexts: repositoryStats.suspendedContexts,
                completedContexts: repositoryStats.completedContexts,
                terminatedContexts: repositoryStats.terminatedContexts
            },
            performance: {
                cacheHitRate: repositoryStats.cacheHitRate,
                averageResponseTime: repositoryStats.averageResponseTime
            }
        };
    }
    async healthCheck() {
        const timestamp = new Date().toISOString();
        try {
            const serviceHealth = await this.service.healthCheck();
            const repositoryHealth = await this.repository.healthCheck();
            const adapterHealth = this.isInitialized;
            const allHealthy = serviceHealth && repositoryHealth && adapterHealth;
            return {
                status: allHealthy ? 'healthy' : 'unhealthy',
                timestamp,
                details: {
                    adapter: adapterHealth,
                    service: serviceHealth,
                    repository: repositoryHealth
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp,
                details: {
                    adapter: false,
                    service: false,
                    repository: false
                }
            };
        }
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (this.config.enableLogging) {
            void newConfig;
        }
    }
    ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error('Context module adapter is not initialized. Call initialize() first.');
        }
    }
    getProtocol() {
        this.ensureInitialized();
        return this.protocol;
    }
    getCrossCuttingManagers() {
        this.ensureInitialized();
        return {
            security: this.securityManager,
            performance: this.performanceMonitor,
            eventBus: this.eventBusManager,
            errorHandler: this.errorHandler,
            coordination: this.coordinationManager,
            orchestration: this.orchestrationManager,
            stateSync: this.stateSyncManager,
            transaction: this.transactionManager,
            protocolVersion: this.protocolVersionManager
        };
    }
    getProtocolMetadata() {
        this.ensureInitialized();
        return this.protocol.getMetadata();
    }
    getProtocolFactory() {
        return context_protocol_factory_js_1.ContextProtocolFactory.getInstance();
    }
    async createProtocolFromFactory(config) {
        const factory = context_protocol_factory_js_1.ContextProtocolFactory.getInstance();
        return await factory.createProtocol(config);
    }
}
exports.ContextModuleAdapter = ContextModuleAdapter;
