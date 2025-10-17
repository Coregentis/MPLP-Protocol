"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceModuleAdapter = void 0;
const trace_protocol_factory_1 = require("../factories/trace-protocol.factory");
const trace_management_service_1 = require("../../application/services/trace-management.service");
const trace_analytics_service_1 = require("../../application/services/trace-analytics.service");
const trace_security_service_1 = require("../../application/services/trace-security.service");
const trace_repository_1 = require("../repositories/trace.repository");
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
class MockL3ManagerImpl {
    async getHealthStatus() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString()
        };
    }
}
class MockPerformanceMonitorImpl extends MockL3ManagerImpl {
    operations = new Map();
    async startOperation(operation) {
        const operationId = `${operation}-${Date.now()}`;
        this.operations.set(operationId, Date.now());
        return operationId;
    }
    async endOperation(_operationId, _success = true) {
    }
    async getOperationDuration(operationId) {
        const startTime = this.operations.get(operationId);
        return startTime ? Date.now() - startTime : 0;
    }
}
class MockEventBusManagerImpl extends MockL3ManagerImpl {
    async publishEvent(_eventType, _data) {
    }
}
class MockErrorHandlerImpl extends MockL3ManagerImpl {
    async handleError(error, _context) {
        return {
            code: 'MOCK_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            details: error
        };
    }
}
class MockTransactionManagerImpl extends MockL3ManagerImpl {
    async beginTransaction() {
        return `transaction-${Date.now()}`;
    }
    async commitTransaction(_transactionId) {
    }
    async rollbackTransaction(_transactionId) {
    }
}
class MockCoordinationManagerImpl extends MockL3ManagerImpl {
    async registerIntegration(_sourceModule, _targetModule) {
    }
}
class _MockCrossCuttingConcernsFactory {
    static instance;
    static getInstance() {
        if (!_MockCrossCuttingConcernsFactory.instance) {
            _MockCrossCuttingConcernsFactory.instance = new _MockCrossCuttingConcernsFactory();
        }
        return _MockCrossCuttingConcernsFactory.instance;
    }
    createManagers(_config) {
        return {
            security: new MockL3ManagerImpl(),
            performance: new MockPerformanceMonitorImpl(),
            eventBus: new MockEventBusManagerImpl(),
            errorHandler: new MockErrorHandlerImpl(),
            coordination: new MockCoordinationManagerImpl(),
            orchestration: new MockL3ManagerImpl(),
            stateSync: new MockL3ManagerImpl(),
            transaction: new MockTransactionManagerImpl(),
            protocolVersion: new MockL3ManagerImpl()
        };
    }
}
class TraceModuleAdapter {
    config;
    initialized = false;
    protocol;
    service;
    analyticsService;
    securityService;
    repository;
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
            enableRealTimeMonitoring: true,
            enableCorrelationAnalysis: true,
            enableDistributedTracing: true,
            maxTraceRetentionDays: 30,
            enableAutoArchiving: false,
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
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        try {
            const factoryConfig = {
                enableLogging: this.config.enableLogging,
                enableCaching: this.config.enableCaching,
                enableMetrics: this.config.enableMetrics,
                repositoryType: this.config.repositoryType,
                maxCacheSize: this.config.maxCacheSize,
                cacheTimeout: this.config.cacheTimeout,
                enableRealTimeMonitoring: this.config.enableRealTimeMonitoring,
                enableCorrelationAnalysis: this.config.enableCorrelationAnalysis,
                enableDistributedTracing: this.config.enableDistributedTracing,
                maxTraceRetentionDays: this.config.maxTraceRetentionDays,
                enableAutoArchiving: this.config.enableAutoArchiving
            };
            const factory = trace_protocol_factory_1.TraceProtocolFactory.getInstance();
            this.protocol = await factory.createProtocol(factoryConfig);
            this.repository = new trace_repository_1.TraceRepository({
                enableCaching: this.config.enableCaching,
                maxCacheSize: this.config.maxCacheSize,
                cacheTimeout: this.config.cacheTimeout
            });
            this.service = new trace_management_service_1.TraceManagementService(this.repository);
            this.analyticsService = new trace_analytics_service_1.TraceAnalyticsService(this.repository);
            this.securityService = new trace_security_service_1.TraceSecurityService(this.repository);
            this.initialized = true;
            await this.eventBusManager.publish({
                id: `trace-init-${Date.now()}`,
                type: 'trace_module_initialized',
                timestamp: new Date().toISOString(),
                source: 'trace-module',
                payload: { config: this.config }
            });
        }
        catch (error) {
            await this.errorHandler.logError('error', `Failed to initialize Trace module: ${error instanceof Error ? error.message : 'Unknown error'}`, 'trace-module', error instanceof Error ? error : undefined, { operation: 'initialize', config: this.config });
            throw error;
        }
    }
    async shutdown() {
        if (!this.initialized) {
            return;
        }
        try {
            await this.eventBusManager.publish({
                id: `trace-shutdown-${Date.now()}`,
                type: 'trace_module_shutdown',
                timestamp: new Date().toISOString(),
                source: 'trace-module',
                payload: {}
            });
            this.initialized = false;
        }
        catch (error) {
            await this.errorHandler.logError('error', `Failed to shutdown Trace module: ${error instanceof Error ? error.message : 'Unknown error'}`, 'trace-module', error instanceof Error ? error : undefined, { operation: 'shutdown' });
            throw error;
        }
    }
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('TraceModuleAdapter must be initialized before use');
        }
    }
    async createTrace(request) {
        this.ensureInitialized();
        return await this.protocol.createTrace(request);
    }
    async updateTrace(request) {
        this.ensureInitialized();
        return await this.protocol.updateTrace(request);
    }
    async getTrace(traceId) {
        this.ensureInitialized();
        return await this.protocol.getTrace(traceId);
    }
    async queryTraces(filter, pagination) {
        this.ensureInitialized();
        return await this.protocol.queryTraces(filter, pagination);
    }
    async analyzeTrace(traceId) {
        this.ensureInitialized();
        return await this.protocol.analyzeTrace(traceId);
    }
    async validateTrace(traceData) {
        this.ensureInitialized();
        return await this.protocol.validateTrace(traceData);
    }
    getService() {
        this.ensureInitialized();
        return this.service;
    }
    getAnalyticsService() {
        this.ensureInitialized();
        return this.analyticsService;
    }
    getSecurityService() {
        this.ensureInitialized();
        return this.securityService;
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
        return trace_protocol_factory_1.TraceProtocolFactory.getInstance();
    }
    getConfig() {
        return { ...this.config };
    }
    async getHealthStatus() {
        try {
            if (!this.initialized) {
                return {
                    status: 'not_initialized',
                    timestamp: new Date().toISOString()
                };
            }
            const protocolHealth = await this.protocol.getHealthStatus();
            const _managersHealth = this.getCrossCuttingManagers();
            return {
                status: protocolHealth.status,
                timestamp: new Date().toISOString(),
                adapter: {
                    initialized: this.initialized,
                    config: this.config
                },
                protocol: protocolHealth,
                managers: {
                    security: { status: 'healthy', timestamp: new Date().toISOString() },
                    performance: { status: 'healthy', timestamp: new Date().toISOString() },
                    eventBus: { status: 'healthy', timestamp: new Date().toISOString() },
                    errorHandler: { status: 'healthy', timestamp: new Date().toISOString() },
                    coordination: { status: 'healthy', timestamp: new Date().toISOString() },
                    orchestration: { status: 'healthy', timestamp: new Date().toISOString() },
                    stateSync: { status: 'healthy', timestamp: new Date().toISOString() },
                    transaction: { status: 'healthy', timestamp: new Date().toISOString() },
                    protocolVersion: { status: 'healthy', timestamp: new Date().toISOString() }
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
exports.TraceModuleAdapter = TraceModuleAdapter;
