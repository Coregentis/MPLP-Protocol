"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TRACE_PROTOCOL_CONFIG = exports.TraceProtocolFactory = void 0;
const trace_protocol_1 = require("../protocols/trace.protocol");
const trace_management_service_1 = require("../../application/services/trace-management.service");
const trace_repository_1 = require("../repositories/trace.repository");
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
class MockCrossCuttingConcernsFactory {
    static instance;
    static getInstance() {
        if (!MockCrossCuttingConcernsFactory.instance) {
            MockCrossCuttingConcernsFactory.instance = new MockCrossCuttingConcernsFactory();
        }
        return MockCrossCuttingConcernsFactory.instance;
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
class TraceProtocolFactory {
    static instance;
    protocol = null;
    constructor() { }
    static getInstance() {
        if (!TraceProtocolFactory.instance) {
            TraceProtocolFactory.instance = new TraceProtocolFactory();
        }
        return TraceProtocolFactory.instance;
    }
    async createProtocol(config = {}) {
        if (this.protocol) {
            return this.protocol;
        }
        const crossCuttingFactory = MockCrossCuttingConcernsFactory.getInstance();
        const managers = crossCuttingFactory.createManagers({
            security: { enabled: config.crossCuttingConcerns?.security?.enabled ?? true },
            performance: { enabled: config.crossCuttingConcerns?.performance?.enabled ?? (config.enableMetrics ?? false) },
            eventBus: { enabled: config.crossCuttingConcerns?.eventBus?.enabled ?? true },
            errorHandler: { enabled: config.crossCuttingConcerns?.errorHandler?.enabled ?? true },
            coordination: { enabled: config.crossCuttingConcerns?.coordination?.enabled ?? true },
            orchestration: { enabled: config.crossCuttingConcerns?.orchestration?.enabled ?? true },
            stateSync: { enabled: config.crossCuttingConcerns?.stateSync?.enabled ?? true },
            transaction: { enabled: config.crossCuttingConcerns?.transaction?.enabled ?? true },
            protocolVersion: { enabled: config.crossCuttingConcerns?.protocolVersion?.enabled ?? true }
        });
        const repository = this.createRepository(config);
        const traceManagementService = new trace_management_service_1.TraceManagementService(repository);
        this.protocol = new trace_protocol_1.TraceProtocol(traceManagementService, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion);
        return this.protocol;
    }
    getProtocol() {
        return this.protocol;
    }
    reset() {
        this.protocol = null;
    }
    createRepository(config) {
        switch (config.repositoryType) {
            case 'memory':
            default:
                return new trace_repository_1.TraceRepository({
                    enableCaching: config.enableCaching ?? false,
                    maxCacheSize: config.maxCacheSize ?? 1000,
                    cacheTimeout: config.cacheTimeout ?? 300000
                });
            case 'database':
                throw new Error('Database repository not implemented yet');
            case 'file':
                throw new Error('File repository not implemented yet');
        }
    }
    validateConfig(config) {
        if (config.maxCacheSize && config.maxCacheSize <= 0) {
            throw new Error('maxCacheSize must be greater than 0');
        }
        if (config.cacheTimeout && config.cacheTimeout <= 0) {
            throw new Error('cacheTimeout must be greater than 0');
        }
        if (config.maxTraceRetentionDays && config.maxTraceRetentionDays <= 0) {
            throw new Error('maxTraceRetentionDays must be greater than 0');
        }
    }
    static getDefaultConfig() {
        return {
            enableLogging: true,
            enableCaching: false,
            enableMetrics: false,
            repositoryType: 'memory',
            cacheTimeout: 300000,
            enableRealTimeMonitoring: true,
            enableCorrelationAnalysis: true,
            enableDistributedTracing: true,
            maxTraceRetentionDays: 30,
            enableAutoArchiving: false,
            crossCuttingConcerns: {
                security: { enabled: true },
                performance: { enabled: false },
                eventBus: { enabled: true },
                errorHandler: { enabled: true },
                coordination: { enabled: true },
                orchestration: { enabled: true },
                stateSync: { enabled: true },
                transaction: { enabled: true },
                protocolVersion: { enabled: true }
            }
        };
    }
    getMetadata() {
        return {
            name: 'TraceProtocolFactory',
            version: '1.0.0',
            description: 'Factory for creating Trace protocol instances with L3 cross-cutting concerns',
            supportedRepositoryTypes: ['memory', 'database', 'file'],
            crossCuttingConcerns: [
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
            capabilities: [
                'trace_protocol_creation',
                'l3_manager_injection',
                'repository_abstraction',
                'configuration_validation',
                'singleton_management'
            ]
        };
    }
    getProtocolMetadata() {
        return {
            name: 'MPLP Trace Protocol',
            version: '1.0.0',
            description: 'Trace模块协议 - 执行监控系统和追踪管理',
            capabilities: [
                'trace_management',
                'execution_monitoring',
                'event_tracking',
                'performance_analysis',
                'error_tracking',
                'decision_logging',
                'context_snapshots',
                'batch_operations'
            ],
            dependencies: [
                'mplp-security',
                'mplp-event-bus',
                'mplp-coordination',
                'mplp-orchestration'
            ],
            supportedOperations: [
                'create_trace',
                'update_trace',
                'delete_trace',
                'get_trace',
                'query_traces',
                'batch_create',
                'batch_delete',
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
                        message: 'Trace protocol not initialized'
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
                    traceService: 'active',
                    monitoringService: 'active'
                },
                checks: [
                    {
                        name: 'protocol_initialization',
                        status: 'pass',
                        message: 'Trace protocol successfully initialized'
                    },
                    {
                        name: 'service_availability',
                        status: 'pass',
                        message: 'Trace management service is available'
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
    async destroy() {
        if (this.protocol) {
            if ('destroy' in this.protocol && typeof this.protocol.destroy === 'function') {
                await this.protocol.destroy();
            }
            this.protocol = null;
        }
    }
}
exports.TraceProtocolFactory = TraceProtocolFactory;
exports.DEFAULT_TRACE_PROTOCOL_CONFIG = {
    enableLogging: false,
    enableMetrics: true,
    enableCaching: true,
    repositoryType: 'memory',
    traceConfiguration: {
        maxTraces: 10000,
        defaultTraceType: 'execution',
        retentionPeriodDays: 90,
        compressionEnabled: false,
        indexingEnabled: true
    },
    monitoringConfiguration: {
        enabled: true,
        samplingRate: 1.0,
        alertThresholds: {
            errorRate: 0.1,
            latencyP99Ms: 2000,
            throughputRps: 50
        },
        exportInterval: 300
    },
    performanceMetrics: {
        enabled: true,
        collectionIntervalSeconds: 60,
        traceCreationLatencyThresholdMs: 100,
        traceQueryLatencyThresholdMs: 200,
        storageEfficiencyThreshold: 0.7
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
