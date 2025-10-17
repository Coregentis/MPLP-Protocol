"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmModuleAdapter = void 0;
const confirm_controller_1 = require("../../api/controllers/confirm.controller");
const confirm_management_service_1 = require("../../application/services/confirm-management.service");
const confirm_repository_1 = require("../repositories/confirm.repository");
const confirm_protocol_factory_1 = require("../factories/confirm-protocol.factory");
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
class ConfirmModuleAdapter {
    config;
    initialized = false;
    repository;
    service;
    controller;
    protocol;
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
        this.repository = new confirm_repository_1.MemoryConfirmRepository();
        this.service = new confirm_management_service_1.ConfirmManagementService(this.repository);
        this.controller = new confirm_controller_1.ConfirmController(this.service);
        this.initializeProtocol();
    }
    async initializeProtocol() {
        const protocolFactory = confirm_protocol_factory_1.ConfirmProtocolFactory.getInstance();
        this.protocol = await protocolFactory.createProtocol({
            enableLogging: this.config.enableLogging,
            enableCaching: this.config.enableCaching,
            enableMetrics: this.config.enableMetrics,
            repositoryType: this.config.repositoryType
        });
        this.initialized = true;
    }
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('ConfirmModuleAdapter not initialized. Please wait for initialization to complete.');
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
        return confirm_protocol_factory_1.ConfirmProtocolFactory.getInstance();
    }
    async healthCheck() {
        try {
            this.ensureInitialized();
            const checks = {
                adapter: true,
                protocol: await this.protocol.healthCheck(),
                crossCuttingConcerns: await this.crossCuttingFactory.healthCheckAll()
            };
            const allHealthy = checks.adapter &&
                checks.protocol.status === 'healthy' &&
                Object.values(checks.crossCuttingConcerns).every(check => check === true);
            return {
                status: allHealthy ? 'healthy' : 'unhealthy',
                details: checks
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                details: { error: error instanceof Error ? error.message : 'Unknown error' }
            };
        }
    }
    getStatistics() {
        return {
            initialized: this.initialized,
            config: this.config,
            version: '1.0.0',
            supportedOperations: [
                'create',
                'approve',
                'reject',
                'delegate',
                'escalate',
                'update',
                'delete',
                'get',
                'list',
                'query'
            ]
        };
    }
    async shutdown() {
        try {
            this.initialized = false;
        }
        catch (error) {
            if (this.config.enableLogging) {
            }
            throw error;
        }
    }
}
exports.ConfirmModuleAdapter = ConfirmModuleAdapter;
