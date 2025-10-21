"use strict";
/**
 * Core模块适配器
 *
 * @description 基于Context、Plan、Role、Confirm等模块的企业级标准，提供Core模块的统一访问接口和外部系统集成
 * @version 1.0.0
 * @layer 基础设施层 - 适配器
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的适配器模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreModuleAdapter = void 0;
const core_repository_1 = require("../repositories/core.repository");
const core_management_service_1 = require("../../application/services/core-management.service");
const core_monitoring_service_1 = require("../../application/services/core-monitoring.service");
const core_orchestration_service_1 = require("../../application/services/core-orchestration.service");
const core_resource_service_1 = require("../../application/services/core-resource.service");
const core_reserved_interfaces_service_1 = require("../../application/services/core-reserved-interfaces.service");
const core_services_coordinator_1 = require("../../application/coordinators/core-services-coordinator");
const core_protocol_factory_1 = require("../factories/core-protocol.factory");
// ===== L3横切关注点管理器导入 =====
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
/**
 * Core模块适配器
 *
 * @description 统一协调Core模块的5个核心服务，实现完整的工作流生命周期管理和MPLP协议集成
 */
class CoreModuleAdapter {
    constructor(config = {}) {
        this.initialized = false;
        this.config = {
            enableLogging: true,
            enableCaching: false,
            enableMetrics: false,
            repositoryType: 'memory',
            maxCacheSize: 1000,
            cacheTimeout: 300000, // 5分钟
            enableCoordination: true,
            enableReservedInterfaces: true,
            ...config
        };
        // 异步初始化
        this.initialize();
    }
    /**
     * 初始化适配器
     */
    async initialize() {
        // 初始化横切关注点管理器
        this.crossCuttingFactory = cross_cutting_concerns_1.CrossCuttingConcernsFactory.getInstance();
        const managers = this.crossCuttingFactory.createManagers({
            security: { enabled: true },
            performance: { enabled: this.config.enableMetrics },
            eventBus: { enabled: true },
            errorHandler: { enabled: true },
            coordination: { enabled: this.config.enableCoordination },
            orchestration: { enabled: true },
            stateSync: { enabled: true },
            transaction: { enabled: true },
            protocolVersion: { enabled: true }
        });
        this._securityManager = managers.security;
        this._performanceMonitor = managers.performance;
        this._eventBusManager = managers.eventBus;
        this._errorHandler = managers.errorHandler;
        this._coordinationManager = managers.coordination;
        this._orchestrationManager = managers.orchestration;
        this._stateSyncManager = managers.stateSync;
        this._transactionManager = managers.transaction;
        this._protocolVersionManager = managers.protocolVersion;
        // Mark managers as intentionally initialized for future use
        void this._securityManager;
        void this._performanceMonitor;
        void this._eventBusManager;
        void this._errorHandler;
        void this._coordinationManager;
        void this._orchestrationManager;
        void this._stateSyncManager;
        void this._transactionManager;
        void this._protocolVersionManager;
        // 初始化核心组件
        this.repository = new core_repository_1.MemoryCoreRepository();
        this.managementService = new core_management_service_1.CoreManagementService(this.repository);
        this.monitoringService = new core_monitoring_service_1.CoreMonitoringService(this.repository);
        this.orchestrationService = new core_orchestration_service_1.CoreOrchestrationService(this.repository);
        this.resourceService = new core_resource_service_1.CoreResourceService(this.repository);
        if (this.config.enableReservedInterfaces) {
            this.reservedInterfacesService = new core_reserved_interfaces_service_1.CoreReservedInterfacesService();
        }
        if (this.config.enableCoordination) {
            this.coordinator = new core_services_coordinator_1.CoreServicesCoordinator(this.managementService, this.monitoringService, this.orchestrationService, this.resourceService, this.repository, this.config.enableLogging ? console : undefined);
        }
        // 初始化协议
        await this.initializeProtocol();
    }
    /**
     * 初始化协议
     */
    async initializeProtocol() {
        const protocolFactory = core_protocol_factory_1.CoreProtocolFactory.getInstance();
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
            throw new Error('CoreModuleAdapter not initialized. Please wait for initialization to complete.');
        }
    }
    /**
     * 获取所有组件
     */
    getComponents() {
        this.ensureInitialized();
        return {
            repository: this.repository,
            managementService: this.managementService,
            monitoringService: this.monitoringService,
            orchestrationService: this.orchestrationService,
            resourceService: this.resourceService,
            reservedInterfacesService: this.reservedInterfacesService,
            coordinator: this.coordinator,
            protocol: this.protocol,
            adapter: this
        };
    }
    /**
     * 获取仓库实例
     */
    getRepository() {
        this.ensureInitialized();
        return this.repository;
    }
    /**
     * 获取管理服务
     */
    getManagementService() {
        this.ensureInitialized();
        return this.managementService;
    }
    /**
     * 获取服务协调器
     */
    getCoordinator() {
        this.ensureInitialized();
        if (!this.coordinator) {
            throw new Error('Coordinator not enabled. Set enableCoordination: true in config.');
        }
        return this.coordinator;
    }
    /**
     * 获取预留接口服务
     */
    getReservedInterfacesService() {
        this.ensureInitialized();
        if (!this.reservedInterfacesService) {
            throw new Error('Reserved interfaces not enabled. Set enableReservedInterfaces: true in config.');
        }
        return this.reservedInterfacesService;
    }
    /**
     * 获取协议实例
     */
    getProtocol() {
        this.ensureInitialized();
        return this.protocol;
    }
    /**
     * 创建Core工作流
     */
    async createWorkflow(data) {
        this.ensureInitialized();
        return await this.managementService.createWorkflow(data);
    }
    /**
     * 协调创建工作流（使用协调器）
     */
    async createWorkflowWithCoordination(params) {
        this.ensureInitialized();
        if (!this.coordinator) {
            throw new Error('Coordinator not enabled');
        }
        return await this.coordinator.createWorkflowWithFullCoordination(params);
    }
    /**
     * 获取健康状态
     */
    async getHealthStatus() {
        const timestamp = new Date().toISOString();
        try {
            this.ensureInitialized();
            const components = {
                repository: await this.checkRepositoryHealth(),
                managementService: true,
                monitoringService: true,
                orchestrationService: true,
                resourceService: true,
                coordinator: !!this.coordinator,
                protocol: !!this.protocol,
                crossCuttingConcerns: !!this.crossCuttingFactory
            };
            const healthyCount = Object.values(components).filter(Boolean).length;
            const totalCount = Object.keys(components).length;
            let status;
            if (healthyCount === totalCount) {
                status = 'healthy';
            }
            else if (healthyCount > totalCount / 2) {
                status = 'degraded';
            }
            else {
                status = 'unhealthy';
            }
            return {
                status,
                components,
                timestamp
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                components: {
                    repository: false,
                    managementService: false,
                    monitoringService: false,
                    orchestrationService: false,
                    resourceService: false,
                    coordinator: false,
                    protocol: false,
                    crossCuttingConcerns: false
                },
                timestamp
            };
        }
    }
    /**
     * 获取模块信息
     */
    getModuleInfo() {
        return {
            name: 'core',
            version: '1.0.0',
            description: 'MPLP核心工作流协调和执行模块',
            layer: 'L2',
            status: 'implementing',
            features: [
                '工作流管理',
                '执行协调',
                '资源管理',
                '性能监控',
                '模块协作',
                '预留接口',
                '服务协调',
                '审计追踪',
                '版本历史',
                '搜索索引',
                '缓存策略',
                '事件集成'
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
    // ===== 私有辅助方法 =====
    /**
     * 检查仓库健康状态
     */
    async checkRepositoryHealth() {
        try {
            await this.repository.count();
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.CoreModuleAdapter = CoreModuleAdapter;
//# sourceMappingURL=core-module.adapter.js.map