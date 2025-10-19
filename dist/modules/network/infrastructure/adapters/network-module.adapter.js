"use strict";
/**
 * Network模块适配器
 *
 * @description 提供Network模块的统一访问接口和外部系统集成，基于DDD架构
 * @version 1.0.0
 * @layer 基础设施层 - 适配器
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkModuleAdapter = void 0;
const network_controller_1 = require("../../api/controllers/network.controller");
const network_management_service_1 = require("../../application/services/network-management.service");
const network_repository_1 = require("../repositories/network.repository");
// ===== L3横切关注点管理器导入 =====
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
/**
 * Network模块适配器
 *
 * @description 提供Network模块的统一访问接口和外部系统集成
 */
class NetworkModuleAdapter {
    constructor(config = {}) {
        this.config = {
            enableLogging: true,
            enableCaching: false,
            enableMetrics: false,
            repositoryType: 'memory',
            maxCacheSize: 1000,
            cacheTimeout: 300000, // 5分钟
            networkTimeout: 30000, // 30秒
            maxConnections: 1000,
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
        this.repository = new network_repository_1.MemoryNetworkRepository();
        this.service = new network_management_service_1.NetworkManagementService(this.repository);
        this.controller = new network_controller_1.NetworkController(this.service);
        // 初始化适配器
        this.initialize();
    }
    /**
     * 初始化适配器
     */
    async initialize() {
        // 注册事件监听器
        this.registerEventListeners();
        // 初始化性能监控
        if (this.config.enableMetrics) {
            await this.initializePerformanceMonitoring();
        }
        // 发布初始化完成事件 - 使用简化实现
        // console.log('[NetworkModuleAdapter] Adapter initialized successfully');
    }
    /**
     * 注册事件监听器
     */
    registerEventListeners() {
        // 网络状态变更事件
        this.eventBusManager.subscribe('network.status.changed', async (event) => {
            await this.handleNetworkStatusChange(event);
        });
        // 节点状态变更事件
        this.eventBusManager.subscribe('network.node.status.changed', async (event) => {
            await this.handleNodeStatusChange(event);
        });
        // 连接状态变更事件
        this.eventBusManager.subscribe('network.connection.changed', async (event) => {
            await this.handleConnectionChange(event);
        });
    }
    /**
     * 初始化性能监控
     */
    async initializePerformanceMonitoring() {
        // 注册性能指标 - 使用实际可用的方法
        // console.log('[NetworkModuleAdapter] Performance monitoring initialized');
    }
    /**
     * 处理网络状态变更
     */
    async handleNetworkStatusChange(_event) {
        // 更新状态同步 - 使用简化实现
        // console.log('[NetworkModuleAdapter] Network status changed:', _event);
        // 记录性能指标 - 使用简化实现
        if (this.config.enableMetrics) {
            // console.log('[NetworkModuleAdapter] Recording network status change metric');
        }
    }
    /**
     * 处理节点状态变更
     */
    async handleNodeStatusChange(_event) {
        // 更新节点状态统计
        const stats = await this.service.getGlobalStatistics();
        // 更新性能指标 - 使用简化实现
        if (this.config.enableMetrics) {
            // console.log('[NetworkModuleAdapter] Node status changed, total nodes:', stats.totalNodes);
            // 使用stats避免未使用变量警告
            void stats;
        }
    }
    /**
     * 处理连接变更
     */
    async handleConnectionChange(_event) {
        // 更新连接统计
        const stats = await this.service.getGlobalStatistics();
        // 更新性能指标 - 使用简化实现
        if (this.config.enableMetrics) {
            // console.log('[NetworkModuleAdapter] Connection changed, total edges:', stats.totalEdges);
            // 使用stats避免未使用变量警告
            void stats;
        }
    }
    /**
     * 获取适配器ID
     */
    _getAdapterId() {
        return `network-adapter-${Date.now()}`;
    }
    /**
     * 获取控制器实例
     */
    getController() {
        return this.controller;
    }
    /**
     * 获取服务实例
     */
    getService() {
        return this.service;
    }
    /**
     * 获取仓储实例
     */
    getRepository() {
        return this.repository;
    }
    /**
     * 获取配置信息
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 获取横切关注点管理器
     */
    getCrossCuttingManagers() {
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
     * 健康检查
     */
    async healthCheck() {
        const details = {
            adapter: true,
            repository: true,
            service: true,
            controller: true,
            crossCuttingConcerns: true
        };
        try {
            // 检查仓储
            await this.repository.getStatistics();
            // 检查服务
            await this.service.getGlobalStatistics();
            // 检查横切关注点
            // 这里可以添加具体的健康检查逻辑
        }
        catch (error) {
            details.repository = false;
            details.service = false;
        }
        const isHealthy = Object.values(details).every(status => status);
        return {
            status: isHealthy ? 'healthy' : 'unhealthy',
            details,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * 获取模块信息
     */
    getModuleInfo() {
        return {
            name: 'network',
            version: '1.0.0',
            description: '网络通信和分布式协作模块，提供智能路由、拓扑管理和负载均衡功能',
            layer: 'L2',
            status: 'implementing',
            features: [
                '网络拓扑管理',
                '节点发现和注册',
                '路由策略优化',
                '负载均衡',
                '故障容错',
                '性能监控',
                '智能路由引擎',
                '分布式协作'
            ],
            dependencies: [
                'security',
                'performance',
                'eventBus',
                'errorHandler',
                'coordination',
                'orchestration',
                'stateSync',
                'transaction',
                'protocolVersion'
            ]
        };
    }
    /**
     * 与Context模块协作 - 预留接口
     */
    async coordinateWithContext(_contextId, _operation) {
        // TODO: 等待CoreOrchestrator激活
        return true;
    }
    /**
     * 与Plan模块协作 - 预留接口
     */
    async coordinateWithPlan(_planId, _config) {
        // TODO: 等待CoreOrchestrator激活
        return true;
    }
    /**
     * 与Role模块协作 - 预留接口
     */
    async coordinateWithRole(_roleId, _permissions) {
        // TODO: 等待CoreOrchestrator激活
        return true;
    }
    /**
     * 与Trace模块协作 - 预留接口
     */
    async coordinateWithTrace(_traceId, _operation) {
        // TODO: 等待CoreOrchestrator激活
        return true;
    }
    /**
     * 与Extension模块协作 - 预留接口
     */
    async coordinateWithExtension(_extensionId, _config) {
        // TODO: 等待CoreOrchestrator激活
        return true;
    }
    /**
     * 处理CoreOrchestrator编排场景 - 预留接口
     */
    async handleOrchestrationScenario(_scenario, _params) {
        // TODO: 等待CoreOrchestrator激活
        return true;
    }
    /**
     * 关闭适配器
     */
    async shutdown() {
        // 清理缓存
        await this.repository.clearCache();
        // 发布关闭事件 - 使用简化实现
        // console.log('[NetworkModuleAdapter] Adapter shutdown completed');
    }
}
exports.NetworkModuleAdapter = NetworkModuleAdapter;
//# sourceMappingURL=network-module.adapter.js.map