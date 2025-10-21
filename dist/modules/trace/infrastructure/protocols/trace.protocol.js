"use strict";
/**
 * Trace协议实现
 *
 * @description Trace模块的MPLP协议实现，基于实际的管理器接口集成所有9个L3横切关注点管理器
 * @version 1.0.0
 * @layer 基础设施层 - 协议
 * @integration 统一L3管理器注入模式，与Context、Plan、Role、Confirm模块IDENTICAL架构
 * @reference Context模块成功实现模式
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceProtocol = void 0;
// Note: Mock L3 manager implementation removed as it is not currently used.
// This will be reimplemented when needed for testing.
/**
 * Trace协议类
 *
 * @description 实现MPLP协议标准，集成9个L3横切关注点管理器
 * @pattern 与其他8个模块使用IDENTICAL的直接实现IMLPPProtocol模式
 */
class TraceProtocol {
    constructor(traceManagementService, 
    // L3 Cross-Cutting Managers (预留接口)
    securityManager, performanceMonitor, eventBusManager, errorHandler, coordinationManager, orchestrationManager, stateSyncManager, transactionManager, protocolVersionManager) {
        this.traceManagementService = traceManagementService;
        this.securityManager = securityManager;
        this.performanceMonitor = performanceMonitor;
        this.eventBusManager = eventBusManager;
        this.errorHandler = errorHandler;
        this.coordinationManager = coordinationManager;
        this.orchestrationManager = orchestrationManager;
        this.stateSyncManager = stateSyncManager;
        this.transactionManager = transactionManager;
        this.protocolVersionManager = protocolVersionManager;
        // 统一的L3管理器注入模式 (与其他8个模块IDENTICAL)
    }
    // ===== 核心追踪操作 =====
    /**
     * 创建追踪记录
     *
     * @description 使用标准6步调用序列：性能监控→事务→业务逻辑→提交→事件→监控结束
     */
    async createTrace(request) {
        // Step 1: 开始性能监控
        const performanceId = await this.performanceMonitor.startOperation('trace_create');
        try {
            // Step 2: 开始事务
            const transactionId = await this.transactionManager.beginTransaction();
            try {
                // Step 3: 执行业务逻辑
                const trace = await this.traceManagementService.createTrace(request);
                // Step 4: 提交事务
                await this.transactionManager.commitTransaction(transactionId);
                // Step 5: 发布事件
                await this.eventBusManager.publishEvent('trace_created', {
                    traceId: trace.traceId,
                    contextId: trace.contextId,
                    traceType: trace.traceType,
                    severity: trace.severity,
                    timestamp: new Date().toISOString()
                });
                // Step 6: 结束性能监控
                await this.performanceMonitor.endOperation(performanceId);
                return {
                    success: true,
                    traceId: trace.traceId,
                    message: 'Trace created successfully',
                    metadata: {
                        processingTime: await this.performanceMonitor.getOperationDuration(performanceId),
                        correlationsFound: 0,
                        metricsCollected: 1
                    }
                };
            }
            catch (businessError) {
                // 回滚事务
                await this.transactionManager.rollbackTransaction(transactionId);
                throw businessError;
            }
        }
        catch (error) {
            // 统一错误处理
            const handledError = await this.errorHandler.handleError(error, {
                operation: 'createTrace',
                context: { request }
            });
            // 结束性能监控（失败）
            await this.performanceMonitor.endOperation(performanceId, false);
            // 发布错误事件
            await this.eventBusManager.publishEvent('trace_creation_failed', {
                error: handledError.message,
                request,
                timestamp: new Date().toISOString()
            });
            return {
                success: false,
                message: handledError.message,
                error: {
                    code: handledError.code,
                    message: handledError.message,
                    details: handledError.details
                }
            };
        }
    }
    /**
     * 更新追踪记录
     */
    async updateTrace(request) {
        const performanceId = await this.performanceMonitor.startOperation('trace_update');
        try {
            const transactionId = await this.transactionManager.beginTransaction();
            try {
                await this.traceManagementService.updateTrace(request);
                await this.transactionManager.commitTransaction(transactionId);
                await this.eventBusManager.publishEvent('trace_updated', {
                    traceId: request.traceId,
                    timestamp: new Date().toISOString()
                });
                await this.performanceMonitor.endOperation(performanceId);
                return {
                    success: true,
                    traceId: request.traceId,
                    message: 'Trace updated successfully',
                    metadata: {
                        processingTime: await this.performanceMonitor.getOperationDuration(performanceId),
                        correlationsFound: 0,
                        metricsCollected: 1
                    }
                };
            }
            catch (businessError) {
                await this.transactionManager.rollbackTransaction(transactionId);
                throw businessError;
            }
        }
        catch (error) {
            const handledError = await this.errorHandler.handleError(error, {
                operation: 'updateTrace',
                context: { request }
            });
            await this.performanceMonitor.endOperation(performanceId, false);
            await this.eventBusManager.publishEvent('trace_update_failed', {
                error: handledError.message,
                traceId: request.traceId,
                timestamp: new Date().toISOString()
            });
            return {
                success: false,
                message: handledError.message,
                error: {
                    code: handledError.code,
                    message: handledError.message,
                    details: handledError.details
                }
            };
        }
    }
    /**
     * 获取追踪记录
     */
    async getTrace(traceId) {
        const performanceId = await this.performanceMonitor.startOperation('trace_get');
        try {
            const trace = await this.traceManagementService.getTrace(traceId);
            await this.performanceMonitor.endOperation(performanceId);
            if (trace) {
                await this.eventBusManager.publishEvent('trace_accessed', {
                    traceId,
                    timestamp: new Date().toISOString()
                });
            }
            return trace ? trace.toData() : null;
        }
        catch (error) {
            const handledError = await this.errorHandler.handleError(error, {
                operation: 'getTrace',
                context: { traceId }
            });
            await this.performanceMonitor.endOperation(performanceId, false);
            throw handledError;
        }
    }
    /**
     * 查询追踪记录
     */
    async queryTraces(filter, pagination) {
        const performanceId = await this.performanceMonitor.startOperation('trace_query');
        try {
            const result = await this.traceManagementService.queryTraces(filter, pagination);
            await this.performanceMonitor.endOperation(performanceId);
            // 确保result是正确的类型
            const queryResult = result;
            await this.eventBusManager.publishEvent('traces_queried', {
                filter,
                resultCount: queryResult.total,
                timestamp: new Date().toISOString()
            });
            return queryResult;
        }
        catch (error) {
            const handledError = await this.errorHandler.handleError(error, {
                operation: 'queryTraces',
                context: { filter, pagination }
            });
            await this.performanceMonitor.endOperation(performanceId, false);
            throw handledError;
        }
    }
    /**
     * 分析追踪数据
     */
    async analyzeTrace(traceId) {
        const performanceId = await this.performanceMonitor.startOperation('trace_analyze');
        try {
            const analysis = await this.traceManagementService.analyzeTrace(traceId);
            await this.performanceMonitor.endOperation(performanceId);
            await this.eventBusManager.publishEvent('trace_analyzed', {
                traceId,
                analysisType: analysis.analysisType,
                confidence: analysis.confidence,
                timestamp: new Date().toISOString()
            });
            return analysis;
        }
        catch (error) {
            const handledError = await this.errorHandler.handleError(error, {
                operation: 'analyzeTrace',
                context: { traceId }
            });
            await this.performanceMonitor.endOperation(performanceId, false);
            throw handledError;
        }
    }
    /**
     * 验证追踪数据
     */
    async validateTrace(traceData) {
        const performanceId = await this.performanceMonitor.startOperation('trace_validate');
        try {
            const validation = await this.traceManagementService.validateTrace(traceData);
            await this.performanceMonitor.endOperation(performanceId);
            return validation;
        }
        catch (error) {
            const handledError = await this.errorHandler.handleError(error, {
                operation: 'validateTrace',
                context: { traceData }
            });
            await this.performanceMonitor.endOperation(performanceId, false);
            throw handledError;
        }
    }
    // ===== MPLP协议接口实现 =====
    /**
     * 获取协议元数据
     */
    getMetadata() {
        return {
            name: 'trace',
            version: '1.0.0',
            description: 'MPLP Trace Protocol - 追踪记录和监控分析',
            capabilities: [
                'trace_creation',
                'trace_update',
                'trace_query',
                'trace_analysis',
                'trace_validation',
                'performance_monitoring',
                'error_tracking',
                'correlation_analysis',
                'distributed_tracing'
            ],
            supportedOperations: [
                'createTrace',
                'updateTrace',
                'getTrace',
                'queryTraces',
                'analyzeTrace',
                'validateTrace',
                'getHealthStatus',
                'getCrossCuttingManagers'
            ],
            crossCuttingConcerns: {
                security: true,
                performance: true,
                events: true,
                errors: true,
                coordination: true,
                orchestration: true,
                stateSync: true,
                transactions: true,
                versioning: true
            }
        };
    }
    /**
     * 获取协议健康状态
     */
    async getHealthStatus() {
        try {
            // 检查所有L3管理器的健康状态
            const managerStatuses = await Promise.all([
                this.securityManager.getHealthStatus(),
                this.performanceMonitor.getHealthStatus(),
                this.eventBusManager.getHealthStatus(),
                this.errorHandler.getHealthStatus(),
                this.coordinationManager.getHealthStatus(),
                this.orchestrationManager.getHealthStatus(),
                this.stateSyncManager.getHealthStatus(),
                this.transactionManager.getHealthStatus(),
                this.protocolVersionManager.getHealthStatus()
            ]);
            // 检查业务服务健康状态
            const serviceHealth = await this.traceManagementService.getHealthStatus();
            const allHealthy = managerStatuses.every(status => status.status === 'healthy') &&
                serviceHealth.status === 'healthy';
            return {
                status: allHealthy ? 'healthy' : 'degraded',
                timestamp: new Date().toISOString(),
                details: {
                    service: serviceHealth,
                    managers: {
                        security: managerStatuses[0],
                        performance: managerStatuses[1],
                        eventBus: managerStatuses[2],
                        errorHandler: managerStatuses[3],
                        coordination: managerStatuses[4],
                        orchestration: managerStatuses[5],
                        stateSync: managerStatuses[6],
                        transaction: managerStatuses[7],
                        protocolVersion: managerStatuses[8]
                    }
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
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
    // ===== MPLP模块预留接口 (8个模块) =====
    /**
     * Context模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    async integrateWithContext(_contextId, _operation) {
        // TODO: 等待CoreOrchestrator激活Context模块集成
        await this.coordinationManager.registerIntegration('context', 'trace');
    }
    /**
     * Plan模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    async integrateWithPlan(_planId, _operation) {
        // TODO: 等待CoreOrchestrator激活Plan模块集成
        await this.coordinationManager.registerIntegration('plan', 'trace');
    }
    /**
     * Confirm模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    async integrateWithConfirm(_confirmId, _operation) {
        // TODO: 等待CoreOrchestrator激活Confirm模块集成
        await this.coordinationManager.registerIntegration('confirm', 'trace');
    }
    /**
     * Role模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    async integrateWithRole(_roleId, _operation) {
        // TODO: 等待CoreOrchestrator激活Role模块集成
        await this.coordinationManager.registerIntegration('role', 'trace');
    }
    /**
     * Extension模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    async integrateWithExtension(_extensionId, _operation) {
        // TODO: 等待CoreOrchestrator激活Extension模块集成
        await this.coordinationManager.registerIntegration('extension', 'trace');
    }
    /**
     * Core模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    async integrateWithCore(_coreId, _operation) {
        // TODO: 等待CoreOrchestrator激活Core模块集成
        await this.coordinationManager.registerIntegration('core', 'trace');
    }
    /**
     * Collab模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    async integrateWithCollab(_collabId, _operation) {
        // TODO: 等待CoreOrchestrator激活Collab模块集成
        await this.coordinationManager.registerIntegration('collab', 'trace');
    }
    /**
     * Dialog模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    async integrateWithDialog(_dialogId, _operation) {
        // TODO: 等待CoreOrchestrator激活Dialog模块集成
        await this.coordinationManager.registerIntegration('dialog', 'trace');
    }
    /**
     * Network模块集成接口 (预留)
     * @description 等待CoreOrchestrator激活
     */
    async integrateWithNetwork(_networkId, _operation) {
        // TODO: 等待CoreOrchestrator激活Network模块集成
        await this.coordinationManager.registerIntegration('network', 'trace');
    }
}
exports.TraceProtocol = TraceProtocol;
//# sourceMappingURL=trace.protocol.js.map