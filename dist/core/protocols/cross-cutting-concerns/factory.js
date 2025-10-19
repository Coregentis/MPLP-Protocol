"use strict";
/**
 * 横切关注点工厂
 *
 * @description 创建和配置所有L3管理器的工厂类
 * @version 1.0.0
 * @pattern 单例模式，确保所有模块使用相同的管理器实例
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossCuttingConcernsFactory = void 0;
const security_manager_1 = require("./security-manager");
const performance_monitor_1 = require("./performance-monitor");
const event_bus_manager_1 = require("./event-bus-manager");
const error_handler_1 = require("./error-handler");
const coordination_manager_1 = require("./coordination-manager");
const orchestration_manager_1 = require("./orchestration-manager");
const state_sync_manager_1 = require("./state-sync-manager");
const transaction_manager_1 = require("./transaction-manager");
const protocol_version_manager_1 = require("./protocol-version-manager");
/**
 * 横切关注点工厂类
 *
 * @description 单例工厂，确保所有模块使用相同的管理器实例
 */
class CrossCuttingConcernsFactory {
    constructor() {
        this.managers = null;
    }
    /**
     * 获取工厂单例实例
     */
    static getInstance() {
        if (!CrossCuttingConcernsFactory.instance) {
            CrossCuttingConcernsFactory.instance = new CrossCuttingConcernsFactory();
        }
        return CrossCuttingConcernsFactory.instance;
    }
    /**
     * 创建所有横切关注点管理器
     */
    createManagers(config = {}) {
        if (this.managers) {
            return this.managers;
        }
        this.managers = {
            security: new security_manager_1.MLPPSecurityManager(),
            performance: new performance_monitor_1.MLPPPerformanceMonitor(),
            eventBus: new event_bus_manager_1.MLPPEventBusManager(),
            errorHandler: new error_handler_1.MLPPErrorHandler(),
            coordination: new coordination_manager_1.MLPPCoordinationManager(),
            orchestration: new orchestration_manager_1.MLPPOrchestrationManager(),
            stateSync: new state_sync_manager_1.MLPPStateSyncManager(),
            transaction: new transaction_manager_1.MLPPTransactionManager(),
            protocolVersion: new protocol_version_manager_1.MLPPProtocolVersionManager()
        };
        // 应用配置
        this.applyConfiguration(config);
        return this.managers;
    }
    /**
     * 获取已创建的管理器
     */
    getManagers() {
        return this.managers;
    }
    /**
     * 重置工厂（主要用于测试）
     */
    reset() {
        this.managers = null;
    }
    /**
     * 应用配置到管理器
     */
    applyConfiguration(config) {
        if (!this.managers)
            return;
        try {
            // 应用安全管理器配置
            if (config.security && this.managers.security) {
                this.applySecurityConfig(config.security);
            }
            // 应用性能监控配置
            if (config.performance && this.managers.performance) {
                this.applyPerformanceConfig(config.performance);
            }
            // 应用事件总线配置
            if (config.eventBus && this.managers.eventBus) {
                this.applyEventBusConfig(config.eventBus);
            }
            // 应用错误处理配置
            if (config.errorHandler && this.managers.errorHandler) {
                this.applyErrorHandlerConfig(config.errorHandler);
            }
            // 应用协调管理器配置
            if (config.coordination && this.managers.coordination) {
                this.applyCoordinationConfig(config.coordination);
            }
            // 应用编排管理器配置
            if (config.orchestration && this.managers.orchestration) {
                this.applyOrchestrationConfig(config.orchestration);
            }
            // 应用状态同步配置
            if (config.stateSync && this.managers.stateSync) {
                this.applyStateSyncConfig(config.stateSync);
            }
            // 应用事务管理器配置
            if (config.transaction && this.managers.transaction) {
                this.applyTransactionConfig(config.transaction);
            }
            // 应用协议版本管理器配置
            if (config.protocolVersion && this.managers.protocolVersion) {
                this.applyProtocolVersionConfig(config.protocolVersion);
            }
        }
        catch (error) {
            console.error('Failed to apply cross-cutting concerns configuration:', error);
            throw new Error(`Configuration application failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // ===== 配置应用方法 =====
    /**
     * 应用安全管理器配置
     */
    applySecurityConfig(config) {
        // 安全管理器配置应用
        // 注意：当前MLPPSecurityManager没有configure方法，这里实现基础配置逻辑
        if (!config.enabled) {
            // 如果禁用，可以设置标志或记录日志
            console.log('Security manager disabled by configuration');
        }
        // TODO: 当MLPPSecurityManager添加configure方法时，在这里调用
        // this.managers!.security.configure(config);
    }
    /**
     * 应用性能监控配置
     */
    applyPerformanceConfig(config) {
        // 性能监控配置应用
        if (!config.enabled) {
            console.log('Performance monitor disabled by configuration');
            return;
        }
        // TODO: 当MLPPPerformanceMonitor添加configure方法时，在这里调用
        // this.managers!.performance.configure(config);
    }
    /**
     * 应用事件总线配置
     */
    applyEventBusConfig(config) {
        // 事件总线配置应用
        if (!config.enabled) {
            console.log('Event bus disabled by configuration');
            return;
        }
        // TODO: 当MLPPEventBusManager添加configure方法时，在这里调用
        // this.managers!.eventBus.configure(config);
    }
    /**
     * 应用错误处理配置
     */
    applyErrorHandlerConfig(config) {
        // 错误处理配置应用
        if (!config.enabled) {
            console.log('Error handler disabled by configuration');
            return;
        }
        // TODO: 当MLPPErrorHandler添加configure方法时，在这里调用
        // this.managers!.errorHandler.configure(config);
    }
    /**
     * 应用协调管理器配置
     */
    applyCoordinationConfig(config) {
        // 协调管理器配置应用
        if (!config.enabled) {
            console.log('Coordination manager disabled by configuration');
            return;
        }
        // TODO: 当MLPPCoordinationManager添加configure方法时，在这里调用
        // this.managers!.coordination.configure(config);
    }
    /**
     * 应用编排管理器配置
     */
    applyOrchestrationConfig(config) {
        // 编排管理器配置应用
        if (!config.enabled) {
            console.log('Orchestration manager disabled by configuration');
            return;
        }
        // TODO: 当MLPPOrchestrationManager添加configure方法时，在这里调用
        // this.managers!.orchestration.configure(config);
    }
    /**
     * 应用状态同步配置
     */
    applyStateSyncConfig(config) {
        // 状态同步配置应用
        if (!config.enabled) {
            console.log('State sync manager disabled by configuration');
            return;
        }
        // TODO: 当MLPPStateSyncManager添加configure方法时，在这里调用
        // this.managers!.stateSync.configure(config);
    }
    /**
     * 应用事务管理器配置
     */
    applyTransactionConfig(config) {
        // 事务管理器配置应用
        if (!config.enabled) {
            console.log('Transaction manager disabled by configuration');
            return;
        }
        // TODO: 当MLPPTransactionManager添加configure方法时，在这里调用
        // this.managers!.transaction.configure(config);
    }
    /**
     * 应用协议版本管理器配置
     */
    applyProtocolVersionConfig(config) {
        // 协议版本管理器配置应用
        if (!config.enabled) {
            console.log('Protocol version manager disabled by configuration');
            return;
        }
        // TODO: 当MLPPProtocolVersionManager添加configure方法时，在这里调用
        // this.managers!.protocolVersion.configure(config);
    }
    /**
     * 健康检查所有管理器
     */
    async healthCheckAll() {
        if (!this.managers) {
            throw new Error('Managers not initialized. Call createManagers() first.');
        }
        const results = {};
        try {
            results.security = await this.managers.security.healthCheck();
            results.performance = await this.managers.performance.healthCheck();
            results.eventBus = await this.managers.eventBus.healthCheck();
            results.errorHandler = await this.managers.errorHandler.healthCheck();
            results.coordination = await this.managers.coordination.healthCheck();
            results.orchestration = await this.managers.orchestration.healthCheck();
            results.stateSync = await this.managers.stateSync.healthCheck();
            results.transaction = await this.managers.transaction.healthCheck();
            results.protocolVersion = await this.managers.protocolVersion.healthCheck();
        }
        catch (error) {
            // TODO: 使用适当的错误处理机制
            void error; // 临时避免未使用变量警告
        }
        return results;
    }
}
exports.CrossCuttingConcernsFactory = CrossCuttingConcernsFactory;
//# sourceMappingURL=factory.js.map