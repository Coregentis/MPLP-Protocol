"use strict";
/**
 * Confirm协议工厂
 *
 * @description 基于Context和Plan模块的企业级标准，创建和配置Confirm协议实例
 * @version 1.0.0
 * @layer 基础设施层 - 工厂
 * @pattern 单例模式，确保协议实例的唯一性和一致性
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmProtocolFactory = void 0;
const confirm_protocol_1 = require("../protocols/confirm.protocol");
const confirm_management_service_1 = require("../../application/services/confirm-management.service");
const confirm_repository_1 = require("../repositories/confirm.repository");
// ===== L3横切关注点管理器导入 =====
const cross_cutting_concerns_1 = require("../../../../core/protocols/cross-cutting-concerns");
/**
 * Confirm协议工厂类
 *
 * @description 基于Context和Plan模块的成功模式，实现统一的协议创建和配置管理
 * @pattern 单例模式，确保所有模块使用相同的协议实例
 */
class ConfirmProtocolFactory {
    constructor() {
        this.protocol = null;
    }
    /**
     * 获取工厂单例实例
     */
    static getInstance() {
        if (!ConfirmProtocolFactory.instance) {
            ConfirmProtocolFactory.instance = new ConfirmProtocolFactory();
        }
        return ConfirmProtocolFactory.instance;
    }
    /**
     * 创建Confirm协议实例
     *
     * @description 基于Context和Plan模块的企业级标准，集成9个L3横切关注点管理器
     */
    async createProtocol(config = {}) {
        if (this.protocol) {
            return this.protocol;
        }
        // 创建横切关注点管理器
        const crossCuttingFactory = cross_cutting_concerns_1.CrossCuttingConcernsFactory.getInstance();
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
        const repository = this.createRepository(config.repositoryType);
        // 创建服务实例
        const confirmService = new confirm_management_service_1.ConfirmManagementService(repository);
        // 创建协议实例（统一L3管理器注入模式）
        this.protocol = new confirm_protocol_1.ConfirmProtocol(confirmService, managers.security, managers.performance, managers.eventBus, managers.errorHandler, managers.coordination, managers.orchestration, managers.stateSync, managers.transaction, managers.protocolVersion);
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
    createRepository(repositoryType = 'memory') {
        switch (repositoryType) {
            case 'memory':
                return new confirm_repository_1.MemoryConfirmRepository();
            case 'database':
                // TODO: 实现数据库仓库
                throw new Error('Database repository not implemented yet');
            case 'file':
                // TODO: 实现文件仓库
                throw new Error('File repository not implemented yet');
            default:
                return new confirm_repository_1.MemoryConfirmRepository();
        }
    }
    /**
     * 协议健康检查
     */
    async healthCheck() {
        if (!this.protocol) {
            return {
                status: 'unhealthy',
                details: { error: 'Protocol not initialized' }
            };
        }
        const healthStatus = await this.protocol.healthCheck();
        return {
            status: healthStatus.status === 'degraded' ? 'unhealthy' : healthStatus.status,
            details: {
                timestamp: healthStatus.timestamp,
                checks: healthStatus.checks,
                metadata: healthStatus.metadata
            }
        };
    }
    /**
     * 获取协议元数据
     */
    getMetadata() {
        if (!this.protocol) {
            throw new Error('Protocol not initialized. Call createProtocol() first.');
        }
        return this.protocol.getMetadata();
    }
    /**
     * 协议配置验证
     */
    validateConfig(config) {
        const errors = [];
        // 验证仓库类型
        if (config.repositoryType && !['memory', 'database', 'file'].includes(config.repositoryType)) {
            errors.push('Invalid repository type. Must be one of: memory, database, file');
        }
        // 验证横切关注点配置
        if (config.crossCuttingConcerns) {
            // TODO: 添加更详细的横切关注点配置验证
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * 获取工厂统计信息
     */
    getStatistics() {
        return {
            protocolInitialized: this.protocol !== null,
            factoryVersion: '1.0.0',
            supportedRepositoryTypes: ['memory', 'database', 'file'],
            supportedCrossCuttingConcerns: [
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
}
exports.ConfirmProtocolFactory = ConfirmProtocolFactory;
//# sourceMappingURL=confirm-protocol.factory.js.map