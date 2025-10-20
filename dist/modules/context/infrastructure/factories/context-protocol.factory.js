"use strict";
/**
 * Context协议工厂
 *
 * @description Context模块的协议工厂实现，提供标准化的协议创建和依赖注入
 * @version 1.0.0
 * @layer 基础设施层 - 工厂
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextProtocolFactory = void 0;
const context_protocol_js_1 = require("../protocols/context.protocol.js");
const context_management_service_js_1 = require("../../application/services/context-management.service.js");
const context_repository_js_1 = require("../repositories/context.repository.js");
const factory_js_1 = require("../../../../core/protocols/cross-cutting-concerns/factory.js");
/**
 * Context协议工厂
 *
 * @description 提供Context协议的标准化创建和配置
 */
class ContextProtocolFactory {
    constructor() {
        this.protocol = null;
    }
    /**
     * 获取工厂单例实例
     */
    static getInstance() {
        if (!ContextProtocolFactory.instance) {
            ContextProtocolFactory.instance = new ContextProtocolFactory();
        }
        return ContextProtocolFactory.instance;
    }
    /**
     * 创建Context协议实例
     */
    async createProtocol(config = {}) {
        if (this.protocol) {
            return this.protocol;
        }
        // 创建横切关注点管理器
        const crossCuttingFactory = factory_js_1.CrossCuttingConcernsFactory.getInstance();
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
        // 创建核心组件
        const repository = new context_repository_js_1.MemoryContextRepository();
        // 创建简化的依赖
        const logger = { debug: () => { }, info: () => { }, warn: () => { }, error: () => { } };
        const cacheManager = { get: async () => null, set: async () => { }, delete: async () => { }, clear: async () => { } };
        const versionManager = {
            createVersion: async () => '1.0.0',
            getVersionHistory: async () => [],
            getVersion: async () => null,
            compareVersions: async () => ({ added: {}, modified: {}, removed: [] })
        };
        const contextManagementService = new context_management_service_js_1.ContextManagementService(repository, logger, cacheManager, versionManager);
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
        // 创建协议实例
        this.protocol = new context_protocol_js_1.ContextProtocol(contextManagementService, analyticsService, securityService, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion);
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
     * 创建协议实例（静态方法）
     */
    static async create(config = {}) {
        const factory = ContextProtocolFactory.getInstance();
        return await factory.createProtocol(config);
    }
    /**
     * 获取协议元数据（静态方法）
     */
    static async getMetadata() {
        const factory = ContextProtocolFactory.getInstance();
        const protocol = factory.getProtocol();
        if (protocol) {
            return protocol.getProtocolMetadata();
        }
        // 如果协议还未创建，创建一个临时实例获取元数据
        const tempProtocol = await factory.createProtocol();
        return tempProtocol.getProtocolMetadata();
    }
    /**
     * 健康检查（静态方法）
     */
    static async healthCheck() {
        const factory = ContextProtocolFactory.getInstance();
        const protocol = factory.getProtocol();
        if (protocol) {
            return await protocol.healthCheck();
        }
        // 如果协议还未创建，返回未初始化状态
        return {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            checks: [{
                    name: 'contextProtocol',
                    status: 'fail',
                    message: 'Context protocol not initialized'
                }]
        };
    }
}
exports.ContextProtocolFactory = ContextProtocolFactory;
//# sourceMappingURL=context-protocol.factory.js.map