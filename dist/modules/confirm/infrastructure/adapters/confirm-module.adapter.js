"use strict";
/**
 * Confirm模块适配器
 *
 * @description 基于Context和Plan模块的企业级标准，提供Confirm模块的统一访问接口和外部系统集成
 * @version 1.0.0
 * @layer 基础设施层 - 适配器
 * @integration 统一L3管理器注入模式，与Context/Plan模块IDENTICAL架构
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmModuleAdapter = void 0;
const confirm_controller_1 = require("../../api/controllers/confirm.controller");
const confirm_management_service_1 = require("../../application/services/confirm-management.service");
const confirm_repository_1 = require("../repositories/confirm.repository");
const confirm_protocol_factory_1 = require("../factories/confirm-protocol.factory");
// ===== L3横切关注点管理器导入 =====
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
/**
 * Confirm模块适配器
 *
 * @description 基于Context和Plan模块的企业级标准，提供Confirm模块的统一访问接口和外部系统集成
 */
class ConfirmModuleAdapter {
    constructor(config = {}) {
        this.initialized = false;
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
        // 初始化核心组件
        this.repository = new confirm_repository_1.MemoryConfirmRepository();
        this.service = new confirm_management_service_1.ConfirmManagementService(this.repository);
        this.controller = new confirm_controller_1.ConfirmController(this.service);
        // 初始化协议
        this.initializeProtocol();
    }
    /**
     * 初始化协议
     */
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
    /**
     * 确保适配器已初始化
     */
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('ConfirmModuleAdapter not initialized. Please wait for initialization to complete.');
        }
    }
    /**
     * 获取Confirm控制器
     */
    getController() {
        this.ensureInitialized();
        return this.controller;
    }
    /**
     * 获取Confirm管理服务
     */
    getService() {
        this.ensureInitialized();
        return this.service;
    }
    /**
     * 获取Confirm仓库
     */
    getRepository() {
        this.ensureInitialized();
        return this.repository;
    }
    /**
     * 获取Confirm协议
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
        return confirm_protocol_factory_1.ConfirmProtocolFactory.getInstance();
    }
    /**
     * 健康检查
     */
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
    /**
     * 获取适配器统计信息
     */
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
    /**
     * 关闭适配器
     */
    async shutdown() {
        try {
            // TODO: 实现优雅关闭逻辑
            this.initialized = false;
        }
        catch (error) {
            if (this.config.enableLogging) {
                // TODO: 使用统一的日志管理器替代console
                // this.logger.error('Error during ConfirmModuleAdapter shutdown:', error);
            }
            throw error;
        }
    }
}
exports.ConfirmModuleAdapter = ConfirmModuleAdapter;
//# sourceMappingURL=confirm-module.adapter.js.map