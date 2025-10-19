"use strict";
/**
 * MPLP协议基础类
 *
 * @description 所有MPLP模块协议的基础类，提供统一的协议接口和横切关注点集成
 * @version 1.0.0
 * @architecture 统一DDD架构 + L3管理器注入模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLPPProtocolBase = void 0;
/**
 * MPLP协议基础类
 *
 * @description 提供统一的L3管理器注入和基础功能实现
 * @pattern 所有10个模块使用IDENTICAL的继承模式
 */
class MLPPProtocolBase {
    /**
     * 统一的L3管理器注入 (所有模块使用相同的注入模式)
     */
    constructor(securityManager, performanceMonitor, eventBusManager, errorHandler, coordinationManager, orchestrationManager, stateSyncManager, transactionManager, protocolVersionManager) {
        this.securityManager = securityManager;
        this.performanceMonitor = performanceMonitor;
        this.eventBusManager = eventBusManager;
        this.errorHandler = errorHandler;
        this.coordinationManager = coordinationManager;
        this.orchestrationManager = orchestrationManager;
        this.stateSyncManager = stateSyncManager;
        this.transactionManager = transactionManager;
        this.protocolVersionManager = protocolVersionManager;
    }
    /**
     * 默认健康检查实现
     */
    async healthCheck() {
        const timestamp = new Date().toISOString();
        const checks = [];
        try {
            // 检查所有L3管理器的健康状态
            const managerChecks = await Promise.all([
                this.checkManagerHealth('security', this.securityManager),
                this.checkManagerHealth('performance', this.performanceMonitor),
                this.checkManagerHealth('eventBus', this.eventBusManager),
                this.checkManagerHealth('errorHandler', this.errorHandler),
                this.checkManagerHealth('coordination', this.coordinationManager),
                this.checkManagerHealth('orchestration', this.orchestrationManager),
                this.checkManagerHealth('stateSync', this.stateSyncManager),
                this.checkManagerHealth('transaction', this.transactionManager),
                this.checkManagerHealth('protocolVersion', this.protocolVersionManager)
            ]);
            checks.push(...managerChecks);
            // 执行模块特定的健康检查
            const moduleChecks = await this.performModuleHealthChecks();
            checks.push(...moduleChecks);
            // 确定整体健康状态
            const hasFailures = checks.some(check => check.status === 'fail');
            const hasWarnings = checks.some(check => check.status === 'warn');
            const status = hasFailures ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy';
            return {
                status,
                timestamp,
                checks,
                metadata: {
                    protocolVersion: '1.0.0',
                    moduleName: this.getProtocolMetadata().name
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp,
                checks: [{
                        name: 'health_check_execution',
                        status: 'fail',
                        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                    }]
            };
        }
    }
    /**
     * 检查单个管理器的健康状态
     */
    async checkManagerHealth(name, manager) {
        const startTime = Date.now();
        try {
            const isHealthy = manager.healthCheck ? await manager.healthCheck() : true;
            const duration = Date.now() - startTime;
            return {
                name: `${name}_manager`,
                status: isHealthy ? 'pass' : 'fail',
                message: isHealthy ? `${name} manager is healthy` : `${name} manager is unhealthy`,
                duration
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            return {
                name: `${name}_manager`,
                status: 'fail',
                message: `${name} manager check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                duration
            };
        }
    }
    /**
     * 抽象方法：子类可以实现模块特定的健康检查
     */
    async performModuleHealthChecks() {
        return [];
    }
    /**
     * 创建标准响应
     */
    createResponse(request, status, result, error) {
        return {
            protocolVersion: request.protocolVersion,
            timestamp: new Date().toISOString(),
            requestId: request.requestId,
            status,
            result,
            error,
            metadata: {
                processingTime: Date.now(),
                moduleName: this.getProtocolMetadata().name
            }
        };
    }
    /**
     * 创建错误响应
     */
    createErrorResponse(request, code, message, details) {
        return this.createResponse(request, 'error', undefined, {
            code,
            message,
            details
        });
    }
}
exports.MLPPProtocolBase = MLPPProtocolBase;
//# sourceMappingURL=mplp-protocol-base.js.map