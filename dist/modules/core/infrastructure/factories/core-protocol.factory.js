"use strict";
/**
 * Core协议工厂
 *
 * @description 基于Context、Plan、Role、Confirm等模块的企业级标准，创建Core协议实例
 * @version 1.0.0
 * @layer 基础设施层 - 协议工厂
 * @pattern 与Context、Plan、Role等模块使用IDENTICAL的协议工厂模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreProtocolFactory = void 0;
const core_protocol_1 = require("../protocols/core.protocol");
const core_repository_1 = require("../repositories/core.repository");
const core_management_service_1 = require("../../application/services/core-management.service");
const core_monitoring_service_1 = require("../../application/services/core-monitoring.service");
const core_orchestration_service_1 = require("../../application/services/core-orchestration.service");
const core_resource_service_1 = require("../../application/services/core-resource.service");
// ===== L3横切关注点管理器导入 =====
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
/**
 * Core协议工厂
 *
 * @description 单例工厂，负责创建和配置Core协议实例，集成所有必要的服务和横切关注点管理器
 */
class CoreProtocolFactory {
    constructor() {
        this.crossCuttingFactory = cross_cutting_concerns_1.CrossCuttingConcernsFactory.getInstance();
    }
    /**
     * 获取工厂单例实例
     */
    static getInstance() {
        if (!CoreProtocolFactory.instance) {
            CoreProtocolFactory.instance = new CoreProtocolFactory();
        }
        return CoreProtocolFactory.instance;
    }
    /**
     * 创建Core协议实例
     */
    async createProtocol(config = {}) {
        // 1. 创建或使用提供的仓库
        const repository = config.customRepository || this.createRepository(config.repositoryType || 'memory');
        // 2. 创建应用服务
        const managementService = new core_management_service_1.CoreManagementService(repository);
        const monitoringService = new core_monitoring_service_1.CoreMonitoringService(repository);
        const orchestrationService = new core_orchestration_service_1.CoreOrchestrationService(repository);
        const resourceService = new core_resource_service_1.CoreResourceService(repository);
        // 3. 创建横切关注点管理器
        const managers = this.crossCuttingFactory.createManagers({
            security: { enabled: true },
            performance: { enabled: config.enableMetrics || false },
            eventBus: { enabled: true },
            errorHandler: { enabled: true },
            coordination: { enabled: true },
            orchestration: { enabled: true },
            stateSync: { enabled: true },
            transaction: { enabled: true },
            protocolVersion: { enabled: true }
        });
        // 4. 创建协议实例
        const protocol = new core_protocol_1.CoreProtocol(managementService, monitoringService, orchestrationService, resourceService, repository, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion, config);
        return protocol;
    }
    /**
     * 创建带有自定义服务的协议实例
     */
    async createProtocolWithServices(managementService, monitoringService, orchestrationService, resourceService, repository, config = {}) {
        // 创建横切关注点管理器
        const managers = this.crossCuttingFactory.createManagers({
            security: { enabled: true },
            performance: { enabled: config.enableMetrics || false },
            eventBus: { enabled: true },
            errorHandler: { enabled: true },
            coordination: { enabled: true },
            orchestration: { enabled: true },
            stateSync: { enabled: true },
            transaction: { enabled: true },
            protocolVersion: { enabled: true }
        });
        // 创建协议实例
        const protocol = new core_protocol_1.CoreProtocol(managementService, monitoringService, orchestrationService, resourceService, repository, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion, config);
        return protocol;
    }
    /**
     * 创建轻量级协议实例（用于测试）
     */
    async createLightweightProtocol(config = {}) {
        // 1. 创建内存仓库
        const repository = new core_repository_1.MemoryCoreRepository();
        // 2. 创建应用服务
        const managementService = new core_management_service_1.CoreManagementService(repository);
        const monitoringService = new core_monitoring_service_1.CoreMonitoringService(repository);
        const orchestrationService = new core_orchestration_service_1.CoreOrchestrationService(repository);
        const resourceService = new core_resource_service_1.CoreResourceService(repository);
        // 3. 创建最小化的横切关注点管理器
        const managers = this.crossCuttingFactory.createManagers({
            security: { enabled: false },
            performance: { enabled: false },
            eventBus: { enabled: false },
            errorHandler: { enabled: true },
            coordination: { enabled: false },
            orchestration: { enabled: false },
            stateSync: { enabled: false },
            transaction: { enabled: false },
            protocolVersion: { enabled: true }
        });
        // 4. 创建协议实例
        const protocol = new core_protocol_1.CoreProtocol(managementService, monitoringService, orchestrationService, resourceService, repository, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion, config);
        return protocol;
    }
    /**
     * 验证协议配置
     */
    validateConfig(config) {
        const errors = [];
        const warnings = [];
        // 验证仓库类型
        if (config.repositoryType && !['memory', 'database', 'file'].includes(config.repositoryType)) {
            errors.push(`Invalid repository type: ${config.repositoryType}`);
        }
        // 验证自定义仓库
        if (config.customRepository && config.repositoryType) {
            warnings.push('Both customRepository and repositoryType provided. customRepository will be used.');
        }
        // 验证缓存配置
        if (config.enableCaching && !config.enableMetrics) {
            warnings.push('Caching enabled without metrics. Consider enabling metrics for better monitoring.');
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * 获取支持的仓库类型
     */
    getSupportedRepositoryTypes() {
        return ['memory', 'database', 'file'];
    }
    /**
     * 获取默认配置
     */
    getDefaultConfig() {
        return {
            enableLogging: true,
            enableCaching: false,
            enableMetrics: false,
            repositoryType: 'memory'
        };
    }
    // ===== 私有辅助方法 =====
    /**
     * 创建仓库实例
     */
    createRepository(type) {
        switch (type) {
            case 'memory':
                return new core_repository_1.MemoryCoreRepository();
            case 'database':
                // TODO: 实现数据库仓库
                throw new Error('Database repository not implemented yet');
            case 'file':
                // TODO: 实现文件仓库
                throw new Error('File repository not implemented yet');
            default:
                throw new Error(`Unsupported repository type: ${type}`);
        }
    }
    /**
     * 重置工厂实例（用于测试）
     */
    static resetInstance() {
        CoreProtocolFactory.instance = undefined;
    }
}
exports.CoreProtocolFactory = CoreProtocolFactory;
//# sourceMappingURL=core-protocol.factory.js.map