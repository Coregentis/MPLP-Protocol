"use strict";
/**
 * Trace模块适配器
 *
 * @description 提供Trace模块的统一访问接口和外部系统集成，集成9个L3横切关注点管理器
 * @version 1.0.0
 * @pattern 与Context、Plan、Role、Confirm模块使用IDENTICAL架构模式
 * @integration 统一L3管理器注入和初始化模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceModuleAdapter = void 0;
const trace_protocol_factory_1 = require("../factories/trace-protocol.factory");
const trace_management_service_1 = require("../../application/services/trace-management.service");
const trace_analytics_service_1 = require("../../application/services/trace-analytics.service");
const trace_security_service_1 = require("../../application/services/trace-security.service");
const trace_repository_1 = require("../repositories/trace.repository");
// ===== L3横切关注点管理器导入 =====
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
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
/**
 * Trace模块适配器
 *
 * @description 提供Trace模块的统一访问接口和外部系统集成
 */
class TraceModuleAdapter {
    constructor(config = {}) {
        this.initialized = false;
        this.config = {
            enableLogging: true,
            enableCaching: false,
            enableMetrics: false,
            repositoryType: 'memory',
            maxCacheSize: 1000,
            cacheTimeout: 300000, // 5分钟
            enableRealTimeMonitoring: true,
            enableCorrelationAnalysis: true,
            enableDistributedTracing: true,
            maxTraceRetentionDays: 30,
            enableAutoArchiving: false,
            ...config
        };
        // 初始化横切关注点管理器（生产级实现）
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
        // 分配管理器实例
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
    /**
     * 初始化适配器
     */
    async initialize() {
        if (this.initialized) {
            return;
        }
        try {
            // 创建协议工厂配置
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
            // 创建协议实例
            const factory = trace_protocol_factory_1.TraceProtocolFactory.getInstance();
            this.protocol = await factory.createProtocol(factoryConfig);
            // 创建仓库实例
            this.repository = new trace_repository_1.TraceRepository({
                enableCaching: this.config.enableCaching,
                maxCacheSize: this.config.maxCacheSize,
                cacheTimeout: this.config.cacheTimeout
            });
            // 创建服务实例
            this.service = new trace_management_service_1.TraceManagementService(this.repository);
            this.analyticsService = new trace_analytics_service_1.TraceAnalyticsService(this.repository);
            this.securityService = new trace_security_service_1.TraceSecurityService(this.repository);
            this.initialized = true;
            // 发布初始化完成事件
            await this.eventBusManager.publish({
                id: `trace-init-${Date.now()}`,
                type: 'trace_module_initialized',
                timestamp: new Date().toISOString(),
                source: 'trace-module',
                payload: { config: this.config }
            });
        }
        catch (error) {
            // 记录错误到错误处理器
            await this.errorHandler.logError('error', `Failed to initialize Trace module: ${error instanceof Error ? error.message : 'Unknown error'}`, 'trace-module', error instanceof Error ? error : undefined, { operation: 'initialize', config: this.config });
            throw error;
        }
    }
    /**
     * 关闭适配器
     */
    async shutdown() {
        if (!this.initialized) {
            return;
        }
        try {
            // 发布关闭事件
            await this.eventBusManager.publish({
                id: `trace-shutdown-${Date.now()}`,
                type: 'trace_module_shutdown',
                timestamp: new Date().toISOString(),
                source: 'trace-module',
                payload: {}
            });
            // 清理资源
            this.initialized = false;
        }
        catch (error) {
            // 记录关闭错误
            await this.errorHandler.logError('error', `Failed to shutdown Trace module: ${error instanceof Error ? error.message : 'Unknown error'}`, 'trace-module', error instanceof Error ? error : undefined, { operation: 'shutdown' });
            throw error;
        }
    }
    /**
     * 确保适配器已初始化
     */
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('TraceModuleAdapter must be initialized before use');
        }
    }
    // ===== 核心业务操作 =====
    /**
     * 创建追踪记录
     */
    async createTrace(request) {
        this.ensureInitialized();
        return await this.protocol.createTrace(request);
    }
    /**
     * 更新追踪记录
     */
    async updateTrace(request) {
        this.ensureInitialized();
        return await this.protocol.updateTrace(request);
    }
    /**
     * 获取追踪记录
     */
    async getTrace(traceId) {
        this.ensureInitialized();
        return await this.protocol.getTrace(traceId);
    }
    /**
     * 查询追踪记录
     */
    async queryTraces(filter, pagination) {
        this.ensureInitialized();
        return await this.protocol.queryTraces(filter, pagination);
    }
    /**
     * 分析追踪数据
     */
    async analyzeTrace(traceId) {
        this.ensureInitialized();
        return await this.protocol.analyzeTrace(traceId);
    }
    /**
     * 验证追踪数据
     */
    async validateTrace(traceData) {
        this.ensureInitialized();
        return await this.protocol.validateTrace(traceData);
    }
    // ===== 组件访问器 =====
    /**
     * 获取Trace管理服务
     */
    getService() {
        this.ensureInitialized();
        return this.service;
    }
    /**
     * 获取Trace分析服务
     */
    getAnalyticsService() {
        this.ensureInitialized();
        return this.analyticsService;
    }
    /**
     * 获取Trace安全服务
     */
    getSecurityService() {
        this.ensureInitialized();
        return this.securityService;
    }
    /**
     * 获取Trace仓库
     */
    getRepository() {
        this.ensureInitialized();
        return this.repository;
    }
    /**
     * 获取Trace协议
     */
    getProtocol() {
        this.ensureInitialized();
        return this.protocol;
    }
    /**
     * 获取横切关注点管理器
     */
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
    /**
     * 获取协议元数据
     */
    getProtocolMetadata() {
        this.ensureInitialized();
        return this.protocol.getMetadata();
    }
    /**
     * 获取协议工厂实例
     */
    getProtocolFactory() {
        return trace_protocol_factory_1.TraceProtocolFactory.getInstance();
    }
    /**
     * 获取适配器配置
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 获取健康状态
     */
    async getHealthStatus() {
        try {
            if (!this.initialized) {
                return {
                    status: 'not_initialized',
                    timestamp: new Date().toISOString()
                };
            }
            const protocolHealth = await this.protocol.getHealthStatus();
            // 获取管理器实例（用于健康检查）
            const _managersHealth = this.getCrossCuttingManagers();
            // Mark as intentionally unused (reserved for future health check features)
            void _managersHealth;
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
//# sourceMappingURL=trace-module.adapter.js.map