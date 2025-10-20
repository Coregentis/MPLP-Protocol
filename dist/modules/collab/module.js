"use strict";
/**
 * Collab模块配置
 *
 * @description Collab模块的核心配置和依赖注入，与其他6个已完成模块保持IDENTICAL架构
 * @version 1.0.0
 * @author MPLP Development Team
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollabModule = void 0;
const collab_management_service_1 = require("./application/services/collab-management.service");
const collab_coordination_service_1 = require("./domain/services/collab-coordination.service");
const collab_repository_impl_1 = require("./infrastructure/repositories/collab.repository.impl");
const collab_module_adapter_1 = require("./infrastructure/adapters/collab-module.adapter");
const collab_protocol_factory_1 = require("./infrastructure/factories/collab-protocol.factory");
const collab_controller_1 = require("./api/controllers/collab.controller");
// ===== L3横切关注点管理器导入 =====
const cross_cutting_concerns_1 = require("../../core/protocols/cross-cutting-concerns");
/**
 * Collab模块类
 *
 * @description 管理Collab模块的生命周期和依赖注入，遵循其他6个模块的IDENTICAL架构模式
 */
class CollabModule {
    constructor() {
        this.initializeConfig();
        this.initializeL3Managers();
        this.initializeServices();
        // Infrastructure initialization is now async and called during start()
    }
    /**
     * 获取模块单例实例
     */
    static getInstance() {
        if (!CollabModule.instance) {
            CollabModule.instance = new CollabModule();
        }
        return CollabModule.instance;
    }
    /**
     * 初始化模块配置
     */
    initializeConfig() {
        this.config = {
            maxParticipants: 100,
            defaultCoordinationType: 'distributed',
            defaultDecisionMaking: 'consensus',
            performanceThresholds: {
                maxCoordinationLatency: 1000, // ms
                minSuccessRate: 0.95,
                maxErrorRate: 0.05
            },
            auditSettings: {
                enabled: true,
                retentionDays: 365
            }
        };
    }
    /**
     * 初始化L3横切关注点管理器
     *
     * @description 与其他6个模块保持IDENTICAL的L3管理器注入模式
     */
    initializeL3Managers() {
        // TODO: 这些管理器将在CoreOrchestrator激活时被注入
        // 当前使用占位符实现
        this._securityManager = new cross_cutting_concerns_1.MLPPSecurityManager();
        this._performanceMonitor = new cross_cutting_concerns_1.MLPPPerformanceMonitor();
        this._eventBusManager = new cross_cutting_concerns_1.MLPPEventBusManager();
        this._errorHandler = new cross_cutting_concerns_1.MLPPErrorHandler();
        this._coordinationManager = new cross_cutting_concerns_1.MLPPCoordinationManager();
        this._orchestrationManager = new cross_cutting_concerns_1.MLPPOrchestrationManager();
        this._stateSyncManager = new cross_cutting_concerns_1.MLPPStateSyncManager();
        this._transactionManager = new cross_cutting_concerns_1.MLPPTransactionManager();
        this._protocolVersionManager = new cross_cutting_concerns_1.MLPPProtocolVersionManager();
    }
    /**
     * 初始化核心服务
     */
    initializeServices() {
        // 初始化仓库
        this.collabRepository = new collab_repository_impl_1.CollabRepositoryImpl();
        // 初始化领域服务
        this.collabCoordinationService = new collab_coordination_service_1.CollabCoordinationService();
        // 初始化应用服务
        // 创建临时Mock实现以满足重构后的依赖注入要求
        const mockMemberManager = {}; // TODO: 实现真正的MemberManager
        const mockTaskAllocator = {}; // TODO: 实现真正的TaskAllocator
        const mockLogger = {}; // TODO: 实现真正的Logger
        this.collabManagementService = new collab_management_service_1.CollabManagementService(this.collabRepository, mockMemberManager, mockTaskAllocator, mockLogger);
    }
    /**
     * 初始化基础设施组件
     */
    async initializeInfrastructure() {
        // 初始化模块适配器
        this.collabModuleAdapter = new collab_module_adapter_1.CollabModuleAdapter(this.collabManagementService);
        // 使用工厂创建协议实例
        const protocolFactory = collab_protocol_factory_1.CollabProtocolFactory.getInstance();
        const protocolConfig = collab_protocol_factory_1.CollabProtocolFactory.getDefaultConfig();
        this.collabProtocol = await protocolFactory.createProtocol(protocolConfig);
        // 初始化控制器
        this.collabController = new collab_controller_1.CollabController(this.collabManagementService);
    }
    // ===== 公共访问器 =====
    /**
     * 获取Collab管理服务
     */
    getCollabManagementService() {
        return this.collabManagementService;
    }
    /**
     * 获取Collab协调服务
     */
    getCollabCoordinationService() {
        return this.collabCoordinationService;
    }
    /**
     * 获取Collab仓库
     */
    getCollabRepository() {
        return this.collabRepository;
    }
    /**
     * 获取Collab模块适配器
     */
    getCollabModuleAdapter() {
        return this.collabModuleAdapter;
    }
    /**
     * 获取Collab协议
     */
    getCollabProtocol() {
        return this.collabProtocol;
    }
    /**
     * 获取Collab控制器
     */
    getCollabController() {
        return this.collabController;
    }
    /**
     * 获取模块配置
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * 更新模块配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    // ===== 模块生命周期管理 =====
    /**
     * 启动模块
     */
    async start() {
        // 初始化基础设施组件
        await this.initializeInfrastructure();
        // TODO: L3管理器启动逻辑将在CoreOrchestrator激活时实现
        // Collab module started successfully
    }
    /**
     * 停止模块
     */
    async stop() {
        // TODO: L3管理器停止逻辑将在CoreOrchestrator激活时实现
        // Collab module stopped successfully
    }
    /**
     * 重启模块
     */
    async restart() {
        await this.stop();
        await this.start();
    }
    /**
     * 模块健康检查
     */
    async healthCheck() {
        try {
            const protocolHealth = await this.collabProtocol.healthCheck();
            return {
                status: protocolHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
                details: {
                    protocol: protocolHealth,
                    config: this.config,
                    services: {
                        managementService: 'healthy',
                        coordinationService: 'healthy',
                        repository: 'healthy'
                    }
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                details: {
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            };
        }
    }
}
exports.CollabModule = CollabModule;
// ===== 默认导出 =====
exports.default = CollabModule;
//# sourceMappingURL=module.js.map