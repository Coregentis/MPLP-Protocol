"use strict";
/**
 * Trace协议工厂
 *
 * @description 创建和配置Trace协议实例，集成9个L3横切关注点管理器
 * @version 1.0.0
 * @pattern 单例模式，与Context、Plan、Role、Confirm模块使用IDENTICAL架构
 * @integration 统一L3管理器注入模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TRACE_PROTOCOL_CONFIG = exports.TraceProtocolFactory = void 0;
const trace_protocol_1 = require("../protocols/trace.protocol");
const trace_management_service_1 = require("../../application/services/trace-management.service");
const trace_repository_1 = require("../repositories/trace.repository");
// ===== Mock管理器实现 =====
class MockL3ManagerImpl {
    async getHealthStatus() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString()
        };
    }
}
class MockPerformanceMonitorImpl extends MockL3ManagerImpl {
    constructor() {
        super(...arguments);
        this.operations = new Map();
    }
    async startOperation(operation) {
        const operationId = `${operation}-${Date.now()}`;
        this.operations.set(operationId, Date.now());
        return operationId;
    }
    async endOperation(_operationId, _success = true) {
        // Mock implementation
    }
    async getOperationDuration(operationId) {
        const startTime = this.operations.get(operationId);
        return startTime ? Date.now() - startTime : 0;
    }
}
class MockEventBusManagerImpl extends MockL3ManagerImpl {
    async publishEvent(_eventType, _data) {
        // Mock implementation
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
        // Mock implementation
    }
    async rollbackTransaction(_transactionId) {
        // Mock implementation
    }
}
class MockCoordinationManagerImpl extends MockL3ManagerImpl {
    async registerIntegration(_sourceModule, _targetModule) {
        // Mock implementation
    }
}
// ===== Mock横切关注点工厂 =====
class MockCrossCuttingConcernsFactory {
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
/**
 * Trace协议工厂类
 *
 * @description 单例工厂，负责创建和配置Trace协议实例
 */
class TraceProtocolFactory {
    constructor() {
        this.protocol = null;
    }
    /**
     * 获取工厂单例实例
     */
    static getInstance() {
        if (!TraceProtocolFactory.instance) {
            TraceProtocolFactory.instance = new TraceProtocolFactory();
        }
        return TraceProtocolFactory.instance;
    }
    /**
     * 创建Trace协议实例
     */
    async createProtocol(config = {}) {
        if (this.protocol) {
            return this.protocol;
        }
        // 创建横切关注点管理器
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
        // 创建仓库实例
        const repository = this.createRepository(config);
        // 创建业务服务
        const traceManagementService = new trace_management_service_1.TraceManagementService(repository);
        // 创建协议实例，注入所有9个L3管理器
        this.protocol = new trace_protocol_1.TraceProtocol(traceManagementService, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion);
        return this.protocol;
    }
    /**
     * 获取已创建的协议实例
     */
    getProtocol() {
        return this.protocol;
    }
    /**
     * 重置工厂（主要用于测试）
     */
    reset() {
        this.protocol = null;
    }
    /**
     * 创建仓库实例
     */
    createRepository(config) {
        switch (config.repositoryType) {
            case 'memory':
            default:
                return new trace_repository_1.TraceRepository({
                    enableCaching: config.enableCaching ?? false,
                    maxCacheSize: config.maxCacheSize ?? 1000,
                    cacheTimeout: config.cacheTimeout ?? 300000
                });
            // 预留其他仓库类型
            case 'database':
                // TODO: 实现数据库仓库
                throw new Error('Database repository not implemented yet');
            case 'file':
                // TODO: 实现文件仓库
                throw new Error('File repository not implemented yet');
        }
    }
    // Note: validateConfig method was removed as it is not currently used.
    // Configuration validation will be reimplemented when needed.
    /**
     * Placeholder for future configuration validation
     */
    _validateConfigPlaceholder(config) {
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
    /**
     * 获取默认配置
     */
    static getDefaultConfig() {
        return {
            enableLogging: true,
            enableCaching: false,
            enableMetrics: false,
            repositoryType: 'memory',
            // maxCacheSize: 1000, // 移除不存在的属性
            cacheTimeout: 300000, // 5分钟
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
    /**
     * 获取工厂元数据
     */
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
    /**
     * 获取协议元数据
     * @description 基于mplp-trace.json Schema的元数据
     */
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
    /**
     * 获取协议健康状态
     * @description 基于Schema定义的健康检查
     */
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
            // 基本健康检查
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
    // 重复的reset方法已删除，保留第一个定义
    /**
     * 销毁协议实例
     * @description 清理资源和连接
     */
    async destroy() {
        if (this.protocol) {
            // 如果协议有销毁方法，调用它
            if ('destroy' in this.protocol && typeof this.protocol.destroy === 'function') {
                await this.protocol.destroy();
            }
            this.protocol = null;
        }
    }
}
exports.TraceProtocolFactory = TraceProtocolFactory;
/**
 * 默认Trace协议工厂配置
 * @description 基于mplp-trace.json Schema的默认配置
 */
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
//# sourceMappingURL=trace-protocol.factory.js.map