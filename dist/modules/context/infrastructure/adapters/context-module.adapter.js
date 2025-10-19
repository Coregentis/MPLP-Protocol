"use strict";
/**
 * Context模块适配器
 *
 * @description Context模块的基础设施适配器，提供外部系统集成
 * @version 1.0.0
 * @layer 基础设施层 - 适配器
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextModuleAdapter = void 0;
const context_management_service_1 = require("../../application/services/context-management.service");
const context_repository_1 = require("../repositories/context.repository");
const context_controller_1 = require("../../api/controllers/context.controller");
const context_mapper_1 = require("../../api/mappers/context.mapper");
const context_protocol_js_1 = require("../protocols/context.protocol.js");
const context_protocol_factory_js_1 = require("../factories/context-protocol.factory.js");
// ===== L3横切关注点管理器导入 =====
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
/**
 * Context模块适配器
 *
 * @description 提供Context模块的统一访问接口和外部系统集成
 */
class ContextModuleAdapter {
    constructor(config = {}) {
        this.isInitialized = false;
        this.config = {
            enableLogging: true,
            enableCaching: false,
            enableMetrics: false,
            repositoryType: 'memory',
            maxCacheSize: 1000,
            cacheTimeout: 300000, // 5分钟
            ...config
        };
        // 初始化横切关注点管理器
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
        // 初始化核心依赖 (简化实现)
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
        // 初始化核心组件
        this.repository = new context_repository_1.MemoryContextRepository();
        this.service = new context_management_service_1.ContextManagementService(this.repository, this.logger, this.cacheManager, this.versionManager);
        this.controller = new context_controller_1.ContextController(this.service);
        // 初始化协议 (需要添加缺失的两个服务)
        // 创建简化的analytics和security服务
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
    // ===== 初始化和生命周期管理 =====
    /**
     * 初始化模块适配器
     */
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            // 执行健康检查
            const isHealthy = await this.repository.healthCheck();
            if (!isHealthy) {
                throw new Error('Repository health check failed');
            }
            this.isInitialized = true;
            if (this.config.enableLogging) {
                // TODO: 使用适当的日志机制
                void 'Context module adapter initialized successfully';
            }
        }
        catch (error) {
            throw new Error(`Failed to initialize Context module adapter: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * 关闭模块适配器
     */
    async shutdown() {
        if (!this.isInitialized) {
            return;
        }
        try {
            // 清理资源
            await this.repository.clearCache();
            this.isInitialized = false;
            if (this.config.enableLogging) {
                // TODO: 使用适当的日志机制
                void 'Context module adapter shut down successfully';
            }
        }
        catch (error) {
            if (this.config.enableLogging) {
                // TODO: 使用适当的错误处理机制
                void error;
            }
        }
    }
    // ===== 公共API接口 =====
    /**
     * 获取控制器实例
     */
    getController() {
        this.ensureInitialized();
        return this.controller;
    }
    /**
     * 获取服务实例
     */
    getService() {
        this.ensureInitialized();
        return this.service;
    }
    /**
     * 获取仓库实例
     */
    getRepository() {
        this.ensureInitialized();
        return this.repository;
    }
    // ===== 便捷方法 =====
    /**
     * 创建Context
     */
    async createContext(request) {
        this.ensureInitialized();
        return await this.service.createContext(request);
    }
    /**
     * 获取Context
     */
    async getContext(contextId) {
        this.ensureInitialized();
        return await this.service.getContextById(contextId);
    }
    /**
     * 更新Context
     */
    async updateContext(contextId, request) {
        this.ensureInitialized();
        return await this.service.updateContext(contextId, request);
    }
    /**
     * 删除Context
     */
    async deleteContext(contextId) {
        this.ensureInitialized();
        await this.service.deleteContext(contextId);
        return true;
    }
    /**
     * 搜索Context
     */
    async searchContexts(namePattern) {
        this.ensureInitialized();
        const result = await this.service.searchContexts(namePattern);
        return result.data;
    }
    // ===== 数据转换方法 =====
    /**
     * 实体数据转换为Schema格式
     */
    entityToSchema(entity) {
        return context_mapper_1.ContextMapper.toSchema(entity);
    }
    /**
     * Schema格式转换为实体数据
     */
    schemaToEntity(schema) {
        return context_mapper_1.ContextMapper.fromSchema(schema);
    }
    /**
     * 验证Schema格式
     */
    validateSchema(data) {
        return context_mapper_1.ContextMapper.validateSchema(data);
    }
    /**
     * 验证映射一致性
     */
    validateMappingConsistency(entity, schema) {
        return context_mapper_1.ContextMapper.validateMappingConsistency(entity, schema);
    }
    // ===== 监控和统计 =====
    /**
     * 获取模块统计信息
     */
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
    /**
     * 健康检查
     */
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
    // ===== 配置管理 =====
    /**
     * 获取当前配置
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (this.config.enableLogging) {
            // TODO: 使用适当的日志机制
            void newConfig;
        }
    }
    // ===== 私有辅助方法 =====
    /**
     * 确保适配器已初始化
     */
    ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error('Context module adapter is not initialized. Call initialize() first.');
        }
    }
    // ===== 协议访问方法 =====
    /**
     * 获取Context协议实例
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
        return context_protocol_factory_js_1.ContextProtocolFactory.getInstance();
    }
    /**
     * 通过工厂创建新的协议实例
     */
    async createProtocolFromFactory(config) {
        const factory = context_protocol_factory_js_1.ContextProtocolFactory.getInstance();
        return await factory.createProtocol(config);
    }
}
exports.ContextModuleAdapter = ContextModuleAdapter;
//# sourceMappingURL=context-module.adapter.js.map